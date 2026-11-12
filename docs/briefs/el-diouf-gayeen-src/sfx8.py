# Synthesises the music bed + SFX for "الشبشب — FINAL BOSS" and mixes them under the dialogue.
# usage: python3 sfx.py <dialogue.wav> <out_mix.wav> [lines_google.json]
# Event times are written in scene time; with a lines file carrying warp_anchors_new_old they are mapped to output time.
import sys, wave, json
import numpy as np

SR = 44100
ANC = [[0, 0], [54.0, 54.0]]
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
T_ALARM = 8.05; T_HIDE = 19.3; T_DOOR = 24.75; T_MSG = 33.9; T_RES = 44.0; T_ENDC = 51.9
r = np.random.RandomState(12)
# room tone + TV football crowd before the alarm
put(amb, lp(noise(DUR), 0.01), 0, 0.2)
d = T_ALARM; put(amb, (lp(noise(d), 0.08) - lp(noise(d), 0.01)) * (0.7 + 0.3 * np.sin(np.linspace(0, 9, int(d * SR)))), 0, 0.12)
# title jingle
for j, m in enumerate([67, 71, 74, 79]): put(sfx, sq(note(m), 0.1, 0.25) * env_adsr(int(0.1 * SR)), j * 0.08, 0.08)
# sweet phone-call music (lounge plucks) 1.0-6.2
for j, (m, off) in enumerate([(72, 0), (76, 0.5), (79, 1.0), (84, 1.5), (79, 2.0), (76, 2.5), (77, 3.0), (81, 3.5), (84, 4.0), (81, 4.5)]): put(music, pluck(note(m), 0.6, 0.995), 1.2 + off, 0.08, True)
# ALARM: siren + record stop
d = 0.4; put(sfx, lp(np.sign(np.sin(2 * np.pi * np.cumsum(np.linspace(900, 120, int(d * SR))) / SR)) * 0.5 + noise(d) * 0.5, 0.3) * np.linspace(1, 0, int(d * SR)), T_ALARM - 0.1, 0.3)
for ts in np.arange(T_ALARM, T_HIDE + 2.0, 0.7):
    d = 0.35; put(sfx, sq(note(81), d, 0.5) * env_adsr(int(d * SR)), ts, 0.035); put(sfx, sq(note(76), d, 0.5) * env_adsr(int(d * SR)), ts + 0.35, 0.035)
# speedrun music: frantic 8-bit 9.0 - 33.9
step = 60 / 176 / 2; t = 9.0; i = 0; mel = [76, 79, 83, 79, 76, 74, 72, 74, 76, 79, 84, 83, 81, 79, 76, 74]
while t < T_MSG:
    put(music, sq(note(mel[i % 16]), step * 0.8, 0.25) * env_adsr(int(step * 0.8 * SR)), t, 0.04, True)
    if i % 2 == 0: put(music, tri(note([45, 45, 52, 52, 43, 43, 50, 50][(i // 2) % 8]), step * 1.6) * env_adsr(int(step * 1.6 * SR)), t, 0.1, True)
    if i % 4 == 2: put(music, lp(noise(0.04), 0.6) * np.exp(-tt(0.04) * 90), t, 0.06, True)
    t += step; i += 1
# newspaper flutter + Hamada thud jump
d = 0.8; put(sfx, (lp(noise(d), 0.5) - lp(noise(d), 0.15)) * np.abs(np.sin(np.linspace(0, 30, int(d * SR)))), T_ALARM + 0.1, 0.2)
# items whooshing under the sofa + "+1" blips
for j in range(14): d = 0.18; put(sfx, lp(noise(d), 0.3) * np.sin(np.linspace(0, np.pi, int(d * SR))), T_HIDE - 0.4 + j * 0.13, 0.15)
for j in range(10): put(sfx, sq(note(84 + (j % 3) * 2), 0.04, 0.25) * env_adsr(int(0.04 * SR)), T_HIDE - 0.2 + j * 0.15, 0.04)
put(sfx, np.sin(2 * np.pi * 70 * tt(0.3)) * np.exp(-tt(0.3) * 10), T_HIDE + 0.45, 0.5)  # Hamada slides under
# salon door: creak + heavenly choir chord + dust
d = 1.2; f = 220 + 120 * np.sin(np.linspace(0, 10, int(d * SR))) + np.linspace(0, 80, int(d * SR)); put(sfx, lp(np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)), 0.1) * env_adsr(int(d * SR), 0.05, 0.3), T_DOOR, 0.06)
d = 3.0; tb = tt(d); choir = sum(np.sin(2 * np.pi * note(m) * tb) * (1 + 0.004 * np.sin(2 * np.pi * 5 * tb)) for m in (60, 64, 67, 72)) / 4
put(music, lp(choir, 0.2) * env_adsr(len(tb), 0.6, 1.2), T_DOOR + 0.2, 0.3)
d = 1.5; put(sfx, lp(noise(d), 0.05) * env_adsr(int(d * SR), 0.2, 0.8), T_DOOR + 0.1, 0.25)
# plastic crinkle as covers come off 22.8-24.0 and when Ibrahim sits 38.9
for ts in list(np.arange(22.8, 24.2, 0.05)) + list(np.arange(38.8, 39.6, 0.05)):
    if r.rand() < 0.5: put(sfx, lp(noise(0.02), 0.8) * np.exp(-tt(0.02) * 200), ts, 0.12)
# legendary item fanfare 28.7
for j, m in enumerate([67, 71, 74, 79, 83, 86]): put(sfx, sq(note(m), 0.1, 0.25) * env_adsr(int(0.1 * SR)), 28.7 + j * 0.07, 0.08)
put(sfx, sum(np.sin(2 * np.pi * f0 * tt(1.0)) * np.exp(-tt(1.0) * 4) for f0 in (2093, 2637, 3136)) / 3, 29.15, 0.12)
# glass trembling clink 30.9-33.6
for ts in np.arange(31.0, 33.6, 0.22): put(sfx, np.sin(2 * np.pi * (3500 + r.rand() * 400) * tt(0.08)) * np.exp(-tt(0.08) * 50), ts, 0.04)
# MESSAGE: hard stop, phone ding, deflating trombone
i0 = int(T_MSG * SR); music[i0:int((T_MSG + 0.1) * SR)] *= np.linspace(1, 0, int(0.1 * SR)); music[int((T_MSG + 0.1) * SR):int(T_RES * SR)] = 0
for j, f0 in enumerate([1318, 1760]): put(sfx, np.sin(2 * np.pi * f0 * tt(0.25)) * np.exp(-tt(0.25) * 12), T_MSG + j * 0.12, 0.25)
for j, (a0, a1, d) in enumerate([(392, 370, 0.35), (370, 349, 0.35), (349, 330, 0.35), (330, 290, 1.0)]):
    f = np.linspace(a0, a1, int(d * SR)) * (1 + 0.02 * np.sin(np.linspace(0, d * 40, int(d * SR)))); put(music, lp(np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)), 0.12) * env_adsr(int(d * SR), 0.03, 0.1), 35.7 + [0, 0.4, 0.8, 1.2][j], 0.1)
# sneaky Ibrahim music 38.3-42.0 (pizzicato)
pm = [57, 60, 64, 60, 57, 59, 62, 59]; step = 60 / 100 / 2; t = 38.3; i = 0
while t < 42.0: put(music, pluck(note(pm[i % 8]), 0.25, 0.98), t, 0.1, True); t += step; i += 1
# mom shout: drum hit; door slam + padlock clank 44.4
put(sfx, np.sin(2 * np.pi * 70 * tt(0.4)) * np.exp(-tt(0.4) * 8), 42.1, 0.5)
put(sfx, lp(noise(0.5), 0.25) * np.exp(-tt(0.5) * 14), T_RES + 0.4, 0.8); put(sfx, np.sin(2 * np.pi * 55 * tt(0.6)) * np.exp(-tt(0.6) * 6), T_RES + 0.4, 0.7)
put(sfx, sum(np.sin(2 * np.pi * f0 * tt(0.5)) * np.exp(-tt(0.5) * 10) for f0 in (900, 1350, 2100)) / 3, T_RES + 1.0, 0.35)
# results fanfare + loop
for j, m in enumerate([72, 76, 79, 84, 88]): put(sfx, sq(note(m), 0.1, 0.25) * env_adsr(int(0.1 * SR)), T_RES + 0.5 + j * 0.07, 0.08)
step = 60 / 120 / 2; t = T_RES + 1.0; i = 0; mel3 = [72, 79, 76, 79, 74, 79, 77, 79]
while t < T_ENDC:
    put(music, sq(note(mel3[i % 8]), step * 0.8, 0.25) * env_adsr(int(step * 0.8 * SR)), t, 0.03, True)
    if i % 2 == 0: put(music, tri(note([48, 55, 53, 55][(i // 2) % 4]), step * 1.6) * env_adsr(int(step * 1.6 * SR)), t, 0.08, True)
    t += step; i += 1
for j, m in enumerate([74, 75, 78, 79]): put(sfx, pluck(note(m), 0.6), T_ENDC + 0.1 + j * 0.16, 0.16, True)
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
