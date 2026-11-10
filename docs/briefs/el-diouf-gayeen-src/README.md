# الضيوف جايين (Guests Incoming): low-poly cutscene source

Auntie Soad calls: she's coming in ten minutes with her 99%-scoring daughter. The flat goes into a speedrun.
- Hamada hides under the sofa, with his legs sticking out.
- The forbidden salon is opened, with gilded chairs under plastic covers, a chandelier and a dust cloud.
- The china cabinet's glass set appears as a "legendary item".

Then a message arrives: they're not coming. Ibrahim tries to sit in the salon, and Om Hamada orders it locked again.

- 54 s, 4:3, with no episode number.
- `scene8.js` is `engine8.js` (the living room, hallway, characters, and the voice-synced dialogue from `../mishwar-el-souq-src`) plus `ep8.js`.
  The doorway is cut by hiding the original back wall and rebuilding it in three pieces around the salon door.
- Voices: Google AI Studio via the Claude-in-Chrome extension (Kore = Om Hamada, Puck = Hamada, Orus = Ibrahim, Algenib = announcer).
  Every line is normalised to the median voiced level before mixing (`gain` in `lines.json`).
