// Jet Dishwasher 3000 — deterministic low-poly Y2K console cutscene.
// window.renderFrame(t) draws the frame at time t (seconds) into #out.
import * as THREE from 'three';

const W = 640, H = 480;
const DUR = 38.6;

// ---------- utils ----------
function rng(seed) { let a = seed >>> 0; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, k) => a + (b - a) * k;
const easeOut = k => 1 - Math.pow(1 - k, 3);
const easeInOut = k => k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
const easeBack = k => { const c1 = 1.9, c3 = c1 + 1; return 1 + c3 * Math.pow(k - 1, 3) + c1 * Math.pow(k - 1, 2); };
const seg = (t, a, b) => clamp((t - a) / (b - a));
const hash = (n) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const noise1 = (x) => { const i = Math.floor(x), f = x - i; const u = f * f * (3 - 2 * f); return lerp(hash(i), hash(i + 1), u) * 2 - 1; };

function canvasTex(w, h, draw, repeat) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d'); draw(g, w, h);
  const t = new THREE.CanvasTexture(c);
  t.magFilter = THREE.NearestFilter; t.minFilter = THREE.NearestFilter; t.generateMipmaps = false;
  t.colorSpace = THREE.SRGBColorSpace;
  if (repeat) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(repeat[0], repeat[1]); }
  t.userData = { canvas: c, g };
  return t;
}
const M = (color, o = {}) => new THREE.MeshLambertMaterial({ color, flatShading: true, ...o });
const P = (color, o = {}) => new THREE.MeshPhongMaterial({ color, flatShading: true, shininess: 60, specular: 0x666666, ...o });
function mesh(geo, mat, x = 0, y = 0, z = 0, parent) { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); if (parent) parent.add(m); return m; }
const box = (w, h, d) => new THREE.BoxGeometry(w, h, d);
const cyl = (rt, rb, h, s = 7, open = false) => new THREE.CylinderGeometry(rt, rb, h, s, 1, open);

// ---------- renderer ----------
const glCanvas = document.createElement('canvas'); glCanvas.width = W; glCanvas.height = H;
const renderer = new THREE.WebGLRenderer({ canvas: glCanvas, antialias: false, preserveDrawingBuffer: true });
renderer.setPixelRatio(1); renderer.setSize(W, H, false);
renderer.outputColorSpace = THREE.SRGBColorSpace;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(55, W / H, 0.05, 80);
const ambient = new THREE.AmbientLight(0xffffff, 1.1); scene.add(ambient);
const key = new THREE.DirectionalLight(0xfff1d6, 1.9); key.position.set(-3, 6, 5); scene.add(key);
const tubeLight = new THREE.PointLight(0x9dffc0, 6, 9, 1.2); tubeLight.position.set(0, 2.7, -1); scene.add(tubeLight);

const kitchen = new THREE.Group(); scene.add(kitchen);
const exterior = new THREE.Group(); scene.add(exterior);

// ---------- textures ----------
const tileTex = canvasTex(32, 32, (g) => {
  g.fillStyle = '#2fb5b0'; g.fillRect(0, 0, 32, 32);
  g.fillStyle = '#5fd6cf'; g.fillRect(2, 2, 12, 3); g.fillRect(18, 18, 12, 3);
  g.fillStyle = '#1d7f7c'; g.fillRect(0, 15, 32, 2); g.fillRect(15, 0, 2, 32);
  g.fillStyle = '#e8f2ee'; g.fillRect(13, 13, 2, 2); g.fillRect(29, 0, 3, 2); // chips
}, [10, 4]);
const floorTex = canvasTex(16, 16, (g) => {
  g.fillStyle = '#d9c9a3'; g.fillRect(0, 0, 16, 16); g.fillStyle = '#8a5a3c'; g.fillRect(0, 0, 8, 8); g.fillRect(8, 8, 8, 8);
}, [10, 8]);
const plasterTex = canvasTex(16, 16, (g) => { g.fillStyle = '#e9dfc4'; g.fillRect(0, 0, 16, 16); g.fillStyle = '#d7caa8'; g.fillRect(3, 5, 2, 1); g.fillRect(11, 12, 2, 1); }, [6, 2]);
const woodTex = canvasTex(16, 16, (g) => { g.fillStyle = '#b07a43'; g.fillRect(0, 0, 16, 16); g.fillStyle = '#7a4f2a'; for (let y = 0; y < 16; y += 5) g.fillRect(0, y, 16, 1); g.fillStyle = '#c99256'; g.fillRect(3, 2, 6, 1); });
const clothTex = canvasTex(16, 16, (g) => { for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) { g.fillStyle = (x + y) % 2 ? '#d22' : '#fff'; g.fillRect(x * 4, y * 4, 4, 4); } }, [3, 2]);
const floralTex = canvasTex(32, 32, (g) => {
  g.fillStyle = '#ec86ad'; g.fillRect(0, 0, 32, 32);
  const r = rng(4); for (let i = 0; i < 9; i++) { const x = r() * 28 | 0, y = r() * 28 | 0; g.fillStyle = '#fff3a6'; g.fillRect(x + 1, y, 2, 4); g.fillRect(x, y + 1, 4, 2); g.fillStyle = '#c0306a'; g.fillRect(x + 1, y + 1, 2, 2); }
}, [3, 3]);
const sheetTex = canvasTex(32, 32, (g) => { g.fillStyle = '#9ec8ff'; g.fillRect(0, 0, 32, 32); const r = rng(9); for (let i = 0; i < 12; i++) { g.fillStyle = ['#ffffff', '#ffd23f', '#ff6fa5'][i % 3]; g.fillRect(r() * 30 | 0, r() * 30 | 0, 3, 3); } }, [2, 2]);
const stripeTex = canvasTex(16, 16, (g) => { g.fillStyle = '#7f8fa8'; g.fillRect(0, 0, 16, 16); g.fillStyle = '#3d4e6b'; g.fillRect(2, 0, 3, 16); g.fillRect(10, 0, 2, 16); }, [3, 2]);
const skyTex = canvasTex(64, 32, (g) => {
  const gr = g.createLinearGradient(0, 0, 0, 32); gr.addColorStop(0, '#f5b26b'); gr.addColorStop(1, '#f6dca0'); g.fillStyle = gr; g.fillRect(0, 0, 64, 32);
  const r = rng(2); g.fillStyle = '#c99a78';
  for (let x = 0; x < 64; x += 6) { const h = 8 + r() * 14 | 0; g.fillRect(x, 32 - h, 5, h); g.fillStyle = '#ddd'; g.fillRect(x + 1, 32 - h - 2, 2, 2); g.fillStyle = '#c99a78'; }
});
function textTex(w, h, bg, draw) { return canvasTex(w, h, (g) => { if (bg) { g.fillStyle = bg; g.fillRect(0, 0, w, h); } draw(g, w, h); }); }
const signTex = textTex(64, 32, '#c8a26b', (g) => { g.fillStyle = '#111'; g.font = '20px PS2P'; g.textBaseline = 'middle'; g.textAlign = 'center'; g.fillText('3000', 32, 18); });
const turboTex = textTex(64, 16, '#111', (g) => { g.fillStyle = '#ffd400'; g.font = '8px PS2P'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('TURBO', 32, 9); });
const tinTex = textTex(64, 32, '#1d56c9', (g) => { g.fillStyle = '#fff'; g.fillRect(0, 10, 64, 12); g.fillStyle = '#c11'; g.font = '14px Lalezar'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.direction = 'rtl'; g.fillText('جبنة', 32, 17); });
const starTex = canvasTex(16, 16, (g) => { g.fillStyle = '#fff6a0'; g.fillRect(7, 0, 2, 16); g.fillRect(0, 7, 16, 2); g.fillStyle = '#ffd000'; g.fillRect(6, 6, 4, 4); g.fillStyle = '#fff'; g.fillRect(7, 7, 2, 2); });
const puffTex = canvasTex(16, 16, (g) => { g.fillStyle = '#fff'; g.beginPath(); g.arc(8, 8, 7, 0, 7); g.fill(); g.fillStyle = '#d9d9d9'; g.beginPath(); g.arc(10, 10, 4, 0, 7); g.fill(); });
const dropTex = canvasTex(8, 16, (g) => { g.fillStyle = '#8fd8ff'; g.fillRect(2, 0, 4, 16); g.fillStyle = '#e8fbff'; g.fillRect(3, 2, 2, 6); });
const flakeTex = canvasTex(4, 4, (g) => { g.fillStyle = '#ccc'; g.fillRect(0, 0, 4, 4); g.fillStyle = '#777'; g.fillRect(2, 2, 2, 2); });
const pigeonTex = canvasTex(16, 8, (g) => { g.fillStyle = '#556'; g.fillRect(0, 2, 6, 2); g.fillRect(10, 2, 6, 2); g.fillRect(5, 3, 6, 3); g.fillRect(6, 0, 4, 2); });
const facadeTex = canvasTex(64, 64, (g) => {
  g.fillStyle = '#d9a95e'; g.fillRect(0, 0, 64, 64); g.fillStyle = '#c6924a'; for (let y = 0; y < 64; y += 16) g.fillRect(0, y + 14, 64, 2);
  for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) { const X = x * 16 + 4, Y = y * 16 + 3; g.fillStyle = '#3a2a1c'; g.fillRect(X, Y, 8, 9); g.fillStyle = '#6b8f3a'; g.fillRect(X - 2, Y, 2, 9); g.fillRect(X + 8, Y, 2, 9); g.fillStyle = '#f4d58a'; if ((x + y) % 3 === 0) g.fillRect(X + 1, Y + 1, 6, 7); }
}, [2, 2]);

// ---------- room ----------
const tileMat = M(0xffffff, { map: tileTex });
const wallMats = [];
function wall(w, h, x, y, z, ry, mat) { const m = mesh(new THREE.PlaneGeometry(w, h), mat, x, y, z, kitchen); m.rotation.y = ry; return m; }
const backWall = wall(10, 3.2, 0, 1.6, -4, 0, tileMat);
const leftWall = wall(8, 3.2, -5, 1.6, 0, Math.PI / 2, tileMat);
const rightWallMat = M(0xffffff, { map: plasterTex });
// right wall with doorway gap (z 0.45..1.55, y 0..2.2)
wall(4.45, 3.2, 5, 1.6, -1.775, -Math.PI / 2, tileMat);
wall(2.45, 3.2, 5, 1.6, 2.775, -Math.PI / 2, tileMat);
wall(1.1, 1.0, 5, 2.7, 1.0, -Math.PI / 2, tileMat);
const floorMat = M(0xffffff, { map: floorTex });
const floor = mesh(new THREE.PlaneGeometry(10, 8), floorMat, 0, 0, 0, kitchen); floor.rotation.x = -Math.PI / 2;
const ceilMat = M(0xe8e4d0);
const ceil = mesh(new THREE.PlaneGeometry(10, 8), ceilMat, 0, 3.2, 0, kitchen); ceil.rotation.x = Math.PI / 2;
wallMats.push(tileMat, floorMat, ceilMat);
// hallway backlight behind door
const hallMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
const hall = mesh(new THREE.PlaneGeometry(2.4, 3), hallMat, 5.6, 1.4, 1.0, kitchen); hall.rotation.y = -Math.PI / 2;
// door (hinge at z=0.45)
const doorPivot = new THREE.Group(); doorPivot.position.set(5, 0, 0.45); kitchen.add(doorPivot);
const doorMat = M(0x8a5a2b, { map: woodTex });
mesh(box(0.06, 2.2, 1.1), doorMat, 0, 1.1, 0.55, doorPivot);
mesh(new THREE.SphereGeometry(0.05, 5, 4), P(0xd4b14a), -0.07, 1.05, 0.95, doorPivot);

// counter
const counterMat = M(0xd8d2c0); const cabinetMat = M(0x6f9f4f, { map: woodTex });
mesh(box(6.2, 0.92, 0.75), cabinetMat, 0.5, 0.46, -3.62, kitchen);
const counterTop = mesh(box(6.3, 0.08, 0.8), counterMat, 0.5, 0.96, -3.6, kitchen);
wallMats.push(counterMat, cabinetMat);
// sink
const sinkMat = P(0xf4f4f0);
mesh(box(1.3, 0.1, 0.62), sinkMat, 0, 1.02, -3.6, kitchen);
const faucet = new THREE.Group(); faucet.position.set(0.55, 1.0, -3.92); kitchen.add(faucet);
const chrome = P(0xc8d0d8, { shininess: 100, specular: 0xffffff });
mesh(cyl(0.035, 0.035, 0.5, 6), chrome, 0, 0.25, 0, faucet);
const fspout = mesh(cyl(0.03, 0.03, 0.35, 6), chrome, 0, 0.48, 0.16, faucet); fspout.rotation.x = Math.PI / 2;
// stove + gas cylinder
const stove = new THREE.Group(); stove.position.set(-2.1, 1.0, -3.6); kitchen.add(stove);
mesh(box(0.9, 0.12, 0.6), P(0xf0f0ea), 0, 0.06, 0, stove);
for (const sx of [-0.22, 0.22]) { const r = mesh(new THREE.TorusGeometry(0.12, 0.03, 4, 8), M(0x222222), sx, 0.14, 0, stove); r.rotation.x = Math.PI / 2; }
const gas = mesh(cyl(0.22, 0.22, 0.6, 8), M(0xff7a1a), -2.1, 0.3, -2.95, kitchen);
mesh(new THREE.SphereGeometry(0.22, 8, 3, 0, Math.PI * 2, 0, Math.PI / 2), M(0xff7a1a), -2.1, 0.6, -2.95, kitchen);
mesh(cyl(0.05, 0.05, 0.12, 6), M(0x888888), -2.1, 0.86, -2.95, kitchen);
// fridge
const fridge = new THREE.Group(); fridge.position.set(-4.45, 0, -2.9); kitchen.add(fridge);
mesh(box(0.9, 2.0, 0.85), P(0xf2e6c4), 0, 1.0, 0, fridge);
mesh(box(0.04, 0.4, 0.06), chrome, 0.47, 1.3, 0.3, fridge);
{ const r = rng(11); for (let i = 0; i < 9; i++) mesh(box(0.02, 0.1, 0.12), M([0xff3355, 0x33aaff, 0xffdd22, 0x44cc66][i % 4]), 0.46, 0.8 + r() * 1.0, -0.3 + r() * 0.6, fridge); }
// window + shutters + laundry
const win = new THREE.Group(); win.position.set(-3.1, 1.85, -3.99); kitchen.add(win);
const skyMat = new THREE.MeshBasicMaterial({ map: skyTex });
mesh(new THREE.PlaneGeometry(1.3, 1.0), skyMat, 0, 0, 0, win);
const frameMat = M(0x7a4a22, { map: woodTex });
mesh(box(1.4, 0.07, 0.08), frameMat, 0, 0.53, 0.02, win); mesh(box(1.4, 0.07, 0.08), frameMat, 0, -0.53, 0.02, win);
mesh(box(0.07, 1.1, 0.08), frameMat, -0.68, 0, 0.02, win); mesh(box(0.07, 1.1, 0.08), frameMat, 0.68, 0, 0.02, win);
for (const s of [-1, 1]) { const sh = mesh(box(0.6, 1.0, 0.03), M(0x5f8f3a), s * 1.0, 0, 0.25, win); sh.rotation.y = s * 0.9; }
mesh(box(1.3, 0.01, 0.01), M(0x333333), 0, 0.3, 0.01, win);
for (let i = 0; i < 4; i++) mesh(new THREE.PlaneGeometry(0.16, 0.2), new THREE.MeshBasicMaterial({ color: [0xff5577, 0xffffff, 0x3399ff, 0xffcc00][i] }), -0.45 + i * 0.3, 0.18, 0.012, win);
// table with checked cloth
const table = new THREE.Group(); table.position.set(-3.3, 0, 0.4); kitchen.add(table);
mesh(box(1.4, 0.06, 1.0), M(0xffffff, { map: clothTex }), 0, 0.82, 0, table);
for (const [x, z] of [[-0.6, -0.4], [0.6, -0.4], [-0.6, 0.4], [0.6, 0.4]]) mesh(box(0.06, 0.8, 0.06), M(0x6b4a2a), x, 0.4, z, table);
// fluorescent tube
const tubePivot = new THREE.Group(); tubePivot.position.set(0, 3.15, -1.2); kitchen.add(tubePivot);
const tubeMat = new THREE.MeshBasicMaterial({ color: 0xe8fff0 });
const tube = mesh(cyl(0.04, 0.04, 1.4, 6), tubeMat, 0, -0.1, 0, tubePivot); tube.rotation.z = Math.PI / 2;
mesh(box(1.5, 0.05, 0.1), M(0xdddddd), 0, -0.03, 0, tubePivot);

// ---------- dish mountain ----------
const dishes = new THREE.Group(); dishes.position.set(0, 1.07, -3.6); kitchen.add(dishes);
const dishMats = [P(0xffffff), P(0xb9c1c9, { shininess: 90, specular: 0xffffff }), M(0x2a2a2a), P(0xbfe6ff, { transparent: true, opacity: 0.8 }), P(0xf1d36b)];
const dishItems = [];
function makeDish(kind) {
  const g = new THREE.Group();
  if (kind === 0) mesh(cyl(0.2, 0.15, 0.035, 8), dishMats[0], 0, 0, 0, g);
  else if (kind === 1) { mesh(cyl(0.17, 0.15, 0.2, 7, true), dishMats[1], 0, 0, 0, g); mesh(box(0.46, 0.03, 0.04), dishMats[1], 0, 0.08, 0, g); }
  else if (kind === 2) { mesh(cyl(0.17, 0.15, 0.04, 8), dishMats[2], 0, 0, 0, g); mesh(box(0.28, 0.03, 0.04), dishMats[2], 0.3, 0, 0, g); }
  else if (kind === 3) mesh(cyl(0.04, 0.035, 0.11, 6), dishMats[3], 0, 0, 0, g);
  else if (kind === 4) mesh(box(0.025, 0.28, 0.025), dishMats[1], 0, 0, 0, g);
  else { // ful pot (dented)
    const pts = [new THREE.Vector2(0.0, 0), new THREE.Vector2(0.16, 0), new THREE.Vector2(0.2, 0.12), new THREE.Vector2(0.17, 0.24), new THREE.Vector2(0.09, 0.3), new THREE.Vector2(0.1, 0.36)];
    const m = mesh(new THREE.LatheGeometry(pts, 7), dishMats[1], 0, -0.15, 0, g); m.scale.x = 1.15;
  }
  return g;
}
{
  const r = rng(7);
  for (let i = 0; i < 70; i++) {
    const h = r() * 1.35; const rad = (1.45 - h) * 0.42 * (0.4 + r() * 0.6); const a = r() * Math.PI * 2;
    const kind = i === 5 ? 5 : [0, 0, 1, 2, 0, 3, 4, 1, 0, 4][(r() * 10) | 0];
    const d = makeDish(kind); d.position.set(Math.cos(a) * rad, h, Math.sin(a) * rad * 0.6);
    d.rotation.set((r() - .5) * 1.6, r() * 6, (r() - .5) * 1.6); dishes.add(d); dishItems.push({ d, base: d.position.clone(), rot: d.rotation.clone(), kind, r: r() });
  }
}
const bonusPots = [];
for (let i = 0; i < 3; i++) { const d = makeDish(1); d.position.set((i - 1) * 0.14, 1.45 + i * 0.18, 0); d.rotation.z = (i - 1) * 0.4; d.visible = false; dishes.add(d); bonusPots.push(d); }
const glintSprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: starTex, transparent: true, depthTest: false })); glintSprite.scale.set(0.3, 0.3, 1); glintSprite.visible = false; kitchen.add(glintSprite);

// ---------- invention ----------
const inv = new THREE.Group(); inv.position.set(1.85, 1.0, -3.55); kitchen.add(inv);
const engineRed = P(0xd8231b); const finMat = M(0x3a3a3a); const rust = M(0x8a4a22); const tapeMat = P(0xc9ccd1, { shininess: 30 });
const crate = mesh(box(0.75, 0.32, 0.5), M(0xffffff, { map: woodTex }), 0, 0.16, 0, inv);
const engine = new THREE.Group(); engine.position.set(0, 0.32, 0); inv.add(engine);
const engineParts = [];
engineParts.push(mesh(box(0.46, 0.34, 0.38), engineRed, 0, 0.17, 0, engine));
const fins = [];
for (let i = 0; i < 6; i++) fins.push(mesh(box(0.36, 0.025, 0.32), finMat, -0.03, 0.38 + i * 0.045, 0, engine));
const exhaust = mesh(cyl(0.04, 0.04, 0.5, 6), rust, 0.2, 0.55, -0.08, engine); exhaust.rotation.z = -0.5;
const flywheel = mesh(cyl(0.16, 0.16, 0.06, 8), finMat, -0.27, 0.18, 0.05, engine); flywheel.rotation.z = Math.PI / 2;
const cordHandle = mesh(box(0.08, 0.04, 0.04), M(0xff2222), -0.33, 0.18, 0.2, engine);
const sign = mesh(new THREE.PlaneGeometry(0.3, 0.15), M(0xffffff, { map: signTex }), 0, 0.19, 0.195, engine); sign.rotation.z = 0.08;
// mirror with flower + evil eye
const mirrorArm = mesh(cyl(0.012, 0.012, 0.3, 4), chrome, 0.24, 0.5, 0.1, engine); mirrorArm.rotation.z = -0.4;
mesh(cyl(0.08, 0.08, 0.02, 8), chrome, 0.32, 0.65, 0.1, engine).rotation.x = Math.PI / 2;
mesh(new THREE.SphereGeometry(0.04, 5, 4), M(0xff4fa0), 0.25, 0.6, 0.15, engine);
const evil = new THREE.Group(); evil.position.set(0.3, 0.52, 0.16); engine.add(evil);
mesh(cyl(0.035, 0.035, 0.01, 8), M(0x1f5fd8), 0, 0, 0, evil).rotation.x = Math.PI / 2;
mesh(cyl(0.018, 0.018, 0.012, 8), M(0xffffff), 0, 0, 0.004, evil).rotation.x = Math.PI / 2;
// duct tape strapping crate to faucet pipe
for (let i = 0; i < 3; i++) { const t = mesh(box(1.4, 0.06, 0.03), tapeMat, -0.65, 0.12 + i * 0.16, -0.32, inv); t.rotation.y = 0.05 * i; }
const tapeFlap = mesh(new THREE.PlaneGeometry(0.1, 0.06), new THREE.MeshLambertMaterial({ color: 0xc9ccd1, side: THREE.DoubleSide }), 0.06, 0.44, -0.3, inv);
// hose (rebuilt per frame)
const hoseMat = M(0xc0201a);
let hoseMesh = null;
const nozzle = new THREE.Group(); kitchen.add(nozzle);
mesh(new THREE.ConeGeometry(0.05, 0.18, 6), P(0xd4a62a, { shininess: 90 }), 0, 0, 0, nozzle);
// multi-plug + wires
const plug = new THREE.Group(); plug.position.set(3.0, 1.35, -3.97); kitchen.add(plug);
mesh(box(0.3, 0.12, 0.06), P(0xf4f4f4), 0, 0, 0.03, plug);
const plugSwitch = mesh(box(0.06, 0.06, 0.04), M(0xff2222), 0.1, 0, 0.07, plug);
const wireMats = [M(0xd02020), M(0xffd400), M(0x2050e0)];
const wires = [];
for (let i = 0; i < 3; i++) wires.push({ mat: wireMats[i], mesh: null, i });
// stool + cheese-tin control box + TURBO button
const stool = new THREE.Group(); stool.position.set(0.75, 0, -1.55); kitchen.add(stool);
mesh(cyl(0.22, 0.22, 0.05, 8), M(0x3a77c8), 0, 0.75, 0, stool);
for (let i = 0; i < 3; i++) { const a = i * 2.1; const l = mesh(box(0.04, 0.76, 0.04), M(0x999999), Math.cos(a) * 0.16, 0.37, Math.sin(a) * 0.16, stool); }
const tin = mesh(cyl(0.16, 0.16, 0.1, 8), M(0xffffff, { map: tinTex }), 0, 0.82, 0, stool);
const btnGroup = new THREE.Group(); btnGroup.position.set(0, 0.87, 0); stool.add(btnGroup);
mesh(cyl(0.05, 0.05, 0.05, 8), M(0x222222), 0, 0.02, 0, btnGroup);
const btnCap = mesh(new THREE.SphereGeometry(0.09, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2), P(0xff1010, { emissive: 0x330000 }), 0, 0.045, 0, btnGroup);
const turboLabel = mesh(new THREE.PlaneGeometry(0.2, 0.05), M(0xffffff, { map: turboTex }), 0, 0.82, 0.162, stool);
// tarp (bedsheet)
const tarp = mesh(box(1.05, 0.95, 0.75), M(0xffffff, { map: sheetTex }), 1.85, 1.47, -3.5, kitchen);
// falling fin
const looseFin = mesh(box(0.36, 0.025, 0.32), finMat, 0, 0, 0, kitchen); looseFin.visible = false;

// ---------- characters ----------
const faceCache = new Map();
function drawFace(g, s, eyes, mouth, opts = {}) {
  // s = size of square; draws on transparent bg
  const u = s / 32;
  const R = (x, y, w, h, c) => { g.fillStyle = c; g.fillRect(x * u, y * u, w * u, h * u); };
  const soot = opts.soot;
  const brow = soot ? '#555' : '#2a1608';
  const white = '#ffffff', pupil = '#111';
  const red = opts.red;
  if (red) { g.fillStyle = 'rgba(220,20,20,0.45)'; g.beginPath(); g.ellipse(16 * u, 16 * u, 14 * u, 14 * u, 0, 0, 7); g.fill(); }
  // eyes
  const eye = (cx, side) => {
    switch (eyes) {
      case 'wide': R(cx - 4, 9, 8, 8, white); R(cx - 1, 12, 2, 2, pupil); R(cx - 4, 5, 8, 2, brow); break;
      case 'flat': R(cx - 4, 13, 8, 2, pupil); R(cx - 4, 10, 8, 1, brow); break;
      case 'pin': R(cx - 4, 9, 8, 8, white); R(cx, 12, 1, 1, pupil); R(cx - 4 - side, 5 - (side > 0 ? 1 : 0), 8, 2, brow); break;
      case 'smug': R(cx - 3, 12, 6, 3, white); R(cx - 3, 12, 6, 1, pupil); R(cx - 1, 13, 2, 2, pupil); R(cx - 4, 9 + (side > 0 ? 1 : 0), 8, 2, brow); break;
      case 'sparkle': R(cx - 3, 10, 6, 6, white); R(cx - 2, 11, 2, 2, '#ffd400'); R(cx + 1, 13, 1, 1, '#ffd400'); R(cx - 4, 7, 8, 2, brow); break;
      case 'closed': R(cx - 4, 13, 8, 1, pupil); R(cx - 4, 9, 8, 2, brow); break;
      case 'angry': R(cx - 3, 11, 6, 4, white); R(cx - 1, 12, 2, 2, pupil); g.fillStyle = brow; g.save(); g.translate(cx * u, 9 * u); g.rotate(side * 0.45); g.fillRect(-4 * u, -1 * u, 8 * u, 2 * u); g.restore(); break;
      case 'sad': R(cx - 3, 11, 6, 5, white); R(cx - 1, 13, 2, 2, pupil); g.fillStyle = brow; g.save(); g.translate(cx * u, 8 * u); g.rotate(-side * 0.4); g.fillRect(-4 * u, -1 * u, 8 * u, 2 * u); g.restore(); R(cx - 1 + side * 2, 17, 2, 3, '#4aa8ff'); break;
      case 'wild': R(cx - 4, 8, 8, 9, white); R(cx - 2 + side, 10, 3, 3, pupil); R(cx - 4, 4, 8, 2, brow); break;
      case 'soot': R(cx - 1, 12, 3, 3, white); break;
      case 'sootclosed': R(cx - 2, 13, 4, 1, '#999'); break;
      default: R(cx - 3, 11, 6, 5, white); R(cx - 1, 12, 2, 3, pupil); R(cx - 4, 8, 8, 2, brow);
    }
  };
  eye(10, -1); eye(22, 1);
  if (opts.browGlitch) { R(2, 0, 10, 2, brow); R(24, 1, 8, 2, brow); }
  // mustache (husband) under nose
  if (opts.stache) { R(8, 19, 16, 3, soot ? '#333' : '#111'); R(6, 20, 3, 3, soot ? '#333' : '#111'); R(23, 20, 3, 3, soot ? '#333' : '#111'); }
  const mc = '#3a0d0d', teeth = '#fff';
  const my = opts.stache ? 23 : 21;
  switch (mouth) {
    case 'talk1': R(12, my, 8, 3, mc); break;
    case 'talk2': R(11, my - 1, 10, 6, mc); R(12, my - 1, 8, 1, teeth); break;
    case 'scream': R(9, my - 2, 14, 9, mc); R(10, my - 2, 12, 2, teeth); R(12, my + 4, 8, 2, '#d0405a'); break;
    case 'hex': g.fillStyle = '#000'; g.beginPath(); { const cx = 16 * u, cy = (my + 3) * u, r = 7 * u; for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; g.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r * 0.9); } } g.fill(); break;
    case 'grin': R(9, my, 14, 4, mc); R(10, my, 3, 2, teeth); R(14, my, 3, 2, teeth); R(18, my, 3, 2, teeth); R(10, my + 2, 12, 1, teeth); break;
    case 'clench': R(10, my, 12, 3, teeth); R(10, my + 1, 12, 1, '#999'); break;
    case 'smile': R(11, my + 1, 10, 2, mc); R(10, my, 2, 1, mc); R(20, my, 2, 1, mc); break;
    case 'flat': R(12, my + 1, 8, 1, mc); break;
    case 'o': R(14, my, 4, 4, mc); break;
    case 'frown': R(11, my + 1, 10, 2, mc); R(10, my + 3, 2, 1, mc); R(20, my + 3, 2, 1, mc); break;
    default: R(12, my + 1, 8, 2, mc);
  }
}
function faceTexture(eyes, mouth, opts) {
  const k = eyes + '|' + mouth + '|' + JSON.stringify(opts);
  if (!faceCache.has(k)) faceCache.set(k, canvasTex(32, 32, (g, s) => drawFace(g, s, eyes, mouth, opts)));
  return faceCache.get(k);
}

function makeChar(cfg) {
  const root = new THREE.Group(); kitchen.add(root);
  const mats = [];
  const reg = m => { mats.push(m); m.userData.orig = m.color.clone(); return m; };
  const skin = reg(M(cfg.skin));
  const hips = new THREE.Group(); hips.position.y = cfg.hipY; root.add(hips);
  const legs = [];
  for (const s of [1, -1]) {
    const lp = new THREE.Group(); lp.position.set(s * cfg.legX, 0, 0); hips.add(lp);
    mesh(box(0.15, cfg.hipY - 0.06, 0.15), reg(M(0xffffff, { map: cfg.legTex || null, color: cfg.legColor })), 0, -(cfg.hipY - 0.06) / 2, 0, lp);
    mesh(box(0.17, 0.08, 0.28), reg(M(cfg.shoe)), 0, -cfg.hipY + 0.04, 0.05, lp);
    legs.push(lp);
  }
  const torso = new THREE.Group(); hips.add(torso);
  const torsoMesh = mesh(cfg.torsoGeo, reg(M(0xffffff, { map: cfg.torsoTex || null, color: cfg.torsoColor })), 0, cfg.torsoY, 0, torso);
  if (cfg.skirt) mesh(cfg.skirt, reg(M(0xffffff, { map: cfg.torsoTex })), 0, -0.25, 0, hips);
  const arms = [];
  for (const s of [1, -1]) {
    const sh = new THREE.Group(); sh.position.set(s * cfg.shoulderX, cfg.shoulderY, 0); torso.add(sh);
    mesh(box(0.13, 0.36, 0.13), cfg.sleeve ? reg(M(0xffffff, { map: cfg.torsoTex })) : skin, 0, -0.18, 0, sh);
    const el = new THREE.Group(); el.position.y = -0.34; sh.add(el);
    mesh(box(0.11, 0.32, 0.11), skin, 0, -0.16, 0, el);
    const hand = mesh(new THREE.IcosahedronGeometry(0.085, 0), reg(M(cfg.hand)), 0, -0.36, 0.01, el);
    const thumb = mesh(box(0.04, 0.09, 0.04), reg(M(cfg.hand)), s * -0.06, -0.33, 0.04, el);
    arms.push({ sh, el, hand, thumb });
  }
  const neck = new THREE.Group(); neck.position.y = cfg.neckY; torso.add(neck);
  const head = new THREE.Group(); head.position.y = cfg.headR * 0.95; neck.add(head);
  mesh(new THREE.SphereGeometry(cfg.headR, 8, 6), skin, 0, 0, 0, head);
  mesh(new THREE.ConeGeometry(0.06, 0.12, 4), skin, 0, -0.02, cfg.headR * 0.98, head).rotation.x = Math.PI / 2;
  const faceMat = new THREE.MeshBasicMaterial({ transparent: true, alphaTest: 0.5 });
  const face = mesh(new THREE.PlaneGeometry(cfg.headR * 1.7, cfg.headR * 1.7), faceMat, 0, 0, cfg.headR * 0.93, head);
  const extras = cfg.build ? cfg.build(head, torso, reg) : {};
  // afro (aftermath)
  const afroMat = M(0x1a1a1a);
  const afro = new THREE.Group(); head.add(afro); afro.visible = false;
  { const r = rng(cfg.seed); for (let i = 0; i < 9; i++) { const a = r() * 6.28, b = r() * 1.2; mesh(new THREE.IcosahedronGeometry(cfg.headR * (0.55 + r() * 0.2), 0), afroMat, Math.cos(a) * Math.sin(b) * cfg.headR * 0.9, cfg.headR * 0.55 + Math.cos(b) * cfg.headR * 0.5, Math.sin(a) * Math.sin(b) * cfg.headR * 0.7 - 0.05, afro); } }
  // blob shadow
  const blob = mesh(new THREE.CircleGeometry(0.42, 8), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.35, depthWrite: false }), 0, 0.01, 0, root); blob.rotation.x = -Math.PI / 2;
  return { root, hips, torso, torsoMesh, legs, arms, neck, head, face, faceMat, mats, cfg, extras, afro };
}

const wife = makeChar({
  seed: 3, skin: 0xc98d5f, hipY: 0.82, legX: 0.14, legColor: 0xc98d5f, shoe: 0x2f6fff, hand: 0xffd400,
  torsoGeo: cyl(0.3, 0.42, 0.62, 7), torsoTex: floralTex, torsoColor: 0xffffff, torsoY: 0.31,
  skirt: cyl(0.42, 0.55, 0.55, 7), sleeve: true, shoulderX: 0.37, shoulderY: 0.56, neckY: 0.62, headR: 0.3,
  build(head, torso, reg) {
    const scarfMat = reg(M(0x1f9e5a));
    const scarf = mesh(new THREE.SphereGeometry(0.33, 8, 5, 0, Math.PI * 2, 0, Math.PI * 0.55), scarfMat, 0, 0.03, -0.03, head);
    scarf.rotation.x = -0.35;
    const knot = mesh(new THREE.IcosahedronGeometry(0.09, 0), scarfMat, 0, -0.12, -0.3, head);
    const tailA = mesh(box(0.08, 0.22, 0.04), scarfMat, 0.05, -0.28, -0.3, head);
    const tailB = mesh(box(0.08, 0.2, 0.04), scarfMat, -0.06, -0.27, -0.31, head);
    return { scarf, knot, tailA, tailB };
  }
});
const husband = makeChar({
  seed: 5, skin: 0xb27448, hipY: 0.9, legX: 0.11, legColor: 0xffffff, legTex: stripeTex, shoe: 0x6b4a2a, hand: 0xb27448,
  torsoGeo: cyl(0.25, 0.22, 0.7, 6), torsoTex: null, torsoColor: 0xf3f0e3, torsoY: 0.35,
  shoulderX: 0.31, shoulderY: 0.63, neckY: 0.72, headR: 0.29,
  build(head, torso, reg) {
    // tank top straps & shoulders bare: add skin shoulders
    const hairMat = reg(M(0x1b1410));
    mesh(box(0.08, 0.16, 0.24), hairMat, 0.28, 0.02, -0.04, head); mesh(box(0.08, 0.16, 0.24), hairMat, -0.28, 0.02, -0.04, head);
    mesh(box(0.4, 0.14, 0.08), hairMat, 0, -0.02, -0.27, head);
    // goggles
    const gog = new THREE.Group(); head.add(gog);
    const brass = reg(P(0xc9a227, { shininess: 80 }));
    for (const s of [-1, 1]) { const r = mesh(new THREE.TorusGeometry(0.07, 0.025, 4, 8), brass, s * 0.1, 0, 0, gog); mesh(new THREE.CircleGeometry(0.06, 8), reg(P(0x335a3a, { shininess: 100 })), s * 0.1, 0, -0.005, gog); }
    mesh(box(0.62, 0.035, 0.04), reg(M(0x3b2a1a)), 0, 0, -0.08, gog);
    const pencil = mesh(cyl(0.012, 0.012, 0.22, 5), reg(M(0xffcc22)), 0.3, 0.1, 0.02, head); pencil.rotation.x = Math.PI / 2;
    // grease smudge
    mesh(box(0.06, 0.06, 0.01), reg(M(0x3a2d22)), 0.1, 0.2, 0.245, torso);
    return { gog };
  }
});
husband.extras.setGoggles = (down) => {
  const g = husband.extras.gog;
  if (down) { g.position.set(0, 0.05, 0.27); g.rotation.x = 0; } else { g.position.set(0, 0.2, 0.2); g.rotation.x = -0.6; }
};

// pose: {bend, twist, hx, hy, hz, aLx, aLz, eL, aRx, aRz, eR, lL, lR, y, sx}
const POSE0 = { bend: 0, twist: 0, hx: 0, hy: 0, hz: 0, aLx: 0, aLz: 0.12, eL: 0.15, aRx: 0, aRz: 0.12, eR: 0.15, lL: 0, lR: 0, y: 0, tl: 0, tr: 0 };
function applyPose(c, p) {
  c.hips.position.y = c.cfg.hipY + p.y;
  c.torso.rotation.set(p.bend, p.twist, 0);
  c.head.rotation.set(p.hx, p.hy, p.hz);
  const [L, R] = c.arms;
  L.sh.rotation.set(-p.aLx, 0, p.aLz); L.el.rotation.set(-p.eL, 0, 0);
  R.sh.rotation.set(-p.aRx, 0, -p.aRz); R.el.rotation.set(-p.eR, 0, 0);
  L.thumb.scale.y = 1 + p.tl * 1.4; L.thumb.position.y = -0.33 + p.tl * 0.06;
  R.thumb.scale.y = 1 + p.tr * 1.4; R.thumb.position.y = -0.33 + p.tr * 0.06;
  c.legs[0].rotation.x = -p.lL; c.legs[1].rotation.x = -p.lR;
}
// snappy keyframes: each key [t, pose-overrides, dur]
function poseAt(t, keys) {
  let cur = { ...POSE0 }, prev = { ...POSE0 };
  for (let i = 0; i < keys.length; i++) {
    const [kt, kp, kd = 0.16] = keys[i];
    if (t < kt) break;
    prev = cur; const target = { ...POSE0, ...kp };
    const k = easeBack(seg(t, kt, kt + kd));
    cur = {}; for (const n in POSE0) cur[n] = lerp(prev[n], target[n], k);
  }
  return cur;
}

// ---------- particles ----------
function spritePool(tex, n, opts = {}) {
  const arr = []; for (let i = 0; i < n; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, color: opts.color || 0xffffff })); s.visible = false; (opts.parent || kitchen).add(s); arr.push(s); } return arr;
}
const smokePool = spritePool(puffTex, 160);
const sparkPool = spritePool(starTex, 40);
const waterPool = spritePool(dropTex, 70);
const ashPool = spritePool(flakeTex, 60);
const pigeonPool = spritePool(pigeonTex, 10, { parent: exterior });
const fireTex = canvasTex(16, 16, (g) => { g.fillStyle = '#ffdd33'; g.beginPath(); g.arc(8, 8, 7, 0, 7); g.fill(); g.fillStyle = '#ff7a10'; g.beginPath(); g.arc(9, 9, 4, 0, 7); g.fill(); });
const firePool = spritePool(fireTex, 40, { parent: exterior });
const extSmoke = spritePool(puffTex, 30, { parent: exterior });
function emitters(list, pool) {
  let n = 0;
  for (const p of list) { if (n >= pool.length) break; const s = pool[n++]; s.visible = true; s.position.copy(p.pos); s.scale.set(p.size * (p.sx || 1), p.size, 1); s.material.opacity = p.op; if (p.color !== undefined) s.material.color.setHex(p.color); s.material.rotation = p.rot || 0; }
  for (; n < pool.length; n++) pool[n].visible = false;
}
function streamParticles(t, t0, t1, rate, life, fn) {
  const out = []; const first = Math.max(0, Math.floor((t - life - t0) * rate)); const last = Math.floor((Math.min(t, t1) - t0) * rate);
  for (let i = first; i <= last; i++) { const born = t0 + i / rate; const age = t - born; if (age < 0 || age > life) continue; out.push(fn(i, age, age / life)); }
  return out;
}

// flying plates (S07)
const flyers = [];
for (let i = 0; i < 14; i++) { const d = makeDish(i % 4 === 3 ? 1 : (i % 5 === 4 ? 2 : 0)); d.visible = false; kitchen.add(d); flyers.push(d); }
// exterior explosion chunks
const shards = [];
for (let i = 0; i < 7; i++) { const s = mesh(new THREE.CircleGeometry(0.09, 3), new THREE.MeshLambertMaterial({ color: 0xffffff, side: THREE.DoubleSide }), 0, 0, 0, kitchen); s.visible = false; shards.push(s); }
const fallPlate = makeDish(0); fallPlate.visible = false; kitchen.add(fallPlate);
const debris = []; // aftermath floor fragments
{ const r = rng(21); for (let i = 0; i < 26; i++) { const k = [0, 0, 1, 2, 3][i % 5]; const d = makeDish(k); d.position.set(-2.5 + r() * 5, 0.04, -3 + r() * 3); d.rotation.set(Math.PI / 2 * (r() > .5 ? 1 : 0) + (r() - .5), r() * 6, (r() - .5)); d.scale.setScalar(0.6 + r() * 0.5); d.visible = false; kitchen.add(d); debris.push(d); } }

// ---------- exterior ----------
const building = new THREE.Group(); exterior.add(building);
mesh(box(9, 9, 3), M(0xffffff, { map: facadeTex }), 0, 4.5, -1.5, building);
mesh(new THREE.PlaneGeometry(40, 30), M(0x6f6458), 0, 0, 5, exterior).rotation.x = -Math.PI / 2;
mesh(box(9.4, 0.3, 3.4), M(0xb88a4a), 0, 9.1, -1.5, building);
{ const r = rng(31); for (let i = 0; i < 6; i++) { mesh(box(0.5, 0.35, 0.3), M(0xdedede), -3.5 + r() * 7, 1.5 + r() * 7, 0.15, building); } for (let i = 0; i < 5; i++) { const d = mesh(new THREE.ConeGeometry(0.35, 0.15, 8), M(0xeeeeee), -4 + i * 2, 9.5, -1, building); d.rotation.x = -1.0; } }
const extWin = new THREE.Vector3(1.8, 5.6, 0.05);
const extWinGlow = mesh(new THREE.PlaneGeometry(0.9, 1.0), new THREE.MeshBasicMaterial({ color: 0xffe9a0 }), extWin.x, extWin.y, 0.02, exterior);
const car = new THREE.Group(); car.position.set(3.2, 0, 3.0); exterior.add(car);
mesh(box(2.2, 0.6, 1.1), M(0xf2f2f2), 0, 0.45, 0, car); mesh(box(1.2, 0.45, 1.0), M(0x222222), -0.1, 0.95, 0, car);
for (const [x, z] of [[-0.7, 0.55], [0.7, 0.55], [-0.7, -0.55], [0.7, -0.55]]) mesh(cyl(0.2, 0.2, 0.15, 8), M(0x111111), x, 0.2, z, car).rotation.x = Math.PI / 2;
const fireballs = []; for (let i = 0; i < 9; i++) { const f = mesh(new THREE.OctahedronGeometry(0.6, 0), new THREE.MeshBasicMaterial({ color: i % 2 ? 0xffa320 : 0xffe14a, transparent: true }), 0, 0, 0, exterior); f.visible = false; fireballs.push(f); }
const flyPot = makeDish(1); exterior.add(flyPot); flyPot.scale.setScalar(2.5); flyPot.visible = false;
const debrisExt = []; for (let i = 0; i < 16; i++) { const d = mesh(box(0.18, 0.18, 0.18), M(i % 3 ? 0x2fb5b0 : 0x5a3a1a), 0, 0, 0, exterior); d.visible = false; debrisExt.push(d); }

// ---------- dialogue data ----------
const LINES = [
  { s: 'wife', t0: 0.25, t1: 3.2, ar: 'حراااام عليك يا إبراهيم!', en: 'Have mercy, Ibrahim!' },
  { s: 'wife', t0: 3.2, t1: 5.4, ar: 'ضهري اتقطم من المواعين دي!', en: 'My back is broken from these dishes!' },
  { s: 'wife', t0: 5.4, t1: 8.75, ar: 'حلل وطاسات وملاعق مش بتخلص.. أنا عايشة في مطعم مش في بيت!', en: 'Pots, pans, spoons... I live in a restaurant, not a home!' },
  { s: 'hus', t0: 8.77, t1: 12.4, ar: 'اهدي يا ولية ووسعي كدة للدماغ الشغالة!', en: 'Calm down, woman! Make room for the genius!' },
  { s: 'hus', t0: 12.4, t1: 16.2, ar: 'عملتلك اختراع القرن: "غسالة المواعين النفاثة 3000"..', en: 'Behold the invention of the century: the JET DISHWASHER 3000!' },
  { s: 'hus', t0: 16.22, t1: 20.2, ar: 'موتور توك توك مع خرطوم مطافي، في ثانيتين المطبخ هيلمع!', en: 'Tuk-tuk engine + fire hose. Kitchen sparkling in 2 seconds!' },
  { s: 'wife', t0: 20.26, t1: 22.7, ar: 'موتور توك توك إيه في المطبخ يا مجنون؟!', en: 'A TUK-TUK ENGINE in the kitchen, you lunatic?!' },
  { s: 'wife', t0: 22.7, t1: 24.2, ar: 'الريحة شايطة والزرار بيشرز..', en: 'It smells burnt and the switch is sparking...' },
  { s: 'wife', t0: 24.2, t1: 25.7, ar: 'افصلهااااا!', en: 'TURN IT OFFFFF!' },
  { s: 'hus', t0: 25.73, t1: 28.6, ar: 'متخافيش يا مرا دي أحدث تكنولوجيا يابانية مع لمسة مصرية..', en: "Relax! Latest Japanese tech with an Egyptian touch..." },
  { s: 'hus', t0: 28.6, t1: 30.63, ar: 'دوسي عالتوربـ', en: 'Hit the TURB—', cut: true },
];
const SPEECH = [[0, 8.42, 'wife'], [8.77, 19.76, 'hus'], [20.26, 25.34, 'wife'], [25.73, 30.63, 'hus']];
function speakerAt(t) { for (const [a, b, s] of SPEECH) if (t >= a && t < b) return s; return null; }
function envAt(t) { const e = window.ENV.env; const i = Math.floor(t * window.ENV.fps); return e[Math.min(e.length - 1, Math.max(0, i))] || 0; }
function talkMouth(t, who, big) {
  if (speakerAt(t) !== who) return null;
  const e = envAt(t);
  if (e < 0.12) return 'closed';
  if (big && e > 0.75) return big;
  return e < 0.42 ? 'talk1' : 'talk2';
}

// ---------- hose ----------
function hoseCurve(t) {
  const start = new THREE.Vector3(2.12, 1.4, -3.55);
  const pts = [start];
  if (t < 25.73) {
    // coiled on counter to the right
    pts.push(new THREE.Vector3(2.4, 1.15, -3.5));
    for (let i = 0; i <= 10; i++) { const a = i / 10 * Math.PI * 3.2; pts.push(new THREE.Vector3(2.75 + Math.cos(a) * 0.22, 1.03 + i * 0.012, -3.5 + Math.sin(a) * 0.17)); }
    pts.push(new THREE.Vector3(2.65, 1.06, -3.25));
  } else {
    const k = clamp((t - 25.73) / 0.6);
    for (let i = 1; i <= 7; i++) {
      const f = i / 7;
      const wob = Math.sin(t * 9 + i * 1.3) * 0.9 * f * k + noise1(t * 4 + i) * 0.5 * f * k;
      const wob2 = Math.cos(t * 7.3 + i * 0.9) * 0.6 * f * k;
      pts.push(new THREE.Vector3(2.3 + f * (-0.2) + wob, 1.4 + f * 0.8 * k + wob2 * 0.6, -3.4 + f * 2.2 * k + Math.sin(t * 5 + i) * 0.4 * f * k));
    }
  }
  return new THREE.CatmullRomCurve3(pts);
}
function updateHose(t) {
  const c = hoseCurve(t);
  if (hoseMesh) { kitchen.remove(hoseMesh); hoseMesh.geometry.dispose(); }
  hoseMesh = new THREE.Mesh(new THREE.TubeGeometry(c, 40, 0.045, 5, false), hoseMat); kitchen.add(hoseMesh);
  const end = c.getPoint(1), before = c.getPoint(0.97);
  nozzle.position.copy(end); nozzle.lookAt(end.clone().add(end.clone().sub(before)));
  nozzle.rotateX(Math.PI / 2);
  return { end, dir: end.clone().sub(before).normalize() };
}
function updateWires(t, eng) {
  const twitch = t > 16.2 ? 1 : 0.2;
  wires.forEach((w, i) => {
    const a = eng.clone().add(new THREE.Vector3(0.2, 0.15 + i * 0.03, 0.1));
    const b = new THREE.Vector3(3.0 - 0.08 + i * 0.08, 1.35, -3.94);
    const m1 = a.clone().lerp(b, 0.35).add(new THREE.Vector3(0, -0.25 + Math.sin(t * 13 + i) * 0.03 * twitch, 0.15));
    const m2 = a.clone().lerp(b, 0.7).add(new THREE.Vector3(0, -0.12 + Math.cos(t * 17 + i) * 0.03 * twitch, 0.08));
    if (w.mesh) { kitchen.remove(w.mesh); w.mesh.geometry.dispose(); }
    w.mesh = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([a, m1, m2, b]), 12, 0.012, 4), t > 22.9 && i === 0 ? M(0x111111) : w.mat);
    kitchen.add(w.mesh);
  });
}

// ---------- soot state ----------
function setSoot(c, k) { for (const m of c.mats) { m.color.copy(m.userData.orig).lerp(new THREE.Color(0x1a1a1a), k * 0.88); } }
const sootables = [tileMat, floorMat, ceilMat, counterMat, cabinetMat, engineRed, doorMat, rightWallMat];
sootables.forEach(m => m.userData.orig = m.color.clone());
function setRoomSoot(k) { sootables.forEach(m => m.color.copy(m.userData.orig).lerp(new THREE.Color(0x222222), k * 0.6)); }

// ---------- camera helpers ----------
function cam(pos, look, fov = 55, roll = 0) {
  camera.position.copy(pos); camera.fov = fov; camera.updateProjectionMatrix(); camera.up.set(0, 1, 0); camera.lookAt(look);
  if (roll) camera.rotateZ(roll);
}
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const VL = (a, b, k) => a.clone().lerp(b, k);
function shake(t, amp, freq = 18) { return V(noise1(t * freq) * amp, noise1(t * freq + 50) * amp, noise1(t * freq + 99) * amp * 0.5); }

// =====================================================================
// SCENE STATE AT TIME t
// =====================================================================
const WIFE_KEYS = [
  [0, { y: -0.75, bend: 0.5, aLx: 0.3, aRx: 0.3 }],
  [0.85, { y: 0.05, aLz: 2.9, aRz: 2.9, eL: 0, eR: 0, hx: -0.15 }, 0.1],
  [2.0, { aLz: 2.7, aRz: 2.8, eL: 0.3, eR: 0.2, hz: 0.1, hx: -0.1 }],
  [3.2, { bend: 0.5, aRx: -0.6, aRz: 0.3, eR: 1.9, aLx: 0.6, eL: 0.8, hz: 0.15 }],
  [4.6, { bend: 0.45, aRx: -0.6, aRz: 0.3, eR: 1.9, aLx: 1.0, eL: 1.2, hz: -0.1 }],
  [5.4, { aLx: 1.2, eL: 1.4, aRx: 1.1, eR: 1.6, aRz: 0.1, hx: 0.05 }],
  [6.0, { aLx: 1.2, eL: 1.5, aRx: 1.2, eR: 1.2, aRz: 0.2, hy: -0.2 }],
  [6.6, { aLx: 1.2, eL: 1.4, aRx: 1.3, eR: 0.8, aRz: 0.1, hy: 0.2 }],
  [7.3, { aLz: 1.6, aRz: 1.6, eL: 0.2, eR: 0.2, aLx: 0.4, aRx: 0.4, hx: -0.2 }],
  [8.77, { hy: 0.5, aLx: 0.9, eL: 1.8, aRx: 0.9, eR: 1.8, aLz: 0.5, aRz: 0.5 }],
  [12.5, { aLx: 1.1, eL: 1.9, aRx: 1.1, eR: 1.9, aLz: 0.6, aRz: 0.6, hx: 0.1 }],
  [20.6, { aLx: 1.5, eL: 0.4, aRx: 1.5, eR: 0.4, bend: 0.1 }],
  [22.7, { aLx: 1.0, eL: 2.4, aRx: 1.0, eR: 2.4, aLz: 0.5, aRz: 0.5, bend: -0.1 }],
  [24.2, { aLx: 1.0, eL: 2.5, aRx: 1.0, eR: 2.5, aLz: 0.7, aRz: 0.7, bend: -0.2, hx: -0.25, y: 0.03 }, 0.08],
  [25.73, { aLx: 0.6, eL: 0.4, aRz: 1.2, aRx: 0.4, bend: 0.25, hx: 0.1 }],
  [29.9, { aRx: 1.3, eR: 0.3, aRz: 0.1, bend: 0.6, aLz: 1.4 }, 0.1],
  [30.15, { aRx: 0.9, eR: 0.1, aRz: 0.1, bend: 0.75, aLz: 1.5 }, 0.06],
  [33.37, { aLz: 0.08, aRz: 0.08, eL: 0.05, eR: 0.05 }, 0.01],
];
const HUS_KEYS = [
  [8.77, { aLz: 0.5, eL: 1.6, aRz: 0.5, eR: 1.6, aLx: -0.2, aRx: -0.2, bend: -0.1 }],
  [10.4, { aLz: 0.5, eL: 1.6, aLx: -0.2, aRz: 0.9, aRx: 0.9, eR: 2.6, hz: -0.1 }],
  [11.6, { aLz: 0.5, eL: 1.6, aLx: -0.2, aRz: 0.4, aRx: 2.6, eR: 1.6, hx: -0.1 }, 0.1],
  [12.0, { aLz: 0.5, eL: 1.6, aRz: 0.5, eR: 1.6, aLx: -0.2, aRx: -0.2, bend: -0.15, hx: -0.15 }],
  [12.5, { aRx: 1.6, aRz: 0.7, eR: 0.2, aLz: 0.3 }],
  [12.75, { aRx: 2.6, aRz: 1.6, eR: 0, aLz: 0.6, bend: -0.2, twist: 0.4 }, 0.1],
  [13.4, { aLz: 1.4, aRz: 1.4, eL: 0.3, eR: 0.3, aLx: 0.5, aRx: 0.5, hx: -0.15 }],
  [16.3, { aRx: 1.3, aRz: 0.3, eR: 0.6, aLz: 0.5, eL: 1.6, aLx: -0.2, twist: -0.5, bend: 0.2 }],
  [16.6, { aRx: 0.9, aRz: 0.3, eR: 0.9, aLz: 0.5, eL: 1.6, aLx: -0.2, twist: -0.5, bend: 0.3 }, 0.06],
  [18.3, { aRx: 1.6, aRz: 0.2, eR: 1.2, aLz: 0.5, eL: 1.6, aLx: -0.2, hz: 0.1, tr: 1 }],
  [19.0, { aRx: 1.3, aRz: 0.6, eR: 1.4, aLz: 2.4, eL: 0.4, tr: 1, hx: -0.1 }],
  [20.26, { aRx: 0.9, eR: 0.4, aRz: 0.2, bend: 0.3, twist: -0.4 }],
  [20.45, { aRx: -0.6, eR: 0.2, aRz: 0.6, bend: -0.2, twist: 0.5 }, 0.08],
  [21.0, { aRx: 1.0, eR: 1.6, tr: 1, aLz: 0.4, hz: 0.1 }],
  [25.73, { aLx: 1.2, eL: 0.6, aRx: 1.2, eR: 0.6, bend: 0.25, hx: -0.15 }],
  [27.3, { aLx: 1.2, eL: 0.6, aRx: 1.8, aRz: 0.6, eR: 1.4, tr: 1, bend: 0.2, hx: -0.15 }],
  [28.6, { aLx: 1.2, eL: 0.6, aRx: 1.4, aRz: 0.9, eR: 0.3, bend: 0.1, hx: -0.25 }],
  [33.37, { aLz: 0.08, aRz: 0.08, eL: 0.05, eR: 0.05 }, 0.01],
  [36.2, { aRx: 1.0, eR: 1.5, tr: 1, aRz: 0.3 }, 0.5],
];

function stateAt(t) {
  const aftermath = t >= 33.37;
  kitchen.visible = !(t >= 32.26 && t < 33.37);
  exterior.visible = !kitchen.visible;
  scene.background = new THREE.Color(kitchen.visible ? 0x101010 : 0xf0a060);
  scene.fog = kitchen.visible ? null : new THREE.Fog(0xf0a060, 12, 40);

  // --- room damage ---
  setRoomSoot(aftermath ? 1 : 0);
  dishes.visible = !aftermath;
  debris.forEach(d => d.visible = aftermath);
  bonusPots.forEach((p, i) => p.visible = !aftermath && t > 7.35 + i * 0.12);
  dishItems.forEach(({ d, base, rot, r }) => {
    d.position.copy(base); d.rotation.copy(rot);
    if (t > 7.3 && t < 7.6) d.position.y += Math.sin((t - 7.3) * 40) * 0.01;
    if (t > 20.4 && t < 32.3) { const a = (t > 25.73 ? 0.05 : 0.015); d.position.x += noise1(t * 30 + r * 99) * a; d.position.y += Math.abs(noise1(t * 25 + r * 50)) * a; }
  });
  // tube: flicker 22.7-25, dangling in aftermath
  tubePivot.rotation.set(0, 0, 0); tube.position.set(0, -0.1, 0); tube.rotation.set(0, 0, Math.PI / 2);
  let lightK = 1;
  if (t > 22.7 && t < 25.7) lightK = hash(Math.floor(t * 15)) > 0.35 ? 1 : 0.25;
  if (aftermath) { tube.rotation.z = Math.PI / 2 + 1.2 + Math.sin(t * 2.2) * 0.25; tube.position.set(0.6, -0.4, 0); lightK = 0.55; }
  tubeMat.color.setHex(lightK > 0.5 ? 0xe8fff0 : 0x556655);
  tubeLight.intensity = 6 * lightK; ambient.intensity = aftermath ? 0.75 : 0.8 + lightK * 0.3;

  // --- door ---
  let door = 0;
  if (t >= 8.85) { const k = seg(t, 8.85, 9.0); door = -2.25 * easeOut(k); if (t > 9.0) door = -1.75 - Math.sin((t - 9) * 9) * Math.exp(-(t - 9) * 3) * 0.5; }
  doorPivot.rotation.y = door;
  hallMat.color.setHex(t > 8.8 && t < 12.5 ? 0xffffff : 0xcfcfc0);

  // --- tarp ---
  tarp.visible = t < 13.6 && !aftermath;
  if (t >= 12.75) { const k = seg(t, 12.75, 13.6); tarp.position.set(1.85 - k * 2.5, 1.47 + Math.sin(k * 3) * 0.8, -3.5 + k * 3.2); tarp.rotation.set(k * 3, k * 4, k * 2); tarp.scale.set(1 + k * 0.4, 1 - k * 0.7, 1); }
  else { tarp.position.set(1.85, 1.47, -3.5); tarp.rotation.set(0, 0, 0); tarp.scale.set(1, 1, 1); }

  // --- engine ---
  const running = t >= 20.45 && t < 32.26;
  engine.position.set(0, 0.32, 0); engine.rotation.set(0, 0, 0);
  inv.position.set(1.85, 1.0, -3.55);
  if (running) {
    const a = t < 25.73 ? 0.02 : 0.04;
    engine.position.x += noise1(t * 40) * a; engine.position.y += Math.abs(noise1(t * 37)) * a; engine.rotation.z = noise1(t * 33) * a * 2;
    if (t > 21) inv.position.x = 1.85 - Math.min(0.12, (t - 21) * 0.03);
  }
  fins[5].visible = t < 16.62;
  looseFin.visible = t >= 16.62 && t < 18 && !aftermath;
  if (looseFin.visible) { const a = t - 16.62; looseFin.position.set(1.85 + 0.15 * a, Math.max(1.0, 1.0 + 0.32 + 0.6 - 4.9 * a * a), -3.45 + a * 0.2); looseFin.rotation.set(a * 6, 0, a * 4); }
  flywheel.rotation.x = running ? t * 40 : 0;
  engineRed.emissive = new THREE.Color(running && t > 29.5 ? 0x441100 : 0x000000);
  btnGroup.position.y = 0.87 - (t >= 30.2 && t < 33.37 ? 0.03 : 0);
  stool.visible = true;
  const cordK = t >= 20.26 && t < 20.6 ? Math.sin(seg(t, 20.26, 20.6) * Math.PI) : 0;
  cordHandle.position.set(-0.33 - cordK * 0.5, 0.18, 0.2 + cordK * 0.4);
  tapeFlap.rotation.y = t > 16 ? 0.5 + Math.sin(t * 10) * 0.2 * (running ? 2 : 0.3) : 0.2;

  const hose = updateHose(t);
  updateWires(t, inv.position.clone().add(engine.position));

  // --- characters placement ---
  husband.root.visible = t >= 8.8; wife.root.visible = true;
  husband.extras.setGoggles(t >= 11.7 && t < 33.37);
  wife.afro.visible = husband.afro.visible = aftermath;
  setSoot(wife, aftermath ? 1 : 0); setSoot(husband, aftermath ? 1 : 0);
  if (wife.extras.scarf) { wife.extras.scarf.scale.set(1, aftermath ? 0.55 : 1, 1); }

  // wife root
  let wp = V(-0.85, 0, -2.75), wr = 0.0;
  if (t >= 8.77) { wp = V(-0.85, 0, -2.75); wr = 0.85; }
  if (t >= 12.5) { wp = V(-0.6, 0, -2.4); wr = 0.6; }
  if (t >= 20.26) { const k = easeOut(seg(t, 20.26, 20.7)); wp = VL(V(-0.6, 0, -2.4), V(0.75, 0, -2.25), k); wr = lerp(0.6, 1.57, k); }
  if (t >= 22.7) { wp = V(0.35, 0, -1.95); wr = 0.1; }
  if (t >= 25.73) { wp = V(0.22, 0, -2.0); wr = 0.9; }
  if (aftermath) { wp = V(-0.45, 0, -1.2); wr = 0.08; }
  if (t >= 20.7 && t < 22.7) { wp.x += Math.sin(t * 30) * 0.05; }
  if (t >= 25.73 && t < 30.63) { wp.x += noise1(t * 8) * 0.04; }
  wife.root.position.copy(wp); wife.root.rotation.y = wr;

  let hp = V(4.75, 0, 1.0), hr = -Math.PI / 2;
  if (t >= 9.1 && t < 12.5) { hp = V(4.75 - easeOut(seg(t, 9.1, 9.5)) * 0.25, 0, 1.0); }
  if (t >= 12.5) { hp = V(1.15, 0, -2.45); hr = -0.35; }
  if (t >= 16.22) { hp = V(1.35, 0, -2.75); hr = 0.35; }
  if (t >= 19.0 && t < 20.26) { hp = V(1.25, 0, -2.6); hr = 0; }
  if (t >= 20.26) { hp = V(1.35, 0, -2.75); hr = 0.5; }
  if (t >= 20.7 && t < 22.7) { hp = V(1.45, 0, -2.25); hr = -1.4; hp.x += Math.sin(t * 30 + 1.5) * 0.08; hp.z += Math.cos(t * 30) * 0.03; }
  if (t >= 22.7 && t < 25.73) { hp = V(1.45, 0, -2.35); hr = -0.3; }
  if (t >= 25.73) { hp = V(1.6, 0, -2.85); hr = -0.15; hp.x += noise1(t * 10 + 7) * 0.04; }
  if (aftermath) { hp = V(0.45, 0, -1.2); hr = -0.08; }
  husband.root.position.copy(hp); husband.root.rotation.y = hr;

  // poses
  const wpz = poseAt(t, WIFE_KEYS), hpz = poseAt(t, HUS_KEYS);
  if (t >= 20.7 && t < 22.7) { wpz.aLx = 1.4 + Math.sin(t * 30) * 0.2; wpz.aRx = 1.4 + Math.sin(t * 30) * 0.2; hpz.hx = Math.sin(t * 30 + 1.5) * 0.4; hpz.bend = Math.sin(t * 30 + 1.5) * 0.25; }
  if (t >= 25.73 && t < 30.63) { hpz.torsoRipple = true; }
  if (aftermath) { const cough = seg(t, 35.6, 35.9); hpz.bend = Math.sin(cough * Math.PI) * 0.3; }
  applyPose(wife, wpz); applyPose(husband, hpz);
  husband.torsoMesh.scale.set(1 + (t >= 25.73 && t < 30.63 ? Math.sin(t * 40) * 0.05 : 0), 1, 1);
  // headscarf flap
  if (wife.extras.tailA) { const f = (t >= 24.2 && t < 30.63) ? Math.floor(t * 15) % 2 : 0; wife.extras.tailA.rotation.x = f ? -1.2 : 0; wife.extras.tailB.rotation.x = f ? -0.8 : 0; }

  // --- faces ---
  let we = 'normal', wm = 'closed', wopt = {};
  if (t < 0.85) { we = 'normal'; }
  else if (t < 3.2) { we = 'wide'; wm = talkMouth(t, 'wife', 'scream') || 'scream'; }
  else if (t < 8.77) { we = 'sad'; wm = talkMouth(t, 'wife', 'scream') || 'frown'; if (t > 7.3) we = 'wide'; }
  else if (t < 12.5) { we = 'flat'; wm = 'flat'; if (t > 11.6) we = 'normal'; }
  else if (t < 20.26) { we = 'flat'; wm = 'flat'; }
  else if (t < 22.7) { we = 'angry'; wm = talkMouth(t, 'wife', 'scream') || 'clench'; wopt.red = true; }
  else if (t < 24.2) { we = 'wide'; wm = talkMouth(t, 'wife') || 'o'; }
  else if (t < 25.73) { we = 'pin'; wm = 'hex'; wopt.browGlitch = Math.floor(t * 15) === Math.floor(24.8 * 15); }
  else if (t < 33.37) { we = 'closed'; wm = 'clench'; if (t < 29.9) we = 'wide'; }
  else { we = 'soot'; wm = 'flat'; wopt.soot = true; }
  let he = 'normal', hm = 'closed', hopt = { stache: true };
  if (t < 12.5) { he = 'smug'; hm = talkMouth(t, 'hus') || 'grin'; }
  else if (t < 16.22) { he = 'sparkle'; hm = talkMouth(t, 'hus') || 'grin'; }
  else if (t < 20.26) { he = 'smug'; hm = talkMouth(t, 'hus') || 'grin'; if (t > 18.3) he = 'sparkle'; }
  else if (t < 25.73) { he = 'normal'; hm = 'grin'; }
  else if (t < 33.37) { he = 'wild'; hm = talkMouth(t, 'hus', 'scream') || 'grin'; }
  else { he = 'soot'; hm = 'flat'; hopt.soot = true; }
  // blinks
  const blinkAt = (t, list) => list.some(b => t >= b && t < b + 0.2);
  if (aftermath && blinkAt(t, [34.5, 35.9, 37.6])) { we = 'sootclosed'; he = 'sootclosed'; }
  if (!aftermath && blinkAt(t, [5.0, 10.0, 14.2, 18.8])) { if (we === 'normal' || we === 'sad') we = 'closed'; if (he === 'smug' || he === 'normal') he = 'closed'; }
  if (aftermath) { wife.head.children[0].material; }
  wife.faceMat.map = faceTexture(we, wm, wopt); wife.faceMat.needsUpdate = true;
  husband.faceMat.map = faceTexture(he, hm, hopt); husband.faceMat.needsUpdate = true;

  // --- glint ---
  glintSprite.visible = t >= 19.1 && t < 19.75;
  if (glintSprite.visible) { const k = seg(t, 19.1, 19.75); glintSprite.position.set(-0.15, 2.05, -3.4); const s = Math.sin(k * Math.PI) * 0.2; glintSprite.scale.set(s, s, 1); glintSprite.material.rotation = k * 3; }

  // --- particles ---
  const smoke = [];
  const exPos = inv.position.clone().add(engine.position).add(V(0.38, 0.9, -0.2));
  if (t > 20.45 && t < 32.26) {
    const rate = t < 25.73 ? 10 : 22;
    smoke.push(...streamParticles(t, 20.45, 32.26, rate, 2.6, (i, age, k) => ({ pos: exPos.clone().add(V((hash(i) - .5) * 0.3 + age * 0.25 * (hash(i + 3) - .3), age * 0.75, age * 0.25 * (hash(i + 7) - 0.2))), size: 0.2 + k * (t > 25.73 ? 1.3 : 0.8), op: (1 - k) * 0.9, color: hash(i + 1) > 0.5 ? 0x555555 : 0x777777 })));
  }
  if (t > 22.6 && t < 32.26) smoke.push(...streamParticles(t, 22.6, 32.26, 5, 1.5, (i, age, k) => ({ pos: V(3.0 + Math.sin(age * 3) * 0.05, 1.42 + age * 0.4, -3.9), size: 0.1 + k * 0.3, op: (1 - k) * 0.7, color: 0x88cc88 })));
  if (t > 25.73 && t < 32.26) { // ceiling smoke layer
    for (let i = 0; i < 18; i++) { const k = clamp((t - 25.73) / 3); smoke.push({ pos: V(-2.5 + i * 0.33 + Math.sin(t + i) * 0.2, 2.9 - hash(i) * 0.4, -3.2 + hash(i + 9) * 2.5), size: 1.0 + hash(i + 2) * 0.6, op: 0.75 * k, color: 0x3a3a3a }); }
  }
  if (aftermath) {
    smoke.push(...streamParticles(t, 33.37, 40, 3, 3, (i, age, k) => ({ pos: V(-2 + hash(i) * 4, 0.3 + age * 0.5, -3 + hash(i + 5) * 2), size: 0.3 + k * 0.8, op: (1 - k) * 0.4, color: 0x666666 })));
    // engine last cough
    if (t > 34.2 && t < 35.4) { const k = seg(t, 34.2, 35.4); smoke.push({ pos: exPos.clone().add(V(0.1 * k, k * 0.8, 0)), size: 0.3 + k * 0.6, op: 1 - k, color: 0x222222 }); }
    // husband smoke ring
    if (t > 35.75 && t < 37.5) { const k = seg(t, 35.75, 37.5); const hd = husband.head.getWorldPosition(V(0, 0, 0)); for (let i = 0; i < 8; i++) { const a = i / 8 * 6.28; smoke.push({ pos: hd.clone().add(V(Math.cos(a) * (0.08 + k * 0.15), 0.0 + k * 0.7 + Math.sin(a) * (0.08 + k * 0.15), 0.35)), size: 0.09, op: (1 - k) * 0.9, color: 0x999999 }); } }
  }
  emitters(smoke, smokePool);
  const sparks = [];
  if (t > 22.6 && t < 32.26) {
    const burst = (b) => { const r = rng(b * 13); for (let j = 0; j < 6; j++) { const vx = (r() - .5) * 1.6, vy = r() * 1.4, vz = r() * 0.8; sparks.push({ b, vx, vy, vz }); } };
    const tb = Math.floor(t * 6) / 6;
    for (let b = 0; b < 3; b++) {
      const bt = tb - b / 6; if (bt < 22.6) continue; const r = rng(Math.floor(bt * 6) * 13 + 1);
      if (hash(Math.floor(bt * 6)) < 0.25) continue;
      for (let j = 0; j < 7; j++) { const vx = (r() - .5) * 1.8, vy = r() * 1.5, vz = 0.3 + r() * 0.9; const age = t - bt; sparks.push({ pos: V(3.1 + vx * age, 1.35 + vy * age - 4.9 * age * age, -3.9 + vz * age), size: 0.11 * (1 - age * 2), op: 1, rot: j }); }
    }
  }
  emitters(sparks.filter(s => s.pos && s.size > 0.01), sparkPool);
  const water = [];
  if (t > 25.9 && t < 30.63) water.push(...streamParticles(t, 25.9, 30.63, 40, 0.8, (i, age, k) => { const d = hose.dir; return { pos: hose.end.clone().add(d.clone().multiplyScalar(age * 4)).add(V((hash(i) - .5) * age, -2.5 * age * age, (hash(i + 2) - .5) * age)), size: 0.16, sx: 0.5, op: 1 - k, rot: Math.atan2(d.x, d.y) }; }));
  emitters(water, waterPool);
  const ash = [];
  if (aftermath) for (let i = 0; i < 60; i++) { const ft = (t * 0.25 + hash(i)) % 1; ash.push({ pos: V(-2.5 + hash(i + 3) * 5 + Math.sin(t + i) * 0.15, 3.0 - ft * 3.0, -2.8 + hash(i + 6) * 3.4), size: 0.05, op: 0.9 }); }
  emitters(ash, ashPool);

  // flying plates S07
  flyers.forEach((d, i) => {
    const t0 = 26.0 + i * 0.32; const age = t - t0; d.visible = age > 0 && age < 1.1 && t < 30.63;
    if (d.visible) { const from = V(-0.1 + (hash(i) - .5) * 0.8, 1.8 + hash(i + 1) * 0.8, -3.5); const to = V((hash(i + 2) - .5) * 3, 1.0 + hash(i + 3) * 1.6, 1.0); d.position.copy(VL(from, to, age / 1.1)); d.position.y += Math.sin(age / 1.1 * Math.PI) * 0.5; d.rotation.set(age * 12, age * 8, age * 5); }
  });
  // falling plate in aftermath
  fallPlate.visible = t >= 36.9 && t < 37.35;
  if (fallPlate.visible) { const a = t - 36.9; fallPlate.position.set(0, 3.1 - 4.9 * a * a * 3.1, -0.7); fallPlate.rotation.set(0.2, a * 5, 0.1); if (fallPlate.position.y < 0.05) fallPlate.visible = false; }
  shards.forEach((s, i) => { const a = t - 37.32; s.visible = a > 0 && a < 1.5; if (s.visible) { const ang = i / shards.length * 6.28; const d = Math.min(a, 0.35); s.position.set(Math.cos(ang) * d * 1.6, 0.03 + Math.max(0, Math.sin(Math.min(a, 0.35) / 0.35 * Math.PI) * 0.25), -0.7 + Math.sin(ang) * d * 1.2); s.rotation.set(-Math.PI / 2, 0, ang + a * 3); } });

  // exterior
  if (exterior.visible) {
    const a = t - 32.26;
    fireballs.forEach((f, i) => { const k = clamp((a - i * 0.03) / 0.7); f.visible = k > 0 && k < 1; const dir = V(Math.cos(i * 2.1) * 0.9, Math.sin(i * 1.7) * 0.6 + 0.2, 0.8 + hash(i) * 0.5); f.position.copy(extWin.clone().add(dir.multiplyScalar(k * 1.8))); f.scale.setScalar(0.4 + k * (1.4 + hash(i + 4))); f.rotation.set(k * 2 + i, k * 3, 0); f.material.opacity = 1 - k * k; });
    debrisExt.forEach((d, i) => { const v = V((hash(i) - .5) * 6, 2 + hash(i + 1) * 5, 2 + hash(i + 2) * 4); d.visible = a > 0.02; d.position.set(extWin.x + v.x * a, extWin.y + v.y * a - 4.9 * a * a, extWin.z + v.z * a); d.rotation.set(a * 9 + i, a * 7, 0); });
    flyPot.visible = true; flyPot.position.set(extWin.x + a * 1.2, extWin.y + a * 9 - 4.9 * a * a, 1 + a * 1.5); flyPot.rotation.set(a * 10, a * 4, a * 6);
    extWinGlow.material.color.setHex(a < 0.15 ? 0xffffff : 0x221100);
    emitters(Array.from({ length: 30 }, (_, i) => { const k = clamp((a - 0.1 - hash(i) * 0.3) / 0.9); return { pos: extWin.clone().add(V((hash(i + 1) - .5) * 1.5 * (1 + k), k * 2.5, 0.5 + hash(i) * 0.6)), size: 0.5 + k * 1.6, op: k > 0 ? (1 - k) * 0.9 : 0, color: 0x333333 }; }), extSmoke);
    emitters(Array.from({ length: 30 }, (_, i) => { const k = clamp(a / 0.5); return { pos: extWin.clone().add(V((hash(i + 3) - .5) * 2.4 * k, (hash(i + 4) - .3) * 2 * k, 0.6)), size: 0.5 * (1 - k) + 0.1, op: 1 - k, color: 0xffffff }; }), firePool);
    emitters(Array.from({ length: 10 }, (_, i) => ({ pos: V(-3 + i * 0.7 + a * (2 + hash(i) * 3) * (i % 2 ? 1 : -1), 8.5 + i % 3 * 0.4 + a * 3, 1.5), size: 0.45, sx: 2, op: 1, rot: Math.floor(t * 15 + i) % 2 ? 0.2 : -0.2 })), pigeonPool);
  }

  // --- characters walking legs (simple) ---
  return { hose };
}

// =====================================================================
// CAMERA BY SHOT
// =====================================================================
function cameraAt(t) {
  if (t < 3.2) {
    if (t < 1.0) { const k = easeInOut(seg(t, 0, 1.0)); cam(VL(V(0.2, 3.3, -1.5), V(-0.2, 2.2, -0.8), k), VL(V(0, 2.4, -3.6), V(-0.4, 1.9, -3.3), k), 55); }
    else { const k = easeOut(seg(t, 1.0, 1.15)); cam(VL(V(-0.2, 2.2, -0.8), V(-0.78, 2.0, -1.4), k).add(V(0, 0, -(t - 1.15) * 0.04)), VL(V(-0.4, 1.9, -3.3), V(-0.85, 1.92, -2.75), k), lerp(55, 48, k)); }
  } else if (t < 8.77) {
    const k = seg(t, 3.2, 8.77); cam(VL(V(-0.25, 1.75, 0.1), V(-0.5, 1.75, -0.75), k), V(-0.75, 1.6, -2.75), 52, 0.07);
  } else if (t < 12.5) {
    const k = seg(t, 8.77, 12.5); cam(VL(V(2.3, 0.25, 0.3), V(2.7, 0.3, 0.5), k), V(4.9, 1.45, 1.0), 58, -0.04);
  } else if (t < 13.4) {
    cam(V(0.3, 1.75, 0.9), V(1.0, 1.25, -3.0), 55);
  } else if (t < 16.22) {
    const k = seg(t, 13.4, 16.22); const a = lerp(-1.25, 1.25, k); const c = V(1.85, 1.35, -3.55);
    cam(c.clone().add(V(Math.sin(a) * 2.1, 0.35, Math.cos(a) * 2.1)), c, 55);
  } else if (t < 17.3) {
    cam(V(1.55, 1.5, -2.75), V(1.85, 1.35, -3.55), 45);
  } else if (t < 18.3) {
    cam(V(2.45, 1.35, -2.75), V(2.68, 1.07, -3.3), 40);
  } else if (t < 19.0) {
    cam(V(1.15, 1.75, -1.25), V(1.25, 1.75, -2.6), 50);
  } else if (t < 20.26) {
    const k = easeOut(seg(t, 19.0, 19.4)); cam(VL(V(0.2, 2.1, -2.2), V(-0.05, 2.1, -2.75), k), V(-0.15, 2.0, -3.5), 45);
  } else if (t < 22.7) {
    cam(V(0.7, 2.2, 1.4).add(shake(t, 0.05, 6)), V(1.0, 1.2, -2.6), 55);
  } else if (t < 24.2) {
    cam(V(2.65, 1.45, -3.35).add(shake(t, 0.01, 20)), V(2.98, 1.33, -3.97), 50);
  } else if (t < 25.73) {
    const k = easeOut(seg(t, 24.2, 24.35)); cam(VL(V(0.3, 1.75, 0.0), V(0.33, 1.72, -0.95), k).add(shake(t, 0.015, 25)), V(0.35, 1.68, -1.95), lerp(55, 46, k));
  } else if (t < 32.26) {
    const tt = Math.min(t, 30.6);
    const k = easeInOut(seg(tt, 28.6, 30.3));
    cam(VL(V(-0.2, 1.9, 1.0), V(1.1, 1.35, -0.75), k).add(shake(tt, 0.06, 14)), VL(V(1.0, 1.4, -2.4), V(0.75, 0.95, -1.55), k), 55, 0.25 + noise1(tt * 3) * 0.05);
  } else if (t < 33.37) {
    const a = t - 32.26; cam(V(0, 3.0, 14).add(shake(t, a < 0.6 ? 0.15 * (1 - a / 0.6) : 0, 25)), V(0.5, 5.5, 0), 50);
  } else {
    cam(V(0, 1.55, 2.2), V(0, 1.2, -2.0), 52);
  }
}

// =====================================================================
// HUD
// =====================================================================
const out = document.getElementById('out');
const ctx = out.getContext('2d');
ctx.imageSmoothingEnabled = false;
const hud = document.createElement('canvas'); hud.width = W; hud.height = H; const h = hud.getContext('2d');

function pxText(g, s, x, y, size, color, align = 'left', shadow = true) {
  g.font = `${size}px PS2P`; g.textAlign = align; g.textBaseline = 'top'; g.direction = 'ltr';
  if (shadow) { g.fillStyle = '#000'; g.fillText(s, x + 2, y + 2); g.fillText(s, x - 1, y); g.fillText(s, x + 1, y); g.fillText(s, x, y - 1); g.fillText(s, x, y + 1); }
  g.fillStyle = color; g.fillText(s, x, y);
}
function arText(g, s, x, y, size, color, align = 'right', font = 'Lalezar') {
  g.font = `${size}px ${font}`; g.textAlign = align; g.textBaseline = 'top'; g.direction = 'rtl';
  g.fillStyle = '#000'; for (const [dx, dy] of [[2, 2], [-1, 0], [1, 0], [0, -1], [0, 1]]) g.fillText(s, x + dx, y + dy);
  g.fillStyle = color; g.fillText(s, x, y);
}
function durability(t) {
  if (t < 20.45) return 100; if (t < 22.8) return 80; if (t < 24.3) return 55; if (t < 25.73) return 40;
  if (t < 30.0) return Math.round(lerp(40, 10, seg(t, 25.73, 30.0)) / 5) * 5; if (t < 32.26) return 5; return 0;
}
let lastDur = 100;
function drawMeter(g, t) {
  if (t >= 33.37) return;
  const v = durability(t);
  const hit = [20.45, 22.8, 24.3].some(b => t >= b && t < b + 0.25);
  const ox = hit ? (hash(Math.floor(t * 30)) - .5) * 6 : 0, oy = hit ? (hash(Math.floor(t * 30) + 9) - .5) * 4 : 0;
  const x = 14 + ox, y = 12 + oy;
  g.fillStyle = 'rgba(0,0,30,0.65)'; g.fillRect(x, y, 214, 50); g.strokeStyle = '#fff'; g.lineWidth = 2; g.strokeRect(x, y, 214, 50);
  // sink icon
  g.fillStyle = '#cfe'; g.fillRect(x + 8, y + 22, 22, 10); g.fillStyle = '#9ab'; g.fillRect(x + 10, y + 24, 18, 6); g.fillStyle = '#ccc'; g.fillRect(x + 22, y + 12, 3, 10); g.fillRect(x + 18, y + 12, 7, 3);
  pxText(g, 'KITCHEN DURABILITY', x + 38, y + 7, 8, '#ffe14a', 'left');
  arText(g, 'متانة المطبخ', x + 206, y + 14, 14, '#ffffff', 'right');
  const col = v > 60 ? '#3df05a' : v > 30 ? '#ffd400' : v > 10 ? '#ff8a1a' : '#ff2a2a';
  const blocks = Math.ceil(v / 10);
  const shattered = t >= 32.26;
  for (let i = 0; i < 10; i++) {
    let bx = x + 38 + i * 13, by = y + 34;
    if (shattered) { const a = t - 32.26; by += a * a * 300 * (0.5 + hash(i)); bx += (hash(i + 2) - .5) * a * 120; }
    g.fillStyle = '#222'; g.fillRect(bx, by, 11, 10);
    if (i < blocks && !(v <= 5 && Math.floor(t * 8) % 2)) { g.fillStyle = col; g.fillRect(bx + 1, by + 1, 9, 8); g.fillStyle = 'rgba(255,255,255,0.5)'; g.fillRect(bx + 1, by + 1, 9, 2); }
  }
  pxText(g, (shattered ? 0 : v) + '%', x + 172, y + 35, 8, v <= 10 ? '#ff4040' : '#fff', 'left');
  if (v <= 5 && t < 32.26 && Math.floor(t * 6) % 2) pxText(g, 'LOW!', x + 92, y + 58, 16, '#ff2a2a', 'center');
}
function drawDishCounter(g, t) {
  if (t > 33.37) return;
  const x = W - 168, y = 12;
  g.fillStyle = 'rgba(0,0,30,0.65)'; g.fillRect(x, y, 154, 34); g.strokeStyle = '#fff'; g.lineWidth = 2; g.strokeRect(x, y, 154, 34);
  // plate icon
  g.fillStyle = '#fff'; g.beginPath(); g.ellipse(x + 17, y + 17, 11, 7, 0, 0, 7); g.fill(); g.fillStyle = '#9cf'; g.beginPath(); g.ellipse(x + 17, y + 17, 6, 3.5, 0, 0, 7); g.fill();
  let n = Math.floor(lerp(12, 9999, easeInOut(seg(t, 0.4, 7.4))));
  let s = 'x' + String(n).padStart(4, '0');
  if (t > 7.4) s = Math.floor(t * 5) % 2 ? 'x9999+' : 'MAX!!';
  pxText(g, 'DISHES', x + 34, y + 5, 8, '#ffe14a', 'left');
  pxText(g, s, x + 34, y + 18, 10, t > 7.4 ? '#ff4060' : '#fff', 'left');
}
function portrait(g, x, y, who, t) {
  g.fillStyle = '#123'; g.fillRect(x, y, 64, 64); g.strokeStyle = '#fff'; g.lineWidth = 2; g.strokeRect(x, y, 64, 64);
  g.save(); g.beginPath(); g.rect(x + 2, y + 2, 60, 60); g.clip();
  if (who === 'wife') {
    g.fillStyle = '#1f9e5a'; g.beginPath(); g.arc(x + 32, y + 34, 27, 0, 7); g.fill();
    g.fillStyle = '#c98d5f'; g.beginPath(); g.arc(x + 32, y + 38, 19, 0, 7); g.fill();
    g.fillStyle = '#ec86ad'; g.fillRect(x + 6, y + 58, 52, 6);
  } else {
    g.fillStyle = '#f3f0e3'; g.fillRect(x + 10, y + 54, 44, 10);
    g.fillStyle = '#b27448'; g.beginPath(); g.arc(x + 32, y + 34, 21, 0, 7); g.fill();
    g.fillStyle = '#1b1410'; g.fillRect(x + 10, y + 28, 5, 12); g.fillRect(x + 49, y + 28, 5, 12);
    g.fillStyle = '#c9a227'; g.fillRect(x + 14, y + 14, 36, 6); g.fillStyle = '#335a3a'; g.fillRect(x + 18, y + 13, 10, 8); g.fillRect(x + 36, y + 13, 10, 8);
  }
  const fc = document.createElement('canvas'); fc.width = 32; fc.height = 32; const fg = fc.getContext('2d');
  const sp = speakerAt(t) === who; const e = envAt(t);
  let mouth = sp ? (e < 0.12 ? 'closed' : e < 0.42 ? 'talk1' : 'talk2') : 'closed';
  let eyes = who === 'wife' ? (t > 20.26 ? 'angry' : 'sad') : 'smug';
  if (who === 'wife' && t > 24.2) { eyes = 'pin'; mouth = 'hex'; }
  if (who === 'hus' && t > 25.73) eyes = 'wild';
  drawFace(fg, 32, eyes, mouth, { stache: who === 'hus' });
  g.imageSmoothingEnabled = false; g.drawImage(fc, x + 14, y + (who === 'wife' ? 20 : 16), 36, 36);
  g.restore();
}
function drawDialogue(g, t) {
  const L = LINES.find(l => t >= l.t0 && t < l.t1) || (t >= 30.63 && t < 32.26 ? LINES[LINES.length - 1] : null);
  if (!L) return;
  let sx = 0, sy = 0; const cracked = L.cut || (L.s === 'hus' && t > 28.6);
  if (L.s === 'hus' && t > 25.73 && t < 30.63) { sx = (hash(Math.floor(t * 30)) - .5) * 6; sy = (hash(Math.floor(t * 30) + 3) - .5) * 4; }
  const x = 16 + sx, y = 352 + sy, w = W - 32, hh = 112;
  const gr = g.createLinearGradient(0, y, 0, y + hh); gr.addColorStop(0, 'rgba(20,40,150,0.88)'); gr.addColorStop(1, 'rgba(5,10,60,0.92)');
  g.fillStyle = gr; g.fillRect(x, y, w, hh); g.strokeStyle = '#fff'; g.lineWidth = 3; g.strokeRect(x + 1.5, y + 1.5, w - 3, hh - 3);
  g.strokeStyle = '#7fb0ff'; g.lineWidth = 1; g.strokeRect(x + 5.5, y + 5.5, w - 11, hh - 11);
  // portrait right (RTL)
  portrait(g, x + w - 78, y + 14, L.s, t);
  // name tag
  const name = L.s === 'wife' ? 'أم حمادة' : 'إبراهيم'; const nameEn = L.s === 'wife' ? 'OM HAMADA' : 'IBRAHIM';
  g.fillStyle = L.s === 'wife' ? '#1f9e5a' : '#c9a227'; g.fillRect(x + w - 190, y - 14, 170, 22); g.strokeStyle = '#fff'; g.lineWidth = 2; g.strokeRect(x + w - 190, y - 14, 170, 22);
  arText(g, name, x + w - 26, y - 16, 18, '#fff', 'right');
  pxText(g, nameEn, x + w - 184, y - 7, 8, '#fff', 'left');
  // typed text
  const dur = L.t1 - L.t0; const chars = [...L.ar];
  const typeT = Math.min(dur * 0.75, chars.length * 0.045);
  let n = Math.floor(chars.length * clamp((t - L.t0) / typeT));
  if (L.cut && t > 30.5) n = chars.length;
  const shown = chars.slice(0, n).join('');
  // wrap arabic to width
  g.font = '22px Lalezar'; g.direction = 'rtl';
  const maxW = w - 110; const words = shown.split(' '); const rows = ['']; for (const wd of words) { const tr = rows[rows.length - 1] ? rows[rows.length - 1] + ' ' + wd : wd; if (g.measureText(tr).width > maxW && rows[rows.length - 1]) rows.push(wd); else rows[rows.length - 1] = tr; }
  rows.slice(0, 2).forEach((r, i) => arText(g, r, x + w - 92, y + 10 + i * 30, 22, '#ffffff', 'right'));
  if (n >= chars.length) {
    const en = L.en; g.font = '8px PS2P';
    pxText(g, en, x + 16, y + hh - 24, 8, '#9fd0ff', 'left');
    if (!L.cut && Math.floor(t * 4) % 2) { g.fillStyle = '#fff'; g.beginPath(); g.moveTo(x + 22, y + 74); g.lineTo(x + 32, y + 74); g.lineTo(x + 27, y + 80); g.fill(); }
  }
  if (cracked) {
    g.strokeStyle = '#fff'; g.lineWidth = 2; g.beginPath();
    const cx = x + w * 0.42, cy = y + hh * 0.4; const r = rng(77);
    for (let i = 0; i < 6; i++) { g.moveTo(cx, cy); let px = cx, py = cy; const a = i / 6 * 6.28 + r(); for (let j = 0; j < 4; j++) { px += Math.cos(a + (r() - .5)) * 22; py += Math.sin(a + (r() - .5)) * 14; g.lineTo(px, py); } }
    g.stroke();
  }
}
function drawItemCard(g, t) {
  const a = t - 14.55; if (a < 0 || t > 16.6) return;
  const k = a < 0.18 ? easeBack(a / 0.18) : 1; const out = t > 16.3 ? seg(t, 16.3, 16.6) : 0;
  g.save(); g.translate(W / 2 + out * W, 200); g.scale(k, k);
  // starburst
  g.fillStyle = 'rgba(255,210,0,0.85)';
  for (let i = 0; i < 16; i++) { const an = i / 16 * 6.28 + t * 1.5; g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.cos(an) * 230, Math.sin(an) * 230); g.lineTo(Math.cos(an + 0.18) * 230, Math.sin(an + 0.18) * 230); g.fill(); }
  g.fillStyle = 'rgba(10,10,60,0.92)'; g.fillRect(-200, -95, 400, 190); g.strokeStyle = '#fff'; g.lineWidth = 3; g.strokeRect(-200, -95, 400, 190);
  pxText(g, 'NEW ITEM!', -185, -82, 16, '#ffe14a', 'left');
  arText(g, '!اختراع جديد', 185, -90, 24, '#ffe14a', 'right');
  arText(g, 'غسالة المواعين النفاثة 3000', 185, -52, 26, '#ffffff', 'right');
  pxText(g, 'JET DISHWASHER 3000', -185, -10, 12, '#7fdcff', 'left');
  const stat = (lbl, nStars, yy, col) => { pxText(g, lbl, -185, yy, 10, '#fff', 'left'); for (let i = 0; i < 5; i++) { g.fillStyle = i < nStars ? col : '#334'; g.fillRect(-40 + i * 22, yy - 1, 16, 12); } };
  stat('POWER', 5, 18, '#ff4a2a'); stat('SAFETY', 0, 40, '#3df05a'); stat('SMELL', 5, 62, '#c08a2a');
  // spinning icon
  g.save(); g.translate(140, 40); const sc = Math.cos(t * 5); g.scale(sc, 1); g.fillStyle = '#d8231b'; g.fillRect(-26, -10, 52, 34); g.fillStyle = '#333'; for (let i = 0; i < 4; i++) g.fillRect(-22, -22 + i * 3, 44, 2); g.restore();
  g.restore();
}
function drawLoading(g, t) {
  g.fillStyle = 'rgba(0,0,0,0.0)';
  const cx = W - 46, cy = H - 46; g.save(); g.translate(cx, cy); g.rotate(Math.floor(t * 12) * 0.5);
  g.fillStyle = '#ddd'; g.beginPath(); g.arc(0, 0, 16, 0, 7); g.fill(); g.fillStyle = '#88a'; g.beginPath(); g.arc(0, 0, 16, 0, 1.2); g.lineTo(0, 0); g.fill(); g.fillStyle = '#222'; g.beginPath(); g.arc(0, 0, 4, 0, 7); g.fill();
  g.restore(); pxText(g, 'LOADING...', W - 200, H - 52, 10, '#fff', 'left');
}
function drawMissionFailed(g, t) {
  const a = t - 33.69; if (a < 0 || t > 35.6) return;
  const k = easeOut(clamp(a / 0.25)); const ex = t > 35.3 ? seg(t, 35.3, 35.6) : 0;
  const x = -W + k * W + ex * W;
  g.fillStyle = 'rgba(180,0,0,0.88)'; g.fillRect(x, 150, W, 120); g.fillStyle = '#000'; g.fillRect(x, 146, W, 4); g.fillRect(x, 270, W, 4);
  pxText(g, 'MISSION FAILED', x + W / 2, 162, 24, '#ffffff', 'center');
  arText(g, 'فشلت المهمة', x + W / 2, 196, 30, '#ffe14a', 'center', 'Lalezar');
  pxText(g, 'KITCHEN HEALTH: 0%', x + W / 2, 244, 12, Math.floor(t * 6) % 2 ? '#ff9090' : '#ffffff', 'center');
}
function drawGameOver(g, t) {
  const a = t - 35.52; if (a < 0) return;
  g.fillStyle = `rgba(0,0,0,${0.62 * clamp(a / 0.5)})`; g.fillRect(0, 0, W, H);
  const word = 'GAME OVER'; const tw = 9 * 36; const sx = W / 2 - tw / 2;
  for (let i = 0; i < word.length; i++) { const la = a - i * 0.06; if (la < 0) continue; const k = clamp(la / 0.35); const y = lerp(-60, 110, easeBack(k)); pxText(g, word[i], sx + i * 36, y, 32, i % 2 ? '#ff3a3a' : '#ffe14a', 'left'); }
  if (a > 0.7) { const k = easeBack(clamp((a - 0.7) / 0.2)); g.save(); g.translate(W / 2, 175); g.scale(k, k); arText(g, 'انتهت اللعبة', 0, -24, 46, '#ff2a2a', 'center', 'ReemKufi'); g.restore(); }
  if (a > 1.2) {
    const sel = t >= 37.2 ? 1 : 0;
    const items = [['RESTART LEVEL', 'إعادة المرحلة'], ['SLEEP ON THE BALCONY', 'النوم في البلكونة']];
    items.forEach(([en, ar], i) => {
      const y = 262 + i * 58; const on = i === sel;
      if (on) { g.fillStyle = 'rgba(40,80,200,0.75)'; g.fillRect(70, y - 8, W - 140, 50); g.strokeStyle = '#fff'; g.lineWidth = 2; g.strokeRect(70, y - 8, W - 140, 50); }
      pxText(g, en, 120, y + 6, 12, on ? '#ffe14a' : '#9aa', 'left');
      arText(g, ar, W - 90, y - 4, 24, on ? '#ffffff' : '#9aa', 'right');
      if (on && Math.floor(t * 4) % 2 === 0) { g.fillStyle = '#ffe14a'; g.beginPath(); g.moveTo(88, y + 4); g.lineTo(104, y + 12); g.lineTo(88, y + 20); g.fill(); }
    });
    if (t >= 37.2 && t < 37.45) { g.fillStyle = 'rgba(255,255,255,0.35)'; g.fillRect(70, 312, W - 140, 50); }
  }
  pxText(g, 'CONTINUE? ' + Math.max(0, 9 - Math.floor(a)), W / 2, 438, 10, '#fff', 'center');
}

// glitch effects on composited frame
function glitch(g, t, strength) {
  const img = g.getImageData(0, 0, W, H); const d = img.data; const src = new Uint8ClampedArray(d);
  const f = Math.floor(t * 30);
  for (let y = 0; y < H; y++) {
    const band = hash(Math.floor(y / 12) + f * 7);
    const off = band > 1 - 0.35 * strength ? Math.floor((hash(y + f) - .5) * 80 * strength) : 0;
    for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 4; const sxR = Math.min(W - 1, Math.max(0, x + off + 6)), sxB = Math.min(W - 1, Math.max(0, x + off - 6)), sxG = Math.min(W - 1, Math.max(0, x + off));
      d[i] = src[(y * W + sxR) * 4]; d[i + 1] = src[(y * W + sxG) * 4 + 1]; d[i + 2] = src[(y * W + sxB) * 4 + 2];
      if (hash(i * 0.37 + f) < 0.12 * strength) { const v = hash(i + f * 3) * 255; d[i] = d[i + 1] = d[i + 2] = v; }
    }
  }
  g.putImageData(img, 0, 0);
}
function desat(g, amt, dark) {
  const img = g.getImageData(0, 0, W, H); const d = img.data;
  for (let i = 0; i < d.length; i += 4) { const l = d[i] * 0.3 + d[i + 1] * 0.59 + d[i + 2] * 0.11; d[i] = lerp(d[i], l, amt) * dark; d[i + 1] = lerp(d[i + 1], l, amt) * dark; d[i + 2] = lerp(d[i + 2], l, amt) * dark; }
  g.putImageData(img, 0, 0);
}

// =====================================================================
window.renderFrame = function (t) {
  const frozen = t >= 30.63 && t < 32.26;
  const st = frozen ? 30.6 : t;
  stateAt(st); cameraAt(st);
  renderer.render(scene, camera);
  ctx.clearRect(0, 0, W, H); ctx.drawImage(glCanvas, 0, 0);
  h.clearRect(0, 0, W, H);
  drawMeter(h, frozen ? (t < 31.42 ? 30.6 : 30.6) : t);
  drawDishCounter(h, st);
  if (!(t >= 32.26 && t < 33.69)) drawDialogue(h, frozen ? 30.62 : t);
  drawItemCard(h, t);
  drawMissionFailed(h, t);
  drawGameOver(h, t);
  ctx.drawImage(hud, 0, 0);
  if (t >= 30.63 && t < 31.42) glitch(ctx, t, 1);
  if (t >= 31.42 && t < 32.26) { desat(ctx, 0.7, 0.8); drawLoading(ctx, t); }
  if (t >= 32.26 && t < 32.33) { ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, W, H); }
  // shot-cut flashes for slams
  if (t >= 24.2 && t < 24.24) { ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.fillRect(0, 0, W, H); }
  return true;
};
window.frameData = () => out.toDataURL('image/png');
window.DUR = DUR;
function redrawLabels() {
  const re = (tex, bg, fn) => { const g = tex.userData.g, c = tex.userData.canvas; g.clearRect(0, 0, c.width, c.height); g.fillStyle = bg; g.fillRect(0, 0, c.width, c.height); fn(g); tex.needsUpdate = true; };
  re(signTex, '#c8a26b', (g) => { g.fillStyle = '#111'; g.font = '16px PS2P'; g.textBaseline = 'middle'; g.textAlign = 'center'; g.fillText('3000', 32, 17); });
  re(turboTex, '#111', (g) => { g.fillStyle = '#ffd400'; g.font = '8px PS2P'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('TURBO', 32, 9); });
  re(tinTex, '#1d56c9', (g) => { g.fillStyle = '#fff'; g.fillRect(0, 10, 64, 12); g.fillStyle = '#c11'; g.font = '14px Lalezar'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.direction = 'rtl'; g.fillText('جبنة', 32, 17); });
}
document.fonts.load('10px PS2P').then(() => document.fonts.load('20px Lalezar', 'ع')).then(() => document.fonts.load('700 20px ReemKufi', 'ع')).then(() => { redrawLabels(); window.READY = true; });
