# usage: python3 gen_face.py <out.png> "<person description>" [model]
# Asks Gemini for a frontal, flat-lit face photo to use as a low-poly head texture (the way early-2000s games made faces).
import base64, json, sys, urllib.request
out, desc = sys.argv[1], sys.argv[2]
model = sys.argv[3] if len(sys.argv) > 3 else 'gemini-2.5-flash-image'
prompt = (f"Photographic head texture reference for an early-2000s video game character: {desc}. "
          "Strictly frontal view, face centered and symmetric, looking straight into the camera, neutral expression, mouth closed. "
          "Flat even studio lighting with no strong shadows, plain light grey background, square 1:1 crop from just above the top of the head "
          "to just below the chin, both ears visible. Realistic skin, natural colours, sharp focus. No text, no glasses, no hands.")
body = {"contents": [{"parts": [{"text": prompt}]}], "generationConfig": {"responseModalities": ["IMAGE"], "imageConfig": {"aspectRatio": "1:1"}}}
req = urllib.request.Request(f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent",
                             data=json.dumps(body).encode(), headers={"Content-Type": "application/json", "x-goog-api-key": "dummy"})
d = json.load(urllib.request.urlopen(req, timeout=180))
for p in d["candidates"][0]["content"]["parts"]:
    if "inlineData" in p:
        open(out, "wb").write(base64.b64decode(p["inlineData"]["data"])); print("saved", out); break
else:
    print(json.dumps(d)[:800])
