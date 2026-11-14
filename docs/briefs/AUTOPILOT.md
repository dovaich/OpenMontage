# Autopilot: new episodes with no user involvement

## State files (on branch `ccr-3b18907e-5bki3m`)
- `queue/<batch>.status` holds one word:
  - `record`: the cloud session wrote the episodes and the brief, and the voices are wanted.
  - `recorded`: the local session pushed the WAVs to `incoming/<batch>/`.
  - `done`: the cloud session built and delivered the episodes.
- The brief for each batch is `docs/briefs/<batch>/recording_message.md`.

## Local session (user's laptop, Claude in Chrome): fastest mode, a background watcher instead of /loop
- Keep a background watcher running, with no Claude turns while waiting. It's a shell loop (Monitor, or Bash in the background with an until-loop) that:
  1. Runs `git fetch origin ccr-3b18907e-5bki3m` every 20 seconds.
  2. Exits and wakes the session as soon as any `queue/*.status` on `origin/ccr-3b18907e-5bki3m` says `record`.
- When woken:
  1. `git pull`.
  2. Record the batch in AI Studio exactly as `docs/briefs/<batch>/recording_message.md` says. Run the recordings back-to-back, and don't wait between them.
  3. Save `incoming/<batch>/r1.wav`, `r2.wav`, `r3.wav` and `manifest.txt`.
  4. Set the status to `recorded`, then commit and push immediately.
  5. Restart the watcher.

## Cloud session (this repo's builder): ON DEMAND, no fixed schedule
- The user writes in the cloud session, for example «اعملي حلقة عن كذا». The cloud session then:
  1. Writes the episode(s) and `docs/briefs/<batch>/recording_message.md`, sets `queue/<batch>.status` to `record`, and pushes.
  2. Runs its own background watcher (`git fetch` every 20 s) until the status turns `recorded`, then builds right away. Both episodes of a batch render in parallel.
  3. Builds the vertical episode(s), covers and invention cards, sends them to the user, sets the status to `done`, and pushes.
- There are no daily scheduled tasks: episodes are made only when the user asks.
- The user posts on TikTok (7 PM / 12 AM). Posting can't be automated from here.

## Image batches (Gemini web app, no API) — added Nov 2026
- Same queue mechanism. An image batch is a normal batch whose `docs/briefs/<batch>/recording_message.md` starts with
  `# IMAGE BATCH (not voices)`. The local session follows it in the **Gemini web app** (one chat, reference sheets first, then the scenes)
  instead of AI Studio TTS. It saves the images to `incoming/<batch>/`, writes `manifest.txt`, sets the status to `recorded` and pushes.
- Statuses stay the same (`record` → `recorded` → `done`), so the existing watcher wakes on image batches with no change.
- Motion is done by the cloud builder on Kaggle (free T4 GPUs, Wan 2.2 image-to-video). See `docs/briefs/alamy-gta-test-src/kaggle_ltx_i2v.md` on `ccr-c6f1b9a5-tgwuni`.

## Video batches (Google Flow / Veo 3.1, no API) — added Nov 2026
- A batch whose `recording_message.md` starts with `# VIDEO BATCH (not voices)` is made in Google Flow (the user has AI Pro: about 1000 credits/month, and an 8 s Veo 3.1 Fast clip costs about 20).
  Use Frames to Video with the Gemini scene images as start frames. Save the clips to `incoming/<batch>/`, then set the status to `recorded` and push.
- The cloud builder lip-syncs every talking clip to the autopilot voices on Kaggle (LatentSync, with MuseTalk as the fallback). The mouths then match the series voices exactly.

## Animation batches (mixamo.com, no API) — added Nov 2026
- Experiments only for now: the episodes keep their current look. Queue these batches only for the PS3-look tests.
- A batch whose `recording_message.md` starts with `# ANIMATION BATCH (not voices)` is downloaded from **mixamo.com** (free Adobe account, the user signs in once).
  Always X Bot, FBX Binary, Without Skin, 30 fps, In Place when offered. Save the `.fbx` files to `incoming/<batch>/`, write `manifest.txt`,
  set the status to `recorded` and push. Statuses are unchanged, so the existing watcher wakes on these batches too.
- The cloud builder mounts the series' own low-poly characters on the Mixamo skeleton (Mixamo's characters are never shown) and plays the clips
  from the Remotion frame. Source: `docs/briefs/ps3-test-src` and `.claude/skills/ps3-asset-autopilot/SKILL.md` on `ccr-5c42b35f-yana04`.
- `ps3-mixamo-lib` is the shared starter library; later batches only ask for animations that are not in it yet.

## Character batches (drawing → 3D model → Mixamo rig) — experiment, Nov 2026
- `# CHARACTER BATCH`: the local session draws the character in the Gemini web app (strict T-pose, front view, plain background).
  The free image-to-3D web tools did not deliver a downloadable textured model (ZeroGPU limits, disabled texture, paid export), so the
  **cloud builder makes the model on Kaggle** (free T4): Hunyuan3D-2 shape + paint, about 11 minutes, 7 GB VRAM. It needs
  `transformers==4.48.3`, `diffusers==0.32.2`, `huggingface_hub<1.0` (Kaggle's newer transformers cannot load the image encoder).
- `# RIGGING BATCH`: the local session uploads the OBJ zip to Mixamo's auto-rigger and downloads the rigged FBX (T-pose).
