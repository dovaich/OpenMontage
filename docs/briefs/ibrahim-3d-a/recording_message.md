# CHARACTER BATCH (not voices): draw Ibrahim in Gemini, then turn the drawing into a 3D model (free tools only)

This batch is **one character image and one 3D model, not TTS**. It is an EXPERIMENT (the episodes are not changing).
Use Claude in Chrome, logged in to the user's accounts. **Free tools only: never pay, subscribe or start a trial.** If every free option is out of
quota, stop, write what happened in the manifest, and still set the status to `recorded`.
The builder will convert the model and queue a second batch for Mixamo rigging, so **do not open Mixamo in this batch**.

## Step 1: the drawing (Gemini web app, gemini.google.com, one chat)
Prompt (ask for a vertical 3:4 image):

> Full-body 3D video game character model of a skinny Egyptian man in his 40s, standing in a strict symmetrical T-pose: arms stretched straight
> out horizontally to both sides, palms facing down, fingers slightly apart, legs straight and slightly apart, feet pointing forward, facing the
> camera directly, neutral closed-mouth expression. He has a huge thick black mustache, is balding with short black hair only on the sides, tan
> skin, and wears a white ribbed sleeveless undershirt, loose blue-grey vertically striped pajama trousers, brown plastic sandals, and brass
> welding goggles pushed up on his forehead. Style: stylized realistic 3D game character with clean readable shapes, like a modern open-world
> comedy game. Flat even studio lighting with no hard shadows, plain light grey background, whole body visible from head to toes with margin,
> straight front view, no text, no props, no floor shadow.

Check before accepting, and regenerate (up to 3 tries) if any of these fail:
- whole body in frame, nothing cropped; both arms fully horizontal and clear of the body; legs apart, not touching;
- exactly two arms, two legs, five fingers per hand; front view, not three-quarter;
- plain background, no text, no second figure.
Download it at full size as `incoming/ibrahim-3d-a/ibrahim_tpose.png`.

## Step 2: image → 3D model (first option that works)
Upload `ibrahim_tpose.png` and generate a **textured** model. Try in this order:
1. **Hunyuan3D** on Hugging Face Spaces (search "Hunyuan3D-2.1" or "Hunyuan3D-2" by tencent on huggingface.co/spaces; no sign-in needed). Tick texture
   generation, keep the other defaults, download the **GLB**.
2. **TRELLIS** on Hugging Face Spaces (by microsoft or trellis-community). Generate, then "Extract GLB" and download.
3. **Tripo** (tripo3d.ai) or the official **Hunyuan3D** site with the free daily credits, signed in with the user's Google account if it asks
   (ask the user for the one sign-in click; never type a password). Download GLB (or OBJ / FBX with textures).
If a Space says the GPU quota is used up or queues for more than about 10 minutes, move to the next option.

Check the result in the site's viewer before downloading: it must be a full standing figure with two separate arms held out and two separate
legs (not fused to the body or to each other). If the arms or legs are fused, regenerate once, then try the next tool.
Save it as `incoming/ibrahim-3d-a/ibrahim.glb` (keep the real extension if it is not GLB; for OBJ include the .mtl and texture files).

## After
1. Write `incoming/ibrahim-3d-a/manifest.txt`: one line per file (`<file> <what it is>`), which tool made the model, how many tries the image and
   the model took, and anything odd you noticed.
2. Set `queue/ibrahim-3d-a.status` to `recorded`, commit and push to `ccr-3b18907e-5bki3m` (message: `incoming: ibrahim-3d-a image + model`).
3. Notify the builder: `claude -p "MODEL READY: ibrahim-3d-a" --cloud session_01AGkU7yqdvR5XFpAPPR6hCd`. The builder also watches the branch.
