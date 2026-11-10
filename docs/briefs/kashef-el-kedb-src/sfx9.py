# Synthesises the music bed + SFX for "الشبشب — FINAL BOSS" and mixes them under the dialogue.
# usage: python3 sfx.py <dialogue.wav> <out_mix.wav> [lines_google.json]
# Event times are written in scene time; with a lines file carrying warp_anchors_new_old they are mapped to output time.
import sys, wave, json
import numpy as np

SR = 44100
ANC = [[0, 0], [61.5, 61.5]]
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
T_REVEAL = 3.4; T_W1 = 20.2; T_HELMSWAP = 27.1; T_MOM = 27.6; T_W2 = 37.1; T_BALC = 51.9; T_ENDC = 59.4
r = np.random.RandomState(21)
put(amb, lp(noise(T_BALC), 0.01), 0, 0.2)
tb = tt(DUR - T_BALC)
chirp = np.sin(2 * np.pi * 3600 * tb) * ((tb * 1.3) % 1 < 0.05)
put(amb, lp(noise(DUR - T_BALC), 0.03), T_BALC, 0.3); put(amb, chirp, T_BALC, 0.02)
def whistle(t0, d, f0=1900, g=0.12):
    tb = tt(d); f = f0 * (1 + 0.02 * np.sin(2 * np.pi * 6 * tb)) * np.linspace(0.92, 1.0, len(tb)) ** 0.3
    w = np.sin(2 * np.pi * np.cumsum(f) / SR) + 0.4 * np.sin(2 * np.pi * np.cumsum(f * 1.5) / SR)
    hiss = lp(noise(d), 0.6) - lp(noise(d), 0.2)
    put(sfx, (w * 0.7 + hiss * 0.8) * env_adsr(len(tb), 0.05, 0.15), t0, g)
# title jingle
for j, m in enumerate([67, 71, 74, 79]): put(sfx, sq(note(m), 0.1, 0.25) * env_adsr(int(0.1 * SR)), j * 0.08, 0.08)
# inventor theme 1.0-12.0 (bouncy plucks, Nahawand)
nah = [60, 62, 63, 65, 67, 68, 71, 72]; patt = [0, 4, 2, 4, 1, 4, 3, 5, 0, 4, 2, 4, 6, 5, 4, 2]
step = 60 / 132 / 2; t = 1.0; i = 0
while t < 12.0:
    put(music, pluck(note(nah[patt[i % 16]]), 0.35, 0.99), t, 0.12, True)
    if i % 4 == 0: put(music, tri(note(nah[0] - 24 + (5 if (i // 16) % 2 else 0)), step * 3) * env_adsr(int(step * 3 * SR), 0.005, 0.1), t, 0.12, True)
    t += step; i += 1
# tarp whoosh + item jingle
d = 0.5; put(sfx, lp(noise(d), 0.25) * np.sin(np.linspace(0, np.pi, int(d * SR))) ** 2, T_REVEAL - 0.1, 0.7)
for j, m in enumerate([72, 76, 79, 84, 88]): put(sfx, sq(note(m), 0.11, 0.25) * env_adsr(int(0.11 * SR)), 4.4 + j * 0.07, 0.1)
# interrogation tension 12.0-18.35: ticking clock + low drone
for ts in np.arange(12.0, 18.35, 0.5): put(sfx, lp(noise(0.02), 0.7) * np.exp(-tt(0.02) * 150), ts, 0.15)
d = 6.3; tb = tt(d); put(music, (np.sin(2 * np.pi * 55 * tb) + 0.5 * np.sin(2 * np.pi * 58 * tb)) * np.linspace(0.3, 1, len(tb)), 12.0, 0.08)
# colander helmet "clank" 15.8
put(sfx, sum(np.sin(2 * np.pi * f0 * tt(0.5)) * np.exp(-tt(0.5) * 9) for f0 in (620, 1450, 2300)) / 3, 15.8, 0.3)
# WHISTLE 1 + alarm beeps
whistle(T_W1, 1.2)
for ts in np.arange(T_W1, T_W1 + 1.2, 0.3): put(sfx, sq(988, 0.12) * env_adsr(int(0.12 * SR)), ts, 0.04)
# victory jingle 21.5
for j, m in enumerate([72, 76, 79, 84]): put(sfx, sq(note(m), 0.12, 0.25) * env_adsr(int(0.12 * SR)), 21.6 + j * 0.1, 0.08)
# helmet swap whoosh 27.1 + "uh-oh" sting
d = 0.4; put(sfx, lp(noise(d), 0.3) * np.sin(np.linspace(0, np.pi, int(d * SR))) ** 2, T_HELMSWAP, 0.4)
for j, m in enumerate([67, 63]): put(sfx, sq(note(m), 0.25, 0.5) * env_adsr(int(0.25 * SR)), 27.3 + j * 0.25, 0.06)
# detective theme 27.6-37.0 (walking bass + snaps)
bass = [43, 46, 48, 49, 48, 46, 43, 41]; beat = 60 / 96; t = T_MOM; i = 0
while t < T_W2:
    put(music, tri(note(bass[i % 8]), beat * 0.45) * env_adsr(int(beat * 0.45 * SR)), t, 0.16, True)
    if i % 2 == 1: put(music, lp(noise(0.03), 0.8) * np.exp(-tt(0.03) * 120), t, 0.12, True)
    t += beat / 2; i += 1
# footsteps of mom entering
for ts in np.arange(T_MOM, 29.2, 0.45): put(sfx, lp(noise(0.06) * np.exp(-np.arange(int(0.06 * SR)) / (0.008 * SR)), 0.35), ts, 0.25)
# WHISTLE 2: train-like, lid launch, ceiling bonk
whistle(T_W2, 1.6, 1500, 0.16); whistle(T_W2 + 0.2, 1.2, 2200, 0.08)
d = 0.35; put(sfx, lp(noise(d), 0.4) * np.exp(-tt(d) * 10), T_W2 + 0.4, 0.6)
put(sfx, sum(np.sin(2 * np.pi * f0 * tt(0.8)) * np.exp(-tt(0.8) * 5) for f0 in (420, 980, 1700)) / 3, T_W2 + 1.02, 0.5)
# trap question: suspense heartbeat + thinking music 44.55-49.2
for ts in np.arange(44.6, 49.2, 0.7): put(sfx, np.sin(2 * np.pi * 55 * tt(0.15)) * np.exp(-tt(0.15) * 25), ts, 0.35); put(sfx, np.sin(2 * np.pi * 50 * tt(0.15)) * np.exp(-tt(0.15) * 25), ts + 0.18, 0.25)
for j, m in enumerate([72, 74, 72, 74, 72, 74, 72, 74]): put(music, sq(note(m), 0.25, 0.25) * env_adsr(int(0.25 * SR)), 44.6 + j * 0.55, 0.03)
# cooker nervous little whistles during Ibrahim's pause
for ts in (49.4, 50.1, 50.8, 51.4): whistle(ts, 0.3, 2400, 0.05)
# sad walk to the balcony (trombone) + achievement
for j, (a0, a1, d) in enumerate([(392, 370, 0.35), (370, 349, 0.35), (349, 330, 0.35), (330, 290, 1.0)]):
    f = np.linspace(a0, a1, int(d * SR)) * (1 + 0.02 * np.sin(np.linspace(0, d * 40, int(d * SR)))); put(music, lp(np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)), 0.12) * env_adsr(int(d * SR), 0.03, 0.1), 50.0 + [0, 0.4, 0.8, 1.2][j], 0.09)
for j, (f0, dl) in enumerate([(880, 0.0), (1318, 0.12), (1760, 0.26)]):
    d = 1.2; tb = tt(d); put(sfx, sum(np.sin(2 * np.pi * f0 * k * tb) * np.exp(-tb * (3 + k)) / k for k in (1, 2, 3)), 52.0 + dl, 0.12)
whistle(57.5, 0.6, 2600, 0.05)  # a last tiny whistle from inside the flat
melody = [(62, 0), (63, 0.5), (66, 1.0), (67, 1.5), (66, 2.25), (63, 2.75), (62, 3.5)]
for m, off in melody: put(music, pluck(note(m - 12), 1.2), 53.5 + off * 0.85, 0.13, True)
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
