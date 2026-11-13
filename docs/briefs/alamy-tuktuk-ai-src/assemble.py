# Cut the Kaggle (Wan) + local clips to the voice timeline, add the text layer, grade, mix -> renders/final.mp4 (1080x1920)
import subprocess, os
P = '/home/user/OpenMontage/projects/alamy-tuktuk-ai'
WAN, LOC = f'{P}/assets/video/wan', f'{P}/assets/video/local'
# (clip, source in-point s, output duration s, reverse)
EDIT = [
    (f'{WAN}/s7_alamy_smirk.mp4', 0.60, 2.45, False),   # cold open: "معلش يا بستم... هو أذكى منك"
    (f'{WAN}/s7_alamy_smirk.mp4', 0.60, 0.65, True),    # rewind (reversed, fast)
    (f'{WAN}/s1_bestem_run.mp4', 0.00, 3.00, False),    # L1 Bestem bursts in (first 2.4 s, slightly slowed)
    (f'{WAN}/s4_bestem_scared.mp4', 0.00, 1.35, False), # L1 end: close-up "التوك توك بيتكلم!"
    (f'{WAN}/s3_alamy.mp4', 0.20, 1.50, False),         # L2 El-Alamy (start)
    (f'{LOC}/s2_tuktuk.mp4', 0.00, 1.50, False),        # L2 "...ذكاء اصطناعي" -> the tuk-tuk
    (f'{WAN}/s4_bestem_scared.mp4', 0.55, 2.00, False), # L3
    (f'{WAN}/s5_alamy_phone.mp4', 0.00, 3.40, False),   # L4 reading the phone
    (f'{WAN}/s6_bestem_angry.mp4', 0.00, 3.75, False),  # L5
    (f'{WAN}/s7_alamy_smirk.mp4', 0.90, 2.40, False),   # L6 punchline
    (f'{WAN}/s8_wide.mp4', 0.00, 3.40, False),          # announcer: mission complete
    (f'{LOC}/s8_end.mp4', 0.00, 4.60, False),           # slow pull-out to the end
]
def dur(f): return float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]).decode().strip())
inputs, parts = [], []
for i, (f, a, d, rev) in enumerate(EDIT):
    inputs += ['-i', f]
    avail = dur(f) - a
    if 's1_bestem_run' in f: avail = min(avail, 2.4)
    if rev: speed = avail / d if avail > d else 1.0          # play the whole available tail reversed, squeezed into d
    else: speed = min(1.0, avail / d)                          # slow down (never speed up) when the clip is shorter than the slot
    src_len = d * speed if not rev else min(avail, d * speed)
    chain = f'[{i}:v]trim=start={a}:duration={src_len:.3f},setpts=PTS-STARTPTS'
    if rev: chain += ',reverse,hue=s=0.4,eq=contrast=1.2'
    chain += f',setpts=PTS/{speed:.4f}' if not rev else f',setpts=PTS*{d / src_len:.4f}'
    chain += ',scale=-2:1280:flags=lanczos,crop=720:1280,fps=24,setsar=1'
    chain += f',trim=duration={d:.3f},setpts=PTS-STARTPTS[v{i}]'
    parts.append(chain)
n = len(EDIT)
fc = ';'.join(parts) + ';' + ''.join(f'[v{i}]' for i in range(n)) + f'concat=n={n}:v=1:a=0[base]'
fc += (';[base]eq=saturation=0.86:contrast=1.06:gamma=0.97,colorbalance=rs=0.03:bs=-0.03:rh=0.04:bh=-0.04,'
       'vignette=PI/5,noise=alls=7:allf=t[g]')
fc += f';[g][{n}:v]overlay=0:0:shortest=1,scale=1080:1920:flags=lanczos[out]'
cmd = ['ffmpeg', '-v', 'error', '-y'] + inputs + ['-framerate', '24', '-i', f'{P}/assets/overlay/o%04d.png', '-i', f'{P}/assets/audio/mix.wav',
       '-filter_complex', fc, '-map', '[out]', '-map', f'{n + 1}:a', '-c:v', 'libx264', '-crf', '18', '-preset', 'medium', '-pix_fmt', 'yuv420p',
       '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', f'{P}/renders/final.mp4']
subprocess.run(cmd, check=True)
print('ok', f'{P}/renders/final.mp4', round(dur(f'{P}/renders/final.mp4'), 2))
