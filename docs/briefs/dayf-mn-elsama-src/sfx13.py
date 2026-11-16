# Synthesises the music bed + SFX for «ضيف من السما» and mixes them under the dialogue.
# usage: python3 sfx.py <dialogue.wav> <out_mix.wav> [lines_google.json]
# Event times are written in scene time; with a lines file carrying warp_anchors_new_old they are mapped to output time.
import sys, wave, json
import numpy as np

SR = 44100
ANC = [[0, 0], [99.5, 99.5]]
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
T_REVEAL = 11.8; T_BIKE = 18.23; T_TWO = 30.9; T_WHISTLE = 32.4; T_CRASH = 38.6; T_DOOR = 46.3; T_PLUG = 64.2; T_LIGHTS = 64.5; T_SHUT = 82.2
r = np.random.RandomState(13)
def boom(t0, g=0.8, d=1.4):
    tb = tt(d); put(sfx, np.sin(2 * np.pi * np.cumsum(np.linspace(80, 28, len(tb))) / SR) * np.exp(-tb * 2.5) + lp(noise(d), 0.12) * np.exp(-tb * 2.2), t0, g)
# night: crickets + distant city murmur (city hum returns with the power)
for ts in np.arange(0.3, 99, 0.9):
    for k in range(3): put(amb, np.sin(2 * np.pi * (4200 + r.rand() * 500) * tt(0.04)) * env_adsr(int(0.04 * SR), 0.003, 0.02), ts + k * 0.07 + r.rand() * 0.3, 0.012)
put(amb, lp(noise(99.5 - T_LIGHTS), 0.03), T_LIGHTS, 0.18)
# title: soft night jingle
for j, m in enumerate([69, 72, 76, 74]): put(music, pluck(note(m), 0.8), 0.2 + j * 0.35, 0.14, True)
# lazy blackout groove under the opening (oud-ish plucks)
lazy = [(62, 0), (65, 0.6), (69, 1.2), (67, 2.0), (65, 2.6), (62, 3.2)]
for rep in (2.6, 6.6): 
    for m, off in lazy: put(music, pluck(note(m), 1.0, 0.996), rep + off, 0.09, True)
# reveal: cloth whoosh + fanfare
d = 0.6; put(sfx, lp(noise(d), 0.3) * np.sin(np.linspace(0, np.pi, int(d * SR))) ** 2, T_REVEAL - 0.1, 0.3)
for j, m in enumerate([67, 71, 74, 79, 83]): put(sfx, sq(note(m), 0.1, 0.25) * env_adsr(int(0.1 * SR)), 12.0 + j * 0.07, 0.08)
# pedalling: chain clicks + dynamo whine + fan whirr, workout music
for ts in np.arange(T_BIKE, 33.6, 0.11 if True else 0.2): put(sfx, lp(noise(0.012), 0.9) * np.exp(-tt(0.012) * 300), ts + (0.05 if ts > 23.6 else 0), 0.06)
d = 33.6 - T_BIKE; tb = tt(d); f = 300 + 120 * np.sin(2 * np.pi * 0.7 * tb); put(sfx, np.sin(2 * np.pi * np.cumsum(f) / SR) * (0.5 + 0.5 * (tb < 23.6 - T_BIKE)), T_BIKE, 0.02)
put(sfx, lp(noise(d), 0.15), T_BIKE, 0.05)
beat = 60 / 132; t = T_BIKE; i = 0
while t < T_WHISTLE:
    if i % 2 == 0: put(music, np.sin(2 * np.pi * np.cumsum(np.linspace(110, 45, int(0.16 * SR))) / SR) * np.exp(-tt(0.16) * 14), t, 0.16, True)
    if i % 4 == 2: put(music, lp(noise(0.06), 0.6) * np.exp(-tt(0.06) * 50), t, 0.07, True)
    if i % 8 in (1, 5): put(music, sq(note([64, 67, 69, 67][(i // 8) % 4]), beat * 0.3, 0.3) * env_adsr(int(beat * 0.3 * SR)), t, 0.03, True)
    t += beat / 2; i += 1
# +1% "achievement"
for j, m in enumerate([72, 76, 79, 84]): put(sfx, sq(note(m), 0.09, 0.25) * env_adsr(int(0.09 * SR)), T_TWO + j * 0.07, 0.08)
# incoming: falling whistle + alarm + jet roar
d = T_CRASH - T_WHISTLE; tb = tt(d); put(sfx, np.sin(2 * np.pi * np.cumsum(np.linspace(2200, 500, len(tb))) / SR) * np.linspace(0.2, 1, len(tb)), T_WHISTLE, 0.07)
for k in range(5): put(sfx, sq(880 if k % 2 else 660, 0.25, 0.5) * env_adsr(int(0.25 * SR)), 33.6 + k * 0.5, 0.035)
d = T_CRASH - 34.0; tb = tt(d); put(sfx, lp(noise(d), 0.35) * np.linspace(0.1, 1, len(tb)), 34.0, 0.3)
# CRASH
boom(T_CRASH, 0.9, 1.6)
for j in range(8): put(sfx, lp(noise(0.1), 0.6) * np.exp(-tt(0.1) * 30), T_CRASH + 0.1 + j * 0.12 + r.rand() * 0.05, 0.25)  # clatter
for j in range(4): put(sfx, np.sin(2 * np.pi * (1800 + j * 300) * tt(0.2)) * np.exp(-tt(0.2) * 15), T_CRASH + 0.5 + j * 0.25, 0.06)  # tin rattles
# dizzy tweets
for ts in np.arange(40.7, 44.0, 0.45): put(sfx, np.sin(2 * np.pi * np.cumsum(np.linspace(2400, 3200, int(0.08 * SR))) / SR) * env_adsr(int(0.08 * SR)), ts, 0.03)
# door + Om Hamada sting
put(sfx, lp(noise(0.4), 0.2) * np.linspace(1, 0, int(0.4 * SR)), T_DOOR, 0.2)
put(sfx, np.sin(2 * np.pi * 55 * tt(0.7)) * np.exp(-tt(0.7) * 5), 47.1, 0.5)
for j, m in enumerate([50, 49]): put(music, sq(note(m), 0.4, 0.5) * env_adsr(int(0.4 * SR)), 47.15 + j * 0.42, 0.06, True)
# idea sting + plug: click, breaker clunk, power hum rising, lights "tink" wave
for j, m in enumerate([79, 84, 91]): put(sfx, np.sin(2 * np.pi * note(m) * tt(0.4)) * np.exp(-tt(0.4) * 6), 59.0 + j * 0.08, 0.08)
put(sfx, lp(noise(0.05), 0.9) * np.exp(-tt(0.05) * 80), T_PLUG, 0.4)
put(sfx, np.sin(2 * np.pi * 60 * tt(0.3)) * np.exp(-tt(0.3) * 10), T_LIGHTS, 0.5)
d = 2.0; tb = tt(d); put(sfx, np.sin(2 * np.pi * np.cumsum(np.linspace(50, 120, len(tb))) / SR) * np.linspace(1, 0.3, len(tb)), T_LIGHTS, 0.08)
for j in range(14): put(sfx, np.sin(2 * np.pi * note(84 + (j % 5) * 2) * tt(0.15)) * np.exp(-tt(0.15) * 20), T_LIGHTS + 0.5 + j * 0.12, 0.04)
for j, m in enumerate([72, 76, 79, 84, 88]): put(sfx, sq(note(m), 0.1, 0.25) * env_adsr(int(0.1 * SR)), T_LIGHTS + 0.3 + j * 0.07, 0.08)
# warm happy loop after the power returns, until the verdict
step = 60 / 112 / 2; t = 66.9; i = 0; mel = [72, 76, 79, 76, 74, 77, 81, 77]
while t < 77.5:
    put(music, pluck(note(mel[i % 8]), 0.4), t, 0.07, True)
    if i % 2 == 0: put(music, tri(note([48, 53, 55, 53][(i // 4) % 4]), step * 1.6) * env_adsr(int(step * 1.6 * SR)), t, 0.06, True)
    t += step; i += 1
# verdict sting + door shut
for j, m in enumerate([60, 59, 58]): put(music, sq(note(m), 0.25, 0.5) * env_adsr(int(0.25 * SR)), 81.0 + j * 0.27, 0.05, True)
put(sfx, np.sin(2 * np.pi * 70 * tt(0.3)) * np.exp(-tt(0.3) * 12) + lp(noise(0.3), 0.4) * np.exp(-tt(0.3) * 15), T_SHUT + 0.3, 0.5)
# party member fanfare + end jingle
for j, m in enumerate([67, 72, 76, 79, 84, 79, 84]): put(sfx, sq(note(m), 0.12, 0.25) * env_adsr(int(0.12 * SR)), 83.8 + j * 0.1, 0.08)
step = 60 / 120 / 2; t = 84.6; i = 0; mel3 = [72, 79, 76, 79, 74, 79, 77, 79]
while t < 94.2:
    put(music, sq(note(mel3[i % 8]), step * 0.8, 0.25) * env_adsr(int(step * 0.8 * SR)), t, 0.025, True)
    if i % 2 == 0: put(music, tri(note([48, 55, 53, 55][(i // 2) % 4]), step * 1.6) * env_adsr(int(step * 1.6 * SR)), t, 0.07, True)
    t += step; i += 1
for j, m in enumerate([74, 75, 78, 79]): put(sfx, pluck(note(m), 0.6), 94.5 + j * 0.16, 0.16, True)
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
