// الشبشب — FINAL BOSS. Deterministic low-poly Y2K console cutscene.
// Same engine family as "Jet Dishwasher 3000": window.renderFrame(t) draws frame t into #out.
import * as THREE from 'three';

const W = 640, H = 480;
const DUR = 47.6;


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
const firePool = spritePool(canvasTex(16, 16, (g) => { g.fillStyle = '#ffdd33'; g.beginPath(); g.moveTo(8, 0); g.quadraticCurveTo(15, 9, 8, 16); g.quadraticCurveTo(1, 9, 8, 0); g.fill(); g.fillStyle = '#ff7a10'; g.beginPath(); g.arc(8, 11, 4, 0, 7); g.fill(); }), 30);
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
function drawDialogue(g, t) {
  const L = LINES.find(l => l.s !== 'anno' && t >= l.t0 && t < l.t1 + Math.min(0.5, l.gap_after * 0.9));
  if (!L) return;
  let sx = 0, sy = 0;
  if ((L.id === 'L05' || L.id === 'L09') && t < L.t0 + 0.6) { sx = (hash(Math.floor(t * 30)) - .5) * 8; sy = (hash(Math.floor(t * 30) + 3) - .5) * 5; }
  const x = 16 + sx, y = 352 + sy, w = W - 32, hh = 112;
  const gr = g.createLinearGradient(0, y, 0, y + hh); gr.addColorStop(0, 'rgba(20,40,150,0.88)'); gr.addColorStop(1, 'rgba(5,10,60,0.92)');
  g.fillStyle = gr; g.fillRect(x, y, w, hh); g.strokeStyle = '#fff'; g.lineWidth = 3; g.strokeRect(x + 1.5, y + 1.5, w - 3, hh - 3);
  g.strokeStyle = '#7fb0ff'; g.lineWidth = 1; g.strokeRect(x + 5.5, y + 5.5, w - 11, hh - 11);
  portrait(g, x + w - 78, y + 14, L.s, t);
  const [name, nameEn, col] = NAMES[L.s];
  g.fillStyle = col; g.fillRect(x + w - 190, y - 14, 170, 22); g.strokeStyle = '#fff'; g.lineWidth = 2; g.strokeRect(x + w - 190, y - 14, 170, 22);
  arText(g, name, x + w - 26, y - 16, 18, '#fff', 'right');
  pxText(g, nameEn, x + w - 184, y - 7, 8, '#fff', 'left');
  const dur = L.t1 - L.t0; const chars = [...L.ar];
  const typeT = Math.min(dur * 0.8, chars.length * 0.05);
  const n = Math.floor(chars.length * clamp((t - L.t0) / typeT));
  const shown = chars.slice(0, n).join('');
  g.font = '22px Lalezar'; g.direction = 'rtl';
  const maxW = w - 110; const words = shown.split(' '); const rows = ['']; for (const wd of words) { const tr = rows[rows.length - 1] ? rows[rows.length - 1] + ' ' + wd : wd; if (g.measureText(tr).width > maxW && rows[rows.length - 1]) rows.push(wd); else rows[rows.length - 1] = tr; }
  rows.slice(0, 2).forEach((r, i) => arText(g, r, x + w - 92, y + 10 + i * 30, 22, '#ffffff', 'right'));
  if (n >= chars.length) {
    pxText(g, L.en, x + 16, y + hh - 24, 8, '#9fd0ff', 'left');
    if (Math.floor(t * 4) % 2) { g.fillStyle = '#fff'; g.beginPath(); g.moveTo(x + 22, y + 74); g.lineTo(x + 32, y + 74); g.lineTo(x + 27, y + 80); g.fill(); }
  }
}

// =====================================================================
// EPISODE 4 — مقوّي الواي فاي النووي (balcony, night)
// =====================================================================
const T_BOOM = 35.4;
room.visible = false; hallway.visible = false;
mattress.visible = blanket.visible = pillowB.visible = false;
dish.visible = false;

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

// ---------- the invention ----------
const inv = new THREE.Group(); inv.position.set(0.25, 0, -0.1); balcony.add(inv);
const wire = P(0xbfc6cc, { shininess: 90 });
for (let i = 0; i < 3; i++) { const a = i / 3 * Math.PI * 2; const leg = mesh(cyl(0.012, 0.012, 1.75, 4), wire, Math.cos(a) * 0.32, 0.82, Math.sin(a) * 0.32, inv); leg.rotation.set(Math.sin(a) * 0.19, 0, -Math.cos(a) * 0.19); }
// coat-hanger hook on top
const hook = mesh(new THREE.TorusGeometry(0.08, 0.012, 4, 8, Math.PI * 1.4), wire, 0, 1.78, 0, inv);
const head4 = new THREE.Group(); head4.position.set(0, 1.62, 0); inv.add(head4);
const dish4 = mesh(new THREE.SphereGeometry(0.5, 10, 4, 0, Math.PI * 2, 0, Math.PI / 3.2), P(0xeeeeee, { side: THREE.DoubleSide }), 0, 0, 0, head4); dish4.rotation.x = -Math.PI / 2 - 0.5;
mesh(new THREE.CircleGeometry(0.06, 6), M(0xd4141c), 0, 0.02, -0.18, head4).rotation.x = -0.5; // brand sticker
// pan arm + pan (Teflon) at the focus
const arm = mesh(cyl(0.01, 0.01, 0.55, 4), wire, 0, 0.14, 0.28, head4); arm.rotation.x = Math.PI / 2 - 0.5;
const pan = new THREE.Group(); pan.position.set(0, 0.28, 0.52); pan.rotation.x = Math.PI / 2 - 0.5; head4.add(pan);
const panMat = P(0x1d1d1f, { shininess: 80, emissive: 0x000000 });
mesh(cyl(0.2, 0.16, 0.06, 10), panMat, 0, 0, 0, pan);
const panInner = mesh(new THREE.CircleGeometry(0.17, 10), new THREE.MeshBasicMaterial({ color: 0x2a2a30 }), 0, 0.032, 0, pan); panInner.rotation.x = -Math.PI / 2;
mesh(box(0.05, 0.03, 0.32), P(0x111111), 0, 0.02, 0.33, pan);
// router on a white plastic chair
const chair = new THREE.Group(); chair.position.set(-0.55, 0, 0.35); balcony.add(chair);
const chairMat = P(0xf4f4f0);
mesh(box(0.45, 0.04, 0.45), chairMat, 0, 0.45, 0, chair); mesh(box(0.45, 0.45, 0.04), chairMat, 0, 0.7, -0.21, chair);
for (const [x, z] of [[-0.19, -0.19], [0.19, -0.19], [-0.19, 0.19], [0.19, 0.19]]) mesh(box(0.04, 0.45, 0.04), chairMat, x, 0.22, z, chair);
const router = new THREE.Group(); router.position.set(0, 0.5, 0.02); chair.add(router);
mesh(box(0.32, 0.07, 0.22), P(0xffffff), 0, 0.035, 0, router);
const leds = []; for (let i = 0; i < 4; i++) leds.push(mesh(box(0.025, 0.012, 0.01), new THREE.MeshBasicMaterial({ color: 0x222222 }), -0.1 + i * 0.065, 0.045, 0.111, router));
for (const s of [-1, 1]) { const an = mesh(cyl(0.012, 0.012, 0.3, 4), P(0x222222), s * 0.12, 0.2, -0.08, router); an.rotation.z = s * 0.3; }
// duct-taped cable from the pan to the router (rebuilt each frame)
let cable4 = null; const cableMat4 = M(0x111111); const tapeMat4 = P(0xc9ccd1);
// bedsheet tarp
const tarp = mesh(box(1.1, 1.95, 1.1), M(0xffffff, { map: canvasTex(32, 32, (g) => { g.fillStyle = '#ffd1e0'; g.fillRect(0, 0, 32, 32); const r = rng(9); for (let i = 0; i < 14; i++) { g.fillStyle = ['#ff6fa5', '#ffffff', '#7fc8ff'][i % 3]; g.fillRect(r() * 30 | 0, r() * 30 | 0, 3, 3); } }, [2, 3]) }), 0.25, 0.98, -0.1, balcony);
// laptop (held by Hamada)
const laptopTex = canvasTex(128, 80, () => { });
const laptop = new THREE.Group(); balcony.add(laptop);
mesh(box(0.42, 0.025, 0.3), P(0x3a3a44), 0, 0, 0, laptop);
const lid = new THREE.Group(); lid.position.set(0, 0.0125, -0.15); laptop.add(lid);
mesh(box(0.42, 0.28, 0.015), P(0x3a3a44), 0, 0.14, -0.008, lid);
const screenM = mesh(new THREE.PlaneGeometry(0.38, 0.24), new THREE.MeshBasicMaterial({ map: laptopTex }), 0, 0.14, 0.001, lid);
lid.rotation.x = -0.25;
const laptopLight = new THREE.PointLight(0x9fd0ff, 0, 1.6, 1.5); laptop.add(laptopLight); laptopLight.position.set(0, 0.25, 0.2);

function drawLaptop(t) {
  const g = laptopTex.userData.g, w = 128, h = 80; g.imageSmoothingEnabled = false;
  if (t >= T_BOOM + 0.15) {
    g.fillStyle = '#000'; g.fillRect(0, 0, w, h);
    if (t > 40.5) { g.fillStyle = '#ff3030'; g.fillRect(52, 34, 20, 10); g.fillRect(72, 37, 2, 4); g.fillStyle = '#000'; g.fillRect(54, 36, 16, 6); g.fillStyle = '#ff3030'; g.fillRect(55, 37, 2, 4); g.font = '6px PS2P'; g.textAlign = 'center'; g.textBaseline = 'top'; g.fillText('1%', 64, 50); }
  } else if (t < 20.0) {
    g.fillStyle = '#f2f2f2'; g.fillRect(0, 0, w, h);
    g.strokeStyle = '#888'; g.lineWidth = 3; g.beginPath(); g.moveTo(40, 30); g.lineTo(58, 30); g.moveTo(70, 30); g.lineTo(88, 30); g.stroke();
    g.fillStyle = '#888'; g.fillRect(56, 25, 6, 10); g.fillRect(66, 25, 6, 10);
    g.fillStyle = '#333'; g.font = '13px Lalezar'; g.textAlign = 'center'; g.textBaseline = 'top'; g.direction = 'rtl'; g.fillText('لا يوجد اتصال بالإنترنت', 64, 42);
    g.direction = 'ltr'; g.fillStyle = '#c11'; g.font = '6px PS2P'; g.fillText('EXAM IN 05:00', 64, 64);
  } else if (t < 22.0) {
    g.fillStyle = '#0a1450'; g.fillRect(0, 0, w, h);
    g.save(); g.translate(64, 32); g.rotate(t * 6); g.fillStyle = '#fff'; for (let i = 0; i < 8; i++) { g.globalAlpha = (i + 1) / 8; g.rotate(Math.PI / 4); g.fillRect(-2, -14, 4, 7); } g.restore(); g.globalAlpha = 1;
    g.fillStyle = '#fff'; g.font = '7px PS2P'; g.textAlign = 'center'; g.textBaseline = 'top'; g.fillText('CONNECTING', 64, 56);
  } else if (t < 27.1) {
    g.fillStyle = '#e8eef8'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#1f5fd8'; g.fillRect(0, 0, w, 14); g.fillStyle = '#fff'; g.font = '11px Lalezar'; g.textAlign = 'right'; g.textBaseline = 'top'; g.direction = 'rtl'; g.fillText('شبكات الواي فاي', 122, 1);
    const rows = [['أبو سمير — ممنوع السرقة', true], ['WE_Fiber_9F2A', false], ['مقهى الحرية', false]];
    rows.forEach(([n, on], i) => { const y = 18 + i * 20; g.fillStyle = on ? '#3df05a' : '#fff'; g.fillRect(4, y, 120, 17); g.fillStyle = '#111'; g.font = '11px Lalezar'; g.fillText(n, 120, y + 1); g.direction = 'ltr'; g.textAlign = 'left'; g.font = '5px PS2P'; g.fillText(on ? 'CONNECTED' : 'LOCKED', 8, y + 6); g.direction = 'rtl'; g.textAlign = 'right'; });
  } else {
    g.fillStyle = '#fff'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#2a5bd7'; g.fillRect(0, 0, w, 14); g.fillStyle = '#fff'; g.font = '11px Lalezar'; g.textAlign = 'center'; g.textBaseline = 'top'; g.direction = 'rtl'; g.fillText('امتحان الفيزياء', 64, 1);
    g.fillStyle = '#111'; g.fillText('السؤال 1: احسب شدة التيار...', 64, 26);
    g.fillStyle = '#3df05a'; g.fillRect(34, 52, 60, 16); g.fillStyle = '#fff'; g.fillText('ابدأ', 64, 54);
  }
  tvShade(g, w, h);
  laptopTex.needsUpdate = true;
}
function tvShade(g, w, h) { g.fillStyle = 'rgba(0,0,0,0.12)'; for (let y = 0; y < h; y += 2) g.fillRect(0, y, w, 1); }

// ---------- the neighbourhood (blackout shot) ----------
const city = new THREE.Group(); city.position.set(200, 0, 0); scene.add(city);
const cityWindows = [];
{
  const r = rng(44); const winGeo = new THREE.PlaneGeometry(0.42, 0.55);
  const blds = [[0, 0, 7, 16, 3], [-8, -4, 6, 12, 3], [8, -3, 6, 13, 3], [-15, -9, 7, 18, 3], [15, -8, 6, 11, 3], [-4, -14, 8, 20, 3], [6, -15, 7, 15, 3], [-22, -16, 7, 14, 3], [22, -16, 7, 17, 3]];
  blds.forEach(([x, z, w, h, d], bi) => {
    mesh(box(w, h, d), M(bi === 0 ? 0xc99a5a : [0xa8865a, 0x9a7a60, 0xb59670][bi % 3]), x, h / 2, z, city);
    for (let fy = 1.2; fy < h - 0.8; fy += 1.4) for (let fx = -w / 2 + 0.7; fx < w / 2 - 0.4; fx += 0.9) {
      const m = mesh(winGeo, new THREE.MeshBasicMaterial({ color: r() > 0.25 ? 0xffd27a : 0x1a1a2a }), x + fx, fy, z + d / 2 + 0.01, city);
      const dist = Math.hypot(x + fx, fy * 0.3 + (z * 0.5));
      cityWindows.push({ m, lit: m.material.color.getHex() !== 0x1a1a2a, off: 35.85 + dist * 0.07 + r() * 0.25 });
    }
    // satellite dishes on roofs
    for (let k = 0; k < 3; k++) { const dd = mesh(new THREE.ConeGeometry(0.4, 0.18, 8), M(0xdddddd), x - w / 3 + k * w / 3, h + 0.3, z, city); dd.rotation.x = -1.0; }
  });
  mesh(new THREE.PlaneGeometry(120, 120), M(0x2a2a30), 0, 0, 0, city).rotation.x = -Math.PI / 2;
  // street lamps
  for (let i = -5; i <= 5; i++) { mesh(cyl(0.06, 0.06, 4, 5), M(0x333333), i * 5, 2, 6, city); const b = mesh(new THREE.SphereGeometry(0.22, 6, 4), new THREE.MeshBasicMaterial({ color: 0xffe9a0 }), i * 5, 4.05, 6, city); cityWindows.push({ m: b, lit: true, off: 36.9 + Math.abs(i) * 0.05 }); }
  // the culprit balcony: tiny burning pan glow on our building
  const ourFire = mesh(new THREE.SphereGeometry(0.25, 6, 4), new THREE.MeshBasicMaterial({ color: 0xff7a10 }), 1.5, 5.8, 1.6, city); ourFire.userData.fire = true; cityWindows.push({ m: ourFire, lit: true, off: 99, fire: true });
}
const citySky = mesh(new THREE.PlaneGeometry(260, 80), new THREE.MeshBasicMaterial({ map: skyTex }), 0, 20, -45, city);

// ---------- characters ----------
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
}, balcony);
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
}, balcony);
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
}, balcony);
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

const KEYS = {};
const STAND = {};
const HOLD = { aLx: 0.55, eL: 1.25, aRx: 0.55, eR: 1.25, aLz: -0.12, aRz: -0.12 };
KEYS.son = [
  [0, { ...HOLD, bend: 0.15, hx: 0.25 }],
  [0.6, { ...HOLD, bend: -0.05, hx: -0.05, hy: 0.4 }, 0.12],
  [9.75, { ...HOLD, bend: 0.0, hy: 0.6, hx: 0.05 }],
  [19.6, { ...HOLD, aRx: 1.3, eR: 1.5, bend: 0.25, hx: 0.3 }, 0.1],
  [20.3, { ...HOLD, bend: 0.1, hx: 0.25 }],
  [22.3, { ...HOLD, y: 0.08, aLz: 0.3, aRz: 0.3, bend: -0.25, hx: -0.15 }, 0.1],
  [23.3, { ...HOLD, bend: -0.15, hx: -0.05, hy: 0.5 }],
  [27.1, { ...HOLD, bend: 0.0, hx: -0.4, hy: 0.0 }],
  [30.2, { ...HOLD, y: -0.5, lL: 1.0, lR: 1.0, bend: 0.5, hx: 0.0 }, 0.12],
  [33.0, { ...HOLD, y: -0.5, lL: 1.0, lR: 1.0, bend: 0.3, hx: -0.2, hy: 0.6 }],
  [T_BOOM, { ...HOLD, y: -0.5, lL: 1.0, lR: 1.0, bend: -0.2, hx: -0.3, aLz: 0.6, aRz: 0.6 }, 0.1],
  [40.0, { ...HOLD, y: -0.55, lL: 1.2, lR: 1.2, bend: 0.25, hx: 0.25, hy: 0.3 }],
];
KEYS.dad = [
  [0, { aLz: 0.3, aRz: 0.3 }],
  [5.2, { aLz: 0.95, eL: 1.9, aRz: 0.95, eR: 1.9, bend: -0.1, hx: -0.1 }],
  [6.4, { aRx: 2.5, aRz: 1.4, eR: 0.2, aLz: 0.6, twist: 0.4 }, 0.1],
  [7.6, { aLz: 2.3, aRz: 2.3, eL: 0.3, eR: 0.3, hx: -0.15 }, 0.12],
  [9.6, { aLz: 0.95, eL: 1.9, aRz: 0.95, eR: 1.9, bend: -0.1, hx: -0.1 }],
  [12.02, { bend: 0.35, aRx: 1.3, aRz: 0.2, eR: 1.6, tr: 0, aLz: 0.4, hx: 0.1, hy: -0.2 }],
  [13.6, { bend: 0.35, aRx: 1.6, aRz: 0.6, eR: 0.4, aLz: 0.4, hx: 0.05, hy: -0.4 }],
  [15.5, { y: 0.06, aLz: 1.2, aRz: 1.2, eL: 0.3, eR: 0.3, bend: -0.2, hx: -0.2 }, 0.08],
  [17.44, { aLx: -0.6, aRx: -0.6, eL: 0.6, eR: 0.6, aLz: 0.1, aRz: 0.1, bend: 0.1, hy: 0.7 }],
  [18.6, { aLx: -0.6, eL: 0.6, aRx: 1.4, aRz: 1.3, eR: 0.2, hy: -0.2, twist: -0.1 }],
  [20.0, { aLz: 0.95, eL: 1.9, aRx: 1.2, eR: 1.6, tr: 1, hy: 0.1 }],
  [22.4, { aLz: 2.2, aRz: 2.2, eL: 0.4, eR: 0.4, y: 0.06, hx: -0.15 }, 0.1],
  [23.5, { aLz: 0.95, eL: 1.9, aRz: 0.95, eR: 1.9, hx: -0.1 }],
  [27.4, { aLz: 0.4, aRz: 0.4, hx: -0.45, bend: -0.1 }],
  [30.16, { y: -0.55, lL: 1.0, lR: 1.0, bend: 0.6, aLx: 1.5, aRx: 0.6, eL: 1.8, eR: 0.3, hx: -0.1, hy: -0.5 }, 0.12],
  [32.6, { y: -0.55, lL: 1.0, lR: 1.0, bend: 0.3, aLx: 0.6, aRx: 0.6, eL: 0.5, eR: 0.5, hx: -0.25, hy: 0.8 }],
  [T_BOOM, { y: -0.55, lL: 1.0, lR: 1.0, bend: -0.3, aLz: 1.0, aRz: 1.0, hx: -0.3 }, 0.1],
  [40.0, { y: -0.6, lL: 1.3, lR: 1.3, bend: 0.2, aLz: 0.4, aRz: 0.4, eL: 0.5, eR: 0.5, hx: 0.2, hy: -0.3 }],
  [43.4, { y: -0.6, lL: 1.3, lR: 1.3, bend: 0.1, aRx: 1.0, aRz: 0.5, eR: 1.6, aLz: 0.4, hx: 0.3, hy: -0.4 }],
];
KEYS.mom = [
  [0, { aLz: 0.95, eL: 1.9, aRz: 0.95, eR: 1.9 }],
  [15.43, { aLz: 0.95, eL: 1.9, aRx: 0.9, aRz: 0.5, eR: 0.3, hx: -0.1, bend: 0.1 }, 0.1],
  [32.56, { aLx: 1.25, eL: 1.95, aRx: 1.15, eR: 2.0, aLz: -0.2, aRz: -0.25, hx: 0.15, hz: 0.15 }],
];
KEYS.samir = [
  [0, { bend: 0.35, aLx: 0.6, eL: 0.4, aRx: 0.9, eR: 1.0, hx: 0.55 }],
  [27.1, { bend: 0.45, aLx: 0.6, eL: 0.4, aRz: 2.6, aRx: 0.3, eR: 1.2, hx: 0.6, hz: 0.1 }, 0.12],
  [28.4, { bend: 0.5, aLx: 0.6, eL: 0.4, aRz: 2.2, aRx: 0.4, eR: 0.5, hx: 0.65, hz: -0.1 }, 0.1],
];

function placeCable(t) {
  if (cable4) { balcony.remove(cable4); cable4.geometry.dispose(); }
  const a = pan.getWorldPosition(V(0, 0, 0)).sub(balcony.position), b = router.getWorldPosition(V(0, 0, 0)).add(V(0.1, 0.03, 0)).sub(balcony.position);
  const m1 = VL(a, b, 0.3).add(V(0, -0.5, 0.1)), m2 = VL(a, b, 0.7).add(V(0, -0.3, 0.1));
  cable4 = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([a, m1, m2, b]), 20, 0.012, 3), t > T_BOOM ? M(0x050505) : cableMat4); balcony.add(cable4);
}

function stateAt(t) {
  const outside = t >= 35.6 && t < 40.77;
  balcony.visible = !outside; city.visible = outside;
  scene.background = new THREE.Color(0x0b0f2e);
  scene.fog = outside ? new THREE.Fog(0x0b0f2e, 25, 70) : new THREE.Fog(0x0b0f2e, 10, 30);
  drawLaptop(t);
  const black = t >= T_BOOM;
  // lights
  ambient.intensity = black ? 0.4 : 0.75; ambient.color.setHex(black ? 0x4050a0 : 0x7080c0);
  moon.intensity = black ? 0.6 : 0.9;
  balcLight.intensity = black ? 0 : 3.5; balcLight.position.set(1.7, 1.6, -0.6);
  bDoorGlow.material.color.setHex(black ? 0x101018 : 0xffd890);
  bWin.material.color.setHex(black ? 0x101020 : 0x5a6aa0);
  upWin.material.color.setHex(black ? 0x101018 : 0xffd890);
  tvLight.intensity = 0; hallLight.intensity = 0;

  // tarp
  tarp.visible = t < 7.2;
  if (t >= 6.4) { const k = seg(t, 6.4, 7.2); tarp.position.set(0.25 + k * 2.2, 0.98 + Math.sin(k * 3) * 1.2, -0.1 + k * 1.5); tarp.rotation.set(k * 3, k * 4, k * 2); tarp.scale.set(1 + k * 0.4, 1 - k * 0.7, 1); }
  else { tarp.position.set(0.25, 0.98, -0.1); tarp.rotation.set(0, 0, 0); tarp.scale.set(1, 1, 1); }
  // dish rotation (scan, then lock)
  let yaw = -0.3;
  if (t >= 20.0 && t < 22.0) yaw = -0.3 + Math.sin((t - 20) * 9) * 1.2 * (1 - seg(t, 21.4, 22.0)) + seg(t, 20, 22) * 1.3;
  if (t >= 22.0) yaw = 1.0;
  if (t >= 27.1) yaw = 1.0 + Math.sin(t * 40) * 0.02 * (t > 32.5 ? 3 : 1);
  head4.rotation.y = yaw; head4.rotation.z = t >= 30 ? noise1(t * 20) * 0.03 : 0;
  // pan heat
  const heat = clamp(seg(t, 26.0, 34.7));
  panMat.emissive.setRGB(heat * 0.9, heat * 0.25, 0);
  panInner.material.color.setRGB(0.16 + heat * 0.84, 0.16 + heat * 0.3, 0.19 * (1 - heat));
  // router leds
  leds.forEach((l, i) => l.material.color.setHex(black ? 0x111111 : t < 20 ? (i === 0 ? 0xff3030 : 0x222222) : t < 22 ? (Math.floor(t * 8 + i) % 2 ? 0xffd400 : 0x222222) : (Math.floor(t * 10 + i * 3) % 3 ? 0x3df05a : 0x115511)));
  samLed.material.color.setHex(black ? 0x111111 : (t > 22 ? (Math.floor(t * 12) % 2 ? 0x3df05a : 0x115511) : 0x3df05a));
  placeCable(t);

  // ---- characters ----
  son.root.position.set(-1.25, 0, 0.35); son.root.rotation.y = 0.55;
  if (t >= 30.2) son.root.position.set(-0.85, 0, 0.8);
  const sp = poseAt(t, KEYS.son);
  if (t >= 0.6 && t < 4.14) { sp.hz = Math.sin(t * 9) * 0.06; }
  if (t >= 22.3 && t < 23.3) son.root.position.y = Math.abs(Math.sin((t - 22.3) * 9)) * 0.18;
  applyPose(son, sp);
  // laptop in his hands
  { const a = son.arms[0].hand.getWorldPosition(V(0, 0, 0)), b = son.arms[1].hand.getWorldPosition(V(0, 0, 0)); const c = a.add(b).multiplyScalar(0.5).sub(balcony.position);
    laptop.position.copy(c).add(V(0, -0.03, 0)); laptop.rotation.set(0, son.root.rotation.y + Math.PI, 0); lid.rotation.x = -0.25;
    laptopLight.intensity = black && t < 40.5 ? 0 : black ? 0.6 : 1.4; laptopLight.color.setHex(black ? 0xff3030 : 0x9fd0ff); }

  let dp = V(1.25, 0, 0.35), dr = -0.6;
  if (t < 5.2) { const k = easeOut(seg(t, 4.6, 5.2)); dp = VL(V(1.7, 0, -1.05), V(1.25, 0, 0.35), k); dr = lerp(0, -0.6, k); if (t < 4.6) dp = V(1.7, 0, -1.6); }
  if (t >= 12.02 && t < 15.43) { dp = V(0.85, 0, 0.45); dr = -0.2; }
  if (t >= 17.44 && t < 20.0) { dp = V(0.6, 0, 0.55); dr = 0.25; if (t >= 18.6) dr = -0.28; }
  if (t >= 30.16) { dp = V(0.55, 0, 0.7); dr = -0.4; }
  if (t >= 40.0) { dp = V(0.2, 0, 0.6); dr = -0.25; }
  if (t >= 40.0) { son.root.position.set(-0.6, 0, 0.6); son.root.rotation.y = 0.35; }
  dad.root.position.copy(dp); dad.root.rotation.y = dr; dad.root.visible = t >= 4.6;
  const dz = poseAt(t, KEYS.dad);
  if (t >= 4.6 && t < 5.2) { const w = Math.sin(t * 8); dz.lL = w * 0.4; dz.lR = -w * 0.4; }
  applyPose(dad, dz);
  dad.extras.setGoggles(t >= 7.6 && t < 12.02 || t >= 19.95 && t < 27.1);

  mom.root.visible = (t >= 15.3 && t < 17.3) || (t >= 32.4 && t < T_BOOM + 0.1) || t >= 40.77;
  mom.root.position.set(1.7, 0, -1.05); mom.root.rotation.y = -0.15;
  applyPose(mom, poseAt(t, KEYS.mom));

  samir.root.visible = t >= 26.9 && t < 30.3 || t >= 40.77;
  samir.root.position.set(-0.4, 0.09, 0.85);
  const sz = poseAt(t, KEYS.samir);
  if (t >= 27.1 && t < 29.9) { sz.aRz += Math.sin(t * 14) * 0.25; sz.eR += Math.sin(t * 14) * 0.3; }
  applyPose(samir, sz);
  cane.visible = samir.root.visible; { const hp = samir.arms[1].hand.getWorldPosition(V(0, 0, 0)).sub(balcony.position).sub(upper.position); cane.position.copy(hp).add(V(0, 0.38, 0)); cane.rotation.z = 0.2 + (t >= 27.1 && t < 29.9 ? Math.sin(t * 14) * 0.4 : 0); }

  // ---- particles ----
  const fires = [];
  const pw = pan.getWorldPosition(V(0, 0, 0));
  if (t >= 32.0 && t < T_BOOM + 4 && !outside) {
    const k = seg(t, 32.0, 34.0);
    for (let i = 0; i < 18; i++) { const ph = (t * 2.2 + hash(i)) % 1; fires.push({ pos: pw.clone().add(V((hash(i + 1) - .5) * 0.3, 0.05 + ph * (0.4 + k * 0.5), (hash(i + 2) - .5) * 0.25)), size: (0.12 + 0.18 * k) * (1 - ph), op: 1 - ph, rot: noise1(t * 5 + i) * 0.3 }); }
  }
  emit(fires, firePool);
  const smoke = [];
  if (t >= 28.0 && !outside) { const rate = t < 32 ? 4 : 10; for (let i = 0; i < 18; i++) { const ph = (t * rate / 18 + i / 18) % 1; smoke.push({ pos: pw.clone().add(V(Math.sin(i) * 0.1 + ph * 0.3, 0.2 + ph * 1.6, ph * 0.2)), size: 0.15 + ph * 0.6, op: (1 - ph) * (t < 32 ? 0.35 : 0.7), color: 0x555555 }); } }
  emit(smoke, puffPool);
  const sparks = [];
  if (t >= 34.0 && t < T_BOOM + 0.6 && !outside) {
    const rp = router.getWorldPosition(V(0, 0, 0));
    const travel = seg(t, 34.0, T_BOOM);
    for (let i = 0; i < 6; i++) { const p = VL(pw, rp, clamp(travel - i * 0.03)); sparks.push({ pos: p.add(V((hash(i + Math.floor(t * 20)) - .5) * 0.1, (hash(i + 7) - .5) * 0.1, 0)), size: 0.12, rot: t * 9 + i }); }
    if (t >= T_BOOM) { const k = seg(t, T_BOOM, T_BOOM + 0.6); for (let i = 0; i < 14; i++) { const a = i / 14 * 6.28; sparks.push({ pos: rp.clone().add(V(Math.cos(a) * k * 1.2, Math.sin(a) * k * 0.9 + 0.2, 0.2)), size: 0.25 * (1 - k) + 0.05, rot: i }); } }
  }
  if (t >= 22.0 && t < 22.6) { const k = seg(t, 22.0, 22.6); const hp = head4.getWorldPosition(V(0, 0, 0)); for (let i = 0; i < 8; i++) { const a = i / 8 * 6.28; sparks.push({ pos: hp.clone().add(V(Math.cos(a) * k * 0.8, Math.sin(a) * k * 0.8, 0.3)), size: 0.15 * (1 - k), rot: i }); } }
  emit(sparks, starPool);
  const sw = [];
  if ((t >= 0.6 && t < 4.2) || (t >= 30.16 && t < 35.5)) { const hd = son.head.getWorldPosition(V(0, 0, 0)); for (let i = 0; i < 4; i++) { const k = (t * 1.2 + i * 0.25) % 1; sw.push({ pos: hd.clone().add(V((i % 2 ? 1 : -1) * 0.26, 0.18 - k * 0.5, 0.05)), size: 0.07, op: 1 - k }); } }
  emit(sw, sweatPool);

  // laundry sway
  laundry.forEach((c, i) => { c.rotation.y = Math.sin(t * 1.3 + i) * 0.25; c.rotation.x = Math.sin(t * 1.7 + i * 2) * 0.08; });

  // city blackout
  if (outside) cityWindows.forEach(w => { if (w.fire) { w.m.visible = true; w.m.scale.setScalar(0.8 + 0.4 * Math.abs(noise1(t * 9))); return; } w.m.material.color.setHex(w.lit && t < w.off ? (w.m.geometry.type === 'SphereGeometry' ? 0xffe9a0 : 0xffd27a) : 0x15151f); });

  // ---- faces ----
  let se = 'normal', sm = 'closed';
  if (t < 0.6) { se = 'wide'; sm = 'o'; }
  else if (t < 4.6) { se = 'wide'; sm = talkMouth(t, 'son', 'scream') || 'o'; }
  else if (t < 9.75) { se = t > 7.6 ? 'flat' : 'side'; sm = 'flat'; }
  else if (t < 12.02) { se = 'flat'; sm = talkMouth(t, 'son') || 'flat'; }
  else if (t < 19.6) { se = 'side'; sm = 'wobble'; }
  else if (t < 22.3) { se = 'wide'; sm = 'clench'; }
  else if (t < 27.1) { se = 'sparkle'; sm = talkMouth(t, 'son', 'scream') || 'grin'; }
  else if (t < 30.16) { se = 'pin'; sm = 'o'; }
  else if (t < T_BOOM) { se = 'wide'; sm = 'clench'; }
  else if (t < 40.77) { se = 'pin'; sm = 'o'; }
  else { se = 'tired'; sm = talkMouth(t, 'son') || 'frown'; if (t > 45.6) se = 'closed'; }
  let de = 'normal', dm = 'closed';
  if (t < 12.02) { de = 'smug'; dm = talkMouth(t, 'dad') || 'grin'; if (t >= 7.6 && t < 9.6) de = 'sparkle'; }
  else if (t < 15.43) { de = 'smug'; dm = talkMouth(t, 'dad') || 'smile'; }
  else if (t < 17.44) { de = 'pin'; dm = 'clench'; }
  else if (t < 20.0) { de = 'side'; dm = talkMouth(t, 'dad') || 'fakegrin'; }
  else if (t < 27.1) { de = 'sparkle'; dm = 'grin'; }
  else if (t < 30.16) { de = 'pin'; dm = 'o'; }
  else if (t < 32.56) { de = 'wide'; dm = talkMouth(t, 'dad') || 'clench'; }
  else if (t < T_BOOM) { de = 'pin'; dm = 'clench'; }
  else if (t < 40.77) { de = 'pin'; dm = 'o'; }
  else { de = 'tired'; dm = talkMouth(t, 'dad') || 'frown'; if (t > 45.6) { de = 'closed'; dm = 'smile'; } }
  let me = 'angry', mm = talkMouth(t, 'mom', 'scream') || 'clench';
  if (t >= 32.4) { me = 'menace'; mm = talkMouth(t, 'mom') || 'flat'; }
  if (t >= 40.77) { me = 'flat'; mm = 'flat'; }
  let sae = 'angry', sam = talkMouth(t, 'samir', 'scream') || 'clench';
  if (t >= 40.77) { sae = 'flat'; sam = 'frown'; }
  const blink = (list) => list.some(b => t >= b && t < b + 0.18);
  if (blink([3.0, 10.8, 25.0, 43.0]) && se !== 'pin') se = 'closed';
  if (blink([6.0, 14.0, 44.3]) && de !== 'pin') de = 'closed';
  son.faceMat.map = faceTexture(se, sm, { fuzz: true }); son.faceMat.needsUpdate = true;
  dad.faceMat.map = faceTexture(de, dm, { stache: true }); dad.faceMat.needsUpdate = true;
  mom.faceMat.map = faceTexture(me, mm, {}); mom.faceMat.needsUpdate = true;
  samir.faceMat.map = faceTexture(sae, sam, { stache: true, stacheColor: '#eeeeee', glasses: true }); samir.faceMat.needsUpdate = true;
}

// =====================================================================
// CAMERA
// =====================================================================
const BP = (x, y, z) => V(x, y, z); // balcony group sits at the origin
function headOf(c) { return c.head.getWorldPosition(V(0, 0, 0)); }
function faceCam(c, dist, side = 0, up = 0, fov = 48, lookDown = 0.1) {
  const h = headOf(c); const f = c.head.getWorldDirection(V(0, 0, 0)); f.y = 0; f.normalize();
  const r = V(f.z, 0, -f.x);
  cam(h.clone().add(f.multiplyScalar(dist)).add(r.multiplyScalar(side)).add(V(0, up, 0)), h.clone().add(V(0, -lookDown, 0)), fov);
}
function cameraAt(t) {
  if (t < 4.54) { const k = seg(t, 0, 4.54); cam(VL(BP(0.2, 1.6, 3.4), BP(-0.3, 1.45, 2.6), k), BP(-0.4, 1.0, -0.3), 52); }
  else if (t < 7.9) { const k = seg(t, 4.54, 7.9); cam(VL(BP(-1.6, 1.5, 2.4), BP(-1.3, 1.45, 2.2), k), BP(0.8, 1.1, -0.3), 54); }
  else if (t < 9.75) { const k = seg(t, 7.9, 9.75); const a = lerp(-0.7, 0.7, k); const c = BP(0.25, 1.4, -0.1); cam(c.clone().add(V(Math.sin(a) * 2.1, -0.75, Math.cos(a) * 2.1)), c.clone().add(V(0, 0.1, 0)), 58); }
  else if (t < 12.02) { const h = headOf(son); cam(h.clone().add(V(0.75, 0.2, 0.95)), h.clone().add(V(0, -0.15, 0)), 50); }
  else if (t < 15.43) { const h = headOf(dad); const k = seg(t, 12.02, 15.43); cam(h.clone().add(V(lerp(-0.2, -0.1, k), 0.0, lerp(1.05, 0.85, k))), h.clone().add(V(-0.05, -0.08, 0)), 46, -0.05); }
  else if (t < 17.44) { cam(BP(-1.1, 1.5, 1.15).add(shake(t, t < 16.0 ? 0.04 : 0.005, 24)), BP(1.6, 1.4, -1.05), 46); }
  else if (t < 19.95) { faceCam(dad, 1.7, 0.4, 0.1, 50, 0.35); }
  else if (t < 22.3) { const k = seg(t, 19.95, 22.3); cam(VL(BP(-0.95, 0.55, 1.15), BP(-0.85, 0.6, 1.05), k), BP(0.25, 1.35, -0.1), 60, 0.06 * Math.sin(t * 2)); }
  else if (t < 27.1) { const h = headOf(son); const k = seg(t, 22.3, 27.1); cam(h.clone().add(V(lerp(0.9, 0.75, k), 0.25, lerp(1.0, 0.85, k))), h.clone().add(V(-0.05, -0.25, 0)), 54); }
  else if (t < 30.16) { const h = headOf(samir); cam(BP(-0.1, 1.25, 2.9).add(shake(t, t < 27.6 ? 0.03 : 0.004, 20)), h.clone().add(V(0, -0.2, 0)), 52, -0.06); }
  else if (t < 32.56) { faceCam(dad, 1.15, 0.45, 0.15, 56, 0.15); }
  else if (t < 34.71) { cam(BP(2.4, 0.95, 0.85), BP(1.55, 1.3, -1.0), 56); }
  else if (t < 35.6) { const pw = pan.getWorldPosition(V(0, 0, 0)); const k = seg(t, 34.71, 35.6); cam(VL(pw.clone().add(V(0.4, 0.2, 0.9)), pw.clone().add(V(0.2, -0.2, 1.1)), k).add(shake(t, t > T_BOOM ? 0.08 : 0.01, 25)), VL(pw, router.getWorldPosition(V(0, 0, 0)), easeInOut(seg(t, 34.9, 35.4))), 50); }
  else if (t < 40.77) { const k = seg(t, 35.6, 40.77); cam(city.position.clone().add(VL(V(3, 6, 26), V(2, 7.5, 31), k)), city.position.clone().add(V(0, 6, -6)), 50); }
  else if (t < 42.49) { const h = headOf(son); cam(h.clone().add(V(0.35, -0.05, 0.95)), h.clone().add(V(0, -0.05, 0)), 46); }
  else if (t < 45.6) { const h = headOf(dad); const k = seg(t, 42.49, 45.6); cam(h.clone().add(V(-0.3, 0.0, lerp(1.05, 0.95, k))), h.clone().add(V(0, -0.05, 0)), 46); }
  else { const k = easeInOut(seg(t, 45.6, 47.6)); cam(VL(BP(0.1, 1.4, 2.9), BP(0.1, 2.6, 4.6), k), BP(0.0, 1.6, -0.3), 54); }
}

// =====================================================================
// HUD
// =====================================================================
const NAMES = { mom: ['أم حمادة', 'OM HAMADA', '#1f9e5a'], son: ['حمادة', 'HAMADA', '#d4141c'], dad: ['إبراهيم', 'IBRAHIM', '#c9a227'], samir: ['أبو سمير', 'ABU SAMIR', '#6a6f96'] };
function portrait(g, x, y, who, t) {
  g.fillStyle = '#123'; g.fillRect(x, y, 64, 64); g.strokeStyle = '#fff'; g.lineWidth = 2; g.strokeRect(x, y, 64, 64);
  g.save(); g.beginPath(); g.rect(x + 2, y + 2, 60, 60); g.clip();
  if (who === 'mom') { g.fillStyle = '#1f9e5a'; g.beginPath(); g.arc(x + 32, y + 34, 27, 0, 7); g.fill(); g.fillStyle = '#c98d5f'; g.beginPath(); g.arc(x + 32, y + 38, 19, 0, 7); g.fill(); g.fillStyle = '#ec86ad'; g.fillRect(x + 6, y + 58, 52, 6); }
  else if (who === 'son') { g.fillStyle = '#d4141c'; g.fillRect(x + 8, y + 54, 48, 10); g.fillStyle = '#b98058'; g.beginPath(); g.arc(x + 32, y + 36, 19, 0, 7); g.fill(); g.fillStyle = '#17110c'; for (let i = 0; i < 7; i++) { g.beginPath(); g.arc(x + 14 + i * 6, y + 18 + (i % 2) * 3, 7, 0, 7); g.fill(); } }
  else if (who === 'samir') { g.fillStyle = '#8a8f96'; g.fillRect(x + 8, y + 54, 48, 10); g.fillStyle = '#c8946a'; g.beginPath(); g.arc(x + 32, y + 36, 20, 0, 7); g.fill(); g.fillStyle = '#fff'; g.beginPath(); g.arc(x + 32, y + 22, 18, Math.PI, 0); g.fill(); }
  else { g.fillStyle = '#f3f0e3'; g.fillRect(x + 10, y + 54, 44, 10); g.fillStyle = '#b27448'; g.beginPath(); g.arc(x + 32, y + 36, 20, 0, 7); g.fill(); g.fillStyle = '#1b1410'; g.fillRect(x + 10, y + 30, 5, 12); g.fillRect(x + 49, y + 30, 5, 12); g.fillStyle = '#c9a227'; g.fillRect(x + 14, y + 16, 36, 5); g.fillStyle = '#335a3a'; g.fillRect(x + 18, y + 15, 10, 7); g.fillRect(x + 36, y + 15, 10, 7); }
  const fc = document.createElement('canvas'); fc.width = 32; fc.height = 32; const fg = fc.getContext('2d');
  const e = envAt(t); const mouth = speakerAt(t) === who ? (e < 0.1 ? 'closed' : e < 0.4 ? 'talk1' : 'talk2') : 'closed';
  const eyes = who === 'mom' ? (t > 32 ? 'menace' : 'angry') : who === 'samir' ? 'angry' : who === 'son' ? (t > 40 ? 'tired' : 'wide') : (t > 40 ? 'tired' : t > 30 ? 'wide' : 'smug');
  drawFace(fg, 32, eyes, mouth, { stache: who === 'dad' || who === 'samir', stacheColor: who === 'samir' ? '#eee' : undefined, glasses: who === 'samir', fuzz: who === 'son' });
  g.imageSmoothingEnabled = false; g.drawImage(fc, x + 14, y + 20, 36, 36);
  g.restore();
}
function drawExamTimer(g, t) {
  if (t >= 35.6) return;
  const x = 14, y = 12; panel(g, x, y, 214, 44);
  pxText(g, 'ONLINE EXAM', x + 8, y + 7, 8, '#ffe14a');
  arText(g, 'امتحان أونلاين', x + 206, y + 1, 15, '#fff');
  const left = Math.max(0, 300 - Math.floor(t * 4));
  pxText(g, '0' + Math.floor(left / 60) + ':' + String(left % 60).padStart(2, '0'), x + 8, y + 24, 14, left < 200 ? '#ff4040' : '#fff');
}
function drawWifi(g, t) {
  if (t >= 35.6 && t < 40.77) return;
  const x = W - 196, y = 12; panel(g, x, y, 182, 44);
  const bars = t < 20.0 ? 0 : t < 22.0 ? Math.floor((t * 6) % 5) : t < T_BOOM ? 4 : 0;
  for (let i = 0; i < 4; i++) { g.fillStyle = i < bars ? '#3df05a' : '#333'; g.fillRect(x + 10 + i * 9, y + 32 - i * 6, 7, 6 + i * 6); }
  const label = t < 20 ? 'NO SIGNAL' : t < 22 ? 'SCANNING' : t < T_BOOM ? 'SIGNAL MAX' : 'NO POWER';
  pxText(g, label, x + 54, y + 8, 8, t < 20 || t >= T_BOOM ? '#ff4040' : '#3df05a');
  if (t >= 22 && t < T_BOOM) arText(g, 'أبو سمير', x + 174, y + 20, 15, '#fff');
  if (t < 20 || t >= T_BOOM) { g.strokeStyle = '#ff3030'; g.lineWidth = 3; g.beginPath(); g.moveTo(x + 8, y + 8); g.lineTo(x + 46, y + 38); g.stroke(); }
}
function drawItemCard(g, t) {
  const a = t - 7.9; if (a < 0 || t >= 10.0) return;
  const k = a < 0.18 ? easeBack(a / 0.18) : 1; const ex = t > 9.7 ? seg(t, 9.7, 10.0) : 0;
  g.save(); g.translate(W / 2 + ex * W, 190); g.scale(k, k);
  g.fillStyle = 'rgba(60,220,255,0.75)';
  for (let i = 0; i < 16; i++) { const an = i / 16 * 6.28 + t * 1.5; g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.cos(an) * 240, Math.sin(an) * 240); g.lineTo(Math.cos(an + 0.18) * 240, Math.sin(an + 0.18) * 240); g.fill(); }
  g.fillStyle = 'rgba(10,10,60,0.93)'; g.fillRect(-210, -98, 420, 196); g.strokeStyle = '#fff'; g.lineWidth = 3; g.strokeRect(-210, -98, 420, 196);
  pxText(g, 'NEW INVENTION!', -195, -85, 13, '#7fdcff');
  arText(g, '!اختراع جديد', 195, -94, 22, '#7fdcff', 'right');
  arText(g, 'مقوّي الواي فاي النووي', 195, -58, 30, '#ffffff', 'right');
  pxText(g, 'NUCLEAR WI-FI BOOSTER', -195, -14, 10, '#ffe14a');
  const stat = (lbl, val, yy, col) => { pxText(g, lbl, -195, yy, 9, '#fff'); pxText(g, val, -50, yy, 9, col); };
  stat('RANGE', 'ALEXANDRIA', 12, '#3df05a'); stat('PARTS', 'DISH+HANGER+PAN', 34, '#ffd400'); stat('SAFETY', '0%', 56, '#ff4a2a'); stat('MOM KNOWS', 'NO', 78, '#ff4a2a');
  g.restore();
}
function drawConnecting(g, t) {
  if (t < 20.0 || t >= 22.9) return;
  const x = W / 2 - 150, y = 200;
  g.fillStyle = 'rgba(0,0,30,0.8)'; g.fillRect(x, y, 300, 66); g.strokeStyle = '#fff'; g.lineWidth = 2; g.strokeRect(x, y, 300, 66);
  if (t < 22.0) {
    pxText(g, 'CONNECTING' + '.'.repeat(1 + Math.floor(t * 3) % 3), x + 16, y + 12, 12, '#fff');
    const p = easeInOut(seg(t, 20.0, 22.0)); g.fillStyle = '#333'; g.fillRect(x + 16, y + 36, 268, 16); g.fillStyle = '#3df05a'; g.fillRect(x + 18, y + 38, 264 * p, 12);
  } else {
    const k = easeBack(seg(t, 22.0, 22.2)); g.save(); g.translate(W / 2, y + 33); g.scale(k, k); pxText(g, 'CONNECTED!', 0, -18, 18, '#3df05a', 'center'); arText(g, 'اتوصل!', 0, 4, 22, '#ffe14a', 'center'); g.restore();
  }
}
function drawThreat(g, t) {
  if (t < 27.1 || t >= 30.2) return;
  const k = easeBack(seg(t, 27.1, 27.3));
  g.save(); g.translate(W / 2, 128); g.scale(k, k);
  pxText(g, '!', 0, -50, 40, '#ff2020', 'center');
  if (Math.floor(t * 6) % 2) pxText(g, 'WI-FI OWNER DETECTED', 0, 0, 10, '#ff4040', 'center');
  g.restore();
}
function drawHeat(g, t) {
  if (t < 26.0 || t >= T_BOOM) return;
  const v = clamp(seg(t, 26.0, 34.7)); const x = W - 196, y = 64;
  panel(g, x, y, 182, 34);
  pxText(g, 'PAN TEMP', x + 8, y + 6, 8, '#ff9a4a');
  g.fillStyle = '#333'; g.fillRect(x + 8, y + 19, 166, 9);
  g.fillStyle = v < 0.5 ? '#ffd400' : v < 0.8 ? '#ff8a1a' : '#ff2a2a'; g.fillRect(x + 8, y + 19, 166 * v, 9);
  if (v > 0.8 && Math.floor(t * 6) % 2) pxText(g, 'OVERHEAT!', W / 2, 108, 16, '#ff2a2a', 'center');
}
function drawGameOver(g, t) {
  const a = t - 37.6; if (a < 0 || t >= 40.77) return;
  g.fillStyle = `rgba(0,0,0,${0.55 * clamp(a / 0.4)})`; g.fillRect(0, 0, W, H);
  const k = easeBack(clamp(a / 0.25));
  g.save(); g.translate(W / 2, 150); g.scale(k, k);
  // wifi icon with X
  g.strokeStyle = '#888'; g.lineWidth = 6; for (let i = 1; i <= 3; i++) { g.beginPath(); g.arc(0, 20, i * 16, -Math.PI * 0.75, -Math.PI * 0.25); g.stroke(); } g.fillStyle = '#888'; g.beginPath(); g.arc(0, 20, 5, 0, 7); g.fill();
  g.strokeStyle = '#ff2020'; g.lineWidth = 7; g.beginPath(); g.moveTo(-40, -40); g.lineTo(40, 30); g.moveTo(40, -40); g.lineTo(-40, 30); g.stroke();
  g.restore();
  pxText(g, 'CONNECTION LOST', W / 2, 220, 18, '#ffffff', 'center');
  if (a > 1.2) { const k2 = easeBack(clamp((a - 1.2) / 0.25)); g.save(); g.translate(W / 2, 290); g.scale(k2, k2); pxText(g, 'GAME OVER', 0, -16, 30, '#ff3030', 'center'); arText(g, 'انتهت اللعبة', 0, 22, 34, '#ffe14a', 'center', 'ReemKufi'); g.restore(); }
}
function drawEnd(g, t) {
  const a = t - 45.75; if (a < 0) return;
  const k = easeOut(clamp(a / 0.4));
  g.fillStyle = `rgba(0,0,0,${0.55 * k})`; g.fillRect(0, 0, W, H);
  g.save(); g.translate(W / 2, 190); g.scale(k, k);
  arText(g, 'يُتبع...', 0, -40, 54, '#ffe14a', 'center', 'ReemKufi');
  pxText(g, 'TO BE CONTINUED', 0, 30, 16, '#fff', 'center');
  g.restore();
  if (a > 0.5) pxText(g, 'EPISODE 4', W / 2, 300, 10, '#9fd0ff', 'center');
}
function drawTitle(g, t) {
  if (t >= 0.6) return;
  g.fillStyle = 'rgba(0,0,0,0.6)'; g.fillRect(0, 200, W, 70);
  arText(g, 'الحلقة 4: مقوّي الواي فاي النووي', W / 2, 204, 30, '#ffe14a', 'center');
}

window.renderFrame = function (t) {
  stateAt(t); cameraAt(t);
  renderer.render(scene, camera);
  ctx.clearRect(0, 0, W, H); ctx.drawImage(glCanvas, 0, 0);
  h.clearRect(0, 0, W, H);
  if (t < 45.6) { drawExamTimer(h, t); drawWifi(h, t); }
  drawHeat(h, t);
  drawItemCard(h, t);
  drawConnecting(h, t);
  drawThreat(h, t);
  drawDialogue(h, t);
  drawGameOver(h, t);
  drawEnd(h, t);
  drawTitle(h, t);
  ctx.drawImage(hud, 0, 0);
  vignette(ctx, 0.45);
  if (t >= 6.4 && t < 6.45) { ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.fillRect(0, 0, W, H); }
  if (t >= T_BOOM && t < T_BOOM + 0.08) { ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, W, H); }
  if (t >= T_BOOM + 0.08 && t < 35.6) { ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(0, 0, W, H); }
  return true;
};
window.frameData = () => out.toDataURL('image/png');
window.DUR = DUR;
document.fonts.load('10px PS2P').then(() => document.fonts.load('20px Lalezar', 'ع')).then(() => document.fonts.load('700 20px ReemKufi', 'ع')).then(() => { window.READY = true; });

function wall(grp, w, h, x, y, z, ry, mat) { const m = mesh(new THREE.PlaneGeometry(w, h), mat, x, y, z, grp); m.rotation.y = ry; return m; }
document.fonts.load('10px PS2P').then(() => { const g = jerseyTex.userData.g; g.fillStyle = '#d4141c'; g.fillRect(0, 0, 32, 32); g.fillStyle = '#fff'; g.fillRect(0, 2, 32, 2); g.font = '12px PS2P'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('10', 16, 18); jerseyTex.needsUpdate = true; });
