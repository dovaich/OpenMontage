# IMAGE BATCH (not voices): draw the characters and 8 scenes in Gemini

This batch is **images, not TTS**. Use the Gemini web app (gemini.google.com) through Claude in Chrome, logged in to the user's account. Don't use the API or AI Studio TTS.
It's a 30-second EXPERIMENT for a future project (El-Alamy and Bestem, a realistic late-2000s open-world game look). It is not a series episode.

## Rules
- Do everything in **ONE Gemini chat**, in the order below, so Gemini keeps the same two faces. Start every scene prompt by referring back to the reference images ("the same man from image 1").
- Every image is **vertical 9:16, portrait**. If Gemini returns a square or landscape image, ask: "Regenerate exactly the same image in vertical 9:16."
- Look: a realistic 3D video-game cutscene from the late-2000s open-world crime genre. Realistic human proportions, detailed skin, gritty and desaturated, brown-teal grade, hazy, warm sodium-orange and cold fluorescent light, cinematic.
  Don't name any real game or real person in the prompts.
- If a result has extra fingers, a broken face, text or logos, regenerate it once. Keep the better one.
- Download each image at full size. Gemini's small corner mark is fine: the builder crops it.

## Step 1: reference sheets (2 images)
**ref_alamy:** "Character reference, full body and face, vertical 9:16. A handsome Egyptian man, 28, tan olive skin, clean-shaven (no beard, no mustache), short natural black hair neatly combed with a light textured fringe, sharp confident dark eyes, a calm smug half-smile. He wears an open black leather biker jacket with a band collar and quilted shoulders over a black turtleneck, slim grey trousers and polished black shoes. He stands in a cramped Cairo car-repair garage at night. Realistic late-2000s open-world crime game cutscene render, gritty, desaturated, cinematic."

**ref_bestem:** "Character reference, full body and face, vertical 9:16. A chubby Egyptian mechanic foreman, 29, round face, short curly black hair, a thick black mustache, navy-blue work overalls with straps over a dark grey t-shirt, oil stains, brown work boots. He stands in the same Cairo garage at night. Same realistic late-2000s open-world crime game cutscene render style as the previous image."

## Step 2: the 8 scenes (keep the same two men, the same garage and the same style)
- **s1_bestem_run:** "The same mechanic from image 2 running into the garage toward the camera in panic, mouth open shouting, arms swinging. Medium shot, low angle."
- **s2_tuktuk:** "A red Egyptian tuk-tuk auto-rickshaw with a black canvas roof, parked in the same garage. A glowing green tablet screen is mounted on its front, showing a simple cartoon smiley face as if the tuk-tuk is alive. One headlight on. No people."
- **s3_alamy:** "Medium close-up of the same man from image 1, calm and smug, leaning on a workbench, looking at the camera."
- **s4_bestem_scared:** "Close-up of the same mechanic from image 2, scared, eyebrows raised, eyes wide, sweating, asking a question."
- **s5_alamy_phone:** "The same man from image 1 holding a smartphone in one hand and reading it with a deadpan face, the screen light on his face. Medium shot."
- **s6_bestem_angry:** "The same mechanic from image 2 shouting angrily and offended, pointing his finger. Medium shot."
- **s7_alamy_smirk:** "Close-up of the same man from image 1 with a confident smirk, adjusting his jacket collar with both hands."
- **s8_wide:** "Medium-wide shot: the same mechanic (image 2) on the left holding his head in disbelief, the same man (image 1) on the right smiling calmly, the red tuk-tuk with the smiley screen between them, in the garage."

## After drawing
1. Save them as `incoming/alamy-tuktuk-img/ref_alamy.png`, `ref_bestem.png`, `s1_bestem_run.png` … `s8_wide.png`. Use exactly these names; jpg/webp are fine if that's what Gemini gives.
2. Write `incoming/alamy-tuktuk-img/manifest.txt`, one line per file: `<file> <width>x<height> <short note>`.
3. Set `queue/alamy-tuktuk-img.status` to `recorded`, then commit and push to `ccr-3b18907e-5bki3m`.
4. Notify the builder session that started this batch:
   `claude -p "IMAGES READY: alamy-tuktuk-img" --cloud session_01AGkU81213a16kYgGiBniDy`
   The builder also watches the branch, so the push alone is enough if the notify fails.
