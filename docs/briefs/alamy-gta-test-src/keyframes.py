# FLUX.1-schnell (free HF Space) keyframes for the El-Alamy open-world look test. usage: python keyframes.py [ids...]
import sys, shutil, json, time
from gradio_client import Client
OUT = '/home/user/OpenMontage/projects/alamy-gta-test/assets/images'
STYLE = ("3D rendered video game cutscene still, stylized realistic CG characters with slightly exaggerated features, "
         "gritty late-2000s open-world crime game look, desaturated muted colors, hazy smoggy night air, sodium-orange streetlights, "
         "heavy soft bloom, film grain, brown-teal color grade, cinematic lighting, vertical 9:16 composition")
ALAMY = ("a handsome confident Egyptian man aged 28, tan skin, clean-shaven, short neat realistic black hair, natural low modern quiff gently swept back, short faded sides, not spiky, not tall, sharp smart eyes, "
         "smug calm half-smile, no mustache, no beard, wearing an open black moto leather jacket with band collar and quilted shoulders over a black turtleneck, slim grey trousers")
BESTEM = ("a chubby loud Egyptian mechanic foreman aged 29, short curly hair, thin mustache, greasy navy-blue work overalls, oil stains, wide panicked eyes")
GARAGE = ("a cramped Cairo car service garage at night, fluorescent tubes, oil-stained concrete floor, tool walls, tires stacked, a red Arabic neon sign")
CAR = "an old boxy beige 1970s Fiat 128 sedan with its hood open"
SHOTS = {
  's1_soot':  f"medium close-up of {ALAMY}, his face, hair and leather jacket heavily covered in black soot and ash, thin smoke rising from his hair, clean-shaven, standing perfectly calm and deadpan, behind him {CAR} burning with orange fire and thick black smoke inside {GARAGE}",
  's2_street': f"wide establishing shot of a narrow Cairo street at night with a small car service center glowing at the end, red Arabic neon sign, tangled wires, old apartment blocks, wet asphalt reflecting orange lights, a lone figure in a black leather jacket walking toward it",
  's3_bestem': f"medium shot of {BESTEM}, shouting with his mouth wide open and waving his arms in panic inside {GARAGE}, grey smoke in the background",
  's4_alamy':  f"low-angle hero shot of {ALAMY}, walking slowly toward camera through {GARAGE}, adjusting his jacket collar, completely calm",
  's5_car':    f"{CAR} parked inside {GARAGE}, thick grey smoke pouring out of the engine bay, warning lights, dramatic",
  's6_laptop': f"{ALAMY} holding an open unbranded black laptop with no logo connected by a cable to the engine of {CAR}, the screen glow lighting his smug face, inside {GARAGE}",
  's7_screen': f"close-up of a laptop screen in a dark garage showing a progress bar at 99 percent with green glowing text, smoke drifting across, an engine with sparking wires behind it",
  's8_boom':   f"{CAR} exploding in a huge orange fireball inside {GARAGE}, flying debris and sparks, {BESTEM} diving away in the foreground, shockwave dust",
}
import urllib.parse, urllib.request
def pollinations(prompt, path, seed=1234):
    url = 'https://image.pollinations.ai/prompt/' + urllib.parse.quote(prompt) + f'?width=576&height=1088&seed={seed}&nologo=true&model=flux&enhance=false'
    with urllib.request.urlopen(url, timeout=240) as r: open(path, 'wb').write(r.read())
if '--pol' in sys.argv:
    sys.argv.remove('--pol')
    for k in (sys.argv[1:] or list(SHOTS)):
        for attempt in range(3):
            try: pollinations(SHOTS[k] + '. ' + STYLE, f'{OUT}/{k}_pol.jpg'); print('ok', k, flush=True); break
            except Exception as e: print('err', k, repr(e)[:200], flush=True); time.sleep(15)
    sys.exit()
c = Client('https://black-forest-labs-flux-1-schnell.hf.space/', headers={'Authorization': 'Bearer hf_proxyinjected'}, verbose=False)
ids = sys.argv[1:] or list(SHOTS)
for k in ids:
    for attempt in range(3):
        try:
            res, seed = c.predict(prompt=SHOTS[k] + ". " + STYLE, seed=1234, randomize_seed=False, width=576, height=1024,
                                  num_inference_steps=4, api_name='/infer')
            p = res if isinstance(res, str) else (res.get('path') or res.get('url'))
            shutil.copy(p, f'{OUT}/{k}.webp'); print('ok', k, flush=True); break
        except Exception as e:
            print('err', k, repr(e)[:300], flush=True); time.sleep(10)
