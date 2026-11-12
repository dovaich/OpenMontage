# Builds dialogue.wav + lines.json/lines.js/env.js for both episodes of a recording batch (vertical series).
# usage: python3 assemble_pair.py <project> ; line lists below
import json, wave, sys, numpy as np
SR = 44100
EP = {
 "sakhan": ("السخان النووي", 3.4, [
  ("mom", "r3", 0.23, 3.26, 0.15, "إبراهيم! الشقة كلها بقت حمّام بخار!", "Ibrahim! The whole flat turned into a steam bath!"),
  ("son", "r1", 0.02, 3.38, 1.25, "بابا! السخان بايظ... والمية تلج!", "Dad! The water heater's broken... the water's ice!"),
  ("dad", "r1", 4.04, 9.23, 0.25, "ولا يهمك يا بطل... قدامك: السخان النووي تلاتة آلاف!", "Don't worry, champ... behold: the Nuclear Water Heater 3000!"),
  ("son", "r1", 9.82, 12.50, 0.25, "ده الكاتل والسشوار والطاسة يا بابا!", "That's the kettle, the hair dryer and the pan, Dad!"),
  ("dad", "r1", 13.31, 15.80, 0.3, "ادخل استحمى... وأنا هدوس على التوربو.", "Go shower... I'll hit the turbo."),
  ("son", "r1", 16.63, 19.33, 0.9, "بابا! المية بتغلي!... أنا اتسلقت!", "Dad! The water's boiling!... I'm cooked!"),
  ("mom", "r3", 0.23, 3.26, 0.5, "إبراهيم! الشقة كلها بقت حمّام بخار!", "Ibrahim! The whole flat turned into a steam bath!"),
  ("dad", "r1", 20.02, 22.59, 0.4, "يبقى نفتحها سبا... ونلم فلوس.", "Then we open a spa... and make money."),
  ("anno", "r3", 11.42, 15.69, 0.5, "", "Water temperature: boiling. Apartment: sauna."),
 ]),
 "mobile-dryer": ("مجفف الموبايلات النووي", 3.4, [
  ("mom", "r3", 8.79, 10.65, 0.15, "إبراهيم! الرز بيرن!", "Ibrahim! The rice is ringing!"),
  ("son", "r2", 0.12, 2.43, 1.35, "بابا! الموبايل وقع في الحمام!", "Dad! My phone fell in the toilet!"),
  ("dad", "r2", 3.03, 7.28, 0.25, "ولا يهمك... قدامك: مجفف الموبايلات النووي تلاتة آلاف!", "Don't worry... behold: the Nuclear Phone Dryer 3000!"),
  ("son", "r2", 7.69, 8.90, 0.25, "دي حلة الرز يا بابا!", "That's the rice pot, Dad!"),
  ("dad", "r2", 9.34, 12.02, 0.3, "الرز بيشفط المية... وأنا هزوّد عليه نار.", "Rice soaks up the water... and I'll add some fire."),
  ("mom", "r3", 4.88, 8.05, 0.9, "حد شاف حلة الرز؟... الضيوف وصلوا!", "Has anyone seen the rice pot?... the guests are here!"),
  ("mom", "r3", 8.79, 10.65, 1.3, "إبراهيم! الرز بيرن!", "Ibrahim! The rice is ringing!"),
  ("son", "r2", 12.45, 16.03, 0.5, "الموبايل اشتغل يا بابا!... بس ريحته رز بالشعرية.", "The phone works, Dad!... but it smells like vermicelli rice."),
  ("anno", "r3", 18.23, 23.17, 0.5, "", "Phone status: alive. Rice status: ringing."),
 ]),
 "takyeef": ("التكييف النووي", 3.4, [
  ("mom", "r3", 0.22, 5.41, 0.15, "إبراهيم!... فاتورة الكهربا جت... بخمس تلاف جنيه!", "Ibrahim!... the electricity bill came... five thousand pounds!"),
  ("son", "r1", 0.24, 3.20, 1.25, "بابا! أنا بسيح... الحر ده مش طبيعي!", "Dad! I'm melting... this heat isn't normal!"),
  ("dad", "r1", 4.04, 8.32, 0.25, "ولا يهمك يا بطل... قدامك: التكييف النووي تلاتة آلاف!", "Don't worry, champ... behold: the Nuclear AC 3000!"),
  ("son", "r1", 8.87, 12.14, 0.25, "دي التلاجة مفتوحة والمروحة قدامها يا بابا!", "That's the open fridge with a fan in front of it, Dad!"),
  ("dad", "r1", 12.84, 16.67, 0.3, "هوا التلاجة... بالمروحة... يبقى تكييف. اقعد قدامه.", "Fridge air... plus fan... equals AC. Sit in front of it."),
  ("son", "r1", 17.35, 21.00, 0.9, "بابا... أنا اتجمدت!... حواجبي فيها تلج!", "Dad... I'm frozen!... there's ice in my eyebrows!"),
  ("mom", "r3", 0.22, 5.41, 0.5, "إبراهيم!... فاتورة الكهربا جت... بخمس تلاف جنيه!", "Ibrahim!... the electricity bill came... five thousand pounds!"),
  ("dad", "r1", 21.73, 24.82, 0.4, "خلاص... ندفعها بالتلج... عندنا كتير.", "Fine... we'll pay it in ice... we have plenty."),
  ("anno", "r3", 12.53, 18.88, 0.5, "", "Room temperature: minus ten. Electricity bill: nuclear."),
 ]),
 "natiga": ("موقع النتيجة", 3.4, [
  ("mom", "r3", 7.16, 11.38, 0.15, "إبراهيم! إنت وقّعت موقع النتيجة للمحافظة كلها؟!", "Ibrahim! You crashed the results website for the whole governorate?!"),
  ("son", "r2", 0.05, 3.30, 1.25, "بابا! موقع النتيجة واقع... والناس كلها مستنية!", "Dad! The results website is down... and everyone's waiting!"),
  ("dad", "r2", 3.81, 8.06, 0.25, "ولا يهمك... قدامك: مسرّع المواقع النووي تلاتة آلاف!", "Don't worry... behold: the Nuclear Website Booster 3000!"),
  ("son", "r2", 8.81, 10.69, 0.25, "ده الراوتر متربط في المروحة يا بابا!", "That's the router tied to the fan, Dad!"),
  ("dad", "r2", 11.36, 15.17, 0.3, "المروحة بتزق النت... والنت بيجري. اكتب رقم الجلوس.", "The fan pushes the internet... and the internet runs. Type your seat number."),
  ("son", "r2", 15.91, 19.56, 0.5, "اشتغل!... أنا جبت... خمسين في المية؟!", "It works!... I got... fifty percent?!"),
  ("mom", "r3", 7.16, 11.38, 0.5, "إبراهيم! إنت وقّعت موقع النتيجة للمحافظة كلها؟!", "Ibrahim! You crashed the results website for the whole governorate?!"),
  ("dad", "r2", 19.75, 24.86, 0.4, "بالعكس... أنا خليت المحافظة كلها تشوف نتيجة حمادة.", "On the contrary... I let the whole governorate see Hamada's result."),
  ("anno", "r3", 21.28, 26.76, 0.5, "", "Server status: down. Hamada's score: fifty percent."),
 ]),
}
P0 = "/home/user/OpenMontage/projects/"
name = sys.argv[1]; title, tail, L = EP[name]; P = P0 + name
def load(r):
    w = wave.open(f"{P}/assets/audio/google/{r}_44.wav"); return np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(float) / 32768
REC = {r: load(r) for r in ["r1", "r2", "r3"]}
PAD = 0.04
def rms(x): return np.sqrt(np.mean(x ** 2) + 1e-12)
def voiced(x, minsil=0.12):
    hop = int(SR * 0.01); e = np.array([rms(x[i:i + hop]) for i in range(0, len(x) - hop, hop)])
    db = 20 * np.log10(e + 1e-9); sp = db > db.max() - 34; segs = []; i = 0; n = len(sp)
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
    x = REC[r][max(0, int((a - PAD) * SR)):int((b + PAD) * SR)].copy(); v = voiced(x)
    clips.append([s, r, a, b, pb, ar, en, x, v, rms(np.concatenate([x[int(p * SR):int(q * SR)] for p, q in v]))])
med = np.median([c[9] for c in clips]); t = 0.0; out = []; lines = []
for i, (s, r, a, b, pb, ar, en, x, v, vr) in enumerate(clips):
    t += pb; g = float(np.clip(med / vr, 0.6, 3.0)); y = x * g; f = int(0.01 * SR); y[:f] *= np.linspace(0, 1, f); y[-f:] *= np.linspace(1, 0, f)
    t0 = round(t, 3); out.append((int(t0 * SR), y)); t1 = round(t0 + len(y) / SR, 3)
    lines.append({"id": f"L{i+1:02d}", "s": s, "t0": t0, "t1": t1, "src": [r, a, b], "gain": round(g, 2), "ar": ar, "en": en, "vox": [[round(t0 + p, 2), round(t0 + q, 2)] for p, q in v]}); t = t1
for i, l in enumerate(lines): l["gap_after"] = round((lines[i + 1]["t0"] - l["t1"]) if i + 1 < len(lines) else 0.4, 2)
DUR = round(t + tail, 1); buf = np.zeros(int(DUR * SR))
for i0, y in out: buf[i0:i0 + len(y)] += y
buf = np.clip(buf, -1, 1)
w = wave.open(f"{P}/assets/audio/dialogue.wav", "wb"); w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((buf * 32767).astype(np.int16).tobytes()); w.close()
D = {"title": title, "voice_source": "Google AI Studio via local Claude-in-Chrome session (Puck=Hamada, Orus=Ibrahim, Kore=Om Hamada, Algenib=announcer)", "dur": DUR, "lines": lines}
json.dump(D, open(f"{P}/artifacts/lines.json", "w"), ensure_ascii=False, indent=1)
open(f"{P}/build/lines.js", "w").write("window.LINES_DATA=" + json.dumps(D, ensure_ascii=False) + ";")
hop = SR // 30; env = np.array([rms(buf[i:i + hop]) for i in range(0, len(buf), hop)]); env = np.clip(env / np.percentile(env[env > 0.003], 95), 0, 1)
open(f"{P}/build/env.js", "w").write("window.ENV=" + json.dumps({"fps": 30, "env": [round(float(e), 3) for e in env]}) + ";")
for l in lines: print(l["id"], l["s"], l["t0"], l["t1"], l["gain"], l["vox"])
print("DUR", DUR)
