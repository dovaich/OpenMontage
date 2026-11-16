# Builds dialogue.wav + lines.json/lines.js/env.js for «عاجل!» from the 4 AI Studio takes.
import json, wave, numpy as np
P = "/home/user/OpenMontage/projects/ajel"
SR = 44100
def load(r):
    w = wave.open(f"{P}/assets/audio/google/{r}_44.wav"); return np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(float) / 32768
REC = {r: load(r) for r in ["r1", "r2", "r3", "r4"]}
# id, speaker, rec, a, b, pause_before, ar, en
L = [
 ("nashwa", "r1", 0.24, 6.82, 2.6, "مساء الخير... معاكم نشوى، ودي نشرة «عاجل جدًا». أهم أخبار المنطقة النهارده.", "Good evening... I'm Nashwa, and this is 'Very Urgent News'. Tonight's top local stories."),
 ("nashwa", "r1", 8.59, 17.59, 0.5, "الخبر الأول: انفجار غامض في مطبخ في الدور التالت... والمصادر بتقول إن السبب: غسالة مواعين نفاثة!", "First: a mysterious explosion in a third-floor kitchen... sources blame a jet-powered dishwasher!"),
 ("sayed", "r2", 0.24, 6.79, 2.6, "أنا شُفت كل حاجة... بس الذاكرة تعبانة شوية... الشاي بيفكّرني.", "I saw everything... but my memory's a bit weak... tea helps me remember."),
 ("nashwa", "r1", 26.25, 38.99, 0.4, "حد يجيب لعم سيد شاي... الخبر التاني: الكهربا قطعت عن المنطقة كلها، والسبب طاسة محشي!... وفي نفس اليوم، توكتوك طاير وقع على فرشة بطيخ.", "Someone get Uncle Sayed a tea... Next: a blackout over the whole area, caused by a stuffed-veggies pan!... Same day, a flying tuk-tuk crashed into a melon stall."),
 ("shehata", "r2", 7.55, 14.54, 2.2, "البطيخ المستورد بتاعي اتكسر! والست اشترته اتنين بخمسة... وطلبت توصيل كمان!", "My imported melons got smashed! And the lady bought them two for five... and asked for delivery!"),
 ("nashwa", "r1", 42.42, 48.19, 0.6, "ومعانا في الاستوديو المتهم الأول... قصدي الضيف... المخترع العالمي إبراهيم.", "With us in the studio, the prime suspect... I mean, our guest... the world-famous inventor, Ibrahim."),
 ("dad", "r1", 18.52, 25.56, 0.4, "أنا بنفي كل الاتهامات. الانفجار ده كان تجربة ناجحة جدًا... المطبخ هو اللي ماكانش جاهز.", "I deny all charges. That explosion was a very successful test... the kitchen just wasn't ready."),
 ("nashwa", "r1", 52.52, 54.07, 0.4, "والكهربا يا أستاذ إبراهيم؟", "And the blackout, Mr. Ibrahim?"),
 ("dad", "r1", 39.20, 41.73, 0.35, "الكهربا كانت تعبانة... راحت تاخد بريك.", "The power was tired... it went on a break."),
 ("alamy", "r3", 12.42, 19.81, 0.9, "ألو؟ معاكم العالمي. عايز بس أوضّح حاجة: لقب «العالمي» ده بتاعي... الأستاذ ده واخده من غير إذن.", "Hello? El-Alamy here. Just one correction: the title 'El-Alamy' is mine... this gentleman took it without permission."),
 ("dad", "r1", 48.97, 51.99, 0.35, "من غير إذن إزاي؟! أنا عالمي من قبل ما إنت تتولد!", "Without permission?! I was world-famous before you were born!"),
 ("nashwa", "r1", 58.47, 63.80, 0.5, "خبر أخير وعاجل جدًا... معانا على التليفون: بستم... من السما.", "One last urgent story... on the phone with us: Bastam... from the sky."),
 ("bastam", "r3", 0.11, 4.45, 0.7, "ألوووو! أنا لسه طاير! حد يقول للجزار ينزّلني!", "Hellooo! I'm still flying! Someone tell El-Gazzar to get me down!"),
 ("nashwa", "r1", 64.83, 66.71, 0.35, "بستم... إنت فين بالظبط دلوقتي؟", "Bastam... where exactly are you right now?"),
 ("bastam", "r3", 5.91, 11.23, 0.35, "فوق الأهرامات!... لا لا لا... دي إسكندرية!... يا جزاااار!", "Over the pyramids!... no no no... that's Alexandria!... Gazzaaar!"),
 ("nashwa", "r1", 68.26, 73.96, 0.6, "ونروح للنشرة الجوية: الجو صحو، مع احتمال سقوط بستم على القاهرة الكبرى.", "Now the weather: clear skies, with a chance of Bastam falling over Greater Cairo."),
 ("dad", "r1", 54.55, 57.96, 0.6, "ثانية واحدة... أنا هقوّي إرسال الاستوديو بالمقوّي النووي!", "One second... I'll boost the studio signal with the nuclear booster!"),
 ("nashwa", "r1", 75.27, 77.26, 0.3, "لا لا لا! يا أستاذ إبراهيم، الفيشة لأ!", "No no no! Mr. Ibrahim, not the plug!"),
 ("mom", "r4", 0.11, 2.93, 3.6, "النور قطع تاني؟... إبراهيييييم!", "Power's out again?... IBRAHIIIM!"),
 ("anno", "r4", 3.87, 11.78, 0.9, "", "Broadcast lost. Signal: zero percent. Please stay tuned... from the balcony."),
]
PAD = 0.04
def rms(x): return np.sqrt(np.mean(x ** 2) + 1e-12)
def voiced(x, minsil=0.12):
    hop = int(SR * 0.01); e = np.array([rms(x[i:i + hop]) for i in range(0, len(x) - hop, hop)])
    db = 20 * np.log10(e + 1e-9); sp = db > db.max() - 34
    segs = []; i = 0; n = len(sp)
    while i < n:
        if sp[i]:
            j = i
            while j < n:
                if not sp[j]:
                    k = j
                    while k < n and not sp[k]: k += 1
                    if k - j >= int(minsil * 100) or k == n: break
                    j = k
                else: j += 1
            if j - i > 8: segs.append((i / 100, j / 100))
            i = j
        else: i += 1
    return segs
clips = []
for s, r, a, b, pb, ar, en in L:
    x = REC[r][int((a - PAD) * SR):int((b + PAD) * SR)].copy()
    v = voiced(x); vr = rms(np.concatenate([x[int(p * SR):int(q * SR)] for p, q in v]))
    clips.append([s, r, a, b, pb, ar, en, x, v, vr])
med = np.median([c[9] for c in clips])
t = 0.0; out = []; lines = []
for i, (s, r, a, b, pb, ar, en, x, v, vr) in enumerate(clips):
    t += pb; g = float(np.clip(med / vr, 0.6, 3.0)); y = x * g
    f = int(0.01 * SR); y[:f] *= np.linspace(0, 1, f); y[-f:] *= np.linspace(1, 0, f)
    t0 = round(t, 3); out.append((int(t0 * SR), y)); t1 = round(t0 + len(y) / SR, 3)
    lines.append({"id": f"L{i+1:02d}", "s": s, "t0": t0, "t1": t1, "src": [r, a, b], "gain": round(g, 2), "ar": ar, "en": en,
                  "vox": [[round(t0 + p, 2), round(t0 + q, 2)] for p, q in v]})
    t = t1
for i, l in enumerate(lines): l["gap_after"] = round((lines[i + 1]["t0"] - l["t1"]) if i + 1 < len(lines) else 0.4, 2)
DUR = round(t + 4.2, 1)
buf = np.zeros(int(DUR * SR))
for i0, y in out: buf[i0:i0 + len(y)] += y
buf = np.clip(buf, -1, 1)
w = wave.open(f"{P}/assets/audio/dialogue.wav", "wb"); w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((buf * 32767).astype(np.int16).tobytes()); w.close()
D = {"title": "عاجل!", "voice_source": "Google AI Studio via Claude-in-Chrome (Despina=Nashwa, Orus=Ibrahim, Enceladus=Sayed, Charon=Shehata, Sadachbia=Bastam, Rasalgethi=El-Alamy, Kore=Om Hamada, Algenib=announcer); mapped by gemini-3.5-flash transcript", "dur": DUR, "lines": lines}
json.dump(D, open(f"{P}/artifacts/lines.json", "w"), ensure_ascii=False, indent=1)
open(f"{P}/build/lines.js", "w").write("window.LINES_DATA=" + json.dumps(D, ensure_ascii=False) + ";")
hop = SR // 30; env = np.array([rms(buf[i:i + hop]) for i in range(0, len(buf), hop)]); env = np.clip(env / np.percentile(env[env > 0.003], 95), 0, 1)
open(f"{P}/build/env.js", "w").write("window.ENV=" + json.dumps({"fps": 30, "env": [round(float(e), 3) for e in env]}) + ";")
for l in lines: print(l["id"], l["s"], l["t0"], l["t1"], l["gain"], len(l["vox"]), len([p for p in l["ar"].split(" ") if p]))
print("DUR", DUR)
