# BLENDER BATCH (not voices) — PREVIEW STILLS

Render 4 preview stills of the El-Alamy scene with the laptop's Blender (G:\blender\blender.exe, Blender 3.6). No browser needed.

1. From the repo root (after git pull), run exactly:

       & "G:\blender\blender.exe" -b --factory-startup -P docs/briefs/alamy-gta4-blender/scene.py -- incoming/alamy-gta4-blender stills:1,90,180,235 540 960 *> incoming/alamy-gta4-blender/preview.log

   (Create incoming/alamy-gta4-blender first if it doesn't exist. It takes a few minutes.)
2. Whatever happens (even if Blender errors), commit incoming/alamy-gta4-blender/ (the still_*.png files and preview.log; NOT any .blend file),
   set queue/alamy-gta4-blender.status to `recorded`, and push to origin ccr-3b18907e-5bki3m.
   The cloud session reads preview.log to fix any error, so don't try to edit scene.py yourself.
