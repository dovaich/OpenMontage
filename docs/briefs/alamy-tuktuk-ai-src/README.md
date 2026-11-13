# El-Alamy and the AI tuk-tuk — 30 s AI-video test (vertical 1080x1920)

> **Experiment only, for a future project.** This is not a series episode.

## Pipeline
1. **Voices:** the autopilot batch `alamy-tuktuk-ai`, recorded in AI Studio. Lines are mapped by transcript plus silence gaps (`build_audio.py` → `mix.wav`, `timeline.json`).
2. **Characters and scenes:** the autopilot image batch `alamy-tuktuk-img`, made in the Gemini web app. One chat holds 2 reference sheets and then 8 scenes, so the faces and the garage stay the same.
3. **Motion:** Wan 2.2 TI2V-5B on Kaggle T4 (fp16, 480x832, 61–81 frames, 25 steps, prompts with a static camera and subtle motion), run in 2 sessions in parallel.
   - **RAM fix:** encode every prompt first, then drop the text encoder. Without this, the session is killed on the 2nd clip.
   - Timing: about 5 min to load, then about 6–8 min per clip.
4. **Local motion (CPU, no GPU):** `parallax.py` uses Depth Anything V2 (ONNX) for a 2.5D camera move with haze and grain. It takes about 12 s per 3 s shot and is used for the tuk-tuk and the ending.
5. **Edit:** `overlay.html` draws the hook, REWIND, the dialogue boxes and MISSION COMPLETE as RGBA frames. `assemble.py` cuts the clips to the voice timeline, applies the grade, and scales to 1080x1920.
- Tried and dropped:
  - LTX-Video 2B: weak motion.
  - FastWan 4-step: about 5x faster, but the face drifts.
  - SDXL RealVis img2img over code-drawn frames: less consistent than Gemini.
  - Code-drawn characters (`chars.js`, `kf.js`): still useful as layout or pose references.
- Next: Veo 3.1 in Flow through the autopilot. The user has AI Pro, about 1000 credits/month, and an 8 s Fast clip costs about 20 credits.

## Flow version (`final_flow.mp4`, about 34 s) — the one to keep
- **Motion:** 7 clips from the Google Flow autopilot batch `alamy-tuktuk-flow`. Each uses Omni 1.2 Flash, Frames-to-Video from the Gemini scenes, 9:16, 8 s, and 24 credits (882 left).
  The prompt includes the Arabic line, so Flow animates the mouth for it.
- **Lip sync with our voices:** `align_voice.py` finds Flow's own speech in each clip (inside a window per line), runs DTW on the MFCCs of Flow's audio
  against our autopilot line, then splits our line into phrases at its natural pauses and stretches each phrase with ffmpeg atempo onto Flow's timing. (The first version used a librosa phase vocoder on 0.25 s pieces; it left an audible echo.) Flow's audio is then dropped.
- **Final cut:** `build_flow.py` runs the alignment for every line, then `build_final.py` does the edit, the mix (dialogue, announcer with tightened pauses, music ducking, stinger)
  and the text layer (`overlay.html?m=flow` reads `flow_timeline.json`).
- LatentSync on Kaggle (Python 3.11 venv via uv, because Kaggle runs 3.13) is kept as a fallback for any line that won't fit. It needs a large frontal face.
