# الشبشب — FINAL BOSS (episode 3) — low-poly cutscene source

Episode 3 of the Om Hamada / Ibrahim series. It uses the same engine as `../jet-dishwasher-3000-src`.
At 2 AM the night before his chemistry exam, Hamada is playing a microbus racing game. His mom turns into the
final boss, and her blue slipper is a homing weapon. He gets K.O.'d and is sent to the balcony, where Ibrahim
has been sleeping since the Jet Dishwasher 3000.

- 52.6 s, 4:3, rendered at 640×480 with 15 fps animation, finished at 1440×1080/30 fps with the CRT chain
- Voices: Microsoft Edge neural TTS (`ar-EG-SalmaNeural` for mom; `ar-EG-ShakirNeural` pitch-shifted for Hamada and Ibrahim;
  `en-US-GuyNeural` for the announcer). The script, voice settings and measured timings are in `lines.json`.
- Music and SFX are synthesised locally in `sfx.py`: a chiptune racing game, a Hijaz boss theme, footsteps, whoosh, bonk,
  a KO bell, crickets and oud-style plucks.

## Re-render
```bash
npm install
PROJ=out python3 tools/voice.py && PROJ=out python3 tools/assemble.py   # writes out/assets/audio/dialogue.wav + out/artifacts/env.json
python3 -c "import json;open('env.js','w').write('window.ENV='+open('out/artifacts/env.json').read()+';');open('lines.js','w').write('window.LINES_DATA='+open('out/artifacts/lines.json').read()+';')"
python3 -m http.server 8765 --bind 127.0.0.1 &
node render.cjs frames 15
python3 sfx.py out/assets/audio/dialogue.wav final_mix.wav
ffmpeg -framerate 15 -i frames/f%05d.png -i final_mix.wav -filter_complex "[0:v]eq=saturation=1.2:contrast=1.05,scale=1440:1080:flags=neighbor,split[a][b];[b]gblur=sigma=7,curves=all='0/0 0.6/0.3 1/1'[g];[a][g]blend=all_mode=screen:all_opacity=0.4,rgbashift=rh=2:bh=-2,lenscorrection=k1=-0.05:k2=-0.015,drawgrid=w=iw:h=4:t=1:c=black@0.25,vignette=PI/5,fps=30,format=yuv420p[v];[1:a]loudnorm=I=-15:TP=-1.5:LRA=11[au]" -map "[v]" -map "[au]" -c:v libx264 -crf 18 -c:a aac -b:a 192k -shortest final.mp4
```
`voice.py` / `assemble.py` read `lines.json` from `$PROJ/artifacts/`, so copy it there first.
Shot timings, poses and HUD timings all live in `scene.js` (`SON_KEYS`, `MOM_KEYS`, `DAD_KEYS`, `stateAt`, `cameraAt`).
