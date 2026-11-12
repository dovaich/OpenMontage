# Local recorder → cloud builder handoff

Two Claude sessions split the work:
- A **local session** (Claude Code on the user's computer, with the Claude in Chrome extension) records the voices in Google AI Studio.
- The **cloud session** (`session_01AGkU7xrbvxEyJ1BmPLBUAN`, branch `ccr-3b18907e-5bki3m`) builds the episodes.

## What the local session does, for each batch
1. Pull the branch: `git fetch origin ccr-3b18907e-5bki3m && git checkout ccr-3b18907e-5bki3m && git pull`.
2. Open the batch's recording brief: `docs/briefs/<batch>/recording_message.md` (the cloud session says which batch).
3. Using Claude in Chrome, follow that brief exactly in Google AI Studio (Generate speech, Gemini 3.8 Flash TTS):
   - Use the same voices, block order, styles and text. Don't change any words.
   - After each run, listen once. If a line is skipped or cut off, run that recording again.
4. Save each downloaded WAV into the repo as `incoming/<batch>/r1.wav`, `r2.wav`, `r3.wav`... in the order of the brief.
   Write `incoming/<batch>/manifest.txt` with one line per file: `r1.wav <duration s> <what it is>`.
5. Commit and push to `ccr-3b18907e-5bki3m`, with a message like `incoming: <batch> voices`.
6. Tell the cloud session it's ready. Send a message to session `session_01AGkU7xrbvxEyJ1BmPLBUAN`
   (SendMessage / send_message, or ListAgents first to find it) with the text: `VOICES READY: <batch>`.
   If no messaging tool is available, tell the user to write `VOICES READY: <batch>` in the cloud session.

## What the cloud session does on `VOICES READY: <batch>`
It pulls the branch and reads `incoming/<batch>/`. It maps the lines by transcript, then builds, renders and sends both vertical episodes and their invention cards, and commits the sources. No questions back unless something is missing.
