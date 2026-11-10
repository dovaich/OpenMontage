// الشبشب — FINAL BOSS. Deterministic low-poly Y2K console cutscene.
// Same engine family as "Jet Dishwasher 3000": window.renderFrame(t) draws frame t into #out.
import * as THREE from 'three';

const W = 640, H = 480;
const DUR = 54.5;
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
function drawDialogue(g, t) {
  const L = LINES.find(l => l.s !== 'anno' && t >= l.t0 && t < l.t1 + Math.min(0.5, l.gap_after * 0.9));
  if (!L) return;
  let sx = 0, sy = 0;
  if ((L.id === 'L01' || L.id === 'L09' || L.id === 'L08') && t < L.t0 + 0.6) { sx = (hash(Math.floor(t * 30)) - .5) * 8; sy = (hash(Math.floor(t * 30) + 3) - .5) * 5; }
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

function headOf(c) { return c.head.getWorldPosition(V(0, 0, 0)); }
function faceCam(c, dist, side = 0, up = 0, fov = 48, lookDown = 0.1) {
  const h = headOf(c); const f = c.head.getWorldDirection(V(0, 0, 0)); f.y = 0; f.normalize();
  const r = V(f.z, 0, -f.x);
  cam(h.clone().add(f.multiplyScalar(dist)).add(r.multiplyScalar(side)).add(V(0, up, 0)), h.clone().add(V(0, -lookDown, 0)), fov);
}

// =====================================================================
// موتور حودة — the street in front of the building (afternoon)
// =====================================================================
room.visible = false; hallway.visible = false; balcony.visible = false;
const T_LAUNCH = 44.4, T_SHOW = 47.1, T_END = 52.26;
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
// Hamada's dad from the engine (classic look)
dad.afro.visible = false;
dad.extras.setGoggles = (down) => { const g = dad.extras.gog; if (down) { g.position.set(0, 0.05, 0.27); g.rotation.x = 0; } else { g.position.set(0, 0.2, 0.2); g.rotation.x = -0.6; } };

const SIT = { y: -0.38, lL: 1.5, lR: 1.5 };
const KEYS = {};
KEYS.hoda = [
  [0, { aLx: 1.5, eL: 0.4, aRx: 1.5, eR: 0.4, bend: 0.6, hx: -0.3 }],
  [0.9, { aLx: 1.5, eL: 0.4, aRx: 1.5, eR: 0.4, bend: 0.6, hx: -0.4 }],
  [3.6, { aLz: 2.5, aRz: 2.5, eL: 0.3, eR: 0.3, hx: -0.2 }, 0.15],
  [5.25, { aLz: 0.95, eL: 1.9, aRz: 0.95, eR: 1.9 }],
  [10.6, { aLx: 1.3, eL: 1.2, aRx: 1.3, eR: 1.2, aLz: -0.3, aRz: -0.3, bend: 0.15, hx: 0.1 }, 0.12],
  [13.4, { aLz: 0.95, eL: 1.9, aRz: 0.95, eR: 1.9, hz: 0.1 }],
  [16.55, { aRx: 1.2, aRz: 0.3, eR: 0.6, aLz: 0.9, eL: 1.9, bend: 0.1 }],
  [19.3, { aRx: 1.5, aRz: 0.1, eR: 0.1, aLz: 0.9, eL: 1.9, bend: 0.2 }, 0.1],
  [20.4, { aLz: 0.95, eL: 1.9, aRz: 0.95, eR: 1.9, hx: 0.05 }],
  [22.6, { aLz: 0.95, eL: 1.9, aRz: 0.95, eR: 1.9, hx: -0.6, bend: -0.1 }, 0.3],
  [25.1, { aLx: 0.6, aLz: 2.6, eL: 0.2, aRx: 0.2, aRz: 1.6, eR: 1.6, hx: -0.8, bend: -0.25 }, 0.12],
  [28.1, { aLz: 0.95, eL: 1.9, aRz: 0.95, eR: 1.9, hx: -0.7, bend: -0.1 }],
  [32.05, { aLx: 1.6, eL: 2.2, aRx: 1.6, eR: 2.2, aLz: 0.3, aRz: 0.3, hx: -0.5, bend: 0.1 }, 0.12],
  [35.0, { aLz: 0.4, aRz: 0.4, hx: -0.75 }],
];
KEYS.sayed = [
  [0, { ...SIT, aRx: 0.9, eR: 1.6, aRz: 0.2, aLz: 0.3, aLx: 0.6, eL: 0.6, bend: -0.2, hx: 0.05 }],
  [5.25, { ...SIT, aRx: 1.2, eR: 2.2, aRz: 0.3, aLz: 0.3, aLx: 0.6, eL: 0.6, bend: -0.2, hy: 0.4 }, 0.6],
  [8.2, { ...SIT, aRx: 0.9, eR: 1.6, aRz: 0.2, aLz: 0.3, aLx: 0.6, eL: 0.6, bend: -0.2, hy: 0.45, hx: -0.1 }, 0.6],
  [13.4, { ...SIT, aRx: 1.5, eR: 1.4, aRz: 0.4, aLz: 0.3, aLx: 0.6, eL: 0.6, bend: -0.15, hy: 0.45, hz: 0.15 }, 0.6],
  [16.55, { ...SIT, aRx: 0.9, eR: 1.6, aRz: 0.2, aLz: 0.3, aLx: 0.6, eL: 0.6, bend: -0.2, hy: 0.45 }, 0.5],
  [19.5, { ...SIT, aRx: 1.0, eR: 1.6, aRz: 0.2, aLx: 1.4, eL: 0.4, aLz: -0.2, bend: 0.0, hy: 0.45 }, 0.25],
  [21.0, { ...SIT, aRx: 0.9, eR: 1.6, aRz: 0.2, aLz: 0.3, aLx: 0.6, eL: 0.6, bend: -0.2, hy: 0.45 }, 0.4],
  [22.6, { ...SIT, aRx: 0.9, eR: 1.6, aRz: 0.2, aLx: 2.6, aLz: 0.4, eL: 0.2, bend: 0.1, hy: 0.6, hx: 0.1 }, 0.4],
  [25.0, { ...SIT, aRx: 0.9, eR: 1.6, aRz: 0.2, aLz: 0.3, aLx: 0.6, eL: 0.6, bend: -0.2, hy: 0.2, hx: -0.4 }, 0.5],
  [41.2, { ...SIT, aRx: 1.2, eR: 2.2, aRz: 0.3, aLx: 0.6, eL: 0.6, aLz: 0.3, bend: -0.25, hy: 0.6 }, 0.5],
  [52.3, { ...SIT, aRx: 1.2, eR: 2.2, aRz: 0.3, aLx: 0.6, eL: 0.6, aLz: 0.3, bend: -0.25, hy: 0.0, hx: -0.5 }, 0.6],
];
KEYS.dad = [
  [0, { aLz: 0.95, eL: 1.9, aRz: 0.95, eR: 1.9, bend: 0.3, hx: 0.5 }],
  [28.1, { aLz: 0.95, eL: 1.9, aRx: 1.2, aRz: 0.4, eR: 1.4, tr: 1, bend: 0.25, hx: 0.45 }, 0.15],
  [30.2, { aLz: 2.2, aRz: 2.2, eL: 0.3, eR: 0.3, bend: 0.2, hx: 0.4 }, 0.15],
  [32.05, { aLz: 0.95, eL: 1.9, aRz: 0.95, eR: 1.9, bend: 0.3, hx: 0.5, hz: 0.1 }],
  [35.0, { aLz: 2.4, aRz: 2.4, eL: 0.2, eR: 0.2, bend: 0.15, hx: 0.4 }, 0.12],
  [37.4, { aRx: 1.6, eR: 0.3, aRz: 0.2, aLz: 1.0, eL: 1.2, bend: 0.4, hx: 0.6 }, 0.2],
  [41.2, { aLz: 0.95, eL: 1.9, aRz: 0.95, eR: 1.9, bend: 0.35, hx: 0.6 }],
  [52.3, { aRx: 1.3, eR: 1.4, aRz: 0.4, tr: 1, aLz: 0.95, eL: 1.9, bend: 0.3, hx: 0.5 }, 0.2],
];
const SAY_P = V(-2.2, 0.15, -3.0), HODA_P = V(0.2, 0, -0.9), TUK_P = V(1.6, 0, 0.3);
const DAD_P = V(2.4, BAL_Y, -3.05);

function tukAt(t) {
  // returns {pos, rz, ry}
  if (t < 3.4) { const k = easeOut(seg(t, 0, 3.4)); return { pos: V(lerp(8.0, TUK_P.x, k), 0, TUK_P.z), rz: 0, roll: 0 }; }
  if (t < T_LAUNCH) { const sh = t > 42.0 ? 0.02 + 0.03 * seg(t, 42.0, T_LAUNCH) : 0; return { pos: TUK_P.clone().add(V(noise1(t * 40) * sh, Math.abs(noise1(t * 37)) * sh, 0)), rz: noise1(t * 33) * sh, roll: 0 }; }
  const a = t - T_LAUNCH; const x = TUK_P.x - 14 * a * a; const lift = Math.max(0, a - 0.7); const y = 9 * lift * lift; const rz = -Math.min(1.0, lift * 1.4);
  return { pos: V(x, y, TUK_P.z), rz, roll: Math.sin(a * 8) * 0.05 };
}

function stateAt(t) {
  const show = t >= T_SHOW && t < T_END;
  street.visible = !show; showroom.visible = show;
  scene.background = new THREE.Color(show ? 0x0a0f30 : 0x9fd0ff);
  scene.fog = show ? null : new THREE.Fog(0xcfe6ff, 30, 90);
  ambient.color.setHex(show ? 0x8090c0 : 0xfff0e0); ambient.intensity = show ? 0.6 : 0.9;
  moon.intensity = 0; sun6.intensity = show ? 0.3 : 1.6; tvLight.intensity = 0; hallLight.intensity = 0; balcLight.intensity = 0;
  spot.intensity = show ? 9 : 0;

  // tuk-tuk
  if (show) {
    if (tuk.parent !== showroom) showroom.add(tuk);
    tuk.position.set(0, 0.2, 0); tuk.rotation.set(0, (t - T_SHOW) * 1.1, 0); tukBody.rotation.set(0, 0, 0);
  } else {
    if (tuk.parent !== street) street.add(tuk);
    const s = tukAt(t); tuk.position.copy(s.pos); tuk.rotation.set(s.roll, 0, s.rz);
  }
  wheels.forEach((w, i) => { w.rotation.y = t < 3.4 ? t * 6 : (t > T_LAUNCH ? t * 40 : 0); });
  // engine: on the balcony -> rope -> bay
  const E0 = V(1.4, BAL_Y + 0.0, -3.35), E1 = TUK_P.clone().add(V(0.9, 0.35, 0));
  engine6.visible = t >= 35.0 || show;
  let ropeTop = null;
  if (show) { if (engine6.parent !== tuk) tuk.add(engine6); engine6.position.set(0.9, 0.35, 0); engine6.rotation.set(0, 0, 0); }
  else if (t < 39.32) { if (engine6.parent !== street) street.add(engine6); engine6.position.copy(E0); engine6.rotation.set(0, 0.4, 0); if (t >= 37.4) engine6.position.add(V(0.3 * seg(t, 37.4, 38.0), 0.6 * seg(t, 37.4, 38.0), 0.6 * seg(t, 37.4, 38.0))); }
  else if (t < 41.0) { if (engine6.parent !== street) street.add(engine6); const k = easeInOut(seg(t, 39.32, 41.0)); const top = E0.clone().add(V(0.3, 0.6, 0.6)); engine6.position.copy(VL(top, E1, k)); engine6.position.y += Math.sin(k * Math.PI) * 0.3; engine6.rotation.set(0, 0.4 * (1 - k) + Math.sin(t * 6) * 0.15 * (1 - k), 0); ropeTop = V(DAD_P.x - 0.3, BAL_Y + 1.1, -2.9); }
  else { if (engine6.parent !== tuk) tuk.add(engine6); engine6.position.set(0.9, 0.35, 0); engine6.rotation.set(0, 0, 0); }
  bay.visible = !(engine6.parent === tuk);
  if (rope6) { street.remove(rope6); rope6.geometry.dispose(); rope6 = null; }
  if (ropeTop) { const b = engine6.position.clone().add(V(0, 0.75, 0)); rope6 = new THREE.Mesh(new THREE.TubeGeometry(new THREE.LineCurve3(ropeTop, b), 2, 0.012, 3), ropeMat); street.add(rope6); }
  const heat = clamp(seg(t, 41.0, T_LAUNCH)); pan6mat.emissive.setRGB(show ? 0.9 : heat * 0.9, show ? 0.25 : heat * 0.25, 0);

  // ---- characters ----
  const inTuk = t >= 43.0 && t < T_END;
  // Hoda
  if (inTuk) { if (hoda.root.parent !== tuk) tuk.add(hoda.root); hoda.root.position.set(-0.55, 0.42, 0); hoda.root.rotation.set(0, -Math.PI / 2, 0); }
  else {
    if (hoda.root.parent !== scene) scene.add(hoda.root);
    hoda.root.rotation.set(0, 0, 0);
    if (t < 3.4) { const tp = tukAt(t).pos; hoda.root.position.set(tp.x + 1.75, 0, tp.z); hoda.root.rotation.y = -Math.PI / 2; }
    else if (t < 5.25) { const k = easeOut(seg(t, 3.4, 4.6)); hoda.root.position.copy(VL(V(TUK_P.x + 1.75, 0, TUK_P.z), HODA_P, k)); hoda.root.rotation.y = lerp(-Math.PI / 2, -0.9, k); }
    else { hoda.root.position.copy(HODA_P); hoda.root.rotation.y = Math.atan2(SAY_P.x - HODA_P.x, SAY_P.z - HODA_P.z) * 0.9; }
    if (t >= 25.1 && t < 43.0) hoda.root.rotation.y = 0.9 * Math.atan2(DAD_P.x - HODA_P.x, DAD_P.z - HODA_P.z);
    if (t >= 41.2 && t < 43.0) { const k = easeInOut(seg(t, 41.6, 43.0)); hoda.root.position.copy(VL(HODA_P, TUK_P.clone().add(V(-0.5, 0, 0.9)), k)); }
  }
  const hz = poseAt(t, KEYS.hoda);
  if (t < 3.4) { const w = Math.sin(t * 7); hz.lL = w * 0.5; hz.lR = -w * 0.5; }
  if (t >= 3.4 && t < 4.6) { const w = Math.sin(t * 8); hz.lL = w * 0.4; hz.lR = -w * 0.4; }
  if (t >= 41.6 && t < 43.0) { const w = Math.sin(t * 9); hz.lL = w * 0.4; hz.lR = -w * 0.4; }
  if (inTuk) Object.assign(hz, { y: -0.4, lL: 1.4, lR: 1.4, aLx: 1.4, eL: 0.6, aRx: 1.4, eR: 0.6, aLz: -0.1, aRz: -0.1, bend: t > T_LAUNCH ? -0.5 : 0.1, hx: t > T_LAUNCH ? -0.3 : 0 });
  if (show) Object.assign(hz, { aLz: 2.6, aRz: 2.6, eL: 0.2, eR: 0.2, aLx: 0, aRx: 0 });
  applyPose(hoda, hz);
  // Sayed
  sayed.root.position.copy(SAY_P); sayed.root.rotation.set(0, 0.35, 0);
  if (t >= 41.2) { const k = easeInOut(seg(t, 41.4, 42.8)); sayed.root.position.copy(VL(SAY_P, SAY_P.clone().add(V(-0.9, 0, -0.6)), k)); chair6.position.copy(sayed.root.position); }
  else chair6.position.copy(SAY_P);
  sayed.root.visible = !show;
  applyPose(sayed, poseAt(t, KEYS.sayed));
  { const hp = sayed.arms[1].hand.getWorldPosition(V(0, 0, 0)); teaGlass6.position.copy(hp).add(V(0, 0.06, 0)); teaGlass6.visible = !show; }
  // Ibrahim on the balcony
  dad.root.visible = !show && t >= 27.3;
  dad.root.position.copy(DAD_P); if (t < 28.1) dad.root.position.z = lerp(-4.3, DAD_P.z, easeOut(seg(t, 27.3, 28.0))); dad.root.rotation.set(0, 0, 0);
  applyPose(dad, poseAt(t, KEYS.dad)); dad.extras.setGoggles(t >= 37.4 && t < 41.2);
  // the bill
  bill.visible = t >= 19.3 && t < 21.0;
  if (bill.visible) { const a = hoda.arms[1].hand.getWorldPosition(V(0, 0, 0)), b = sayed.arms[0].hand.getWorldPosition(V(0, 0, 0)); const k = easeInOut(seg(t, 19.4, 19.9)); bill.position.copy(VL(a, b, k)); bill.position.y += Math.sin(k * Math.PI) * 0.2; bill.rotation.set(0, t * 2, Math.sin(t * 9) * 0.3); }
  laundry6.forEach((c, i) => { c.rotation.y = Math.sin(t * 1.4 + i) * 0.25; });

  // ---- particles ----
  const fire = [];
  if ((t >= T_LAUNCH - 1.2 && !show) || show) {
    const ex = (show ? V(0, 0, 0) : V(0, 0, 0)); const base = engine6.getWorldPosition(V(0, 0, 0));
    const dir = V(Math.cos(tuk.rotation.z), Math.sin(tuk.rotation.z), 0); // engine at +x (rear)
    const pw = t >= T_LAUNCH || show ? 1 : 0.35;
    for (let i = 0; i < 26; i++) { const ph = (t * 3.5 + i / 26) % 1; const p = base.clone().add(dir.clone().multiplyScalar(0.4 + ph * (show ? 1.2 : 2.6) * pw)).add(V((hash(i) - .5) * 0.25 * ph, (hash(i + 1) - .5) * 0.25 * ph, (hash(i + 2) - .5) * 0.25 * ph)); fire.push({ pos: p, size: (0.18 + ph * 0.5) * pw * (1 - ph * 0.5), op: 1 - ph, rot: i }); }
  }
  emit(fire, firePool6);
  const smoke = [];
  if (t >= 41.0 && !show) { const base = engine6.getWorldPosition(V(0, 0, 0)); for (let i = 0; i < 18; i++) { const ph = (t * 1.2 + i / 18) % 1; smoke.push({ pos: base.clone().add(V(0.3 + ph * 1.5 + (t > T_LAUNCH ? (t - T_LAUNCH) * 6 * ph : 0), 0.4 + ph * 1.2, (hash(i) - .5) * ph)), size: 0.3 + ph * 0.9, op: (1 - ph) * 0.6, color: 0x666666 }); } }
  if (t >= 3.0 && t < 3.6) { for (let i = 0; i < 6; i++) { const k = seg(t, 3.0, 3.6); smoke.push({ pos: TUK_P.clone().add(V(0.5 + i * 0.2, 0.15, (hash(i) - .5) * 1.2)), size: 0.2 + k * 0.4, op: (1 - k) * 0.5, color: 0xc8b898 }); } }
  emit(smoke, puffPool);
  const stars = [];
  if (t >= 52.6) { const k = (t * 2) % 1; stars.push({ pos: V(-14, 15.5, -8), size: 0.6 * Math.sin(k * Math.PI), rot: t }); }
  if (show) for (let i = 0; i < 10; i++) { const a = t * 2 + i / 10 * 6.28; stars.push({ pos: V(100 + Math.cos(a) * 2.6, 0.6 + (i % 3) * 0.6, Math.sin(a) * 2.6), size: 0.18, rot: a }); }
  emit(stars, starPool);
  const tears = [];
  if (t >= 32.05 && t < 35.0) { const hd = hoda.head.getWorldPosition(V(0, 0, 0)); for (let i = 0; i < 6; i++) { const k = (t * 1.5 + i / 6) % 1; tears.push({ pos: hd.clone().add(V((i % 2 ? 1 : -1) * (0.12 + k * 0.3), 0.02 - k * 0.6 + Math.sin(k * 3) * 0.2, 0.2)), size: 0.06, op: 1 - k }); } }
  emit(tears, sweatPool);
  emit([], trailPool);

  // ---- faces ----
  let he = 'normal', hm = talkMouth(t, 'hoda', 'scream') || 'closed';
  if (t < 0.9) { he = 'closed'; hm = 'clench'; }
  else if (t < 5.25) { he = 'wide'; hm = talkMouth(t, 'hoda', 'scream') || 'o'; }
  else if (t < 10.6) { he = 'side'; hm = 'flat'; if (t > 7.5) { he = 'sparkle'; hm = 'grin'; } }
  else if (t < 13.4) { he = 'sparkle'; }
  else if (t < 16.55) { he = 'flat'; hm = 'flat'; }
  else if (t < 22.6) { he = 'angry'; if (hm === 'closed') hm = 'clench'; }
  else if (t < 25.1) { he = 'side'; hm = 'o'; }
  else if (t < 32.05) { he = 'angry'; if (hm === 'closed') hm = 'clench'; }
  else if (t < 35.0) { he = 'tears'; if (hm === 'closed') hm = 'wobble'; }
  else if (t < 41.2) { he = 'sparkle'; hm = 'grin'; }
  else if (t < T_LAUNCH) { he = 'pin'; hm = 'o'; }
  else if (t < T_SHOW) { he = 'wide'; hm = 'scream'; }
  else if (t < T_END) { he = 'dizzy'; hm = 'tongue'; }
  let se = 'tired', sm = talkMouth(t, 'sayed') || 'smile';
  if (t >= 13.4 && t < 16.4) se = 'smug';
  if (t >= 22.6 && t < 25.0) se = 'side';
  if (t >= 41.2) { se = 'tired'; sm = talkMouth(t, 'sayed') || 'flat'; }
  if (t >= 52.3) { se = 'closed'; sm = 'smile'; }
  let de = 'smug', dm = talkMouth(t, 'dad') || 'grin';
  if (t >= 32.05 && t < 35.0) { de = 'sad'; dm = 'frown'; }
  if (t >= 35.0 && t < 39.4) de = 'sparkle';
  if (t >= T_LAUNCH && t < T_SHOW) { de = 'pin'; dm = 'o'; }
  const blink = (list) => list.some(b => t >= b && t < b + 0.18);
  if (blink([7.0, 15.0, 24.0, 38.0])) se = 'closed';
  if (blink([12.0, 18.0, 30.0])) he = he === 'tears' ? he : 'closed';
  hoda.faceMat.map = faceTexture(he, hm, { fuzz: true }); hoda.faceMat.needsUpdate = true;
  sayed.faceMat.map = faceTexture(se, sm, { stache: true, stacheColor: '#dddddd' }); sayed.faceMat.needsUpdate = true;
  dad.faceMat.map = faceTexture(de, dm, { stache: true }); dad.faceMat.needsUpdate = true;
}
const firePool6 = spritePool(canvasTex(16, 16, (g) => { g.fillStyle = '#ffdd33'; g.beginPath(); g.moveTo(8, 0); g.quadraticCurveTo(15, 9, 8, 16); g.quadraticCurveTo(1, 9, 8, 0); g.fill(); g.fillStyle = '#ff7a10'; g.beginPath(); g.arc(8, 11, 4, 0, 7); g.fill(); }), 26);

// =====================================================================
function cameraAt(t) {
  if (t < 5.25) { const k = seg(t, 0, 5.25); cam(VL(V(-0.5, 1.3, 7.0), V(-0.3, 1.4, 6.0), k), V(0.8, 1.3, -1.5), 54); }
  else if (t < 10.6) { const k = seg(t, 5.25, 10.6); faceCam(sayed, lerp(1.7, 1.35, k), 0.35, 0.05, 46, 0.15); }
  else if (t < 13.4) { faceCam(hoda, 1.3, -0.35, 0.05, 48, 0.1); }
  else if (t < 16.55) { faceCam(sayed, 1.1, 0.2, 0.0, 44, 0.05); }
  else if (t < 22.6) { const k = seg(t, 16.55, 22.6); cam(VL(V(-0.6, 1.5, 1.8), V(-0.8, 1.45, 1.4), k), V(-1.0, 1.0, -2.0), 56); }
  else if (t < 25.1) { const k = easeInOut(seg(t, 23.2, 25.0)); const h = sayed.head.getWorldPosition(V(0, 0, 0)); cam(VL(h.clone().add(V(0.8, 0.0, 1.6)), V(0.8, 3.0, 3.5), k), VL(h, V(2.0, BAL_Y + 1.0, -3.5), k), 50); }
  else if (t < 28.1) { const h = hoda.head.getWorldPosition(V(0, 0, 0)); cam(h.clone().add(V(-0.9, -0.4, 1.4)), V(2.0, BAL_Y + 0.6, -3.5), 58); }
  else if (t < 32.05) { faceCam(dad, 1.9, 0.3, -0.5, 50, -0.2); }
  else if (t < 35.0) { faceCam(hoda, 1.15, 0.3, 0.05, 46, 0.05); }
  else if (t < 39.32) { faceCam(dad, 2.6, -0.4, -0.7, 54, -0.1); }
  else if (t < 41.2) { const k = seg(t, 39.32, 41.2); cam(V(-3.0, 3.5, 6.5), VL(V(2.0, BAL_Y, -3.0), V(2.2, 0.8, 0.3), easeInOut(k)), 56); }
  else if (t < 43.02) { faceCam(sayed, 1.6, -0.4, 0.05, 48, 0.1); }
  else if (t < T_LAUNCH) { cam(V(4.6, 1.3, 2.2).add(shake(t, 0.03, 30)), TUK_P.clone().add(V(0.3, 0.9, 0)), 54); }
  else if (t < T_SHOW) { const tp = tuk.position.clone(); const a = t - T_LAUNCH; cam(V(lerp(3.0, -6.0, seg(a, 0, 1.4)), 1.4 + Math.max(0, tp.y * 0.35), 5.5).add(shake(t, 0.06 * (1 - seg(a, 0, 2.5)), 25)), tp.clone().add(V(0, 0.8, 0)), 58); }
  else if (t < T_END) { const a = (t - T_SHOW) * 0.25; cam(V(100 + Math.sin(a) * 5.6, 2.4, Math.cos(a) * 5.6), V(100, 1.0, 0), 46); }
  else { const k = easeInOut(seg(t, T_END, 54.5)); cam(VL(V(-3.0, 1.6, 4.0), V(-3.4, 3.0, 6.5), k), VL(V(-2.0, 1.4, -2.5), V(-6, 9, -6), k), 54); }
}

// =====================================================================
// HUD
// =====================================================================
const NAMES = { hoda: ['حودة', 'HODA', '#e0a000'], sayed: ['عم سيد', 'UNCLE SAYED', '#7a6a50'], dad: ['إبراهيم', 'IBRAHIM', '#c9a227'] };
function portrait(g, x, y, who, t) {
  g.fillStyle = '#123'; g.fillRect(x, y, 64, 64); g.strokeStyle = '#fff'; g.lineWidth = 2; g.strokeRect(x, y, 64, 64);
  g.save(); g.beginPath(); g.rect(x + 2, y + 2, 60, 60); g.clip();
  if (who === 'hoda') { g.fillStyle = '#ffd400'; g.fillRect(x + 8, y + 54, 48, 10); g.fillStyle = '#a87048'; g.beginPath(); g.arc(x + 32, y + 36, 19, 0, 7); g.fill(); g.fillStyle = '#120c08'; for (let i = 0; i < 6; i++) { g.beginPath(); g.moveTo(x + 14 + i * 7, y + 22); g.lineTo(x + 17 + i * 7, y + 6); g.lineTo(x + 21 + i * 7, y + 22); g.fill(); } }
  else if (who === 'sayed') { g.fillStyle = '#6b5a48'; g.fillRect(x + 8, y + 54, 48, 10); g.fillStyle = '#8a5a3a'; g.beginPath(); g.arc(x + 32, y + 38, 19, 0, 7); g.fill(); g.fillStyle = '#f4f2ea'; g.beginPath(); g.ellipse(x + 32, y + 20, 22, 11, 0, 0, 7); g.fill(); }
  else { g.fillStyle = '#f3f0e3'; g.fillRect(x + 10, y + 54, 44, 10); g.fillStyle = '#b27448'; g.beginPath(); g.arc(x + 32, y + 36, 20, 0, 7); g.fill(); g.fillStyle = '#1b1410'; g.fillRect(x + 10, y + 30, 5, 12); g.fillRect(x + 49, y + 30, 5, 12); g.fillStyle = '#c9a227'; g.fillRect(x + 14, y + 16, 36, 5); g.fillStyle = '#335a3a'; g.fillRect(x + 18, y + 15, 10, 7); g.fillRect(x + 36, y + 15, 10, 7); }
  const fc = document.createElement('canvas'); fc.width = 32; fc.height = 32; const fg = fc.getContext('2d');
  const e = envAt(t); const mouth = speakerAt(t) === who ? (e < 0.1 ? 'closed' : e < 0.4 ? 'talk1' : 'talk2') : 'closed';
  const eyes = who === 'hoda' ? (t > 32 && t < 35 ? 'tears' : 'wide') : who === 'sayed' ? 'tired' : 'smug';
  drawFace(fg, 32, eyes, mouth, { stache: who !== 'hoda', stacheColor: who === 'sayed' ? '#ddd' : undefined, fuzz: who === 'hoda' });
  g.imageSmoothingEnabled = false; g.drawImage(fc, x + 14, y + 20, 36, 36); g.restore();
}
function drawTitle(g, t) {
  if (t >= 1.5) return; const op = t < 1.1 ? 1 : 1 - seg(t, 1.1, 1.5);
  g.globalAlpha = op; g.fillStyle = 'rgba(0,0,0,0.6)'; g.fillRect(0, 196, W, 76);
  arText(g, 'موتور حودة', W / 2, 198, 40, '#ffe14a', 'center', 'ReemKufi'); pxText(g, "HODA'S ENGINE", W / 2, 250, 10, '#fff', 'center'); g.globalAlpha = 1;
}
function drawQuest(g, t) {
  if (t < 1.5 || t >= T_LAUNCH) return;
  const clues = [[7.6, 'لونه أحمر', 'RED'], [9.2, 'عليه عين زرقا', 'BLUE EVIL EYE'], [23.4, 'الدور التالت', '3RD FLOOR'], [24.3, 'البلكونة اللي عليها غسيل', 'BALCONY + LAUNDRY']];
  const n = clues.filter(c => t >= c[0]).length; const found = t >= 28.1;
  const x = 14, y = 12, w = 270, hh = 44 + n * 24;
  g.fillStyle = 'rgba(0,0,30,0.75)'; g.fillRect(x, y, w, hh); g.strokeStyle = found ? '#3df05a' : '#fff'; g.lineWidth = 2; g.strokeRect(x, y, w, hh);
  pxText(g, found ? 'QUEST COMPLETE?' : 'QUEST', x + 8, y + 8, 8, found ? '#3df05a' : '#ffe14a');
  arText(g, 'مهمة: دوّر على الموتور', x + w - 8, y + 2, 17, '#fff');
  clues.forEach(([t0, ar, en], i) => { if (t < t0) return; const yy = y + 36 + i * 24; const k = easeBack(seg(t, t0, t0 + 0.2)); g.save(); g.translate(x + w - 8, yy); g.scale(k, k); arText(g, ar + ' ✓', 0, 0, 16, '#9fffa0'); g.restore(); pxText(g, en, x + 10, yy + 6, 6, '#9fd0ff'); });
}
function drawMoney(g, t) {
  const a = t - 19.6; if (a < 0 || a > 1.6) return;
  const op = 1 - seg(a, 1.0, 1.6); g.globalAlpha = op;
  pxText(g, '-20', W / 2 + 60, 210 - a * 40, 18, '#ff4040', 'center'); arText(g, 'جنيه (اتنين شاي)', W / 2 + 60, 236 - a * 40, 16, '#fff', 'center'); g.globalAlpha = 1;
}
function drawMarker(g, t) {
  if (t < 27.6 || t >= 39.3) return;
  const p = dad.head.getWorldPosition(V(0, 0, 0)).add(V(0, 0.75, 0)).project(camera); if (p.z > 1) return;
  const x = (p.x + 1) / 2 * W, y = (1 - p.y) / 2 * H + Math.sin(t * 6) * 6;
  if (x < 0 || x > W || y < 0 || y > H) return;
  g.fillStyle = '#ffe14a'; g.strokeStyle = '#000'; g.lineWidth = 2; g.beginPath(); g.moveTo(x - 14, y - 18); g.lineTo(x + 14, y - 18); g.lineTo(x, y); g.closePath(); g.fill(); g.stroke();
  pxText(g, '!', x, y - 44, 18, '#ffe14a', 'center');
}
function drawUpgrade(g, t) {
  if (t < 37.4 || t >= 41.0) return;
  const p = engine6.getWorldPosition(V(0, 0, 0)).add(V(0, 1.0, 0)).project(camera); const x = (p.x + 1) / 2 * W, y = (1 - p.y) / 2 * H;
  if (x < 20 || x > W - 20 || y < 20 || y > H - 20) return;
  g.fillStyle = 'rgba(0,0,30,0.8)'; g.fillRect(x - 100, y - 44, 200, 40); g.strokeStyle = '#ff9a4a'; g.lineWidth = 2; g.strokeRect(x - 100, y - 44, 200, 40);
  pxText(g, 'UPGRADE:', x - 92, y - 38, 7, '#ff9a4a'); arText(g, 'مقوّي نووي ☢', x + 92, y - 44, 18, '#fff');
}
function drawSpeedo(g, t) {
  if (t < T_LAUNCH || t >= T_SHOW) return; const a = t - T_LAUNCH;
  const x = W - 150, y = H - 150; g.fillStyle = 'rgba(0,0,0,0.75)'; g.beginPath(); g.arc(x + 70, y + 70, 64, 0, 7); g.fill(); g.strokeStyle = '#fff'; g.lineWidth = 3; g.beginPath(); g.arc(x + 70, y + 70, 64, 0, 7); g.stroke();
  const v = Math.min(1, a / 1.2); const ang = Math.PI * 0.75 + v * Math.PI * 1.5 + (v >= 1 ? Math.sin(t * 40) * 0.1 : 0);
  g.strokeStyle = '#ff3030'; g.lineWidth = 4; g.beginPath(); g.moveTo(x + 70, y + 70); g.lineTo(x + 70 + Math.cos(ang) * 52, y + 70 + Math.sin(ang) * 52); g.stroke();
  pxText(g, v < 1 ? String(Math.floor(v * 400)) : 'MACH 3', x + 70, y + 92, 10, v < 1 ? '#fff' : '#ff4040', 'center');
  pxText(g, 'KM/H', x + 70, y + 108, 7, '#9fd0ff', 'center');
  if (a > 0.9) { const k = easeBack(seg(a, 0.9, 1.1)); g.save(); g.translate(W / 2, 120); g.scale(k, k); pxText(g, 'LIFT OFF!', 0, -14, 24, '#ffe14a', 'center'); g.restore(); }
}
function drawUnlocked(g, t) {
  if (t < T_SHOW || t >= T_END) return; const a = t - T_SHOW;
  const k = easeOut(clamp(a / 0.3));
  g.fillStyle = 'rgba(0,0,0,0.0)';
  g.fillStyle = 'rgba(10,10,40,0.9)'; g.fillRect(14, 14 - (1 - k) * 120, W - 28, 92); g.strokeStyle = '#3df05a'; g.lineWidth = 3; g.strokeRect(14, 14 - (1 - k) * 120, W - 28, 92);
  pxText(g, 'NEW VEHICLE UNLOCKED!', 30, 28 - (1 - k) * 120, 12, '#3df05a');
  arText(g, 'توكتوك 3000', W - 30, 22 - (1 - k) * 120, 34, '#ffe14a', 'right', 'ReemKufi');
  pxText(g, 'TUK-TUK 3000', 30, 66 - (1 - k) * 120, 14, '#fff');
  if (a > 0.8) {
    const x = 20, y = H - 150; g.fillStyle = 'rgba(10,10,40,0.88)'; g.fillRect(x, y, 300, 136); g.strokeStyle = '#fff'; g.lineWidth = 2; g.strokeRect(x, y, 300, 136);
    const stat = (lbl, n, yy, col, txt2) => { pxText(g, lbl, x + 12, y + yy, 8, '#fff'); if (txt2) pxText(g, txt2, x + 130, y + yy, 8, col); else for (let i = 0; i < 6; i++) { g.fillStyle = i < n ? col : '#334'; g.fillRect(x + 130 + i * 24, y + yy - 2, 20, 11); } };
    stat('SPEED', 6, 14, '#ff4a2a'); stat('BRAKES', 0, 38, '#3df05a'); stat('ENGINE', 0, 62, '#fff', 'JET DISHWASHER'); stat('FUEL', 0, 86, '#ffd400', 'TEFLON PAN'); stat('DRIVER', 0, 110, '#9fd0ff', 'HODA (DIZZY)');
  }
}
function drawEnd(g, t) {
  const a = t - 52.9; if (a < 0) return; const k = easeOut(clamp(a / 0.4));
  g.fillStyle = `rgba(0,0,0,${0.5 * k})`; g.fillRect(0, 0, W, H);
  g.save(); g.translate(W / 2, 190); g.scale(k, k); arText(g, 'يُتبع...', 0, -40, 54, '#ffe14a', 'center', 'ReemKufi'); pxText(g, 'TO BE CONTINUED', 0, 30, 16, '#fff', 'center'); g.restore();
}

window.renderFrame = function (t) {
  stateAt(t); cameraAt(t);
  renderer.render(scene, camera);
  ctx.clearRect(0, 0, W, H); ctx.drawImage(glCanvas, 0, 0);
  h.clearRect(0, 0, W, H);
  drawQuest(h, t); drawMoney(h, t); drawMarker(h, t); drawUpgrade(h, t); drawSpeedo(h, t); drawUnlocked(h, t); drawDialogue(h, t); drawEnd(h, t); drawTitle(h, t);
  ctx.drawImage(hud, 0, 0);
  vignette(ctx, 0.3);
  if (t >= T_LAUNCH && t < T_LAUNCH + 0.07) { ctx.fillStyle = 'rgba(255,240,200,0.8)'; ctx.fillRect(0, 0, W, H); }
  if (t >= T_SHOW - 0.15 && t < T_SHOW + 0.1) { ctx.fillStyle = '#fff'; ctx.globalAlpha = 1 - Math.abs(t - T_SHOW) / 0.15; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; }
  if (t >= T_END - 0.1 && t < T_END + 0.15) { ctx.fillStyle = '#fff'; ctx.globalAlpha = 1 - Math.abs(t - T_END) / 0.15; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; }
  return true;
};
window.frameData = () => out.toDataURL('image/png');
window.DUR = DUR;
document.fonts.load('10px PS2P').then(() => document.fonts.load('20px Lalezar', 'ع')).then(() => document.fonts.load('700 20px ReemKufi', 'ع')).then(() => {
  const re = (tex, bg, fn) => { const g = tex.userData.g, c = tex.userData.canvas; g.fillStyle = bg; g.fillRect(0, 0, c.width, c.height); fn(g, c.width, c.height); tex.needsUpdate = true; };
  re(shopTex, '#1f6fd8', (g) => { g.fillStyle = '#fff'; g.font = '16px Lalezar'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.direction = 'rtl'; g.fillText('بقالة الأمل', 48, 13); });
  re(mashallahTex, '#d8231b', (g) => { g.fillStyle = '#ffe14a'; g.font = '13px Lalezar'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.direction = 'rtl'; g.fillText('ما شاء الله', 32, 11); });
  re(plateTex, '#f0f0f0', (g) => { g.fillStyle = '#d8231b'; g.fillRect(0, 0, 48, 4); g.fillStyle = '#111'; g.font = '9px Lalezar'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.direction = 'rtl'; g.fillText('ح و د | ٣٠٠٠', 24, 11); });
  window.READY = true;
});
