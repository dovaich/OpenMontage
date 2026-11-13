# VIDEO BATCH (not voices): animate 7 shots in Google Flow (Veo 3.1)

This batch is **video clips, not TTS**. Use **Google Flow** (labs.google/flow) through Claude in Chrome, logged in to the user's account (Google AI Pro). Don't use any API.
It's a 30-second EXPERIMENT for a future project (El-Alamy and Bestem). The builder will lip-sync every clip to the series voices afterwards, so the mouths only need to move naturally.

## Settings for every clip
- Create a new Flow project named `alamy-tuktuk-flow`.
- Mode: **Frames to Video**. The start frame is the Gemini image named for the shot below; the images are already in the repo at `incoming/alamy-tuktuk-img/`.
- Model: **Veo 3.1 Fast**. Aspect ratio: **9:16 portrait**. Length: **8 seconds**. One output per prompt is enough.
- Keep the camera calm: put "static camera" or a very slow push-in in every prompt. Ask for no on-screen text or subtitles and no music.
- If a clip has broken hands or a face that turns into a different person, regenerate it once and keep the better take.

## The 7 clips (start frame → prompt)
1. **f1_bestem_line1:** start `s4_bestem_scared.jpg`
   "Static camera, close-up. The chubby mechanic with the mustache bursts into panic and shouts at someone off-screen, his mouth clearly moving as he speaks. He says in Egyptian Arabic: \"يا عالمييي! الحق! التوك توك بيتكلم!\" Natural realistic acting, consistent face. Garage ambience only, no music."
2. **f2_alamy_line2:** start `s3_alamy.jpg`
   "Static camera, medium close-up. The man in the black leather jacket stays completely calm and smug, leaning on the workbench, and speaks to someone off-screen, his mouth clearly moving. He says in Egyptian Arabic: \"طبيعي يا بستم... أنا ركّبتله ذكاء اصطناعي.\" Subtle natural acting, consistent face, no music."
3. **f3_bestem_line3:** start `s4_bestem_scared.jpg`
   "Static camera, close-up. The scared mechanic leans in nervously and asks a question, his mouth clearly moving. He says in Egyptian Arabic: \"وهو بيقول إيه بالظبط؟!\" Natural acting, consistent face, no music."
4. **f4_alamy_line4:** start `s5_alamy_phone.jpg`
   "Static camera, medium shot. The man reads from his phone with a deadpan face, then glances up and speaks, his mouth clearly moving. He says in Egyptian Arabic: \"بيقول عايز إجازة يوم الجمعة... وزيادة في المرتب.\" Subtle acting, consistent face, no music."
5. **f5_bestem_line5:** start `s6_bestem_angry.jpg`
   "Static camera, medium shot. The mechanic is outraged and shouts, shaking his pointing finger, his mouth clearly moving. He says in Egyptian Arabic: \"توك توك وعايز مرتب؟! ده أنا ماخدتش زيادة من سنتين!\" Strong but realistic acting, consistent face and hands, no music."
6. **f6_alamy_line6:** start `s7_alamy_smirk.jpg`
   "Static camera, close-up. The man smirks, slowly adjusts his jacket collar with both hands, and says calmly, his mouth clearly moving: \"معلش يا بستم... هو أذكى منك.\" (Egyptian Arabic.) Cool, subtle acting, consistent face, no music."
7. **f7_wide_end:** start `s8_wide.jpg`
   "Static camera, slow push-in. The mechanic on the left holds his head and shakes it in disbelief; the calm man on the right smiles and nods; the green smiley screen on the red tuk-tuk blinks happily. No dialogue, garage ambience only, no music."

## After generating
1. Download each clip (with its audio) as `incoming/alamy-tuktuk-flow/f1_bestem_line1.mp4` … `f7_wide_end.mp4`.
2. Write `incoming/alamy-tuktuk-flow/manifest.txt`, one line per file: `<file> <seconds> <short note>`. Also note how many Flow credits are left.
3. Set `queue/alamy-tuktuk-flow.status` to `recorded`, then commit and push to `ccr-3b18907e-5bki3m`.
4. Notify the builder: `claude -p "CLIPS READY: alamy-tuktuk-flow" --cloud session_01AGkU81213a16kYgGiBniDy`. The builder also watches the branch.
