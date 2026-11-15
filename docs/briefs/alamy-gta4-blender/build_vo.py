# Cuts the long pause out of the take, places the VO in a 10 s track, and writes mouth.json (lip flap, 30 fps).
import numpy as np, soundfile as sf, json, sys, os
H = os.path.dirname(os.path.abspath(__file__)); R = os.path.abspath(os.path.join(H, "../../.."))
x, sr = sf.read(os.path.join(R, "incoming/alamy-gta4-voice/r1.wav"))
if x.ndim > 1: x = x.mean(1)
segs = [(0.19, 3.82, 0.30), (5.99, 7.43, 4.38), (8.02, 9.47, 6.17)]   # (src start, src end, place at)
out = np.zeros(int(10.0 * sr))
fade = int(0.02 * sr)
for a, b, at in segs:
    c = x[int((a - 0.06) * sr):int((b + 0.08) * sr)].copy()
    c[:fade] *= np.linspace(0, 1, fade); c[-fade:] *= np.linspace(1, 0, fade)
    i = int((at - 0.06) * sr); out[i:i + len(c)] += c
out *= 10 ** (-1.0 / 20) / max(1e-6, np.abs(out).max())
sf.write(os.path.join(H, "vo.wav"), out, sr)
hop = sr // 30; env = np.array([np.sqrt(np.mean(out[k*hop:(k+1)*hop] ** 2)) for k in range(300)])
db = 20 * np.log10(env + 1e-6); o = np.clip((db + 42) / 24, 0, 1)
o = np.convolve(o, [0.25, 0.5, 0.25], "same")
# chop into syllable-like flaps: emphasise local changes
flap = np.clip(o * (0.55 + 0.45 * np.abs(np.sin(np.arange(300) * 1.9))), 0, 1)
json.dump({"fps": 30, "open": [round(float(v), 3) for v in flap]}, open(os.path.join(H, "mouth.json"), "w"))
print("vo.wav + mouth.json; talking frames:", int((flap > 0.15).sum()))
