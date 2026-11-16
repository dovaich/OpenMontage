# usage: python3 gemini_tpose.py <out.png> "<character description>" [model]
# T-pose drawing for image-to-3D through the Gemini API (the proxy injects the key). Fallback when the FLUX Space (flux_tpose.py) is out of quota.
import base64, json, sys, urllib.request
out, desc = sys.argv[1], sys.argv[2]; model = sys.argv[3] if len(sys.argv) > 3 else "gemini-3.1-flash-image"
prompt = (f"Full-body 3D video game character model of {desc}, standing in a strict symmetrical T-pose: arms stretched straight out horizontally "
          "to both sides, palms facing down, fingers slightly apart, legs straight and slightly apart (clearly separated), feet pointing forward, facing the camera directly, "
          "neutral closed-mouth expression. Style: stylized realistic 3D game character with clean readable shapes, like a modern open-world comedy game. "
          "Flat even studio lighting, no hard shadows, plain light grey background, whole body visible from head to toes with margin, straight front view, "
          "no text, no props, no floor shadow. Vertical 3:4 image.")
body = {"contents": [{"parts": [{"text": prompt}]}], "generationConfig": {"responseModalities": ["IMAGE"], "imageConfig": {"aspectRatio": "3:4"}}}
req = urllib.request.Request(f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent", data=json.dumps(body).encode(),
                             headers={"Content-Type": "application/json", "x-goog-api-key": "placeholder"})
try: d = json.load(urllib.request.urlopen(req, timeout=300))
except urllib.error.HTTPError as e: sys.exit(f"HTTP {e.code}: {e.read()[:400]!r}")
for p in d["candidates"][0]["content"]["parts"]:
    if "inlineData" in p:
        open(out, "wb").write(base64.b64decode(p["inlineData"]["data"])); print("saved", out); break
else: sys.exit("no image: " + json.dumps(d)[:400])
