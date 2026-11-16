# Synthesises the music bed + SFX for «مجفف الموبايلات النووي» and mixes them under the dialogue.
# usage: python3 sfx.py <dialogue.wav> <out_mix.wav> [lines_google.json]
# Event times are written in scene time; with a lines file carrying warp_anchors_new_old they are mapped to output time.
import sys, wave, json
import numpy as np

SR = 44100
ANC = [[0, 0], [35.5, 35.5]]
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
T_RW = 2.15; T_HOOK = 2.7; T_DROP = 3.25; T_KIT = 6.0; T_REVEAL = 7.2; T_IN = 12.9; T_FIRE = 13.8; T_MOM = 15.6; T_GRAB = 17.3; T_DIN = 19.2; T_RING = 20.4; T_DIG = 22.8; T_SNIFF = 25.1; T_ANNO = 27.06
r = np.random.RandomState(17)
def jingle(t0, notes, step=0.07, g=0.08):
    for j, m in enumerate(notes): put(sfx, sq(note(m), 0.1, 0.25) * env_adsr(int(0.1 * SR)), t0 + j * step, g)
def ring(a, b):
    for ts in np.arange(a, b, 0.5):
        for j in range(5): put(sfx, sq(1320 if j % 2 else 1760, 0.05, 0.5) * env_adsr(int(0.05 * SR)), ts + j * 0.05, 0.05)
    tb = tt(b - a); put(sfx, lp(np.sign(np.sin(2 * np.pi * 150 * tb)), 0.3) * (np.sin(2 * np.pi * 2 * tb) > 0), a, 0.04)  # buzzing plate
ring(0.0, T_RW + 0.1); ring(T_RING - 0.2, T_DIG)
put(sfx, np.sin(2 * np.pi * 55 * tt(0.6)) * np.exp(-tt(0.6) * 5), 0.05, 0.45)
d = 0.5; tb = tt(d); put(sfx, np.sin(2 * np.pi * np.cumsum(np.linspace(1200, 200, len(tb))) / SR) * 0.5 + lp(noise(d), 0.4) * 0.5, T_RW + 0.02, 0.2)
jingle(T_HOOK, [79, 84], 0.06, 0.07)
# drop + PLOP
d = 0.35; tb = tt(d); put(sfx, np.sin(2 * np.pi * np.cumsum(np.linspace(1600, 500, len(tb))) / SR) * 0.4, T_DROP, 0.1)
put(sfx, np.sin(2 * np.pi * np.cumsum(np.linspace(300, 900, int(0.12 * SR))) / SR) * np.exp(-tt(0.12) * 20), T_DROP + 0.34, 0.5)
for j in range(5): put(sfx, lp(noise(0.05), 0.6) * np.exp(-tt(0.05) * 40), T_DROP + 0.4 + j * 0.06, 0.15)
# sneaky groove (kitchen scheme)
step = 60 / 120 / 2; t = 3.0; i = 0; pat = [50, 0, 53, 0, 55, 54, 53, 0]
while t < T_MOM:
    m = pat[i % 8]
    if m: put(music, pluck(note(m + 12), 0.25), t, 0.09, True)
    if i % 4 == 0: put(music, lp(noise(0.03), 0.8) * np.exp(-tt(0.03) * 100), t, 0.04, True)
    t += step; i += 1
jingle(T_REVEAL, [67, 71, 74, 79, 83], 0.07, 0.08)
put(sfx, lp(noise(0.08), 0.8) * np.exp(-tt(0.08) * 50), T_IN, 0.3)  # phone into the rice
# gas WHOOMPH + roaring fire + lid rattle + hair dryer
put(sfx, lp(noise(0.5), 0.2) * np.exp(-tt(0.5) * 5), T_FIRE, 0.6)
d = T_GRAB - T_FIRE; put(amb, lp(noise(d), 0.12), T_FIRE, 0.35)
for ts in np.arange(T_FIRE, T_GRAB, 0.09): put(sfx, lp(noise(0.02), 0.9) * np.exp(-tt(0.02) * 150), ts, 0.1)
d = T_GRAB - 12.2; tb = tt(d); put(sfx, lp(noise(d), 0.5) * 0.6 + np.sin(2 * np.pi * 220 * tb) * 0.2, 12.2, 0.06)
# mom + guests: doorbell, chatter, serve
for j, m in enumerate([76, 72]): put(sfx, np.sin(2 * np.pi * note(m) * tt(0.6)) * np.exp(-tt(0.6) * 4), T_MOM + 0.1 + j * 0.35, 0.12)
put(amb, lp(noise(T_RING - T_DIN), 0.06), T_DIN, 0.12)
put(sfx, lp(noise(0.1), 0.4) * np.exp(-tt(0.1) * 30), T_DIN + 0.9, 0.3)
step = 60 / 100 / 2; t = T_DIN; i = 0
while t < T_RING - 0.3: put(music, pluck(note([69, 72, 76, 72][i % 4]), 0.5), t, 0.06, True); t += step; i += 1
# dig out + victory + sniff
for ts in np.arange(T_DIG, T_DIG + 0.5, 0.1): put(sfx, lp(noise(0.05), 0.5) * np.exp(-tt(0.05) * 40), ts, 0.2)
for j, m in enumerate([72, 76, 79, 84, 88]): put(sfx, np.sin(2 * np.pi * note(m) * tt(0.4)) * np.exp(-tt(0.4) * 6), T_DIG + 0.3 + j * 0.06, 0.1)
for j in range(3): put(sfx, lp(noise(0.12), 0.3) * np.sin(np.linspace(0, np.pi, int(0.12 * SR))), T_SNIFF + 0.3 + j * 0.2, 0.25)
for j, m in enumerate([60, 59, 58]): put(music, sq(note(m), 0.25, 0.5) * env_adsr(int(0.25 * SR)), T_SNIFF + 1.2 + j * 0.27, 0.05, True)
for j in range(10): put(sfx, sq(note(60 + j * 2), 0.06, 0.5) * env_adsr(int(0.06 * SR)), 28.6 + j * 0.14, 0.05)
for j, m in enumerate([74, 75, 78, 79]): put(sfx, pluck(note(m), 0.6), 32.4 + j * 0.16, 0.16, True)
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
