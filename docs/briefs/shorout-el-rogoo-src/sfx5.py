# Synthesises the music bed + SFX for "الشبشب — FINAL BOSS" and mixes them under the dialogue.
# usage: python3 sfx.py <dialogue.wav> <out_mix.wav> [lines_google.json]
# Event times are written in scene time; with a lines file carrying warp_anchors_new_old they are mapped to output time.
import sys, wave, json
import numpy as np

SR = 44100
ANC = [[0, 0], [41.3, 41.3]]
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
T_POWER = 26.3; T_FREEZE = 32.95
def birds(t0, t1, g):
    r = np.random.RandomState(int(t0 * 10))
    for ts in np.arange(t0, t1, 0.18):
        if r.rand() < 0.45:
            d = 0.06 + r.rand() * 0.08; f0 = 2500 + r.rand() * 2000; f = np.linspace(f0, f0 * (1.2 + r.rand() * 0.4), int(d * SR))
            put(amb, np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.linspace(0, np.pi, int(d * SR))), ts, g)
birds(0, 4.96, 0.05); birds(38.62, 41.3, 0.05)
put(amb, lp(noise(4.96), 0.02), 0, 0.2); put(amb, lp(noise(41.3 - 38.62), 0.02), 38.62, 0.2)
# rooster
for j, (f0, f1, d) in enumerate([(500, 700, 0.15), (700, 900, 0.2), (900, 600, 0.55)]):
    f = np.linspace(f0, f1, int(d * SR)); ph = np.cumsum(f) / SR; x = np.sign(np.sin(2 * np.pi * ph)) * 0.5 + np.sin(4 * np.pi * ph) * 0.5
    put(amb, lp(x, 0.3) * env_adsr(int(d * SR), 0.02, 0.08), 0.05 + [0, 0.17, 0.4][j], 0.06)
# title jingle
for j, m in enumerate([72, 76, 79, 84]): put(sfx, sq(note(m), 0.1, 0.25) * env_adsr(int(0.1 * SR)), j * 0.08, 0.08)
# door creak 0.5
d = 0.7; f = 300 + 200 * np.sin(np.linspace(0, 14, int(d * SR))) + np.linspace(0, 200, int(d * SR)); put(sfx, lp(np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)), 0.15) * env_adsr(int(d * SR), 0.05, 0.2), 0.5, 0.07)
# sparkle 3.74
for j, m in enumerate([84, 88, 91, 96]): put(sfx, sq(note(m), 0.06, 0.25) * env_adsr(int(0.06 * SR)), 3.74 + j * 0.05, 0.05)
# ---------- rules march 4.96-12.8 ----------
mel = [72, 72, 79, 79, 81, 81, 79, 0, 77, 77, 76, 76, 74, 74, 72, 0]
step = 60 / 112 / 2; t = 4.96; i = 0
while t < 12.6:
    m = mel[i % len(mel)]
    if m: put(music, sq(note(m), step * 0.7, 0.25) * env_adsr(int(step * 0.7 * SR)), t, 0.035, True)
    if i % 2 == 0: put(music, tri(note([48, 55][(i // 2) % 2]), step * 1.5) * env_adsr(int(step * 1.5 * SR)), t, 0.08, True)
    if i % 4 == 0: put(music, lp(noise(0.04), 0.5) * np.exp(-tt(0.04) * 90), t, 0.08, True)
    t += step; i += 1
for ts in (6.2, 8.3): put(sfx, sq(1318, 0.07) * env_adsr(int(0.07 * SR)), ts, 0.1); put(sfx, sq(1760, 0.1) * env_adsr(int(0.1 * SR)), ts + 0.07, 0.08)
# rule 3: thunder sting + drone
d = 1.6; tb = tt(d); put(sfx, lp(noise(d), 0.08) * np.exp(-tb * 2.5) + np.sin(2 * np.pi * 45 * tb) * np.exp(-tb * 3), 13.7, 0.6)
d = 4.0; tb = tt(d); put(music, (np.sin(2 * np.pi * 55 * tb) + 0.6 * np.sin(2 * np.pi * 58 * tb)) * np.sin(np.linspace(0, np.pi, len(tb))), 12.8, 0.12)
# dialog pop 17.33 + clicks
put(sfx, sq(880, 0.05) * env_adsr(int(0.05 * SR)), 17.33, 0.08); put(sfx, sq(1320, 0.08) * env_adsr(int(0.08 * SR)), 17.38, 0.08)
for ts in (19.35, 19.9, 20.45): put(sfx, lp(noise(0.015), 0.7) * np.exp(-tt(0.015) * 200), ts, 0.5); put(sfx, sq(2000, 0.03) * env_adsr(int(0.03 * SR)), ts + 0.01, 0.04)
# sneaky whisper music 21.4-26.2 (pizzicato minor)
pm = [57, 60, 64, 60, 57, 59, 62, 59]; step = 60 / 100 / 2; t = 21.4; i = 0
while t < 26.2: put(music, pluck(note(pm[i % len(pm)]), 0.25, 0.98), t, 0.1, True); t += step; i += 1
# ---------- power on ----------
d = 0.25; put(sfx, lp(noise(d), 0.3) * np.exp(-tt(d) * 15) + np.sin(2 * np.pi * 60 * tt(d)) * np.exp(-tt(d) * 10), T_POWER, 0.7)
d = 2.0; tb = tt(d); put(amb, np.sin(2 * np.pi * np.cumsum(np.linspace(30, 100, len(tb))) / SR) * np.linspace(0, 1, len(tb)), T_POWER, 0.12)
put(sfx, noise(0.35) * 0.6, T_POWER, 0.18)  # TV static
for j, m in enumerate([76, 79, 84]): put(sfx, sq(note(m), 0.1, 0.25) * env_adsr(int(0.1 * SR)), 26.75 + j * 0.08, 0.07)
# ---------- chaos 29.2 - freeze ----------
d = T_FREEZE - 29.2; tb = tt(d)
engine = np.sign(np.sin(2 * np.pi * (48 + 6 * np.sin(2 * np.pi * 7 * tb)) * tb)) * (0.6 + 0.4 * (np.sin(2 * np.pi * 9 * tb) > 0))
put(sfx, lp(engine, 0.15) * np.linspace(0.3, 1, len(tb)), 29.2, 0.35)
put(sfx, (lp(noise(d), 0.6) - lp(noise(d), 0.1)) * np.linspace(0, 1, len(tb)), 29.8, 0.12)  # hose spray
for i in range(8): put(sfx, lp(noise(0.2), 0.7) * np.exp(-tt(0.2) * 20) + sum(np.sin(2 * np.pi * f0 * tt(0.2)) * np.exp(-tt(0.2) * 25) for f0 in (2300, 3100, 4100)) * 0.3, 31.0 + i * 0.32, 0.25)
mel2 = [76, 79, 81, 79, 76, 74, 72, 74]; step = 60 / 170 / 2; t = T_POWER + 0.35; i = 0
while t < T_FREEZE:
    put(music, sq(note(mel2[i % len(mel2)]), step * 0.9, 0.25) * env_adsr(int(step * 0.9 * SR)), t, 0.07, True)
    if i % 2 == 0: put(music, tri(note([45, 52][(i // 2) % 2]), step * 1.8) * env_adsr(int(step * 1.8 * SR)), t, 0.12, True)
    t += step; i += 1
for ts in np.arange(30.0, T_FREEZE, 0.5): put(sfx, sq(988, 0.2, 0.5) * env_adsr(int(0.2 * SR)), ts, 0.04); put(sfx, sq(784, 0.2, 0.5) * env_adsr(int(0.2 * SR)), ts + 0.25, 0.04)
# hard cut at freeze: zero everything after T_FREEZE (except later events added below)
i0 = int(T_FREEZE * SR); music[i0:] = 0; sfx[i0:] = 0; amb[i0:] = 0
d = 0.3; f = np.linspace(1200, 150, int(d * SR)); put(sfx, lp(np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * 0.5 + noise(d) * 0.5, 0.3) * np.linspace(1, 0, int(d * SR)), T_FREEZE, 0.25)
# achievement chime 33.0
for j, (f0, dl) in enumerate([(880, 0.0), (1318, 0.12), (1760, 0.26)]):
    d = 1.2; tb = tt(d); put(sfx, sum(np.sin(2 * np.pi * f0 * k * tb) * np.exp(-tb * (3 + k)) / k for k in (1, 2, 3)), 33.0 + dl, 0.12)
d = 0.5; put(sfx, lp(noise(d), 0.2) * np.sin(np.linspace(0, np.pi, int(d * SR))) ** 2, 32.98, 0.3)
put(sfx, sq(note(91), 0.08, 0.25) * env_adsr(int(0.08 * SR)), 33.6, 0.06)
# room tone during freeze
put(amb, lp(noise(36.9 - T_FREEZE), 0.01), T_FREEZE, 0.12)
# mom yell drum hit 36.9
put(sfx, np.sin(2 * np.pi * 70 * tt(0.4)) * np.exp(-tt(0.4) * 8), 36.9, 0.6); put(sfx, lp(noise(0.2), 0.3) * np.exp(-tt(0.2) * 25), 36.9, 0.6)
# sad trombone 38.9
for j, (a0, a1, d) in enumerate([(392, 370, 0.35), (370, 349, 0.35), (349, 330, 0.35), (330, 290, 1.0)]):
    f = np.linspace(a0, a1, int(d * SR)) * (1 + 0.02 * np.sin(np.linspace(0, d * 40, int(d * SR)))); ph = np.cumsum(f) / SR
    put(music, lp(np.sign(np.sin(2 * np.pi * ph)), 0.12) * env_adsr(int(d * SR), 0.03, 0.1), 38.9 + [0, 0.4, 0.8, 1.2][j], 0.12)
for j, m in enumerate([74, 75, 78, 79]): put(sfx, pluck(note(m), 0.6), 39.8 + j * 0.16 + 0.6, 0.16, True)
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
