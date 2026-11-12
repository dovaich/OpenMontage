# Ibrahim — gritty 3D look test (10 s)

> **Experiment only, for a future project.** This is not a change to the Om Hamada series. The series keeps its own characters and its low-poly PS2-style look (see `../SERIES_NOTES.md`).

A free, local test of a stylized 3D look in the spirit of late-2000s gritty open-world games. It has a hazy, desaturated grade, sodium street lights, bloom, wet asphalt and film grain.
No paid generation is used: everything is rendered with Three.js in headless Chromium (SwiftShader), and the audio is synthesised with numpy/scipy.

- **Character:** `readyplayer.me.glb` from the three.js examples. It is restyled in code as Ibrahim: the hat is trimmed off (bald top, side hair), with a darker mustache,
  a slate work jacket, an undershirt, striped pyjama pants, brass goggles, a pencil and a wrench.
- **Motion:** Mixamo clips from `Xbot.glb` (walk, idle, agree, headShake), retargeted in world space after aligning the A-pose rest to the T-pose rest.
- **Set:** a procedural Cairo back street at dusk, with Ibrahim's workshop, the engine on a crate, a tuk-tuk, an old sedan, wires and laundry, and a minaret in the haze.
- **Post:** GTAO, then UnrealBloom, then a custom grade (desaturation, split-tone, halo, contrast, vignette, grain, chromatic aberration), with letterbox bars and a freeze-frame name card.

## Build
```
npm i three@0.169.0 @fontsource/lalezar@5 @fontsource/anton@5
mkdir models && for f in readyplayer.me.glb Xbot.glb; do curl -sSO --output-dir models https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/models/gltf/$f; done
python3 -m http.server 8790 &
RANGE=0-120 node render.cjs frames 24 - & RANGE=120-240 node render.cjs frames 24 - ; wait
python3 sfx.py mix.wav
ffmpeg -framerate 24 -i frames/f%05d.png -i mix.wav -c:v libx264 -crf 17 -pix_fmt yuv420p -c:a aac -b:a 192k -shortest out.mp4
```
