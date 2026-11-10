"""One line of dialogue with Gemini 3.8 Flash TTS.

The style is sent in the "audio profile / transcript" layout. That is the form Google AI Studio uses for its
style field: the model performs the profile and speaks only the transcript.
usage: python3 gemini38_line.py out.wav <voice_id> "<style>" "<line>"
The proxy injects the real key for generativelanguage.googleapis.com; the header value here is a placeholder.
"""
import sys, json, base64, wave, urllib.request, time
out, voice, style, line = sys.argv[1:5]
body = {"contents": [{"role": "user", "parts": [{"text": f"# AUDIO PROFILE\n{style}\n\n## TRANSCRIPT\n{line}"}]}],
        "generationConfig": {"responseModalities": ["AUDIO"], "speechConfig": {"voiceConfig": {"prebuiltVoiceConfig": {"voiceName": voice}}}}}
for attempt in range(4):
    try:
        req = urllib.request.Request("https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash-tts:generateContent",
                                     data=json.dumps(body).encode(), headers={"Content-Type": "application/json", "x-goog-api-key": "placeholder"})
        d = json.load(urllib.request.urlopen(req, timeout=180)); break
    except urllib.error.HTTPError as e:
        if e.code in (429, 500, 503) and attempt < 3: time.sleep(8 * (attempt + 1)); continue
        sys.exit(f"HTTP {e.code}: {e.read()[:300]!r}")
pcm = base64.b64decode(d["candidates"][0]["content"]["parts"][0]["inlineData"]["data"])
w = wave.open(out, "wb"); w.setnchannels(1); w.setsampwidth(2); w.setframerate(24000); w.writeframes(pcm); w.close()
print(out, round(len(pcm) / 48000, 2), "s")
