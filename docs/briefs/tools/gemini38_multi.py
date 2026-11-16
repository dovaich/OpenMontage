"""Multi-speaker take with Gemini 3.8 Flash TTS (2 speakers per request), audio-profile layout.
usage: python3 gemini38_multi.py out.wav spec.json
spec: {"speakers": {"Hamada": "Puck", "Ibrahim": "Orus"}, "profile": "<style notes>", "lines": [["Hamada", "<text>"], ...]}
The proxy injects the real key for generativelanguage.googleapis.com; the header value here is a placeholder.
"""
import sys, json, base64, wave, urllib.request, time
out, specf = sys.argv[1:3]
sp = json.load(open(specf))
transcript = "\n".join(f"{who}: {txt}" for who, txt in sp["lines"])
cfg = {"multiSpeakerVoiceConfig": {"speakerVoiceConfigs": [{"speaker": k, "voiceConfig": {"prebuiltVoiceConfig": {"voiceName": v}}} for k, v in sp["speakers"].items()]}} if len(sp["speakers"]) > 1 \
    else {"voiceConfig": {"prebuiltVoiceConfig": {"voiceName": list(sp["speakers"].values())[0]}}}
body = {"contents": [{"role": "user", "parts": [{"text": f"# AUDIO PROFILE\n{sp['profile']}\n\n## TRANSCRIPT\n{transcript}"}]}],
        "generationConfig": {"responseModalities": ["AUDIO"], "speechConfig": cfg}}
for attempt in range(4):
    try:
        req = urllib.request.Request("https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash-tts:generateContent",
                                     data=json.dumps(body).encode(), headers={"Content-Type": "application/json", "x-goog-api-key": "placeholder"})
        d = json.load(urllib.request.urlopen(req, timeout=240)); break
    except urllib.error.HTTPError as e:
        if e.code in (500, 503) and attempt < 3: time.sleep(10 * (attempt + 1)); continue
        sys.exit(f"HTTP {e.code}: {e.read()[:400]!r}")
pcm = base64.b64decode(d["candidates"][0]["content"]["parts"][0]["inlineData"]["data"])
w = wave.open(out, "wb"); w.setnchannels(1); w.setsampwidth(2); w.setframerate(24000); w.writeframes(pcm); w.close()
print(out, round(len(pcm) / 48000, 2), "s")
