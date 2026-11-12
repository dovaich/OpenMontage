Open Google AI Studio → Generate speech (TTS). Model: Gemini 3.8 Flash TTS.
This is a 40-second EXPERIMENT for a future project (an El-Alamy "open-world mission" test). It is not a series episode. Make 2 recordings.
For each recording:
1. Set the speakers to the voices listed.
2. Add the speech blocks in the exact order shown. In multi-speaker mode, speakers alternate automatically (1, 2, 1, 2...).
3. Paste each block's Style into the block's style box, and its Text into the text box. Leave the "[long pause]" tags exactly as written.
4. Run, wait until the audio finishes, then download the WAV. If a run fails or comes out obviously short, run it again. Don't edit the text.
Keep the delivery snappy, with no long dramatic pauses inside a line (except at the [long pause] tags).

==================================================
RECORDING 1 (multi-speaker): Speaker 1 = Sadachbia (Bestem, loud young foreman), Speaker 2 = Rasalgethi (El-Alamy, calm smug genius manager)
==================================================
Block 1 (Speaker 1, Bestem)
Style: Egyptian Arabic, Cairo dialect, natural comedic acting. A loud young mechanic shouting across a garage in panic.
Text: يا عالمييييي! الزبون جاي بعربية بتطلّع دخان!

Block 2 (Speaker 2, El-Alamy)
Style: Egyptian Arabic, Cairo dialect, natural comedic acting. A calm, smug young genius, slow and cool, like a movie hero.
Text: دخان؟ ده مش عطل يا بستم... دي رسالة.

Block 3 (Speaker 1, Bestem)
Style: Egyptian Arabic, Cairo dialect, natural comedic acting, fast. Panicking and shouting.
Text: رسالة إيه يا عم؟! العربية بتولّع!

Block 4 (Speaker 2, El-Alamy)
Style: Egyptian Arabic, Cairo dialect, natural comedic acting. Calm and confident, opening his laptop.
Text: سيبني أوصّل اللابتوب... العربية دي محتاجة تحديث سوفتوير.

Block 5 (Speaker 1, Bestem)
Style: Egyptian Arabic, Cairo dialect, natural comedic acting. Shocked and outraged.
Text: سوفتوير؟! دي فيات موديل سبعين!

Block 6 (Speaker 2, El-Alamy)
Style: Egyptian Arabic, Cairo dialect, natural comedic acting. Part 1: smug and wise. Part 2: reading a progress bar, getting excited. Part 3: after an explosion, completely calm and deadpan, covered in soot.
Text: وعشان كده... فاتها تحديثات كتير. [long pause] جاري التحميل... تسعة وتسعين في المية... [long pause] اهدوا يا جماعة... أنا عملت ريستارت للعربية.

==================================================
RECORDING 2 (single speaker): Algenib (English announcer)
==================================================
Style: English. A deep, gravelly video-game announcer voice, dramatic and deadpan, not too slow.
Text: Mission: fix the car. Reward: respect. [long pause] Mission failed. Car health: zero percent. Respect: still loading.

==================================================
After recording
==================================================
Save as incoming/alamy-gta-test/r1.wav and r2.wav, write manifest.txt, set queue/alamy-gta-test.status to `recorded`, commit and push to ccr-3b18907e-5bki3m.
IMPORTANT: this batch is built by a DIFFERENT cloud session than usual. Notify this one (not the usual builder):
`claude -p "VOICES READY: alamy-gta-test" --cloud session_01AGkU81213a16kYgGiBniDy`
(The builder also watches the branch, so the push alone is enough if the notify fails.)
