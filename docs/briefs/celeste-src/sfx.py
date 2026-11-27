# music bed + SFX for «celeste», mixed under the dialogue.
# usage: python3 sfx.py <dialogue.wav> <out_mix.wav> [lines_google.json]
# Event times are written in scene time; with a lines file carrying warp_anchors_new_old they are mapped to output time.
import sys, wave, json
import numpy as np

SR = 44100
ANC = [[0, 0], [82.4, 82.4]]
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
r = np.random.RandomState(8)
T_DECK = 13.12; T_FOUND = 21.76; T_BOARD = 33.25; T_POP = 45.68; T_POPE = 49.73; T_LOG = 49.58; T_HOLD = 57.26; T_TH = 61.05; T_SNAP = 67.89; T_FOG = 69.19; T_HOME = 77.32
def pad(t0, t1, notes, g):
    d = t1 - t0; tb = tt(d); x = np.zeros(len(tb))
    for m in notes: x += np.sin(2 * np.pi * note(m) * tb) + 0.3 * np.sin(2 * np.pi * note(m) * 2.003 * tb)
    e = np.minimum(1, tb / 1.5) * np.minimum(1, (d - tb) / 1.5); put(music, lp(x, 0.2) * e, t0, g, True)

for a, b, ch, g in [(0, T_FOUND, [57, 60, 64], 0.018), (T_FOUND, T_LOG, [50, 53, 56], 0.02), (T_LOG, T_FOG, [48, 51, 55], 0.02), (T_FOG, T_HOME, [45, 48, 52], 0.022), (T_HOME, DUR, [50, 53, 57], 0.014)]:
    x = a
    while x < b - 0.5: pad(x, min(b, x + 4.2), ch, g); x += 4.0
# harbour: gulls, distant bell, water
put(amb, lp(noise(T_DECK), 0.04), 0, 0.06)
for j in range(4): put(amb, np.sin(2 * np.pi * np.cumsum(np.linspace(1800, 1200, int(0.3 * SR))) / SR) * np.exp(-tt(0.3) * 6), 1 + j * 2.7, 0.02)
for j in range(2): put(sfx, (np.sin(2 * np.pi * 520 * tt(2)) + 0.4 * np.sin(2 * np.pi * 1040 * tt(2))) * np.exp(-tt(2) * 2), 4 + j * 4, 0.03)
# open sea with creaking wood and wind in the sails
d = T_LOG - T_DECK; tb = tt(d); put(amb, lp(noise(d), 0.05) * (0.6 + 0.4 * np.sin(2 * np.pi * 0.2 * tb)), T_DECK, 0.08)
for j in range(16): put(sfx, np.sin(2 * np.pi * (90 + r.rand() * 40) * tt(0.5)) * np.exp(-tt(0.5) * 5) * lp(noise(0.5), 0.3), T_DECK + 1 + j * 2.0 + r.rand(), 0.06)
for j in range(6): put(sfx, lp(noise(0.4), 0.2) * np.sin(np.pi * tt(0.4) / 0.4), T_FOUND + 1 + j * 1.9, 0.08)  # sail flap
# oars + footsteps on an empty deck
for j in range(5): put(sfx, lp(noise(0.25), 0.2) * np.exp(-tt(0.25) * 8), T_BOARD + 0.3 + j * 0.8, 0.12)
for j in range(10): put(sfx, lp(noise(0.06), 0.4) * np.exp(-tt(0.06) * 40), T_BOARD + 3.5 + j * 0.55, 0.15)
# pause jingle
put(sfx, sq(note(76), 0.1, 0.25) * env_adsr(int(0.1 * SR)), T_POP, 0.05); put(sfx, sq(note(72), 0.12, 0.25) * env_adsr(int(0.12 * SR)), T_POP + 0.1, 0.05)
put(sfx, sq(note(72), 0.1, 0.25) * env_adsr(int(0.1 * SR)), T_POPE - 0.3, 0.05); put(sfx, sq(note(76), 0.12, 0.25) * env_adsr(int(0.12 * SR)), T_POPE - 0.2, 0.05)
# cabin: clock tick + creak; hold: hollow knocks on barrels
x = T_LOG
while x < T_HOLD: put(sfx, lp(noise(0.015), 0.9) * np.exp(-tt(0.015) * 300), x, 0.08); x += 0.5
for j in range(5): put(sfx, np.sin(2 * np.pi * 140 * tt(0.3)) * np.exp(-tt(0.3) * 12), T_HOLD + 0.6 + j * 0.7, 0.1)
# theory: rope creak, then the snap; fog: lapping water + wind
d = T_HOME - T_TH; put(amb, lp(noise(d), 0.04), T_TH, 0.07)
put(sfx, lp(noise(0.1), 0.8) * np.exp(-tt(0.1) * 40), T_SNAP, 0.45)
d = T_HOME - T_FOG; tb = tt(d); put(amb, lp(noise(d), 0.015) * (0.7 + 0.3 * np.sin(2 * np.pi * 0.1 * tb)), T_FOG, 0.08)

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
