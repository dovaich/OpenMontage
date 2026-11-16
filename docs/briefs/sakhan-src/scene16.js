// الشبشب — FINAL BOSS. Deterministic low-poly Y2K console cutscene.
// Same engine family as "Jet Dishwasher 3000": window.renderFrame(t) draws frame t into #out.
import * as THREE from 'three';

const W = 540, H = 960;
const DUR = 37.9;
const T_IMPACT = 999;

// ---------- utils ----------
function rng(seed) { let a = seed >>> 0; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, k) => a + (b - a) * k;
const easeOut = k => 1 - Math.pow(1 - k, 3);
const easeIn = k => k * k * k;
const easeInOut = k => k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
const easeBack = k => { const c1 = 1.9, c3 = c1 + 1; return 1 + c3 * Math.pow(k - 1, 3) + c1 * Math.pow(k - 1, 2); };
const seg = (t, a, b) => clamp((t - a) / (b - a));
const hash = (n) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const noise1 = (x) => { const i = Math.floor(x), f = x - i; const u = f * f * (3 - 2 * f); return lerp(hash(i), hash(i + 1), u) * 2 - 1; };
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const VL = (a, b, k) => a.clone().lerp(b, k);

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
const camera = new THREE.PerspectiveCamera(55, W / H, 0.05, 90);
const ambient = new THREE.AmbientLight(0x8090c0, 0.55); scene.add(ambient);
const moon = new THREE.DirectionalLight(0x9fb4ff, 0.5); moon.position.set(-4, 6, 3); scene.add(moon);
const tvLight = new THREE.PointLight(0x6fb8ff, 7, 7, 1.3); tvLight.position.set(0, 1.1, -2.9); scene.add(tvLight);
const hallLight = new THREE.PointLight(0xffc070, 0, 9, 1.2); hallLight.position.set(5.6, 2.2, 1.0); scene.add(hallLight);
const balcLight = new THREE.PointLight(0xffd08a, 0, 8, 1.3); scene.add(balcLight);
const fill = new THREE.PointLight(0xffe6c8, 1.6, 5, 1.2); scene.add(fill);

const room = new THREE.Group(); scene.add(room);
const hallway = new THREE.Group(); scene.add(hallway);
const balcony = new THREE.Group(); scene.add(balcony);

// ---------- textures ----------
const wallpaperTex = canvasTex(32, 32, (g) => {
  g.fillStyle = '#c9b48a'; g.fillRect(0, 0, 32, 32);
  g.fillStyle = '#b39a6c'; for (let i = 0; i < 4; i++) { g.fillRect(i * 8 + 3, 0, 2, 32); }
  g.fillStyle = '#e2d2a6'; for (let y = 2; y < 32; y += 8) for (let x = 0; x < 32; x += 8) { g.fillRect(x + 1, y, 2, 2); g.fillRect(x + 5, y + 4, 2, 2); }
}, [8, 3]);
const carpetTex = canvasTex(32, 32, (g) => {
  g.fillStyle = '#8f1f24'; g.fillRect(0, 0, 32, 32);
  g.fillStyle = '#1f2a5f'; g.fillRect(0, 0, 32, 3); g.fillRect(0, 29, 32, 3); g.fillRect(0, 0, 3, 32); g.fillRect(29, 0, 3, 32);
  g.fillStyle = '#e1b54a'; g.fillRect(14, 6, 4, 20); g.fillRect(6, 14, 20, 4); g.fillRect(12, 12, 8, 8);
  g.fillStyle = '#8f1f24'; g.fillRect(14, 14, 4, 4);
  g.fillStyle = '#f2e6c8'; g.fillRect(6, 6, 2, 2); g.fillRect(24, 6, 2, 2); g.fillRect(6, 24, 2, 2); g.fillRect(24, 24, 2, 2);
}, [2, 2]);
const floorTex = canvasTex(16, 16, (g) => { g.fillStyle = '#bfb39a'; g.fillRect(0, 0, 16, 16); g.fillStyle = '#a79b80'; g.fillRect(0, 7, 16, 1); g.fillRect(7, 0, 1, 16); g.fillStyle = '#d0c6ae'; g.fillRect(2, 2, 3, 1); }, [12, 10]);
const woodTex = canvasTex(16, 16, (g) => { g.fillStyle = '#8a5a2b'; g.fillRect(0, 0, 16, 16); g.fillStyle = '#6a4220'; for (let y = 0; y < 16; y += 5) g.fillRect(0, y, 16, 1); g.fillStyle = '#a06c38'; g.fillRect(3, 2, 6, 1); });
const sofaTex = canvasTex(16, 16, (g) => { g.fillStyle = '#5e7f3a'; g.fillRect(0, 0, 16, 16); g.fillStyle = '#7da04d'; for (let i = 0; i < 16; i += 4) g.fillRect(i, 0, 2, 16); g.fillStyle = '#e8c45a'; g.fillRect(6, 6, 3, 3); }, [3, 1]);
const floralTex = canvasTex(32, 32, (g) => {
  g.fillStyle = '#ec86ad'; g.fillRect(0, 0, 32, 32);
  const r = rng(4); for (let i = 0; i < 9; i++) { const x = r() * 28 | 0, y = r() * 28 | 0; g.fillStyle = '#fff3a6'; g.fillRect(x + 1, y, 2, 4); g.fillRect(x, y + 1, 4, 2); g.fillStyle = '#c0306a'; g.fillRect(x + 1, y + 1, 2, 2); }
}, [3, 3]);
const stripeTex = canvasTex(16, 16, (g) => { g.fillStyle = '#7f8fa8'; g.fillRect(0, 0, 16, 16); g.fillStyle = '#3d4e6b'; g.fillRect(2, 0, 3, 16); g.fillRect(10, 0, 2, 16); }, [3, 2]);
const jerseyTex = canvasTex(32, 32, (g) => {
  g.fillStyle = '#d4141c'; g.fillRect(0, 0, 32, 32);
  g.fillStyle = '#ffffff'; g.fillRect(0, 2, 32, 2); g.fillRect(0, 28, 32, 1);
  g.fillStyle = '#ffffff'; g.font = '14px PS2P'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('10', 16, 17);
});
const shortsTex = canvasTex(16, 16, (g) => { g.fillStyle = '#1b1b1b'; g.fillRect(0, 0, 16, 16); g.fillStyle = '#ffffff'; g.fillRect(13, 0, 2, 16); });
const blanketTex = canvasTex(32, 32, (g) => { g.fillStyle = '#6c2a6f'; g.fillRect(0, 0, 32, 32); g.fillStyle = '#f0c040'; for (let i = 0; i < 32; i += 8) { g.fillRect(i, 0, 3, 32); } g.fillStyle = '#3dc0b0'; for (let i = 0; i < 32; i += 8) g.fillRect(0, i, 32, 2); }, [2, 2]);
const mattressTex = canvasTex(16, 16, (g) => { g.fillStyle = '#e8e0c8'; g.fillRect(0, 0, 16, 16); g.fillStyle = '#7aa0d0'; g.fillRect(0, 0, 16, 2); g.fillRect(0, 8, 16, 2); });
const balcTileTex = canvasTex(16, 16, (g) => { g.fillStyle = '#9a8f7f'; g.fillRect(0, 0, 16, 16); g.fillStyle = '#6e6558'; g.fillRect(0, 7, 16, 2); g.fillRect(7, 0, 2, 16); g.fillStyle = '#b0a594'; g.fillRect(2, 2, 3, 3); }, [6, 3]);
const facadeTex = canvasTex(32, 32, (g) => { g.fillStyle = '#c99a5a'; g.fillRect(0, 0, 32, 32); g.fillStyle = '#b48548'; g.fillRect(0, 14, 32, 2); g.fillRect(0, 30, 32, 2); g.fillStyle = '#d6aa6a'; g.fillRect(4, 4, 6, 1); }, [6, 3]);
const skyTex = canvasTex(128, 64, (g) => {
  const gr = g.createLinearGradient(0, 0, 0, 64); gr.addColorStop(0, '#0b0f2e'); gr.addColorStop(0.7, '#27305e'); gr.addColorStop(1, '#5a4a6a'); g.fillStyle = gr; g.fillRect(0, 0, 128, 64);
  const r = rng(5); g.fillStyle = '#fff'; for (let i = 0; i < 40; i++) g.fillRect(r() * 128 | 0, r() * 38 | 0, 1, 1);
  g.fillStyle = '#fff6d0'; g.beginPath(); g.arc(96, 14, 7, 0, 7); g.fill(); g.fillStyle = '#0b0f2e'; g.beginPath(); g.arc(99, 12, 6, 0, 7); g.fill();
  // skyline with lit windows + satellite dishes + minaret
  for (let x = 0; x < 128; x += 7) {
    const h = 10 + r() * 16 | 0; g.fillStyle = '#141428'; g.fillRect(x, 64 - h, 6, h);
    g.fillStyle = '#f4c860'; for (let k = 0; k < 4; k++) if (r() > 0.55) g.fillRect(x + 1 + (r() * 4 | 0), 64 - h + 2 + (r() * (h - 4) | 0), 1, 1);
    g.fillStyle = '#9aa'; if (r() > 0.6) g.fillRect(x + 2, 64 - h - 2, 2, 2);
  }
  g.fillStyle = '#141428'; g.fillRect(40, 22, 3, 42); g.fillRect(38, 30, 7, 2); g.fillRect(39, 19, 5, 3); g.fillStyle = '#4fe07a'; g.fillRect(41, 16, 1, 3);
});
const nightWinTex = canvasTex(32, 32, (g) => { g.fillStyle = '#0d1230'; g.fillRect(0, 0, 32, 32); const r = rng(8); for (let x = 0; x < 32; x += 5) { const h = 6 + r() * 12 | 0; g.fillStyle = '#05061a'; g.fillRect(x, 32 - h, 4, h); g.fillStyle = '#f4c860'; if (r() > .4) g.fillRect(x + 1, 32 - h + 2, 1, 1); } g.fillStyle = '#fff'; g.fillRect(6, 5, 1, 1); g.fillRect(20, 3, 1, 1); });
function textTex(w, h, bg, draw) { return canvasTex(w, h, (g) => { if (bg) { g.fillStyle = bg; g.fillRect(0, 0, w, h); } draw(g, w, h); }); }
const booksTex = textTex(64, 16, '#2a5bd7', (g) => { g.fillStyle = '#fff'; g.font = '12px Lalezar'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.direction = 'rtl'; g.fillText('كيمياء', 32, 9); });
const clockTex = canvasTex(32, 32, (g) => { g.fillStyle = '#f6f0dc'; g.beginPath(); g.arc(16, 16, 15, 0, 7); g.fill(); g.strokeStyle = '#222'; g.lineWidth = 2; g.beginPath(); g.arc(16, 16, 14, 0, 7); g.stroke(); g.fillStyle = '#222'; g.fillRect(15, 6, 2, 10); g.save(); g.translate(16, 16); g.rotate(Math.PI / 3); g.fillRect(-1, -8, 2, 8); g.restore(); });
const posterTex = textTex(32, 44, '#111', (g) => { g.fillStyle = '#ffcc00'; g.fillRect(2, 2, 28, 40); g.fillStyle = '#d4141c'; g.beginPath(); g.arc(16, 18, 9, 0, 7); g.fill(); g.fillStyle = '#fff'; g.fillRect(12, 14, 8, 8); g.fillStyle = '#111'; g.font = '7px PS2P'; g.textAlign = 'center'; g.fillText('GOAL', 16, 38); });
const starTex = canvasTex(16, 16, (g) => { g.fillStyle = '#fff6a0'; g.fillRect(7, 0, 2, 16); g.fillRect(0, 7, 16, 2); g.fillStyle = '#ffd000'; g.fillRect(6, 6, 4, 4); g.fillStyle = '#fff'; g.fillRect(7, 7, 2, 2); });
const puffTex = canvasTex(16, 16, (g) => { g.fillStyle = '#fff'; g.beginPath(); g.arc(8, 8, 7, 0, 7); g.fill(); g.fillStyle = '#d9d9d9'; g.beginPath(); g.arc(10, 10, 4, 0, 7); g.fill(); });
const sweatTex = canvasTex(8, 12, (g) => { g.fillStyle = '#8fd8ff'; g.beginPath(); g.moveTo(4, 0); g.lineTo(8, 8); g.arc(4, 8, 4, 0, Math.PI); g.fill(); g.fillStyle = '#fff'; g.fillRect(3, 6, 2, 2); });
const trailTex = canvasTex(8, 8, (g) => { g.fillStyle = '#ff4040'; g.fillRect(1, 1, 6, 6); g.fillStyle = '#ffb0b0'; g.fillRect(3, 3, 2, 2); });
const laundryCols = [0xff5577, 0xffffff, 0x3399ff, 0xffcc00, 0x44cc66];

// ---------- TV screen texture (animated) ----------
const tvTex = canvasTex(128, 96, () => { });
function drawTV(t) {
  const g = tvTex.userData.g; const w = 128, h = 96;
  g.imageSmoothingEnabled = false;
  if (t >= T_IMPACT - 0.05 || (t >= 16.92 && t < 32.11 && false)) {
    // static after the slipper hits the console? no: show PAUSE
  }
  const mode = t < 13.3 ? 'race' : t < 16.92 ? 'save' : t < T_IMPACT ? 'paused' : 'off';
  if (mode === 'race') {
    g.fillStyle = '#4fb0ff'; g.fillRect(0, 0, w, 40); g.fillStyle = '#e8a040'; g.fillRect(0, 34, w, 6);
    g.fillStyle = '#c9a26a'; for (let x = 0; x < w; x += 12) g.fillRect(x, 26 - (x * 7 % 9), 10, 14);
    g.fillStyle = '#d9c27a'; g.fillRect(0, 40, w, 56);
    // road trapezoid with moving stripes
    const sp = t * 6;
    for (let y = 40; y < h; y++) {
      const k = (y - 40) / 56; const half = 6 + k * 70; const cx = 64 + Math.sin(t * 0.9) * 10 * k;
      g.fillStyle = '#555'; g.fillRect(cx - half, y, half * 2, 1);
      const z = 1 / (k + 0.05); if (Math.floor(z * 2 + sp) % 2) { g.fillStyle = '#fff'; g.fillRect(cx - 1 - k * 2, y, 2 + k * 4, 1); g.fillStyle = '#d22'; g.fillRect(cx - half - 3, y, 3, 1); g.fillRect(cx + half, y, 3, 1); }
    }
    // microbus sprite (white with blue stripe)
    const bx = 50 + Math.sin(t * 2.1) * 8, by = 66 + Math.abs(Math.sin(t * 9)) * 1;
    g.fillStyle = '#000'; g.fillRect(bx + 2, by + 22, 26, 3);
    g.fillStyle = '#f2f2f2'; g.fillRect(bx, by, 30, 20); g.fillStyle = '#1f5fd8'; g.fillRect(bx, by + 11, 30, 3);
    g.fillStyle = '#223'; g.fillRect(bx + 3, by + 3, 24, 6); g.fillStyle = '#111'; g.fillRect(bx + 2, by + 19, 6, 4); g.fillRect(bx + 22, by + 19, 6, 4);
    g.fillStyle = '#ff3030'; g.fillRect(bx + 1, by + 15, 4, 2); g.fillRect(bx + 25, by + 15, 4, 2);
    // rival tuk-tuk ahead
    const k2 = 0.35 + 0.1 * Math.sin(t * 0.7); const ty = 40 + k2 * 56; const ts = 4 + k2 * 10;
    g.fillStyle = '#e02020'; g.fillRect(64 - ts / 2 + Math.sin(t * 1.3) * 12 * k2, ty - ts, ts, ts);
    // HUD
    g.fillStyle = '#000'; g.fillRect(0, 0, w, 10); g.fillStyle = '#ffe14a'; g.font = '6px PS2P'; g.textAlign = 'left'; g.textBaseline = 'top';
    g.fillText('LAP 3/3', 2, 2); g.textAlign = 'right'; g.fillText('POS 1', 126, 2);
    g.textAlign = 'center'; g.fillStyle = '#fff'; g.fillText(String(Math.floor(140 + Math.sin(t * 3) * 20)) + ' KM/H', 64, 88);
    if (t > 1.0 && t < 4.3) { g.fillStyle = 'rgba(255,0,0,' + (Math.floor(t * 6) % 2 ? 0.25 : 0) + ')'; g.fillRect(0, 0, w, h); }
  } else if (mode === 'save') {
    g.fillStyle = '#0a1450'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#fff'; g.font = '8px PS2P'; g.textAlign = 'center'; g.textBaseline = 'top';
    g.fillText('SAVING...', 64, 20);
    g.font = '5px PS2P'; g.fillStyle = '#9fd0ff'; g.fillText('DO NOT TURN OFF', 64, 34); g.fillText('THE CONSOLE', 64, 42);
    const p = t < 16.4 ? Math.min(0.99, easeOut(seg(t, 13.4, 16.0)) * 0.99) : 0.99;
    g.fillStyle = '#333'; g.fillRect(14, 56, 100, 12); g.fillStyle = '#3df05a'; g.fillRect(16, 58, 96 * p, 8);
    g.fillStyle = '#fff'; g.font = '6px PS2P'; g.fillText(Math.floor(p * 100) + '%', 64, 74);
    // memory card icon
    g.fillStyle = '#ccc'; g.fillRect(56, 82, 16, 10); g.fillStyle = '#222'; g.fillRect(58, 84, 12, 3);
  } else if (mode === 'paused') {
    g.fillStyle = '#0a1450'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#ff4040'; g.font = '7px PS2P'; g.textAlign = 'center'; g.textBaseline = 'top';
    g.fillText('SAVE FAILED', 64, 30);
    g.fillStyle = Math.floor(t * 3) % 2 ? '#fff' : '#889'; g.font = '6px PS2P'; g.fillText('MEMORY CARD', 64, 48); g.fillText('NOT FOUND', 64, 58);
  } else {
    // static
    const img = g.createImageData(w, h); const f = Math.floor(t * 15);
    for (let i = 0; i < w * h; i++) { const v = hash(i * 0.731 + f * 13.1) * 200; img.data[i * 4] = img.data[i * 4 + 1] = img.data[i * 4 + 2] = v; img.data[i * 4 + 3] = 255; }
    g.putImageData(img, 0, 0);
  }
  // scanlines on the in-world TV
  g.fillStyle = 'rgba(0,0,0,0.22)'; for (let y = 0; y < h; y += 2) g.fillRect(0, y, w, 1);
  tvTex.needsUpdate = true;
}

// ---------- living room ----------
const wallMat = M(0xffffff, { map: wallpaperTex });
function wall(grp, w, h, x, y, z, ry, mat) { const m = mesh(new THREE.PlaneGeometry(w, h), mat, x, y, z, grp); m.rotation.y = ry; return m; }
wall(room, 9, 3.2, 0, 1.6, -4, 0, wallMat);
wall(room, 7, 3.2, -4.5, 1.6, -0.5, Math.PI / 2, wallMat);
wall(room, 9, 3.2, 0, 1.6, 3, Math.PI, wallMat);
// right wall with doorway gap (z 0.45..1.55, y 0..2.2)
wall(room, 4.45, 3.2, 4.5, 1.6, -1.775, -Math.PI / 2, wallMat);
wall(room, 1.45, 3.2, 4.5, 1.6, 2.275, -Math.PI / 2, wallMat);
wall(room, 1.1, 1.0, 4.5, 2.7, 1.0, -Math.PI / 2, wallMat);
const floor = mesh(new THREE.PlaneGeometry(9, 7), M(0xffffff, { map: floorTex }), 0, 0, -0.5, room); floor.rotation.x = -Math.PI / 2;
const carpet = mesh(new THREE.PlaneGeometry(3.6, 3.0), M(0xffffff, { map: carpetTex }), 0, 0.01, -1.6, room); carpet.rotation.x = -Math.PI / 2;
const ceil = mesh(new THREE.PlaneGeometry(9, 7), M(0xd8d4c0), 0, 3.2, -0.5, room); ceil.rotation.x = Math.PI / 2;
mesh(box(9, 0.12, 0.04), M(0x6a4220), 0, 0.06, -3.98, room);
// door (hinge at z=0.45)
const doorPivot = new THREE.Group(); doorPivot.position.set(4.5, 0, 0.45); room.add(doorPivot);
mesh(box(0.06, 2.2, 1.1), M(0x8a5a2b, { map: woodTex }), 0, 1.1, 0.55, doorPivot);
mesh(new THREE.SphereGeometry(0.05, 5, 4), P(0xd4b14a), -0.07, 1.05, 0.95, doorPivot);
const hallGlowMat = new THREE.MeshBasicMaterial({ color: 0x302418 });
const hallGlow = mesh(new THREE.PlaneGeometry(1.2, 2.3), hallGlowMat, 4.56, 1.15, 1.0, room); hallGlow.rotation.y = -Math.PI / 2;
// light strip under door
const underDoor = mesh(new THREE.PlaneGeometry(1.05, 0.04), new THREE.MeshBasicMaterial({ color: 0xffc070 }), 4.47, 0.02, 1.0, room); underDoor.rotation.y = -Math.PI / 2;
// TV stand + CRT TV
const tvStand = mesh(box(1.7, 0.55, 0.6), M(0x6a4220, { map: woodTex }), 0, 0.275, -3.6, room);
const tvBody = mesh(box(1.15, 0.85, 0.75), P(0x2a2a2e), 0, 0.98, -3.62, room);
mesh(box(0.8, 0.6, 0.3), P(0x2a2a2e), 0, 0.98, -4.0 + 0.05, room);
const tvScreen = mesh(new THREE.PlaneGeometry(0.92, 0.68), new THREE.MeshBasicMaterial({ map: tvTex }), -0.05, 1.0, -3.24, room);
mesh(box(0.1, 0.08, 0.02), M(0x3df05a, { emissive: 0x115511 }), 0.47, 0.67, -3.24, room);
// rabbit-ear antenna with evil-eye charm
for (const s of [-1, 1]) { const a = mesh(cyl(0.008, 0.008, 0.6, 4), P(0xcccccc), s * 0.15, 1.65, -3.65, room); a.rotation.z = s * -0.5; }
mesh(cyl(0.04, 0.04, 0.01, 8), M(0x1f5fd8), 0.3, 1.82, -3.58, room).rotation.x = Math.PI / 2;
// console + controller cable
const consoleBox = mesh(box(0.45, 0.1, 0.32), P(0x1a1a22), 0.55, 0.6, -3.4, room);
mesh(box(0.05, 0.02, 0.01), M(0x3a7fff, { emissive: 0x112266 }), 0.4, 0.6, -3.235, room);
// sofa behind
const sofa = new THREE.Group(); sofa.position.set(-1.0, 0, 1.9); room.add(sofa);
mesh(box(2.6, 0.45, 0.9), M(0xffffff, { map: sofaTex }), 0, 0.3, 0, sofa);
mesh(box(2.6, 0.7, 0.25), M(0xffffff, { map: sofaTex }), 0, 0.75, 0.33, sofa);
for (const s of [-1, 1]) mesh(box(0.25, 0.6, 0.9), M(0xffffff, { map: sofaTex }), s * 1.3, 0.45, 0, sofa);
mesh(box(0.5, 0.01, 0.35), M(0xf5f0e0), 0, 1.11, 0.33, sofa); // crocheted doily
// floor cushion
const cushion = mesh(box(0.75, 0.16, 0.75), M(0xe0a020), -0.3, 0.08, -1.5, room);
// stack of chemistry books (unopened) + snacks
const books = new THREE.Group(); books.position.set(-1.3, 0, -1.9); room.add(books);
for (let i = 0; i < 4; i++) { const b = mesh(box(0.42, 0.07, 0.3), M([0x2a5bd7, 0xd7a02a, 0x2aa05b, 0xd72a5b][i]), 0, 0.035 + i * 0.07, 0, books); b.rotation.y = (i - 1.5) * 0.12; }
const bookTop = mesh(new THREE.PlaneGeometry(0.4, 0.1), M(0xffffff, { map: booksTex }), 0, 0.28, 0.0, books); bookTop.rotation.x = -Math.PI / 2;
// spider web on books (gag: never opened)
const webMat = new THREE.LineBasicMaterial({ color: 0xdddddd });
{ const pts = []; for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI; pts.push(V(0, 0.3, 0), V(Math.cos(a) * 0.2, 0.3 + Math.sin(a) * 0.18, 0)); } const lg = new THREE.BufferGeometry().setFromPoints(pts); const web = new THREE.LineSegments(lg, webMat); web.position.set(0.0, 0, -0.12); books.add(web); }
const chips = mesh(box(0.22, 0.28, 0.08), M(0xffd400), 0.65, 0.14, -1.2, room); chips.rotation.set(-0.3, 0.4, 0.2);
const teaGlass = mesh(cyl(0.04, 0.035, 0.11, 6), P(0xbf5a1a, { transparent: true, opacity: 0.85 }), 0.4, 0.06, -1.9, room);
// window with night view
const win = new THREE.Group(); win.position.set(-4.48, 1.75, -1.8); win.rotation.y = Math.PI / 2; room.add(win);
mesh(new THREE.PlaneGeometry(1.3, 1.0), new THREE.MeshBasicMaterial({ map: nightWinTex }), 0, 0, 0, win);
for (const [x, y, w, h] of [[0, 0.53, 1.4, 0.07], [0, -0.53, 1.4, 0.07], [-0.68, 0, 0.07, 1.1], [0.68, 0, 0.07, 1.1], [0, 0, 0.05, 1.0]]) mesh(box(w, h, 0.08), M(0x7a4a22), x, y, 0.02, win);
// wall clock (2:00) + poster
const clockM = mesh(new THREE.CircleGeometry(0.22, 10), M(0xffffff, { map: clockTex }), 1.6, 2.35, -3.98, room);
const poster = mesh(new THREE.PlaneGeometry(0.6, 0.82), M(0xffffff, { map: posterTex }), -2.4, 1.85, -3.98, room);

// ---------- hallway (behind the door) ----------
const hallFloor = mesh(new THREE.PlaneGeometry(6, 1.6), M(0xffffff, { map: floorTex }), 7.5, 0, 1.0, hallway); hallFloor.rotation.x = -Math.PI / 2;
wall(hallway, 6, 3.2, 7.5, 1.6, 0.2, 0, M(0xffffff, { map: wallpaperTex }));
wall(hallway, 6, 3.2, 7.5, 1.6, 1.8, Math.PI, M(0xffffff, { map: wallpaperTex }));
const hallCeil = mesh(new THREE.PlaneGeometry(6, 1.6), M(0xcfc8b0), 7.5, 3.2, 1.0, hallway); hallCeil.rotation.x = Math.PI / 2;
const kitchenGlow = mesh(new THREE.PlaneGeometry(1.6, 3.2), new THREE.MeshBasicMaterial({ color: 0xfff0c0 }), 10.4, 1.6, 1.0, hallway); kitchenGlow.rotation.y = -Math.PI / 2;
const hallBulb = mesh(new THREE.SphereGeometry(0.08, 6, 4), new THREE.MeshBasicMaterial({ color: 0xfff2c0 }), 8.0, 3.0, 1.0, hallway);
// framed photo of Ibrahim's invention in the hallway (callback)
const photoTex = textTex(32, 24, '#d0b080', (g) => { g.fillStyle = '#2fb5b0'; g.fillRect(2, 2, 28, 20); g.fillStyle = '#d8231b'; g.fillRect(10, 8, 12, 10); g.fillStyle = '#333'; g.fillRect(10, 5, 12, 2); g.fillStyle = '#111'; g.font = '5px PS2P'; g.fillText('3000', 9, 21); });
const photo = mesh(new THREE.PlaneGeometry(0.5, 0.38), M(0xffffff, { map: photoTex }), 7.2, 1.8, 0.22, hallway);

// ---------- balcony ----------
const bTile = mesh(new THREE.PlaneGeometry(6, 2.6), M(0xffffff, { map: balcTileTex }), 0, 0, 0, balcony); bTile.rotation.x = -Math.PI / 2;
wall(balcony, 6, 3.2, 0, 1.6, -1.3, 0, M(0xffffff, { map: facadeTex }));
const bDoorGlow = mesh(new THREE.PlaneGeometry(0.95, 2.1), new THREE.MeshBasicMaterial({ color: 0xffd890 }), 1.7, 1.05, -1.28, balcony);
mesh(box(1.1, 0.08, 0.06), M(0x6a4220), 1.7, 2.12, -1.27, balcony);
const bWin = mesh(new THREE.PlaneGeometry(0.9, 0.7), new THREE.MeshBasicMaterial({ color: 0x5a6aa0 }), -1.3, 1.7, -1.28, balcony);
mesh(box(0.5, 0.35, 0.3), M(0xdedede), -2.4, 2.4, -1.15, balcony); // AC unit
// railing (front, z=+1.25)
const railMat = P(0x3a3a3a);
mesh(box(6, 0.06, 0.06), railMat, 0, 1.0, 1.25, balcony);
for (let i = -14; i <= 14; i++) mesh(box(0.025, 1.0, 0.025), railMat, i * 0.2, 0.5, 1.25, balcony);
mesh(box(6, 0.15, 0.1), M(0xb08a58), 0, 0.07, 1.25, balcony);
// laundry line with clothes
mesh(box(6, 0.01, 0.01), M(0xdddddd), 0, 2.45, 0.6, balcony);
const laundry = [];
for (let i = 0; i < 6; i++) { const c = mesh(new THREE.PlaneGeometry(0.35, 0.45), new THREE.MeshLambertMaterial({ color: laundryCols[i % 5], side: THREE.DoubleSide }), -2.2 + i * 0.85, 2.2, 0.6, balcony); laundry.push(c); }
// satellite dish + potted basil + plastic chair
const dish = mesh(new THREE.SphereGeometry(0.38, 8, 4, 0, Math.PI * 2, 0, Math.PI / 3), P(0xeeeeee, { side: THREE.DoubleSide }), 2.6, 1.9, -0.9, balcony); dish.rotation.x = -1.0;
mesh(cyl(0.16, 0.12, 0.25, 7), M(0xb8542a), -2.6, 0.12, 0.9, balcony);
mesh(new THREE.IcosahedronGeometry(0.2, 0), M(0x2f8f3a), -2.6, 0.38, 0.9, balcony);
// mattress + blanket + pillows
const mattress = mesh(box(2.0, 0.14, 1.1), M(0xffffff, { map: mattressTex }), -0.3, 0.07, -0.55, balcony);
const blanket = mesh(box(1.9, 0.08, 0.7), M(0xffffff, { map: blanketTex }), -0.3, 0.2, -0.25, balcony);
const pillowB = mesh(box(0.5, 0.15, 0.3), M(0xf0f0f0), -0.85, 0.22, -0.95, balcony);
const skyB = mesh(new THREE.PlaneGeometry(40, 18), new THREE.MeshBasicMaterial({ map: skyTex, fog: false }), 0, 4, 9, balcony); skyB.rotation.y = Math.PI;
const streetGlow = mesh(new THREE.PlaneGeometry(40, 8), new THREE.MeshBasicMaterial({ color: 0x1a1a30 }), 0, -4, 6, balcony); streetGlow.rotation.y = Math.PI;

// ---------- characters ----------
const faceCache = new Map();
function drawFace(g, s, eyes, mouth, opts = {}) {
  const u = s / 32;
  const R = (x, y, w, h, c) => { g.fillStyle = c; g.fillRect(x * u, y * u, w * u, h * u); };
  const soot = opts.soot;
  const brow = soot ? '#555' : '#2a1608';
  const white = '#ffffff', pupil = '#111';
  if (opts.red) { g.fillStyle = 'rgba(220,20,20,0.45)'; g.beginPath(); g.ellipse(16 * u, 16 * u, 14 * u, 14 * u, 0, 0, 7); g.fill(); }
  if (opts.blush) { R(4, 17, 5, 2, 'rgba(255,90,90,0.6)'); R(23, 17, 5, 2, 'rgba(255,90,90,0.6)'); }
  const eye = (cx, side) => {
    switch (eyes) {
      case 'wide': R(cx - 4, 9, 8, 8, white); R(cx - 1, 12, 2, 2, pupil); R(cx - 4, 5, 8, 2, brow); break;
      case 'flat': R(cx - 4, 13, 8, 2, pupil); R(cx - 4, 10, 8, 1, brow); break;
      case 'menace': R(cx - 4, 12, 8, 3, white); R(cx - 1, 12, 2, 3, pupil); R(cx - 4, 11, 8, 1, pupil); g.fillStyle = brow; g.save(); g.translate(cx * u, 9 * u); g.rotate(side * 0.5); g.fillRect(-5 * u, -1 * u, 10 * u, 2.5 * u); g.restore(); break;
      case 'pin': R(cx - 4, 9, 8, 8, white); R(cx, 12, 1, 1, pupil); R(cx - 4 - side, 5 - (side > 0 ? 1 : 0), 8, 2, brow); break;
      case 'smug': R(cx - 3, 12, 6, 3, white); R(cx - 3, 12, 6, 1, pupil); R(cx - 1, 13, 2, 2, pupil); R(cx - 4, 9 + (side > 0 ? 1 : 0), 8, 2, brow); break;
      case 'sparkle': R(cx - 4, 9, 8, 8, '#111'); R(cx - 3, 10, 3, 3, white); R(cx + 1, 14, 2, 2, white); R(cx - 4, 6, 8, 2, brow); break;
      case 'closed': R(cx - 4, 13, 8, 1, pupil); R(cx - 4, 9, 8, 2, brow); break;
      case 'angry': R(cx - 3, 11, 6, 4, white); R(cx - 1, 12, 2, 2, pupil); g.fillStyle = brow; g.save(); g.translate(cx * u, 9 * u); g.rotate(side * 0.45); g.fillRect(-4 * u, -1 * u, 8 * u, 2 * u); g.restore(); break;
      case 'sad': R(cx - 3, 11, 6, 5, white); R(cx - 1, 13, 2, 2, pupil); g.fillStyle = brow; g.save(); g.translate(cx * u, 8 * u); g.rotate(-side * 0.4); g.fillRect(-4 * u, -1 * u, 8 * u, 2 * u); g.restore(); break;
      case 'tears': R(cx - 3, 11, 6, 5, white); R(cx - 1, 13, 2, 2, pupil); g.fillStyle = brow; g.save(); g.translate(cx * u, 8 * u); g.rotate(-side * 0.4); g.fillRect(-4 * u, -1 * u, 8 * u, 2 * u); g.restore(); R(cx - 1 + side * 2, 16, 2, 6, '#4aa8ff'); break;
      case 'side': R(cx - 3, 11, 6, 5, white); R(cx + 1, 12, 2, 3, pupil); R(cx - 4, 8, 8, 2, brow); break;
      case 'dizzy': g.strokeStyle = pupil; g.lineWidth = u; g.beginPath(); for (let a = 0; a < 12; a += 0.4) g.lineTo((cx + Math.cos(a) * a * 0.33) * u, (13 + Math.sin(a) * a * 0.33) * u); g.stroke(); break;
      case 'x': g.strokeStyle = pupil; g.lineWidth = 1.5 * u; g.beginPath(); g.moveTo((cx - 3) * u, 10 * u); g.lineTo((cx + 3) * u, 16 * u); g.moveTo((cx + 3) * u, 10 * u); g.lineTo((cx - 3) * u, 16 * u); g.stroke(); break;
      case 'tired': R(cx - 3, 13, 6, 2, white); R(cx - 3, 12, 6, 1, pupil); R(cx - 1, 13, 2, 2, pupil); R(cx - 3, 16, 6, 1, '#8a6a9a'); R(cx - 4, 10, 8, 1, brow); break;
      case 'soot': R(cx - 1, 12, 3, 3, white); break;
      default: R(cx - 3, 11, 6, 5, white); R(cx - 1, 12, 2, 3, pupil); R(cx - 4, 8, 8, 2, brow);
    }
  };
  eye(10, -1); eye(22, 1);
  if (opts.glasses) { g.strokeStyle = '#ddd'; g.lineWidth = u; g.strokeRect(5 * u, 9 * u, 10 * u, 8 * u); g.strokeRect(17 * u, 9 * u, 10 * u, 8 * u); g.beginPath(); g.moveTo(15 * u, 12 * u); g.lineTo(17 * u, 12 * u); g.stroke(); }
  if (opts.stache) { const c = opts.stacheColor || '#111'; R(8, 19, 16, 3, c); R(6, 20, 3, 3, c); R(23, 20, 3, 3, c); }
  if (opts.beard) { const c = '#22160f'; R(5, 17, 2, 6, c); R(25, 17, 2, 6, c); R(6, 22, 3, 3, c); R(23, 22, 3, 3, c); R(9, 25, 14, 3, c); R(12, 19, 8, 1, c); }
  if (opts.fuzz) { R(10, 26, 12, 1, 'rgba(40,20,10,0.5)'); R(11, 20, 10, 1, 'rgba(40,20,10,0.35)'); }
  const mc = '#3a0d0d', teeth = '#fff';
  const my = opts.stache ? 23 : 21;
  switch (mouth) {
    case 'talk1': R(12, my, 8, 3, mc); break;
    case 'talk2': R(11, my - 1, 10, 6, mc); R(12, my - 1, 8, 1, teeth); break;
    case 'scream': R(9, my - 2, 14, 9, mc); R(10, my - 2, 12, 2, teeth); R(12, my + 4, 8, 2, '#d0405a'); break;
    case 'grin': R(9, my, 14, 4, mc); R(10, my, 3, 2, teeth); R(14, my, 3, 2, teeth); R(18, my, 3, 2, teeth); R(10, my + 2, 12, 1, teeth); break;
    case 'fakegrin': R(8, my, 16, 3, teeth); R(8, my + 1, 16, 1, '#bbb'); R(7, my - 1, 2, 2, mc); R(23, my - 1, 2, 2, mc); break;
    case 'evil': R(10, my + 1, 12, 2, mc); R(9, my, 2, 1, mc); R(21, my, 2, 1, mc); R(20, my - 1, 2, 1, mc); break;
    case 'clench': R(10, my, 12, 3, teeth); R(10, my + 1, 12, 1, '#999'); break;
    case 'smile': R(11, my + 1, 10, 2, mc); R(10, my, 2, 1, mc); R(20, my, 2, 1, mc); break;
    case 'flat': R(12, my + 1, 8, 1, mc); break;
    case 'wobble': R(10, my + 1, 3, 1, mc); R(13, my, 3, 1, mc); R(16, my + 1, 3, 1, mc); R(19, my, 3, 1, mc); break;
    case 'o': R(14, my, 4, 4, mc); break;
    case 'frown': R(11, my + 1, 10, 2, mc); R(10, my + 3, 2, 1, mc); R(20, my + 3, 2, 1, mc); break;
    case 'tongue': R(11, my, 10, 3, mc); R(16, my + 2, 4, 4, '#e0607a'); break;
    default: R(12, my + 1, 8, 2, mc);
  }
}
function faceTexture(eyes, mouth, opts) {
  const k = eyes + '|' + mouth + '|' + JSON.stringify(opts);
  if (!faceCache.has(k)) faceCache.set(k, canvasTex(32, 32, (g, s) => drawFace(g, s, eyes, mouth, opts)));
  return faceCache.get(k);
}

function makeChar(cfg, parent) {
  const root = new THREE.Group(); parent.add(root);
  const mats = [];
  const reg = m => { mats.push(m); m.userData.orig = m.color.clone(); return m; };
  const skin = reg(M(cfg.skin));
  const hips = new THREE.Group(); hips.position.y = cfg.hipY; root.add(hips);
  const legs = [];
  for (const s of [1, -1]) {
    const lp = new THREE.Group(); lp.position.set(s * cfg.legX, 0, 0); hips.add(lp);
    mesh(box(0.15, cfg.hipY - 0.06, 0.15), reg(M(0xffffff, { map: cfg.legTex || null, color: cfg.legColor })), 0, -(cfg.hipY - 0.06) / 2, 0, lp);
    const shoe = mesh(box(0.17, 0.08, 0.28), reg(M(cfg.shoe)), 0, -cfg.hipY + 0.04, 0.05, lp);
    legs.push(lp); lp.userData.shoe = shoe;
  }
  const torso = new THREE.Group(); hips.add(torso);
  const torsoMesh = mesh(cfg.torsoGeo, reg(M(0xffffff, { map: cfg.torsoTex || null, color: cfg.torsoColor })), 0, cfg.torsoY, 0, torso);
  if (cfg.skirt) mesh(cfg.skirt, reg(M(0xffffff, { map: cfg.torsoTex })), 0, -0.25, 0, hips);
  if (cfg.shorts) mesh(cfg.shorts, reg(M(0xffffff, { map: cfg.shortsTex })), 0, -0.08, 0, hips);
  const arms = [];
  for (const s of [1, -1]) {
    const sh = new THREE.Group(); sh.position.set(s * cfg.shoulderX, cfg.shoulderY, 0); torso.add(sh);
    mesh(box(0.13, 0.36, 0.13), cfg.sleeve ? reg(M(0xffffff, { map: cfg.sleeveTex || cfg.torsoTex, color: cfg.sleeveColor || 0xffffff })) : skin, 0, -0.18, 0, sh);
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
  const afro = new THREE.Group(); head.add(afro); afro.visible = false;
  { const afroMat = M(0x1a1a1a); const r = rng(cfg.seed); for (let i = 0; i < 9; i++) { const a = r() * 6.28, b = r() * 1.2; mesh(new THREE.IcosahedronGeometry(cfg.headR * (0.55 + r() * 0.2), 0), afroMat, Math.cos(a) * Math.sin(b) * cfg.headR * 0.9, cfg.headR * 0.55 + Math.cos(b) * cfg.headR * 0.5, Math.sin(a) * Math.sin(b) * cfg.headR * 0.7 - 0.05, afro); } }
  const blob = mesh(new THREE.CircleGeometry(0.42, 8), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.35, depthWrite: false }), 0, 0.012, 0, root); blob.rotation.x = -Math.PI / 2;
  return { root, hips, torso, torsoMesh, legs, arms, neck, head, face, faceMat, mats, cfg, extras, afro, blob };
}

// pose: {bend, twist, hx, hy, hz, aLx, aLz, eL, aRx, aRz, eR, lL, lR, y, tl, tr}
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
function poseAt(t, keys) {
  let cur = { ...POSE0 };
  for (let i = 0; i < keys.length; i++) {
    const [kt, kp, kd = 0.16] = keys[i];
    if (t < kt) break;
    const prev = cur; const target = { ...POSE0, ...kp };
    const k = easeBack(seg(t, kt, kt + kd));
    cur = {}; for (const n in POSE0) cur[n] = lerp(prev[n], target[n], k);
  }
  return cur;
}

// ---------- particles ----------
function spritePool(tex, n, parent = scene) {
  const arr = []; for (let i = 0; i < n; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false })); s.visible = false; parent.add(s); arr.push(s); } return arr;
}
const starPool = spritePool(starTex, 24);
const sweatPool = spritePool(sweatTex, 12);
const trailPool = spritePool(trailTex, 40);
const puffPool = spritePool(puffTex, 20);
function emit(list, pool) {
  let n = 0;
  for (const p of list) { if (n >= pool.length) break; const s = pool[n++]; s.visible = true; s.position.copy(p.pos); s.scale.set(p.size * (p.sx || 1), p.size, 1); s.material.opacity = p.op ?? 1; s.material.color.setHex(p.color ?? 0xffffff); s.material.rotation = p.rot || 0; }
  for (; n < pool.length; n++) pool[n].visible = false;
}

// ---------- dialogue data ----------
const LINES = window.LINES_DATA.lines;
const SPEAK = LINES.map(l => [l.t0, l.t1, l.s]);
function speakerAt(t) { for (const [a, b, s] of SPEAK) if (t >= a && t < b) return s; return null; }
function envAt(t) { const e = window.ENV.env; const i = Math.floor((window.TN ?? t) * window.ENV.fps); return e[Math.min(e.length - 1, Math.max(0, i))] || 0; }
function talkMouth(t, who, big) {
  if (speakerAt(t) !== who) return null;
  const e = envAt(t);
  if (e < 0.1) return 'closed';
  if (big && e > 0.72) return big;
  return e < 0.4 ? 'talk1' : 'talk2';
}

// ---------- camera ----------
function cam(pos, look, fov = 55, roll = 0) {
  camera.position.copy(pos); camera.fov = fov; camera.updateProjectionMatrix(); camera.up.set(0, 1, 0); camera.lookAt(look);
  if (roll) camera.rotateZ(roll);
  fill.position.copy(camera.position).add(V(0, 0.3, 0));
}
function shake(t, amp, freq = 18) { return V(noise1(t * freq) * amp, noise1(t * freq + 50) * amp, noise1(t * freq + 99) * amp * 0.5); }

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
function panel(g, x, y, w, hh, a = 0.65) { g.fillStyle = `rgba(0,0,30,${a})`; g.fillRect(x, y, w, hh); g.strokeStyle = '#fff'; g.lineWidth = 2; g.strokeRect(x, y, w, hh); }

function vignette(g, amt) { const gr = g.createRadialGradient(W / 2, H / 2, 120, W / 2, H / 2, 420); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, `rgba(0,0,0,${amt})`); g.fillStyle = gr; g.fillRect(0, 0, W, H); }

// ---------- upper balcony (Abu Samir) ----------
const upper = new THREE.Group(); upper.position.y = 3.2; balcony.add(upper);
mesh(box(6.2, 0.18, 2.7), M(0xb08a58), 0, 0, -0.05, upper);
mesh(box(6, 0.06, 0.06), railMat, 0, 1.0, 1.25, upper);
for (let i = -14; i <= 14; i++) mesh(box(0.025, 1.0, 0.025), railMat, i * 0.2, 0.5, 1.25, upper);
wall(upper, 6, 3.2, 0, 1.6, -1.3, 0, M(0xffffff, { map: facadeTex }));
const upWin = mesh(new THREE.PlaneGeometry(1.0, 1.2), new THREE.MeshBasicMaterial({ color: 0xffd890 }), -0.4, 1.4, -1.28, upper);
// his own router on the upper balcony wall (blinking)
const samRouter = mesh(box(0.3, 0.07, 0.2), P(0x222222), 1.3, 1.5, -1.2, upper);
const samLed = mesh(box(0.2, 0.02, 0.01), new THREE.MeshBasicMaterial({ color: 0x3df05a }), 1.3, 1.5, -1.095, upper);
for (const s of [-1, 1]) mesh(cyl(0.01, 0.01, 0.25, 4), P(0x222222), 1.3 + s * 0.1, 1.65, -1.2, upper);
// plant + birdcage on upper balcony
mesh(cyl(0.12, 0.09, 0.2, 7), M(0xb8542a), 2.4, 0.2, 0.9, upper); mesh(new THREE.IcosahedronGeometry(0.17, 0), M(0x2f8f3a), 2.4, 0.42, 0.9, upper);

const mom = makeChar({
  seed: 3, skin: 0xc98d5f, hipY: 0.82, legX: 0.14, legColor: 0xc98d5f, shoe: 0x2f6fff, hand: 0xffd400,
  torsoGeo: cyl(0.3, 0.42, 0.62, 7), torsoTex: floralTex, torsoColor: 0xffffff, torsoY: 0.31,
  skirt: cyl(0.42, 0.55, 0.55, 7), sleeve: true, shoulderX: 0.37, shoulderY: 0.56, neckY: 0.62, headR: 0.3,
  build(head, torso, reg) {
    const scarfMat = reg(M(0x1f9e5a));
    const scarf = mesh(new THREE.SphereGeometry(0.33, 8, 5, 0, Math.PI * 2, 0, Math.PI * 0.55), scarfMat, 0, 0.03, -0.03, head); scarf.rotation.x = -0.35;
    mesh(new THREE.IcosahedronGeometry(0.09, 0), scarfMat, 0, -0.12, -0.3, head);
    mesh(box(0.08, 0.22, 0.04), scarfMat, 0.05, -0.28, -0.3, head);
    return {};
  }
}, scene);
const son = makeChar({
  seed: 9, skin: 0xb98058, hipY: 0.8, legX: 0.11, legColor: 0xb98058, shoe: 0xf0f0f0, hand: 0xb98058,
  torsoGeo: cyl(0.24, 0.27, 0.62, 6), torsoTex: jerseyTex, torsoColor: 0xffffff, torsoY: 0.31,
  shorts: cyl(0.27, 0.29, 0.3, 6), shortsTex: shortsTex, sleeve: true, sleeveTex: null, sleeveColor: 0xd4141c,
  shoulderX: 0.3, shoulderY: 0.55, neckY: 0.62, headR: 0.27,
  build(head, torso, reg) {
    const hairMat = reg(M(0x17110c)); const r = rng(12);
    for (let i = 0; i < 10; i++) { const a = r() * 6.28; mesh(new THREE.IcosahedronGeometry(0.11, 0), hairMat, Math.cos(a) * 0.17, 0.2 + r() * 0.08, Math.sin(a) * 0.15 - 0.04, head); }
    const hp = new THREE.Group(); hp.position.set(0, 0.6, 0.02); torso.add(hp);
    const band = mesh(new THREE.TorusGeometry(0.2, 0.025, 4, 10, Math.PI), reg(P(0x222222)), 0, 0, 0, hp); band.rotation.x = Math.PI / 2 + 0.3;
    for (const s of [-1, 1]) mesh(cyl(0.07, 0.07, 0.06, 8), reg(P(0x2a2a2a)), s * 0.2, -0.02, 0.05, hp).rotation.z = Math.PI / 2;
    return {};
  }
}, scene);
// Ibrahim (balcony) — still wearing the afro and goggles from the explosion
const dad = makeChar({
  seed: 5, skin: 0xb27448, hipY: 0.9, legX: 0.11, legColor: 0xffffff, legTex: stripeTex, shoe: 0x6b4a2a, hand: 0xb27448,
  torsoGeo: cyl(0.25, 0.22, 0.7, 6), torsoTex: null, torsoColor: 0xf3f0e3, torsoY: 0.35,
  shoulderX: 0.31, shoulderY: 0.63, neckY: 0.72, headR: 0.29,
  build(head, torso, reg) {
    const hairMat = reg(M(0x1b1410));
    mesh(box(0.08, 0.16, 0.24), hairMat, 0.28, 0.02, -0.04, head); mesh(box(0.08, 0.16, 0.24), hairMat, -0.28, 0.02, -0.04, head);
    const gog = new THREE.Group(); head.add(gog); gog.position.set(0, 0.2, 0.2); gog.rotation.x = -0.6;
    const brass = reg(P(0xc9a227, { shininess: 80 }));
    for (const s of [-1, 1]) { mesh(new THREE.TorusGeometry(0.07, 0.025, 4, 8), brass, s * 0.1, 0, 0, gog); mesh(new THREE.CircleGeometry(0.06, 8), reg(P(0x335a3a, { shininess: 100 })), s * 0.1, 0, -0.005, gog); }
    mesh(box(0.06, 0.06, 0.01), reg(M(0x3a2d22)), 0.1, 0.2, 0.245, torso);
    mesh(box(0.05, 0.04, 0.01), reg(M(0x2a2a2a)), -0.12, 0.35, 0.245, torso);
    return { gog };
  }
}, scene);
// classic look tonight
dad.afro.visible = false;
dad.extras.setGoggles = (down) => { const g = dad.extras.gog; if (down) { g.position.set(0, 0.05, 0.27); g.rotation.x = 0; } else { g.position.set(0, 0.2, 0.2); g.rotation.x = -0.6; } };
const samir = makeChar({
  seed: 21, skin: 0xc8946a, hipY: 0.84, legX: 0.12, legColor: 0x8a8f96, shoe: 0x5a3a22, hand: 0xc8946a,
  torsoGeo: cyl(0.27, 0.33, 0.66, 7), torsoTex: null, torsoColor: 0x8a8f96, torsoY: 0.33,
  skirt: cyl(0.33, 0.42, 0.75, 7), sleeve: true, sleeveColor: 0x8a8f96, shoulderX: 0.33, shoulderY: 0.6, neckY: 0.66, headR: 0.28,
  build(head, torso, reg) {
    const white = reg(M(0xf2f2f2));
    mesh(box(0.08, 0.14, 0.24), white, 0.27, 0.0, -0.04, head); mesh(box(0.08, 0.14, 0.24), white, -0.27, 0.0, -0.04, head);
    mesh(box(0.36, 0.12, 0.08), white, 0, -0.02, -0.26, head);
    const cap = mesh(new THREE.SphereGeometry(0.29, 8, 4, 0, Math.PI * 2, 0, Math.PI * 0.42), reg(M(0xffffff)), 0, 0.02, 0, head); // white knit cap (taqiyah)
    return { cap };
  }
}, upper);
samir.root.position.set(-0.4, 0.09, 0.85);
// skirts on galabeyas look odd with a stand: give Samir a cane
const cane = mesh(cyl(0.015, 0.015, 0.9, 5), M(0x6a4220), 0, 0, 0, upper);

function headOf(c) { return c.head.getWorldPosition(V(0, 0, 0)); }
function faceCam(c, dist, side = 0, up = 0, fov = 48, lookDown = 0.1) {
  const h = headOf(c); const f = c.head.getWorldDirection(V(0, 0, 0)); f.y = 0; f.normalize();
  const r = V(f.z, 0, -f.x);
  cam(h.clone().add(f.multiplyScalar(dist)).add(r.multiplyScalar(side)).add(V(0, up, 0)), h.clone().add(V(0, -lookDown, 0)), fov);
}

// --- text synced to the voice: phrases map to voiced segments when counts match, else words follow voiced time ---
function splitPhrases(s) { return s.trim().split(/(?<=[!؟?.،…])\s+/).filter(p => p.trim()); }
function revealCount(L, t) {
  const words = L.ar.split(' '); const vox = L.vox && L.vox.length ? L.vox : [[L.t0, L.t1]];
  const phrases = splitPhrases(L.ar);
  if (phrases.length === vox.length) {
    let n = 0;
    for (let i = 0; i < phrases.length; i++) {
      const pw = phrases[i].split(' ').filter(Boolean); const [a, b] = vox[i];
      if (t >= b) { n += pw.length; continue; }
      if (t > a) n += Math.ceil(pw.length * (t - a) / (b - a));
      break;
    }
    return Math.min(words.length, n);
  }
  const total = vox.reduce((s, [a, b]) => s + (b - a), 0); let done = 0;
  for (const [a, b] of vox) { if (t >= b) done += b - a; else if (t > a) done += t - a; }
  const frac = done / total; const lens = words.map(w => w.length + 1); const all = lens.reduce((a, b) => a + b, 0);
  let acc = 0, n = 0; for (const l of lens) { if ((acc + l * 0.5) / all <= frac + 1e-6) { acc += l; n++; } else break; }
  return n;
}
function drawDialogue(g, t) {
  const L = LINES.find(l => l.s !== 'anno' && t >= l.t0 - 0.05 && t < l.t1 + Math.min(0.45, l.gap_after));
  if (!L) return;
  let sx = 0, sy = 0;
  if ((L.id === 'L03' || L.id === 'L05' || L.id === 'L07') && t < L.t0 + 0.5) { sx = (hash(Math.floor(t * 30)) - .5) * 8; sy = (hash(Math.floor(t * 30) + 3) - .5) * 5; }
  const x = 16 + sx, y = 352 + sy, w = W - 32, hh = 112;
  const gr = g.createLinearGradient(0, y, 0, y + hh); gr.addColorStop(0, 'rgba(20,40,150,0.88)'); gr.addColorStop(1, 'rgba(5,10,60,0.92)');
  g.fillStyle = gr; g.fillRect(x, y, w, hh); g.strokeStyle = '#fff'; g.lineWidth = 3; g.strokeRect(x + 1.5, y + 1.5, w - 3, hh - 3);
  g.strokeStyle = '#7fb0ff'; g.lineWidth = 1; g.strokeRect(x + 5.5, y + 5.5, w - 11, hh - 11);
  portrait(g, x + w - 78, y + 14, L.s, t);
  const [name, nameEn, col] = NAMES[L.s];
  g.fillStyle = col; g.fillRect(x + w - 190, y - 14, 170, 22); g.strokeStyle = '#fff'; g.lineWidth = 2; g.strokeRect(x + w - 190, y - 14, 170, 22);
  arText(g, name, x + w - 26, y - 16, 18, '#fff', 'right'); pxText(g, nameEn, x + w - 184, y - 7, 8, '#fff', 'left');
  const words = L.ar.split(' '); const n = revealCount(L, t); const shown = words.slice(0, n).join(' ');
  g.font = '22px Lalezar'; g.direction = 'rtl';
  const maxW = w - 110; const rows = ['']; for (const wd of shown.split(' ').filter(Boolean)) { const tr = rows[rows.length - 1] ? rows[rows.length - 1] + ' ' + wd : wd; if (g.measureText(tr).width > maxW && rows[rows.length - 1]) rows.push(wd); else rows[rows.length - 1] = tr; }
  rows.slice(0, 2).forEach((r, i) => arText(g, r, x + w - 92, y + 10 + i * 30, 22, '#ffffff', 'right'));
  // English subtitle follows the same progress
  const ew = L.en.split(' '); const en = ew.slice(0, Math.ceil(ew.length * n / words.length)).join(' ');
  pxText(g, en, x + 16, y + hh - 24, 8, '#9fd0ff', 'left');
  if (n >= words.length && Math.floor(t * 4) % 2) { g.fillStyle = '#fff'; g.beginPath(); g.moveTo(x + 22, y + 74); g.lineTo(x + 32, y + 74); g.lineTo(x + 27, y + 80); g.fill(); }
}

// =====================================================================
// Shared vertical (9:16) helpers + home sets for the family episodes
// (needs engine8 globals; engine8 built with W = 540, H = 960)
// =====================================================================
hallway.visible = false; balcony.visible = false; samir.root.visible = false;
skyB.visible = false; streetGlow.visible = false;
tvLight.intensity = 0; hallLight.intensity = 0; balcLight.intensity = 0;
const inT = (t, a, b) => t >= a && t < b;
function setFace(c, eyes, mouth, opts = {}) { c.faceMat.map = faceTexture(eyes, mouth, opts); c.faceMat.needsUpdate = true; }
function talkPose(p, t, who, amt = 1) { if (speakerAt(t) !== who) return p; const e = envAt(t) * amt; p.aRx += e * 0.35 * (1 + Math.sin(t * 5.3)); p.eR += e * 0.5; p.hy += Math.sin(t * 2.1) * 0.08; return p; }
function txtTex(w, h, bg, fn) { const t = canvasTex(w, h, (g) => { if (bg) { g.fillStyle = bg; g.fillRect(0, 0, w, h); } if (fn) fn(g, w, h); }); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; }
const roomLight = new THREE.PointLight(0xfff0d8, 0, 9, 1.1); scene.add(roomLight);

// ---------- BATHROOM (x = 60) ----------
const BX = 60;
const bath = new THREE.Group(); bath.position.x = BX; scene.add(bath);
{
  const tile = txtTex(16, 16, '#dfeef4', (g) => { g.fillStyle = '#a8c8d8'; g.fillRect(0, 15, 16, 1); g.fillRect(15, 0, 1, 16); }); tile.repeat.set(8, 6);
  const ftile = txtTex(16, 16, '#d8d8d0', (g) => { g.fillStyle = '#b8b8b0'; g.fillRect(0, 0, 8, 8); g.fillRect(8, 8, 8, 8); }); ftile.repeat.set(6, 6);
  mesh(new THREE.PlaneGeometry(4, 4), M(0xffffff, { map: ftile }), 0, 0, 0, bath).rotation.x = -Math.PI / 2;
  mesh(new THREE.PlaneGeometry(4, 3), M(0xffffff, { map: tile }), 0, 1.5, -1.5, bath);
  mesh(new THREE.PlaneGeometry(4, 3), M(0xffffff, { map: tile }), -1.8, 1.5, 0.5, bath).rotation.y = Math.PI / 2;
  mesh(new THREE.PlaneGeometry(4, 3), M(0xffffff, { map: tile }), 1.8, 1.5, 0.5, bath).rotation.y = -Math.PI / 2;
  mesh(new THREE.PlaneGeometry(4, 4), M(0xe8e8e0), 0, 2.9, 0, bath).rotation.x = Math.PI / 2;
  // shower stall (left) with a curtain
  mesh(box(1.3, 0.12, 1.2), P(0xf4f4f4), -1.1, 0.06, -0.85, bath);
  mesh(cyl(0.02, 0.02, 1.4, 6), P(0xcccccc), -0.44, 2.2, -0.85, bath).rotation.x = Math.PI / 2;
  const sh = new THREE.Group(); sh.position.set(-1.1, 2.15, -1.42); bath.add(sh); mesh(cyl(0.12, 0.08, 0.06, 10), P(0xcccccc), 0, 0, 0.12, sh).rotation.x = Math.PI / 2 - 0.5; mesh(cyl(0.015, 0.015, 0.2, 5), P(0xcccccc), 0, 0.05, 0.05, sh).rotation.x = 0.6;
  // toilet (right)
  const wc = new THREE.Group(); wc.position.set(1.05, 0, -1.05); bath.add(wc);
  mesh(cyl(0.2, 0.16, 0.4, 10), P(0xffffff), 0, 0.2, 0.1, wc); mesh(cyl(0.22, 0.22, 0.04, 12), P(0xf0f0f0), 0, 0.42, 0.12, wc); mesh(box(0.45, 0.45, 0.18), P(0xffffff), 0, 0.62, -0.18, wc);
  mesh(new THREE.CircleGeometry(0.15, 10), M(0x6ab8e0), 0, 0.41, 0.12, wc).rotation.x = -Math.PI / 2;
  // sink + mirror
  mesh(box(0.55, 0.15, 0.4), P(0xffffff), 0.1, 0.85, -1.3, bath); mesh(cyl(0.04, 0.05, 0.85, 6), P(0xffffff), 0.1, 0.42, -1.35, bath);
  mesh(new THREE.PlaneGeometry(0.5, 0.65), P(0xbfd8e8, { shininess: 120 }), 0.1, 1.55, -1.49, bath);
}
const curtain = mesh(new THREE.PlaneGeometry(1.2, 1.9), new THREE.MeshLambertMaterial({ color: 0x3a8ad8, side: THREE.DoubleSide, transparent: true, opacity: 0.92 }), BX - 0.44, 1.2, -0.85, scene); curtain.rotation.y = Math.PI / 2;
const bathLight = new THREE.PointLight(0xfff6e8, 0, 6, 1.2); bathLight.position.set(BX, 2.6, 0); scene.add(bathLight);

// ---------- KITCHEN (x = 120) ----------
const KX = 120;
const kitchen = new THREE.Group(); kitchen.position.x = KX; scene.add(kitchen);
{
  const kt = txtTex(16, 16, '#f2f2ee', (g) => { g.fillStyle = '#c8d8e8'; g.fillRect(0, 0, 8, 8); g.fillRect(8, 8, 8, 8); }); kt.repeat.set(8, 6);
  mesh(new THREE.PlaneGeometry(6, 5), M(0xffffff, { map: kt }), 0, 0, 0, kitchen).rotation.x = -Math.PI / 2;
  const wt = txtTex(16, 16, '#eef4f8', (g) => { g.fillStyle = '#9fc0d8'; g.fillRect(0, 15, 16, 1); g.fillRect(15, 0, 1, 16); }); wt.repeat.set(10, 5);
  mesh(new THREE.PlaneGeometry(6, 3.2), M(0xffffff, { map: wt }), 0, 1.6, -1.6, kitchen);
  mesh(box(3.6, 0.9, 0.6), M(0x8a5a2b, { map: woodTex }), -0.4, 0.45, -1.25, kitchen); mesh(box(3.7, 0.05, 0.65), P(0xdedede), -0.4, 0.92, -1.25, kitchen);
  mesh(box(3.6, 0.7, 0.35), M(0x8a5a2b, { map: woodTex }), -0.4, 2.15, -1.4, kitchen);
  mesh(box(0.8, 0.9, 0.6), P(0xdedede), 0.6, 0.45, -1.25, kitchen); // stove
  for (let i = 0; i < 4; i++) mesh(cyl(0.09, 0.09, 0.02, 8), M(0x222222), 0.42 + (i % 2) * 0.36, 0.92, -1.38 + Math.floor(i / 2) * 0.26, kitchen);
  mesh(box(0.8, 1.9, 0.7), P(0xf0f0f0), 2.1, 0.95, -1.2, kitchen); mesh(box(0.04, 0.4, 0.04), P(0x888888), 1.75, 1.2, -0.84, kitchen); // fridge
}
const flames = []; for (let i = 0; i < 7; i++) { const f = mesh(new THREE.ConeGeometry(0.045, 0.16, 5), new THREE.MeshBasicMaterial({ color: i % 2 ? 0xff9a1a : 0x4a8aff }), KX + 0.6 + Math.cos(i * 0.9) * 0.1, 0.97, -1.25 + Math.sin(i * 0.9) * 0.1, scene); flames.push(f); }
const kitLight = new THREE.PointLight(0xfff6e8, 0, 7, 1.2); kitLight.position.set(KX, 2.6, 0.2); scene.add(kitLight);

// ---------- DINING TABLE in the living room (origin) ----------
const dtable = new THREE.Group(); dtable.position.set(0, 0, -1.25); room.add(dtable);
{
  const cloth = txtTex(16, 16, '#f4f0e0', (g) => { g.fillStyle = '#d8231b'; g.fillRect(0, 0, 16, 2); g.fillRect(0, 7, 16, 2); g.fillRect(0, 14, 16, 2); }); cloth.repeat.set(4, 2);
  mesh(box(2.0, 0.06, 1.0), M(0xffffff, { map: cloth }), 0, 0.76, 0, dtable);
  for (const [x, z] of [[-0.9, -0.42], [0.9, -0.42], [-0.9, 0.42], [0.9, 0.42]]) mesh(box(0.06, 0.74, 0.06), M(0x6a4220), x, 0.37, z, dtable);
  for (const x of [-0.6, 0, 0.6]) { mesh(box(0.42, 0.06, 0.42), M(0x6a4220), x, 0.46, -0.72, dtable); mesh(box(0.42, 0.6, 0.06), M(0x6a4220), x, 0.78, -0.93, dtable); }
  for (const x of [-0.6, 0, 0.6]) mesh(cyl(0.14, 0.12, 0.02, 10), P(0xffffff), x, 0.8, -0.25, dtable);
  mesh(cyl(0.05, 0.04, 0.22, 6), P(0x8fd0ff, { transparent: true, opacity: 0.7 }), -0.85, 0.9, 0.2, dtable);
}

// ---------- 2D overlays (portrait layout) ----------
function drawHookV(g, t, a, b, l1, l2) {
  if (t < a || t >= b) return; const k = easeBack(seg(t, a, a + 0.3)) * (1 - easeIn(seg(t, b - 0.3, b)));
  g.save(); g.translate(W / 2, 150); g.scale(k, k); g.fillStyle = 'rgba(255,255,255,0.95)'; g.fillRect(-250, -66, 500, 132); g.fillStyle = '#d8231b'; g.fillRect(-250, 58, 500, 8);
  arText(g, l1, 0, -66, 46, '#111', 'center'); arText(g, l2, 0, -10, 46, '#d8231b', 'center'); g.restore();
}
function drawRewind(g, t, a, b, ar) {
  if (t < a || t >= b) return; g.fillStyle = 'rgba(0,0,0,0.5)'; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 8; i++) { g.fillStyle = 'rgba(255,255,255,0.25)'; g.fillRect(0, ((t * 1600 + i * 130) % H), W, 6); }
  pxText(g, '<< REWIND', W / 2, H / 2 - 60, 18, '#fff', 'center'); arText(g, ar, W / 2, H / 2 - 30, 34, '#ffe14a', 'center');
}
function drawInventionV(g, t, a, b, ar, bars) {
  if (t < a || t >= b) return; const k = easeBack(seg(t, a, a + 0.35)) * (1 - easeIn(seg(t, b - 0.4, b)));
  g.save(); g.translate(W / 2, 150); g.scale(k, k); g.fillStyle = 'rgba(10,10,30,0.92)'; g.fillRect(-240, -80, 480, 168); g.strokeStyle = '#ffe14a'; g.lineWidth = 3; g.strokeRect(-240, -80, 480, 168);
  pxText(g, 'NEW INVENTION!', 0, -70, 12, '#ffe14a', 'center', false); arText(g, ar, 0, -52, 36, '#fff', 'center');
  bars.forEach(([lbl, n, col], i) => { const y = 8 + i * 24; pxText(g, lbl, -220, y, 9, '#9fd0ff', 'left', false); for (let j = 0; j < 10; j++) { g.fillStyle = j < n ? col : '#333'; g.fillRect(-40 + j * 22, y - 3, 17, 14); } });
  g.restore();
}
function drawEndV(g, t, a, head, ar, meters, dur) {
  if (t >= a && t < dur - 3.2) {
    const k = easeBack(seg(t, a, a + 0.35)); g.save(); g.translate(W / 2, H - 240); g.scale(k, k);
    g.fillStyle = 'rgba(0,0,30,0.92)'; g.fillRect(-240, -100, 480, 200); g.strokeStyle = '#ff3a2a'; g.lineWidth = 3; g.strokeRect(-240, -100, 480, 200);
    pxText(g, head, 0, -88, 14, '#3df05a', 'center'); arText(g, ar, 0, -66, 30, '#fff', 'center');
    meters.forEach(([lbl, arl, t0, col], i) => { if (t < t0) return; const c = Math.min(10, Math.floor((t - t0) * 7)); const y = 0 + i * 46; pxText(g, lbl, -220, y, 9, '#fff', 'left', false); for (let j = 0; j < 10; j++) { g.fillStyle = j < c ? col : '#333'; g.fillRect(-20 + j * 22, y - 4, 18, 18); } if (c >= 10) arText(g, arl, 0, y + 14, 22, '#ffe14a', 'center'); });
    g.restore();
  }
  if (t >= dur - 3.2) { const k = easeOut(seg(t, dur - 3.2, dur - 2.8)); g.fillStyle = `rgba(0,0,0,${0.7 * k})`; g.fillRect(0, 0, W, H); g.save(); g.translate(W / 2, H / 2 - 60); g.scale(k, k); arText(g, 'يُتبع...', 0, -40, 64, '#ffe14a', 'center', 'ReemKufi'); pxText(g, 'TO BE CONTINUED', 0, 40, 16, '#fff', 'center'); g.restore(); }
  if (t > dur - 0.8) { g.fillStyle = `rgba(0,0,0,${clamp((t - dur + 0.8) / 0.8)})`; g.fillRect(0, 0, W, H); }
}
const NAMES = { son: ['حمادة', 'HAMADA', '#d4141c'], dad: ['إبراهيم', 'IBRAHIM', '#c9a227'], mom: ['أم حمادة', 'OM HAMADA', '#1f9e5a'] };
function portrait(g, x, y, who, t, S = 64) {
  const u = S / 64; g.save(); g.translate(x, y); g.scale(u, u);
  g.fillStyle = '#123'; g.fillRect(0, 0, 64, 64); g.strokeStyle = '#fff'; g.lineWidth = 2; g.strokeRect(0, 0, 64, 64);
  g.beginPath(); g.rect(2, 2, 60, 60); g.clip();
  const skin = { son: '#b98058', dad: '#b27448', mom: '#c98d5f' }[who]; const shirt = { son: '#d4141c', dad: '#f3f0e3', mom: '#e86a8a' }[who];
  g.fillStyle = shirt; g.fillRect(8, 54, 48, 10);
  if (who === 'mom') { g.fillStyle = '#1f9e5a'; g.beginPath(); g.arc(32, 36, 25, 0, 7); g.fill(); }
  g.fillStyle = skin; g.beginPath(); g.arc(32, 36, 20, 0, 7); g.fill();
  if (who === 'mom') { g.fillStyle = '#1f9e5a'; g.beginPath(); g.arc(32, 30, 22, Math.PI, 0); g.fill(); }
  if (who === 'son') { g.fillStyle = '#17110c'; for (let i = 0; i < 6; i++) { g.beginPath(); g.arc(16 + i * 6.5, 19 + (i % 2) * 2, 6, 0, 7); g.fill(); } g.fillStyle = '#222'; g.fillRect(9, 30, 6, 12); g.fillRect(49, 30, 6, 12); }
  if (who === 'dad') { g.fillStyle = '#1b1410'; g.fillRect(10, 30, 5, 12); g.fillRect(49, 30, 5, 12); g.fillStyle = '#c9a227'; g.fillRect(14, 16, 36, 5); }
  const fc = document.createElement('canvas'); fc.width = 32; fc.height = 32; const fg = fc.getContext('2d');
  const e = envAt(t); const mouth = speakerAt(t) === who ? (e < 0.1 ? 'closed' : e < 0.4 ? 'talk1' : 'talk2') : 'closed';
  drawFace(fg, 32, { son: 'tired', dad: 'smug', mom: 'angry' }[who], mouth, { stache: who === 'dad' });
  g.imageSmoothingEnabled = false; g.drawImage(fc, 14, 20, 36, 36); g.restore();
}
function drawDialogueV(g, t) {
  const L = LINES.find(l => l.s !== 'anno' && t >= l.t0 - 0.05 && t < l.t1 + Math.min(0.45, l.gap_after));
  if (!L) return;
  const x = 12, w = W - 24, hh = 168, y = H - hh - 40;
  const gr = g.createLinearGradient(0, y, 0, y + hh); gr.addColorStop(0, 'rgba(20,40,150,0.9)'); gr.addColorStop(1, 'rgba(5,10,60,0.94)');
  g.fillStyle = gr; g.fillRect(x, y, w, hh); g.strokeStyle = '#fff'; g.lineWidth = 3; g.strokeRect(x + 1.5, y + 1.5, w - 3, hh - 3);
  portrait(g, x + w - 92, y + 16, L.s, t, 80);
  const [name, nameEn, col] = NAMES[L.s];
  g.fillStyle = col; g.fillRect(x + w - 210, y - 20, 190, 30); g.strokeStyle = '#fff'; g.lineWidth = 2; g.strokeRect(x + w - 210, y - 20, 190, 30);
  arText(g, name, x + w - 28, y - 22, 24, '#fff'); pxText(g, nameEn, x + w - 202, y - 10, 8, '#fff', 'left');
  const words = L.ar.split(' '); const n = revealCount(L, t); const shown = words.slice(0, n).join(' ');
  g.font = '30px Lalezar'; g.direction = 'rtl'; const maxW = w - 120; const rows = [''];
  for (const wd of shown.split(' ').filter(Boolean)) { const tr = rows[rows.length - 1] ? rows[rows.length - 1] + ' ' + wd : wd; if (g.measureText(tr).width > maxW && rows[rows.length - 1]) rows.push(wd); else rows[rows.length - 1] = tr; }
  rows.slice(0, 3).forEach((r, i) => arText(g, r, x + w - 108, y + 10 + i * 40, 30, '#ffffff', 'right'));
  const ew = L.en.split(' '); const en = ew.slice(0, Math.ceil(ew.length * n / words.length)).join(' ');
  g.font = '8px PS2P'; const er = ['']; for (const wd of en.split(' ')) { const tr = er[er.length - 1] ? er[er.length - 1] + ' ' + wd : wd; if (g.measureText(tr).width > w - 40 && er[er.length - 1]) er.push(wd); else er[er.length - 1] = tr; }
  er.slice(0, 2).forEach((r, i) => pxText(g, r, x + 14, y + hh - 34 + i * 14, 8, '#9fd0ff', 'left'));
}

// =====================================================================
// السخان النووي — vertical 9:16
// =====================================================================
room.visible = true;
const T_RW = 3.3, T_HOOK = 3.9, T_REVEAL = 9.9, T_TURBO = 19.35, T_SCALD = 20.2, T_SPA = 27.0, T_ANNO = 30.17;
// ---------- the Nuclear Water Heater 3000 ----------
const heater = new THREE.Group(); heater.position.set(BX + 1.0, 2.05, -1.25); scene.add(heater);
mesh(cyl(0.28, 0.28, 0.85, 12), P(0xf4f4f4, { shininess: 60 }), 0, 0, 0, heater);
mesh(new THREE.CircleGeometry(0.07, 10), M(0xffffff), 0.0, 0.1, 0.281, heater);
const needle = mesh(box(0.012, 0.06, 0.01), M(0xd8231b), 0, 0.12, 0.29, heater);
const heatGlow = mesh(cyl(0.285, 0.285, 0.86, 12, true), new THREE.MeshBasicMaterial({ color: 0xff3a10, transparent: true, opacity: 0, side: THREE.DoubleSide }), 0, 0, 0, heater);
const kettle = new THREE.Group(); kettle.position.set(-0.32, -0.55, 0.12); heater.add(kettle);
mesh(cyl(0.11, 0.13, 0.22, 10), P(0xd8d8e0, { shininess: 100 }), 0, 0, 0, kettle); mesh(cyl(0.02, 0.03, 0.14, 5), P(0xd8d8e0), 0.14, 0.04, 0, kettle).rotation.z = -1.0; mesh(box(0.04, 0.16, 0.04), M(0x222222), -0.13, 0.03, 0, kettle);
const dryer = new THREE.Group(); dryer.position.set(0.25, -0.5, 0.18); heater.add(dryer);
mesh(cyl(0.07, 0.08, 0.28, 8), P(0xff5fa8), 0, 0, 0, dryer).rotation.z = Math.PI / 2; mesh(box(0.06, 0.18, 0.06), P(0xff5fa8), -0.06, -0.12, 0, dryer);
mesh(cyl(0.2, 0.16, 0.05, 10), P(0x1d1d1f, { shininess: 80 }), 0, -0.48, 0.22, heater).rotation.x = 1.2; // pan
for (let i = 0; i < 3; i++) mesh(box(0.62, 0.04, 0.02), P(0xc9ccd1), 0, -0.2 - i * 0.16, 0.29, heater);
const turbo = mesh(box(0.14, 0.14, 0.06), new THREE.MeshBasicMaterial({ color: 0xd8231b }), BX + 0.55, 1.4, -1.45, scene);
const turboT = txtTex(32, 16, '#d8231b', (g) => { g.fillStyle = '#fff'; g.font = '8px PS2P'; g.textAlign = 'center'; g.fillText('TURBO', 16, 11); });
mesh(new THREE.PlaneGeometry(0.22, 0.11), new THREE.MeshBasicMaterial({ map: turboT }), BX + 0.55, 1.58, -1.47, scene);
for (const z of [-1.45]) mesh(cyl(0.025, 0.025, 1.6, 6), P(0xb8c0c8), BX + 0.1, 2.35, z, scene).rotation.z = Math.PI / 2; // pipe to the shower
// towel for Hamada
const towel = mesh(cyl(0.3, 0.32, 0.45, 8), M(0xf4f4f4), 0, -0.05, 0, son.hips);
const towelD = mesh(box(0.5, 0.05, 0.25), M(0xf0e8d8), 0, 0.58, 0.05, dad.torso); // towel over Ibrahim's shoulder
const skinOrig = son.mats[0].color.clone();

function steamAt(t) { return t < T_RW + 0.1 || t >= 23.4 ? 1 : t >= T_SCALD ? 0.7 : 0; }
function where(t) { return t < T_RW + 0.6 ? 'room' : t < 23.4 ? 'bath' : 'room'; }

function stateAt(t) {
  const W_ = where(t);
  // ----- Hamada -----
  let sp = { ...POSE0 }, sr = 0, spos;
  if (W_ === 'bath') {
    if (t < T_TURBO) { spos = V(BX - 0.05, 0, 0.25); sr = 0.15; sp = { ...POSE0, aLx: 1.2, eL: 1.8, aRx: 1.2, eR: 1.8, aLz: 0.2, aRz: 0.2, hz: Math.sin(t * 40) * 0.04 }; // hugging himself, shivering
      if (inT(t, 13.6, 16.5)) { sp.aLz = 0.9; sp.aLx = 0; sp.eL = 0.2; } }
    else { spos = V(BX - 0.25, 0, -0.35); sr = 0.2; const j = Math.sin(t * 12); sp = { ...POSE0, aLz: 2.5 + j * 0.3, aRz: 2.5 - j * 0.3, eL: 0.3, eR: 0.3, y: Math.abs(j) * 0.12, lL: j * 0.4, lR: -j * 0.4 }; }
  } else { spos = V(-0.4, 0, 0.6); sr = 0.25; sp = { ...POSE0, aLx: 0.9, eL: 1.5, aRx: 0.9, eR: 1.5, hz: Math.sin(t * 3) * 0.05 }; }
  if (W_ === 'bath' && t < T_SCALD) spos.x += Math.sin(t * 50) * 0.008;
  son.root.position.copy(spos); son.root.rotation.set(0, sr, 0); applyPose(son, talkPose(sp, t, 'son', 0.4));
  son.root.visible = !(t < T_RW + 0.6) && !inT(t, 23.4, T_SPA - 0.4);
  const red = t >= T_SCALD; const cold = W_ === 'bath' && t < T_TURBO;
  son.mats[0].color.copy(red ? new THREE.Color(0xe0503a) : cold ? new THREE.Color(0x8aa8c8) : skinOrig);
  towel.visible = t >= T_SCALD;
  let se = cold ? 'tired' : 'wide', sm = talkMouth(t, 'son', 'scream') || (cold ? 'wobble' : 'o');
  if (inT(t, 13.6, 16.5)) { se = 'flat'; } if (t >= T_SCALD) { se = t >= T_SPA ? 'dizzy' : 'x'; sm = talkMouth(t, 'son', 'scream') || 'wobble'; }
  setFace(son, se, sm, { blush: red });

  // ----- Ibrahim -----
  let dp = { ...POSE0 }, dr = -0.3, dpos;
  if (W_ === 'bath') { dpos = V(BX + 0.55, 0, -0.45); if (inT(t, 8.1, 13.5)) { dr = -0.2; if (t > T_REVEAL - 0.3) { dp.aLx = 1.9; dp.aLz = 0.5; dp.eL = 0.2; } }
    if (inT(t, 16.7, T_TURBO + 0.4)) { dr = 0.35; const k = easeIn(seg(t, 18.9, T_TURBO)); dp.aRx = 1.3 + 0.2 * k; dp.eR = 0.5; dp.aRz = 0.0; }
    if (t >= T_TURBO + 0.4) { dr = -0.2; dp.aLz = 0.4; dp.aRz = 0.4; } }
  else { dpos = V(0.55, 0, 0.45); dr = -0.15; if (t >= T_SPA) { dp.aLz = 0.9; dp.aLx = 0.4; dp.eL = 0.3; dp.aRz = 0.3; } }
  dad.root.position.copy(dpos); dad.root.rotation.set(0, dr, 0); applyPose(dad, talkPose(dp, t, 'dad'));
  dad.root.visible = !(t < T_RW + 0.6) && !inT(t, 23.4, T_SPA - 0.4);
  towelD.visible = t >= T_SPA - 0.4;
  let de = 'smug', dm = talkMouth(t, 'dad', 'grin') || 'smile';
  if (inT(t, T_REVEAL - 0.3, 13.6)) de = 'sparkle'; if (inT(t, 18.9, 20.2)) { de = 'sparkle'; dm = 'grin'; } if (inT(t, T_SCALD, 23.4)) { de = 'wide'; dm = 'clench'; }
  if (t >= T_SPA) { de = 'smug'; dm = talkMouth(t, 'dad', 'grin') || 'grin'; }
  setFace(dad, de, dm, { stache: true });

  // ----- Om Hamada -----
  const momIn = t < T_RW + 0.6 || t >= 23.4; mom.root.visible = momIn;
  if (momIn) { mom.root.position.set(t < T_RW + 0.6 || t < T_SPA - 0.4 ? 0.1 : 1.35, 0, t < T_SPA - 0.4 || t < T_RW + 0.6 ? 0.55 : 0.1); mom.root.rotation.set(0, t >= T_SPA - 0.4 && t > 5 ? -0.5 : 0, 0);
    const p = { ...POSE0, aLz: 0.6, aRz: 0.6, eL: 1.2, eR: 1.2, aLx: 0.3, aRx: 0.3 }; if (speakerAt(t) === 'mom') { p.aLz = 2.2 + Math.sin(t * 9) * 0.2; p.aRz = 2.2; p.eL = p.eR = 0.3; } if (t >= T_SPA) { p.aLx = 1.3; p.eL = 1.9; p.aRx = 1.3; p.eR = 1.9; p.aLz = p.aRz = 0.3; }
    applyPose(mom, talkPose(p, t, 'mom', 0.3)); setFace(mom, t >= T_SPA ? 'flat' : 'angry', talkMouth(t, 'mom', 'scream') || 'frown', {}); }

  // ----- the heater -----
  { const turboOn = t >= T_TURBO; const k = turboOn ? clamp((t - T_TURBO) / 0.8) : 0;
    heater.position.set(BX + 1.0 + (turboOn && t < 23.4 ? Math.sin(t * 60) * 0.015 : 0), 2.05, -1.25); heatGlow.material.opacity = turboOn ? 0.25 + 0.25 * Math.sin(t * 20) * k + 0.2 * k : 0;
    needle.rotation.z = turboOn ? -2.2 * k + Math.sin(t * 30) * 0.05 : 0.6; turbo.scale.z = inT(t, T_TURBO - 0.05, T_TURBO + 0.25) ? 0.4 : 1; }
  const s = steamAt(t); scene.fog = s > 0 ? new THREE.Fog(0xdfe6ee, 2.0, 7.5 + (1 - s) * 5) : null;
  bathLight.intensity = W_ === 'bath' ? 1.6 : 0; roomLight.position.set(0, 2.6, 1.0); roomLight.intensity = W_ === 'room' ? 1.6 : 0;
  ambient.color.setHex(0xfff0e0); ambient.intensity = 0.62; moon.intensity = 0.2; fill.intensity = 1.0;
  curtain.visible = true;
}

function shotAt(t) {
  if (t < T_RW + 0.6) { faceCam(mom, 2.1, 0.3, 0.05, 60, 0.35); camera.position.add(shake(t, 0.03)); return; }
  if (t < 8.1) { faceCam(son, 1.9, 0.3, 0.0, 58, 0.35); return; }
  if (t < 13.6) { const k = easeOut(seg(t, 8.1, T_REVEAL)); cam(VL(V(BX + 0.1, 1.55, 1.5), V(BX + 0.25, 1.7, 1.9), k), V(BX + 0.8, lerp(1.4, 1.6, k), -1.0), 64); return; }
  if (t < 16.6) { faceCam(son, 1.8, 0.3, 0.0, 58, 0.35); return; }
  if (t < T_TURBO) { faceCam(dad, 1.9, 0.45, 0.05, 60, 0.25); return; }
  if (t < T_SCALD) { cam(V(BX + 0.75, 1.75, 0.35).add(shake(t, 0.05)), V(BX + 0.95, 1.85, -1.25), 56); return; }
  if (t < 23.4) { faceCam(son, 2.1, 0.3, 0.05, 60, 0.3); camera.position.add(shake(t, 0.03)); return; }
  if (t < T_SPA - 0.4) { faceCam(mom, 2.0, 0.3, 0.05, 60, 0.35); return; }
  if (t < T_ANNO) { cam(V(0.1, 1.55, 2.75), V(0.15, 1.2, 0.3), 64); return; }
  const k = easeInOut(seg(t, T_ANNO, 36)); cam(VL(V(0.1, 1.6, 2.75), V(0.1, 2.0, 2.9), k), V(0.2, lerp(1.2, 1.6, k), 0.2), 68);
}

function particles(t) {
  const pf = [], st = [];
  const s = steamAt(t);
  if (s > 0) { const W_ = where(t); const c = W_ === 'bath' ? V(BX - 0.5, 1.0, -0.6) : V(0.2, 1.0, 0.4); for (let i = 0; i < 14; i++) { const k = (t * 0.35 + i / 14) % 1; pf.push({ pos: c.clone().add(V((hash(i) - .5) * 3.2, k * 2.2, (hash(i + 5) - .5) * 2.4)), size: 0.6 + k * 1.2, op: 0.32 * s * (1 - k), color: 0xf4f8fc }); } }
  if (inT(t, T_TURBO, 23.4)) { const p = heater.position; for (let i = 0; i < 6; i++) { const k = (t * 3 + i / 6) % 1; st.push({ pos: p.clone().add(V(Math.cos(i * 2) * 0.4 * k, -0.3 + Math.sin(i * 3) * 0.4 * k, 0.3)), size: 0.1 * (1 - k), color: 0xffa040 }); } }
  emit(pf, puffPool); emit(st, starPool); emit([], trailPool); emit([], sweatPool);
}

function drawThermo(g, t) {
  if (!inT(t, T_TURBO, 23.4)) return; const k = clamp((t - T_TURBO) / 1.6);
  const x = 40, y = 230, hh = 300; g.fillStyle = 'rgba(0,0,0,0.6)'; g.fillRect(x - 14, y - 40, 76, hh + 90);
  pxText(g, 'TEMP', x - 6, y - 30, 9, '#fff', 'left', false); g.fillStyle = '#fff'; g.fillRect(x, y, 40, hh); g.fillStyle = '#ddd'; g.fillRect(x + 4, y + 4, 32, hh - 8);
  const lvl = (hh - 8) * k; const col = k < 0.4 ? '#4aa8ff' : k < 0.8 ? '#ff9a1a' : (Math.floor(t * 8) % 2 ? '#ff2a2a' : '#ffe14a'); g.fillStyle = col; g.fillRect(x + 4, y + hh - 4 - lvl, 32, lvl);
  g.beginPath(); g.arc(x + 20, y + hh + 18, 26, 0, 7); g.fill(); if (k >= 1) arText(g, 'بيغلي!', x + 20, y + hh + 2, 20, '#fff', 'center');
}
function drawSpa(g, t) {
  if (!inT(t, T_SPA + 0.6, T_ANNO)) return; const k = easeBack(seg(t, T_SPA + 0.6, T_SPA + 0.95));
  g.save(); g.translate(W / 2, 130); g.scale(k, k); g.fillStyle = '#1f9e5a'; g.fillRect(-200, -50, 400, 100); g.strokeStyle = '#ffe14a'; g.lineWidth = 4; g.strokeRect(-200, -50, 400, 100);
  arText(g, 'سبا إبراهيم', 0, -52, 44, '#fff', 'center'); arText(g, 'الدخول ٥٠ جنيه', 0, 0, 24, '#ffe14a', 'center'); g.restore();
}

window.renderFrame = function (t) {
  stateAt(t); shotAt(t); particles(t);
  renderer.render(scene, camera);
  ctx.clearRect(0, 0, W, H); ctx.drawImage(glCanvas, 0, 0);
  h.clearRect(0, 0, W, H);
  drawHookV(h, t, T_HOOK, 7.6, 'لما السخان يبوظ', 'في عز الشتا');
  drawInventionV(h, t, T_REVEAL, 13.5, 'السخان النووي ٣٠٠٠', [['HEAT', 10, '#ff5a2a'], ['SAFETY', 0, '#ff5a4a']]);
  drawThermo(h, t); drawSpa(h, t); drawRewind(h, t, T_RW, T_HOOK, 'قبلها بربع ساعة...');
  drawDialogueV(h, t);
  drawEndV(h, t, T_ANNO + 0.1, 'APARTMENT: SAUNA', 'الشقة بقت حمّام بخار', [['WATER TEMP', 'المية: بتغلي', 31.4, '#ff5a2a'], ['STEAM', 'البخار: آخره', 33.0, '#cfe0ff']], DUR);
  ctx.drawImage(hud, 0, 0); vignette(ctx, 0.3);
  if (t >= T_TURBO && t < T_TURBO + 0.07) { ctx.fillStyle = 'rgba(255,200,150,0.6)'; ctx.fillRect(0, 0, W, H); }
  return true;
};
window.frameData = () => out.toDataURL('image/png');
window.DUR = DUR;
document.fonts.load('10px PS2P').then(() => document.fonts.load('20px Lalezar', 'ع')).then(() => document.fonts.load('700 20px ReemKufi', 'ع')).then(() => { window.READY = true; });
