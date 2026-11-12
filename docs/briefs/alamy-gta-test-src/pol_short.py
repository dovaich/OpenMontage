import sys, urllib.parse, urllib.request, time
from PIL import Image
OUT = '/home/user/OpenMontage/projects/alamy-gta-test/assets/images'
G = "GTA 4 style 3D game cutscene, gritty, desaturated, orange garage lights, smoke, film grain"
M = "handsome Egyptian man 28, clean-shaven, short natural black hair, black leather biker jacket over black turtleneck"
P = {
 's1_soot':  f"{M}, face and jacket covered in black soot, calm deadpan, burning old car behind him in a Cairo garage at night, {G}",
 's4_alamy': f"{M}, walking toward camera in a messy Cairo car repair garage at night, confident smirk, low angle, {G}",
 's6_laptop':f"{M}, holding an open black laptop with a cable to an old beige car engine, screen glow on his smug face, Cairo garage at night, {G}",
 's8_boom':  f"old beige 1970s sedan exploding in a huge orange fireball inside a Cairo car repair garage at night, debris flying, a chubby mechanic in blue overalls diving away, {G}",
}
for k in (sys.argv[1:] or list(P)):
    for seed in (7, 21, 99):
        try:
            url = 'https://image.pollinations.ai/prompt/' + urllib.parse.quote(P[k]) + f'?width=576&height=1088&seed={seed}&nologo=true&model=flux'
            p = f'{OUT}/{k}_v{seed}.jpg'
            with urllib.request.urlopen(url, timeout=240) as r: open(p, 'wb').write(r.read())
            print('ok', k, seed, flush=True)
        except Exception as e: print('err', k, seed, repr(e)[:120], flush=True); time.sleep(10)
