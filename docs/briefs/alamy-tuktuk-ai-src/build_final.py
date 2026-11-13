# Final cut on Flow clips: video edit + dialogue (our voices aligned to Flow lips) + announcer + music/sfx + text layer
import subprocess, json, os, numpy as np, soundfile as sf
from scipy import signal
P = '/home/user/OpenMontage/projects/alamy-tuktuk-ai'
FL, LOC, AU = f'{P}/assets/video/flow', f'{P}/assets/video/local', f'{P}/assets/audio'
LN = json.load(open(f'{P}/src/flow_lines.json'))
SR = 48000
# (kind, clip path, in, out, line id or None, reverse)
EDIT = [
    ('cold',   f'{FL}/f6_alamy_line6.mp4', 0.00, 2.50, 'l6', False),
    ('rewind', f'{FL}/f6_alamy_line6.mp4', 0.00, 2.50, None, True),   # squeezed to 0.65 s
    ('line',   f'{FL}/f1_bestem_line1.mp4', 0.85, 5.75, 'l1', False),
    ('line',   f'{FL}/f2_alamy_line2.mp4', 0.45, 4.75, 'l2', False),
    ('insert', f'{LOC}/s2_tuktuk.mp4',     0.00, 1.30, None, False),
    ('line',   f'{FL}/f3_bestem_line3.mp4', 2.55, 4.85, 'l3', False),
    ('line',   f'{FL}/f4_alamy_line4.mp4', 1.25, 5.40, 'l4', False),
    ('line',   f'{FL}/f5_bestem_line5.mp4', 0.00, 4.85, 'l5', False),
    ('line',   f'{FL}/f6_alamy_line6.mp4', 0.00, 2.95, 'l6', False),
    ('end',    f'{FL}/f7_wide_end.mp4',    0.00, 6.40, None, False),
]
REW = 0.65
durs = [(REW if k == 'rewind' else b - a) for k, f, a, b, l, r in EDIT]
starts = np.concatenate([[0], np.cumsum(durs)])
TOTAL = float(starts[-1]); N = int(TOTAL * SR)
print('total', round(TOTAL, 2))

# ---------------- video ----------------
inputs, parts = [], []
for i, (k, f, a, b, l, rev) in enumerate(EDIT):
    inputs += ['-i', f]
    ch = f'[{i}:v]trim=start={a}:end={b},setpts=PTS-STARTPTS'
    if rev: ch += f',reverse,setpts=PTS*{REW / (b - a):.4f},hue=s=0.35,eq=contrast=1.2'
    ch += f',scale=720:1280:flags=lanczos,fps=24,setsar=1,trim=duration={durs[i]:.3f},setpts=PTS-STARTPTS[v{i}]'
    parts.append(ch)
n = len(EDIT)
fc = ';'.join(parts) + ';' + ''.join(f'[v{i}]' for i in range(n)) + f'concat=n={n}:v=1:a=0[base]'
fc += ';[base]eq=saturation=0.9:contrast=1.04,colorbalance=rs=0.02:bs=-0.02:rh=0.03:bh=-0.03,vignette=PI/5,noise=alls=5:allf=t[g]'

# ---------------- audio ----------------
rng = np.random.default_rng(5)
t = np.arange(N) / SR
L = np.zeros(N); R = np.zeros(N); dlg = np.zeros(N)
def lp(x, f_, o=2): b_, a_ = signal.butter(o, f_ / (SR / 2), 'low'); return signal.lfilter(b_, a_, x)
def hp(x, f_, o=2): b_, a_ = signal.butter(o, f_ / (SR / 2), 'high'); return signal.lfilter(b_, a_, x)
def bp(x, f1, f2, o=2): b_, a_ = signal.butter(o, [f1 / (SR / 2), f2 / (SR / 2)], 'band'); return signal.lfilter(b_, a_, x)
def env(n_, a_, d_): e = np.ones(n_); na = max(1, int(a_ * SR)); e[:na] = np.linspace(0, 1, na); return e * np.exp(-np.arange(n_) / (d_ * SR))
def add(x, at, g=1.0):
    i = int(at * SR)
    if i >= N: return
    x = x[: N - i]; L[i:i + len(x)] += x * g; R[i:i + len(x)] += x * g
def load(p):
    x, sr = sf.read(p); x = x if x.ndim == 1 else x.mean(1)
    return signal.resample_poly(x, SR, sr) if sr != SR else x
timeline = []
for i, (k, f, a, b, l, rev) in enumerate(EDIT):
    if not l: continue
    al = load(LN[l]['aligned']); seg = al[int(a * SR):int(b * SR)]
    j = int(starts[i] * SR); dlg[j:j + len(seg)] += seg[: N - j]
    v = np.abs(seg) > 0.02; idx = np.where(v)[0]
    if len(idx): timeline.append({'id': l + ('_cold' if k == 'cold' else ''), 'spk': LN[l]['spk'], 'at': round(starts[i] + idx[0] / SR, 3), 'end': round(starts[i] + idx[-1] / SR, 3), 'text': LN[l]['text']})
# loudness-match dialogue to a common level per segment
dlg = dlg / (np.percentile(np.abs(dlg[dlg != 0]), 99) + 1e-6) * 0.55
# announcer: tighten the pauses of r2 (Mission complete / Tuk-tuk: promoted / Bestem: replaced)
r2 = load(f'{AU}/r2.wav'); END0 = float(starts[-2])
for (a, b), off in zip([(0.20, 2.25), (2.55, 4.60), (5.00, 7.40)], [0.35, 2.25, 4.15]):
    s = r2[int(a * SR):int(b * SR)]; s = s / (np.abs(s).max() + 1e-6) * 0.5
    j = int((END0 + off) * SR); dlg[j:j + len(s)] += s[: N - j]
timeline.append({'id': 'a1', 'spk': 'anno', 'at': round(END0 + 0.35, 3), 'end': round(TOTAL, 3), 'text': 'MISSION COMPLETE'})
L += dlg * 1.0; R += dlg * 1.0
# ambience
brown = np.cumsum(rng.standard_normal(N)); brown = hp(brown, 20); brown /= np.abs(brown).max()
amb = np.sin(2 * np.pi * 100 * t) * 0.008 + np.sin(2 * np.pi * 50 * t) * 0.014 + lp(brown, 160) * 0.22 + bp(rng.standard_normal(N), 3000, 6000) * 0.004
L += amb; R += np.roll(amb, 600)
# rewind whoosh + tuk-tuk chirps on the insert
s_rew = float(starts[1]); n_ = int(REW * SR); tt = np.arange(n_) / SR
add(bp(rng.standard_normal(n_), 800, 6000) * (0.5 + 0.5 * np.sin(2 * np.pi * (30 + 60 * tt) * tt)) * 0.35 + np.sin(2 * np.pi * np.cumsum(2000 - 1600 * tt / tt[-1]) / SR) * 0.07, s_rew)
s_ins = float(starts[4])
for j_, fr in enumerate((900, 1400, 1100, 1700)):
    m = int(0.08 * SR); tt = np.arange(m) / SR; add(signal.square(2 * np.pi * fr * tt) * env(m, 0.002, 0.04) * 0.05, s_ins + 0.15 + j_ * 0.1)
# music: soft dark pulse + hijaz plucks, ducked under dialogue, major stinger on MISSION COMPLETE
def note(m): return 440 * 2 ** ((m - 69) / 12)
def pluck(fq, dur=1.1, g=0.15):
    n2 = int(dur * SR); p_ = int(SR / fq); buf = rng.uniform(-1, 1, p_); o_ = np.zeros(n2)
    for q in range(n2): o_[q] = buf[q % p_]; buf[q % p_] = 0.5 * (buf[q % p_] + buf[(q + 1) % p_]) * 0.996
    return lp(o_, 3500) * g * env(n2, 0.002, dur / 2.5)
mus = np.zeros(N); beat = 60 / 96
def madd(x, at):
    i = int(at * SR)
    if i < N: x = x[: N - i]; mus[i:i + len(x)] += x
t0m = s_rew + REW
for k_ in range(int((END0 - t0m) / beat)):
    at = t0m + k_ * beat; nn = int(0.3 * SR); tt = np.arange(nn) / SR
    madd(np.sin(2 * np.pi * (52 - 30 * tt) * tt) * env(nn, 0.002, 0.12) * (0.45 if k_ % 4 == 0 else 0.22), at)
    if k_ % 2: madd(bp(rng.standard_normal(nn), 4000, 10000) * env(nn, 0.001, 0.03) * 0.1, at)
    madd(signal.sawtooth(2 * np.pi * note([38, 38, 39, 38, 42, 38, 39, 36][(k_ // 4) % 8]) * tt) * env(nn, 0.005, 0.18) * 0.1, at)
for k_, m in enumerate([62, 63, 66, 67, 66, 63, 62, 69, 70, 69, 67, 66, 63, 62]): madd(pluck(note(m)), t0m + 0.3 + k_ * beat * 1.5)
duck = np.ones(N); duck[np.abs(lp(np.abs(dlg), 8)) > 0.01] = 0.45; duck = np.convolve(duck, np.ones(4800) / 4800, 'same')
mus *= duck * (t < END0)
nn = int(3.0 * SR); tt = np.arange(nn) / SR
madd((sum(np.sin(2 * np.pi * note(m) * tt) for m in (38, 50, 54, 57, 62)) * env(nn, 0.02, 1.2) * 0.22 + np.sin(2 * np.pi * (55 - 20 * tt) * tt) * env(nn, 0.001, 0.6) * 0.5), END0 + 0.05)
for k_, m in enumerate((62, 66, 69, 74)): madd(pluck(note(m), 1.0, 0.18), END0 + 0.1 + k_ * 0.1)
L += mus; R += np.roll(mus, 300)
mix = np.stack([L, R], 1)
mix[: int(0.04 * SR)] *= np.linspace(0, 1, int(0.04 * SR))[:, None]; mix[-int(0.5 * SR):] *= np.linspace(1, 0, int(0.5 * SR))[:, None]
mix /= np.abs(mix).max() / 0.9
sf.write(f'{AU}/flow_mix.wav', mix.astype(np.float32), SR)

# ---------------- text layer ----------------
meta = {'total': TOTAL, 'hookEnd': float(starts[1]), 'rew': [float(starts[1]), float(starts[2])], 'mission': END0 + 0.35}
json.dump({'meta': meta, 'lines': timeline}, open(f'{P}/src/flow_timeline.json', 'w'), ensure_ascii=False, indent=1)
OV = f'{P}/assets/overlay_flow'; subprocess.run(['rm', '-rf', OV])
subprocess.run(['node', f'{P}/src/overlay.cjs', OV, 'flow'], check=True, cwd=f'{P}/src')
fc += f';[g][{n}:v]overlay=0:0:shortest=1,scale=1080:1920:flags=lanczos[out]'
cmd = ['ffmpeg', '-v', 'error', '-y'] + inputs + ['-framerate', '24', '-i', f'{OV}/o%04d.png', '-i', f'{AU}/flow_mix.wav',
       '-filter_complex', fc, '-map', '[out]', '-map', f'{n + 1}:a', '-c:v', 'libx264', '-crf', '18', '-preset', 'medium', '-pix_fmt', 'yuv420p',
       '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', f'{P}/renders/final_flow.mp4']
subprocess.run(cmd, check=True)
print('ok', f'{P}/renders/final_flow.mp4')
