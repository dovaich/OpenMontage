# Fit our autopilot voice line onto the timing of the speech Flow generated in a clip, so the lips match — without echo.
# usage: python align_voice.py <flow_clip.mp4> <our_line.wav> <out.wav> [max_stretch] [win_start win_end]
# 1) voiced span of Flow's speech (inside the window) and of our line
# 2) DTW on MFCCs (Flow vs ours) -> where each of our sounds should land
# 3) split OUR line into phrases at its natural pauses; stretch each phrase with ffmpeg atempo (WSOLA, clean for speech)
#    to the duration DTW maps it to, and place it at the mapped start. Small differences (<4%) are left unstretched.
import sys, subprocess, tempfile, os
import numpy as np, librosa, soundfile as sf

clip, ours, out = sys.argv[1], sys.argv[2], sys.argv[3]
MAXS = float(sys.argv[4]) if len(sys.argv) > 4 else 1.35
WIN = (float(sys.argv[5]), float(sys.argv[6])) if len(sys.argv) > 6 else None
SR = 16000; hop = 160
tmp = tempfile.mktemp(suffix='.wav')
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', clip, '-vn', '-ac', '1', '-ar', str(SR), tmp], check=True)
f, _ = librosa.load(tmp, sr=SR); os.remove(tmp)
o, osr = sf.read(ours); o = o if o.ndim == 1 else o.mean(1)
o16 = librosa.resample(o.astype(np.float32), orig_sr=osr, target_sr=SR)
clip_dur = len(f) / SR

def span(x, top_db=32):
    iv = librosa.effects.split(x, top_db=top_db, frame_length=1024, hop_length=hop)
    return (iv[0][0], iv[-1][1]) if len(iv) else (0, len(x))
if WIN:
    a0, b0 = int(WIN[0] * SR), int(WIN[1] * SR); fs, fe = span(f[a0:b0]); fs += a0; fe += a0
else:
    fs, fe = span(f)
os_, oe = span(o16)
F, O = f[fs:fe], o16[os_:oe]
mf = librosa.feature.mfcc(y=F, sr=SR, n_mfcc=20, hop_length=hop); mo = librosa.feature.mfcc(y=O, sr=SR, n_mfcc=20, hop_length=hop)
mf = (mf - mf.mean(1, keepdims=True)) / (mf.std(1, keepdims=True) + 1e-6); mo = (mo - mo.mean(1, keepdims=True)) / (mo.std(1, keepdims=True) + 1e-6)
_, wp = librosa.sequence.dtw(X=mo, Y=mf, metric='cosine', global_constraints=True, band_rad=0.25)
wp = wp[::-1]
def flow_t(our_s):  # our time (s, from our speech start) -> flow time (s, from flow speech start)
    fr = our_s * SR / hop; i = min(np.searchsorted(wp[:, 0], fr), len(wp) - 1); return wp[i, 1] * hop / SR

# our phrases (split at pauses >= ~0.18 s)
iv = librosa.effects.split(O, top_db=30, frame_length=1024, hop_length=hop)
phr = []
for a, b in iv:
    if phr and (a - phr[-1][1]) < 0.18 * SR: phr[-1][1] = b
    else: phr.append([a, b])
# full-quality source, cut at the same places
k = osr / SR
Ohi = o[int(os_ * k):int(oe * k)]
res = np.zeros(int(clip_dur * osr) + osr, dtype=np.float32)
log = []
for a, b in phr:
    seg = Ohi[int(a * k):int(b * k)].astype(np.float32)
    t0, t1 = flow_t(a / SR), flow_t(b / SR)
    want = max(0.05, t1 - t0); have = len(seg) / osr
    rate = float(np.clip(have / want, 1 / MAXS, MAXS))
    if abs(rate - 1) > 0.04:
        i_, o_ = tempfile.mktemp(suffix='.wav'), tempfile.mktemp(suffix='.wav')
        sf.write(i_, seg, osr)
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', i_, '-af', f'atempo={rate:.4f}', o_], check=True)
        seg, _ = sf.read(o_); os.remove(i_); os.remove(o_)
    st = int((fs / SR + t0) * osr)
    end = min(len(res), st + len(seg)); res[st:end] += seg[: end - st]
    log.append(f'{have:.2f}->{len(seg)/osr:.2f}s@{fs/SR + t0:.2f}')
res = res[: int(clip_dur * osr)]
sf.write(out, res, osr)
print(f'ok flow speech {fs/SR:.2f}-{fe/SR:.2f}s | {len(phr)} phrases: ' + ', '.join(log))
