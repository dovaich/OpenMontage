// الشبشب — FINAL BOSS. Deterministic low-poly Y2K console cutscene.
// Same engine family as "Jet Dishwasher 3000": window.renderFrame(t) draws frame t into #out.
import * as THREE from 'three';

const W = 640, H = 480;
const DUR = 38.5;
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

function headOf(c) { return c.head.getWorldPosition(V(0, 0, 0)); }
function faceCam(c, dist, side = 0, up = 0, fov = 48, lookDown = 0.1) {
  const h = headOf(c); const f = c.head.getWorldDirection(V(0, 0, 0)); f.y = 0; f.normalize();
  const r = V(f.z, 0, -f.x);
  cam(h.clone().add(f.multiplyScalar(dist)).add(r.multiplyScalar(side)).add(V(0, up, 0)), h.clone().add(V(0, -lookDown, 0)), fov);
}

const street = new THREE.Group(); scene.add(street);
const showroom = new THREE.Group(); showroom.position.set(100, 0, 0); scene.add(showroom);

// ---------- textures ----------
const daySkyTex = canvasTex(128, 64, (g) => {
  const gr = g.createLinearGradient(0, 0, 0, 64); gr.addColorStop(0, '#5aa8ff'); gr.addColorStop(1, '#cfe6ff'); g.fillStyle = gr; g.fillRect(0, 0, 128, 64);
  g.fillStyle = '#ffffff'; const r = rng(3); for (let i = 0; i < 6; i++) { const x = r() * 120, y = 6 + r() * 20; g.fillRect(x, y, 14, 4); g.fillRect(x + 3, y - 2, 8, 2); }
  for (let x = 0; x < 128; x += 7) { const h = 8 + r() * 14 | 0; g.fillStyle = '#c9a77f'; g.fillRect(x, 64 - h, 6, h); g.fillStyle = '#eee'; if (r() > 0.6) g.fillRect(x + 2, 64 - h - 2, 2, 2); }
  g.fillStyle = '#c9a77f'; g.fillRect(80, 24, 3, 40); g.fillRect(78, 32, 7, 2); g.fillRect(79, 21, 5, 3); g.fillStyle = '#4fe07a'; g.fillRect(81, 18, 1, 3);
});
const asphaltTex = canvasTex(32, 32, (g) => { g.fillStyle = '#4a4a50'; g.fillRect(0, 0, 32, 32); const r = rng(6); for (let i = 0; i < 40; i++) { g.fillStyle = r() > .5 ? '#56565c' : '#3e3e44'; g.fillRect(r() * 32 | 0, r() * 32 | 0, 2, 2); } g.fillStyle = '#e8e0b0'; g.fillRect(0, 15, 12, 2); }, [16, 3]);
const pavTex = canvasTex(16, 16, (g) => { g.fillStyle = '#b8ab8e'; g.fillRect(0, 0, 16, 16); g.fillStyle = '#9a8e72'; g.fillRect(0, 7, 16, 1); g.fillRect(7, 0, 1, 8); g.fillRect(3, 8, 1, 8); }, [24, 3]);
const curbTex = canvasTex(16, 4, (g) => { for (let i = 0; i < 4; i++) { g.fillStyle = i % 2 ? '#111' : '#f2f2f2'; g.fillRect(i * 4, 0, 4, 4); } }, [40, 1]);
function txt(w, h, bg, fn) { return canvasTex(w, h, (g) => { g.fillStyle = bg; g.fillRect(0, 0, w, h); fn(g, w, h); }); }
const shopTex = txt(96, 24, '#1f6fd8', (g) => { g.fillStyle = '#fff'; g.font = '16px Lalezar'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.direction = 'rtl'; g.fillText('بقالة الأمل', 48, 13); });
const mashallahTex = txt(64, 20, '#d8231b', (g) => { g.fillStyle = '#ffe14a'; g.font = '13px Lalezar'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.direction = 'rtl'; g.fillText('ما شاء الله', 32, 11); });
const plateTex = txt(48, 16, '#f0f0f0', (g) => { g.fillStyle = '#d8231b'; g.fillRect(0, 0, 48, 4); g.fillStyle = '#111'; g.font = '9px Lalezar'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.direction = 'rtl'; g.fillText('ح و د | ٣٠٠٠', 24, 11); });
const billTex = txt(24, 12, '#5fae6a', (g) => { g.fillStyle = '#2f7a3a'; g.fillRect(2, 2, 20, 8); g.fillStyle = '#d8f0c0'; g.fillRect(9, 3, 6, 6); });

// ---------- street set ----------
const sky = mesh(new THREE.PlaneGeometry(140, 50), new THREE.MeshBasicMaterial({ map: daySkyTex, fog: false }), 0, 18, -30, street);
const road = mesh(new THREE.PlaneGeometry(80, 8), M(0xffffff, { map: asphaltTex }), 0, 0, 2.5, street); road.rotation.x = -Math.PI / 2;
const pave = mesh(box(80, 0.15, 3.0), M(0xffffff, { map: pavTex }), 0, 0.075, -3.0, street);
const curb = mesh(new THREE.PlaneGeometry(80, 0.15), M(0xffffff, { map: curbTex }), 0, 0.075, -1.49, street);
const farRow = mesh(new THREE.PlaneGeometry(80, 6), M(0xb48a6a), 0, 3, 6.6, street); farRow.rotation.y = Math.PI;
// the building
const bld = new THREE.Group(); street.add(bld);
mesh(box(16, 14, 1), M(0xffffff, { map: facadeTex }), 0, 7, -5.0, bld);
const winMat = M(0x2a2018), shutMat = M(0x5f8f3a);
for (let fl = 1; fl < 5; fl++) for (let wx = -6; wx <= 6; wx += 3) {
  if (fl === 2 && wx === 2) continue; // our balcony door instead
  const y = 1.6 + fl * 2.6 + 0.8; mesh(new THREE.PlaneGeometry(1.0, 1.3), winMat, wx - 0.3, y, -4.49, bld);
  mesh(box(0.35, 1.3, 0.05), shutMat, wx - 1.0, y, -4.45, bld); mesh(box(0.35, 1.3, 0.05), shutMat, wx + 0.4, y, -4.45, bld);
  if ((fl + wx) % 2 === 0) mesh(box(0.6, 0.4, 0.4), M(0xe8e8e8), wx + 0.9, y - 0.6, -4.3, bld); // AC units
}
// ground floor: entrance + shop
mesh(new THREE.PlaneGeometry(1.4, 2.4), M(0x1a1410), -2.2, 1.35, -4.49, bld);
mesh(box(1.7, 0.15, 0.3), M(0x8a7a60), -2.2, 2.6, -4.4, bld);
mesh(new THREE.PlaneGeometry(3.0, 2.2), M(0x3a3028), 4.5, 1.25, -4.49, bld);
const shopSign = mesh(new THREE.PlaneGeometry(3.2, 0.8), new THREE.MeshBasicMaterial({ map: shopTex }), 4.5, 2.8, -4.45, bld);
for (let i = 0; i < 6; i++) mesh(box(0.35, 0.45, 0.3), M([0xffd400, 0xff3355, 0x33aaff, 0x44cc66][i % 4]), 3.4 + i * 0.42, 0.4, -4.2, bld);
// third-floor balcony (Ibrahim's): floor y=7.6 at x=2
const BAL_Y = 7.6;
const bal = new THREE.Group(); bal.position.set(2.0, BAL_Y, -4.5); bld.add(bal);
mesh(box(3.2, 0.2, 1.6), M(0xb08a58), 0, -0.1, 0.8, bal);
mesh(new THREE.PlaneGeometry(1.0, 2.1), new THREE.MeshBasicMaterial({ color: 0x3a2a1a }), 0.5, 1.05, 0.02, bal);
mesh(box(3.2, 0.06, 0.06), P(0x3a3a3a), 0, 1.0, 1.6, bal);
for (let i = -7; i <= 7; i++) mesh(box(0.025, 1.0, 0.025), P(0x3a3a3a), i * 0.2, 0.5, 1.6, bal);
mesh(box(3.4, 0.01, 0.01), M(0xdddddd), 0, 1.9, 1.3, bal);
const laundry6 = []; for (let i = 0; i < 4; i++) laundry6.push(mesh(new THREE.PlaneGeometry(0.4, 0.55), new THREE.MeshLambertMaterial({ color: laundryCols[i], side: THREE.DoubleSide }), -1.2 + i * 0.8, 1.6, 1.3, bal));
// neighbours' balconies for rhythm
for (const [bx, fl] of [[-4.0, 2], [-4.0, 1], [2.0, 1], [-1.0, 3], [5.0, 3]]) { const y = 1.6 + fl * 2.6 + 0.2; mesh(box(2.4, 0.15, 1.0), M(0xb08a58), bx, y, -4.0, bld); mesh(box(2.4, 0.05, 0.05), P(0x3a3a3a), bx, y + 0.9, -3.5, bld); }
// roof dishes
for (let i = 0; i < 5; i++) { const d = mesh(new THREE.ConeGeometry(0.45, 0.2, 8), M(0xeeeeee), -6 + i * 3, 14.3, -5, bld); d.rotation.x = -1.0; }
// doorman's corner: wicker chair + little table + tea tray
const chair6 = new THREE.Group(); chair6.position.set(-2.2, 0.15, -3.0); street.add(chair6);
const wicker = M(0xc8a060);
mesh(box(0.6, 0.06, 0.6), wicker, 0, 0.45, 0, chair6); mesh(box(0.6, 0.6, 0.06), wicker, 0, 0.75, -0.28, chair6);
for (const [x, z] of [[-0.26, -0.26], [0.26, -0.26], [-0.26, 0.26], [0.26, 0.26]]) mesh(box(0.05, 0.45, 0.05), wicker, x, 0.22, z, chair6);
const table6 = new THREE.Group(); table6.position.set(-1.45, 0.15, -2.9); street.add(table6);
mesh(cyl(0.25, 0.25, 0.04, 8), M(0xd0d0d0), 0, 0.55, 0, table6); mesh(cyl(0.03, 0.03, 0.55, 5), M(0x888888), 0, 0.27, 0, table6);
const teapot = mesh(new THREE.SphereGeometry(0.1, 6, 4), P(0xc8ccd2), 0.06, 0.65, 0, table6);
// parked car, lamp post, kiosk
const car = new THREE.Group(); car.position.set(-6.5, 0, 0.4); street.add(car);
mesh(box(2.4, 0.6, 1.2), M(0xf2f2f2), 0, 0.5, 0, car); mesh(box(1.3, 0.5, 1.1), M(0x223344), -0.1, 1.05, 0, car);
for (const [x, z] of [[-0.8, 0.6], [0.8, 0.6], [-0.8, -0.6], [0.8, -0.6]]) mesh(cyl(0.24, 0.24, 0.15, 8), M(0x111111), x, 0.24, z, car).rotation.x = Math.PI / 2;
mesh(cyl(0.07, 0.07, 5, 5), M(0x333333), 6.5, 2.5, -1.7, street); mesh(box(0.9, 0.08, 0.2), M(0x333333), 6.1, 4.95, -1.7, street);
const kiosk = new THREE.Group(); kiosk.position.set(-8.5, 0.15, -2.6); street.add(kiosk);
mesh(box(1.6, 2.0, 1.2), M(0xd8231b), 0, 1.0, 0, kiosk); mesh(box(1.8, 0.1, 1.5), M(0xffffff), 0, 2.05, 0.1, kiosk);

// ---------- the tuk-tuk ----------
const tuk = new THREE.Group(); street.add(tuk);
const tukBody = new THREE.Group(); tuk.add(tukBody);
const red = P(0xd8231b, { shininess: 70 }), blk = M(0x161616);
mesh(box(2.2, 0.15, 1.2), blk, 0, 0.35, 0, tukBody);
mesh(box(1.2, 0.9, 1.25), red, 0.4, 0.85, 0, tukBody);
mesh(box(0.7, 0.85, 0.95), red, -0.75, 0.8, 0, tukBody);
mesh(new THREE.PlaneGeometry(0.85, 0.55), new THREE.MeshPhongMaterial({ color: 0x9fd0ff, transparent: true, opacity: 0.55, side: THREE.DoubleSide }), -1.1, 1.5, 0, tukBody).rotation.y = Math.PI / 2;
mesh(box(2.0, 0.08, 1.35), blk, -0.05, 1.95, 0, tukBody);
for (const [x, z] of [[-1.05, 0.45], [-1.05, -0.45], [0.95, 0.6], [0.95, -0.6]]) mesh(box(0.05, 0.75, 0.05), blk, x, 1.55, z, tukBody);
mesh(box(0.06, 0.06, 0.6), P(0xcccccc), -0.85, 1.3, 0, tukBody); // handlebar
mesh(new THREE.PlaneGeometry(0.75, 0.24), M(0xffffff, { map: mashallahTex }), 1.005, 1.0, 0, tukBody).rotation.y = Math.PI / 2;
mesh(new THREE.PlaneGeometry(0.4, 0.13), M(0xffffff, { map: plateTex }), 1.005, 0.6, 0, tukBody).rotation.y = Math.PI / 2;
{ const eye = new THREE.Group(); eye.position.set(-1.11, 1.0, 0); eye.rotation.y = -Math.PI / 2; tukBody.add(eye); mesh(cyl(0.12, 0.12, 0.02, 10), M(0x1f5fd8), 0, 0, 0, eye).rotation.x = Math.PI / 2; mesh(cyl(0.06, 0.06, 0.03, 10), M(0xffffff), 0, 0, 0.005, eye).rotation.x = Math.PI / 2; mesh(cyl(0.03, 0.03, 0.04, 8), M(0x111111), 0, 0, 0.01, eye).rotation.x = Math.PI / 2; }
for (let i = 0; i < 9; i++) mesh(new THREE.ConeGeometry(0.03, 0.12, 4), M([0xffd400, 0xff3355, 0x33cc66][i % 3]), -0.9 + i * 0.22, 1.85, 0.68, tukBody).rotation.x = Math.PI;
const wheels = [];
for (const [x, z] of [[-1.05, 0], [0.75, 0.62], [0.75, -0.62]]) { const w = mesh(cyl(0.26, 0.26, 0.16, 10), M(0x111111), x, 0.26, z, tukBody); w.rotation.x = Math.PI / 2; wheels.push(w); }
const bay = mesh(box(0.5, 0.45, 0.9), M(0x222222), 0.9, 0.55, 0, tukBody); // empty engine bay
// the returned engine, "upgraded"
const engine6 = new THREE.Group(); street.add(engine6);
mesh(box(0.5, 0.4, 0.45), red, 0, 0.2, 0, engine6);
for (let i = 0; i < 5; i++) mesh(box(0.4, 0.025, 0.38), M(0x3a3a3a), 0, 0.43 + i * 0.045, 0, engine6);
const ex6 = mesh(cyl(0.04, 0.04, 0.5, 6), M(0x8a4a22), 0.25, 0.2, 0.15, engine6); ex6.rotation.z = Math.PI / 2;
const eng6pan = new THREE.Group(); eng6pan.position.set(0, 0.72, 0); engine6.add(eng6pan);
const pan6mat = P(0x1d1d1f, { shininess: 80, emissive: 0x000000 });
mesh(cyl(0.2, 0.16, 0.06, 10), pan6mat, 0, 0, 0, eng6pan); mesh(box(0.05, 0.03, 0.32), P(0x111111), 0, 0.02, 0.32, eng6pan);
for (let i = 0; i < 3; i++) mesh(box(0.55, 0.05, 0.03), P(0xc9ccd1), 0, 0.2 + i * 0.12, 0.235, engine6); // duct tape
{ const e = new THREE.Group(); e.position.set(0, 0.25, 0.235); engine6.add(e); mesh(cyl(0.05, 0.05, 0.01, 8), M(0x1f5fd8), 0, 0, 0, e).rotation.x = Math.PI / 2; mesh(cyl(0.025, 0.025, 0.012, 8), M(0xffffff), 0, 0, 0.004, e).rotation.x = Math.PI / 2; }
let rope6 = null; const ropeMat = M(0xe8dcc0);
const bill = mesh(new THREE.PlaneGeometry(0.22, 0.11), new THREE.MeshBasicMaterial({ map: billTex, side: THREE.DoubleSide }), 0, 0, 0, street);
const teaGlass6 = mesh(cyl(0.04, 0.035, 0.1, 6), P(0xbf5a1a, { transparent: true, opacity: 0.85 }), 0, 0, 0, street);

// showroom (vehicle unlocked)
const turn = mesh(cyl(2.2, 2.2, 0.2, 24), P(0x2a2a40, { shininess: 90 }), 0, 0.1, 0, showroom);
const ring = mesh(new THREE.TorusGeometry(2.25, 0.04, 4, 32), new THREE.MeshBasicMaterial({ color: 0x3df05a }), 0, 0.21, 0, showroom); ring.rotation.x = Math.PI / 2;
const spot = new THREE.PointLight(0xffffff, 0, 12, 1.2); spot.position.set(100, 5, 3); scene.add(spot);
const sun6 = new THREE.DirectionalLight(0xfff0d0, 1.6); sun6.position.set(-6, 12, 8); scene.add(sun6);

// ---------- characters ----------
const hoda = makeChar({
  seed: 31, skin: 0xa87048, hipY: 0.84, legX: 0.11, legColor: 0x2f4f8f, shoe: 0xf2f2f2, hand: 0xa87048,
  torsoGeo: cyl(0.24, 0.25, 0.64, 6), torsoTex: canvasTex(32, 32, (g) => { g.fillStyle = '#ffd400'; g.fillRect(0, 0, 32, 32); g.fillStyle = '#111'; g.fillRect(0, 12, 32, 3); g.fillRect(0, 20, 32, 2); }), torsoColor: 0xffffff, torsoY: 0.32,
  sleeve: true, sleeveColor: 0xffd400, shoulderX: 0.3, shoulderY: 0.57, neckY: 0.64, headR: 0.27,
  build(head, torso, reg) {
    const hair = reg(M(0x120c08));
    for (let i = 0; i < 7; i++) { const s = mesh(new THREE.ConeGeometry(0.07, 0.22, 4), hair, -0.15 + i * 0.05, 0.27, -0.02 + (i % 2) * 0.05, head); s.rotation.z = (i - 3) * 0.18; s.rotation.x = -0.4; }
    mesh(box(0.5, 0.1, 0.45), hair, 0, 0.17, -0.05, head);
    const chain = mesh(new THREE.TorusGeometry(0.12, 0.012, 4, 10), reg(P(0xffd700, { shininess: 100 })), 0, 0.58, 0.18, torso); chain.rotation.x = 1.2;
    return {};
  }
}, scene);
const sayed = makeChar({
  seed: 41, skin: 0x8a5a3a, hipY: 0.84, legX: 0.12, legColor: 0x6b5a48, shoe: 0x3a2a1a, hand: 0x8a5a3a,
  torsoGeo: cyl(0.28, 0.34, 0.66, 7), torsoTex: null, torsoColor: 0x6b5a48, torsoY: 0.33,
  skirt: cyl(0.34, 0.44, 0.75, 7), sleeve: true, sleeveColor: 0x6b5a48, shoulderX: 0.34, shoulderY: 0.6, neckY: 0.66, headR: 0.28,
  build(head, torso, reg) {
    const tw = reg(M(0xf4f2ea));
    const turban = mesh(new THREE.TorusGeometry(0.24, 0.09, 5, 10), tw, 0, 0.2, -0.02, head); turban.rotation.x = Math.PI / 2;
    mesh(new THREE.SphereGeometry(0.2, 7, 4, 0, Math.PI * 2, 0, Math.PI / 2), tw, 0, 0.22, -0.02, head);
    mesh(box(0.62, 0.1, 0.05), reg(M(0xd8d0b8)), 0, 0.45, 0.24, torso); // scarf
    return {};
  }
}, scene);

// =====================================================================
// مشوار السوق — street -> sky over Cairo -> the market
// =====================================================================
room.visible = false; hallway.visible = false; balcony.visible = false; showroom.visible = false;
const T_ARRIVE = 4.2, T_LAUNCH = 11.6, T_DIVE = 19.4, T_CRASH = 21.2, T_RESULT = 30.4, T_END = 36.41;

// the tuk-tuk is already upgraded: engine installed
tuk.add(engine6); engine6.position.set(0.9, 0.35, 0); bay.visible = false;
// sunglasses for Hoda
const shades = new THREE.Group(); scene.add(shades);
for (const s of [-1, 1]) mesh(box(0.13, 0.08, 0.02), M(0x0a0a0a), s * 0.1, 0, 0, shades);
mesh(box(0.08, 0.02, 0.02), M(0x0a0a0a), 0, 0.02, 0, shades);

// ---------- Om Hamada's basket (قفة) ----------
const basket = new THREE.Group(); scene.add(basket);
mesh(cyl(0.2, 0.16, 0.24, 8, true), new THREE.MeshLambertMaterial({ color: 0xc8a060, side: THREE.DoubleSide, flatShading: true }), 0, 0, 0, basket);
const handle = mesh(new THREE.TorusGeometry(0.15, 0.015, 4, 10, Math.PI), M(0xa07840), 0, 0.12, 0, basket);
mesh(new THREE.IcosahedronGeometry(0.08, 0), M(0x3a9a3a), 0.05, 0.1, 0.02, basket); // parsley
const melonHalf = new THREE.Group(); scene.add(melonHalf);
mesh(new THREE.SphereGeometry(0.22, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), M(0x2f7a2f, { side: THREE.DoubleSide }), 0, 0, 0, melonHalf).rotation.x = Math.PI;
const flesh = mesh(new THREE.CircleGeometry(0.2, 8), M(0xe8303a), 0, 0.001, 0, melonHalf); flesh.rotation.x = -Math.PI / 2;

// ---------- the sky over Cairo ----------
const city = new THREE.Group(); city.position.set(300, 0, 0); scene.add(city);
{
  mesh(new THREE.PlaneGeometry(400, 400), M(0xc8b48a), 0, 0, 0, city).rotation.x = -Math.PI / 2;
  const nile = mesh(new THREE.PlaneGeometry(26, 400), M(0x3a7fc8), 30, 0.05, 0, city); nile.rotation.x = -Math.PI / 2; nile.rotation.z = 0.25;
  const r = rng(77);
  for (let i = 0; i < 260; i++) { const x = (r() - .5) * 220, z = (r() - .5) * 220; if (Math.abs(x - 30 - z * 0.25) < 16) continue; const hgt = 3 + r() * 9; mesh(box(4 + r() * 3, hgt, 4 + r() * 3), M([0xc99a5a, 0xb48a6a, 0xd8b080, 0xa87a50][i % 4]), x, hgt / 2, z, city); if (r() > 0.6) mesh(new THREE.ConeGeometry(0.6, 0.3, 6), M(0xeeeeee), x, hgt + 0.3, z, city); }
  for (let i = 0; i < 3; i++) { const p = mesh(new THREE.ConeGeometry(14 - i * 3, 12 - i * 2, 4), M(0xe0c070), -90 + i * 22, (12 - i * 2) / 2, -150 + i * 10, city); p.rotation.y = Math.PI / 4; } // pyramids on the horizon
  mesh(cyl(0.8, 1.0, 22, 6), M(0xe0d0b0), -20, 11, -40, city); mesh(new THREE.ConeGeometry(1.2, 3, 6), M(0x5fae6a), -20, 23.5, -40, city); // minaret
  mesh(new THREE.SphereGeometry(6, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), M(0xd8c8a0), -12, 4, -42, city);
  mesh(new THREE.PlaneGeometry(600, 160), new THREE.MeshBasicMaterial({ map: daySkyTex, fog: false }), 0, 40, -220, city);
}
const clouds = []; for (let i = 0; i < 14; i++) { const c = mesh(new THREE.IcosahedronGeometry(2 + hash(i) * 2, 0), new THREE.MeshLambertMaterial({ color: 0xffffff, transparent: true, opacity: 0.85, flatShading: true }), 0, 0, 0, city); c.scale.y = 0.5; clouds.push(c); }

// ---------- the market ----------
const market = new THREE.Group(); market.position.set(-300, 0, 0); scene.add(market);
const melons = [];
{
  mesh(new THREE.PlaneGeometry(60, 30), M(0xb8ab8e, { map: pavTex }), 0, 0, 0, market).rotation.x = -Math.PI / 2;
  const awnTex = canvasTex(16, 16, (g) => { for (let i = 0; i < 4; i++) { g.fillStyle = i % 2 ? '#fff' : '#d8231b'; g.fillRect(i * 4, 0, 4, 16); } }, [3, 1]);
  const awnTex2 = canvasTex(16, 16, (g) => { for (let i = 0; i < 4; i++) { g.fillStyle = i % 2 ? '#ffe14a' : '#1f6fd8'; g.fillRect(i * 4, 0, 4, 16); } }, [3, 1]);
  const stall = (x, z, tex, fruit, n, col) => {
    const st = new THREE.Group(); st.position.set(x, 0, z); market.add(st);
    mesh(box(2.6, 0.8, 1.2), M(0x8a5a2b, { map: woodTex }), 0, 0.4, 0, st);
    for (const sx of [-1.25, 1.25]) for (const sz of [-0.55, 0.55]) mesh(box(0.06, 2.4, 0.06), M(0x6a4220), sx, 1.2, sz, st);
    const aw = mesh(box(2.9, 0.06, 1.6), M(0xffffff, { map: tex }), 0, 2.45, 0.1, st); aw.rotation.x = -0.15;
    const rr = rng(x * 7 + z);
    for (let i = 0; i < n; i++) { const m = mesh(new THREE.SphereGeometry(fruit, 6, 4), M(col), -1.0 + rr() * 2.0, 0.85 + fruit + Math.floor(i / 8) * fruit * 1.4, -0.4 + rr() * 0.8, st); if (fruit > 0.15) m.scale.set(1.25, 1, 1); }
    return st;
  };
  stall(-4.5, -3, awnTex2, 0.09, 40, 0xff8a1a); stall(4.5, -3, awnTex2, 0.08, 40, 0xd8231b); stall(-8.5, -2.5, awnTex, 0.07, 36, 0xffd400);
  // Shehata's watermelon stall (crash target) at the centre
  const ws = new THREE.Group(); ws.position.set(0, 0, -2.6); market.add(ws);
  mesh(box(3.0, 0.7, 1.4), M(0x8a5a2b, { map: woodTex }), 0, 0.35, 0, ws);
  for (const sx of [-1.45, 1.45]) for (const sz of [-0.65, 0.65]) mesh(box(0.06, 2.4, 0.06), M(0x6a4220), sx, 1.2, sz, ws);
  const aw = mesh(box(3.3, 0.06, 1.8), M(0xffffff, { map: awnTex }), 0, 2.45, 0.1, ws); aw.rotation.x = -0.15;
  const stripeMelon = canvasTex(16, 16, (g) => { g.fillStyle = '#3f8a2f'; g.fillRect(0, 0, 16, 16); g.fillStyle = '#1f5a1f'; for (let i = 0; i < 16; i += 4) g.fillRect(i, 0, 2, 16); });
  const r2 = rng(5);
  for (let i = 0; i < 18; i++) { const m = mesh(new THREE.SphereGeometry(0.24, 7, 5), M(0xffffff, { map: stripeMelon }), -1.1 + (i % 6) * 0.44 + (r2() - .5) * 0.05, 0.92 + Math.floor(i / 6) * 0.36, -0.35 + (Math.floor(i / 6) % 2) * 0.3, ws); m.scale.set(1.3, 1, 1); melons.push({ m, base: m.position.clone(), v: V((r2() - .5) * 6, 3 + r2() * 4, 2 + r2() * 3), spin: r2() * 10 }); }
  const signTex = canvasTex(64, 20, (g) => { g.fillStyle = '#ffe14a'; g.fillRect(0, 0, 64, 20); g.fillStyle = '#c11'; g.font = '13px Lalezar'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.direction = 'rtl'; g.fillText('بطيخ مستورد', 32, 11); });
  const sign = mesh(new THREE.PlaneGeometry(1.4, 0.44), new THREE.MeshBasicMaterial({ map: signTex }), 0, 2.0, 0.6, ws); sign.userData.tex = signTex;
  window.__signTex = signTex;
  // shopfronts behind
  for (let i = -3; i <= 3; i++) { mesh(box(4.6, 5 + (i % 2) * 1.5, 1), M([0xd8b080, 0xc99a5a, 0xb48a6a][(i + 3) % 3]), i * 4.8, 2.5, -7, market); mesh(new THREE.PlaneGeometry(2.4, 2.2), M(0x2a2018), i * 4.8, 1.2, -6.49, market); }
  // bunting
  for (let i = 0; i < 18; i++) { const f = mesh(new THREE.ConeGeometry(0.16, 0.3, 3), new THREE.MeshLambertMaterial({ color: laundryCols[i % 5], side: THREE.DoubleSide }), -8 + i, 3.3 - Math.abs(Math.sin(i * 0.35)) * 0.3, -1.0, market); f.rotation.x = Math.PI; }
}
const chunks = []; for (let i = 0; i < 24; i++) { const c = mesh(new THREE.TetrahedronGeometry(0.1 + hash(i) * 0.08, 0), M(i % 3 ? 0xe8303a : 0x2f7a2f), 0, 0, 0, market); c.visible = false; chunks.push({ c, v: V((hash(i + 1) - .5) * 7, 2 + hash(i + 2) * 5, (hash(i + 3) - .2) * 5) }); }
const melonHat = new THREE.Group(); scene.add(melonHat);
mesh(new THREE.SphereGeometry(0.33, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), M(0x2f7a2f, { side: THREE.DoubleSide }), 0, 0, 0, melonHat);
mesh(new THREE.CircleGeometry(0.31, 8), M(0xe8303a, { side: THREE.DoubleSide }), 0, 0.001, 0, melonHat).rotation.x = Math.PI / 2;

// ---------- Shehata (new) ----------
const shehata = makeChar({
  seed: 51, skin: 0x9a6440, hipY: 0.86, legX: 0.14, legColor: 0x4a5a7a, shoe: 0x3a2a1a, hand: 0x9a6440,
  torsoGeo: cyl(0.34, 0.46, 0.7, 7), torsoTex: canvasTex(16, 16, (g) => { g.fillStyle = '#e8eef8'; g.fillRect(0, 0, 16, 16); g.fillStyle = '#3a5aa8'; g.fillRect(0, 0, 2, 16); g.fillRect(6, 0, 2, 16); g.fillRect(12, 0, 2, 16); }, [3, 2]), torsoColor: 0xffffff, torsoY: 0.35,
  skirt: cyl(0.46, 0.5, 0.7, 7), sleeve: true, shoulderX: 0.44, shoulderY: 0.62, neckY: 0.7, headR: 0.3,
  build(head, torso, reg) {
    mesh(new THREE.SphereGeometry(0.31, 8, 4, 0, Math.PI * 2, 0, Math.PI * 0.35), reg(M(0xf2f2f2)), 0, 0.04, 0, head); // white cap
    mesh(box(0.7, 0.55, 0.05), reg(M(0xd8c8a0)), 0, 0.25, 0.42, torso); // apron
    return {};
  }
}, scene);

const firePool7 = spritePool(canvasTex(16, 16, (g) => { g.fillStyle = '#ffdd33'; g.beginPath(); g.moveTo(8, 0); g.quadraticCurveTo(15, 9, 8, 16); g.quadraticCurveTo(1, 9, 8, 0); g.fill(); g.fillStyle = '#ff7a10'; g.beginPath(); g.arc(8, 11, 4, 0, 7); g.fill(); }), 26);
const MOM_ST = V(-0.6, 0.15, -2.2), TUK_P = V(1.6, 0, 0.3), SAY_P = V(-2.2, 0.15, -3.0);
const SH_P = V(-300 + 0.4, 0, -4.0), MOM_MK = V(-300 - 1.6, 0, 0.6), TUK_MK = V(-300 + 0.3, 0, -2.0);

const KEYS = {};
KEYS.mom = [
  [0, { aLz: 0.3, aRx: 0.4, aRz: 0.3, eR: 0.6 }],
  [1.0, { aLz: 2.7, eL: 0.2, aRx: 0.4, aRz: 0.3, eR: 0.6, hx: -0.1 }, 0.12],
  [2.2, { aLz: 2.4, eL: 0.6, aRx: 0.4, aRz: 0.3, eR: 0.6, hz: 0.1 }, 0.12],
  [4.5, { aLz: 0.95, eL: 1.9, aRx: 0.4, aRz: 0.3, eR: 0.6 }],
  [7.35, { aLx: 1.2, eL: 0.5, aLz: 0.4, aRx: 0.4, aRz: 0.3, eR: 0.6, bend: 0.15, hx: 0.1 }, 0.12],
  [8.4, { aLz: 2.5, eL: 0.3, aRx: 0.4, aRz: 0.3, eR: 0.6, bend: -0.1 }, 0.12],
  [10.0, { aLz: 0.95, eL: 1.9, aRx: 0.4, aRz: 0.3, eR: 0.6, hx: 0.1 }],
];
KEYS.momFly = [
  [0, { y: -0.4, lL: 1.4, lR: 1.4, aLz: 2.6, aRz: 2.6, eL: 0.2, eR: 0.2, hx: -0.2 }],
  [13.8, { y: -0.4, lL: 1.4, lR: 1.4, aLx: 1.5, eL: 0.2, aLz: 0.2, aRz: 0.6, eR: 1.6, hx: 0.0 }, 0.15],
  [16.7, { y: -0.4, lL: 1.4, lR: 1.4, aLz: 2.2, aRz: 2.2, eL: 0.3, eR: 0.3, hx: -0.15 }, 0.15],
];
KEYS.momMk = [
  [0, { aLz: 0.3, aRz: 0.3, hx: 0.3, bend: 0.1 }],
  [25.25, { aRx: 1.2, eR: 1.2, aRz: 0.1, aLz: 0.3, hx: 0.25, bend: 0.1 }, 0.3],
  [27.95, { aRx: 1.4, eR: 0.3, aRz: 0.2, aLx: 1.0, eL: 1.2, hx: -0.05 }, 0.15],
  [29.2, { aRx: 1.4, eR: 0.3, aRz: 0.2, aLz: 0.95, eL: 1.9, hx: -0.1 }, 0.15],
  [T_RESULT, { aLz: 2.6, aRz: 2.6, eL: 0.4, eR: 0.4, hx: -0.15 }, 0.15],
];
KEYS.shehata = [
  [0, { aLz: 0.95, eL: 1.9, aRz: 0.95, eR: 1.9 }],
  [21.9, { aLz: 2.4, aRz: 2.4, eL: 0.6, eR: 0.6, bend: 0.1, hx: 0.05 }, 0.12],
  [23.3, { aRx: 1.4, aRz: 0.3, eR: 0.2, aLz: 0.95, eL: 1.9, bend: 0.15 }, 0.12],
  [25.25, { aLz: 0.95, eL: 1.9, aRz: 0.95, eR: 1.9, hx: 0.1 }],
  [27.0, { aLz: 0.6, aRz: 0.6, aRx: 0.6, eR: 1.6, hz: 0.25 }, 0.15],
  [28.5, { aLz: 0.3, aRz: 0.3, bend: -0.1, hx: -0.2 }],
];

function tukPose(t) {
  if (t < T_ARRIVE) { const k = seg(t, 2.6, T_ARRIVE); return { grp: 'street', pos: V(lerp(-6, TUK_P.x, easeOut(k)), lerp(12, 0, easeOut(k)), TUK_P.z), rz: lerp(0.6, 0, k), vis: t >= 2.6 }; }
  if (t < T_LAUNCH) return { grp: 'street', pos: TUK_P.clone(), rz: 0, vis: true };
  if (t < 12.8) { const a = t - T_LAUNCH; return { grp: 'street', pos: V(TUK_P.x - 10 * a * a, 12 * Math.max(0, a - 0.3) ** 2, TUK_P.z), rz: -Math.min(0.9, Math.max(0, a - 0.3) * 1.6), vis: true }; }
  if (t < T_DIVE) { const a = t - 12.8; return { grp: 'city', pos: V(300 + 40 - a * 9, 34 + Math.sin(a * 1.3) * 1.5, -a * 4), rz: Math.sin(a * 2) * 0.08, ry: Math.PI * 0.35, vis: true }; }
  if (t < T_CRASH) { const k = seg(t, T_DIVE, T_CRASH); return { grp: 'market', pos: VL(V(-300 + 14, 18, 6), TUK_MK.clone().add(V(0, 0.9, 0)), easeIn(k)), rz: 0.9, ry: -0.6, vis: true }; }
  return { grp: 'market', pos: TUK_MK.clone().add(V(0, 0.15, 0)), rz: 0.35, ry: -0.6, rx: 0.15, vis: true };
}

function stateAt(t) {
  const where = t < 12.8 ? 'street' : t < T_DIVE ? 'city' : 'market';
  street.visible = where === 'street'; city.visible = where === 'city'; market.visible = where === 'market';
  scene.background = new THREE.Color(0x9fd0ff);
  scene.fog = where === 'city' ? new THREE.Fog(0xcfe6ff, 60, 260) : new THREE.Fog(0xcfe6ff, 30, 90);
  ambient.color.setHex(0xfff0e0); ambient.intensity = 0.9; moon.intensity = 0; sun6.intensity = 1.6; tvLight.intensity = 0; hallLight.intensity = 0; balcLight.intensity = 0; spot.intensity = 0;
  sun6.position.set(-6 + (where === 'market' ? -300 : where === 'city' ? 300 : 0), 12, 8); sun6.target.position.set(where === 'market' ? -300 : where === 'city' ? 300 : 0, 0, 0); sun6.target.updateMatrixWorld();

  // tuk-tuk (re-parented to the scene root so it can travel between sets)
  if (tuk.parent !== scene) scene.add(tuk);
  const tp = tukPose(t); tuk.visible = tp.vis; tuk.position.copy(tp.pos); tuk.rotation.set(tp.rx || 0, tp.ry || 0, tp.rz);
  wheels.forEach(w => w.rotation.y = t > T_LAUNCH && t < T_CRASH ? t * 30 : 0);
  pan6mat.emissive.setRGB(0.6, 0.15, 0);
  if (t >= T_CRASH) { tukBody.rotation.z = Math.sin(Math.max(0, t - T_CRASH) * 30) * 0.04 * Math.exp(-(t - T_CRASH) * 2); }

  // Hoda: always in the driver's seat
  if (hoda.root.parent !== tuk) tuk.add(hoda.root);
  hoda.root.position.set(-0.55, 0.42, 0); hoda.root.rotation.set(0, -Math.PI / 2, 0); hoda.root.visible = tp.vis;
  const hz = { ...POSE0, y: -0.4, lL: 1.4, lR: 1.4, aLx: 1.4, eL: 0.6, aRx: 1.4, eR: 0.6, aLz: -0.1, aRz: -0.1 };
  if (t >= 4.5 && t < T_LAUNCH) { hz.hy = -1.2; hz.aRx = 0.6; hz.aRz = 0.5; hz.eR = 1.6; }
  if (t >= 10.3 && t < T_LAUNCH) { hz.aRx = 2.3; hz.eR = 2.2; hz.aRz = 0.2; }
  if (t >= 16.7 && t < T_DIVE) { hz.hy = 1.0; hz.aLz = 2.4; hz.aLx = 0; hz.eL = 0.3; }
  if (t >= T_CRASH) { hz.bend = 0.5; hz.hx = 0.4; hz.aLz = 1.4; hz.aRz = 1.4; hz.aLx = 0; hz.aRx = 0; }
  applyPose(hoda, hz);
  // sunglasses: on forehead until 10.4, then down over the eyes
  { const hd = hoda.head; hd.updateWorldMatrix(true, false); const down = t >= 10.45 && t < T_CRASH; const local = down ? V(0, 0.03, 0.26) : V(0, 0.2, 0.22); shades.position.copy(local.applyMatrix4(hd.matrixWorld)); shades.quaternion.copy(hd.getWorldQuaternion(new THREE.Quaternion())); shades.visible = tp.vis && hoda.root.visible; }

  // Om Hamada
  if (t < 11.0) { if (mom.root.parent !== scene) scene.add(mom.root); mom.root.position.copy(MOM_ST); mom.root.rotation.set(0, 0.55, 0); applyPose(mom, poseAt(t, KEYS.mom)); if (t >= 4.5) mom.root.rotation.y = 0.9; }
  else if (t < T_CRASH) { if (mom.root.parent !== tuk) tuk.add(mom.root); mom.root.position.set(0.35, 0.45, 0); mom.root.rotation.set(0, -Math.PI / 2, 0); applyPose(mom, poseAt(t, KEYS.momFly)); }
  else { if (mom.root.parent !== scene) scene.add(mom.root); const k = easeOut(seg(t, T_CRASH, T_CRASH + 0.5)); mom.root.position.copy(VL(TUK_MK.clone().add(V(0.4, 0.8, 0.5)), MOM_MK, k)); mom.root.rotation.set(0, lerp(0, 0.85, k), 0); applyPose(mom, poseAt(t, KEYS.momMk)); }
  mom.root.visible = !(t >= 11.0 && t < 11.6 && false);
  // basket in her right hand (street), the melon half in the market
  { const hp = mom.arms[1].hand.getWorldPosition(V(0, 0, 0)); basket.position.copy(hp).add(V(0, -0.15, 0)); basket.visible = t < T_CRASH || t >= T_RESULT; if (t >= T_RESULT) basket.position.copy(mom.arms[0].hand.getWorldPosition(V(0, 0, 0))).add(V(0, -0.15, 0)); }
  { melonHalf.visible = t >= 25.25 && t < 29.4; const hp = mom.arms[1].hand.getWorldPosition(V(0, 0, 0)); melonHalf.position.copy(hp).add(V(0, 0.12, 0)); }
  // Uncle Sayed cameo (street only, sipping tea)
  sayed.root.visible = where === 'street'; sayed.root.position.copy(SAY_P); sayed.root.rotation.set(0, 0.35, 0); chair6.position.copy(SAY_P);
  applyPose(sayed, { ...POSE0, y: -0.38, lL: 1.5, lR: 1.5, aRx: 0.9 + (Math.sin(t * 0.8) > 0.6 ? 0.4 : 0), eR: 1.6 + (Math.sin(t * 0.8) > 0.6 ? 0.6 : 0), aRz: 0.2, aLz: 0.3, aLx: 0.6, eL: 0.6, bend: -0.2, hy: t > 9 ? 0.9 : 0.4 });
  sayed.faceMat.map = faceTexture(t > 11.6 ? 'wide' : 'tired', t > 11.6 ? 'o' : 'smile', { stache: true, stacheColor: '#dddddd' }); sayed.faceMat.needsUpdate = true;
  { const hp = sayed.arms[1].hand.getWorldPosition(V(0, 0, 0)); teaGlass6.position.copy(hp).add(V(0, 0.06, 0)); teaGlass6.visible = where === 'street'; }
  bill.visible = false;
  // Shehata
  shehata.root.visible = where === 'market';
  shehata.root.position.copy(SH_P); shehata.root.rotation.set(0, -0.35, 0);
  if (t >= T_CRASH) { const k = easeOut(seg(t, T_CRASH, T_CRASH + 0.4)); shehata.root.position.copy(VL(SH_P, SH_P.clone().add(V(-0.6, 0, 2.2)), k)); shehata.root.rotation.y = lerp(-0.35, 0.9, k); }
  const shz = poseAt(t, KEYS.shehata); if (t >= 21.9 && t < 23.3) { shz.aLz += Math.sin(t * 14) * 0.2; shz.aRz += Math.sin(t * 14 + 1) * 0.2; }
  applyPose(shehata, shz);
  { melonHat.visible = t >= T_CRASH + 0.25; shehata.head.updateWorldMatrix(true, false); melonHat.position.copy(V(0, 0.18, 0).applyMatrix4(shehata.head.matrixWorld)); melonHat.quaternion.copy(shehata.head.getWorldQuaternion(new THREE.Quaternion())); }
  // melons + chunks fly at the crash
  melons.forEach((o, i) => { const a = t - T_CRASH; if (a > 0 && i % 2 === 0) { o.m.position.copy(o.base.clone().add(o.v.clone().multiplyScalar(a)).add(V(0, -4.9 * a * a, 0))); if (o.m.position.y < 0.2) o.m.position.y = 0.2; o.m.rotation.set(a * o.spin, a * 3, 0); } else { o.m.position.copy(o.base); o.m.rotation.set(0, 0, 0); } });
  chunks.forEach((o, i) => { const a = t - T_CRASH; o.c.visible = where === 'market' && a > 0 && a < 1.6; if (o.c.visible) { o.c.position.set(0.3 + o.v.x * a, 1.0 + o.v.y * a - 4.9 * a * a, -2.0 + o.v.z * a); if (o.c.position.y < 0.05) o.c.position.y = 0.05; o.c.rotation.set(a * 9, a * 7, 0); } });
  // clouds drift
  clouds.forEach((c, i) => { c.position.set(300 + 60 - ((t * 6 + i * 23) % 140), 30 + (i % 4) * 4, -30 + (i * 37 % 60) - 10); });

  // ---- particles ----
  const fire = [];
  if (tp.vis && t >= T_LAUNCH - 0.5 && t < T_CRASH) { const base = engine6.getWorldPosition(V(0, 0, 0)); const q = tuk.getWorldQuaternion(new THREE.Quaternion()); const dir = V(1, 0, 0).applyQuaternion(q); for (let i = 0; i < 26; i++) { const ph = (t * 3.5 + i / 26) % 1; fire.push({ pos: base.clone().add(dir.clone().multiplyScalar(0.4 + ph * 2.4)).add(V((hash(i) - .5) * 0.3 * ph, (hash(i + 1) - .5) * 0.3 * ph, (hash(i + 2) - .5) * 0.3 * ph)), size: (0.2 + ph * 0.5) * (1 - ph * 0.5), op: 1 - ph, rot: i }); } }
  emit(fire, firePool7);
  const puffs = [];
  if (t >= 2.6 && t < T_ARRIVE + 0.6) { const k = seg(t, T_ARRIVE - 0.1, T_ARRIVE + 0.6); if (t >= T_ARRIVE - 0.1) for (let i = 0; i < 8; i++) { const a = i / 8 * 6.28; puffs.push({ pos: TUK_P.clone().add(V(Math.cos(a) * k * 1.6, 0.15, Math.sin(a) * k * 1.2)), size: 0.3 + k * 0.6, op: (1 - k) * 0.6, color: 0xc8b898 }); } }
  if (t >= T_CRASH && t < T_CRASH + 1.0) { const k = seg(t, T_CRASH, T_CRASH + 1.0); for (let i = 0; i < 12; i++) { const a = i / 12 * 6.28; puffs.push({ pos: V(-300 + 0.3 + Math.cos(a) * k * 2.4, 0.4 + k, -2.0 + Math.sin(a) * k * 1.8), size: 0.4 + k * 0.9, op: (1 - k) * 0.7, color: 0xd8c8a8 }); } }
  emit(puffs, puffPool);
  const stars = [];
  if (t >= T_CRASH + 0.3 && t < 25.0) { const hd = hoda.head.getWorldPosition(V(0, 0, 0)); for (let i = 0; i < 5; i++) { const a = t * 4 + i * 1.26; stars.push({ pos: hd.clone().add(V(Math.cos(a) * 0.35, 0.3, Math.sin(a) * 0.35)), size: 0.12, rot: a }); } }
  if (t >= T_RESULT) { const hd = mom.head.getWorldPosition(V(0, 0, 0)); for (let i = 0; i < 6; i++) { const a = t * 2 + i * 1.05; stars.push({ pos: hd.clone().add(V(Math.cos(a) * 0.6, 0.2 + Math.sin(a * 2) * 0.2, Math.sin(a) * 0.6)), size: 0.14, rot: a }); } }
  emit(stars, starPool);
  const sw = [];
  if (t >= 12.8 && t < 14.0) { const hd = mom.head.getWorldPosition(V(0, 0, 0)); for (let i = 0; i < 4; i++) { const k = (t * 1.5 + i * 0.25) % 1; sw.push({ pos: hd.clone().add(V((i % 2 ? 1 : -1) * 0.3, 0.2 - k * 0.5, 0)), size: 0.08, op: 1 - k }); } }
  emit(sw, sweatPool); emit([], trailPool);

  // ---- faces ----
  let me = 'normal', mm = talkMouth(t, 'mom', 'scream') || 'closed';
  if (t < 4.5) { me = 'wide'; }
  else if (t < 7.35) { me = 'flat'; mm = mm === 'closed' ? 'flat' : mm; }
  else if (t < 10.0) { me = 'angry'; if (mm === 'closed') mm = 'clench'; }
  else if (t < 12.8) { me = 'pin'; mm = 'o'; }
  else if (t < 13.8) { me = 'wide'; mm = talkMouth(t, 'mom', 'scream') || 'scream'; }
  else if (t < T_DIVE) { me = 'menace'; if (mm === 'closed') mm = 'flat'; }
  else if (t < T_CRASH) { me = 'pin'; mm = 'scream'; }
  else if (t < 25.25) { me = 'flat'; mm = 'flat'; }
  else if (t < T_RESULT) { me = 'smug'; if (mm === 'closed') mm = 'smile'; }
  else { me = 'sparkle'; mm = 'grin'; }
  let he = 'smug', hm = talkMouth(t, 'hoda') || 'grin';
  if (t >= T_LAUNCH && t < T_DIVE) { he = 'wide'; if (hm === 'grin' && t < 16.7) hm = 'grin'; }
  if (t >= T_DIVE && t < T_CRASH) { he = 'pin'; hm = 'scream'; }
  if (t >= T_CRASH) { he = 'dizzy'; hm = 'tongue'; }
  let se = 'angry', sm = talkMouth(t, 'shehata', 'scream') || 'clench';
  if (t < T_CRASH) { se = 'normal'; sm = 'smile'; }
  if (t >= 25.25 && t < 27.0) { se = 'side'; sm = 'flat'; }
  if (t >= 27.0) { se = 'pin'; sm = talkMouth(t, 'shehata') || 'o'; }
  if (t >= 29.2) { se = 'flat'; sm = 'wobble'; }
  mom.faceMat.map = faceTexture(me, mm, {}); mom.faceMat.needsUpdate = true;
  hoda.faceMat.map = faceTexture(he, hm, { fuzz: true }); hoda.faceMat.needsUpdate = true;
  shehata.faceMat.map = faceTexture(se, sm, { stache: true }); shehata.faceMat.needsUpdate = true;
}

// =====================================================================
function cameraAt(t) {
  if (t < 4.5) { const k = seg(t, 0, 4.5); cam(VL(V(-2.6, 1.5, 3.4), V(-2.2, 1.45, 2.8), k), VL(V(-0.6, 1.4, -2.2), V(0.4, 1.4, -0.8), easeInOut(seg(t, 2.4, 4.2))), 52); }
  else if (t < 7.35) { faceCam(hoda, 1.3, 0.3, 0.05, 48, 0.08); }
  else if (t < 10.0) { faceCam(mom, 1.4, -0.3, 0.05, 46, 0.08); }
  else if (t < T_LAUNCH) { faceCam(hoda, 1.0, 0.2, 0.02, 44, 0.03); }
  else if (t < 12.8) { cam(V(-1.5, 1.6, 7.5).add(shake(t, 0.08, 25)), tuk.position.clone().add(V(0, 0.8, 0)), 58); }
  else if (t < 16.7) { const p = tuk.position.clone(); cam(p.clone().add(V(-3.2, 3.2, 4.4)).add(shake(t, 0.03, 15)), p.clone().add(V(0.3, -1.2, 0)), 60, Math.sin(t) * 0.05); }
  else if (t < T_DIVE) { const p = tuk.position.clone(); cam(p.clone().add(V(-4.2, 2.6, -1.6)).add(shake(t, 0.03, 15)), p.clone().add(V(0, -0.6, 0)), 58); }
  else if (t < 21.9) { const tc = Math.min(t, T_CRASH + 0.6); cam(V(-300 - 3.5, 1.2, 5.5).add(shake(t, t > T_CRASH ? 0.15 * (1 - seg(t, T_CRASH, 21.9)) : 0, 25)), VL(V(-300 + 6, 9, 2), V(-300 + 0.2, 1.0, -2.2), easeIn(seg(tc, T_DIVE, T_CRASH))), 56); }
  else if (t < 25.25) { faceCam(shehata, 1.6, 0.3, 0.05, 48, 0.12); }
  else if (t < 27.0) { faceCam(mom, 1.4, -0.3, 0.0, 46, 0.15); }
  else if (t < 27.95) { faceCam(shehata, 1.2, 0.2, 0.02, 44, 0.08); }
  else if (t < T_RESULT) { faceCam(mom, 2.8, -1.1, 0.2, 54, 0.35); }
  else { const k = easeInOut(seg(t, T_RESULT, 38.5)); faceCam(mom, lerp(3.0, 4.6, k), -0.8, lerp(0.3, 1.0, k), 54, 0.4); }
}

// =====================================================================
// HUD
// =====================================================================
const NAMES = { mom: ['أم حمادة', 'OM HAMADA', '#1f9e5a'], hoda: ['حودة', 'HODA', '#e0a000'], shehata: ['المعلم شحتة', 'SHEHATA', '#3a5aa8'] };
function portrait(g, x, y, who, t) {
  g.fillStyle = '#123'; g.fillRect(x, y, 64, 64); g.strokeStyle = '#fff'; g.lineWidth = 2; g.strokeRect(x, y, 64, 64);
  g.save(); g.beginPath(); g.rect(x + 2, y + 2, 60, 60); g.clip();
  if (who === 'mom') { g.fillStyle = '#1f9e5a'; g.beginPath(); g.arc(x + 32, y + 34, 27, 0, 7); g.fill(); g.fillStyle = '#c98d5f'; g.beginPath(); g.arc(x + 32, y + 38, 19, 0, 7); g.fill(); g.fillStyle = '#ec86ad'; g.fillRect(x + 6, y + 58, 52, 6); }
  else if (who === 'hoda') { g.fillStyle = '#ffd400'; g.fillRect(x + 8, y + 54, 48, 10); g.fillStyle = '#a87048'; g.beginPath(); g.arc(x + 32, y + 36, 19, 0, 7); g.fill(); g.fillStyle = '#120c08'; for (let i = 0; i < 6; i++) { g.beginPath(); g.moveTo(x + 14 + i * 7, y + 22); g.lineTo(x + 17 + i * 7, y + 6); g.lineTo(x + 21 + i * 7, y + 22); g.fill(); } }
  else { g.fillStyle = '#e8eef8'; g.fillRect(x + 6, y + 54, 52, 10); g.fillStyle = '#9a6440'; g.beginPath(); g.arc(x + 32, y + 37, 21, 0, 7); g.fill(); g.fillStyle = '#f2f2f2'; g.beginPath(); g.arc(x + 32, y + 22, 20, Math.PI, 0); g.fill(); }
  const fc = document.createElement('canvas'); fc.width = 32; fc.height = 32; const fg = fc.getContext('2d');
  const e = envAt(t); const mouth = speakerAt(t) === who ? (e < 0.1 ? 'closed' : e < 0.4 ? 'talk1' : 'talk2') : 'closed';
  const eyes = who === 'mom' ? (t > 12.8 && t < 19.4 ? 'menace' : t > 25 ? 'smug' : 'angry') : who === 'hoda' ? 'smug' : (t > 27 ? 'pin' : 'angry');
  drawFace(fg, 32, eyes, mouth, { stache: who === 'shehata', fuzz: who === 'hoda' });
  g.imageSmoothingEnabled = false; g.drawImage(fc, x + 14, y + 20, 36, 36); g.restore();
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
function drawTitle(g, t) {
  if (t >= 1.3) return; const op = t < 0.9 ? 1 : 1 - seg(t, 0.9, 1.3);
  g.globalAlpha = op; g.fillStyle = 'rgba(0,0,0,0.6)'; g.fillRect(0, 196, W, 76);
  arText(g, 'مشوار السوق', W / 2, 198, 40, '#ffe14a', 'center', 'ReemKufi'); pxText(g, 'THE MARKET RUN', W / 2, 250, 10, '#fff', 'center'); g.globalAlpha = 1;
}
function fare(t) { if (t < 4.6) return null; if (t < 14.6) return 50; if (t < 16.0) return Math.round(lerp(50, 30, seg(t, 14.6, 16.0))); return 30; }
function drawFare(g, t) {
  const f = fare(t); if (f === null || t >= T_CRASH) return;
  const x = W - 190, y = 12; g.fillStyle = 'rgba(0,0,30,0.8)'; g.fillRect(x, y, 176, 56); g.strokeStyle = '#fff'; g.lineWidth = 2; g.strokeRect(x, y, 176, 56);
  pxText(g, 'FARE', x + 10, y + 8, 8, '#ffe14a'); arText(g, 'الأجرة', x + 168, y + 2, 16, '#fff');
  pxText(g, f + ' EGP', x + 10, y + 28, 16, f < 50 ? '#3df05a' : '#fff');
  if (t >= 14.6 && t < 16.4 && Math.floor(t * 8) % 2) pxText(g, 'HAGGLE!', x + 100, y + 30, 8, '#ff4040');
}
function drawAlt(g, t) {
  if (t < 12.8 || t >= T_CRASH) return;
  const alt = t < T_DIVE ? 340 + Math.round(Math.sin(t) * 10) : Math.max(0, Math.round(lerp(340, 0, seg(t, T_DIVE, T_CRASH))));
  const x = 14, y = 12; g.fillStyle = 'rgba(0,0,30,0.8)'; g.fillRect(x, y, 200, 56); g.strokeStyle = '#fff'; g.lineWidth = 2; g.strokeRect(x, y, 200, 56);
  pxText(g, 'ALTITUDE', x + 10, y + 8, 8, '#9fd0ff'); pxText(g, alt + ' M', x + 10, y + 28, 16, alt < 100 ? '#ff4040' : '#fff');
  pxText(g, 'BRAKES:', x + 120, y + 10, 7, '#fff'); pxText(g, 'NONE', x + 120, y + 26, 10, '#ff4040');
  if (t >= T_DIVE && Math.floor(t * 6) % 2) { pxText(g, 'WARNING!', W / 2, 120, 22, '#ff3030', 'center'); arText(g, 'خطر! فرشة بطيخ!', W / 2, 150, 24, '#ffe14a', 'center'); }
}
function drawSplat(g, t) {
  const a = t - T_CRASH; if (a < 0 || a > 0.7) return;
  const k = easeBack(clamp(a / 0.15)); g.save(); g.translate(W / 2, 200); g.scale(k, k); g.rotate(-0.1);
  pxText(g, 'SPLAT!', 0, -20, 40, '#e8303a', 'center'); g.restore();
}
function drawResult(g, t) {
  if (t < T_RESULT || t >= T_END + 0.3) return; const a = t - T_RESULT;
  g.fillStyle = `rgba(0,0,20,${0.55 * clamp(a / 0.3)})`; g.fillRect(0, 0, W, H);
  const k = easeBack(clamp(a / 0.3)); g.save(); g.translate(W / 2, 70); g.scale(k, k);
  pxText(g, 'SHOPPING COMPLETE', 0, -14, 18, '#3df05a', 'center'); arText(g, 'تم التسوق بنجاح', 0, 10, 26, '#fff', 'center'); g.restore();
  const rows = [[2.2, 'المشوار: ٣٠ بدل ٥٠', 'TRIP: 30 / 50 EGP'], [2.9, 'البطيخ: اتنين بخمسة', 'MELONS: 2 FOR 5'], [3.6, 'التوصيل: بالطيارة', 'DELIVERY: BY AIR'], [4.3, 'المعلم شحتة: في صدمة', 'SELLER: IN SHOCK']];
  rows.forEach(([t0, ar, en], i) => { if (a < t0 - 1.2) return; const yy = 140 + i * 46; g.fillStyle = 'rgba(10,10,40,0.85)'; g.fillRect(90, yy, W - 180, 40); arText(g, ar, W - 100, yy + 2, 20, '#fff'); pxText(g, en, 100, yy + 14, 8, '#9fd0ff'); });
  if (a > 4.4) { const k2 = easeBack(seg(t, T_RESULT + 4.4, T_RESULT + 4.7)); g.save(); g.translate(W / 2, 360); g.scale(k2, k2); g.rotate(-0.08); g.strokeStyle = '#ffd400'; g.lineWidth = 4; g.strokeRect(-200, -34, 400, 70); pxText(g, 'HAGGLING: LEGENDARY', 0, -18, 14, '#ffd400', 'center'); arText(g, 'مستوى الفصال: أسطوري', 0, 0, 24, '#ffe14a', 'center', 'ReemKufi'); g.restore(); }
}
function drawEnd(g, t) {
  const a = t - T_END - 0.3; if (a < 0) return; const k = easeOut(clamp(a / 0.4));
  g.fillStyle = `rgba(0,0,0,${0.55 * k})`; g.fillRect(0, 0, W, H);
  g.save(); g.translate(W / 2, 190); g.scale(k, k); arText(g, 'يُتبع...', 0, -40, 54, '#ffe14a', 'center', 'ReemKufi'); pxText(g, 'TO BE CONTINUED', 0, 30, 16, '#fff', 'center'); g.restore();
}

window.renderFrame = function (t) {
  stateAt(t); cameraAt(t);
  renderer.render(scene, camera);
  ctx.clearRect(0, 0, W, H); ctx.drawImage(glCanvas, 0, 0);
  h.clearRect(0, 0, W, H);
  drawFare(h, t); drawAlt(h, t); drawSplat(h, t); drawResult(h, t); drawDialogue(h, t); drawEnd(h, t); drawTitle(h, t);
  ctx.drawImage(hud, 0, 0);
  vignette(ctx, 0.3);
  if (t >= T_LAUNCH && t < T_LAUNCH + 0.07) { ctx.fillStyle = 'rgba(255,240,200,0.8)'; ctx.fillRect(0, 0, W, H); }
  if (t >= T_CRASH && t < T_CRASH + 0.06) { ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, W, H); }
  if (t >= 12.65 && t < 12.95) { ctx.fillStyle = '#fff'; ctx.globalAlpha = 1 - Math.abs(t - 12.8) / 0.15; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; }
  if (t >= T_DIVE - 0.1 && t < T_DIVE + 0.1) { ctx.fillStyle = '#fff'; ctx.globalAlpha = 1 - Math.abs(t - T_DIVE) / 0.1; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; }
  return true;
};
window.frameData = () => out.toDataURL('image/png');
window.DUR = DUR;
document.fonts.load('10px PS2P').then(() => document.fonts.load('20px Lalezar', 'ع')).then(() => document.fonts.load('700 20px ReemKufi', 'ع')).then(() => {
  const re = (tex, bg, fn) => { const g = tex.userData.g, c = tex.userData.canvas; g.fillStyle = bg; g.fillRect(0, 0, c.width, c.height); fn(g, c.width, c.height); tex.needsUpdate = true; };
  re(shopTex, '#1f6fd8', (g) => { g.fillStyle = '#fff'; g.font = '16px Lalezar'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.direction = 'rtl'; g.fillText('بقالة الأمل', 48, 13); });
  re(mashallahTex, '#d8231b', (g) => { g.fillStyle = '#ffe14a'; g.font = '13px Lalezar'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.direction = 'rtl'; g.fillText('ما شاء الله', 32, 11); });
  re(window.__signTex, '#ffe14a', (g) => { g.fillStyle = '#c11'; g.font = '13px Lalezar'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.direction = 'rtl'; g.fillText('بطيخ مستورد', 32, 11); });
  window.READY = true;
});
