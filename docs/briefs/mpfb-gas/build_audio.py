"""«البوتاجاز النووي» (MPFB cast, ~60 s, no cold open): voices from incoming/gas-batch (map.json from tools/map_takes.py),
action beats between lines, synthesised SFX + music bed. Writes mix.wav and data.json."""
import json, wave, numpy as np, subprocess
R = '/home/user/OpenMontage/'; SR = 48000
MAP = json.load(open(R + 'incoming/gas-batch/map.json'))
def load(path):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-ar', str(SR), '-ac', '1', '-f', 'f32le', '-'], capture_output=True).stdout
    return np.frombuffer(raw, np.float32).astype(np.float64)
TAKES = {tk: load(R + f'incoming/gas-batch/{tk}.wav') for tk in sorted({m['take'] for m in MAP})}
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
def squeeze(x, maxgap=0.22):
    v = voiced(x); out = []; last = 0.0
    for a, b in v:
        if out: out.append(np.zeros(int(min(maxgap, a - last) * SR)))
        out.append(x[int(a * SR):int(b * SR)]); last = b
    return np.concatenate(out) if out else x
def find(s, words):
    for i, m in enumerate(MAP):
        if m['s'] == s and all(w in m['ar'] for w in words): return i
    raise SystemExit(f'line not found: {s} {words}')
def clip(i):
    m = MAP[i]; x = TAKES[m['take']][int(max(0, m['start'] - 0.03) * SR):int((m['end'] + 0.05) * SR)]
    x = squeeze(x); return x / (np.sqrt(np.mean(x[np.abs(x) > 0.01] ** 2)) + 1e-9) * (0.13 if m['s'] != 'anno' else 0.15)
# (key, speaker, words to find, gap before, English)
ORDER = [('L1', 'mom', ['الأنبوبة خلصت'], 0.5, "Ibrahim! The gas cylinder ran out... and the molokhia is on the stove!"),
         ('L2', 'dad', ['البوتاجاز النووي'], 0.5, "No problem... presenting: the Nuclear Stove 3000!"),
         ('L3', 'son', ['السشوار', 'المكوة'], 0.3, "That's the hair dryer... the iron... and Grandma's heater!"),
         ('L4', 'dad', ['حرارة'], 0.25, "Dryer heat, plus iron heat, plus heater heat... equals fire."),
         ('L5', 'son', ['الناصية'], 0.3, "Dad... a gas cylinder costs sixty pounds at the corner."),
         ('L6', 'dad', ['الفلوس'], 0.25, "Money isn't everything, Hamada... science comes first."),
         ('L7', 'mom', ['النور هيقطع'], 0.3, "Man... the power will go out!"),
         ('L8', 'dad', ['اطمني'], 0.25, "Relax, Om Hamada... I've got it covered. Switch it on, Hamada."),
         ('L9', 'son', ['بيطلّع نار'], 3.0, "Dad! The hair dryer is shooting fire!"),
         ('L10', 'mom', ['السقف'], 1.6, "The molokhia... is stuck to the ceiling!"),
         ('L11', 'son', ['العمارة كلها'], 1.5, "Dad... the power's out in the whole building!"),
         ('L12', 'samir', ['الأسانسير'], 0.5, "Ibrahim! I'm stuck in the elevator... again!"),
         ('L13', 'dad', ['الكشكول'], 0.5, "Excellent... write in the notebook: the stove works... the building doesn't."),
         ('anno', 'anno', ['Gas'], 0.5, "")]
data = {'lines': [], 'mk': {}}; parts = []; t = 0.0
for key, s, words, gap, en in ORDER:
    i = find(s, words); x = clip(i); t += gap
    v = voiced(x); nf = int(len(x) / SR * 30) + 1
    env = [float(np.sqrt(np.mean(x[int(k / 30 * SR):int((k + 1) / 30 * SR)] ** 2))) if int(k / 30 * SR) < len(x) else 0.0 for k in range(nf)]
    mx = max(env) or 1.0
    L = {'key': key, 's': s, 't0': round(t, 3), 't1': round(t + len(x) / SR, 3), 'ar': MAP[i]['ar'], 'en': en,
         'vox': [[round(t + a, 3), round(t + b, 3)] for a, b in v], 'env': [round(e / mx, 3) for e in env]}
    data['lines'].append(L); data['mk'][key] = [L['t0'], L['t1']]; parts.append((t, x)); t += len(x) / SR
mk = data['mk']
mk['hook'] = [0.0, 2.8]; mk['switch'] = round(mk['L8'][1] + 0.3, 3); mk['boom'] = round(mk['L9'][1] + 0.35, 3)
mk['dark'] = round(mk['L10'][1] + 0.5, 3); mk['end'] = round(mk['anno'][0] + 1.4, 3)
DUR = round(max(t + 0.8, mk['end'] + 5.4), 2); data['dur'] = DUR
n = int(DUR * SR); tt = np.arange(n) / SR; mix = np.zeros(n); rng = np.random.default_rng(6)
for t0, x in parts: mix[int(t0 * SR):int(t0 * SR) + len(x)] += x
def put(t0, y, g=1.0):
    a = int(t0 * SR); b = min(n, a + len(y));
    if b > a: mix[a:b] += y[:b - a] * g
def noise(d, lp=40): y = np.convolve(rng.standard_normal(int(d * SR)), np.ones(lp) / lp, 'same'); return y / (np.abs(y).max() + 1e-9)
def tone(f, d, dec=6): k = np.arange(int(d * SR)) / SR; return np.sin(2 * np.pi * f * k) * np.exp(-k * dec)
# switches: 3 clicks, each appliance starts (dryer whine, iron hiss, heater hum), rising until the boom
sw = mk['switch']
for i in range(3): put(sw + i * 0.8, noise(0.05, 2) * np.exp(-np.arange(int(0.05 * SR)) / SR * 80), 0.25)
b = mk['boom']
def ramp(a, f, g, lp):
    d = b - a; k = np.arange(int(d * SR)) / SR; y = noise(d, lp) * 0.6 + 0.4 * np.sin(2 * np.pi * f * k * (1 + k / d * 0.6))
    put(a, y * np.clip(k / 0.2, 0, 1) * (0.6 + 0.4 * k / d), g)
ramp(sw, 520, 0.06, 6); ramp(sw + 0.8, 90, 0.05, 30); ramp(sw + 1.6, 60, 0.05, 60)
ramp(mk['L9'][0] - 0.2, 180, 0.07, 12)   # roaring fire
# BOOM + splat + debris
k = np.arange(int(1.2 * SR)) / SR; put(b, (noise(1.2, 8) * np.exp(-k * 4) + np.sin(2 * np.pi * 45 * k) * np.exp(-k * 5)), 0.6)
put(b + 0.55, noise(0.3, 3) * np.exp(-np.arange(int(0.3 * SR)) / SR * 15), 0.25)
for i in range(5): put(mk['L10'][0] + 0.4 + i * 0.6, tone(900 - i * 60, 0.15, 25), 0.03)   # molokhia drips
# power down: hum dies with a falling tone, then silence + crickets, elevator alarm bell under Abu Samir
dk = mk['dark']; k = np.arange(int(0.8 * SR)) / SR; put(dk, np.sin(2 * np.pi * (120 - 100 * k) * k) * np.exp(-k * 3), 0.25)
for i in range(int((DUR - dk) * 2)):
    put(dk + 0.6 + i * 0.5, tone(4200, 0.04, 60) * (i % 3 != 0), 0.012)
s0 = mk['L12'][0] - 0.4
for i in range(8): put(s0 + i * 0.16, np.sign(np.sin(2 * np.pi * 900 * np.arange(int(0.12 * SR)) / SR)), 0.015)
# hook stinger + end card blips
put(0.05, tone(660, 0.5, 7) + tone(990, 0.5, 9), 0.1)
for i in range(3): put(mk['end'] + 0.6 + i * 0.5, np.sign(tone(440 + 220 * i, 0.12, 20)), 0.05)
# music: bouncy bass/marimba until the blackout, a sparse low loop after
bpm = 124; beat = 60 / bpm; notes = [41, 41, 48, 41, 44, 44, 39, 46]
s = 0.0
while s < DUR - 0.3:
    for j, m in enumerate(notes):
        tb = s + j * beat / 2
        if tb >= DUR - 0.3 or (b - 0.1 < tb < dk + 0.8): continue
        dark = tb > dk; f = 440 * 2 ** ((m - 69 - (12 if dark else 0)) / 12)
        if dark and j % 2: continue
        put(tb, tone(f, 0.22, 9) + 0.4 * tone(2 * f, 0.22, 9), 0.035)
        if j % 2 == 0 and not dark: put(tb, tone(f * 4, 0.12, 18), 0.02)
    s += beat * 4
mix += rng.standard_normal(n) * 0.002
mix *= np.clip((DUR - tt) / 0.8, 0, 1)
mix = mix / max(1e-6, np.abs(mix).max()) * 0.89
with wave.open('mix.wav', 'wb') as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((mix * 32767).astype(np.int16).tobytes())
json.dump(data, open('data.json', 'w'), ensure_ascii=False)
print('DUR', DUR, mk)
