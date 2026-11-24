# music bed + SFX for «المظلة النووية», mixed under the dialogue.
# usage: python3 sfx.py <dialogue.wav> <out_mix.wav> [lines_google.json]
# Event times are written in scene time; with a lines file carrying warp_anchors_new_old they are mapped to output time.
import sys, wave, json
import numpy as np

SR = 44100
ANC = [[0, 0], [38.7, 38.7]]
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
r = np.random.RandomState(24)
def jingle(t0, notes, step=0.07, g=0.08):
    for j, m in enumerate(notes): put(sfx, sq(note(m), 0.1, 0.25) * env_adsr(int(0.1 * SR)), t0 + j * step, g)
T_REV = 4.34; T_GRAB = 11.06; T_LIFT = 12.16; T_THROW = 20.62; T_HIT = 21.07; T_LAND = 21.62; T_IN = 27.03; T_ANNO = 31.74
# rain ambience all the way + light drips
put(amb, lp(noise(DUR), 0.35) * 0.6 + lp(noise(DUR), 0.05) * 0.8, 0, 0.06)
for j in range(70): put(amb, np.sin(2 * np.pi * (1800 + r.rand() * 1500) * tt(0.03)) * np.exp(-tt(0.03) * 160), r.rand() * DUR, 0.03)
jingle(T_REV, [72, 76, 79, 84, 88], 0.06, 0.07)
# dryer whir (switch on at grab) rising into suction
d = T_HIT - T_GRAB; tb = tt(d); f = np.linspace(110, 260, len(tb)); f[int((T_LIFT - T_GRAB) * SR):] *= 1.0
whir = np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * 0.3 + lp(noise(d), 0.3)
put(sfx, lp(whir, 0.15) * np.minimum(1, tb * 4), T_GRAB, 0.09)
d = 1.2; tb = tt(d); put(sfx, lp(noise(d), 0.25) * np.sin(np.pi * tb / d), T_LIFT - 0.2, 0.45)  # suction whoosh up
d = 0.5; tb = tt(d); put(sfx, lp(noise(d), 0.3) * np.sin(np.pi * tb / d), T_THROW, 0.45)  # slipper swish
d = 0.25; tb = tt(d); put(sfx, (np.sin(2 * np.pi * 180 * tb * np.exp(-tb * 4)) + lp(noise(d), 0.5)) * np.exp(-tb * 18), T_HIT, 0.8)  # BONK
for j in range(3): put(sfx, sq(note(84 + j * 3), 0.08, 0.25) * env_adsr(int(0.08 * SR)), T_HIT + 0.12 + j * 0.08, 0.05)  # stars
d = T_LAND - T_HIT; tb = tt(d); put(sfx, np.sin(2 * np.pi * np.cumsum(np.linspace(1400, 300, len(tb))) / SR) * 0.6, T_HIT, 0.07)  # falling whistle
d = 0.9; tb = tt(d); put(sfx, lp(noise(d), 0.5) * np.exp(-tb * 5) + lp(noise(d), 0.08) * np.exp(-tb * 3), T_LAND, 0.85)  # SPLASH
for j in range(8): put(sfx, np.sin(2 * np.pi * (500 + r.rand() * 700) * tt(0.04)) * np.exp(-tt(0.04) * 90), T_LAND + 0.15 + r.rand() * 0.8, 0.12)
put(sfx, lp(noise(0.12), 0.4) * np.exp(-tt(0.12) * 30), T_IN + 0.85, 0.5)  # door shut
for j, m in enumerate([58, 57, 56, 53]): put(sfx, lp(sq(note(m), 0.3 if j < 3 else 0.7, 0.5), 0.2) * env_adsr(int((0.3 if j < 3 else 0.7) * SR)), T_IN + 1.0 + j * 0.3, 0.05)
# music: light bass + plucks
step = 0.24; x = 0.0; i = 0
while x < DUR - 3.4:
    if not (T_HIT < x < T_LAND + 0.3):
        put(music, tri(note([45, 48, 43, 50][(i // 8) % 4]), step * 0.9) * env_adsr(int(step * 0.9 * SR)), x, 0.09, True)
        if i % 4 == 2: put(music, pluck(note([69, 72, 76][(i // 4) % 3]), 0.4), x, 0.07, True)
    x += step; i += 1
jingle(DUR - 3.3, [72, 76, 79, 84], 0.12, 0.08)
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
