# Local audio for the Ibrahim gritty-3D test: ambience, foley, engine, music. Usage: python sfx.py out.wav
import sys
import numpy as np
import soundfile as sf
from scipy import signal

SR = 48000
DUR = 10.0
N = int(SR * DUR)
rng = np.random.default_rng(7)
FREEZE = 8.6
STEPS = [0.252, 0.725, 1.218, 1.692, 2.185, 2.658, 3.152, 3.625, 4.118]
BACKFIRE = 7.55

t = np.arange(N) / SR
L = np.zeros(N); R = np.zeros(N)


def lp(x, f, o=2):
    b, a = signal.butter(o, f / (SR / 2), 'low'); return signal.lfilter(b, a, x)


def hp(x, f, o=2):
    b, a = signal.butter(o, f / (SR / 2), 'high'); return signal.lfilter(b, a, x)


def bp(x, f1, f2, o=2):
    b, a = signal.butter(o, [f1 / (SR / 2), f2 / (SR / 2)], 'band'); return signal.lfilter(b, a, x)


def add(x, at, gain=1.0, pan=0.0):
    i = int(at * SR); x = x[: max(0, N - i)]
    gl = gain * np.sqrt((1 - pan) / 2); gr = gain * np.sqrt((1 + pan) / 2)
    L[i:i + len(x)] += x * gl; R[i:i + len(x)] += x * gr


def env(n, a, d):
    e = np.ones(n); na = max(1, int(a * SR)); e[:na] = np.linspace(0, 1, na)
    e *= np.exp(-np.arange(n) / (d * SR)); return e


# ---------- ambience: distant city rumble, wind, far traffic swells ----------
brown = np.cumsum(rng.standard_normal(N)); brown = hp(brown, 20); brown /= np.abs(brown).max()
rumble = lp(brown, 180) * 0.5
wind = bp(rng.standard_normal(N), 300, 1800) * (0.5 + 0.5 * np.sin(2 * np.pi * 0.13 * t + 1)) * 0.05
swell = lp(rng.standard_normal(N), 600) * (0.4 + 0.6 * np.clip(np.sin(2 * np.pi * 0.09 * t), 0, 1)) * 0.25
amb = rumble + wind + swell
L += amb * 0.55; R += np.roll(amb, 900) * 0.55


# distant car horns (Cairo!) — two-tone, filtered and far
def horn(dur, f1, f2):
    n = int(dur * SR); tt = np.arange(n) / SR
    x = signal.sawtooth(2 * np.pi * f1 * tt) + 0.8 * signal.sawtooth(2 * np.pi * f2 * tt)
    x = bp(x, 300, 2500) * env(n, 0.01, dur * 2) * np.clip((dur - tt) * 30, 0, 1)
    return lp(x, 1400) * 0.12


add(horn(0.35, 410, 520), 1.7, 0.6, -0.6); add(horn(0.22, 410, 520), 2.15, 0.6, -0.6)
add(horn(0.18, 820, 980), 5.3, 0.35, 0.7); add(horn(0.18, 820, 980), 5.5, 0.35, 0.7); add(horn(0.18, 820, 980), 5.7, 0.35, 0.7)
# far dog bark
for at in (3.3, 3.62):
    n = int(0.16 * SR); tt = np.arange(n) / SR
    f = 520 - 900 * tt
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) + 0.4 * rng.standard_normal(n)
    add(lp(bp(x, 300, 1500) * env(n, 0.005, 0.06), 1200) * 0.15, at, 1, 0.5)

# ---------- footsteps: plastic sandal slap on wet asphalt ----------
for i, st in enumerate(STEPS):
    n = int(0.18 * SR)
    slap = bp(rng.standard_normal(n), 900, 4500) * env(n, 0.001, 0.018)
    thud = lp(rng.standard_normal(n), 220) * env(n, 0.002, 0.05) * 2.5
    wet = bp(rng.standard_normal(n), 2500, 7000) * env(n, 0.01, 0.05) * 0.35
    g = 0.5 + 0.35 * min(1, st / 3.5)  # gets closer to camera
    add((slap + thud + wet) * 0.45, st, g, 0.15 if i % 2 else -0.1)
    # sandal flap just after
    add(bp(rng.standard_normal(int(0.05 * SR)), 1500, 5000) * env(int(0.05 * SR), 0.001, 0.008) * 0.25, st + 0.09, g)

# ---------- engine: single-cylinder putter, nearer in shot C ----------
fire = np.zeros(N)
rate = 11.0 + 1.5 * np.sin(t * 2.1)
ph = np.cumsum(rate / SR)
pulses = np.where(np.diff(np.floor(ph), prepend=0) > 0)[0]
for p in pulses:
    n = int(0.06 * SR)
    if p + n >= N:
        continue
    fire[p:p + n] += lp(rng.standard_normal(n), 400) * env(n, 0.001, 0.02) * (0.8 + 0.4 * rng.random())
eng = lp(fire, 900) + 0.3 * bp(fire, 900, 3000)
eng_gain = 0.06 + 0.04 * np.clip((t - 4.4) / 1.0, 0, 1) + 0.22 * np.clip((t - 6.7) / 0.3, 0, 1)
eng_gain *= np.where(t < 6.7, 1, 1) * np.where(t > BACKFIRE, np.clip(1 - (t - BACKFIRE) * 0.3, 0.4, 1), 1)
eng_gain *= 1 - 0.85 * np.clip((t - FREEZE) / 0.05, 0, 1)
L += eng * eng_gain * 0.9; R += eng * eng_gain * 1.1
# rattle crescendo before backfire
n = int(0.5 * SR); tt = np.arange(n) / SR
rat = bp(rng.standard_normal(n), 2000, 6000) * (np.sin(2 * np.pi * 34 * tt) > 0.3) * np.linspace(0, 1, n) ** 2
add(rat * 0.12, BACKFIRE - 0.5, 1, 0.3)
# BACKFIRE: bang + low boom + metallic ring + debris
n = int(1.6 * SR); tt = np.arange(n) / SR
bang = rng.standard_normal(n) * env(n, 0.0005, 0.04) * 1.6
boom = np.sin(2 * np.pi * (55 * tt - 40 * tt ** 2)) * env(n, 0.002, 0.35) * 1.4
ring = sum(np.sin(2 * np.pi * f * tt) * a for f, a in ((1830, .1), (2710, .07), (3920, .05))) * env(n, 0.001, 0.4)
crackle = bp(rng.standard_normal(n), 3000, 9000) * (rng.random(n) > 0.995) * 4 * env(n, 0.01, 0.3)
add(lp(bang, 6000) + lp(boom, 300) + ring + crackle, BACKFIRE, 0.9, 0.3)
# sputter after
for k, d in enumerate((0.55, 0.8, 1.0)):
    m = int(0.12 * SR)
    add(lp(rng.standard_normal(m), 500) * env(m, 0.001, 0.03) * 0.5, BACKFIRE + d, 0.6, 0.3)

# ---------- music: moody hijaz-mode pad + oud-like plucks ----------
def note(m):
    return 440 * 2 ** ((m - 69) / 12)


def pad(freqs, dur, gain):
    n = int(dur * SR); tt = np.arange(n) / SR; x = np.zeros(n)
    for f in freqs:
        for det in (-0.12, 0.0, 0.11):
            x += signal.sawtooth(2 * np.pi * f * (1 + det / 100) * tt + rng.random() * 6)
    x = lp(x, 900) / (len(freqs) * 3)
    e = np.clip(tt / 1.2, 0, 1) * np.clip((dur - tt) / 0.8, 0, 1)
    return x * e * gain


def pluck(f, dur=1.4, gain=0.3):  # Karplus-Strong
    n = int(dur * SR); p = int(SR / f); buf = rng.uniform(-1, 1, p); out = np.zeros(n)
    for i in range(n):
        out[i] = buf[i % p]; buf[i % p] = 0.5 * (buf[i % p] + buf[(i + 1) % p]) * 0.996
    return lp(out, 3500) * gain * env(n, 0.002, dur / 2.5)


# D hijaz: D Eb F# G A Bb C
D3, Eb3, Fs3, G3, A3, Bb3, C4, D4 = 50, 51, 54, 55, 57, 58, 60, 62
mus = np.zeros(N)


def madd(x, at):
    i = int(at * SR); x = x[: N - i]; mus[i:i + len(x)] += x


madd(pad([note(D3), note(A3), note(D4)], 4.6, 0.32), 0.0)
madd(pad([note(D3 - 2), note(Bb3 - 12), note(D4 - 7)], 4.0, 0.30), 4.4)
madd(pad([note(D3), note(Fs3), note(A3)], 1.8, 0.28), 7.0)
bass = [(0.0, D3 - 12), (2.2, D3 - 12), (4.4, Bb3 - 24), (6.6, G3 - 24), (7.0, D3 - 12)]
for at, m in bass:
    n = int(2.0 * SR); tt = np.arange(n) / SR
    madd(np.sin(2 * np.pi * note(m) * tt) * env(n, 0.02, 0.9) * 0.35, at)
mel = [(0.6, D4), (1.2, Eb3 + 12), (1.5, Fs3 + 12), (2.4, G3 + 12), (3.0, Fs3 + 12), (3.3, Eb3 + 12), (3.9, D4),
       (5.0, A3 + 12), (5.4, Bb3 + 12), (5.8, A3 + 12), (6.2, G3 + 12), (6.6, Fs3 + 12)]
for at, m in mel:
    madd(pluck(note(m), 1.2, 0.22), at)
# soft hand-drum (doumbek-ish) pulse
for k in range(16):
    at = 0.6 + k * 0.48
    if at > BACKFIRE - 0.1:
        break
    n = int(0.25 * SR); tt = np.arange(n) / SR
    dum = np.sin(2 * np.pi * (110 - 60 * tt) * tt) * env(n, 0.002, 0.08)
    tek = bp(rng.standard_normal(n), 2500, 8000) * env(n, 0.001, 0.02) * 0.4
    madd((dum if k % 2 == 0 else tek) * 0.25, at)
# music ducks under the backfire, then the freeze stinger
duck = 1 - 0.7 * np.clip((t - BACKFIRE) / 0.05, 0, 1) * np.clip(1 - (t - BACKFIRE - 0.4) / 0.6, 0, 1)
mus *= duck * (1 - np.clip((t - FREEZE) / 0.08, 0, 1))
# reverse swell into freeze
n = int(0.6 * SR); tt = np.arange(n) / SR
sw = bp(rng.standard_normal(n), 400, 6000) * (tt / tt[-1]) ** 3 * 0.35
madd(sw, FREEZE - 0.6)
# stinger: low hit + tremolo string chord + oud flourish
n = int(1.6 * SR); tt = np.arange(n) / SR
hit = np.sin(2 * np.pi * (60 - 25 * tt) * tt) * env(n, 0.001, 0.5) * 0.9 + lp(rng.standard_normal(n), 2000) * env(n, 0.001, 0.05) * 0.6
madd(hit, FREEZE)
madd(pad([note(D3), note(Fs3), note(A3), note(D4)], 1.4, 0.45) * (0.7 + 0.3 * np.sin(2 * np.pi * 12 * np.arange(int(1.4 * SR)) / SR)), FREEZE)
for k, m in enumerate((D4, Eb3 + 12, Fs3 + 12, A3 + 12)):
    madd(pluck(note(m), 1.0, 0.25), FREEZE + 0.08 + k * 0.09)

L += mus * 0.9; R += np.roll(mus, 300) * 0.9

# freeze: the world goes muffled
mix = np.stack([L, R], 1)
fz = np.clip((t - FREEZE) / 0.1, 0, 1)[:, None]
muff = np.stack([lp(L, 500), lp(R, 500)], 1) * 0.5
# keep the stinger (music) bright: recompute music-only after freeze
mix = mix * (1 - fz) + (muff + np.stack([mus, mus], 1) * 0.6) * fz
# simple room reverb tail
ir_n = int(0.8 * SR); ir = rng.standard_normal(ir_n) * np.exp(-np.arange(ir_n) / (0.18 * SR)); ir = lp(ir, 3000) * 0.08
for c in range(2):
    mix[:, c] += signal.fftconvolve(mix[:, c], ir)[:N]
# fades + normalise
mix[: int(0.15 * SR)] *= np.linspace(0, 1, int(0.15 * SR))[:, None]
mix[-int(0.3 * SR):] *= np.linspace(1, 0, int(0.3 * SR))[:, None]
mix /= np.abs(mix).max() / 0.89
sf.write(sys.argv[1], mix.astype(np.float32), SR)
print('wrote', sys.argv[1])
