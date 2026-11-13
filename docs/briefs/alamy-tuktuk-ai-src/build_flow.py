# Flow (Omni 1.2) clips + our autopilot voices aligned to Flow's lip timing -> edit list, dialogue track, timeline.json
import subprocess, json, numpy as np, soundfile as sf
P = '/home/user/OpenMontage/projects/alamy-tuktuk-ai'
FL, AU = f'{P}/assets/video/flow', f'{P}/assets/audio'
R1 = f'{AU}/r1.wav'
# line -> (clip, our line in r1, flow speech window, clip in/out to use, speaker, text)
L = [
 ('l1', 'f1_bestem_line1', (0.20, 4.22), (1.0, 5.6), (0.85, 5.75), 'bestem', 'يا عالمييي! الحق! التوك توك بيتكلم!'),
 ('l2', 'f2_alamy_line2',  (4.65, 7.48), (0.5, 4.6), (0.45, 4.75), 'alamy',  'طبيعي يا بستم... أنا ركّبتله ذكاء اصطناعي.'),
 ('l3', 'f3_bestem_line3', (7.91, 9.75), (2.7, 4.7), (2.55, 4.85), 'bestem', 'وهو بيقول إيه بالظبط؟!'),
 ('l4', 'f4_alamy_line4',  (10.23, 13.38), (1.4, 5.2), (1.25, 5.4), 'alamy',  'بيقول عايز إجازة يوم الجمعة... وزيادة في المرتب.'),
 ('l5', 'f5_bestem_line5', (14.36, 17.88), (0.0, 4.6), (0.0, 4.85), 'bestem', 'توك توك وعايز مرتب؟! ده أنا ماخدتش زيادة من سنتين!'),
 ('l6', 'f6_alamy_line6',  (18.61, 20.70), (0.0, 2.7), (0.0, 2.95), 'alamy',  'معلش يا بستم... هو أذكى منك.'),
]
out = {}
for lid, clip, (a, b), (wa, wb), cut, spk, text in L:
    src = f'{AU}/{lid}_src.wav'; subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', R1, '-ss', str(a), '-to', str(b), src], check=True)
    al = f'{AU}/{lid}_aligned.wav'
    r = subprocess.run(['python3', f'{P}/src/align_voice.py', f'{FL}/{clip}.mp4', src, al, '1.5', str(wa), str(wb)], capture_output=True, text=True, check=True)
    print(lid, r.stdout.strip())
    out[lid] = dict(clip=clip, cut=cut, spk=spk, text=text, aligned=al)
json.dump(out, open(f'{P}/src/flow_lines.json', 'w'), ensure_ascii=False, indent=1)
