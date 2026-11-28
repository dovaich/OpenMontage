# music bed + SFX for «tap», mixed under the dialogue.
# usage: python3 sfx.py <dialogue.wav> <out_mix.wav> [lines_google.json]
# Event times are written in scene time; with a lines file carrying warp_anchors_new_old they are mapped to output time.
import sys, wave, json
import numpy as np

SR = 44100
ANC = [[0, 0], [66.5, 66.5]]
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
r = np.random.RandomState(14)
T_EG = 4.22; T_KN = 14.57; T_RM = 20.67; T_TW = 26.69; T_POP = 31.87; T_POPE = 38.68; T_MO = 38.63; T_ID = 45.17; T_PA = 50.27; T_SE = 57.21; T_HOME = 61.38
def pad(t0, t1, notes, g):
    d = t1 - t0; tb = tt(d); x = np.zeros(len(tb))
    for m in notes: x += np.sin(2 * np.pi * note(m) * tb) + 0.3 * np.sin(2 * np.pi * note(m) * 2.003 * tb)
    e = np.minimum(1, tb / 1.5) * np.minimum(1, (d - tb) / 1.5); put(music, lp(x, 0.2) * e, t0, g, True)

x = 0.0; i = 0; step = 0.24
while x < DUR - 1.2:
    if not (T_POP < x < T_POPE):
        put(music, tri(note([45, 48, 43, 50][(i // 8) % 4]), step * 0.9) * env_adsr(int(step * 0.9 * SR)), x, 0.07, True)
        if i % 4 == 2: put(music, pluck(note([69, 72, 76][(i // 4) % 3]), 0.4), x, 0.05, True)
    x += step; i += 1
def water(a, b, g): d = b - a; tb = tt(d); put(sfx, lp(noise(d), 0.35) * np.minimum(1, tb * 4) * np.minimum(1, (d - tb) * 4), a, g)
water(0.6, T_EG - 0.2, 0.12); dd = 0.5; put(sfx, lp(noise(dd), 0.2) * np.exp(-tt(dd) * 6), 1.4, 0.3)  # hiss of steam
put(amb, lp(noise(T_KN - T_EG), 0.02), T_EG, 0.05)
water(T_KN + 0.3, T_RM - 0.2, 0.08)
for j in range(3): put(sfx, np.sin(2 * np.pi * 300 * tt(0.2)) * np.exp(-tt(0.2) * 20) + lp(noise(0.2), 0.5) * np.exp(-tt(0.2) * 20), T_RM + 1.2 + j * 0.35, 0.12)  # bronze valve creaks
water(T_RM + 1.8, T_TW - 0.2, 0.1); water(T_TW + 0.3, T_POP, 0.08)
put(sfx, sq(note(76), 0.1, 0.25) * env_adsr(int(0.1 * SR)), T_POP, 0.05); put(sfx, sq(note(72), 0.12, 0.25) * env_adsr(int(0.12 * SR)), T_POP + 0.1, 0.05)
put(sfx, sq(note(72), 0.1, 0.25) * env_adsr(int(0.1 * SR)), T_POPE - 0.3, 0.05); put(sfx, sq(note(76), 0.12, 0.25) * env_adsr(int(0.12 * SR)), T_POPE - 0.2, 0.05)
water(T_MO + 1.8, T_ID - 0.2, 0.1); put(sfx, lp(noise(0.6), 0.2) * np.exp(-tt(0.6) * 5), T_MO + 2.6, 0.3)
put(sfx, np.sin(2 * np.pi * 1760 * tt(0.7)) * np.exp(-tt(0.7) * 5), T_ID + 1.2, 0.08)  # idea ding
put(sfx, lp(noise(0.3), 0.6) * np.exp(-tt(0.3) * 12), T_PA + 0.6, 0.2)  # stamp
put(sfx, sq(note(84), 0.08, 0.25) * env_adsr(int(0.08 * SR)), T_SE + 1.4, 0.05); water(T_SE + 1.6, T_HOME, 0.1)

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
