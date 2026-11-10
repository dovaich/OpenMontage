# Synthesises the music bed + SFX for "الشبشب — FINAL BOSS" and mixes them under the dialogue.
# usage: python3 sfx.py <dialogue.wav> <out_mix.wav> [lines_google.json]
# Event times are written in scene time; with a lines file carrying warp_anchors_new_old they are mapped to output time.
import sys, wave, json
import numpy as np

SR = 44100
ANC = [[0, 0], [54.5, 54.5]]
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
T_LAUNCH = 44.4; T_SHOW = 47.1; T_END = 52.26
# ---------- street ambience (all street shots) ----------
tb = tt(DUR); street = np.ones(len(tb)); street[(tb >= T_SHOW) & (tb < T_END)] = 0.1
put(amb, lp(noise(DUR), 0.03) * street, 0, 0.35)
r = np.random.RandomState(4)
for ts in np.arange(2.0, T_SHOW, 3.7):   # distant car horns
    f0 = [415, 466, 392][r.randint(3)]; d = 0.25 + r.rand() * 0.3
    put(amb, lp(sq(f0, d) * 0.6 + sq(f0 * 1.06, d) * 0.4, 0.15) * env_adsr(int(d * SR), 0.01, 0.05), ts + r.rand(), 0.025)
for ts in np.arange(1.0, T_SHOW, 0.33):  # birds / sparrows
    if r.rand() < 0.3:
        d = 0.05; f = np.linspace(3500, 4500, int(d * SR)); put(amb, np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.linspace(0, np.pi, int(d * SR))), ts, 0.025)
# title jingle
for j, m in enumerate([67, 71, 74, 79]): put(sfx, sq(note(m), 0.1, 0.25) * env_adsr(int(0.1 * SR)), j * 0.08, 0.08)
# tuk-tuk being pushed: wheel squeak + gravel (0-3.4)
for ts in np.arange(0.1, 3.4, 0.45): d = 0.12; f = 900 + 200 * np.sin(np.linspace(0, 6, int(d * SR))); put(sfx, lp(np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)), 0.2) * env_adsr(int(d * SR)), ts, 0.035)
put(sfx, lp(noise(3.3), 0.4) * 0.5, 0.1, 0.05)
# ---------- shaabi street groove (5.25 - 22.3): tabla + mizmar-ish square lead ----------
beat = 60 / 104; t = 5.25; i = 0
dum = lambda: np.sin(2 * np.pi * 70 * tt(0.3)) * np.exp(-tt(0.3) * 9)
tek = lambda: lp(noise(0.05), 0.7) * np.exp(-tt(0.05) * 80)
patt = ['D', '-', 'T', 'T', 'D', '-', 'T', '-']
while t < 22.3:
    p = patt[i % 8]
    if p == 'D': put(music, dum(), t, 0.22, True)
    if p == 'T': put(music, tek(), t, 0.1, True)
    t += beat / 2; i += 1
hij = [62, 63, 66, 67, 69, 70, 72, 74]; mel = [0, 1, 2, 1, 0, -1, 3, 2, 1, 0, 1, 2, 4, 3, 2, 1]
t = 5.25 + beat * 4; i = 0
while t < 22.3:
    m = mel[i % len(mel)]
    if m >= 0: put(music, lp(sq(note(hij[m]), beat * 0.45, 0.3), 0.35) * env_adsr(int(beat * 0.45 * SR), 0.01, 0.06), t, 0.04, True)
    t += beat / 2; i += 1
# tea slurp at 8.4, 41.6
for ts in (8.4, 41.6, 53.0): d = 0.4; put(sfx, (lp(noise(d), 0.3) - lp(noise(d), 0.05)) * np.sin(np.linspace(0, np.pi, int(d * SR))) * np.linspace(0.3, 1, int(d * SR)), ts, 0.2)
# coin/cash register for the tip 19.6
for j, m in enumerate([84, 88]): put(sfx, sq(note(m), 0.08, 0.25) * env_adsr(int(0.08 * SR)), 19.6 + j * 0.08, 0.08)
put(sfx, sum(np.sin(2 * np.pi * f0 * tt(0.6)) * np.exp(-tt(0.6) * 6) for f0 in (2637, 3520)) / 2, 19.75, 0.12)
# clue ticks
for ts in (7.6, 9.2, 23.4, 24.3): put(sfx, sq(1318, 0.06) * env_adsr(int(0.06 * SR)), ts, 0.06); put(sfx, sq(1760, 0.08) * env_adsr(int(0.08 * SR)), ts + 0.06, 0.05)
# crane-up whoosh 23.2 + quest-found jingle 27.6
d = 1.6; put(sfx, lp(noise(d), 0.15) * np.sin(np.linspace(0, np.pi, int(d * SR))) ** 2, 23.2, 0.25)
for j, m in enumerate([72, 76, 79, 84]): put(sfx, sq(note(m), 0.1, 0.25) * env_adsr(int(0.1 * SR)), 27.6 + j * 0.09, 0.08)
# sad violin-ish for Hoda's tears 32.05-35.0
d = 2.9; tb = tt(d); f = note(62) * (1 + 0.01 * np.sin(2 * np.pi * 5.5 * tb)); put(music, lp(np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * 0.5 + np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.5, 0.1) * env_adsr(len(tb), 0.3, 0.6), 32.05, 0.07)
# showman fanfare 35.0
for j, m in enumerate([67, 72, 76, 79]): put(music, sq(note(m), 0.18, 0.5) * env_adsr(int(0.18 * SR)), 35.0 + j * 0.14, 0.05)
put(music, sq(note(84), 0.7, 0.5) * env_adsr(int(0.7 * SR), 0.01, 0.4), 35.56, 0.05)
# rope creak while lowering 39.3-41.0, clunk at 41.0
for ts in np.arange(39.4, 41.0, 0.35): d = 0.15; f = 250 + 80 * np.sin(np.linspace(0, 8, int(d * SR))); put(sfx, lp(np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)), 0.1) * env_adsr(int(d * SR)), ts, 0.04)
put(sfx, np.sin(2 * np.pi * 80 * tt(0.3)) * np.exp(-tt(0.3) * 12) + lp(noise(0.3), 0.3) * np.exp(-tt(0.3) * 20) * 0.5, 41.0, 0.6)
# engine revving up 41.0 -> launch (rising)
d = T_LAUNCH - 41.0; tb = tt(d); fr = np.linspace(35, 110, len(tb)); ph = np.cumsum(fr) / SR
rev = np.sign(np.sin(2 * np.pi * ph)) * (0.6 + 0.4 * (np.sin(2 * np.pi * ph / 4) > 0)); put(sfx, lp(rev, 0.2) * np.linspace(0.3, 1, len(tb)), 41.0, 0.3)
# hum of the "nuclear" pan
put(sfx, np.sin(2 * np.pi * np.cumsum(np.linspace(120, 480, len(tb))) / SR) * np.linspace(0, 1, len(tb)), 41.0, 0.06)
# LAUNCH: boom + jet roar + doppler away
d = 1.2; tb = tt(d); put(sfx, np.sin(2 * np.pi * np.cumsum(np.linspace(90, 30, len(tb))) / SR) * np.exp(-tb * 3) + lp(noise(d), 0.15) * np.exp(-tb * 3), T_LAUNCH, 0.8)
d = T_SHOW - T_LAUNCH; tb = tt(d); roar = lp(noise(d), 0.25) * np.linspace(1, 0.15, len(tb)); put(sfx, roar, T_LAUNCH, 0.45)
put(sfx, np.sign(np.sin(2 * np.pi * np.cumsum(np.linspace(140, 60, len(tb))) / SR)) * np.linspace(0.6, 0.05, len(tb)), T_LAUNCH, 0.12)
# vehicle unlocked jingle + showroom loop
for j, m in enumerate([72, 76, 79, 84, 88, 91]): put(sfx, sq(note(m), 0.1, 0.25) * env_adsr(int(0.1 * SR)), T_SHOW + j * 0.07, 0.09)
step = 60 / 128 / 2; t = T_SHOW + 0.5; i = 0; mel2 = [72, 79, 76, 79, 74, 79, 76, 79]
while t < T_END - 0.1:
    put(music, sq(note(mel2[i % 8]), step * 0.8, 0.25) * env_adsr(int(step * 0.8 * SR)), t, 0.035, True)
    if i % 2 == 0: put(music, tri(note([48, 55, 52, 55][(i // 2) % 4]), step * 1.6) * env_adsr(int(step * 1.6 * SR)), t, 0.09, True)
    t += step; i += 1
# far-away twinkle + end jingle
put(sfx, sq(note(96), 0.12, 0.25) * env_adsr(int(0.12 * SR)), 52.65, 0.05)
for j, m in enumerate([74, 75, 78, 79]): put(sfx, pluck(note(m), 0.6), 52.9 + j * 0.16, 0.16, True)
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
