// الشبشب — FINAL BOSS. Deterministic low-poly Y2K console cutscene.
// Same engine family as "Jet Dishwasher 3000": window.renderFrame(t) draws frame t into #out.
import * as THREE from 'three';

const W = 640, H = 480;
const DUR = 96.8;
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

// =====================================================================
// فين التوكتوك؟ — Hoda's quest to find his tuk-tuk
// =====================================================================
room.visible = false; hallway.visible = false; balcony.visible = true;
samir.root.visible = false; skyB.visible = false; streetGlow.visible = false;
scene.fog = null; tvLight.intensity = 0; hallLight.intensity = 0;
const inT = (t, a, b) => t >= a && t < b;
const sun = new THREE.DirectionalLight(0xfff2dc, 0); sun.position.set(3, 8, 6); scene.add(sun);
function setFace(c, eyes, mouth, opts = {}) { c.faceMat.map = faceTexture(eyes, mouth, opts); c.faceMat.needsUpdate = true; }
function txtTex(w, h, bg, fn) { const t = canvasTex(w, h, (g) => { if (bg) { g.fillStyle = bg; g.fillRect(0, 0, w, h); } if (fn) fn(g, w, h); }); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; }
function arC(g, s, x, y, size, col, font = 'Lalezar') { g.font = `${size}px ${font}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.direction = 'rtl'; g.fillStyle = col; g.fillText(s, x, y); }
const lateDraw = [];
// scene boundaries
const T_G = 3.0, T_MK = 22.6, T_SY = 38.6, T_BAL = 55.0, T_CLUE1 = 19.95, T_ITEM = 35.5, T_CLUE3 = 52.1, T_SAG = 80.2;

// =====================================================================
// THE SERVICE CENTER (garage from «مركز الصيانة», moved to x = -100)
// =====================================================================
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

garage.position.x = -100;
lateDraw.push(() => { const c = signT.image.getContext('2d'); c.fillStyle = '#d8231b'; c.fillRect(0, 0, 160, 32); c.fillStyle = '#fff'; c.fillRect(0, 0, 160, 3); c.fillRect(0, 29, 160, 3); c.font = '18px Lalezar'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.direction = 'rtl'; c.fillText('مركز العالمي لصيانة السيارات', 80, 16); signT.needsUpdate = true; });
const G = -100;
const alamy = makeAlamy(scene);
const laptopA = new THREE.Group(); scene.add(laptopA);
mesh(box(0.42, 0.025, 0.3), P(0x3a3a44), 0, 0, 0, laptopA);
{ const lid = new THREE.Group(); lid.position.set(0, 0.0125, -0.15); laptopA.add(lid); lid.rotation.x = -0.35; mesh(box(0.42, 0.28, 0.015), P(0x3a3a44), 0, 0.14, -0.008, lid); mesh(new THREE.PlaneGeometry(0.38, 0.24), new THREE.MeshBasicMaterial({ color: 0x0a3a6a }), 0, 0.14, 0.001, lid); }

// =====================================================================
// THE MARKET (x = 200)
// =====================================================================
const MK = 200;
const melonT = txtTex(16, 16, '#3f8a2f', (g) => { g.fillStyle = '#1f5a1f'; for (let i = 0; i < 16; i += 4) g.fillRect(i, 0, 2, 16); });
const signM = txtTex(64, 20, '#ffe14a');
lateDraw.push(() => { const g = signM.userData.g; g.fillStyle = '#ffe14a'; g.fillRect(0, 0, 64, 20); arC(g, 'بطيخ مستورد', 32, 11, 13, '#c11'); signM.needsUpdate = true; });
{
  mesh(new THREE.PlaneGeometry(50, 30), M(0xb8ab8e), MK, 0, 0, scene).rotation.x = -Math.PI / 2;
  for (let i = -3; i <= 3; i++) { mesh(box(4.6, 5 + (i % 2) * 1.5, 1), M([0xd8b080, 0xc99a5a, 0xb48a6a][(i + 3) % 3]), MK + i * 4.8, 2.5, -7, scene); mesh(new THREE.PlaneGeometry(2.4, 2.2), M(0x2a2018), MK + i * 4.8, 1.2, -6.49, scene); }
  const awnT = txtTex(16, 16, '#fff', (g) => { for (let i = 0; i < 4; i++) { g.fillStyle = i % 2 ? '#fff' : '#d8231b'; g.fillRect(i * 4, 0, 4, 16); } }); awnT.repeat.set(3, 1);
  const st = new THREE.Group(); st.position.set(MK, 0, -2.6); scene.add(st);
  mesh(box(3.0, 0.7, 1.4), M(0x8a5a2b, { map: woodTex }), 0, 0.35, 0, st);
  for (const sx of [-1.45, 1.45]) for (const sz of [-0.65, 0.65]) mesh(box(0.06, 2.4, 0.06), M(0x6a4220), sx, 1.2, sz, st);
  mesh(box(3.3, 0.06, 1.8), M(0xffffff, { map: awnT }), 0, 2.45, 0.1, st).rotation.x = -0.15;
  mesh(new THREE.PlaneGeometry(1.4, 0.44), new THREE.MeshBasicMaterial({ map: signM }), 0, 2.0, 0.66, st);
  for (let i = 0; i < 18; i++) { const m = mesh(new THREE.SphereGeometry(0.24, 7, 5), M(0xffffff, { map: melonT }), -1.1 + (i % 6) * 0.44, 0.92 + Math.floor(i / 6) * 0.36, -0.35 + (Math.floor(i / 6) % 2) * 0.3, st); m.scale.set(1.3, 1, 1); }
  // a "broken melons: 2 for 5" crate in front
  const crate = mesh(box(0.9, 0.35, 0.6), M(0x8a5a2b, { map: woodTex }), MK - 1.0, 0.18, -1.3, scene);
  for (let i = 0; i < 4; i++) { const h = new THREE.Group(); h.position.set(MK - 1.25 + (i % 2) * 0.45, 0.42, -1.4 + Math.floor(i / 2) * 0.25); scene.add(h); mesh(new THREE.SphereGeometry(0.17, 7, 4, 0, Math.PI * 2, 0, Math.PI / 2), M(0x2f7a2f, { side: THREE.DoubleSide }), 0, 0, 0, h).rotation.x = Math.PI; mesh(new THREE.CircleGeometry(0.16, 8), M(0xe8303a), 0, 0.001, 0, h).rotation.x = -Math.PI / 2; }
  const priceT = txtTex(48, 20, '#fff'); lateDraw.push(() => { const g = priceT.userData.g; g.fillStyle = '#fff'; g.fillRect(0, 0, 48, 20); arC(g, '٢ بـ ٥', 24, 11, 13, '#c11'); priceT.needsUpdate = true; });
  mesh(new THREE.PlaneGeometry(0.5, 0.2), new THREE.MeshBasicMaterial({ map: priceT }), MK - 1.0, 0.25, -0.99, scene);
}
const shehata = makeChar({
  seed: 51, skin: 0x9a6440, hipY: 0.86, legX: 0.14, legColor: 0x4a5a7a, shoe: 0x3a2a1a, hand: 0x9a6440,
  torsoGeo: cyl(0.34, 0.46, 0.7, 7), torsoTex: canvasTex(16, 16, (g) => { g.fillStyle = '#e8eef8'; g.fillRect(0, 0, 16, 16); g.fillStyle = '#3a5aa8'; g.fillRect(0, 0, 2, 16); g.fillRect(6, 0, 2, 16); g.fillRect(12, 0, 2, 16); }, [3, 2]), torsoColor: 0xffffff, torsoY: 0.35,
  skirt: cyl(0.46, 0.5, 0.7, 7), sleeve: true, shoulderX: 0.44, shoulderY: 0.62, neckY: 0.7, headR: 0.3,
  build(head, torso, reg) { mesh(new THREE.SphereGeometry(0.31, 8, 4, 0, Math.PI * 2, 0, Math.PI * 0.35), reg(M(0xf2f2f2)), 0, 0.04, 0, head); mesh(box(0.7, 0.55, 0.05), reg(M(0xd8c8a0)), 0, 0.25, 0.42, torso); return {}; }
}, scene);

// =====================================================================
// THE BUILDING DOOR (x = 300): Uncle Sayed + the only lit balcony
// =====================================================================
const SY = 300;
{
  mesh(new THREE.PlaneGeometry(40, 24), M(0x6a6458), SY, 0, 0, scene).rotation.x = -Math.PI / 2;
  mesh(box(12, 15, 0.4), M(0xb89a70), SY, 7.5, -1.8, scene);
  mesh(new THREE.PlaneGeometry(1.3, 2.3), M(0x2a1e14), SY + 1.2, 1.15, -1.59, scene);
  for (let c = -2; c <= 2; c++) for (let r = 0; r < 4; r++) if (!(c === 1 && r === 0) && !(c === 1 && r === 2)) mesh(new THREE.PlaneGeometry(0.8, 1.0), M(0x1a2236), SY + c * 2.2, 2.0 + r * 3.3, -1.59, scene);
  mesh(box(1.8, 0.45, 0.55), M(0x8a5a2b, { map: woodTex }), SY - 0.4, 0.225, -1.1, scene);
  const plate = txtTex(64, 20, '#1f5fd8'); lateDraw.push(() => { const g = plate.userData.g; g.fillStyle = '#1f5fd8'; g.fillRect(0, 0, 64, 20); arC(g, 'عمارة ١٢', 32, 11, 13, '#fff'); plate.needsUpdate = true; });
  mesh(new THREE.PlaneGeometry(0.8, 0.25), new THREE.MeshBasicMaterial({ map: plate }), SY + 1.2, 2.55, -1.58, scene);
  // the lit balcony (3rd floor): slab, railing, glowing door, the tuk's red nose
  mesh(box(2.4, 0.15, 1.0), M(0x9a8a78), SY + 2.2, 7.6, -1.1, scene);
  mesh(box(2.4, 0.06, 0.06), P(0x3a3a3a), SY + 2.2, 8.5, -0.62, scene);
  for (let i = 0; i < 12; i++) mesh(box(0.025, 0.9, 0.025), P(0x3a3a3a), SY + 1.05 + i * 0.21, 8.05, -0.62, scene);
  mesh(new THREE.PlaneGeometry(0.9, 1.9), new THREE.MeshBasicMaterial({ color: 0xffd890 }), SY + 2.5, 8.6, -1.585, scene);
  mesh(box(0.9, 0.7, 0.6), P(0xd8231b), SY + 1.6, 8.05, -1.0, scene);
  for (let i = 0; i < 9; i++) mesh(new THREE.SphereGeometry(0.06, 5, 4), new THREE.MeshBasicMaterial({ color: [0xffd400, 0xff3355, 0x33cc66][i % 3] }), SY + 1.1 + i * 0.24, 8.9 + Math.sin(i) * 0.06, -0.6, scene);
  // poster: MISSING
  const post = txtTex(48, 64, '#f4f0e0'); lateDraw.push(() => { const g = post.userData.g; g.fillStyle = '#f4f0e0'; g.fillRect(0, 0, 48, 64); arC(g, 'مفقود', 24, 10, 15, '#c11'); g.fillStyle = '#d8231b'; g.fillRect(10, 24, 28, 16); g.fillStyle = '#111'; g.fillRect(12, 40, 6, 6); g.fillRect(30, 40, 6, 6); arC(g, 'توكتوك ٣٠٠٠', 24, 54, 9, '#111'); post.needsUpdate = true; });
  mesh(new THREE.PlaneGeometry(0.6, 0.8), new THREE.MeshBasicMaterial({ map: post }), SY - 2.4, 1.6, -1.585, scene);
  // other dark buildings + street lamps (off)
  for (let i = 0; i < 6; i++) { const x = SY - 22 + i * 8 + (i > 2 ? 12 : 0), hh = 10 + (i % 3) * 4; mesh(box(6, hh, 4), M(0x2a2e3a), x, hh / 2, -6, scene); }
}
const balGlow = new THREE.PointLight(0xffd08a, 0, 9, 1.2); balGlow.position.set(SY + 2.2, 8.6, -0.4); scene.add(balGlow);
const sayed = makeChar({
  seed: 41, skin: 0x8a5a3a, hipY: 0.84, legX: 0.12, legColor: 0x6b5a48, shoe: 0x3a2a1a, hand: 0x8a5a3a,
  torsoGeo: cyl(0.28, 0.34, 0.66, 7), torsoTex: null, torsoColor: 0x6b5a48, torsoY: 0.33,
  skirt: cyl(0.34, 0.44, 0.75, 7), sleeve: true, sleeveColor: 0x6b5a48, shoulderX: 0.34, shoulderY: 0.6, neckY: 0.66, headR: 0.28,
  build(head, torso, reg) { const tw = reg(M(0xf4f2ea)); const turban = mesh(new THREE.TorusGeometry(0.24, 0.09, 5, 10), tw, 0, 0.2, -0.02, head); turban.rotation.x = Math.PI / 2; mesh(new THREE.SphereGeometry(0.2, 7, 4, 0, Math.PI * 2, 0, Math.PI / 2), tw, 0, 0.22, -0.02, head); mesh(box(0.62, 0.1, 0.05), reg(M(0xd8d0b8)), 0, 0.45, 0.24, torso); return {}; }
}, scene);
const melonHalf = new THREE.Group(); scene.add(melonHalf);
mesh(new THREE.SphereGeometry(0.2, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), M(0x2f7a2f, { side: THREE.DoubleSide }), 0, 0, 0, melonHalf).rotation.x = Math.PI;
mesh(new THREE.CircleGeometry(0.19, 8), M(0xe8303a), 0, 0.001, 0, melonHalf).rotation.x = -Math.PI / 2;

// =====================================================================
// THE BALCONY (engine8 at the origin) + the plugged-in tuk-tuk
// =====================================================================
const coverall = (c) => canvasTex(16, 16, (g) => { g.fillStyle = c; g.fillRect(0, 0, 16, 16); g.fillStyle = 'rgba(0,0,0,0.18)'; g.fillRect(7, 0, 2, 16); g.fillStyle = 'rgba(255,255,255,0.12)'; g.fillRect(2, 3, 4, 3); });
const bastam = makeChar({ seed: 61, skin: 0xb07a50, hipY: 0.84, legX: 0.11, legColor: 0x2f5fb0, shoe: 0x222222, hand: 0xb07a50,
  torsoGeo: cyl(0.24, 0.26, 0.64, 6), torsoTex: coverall('#2f5fb0'), torsoColor: 0xffffff, torsoY: 0.32, sleeve: true, sleeveColor: 0x2f5fb0, shoulderX: 0.3, shoulderY: 0.57, neckY: 0.64, headR: 0.27,
  build(head, torso, reg) { const cap = mesh(new THREE.SphereGeometry(0.28, 8, 4, 0, Math.PI * 2, 0, Math.PI * 0.42), reg(M(0xd8231b)), 0, 0.04, 0, head); mesh(box(0.3, 0.03, 0.2), reg(M(0xd8231b)), 0, 0.1, -0.3, head); mesh(box(0.12, 0.08, 0.02), reg(M(0xffffff)), 0.12, 0.45, 0.25, torso); return {}; } }, scene);

tuk.add(engine6); engine6.position.set(0.9, 0.35, 0); bay.visible = false; engine6.visible = true;
const TUK_LAND = V(-1.55, 0, 0.05); tuk.position.copy(TUK_LAND); tuk.rotation.set(0, 0.25, 0.06);
const engGlow = mesh(new THREE.CircleGeometry(0.15, 8), new THREE.MeshBasicMaterial({ color: 0xff6a10 }), 0, 0.04, 0, eng6pan); engGlow.rotation.x = -Math.PI / 2;
const socket = mesh(box(0.12, 0.16, 0.03), P(0xf0f0f0), 0.9, 0.4, -1.27, balcony);
const cable = new THREE.Line(new THREE.BufferGeometry().setFromPoints([V(0, 0, 0), V(0, 0, 0), V(0, 0, 0), V(0, 0, 0)]), new THREE.LineBasicMaterial({ color: 0x111111 })); scene.add(cable);
const doorLight = new THREE.PointLight(0xffd08a, 1.6, 7, 1.2); doorLight.position.set(1.7, 1.6, -0.6); scene.add(doorLight);
const bulb = mesh(new THREE.SphereGeometry(0.07, 6, 5), new THREE.MeshBasicMaterial({ color: 0xfff0b0 }), 1.35, 2.05, 0.6, scene);
const bulbLight = new THREE.PointLight(0xfff0b0, 1.6, 4, 1.4); bulbLight.position.set(1.35, 1.95, 0.6); scene.add(bulbLight);
const plates = []; for (let i = 0; i < 4; i++) plates.push(mesh(cyl(0.12, 0.1, 0.03, 10), P(0xffffff), -0.75 + i * 0.5, 0.07, -0.2, scene));
laundry.forEach(c => c.visible = false); mattress.scale.y = 0.4; mattress.position.y = 0.03; blanket.position.y = 0.08; pillowB.position.set(-0.35, 0.12, -0.95);
// the city across the street: dark, with a few lit windows only in our building
{ const r = rng(77); for (let i = 0; i < 22; i++) { const x = -20 + i * 1.9 + (r() - .5), z = 8 + r() * 16, top = -1 + r() * 9, bot = -10, ww = 2.6 + r() * 1.5, hh = top - bot; mesh(box(ww, hh, 3), M([0x1c2030, 0x221f1c, 0x191d2a][i % 3]), x, bot + hh / 2, z, scene); } }
const stars = new THREE.Points(new THREE.BufferGeometry().setFromPoints(Array.from({ length: 260 }, (_, i) => { const a = hash(i) * 6.28, b = 0.15 + hash(i + 7) * 1.2; return V(Math.cos(a) * Math.cos(b) * 70, Math.sin(b) * 70, Math.sin(a) * Math.cos(b) * 70 + 10); })), new THREE.PointsMaterial({ color: 0xffffff, size: 2, sizeAttenuation: false }));
scene.add(stars);

// ---------- Hoda ----------
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

const carryMelons = []; for (let i = 0; i < 2; i++) { const m = mesh(new THREE.SphereGeometry(0.22, 7, 5), M(0xffffff, { map: melonT }), 0, 0, 0, hoda.arms[i].hand); m.scale.set(1.3, 1, 1); m.position.set(0, -0.12, 0.12); carryMelons.push(m); }

// ---------- state ----------
function where(t) { return t < T_G ? 'open' : t < T_MK ? 'garage' : t < T_SY ? 'market' : t < T_BAL ? 'door' : 'balcony'; }
function walk(t, a, b, p0, p1) { const k = easeInOut(seg(t, a, b)); return { p: VL(p0, p1, k), moving: t > a && t < b }; }
function stateAt(t) {
  const W_ = where(t);
  // ----- Hoda -----
  let hp = { ...POSE0 }, pos, rot = 0, moving = false;
  if (W_ === 'open') { pos = V(SY - 2.4, 0, -0.95); rot = Math.PI; hp.aLx = 2.6; hp.eL = 0.2; hp.aRx = 2.4; hp.eR = 0.3; }
  else if (W_ === 'garage') { const w = walk(t, T_G, 5.4, V(G + 9, 0, 0.2), V(G + 5.6, 0, 0.7)); pos = w.p; moving = w.moving; rot = -Math.PI / 2 - 0.3; if (inT(t, 14.2, 15.3)) { hp.aLz = 0.9; hp.aRz = 0.9; } }
  else if (W_ === 'market') { const w = walk(t, T_MK, 23.2, V(MK - 3.5, 0, 1.4), V(MK - 0.9, 0, 0.6)); pos = w.p; moving = w.moving; rot = 1.2;
    if (inT(t, 30.1, 32.5)) { hp.aLz = 0.7; hp.aRz = 0.7; hp.eL = hp.eR = 1.2; }
    if (t >= T_ITEM - 0.6) { const w2 = walk(t, T_ITEM, 38.6, V(MK - 0.9, 0, 0.6), V(MK - 3.0, 0, 2.2)); pos = w2.p; moving = w2.moving; rot = t > T_ITEM ? -2.2 : 1.2; hp.aLx = hp.aRx = 1.1; hp.eL = hp.eR = 0.9; } }
  else if (W_ === 'door') { const w = walk(t, T_SY, 39.0, V(SY + 2.5, 0, 1.6), V(SY + 0.7, 0, -0.3)); pos = w.p; moving = w.moving; rot = -1.9;
    hp.aLx = hp.aRx = 1.1; hp.eL = hp.eR = 0.9; if (t >= 46.3) { hp.aLx = 1.1; hp.eL = 0.9; hp.aRx = 0.2; hp.eR = 0.2; } if (t >= 52.1) { hp.hx = -0.6; } }
  else { const w = walk(t, T_BAL, 55.6, V(1.7, 0, -1.7), V(1.15, 0, -0.05)); pos = w.p; moving = w.moving; rot = -1.5;
    if (inT(t, 55.4, 57.9)) { hp.aLz = 2.4; hp.aRz = 2.4; hp.eL = hp.eR = 0.3; }
    if (inT(t, 58.2, 70.4)) rot = -0.4; if (inT(t, 62.3, 64.8)) { hp.aLx = 1.2; hp.eL = 1.6; hp.aRx = 1.2; hp.eR = 1.6; hp.hz = 0.15; }
    if (t >= 70.4 && t < T_SAG) { const k = easeInOut(seg(t, 70.4, 71.0)); pos = VL(V(1.15, 0, -0.05), V(0.7, 0, 0.55), k); rot = lerp(-0.4, 2.5, k); if (inT(t, 75.6, 76.5)) { hp.aLx = hp.aRx = 0.9; hp.eL = hp.eR = 1.7; } }
    if (t >= T_SAG) { pos = V(0.6, 0, -0.75); rot = 0; Object.assign(hp, { y: -0.5, lL: 1.45, lR: 1.45, aLx: 0.7, eL: 1.2, aRx: 0.7, eR: 1.2 }); } }
  if (moving) { const ph = t * 11; hp.lL = Math.sin(ph) * 0.6; hp.lR = -Math.sin(ph) * 0.6; hp.aLx += -Math.sin(ph) * 0.5; hp.aRx += Math.sin(ph) * 0.5; hp.y += Math.abs(Math.sin(ph)) * 0.04; }
  hoda.root.position.copy(pos); hoda.root.rotation.set(0, rot, 0); applyPose(hoda, hp);
  carryMelons.forEach((m, i) => m.visible = t >= T_ITEM - 0.6 && t < 46.3 + (i ? 99 : 0) && t < T_BAL);
  let he = 'wide', hm = talkMouth(t, 'hoda', 'scream') || 'o';
  if (W_ === 'open') { he = 'sad'; hm = 'frown'; } if (inT(t, 20, 22.6)) { he = 'side'; hm = 'flat'; } if (inT(t, T_ITEM, 38.6)) { he = 'tired'; hm = 'frown'; }
  if (inT(t, 46.3, 48)) { he = 'flat'; hm = 'flat'; } if (t >= 52.1 && t < T_BAL) { he = 'sparkle'; hm = 'grin'; }
  if (inT(t, 62.3, 64.8)) { he = 'tears'; hm = talkMouth(t, 'hoda', 'scream') || 'wobble'; } if (inT(t, 65.1, 70.4)) { he = 'flat'; hm = 'flat'; }
  if (inT(t, 75.6, 80.2)) { he = 'sparkle'; hm = talkMouth(t, 'hoda') || 'grin'; } if (t >= T_SAG) { he = 'wide'; hm = 'o'; }
  setFace(hoda, he, hm, {});

  // ----- El-Alamy at the office corner -----
  alamy.root.position.set(G + 3.7, 0, 1.6); alamy.root.rotation.set(0, Math.PI / 2 - 0.25, 0);
  { const p = { ...POSE0, aLx: 0.9, eL: 1.1, aRx: 0.9, eR: 1.1, hx: 0.1 }; if (speakerAt(t) === 'alamy') { p.aRx = 1.3 + envAt(t) * 0.4; p.eR = 0.8; p.hy = 0.2; } applyPose(alamy, p);
    const a = alamy.arms[0].hand.getWorldPosition(V(0, 0, 0)), b = alamy.arms[1].hand.getWorldPosition(V(0, 0, 0)); laptopA.position.copy(a.add(b).multiplyScalar(0.5)).add(V(0, -0.02, 0)); laptopA.rotation.set(0, alamy.root.rotation.y + Math.PI, 0);
    setFace(alamy, 'smug', talkMouth(t, 'alamy') || 'smile', ALAMY_FACE); }
  // ----- Shehata -----
  shehata.root.position.set(MK + 0.7, 0, -0.9); shehata.root.rotation.set(0, -0.6, 0);
  { const p = { ...POSE0 }; if (inT(t, 25.8, 30)) { p.aRx = 1.6; p.eR = 0.2; p.aLz = 0.6; } if (inT(t, 32.8, 35.5)) { p.aRx = 0.8; p.eR = 1.0; p.aRz = 0.4; p.aLz = 0.3; }
    applyPose(shehata, talkPose(p, t, 'shehata'));
    setFace(shehata, inT(t, 25.8, 32.8) ? 'angry' : inT(t, 32.8, 36) ? 'smug' : 'default', talkMouth(t, 'shehata', 'scream') || (inT(t, 32.8, 36) ? 'grin' : 'frown'), { stache: true }); }
  // ----- Sayed -----
  sayed.root.position.set(SY - 0.4, 0, -1.15); sayed.root.rotation.set(0, 0.35, 0);
  { const p = { ...POSE0, y: -0.38, lL: 1.5, lR: 1.5, aRx: 0.5, eR: 0.9, aLz: 0.3, aLx: 0.4, eL: 0.6 }; const eat = t >= 46.6;
    if (eat) { p.aRx = 1.2 + (inT(t, 46.6, 48) ? Math.sin(t * 10) * 0.15 : 0); p.eR = 1.6; }
    applyPose(sayed, talkPose(p, t, 'sayed', 0.3));
    melonHalf.visible = eat && t < T_BAL; if (melonHalf.visible) melonHalf.position.copy(sayed.arms[1].hand.getWorldPosition(V(0, 0, 0))).add(V(0, 0.1, 0.05));
    setFace(sayed, inT(t, 41.8, 46.3) ? 'side' : eat ? 'closed' : 'tired', talkMouth(t, 'sayed') || (eat ? (Math.floor(t * 6) % 2 ? 'talk1' : 'closed') : 'smile'), { stache: true, stacheColor: '#dddddd' }); }
  // ----- the balcony family -----
  dad.root.position.set(-0.15, 0, -0.55); dad.root.rotation.set(0, 0.9, 0);
  { let p = { ...POSE0 }; if (inT(t, 58.2, 62.0)) { p.aLz = 0.6; p.aRx = 0.8; p.eR = 0.3; p.aRz = 0.5; } if (inT(t, 65.1, 69.8)) { p.aRx = 0.9; p.eR = 0.5; p.aRz = 0.2; }
    if (t >= T_SAG) { dad.root.position.set(-0.05, 0, -0.75); dad.root.rotation.set(0, 0, 0); p = { ...POSE0, y: -0.5, lL: 1.45, lR: 1.45, aLx: 0.7, eL: 1.2, aRx: 0.7, eR: 1.2 }; }
    applyPose(dad, talkPose(p, t, 'dad')); setFace(dad, t >= T_SAG ? 'wide' : 'smug', talkMouth(t, 'dad', 'grin') || (t >= T_SAG ? 'o' : 'smile'), { stache: true }); }
  bastam.root.position.set(-0.75, 0, -0.75); bastam.root.rotation.set(0, 0.2, 0);
  applyPose(bastam, { ...POSE0, y: -0.5, lL: 1.45, lR: 1.45, aRx: 0.9 + (Math.floor(t * 2) % 2) * 0.3, eR: 1.6, aLx: 0.7, eL: 1.2 });
  setFace(bastam, t >= T_SAG ? 'wide' : 'closed', t >= T_SAG ? 'o' : (Math.floor(t * 4) % 2 ? 'talk1' : 'closed'), { fuzz: true });
  son.root.position.set(-1.25, 0, -0.75); son.root.rotation.set(0, 0.35, 0);
  applyPose(son, { ...POSE0, y: -0.5, lL: 1.45, lR: 1.45, aRx: 1.0, eR: 1.5, aLx: 0.6, eL: 1.0, hx: 0.3 }); setFace(son, t >= T_SAG ? 'wide' : 'tired', 'flat', {});
  const momIn = t >= 70.0 && t < 80.6; mom.root.visible = momIn;
  if (momIn) { const k = easeOut(seg(t, 70.0, 70.6)); const k2 = easeIn(seg(t, 80.0, 80.6)); mom.root.position.copy(VL(VL(V(1.7, 0, -1.7), V(1.75, 0, -0.85), k), V(1.7, 0, -1.7), k2)); mom.root.rotation.set(0, -0.5 + k2 * 3.0, 0);
    const p = { ...POSE0, aRz: 0.15, aLz: 0.15 }; if (inT(t, 76.8, 80)) { p.aLx = 1.4; p.eL = 0.1; p.aLz = 0.5; } applyPose(mom, talkPose(p, t, 'mom', 0.4));
    setFace(mom, inT(t, 70.4, 75.4) ? 'default' : 'smug', talkMouth(t, 'mom') || 'smile', {}); }
  // tuk engine + cable
  engGlow.material.color.setHex(Math.floor(t * 10) % 2 ? 0xff8a20 : 0xff5a10);
  { const e = engine6.getWorldPosition(V(0, 0, 0)).add(V(0, 0.3, 0)); const sk = socket.getWorldPosition(V(0, 0, 0)).add(V(0, 0, 0.05)); cable.geometry.setFromPoints([e, VL(e, sk, 0.33).add(V(0, -0.35, 0)), VL(e, sk, 0.66).add(V(0, -0.3, 0)), sk]); }
  // the balcony sags under four people
  { const k = t >= T_SAG ? easeBack(seg(t, T_SAG, T_SAG + 0.5)) : 0; const wob = t >= T_SAG ? Math.sin(t * 20) * 0.01 * Math.exp(-(t - T_SAG) * 0.8) : 0; balcony.position.y = -0.06 * k + wob; balcony.rotation.z = 0.025 * k; }
  balGlow.intensity = 2.2 * (0.9 + 0.1 * Math.sin(t * 13));
}
function talkPose(p, t, who, amt = 1) { if (speakerAt(t) !== who) return p; const e = envAt(t) * amt; p.aRx += e * 0.35 * (1 + Math.sin(t * 5.3)); p.eR += e * 0.5; p.hy += Math.sin(t * 2.1) * 0.08; return p; }

// ---------- lighting ----------
function look(kind, t) {
  const L = { day: [0xfff4e0, 0.75, 0x8ec8ff, 1.0, 0], evening: [0x6070b0, 0.5, 0x1a2244, 0.15, 0.35], night: [0x5060a0, 0.42, 0x060a1a, 0, 0.35] }[kind];
  ambient.color.setHex(L[0]); ambient.intensity = L[1]; scene.background = new THREE.Color(L[2]); sun.intensity = L[3]; moon.intensity = L[4];
  doorLight.intensity = kind === 'night' ? 1.6 : 0; bulbLight.intensity = kind === 'night' ? 1.6 : 0; balcLight.intensity = 0;
}

// ---------- shots ----------
function shotAt(t) {
  if (t < T_G) { look('evening', t); const k = easeInOut(seg(t, 0, T_G)); cam(VL(V(SY - 1.0, 1.5, 2.2), V(SY - 1.5, 1.6, 1.4), k), V(SY - 2.4, 1.4, -1.5), 46); return; }
  if (t < 8.11) { look('day', t); cam(V(G + 5.2, 1.7, 3.8), VL(V(G + 8, 1.2, 0.2), headOf(hoda).add(V(0, -0.3, 0)), easeInOut(seg(t, T_G, 5.4))), 52); return; }
  if (t < 14.21) { look('day', t); faceCam(alamy, 2.3, 0.55, 0.15, 44, 0.3); return; }
  if (t < 15.61) { look('day', t); faceCam(hoda, 1.9, -0.4, 0.05, 44, 0.2); return; }
  if (t < T_MK) { look('day', t); if (t < 19.9) faceCam(alamy, 2.3, 0.55, 0.15, 44, 0.3); else cam(V(G + 6.6, 1.8, 3.9), V(G + 4.8, 1.2, 0.9), 50); return; }
  if (t < 25.88) { look('day', t); cam(V(MK - 0.6, 1.7, 4.2), V(MK - 0.2, 1.1, -0.6), 50); return; }
  if (t < 30.19) { look('day', t); faceCam(shehata, 2.2, 0.45, 0.05, 44, 0.25); return; }
  if (t < 32.88) { look('day', t); faceCam(hoda, 1.9, -0.45, 0.05, 44, 0.2); return; }
  if (t < T_ITEM) { look('day', t); faceCam(shehata, 2.3, 0.6, 0.05, 44, 0.25); return; }
  if (t < T_SY) { look('day', t); cam(V(MK - 1.5, 1.4, 4.6), headOf(hoda).add(V(0, -0.5, 0)), 48); return; }
  if (t < 41.85) { look('evening', t); cam(V(SY + 1.6, 1.5, 3.2), V(SY + 0.1, 1.0, -0.8), 50); return; }
  if (t < 46.3) { look('evening', t); faceCam(sayed, 2.1, -0.55, 0.05, 44, 0.3); return; }
  if (t < 48.07) { look('evening', t); cam(V(SY + 1.0, 1.3, 2.4), V(SY + 0.1, 0.8, -0.8), 48); return; }
  if (t < T_CLUE3) { look('evening', t); faceCam(sayed, 2.0, -0.55, 0.05, 44, 0.3); return; }
  if (t < T_BAL) { look('evening', t); const k = easeInOut(seg(t, T_CLUE3, 54.2)); cam(VL(V(SY + 1.3, 1.5, 3.2), V(SY + 1.0, 2.2, 6.5), k), VL(headOf(hoda), V(SY + 2.2, 8.2, -1.1), k), lerp(50, 42, k)); return; }
  look('night', t);
  if (t < 58.21) { cam(V(0.9, 1.5, 3.2), V(-0.6, 0.9, -0.2), 54); return; }
  if (t < 62.34) { faceCam(dad, 2.1, -0.5, 0.05, 44, 0.25); return; }
  if (t < 65.13) { faceCam(hoda, 1.9, 0.45, 0.05, 44, 0.2); return; }
  if (t < 70.46) { faceCam(dad, 2.0, -0.5, 0.05, 44, 0.25); return; }
  if (t < 75.7) { faceCam(mom, 2.2, 0.5, 0.05, 44, 0.25); return; }
  if (t < 76.79) { cam(V(0.3, 1.5, 2.7), V(1.2, 1.15, -0.3), 46); return; }
  if (t < T_SAG) { faceCam(mom, 2.4, 0.6, 0.05, 46, 0.25); return; }
  const k = easeInOut(seg(t, T_SAG + 0.8, 94)); cam(VL(V(-0.3, 1.5, 3.3), V(-0.2, 3.2, 8.5), k).add(shake(t, t < T_SAG + 0.8 ? 0.08 : 0)), VL(V(-0.3, 0.6, -0.6), V(-0.3, 0.8, -0.8), k), 50);
}

// ---------- particles ----------
function particles(t) {
  const st = [], pf = [], sw = [];
  if (t >= T_SAG && t < T_SAG + 1.5) { const a = t - T_SAG; for (let i = 0; i < 10; i++) pf.push({ pos: V(-2.6 + i * 0.6, 0.05 + a * 0.5 * hash(i), 1.25 + hash(i + 3) * 0.2), size: 0.25 + a * 0.4, op: 0.7 * (1 - a / 1.5), color: 0x9a8a78 }); }
  if (inT(t, 62.3, 64.8)) { const h = headOf(hoda); for (let i = 0; i < 2; i++) { const k = (t * 1.5 + i * 0.5) % 1; sw.push({ pos: h.clone().add(V((i ? 1 : -1) * 0.25, 0.1 - k * 0.4, 0.1)), size: 0.07, op: 1 - k }); } }
  if (t >= T_CLUE3 - 0.2 && t < T_BAL) for (let i = 0; i < 6; i++) { const a = t * 2 + i; st.push({ pos: V(SY + 2.2 + Math.cos(a) * 1.4, 8.6 + Math.sin(a * 1.3) * 0.6, -0.5), size: 0.25, color: 0xffe14a }); }
  emit(st, starPool); emit(pf, puffPool); emit([], trailPool); emit(sw, sweatPool);
}

// ---------- 2D ----------
function drawTitle(g, t) {
  if (t >= 3.0) return; const a = t < 0.3 ? t / 0.3 : t > 2.5 ? 1 - (t - 2.5) / 0.5 : 1;
  g.save(); g.globalAlpha = Math.max(0, a); g.fillStyle = 'rgba(0,0,20,0.55)'; g.fillRect(0, 150, W, 120);
  arText(g, 'فين التوكتوك؟', W / 2, 152, 64, '#ffe14a', 'center', 'ReemKufi'); pxText(g, 'WHERE IS THE TUK-TUK?', W / 2, 238, 12, '#9fd0ff', 'center'); g.restore();
}
function clues(t) { return t < T_CLUE1 ? 0 : t < T_ITEM ? 1 : t < T_CLUE3 ? 2 : 3; }
function drawQuest(g, t) {
  if (t < 1.2 || t >= T_SAG) return; const k = easeOut(seg(t, 1.2, 1.6));
  const x = 16 - (1 - k) * 240, y = 16; g.fillStyle = 'rgba(0,0,30,0.8)'; g.fillRect(x, y, 214, 62); g.strokeStyle = '#ffe14a'; g.lineWidth = 2; g.strokeRect(x, y, 214, 62);
  pxText(g, 'QUEST', x + 10, y + 8, 8, '#ffe14a', 'left', false); arText(g, 'لاقي التوكتوك ٣٠٠٠', x + 204, y + 2, 20, '#fff');
  pxText(g, 'CLUES', x + 10, y + 40, 8, '#9fd0ff', 'left', false); for (let i = 0; i < 3; i++) { g.fillStyle = i < clues(t) ? '#3df05a' : '#333'; g.fillRect(x + 70 + i * 26, y + 36, 20, 16); }
  pxText(g, `${clues(t)}/3`, x + 160, y + 40, 8, '#fff', 'left', false);
}
const LOC = [[T_G, 'مركز الصيانة', 'SERVICE CENTER'], [T_MK, 'السوق', 'THE MARKET'], [T_SY, 'باب العمارة', 'BUILDING DOOR'], [T_BAL, 'البلكونة', 'THE BALCONY']];
function drawLoc(g, t) {
  for (const [a, ar, en] of LOC) { if (t < a || t >= a + 2.6) continue; const k = easeOut(seg(t, a, a + 0.3)) * (1 - easeIn(seg(t, a + 2.2, a + 2.6)));
    g.save(); g.globalAlpha = k; g.fillStyle = 'rgba(0,0,30,0.8)'; g.fillRect(W - 200, 18, 184, 52); g.fillStyle = '#d8231b'; g.fillRect(W - 200, 66, 184, 4);
    arText(g, ar, W - 26, 16, 26, '#fff'); pxText(g, en, W - 190, 52, 7, '#ffe14a', 'left', false); g.restore(); }
}
function popup(g, t, a, b, head, ar, col) {
  if (t < a || t >= b) return; const k = easeBack(seg(t, a, a + 0.3)) * (1 - easeIn(seg(t, b - 0.3, b)));
  g.save(); g.translate(W / 2, 150); g.scale(k, k); g.fillStyle = 'rgba(0,0,30,0.92)'; g.fillRect(-220, -40, 440, 82); g.strokeStyle = col; g.lineWidth = 3; g.strokeRect(-220, -40, 440, 82);
  pxText(g, head, 0, -30, 12, col, 'center', false); arText(g, ar, 0, -12, 28, '#fff', 'center'); g.restore();
}
function drawEnd(g, t) {
  if (t >= 81.6 && t < 92.2) {
    const k = easeBack(seg(t, 81.6, 82.0)); g.save(); g.translate(W / 2, 160); g.scale(k, k);
    g.fillStyle = 'rgba(0,0,30,0.92)'; g.fillRect(-240, -100, 480, 200); g.strokeStyle = '#3df05a'; g.lineWidth = 3; g.strokeRect(-240, -100, 480, 200);
    pxText(g, 'QUEST COMPLETE!', 0, -88, 16, '#3df05a', 'center'); arText(g, 'التوكتوك اتلاقى... ومربوط في الفيشة', 0, -60, 24, '#fff', 'center');
    if (t > 85.6) { const c = Math.min(4, Math.floor(1 + (t - 85.6) * 2.5)); pxText(g, 'BALCONY CAPACITY', -220, 2, 9, '#fff', 'left', false); for (let i = 0; i < 4; i++) { g.fillStyle = i < c ? (i >= 3 ? (Math.floor(t * 6) % 2 ? '#ff2a2a' : '#ffe14a') : '#ff5a4a') : '#333'; g.fillRect(-20 + i * 40, -2, 32, 18); } pxText(g, `${c}/3`, 150, 2, 10, '#ff5a4a', 'left', false); }
    if (t > 89.4 && Math.floor(t * 4) % 2) { g.fillStyle = '#d8231b'; g.fillRect(-200, 34, 400, 46); pxText(g, '!! OVERLOAD !!', 0, 40, 14, '#fff', 'center'); arText(g, 'البلكونة هتقع', 0, 50, 22, '#ffe14a', 'center'); }
    g.restore();
  }
  if (t >= 92.2) { const k = easeOut(seg(t, 92.2, 92.6)); g.fillStyle = `rgba(0,0,0,${0.7 * k})`; g.fillRect(0, 0, W, H); g.save(); g.translate(W / 2, 200); g.scale(k, k); arText(g, 'يُتبع...', 0, -40, 54, '#ffe14a', 'center', 'ReemKufi'); pxText(g, 'TO BE CONTINUED', 0, 30, 16, '#fff', 'center'); g.restore(); }
  if (t > 95.9) { g.fillStyle = `rgba(0,0,0,${clamp((t - 95.9) / 0.8)})`; g.fillRect(0, 0, W, H); }
}

// ---------- names + portraits ----------
const NAMES = { hoda: ['حودة', 'HODA', '#c8a000'], alamy: ['العالمي', 'EL-ALAMY', '#151518'], shehata: ['شحاتة', 'SHEHATA', '#3a5aa8'], sayed: ['عم سيد', 'UNCLE SAYED', '#6b5a48'], dad: ['إبراهيم', 'IBRAHIM', '#c9a227'], mom: ['أم حمادة', 'OM HAMADA', '#1f9e5a'] };
function portrait(g, x, y, who, t) {
  g.fillStyle = '#123'; g.fillRect(x, y, 64, 64); g.strokeStyle = '#fff'; g.lineWidth = 2; g.strokeRect(x, y, 64, 64);
  g.save(); g.beginPath(); g.rect(x + 2, y + 2, 60, 60); g.clip();
  const skin = { hoda: '#a87048', alamy: '#c08a60', shehata: '#9a6440', sayed: '#8a5a3a', dad: '#b27448', mom: '#c98d5f' }[who];
  const shirt = { hoda: '#ffd400', alamy: '#151518', shehata: '#e8eef8', sayed: '#6b5a48', dad: '#f3f0e3', mom: '#e86a8a' }[who];
  g.fillStyle = shirt; g.fillRect(x + 8, y + 54, 48, 10); if (who === 'hoda') { g.fillStyle = '#111'; g.fillRect(x + 8, y + 58, 48, 2); }
  if (who === 'mom') { g.fillStyle = '#1f9e5a'; g.beginPath(); g.arc(x + 32, y + 36, 25, 0, 7); g.fill(); }
  g.fillStyle = skin; g.beginPath(); g.arc(x + 32, y + 36, 20, 0, 7); g.fill();
  if (who === 'hoda') { g.fillStyle = '#120c08'; g.fillRect(x + 12, y + 14, 40, 8); for (let i = 0; i < 6; i++) { g.beginPath(); g.moveTo(x + 14 + i * 7, y + 16); g.lineTo(x + 17 + i * 7, y + 6); g.lineTo(x + 20 + i * 7, y + 16); g.fill(); } }
  if (who === 'mom') { g.fillStyle = '#1f9e5a'; g.beginPath(); g.arc(x + 32, y + 30, 22, Math.PI, 0); g.fill(); }
  if (who === 'sayed') { g.fillStyle = '#f4f2ea'; g.beginPath(); g.ellipse(x + 32, y + 18, 22, 9, 0, 0, 7); g.fill(); }
  if (who === 'shehata') { g.fillStyle = '#f2f2f2'; g.beginPath(); g.arc(x + 32, y + 26, 21, Math.PI, 0); g.fill(); }
  if (who === 'alamy') { g.fillStyle = '#101013'; g.fillRect(x + 24, y + 50, 16, 14); g.fillStyle = '#b9bcc4'; g.fillRect(x + 23, y + 54, 2, 10); g.fillRect(x + 39, y + 54, 2, 10); g.fillStyle = '#0c0a09'; g.beginPath(); g.arc(x + 32, y + 29, 20.5, Math.PI, 0); g.fill(); g.beginPath(); g.ellipse(x + 34, y + 12, 15, 5, -0.1, 0, 7); g.fill(); g.fillRect(x + 11, y + 28, 4, 9); g.fillRect(x + 49, y + 28, 4, 9); }
  if (who === 'dad') { g.fillStyle = '#1b1410'; g.fillRect(x + 10, y + 30, 5, 12); g.fillRect(x + 49, y + 30, 5, 12); g.fillStyle = '#c9a227'; g.fillRect(x + 14, y + 16, 36, 5); }
  const fc = document.createElement('canvas'); fc.width = 32; fc.height = 32; const fg = fc.getContext('2d');
  const e = envAt(t); const mouth = speakerAt(t) === who ? (e < 0.1 ? 'closed' : e < 0.4 ? 'talk1' : 'talk2') : 'closed';
  const eyes = { hoda: 'wide', alamy: 'smug', shehata: 'angry', sayed: 'tired', dad: 'smug', mom: 'default' }[who];
  drawFace(fg, 32, eyes, mouth, { stache: who === 'dad' || who === 'sayed' || who === 'shehata', stacheColor: who === 'sayed' ? '#dddddd' : undefined });
  g.imageSmoothingEnabled = false; g.drawImage(fc, x + 14, y + 20, 36, 36); g.restore();
}

window.renderFrame = function (t) {
  stateAt(t); shotAt(t); particles(t);
  renderer.render(scene, camera);
  ctx.clearRect(0, 0, W, H); ctx.drawImage(glCanvas, 0, 0);
  h.clearRect(0, 0, W, H);
  drawTitle(h, t); drawQuest(h, t); drawLoc(h, t);
  popup(h, t, T_CLUE1, T_MK - 0.1, 'CLUE FOUND! 1/3', 'يا إما إسكندرية... يا إما بلكونة', '#3df05a');
  popup(h, t, T_ITEM, T_SY - 0.1, 'ITEM GET! + CLUE 2/3', 'بطيختين (رشوة لعم سيد)', '#ffe14a');
  popup(h, t, T_CLUE3 + 0.2, T_BAL - 0.1, 'CLUE FOUND! 3/3', 'البلكونة اللي منوّرة!', '#3df05a');
  drawDialogue(h, t); drawEnd(h, t);
  ctx.drawImage(hud, 0, 0); vignette(ctx, 0.32);
  return true;
};
window.frameData = () => out.toDataURL('image/png');
window.DUR = DUR;
document.fonts.load('10px PS2P').then(() => document.fonts.load('20px Lalezar', 'ع')).then(() => document.fonts.load('700 20px ReemKufi', 'ع')).then(() => { lateDraw.forEach(f => f()); window.READY = true; });
