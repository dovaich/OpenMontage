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
- The Default environment has a network secret for `generativelanguage.googleapis.com`, sent as the `x-goog-api-key` header. Scripts send a dummy key
  and the proxy replaces it.
- Use **`gemini-2.5-flash-preview-tts`** with the *prefix* prompt form `"<direction>: <line>"`. That speaks only the line.
  - `gemini-3.8-flash-tts` reads the direction aloud and rejects `systemInstruction`.
  - `gemini-2.5-pro-preview-tts` returns 429 (no free quota on this key).
- Generate one call per line (`docs/briefs/tools/gemini_line_tts.py out.wav prefix "<direction>" "<line>" Puck gemini-2.5-flash-preview-tts`).
  This way no line gets dropped and timings are exact. The test voice was Puck.
