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
6. Tell the cloud session it's ready. Run this in the terminal; it posts the message into the cloud session:
   `claude -p "VOICES READY: <batch>" --cloud session_01AGkU7xrbvxEyJ1BmPLBUAN`
   If that fails and the local session is connected to Remote Control, use SendMessage instead (ListAgents first, to find the cloud session).
   If both fail, tell the user to write `VOICES READY: <batch>` in the cloud session.

## Enabling Claude in Chrome locally (one-time)
1. Install the Claude in Chrome extension (v1.0.36 or later) and sign it in to the same claude.ai account.
2. In Claude Code (CLI): sign in with `/login` (not an API key), then start with `claude --chrome`, or run `/chrome` and choose "Enabled by default".
3. Verify: `/chrome` should show Status: Enabled and Extension: Installed. If it doesn't, choose "Reconnect extension".

## What the cloud session does on `VOICES READY: <batch>`
It pulls the branch and reads `incoming/<batch>/`. It maps the lines by transcript, then builds, renders and sends both vertical episodes and their invention cards, and commits the sources. No questions back unless something is missing.
