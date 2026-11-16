# Synthesises the music bed + SFX for «أصلي شركة» and mixes them under the dialogue.
# usage: python3 sfx.py <dialogue.wav> <out_mix.wav> [lines_google.json]
# Event times are written in scene time; with a lines file carrying warp_anchors_new_old they are mapped to output time.
import sys, wave, json
import numpy as np

SR = 44100
ANC = [[0, 0], [40.6, 40.6]]
def W(o):  # scene (old) time -> output time
    for (n0, o0), (n1, o1) in zip(ANC, ANC[1:]):
        if o <= o1: return n0 + (o - o0) * (n1 - n0) / max(1e-6, o1 - o0)
    return ANC[-1][0]
DUR = ANC[-1][0]
N = int(DUR * SR) + SR
rs = np.random.RandomState(7)

def tt(d): return np.arange(int(d * SR)) / SR
def env_adsr(n, a=0.005, r=0.05):
    e = np.ones(n); na = max(1, min(n // 2, int(a * SR))); nr = max(1, min(n // 2, int(r * SR)))
    e[:na] = np.linspace(0, 1, na); e[-nr:] *= np.linspace(1, 0, nr); return e
def sq(f, d, duty=0.5):
    t = tt(d); return np.where((t * f) % 1 < duty, 1.0, -1.0)
def tri(f, d):
    t = tt(d); return 2 * np.abs(2 * ((t * f) % 1) - 1) - 1
def noise(d): return rs.uniform(-1, 1, int(d * SR))
def lp(x, a):  # one-pole lowpass, a in (0,1)
    y = np.zeros_like(x); acc = 0.0
    for i in range(len(x)):
        acc += a * (x[i] - acc); y[i] = acc
    return y
def put(buf, x, t0, g=1.0, raw=False):
    i = int((t0 if raw else W(t0)) * SR)
    if i >= len(buf): return
    x = x[: len(buf) - i]; buf[i:i + len(x)] += x * g
def note(n): return 440.0 * 2 ** ((n - 69) / 12)


def pluck(f, d, damp=0.996):
    n = int(SR / f); buf = rs.uniform(-1, 1, n); out = np.zeros(int(d * SR))
    for i in range(len(out)):
        out[i] = buf[i % n]; buf[i % n] = damp * 0.5 * (buf[i % n] + buf[(i + 1) % n])
    return out



music = np.zeros(N); sfx = np.zeros(N); amb = np.zeros(N)
r = np.random.RandomState(23)
def jingle(t0, notes, step=0.07, g=0.08):
    for j, m in enumerate(notes): put(sfx, sq(note(m), 0.1, 0.25) * env_adsr(int(0.1 * SR)), t0 + j * step, g)
T_RW = 2.73; T_HOOK = T_RW + 0.6; T_HANG = 15.4
put(amb, lp(noise(40.6), 0.02), 0, 0.22)
for ts in np.arange(1.0, 40.6, 2.3): put(amb, sum(np.sin(2 * np.pi * f0 * tt(0.35)) * np.exp(-tt(0.35) * 12) for f0 in (900 + r.rand() * 400, 2300 + r.rand() * 600)) / 2, ts + r.rand(), 0.035)
put(sfx, np.sin(2 * np.pi * 55 * tt(0.6)) * np.exp(-tt(0.6) * 5), 0.05, 0.4)
d = 0.5; tb = tt(d); put(sfx, np.sin(2 * np.pi * np.cumsum(np.linspace(1200, 200, len(tb))) / SR) * 0.5 + lp(noise(d), 0.4) * 0.5, T_RW + 0.02, 0.2)
jingle(T_HOOK, [79, 84], 0.06, 0.07)
# shop groove before the trouble
beat = 60 / 120; x = T_HOOK; i = 0
while x < 9.78:
    if i % 2 == 0: put(music, np.sin(2 * np.pi * np.cumsum(np.linspace(110, 45, int(0.14 * SR))) / SR) * np.exp(-tt(0.14) * 14), x, 0.12, True)
    if i % 8 in (1, 5): put(music, pluck(note([67, 71, 74, 71][(i // 8) % 4]), 0.3), x, 0.07, True)
    x += beat / 2; i += 1
# «أصلي» ding each time the word lands (cash-register style)
for d0 in [4.42, 6.76, 8.64, 9.11, 13.21, 13.6, 14.77, 19.63, 23.38, 26.31]: put(sfx, np.sin(2 * np.pi * 1568 * tt(0.25)) * np.exp(-tt(0.25) * 12) + np.sin(2 * np.pi * 2093 * tt(0.25)) * np.exp(-tt(0.25) * 14) * 0.6, d0, 0.05)
# the slow turn: dramatic sting
for j, m in enumerate([50, 49]): put(music, sq(note(m), 0.4, 0.5) * env_adsr(int(0.4 * SR)), 9.78 - 0.3 + j * 0.42, 0.06, True)
put(sfx, np.sin(2 * np.pi * 55 * tt(0.6)) * np.exp(-tt(0.6) * 5), 9.78 - 0.3, 0.4)
# "3 seconds later" card whoosh
d = 0.5; put(sfx, lp(noise(d), 0.2) * np.sin(np.linspace(0, np.pi, int(d * SR))) ** 2, T_HANG - 0.45, 0.25)
# hanging chaos: chain creak loop, struggle grunts-ish thumps, slipper bonks
for x0 in np.arange(T_HANG, 32.63, 1.4):
    dd = 0.45; tb = tt(dd); put(sfx, np.sin(2 * np.pi * np.cumsum(np.linspace(380, 300, len(tb)) * (1 + 0.05 * np.sign(np.sin(2 * np.pi * 25 * tb)))) / SR) * env_adsr(len(tb), 0.05, 0.2), x0, 0.025)
for x0 in np.arange(T_HANG, 29.7, 0.45): put(sfx, lp(noise(0.06), 0.3) * np.exp(-tt(0.06) * 40), x0 + r.rand() * 0.1, 0.07)
for hx in [16.5, 17.729999999999997, 29.400000000000002]:
    put(sfx, np.sin(2 * np.pi * np.cumsum(np.linspace(400, 120, int(0.15 * SR))) / SR) * np.exp(-tt(0.15) * 18), hx, 0.7)
    put(sfx, np.sin(2 * np.pi * 1800 * tt(0.6)) * np.exp(-tt(0.6) * 4), hx + 0.05, 0.05)
# Asly turning on Gazzar: record-scratch
d = 0.3; tb = tt(d); put(sfx, lp(noise(d), 0.6) * np.sin(2 * np.pi * np.cumsum(np.linspace(900, 200, len(tb))) / SR), 28.05 - 0.25, 0.25)
# Abu Samir tiptoeing out
for x0 in np.arange(29.7, 32.28 + 1.2, 0.3): put(sfx, np.sin(2 * np.pi * note(72 + int((x0 * 10) % 3) * 2) * tt(0.08)) * np.exp(-tt(0.08) * 30), x0, 0.05)
for j in range(10): put(sfx, sq(note(60 + j * 2), 0.06, 0.5) * env_adsr(int(0.06 * SR)), 33.830000000000005 + j * 0.14, 0.05)
for j, m in enumerate([74, 75, 78, 79]): put(sfx, pluck(note(m), 0.6), 37.7 + j * 0.16, 0.16, True)
# ---------- mix with ducking ----------
w = wave.open(sys.argv[1]); dia = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float64) / 32768
dia = np.pad(dia, (0, max(0, N - len(dia))))[:N]
# speech envelope -> duck gain for music
win = int(0.05 * SR); e = np.sqrt(np.convolve(dia ** 2, np.ones(win) / win, mode='same'))
duck = 1 - 0.65 * np.clip(e / 0.05, 0, 1)
duck = np.convolve(duck, np.ones(int(0.15 * SR)) / int(0.15 * SR), mode='same')
mix_mono_music = music * duck
L = dia * 0.95 + mix_mono_music * 0.95 + sfx * 0.8 + amb
R = dia * 0.95 + mix_mono_music * 0.95 + sfx * 0.8 + amb
# slight stereo width on music/amb
shift = int(0.012 * SR)
R[shift:] = dia[shift:] * 0.95 + (mix_mono_music[:-shift] * 0.95) + sfx[shift:] * 0.8 + amb[:-shift]
st = np.stack([L, R], 1)[: int(DUR * SR)]
peak = np.max(np.abs(st)); st = st / max(1.0, peak / 0.95)
o = wave.open(sys.argv[2], 'wb'); o.setnchannels(2); o.setsampwidth(2); o.setframerate(SR)
o.writeframes((st * 32767).astype(np.int16).tobytes()); o.close()
print('mixed', st.shape[0] / SR, 'peak', round(float(peak), 3))
