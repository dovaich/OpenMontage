# usage: python3 flux_face.py <out.png> "<person description>" [seed]
# Free FLUX.1-schnell HF Space → frontal flat-lit face photo used as a low-poly head texture (early-2000s game method).
import json, sys, urllib.request
out, desc = sys.argv[1], sys.argv[2]; seed = int(sys.argv[3]) if len(sys.argv) > 3 else 7
B = "https://black-forest-labs-flux-1-schnell.hf.space/gradio_api"
prompt = (f"passport photo, {desc}, strictly frontal view, symmetric face looking straight at the camera, neutral expression, mouth closed, "
          "flat even soft lighting, no shadows, plain light grey background, head and top of neck only, both ears visible, realistic skin, sharp focus")
data = [prompt, seed, False, 768, 768, 4]
r = urllib.request.Request(f"{B}/call/infer", data=json.dumps({"data": data}).encode(), headers={"Content-Type": "application/json"})
eid = json.load(urllib.request.urlopen(r, timeout=60))["event_id"]
txt = urllib.request.urlopen(f"{B}/call/infer/{eid}", timeout=300).read().decode()
for line in txt.splitlines():
    if line.startswith("data:") and "url" in line:
        res = json.loads(line[5:]); url = res[0]["url"]
        open(out, "wb").write(urllib.request.urlopen(url, timeout=60).read()); print("saved", out); break
else: print(txt[-600:])
