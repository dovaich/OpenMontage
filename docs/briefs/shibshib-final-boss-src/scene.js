// الشبشب — FINAL BOSS. Deterministic low-poly Y2K console cutscene.
// Same engine family as "Jet Dishwasher 3000": window.renderFrame(t) draws frame t into #out.
import * as THREE from 'three';

const W = 640, H = 480;
const DUR = 52.59;
const T_IMPACT = 34.3;

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
  if (opts.stache) { const c = '#111'; R(8, 19, 16, 3, c); R(6, 20, 3, 3, c); R(23, 20, 3, 3, c); }
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

// Om Hamada (same model sheet as episode 1)
const mom = makeChar({
  seed: 3, skin: 0xc98d5f, hipY: 0.82, legX: 0.14, legColor: 0xc98d5f, shoe: 0x2f6fff, hand: 0xffd400,
  torsoGeo: cyl(0.3, 0.42, 0.62, 7), torsoTex: floralTex, torsoColor: 0xffffff, torsoY: 0.31,
  skirt: cyl(0.42, 0.55, 0.55, 7), sleeve: true, shoulderX: 0.37, shoulderY: 0.56, neckY: 0.62, headR: 0.3,
  build(head, torso, reg) {
    const scarfMat = reg(M(0x1f9e5a));
    const scarf = mesh(new THREE.SphereGeometry(0.33, 8, 5, 0, Math.PI * 2, 0, Math.PI * 0.55), scarfMat, 0, 0.03, -0.03, head); scarf.rotation.x = -0.35;
    mesh(new THREE.IcosahedronGeometry(0.09, 0), scarfMat, 0, -0.12, -0.3, head);
    const tailA = mesh(box(0.08, 0.22, 0.04), scarfMat, 0.05, -0.28, -0.3, head);
    const tailB = mesh(box(0.08, 0.2, 0.04), scarfMat, -0.06, -0.27, -0.31, head);
    // hair rollers peeking out (it's 2 AM)
    for (let i = 0; i < 3; i++) mesh(cyl(0.035, 0.035, 0.1, 6), reg(M([0xff4fa0, 0x4fc3ff, 0xffd400][i])), -0.12 + i * 0.12, 0.3, 0.18, head).rotation.z = Math.PI / 2;
    return { scarf, tailA, tailB };
  }
}, room);
// Hamada — teen, red #10 jersey, headphones around neck, block of curly hair
const son = makeChar({
  seed: 9, skin: 0xb98058, hipY: 0.8, legX: 0.11, legColor: 0xb98058, shoe: 0xf0f0f0, hand: 0xb98058,
  torsoGeo: cyl(0.24, 0.27, 0.62, 6), torsoTex: jerseyTex, torsoColor: 0xffffff, torsoY: 0.31,
  shorts: cyl(0.27, 0.29, 0.3, 6), shortsTex: shortsTex, sleeve: true, sleeveTex: null, sleeveColor: 0xd4141c,
  shoulderX: 0.3, shoulderY: 0.55, neckY: 0.62, headR: 0.27,
  build(head, torso, reg) {
    const hairMat = reg(M(0x17110c));
    const hair = new THREE.Group(); head.add(hair);
    const r = rng(12);
    for (let i = 0; i < 10; i++) { const a = r() * 6.28; mesh(new THREE.IcosahedronGeometry(0.11, 0), hairMat, Math.cos(a) * 0.17, 0.2 + r() * 0.08, Math.sin(a) * 0.15 - 0.04, hair); }
    // headphones around the neck
    const hp = new THREE.Group(); hp.position.set(0, 0.6, 0.02); torso.add(hp);
    const band = mesh(new THREE.TorusGeometry(0.2, 0.025, 4, 10, Math.PI), reg(P(0x222222)), 0, 0, 0, hp); band.rotation.x = Math.PI / 2 + 0.3;
    for (const s of [-1, 1]) mesh(cyl(0.07, 0.07, 0.06, 8), reg(P(0x2a2a2a)), s * 0.2, -0.02, 0.05, hp).rotation.z = Math.PI / 2;
    // controller in right hand
    return { hair };
  }
}, room);
const controller = new THREE.Group(); room.add(controller);
mesh(box(0.2, 0.05, 0.1), P(0x2a2a32), 0, 0, 0, controller);
for (const s of [-1, 1]) mesh(box(0.06, 0.05, 0.1), P(0x2a2a32), s * 0.11, -0.01, 0.04, controller).rotation.y = s * 0.4;
for (let i = 0; i < 4; i++) mesh(box(0.018, 0.01, 0.018), M([0xff3355, 0x33aaff, 0x44cc66, 0xffdd22][i]), 0.05 + (i % 2) * 0.025, 0.03, -0.015 + Math.floor(i / 2) * 0.03, controller);
let cableMesh = null; const cableMat = M(0x111111);

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
dad.afro.visible = true;
// Hamada's balcony double (same rig, re-parented per shot)

// slipper (the weapon)
const slipper = new THREE.Group(); scene.add(slipper);
mesh(box(0.13, 0.035, 0.3), P(0x2f6fff), 0, 0, 0, slipper);
const strap = mesh(new THREE.TorusGeometry(0.06, 0.02, 4, 8, Math.PI), P(0x1d4fd0), 0, 0.01, 0.05, slipper); strap.rotation.x = -Math.PI / 2; strap.rotation.z = Math.PI;
mesh(new THREE.SphereGeometry(0.025, 5, 4), M(0xff4fa0), 0, 0.06, 0.05, slipper);
const slipperGlow = new THREE.PointLight(0xff3030, 0, 2, 1.5); slipper.add(slipperGlow);

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
function envAt(t) { const e = window.ENV.env; const i = Math.floor(t * window.ENV.fps); return e[Math.min(e.length - 1, Math.max(0, i))] || 0; }
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

// =====================================================================
// KEYFRAMES
// =====================================================================
const SIT = { y: -0.62, lL: 1.45, lR: 1.45 };
const PLAY = { ...SIT, aLx: 0.9, eL: 1.2, aRx: 0.9, eR: 1.2, aLz: -0.15, aRz: -0.15, bend: 0.15 };
const SON_KEYS = [
  [0, { ...PLAY }],
  [1.0, { ...PLAY, y: -0.45, aLz: 0.6, aRz: 0.6, aLx: 1.6, aRx: 1.6, bend: -0.2, hx: -0.2 }, 0.08],
  [1.35, { ...PLAY, bend: 0.0, hx: 0.0 }],
  [4.615, { ...SIT, aLx: 0.9, eL: 1.2, aRx: 1.2, eR: 1.6, aRz: 0.5, bend: -0.05, hy: 0.0 }],
  [6.3, { ...SIT, aLx: 0.9, eL: 1.2, aRx: 1.6, eR: 0.6, aRz: 0.8, tr: 1 }],
  [8.0, { ...PLAY }],
  [13.06, { ...PLAY, aLx: 1.0, aRx: 1.0, bend: 0.35 }],
  [15.34, { ...SIT, aLz: 2.6, aRz: 2.6, eL: 0.3, eR: 0.3, bend: -0.1, hx: -0.2 }, 0.1],
  [16.92, { y: 0, aLz: 1.2, aRz: 1.2, aLx: 0.6, aRx: 0.6, eL: 1.0, eR: 1.0, bend: -0.25 }, 0.12],
  [18.2, { y: 0, aLx: 0.4, aRx: 0.4, eL: 0.6, eR: 0.6, bend: 0.05, hx: 0.15 }],
  [24.05, { y: -0.48, lL: -0.1, lR: -0.1, aLx: 1.4, aRx: 1.4, eL: 1.3, eR: 1.3, aLz: -0.35, aRz: -0.35, hx: -0.35, bend: 0.1 }, 0.12],
  [25.6, { y: -0.48, lL: -0.1, lR: -0.1, aLx: 1.5, aRx: 1.5, eL: 1.2, eR: 1.2, aLz: -0.38, aRz: -0.38, hx: -0.4, hz: 0.15, bend: 0.12 }],
  [30.5, { y: -0.48, lL: -0.1, lR: -0.1, aLx: 1.8, aRx: 1.8, eL: 0.4, eR: 0.4, aLz: 0.2, aRz: 0.2, hx: -0.2, bend: -0.15 }],
  [32.9, { y: -0.48, lL: -0.1, lR: -0.1, bend: -1.15, aLz: 2.2, aRz: 2.2, eL: 0.3, eR: 0.3, hx: 0.3 }, 0.35],
  [33.75, { y: -0.48, lL: -0.1, lR: -0.1, bend: -0.05, aLz: 0.9, aRz: 1.8, eR: 0.2, tr: 1, hx: -0.15 }, 0.2],
];
const MOM_KEYS = [
  [0, { aLz: 0.3, aRz: 0.3 }],
  [18.2, { aLx: 1.25, eL: 1.95, aRx: 1.15, eR: 2.0, aLz: -0.2, aRz: -0.25, hx: 0.12 }],
  [21.6, { aLx: 1.25, eL: 1.95, aRx: 1.3, eR: 2.2, aRz: 0.2, hz: -0.12, hx: 0.1 }],
  [23.2, { aLx: 1.25, eL: 1.95, aRx: 1.15, eR: 2.0, aLz: -0.2, aRz: -0.25, hx: 0.12 }],
  [24.05, { aLx: 1.25, eL: 1.95, aRx: 1.15, eR: 2.0, aLz: -0.2, aRz: -0.25, hx: 0.45 }],
  [27.32, { aLx: 1.25, eL: 1.95, aRx: 1.15, eR: 2.0, aLz: -0.2, aRz: -0.25, hx: 0.25, hz: 0.18 }],
  [28.9, { bend: 0.9, aRx: 0.3, eR: 0.1, aRz: 0.05, aLz: 0.5, hx: -0.3, lR: 0.5 }, 0.3],
  [29.7, { bend: 0.25, aRx: 0.6, eR: 1.2, aRz: 0.3, aLz: 0.4, hx: 0.0 }, 0.3],
  [30.48, { aRx: 0.2, aRz: 2.7, eR: 0.5, aLz: 0.6, aLx: 0.5, eL: 0.8, hx: -0.1 }, 0.18],
  [32.11, { aRx: 0.9, aRz: 2.9, eR: 1.8, twist: 0.5, bend: -0.2, aLz: 1.2 }, 0.15],
  [32.3, { aRx: 1.6, aRz: 0.4, eR: 0.0, twist: -0.6, bend: 0.35, aLz: 1.4 }, 0.08],
  [33.4, { aLx: 1.25, eL: 1.95, aRx: 1.15, eR: 2.0, aLz: -0.2, aRz: -0.25, hx: 0.1 }, 0.3],
];
const BSON_KEYS = [
  [0, { y: -0.62, lL: 1.45, lR: 1.45, aLx: 0.9, eL: 1.4, aRx: 0.9, eR: 1.4, aLz: -0.2, aRz: -0.2, bend: 0.25, hx: 0.2 }],
  [45.5, { y: -0.62, lL: 1.45, lR: 1.45, aLx: 0.9, eL: 1.4, aRx: 0.9, eR: 1.4, aLz: -0.2, aRz: -0.2, bend: 0.1, hy: -0.5, hx: 0.0 }],
  [47.75, { y: -0.62, lL: 1.45, lR: 1.45, aLx: 0.9, eL: 1.4, aRx: 0.9, eR: 1.4, aLz: -0.2, aRz: -0.2, bend: 0.25, hy: -0.4, hx: 0.25 }],
  [51.1, { y: -0.62, lL: 1.45, lR: 1.45, aLx: 0.9, eL: 1.4, aRx: 0.9, eR: 1.4, aLz: -0.2, aRz: -0.2, bend: 0.3, hy: 0, hx: 0.45 }, 0.5],
];
const DAD_KEYS = [
  [0, { y: -0.7, lL: 1.45, lR: 1.45, aLz: 0.5, aLx: 0.3, eL: 0.5, aRz: 0.5, aRx: 0.3, eR: 0.5, bend: -0.15, hy: 0.5 }],
  [42.3, { y: -0.7, lL: 1.45, lR: 1.45, aLz: 0.5, aLx: 0.3, eL: 0.5, aRx: 1.3, aRz: 0.3, eR: 1.4, tr: 1, bend: -0.15, hy: 0.45 }],
  [44.5, { y: -0.7, lL: 1.45, lR: 1.45, aLz: 0.5, aLx: 0.3, eL: 0.5, aRz: 0.5, aRx: 0.3, eR: 0.5, bend: -0.15, hy: 0.45 }],
  [47.75, { y: -0.7, lL: 1.45, lR: 1.45, aLz: 0.5, aLx: 0.3, eL: 0.5, aRz: 0.5, aRx: 0.3, eR: 0.5, bend: -0.2, hy: 0.15, hx: -0.25 }],
  [49.8, { y: -0.7, lL: 1.45, lR: 1.45, aLz: 0.5, aLx: 0.3, eL: 0.5, aRx: 1.2, aRz: 0.9, eR: 0.6, bend: -0.2, hy: 0.4, hx: -0.15 }],
  [51.1, { y: -0.7, lL: 1.45, lR: 1.45, aLz: 0.5, aLx: 0.3, eL: 0.5, aRz: 0.5, aRx: 0.3, eR: 0.5, bend: -0.1, hy: 0.0, hx: 0.3 }, 0.5],
];

const SON_POS = V(-0.3, 0.0, -1.5);
const MOM_IN = V(2.0, 0, -0.55);
const MOM_FACE = Math.atan2(SON_POS.x - MOM_IN.x, SON_POS.z - MOM_IN.z);
const SON_FACE_MOM = Math.atan2(MOM_IN.x - SON_POS.x, MOM_IN.z - SON_POS.z);

// slipper flight path (world)
const FLY = new THREE.CatmullRomCurve3([
  V(1.95, 2.25, -0.45), V(1.1, 1.75, -0.95), V(0.1, 1.2, -1.45), V(-0.9, 1.1, -2.1), V(-1.6, 1.25, -2.9),
  V(-0.9, 1.45, -3.35), V(0.3, 1.5, -3.0), V(0.15, 1.2, -2.15), V(-0.22, 0.98, -1.62),
]);
const T_THROW = 32.3;
function slipperU(t) {
  // slow-mo during the dodge, fast on the homing turn
  if (t < T_THROW) return 0;
  if (t < 32.9) return lerp(0, 0.28, seg(t, T_THROW, 32.9));
  if (t < 33.55) return lerp(0.28, 0.42, seg(t, 32.9, 33.55)); // bullet time
  return lerp(0.42, 1, easeIn(seg(t, 33.55, T_IMPACT)) * 0.6 + seg(t, 33.55, T_IMPACT) * 0.4);
}

// =====================================================================
// SCENE STATE
// =====================================================================
const isBalcony = t => t >= 41.3;
function stateAt(t) {
  const balc = isBalcony(t);
  room.visible = !balc; hallway.visible = !balc && t < 17.5; balcony.visible = balc;
  scene.background = new THREE.Color(balc ? 0x0b0f2e : 0x05050a);
  scene.fog = balc ? new THREE.Fog(0x0b0f2e, 10, 30) : null;
  drawTV(t);

  // lighting: TV flicker in the room
  const flick = 0.85 + 0.15 * noise1(t * 7);
  tvLight.intensity = balc ? 0 : (t < 13.3 ? 6.5 : 5) * flick * (t >= T_IMPACT ? 0.6 : 1);
  tvLight.color.setHex(t < 13.3 ? 0x6fb8ff : t < T_IMPACT ? 0x4060ff : 0xbbbbbb);
  ambient.intensity = balc ? 0.75 : 0.5;
  ambient.color.setHex(balc ? 0x7080c0 : 0x8090c0);
  moon.intensity = balc ? 0.9 : 0.35;
  const doorOpen = t >= 16.95;
  hallLight.intensity = balc ? 0 : (t >= 8.36 && t < 13.06 ? 5 : doorOpen ? 6 : 0.8);
  hallLight.position.set(doorOpen && t > 18 ? 3.8 : 5.6, 2.2, 1.0);
  balcLight.intensity = balc ? 3.5 : 0; balcLight.position.set(1.7, 1.6, -0.6);

  // door
  let door = 0;
  if (doorOpen) { const k = seg(t, 16.95, 17.08); door = -2.2 * easeOut(k); if (t > 17.08) door = -1.9 - Math.sin((t - 17.08) * 10) * Math.exp(-(t - 17.08) * 3) * 0.35; }
  doorPivot.rotation.y = door;
  hallGlowMat.color.setHex(doorOpen ? 0xffd8a0 : 0x302418);
  underDoor.visible = !doorOpen && t > 8.36;
  underDoor.material.color.setHex(t > 11 ? (Math.floor(t * 4) % 2 ? 0xffc070 : 0x705020) : 0xffc070); // shadow passing feet

  // ---- Hamada (room) ----
  son.root.visible = !balc;
  let sp = SON_POS.clone(), sr = Math.PI;
  if (t >= 4.615 && t < 8.0) sr = Math.PI - 0.0; // turns head instead
  if (t >= 16.92) sr = SON_FACE_MOM;
  if (t >= 16.92 && t < 17.2) sp.y = Math.sin(seg(t, 16.92, 17.2) * Math.PI) * 0.35; // jump scare
  if (t >= 32.9 && t < 33.75) sp.x += 0;
  son.root.position.copy(sp); son.root.rotation.y = sr;
  const spz = poseAt(t, SON_KEYS);
  if (t < 0.98 || (t >= 8.0 && t < 13.06)) { // button mashing
    const m = Math.sin(t * 38) * 0.06; spz.eL += m; spz.eR -= m; spz.hz = noise1(t * 2) * 0.08;
  }
  if (t >= 13.06 && t < 15.34) { const m = Math.sin(t * 60) * 0.12; spz.eL += m; spz.eR -= m; spz.bend += Math.sin(t * 30) * 0.05; }
  if (t >= 4.615 && t < 8.0) { spz.hy = 0.15 + Math.sin(t * 3) * 0.08; spz.twist = 0.0; } // turns over shoulder to answer
  if (t >= 1.0 && t < 4.615) { spz.hy = lerp(0, -0.6, seg(t, 1.1, 1.5)); }
  if (t >= 24.05 && t < 27.3) { spz.y += Math.abs(Math.sin(t * 6)) * 0.02; spz.aLz += Math.sin(t * 12) * 0.05; } // pleading shake
  if (t >= T_IMPACT && t < 41.3) {
    // knocked flat on his back
    const k = easeOut(seg(t, T_IMPACT, T_IMPACT + 0.35));
    son.root.rotation.x = -k * Math.PI / 2; son.root.position.y = k * 0.16; son.root.position.z = SON_POS.z - k * 0.3;
    son.root.rotation.y = lerp(SON_FACE_MOM, SON_FACE_MOM + 0.3, k);
    Object.assign(spz, { y: lerp(spz.y, 0, k), bend: 0, lL: lerp(spz.lL, 0.15, k), lR: lerp(spz.lR, -0.1, k), aLz: lerp(spz.aLz, 1.4, k), aRz: lerp(spz.aRz, 1.5, k), aLx: 0, aRx: 0, eL: 0.2, eR: 0.3, hx: 0, hy: 0, hz: 0.2, tr: 0 });
    if (t > 37.5) spz.lR = 0.15 + Math.max(0, Math.sin((t - 37.5) * 9)) * 0.25 * (t < 38.3 ? 1 : 0); // twitch
  } else son.root.rotation.x = 0;
  applyPose(son, spz);
  // controller in hands (until he drops it at the boss intro)
  const hasCtrl = t < 16.92;
  controller.visible = !balc;
  if (hasCtrl) {
    const a = son.arms[0].hand.getWorldPosition(V(0, 0, 0)), b = son.arms[1].hand.getWorldPosition(V(0, 0, 0));
    controller.position.copy(a.clone().add(b).multiplyScalar(0.5)); controller.position.y += 0.03;
    controller.rotation.set(-0.5, son.root.rotation.y + Math.PI, 0);
  } else {
    const k = seg(t, 16.92, 17.4); controller.position.set(lerp(-0.3, 0.2, k), Math.max(0.03, 0.7 + 2.0 * k - 9 * k * k), lerp(-1.3, -1.0, k)); controller.rotation.set(k * 9, k * 4, 0.3);
  }
  // cable from console to controller
  if (cableMesh) { room.remove(cableMesh); cableMesh.geometry.dispose(); }
  { const a = V(0.55, 0.58, -3.25), b = controller.position.clone(); const m1 = VL(a, b, 0.3); m1.y = 0.03; const m2 = VL(a, b, 0.75); m2.y = 0.05; cableMesh = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([a, V(0.6, 0.05, -2.9), m1, m2, b]), 24, 0.01, 3), cableMat); room.add(cableMesh); }

  // ---- mom ----
  mom.root.visible = !balc && (t >= 8.36 && t < 13.06 || t >= 16.95);
  let mp, mr;
  if (t < 13.06) { // walking down the hallway toward the room
    const k = seg(t, 8.36, 12.9); mp = V(lerp(9.6, 5.4, k), 0, 1.0); mr = -Math.PI / 2;
    mp.y = Math.abs(Math.sin(t * 7)) * 0.04;
  } else if (t < 18.0) {
    const k = easeOut(seg(t, 17.0, 18.0)); mp = VL(V(4.6, 0, 1.0), MOM_IN, k * 0.15); mr = lerp(-Math.PI / 2, MOM_FACE, k);
  } else { mp = MOM_IN.clone(); mr = MOM_FACE; }
  if (t >= 16.95 && t < 18.2) mp = V(4.25, 0, 1.0);
  mom.root.position.copy(mp); mom.root.rotation.y = mr;
  const mpz = poseAt(t, MOM_KEYS);
  if (t < 13.06) { const w = Math.sin(t * 7); mpz.lL = w * 0.4; mpz.lR = -w * 0.4; mpz.aLx = -w * 0.3; mpz.aRx = w * 0.3; mpz.hy = 0; }
  if (t >= 16.95 && t < 18.2) { Object.assign(mpz, { aLz: 0.9, aRz: 0.9, eL: 1.9, eR: 1.9, aLx: 0.1, aRx: 0.1 }); } // hands on hips silhouette
  if (t >= 18.2 && t < 24.05) mpz.y = Math.sin(t * 2) * 0.01;
  applyPose(mom, mpz);
  mom.legs[1].userData.shoe.visible = t < 29.3; // right slipper comes off

  // ---- slipper ----
  slipper.visible = !balc && t >= 29.3;
  slipperGlow.intensity = 0;
  if (t >= 29.3 && t < T_THROW) {
    const hp = mom.arms[1].hand.getWorldPosition(V(0, 0, 0));
    slipper.position.copy(hp); slipper.rotation.set(1.2, mom.root.rotation.y, 0.3 + (t > 30.48 ? Math.sin(t * 3) * 0.1 : 0));
    if (t > 30.6) slipperGlow.intensity = 2.5;
  } else if (t >= T_THROW && t < T_IMPACT) {
    const u = slipperU(t); slipper.position.copy(FLY.getPoint(u));
    slipper.rotation.set(t * 22, t * 9, 0); slipperGlow.intensity = 3;
  } else if (t >= T_IMPACT) {
    // lands on his face and stays there
    const hd = son.head.getWorldPosition(V(0, 0, 0)); const k = seg(t, T_IMPACT, T_IMPACT + 0.4);
    slipper.position.set(hd.x + 0.02, hd.y + 0.2 + Math.max(0, Math.sin(k * Math.PI)) * 0.4, hd.z + 0.04);
    slipper.rotation.set(0, 0.3, 0.1 + (1 - k) * 4);
  }

  // ---- stars / sweat / trail particles ----
  const stars = [];
  if (t >= T_IMPACT && t < 41.3) {
    const hd = son.head.getWorldPosition(V(0, 0, 0));
    for (let i = 0; i < 5; i++) { const a = t * 4 + i / 5 * 6.28; stars.push({ pos: hd.clone().add(V(Math.cos(a) * 0.35, 0.3 + Math.sin(a * 2) * 0.03, Math.sin(a) * 0.35)), size: 0.14, rot: t * 3 + i }); }
  }
  if (t >= T_IMPACT && t < T_IMPACT + 0.3) { const hd = son.head.getWorldPosition(V(0, 0, 0)); const k = seg(t, T_IMPACT, T_IMPACT + 0.3); for (let i = 0; i < 10; i++) { const a = i / 10 * 6.28; stars.push({ pos: hd.clone().add(V(Math.cos(a) * k * 0.9, Math.sin(a) * k * 0.9 + 0.1, 0.2)), size: 0.22 * (1 - k) + 0.05, rot: i }); } }
  if (t >= 30.6 && t < T_THROW) { const hp = slipper.position; for (let i = 0; i < 3; i++) { const k = (t * 1.5 + i / 3) % 1; stars.push({ pos: hp.clone().add(V(Math.cos(i * 2) * 0.2, 0.15 + k * 0.1, Math.sin(i * 2) * 0.2)), size: 0.15 * Math.sin(k * Math.PI), rot: k * 3 }); } }
  emit(stars, starPool);
  const sweat = [];
  if (!balc && ((t >= 1.0 && t < 8.1) || (t >= 13.06 && t < 17.0) || (t >= 24.05 && t < 32.9))) {
    const hd = son.head.getWorldPosition(V(0, 0, 0));
    for (let i = 0; i < 4; i++) { const k = (t * 1.2 + i * 0.25) % 1; const sx = (i % 2 ? 1 : -1) * 0.26; sweat.push({ pos: hd.clone().add(V(sx, 0.18 - k * 0.5, 0.05)), size: 0.07, op: 1 - k }); }
  }
  emit(sweat, sweatPool);
  const trail = [];
  if (t >= T_THROW && t < T_IMPACT) {
    const u = slipperU(t);
    for (let i = 1; i <= 40; i++) { const uu = u - i * 0.008; if (uu < 0) break; trail.push({ pos: FLY.getPoint(uu), size: 0.07 * (1 - i / 40), op: 1 - i / 40, color: 0xff3030 }); }
  }
  emit(trail, trailPool);
  const puffs = [];
  if (t >= 16.95 && t < 17.6) { const k = seg(t, 16.95, 17.6); for (let i = 0; i < 10; i++) puffs.push({ pos: V(4.3 - k * 0.6 * hash(i), 0.2 + hash(i + 3) * 1.8, 0.5 + hash(i + 6) * 1.0), size: 0.3 + k * 0.6, op: (1 - k) * 0.6, color: 0xbbaa99 }); }
  if (t >= T_IMPACT && t < T_IMPACT + 0.6) { const k = seg(t, T_IMPACT, T_IMPACT + 0.6); for (let i = 0; i < 8; i++) { const a = i / 8 * 6.28; puffs.push({ pos: V(SON_POS.x + Math.cos(a) * k * 0.8, 0.12, SON_POS.z - 0.3 + Math.sin(a) * k * 0.8), size: 0.25 + k * 0.4, op: (1 - k) * 0.7, color: 0xcccccc }); } }
  emit(puffs, puffPool);

  // ---- balcony ----
  dad.root.visible = balc;
  if (balc) {
    dad.root.position.set(-0.75, 0.14, -0.55); dad.root.rotation.y = 0.15;
    applyPose(dad, poseAt(t, DAD_KEYS));
    // move Hamada's rig onto the balcony (re-parent)
    if (son.root.parent !== balcony) balcony.add(son.root);
    son.root.visible = true; son.root.rotation.set(0, -0.15, 0);
    let bk = easeOut(seg(t, 41.3, 41.9));
    son.root.position.set(lerp(1.5, 0.25, bk), 0.14, lerp(-0.7, -0.5, bk));
    applyPose(son, poseAt(t, BSON_KEYS));
    // slipper print on his forehead (decal via face option)
    laundry.forEach((c, i) => { c.rotation.y = Math.sin(t * 1.3 + i) * 0.25; c.rotation.x = Math.sin(t * 1.7 + i * 2) * 0.08; });
  } else if (son.root.parent !== room) room.add(son.root);

  // ---- faces ----
  // Hamada
  let se = 'normal', sm = 'closed', sopt = { fuzz: true };
  if (t < 1.0) { se = 'smug'; sm = 'tongue'; }
  else if (t < 4.615) { se = 'pin'; sm = 'o'; }
  else if (t < 8.36) { se = 'side'; sm = talkMouth(t, 'son') || 'fakegrin'; if (t > 6.3) se = 'smug'; if (sm === 'closed') sm = 'fakegrin'; }
  else if (t < 13.06) { se = 'smug'; sm = 'tongue'; }
  else if (t < 16.92) { se = 'wide'; sm = talkMouth(t, 'son', 'scream') || 'o'; }
  else if (t < 18.2) { se = 'pin'; sm = 'scream'; }
  else if (t < 24.05) { se = 'sad'; sm = 'wobble'; if (t > 20.5 && t < 21.0) se = 'closed'; }
  else if (t < 27.3) { se = 'sparkle'; sm = talkMouth(t, 'son') || 'wobble'; sopt.blush = true; }
  else if (t < 32.9) { se = 'wide'; sm = 'wobble'; if (t > 30.48) { se = 'pin'; sm = 'o'; } }
  else if (t < T_IMPACT) { se = 'wide'; sm = t < 33.75 ? 'scream' : 'grin'; }
  else if (t < 41.3) { se = 'dizzy'; sm = 'tongue'; if (t > 37.0) se = 'x'; }
  else { se = 'tired'; sm = talkMouth(t, 'son') || 'frown'; if (t > 51.1) se = 'closed'; }
  // Mom
  let me = 'normal', mm = 'closed', mopt = {};
  if (t < 13.06) { me = 'angry'; mm = 'clench'; }
  else if (t < 18.2) { me = 'menace'; mm = 'evil'; }
  else if (t < 24.05) { me = 'menace'; mm = talkMouth(t, 'mom') || 'flat'; }
  else if (t < 27.3) { me = 'flat'; mm = 'flat'; }
  else if (t < 28.9) { me = 'flat'; mm = talkMouth(t, 'mom') || 'evil'; if (t > 28.3) { me = 'menace'; } }
  else if (t < 32.4) { me = 'menace'; mm = talkMouth(t, 'mom', 'scream') || 'evil'; }
  else { me = 'smug'; mm = 'smile'; }
  if (t > 19 && t < 24 && [20.2, 22.4].some(b => t >= b && t < b + 0.18)) me = 'closed';
  // Dad
  let de = 'tired', dm = 'closed', dopt = { stache: true };
  if (balc) { dm = talkMouth(t, 'dad') || 'smile'; if (t > 47.75) de = 'sad'; if (t > 51.1) { de = 'closed'; dm = 'smile'; } if ([43.6, 46.2].some(b => t >= b && t < b + 0.18)) de = 'closed'; }
  son.faceMat.map = faceTexture(se, sm, sopt); son.faceMat.needsUpdate = true;
  mom.faceMat.map = faceTexture(me, mm, mopt); mom.faceMat.needsUpdate = true;
  dad.faceMat.map = faceTexture(de, dm, dopt); dad.faceMat.needsUpdate = true;
}

// =====================================================================
// CAMERA BY SHOT
// =====================================================================
function cameraAt(t) {
  const hd = son.head.getWorldPosition(V(0, 0, 0));
  if (t < 4.615) { // S01 over-the-shoulder at the TV, snap on the shout
    if (t < 1.0) { const k = seg(t, 0, 1.0); cam(VL(V(0.9, 1.35, 0.6), V(0.6, 1.25, 0.1), k), V(-0.1, 0.95, -3.4), 50); }
    else { const k = easeOut(seg(t, 1.0, 1.12)); cam(VL(V(0.6, 1.25, 0.1), V(0.15, 1.05, -0.75), k).add(shake(t, t < 1.6 ? 0.03 : 0.005, 22)), VL(V(-0.1, 0.95, -3.4), hd, k * 0.5).add(V(0, 0, 0)), lerp(50, 58, k)); }
  } else if (t < 8.356) { // S02 Hamada answering over his shoulder (camera on the TV side)
    const k = seg(t, 4.615, 8.356); cam(VL(V(0.15, 1.15, -2.75), V(0.0, 1.1, -2.55), k), hd.clone().add(V(0, -0.12, 0)), 48, -0.05);
  } else if (t < 13.06) { // S03 hallway: mom approaching, low angle
    const k = seg(t, 8.356, 13.06); cam(VL(V(4.85, 0.45, 1.45), V(4.95, 0.5, 1.35), k), VL(V(9.0, 1.4, 1.0), V(5.8, 1.5, 1.0), easeInOut(k)), 52, 0.06);
  } else if (t < 15.2) { // S04a TV save screen insert, over the hands
    cam(V(-0.1, 1.12, -2.25).add(shake(t, 0.006, 30)), V(-0.05, 0.98, -3.24), 42);
  } else if (t < 16.92) { // S04b Hamada screaming SAVE
    const k = easeOut(seg(t, 15.2, 15.4)); cam(VL(V(-0.15, 1.15, -2.95), V(-0.2, 1.1, -2.7), k).add(shake(t, 0.01, 25)), hd.clone().add(V(0, -0.15, 0)), 50);
  } else if (t < 18.219) { // S05 door kicked open, wide from behind the sofa
    cam(V(-1.6, 1.25, -0.6).add(shake(t, t < 17.3 ? 0.06 : 0, 25)), V(4.2, 1.1, 0.95), 30);
  } else if (t < 24.057) { // S06 boss low-angle, slow push
    const k = seg(t, 18.219, 24.057); const tgt = mom.head.getWorldPosition(V(0, 0, 0));
    cam(VL(V(0.25, 0.55, -1.45), V(0.75, 0.65, -1.15), k), tgt.clone().add(V(0, -0.35, 0)), 52, 0.04);
  } else if (t < 27.319) { // S07 Hamada begging, high angle from mom's POV
    const k = seg(t, 24.057, 27.319); cam(VL(V(1.0, 2.2, -0.75), V(0.7, 2.05, -0.95), k), hd.clone().add(V(0, -0.15, 0)), 50);
  } else if (t < 28.9) { // S08a mom ECU
    const tgt = mom.head.getWorldPosition(V(0, 0, 0)); const k = seg(t, 27.319, 28.9);
    const dir = V(Math.sin(MOM_FACE), 0, Math.cos(MOM_FACE));
    cam(tgt.clone().add(dir.clone().multiplyScalar(lerp(1.35, 1.15, k))).add(V(0, 0.05, 0)), tgt.clone().add(V(0, -0.08, 0)), 44);
  } else if (t < 30.479) { // S08b foot insert: the slipper comes off
    { const side = V(Math.cos(MOM_FACE), 0, -Math.sin(MOM_FACE)); cam(MOM_IN.clone().add(side.multiplyScalar(-3.1)).add(V(0, 1.0, 0)), MOM_IN.clone().add(V(0, 0.75, 0)), 50); }
  } else if (t < 32.11) { // S09 weapon raised, low hero angle
    const tgt = mom.head.getWorldPosition(V(0, 0, 0)); const k = seg(t, 30.479, 32.11);
    cam(VL(V(0.75, 0.6, -1.25), V(0.95, 0.5, -1.05), k), tgt.clone().add(V(0, 0.25, 0)), 56, -0.08);
  } else if (t < 32.9) { // S10a over mom's shoulder as she throws
    cam(V(3.0, 2.55, 0.7).add(shake(t, 0.01, 20)), V(-0.3, 0.7, -1.6), 50);
  } else if (t < 33.55) { // S10b bullet-time orbit around the dodge
    const k = seg(t, 32.9, 33.55); const a = lerp(2.2, 0.6, k); const c = V(-0.3, 0.8, -1.55);
    cam(c.clone().add(V(Math.cos(a) * 1.6, 0.35, Math.sin(a) * 1.6)), c.clone().add(V(0, 0.15, 0)), 50);
  } else if (t < T_IMPACT) { // S10c tracking the homing U-turn
    const sp = slipper.position.clone(); cam(V(1.1, 1.6, -0.2), VL(sp, V(-0.3, 0.9, -1.5), 0.4), 55);
  } else if (t < 35.11) { // S10d impact wide with shake
    cam(V(1.6, 1.7, 0.2).add(shake(t, 0.12 * (1 - seg(t, T_IMPACT, 35.0)), 28)), V(-0.4, 0.4, -1.7), 54);
  } else if (t < 41.3) { // S11 KO overhead
    const k = seg(t, 35.11, 41.3); cam(V(-0.3 + 0.01, lerp(3.0, 2.6, k), -1.78), V(-0.32, 0.1, -1.8), 55, lerp(0, 0.2, k));
  } else if (t < 45.5) { // S12a balcony two-shot
    const k = seg(t, 41.3, 45.5); cam(VL(V(-0.1, 1.15, 2.6), V(-0.15, 1.05, 2.2), k), V(-0.25, 0.75, -0.55), 50);
  } else if (t < 47.7) { // S12b Hamada CU
    const h2 = son.head.getWorldPosition(V(0, 0, 0)); cam(h2.clone().add(V(-0.25, 0.02, 1.05)), h2, 45);
  } else if (t < 51.1) { // S12c Ibrahim CU
    const h2 = dad.head.getWorldPosition(V(0, 0, 0)); cam(h2.clone().add(V(0.3, 0.05, 1.1)), h2, 45);
  } else { // S12d pull back, end card
    const k = easeInOut(seg(t, 51.1, 52.59)); cam(VL(V(-0.15, 1.1, 2.3), V(-0.1, 1.8, 4.2), k), V(-0.25, 0.9, -0.5), 52);
  }
}

// =====================================================================
// HUD
// =====================================================================
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

function playerHP(t) { if (t < 1.0) return 100; if (t < T_IMPACT) return t < 18.2 ? 64 : t < 24 ? 41 : t < 30.48 ? 27 : 12; return 0; }
function drawPlayer(g, t) {
  if (t >= 35.11) return;
  const v = playerHP(t); const hit = [1.0, 18.2, 24.05, 30.48, T_IMPACT].some(b => t >= b && t < b + 0.25);
  const ox = hit ? (hash(Math.floor(t * 30)) - .5) * 6 : 0;
  const x = 14 + ox, y = 12;
  panel(g, x, y, 220, 44);
  pxText(g, 'HAMADA', x + 8, y + 7, 8, '#ffe14a');
  arText(g, 'حمادة', x + 212, y + 1, 16, '#fff');
  pxText(g, 'LV16', x + 70, y + 7, 8, '#9fd0ff');
  const col = v > 60 ? '#3df05a' : v > 30 ? '#ffd400' : v > 10 ? '#ff8a1a' : '#ff2a2a';
  g.fillStyle = '#222'; g.fillRect(x + 8, y + 24, 160, 12);
  g.fillStyle = col; g.fillRect(x + 9, y + 25, 158 * v / 100, 10); g.fillStyle = 'rgba(255,255,255,0.45)'; g.fillRect(x + 9, y + 25, 158 * v / 100, 3);
  pxText(g, 'HP', x + 174, y + 26, 8, '#fff');
}
function drawClock(g, t) {
  if (t >= 35.11) return;
  const x = W - 196, y = 12; panel(g, x, y, 182, 44);
  const blink = Math.floor(t * 2) % 2;
  pxText(g, '02' + (blink ? ':' : ' ') + '00 AM', x + 10, y + 8, 10, t >= 18.2 && t < 24.05 && Math.floor(t * 4) % 2 ? '#ff4040' : '#fff');
  const left = 6 * 3600 - Math.floor(t);
  const hh = String(Math.floor(left / 3600)).padStart(2, '0'), mm = String(Math.floor(left % 3600 / 60)).padStart(2, '0'), ss = String(left % 60).padStart(2, '0');
  pxText(g, 'EXAM ' + hh + ':' + mm + ':' + ss, x + 10, y + 26, 8, '#ff9a4a');
}
function detection(t) { if (t < 1.0) return 0.05; if (t < 8.36) return 0.35; if (t < 12.4) return lerp(0.35, 0.95, seg(t, 8.36, 12.4)); return 1; }
function drawDetection(g, t) {
  if (t >= 16.92) return;
  const v = detection(t); const alert = t >= 12.4;
  const cx = W / 2, y = 66;
  g.fillStyle = 'rgba(0,0,0,0.6)'; g.fillRect(cx - 80, y, 160, 30); g.strokeStyle = alert ? '#ff3030' : '#fff'; g.lineWidth = 2; g.strokeRect(cx - 80, y, 160, 30);
  // eye icon
  g.fillStyle = alert ? '#ff3030' : '#fff'; g.beginPath(); g.ellipse(cx - 62, y + 15, 12, 7, 0, 0, 7); g.fill(); g.fillStyle = '#000'; g.beginPath(); g.arc(cx - 62, y + 15, 4, 0, 7); g.fill();
  pxText(g, 'DETECTION', cx - 44, y + 4, 7, alert ? '#ff6060' : '#ffe14a');
  g.fillStyle = '#333'; g.fillRect(cx - 44, y + 16, 116, 8);
  g.fillStyle = v < 0.5 ? '#ffe14a' : v < 0.9 ? '#ff8a1a' : '#ff2a2a'; g.fillRect(cx - 44, y + 16, 116 * v, 8);
  if (alert && t < 16.92) {
    const k = easeBack(seg(t, 12.4, 12.6)); g.save(); g.translate(cx, y + 64); g.scale(k, k);
    pxText(g, '!', 0, -22, 40, '#ff2020', 'center'); g.restore();
    if (Math.floor(t * 6) % 2) pxText(g, 'ALERT', cx, y + 92, 12, '#ff4040', 'center');
  }
}
function drawBossBar(g, t) {
  if (t < 18.219 || t >= 35.11) return;
  const k = easeOut(seg(t, 18.219, 18.6));
  const x = 70, y = H - 168 + (1 - k) * 80; const w = W - 140;
  g.fillStyle = 'rgba(0,0,0,0.7)'; g.fillRect(x, y, w, 28); g.strokeStyle = '#ffd400'; g.lineWidth = 2; g.strokeRect(x, y, w, 28);
  arText(g, 'ماما — الزعيم الأخير', x + w - 8, y - 22, 18, '#ffd400');
  pxText(g, 'FINAL BOSS', x + 4, y - 14, 8, '#ff6060');
  const fill = seg(t, 18.3, 19.4);
  for (let i = 0; i < 3; i++) { g.fillStyle = ['#a00010', '#d01020', '#ff3040'][i]; g.fillRect(x + 4, y + 4 + i * 7, (w - 8) * fill, 6); }
  pxText(g, '∞', x + w - 26, y + 7, 12, '#fff');
  pxText(g, 'HP 999999', x + 10, y + 9, 8, '#fff');
}
function portrait(g, x, y, who, t) {
  g.fillStyle = '#123'; g.fillRect(x, y, 64, 64); g.strokeStyle = '#fff'; g.lineWidth = 2; g.strokeRect(x, y, 64, 64);
  g.save(); g.beginPath(); g.rect(x + 2, y + 2, 60, 60); g.clip();
  if (who === 'mom') {
    g.fillStyle = '#1f9e5a'; g.beginPath(); g.arc(x + 32, y + 34, 27, 0, 7); g.fill();
    g.fillStyle = '#c98d5f'; g.beginPath(); g.arc(x + 32, y + 38, 19, 0, 7); g.fill();
    g.fillStyle = '#ec86ad'; g.fillRect(x + 6, y + 58, 52, 6);
    g.fillStyle = '#ff4fa0'; g.fillRect(x + 20, y + 8, 7, 5); g.fillStyle = '#4fc3ff'; g.fillRect(x + 29, y + 7, 7, 5); g.fillStyle = '#ffd400'; g.fillRect(x + 38, y + 8, 7, 5);
  } else if (who === 'son') {
    g.fillStyle = '#d4141c'; g.fillRect(x + 8, y + 54, 48, 10);
    g.fillStyle = '#b98058'; g.beginPath(); g.arc(x + 32, y + 36, 19, 0, 7); g.fill();
    g.fillStyle = '#17110c'; for (let i = 0; i < 7; i++) { g.beginPath(); g.arc(x + 14 + i * 6, y + 18 + (i % 2) * 3, 7, 0, 7); g.fill(); }
    g.fillStyle = '#222'; g.fillRect(x + 8, y + 50, 48, 4);
  } else {
    g.fillStyle = '#1a1a1a'; for (let i = 0; i < 6; i++) { g.beginPath(); g.arc(x + 14 + i * 7, y + 16 + (i % 2) * 4, 9, 0, 7); g.fill(); }
    g.fillStyle = '#f3f0e3'; g.fillRect(x + 10, y + 54, 44, 10);
    g.fillStyle = '#b27448'; g.beginPath(); g.arc(x + 32, y + 36, 20, 0, 7); g.fill();
    g.fillStyle = '#c9a227'; g.fillRect(x + 14, y + 18, 36, 5); g.fillStyle = '#335a3a'; g.fillRect(x + 18, y + 17, 10, 7); g.fillRect(x + 36, y + 17, 10, 7);
  }
  const fc = document.createElement('canvas'); fc.width = 32; fc.height = 32; const fg = fc.getContext('2d');
  const sp = speakerAt(t) === who; const e = envAt(t);
  const mouth = sp ? (e < 0.1 ? 'closed' : e < 0.4 ? 'talk1' : 'talk2') : 'closed';
  let eyes = 'normal';
  if (who === 'mom') eyes = t < 13 ? 'angry' : 'menace';
  if (who === 'son') eyes = t < 13 ? 'side' : t < 24 ? 'wide' : t < 28 ? 'sparkle' : 'tired';
  if (who === 'dad') eyes = 'tired';
  drawFace(fg, 32, eyes, mouth, { stache: who === 'dad', fuzz: who === 'son' });
  g.imageSmoothingEnabled = false; g.drawImage(fc, x + 14, y + 20, 36, 36);
  g.restore();
}
const NAMES = { mom: ['أم حمادة', 'OM HAMADA', '#1f9e5a'], son: ['حمادة', 'HAMADA', '#d4141c'], dad: ['إبراهيم', 'IBRAHIM', '#c9a227'] };
function drawDialogue(g, t) {
  const L = LINES.find(l => l.s !== 'anno' && t >= l.t0 && t < l.t1 + Math.min(0.5, l.gap_after * 0.9));
  if (!L) return;
  let sx = 0, sy = 0;
  if ((L.id === 'L01' || L.id === 'L04' || L.id === 'L08') && t < L.t0 + 0.6) { sx = (hash(Math.floor(t * 30)) - .5) * 8; sy = (hash(Math.floor(t * 30) + 3) - .5) * 5; }
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
function drawBossIntro(g, t) {
  const a = t - 17.25; if (a < 0 || t >= 18.219) return;
  g.fillStyle = 'rgba(80,0,0,0.45)'; g.fillRect(0, 0, W, H);
  // diagonal slash bands
  const k = easeOut(clamp(a / 0.2));
  g.save(); g.translate(W / 2, H / 2); g.rotate(-0.12);
  g.fillStyle = 'rgba(0,0,0,0.85)'; g.fillRect(-W, -70, W * 2 * k, 140);
  g.fillStyle = '#ffd400'; g.fillRect(-W, -74, W * 2 * k, 4); g.fillRect(-W, 70, W * 2 * k, 4);
  if (a > 0.12) {
    const s = easeBack(clamp((a - 0.12) / 0.2)); g.save(); g.scale(s, s);
    arText(g, 'الزعيم الأخير', 0, -64, 50, '#ff2a2a', 'center', 'ReemKufi');
    pxText(g, 'FINAL BOSS', 0, -2, 22, '#ffe14a', 'center');
    g.restore();
  }
  if (a > 0.45) { arText(g, '«ماما» — لا تُهزم', 0, 26, 26, '#ffffff', 'center'); }
  g.restore();
}
function drawWeaponCard(g, t) {
  const a = t - 30.6; if (a < 0 || t >= 32.15) return;
  const k = a < 0.18 ? easeBack(a / 0.18) : 1; const ex = t > 31.9 ? seg(t, 31.9, 32.15) : 0;
  g.save(); g.translate(W / 2 - ex * W, 196); g.scale(k, k);
  g.fillStyle = 'rgba(255,40,40,0.8)';
  for (let i = 0; i < 16; i++) { const an = i / 16 * 6.28 + t * 1.5; g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.cos(an) * 240, Math.sin(an) * 240); g.lineTo(Math.cos(an + 0.18) * 240, Math.sin(an + 0.18) * 240); g.fill(); }
  g.fillStyle = 'rgba(10,10,60,0.93)'; g.fillRect(-205, -98, 410, 196); g.strokeStyle = '#fff'; g.lineWidth = 3; g.strokeRect(-205, -98, 410, 196);
  pxText(g, 'NEW WEAPON!', -190, -85, 14, '#ff5050', 'left');
  arText(g, '!سلاح جديد', 190, -94, 24, '#ff5050', 'right');
  arText(g, 'الشبشب الأزرق', 190, -56, 32, '#ffffff', 'right');
  pxText(g, 'THE SLIPPER', -190, -40, 12, '#7fdcff', 'left');
  const stat = (lbl, val, yy, col) => { pxText(g, lbl, -190, yy, 10, '#fff', 'left'); pxText(g, val, -40, yy, 10, col, 'left'); };
  stat('DAMAGE', '∞', -4, '#ff4a2a'); stat('HOMING', 'YES', 20, '#3df05a'); stat('RANGE', 'WHOLE FLAT', 44, '#ffd400'); stat('ESCAPE', '0%', 68, '#ff4a2a');
  g.save(); g.translate(150, 30); g.rotate(t * 3); g.fillStyle = '#2f6fff'; g.fillRect(-14, -30, 28, 60); g.fillStyle = '#1d4fd0'; g.fillRect(-14, -12, 28, 8); g.fillStyle = '#ff4fa0'; g.fillRect(-4, -12, 8, 8); g.restore();
  g.restore();
}
function drawLockOn(g, t) {
  if (t < 33.55 || t >= T_IMPACT) return;
  const p = son.head.getWorldPosition(V(0, 0, 0)).project(camera);
  const x = (p.x + 1) / 2 * W, y = (1 - p.y) / 2 * H; const s = 46 - seg(t, 33.55, T_IMPACT) * 18;
  g.save(); g.translate(x, y); g.rotate(t * 4); g.strokeStyle = '#ff2020'; g.lineWidth = 3;
  for (let i = 0; i < 4; i++) { g.rotate(Math.PI / 2); g.beginPath(); g.moveTo(s, s - 14); g.lineTo(s, s); g.lineTo(s - 14, s); g.stroke(); }
  g.restore();
  if (Math.floor(t * 10) % 2) pxText(g, 'LOCK ON', x, y + 52, 10, '#ff3030', 'center');
  pxText(g, 'HOMING', 40, 120, 14, '#ff3030', 'left');
}
function drawBulletTime(g, t) {
  if (t < 32.9 || t >= 33.55) return;
  g.fillStyle = 'rgba(0,40,0,0.22)'; g.fillRect(0, 0, W, H);
  g.fillStyle = '#000'; g.fillRect(0, 0, W, 40); g.fillRect(0, H - 40, W, 40);
  pxText(g, 'SLOW-MO', W - 130, 14, 10, '#3df05a', 'left');
  // speed lines
  g.strokeStyle = 'rgba(255,255,255,0.35)'; g.lineWidth = 1;
  for (let i = 0; i < 24; i++) { const a = i / 24 * 6.28 + hash(i) * 0.2; const r0 = 180 + hash(i + Math.floor(t * 20)) * 60; g.beginPath(); g.moveTo(W / 2 + Math.cos(a) * r0, H / 2 + Math.sin(a) * r0); g.lineTo(W / 2 + Math.cos(a) * 400, H / 2 + Math.sin(a) * 400); g.stroke(); }
}
function drawCritical(g, t) {
  const a = t - T_IMPACT; if (a < 0 || t >= 35.11) return;
  const k = easeBack(clamp(a / 0.15));
  g.save(); g.translate(W / 2, 150); g.rotate(-0.08); g.scale(k, k);
  pxText(g, 'CRITICAL HIT!', 0, -20, 26, Math.floor(t * 12) % 2 ? '#ffe14a' : '#ff3030', 'center');
  arText(g, '!ضربة قاضية', 0, 14, 34, '#ffffff', 'center', 'ReemKufi');
  g.restore();
  const dy = a * 60; pxText(g, '-9999', W / 2 + 120, 230 - dy, 20, '#ff4040', 'center');
}
function drawKO(g, t) {
  const a = t - 35.11; if (a < 0 || t >= 41.3) return;
  if (a < 3.4) {
    const k = easeBack(clamp(a / 0.2));
    g.save(); g.translate(W / 2, 180); g.scale(k * 1.0, k * 1.0); pxText(g, 'K.O.', 0, -40, 64, '#ff2a2a', 'center'); g.restore();
    if (a > 0.5) arText(g, 'حمادة اتهزم', W / 2, 225, 36, '#ffe14a', 'center', 'ReemKufi');
    if (a > 0.8) pxText(g, 'HAMADA HAS BEEN DEFEATED', W / 2, 280, 10, '#fff', 'center');
  } else {
    g.fillStyle = `rgba(0,0,0,${0.7 * clamp((a - 3.4) / 0.3)})`; g.fillRect(0, 0, W, H);
    pxText(g, 'CONTINUE?', W / 2, 92, 24, '#ffe14a', 'center');
    arText(g, 'تكمل؟', W / 2, 128, 34, '#fff', 'center', 'ReemKufi');
    const sel = t >= 40.25 ? 1 : 0;
    const items = [['RETRY LEVEL', 'إعادة المرحلة'], ['SLEEP ON THE BALCONY', 'النوم في البلكونة']];
    items.forEach(([en, ar], i) => {
      const y = 214 + i * 64; const on = i === sel;
      if (on) { g.fillStyle = 'rgba(40,80,200,0.75)'; g.fillRect(70, y - 8, W - 140, 52); g.strokeStyle = '#fff'; g.lineWidth = 2; g.strokeRect(70, y - 8, W - 140, 52); }
      pxText(g, en, 120, y + 8, 11, on ? '#ffe14a' : '#9aa', 'left');
      arText(g, ar, W - 90, y - 4, 24, on ? '#ffffff' : '#9aa', 'right');
      if (on && Math.floor(t * 4) % 2 === 0) { g.fillStyle = '#ffe14a'; g.beginPath(); g.moveTo(88, y + 6); g.lineTo(104, y + 14); g.lineTo(88, y + 22); g.fill(); }
    });
    // Retry is greyed out with a slipper stamp
    if (t >= 39.6) { g.save(); g.translate(250, 228); g.rotate(-0.2); g.strokeStyle = '#ff2020'; g.lineWidth = 3; g.strokeRect(-70, -16, 140, 32); pxText(g, 'LOCKED', 0, -6, 12, '#ff2020', 'center', false); g.restore(); }
    if (t >= 40.25 && t < 40.5) { g.fillStyle = 'rgba(255,255,255,0.35)'; g.fillRect(70, 270, W - 140, 52); }
    pxText(g, 'CREDITS: 0', W / 2, 400, 10, '#fff', 'center');
  }
}
function drawBalconyTitle(g, t) {
  const a = t - 41.3; if (a < 0 || a > 2.4) return;
  const op = a < 2.0 ? 1 : 1 - (a - 2.0) / 0.4;
  g.globalAlpha = op;
  g.fillStyle = 'rgba(0,0,0,0.6)'; g.fillRect(0, 70, W, 70);
  arText(g, 'المرحلة السرية: البلكونة', W / 2, 74, 30, '#ffe14a', 'center');
  pxText(g, 'SECRET LEVEL: THE BALCONY', W / 2, 116, 10, '#fff', 'center');
  g.globalAlpha = 1;
}
function drawEnd(g, t) {
  const a = t - 51.25; if (a < 0) return;
  const k = easeOut(clamp(a / 0.4));
  g.fillStyle = `rgba(0,0,0,${0.55 * k})`; g.fillRect(0, 0, W, H);
  g.save(); g.translate(W / 2, 190); g.scale(k, k);
  arText(g, 'يُتبع...', 0, -40, 54, '#ffe14a', 'center', 'ReemKufi');
  pxText(g, 'TO BE CONTINUED', 0, 30, 16, '#fff', 'center');
  g.restore();
  if (a > 0.5) pxText(g, 'EPISODE 3', W / 2, 300, 10, '#9fd0ff', 'center');
}
function vignette(g, amt) { const gr = g.createRadialGradient(W / 2, H / 2, 120, W / 2, H / 2, 420); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, `rgba(0,0,0,${amt})`); g.fillStyle = gr; g.fillRect(0, 0, W, H); }

// =====================================================================
window.renderFrame = function (t) {
  // boss intro is a freeze frame
  const st = (t >= 17.25 && t < 18.219) ? 17.25 : t;
  stateAt(st); cameraAt(st);
  renderer.render(scene, camera);
  ctx.clearRect(0, 0, W, H); ctx.drawImage(glCanvas, 0, 0);
  h.clearRect(0, 0, W, H);
  if (t < 41.3) { drawPlayer(h, t); drawClock(h, t); }
  drawDetection(h, t);
  drawBossBar(h, t);
  drawBulletTime(h, t);
  drawLockOn(h, t);
  drawBossIntro(h, t);
  drawDialogue(h, t);
  drawWeaponCard(h, t);
  drawCritical(h, t);
  drawKO(h, t);
  drawBalconyTitle(h, t);
  drawEnd(h, t);
  ctx.drawImage(hud, 0, 0);
  vignette(ctx, 0.45);
  if (t >= 16.95 && t < 17.0) { ctx.fillStyle = 'rgba(255,240,200,0.8)'; ctx.fillRect(0, 0, W, H); }
  if (t >= T_IMPACT && t < T_IMPACT + 0.07) { ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, W, H); }
  if (t >= 41.0 && t < 41.3) { ctx.fillStyle = `rgba(0,0,0,${seg(t, 41.0, 41.3)})`; ctx.fillRect(0, 0, W, H); }
  if (t >= 41.3 && t < 41.6) { ctx.fillStyle = `rgba(0,0,0,${1 - seg(t, 41.3, 41.6)})`; ctx.fillRect(0, 0, W, H); }
  return true;
};
window.frameData = () => out.toDataURL('image/png');
window.DUR = DUR;
function redrawLabels() {
  const re = (tex, bg, fn) => { const g = tex.userData.g, c = tex.userData.canvas; g.clearRect(0, 0, c.width, c.height); if (bg) { g.fillStyle = bg; g.fillRect(0, 0, c.width, c.height); } fn(g); tex.needsUpdate = true; };
  re(booksTex, '#2a5bd7', (g) => { g.fillStyle = '#fff'; g.font = '12px Lalezar'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.direction = 'rtl'; g.fillText('كيمياء', 32, 9); });
  re(jerseyTex, '#d4141c', (g) => { g.fillStyle = '#ffffff'; g.fillRect(0, 2, 32, 2); g.font = '12px PS2P'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('10', 16, 18); });
  re(posterTex, '#111', (g) => { g.fillStyle = '#ffcc00'; g.fillRect(2, 2, 28, 40); g.fillStyle = '#d4141c'; g.beginPath(); g.arc(16, 18, 9, 0, 7); g.fill(); g.fillStyle = '#fff'; g.fillRect(12, 14, 8, 8); g.fillStyle = '#111'; g.font = '6px PS2P'; g.textAlign = 'center'; g.fillText('GOAL', 16, 38); });
}
document.fonts.load('10px PS2P').then(() => document.fonts.load('20px Lalezar', 'ع')).then(() => document.fonts.load('700 20px ReemKufi', 'ع')).then(() => { redrawLabels(); window.READY = true; });
