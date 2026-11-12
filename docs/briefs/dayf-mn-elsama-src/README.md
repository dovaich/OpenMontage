# ضيف من السما (A Guest from the Sky): low-poly cutscene source

This episode continues straight from «عاجل!». The power is still out. Ibrahim and Hamada are stuck on the balcony with a candle.
- Ibrahim unveils the **Pedal Generator 3000**: Hamada's bike on a stand, with a dynamo, the fan and a bulb. Fifteen minutes of pedalling charges the phone by 1%. "So now it's two percent! That's an achievement!"
- WARNING: INCOMING. Bestem crash-lands the flying Tuk-Tuk 3000 on the balcony. The laundry flies, the mattress gets squashed and the candle goes out. "Where am I?... Is this Alexandria?" / "No, son... this is the balcony."
- Om Hamada comes out with a candle. Bestem asks for a charger.
- Ibrahim plugs the tuk-tuk's still-running engine into the flat: POWER RESTORED. The door, the window and the whole street light up in a wave.
- Bestem asks to stay for dinner. Om Hamada: "Fine... but on the balcony. All three of you!"
- Ending: NEW PARTY MEMBER: Bestem, BALCONY CAPACITY 3/3, ELECTRICITY: BORROWED, then "يُتبع...".

## Files
- `scene13.js` is built by `build.py` from `engine8.js` (the balcony set, mom/dad/son) + `tuk_block.js` + `ep13.js`. `ep13.js`'s `${BASTAM}` is replaced by `bastam_def.js`.
- `assemble.py` builds the dialogue from the 3 AI Studio takes.
- `sfx13.py` synthesises the music and SFX, then mixes them with ducking.
- `recording_message.md` is the Claude-in-Chrome recording brief.
- The new invention card «مولّد البدّال ٣٠٠٠» is in `../invention-cards-src`.

Voices: Hamada = Puck, Ibrahim = Orus, Bestem = Sadachbia, Om Hamada = Kore, Announcer = Algenib.
