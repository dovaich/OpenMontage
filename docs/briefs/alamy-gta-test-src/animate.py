# LTX-Video distilled (free HF Space, user's free token via proxy) image-to-video, retrying on quota. usage: python animate.py [ids...]
import sys, shutil, time, os
from gradio_client import Client, handle_file
IMG = '/home/user/OpenMontage/projects/alamy-gta-test/assets/images'
OUT = '/home/user/OpenMontage/projects/alamy-gta-test/assets/video'
NEG = 'worst quality, inconsistent motion, blurry, jittery, distorted, morphing face, extra limbs, text artifacts'
SHOTS = {  # id: (image, seconds, motion prompt)
  's2_street': ('s2_street.webp', 5.5, 'the man in the black leather jacket walks slowly away down the wet street toward the glowing service center, neon flickers, light haze drifts, slow cinematic camera push forward'),
  's3_bestem': ('s3_bestem.webp', 5.0, 'the chubby mechanic shouts in panic, waving his arms wildly up and down, his head shaking, smoke drifting behind him, handheld camera shake'),
  's5_car':    ('s5_car.webp', 3.0, 'thick grey smoke billows and pours out of the open engine bay of the old car, the smoke rises and swirls, fluorescent light flickers, slow push in'),
  's7_screen': ('s7_screen.webp', 3.0, 'the green progress number glows and pulses on the laptop screen, smoke drifts across the frame, sparks flicker behind, slow push in'),
  's4_alamy':  ('s4_alamy.png', 4.0, 'the confident man walks slowly toward the camera, adjusting his jacket collar with both hands, calm smug expression, camera slowly tracks backward, low angle'),
  's6_laptop': ('s6_laptop.png', 6.0, 'the man looks down at the laptop and types calmly, then looks up at the camera with a smug smile, the screen light flickers on his face, smoke drifts from the car behind'),
  's8_boom':   ('s8_boom.png', 3.0, 'the old car explodes in a huge fireball, debris and sparks fly toward the camera, the mechanic dives to the floor, violent camera shake'),
  's1_soot':   ('s1_soot.png', 3.5, 'the soot-covered man stands perfectly still and calm, blinks slowly, thin smoke rises from his hair and shoulders, the car behind him burns with flickering fire, slow push in'),
}
c = Client('https://lightricks-ltx-video-distilled.hf.space/', headers={'Authorization': 'Bearer hf_proxyinjected'}, verbose=False)
ids = sys.argv[1:] or list(SHOTS)
deadline = time.time() + float(os.environ.get('HOURS', '8')) * 3600
for k in ids:
    img, dur, prompt = SHOTS[k]
    if not os.path.exists(f'{IMG}/{img}'): print('missing image', k, flush=True); continue
    while time.time() < deadline:
        try:
            r, seed = c.predict(prompt=prompt, negative_prompt=NEG, input_image_filepath=handle_file(f'{IMG}/{img}'), input_video_filepath=None,
                                height_ui=1024, width_ui=576, mode='image-to-video', duration_ui=dur, ui_frames_to_use=9, seed_ui=42,
                                randomize_seed=False, ui_guidance_scale=1, improve_texture_flag=True, api_name='/image_to_video')
            shutil.copy(r['video'], f'{OUT}/{k}.mp4'); print('ok', k, time.strftime('%H:%M'), flush=True); break
        except Exception as e:
            msg = repr(e); print('wait', k, time.strftime('%H:%M'), msg[:160], flush=True)
            time.sleep(300 if 'quota' in msg.lower() else 30)
