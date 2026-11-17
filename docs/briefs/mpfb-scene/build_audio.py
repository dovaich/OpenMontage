"""Audio for the MPFB 10-second test scene: three «المكنسة النووية» lines (laptop AI Studio takes), pauses squeezed,
plus a synthesised vacuum hum, a suck whoosh and room tone. Writes mix.wav + data.json (line times, voiced segments, 30 fps envelopes)."""
import json, wave, numpy as np, subprocess
R = '/home/user/OpenMontage/'
SR = 48000
def load(path):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-ar', str(SR), '-ac', '1', '-f', 'f32le', '-'], capture_output=True).stdout
    return np.frombuffer(raw, np.float32).astype(np.float64)
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
def squeeze(x, maxgap=0.16):
    v = voiced(x); out = []; last = 0.0
    for a, b in v:
        gap = a - last
        if out and gap > maxgap: out.append(np.zeros(int(maxgap * SR)))
        elif out: out.append(x[int(last * SR):int(a * SR)])
        out.append(x[int(a * SR):int(b * SR)]); last = b
    return np.concatenate(out)
take = {'r1': load(R + 'incoming/vacuum-batch/r1.wav'), 'r2': load(R + 'incoming/vacuum-batch/r2.wav')}
LINES = [('son', 'r1', 22.66, 25.63, 'بابا! دي بتشفط... بتشفطني أنااا!'),
         ('dad', 'r1', 26.20, 31.01, 'ممتاز... نكتب في الكشكول: الاختراع شغّال... بزيادة.'),
         ('mom', 'r2', [(0.03, 3.2), (4.66, 5.46)], None, 'إبراهيم! المكنسة شفطت الستارة... وحمادة!')]   # «والسجادة» cut for length
gaps = [0.2, 0.18, 0.2]
t = 0.0; parts = []; data = {'lines': []}
for (s, tk, a, b, ar), g in zip(LINES, gaps):
    if isinstance(a, list): x = np.concatenate([np.concatenate([take[tk][int(p * SR):int(q * SR)], np.zeros(int(0.12 * SR))]) for p, q in a])
    else: x = take[tk][int((a - 0.03) * SR):int((b + 0.05) * SR)]
    x = squeeze(x)
    x = x / (np.sqrt(np.mean(x[np.abs(x) > 0.01] ** 2)) + 1e-9) * 0.12
    t += g; v = voiced(x)
    env = [float(np.sqrt(np.mean(x[int(i / 30 * SR):int((i + 1) / 30 * SR)] ** 2))) for i in range(int(len(x) / SR * 30) + 1)]
    mx = max(env) or 1
    data['lines'].append({'s': s, 't0': round(t, 3), 't1': round(t + len(x) / SR, 3), 'ar': ar, 'vox': [[round(t + p, 3), round(t + q, 3)] for p, q in v],
                          'env': [round(e / mx, 3) for e in env]})
    parts.append((t, x)); t += len(x) / SR
DUR = round(t + 0.6, 2); data['dur'] = DUR
mix = np.zeros(int(DUR * SR))
for t0, x in parts: mix[int(t0 * SR):int(t0 * SR) + len(x)] += x
rng = np.random.default_rng(4); n = len(mix); tt = np.arange(n) / SR
# vacuum: rumbling filtered noise + motor whine, loud while Hamada is pulled, then dies down under Om Hamada
noise = rng.standard_normal(n); k = 60; lp = np.convolve(noise, np.ones(k) / k, 'same')
whine = 0.5 * np.sin(2 * np.pi * (180 + 25 * np.sin(tt * 3)) * tt) + 0.3 * np.sin(2 * np.pi * 360 * tt)
vac_env = np.clip((tt - 0.0) / 0.3, 0, 1) * np.where(tt < data['lines'][2]['t0'], 1.0, np.exp(-(tt - data['lines'][2]['t0']) * 1.5))
mix += (lp * 0.5 + whine * 0.02) * vac_env * 0.18
# whoosh when Hamada slides into the hose (end of his line)
w0 = data['lines'][0]['t1'] - 0.3; ws = (tt > w0) & (tt < w0 + 0.7)
mix[ws] += rng.standard_normal(ws.sum()) * np.hanning(ws.sum()) * 0.12
mix += rng.standard_normal(n) * 0.0025   # room tone
mix = mix / max(1e-6, np.abs(mix).max()) * 0.89
with wave.open('mix.wav', 'wb') as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((mix * 32767).astype(np.int16).tobytes())
data['suck_t'] = round(w0, 3)
json.dump(data, open('data.json', 'w'), ensure_ascii=False)
print('DUR', DUR, [(l['s'], l['t0'], l['t1']) for l in data['lines']])
