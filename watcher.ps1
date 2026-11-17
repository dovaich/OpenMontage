# watcher.ps1 - local recorder watcher for OpenMontage (no Claude while waiting)
#
# Every $IntervalSeconds (default 20): git fetch (no Claude). When the remote branch has a new
# commit: git pull, and if any queue/*.status says "record", start ONE fresh
# `claude -p` session that records those batches per docs/briefs/AUTOPILOT.md.
# Afterwards it stores the remote commit, so Claude's own push does not trigger it again.
#
# Usage:  powershell -ExecutionPolicy Bypass -File watcher.ps1 [-Once] [-IntervalSeconds 120]
# State and logs live in .git\watcher\ (never committed).

param(
    [string]$Branch = "ccr-3b18907e-5bki3m",
    [string]$Remote = "origin",
    [int]$IntervalSeconds = 20,
    [string]$ClaudeExe = "",
    [switch]$NoChrome,     # for tests that don't need the browser
    [string]$Settings = "",  # extra settings file (tests in untrusted folders)
    [switch]$Once          # one check, then exit (for testing)
)

$ErrorActionPreference = "Continue"
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

$Repo = $PSScriptRoot
Set-Location $Repo
$StateDir = Join-Path $Repo ".git\watcher"
New-Item -ItemType Directory -Force $StateDir | Out-Null
$ShaFile = Join-Path $StateDir "last_remote_sha"
$LogFile = Join-Path $StateDir "watcher.log"

function Log([string]$msg) {
    $line = "[{0}] {1}" -f (Get-Date -Format "yyyy-MM-dd HH:mm:ss"), $msg
    Write-Host $line
    Add-Content -Path $LogFile -Value $line -Encoding UTF8
}

# Find the claude CLI
if (-not $ClaudeExe) {
    $cmd = Get-Command claude -ErrorAction SilentlyContinue
    if ($cmd) { $ClaudeExe = $cmd.Source }
    elseif (Test-Path "$env:USERPROFILE\.local\bin\claude.exe") { $ClaudeExe = "$env:USERPROFILE\.local\bin\claude.exe" }
    else { Log "ERROR: claude CLI not found. Pass -ClaudeExe <path>."; exit 1 }
}

# Single instance only
$mutexName = "Global\OpenMontageWatcher_" + (($Repo.ToLower() -replace '[^a-z0-9]', '_'))
$mutex = [System.Threading.Mutex]::new($false, $mutexName)
if (-not $mutex.WaitOne(0)) { Log "Another watcher is already running for this repo. Exiting."; exit 0 }

function RemoteSha { (git rev-parse "$Remote/$Branch" 2>$null | Select-Object -First 1) }

function BatchesToRecord {
    $names = git ls-tree --name-only "$Remote/$Branch" queue/ 2>$null | Where-Object { $_ -like "*.status" }
    foreach ($f in $names) {
        $val = (git show "$Remote/${Branch}:$f" 2>$null | Out-String).Trim()
        if ($val -eq "record") { [IO.Path]::GetFileNameWithoutExtension($f) }
    }
}

# Safety net: a recorder session sometimes pushes incoming/<task>/manifest.txt but forgets to set the status.
# A task still "record" whose manifest was committed AFTER the status was set to "record" (and has no BLOCKED.txt)
# is delivered: the watcher sets its status to "recorded" itself, so it is not recorded twice.
function DeliveredButNotMarked {
    foreach ($b in @(BatchesToRecord)) {
        $ref = "$Remote/$Branch"
        git cat-file -e "${ref}:incoming/$b/manifest.txt" 2>$null
        if ($LASTEXITCODE -ne 0) { continue }
        git cat-file -e "${ref}:incoming/$b/BLOCKED.txt" 2>$null
        if ($LASTEXITCODE -eq 0) { continue }
        $statusCommit = (git log -1 --format=%H $ref -- "queue/$b.status" 2>$null | Select-Object -First 1)
        if (-not $statusCommit) { continue }
        $after = @(git log --format=%H "$statusCommit..$ref" -- "incoming/$b/manifest.txt" 2>$null)
        if ($after.Count -gt 0) { $b }
    }
}

function FixForgottenStatus {
    $fix = @(DeliveredButNotMarked)
    if ($fix.Count -eq 0) { return }
    Log "Delivered but status still 'record' (recorder forgot): $($fix -join ', '). Setting 'recorded'."
    git pull -q --rebase --autostash $Remote $Branch 2>&1 | ForEach-Object { Log "$_" }
    foreach ($b in $fix) {
        [IO.File]::WriteAllText((Join-Path $Repo "queue\$b.status"), "recorded`n")
        git add "queue/$b.status" | Out-Null
    }
    git commit -q -m "$($fix -join ', '): status recorded (set by watcher.ps1; files were already pushed)" 2>&1 | ForEach-Object { Log "$_" }
    for ($i = 0; $i -lt 3; $i++) {
        git push -q $Remote $Branch 2>&1 | ForEach-Object { Log "$_" }
        if ($LASTEXITCODE -eq 0) { Log "Pushed status fix."; break }
        git pull -q --rebase --autostash $Remote $Branch 2>&1 | ForEach-Object { Log "$_" }
    }
    git fetch -q $Remote $Branch 2>&1 | Out-Null
}

function RunClaude([string[]]$batches) {
    $list = $batches -join ", "
    $prompt = @"
You were started by watcher.ps1 (the laptop task watcher) in a fresh, non-interactive session on the user's laptop.
Tasks whose queue/<task>.status on $Remote/$Branch says "record": $list

For each task, open docs/briefs/<task>/recording_message.md and do exactly what it says. It can be ANY job on this laptop:
- browser work with Claude in Chrome (Google AI Studio voices, Gemini images, Google Flow video, mixamo.com, any other site),
- Blender (G:\blender\blender.exe, Blender 3.6), PowerShell or other scripts, files, installs the brief asks for, anything else.
For voice/image/video/animation batches, also follow the Local-session flow in docs/briefs/AUTOPILOT.md.
Unless the brief says its own script does it: save the results to incoming/<task>/ (with manifest.txt), set queue/<task>.status
to "recorded", commit, and push to $Remote $Branch (git pull --rebase and retry if the push is rejected).
Git identity is already set in this repo (Claude <noreply@anthropic.com>), so a plain git commit works.

Rules for this run:
- Do NOT start a watcher, loop, Monitor, cron, scheduled task or wakeup, and do NOT message yourself. watcher.ps1 handles waiting.
- Do NOT ask questions; nobody is watching. Work around problems yourself. If something truly blocks a task, leave its status
  as "record", write the reason to incoming/<task>/BLOCKED.txt, commit and push that, and say why in your final message.
- Finish with a short summary of what you did and pushed.
"@
    $runLog = Join-Path $StateDir ("claude_{0}.log" -f (Get-Date -Format "yyyyMMdd_HHmmss"))
    $cliArgs = @("-p", "--permission-mode", "acceptEdits")
    if (-not $NoChrome) { $cliArgs += "--chrome" }
    if ($Settings) { $cliArgs += @("--settings", $Settings) }
    Log "Starting claude -p for: $list  (log: $runLog)"
    $prompt | & $ClaudeExe @cliArgs 2>&1 | ForEach-Object { $l = "$_"; Write-Host $l; Add-Content -Path $runLog -Value $l -Encoding UTF8 }
    Log "claude exited with code $LASTEXITCODE"
}

# Failed tasks are retried automatically: up to $MaxAttempts runs per task, $RetryMinutes apart
$MaxAttempts = 3
$RetryMinutes = 10
$script:Attempts = @{}
$script:RetryAt = $null

function CheckOnce {
    git fetch -q $Remote $Branch 2>&1 | Out-Null
    if ($LASTEXITCODE -ne 0) { Log "git fetch failed (offline?). Will retry."; return }
    $remoteSha = RemoteSha
    $lastSha = if (Test-Path $ShaFile) { (Get-Content $ShaFile -Raw).Trim() } else { "" }
    # On startup, also run if a batch is still "record" (retry after a failed run)
    $retry = $script:FirstCheck -and (@(BatchesToRecord).Count -gt 0)
    $script:FirstCheck = $false
    if ($script:RetryAt -and (Get-Date) -ge $script:RetryAt) { $retry = $true; $script:RetryAt = $null }
    if (($remoteSha -eq $lastSha) -and -not $retry) { return }

    if ($remoteSha -ne $lastSha) { Log "New remote commit: $remoteSha" } else { Log "Retrying unfinished tasks" }
    $cur = (git rev-parse --abbrev-ref HEAD).Trim()
    if ($cur -ne $Branch) { git checkout -q $Branch 2>&1 | ForEach-Object { Log "$_" } }
    # --autostash: leftovers from an earlier run don't block the pull (they are kept, not lost)
    git pull -q --rebase --autostash $Remote $Branch 2>&1 | ForEach-Object { Log "$_" }
    if ($LASTEXITCODE -ne 0) {
        Log "git pull failed. Will retry on the next check."
        git rebase --abort 2>$null | Out-Null
        return
    }

    FixForgottenStatus
    $batches = @(BatchesToRecord | Where-Object { [int]$script:Attempts[$_] -lt $MaxAttempts })
    if ($batches.Count -gt 0) {
        foreach ($b in $batches) { $script:Attempts[$b] = [int]$script:Attempts[$b] + 1 }
        RunClaude $batches
        git fetch -q $Remote $Branch 2>&1 | Out-Null
        FixForgottenStatus
        $left = @(BatchesToRecord | Where-Object { [int]$script:Attempts[$_] -lt $MaxAttempts })
        if ($left.Count -gt 0) {
            $script:RetryAt = (Get-Date).AddMinutes($RetryMinutes)
            Log "WARNING: still 'record' after Claude ran: $($left -join ', '). Retrying at $($script:RetryAt.ToString('HH:mm'))."
        }
        $gaveUp = @(BatchesToRecord | Where-Object { [int]$script:Attempts[$_] -ge $MaxAttempts })
        if ($gaveUp.Count -gt 0) { Log "GAVE UP after $MaxAttempts tries: $($gaveUp -join ', '). Restart the watcher to try again." }
    } else {
        Log "No batch waiting (no status 'record'). Claude not started."
    }
    # Store the remote commit AFTER Claude, so its own push doesn't trigger a new run
    Set-Content -Path $ShaFile -Value (RemoteSha) -Encoding ASCII
}

$script:FirstCheck = $true
Log "Watcher started: $Repo  branch $Branch, every $IntervalSeconds s. Claude: $ClaudeExe"
try {
    do {
        CheckOnce
        if ($Once) { break }
        Start-Sleep -Seconds $IntervalSeconds
    } while ($true)
} finally {
    $mutex.ReleaseMutex() | Out-Null
}
