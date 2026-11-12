# Synthesises the music bed + SFX for «مقوّي الواي فاي النووي ٢» and mixes them under the dialogue.
# usage: python3 sfx.py <dialogue.wav> <out_mix.wav> [lines_google.json]
# Event times are written in scene time; with a lines file carrying warp_anchors_new_old they are mapped to output time.
import sys, wave, json
import numpy as np

SR = 44100
ANC = [[0, 0], [41.5, 41.5]]
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
T_HOOK = 1.9; T_REVEAL = 6.6; T_SAMIR = 13.3; T_PW = 15.3; T_CONNECT = 22.3; T_STREET = 25.6; T_SHOUT = 27.72; T_HIDE = 31.65; T_ANNO = 33.4
r = np.random.RandomState(15)
def jingle(t0, notes, step=0.07, g=0.08):
    for j, m in enumerate(notes): put(sfx, sq(note(m), 0.1, 0.25) * env_adsr(int(0.1 * SR)), t0 + j * step, g)
# night crickets
for ts in np.arange(0.2, 41, 0.9):
    for k in range(3): put(amb, np.sin(2 * np.pi * (4200 + r.rand() * 500) * tt(0.04)) * env_adsr(int(0.04 * SR), 0.003, 0.02), ts + k * 0.07 + r.rand() * 0.3, 0.012)
# cold open hit + rewind
put(sfx, np.sin(2 * np.pi * 55 * tt(0.6)) * np.exp(-tt(0.6) * 5), 0.05, 0.5)
d = 0.5; tb = tt(d); put(sfx, np.sin(2 * np.pi * np.cumsum(np.linspace(1200, 200, len(tb))) / SR) * 0.5 + lp(noise(d), 0.4) * 0.5, 1.42, 0.2)
# hook pop + "wrong password" buzz
jingle(T_HOOK, [79, 84], 0.06, 0.07); put(sfx, sq(110, 0.35, 0.5) * env_adsr(int(0.35 * SR)), 2.35, 0.06)
# sneaky pizzicato groove (spy) under the scheme
step = 60 / 120 / 2; t = 2.0; i = 0; pat = [50, 0, 53, 0, 55, 54, 53, 0]
while t < T_CONNECT:
    m = pat[i % 8]
    if m: put(music, pluck(note(m + 12), 0.25), t, 0.1, True)
    if i % 4 == 0: put(music, lp(noise(0.03), 0.8) * np.exp(-tt(0.03) * 100), t, 0.04, True)
    t += step; i += 1
# reveal fanfare + invention card
jingle(T_REVEAL + 0.1, [67, 71, 74, 79, 83], 0.07, 0.08)
# heartbeat-like stethoscope thumps while listening
for ts in np.arange(10.4, 18.6, 0.75): put(sfx, np.sin(2 * np.pi * 48 * tt(0.15)) * np.exp(-tt(0.15) * 18), ts, 0.35); put(sfx, np.sin(2 * np.pi * 48 * tt(0.12)) * np.exp(-tt(0.12) * 20), ts + 0.2, 0.25)
# keyboard clicks: Abu Samir typing, then Hamada typing
for a, b in ((13.4, 18.6), (19.0, 21.7)):
    for ts in np.arange(a, b, 0.14): put(sfx, lp(noise(0.015), 0.9) * np.exp(-tt(0.015) * 250), ts + r.rand() * 0.04, 0.12)
# CONNECTED: chime + victory
for j, m in enumerate([72, 76, 79, 84, 88]): put(sfx, np.sin(2 * np.pi * note(m) * tt(0.4)) * np.exp(-tt(0.4) * 6), T_CONNECT + j * 0.06, 0.1)
step = 60 / 140 / 2; t = T_CONNECT + 0.3; i = 0
while t < 24.0: put(music, sq(note([72, 76, 79, 84][i % 4]), step * 0.8, 0.25) * env_adsr(int(step * 0.8 * SR)), t, 0.03, True); t += step; i += 1
# the whole street connects: rising ding cascade
for j in range(26): put(sfx, np.sin(2 * np.pi * note(84 + (j % 7)) * tt(0.12)) * np.exp(-tt(0.12) * 25), T_STREET + j * 0.07, 0.04)
# Abu Samir's fury: hit + cane rattle
put(sfx, np.sin(2 * np.pi * 50 * tt(0.7)) * np.exp(-tt(0.7) * 4), T_SHOUT, 0.6)
for j, m in enumerate([50, 49, 48]): put(music, sq(note(m), 0.3, 0.5) * env_adsr(int(0.3 * SR)), T_SHOUT + 0.1 + j * 0.32, 0.05, True)
for ts in np.arange(T_SHOUT, T_HIDE, 0.18): put(sfx, lp(noise(0.03), 0.7) * np.exp(-tt(0.03) * 80), ts, 0.08)
# hide: blanket whoosh
d = 0.4; put(sfx, lp(noise(d), 0.25) * np.sin(np.linspace(0, np.pi, int(d * SR))) ** 2, T_HIDE + 0.1, 0.3)
# anger meter + end
for j in range(10): put(sfx, sq(note(60 + j * 2), 0.06, 0.5) * env_adsr(int(0.06 * SR)), 35.2 + j * 0.166, 0.05)
for k in range(4): put(sfx, sq(880 if k % 2 else 660, 0.18, 0.5) * env_adsr(int(0.18 * SR)), 36.9 + k * 0.22, 0.04)
for j, m in enumerate([74, 75, 78, 79]): put(sfx, pluck(note(m), 0.6), 38.7 + j * 0.16, 0.16, True)
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
