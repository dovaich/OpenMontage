Open Google AI Studio → Generate speech (TTS). Model: Gemini 3.8 Flash TTS.
This is a VOICE-OVER for a real car-repair TikTok of the "Doctor BMW" service center (not a series episode). Make 2 recordings of the SAME text with two different voices, so the user can choose.
1. Single-speaker mode for both recordings.
2. Paste the Style into the style box and the Text into the text box. Leave every "[medium pause]" tag exactly as written: the cloud builder cuts the take at those pauses and lays each line on its own shot.
3. Run, wait until the audio finishes, then download the WAV. If a line is skipped or cut off, run it again. Don't edit the text.
   Each take should be about 35-42 seconds. If one comes out longer than 45 seconds, run it once more and keep the shorter take.

STYLE (same for both recordings):
Egyptian Arabic, Cairo dialect, male. A confident, gripping TikTok voice-over of an expert mechanic telling a short repair story: warm, clear and a bit dramatic, like he's revealing a secret. The first line is low and serious (a hook). The middle lines are brisk and natural, not shouting. The last line is proud and punchy, with a small smile on "دكتور بي إم".

TEXT (same for both recordings):
الجوان ده… كان هيضيّع موتور بي إم كامل. [medium pause] تعالى نرجع من الأول. [medium pause] بي إم تلتمية ستاشر، بموتور إن تلاتاشر… ميّة الردياتير بتنقص كل شوية، ومفيش ولا نقطة على الأرض. [medium pause] يعني الميّة مش بتهرب برّه… دي داخلة جوّه الموتور. [medium pause] فكّينا وش السلندر حتّة حتّة… عشان نوصل للسبب. [medium pause] والسبب كان هنا: الجوان ضارب، والميّة بتعدّي منه جوّه الموتور. [medium pause] قِسنا الوش بالمسطرة والفيلر… سليم ومستوي، مش محتاج قشط. [medium pause] نضّفنا الوش كويس، وجهّزناه للتركيب. [medium pause] جوان جديد… وكل مسمار متربط بالعزم بتاعه. [medium pause] زيت جديد، ميّة جديدة… والميّة مبقتش بتنقص. [medium pause] عربيتك بتخسر ميّة ومش عارف راحت فين؟ متستناش لما الموتور يروح… دكتور بي إم.

==================================================
RECORDING 1 (single speaker): Charon
==================================================
Voice: Charon. Style and Text as above.

==================================================
RECORDING 2 (single speaker): Algieba
==================================================
Voice: Algieba. Style and Text as above.

==================================================
After recording
==================================================
Save as incoming/doctor-bmw-n13-vo/r1.wav (Charon) and r2.wav (Algieba). Write manifest.txt with one line per file:
`r1.wav <duration s> Charon full VO` and `r2.wav <duration s> Algieba full VO`.
Set queue/doctor-bmw-n13-vo.status to `recorded`, commit and push to ccr-3b18907e-5bki3m.
