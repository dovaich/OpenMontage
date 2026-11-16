# Builds dialogue.wav + lines.json/lines.js/env.js for «ضيف من السما» from the 3 AI Studio takes.
import json, wave, numpy as np
P = "/home/user/OpenMontage/projects/dayf-mn-elsama"
SR = 44100
def load(r):
    w = wave.open(f"{P}/assets/audio/google/{r}_44.wav"); return np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(float) / 32768
REC = {r: load(r) for r in ["x1", "x2", "x3"]}
# id, speaker, rec, a, b, pause_before, ar, en
L = [
 ("son", "x1", 0.05, 5.87, 2.2, "بابا... الموبايل فاضل فيه واحد في المية... والنور لسه قاطع من ساعة النشرة.", "Dad... my phone's at one percent... and the power's been out since the news."),
 ("dad", "x1", 6.56, 12.05, 0.4, "ولا يهمك يا بطل... قدامك أحدث اختراع: مولّد البدّال تلاتة آلاف!", "Don't worry, champ... behold my latest invention: the Pedal Generator 3000!"),
 ("son", "x1", 12.69, 15.47, 0.9, "دي العجلة بتاعتي يا بابا!... ومربوط فيها المروحة!", "That's MY bike, Dad!... with the fan tied to it!"),
 ("dad", "x1", 16.12, 18.82, 0.4, "دوّس يا حمادة! كل لفة بتنوّر اللمبة!", "Pedal, Hamada! Every turn lights the bulb!"),
 ("son", "x1", 19.44, 24.73, 2.6, "يا بابا... أنا بقالي ربع ساعة بدوّس... والموبايل شحن واحد في المية بس!", "Dad... I've been pedalling for fifteen minutes... and the phone charged just one percent!"),
 ("dad", "x1", 25.30, 28.21, 0.4, "يعني بقى اتنين في المية! ده إنجاز يا ابني!", "So now it's two percent! That's an achievement, son!"),
 ("son", "x1", 28.72, 30.19, 1.3, "بابا... إيه الصوت ده؟", "Dad... what's that sound?"),
 ("bastam", "x2", 0.06, 2.52, 0.5, "حاسب اللي تحت! وسّعوووا!", "Heads up down there! MOVE!"),
 ("bastam", "x2", 4.55, 7.91, 2.4, "أنا فين؟... دي إسكندرية؟", "Where am I?... Is this Alexandria?"),
 ("dad", "x1", 31.11, 32.59, 0.4, "لا يا ابني... دي البلكونة.", "No, son... this is the balcony."),
 ("mom", "x2", 8.90, 13.74, 1.1, "إيه الدوشة دي؟!... مين ده؟! وإيه التوكتوك اللي على البلكونة ده؟!", "What's all this noise?!... Who's that?! And what's that tuk-tuk doing on the balcony?!"),
 ("bastam", "x2", 14.84, 20.77, 0.4, "أنا بستم من مركز الصيانة... بقالي يومين طاير... حد معاه شاحن؟", "I'm Bestem from the service center... I've been flying for two days... anyone got a charger?"),
 ("dad", "x1", 33.82, 38.19, 0.5, "استنى!... موتور التوكتوك لسه شغّال!... حمادة، هات الفيشة!", "Wait!... the tuk-tuk engine's still running!... Hamada, get the plug!"),
 ("mom", "x2", 21.90, 26.30, 3.4, "النور رجع!... إبراهيم... إنت عملت حاجة صح؟!", "The power's back!... Ibrahim... you actually did something right?!"),
 ("dad", "x1", 39.55, 42.11, 0.4, "أنا طول عمري بعمل حاجات صح يا حبيبتي.", "I always do things right, my dear."),
 ("bastam", "x2", 27.14, 29.15, 0.7, "طب... ممكن أتعشى معاكم؟", "So... can I have dinner with you?"),
 ("mom", "x2", 30.03, 34.88, 0.5, "تتعشى؟... ماشي... بس على البلكونة. إنتوا التلاتة!", "Dinner?... fine... but on the balcony. All three of you!"),
 ("anno", "x3", 0.27, 10.56, 1.1, "", "New party member: Bestem. Balcony capacity: three. Electricity: borrowed."),
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
D = {"title": "ضيف من السما", "voice_source": "Google AI Studio via Claude-in-Chrome (Puck=Hamada, Orus=Ibrahim, Sadachbia=Bestem, Kore=Om Hamada, Algenib=announcer); mapped by gemini-3.5-flash transcript", "dur": DUR, "lines": lines}
json.dump(D, open(f"{P}/artifacts/lines.json", "w"), ensure_ascii=False, indent=1)
open(f"{P}/build/lines.js", "w").write("window.LINES_DATA=" + json.dumps(D, ensure_ascii=False) + ";")
hop = SR // 30; env = np.array([rms(buf[i:i + hop]) for i in range(0, len(buf), hop)]); env = np.clip(env / np.percentile(env[env > 0.003], 95), 0, 1)
open(f"{P}/build/env.js", "w").write("window.ENV=" + json.dumps({"fps": 30, "env": [round(float(e), 3) for e in env]}) + ";")
for l in lines: print(l["id"], l["s"], l["t0"], l["t1"], l["gain"], len(l["vox"]), len([p for p in l["ar"].split(" ") if p]))
print("DUR", DUR)
