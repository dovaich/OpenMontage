"""Put a Google Flow clip at the start of an episode as the cold open, speaking with OUR voice (same AI Studio take), lips matched.

usage (after the episode is rendered: renders/final_vertical.mp4 exists, and its build/ server is running on its port):
  python3 docs/briefs/tools/coldopen_flow.py <project> <flow_clip.mp4> [--line L01] [--cut 3.4] [--port 8790]
    --line  the cold-open line id in artifacts/lines.json (default: the first line)
    --cut   where the engine's cold open ends in the episode (s); default = that line's end + 0.25 s
            (= the frame where the REWIND starts; check one still if unsure)
writes projects/<project>/renders/final_flow_coldopen.mp4

What it does:
 1. cuts our cold-open line out of assets/audio/dialogue.wav and fits it onto the speech Flow generated (align_voice.py:
    DTW on MFCCs, then each of our phrases is stretched with atempo onto Flow's timing; Flow's own audio is dropped)
 2. renders the episode's 2D layer only (dialogue box, hook) as transparent frames (HUD=1 render.cjs), time-mapped so the
    text types along with the aligned voice, and lays it over the Flow clip (scaled to 1080x1920, same CRT finish)
 3. joins: [Flow cold open] + [the episode from --cut on]

Flow brief for the clip (laptop, VIDEO BATCH): Frames to Video from a still of the cold-open shot (node render.cjs st 15 <t>, scaled
to 1080x1920), 9:16, 8 s, prompt with "static camera", the Arabic line, "his mouth clearly moving", "no music, no on-screen text".
"""
import argparse, json, os, subprocess, sys, tempfile
import numpy as np, soundfile as sf

ap = argparse.ArgumentParser()
ap.add_argument('project'); ap.add_argument('clip')
ap.add_argument('--line'); ap.add_argument('--cut', type=float); ap.add_argument('--port', type=int)
a = ap.parse_args()
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
P = f'{ROOT}/projects/{a.project}'; HERE = os.path.dirname(os.path.abspath(__file__))
def sh(*c, **k): return subprocess.run(c, check=True, **k)
def dur(f): return float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f], capture_output=True, text=True).stdout)

L = json.load(open(f'{P}/artifacts/lines.json'))['lines']
line = next(l for l in L if l['id'] == a.line) if a.line else L[0]
cut = a.cut if a.cut is not None else line['t1'] + 0.25
ep = f'{P}/renders/final_vertical.mp4'
if not os.path.exists(ep): sys.exit(f'render the episode first: {ep}')
tmp = tempfile.mkdtemp(prefix='coldopen_')

# 1. our line -> Flow timing
d, sr = sf.read(f'{P}/assets/audio/dialogue.wav'); d = d if d.ndim == 1 else d.mean(1)
ours = d[int(max(0, line['t0'] - 0.05) * sr):int((line['t1'] + 0.05) * sr)]
sf.write(f'{tmp}/ours.wav', ours, sr)
r = subprocess.run([sys.executable, f'{HERE}/align_voice.py', a.clip, f'{tmp}/ours.wav', f'{tmp}/aligned.wav'], capture_output=True, text=True)
print(r.stdout.strip() or r.stderr[-800:])
if r.returncode: sys.exit('align_voice failed')
al, asr = sf.read(f'{tmp}/aligned.wav')
env = np.abs(al); k = int(asr * 0.02); env = np.convolve(env, np.ones(k) / k, 'same'); on = np.where(env > env.max() * 0.06)[0]
v0, v1 = on[0] / asr, on[-1] / asr                       # our aligned speech inside the clip
c0, c1 = max(0.0, v0 - 0.5), min(dur(a.clip), v1 + 0.45)  # the part of the Flow clip we keep
D = c1 - c0
print(f'Flow cold open {c0:.2f}-{c1:.2f}s ({D:.2f}s; speech {v0:.2f}-{v1:.2f}), engine cold open replaced: 0-{cut:.2f}s')

# 2. HUD frames, time-mapped: clip time -> episode time (speech span -> line span)
fps = 30; n = int(round(D * fps))
def ep_t(ct):
    if ct < v0: return max(0.0, line['t0'] - (v0 - ct))
    if ct > v1: return min(cut - 0.01, line['t1'] + (ct - v1))
    return line['t0'] + (ct - v0) * (line['t1'] - line['t0']) / max(0.01, v1 - v0)
times = [round(ep_t(c0 + i / fps), 2) for i in range(n)]
uniq = sorted(set(times))
build = f'{P}/build'
port = a.port
if port is None:
    import re; port = int(re.search(r'127\.0\.0\.1:(\d+)', open(f'{build}/render.cjs').read()).group(1))
env_ = dict(os.environ, HUD='1')
sh('node', 'render.cjs', f'{tmp}/hud', '30', ','.join(f'{t:.2f}' for t in uniq), cwd=build, env=env_, stdout=subprocess.DEVNULL)
os.makedirs(f'{tmp}/seq', exist_ok=True)
for i, t in enumerate(times):
    os.link(f'{tmp}/hud/t{t:.2f}.png', f'{tmp}/seq/h{i:05d}.png')

# 3. Flow clip + HUD + our voice, same finish as encode_vertical.sh; then the episode from `cut`
fin = "eq=saturation=1.1:contrast=1.04,rgbashift=rh=2:bh=-2,drawgrid=w=iw:h=4:t=1:c=black@0.15,vignette=PI/5"
sh('ffmpeg', '-v', 'error', '-y', '-ss', f'{c0:.3f}', '-t', f'{D:.3f}', '-i', a.clip, '-framerate', '30', '-i', f'{tmp}/seq/h%05d.png',
   '-ss', f'{c0:.3f}', '-t', f'{D:.3f}', '-i', f'{tmp}/aligned.wav',
   '-filter_complex', f"[0:v]fps=30,scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,{fin}[b];[1:v]scale=1080:1920:flags=neighbor,format=rgba[h];[b][h]overlay=0:0:shortest=1,format=yuv420p[v];[2:a]aresample=48000,loudnorm=I=-14:TP=-1.5,afade=t=out:st={max(0, D - 0.15):.3f}:d=0.15[au]",
   '-map', '[v]', '-map', '[au]', '-c:v', 'libx264', '-crf', '18', '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-ac', '2', '-t', f'{D:.3f}', f'{tmp}/a.mp4')
sh('ffmpeg', '-v', 'error', '-y', '-ss', f'{cut:.3f}', '-i', ep, '-vf', 'fps=30,format=yuv420p', '-c:v', 'libx264', '-crf', '18',
   '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-ac', '2', f'{tmp}/b.mp4')
open(f'{tmp}/list.txt', 'w').write(f"file '{tmp}/a.mp4'\nfile '{tmp}/b.mp4'\n")
out = f'{P}/renders/final_flow_coldopen.mp4'
sh('ffmpeg', '-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', f'{tmp}/list.txt', '-c', 'copy', '-movflags', '+faststart', out)
print(f'wrote {out} ({dur(out):.2f}s; episode was {dur(ep):.2f}s)')
