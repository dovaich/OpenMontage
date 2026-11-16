#!/bin/bash
# usage (from a project's build/ dir): bash encode_vertical.sh   -> ../renders/final_old_style.mp4 (1080x1920) + ../renders/cover_old_style.png
# needs frames/ (node render.cjs frames 15) and ../assets/audio/final_mix.wav
ffmpeg -y -loglevel error -framerate 15 -i frames/f%05d.png -i ../assets/audio/final_mix.wav -filter_complex "[0:v]eq=saturation=1.2:contrast=1.05,scale=1080:1920:flags=neighbor,split[a][b];[b]gblur=sigma=7,curves=all='0/0 0.6/0.3 1/1'[g];[a][g]blend=all_mode=screen:all_opacity=0.35,drawgrid=w=iw:h=4:t=1:c=black@0.2,rgbashift=rh=2:bh=-2,vignette=PI/5,fps=30,format=yuv420p[v];[1:a]loudnorm=I=-14:TP=-1.5:LRA=11[au]" -map "[v]" -map "[au]" -c:v libx264 -crf 18 -c:a aac -b:a 192k -shortest -movflags +faststart ../renders/final_old_style.mp4
ffmpeg -y -loglevel error -i frames/f00010.png -vf "scale=1080:1920:flags=neighbor" ../renders/cover_old_style.png
ffprobe -v error -show_entries format=duration -of csv=p=0 ../renders/final_old_style.mp4
