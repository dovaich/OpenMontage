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

### Casting decision (final, picked by measured expressiveness; the user delegated the choice)
| Character | Voice ID | Why |
|---|---|---|
| Om Hamada | `ar-eg-advisor-9` | Egyptian female; when shouting, f0 ≈ 312 Hz with a 218 Hz range (the other candidate's range was 113 Hz) |
| Ibrahim | `ar-eg-advisor-7` | Egyptian male, low (≈117 Hz) and "witty"; range 204 Hz (the other candidate's was 67 Hz, which sounds flat) |
| Hamada | `ar-eg-advisor-8` | Egyptian male, high (≈186 Hz, clearly above Ibrahim); range 157 Hz (the MSA alternative's was 49 Hz) |
| Abu Samir | `ar-eg-assistant-3` | The only elderly Egyptian male (64, deep). Give him a shaky, raspy old-man style to separate him from Ibrahim |
| Announcer | `algenib` | English, gravelly and low; range 304 Hz |

### Free-tier workflow (user chose to stay free: 10 requests/day on 3.8)
- Send several lines per request, never one request per line. 3.8 multi-speaker takes **2 speakers per request**, so group lines in script order into
  about 3 requests (for example mom + Hamada, Ibrahim + Abu Samir, announcer alone). Use the audio-profile/transcript layout with one style note per
  speaker. Leave a clear pause between lines, then split on silence and assign the pieces by order and pitch.
- Count the lines in each result; if one is missing, regenerate only that line. Keep the remaining requests as retry budget.

## Recording in Google AI Studio through the Claude-in-Chrome extension (current route)
- Claude writes the episode, then hands the user one copy-paste message for the extension. The extension records in AI Studio and downloads the WAVs,
  the user uploads them to the session, and Claude builds the video.
- What the free AI Studio account offers (checked by the extension):
  - Gemini 3.8 Flash TTS is selectable.
  - **No Egyptian/Arabic voices** are listed, and the language filter has no Arabic. Native `ar-eg-*` voices need a paid API key linked in AI Studio.
  - The page uses **speech blocks**, each with its own Style. Speakers **alternate automatically** (1, 2, 1, 2...) and a block's speaker cannot be chosen.
    So two consecutive lines by the same character must be merged into one block, with a long pause written between them.
  - Two speakers per recording, so split scenes into runs of two speakers, plus a single-speaker run for the announcer.
- Voices used for this route (standard Gemini voices; the style prefix asks for an Egyptian Cairene dialect):
  - Hoda (young tuk-tuk driver): **Fenrir**
  - Uncle Sayed (old doorman): **Enceladus**
  - Ibrahim: **Orus**
  - Announcer: **Algenib**
  - Om Hamada: **Kore**
  - Shehata (market fruit seller): **Charon**
  - Hamada: **Puck**
- Splitting the runs: segment on silence and assign speakers by pitch. Hoda's lines sit around 250–410 Hz, while Sayed and Ibrahim sit around 85–140 Hz.

## Characters so far
- Main: Om Hamada, Ibrahim (the inventor), Hamada (16, gamer).
- Recurring: Abu Samir (upstairs neighbour, Wi-Fi owner), Hoda (tuk-tuk driver, owns the flying Tuk-Tuk 3000), Uncle Sayed (doorman), Shehata (market fruit seller).
- Running gags: the Jet Dishwasher 3000 tuk-tuk engine, the balcony as punishment, game-HUD overlays, and endings with an achievement or unlock screen.

## Dialogue text must follow the voice (standing rule since "The Market Run")
- For every line, measure the voiced segments inside its audio (`vox` in `lines.json`) and type the Arabic text against them.
  Use phrase-per-segment when the counts match, and word-by-voiced-time otherwise. The reference is `revealCount()` and `drawDialogue()` in
  `docs/briefs/mishwar-el-souq-src/ep7.js`. Don't go back to fixed-speed typing.
- Normalise every line to the median voiced RMS when assembling the dialogue track, clamping the gain to 0.6–3.0 (see `docs/briefs/el-diouf-gayeen-src`).
  The announcer takes from AI Studio usually come in quiet.
- AI Studio downloads use their own file names (`Generated_Audio_<date>.wav`). Identify the runs by line count, pitch and the English announcer, not by name.
