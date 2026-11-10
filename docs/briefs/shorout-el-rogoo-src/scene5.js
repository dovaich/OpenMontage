// الشبشب — FINAL BOSS. Deterministic low-poly Y2K console cutscene.
// Same engine family as "Jet Dishwasher 3000": window.renderFrame(t) draws frame t into #out.
import * as THREE from 'three';

const W = 640, H = 480;
const DUR = 41.3;
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
function drawDialogue(g, t) {
  const L = LINES.find(l => l.s !== 'anno' && t >= l.t0 && t < l.t1 + Math.min(0.5, l.gap_after * 0.9));
  if (!L) return;
  let sx = 0, sy = 0;
  if ((L.id === 'L13') && t < L.t0 + 0.6) { sx = (hash(Math.floor(t * 30)) - .5) * 8; sy = (hash(Math.floor(t * 30) + 3) - .5) * 5; }
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
// شروط الرجوع — morning: back inside, terms & conditions, power returns
// =====================================================================
const T_POWER = 26.3, T_FREEZE = 32.95;
mattress.visible = true; blanket.visible = true; pillowB.visible = true; dish.visible = true;

// ---------- morning versions of the textures ----------
const dawnTex = canvasTex(128, 64, (g) => {
  const gr = g.createLinearGradient(0, 0, 0, 64); gr.addColorStop(0, '#7fb6ff'); gr.addColorStop(0.6, '#ffd6a0'); gr.addColorStop(1, '#ffb070'); g.fillStyle = gr; g.fillRect(0, 0, 128, 64);
  g.fillStyle = '#fff3c0'; g.beginPath(); g.arc(30, 44, 9, 0, 7); g.fill();
  const r = rng(5); for (let x = 0; x < 128; x += 7) { const h = 10 + r() * 16 | 0; g.fillStyle = '#b48a6a'; g.fillRect(x, 64 - h, 6, h); g.fillStyle = '#ddd'; if (r() > 0.6) g.fillRect(x + 2, 64 - h - 2, 2, 2); }
  g.fillStyle = '#b48a6a'; g.fillRect(40, 22, 3, 42); g.fillRect(38, 30, 7, 2); g.fillRect(39, 19, 5, 3);
});
skyB.material.map = dawnTex; skyB.material.needsUpdate = true;
const dayWinTex = canvasTex(32, 32, (g) => { const gr = g.createLinearGradient(0, 0, 0, 32); gr.addColorStop(0, '#9cc8ff'); gr.addColorStop(1, '#ffe0b0'); g.fillStyle = gr; g.fillRect(0, 0, 32, 32); const r = rng(8); for (let x = 0; x < 32; x += 5) { const h = 6 + r() * 12 | 0; g.fillStyle = '#b48a6a'; g.fillRect(x, 32 - h, 4, h); } });
win.children[0].material.map = dayWinTex; win.children[0].material.needsUpdate = true;
const sun = new THREE.DirectionalLight(0xffe2b0, 0); sun.position.set(-6, 5, -1); scene.add(sun);

// balcony door panel (hinged), opened by Om Hamada
const bDoor = new THREE.Group(); bDoor.position.set(1.7 - 0.475, 0, -1.25); balcony.add(bDoor);
mesh(box(0.95, 2.1, 0.05), M(0x6a4220, { map: woodTex }), 0.475, 1.05, 0, bDoor);
mesh(new THREE.PlaneGeometry(0.6, 0.8), new THREE.MeshBasicMaterial({ color: 0x9fb6d0 }), 0.475, 1.45, 0.03, bDoor);
// ceiling lamp (living room) + its light
const lamp = mesh(new THREE.SphereGeometry(0.22, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0x555555, side: THREE.DoubleSide }), 0, 3.0, -1.0, room); lamp.rotation.x = Math.PI;
const lampLight = new THREE.PointLight(0xfff0d0, 0, 9, 1.1); lampLight.position.set(0, 2.7, -1.0); scene.add(lampLight);
// router on the TV stand (power-on blinking)
const r5 = mesh(box(0.28, 0.06, 0.18), P(0xffffff), -0.6, 0.58, -3.45, room);
const r5led = mesh(box(0.2, 0.015, 0.01), new THREE.MeshBasicMaterial({ color: 0x111111 }), -0.6, 0.6, -3.355, room);
// hose + flying plates from the kitchen
let hose5 = null; const hoseMat5 = M(0xc0201a);
const plates = []; for (let i = 0; i < 8; i++) { const p = mesh(cyl(0.2, 0.15, 0.035, 8), P(0xffffff), 0, 0, 0, scene); p.visible = false; plates.push(p); }

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


// ---------- TV ----------
function drawTV5(t) {
  const g = tvTex.userData.g, w = 128, h = 96;
  if (t < T_POWER) { g.fillStyle = '#0c0c10'; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(255,255,255,0.06)'; g.fillRect(10, 8, 40, 20); }
  else if (t < T_POWER + 0.35) { const f = Math.floor(t * 15); const img = g.createImageData(w, h); for (let i = 0; i < w * h; i++) { const v = hash(i * 0.731 + f * 13.1) * 220; img.data[i * 4] = img.data[i * 4 + 1] = img.data[i * 4 + 2] = v; img.data[i * 4 + 3] = 255; } g.putImageData(img, 0, 0); }
  else {
    g.fillStyle = '#4fb0ff'; g.fillRect(0, 0, w, 40); g.fillStyle = '#d9c27a'; g.fillRect(0, 40, w, 56);
    for (let y = 40; y < h; y++) { const k = (y - 40) / 56; const half = 6 + k * 70; g.fillStyle = '#555'; g.fillRect(64 - half, y, half * 2, 1); const z = 1 / (k + 0.05); if (Math.floor(z * 2 + t * 6) % 2) { g.fillStyle = '#fff'; g.fillRect(63 - k * 2, y, 2 + k * 4, 1); } }
    const bx = 50 + Math.sin(t * 2.1) * 8, by = 66; g.fillStyle = '#f2f2f2'; g.fillRect(bx, by, 30, 20); g.fillStyle = '#1f5fd8'; g.fillRect(bx, by + 11, 30, 3); g.fillStyle = '#223'; g.fillRect(bx + 3, by + 3, 24, 6);
    g.fillStyle = '#000'; g.fillRect(0, 0, w, 10); g.fillStyle = '#ffe14a'; g.font = '6px PS2P'; g.textAlign = 'left'; g.textBaseline = 'top'; g.fillText('LAP 1/3', 2, 2);
    g.textAlign = 'center'; g.fillStyle = Math.floor(t * 4) % 2 ? '#ff4040' : '#fff'; g.fillText('VOLUME MAX', 64, 30);
  }
  g.fillStyle = 'rgba(0,0,0,0.22)'; for (let y = 0; y < h; y += 2) g.fillRect(0, y, w, 1);
  tvTex.needsUpdate = true;
}

const KEYS = {};
KEYS.dadB = [[0, { y: -0.7, lL: 1.45, lR: 1.45, aLz: 0.3, aRz: 0.3, bend: -0.3, hx: 0.4, hz: 0.3 }], [1.6, { y: -0.7, lL: 1.45, lR: 1.45, aLz: 2.4, aRz: 2.4, eL: 0.3, eR: 0.3, bend: 0.05, hx: -0.1 }, 0.3], [2.6, { y: -0.7, lL: 1.45, lR: 1.45, aLz: 0.4, aRz: 0.4, bend: 0.0, hy: 0.4 }, 0.3]];
KEYS.sonB = [[0, { y: -0.62, lL: 1.45, lR: 1.45, aLz: 0.3, aRz: 0.3, bend: -0.4, hx: 0.5, hz: -0.3 }], [2.0, { y: -0.62, lL: 1.45, lR: 1.45, aLz: 0.3, aRz: 0.3, bend: 0.05, hy: 0.5 }, 0.3], [3.74, { y: -0.5, lL: 1.45, lR: 1.45, aLz: 2.4, aRz: 2.4, eL: 0.3, eR: 0.3, bend: -0.1, hy: 0.6, hx: -0.15 }, 0.12]];
KEYS.mom = [
  [0, { aLz: 0.3, aRz: 0.3 }],
  [0.6, { aRx: 0.8, aRz: 0.6, eR: 0.4, aLz: 0.3 }, 0.3],
  [1.8, { aLz: 0.3, aRz: 0.3, hz: 0.15 }],
  [4.96, { aLx: 1.0, eL: 1.8, aRx: 0.9, eR: 1.2, aRz: 0.2, hx: 0.05 }],
  [6.2, { aLx: 1.0, eL: 1.8, aRx: 2.6, aRz: 0.2, eR: 0.2, hx: -0.05 }, 0.12],
  [8.3, { aLx: 1.0, eL: 1.8, aRx: 2.6, aRz: 0.35, eR: 0.2, tr: 1, hx: -0.05, hz: 0.1 }, 0.12],
  [10.7, { aLx: 1.25, eL: 1.95, aRx: 1.15, eR: 2.0, aLz: -0.2, aRz: -0.25 }],
  [12.8, { aLx: 1.25, eL: 1.95, aRx: 1.15, eR: 2.0, aLz: -0.2, aRz: -0.25, hx: -0.05, bend: 0.1 }],
  [19.0, { aLz: 0.95, eL: 1.9, aRz: 0.95, eR: 1.9 }],
  [T_POWER, { aLz: 2.4, aRz: 2.4, eL: 0.3, eR: 0.3, hx: -0.5 }, 0.15],
  [28.3, { aLz: 0.95, eL: 1.9, aRz: 0.95, eR: 1.9, hx: -0.2 }],
  [29.6, { aLz: 2.6, aRz: 2.6, eL: 0.2, eR: 0.2, hx: -0.1, y: 0.05 }, 0.1],
  [36.9, { aRx: 1.6, aRz: 0.9, eR: 0.0, aLz: 0.95, eL: 1.9, bend: 0.15, twist: 0.4, hy: 0.4 }, 0.1],
];
KEYS.dad = [
  [0, { aLz: 0.2, aRz: 0.2, bend: 0.1, hx: 0.1 }],
  [11.1, { aRz: 2.9, eR: 0.0, aLz: 0.2, bend: 0.05, hx: -0.1, hz: 0.12 }, 0.12],
  [12.5, { aLz: 0.2, aRz: 0.2, bend: 0.25, hx: 0.25 }],
  [15.4, { aLx: 1.4, eL: 1.5, aRx: 1.4, eR: 1.5, aLz: -0.3, aRz: -0.3, bend: 0.2, hx: 0.1 }, 0.1],
  [21.4, { aRx: 1.2, eR: 1.6, aRz: 0.3, aLz: 0.2, bend: 0.2, twist: -0.3, hy: -0.35, hx: 0.05 }, 0.15],
  [26.3, { aLz: 2.4, aRz: 2.4, eL: 0.3, eR: 0.3, hx: -0.5 }, 0.15],
  [28.6, { aLx: 1.6, eL: 2.4, aRx: 1.6, eR: 2.4, aLz: 0.4, aRz: 0.4, bend: -0.25, hx: -0.15 }, 0.1],
  [30.0, { aLz: 2.6, aRz: 2.6, eL: 0.2, eR: 0.2, bend: -0.2, y: 0.08 }, 0.1],
];
KEYS.son = [
  [0, { aLz: 0.2, aRz: 0.2, hx: 0.05 }],
  [6.0, { aLz: 0.2, aRz: 0.2, hx: 0.25, hy: 0.4 }],
  [12.8, { aLx: 1.0, eL: 1.2, aRx: 1.0, eR: 1.2, aLz: -0.2, aRz: -0.2, bend: 0.1, hx: 0.1 }],
  [19.25, { aRx: 1.3, eR: 1.4, aLz: 0.2, bend: 0.15, hx: 0.1 }, 0.1],
  [21.4, { aLz: 0.2, aRz: 0.2, bend: 0.2, twist: 0.3, hy: 0.35, hx: 0.05 }, 0.15],
  [26.3, { aLz: 2.4, aRz: 2.4, eL: 0.3, eR: 0.3, hx: -0.5 }, 0.15],
  [29.6, { aLx: 1.6, eL: 2.4, aRx: 1.6, eR: 2.4, aLz: 0.4, aRz: 0.4, bend: -0.25 }, 0.1],
  [30.4, { aLz: 2.6, aRz: 2.6, eL: 0.2, eR: 0.2, bend: -0.2, y: 0.08 }, 0.1],
];
KEYS.walk = [[38.62, { aLz: 0.15, aRz: 0.15, bend: 0.3, hx: 0.4 }]];

const MOM_P = V(0.3, 0, -2.55), DAD_P = V(-0.55, 0, -0.75), SON_P = V(0.65, 0, -0.75);
function placeHose(t) {
  if (hose5) { scene.remove(hose5); hose5.geometry.dispose(); }
  if (t < 29.6 || t >= T_FREEZE + 3.7) { hose5 = null; return; }
  const pts = []; const k = clamp((t - 29.6) / 0.5);
  for (let i = 0; i <= 7; i++) { const f = i / 7; pts.push(V(4.9 - f * 1.6 * k + Math.sin(t * 9 + i) * 0.4 * f * k, 1.0 + f * 0.8 * k + Math.cos(t * 7 + i) * 0.3 * f * k, 1.0 + Math.sin(t * 5 + i * 1.3) * 0.5 * f * k)); }
  hose5 = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 30, 0.05, 5), hoseMat5); scene.add(hose5);
}
const isBalc = t => t < 4.96 || t >= 38.62;
function stateAt(t) {
  const balc = isBalc(t), hallShot = t >= 29.6 && t < 31.3;
  balcony.visible = balc; room.visible = !balc; hallway.visible = !balc;
  scene.background = new THREE.Color(balc ? 0xffd6a0 : 0x101010);
  scene.fog = balc ? new THREE.Fog(0xffd6a0, 12, 40) : null;
  drawTV5(t);
  const power = t >= T_POWER;
  // lighting: morning
  ambient.color.setHex(0xfff0e0); ambient.intensity = balc ? 1.0 : 0.85;
  moon.intensity = 0; sun.intensity = balc ? 1.6 : 1.2; sun.position.set(balc ? 4 : -6, 5, balc ? 6 : -1);
  balcLight.intensity = balc && t < 4.96 && t > 0.6 ? 2.5 : 0; balcLight.position.set(1.7, 1.4, -0.6);
  bDoorGlow.material.color.setHex(0xffe8c0);
  const flick = power && t < T_POWER + 0.6 ? (hash(Math.floor(t * 20)) > 0.4 ? 1 : 0) : 1;
  lampLight.intensity = power && !balc ? 3.5 * flick * (t > 29.6 && t < T_FREEZE ? (hash(Math.floor(t * 12)) > 0.3 ? 1 : 0.4) : 1) : 0;
  lamp.material.color.setHex(power && flick ? 0xfff6d0 : 0x555555);
  tvLight.intensity = power && !balc ? 4 * (0.85 + 0.15 * noise1(t * 7)) : 0; tvLight.color.setHex(0x6fb8ff);
  hallLight.intensity = !balc ? (power ? 6 + 4 * Math.abs(noise1(t * 8)) : 1.5) : 0; hallLight.color.setHex(power && t > 29.2 ? 0xff8030 : 0xffc070);
  hallLight.position.set(6.5, 2.0, 1.0);
  kitchenGlow.material.color.setHex(power && t > 29.2 ? (Math.floor(t * 10) % 2 ? 0xff8a30 : 0xffc060) : 0xfff0c0);
  r5led.material.color.setHex(power ? (Math.floor(t * 10) % 2 ? 0x3df05a : 0x115511) : 0x111111);
  // balcony door
  let dr = 0;
  if (t >= 0.5 && t < 4.96) dr = -1.6 * easeOut(seg(t, 0.5, 1.2));
  if (t >= 38.62) dr = -1.6 * (1 - easeIn(seg(t, 39.4, 39.7)));
  bDoor.rotation.y = dr;
  // door to hallway stays open
  doorPivot.rotation.y = -1.9; hallGlowMat.color.setHex(0xffd8a0);
  // shake during chaos
  room.position.set(0, 0, 0);
  if (t >= 29.2 && t < T_FREEZE) { const a = 0.02; room.position.set(noise1(t * 30) * a, Math.abs(noise1(t * 27)) * a, 0); }
  placeHose(t >= T_FREEZE ? Math.min(t, T_FREEZE) : t);

  // ---- characters ----
  dad.afro.visible = false; dad.extras.setGoggles(false);
  if (balc) {
    if (t < 4.96) {
      dad.root.position.set(-0.75, 0.14, -0.55); dad.root.rotation.set(0, 0.15, 0); applyPose(dad, poseAt(t, KEYS.dadB));
      son.root.position.set(0.25, 0.14, -0.5); son.root.rotation.set(0, -0.15, 0); applyPose(son, poseAt(t, KEYS.sonB));
      mom.root.position.set(1.7, 0, -1.2); mom.root.rotation.y = -0.3; mom.root.visible = t >= 0.7;
      blanket.visible = true; pillowB.visible = true; mattress.visible = true;
    } else {
      const k = seg(t, 38.62, 39.3);
      dad.root.position.set(lerp(1.6, 0.0, k), 0, lerp(-1.0, 0.2, k)); dad.root.rotation.set(0, 0.2, 0);
      son.root.position.set(lerp(1.9, 0.9, k), 0, lerp(-0.9, 0.3, k)); son.root.rotation.set(0, -0.2, 0);
      const wp = poseAt(t, KEYS.walk); const w = Math.sin(t * 8) * (k < 1 ? 0.4 : 0);
      applyPose(dad, { ...wp, lL: w, lR: -w }); applyPose(son, { ...wp, lL: -w, lR: w });
      mom.root.visible = false; blanket.visible = false; pillowB.visible = false;
    }
    mom.root.visible = mom.root.visible && t < 4.96;
    applyPose(mom, poseAt(t, KEYS.mom));
    samir.root.visible = t >= 38.62; samir.root.position.set(-0.4, 0.09, 0.85);
    applyPose(samir, { ...POSE0, bend: 0.35, aRx: 1.3, eR: 1.6, aLx: 0.6, eL: 0.4, hx: 0.5 }); cane.visible = false;
  } else {
    samir.root.visible = false;
    mom.root.visible = true; mom.root.position.copy(MOM_P); mom.root.rotation.set(0, 0, 0);
    const mz = poseAt(t, KEYS.mom); if (t >= 36.9) mom.root.rotation.y = -0.6;
    applyPose(mom, mz);
    dad.root.position.copy(DAD_P); dad.root.rotation.set(0, Math.PI, 0);
    son.root.position.copy(SON_P); son.root.rotation.set(0, Math.PI, 0);
    const dz = poseAt(t, KEYS.dad), sz = poseAt(t, KEYS.son);
    if (t >= 21.4 && t < 26.3) { dad.root.position.x += 0.18; son.root.position.x -= 0.18; }
    if (t >= 19.25 && t < 20.94) { const tap = Math.abs(Math.sin((t - 19.25) * Math.PI * 1.9)); sz.aRx = 1.0 + tap * 0.4; sz.hx = 0.1 + tap * 0.2; }
    if (t >= 29.6 && t < T_FREEZE) { dad.root.position.y = Math.abs(Math.sin(t * 12)) * 0.05; son.root.position.y = Math.abs(Math.sin(t * 12 + 1)) * 0.05; }
    if (t >= 36.9) { dad.root.rotation.y = Math.PI - 0.4; son.root.rotation.y = Math.PI - 0.6; Object.assign(dz, { bend: 0.35, hx: 0.4, aLz: 0.1, aRz: 0.1 }); Object.assign(sz, { bend: 0.35, hx: 0.4, aLz: 0.1, aRz: 0.1 }); }
    applyPose(dad, dz); applyPose(son, sz);
  }
  // plates flying out of the hallway
  plates.forEach((p, i) => { const t0 = 30.0 + i * 0.32; const a = Math.min(t, T_FREEZE) - t0; p.visible = !balc && a > 0 && a < 1.0; if (p.visible) { const from = V(4.7, 1.2 + hash(i) * 0.6, 1.0), to = V(-2.5 + hash(i + 2) * 3, 0.6 + hash(i + 3) * 1.6, -2.5 + hash(i + 4) * 2); p.position.copy(VL(from, to, a)); p.position.y += Math.sin(a * Math.PI) * 0.6; p.rotation.set(a * 12, a * 8, a * 5); } });

  // particles: smoke from the hallway
  const smoke = [];
  if (!balc && t >= 29.2) { const tt2 = Math.min(t, T_FREEZE); for (let i = 0; i < 20; i++) { const ph = (tt2 * 0.6 + i / 20) % 1; smoke.push({ pos: V(lerp(7.5, 2.5, ph) + Math.sin(i) * 0.3, 1.8 + ph * 0.9 + Math.cos(i * 2) * 0.2, 1.0 + (hash(i) - .5) * 1.2 * ph), size: 0.5 + ph * 1.1, op: 0.65 * (1 - ph * 0.6), color: hash(i + 1) > 0.5 ? 0x444444 : 0x666666 }); } }
  emit(smoke, puffPool);
  const stars = [];
  if (!balc && t >= 29.2 && t < T_FREEZE) { const tb = Math.floor(t * 8) / 8; const r = rng(Math.floor(t * 8)); for (let j = 0; j < 8; j++) { const age = t - tb; stars.push({ pos: V(6.0 + (r() - .5) * 2, 1.0 + r() * 1.5 + age, 1.0 + (r() - .5)), size: 0.18, rot: j }); } }
  if (balc && t < 4.96 && t >= 3.74) { const hd = son.head.getWorldPosition(V(0, 0, 0)); for (let i = 0; i < 4; i++) { const a = t * 4 + i * 1.57; stars.push({ pos: hd.clone().add(V(Math.cos(a) * 0.4, 0.3, Math.sin(a) * 0.4)), size: 0.1, rot: t * 3 }); } }
  emit(stars, starPool);
  emit([], sweatPool);
  const sw = [];
  if (!balc && ((t >= 12.8 && t < 17.0) || (t >= 21.4 && t < 26.0) || (t >= 28.6 && t < T_FREEZE))) for (const c of [dad, son]) { const hd = c.head.getWorldPosition(V(0, 0, 0)); for (let i = 0; i < 2; i++) { const k = (t * 1.2 + i * 0.5) % 1; sw.push({ pos: hd.clone().add(V((i ? 1 : -1) * 0.26, 0.18 - k * 0.5, -0.05)), size: 0.07, op: 1 - k }); } }
  emit(sw, trailPool);
  laundry.forEach((c, i) => { c.rotation.y = Math.sin(t * 1.3 + i) * 0.25; });

  // ---- faces ----
  let me = 'normal', mm = talkMouth(t, 'mom') || 'smile';
  if (t < 4.96) me = 'smug';
  else if (t < 10.7) { me = 'flat'; mm = talkMouth(t, 'mom') || 'flat'; }
  else if (t < 12.8) { me = 'flat'; mm = 'flat'; }
  else if (t < 17.0) { me = 'menace'; mm = talkMouth(t, 'mom') || 'evil'; }
  else if (t < T_POWER) { me = 'smug'; mm = 'smile'; }
  else if (t < 29.6) { me = 'sparkle'; mm = talkMouth(t, 'mom') || 'grin'; }
  else if (t < 36.9) { me = 'pin'; mm = 'o'; }
  else { me = 'angry'; mm = talkMouth(t, 'mom', 'scream') || 'clench'; }
  let de = 'tired', dm = 'closed';
  if (t < 1.6) { de = 'closed'; dm = 'o'; }
  else if (t < 4.96) { de = 'tired'; dm = 'smile'; }
  else if (t < 11.1) { de = 'normal'; dm = 'flat'; }
  else if (t < 12.8) { de = 'sparkle'; dm = talkMouth(t, 'dad') || 'fakegrin'; }
  else if (t < 17.33) { de = 'wide'; dm = 'wobble'; }
  else if (t < 21.4) { de = 'normal'; dm = 'flat'; }
  else if (t < T_POWER) { de = 'side'; dm = talkMouth(t, 'dad') || 'flat'; }
  else if (t < 28.6) { de = 'sparkle'; dm = 'grin'; }
  else if (t < 36.9) { de = 'pin'; dm = talkMouth(t, 'dad', 'scream') || 'scream'; }
  else { de = 'sad'; dm = 'frown'; }
  let se = 'normal', sm = 'closed';
  if (t < 2.0) { se = 'closed'; sm = 'tongue'; }
  else if (t < 3.74) { se = 'tired'; sm = 'flat'; }
  else if (t < 4.96) { se = 'sparkle'; sm = talkMouth(t, 'son', 'scream') || 'grin'; }
  else if (t < 12.8) { se = 'normal'; sm = 'flat'; }
  else if (t < 17.33) { se = 'wide'; sm = 'wobble'; }
  else if (t < 21.4) { se = 'sparkle'; sm = talkMouth(t, 'son') || 'grin'; }
  else if (t < T_POWER) { se = 'side'; sm = talkMouth(t, 'son') || 'flat'; }
  else if (t < 28.6) { se = 'sparkle'; sm = 'grin'; }
  else if (t < 36.9) { se = 'pin'; sm = 'scream'; }
  else { se = 'sad'; sm = 'frown'; }
  const blink = (list) => list.some(b => t >= b && t < b + 0.18);
  if (blink([8.0, 14.5, 23.0, 40.0]) && me !== 'pin') me = 'closed';
  if (blink([9.0, 18.0, 40.4])) { de = 'closed'; se = 'closed'; }
  mom.faceMat.map = faceTexture(me, mm, {}); mom.faceMat.needsUpdate = true;
  dad.faceMat.map = faceTexture(de, dm, { stache: true }); dad.faceMat.needsUpdate = true;
  son.faceMat.map = faceTexture(se, sm, { fuzz: true }); son.faceMat.needsUpdate = true;
  samir.faceMat.map = faceTexture('smug', 'smile', { stache: true, stacheColor: '#eeeeee', glasses: true }); samir.faceMat.needsUpdate = true;
}

function cameraAt(t) {
  if (t < 3.74) { const k = seg(t, 0, 3.74); cam(VL(V(0.3, 1.5, 2.9), V(0.4, 1.3, 2.3), k), V(0.6, 0.8, -0.8), 50); }
  else if (t < 4.96) { faceCam(son, 1.1, 0.25, 0.05, 48, 0.05); }
  else if (t < 11.1) { const k = seg(t, 4.96, 11.1); cam(VL(V(3.1, 1.6, -0.5), V(2.8, 1.55, -0.9), k), V(-0.1, 1.1, -1.7), 52); }
  else if (t < 12.8) { faceCam(dad, 1.25, -0.35, 0.1, 50, 0.15); }
  else if (t < 17.33) { const k = seg(t, 12.8, 17.0); faceCam(mom, lerp(1.75, 1.3, k), 0.05, -0.05, 44, 0.06); }
  else if (t < 21.44) { faceCam(son, 1.35, 0.4, 0.15, 50, 0.15); }
  else if (t < 26.3) { cam(V(0.05, 1.5, -1.95), V(0.05, 1.3, -0.75), 70); }
  else if (t < 28.6) { faceCam(mom, 1.6, 0.4, -0.35, 54, -0.15); }
  else if (t < 29.6) { faceCam(dad, 1.05, -0.2, 0.0, 46, 0.05); camera.position.add(shake(t, 0.03, 25)); }
  else if (t < 31.3) { const k = seg(t, 29.6, 31.3); cam(VL(V(4.7, 1.3, 1.0), V(4.9, 1.35, 1.0), k).add(shake(t, 0.05, 25)), V(9.0, 1.4, 1.0), 56); }
  else if (t < 36.9) { const tt = Math.min(t, T_FREEZE); cam(V(3.8, 2.4, 2.4).add(shake(tt, 0.04, 22)), V(-0.4, 0.9, -1.6), 58); }
  else if (t < 38.62) { faceCam(mom, 1.7, -0.6, -0.4, 56, -0.1); }
  else { const k = easeInOut(seg(t, 38.62, 41.3)); cam(VL(V(0.4, 1.4, 2.9), V(0.4, 1.9, 3.8), k), V(0.3, 1.3, -0.4), 54); }
}

// ---------- HUD ----------
const NAMES = { mom: ['أم حمادة', 'OM HAMADA', '#1f9e5a'], son: ['حمادة', 'HAMADA', '#d4141c'], dad: ['إبراهيم', 'IBRAHIM', '#c9a227'] };
function portrait(g, x, y, who, t) {
  g.fillStyle = '#123'; g.fillRect(x, y, 64, 64); g.strokeStyle = '#fff'; g.lineWidth = 2; g.strokeRect(x, y, 64, 64);
  g.save(); g.beginPath(); g.rect(x + 2, y + 2, 60, 60); g.clip();
  if (who === 'mom') { g.fillStyle = '#1f9e5a'; g.beginPath(); g.arc(x + 32, y + 34, 27, 0, 7); g.fill(); g.fillStyle = '#c98d5f'; g.beginPath(); g.arc(x + 32, y + 38, 19, 0, 7); g.fill(); g.fillStyle = '#ec86ad'; g.fillRect(x + 6, y + 58, 52, 6); }
  else if (who === 'son') { g.fillStyle = '#d4141c'; g.fillRect(x + 8, y + 54, 48, 10); g.fillStyle = '#b98058'; g.beginPath(); g.arc(x + 32, y + 36, 19, 0, 7); g.fill(); g.fillStyle = '#17110c'; for (let i = 0; i < 7; i++) { g.beginPath(); g.arc(x + 14 + i * 6, y + 18 + (i % 2) * 3, 7, 0, 7); g.fill(); } }
  else { g.fillStyle = '#f3f0e3'; g.fillRect(x + 10, y + 54, 44, 10); g.fillStyle = '#b27448'; g.beginPath(); g.arc(x + 32, y + 36, 20, 0, 7); g.fill(); g.fillStyle = '#1b1410'; g.fillRect(x + 10, y + 30, 5, 12); g.fillRect(x + 49, y + 30, 5, 12); g.fillStyle = '#c9a227'; g.fillRect(x + 14, y + 16, 36, 5); g.fillStyle = '#335a3a'; g.fillRect(x + 18, y + 15, 10, 7); g.fillRect(x + 36, y + 15, 10, 7); }
  const fc = document.createElement('canvas'); fc.width = 32; fc.height = 32; const fg = fc.getContext('2d');
  const e = envAt(t); const mouth = speakerAt(t) === who ? (e < 0.1 ? 'closed' : e < 0.4 ? 'talk1' : 'talk2') : 'closed';
  const eyes = who === 'mom' ? (t > 12.8 && t < 17 ? 'menace' : t > 36 ? 'angry' : 'smug') : who === 'son' ? (t > 28 ? 'pin' : 'sparkle') : (t > 28 ? 'pin' : 'sparkle');
  drawFace(fg, 32, eyes, mouth, { stache: who === 'dad', fuzz: who === 'son' });
  g.imageSmoothingEnabled = false; g.drawImage(fc, x + 14, y + 20, 36, 36); g.restore();
}
function drawTitle(g, t) {
  if (t >= 1.6) return; const op = t < 1.2 ? 1 : 1 - seg(t, 1.2, 1.6);
  g.globalAlpha = op; g.fillStyle = 'rgba(0,0,0,0.6)'; g.fillRect(0, 196, W, 76);
  arText(g, 'شروط الرجوع', W / 2, 198, 40, '#ffe14a', 'center', 'ReemKufi'); pxText(g, 'TERMS OF RETURN', W / 2, 250, 10, '#fff', 'center'); g.globalAlpha = 1;
}
function drawRules(g, t) {
  if (t < 6.2 || t >= 19.0) return;
  const x = 18, y = 14, w = 300;
  const rows = [[6.2, 'ممنوع الاختراعات', 'NO INVENTIONS', '#3df05a'], [8.3, 'ممنوع البلايستيشن بعد 12', 'NO CONSOLE AFTER 00:00', '#3df05a'], [13.7, 'المطبخ = البلكونة للأبد', 'KITCHEN = BALCONY FOREVER', '#ff3030']];
  const n = rows.filter(r => t >= r[0]).length; const hh = 40 + n * 46;
  g.fillStyle = 'rgba(0,0,30,0.82)'; g.fillRect(x, y, w, hh); g.strokeStyle = '#fff'; g.lineWidth = 2; g.strokeRect(x, y, w, hh);
  pxText(g, 'HOUSE RULES', x + 10, y + 8, 10, '#ffe14a'); arText(g, 'قوانين البيت', x + w - 10, y + 2, 18, '#fff');
  rows.forEach(([t0, ar, en, col], i) => {
    if (t < t0) return; const k = easeBack(seg(t, t0, t0 + 0.2)); const yy = y + 36 + i * 46;
    g.save(); g.translate(x + w / 2, yy + 20); g.scale(k, k); g.translate(-(x + w / 2), -(yy + 20));
    g.fillStyle = col; g.fillRect(x + 10, yy + 4, 30, 30); pxText(g, String(i + 1), x + 18, yy + 12, 14, '#000', 'left', false);
    arText(g, ar, x + w - 10, yy, 20, i === 2 ? '#ff6060' : '#fff'); pxText(g, en, x + 48, yy + 28, 7, '#9fd0ff');
    g.restore();
  });
}
function drawTerms(g, t) {
  if (t < 17.33 || t >= 21.4) return;
  const k = easeBack(seg(t, 17.33, 17.55)); g.save(); g.translate(W / 2, 200); g.scale(k, k);
  g.fillStyle = 'rgba(230,230,240,0.97)'; g.fillRect(-230, -150, 460, 280); g.strokeStyle = '#1f5fd8'; g.lineWidth = 4; g.strokeRect(-230, -150, 460, 280);
  g.fillStyle = '#1f5fd8'; g.fillRect(-230, -150, 460, 30); pxText(g, 'TERMS & CONDITIONS', -220, -142, 10, '#fff', 'left', false);
  // wall of tiny text, scrolling
  g.save(); g.beginPath(); g.rect(-220, -112, 440, 150); g.clip();
  g.fillStyle = '#555'; const off = (t - 17.33) * 60;
  for (let i = 0; i < 40; i++) { const yy = -110 + i * 8 - off % 8 - Math.floor(off / 8) * 0; for (let j = 0; j < 9; j++) g.fillRect(-215 + j * 48, yy, 30 + hash(i * 9 + j) * 14, 3); }
  g.restore();
  g.fillStyle = '#111'; g.font = '14px Lalezar'; g.textAlign = 'center'; g.direction = 'rtl'; g.textBaseline = 'top'; g.fillText('بندخولك البيت إنت موافق على 4,382 شرط', 0, 44);
  // buttons
  const clicks = [19.35, 19.9, 20.45].filter(c => t >= c).length;
  g.fillStyle = '#3df05a'; g.fillRect(-200, 76, 180, 40); pxText(g, 'I ACCEPT', -110, 90, 10, '#000', 'center', false);
  if (clicks) pxText(g, 'x' + clicks, -30, 66, 10, '#ff2020', 'center', false);
  g.fillStyle = '#999'; g.fillRect(20, 76, 180, 40); pxText(g, 'DECLINE', 110, 90, 10, '#666', 'center', false);
  g.strokeStyle = '#ff2020'; g.lineWidth = 3; g.beginPath(); g.moveTo(20, 76); g.lineTo(200, 116); g.stroke();
  // cursor
  const cx = -110 + Math.sin(t * 20) * (t > 19.25 && t < 20.94 ? 4 : 0), cy = 96 + ([19.35, 19.9, 20.45].some(c => t >= c && t < c + 0.1) ? 3 : 0);
  g.fillStyle = '#fff'; g.strokeStyle = '#000'; g.lineWidth = 1; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx, cy + 20); g.lineTo(cx + 5, cy + 15); g.lineTo(cx + 12, cy + 15); g.closePath(); g.fill(); g.stroke();
  g.restore();
}
function drawAchievement(g, t) {
  const a = t - 33.0; if (a < 0 || t >= 36.9) return;
  g.fillStyle = 'rgba(0,0,0,0.35)'; g.fillRect(0, 0, W, H);
  const k = easeOut(clamp(a / 0.3)); const y = lerp(-90, 30, k);
  g.fillStyle = 'rgba(20,20,30,0.95)'; g.fillRect(70, y, W - 140, 84); g.strokeStyle = '#ffd400'; g.lineWidth = 3; g.strokeRect(70, y, W - 140, 84);
  // trophy
  g.fillStyle = '#ffd400'; g.fillRect(92, y + 18, 34, 26); g.fillRect(104, y + 44, 10, 12); g.fillRect(96, y + 56, 26, 6); g.fillStyle = '#c99a00'; g.fillRect(84, y + 22, 8, 14); g.fillRect(126, y + 22, 8, 14);
  pxText(g, 'ACHIEVEMENT UNLOCKED', 150, y + 14, 10, '#ffd400', 'left', false);
  arText(g, 'ساكن البلكونة', W - 86, y + 30, 28, '#fff');
  pxText(g, 'BALCONY RESIDENT', 150, y + 58, 9, '#9fd0ff', 'left', false);
  if (a > 0.6) pxText(g, '+1000G', W - 140, y + 92, 12, '#3df05a', 'left');
  if (a > 1.0) { const k2 = easeBack(seg(t, 34.0, 34.25)); g.save(); g.translate(W / 2, 260); g.scale(k2, k2); pxText(g, 'FREEZE!', 0, -12, 24, '#ff4040', 'center'); g.restore(); }
}
function drawEnd(g, t) {
  const a = t - 39.8; if (a < 0) return; const k = easeOut(clamp(a / 0.4));
  g.fillStyle = `rgba(0,0,0,${0.5 * k})`; g.fillRect(0, 0, W, H);
  g.save(); g.translate(W / 2, 190); g.scale(k, k); arText(g, 'يُتبع...', 0, -40, 54, '#ffe14a', 'center', 'ReemKufi'); pxText(g, 'TO BE CONTINUED', 0, 30, 16, '#fff', 'center'); g.restore();
}
function desat(g, amt) { const img = g.getImageData(0, 0, W, H); const d = img.data; for (let i = 0; i < d.length; i += 4) { const l = d[i] * 0.3 + d[i + 1] * 0.59 + d[i + 2] * 0.11; d[i] = lerp(d[i], l, amt); d[i + 1] = lerp(d[i + 1], l, amt); d[i + 2] = lerp(d[i + 2], l, amt); } g.putImageData(img, 0, 0); }

window.renderFrame = function (t) {
  const st = (t >= T_FREEZE && t < 36.9) ? T_FREEZE : t;
  stateAt(st); cameraAt(st);
  renderer.render(scene, camera);
  ctx.clearRect(0, 0, W, H); ctx.drawImage(glCanvas, 0, 0);
  if (t >= T_FREEZE && t < 36.9) desat(ctx, 0.6);
  if (t >= 12.8 && t < 16.83) { ctx.fillStyle = `rgba(160,0,0,${0.18 + 0.1 * Math.sin(t * 3)})`; ctx.fillRect(0, 0, W, H); }
  h.clearRect(0, 0, W, H);
  drawRules(h, t); drawTerms(h, t); drawDialogue(h, t); drawAchievement(h, t); drawEnd(h, t); drawTitle(h, t);
  ctx.drawImage(hud, 0, 0);
  vignette(ctx, 0.35);
  if (t >= T_POWER && t < T_POWER + 0.06) { ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.fillRect(0, 0, W, H); }
  if (t >= 13.7 && t < 13.76) { ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.fillRect(0, 0, W, H); }
  return true;
};
window.frameData = () => out.toDataURL('image/png');
window.DUR = DUR;
document.fonts.load('10px PS2P').then(() => document.fonts.load('20px Lalezar', 'ع')).then(() => document.fonts.load('700 20px ReemKufi', 'ع')).then(() => {
  const g = jerseyTex.userData.g; g.fillStyle = '#d4141c'; g.fillRect(0, 0, 32, 32); g.fillStyle = '#fff'; g.fillRect(0, 2, 32, 2); g.font = '12px PS2P'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('10', 16, 18); jerseyTex.needsUpdate = true;
  window.READY = true;
});
