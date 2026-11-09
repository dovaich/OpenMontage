# Om Hamada / Ibrahim series: standing notes

- **No episode numbers.** Future episodes must not mention an episode number anywhere: not in the title card, not in the end card
  ("EPISODE n"), and not in the script. Use the episode's own name only.
- Production pattern (episodes "Jet Dishwasher 3000", "Shibshib Final Boss", "Nuclear Wi-Fi Booster"):
  - Claude writes the script with a single-voice style block for Google AI Studio. The voice changes tone per character, with
    bracketed cues per line.
  - The user records one WAV and uploads it. Claude splits the lines by silence and pitch.
  - The video is a low-poly Three.js PS2-style cutscene (see `*-src/`). The HUD is in Arabic and English, the music and SFX are synthesised locally,
    and the CRT finishing chain is the same each time.
