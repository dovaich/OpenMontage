# Dialogue + SFX + music for the 30 s El-Alamy tuk-tuk AI test; writes mix.wav, timeline.json
import json
import numpy as np
import soundfile as sf
from scipy import signal
A = '/home/user/OpenMontage/projects/alamy-tuktuk-ai/assets/audio'
OUTJ = '/home/user/OpenMontage/projects/alamy-tuktuk-ai/src'
SR = 48000; DUR = 30.0; N = int(SR * DUR); FPS = 24
rng = np.random.default_rng(11)
LINES = [
    ('c1', 'alamy',  'r1', 18.61, 20.70, 0.30,  'معلش يا بستم... هو أذكى منك.'),
    ('l1', 'bestem', 'r1', 0.20, 4.22, 3.30,    'يا عالمييي! الحق! التوك توك بيتكلم!'),
    ('l2', 'alamy',  'r1', 4.65, 7.48, 7.45,    'طبيعي يا بستم... أنا ركّبتله ذكاء اصطناعي.'),
    ('l3', 'bestem', 'r1', 7.91, 9.75, 10.45,   'وهو بيقول إيه بالظبط؟!'),
    ('l4', 'alamy',  'r1', 10.23, 13.38, 12.50, 'بيقول عايز إجازة يوم الجمعة... وزيادة في المرتب.'),
    ('l5', 'bestem', 'r1', 14.36, 17.88, 15.90, 'توك توك وعايز مرتب؟! ده أنا ماخدتش زيادة من سنتين!'),
    ('l6', 'alamy',  'r1', 18.61, 20.70, 19.65, 'معلش يا بستم... هو أذكى منك.'),
    ('a1', 'anno',   'r2', 0.20, 7.40, 22.20,   'MISSION COMPLETE'),
]
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

# --- ambience: garage hum + far street ---
brown = np.cumsum(rng.standard_normal(N)); brown = hp(brown, 20); brown /= np.abs(brown).max()
amb = np.sin(2 * np.pi * 100 * t) * 0.01 + np.sin(2 * np.pi * 50 * t) * 0.018 + lp(brown, 160) * 0.3 + bp(rng.standard_normal(N), 3000, 6000) * 0.005
L += amb; R += np.roll(amb, 700)
# running footsteps under Bestem's entrance
def step(g):
    n = int(0.15 * SR); return (bp(rng.standard_normal(n), 900, 5000) * env(n, 0.0008, 0.015) + lp(rng.standard_normal(n), 220) * env(n, 0.002, 0.05) * 2.2) * g
for k in range(9): add(step(0.4 + 0.04 * k), 3.0 + k * 0.33, 1, 0.15 if k % 2 else -0.15)
# tuk-tuk: idle putter whenever it is on screen + robot chirps from its screen
fire = np.zeros(N); ph = np.cumsum((13 + np.sin(t * 2)) / SR)
for p in np.where(np.diff(np.floor(ph), prepend=0) > 0)[0]:
    m = int(0.05 * SR)
    if p + m < N: fire[p:p + m] += lp(rng.standard_normal(m), 400) * env(m, 0.001, 0.02)
tk = ((t > 8.85) & (t < 10.35)) | (t > 21.9)
tkm = np.convolve(tk.astype(float), np.ones(2400) / 2400, 'same')
L += lp(fire, 900) * 0.12 * (0.3 + tkm); R += lp(fire, 900) * 0.14 * (0.3 + tkm)
for at, fs in ((9.0, (900, 1400, 1100)), (9.5, (1300, 800)), (26.5, (700, 1000, 1500, 2000))):
    for j, f in enumerate(fs):
        n = int(0.08 * SR); tt = np.arange(n) / SR; add(signal.square(2 * np.pi * f * tt) * env(n, 0.002, 0.04) * 0.05, at + j * 0.09)
# phone taps during L4
for k in range(6): add(bp(rng.standard_normal(int(0.02 * SR)), 2500, 8000) * env(int(0.02 * SR), 0.0005, 0.004) * 0.3, 12.3 + k * 0.17)
# rewind 2.45-3.1
n = int(0.65 * SR); tt = np.arange(n) / SR
add(bp(rng.standard_normal(n), 800, 6000) * (0.5 + 0.5 * np.sin(2 * np.pi * (30 + 60 * tt) * tt)) * 0.4 + np.sin(2 * np.pi * np.cumsum(2000 - 1600 * tt / tt[-1]) / SR) * 0.08, 2.45)
BOOM = 22.0
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
for k in range(int((BOOM - 3.1) / beat)):
    at = 3.1 + k * beat; nn = int(0.3 * SR); tt = np.arange(nn) / SR
    madd(np.sin(2 * np.pi * (52 - 30 * tt) * tt) * env(nn, 0.002, 0.12) * (0.5 if k % 4 == 0 else 0.25), at)  # kick
    if k % 2 == 1: madd(bp(rng.standard_normal(nn), 4000, 10000) * env(nn, 0.001, 0.03) * 0.12, at)  # hat
    bassn = [38, 38, 39, 38, 42, 38, 39, 36][(k // 4) % 8]
    madd(signal.sawtooth(2 * np.pi * note(bassn) * tt * 1.0) * env(nn, 0.005, 0.18) * 0.12, at)
mel = [62, 63, 66, 67, 66, 63, 62, 69, 70, 69, 67, 66]
for k, m in enumerate(mel):
    madd(pluck(note(m), 1.2, 0.16), 3.4 + k * beat * 1.5)
pad_n = int((BOOM - 3.1) * SR); tt = np.arange(pad_n) / SR
pad = sum(signal.sawtooth(2 * np.pi * note(m) * (1 + d / 100) * tt) for m in (50, 57, 62) for d in (-0.1, 0.1))
madd(lp(pad, 700) / 6 * 0.18 * np.clip(tt / 2, 0, 1), 3.1)
duck = np.ones(N)
for row in tl:
    if row['spk'] != 'anno': duck[int(row['at'] * SR):int(row['end'] * SR)] = 0.55
duck = np.convolve(duck, np.ones(4800) / 4800, 'same')
mus *= duck * (t < BOOM)
nn = int(3.0 * SR); tt = np.arange(nn) / SR
sting = sum(np.sin(2 * np.pi * note(m) * tt) for m in (38, 50, 54, 57, 62)) * env(nn, 0.02, 1.2) * 0.25
madd(sting + np.sin(2 * np.pi * (55 - 20 * tt) * tt) * env(nn, 0.001, 0.6) * 0.6, 22.05)
for k, m in enumerate((62, 66, 69, 74)): madd(pluck(note(m), 1.0, 0.2), 22.1 + k * 0.1)
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
print('ok', len(tl), 'lines; last ends', tl[-1]['end'])
