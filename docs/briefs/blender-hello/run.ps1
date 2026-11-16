# Renders docs/briefs/blender-hello/scene.py with the laptop's Blender into incoming/blender-hello/,
# then sets the queue status, commits and pushes by itself (no extra permissions needed).
# Usage (from the repo root):  powershell -ExecutionPolicy Bypass -File docs/briefs/blender-hello/run.ps1
$ErrorActionPreference = "Continue"
$Branch = "ccr-3b18907e-5bki3m"
$Repo = (Resolve-Path "$PSScriptRoot\..\..\..").Path
Set-Location $Repo
$Out = Join-Path $Repo "incoming\blender-hello"
New-Item -ItemType Directory -Force $Out | Out-Null
$Search = Join-Path $Out "search.log"
Set-Content $Search "Blender search $(Get-Date)" -Encoding UTF8
function Note($m) { Write-Host $m; Add-Content $Search $m -Encoding UTF8 }
function Ok($p) { $p -and ($p -like "*.exe") -and (Test-Path $p) }

function Find-Blender {
    $c = (Get-Command blender -ErrorAction SilentlyContinue).Source; if (Ok $c) { Note "PATH: $c"; return $c }
    # Registry: App Paths, file association, uninstall entries
    foreach ($k in "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\App Paths\blender.exe",
                   "HKCU:\SOFTWARE\Microsoft\Windows\CurrentVersion\App Paths\blender.exe") {
        $v = (Get-ItemProperty $k -ErrorAction SilentlyContinue).'(default)'; if (Ok $v) { Note "AppPaths: $v"; return $v } }
    foreach ($k in "Registry::HKEY_CLASSES_ROOT\blendfile\shell\open\command", "Registry::HKEY_CLASSES_ROOT\Applications\blender.exe\shell\open\command",
                   "HKCU:\SOFTWARE\Classes\blendfile\shell\open\command") {
        $v = (Get-ItemProperty $k -ErrorAction SilentlyContinue).'(default)'
        if ($v -match '"?([^"]*blender\.exe)') { if (Ok $matches[1]) { Note "Assoc: $($matches[1])"; return $matches[1] } } }
    foreach ($k in "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\*", "HKLM:\SOFTWARE\WOW6432Node\Microsoft\Windows\CurrentVersion\Uninstall\*",
                   "HKCU:\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\*") {
        foreach ($e in (Get-ItemProperty $k -ErrorAction SilentlyContinue | Where-Object { $_.DisplayName -like "*Blender*" })) {
            foreach ($d in @($e.InstallLocation, (Split-Path ($e.DisplayIcon -replace '"|,.*$','') -ErrorAction SilentlyContinue))) {
                if ($d) { $p = Join-Path $d "blender.exe"; if (Ok $p) { Note "Uninstall: $p"; return $p } } } } }
    # Microsoft Store
    foreach ($a in (Get-AppxPackage -Name "*Blender*" -ErrorAction SilentlyContinue)) {
        $p = Get-ChildItem $a.InstallLocation -Recurse -Filter blender.exe -ErrorAction SilentlyContinue | Select-Object -First 1 -ExpandProperty FullName
        if (Ok $p) { Note "Store: $p"; return $p } }
    # Start menu / desktop shortcuts
    $sh = New-Object -ComObject WScript.Shell
    foreach ($d in "$env:ProgramData\Microsoft\Windows\Start Menu", "$env:APPDATA\Microsoft\Windows\Start Menu", "$env:USERPROFILE\Desktop", "$env:PUBLIC\Desktop", "$env:USERPROFILE\OneDrive\Desktop") {
        foreach ($l in (Get-ChildItem $d -Recurse -Filter "*Blender*.lnk" -ErrorAction SilentlyContinue)) {
            $t = $sh.CreateShortcut($l.FullName).TargetPath; if (Ok $t) { Note "Shortcut: $t"; return $t } } }
    # Every drive: usual folders, then a shallow scan
    $drives = (Get-PSDrive -PSProvider FileSystem | Where-Object { $_.Root -match '^[A-Z]:\\$' }).Root
    foreach ($r in $drives) {
        foreach ($sub in "Program Files\Blender Foundation", "Program Files (x86)\Blender Foundation", "Program Files\Steam\steamapps\common\Blender",
                         "Program Files (x86)\Steam\steamapps\common\Blender", "SteamLibrary\steamapps\common\Blender", "Blender", "Blender Foundation", "Programs") {
            $p = Get-ChildItem (Join-Path $r $sub) -Recurse -Depth 3 -Filter blender.exe -ErrorAction SilentlyContinue | Sort-Object LastWriteTime -Descending | Select-Object -First 1 -ExpandProperty FullName
            if (Ok $p) { Note "Drive: $p"; return $p } } }
    foreach ($d in "$env:LOCALAPPDATA\Programs", "$env:USERPROFILE\Downloads", "$env:USERPROFILE\Desktop", "$env:USERPROFILE\Documents", "$env:USERPROFILE\OneDrive", "$env:USERPROFILE\scoop\apps") {
        $p = Get-ChildItem $d -Recurse -Depth 4 -Filter blender.exe -ErrorAction SilentlyContinue | Select-Object -First 1 -ExpandProperty FullName
        if (Ok $p) { Note "User folder: $p"; return $p } }
    foreach ($r in $drives) {
        $p = Get-ChildItem $r -Recurse -Depth 4 -Filter blender.exe -ErrorAction SilentlyContinue | Select-Object -First 1 -ExpandProperty FullName
        if (Ok $p) { Note "Scan: $p"; return $p } }
    return $null
}

$status = "record"
$exe = Find-Blender
if (-not $exe) {
    Note "BLOCKED: blender.exe not found. Drives: $((Get-PSDrive -PSProvider FileSystem).Root -join ' ')"
    Note "Store packages: $((Get-AppxPackage -Name '*Blender*' -ErrorAction SilentlyContinue).Name -join ', ')"
} else {
    Note "Blender: $exe"
    $scene = Join-Path $PSScriptRoot "scene.py"
    $final = Join-Path $Out "hello_cube.mp4"
    foreach ($engine in @("EEVEE", "CYCLES")) {
        Get-ChildItem $Out -Filter "hello_cube_*.mp4" -ErrorAction SilentlyContinue | Remove-Item -Force
        $log = Join-Path $Out "blender_$engine.log"
        $t = Measure-Command { & $exe -b --factory-startup -P $scene -- $Out $engine *>&1 | ForEach-Object { "$_" } | Set-Content $log -Encoding UTF8 }
        $mp4 = Get-ChildItem $Out -Filter "hello_cube_*.mp4" -ErrorAction SilentlyContinue | Select-Object -First 1
        if ($mp4) {
            Move-Item -Force $mp4.FullName $final
            $ver = (Select-String -Path $log -Pattern "RENDER_DONE" | Select-Object -Last 1).Line
            Set-Content (Join-Path $Out "manifest.txt") "hello_cube.mp4 2.0 spinning cube 640x360, engine $engine, render $([int]$t.TotalSeconds) s | $ver | $exe" -Encoding UTF8
            Note "OK: rendered with $engine in $([int]$t.TotalSeconds) s"
            $status = "recorded"; break
        }
        Note "Engine $engine gave no video (see blender_$engine.log)."
    }
    if ($status -ne "recorded") { Note "BLOCKED: Blender ran but produced no video" }
}

# Commit and push by itself (the laptop has no git identity, so pass it inline)
Set-Content (Join-Path $Repo "queue\blender-hello.status") $status -Encoding ASCII -NoNewline
git add incoming/blender-hello queue/blender-hello.status
git -c user.name=Claude -c user.email=noreply@anthropic.com commit -q -m "incoming: blender-hello render ($status)"
for ($i = 0; $i -lt 4; $i++) {
    git push -q origin $Branch
    if ($LASTEXITCODE -eq 0) { Note "PUSHED ($status)"; break }
    git -c user.name=Claude -c user.email=noreply@anthropic.com pull -q --rebase origin $Branch
    Start-Sleep -Seconds 3
}
if ($status -eq "recorded") { exit 0 } else { exit 3 }
