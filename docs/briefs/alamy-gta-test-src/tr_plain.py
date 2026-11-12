import sys, json, base64, urllib.request
f, model = sys.argv[1], sys.argv[2]
b64 = base64.b64encode(open(f, "rb").read()).decode()
body = {"contents": [{"parts": [{"inline_data": {"mime_type": "audio/wav", "data": b64}}, {"text": "Transcribe exactly what is said. Return only the words."}]}], "generationConfig": {"temperature": 0}}
req = urllib.request.Request(f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent", data=json.dumps(body).encode(), headers={"Content-Type": "application/json", "x-goog-api-key": "placeholder"})
d = json.load(urllib.request.urlopen(req, timeout=120)); print(d["candidates"][0]["content"]["parts"][0]["text"].strip())
