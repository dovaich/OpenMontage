// El-Alamy — "mission" look test. 42.6 s, 24 fps, 720x1280 (upscaled to 1080x1920). Free local render.
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { GTAOPass } from 'three/addons/postprocessing/GTAOPass.js';

const W = 720, H = 1280;
const Q = new URLSearchParams(location.search);
const TL = await (await fetch('timeline.json')).json();
const MOUTH = await (await fetch('mouth.json')).json();
const BOOM = 30.4, END = 42.6;

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

// =====================================================================
// EXTERIOR: Cairo back street at night, the service center glowing at the end
// =====================================================================
const street = new THREE.Group(); scene.add(street);
function facade(seed, cols, floors, base) {
  const r = rng(seed), CW = 128, FH = 128;
  const [c, g] = canvas(cols * CW, floors * FH); const [ce, ge] = canvas(cols * CW, floors * FH);
  ge.fillStyle = '#000'; ge.fillRect(0, 0, ce.width, ce.height);
  g.fillStyle = base; g.fillRect(0, 0, c.width, c.height);
  speckle(g, c.width, c.height, r, 9000, ['#000', '#fff', '#5a4630', '#c8b090'], 0.10, 3);
  for (let f = 0; f < floors; f++) {
    const y0 = c.height - (f + 1) * FH;
    g.fillStyle = 'rgba(255,245,225,0.18)'; g.fillRect(0, y0 + FH - 10, c.width, 6);
    for (let k = 0; k < cols; k++) {
      const x0 = k * CW;
      if (f === 0) { const sx = x0 + 10, sw = CW - 20, sy = y0 + 18, sh = FH - 22; g.fillStyle = `rgb(${80 + r() * 30},${82 + r() * 25},${80 + r() * 20})`; g.fillRect(sx, sy, sw, sh); for (let yy = sy; yy < sy + sh; yy += 5) { g.fillStyle = 'rgba(0,0,0,0.35)'; g.fillRect(sx, yy, sw, 1.5); } continue; }
      const ww = 52, wh = 74, wx = x0 + (CW - ww) / 2, wy = y0 + 22;
      g.fillStyle = 'rgba(240,225,200,0.4)'; g.fillRect(wx - 6, wy - 6, ww + 12, wh + 12);
      if (r() < 0.3) { const col = r() < .75 ? `rgb(255,${170 + r() * 50},${70 + r() * 50})` : `rgb(${190 + r() * 40},255,${220 + r() * 30})`; g.fillStyle = col; g.fillRect(wx, wy, ww, wh); ge.fillStyle = col; ge.fillRect(wx, wy, ww, wh); g.fillStyle = 'rgba(80,40,20,0.55)'; ge.fillStyle = 'rgba(0,0,0,0.6)'; const cw = 8 + r() * 14; g.fillRect(wx, wy, cw, wh); ge.fillRect(wx, wy, cw, wh); }
      else { g.fillStyle = '#1a1d22'; g.fillRect(wx, wy, ww, wh); }
      if (r() < 0.5) { g.fillStyle = ['#3d4a32', '#5a3b22', '#2f4440'][(r() * 3) | 0]; g.fillRect(wx - 22, wy - 2, 18, wh + 4); g.fillRect(wx + ww + 4, wy - 2, 18, wh + 4); }
    }
  }
  stains(g, c.width, c.height, r, 40);
  return { map: tex(c), emissive: tex(ce) };
}
const HALF = 4.1;
{
  const [c, g] = canvas(1024, 1024); const r = rng(7);
  g.fillStyle = '#2b2926'; g.fillRect(0, 0, 1024, 1024); speckle(g, 1024, 1024, r, 50000, ['#000', '#5a5650', '#777068'], 0.35, 2.5);
  const [cr, gr] = canvas(1024, 1024); gr.fillStyle = '#ccc'; gr.fillRect(0, 0, 1024, 1024);
  for (let i = 0; i < 10; i++) { const x = r() * 1024, y = r() * 1024, rx = 40 + r() * 120, ry = 20 + r() * 70; for (const [gg, col] of [[g, 'rgba(10,10,12,0.55)'], [gr, '#0a0a0a']]) { gg.fillStyle = col; gg.beginPath(); gg.ellipse(x, y, rx, ry, r() * 3, 0, 7); gg.fill(); } }
  const road = new THREE.Mesh(new THREE.PlaneGeometry(6, 120), new THREE.MeshStandardMaterial({ map: tex(c, true, [1, 6]), roughnessMap: tex(cr, false, [1, 6]), roughness: 1, envMapIntensity: 1.6 }));
  road.rotation.x = -Math.PI / 2; road.position.set(0, 0, -45); road.receiveShadow = true; street.add(road);
  for (const s of [-1, 1]) box(1.1, 0.16, 120, M.concrete, s * 3.55, 0.08, -45, street, false);
  const rB = rng(2024); const BASES = ['#b79a6e', '#a88a64', '#c2a57a', '#9c8a72', '#b08a62', '#8f7a66'];
  for (const side of [-1, 1]) {
    let z = 12; let s = side > 0 ? 50 : 1;
    while (z > -90) {
      const len = 7 + rB() * 6, floors = 4 + ((rB() * 4) | 0); s++;
      const isShop = side > 0 && z < -18 && z - len > -40 && !street.userData.shop;
      if (isShop) street.userData.shop = { z0: z, len };
      const fac = facade(s, Math.max(2, Math.round(len / 2.2)), isShop ? floors - 1 : floors, BASES[s % BASES.length]);
      const face = new THREE.MeshStandardMaterial({ map: fac.map, emissiveMap: fac.emissive, emissive: 0xffffff, emissiveIntensity: 1.6, roughness: 0.92 });
      const other = M.plaster(s + 1, BASES[s % BASES.length]); const mats = [other, other, other, other, other, other]; mats[side < 0 ? 0 : 1] = face;
      const y0 = isShop ? 3.2 : 0, Hh = floors * 3;
      const b = new THREE.Mesh(new THREE.BoxGeometry(10, Hh - y0, len), mats); b.position.set(side * (HALF + 5), y0 + (Hh - y0) / 2, z - len / 2); b.castShadow = b.receiveShadow = true; street.add(b);
      z -= len;
    }
  }
  // the service center: lit opening + red neon sign
  const sh = street.userData.shop; const zc = sh.z0 - sh.len / 2;
  const inside = new THREE.Mesh(new THREE.BoxGeometry(6, 3.2, sh.len), new THREE.MeshStandardMaterial({ color: 0x8a9a90, emissive: 0xc8e8d8, emissiveIntensity: 0.55, side: THREE.BackSide, roughness: 1 }));
  inside.position.set(HALF + 3, 1.6, zc); street.add(inside);
  const [cs, gs] = canvas(1024, 192); gs.fillStyle = '#120404'; gs.fillRect(0, 0, 1024, 192);
  gs.font = '120px Lalezar'; gs.textAlign = 'center'; gs.direction = 'rtl'; gs.shadowColor = '#ff2020'; gs.shadowBlur = 30; gs.fillStyle = '#ff5040'; gs.fillText('مركز العالمي للصيانة', 512, 135);
  const neonT = tex(cs);
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(6.0, 1.12), new THREE.MeshStandardMaterial({ map: neonT, emissive: 0xffffff, emissiveMap: neonT, emissiveIntensity: 3.2 }));
  sign.position.set(HALF - 0.05, 3.9, zc); sign.rotation.y = -Math.PI / 2; street.add(sign);
  const nl = new THREE.PointLight(0xff3020, 30, 14, 1.6); nl.position.set(HALF - 1.0, 3.6, zc); street.add(nl);
  const il = new THREE.PointLight(0xc8ffe0, 20, 12, 1.6); il.position.set(HALF - 0.5, 1.8, zc); street.add(il);
  street.userData.shopZ = zc;
  // wires
  const r4 = rng(404);
  for (let i = 0; i < 24; i++) { const z1 = 8 - r4() * 70, a = V(-HALF, 5 + r4() * 6, z1), b2 = V(HALF, 5 + r4() * 6, z1 + (r4() - .5) * 6), mid = a.clone().lerp(b2, 0.5); mid.y -= 0.4 + r4(); street.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(a, mid, b2), 16, 0.014, 4), M.wire)); }
  // street lamps
  for (const [side, z] of [[-1, 2], [1, -10], [-1, -22], [1, -34]]) {
    const x = side * (HALF - 0.05);
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.1, 10, 8), new THREE.MeshStandardMaterial({ emissive: 0xffa040, emissiveIntensity: 14 })); bulb.position.set(x - side * 1.2, 5.0, z); street.add(bulb);
    box(1.3, 0.06, 0.06, M.metal, x - side * 0.65, 5.15, z, street, false);
    const sp = new THREE.SpotLight(0xff9a3c, 60, 22, 0.95, 0.65, 1.7); sp.position.set(x - side * 1.2, 4.9, z); sp.target.position.set(x - side * 2.5, 0, z); sp.castShadow = z > -12; if (sp.castShadow) sp.shadow.mapSize.set(1024, 1024);
    street.add(sp); street.add(sp.target);
  }
  // minaret in the haze
  const mm = new THREE.MeshStandardMaterial({ color: 0x4a3c30, roughness: 1 }); const g2 = new THREE.Group();
  [[new THREE.CylinderGeometry(1.4, 1.6, 18, 8), 9], [new THREE.CylinderGeometry(2.2, 1.4, 1, 8), 18.5], [new THREE.CylinderGeometry(1.0, 1.2, 9, 8), 23.5], [new THREE.CylinderGeometry(0.7, 0.8, 5, 8), 31], [new THREE.SphereGeometry(0.8, 8, 6), 34]].forEach(([geo, y]) => { const m = new THREE.Mesh(geo, mm); m.position.y = y; g2.add(m); });
  g2.position.set(-2, 0, -100); street.add(g2);
}

// =====================================================================
// GARAGE INTERIOR (offset far away on x)
// =====================================================================
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

// ---------- particles ----------
const soft = (() => { const [c, g] = canvas(128, 128); const gr = g.createRadialGradient(64, 64, 4, 64, 64, 62); gr.addColorStop(0, 'rgba(255,255,255,0.9)'); gr.addColorStop(0.5, 'rgba(255,255,255,0.35)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); g.globalCompositeOperation = 'source-atop'; const r = rng(6); for (let i = 0; i < 160; i++) { g.fillStyle = `rgba(0,0,0,${r() * 0.1})`; g.beginPath(); g.arc(64 + (r() - .5) * 80, 64 + (r() - .5) * 80, 2 + r() * 8, 0, 7); g.fill(); } return new THREE.CanvasTexture(c); })();
const PR = rng(321);
function makeSprites(n, color, additive, opts) { const arr = []; for (let i = 0; i < n; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: soft, color, transparent: true, depthWrite: false, opacity: 0, blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending })); s.userData = opts(i); scene.add(s); arr.push(s); } return arr; }
const engSmoke = makeSprites(45, 0x8a8682, false, i => ({ t0: 9.0 + PR() * 21.4, life: 2.2 + PR(), vx: (PR() - .5) * 0.4, vy: 0.5 + PR() * 0.4, vz: (PR() - .2) * 0.4, s0: 0.25 }));
const fireball = makeSprites(22, 0xffa040, true, i => ({ t0: BOOM + PR() * 0.2, life: 0.5 + PR() * 0.6, v: V((PR() - .5) * 6, 1 + PR() * 4, (PR() - .3) * 6), s0: 0.6 }));
const blackSmoke = makeSprites(40, 0x1c1a18, false, i => ({ t0: BOOM + 0.15 + PR() * 12, life: 3 + PR() * 2, vx: (PR() - .5) * 0.6, vy: 0.8 + PR() * 0.8, vz: (PR() - .5) * 0.6, s0: 0.6 }));
const flames = makeSprites(22, 0xff7a20, true, i => ({ off: V((PR() - .5) * 1.4, 0.9 + PR() * 0.5, (PR() - .5) * 3.0), ph: PR() * 6, sp: 6 + PR() * 6, s: 0.6 + PR() * 0.7 }));
const debris = []; for (let i = 0; i < 26; i++) { const d = new THREE.Mesh(new THREE.BoxGeometry(0.05 + PR() * 0.15, 0.03 + PR() * 0.06, 0.05 + PR() * 0.2), PR() < .5 ? carPaint : M.dark); d.userData = { v: V((PR() - .5) * 9, 2 + PR() * 6, (PR() - .3) * 9), w: V(PR() * 10, PR() * 10, PR() * 10) }; d.visible = false; d.castShadow = true; scene.add(d); debris.push(d); }
const boomLight = new THREE.PointLight(0xff8a30, 0, 25, 1.4); scene.add(boomLight);
const fireLight = new THREE.PointLight(0xff7a28, 0, 12, 1.6); scene.add(fireLight);
const screenLight = new THREE.PointLight(0x7af0c0, 0, 2.2, 1.5); scene.add(screenLight);

// ---------- lighting / sky / env ----------
scene.add(new THREE.HemisphereLight(0x8090a8, 0x3a2e22, 0.8));
const dusk = new THREE.DirectionalLight(0xffb27a, 0.6); dusk.position.set(-20, 30, -60); scene.add(dusk);
{
  const [c, g] = canvas(1024, 512); const gr = g.createLinearGradient(0, 0, 0, 512);
  gr.addColorStop(0, '#141a24'); gr.addColorStop(0.4, '#2a2e38'); gr.addColorStop(0.5, '#6a4a34'); gr.addColorStop(0.56, '#4a3a30'); gr.addColorStop(1, '#2a2420');
  g.fillStyle = gr; g.fillRect(0, 0, 1024, 512); const t = tex(c); t.mapping = THREE.EquirectangularReflectionMapping; scene.background = t;
  const pm = new THREE.PMREMGenerator(renderer);
  street.position.set(0, -1.6, 0); garage.visible = false; scene.updateMatrixWorld(true);
  scene.environment = pm.fromScene(scene, 0.02, 0.1, 200).texture; scene.environmentIntensity = 0.5;
  street.position.set(0, 0, 0); garage.visible = true;
}

// =====================================================================
// CHARACTERS: two Ready Player Me rigs driven by Mixamo (Xbot) clips
// =====================================================================
const loader = new GLTFLoader();
const [gA, gB, xbG] = await Promise.all([loader.loadAsync('models/readyplayer.me.glb'), loader.loadAsync('models/readyplayer.me.glb'), loader.loadAsync('models/Xbot.glb')]);
const sb = {}; xbG.scene.traverse(o => { if (o.isBone) sb[o.name.replace('mixamorig', '')] = o; });
const xbMixer = new THREE.AnimationMixer(xbG.scene);
const clips = Object.fromEntries(xbG.animations.map(a => [a.name, a]));
const act = {}; for (const n of ['idle', 'walk', 'agree', 'headShake']) { act[n] = xbMixer.clipAction(clips[n]); act[n].play(); act[n].setEffectiveWeight(0); }
xbG.scene.updateMatrixWorld(true);
const srcHipsRest = sb.Hips.getWorldPosition(V(0, 0, 0));
const srcRestQ = {}; for (const n in sb) srcRestQ[n] = sb[n].getWorldQuaternion(new THREE.Quaternion());

function hsl(r, g, b) { r /= 255; g /= 255; b /= 255; const mx = Math.max(r, g, b), mn = Math.min(r, g, b); const l = (mx + mn) / 2; let h = 0, s = 0; if (mx !== mn) { const d = mx - mn; s = l > .5 ? d / (2 - mx - mn) : d / (mx + mn); h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h /= 6; } return [h * 360, s, l]; }
function remap(material, fn, withAlpha = false) {
  const img = material.map.image; const [c, g] = canvas(img.width, img.height); g.drawImage(img, 0, 0);
  const d = g.getImageData(0, 0, c.width, c.height); const p = d.data; let ga, ad, ca;
  if (withAlpha) { [ca, ga] = canvas(c.width, c.height); ad = ga.createImageData(c.width, c.height); }
  const r = rng(1);
  for (let i = 0; i < p.length; i += 4) { const x = (i / 4) % c.width, y = ((i / 4) / c.width) | 0; const res = fn(p[i], p[i + 1], p[i + 2], x / c.width, y / c.height, r); p[i] = res[0]; p[i + 1] = res[1]; p[i + 2] = res[2]; if (withAlpha) { const a = res[3] ?? 255; ad.data[i] = ad.data[i + 1] = ad.data[i + 2] = a; ad.data[i + 3] = 255; } }
  g.putImageData(d, 0, 0); const flip = material.map.flipY;
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.flipY = flip; material.map = t;
  if (withAlpha) { ga.putImageData(ad, 0, 0); const at = new THREE.CanvasTexture(ca); at.flipY = flip; material.alphaMap = at; material.alphaTest = 0.5; }
  material.needsUpdate = true;
}
function trim(mesh, kill) { const g = mesh.geometry; const p = g.attributes.position; const idx = g.index.array; const keep = []; const a = V(0, 0, 0), b = V(0, 0, 0), c = V(0, 0, 0); for (let i = 0; i < idx.length; i += 3) { a.fromBufferAttribute(p, idx[i]).applyMatrix4(mesh.matrixWorld); b.fromBufferAttribute(p, idx[i + 1]).applyMatrix4(mesh.matrixWorld); c.fromBufferAttribute(p, idx[i + 2]).applyMatrix4(mesh.matrixWorld); if (!kill(a, b, c)) keep.push(idx[i], idx[i + 1], idx[i + 2]); } g.setIndex(keep); }

class Rig {
  constructor(gltf, look) {
    this.group = new THREE.Group(); scene.add(this.group);
    this.av = gltf.scene; this.group.add(this.av);
    this.meshes = {}; this.av.traverse(o => { if (o.isMesh) { this.meshes[o.name] = o; o.castShadow = true; o.receiveShadow = true; o.frustumCulled = false; } });
    this.av.updateMatrixWorld(true);
    look(this);
    this.tb = {}; this.av.traverse(o => { if (o.isBone) this.tb[o.name] = o; });
    this.order = []; const walk = (b) => { if (b.isBone && sb[b.name]) this.order.push(b.name); b.children.forEach(walk); }; walk(this.av);
    // align A-pose rest to the source T-pose
    const pref = { Hips: null, Spine2: 'Neck', LeftHand: 'LeftHandMiddle1', RightHand: 'RightHandMiddle1' };
    const wp = o => o.getWorldPosition(V(0, 0, 0));
    for (const n of this.order) {
      if ((n in pref) && !pref[n]) continue;
      const b = this.tb[n]; let cn = pref[n];
      if (!cn) { const ch = b.children.find(c => c.isBone && sb[c.name]); if (!ch) continue; cn = ch.name; }
      if (!sb[cn] || !this.tb[cn]) continue;
      const q = new THREE.Quaternion().setFromUnitVectors(wp(this.tb[cn]).sub(wp(b)).normalize(), wp(sb[cn]).sub(wp(sb[n])).normalize());
      const nw = q.multiply(b.getWorldQuaternion(new THREE.Quaternion()));
      b.quaternion.copy(b.parent.getWorldQuaternion(new THREE.Quaternion()).invert().multiply(nw)); b.updateMatrixWorld(true);
    }
    this.tgtRest = {}; for (const n of this.order) this.tgtRest[n] = this.tb[n].getWorldQuaternion(new THREE.Quaternion());
    this.hipsRest = this.tb.Hips.getWorldPosition(V(0, 0, 0)); this.hipRatio = this.hipsRest.y / srcHipsRest.y;
  }
  retarget() {
    this.group.updateMatrixWorld(true);
    const yq = this.group.getWorldQuaternion(new THREE.Quaternion());
    const sq = new THREE.Quaternion();
    for (const n of this.order) {
      const b = this.tb[n];
      sb[n].getWorldQuaternion(sq);
      const delta = sq.clone().multiply(srcRestQ[n].clone().invert());
      const tw = yq.clone().multiply(delta).multiply(this.tgtRest[n]);
      b.quaternion.copy(b.parent.getWorldQuaternion(new THREE.Quaternion()).invert().multiply(tw)); b.updateMatrixWorld(true);
      if (n === 'Hips') {
        const sp = sb.Hips.getWorldPosition(V(0, 0, 0)).sub(srcHipsRest);
        const desired = this.hipsRest.clone().add(V(sp.x * this.hipRatio, sp.y * this.hipRatio, 0));
        b.position.copy(b.parent.worldToLocal(this.group.localToWorld(desired))); b.updateMatrixWorld(true);
      }
    }
  }
  // point a bone (toward its child) along a character-space direction, blended by w
  aim(name, child, dir, w) {
    if (w <= 0) return; const b = this.tb[name], c = this.tb[child];
    const d = c.getWorldPosition(V(0, 0, 0)).sub(b.getWorldPosition(V(0, 0, 0))).normalize();
    const target = dir.clone().normalize().applyQuaternion(this.group.getWorldQuaternion(new THREE.Quaternion()));
    const bw = b.getWorldQuaternion(new THREE.Quaternion());
    const nw = new THREE.Quaternion().setFromUnitVectors(d, target).multiply(bw.clone());
    const fw = bw.clone().slerp(nw, w);
    b.quaternion.copy(b.parent.getWorldQuaternion(new THREE.Quaternion()).invert().multiply(fw)); b.updateMatrixWorld(true);
  }
  face(open, smile) { for (const k of ['Wolf3D_Head', 'Wolf3D_Teeth', 'Wolf3D_Beard']) { const m = this.meshes[k]; if (m && m.morphTargetInfluences) { m.morphTargetInfluences[m.morphTargetDictionary.mouthOpen] = clamp(open, 0, 1); m.morphTargetInfluences[m.morphTargetDictionary.mouthSmile] = clamp(smile, 0, 1); } } }
  soot(k) { if (!this.sootMats) { this.sootMats = []; this.group.traverse(o => { if (o.isMesh && o.material && o.material.color) this.sootMats.push([o.material, o.material.color.clone()]); }); } for (const [m, c0] of this.sootMats) m.color.copy(c0).multiplyScalar(lerp(1, 0.42, k)); }
}
function pose(weights, times) { for (const n in act) { act[n].setEffectiveWeight(weights[n] || 0); act[n].time = times[n] || 0; } xbMixer.update(0); xbG.scene.updateMatrixWorld(true); }

function hairCap(rig, curly, col) {
  // hair = the scalp part of the skinned head mesh, pushed out along its normals and bound to the same skeleton
  const hm = rig.meshes.Wolf3D_Head; const src = hm.geometry;
  const P = src.attributes.position, Nn = src.attributes.normal; const n = P.count;
  const hpar = (Q.get(curly ? 'hb' : 'ha') || (curly ? '1.765,1.705,1.62,0.016' : '1.776,1.712,1.64,0.009')).split(',').map(Number);
  const inHair = new Uint8Array(n); const pos = new Float32Array(n * 3); const r = rng(curly ? 5 : 3);
  const v = V(0, 0, 0), nr = V(0, 0, 0);
  for (let i = 0; i < n; i++) {
    v.fromBufferAttribute(P, i).applyMatrix4(hm.bindMatrix); nr.fromBufferAttribute(Nn, i);
    const y = v.y, z = v.z, ax = Math.abs(v.x);
    const line = z > 0.06 ? hpar[0] : z > -0.01 ? lerp(hpar[1], hpar[0], (z + 0.01) / 0.07) : z > -0.05 ? lerp(hpar[2], hpar[1], (z + 0.05) / 0.04) : hpar[2];
    const ear = ax > 0.07 && y < 1.742 && y > 1.62 && z > -0.045 && z < 0.035;
    const sideburn = ax > 0.07 && z > 0.07 && z < 0.09 && y > 1.69 && y < 1.77;
    inHair[i] = ((y > line && !ear) || sideburn) ? 1 : 0;
    let off = hpar[3];
    if (!curly) off += 0.016 * smooth(1.79, 1.83, y) * smooth(-0.01, 0.07, z); // soft front volume
    else off += (Math.sin(v.x * 160) * Math.sin(v.z * 170) * Math.sin(y * 150)) * 0.006 + r() * 0.004;
    const p0 = V(0, 0, 0).fromBufferAttribute(P, i);
    pos[i * 3] = p0.x + nr.x * off; pos[i * 3 + 1] = p0.y + nr.y * off; pos[i * 3 + 2] = p0.z + nr.z * off;
  }
  const idx = src.index.array; const keep = [];
  for (let i = 0; i < idx.length; i += 3) if (inHair[idx[i]] + inHair[idx[i + 1]] + inHair[idx[i + 2]] >= 2) keep.push(idx[i], idx[i + 1], idx[i + 2]);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  for (const k of ['uv', 'skinIndex', 'skinWeight']) geo.setAttribute(k, src.attributes[k]); geo.setAttribute('normal', src.attributes.normal.clone());
  geo.setIndex(keep); geo.computeVertexNormals();
  const [c, g] = canvas(256, 256); g.fillStyle = '#' + col.toString(16).padStart(6, '0'); g.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 4000; i++) { g.strokeStyle = `rgba(${r() < .5 ? '0,0,0' : '70,60,50'},${r() * 0.35})`; g.lineWidth = 1; const x = r() * 256, y = r() * 256; g.beginPath(); g.moveTo(x, y); g.lineTo(x + (r() - .5) * 4, y + 6 + r() * 10); g.stroke(); }
  const mat = new THREE.MeshStandardMaterial({ map: tex(c), roughness: curly ? 0.9 : 0.7, metalness: 0, side: THREE.DoubleSide });
  const hair = new THREE.SkinnedMesh(geo, mat); hair.castShadow = true; hair.frustumCulled = false;
  hm.parent.add(hair); hair.bind(hm.skeleton, hm.bindMatrix);
  rig.meshes.Wolf3D_Headwear.visible = false;
  return hair;
}
const tanSkin = (R, G, B) => [R * 0.9, G * 0.76, B * 0.62];
// ---- El-Alamy: black moto leather jacket open over a black turtleneck, slim grey trousers, short natural black hair, clean-shaven
const alamy = new Rig(gA, (rig) => {
  const m = rig.meshes;
  rig.av.updateMatrixWorld(true);
  trim(m.Wolf3D_Headwear, (a, b, c) => [a, b, c].some(v => Math.hypot(v.x, v.z - 0.02) > 0.112 || v.y > 1.775));
  m.Wolf3D_Beard.visible = false;
  remap(m.Wolf3D_Outfit_Top.material, (R, G, B, u, v, r) => {
    const [h, s, l] = hsl(R, G, B);
    if (((h > 320 || h < 15) && s > 0.45 && R > 150) || (h > 80 && h < 170 && s > 0.3)) return [0, 0, 0, 0];
    const isInner = (h > 255 && h < 335 && s > 0.08) || (l > 0.68 && s < 0.35);
    const n = (r() - .5) * 6;
    if (isInner) { const rib = (Math.floor(v * 700) % 3 === 0) ? -4 : 0; const L = 17 + n + rib; return [L, L, L + 2, 255]; }
    const L = 14 + l * 34 + n; return [L, L, L * 1.06, 255]; // leather
  }, true);
  m.Wolf3D_Outfit_Top.material.roughness = 0.38; m.Wolf3D_Outfit_Top.material.metalnessMap = null; m.Wolf3D_Outfit_Top.material.roughnessMap = null; m.Wolf3D_Outfit_Top.material.metalness = 0.1;
  remap(m.Wolf3D_Outfit_Bottom.material, (R, G, B, u, v, r) => { const [h, s, l] = hsl(R, G, B); if (l < 0.2) return [R, G, B]; const L = 60 + l * 70 + (r() - .5) * 8; return [L, L * 1.02, L * 1.1]; });
  remap(m.Wolf3D_Outfit_Footwear.material, (R, G, B) => [R * 0.25, G * 0.25, B * 0.27]);
  m.Wolf3D_Outfit_Footwear.material.roughness = 0.25;
  remap(m.Wolf3D_Headwear.material, (R, G, B) => [R * 0.25, G * 0.24, B * 0.24]);
  for (const k of ['Wolf3D_Head', 'Wolf3D_Body']) remap(m[k].material, tanSkin);
});
// ---- Bestem: chubby foreman, navy work overalls, mustache, curly hair
const bestem = new Rig(gB, (rig) => {
  const m = rig.meshes;
  trim(m.Wolf3D_Headwear, (a, b, c) => [a, b, c].some(v => Math.hypot(v.x, v.z - 0.02) > 0.112 || v.y > 1.775));
  remap(m.Wolf3D_Outfit_Top.material, (R, G, B, u, v, r) => {
    const [h, s, l] = hsl(R, G, B);
    if (((h > 320 || h < 15) && s > 0.45 && R > 150) || (h > 80 && h < 170 && s > 0.3)) return [0, 0, 0, 0];
    const n = (r() - .5) * 14; const oil = Math.sin(u * 37) * Math.sin(v * 29) > 0.75 ? 0.55 : 1;
    const L = (30 + l * 80) * oil + n; return [L * 0.55, L * 0.7, L * 1.15, 255];
  }, true);
  remap(m.Wolf3D_Outfit_Bottom.material, (R, G, B, u, v, r) => { const [h, s, l] = hsl(R, G, B); if (l < 0.2) return [R, G, B]; const L = 30 + l * 80 + (r() - .5) * 14; return [L * 0.55, L * 0.7, L * 1.15]; });
  remap(m.Wolf3D_Headwear.material, (R, G, B) => [R * 0.3, G * 0.27, B * 0.25]);
  remap(m.Wolf3D_Beard.material, (R, G, B) => [R * 0.25, G * 0.22, B * 0.2]);
  for (const k of ['Wolf3D_Head', 'Wolf3D_Body']) remap(m[k].material, (R, G, B) => [R * 0.84, G * 0.68, B * 0.55]);
});
hairCap(alamy, false, 0x0d0b0a); hairCap(bestem, true, 0x16110d);
bestem.group.scale.set(1.16, 0.97, 1.22);

// ---- laptop (El-Alamy) ----
const laptop = new THREE.Group();
const [lcv, lg] = canvas(512, 320); const lTex = tex(lcv);
{
  const body = new THREE.MeshStandardMaterial({ color: 0x18181a, roughness: 0.35, metalness: 0.6 });
  box(0.34, 0.018, 0.24, body, 0, 0, 0, laptop);
  const lid = new THREE.Group(); lid.position.set(0, 0.009, -0.12); laptop.add(lid);
  box(0.34, 0.012, 0.24, body, 0, 0, 0.12, lid);
  const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.31, 0.2), new THREE.MeshStandardMaterial({ map: lTex, emissive: 0xffffff, emissiveMap: lTex, emissiveIntensity: 0.8 })); scr.rotation.x = -Math.PI / 2; scr.position.set(0, 0.0065, 0.12); lid.add(scr);
  lid.rotation.x = -1.85; // open, screen faces the user
  laptop.userData.lid = lid;
}
alamy.group.add(laptop); laptop.position.set(0, 1.07, 0.36); laptop.rotation.set(0.15, Math.PI, 0); // screen toward his face
function drawScreen(p, t) {
  lg.fillStyle = '#04100a'; lg.fillRect(0, 0, 512, 320);
  lg.fillStyle = '#39ff9a'; lg.font = '26px Anton'; lg.fillText('CAR OS v0.70  //  FIAT 128', 20, 40);
  lg.font = '20px monospace'; for (let i = 0; i < 6; i++) lg.fillText('> ' + ['scan engine...', 'emotions: HIGH', 'smoke: YES', 'firmware: 1970', 'patch: 4.2 GB', 'eta: 2 sec'][i], 20, 80 + i * 24);
  lg.strokeStyle = '#39ff9a'; lg.lineWidth = 3; lg.strokeRect(20, 240, 472, 34);
  lg.fillRect(24, 244, 464 * p, 26);
  lg.font = '40px Anton'; lg.fillText(Math.floor(p * 100) + '%', 400, 225);
  if (Math.sin(t * 20) > 0.3) { lg.fillStyle = '#ff4040'; lg.font = '22px Anton'; lg.fillText('WARNING: OVERHEAT', 180, 300); }
  lTex.needsUpdate = true;
}
const cableMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.5 });
let cable = null;

// ---------- walk measurement ----------
const WALK_DUR = clips.walk.duration;
let WALK_SPEED = 1.5;
{
  const N = 96; const fz = [], fy = []; alamy.group.position.set(0, 0, 0); alamy.group.rotation.set(0, 0, 0);
  for (let i = 0; i <= N; i++) { pose({ walk: 1 }, { walk: i / N * WALK_DUR }); alamy.retarget(); const l = alamy.tb.LeftFoot.getWorldPosition(V(0, 0, 0)), r = alamy.tb.RightFoot.getWorldPosition(V(0, 0, 0)); fz.push([l.z, r.z]); fy.push([l.y, r.y]); }
  let sum = 0, cnt = 0; let prev = fy[0][0] < fy[0][1] ? 0 : 1;
  for (let i = 1; i <= N; i++) { const p = fy[i][0] < fy[i][1] ? 0 : 1; if (p === prev) { sum += -(fz[i][p] - fz[i - 1][p]) / (WALK_DUR / N); cnt++; } prev = p; }
  WALK_SPEED = clamp(sum / Math.max(cnt, 1), 0.6, 2.2);
}

// ---------- post ----------
const composer = new EffectComposer(renderer); composer.setSize(W, H);
composer.addPass(new RenderPass(scene, camera));
const gtao = new GTAOPass(scene, camera, W, H); gtao.blendIntensity = 0.8; gtao.updateGtaoMaterial({ radius: 0.5, distanceExponent: 1.5, thickness: 1.5, scale: 1.0 });
{ const ov = gtao.overrideVisibility.bind(gtao); gtao.overrideVisibility = function () { ov(); scene.traverse(o => { if (o.isSprite) o.visible = false; }); }; }
composer.addPass(gtao);
const bloom = new UnrealBloomPass(new THREE.Vector2(W, H), 0.8, 0.85, 0.7); composer.addPass(bloom);
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
      col = max(col, mix(col, blur, 0.55));
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

// =====================================================================
// TIMELINE
// =====================================================================
// scene time: the cold open (0-2.9) shows the aftermath, the rewind (2.9-3.6) runs it backwards
function sceneTime(t) { if (t < 2.9) return 32.6 + t; if (t < 3.6) return lerp(35.5, 29.9, (t - 2.9) / 0.7); return t; }
const ALAMY_STAND = V(1.25, 0, 2.6), BESTEM_POS = V(-1.35, 0, 2.15);
const G = (v) => V(v.x + GX, v.y, v.z);
const ENTER_T0 = 12.0, ENTER_Z0 = 7.4;
const ENTER_DUR = (ENTER_Z0 - ALAMY_STAND.z) / WALK_SPEED;
const EXT_T0 = 3.6, EXT_T1 = 9.4;

function talk(spk, t) { const m = MOUTH[spk]; const f = Math.floor(t * 24); return m && f < m.length ? m[f] : 0; }

function animate(st, t) {
  // ---------- El-Alamy ----------
  const A = alamy;
  if (st >= EXT_T0 && st < EXT_T1) {           // walking down the street toward the service center
    const d = (st - EXT_T0) * WALK_SPEED;
    A.group.position.set(1.0, 0, 1.0 - d); A.group.rotation.set(0, Math.PI, 0);
    pose({ walk: 1 }, { walk: (st - EXT_T0) % WALK_DUR }); A.retarget(); laptop.visible = false;
  } else {
    let z, ww = 0;
    if (st < ENTER_T0) z = ENTER_Z0; else { const d = (st - ENTER_T0) * WALK_SPEED; z = Math.max(ALAMY_STAND.z, ENTER_Z0 - d); }
    const tEnd = ENTER_T0 + ENTER_DUR;
    ww = st < ENTER_T0 ? 0 : 1 - smooth(tEnd - 0.35, tEnd + 0.25, st);
    // yaw: walks in facing -z (toward the car); after the boom turns slowly to face +z (camera)
    const turn = smooth(31.3, 32.4, st);
    A.group.position.set(GX + ALAMY_STAND.x, 0, z); A.group.rotation.set(0, Math.PI - turn * Math.PI * 0.92, 0);
    const nod = smooth(15.6, 15.8, st) * (1 - smooth(16.6, 16.9, st));
    pose({ walk: ww, idle: (1 - ww) * (1 - nod * 0.55), agree: nod * 0.55 }, { walk: (st - ENTER_T0) % WALK_DUR, idle: (st * 0.9) % clips.idle.duration, agree: clamp(st - 15.6, 0, clips.agree.duration - 0.01) });
    A.retarget();
    const hold = smooth(19.3, 19.9, st) * (1 - smooth(31.0, 31.6, st));
    laptop.visible = hold > 0.05;
    if (hold > 0) {
      for (const s of [1, -1]) { const side = s > 0 ? 'Left' : 'Right'; A.aim(side + 'Arm', side + 'ForeArm', V(0.12 * s, -0.9, 0.35), hold); A.aim(side + 'ForeArm', side + 'Hand', V(-0.32 * s, 0.12, 0.94), hold); }
      laptop.userData.lid.rotation.x = -1.85;
    }
  }
  const aT = talk('alamy', t);
  A.face(aT * 0.9, 0.45 + 0.3 * smooth(15.5, 16, st));
  A.soot(st > BOOM + 0.05 ? 1 : 0);

  // ---------- Bestem ----------
  const B = bestem;
  const dive = smooth(BOOM, BOOM + 0.55, st);
  B.group.position.set(GX + BESTEM_POS.x - dive * 0.9, dive * 0.18, BESTEM_POS.z + dive * 0.6);
  B.group.rotation.set(0, 0.35 + dive * 0.3, dive * 1.45);
  const panic = (st > 9.3 && st < 12.8) || (st > 16.7 && st < 19.0) || (st > 22.5 && st < 25.0) || (st > 28.5 && st < BOOM);
  const shake = smooth(16.7, 16.9, st) * (1 - smooth(18.7, 19, st)) + smooth(22.5, 22.7, st) * (1 - smooth(24.8, 25, st));
  pose({ idle: 1 - shake * 0.8, headShake: shake * 0.8 }, { idle: (st * 1.1 + 1) % clips.idle.duration, headShake: (st * 1.3) % (clips.headShake.duration - 0.01) });
  B.retarget();
  const pw = panic ? 1 : 0.0;
  const pk = (() => { let k = 0; for (const [a, b] of [[9.3, 12.8], [16.7, 19.0], [22.5, 25.0], [28.5, BOOM + 0.6]]) k = Math.max(k, smooth(a, a + 0.25, st) * (1 - smooth(b - 0.25, b, st))); return k; })();
  if (pk > 0) for (const s of [1, -1]) {
    const side = s > 0 ? 'Left' : 'Right'; const w = Math.sin(st * 11 + (s > 0 ? 0 : 1.7));
    B.aim(side + 'Arm', side + 'ForeArm', V(0.6 * s, 0.7 + 0.15 * w, 0.2), pk);
    B.aim(side + 'ForeArm', side + 'Hand', V(0.25 * s + 0.35 * w * s, 1, 0.25), pk);
  }
  B.face(talk('bestem', t) * 1.0 + pk * 0.25, 0.0);
  B.soot(st > BOOM + 0.05 ? 0.8 : 0);

  // ---------- car, smoke, cable, explosion ----------
  const ew = ENGINE_W();
  for (const p of engSmoke) { const u = p.userData; const age = st - u.t0; if (age < 0 || age > u.life || st > BOOM) { p.material.opacity = 0; continue; } p.position.set(ew.x + u.vx * age, ew.y + u.vy * age, ew.z + u.vz * age); const sc = u.s0 + age * 0.6; p.scale.set(sc, sc, sc); p.material.opacity = 0.42 * smooth(0, 0.2, age) * (1 - age / u.life); p.material.rotation = age * 0.5 + u.vx * 10; }
  const fa = st - BOOM;
  CAR.visible = true;
  hood.rotation.x = fa > 0 ? -1.05 - Math.min(fa * 9, 2.2) : -1.05; hood.position.y = 0.9 + (fa > 0 ? Math.min(fa, 0.35) * 2.2 - Math.max(0, fa - 0.35) * 0 : 0);
  carPaint.color.setScalar(fa > 0 ? 0.25 : 1);
  for (const p of fireball) { const u = p.userData; const age = st - u.t0; if (age < 0 || age > u.life) { p.material.opacity = 0; continue; } const k = age / u.life; p.position.copy(ew).addScaledVector(u.v, age * (1 - k * 0.5)); const sc = u.s0 + age * 2.2; p.scale.set(sc, sc, sc); p.material.opacity = (1 - k) * (1 - k) * 0.45; p.material.color.setRGB(1, lerp(0.75, 0.25, k), lerp(0.35, 0.05, k)); }
  for (const p of blackSmoke) { const u = p.userData; const age = st - u.t0; if (age < 0 || age > u.life) { p.material.opacity = 0; continue; } p.position.set(ew.x + u.vx * age, ew.y + 0.3 + u.vy * age, ew.z - 0.8 + u.vz * age); const sc = u.s0 + age * 0.9; p.scale.set(sc, sc, sc); p.material.opacity = 0.75 * smooth(0, 0.3, age) * (1 - age / u.life); }
  for (const p of flames) { const u = p.userData; if (fa < 0.15) { p.material.opacity = 0; continue; } const f = 0.5 + 0.5 * Math.sin(st * u.sp + u.ph); p.position.copy(CAR.localToWorld(u.off.clone())).add(V(0, f * 0.25, 0)); const sc = u.s * (0.7 + 0.5 * f); p.scale.set(sc * 0.8, sc * 1.3, sc); p.material.opacity = 0.45 * smooth(0.15, 0.6, fa) * (0.6 + 0.4 * f); }
  for (const d of debris) { const u = d.userData; if (fa < 0 || fa > 2.5) { d.visible = false; continue; } d.visible = true; const p = ew.clone().addScaledVector(u.v, fa); p.y = Math.max(0.03, p.y - 4.9 * fa * fa); d.position.copy(p); d.rotation.set(u.w.x * fa, u.w.y * fa, u.w.z * fa); }
  boomLight.position.copy(ew).add(V(0, 0.5, 0)); boomLight.intensity = fa > 0 && fa < 0.6 ? 45 * (1 - fa / 0.6) ** 2 : 0;
  fireLight.position.copy(ew).add(V(0, 0.6, -0.5)); fireLight.intensity = fa > 0.1 ? 30 * smooth(0.1, 0.6, fa) * (0.7 + 0.3 * Math.sin(st * 17) * Math.sin(st * 7.3)) : 0;
  for (const [l, i0] of gLights) l.intensity = i0 * (fa > 0 && fa < 1.5 ? (Math.sin(st * 60) > 0 ? 0.2 : 1) : 1) * (fa > 1.5 ? 0.55 : 1);
  // laptop screen + glow + cable
  const prog = clamp(0.2 + (st - 20.0) / 7.5 * 0.7, 0, 0.9) + 0.09 * smooth(27.4, 29.8, st);
  drawScreen(Math.min(prog, 0.99), st);
  laptop.updateMatrixWorld(true);
  const lp = laptop.getWorldPosition(V(0, 0, 0));
  screenLight.position.copy(lp).add(V(0, 0.25, 0).applyQuaternion(alamy.group.quaternion)); screenLight.intensity = laptop.visible ? 0.9 * (0.85 + 0.15 * Math.sin(st * 30)) : 0;
  if (cable) { scene.remove(cable); cable.geometry.dispose(); cable = null; }
  if (laptop.visible && st > 20.4 && st < BOOM) {
    const a = laptop.localToWorld(V(-0.17, 0, 0.05)); const b = ew.clone().add(V(0.25, -0.1, 0.1)); const mid = a.clone().lerp(b, 0.5); mid.y = Math.min(a.y, b.y) - 0.45;
    cable = new THREE.Mesh(new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(a, mid, b), 24, 0.008, 5), cableMat); scene.add(cable);
  }
}

// ---------- cameras (portrait) ----------
function camAt(st) {
  const sh = (a, f) => Math.sin(st * f) * a + Math.sin(st * f * 2.31 + 1.3) * a * 0.5;
  const ga = (x, y, z) => V(x + GX, y, z);
  const az = alamy.group.position.z;
  let pos, look, fov = 46, shake = 0;
  if (st >= EXT_T0 && st < EXT_T1) {                      // street: behind him, the neon ahead
    const k = smooth(EXT_T0, EXT_T1, st); const z = alamy.group.position.z;
    pos = V(0.2 + sh(0.03, 1.4), 1.0 + k * 0.6, z + 3.4 - k * 0.6); look = V(1.4, 1.9 + k * 0.4, z - 8); fov = 52;
  } else if (st < 12.75) {                               // Bestem panics, smoking car behind
    pos = ga(-0.9 + sh(0.03, 2.1), 1.3, 4.9); look = ga(-1.15, 1.2, 1.4); fov = 48; shake = 0.012;
  } else if (st < 15.3) {                                 // El-Alamy walks in, low hero angle from the car side
    pos = ga(0.95, 0.55, 0.95); look = ga(1.25, 1.45, az + 0.4); fov = 52;
  } else if (st < 16.8) {                                 // CU "دي رسالة"
    const k = smooth(15.3, 16.8, st); pos = ga(1.02 + sh(0.004, 1), 1.55, 1.75 - k * 0.15); look = ga(1.25, 1.56, 2.6); fov = 40;
  } else if (st < 19.0) {                                 // wide two-shot from the entrance
    pos = ga(0.4 + sh(0.02, 1.7), 1.6, 6.6); look = ga(0.0, 1.15, 1.3); fov = 50;
  } else if (st < 22.55) {                                // laptop, cable into the engine
    const k = smooth(19.0, 22.5, st); pos = ga(0.55 - k * 0.15, 1.25, 0.85 - k * 0.1); look = ga(1.2, 1.3, 2.4); fov = 50;
  } else if (st < 24.95) {                                // Bestem CU yelling
    pos = ga(-1.05 + sh(0.012, 3), 1.62, 3.35); look = ga(-1.3, 1.58, 2.15); fov = 44; shake = 0.01;
  } else if (st < 27.4) {                                 // El-Alamy CU, screen glow
    pos = ga(1.05, 1.52, 1.65); look = ga(1.25, 1.5, 2.6); fov = 40;
  } else if (st < BOOM) {                                 // over-the-shoulder on the screen
    pos = ga(1.02, 1.5, 1.6); look = ga(1.25, 1.45, 2.6); fov = 44;
  } else if (st < 32.55) {                                // BOOM, wide from the entrance
    pos = ga(2.4, 2.0, 7.2); look = ga(0.2, 1.1, 0.5); fov = 52; shake = 0.12 * Math.max(0, 1 - (st - BOOM) / 1.2);
  } else if (st < 35.05) {                                // soot CU (also the cold open)
    pos = ga(1.18, 1.6, 3.85); look = ga(1.25, 1.55, 2.6); fov = 44;
  } else {                                                // slow crane-out over the wreck
    const k = smooth(35.05, END, st); pos = ga(lerp(1.18, 0.7, k), lerp(1.6, 3.2, k), lerp(3.85, 8.0, k)); look = ga(lerp(1.25, 0.2, k), lerp(1.55, 0.9, k), lerp(2.6, 0.8, k)); fov = lerp(44, 52, k);
  }
  if (shake) pos.add(V(Math.sin(st * 71) * shake, Math.sin(st * 53 + 1) * shake, 0));
  return { pos, look, fov };
}

// ---------- 2D overlays ----------
function txt(s, x, y, size, fill, font = 'Lalezar', align = 'center', stroke = 10) {
  og.font = `${size}px ${font}`; og.textAlign = align; og.direction = /[؀-ۿ]/.test(s) ? 'rtl' : 'ltr';
  og.lineJoin = 'round'; og.lineWidth = stroke; og.strokeStyle = 'rgba(0,0,0,0.92)'; og.strokeText(s, x, y); og.fillStyle = fill; og.fillText(s, x, y);
}
function wrap(s, maxW, size) { og.font = `${size}px Lalezar`; const words = s.split(' '); const lines = []; let cur = ''; for (const w of words) { const t2 = cur ? cur + ' ' + w : w; if (og.measureText(t2).width > maxW && cur) { lines.push(cur); cur = w; } else cur = t2; } if (cur) lines.push(cur); return lines; }
const NAMES = { alamy: ['العالمي', '#e0b04a'], bestem: ['بستم', '#ff8a3a'] };
function overlays(t) {
  // hook (first 3 s)
  if (t < 2.95) {
    const a = smooth(0.0, 0.25, t) * (1 - smooth(2.7, 2.95, t)); og.globalAlpha = a;
    og.fillStyle = 'rgba(0,0,0,0.55)'; og.fillRect(0, 120, W, 210);
    txt('لما تبقى أذكى واحد في الورشة', W / 2, 205, 58, '#ffffff');
    txt('... ومحدش فاهمك', W / 2, 290, 58, '#ffd04a');
    og.globalAlpha = 1;
  }
  // rewind
  if (t >= 2.9 && t < 3.6) {
    og.fillStyle = '#fff'; for (let i = 0; i < 2; i++) { og.beginPath(); const x = 60 + i * 44; og.moveTo(x + 40, 90); og.lineTo(x, 115); og.lineTo(x + 40, 140); og.fill(); }
    txt('REWIND', 170, 132, 46, '#fff', 'Anton', 'left', 6);
    txt('قبلها بـ ٥ دقايق', W / 2, H / 2, 64, '#fff');
  }
  // mission card
  if (t >= 3.7 && t < 9.3) {
    const a = smooth(3.7, 4.0, t) * (1 - smooth(9.0, 9.3, t)); og.globalAlpha = a;
    const y = 300;
    og.fillStyle = 'rgba(0,0,0,0.5)'; og.fillRect(0, y - 95, W, t > 6.7 ? 330 : 230);
    txt('MISSION', W / 2, y - 45, 34, '#e0b04a', 'Anton', 'center', 6);
    txt('FIX THE CAR', W / 2, y + 30, 84, '#f2ead8', 'Anton', 'center', 10);
    txt('صلّح العربية', W / 2, y + 105, 50, '#ffffff');
    if (t > 6.7) { og.globalAlpha = a * smooth(6.7, 7.0, t); txt('REWARD: RESPECT  •  المكافأة: الاحترام', W / 2, y + 190, 34, '#7ad07a', 'Lalezar', 'center', 7); }
    og.globalAlpha = 1;
  }
  // dialogue box (big, bottom) — words revealed with the voice
  for (const ln of TL) {
    if (ln.spk === 'anno' || t < ln.at - 0.05 || t > ln.end + 0.35) continue;
    const [name, col] = NAMES[ln.spk];
    const lines = wrap(ln.text, W - 90, 46);
    const bh = 70 + lines.length * 58, by = H - bh - 70;
    og.fillStyle = 'rgba(8,8,10,0.78)'; og.fillRect(28, by, W - 56, bh); og.fillStyle = col; og.fillRect(28, by, W - 56, 5);
    txt(name, W - 50, by + 50, 38, col, 'Lalezar', 'right', 6);
    const words = ln.text.split(' '); const k = clamp((t - ln.at) / Math.max(0.3, (ln.end - ln.at) * 0.85), 0, 1); const show = Math.ceil(k * words.length);
    let shown = 0;
    lines.forEach((L, i) => { const ws = L.split(' '); const vis = ws.slice(0, Math.max(0, show - shown)).join(' '); shown += ws.length; if (vis) txt(vis, W - 50, by + 108 + i * 58, 46, '#ffffff', 'Lalezar', 'right', 7); });
  }
  // mission failed
  if (t >= 35.1) {
    const a = smooth(35.1, 35.35, t);
    og.globalAlpha = a; og.fillStyle = 'rgba(0,0,0,0.45)'; og.fillRect(0, 360, W, 420);
    txt('MISSION FAILED', W / 2, 470, 92, '#e83a2a', 'Anton', 'center', 12);
    txt('المهمة فشلت', W / 2, 555, 60, '#ffffff');
    og.globalAlpha = smooth(37.2, 37.5, t); txt('صحة العربية: ٠٪', W / 2, 650, 46, '#ffb0a0');
    const dots = '.'.repeat(1 + Math.floor(t * 3) % 3);
    og.globalAlpha = smooth(39.4, 39.7, t); txt('الاحترام: جاري التحميل' + dots, W / 2, 730, 46, '#a0e0a0');
    og.globalAlpha = 1;
  }
}

// ---------- frame ----------
function renderFrame(t) {
  const st = sceneTime(t);
  animate(st, t);
  const c = camAt(st);
  if (Q.get('dbg')) { const rig = Q.get('dbg') === 'b' ? bestem : alamy; const hp = rig.tb.Head.getWorldPosition(V(0, 0, 0)); const fwd = V(0, 0, 1).applyQuaternion(rig.group.quaternion); const side = V(1, 0, 0).applyQuaternion(rig.group.quaternion); const k = Number(Q.get('ang') || 0); c.pos = hp.clone().addScaledVector(fwd, 0.9 * Math.cos(k)).addScaledVector(side, 0.9 * Math.sin(k)).add(V(0, 0.08, 0)); c.look = hp.clone().add(V(0, 0.08, 0)); c.fov = 30; }
  camera.position.copy(c.pos); camera.fov = c.fov; camera.updateProjectionMatrix(); camera.lookAt(c.look);
  const ext = st >= EXT_T0 && st < EXT_T1;
  street.visible = ext; garage.visible = !ext; bestem.group.visible = !ext;
  scene.fog.density = ext ? 0.03 : 0.012;
  gradePass.uniforms.uTime.value = t * 24; gradePass.uniforms.uSeed.value = (t * 24) % 97;
  gradePass.uniforms.uFail.value = smooth(35.1, 35.6, t);
  gradePass.uniforms.uVhs.value = (t >= 2.9 && t < 3.6) ? 1 : 0;
  composer.render();
  og.drawImage(renderer.domElement, 0, 0);
  if (st > BOOM && st < BOOM + 0.09) { og.fillStyle = `rgba(255,240,210,${0.6 * (1 - (st - BOOM) / 0.09)})`; og.fillRect(0, 0, W, H); }
  if (st >= 27.4 && st < BOOM) {  // laptop screen insert, full frame
    const k = smooth(27.4, 27.6, st); const sh = Math.sin(st * 40) * 2 * smooth(29.5, BOOM, st);
    og.save(); og.globalAlpha = k; og.fillStyle = 'rgba(0,0,0,0.6)'; og.fillRect(0, 0, W, H);
    og.translate(W / 2 + sh, H / 2 - 120); og.rotate(-0.04); og.scale(1 + 0.08 * smooth(27.4, BOOM, st), 1 + 0.08 * smooth(27.4, BOOM, st));
    og.shadowColor = '#39ff9a'; og.shadowBlur = 40; og.drawImage(lcv, -330, -206, 660, 412); og.shadowBlur = 0;
    og.strokeStyle = '#111'; og.lineWidth = 26; og.strokeRect(-343, -219, 686, 438);
    og.globalAlpha = k * 0.12; for (let y = -206; y < 206; y += 4) { og.fillStyle = '#000'; og.fillRect(-330, y, 660, 2); }
    og.restore();
  }
  overlays(t);
}
window.renderFrame = renderFrame;
window.frameData = () => out.toDataURL('image/png');
const chk = (r) => { const hd = r.meshes.Wolf3D_Head; return { tbHeadInSkel: hd.skeleton.bones.includes(r.tb.Head), headName: r.tb.Head.name, capParent: (r.av.getObjectByName('Head').children.filter(c => !c.isBone).length), sameBone: r.av.getObjectByName('Head') === r.tb.Head, bonesInAv: hd.skeleton.bones.filter(b => { let o = b; while (o.parent) o = o.parent; return o === scene; }).length }; };
window.INFO = { WALK_SPEED, ENTER_DUR, a: chk(alamy), b: chk(bestem) };
window.READY = true;
