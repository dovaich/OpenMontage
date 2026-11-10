# مشوار السوق (The Market Run): low-poly cutscene source

Om Hamada hails a tuk-tuk and gets Hoda's flying Tuk-Tuk 3000. She haggles the fare down mid-flight over Cairo, and the tuk-tuk crash-lands on
Shehata's imported-watermelon stall. She then buys the broken melons "two for five" and charges him for the delivery.

- 38.5 s, 4:3, with no episode number. Three sets: the street, the sky over Cairo (with the Nile, the pyramids and a minaret) and the market.
- `scene7.js` is `engine7.js` (the shared engine, Om Hamada, and the street, tuk-tuk, Hoda and Sayed from `../motor-hoda-src`) plus `ep7.js`.
- **The dialogue text is synced to the voice.** `lines.json` stores each line's voiced segments (`vox`, in output seconds), measured from the audio.
  When a line's phrase count (split on ! ؟ . ، …) equals its segment count, each phrase is typed during its own segment. Otherwise words are revealed
  in proportion to voiced time, so the typing pauses in the silences. The English subtitle follows the same progress. See `revealCount()` in `ep7.js`.
- Voices: Google AI Studio via the Claude-in-Chrome extension (Kore = Om Hamada, Fenrir = Hoda, Charon = Shehata, Algenib = announcer).
  The announcer take came in quiet and was raised about 6 dB to match the dialogue.
