// الشبشب — FINAL BOSS. Deterministic low-poly Y2K console cutscene.
// Same engine family as "Jet Dishwasher 3000": window.renderFrame(t) draws frame t into #out.
import * as THREE from 'three';

const W = 640, H = 480;
const DUR = 54.0;
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
// الضيوف جايين — the living room speedrun + the forbidden salon
// =====================================================================
balcony.visible = false; hallway.visible = true;
const T_ALARM = 8.05, T_HIDE = 19.3, T_DOOR = 24.75, T_MSG = 33.9, T_RES = 44.0, T_ENDC = 51.9;
const dayWinTex = canvasTex(32, 32, (g) => { const gr = g.createLinearGradient(0, 0, 0, 32); gr.addColorStop(0, '#9cc8ff'); gr.addColorStop(1, '#ffe0b0'); g.fillStyle = gr; g.fillRect(0, 0, 32, 32); const r = rng(8); for (let x = 0; x < 32; x += 5) { const h = 6 + r() * 12 | 0; g.fillStyle = '#b48a6a'; g.fillRect(x, 32 - h, 4, h); } });
win.children[0].material.map = dayWinTex; win.children[0].material.needsUpdate = true;
const sun = new THREE.DirectionalLight(0xffe2b0, 1.2); sun.position.set(-6, 5, -1); scene.add(sun);
const alarm = new THREE.PointLight(0xff2020, 0, 12, 1.0); alarm.position.set(0, 2.8, -1); scene.add(alarm);
poster.position.x = 2.9;

// ---------- cut a doorway into the back wall (x -3.8..-2.2) ----------
const back = room.children.find(m => m.isMesh && Math.abs(m.position.z + 4) < 0.01 && m.geometry.parameters && m.geometry.parameters.width === 9);
back.visible = false;
wall(room, 6.7, 3.2, 1.15, 1.6, -4, 0, wallMat);           // x -2.2 .. 4.5
wall(room, 0.7, 3.2, -4.15, 1.6, -4, 0, wallMat);          // x -4.5 .. -3.8
wall(room, 1.6, 0.9, -3.0, 2.75, -4, 0, wallMat);          // above the door
const goldM = P(0xd4a62a, { shininess: 100, specular: 0xffffcc });
mesh(box(1.8, 0.12, 0.08), goldM, -3.0, 2.36, -3.97, room); for (const x of [-3.85, -2.15]) mesh(box(0.1, 2.36, 0.08), goldM, x, 1.18, -3.97, room);
// double doors (hinged at the sides, swing into the salon)
const doorL = new THREE.Group(); doorL.position.set(-3.8, 0, -4.0); room.add(doorL);
const doorR = new THREE.Group(); doorR.position.set(-2.2, 0, -4.0); room.add(doorR);
const doorTex = canvasTex(16, 32, (g) => { g.fillStyle = '#f2ead8'; g.fillRect(0, 0, 16, 32); g.strokeStyle = '#c8a050'; g.lineWidth = 1; g.strokeRect(2.5, 2.5, 11, 12); g.strokeRect(2.5, 17.5, 11, 12); g.fillStyle = '#d4a62a'; g.fillRect(12, 15, 2, 3); });
mesh(box(0.8, 2.3, 0.06), M(0xffffff, { map: doorTex }), 0.4, 1.15, -0.03, doorL); mesh(box(0.8, 2.3, 0.06), M(0xffffff, { map: doorTex }), -0.4, 1.15, -0.03, doorR);
const padlock = new THREE.Group(); padlock.position.set(-3.0, 1.2, -3.85); room.add(padlock);
mesh(box(0.5, 0.45, 0.15), P(0xd4a62a, { shininess: 100 }), 0, 0, 0, padlock); const shackle = mesh(new THREE.TorusGeometry(0.17, 0.05, 5, 10, Math.PI), P(0xbbbbbb, { shininess: 100 }), 0, 0.22, 0, padlock);
mesh(box(0.06, 0.14, 0.02), M(0x111111), 0, -0.02, 0.08, padlock); padlock.visible = false;

// ---------- the salon (behind the back wall) ----------
const salon = new THREE.Group(); room.add(salon);
const velvet = M(0x8a1424), plasticM = new THREE.MeshPhongMaterial({ color: 0xe8f4ff, transparent: true, opacity: 0.35, shininess: 120, specular: 0xffffff, side: THREE.DoubleSide });
const salonWall = M(0xffffff, { map: canvasTex(16, 16, (g) => { g.fillStyle = '#5a1a24'; g.fillRect(0, 0, 16, 16); g.fillStyle = '#c8a050'; g.fillRect(7, 2, 2, 2); g.fillRect(3, 9, 2, 2); g.fillRect(11, 9, 2, 2); }, [6, 3]) });
mesh(new THREE.PlaneGeometry(4, 3.2), salonWall, -3.0, 1.6, -7.5, salon);
const swL = mesh(new THREE.PlaneGeometry(3.5, 3.2), salonWall, -5.0, 1.6, -5.75, salon); swL.rotation.y = Math.PI / 2;
const swR = mesh(new THREE.PlaneGeometry(3.5, 3.2), salonWall, -1.0, 1.6, -5.75, salon); swR.rotation.y = -Math.PI / 2;
const sf = mesh(new THREE.PlaneGeometry(4, 3.5), M(0xffffff, { map: canvasTex(16, 16, (g) => { g.fillStyle = '#9a6a3a'; g.fillRect(0, 0, 16, 16); g.fillStyle = '#7a4a22'; for (let i = 0; i < 16; i += 4) g.fillRect(i, 0, 1, 16); g.fillStyle = '#b07a43'; g.fillRect(0, 7, 16, 1); }, [4, 4]) }), -3.0, 0.002, -5.75, salon); sf.rotation.x = -Math.PI / 2;
const sc = mesh(new THREE.PlaneGeometry(4, 3.5), M(0xf2ead8), -3.0, 3.2, -5.75, salon); sc.rotation.x = Math.PI / 2;
mesh(new THREE.PlaneGeometry(2.6, 2.0), M(0xffffff, { map: carpetTex }), -3.0, 0.01, -5.6, salon).rotation.x = -Math.PI / 2;
function goldChair(x, z, ry, wide) {
  const c = new THREE.Group(); c.position.set(x, 0, z); c.rotation.y = ry; salon.add(c); const w = wide ? 1.7 : 0.75;
  mesh(box(w, 0.18, 0.6), velvet, 0, 0.45, 0, c); mesh(box(w, 0.7, 0.12), velvet, 0, 0.85, -0.28, c);
  mesh(box(w + 0.1, 0.07, 0.07), goldM, 0, 1.22, -0.3, c); mesh(box(w + 0.1, 0.07, 0.07), goldM, 0, 0.36, 0.28, c);
  for (const sx of [-w / 2, w / 2]) { mesh(box(0.07, 0.6, 0.6), goldM, sx, 0.62, 0, c); mesh(cyl(0.035, 0.025, 0.36, 5), goldM, sx, 0.18, 0.25, c); mesh(cyl(0.035, 0.025, 0.36, 5), goldM, sx, 0.18, -0.25, c); }
  const plastic = mesh(box(w + 0.18, 1.0, 0.75), plasticM, 0, 0.78, -0.02, c);
  return { c, plastic };
}
const chairs = [goldChair(-3.0, -7.0, 0, true), goldChair(-4.4, -5.6, Math.PI / 2, false), goldChair(-1.6, -5.6, -Math.PI / 2, false)];
const ctable = new THREE.Group(); ctable.position.set(-3.0, 0, -5.6); salon.add(ctable);
mesh(cyl(0.45, 0.45, 0.05, 10), P(0xf4f4f8, { shininess: 120 }), 0, 0.45, 0, ctable); mesh(cyl(0.05, 0.08, 0.45, 6), goldM, 0, 0.22, 0, ctable);
mesh(box(0.5, 0.01, 0.35), M(0xf8f4e8), 0, 0.48, 0, ctable); // doily
// chandelier
const chand = new THREE.Group(); chand.position.set(-3.0, 2.7, -5.6); salon.add(chand);
mesh(new THREE.TorusGeometry(0.35, 0.03, 4, 12), goldM, 0, 0, 0, chand).rotation.x = Math.PI / 2;
mesh(cyl(0.015, 0.015, 0.5, 4), goldM, 0, 0.25, 0, chand);
for (let i = 0; i < 10; i++) { const a = i / 10 * 6.28; mesh(new THREE.OctahedronGeometry(0.05, 0), new THREE.MeshPhongMaterial({ color: 0xeaf6ff, emissive: 0x334455, shininess: 150, transparent: true, opacity: 0.85 }), Math.cos(a) * 0.35, -0.12, Math.sin(a) * 0.35, chand); }
const salonLight = new THREE.PointLight(0xffd890, 0, 6, 1.2); salonLight.position.set(-3.0, 2.3, -5.4); scene.add(salonLight);
// the nish (china cabinet) on the left salon wall
const nish = new THREE.Group(); nish.position.set(-4.75, 0, -6.6); nish.rotation.y = Math.PI / 2; salon.add(nish);
mesh(box(1.2, 2.2, 0.45), M(0x5a3418, { map: woodTex }), 0, 1.1, 0, nish);
mesh(new THREE.PlaneGeometry(1.0, 1.2), new THREE.MeshPhongMaterial({ color: 0xcfe6ff, transparent: true, opacity: 0.25, shininess: 150 }), 0, 1.55, 0.231, nish);
const nishGlasses = [];
for (let row = 0; row < 3; row++) for (let i = 0; i < 5; i++) { const gl = new THREE.Group(); gl.position.set(-0.4 + i * 0.2, 1.05 + row * 0.38, 0.05); nish.add(gl); mesh(cyl(0.05, 0.04, 0.13, 6), new THREE.MeshPhongMaterial({ color: 0xe8f6ff, transparent: true, opacity: 0.7, shininess: 150 }), 0, 0, 0, gl); mesh(new THREE.TorusGeometry(0.05, 0.008, 3, 8), goldM, 0, 0.065, 0, gl).rotation.x = Math.PI / 2; nishGlasses.push(gl); }
for (let row = 0; row < 3; row++) mesh(box(1.05, 0.02, 0.35), new THREE.MeshPhongMaterial({ color: 0xffffff, transparent: true, opacity: 0.4 }), 0, 0.97 + row * 0.38, 0, nish);
const nishGlow = new THREE.PointLight(0xffe08a, 0, 3, 1.5); nishGlow.position.set(-4.3, 1.5, -6.6); scene.add(nishGlow);
// Ibrahim's handheld treasure glass + Om Hamada's phone + newspaper
const goldGlass = new THREE.Group(); scene.add(goldGlass);
mesh(cyl(0.06, 0.05, 0.15, 6), new THREE.MeshPhongMaterial({ color: 0xe8f6ff, transparent: true, opacity: 0.75, shininess: 150 }), 0, 0, 0, goldGlass); mesh(new THREE.TorusGeometry(0.06, 0.01, 3, 8), goldM, 0, 0.075, 0, goldGlass).rotation.x = Math.PI / 2;
const phone = mesh(box(0.08, 0.16, 0.015), P(0x1a1a22, { emissive: 0x112244 }), 0, 0, 0, scene);
const paper = mesh(new THREE.PlaneGeometry(0.6, 0.42), new THREE.MeshLambertMaterial({ map: canvasTex(32, 24, (g) => { g.fillStyle = '#eeeae0'; g.fillRect(0, 0, 32, 24); g.fillStyle = '#333'; g.fillRect(2, 2, 28, 4); for (let y = 8; y < 22; y += 2) g.fillRect(2 + (y % 4), y, 12, 1); for (let y = 8; y < 22; y += 2) g.fillRect(17, y, 12, 1); }), side: THREE.DoubleSide }), 0, 0, 0, scene);
// clutter that gets shoved under the sofa
const clutter = [];
{ const r = rng(13); const cols = [0x3a77c8, 0xff5577, 0xffd400, 0x44cc66, 0xffffff, 0x222222];
  for (let i = 0; i < 14; i++) { const k = i % 4; const geo = k === 0 ? box(0.4, 0.06, 0.3) : k === 1 ? cyl(0.18, 0.15, 0.04, 8) : k === 2 ? box(0.25, 0.25, 0.25) : box(0.35, 0.1, 0.25); const m = mesh(geo, M(cols[i % 6]), 0, 0, 0, room); clutter.push({ m, p0: V(-2.5 + r() * 5, 0.05, -2.8 + r() * 2.6), r0: r() * 6, delay: r() * 1.8 }); } }

// =====================================================================
const KEYS = {};
const PHONE = { aRx: 2.3, aRz: 0.55, eR: 2.5, aLz: 0.95, eL: 1.9 };
KEYS.mom = [
  [0, { ...PHONE, hz: 0.12 }],
  [3.5, { ...PHONE, hz: -0.1, bend: 0.05 }, 0.3],
  [6.2, { aLz: 0.95, eL: 1.9, aRz: 0.95, eR: 1.9 }, 0.2],
  [T_ALARM, { aLz: 2.6, aRz: 2.6, eL: 0.3, eR: 0.3, hx: -0.15, y: 0.06 }, 0.1],
  [9.6, { aRx: 1.6, aRz: 0.3, eR: 0.0, aLz: 0.95, eL: 1.9, twist: 0.3 }, 0.12],
  [15.2, { aRx: 1.6, aRz: 0.9, eR: 0.0, aLz: 0.95, eL: 1.9, twist: -0.3 }, 0.12],
  [16.4, { aRx: 1.6, aRz: 0.1, eR: 0.0, aLz: 0.95, eL: 1.9, twist: 0.4 }, 0.12],
  [21.5, { aRx: 1.5, aRz: 0.2, eR: 0.0, aLz: 0.95, eL: 1.9, hy: 0.3 }, 0.12],
  [28.5, { aRx: 1.4, aRz: 0.6, eR: 0.1, aLz: 0.95, eL: 1.9, hy: 0.4, hx: -0.1 }, 0.12],
  [T_MSG, { aRx: 1.3, eR: 1.4, aRz: 0.1, aLz: 0.3, aLx: 0.3, hx: 0.35, bend: 0.1 }, 0.2],
  [35.6, { aRx: 1.0, eR: 1.2, aRz: 0.1, aLz: 0.1, hx: 0.45, bend: 0.35, y: -0.05 }, 0.8],
  [42.1, { aRx: 1.7, aRz: 0.3, eR: 0.0, aLz: 0.95, eL: 1.9, hx: -0.1, bend: -0.1, y: 0.05 }, 0.1],
  [43.6, { aLz: 0.95, eL: 1.9, aRz: 0.95, eR: 1.9 }, 0.3],
];
KEYS.son = [
  [0, { y: -0.62, lL: 1.45, lR: 1.45, aLx: 0.6, eL: 1.25, aRx: 0.6, eR: 1.25, aLz: -0.12, aRz: -0.12, bend: 0.15 }],
  [6.55, { y: -0.62, lL: 1.45, lR: 1.45, aLx: 0.6, eL: 1.25, aRx: 0.6, eR: 1.25, aLz: -0.12, aRz: -0.12, hy: 2.4, twist: 0.4 }, 0.2],
  [T_ALARM + 0.1, { y: 0.0, aLz: 2.5, aRz: 2.5, eL: 0.3, eR: 0.3, hx: -0.15 }, 0.1],
  [12.8, { aLx: 1.6, eL: 2.4, aRx: 1.6, eR: 2.4, aLz: 0.4, aRz: 0.4, bend: 0.1, hx: 0.05 }, 0.12],
  [18.45, { aLz: 1.4, aRz: 1.4, eL: 0.8, eR: 0.8, hy: 0.4 }, 0.12],
];
KEYS.dad = [
  [0, { y: -0.38, lL: 1.5, lR: 1.5, aLx: 1.2, eL: 1.1, aRx: 1.2, eR: 1.1, aLz: -0.25, aRz: -0.25, hx: 0.25 }],
  [T_ALARM + 0.1, { y: -0.3, lL: 1.3, lR: 1.3, aLz: 2.5, aRz: 2.5, eL: 0.3, eR: 0.3, hx: -0.15 }, 0.1],
  [9.5, { y: -0.38, lL: 1.5, lR: 1.5, aLz: 0.4, aRz: 0.4, hx: 0.0, hy: 0.4 }, 0.3],
  [21.5, { aLz: 0.3, aRz: 0.3, hy: 0.6 }, 0.3],
  [T_DOOR, { aLx: 0.6, aRx: 0.6, eL: 0.4, eR: 0.4, aLz: 0.6, aRz: 0.6, bend: -0.1, hx: -0.15 }, 0.3],
  [30.9, { aRx: 1.4, eR: 1.2, aRz: 0.05, aLx: 1.2, eL: 1.4, aLz: -0.2, bend: 0.1, hx: 0.15 }, 0.15],
  [T_MSG, { aRx: 1.4, eR: 1.2, aRz: 0.05, aLz: 0.4, hy: 0.6 }, 0.2],
  [38.3, { y: -0.38, lL: 1.5, lR: 1.3, aRx: 1.2, eR: 1.6, aRz: 0.1, aLz: 0.9, eL: 0.6, bend: -0.25, hx: -0.1, hy: 0.3 }, 0.3],
  [42.1, { y: 0.12, aLz: 2.5, aRz: 2.5, eL: 0.3, eR: 0.3, hx: -0.15 }, 0.08],
  [43.0, { aLz: 0.3, aRz: 0.3, bend: 0.3, hx: 0.4 }, 0.3],
];
const MOM_P = V(1.4, 0, -0.7), SON_P = V(-0.3, 0, -1.5), DAD_SOFA = V(-1.0, 0.0, 1.55);
const DAD_DOOR = V(-3.0, 0, -3.1), DAD_SALON = V(-3.0, 0.08, -6.7);

function stateAt(t) {
  scene.background = new THREE.Color(0x101010); scene.fog = null;
  ambient.color.setHex(0xfff0e0); ambient.intensity = 0.8; moon.intensity = 0; balcLight.intensity = 0; hallLight.intensity = 0.6;
  tvLight.intensity = 3.0; tvLight.color.setHex(0x6fb8ff);
  const alarmOn = t >= T_ALARM && t < T_MSG; alarm.intensity = alarmOn ? 4 + 4 * Math.abs(Math.sin(t * 6)) : 0;
  // TV: game until the alarm, then off
  { const g = tvTex.userData.g; if (t < T_ALARM) { g.fillStyle = '#4fb0ff'; g.fillRect(0, 0, 128, 40); g.fillStyle = '#5fae4a'; g.fillRect(0, 40, 128, 56); g.fillStyle = '#fff'; g.fillRect(56 + Math.sin(t * 3) * 30, 50, 12, 12); g.fillStyle = '#ffe14a'; g.font = '6px PS2P'; g.textAlign = 'left'; g.textBaseline = 'top'; g.fillText('GOAL! 3-2', 4, 4); } else { g.fillStyle = '#0c0c10'; g.fillRect(0, 0, 128, 96); } tvTex.needsUpdate = true; }
  // doors + salon
  let open = 0;
  if (t >= T_DOOR && t < T_RES + 0.4) open = easeOut(seg(t, T_DOOR, T_DOOR + 0.8));
  if (t >= T_RES) open = 1 - easeIn(seg(t, T_RES + 0.1, T_RES + 0.4));
  doorL.rotation.y = -1.4 * open; doorR.rotation.y = 1.4 * open;
  salon.visible = open > 0.01 || (t >= T_DOOR && t < T_RES + 0.4);
  salonLight.intensity = salon.visible ? 5 : 0;
  chairs.forEach((c, i) => { c.plastic.visible = t < 22.8 + i * 0.4; });
  padlock.visible = t >= T_RES + 0.45; if (padlock.visible) { const k = easeBack(seg(t, T_RES + 0.45, T_RES + 0.7)); padlock.scale.setScalar(Math.max(0.01, k)); shackle.position.y = 0.22 - (t > T_RES + 1.0 ? 0.06 : 0); }
  const nishOn = t >= 28.5 && t < T_RES; nishGlow.intensity = nishOn ? 3 + 2 * Math.sin(t * 5) : 0;
  nishGlasses.forEach((gl, i) => gl.visible = !(t >= 30.4 && i === 7));
  // clutter: lying around, then shoved under the sofa during the speedrun
  clutter.forEach((o, i) => { const k = easeIn(seg(t, T_HIDE - 0.4 + o.delay * 0.7, T_HIDE + 0.2 + o.delay * 0.7)); const under = V(-1.0 + (i % 5 - 2) * 0.35, 0.05, 1.85); o.m.position.copy(VL(o.p0, under, k)); o.m.position.y += Math.sin(k * Math.PI) * 0.8; o.m.rotation.set(k * 6, o.r0 + k * 4, 0); o.m.visible = k < 0.98; });

  // ---- characters ----
  dad.afro.visible = false; dad.extras.setGoggles(false); samir.root.visible = false; cane.visible = false;
  // mom
  mom.root.position.copy(MOM_P); mom.root.rotation.set(0, -1.2, 0);
  if (t >= T_ALARM) mom.root.rotation.y = -1.6;
  if (t >= 21.5 && t < T_MSG) { mom.root.position.set(0.2, 0, -2.4); mom.root.rotation.y = -1.9; }
  if (t >= T_MSG) { mom.root.position.set(-1.3, 0, -2.3); mom.root.rotation.y = 0.35; }
  applyPose(mom, poseAt(t, KEYS.mom));
  { const hp = mom.arms[1].hand.getWorldPosition(V(0, 0, 0)); phone.position.copy(hp).add(V(0, 0.06, 0)); phone.rotation.set(0, mom.root.rotation.y, 0.3); phone.visible = t < 6.4 || (t >= T_MSG - 0.2 && t < 38.0); phone.material.emissive.setHex(t >= T_MSG && t < 38 ? 0x3a8a3a : 0x112244); }
  // Hamada
  son.root.visible = true; son.root.rotation.set(0, 0, 0);
  if (t < T_ALARM) { son.root.position.copy(SON_P); son.root.rotation.y = Math.PI; }
  else if (t < T_HIDE) { son.root.position.set(-0.2, 0, -1.2); son.root.rotation.y = 0.5; if (t < T_ALARM + 0.35) son.root.position.y = Math.sin(seg(t, T_ALARM, T_ALARM + 0.35) * Math.PI) * 0.45; }
  else { // dives under the sofa: only the legs stick out
    const k = easeOut(seg(t, T_HIDE, T_HIDE + 0.5)); son.root.rotation.set(Math.PI / 2 * k, 0, 0); son.root.position.set(lerp(-0.2, -0.7, k), lerp(0, 0.12, k), lerp(-1.2, 0.95, k));
  }
  const sz = poseAt(t, KEYS.son);
  if (t >= T_HIDE) Object.assign(sz, { y: 0, bend: 0, aLz: 2.8, aRz: 2.8, eL: 0, eR: 0, aLx: 0, aRx: 0, lL: 0.1, lR: -0.1 + (t > 46 ? Math.max(0, Math.sin((t - 46) * 7)) * 0.4 : 0), hx: 0, hy: 0 });
  if (t >= 12.8 && t < 14.9) sz.hz = Math.sin(t * 20) * 0.1;
  applyPose(son, sz);
  // Ibrahim
  dad.root.rotation.set(0, Math.PI, 0); dad.root.position.copy(DAD_SOFA);
  if (t >= T_ALARM && t < T_ALARM + 0.35) dad.root.position.y += Math.sin(seg(t, T_ALARM, T_ALARM + 0.35) * Math.PI) * 0.3;
  if (t >= 21.5) { const k = easeInOut(seg(t, 22.2, 24.6)); dad.root.position.copy(VL(V(-1.0, 0, 0.9), DAD_DOOR, k)); dad.root.rotation.y = lerp(Math.PI, Math.PI, k); }
  if (t >= 30.9 && t < 38.3) { dad.root.position.set(-4.1, 0, -6.0); dad.root.rotation.y = -Math.PI / 2 + 0.6; }
  if (t >= 38.3) { const k = easeInOut(seg(t, 38.3, 39.2)); dad.root.position.copy(VL(V(-3.6, 0, -5.8), DAD_SALON.clone().add(V(0, 0, 0.35)), k)); dad.root.rotation.y = lerp(-Math.PI / 2, 0, k); }
  if (t >= 42.1) { dad.root.position.copy(DAD_SALON.clone().add(V(0, 0, 0.6))); dad.root.rotation.y = 0; }
  if (t >= T_RES) { const k = easeInOut(seg(t, T_RES, T_RES + 0.4)); dad.root.position.copy(VL(DAD_SALON.clone().add(V(0, 0, 0.6)), V(-2.4, 0, -2.9), k)); dad.root.rotation.y = 0.3; }
  const dz = poseAt(t, KEYS.dad);
  if (t >= 30.9 && t < T_MSG) { dz.aRx += Math.sin(t * 30) * 0.03; dz.eR += Math.sin(t * 27) * 0.04; }
  if (t >= 38.3 && t < 42.1) { const sit = easeInOut(seg(t, 38.6, 39.3)); dz.y = lerp(0, -0.38, sit); dz.lL = lerp(0, 1.5, sit); dz.lR = lerp(0, 1.25, sit); }
  applyPose(dad, dz);
  { const hp = dad.arms[1].hand.getWorldPosition(V(0, 0, 0)); goldGlass.position.copy(hp).add(V(0, 0.08, 0)); goldGlass.visible = t >= 30.4 && t < T_RES; }
  { const a = dad.arms[0].hand.getWorldPosition(V(0, 0, 0)), b = dad.arms[1].hand.getWorldPosition(V(0, 0, 0)); paper.visible = t < T_ALARM + 1.2; if (t < T_ALARM) { paper.position.copy(a.add(b).multiplyScalar(0.5)).add(V(0, 0.12, -0.1)); paper.rotation.set(-0.2, Math.PI, 0); } else { const k = seg(t, T_ALARM, T_ALARM + 1.2); paper.position.set(-1.0 + k * 0.6, 1.4 + 1.6 * k - 2.5 * k * k, 1.2 - k * 0.5); paper.rotation.set(k * 6, k * 4, k * 2); } }

  // ---- particles ----
  const dust = [];
  if (t >= T_DOOR && t < T_DOOR + 2.5) { const k = seg(t, T_DOOR, T_DOOR + 2.5); for (let i = 0; i < 18; i++) { const ph = (k + hash(i)) % 1; dust.push({ pos: V(-3.0 + (hash(i + 1) - .5) * 1.6, 0.3 + hash(i + 2) * 2.0 + ph * 0.3, -4.0 + ph * 1.8), size: 0.25 + ph * 0.5, op: (1 - ph) * 0.55 * (1 - k * 0.5), color: 0xd8c8a0 }); } }
  emit(dust, puffPool);
  const sparkle = [];
  if (t >= T_DOOR + 0.3 && t < T_RES) for (let i = 0; i < 6; i++) { const k = (t * 0.8 + i / 6) % 1; sparkle.push({ pos: V(-3.0 + Math.cos(i * 2 + t) * 0.6, 2.4 - k * 0.4, -5.6 + Math.sin(i * 2 + t) * 0.6), size: 0.1 * Math.sin(k * Math.PI), rot: t }); }
  if (t >= 28.5 && t < T_RES) for (let i = 0; i < 6; i++) { const k = (t * 1.1 + i / 6) % 1; sparkle.push({ pos: V(-4.45, 1.0 + k * 1.2, -6.6 + (hash(i) - .5) * 1.0), size: 0.14 * Math.sin(k * Math.PI), rot: t * 2 }); }
  emit(sparkle, starPool);
  const sweat = [];
  if ((t >= 12.8 && t < T_HIDE) || (t >= 30.9 && t < T_MSG)) { const c = t < T_HIDE ? son : dad; const hd = c.head.getWorldPosition(V(0, 0, 0)); for (let i = 0; i < 4; i++) { const k = (t * 1.3 + i * 0.25) % 1; sweat.push({ pos: hd.clone().add(V((i % 2 ? 1 : -1) * 0.27, 0.18 - k * 0.5, 0)), size: 0.07, op: 1 - k }); } }
  emit(sweat, sweatPool); emit([], trailPool);

  // ---- faces ----
  let me = 'normal', mm = talkMouth(t, 'mom', 'scream') || 'closed';
  if (t < 6.2) { me = 'sparkle'; if (mm === 'closed') mm = 'smile'; }
  else if (t < T_ALARM) { me = 'flat'; mm = 'flat'; }
  else if (t < 21.5) { me = 'wide'; if (mm === 'closed') mm = 'clench'; }
  else if (t < T_MSG) { me = 'smug'; if (mm === 'closed') mm = 'flat'; }
  else if (t < 38.3) { me = 'sad'; if (mm === 'closed') mm = 'frown'; }
  else if (t < 42.1) { me = 'flat'; mm = 'flat'; }
  else if (t < T_RES) { me = 'angry'; if (mm === 'closed') mm = 'clench'; }
  else { me = 'smug'; mm = 'smile'; }
  let se = 'normal', sm = talkMouth(t, 'son', 'scream') || 'closed';
  if (t < 6.55) { se = 'smug'; sm = 'tongue'; } else if (t < T_ALARM) { se = 'side'; if (sm === 'closed') sm = 'flat'; } else if (t < T_HIDE) { se = 'pin'; if (sm === 'closed') sm = 'o'; } else { se = 'closed'; sm = 'flat'; }
  let de = 'tired', dm = talkMouth(t, 'dad') || 'closed';
  if (t >= T_ALARM && t < 21.5) { de = 'wide'; dm = 'o'; }
  else if (t >= 21.5 && t < T_DOOR) { de = 'normal'; }
  else if (t >= T_DOOR && t < 30.9) { de = 'sparkle'; if (dm === 'closed') dm = 'o'; }
  else if (t >= 30.9 && t < T_MSG) { de = 'pin'; if (dm === 'closed') dm = 'wobble'; }
  else if (t >= T_MSG && t < 38.3) { de = 'side'; dm = 'flat'; }
  else if (t >= 38.3 && t < 42.1) { de = 'smug'; if (dm === 'closed') dm = 'grin'; }
  else if (t >= 42.1) { de = 'pin'; dm = 'o'; if (t > 43.6) { de = 'sad'; dm = 'frown'; } }
  const blink = (list) => list.some(b => t >= b && t < b + 0.18);
  if (blink([3.0, 23.0, 40.4])) me = 'closed';
  mom.faceMat.map = faceTexture(me, mm, {}); mom.faceMat.needsUpdate = true;
  son.faceMat.map = faceTexture(se, sm, { fuzz: true }); son.faceMat.needsUpdate = true;
  dad.faceMat.map = faceTexture(de, dm, { stache: true }); dad.faceMat.needsUpdate = true;
}

function cameraAt(t) {
  if (t < 6.2) { const k = seg(t, 0, 6.2); if (t < 1.4) cam(V(2.8, 2.3, 2.6), V(-0.6, 0.9, -1.4), 58); else faceCam(mom, lerp(1.9, 1.5, k), 0.4, 0.05, 48, 0.1); }
  else if (t < T_ALARM) { faceCam(son, 1.3, 0.3, 0.1, 48, 0.12); }
  else if (t < 12.8) { cam(V(3.2, 2.0, 1.8).add(shake(t, t < 9 ? 0.06 : 0.015, 22)), V(-0.4, 1.0, -0.8), 58, Math.sin(t * 6) * 0.02); }
  else if (t < 15.2) { faceCam(son, 1.1, -0.2, 0.05, 46, 0.08); }
  else if (t < 18.45) { faceCam(mom, 1.6, -0.3, 0.0, 48, 0.1); }
  else if (t < 21.5) { const k = seg(t, 18.45, 21.5); if (t < T_HIDE) faceCam(son, 1.3, 0.35, 0.05, 48, 0.1); else cam(VL(V(0.5, 1.0, -0.3), V(0.3, 0.9, -0.1), k), V(-0.8, 0.3, 1.4), 58); }
  else if (t < T_DOOR) { faceCam(mom, 1.7, 0.4, 0.0, 50, 0.1); }
  else if (t < 28.5) { const k = easeInOut(seg(t, T_DOOR, 28.5)); cam(VL(V(-2.6, 1.6, -0.6), V(-2.9, 1.5, -2.2), k), V(-3.0, 1.1, -6.2), 52); }
  else if (t < 30.9) { cam(V(-3.4, 1.5, -5.6), V(-4.6, 1.5, -6.6), 50); }
  else if (t < T_MSG) { faceCam(dad, 1.1, 0.25, 0.0, 46, 0.0); }
  else if (t < 38.3) { const k = seg(t, T_MSG, 38.3); faceCam(mom, lerp(1.2, 1.5, k), -0.25, 0.05, 46, 0.15); }
  else if (t < 42.1) { cam(V(-2.6, 1.5, -4.2), V(-3.0, 0.8, -6.4), 52); }
  else if (t < T_RES) { faceCam(mom, 1.4, 0.3, -0.05, 48, 0.0); camera.position.add(shake(t, 0.03, 25)); }
  else { const k = easeInOut(seg(t, T_RES, 54.0)); cam(VL(V(2.6, 1.7, 0.6), V(3.2, 2.2, 1.2), k), V(-1.9, 0.75, -1.2), 60); }
}

// =====================================================================
const NAMES = { mom: ['أم حمادة', 'OM HAMADA', '#1f9e5a'], son: ['حمادة', 'HAMADA', '#d4141c'], dad: ['إبراهيم', 'IBRAHIM', '#c9a227'] };
function portrait(g, x, y, who, t) {
  g.fillStyle = '#123'; g.fillRect(x, y, 64, 64); g.strokeStyle = '#fff'; g.lineWidth = 2; g.strokeRect(x, y, 64, 64);
  g.save(); g.beginPath(); g.rect(x + 2, y + 2, 60, 60); g.clip();
  if (who === 'mom') { g.fillStyle = '#1f9e5a'; g.beginPath(); g.arc(x + 32, y + 34, 27, 0, 7); g.fill(); g.fillStyle = '#c98d5f'; g.beginPath(); g.arc(x + 32, y + 38, 19, 0, 7); g.fill(); g.fillStyle = '#ec86ad'; g.fillRect(x + 6, y + 58, 52, 6); }
  else if (who === 'son') { g.fillStyle = '#d4141c'; g.fillRect(x + 8, y + 54, 48, 10); g.fillStyle = '#b98058'; g.beginPath(); g.arc(x + 32, y + 36, 19, 0, 7); g.fill(); g.fillStyle = '#17110c'; for (let i = 0; i < 7; i++) { g.beginPath(); g.arc(x + 14 + i * 6, y + 18 + (i % 2) * 3, 7, 0, 7); g.fill(); } }
  else { g.fillStyle = '#f3f0e3'; g.fillRect(x + 10, y + 54, 44, 10); g.fillStyle = '#b27448'; g.beginPath(); g.arc(x + 32, y + 36, 20, 0, 7); g.fill(); g.fillStyle = '#1b1410'; g.fillRect(x + 10, y + 30, 5, 12); g.fillRect(x + 49, y + 30, 5, 12); g.fillStyle = '#c9a227'; g.fillRect(x + 14, y + 16, 36, 5); g.fillStyle = '#335a3a'; g.fillRect(x + 18, y + 15, 10, 7); g.fillRect(x + 36, y + 15, 10, 7); }
  const fc = document.createElement('canvas'); fc.width = 32; fc.height = 32; const fg = fc.getContext('2d');
  const e = envAt(t); const mouth = speakerAt(t) === who ? (e < 0.1 ? 'closed' : e < 0.4 ? 'talk1' : 'talk2') : 'closed';
  const eyes = who === 'mom' ? (t < 6.2 ? 'sparkle' : t > 42 ? 'angry' : t > T_MSG ? 'sad' : 'wide') : who === 'son' ? 'pin' : (t > 38 && t < 42 ? 'smug' : 'wide');
  drawFace(fg, 32, eyes, mouth, { stache: who === 'dad', fuzz: who === 'son' });
  g.imageSmoothingEnabled = false; g.drawImage(fc, x + 14, y + 20, 36, 36); g.restore();
}
function drawTitle(g, t) {
  if (t >= 1.3) return; const op = t < 0.9 ? 1 : 1 - seg(t, 0.9, 1.3);
  g.globalAlpha = op; g.fillStyle = 'rgba(0,0,0,0.6)'; g.fillRect(0, 196, W, 76);
  arText(g, 'الضيوف جايين', W / 2, 198, 40, '#ffe14a', 'center', 'ReemKufi'); pxText(g, 'GUESTS INCOMING', W / 2, 250, 10, '#fff', 'center'); g.globalAlpha = 1;
}
function countdown(t) { if (t < 8.6) return 600; if (t < T_MSG) return Math.max(2, Math.round(600 - (t - 8.6) * 23.6)); return Math.round(600 - (T_MSG - 8.6) * 23.6); }
function drawCountdown(g, t) {
  if (t < 8.6 || t >= T_RES) return;
  const x = W / 2 - 150, y = 10; const left = countdown(t); const glitch = t >= T_MSG;
  g.fillStyle = 'rgba(40,0,0,0.85)'; g.fillRect(x, y, 300, 62); g.strokeStyle = glitch ? '#888' : '#ff3030'; g.lineWidth = 3; g.strokeRect(x, y, 300, 62);
  arText(g, 'الضيوف هيوصلوا خلال', x + 292, y + 2, 16, '#fff');
  const mm = String(Math.floor(left / 60)).padStart(2, '0'), ss = String(left % 60).padStart(2, '0');
  if (!glitch) pxText(g, mm + ':' + ss, x + 10, y + 30, 20, left < 120 && Math.floor(t * 4) % 2 ? '#ff3030' : '#ffe14a');
  else { pxText(g, 'CANCELLED', x + 10, y + 32, 16, '#888'); g.strokeStyle = '#ff3030'; g.lineWidth = 2; g.beginPath(); g.moveTo(x + 8, y + 40); g.lineTo(x + 170, y + 40); g.stroke(); }
  pxText(g, 'SPEEDRUN', x + 190, y + 36, 8, '#ff9a4a');
}
function drawHidden(g, t) {
  if (t < T_HIDE - 0.3 || t >= 22.4) return;
  const n = Math.min(47, Math.floor(seg(t, T_HIDE - 0.3, 21.0) * 47));
  const k = easeBack(seg(t, T_HIDE - 0.3, T_HIDE - 0.1)); g.save(); g.translate(W - 140, 120); g.scale(k, k);
  g.fillStyle = 'rgba(0,0,30,0.85)'; g.fillRect(-120, -30, 240, 64); g.strokeStyle = '#fff'; g.lineWidth = 2; g.strokeRect(-120, -30, 240, 64);
  arText(g, 'اتخبى تحت الكنبة', 112, -28, 16, '#fff'); pxText(g, '+' + n, -100, 2, 18, '#3df05a'); pxText(g, 'ITEMS', 10, 8, 8, '#9fd0ff');
  g.restore();
  if (t >= T_HIDE + 0.5 && t < 21.4) { pxText(g, '+1 HAMADA', W - 140, 170, 12, '#ffe14a', 'center'); }
}
function drawBanner(g, t, t0, t1, en, ar, col) {
  if (t < t0 || t >= t1) return; const k = easeBack(seg(t, t0, t0 + 0.2)); const op = t > t1 - 0.3 ? 1 - seg(t, t1 - 0.3, t1) : 1;
  g.globalAlpha = op; g.save(); g.translate(W / 2, 150); g.scale(k, k);
  g.fillStyle = 'rgba(0,0,0,0.75)'; g.fillRect(-250, -40, 500, 84); g.strokeStyle = col; g.lineWidth = 3; g.strokeRect(-250, -40, 500, 84);
  pxText(g, en, 0, -30, 13, col, 'center'); arText(g, ar, 0, -6, 30, '#fff', 'center', 'ReemKufi'); g.restore(); g.globalAlpha = 1;
}
function drawMessage(g, t) {
  if (t < T_MSG || t >= 37.9) return; const k = easeOut(seg(t, T_MSG, T_MSG + 0.25));
  const x = W - 300, y = 90 - (1 - k) * 80;
  g.fillStyle = 'rgba(245,245,245,0.97)'; g.fillRect(x, y, 280, 96); g.strokeStyle = '#888'; g.lineWidth = 1; g.strokeRect(x, y, 280, 96);
  g.fillStyle = '#2f9a4a'; g.fillRect(x, y, 280, 22); arText(g, 'طنط سعاد', x + 270, y - 2, 16, '#fff');
  g.fillStyle = '#dcf8c6'; g.fillRect(x + 12, y + 30, 256, 56);
  g.fillStyle = '#111'; g.font = '16px Lalezar'; g.direction = 'rtl'; g.textAlign = 'right'; g.textBaseline = 'top';
  g.fillText('معلش يا حبيبتي.. مش هنيجي النهارده', x + 260, y + 34); g.fillText('خليها مرة تانية', x + 260, y + 58);
}
function drawResult(g, t) {
  if (t < T_RES || t >= T_ENDC + 0.3) return; const a = t - T_RES;
  g.fillStyle = `rgba(0,0,20,${0.55 * clamp(a / 0.3)})`; g.fillRect(0, 0, W, H);
  const k = easeBack(clamp(a / 0.3)); g.save(); g.translate(W / 2, 64); g.scale(k, k);
  pxText(g, 'SPEEDRUN COMPLETE', 0, -14, 18, '#3df05a', 'center'); arText(g, 'خلصت الجولة', 0, 10, 26, '#fff', 'center'); g.restore();
  const rows = [[1.0, 'الوقت: ٩:٥٨', 'TIME: 9:58'], [2.0, 'الضيوف: صفر', 'GUESTS: 0'], [3.4, 'الصالون: اتقفل تاني', 'SALON: LOCKED AGAIN'], [5.0, 'حمادة: لسه تحت الكنبة', 'HAMADA: STILL UNDER THE SOFA']];
  rows.forEach(([t0, ar, en], i) => { if (a < t0) return; const kk = easeBack(seg(a, t0, t0 + 0.2)); const yy = 128 + i * 50; g.save(); g.translate(W / 2, yy + 20); g.scale(kk, kk); g.fillStyle = 'rgba(10,10,40,0.88)'; g.fillRect(-230, -20, 460, 42); arText(g, ar, 220, -18, 22, '#fff'); pxText(g, en, -220, -4, 8, '#9fd0ff'); g.restore(); });
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
  if (t >= T_ALARM && t < T_MSG) { ctx.fillStyle = `rgba(255,0,0,${0.08 + 0.08 * Math.abs(Math.sin(t * 6))})`; ctx.fillRect(0, 0, W, H); }
  h.clearRect(0, 0, W, H);
  drawCountdown(h, t); drawHidden(h, t);
  drawBanner(h, t, T_DOOR + 0.6, 28.4, 'NEW AREA UNLOCKED', 'الصالون', '#ffd400');
  drawBanner(h, t, 28.7, 30.8, 'LEGENDARY ITEM', 'طقم كوبايات النيش', '#ff9a4a');
  drawMessage(h, t); drawResult(h, t); drawDialogue(h, t); drawEnd(h, t); drawTitle(h, t);
  ctx.drawImage(hud, 0, 0);
  vignette(ctx, 0.35);
  if (t >= T_ALARM && t < T_ALARM + 0.06) { ctx.fillStyle = 'rgba(255,60,60,0.6)'; ctx.fillRect(0, 0, W, H); }
  if (t >= T_RES + 0.4 && t < T_RES + 0.46) { ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.fillRect(0, 0, W, H); }
  return true;
};
window.frameData = () => out.toDataURL('image/png');
window.DUR = DUR;
document.fonts.load('10px PS2P').then(() => document.fonts.load('20px Lalezar', 'ع')).then(() => document.fonts.load('700 20px ReemKufi', 'ع')).then(() => {
  const g = jerseyTex.userData.g; g.fillStyle = '#d4141c'; g.fillRect(0, 0, 32, 32); g.fillStyle = '#fff'; g.fillRect(0, 2, 32, 2); g.font = '12px PS2P'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('10', 16, 18); jerseyTex.needsUpdate = true;
  window.READY = true;
});
