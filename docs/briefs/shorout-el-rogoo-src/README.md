# شروط الرجوع (Terms of Return): low-poly cutscene source

Om Hamada lets Ibrahim and Hamada back in from the balcony, on conditions shown as an in-game "house rules" tutorial and a
Terms & Conditions dialog. Both accept without reading. The power comes back, the Jet Dishwasher engine is still plugged in,
chaos follows, and an "Achievement unlocked: Balcony resident" toast plays before they are sent back out.

- 41.3 s, 4:3, with no episode number (see `../SERIES_NOTES.md`).
- `scene5.js` is `engine5.js` (the room, hallway and balcony from the earlier sources) plus `ep5.js`, with `${SHARED}` replaced by `ep5_shared.js`
  (the characters and the upper balcony from the Wi-Fi episode).
- Voice: the user's Google AI Studio take, matched to lines by silence, pitch and spectral centroid. The announcer line L12 was missing from the take,
  so it was filled with edge-tts `en-US-GuyNeural` (marked in `lines.json`).
- `sfx5.py` is the locally synthesised score and SFX.
