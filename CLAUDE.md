# OpenMontage

**MANDATORY: Read [`AGENT_GUIDE.md`](AGENT_GUIDE.md) before responding to ANY user message.**

Do not act on the user's request until you have read AGENT_GUIDE.md.
It contains routing rules that determine your first action based on what the user asked.
Skipping it WILL cause you to take the wrong action.

All project instructions are in AGENT_GUIDE.md.

## Delegation — use the Haiku worker for simple tasks

For any task that does not need complex reasoning (searching/reading files, listing,
running simple commands, mechanical edits, summarizing a file or log), delegate it
to the `haiku-worker` subagent (`.claude/agents/haiku-worker.md`, runs on the Haiku
model) via the Agent tool. Keep complex reasoning, creative decisions and pipeline
direction in the main agent.

## Om Hamada TikTok series (the user's ongoing project)
If the user asks for an episode/حلقة, a script, or anything about Om Hamada / Ibrahim / Hamada / the service center,
read `docs/briefs/NEW_CHAT_START.md` FIRST (then `docs/briefs/SERIES_NOTES.md`). That series uses its own Three.js engine and
the laptop recording queue, not the OpenMontage pipelines.

## Local recorder on the laptop: no loops, no self-messages
Waiting for new batches is done by `watcher.ps1` (a PowerShell script, outside Claude; started from `start-watcher.bat` on the Desktop).
It runs `git fetch` every 20 seconds and, when a `queue/<batch>.status` says `record`, starts a fresh `claude -p` session to record it.
A local session must NEVER start its own watcher, `/loop`, Monitor, cron, scheduled task or wakeup, and never send messages to itself.
Record the batches you were given (see `docs/briefs/AUTOPILOT.md`), push, and finish.
