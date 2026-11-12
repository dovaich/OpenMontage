# El-Alamy — "mission" look test (about 42 s, vertical)

> **Experiment only, for a future project.** This is not a series episode, and the series keeps its own look.

- **Voices:** the autopilot batch `alamy-gta-test`. The brief is in `recording_message.md`, and the takes are in `incoming/alamy-gta-test/` on `ccr-3b18907e-5bki3m`.
  The lines are mapped to the takes by transcript plus silence gaps (`tr_plain.py`). `build_audio.py` places them, matches their loudness, and adds the SFX and music. It writes `timeline.json` and `mouth.json` (the lip-flap envelopes).
- **Picture:** a free local Three.js render, as in `../ibrahim-gritty-3d-src`. There are two Ready Player Me rigs driven by Mixamo clips:
  - **El-Alamy:** black leather jacket over black, slim grey trousers, clean-shaven, and short natural hair. The hair is grown from the skinned scalp, so it hugs the head in every pose.
  - **Bestem:** navy overalls, a mustache, and curly hair.
  - **The story:** cold open, then rewind, the mission card, the garage, the laptop and its cable, the 99% screen, the explosion, and "Mission Failed".
- **AI alternative (in progress):** `keyframes.py` (FLUX.1-schnell Space) and `animate.py` (LTX-Video Space) use the user's free Hugging Face token. The proxy injects it, so the scripts must send an `Authorization` header with a placeholder value. The free ZeroGPU quota fits only about 1–2 clips a day.

## Build
```
ln -s ../../ibrahim-gritty-3d-test/src/node_modules node_modules; ln -s ../../ibrahim-gritty-3d-test/src/models models
python3 build_audio.py
python3 -m http.server 8791 &
for r in 0-341 341-682 682-1022; do RANGE=$r node render.cjs frames 24 - & done; wait
ffmpeg -framerate 24 -i frames/f%05d.png -i mix.wav -vf scale=1080:1920:flags=lanczos -c:v libx264 -crf 18 -pix_fmt yuv420p -c:a aac -b:a 192k -shortest final.mp4
```
