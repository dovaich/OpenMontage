import sys, json, base64, urllib.request
f = sys.argv[1]; model = sys.argv[2] if len(sys.argv) > 2 else "gemini-2.5-flash"
b64 = base64.b64encode(open(f, "rb").read()).decode()
prompt = ("Transcribe this Egyptian Arabic audio. Return ONLY a JSON list, one item per spoken phrase, in order: "
          "{\"start\": seconds, \"end\": seconds, \"voice\": \"male\" or \"female\", \"pitch\": \"low\"/\"mid\"/\"high\", \"text\": exact Arabic words}. "
          "Timestamps must be accurate to 0.1 s. Split at every pause longer than 0.3 s. Do not merge different speakers. For male voices, also say older or younger.")
body = {"contents": [{"parts": [{"inline_data": {"mime_type": "audio/wav", "data": b64}}, {"text": prompt}]}],
        "generationConfig": {"temperature": 0, "responseMimeType": "application/json"}}
req = urllib.request.Request(f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent", data=json.dumps(body).encode(),
                             headers={"Content-Type": "application/json", "x-goog-api-key": "placeholder"})
try: d = json.load(urllib.request.urlopen(req, timeout=240))
except urllib.error.HTTPError as e: sys.exit(f"HTTP {e.code}: {e.read()[:300]!r}")
txt = d["candidates"][0]["content"]["parts"][0]["text"]
for x in json.loads(txt): print(f'{x["start"]:6.2f}-{x["end"]:6.2f} {x["voice"]:6s} {x.get("pitch",""):4s} {x["text"]}')
