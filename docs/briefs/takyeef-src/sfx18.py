# Synthesises the music bed + SFX for «التكييف النووي» and mixes them under the dialogue.
# usage: python3 sfx.py <dialogue.wav> <out_mix.wav> [lines_google.json]
# Event times are written in scene time; with a lines file carrying warp_anchors_new_old they are mapped to output time.
import sys, wave, json
import numpy as np

SR = 44100
ANC = [[0, 0], [46.4, 46.4]]
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
T_RW = 5.45; T_HOOK = 6.05; T_REVEAL = 11.5; T_SIT = 21.4; T_COLD = 22.4; T_MOM = 27.0; T_ICE = 32.9; T_ANNO = 36.6
r = np.random.RandomState(18)
def jingle(t0, notes, step=0.07, g=0.08):
    for j, m in enumerate(notes): put(sfx, sq(note(m), 0.1, 0.25) * env_adsr(int(0.1 * SR)), t0 + j * step, g)
def wind(a, b, g): tb = tt(b - a); put(amb, lp(noise(b - a), 0.04) * (0.6 + 0.4 * np.sin(2 * np.pi * 0.5 * tb)), a, g)
wind(0.0, T_RW + 0.5, 0.35); wind(T_COLD, 46.4, 0.3)
put(sfx, np.sin(2 * np.pi * 55 * tt(0.6)) * np.exp(-tt(0.6) * 5), 0.05, 0.45)
d = 0.5; tb = tt(d); put(sfx, np.sin(2 * np.pi * np.cumsum(np.linspace(1200, 200, len(tb))) / SR) * 0.5 + lp(noise(d), 0.4) * 0.5, T_RW + 0.02, 0.2)
jingle(T_HOOK, [79, 84], 0.06, 0.07)
# summer heat: cicadas + broken fan hum
for ts in np.arange(T_RW + 0.6, T_SIT, 0.5): put(amb, np.sin(2 * np.pi * 5200 * tt(0.4)) * (np.sin(2 * np.pi * 60 * tt(0.4)) > 0) * env_adsr(int(0.4 * SR)), ts, 0.008)
step = 60 / 120 / 2; t = 6.1; i = 0; pat = [50, 0, 53, 0, 55, 54, 53, 0]
while t < T_SIT:
    m = pat[i % 8]
    if m: put(music, pluck(note(m + 12), 0.25), t, 0.09, True)
    if i % 4 == 0: put(music, lp(noise(0.03), 0.8) * np.exp(-tt(0.03) * 100), t, 0.04, True)
    t += step; i += 1
jingle(T_REVEAL, [67, 71, 74, 79, 83], 0.07, 0.08)
# fridge door + fan whirr
put(sfx, lp(noise(0.3), 0.3) * np.exp(-tt(0.3) * 10), T_REVEAL - 0.4, 0.3); d = 46.4 - T_REVEAL; tb = tt(d); put(amb, lp(np.sign(np.sin(2 * np.pi * 30 * tb)), 0.08), T_REVEAL, 0.05)
# freeze: crackle + sparkle
for ts in np.arange(T_COLD, T_COLD + 1.2, 0.05): put(sfx, np.sin(2 * np.pi * (3000 + r.rand() * 3000) * tt(0.03)) * np.exp(-tt(0.03) * 100), ts, 0.04)
for ts in np.arange(23.0, 26.8, 0.07): put(sfx, lp(noise(0.015), 0.9) * np.exp(-tt(0.015) * 300), ts, 0.06)  # teeth chatter
put(sfx, np.sin(2 * np.pi * 55 * tt(0.6)) * np.exp(-tt(0.6) * 5), T_MOM + 0.2, 0.45)
for j, m in enumerate([60, 59, 58]): put(music, sq(note(m), 0.25, 0.5) * env_adsr(int(0.25 * SR)), T_MOM + 1.6 + j * 0.27, 0.05, True)
for j in range(10): put(sfx, sq(note(60 + j * 2), 0.06, 0.5) * env_adsr(int(0.06 * SR)), 38.2 + j * 0.14, 0.05)
for j, m in enumerate([74, 75, 78, 79]): put(sfx, pluck(note(m), 0.6), 43.3 + j * 0.16, 0.16, True)
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
