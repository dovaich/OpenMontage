# Synthesises the music bed + SFX for "الشبشب — FINAL BOSS" and mixes them under the dialogue.
# usage: python3 sfx.py <dialogue.wav> <out_mix.wav> [lines_google.json]
# Event times are written in scene time; with a lines file carrying warp_anchors_new_old they are mapped to output time.
import sys, wave, json
import numpy as np

SR = 44100
ANC = [[0, 0], [47.6, 47.6]]
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
T_BOOM = 35.4
# ---------- night ambience (balcony shots) ----------
tb = tt(DUR)
chirp = np.sin(2 * np.pi * 4300 * tb) * (np.sin(2 * np.pi * 30 * tb) > 0.3) * ((tb * 1.6) % 1 < 0.25)
chirp2 = np.sin(2 * np.pi * 3900 * tb) * (np.sin(2 * np.pi * 26 * tb) > 0.4) * (((tb + 0.37) * 1.3) % 1 < 0.2)
hum = lp(noise(DUR), 0.01)
gate = np.ones(len(tb)); gate[(tb > 35.6) & (tb < 40.77)] = 0.25
humgate = np.where(tb < T_BOOM, 1.0, 0.15)
put(amb, (chirp + chirp2) * 0.5 * gate, 0, 0.03)
put(amb, hum * humgate, 0, 0.25)
# ---------- intro jingle ----------
for j, m in enumerate([67, 71, 74, 79]):
    put(sfx, sq(note(m), 0.1, 0.25) * env_adsr(int(0.1 * SR)), 0.0 + j * 0.08, 0.08)
# ---------- inventor theme 4.5-19.9 (bouncy plucks, Nahawand on C) ----------
nah = [48, 50, 51, 53, 55, 56, 59, 60]
patt = [0, 4, 2, 4, 1, 4, 3, 5, 0, 4, 2, 4, 6, 5, 4, 2]
step = 60 / 132 / 2; t = 4.5; i = 0
while t < 19.9:
    n = nah[patt[i % len(patt)]] + 12
    put(music, pluck(note(n), 0.35, 0.99), t, 0.13, True)
    if i % 4 == 0: put(music, tri(note(nah[0] - 12 + (5 if (i // 16) % 2 else 0)), step * 3) * env_adsr(int(step * 3 * SR), 0.005, 0.1), t, 0.12, True)
    if i % 8 == 6: put(music, lp(noise(0.05), 0.6) * np.exp(-tt(0.05) * 90), t, 0.08, True)
    t += step; i += 1
# tarp whoosh 6.4 + item jingle 7.9
d = 0.5; w = lp(noise(d), 0.25) * np.sin(np.linspace(0, np.pi, int(d * SR))) ** 2; put(sfx, w, 6.3, 0.7)
for j, m in enumerate([72, 76, 79, 84, 88]):
    put(sfx, sq(note(m), 0.11, 0.25) * env_adsr(int(0.11 * SR)), 7.9 + j * 0.07, 0.1)
# mom scare sting 15.43
d = 0.5; f = np.linspace(300, 120, int(d * SR)); ph = np.cumsum(f) / SR
put(sfx, np.sign(np.sin(2 * np.pi * ph)) * np.linspace(1, 0, int(d * SR)) ** 1.5, 15.43, 0.14)
# ---------- dish motor + modem handshake 19.95-22.0 ----------
d = 2.05; f = 90 + 160 * np.abs(np.sin(np.linspace(0, 9, int(d * SR)))); ph = np.cumsum(f) / SR
put(sfx, lp(np.sign(np.sin(2 * np.pi * ph)), 0.2) * env_adsr(int(d * SR), 0.05, 0.1), 19.95, 0.1)
r2 = np.random.RandomState(3); tm = 20.1
while tm < 21.95:
    dd = 0.06 + r2.rand() * 0.18; fr = [1200, 2100, 980, 1650, 2400, 1800][r2.randint(6)]
    put(sfx, (sq(fr, dd) * 0.6 + sq(fr * 1.5, dd) * 0.4) * env_adsr(int(dd * SR), 0.003, 0.01), tm, 0.05); tm += dd + 0.02
d = 0.4; put(sfx, lp(noise(d), 0.5), 21.5, 0.06)
# connected chime 22.0
for j, m in enumerate([76, 81, 88]):
    put(sfx, sq(note(m), 0.14, 0.25) * env_adsr(int(0.14 * SR), 0.003, 0.08), 22.0 + j * 0.09, 0.12)
# ---------- happy loop 22.3-27.0 ----------
mel = [72, 76, 79, 76, 81, 79, 76, 74]; step = 60 / 150 / 2; t = 22.3; i = 0
while t < 27.0:
    put(music, sq(note(mel[i % len(mel)]), step * 0.8, 0.25) * env_adsr(int(step * 0.8 * SR), 0.003, 0.03), t, 0.045, True)
    if i % 2 == 0: put(music, tri(note([48, 48, 53, 55][(i // 4) % 4]), step * 1.6) * env_adsr(int(step * 1.6 * SR)), t, 0.08, True)
    t += step; i += 1
# ---------- threat 27.1: scratch + alert ----------
d = 0.3; f = np.concatenate([np.linspace(900, 200, int(d * SR / 2)), np.linspace(200, 700, int(d * SR) - int(d * SR / 2))]); ph = np.cumsum(f) / SR
put(sfx, lp(np.sign(np.sin(2 * np.pi * ph)) * noise(d) * 0.5 + np.sin(2 * np.pi * ph) * 0.5, 0.3), 26.95, 0.25)
for ts in [27.15, 27.3]: put(sfx, sq(1318, 0.12) * env_adsr(int(0.12 * SR)), ts, 0.12)
# ---------- tension drone + sizzle 28-35.4 ----------
d = T_BOOM - 28.0; tb = tt(d)
drone = (np.sin(2 * np.pi * 55 * tb) + 0.5 * np.sin(2 * np.pi * 58.3 * tb)) * np.linspace(0.3, 1, len(tb))
put(music, drone, 28.0, 0.12)
siz = lp(noise(d), 0.7) - lp(noise(d), 0.05); siz *= np.linspace(0.05, 1, len(siz)) ** 1.5
put(sfx, siz, 28.0, 0.12)
# fire crackle
for ts in np.arange(32.0, 35.4, 0.07):
    if rs.rand() < 0.6: put(sfx, noise(0.012) * np.exp(-tt(0.012) * 300), ts + rs.rand() * 0.05, 0.25)
# spark crackle traveling 34.0-35.4
for ts in np.arange(34.0, 35.4, 0.03):
    put(sfx, sq(3000 + rs.rand() * 3000, 0.01) * env_adsr(int(0.01 * SR)), ts, 0.06)
# ---------- BOOM + zap ----------
d = 1.4; tb = tt(d)
boom = np.sin(2 * np.pi * np.cumsum(np.linspace(110, 30, len(tb))) / SR) * np.exp(-tb * 3) + lp(noise(d), 0.12) * np.exp(-tb * 4)
put(sfx, boom, T_BOOM, 0.9)
d = 0.35; zap = np.sign(np.sin(2 * np.pi * np.cumsum(np.linspace(2400, 200, int(d * SR))) / SR)) * np.linspace(1, 0, int(d * SR))
put(sfx, zap, T_BOOM, 0.12)
# ---------- city power-down 35.7-37.3 ----------
d = 1.9; tb = tt(d)
pd = np.sin(2 * np.pi * np.cumsum(np.linspace(140, 18, len(tb))) / SR) * np.linspace(1, 0, len(tb)) ** 0.7
put(sfx, pd, 35.7, 0.45)
for ts in np.arange(35.85, 37.3, 0.11): put(sfx, lp(noise(0.03), 0.4) * np.exp(-tt(0.03) * 120), ts + rs.rand() * 0.05, 0.25)
# ---------- game over 37.6 ----------
for j, m in enumerate([72, 71, 70, 69, 68, 67, 66, 65]):
    put(music, sq(note(m), 0.16, 0.5) * env_adsr(int(0.16 * SR)), 38.9 + j * 0.15, 0.06)
put(music, sq(note(53), 0.9, 0.5) * env_adsr(int(0.9 * SR), 0.01, 0.6), 40.1, 0.06)
# ---------- sad oud-ish ending ----------
melody = [(62, 0), (63, 0.5), (66, 1.0), (67, 1.5), (66, 2.25), (63, 2.75), (62, 3.5)]
for m, off in melody: put(music, pluck(note(m - 12), 1.2), 41.0 + off * 0.85, 0.15, True)
for off in [0, 1.7, 3.4]: put(music, pluck(note(38), 1.6), 41.0 + off, 0.11, True)
for j, m in enumerate([74, 75, 78, 79]): put(sfx, pluck(note(m), 0.6), 45.75 + j * 0.16, 0.18, True)
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
