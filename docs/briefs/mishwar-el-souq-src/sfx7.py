# Synthesises the music bed + SFX for "الشبشب — FINAL BOSS" and mixes them under the dialogue.
# usage: python3 sfx.py <dialogue.wav> <out_mix.wav> [lines_google.json]
# Event times are written in scene time; with a lines file carrying warp_anchors_new_old they are mapped to output time.
import sys, wave, json
import numpy as np

SR = 44100
ANC = [[0, 0], [38.5, 38.5]]
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
T_ARRIVE = 4.2; T_LAUNCH = 11.6; T_DIVE = 19.4; T_CRASH = 21.2; T_RESULT = 30.4; T_END = 36.41
r = np.random.RandomState(9)
# street ambience 0-12.8, wind 12.8-21.2, market crowd 21.2-end
put(amb, lp(noise(12.8), 0.03), 0, 0.35)
for ts in np.arange(1.0, 12.0, 2.9): f0 = [415, 466][r.randint(2)]; d = 0.3; put(amb, lp(sq(f0, d) * 0.6 + sq(f0 * 1.06, d) * 0.4, 0.15) * env_adsr(int(d * SR), 0.01, 0.05), ts + r.rand(), 0.022)
d = T_CRASH - 12.8; wind = lp(noise(d), 0.08) - lp(noise(d), 0.01); wind *= 0.7 + 0.3 * np.sin(np.linspace(0, 20, len(wind))); put(amb, wind, 12.8, 0.6)
d = 38.5 - T_CRASH; crowd = lp(noise(d), 0.06) * (0.8 + 0.2 * np.sin(np.linspace(0, 30, int(d * SR)))); put(amb, crowd, T_CRASH, 0.5)
for ts in np.arange(22.0, 38.0, 1.7):  # distant market calls (sung square glides)
    d = 0.5; f = np.linspace(note(60 + r.randint(5)), note(57 + r.randint(5)), int(d * SR)); put(amb, lp(np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)), 0.08) * env_adsr(int(d * SR), 0.05, 0.2), ts + r.rand() * 0.5, 0.015)
# title jingle
for j, m in enumerate([67, 71, 74, 79]): put(sfx, sq(note(m), 0.1, 0.25) * env_adsr(int(0.1 * SR)), j * 0.08, 0.08)
# tuk-tuk arrives from the sky: whistle down + thud
d = 1.5; f = np.linspace(1800, 300, int(d * SR)); put(sfx, np.sin(2 * np.pi * np.cumsum(f) / SR) * np.linspace(0.3, 1, int(d * SR)), T_ARRIVE - 1.5, 0.06)
put(sfx, np.sin(2 * np.pi * 60 * tt(0.4)) * np.exp(-tt(0.4) * 9), T_ARRIVE, 0.7); put(sfx, lp(noise(0.3), 0.3) * np.exp(-tt(0.3) * 15), T_ARRIVE, 0.4)
# idle putter of the engine while parked
d = T_LAUNCH - T_ARRIVE; tb = tt(d); idle = lp(np.sign(np.sin(2 * np.pi * 42 * tb)) * (np.sin(2 * np.pi * 7 * tb) > 0), 0.15); put(sfx, idle, T_ARRIVE, 0.06)
# sunglasses "shing" 10.45
put(sfx, sum(np.sin(2 * np.pi * f0 * tt(0.4)) * np.exp(-tt(0.4) * 9) for f0 in (3136, 4186)) / 2, 10.45, 0.12)
# launch boom + roar while flying
d = 1.0; tb = tt(d); put(sfx, np.sin(2 * np.pi * np.cumsum(np.linspace(90, 30, len(tb))) / SR) * np.exp(-tb * 3) + lp(noise(d), 0.15) * np.exp(-tb * 3), T_LAUNCH, 0.8)
d = T_CRASH - T_LAUNCH; tb = tt(d); roar = lp(noise(d), 0.2) * (0.5 + 0.5 * np.linspace(1, 0.4, len(tb))); put(sfx, roar, T_LAUNCH, 0.25)
# flying music: heroic 8-bit 12.8-19.4
mel = [72, 76, 79, 81, 79, 76, 74, 76]; step = 60 / 140 / 2; t = 12.8; i = 0
while t < T_DIVE:
    put(music, sq(note(mel[i % 8]), step * 0.85, 0.25) * env_adsr(int(step * 0.85 * SR)), t, 0.04, True)
    if i % 2 == 0: put(music, tri(note([48, 53, 55, 53][(i // 2) % 4]), step * 1.6) * env_adsr(int(step * 1.6 * SR)), t, 0.1, True)
    t += step; i += 1
# haggle meter ticks 14.6-16.0
for ts in np.arange(14.6, 16.0, 0.12): put(sfx, sq(1760, 0.03) * env_adsr(int(0.03 * SR)), ts, 0.04)
# dive: alarm + falling whistle
for ts in np.arange(T_DIVE, T_CRASH, 0.33): put(sfx, sq(988, 0.15) * env_adsr(int(0.15 * SR)), ts, 0.05); put(sfx, sq(740, 0.15) * env_adsr(int(0.15 * SR)), ts + 0.16, 0.05)
d = T_CRASH - T_DIVE; f = np.linspace(2200, 400, int(d * SR)); put(sfx, np.sin(2 * np.pi * np.cumsum(f) / SR), T_DIVE, 0.06)
# SPLAT: crunch + wet splats
d = 0.8; tb = tt(d); put(sfx, lp(noise(d), 0.4) * np.exp(-tb * 6) + np.sin(2 * np.pi * 70 * tb) * np.exp(-tb * 8), T_CRASH, 0.9)
for j in range(6): put(sfx, lp(noise(0.12), 0.25) * np.exp(-tt(0.12) * 30), T_CRASH + 0.25 + j * 0.13 + r.rand() * 0.05, 0.4)
# market shaabi groove 21.9-30.3
beat = 60 / 108; t = 21.9; i = 0; patt = ['D', '-', 'T', 'T', 'D', '-', 'T', '-']
while t < T_RESULT - 0.1:
    p = patt[i % 8]
    if p == 'D': put(music, np.sin(2 * np.pi * 70 * tt(0.3)) * np.exp(-tt(0.3) * 9), t, 0.2, True)
    if p == 'T': put(music, lp(noise(0.05), 0.7) * np.exp(-tt(0.05) * 80), t, 0.09, True)
    t += beat / 2; i += 1
# coin + deal sting 29.2
put(sfx, sum(np.sin(2 * np.pi * f0 * tt(0.6)) * np.exp(-tt(0.6) * 6) for f0 in (2637, 3520)) / 2, 29.2, 0.12)
# result fanfare + item ticks + legendary stamp
for j, m in enumerate([72, 76, 79, 84, 88]): put(sfx, sq(note(m), 0.1, 0.25) * env_adsr(int(0.1 * SR)), T_RESULT + j * 0.07, 0.09)
for ts in (T_RESULT + 1.0, T_RESULT + 1.7, T_RESULT + 2.4, T_RESULT + 3.1): put(sfx, sq(1318, 0.06) * env_adsr(int(0.06 * SR)), ts, 0.06)
put(sfx, np.sin(2 * np.pi * 80 * tt(0.4)) * np.exp(-tt(0.4) * 10), T_RESULT + 4.4, 0.5)
for j, m in enumerate([79, 83, 86, 91]): put(sfx, sq(note(m), 0.14, 0.25) * env_adsr(int(0.14 * SR), 0.003, 0.08), T_RESULT + 4.45 + j * 0.09, 0.08)
step = 60 / 120 / 2; t = T_RESULT + 0.6; i = 0; mel3 = [72, 79, 76, 79, 74, 79, 77, 79]
while t < T_END:
    put(music, sq(note(mel3[i % 8]), step * 0.8, 0.25) * env_adsr(int(step * 0.8 * SR)), t, 0.03, True)
    if i % 2 == 0: put(music, tri(note([48, 55, 53, 55][(i // 2) % 4]), step * 1.6) * env_adsr(int(step * 1.6 * SR)), t, 0.08, True)
    t += step; i += 1
for j, m in enumerate([74, 75, 78, 79]): put(sfx, pluck(note(m), 0.6), T_END + 0.3 + j * 0.16, 0.16, True)
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
