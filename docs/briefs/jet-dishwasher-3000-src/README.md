# Jet Dishwasher 3000 — low-poly cutscene source

A deterministic Three.js scene that renders the 38.6 s cutscene described in
`../egyptian-kitchen-ps2-cutscene.md`, frame by frame, synced to the dialogue WAV.

## Re-render
```bash
npm install                       # three + fonts
# put the dialogue WAV at ./dialogue.wav, then build the mouth-flap envelope:
python3 -c "import wave,numpy as np,json;w=wave.open('dialogue.wav');sr=w.getframerate();a=np.frombuffer(w.readframes(w.getnframes()),np.int16).astype(float);h=sr//30;e=[float(np.sqrt(np.mean(a[i*h:(i+1)*h]**2))) if len(a[i*h:(i+1)*h]) else 0 for i in range(len(a)//h+1)];m=max(e);open('env.js','w').write('window.ENV='+json.dumps({'fps':30,'env':[round(x/m,3) for x in e]})+';')"
python3 -m http.server 8765 --bind 127.0.0.1 &
node render.cjs frames 15          # 579 PNGs at 640x480, ~45 ms/frame
ffmpeg -framerate 15 -i frames/f%05d.png -i dialogue.wav -filter_complex "[0:v]eq=saturation=1.2:contrast=1.05,scale=1440:1080:flags=neighbor,split[a][b];[b]gblur=sigma=7,curves=all='0/0 0.6/0.3 1/1'[g];[a][g]blend=all_mode=screen:all_opacity=0.4,rgbashift=rh=2:bh=-2,lenscorrection=k1=-0.05:k2=-0.015,drawgrid=w=iw:h=4:t=1:c=black@0.25,vignette=PI/5,fps=30,format=yuv420p[v]" -map "[v]" -map 1:a -c:v libx264 -crf 17 -c:a aac -shortest final.mp4
```
Render single stills for review: `node render.cjs stills 15 "1.6,15.2,32.6"`.
Shot timings, poses, expressions, and HUD timings all live in `scene.js`
(`WIFE_KEYS`, `HUS_KEYS`, `stateAt`, `cameraAt`, `LINES`).
