# Synthesises the music bed + SFX for «فين التوكتوك؟» and mixes them under the dialogue.
# usage: python3 sfx.py <dialogue.wav> <out_mix.wav> [lines_google.json]
# Event times are written in scene time; with a lines file carrying warp_anchors_new_old they are mapped to output time.
import sys, wave, json
import numpy as np

SR = 44100
ANC = [[0, 0], [96.8, 96.8]]
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
T_G = 3.0; T_MK = 22.6; T_SY = 38.6; T_BAL = 55.0; T_CLUE1 = 19.95; T_ITEM = 35.5; T_CLUE3 = 52.1; T_SAG = 80.2
r = np.random.RandomState(14)
def whoosh(t0, d=0.5, g=0.25):
    x = noise(d); put(sfx, (lp(x, 0.08) + lp(x, 0.3) * np.linspace(0, 1, len(x))) * np.sin(np.linspace(0, np.pi, len(x))) ** 2, t0 - d / 2, g)
def jingle(t0, notes, step=0.07, g=0.08):
    for j, m in enumerate(notes): put(sfx, sq(note(m), 0.1, 0.25) * env_adsr(int(0.1 * SR)), t0 + j * step, g)
# title + quest start
for j, m in enumerate([67, 72, 76, 79]): put(music, pluck(note(m), 0.7), 0.1 + j * 0.22, 0.14, True)
jingle(1.25, [72, 79, 84], 0.09, 0.07)
# poster tape rips
for ts in (0.6, 1.4, 2.1): put(sfx, lp(noise(0.18), 0.7) * np.linspace(1, 0, int(0.18 * SR)), ts, 0.12)
# detective groove (walking bass + brushes) under the whole quest, ducked under speech
step = 60 / 104 / 2; t = 2.8; i = 0; bass = [40, 43, 45, 46, 45, 43, 40, 38]
while t < T_BAL:
    put(music, tri(note(bass[i % 8]), step * 0.9) * env_adsr(int(step * 0.9 * SR)), t, 0.11, True)
    if i % 2 == 1: put(music, lp(noise(0.05), 0.5) * np.exp(-tt(0.05) * 60), t, 0.04, True)
    if i % 16 == 8: put(music, sq(note(64 + (i // 16) % 3 * 3), step * 2, 0.25) * env_adsr(int(step * 2 * SR)), t, 0.018, True)
    t += step; i += 1
# location changes
for ts in (T_G, T_MK, T_SY, T_BAL): whoosh(ts); jingle(ts + 0.1, [76, 72], 0.08, 0.05)
# footsteps
def steps(a, b, g=0.08):
    for ts in np.arange(a, b, 0.29): put(sfx, lp(noise(0.05), 0.3) * np.exp(-tt(0.05) * 60), ts, g)
steps(T_G, 5.4, 0.1); steps(T_MK, 23.2); steps(T_ITEM, 38.6); steps(T_SY, 39.0); steps(T_BAL, 55.6)
# ambiences
for ts in np.arange(T_G, T_MK, 2.1): put(amb, sum(np.sin(2 * np.pi * f0 * tt(0.35)) * np.exp(-tt(0.35) * 12) for f0 in (900 + r.rand() * 400, 2300 + r.rand() * 600)) / 2, ts + r.rand(), 0.04)
put(amb, lp(noise(T_SY - T_MK), 0.04), T_MK, 0.22)
for ts in np.arange(T_SY, 96, 0.9):
    for k in range(3): put(amb, np.sin(2 * np.pi * (4200 + r.rand() * 500) * tt(0.04)) * env_adsr(int(0.04 * SR), 0.003, 0.02), ts + k * 0.07 + r.rand() * 0.3, 0.012)
d = 96.8 - T_BAL; tb = tt(d); put(amb, lp(np.sign(np.sin(2 * np.pi * 38 * tb)), 0.05), T_BAL, 0.05)  # tuk engine idling as a generator
# clue / item stings
jingle(T_CLUE1, [72, 76, 79, 84], 0.07, 0.09); jingle(T_ITEM, [79, 84, 88, 91], 0.06, 0.09); jingle(T_CLUE3 + 0.2, [72, 76, 79, 84, 88], 0.07, 0.09)
# Shehata outburst hit, melon munching
put(sfx, np.sin(2 * np.pi * 55 * tt(0.5)) * np.exp(-tt(0.5) * 6), 25.9, 0.4)
for ts in np.arange(46.7, 48.0, 0.22): put(sfx, lp(noise(0.08), 0.5) * np.exp(-tt(0.08) * 40), ts, 0.18)
# Hoda's shock + sad violin-ish wobble
put(sfx, np.sin(2 * np.pi * 55 * tt(0.6)) * np.exp(-tt(0.6) * 5), 55.45, 0.5)
d = 2.4; tb = tt(d); put(music, lp(np.sign(np.sin(2 * np.pi * np.cumsum(note(64) * (1 + 0.02 * np.sin(2 * np.pi * 6 * tb))) / SR)), 0.1) * env_adsr(len(tb), 0.1, 0.4), 62.4, 0.06, True)
# warm family theme from Om Hamada's invite
step = 60 / 112 / 2; t = 70.5; i = 0; mel = [72, 76, 79, 76, 74, 77, 81, 77]
while t < T_SAG - 0.3:
    put(music, pluck(note(mel[i % 8]), 0.4), t, 0.06, True)
    if i % 2 == 0: put(music, tri(note([48, 53, 55, 53][(i // 4) % 4]), step * 1.6) * env_adsr(int(step * 1.6 * SR)), t, 0.05, True)
    t += step; i += 1
# OVERLOAD: creak, crack, thump, alarm
d = 1.2; tb = tt(d); put(sfx, np.sin(2 * np.pi * np.cumsum(np.linspace(140, 90, len(tb)) * (1 + 0.1 * np.sign(np.sin(2 * np.pi * 30 * tb)))) / SR) * np.exp(-tb * 1.5), T_SAG, 0.3)
put(sfx, lp(noise(0.25), 0.8) * np.exp(-tt(0.25) * 14), T_SAG + 0.2, 0.5)
put(sfx, np.sin(2 * np.pi * 60 * tt(0.4)) * np.exp(-tt(0.4) * 8), T_SAG + 0.25, 0.7)
for k in range(6): put(sfx, sq(880 if k % 2 else 660, 0.2, 0.5) * env_adsr(int(0.2 * SR)), 89.4 + k * 0.25, 0.04)
# quest complete fanfare + end loop + jingle
jingle(81.6, [67, 72, 76, 79, 84, 79, 84], 0.1, 0.09)
step = 60 / 120 / 2; t = 82.4; i = 0; mel3 = [72, 79, 76, 79, 74, 79, 77, 79]
while t < 92.0:
    put(music, sq(note(mel3[i % 8]), step * 0.8, 0.25) * env_adsr(int(step * 0.8 * SR)), t, 0.025, True)
    if i % 2 == 0: put(music, tri(note([48, 55, 53, 55][(i // 2) % 4]), step * 1.6) * env_adsr(int(step * 1.6 * SR)), t, 0.07, True)
    t += step; i += 1
for j, m in enumerate([74, 75, 78, 79]): put(sfx, pluck(note(m), 0.6), 92.3 + j * 0.16, 0.16, True)
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
