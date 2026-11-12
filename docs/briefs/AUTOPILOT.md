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

## Cloud session (this repo's builder): ON DEMAND, no fixed schedule
- The user writes in the cloud session, for example «اعملي حلقة عن كذا». The cloud session then:
  1. Writes the episode(s) and `docs/briefs/<batch>/recording_message.md`, sets `queue/<batch>.status` to `record`, and pushes.
  2. Schedules its own short follow-up checks with send_later (about every 15–20 min, limited to that batch) until the status turns `recorded`.
  3. Builds the vertical episode(s), covers and invention cards, sends them to the user, sets the status to `done`, and pushes.
- There are no daily scheduled tasks: episodes are made only when the user asks.
- The user posts on TikTok (7 PM / 12 AM). Posting can't be automated from here.
