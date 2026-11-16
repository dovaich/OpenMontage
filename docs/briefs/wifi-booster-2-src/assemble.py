# Builds dialogue.wav + lines.json/lines.js/env.js for «مقوّي الواي فاي النووي ٢» from the 3 AI Studio takes.
import json, wave, numpy as np
P = "/home/user/OpenMontage/projects/wifi-booster-2"
SR = 44100
def load(r):
    w = wave.open(f"{P}/assets/audio/google/{r}_44.wav"); return np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(float) / 32768
REC = {r: load(r) for r in ["z1", "z2", "z3"]}
# id, speaker, rec, a, b, pause_before, ar, en
L = [
 ("samir", "z2", 10.13, 11.30, 0.15, "مين اللي فاتح النت...", "Who opened the internet..."),
 ("son", "z1", 0.12, 2.12, 0.9, "بابا! أبو سمير غيّر باسورد الواي فاي!", "Dad! Abu Samir changed the Wi-Fi password!"),
 ("dad", "z1", 2.43, 5.84, 0.25, "ولا يهمك يا بطل... قدامك: سمّاعة الباسورد تلاتة آلاف!", "Don't worry, champ... behold: the Password Stethoscope 3000!"),
 ("son", "z1", 6.17, 7.56, 0.25, "دي سمّاعة الدكتور يا بابا!", "That's a doctor's stethoscope, Dad!"),
 ("dad", "z1", 7.91, 10.57, 0.3, "بتسمع أبو سمير وهو بيكتب الباسورد... ششش!", "It hears Abu Samir typing the password... shhh!"),
 ("samir", "z2", 0.25, 5.46, 0.45, "الباسورد الجديد... إبراهيم حرامي... كله على بعضه.", "The new password... IbrahimThief... all one word."),
 ("son", "z1", 10.96, 15.62, 0.3, "إبراهيم... حرامي... اتوصل! اتوصل يا بابا!", "Ibrahim... Thief... connected! We're connected, Dad!"),
 ("mom", "z2", 6.42, 9.45, 0.4, "مين اللي اتوصل؟!... ده النت وصل للشارع كله!", "Who's connected?!... the whole street is on it!"),
 ("samir", "z2", 10.13, 13.73, 0.55, "مين اللي فاتح النت للمنطقة كلها يا حرامية؟!", "Who opened the internet to the whole area, you thieves?!"),
 ("dad", "z1", 15.89, 17.08, 0.25, "اقفل، اقفل! اعمل نفسك نايم!", "Hang up, hang up! Pretend you're asleep!"),
 ("anno", "z3", 0.30, 4.65, 0.5, "", "Password cracked. Neighbor anger: maximum."),
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
DUR = round(t + 3.6, 1)
buf = np.zeros(int(DUR * SR))
for i0, y in out: buf[i0:i0 + len(y)] += y
buf = np.clip(buf, -1, 1)
w = wave.open(f"{P}/assets/audio/dialogue.wav", "wb"); w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((buf * 32767).astype(np.int16).tobytes()); w.close()
D = {"title": "مقوّي الواي فاي النووي ٢", "voice_source": "Google AI Studio via Claude-in-Chrome (Puck=Hamada, Orus=Ibrahim, Gacrux=Abu Samir, Kore=Om Hamada, Algenib=announcer); mapped by gemini-3.5-flash transcript", "dur": DUR, "lines": lines}
json.dump(D, open(f"{P}/artifacts/lines.json", "w"), ensure_ascii=False, indent=1)
open(f"{P}/build/lines.js", "w").write("window.LINES_DATA=" + json.dumps(D, ensure_ascii=False) + ";")
hop = SR // 30; env = np.array([rms(buf[i:i + hop]) for i in range(0, len(buf), hop)]); env = np.clip(env / np.percentile(env[env > 0.003], 95), 0, 1)
open(f"{P}/build/env.js", "w").write("window.ENV=" + json.dumps({"fps": 30, "env": [round(float(e), 3) for e in env]}) + ";")
for l in lines: print(l["id"], l["s"], l["t0"], l["t1"], l["gain"], len(l["vox"]), len([p for p in l["ar"].split(" ") if p]))
print("DUR", DUR)
