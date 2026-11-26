Open Google AI Studio → Generate speech (TTS). Model: Gemini 3.8 Flash TTS.
VOICE-OVERS for 3 real car-repair TikToks of the "Doctor BMW" service center (not series episodes). Make 3 recordings, all with the voice Algieba.
1. Single-speaker mode. Voice: Algieba for all three.
2. Paste the Style into the style box and the Text into the text box. Leave the "[short pause]" tags exactly as written. Don't edit the text.
3. Run, wait until the audio finishes, then download the WAV.
4. LISTEN to each take before saving it. Run it again (up to 3 tries) if: a word is skipped or cut off; there is a long gap (more than about 1 second) anywhere;
   a number or a code like "إف تلاتين", "بي تمانية وأربعين", "إن تلاتاشر" comes out in English or as digits; or "سِرفِس"/"تيربو" sound wrong. Keep the best take.

STYLE (same for all three):
Egyptian Arabic, Cairo dialect, male. One continuous, flowing voice-over of an expert mechanic describing the work step by step, at a natural, brisk conversational pace: no long pauses, lines flow into each other. Calm, warm and confident, not dramatic. Say "بي إم" as the letters B M. Say the numbers in Egyptian Arabic words exactly as written. A small satisfied tone on the last line.

==================================================
RECORDING 1: water pump (Algieba)
==================================================
Text: بي إم، تلتمية عشرين، إف تلاتين، بموتور بي تمانية وأربعين… جاتلنا عشان نغيّر طرمبة الميّة. [short pause] فكّينا الطرمبة القديمة، [short pause] وجبنا طرمبة جديدة، [short pause] وجهّزناها للتركيب. [short pause] ركّبناها مكانها، [short pause] وكل مسمار اتربط بالعزم بتاعه. [short pause] غسلنا الموتور… [short pause] وقفلنا، والعربية بقت جاهزة.

==================================================
RECORDING 2: gearbox rebuild (Algieba)
==================================================
Text: فتيس بي إم، إف تلاتين… كان مفوّت، واتفك كله عشان العمرة. [short pause] نضّفنا جسم الفتيس كويس، [short pause] وفكّينا الدبرياجات حتّة حتّة… [short pause] وجمّعناها من جديد. [short pause] راجعنا البلف بودي، [short pause] وبعدين ركّبنا كل حاجة جوّه جسم الفتيس… [short pause] وقفلناه، وبقى جاهز يرجع العربية.

==================================================
RECORDING 3: oil filter housing gasket + turbo pipes + full service (Algieba)
==================================================
Text: بي إم، تلتمية ستاشر، إف تلاتين، بموتور إن تلاتاشر… داخلة صيانة كاملة. [short pause] بدأنا نفك من فوق، [short pause] وغيّرنا جوان قاعدة الفلتر. [short pause] فكّينا الحماية اللي تحت الموتور، ونضّفناها كويس. [short pause] وغيّرنا مواسير التيربو، [short pause] وركّبنا كل حاجة مكانها. [short pause] قفلنا الموتور… [short pause] والعربية خرجت جاهزة.

==================================================
After recording
==================================================
Save as incoming/doctor-bmw-3vids-vo/r1.wav (water pump), r2.wav (gearbox), r3.wav (service). Write manifest.txt with one line per file: `r<n>.wav <duration s> <what it is>`.
Set queue/doctor-bmw-3vids-vo.status to `recorded`, commit and push to ccr-3b18907e-5bki3m.
