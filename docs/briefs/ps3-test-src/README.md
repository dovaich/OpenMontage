# PS3 autopilot test (10 s)

A 10-second 9:16 test of `.claude/skills/ps3-asset-autopilot` built in a cloud session (no laptop bridge).

- Characters: Om Hamada and Ibrahim in the series' low-poly design (`buildChar()`, face decals in `src/face.ts`), mounted as rigid pieces on the
  Mixamo skeleton. Only the skeleton of `public/models/xbot/Xbot.glb` is used (three.js examples repo, MIT); its mesh is hidden.
- Animation: Mixamo clips driven by `useCurrentFrame()`: walk, idle, agree, headShake, sad_pose from the GLB, plus a Mixamo FBX
  (`public/models/anims/samba_dancing.fbx`, three.js examples) loaded the same way a Mixamo download would be. Gestures are bone tweaks on top.
  New animations come from mixamo.com through the autopilot queue (batch `ps3-mixamo-lib`, see the skill).
- Poly Haven (CC0): HDRI `small_empty_room_1`, textures `long_white_tiles`, `floor_tiles_06`, `oak_wood_planks`, `floral_jacquard` (1k).
- Voices: Gemini 3.8 Flash TTS, `ar-eg-advisor-9` (Om Hamada) and `ar-eg-advisor-7` (Ibrahim), one request each.
- Look: N8AO, Bloom 0.8 / threshold 0.7, ACES, desaturated warm grade, vignette, light noise, real shadows.
- Render: `npx remotion render src/index.ts PS3Test out/ps3-test-10s.mp4 --gl=swangle --browser-executable=<chrome-headless-shell>`
  (about 9 minutes on software GL).
