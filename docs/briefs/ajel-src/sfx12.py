# Synthesises the music bed + SFX for «عاجل!» and mixes them under the dialogue.
# usage: python3 sfx.py <dialogue.wav> <out_mix.wav> [lines_google.json]
# Event times are written in scene time; with a lines file carrying warp_anchors_new_old they are mapped to output time.
import sys, wave, json
import numpy as np

SR = 44100
ANC = [[0, 0], [132.9, 132.9]]
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
T_EXPLODE = 19.0; T_OUT = 34.25; T_CRASH = 41.4; T_POP = 107.45; T_PLUG = 113.0; T_HOME = 116.5
r = np.random.RandomState(12)
def whoosh(t0, d=0.5, g=0.25):
    x = noise(d); f = lp(x, 0.08) + lp(x, 0.3) * np.linspace(0, 1, len(x)); put(sfx, f * np.sin(np.linspace(0, np.pi, len(x))) ** 2, t0 - d / 2, g)
def boom(t0, g=0.8, d=1.4):
    tb = tt(d); put(sfx, np.sin(2 * np.pi * np.cumsum(np.linspace(80, 28, len(tb))) / SR) * np.exp(-tb * 2.5) + lp(noise(d), 0.12) * np.exp(-tb * 2.2), t0, g)
def chord(t0, notes, d, g, duty=0.5):
    for m in notes: put(music, sq(note(m), d, duty) * env_adsr(int(d * SR), 0.005, 0.12), t0, g / len(notes), True)
# ---------- news theme (intro) ----------
for ts, ch in [(0.12, [50, 57, 62]), (0.5, [50, 57, 62]), (0.88, [53, 60, 65])]:
    chord(ts, ch, 0.28, 0.22); put(music, np.sin(2 * np.pi * 55 * tt(0.5)) * np.exp(-tt(0.5) * 7), ts, 0.5, True)
d = 0.7; put(sfx, lp(noise(d), 0.25) * np.linspace(0, 1, int(d * SR)) ** 2, 1.2, 0.35)
chord(1.9, [50, 57, 62, 66], 0.7, 0.3); put(music, np.sin(2 * np.pi * 50 * tt(0.9)) * np.exp(-tt(0.9) * 4), 1.9, 0.6, True)
# ---------- tense news bed: pulsing bass + ticking clock ----------
step = 60 / 112 / 2; t = 2.6; i = 0
while t < T_PLUG:
    weather = 100.9 <= t < 107.1
    if not weather:
        put(music, tri(note([38, 38, 41, 36][(i // 16) % 4]), step * 0.8) * env_adsr(int(step * 0.8 * SR)), t, 0.09, True)
        if i % 2 == 0: put(music, lp(noise(0.02), 0.9) * np.exp(-tt(0.02) * 200), t, 0.05, True)
        if i % 16 == 0: put(music, sq(note([62, 62, 65, 60][(i // 16) % 4]), step * 3, 0.25) * env_adsr(int(step * 3 * SR)), t, 0.015, True)
    t += step; i += 1
# weather jingle (cheerful plucks)
for j, m in enumerate([72, 76, 79, 84, 79, 76, 74, 77, 81, 86, 81, 77] * 2):
    put(music, pluck(note(m), 0.5), 100.95 + j * 0.25, 0.12, True)
# ---------- transitions ----------
for ts in (12.85, 21.3, 28.3, 32.0, 37.6, 43.3, 50.9, 81.6, 85.7, 95.0, 100.9, 107.1): whoosh(ts)
# archive VHS hiss
for a, b in ((12.85, 21.3), (32.0, 43.3)): put(amb, lp(noise(b - a), 0.6) * 0.5, a, 0.05)
# ---------- kitchen: the jet dishwasher spools up and explodes ----------
d = T_EXPLODE - 14.5; tb = tt(d); f = np.linspace(200, 900, len(tb)); put(sfx, (np.sin(2 * np.pi * np.cumsum(f) / SR) + 0.5 * lp(noise(d), 0.3)) * np.linspace(0.2, 1, len(tb)), 14.5, 0.12)
for ts in np.arange(14.6, T_EXPLODE, 0.13): put(sfx, lp(noise(0.03), 0.7) * np.exp(-tt(0.03) * 120), ts, 0.06)
boom(T_EXPLODE, 0.9, 1.8)
for j in range(10):
    ts = T_EXPLODE + 0.7 + j * 0.18 + r.rand() * 0.1; put(sfx, np.sin(2 * np.pi * (2200 + r.rand() * 1800) * tt(0.25)) * np.exp(-tt(0.25) * 18), ts, 0.12); put(sfx, lp(noise(0.08), 0.8) * np.exp(-tt(0.08) * 60), ts, 0.12)
for j, m in enumerate([60, 56, 53, 48]): put(sfx, sq(note(m), 0.22, 0.5) * env_adsr(int(0.22 * SR)), T_EXPLODE + 0.5 + j * 0.22, 0.06)
# ---------- blackout: the pan crackles, then the whole area powers down ----------
d = T_OUT - 32.0; tb = tt(d); put(sfx, np.sign(np.sin(2 * np.pi * 100 * tb)) * lp(noise(d), 0.5) * np.linspace(0.2, 1, len(tb)), 32.0, 0.06)
for ts in np.arange(32.2, T_OUT, 0.17): put(sfx, lp(noise(0.03), 0.95) * np.exp(-tt(0.03) * 150), ts + r.rand() * 0.08, 0.15)
put(sfx, lp(noise(0.25), 0.9) * np.exp(-tt(0.25) * 12), T_OUT, 0.5)
d = 1.1; tb = tt(d); put(sfx, np.sign(np.sin(2 * np.pi * np.cumsum(np.linspace(220, 30, len(tb))) / SR)) * np.linspace(1, 0, len(tb)), T_OUT + 0.05, 0.1)
put(amb, lp(noise(T_OUT - 32.0), 0.05) * 0.8, 32.0, 0.12)  # city hum, cut by the blackout
# ---------- the flying tuk-tuk crash ----------
d = T_CRASH - 38.4; tb = tt(d); put(sfx, (np.sin(2 * np.pi * np.cumsum(np.linspace(500, 1400, len(tb))) / SR) * 0.6 + lp(noise(d), 0.35)) * np.linspace(0.2, 1, len(tb)), 38.4, 0.22)
boom(T_CRASH, 0.85, 1.3)
for j in range(9): put(sfx, lp(noise(0.12), 0.2) * np.exp(-tt(0.12) * 25), T_CRASH + 0.1 + j * 0.13 + r.rand() * 0.06, 0.35)  # melon splats
put(sfx, lp(noise(0.3), 0.7) * np.exp(-tt(0.3) * 10), T_CRASH + 0.05, 0.35)  # wood crack
# market ambience under the interview
put(amb, lp(noise(50.9 - 43.3), 0.04), 43.3, 0.2)
# ---------- studio events ----------
for k in range(2):  # phone ring
    for j in range(8): put(sfx, sq(1400 if j % 2 else 1100, 0.045, 0.5) * env_adsr(int(0.045 * SR)), 69.6 + k * 0.45 + j * 0.045, 0.06)
put(sfx, lp(noise(0.35), 0.5) * np.linspace(1, 0, int(0.35 * SR)), 78.0, 0.12)  # chair scrape
# sky wind
d = 100.9 - 85.7; tb = tt(d); put(amb, lp(noise(d), 0.03) * (0.6 + 0.4 * np.sin(2 * np.pi * 0.4 * tb)), 85.7, 0.6)
# Ibrahim pops up with the booster
d = 0.4; put(sfx, np.sin(2 * np.pi * np.cumsum(np.linspace(200, 900, int(d * SR))) / SR) * env_adsr(int(d * SR)), T_POP - 0.05, 0.12)
for j, m in enumerate([67, 71, 74, 79]): put(sfx, sq(note(m), 0.09, 0.25) * env_adsr(int(0.09 * SR)), T_POP + 0.1 + j * 0.07, 0.06)
# plug in: zap, boom, static
for j in range(6): put(sfx, lp(noise(0.05), 0.95) * np.exp(-tt(0.05) * 60), T_PLUG + j * 0.05, 0.4)
boom(T_PLUG + 0.1, 0.9, 1.4)
put(sfx, noise(T_HOME - 113.35) * 0.5, 113.35, 0.22)
d = 1.2; tb = tt(d); put(sfx, np.sin(2 * np.pi * 1000 * tb) * np.exp(-tb * 0.5) * (tb < 1.0), 114.3, 0.04)  # test-card tone
# ---------- home ending ----------
put(amb, lp(noise(132.9 - T_HOME), 0.02), T_HOME, 0.12)
put(amb, noise(132.9 - T_HOME) * 0.3, T_HOME, 0.02)  # faint TV static
put(sfx, np.sin(2 * np.pi * 55 * tt(0.8)) * np.exp(-tt(0.8) * 4), 118.95, 0.6)  # dramatic hit on the scream
for j, (m, dd) in enumerate([(58, 0.4), (57, 0.4), (56, 0.4), (55, 1.2)]):  # sad "wah wah"
    tb = tt(dd); vib = 1 + 0.01 * np.sin(2 * np.pi * 6 * tb) * (j == 3); put(music, lp(np.sign(np.sin(2 * np.pi * np.cumsum(note(m) * vib * np.ones(len(tb))) / SR)), 0.15) * env_adsr(len(tb), 0.02, 0.1), 120.5 + j * 0.42, 0.12, True)
for j, m in enumerate([72, 76, 79, 84, 88]): put(sfx, sq(note(m), 0.1, 0.25) * env_adsr(int(0.1 * SR)), 124.4 + j * 0.07, 0.09)
for j, m in enumerate([74, 75, 78, 79]): put(sfx, pluck(note(m), 0.6), 129.5 + j * 0.16, 0.16, True)
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
