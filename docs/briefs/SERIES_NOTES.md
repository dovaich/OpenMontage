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

## Mapping takes to lines: use a transcript, not pitch
- Pitch-based speaker guesses failed on the Lie Detector take: Kore read at about 125 Hz in places, and Orus and Puck overlap.
  Transcribe each take first with `docs/briefs/tools/gemini_transcribe.py <wav> gemini-3.5-flash`. If that returns 503 (busy), use `gemini-3.5-flash-lite`.
  This uses the same `generativelanguage.googleapis.com` secret, and these text models have their own free quota, separate from TTS.
  Then snap the transcript's line boundaries to the measured silence gaps.
- `gemini-2.5-flash` is no longer offered to new keys. `gemini-3.5-transcribe` rejects JSON mode. `gemini-3.8-flash` often returns 503.

## Invention cards (page posts)
- `docs/briefs/invention-cards-src/` makes the collectible cards and the "collect them all" cover. When Ibrahim builds a new invention in an episode,
  add a card for it there, so the set keeps growing with the series.

## Service-center cast (introduced in "The Service Center")
| Character | Age | Traits | AI Studio voice |
|---|---|---|---|
| Bestem (بستم) | 29 | Technicians' foreman. Always shouting someone's name, understands nothing about technology | Sadachbia |
| El-Alamy (العالمي) | 28 | Center manager. Handles the computer, tuning and admin. Everyone loves him, but he thinks nobody understands anything | Rasalgethi |

**El-Alamy's look (user request, applies to every episode after "The Service Center"):** NO glasses. A handsome, sharp-dressed young man:
black moto leather jacket (band collar with a snap, quilted shoulders) worn open over a black turtleneck, slim grey trousers, polished black shoes, short black hair all one colour (no beard, no moustache, no bow tie). Model: docs/briefs/characters/el-alamy/alamy.js.
He is a genius: confident, calm, smart eyes (not the tired face). Drop the `glasses` face option and the plain polo model used in "The Service Center".
| El-Asly (الأصلي) | 43 | Heavy electrician. Always shouting and wants to hit someone | Alnilam |
| El-Gazzar (الجزار) | 30 | Brilliant mechanic, always "spaced out". Keep it implicit: no drug imagery, for platform safety | Umbriel |
- Running gag: Ibrahim calls himself "the world-famous inventor" (المخترع العالمي), which clashes with El-Alamy's name.
- More characters will be added later. Record each new one here with their voice.

## News cast (introduced in «عاجل!»)
| Character | Traits | AI Studio voice |
|---|---|---|
| Nashwa (نشوى) | News anchor of the local channel «عاجل جدًا». Calm and formal, but loses it with every story. Red blazer, white blouse, dark bob | Despina |
- The channel «عاجل جدًا» can come back: field reporter interviews, archive recaps, the weather map, NO SIGNAL gags.

