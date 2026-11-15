# Renders docs/briefs/blender-hello/scene.py with the laptop's Blender into incoming/blender-hello/.
# Usage (from the repo root):  powershell -ExecutionPolicy Bypass -File docs/briefs/blender-hello/run.ps1
$ErrorActionPreference = "Continue"
$Repo = (Resolve-Path "$PSScriptRoot\..\..\..").Path
$Out = Join-Path $Repo "incoming\blender-hello"
New-Item -ItemType Directory -Force $Out | Out-Null

$exe = (Get-Command blender -ErrorAction SilentlyContinue).Source
if (-not $exe) {
    $roots = @("$env:ProgramFiles\Blender Foundation", "${env:ProgramFiles(x86)}\Blender Foundation",
               "$env:ProgramFiles\Steam\steamapps\common\Blender", "${env:ProgramFiles(x86)}\Steam\steamapps\common\Blender",
               "$env:LOCALAPPDATA\Programs\Blender Foundation", "$env:ProgramFiles\WindowsApps")
    $exe = Get-ChildItem $roots -Recurse -Filter blender.exe -ErrorAction SilentlyContinue |
           Sort-Object LastWriteTime -Descending | Select-Object -First 1 -ExpandProperty FullName
}
if (-not $exe) { Write-Host "BLOCKED: blender.exe not found"; exit 2 }
Write-Host "Blender: $exe"

$scene = Join-Path $PSScriptRoot "scene.py"
$final = Join-Path $Out "hello_cube.mp4"
foreach ($engine in @("EEVEE", "CYCLES")) {
    Get-ChildItem $Out -Filter "hello_cube_*.mp4" -ErrorAction SilentlyContinue | Remove-Item -Force
    $t = Measure-Command { & $exe -b --factory-startup -P $scene -- $Out $engine 2>&1 | Tee-Object -FilePath (Join-Path $Out "blender_$engine.log") | Out-Host }
    $mp4 = Get-ChildItem $Out -Filter "hello_cube_*.mp4" -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($mp4) {
        Move-Item -Force $mp4.FullName $final
        $ver = (Select-String -Path (Join-Path $Out "blender_$engine.log") -Pattern "RENDER_DONE" | Select-Object -Last 1).Line
        $line = "hello_cube.mp4 2.0 spinning cube, 48 frames 640x360, engine $engine, render $([int]$t.TotalSeconds) s | $ver | $exe"
        Set-Content -Path (Join-Path $Out "manifest.txt") -Value $line -Encoding UTF8
        Write-Host "OK: $line"
        exit 0
    }
    Write-Host "Engine $engine gave no video, trying the next one."
}
Write-Host "BLOCKED: Blender ran but produced no video (see incoming/blender-hello/blender_*.log)"
exit 3
