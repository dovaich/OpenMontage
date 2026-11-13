# Synthesises the music bed + SFX for «الأصلي بيشتغل» and mixes them under the dialogue.
# usage: python3 sfx.py <dialogue.wav> <out_mix.wav> [lines_google.json]
# Event times are written in scene time; with a lines file carrying warp_anchors_new_old they are mapped to output time.
import sys, wave, json
import numpy as np

SR = 44100
ANC = [[0, 0], [34.7, 34.7]]
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
r = np.random.RandomState(22)
def jingle(t0, notes, step=0.07, g=0.08):
    for j, m in enumerate(notes): put(sfx, sq(note(m), 0.1, 0.25) * env_adsr(int(0.1 * SR)), t0 + j * step, g)
T_RW = 2.09; T_HOOK = T_RW + 0.6; T_ZAP = 8.950000000000001; T_CHASE = 18.52; T_BONK = 20.47
put(amb, lp(noise(34.7), 0.02), 0, 0.22)
for ts in np.arange(1.0, 34.7, 2.3): put(amb, sum(np.sin(2 * np.pi * f0 * tt(0.35)) * np.exp(-tt(0.35) * 12) for f0 in (900 + r.rand() * 400, 2300 + r.rand() * 600)) / 2, ts + r.rand(), 0.035)
def chase_music(a, b):
    step = 60 / 170 / 2; x = a; i = 0
    while x < b:
        put(music, sq(note([64, 67, 71, 67, 65, 69, 72, 69][i % 8] + 12), step * 0.8, 0.25) * env_adsr(int(step * 0.8 * SR)), x, 0.03, True)
        if i % 2 == 0: put(music, np.sin(2 * np.pi * np.cumsum(np.linspace(110, 45, int(0.12 * SR))) / SR) * np.exp(-tt(0.12) * 16), x, 0.14, True)
        x += step; i += 1
chase_music(0.0, T_RW); chase_music(T_CHASE, T_BONK)
for ts in np.arange(0.0, T_RW, 0.24): put(sfx, lp(noise(0.05), 0.3) * np.exp(-tt(0.05) * 60), ts, 0.1)
for ts in np.arange(T_CHASE, T_BONK, 0.2): put(sfx, lp(noise(0.05), 0.3) * np.exp(-tt(0.05) * 60), ts, 0.1)
put(sfx, np.sin(2 * np.pi * 55 * tt(0.6)) * np.exp(-tt(0.6) * 5), 0.05, 0.4)
d = 0.5; tb = tt(d); put(sfx, np.sin(2 * np.pi * np.cumsum(np.linspace(1200, 200, len(tb))) / SR) * 0.5 + lp(noise(d), 0.4) * 0.5, T_RW + 0.02, 0.2)
jingle(T_HOOK, [79, 84], 0.06, 0.07)
# tense quiet wiring: ticking clock + tiny wire clicks
for ts in np.arange(T_HOOK, 8.4, 0.5): put(sfx, lp(noise(0.02), 0.9) * np.exp(-tt(0.02) * 200), ts, 0.05)
d = 8.4 - T_HOOK; tb = tt(d); put(music, np.sin(2 * np.pi * 220 * tb) * 0.3 * np.minimum(1, tb), T_HOOK, 0.04, True)
# ZAP: electric crackle, buzz, breaker clunk, lights flicker hum
for ts in np.arange(T_ZAP, T_ZAP + 0.7, 0.03): put(sfx, lp(noise(0.03), 0.95) * np.exp(-tt(0.03) * 120), ts + r.rand() * 0.02, 0.3)
d = 0.7; tb = tt(d); put(sfx, np.sign(np.sin(2 * np.pi * 100 * tb)) * np.exp(-tb * 2), T_ZAP, 0.15)
put(sfx, np.sin(2 * np.pi * 60 * tt(0.4)) * np.exp(-tt(0.4) * 8), T_ZAP + 0.6, 0.6)
for ts in np.arange(T_ZAP + 0.7, T_ZAP + 1.4, 0.18): put(sfx, np.sin(2 * np.pi * 120 * tt(0.08)) * np.exp(-tt(0.08) * 30), ts, 0.08)
# rage build: rising drone
d = T_CHASE - T_ZAP - 0.6; tb = tt(d); put(music, np.sign(np.sin(2 * np.pi * np.cumsum(np.linspace(55, 130, len(tb))) / SR)) * 0.4 * np.linspace(0.2, 1, len(tb)), T_ZAP + 0.6, 0.04, True)
put(sfx, np.sin(2 * np.pi * 50 * tt(0.7)) * np.exp(-tt(0.7) * 4), 16.93, 0.5)
# slipper whoosh + BONK + bell + flight whistle + barrel clang
d = 0.45; tb = tt(d); put(sfx, lp(noise(d), 0.3) * np.sin(np.linspace(0, np.pi, len(tb))) ** 2, T_BONK - 0.45, 0.3)
put(sfx, np.sin(2 * np.pi * np.cumsum(np.linspace(400, 120, int(0.15 * SR))) / SR) * np.exp(-tt(0.15) * 18), T_BONK, 0.8)
put(sfx, np.sin(2 * np.pi * 1800 * tt(1.0)) * np.exp(-tt(1.0) * 3) + np.sin(2 * np.pi * 2700 * tt(1.0)) * np.exp(-tt(1.0) * 4) * 0.5, T_BONK + 0.05, 0.08)
d = 1.1; tb = tt(d); put(sfx, np.sin(2 * np.pi * np.cumsum(np.linspace(1600, 400, len(tb))) / SR), T_BONK + 0.05, 0.05)
put(sfx, sum(np.sin(2 * np.pi * f0 * tt(0.8)) * np.exp(-tt(0.8) * 5) for f0 in (210, 330, 520)) / 3, T_BONK + 1.15, 0.5)
for j, m in enumerate([72, 76, 79, 84]): put(sfx, sq(note(m), 0.1, 0.25) * env_adsr(int(0.1 * SR)), T_BONK + 0.25 + j * 0.07, 0.08)
# phone views ding
for j in range(8): put(sfx, np.sin(2 * np.pi * note(84 + j % 4) * tt(0.12)) * np.exp(-tt(0.12) * 25), 21.97 + 0.3 + j * 0.3, 0.05)
for j in range(10): put(sfx, sq(note(60 + j * 2), 0.06, 0.5) * env_adsr(int(0.06 * SR)), 27.54 + j * 0.14, 0.05)
for j, m in enumerate([74, 75, 78, 79]): put(sfx, pluck(note(m), 0.6), 31.800000000000004 + j * 0.16, 0.16, True)
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
