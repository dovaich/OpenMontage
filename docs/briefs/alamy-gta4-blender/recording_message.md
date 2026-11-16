# BLENDER BATCH (not voices) — STILLS, THEN THE FULL VIDEO

El-Alamy scene with the laptop's Blender (G:\blender\blender.exe, Blender 3.6). No browser needed. Don't edit scene.py.
Create incoming/alamy-gta4-blender if it doesn't exist.

STEP 1 — 4 check stills (about 1 minute). From the repo root, run exactly:

    & "G:\blender\blender.exe" -b --factory-startup -P docs/briefs/alamy-gta4-blender/scene.py -- incoming/alamy-gta4-blender stills:1,90,180,235 540 960 *> incoming/alamy-gta4-blender/preview.log

Then commit incoming/alamy-gta4-blender (still_*.png + preview.log) with the message "alamy-gta4-blender: stills r3" and push
to origin ccr-3b18907e-5bki3m right away (leave the status as `record` for now).

STEP 2 — the full 10 s video (about 30–40 minutes; wait for it to finish). Run exactly:

    & "G:\blender\blender.exe" -b --factory-startup -P docs/briefs/alamy-gta4-blender/scene.py -- incoming/alamy-gta4-blender video 540 960 *> incoming/alamy-gta4-blender/video.log

It writes incoming/alamy-gta4-blender/alamy_raw_0001-0300.mp4. Commit that MP4 and video.log (NOT the .blend file),
write manifest.txt, set queue/alamy-gta4-blender.status to `recorded`, and push to origin ccr-3b18907e-5bki3m.
If Blender errors, still commit the log, set the status to `recorded` and push (the cloud session fixes scene.py).
