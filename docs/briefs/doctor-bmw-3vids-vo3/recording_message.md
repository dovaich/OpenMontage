Open Google AI Studio → Generate speech (TTS). Model: Gemini 3.8 Flash TTS.
RE-RECORD of the 3 Doctor BMW voice-overs with the NEW LONGER texts below (the previous batch used the old short texts by mistake): this time the chassis and engine codes (F30, B48, N13) must be said in ENGLISH. Make 3 recordings, all with the voice Algieba.
1. Single-speaker mode. Voice: Algieba for all three.
2. Paste the Style into the style box and the Text into the text box. Leave the "[short pause]" tags exactly as written. Don't edit the text.
3. Run, wait until the audio finishes, then download the WAV.
4. LISTEN to each take before saving it. Run it again (up to 3 tries) if: a word is skipped or cut off; there is a long gap (more than about 1 second) anywhere;
   or the codes are NOT said in English: "F30" must sound like "F thirty", "B48" like "B forty-eight", "N13" like "N thirteen" (English letters and English numbers). Keep the best take.

STYLE (same for all three):
Egyptian Arabic, Cairo dialect, male. One continuous, flowing voice-over of an expert mechanic describing the work step by step, at a natural, brisk conversational pace: no long pauses, lines flow into each other. Calm, warm and confident, not dramatic. Say "بي إم" as the letters B M. Say the chassis and engine codes F30, B48 and N13 in ENGLISH, like a mechanic would: "F thirty", "B forty-eight", "N thirteen". Say the model numbers written in Arabic words (تلتمية عشرين, تلتمية ستاشر) in Egyptian Arabic as written. A small satisfied tone on the last line.

==================================================
RECORDING 1: water pump (Algieba)
==================================================
Text: بي إم، تلتمية عشرين، F30، بموتور B48… جاتلنا عشان نغيّر طرمبة الميّة. [short pause] بدأنا نفك الحاجات اللي حوالين الطرمبة، عشان نوصلها براحة من غير ما نأذي أي حاجة جنبها. [short pause] فكّينا الطرمبة القديمة، وطلّعناها من مكانها. [short pause] وجبنا طرمبة جديدة، وطلّعناها من العلبة. [short pause] جهّزناها للتركيب، [short pause] وركّبناها مكانها في الموتور. [short pause] وكل مسمار اتربط بالعزم بتاعه، لا زيادة ولا ناقص. [short pause] وبعد ما خلّصنا، غسلنا الموتور كويس… [short pause] وقفلنا، والعربية بقت جاهزة.

==================================================
RECORDING 2: gearbox rebuild (Algieba)
==================================================
Text: فتيس بي إم، F30… كان مفوّت، فقرّرنا نعمله عمرة كاملة. [short pause] فكّينا الفتيس كله حتّة حتّة، [short pause] ونضّفنا جسم الفتيس كويس من جوّه ومن برّه. [short pause] وبعدين بدأنا نشتغل على الدبرياجات… فكّيناها واحدة واحدة، [short pause] وراجعنا كل جزء فيها، [short pause] وجمّعناها من جديد. [short pause] راجعنا البلف بودي… [short pause] وبعدين ركّبنا كل حاجة جوّه جسم الفتيس، بالترتيب، حتّة ورا التانية. [short pause] وقفلناه… وبقى جاهز يرجع العربية.

==================================================
RECORDING 3: oil filter housing gasket + turbo pipes + full service (Algieba)
==================================================
Text: بي إم، تلتمية ستاشر، F30، بموتور N13… داخلة صيانة كاملة. [short pause] بدأنا نفك من فوق، عشان نوصل لقاعدة الفلتر، [short pause] وغيّرنا جوان قاعدة الفلتر بجوان جديد. [short pause] وبعدين فكّينا الحماية اللي تحت الموتور… [short pause] وغسلناها ونضّفناها كويس، لحد ما رجعت زي الجديدة. [short pause] وجهّزنا مواسير التيربو الجديدة… [short pause] فكّينا القديمة، وركّبنا الجديدة مكانها. [short pause] وبعدين رجّعنا كل حاجة مكانها، حتّة حتّة، [short pause] وراجعنا كل حاجة قبل ما نقفل. [short pause] قفلنا الموتور… [short pause] والعربية خرجت جاهزة.

==================================================
After recording
==================================================
Save as incoming/doctor-bmw-3vids-vo3/r1.wav (water pump), r2.wav (gearbox), r3.wav (service). Write manifest.txt with one line per file: `r<n>.wav <duration s> <what it is>`.
Set queue/doctor-bmw-3vids-vo3.status to `recorded`, commit and push to ccr-3b18907e-5bki3m.
Each take should be about 28-40 seconds (they are longer texts now).
