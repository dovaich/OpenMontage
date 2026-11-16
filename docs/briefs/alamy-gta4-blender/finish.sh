#!/bin/bash
# Grade + upscale + freeze-frame name card + subtitles + sound -> alamy_gta4_final.mp4
# usage: bash finish.sh <raw.mp4> <overlay_dir> <out.mp4>
set -e
RAW=$1; OV=$2; OUT=$3; H=$(dirname "$0"); FZ=7.85
ffmpeg -y -loglevel error -i "$RAW" -loop 1 -i $OV/sub1.png -loop 1 -i $OV/sub2.png -loop 1 -i $OV/sub3.png -loop 1 -i $OV/card.png -i $H/mix.wav \
 -filter_complex "
 [0:v]trim=0:$FZ,setpts=PTS-STARTPTS,fps=30,tpad=stop_mode=clone:stop_duration=2.15,scale=1080:1920:flags=lanczos,
  eq=contrast=1.12:saturation=0.72:gamma=0.97,
  colorbalance=rs=0.05:gs=0.02:bs=-0.06:rm=0.03:gm=0.01:bm=-0.05:rh=0.02:bh=-0.03,
  curves=all='0/0.03 0.25/0.21 0.75/0.80 1/0.96',split[a][b];
 [b]scale=270:480,gblur=sigma=10,scale=1080:1920,eq=brightness=-0.05[bl];
 [a][bl]blend=all_mode=screen:all_opacity=0.28,
  hue=s=0.35:enable='gte(t,$FZ)',eq=contrast=1.2:enable='gte(t,$FZ)',
  vignette=angle=0.62,noise=alls=3:allf=t,format=yuv420p[g];
 [g][1:v]overlay=0:0:enable='between(t,0.30,4.05)'[s1];
 [s1][2:v]overlay=0:0:enable='between(t,4.38,5.95)'[s2];
 [s2][3:v]overlay=0:0:enable='between(t,6.17,7.84)'[s3];
 [4:v]format=rgba,fade=t=in:st=$(echo "$FZ+0.12"|bc):d=0.35:alpha=1[cd];
 [s3][cd]overlay=0:0:enable='gte(t,$FZ)':shortest=0,
  drawbox=x=0:y=0:w=iw:h=ih:color=white@0.85:t=fill:enable='between(t,$FZ,$FZ+0.07)',trim=0:10[v]" \
 -map "[v]" -map 5:a -c:v libx264 -crf 20 -maxrate 10M -bufsize 20M -preset medium -pix_fmt yuv420p -r 30 -c:a aac -b:a 192k -t 10 "$OUT"
echo "final: $OUT"
