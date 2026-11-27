# music bed + SFX for «otzi», mixed under the dialogue.
# usage: python3 sfx.py <dialogue.wav> <out_mix.wav> [lines_google.json]
# Event times are written in scene time; with a lines file carrying warp_anchors_new_old they are mapped to output time.
import sys, wave, json
import numpy as np

SR = 44100
ANC = [[0, 0], [65.8, 65.8]]
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
r = np.random.RandomState(12)
T_FIND = 8.37; T_RES = 17.72; T_PAST = 22.69; T_POP = 29.48; T_POPE = 37.4; T_XRAY = 44.6; T_KILL = 51.22; T_ARROW = 53.82; T_SNOW = 55.28; T_HOME = 59.45
def pad(t0, t1, notes, g):
    d = t1 - t0; tb = tt(d); x = np.zeros(len(tb))
    for m in notes: x += np.sin(2 * np.pi * note(m) * tb) + 0.3 * np.sin(2 * np.pi * note(m) * 2.003 * tb)
    e = np.minimum(1, tb / 1.5) * np.minimum(1, (d - tb) / 1.5); put(music, lp(x, 0.2) * e, t0, g, True)

for a, b, ch, g in [(0, T_PAST, [50, 53, 57], 0.02), (T_PAST, T_POP, [55, 59, 62], 0.02), (T_POPE, T_KILL, [48, 51, 55], 0.02), (T_KILL, T_HOME, [45, 48, 51], 0.024), (T_HOME, DUR, [50, 53, 57], 0.014)]:
    x = a
    while x < b - 0.5: pad(x, min(b, x + 4.2), ch, g); x += 4.0
d = T_PAST; tb = tt(d); put(amb, lp(noise(d), 0.03) * (0.7 + 0.3 * np.sin(2 * np.pi * 0.15 * tb)), 0, 0.09)  # mountain wind
for j in range(14): put(sfx, lp(noise(0.08), 0.3) * np.exp(-tt(0.08) * 35), 1 + j * 0.5, 0.07)  # snow crunch steps
for j in range(12): put(sfx, (np.sin(2 * np.pi * 1400 * tt(0.05)) + lp(noise(0.05), 0.8)) * np.exp(-tt(0.05) * 60), T_RES + 0.3 + j * 0.35, 0.15)  # picks on ice
put(sfx, lp(noise(1.2), 0.04) * np.sin(np.pi * tt(1.2) / 1.2), T_PAST - 0.3, 0.2)  # time whoosh
put(sfx, sq(note(76), 0.1, 0.25) * env_adsr(int(0.1 * SR)), T_POP, 0.05); put(sfx, sq(note(72), 0.12, 0.25) * env_adsr(int(0.12 * SR)), T_POP + 0.1, 0.05)
put(sfx, sq(note(72), 0.1, 0.25) * env_adsr(int(0.1 * SR)), T_POPE - 0.3, 0.05); put(sfx, sq(note(76), 0.12, 0.25) * env_adsr(int(0.12 * SR)), T_POPE - 0.2, 0.05)
d = T_KILL - T_XRAY; tb = tt(d); put(amb, np.sin(2 * np.pi * 60 * tb) * 0.3 + lp(noise(d), 0.02), T_XRAY, 0.04)  # x-ray hum
dd = 0.7; tb = tt(dd); put(sfx, lp(noise(dd), 0.4) * np.sin(np.pi * tb / dd) * np.linspace(0.3, 1, len(tb)), T_ARROW - 0.1, 0.3)  # arrow whoosh
put(sfx, np.sin(2 * np.pi * 50 * tt(0.8)) * np.exp(-tt(0.8) * 4), T_ARROW + 0.7, 0.4)  # low thud at the blackout
d = T_HOME - T_SNOW; put(amb, lp(noise(d), 0.02), T_SNOW, 0.08)

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
