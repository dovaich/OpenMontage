# music bed + SFX for «ماكينة الفراخ النووية», mixed under the dialogue.
# usage: python3 sfx.py <dialogue.wav> <out_mix.wav> [lines_google.json]
# Event times are written in scene time; with a lines file carrying warp_anchors_new_old they are mapped to output time.
import sys, wave, json
import numpy as np

SR = 44100
ANC = [[0, 0], [39.6, 39.6]]
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
r = np.random.RandomState(31)
def jingle(t0, notes, step=0.07, g=0.08):
    for j, m in enumerate(notes): put(sfx, sq(note(m), 0.1, 0.25) * env_adsr(int(0.1 * SR)), t0 + j * step, g)
def cluck(t0, g=0.12, f0=None):
    f0 = f0 or 600 + r.rand() * 500
    for k in range(2):
        d = 0.07; tb = tt(d); put(sfx, sq(f0 * (1 - tb * 3), d, 0.3) * np.exp(-tb * 30), t0 + k * 0.11, g)
T_REV = 6.68; T_LR = 5.25; T_POP = 11.76; T_CRAZY = 20.12; T_BALC = 29.08; T_ANNO = 32.4
# fridge hum in the kitchen
put(amb, lp(sq(60, T_LR, 0.5), 0.02) + lp(noise(T_LR), 0.05), 0, 0.05)
put(sfx, lp(noise(0.15), 0.3) * np.exp(-tt(0.15) * 20), 0.05, 0.4)  # fridge door
jingle(T_REV, [72, 76, 79, 84, 88], 0.06, 0.07)
# machine hum + crank from reveal to pop
d = T_POP - T_REV; tb = tt(d); put(sfx, lp(sq(90, d, 0.4), 0.1) * (0.7 + 0.3 * np.sin(2 * np.pi * 6 * tb)), T_REV, 0.05)
for j in range(6): put(sfx, lp(noise(0.02), 0.8) * np.exp(-tt(0.02) * 200), T_POP - 1.2 + j * 0.18, 0.25)  # crank clicks
put(sfx, np.sin(2 * np.pi * 1760 * tt(0.6)) * np.exp(-tt(0.6) * 6), T_POP, 0.18)  # DING
d = 0.2; tb = tt(d); put(sfx, lp(noise(d), 0.6) * np.exp(-tb * 25), T_POP, 0.5)  # pop
cluck(T_POP + 0.4, 0.14, 700); cluck(13.4, 0.1, 700); cluck(16.95, 0.14, 650)
# crazy: machine overload + rapid pops + chaos clucks
d = 2.0; tb = tt(d); put(sfx, np.sign(np.sin(2 * np.pi * np.cumsum(np.linspace(90, 400, len(tb))) / SR)) * np.linspace(0.3, 1, len(tb)), T_CRAZY - 0.3, 0.05)
for j in range(29):
    tp = T_CRAZY + 0.25 + j * 0.11; put(sfx, lp(noise(0.08), 0.6) * np.exp(-tt(0.08) * 40), tp, 0.25)
x = T_CRAZY + 0.4
while x < T_BALC - 0.2: cluck(x, 0.06 + 0.04 * r.rand()); x += 0.12 + r.rand() * 0.25
for j in range(30): put(sfx, lp(noise(0.05), 0.5) * np.exp(-tt(0.05) * 60), T_CRAZY + 0.4 + r.rand() * (T_BALC - T_CRAZY - 0.6), 0.08)  # flaps
for j, m in enumerate([58, 57, 56, 53]): put(sfx, lp(sq(note(m), 0.3 if j < 3 else 0.7, 0.5), 0.2) * env_adsr(int((0.3 if j < 3 else 0.7) * SR)), 28.5 + j * 0.3, 0.05)
# balcony night: crickets + a few sleepy clucks
put(amb, np.sin(2 * np.pi * 4200 * tt(DUR - T_BALC)) * (np.sin(2 * np.pi * 9 * tt(DUR - T_BALC)) > 0.6), T_BALC, 0.012)
for j in range(5): cluck(T_BALC + 0.6 + j * 1.5 + r.rand() * 0.5, 0.05)
# music: bouncy bass + plucks, faster during chaos
x = 0.0; i = 0
while x < DUR - 3.4:
    step = 0.18 if T_CRAZY < x < T_BALC else 0.24
    put(music, tri(note([45, 45, 48, 50][(i // 8) % 4]), step * 0.9) * env_adsr(int(step * 0.9 * SR)), x, 0.09, True)
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
