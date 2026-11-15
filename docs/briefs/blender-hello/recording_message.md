# BLENDER BATCH (not voices)

Smoke test: the laptop renders the smallest possible Blender video. No browser needed.

1. From the repo root, run exactly this one command (PowerShell, or Bash):
   `powershell -ExecutionPolicy Bypass -File docs/briefs/blender-hello/run.ps1`
   It finds blender.exe, renders `docs/briefs/blender-hello/scene.py` (a spinning cube, 2 s) and writes
   `incoming/blender-hello/hello_cube.mp4`, `manifest.txt` and `blender_*.log`.
2. If it prints `OK:`, set `queue/blender-hello.status` to `recorded`.
   If it prints `BLOCKED:`, leave the status as `record`, but still commit the logs in `incoming/blender-hello/`.
3. `git add incoming/blender-hello queue/blender-hello.status`, commit as "Claude <noreply@anthropic.com>"
   with the message `incoming: blender-hello render`, and push to origin ccr-3b18907e-5bki3m.
