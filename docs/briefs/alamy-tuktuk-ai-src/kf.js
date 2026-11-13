// Key frames for the El-Alamy tuk-tuk AI test: code-drawn characters in the 3D garage, rendered 720x1280
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { GTAOPass } from 'three/addons/postprocessing/GTAOPass.js';
import { buildChar } from './chars.js';
const W = 720, H = 1280;
const Q = new URLSearchParams(location.search);
// ---------- utils ----------
function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
const lerp = (a, b, t) => a + (b - a) * t;
const V = (x, y, z) => new THREE.Vector3(x, y, z);
function canvas(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return [c, c.getContext('2d')]; }
function tex(c, srgb = true, rep = [1, 1]) { const t = new THREE.CanvasTexture(c); if (srgb) t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep[0], rep[1]); t.anisotropy = 4; return t; }
function speckle(g, w, h, r, n, cols, aMax = 0.12, sz = 3) { for (let i = 0; i < n; i++) { g.fillStyle = cols[(r() * cols.length) | 0]; g.globalAlpha = r() * aMax; const s = 1 + r() * sz; g.fillRect(r() * w, r() * h, s, s); } g.globalAlpha = 1; }
function stains(g, w, h, r, n, col = '30,22,14') { for (let i = 0; i < n; i++) { const x = r() * w, y = r() * h * 0.9, ww = 6 + r() * 40, hh = 40 + r() * 220; const gr = g.createLinearGradient(0, y, 0, y + hh); gr.addColorStop(0, `rgba(${col},${0.10 + r() * 0.25})`); gr.addColorStop(1, `rgba(${col},0)`); g.fillStyle = gr; g.fillRect(x, y, ww, hh); } }
function plainTex(seed, base, w = 256, h = 256) { const r = rng(seed); const [c, g] = canvas(w, h); g.fillStyle = base; g.fillRect(0, 0, w, h); speckle(g, w, h, r, 3000, ['#000', '#fff', '#4a3a28'], 0.12, 3); stains(g, w, h, r, 10); return tex(c); }
await document.fonts.load('80px Lalezar'); await document.fonts.load('80px Anton');

// ---------- renderer / scene ----------
const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
renderer.setSize(W, H); renderer.setPixelRatio(1);
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.3;
renderer.outputColorSpace = THREE.SRGBColorSpace;
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x6b5a4a, 0.03);
const camera = new THREE.PerspectiveCamera(50, W / H, 0.05, 300);
const M = {
  plaster: (seed, col) => new THREE.MeshStandardMaterial({ map: plainTex(seed, col), roughness: 0.95 }),
  dark: new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.8 }),
  metal: new THREE.MeshStandardMaterial({ color: 0x7a7a78, roughness: 0.45, metalness: 0.8 }),
  wire: new THREE.MeshStandardMaterial({ color: 0x0c0c0c, roughness: 0.6 }),
  concrete: new THREE.MeshStandardMaterial({ map: plainTex(5, '#77706a'), roughness: 0.95 }),
};
function box(w, h, d, mat, x, y, z, parent, cast = true) { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); m.castShadow = cast; m.receiveShadow = true; parent.add(m); return m; }
const GX = 200;
const garage = new THREE.Group(); garage.position.x = GX; scene.add(garage);
const gLights = [];
{
  const r = rng(91);
  const [c, g] = canvas(1024, 1024); g.fillStyle = '#5e5a55'; g.fillRect(0, 0, 1024, 1024);
  speckle(g, 1024, 1024, r, 40000, ['#000', '#888', '#3a3530'], 0.25, 3);
  for (let i = 0; i < 40; i++) { g.fillStyle = `rgba(10,8,6,${0.2 + r() * 0.5})`; g.beginPath(); g.ellipse(r() * 1024, r() * 1024, 10 + r() * 70, 6 + r() * 40, r() * 3, 0, 7); g.fill(); }
  g.strokeStyle = 'rgba(0,0,0,0.5)'; g.lineWidth = 3; for (let i = 0; i < 1024; i += 256) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i, 1024); g.stroke(); g.beginPath(); g.moveTo(0, i); g.lineTo(1024, i); g.stroke(); }
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(14, 18), new THREE.MeshStandardMaterial({ map: tex(c, true, [2, 2]), roughness: 0.6, metalness: 0.1, envMapIntensity: 1.2 }));
  floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; garage.add(floor);
  const wallM = M.plaster(93, '#6e6a5e');
  box(14, 4.6, 0.3, wallM, 0, 2.3, -8, garage); box(0.3, 4.6, 18, wallM, -7, 2.3, 0, garage); box(0.3, 4.6, 18, wallM, 7, 2.3, 0, garage);
  box(14, 0.2, 18, M.dark, 0, 4.6, 0, garage, false);
  // front: half-raised shutter, night outside
  box(14, 1.4, 0.15, new THREE.MeshStandardMaterial({ map: plainTex(95, '#6e706c'), roughness: 0.6, metalness: 0.5 }), 0, 3.9, 9, garage);
  const night = new THREE.Mesh(new THREE.PlaneGeometry(14, 3.2), new THREE.MeshBasicMaterial({ color: 0x2a1c12 })); night.position.set(0, 1.6, 9.3); night.rotation.y = Math.PI; garage.add(night);
  // pegboard with tools, left wall
  const [cp, gp] = canvas(1024, 512); gp.fillStyle = '#7a5e3c'; gp.fillRect(0, 0, 1024, 512);
  gp.fillStyle = 'rgba(0,0,0,0.5)'; for (let y = 10; y < 512; y += 20) for (let x = 10; x < 1024; x += 20) gp.fillRect(x, y, 3, 3);
  for (let i = 0; i < 40; i++) { gp.fillStyle = ['#8a8a88', '#b02a1a', '#222', '#c8a030', '#2a4a8a'][(r() * 5) | 0]; const x = 20 + r() * 980, y = 20 + r() * 420; gp.fillRect(x, y, 6 + r() * 14, 40 + r() * 70); }
  const peg = new THREE.Mesh(new THREE.PlaneGeometry(6, 3), new THREE.MeshStandardMaterial({ map: tex(cp), roughness: 0.8 })); peg.position.set(-6.84, 2.2, -1); peg.rotation.y = Math.PI / 2; garage.add(peg);
  // red neon sign, back wall
  const [cs, gs] = canvas(1024, 256); gs.fillStyle = '#100404'; gs.fillRect(0, 0, 1024, 256);
  gs.font = '150px Lalezar'; gs.textAlign = 'center'; gs.direction = 'rtl'; gs.shadowColor = '#ff2020'; gs.shadowBlur = 36; gs.fillStyle = '#ff5a48'; gs.fillText('مركز العالمي', 512, 185);
  const nt = tex(cs); const neon = new THREE.Mesh(new THREE.PlaneGeometry(5, 1.25), new THREE.MeshStandardMaterial({ map: nt, emissive: 0xffffff, emissiveMap: nt, emissiveIntensity: 3 })); neon.position.set(0, 3.2, -7.83); garage.add(neon);
  const nl = new THREE.PointLight(0xff2a18, 25, 10, 1.5); nl.position.set(0, 3.0, -7); garage.add(nl); gLights.push([nl, 25]);
  // tire stacks
  const tireM = new THREE.MeshStandardMaterial({ color: 0x141414, roughness: 0.85 });
  for (const [x, z, n] of [[-5.6, -6.5, 6], [-4.6, -6.6, 4], [5.5, -6.3, 7], [5.6, 4.5, 5], [-5.8, 5.5, 3]]) for (let k = 0; k < n; k++) { const t = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.13, 8, 16), tireM); t.rotation.x = Math.PI / 2; t.position.set(x + (r() - .5) * 0.06, 0.13 + k * 0.26, z); t.castShadow = true; garage.add(t); }
  // workbench + oil drums
  box(2.6, 0.9, 0.8, new THREE.MeshStandardMaterial({ map: plainTex(97, '#5a4632'), roughness: 0.8 }), -6.3, 0.45, -3.2, garage);
  for (const [x, z, col] of [[5.9, -1.5, 0x1e4a8a], [5.8, -0.7, 0xa8281a], [6.0, 0.2, 0x2a5a2a]]) { const d = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.9, 16), new THREE.MeshStandardMaterial({ color: col, roughness: 0.5, metalness: 0.4 })); d.position.set(x, 0.45, z); d.castShadow = true; garage.add(d); }
  // fluorescent tubes
  for (const [x, z] of [[-2.5, -3], [2.5, -3], [-2.5, 3.5], [2.5, 3.5]]) {
    const tube = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.06, 1.6), new THREE.MeshStandardMaterial({ emissive: 0xd8ffe8, emissiveIntensity: 7, color: 0xffffff })); tube.position.set(x, 4.35, z); garage.add(tube);
    const pl = new THREE.PointLight(0xd0f0e0, 12, 9, 1.5); pl.position.set(x, 4.0, z); if (z > 0 && x > 0) { pl.castShadow = true; pl.shadow.mapSize.set(1024, 1024); pl.shadow.bias = -0.002; } garage.add(pl); gLights.push([pl, 12]);
  }
}

// ---------- the car (old beige sedan, hood open) ----------
const CAR = new THREE.Group(); garage.add(CAR); CAR.position.set(0, 0, -1.3);
const carPaint = new THREE.MeshStandardMaterial({ map: plainTex(61, '#b8ac8a'), roughness: 0.45, metalness: 0.35, envMapIntensity: 1.2 });
let hood;
{
  const glass = new THREE.MeshStandardMaterial({ color: 0x101418, roughness: 0.05, metalness: 0.9 });
  const chrome = new THREE.MeshStandardMaterial({ color: 0xcccccc, roughness: 0.2, metalness: 1 });
  const taper = (w, h, d, sx, sz, mat) => { const geo = new THREE.BoxGeometry(w, h, d); const p = geo.attributes.position; for (let i = 0; i < p.count; i++) if (p.getY(i) > 0) { p.setX(i, p.getX(i) * sx); p.setZ(i, p.getZ(i) * sz); } geo.computeVertexNormals(); const m = new THREE.Mesh(geo, mat); m.castShadow = true; return m; };
  box(1.62, 0.5, 3.9, carPaint, 0, 0.6, 0, CAR);
  box(1.62, 0.14, 1.1, M.dark, 0, 0.86, 1.35, CAR); // open engine bay
  const eng = box(0.7, 0.3, 0.6, M.metal, 0, 0.98, 1.35, CAR);
  const cab = taper(1.5, 0.52, 2.0, 0.86, 0.78, glass); cab.position.set(0, 1.11, -0.25); CAR.add(cab);
  box(1.32, 0.05, 1.6, carPaint, 0, 1.38, -0.25, CAR);
  box(1.62, 0.12, 1.3, carPaint, 0, 0.88, -1.4, CAR);
  hood = new THREE.Group(); hood.position.set(0, 0.9, 0.78); CAR.add(hood);
  box(1.58, 0.05, 1.15, carPaint, 0, 0, 0.575, hood); hood.rotation.x = -1.05;
  box(1.7, 0.12, 0.12, chrome, 0, 0.4, 1.98, CAR); box(1.7, 0.12, 0.12, chrome, 0, 0.4, -1.98, CAR);
  for (const s of [-1, 1]) { const hl = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.05, 12), chrome); hl.rotation.x = Math.PI / 2; hl.position.set(s * 0.55, 0.7, 1.96); CAR.add(hl); }
  for (const [x, z] of [[-0.78, 1.25], [0.78, 1.25], [-0.78, -1.25], [0.78, -1.25]]) { const w = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.2, 18), new THREE.MeshStandardMaterial({ color: 0x151515, roughness: 0.9 })); w.rotation.z = Math.PI / 2; w.position.set(x, 0.32, z); w.castShadow = true; CAR.add(w); }
}
const ENGINE_W = () => CAR.localToWorld(V(0, 1.15, 1.35));


garage.position.x = 0; // keyframes: garage at the origin
const GXL = 0;
scene.fog.density = 0.006;
scene.add(new THREE.HemisphereLight(0x8090a8, 0x3a2e22, 0.8));
{
  const [c, g] = canvas(512, 256); const gr = g.createLinearGradient(0, 0, 0, 256); gr.addColorStop(0, '#3a3a38'); gr.addColorStop(1, '#2a2420'); g.fillStyle = gr; g.fillRect(0, 0, 512, 256);
  const t = tex(c); t.mapping = THREE.EquirectangularReflectionMapping; scene.background = new THREE.Color(0x1a1612);
  const pm = new THREE.PMREMGenerator(renderer); scene.updateMatrixWorld(true);
  scene.environment = pm.fromScene(scene, 0.02, 0.1, 100).texture; scene.environmentIntensity = 0.45;
}
// the car is swapped for the tuk-tuk in this story
CAR.visible = false;
// ---------- tuk-tuk with an "AI" tablet on the dashboard ----------
const TUK = new THREE.Group(); garage.add(TUK); TUK.position.set(0.2, 0, -1.6); TUK.rotation.y = 0.35;
const tabletC = document.createElement('canvas'); tabletC.width = 256; tabletC.height = 160; const tg = tabletC.getContext('2d');
function drawTablet(face) {
  tg.fillStyle = '#071a12'; tg.fillRect(0, 0, 256, 160); tg.strokeStyle = '#4dffa6'; tg.fillStyle = '#4dffa6'; tg.lineWidth = 10; tg.lineCap = 'round';
  tg.beginPath(); tg.arc(85, 65, 12, 0, 7); tg.fill(); tg.beginPath(); tg.arc(171, 65, 12, 0, 7); tg.fill();
  tg.beginPath(); if (face === 'talk') tg.ellipse(128, 115, 26, 16, 0, 0, 7); else tg.arc(128, 95, 38, 0.25, Math.PI - 0.25); tg.stroke();
  tabletT.needsUpdate = true;
}
const tabletT = new THREE.CanvasTexture(tabletC); tabletT.colorSpace = THREE.SRGBColorSpace;
{
  const red = new THREE.MeshStandardMaterial({ map: plainTex(71, '#9a1c16'), roughness: 0.45, metalness: 0.25 });
  const black = new THREE.MeshStandardMaterial({ color: 0x141414, roughness: 0.85 });
  const chrome = new THREE.MeshStandardMaterial({ color: 0xcccccc, roughness: 0.2, metalness: 1 });
  const taper = (w, h, d, sx, sz, m) => { const geo = new THREE.BoxGeometry(w, h, d, 3, 3, 3); const p = geo.attributes.position; for (let i = 0; i < p.count; i++) if (p.getY(i) > 0) { p.setX(i, p.getX(i) * sx); p.setZ(i, p.getZ(i) * sz); } geo.computeVertexNormals(); const o = new THREE.Mesh(geo, m); o.castShadow = o.receiveShadow = true; return o; };
  const front = taper(1.1, 1.0, 0.6, 0.8, 0.6, red); front.position.set(0, 0.85, 1.0); TUK.add(front);
  box(1.25, 0.45, 1.7, red, 0, 0.55, -0.2, TUK);
  box(1.3, 0.08, 2.1, black, 0, 1.85, -0.05, TUK);
  for (const [x, z] of [[-0.6, 0.7], [0.6, 0.7], [-0.6, -0.95], [0.6, -0.95]]) box(0.04, 1.1, 0.04, chrome, x, 1.3, z, TUK);
  box(1.2, 0.5, 0.06, black, 0, 1.0, -1.0, TUK);
  const ws = new THREE.Mesh(new THREE.PlaneGeometry(0.95, 0.6), new THREE.MeshStandardMaterial({ color: 0x223, roughness: 0.05, metalness: 0.8, transparent: true, opacity: 0.5 })); ws.position.set(0, 1.55, 0.75); ws.rotation.x = -0.2; TUK.add(ws);
  const tab = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.19), new THREE.MeshStandardMaterial({ map: tabletT, emissive: 0xffffff, emissiveMap: tabletT, emissiveIntensity: 1.4 })); tab.scale.set(1.5, 1.5, 1); tab.position.set(0, 1.08, 1.335); TUK.add(tab);
  box(0.48, 0.32, 0.02, black, 0, 1.08, 1.322, TUK);
  const hl = new THREE.Mesh(new THREE.CircleGeometry(0.1, 20), new THREE.MeshStandardMaterial({ emissive: 0xfff2c8, emissiveIntensity: 2.2 })); hl.position.set(0, 0.62, 1.33); hl.scale.setScalar(0.7); TUK.add(hl);
  const wheel = (x, z) => { const w = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.14, 18), new THREE.MeshStandardMaterial({ color: 0x151515, roughness: 0.9 })); w.rotation.z = Math.PI / 2; w.position.set(x, 0.24, z); w.castShadow = true; TUK.add(w); };
  wheel(0, 1.15); wheel(-0.62, -0.6); wheel(0.62, -0.6);
  // evil-eye charm and a plastic flower on the mirror
  const eye = new THREE.Mesh(new THREE.SphereGeometry(0.035, 12, 10), new THREE.MeshStandardMaterial({ color: 0x1a4ad0, roughness: 0.2 })); eye.position.set(0.25, 1.55, 0.7); TUK.add(eye);
  const tl = new THREE.PointLight(0x4dffa6, 2.5, 2.5, 1.5); tl.position.set(0, 1.35, 1.0); TUK.add(tl);
}
drawTablet('smile');

// ---------- characters (drawn in code) ----------
const skinTan = 0xb07a55, skinBestem = 0xa0684a;
const leather = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.48, metalness: 0.1, map: (() => { const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, 256, 256); for (let i = 0; i < 3000; i++) { g.fillStyle = `rgba(0,0,0,${Math.random() * 0.15})`; g.fillRect(Math.random() * 256, Math.random() * 256, 2, 1); } const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; })() });
const knit = new THREE.MeshStandardMaterial({ color: 0x24242a, roughness: 0.95 });
const greyPants = new THREE.MeshStandardMaterial({ color: 0x55585f, roughness: 0.75 });
const blackShoe = new THREE.MeshStandardMaterial({ color: 0x0a0a0c, roughness: 0.2, metalness: 0.2 });
const navy = new THREE.MeshStandardMaterial({ color: 0x1f2f55, roughness: 0.85, map: plainTex(301, '#ffffff') });
const tshirt = new THREE.MeshStandardMaterial({ color: 0x2a2a2c, roughness: 0.9 });
const boot = new THREE.MeshStandardMaterial({ color: 0x3a2618, roughness: 0.7 });
const alamy = buildChar({ skin: skinTan, hair: 'crop', outfit: 'jacket', jacketM: leather, inner: knit, pantsM: greyPants, shoeM: blackShoe, lid: 0.32, iris: 0x2a170c, faceW: 0.9, jawW: 0.96, noseR: 0.019, lip: 0x9c6250 });
const bestem = buildChar({ skin: skinBestem, hair: 'curly', build: 'chubby', outfit: 'overalls', overallM: navy, inner: navy, sleeveM: tshirt, pantsM: navy, shoeM: boot, mustache: true, lid: 0.05, iris: 0x24140a, faceW: 1.0, jawW: 1.08, noseR: 0.024, browT: 0.0075 });
for (const c of [alamy, bestem]) { garage.add(c.root); }
// a phone for El-Alamy
const phone = new THREE.Group();
{ box(0.075, 0.15, 0.009, new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.3, metalness: 0.5 }), 0, 0, 0, phone);
  const sc = new THREE.Mesh(new THREE.PlaneGeometry(0.066, 0.135), new THREE.MeshStandardMaterial({ color: 0x000000, emissive: 0x6ad8ff, emissiveIntensity: 1.2 })); sc.position.z = 0.0051; phone.add(sc);
  const pl = new THREE.PointLight(0x8ad8ff, 0.8, 0.8, 1.5); pl.position.z = 0.1; phone.add(pl); }

// ---------- posing helpers ----------
const R = (g, x = 0, y = 0, z = 0) => g.rotation.set(x, y, z);
function rest(c) {
  c.spine.rotation.set(0, 0, 0); c.neck.rotation.set(0, 0, 0); c.head.rotation.set(0, 0, 0);
  for (const a of c.arms) { R(a.sh, 0, 0, a.s * 0.08); R(a.el, -0.2); R(a.wr); a.fingers.forEach(f => R(f, 0.2)); }
  for (const l of c.legs) { R(l.hp); R(l.kn); R(l.an); }
  c.hips.position.y = 0.96; c.setFace({});
}
const L = (c) => c.arms[0], Rt = (c) => c.arms[1], LL = (c) => c.legs[0], RL = (c) => c.legs[1];

// ---------- the 8 key frames ----------
const KF = {
  k1_bestem_run: () => { // Bestem bursting in toward camera, panicked
    rest(bestem); bestem.root.position.set(-0.6, 0, 3.2); bestem.root.rotation.y = 0.15; alamy.root.visible = false;
    bestem.spine.rotation.x = 0.18; R(L(bestem).sh, -1.1, 0, 0.5); R(L(bestem).el, -1.0); R(Rt(bestem).sh, 0.7, 0, -0.25); R(Rt(bestem).el, -0.9);
    R(LL(bestem).hp, 0.55); R(LL(bestem).kn, -0.5); R(RL(bestem).hp, -0.45); R(RL(bestem).kn, -0.9);
    bestem.hips.position.y = 0.92; bestem.setFace({ open: 1.0, brow: 1.0, browTilt: 0.25, lid: -0.1 });
    return { pos: V(-0.4, 1.0, 5.9), look: V(-0.55, 1.15, 3.0), fov: 48 };
  },
  k2_tuktuk: () => { alamy.root.visible = false; bestem.root.visible = false; drawTablet('talk'); return { pos: V(1.25, 1.2, 1.25), look: V(0.62, 1.02, -0.42), fov: 46 }; },
  k3_alamy: () => {
    rest(alamy); alamy.root.position.set(1.3, 0, 1.6); alamy.root.rotation.y = -0.35; bestem.root.visible = false;
    R(L(alamy).sh, 0.1, 0, 0.12); R(Rt(alamy).sh, 0.35, 0, -0.35); R(Rt(alamy).el, -1.5); alamy.head.rotation.set(-0.05, 0.12, 0.06);
    alamy.setFace({ open: 0.1, brow: 0.2, browTilt: -0.15, lid: 0.42 });
    return { pos: V(1.0, 1.55, 3.05), look: V(1.25, 1.5, 1.6), fov: 38 };
  },
  k4_bestem_cu: () => {
    rest(bestem); bestem.root.position.set(-1.0, 0, 2.4); bestem.root.rotation.y = 0.2; alamy.root.visible = false;
    R(L(bestem).sh, -0.6, 0, 0.3); R(L(bestem).el, -1.7); R(Rt(bestem).sh, -0.6, 0, -0.3); R(Rt(bestem).el, -1.7);
    bestem.head.rotation.set(0.05, 0, -0.05); bestem.setFace({ open: 0.55, brow: 1.2, browTilt: 0.3, lid: -0.25 });
    return { pos: V(-0.85, 1.6, 3.55), look: V(-1.0, 1.55, 2.4), fov: 40 };
  },
  k5_alamy_phone: () => {
    rest(alamy); alamy.root.position.set(1.3, 0, 1.6); alamy.root.rotation.y = -0.25; bestem.root.visible = false;
    R(Rt(alamy).sh, -0.75, 0, 0.15); R(Rt(alamy).el, -1.35);
    alamy.root.updateMatrixWorld(true); const hp = Rt(alamy).hand.getWorldPosition(V(0, 0, 0)).add(V(0.0, -0.02, 0.03));
    alamy.root.add(phone); phone.position.copy(alamy.root.worldToLocal(hp)); phone.rotation.set(-0.7, 0.25, 0);
    alamy.head.rotation.set(0.35, 0.0, 0); alamy.setFace({ open: 0.0, brow: -0.2, lid: 0.55 });
    return { pos: V(1.0, 1.5, 2.7), look: V(1.25, 1.42, 1.6), fov: 40 };
  },
  k6_bestem_angry: () => {
    rest(bestem); bestem.root.position.set(-1.0, 0, 2.4); bestem.root.rotation.y = 0.45; alamy.root.visible = false;
    R(Rt(bestem).sh, -1.35, 0.2, 0.05); R(Rt(bestem).el, -0.2); Rt(bestem).fingers.forEach((f, i) => R(f, i === 0 ? 0 : 1.6));
    R(L(bestem).sh, 0.1, 0, 0.55); R(L(bestem).el, -1.4); bestem.spine.rotation.x = 0.1;
    bestem.setFace({ open: 0.85, brow: -0.6, browTilt: -0.35, lid: 0.25 });
    return { pos: V(-0.55, 1.45, 4.0), look: V(-0.95, 1.45, 2.4), fov: 42 };
  },
  k7_alamy_smug: () => {
    rest(alamy); alamy.root.position.set(1.3, 0, 1.6); alamy.root.rotation.y = -0.15; bestem.root.visible = false;
    for (const a of [L(alamy), Rt(alamy)]) { R(a.sh, -0.35, 0, a.s * 0.15); R(a.el, -1.9); }
    alamy.head.rotation.set(-0.08, -0.1, 0.05); alamy.setFace({ open: 0.05, brow: 0.35, browTilt: -0.2, lid: 0.48 });
    return { pos: V(1.2, 1.6, 2.55), look: V(1.28, 1.6, 1.6), fov: 36 };
  },
  k8_wide: () => {
    rest(alamy); rest(bestem); alamy.root.position.set(1.4, 0, 1.4); alamy.root.rotation.y = -0.3; bestem.root.position.set(-0.9, 0, 1.6); bestem.root.rotation.y = 0.4;
    R(Rt(alamy).sh, 0.35, 0, -0.35); R(Rt(alamy).el, -1.5); alamy.setFace({ lid: 0.42, brow: 0.2 });
    for (const a of bestem.arms) { R(a.sh, -0.3, 0, a.s * 0.5); R(a.el, -2.0); } bestem.setFace({ open: 0.6, brow: 1.1, browTilt: 0.3, lid: -0.2 });
    return { pos: V(0.4, 1.7, 6.6), look: V(0.25, 1.05, 0.3), fov: 50 };
  },
};
// ---------- post ----------
const composer = new EffectComposer(renderer); composer.setSize(W, H);
composer.addPass(new RenderPass(scene, camera));
const gtao = new GTAOPass(scene, camera, W, H); gtao.blendIntensity = 0.8; gtao.updateGtaoMaterial({ radius: 0.5, distanceExponent: 1.5, thickness: 1.5, scale: 1.0 });
{ const ov = gtao.overrideVisibility.bind(gtao); gtao.overrideVisibility = function () { ov(); scene.traverse(o => { if (o.isSprite) o.visible = false; }); }; }
composer.addPass(gtao);
const bloom = new UnrealBloomPass(new THREE.Vector2(W, H), 0.45, 0.6, 0.82); composer.addPass(bloom);
composer.addPass(new OutputPass());
const gradePass = new ShaderPass({
  uniforms: { tDiffuse: { value: null }, uTime: { value: 0 }, uSeed: { value: 0 }, uFail: { value: 0 }, uVhs: { value: 0 } },
  vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
  fragmentShader: `
    uniform sampler2D tDiffuse; uniform float uTime, uSeed, uFail, uVhs; varying vec2 vUv;
    float hash(vec2 p){ return fract(sin(dot(p, vec2(12.9898,78.233)) + uSeed*7.13) * 43758.5453); }
    void main(){
      vec2 uv = vUv;
      // VHS rewind: tracking wobble + tear lines
      float band = step(0.985, fract(uv.y*3.0 - uTime*0.9));
      uv.x += uVhs * (sin(uv.y*80.0 + uTime*30.0)*0.004 + band*0.03 + (hash(vec2(floor(uv.y*90.0), uTime))-0.5)*0.01);
      vec2 cc = uv - 0.5; float ca = 0.0016 + 0.003*dot(cc,cc)*4.0 + uVhs*0.006;
      vec3 col = vec3(texture2D(tDiffuse, uv + cc*ca*2.0).r, texture2D(tDiffuse, uv).g, texture2D(tDiffuse, uv - cc*ca*2.0).b);
      vec3 blur = vec3(0.0); for(int i=0;i<8;i++){ float a=float(i)*0.785; blur += texture2D(tDiffuse, uv + vec2(cos(a),sin(a)*0.5625)*0.008).rgb; } blur/=8.0;
      col = max(col, mix(col, blur, 0.3));
      float lum = dot(col, vec3(0.299,0.587,0.114));
      col = mix(vec3(lum)*vec3(1.08,1.0,0.86), col, mix(0.6, 0.15, uFail));
      col *= mix(vec3(0.88,0.97,1.0), vec3(1.07,0.99,0.84), smoothstep(0.08,0.7,lum));
      col += vec3(0.018,0.02,0.014)*(1.0-lum);
      col = mix(col, col*col*(3.0-2.0*col), 0.45);
      col = mix(col, col*vec3(1.15,0.6,0.55), uFail*0.35);
      col = mix(col, vec3(dot(col,vec3(0.33)))*vec3(0.9,1.0,1.1), uVhs*0.5);
      float v = smoothstep(1.0, 0.3, length(cc*vec2(1.0,0.75))); col *= mix(0.5, 1.0, v);
      col += (hash(uv*vec2(720.0,1280.0) + uTime)-0.5)*(0.055 + uVhs*0.15);
      col += band*uVhs*0.25;
      gl_FragColor = vec4(clamp(col,0.0,1.0),1.0);
    }` });
composer.addPass(gradePass);

const out = document.getElementById('out'); const og = out.getContext('2d');
const depthMat = new THREE.MeshDepthMaterial();
window.renderKF = (id, mode) => {
  alamy.root.visible = true; bestem.root.visible = true; drawTablet('smile'); if (phone.parent) phone.parent.remove(phone);
  const c = KF[id]();
  camera.position.copy(c.pos); camera.fov = c.fov; camera.updateProjectionMatrix(); camera.lookAt(c.look);
  gradePass.uniforms.uTime.value = 1; gradePass.uniforms.uSeed.value = 3; gradePass.uniforms.uFail.value = 0; gradePass.uniforms.uVhs.value = 0;
  if (mode === 'depth') {
    const far0 = camera.far, near0 = camera.near; camera.near = 0.3; camera.far = 9; camera.updateProjectionMatrix();
    const bg = scene.background, fog = scene.fog; scene.background = new THREE.Color(0x000000); scene.fog = null; scene.overrideMaterial = depthMat;
    const sprites = []; scene.traverse(o => { if (o.isSprite && o.visible) { sprites.push(o); o.visible = false; } });
    renderer.toneMapping = THREE.NoToneMapping; renderer.setRenderTarget(null); renderer.render(scene, camera);
    renderer.toneMapping = THREE.ACESFilmicToneMapping; scene.overrideMaterial = null; scene.background = bg; scene.fog = fog; sprites.forEach(o => o.visible = true);
    camera.near = near0; camera.far = far0; camera.updateProjectionMatrix();
  } else composer.render();
  og.drawImage(renderer.domElement, 0, 0);
  return out.toDataURL('image/png');
};
window.KF_IDS = Object.keys(KF);
window.READY = true;
