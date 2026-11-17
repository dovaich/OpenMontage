# MPFB cast: 12 s scene test («المكنسة النووية») — EXPERIMENT, not a series episode

- Cast: `../mpfb-chars/models/*.glb` (MPFB2 / MakeHuman builds, see `../mpfb-chars/README.md`), Mixamo skeleton.
- Motion: Mixamo clips (`anims/*.fbx`, batch ps3-mixamo-lib) + the three.js Xbot clips (idle/walk/run), retargeted in `mpfb_runtime.js`
  (world-space rotation deltas, both rests in T-pose); layered blends per character.
- Face: lip sync from the voice envelope + the Arabic letters (open / round / wide / press shapes), blinks, brows (`face()` in `mpfb_runtime.js`).
- Voices: the laptop AI Studio takes of batch `vacuum-batch` (unchanged method); `build_audio.py` cuts the 3 lines, squeezes pauses, adds a synthesised
  vacuum hum / whoosh / room tone → `mix.wav`, `data.json`.
- Set: living room built in `scene.html` with Poly Haven CC0 textures (`tex/`), ACES, soft shadows.
- Render: `python3 -m http.server 8901` here, then `node render.cjs frames 30` (4 browsers, ~4 min) and the ffmpeg line in the commit (1080x1920).
