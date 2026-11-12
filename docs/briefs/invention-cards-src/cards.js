// Ibrahim's inventions as collectible game cards (1080x1350), same low-poly look as the episodes.
import * as THREE from 'three';

function rng(seed) { let a = seed >>> 0; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function canvasTex(w, h, draw, repeat) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); draw(g, w, h);
  const t = new THREE.CanvasTexture(c); t.magFilter = THREE.NearestFilter; t.minFilter = THREE.NearestFilter; t.generateMipmaps = false; t.colorSpace = THREE.SRGBColorSpace;
  if (repeat) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(repeat[0], repeat[1]); } return t;
}
const M = (color, o = {}) => new THREE.MeshLambertMaterial({ color, flatShading: true, ...o });
const P = (color, o = {}) => new THREE.MeshPhongMaterial({ color, flatShading: true, shininess: 60, specular: 0x666666, ...o });
function mesh(geo, mat, x = 0, y = 0, z = 0, parent) { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); if (parent) parent.add(m); return m; }
const box = (w, h, d) => new THREE.BoxGeometry(w, h, d);
const cyl = (rt, rb, h, s = 7, open = false) => new THREE.CylinderGeometry(rt, rb, h, s, 1, open);
const V = (x, y, z) => new THREE.Vector3(x, y, z);

// ---------- 3D art renderer (low-res, upscaled nearest for the PS2 look) ----------
const AW = 470, AH = 300;
const glc = document.createElement('canvas'); glc.width = AW; glc.height = AH;
const renderer = new THREE.WebGLRenderer({ canvas: glc, antialias: false, alpha: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1); renderer.setSize(AW, AH, false); renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.setClearColor(0x000000, 0);
const camera = new THREE.PerspectiveCamera(40, AW / AH, 0.05, 100);
function makeScene() { const s = new THREE.Scene(); s.add(new THREE.AmbientLight(0xffffff, 1.0)); const k = new THREE.DirectionalLight(0xfff1d6, 2.0); k.position.set(-3, 5, 4); s.add(k); const r = new THREE.DirectionalLight(0x9fc0ff, 0.8); r.position.set(4, 2, -3); s.add(r); return s; }
function turntable(s, y = 0) { mesh(cyl(1.6, 1.6, 0.12, 24), P(0x2a2a40, { shininess: 90 }), 0, y - 0.06, 0, s); const ring = mesh(new THREE.TorusGeometry(1.62, 0.03, 4, 32), new THREE.MeshBasicMaterial({ color: 0x3df05a }), 0, y, 0, s); ring.rotation.x = Math.PI / 2; }

// ---------- models ----------
const red = () => P(0xd8231b, { shininess: 70 });
function jetDishwasher(s) {
  const g = new THREE.Group(); s.add(g);
  const woodTex = canvasTex(16, 16, (c) => { c.fillStyle = '#b07a43'; c.fillRect(0, 0, 16, 16); c.fillStyle = '#7a4f2a'; for (let y = 0; y < 16; y += 5) c.fillRect(0, y, 16, 1); });
  mesh(box(0.9, 0.38, 0.6), M(0xffffff, { map: woodTex }), 0, 0.19, 0, g);
  const eng = new THREE.Group(); eng.position.y = 0.38; g.add(eng);
  mesh(box(0.55, 0.4, 0.45), red(), 0, 0.2, 0, eng);
  for (let i = 0; i < 6; i++) mesh(box(0.44, 0.03, 0.38), M(0x3a3a3a), -0.03, 0.45 + i * 0.05, 0, eng);
  const ex = mesh(cyl(0.05, 0.05, 0.6, 6), M(0x8a4a22), 0.25, 0.65, -0.1, eng); ex.rotation.z = -0.5;
  const fly = mesh(cyl(0.19, 0.19, 0.07, 8), M(0x3a3a3a), -0.33, 0.21, 0.05, eng); fly.rotation.z = Math.PI / 2;
  mesh(box(0.1, 0.05, 0.05), M(0xff2222), -0.4, 0.21, 0.25, eng);
  const signTex = canvasTex(64, 32, (c) => { c.fillStyle = '#c8a26b'; c.fillRect(0, 0, 64, 32); c.fillStyle = '#111'; c.font = '16px PS2P'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('3000', 32, 17); });
  const sign = mesh(new THREE.PlaneGeometry(0.36, 0.18), M(0xffffff, { map: signTex }), 0, 0.22, 0.231, eng); sign.rotation.z = 0.08;
  // side mirror with flower + evil eye
  mesh(cyl(0.015, 0.015, 0.35, 4), P(0xc8d0d8), 0.3, 0.6, 0.12, eng).rotation.z = -0.4;
  mesh(cyl(0.1, 0.1, 0.02, 8), P(0xc8d0d8), 0.4, 0.78, 0.12, eng).rotation.x = Math.PI / 2;
  mesh(new THREE.SphereGeometry(0.05, 5, 4), M(0xff4fa0), 0.31, 0.72, 0.18, eng);
  const eye = new THREE.Group(); eye.position.set(0.36, 0.62, 0.2); eng.add(eye); mesh(cyl(0.045, 0.045, 0.01, 8), M(0x1f5fd8), 0, 0, 0, eye).rotation.x = Math.PI / 2; mesh(cyl(0.022, 0.022, 0.012, 8), M(0xffffff), 0, 0, 0.004, eye).rotation.x = Math.PI / 2;
  for (let i = 0; i < 3; i++) mesh(box(1.0, 0.06, 0.03), P(0xc9ccd1), -0.05, 0.12 + i * 0.13, -0.31, g);
  // coiled fire hose + brass nozzle
  const pts = [V(0.3, 0.75, -0.05), V(0.6, 0.45, 0.1)]; for (let i = 0; i <= 14; i++) { const a = i / 14 * Math.PI * 3.4; pts.push(V(0.85 + Math.cos(a) * 0.25, 0.05 + i * 0.012, 0.35 + Math.sin(a) * 0.2)); } pts.push(V(0.7, 0.1, 0.75));
  mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 60, 0.05, 6), M(0xc0201a), 0, 0, 0, g);
  const nz = mesh(new THREE.ConeGeometry(0.06, 0.2, 6), P(0xd4a62a, { shininess: 90 }), 0.62, 0.12, 0.85, g); nz.rotation.x = Math.PI / 2;
  // cheese-tin control box with the red TURBO button
  const tin = new THREE.Group(); tin.position.set(-0.85, 0, 0.35); g.add(tin);
  mesh(cyl(0.17, 0.17, 0.14, 8), M(0x1d56c9), 0, 0.07, 0, tin);
  mesh(new THREE.SphereGeometry(0.1, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2), P(0xff1010, { emissive: 0x330000 }), 0, 0.14, 0, tin);
  // wires
  const wcols = [0xd02020, 0xffd400, 0x2050e0];
  wcols.forEach((c, i) => mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([V(-0.2, 0.65 + i * 0.03, 0.15), V(-0.5, 0.3, 0.3), V(-0.85, 0.16, 0.35)]), 12, 0.013, 4), M(c), 0, 0, 0, g));
  g.position.y = 0.06; g.rotation.y = -0.45;
  return { g, cam: [V(1.9, 1.5, 2.4), V(0, 0.45, 0.15)] };
}
function wifiBooster(s) {
  const g = new THREE.Group(); s.add(g);
  const wire = P(0xbfc6cc, { shininess: 90 });
  for (let i = 0; i < 3; i++) { const a = i / 3 * Math.PI * 2; const leg = mesh(cyl(0.015, 0.015, 1.75, 4), wire, Math.cos(a) * 0.32, 0.82, Math.sin(a) * 0.32, g); leg.rotation.set(Math.sin(a) * 0.19, 0, -Math.cos(a) * 0.19); }
  mesh(new THREE.TorusGeometry(0.08, 0.012, 4, 8, Math.PI * 1.4), wire, 0, 1.78, 0, g);
  const head = new THREE.Group(); head.position.set(0, 1.62, 0); head.rotation.y = 0.5; g.add(head);
  const dish = mesh(new THREE.SphereGeometry(0.5, 10, 4, 0, Math.PI * 2, 0, Math.PI / 3.2), P(0xeeeeee, { side: THREE.DoubleSide }), 0, 0, 0, head); dish.rotation.x = -Math.PI / 2 - 0.5;
  const arm = mesh(cyl(0.012, 0.012, 0.55, 4), wire, 0, 0.14, 0.28, head); arm.rotation.x = Math.PI / 2 - 0.5;
  const pan = new THREE.Group(); pan.position.set(0, 0.28, 0.52); pan.rotation.x = Math.PI / 2 - 0.5; head.add(pan);
  mesh(cyl(0.2, 0.16, 0.06, 10), P(0x1d1d1f, { shininess: 80, emissive: 0x401000 }), 0, 0, 0, pan); mesh(box(0.05, 0.03, 0.32), P(0x111111), 0, 0.02, 0.33, pan);
  const inner = mesh(new THREE.CircleGeometry(0.17, 10), new THREE.MeshBasicMaterial({ color: 0xff7a20 }), 0, 0.032, 0, pan); inner.rotation.x = -Math.PI / 2;
  // router on a plastic chair
  const chair = new THREE.Group(); chair.position.set(-0.95, 0, 0.35); g.add(chair);
  const cm = P(0xf4f4f0); mesh(box(0.45, 0.04, 0.45), cm, 0, 0.45, 0, chair); mesh(box(0.45, 0.45, 0.04), cm, 0, 0.7, -0.21, chair);
  for (const [x, z] of [[-0.19, -0.19], [0.19, -0.19], [-0.19, 0.19], [0.19, 0.19]]) mesh(box(0.04, 0.45, 0.04), cm, x, 0.22, z, chair);
  const router = new THREE.Group(); router.position.set(0, 0.5, 0.02); chair.add(router);
  mesh(box(0.32, 0.07, 0.22), P(0xffffff), 0, 0.035, 0, router);
  for (let i = 0; i < 4; i++) mesh(box(0.025, 0.012, 0.01), new THREE.MeshBasicMaterial({ color: 0x3df05a }), -0.1 + i * 0.065, 0.045, 0.111, router);
  for (const sx of [-1, 1]) { const an = mesh(cyl(0.012, 0.012, 0.3, 4), P(0x222222), sx * 0.12, 0.2, -0.08, router); an.rotation.z = sx * 0.3; }
  mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([V(0, 1.85, 0.45), V(-0.3, 1.0, 0.5), V(-0.7, 0.6, 0.45), V(-0.85, 0.55, 0.37)]), 20, 0.014, 3), M(0x111111), 0, 0, 0, g);
  g.position.set(0.25, 0.0, 0); g.rotation.y = -0.2;
  return { g, cam: [V(1.5, 1.6, 3.0), V(-0.15, 1.0, 0.1)] };
}
function tukTuk3000(s) {
  const tuk = new THREE.Group(); s.add(tuk);
  const r = red(), blk = M(0x161616);
  const txt = (w, h, bg, fn) => canvasTex(w, h, (c) => { c.fillStyle = bg; c.fillRect(0, 0, w, h); fn(c); });
  const msh = txt(64, 20, '#d8231b', (c) => { c.fillStyle = '#ffe14a'; c.font = '13px Lalezar'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.direction = 'rtl'; c.fillText('ما شاء الله', 32, 11); });
  mesh(box(2.2, 0.15, 1.2), blk, 0, 0.35, 0, tuk); mesh(box(1.2, 0.9, 1.25), r, 0.4, 0.85, 0, tuk); mesh(box(0.7, 0.85, 0.95), r, -0.75, 0.8, 0, tuk);
  mesh(new THREE.PlaneGeometry(0.85, 0.55), new THREE.MeshPhongMaterial({ color: 0x9fd0ff, transparent: true, opacity: 0.55, side: THREE.DoubleSide }), -1.1, 1.5, 0, tuk).rotation.y = Math.PI / 2;
  mesh(box(2.0, 0.08, 1.35), blk, -0.05, 1.95, 0, tuk);
  for (const [x, z] of [[-1.05, 0.45], [-1.05, -0.45], [0.95, 0.6], [0.95, -0.6]]) mesh(box(0.05, 0.75, 0.05), blk, x, 1.55, z, tuk);
  mesh(box(0.06, 0.06, 0.6), P(0xcccccc), -0.85, 1.3, 0, tuk);
  mesh(new THREE.PlaneGeometry(0.75, 0.24), M(0xffffff, { map: msh }), 1.005, 1.0, 0, tuk).rotation.y = Math.PI / 2;
  { const eye = new THREE.Group(); eye.position.set(-1.11, 1.0, 0); eye.rotation.y = -Math.PI / 2; tuk.add(eye); mesh(cyl(0.12, 0.12, 0.02, 10), M(0x1f5fd8), 0, 0, 0, eye).rotation.x = Math.PI / 2; mesh(cyl(0.06, 0.06, 0.03, 10), M(0xffffff), 0, 0, 0.005, eye).rotation.x = Math.PI / 2; mesh(cyl(0.03, 0.03, 0.04, 8), M(0x111111), 0, 0, 0.01, eye).rotation.x = Math.PI / 2; }
  for (let i = 0; i < 9; i++) mesh(new THREE.ConeGeometry(0.03, 0.12, 4), M([0xffd400, 0xff3355, 0x33cc66][i % 3]), -0.9 + i * 0.22, 1.85, 0.68, tuk).rotation.x = Math.PI;
  for (const [x, z] of [[-1.05, 0], [0.75, 0.62], [0.75, -0.62]]) mesh(cyl(0.26, 0.26, 0.16, 10), M(0x111111), x, 0.26, z, tuk).rotation.x = Math.PI / 2;
  // the upgraded engine with the Teflon pan
  const e = new THREE.Group(); e.position.set(0.9, 0.35, 0); tuk.add(e);
  mesh(box(0.5, 0.4, 0.45), r, 0, 0.2, 0, e); for (let i = 0; i < 5; i++) mesh(box(0.4, 0.025, 0.38), M(0x3a3a3a), 0, 0.43 + i * 0.045, 0, e);
  const p = new THREE.Group(); p.position.set(0, 0.72, 0); e.add(p); mesh(cyl(0.2, 0.16, 0.06, 10), P(0x1d1d1f, { emissive: 0x902000 }), 0, 0, 0, p);
  // exhaust flames (rocket mode)
  const fl = [0xffdd33, 0xff9a1a, 0xff5a10];
  for (let i = 0; i < 7; i++) { const c = mesh(new THREE.ConeGeometry(0.16 - i * 0.012, 0.5 + i * 0.12, 6), new THREE.MeshBasicMaterial({ color: fl[i % 3], transparent: true, opacity: 0.85 - i * 0.08 }), 1.45 + i * 0.16, 0.55 + Math.sin(i) * 0.04, (i % 2 - 0.5) * 0.12, tuk); c.rotation.z = Math.PI / 2; }
  tuk.position.y = 0.35; tuk.rotation.set(0.05, 0.75, -0.18);
  return { g: tuk, cam: [V(3.0, 2.3, 4.8), V(-0.05, 0.85, 0)] };
}
function lieDetector(s) {
  const g = new THREE.Group(); s.add(g);
  const alu = P(0xc8ced6, { shininess: 110, specular: 0xffffff });
  const cooker = new THREE.Group(); g.add(cooker);
  mesh(cyl(0.34, 0.31, 0.48, 14), alu, 0, 0.24, 0, cooker);
  for (const sx of [-1, 1]) mesh(box(0.3, 0.05, 0.08), M(0x1a1a1a), sx * 0.46, 0.42, 0, cooker);
  const lid = new THREE.Group(); lid.position.y = 0.5; cooker.add(lid);
  mesh(cyl(0.35, 0.35, 0.05, 14), alu, 0, 0, 0, lid); mesh(box(0.58, 0.06, 0.08), M(0x1a1a1a), 0.16, 0.05, 0, lid);
  mesh(cyl(0.05, 0.07, 0.11, 8), M(0x333333), 0, 0.09, 0, lid);
  const beacon = new THREE.Group(); beacon.position.set(-0.15, 0.06, 0.08); lid.add(beacon);
  mesh(cyl(0.08, 0.08, 0.04, 8), M(0x222222), 0, 0, 0, beacon); mesh(new THREE.SphereGeometry(0.08, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0xff2020 }), 0, 0.02, 0, beacon);
  const rem = mesh(box(0.08, 0.28, 0.035), M(0x222222), 0.36, 0.24, 0.07, cooker); rem.rotation.z = 0.15;
  for (let i = 0; i < 6; i++) mesh(box(0.016, 0.016, 0.01), M([0xff3355, 0x33aaff, 0x44cc66][i % 3]), 0.35 + (i % 2) * 0.028, 0.31 - Math.floor(i / 2) * 0.04, 0.09, cooker);
  for (let i = 0; i < 2; i++) mesh(box(0.14, 0.04, 0.04), P(0xc9ccd1), 0.36, 0.17 + i * 0.13, 0.085, cooker);
  // steam puffs (whistling)
  for (let i = 0; i < 5; i++) mesh(new THREE.IcosahedronGeometry(0.07 + i * 0.03, 0), new THREE.MeshLambertMaterial({ color: 0xffffff, transparent: true, opacity: 0.8 - i * 0.12 }), Math.sin(i) * 0.05, 0.75 + i * 0.16, 0, g);
  // colander helmet with wires
  const helm = new THREE.Group(); helm.position.set(-0.9, 0.05, 0.35); g.add(helm);
  mesh(new THREE.SphereGeometry(0.3, 10, 5, 0, Math.PI * 2, 0, Math.PI / 2), P(0xc8ced6, { shininess: 100, side: THREE.DoubleSide }), 0, 0, 0, helm);
  for (let i = 0; i < 14; i++) { const a = i / 14 * 6.28; mesh(cyl(0.014, 0.014, 0.01, 4), M(0x333333), Math.cos(a) * 0.2, 0.21, Math.sin(a) * 0.2, helm); }
  mesh(cyl(0.007, 0.007, 0.22, 4), M(0xd02020), 0.1, 0.38, 0, helm); mesh(new THREE.SphereGeometry(0.03, 5, 4), M(0xffd400), 0.1, 0.5, 0, helm);
  mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([V(-0.8, 0.55, 0.35), V(-0.5, 0.15, 0.4), V(-0.25, 0.35, 0.15)]), 16, 0.014, 4), M(0xd02020), 0, 0, 0, g);
  // kitchen-scale "lie meter"
  const dial = new THREE.Group(); dial.position.set(0.75, 0.0, 0.45); g.add(dial);
  mesh(box(0.34, 0.08, 0.34), M(0xf0f0f0), 0, 0.04, 0, dial); mesh(cyl(0.13, 0.13, 0.04, 14), M(0xffffff), 0, 0.2, 0.0, dial).rotation.x = Math.PI / 2 - 0.5;
  const face = canvasTex(32, 32, (c) => { c.fillStyle = '#fff'; c.fillRect(0, 0, 32, 32); c.fillStyle = '#3df05a'; c.fillRect(4, 18, 8, 3); c.fillStyle = '#ffd400'; c.fillRect(12, 12, 8, 3); c.fillStyle = '#ff2a2a'; c.fillRect(20, 18, 8, 3); c.fillStyle = '#d8231b'; c.save(); c.translate(16, 24); c.rotate(0.9); c.fillRect(-1, -14, 2, 14); c.restore(); });
  const fm = mesh(new THREE.CircleGeometry(0.12, 14), M(0xffffff, { map: face }), 0, 0.2, 0.025, dial); fm.rotation.x = -0.5;
  mesh(box(0.06, 0.2, 0.06), M(0xeeeeee), 0, 0.12, 0, dial);
  g.position.set(0.1, 0.0, 0); g.rotation.y = -0.35;
  return { g, cam: [V(1.6, 1.35, 2.4), V(0, 0.45, 0.1)] };
}

function pedalGenerator(s) {
  const g = new THREE.Group(); s.add(g);
  const frameM = P(0x1f6fd8, { shininess: 80 });
  for (const x of [-0.5, 0.5]) { const w = new THREE.Group(); w.position.set(x, 0.38, 0); g.add(w); mesh(new THREE.TorusGeometry(0.3, 0.035, 5, 14), M(0x111111), 0, 0, 0, w); for (let k = 0; k < 3; k++) mesh(box(0.56, 0.015, 0.015), M(0xaaaaaa), 0, 0, 0, w).rotation.z = k * Math.PI / 3; }
  for (const [x, y, l, rz] of [[0, 0.55, 0.9, 0], [-0.22, 0.48, 0.45, 1.1], [0.25, 0.5, 0.42, -1.0], [-0.45, 0.62, 0.5, 0.25]]) mesh(box(l, 0.04, 0.04), frameM, x, y, 0, g).rotation.z = rz;
  mesh(box(0.2, 0.05, 0.1), M(0x111111), -0.12, 0.82, 0, g); mesh(box(0.04, 0.04, 0.45), P(0xcccccc), 0.5, 0.9, 0, g); mesh(box(0.04, 0.3, 0.04), frameM, 0.48, 0.76, 0, g);
  mesh(box(0.3, 0.14, 0.5), M(0x555555), -0.5, 0.07, 0, g);
  mesh(box(0.14, 0.14, 0.12), P(0xd8231b), -0.5, 0.3, 0.16, g); mesh(box(0.5, 0.03, 0.03), P(0xc9ccd1), -0.5, 0.36, 0.18, g);
  const fan = new THREE.Group(); fan.position.set(1.0, 0, -0.35); g.add(fan);
  mesh(cyl(0.16, 0.18, 0.05, 8), M(0x2a8a8a), 0, 0.03, 0, fan); mesh(cyl(0.03, 0.03, 0.9, 6), M(0x2a8a8a), 0, 0.48, 0, fan);
  const head = new THREE.Group(); head.position.set(0, 0.98, 0); head.rotation.y = -0.5; fan.add(head);
  mesh(new THREE.TorusGeometry(0.24, 0.015, 4, 14), M(0xdddddd), 0, 0, 0.04, head);
  for (let k = 0; k < 3; k++) { const b = mesh(box(0.08, 0.2, 0.01), M(0x8fd0ff), 0, 0, 0, head); b.position.set(Math.sin(k * 2.09) * 0.1, Math.cos(k * 2.09) * 0.1, 0); b.rotation.z = -k * 2.09; }
  mesh(new THREE.SphereGeometry(0.08, 8, 6), new THREE.MeshBasicMaterial({ color: 0xfff0a0 }), 0.0, 1.35, 0.1, g); mesh(box(0.012, 0.3, 0.012), M(0x111111), 0, 1.55, 0.1, g);
  mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([V(-0.5, 0.3, 0.22), V(0.2, 0.05, 0.3), V(0.8, 0.1, 0.0), V(1.0, 0.9, -0.35)]), 16, 0.012, 4), M(0x111111), 0, 0, 0, g);
  // sparks from the dynamo
  for (let i = 0; i < 6; i++) mesh(new THREE.OctahedronGeometry(0.03, 0), new THREE.MeshBasicMaterial({ color: 0x9fd0ff }), -0.5 + Math.cos(i) * 0.15, 0.45 + i * 0.04, 0.25 + Math.sin(i) * 0.08, g);
  g.position.set(-0.15, 0, 0); g.rotation.y = 0.35;
  return { g, cam: [V(1.3, 1.45, 2.9), V(0.1, 0.6, 0)] };
}

function passwordStethoscope(s) {
  const g = new THREE.Group(); s.add(g);
  mesh(cyl(0.025, 0.025, 2.0, 6), M(0x8a5a2b), 0, 1.0, 0, g);
  const pan = new THREE.Group(); pan.position.y = 2.02; g.add(pan);
  mesh(cyl(0.22, 0.18, 0.06, 12), P(0x1d1d1f, { shininess: 80 }), 0, 0, 0, pan); mesh(box(0.05, 0.03, 0.34), P(0x111111), 0, -0.01, 0.34, pan);
  mesh(cyl(0.08, 0.08, 0.03, 12), P(0xc8ced6, { shininess: 110, specular: 0xffffff }), 0, 0.045, 0, pan);
  for (let i = 0; i < 3; i++) mesh(box(0.46, 0.03, 0.03), P(0xc9ccd1), 0, 1.5 - i * 0.12, 0.03, g);
  const tub = (pts) => mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 20, 0.014, 5), M(0x111111), 0, 0, 0, g);
  tub([V(0, 2.0, 0.05), V(0.25, 1.6, 0.3), V(0.35, 1.15, 0.2)]); tub([V(0, 2.0, 0.05), V(-0.25, 1.6, 0.3), V(-0.35, 1.15, 0.2)]);
  for (const sx of [-1, 1]) mesh(new THREE.SphereGeometry(0.04, 6, 4), P(0xc8ced6), sx * 0.35, 1.12, 0.2, g);
  // ceiling slab + sound waves
  mesh(box(1.6, 0.1, 1.0), M(0xb08a58), 0, 2.12, 0, g);
  for (let i = 0; i < 3; i++) mesh(new THREE.TorusGeometry(0.15 + i * 0.12, 0.01, 4, 16, Math.PI), new THREE.MeshBasicMaterial({ color: 0x5ab8ff }), 0, 2.25 + i * 0.04, 0, g).rotation.x = -Math.PI / 2;
  g.position.set(0, -0.25, 0); g.rotation.y = 0.4;
  return { g, cam: [V(1.6, 1.4, 2.8), V(0, 1.15, 0)] };
}

function nuclearHeater(s) {
  const g = new THREE.Group(); s.add(g);
  mesh(box(1.4, 1.8, 0.08), M(0xdfeef4), 0, 1.1, -0.35, g);
  const h = new THREE.Group(); h.position.set(0, 1.35, -0.05); g.add(h);
  mesh(cyl(0.3, 0.3, 0.9, 14), P(0xf4f4f4, { shininess: 60 }), 0, 0, 0, h);
  mesh(cyl(0.305, 0.305, 0.91, 14, true), new THREE.MeshBasicMaterial({ color: 0xff3a10, transparent: true, opacity: 0.35, side: THREE.DoubleSide }), 0, 0, 0, h);
  mesh(new THREE.CircleGeometry(0.08, 10), M(0xffffff), 0, 0.12, 0.301, h); mesh(box(0.014, 0.07, 0.01), M(0xd8231b), 0.02, 0.14, 0.31, h).rotation.z = -1.2;
  const k = new THREE.Group(); k.position.set(-0.34, -0.58, 0.14); h.add(k); mesh(cyl(0.12, 0.14, 0.24, 10), P(0xd8d8e0, { shininess: 100 }), 0, 0, 0, k); mesh(cyl(0.02, 0.03, 0.15, 5), P(0xd8d8e0), 0.15, 0.04, 0, k).rotation.z = -1.0;
  const d = new THREE.Group(); d.position.set(0.28, -0.52, 0.2); h.add(d); mesh(cyl(0.07, 0.08, 0.3, 8), P(0xff5fa8), 0, 0, 0, d).rotation.z = Math.PI / 2; mesh(box(0.06, 0.18, 0.06), P(0xff5fa8), -0.06, -0.12, 0, d);
  mesh(cyl(0.2, 0.16, 0.05, 10), P(0x1d1d1f, { shininess: 80 }), 0, -0.5, 0.25, h).rotation.x = 1.2;
  for (let i = 0; i < 3; i++) mesh(box(0.66, 0.04, 0.02), P(0xc9ccd1), 0, -0.2 - i * 0.16, 0.31, h);
  mesh(box(0.16, 0.16, 0.06), new THREE.MeshBasicMaterial({ color: 0xd8231b }), 0.45, 0.6, -0.28, g);
  for (let i = 0; i < 6; i++) mesh(new THREE.IcosahedronGeometry(0.1 + i * 0.03, 0), new THREE.MeshLambertMaterial({ color: 0xffffff, transparent: true, opacity: 0.75 - i * 0.1 }), Math.sin(i * 2) * 0.25, 1.9 + i * 0.12, 0.1, g);
  g.rotation.y = -0.3; return { g, cam: [V(1.2, 1.5, 2.6), V(0, 1.1, 0)] };
}
function phoneDryer(s) {
  const g = new THREE.Group(); s.add(g);
  mesh(box(0.8, 0.9, 0.6), P(0xdedede), 0, 0.45, 0, g); for (let i = 0; i < 4; i++) mesh(cyl(0.09, 0.09, 0.02, 8), M(0x222222), -0.18 + (i % 2) * 0.36, 0.91, -0.13 + Math.floor(i / 2) * 0.26, g);
  const p = new THREE.Group(); p.position.set(0, 0.93, 0); g.add(p);
  mesh(cyl(0.24, 0.22, 0.28, 12), P(0xc8ced6, { shininess: 110 }), 0, 0.14, 0, p); mesh(cyl(0.25, 0.25, 0.03, 12), P(0xb8bec6, { shininess: 110 }), 0.05, 0.4, 0, p).rotation.z = 0.25;
  const d = new THREE.Group(); d.position.set(0.27, 0.17, 0.06); p.add(d); mesh(cyl(0.06, 0.07, 0.26, 8), P(0xff5fa8), 0, 0, 0, d).rotation.z = Math.PI / 2; mesh(box(0.05, 0.16, 0.05), P(0xff5fa8), 0.04, -0.1, 0, d);
  mesh(box(0.5, 0.03, 0.02), P(0xc9ccd1), 0, 0.12, 0.225, p);
  const ph = new THREE.Group(); ph.position.set(-0.05, 0.47, 0.02); ph.rotation.set(-0.4, 0, 0.3); p.add(ph); mesh(box(0.1, 0.18, 0.015), P(0x222222), 0, 0, 0, ph); mesh(new THREE.PlaneGeometry(0.085, 0.15), new THREE.MeshBasicMaterial({ color: 0x9fd0ff }), 0, 0, 0.009, ph);
  mesh(new THREE.SphereGeometry(0.2, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), M(0xf4ecd8), 0, 0.3, 0, p).scale.y = 0.4;
  const fl = [0xffdd33, 0xff9a1a, 0x4a8aff]; for (let i = 0; i < 8; i++) { const a = i / 8 * 6.28; mesh(new THREE.ConeGeometry(0.05, 0.3, 5), new THREE.MeshBasicMaterial({ color: fl[i % 3] }), Math.cos(a) * 0.18, 0.98, Math.sin(a) * 0.18, g); }
  g.rotation.y = 0.35; return { g, cam: [V(1.1, 1.75, 1.9), V(0, 1.0, 0)] };
}

// ---------- card data ----------
const CARDS = [
  { file: 'card_jet_dishwasher', build: jetDishwasher, rarity: ['LEGENDARY', 'أسطوري', '#ffb000', '#3a1f00'], ar: 'غسالة المواعين النفاثة', en: 'JET DISHWASHER 3000',
    stats: [['POWER', 'القوة', 5], ['SAFETY', 'الأمان', 0], ['SMELL', 'الريحة', 5], ['MOM APPROVAL', 'رضا أم حمادة', 0]],
    parts: 'موتور توكتوك + خرطوم مطافي + شريط لزق', quote: '«في ثانيتين المطبخ هيلمع!»', result: 'النتيجة: المطبخ انفجر', ep: 'غسالة المواعين النفاثة' },
  { file: 'card_wifi_booster', build: wifiBooster, rarity: ['EPIC', 'ملحمي', '#b04fff', '#22003a'], ar: 'مقوّي الواي فاي النووي', en: 'NUCLEAR WI-FI BOOSTER',
    stats: [['RANGE', 'المدى', 5], ['SPEED', 'السرعة', 5], ['SAFETY', 'الأمان', 0], ['NEIGHBOR ANGER', 'غضب الجيران', 5]],
    parts: 'دش + شماعة + طاسة المحشي', quote: '«بتلقط النت من إسكندرية»', result: 'النتيجة: النور قطع في المنطقة', ep: 'مقوّي الواي فاي النووي' },
  { file: 'card_tuktuk_3000', build: tukTuk3000, rarity: ['MYTHIC', 'خرافي', '#ff3355', '#3a0010'], ar: 'توكتوك ٣٠٠٠', en: 'TUK-TUK 3000',
    stats: [['SPEED', 'السرعة', 6], ['BRAKES', 'الفرامل', 0], ['ALTITUDE', 'الارتفاع', 5], ['HAGGLE DISCOUNT', 'خصم الفصال', 4]],
    parts: 'توكتوك حودة + الموتور + المقوّي النووي', quote: '«مفيش فرامل... بس فيه خصم للطيران!»', result: 'النتيجة: SPLAT في فرشة بطيخ', ep: 'موتور حودة / مشوار السوق' },
  { file: 'card_lie_detector', build: lieDetector, rarity: ['RARE', 'نادر', '#2f9bff', '#001a3a'], ar: 'كاشف الكدب ٣٠٠٠', en: 'LIE DETECTOR 3000',
    stats: [['ACCURACY', 'الدقة', 5], ['VOLUME', 'الصفير', 5], ['SAFETY', 'الأمان', 1], ['SAFE ANSWERS', 'إجابات آمنة', 0]],
    parts: 'حلة ضغط + ريموت + مصفاة + لمبة حمرا', quote: '«أي حد يكدب... الحلة تصفّر»', result: 'النتيجة: إبراهيم في البلكونة', ep: 'كاشف الكدب ٣٠٠٠' },
  { file: 'card_pedal_generator', build: pedalGenerator, rarity: ['COMMON', 'عادي', '#7fd07f', '#0f2a10'], ar: 'مولّد البدّال ٣٠٠٠', en: 'PEDAL GENERATOR 3000',
    stats: [['POWER', 'القوة', 1], ['SWEAT', 'العرق', 5], ['SAFETY', 'الأمان', 2], ['CHARGE', 'الشحن', 1]],
    parts: 'عجلة حمادة + مروحة + دينامو + شريط لزق', quote: '«دوّس يا حمادة! كل لفة بتنوّر اللمبة!»', result: 'النتيجة: الموبايل شحن ١٪ بس', ep: 'ضيف من السما' },
  { file: 'card_password_stethoscope', build: passwordStethoscope, rarity: ['EPIC', 'ملحمي', '#b04fff', '#22003a'], ar: 'سمّاعة الباسورد ٣٠٠٠', en: 'PASSWORD STETHOSCOPE 3000',
    stats: [['HEARING', 'السمع', 5], ['STEALTH', 'التخفّي', 1], ['LEGALITY', 'القانونية', 0], ['NEIGHBOR ANGER', 'غضب الجيران', 5]],
    parts: 'سمّاعة دكتور + طاسة + عصاية مقشة + شريط لزق', quote: '«بتسمع أبو سمير وهو بيكتب الباسورد... ششش!»', result: 'النتيجة: النت وصل للشارع كله', ep: 'مقوّي الواي فاي النووي ٢' },
  { file: 'card_nuclear_heater', build: nuclearHeater, rarity: ['RARE', 'نادر', '#2f9bff', '#001a3a'], ar: 'السخان النووي ٣٠٠٠', en: 'NUCLEAR WATER HEATER 3000',
    stats: [['HEAT', 'السخونية', 5], ['CONTROL', 'التحكم', 0], ['SAFETY', 'الأمان', 0], ['STEAM', 'البخار', 5]],
    parts: 'كاتل + سشوار + طاسة + زرار تيربو', quote: '«ادخل استحمى... وأنا هدوس على التوربو»', result: 'النتيجة: الشقة بقت سبا', ep: 'السخان النووي' },
  { file: 'card_phone_dryer', build: phoneDryer, rarity: ['RARE', 'نادر', '#2f9bff', '#001a3a'], ar: 'مجفف الموبايلات النووي ٣٠٠٠', en: 'NUCLEAR PHONE DRYER 3000',
    stats: [['DRYING', 'التنشيف', 4], ['FLAVOR', 'الطعم', 5], ['SAFETY', 'الأمان', 1], ['GUEST SHOCK', 'صدمة الضيوف', 5]],
    parts: 'حلة الرز + سشوار + نار البوتاجاز', quote: '«الرز بيشفط المية... وأنا هزوّد عليه نار»', result: 'النتيجة: الرز بيرن', ep: 'مجفف الموبايلات النووي' },
];

// ---------- 2D card ----------
const card = document.getElementById('card'); const g = card.getContext('2d'); const CW = 1080, CH = 1350;
function px(s, x, y, size, color, align = 'left', shadow = true) { g.font = `${size}px PS2P`; g.textAlign = align; g.textBaseline = 'top'; g.direction = 'ltr'; if (shadow) { g.fillStyle = '#000'; g.fillText(s, x + 3, y + 3); } g.fillStyle = color; g.fillText(s, x, y); }
function ar(s, x, y, size, color, align = 'right', font = 'Lalezar') { g.font = `${size}px ${font}`; g.textAlign = align; g.textBaseline = 'top'; g.direction = 'rtl'; g.fillStyle = '#000'; for (const [dx, dy] of [[3, 3], [-2, 0], [2, 0], [0, -2], [0, 2]]) g.fillText(s, x + dx, y + dy); g.fillStyle = color; g.fillText(s, x, y); g.direction = 'ltr'; }
function ibrahimFace(x, y, s) {
  const u = s / 32; const R = (a, b, w, h, c) => { g.fillStyle = c; g.fillRect(x + a * u, y + b * u, w * u, h * u); };
  g.fillStyle = '#b27448'; g.beginPath(); g.arc(x + 16 * u, y + 17 * u, 14 * u, 0, 7); g.fill();
  R(2, 12, 4, 9, '#1b1410'); R(26, 12, 4, 9, '#1b1410'); R(6, 3, 20, 4, '#c9a227'); R(8, 2, 6, 6, '#335a3a'); R(18, 2, 6, 6, '#335a3a');
  R(8, 11, 6, 4, '#fff'); R(18, 11, 6, 4, '#fff'); R(9, 12, 4, 1, '#111'); R(10, 13, 2, 2, '#111'); R(19, 12, 4, 1, '#111'); R(20, 13, 2, 2, '#111');
  R(8, 19, 16, 3, '#111'); R(6, 20, 3, 3, '#111'); R(23, 20, 3, 3, '#111'); R(10, 23, 12, 3, '#3a0d0d'); R(11, 23, 3, 2, '#fff'); R(15, 23, 3, 2, '#fff'); R(19, 23, 2, 2, '#fff');
}
function drawCard(i, artCanvas) {
  const c = CARDS[i]; const [rEn, rAr, rc, rd] = c.rarity;
  g.imageSmoothingEnabled = false; g.clearRect(0, 0, CW, CH);
  // frame
  g.fillStyle = rc; g.fillRect(0, 0, CW, CH); g.fillStyle = '#000'; g.fillRect(14, 14, CW - 28, CH - 28);
  const bg = g.createLinearGradient(0, 0, 0, CH); bg.addColorStop(0, rd); bg.addColorStop(1, '#05050f'); g.fillStyle = bg; g.fillRect(22, 22, CW - 44, CH - 44);
  for (let y = 22; y < CH - 22; y += 4) { g.fillStyle = 'rgba(255,255,255,0.025)'; g.fillRect(22, y, CW - 44, 1); }
  // header
  px('INVENTION CARD', 56, 52, 22, '#ffffff'); ar('اختراعات إبراهيم', CW - 56, 36, 44, '#ffe14a', 'right', 'ReemKufi');
  g.fillStyle = rc; g.fillRect(56, 92, 460, 44); px(rEn, 72, 104, 20, '#000', 'left', false); g.font = '34px Lalezar'; g.direction = 'rtl'; g.textAlign = 'right'; g.textBaseline = 'top'; g.fillStyle = '#000'; g.fillText(rAr, 500, 88); g.direction = 'ltr';
  // art window
  const ax = 56, ay = 160, aw = CW - 112, ah = 540;
  const rad = g.createRadialGradient(ax + aw / 2, ay + ah * 0.55, 20, ax + aw / 2, ay + ah * 0.55, aw * 0.7); rad.addColorStop(0, '#ffffff'); rad.addColorStop(0.25, rc); rad.addColorStop(1, rd);
  g.fillStyle = rad; g.fillRect(ax, ay, aw, ah);
  g.save(); g.beginPath(); g.rect(ax, ay, aw, ah); g.clip(); g.translate(ax + aw / 2, ay + ah * 0.55);
  for (let k = 0; k < 20; k++) { g.rotate(Math.PI / 10); g.fillStyle = k % 2 ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.10)'; g.beginPath(); g.moveTo(0, 0); g.lineTo(900, -140); g.lineTo(900, 140); g.fill(); }
  g.restore();
  g.save(); g.beginPath(); g.rect(ax, ay, aw, ah); g.clip(); g.drawImage(artCanvas, 0, 0, AW, AH, ax, ay - 10, aw, aw * AH / AW); g.restore();
  for (let y = ay; y < ay + ah; y += 3) { g.fillStyle = 'rgba(0,0,0,0.08)'; g.fillRect(ax, y, aw, 1); }
  g.strokeStyle = '#fff'; g.lineWidth = 6; g.strokeRect(ax, ay, aw, ah); g.strokeStyle = rc; g.lineWidth = 2; g.strokeRect(ax + 8, ay + 8, aw - 16, ah - 16);
  // sparkle stars in the art corners
  for (const [sx, sy] of [[ax + 60, ay + 60], [ax + aw - 70, ay + 90], [ax + aw - 110, ay + ah - 80]]) { g.fillStyle = '#fff6a0'; g.fillRect(sx - 3, sy - 18, 6, 36); g.fillRect(sx - 18, sy - 3, 36, 6); g.fillStyle = '#ffd000'; g.fillRect(sx - 6, sy - 6, 12, 12); }
  // name plate
  const ny = ay + ah + 18; g.fillStyle = 'rgba(0,0,0,0.65)'; g.fillRect(56, ny, CW - 112, 130); g.strokeStyle = rc; g.lineWidth = 3; g.strokeRect(56, ny, CW - 112, 130);
  ar(c.ar, CW - 80, ny + 6, 66, '#ffffff', 'right', 'ReemKufi'); px(c.en, 80, ny + 92, 22, rc);
  // stats
  const sy0 = ny + 146; g.fillStyle = 'rgba(0,0,30,0.7)'; g.fillRect(56, sy0, CW - 112, 200); g.strokeStyle = '#fff'; g.lineWidth = 2; g.strokeRect(56, sy0, CW - 112, 200);
  c.stats.forEach(([en, a, n], k) => {
    const y = sy0 + 14 + k * 46; ar(a, CW - 80, y - 6, 30, '#fff'); px(en, 80, y + 8, 14, '#9fd0ff');
    for (let b = 0; b < 6; b++) { const bx = 380 + b * 52; g.fillStyle = '#223'; g.fillRect(bx, y + 4, 44, 26); if (b < n) { g.fillStyle = n === 0 ? '#555' : (en.includes('SAFE') || en.includes('APPROVAL') || en === 'BRAKES') ? '#ff3a3a' : '#3df05a'; g.fillRect(bx + 3, y + 7, 38, 20); g.fillStyle = 'rgba(255,255,255,0.4)'; g.fillRect(bx + 3, y + 7, 38, 5); } }
    if (n === 0) px('0', 380 + 6 * 52 + 6, y + 8, 18, '#ff3a3a');
  });
  // parts + quote + result
  const qy = sy0 + 210;
  ar('المكونات: ' + c.parts, CW - 70, qy, 30, '#ffd400');
  ar(c.quote, CW - 70, qy + 42, 34, '#ffffff');
  ar(c.result, CW - 70, qy + 88, 30, '#ff8a8a');
  // footer: inventor badge + episode
  const fy = CH - 120; g.fillStyle = '#000'; g.fillRect(40, fy, CW - 80, 84); g.strokeStyle = rc; g.lineWidth = 2; g.strokeRect(40, fy, CW - 80, 84);
  ibrahimFace(CW - 128, fy + 10, 64); ar('المخترع: إبراهيم', CW - 150, fy + 10, 32, '#fff'); ar('ظهر في: ' + c.ep, CW - 150, fy + 46, 24, '#9fd0ff');
  px('PRESS START', 64, fy + 34, 18, Math.random() > -1 ? '#ffe14a' : '#fff');
}
function renderArt(i) {
  const s = makeScene(); turntable(s, 0); const { cam } = CARDS[i].build(s);
  camera.position.copy(cam[0]); camera.lookAt(cam[1]); camera.updateProjectionMatrix();
  renderer.clear(); renderer.render(s, camera); return glc;
}
window.drawCardN = (i) => { drawCard(i, renderArt(i)); return card.toDataURL('image/png'); };
window.CARD_FILES = CARDS.map(c => c.file);
document.fonts.load('20px PS2P').then(() => document.fonts.load('20px Lalezar', 'ع')).then(() => document.fonts.load('700 20px ReemKufi', 'ع')).then(() => { window.READY = true; });

// ---------- album cover: all the cards ----------
window.drawCover = async () => {
  const load = (src) => new Promise((res) => { const im = new Image(); im.onload = () => res(im); im.src = src; });
  const ims = await Promise.all(CARDS.map(c => load(c.file + '.png')));
  g.imageSmoothingEnabled = true; g.clearRect(0, 0, CW, CH);
  const bg = g.createRadialGradient(CW / 2, CH / 2, 50, CW / 2, CH / 2, 900); bg.addColorStop(0, '#2a1a4a'); bg.addColorStop(1, '#05050f'); g.fillStyle = bg; g.fillRect(0, 0, CW, CH);
  g.save(); g.translate(CW / 2, CH / 2 + 60); for (let k = 0; k < 24; k++) { g.rotate(Math.PI / 12); g.fillStyle = k % 2 ? 'rgba(255,225,74,0.06)' : 'rgba(0,0,0,0)'; g.beginPath(); g.moveTo(0, 0); g.lineTo(1200, -160); g.lineTo(1200, 160); g.fill(); } g.restore();
  ar('اختراعات إبراهيم', CW / 2, 20, 84, '#ffe14a', 'center', 'ReemKufi');
  px('COLLECT THEM ALL!', CW / 2, 132, 26, '#ffffff', 'center');
  const cw = 250, ch = 312; const pos = [[14, 215], [278, 215], [542, 215], [806, 215], [14, 600], [278, 600], [542, 600], [806, 600]]; const rot = [-0.035, 0.02, 0.035, -0.025, 0.03, -0.02, 0.025, -0.03];
  ims.forEach((im, i) => { g.save(); g.translate(pos[i][0] + cw / 2, pos[i][1] + ch / 2); g.rotate(rot[i]); g.fillStyle = 'rgba(0,0,0,0.6)'; g.fillRect(-cw / 2 + 10, -ch / 2 + 14, cw, ch); g.drawImage(im, -cw / 2, -ch / 2, cw, ch); g.restore(); });
  for (let y = 0; y < CH; y += 4) { g.fillStyle = 'rgba(0,0,0,0.06)'; g.fillRect(0, y, CW, 1); }
  return card.toDataURL('image/png');
};
