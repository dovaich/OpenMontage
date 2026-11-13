// الشبشب — FINAL BOSS. Deterministic low-poly Y2K console cutscene.
// Same engine family as "Jet Dishwasher 3000": window.renderFrame(t) draws frame t into #out.
import * as THREE from 'three';

const W = 540, H = 960;
const DUR = 34.7;
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

// ===== El-Alamy — current look (for future episodes) =====
// Black moto leather jacket (band collar + snap, quilted shoulders) open over a black turtleneck,
// slim grey trousers, black shoes, tall black pompadour with faded sides, clean-shaven.
// Needs engine8 globals (makeChar, mesh, box, cyl, M, P). Face opts: ALAMY_FACE.
const ALAMY_FACE = {}; // clean-shaven
function makeAlamy(parent) {
  const JACKET = 0x151518, KNIT = 0x101013, SILVER = 0xb9bcc4, HAIR = 0x0c0a09;
  const c = makeChar({ seed: 71, skin: 0xb98258, hipY: 0.86, legX: 0.11, legColor: 0x5a5d64, shoe: 0x0c0c10, hand: 0xb98258,
    torsoGeo: cyl(0.25, 0.22, 0.64, 8), torsoTex: null, torsoColor: JACKET, torsoY: 0.32, sleeve: true, sleeveColor: JACKET,
    shoulderX: 0.31, shoulderY: 0.57, neckY: 0.64, headR: 0.27,
    build(head, torso, reg) {
      // pompadour: dark cap, tall swept-up volume, faded sides
      const hair = reg(M(HAIR));
      const cap = mesh(new THREE.SphereGeometry(0.286, 10, 6, 0, Math.PI * 2, 0, Math.PI * 0.5), hair, 0, 0.0, -0.01, head); cap.rotation.x = -0.4;
      const vol = mesh(new THREE.SphereGeometry(0.17, 8, 5), hair, 0, 0.215, 0.0, head); vol.scale.set(1.5, 0.45, 1.4);
      const swoop = mesh(new THREE.SphereGeometry(0.12, 8, 5), hair, 0, 0.235, 0.13, head); swoop.scale.set(1.75, 0.5, 1.0); swoop.rotation.x = -0.35;
      for (const sx of [-1, 1]) mesh(box(0.02, 0.12, 0.22), hair, sx * 0.272, 0.04, -0.04, head); // short sides, same color
      // black turtleneck under the open jacket
      mesh(box(0.17, 0.5, 0.02), reg(M(KNIT)), 0, 0.36, 0.236, torso);
      mesh(cyl(0.125, 0.135, 0.13, 8), reg(M(KNIT)), 0, 0.68, 0, torso);
      // open zip edges
      for (const sx of [-1, 1]) mesh(box(0.016, 0.56, 0.03), reg(M(SILVER)), sx * 0.092, 0.33, 0.245, torso);
      // moto band collar (stands up, open at the front) + one snap
      mesh(box(0.3, 0.08, 0.04), reg(P(JACKET, { shininess: 80, specular: 0x777777 })), 0, 0.66, -0.13, torso);
      for (const sx of [-1, 1]) { const b = mesh(box(0.04, 0.08, 0.2), reg(P(JACKET, { shininess: 80, specular: 0x777777 })), sx * 0.15, 0.66, 0.05, torso); b.rotation.y = sx * -0.35; }
      mesh(box(0.03, 0.03, 0.02), reg(M(SILVER)), 0.14, 0.66, 0.16, torso);
      // ribbed hem
      mesh(box(0.46, 0.05, 0.03), reg(M(0x111114)), 0, 0.03, 0.215, torso);
      return {};
    } }, parent);
  // shiny leather on the body and full-length sleeves, quilted shoulder ribs, cuffs
  const leather = () => { const m = P(JACKET, { shininess: 50, specular: 0x404048 }); m.userData.orig = m.color.clone(); c.mats.push(m); return m; };
  c.torsoMesh.material = leather();
  for (const a of c.arms) {
    a.sh.children[0].material = leather();
    a.el.children[0].material = leather();
    for (const y of [-0.04, -0.08, -0.12]) mesh(box(0.136, 0.012, 0.136), M(0x0a0a0c), 0, y, 0, a.sh);
    mesh(box(0.125, 0.04, 0.125), M(0x111114), 0, -0.3, 0, a.el);
  }
  c.legs.forEach(l => { l.userData.shoe.material = P(0x0c0c10, { shininess: 140, specular: 0xffffff }); });
  return c;
}

// ===== Abu Samir's car: a 1980 «١٢٨» (Egyptian Fiat 128), reusable =====
// Scale: characters are ~1.9 units tall (≈ 1.75 m), so 1 unit ≈ 0.92 m.
// Car: length 4.0 (≈ 3.7 m), width 1.75, height 1.45 (≈ 1.35 m), like the real car next to a person.
// Look: mustard-orange body + white roof, chrome bumpers, whitewall tyres, one cream (replaced) door, rust patches,
// duct tape, a roof rack (rolled carpet + butane cylinder), fuzzy dice, a blue evil-eye charm, «ما شاء الله» sticker, plate «س م ر ١٩٨٠».
// Needs engine8 globals (mesh, box, cyl, M, P, canvasTex). Front faces local +x.
function makeSamirCar(parent) {
  const g = new THREE.Group(); parent.add(g);
  const body = P(0xe8a020, { shininess: 70 }), roofC = P(0xf4f0e6, { shininess: 60 }), chrome = P(0xe0e0e8, { shininess: 140, specular: 0xffffff });
  const glass = new THREE.MeshPhongMaterial({ color: 0x9fc8e0, transparent: true, opacity: 0.55, shininess: 120 });
  const L = 4.0, Wd = 1.75;
  // lower body (boxy 128 shape) + hood + trunk slopes
  mesh(box(L, 0.55, Wd), body, 0, 0.6, 0, g);
  mesh(box(L - 0.1, 0.06, Wd - 0.05), M(0x2a2a2a), 0, 0.32, 0, g); // sill shadow
  // cabin
  mesh(box(2.0, 0.08, Wd - 0.12), roofC, -0.2, 1.42, 0, g);
  for (const [x, z] of [[0.75, 0.78], [0.75, -0.78], [-1.15, 0.78], [-1.15, -0.78]]) mesh(box(0.08, 0.55, 0.08), roofC, x, 1.13, z, g);
  mesh(box(1.9, 0.52, Wd - 0.16), glass, -0.2, 1.13, 0, g);
  const ws = mesh(box(0.06, 0.6, Wd - 0.2), glass, 0.86, 1.12, 0, g); ws.rotation.z = -0.35;
  // replaced cream front-left door + rust + tape
  mesh(new THREE.PlaneGeometry(0.95, 0.5), M(0xece0c0), 0.25, 0.62, Wd / 2 + 0.006, g);
  for (const [x, y, s] of [[-1.4, 0.5, 0.3], [1.5, 0.42, 0.22], [-0.6, 0.38, 0.18]]) mesh(new THREE.PlaneGeometry(s, s * 0.6), M(0x8a4a22), x, y, Wd / 2 + 0.008, g);
  for (const [x, y, s] of [[-1.0, 0.5, 0.28], [1.2, 0.45, 0.2]]) { const r = mesh(new THREE.PlaneGeometry(s, s * 0.6), M(0x8a4a22), x, y, -Wd / 2 - 0.008, g); r.rotation.y = Math.PI; }
  for (let i = 0; i < 2; i++) mesh(box(0.05, 0.57, Wd + 0.02), P(0xc9ccd1), 1.0 + i * 0.3, 0.6, 0, g);
  // wheels: black + whitewall + chrome hub
  const wheels = [];
  for (const [x, z] of [[-1.25, 0.82], [1.25, 0.82], [-1.25, -0.82], [1.25, -0.82]]) {
    const w = new THREE.Group(); w.position.set(x, 0.32, z); w.rotation.x = Math.PI / 2; g.add(w);
    mesh(cyl(0.32, 0.32, 0.2, 14), M(0x111111), 0, 0, 0, w); mesh(cyl(0.2, 0.2, 0.21, 14), M(0xf4f4f4), 0, 0, 0, w); mesh(cyl(0.12, 0.12, 0.22, 10), chrome, 0, 0, 0, w); wheels.push(w);
  }
  for (const x of [-1.25, 1.25]) for (const z of [-1, 1]) mesh(box(0.85, 0.12, 0.08), body, x, 0.68, z * (Wd / 2 + 0.03), g); // wheel arches
  // chrome bumpers + grille + round headlamps + tail lights
  for (const x of [L / 2 + 0.05, -L / 2 - 0.05]) mesh(box(0.1, 0.14, Wd + 0.08), chrome, x, 0.42, 0, g);
  mesh(box(0.02, 0.22, 0.8), M(0x222222), L / 2 + 0.005, 0.66, 0, g);
  for (let i = 0; i < 4; i++) mesh(box(0.025, 0.02, 0.78), chrome, L / 2 + 0.012, 0.58 + i * 0.05, 0, g);
  const lamps = [];
  for (const z of [-0.62, 0.62]) { lamps.push(mesh(new THREE.CircleGeometry(0.13, 12), new THREE.MeshBasicMaterial({ color: 0xfff6c0 }), L / 2 + 0.012, 0.68, z, g)); lamps[lamps.length - 1].rotation.y = Math.PI / 2; mesh(new THREE.TorusGeometry(0.13, 0.02, 4, 12), chrome, L / 2 + 0.01, 0.68, z, g).rotation.y = Math.PI / 2; }
  for (const z of [-0.62, 0.62]) mesh(box(0.02, 0.14, 0.26), new THREE.MeshBasicMaterial({ color: 0xd8231b }), -L / 2 - 0.005, 0.7, z, g);
  // plate + sticker
  const plateT = canvasTex(64, 20, (c) => { c.fillStyle = '#f0f0f0'; c.fillRect(0, 0, 64, 20); c.fillStyle = '#1f5fd8'; c.fillRect(0, 0, 64, 5); });
  const plate = mesh(new THREE.PlaneGeometry(0.42, 0.13), new THREE.MeshBasicMaterial({ map: plateT }), L / 2 + 0.11, 0.42, 0, g); plate.rotation.y = Math.PI / 2;
  const stickT = canvasTex(64, 20, (c) => { c.fillStyle = '#d8231b'; c.fillRect(0, 0, 64, 20); });
  const stick = mesh(new THREE.PlaneGeometry(0.6, 0.19), new THREE.MeshBasicMaterial({ map: stickT }), -L / 2 - 0.006, 0.62, 0, g); stick.rotation.y = -Math.PI / 2;
  // roof rack: rolled carpet + butane cylinder
  for (const x of [-0.8, 0.4]) mesh(box(0.05, 0.08, Wd - 0.2), chrome, x, 1.5, 0, g);
  mesh(box(1.6, 0.04, 0.05), chrome, -0.2, 1.54, 0.7, g); mesh(box(1.6, 0.04, 0.05), chrome, -0.2, 1.54, -0.7, g);
  const carpet = mesh(cyl(0.16, 0.16, 1.5, 10), M(0xb8342a), -0.3, 1.66, 0.2, g); carpet.rotation.x = Math.PI / 2;
  for (let i = 0; i < 3; i++) { const s = mesh(cyl(0.165, 0.165, 0.06, 10), M(0xf0d070), -0.3, 1.66, -0.4 + i * 0.4, g); s.rotation.x = Math.PI / 2; }
  mesh(cyl(0.16, 0.16, 0.5, 10), P(0x2f6fd8), 0.15, 1.78, -0.45, g).rotation.z = Math.PI / 2;
  // mirror charm (blue evil eye) + fuzzy dice
  const charm = mesh(new THREE.CircleGeometry(0.06, 10), M(0x1f5fd8, { side: THREE.DoubleSide }), 0.55, 1.15, 0, g); charm.rotation.y = Math.PI / 2;
  for (const dz of [-0.06, 0.06]) mesh(box(0.08, 0.08, 0.08), M(0xff5fa8), 0.6, 1.25 - Math.abs(dz) * 2, dz, g);
  // hood (hinged at the windshield) + engine bay with the taped wiring
  const hood = new THREE.Group(); hood.position.set(0.9, 0.88, 0); g.add(hood); mesh(box(1.12, 0.05, Wd - 0.06), body, 0.56, 0, 0, hood);
  const bay = new THREE.Group(); bay.position.set(1.4, 0.6, 0); g.add(bay);
  mesh(box(0.7, 0.12, 1.1), M(0x2a2a2a), 0, 0, 0, bay); mesh(box(0.45, 0.16, 0.5), M(0x555555), -0.05, 0.1, 0, bay);
  const wires = []; for (let i = 0; i < 5; i++) wires.push(mesh(box(0.6, 0.025, 0.025), M([0xd8231b, 0xffd400, 0x1f5fd8, 0x3df05a, 0xffffff][i]), 0, 0.2, -0.3 + i * 0.15, bay));
  for (let i = 0; i < 3; i++) mesh(box(0.07, 0.04, 0.8), P(0xc9ccd1), -0.15 + i * 0.15, 0.22, 0, bay);
  const late = () => { const c1 = plateT.userData.g; c1.fillStyle = '#f0f0f0'; c1.fillRect(0, 5, 64, 15); c1.fillStyle = '#111'; c1.font = '12px Lalezar'; c1.textAlign = 'center'; c1.textBaseline = 'middle'; c1.direction = 'rtl'; c1.fillText('س م ر ١٩٨٠', 32, 13); plateT.needsUpdate = true;
    const c2 = stickT.userData.g; c2.fillStyle = '#d8231b'; c2.fillRect(0, 0, 64, 20); c2.fillStyle = '#ffe14a'; c2.font = '13px Lalezar'; c2.textAlign = 'center'; c2.textBaseline = 'middle'; c2.direction = 'rtl'; c2.fillText('ما شاء الله', 32, 11); stickT.needsUpdate = true; };
  return { g, hood, bay, wires, wheels, lamps, late, L, Wd };
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
const NAMES = { son: ['حمادة', 'HAMADA', '#d4141c'], dad: ['إبراهيم', 'IBRAHIM', '#c9a227'], mom: ['أم حمادة', 'OM HAMADA', '#1f9e5a'], samir: ['أبو سمير', 'ABU SAMIR', '#6a6f78'], bastam: ['بستم', 'BESTEM', '#2f5fb0'], alamy: ['العالمي', 'EL-ALAMY', '#151518'], asly: ['الأصلي', 'EL-ASLY', '#6a6a6a'], gazzar: ['الجزار', 'EL-GAZZAR', '#4a4a38'] };
function portrait(g, x, y, who, t, S = 64) {
  const u = S / 64; g.save(); g.translate(x, y); g.scale(u, u);
  g.fillStyle = '#123'; g.fillRect(0, 0, 64, 64); g.strokeStyle = '#fff'; g.lineWidth = 2; g.strokeRect(0, 0, 64, 64);
  g.beginPath(); g.rect(2, 2, 60, 60); g.clip();
  const skin = { son: '#b98058', dad: '#b27448', mom: '#c98d5f', samir: '#c8946a', bastam: '#b07a50', alamy: '#c08a60', asly: '#a86a40', gazzar: '#a87048' }[who]; const shirt = { son: '#d4141c', dad: '#f3f0e3', mom: '#e86a8a', samir: '#8a8f96', bastam: '#2f5fb0', alamy: '#151518', asly: '#6a6a6a', gazzar: '#4a4a38' }[who];
  g.fillStyle = shirt; g.fillRect(8, 54, 48, 10);
  if (who === 'mom') { g.fillStyle = '#1f9e5a'; g.beginPath(); g.arc(32, 36, 25, 0, 7); g.fill(); }
  g.fillStyle = skin; g.beginPath(); g.arc(32, 36, 20, 0, 7); g.fill();
  if (who === 'mom') { g.fillStyle = '#1f9e5a'; g.beginPath(); g.arc(32, 30, 22, Math.PI, 0); g.fill(); }
  if (who === 'son') { g.fillStyle = '#17110c'; for (let i = 0; i < 6; i++) { g.beginPath(); g.arc(16 + i * 6.5, 19 + (i % 2) * 2, 6, 0, 7); g.fill(); } g.fillStyle = '#222'; g.fillRect(9, 30, 6, 12); g.fillRect(49, 30, 6, 12); }
  if (who === 'dad') { g.fillStyle = '#1b1410'; g.fillRect(10, 30, 5, 12); g.fillRect(49, 30, 5, 12); g.fillStyle = '#c9a227'; g.fillRect(14, 16, 36, 5); }
  if (who === 'samir') { g.fillStyle = '#ffffff'; g.beginPath(); g.arc(32, 27, 21, Math.PI, 0); g.fill(); g.fillStyle = '#f2f2f2'; g.fillRect(10, 30, 5, 10); g.fillRect(49, 30, 5, 10); }
  if (who === 'bastam') { g.fillStyle = '#d8231b'; g.beginPath(); g.arc(32, 26, 21, Math.PI, 0); g.fill(); }
  if (who === 'alamy') { g.fillStyle = '#101013'; g.fillRect(24, 50, 16, 14); g.fillStyle = '#0c0a09'; g.beginPath(); g.arc(32, 29, 20.5, Math.PI, 0); g.fill(); g.beginPath(); g.ellipse(34, 12, 15, 5, -0.1, 0, 7); g.fill(); g.fillRect(11, 28, 4, 9); g.fillRect(49, 28, 4, 9); }
  if (who === 'asly') { g.fillStyle = '#2a1a10'; g.fillRect(9, 30, 6, 12); g.fillRect(49, 30, 6, 12); }
  if (who === 'gazzar') { g.fillStyle = '#120c08'; for (let i = 0; i < 6; i++) { g.beginPath(); g.arc(14 + i * 7, 18 + (i % 2) * 3, 8, 0, 7); g.fill(); } g.fillStyle = '#d8231b'; g.fillRect(10, 22, 44, 4); }
  const fc = document.createElement('canvas'); fc.width = 32; fc.height = 32; const fg = fc.getContext('2d');
  const e = envAt(t); const mouth = speakerAt(t) === who ? (e < 0.1 ? 'closed' : e < 0.4 ? 'talk1' : 'talk2') : 'closed';
  drawFace(fg, 32, { son: 'tired', dad: 'smug', mom: 'angry', samir: 'angry', bastam: 'wide', alamy: 'smug', asly: 'angry', gazzar: 'tired' }[who] || 'default', mouth, { stache: who === 'dad' || who === 'samir' || who === 'asly', stacheColor: who === 'samir' ? '#eeeeee' : undefined, fuzz: who === 'bastam' || who === 'gazzar' });
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
// الأصلي بيشتغل — El-Asly wiring Abu Samir's car; Bestem's shout; the slipper. vertical 9:16
// line order: L01 asly(cold) L02 asly L03 bastam L04 asly L05 bastam L06 asly L07 bastam L08 alamy L09 anno
// =====================================================================
room.visible = false;
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

const G = -100; garage.position.x = G;
const lateDraw = [];
lateDraw.push(() => { const c = signT.image.getContext('2d'); c.fillStyle = '#d8231b'; c.fillRect(0, 0, 160, 32); c.fillStyle = '#fff'; c.fillRect(0, 0, 160, 3); c.fillRect(0, 29, 160, 3); c.font = '18px Lalezar'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.direction = 'rtl'; c.fillText('مركز العالمي لصيانة السيارات', 80, 16); signT.needsUpdate = true; });
const coverall = (c) => canvasTex(16, 16, (g) => { g.fillStyle = c; g.fillRect(0, 0, 16, 16); g.fillStyle = 'rgba(0,0,0,0.18)'; g.fillRect(7, 0, 2, 16); g.fillStyle = 'rgba(255,255,255,0.12)'; g.fillRect(2, 3, 4, 3); });
const bastam = makeChar({ seed: 61, skin: 0xb07a50, hipY: 0.84, legX: 0.11, legColor: 0x2f5fb0, shoe: 0x222222, hand: 0xb07a50,
  torsoGeo: cyl(0.24, 0.26, 0.64, 6), torsoTex: coverall('#2f5fb0'), torsoColor: 0xffffff, torsoY: 0.32, sleeve: true, sleeveColor: 0x2f5fb0, shoulderX: 0.3, shoulderY: 0.57, neckY: 0.64, headR: 0.27,
  build(head, torso, reg) { const cap = mesh(new THREE.SphereGeometry(0.28, 8, 4, 0, Math.PI * 2, 0, Math.PI * 0.42), reg(M(0xd8231b)), 0, 0.04, 0, head); mesh(box(0.3, 0.03, 0.2), reg(M(0xd8231b)), 0, 0.1, -0.3, head); mesh(box(0.12, 0.08, 0.02), reg(M(0xffffff)), 0.12, 0.45, 0.25, torso); return {}; } }, scene);
const asly = makeChar({ seed: 81, skin: 0xa86a40, hipY: 0.86, legX: 0.16, legColor: 0x6a6a6a, shoe: 0x222222, hand: 0xa86a40,
  torsoGeo: cyl(0.4, 0.54, 0.72, 8), torsoTex: coverall('#6a6a6a'), torsoColor: 0xffffff, torsoY: 0.34, sleeve: true, sleeveColor: 0x6a6a6a, shoulderX: 0.44, shoulderY: 0.62, neckY: 0.7, headR: 0.32,
  build(head, torso, reg) { mesh(box(0.08, 0.14, 0.26), reg(M(0x2a1a10)), 0.31, 0.0, -0.04, head); mesh(box(0.08, 0.14, 0.26), reg(M(0x2a1a10)), -0.31, 0.0, -0.04, head); mesh(cyl(0.3, 0.3, 0.06, 8), reg(M(0xffd400)), 0, -0.05, 0.52, torso).rotation.x = Math.PI / 2; return {}; } }, scene);
const gazzar = makeChar({ seed: 91, skin: 0xa87048, hipY: 0.84, legX: 0.11, legColor: 0x3a3a2a, shoe: 0x222222, hand: 0xa87048,
  torsoGeo: cyl(0.24, 0.26, 0.64, 6), torsoTex: canvasTex(16, 16, (g) => { g.fillStyle = '#4a4a38'; g.fillRect(0, 0, 16, 16); g.fillStyle = '#1a1a14'; g.fillRect(3, 5, 4, 3); g.fillRect(10, 11, 3, 2); }), torsoColor: 0xffffff, torsoY: 0.32, sleeve: true, sleeveColor: 0x4a4a38, shoulderX: 0.3, shoulderY: 0.57, neckY: 0.64, headR: 0.27,
  build(head, torso, reg) { const hair = reg(M(0x120c08)); const r = rng(14); for (let i = 0; i < 12; i++) { const a = r() * 6.28; mesh(new THREE.IcosahedronGeometry(0.1, 0), hair, Math.cos(a) * 0.2, 0.12 + r() * 0.1, Math.sin(a) * 0.18 - 0.08, head); } mesh(new THREE.TorusGeometry(0.27, 0.035, 4, 12), reg(M(0xd8231b)), 0, 0.12, 0, head).rotation.x = Math.PI / 2 - 0.1; return {}; } }, scene);

const alamy = makeAlamy(scene);
const Lx = (i) => LINES[i - 1];
const T_RW = Lx(1).t1 + 0.15, T_HOOK = T_RW + 0.6, T_ZAP = Lx(3).t0 + 0.55, T_CHASE = Lx(6).t1 - 0.2, T_BONK = Lx(7).t1 - 0.1, T_ANNO = Lx(9).t0;

// ---------- Abu Samir's car, hood up (callback) ----------
const SC = makeSamirCar(scene); SC.g.position.set(G + 0.1, 0, -1.2); SC.g.rotation.y = -0.2; SC.hood.rotation.z = 1.15; lateDraw.push(SC.late);
const BAY = () => SC.bay.getWorldPosition(V(0, 0, 0)).add(V(0, 0.25, 0));
// props: tea glass, slipper, phone, barrel landing, light
const tea = mesh(cyl(0.04, 0.035, 0.11, 6), P(0xbf5a1a, { transparent: true, opacity: 0.85 }), 0, 0, 0, scene);
const slipper = new THREE.Group(); scene.add(slipper); mesh(box(0.12, 0.03, 0.3), M(0x2f6fd8), 0, 0, 0, slipper); mesh(box(0.13, 0.05, 0.04), M(0x1a3a8a), 0, 0.03, 0.05, slipper);
const phoneA = new THREE.Group(); scene.add(phoneA); mesh(box(0.08, 0.15, 0.012), P(0xc8c4e8, { shininess: 120 }), 0, 0, 0, phoneA); mesh(new THREE.CircleGeometry(0.012, 8), new THREE.MeshBasicMaterial({ color: 0xff2a2a }), 0.025, 0.06, -0.007, phoneA).rotation.y = Math.PI;
const BARREL = V(G - 4.2, 0, 2.6);
mesh(cyl(0.5, 0.5, 1.2, 14), M(0xe86a10), BARREL.x, 0.6, BARREL.z, scene); mesh(new THREE.TorusGeometry(0.5, 0.04, 4, 14), M(0x222222), BARREL.x, 1.2, BARREL.z, scene).rotation.x = Math.PI / 2; mesh(new THREE.TorusGeometry(0.5, 0.04, 4, 14), M(0x222222), BARREL.x, 0.4, BARREL.z, scene).rotation.x = Math.PI / 2; mesh(new THREE.CircleGeometry(0.47, 14), M(0x111111), BARREL.x, 1.19, BARREL.z, scene).rotation.x = -Math.PI / 2;
const garLight = new THREE.PointLight(0xfff6e8, 1.8, 14, 1.0); garLight.position.set(G + 0.5, 4.2, 1.5); scene.add(garLight);
const P_ASLY = V(G + 2.45, 0, -0.75), P_BAST0 = V(G - 2.6, 0, 1.9), P_BAST = V(G - 0.6, 0, 1.0), P_ALAMY = V(G + 2.7, 0, 2.2), P_GAZ = V(G - 2.4, 0.18, -1.4);

function chasePos(t) { // both run around the car (ellipse), Bestem ahead
  const a = (t - T_CHASE) * 2.6; const c = V(G + 0.1, 0, -1.2);
  const bp = c.clone().add(V(Math.cos(a) * 3.0, 0, Math.sin(a) * 2.0)), ap = c.clone().add(V(Math.cos(a - 0.9) * 3.0, 0, Math.sin(a - 0.9) * 2.0));
  return { bp, ap, ang: a };
}
function stateAt(t) {
  const chasing = inT(t, T_CHASE, T_BONK) || t < T_RW + 0.6;
  // ----- El-Asly -----
  let ap = { ...POSE0 }, apos = P_ASLY.clone(), arot = -Math.PI / 2 - 0.2;
  if (t < T_ZAP + 0.6 && t >= T_RW + 0.6) arot = -Math.PI / 2 + 0.75;
  if (t < T_ZAP && t >= T_RW + 0.6) { ap = { ...POSE0, bend: 0.45, aLx: 1.2, eL: 0.5, aRx: 1.2, eR: 0.5, hx: 0.25 }; }                       // careful wiring
  if (inT(t, T_ZAP, T_ZAP + 0.6)) { const j = Math.sin(t * 60); ap = { ...POSE0, aLz: 2.5 + j * 0.3, aRz: 2.5 - j * 0.3, y: Math.abs(j) * 0.08 }; }   // electrocuted
  if (inT(t, T_ZAP + 0.6, T_CHASE)) { arot = -Math.PI / 2 + 1.0; ap = { ...POSE0, aLz: 0.5, aRz: 0.5, eL: 1.2, eR: 1.2, bend: -0.05 }; if (t >= Lx(6).t0) { ap.aRx = 1.9; ap.eR = 0.2; ap.aLz = 0.9; } }
  if (chasing) { const c = chasePos(t < T_RW + 0.6 ? T_CHASE + t : t); apos = c.ap; arot = -c.ang + Math.PI; const ph = t * 13; ap = { ...POSE0, lL: Math.sin(ph) * 0.8, lR: -Math.sin(ph) * 0.8, aRx: 2.2, eR: 0.3, aLx: -Math.sin(ph) * 0.6, y: Math.abs(Math.sin(ph)) * 0.06 }; }
  if (t >= T_BONK) { const c = chasePos(T_BONK); apos = c.ap; arot = -c.ang + Math.PI; ap = { ...POSE0, aLz: 0.3, aRz: 0.3 }; if (t > T_ANNO) { ap.aLx = ap.aRx = 0.8; ap.eL = ap.eR = 1.0; ap.aLz = ap.aRz = 0.2 + Math.abs(Math.sin(t * 8)) * 0.2; } } // dusting hands
  asly.root.position.copy(apos); asly.root.rotation.set(0, arot, 0); applyPose(asly, talkPose(ap, t, 'asly', 0.3));
  const sooty = t >= T_ZAP;
  let ae = t < T_ZAP ? 'flat' : 'angry', am = talkMouth(t, 'asly', 'scream') || (t < T_ZAP ? 'flat' : 'clench');
  if (inT(t, T_ZAP, T_ZAP + 0.6)) { ae = 'x'; am = 'scream'; } if (t >= T_BONK + 0.3) { ae = 'smug'; am = 'smile'; }
  setFace(asly, ae, am, { stache: true, soot: sooty });
  asly.mats.forEach(m => { if (m.userData.orig) m.color.copy(m.userData.orig).multiplyScalar(sooty && t < T_BONK + 2 ? 0.6 : 1); });
  // ----- Bestem -----
  let bp = { ...POSE0 }, bpos, brot = 0.8;
  if (t < Lx(3).t0 - 0.4) { bpos = P_BAST0.clone(); bastam.root.visible = t < T_RW + 0.6; }
  else bastam.root.visible = true;
  if (inT(t, Lx(3).t0 - 0.4, T_CHASE)) { const k = easeOut(seg(t, Lx(3).t0 - 0.4, Lx(3).t0)); bpos = VL(P_BAST0, P_BAST, k); brot = 1.0;
    if (inT(t, Lx(3).t0, Lx(3).t1)) bp = { ...POSE0, aLx: 1.0, eL: 1.8, aLz: 0.2, aRz: 0.95, eR: 1.9, hx: -0.25 };
    if (t >= Lx(5).t0 - 0.3) { bp = { ...POSE0, aRx: 1.2, eR: 0.9 }; } }
  if (chasing) { const c = chasePos(t < T_RW + 0.6 ? T_CHASE + t : t); bpos = c.bp; brot = -c.ang + Math.PI; const ph = t * 14; bp = { ...POSE0, lL: Math.sin(ph) * 0.9, lR: -Math.sin(ph) * 0.9, aLz: 2.5 + Math.sin(ph) * 0.3, aRz: 2.5 - Math.sin(ph) * 0.3, y: Math.abs(Math.sin(ph)) * 0.08 }; bastam.root.visible = true; }
  if (t >= T_BONK) { // launched in an arc into the oil barrel, legs kicking out
    const a = clamp((t - T_BONK) / 1.1); const from = chasePos(T_BONK).bp; const top = BARREL.clone().add(V(0, 2.25, 0));
    bpos = VL(from, top, a).add(V(0, Math.sin(a * Math.PI) * 2.2, 0)); bastam.root.position.copy(bpos);
    bastam.root.rotation.set(a * Math.PI * 3, 0, 0); if (a >= 1) bastam.root.rotation.set(Math.PI, 0, 0);
    const w = Math.sin(t * 10) * 0.5; bp = { ...POSE0, lL: w, lR: -w, aLz: 2.4, aRz: 2.4 };
  } else { bastam.root.position.copy(bpos); bastam.root.rotation.set(0, brot, 0); }
  applyPose(bastam, talkPose(bp, t, 'bastam', 0.3));
  let be = 'wide', bm = talkMouth(t, 'bastam', 'scream') || 'o';
  if (inT(t, Lx(5).t0 - 0.3, Lx(6).t0)) { be = 'default'; bm = talkMouth(t, 'bastam') || 'smile'; } if (t >= T_BONK) { be = 'dizzy'; bm = 'wobble'; }
  setFace(bastam, be, bm, { fuzz: true });
  tea.visible = inT(t, Lx(3).t0 - 0.4, T_CHASE + 0.4); if (tea.visible) tea.position.copy(bastam.arms[1].hand.getWorldPosition(V(0, 0, 0))).add(V(0, 0.08, 0.04));
  // ----- the slipper -----
  slipper.visible = inT(t, Lx(6).t0, T_BONK + 0.05) || t < T_RW + 0.6;
  if (slipper.visible) { if (t < T_BONK - 0.45 || t < T_RW + 0.6) { slipper.position.copy(asly.arms[1].hand.getWorldPosition(V(0, 0, 0))).add(V(0, 0.1, 0)); slipper.rotation.set(0.5, 0, 0); }
    else { const a = clamp((t - (T_BONK - 0.45)) / 0.45); const from = asly.arms[1].hand.getWorldPosition(V(0, 0, 0)); const to = headOf(bastam); slipper.position.copy(VL(from, to, a)).add(V(0, Math.sin(a * Math.PI) * 0.6, 0)); slipper.rotation.set(t * 20, t * 14, 0); } }
  // ----- El-Gazzar asleep under the car (never wakes) -----
  gazzar.root.position.copy(P_GAZ); gazzar.root.rotation.set(-Math.PI / 2, 0.2, 0); applyPose(gazzar, { ...POSE0, aLz: 0.2, aRz: 0.2 }); setFace(gazzar, 'closed', Math.floor(t * 1.5) % 2 ? 'o' : 'flat', { fuzz: true });
  // ----- El-Alamy filming -----
  alamy.root.position.copy(P_ALAMY); alamy.root.rotation.set(0, -2.5, 0);
  applyPose(alamy, talkPose({ ...POSE0, aRx: 1.6, eR: 0.6, aRz: 0.2, aLz: 0.15 }, t, 'alamy', 0.2));
  phoneA.position.copy(alamy.arms[1].hand.getWorldPosition(V(0, 0, 0))).add(V(0, 0.1, 0)); phoneA.rotation.set(0, alamy.root.rotation.y, 0);
  setFace(alamy, 'smug', talkMouth(t, 'alamy') || 'smile', ALAMY_FACE);
  // ----- lights: blackout flicker at the zap -----
  const out = inT(t, T_ZAP, T_ZAP + 1.4); const fl = out ? (hash(Math.floor(t * 18)) > 0.65 ? 1.2 : 0.08) : 1.8;
  garLight.intensity = fl; ambient.color.setHex(0xfff4e0); ambient.intensity = out ? 0.25 : 0.7; moon.intensity = 0.2; fill.intensity = out ? 0.3 : 1.0;
  bathLight.intensity = 0; kitLight.intensity = 0; roomLight.intensity = 0; scene.background = new THREE.Color(0x8ec8ff);
  SC.wires.forEach((w, i) => { w.rotation.x = inT(t, T_ZAP, T_ZAP + 1) ? Math.sin(t * 40 + i) * 0.4 : 0; });
}

function shotAt(t) {
  if (t < T_RW + 0.6) { const h = headOf(asly); cam(h.clone().add(V(-1.4, 0.2, 1.6)).add(shake(t, 0.04)), h.clone().add(V(0, -0.3, 0)), 62); return; }
  if (t < Lx(3).t0 - 0.4) { faceCam(asly, 1.9, 0.6, 0.25, 62, 0.5); return; }
  if (t < T_ZAP) { faceCam(bastam, 1.9, 0.35, 0.05, 60, 0.3); return; }
  if (t < Lx(4).t0 - 0.1) { faceCam(asly, 2.6, 0.7, 0.3, 66, 0.4); camera.position.add(shake(t, 0.06)); return; }
  if (t < Lx(5).t0 - 0.1) { faceCam(asly, 1.7, 0.35, 0.05, 58, 0.3); return; }
  if (t < Lx(6).t0 - 0.1) { faceCam(bastam, 1.8, 0.35, 0.05, 60, 0.3); return; }
  if (t < T_CHASE) { faceCam(asly, 1.6, 0.3, 0.05, 60, 0.3); camera.position.add(shake(t, 0.035)); return; }
  if (t < T_BONK + 0.2) { cam(V(G + 0.1, 7.0, 5.6), V(G + 0.1, 0.0, -1.2), 74); return; }
  if (t < Lx(8).t0 - 0.1) { cam(V(G - 1.0, 2.6, 6.2), VL(bastam.root.position.clone().add(V(0, -0.2, 0)), BARREL.clone().add(V(0, 1.3, 0)), clamp((t - T_BONK) / 1.1) * 0.6), 66); return; }
  if (t < T_ANNO) { faceCam(alamy, 2.0, -0.45, 0.1, 60, 0.3); return; }
  const k = easeInOut(seg(t, T_ANNO, DUR - 3)); cam(VL(V(G - 1.8, 2.2, 5.0), V(G - 1.6, 3.0, 6.2), k), V(G - 2.2, 0.9, 0.4), 70);
}
function particles(t) {
  const st = [], pf = [];
  if (inT(t, T_ZAP - 0.05, T_ZAP + 0.9)) { const b = BAY(); for (let i = 0; i < 16; i++) { const k = ((t - T_ZAP) * 3 + i / 16) % 1; st.push({ pos: b.clone().add(V(Math.cos(i * 2.3) * k * 1.2, k * 1.2 - k * k * 1.0, Math.sin(i * 1.7) * k * 0.8)), size: 0.12 * (1 - k), color: i % 2 ? 0x9fd0ff : 0xffffff }); } }
  if (t >= T_ZAP && t < T_BONK + 1.5 || t < T_RW + 0.6) { const hd = headOf(asly); for (let i = 0; i < 4; i++) { const k = (t * 0.9 + i / 4) % 1; pf.push({ pos: hd.clone().add(V((hash(i) - .5) * 0.3, 0.3 + k * 0.8, 0)), size: 0.15 + k * 0.3, op: 0.6 * (1 - k), color: 0x666666 }); } }
  if (t >= T_BONK && t < T_BONK + 0.5) { const p = slipper.position; for (let i = 0; i < 10; i++) { const a = (t - T_BONK) * 4; st.push({ pos: p.clone().add(V(Math.cos(i) * a, Math.sin(i * 2) * a * 0.6, Math.sin(i) * a * 0.5)), size: 0.18, color: 0xffe14a }); } }
  if (t >= T_BONK + 1.1) { const p = BARREL.clone().add(V(0, 1.1, 0)); for (let i = 0; i < 4; i++) { const a = t * 4 + i * 1.57; st.push({ pos: p.clone().add(V(Math.cos(a) * 0.35, 0.1, Math.sin(a) * 0.35)), size: 0.12, color: 0xffe14a }); } }
  emit(st, starPool); emit(pf, puffPool); emit([], trailPool); emit([], sweatPool);
}
function drawRage(g, t) {
  if (!inT(t, T_ZAP + 0.6, T_BONK)) return; const k = clamp((t - T_ZAP - 0.6) / (T_CHASE - T_ZAP - 0.6));
  g.save(); g.translate(20, 230); g.fillStyle = 'rgba(0,0,0,0.65)'; g.fillRect(0, 0, 230, 54); arText(g, 'غضب الأصلي', 220, 0, 20, '#fff');
  g.fillStyle = '#333'; g.fillRect(10, 30, 210, 16); g.fillStyle = k > 0.8 ? (Math.floor(t * 8) % 2 ? '#ff2a2a' : '#ffe14a') : '#ff8a3a'; g.fillRect(10, 30, 210 * k, 16);
  pxText(g, 'RAGE', 12, 8, 9, '#ff5a4a', 'left', false); g.restore();
}
function drawKO(g, t) {
  if (!inT(t, T_BONK, T_BONK + 1.6)) return; const k = easeBack(seg(t, T_BONK, T_BONK + 0.25));
  g.save(); g.translate(W / 2, 260); g.rotate(-0.08); g.scale(k * 1.4, k * 1.4); pxText(g, 'K.O.!', 0, -30, 40, '#ffe14a', 'center'); arText(g, 'ضربة شبشب!', 0, 14, 34, '#fff', 'center'); g.restore();
}
function drawViews(g, t) {
  if (!inT(t, Lx(8).t0, T_ANNO)) return; const n = Math.floor(lerp(1200, 1000000, clamp((t - Lx(8).t0) / 2.6)));
  g.save(); g.translate(W - 130, 300); g.fillStyle = '#111'; g.fillRect(-100, -150, 200, 300); g.fillStyle = '#000'; g.fillRect(-90, -130, 180, 260);
  g.fillStyle = '#fe2c55'; g.fillRect(-90, 60, 180, 70); pxText(g, '▶ ' + n.toLocaleString('en-US'), 0, 76, 12, '#fff', 'center', false); arText(g, 'مشاهدة', 0, 92, 20, '#fff', 'center');
  g.fillStyle = '#2f6fd8'; g.fillRect(-20, -60, 40, 14); g.fillStyle = '#b07a50'; g.beginPath(); g.arc(0, -20, 18, 0, 7); g.fill(); g.fillStyle = '#d8231b'; g.beginPath(); g.arc(0, -26, 18, Math.PI, 0); g.fill();
  pxText(g, 'BONK', 0, -110, 14, '#ffe14a', 'center', false); g.restore();
}

window.renderFrame = function (t) {
  stateAt(t); shotAt(t); particles(t);
  renderer.render(scene, camera);
  ctx.clearRect(0, 0, W, H); ctx.drawImage(glCanvas, 0, 0);
  h.clearRect(0, 0, W, H);
  drawHookV(h, t, T_HOOK, T_HOOK + 3.4, 'لما حد يزعق', 'وإنت بتشتغل كهربا');
  drawRage(h, t); drawKO(h, t); drawViews(h, t); drawRewind(h, t, T_RW, T_HOOK, 'قبلها بدقيقة...');
  drawDialogueV(h, t);
  drawEndV(h, t, T_ANNO + 0.1, 'BESTEM: LAUNCHED', 'بستم طار... تاني', [['RAGE', 'الغضب: آخره', T_ANNO + 1.3, '#ff5a4a'], ['VIEWS', 'المشاهدات: مليون', T_ANNO + 2.9, '#3df05a']], DUR);
  ctx.drawImage(hud, 0, 0); vignette(ctx, 0.3);
  if (t >= T_ZAP && t < T_ZAP + 0.08) { ctx.fillStyle = 'rgba(200,230,255,0.8)'; ctx.fillRect(0, 0, W, H); }
  if (t >= T_BONK && t < T_BONK + 0.06) { ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.fillRect(0, 0, W, H); }
  return true;
};
window.frameData = () => out.toDataURL('image/png');
window.DUR = DUR;
document.fonts.load('10px PS2P').then(() => document.fonts.load('20px Lalezar', 'ع')).then(() => document.fonts.load('700 20px ReemKufi', 'ع')).then(() => { lateDraw.forEach(f => f()); window.READY = true; });
