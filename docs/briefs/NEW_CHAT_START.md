# START HERE: Om Hamada series (new chat per video)

This repo holds a running Egyptian-Arabic comedy series for TikTok, in a low-poly PS2-cutscene style. Every new chat that makes an episode
should read this file, then `SERIES_NOTES.md` (characters, voices, format rules), then copy the newest episode closest to the request.
**These episodes do NOT go through the OpenMontage pipelines/Remotion.** They use our own Three.js engine (below). Keep "our normal style"
unless the user explicitly asks to try other repo tools (paid AI video/images were offered once; the user said keep our style).

Branch: `ccr-3b18907e-5bki3m` (commit + push everything there; commit lines end with the Co-Authored-By/Claude-Session given by the harness).

## The user
- Writes in Egyptian Arabic; answer in Egyptian Arabic, short.
- Usual flow: «اعملي حلقة عن ...» → (sometimes «ابعتلي السكريبت الأول») → you write the script → queue it for recording → build → send.
- Posts 2 new episodes/day (7 PM + 12 AM Cairo). Never reposts old ones. No episode numbers anywhere.

## Standing rules (details in SERIES_NOTES.md)
- **Vertical 9:16** (540×960 frames → 1080×1920), **30–45 s** target, family core cast works best (Om Hamada / Ibrahim / Hamada).
- Open with a **cold open** of the funniest moment (a COMPLETE line, never cut) → «<< REWIND قبلها بـ...» → **hook text** (2 lines, big, white card) → story → disaster ending → announcer line (English) → end card (meters) → «يُتبع...».
- Dialogue text appears in sync with the voice (`revealCount` / `vox`). Big dialogue box at the bottom (`drawDialogueV`).
- Each character keeps one voice (table in SERIES_NOTES.md). Every new Ibrahim invention → an invention card (`invention-cards-src`).
- Cartoon slapstick only (stars, bonk, slipper) — no realistic violence. El-Gazzar's "spaced-out" trait stays implicit.
- Check framing with contact sheets before the full render: faces must be visible (camera in FRONT of the speaker), nobody clipping through
  walls/roofs, nothing blocking faces (notebooks, other characters, hanging car charms). The user notices these.

## Voices: recorded by the user's LAPTOP (local Claude + Claude in Chrome in Google AI Studio)
Protocol: `LOCAL_RECORDER.md` + `AUTOPILOT.md`. In short:
1. Write `docs/briefs/<batch>/recording_message.md` (same format as `uber-batch` / `asly-sharka-batch`: speakers per recording,
   blocks in order — AI Studio alternates speaker 1/2 automatically, so merge consecutive lines of one speaker into one block with `[long pause]`).
2. `echo record > queue/<batch>.status`, commit, push.
3. Start a background watcher (Bash, run_in_background) that `git fetch`es every 20 s until `queue/<batch>.status` == `recorded`.
4. The laptop watcher (`watcher.ps1`, git fetch every 20 s) starts a `claude -p` session that records, pushes `incoming/<batch>/r1.wav…` + `manifest.txt`, sets `recorded`.
5. If the laptop never answers, the user double-clicks `start-watcher.bat` on the laptop Desktop (it retries any batch still at `record`).
Fallback for a single missing line: `tools/gemini38_line.py out.wav <Voice> "<style>" "<text>"` (Gemini key is a network secret; free tier ≈10 req/day).

## Building an episode (vertical template)
```bash
bash docs/briefs/vertical-template/new_episode.sh <name> <port>   # e.g. 8780
# 1) map lines: transcribe takes, cut by silence
python3 docs/briefs/tools/segs.py incoming/<batch>/r1.wav 0.3
python3 docs/briefs/tools/gemini_transcribe.py incoming/<batch>/r1.wav gemini-3.5-flash   # 503/502 → try -lite or gemini-3.1-flash-lite
ffmpeg -i incoming/<batch>/rN.wav -ar 44100 -ac 1 projects/<name>/assets/audio/google/rN_44.wav
# 2) add an entry to assemble_pair.py (list of (speaker, take, start, end, pause_before, ar, en)); first line = cold open
python3 docs/briefs/vertical-template/assemble_pair.py <name> 0.35     # 2nd arg squeezes in-line pauses → shorter episode
#    writes dialogue.wav, artifacts/lines.json, build/lines.js + env.js
# 3) write build/ep.js (copy example_ep_*.js), a build.py that concatenates engine8 + samir_car/alamy + vertical_common + ep → scene.js
#    (see example_build.py; it also sets DUR and the frame count in render.cjs)
# 4) sound: copy example_sfx.py → sfx.py, edit the event section, then
python3 sfx.py ../assets/audio/dialogue.wav ../assets/audio/final_mix.wav
# 5) render
python3 -m http.server <port> --bind 127.0.0.1 &   (from build/)
node render.cjs st 15 1.5,8,15,22       # stills for checking (st/tX.XX.png) → tile them with ffmpeg and LOOK
node render.cjs frames 15 && bash encode_vertical.sh
```
`assemble_pair.py`'s EP dict paths point to `/home/user/OpenMontage/projects/<name>`; it contains every past episode's line map as examples.

Engine notes: `engine8.js` = living room/hallway/balcony + mom/son/dad/samir (`makeChar`, `faceCam`, `poseAt/applyPose`, `drawFace`, particle pools);
`vertical_common.js` = bathroom (x 60), kitchen (x 120), dining table, vertical HUD (`drawHookV`, `drawRewind`, `drawInventionV`, `drawEndV`,
`drawDialogueV`), portraits for all cast; `garage_block.js` = service center (`${GARAGE}`), `crew_def.js` = Bestem/El-Asly/El-Gazzar (`${CREW}`),
`alamy.js` = El-Alamy (current look), `samir_car.js` = Abu Samir's yellow 1980 «١٢٨» with full interior + red button (scale 1.25 for passengers;
see `characters/samir-car/README.md`). Put different sets far apart on x (market x 200, door x 300, sky x 2000 …). Name clashes with engine
globals (`flames`, `curtain`, `drawTV`, `hood`, `car`…) crash the page — rename (watch for `PAGEERR Identifier ... already declared`).

## Faster build tools (Nov 2026; voices are still recorded on the laptop exactly as above)
- **Line map, local:** `python3 docs/briefs/tools/map_takes.py <batch>` reads the batch brief + `incoming/<batch>/rN.wav`, runs Whisper
  (faster-whisper large-v3-turbo on CPU, ~8 s per 20 s take, no quota, no 503) and prints ready `assemble_pair.py` tuples
  (speaker, take, start, end, …, ar) in recording order, snapped to the measured voiced segments. Reorder into episode order, add `en`.
  Lines marked `CHECK` had a weak match: listen, or fall back to `gemini_transcribe.py`. Matched the hand map of «حكاية المخترع العالمي» on all 14 lines.
- **Framing check before the full render:** `node render.cjs check 5` (framing_check.js is appended by build.py). For every frame where
  someone talks it reports the face out of shot, behind the dialogue box, turned away, or blocked (by a wall, roof, prop or another
  character, with the object's position), plus a lens touching geometry. Report in `check/report.txt`, red-marked stills of the bad frames in `check/`.
  Narration/voice-over lines show up as "talks but is hidden": skip them with `window.FRAME_SKIP = [[t0, t1]]` in ep.js. Several models
  for one id (young/old): `window.CAST = { teta: [a, b] }`. Props that may cover a face: `window.FRAME_IGNORE = [obj]`.
- **Render:** `node render.cjs frames 15` now splits the frames over up to 4 browsers (`--jobs N`); `--range 300-420` re-renders only a part.
  (A full 54 s episode: ~80 s → ~65 s here; rendering was never the slow part.)
- **MPFB-cast episodes (user asked for them, Nov 2026):** `docs/briefs/mpfb-washer` (34 s) and `docs/briefs/mpfb-gas` (60 s) are the templates
  (three.js + `mpfb_runtime.js` + `hud.js`, cameras aimed at faces with `on()` / `two()`). User preferences for these: **no cold open** (start on the hook
  card over the first line), render at **540x960** and deliver **720x1280** (smaller file, faster render), ~60 s is fine.
- **Real 3D characters: EXPERIMENT ONLY (user rule).** Do NOT use `useModel(...)` / `model_chars.js` in any episode unless the user explicitly
  asks for the 3D models in that chat. Episodes keep the normal low-poly cartoon characters. Details: `docs/briefs/model-chars/README.md`.
- **Flow cold open (only for the strongest episodes; Flow credits ≈ 40 clips/month):** queue one VIDEO batch clip from a still of the
  cold-open shot, then `python3 docs/briefs/tools/coldopen_flow.py <project> <clip.mp4>` → `renders/final_flow_coldopen.mp4`
  (our same voice aligned to Flow's lips, our dialogue box on top, then the episode from the REWIND on).

## Deliver
- `SendUserFile` the MP4 + cover (+ new invention card and the updated cards cover).
- Copy sources to `docs/briefs/<name>-src/` (ep, scene, build, sfx, lines.json, cover, README), set `queue/<batch>.status` to `done`, commit, push.
- Reply in Egyptian Arabic: what's in the episode, what you fixed, length.

## Episodes made so far (sources in docs/briefs/*-src)
Landscape 4:3 (older): jet-dishwasher-3000, shibshib-final-boss, wifi-booster-nuclear, shorout-el-rogoo, motor-hoda, mishwar-el-souq,
el-diouf-gayeen, kashef-el-kedb, om-hamada-live, markaz-el-siana, ajel (news), dayf-mn-elsama, fein-eltoktok.
Vertical 9:16: wifi-booster-2, sakhan, mobile-dryer, takyeef, natiga, abu-samir-car, vacuum, asly-work, asly-sharka, uber, life-story.
Best performer so far: «مقوّي الواي فاي النووي» (3.8k views vs 100–1000) → everyday problem + «النووي ٣٠٠٠» invention + family.
Ideas not done yet: water heater ✔ done, AC ✔, results site ✔ … still open: washing machine, Ramadan lantern, exam cheating device, gas cylinder, elevator.
