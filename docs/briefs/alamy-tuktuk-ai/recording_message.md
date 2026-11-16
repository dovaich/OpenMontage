Open Google AI Studio → Generate speech (TTS). Model: Gemini 3.8 Flash TTS.
This is a 30-second EXPERIMENT for a future project (an AI-video test with El-Alamy and Bestem). It is not a series episode. Make 2 recordings.
For each recording:
1. Set the speakers to the voices listed.
2. Add the speech blocks in the exact order shown. In multi-speaker mode, speakers alternate automatically (1, 2, 1, 2...).
3. Paste each block's Style into the block's style box, and its Text into the text box.
4. Run, wait until the audio finishes, then download the WAV. If a run fails or comes out obviously short, run it again. Don't edit the text.
Keep the delivery snappy, with no long pauses inside a line.

==================================================
RECORDING 1 (multi-speaker): Speaker 1 = Sadachbia (Bestem, loud young foreman), Speaker 2 = Rasalgethi (El-Alamy, calm smug genius manager)
==================================================
Block 1 (Speaker 1, Bestem)
Style: Egyptian Arabic, Cairo dialect, natural comedic acting. Running in, out of breath, panicking and shouting.
Text: يا عالمييي! الحق! التوك توك بيتكلم!

Block 2 (Speaker 2, El-Alamy)
Style: Egyptian Arabic, Cairo dialect, natural comedic acting. Completely calm and smug, as if this is normal.
Text: طبيعي يا بستم... أنا ركّبتله ذكاء اصطناعي.

Block 3 (Speaker 1, Bestem)
Style: Egyptian Arabic, Cairo dialect, natural comedic acting. Scared and curious, then louder.
Text: وهو بيقول إيه بالظبط؟!

Block 4 (Speaker 2, El-Alamy)
Style: Egyptian Arabic, Cairo dialect, natural comedic acting. Reading from his phone, deadpan.
Text: بيقول عايز إجازة يوم الجمعة... وزيادة في المرتب.

Block 5 (Speaker 1, Bestem)
Style: Egyptian Arabic, Cairo dialect, natural comedic acting. Outraged and offended, shouting.
Text: توك توك وعايز مرتب؟! ده أنا ماخدتش زيادة من سنتين!

Block 6 (Speaker 2, El-Alamy)
Style: Egyptian Arabic, Cairo dialect, natural comedic acting. Smug and gentle, a cruel calm punchline.
Text: معلش يا بستم... هو أذكى منك.

==================================================
RECORDING 2 (single speaker): Algenib (English announcer)
==================================================
Style: English. A deep, gravelly video-game announcer voice, dramatic and deadpan, not too slow.
Text: Mission complete. Tuk-tuk: promoted. Bestem: replaced.

==================================================
After recording
==================================================
Save as incoming/alamy-tuktuk-ai/r1.wav and r2.wav, write manifest.txt, set queue/alamy-tuktuk-ai.status to `recorded`, commit and push to ccr-3b18907e-5bki3m.
IMPORTANT: this batch is built by a DIFFERENT cloud session than usual. Notify this one (not the usual builder):
`claude -p "VOICES READY: alamy-tuktuk-ai" --cloud session_01AGkU81213a16kYgGiBniDy`
(The builder also watches the branch, so the push alone is enough if the notify fails.)
