# Builds dialogue.wav + lines.json/lines.js/env.js for «فين التوكتوك؟» from the 5 AI Studio takes.
import json, wave, numpy as np
P = "/home/user/OpenMontage/projects/fein-eltoktok"
SR = 44100
def load(r):
    w = wave.open(f"{P}/assets/audio/google/{r}_44.wav"); return np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(float) / 32768
REC = {r: load(r) for r in ["y1", "y2", "y3", "y4", "y5"]}
# id, speaker, rec, a, b, pause_before, ar, en
L = [
 ("hoda", "y1", 0.28, 4.51, 3.4, "يا جماعة! حد شاف توكتوك أحمر... طاير... ومعاه واحد اسمه بستم؟", "Guys! Anyone seen a red tuk-tuk... flying... with a guy called Bestem?"),
 ("alamy", "y1", 5.33, 11.00, 0.4, "آخر مرة شفناه، كان طالع على الغلاف الجوي... وبستم كان بيزعق: يا جزار.", "Last time we saw it, it was heading for the atmosphere... and Bestem was yelling: Gazzar."),
 ("hoda", "y1", 11.55, 12.47, 0.35, "طب نزل فين؟!", "So where did it land?!"),
 ("alamy", "y1", 13.08, 17.23, 0.4, "حسب حساباتي... يا إما إسكندرية... يا إما بلكونة.", "By my calculations... either Alexandria... or a balcony."),
 ("hoda", "y2", 0.21, 2.57, 3.2, "يا عم شحاتة! شفت التوكتوك بتاعي؟", "Uncle Shehata! Have you seen my tuk-tuk?"),
 ("shehata", "y2", 3.32, 7.20, 0.4, "توكتوكك؟! ده اللي كسّر البطيخ المستورد! هات فلوس البطيخ الأول!", "YOUR tuk-tuk?! It smashed my imported melons! Pay for the melons first!"),
 ("hoda", "y2", 8.22, 10.43, 0.35, "بطيخ إيه؟! ده أنا لسه بدوّر على رزقي!", "What melons?! I'm still looking for my livelihood!"),
 ("shehata", "y2", 11.32, 13.73, 0.4, "خلاص... اتنين بخمسة... وتشيلهم معاك.", "Fine... two for five... and you carry them."),
 ("hoda", "y3", 0.37, 2.77, 3.6, "يا عم سيد... ما تقولش الشاي بيفكّرك!", "Uncle Sayed... don't say tea helps you remember!"),
 ("sayed", "y3", 3.52, 7.86, 0.4, "لا يا حودة... المرة دي البطيخ هو اللي بيفكّرني.", "No, Hoda... this time it's watermelon that helps me remember."),
 ("sayed", "y3", 9.04, 12.92, 1.8, "الدور التالت... البلكونة الوحيدة اللي منوّرة في المنطقة.", "Third floor... the only balcony with lights on in the whole area."),
 ("hoda", "y4", 0.04, 2.34, 3.4, "التوكتوك بتاعي!... مربوط في الفيشة؟!", "My tuk-tuk!... plugged into the socket?!"),
 ("dad", "y4", 3.03, 6.73, 0.4, "ده مش توكتوك يا حودة... ده بقى محطة كهربا العمارة.", "That's not a tuk-tuk anymore, Hoda... it's the building's power station."),
 ("hoda", "y4", 7.49, 9.80, 0.35, "محطة كهربا؟! عيالي هياكلوا منين؟!", "A power station?! How will my kids eat?!"),
 ("dad", "y4", 10.53, 15.08, 0.4, "ولا يهمك... هندفعلك إيجار: كل شهر... واحد في المية شحن.", "Don't worry... we'll pay you rent: every month... one percent charge."),
 ("mom", "y5", 0.23, 4.99, 0.7, "حودة... لو شيلت التوكتوك، العمارة كلها هتضلم... ادخل اتعشى.", "Hoda... if you take the tuk-tuk, the whole building goes dark... come have dinner."),
 ("hoda", "y4", 15.91, 16.52, 0.4, "بجد يا حاجة؟!", "Really, Hagga?!"),
 ("mom", "y5", 6.00, 9.06, 0.4, "آه... بس على البلكونة. إنتوا الأربعة!", "Yes... but on the balcony. All four of you!"),
 ("anno", "y5", 10.19, 19.69, 1.8, "", "Quest complete: tuk-tuk found. Balcony capacity: four of three. Warning: overload."),
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
DUR = round(t + 5.5, 1)
buf = np.zeros(int(DUR * SR))
for i0, y in out: buf[i0:i0 + len(y)] += y
buf = np.clip(buf, -1, 1)
w = wave.open(f"{P}/assets/audio/dialogue.wav", "wb"); w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((buf * 32767).astype(np.int16).tobytes()); w.close()
D = {"title": "فين التوكتوك؟", "voice_source": "Google AI Studio via Claude-in-Chrome (Fenrir=Hoda, Rasalgethi=El-Alamy, Charon=Shehata, Enceladus=Sayed, Orus=Ibrahim, Kore=Om Hamada, Algenib=announcer); mapped by gemini-3.5-flash transcript", "dur": DUR, "lines": lines}
json.dump(D, open(f"{P}/artifacts/lines.json", "w"), ensure_ascii=False, indent=1)
open(f"{P}/build/lines.js", "w").write("window.LINES_DATA=" + json.dumps(D, ensure_ascii=False) + ";")
hop = SR // 30; env = np.array([rms(buf[i:i + hop]) for i in range(0, len(buf), hop)]); env = np.clip(env / np.percentile(env[env > 0.003], 95), 0, 1)
open(f"{P}/build/env.js", "w").write("window.ENV=" + json.dumps({"fps": 30, "env": [round(float(e), 3) for e in env]}) + ";")
for l in lines: print(l["id"], l["s"], l["t0"], l["t1"], l["gain"], len(l["vox"]), len([p for p in l["ar"].split(" ") if p]))
print("DUR", DUR)
