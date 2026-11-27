# usage: python3 paint_skin.py <face.json> <out.png> <tint r,g,b> <beard 0..1>
import json, sys, numpy as np
from PIL import Image, ImageDraw, ImageFilter
fj, outp, tint, beard = sys.argv[1], sys.argv[2], [float(x) for x in sys.argv[3].split(',')], float(sys.argv[4])
d = json.load(open(fj)); im = Image.open(d["skin"]).convert("RGB"); W, H = im.size
a = np.asarray(im).astype(np.float32) / 255
a = a * np.array(tint)[None, None, :]
if beard > 0:
    P = d["polys"]; lips = [p for p in P if p["lip"]]
    lz = [p["c"][2] for p in lips]; ltop, lbot = max(lz), min(lz); jaw = d["landmarks"]["joint-jaw"]; eye = d["landmarks"]["joint-l-eye"]
    m = Image.new("L", (W, H), 0); dr = ImageDraw.Draw(m)
    for p in P:
        x, y, z = p["c"]; ax = abs(x); w = 0
        if p["lip"] or z > eye[2] - 0.035 or z < jaw[2] - 0.075 or y > 0.0: continue
        if z < lbot - 0.004 and y < -0.03: w = 1.0                                   # chin + jaw + under-chin
        if ax > 0.035 and z < ltop + 0.035 and y < -0.02 and y > -0.15: w = max(w, 0.75 if z < ltop + 0.005 else 0.35)  # cheeks / jawline
        if ax > 0.058 and y > -0.10 and y < -0.02 and z < eye[2] - 0.035: w = max(w, 0.55)  # sideburns
        if ax < 0.032 and ltop + 0.001 < z < ltop + 0.019 and y < -0.12: w = max(w, 0.85)  # mustache
        if z < jaw[2] - 0.03 and y > -0.06: w *= max(0, (z - (jaw[2] - 0.075)) / 0.045)      # fade down the neck
        uc = sum(u for u, v in p['uv']) / len(p['uv']); vc = sum(v for u, v in p['uv']) / len(p['uv'])
        if not (uc > 0.63 and 0.16 < vc < 0.82): continue
        if w > 0: dr.polygon([(u * W, (1 - v) * H) for u, v in p["uv"]], fill=int(255 * w))
    m = m.filter(ImageFilter.GaussianBlur(W / 180))
    mk = np.asarray(m).astype(np.float32) / 255
    rng = np.random.default_rng(1); dots = rng.random((H, W)).astype(np.float32)
    dots = np.asarray(Image.fromarray((dots * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.7))).astype(np.float32) / 255
    stub = np.clip((dots - 0.35) * 2.2, 0, 1) * 0.6 + 0.4
    k = (mk * stub * beard)[..., None]
    hair = np.array([0.09, 0.065, 0.05])[None, None, :]
    a = a * (1 - k * 0.78) + hair * k * 0.78
Image.fromarray((np.clip(a, 0, 1) * 255).astype(np.uint8)).save(outp); print("painted", outp)
