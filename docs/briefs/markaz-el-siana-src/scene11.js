// الشبشب — FINAL BOSS. Deterministic low-poly Y2K console cutscene.
// Same engine family as "Jet Dishwasher 3000": window.renderFrame(t) draws frame t into #out.
import * as THREE from 'three';

const W = 640, H = 480;
const DUR = 76.0;
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
// مركز الصيانة — the service center (new cast: Bastam, El-Alamy, El-Asly, El-Gazzar)
// =====================================================================
room.visible = false; hallway.visible = false; balcony.visible = false;
const T_LAND = 4.7, T_LAPTOP = 25.0, T_FIX = 60.1, T_START = 61.6, T_LAUNCH = 63.0, T_RES = 65.4, T_ENDC = 74.1;
const garage = new THREE.Group(); scene.add(garage);
const concT = canvasTex(32, 32, (g) => { g.fillStyle = '#8a8a8e'; g.fillRect(0, 0, 32, 32); const r = rng(3); for (let i = 0; i < 60; i++) { g.fillStyle = r() > .5 ? '#9a9a9e' : '#7a7a7e'; g.fillRect(r() * 32 | 0, r() * 32 | 0, 2, 2); } g.fillStyle = 'rgba(20,20,20,0.5)'; g.beginPath(); g.ellipse(20, 12, 7, 4, 0.3, 0, 7); g.fill(); g.fillStyle = '#e8c020'; g.fillRect(0, 30, 32, 2); }, [8, 6]);
const metalT = canvasTex(16, 32, (g) => { g.fillStyle = '#6f8fa8'; g.fillRect(0, 0, 16, 32); g.fillStyle = '#5a7890'; for (let x = 0; x < 16; x += 4) g.fillRect(x, 0, 2, 32); g.fillStyle = '#8aa8c0'; g.fillRect(1, 0, 1, 32); }, [14, 2]);
const signT = canvasTex(160, 32, (g) => { g.fillStyle = '#d8231b'; g.fillRect(0, 0, 160, 32); g.fillStyle = '#fff'; g.fillRect(0, 0, 160, 3); g.fillRect(0, 29, 160, 3); });
const gw = (w, h, x, y, z, ry, mat) => { const m = mesh(new THREE.PlaneGeometry(w, h), mat, x, y, z, garage); m.rotation.y = ry; return m; };
const metalM = M(0xffffff, { map: metalT });
gw(14, 5, 0, 2.5, -5, 0, metalM); gw(10, 5, -7, 2.5, 0, Math.PI / 2, metalM);
gw(3, 5, 7, 2.5, -3.5, -Math.PI / 2, metalM); gw(3, 5, 7, 2.5, 3.5, -Math.PI / 2, metalM); gw(4, 1.2, 7, 4.4, 0, -Math.PI / 2, metalM); // big open door x=7, z -2..2
const doorSky = gw(4.2, 3.8, 7.6, 1.9, 0, -Math.PI / 2, new THREE.MeshBasicMaterial({ color: 0xbfe0ff }));
const gfloor = mesh(new THREE.PlaneGeometry(14, 10), M(0xffffff, { map: concT }), 0, 0, 0, garage); gfloor.rotation.x = -Math.PI / 2;
const gceil = mesh(new THREE.PlaneGeometry(14, 10), M(0x5a5a60), 0, 5, 0, garage); gceil.rotation.x = Math.PI / 2;
const sign = mesh(new THREE.PlaneGeometry(6.4, 1.28), new THREE.MeshBasicMaterial({ map: signT }), 0, 4.1, -4.97, garage);
for (let i = -2; i <= 2; i++) { mesh(box(1.6, 0.06, 0.15), M(0xdddddd), i * 2.8, 4.9, -0.5, garage); mesh(cyl(0.04, 0.04, 1.5, 6), new THREE.MeshBasicMaterial({ color: 0xf0fff4 }), i * 2.8, 4.85, -0.5, garage).rotation.z = Math.PI / 2; }
// tool board with wrenches
const board = mesh(box(3.2, 1.6, 0.06), M(0xc8a060), -3.8, 2.2, -4.95, garage);
{ const r = rng(5); for (let i = 0; i < 14; i++) { const t = mesh(box(0.06, 0.35 + r() * 0.3, 0.03), P(0xb8c0c8, { shininess: 90 }), -5.2 + i * 0.2, 2.2 + (r() - .5) * 0.6, -4.9, garage); t.rotation.z = (r() - .5) * 0.3; } }
// tire stacks + oil barrels
for (const [x, z] of [[-6.2, -4.2], [-6.2, -3.2], [5.6, -4.3]]) for (let k = 0; k < 4; k++) mesh(new THREE.TorusGeometry(0.38, 0.16, 6, 12), M(0x1a1a1a), x, 0.16 + k * 0.32, z, garage).rotation.x = Math.PI / 2;
for (const [x, z, c] of [[-6.3, 1.5, 0x1f5fd8], [-6.3, 2.4, 0xd8231b], [-5.5, 2.0, 0x1f5fd8]]) { mesh(cyl(0.32, 0.32, 0.95, 10), M(c), x, 0.475, z, garage); mesh(new THREE.TorusGeometry(0.32, 0.03, 4, 10), M(0x111111), x, 0.65, z, garage).rotation.x = Math.PI / 2; }
// car lift with a raised sedan
const lift = new THREE.Group(); lift.position.set(-3.6, 0, -2.4); garage.add(lift);
for (const s of [-1, 1]) mesh(box(0.25, 3.0, 0.25), M(0xe8c020), s * 1.5, 1.5, 0, lift);
mesh(box(3.2, 0.12, 1.4), M(0x333333), 0, 1.6, 0, lift);
const sedan = new THREE.Group(); sedan.position.set(0, 1.7, 0); lift.add(sedan);
mesh(box(3.0, 0.55, 1.35), M(0xf2f2f2), 0, 0.35, 0, sedan); mesh(box(1.5, 0.5, 1.25), M(0x223344), -0.1, 0.85, 0, sedan);
for (const [x, z] of [[-1.0, 0.68], [1.0, 0.68], [-1.0, -0.68], [1.0, -0.68]]) mesh(cyl(0.3, 0.3, 0.18, 10), M(0x111111), x, 0.2, z, sedan).rotation.x = Math.PI / 2;
// a second car on the floor with its hood up (El-Gazzar's spot)
const car2 = new THREE.Group(); car2.position.set(2.6, 0, -3.3); garage.add(car2);
mesh(box(3.0, 0.55, 1.35), M(0x1f5fd8), 0, 0.55, 0, car2); mesh(box(1.5, 0.5, 1.25), M(0x223344), 0.2, 1.05, 0, car2);
const hood = mesh(box(0.9, 0.05, 1.3), M(0x1f5fd8), -1.5, 1.25, 0, car2); hood.rotation.z = -1.0;
for (const [x, z] of [[-1.0, 0.68], [1.0, 0.68], [-1.0, -0.68], [1.0, -0.68]]) mesh(cyl(0.3, 0.3, 0.18, 10), M(0x111111), x, 0.3, z, car2).rotation.x = Math.PI / 2;
// El-Alamy's office corner: glass box + desk + monitor
const office = new THREE.Group(); office.position.set(4.4, 0, 2.6); garage.add(office);
mesh(box(1.4, 0.06, 0.7), M(0x6a4220), 0, 0.8, 0, office); for (const [x, z] of [[-0.6, -0.3], [0.6, -0.3], [-0.6, 0.3], [0.6, 0.3]]) mesh(box(0.05, 0.8, 0.05), M(0x333333), x, 0.4, z, office);
const monTex = canvasTex(64, 40, (g) => { g.fillStyle = '#0a2a5a'; g.fillRect(0, 0, 64, 40); g.fillStyle = '#3df05a'; for (let y = 4; y < 36; y += 5) g.fillRect(4, y, 20 + (y * 7 % 30), 2); });
mesh(box(0.6, 0.4, 0.05), M(0x111111), 0, 1.1, -0.2, office); mesh(new THREE.PlaneGeometry(0.55, 0.35), new THREE.MeshBasicMaterial({ map: monTex }), 0, 1.1, -0.17, office);
mesh(new THREE.PlaneGeometry(2.2, 2.6), new THREE.MeshPhongMaterial({ color: 0xcfe6ff, transparent: true, opacity: 0.18, side: THREE.DoubleSide }), 0, 1.3, 0.9, office);
// creeper board for El-Gazzar
const creeper = new THREE.Group(); garage.add(creeper);
mesh(box(0.55, 0.06, 1.5), M(0x333333), 0, 0.13, 0, creeper); for (const [x, z] of [[-0.22, -0.6], [0.22, -0.6], [-0.22, 0.6], [0.22, 0.6]]) mesh(new THREE.SphereGeometry(0.06, 5, 4), M(0x111111), x, 0.06, z, creeper);
// the laptop (El-Alamy)
const lapTex = canvasTex(128, 80, () => { });
const laptop = new THREE.Group(); scene.add(laptop);
mesh(box(0.42, 0.025, 0.3), P(0x3a3a44), 0, 0, 0, laptop);
const lidL = new THREE.Group(); lidL.position.set(0, 0.0125, -0.15); laptop.add(lidL); lidL.rotation.x = -0.35;
mesh(box(0.42, 0.28, 0.015), P(0x3a3a44), 0, 0.14, -0.008, lidL); mesh(new THREE.PlaneGeometry(0.38, 0.24), new THREE.MeshBasicMaterial({ map: lapTex }), 0, 0.14, 0.001, lidL);
let cableL = null;
const teaG = mesh(cyl(0.04, 0.035, 0.1, 6), P(0xbf5a1a, { transparent: true, opacity: 0.85 }), 0, 0, 0, scene);
const wrench = new THREE.Group(); scene.add(wrench); mesh(box(0.06, 0.55, 0.03), P(0xb8c0c8, { shininess: 90 }), 0, 0, 0, wrench); mesh(new THREE.TorusGeometry(0.07, 0.025, 4, 8, Math.PI * 1.5), P(0xb8c0c8), 0, 0.3, 0, wrench);


const street = new THREE.Group(); scene.add(street);
function txt(w, h, bg, fn) { return canvasTex(w, h, (g) => { g.fillStyle = bg; g.fillRect(0, 0, w, h); fn(g, w, h); }); }
const shopTex = txt(96, 24, '#1f6fd8', (g) => { g.fillStyle = '#fff'; g.font = '16px Lalezar'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.direction = 'rtl'; g.fillText('بقالة الأمل', 48, 13); });
const mashallahTex = txt(64, 20, '#d8231b', (g) => { g.fillStyle = '#ffe14a'; g.font = '13px Lalezar'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.direction = 'rtl'; g.fillText('ما شاء الله', 32, 11); });
const plateTex = txt(48, 16, '#f0f0f0', (g) => { g.fillStyle = '#d8231b'; g.fillRect(0, 0, 48, 4); g.fillStyle = '#111'; g.font = '9px Lalezar'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.direction = 'rtl'; g.fillText('ح و د | ٣٠٠٠', 24, 11); });

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

tuk.add(engine6); engine6.position.set(0.9, 0.35, 0); bay.visible = false; engine6.visible = true;
street.visible = true;

// ---------- the new cast ----------
const coverall = (c) => canvasTex(16, 16, (g) => { g.fillStyle = c; g.fillRect(0, 0, 16, 16); g.fillStyle = 'rgba(0,0,0,0.18)'; g.fillRect(7, 0, 2, 16); g.fillStyle = 'rgba(255,255,255,0.12)'; g.fillRect(2, 3, 4, 3); });
const bastam = makeChar({ seed: 61, skin: 0xb07a50, hipY: 0.84, legX: 0.11, legColor: 0x2f5fb0, shoe: 0x222222, hand: 0xb07a50,
  torsoGeo: cyl(0.24, 0.26, 0.64, 6), torsoTex: coverall('#2f5fb0'), torsoColor: 0xffffff, torsoY: 0.32, sleeve: true, sleeveColor: 0x2f5fb0, shoulderX: 0.3, shoulderY: 0.57, neckY: 0.64, headR: 0.27,
  build(head, torso, reg) { const cap = mesh(new THREE.SphereGeometry(0.28, 8, 4, 0, Math.PI * 2, 0, Math.PI * 0.42), reg(M(0xd8231b)), 0, 0.04, 0, head); mesh(box(0.3, 0.03, 0.2), reg(M(0xd8231b)), 0, 0.1, -0.3, head); mesh(box(0.12, 0.08, 0.02), reg(M(0xffffff)), 0.12, 0.45, 0.25, torso); return {}; } }, scene);
const alamy = makeChar({ seed: 71, skin: 0xc8946a, hipY: 0.86, legX: 0.11, legColor: 0x262a36, shoe: 0x0c0c10, hand: 0xc8946a,
  torsoGeo: cyl(0.25, 0.22, 0.64, 8), torsoTex: null, torsoColor: 0x1c2440, torsoY: 0.32, sleeve: true, sleeveColor: 0x1c2440, shoulderX: 0.31, shoulderY: 0.57, neckY: 0.64, headR: 0.27,
  build(head, torso, reg) {
    // styled hair: short fade on the sides, volume swept up at the front
    const hair = reg(M(0x15100b));
    mesh(new THREE.SphereGeometry(0.285, 8, 4, 0, Math.PI * 2, 0, Math.PI * 0.38), hair, 0, 0.02, -0.02, head);
    const quiff = mesh(box(0.24, 0.07, 0.12), hair, 0.03, 0.255, 0.13, head); quiff.rotation.x = -0.3;
    for (const sx of [-1, 1]) mesh(box(0.04, 0.12, 0.3), reg(M(0x3a2a20)), sx * 0.26, 0.06, -0.06, head);
    // crisp white shirt, open collar, dark lapels, pocket square
    mesh(box(0.15, 0.44, 0.02), reg(M(0xf6f6f2)), 0, 0.42, 0.236, torso);
    for (const sx of [-1, 1]) { const lap = mesh(box(0.07, 0.36, 0.025), reg(M(0x141a30)), sx * 0.09, 0.5, 0.245, torso); lap.rotation.z = sx * 0.32; }
    for (const sx of [-1, 1]) { const col = mesh(box(0.08, 0.05, 0.03), reg(M(0xffffff)), sx * 0.06, 0.66, 0.235, torso); col.rotation.z = sx * 0.6; }
    mesh(box(0.06, 0.03, 0.01), reg(M(0xffffff)), -0.15, 0.48, 0.25, torso);
    mesh(box(0.035, 0.035, 0.01), reg(M(0xd8c060)), 0, 0.28, 0.25, torso); // blazer button
    return {};
  } }, scene);
// gold watch on the left wrist, polished shoes
mesh(box(0.13, 0.05, 0.13), P(0xd4a62a, { shininess: 120, specular: 0xffffff }), 0, -0.27, 0, alamy.arms[0].el);
alamy.legs.forEach(l => { l.userData.shoe.material = P(0x0c0c10, { shininess: 140, specular: 0xffffff }); });
const asly = makeChar({ seed: 81, skin: 0xa86a40, hipY: 0.86, legX: 0.16, legColor: 0x6a6a6a, shoe: 0x222222, hand: 0xa86a40,
  torsoGeo: cyl(0.4, 0.54, 0.72, 8), torsoTex: coverall('#6a6a6a'), torsoColor: 0xffffff, torsoY: 0.34, sleeve: true, sleeveColor: 0x6a6a6a, shoulderX: 0.44, shoulderY: 0.62, neckY: 0.7, headR: 0.32,
  build(head, torso, reg) { mesh(box(0.08, 0.14, 0.26), reg(M(0x2a1a10)), 0.31, 0.0, -0.04, head); mesh(box(0.08, 0.14, 0.26), reg(M(0x2a1a10)), -0.31, 0.0, -0.04, head); mesh(cyl(0.3, 0.3, 0.06, 8), reg(M(0xffd400)), 0, -0.05, 0.52, torso).rotation.x = Math.PI / 2; return {}; } }, scene);
const gazzar = makeChar({ seed: 91, skin: 0xa87048, hipY: 0.84, legX: 0.11, legColor: 0x3a3a2a, shoe: 0x222222, hand: 0xa87048,
  torsoGeo: cyl(0.24, 0.26, 0.64, 6), torsoTex: canvasTex(16, 16, (g) => { g.fillStyle = '#4a4a38'; g.fillRect(0, 0, 16, 16); g.fillStyle = '#1a1a14'; g.fillRect(3, 5, 4, 3); g.fillRect(10, 11, 3, 2); }), torsoColor: 0xffffff, torsoY: 0.32, sleeve: true, sleeveColor: 0x4a4a38, shoulderX: 0.3, shoulderY: 0.57, neckY: 0.64, headR: 0.27,
  build(head, torso, reg) { const hair = reg(M(0x120c08)); const r = rng(14); for (let i = 0; i < 12; i++) { const a = r() * 6.28; mesh(new THREE.IcosahedronGeometry(0.1, 0), hair, Math.cos(a) * 0.2, 0.12 + r() * 0.1, Math.sin(a) * 0.18 - 0.08, head); } mesh(new THREE.TorusGeometry(0.27, 0.035, 4, 12), reg(M(0xd8231b)), 0, 0.12, 0, head).rotation.x = Math.PI / 2 - 0.1; return {}; } }, scene);
dad.afro.visible = false; samir.root.visible = false; cane.visible = false; mom.root.visible = false; son.root.visible = false;

// =====================================================================
const KEYS = {};
const SHOUT = { aLx: 1.0, eL: 1.8, aLz: 0.2, aRz: 0.95, eR: 1.9, hx: -0.25, bend: -0.1 };
KEYS.bastam = [
  [0, { ...SHOUT }], [2.2, { ...SHOUT, aLx: 0.9, aLz: 0.6, hy: 0.6 }, 0.2], [4.66, { aLz: 0.95, eL: 1.9, aRz: 0.95, eR: 1.9 }, 0.3],
  [10.0, { aRx: 1.2, eR: 1.8, aRz: 0.4, aLz: 0.95, eL: 1.9, hz: 0.2 }, 0.2], [15.85, { aLz: 0.95, eL: 1.9, aRx: 1.5, eR: 0.2, aRz: 0.3 }, 0.15],
  [17.0, { ...SHOUT, hy: -0.7 }, 0.15], [19.4, { aLz: 0.3, aRz: 0.3 }, 0.3], [61.8, { aLz: 2.6, aRz: 2.6, eL: 0.2, eR: 0.2 }, 0.15],
];
KEYS.dad = [
  [0, { aLz: 0.3, aRz: 0.3 }], [5.9, { aRx: 1.3, aRz: 0.5, eR: 1.0, aLz: 0.3, hx: 0.05 }, 0.2], [13.15, { aLz: 0.95, eL: 1.9, aRz: 0.95, eR: 1.9, hx: 0.1, hz: 0.12 }, 0.2],
  [19.6, { aLz: 2.3, aRz: 2.3, eL: 0.4, eR: 0.4, hx: -0.15 }, 0.12], [21.4, { aLz: 0.3, aRz: 0.3 }, 0.3],
  [28.55, { aLz: 1.5, aRz: 1.5, eL: 2.4, eR: 2.4, aLx: 0.3, aRx: 0.3, hx: -0.1 }, 0.15], [37.25, { aRx: 1.2, aRz: 0.8, eR: 1.6, aLz: 0.3, bend: 0.1, hy: 0.4 }, 0.15],
  [41.3, { aRx: 1.3, eR: 1.5, aRz: 0.2, tr: 1, aLz: 0.95, eL: 1.9 }, 0.15], [42.8, { aRx: 1.3, eR: 2.2, aRz: 0.1, aLz: 0.95, eL: 1.9, hz: 0.2 }, 0.2],
  [44.6, { aLx: 1.4, eL: 1.5, aRx: 1.4, eR: 1.5, aLz: -0.3, aRz: -0.3, bend: 0.25, hx: 0.1 }, 0.12],
];
KEYS.alamy = [
  [0, { aLx: 1.0, eL: 1.2, aRx: 1.0, eR: 1.2, aLz: -0.15, aRz: -0.15 }], [21.4, { aLx: 1.0, eL: 1.2, aRx: 1.0, eR: 1.2, aLz: -0.15, aRz: -0.15, hx: 0.1, hy: 0.3 }, 0.3],
  [27.0, { aLx: 1.0, eL: 1.2, aRx: 1.2, eR: 1.5, aLz: -0.15, aRz: 0.2, hx: 0.15, bend: 0.3 }, 0.3], [32.3, { aLx: 1.0, eL: 1.2, aRx: 1.0, eR: 1.2, aLz: -0.15, aRz: -0.15, hx: 0.3 }, 0.3],
  [39.6, { aRx: 2.5, eR: 2.2, aRz: 0.2, aLz: 0.95, eL: 1.9, hx: 0.25, bend: 0.1 }, 0.2], [41.3, { aLz: 0.95, eL: 1.9, aRz: 0.95, eR: 1.9, hx: 0.2 }, 0.3],
];
KEYS.asly = [
  [0, { aRx: 0.4, eR: 0.6, aLz: 0.3 }], [44.6, { aRz: 2.6, eR: 0.5, aRx: 0.3, aLz: 0.95, eL: 1.9, bend: 0.1, hx: -0.1 }, 0.12], [46.6, { aRz: 2.2, eR: 1.2, aRx: 0.8, aLz: 0.95, eL: 1.9, bend: 0.2 }, 0.12],
  [49.2, { aRx: 0.6, eR: 0.8, aRz: 0.3, aLz: 0.95, eL: 1.9, hy: 0.6 }, 0.3], [54.6, { aRz: 2.6, eR: 0.4, aRx: 0.3, aLx: 1.2, eL: 0.4, aLz: 0.3, bend: 0.15 }, 0.12],
];
KEYS.gazzar = [
  [0, { aLz: 0.5, aRz: 0.5, eL: 0.3, eR: 0.3 }], [49.2, { aLz: 0.4, aRx: 1.2, eR: 1.8, aRz: 0.2, hx: -0.2 }, 0.8], [57.1, { aRz: 2.4, eR: 0.5, aLz: 0.5, hx: -0.15, hz: 0.15 }, 0.6],
];
const IB_P = V(3.0, 0, 1.2), BA_P = V(0.0, 0, 0.6), AL_P = V(1.2, 0, 1.6), AS_P = V(-0.6, 0, -0.3), GA_P = V(1.2, 0, -1.6);
const TUK_P = V(2.2, 0, -0.6);
function tukAt(t) {
  if (t < 3.0) return { pos: V(10, 9, 0), rz: 0, vis: false };
  if (t < T_LAND) { const k = seg(t, 3.0, T_LAND); return { pos: VL(V(9.5, 6.5, -0.2), TUK_P, easeOut(k)), rz: lerp(-0.4, 0, k), vis: true }; }
  if (t < T_LAUNCH) { const sh = t >= T_START ? 0.04 : 0; return { pos: TUK_P.clone().add(V(noise1(t * 40) * sh, Math.abs(noise1(t * 37)) * sh, 0)), rz: noise1(t * 33) * sh, vis: true }; }
  const a = t - T_LAUNCH; return { pos: V(TUK_P.x + 4.5 * a * a, 5 * Math.max(0, a - 0.7) ** 2, TUK_P.z), rz: Math.min(0.9, Math.max(0, a - 0.7) * 1.4), vis: a < 2.4 };
}
function stateAt(t) {
  const res = t >= T_RES;
  scene.background = new THREE.Color(0x101014); scene.fog = null;
  ambient.color.setHex(0xf4f8ff); ambient.intensity = 0.95; moon.intensity = 0; tvLight.intensity = 0; hallLight.intensity = 0; balcLight.intensity = 0;
  const tp = tukAt(t); tuk.visible = tp.vis; tuk.position.copy(tp.pos); tuk.rotation.set(0, Math.PI, tp.rz);
  wheels.forEach(w => w.rotation.y = t > T_LAUNCH ? t * 40 : 0); pan6mat.emissive.setRGB(t >= T_START ? 0.9 : 0.35, t >= T_START ? 0.25 : 0.1, 0);
  // laptop screen
  { const g = lapTex.userData ? null : null; }
  { const c = lapTex.image.getContext('2d'); const w = 128, h = 80; c.imageSmoothingEnabled = false;
    if (t < 26.0) { c.fillStyle = '#0a2a5a'; c.fillRect(0, 0, w, h); c.fillStyle = '#fff'; c.font = '7px PS2P'; c.textAlign = 'center'; c.textBaseline = 'top'; c.fillText('CONNECTING...', 64, 34); }
    else if (t < 32.3) { c.fillStyle = '#000'; c.fillRect(0, 0, w, h); c.fillStyle = '#3df05a'; c.font = '6px PS2P'; c.textAlign = 'left'; c.textBaseline = 'top'; c.fillText('ECU SCAN...', 4, 6); c.fillStyle = '#ff4040'; c.fillText('OS: PRESSURE', 4, 26); c.fillText('    COOKER v3000', 4, 36); c.fillStyle = '#ffd400'; c.fillText('WARNING: STEAM', 4, 56); }
    else { c.fillStyle = '#e8eef8'; c.fillRect(0, 0, w, h); c.fillStyle = '#1f5fd8'; c.fillRect(0, 0, w, 14); c.fillStyle = '#fff'; c.font = '10px Lalezar'; c.textAlign = 'center'; c.textBaseline = 'top'; c.direction = 'rtl'; c.fillText('الشبكة المتصلة', 64, 1); c.fillStyle = '#d8231b'; c.font = '14px Lalezar'; c.fillText('أبو سمير - ممنوع السرقة', 64, 30); c.direction = 'ltr'; }
    lapTex.needsUpdate = true; }
  // ---- characters ----
  dad.extras.setGoggles(t >= 28.55 && t < 32.0);
  dad.root.visible = t >= T_LAND - 0.2 && t < T_RES + 20;
  if (t < 5.6) { const k = easeOut(seg(t, T_LAND, 5.6)); dad.root.position.copy(VL(TUK_P.clone().add(V(-0.5, 0, 0.9)), IB_P, k)); dad.root.rotation.set(0, -1.2, 0); }
  else { dad.root.position.copy(IB_P); dad.root.rotation.set(0, -1.5, 0); if (t >= 21.4) dad.root.rotation.y = -1.9; if (t >= 44.6) { dad.root.position.copy(VL(IB_P, V(3.8, 0, 2.4), easeOut(seg(t, 46.0, 46.8)))); dad.root.rotation.y = -2.0; } }
  applyPose(dad, poseAt(t, KEYS.dad));
  bastam.root.visible = true;
  if (t < 61.8) { bastam.root.position.copy(BA_P); bastam.root.rotation.set(0, t < 4.66 ? 0.3 : 1.1, 0); if (t >= 15.85 && t < 19.4) bastam.root.rotation.y = 2.2; }
  if (t >= 61.8 && t < T_LAUNCH) { const k = easeInOut(seg(t, 61.8, 62.8)); bastam.root.position.copy(VL(BA_P, TUK_P.clone().add(V(0.2, 0, 0)), k)); bastam.root.rotation.set(0, lerp(1.1, 0, k), 0); }
  if (t >= T_LAUNCH) { if (bastam.root.parent !== tuk) tuk.add(bastam.root); bastam.root.position.set(-0.4, 0.42, 0); bastam.root.rotation.set(0, Math.PI / 2, 0); }
  else if (bastam.root.parent !== scene) scene.add(bastam.root);
  const bz = poseAt(t, KEYS.bastam); if (t >= T_LAUNCH) Object.assign(bz, { y: -0.4, lL: 1.4, lR: 1.4, aLz: 2.6, aRz: 2.6, eL: 0.2, eR: 0.2, aLx: 0, aRx: 0 });
  applyPose(bastam, bz); bastam.root.visible = !res || t < T_LAUNCH + 2.4;
  alamy.root.visible = t >= 21.0;
  { const k = easeOut(seg(t, 21.0, 22.4)); alamy.root.position.copy(VL(V(4.4, 0, 3.4), AL_P, k)); alamy.root.rotation.set(0, lerp(-2.6, -1.9, k), 0); if (t >= 25.0 && t < 44.6) { alamy.root.position.copy(V(1.6, 0, 0.1)); alamy.root.rotation.y = 0.9; } if (t >= 44.6) { alamy.root.position.copy(V(3.6, 0, 0.6)); alamy.root.rotation.y = -1.3; } }
  const az = poseAt(t, KEYS.alamy); if (t >= 21.0 && t < 22.4) { const w = Math.sin(t * 7); az.lL = w * 0.4; az.lR = -w * 0.4; }
  applyPose(alamy, az);
  { const a = alamy.arms[0].hand.getWorldPosition(V(0, 0, 0)), b = alamy.arms[1].hand.getWorldPosition(V(0, 0, 0)); laptop.visible = alamy.root.visible && t < 39.6; laptop.position.copy(a.add(b).multiplyScalar(0.5)).add(V(0, -0.02, 0)); laptop.rotation.set(0, alamy.root.rotation.y + Math.PI, 0); }
  if (cableL) { scene.remove(cableL); cableL.geometry.dispose(); cableL = null; }
  if (t >= T_LAPTOP && t < 39.6) { const a = laptop.position.clone(), b = engine6.getWorldPosition(V(0, 0, 0)).add(V(0, 0.3, 0)); cableL = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([a, VL(a, b, 0.5).add(V(0, -0.8, 0)), b]), 16, 0.015, 3), M(0x222222)); scene.add(cableL); }
  asly.root.visible = t >= 44.2;
  { const k = easeOut(seg(t, 44.2, 45.4)); asly.root.position.copy(VL(V(-3.6, 0, 1.6), AS_P, k)); asly.root.rotation.set(0, lerp(1.2, 0.9, k), 0); if (t >= 49.2) asly.root.rotation.y = 1.4; }
  const sz = poseAt(t, KEYS.asly); if (t >= 44.2 && t < 45.4) { const w = Math.sin(t * 9); sz.lL = w * 0.4; sz.lR = -w * 0.4; } if ((t >= 44.6 && t < 48.9) || (t >= 54.6 && t < 56.8)) { sz.aRz += Math.sin(t * 14) * 0.2; }
  applyPose(asly, sz);
  { const hp = asly.arms[1].hand.getWorldPosition(V(0, 0, 0)); wrench.position.copy(hp).add(V(0, 0.2, 0)); wrench.rotation.set(0, asly.root.rotation.y, 0.3 + (t >= 44.6 && t < 56.8 ? Math.sin(t * 14) * 0.4 : 0)); wrench.visible = asly.root.visible; }
  // El-Gazzar: lying on the creeper under the blue car, slides out at 49.2; slides under the tuk-tuk to fix it
  gazzar.root.visible = t >= 48.6;
  let cp = V(2.3, 0, -2.2), crot = 0.0;
  if (t >= 48.6 && t < 50.2) { const k = easeOut(seg(t, 48.6, 50.2)); cp = VL(V(2.3, 0, -3.3), V(2.3, 0, -1.4), k); }
  if (t >= 50.2) cp = V(2.3, 0, -1.4);
  if (t >= 59.4) { const k = easeInOut(seg(t, 59.4, 60.2)); cp = VL(V(2.3, 0, -1.4), TUK_P.clone().add(V(0, 0, 0.3)), k); }
  if (t >= T_START) cp = TUK_P.clone().add(V(0, 0, 1.3));
  creeper.position.copy(cp); creeper.rotation.y = crot; creeper.visible = gazzar.root.visible;
  gazzar.root.position.copy(cp).add(V(0, 0.16, 0.6)); gazzar.root.rotation.set(-Math.PI / 2, 0, 0); gazzar.root.rotation.order = 'XYZ';
  const gz = poseAt(t, KEYS.gazzar); Object.assign(gz, { y: 0, lL: 0, lR: 0 });
  if (t >= 50.2 && t < 59.4) { gazzar.root.rotation.set(-Math.PI / 2 + 0.9, 0, 0); } // propped up on an elbow, chilling
  if (t >= 60.1 && t < T_START) { gz.aLz = 1.2 + Math.sin(t * 30) * 0.4; gz.aRz = 1.2 + Math.cos(t * 30) * 0.4; }
  if (t >= T_START) { gazzar.root.rotation.set(-Math.PI / 2 + 1.2, 0, 0); Object.assign(gz, { aRz: 2.3, eR: 0.4, tr: 1 }); }
  applyPose(gazzar, gz);
  { const hp = gazzar.arms[0].hand.getWorldPosition(V(0, 0, 0)); teaG.position.copy(hp).add(V(0, 0.06, 0)); teaG.visible = gazzar.root.visible && t < 59.4; }

  // ---- particles ----
  const puffs = [];
  if (t >= T_LAND - 0.1 && t < T_LAND + 0.8) { const k = seg(t, T_LAND - 0.1, T_LAND + 0.8); for (let i = 0; i < 10; i++) { const a = i / 10 * 6.28; puffs.push({ pos: TUK_P.clone().add(V(Math.cos(a) * k * 1.8, 0.2 + k * 0.4, Math.sin(a) * k * 1.4)), size: 0.3 + k * 0.7, op: (1 - k) * 0.6, color: 0xb0b0b0 }); } }
  if (t >= T_START && t < T_LAUNCH + 2.5) { const base = engine6.getWorldPosition(V(0, 0, 0)); for (let i = 0; i < 14; i++) { const ph = (t * 1.5 + i / 14) % 1; puffs.push({ pos: base.clone().add(V(0.4 + ph * 1.2, 0.4 + ph, (hash(i) - .5) * ph)), size: 0.3 + ph * 0.8, op: (1 - ph) * 0.6, color: 0x666666 }); } }
  emit(puffs, puffPool);
  const sparks = [];
  if (t >= T_FIX && t < T_START) { const p0 = TUK_P.clone().add(V(0, 0.3, 0.4)); for (let i = 0; i < 10; i++) { const k = (t * 3 + i / 10) % 1; sparks.push({ pos: p0.clone().add(V((hash(i) - .5) * k * 1.2, k * 0.8, (hash(i + 2)) * k * 0.6)), size: 0.12 * (1 - k), rot: i }); } }
  if (t >= T_LAUNCH - 0.3) { const base = engine6.getWorldPosition(V(0, 0, 0)); const q = tuk.getWorldQuaternion(new THREE.Quaternion()); const dir = V(1, 0, 0).applyQuaternion(q); for (let i = 0; i < 12; i++) { const ph = (t * 3.5 + i / 12) % 1; sparks.push({ pos: base.clone().add(dir.clone().multiplyScalar(0.4 + ph * 2.0)), size: 0.3 * (1 - ph) + 0.05, rot: i, color: 0xffa020 }); } }
  emit(sparks, starPool);
  const sw = [];
  if (t >= 28.5 && t < 44.3) { const hd = alamy.head.getWorldPosition(V(0, 0, 0)); for (let i = 0; i < 2; i++) { const k = (t * 1.0 + i * 0.5) % 1; sw.push({ pos: hd.clone().add(V((i ? 1 : -1) * 0.27, 0.18 - k * 0.5, 0)), size: 0.07, op: 1 - k }); } }
  emit(sw, sweatPool); emit([], trailPool);

  // ---- faces ----
  let be = 'wide', bm = talkMouth(t, 'bastam', 'scream') || 'closed';
  if (t >= 4.66 && t < 10) be = 'normal'; if (t >= 10 && t < 12.9) be = 'side'; if (t >= 19.4 && t < 61.8) { be = 'normal'; if (bm === 'closed') bm = 'flat'; }
  if (t >= 61.8) { be = 'pin'; bm = 'scream'; }
  let ae = 'smug', am = talkMouth(t, 'alamy') || 'smile';
  if (t >= 27.0 && t < 32.3) { ae = 'wide'; if (am === 'smile') am = 'o'; } if (t >= 32.3 && t < 39.6) { ae = 'angry'; if (am === 'smile') am = 'flat'; } if (t >= 39.6) { ae = 'flat'; if (am === 'smile') am = 'flat'; }
  let se = 'angry', sm = talkMouth(t, 'asly', 'scream') || 'clench'; if (t >= 49.2 && t < 54.6) { sm = 'clench'; } if (t >= T_START) { se = 'pin'; sm = 'o'; }
  let ge = 'tired', gm = talkMouth(t, 'gazzar') || 'smile'; if (t >= T_START) { ge = 'closed'; gm = 'grin'; }
  let de = 'smug', dm = talkMouth(t, 'dad') || 'grin';
  if (t >= 13.15 && t < 15.6) de = 'side'; if (t >= 21.4 && t < 28.5) { de = 'pin'; if (dm === 'grin') dm = 'o'; } if (t >= 37.25 && t < 39.3) { de = 'side'; } if (t >= 44.6) { de = 'pin'; if (dm === 'grin') dm = 'wobble'; } if (t >= T_LAUNCH) { de = 'sparkle'; dm = 'grin'; }
  bastam.faceMat.map = faceTexture(be, bm, { fuzz: true }); bastam.faceMat.needsUpdate = true;
  alamy.faceMat.map = faceTexture(ae, am, { fuzz: true }); alamy.faceMat.needsUpdate = true;
  asly.faceMat.map = faceTexture(se, sm, { stache: true, red: t >= 44.6 && t < 57 }); asly.faceMat.needsUpdate = true;
  gazzar.faceMat.map = faceTexture(ge, gm, { fuzz: true }); gazzar.faceMat.needsUpdate = true;
  dad.faceMat.map = faceTexture(de, dm, { stache: true }); dad.faceMat.needsUpdate = true;
}

function cameraAt(t) {
  if (t < 1.0) { cam(V(6.2, 3.2, 5.2), V(0.4, 1.0, -1.0), 58); }
  else if (t < 3.0) { faceCam(bastam, 1.7, 0.3, 0.05, 50, 0.1); }
  else if (t < 5.9) { cam(V(-1.2, 1.6, 3.8), V(3.8, 1.3, -0.4), 56); }
  else if (t < 10.0) { faceCam(dad, 1.8, 0.4, 0.05, 50, 0.15); }
  else if (t < 13.15) { faceCam(bastam, 1.4, -0.3, 0.05, 48, 0.1); }
  else if (t < 15.85) { faceCam(dad, 1.4, -0.3, 0.05, 46, 0.1); }
  else if (t < 19.6) { faceCam(bastam, 1.6, 0.4, 0.05, 50, 0.1); }
  else if (t < 21.4) { faceCam(dad, 1.4, 0.2, 0.05, 46, 0.1); }
  else if (t < T_LAPTOP) { faceCam(alamy, 2.6, 0.5, 0.2, 54, 0.45); }
  else if (t < 28.55) { const hd = alamy.head.getWorldPosition(V(0, 0, 0)); const f = alamy.root.getWorldDirection(V(0, 0, 0)); f.y = 0; f.normalize(); const rt = V(f.z, 0, -f.x); cam(hd.clone().add(f.clone().multiplyScalar(-0.3)).add(rt.multiplyScalar(0.55)).add(V(0, 0.25, 0)), laptop.position.clone().add(V(0, 0.12, 0)), 46); }
  else if (t < 32.3) { faceCam(dad, 1.3, -0.75, 0.1, 50, 0.12); }
  else if (t < 37.25) { const k = seg(t, 32.3, 37.25); if (k < 0.5) { const hd = alamy.head.getWorldPosition(V(0, 0, 0)); const f = alamy.root.getWorldDirection(V(0, 0, 0)); f.y = 0; f.normalize(); const rt = V(f.z, 0, -f.x); cam(hd.clone().add(f.clone().multiplyScalar(-0.3)).add(rt.multiplyScalar(0.55)).add(V(0, 0.25, 0)), laptop.position.clone().add(V(0, 0.12, 0)), 44); } else faceCam(alamy, 1.3, 0.3, 0.05, 46, 0.1); }
  else if (t < 39.6) { faceCam(dad, 1.3, -0.75, 0.1, 48, 0.1); }
  else if (t < 41.3) { faceCam(alamy, 1.2, -0.2, 0.05, 44, 0.08); }
  else if (t < 44.6) { faceCam(dad, 1.3, -0.75, 0.1, 48, 0.1); }
  else if (t < 49.2) { faceCam(asly, 2.1, 0.3, 0.0, 52, 0.15); camera.position.add(shake(t, 0.025, 25)); }
  else if (t < 54.6) { const hd = gazzar.head.getWorldPosition(V(0, 0, 0)); cam(hd.clone().add(V(-1.1, 0.4, 0.9)), hd.clone().add(V(0, -0.05, 0)), 48); }
  else if (t < 57.1) { faceCam(asly, 1.7, -0.3, 0.0, 50, 0.1); camera.position.add(shake(t, 0.02, 25)); }
  else if (t < T_FIX) { const hd = gazzar.head.getWorldPosition(V(0, 0, 0)); cam(hd.clone().add(V(-0.9, 0.35, 0.8)), hd.clone().add(V(0, -0.05, 0)), 46); }
  else if (t < T_LAUNCH) { cam(V(-1.6, 1.4, 3.2).add(shake(t, t > T_START ? 0.04 : 0.01, 25)), TUK_P.clone().add(V(0, 0.8, 0)), 54); }
  else if (t < T_RES) { cam(V(-1.0, 1.7, 4.6).add(shake(t, 0.06 * (1 - seg(t, T_LAUNCH, T_RES)), 25)), tuk.position.clone().add(V(0, 0.8, 0)), 56); }
  else { const k = easeInOut(seg(t, T_RES, 76.0)); cam(VL(V(-2.6, 2.2, 5.0), V(-3.4, 2.8, 6.2), k), V(1.2, 1.0, -0.8), 56); }
}

// =====================================================================
const NAMES = { bastam: ['بستم', 'BASTAM', '#2f5fb0'], alamy: ['العالمي', 'EL-ALAMY', '#d8231b'], asly: ['الأصلي', 'EL-ASLY', '#6a6a6a'], gazzar: ['الجزار', 'EL-GAZZAR', '#4a4a38'], dad: ['إبراهيم', 'IBRAHIM', '#c9a227'] };
function portrait(g, x, y, who, t) {
  g.fillStyle = '#123'; g.fillRect(x, y, 64, 64); g.strokeStyle = '#fff'; g.lineWidth = 2; g.strokeRect(x, y, 64, 64);
  g.save(); g.beginPath(); g.rect(x + 2, y + 2, 60, 60); g.clip();
  const skin = { bastam: '#b07a50', alamy: '#c08a60', asly: '#a86a40', gazzar: '#a87048', dad: '#b27448' }[who];
  const shirt = { bastam: '#2f5fb0', alamy: '#1c2440', asly: '#6a6a6a', gazzar: '#4a4a38', dad: '#f3f0e3' }[who];
  g.fillStyle = shirt; g.fillRect(x + 8, y + 54, 48, 10); g.fillStyle = skin; g.beginPath(); g.arc(x + 32, y + 36, who === 'asly' ? 23 : 20, 0, 7); g.fill();
  if (who === 'bastam') { g.fillStyle = '#d8231b'; g.beginPath(); g.arc(x + 32, y + 26, 21, Math.PI, 0); g.fill(); }
  if (who === 'alamy') { g.fillStyle = '#f6f6f2'; g.beginPath(); g.moveTo(x + 26, y + 54); g.lineTo(x + 38, y + 54); g.lineTo(x + 32, y + 64); g.fill(); g.fillStyle = '#15100b'; g.fillRect(x + 12, y + 14, 40, 7); g.fillRect(x + 22, y + 9, 22, 7); }
  if (who === 'gazzar') { g.fillStyle = '#120c08'; for (let i = 0; i < 6; i++) { g.beginPath(); g.arc(x + 14 + i * 7, y + 18 + (i % 2) * 3, 8, 0, 7); g.fill(); } g.fillStyle = '#d8231b'; g.fillRect(x + 10, y + 22, 44, 4); }
  if (who === 'dad') { g.fillStyle = '#1b1410'; g.fillRect(x + 10, y + 30, 5, 12); g.fillRect(x + 49, y + 30, 5, 12); g.fillStyle = '#c9a227'; g.fillRect(x + 14, y + 16, 36, 5); }
  const fc = document.createElement('canvas'); fc.width = 32; fc.height = 32; const fg = fc.getContext('2d');
  const e = envAt(t); const mouth = speakerAt(t) === who ? (e < 0.1 ? 'closed' : e < 0.4 ? 'talk1' : 'talk2') : 'closed';
  const eyes = { bastam: 'wide', alamy: 'smug', asly: 'angry', gazzar: 'tired', dad: 'smug' }[who];
  drawFace(fg, 32, eyes, mouth, { stache: who === 'dad' || who === 'asly', fuzz: who === 'bastam' || who === 'gazzar' || who === 'alamy' });
  g.imageSmoothingEnabled = false; g.drawImage(fc, x + 14, y + 20, 36, 36); g.restore();
}
const INTROS = [
  [1.1, 'بستم', 'BASTAM', 'مدير الفنيين', [['VOLUME', 10, '#3df05a'], ['TECH', 0, '#ff3a3a']], '#2f5fb0'],
  [21.6, 'العالمي', 'EL-ALAMY', 'مدير المركز', [['TECH', 10, '#3df05a'], ['PATIENCE', 1, '#ff3a3a']], '#d8231b'],
  [44.7, 'الأصلي', 'EL-ASLY', 'فني كهربا', [['ANGER', 10, '#ff3a3a'], ['VOLTAGE', 9, '#ffd400']], '#6a6a6a'],
  [49.4, 'الجزار', 'EL-GAZZAR', 'ميكانيكي', [['SKILL', 10, '#3df05a'], ['SPEED', 1, '#9fd0ff']], '#7a7a50'],
];
function drawIntros(g, t) {
  INTROS.forEach(([t0, ar, en, role, stats, col]) => {
    const a = t - t0; if (a < 0 || a > 2.8) return;
    const kin = easeOut(clamp(a / 0.25)), kout = a > 2.5 ? seg(a, 2.5, 2.8) : 0;
    const x = lerp(-420, 20, kin) - kout * 440, y = 90;
    g.save(); g.translate(x, y); g.transform(1, 0, -0.18, 1, 0, 0);
    g.fillStyle = 'rgba(0,0,0,0.85)'; g.fillRect(0, 0, 360, 140); g.fillStyle = col; g.fillRect(0, 0, 360, 8); g.fillRect(0, 132, 360, 8);
    g.restore();
    arText(g, ar, x + 330, y + 6, 44, '#ffe14a', 'right', 'ReemKufi'); pxText(g, en, x + 24, y + 22, 12, '#fff');
    arText(g, role, x + 330, y + 58, 22, '#9fd0ff', 'right');
    stats.forEach(([lbl, n, c], i) => { const yy = y + 92 + i * 22; pxText(g, lbl, x + 14, yy, 8, '#fff'); for (let b = 0; b < 10; b++) { g.fillStyle = b < n ? c : '#333'; g.fillRect(x + 120 + b * 18, yy - 2, 14, 12); } });
  });
}
function drawAnger(g, t) {
  if (t < 44.6 || t >= T_LAUNCH) return; const v = clamp(seg(t, 44.6, 56.8) * 1.1);
  const x = W - 210, y = 14; g.fillStyle = 'rgba(40,0,0,0.85)'; g.fillRect(x, y, 196, 52); g.strokeStyle = '#ff3a3a'; g.lineWidth = 2; g.strokeRect(x, y, 196, 52);
  arText(g, 'غضب الأصلي', x + 188, y + 2, 16, '#fff'); pxText(g, 'RAGE', x + 8, y + 8, 8, '#ff9a4a');
  g.fillStyle = '#333'; g.fillRect(x + 8, y + 32, 180, 12); g.fillStyle = v > 0.9 ? (Math.floor(t * 8) % 2 ? '#ff2020' : '#ffd400') : '#ff5a2a'; g.fillRect(x + 8, y + 32, 180 * Math.min(1, v), 12);
  if (v > 0.9) pxText(g, 'MAX', x + 150, y + 8, 8, '#ffd400');
}
function drawTitle(g, t) {
  if (t >= 1.0) return; g.fillStyle = 'rgba(0,0,0,0.6)'; g.fillRect(0, 196, W, 76);
  arText(g, 'مركز الصيانة', W / 2, 198, 40, '#ffe14a', 'center', 'ReemKufi'); pxText(g, 'THE SERVICE CENTER', W / 2, 250, 10, '#fff', 'center');
}
function drawFix(g, t) {
  if (t >= T_FIX && t < T_START) { pxText(g, 'FIXING...', W / 2, 120, 18, '#ffe14a', 'center'); const p = seg(t, T_FIX, T_START - 0.1); g.fillStyle = '#333'; g.fillRect(W / 2 - 120, 150, 240, 14); g.fillStyle = '#3df05a'; g.fillRect(W / 2 - 120, 150, 240 * p, 14); }
  if (t >= T_START && t < T_LAUNCH) { const k = easeBack(seg(t, T_START, T_START + 0.2)); g.save(); g.translate(W / 2, 140); g.scale(k, k); pxText(g, 'FIXED!', 0, -16, 26, '#3df05a', 'center'); arText(g, 'في ثانية!', 0, 14, 26, '#fff', 'center'); g.restore(); }
  if (t >= T_LAUNCH && t < T_RES) { if (Math.floor(t * 6) % 2) pxText(g, 'LIFT OFF!', W / 2, 110, 24, '#ffe14a', 'center'); }
}
function drawResult(g, t) {
  if (t < T_RES || t >= T_ENDC + 0.2) return; const a = t - T_RES;
  const k = easeOut(clamp(a / 0.3)); const y = lerp(-90, 24, k);
  g.fillStyle = 'rgba(20,20,30,0.95)'; g.fillRect(50, y, W - 100, 84); g.strokeStyle = '#3df05a'; g.lineWidth = 3; g.strokeRect(50, y, W - 100, 84);
  pxText(g, 'NEW AREA UNLOCKED', 70, y + 14, 12, '#3df05a', 'left', false); arText(g, 'مركز الصيانة', W - 70, y + 26, 32, '#fff');
  pxText(g, 'THE SERVICE CENTER', 70, y + 56, 9, '#9fd0ff', 'left', false);
  if (a > 3.8) { const k2 = easeBack(seg(t, T_RES + 3.8, T_RES + 4.05)); g.save(); g.translate(W / 2, 190); g.scale(k2, k2); g.fillStyle = 'rgba(0,0,30,0.85)'; g.fillRect(-220, -34, 440, 70); pxText(g, 'BASTAM: STILL FLYING', 0, -24, 12, '#ffd400', 'center'); arText(g, 'بستم: لسه طاير', 0, -6, 28, '#fff', 'center'); g.restore(); }
}
function drawEnd(g, t) {
  const a = t - T_ENDC; if (a < 0) return; const k = easeOut(clamp(a / 0.4));
  g.fillStyle = `rgba(0,0,0,${0.55 * k})`; g.fillRect(0, 0, W, H);
  g.save(); g.translate(W / 2, 190); g.scale(k, k); arText(g, 'يُتبع...', 0, -40, 54, '#ffe14a', 'center', 'ReemKufi'); pxText(g, 'TO BE CONTINUED', 0, 30, 16, '#fff', 'center'); g.restore();
}
window.renderFrame = function (t) {
  stateAt(t); cameraAt(t);
  renderer.render(scene, camera);
  ctx.clearRect(0, 0, W, H); ctx.drawImage(glCanvas, 0, 0);
  h.clearRect(0, 0, W, H);
  drawIntros(h, t); drawAnger(h, t); drawFix(h, t); drawResult(h, t); drawDialogue(h, t); drawEnd(h, t); drawTitle(h, t);
  ctx.drawImage(hud, 0, 0); vignette(ctx, 0.3);
  if (t >= T_LAND && t < T_LAND + 0.06) { ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.fillRect(0, 0, W, H); }
  if (t >= T_LAUNCH && t < T_LAUNCH + 0.07) { ctx.fillStyle = 'rgba(255,240,200,0.8)'; ctx.fillRect(0, 0, W, H); }
  return true;
};
window.frameData = () => out.toDataURL('image/png');
window.DUR = DUR;
document.fonts.load('10px PS2P').then(() => document.fonts.load('20px Lalezar', 'ع')).then(() => document.fonts.load('700 20px ReemKufi', 'ع')).then(() => {
  const c = signT.image.getContext('2d'); c.fillStyle = '#d8231b'; c.fillRect(0, 0, 160, 32); c.fillStyle = '#fff'; c.fillRect(0, 0, 160, 3); c.fillRect(0, 29, 160, 3); c.font = '18px Lalezar'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.direction = 'rtl'; c.fillText('مركز العالمي لصيانة السيارات', 80, 16); signT.needsUpdate = true;
  const m1 = mashallahTex.image.getContext('2d'); m1.fillStyle = '#d8231b'; m1.fillRect(0, 0, 64, 20); m1.fillStyle = '#ffe14a'; m1.font = '13px Lalezar'; m1.textAlign = 'center'; m1.textBaseline = 'middle'; m1.direction = 'rtl'; m1.fillText('ما شاء الله', 32, 11); mashallahTex.needsUpdate = true;
  window.READY = true;
});
