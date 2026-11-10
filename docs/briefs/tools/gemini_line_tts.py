# usage: python3 gtts2.py out.wav mode "<direction>" "<line>" voice model   (mode: prefix | system)
import sys, json, base64, wave, urllib.request
out, mode, direction, line, voice, model = sys.argv[1:7]
gc = {"responseModalities": ["AUDIO"], "speechConfig": {"voiceConfig": {"prebuiltVoiceConfig": {"voiceName": voice}}}}
if mode == "prefix": body = {"contents": [{"parts": [{"text": f"{direction}: {line}"}]}], "generationConfig": gc}
else: body = {"systemInstruction": {"parts": [{"text": direction}]}, "contents": [{"parts": [{"text": line}]}], "generationConfig": gc}
req = urllib.request.Request(f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent", data=json.dumps(body).encode(), headers={"Content-Type": "application/json", "x-goog-api-key": "dummy"})
try: d = json.load(urllib.request.urlopen(req, timeout=180))
except urllib.error.HTTPError as e: print("HTTP", e.code, e.read()[:300]); sys.exit(1)
p = d["candidates"][0]["content"]["parts"][0]["inlineData"]; pcm = base64.b64decode(p["data"])
w = wave.open(out, "wb"); w.setnchannels(1); w.setsampwidth(2); w.setframerate(24000); w.writeframes(pcm); w.close()
print(out, round(len(pcm) / 48000, 2), "s")
