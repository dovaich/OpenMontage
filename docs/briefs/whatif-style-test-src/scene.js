// Style test: "what-if" 3D reel look (soft daylight 3D, HUD, blue future bubbles, typed captions). 10 s, 9:16.
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
import { Sky } from 'three/addons/objects/Sky.js';
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js';

const W = 1080, H = 1920, RS = 0.75;           // 3D renders at 810x1440, composited at 1080x1920
const DUR = 10.3;
window.DUR = DUR;
const out = document.getElementById('out'), g = out.getContext('2d');

function mkRenderer(w, h) {
  const r = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
  r.setSize(w, h, false); r.setPixelRatio(1);
  r.outputColorSpace = THREE.SRGBColorSpace;
  r.toneMapping = THREE.ACESFilmicToneMapping; r.toneMappingExposure = 0.95;
  r.shadowMap.enabled = true; r.shadowMap.type = THREE.PCFSoftShadowMap;
  return r;
}
const R = mkRenderer(W * RS, H * RS);
const RB = mkRenderer(512, 512);   // bubble renderer
RB.shadowMap.enabled = false;

const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0xcfe0ee, 30, 90);

// ------------------------------------------------------------------ textures
function canvasTex(w, h, draw, rep = [1, 1], srgb = true) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(...rep);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
}
let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const grassTex = canvasTex(512, 512, (x, w, h) => {
  x.fillStyle = '#5f8a3a'; x.fillRect(0, 0, w, h);
  for (let i = 0; i < 26000; i++) {
    const l = 30 + rnd() * 28, hue = 78 + rnd() * 30;
    x.fillStyle = `hsl(${hue},${38 + rnd() * 20}%,${l}%)`; x.fillRect(rnd() * w, rnd() * h, 1.5, 2 + rnd() * 4);
  }
}, [14, 14]);
const sidingTex = canvasTex(256, 256, (x, w, h) => {
  x.fillStyle = '#eceef0'; x.fillRect(0, 0, w, h);
  for (let y = 0; y < h; y += 16) {
    const gr = x.createLinearGradient(0, y, 0, y + 16); gr.addColorStop(0, '#f7f8f9'); gr.addColorStop(0.85, '#dfe2e6'); gr.addColorStop(1, '#a9adb3');
    x.fillStyle = gr; x.fillRect(0, y, w, 16);
  }
}, [4, 6]);
const roofTex = canvasTex(256, 256, (x, w, h) => {
  x.fillStyle = '#55595f'; x.fillRect(0, 0, w, h);
  for (let y = 0; y < h; y += 16) for (let xx = (y / 16 % 2) * 16; xx < w; xx += 32) {
    x.fillStyle = `hsl(215,5%,${30 + rnd() * 10}%)`; x.fillRect(xx + 1, y + 1, 30, 14);
  }
}, [6, 4]);
const deckTex = canvasTex(256, 256, (x, w, h) => {
  for (let y = 0; y < h; y += 21) { x.fillStyle = `hsl(18,${40 + rnd() * 10}%,${30 + rnd() * 6}%)`; x.fillRect(0, y, w, 19); x.fillStyle = '#3a2016'; x.fillRect(0, y + 19, w, 2); }
}, [3, 2]);
const latticeTex = canvasTex(256, 256, (x, w, h) => {
  x.fillStyle = '#2b2a2a'; x.fillRect(0, 0, w, h); x.strokeStyle = '#efeeea'; x.lineWidth = 9;
  for (let i = -h; i < w + h; i += 36) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i + h, h); x.stroke(); x.beginPath(); x.moveTo(i + h, 0); x.lineTo(i, h); x.stroke(); }
}, [8, 1]);
const concreteTex = canvasTex(256, 256, (x, w, h) => {
  x.fillStyle = '#b9b6ae'; x.fillRect(0, 0, w, h);
  for (let i = 0; i < 9000; i++) { x.fillStyle = `rgba(${rnd() > .5 ? 255 : 60},${rnd() > .5 ? 250 : 60},240,0.06)`; x.fillRect(rnd() * w, rnd() * h, 2, 2); }
  x.fillStyle = '#8f8c86'; x.fillRect(0, 0, w, 3); x.fillRect(0, 0, 3, h);
}, [1, 8]);

const M = (c, o = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.85, ...o });
function box(w, h, d, mat, x, y, z, parent = scene) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z);
  m.castShadow = m.receiveShadow = true; parent.add(m); return m;
}

// ------------------------------------------------------------------ sky + light
const sky = new Sky(); sky.scale.setScalar(4000); scene.add(sky);
const su = sky.material.uniforms; su.turbidity.value = 3; su.rayleigh.value = 1.2; su.mieCoefficient.value = 0.004; su.mieDirectionalG.value = 0.8;
const sunDir = new THREE.Vector3().setFromSphericalCoords(1, THREE.MathUtils.degToRad(48), THREE.MathUtils.degToRad(35));
su.sunPosition.value.copy(sunDir);
// soft clouds
const cloudTex = canvasTex(256, 128, (x, w, h) => {
  for (let i = 0; i < 26; i++) {
    const cx = 30 + rnd() * 196, cy = 50 + rnd() * 40, r = 18 + rnd() * 30;
    const gr = x.createRadialGradient(cx, cy, 0, cx, cy, r); gr.addColorStop(0, 'rgba(255,255,255,0.9)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
    x.fillStyle = gr; x.fillRect(0, 0, w, h);
  }
}, [1, 1]);
for (const [x, y, z, s] of [[-30, 26, -70, 40], [25, 32, -80, 50], [60, 22, -60, 34], [-70, 30, -40, 44]]) {
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: cloudTex, fog: false, depthWrite: false, opacity: 0.85 }));
  sp.position.set(x, y, z); sp.scale.set(s, s / 2, 1); scene.add(sp);
}
scene.add(new THREE.HemisphereLight(0xcfe4ff, 0x6b7a45, 1.15));
const sun = new THREE.DirectionalLight(0xfff1dc, 2.6);
sun.position.copy(sunDir).multiplyScalar(20); sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048); Object.assign(sun.shadow.camera, { left: -9, right: 9, top: 9, bottom: -9, near: 1, far: 60 });
sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.03; sun.shadow.radius = 4;
scene.add(sun);

// ------------------------------------------------------------------ yard + house
const ground = new THREE.Mesh(new THREE.PlaneGeometry(120, 120), new THREE.MeshStandardMaterial({ map: grassTex, roughness: 1 }));
ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; scene.add(ground);
const walk = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 12), new THREE.MeshStandardMaterial({ map: concreteTex, roughness: 0.95 }));
walk.rotation.x = -Math.PI / 2; walk.position.set(-2.6, 0.01, 1); walk.receiveShadow = true; scene.add(walk);

const house = new THREE.Group(); house.position.set(0, 0, -4.2); scene.add(house);
const siding = M(0xffffff, { map: sidingTex }), trim = M(0xf4f4f2, { roughness: 0.6 });
box(12, 3.4, 6, siding, 0, 1.7 + 0.7, -3, house);                              // main body (raised floor 0.7)
box(12.2, 0.7, 6.2, M(0x2b2a2a), 0, 0.35, -3, house);                          // foundation
// roof (gable along x)
const roofMat = M(0xffffff, { map: roofTex, roughness: 0.9 });
for (const s of [-1, 1]) {
  const r = box(12.8, 0.12, 3.9, roofMat, 0, 4.85, -3 + s * 1.55, house); r.rotation.x = s * 0.62;
}
box(12.8, 0.25, 0.25, trim, 0, 4.1, 0.2, house);
// windows + door on the front face (z = 0 of house group)
const glass = new THREE.MeshStandardMaterial({ color: 0x1d2630, roughness: 0.08, metalness: 0.6, envMapIntensity: 1 });
function windowAt(x, y, w = 1.1, h = 1.5) {
  box(w + 0.22, h + 0.22, 0.08, trim, x, y, 0.03, house); box(w, h, 0.1, glass, x, y, 0.05, house);
  box(0.06, h, 0.12, trim, x, y, 0.07, house); box(w, 0.06, 0.12, trim, x, y + 0.1, 0.07, house);
  box(0.42, h + 0.1, 0.06, M(0x39434d), x - w / 2 - 0.3, y, 0.05, house); box(0.42, h + 0.1, 0.06, M(0x39434d), x + w / 2 + 0.3, y, 0.05, house);
}
windowAt(-3.6, 2.45); windowAt(3.4, 2.45); windowAt(5.4, 2.45);
box(1.1, 2.2, 0.1, M(0x2d3742, { roughness: 0.5 }), 0.6, 1.8, 0.04, house);   // door
box(1.35, 2.4, 0.06, trim, 0.6, 1.85, 0.02, house);
box(0.08, 0.08, 0.1, M(0xc9a64a, { metalness: 0.8, roughness: 0.3 }), 0.95, 1.75, 0.12, house);
// porch deck, posts, steps, lattice
const deck = box(5.2, 0.12, 2.2, M(0xffffff, { map: deckTex }), 0.6, 0.72, 1.1, house);
box(5.2, 0.62, 0.05, M(0xffffff, { map: latticeTex }), 0.6, 0.33, 2.2, house);
for (const s of [-1, 1]) box(0.05, 0.62, 2.2, M(0xffffff, { map: latticeTex }), 0.6 + s * 2.6, 0.33, 1.1, house);
for (const x of [-1.9, 3.1]) box(0.16, 2.9, 0.16, trim, x, 2.2, 2.1, house);
box(5.4, 0.18, 0.2, trim, 0.6, 3.65, 2.1, house);
box(5.6, 0.1, 2.5, M(0xe8e8e6), 0.6, 3.78, 1.0, house);                        // porch roof
const stepMat = M(0xffffff, { map: deckTex });
for (let i = 0; i < 3; i++) box(1.6, 0.12, 0.34, stepMat, 0.6, 0.6 - i * 0.22, 2.38 + i * 0.32, house);
// railing
for (let x = -1.8; x <= 3.0; x += 0.24) if (x < -0.2 || x > 1.4) box(0.04, 0.7, 0.04, trim, x, 1.13, 2.12, house);
box(1.6, 0.06, 0.08, trim, -1.0, 1.5, 2.12, house); box(1.6, 0.06, 0.08, trim, 2.25, 1.5, 2.12, house);
// planter + flowers
box(0.5, 0.35, 0.5, M(0x8a5a3c), -1.4, 0.95, 1.6, house);
for (let i = 0; i < 9; i++) { const f = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 6), M([0xe85a7a, 0xf0c94a, 0xffffff][i % 3])); f.position.set(-1.4 + (rnd() - .5) * .35, 1.2 + rnd() * .1, 1.6 + (rnd() - .5) * .35); house.add(f); }

// picket fence on the sides + trees + bushes
const fenceMat = M(0x8c6a4e, { roughness: 0.9 });
function fence(x0, x1, z) {
  for (let x = x0; x <= x1; x += 0.16) { const p = box(0.11, 1.15 + (Math.round(x / 0.16) % 2) * 0.05, 0.03, fenceMat, x, 0.58, z); }
  box(x1 - x0, 0.07, 0.04, fenceMat, (x0 + x1) / 2, 0.35, z - 0.03); box(x1 - x0, 0.07, 0.04, fenceMat, (x0 + x1) / 2, 0.9, z - 0.03);
}
fence(-14, -6.3, -3.0); fence(6.3, 14, -3.0);
const leafMats = [M(0x3f6b2a), M(0x4f7d33), M(0x5d8a3a)];
function tree(x, z, s = 1) {
  const t = new THREE.Group(); t.position.set(x, 0, z); scene.add(t);
  const tr = new THREE.Mesh(new THREE.CylinderGeometry(0.12 * s, 0.2 * s, 3 * s, 8), M(0x5a4030)); tr.position.y = 1.5 * s; tr.castShadow = true; t.add(tr);
  for (let i = 0; i < 9; i++) {
    const l = new THREE.Mesh(new THREE.IcosahedronGeometry((0.9 + rnd() * 0.6) * s, 1), leafMats[i % 3]);
    l.position.set((rnd() - .5) * 2 * s, (3 + rnd() * 1.8) * s, (rnd() - .5) * 2 * s); l.castShadow = true; t.add(l);
  }
}
tree(-8.5, -5, 1.3); tree(9, -6, 1.5); tree(-12, -9, 1.6); tree(13, -3, 1.2); tree(-5, -14, 1.8); tree(6, -16, 1.9);
for (const [x, z] of [[-4.6, -3.6], [-5.6, -3.4], [3.9, -3.5], [4.8, -3.6], [5.8, -3.4]]) {
  const b = new THREE.Mesh(new THREE.IcosahedronGeometry(0.55, 1), leafMats[Math.floor(rnd() * 3)]); b.position.set(x, 0.4, z); b.scale.y = 0.8; b.castShadow = b.receiveShadow = true; scene.add(b);
}
// a red bike lying on the grass (props make the yard feel lived in)
const bike = new THREE.Group(); bike.position.set(3.4, 0.05, 0.6); bike.rotation.set(Math.PI / 2, 0, 0.5); scene.add(bike);
for (const x of [-0.5, 0.5]) { const wh = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.03, 8, 24), M(0x222222)); wh.position.x = x; wh.castShadow = true; bike.add(wh); }
const fr = box(1, 0.05, 0.05, M(0xc0392b, { roughness: 0.4, metalness: 0.3 }), 0, 0.15, 0, bike); fr.rotation.z = 0.15;

// every environment object is visible on layers 0, 1, 2 (bubble cameras use 1 and 2)
scene.traverse(o => { o.layers.enable(1); o.layers.enable(2); });

// ------------------------------------------------------------------ characters + animations
const gl = new GLTFLoader(), fbx = new FBXLoader();
const load = (l, u) => new Promise((res, rej) => l.load(u, res, undefined, rej));
const [michelle, rpm, soldier] = await Promise.all(['models/Michelle.glb', 'models/readyplayer.me.glb', 'models/Soldier.glb'].map(u => load(gl, u)));
const ANIMS = ['talking', 'yelling', 'angry_point', 'arguing', 'facepalm', 'shrug', 'scared'];
const fbxs = await Promise.all(ANIMS.map(a => load(fbx, `anims/${a}.fbx`)));
const CL = {}; ANIMS.forEach((a, i) => CL[a] = fbxs[i].animations[0]);
CL.idle = soldier.animations.find(a => a.name === 'Idle');

// ---- world-space retarget (bone directions aligned, then rotation deltas copied), baked at 30 fps
const strip = n => n.replace(/^.*mixamorig:?/, '');
function boneMap(root) { const m = {}; root.updateMatrixWorld(true); root.traverse(o => { if (o.isBone) m[strip(o.name)] = o; }); return m; }
function restInfo(root) {      // per bone: rest quaternion + position in root space
  root.updateMatrixWorld(true);
  const inv = new THREE.Matrix4().copy(root.matrixWorld).invert(), ri = {};
  const bm = boneMap(root);
  for (const n in bm) {
    const mw = new THREE.Matrix4().multiplyMatrices(inv, bm[n].matrixWorld), p = new THREE.Vector3(), q = new THREE.Quaternion(), sc = new THREE.Vector3();
    mw.decompose(p, q, sc); ri[n] = { q, p, bone: bm[n] };
  }
  return ri;
}
function rootQ(root, bone) {
  const q = new THREE.Quaternion(), rq = new THREE.Quaternion(); bone.getWorldQuaternion(q); root.getWorldQuaternion(rq); return rq.invert().multiply(q);
}
const childOf = n => ({ Hips: 'Spine', Spine: 'Spine1', Spine1: 'Spine2', Spine2: 'Neck', Neck: 'Head', LeftShoulder: 'LeftArm', LeftArm: 'LeftForeArm', LeftForeArm: 'LeftHand', LeftHand: 'LeftHandMiddle1', RightShoulder: 'RightArm', RightArm: 'RightForeArm', RightForeArm: 'RightHand', RightHand: 'RightHandMiddle1', LeftUpLeg: 'LeftLeg', LeftLeg: 'LeftFoot', LeftFoot: 'LeftToeBase', RightUpLeg: 'RightLeg', RightLeg: 'RightFoot', RightFoot: 'RightToeBase' })[n] || n.replace(/(\d)$/, d => String(+d + 1));
function bake(srcRoot, clip, tgtRest, tgtRoot, prefix) {
  const srcRest = restInfo(srcRoot);
  const mixer = new THREE.AnimationMixer(srcRoot), act = mixer.clipAction(clip); act.play();
  // alignment per target bone: rotate target rest direction onto source rest direction (root space)
  const names = Object.keys(tgtRest).filter(n => srcRest[n]);
  const A = {};
  const order = []; tgtRoot.traverse(o => { if (o.isBone && srcRest[strip(o.name)]) order.push(strip(o.name)); });
  for (const n of order) {
    const c = childOf(n);
    if (tgtRest[c] && srcRest[c]) {
      const dT = tgtRest[c].p.clone().sub(tgtRest[n].p).normalize(), dS = srcRest[c].p.clone().sub(srcRest[n].p).normalize();
      A[n] = new THREE.Quaternion().setFromUnitVectors(dT, dS);
    } else { const par = tgtRest[n].bone.parent; A[n] = (par && A[strip(par.name)]) ? A[strip(par.name)].clone() : new THREE.Quaternion(); }
  }
  const fps = 30, nf = Math.max(2, Math.round(clip.duration * fps) + 1), times = [], vals = {};
  order.forEach(n => vals[n] = []);
  for (let f = 0; f < nf; f++) {
    const t = Math.min(clip.duration, f / fps); times.push(t);
    act.time = t; mixer.update(0); srcRoot.updateMatrixWorld(true);
    const want = {};
    for (const n of order) {
      const qs = rootQ(srcRoot, srcRest[n].bone);
      const qw = qs.multiply(srcRest[n].q.clone().invert()).multiply(A[n]).multiply(tgtRest[n].q);
      want[n] = qw;
      // local = parentWorld^-1 * world
      const par = tgtRest[n].bone.parent, pn = par && strip(par.name);
      const pq = (pn && want[pn]) ? want[pn] : (pn && tgtRest[pn] ? tgtRest[pn].q : (() => { const q = new THREE.Quaternion(), rq = new THREE.Quaternion(); par.getWorldQuaternion(q); tgtRoot.getWorldQuaternion(rq); return rq.invert().multiply(q); })());
      const lq = pq.clone().invert().multiply(qw);
      vals[n].push(lq.x, lq.y, lq.z, lq.w);
    }
  }
  act.stop(); mixer.uncacheRoot(srcRoot);
  return new THREE.AnimationClip(clip.name, clip.duration, order.map(n => new THREE.QuaternionKeyframeTrack(prefix + n + '.quaternion', times, vals[n])));
}
const BAKED = new Map();
function bakedFor(gltf, prefix) {
  if (BAKED.has(gltf)) return BAKED.get(gltf);
  const tr = restInfo(gltf.scene), out = {};
  for (const k in CL) out[k] = bake(k === 'idle' ? soldier.scene : fbxs[ANIMS.indexOf(k)], CL[k], tr, gltf.scene, prefix);
  BAKED.set(gltf, out); return out;
}
function setupChar(gltf, prefix, height, { layer = 0, ghost = false } = {}) {
  const clips = bakedFor(gltf, prefix);
  const root = ghost ? SkeletonUtils.clone(gltf.scene) : gltf.scene;
  const bb = new THREE.Box3().setFromObject(root); const s = height / (bb.max.y - bb.min.y);
  const holder = new THREE.Group(); holder.add(root); root.scale.multiplyScalar(s); root.position.y -= bb.min.y * s;
  root.traverse(o => {
    if (o.isMesh) {
      o.castShadow = !ghost; o.receiveShadow = !ghost; o.frustumCulled = false;
      if (o.material && !ghost) { const ms = Array.isArray(o.material) ? o.material : [o.material]; ms.forEach(m => { m.envMapIntensity = 0.6; if (m.roughness !== undefined) m.roughness = Math.max(m.roughness, 0.55); }); }
    }
    o.layers.set(layer);
  });
  scene.add(holder);
  const mixer = new THREE.AnimationMixer(root);
  const acts = {};
  for (const k in clips) { const a = mixer.clipAction(clips[k]); a.play(); a.setEffectiveWeight(0); acts[k] = a; }
  return { holder, root, mixer, acts, sched: [] };
}
// Michelle's bones are "mixamorig:Hips" (sanitised to "mixamorigHips"); RPM's are plain "Hips".
const SARA = setupChar(michelle, 'mixamorig', 1.66);
const KARIM = setupChar(rpm, '', 1.80);
const GH1 = setupChar(michelle, 'mixamorig', 1.66, { layer: 1, ghost: true });
const GH2 = setupChar(michelle, 'mixamorig', 1.66, { layer: 2, ghost: true });

SARA.holder.position.set(-0.5, 0, 0.6); SARA.holder.rotation.y = Math.PI / 2 - 0.35;
KARIM.holder.position.set(0.65, 0, 0.75); KARIM.holder.rotation.y = -Math.PI / 2 + 0.3;
for (const gh of [GH1, GH2]) { gh.holder.position.copy(SARA.holder.position); gh.holder.rotation.y = SARA.holder.rotation.y; }

// schedule: [clip, start, end, speed, offset]
SARA.sched = [['talking', -1, 3.3, 1, 2], ['arguing', 3.1, 99, 0.35, 1.0]];
KARIM.sched = [['shrug', -1, 8.35, 0, 0.05], ['facepalm', 8.25, 99, 1.05, 0.0]];
GH1.sched = [['yelling', -1, 99, 1.1, 0.3]];
GH2.sched = [['angry_point', -1, 99, 1.0, 0.2]];
const FADE = 0.35;
function poseChar(c, t) {
  for (const k in c.acts) c.acts[k].setEffectiveWeight(0);
  const live = [];
  for (const [k, s, e, sp, off] of c.sched) {
    if (t < s - 1e-6 || t > e + FADE) continue;
    let w = 1; if (t < s + FADE && s > 0) w = (t - s) / FADE; if (t > e) w = 1 - (t - e) / FADE;
    const a = c.acts[k], d = a.getClip().duration;
    a.time = sp === 0 ? off : ((t - Math.max(s, 0)) * sp + off) % d;
    live.push([a, Math.max(0, Math.min(1, w))]);
  }
  const tot = live.reduce((x, [, w]) => x + w, 0) || 1;
  live.forEach(([a, w]) => a.setEffectiveWeight(w / tot));
  c.mixer.update(0);
  // breathing on top
  const sp = c.root.getObjectByName(c.root.getObjectByName('Spine2') ? 'Spine2' : 'mixamorigSpine2');
  if (sp) sp.rotateX(Math.sin(t * 2.1 + c.holder.position.x) * 0.018);
}

// ------------------------------------------------------------------ cameras
const cam = new THREE.PerspectiveCamera(38, W / H, 0.05, 500);
const bcam = new THREE.PerspectiveCamera(40, 1, 0.05, 500);
const lerp = (a, b, k) => a + (b - a) * k, ease = k => k * k * (3 - 2 * k), cl = k => Math.max(0, Math.min(1, k));
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const SHOTS = [
  { t0: 0, t1: 3.1, from: [V(0.35, 1.5, 7.6), V(0.05, 1.12, 0.6)], to: [V(0.25, 1.45, 6.6), V(0.05, 1.15, 0.6)], fov: 36 },
  { t0: 3.1, t1: 8.25, from: [V(-2.2, 1.72, 2.3), V(0.45, 1.55, 0.4)], to: [V(-1.8, 1.7, 2.05), V(0.45, 1.6, 0.5)], fov: 40 },
  { t0: 8.25, t1: 99, from: [V(-0.75, 1.38, 1.75), V(0.65, 1.52, 0.75)], to: [V(-0.6, 1.4, 1.65), V(0.65, 1.54, 0.77)], fov: 36 },
];
function setCam(t) {
  const s = SHOTS.find(s => t >= s.t0 && t < s.t1) || SHOTS[SHOTS.length - 1];
  const k = ease(cl((t - s.t0) / Math.min(s.t1 - s.t0, 6)));
  cam.position.lerpVectors(s.from[0], s.to[0], k); cam.fov = s.fov; cam.updateProjectionMatrix();
  // tiny handheld drift like the reference
  cam.position.x += Math.sin(t * 0.9) * 0.015; cam.position.y += Math.sin(t * 1.3) * 0.01;
  cam.lookAt(new THREE.Vector3().lerpVectors(s.from[1], s.to[1], k));
  return s;
}

// ------------------------------------------------------------------ overlays
const LINES = [   // narration timing (s) and text pieces; hi = highlighted (blue) words
  { t: 0.22, e: 3.05, words: [['سألتك', 0.22], ['سؤال', 0.62], ['واحد', 1.02], ['بس:', 1.4], ['النهارده', 1.93, 1], ['إيه؟', 2.8, 1]] },
  { t: 3.2, e: 5.2, words: [['لو', 3.2], ['قلت', 3.4], ['مش', 3.7], ['فاكر...', 3.95, 1], ['هتزعق.', 4.6, 1]] },
  { t: 5.32, e: 8.2, words: [['لو', 5.32], ['قلت', 5.6], ['فاكر...', 6.0, 1], ['هتسألك:', 6.9], ['طب', 7.3], ['إيه', 7.55], ['هو؟', 7.8, 1]] },
  { t: 8.34, e: 10.3, words: [['وانت', 8.34], ['معاك', 8.7], ['تلات', 9.1, 1], ['ثواني.', 9.4, 1]] },
];
function drawCaption(t) {
  const L = LINES.find(l => t >= l.t - 0.05 && t < l.e + 0.15); if (!L) return;
  const shown = L.words.filter(w => t >= w[1]);
  g.save(); g.direction = 'rtl'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.font = '600 62px PlexAr';
  // wrap into max 2 lines
  const maxW = 860, rows = [[]]; let wsum = 0;
  for (const w of L.words) { const ww = g.measureText(w[0] + ' ').width; if (wsum + ww > maxW && rows[rows.length - 1].length) { rows.push([]); wsum = 0; } rows[rows.length - 1].push(w); wsum += ww; }
  const y0 = 1500 - (rows.length - 1) * 42;
  rows.forEach((row, ri) => {
    const widths = row.map(w => g.measureText(w[0]).width), sp = g.measureText(' ').width;
    const total = widths.reduce((a, b) => a + b, 0) + sp * (row.length - 1);
    let x = W / 2 + total / 2;                 // RTL: start at the right
    row.forEach((w, i) => {
      const on = t >= w[1], k = cl((t - w[1]) / 0.12);
      const cx = x - widths[i] / 2;
      if (on) {
        g.globalAlpha = k;
        g.shadowColor = 'rgba(0,0,0,0.75)'; g.shadowBlur = 10; g.shadowOffsetY = 3;
        g.fillStyle = w[2] ? '#8fd3ff' : '#ffffff'; g.fillText(w[0], cx, y0 + ri * 84);
      }
      x -= widths[i] + sp;
    });
  });
  g.restore();
}
function hud(t, versions) {
  g.save(); g.font = '500 30px PlexMono'; g.textBaseline = 'middle';
  const txt = `AGE 27  ·  VERSIONS WATCHED ${versions}`;
  const w = g.measureText(txt).width;
  g.fillStyle = 'rgba(20,28,40,0.55)'; g.fillRect(46, 100, w + 34, 50);
  g.fillStyle = 'rgba(255,255,255,0.92)'; g.fillText(txt, 63, 126);
  g.restore();
}
function tag(x, y, text, a) {
  g.save(); g.globalAlpha = a; g.font = '500 40px PlexMono'; g.textBaseline = 'middle'; g.textAlign = 'center';
  const w = g.measureText(text).width + 36;
  g.fillStyle = 'rgba(18,30,52,0.82)'; g.fillRect(x - w / 2, y - 30, w, 60);
  g.strokeStyle = 'rgba(140,200,255,0.9)'; g.lineWidth = 2; g.strokeRect(x - w / 2, y - 30, w, 60);
  g.fillStyle = '#fff'; g.fillText(text, x, y + 2); g.restore();
}
const tmp = document.createElement('canvas'); tmp.width = tmp.height = 512; const tg = tmp.getContext('2d');
function bubble(t, ghost, layer, camPos, look, cx, cy, r, born, label) {
  const a = ease(cl((t - born) / 0.45)); if (a <= 0) return;
  poseChar(ghost, t);
  bcam.layers.set(layer); bcam.position.copy(camPos); bcam.lookAt(look); bcam.updateProjectionMatrix();
  RB.render(scene, bcam);
  // tint blue + wobbly feathered edge
  tg.globalCompositeOperation = 'source-over'; tg.clearRect(0, 0, 512, 512);
  tg.filter = 'grayscale(1) contrast(1.1) brightness(1.45)'; tg.drawImage(RB.domElement, 0, 0); tg.filter = 'none';
  tg.globalCompositeOperation = 'multiply'; tg.fillStyle = '#74a8f0'; tg.fillRect(0, 0, 512, 512);
  tg.globalCompositeOperation = 'screen'; tg.fillStyle = 'rgba(30,60,140,0.35)'; tg.fillRect(0, 0, 512, 512);
  tg.globalCompositeOperation = 'destination-in';
  const gr = tg.createRadialGradient(256, 256, 150, 256, 256, 250); gr.addColorStop(0, 'rgba(0,0,0,1)'); gr.addColorStop(0.8, 'rgba(0,0,0,0.85)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
  tg.fillStyle = gr; tg.beginPath();
  for (let i = 0; i <= 64; i++) {
    const an = i / 64 * Math.PI * 2, rr = 236 + Math.sin(an * 7 + t * 3) * 9 + Math.sin(an * 13 - t * 2) * 5;
    const px = 256 + Math.cos(an) * rr, py = 256 + Math.sin(an) * rr; i ? tg.lineTo(px, py) : tg.moveTo(px, py);
  }
  tg.fill();
  // connector from Karim's head
  const hp = new THREE.Vector3(); KARIM.root.getObjectByName('Head').getWorldPosition(hp); hp.y += 0.14; hp.project(cam);
  const hx = (hp.x + 1) / 2 * W, hy = (1 - hp.y) / 2 * H;
  g.save(); g.globalAlpha = a;
  const sc = 0.6 + 0.4 * a, rr = r * sc;
  g.strokeStyle = 'rgba(150,210,255,0.85)'; g.lineWidth = 6; g.setLineDash([2, 16]); g.lineCap = 'round';
  g.beginPath(); g.moveTo(hx, hy); g.quadraticCurveTo((hx + cx) / 2 + (cx > hx ? -60 : 60), (hy + cy) / 2 + 80, cx, cy + rr * 0.9); g.stroke(); g.setLineDash([]);
  g.fillStyle = 'rgba(170,220,255,0.95)'; g.beginPath(); g.arc(hx, hy, 9, 0, Math.PI * 2); g.fill();
  g.shadowColor = 'rgba(90,160,255,0.8)'; g.shadowBlur = 40;
  g.drawImage(tmp, cx - rr, cy - rr, rr * 2, rr * 2);
  g.restore();
  tag(cx, cy - rr * 0.95, label, a);
}

// ------------------------------------------------------------------ frame
window.renderFrame = (t) => {
  poseChar(SARA, t); poseChar(KARIM, t);
  setCam(t);
  R.render(scene, cam);
  g.clearRect(0, 0, W, H);
  g.drawImage(R.domElement, 0, 0, W, H);
  // gentle vignette + warm grade like the reference
  const vg = g.createRadialGradient(W / 2, H * 0.45, H * 0.3, W / 2, H * 0.5, H * 0.75);
  vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.32)'); g.fillStyle = vg; g.fillRect(0, 0, W, H);
  let versions = 0;
  if (t >= 3.1 && t < 8.25) {
    versions = 1;
    const sp = SARA.holder.position;
    bubble(t, GH1, 1, V(0.55, 1.55, 0.95), V(sp.x, 1.35, sp.z), 330, 560, 230, 3.3, 'IN 2 SEC');
    if (t >= 5.3) { versions = 2; bubble(t, GH2, 2, V(0.3, 1.45, 1.95), V(sp.x, 1.3, sp.z), 770, 470, 215, 5.35, 'IN 4 SEC'); }
  } else if (t >= 8.25) versions = 2;
  hud(t, versions);
  drawCaption(t);
  // short white flash on cuts
  for (const c of [3.1, 8.25]) { const k = 1 - cl(Math.abs(t - c) / 0.08); if (k > 0) { g.fillStyle = `rgba(255,255,255,${k * 0.25})`; g.fillRect(0, 0, W, H); } }
  // fade out
  if (t > DUR - 0.35) { g.fillStyle = `rgba(0,0,0,${cl((t - (DUR - 0.35)) / 0.35)})`; g.fillRect(0, 0, W, H); }
};
window.frameData = () => out.toDataURL('image/jpeg', 0.93);
await document.fonts.load('600 62px PlexAr'); await document.fonts.load('500 30px PlexMono');
window.DBG = { SARA, KARIM, GH1, GH2, CL, THREE };
window.READY = true;
