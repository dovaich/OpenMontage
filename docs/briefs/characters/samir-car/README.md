# Abu Samir's car: the 1980 «١٢٨» (recurring prop)

Use `samir_car.js` → `makeSamirCar(parent)` in every episode with the car. It needs the engine8 globals. It returns `{ g, hood, bay, wires, wheels, lamps, late, L, Wd }`. Call `late()` after the fonts load: it draws the plate and the sticker.

- **Scale:** `makeSamirCar(parent, scale = 1.2)`. At the default 1.2 the car is 4.8 long × 2.1 wide with the roof at 1.74, roomy enough for seated characters (seat roots about y 0.08, front seats z ±0.5, back seat x -1.0). The meshes live in the scaled `body` group; attach passengers to the returned `g`, which is unscaled.
- **Look (keep it consistent):**
  - Mustard-orange body with a white roof, chrome bumpers and grille, and round headlamps.
  - Whitewall tyres.
  - One cream replacement door, rust patches and duct tape.
  - A roof rack with a rolled red carpet and a blue butane cylinder.
  - Fuzzy pink dice, a blue evil-eye charm, a «ما شاء الله» sticker on the back, and the plate «س م ر ١٩٨٠».
- **Gags available:**
  - The hood opens (`hood.rotation.z`), and the engine bay has duct-taped wiring.
  - The headlamps "cry": emit sweat drops from the lamp positions.
