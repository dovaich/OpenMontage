# Synthesises the music bed + SFX for «حكاية المخترع العالمي» and mixes them under the dialogue.
# usage: python3 sfx.py <dialogue.wav> <out_mix.wav> [lines_google.json]
# Event times are written in scene time; with a lines file carrying warp_anchors_new_old they are mapped to output time.
import sys, wave, json
import numpy as np

SR = 44100
ANC = [[0, 0], [54.3, 54.3]]
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
r = np.random.RandomState(25)
def jingle(t0, notes, step=0.07, g=0.08):
    for j, m in enumerate(notes): put(sfx, sq(note(m), 0.1, 0.25) * env_adsr(int(0.1 * SR)), t0 + j * step, g)
T_RW = 3.2199999999999998; T_HOOK = T_RW + 0.6; ERAS = [3.82, 14.05, 18.78, 29.66, 33.72, 37.05, 40.690000000000005]
for ts in np.arange(0.2, T_RW, 0.9):
    for k in range(3): put(amb, np.sin(2 * np.pi * (4200 + r.rand() * 500) * tt(0.04)) * env_adsr(int(0.04 * SR), 0.003, 0.02), ts + k * 0.07, 0.012)
d = 0.8; tb = tt(d); put(sfx, np.sin(2 * np.pi * np.cumsum(np.linspace(1200, 150, len(tb))) / SR) * 0.5 + lp(noise(d), 0.4) * 0.5, T_RW + 0.02, 0.25)
jingle(T_HOOK, [79, 84], 0.06, 0.07)
# nostalgic music box waltz under the whole story + film projector clatter in the flashbacks
step = 60 / 96; x = T_RW + 0.6; i = 0; mel = [76, 79, 84, 83, 79, 76, 74, 76, 79, 77, 74, 72]
while x < ERAS[5]:
    put(music, pluck(note(mel[i % 12]), 0.9, 0.997), x, 0.08, True)
    if i % 3 == 0: put(music, tri(note([48, 53, 55, 53][(i // 3) % 4]), step * 2.5) * env_adsr(int(step * 2.5 * SR), 0.02, 0.4), x, 0.07, True)
    x += step / 2 * (1.5 if i % 3 == 0 else 1); i += 1
for x0 in np.arange(T_RW + 0.6, ERAS[5], 0.08): put(amb, lp(noise(0.01), 0.9) * np.exp(-tt(0.01) * 300), x0, 0.025)
# era change whooshes + year "ding"
for e in ERAS[:5]: d = 0.4; put(sfx, lp(noise(d), 0.2) * np.sin(np.linspace(0, np.pi, int(d * SR))) ** 2, e, 0.2); put(sfx, np.sin(2 * np.pi * 1318 * tt(0.4)) * np.exp(-tt(0.4) * 8), e + 0.15, 0.05)
# 1975 crib clatter, 1985 volcano boom, 1995 blender + splash, 2000 fireworks + chandelier crash, 2010 rocket crib
for j in range(8): put(sfx, lp(noise(0.08), 0.6) * np.exp(-tt(0.08) * 40), ERAS[0] + 1.5 + j * 0.18, 0.15)
d = 1.0; tb = tt(d); put(sfx, np.sin(2 * np.pi * np.cumsum(np.linspace(80, 30, len(tb))) / SR) * np.exp(-tb * 3) + lp(noise(d), 0.15) * np.exp(-tb * 2.5), ERAS[1] + 1.8, 0.6)
d = 26.32 - 22.87; tb = tt(d); put(sfx, lp(noise(d), 0.5) * 0.5 + np.sin(2 * np.pi * 300 * tb) * 0.3, 22.87, 0.05)
put(sfx, lp(noise(0.3), 0.3) * np.exp(-tt(0.3) * 10), 26.32 - 0.3, 0.35)
for j in range(4): d = 0.5; tb = tt(d); put(sfx, np.sin(2 * np.pi * np.cumsum(np.linspace(600, 1800, len(tb))) / SR) * 0.4, ERAS[3] + 2.3 + j * 0.1, 0.06)
for j in range(6): put(sfx, lp(noise(0.15), 0.8) * np.exp(-tt(0.15) * 15), ERAS[3] + 3.3 + j * 0.12, 0.15)
put(sfx, sum(np.sin(2 * np.pi * f0 * tt(1.0)) * np.exp(-tt(1.0) * 4) for f0 in (900, 1350, 2000)) / 3, ERAS[3] + 3.7, 0.25)
d = 1.0; tb = tt(d); put(sfx, lp(noise(d), 0.3) * np.minimum(1, tb * 3), ERAS[4] + 1.8, 0.25)
# montage: fast card whooshes
n = 11; dd = (ERAS[6] - ERAS[5]) / n
for j in range(n): put(sfx, sq(note(72 + j), 0.06, 0.5) * env_adsr(int(0.06 * SR)), ERAS[5] + j * dd, 0.05)
put(sfx, np.sin(2 * np.pi * 55 * tt(0.6)) * np.exp(-tt(0.6) * 5), 40.99, 0.4)
for j in range(10): put(sfx, sq(note(60 + j * 2), 0.06, 0.5) * env_adsr(int(0.06 * SR)), 46.38 + j * 0.14, 0.05)
for j, m in enumerate([74, 75, 78, 79]): put(sfx, pluck(note(m), 0.6), 51.4 + j * 0.16, 0.16, True)
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
