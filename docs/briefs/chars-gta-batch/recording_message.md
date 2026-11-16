# IMAGE BATCH (not voices): 5 character T-pose drawings in the Gemini web app

Use Claude in Chrome in the Gemini web app (gemini.google.com), logged in to the user's account. Free use only: never pay or start a trial.
Make 5 images in ONE chat, in this order. For each one, send the prompt below with the character's description filled in, and ask for a
vertical 3:4 image. Same style as the Ibrahim T-pose drawing made earlier (stylized realistic 3D game character).

Prompt template:
> Full-body 3D video game character model of <DESCRIPTION>, standing in a strict symmetrical T-pose: arms stretched straight out horizontally
> to both sides, palms facing down, fingers slightly apart, legs straight and slightly apart, feet pointing forward, facing the camera directly,
> neutral closed-mouth expression. Style: stylized realistic 3D game character with clean readable shapes, like a modern open-world comedy game.
> Flat even studio lighting with no hard shadows, plain light grey background, whole body visible from head to toes with margin,
> straight front view, no text, no props, no floor shadow.

Characters (file name → description):
1. `bastam.png` → a 29-year-old Egyptian car mechanic, slim, brown skin, very short black hair, light stubble, eager friendly face, wearing a red baseball cap, a royal blue mechanic coverall jumpsuit with a small white name patch on the chest, black work boots
2. `asly.png` → a 43-year-old big heavy Egyptian electrician with a large belly, dark tan skin, bald on top with short black hair on the sides, thick black mustache, angry frowning eyebrows, wearing a dirty grey work coverall jumpsuit, black work boots
3. `gazzar.png` → a 30-year-old slim Egyptian mechanic, brown skin, messy curly black hair with a red headband, stubble and a short beard, sleepy half-closed dreamy eyes, wearing an old olive green work shirt with oil stains, dark brown work trousers with a belt, black boots
4. `alamy.png` → a handsome 28-year-old Egyptian man, light brown skin, short neat black hair styled up, clean-shaven, confident smart eyes, wearing a black leather moto jacket open over a black turtleneck, slim grey trousers, polished black shoes, no glasses
5. `samir.png` → a 64-year-old Egyptian man, light tan wrinkled skin, white hair on the sides, thick white mustache, grumpy face, wearing a white knitted skull cap and a plain grey galabiya (long robe down to the ankles), brown leather slippers

Check each image before saving and regenerate (up to 3 tries) if: any part of the body is cropped, the arms are not horizontal and clear of the body,
the legs touch, it is not a straight front view, or there is text or a second figure.
Save the full-size images as `incoming/chars-gta-batch/<file name>`, write `incoming/chars-gta-batch/manifest.txt` (one line per file, tries used),
set `queue/chars-gta-batch.status` to `recorded`, commit and push to origin ccr-3b18907e-5bki3m right away.
