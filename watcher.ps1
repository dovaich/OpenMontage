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

function RunClaude([string[]]$batches) {
    $list = $batches -join ", "
    $prompt = @"
You were started by watcher.ps1 (the local recorder watcher) in a fresh, non-interactive session.
Batches whose queue/<batch>.status on $Remote/$Branch says "record": $list

For each batch, do the Local-session flow in docs/briefs/AUTOPILOT.md (and docs/briefs/LOCAL_RECORDER.md):
follow docs/briefs/<batch>/recording_message.md exactly (its first line says whether it is voices, images, video or animations),
save the files to incoming/<batch>/ with manifest.txt, set queue/<batch>.status to "recorded",
commit as "Claude <noreply@anthropic.com>" and push to $Remote $Branch (pull --rebase and retry if the push is rejected).

Rules for this run:
- Do NOT start a watcher, loop, Monitor, cron, scheduled task or wakeup, and do NOT message yourself. watcher.ps1 handles waiting.
- Do NOT ask questions; nobody is watching. If something blocks a batch, leave its status as "record", and say why in your final message.
- Finish with a short summary of what you recorded and pushed.
"@
    $runLog = Join-Path $StateDir ("claude_{0}.log" -f (Get-Date -Format "yyyyMMdd_HHmmss"))
    $cliArgs = @("-p", "--permission-mode", "default")
    if (-not $NoChrome) { $cliArgs += "--chrome" }
    if ($Settings) { $cliArgs += @("--settings", $Settings) }
    Log "Starting claude -p for: $list  (log: $runLog)"
    $prompt | & $ClaudeExe @cliArgs 2>&1 | ForEach-Object { "$_" } | Tee-Object -FilePath $runLog
    Log "claude exited with code $LASTEXITCODE"
}

function CheckOnce {
    git fetch -q $Remote $Branch 2>&1 | Out-Null
    if ($LASTEXITCODE -ne 0) { Log "git fetch failed (offline?). Will retry."; return }
    $remoteSha = RemoteSha
    $lastSha = if (Test-Path $ShaFile) { (Get-Content $ShaFile -Raw).Trim() } else { "" }
    # On startup, also run if a batch is still "record" (retry after a failed run)
    $retry = $script:FirstCheck -and (@(BatchesToRecord).Count -gt 0)
    $script:FirstCheck = $false
    if (($remoteSha -eq $lastSha) -and -not $retry) { return }

    Log "New remote commit: $remoteSha"
    $cur = (git rev-parse --abbrev-ref HEAD).Trim()
    if ($cur -ne $Branch) { git checkout -q $Branch 2>&1 | ForEach-Object { Log "$_" } }
    git pull -q --rebase $Remote $Branch 2>&1 | ForEach-Object { Log "$_" }
    if ($LASTEXITCODE -ne 0) {
        Log "git pull failed (local changes?). Fix the working tree; watcher will retry."
        git rebase --abort 2>$null | Out-Null
        return
    }

    $batches = @(BatchesToRecord)
    if ($batches.Count -gt 0) {
        RunClaude $batches
        git fetch -q $Remote $Branch 2>&1 | Out-Null
        $left = @(BatchesToRecord)
        if ($left.Count -gt 0) { Log "WARNING: still 'record' after Claude ran: $($left -join ', '). Check the claude log; restart the watcher to retry." }
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
