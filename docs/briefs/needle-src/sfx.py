# music bed + SFX for «needle», mixed under the dialogue.
# usage: python3 sfx.py <dialogue.wav> <out_mix.wav> [lines_google.json]
# Event times are written in scene time; with a lines file carrying warp_anchors_new_old they are mapped to output time.
import sys, wave, json
import numpy as np

SR = 44100
ANC = [[0, 0], [65.1, 65.1]]
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
r = np.random.RandomState(6)
T_CALM = 5.12; T_POP1 = 14.12; T_STORM = 19.38; T_BOAT = 26.91; T_FLIP = 32.4; T_CUT = 36.25; T_FOUND = 39.5; T_POP2 = 43.49; T_POP2E = 47.57; T_LON = 47.42; T_HOME = 55.74
def pad(t0, t1, notes, g):
    d = t1 - t0; tb = tt(d); x = np.zeros(len(tb))
    for m in notes: x += np.sin(2 * np.pi * note(m) * tb) + 0.3 * np.sin(2 * np.pi * note(m) * 2.003 * tb)
    e = np.minimum(1, tb / 1.5) * np.minimum(1, (d - tb) / 1.5); put(music, lp(x, 0.2) * e, t0, g, True)

# music: documentary pad (warm), darker in the storm, brighter when found, gentle at London
for a, b, ch, g in [(0, T_STORM, [57, 61, 64], 0.02), (T_STORM, T_FOUND, [50, 53, 57], 0.022), (T_FOUND, T_HOME, [55, 59, 62], 0.02), (T_HOME, DUR, [57, 61, 64], 0.016)]:
    x = a
    while x < b - 0.5: pad(x, min(b, x + 4.2), ch, g); x += 4.0
# ancient Egypt: wind over sand
put(amb, lp(noise(T_CALM), 0.02), 0, 0.05)
# calm sea: waves + steam engine chuff + gulls
d = T_STORM - T_CALM; tb = tt(d); put(amb, lp(noise(d), 0.04) * (0.6 + 0.4 * np.sin(2 * np.pi * 0.25 * tb)), T_CALM, 0.07)
x = T_CALM
while x < T_STORM: put(sfx, lp(noise(0.12), 0.2) * np.exp(-tt(0.12) * 20), x, 0.05); x += 0.45
for j in range(4): put(amb, np.sin(2 * np.pi * np.cumsum(np.linspace(1800, 1200, int(0.3 * SR))) / SR) * np.exp(-tt(0.3) * 6), T_CALM + 1 + j * 2.1, 0.02)
# storm: roaring wind + big waves + rain + 2 thunders
d = T_FOUND - T_STORM; tb = tt(d); put(amb, lp(noise(d), 0.06) * (0.7 + 0.3 * np.sin(2 * np.pi * 0.15 * tb)) * np.minimum(1, tb / 2), T_STORM, 0.16)
put(amb, lp(noise(d), 0.5) * np.minimum(1, tb / 2), T_STORM, 0.03)
for j in range(8): dd = 1.6; tb2 = tt(dd); put(sfx, lp(noise(dd), 0.1) * np.sin(np.pi * tb2 / dd), T_STORM + 1 + j * 2.3, 0.14)
for tl in [T_STORM + 1.2, T_STORM + 4.6]: dd = 2.5; tb2 = tt(dd); put(sfx, lp(noise(dd), 0.03) * np.exp(-tb2 * 1.2) + np.sin(2 * np.pi * 40 * tb2) * np.exp(-tb2 * 2) * 0.5, tl + 0.3, 0.5)
dd = 0.8; tb2 = tt(dd); put(sfx, lp(noise(dd), 0.3) * np.exp(-tb2 * 4), T_FLIP + 0.3, 0.35)  # boat capsizing splash
put(sfx, lp(noise(0.08), 0.8) * np.exp(-tt(0.08) * 40), T_CUT, 0.4)  # rope cut snap
# found: calm sea again
d = T_LON - T_FOUND; tb = tt(d); put(amb, lp(noise(d), 0.04) * (0.6 + 0.4 * np.sin(2 * np.pi * 0.25 * tb)), T_FOUND, 0.06)
put(sfx, sq(196, 1.2, 0.5) * env_adsr(int(1.2 * SR), 0.05, 0.3) * 0.5, T_FOUND + 1.0, 0.03)  # ship horn
# pause jingle for the frozen pop-in
put(sfx, sq(note(76), 0.1, 0.25) * env_adsr(int(0.1 * SR)), T_POP2, 0.06); put(sfx, sq(note(72), 0.12, 0.25) * env_adsr(int(0.12 * SR)), T_POP2 + 0.1, 0.06)
put(sfx, sq(note(72), 0.1, 0.25) * env_adsr(int(0.1 * SR)), T_POP2E - 0.3, 0.06); put(sfx, sq(note(76), 0.12, 0.25) * env_adsr(int(0.12 * SR)), T_POP2E - 0.2, 0.06)
# pop-in whoosh (on the cylinder)
dd = 0.4; tb2 = tt(dd); put(sfx, lp(noise(dd), 0.3) * np.sin(np.pi * tb2 / dd), T_POP1, 0.25)
# London: river + distant bell
d = T_HOME - T_LON; put(amb, lp(noise(d), 0.03), T_LON, 0.05)
for j in range(3): put(sfx, (np.sin(2 * np.pi * 330 * tt(2.5)) + 0.5 * np.sin(2 * np.pi * 660 * tt(2.5))) * np.exp(-tt(2.5) * 1.5), T_LON + 1 + j * 1.6, 0.04)

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
