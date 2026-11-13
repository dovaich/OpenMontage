# Fit our autopilot voice line onto the timing of the speech Flow generated in a clip, so the lips match.
# usage: python align_voice.py <flow_clip.mp4> <our_line.wav> <out.wav> [max_stretch]
# 1) find the voiced span in Flow's audio and in our line
# 2) DTW on MFCCs between the two utterances -> a warp path
# 3) cut our line into ~0.25 s pieces and time-stretch each piece so it lands where Flow's matching sound is
import sys, subprocess, tempfile, os
import numpy as np, librosa, soundfile as sf

clip, ours, out = sys.argv[1], sys.argv[2], sys.argv[3]
MAXS = float(sys.argv[4]) if len(sys.argv) > 4 else 1.35
WIN = (float(sys.argv[5]), float(sys.argv[6])) if len(sys.argv) > 6 else None  # restrict Flow's speech to this window (s)
SR = 16000
tmp = tempfile.mktemp(suffix='.wav')
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', clip, '-vn', '-ac', '1', '-ar', str(SR), tmp], check=True)
f, _ = librosa.load(tmp, sr=SR); os.remove(tmp)
o, osr = librosa.load(ours, sr=None); o16 = librosa.resample(o, orig_sr=osr, target_sr=SR)
clip_dur = len(f) / SR

def span(x, top_db=32):
    iv = librosa.effects.split(x, top_db=top_db, frame_length=1024, hop_length=160)
    return (iv[0][0], iv[-1][1]) if len(iv) else (0, len(x))
if WIN:
    a0, b0 = int(WIN[0] * SR), int(WIN[1] * SR); fs, fe = span(f[a0:b0]); fs += a0; fe += a0
else:
    fs, fe = span(f)
os_, oe = span(o16)
F, O = f[fs:fe], o16[os_:oe]
hop = 160
mf = librosa.feature.mfcc(y=F, sr=SR, n_mfcc=20, hop_length=hop); mo = librosa.feature.mfcc(y=O, sr=SR, n_mfcc=20, hop_length=hop)
mf = (mf - mf.mean(1, keepdims=True)) / (mf.std(1, keepdims=True) + 1e-6); mo = (mo - mo.mean(1, keepdims=True)) / (mo.std(1, keepdims=True) + 1e-6)
_, wp = librosa.sequence.dtw(X=mo, Y=mf, metric='cosine', global_constraints=True, band_rad=0.25)
wp = wp[::-1]  # (our_frame, flow_frame) ascending
# piecewise map: our time -> flow time, sampled every ~0.25 s of our audio
step = int(0.25 * SR / hop)
ofr = np.arange(0, mo.shape[1], step).tolist() + [mo.shape[1] - 1]
def flow_at(of):
    idx = np.searchsorted(wp[:, 0], of); idx = min(idx, len(wp) - 1); return wp[idx, 1]
ffr = [flow_at(x) for x in ofr]
ffr = np.maximum.accumulate(np.array(ffr))
pieces = []
for i in range(len(ofr) - 1):
    a, b = ofr[i] * hop, ofr[i + 1] * hop
    seg = O[a:b] if b > a else O[a:a + hop]
    want = max(1, (ffr[i + 1] - ffr[i]) * hop)
    rate = len(seg) / want
    rate = float(np.clip(rate, 1 / MAXS, MAXS))
    pieces.append(librosa.effects.time_stretch(seg, rate=rate) if abs(rate - 1) > 0.03 and len(seg) > 2048 else seg)
warped16 = np.concatenate(pieces)
# render at the original sample rate: apply the same overall stretch to the full-quality line
total_rate = len(O) / max(1, len(warped16))
O_hi = o[int(os_ * osr / SR):int(oe * osr / SR)]
# piecewise at full rate using the same boundaries
pieces_hi = []
for i in range(len(ofr) - 1):
    a, b = int(ofr[i] * hop * osr / SR), int(ofr[i + 1] * hop * osr / SR)
    seg = O_hi[a:b] if b > a else O_hi[a:a + int(hop * osr / SR)]
    want = max(1, (ffr[i + 1] - ffr[i]) * hop * osr / SR)
    rate = float(np.clip(len(seg) / want, 1 / MAXS, MAXS))
    pieces_hi.append(librosa.effects.time_stretch(seg, rate=rate) if abs(rate - 1) > 0.03 and len(seg) > 4096 else seg)
W = np.concatenate(pieces_hi)
lead = int(fs / SR * osr)
res = np.zeros(int(clip_dur * osr) + osr); res[lead:lead + len(W)] = W[: len(res) - lead]
res = res[: int(clip_dur * osr)]
sf.write(out, res.astype(np.float32), osr)
print(f'ok flow speech {fs/SR:.2f}-{fe/SR:.2f}s ({(fe-fs)/SR:.2f}s) | ours {(oe-os_)/SR:.2f}s -> {len(W)/osr:.2f}s placed at {fs/SR:.2f}s')
