Open Google AI Studio → Generate speech (TTS). Model: Gemini 3.8 Flash TTS.
These are the voices for ONE episode («البوتاجاز النووي»). Make 3 separate recordings.
For each recording:
1. Set the speakers to the voices listed.
2. Add the speech blocks in the exact order shown. In multi-speaker mode speakers alternate automatically (1, 2, 1, 2...).
3. Paste each block's Style into the block's style box, and its Text into the text box. Leave the "[long pause]" tags exactly as written.
4. Run, wait until the audio finishes, then download the WAV. If a run fails or comes out obviously short, run it again. Don't edit the text.
Keep the delivery snappy, with no long dramatic pauses inside a line (except at the [long pause] tags).

==================================================
RECORDING 1 (multi-speaker): Speaker 1 = Orus (Ibrahim, the inventor father), Speaker 2 = Puck (Hamada, 16-year-old son)
==================================================
Block 1 (Speaker 1, Ibrahim)
Style: Egyptian Arabic, Cairo dialect, natural comedic acting, fast. A proud, overexcited inventor unveiling a gadget like a TV presenter.
Text: ولا يهمك... قدامك: البوتاجاز النووي تلاتة آلاف!

Block 2 (Speaker 2, Hamada)
Style: Egyptian Arabic, Cairo dialect, natural comedic acting. Unimpressed and sarcastic, listing the parts.
Text: ده السشوار... والمكوة... ودفاية تيتة!

Block 3 (Speaker 1, Ibrahim)
Style: Egyptian Arabic, Cairo dialect, natural comedic acting. Explaining like a genius scientist, very sure of himself.
Text: حرارة السشوار، على حرارة المكوة، على حرارة الدفاية... يبقى نار.

Block 4 (Speaker 2, Hamada)
Style: Egyptian Arabic, Cairo dialect, natural comedic acting. Practical and tired, like stating the obvious.
Text: بابا... الأنبوبة بتتباع على الناصية بستين جنيه.

Block 5 (Speaker 1, Ibrahim)
Style: Egyptian Arabic, Cairo dialect, natural comedic acting. Part 1: wise and dramatic, a lesson about science. Part 2: calm and reassuring, then giving an order.
Text: الفلوس مش كل حاجة يا حمادة... العلم أهم. [long pause] اطمني يا أم حمادة... أنا عامل حسابي. شغّل يا حمادة.

Block 6 (Speaker 2, Hamada)
Style: Egyptian Arabic, Cairo dialect, natural comedic acting, fast. Part 1: screaming in panic. Part 2: in the dark, scared and stunned.
Text: بابا! السشوار بيطلّع نار! [long pause] بابا... النور قطع في العمارة كلها!

Block 7 (Speaker 1, Ibrahim)
Style: Egyptian Arabic, Cairo dialect, natural comedic acting. Calm and pleased, writing in a notebook like a scientist, in the dark.
Text: ممتاز... نكتب في الكشكول: البوتاجاز اشتغل... والعمارة لأ.

==================================================
RECORDING 2 (multi-speaker): Speaker 1 = Kore (Om Hamada, the mother), Speaker 2 = Gacrux (Abu Samir, old upstairs neighbour)
==================================================
Block 1 (Speaker 1, Om Hamada)
Style: Egyptian Arabic, Cairo dialect, natural comedic acting. Part 1: stressed, calling from the kitchen. Part 2: worried and suspicious. Part 3: shocked, looking up at the ceiling.
Text: إبراهيم! الأنبوبة خلصت... والملوخية على النار! [long pause] يا راجل... النور هيقطع! [long pause] الملوخية... لزقت في السقف!

Block 2 (Speaker 2, Abu Samir)
Style: Egyptian Arabic, Cairo dialect, natural comedic acting. A shaky, raspy old man calling out from inside a stuck elevator, annoyed.
Text: يا إبراهيم! أنا محبوس في الأسانسير... تاني!

==================================================
RECORDING 3 (single speaker): Algenib (English announcer)
==================================================
Style: English. A deep, gravelly video-game announcer voice, dramatic and deadpan, not too slow.
Text: Gas: restored. Building: offline.

==================================================
After recording
==================================================
Save as incoming/gas-batch/r1.wav, r2.wav, r3.wav, write incoming/gas-batch/manifest.txt (one line per file: `rN.wav <duration s> <what it is>`),
set queue/gas-batch.status to `recorded`, commit and push to origin ccr-3b18907e-5bki3m.
