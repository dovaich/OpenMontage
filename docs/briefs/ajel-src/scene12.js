// الشبشب — FINAL BOSS. Deterministic low-poly Y2K console cutscene.
// Same engine family as "Jet Dishwasher 3000": window.renderFrame(t) draws frame t into #out.
import * as THREE from 'three';

const W = 640, H = 480;
const DUR = 132.9;
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
// عاجل! — the local news bulletin recaps the series' disasters
// =====================================================================
room.visible = true; hallway.visible = false; balcony.visible = false;
son.root.visible = false; samir.root.visible = false;
scene.fog = null;
const inT = (t, a, b) => t >= a && t < b;
const sun = new THREE.DirectionalLight(0xfff2dc, 0); sun.position.set(3, 8, 6); scene.add(sun);
const T_EXPLODE = 19.0, T_OUT = 34.25, T_CRASH = 41.4, T_POP = 107.45, T_PLUG = 113.0, T_HOME = 116.5;
function txtTex(w, h, bg, fn) { const t = canvasTex(w, h, (g) => { if (bg) { g.fillStyle = bg; g.fillRect(0, 0, w, h); } if (fn) fn(g, w, h); }); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; }
function arC(g, s, x, y, size, col, font = 'Lalezar') { g.font = `${size}px ${font}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.direction = 'rtl'; g.fillStyle = col; g.fillText(s, x, y); }
const lateDraw = []; // textures that need the Arabic font, drawn once fonts are ready

// ---------- the microphone (a reporter's arm comes in from frame left) ----------
function makeMic() {
  const g = new THREE.Group(); scene.add(g);
  mesh(cyl(0.022, 0.018, 0.24, 6), P(0x111111), 0, -0.12, 0, g);
  mesh(new THREE.IcosahedronGeometry(0.05, 0), P(0x9a9aa2, { shininess: 90 }), 0, 0.02, 0, g);
  const flagT = txtTex(32, 32, '#d8231b'); lateDraw.push(() => { const c = flagT.userData.g; c.fillStyle = '#d8231b'; c.fillRect(0, 0, 32, 32); arC(c, 'عاجل', 16, 17, 13, '#fff'); flagT.needsUpdate = true; });
  mesh(box(0.08, 0.07, 0.08), M(0xffffff, { map: flagT }), 0, -0.06, 0, g);
  mesh(box(0.08, 0.08, 0.7), M(0x1f2f5a), 0, -0.24, -0.38, g).rotation.x = 0.0; // sleeve
  mesh(new THREE.IcosahedronGeometry(0.055, 0), M(0xc8946a), 0, -0.2, -0.02, g);
  g.visible = false; return g;
}
const mic = makeMic();
function placeMic(c, side = 1) {
  const h = headOf(c); const f = c.head.getWorldDirection(V(0, 0, 0)); f.y = 0; f.normalize(); const r = V(f.z, 0, -f.x);
  mic.visible = true; mic.position.copy(h.clone().add(f.clone().multiplyScalar(0.36)).add(r.clone().multiplyScalar(side * 0.2)).add(V(0, -0.12, 0)));
  mic.lookAt(h.clone().add(V(0, -0.08, 0))); mic.rotateX(-Math.PI / 2 + 0.3);
}

// =====================================================================
// STUDIO (x = 50)
// =====================================================================
const S = 50;
const studio = new THREE.Group(); scene.add(studio);
{
  const gridT = txtTex(32, 32, '#121a34', (g) => { g.fillStyle = '#1c2850'; g.fillRect(0, 0, 32, 1); g.fillRect(0, 0, 1, 32); }); gridT.repeat.set(10, 8);
  mesh(new THREE.PlaneGeometry(16, 12), M(0xffffff, { map: gridT }), S, 0, 0, studio).rotation.x = -Math.PI / 2;
  mesh(new THREE.PlaneGeometry(16, 7), M(0x0d1430), S, 3.5, -2.8, studio);
  for (const sx of [-1, 1]) {
    mesh(box(0.5, 6, 0.5), M(0x18224a), S + sx * 3.6, 3, -2.4, studio);
    mesh(box(0.08, 5.4, 0.52), new THREE.MeshBasicMaterial({ color: 0x3aa0ff }), S + sx * 3.6, 3, -2.4, studio);
    mesh(box(0.3, 0.06, 4), new THREE.MeshBasicMaterial({ color: 0xd8231b }), S + sx * 4.6, 0.04, 0, studio);
  }
  for (let i = -3; i <= 3; i++) mesh(box(0.5, 0.12, 0.3), new THREE.MeshBasicMaterial({ color: 0xfff6e0 }), S + i * 1.2, 4.6, 0.5, studio);
  // desk
  mesh(box(3.4, 0.86, 0.8), P(0x1a2a6a, { shininess: 70 }), S, 0.43, -0.15, studio);
  mesh(box(3.6, 0.05, 1.0), P(0xe8ecf4, { shininess: 100 }), S, 0.885, -0.15, studio);
  const deskT = txtTex(128, 24, '#d8231b'); lateDraw.push(() => { const g = deskT.userData.g; g.fillStyle = '#d8231b'; g.fillRect(0, 0, 128, 24); g.fillStyle = '#fff'; g.fillRect(0, 21, 128, 3); arC(g, 'عاجل جدًا', 64, 11, 18, '#fff'); deskT.needsUpdate = true; });
  mesh(new THREE.PlaneGeometry(1.6, 0.3), new THREE.MeshBasicMaterial({ map: deskT }), S, 0.55, 0.256, studio);
  for (const x of [S - 0.7, S + 0.9]) { mesh(box(0.55, 0.75, 0.1), M(0x111522), x, 0.85, -1.2, studio); mesh(box(0.55, 0.08, 0.5), M(0x111522), x, 0.46, -0.95, studio); }
  // papers + mugs
  mesh(box(0.3, 0.01, 0.4), M(0xffffff), S - 0.75, 0.915, -0.3, studio).rotation.y = 0.15;
  mesh(cyl(0.05, 0.045, 0.12, 8), P(0xd8231b), S + 0.35, 0.97, -0.2, studio);
  // power strip in front of the desk (the fatal socket)
  mesh(box(0.5, 0.06, 0.12), P(0xf0f0f0), S + 1.95, 0.03, 0.55, studio);
  for (let i = 0; i < 3; i++) mesh(box(0.06, 0.005, 0.06), M(0x333333), S + 1.8 + i * 0.14, 0.065, 0.55, studio);
  mesh(box(0.05, 0.03, 0.04), M(0xd8231b), S + 2.15, 0.065, 0.5, studio);
}
const wallTex = canvasTex(192, 108, () => { });
const vwall = mesh(new THREE.PlaneGeometry(5.6, 3.15), new THREE.MeshBasicMaterial({ map: wallTex }), S, 2.2, -2.62, studio);
mesh(box(5.8, 3.35, 0.05), M(0x05070f), S, 2.2, -2.66, studio);
const studioLight = new THREE.PointLight(0xffffff, 0, 9, 1.0); studioLight.position.set(S, 3.2, 2.5); scene.add(studioLight);

function drawWall(t) {
  const g = wallTex.userData.g, w = 192, h = 108; g.imageSmoothingEnabled = false; g.direction = 'rtl';
  const mode = t >= T_PLUG ? 'static' : t < 9.6 ? 'logo' : t < 28.3 ? 'kitchen' : t < 50.9 ? 'power' : t < 69.6 ? 'guest' : t < 81.6 ? 'call' : t < 101 ? 'sky' : 'logo';
  const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#0a2a6a'); gr.addColorStop(1, '#04102e'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 6; i++) { g.fillStyle = 'rgba(80,160,255,0.12)'; g.fillRect(((t * 30 + i * 40) % (w + 40)) - 40, 0, 14, h); }
  const head = (s) => { g.fillStyle = '#d8231b'; g.fillRect(0, 0, w, 20); arC(g, s, w / 2, 11, 15, '#fff'); };
  if (mode === 'logo') { g.fillStyle = '#d8231b'; g.fillRect(36, 30, 120, 44); arC(g, 'عاجل جدًا', 96, 52, 28, '#fff'); g.fillStyle = '#fff'; g.fillRect(36, 78, 120, 4); }
  if (mode === 'kitchen') { head('انفجار في الدور التالت'); const k = (t * 3) % 1; g.fillStyle = '#eee'; g.fillRect(70, 50, 40, 40); g.fillStyle = '#d8231b'; g.fillRect(78, 38, 24, 14); g.fillStyle = `rgba(255,${150 + k * 100},0,0.9)`; g.beginPath(); for (let i = 0; i < 12; i++) { const a = i / 12 * 6.28, r = i % 2 ? 16 : 34; g.lineTo(130 + Math.cos(a) * r, 52 + Math.sin(a) * r); } g.fill(); }
  if (mode === 'power') { head(t < 37.6 ? 'انقطاع الكهربا' : 'توكتوك طاير'); if (t < 37.6) { g.fillStyle = '#ffe14a'; g.beginPath(); g.arc(96, 58, 20, 0, 7); g.fill(); g.fillRect(88, 76, 16, 10); g.strokeStyle = '#d8231b'; g.lineWidth = 6; g.beginPath(); g.moveTo(66, 30); g.lineTo(126, 96); g.stroke(); } else { g.fillStyle = '#d8231b'; g.fillRect(70, 48, 50, 26); g.fillStyle = '#111'; g.fillRect(74, 74, 10, 10); g.fillRect(108, 74, 10, 10); g.fillStyle = '#fff'; g.beginPath(); g.moveTo(80, 48); g.lineTo(60, 34); g.lineTo(100, 46); g.fill(); } }
  if (mode === 'guest') { head('ضيف الحلقة'); g.fillStyle = '#b27448'; g.beginPath(); g.arc(96, 58, 22, 0, 7); g.fill(); g.fillStyle = '#c9a227'; g.fillRect(76, 40, 40, 6); g.fillStyle = '#111'; g.fillRect(84, 66, 24, 4); arC(g, 'المخترع العالمي', 96, 96, 14, '#ffe14a'); }
  if (mode === 'call') { head('على التليفون'); const k = Math.floor(t * 3) % 2; g.fillStyle = k ? '#3df05a' : '#2fb84a'; g.fillRect(84, 34, 26, 46); g.fillStyle = '#04102e'; g.fillRect(88, 40, 18, 30); arC(g, 'العالمي', 96, 94, 15, '#fff'); }
  if (mode === 'sky') { head('مباشر من السما'); g.fillStyle = '#8ec8ff'; g.fillRect(20, 24, 152, 76); for (let i = 0; i < 4; i++) { g.fillStyle = '#fff'; g.beginPath(); g.arc(40 + i * 40 + Math.sin(t + i) * 6, 50 + (i % 2) * 22, 12, 0, 7); g.fill(); } const bx = 96 + Math.sin(t * 2) * 30, by = 60 + Math.cos(t * 3) * 10; g.fillStyle = '#b07a50'; g.beginPath(); g.arc(bx, by, 9, 0, 7); g.fill(); g.fillStyle = '#d8231b'; g.fillRect(bx - 9, by - 10, 18, 5); g.fillStyle = '#2f5fb0'; g.fillRect(bx - 6, by + 8, 12, 12); }
  if (mode === 'static') { for (let i = 0; i < 300; i++) { const v = (hash(i + Math.floor(t * 30) * 7) * 255) | 0; g.fillStyle = `rgb(${v},${v},${v})`; g.fillRect((hash(i * 3 + Math.floor(t * 30)) * w) | 0, (hash(i * 5 + 1 + Math.floor(t * 30)) * h) | 0, 12, 6); } }
  wallTex.needsUpdate = true;
}

// ---------- Nashwa, the anchor (new) ----------
const nashwa = makeChar({
  seed: 121, skin: 0xd09a70, hipY: 0.84, legX: 0.1, legColor: 0x1a1a22, shoe: 0x1a1a1a, hand: 0xd09a70,
  torsoGeo: cyl(0.23, 0.21, 0.6, 8), torsoTex: null, torsoColor: 0xc8202a, torsoY: 0.3, sleeve: true, sleeveColor: 0xc8202a,
  shoulderX: 0.29, shoulderY: 0.54, neckY: 0.6, headR: 0.26,
  build(head, torso, reg) {
    const hair = reg(M(0x2a1810));
    const cap = mesh(new THREE.SphereGeometry(0.285, 10, 6, 0, Math.PI * 2, 0, Math.PI * 0.55), hair, 0, 0.02, -0.03, head); cap.rotation.x = -0.45;
    for (const sx of [-1, 1]) mesh(box(0.07, 0.36, 0.3), hair, sx * 0.25, -0.06, -0.04, head); // bob
    mesh(box(0.42, 0.3, 0.1), hair, 0, -0.08, -0.22, head);
    for (const sx of [-1, 1]) mesh(new THREE.IcosahedronGeometry(0.025, 0), reg(P(0xd4a62a, { shininess: 120 })), sx * 0.27, -0.15, 0.04, head);
    mesh(box(0.12, 0.3, 0.02), reg(M(0xf6f6f2)), 0, 0.42, 0.22, torso);
    for (const sx of [-1, 1]) { const l = mesh(box(0.06, 0.3, 0.025), reg(M(0xa8161e)), sx * 0.08, 0.44, 0.228, torso); l.rotation.z = sx * 0.3; }
    mesh(box(0.04, 0.04, 0.01), reg(P(0xd4a62a)), -0.13, 0.48, 0.235, torso);
    return {};
  }
}, scene);
const NASH_P = V(S - 0.7, 0, -0.75), DAD_P = V(S + 0.9, 0, -0.75);
const SEAT = { y: -0.36, lL: 1.45, lR: 1.45, aLx: 0.55, eL: 0.95, aRx: 0.55, eR: 0.95 };

// ---------- the nuclear booster (dish + coat hanger + pan) ----------
const booster = new THREE.Group(); scene.add(booster);
{
  const d = mesh(new THREE.SphereGeometry(0.34, 10, 4, 0, Math.PI * 2, 0, Math.PI / 3), P(0xeeeeee, { side: THREE.DoubleSide }), 0, 0, 0, booster); d.rotation.x = Math.PI / 2;
  mesh(cyl(0.16, 0.13, 0.05, 10), P(0x1d1d1f, { shininess: 80 }), 0, 0, 0.12, booster).rotation.x = Math.PI / 2;
  mesh(box(0.04, 0.03, 0.3), P(0x111111), 0, -0.25, 0.12, booster).rotation.x = 0.5;
  const hook = mesh(new THREE.TorusGeometry(0.1, 0.012, 4, 10, Math.PI * 1.4), P(0xcccccc), 0, 0.42, 0.05, booster);
  mesh(box(0.012, 0.18, 0.012), P(0xcccccc), 0, 0.3, 0.05, booster);
}
const boosterGlow = mesh(new THREE.CircleGeometry(0.15, 10), new THREE.MeshBasicMaterial({ color: 0xff6a10, transparent: true, opacity: 0 }), 0, 0, 0.155, booster);
const cableMat = new THREE.LineBasicMaterial({ color: 0x111111 });
const cableGeo = new THREE.BufferGeometry().setFromPoints([V(0, 0, 0), V(0, 0, 0), V(0, 0, 0), V(0, 0, 0)]);
const cable = new THREE.Line(cableGeo, cableMat); scene.add(cable);
const plug = mesh(box(0.06, 0.05, 0.08), P(0xf0f0f0), 0, 0, 0, scene);

// =====================================================================
// ARCHIVE 1: the kitchen (x = 100)
// =====================================================================
const K = 100;
{
  const kt = txtTex(16, 16, '#f2f2ee', (g) => { g.fillStyle = '#c8d8e8'; g.fillRect(0, 0, 8, 8); g.fillRect(8, 8, 8, 8); }); kt.repeat.set(8, 6);
  mesh(new THREE.PlaneGeometry(7, 6), M(0xffffff, { map: kt }), K, 0, 0, scene).rotation.x = -Math.PI / 2;
  const wt = txtTex(16, 16, '#eef4f8', (g) => { g.fillStyle = '#9fc0d8'; g.fillRect(0, 15, 16, 1); g.fillRect(15, 0, 1, 16); }); wt.repeat.set(10, 5);
  mesh(new THREE.PlaneGeometry(7, 3.2), M(0xffffff, { map: wt }), K, 1.6, -2.3, scene);
  mesh(new THREE.PlaneGeometry(6, 3.2), M(0xffffff, { map: wt }), K - 3.4, 1.6, 0.6, scene).rotation.y = Math.PI / 2;
  mesh(box(4.2, 0.9, 0.6), M(0x8a5a2b, { map: woodTex }), K - 1.0, 0.45, -1.95, scene); mesh(box(4.3, 0.05, 0.65), P(0xdedede), K - 1.0, 0.92, -1.95, scene);
  mesh(box(4.2, 0.7, 0.35), M(0x8a5a2b, { map: woodTex }), K - 1.0, 2.15, -2.1, scene);
  mesh(box(0.7, 0.1, 0.45), P(0xb8c0c8), K - 1.8, 0.95, -1.95, scene); // sink
  mesh(box(0.8, 0.9, 0.6), P(0xdedede), K - 2.8, 0.45, -1.95, scene); for (let i = 0; i < 4; i++) mesh(cyl(0.09, 0.09, 0.02, 8), M(0x222222), K - 3.0 + (i % 2) * 0.4, 0.92, -2.05 + Math.floor(i / 2) * 0.25, scene);
  mesh(box(0.4, 0.25, 0.3), P(0xc0c0c0), K - 0.6, 1.07, -2.0, scene); // pot
}
const machine = new THREE.Group(); machine.position.set(K + 1.6, 0, -1.7); scene.add(machine);
mesh(box(0.85, 0.85, 0.65), P(0xf4f4f4), 0, 0.425, 0, machine); mesh(box(0.75, 0.5, 0.02), P(0xd8d8d8), 0, 0.42, 0.33, machine);
const mEngine = mesh(box(0.5, 0.4, 0.45), P(0xd8231b, { shininess: 70 }), 0, 1.05, 0, machine);
for (let i = 0; i < 3; i++) mesh(box(0.88, 0.05, 0.02), P(0xc9ccd1), 0, 0.6 + i * 0.25, 0.335, machine);
const mPipe = mesh(cyl(0.05, 0.05, 0.5, 6), P(0x8a4a22), 0.45, 1.05, 0, machine); mPipe.rotation.z = Math.PI / 2;
const plates = []; for (let i = 0; i < 14; i++) { const p = mesh(cyl(0.13, 0.13, 0.015, 10), P(0xffffff), 0, 0, 0, scene); p.visible = false; plates.push({ p, v: V((hash(i) - .5) * 5, 2 + hash(i + 9) * 4, 1 + hash(i + 3) * 3), s: hash(i + 5) * 10 }); }
const soot = []; for (let i = 0; i < 6; i++) { const s = mesh(new THREE.CircleGeometry(0.4 + hash(i) * 0.5, 7), new THREE.MeshBasicMaterial({ color: 0x111111, transparent: true, opacity: 0.75 }), K + 1.6 + (hash(i + 2) - .5) * 2.4, 1.0 + hash(i + 4) * 1.6, -2.28 + i * 0.001, scene); s.visible = false; soot.push(s); }

// =====================================================================
// ARCHIVE 2: the blackout (x = 150)
// =====================================================================
const N = -400; const wins = [];
const winOn = 0xffd890, winOff = 0x0e1424;
function winPlane(x, y, z, w = 0.7, h = 0.9) { const m = mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: winOn }), x, y, z, scene); wins.push(m); return m; }
{
  mesh(new THREE.PlaneGeometry(80, 40), M(0x1a1c26), N, 0, 0, scene).rotation.x = -Math.PI / 2;
  mesh(box(8, 12, 0.5), M(0x8a7a68), N, 6, -0.25, scene);
  for (let c = 0; c < 5; c++) for (let r = 0; r < 5; r++) winPlane(N - 3.2 + c * 1.6, 1.6 + r * 2.1, 0.01);
  const r0 = rng(31);
  for (let i = 0; i < 16; i++) {
    const x = N - 24 + i * 3.2 + (r0() - .5), z = -9 - r0() * 12, hh = 6 + r0() * 14, ww = 2.4 + r0();
    mesh(box(ww, hh, 2), M([0x3a3a4a, 0x4a4038, 0x30384a][i % 3]), x, hh / 2, z, scene);
    for (let yy = 1.2; yy < hh - 0.5; yy += 1.4) for (let xx = -ww / 2 + 0.5; xx < ww / 2 - 0.3; xx += 0.8) if (r0() > 0.35) winPlane(x + xx, yy, z + 1.01, 0.4, 0.6);
  }
  // Ibrahim's balcony on the 4th row
  mesh(box(1.6, 0.12, 0.9), M(0x9a8a78), N + 1.6, 7.0, 0.45, scene);
  mesh(box(1.6, 0.06, 0.06), P(0x3a3a3a), N + 1.6, 7.9, 0.88, scene);
  for (let i = 0; i < 8; i++) mesh(box(0.025, 0.85, 0.025), P(0x3a3a3a), N + 0.85 + i * 0.21, 7.45, 0.88, scene);
  const d = mesh(new THREE.SphereGeometry(0.4, 8, 4, 0, Math.PI * 2, 0, Math.PI / 3), P(0xeeeeee, { side: THREE.DoubleSide }), N + 2.0, 7.9, 0.5, scene); d.rotation.x = -1.0;
  for (let i = 0; i < 4; i++) { mesh(cyl(0.05, 0.06, 4.5, 6), M(0x222222), N - 9 + i * 6, 2.25, 4, scene); }
}
const panGlow = mesh(new THREE.CircleGeometry(0.17, 10), new THREE.MeshBasicMaterial({ color: 0xff5a10 }), N + 2.0, 8.05, 0.78, scene); panGlow.rotation.x = -0.6;
const lamps = []; for (let i = 0; i < 4; i++) lamps.push(mesh(new THREE.SphereGeometry(0.22, 6, 4), new THREE.MeshBasicMaterial({ color: 0xffe8a0 }), N - 9 + i * 6, 4.55, 4, scene));
const moonDisc = mesh(new THREE.CircleGeometry(1.4, 12), new THREE.MeshBasicMaterial({ color: 0xf4f0d8 }), N - 10, 22, -30, scene);
const PAN_W = V(N + 2.0, 8.05, 0.78);

// =====================================================================
// ARCHIVE 3 + interview: the market (x = 200), tuk-tuk from tuk_block
// =====================================================================
const MK = 200;
tuk.add(engine6); engine6.position.set(0.9, 0.35, 0); bay.visible = false; engine6.visible = true;
street.position.set(MK, 0, 0);
const melons = []; const melonT = txtTex(16, 16, '#3f8a2f', (g) => { g.fillStyle = '#1f5a1f'; for (let i = 0; i < 16; i += 4) g.fillRect(i, 0, 2, 16); });
const signT = txtTex(64, 20, '#ffe14a');
lateDraw.push(() => { const g = signT.userData.g; g.fillStyle = '#ffe14a'; g.fillRect(0, 0, 64, 20); arC(g, 'بطيخ مستورد', 32, 11, 13, '#c11'); signT.needsUpdate = true; });
const stallTop = new THREE.Group(); stallTop.position.set(MK, 0, -2.6); scene.add(stallTop);
{
  mesh(new THREE.PlaneGeometry(50, 30), M(0xb8ab8e), MK, 0, 0, scene).rotation.x = -Math.PI / 2;
  for (let i = -3; i <= 3; i++) { mesh(box(4.6, 5 + (i % 2) * 1.5, 1), M([0xd8b080, 0xc99a5a, 0xb48a6a][(i + 3) % 3]), MK + i * 4.8, 2.5, -7, scene); mesh(new THREE.PlaneGeometry(2.4, 2.2), M(0x2a2018), MK + i * 4.8, 1.2, -6.49, scene); }
  const awnT = txtTex(16, 16, '#fff', (g) => { for (let i = 0; i < 4; i++) { g.fillStyle = i % 2 ? '#fff' : '#d8231b'; g.fillRect(i * 4, 0, 4, 16); } }); awnT.repeat.set(3, 1);
  mesh(box(3.0, 0.7, 1.4), M(0x8a5a2b, { map: woodTex }), 0, 0.35, 0, stallTop);
  for (const sx of [-1.45, 1.45]) for (const sz of [-0.65, 0.65]) mesh(box(0.06, 2.4, 0.06), M(0x6a4220), sx, 1.2, sz, stallTop);
  const aw = mesh(box(3.3, 0.06, 1.8), M(0xffffff, { map: awnT }), 0, 2.45, 0.1, stallTop); aw.rotation.x = -0.15; stallTop.userData.aw = aw;
  mesh(new THREE.PlaneGeometry(1.4, 0.44), new THREE.MeshBasicMaterial({ map: signT }), 0, 2.0, 0.66, stallTop);
  for (let i = 0; i < 18; i++) { const m = mesh(new THREE.SphereGeometry(0.24, 7, 5), M(0xffffff, { map: melonT }), -1.1 + (i % 6) * 0.44, 0.92 + Math.floor(i / 6) * 0.36, -0.35 + (Math.floor(i / 6) % 2) * 0.3, stallTop); m.scale.set(1.3, 1, 1); melons.push({ m, base: m.position.clone(), v: V((hash(i) - .5) * 6, 2 + hash(i + 1) * 4, 1 + hash(i + 2) * 4) }); }
  // other stalls
  for (const [x, col] of [[-4.5, 0xff8a1a], [4.5, 0xd8231b]]) { mesh(box(2.6, 0.8, 1.2), M(0x8a5a2b, { map: woodTex }), MK + x, 0.4, -3, scene); const r = rng(x * 9 + 3); for (let i = 0; i < 30; i++) mesh(new THREE.SphereGeometry(0.09, 6, 4), M(col), MK + x - 1 + r() * 2, 0.9 + Math.floor(i / 10) * 0.12, -3.4 + r() * 0.8, scene); }
}
const chunks = []; for (let i = 0; i < 26; i++) { const c = mesh(new THREE.TetrahedronGeometry(0.1 + hash(i) * 0.08, 0), M(i % 3 ? 0xe8303a : 0x2f7a2f), 0, 0, 0, scene); c.visible = false; chunks.push({ c, v: V((hash(i + 1) - .5) * 8, 2 + hash(i + 2) * 5, (hash(i + 3) - .2) * 6) }); }
const melonHalf = new THREE.Group(); scene.add(melonHalf);
mesh(new THREE.SphereGeometry(0.24, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), M(0x2f7a2f, { side: THREE.DoubleSide }), 0, 0, 0, melonHalf).rotation.x = Math.PI;
mesh(new THREE.CircleGeometry(0.22, 8), M(0xe8303a), 0, 0.001, 0, melonHalf).rotation.x = -Math.PI / 2;
const shehata = makeChar({
  seed: 51, skin: 0x9a6440, hipY: 0.86, legX: 0.14, legColor: 0x4a5a7a, shoe: 0x3a2a1a, hand: 0x9a6440,
  torsoGeo: cyl(0.34, 0.46, 0.7, 7), torsoTex: canvasTex(16, 16, (g) => { g.fillStyle = '#e8eef8'; g.fillRect(0, 0, 16, 16); g.fillStyle = '#3a5aa8'; g.fillRect(0, 0, 2, 16); g.fillRect(6, 0, 2, 16); g.fillRect(12, 0, 2, 16); }, [3, 2]), torsoColor: 0xffffff, torsoY: 0.35,
  skirt: cyl(0.46, 0.5, 0.7, 7), sleeve: true, shoulderX: 0.44, shoulderY: 0.62, neckY: 0.7, headR: 0.3,
  build(head, torso, reg) {
    mesh(new THREE.SphereGeometry(0.31, 8, 4, 0, Math.PI * 2, 0, Math.PI * 0.35), reg(M(0xf2f2f2)), 0, 0.04, 0, head);
    mesh(box(0.7, 0.55, 0.05), reg(M(0xd8c8a0)), 0, 0.25, 0.42, torso);
    return {};
  }
}, scene);

// =====================================================================
// Uncle Sayed's doorstep (x = 250)
// =====================================================================
const SY = 300;
{
  mesh(new THREE.PlaneGeometry(30, 20), M(0x9a9080), SY, 0, 0, scene).rotation.x = -Math.PI / 2;
  mesh(box(12, 9, 0.4), M(0xd8b080), SY, 4.5, -1.8, scene);
  mesh(new THREE.PlaneGeometry(1.3, 2.3), M(0x2a1e14), SY + 1.2, 1.15, -1.59, scene);
  for (let c = -2; c <= 2; c++) for (let r = 0; r < 2; r++) if (!(c === 1 && r === 0)) mesh(new THREE.PlaneGeometry(0.8, 1.0), M(0x3a4a6a), SY + c * 2.2, 2.0 + r * 3, -1.59, scene);
  mesh(box(1.8, 0.45, 0.55), M(0x8a5a2b, { map: woodTex }), SY - 0.4, 0.225, -1.1, scene);
  const plate = txtTex(64, 20, '#1f5fd8'); lateDraw.push(() => { const g = plate.userData.g; g.fillStyle = '#1f5fd8'; g.fillRect(0, 0, 64, 20); arC(g, 'عمارة ١٢', 32, 11, 13, '#fff'); plate.needsUpdate = true; });
  mesh(new THREE.PlaneGeometry(0.8, 0.25), new THREE.MeshBasicMaterial({ map: plate }), SY + 1.2, 2.55, -1.58, scene);
}
const sayed = makeChar({
  seed: 41, skin: 0x8a5a3a, hipY: 0.84, legX: 0.12, legColor: 0x6b5a48, shoe: 0x3a2a1a, hand: 0x8a5a3a,
  torsoGeo: cyl(0.28, 0.34, 0.66, 7), torsoTex: null, torsoColor: 0x6b5a48, torsoY: 0.33,
  skirt: cyl(0.34, 0.44, 0.75, 7), sleeve: true, sleeveColor: 0x6b5a48, shoulderX: 0.34, shoulderY: 0.6, neckY: 0.66, headR: 0.28,
  build(head, torso, reg) {
    const tw = reg(M(0xf4f2ea));
    const turban = mesh(new THREE.TorusGeometry(0.24, 0.09, 5, 10), tw, 0, 0.2, -0.02, head); turban.rotation.x = Math.PI / 2;
    mesh(new THREE.SphereGeometry(0.2, 7, 4, 0, Math.PI * 2, 0, Math.PI / 2), tw, 0, 0.22, -0.02, head);
    mesh(box(0.62, 0.1, 0.05), reg(M(0xd8d0b8)), 0, 0.45, 0.24, torso);
    return {};
  }
}, scene);
const emptyTea = mesh(cyl(0.04, 0.035, 0.11, 6), P(0xdde8f0, { transparent: true, opacity: 0.6 }), 0, 0, 0, sayed.arms[1].hand);
emptyTea.position.set(0, 0.03, 0.06);

// =====================================================================
// El-Alamy's office corner at the service center (x = -100)
// =====================================================================
const G = -100;
{
  mesh(new THREE.PlaneGeometry(14, 10), M(0x8a8a8e), G, 0, 0, scene).rotation.x = -Math.PI / 2;
  const mt = txtTex(16, 32, '#6f8fa8', (g) => { g.fillStyle = '#5a7890'; for (let x = 0; x < 16; x += 4) g.fillRect(x, 0, 2, 32); }); mt.repeat.set(8, 1);
  mesh(new THREE.PlaneGeometry(10, 5), M(0xffffff, { map: mt }), G, 2.5, -2.2, scene);
  const sg = txtTex(160, 32, '#d8231b'); lateDraw.push(() => { const g = sg.userData.g; g.fillStyle = '#d8231b'; g.fillRect(0, 0, 160, 32); g.fillStyle = '#fff'; g.fillRect(0, 0, 160, 3); g.fillRect(0, 29, 160, 3); arC(g, 'مركز الصيانة', 80, 17, 20, '#fff'); sg.needsUpdate = true; });
  mesh(new THREE.PlaneGeometry(3.6, 0.72), new THREE.MeshBasicMaterial({ map: sg }), G, 3.4, -2.18, scene);
  mesh(box(1.4, 0.06, 0.7), M(0x6a4220), G + 1.3, 0.8, -1.4, scene); for (const [x, z] of [[-0.6, -0.3], [0.6, -0.3], [-0.6, 0.3], [0.6, 0.3]]) mesh(box(0.05, 0.8, 0.05), M(0x333333), G + 1.3 + x, 0.4, -1.4 + z, scene);
  mesh(box(0.6, 0.4, 0.05), M(0x111111), G + 1.3, 1.1, -1.6, scene); mesh(new THREE.PlaneGeometry(0.55, 0.35), new THREE.MeshBasicMaterial({ color: 0x0a2a5a }), G + 1.3, 1.1, -1.57, scene);
  for (let k = 0; k < 4; k++) mesh(new THREE.TorusGeometry(0.38, 0.16, 6, 12), M(0x1a1a1a), G - 2.6, 0.16 + k * 0.32, -1.6, scene).rotation.x = Math.PI / 2;
  mesh(box(2.4, 1.2, 0.06), M(0xc8a060), G - 0.8, 2.0, -2.15, scene);
}
const alamy = makeAlamy(scene);
const phoneA = new THREE.Group(); alamy.arms[1].hand.add(phoneA); mesh(box(0.1, 0.19, 0.015), P(0xc8c4e8, { shininess: 120 }), 0, 0.02, 0.07, phoneA);

// =====================================================================
// The sky (Bastam), around x = 440
// =====================================================================
const SKX = 2000, BP = V(SKX, 130, 0);
{
  mesh(new THREE.PlaneGeometry(1400, 1400), M(0xd8bc80), SKX, 0, 0, scene).rotation.x = -Math.PI / 2;
  mesh(new THREE.PlaneGeometry(800, 1400), M(0x2f7fc8), SKX + 462, 0.6, 0, scene).rotation.x = -Math.PI / 2;
  mesh(new THREE.PlaneGeometry(12, 1400), M(0xf0dca8), SKX + 58, 0.3, 0, scene).rotation.x = -Math.PI / 2;
  const r = rng(9); for (let i = 0; i < 90; i++) { const h = 4 + r() * 14; mesh(box(4 + r() * 5, h, 4 + r() * 5), M([0xf4f0e8, 0xe8dcc0, 0xd8d0c0][i % 3]), SKX + 18 + r() * 36, h / 2, -130 + r() * 260, scene); }
  mesh(cyl(2.5, 3.5, 24, 6), M(0xe8dcc0), SKX + 60, 12, 20, scene); mesh(cyl(1.8, 1.8, 4, 6), new THREE.MeshBasicMaterial({ color: 0xfff0a0 }), SKX + 60, 26, 20, scene);
  for (let i = 0; i < 3; i++) { const hh = 40 - i * 8; const p = mesh(new THREE.ConeGeometry(34 - i * 7, hh, 4), M(0xe0c070), SKX - 120 + i * 42, hh / 2, -110 + i * 24, scene); p.rotation.y = Math.PI / 4; }
}
const clouds = []; for (let i = 0; i < 18; i++) { const c = mesh(new THREE.IcosahedronGeometry(2 + hash(i) * 2.5, 0), new THREE.MeshLambertMaterial({ color: 0xffffff, transparent: true, opacity: 0.88, flatShading: true }), BP.x + (hash(i + 1) - .5) * 70, BP.y - 8 + hash(i + 2) * 14, (hash(i + 3) - .5) * 70, scene); c.scale.y = 0.5; clouds.push(c); }
const coverall = (c) => canvasTex(16, 16, (g) => { g.fillStyle = c; g.fillRect(0, 0, 16, 16); g.fillStyle = 'rgba(0,0,0,0.18)'; g.fillRect(7, 0, 2, 16); g.fillStyle = 'rgba(255,255,255,0.12)'; g.fillRect(2, 3, 4, 3); });
const bastam = makeChar({ seed: 61, skin: 0xb07a50, hipY: 0.84, legX: 0.11, legColor: 0x2f5fb0, shoe: 0x222222, hand: 0xb07a50,
  torsoGeo: cyl(0.24, 0.26, 0.64, 6), torsoTex: coverall('#2f5fb0'), torsoColor: 0xffffff, torsoY: 0.32, sleeve: true, sleeveColor: 0x2f5fb0, shoulderX: 0.3, shoulderY: 0.57, neckY: 0.64, headR: 0.27,
  build(head, torso, reg) { const cap = mesh(new THREE.SphereGeometry(0.28, 8, 4, 0, Math.PI * 2, 0, Math.PI * 0.42), reg(M(0xd8231b)), 0, 0.04, 0, head); mesh(box(0.3, 0.03, 0.2), reg(M(0xd8231b)), 0, 0.1, -0.3, head); mesh(box(0.12, 0.08, 0.02), reg(M(0xffffff)), 0.12, 0.45, 0.25, torso); return {}; } }, scene);

const phoneB = new THREE.Group(); bastam.arms[1].hand.add(phoneB); mesh(box(0.1, 0.19, 0.015), P(0x222222), 0, 0.02, 0.07, phoneB);

// =====================================================================
// HOME (engine8 living room at the origin): the ending
// =====================================================================
const MOM_P = V(-1.0, 0, 1.72);

// ---------- poses / state ----------
function talkPose(p, t, who, amt = 1) {
  if (speakerAt(t) !== who) return p; const e = envAt(t) * amt;
  p.aRx += e * 0.35 * (1 + Math.sin(t * 5.3)); p.eR += e * 0.5; p.hx += Math.sin(t * 7) * e * 0.05; p.hy += Math.sin(t * 2.1) * 0.08; return p;
}
function setFace(c, eyes, mouth, opts = {}) { c.faceMat.map = faceTexture(eyes, mouth, opts); c.faceMat.needsUpdate = true; }

function stateAt(t) {
  // ----- studio -----
  nashwa.root.position.copy(NASH_P); nashwa.root.rotation.set(0, 0.12, 0);
  let np = { ...POSE0, ...SEAT };
  if (inT(t, 64.9, 66.6)) np.hz = -0.12;
  if (t >= 111.0) { const k = easeOut(seg(t, 111.0, 111.3)); np.aLx = lerp(0.55, 1.4, k); np.eL = lerp(0.95, 1.9, k); np.aRx = lerp(0.55, 1.4, k); np.eR = lerp(0.95, 1.9, k); np.y = -0.36 + 0.2 * k; }
  if (inT(t, 69.6, 70.4)) np.hy = 0.5;
  applyPose(nashwa, talkPose(np, t, 'nashwa', 0.7));
  let ne = 'default', nm = talkMouth(t, 'nashwa') || 'smile';
  if (inT(t, 51.2, 53.6)) ne = 'side'; if (inT(t, 64.9, 66.6)) ne = 'smug';
  if (inT(t, 92.7, 94.7)) ne = 'wide'; if (t >= 107.4) { ne = 'wide'; if (!talkMouth(t, 'nashwa')) nm = 'o'; }
  if (t >= 111.0 && talkMouth(t, 'nashwa')) nm = envAt(t) > 0.5 ? 'scream' : 'talk2';
  setFace(nashwa, ne, nm, { blush: true });

  // Ibrahim: seated guest, stands up angry at the call, ducks, pops up with the booster
  dad.root.position.copy(DAD_P); dad.root.rotation.set(0, -0.12, 0); dad.root.visible = true;
  let dp = { ...POSE0, ...SEAT };
  if (t >= 78.0 && t < 82) { const k = easeBack(seg(t, 78.0, 78.4)); dp.y = lerp(-0.36, 0, k); dp.lL = dp.lR = lerp(1.45, 0, k); dp.aLx = lerp(0.55, 1.6, k) + Math.sin(t * 9) * 0.2; dp.aLz = 0.3; dp.eL = 0.4; }
  if (t >= 100.9 && t < T_POP) dad.root.visible = false;
  if (t >= T_POP) { const k = easeBack(seg(t, T_POP, T_POP + 0.35)); dp = { ...POSE0, y: lerp(-1.3, 0, k), aLx: 1.1, eL: 0.9, aRx: 1.1, eR: 0.9, aLz: 0.25, aRz: 0.25 }; dad.root.position.x = S + 1.2; dad.root.rotation.y = -0.3;
    if (t >= 112.3) { const k2 = easeOut(seg(t, 112.3, 112.7)); dp.bend = 0.5 * k2; dp.y = -0.25 * k2; dp.aRx = lerp(1.1, 0.4, k2); dp.eR = lerp(0.9, 0.1, k2); }
  }
  applyPose(dad, talkPose(dp, t, 'dad'));
  let de = 'smug', dm = talkMouth(t, 'dad', 'grin') || 'smile';
  if (inT(t, 66.9, 69.6)) de = 'closed';
  if (inT(t, 70.4, 78.0)) { de = 'angry'; dm = 'frown'; }
  if (inT(t, 78.0, 82)) { de = 'angry'; dm = talkMouth(t, 'dad', 'scream') || 'clench'; }
  if (t >= T_POP) { de = 'sparkle'; dm = talkMouth(t, 'dad', 'grin') || 'grin'; }
  if (t >= T_PLUG) { de = 'x'; dm = 'o'; }
  setFace(dad, de, dm, { stache: true, soot: t >= T_PLUG + 0.1 });
  // booster in Ibrahim's hands
  booster.visible = t >= T_POP && t < T_HOME; cable.visible = plug.visible = booster.visible;
  if (booster.visible) {
    const a = dad.arms[0].hand.getWorldPosition(V(0, 0, 0)), b = dad.arms[1].hand.getWorldPosition(V(0, 0, 0));
    booster.position.copy(a.clone().add(b).multiplyScalar(0.5)).add(V(0, 0.28, 0.12)); booster.rotation.set(-0.2, dad.root.rotation.y, 0);
    const sock = V(S + 2.15, 0.08, 0.5); const from = booster.position.clone().add(V(0, -0.25, 0.1));
    const k = easeIn(seg(t, 112.4, T_PLUG)); const pp = VL(V(S + 2.0, 0.6, 0.9), sock, k); plug.position.copy(pp);
    const mid1 = VL(from, pp, 0.33).add(V(0, -0.3, 0.3)), mid2 = VL(from, pp, 0.66).add(V(0, -0.2, 0.3));
    cable.geometry.setFromPoints([from, mid1, mid2, pp]);
    boosterGlow.material.opacity = t >= T_PLUG ? 0.6 + 0.4 * Math.sin(t * 40) : 0;
  }
  studioLight.intensity = t >= T_PLUG ? (hash(Math.floor(t * 20)) > 0.5 ? 2.5 : 0.2) : 1.2;

  // ----- kitchen archive -----
  { const sh = t > 14.5 && t < T_EXPLODE ? (t - 14.5) * 0.012 : 0; machine.position.set(K + 1.6 + Math.sin(t * 60) * sh, 0, -1.7 + Math.cos(t * 53) * sh); machine.visible = t < T_EXPLODE;
    const a = t - T_EXPLODE; plates.forEach((o) => { o.p.visible = a > 0 && a < 3; if (o.p.visible) { o.p.position.set(K + 1.6 + o.v.x * a, Math.max(0.02, 1.0 + o.v.y * a - 4.9 * a * a), -1.7 + o.v.z * a); o.p.rotation.set(o.s * a, o.s * a * 0.7, 0); } });
    soot.forEach(s => s.visible = t >= T_EXPLODE); }
  // ----- blackout archive -----
  wins.forEach((w) => { const off = T_OUT + w.position.distanceTo(PAN_W) * 0.045; w.material.color.setHex(t >= off && t < 50 ? winOff : winOn); });
  lamps.forEach((l, i) => l.material.color.setHex(t >= T_OUT + 0.5 + i * 0.1 && t < 50 ? 0x222222 : 0xffe8a0));
  { const k = clamp((t - 32.0) / 2.2); panGlow.material.color.setRGB(1, 0.35 + 0.65 * k * (0.7 + 0.3 * Math.sin(t * 30)), 0.06 + 0.9 * k * k); panGlow.visible = t < T_OUT + 0.15; }
  // ----- market archive: tuk-tuk crash -----
  { let p, rz = 0, ry = -0.5;
    if (t < 38.4) p = V(-30, 12, -10);
    else if (t < T_CRASH) { const k = seg(t, 38.4, T_CRASH); p = VL(V(-14, 9, -8), V(0.2, 1.1, -2.5), easeIn(k)); rz = -0.25 - 0.3 * k; ry = -0.5 + 0.3 * k; }
    else { p = V(0.2, 0.75, -2.3); rz = -0.42; ry = -0.2; }
    tuk.position.copy(p); tuk.rotation.set(0, ry, rz); wheels.forEach(w => w.rotation.y = t * 9); }
  { const a = t - T_CRASH; melons.forEach((o, i) => { if (a > 0 && i % 2 === 0) { const tt = Math.min(a, 1.6); o.m.position.copy(o.base.clone().add(o.v.clone().multiplyScalar(tt)).add(V(0, -4.9 * tt * tt, 0))); if (o.m.position.y < -0.6) o.m.position.y = -0.6; } else o.m.position.copy(o.base); });
    chunks.forEach((o) => { o.c.visible = a > 0; if (a > 0) { const tt = Math.min(a, 1.4); o.c.position.set(MK + 0.2 + o.v.x * tt, Math.max(0.05, 1.1 + o.v.y * tt - 4.9 * tt * tt), -2.4 + o.v.z * tt); o.c.rotation.set(tt * 9, tt * 7, 0); } });
    stallTop.userData.aw.rotation.x = a > 0 ? -0.15 - 0.5 * easeOut(clamp(a / 0.3)) : -0.15; stallTop.userData.aw.position.y = a > 0 ? 2.45 - 0.9 * easeOut(clamp(a / 0.3)) : 2.45; }
  { const interview = t >= 43.3;
    shehata.root.position.copy(interview ? V(MK + 0.9, 0, 0.4) : V(MK + 1.9, 0, -0.9)); shehata.root.rotation.set(0, interview ? 0.15 : -0.5, 0);
    let sp = { ...POSE0 };
    if (!interview && t > T_CRASH - 0.3) { sp.aLz = 2.6 + Math.sin(t * 14) * 0.2; sp.aRz = 2.6 + Math.sin(t * 14 + 1) * 0.2; sp.y = -0.1; }
    if (interview) { sp.aRx = 1.0 + Math.sin(t * 3) * 0.15; sp.eR = 1.2; sp.aLz = 0.5 + envAt(t) * 0.6 * (speakerAt(t) === 'shehata' ? 1 : 0); }
    applyPose(shehata, talkPose(sp, t, 'shehata', 0.4));
    setFace(shehata, interview ? 'angry' : (t > T_CRASH - 0.3 ? 'wide' : 'default'), talkMouth(t, 'shehata', 'scream') || (t > T_CRASH - 0.3 && !interview ? 'scream' : 'frown'), { stache: true });
    melonHalf.visible = interview && t < 52; if (melonHalf.visible) { const hp = shehata.arms[1].hand.getWorldPosition(V(0, 0, 0)); melonHalf.position.copy(hp).add(V(0, 0.12, 0.05)); } }
  // ----- Sayed -----
  sayed.root.position.set(SY - 0.4, 0, -1.15); sayed.root.rotation.set(0, 0.25, 0);
  { const p = { ...POSE0, y: -0.38, lL: 1.5, lR: 1.5, aRx: 0.9, eR: 1.3, aRz: 0.15, aLz: 0.3, aLx: 0.4, eL: 0.6 };
    if (inT(t, 26.7, 28.4)) { p.aRx = 1.3 + Math.sin(t * 6) * 0.15; p.eR = 1.1; }
    applyPose(sayed, talkPose(p, t, 'sayed', 0.3));
    setFace(sayed, inT(t, 26.7, 28.4) ? 'side' : 'tired', talkMouth(t, 'sayed') || 'smile', { stache: true, stacheColor: '#dddddd' }); }
  // ----- El-Alamy (phone) -----
  alamy.root.position.set(G - 0.2, 0, -0.4); alamy.root.rotation.set(0, 0.2, 0);
  applyPose(alamy, talkPose({ ...POSE0, aLz: 0.12, aRx: 1.05, aRz: 0.35, eR: 1.75, hx: 0.1 }, t, 'alamy', 0.2));
  setFace(alamy, inT(t, 78.2, 81.6) ? 'smug' : 'smug', talkMouth(t, 'alamy') || (t > 78.2 ? 'smile' : 'flat'), ALAMY_FACE);
  // ----- Bastam in the sky -----
  { const bob = V(Math.sin(t * 0.7) * 0.6, Math.sin(t * 1.3) * 0.4, Math.cos(t * 0.5) * 0.5);
    bastam.root.position.copy(BP).add(bob); bastam.root.rotation.set(Math.sin(t * 1.1) * 0.25, t * 0.35 + (t > 95 ? 2.6 : 0), Math.sin(t * 1.7) * 0.3);
    const w = Math.sin(t * 9);
    const bp = { ...POSE0, aLz: 2.2 + w * 0.5, eL: 0.4, aRx: 0.4, aRz: 0.6, eR: 2.3, lL: 0.6 + w * 0.5, lR: -0.4 - w * 0.5 };
    if (inT(t, 99.0, 100.9)) { bp.aLz = 2.6 + w * 0.3; bp.aRz = 2.6 - w * 0.3; bp.aRx = 0; bp.eR = 0.3; }
    applyPose(bastam, bp); phoneB.visible = !inT(t, 99.0, 100.9);
    setFace(bastam, 'wide', talkMouth(t, 'bastam', 'scream') || 'o', { fuzz: true }); }
  clouds.forEach((c, i) => { c.position.y = BP.y - 8 + hash(i + 2) * 14 + ((t * 2.5 + i * 7) % 30) - 15; });
  // ----- home -----
  mom.root.position.copy(MOM_P); mom.root.rotation.set(0, Math.PI, 0);
  { const p = { ...POSE0, y: -0.33, lL: 1.45, lR: 1.45, aLx: 0.3, eL: 1.2, aRx: 0.3, eR: 1.2 };
    if (t >= 118.9) { const k = easeBack(seg(t, 118.9, 119.2)); p.y = lerp(-0.33, 0, k); p.lL = p.lR = lerp(1.45, 0, k); p.aLz = 2.4 * k; p.aRz = 2.4 * k; p.eL = p.eR = 0.3; }
    applyPose(mom, p);
    setFace(mom, t >= 118.9 ? 'angry' : inT(t, 116.9, 118.9) ? 'side' : 'flat', talkMouth(t, 'mom', 'scream') || (t >= 119.8 ? 'clench' : 'flat'), {}); }
  dad.afro.visible = false;
  mic.visible = false;
}

// ---------- lighting per set ----------
function look(kind, t) {
  const L = {
    studio: [0xc0c8e0, 0.75, 0x101a3a, 0.9, 0.0],
    day: [0xfff4e0, 0.7, 0x8ec8ff, 1.1, 0.0],
    kitchen: [0xfff4e0, 0.75, 0x202020, 0.9, 0.0],
    night: [0x5060a0, 0.4, 0x070b1c, 0.0, 0.25],
    sky: [0xffffff, 0.8, 0x8ec8ff, 1.2, 0.0],
    home: [0x203050, 0.18, 0x000000, 0.0, 0.08],
  }[kind];
  ambient.color.setHex(L[0]); ambient.intensity = L[1]; scene.background = new THREE.Color(L[2]); sun.intensity = L[3]; moon.intensity = L[4];
  tvLight.intensity = kind === 'home' ? 1.5 + 2.5 * hash(Math.floor(t * 24)) : 0; tvLight.color.setHex(0xcfe0ff);
  hallLight.intensity = 0; balcLight.intensity = 0; camera.far = kind === 'sky' ? 900 : 90;
  fill.intensity = kind === 'home' ? 0.15 : kind === 'night' ? 0.4 : 1.2;
}

// ---------- shots ----------
// returns a description; 'split' shots render two views side by side
function shotAt(t) {
  if (t < 2.6) return { set: 'studio', f: () => { const k = easeInOut(seg(t, 0, 2.6)); cam(VL(V(S, 3.4, 9.5), V(S, 2.0, 4.6), k), V(S, 1.4, -1.2), 48); } };
  if (t < 9.6) return { set: 'studio', f: () => { const k = easeInOut(seg(t, 2.6, 5.0)); cam(VL(V(S - 0.3, 1.8, 3.6), V(S - 0.45, 1.45, 1.4), k), VL(V(S, 1.2, -0.8), headOf(nashwa).add(V(0.15, -0.15, 0)), k), lerp(46, 40, k)); } };
  if (t < 12.85) return { set: 'studio', f: () => faceCam(nashwa, 2.4, 0.6, 0.05, 42, 0.25) };
  if (t < 21.3) return { set: 'kitchen', archive: true, f: () => {
    if (t < T_EXPLODE) { const k = easeInOut(seg(t, 12.85, T_EXPLODE)); cam(VL(V(K - 0.8, 1.7, 2.6), V(K + 0.9, 1.35, 0.4), k), V(K + 1.5, 0.8, -1.7), 50); }
    else cam(V(K - 0.4, 1.9, 2.9).add(shake(t, t < T_EXPLODE + 0.8 ? 0.25 : 0.03)), V(K + 1.2, 1.0, -1.6), 56); } };
  if (t < 28.3) return { set: 'day', f: () => { faceCam(sayed, 2.3, 0.5, 0.05, 44, 0.3); placeMic(sayed, -1); } };
  if (t < 32.0) return { set: 'studio', f: () => faceCam(nashwa, 2.3, -0.55, 0.05, 40, 0.25) };
  if (t < 37.6) return { set: 'night', archive: true, f: () => {
    if (t < T_OUT) { const k = easeInOut(seg(t, 32.0, T_OUT)); cam(VL(V(N - 1.5, 1.7, 13), V(N - 0.2, 3.5, 7.5), k), PAN_W.clone().add(V(-0.5, -0.5, 0)), 40); }
    else { const k = easeOut(seg(t, T_OUT, 37.6)); cam(VL(V(N - 0.2, 3.5, 7.5), V(N + 1, 5, 24), k).add(shake(t, t < T_OUT + 0.4 ? 0.12 : 0)), VL(PAN_W, V(N, 6, -8), k), lerp(40, 60, k)); } } };
  if (t < 43.3) return { set: 'day', archive: true, f: () => {
    const tp = tuk.getWorldPosition(V(0, 0, 0));
    if (t < T_CRASH) cam(V(MK + 3.2, 1.5, 6.8), VL(V(MK, 1.6, -2.6), tp.clone().add(V(0, 1, 0)), 0.55), 52);
    else cam(V(MK + 2.6, 1.6, 6.0).add(shake(t, t < T_CRASH + 0.6 ? 0.22 : 0.02)), V(MK + 0.2, 1.0, -2.4), 52); } };
  if (t < 50.9) return { set: 'day', f: () => { faceCam(shehata, 2.6, -0.7, 0.05, 46, 0.3); placeMic(shehata, -1); } };
  if (t < 57.2) return { set: 'studio', f: () => { const k = easeInOut(seg(t, 50.9, 57.2)); cam(VL(V(S + 0.1, 1.9, 4.0), V(S + 0.1, 1.75, 3.0), k), V(S + 0.1, 1.2, -0.8), 46); } };
  if (t < 64.7) return { set: 'studio', f: () => faceCam(dad, 2.3, -0.5, 0.05, 40, 0.25) };
  if (t < 66.7) return { set: 'studio', f: () => faceCam(nashwa, 1.9, 0.35, 0.02, 38, 0.2) };
  if (t < 69.6) return { set: 'studio', f: () => faceCam(dad, 2.0, -0.4, 0.05, 40, 0.2) };
  if (t < 81.6) return { split: true, labels: ['الاستوديو', 'على التليفون'],
    a: () => { look('studio', t); if (t < 78.0) faceCam(dad, 2.2, -0.2, 0.05, 50, 0.25); else cam(headOf(dad).add(V(-0.3, 0.0, 1.9)).add(shake(t, t < 78.5 ? 0.05 : 0)), headOf(dad).add(V(0, -0.35, 0)), 56); },
    b: () => { look('day', t); scene.background = new THREE.Color(0x30384a); faceCam(alamy, 2.2, -0.35, 0.0, 50, 0.25); } };
  if (t < 85.7) return { set: 'studio', f: () => faceCam(nashwa, 2.3, 0.5, 0.05, 40, 0.25) };
  if (t < 95.0) return { split: true, labels: ['الاستوديو', 'مباشر من السما'],
    a: () => { look('studio', t); faceCam(nashwa, 2.1, 0.25, 0.05, 50, 0.25); },
    b: () => { look('sky', t); camera.far = 900; const h = headOf(bastam); cam(h.clone().add(V(0.5, 0.3, 3.2)).add(shake(t, 0.06)), h.clone().add(V(0, -0.5, 0)), 56); } };
  if (t < 100.9) return { set: 'sky', f: () => {
    const h = headOf(bastam);
    if (t < 96.9) { const tgt = V(SKX - 80, 0, -90); const d = tgt.clone().sub(h).normalize(); cam(h.clone().add(V(1.6, 2.6, 3.4)), h.clone().add(d.multiplyScalar(10)), 60); }
    else if (t < 99.0) { const k = easeInOut(seg(t, 96.9, 97.9)); const tgt = VL(V(SKX - 80, 0, -90), V(SKX + 45, 0, 10), k); const d = tgt.clone().sub(h).normalize(); cam(h.clone().add(V(1.6, 2.6, 3.4)), h.clone().add(d.multiplyScalar(10)), 60); }
    else faceCam(bastam, 1.4, 0.3, 0.1, 50, 0.1); } };
  if (t < 107.1) return { twoD: 'weather' };
  if (t < 111.0) return { set: 'studio', f: () => { cam(V(S + 0.5, 1.75, 3.6).add(shake(t, t < T_POP + 0.3 ? 0.06 : 0)), V(S + 0.6, 1.4, -0.8), 46); } };
  if (t < 112.4) return { set: 'studio', f: () => faceCam(nashwa, 1.8, 0.3, 0.05, 40, 0.2) };
  if (t < T_PLUG) return { set: 'studio', f: () => cam(V(S + 2.6, 0.55, 1.6), V(S + 2.05, 0.1, 0.5), 44) };
  if (t < 113.4) return { set: 'studio', f: () => cam(V(S + 0.5, 1.75, 3.6).add(shake(t, 0.3)), V(S + 0.6, 1.3, -0.8), 50) };
  if (t < T_HOME) return { twoD: 'nosignal' };
  return { set: 'home', f: () => {
    const h = headOf(mom);
    if (t < 118.9) { const k = easeInOut(seg(t, T_HOME, 118.9)); cam(VL(V(-0.6, 1.4, -1.6), V(-0.85, 1.35, -0.2), k), h.clone().add(V(0, -0.1, 0)), 46); }
    else if (t < 120.4) cam(h.clone().add(V(0.1, 0.05, -1.25)).add(shake(t, 0.08)), h.clone().add(V(0, -0.05, 0)), 46);
    else { const k = easeInOut(seg(t, 120.4, 128)); cam(VL(V(-0.6, 1.5, -1.4), V(0.6, 2.2, -3.2), k), VL(h, V(-0.6, 1.0, 1.0), k), 50); } } };
}

// ---------- 2D: news graphics ----------
const TICK = '   عاجل: بستم لسه طاير   •   سعر البطيخ المكسور: اتنين بخمسة   •   الفانلة الحمرا لسه تريند   •   أبو سمير يحذّر: ممنوع السرقة   •   المطبخ لسه بيتصلّح   •';
function drawTicker(g, t) {
  const y = 314; g.fillStyle = 'rgba(8,14,40,0.92)'; g.fillRect(0, y, W, 24); g.fillStyle = '#d8231b'; g.fillRect(W - 78, y, 78, 24);
  arText(g, 'عاجل', W - 14, y + 1, 19, '#fff'); g.save(); g.beginPath(); g.rect(0, y, W - 78, 24); g.clip();
  g.font = '17px Lalezar'; g.direction = 'rtl'; const tw = g.measureText(TICK).width; const off = (t * 70) % tw;
  for (let k = -1; k <= 1; k++) arText(g, TICK, (W - 90) + off - k * tw - tw + tw, y + 3, 17, '#ffe14a');
  g.restore();
}
function drawBug(g, t) {
  g.fillStyle = '#d8231b'; g.fillRect(16, 14, 84, 26); pxText(g, 'LIVE', 24, 22, 10, '#fff', 'left', false);
  if (Math.floor(t * 2) % 2) { g.fillStyle = '#fff'; g.beginPath(); g.arc(88, 27, 5, 0, 7); g.fill(); }
  g.fillStyle = 'rgba(8,14,40,0.85)'; g.fillRect(W - 140, 14, 124, 30); g.fillStyle = '#d8231b'; g.fillRect(W - 140, 40, 124, 4);
  arText(g, 'عاجل جدًا', W - 24, 14, 22, '#fff');
  const mm = Math.floor(t / 60), ss = Math.floor(t % 60); pxText(g, `21:${String(4 + mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`, 16, 48, 8, '#9fd0ff', 'left');
}
const LOWER = [
  [3.0, 8.8, 'نشوى', 'مذيعة نشرة «عاجل جدًا»', 0],
  [21.7, 27.6, 'عم سيد', 'شاهد عيان — بوّاب العمارة', 0],
  [43.7, 50.3, 'شحاتة', 'تاجر بطيخ مستورد (متضرر)', 0],
  [51.4, 62.0, 'إبراهيم', 'GUEST', 0],
  [71.0, 77.6, 'العالمي', 'مدير مركز الصيانة — على التليفون', 1],
  [88.2, 94.6, 'بستم', 'مباشر من السما', 1],
];
function drawLower(g, t) {
  for (const [a, b, name, role, half] of LOWER) {
    if (t < a || t >= b) continue;
    const k = easeOut(clamp((t - a) / 0.35)) * (1 - easeIn(clamp((t - b + 0.3) / 0.3)));
    const x0 = half ? W / 2 + 10 : 16, ww = half ? W / 2 - 26 : 330, x = x0 - (1 - k) * (ww + 40), y = 254;
    g.fillStyle = '#d8231b'; g.fillRect(x, y, ww, 30); g.fillStyle = 'rgba(8,14,40,0.92)'; g.fillRect(x, y + 30, ww, 22);
    arText(g, name, x + ww - 10, y + 1, 24, '#fff');
    let r = role;
    if (role === 'GUEST') {
      if (t < 53.9) r = 'المتهم الأول';
      else { r = 'الضيف: المخترع العالمي'; }
      if (t >= 53.6 && t < 54.2) { arText(g, 'المتهم الأول', x + ww - 10, y + 31, 17, '#ffe14a'); g.fillStyle = '#ffe14a'; g.fillRect(x + ww - 10 - 100 * easeOut(seg(t, 53.6, 53.9)), y + 42, 100 * easeOut(seg(t, 53.6, 53.9)), 3); continue; }
    }
    arText(g, r, x + ww - 10, y + 31, 17, '#ffe14a');
  }
}
function drawArchive(g, t) {
  g.fillStyle = 'rgba(0,0,0,0.55)'; g.fillRect(16, 14, 150, 30); g.fillStyle = '#fff'; arText(g, 'أرشيف', 158, 14, 22, '#fff'); pxText(g, 'ARCHIVE', 24, 24, 9, '#ffe14a', 'left', false);
  if (Math.floor(t * 2) % 2) { g.fillStyle = '#d8231b'; g.beginPath(); g.arc(W - 70, 30, 6, 0, 7); g.fill(); } pxText(g, 'REC', W - 58, 24, 9, '#fff', 'left');
  for (let i = 0; i < 3; i++) { const yy = ((t * 90 + i * 160) % (H + 40)) - 20; g.fillStyle = 'rgba(255,255,255,0.08)'; g.fillRect(0, yy, W, 3); }
}
function drawSplitFrame(g, labels) {
  g.fillStyle = '#fff'; g.fillRect(W / 2 - 2, 0, 4, H);
  for (const [i, s] of labels.entries()) { const x = i ? W - 16 : W / 2 - 16; g.fillStyle = 'rgba(8,14,40,0.85)'; g.fillRect(x - 130, 52, 130, 26); arText(g, s, x - 8, 52, 19, i ? '#ffe14a' : '#fff'); }
}
function drawWeather(g, t) {
  const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#0a3a8a'); gr.addColorStop(1, '#04163e'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
  g.fillStyle = '#2f7fc8'; g.fillRect(0, 60, W, 44);
  const pts = [[160, 100], [300, 92], [380, 98], [430, 106], [500, 92], [482, 150], [458, 196], [440, 160], [432, 140], [448, 230], [502, 330], [160, 330]];
  g.fillStyle = '#e0c070'; g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.closePath(); g.fill(); g.strokeStyle = '#fff'; g.lineWidth = 2; g.stroke();
  g.strokeStyle = '#2f7fc8'; g.lineWidth = 4; g.beginPath(); g.moveTo(362, 330); g.lineTo(370, 240); g.lineTo(362, 152); g.stroke();
  g.lineWidth = 3; for (const dx of [-30, -12, 8, 26]) { g.beginPath(); g.moveTo(362, 152); g.lineTo(362 + dx, 104); g.stroke(); }
  const city = (x, y, n) => { g.fillStyle = '#fff'; g.beginPath(); g.arc(x, y, 4, 0, 7); g.fill(); arText(g, n, x - 8, y - 8, 15, '#04163e'); };
  city(318, 110, 'إسكندرية'); city(364, 156, 'القاهرة'); city(398, 270, 'الأقصر');
  const sunI = (x, y) => { g.fillStyle = '#ffd400'; g.beginPath(); g.arc(x, y, 12, 0, 7); g.fill(); g.strokeStyle = '#ffd400'; g.lineWidth = 3; for (let i = 0; i < 8; i++) { const a = i / 8 * 6.28 + t; g.beginPath(); g.moveTo(x + Math.cos(a) * 16, y + Math.sin(a) * 16); g.lineTo(x + Math.cos(a) * 22, y + Math.sin(a) * 22); g.stroke(); } };
  sunI(250, 200); sunI(430, 290); pxText(g, '34°', 236, 222, 10, '#fff'); pxText(g, '41°', 416, 312, 10, '#fff');
  // Bastam's flight path over Greater Cairo
  const k = clamp((t - 101.5) / 4.5); const path = (u) => [300 + u * 90 + Math.sin(u * 9) * 18, 70 + u * 80 + Math.cos(u * 7) * 14];
  g.strokeStyle = 'rgba(255,255,255,0.8)'; g.setLineDash([6, 6]); g.lineWidth = 2; g.beginPath(); for (let u = 0; u <= k; u += 0.02) { const [x, y] = path(u); u ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke(); g.setLineDash([]);
  const [bx, by] = path(k); g.fillStyle = '#b07a50'; g.beginPath(); g.arc(bx, by, 11, 0, 7); g.fill(); g.fillStyle = '#d8231b'; g.beginPath(); g.arc(bx, by - 3, 11, Math.PI, 0); g.fill(); g.fillStyle = '#111'; g.fillRect(bx - 5, by + 1, 3, 3); g.fillRect(bx + 2, by + 1, 3, 3);
  if (t > 103.9) { const a = easeBack(seg(t, 103.9, 104.3)); g.save(); g.translate(452, 150); g.scale(a, a); g.fillStyle = '#d8231b'; g.fillRect(-92, -26, 184, 54); g.strokeStyle = '#fff'; g.lineWidth = 2; g.strokeRect(-92, -26, 184, 54); arText(g, 'احتمال سقوط بستم', 82, -24, 18, '#fff'); pxText(g, '90%', 0, 6, 14, '#ffe14a', 'center'); g.restore(); }
  g.fillStyle = '#d8231b'; g.fillRect(0, 0, W, 56); arText(g, 'النشرة الجوية', W - 20, 6, 32, '#fff'); pxText(g, 'WEATHER', 20, 22, 12, '#ffe14a', 'left');
}
function drawNoSignal(g, t) {
  const cols = ['#c0c0c0', '#c0c000', '#00c0c0', '#00c000', '#c000c0', '#c00000', '#0000c0'];
  if (t < T_PLUG + 0.9) { cols.forEach((c, i) => { g.fillStyle = c; g.fillRect(i * W / 7, 0, W / 7 + 1, H); }); }
  else { g.fillStyle = '#000'; g.fillRect(0, 0, W, H); }
  for (let i = 0; i < 900; i++) { const v = (hash(i + Math.floor(t * 30) * 13) * 255) | 0; g.fillStyle = `rgba(${v},${v},${v},0.85)`; g.fillRect((hash(i * 3 + Math.floor(t * 30)) * W) | 0, (hash(i * 7 + 2 + Math.floor(t * 30)) * H) | 0, 6, 3); }
  g.fillStyle = 'rgba(0,0,0,0.75)'; g.fillRect(W / 2 - 170, H / 2 - 52, 340, 92);
  arText(g, 'لا توجد إشارة', W / 2, H / 2 - 50, 40, '#fff', 'center'); pxText(g, 'NO SIGNAL', W / 2, H / 2 + 12, 14, '#ffe14a', 'center');
}
function drawIntro(g, t) {
  if (t >= 2.7) return;
  const a = easeBack(seg(t, 0.15, 0.55)), out = easeIn(seg(t, 2.2, 2.6));
  g.save(); g.translate(W / 2 - out * W * 1.2, 200); g.scale(a, a);
  g.fillStyle = '#d8231b'; g.fillRect(-230, -60, 460, 120); g.strokeStyle = '#fff'; g.lineWidth = 4; g.strokeRect(-230, -60, 460, 120);
  arText(g, 'عاجل!', 0, -62, 92, '#fff', 'center', 'ReemKufi'); g.fillStyle = '#04163e'; g.fillRect(-230, 60, 460, 30); pxText(g, 'BREAKING NEWS', 0, 68, 14, '#ffe14a', 'center');
  g.restore();
  for (let i = 0; i < 5; i++) { const x = ((t * 900 + i * 160) % (W + 200)) - 100; g.fillStyle = 'rgba(255,255,255,0.18)'; g.fillRect(x, 0, 10, H); }
}
function drawEnd(g, t) {
  if (t < 120.4) return;
  { const a = easeOut(seg(t, 120.5, 120.9)); g.fillStyle = `rgba(0,0,0,${0.45 * a})`; g.fillRect(0, 0, W, H);
    g.save(); g.globalAlpha = a; g.fillStyle = 'rgba(20,20,30,0.95)'; g.fillRect(60, 40, W - 120, 92); g.strokeStyle = '#d8231b'; g.lineWidth = 3; g.strokeRect(60, 40, W - 120, 92);
    pxText(g, 'BROADCAST LOST', 80, 54, 14, '#ff5a4a', 'left', false); pxText(g, 'SIGNAL', 80, 92, 10, '#fff', 'left', false);
    for (let i = 0; i < 10; i++) { g.fillStyle = '#333'; g.fillRect(170 + i * 24, 86, 18, 22); } pxText(g, '0%', 430, 92, 12, '#ff5a4a', 'left', false);
    arText(g, 'الإرسال انقطع', W - 80, 50, 26, '#fff'); g.restore(); }
  if (t >= 124.4 && t < 129.4) { const k = easeBack(seg(t, 124.4, 124.75)); g.save(); g.translate(W / 2, 236); g.scale(k, k); g.fillStyle = 'rgba(0,0,30,0.9)'; g.fillRect(-250, -40, 500, 84); g.strokeStyle = '#ffe14a'; g.lineWidth = 3; g.strokeRect(-250, -40, 500, 84);
    g.fillStyle = '#ffe14a'; g.beginPath(); for (let i = 0; i < 10; i++) { const a = i / 10 * 6.28 - Math.PI / 2, r = i % 2 ? 9 : 20; g.lineTo(-206 + Math.cos(a) * r, 2 + Math.sin(a) * r); } g.fill();
    pxText(g, 'ACHIEVEMENT UNLOCKED', 30, -28, 11, '#ffe14a', 'center', false); arText(g, 'كارثة على الهوا', 30, -8, 34, '#fff', 'center'); g.restore(); }
  if (t >= 129.4) { const k = easeOut(seg(t, 129.4, 129.8)); g.fillStyle = `rgba(0,0,0,${0.7 * k})`; g.fillRect(0, 0, W, H); g.save(); g.translate(W / 2, 200); g.scale(k, k); arText(g, 'يُتبع...', 0, -40, 54, '#ffe14a', 'center', 'ReemKufi'); pxText(g, 'TO BE CONTINUED', 0, 30, 16, '#fff', 'center'); g.restore(); }
  if (t > 132.0) { g.fillStyle = `rgba(0,0,0,${clamp((t - 132.0) / 0.8)})`; g.fillRect(0, 0, W, H); }
}

// ---------- names + portraits for the dialogue box ----------
const NAMES = { nashwa: ['نشوى', 'NASHWA', '#d8231b'], sayed: ['عم سيد', 'UNCLE SAYED', '#6b5a48'], shehata: ['شحاتة', 'SHEHATA', '#3a5aa8'], dad: ['إبراهيم', 'IBRAHIM', '#c9a227'], alamy: ['العالمي', 'EL-ALAMY', '#151518'], bastam: ['بستم', 'BASTAM', '#2f5fb0'], mom: ['أم حمادة', 'OM HAMADA', '#1f9e5a'] };
function portrait(g, x, y, who, t) {
  g.fillStyle = '#123'; g.fillRect(x, y, 64, 64); g.strokeStyle = '#fff'; g.lineWidth = 2; g.strokeRect(x, y, 64, 64);
  g.save(); g.beginPath(); g.rect(x + 2, y + 2, 60, 60); g.clip();
  const skin = { nashwa: '#d09a70', sayed: '#8a5a3a', shehata: '#9a6440', dad: '#b27448', alamy: '#c08a60', bastam: '#b07a50', mom: '#c98d5f' }[who];
  const shirt = { nashwa: '#c8202a', sayed: '#6b5a48', shehata: '#e8eef8', dad: '#f3f0e3', alamy: '#151518', bastam: '#2f5fb0', mom: '#e86a8a' }[who];
  g.fillStyle = shirt; g.fillRect(x + 8, y + 54, 48, 10);
  if (who === 'nashwa') { g.fillStyle = '#2a1810'; g.fillRect(x + 10, y + 20, 44, 34); g.fillStyle = '#f6f6f2'; g.beginPath(); g.moveTo(x + 26, y + 54); g.lineTo(x + 38, y + 54); g.lineTo(x + 32, y + 63); g.fill(); }
  if (who === 'mom') { g.fillStyle = '#1f9e5a'; g.beginPath(); g.arc(x + 32, y + 36, 25, 0, 7); g.fill(); }
  g.fillStyle = skin; g.beginPath(); g.arc(x + 32, y + 36, 20, 0, 7); g.fill();
  if (who === 'nashwa') { g.fillStyle = '#2a1810'; g.beginPath(); g.arc(x + 32, y + 30, 21, Math.PI, 0); g.fill(); }
  if (who === 'mom') { g.fillStyle = '#1f9e5a'; g.beginPath(); g.arc(x + 32, y + 30, 22, Math.PI, 0); g.fill(); }
  if (who === 'sayed') { g.fillStyle = '#f4f2ea'; g.beginPath(); g.ellipse(x + 32, y + 18, 22, 9, 0, 0, 7); g.fill(); }
  if (who === 'shehata') { g.fillStyle = '#f2f2f2'; g.beginPath(); g.arc(x + 32, y + 26, 21, Math.PI, 0); g.fill(); }
  if (who === 'bastam') { g.fillStyle = '#d8231b'; g.beginPath(); g.arc(x + 32, y + 26, 21, Math.PI, 0); g.fill(); }
  if (who === 'alamy') { g.fillStyle = '#101013'; g.fillRect(x + 24, y + 50, 16, 14); g.fillStyle = '#b9bcc4'; g.fillRect(x + 23, y + 54, 2, 10); g.fillRect(x + 39, y + 54, 2, 10); g.fillStyle = '#0c0a09'; g.beginPath(); g.arc(x + 32, y + 29, 20.5, Math.PI, 0); g.fill(); g.beginPath(); g.ellipse(x + 34, y + 12, 15, 5, -0.1, 0, 7); g.fill(); g.fillRect(x + 11, y + 28, 4, 9); g.fillRect(x + 49, y + 28, 4, 9); }
  if (who === 'dad') { g.fillStyle = '#1b1410'; g.fillRect(x + 10, y + 30, 5, 12); g.fillRect(x + 49, y + 30, 5, 12); g.fillStyle = '#c9a227'; g.fillRect(x + 14, y + 16, 36, 5); }
  const fc = document.createElement('canvas'); fc.width = 32; fc.height = 32; const fg = fc.getContext('2d');
  const e = envAt(t); const mouth = speakerAt(t) === who ? (e < 0.1 ? 'closed' : e < 0.4 ? 'talk1' : 'talk2') : 'closed';
  const eyes = { nashwa: 'default', sayed: 'tired', shehata: 'angry', dad: 'smug', alamy: 'smug', bastam: 'wide', mom: 'angry' }[who];
  drawFace(fg, 32, eyes, mouth, { stache: who === 'dad' || who === 'sayed' || who === 'shehata', stacheColor: who === 'sayed' ? '#dddddd' : undefined, fuzz: who === 'bastam', blush: who === 'nashwa' });
  g.imageSmoothingEnabled = false; g.drawImage(fc, x + 14, y + 20, 36, 36); g.restore();
}

// ---------- particles ----------
function particles(t) {
  const stars = [], puffs = [], trails = [];
  // pan sparks before the blackout
  if (t >= 32.0 && t < T_OUT + 0.3) for (let i = 0; i < 10; i++) { const k = (t * 2.2 + i * 0.1) % 1; stars.push({ pos: PAN_W.clone().add(V((hash(i) - .5) * 1.4 * k, 0.2 + k * 1.2, (hash(i + 4) - .5) * k)), size: 0.2 * (1 - k), color: 0xffd040 }); }
  // kitchen explosion
  { const a = t - T_EXPLODE; if (a > 0 && a < 2.3) { for (let i = 0; i < 14; i++) { const k = Math.min(1, a * (0.8 + hash(i) * 0.6)); puffs.push({ pos: V(K + 1.6 + (hash(i + 1) - .5) * 3 * k, 0.8 + k * 1.6 * hash(i + 2), -1.6 + (hash(i + 3) - .2) * 2 * k), size: 0.5 + k * 1.4, op: 1 - a / 2.3, color: i % 3 ? 0x555555 : 0xff8a30 }); }
      for (let i = 0; i < 10; i++) { const k = a * 3; stars.push({ pos: V(K + 1.6 + Math.cos(i) * k, 1.0 + Math.sin(i * 2) * k * 0.5 + 0.3, -1.4 + Math.sin(i) * k * 0.5), size: 0.3 * Math.max(0, 1 - a), color: 0xffe14a }); } }
    if (t > 14.5 && t < T_EXPLODE) for (let i = 0; i < 4; i++) { const k = (t * 1.5 + i * 0.25) % 1; puffs.push({ pos: V(K + 2.05 + k * 0.4, 1.05 + k * 0.5, -1.7), size: 0.15 + k * 0.4, op: 0.8 * (1 - k), color: 0x777777 }); } }
  // tuk trail
  if (t >= 38.4 && t < T_CRASH) { const tp = tuk.getWorldPosition(V(0, 0, 0)); for (let i = 0; i < 10; i++) trails.push({ pos: tp.clone().add(V(-0.8 - i * 0.45, 0.6 + i * 0.12, -i * 0.15)), size: 0.5 + i * 0.08, op: 1 - i / 10, color: i < 2 ? 0xffa030 : 0xdddddd }); }
  { const a = t - T_CRASH; if (a > 0 && a < 1.8) for (let i = 0; i < 12; i++) { const k = Math.min(1, a * 1.5); puffs.push({ pos: V(MK + 0.2 + (hash(i) - .5) * 4 * k, 0.5 + hash(i + 1) * 2 * k, -2.4 + (hash(i + 2) - .5) * 2 * k), size: 0.6 + k, op: 1 - a / 1.8, color: 0xc8b890 }); } }
  // studio plug sparks
  if (t >= T_PLUG && t < 113.4) { for (let i = 0; i < 12; i++) { const k = ((t - T_PLUG) * 4 + i * 0.08) % 1; const o = i % 2 ? booster.position : V(S + 2.15, 0.1, 0.5); stars.push({ pos: o.clone().add(V(Math.cos(i * 2.3) * k * 0.9, Math.sin(i * 1.7) * k * 0.6 + 0.2, Math.sin(i) * k * 0.4)), size: 0.18 * (1 - k), color: i % 3 ? 0x9fd0ff : 0xffffff }); } }
  emit(stars, starPool); emit(puffs, puffPool); emit(trails, trailPool); emit([], sweatPool);
}

// ---------- TV static at home ----------
function drawHomeTV(t) {
  const g = tvTex.userData.g; for (let i = 0; i < 220; i++) { const v = (hash(i + Math.floor(t * 24) * 11) * 255) | 0; g.fillStyle = `rgb(${v},${v},${v})`; g.fillRect((hash(i * 3 + Math.floor(t * 24)) * 128) | 0, (hash(i * 7 + Math.floor(t * 24)) * 96) | 0, 10, 5); } tvTex.needsUpdate = true;
}

function fullView() { renderer.setScissorTest(false); renderer.setViewport(0, 0, W, H); camera.aspect = W / H; camera.updateProjectionMatrix(); }
window.renderFrame = function (t) {
  stateAt(t); drawWall(t); particles(t);
  const s = shotAt(t);
  ctx.clearRect(0, 0, W, H);
  if (s.twoD) { /* 2D only */ }
  else if (s.split) {
    renderer.setScissorTest(true); renderer.setClearColor(0x000000, 1);
    for (const [i, fn] of [[0, s.a], [1, s.b]]) { mic.visible = false; fn(); camera.aspect = (W / 2) / H; camera.updateProjectionMatrix(); renderer.setViewport(i * W / 2, 0, W / 2, H); renderer.setScissor(i * W / 2, 0, W / 2, H); renderer.render(scene, camera); }
    fullView(); ctx.drawImage(glCanvas, 0, 0);
  } else {
    look(s.set, t); fullView(); s.f(); camera.aspect = W / H; camera.updateProjectionMatrix();
    if (s.set === 'home') drawHomeTV(t);
    renderer.render(scene, camera);
    if (s.archive) ctx.filter = 'sepia(0.55) saturate(0.85) contrast(1.08)';
    ctx.drawImage(glCanvas, 0, 0); ctx.filter = 'none';
  }
  h.clearRect(0, 0, W, H);
  if (s.twoD === 'weather') drawWeather(h, t);
  if (s.twoD === 'nosignal') drawNoSignal(h, t);
  const news = !s.twoD && s.set !== 'home';
  if (s.archive) drawArchive(h, t); else if (news) drawBug(h, t);
  if (s.split) drawSplitFrame(h, s.labels);
  if (news || s.twoD === 'weather') drawTicker(h, t);
  if (news) drawLower(h, t);
  drawIntro(h, t);
  if (s.set === 'kitchen' && t >= T_EXPLODE + 0.4) { const k = easeBack(seg(t, T_EXPLODE + 0.4, T_EXPLODE + 0.7)); h.save(); h.translate(W / 2, 150); h.scale(k, k); h.fillStyle = 'rgba(20,0,0,0.85)'; h.fillRect(-200, -34, 400, 68); h.strokeStyle = '#ff3a2a'; h.lineWidth = 3; h.strokeRect(-200, -34, 400, 68); pxText(h, 'KITCHEN HEALTH: 0%', 0, -18, 14, '#ff5a4a', 'center'); arText(h, 'صحة المطبخ: صفر', 0, -2, 22, '#fff', 'center'); h.restore(); }
  drawDialogue(h, t);
  drawEnd(h, t);
  ctx.drawImage(hud, 0, 0); vignette(ctx, 0.3);
  if (t >= T_EXPLODE && t < T_EXPLODE + 0.08) { ctx.fillStyle = 'rgba(255,240,200,0.85)'; ctx.fillRect(0, 0, W, H); }
  if (t >= T_OUT && t < T_OUT + 0.06) { ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.fillRect(0, 0, W, H); }
  if (t >= T_CRASH && t < T_CRASH + 0.07) { ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.fillRect(0, 0, W, H); }
  if (t >= T_PLUG && t < T_PLUG + 0.1) { ctx.fillStyle = 'rgba(200,230,255,0.9)'; ctx.fillRect(0, 0, W, H); }
  if (t >= 116.2 && t < T_HOME) { ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); }
  return true;
};
window.frameData = () => out.toDataURL('image/png');
window.DUR = DUR;
document.fonts.load('10px PS2P').then(() => document.fonts.load('20px Lalezar', 'ع')).then(() => document.fonts.load('700 20px ReemKufi', 'ع')).then(() => {
  lateDraw.forEach(f => f()); window.READY = true;
});
