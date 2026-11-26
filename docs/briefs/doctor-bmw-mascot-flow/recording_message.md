# VIDEO BATCH (not voices): animate the Doctor BMW cartoon mascot in Google Flow (2 clips)

This batch is **video clips, not TTS**. Use **Google Flow** (labs.google/flow) through Claude in Chrome, logged in to the user's account (Google AI Pro). Don't use any API.
It's the cartoon mascot of the service-center owner, talking in a real repair video. The builder lays its own voice-over on the clips afterwards, so the mouth only needs to move naturally with the line.

## Settings for every clip
- Create a new Flow project named `doctor-bmw-mascot`.
- Mode: **Frames to Video**. The start frame for both clips is `docs/briefs/doctor-bmw-mascot-flow/start_green.png` (in the repo): the cartoon man standing on a flat solid green background.
- Model: **Omni 1.2 Flash** (Flow default). If it can't do Frames to Video with a start image, use **Veo 3.1 Lite**.
  Aspect ratio: **9:16 portrait**. Length: **8 seconds**. One output per prompt is enough.
- If Flow's agent asks for confirmation before generating, confirm.
- The background must stay a **flat solid green screen** the whole clip (the builder keys it out). If the background changes, gets a floor, shadows or a room, or the camera moves, regenerate once and keep the better take.
- If the face turns into a different person, the hair becomes curly, or the hands break, regenerate once and keep the better take.

## The 2 clips (start frame → prompt)
1. **m1_intro:** start `start_green.png`
   "Static locked-off camera, full body. The same 3D cartoon man (same face, same short wavy black hair, same beard, navy polo shirt, cream trousers) stands on a flat solid green screen background and talks warmly to the viewer, smiling, with a small natural hand gesture, his mouth clearly moving as he speaks. He says in Egyptian Arabic: \"بي إم تلتمية خمسة وتلاتين آي، إي تسعين… جاتلنا والفتيس مفوّت.\" Keep the flat solid green background unchanged, no shadows, no floor, no on-screen text, no subtitles, no music."
2. **m2_outro:** start `start_green.png`
   "Static locked-off camera, full body. The same 3D cartoon man (same face, same short wavy black hair, same beard, navy polo shirt, cream trousers) stands on a flat solid green screen background, looks proud and happy, gives a thumbs up and speaks to the viewer, his mouth clearly moving. He says in Egyptian Arabic: \"والعربية خرجت… والنقلات بقت ناعمة.\" Then he keeps smiling. Keep the flat solid green background unchanged, no shadows, no floor, no on-screen text, no subtitles, no music."

## After generating
1. Download each clip (with its audio) as `incoming/doctor-bmw-mascot-flow/m1_intro.mp4` and `m2_outro.mp4`.
2. Write `incoming/doctor-bmw-mascot-flow/manifest.txt`, one line per file: `<file> <seconds> <short note>`. Also note how many Flow credits are left.
3. Set `queue/doctor-bmw-mascot-flow.status` to `recorded`, then commit and push to `ccr-3b18907e-5bki3m`.
