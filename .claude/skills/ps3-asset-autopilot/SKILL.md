---
name: "ps3-asset-autopilot"
description: "Autopilot for the user's PS2/PS3-style TikTok comedy videos: when a scene needs animations, models, textures or voices, fetch them on the laptop (Mixamo, Sketchfab, Poly Haven, Piper) and wire them into the Remotion project."
---

# PS3 Asset Autopilot

The user writes in Egyptian Arabic. Reply in Egyptian Arabic and keep replies short, because they are usually on their phone.
The laptop is a Windows PC named "dovaich", reached through the device bridge (mcp__remote-devices__*). The videos are Remotion + Three.js projects in a vertical 9:16 format at 1080x1920.

## 0. Before anything
1. Call `get_device_info`. If the laptop doesn't answer, tell the user to wake it up and open the Claude desktop app, then stop.
2. Find the project folder. If no folder is connected, ask the user which folder the project is in (one candidate in their home folder is `OpenMontage`, so ask whether it's that one). Then call `device_request_folder_access` once. Remember the path for the rest of the session.
3. Make sure the project has `public/models`, `public/textures`, `public/hdri` and `public/audio`.

## 1. Work out what the scene needs
Read the script or the user's request and write a short asset list, for example "a falling animation, a café model, a wood texture, the voice of the main character". Check `public/` first and reuse anything already there. Only fetch what is missing.

## 2. Fetching, by tool

### Mixamo (character animations)
- Load the `built-in-browser` skill, then use the built-in browser on the laptop (mcp__remote-devices__Claude_Browser__*). If it isn't available, fall back to Claude in Chrome.
- Open mixamo.com. If it asks for a sign-in, ask the user to sign in to their free Adobe account once, then continue. Never type passwords yourself.
- Search for the animation in English (Falling, Slip, Laughing, Dancing, Angry, Walking...) and pick the closest match.
- Download it as FBX Binary at 30 fps. Use "With Skin" for the first character, and "Without Skin" for extra animations on the same character.
- The file lands in `~/Downloads`. Move it to `public/models/<character>/<animation>.fbx` with device_bash, or with device_stage_files followed by device_commit_files if device_bash isn't available.

### Sketchfab (props and sets)
- Same browser. Search with the Downloadable filter, prefer low/medium-poly models, and download them as glTF/GLB.
- Check each model's license and tell the user which ones need credit (CC-BY), so they can put the credit in the TikTok description.
- Put the files in `public/models/props/`.

### Poly Haven (textures and HDRIs, CC0)
- On the laptop, try the API first: `https://api.polyhaven.com/assets?t=textures` and `https://api.polyhaven.com/files/<id>`, using device_bash with `curl` or PowerShell `Invoke-WebRequest`. If that doesn't work, download from the site through the browser.
- Use 1k resolution so renders stay fast. Textures go in `public/textures/<id>/` and HDRIs in `public/hdri/`.

### Piper TTS (free voices)
- Check whether it's installed with `piper --help` or `python -m piper --help`. If it isn't, run `pip install piper-tts` on the laptop.
- Download the voices once into `voices/` inside the project. Give each character a fixed voice and record the choice in `voices/cast.json`.
- Generate the lines as `public/audio/<scene>_<line>.wav`.

### Blender (only when a model needs fixing)
- Use it only when a model needs real modifications (scale, merging, reducing polygons). Run it from the command line with `blender -b -P script.py` if it's installed. If it isn't, tell the user and suggest downloading it from blender.org, and don't stop the rest of the work.

## 3. Wiring assets into the project
- Load FBX with `useFBX`/`FBXLoader` and GLB with `useGLTF`, inside `@remotion/three`'s `ThreeCanvas`.
- Drive Mixamo animations from `useCurrentFrame()`, not real time, so that renders stay consistent.
- Make sure these packages are installed: `@remotion/three three @react-three/fiber @react-three/drei @react-three/postprocessing postprocessing`.

## 4. The PS3 (2008) look, applied by default
- `EffectComposer`: Bloom (intensity ~0.8, luminanceThreshold ~0.7), SSAO, light Vignette, very light Noise (opacity ~0.05).
- Color grading that is desaturated and leans brown/warm grey.
- Real shadows (castShadow/receiveShadow) and a Poly Haven HDRI for the lighting.
- DepthOfField only for close-ups.
- If the user asks for "PS2", use these instead: low-resolution textures with NearestFilter, no anti-aliasing, a slight vertex jitter, and no Bloom.

## 5. Check before the full render
- Render a 5-second test of the scene first (`npx remotion render --frames=0-149`). Look at a few frames and make sure the animation, lighting and audio sync are right.
- After that, do the full render and send the user the video with SendUserFile.

## Rules
- Never pay for or subscribe to anything. Everything here is free.
- Don't delete any of the user's files. Move them only.
- If a site needs the user's sign-in or approval, open the page first, then ask them for the one step they need to do.
- At the end, reply with one line: what got added, the location of the video, and any credits needed in the description.
## Wiring into OpenMontage (repo autopilot)
- This skill is the **asset stage** of the Om Hamada / Ibrahim series. Before fetching, read `docs/briefs/SERIES_NOTES.md` (characters, voice casting, no episode numbers, dialogue-sync rules) and the closest previous episode in `docs/briefs/*-src/` so the new episode reuses the same rigs, HUD and finishing chain.
- Voices: the series default is Gemini TTS / AI Studio per `SERIES_NOTES.md`. Use Piper only when the user asks for it or the Gemini route is blocked (quota, no audio uploaded).
- Asset paths above (`public/models`, `public/textures`, `public/hdri`, `public/audio`) are relative to the Remotion project (`remotion-composer/` in this repo unless the episode has its own project).
- Record every fetched asset (source URL, license, credit) in the project's asset manifest under `projects/<project-id>/` so the pipeline review and the TikTok credits stay in sync.
- **Cloud session with no laptop:** if `get_device_info` / the device bridge isn't available, don't stop. Fetch what the container's network allows (Poly Haven API, Piper voices from Hugging Face) directly into the repo, skip Mixamo/Sketchfab (they need the user's sign-in), and tell the user in one line which assets still need the laptop.
