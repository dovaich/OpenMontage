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
