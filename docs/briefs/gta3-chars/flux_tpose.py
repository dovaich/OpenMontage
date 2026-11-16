# usage: python3 flux_tpose.py <out.png> "<character description>" [seed]  — free FLUX.1-schnell HF Space, T-pose sheet for image-to-3D
import json, sys, urllib.request
out, desc = sys.argv[1], sys.argv[2]; seed = int(sys.argv[3]) if len(sys.argv) > 3 else 7
B = "https://black-forest-labs-flux-1-schnell.hf.space/gradio_api"
prompt = (f"Full-body 3D video game character model of {desc}, standing in a strict symmetrical T-pose: arms stretched straight out horizontally "
          "to both sides, palms facing down, legs straight and slightly apart, feet pointing forward, facing the camera directly, neutral closed-mouth "
          "expression. Style: stylized realistic 3D game character with clean readable shapes, like a modern open-world comedy game. Flat even studio "
          "lighting, no hard shadows, plain light grey background, whole body visible from head to toes with margin, straight front view, no text, no props.")
r = urllib.request.Request(f"{B}/call/infer", data=json.dumps({"data": [prompt, seed, False, 768, 1024, 4]}).encode(), headers={"Content-Type": "application/json"})
eid = json.load(urllib.request.urlopen(r, timeout=60))["event_id"]
txt = urllib.request.urlopen(f"{B}/call/infer/{eid}", timeout=300).read().decode()
for line in txt.splitlines():
    if line.startswith("data:") and "url" in line:
        open(out, "wb").write(urllib.request.urlopen(json.loads(line[5:])[0]["url"], timeout=60).read()); print("saved", out); break
else: print("FAIL", out, txt[-200:])
