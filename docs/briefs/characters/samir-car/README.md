# Abu Samir's car: the 1980 «١٢٨» (recurring prop)

Use `samir_car.js` → `makeSamirCar(parent)` in every episode with the car. It needs the engine8 globals. It returns `{ g, hood, bay, wires, wheels, lamps, late, L, Wd }`. Call `late()` after the fonts load: it draws the plate and the sticker.

- **Scale:** characters are about 1.9 units tall, so the car is 4.0 long × 1.75 wide × 1.45 high, about a real Fiat 128 next to a person.
- **Look (keep it consistent):**
  - Mustard-orange body with a white roof, chrome bumpers and grille, and round headlamps.
  - Whitewall tyres.
  - One cream replacement door, rust patches and duct tape.
  - A roof rack with a rolled red carpet and a blue butane cylinder.
  - Fuzzy pink dice, a blue evil-eye charm, a «ما شاء الله» sticker on the back, and the plate «س م ر ١٩٨٠».
- **Gags available:**
  - The hood opens (`hood.rotation.z`), and the engine bay has duct-taped wiring.
  - The headlamps "cry": emit sweat drops from the lamp positions.
