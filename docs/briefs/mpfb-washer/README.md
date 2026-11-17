# «الغسالة النووية» — first episode with the MPFB cast (vertical 9:16, ~34 s)
The user asked for an episode with the new characters (MPFB2 models, `../mpfb-chars`). The usual series method otherwise:
voices recorded by the laptop (batch `washer-batch`, AI Studio), cold open → REWIND → hook → story → announcer → end card → يُتبع.
- Story: Om Hamada complains the washer won't spin. Ibrahim straps the tuk-tuk engine on it («الغسالة النووية ٣٠٠٠»). It hops, walks out of the
  bathroom, and goes down the stairs by itself (cold open + ending in the stairwell).
- Line map: `../tools/map_takes.py washer-batch` (no manual mapping). Audio + SFX + music: `build_audio.py` → `mix.wav`, `data.json`.
- Picture: `episode.html` (three.js, ACES, soft shadows), cast + Mixamo motion + letter lip sync via `mpfb_runtime.js`; series 2D layer in `hud.js`.
- Render: serve this folder on :8902 (with the symlinks node_modules, models → ../mpfb-chars/models, anims/tex → ../mpfb-scene),
  `node render.cjs frames 30` (~13 min), then the ffmpeg line in the commit message.
- New invention card: `../invention-cards-src/card_nuclear_washer.png`.
