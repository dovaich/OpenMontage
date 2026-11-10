# Om Hamada / Ibrahim series: standing notes

- **No episode numbers.** Future episodes must not mention an episode number anywhere: not in the title card, not in the end card
  ("EPISODE n"), and not in the script. Use the episode's own name only.
- Production pattern (episodes "Jet Dishwasher 3000", "Shibshib Final Boss", "Nuclear Wi-Fi Booster"):
  - Claude writes the script with a single-voice style block for Google AI Studio. The voice changes tone per character, with
    bracketed cues per line.
  - The user records one WAV and uploads it. Claude splits the lines by silence and pitch.
  - The video is a low-poly Three.js PS2-style cutscene (see `*-src/`). The HUD is in Arabic and English, the music and SFX are synthesised locally,
    and the CRT finishing chain is the same each time.

## Generating the voices directly (no manual upload)
- The Default environment has a network secret for `generativelanguage.googleapis.com`, sent as the `x-goog-api-key` header. Scripts send a placeholder key
  and the proxy replaces it.
- **Model: `gemini-3.8-flash-tts`** (the user's choice). It works through `generateContent` only. The Interactions API returns 404, and `systemInstruction` is rejected.
- **Style field:** use `docs/briefs/tools/gemini38_line.py`. It sends `# AUDIO PROFILE\n<style>\n\n## TRANSCRIPT\n<line>`, the same thing AI Studio's
  style box does: the profile is performed, not read. A plain `"<style>: <line>"` prefix, or the style as a separate part, gets read aloud on 3.8.
- **A different voice per character.** There are native Egyptian Arabic voices (`ar-eg-*`), for example: mom `ar-eg-advisor-9` or `ar-eg-assistant-12`,
  Ibrahim `ar-eg-assistant-11` or `ar-eg-advisor-7`, Hamada `ar-eg-advisor-8` or `ar-001-commercial-3`, Abu Samir `ar-eg-assistant-3`,
  and the announcer `algenib` (English).
  Final picks: see the casting decision below once the user chooses.
- **Quota:** the free tier allows only **10 requests per day per model** on 3.8 flash TTS. One call per line does not fit an episode (13+ lines)
  unless billing is enabled on the key.
