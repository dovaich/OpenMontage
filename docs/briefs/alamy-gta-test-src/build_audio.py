# Dialogue placement + SFX + music for the 42 s El-Alamy test; writes mix.wav, timeline.json, mouth.json
import json, sys
import numpy as np
import soundfile as sf
from scipy import signal

A = '/home/user/OpenMontage/projects/alamy-gta-test/assets/audio'
OUTJ = '/home/user/OpenMontage/projects/alamy-gta-test/src'
SR = 48000
DUR = 42.6
N = int(SR * DUR)
FPS = 24
rng = np.random.default_rng(11)

# (id, speaker, src, a, b, at, text)
LINES = [
    ('c1',  'alamy',  'r1', 23.96, 26.14, 0.40,  'اهدوا يا جماعة... أنا عملت ريستارت للعربية.'),
    ('a1a', 'anno',   'r2', 0.20, 2.95, 3.75,   'MISSION: FIX THE CAR.'),
    ('a1b', 'anno',   'r2', 3.44, 5.87, 6.70,   'REWARD: RESPECT.'),
    ('l1',  'bestem', 'r1', 0.10, 3.15, 9.50,   'يا عالمييييي! الزبون جاي بعربية بتطلّع دخان!'),
    ('l2',  'alamy',  'r1', 3.75, 7.55, 12.95,  'دخان؟ ده مش عطل يا بستم... دي رسالة.'),
    ('l3',  'bestem', 'r1', 7.85, 9.85, 16.85,  'رسالة إيه يا عم؟! العربية بتولّع!'),
    ('l4',  'alamy',  'r1', 10.27, 13.65, 19.05, 'سيبني أوصّل اللابتوب... العربية دي محتاجة تحديث سوفتوير.'),
    ('l5',  'bestem', 'r1', 14.36, 16.54, 22.65, 'سوفتوير؟! دي فيات موديل سبعين!'),
    ('l6a', 'alamy',  'r1', 16.99, 19.14, 25.00, 'وعشان كده... فاتها تحديثات كتير.'),
    ('l6b', 'alamy',  'r1', 19.87, 22.53, 27.45, 'جاري التحميل... تسعة وتسعين في المية...'),
    ('l6c', 'alamy',  'r1', 23.96, 26.14, 32.70, 'اهدوا يا جماعة... أنا عملت ريستارت للعربية.'),
    ('a2',  'anno',   'r2', 7.30, 14.23, 35.10, 'MISSION FAILED.'),
]
BOOM = 30.40

src = {}
for k in ('r1', 'r2'):
    x, sr = sf.read(f'{A}/{k}.wav'); x = x if x.ndim == 1 else x.mean(1)
    src[k] = signal.resample_poly(x, SR, sr)

t = np.arange(N) / SR
L = np.zeros(N); R = np.zeros(N)
dlg = np.zeros(N)
mouth = {'alamy': np.zeros(int(DUR * FPS) + 2), 'bestem': np.zeros(int(DUR * FPS) + 2)}


def lp(x, f, o=2): b, a = signal.butter(o, f / (SR / 2), 'low'); return signal.lfilter(b, a, x)
def hp(x, f, o=2): b, a = signal.butter(o, f / (SR / 2), 'high'); return signal.lfilter(b, a, x)
def bp(x, f1, f2, o=2): b, a = signal.butter(o, [f1 / (SR / 2), f2 / (SR / 2)], 'band'); return signal.lfilter(b, a, x)
def env(n, a, d):
    e = np.ones(n); na = max(1, int(a * SR)); e[:na] = np.linspace(0, 1, na); return e * np.exp(-np.arange(n) / (d * SR))
def add(x, at, gain=1.0, pan=0.0):
    i = int(at * SR)
    if i >= N: return
    x = x[: N - i]; L[i:i + len(x)] += x * gain * np.sqrt((1 - pan) / 2) * 1.41; R[i:i + len(x)] += x * gain * np.sqrt((1 + pan) / 2) * 1.41


# --- dialogue, loudness-matched (median voiced RMS, gain clamp 0.6-3.0) ---
clips = []
for (lid, spk, s, a, b, at, text) in LINES:
    c = src[s][int(a * SR):int(b * SR)].copy()
    f = int(0.02 * SR); c[:f] *= np.linspace(0, 1, f); c[-f:] *= np.linspace(1, 0, f)
    w = int(0.05 * SR); rms = np.array([np.sqrt(np.mean(c[i:i + w] ** 2)) for i in range(0, len(c) - w, w)])
    voiced = rms[rms > 0.02] if (rms > 0.02).any() else rms
    clips.append((lid, spk, c, at, float(np.sqrt(np.mean(voiced ** 2)))))
med = np.median([cl[4] for cl in clips])
tl = []
for (lid, spk, s, a, b, at, text), (_, _, c, _, r) in zip(LINES, clips):
    g = float(np.clip(med / max(r, 1e-6), 0.6, 3.0))
    if spk == 'anno': c = lp(c, 7000) + 0.25 * bp(c, 80, 250)  # radio-ish weight for the announcer
    i = int(at * SR); seg = c[: N - i] * g; dlg[i:i + len(seg)] += seg
    if spk in mouth:
        for fr in range(int(at * FPS), int((at + len(c) / SR) * FPS) + 1):
            j0 = int((fr / FPS - at) * SR); j1 = j0 + SR // FPS
            if 0 <= j0 < len(c): mouth[spk][fr] = max(mouth[spk][fr], float(np.sqrt(np.mean(c[j0:j1] ** 2)) * g))
    tl.append({'id': lid, 'spk': spk, 'at': at, 'end': round(at + len(c) / SR, 3), 'text': text})
for k in mouth:
    m = mouth[k]; mx = np.percentile(m[m > 0], 90) if (m > 0).any() else 1
    mouth[k] = np.clip(m / mx, 0, 1).round(3).tolist()

# --- ambience: exterior street (3.6-9.4) vs garage hum ---
brown = np.cumsum(rng.standard_normal(N)); brown = hp(brown, 20); brown /= np.abs(brown).max()
ext = ((t > 3.55) & (t < 9.45)).astype(float)
ext = np.convolve(ext, np.ones(2400) / 2400, 'same')
street = lp(brown, 200) * 0.45 + bp(rng.standard_normal(N), 300, 1800) * 0.03
hum = np.sin(2 * np.pi * 100 * t) * 0.012 + np.sin(2 * np.pi * 50 * t) * 0.02 + lp(brown, 120) * 0.25
buzz = bp(rng.standard_normal(N), 3000, 6000) * 0.006 * (1 + 0.5 * np.sin(2 * np.pi * 7 * t))
amb = street * ext + (hum + buzz) * (1 - ext)
L += amb; R += np.roll(amb, 700)
# far horns on the street
def horn(d, f1, f2):
    n = int(d * SR); tt = np.arange(n) / SR
    x = signal.sawtooth(2 * np.pi * f1 * tt) + 0.8 * signal.sawtooth(2 * np.pi * f2 * tt)
    return lp(bp(x, 300, 2500) * np.clip((d - tt) * 30, 0, 1), 1400) * 0.06
add(horn(0.3, 410, 520), 4.6, 1, -0.6); add(horn(0.2, 410, 520), 5.0, 1, -0.6); add(horn(0.15, 820, 980), 8.2, 0.7, 0.6)
# footsteps: street walk 3.7-9.3, garage entrance 12.0-14.6 (leather shoes)
def step(g):
    n = int(0.15 * SR); return (bp(rng.standard_normal(n), 1200, 6000) * env(n, 0.0008, 0.012) + lp(rng.standard_normal(n), 250) * env(n, 0.002, 0.04) * 2) * g
for k in range(12): add(step(0.35 * (1 - k / 14)), 3.8 + k * 0.483, 1, 0.1 if k % 2 else -0.1)
for k in range(6): add(step(0.4), 12.05 + k * 0.483, 1, 0.1 if k % 2 else -0.1)
# smoking engine hiss 9.4-30.4 and car idle knock
hiss = bp(rng.standard_normal(N), 1500, 7000) * 0.025 * ((t > 9.4) & (t < BOOM)) * (0.7 + 0.3 * np.sin(2 * np.pi * 0.7 * t))
L += hiss * 0.8; R += hiss * 1.1
# laptop: cable plug click, typing, progress beeps
add(bp(rng.standard_normal(int(0.04 * SR)), 2000, 8000) * env(int(0.04 * SR), 0.0005, 0.006) * 0.8, 20.6)
for k in range(28):
    at = 21.0 + k * 0.13 + rng.random() * 0.05
    if 22.6 < at < 25.0: continue
    add(bp(rng.standard_normal(int(0.03 * SR)), 2500, 9000) * env(int(0.03 * SR), 0.0005, 0.005) * 0.35, at, 1, 0.2)
for k, at in enumerate(np.arange(27.5, 30.2, 0.42)):
    n = int(0.08 * SR); tt = np.arange(n) / SR; add(np.sin(2 * np.pi * (880 + 60 * k) * tt) * env(n, 0.002, 0.03) * 0.12, at)
# BOOM
n = int(3.0 * SR); tt = np.arange(n) / SR
boom = (rng.standard_normal(n) * env(n, 0.0005, 0.06) * 1.6 + np.sin(2 * np.pi * (48 * tt - 18 * tt ** 2)) * env(n, 0.002, 0.7) * 1.8
        + lp(rng.standard_normal(n), 400) * env(n, 0.01, 0.9) * 1.2)
add(lp(boom, 5000), BOOM, 1.0)
for k in range(30): add(bp(rng.standard_normal(int(0.06 * SR)), 1500, 7000) * env(int(0.06 * SR), 0.001, 0.02) * (0.5 * rng.random()), BOOM + 0.3 + rng.random() * 1.6, 1, rng.uniform(-0.8, 0.8))
# fire crackle after the boom (and under the cold open)
fire = np.zeros(N)
for p in np.where(rng.random(N) > 0.9993)[0]:
    m = int(0.01 * SR)
    if p + m < N: fire[p:p + m] += rng.standard_normal(m) * env(m, 0.0002, 0.002) * rng.random()
fire = hp(fire, 800) * 0.5 + lp(rng.standard_normal(N), 300) * 0.08
firemask = ((t > BOOM + 0.2) | (t < 2.9)).astype(float)
L += fire * firemask; R += np.roll(fire, 400) * firemask
# rewind 2.9-3.6
n = int(0.7 * SR); tt = np.arange(n) / SR
rw = bp(rng.standard_normal(n), 800, 6000) * (0.5 + 0.5 * np.sin(2 * np.pi * (30 + 60 * tt) * tt)) * 0.4 + np.sin(2 * np.pi * np.cumsum(2000 - 1600 * tt / tt[-1]) / SR) * 0.08
add(rw, 2.9)
# --- music: dark synth pulse + hijaz oud plucks (3.6 -> 30.3), stinger at 35 ---
def note(m): return 440 * 2 ** ((m - 69) / 12)
def pluck(f, dur=1.2, gain=0.2):
    n = int(dur * SR); p = int(SR / f); buf = rng.uniform(-1, 1, p); out = np.zeros(n)
    for i in range(n): out[i] = buf[i % p]; buf[i % p] = 0.5 * (buf[i % p] + buf[(i + 1) % p]) * 0.996
    return lp(out, 3500) * gain * env(n, 0.002, dur / 2.5)
mus = np.zeros(N)
def madd(x, at):
    i = int(at * SR); x = x[: N - i]; mus[i:i + len(x)] += x
bpm = 96; beat = 60 / bpm
for k in range(int((BOOM - 3.6) / beat)):
    at = 3.6 + k * beat; nn = int(0.3 * SR); tt = np.arange(nn) / SR
    madd(np.sin(2 * np.pi * (52 - 30 * tt) * tt) * env(nn, 0.002, 0.12) * (0.5 if k % 4 == 0 else 0.25), at)  # kick
    if k % 2 == 1: madd(bp(rng.standard_normal(nn), 4000, 10000) * env(nn, 0.001, 0.03) * 0.12, at)  # hat
    bassn = [38, 38, 39, 38, 42, 38, 39, 36][(k // 4) % 8]
    madd(signal.sawtooth(2 * np.pi * note(bassn) * tt * 1.0) * env(nn, 0.005, 0.18) * 0.12, at)
mel = [62, 63, 66, 67, 66, 63, 62, 69, 70, 69, 67, 66]
for k, m in enumerate(mel):
    madd(pluck(note(m), 1.2, 0.16), 4.0 + k * beat * 2)
pad_n = int((BOOM - 3.6) * SR); tt = np.arange(pad_n) / SR
pad = sum(signal.sawtooth(2 * np.pi * note(m) * (1 + d / 100) * tt) for m in (50, 57, 62) for d in (-0.1, 0.1))
madd(lp(pad, 700) / 6 * 0.18 * np.clip(tt / 2, 0, 1), 3.6)
duck = np.ones(N)
for row in tl:
    if row['spk'] != 'anno': duck[int(row['at'] * SR):int(row['end'] * SR)] = 0.55
duck = np.convolve(duck, np.ones(4800) / 4800, 'same')
mus *= duck * (t < BOOM)
nn = int(3.0 * SR); tt = np.arange(nn) / SR
sting = sum(np.sin(2 * np.pi * note(m) * tt) for m in (38, 50, 53, 57)) * env(nn, 0.02, 1.2) * 0.25
madd(sting + np.sin(2 * np.pi * (55 - 20 * tt) * tt) * env(nn, 0.001, 0.6) * 0.6, 35.0)
for k, m in enumerate((62, 63, 66, 69)): madd(pluck(note(m), 1.0, 0.2), 35.1 + k * 0.1)
L += mus; R += np.roll(mus, 300)
L += dlg * 1.6; R += dlg * 1.6
mix = np.stack([L, R], 1)
ir_n = int(0.6 * SR); ir = lp(rng.standard_normal(ir_n) * np.exp(-np.arange(ir_n) / (0.12 * SR)), 3000) * 0.05
for c in range(2): mix[:, c] += signal.fftconvolve(mix[:, c], ir)[:N]
mix[: int(0.05 * SR)] *= np.linspace(0, 1, int(0.05 * SR))[:, None]
mix[-int(0.6 * SR):] *= np.linspace(1, 0, int(0.6 * SR))[:, None]
mix /= np.abs(mix).max() / 0.9
sf.write(f'{A}/mix.wav', mix.astype(np.float32), SR)
json.dump(tl, open(f'{OUTJ}/timeline.json', 'w'), ensure_ascii=False, indent=1)
json.dump(mouth, open(f'{OUTJ}/mouth.json', 'w'))
print('ok', len(tl), 'lines; last ends', tl[-1]['end'])
