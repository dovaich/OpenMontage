# السخان النووي (Nuclear Water Heater): vertical 9:16 source

Built from the day2-batch voices, which the local session recorded in AI Studio (`incoming/day2-batch/`).
- **Cold open:** Om Hamada in a steam-filled flat: «إبراهيم! الشقة كلها بقت حمّام بخار!».
- **REWIND** ("قبلها بربع ساعة..."), then the hook «لما السخان يبوظ / في عز الشتا».
- **The story:**
  - Hamada is shivering, blue-skinned.
  - Ibrahim unveils the **Nuclear Water Heater 3000**: a kettle, a hair dryer and a pan, duct-taped to the tank, plus a TURBO button.
  - TURBO: the heater shakes and glows, and the thermometer HUD climbs to boiling. Hamada jumps out red and scalded.
  - Om Hamada stands in the steam. Ibrahim, with a towel on his shoulder: «يبقى نفتحها سبا» (sign: سبا إبراهيم، الدخول ٥٠ جنيه).
- **Ending:** APARTMENT: SAUNA, then "يُتبع...".

## Files
- `scene16.js` is `engine8.js` (W = 540, H = 960) + `vertical_common.js` + `ep16.js`.
- `vertical_common.js` holds the shared pieces:
  - Sets: the bathroom (x = 60), the kitchen (x = 120) and the dining table in the living room.
  - The vertical HUD: hook, rewind, invention card, end card and `drawDialogueV`.
- `assemble_pair.py` builds the dialogue for both episodes of the batch.
- `sfx16.py` synthesises the music and SFX, then mixes them with ducking.
