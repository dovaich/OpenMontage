# Local 2.5D motion (no GPU): Depth Anything V2 (ONNX, CPU) + depth-aware camera warp + light/haze effects.
# usage: python parallax.py <image> <out.mp4> <seconds> <preset>
import sys, subprocess, numpy as np, cv2, onnxruntime as ort
img_p, out_p, secs, preset = sys.argv[1], sys.argv[2], float(sys.argv[3]), sys.argv[4]
W, H, FPS = 720, 1280, 24
img = cv2.imread(img_p, cv2.IMREAD_COLOR); img = cv2.resize(img, (W, H), interpolation=cv2.INTER_LANCZOS4)
# --- depth ---
sess = ort.InferenceSession('/home/user/OpenMontage/projects/alamy-tuktuk-ai/models/da2s.onnx')
inp = cv2.resize(cv2.cvtColor(img, cv2.COLOR_BGR2RGB), (518, 924)).astype(np.float32) / 255.0
inp = ((inp - [0.485, 0.456, 0.406]) / [0.229, 0.224, 0.225]).transpose(2, 0, 1)[None].astype(np.float32)
d = sess.run(None, {'pixel_values': inp})[0][0]
d = cv2.resize(d, (W, H)); d = (d - d.min()) / (d.max() - d.min() + 1e-6)   # 1 = near
d = cv2.GaussianBlur(d, (0, 0), 3)
d = cv2.dilate(d, np.ones((9, 9), np.uint8))  # grow the foreground a bit to hide edge tearing
# --- camera presets: (dx, dy, zoom, rot) amplitudes over the shot ---
P = {'push': (0.0, 0.0, 0.06, 0.0), 'orbit': (18.0, 0.0, 0.03, 0.0), 'drift': (8.0, -6.0, 0.035, 0.004), 'pull': (0.0, 0.0, -0.05, 0.0), 'shake': (4.0, 3.0, 0.04, 0.0)}[preset]
N = int(secs * FPS)
ys, xs = np.mgrid[0:H, 0:W].astype(np.float32); cx, cy = W / 2, H / 2
proc = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'bgr24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                         '-c:v', 'libx264', '-crf', '17', '-pix_fmt', 'yuv420p', out_p], stdin=subprocess.PIPE)
rng = np.random.default_rng(3)
for i in range(N):
    k = i / max(1, N - 1); e = k * k * (3 - 2 * k)
    dx, dy, zm, rot = P[0] * (e - 0.5), P[1] * (e - 0.5), P[2] * e, P[3] * (e - 0.5)
    if preset == 'shake': dx += np.sin(i * 1.7) * 3; dy += np.cos(i * 2.3) * 2
    # depth-weighted parallax: near pixels move more than far ones
    par = 0.35 + 0.65 * d
    s = 1 + zm * par
    mx = (xs - cx) / s + cx - dx * par + rot * (ys - cy)
    my = (ys - cy) / s + cy - dy * par - rot * (xs - cx)
    fr = cv2.remap(img, mx, my, cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)
    # breathing light + slow haze drift on the far plane
    fl = 1 + 0.03 * np.sin(i * 0.9) + 0.015 * np.sin(i * 2.7)
    haze = (cv2.GaussianBlur(fr, (0, 0), 18) * 0.18 * (1 - d[..., None]) * (0.6 + 0.4 * np.sin(i * 0.11 + xs[..., None] / 140)))
    fr = np.clip(fr * fl + haze, 0, 255)
    fr = np.clip(fr + rng.normal(0, 4, fr.shape), 0, 255).astype(np.uint8)
    proc.stdin.write(fr.tobytes())
proc.stdin.close(); proc.wait()
cv2.imwrite(out_p.replace('.mp4', '_depth.png'), (d * 255).astype(np.uint8))
print('ok', out_p, N, 'frames')
