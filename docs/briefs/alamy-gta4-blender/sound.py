# Music bed + city ambience + freeze hit, mixed under vo.wav -> mix.wav (10 s, 48 kHz stereo)
import numpy as np, soundfile as sf, os
H = os.path.dirname(os.path.abspath(__file__)); SR = 48000; D = 10.0; N = int(D * SR)
rs = np.random.RandomState(4); t = np.arange(N) / SR
vo, vsr = sf.read(os.path.join(H, "vo.wav"))
vo = np.interp(np.arange(N) * vsr / SR, np.arange(len(vo)), vo)[:N]
def lp(x, fc):
    a = 1 - np.exp(-2 * np.pi * fc / SR); y = np.empty_like(x); acc = 0.0
    for i in range(len(x)): acc += a * (x[i] - acc); y[i] = acc
    return y
FREEZE = 7.85
# ambience: low traffic rumble + slow swells + a far siren
amb = lp(rs.randn(N), 180) * 2.2 * (0.7 + 0.3 * np.sin(2 * np.pi * 0.13 * t))
hiss = lp(rs.randn(N), 2500) * 0.05
sir = np.zeros(N); i0, i1 = int(1.0 * SR), int(6.5 * SR); ts = t[i0:i1] - 1.0
fr = 700 + 180 * np.sin(2 * np.pi * 0.55 * ts); ph = 2 * np.pi * np.cumsum(fr) / SR
sir[i0:i1] = np.sin(ph) * 0.025 * np.sin(np.pi * ts / 5.5) ** 2
ambience = (amb * 0.12 + hiss + sir)
# music: 92 bpm, dark minor bass ostinato + soft kick + hats, cut at the freeze
bpm = 92; beat = 60 / bpm; mus = np.zeros(N)
bass_notes = [40, 40, 43, 40, 38, 38, 35, 38]   # E2 E2 G2 E2 D2 D2 B1 D2
def put(x, at, g):
    i = int(at * SR); x = x[:max(0, N - i)]; mus[i:i + len(x)] += x * g
k = 0; tb = 0.25
while tb < FREEZE:
    n = bass_notes[k % 8]; f = 440 * 2 ** ((n - 69) / 12); d = beat * 0.9; tt = np.arange(int(d * SR)) / SR
    saw = 2 * ((tt * f) % 1) - 1; env = np.exp(-tt * 3.0) * np.minimum(1, tt * 200)
    put(lp(saw, 420) * env, tb, 0.33)
    if k % 2 == 0:  # kick
        kt = np.arange(int(0.35 * SR)) / SR; put(np.sin(2 * np.pi * (50 + 90 * np.exp(-kt * 30)) * kt) * np.exp(-kt * 9), tb, 0.5)
    ht = np.arange(int(0.05 * SR)) / SR; h = rs.randn(len(ht)); h = h - lp(h, 6000); put(h * np.exp(-ht * 80), tb + beat / 2, 0.06)
    k += 1; tb += beat
# pad under everything until the freeze
pad = sum(np.sin(2 * np.pi * 440 * 2 ** ((n - 69) / 12) * t + p) for n, p in ((52, 0), (55, 1), (59, 2))) / 3
mus += lp(pad, 900) * 0.05 * np.clip(t / 1.5, 0, 1) * (t < FREEZE)
fadeidx = int(FREEZE * SR); mus[fadeidx:] *= np.exp(-(t[fadeidx:] - FREEZE) * 18)
# freeze hit: boom + noise crack + low reverb tail
ht = np.arange(int(2.1 * SR)) / SR
boom = np.sin(2 * np.pi * (38 + 60 * np.exp(-ht * 12)) * ht) * np.exp(-ht * 2.2)
crack = lp(rs.randn(len(ht)), 3000) * np.exp(-ht * 25)
tail = lp(rs.randn(len(ht)), 300) * np.exp(-ht * 1.6) * 0.5
hit = boom * 0.8 + crack * 0.35 + tail * 0.3
hit_buf = np.zeros(N); i = int(FREEZE * SR); hit_buf[i:i + len(hit)] = hit[:N - i]
# a low sustained drone note for the name card
drone = lp(np.sin(2 * np.pi * 82.4 * t) + 0.5 * np.sin(2 * np.pi * 123.5 * t), 500) * 0.12 * (t > FREEZE) * np.clip((t - FREEZE) * 3, 0, 1) * np.clip((D - t) * 2, 0, 1)
# duck music/ambience under the voice
venv = np.convolve(np.abs(vo), np.ones(2400) / 2400, "same"); duck = 1 - 0.45 * np.clip(venv * 25, 0, 1)
bed = (mus + ambience) * duck + hit_buf + drone
mix = vo * 1.0 + bed * 0.8
L = mix + np.roll(ambience * duck, 240) * 0.15; Rr = mix + np.roll(ambience * duck, -240) * 0.15
st = np.stack([L, Rr], 1); st *= 10 ** (-1.0 / 20) / np.abs(st).max()
fo = int(0.25 * SR); st[-fo:] *= np.linspace(1, 0, fo)[:, None]
sf.write(os.path.join(H, "mix.wav"), st, SR); print("mix.wav ok")
