# music bed + SFX for «dairy2», mixed under the dialogue.
# usage: python3 sfx.py <dialogue.wav> <out_mix.wav> [lines_google.json]
# Event times are written in scene time; with a lines file carrying warp_anchors_new_old they are mapped to output time.
import sys, wave, json
import numpy as np

SR = 44100
ANC = [[0, 0], [53.5, 53.5]]
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
r = np.random.RandomState(4)
T_HIT = 18.66; T_MB = 24.16; T_ROLL = 25.76; T_REST = 26.86; T_FIRE = 29.81; T_AMB = 33.73; T_CARD = 41.68
def pad(t0, t1, notes, g):
    d = t1 - t0; tb = tt(d); x = np.zeros(len(tb))
    for m in notes: x += np.sin(2 * np.pi * note(m) * tb) + 0.3 * np.sin(2 * np.pi * note(m) * 2.003 * tb)
    e = np.minimum(1, tb / 1.5) * np.minimum(1, (d - tb) / 1.5); put(music, lp(x, 0.2) * e, t0, g, True)

ch = [[50, 53, 57], [46, 50, 53], [48, 52, 55], [45, 48, 52]]
x = 0.0; i = 0
while x < DUR - 1: pad(x, min(DUR, x + 4.2), ch[i % 4], 0.016); x += 4.0; i += 1
# highway: tyre/engine rumble until the crash, then idling crowd of engines
d = T_CARD; tb = tt(d); put(amb, lp(noise(d), 0.03) + lp(sq(55, d, 0.5), 0.02) * 0.3, 0, 0.07)
for j in range(6): t0 = 2 + j * 2.6; dd = 1.4; tb = tt(dd); put(amb, lp(noise(dd), 0.08) * np.sin(np.pi * tb / dd), t0, 0.05)  # cars passing
# the hit: thud + metal scrape
dd = 0.35; tb = tt(dd); put(sfx, (np.sin(2 * np.pi * 70 * tb) + lp(noise(dd), 0.4)) * np.exp(-tb * 9), T_HIT, 0.5)
dd = 1.2; tb = tt(dd); put(sfx, lp(noise(dd), 0.6) * np.sin(2 * np.pi * 9 * tb) * np.exp(-tb * 2), T_HIT + 0.1, 0.12)
# tyre screech while swerving
dd = T_MB - T_HIT; tb = tt(dd); put(sfx, np.sin(2 * np.pi * (1400 + 80 * np.sin(2 * np.pi * 7 * tb)) * tb) * np.minimum(1, tb * 3), T_HIT + 0.2, 0.025)
# microbus impact + rollover crunch
dd = 0.4; tb = tt(dd); put(sfx, (np.sin(2 * np.pi * 60 * tb) + lp(noise(dd), 0.5)) * np.exp(-tb * 8), T_MB, 0.55)
dd = 1.0; tb = tt(dd); put(sfx, (np.sin(2 * np.pi * 45 * tb) * 0.8 + lp(noise(dd), 0.35)) * np.exp(-tb * 3), T_REST - 0.1, 0.6)
for j in range(6): put(sfx, lp(noise(0.05), 0.8) * np.exp(-tt(0.05) * 50), T_ROLL + 0.2 + j * 0.15, 0.2)
# ignition whoomp + fire roar, growing
dd = 1.2; tb = tt(dd); put(sfx, lp(noise(dd), 0.15) * np.minimum(1, tb * 10) * np.exp(-tb * 1.5), T_FIRE, 0.6)
dd = T_CARD + 1 - T_FIRE; tb = tt(dd); put(sfx, lp(noise(dd), 0.08) * np.minimum(1, tb / 4) * (0.8 + 0.2 * np.sin(2 * np.pi * 0.7 * tb)), T_FIRE, 0.22)
for j in range(30): put(sfx, lp(noise(0.03), 0.7) * np.exp(-tt(0.03) * 120), T_FIRE + 0.5 + r.rand() * (T_CARD - T_FIRE), 0.1)  # crackle
for j in range(4): dd = 0.6; tb = tt(dd); put(sfx, lp(noise(dd), 0.2) * np.exp(-tb * 4), T_FIRE + 2.0 + j * 1.8 + r.rand(), 0.25)  # cars catching fire
# siren
dd = T_CARD + 1 - T_AMB; tb = tt(dd); put(sfx, np.sin(2 * np.pi * np.cumsum(700 + 250 * np.sign(np.sin(2 * np.pi * 1.2 * tb))) / SR) * np.minimum(1, tb / 2), T_AMB, 0.025)

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
