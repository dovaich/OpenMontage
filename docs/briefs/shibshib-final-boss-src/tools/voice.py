import json, subprocess, sys, os
import os; P = os.environ.get("PROJ", "projects/shibshib-final-boss")
d = json.load(open(f"{P}/artifacts/lines.json"))
only = set(sys.argv[1:])
for L in d["lines"]:
    if only and L["id"] not in only: continue
    v = dict(d["voices"][L["s"]]); 
    for k in ("rate", "pitch", "volume"):
        if k in L: v[k] = L[k]
    text = L.get("en_tts") or L["ar"]
    mp3 = f"{P}/assets/audio/lines/{L['id']}.mp3"; wav = mp3[:-4] + ".wav"
    cmd = ["python3", os.path.join(os.path.dirname(__file__), "etts.py"), "--voice", v["voice"], f"--rate={v['rate']}", f"--pitch={v['pitch']}", f"--volume={v.get('volume', '+0%')}", "--text", text, "--write-media", mp3]
    subprocess.run(cmd, check=True, capture_output=True)
    # trim leading/trailing silence, mono 44.1k
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", mp3, "-af",
        "silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.02,areverse,silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.05,areverse",
        "-ac", "1", "-ar", "44100", wav], check=True)
    dur = float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", wav]))
    print(L["id"], L["s"], round(dur, 2))
