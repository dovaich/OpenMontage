# عاجل! (Breaking News): low-poly cutscene source

A local TV news bulletin recaps the series' disasters:
- Anchor Nashwa (new character, red blazer) opens «عاجل جدًا».
- Archive footage (sepia, ARCHIVE stamp):
  - The jet dishwasher explodes in the kitchen ("KITCHEN HEALTH: 0%").
  - The nuclear booster's pan sets off a blackout over the whole area.
  - The flying tuk-tuk crashes into Shehata's melon stall.
- Field interviews with a reporter's mic:
  - Uncle Sayed, the eyewitness, wants tea.
  - Shehata wants his imported melons back.
- Ibrahim is the studio guest, introduced as "the prime suspect... I mean, the guest". El-Alamy calls in on a split screen to claim the title "العالمي".
- Bastam reports live from the sky. He's over the pyramids... no, Alexandria.
- The weather map gives a 90% chance of Bastam falling over Greater Cairo.
- Ibrahim plugs in the nuclear booster to "boost the signal": NO SIGNAL.
- At home, Om Hamada sits in the dark: "النور قطع تاني؟... إبراهيييم!" The episode ends on BROADCAST LOST, the achievement «كارثة على الهوا», and "يُتبع...".

## Files
- `scene12.js` is built by `build.py` from `engine8.js` + `alamy.js` + `tuk_block.js` + `ep12.js`. `ep12.js`'s `${BASTAM}` is replaced by `bastam_def.js`.
- Sets sit far apart on the x axis:

  | Set | x |
  |---|---|
  | Studio | 50 |
  | Kitchen | 100 |
  | Market | 200 |
  | Sayed's doorstep | 300 |
  | Blackout night | -400 |
  | El-Alamy's office | -100 |
  | Sky | 2000 |
  | Home (living room) | 0 |

- Split screens render two scissored viewports (`shotAt` returns `split`).
- `assemble.py` builds the dialogue from the 4 AI Studio takes. It writes `dialogue.wav`, `lines.json`/`lines.js` (with `vox`) and `env.js`.
- `sfx12.py` synthesises the news theme, the beds and the SFX, then mixes them with ducking.
- `recording_message.md` is the Claude-in-Chrome recording brief.

## Re-render
```bash
python3 assemble.py && python3 build.py
python3 sfx12.py ../assets/audio/dialogue.wav ../assets/audio/final_mix.wav
python3 -m http.server 8766 --bind 127.0.0.1 &
node render.cjs frames 15
# then the series CRT ffmpeg chain (see ../shibshib-final-boss-src/README.md) with final_mix.wav
```
Voices: Nashwa = Despina, Ibrahim = Orus, Uncle Sayed = Enceladus, Shehata = Charon, Bastam = Sadachbia, El-Alamy = Rasalgethi, Om Hamada = Kore, Announcer = Algenib.
