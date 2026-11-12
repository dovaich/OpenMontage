# Synthesises the music bed + SFX for "الشبشب — FINAL BOSS" and mixes them under the dialogue.
# usage: python3 sfx.py <dialogue.wav> <out_mix.wav> [lines_google.json]
# Event times are written in scene time; with a lines file carrying warp_anchors_new_old they are mapped to output time.
import sys, wave, json
import numpy as np

SR = 44100
ANC = [[0, 0], [76.0, 76.0]]
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
T_LAND = 4.7; T_LAPTOP = 25.0; T_FIX = 60.1; T_START = 61.6; T_LAUNCH = 63.0; T_RES = 65.4; T_ENDC = 74.1
r = np.random.RandomState(41)
# garage ambience: room tone, distant air-compressor, random tool clanks and an impact wrench
put(amb, lp(noise(DUR), 0.02), 0, 0.28)
for ts in np.arange(2.0, T_RES, 2.3):
    k = r.randint(3)
    if k == 0: put(amb, sum(np.sin(2 * np.pi * f0 * tt(0.4)) * np.exp(-tt(0.4) * 12) for f0 in (900 + r.rand() * 400, 2300 + r.rand() * 600)) / 2, ts + r.rand(), 0.05)
    elif k == 1: d = 0.5; put(amb, (np.sign(np.sin(2 * np.pi * 38 * tt(d))) * (np.sin(2 * np.pi * 12 * tt(d)) > 0)), ts + r.rand(), 0.025)
    else: d = 0.8; put(amb, lp(noise(d), 0.4) * np.linspace(1, 0, int(d * SR)), ts + r.rand(), 0.03)
# title jingle
for j, m in enumerate([67, 71, 74, 79]): put(sfx, sq(note(m), 0.1, 0.25) * env_adsr(int(0.1 * SR)), j * 0.08, 0.08)
# character intro stingers (fighting-game style)
for ts in (1.1, 21.6, 44.7, 49.4):
    d = 0.5; put(sfx, lp(noise(d), 0.3) * np.sin(np.linspace(0, np.pi, int(d * SR))) ** 2, ts - 0.1, 0.35)
    put(sfx, np.sin(2 * np.pi * 60 * tt(0.4)) * np.exp(-tt(0.4) * 8), ts + 0.2, 0.5)
    for j, m in enumerate([60, 67]): put(sfx, sq(note(m), 0.2, 0.5) * env_adsr(int(0.2 * SR)), ts + 0.2 + j * 0.15, 0.05)
# tuk-tuk lands through the door
d = 1.5; f = np.linspace(1800, 300, int(d * SR)); put(sfx, np.sin(2 * np.pi * np.cumsum(f) / SR) * np.linspace(0.3, 1, int(d * SR)), T_LAND - 1.5, 0.05)
put(sfx, np.sin(2 * np.pi * 60 * tt(0.4)) * np.exp(-tt(0.4) * 9), T_LAND, 0.7); put(sfx, lp(noise(0.3), 0.3) * np.exp(-tt(0.3) * 15), T_LAND, 0.45)
# workshop groove (mahraganat-ish: kick, clap, square stabs) 5.9-21.4
beat = 60 / 128; t = 5.9; i = 0
while t < 21.3:
    if i % 2 == 0: put(music, np.sin(2 * np.pi * np.cumsum(np.linspace(110, 45, int(0.18 * SR))) / SR) * np.exp(-tt(0.18) * 14), t, 0.18, True)
    if i % 4 == 2: put(music, lp(noise(0.07), 0.6) * np.exp(-tt(0.07) * 50), t, 0.09, True)
    if i % 8 in (1, 5): put(music, sq(note([62, 65, 67, 65][(i // 8) % 4]), beat * 0.3, 0.3) * env_adsr(int(beat * 0.3 * SR)), t, 0.03, True)
    t += beat / 2; i += 1
# laptop: boot chime, error buzz, "NETWORK" ding
for j, m in enumerate([72, 79, 84]): put(sfx, np.sin(2 * np.pi * note(m) * tt(0.5)) * np.exp(-tt(0.5) * 5), T_LAPTOP + 0.3 + j * 0.12, 0.08)
put(sfx, sq(110, 0.45, 0.5) * env_adsr(int(0.45 * SR)), 26.6, 0.08)
put(sfx, sq(1318, 0.08) * env_adsr(int(0.08 * SR)), 32.4, 0.08)
# thinking / tech music under El-Alamy 21.4-44.4 (arpeggio)
arp = [60, 63, 67, 72, 67, 63]; step = 60 / 110 / 2; t = 21.6; i = 0
while t < 44.3: put(music, sq(note(arp[i % 6] + 12), step * 0.6, 0.25) * env_adsr(int(step * 0.6 * SR)), t, 0.025, True); t += step; i += 1
# El-Asly: angry heavy stomps + rage-meter rising tone 44.4-57.0
for ts in np.arange(44.2, 45.4, 0.4): put(sfx, np.sin(2 * np.pi * 55 * tt(0.25)) * np.exp(-tt(0.25) * 12), ts, 0.4)
d = 12.4; tb = tt(d); put(music, np.sign(np.sin(2 * np.pi * np.cumsum(np.linspace(55, 110, len(tb))) / SR)) * 0.5 * np.linspace(0.2, 1, len(tb)), 44.6, 0.04)
# El-Gazzar: lazy chill music (slow plucks, swung) 49.2-60.0 + creeper roll
for ts in (48.6, 59.4): d = 0.9; put(sfx, lp(noise(d), 0.15) * np.sin(np.linspace(0, np.pi, int(d * SR))), ts, 0.25)
lazy = [(62, 0), (65, 0.7), (69, 1.4), (67, 2.4), (65, 3.1), (62, 3.8)]
for rep in (49.4, 54.0):
    for m, off in lazy: put(music, pluck(note(m), 1.0, 0.996), rep + off, 0.11, True)
# fixing: rapid ratchet + impact wrench, then the engine starts
for ts in np.arange(T_FIX, T_START, 0.06): put(sfx, lp(noise(0.012), 0.8) * np.exp(-tt(0.012) * 300), ts, 0.25)
d = 0.6; put(sfx, np.sign(np.sin(2 * np.pi * 45 * tt(d))) * (np.sin(2 * np.pi * 20 * tt(d)) > 0) * np.linspace(1, 0.4, int(d * SR)), 60.6, 0.08)
for j, m in enumerate([72, 76, 79]): put(sfx, sq(note(m), 0.1, 0.25) * env_adsr(int(0.1 * SR)), T_START, 0.07)
d = T_LAUNCH - T_START; tb = tt(d); rev = np.sign(np.sin(2 * np.pi * np.cumsum(np.linspace(40, 120, len(tb))) / SR)); put(sfx, lp(rev, 0.2) * np.linspace(0.4, 1, len(tb)), T_START, 0.3)
# LAUNCH
d = 1.2; tb = tt(d); put(sfx, np.sin(2 * np.pi * np.cumsum(np.linspace(90, 30, len(tb))) / SR) * np.exp(-tb * 3) + lp(noise(d), 0.15) * np.exp(-tb * 3), T_LAUNCH, 0.8)
d = T_RES - T_LAUNCH; put(sfx, lp(noise(d), 0.25) * np.linspace(1, 0.1, int(d * SR)), T_LAUNCH, 0.4)
# area unlocked fanfare + loop + end jingle
for j, m in enumerate([72, 76, 79, 84, 88]): put(sfx, sq(note(m), 0.1, 0.25) * env_adsr(int(0.1 * SR)), T_RES + j * 0.07, 0.09)
step = 60 / 120 / 2; t = T_RES + 0.6; i = 0; mel3 = [72, 79, 76, 79, 74, 79, 77, 79]
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
