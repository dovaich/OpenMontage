Open Google AI Studio → Generate speech (TTS). Model: Gemini 3.8 Flash TTS.
These are the voices for ONE episode («الغسالة النووية»). Make 2 separate recordings, both in multi-speaker mode (2 speakers).
For each recording:
1. Set Speaker 1 and Speaker 2 to the voices listed.
2. Add the speech blocks in the exact order shown. Speakers alternate automatically (1, 2, 1, 2...).
3. Paste each block's Style into the block's style box, and its Text into the text box. Leave the "[long pause]" tags exactly as written.
4. Run, wait until the audio finishes, then download the WAV. If a run fails or comes out obviously short, run it again. Don't edit the text.
Keep the delivery snappy, with no long dramatic pauses inside a line (except at the [long pause] tags).

==================================================
RECORDING 1: Speaker 1 = Orus (Ibrahim, the inventor father), Speaker 2 = Puck (Hamada, 16-year-old son)
==================================================
Block 1 (Speaker 1, Ibrahim)
Style: Egyptian Arabic, Cairo dialect, natural comedic acting, fast. A proud, overexcited inventor unveiling a gadget like a TV presenter.
Text: ولا يهمك... قدامك: الغسالة النووية تلاتة آلاف! ركّبتلها موتور التوك توك.

Block 2 (Speaker 2, Hamada)
Style: Egyptian Arabic, Cairo dialect, natural comedic acting. Worried and suspicious, watching the machine shake.
Text: بابا... هي ليه بتتنطط كده؟

Block 3 (Speaker 1, Ibrahim)
Style: Egyptian Arabic, Cairo dialect, natural comedic acting. Completely calm and confident, waving it off.
Text: دي بتسخّن... سيبها تاخد راحتها.

Block 4 (Speaker 2, Hamada)
Style: Egyptian Arabic, Cairo dialect, natural comedic acting, fast. Full panic, shouting.
Text: بابا! دي ماشية! دي خارجة من الحمام!

Block 5 (Speaker 1, Ibrahim)
Style: Egyptian Arabic, Cairo dialect, natural comedic acting. Calm and pleased, writing in a notebook like a scientist.
Text: ممتاز... نكتب في الكشكول: العصر بزيادة... والغسالة بتتمشى.

==================================================
RECORDING 2: Speaker 1 = Kore (Om Hamada, the mother), Speaker 2 = Algenib (English announcer)
==================================================
Block 1 (Speaker 1, Om Hamada)
Style: Egyptian Arabic, Cairo dialect, natural comedic acting. Part 1: fed up and complaining, holding dripping wet clothes. Part 2: screaming in shock from the stairwell.
Text: الغسالة مش بتعصر يا إبراهيم... الهدوم طالعة مية! [long pause] إبراهيم! الغسالة نزلت السلم لوحدها!

Block 2 (Speaker 2, Announcer)
Style: English. A deep, gravelly video-game announcer voice, dramatic and deadpan, not too slow.
Text: Spin cycle: maximum. Washing machine: escaped.

==================================================
After recording
==================================================
Save as incoming/washer-batch/r1.wav and r2.wav, write incoming/washer-batch/manifest.txt (one line per file: `rN.wav <duration s> <what it is>`),
set queue/washer-batch.status to `recorded`, commit and push to origin ccr-3b18907e-5bki3m.
