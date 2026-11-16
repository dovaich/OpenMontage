# IMAGE BATCH (not voices): 3 car drawings in the Gemini web app (for image → 3D)

Use Claude in Chrome in the Gemini web app (gemini.google.com), logged in to the user's account. Free use only. ONE chat, 3 images, landscape 4:3.

Prompt template:
> 3D video game car model of <DESCRIPTION>. Style: stylized realistic early-2000s open-world game car, clean readable shapes, glossy paint with
> soft reflections. Front three-quarter view from slightly above, the whole car visible with margin, wheels straight, doors closed.
> Flat even studio lighting, plain light grey background, no floor shadow, no text, no people, no logos.

Cars (file name → description):
1. `samir128.png` → a small boxy 1980 four-door sedan, mustard-orange paint with a white roof, chrome bumpers and chrome grille with round headlights, whitewall tyres with chrome hubcaps, a little dented and dusty, a roof rack
2. `sedan_grey.png` → a 4-door sedan, dark gunmetal grey paint, chrome rectangular grille, rectangular headlights with orange corner lights, dark tinted windows, silver five-spoke alloy wheels, small rear spoiler
3. `sedan_red.png` → a 4-door sedan, dark cherry red paint, black grille, rectangular headlights, dark tinted windows, silver alloy wheels

Check each image and regenerate (up to 3 tries) if the car is cropped, not a front three-quarter view, or has text/people.
Save full size as `incoming/cars-gta-batch/<file name>`, write `incoming/cars-gta-batch/manifest.txt`, set `queue/cars-gta-batch.status` to `recorded`,
commit and push to origin ccr-3b18907e-5bki3m right away.
