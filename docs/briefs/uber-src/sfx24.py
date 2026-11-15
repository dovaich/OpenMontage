# Synthesises the music bed + SFX for «أوبر إبراهيم» and mixes them under the dialogue.
# usage: python3 sfx.py <dialogue.wav> <out_mix.wav> [lines_google.json]
# Event times are written in scene time; with a lines file carrying warp_anchors_new_old they are mapped to output time.
import sys, wave, json
import numpy as np

SR = 44100
ANC = [[0, 0], [52.9, 52.9]]
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
wind(0.0, T_RW + 0.3, 0.5); roar(0.0, T_RW + 0.3, 0.25)
put(sfx, np.sin(2 * np.pi * 55 * tt(0.6)) * np.exp(-tt(0.6) * 5), 0.05, 0.4)
d = 0.5; tb = tt(d); put(sfx, np.sin(2 * np.pi * np.cumsum(np.linspace(1200, 200, len(tb))) / SR) * 0.5 + lp(noise(d), 0.4) * 0.5, T_RW + 0.02, 0.2)
jingle(T_HOOK, [79, 84], 0.06, 0.07)
# street: old engine putter + horns + city
d = T_BTN - T_ROAD; tb = tt(d); put(amb, lp(np.sign(np.sin(2 * np.pi * 32 * tb)), 0.08), T_ROAD, 0.07); put(amb, lp(noise(d), 0.03), T_ROAD, 0.15)
for x0 in (T_ROAD + 1.0, T_ROAD + 4.5, T_ROAD + 7.0):
    put(sfx, lp(np.sign(np.sin(2 * np.pi * 420 * tt(0.3))) + np.sign(np.sin(2 * np.pi * 530 * tt(0.3))), 0.3) * env_adsr(int(0.3 * SR)), x0, 0.03)
# uber app ping
for j, m in enumerate([84, 88]): put(sfx, np.sin(2 * np.pi * note(m) * tt(0.3)) * np.exp(-tt(0.3) * 8), T_ROAD + 0.3 + j * 0.1, 0.08)
# chill driving groove
step = 60 / 104 / 2; x = T_ROAD; i = 0
while x < T_BTN:
    put(music, tri(note([45, 45, 48, 50][(i // 8) % 4]), step * 0.9) * env_adsr(int(step * 0.9 * SR)), x, 0.09, True)
    if i % 4 == 2: put(music, pluck(note([69, 72, 76][(i // 4) % 3]), 0.4), x, 0.07, True)
    x += step; i += 1
# button click (finger close-up)
put(sfx, lp(noise(0.04), 0.9) * np.exp(-tt(0.04) * 120), T_BTN - 0.02, 0.5)
# red button: beep + rocket ignition + roar + whistle up
for j, m in enumerate([88, 91]): put(sfx, sq(note(m), 0.08, 0.5) * env_adsr(int(0.08 * SR)), T_BTN - 0.2 + j * 0.1, 0.06)
d = 1.2; tb = tt(d); put(sfx, np.sin(2 * np.pi * np.cumsum(np.linspace(90, 30, len(tb))) / SR) * np.exp(-tb * 3) + lp(noise(d), 0.15) * np.exp(-tb * 2), T_BTN, 0.8)
roar(T_BTN, T_LAND - 0.2, 0.3); wind(T_BTN + 1.0, T_LAND, 0.45)
step = 60 / 150 / 2; x = T_BTN + 0.3; i = 0
while x < T_LAND - 0.5: put(music, sq(note([72, 76, 79, 84, 79, 76][i % 6]), step * 0.8, 0.25) * env_adsr(int(step * 0.8 * SR)), x, 0.03, True); x += step; i += 1
# crash
d = 1.4; tb = tt(d); put(sfx, np.sin(2 * np.pi * np.cumsum(np.linspace(80, 28, len(tb))) / SR) * np.exp(-tb * 2.5) + lp(noise(d), 0.12) * np.exp(-tb * 2.2), T_LAND, 0.9)
for j in range(9): put(sfx, lp(noise(0.12), 0.2) * np.exp(-tt(0.12) * 25), T_LAND + 0.1 + j * 0.13 + r.rand() * 0.06, 0.35)
# rating dropping: descending beeps
for j in range(4): put(sfx, sq(note(76 - j * 4), 0.12, 0.5) * env_adsr(int(0.12 * SR)), 45.36 + 0.2 + j * 0.33, 0.06)
for j, m in enumerate([74, 75, 78, 79]): put(sfx, pluck(note(m), 0.6), 50.0 + j * 0.16, 0.16, True)
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
