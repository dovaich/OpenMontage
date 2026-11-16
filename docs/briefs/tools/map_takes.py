"""Map every line of a recording batch to its start/end inside the takes, locally (faster-whisper, no API, no quota).

usage:  python3 docs/briefs/tools/map_takes.py <batch> [model]          (model default: large-v3-turbo; ~8 s per 20 s take on CPU)
reads:  docs/briefs/<batch>/recording_message.md   (the brief the laptop recorded from: RECORDING n / Block / Text / [long pause])
        incoming/<batch>/r1.wav, r2.wav ...         (recording n -> rn.wav)
writes: incoming/<batch>/map.json  and prints ready-to-paste assemble_pair.py tuples
        (speaker, take, start, end, pause_before, ar, en) in RECORDING order. Reorder them into episode order, fill `en`,
        and check every line marked "CHECK" (low match score) by ear or with gemini_transcribe.py.
How: Whisper word timestamps -> word alignment against the brief's own text (so the Arabic stays exactly as written) ->
     each boundary snapped to the nearest silence gap. Each [long pause] part becomes its own line.
First run downloads the model (~1.6 GB) from huggingface.co. If that fails with a xet/CAS error, set HF_HUB_DISABLE_XET=1.
"""
import os, re, sys, json, subprocess
from difflib import SequenceMatcher
import numpy as np

os.environ.setdefault("HF_HUB_DISABLE_XET", "1")
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
batch = sys.argv[1]; model_name = sys.argv[2] if len(sys.argv) > 2 else "large-v3-turbo"

# speaker names used in the briefs -> line ids used by the engine (NAMES in vertical_common.js)
IDS = [("om hamada", "mom"), ("hamada", "son"), ("ibrahim", "dad"), ("abu samir", "samir"), ("bestem", "bastam"), ("el-alamy", "alamy"),
       ("alamy", "alamy"), ("el-asly", "asly"), ("asly", "asly"), ("el-gazzar", "gazzar"), ("gazzar", "gazzar"), ("teta", "teta"),
       ("sayed", "sayed"), ("shehata", "shehata"), ("hoda", "hoda"), ("nashwa", "nashwa"), ("announcer", "anno")]
def sid(name):
    n = name.lower()
    for k, v in IDS:
        if k in n: return v
    return re.sub(r"[^a-z]", "", n.split()[0]) if n.strip() else "?"

# ---------- 1. parse the brief ----------
def parse_brief(path):
    recs = []; cur = None; who = None
    for line in open(path, encoding="utf-8"):
        line = line.strip()
        m = re.match(r"RECORDING (\d+)\b(.*)", line)
        if m:
            cur = {"n": int(m.group(1)), "parts": []}; recs.append(cur); who = None
            hdr = m.group(2)
            ms = re.search(r"single speaker\)?[:,]?\s*\w+\s*\(([^,)]+)", hdr)
            cur["single"] = sid(ms.group(1)) if ms else None
            continue
        m = re.match(r"Block \d+ \(Speaker \d+, ([^)]+)\)", line)
        if m: who = sid(m.group(1)); continue
        if cur and line.startswith("Text:"):
            text = line[5:].strip()
            spk = who or cur["single"] or "?"
            for p in re.split(r"\s*\[long pause\]\s*", text):
                if p.strip(): cur["parts"].append({"s": spk, "ar": p.strip()})
    return recs

# ---------- 2. text normalisation for matching (the output keeps the brief's own spelling) ----------
DIAC = re.compile(r"[ً-ْٰـ]")
def norm(w):
    w = DIAC.sub("", w.lower())
    w = re.sub(r"[أإآٱ]", "ا", w); w = w.replace("ى", "ي").replace("ة", "ه").replace("ؤ", "و").replace("ئ", "ي")
    w = w.replace("ذ", "ز").replace("ظ", "ض").replace("ث", "س").replace("ق", "ء")   # Cairene pronunciations Whisper writes either way
    w = re.sub(r"[^\w]", "", w)
    return re.sub(r"(.)\1+", r"\1", w)        # يا عالمييي -> يا عالمي
def sim(a, b):
    if not a or not b: return 0.0
    return SequenceMatcher(None, a, b).ratio()

# ---------- 3. audio helpers ----------
def load16(path):
    raw = subprocess.run(["ffmpeg", "-loglevel", "error", "-i", path, "-ar", "16000", "-ac", "1", "-f", "f32le", "-"], capture_output=True).stdout
    return np.frombuffer(raw, np.float32)
def voiced(a, sr=16000, minsil=0.12):
    hop = sr // 100; e = np.sqrt(np.array([np.mean(a[i:i + hop] ** 2) for i in range(0, len(a) - hop, hop)]) + 1e-12)
    db = 20 * np.log10(e); sp = db > db.max() - 38
    segs = []; i = 0; n = len(sp)
    while i < n:
        if sp[i]:
            j = i
            while j < n:
                if not sp[j]:
                    k = j
                    while k < n and not sp[k]: k += 1
                    if k - j >= int(minsil * 100) or k == n: break
                    j = k
                else: j += 1
            if j - i > 8: segs.append((i / 100, j / 100))
            i = j
        else: i += 1
    return segs
def snap(t, segs, edge, win):
    best = None
    for s in segs:
        v = s[0] if edge == "start" else s[1]
        if abs(v - t) <= win and (best is None or abs(v - t) < abs(best - t)): best = v
    return best if best is not None else t

# ---------- 4. align brief words to Whisper words ----------
def align(exp, got):
    """DP alignment; exp: list of normalised brief words, got: list of normalised whisper words. Returns exp index -> got index (or None)."""
    n, m = len(exp), len(got); GAP = -0.4
    S = np.zeros((n + 1, m + 1)); B = np.zeros((n + 1, m + 1), np.int8)
    S[1:, 0] = GAP * np.arange(1, n + 1); S[0, 1:] = GAP * np.arange(1, m + 1); B[1:, 0] = 1; B[0, 1:] = 2
    for i in range(1, n + 1):
        for j in range(1, m + 1):
            s = sim(exp[i - 1], got[j - 1]); d = S[i - 1, j - 1] + (2 * s - 0.8)
            u = S[i - 1, j] + GAP; l = S[i, j - 1] + GAP
            S[i, j], B[i, j] = max((d, 0), (u, 1), (l, 2))
    mp = [None] * n; i, j = n, m
    while i > 0 or j > 0:
        b = B[i, j]
        if i > 0 and j > 0 and b == 0:
            if sim(exp[i - 1], got[j - 1]) >= 0.5: mp[i - 1] = j - 1
            i -= 1; j -= 1
        elif i > 0 and (j == 0 or b == 1): i -= 1
        else: j -= 1
    return mp

def main():
    brief = f"{ROOT}/docs/briefs/{batch}/recording_message.md"
    recs = parse_brief(brief)
    if not recs: sys.exit(f"no RECORDING sections found in {brief}")
    from faster_whisper import WhisperModel
    model = WhisperModel(model_name, device="cpu", compute_type="int8")
    out = []
    for r in recs:
        take = f"r{r['n']}"; wav = f"{ROOT}/incoming/{batch}/{take}.wav"
        if not os.path.exists(wav): print(f"# {take}: missing {wav}"); continue
        a = load16(wav); segs = voiced(a)
        english = all(not re.search(r"[؀-ۿ]", p["ar"]) for p in r["parts"])
        prompt = " ".join(p["ar"] for p in r["parts"])   # the script itself as the prompt -> spelling closer to the brief
        ws, _ = model.transcribe(a, language="en" if english else "ar", word_timestamps=True, beam_size=5, initial_prompt=prompt[:400])
        words = [w for s in ws for w in s.words]
        got = [norm(w.word) for w in words]
        exp, owner = [], []
        for k, p in enumerate(r["parts"]):
            for w in p["ar"].split():
                if norm(w): exp.append(norm(w)); owner.append(k)
        mp = align(exp, got)
        print(f"# ---- {take} ({len(a) / 16000:.2f} s): {len(r['parts'])} lines, whisper heard: {' '.join(w.word.strip() for w in words)}")
        # whisper's rough span per line
        spans = []
        for k, p in enumerate(r["parts"]):
            idx = [mp[i] for i in range(len(exp)) if owner[i] == k and mp[i] is not None]
            nw = sum(1 for o in owner if o == k)
            spans.append((words[min(idx)].start, words[max(idx)].end, len(idx) / max(1, nw)) if idx else None)
        # fill unmatched lines between their neighbours
        for k in range(len(spans)):
            if spans[k] is None:
                a = next((spans[j][1] for j in range(k - 1, -1, -1) if spans[j]), 0.0)
                b = next((spans[j][0] for j in range(k + 1, len(spans)) if spans[j]), segs[-1][1] if segs else a + 1)
                spans[k] = (a, max(a + 0.3, b), 0.0)
        # each measured voiced segment goes to the line it overlaps most (or the nearest one); order is kept
        own = []
        for s0, s1 in segs:
            ov = [max(0, min(s1, e) - max(s0, b)) for b, e, _ in spans]
            if max(ov) > 0: k = int(np.argmax(ov))
            else: k = int(np.argmin([min(abs(s0 - e), abs(b - s1)) for b, e, _ in spans]))
            own.append(max(k, own[-1] if own else 0))
        for k, p in enumerate(r["parts"]):
            mine = [segs[i] for i in range(len(segs)) if own[i] == k]
            b, e, score = spans[k]
            st, en = (mine[0][0], mine[-1][1]) if mine else (b, e)
            item = {"s": p["s"], "take": take, "start": round(st, 2), "end": round(en, 2), "ar": p["ar"], "score": round(score, 2), "vox": [list(m) for m in mine]}
            out.append(item)
            flag = "" if score >= 0.6 and mine else "   # CHECK: weak match"
            ar = p["ar"].replace('"', '\\"')
            print(f'  ("{p["s"]}", "{take}", {st:.2f}, {en:.2f}, 0.4, "{ar}", ""),{flag}')
    json.dump(out, open(f"{ROOT}/incoming/{batch}/map.json", "w"), ensure_ascii=False, indent=1)
    print(f"# wrote incoming/{batch}/map.json ({len(out)} lines)")

if __name__ == "__main__":
    main()
