"""«الغسالة النووية» (MPFB cast): voices from the laptop takes (incoming/washer-batch, mapped by tools/map_takes.py), the episode order
(cold open -> REWIND -> hook -> story -> the cold-open line again -> announcer -> end card), synthesised SFX + a small music bed.
Writes mix.wav and data.json (line times, voiced segments, 30 fps envelopes, markers)."""
import json, wave, numpy as np, subprocess
R = '/home/user/OpenMontage/'; SR = 48000
MAP = json.load(open(R + 'incoming/washer-batch/map.json'))
def load(path):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-ar', str(SR), '-ac', '1', '-f', 'f32le', '-'], capture_output=True).stdout
    return np.frombuffer(raw, np.float32).astype(np.float64)
TAKES = {tk: load(R + f'incoming/washer-batch/{tk}.wav') for tk in sorted({m['take'] for m in MAP})}
def voiced(x, minsil=0.09):
    hop = SR // 100; e = np.array([np.sqrt(np.mean(x[i:i + hop] ** 2) + 1e-12) for i in range(0, len(x) - hop, hop)])
    db = 20 * np.log10(e); sp = db > db.max() - 36; segs = []; i = 0; n = len(sp)
    while i < n:
        if sp[i]:
            j = i
            while j < n:
                if not sp[j]:
                    k = j
                    while k < n and not sp[k]: k += 1
                    if k - j >= int(minsil * 100) or k == n: break
                    j = k
                else: j += 1
            if j - i > 6: segs.append((i / 100, j / 100))
            i = j
        else: i += 1
    return segs
def squeeze(x, maxgap=0.2):
    v = voiced(x); out = []; last = 0.0
    for a, b in v:
        if out: out.append(np.zeros(int(min(maxgap, a - last) * SR)))
        out.append(x[int(a * SR):int(b * SR)]); last = b
    return np.concatenate(out) if out else x
def clip(i):
    m = MAP[i]; x = TAKES[m['take']][int(max(0, m['start'] - 0.03) * SR):int((m['end'] + 0.05) * SR)]
    x = squeeze(x); return x / (np.sqrt(np.mean(x[np.abs(x) > 0.01] ** 2)) + 1e-9) * (0.13 if m['s'] != 'anno' else 0.15)
# map order (recording order): 0 dad, 1 son, 2 dad, 3 son, 4 dad, 5 mom (complaint), 6 mom (stairs), 7 anno
EN = {0: "No problem... presenting: the Nuclear Washer 3000! I fitted it with the tuk-tuk engine.", 1: "Dad... why is it jumping like that?",
      2: "It's warming up... let it get comfortable.", 3: "Dad! It's walking! It's leaving the bathroom!",
      4: "Excellent... write in the notebook: spin, too much... and the washer goes for walks.",
      5: "The washer won't spin, Ibrahim... the clothes come out soaking!", 6: "Ibrahim! The washer went down the stairs by itself!", 7: ""}
ORDER = [('cold', 6, 0.15), ('L1', 5, None), ('L2', 0, 0.25), ('L3', 1, 0.22), ('L4', 2, 0.2), ('L5', 3, 0.22), ('L6', 4, 0.2), ('L7', 6, 0.35), ('anno', 7, 0.3)]
data = {'lines': [], 'mk': {}}; parts = []; t = 0.0
for key, i, gap in ORDER:
    x = clip(i)
    if key == 'L1':   # after the cold open: REWIND (0.9 s), then the hook card, the first line starts 0.9 s into the hook
        data['mk']['rw'] = [round(t + 0.15, 3), round(t + 1.05, 3)]; data['mk']['hook'] = [round(t + 1.05, 3), round(t + 3.55, 3)]; t += 1.95
    else: t += gap
    v = voiced(x); env = [float(np.sqrt(np.mean(x[int(k / 30 * SR):int((k + 1) / 30 * SR)] ** 2))) if int(k / 30 * SR) < len(x) else 0.0 for k in range(int(len(x) / SR * 30) + 1)]
    mx = max(env) or 1.0
    L = {'key': key, 's': MAP[i]['s'], 't0': round(t, 3), 't1': round(t + len(x) / SR, 3), 'ar': MAP[i]['ar'], 'en': EN[i],
         'vox': [[round(t + a, 3), round(t + b, 3)] for a, b in v], 'env': [round(e / mx, 3) for e in env]}
    data['lines'].append(L); data['mk'][key] = [L['t0'], L['t1']]; parts.append((t, x)); t += len(x) / SR
data['mk']['end'] = round(data['mk']['anno'][0] + 1.4, 3)
DUR = round(max(t + 0.8, data['mk']['end'] + 5.4), 2); data['dur'] = DUR
mk = data['mk']; n = int(DUR * SR); tt = np.arange(n) / SR; mix = np.zeros(n); rng = np.random.default_rng(5)
for t0, x in parts: mix[int(t0 * SR):int(t0 * SR) + len(x)] += x
def put(t0, y, g=1.0):
    a = int(t0 * SR); b = min(n, a + len(y)); mix[a:b] += y[:b - a] * g
def thump(f=70, d=0.18):
    k = np.arange(int(d * SR)) / SR; return np.sin(2 * np.pi * f * k * (1 - k)) * np.exp(-k * 22) + rng.standard_normal(len(k)) * np.exp(-k * 60) * 0.3
def noise(d, lp=40): y = np.convolve(rng.standard_normal(int(d * SR)), np.ones(lp) / lp, 'same'); return y / (np.abs(y).max() + 1e-9)
# tuk-tuk 2-stroke engine (putt-putt) from the reveal until the machine leaves; quieter far away
def engine(a, b, g):
    k = np.arange(int((b - a) * SR)) / SR; pulse = (np.sin(2 * np.pi * 23 * k) > 0.6).astype(float)
    y = noise(b - a, 25) * (0.4 + pulse) + 0.3 * np.sign(np.sin(2 * np.pi * 46 * k)) * 0.15
    y *= np.clip(k / 0.25, 0, 1) * np.clip((b - a - k) / 0.3, 0, 1); put(a, y, g)
engine(mk['L2'][0] - 0.3, mk['L6'][1] + 0.2, 0.05)
engine(0.0, mk['cold'][1] + 0.1, 0.04)
# hops: in the bathroom (L3-L5) and down the stairs (cold open, and the end)
for a, b, step in ((mk['L3'][0], mk['L5'][1], 0.36), (0.1, mk['cold'][1], 0.33), (mk['L7'][0], mk['L7'][0] + 1.4, 0.33)):
    s = a
    while s < b: put(s, thump(60 + rng.random() * 30), 0.22); s += step
put(mk['L7'][0] + 1.45, noise(0.5, 6) * np.exp(-np.arange(int(0.5 * SR)) / SR * 6), 0.35)     # crash at the bottom of the stairs
put(mk['L1'][0] - 0.2, noise(0.6, 12) * np.exp(-np.arange(int(0.6 * SR)) / SR * 5), 0.06)     # dripping clothes splash
# REWIND tape whoosh + hook stinger + end card blips
k = np.arange(int(0.9 * SR)) / SR; put(mk['rw'][0], np.sin(2 * np.pi * (900 - 700 * k) * k) * 0.15 + noise(0.9, 4) * 0.1, 0.8)
k = np.arange(int(0.5 * SR)) / SR; put(mk['hook'][0], np.sin(2 * np.pi * 660 * k) * np.exp(-k * 7) + np.sin(2 * np.pi * 990 * k) * np.exp(-k * 9), 0.12)
for i in range(3):
    k = np.arange(int(0.12 * SR)) / SR; put(mk['end'] + 0.6 + i * 0.5, np.sign(np.sin(2 * np.pi * (440 + 220 * i) * k)) * np.exp(-k * 20), 0.05)
# music bed: a light bouncy bass + marimba loop under the story (not under the cold open), out at the end
bpm = 128; beat = 60 / bpm; notes = [43, 43, 50, 43, 46, 46, 41, 48]
s = mk['hook'][0]
while s < DUR - 0.3:
    for j, m in enumerate(notes):
        tb = s + j * beat / 2
        if tb >= DUR - 0.3: break
        f = 440 * 2 ** ((m - 69) / 12); k = np.arange(int(0.22 * SR)) / SR
        put(tb, (np.sin(2 * np.pi * f * k) + 0.4 * np.sin(4 * np.pi * f * k)) * np.exp(-k * 9), 0.035)
        if j % 2 == 0: put(tb, np.sin(2 * np.pi * f * 4 * k) * np.exp(-k * 18), 0.02)
    s += beat * 4
mix += rng.standard_normal(n) * 0.002
mix *= np.clip((DUR - tt) / 0.8, 0, 1)
mix = mix / max(1e-6, np.abs(mix).max()) * 0.89
with wave.open('mix.wav', 'wb') as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((mix * 32767).astype(np.int16).tobytes())
json.dump(data, open('data.json', 'w'), ensure_ascii=False)
print('DUR', DUR, {k: v for k, v in mk.items()})
