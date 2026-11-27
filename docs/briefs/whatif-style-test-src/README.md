# "What if" reel look, style test (10 s, 9:16)
Look copied from a Facebook reel by Yastor (soft-daylight 3D, monospace HUD, blue "future" bubbles, typed captions). The look only, not the story.
- Models: three.js examples Michelle.glb (woman) + readyplayer.me.glb (man) (+ Soldier.glb, its rig is only loaded). Download from
  cdn.jsdelivr.net/gh/mrdoob/three.js@r169/examples/models/gltf/ into build/models/.
- Animations: incoming/ps3-mixamo-lib/*.fbx (X Bot), retargeted in world space in scene.js (`bake`).
- Narration: Gemini TTS voice Charon (4 lines, assembled into narr.wav). mix.py adds a synthesized piano/pad bed and bubble chimes.
- Build: npm i three@0.169.0 @fontsource/ibm-plex-sans-arabic @fontsource/ibm-plex-mono; serve on 8791; node render.cjs frames 30; ffmpeg.
