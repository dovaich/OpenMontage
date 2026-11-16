# IMAGE BATCH (not voices): 2 T-pose character drawings in the Gemini web app (for image → 3D)

Use Claude in Chrome in the Gemini web app (gemini.google.com), logged in to the user's account. Free use only. ONE chat, 2 images, vertical 3:4.
These are Om Hamada and Hamada for the 3D-model test (Ibrahim already has his model). The builder turns them into 3D models on Kaggle.

Prompt template:
> Full-body 3D video game character model of <DESCRIPTION>, standing in a strict symmetrical T-pose: arms stretched straight out horizontally
> to both sides, palms facing down, fingers slightly apart, legs straight and slightly apart (clearly separated), feet pointing forward, facing the
> camera directly, neutral closed-mouth expression. Style: stylized realistic 3D game character with clean readable shapes, like a modern open-world
> comedy game. Flat even studio lighting with no hard shadows, plain light grey background, whole body visible from head to toes with margin,
> straight front view, no text, no props, no floor shadow. Vertical 3:4 image.

Characters (file name → description):
1. `om_hamada.png` → a chubby Egyptian housewife in her mid 40s, round friendly face, tan skin, a bright green hijab headscarf wrapped around her
   head and neck, a long loose pink floral house dress (galabiya) with long sleeves down to her ankles, yellow rubber kitchen gloves, blue plastic slippers
2. `hamada.png` → a skinny Egyptian teenage boy, 16 years old, tan skin, messy short curly black hair, a red football jersey t-shirt, black sports
   shorts, white sneakers, black gaming headphones resting around his neck

Check each image and regenerate (up to 3 tries) if any of these fail:
- whole body in frame, nothing cropped; both arms fully horizontal and clear of the body (a true T-pose, not an A-pose);
- exactly two arms, two legs, five fingers per hand; straight front view, not three-quarter;
- plain background, no text, no second figure.

Save full size as `incoming/family-3d-img/<file name>`, write `incoming/family-3d-img/manifest.txt` (one line per file: size and how many tries),
set `queue/family-3d-img.status` to `recorded`, commit and push to origin ccr-3b18907e-5bki3m right away.
