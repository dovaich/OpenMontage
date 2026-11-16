# BLENDER BATCH (not voices)

Smoke test: the laptop renders the smallest possible Blender video. No browser needed.

Run exactly this one command from the repo root, and nothing else:

    powershell -ExecutionPolicy Bypass -File docs/briefs/blender-hello/run.ps1

The script does everything by itself: finds blender.exe, renders the spinning cube to
`incoming/blender-hello/hello_cube.mp4`, sets `queue/blender-hello.status`, commits and pushes.
Do not run git yourself for this batch. If it prints `PUSHED`, you're done. Finish with the last lines it printed.
