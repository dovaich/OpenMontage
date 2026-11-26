# IMAGE BATCH (not voices): fix the hair on the Doctor BMW cartoon mascot

This batch is **images, not TTS**. Use the Gemini web app (gemini.google.com) through Claude in Chrome, logged in to the user's account. Don't use the API or AI Studio TTS.
It's an edit of ONE existing image: the cartoon mascot of the service-center owner. Everything must stay the same except the hair.

## Input
`docs/briefs/doctor-bmw-avatar-hair/input_toon.png` (in the repo). Upload it to a new Gemini chat.

## Prompt (send with the uploaded image)
"Edit this image. Keep EVERYTHING exactly the same: the same cartoon 3D style, the same face, eyes, eyebrows, beard and mustache, the same smile and thumbs-up pose, the same navy polo shirt, cream trousers, shoes, framing, light grey background, and vertical 9:16 size. Change ONLY the hair: make it short, thick, black hair with soft loose natural waves and some volume on top, a bit longer on top and shorter on the sides, gently pushed up. It must NOT be tight curls or an afro. No text."

## Rules
- Make 2 versions in the same chat. For the second one, send: "Make one more version with the same hair idea but slightly flatter and neater on top."
- If the face, clothes or pose change, or the image comes out square/landscape, regenerate it once and keep the better one.
- Download each image at full size. Gemini's small corner mark is fine.

## After drawing
1. Save them as `incoming/doctor-bmw-avatar-hair/hair_1.png` and `hair_2.png` (jpg/webp is fine if that's what Gemini gives).
2. Write `incoming/doctor-bmw-avatar-hair/manifest.txt`, one line per file: `<file> <width>x<height> <short note>`.
3. Set `queue/doctor-bmw-avatar-hair.status` to `recorded`, then commit and push to `ccr-3b18907e-5bki3m`.
