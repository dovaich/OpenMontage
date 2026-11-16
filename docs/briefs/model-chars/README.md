# Real 3D character models for the vertical engine (opt-in)

Drawing (T-pose) → Hunyuan3D-2 on Kaggle (free T4) → GLB → skinned in code onto the engine's own rig (`vertical-template/model_chars.js`).
Every pose in ep.js (`poseAt`, `applyPose`), every camera (`faceCam`, distances × `MODEL_FACE_K`) and the jaw lip-sync keep working,
so an existing episode switches a character with one line in ep.js:

    useModel(dad, 'ibrahim', { h: 1.76 });            // h = height (m); robe: 1 for a long dress/galabiya; flip: 1 if the model faces away

`example_build.py` sees `useModel(...)`, adds the GLTFLoader import and copies `models/<name>.glb` into build/models/.
The cartoon body is moved to layer 1 (never drawn), so ep.js toggling hair/goggles/afro has no effect on a model character.

## Models
| file | character | source |
|---|---|---|
| ibrahim.glb | Ibrahim | Gemini drawing (incoming/ibrahim-3d-a) → Hunyuan3D-2 (v2 run, branch ccr-f712767a-hufj5z) |
| alamy, bastam, asly, gazzar, samir | service-center cast, Abu Samir | FLUX T-pose → Hunyuan3D-2 (same branch) |
| om_hamada, hamada | Om Hamada, Hamada | queued: laptop image batch `family-3d-img` (Gemini web app) → Kaggle |

## Making a new model
1. Drawing: an IMAGE batch for the laptop (Gemini web app, strict T-pose, front view, plain grey background; see
   `docs/briefs/family-3d-img/recording_message.md`). `flux_tpose.py` (free FLUX Space) works when its ZeroGPU quota isn't used up;
   `gemini_tpose.py` needs a paid Gemini key (the free tier has 0 image requests).
2. `python3 kaggle/hy3d_kernel.py push <slug> tpose/a.png tpose/b.png` → `status <slug>` until COMPLETE (≈ 11 min load + ≈ 2–4 min per model)
   → `fetch <slug> out/` → copy the GLB to `models/`.
3. Check it on a still: add `useModel(...)` to a test ep.js, `node render.cjs st 15 <times>`.
