# Ibrahim's invention cards

These are collectible "invention cards" for the page, 1080×1350 (4:5). Each one shows a low-poly model of an invention from the series,
with its rarity, stats, parts, a quote, the result, and the episode it appeared in (by name, never a number).
- Cards: Jet Dishwasher 3000 (legendary), Nuclear Wi-Fi Booster (epic), Tuk-Tuk 3000 (mythic), Lie Detector 3000 (rare), Pedal Generator 3000 (common) and Password Stethoscope 3000 (epic).
- `cards.js` builds each model, renders it at 470×300 and scales it up with nearest-neighbour for the PS2 look, then draws the card in 2D.
- To add a card for a new invention, add a model function and an entry to `CARDS`.

Render: serve this folder on :8765 with `node_modules` (three + @fontsource lalezar / press-start-2p / reem-kufi).
Run `node rcards.cjs` to write the cards to `../renders/`. Then copy the card PNGs next to `cards.html` and run `node rcover.cjs` for the cover.
