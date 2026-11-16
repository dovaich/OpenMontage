# Synthesises the music bed + SFX for «المكنسة النووية» and mixes them under the dialogue.
# usage: python3 sfx.py <dialogue.wav> <out_mix.wav> [lines_google.json]
# Event times are written in scene time; with a lines file carrying warp_anchors_new_old they are mapped to output time.
import sys, wave, json
import numpy as np

SR = 44100
ANC = [[0, 0], [48.3, 48.3]]
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
r = np.random.RandomState(21)
def jingle(t0, notes, step=0.07, g=0.08):
    for j, m in enumerate(notes): put(sfx, sq(note(m), 0.1, 0.25) * env_adsr(int(0.1 * SR)), t0 + j * step, g)
T_RW = 5.760000000000001; T_HOOK = T_RW + 0.6; T_ON = 25.03
def vacuum(a, b, g):
    d = b - a; tb = tt(d); put(sfx, (lp(noise(d), 0.25) * 0.8 + np.sin(2 * np.pi * np.cumsum(np.linspace(180, 420, len(tb))) / SR) * 0.3) * np.minimum(1, tb * 3), a, g)
vacuum(0.0, T_RW + 0.3, 0.35); vacuum(T_ON, 39.43, 0.3)
for ts in np.arange(0.2, 48.3, 0.9):
    for k in range(3): put(amb, np.sin(2 * np.pi * (4200 + r.rand() * 500) * tt(0.04)) * env_adsr(int(0.04 * SR), 0.003, 0.02), ts + k * 0.07 + r.rand() * 0.3, 0.012)
put(sfx, np.sin(2 * np.pi * 55 * tt(0.6)) * np.exp(-tt(0.6) * 5), 0.05, 0.45)
d = 0.5; tb = tt(d); put(sfx, np.sin(2 * np.pi * np.cumsum(np.linspace(1200, 200, len(tb))) / SR) * 0.5 + lp(noise(d), 0.4) * 0.5, T_RW + 0.02, 0.2)
jingle(T_HOOK, [79, 84], 0.06, 0.07)
# drilling bursts + welding crackle during manufacturing
for a in np.arange(T_HOOK, 11.399999999999999, 1.3):
    dd = 0.7; tb = tt(dd); put(sfx, np.sign(np.sin(2 * np.pi * np.cumsum(np.full(len(tb), 140.0) + 30 * np.sin(2 * np.pi * 6 * tb)) / SR)) * env_adsr(len(tb), 0.02, 0.1), a, 0.04)
    for ts in np.arange(a, a + 0.7, 0.04): put(sfx, lp(noise(0.02), 0.95) * np.exp(-tt(0.02) * 180), ts, 0.05)
step = 60 / 120 / 2; tt0 = T_HOOK; i = 0; pat = [50, 0, 53, 0, 55, 54, 53, 0]
while tt0 < T_ON:
    m = pat[i % 8]
    if m: put(music, pluck(note(m + 12), 0.25), tt0, 0.09, True)
    if i % 4 == 0: put(music, lp(noise(0.03), 0.8) * np.exp(-tt(0.03) * 100), tt0, 0.04, True)
    tt0 += step; i += 1
jingle(13.03, [67, 71, 74, 79, 83], 0.07, 0.08)
for k, v in enumerate([16.59, 18.51, 20.11]): put(sfx, np.sin(2 * np.pi * note(79 + k * 4) * tt(0.25)) * np.exp(-tt(0.25) * 10), v, 0.08)
put(sfx, lp(noise(0.06), 0.9) * np.exp(-tt(0.06) * 60), T_ON, 0.4); put(sfx, np.sin(2 * np.pi * 60 * tt(0.3)) * np.exp(-tt(0.3) * 10), T_ON, 0.4)
d = 0.8; tb = tt(d); put(sfx, np.sin(2 * np.pi * np.cumsum(np.linspace(900, 200, len(tb))) / SR) * np.exp(-tb * 2), 27.93, 0.15)  # Hamada slurped in
put(sfx, np.sin(2 * np.pi * np.cumsum(np.linspace(300, 900, int(0.12 * SR))) / SR) * np.exp(-tt(0.12) * 20), 28.13, 0.4)  # POP
put(sfx, np.sin(2 * np.pi * 55 * tt(0.6)) * np.exp(-tt(0.6) * 5), 28.58, 0.45)
for ts in np.arange(34.44, 39.13, 0.18): put(sfx, lp(noise(0.03), 0.5) * np.exp(-tt(0.03) * 60), ts, 0.06)  # pencil
for j in range(10): put(sfx, sq(note(60 + j * 2), 0.06, 0.5) * env_adsr(int(0.06 * SR)), 40.63 + j * 0.14, 0.05)
for j, m in enumerate([74, 75, 78, 79]): put(sfx, pluck(note(m), 0.6), 45.3 + j * 0.16, 0.16, True)
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
