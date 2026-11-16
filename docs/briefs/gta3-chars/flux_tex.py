# usage: python3 flux_tex.py <out.png> "<material>" [seed]  — free FLUX.1-schnell HF Space → flat fabric photo texture
import json, sys, urllib.request
out, desc = sys.argv[1], sys.argv[2]; seed = int(sys.argv[3]) if len(sys.argv) > 3 else 3
B = "https://black-forest-labs-flux-1-schnell.hf.space/gradio_api"
prompt = f"flat top-down photo filling the whole frame of {desc}, realistic fabric with natural wrinkles and folds, even soft lighting, no background, no person, texture reference"
r = urllib.request.Request(f"{B}/call/infer", data=json.dumps({"data": [prompt, seed, False, 512, 512, 4]}).encode(), headers={"Content-Type": "application/json"})
eid = json.load(urllib.request.urlopen(r, timeout=60))["event_id"]
txt = urllib.request.urlopen(f"{B}/call/infer/{eid}", timeout=300).read().decode()
for line in txt.splitlines():
    if line.startswith("data:") and "url" in line:
        open(out, "wb").write(urllib.request.urlopen(json.loads(line[5:])[0]["url"], timeout=60).read()); print("saved", out); break
else: print("FAIL", out, txt[-200:])
