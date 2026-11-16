# usage: python3 build.py [ep.js]  -> scene.js (engine8 with the GTA3 character block + car + common + crew + episode)
import json, re, sys
ep = sys.argv[1] if len(sys.argv) > 1 else 'ep.js'
dur = json.loads(open('lines.js').read()[len('window.LINES_DATA='):-1])['dur']
e = open('engine8.js').read().replace('const DUR = 76.0;', f'const DUR = {dur};').replace('const W = 640, H = 480;', 'const W = 540, H = 960;')
a, b = e.index('// ---------- characters ----------'), e.index('// pose: {bend')
e = e[:a] + open('gta3_chars.js').read() + '\n' + open('gta3_models.js').read() + '\n' + e[b:]
e = e.replace("import * as THREE from 'three';", "import * as THREE from 'three';\nimport { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';", 1)
e = e.replace('cam(h.clone().add(f.multiplyScalar(dist))', 'cam(h.clone().add(f.multiplyScalar(dist * GTA_FACE_K))')
e = e.replace("antialias: false", "antialias: true")
vc = open('vertical_common.js').read().replace('function portrait(', 'function portraitOld(')
p = open(ep).read().replace('${GARAGE}', open('garage_block.js').read()).replace('${CREW}', open('crew_def.js').read())
e = e.replace("import * as THREE from 'three';", "import * as THREE from 'three';\nwindow.GTA_TPOSE_BB = null;", 1)
open('scene.js', 'w').write(e + '\n' + open('alamy.js').read() + '\n' + open('samir_car.js').read() + '\n' + open('gta3_cars.js').read() + '\n' + vc + '\n' + p)
r = open('render.cjs').read(); r = re.sub(r'Math\.ceil\([0-9.]+ \* fps\)', f'Math.ceil({dur} * fps)', r); open('render.cjs', 'w').write(r)
print('DUR', dur)
