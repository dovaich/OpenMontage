Open Google AI Studio → Generate speech (TTS). Model: Gemini 3.8 Flash TTS.
RE-RECORD of the Doctor BMW 335i voice-over (the first take had bad pronunciation and long gaps). Make 2 recordings of the SAME text with two voices, so the user can choose.
1. Single-speaker mode for both recordings.
2. Paste the Style into the style box and the Text into the text box. Leave the "[short pause]" tags exactly as written. Don't edit the text.
3. Run, wait until the audio finishes, then download the WAV.
4. LISTEN to each take before saving it. Run it again (up to 3 tries per voice) if ANY of these happen, and keep the best take:
   - "سِرفِس" is not said like the English word "service".
   - "تلتمية خمسة وتلاتين" (335) or "إي تسعين" (E90) comes out wrong or in English digits.
   - a word is skipped or cut off, or the take has a long gap (more than about 1 second) anywhere.
   Each take should be about 22-28 seconds, one continuous flowing read.

STYLE (same for both recordings):
Egyptian Arabic, Cairo dialect, male. One continuous, flowing voice-over of an expert mechanic describing the work step by step, at a natural, brisk conversational pace: no long pauses, lines flow into each other. Calm, warm and confident, not dramatic. Say "سِرفِس" exactly like the English word "service", the way Egyptians say it. Say "بي إم" as the letters B M. Say the numbers in Egyptian Arabic words as written. A small satisfied tone on the last line.

TEXT (same for both recordings):
بي إم، تلتمية خمسة وتلاتين آي، إي تسعين… جاتلنا والفتيس مفوّت. [short pause] رفعنا العربية، وبدأنا نفك من تحت. [short pause] نزّلنا الفتيس القديم، [short pause] وجهّزنا فتيس استيراد للتركيب، [short pause] وركّبناه مكانه. [short pause] رجّعنا الشكمان، [short pause] وعملنا سِرفِس زيت كامل، للموتور وللفتيس… زيت جديد، وفلتر جديد. [short pause] والعربية خرجت… والنقلات بقت ناعمة.

==================================================
RECORDING 1 (single speaker): Algieba
==================================================
Voice: Algieba. Style and Text as above.

==================================================
RECORDING 2 (single speaker): Charon
==================================================
Voice: Charon. Style and Text as above.

==================================================
After recording
==================================================
Save as incoming/doctor-bmw-335i-vo2/r1.wav (Algieba) and r2.wav (Charon). Write manifest.txt with one line per file:
`r1.wav <duration s> Algieba full VO` and `r2.wav <duration s> Charon full VO`.
Set queue/doctor-bmw-335i-vo2.status to `recorded`, commit and push to ccr-3b18907e-5bki3m.
