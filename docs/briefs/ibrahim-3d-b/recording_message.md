# RIGGING BATCH (not voices): auto-rig the Ibrahim 3D model on Mixamo

This batch is **one upload to Mixamo's auto-rigger and one download, not TTS**. It is an EXPERIMENT (the episodes are not changing).
Use **mixamo.com** through Claude in Chrome, on the user's free Adobe account (already used for batch `ps3-mixamo-lib`). Nothing here costs money.
The model is in the repo: `incoming/ibrahim-3d-a/ibrahim_obj.zip` (OBJ + MTL + texture; `model_views.png` shows what it looks like).

## Steps
1. On mixamo.com press **Upload Character** and upload `incoming/ibrahim-3d-a/ibrahim_obj.zip`.
2. Orientation screen: the character must stand upright **facing you**. Use the rotate arrows if it is lying down or facing away, then Next.
3. Marker screen: keep **Use Symmetry** on, and drag the markers onto the model: **chin** on the chin (just under the mustache), **wrists** on both
   wrists, **elbows** on both elbows, **knees** on both knees, **groin** at the crotch where the legs split. Skeleton LOD: **Standard Skeleton (65)**.
   Press Next and wait for the auto-rig (about 2 minutes).
4. Preview: the character should move without the arms or legs tearing or sticking to the body. If a limb is badly broken, go Back, fix that
   marker and rig again (up to 2 more tries). Then confirm, so the character becomes the active one.
5. With **no animation selected** (if one is selected, clear it), press **Download**: Format **FBX Binary (.fbx)**, Pose **T-pose**.
   Save it as `incoming/ibrahim-3d-b/ibrahim_rigged.fbx`.
6. Also, with the rigged Ibrahim still active, search the animation **Silly Dancing**, and download it **With Skin**, FBX Binary, 30 fps, no keyframe
   reduction, as `incoming/ibrahim-3d-b/ibrahim_silly_dance.fbx` (a control file to compare against the builder's own retargeting).

## After
1. Write `incoming/ibrahim-3d-b/manifest.txt`: one line per file, how many rig tries it took, whether the texture showed in Mixamo's viewer, and
   anything odd in the preview (which limb, what it did).
2. Set `queue/ibrahim-3d-b.status` to `recorded`, commit and push to `ccr-3b18907e-5bki3m` (message: `incoming: ibrahim-3d-b rigged character`).
3. Notify the builder: `claude -p "RIG READY: ibrahim-3d-b" --cloud session_01AGkU7yqdvR5XFpAPPR6hCd`. The builder also watches the branch.
