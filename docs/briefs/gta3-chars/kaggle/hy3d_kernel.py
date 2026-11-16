# usage: python3 hy3d_kernel.py push <kernel-slug> <img1.png> [img2.png ...]   → Kaggle T4 script kernel: Hunyuan3D-2 shape + paint per image
#        python3 hy3d_kernel.py status <kernel-slug>
#        python3 hy3d_kernel.py fetch <kernel-slug> <outdir>
import base64, io, json, os, sys, time, urllib.request
sys.path.insert(0, os.path.dirname(__file__))
from kaggle_client import call
OWNER = 'dovaich'

KERNEL = r'''
import base64, os, subprocess, sys, time, io
T0 = time.time()
def sh(c): print('+', c, flush=True); r = subprocess.run(c, shell=True); print('rc', r.returncode, round(time.time() - T0), 's', flush=True)
sh('pip install -q "transformers==4.48.3" "diffusers==0.32.2" "huggingface_hub<1.0" pymeshlab pygltflib xatlas trimesh rembg onnxruntime einops ninja pybind11 opencv-python-headless')
sh('git clone -q --depth 1 https://github.com/Tencent/Hunyuan3D-2 /kaggle/hy3d')
os.chdir('/kaggle/hy3d'); sh('pip install -q -e .')
sh('cd hy3dgen/texgen/custom_rasterizer && pip install -q --no-build-isolation .')
sh('cd hy3dgen/texgen/differentiable_renderer && python setup.py build_ext --inplace -q')
sys.path.insert(0, '/kaggle/hy3d')
import torch
from PIL import Image
IMGS = __IMGS__
os.makedirs('/kaggle/working/in', exist_ok=True)
for n, b in IMGS.items(): open(f'/kaggle/working/in/{n}.jpg', 'wb').write(base64.b64decode(b))
from hy3dgen.rembg import BackgroundRemover
from hy3dgen.shapegen import Hunyuan3DDiTFlowMatchingPipeline, FaceReducer, FloaterRemover, DegenerateFaceRemover
rem = BackgroundRemover()
imgs = {}
for n in IMGS:
    im = Image.open(f'/kaggle/working/in/{n}.jpg').convert('RGB'); imgs[n] = rem(im)
shape = Hunyuan3DDiTFlowMatchingPipeline.from_pretrained('tencent/Hunyuan3D-2', torch_dtype=torch.float16)
meshes = {}
for n, im in imgs.items():
    m = shape(image=im, num_inference_steps=30, octree_resolution=256, num_chunks=8000, generator=torch.manual_seed(1))[0]
    m = FloaterRemover()(m); m = DegenerateFaceRemover()(m); m = FaceReducer()(m, max_facenum=30000)
    meshes[n] = m; m.export(f'/kaggle/working/{n}_shape.glb'); print('shape done', n, round(time.time() - T0), flush=True)
del shape; torch.cuda.empty_cache()
from hy3dgen.texgen import Hunyuan3DPaintPipeline
paint = Hunyuan3DPaintPipeline.from_pretrained('tencent/Hunyuan3D-2')
for n, m in meshes.items():
    try:
        tm = paint(m, image=imgs[n]); tm.export(f'/kaggle/working/{n}.glb'); print('paint done', n, round(time.time() - T0), flush=True)
    except Exception as e: print('PAINT FAIL', n, repr(e)[:400], flush=True)
print('ALL DONE', round(time.time() - T0), flush=True)
'''

def img_b64(path):
    from PIL import Image
    im = Image.open(path).convert('RGB'); im.thumbnail((768, 1024)); b = io.BytesIO(); im.save(b, 'JPEG', quality=90); return base64.b64encode(b.getvalue()).decode()

if __name__ == '__main__':
    cmd, slug = sys.argv[1], sys.argv[2]
    if cmd == 'push':
        imgs = {os.path.splitext(os.path.basename(p))[0]: img_b64(p) for p in sys.argv[3:]}
        text = KERNEL.replace('__IMGS__', json.dumps(imgs))
        r = call('kernels.KernelsApiService', 'SaveKernel', {'slug': f'{OWNER}/{slug}', 'newTitle': slug, 'text': text, 'language': 'python', 'kernelType': 'script',
                 'isPrivate': True, 'enableGpu': True, 'enableInternet': True, 'machineShape': 'NvidiaTeslaT4'})
        print(json.dumps(r)[:600])
    elif cmd == 'status':
        print(json.dumps(call('kernels.KernelsApiService', 'GetKernelSessionStatus', {'userName': OWNER, 'kernelSlug': slug}))[:600])
    elif cmd == 'fetch':
        out = sys.argv[3]; os.makedirs(out, exist_ok=True)
        r = call('kernels.KernelsApiService', 'ListKernelSessionOutput', {'userName': OWNER, 'kernelSlug': slug})
        log = r.get('log') or ''; open(os.path.join(out, 'log.txt'), 'w').write(log if isinstance(log, str) else json.dumps(log))
        for f in r.get('files', []):
            name = f.get('fileName') or f.get('name'); url = f.get('url')
            if name and url and name.endswith('.glb'):
                open(os.path.join(out, os.path.basename(name)), 'wb').write(urllib.request.urlopen(url, timeout=300).read()); print('got', name)
        print('keys', list(r.keys()))
