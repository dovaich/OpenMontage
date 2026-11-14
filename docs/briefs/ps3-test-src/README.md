# PS3 autopilot test (10 s)

A 10-second 9:16 test of `.claude/skills/ps3-asset-autopilot` built in a cloud session (no laptop bridge).

- Characters: the Mixamo "X Bot" rig and its Mixamo mocap clips (walk, idle, agree, headShake, sad_pose) from the three.js examples
  repo (`public/models/xbot/Xbot.glb`, MIT). Clips are driven by `useCurrentFrame()`; arm gestures are bone tweaks on top.
  Real Mixamo downloads (custom characters, Falling/Angry/etc.) need the laptop browser and the user's Adobe sign-in.
- Poly Haven (CC0): HDRI `small_empty_room_1`, textures `long_white_tiles`, `floor_tiles_06`, `oak_wood_planks`, `floral_jacquard` (1k).
- Voices: Gemini 3.8 Flash TTS, `ar-eg-advisor-9` (Om Hamada) and `ar-eg-advisor-7` (Ibrahim), one request each.
- Look: N8AO, Bloom 0.8 / threshold 0.7, ACES, desaturated warm grade, vignette, light noise, real shadows.
- Render: `npx remotion render src/index.ts PS3Test out/ps3-test-10s.mp4 --gl=swangle --browser-executable=<chrome-headless-shell>`
  (about 9 minutes on software GL).
