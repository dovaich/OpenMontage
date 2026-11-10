import json, wave, numpy as np
import os; P = os.environ.get("PROJ", "projects/shibshib-final-boss")
d = json.load(open(f"{P}/artifacts/lines.json"))
SR = 44100; t = 1.0; segs = []; out = []
for L in d["lines"]:
    w = wave.open(f"{P}/assets/audio/lines/{L['id']}.wav"); a = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32) / 32768
    segs.append((t, a, L)); L["t0"] = round(t, 3); L["t1"] = round(t + len(a) / SR, 3); t = L["t1"] + L["gap_after"]
total = t
buf = np.zeros(int(total * SR) + SR)
for t0, a, L in segs:
    i = int(t0 * SR); buf[i:i + len(a)] += a
buf = buf[:int(total * SR)]
wave_out = wave.open(f"{P}/assets/audio/dialogue.wav", "wb"); wave_out.setnchannels(1); wave_out.setsampwidth(2); wave_out.setframerate(SR)
wave_out.writeframes((np.clip(buf, -1, 1) * 32767).astype(np.int16).tobytes()); wave_out.close()
# mouth-flap envelope at 30 fps
h = SR // 30; e = [float(np.sqrt(np.mean(buf[i*h:(i+1)*h]**2))) if len(buf[i*h:(i+1)*h]) else 0 for i in range(len(buf)//h + 1)]
m = max(e)
json.dump({"fps": 30, "env": [round(x/m, 3) for x in e]}, open(f"{P}/artifacts/env.json", "w"))
json.dump(d, open(f"{P}/artifacts/lines.json", "w"), ensure_ascii=False, indent=1)
print("total", round(total, 2))
for L in d["lines"]: print(L["id"], L["s"], L["t0"], L["t1"])
