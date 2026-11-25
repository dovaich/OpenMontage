# music bed + SFX for «مولّد أصوات الشغل النووي», mixed under the dialogue.
# usage: python3 sfx.py <dialogue.wav> <out_mix.wav> [lines_google.json]
# Event times are written in scene time; with a lines file carrying warp_anchors_new_old they are mapped to output time.
import sys, wave, json
import numpy as np

SR = 44100
ANC = [[0, 0], [44.4, 44.4]]
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
r = np.random.RandomState(41)
def jingle(t0, notes, step=0.07, g=0.08):
    for j, m in enumerate(notes): put(sfx, sq(note(m), 0.1, 0.25) * env_adsr(int(0.1 * SR)), t0 + j * step, g)
def clack(t0, g=0.3): d = 0.03; put(sfx, lp(noise(d), 0.8) * np.exp(-tt(d) * 150), t0, g)
L = {2: (3.99, 7.65), 3: (8.25, 11.52), 4: (11.82, 13.84), 5: (14.09, 17.2), 6: (17.55, 19.81), 7: (20.16, 22.91), 8: (23.81, 26.9), 9: (27.5, 29.09), 10: (29.89, 32.59)}
T_CAFE = 3.84; T_BTN = 7.09; T_OFF = 12.12; T_REVEAL = 26.0; T_BALC = 29.64; T_ANNO = 32.94
LIES = [5.37, 17.0, 22.71]; T_RESET = 21.35
home = [(0, T_CAFE), (11.72, 13.99), (17.45, 20.06)]
def in_home(x): return any(a <= x < b for a, b in home)
# café ambience: crowd murmur + random cup/dice clinks, outside home shots
mur = lp(noise(DUR), 0.03) * 0.9 + lp(noise(DUR), 0.12) * 0.3
gate = np.array([0.0 if in_home(i / SR) or i / SR >= T_BALC else 1.0 for i in range(0, int(DUR * SR), 441)]); gate = np.repeat(gate, 441)[: len(mur)]
gate = np.convolve(gate, np.ones(2000) / 2000, mode='same'); put(amb, mur * gate, 0, 0.07)
for j in range(40):
    x = r.rand() * T_BALC
    if not in_home(x): put(amb, np.sin(2 * np.pi * (2400 + r.rand() * 1600) * tt(0.05)) * np.exp(-tt(0.05) * 70), x, 0.03)
# home: TV murmur + fly buzz
for a, b in home:
    d = b - a; tb = tt(d); put(amb, np.sin(2 * np.pi * (220 + 15 * np.sin(2 * np.pi * 30 * tb)) * tb) * (0.5 + 0.5 * np.sin(2 * np.pi * 3 * tb)), a, 0.006)
# the generator: hammer clanks + drill + horn
x = T_BTN + 0.1
while x < T_OFF:
    g = 0.12 if in_home(x) else 0.3
    put(sfx, (np.sin(2 * np.pi * 1300 * tt(0.06)) * 0.6 + lp(noise(0.06), 0.7)) * np.exp(-tt(0.06) * 60), x, g); x += 0.14
d = T_OFF - T_BTN; tb = tt(d); drill = np.sign(np.sin(2 * np.pi * np.cumsum(180 + 40 * np.sin(2 * np.pi * 5 * tb)) / SR)); put(sfx, lp(drill, 0.25) * np.minimum(1, tb * 6), T_BTN, 0.05)
for x in [T_BTN + 0.5, T_BTN + 2.4, T_BTN + 4.0]: put(sfx, sq(415, 0.35, 0.4) * env_adsr(int(0.35 * SR)) + sq(330, 0.35, 0.4) * env_adsr(int(0.35 * SR)), x, 0.05)  # tuk-tuk horn
put(sfx, lp(noise(0.05), 0.6) * np.exp(-tt(0.05) * 80), T_BTN, 0.4)  # button click
jingle(T_BTN + 0.2, [72, 76, 79, 84, 88], 0.06, 0.06)
# bust: crackle + falling whistle
for j in range(10): put(sfx, lp(noise(0.03), 0.7) * np.exp(-tt(0.03) * 120), 8.65 + j * 0.15 + r.rand() * 0.05, 0.25)
d = 0.7; tb = tt(d); put(sfx, np.sin(2 * np.pi * np.cumsum(np.linspace(900, 200, len(tb))) / SR), T_OFF - 0.2, 0.05)
# tawla: dice + slam
for t0 in [L[3][0], L[7][0] + 0.4]:
    for j in range(5): clack(t0 + j * 0.07 + r.rand() * 0.02, 0.35)
put(sfx, lp(noise(0.12), 0.5) * np.exp(-tt(0.12) * 25) + np.sin(2 * np.pi * 120 * tt(0.12)) * np.exp(-tt(0.12) * 30), L[3][0] + 0.3, 0.7)  # piece slam
# lie buzzers
for x in LIES: put(sfx, lp(sq(110, 0.35, 0.5), 0.3) * env_adsr(int(0.35 * SR)), x, 0.12)
put(sfx, sq(note(84), 0.08, 0.25) * env_adsr(int(0.08 * SR)), T_RESET, 0.07); put(sfx, sq(note(79), 0.08, 0.25) * env_adsr(int(0.08 * SR)), T_RESET + 0.1, 0.07)
# footsteps of Om Hamada walking in (slippers)
for j in range(12): put(sfx, lp(noise(0.04), 0.4) * np.exp(-tt(0.04) * 60), 20.36 + j * 0.24, 0.18)
# reveal sting: dun-dun-DUN
for j, (m, dd) in enumerate([(45, 0.25), (44, 0.25), (40, 1.2)]): put(sfx, lp(sq(note(m), dd, 0.5), 0.15) * env_adsr(int(dd * SR), 0.005, 0.3), T_REVEAL + j * 0.3, 0.12)
for j, m in enumerate([58, 57, 56, 53]): put(sfx, lp(sq(note(m), 0.3 if j < 3 else 0.7, 0.5), 0.2) * env_adsr(int((0.3 if j < 3 else 0.7) * SR)), L[9][1] + 0.05 + j * 0.25, 0.05)
# balcony crickets
put(amb, np.sin(2 * np.pi * 4200 * tt(DUR - T_BALC)) * (np.sin(2 * np.pi * 9 * tt(DUR - T_BALC)) > 0.6), T_BALC, 0.012)
# music: café oud-ish plucks + bass, stops at the reveal, back softly on the balcony
x = 0.0; i = 0; step = 0.24
while x < DUR - 3.4:
    if not (T_REVEAL - 0.1 < x < T_BALC):
        g = 0.6 if x >= T_BALC else 1.0
        put(music, tri(note([45, 45, 43, 41][(i // 8) % 4]), step * 0.9) * env_adsr(int(step * 0.9 * SR)), x, 0.08 * g, True)
        if i % 2 == 1: put(music, pluck(note([69, 70, 73, 74, 76][(i // 2) % 5]), 0.35), x, 0.06 * g, True)
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
