# music bed + SFX for «gta», mixed under the dialogue.
# usage: python3 sfx.py <dialogue.wav> <out_mix.wav> [lines_google.json]
# Event times are written in scene time; with a lines file carrying warp_anchors_new_old they are mapped to output time.
import sys, wave, json
import numpy as np

SR = 44100
ANC = [[0, 0], [82.5, 82.5]]
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
r = np.random.RandomState(13)
T_DUN = 3.2; T_DEV = 13.27; T_BUG = 20.16; T_FLIP = 26.14; T_BOX = 31.88; T_POP = 36.39; T_POPE = 45.32; T_NY = 45.27; T_3D = 51.69; T_BIL = 60.56; T_VI = 68.42; T_HOME = 76.23
def pad(t0, t1, notes, g):
    d = t1 - t0; tb = tt(d); x = np.zeros(len(tb))
    for m in notes: x += np.sin(2 * np.pi * note(m) * tb) + 0.3 * np.sin(2 * np.pi * note(m) * 2.003 * tb)
    e = np.minimum(1, tb / 1.5) * np.minimum(1, (d - tb) / 1.5); put(music, lp(x, 0.2) * e, t0, g, True)

# synthwave-ish bed: bass + arp, darker at the start, brighter from 2001, big at GTA VI
x = 0.0; i = 0; step = 0.2
while x < DUR - 1.2:
    if not (T_POP < x < T_POPE):
        g = 0.5 if x < T_3D else 0.8 if x < T_VI else 1.0
        put(music, tri(note([40, 40, 43, 38][(i // 16) % 4]), step * 0.95) * env_adsr(int(step * 0.95 * SR)), x, 0.07 * g, True)
        if x > T_DEV and i % 2 == 0: put(music, sq(note([64, 67, 71, 74, 71, 67][(i // 2) % 6]), 0.12, 0.25) * env_adsr(int(0.12 * SR)), x, 0.025 * g, True)
    x += step; i += 1
# glitch at the hook
for j in range(10): put(sfx, sq(80 + r.rand() * 900, 0.05, 0.5) * env_adsr(int(0.05 * SR)), 0.2 + j * 0.2, 0.06)
put(amb, lp(noise(T_DEV - T_DUN), 0.03), T_DUN, 0.05)  # Dundee rain-wind
x = T_DUN + 3
while x < T_BUG: put(sfx, lp(noise(0.02), 0.9) * np.exp(-tt(0.02) * 200), x, 0.1); x += 0.11 + r.rand() * 0.08  # typing
# sirens + crashes in the top-down chaos
d = T_BOX - T_BUG; tb = tt(d); put(sfx, np.sin(2 * np.pi * np.cumsum(700 + 250 * np.sign(np.sin(2 * np.pi * 1.5 * tb))) / SR), T_BUG, 0.03)
for j in range(7): dd = 0.3; put(sfx, (np.sin(2 * np.pi * 70 * tt(dd)) + lp(noise(dd), 0.5)) * np.exp(-tt(dd) * 12), T_BUG + 0.5 + j * 0.8 + r.rand() * 0.3, 0.22)
d = T_BOX - T_FLIP; tb = tt(d); put(sfx, lp(sq(55, d, 0.5), 0.1) * (0.7 + 0.3 * np.sin(2 * np.pi * 2 * tb)), T_FLIP, 0.05)  # engine
put(sfx, sq(note(76), 0.1, 0.25) * env_adsr(int(0.1 * SR)), T_POP, 0.05); put(sfx, sq(note(72), 0.12, 0.25) * env_adsr(int(0.12 * SR)), T_POP + 0.1, 0.05)
put(sfx, sq(note(72), 0.1, 0.25) * env_adsr(int(0.1 * SR)), T_POPE - 0.3, 0.05); put(sfx, sq(note(76), 0.12, 0.25) * env_adsr(int(0.12 * SR)), T_POPE - 0.2, 0.05)
d = T_BIL - T_NY; put(amb, lp(noise(d), 0.05), T_NY, 0.06)  # city
for j in range(12): put(sfx, np.sin(2 * np.pi * 2400 * tt(0.06)) * np.exp(-tt(0.06) * 50), T_BIL + 0.6 + j * 0.45, 0.06)  # coins ticking
put(sfx, np.sin(2 * np.pi * 1760 * tt(0.8)) * np.exp(-tt(0.8) * 4), T_VI - 0.4, 0.06)
for j in range(3): put(amb, lp(noise(1.5), 0.05) * np.sin(np.pi * tt(1.5) / 1.5), T_VI + 0.5 + j * 2.4, 0.05)  # waves

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
