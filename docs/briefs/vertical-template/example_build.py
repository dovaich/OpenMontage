import json, re, os, shutil
dur = json.loads(open('lines.js').read()[len('window.LINES_DATA='):-1])['dur']
e = open('engine8.js').read().replace('const DUR = 76.0;', f'const DUR = {dur};').replace('const W = 640, H = 480;', 'const W = 540, H = 960;')
ep = open('ep.js').read()
extra = ''
models = re.findall(r"useModel\(\s*\w+\s*,\s*'([\w-]+)'", ep)
if models:   # real 3D characters (model_chars.js): GLTFLoader + the GLB files
    e = e.replace("import * as THREE from 'three';", "import * as THREE from 'three';\nimport { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';", 1)
    extra = open('model_chars.js').read()
    os.makedirs('models', exist_ok=True)
    for m in set(models): shutil.copy(f'/home/user/OpenMontage/docs/briefs/model-chars/models/{m}.glb', f'models/{m}.glb')
open('scene.js', 'w').write(e + '\n' + open('samir_car.js').read() + '\n' + open('vertical_common.js').read() + '\n' + ep + '\n' + extra + '\n' + open('framing_check.js').read())
r = open('render.cjs').read(); r = re.sub(r'Math\.ceil\([0-9.]+ \* fps\)', f'Math.ceil({dur} * fps)', r); open('render.cjs', 'w').write(r)
print('DUR', dur, 'models', sorted(set(models)))
