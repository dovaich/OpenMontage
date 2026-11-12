# Autopilot: new episodes with no user involvement

## State files (on branch `ccr-3b18907e-5bki3m`)
- `queue/<batch>.status` holds one word:
  - `record`: the cloud session wrote the episodes and the brief, and the voices are wanted.
  - `recorded`: the local session pushed the WAVs to `incoming/<batch>/`.
  - `done`: the cloud session built and delivered the episodes.
- The brief for each batch is `docs/briefs/<batch>/recording_message.md`.

## Local session (user's laptop, Claude in Chrome, Remote Control on), started once with /loop
Every ~30 minutes:
1. Run `git pull origin ccr-3b18907e-5bki3m`.
2. For each `queue/*.status` that says `record`:
   - Record it in AI Studio by following `docs/briefs/<batch>/recording_message.md` exactly.
   - Save the files as `incoming/<batch>/r1.wav`, `r2.wav`, `r3.wav` with a `manifest.txt`.
   - Set the status to `recorded`, then commit and push.
   - Notify the cloud session: SendMessage to `session_01AGkU7xrbvxEyJ1BmPLBUAN` "VOICES READY: <batch>" if it is reachable. Otherwise do nothing more: the cloud session checks the queue on its own.
3. If there is nothing to record, end the iteration quietly.

## Cloud session (this repo's builder)
- **Daily writer:** a scheduled task writes the next pair of episodes and the brief, sets `queue/<next>.status` to `record`, and pushes.
- **Checker:** after writing, it re-checks the queue hourly. On `recorded`, it maps the lines, builds, renders and sends both vertical episodes, their covers and the invention cards to the user, then sets the status to `done` and pushes.
- **Posting:** two new episodes a day, at 7 PM and 12 AM Cairo time. The user posts them (posting can't be automated from here).
