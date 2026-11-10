# Synthesises the music bed + SFX for "الشبشب — FINAL BOSS" and mixes them under the dialogue.
# usage: python3 sfx.py <dialogue.wav> <out_mix.wav> [lines_google.json]
# Event times are written in scene time; with a lines file carrying warp_anchors_new_old they are mapped to output time.
import sys, wave, json
import numpy as np

SR = 44100
ANC = json.load(open(sys.argv[3]))["warp_anchors_new_old"] if len(sys.argv) > 3 else [[0, 0], [52.59, 52.59]]
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

music = np.zeros(N); sfx = np.zeros(N); amb = np.zeros(N)

# ---------- TV racing chiptune (0 - 13.3), heard "through the TV" ----------
bpm = 150; step = 60 / bpm / 2
mel = [76, 79, 81, 79, 76, 74, 72, 74, 76, 76, 79, 83, 81, 79, 76, 74]
bass = [45, 45, 52, 52, 43, 43, 50, 50]
t = 0.0; i = 0
while t < W(13.3):
    m = mel[i % len(mel)]
    put(music, sq(note(m), step * 0.9, 0.25) * env_adsr(int(step * 0.9 * SR), 0.003, 0.04), t, 0.05, True)
    if i % 2 == 0:
        b = bass[(i // 2) % len(bass)]
        put(music, tri(note(b), step * 1.8) * env_adsr(int(step * 1.8 * SR), 0.003, 0.05), t, 0.08, True)
    if i % 4 == 2: put(music, noise(0.05) * np.linspace(1, 0, int(0.05 * SR)), t, 0.07, True)
    t += step; i += 1
# engine buzz of the microbus game
eng = sq(55, W(13.3), 0.3) * 0.5 + sq(56.5, W(13.3), 0.3) * 0.5
put(music, lp(eng, 0.08), 0, 0.03)
# TV crash beep when mom yells
put(sfx, sq(880, 0.08) * env_adsr(int(0.08 * SR)), 1.0, 0.0)

# ---------- scare sting at 1.0 ----------
d = 0.6; f = np.linspace(330, 110, int(d * SR)); ph = np.cumsum(f) / SR
put(sfx, np.sign(np.sin(2 * np.pi * ph)) * np.linspace(1, 0, int(d * SR)) ** 1.5, 1.0, 0.18)

# ---------- footsteps in hallway (8.36 - 12.9) ----------
k = 0
for ts in np.arange(8.5, 12.95, np.pi / 7):
    g = 0.08 + 0.25 * (ts - 8.5) / 4.4
    slap = noise(0.06) * np.exp(-np.arange(int(0.06 * SR)) / (0.008 * SR))
    put(sfx, lp(slap, 0.35), ts, g)
    put(sfx, np.sin(2 * np.pi * 90 * tt(0.08)) * np.exp(-tt(0.08) * 40), ts, g * 0.8)
    k += 1

# ---------- stealth ALERT "!" at 12.4 ----------
for j, ts in enumerate([12.4, 12.55]):
    put(sfx, sq(1318, 0.12, 0.5) * env_adsr(int(0.12 * SR)), ts, 0.14)
d = 0.5; put(sfx, sq(1760, d, 0.5) * np.linspace(1, 0, int(d * SR)), 12.7, 0.06)

# ---------- save beeps (13.4 - 16.9) and error ----------
for ts in np.arange(13.45, 16.4, 0.28):
    put(sfx, sq(1046, 0.05, 0.5) * env_adsr(int(0.05 * SR)), ts, 0.06)
put(sfx, sq(98, 0.45, 0.5) * env_adsr(int(0.45 * SR)), 16.45, 0.12)

# ---------- door slam 16.95 ----------
d = 0.5; slam = noise(d) * np.exp(-tt(d) * 14)
put(sfx, lp(slam, 0.25), 16.95, 0.9)
put(sfx, np.sin(2 * np.pi * 55 * tt(0.6)) * np.exp(-tt(0.6) * 6), 16.95, 0.8)

# ---------- boss intro stinger 17.25 ----------
d = 2.0; tb = tt(d)
gong = sum(np.sin(2 * np.pi * f0 * tb) * np.exp(-tb * dk) for f0, dk in [(73.4, 1.4), (110, 1.8), (146.8, 2.2), (233.1, 2.6), (311, 3.5)])
put(sfx, gong / 3, 17.25, 0.55)
put(sfx, lp(noise(1.2) * np.exp(-tt(1.2) * 3), 0.2), 17.25, 0.35)
for j, n in enumerate([50, 51, 54]):  # D Eb F# brass stab
    put(music, sq(note(n), 0.9, 0.5) * env_adsr(int(0.9 * SR), 0.01, 0.3), 17.27, 0.08)

# ---------- boss theme 18.2 - 32.1 (Hijaz on D) ----------
hij = [38, 39, 42, 43, 45, 46, 48, 50]
bpm = 96; beat = 60 / bpm
ost = [0, 0, 1, 0, 2, 1, 0, 3]
t = W(18.22); i = 0
while t < W(32.1):
    n = hij[ost[i % len(ost)]]
    dd = beat / 2 * 0.9
    put(music, sq(note(n), dd, 0.5) * env_adsr(int(dd * SR), 0.005, 0.05), t, 0.085, True)
    if i % 4 == 0:  # timpani
        put(music, np.sin(2 * np.pi * 65 * tt(0.5)) * np.exp(-tt(0.5) * 7) + lp(noise(0.5), 0.1) * np.exp(-tt(0.5) * 12) * 0.6, t, 0.3, True)
    if i % 8 == 4:  # darbuka "tek"
        put(music, lp(noise(0.05), 0.6) * np.exp(-tt(0.05) * 90), t, 0.12, True)
    if i % 16 == 8:  # high Hijaz phrase
        for j, m in enumerate([62, 63, 66, 63, 62]):
            put(music, sq(note(m), beat / 2 * 0.8, 0.25) * env_adsr(int(beat / 2 * 0.8 * SR)), t + j * beat / 2, 0.045, True)
    t += beat / 2; i += 1

# ---------- item get jingle 30.6 ----------
for j, m in enumerate([72, 76, 79, 84, 88]):
    put(sfx, sq(note(m), 0.11, 0.25) * env_adsr(int(0.11 * SR)), 30.6 + j * 0.07, 0.11)
put(sfx, sq(note(91), 0.4, 0.25) * env_adsr(int(0.4 * SR), 0.005, 0.3), 30.95, 0.09)

# ---------- throw whoosh 32.3, slow-mo drone, homing beeps, BONK ----------
d = 0.65; w = noise(d); env = np.sin(np.linspace(0, np.pi, int(d * SR))) ** 2
cut = np.linspace(0.05, 0.5, int(d * SR)); y = np.zeros_like(w); acc = 0
for i in range(len(w)):
    acc += cut[i] * (w[i] - acc); y[i] = acc
put(sfx, y * env, 32.25, 0.9)
d = 0.7; tb = tt(d)
drone = np.sin(2 * np.pi * np.cumsum(np.linspace(70, 45, int(d * SR))) / SR) * np.sin(np.linspace(0, np.pi, int(d * SR)))
put(sfx, drone + lp(noise(d), 0.03) * 2 * np.sin(np.linspace(0, np.pi, int(d * SR))), 32.9, 0.5)
tb = 33.55; gap = 0.16
while tb < 34.28:
    put(sfx, sq(1568, 0.04) * env_adsr(int(0.04 * SR)), tb, 0.12); gap *= 0.78; tb += max(0.035, gap)
d = 0.9; tb = tt(d)
bonk = np.sin(2 * np.pi * np.cumsum(np.linspace(180, 60, int(d * SR))) / SR) * np.exp(-tb * 7)
put(sfx, bonk, 34.3, 0.9)
put(sfx, lp(noise(0.08), 0.5) * np.exp(-tt(0.08) * 60), 34.3, 0.8)
ding = sum(np.sin(2 * np.pi * f0 * tt(1.0)) * np.exp(-tt(1.0) * 4) for f0 in (1760, 2637, 3520))
put(sfx, ding / 3, 34.32, 0.3)
# birdies / stars twinkle loop while KO
for j in range(14):
    put(sfx, sq(note(96 + (j % 3) * 2), 0.05, 0.25) * env_adsr(int(0.05 * SR)), 34.7 + j * 0.25, 0.03)

# ---------- KO bell + defeat jingle 35.11 ----------
d = 2.5; tb = tt(d)
bell = sum(np.sin(2 * np.pi * f0 * tb) * np.exp(-tb * dk) for f0, dk in [(523, 1.2), (1046, 1.6), (1318, 2.0), (1568, 2.4), (2093, 3)])
put(sfx, bell / 3, 35.1, 0.45)
for j, m in enumerate([72, 71, 70, 69, 68, 67, 66, 65]):
    put(music, sq(note(m), 0.16, 0.5) * env_adsr(int(0.16 * SR)), 36.0 + j * 0.15, 0.06)
put(music, sq(note(53), 0.8, 0.5) * env_adsr(int(0.8 * SR), 0.01, 0.6), 37.2, 0.06)

# ---------- continue countdown + select ----------
for j, ts in enumerate(np.arange(38.6, 41.0, 0.5)):
    put(sfx, sq(784, 0.05) * env_adsr(int(0.05 * SR)), ts, 0.05)
put(sfx, sq(1046, 0.06) * env_adsr(int(0.06 * SR)), 40.25, 0.12)
for j, m in enumerate([79, 84]):
    put(sfx, sq(note(m), 0.08, 0.25) * env_adsr(int(0.08 * SR)), 40.55 + j * 0.08, 0.1)

# ---------- balcony: crickets, distant horn, oud-ish plucks ----------
tb = tt(DUR - W(41.3))
chirp = np.sin(2 * np.pi * 4300 * tb) * (np.sin(2 * np.pi * 30 * tb) > 0.3) * ((tb * 1.6) % 1 < 0.25)
chirp2 = np.sin(2 * np.pi * 3900 * tb) * (np.sin(2 * np.pi * 26 * tb) > 0.4) * (((tb + 0.37) * 1.3) % 1 < 0.2)
put(amb, (chirp + chirp2) * 0.5, 41.3, 0.035)
put(amb, lp(noise(DUR - W(41.3)), 0.01), 41.3, 0.25)  # city hum
d = 0.45; put(amb, lp(sq(415, d, 0.5) * 0.6 + sq(440, d, 0.5) * 0.4, 0.15) * env_adsr(int(d * SR), 0.02, 0.1), 44.1, 0.05)
put(amb, lp(sq(415, d, 0.5) * 0.6 + sq(440, d, 0.5) * 0.4, 0.15) * env_adsr(int(d * SR), 0.02, 0.1), 44.65, 0.05)

def pluck(f, d, damp=0.996):
    n = int(SR / f); buf = rs.uniform(-1, 1, n); out = np.zeros(int(d * SR))
    for i in range(len(out)):
        out[i] = buf[i % n]; buf[i % n] = damp * 0.5 * (buf[i % n] + buf[(i + 1) % n])
    return out
melody = [(62, 0), (63, 0.5), (66, 1.0), (67, 1.5), (66, 2.25), (63, 2.75), (62, 3.5),
          (69, 4.5), (67, 5.0), (66, 5.5), (63, 6.0), (62, 7.0)]
for m, off in melody:
    put(music, pluck(note(m - 12), 1.2), W(41.9) + off * 0.85, 0.16, True)
for off in [0, 1.7, 3.4, 5.1, 6.8]:
    put(music, pluck(note(38), 1.6), W(41.9) + off, 0.12, True)
# end jingle "to be continued"
for j, m in enumerate([74, 75, 78, 79]):
    put(sfx, pluck(note(m), 0.6), W(52.25) + j * 0.16, 0.18, True)

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
