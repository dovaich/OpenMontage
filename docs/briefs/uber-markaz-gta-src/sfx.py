# Synthesises the music bed + SFX for «العربية في المركز» (GTA-look test) and mixes them under the dialogue.
# usage: python3 sfx.py <dialogue.wav> <out_mix.wav> [lines_google.json]
# Event times are written in scene time; with a lines file carrying warp_anchors_new_old they are mapped to output time.
import sys, wave, json
import numpy as np

SR = 44100
ANC = [[0, 0], [54.6, 54.6]]
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
T_RW = 3.05; T_HOOK = T_RW + 0.6; T_ROAD = 10.23; T_BTN = 32.83; T_LAND = 45.96
def wind(a, b, g): tb = tt(b - a); put(amb, lp(noise(b - a), 0.04) * (0.6 + 0.4 * np.sin(2 * np.pi * 0.5 * tb)), a, g)
def roar(a, b, g): tb = tt(b - a); put(sfx, lp(noise(b - a), 0.25) * np.minimum(1, tb * 3), a, g)
LN = json.load(open('../artifacts/lines.json'))['lines']; Lx = lambda i: LN[i - 1]
T_RW = Lx(1)['t1'] + 0.15; T_HOOK = T_RW + 0.6; T_SW = Lx(10)['t1'] + 0.08; T_BTN = T_SW + 0.85; T_ANNO = Lx(14)['t0']
A_ROOF = (4.4 / 1.7) ** 0.5; T_ROOF = T_BTN + A_ROOF
r = np.random.RandomState(3)
# cold open: rocket roar + roof smash
roar(0.0, T_RW + 0.3, 0.3); put(sfx, np.sin(2 * np.pi * 55 * tt(0.6)) * np.exp(-tt(0.6) * 5), 0.05, 0.4)
tr = (A_ROOF - 0.25) / 0.75
d = 0.9; tb = tt(d); put(sfx, lp(noise(d), 0.35) * np.exp(-tb * 4), tr, 0.7)
for j in range(6): put(sfx, lp(noise(0.08), 0.5) * np.exp(-tt(0.08) * 30), tr + 0.15 + j * 0.12 + r.rand() * 0.05, 0.3)
d = 0.5; tb = tt(d); put(sfx, np.sin(2 * np.pi * np.cumsum(np.linspace(1200, 200, len(tb))) / SR) * 0.5 + lp(noise(d), 0.4) * 0.5, T_RW + 0.02, 0.2)
jingle(T_HOOK, [79, 84], 0.06, 0.07)
# garage ambience: radio hum + distant air tools
d = DUR - T_RW; tb = tt(d); put(amb, lp(noise(d), 0.02), T_RW, 0.12)
for x0 in (T_RW + 2.0, 14.0, 21.5, 29.0): put(amb, lp(np.sign(np.sin(2 * np.pi * 70 * tt(0.7))), 0.3) * env_adsr(int(0.7 * SR), 0.02, 0.2), x0, 0.025)
# pushing the car in: tyres rolling + creak
d = Lx(2)['t1'] - Lx(2)['t0'] + 0.3; tb = tt(d); put(sfx, lp(noise(d), 0.05) * (0.6 + 0.4 * np.sin(2 * np.pi * 1.5 * tb)), Lx(2)['t0'] - 0.3, 0.25)
# uber one-star sting, invoice ka-ching
for j, m in enumerate([76, 72, 67]): put(sfx, sq(note(m), 0.12, 0.5) * env_adsr(int(0.12 * SR)), Lx(5)['t0'] + 1.0 + j * 0.13, 0.05)
for j, m in enumerate([84, 91]): put(sfx, pluck(note(m), 0.5), Lx(9)['t0'] + 2.4 + j * 0.08, 0.14, True)
# sneaky bass groove under the dialogue
step = 60 / 96 / 2; x = T_RW + 0.6; i = 0
while x < T_SW:
    put(music, tri(note([40, 40, 43, 45, 47, 45, 43, 40][(i // 2) % 8]), step * 0.85) * env_adsr(int(step * 0.85 * SR)), x, 0.1, True)
    if i % 4 == 2: put(music, pluck(note([64, 67, 71][(i // 4) % 3]), 0.35), x, 0.05, True)
    x += step; i += 1
# horn honks (Bestem in the driver seat)
for x0 in (Lx(9)['t0'] + 0.6, Lx(9)['t0'] + 2.0, Lx(10)['t0'] + 0.5):
    put(sfx, lp(np.sign(np.sin(2 * np.pi * 410 * tt(0.25))) + np.sign(np.sin(2 * np.pi * 515 * tt(0.25))), 0.3) * env_adsr(int(0.25 * SR)), x0, 0.03)
# the swing (whoosh), the punch on the button, ignition, roar, roof smash
d = 0.35; tb = tt(d); put(sfx, lp(noise(d), 0.3) * np.sin(np.pi * tb / d), T_SW + 0.35, 0.35)
put(sfx, lp(noise(0.05), 0.9) * np.exp(-tt(0.05) * 100), T_BTN - 0.02, 0.6)
for j, m in enumerate([88, 91]): put(sfx, sq(note(m), 0.08, 0.5) * env_adsr(int(0.08 * SR)), T_BTN + 0.02 + j * 0.1, 0.06)
d = 1.2; tb = tt(d); put(sfx, np.sin(2 * np.pi * np.cumsum(np.linspace(90, 30, len(tb))) / SR) * np.exp(-tb * 3) + lp(noise(d), 0.15) * np.exp(-tb * 2), T_BTN, 0.8)
roar(T_BTN, Lx(12)['t0'], 0.3); wind(T_BTN + 1.0, Lx(12)['t0'] + 0.5, 0.3)
d = 0.9; tb = tt(d); put(sfx, lp(noise(d), 0.35) * np.exp(-tb * 4), T_ROOF, 0.7)
for j in range(8): put(sfx, lp(noise(0.1), 0.4) * np.exp(-tt(0.1) * 25), T_ROOF + 0.4 + j * 0.13 + r.rand() * 0.06, 0.3)
# Abu Samir: door + stunned silence, then the sad end sting
put(sfx, lp(noise(0.3), 0.1) * np.exp(-tt(0.3) * 6), Lx(11)['t1'] - 0.2, 0.3)
for j in range(4): put(sfx, sq(note(76 - j * 4), 0.14, 0.5) * env_adsr(int(0.14 * SR)), T_ANNO + 0.5 + j * 0.35, 0.06)
for j, m in enumerate([74, 75, 78, 79]): put(sfx, pluck(note(m), 0.6), DUR - 3.2 + j * 0.16, 0.16, True)
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
