# مقوّي الواي فاي النووي ٢ (Nuclear Wi-Fi Booster 2): vertical 9:16 source

This is the first episode built to the TikTok format rules in `../SERIES_NOTES.md`. It's vertical, 41.5 s long, opens on its biggest moment, and works on its own.

## The episode
- **Cold open (0–1.4 s):** Abu Samir screams from his balcony upstairs ("مين اللي فاتح النت..."), and the phone counter shows 47 connected devices.
- **REWIND:** "قبلها بدقيقة...".
- **Hook text (1.9–5.2 s):** «لما الجيران يغيّروا باسورد الواي فاي».
- **The story:**
  - Hamada's phone shows «كلمة السر غلط». Ibrahim unveils the **Password Stethoscope 3000**: a doctor's stethoscope taped to a pan on a broom stick, pressed to the ceiling.
  - Upstairs, Abu Samir mutters the new password: «إبراهيم_حرامي». Hamada types it in and connects, and the whole street gets on the Wi-Fi.
  - Abu Samir shouts from upstairs. Ibrahim: «اقفل، اقفل! اعمل نفسك نايم!», a callback to part 1.
- **Ending:** PASSWORD CRACKED, the NEIGHBOR ANGER meter hits MAX, then "يُتبع...".

## Files
- `scene15.js` is built by `build.py` from `engine8.js` (with `W = 540, H = 960`) + `ep15.js`.
- `ep15.js` brings its own portrait dialogue box, `drawDialogueV`: big Lalezar text and an 80 px portrait.
- The frames are 540×960. ffmpeg scales them to 1080×1920 with nearest-neighbour, with a lighter CRT chain (no lens correction).
- `cover.png` is the cover frame with the hook text.
- `assemble.py` builds the dialogue from the 3 AI Studio takes. The cold-open line reuses the first second of Abu Samir's shout.
- `sfx15.py` synthesises the music and SFX, then mixes them with ducking.

Voices: Hamada = Puck, Ibrahim = Orus, Abu Samir = Gacrux (new), Om Hamada = Kore, Announcer = Algenib.
