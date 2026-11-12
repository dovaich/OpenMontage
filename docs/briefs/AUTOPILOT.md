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
