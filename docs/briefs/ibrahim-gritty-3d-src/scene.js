// Ibrahim — gritty late-2000s open-world look test (10 s, 24 fps, 1280x720)
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { GTAOPass } from 'three/addons/postprocessing/GTAOPass.js';

const W = 1280, H = 720;
const Q = new URLSearchParams(location.search);
const NO_AO = Q.has('noao');

// ---------- deterministic random ----------
function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
const lerp = (a, b, t) => a + (b - a) * t;

// ---------- renderer ----------
const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
renderer.setSize(W, H);
renderer.setPixelRatio(1);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.3;
renderer.outputColorSpace = THREE.SRGBColorSpace;

const scene = new THREE.Scene();
const FOG = new THREE.Color(0x6b5a4a);
scene.fog = new THREE.FogExp2(FOG, 0.028);
const camera = new THREE.PerspectiveCamera(38, W / H, 0.05, 300);

// ---------- canvas texture helpers ----------
function canvas(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return [c, c.getContext('2d')]; }
function tex(c, srgb = true, rep = [1, 1]) {
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep[0], rep[1]);
  t.anisotropy = 4; return t;
}
function speckle(g, w, h, r, n, cols, aMax = 0.12, sz = 3) {
  for (let i = 0; i < n; i++) { g.fillStyle = cols[(r() * cols.length) | 0]; g.globalAlpha = r() * aMax; const s = 1 + r() * sz; g.fillRect(r() * w, r() * h, s, s); }
  g.globalAlpha = 1;
}
function stains(g, w, h, r, n, col = '30,22,14') {
  for (let i = 0; i < n; i++) {
    const x = r() * w, y = r() * h * 0.9, ww = 6 + r() * 40, hh = 40 + r() * 220;
    const gr = g.createLinearGradient(0, y, 0, y + hh);
    gr.addColorStop(0, `rgba(${col},${0.10 + r() * 0.25})`); gr.addColorStop(1, `rgba(${col},0)`);
    g.fillStyle = gr; g.fillRect(x, y, ww, hh);
  }
}

// ---------- facade texture ----------
function facade(seed, cols, floors, base, opts = {}) {
  const r = rng(seed), CW = 128, FH = 128;
  const [c, g] = canvas(cols * CW, floors * FH);
  const [ce, ge] = canvas(cols * CW, floors * FH);
  ge.fillStyle = '#000'; ge.fillRect(0, 0, ce.width, ce.height);
  g.fillStyle = base; g.fillRect(0, 0, c.width, c.height);
  speckle(g, c.width, c.height, r, 9000, ['#000', '#fff', '#5a4630', '#c8b090'], 0.10, 3);
  // plaster patches
  for (let i = 0; i < 30; i++) { g.fillStyle = r() < .5 ? 'rgba(255,240,210,0.08)' : 'rgba(40,30,20,0.10)'; g.beginPath(); g.ellipse(r() * c.width, r() * c.height, 20 + r() * 90, 10 + r() * 50, r() * 3, 0, 7); g.fill(); }
  for (let f = 0; f < floors; f++) {
    const y0 = c.height - (f + 1) * FH;
    // floor ledge
    g.fillStyle = 'rgba(255,245,225,0.18)'; g.fillRect(0, y0 + FH - 10, c.width, 6);
    g.fillStyle = 'rgba(0,0,0,0.25)'; g.fillRect(0, y0 + FH - 4, c.width, 4);
    for (let k = 0; k < cols; k++) {
      const x0 = k * CW;
      if (f === 0 && !opts.openGround) {
        // ground floor: rolling shutters / doors
        if (opts.shopCols && opts.shopCols.includes(k)) continue;
        const sx = x0 + 10, sw = CW - 20, sy = y0 + 18, sh = FH - 22;
        if (r() < 0.6) {
          g.fillStyle = `rgb(${90 + r() * 30},${92 + r() * 25},${90 + r() * 20})`; g.fillRect(sx, sy, sw, sh);
          for (let yy = sy; yy < sy + sh; yy += 5) { g.fillStyle = 'rgba(0,0,0,0.35)'; g.fillRect(sx, yy, sw, 1.5); g.fillStyle = 'rgba(255,255,255,0.10)'; g.fillRect(sx, yy + 2, sw, 1); }
          stains(g, sw, sh, r, 4, '60,35,15'); // rust
          g.fillStyle = 'rgba(20,20,20,0.6)'; g.font = 'bold 18px sans-serif';
          if (r() < 0.5) { g.save(); g.translate(sx + 12, sy + 40); g.rotate(-0.05); g.fillStyle = `rgba(${r() < .5 ? '170,30,30' : '30,30,30'},0.55)`; g.fillText(['٠١٠٠', 'للإيجار', 'ممنوع الوقوف', 'X'][(r() * 4) | 0], 0, 0); g.restore(); }
        } else {
          g.fillStyle = '#2a2018'; g.fillRect(sx + 20, sy, sw - 40, sh);
          g.fillStyle = '#4a3624'; g.fillRect(sx + 24, sy + 4, sw - 48, sh - 4);
          g.fillStyle = '#1a120c'; g.fillRect(sx + 26, sy + 40, sw - 52, 3);
        }
        continue;
      }
      const ww = 52, wh = 74, wx = x0 + (CW - ww) / 2, wy = y0 + 22;
      // frame + sill
      g.fillStyle = 'rgba(240,225,200,0.5)'; g.fillRect(wx - 6, wy - 6, ww + 12, wh + 12);
      g.fillStyle = 'rgba(0,0,0,0.3)'; g.fillRect(wx - 8, wy + wh + 6, ww + 16, 5);
      const lit = r() < (opts.litP ?? 0.32);
      if (lit) {
        const warm = r() < 0.75;
        const col = warm ? `rgb(255,${170 + r() * 50},${70 + r() * 50})` : `rgb(${190 + r() * 40},255,${220 + r() * 30})`;
        g.fillStyle = col; g.fillRect(wx, wy, ww, wh);
        ge.fillStyle = col; ge.fillRect(wx, wy, ww, wh);
        // curtain silhouettes
        g.fillStyle = 'rgba(80,40,20,0.55)'; ge.fillStyle = 'rgba(0,0,0,0.6)';
        const cw = 8 + r() * 14; g.fillRect(wx, wy, cw, wh); ge.fillRect(wx, wy, cw, wh);
        g.fillRect(wx + ww - cw, wy, cw, wh); ge.fillRect(wx + ww - cw, wy, cw, wh);
      } else {
        const gr = g.createLinearGradient(wx, wy, wx + ww, wy + wh);
        gr.addColorStop(0, '#2b3036'); gr.addColorStop(0.6, '#15181c'); gr.addColorStop(1, '#3a3f44');
        g.fillStyle = gr; g.fillRect(wx, wy, ww, wh);
      }
      g.fillStyle = 'rgba(30,25,20,0.9)'; g.fillRect(wx + ww / 2 - 1.5, wy, 3, wh); g.fillRect(wx, wy + wh * 0.38, ww, 3);
      // wooden shutters
      if (r() < 0.55) {
        const sc = ['#3d4a32', '#5a3b22', '#2f4440', '#6b4a2a'][(r() * 4) | 0];
        const open = r();
        const drawSh = (x, w) => { g.fillStyle = sc; g.fillRect(x, wy - 2, w, wh + 4); for (let yy = wy; yy < wy + wh; yy += 5) { g.fillStyle = 'rgba(0,0,0,0.35)'; g.fillRect(x, yy, w, 1.5); } };
        if (open < 0.4) { drawSh(wx - 22, 18); drawSh(wx + ww + 4, 18); }
        else if (open < 0.7) { drawSh(wx, ww); ge.fillStyle = '#000'; ge.fillRect(wx, wy, ww, wh); }
        else { drawSh(wx, ww / 2); ge.fillStyle = '#000'; ge.fillRect(wx, wy, ww / 2, wh); }
      }
      stains(g, 1, 1, r, 0);
      // drip stain under window
      const gr2 = g.createLinearGradient(0, wy + wh + 8, 0, wy + wh + 80);
      gr2.addColorStop(0, 'rgba(25,18,10,0.35)'); gr2.addColorStop(1, 'rgba(25,18,10,0)');
      g.fillStyle = gr2; g.fillRect(wx + 4 + r() * 20, wy + wh + 8, 10 + r() * 20, 72);
    }
  }
  stains(g, c.width, c.height, r, 40);
  // grime at the base
  const gb = g.createLinearGradient(0, c.height - 60, 0, c.height); gb.addColorStop(0, 'rgba(20,15,10,0)'); gb.addColorStop(1, 'rgba(20,15,10,0.55)');
  g.fillStyle = gb; g.fillRect(0, c.height - 60, c.width, 60);
  return { map: tex(c), emissive: tex(ce) };
}

function plainTex(seed, base, w = 256, h = 256) {
  const r = rng(seed); const [c, g] = canvas(w, h); g.fillStyle = base; g.fillRect(0, 0, w, h);
  speckle(g, w, h, r, 3000, ['#000', '#fff', '#4a3a28'], 0.12, 3); stains(g, w, h, r, 10);
  return tex(c);
}

// ---------- asphalt ----------
function asphalt() {
  const r = rng(7), S = 1024;
  const [c, g] = canvas(S, S); const [cr, gr] = canvas(S, S);
  g.fillStyle = '#2b2926'; g.fillRect(0, 0, S, S);
  speckle(g, S, S, r, 60000, ['#000', '#5a5650', '#777068', '#1a1816'], 0.35, 2.5);
  gr.fillStyle = 'rgb(205,205,205)'; gr.fillRect(0, 0, S, S);
  speckle(gr, S, S, r, 20000, ['#fff', '#999'], 0.3, 2);
  // patches and cracks
  for (let i = 0; i < 14; i++) { g.fillStyle = `rgba(${r() < .5 ? '15,14,13' : '70,66,60'},0.5)`; g.fillRect(r() * S, r() * S, 60 + r() * 200, 40 + r() * 160); }
  g.strokeStyle = 'rgba(8,8,8,0.8)'; g.lineWidth = 1.5;
  for (let i = 0; i < 40; i++) { let x = r() * S, y = r() * S; g.beginPath(); g.moveTo(x, y); for (let k = 0; k < 8; k++) { x += (r() - .5) * 40; y += (r() - .5) * 40; g.lineTo(x, y); } g.stroke(); }
  // puddles: darker + glossy
  for (let i = 0; i < 9; i++) {
    const x = r() * S, y = r() * S, rx = 40 + r() * 120, ry = 20 + r() * 70, a = r() * 3;
    for (const [gg, col] of [[g, 'rgba(10,10,12,0.55)'], [gr, 'rgba(10,10,10,1)']]) {
      gg.fillStyle = col; gg.beginPath();
      for (let k = 0; k < 24; k++) { const th = k / 24 * Math.PI * 2, rr = 1 + (r() - .5) * 0.35; gg.lineTo(x + Math.cos(th + a) * rx * rr, y + Math.sin(th + a) * ry * rr); }
      gg.fill();
    }
  }
  const map = tex(c, true, [1, 6]), rough = tex(cr, false, [1, 6]);
  return { map, rough };
}

// ---------- sky ----------
function sky() {
  const [c, g] = canvas(1024, 512);
  const gr = g.createLinearGradient(0, 0, 0, 512);
  gr.addColorStop(0.0, '#2a3340'); gr.addColorStop(0.32, '#4a4f58'); gr.addColorStop(0.44, '#8a6c52'); gr.addColorStop(0.5, '#c98a4e'); gr.addColorStop(0.56, '#6b5a4a'); gr.addColorStop(1, '#3a3028');
  g.fillStyle = gr; g.fillRect(0, 0, 1024, 512);
  const r = rng(99);
  for (let i = 0; i < 70; i++) { g.fillStyle = `rgba(${r() < .5 ? '40,40,48' : '200,140,90'},${0.05 + r() * 0.1})`; g.beginPath(); g.ellipse(r() * 1024, 120 + r() * 120, 60 + r() * 200, 4 + r() * 14, 0, 0, 7); g.fill(); }
  const t = tex(c); t.mapping = THREE.EquirectangularReflectionMapping; return t;
}

// ---------- materials ----------
const M = {
  plaster: (seed, col) => new THREE.MeshStandardMaterial({ map: plainTex(seed, col), roughness: 0.95 }),
  dark: new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.8 }),
  metal: new THREE.MeshStandardMaterial({ color: 0x7a7a78, roughness: 0.45, metalness: 0.8 }),
  rust: new THREE.MeshStandardMaterial({ map: plainTex(31, '#6b4a32'), roughness: 0.8, metalness: 0.3 }),
  wire: new THREE.MeshStandardMaterial({ color: 0x0c0c0c, roughness: 0.6 }),
  concrete: new THREE.MeshStandardMaterial({ map: plainTex(5, '#77706a'), roughness: 0.95 }),
};

const world = new THREE.Group(); scene.add(world);
function box(w, h, d, mat, x, y, z, parent = world, cast = true) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); m.castShadow = cast; m.receiveShadow = true; parent.add(m); return m;
}

// ---------- street ----------
const ROAD_W = 6.0, SIDEWALK = 1.1, HALF = ROAD_W / 2 + SIDEWALK; // building face at x = ±HALF
{
  const a = asphalt();
  const road = new THREE.Mesh(new THREE.PlaneGeometry(ROAD_W, 110), new THREE.MeshStandardMaterial({ map: a.map, roughnessMap: a.rough, roughness: 1, metalness: 0.05, envMapIntensity: 1.6 }));
  road.rotation.x = -Math.PI / 2; road.position.set(0, 0, -40); road.receiveShadow = true; world.add(road);
  for (const s of [-1, 1]) {
    const sw = box(SIDEWALK, 0.16, 110, M.concrete, s * (ROAD_W / 2 + SIDEWALK / 2), 0.08, -40, world, false);
    box(0.12, 0.17, 110, M.plaster(11, '#8c8478'), s * (ROAD_W / 2 + 0.06), 0.085, -40, world, false);
  }
}

// ---------- buildings ----------
const BASES = ['#b79a6e', '#a88a64', '#c2a57a', '#9c8a72', '#b08a62', '#8f7a66', '#c0a080'];
const rB = rng(2024);
const balconyRail = (() => { const [c, g] = canvas(256, 64); g.clearRect(0, 0, 256, 64); g.fillStyle = '#222'; g.fillRect(0, 0, 256, 6); g.fillRect(0, 58, 256, 6); for (let x = 4; x < 256; x += 14) g.fillRect(x, 0, 3, 64); const t = tex(c); return t; })();
const railMat = new THREE.MeshStandardMaterial({ map: balconyRail, alphaTest: 0.5, side: THREE.DoubleSide, roughness: 0.6, metalness: 0.5 });
const acTex = (() => { const [c, g] = canvas(128, 96); g.fillStyle = '#c8c4b8'; g.fillRect(0, 0, 128, 96); g.fillStyle = '#555'; for (let y = 10; y < 86; y += 6) g.fillRect(10, y, 108, 3); stains(g, 128, 96, rng(3), 6); return tex(c); })();
const acMat = new THREE.MeshStandardMaterial({ map: acTex, roughness: 0.7 });
const dishMat = new THREE.MeshStandardMaterial({ color: 0xbdb8ae, roughness: 0.5, metalness: 0.3, side: THREE.DoubleSide });
const clothCols = [0xa83232, 0x2f5fa0, 0xe0d8c0, 0x3c7a46, 0xd0a030, 0x7a3c8a, 0xf0f0f0];
const laundry = [];
const dishGeo = new THREE.SphereGeometry(0.4, 16, 8, 0, Math.PI * 2, 0, 0.9);

function building(side, z0, len, floors, seed, opts = {}) {
  const FH = 3.0, CWm = 2.2;
  const cols = Math.max(2, Math.round(len / CWm));
  const H = floors * FH, D = 10;
  const og0 = opts.openGround ? FH : 0;
  const fac = facade(seed, cols, opts.openGround ? floors - 1 : floors, BASES[seed % BASES.length], opts);
  const faceMat = new THREE.MeshStandardMaterial({ map: fac.map, emissiveMap: fac.emissive, emissive: 0xffffff, emissiveIntensity: 1.6, roughness: 0.92 });
  const other = M.plaster(seed + 1, BASES[seed % BASES.length]);
  const mats = [other, other, other, other, other, other];
  mats[side < 0 ? 0 : 1] = faceMat;
  const x = side * (HALF + D / 2);
  const b = new THREE.Mesh(new THREE.BoxGeometry(D, H - og0, len), mats);
  b.position.set(x, og0 + (H - og0) / 2, z0 - len / 2); b.castShadow = true; b.receiveShadow = true; world.add(b);
  // fix uv orientation on the street face: BoxGeometry px/nx faces map u along z
  const r = rng(seed * 7 + 1);
  const fx = side * HALF; // facade plane x
  const out = -side;       // direction toward the street
  for (let f = 1; f < floors; f++) {
    for (let k = 0; k < cols; k++) {
      // texture col k maps along z; px face u runs +z->-z? compute center z for col k
      const u = (k + 0.5) / cols;
      const zc = side < 0 ? (z0 - len) + u * len : z0 - u * len;
      const yc = f * FH;
      const roll = r();
      if (roll < 0.22) { // balcony
        const bw = 1.7, bd = 0.85;
        box(bd, 0.14, bw, M.concrete, fx + out * bd / 2, yc + 0.07, zc);
        const rail = new THREE.Mesh(new THREE.PlaneGeometry(bw, 0.95), railMat);
        rail.position.set(fx + out * bd, yc + 0.6, zc); rail.rotation.y = Math.PI / 2; world.add(rail);
        for (const s of [-1, 1]) { const sr = new THREE.Mesh(new THREE.PlaneGeometry(bd, 0.95), railMat); sr.position.set(fx + out * bd / 2, yc + 0.6, zc + s * bw / 2); world.add(sr); }
        if (r() < 0.6) { // laundry line on balcony
          for (let i = 0; i < 4; i++) {
            const cl = new THREE.Mesh(new THREE.PlaneGeometry(0.28 + r() * 0.2, 0.35 + r() * 0.3), new THREE.MeshStandardMaterial({ color: clothCols[(r() * clothCols.length) | 0], roughness: 0.9, side: THREE.DoubleSide }));
            cl.position.set(fx + out * (bd - 0.05), yc + 1.25, zc - 0.6 + i * 0.4); cl.rotation.y = Math.PI / 2; cl.castShadow = true;
            world.add(cl); laundry.push([cl, r() * 6]);
          }
        }
        if (r() < 0.3) { const d = new THREE.Mesh(dishGeo, dishMat); d.position.set(fx + out * 0.6, yc + 1.3, zc + 0.6); d.rotation.set(0, 0, out * 1.2); world.add(d); }
      } else if (roll < 0.45) { // AC unit under window
        box(0.5, 0.42, 0.72, acMat, fx + out * 0.25, yc + 0.55, zc + (r() - .5) * 0.6);
      }
    }
  }
  // roof clutter: water tanks, dishes, parapet
  box(D, 0.5, len, other, x, H + 0.25, z0 - len / 2);
  for (let i = 0; i < 2 + r() * 3; i++) {
    const d = new THREE.Mesh(dishGeo, dishMat); d.position.set(fx + side * (0.6 + r() * 3), H + 0.8, z0 - r() * len); d.rotation.set(0.3, r() * 3, out * 1.1); world.add(d);
  }
  return { H, fx, cols, len, z0 };
}

const LEFT = [], RIGHT = [];
{
  let z = 14; let s = 1;
  while (z > -75) { const len = 7 + rB() * 6; const f = 4 + ((rB() * 4) | 0); LEFT.push(building(-1, z, len, f, s++)); z -= len; }
  z = 14;
  // workshop building sits at z in [-3, 5] on the right
  RIGHT.push(building(1, z, 9, 5, 101)); z -= 9;           // 14..5
  RIGHT.push(building(1, z, 8, 4, 102, { openGround: true })); z -= 8; // 5..-3  (workshop)
  while (z > -75) { const len = 7 + rB() * 6; const f = 4 + ((rB() * 4) | 0); RIGHT.push(building(1, z, len, f, 200 + s++)); z -= len; }
}

// ---------- workshop opening (right side, z 5..-3) ----------
const shopGroup = new THREE.Group(); world.add(shopGroup);
{
  const fx = HALF;
  // interior cavity: dark box behind facade with lit back wall
  const [c, g] = canvas(512, 256);
  g.fillStyle = '#3a3a34'; g.fillRect(0, 0, 512, 256);
  const r = rng(55);
  // shelves with junk
  for (let s = 0; s < 3; s++) {
    g.fillStyle = '#4a3624'; g.fillRect(20, 60 + s * 60, 472, 6);
    for (let i = 0; i < 26; i++) { g.fillStyle = ['#4a2a20', '#2a3440', '#5a5a54', '#6a5530', '#222', '#3a4030'][(r() * 6) | 0]; const w = 8 + r() * 24, h = 10 + r() * 40; g.fillRect(24 + r() * 460, 60 + s * 60 - h, w, h); }
  }
  g.fillStyle = 'rgba(0,0,0,0.35)'; g.fillRect(0, 230, 512, 26);
  // pegboard tools
  g.strokeStyle = '#999'; g.lineWidth = 3; for (let i = 0; i < 8; i++) { g.beginPath(); g.moveTo(330 + i * 18, 10); g.lineTo(330 + i * 18, 40 + r() * 10); g.stroke(); }
  const back = new THREE.Mesh(new THREE.PlaneGeometry(6.6, 2.8), new THREE.MeshStandardMaterial({ map: tex(c), roughness: 0.9, emissive: 0x9fb8a0, emissiveMap: tex(c), emissiveIntensity: 0.12 }));
  back.position.set(fx + 3.0, 1.4, 1); back.rotation.y = -Math.PI / 2; shopGroup.add(back);
  // side walls / ceiling of the cavity
  box(3.0, 0.1, 7.0, M.dark, fx + 1.5, 2.85, 1, shopGroup);
  box(3.0, 2.9, 0.1, M.plaster(77, '#55504a'), fx + 1.5, 1.45, 4.5, shopGroup);
  box(3.0, 2.9, 0.1, M.plaster(78, '#55504a'), fx + 1.5, 1.45, -2.5, shopGroup);
  const pier = M.plaster(79, '#a88a64');
  box(0.6, 3.0, 0.55, pier, fx + 0.3, 1.5, 4.73, shopGroup); box(0.6, 3.0, 0.55, pier, fx + 0.3, 1.5, -2.73, shopGroup);
  box(10, 3.0, 8, pier, fx + 3.1 + 5, 1.5, 1, shopGroup);
  const flo = new THREE.Mesh(new THREE.PlaneGeometry(3, 7), M.concrete); flo.rotation.x = -Math.PI / 2; flo.position.set(fx + 1.5, 0.01, 1); flo.receiveShadow = true; shopGroup.add(flo);
  // fluorescent tube + its light
  const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 1.4, 8), new THREE.MeshStandardMaterial({ emissive: 0xd8ffe8, emissiveIntensity: 6, color: 0xffffff }));
  tube.rotation.x = Math.PI / 2; tube.position.set(fx + 1.2, 2.7, 1); shopGroup.add(tube);
  const fl = new THREE.PointLight(0xc8ffe0, 9, 9, 1.6); fl.position.set(fx + 1.0, 2.5, 1); shopGroup.add(fl);
  // half-raised rolling shutter
  const [cs, gs] = canvas(256, 128); gs.fillStyle = '#6e706c'; gs.fillRect(0, 0, 256, 128);
  for (let y = 0; y < 128; y += 5) { gs.fillStyle = 'rgba(0,0,0,0.4)'; gs.fillRect(0, y, 256, 1.5); gs.fillStyle = 'rgba(255,255,255,0.12)'; gs.fillRect(0, y + 2, 256, 1); }
  stains(gs, 256, 128, rng(8), 12, '90,45,15');
  const sh = new THREE.Mesh(new THREE.PlaneGeometry(6.8, 0.9), new THREE.MeshStandardMaterial({ map: tex(cs), roughness: 0.6, metalness: 0.5, side: THREE.DoubleSide }));
  sh.position.set(fx + 0.05, 2.5, 1); sh.rotation.y = -Math.PI / 2; shopGroup.add(sh);
  // sign
  const [cg, gg] = canvas(1024, 256);
  gg.fillStyle = '#e8d7a8'; gg.fillRect(0, 0, 1024, 256);
  stains(gg, 1024, 256, rng(9), 30);
  gg.fillStyle = '#9a1e14'; gg.font = '150px Lalezar'; gg.textAlign = 'center'; gg.direction = 'rtl';
  gg.fillText('ورشة إبراهيم', 512, 150);
  gg.fillStyle = '#1e3a6a'; gg.font = '64px Lalezar'; gg.fillText('للاختراعات والتصليح', 512, 230);
  window.__signCanvas = [cg, gg];
  const signTex = tex(cg);
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 1.05), new THREE.MeshStandardMaterial({ map: signTex, roughness: 0.8, emissive: 0xffffff, emissiveMap: signTex, emissiveIntensity: 0.12 }));
  sign.position.set(fx - 0.06, 3.5, 1); sign.rotation.y = -Math.PI / 2; world.add(sign);
  window.__signTex = signTex;
  // cut the facade: dark overlay hides the plaster where the opening is (facade box is solid) -> move workshop face back instead
}

// ---------- overhead wires ----------
{
  const r = rng(404);
  for (let i = 0; i < 26; i++) {
    const z1 = 8 - r() * 70, z2 = z1 + (r() - .5) * 6, y1 = 5 + r() * 6, y2 = 5 + r() * 6, sag = 0.4 + r() * 1.2;
    const a = new THREE.Vector3(-HALF + 0.05, y1, z1), b = new THREE.Vector3(HALF - 0.05, y2, z2);
    const mid = a.clone().lerp(b, 0.5); mid.y -= sag;
    const curve = new THREE.QuadraticBezierCurve3(a, mid, b);
    const m = new THREE.Mesh(new THREE.TubeGeometry(curve, 20, 0.012 + r() * 0.01, 4), M.wire); world.add(m);
  }
  // wires along facades
  for (const s of [-1, 1]) for (let i = 0; i < 4; i++) {
    const y = 3.4 + i * 0.25 + r() * 0.3; const pts = [];
    for (let z = 12; z > -70; z -= 4) pts.push(new THREE.Vector3(s * (HALF - 0.08), y - Math.sin((z % 8) / 8 * Math.PI) * 0.25, z));
    world.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 160, 0.014, 4), M.wire));
  }
}

// ---------- minaret silhouette far away ----------
{
  const g = new THREE.Group(); const mm = new THREE.MeshStandardMaterial({ color: 0x4a3c30, roughness: 1 });
  const add = (geo, y) => { const m = new THREE.Mesh(geo, mm); m.position.y = y; g.add(m); };
  add(new THREE.CylinderGeometry(1.4, 1.6, 18, 8), 9); add(new THREE.CylinderGeometry(2.2, 1.4, 1, 8), 18.5);
  add(new THREE.CylinderGeometry(1.0, 1.2, 9, 8), 23.5); add(new THREE.CylinderGeometry(1.7, 1.0, 0.8, 8), 28.4);
  add(new THREE.CylinderGeometry(0.7, 0.8, 5, 8), 31.2); add(new THREE.SphereGeometry(0.8, 8, 6), 34); add(new THREE.ConeGeometry(0.15, 2.4, 6), 35.6);
  g.position.set(3, 0, -95); world.add(g);
}

// ---------- street lamps ----------
const lamps = [];
function lamp(side, z, shadow) {
  const x = side * (HALF - 0.05), y = 5.2;
  const arm = box(1.3, 0.06, 0.06, M.metal, x - side * 0.65, y, z, world, false);
  const head = box(0.45, 0.14, 0.26, M.dark, x - side * 1.25, y - 0.05, z, world, false);
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.1, 12, 8), new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffa040, emissiveIntensity: 14 }));
  bulb.position.set(x - side * 1.25, y - 0.14, z); world.add(bulb);
  const sp = new THREE.SpotLight(0xff9a3c, 70, 22, 0.95, 0.65, 1.7);
  sp.position.set(x - side * 1.25, y - 0.2, z); sp.target.position.set(x - side * 2.6, 0, z + 0.5);
  sp.castShadow = shadow; if (shadow) { sp.shadow.mapSize.set(1024, 1024); sp.shadow.bias = -0.0004; sp.shadow.radius = 4; }
  world.add(sp); world.add(sp.target); lamps.push(sp);
}
lamp(-1, 3.0, true); lamp(1, -7.5, true); lamp(-1, -19, false); lamp(1, -31, false); lamp(-1, -44, false);

// ---------- lighting ----------
scene.add(new THREE.HemisphereLight(0x8090a8, 0x3a2e22, 0.9));
const dusk = new THREE.DirectionalLight(0xffb27a, 1.2); dusk.position.set(-20, 30, -60); dusk.target.position.set(0, 0, 0);
dusk.castShadow = true; dusk.shadow.mapSize.set(2048, 2048); Object.assign(dusk.shadow.camera, { left: -14, right: 14, top: 14, bottom: -14, near: 1, far: 120 }); dusk.shadow.bias = -0.0005;
scene.add(dusk); scene.add(dusk.target);
const skyTex = sky(); scene.background = skyTex;

// ---------- vehicles & props ----------
function wheel(r, w, parent, x, y, z) {
  const g = new THREE.Group();
  const t = new THREE.Mesh(new THREE.CylinderGeometry(r, r, w, 18), new THREE.MeshStandardMaterial({ color: 0x151515, roughness: 0.9 })); t.rotation.z = Math.PI / 2; g.add(t);
  const h = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.55, r * 0.55, w + 0.01, 14), M.metal); h.rotation.z = Math.PI / 2; g.add(h);
  g.position.set(x, y, z); g.traverse(o => { o.castShadow = true; }); parent.add(g); return g;
}
function taperedBox(w, h, d, topScaleX, topScaleZ, mat) {
  const geo = new THREE.BoxGeometry(w, h, d); const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) if (p.getY(i) > 0) { p.setX(i, p.getX(i) * topScaleX); p.setZ(i, p.getZ(i) * topScaleZ); }
  geo.computeVertexNormals(); return new THREE.Mesh(geo, mat);
}
// old boxy sedan (left side)
{
  const car = new THREE.Group(); const paint = new THREE.MeshStandardMaterial({ map: plainTex(61, '#b8ac8a'), roughness: 0.45, metalness: 0.35, envMapIntensity: 1.2 });
  const glass = new THREE.MeshStandardMaterial({ color: 0x101418, roughness: 0.05, metalness: 0.9 });
  const chrome = new THREE.MeshStandardMaterial({ color: 0xcccccc, roughness: 0.2, metalness: 1 });
  const body = box(1.62, 0.62, 3.9, paint, 0, 0.62, 0, car);
  const cab = taperedBox(1.5, 0.52, 2.0, 0.86, 0.78, glass); cab.position.set(0, 1.19, -0.15); cab.castShadow = true; car.add(cab);
  const roof = taperedBox(1.32, 0.05, 1.6, 1, 1, paint); roof.position.set(0, 1.46, -0.15); car.add(roof);
  for (const s of [-1, 1]) { const pl = box(0.06, 0.5, 0.06, paint, s * 0.7, 1.18, 0.62, car); pl.rotation.x = 0.5; const pr = box(0.06, 0.5, 0.06, paint, s * 0.7, 1.18, -0.95, car); pr.rotation.x = -0.45; }
  box(1.7, 0.12, 0.12, chrome, 0, 0.42, 1.98, car); box(1.7, 0.12, 0.12, chrome, 0, 0.42, -1.98, car);
  for (const s of [-1, 1]) { const hl = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.05, 12), chrome); hl.rotation.x = Math.PI / 2; hl.position.set(s * 0.55, 0.72, 1.96); car.add(hl); }
  for (const [x, z] of [[-0.78, 1.25], [0.78, 1.25], [-0.78, -1.25], [0.78, -1.25]]) wheel(0.32, 0.2, car, x, 0.32, z);
  // dust layer
  car.position.set(-ROAD_W / 2 + 1.05, 0, -6.5); car.rotation.y = 0.04; world.add(car);
}
// tuk-tuk (right side, further back)
{
  const tk = new THREE.Group(); const red = new THREE.MeshStandardMaterial({ map: plainTex(71, '#8e1c16'), roughness: 0.5, metalness: 0.2 });
  const black = new THREE.MeshStandardMaterial({ color: 0x141414, roughness: 0.9 });
  const front = taperedBox(1.1, 1.0, 0.6, 0.8, 0.6, red); front.position.set(0, 0.85, 1.0); front.castShadow = true; tk.add(front);
  box(1.25, 0.45, 1.7, red, 0, 0.55, -0.2, tk);
  const roof = box(1.3, 0.08, 2.1, black, 0, 1.85, -0.05, tk);
  for (const [x, z] of [[-0.6, 0.7], [0.6, 0.7], [-0.6, -0.95], [0.6, -0.95]]) box(0.04, 1.1, 0.04, black, x, 1.3, z, tk);
  box(1.2, 0.5, 0.06, black, 0, 1.0, -1.0, tk);
  const ws = new THREE.Mesh(new THREE.PlaneGeometry(0.95, 0.6), new THREE.MeshStandardMaterial({ color: 0x223, roughness: 0.05, metalness: 0.8, transparent: true, opacity: 0.6 })); ws.position.set(0, 1.55, 0.75); ws.rotation.x = -0.2; tk.add(ws);
  wheel(0.24, 0.14, tk, 0, 0.24, 1.15); wheel(0.24, 0.14, tk, -0.62, 0.24, -0.6); wheel(0.24, 0.14, tk, 0.62, 0.24, -0.6);
  tk.position.set(ROAD_W / 2 - 0.9, 0, -14); tk.rotation.y = 0.12; world.add(tk);
}
// clutter: trash bags, crates
{
  const r = rng(12); const bagM = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.25, metalness: 0.1 });
  for (let i = 0; i < 12; i++) {
    const s = r() < .5 ? -1 : 1; const z = 6 - r() * 50; if (s > 0 && z < 5.5 && z > -3.5) continue;
    const b = new THREE.Mesh(new THREE.SphereGeometry(0.28 + r() * 0.12, 10, 8), bagM); b.scale.y = 0.8; b.position.set(s * (HALF - 0.4 - r() * 0.3), 0.36, z); b.castShadow = true; world.add(b);
  }
}

// ---------- the engine on a crate (Jet Dishwasher heritage) ----------
const ENG = new THREE.Vector3(HALF - 0.75, 0, 3.1);
const exhaustTip = new THREE.Vector3();
{
  const g = new THREE.Group();
  const [c, gg] = canvas(256, 256); gg.fillStyle = '#9a7a52'; gg.fillRect(0, 0, 256, 256);
  for (let y = 0; y < 256; y += 64) { gg.fillStyle = 'rgba(0,0,0,0.5)'; gg.fillRect(0, y, 256, 6); }
  speckle(gg, 256, 256, rng(4), 3000, ['#3a2a18', '#c8a878'], 0.3, 4); stains(gg, 256, 256, rng(5), 10);
  const crate = box(0.8, 0.55, 0.6, new THREE.MeshStandardMaterial({ map: tex(c), roughness: 0.9 }), 0, 0.275, 0, g);
  const red = new THREE.MeshStandardMaterial({ map: plainTex(81, '#a0221a'), roughness: 0.55, metalness: 0.4 });
  const blk = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.17, 0.36, 16), red); blk.position.set(0, 0.75, 0); blk.castShadow = true; g.add(blk);
  for (let i = 0; i < 7; i++) { const f = new THREE.Mesh(new THREE.CylinderGeometry(0.23, 0.23, 0.015, 18), M.metal); f.position.set(0, 0.62 + i * 0.045, 0); f.castShadow = true; g.add(f); }
  const hd = box(0.26, 0.1, 0.26, M.metal, 0, 0.98, 0, g);
  const crank = box(0.5, 0.3, 0.36, red, 0.05, 0.72, 0, g); crank.scale.set(0.9, 0.9, 0.9);
  const pipeCurve = new THREE.CatmullRomCurve3([new THREE.Vector3(-0.12, 0.75, 0.1), new THREE.Vector3(-0.32, 0.72, 0.18), new THREE.Vector3(-0.42, 0.9, 0.2), new THREE.Vector3(-0.44, 1.25, 0.18)]);
  g.add(new THREE.Mesh(new THREE.TubeGeometry(pipeCurve, 20, 0.035, 8), M.rust));
  const tape = box(0.3, 0.06, 0.62, new THREE.MeshStandardMaterial({ color: 0xa8a8a8, roughness: 0.35, metalness: 0.6 }), 0, 0.58, 0, g);
  const btn = new THREE.Mesh(new THREE.SphereGeometry(0.06, 12, 8, 0, 6.3, 0, 1.6), new THREE.MeshStandardMaterial({ color: 0xff1a10, emissive: 0x400000, roughness: 0.3 })); btn.position.set(0.22, 0.56, 0.2); g.add(btn);
  g.position.copy(ENG); g.rotation.y = -0.5; world.add(g);
  g.updateMatrixWorld(true);
  exhaustTip.set(-0.44, 1.27, 0.18).applyMatrix4(g.matrixWorld);
  window.__engine = g;
}

// ---------- smoke & sparks ----------
const smokeTex = (() => { const [c, g] = canvas(128, 128); const gr = g.createRadialGradient(64, 64, 4, 64, 64, 62); gr.addColorStop(0, 'rgba(255,255,255,0.9)'); gr.addColorStop(0.5, 'rgba(255,255,255,0.35)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); g.globalCompositeOperation = 'source-atop'; const r = rng(6); for (let i = 0; i < 200; i++) { g.fillStyle = `rgba(0,0,0,${r() * 0.08})`; g.beginPath(); g.arc(64 + (r() - .5) * 80, 64 + (r() - .5) * 80, 2 + r() * 8, 0, 7); g.fill(); } return new THREE.CanvasTexture(c); })();
const puffs = [];
const PR = rng(321);
for (let i = 0; i < 60; i++) {
  const big = i >= 22;
  const m = new THREE.Sprite(new THREE.SpriteMaterial({ map: smokeTex, color: big ? 0x1e1c1a : 0x6a6662, transparent: true, depthWrite: false, opacity: 0 }));
  m.userData = { t0: big ? 7.55 + PR() * 0.35 : PR() * 7.6, big, vx: (PR() - .5) * (big ? 1.4 : 0.25), vy: big ? 0.9 + PR() * 1.4 : 0.35 + PR() * 0.25, vz: (PR() - .3) * (big ? 1.4 : 0.2), s0: big ? 0.25 : 0.08, life: big ? 2.5 + PR() * 1.5 : 1.6 + PR(), rot: PR() * 6 };
  world.add(m); puffs.push(m);
}
const flash = new THREE.PointLight(0xff8a30, 0, 8, 1.5); flash.position.copy(exhaustTip); world.add(flash);
const sparkMat = new THREE.MeshBasicMaterial({ color: 0xffd080 });
const sparks = [];
for (let i = 0; i < 24; i++) { const s = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.012, 0.09), sparkMat); s.userData = { v: new THREE.Vector3((PR() - .5) * 4, 1 + PR() * 3, (PR() - .3) * 4), d: 0.25 + PR() * 0.35 }; s.visible = false; world.add(s); sparks.push(s); }

// ---------- environment map for reflections ----------
{
  const pm = new THREE.PMREMGenerator(renderer);
  world.position.set(0, -1.6, -2); // capture from 1.6 m above the street, a bit up-street
  scene.updateMatrixWorld(true);
  const rt = pm.fromScene(scene, 0.02, 0.1, 200);
  world.position.set(0, 0, 0);
  scene.environment = rt.texture; scene.environmentIntensity = 0.55;
}

// ---------- character ----------
const loader = new GLTFLoader();
const [avG, xbG] = await Promise.all([loader.loadAsync('models/readyplayer.me.glb'), loader.loadAsync('models/Xbot.glb')]);
await document.fonts.load('150px Lalezar'); await document.fonts.load('100px Anton');
// redraw sign with font now loaded
{ const [cg, gg] = window.__signCanvas; gg.fillStyle = '#e8d7a8'; gg.fillRect(0, 0, 1024, 256); stains(gg, 1024, 256, rng(9), 30); gg.fillStyle = '#9a1e14'; gg.font = '150px Lalezar'; gg.textAlign = 'center'; gg.direction = 'rtl'; gg.fillText('ورشة إبراهيم', 512, 150); gg.fillStyle = '#1e3a6a'; gg.font = '64px Lalezar'; gg.fillText('للاختراعات والتصليح', 512, 230); window.__signTex.needsUpdate = true; }

const ib = new THREE.Group(); world.add(ib);
const av = avG.scene; ib.add(av);
const meshes = {};
av.traverse(o => { if (o.isMesh) { meshes[o.name] = o; o.castShadow = true; o.receiveShadow = true; o.frustumCulled = false; } });

// --- wardrobe re-texture: pixel classes on the original textures ---
function remap(material, fn, withAlpha = false) {
  const img = material.map.image; const [c, g] = canvas(img.width, img.height); g.drawImage(img, 0, 0);
  const d = g.getImageData(0, 0, c.width, c.height); const p = d.data;
  let ca, ga, ad; if (withAlpha) { [ca, ga] = canvas(c.width, c.height); ad = ga.createImageData(c.width, c.height); }
  const r = rng(1);
  for (let i = 0; i < p.length; i += 4) {
    const x = (i / 4) % c.width, y = ((i / 4) / c.width) | 0;
    const res = fn(p[i], p[i + 1], p[i + 2], x / c.width, y / c.height, r);
    p[i] = res[0]; p[i + 1] = res[1]; p[i + 2] = res[2];
    if (withAlpha) { const a = res[3] ?? 255; ad.data[i] = ad.data[i + 1] = ad.data[i + 2] = a; ad.data[i + 3] = 255; }
  }
  g.putImageData(d, 0, 0);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.flipY = material.map.flipY; material.map = t;
  if (withAlpha) { ga.putImageData(ad, 0, 0); const at = new THREE.CanvasTexture(ca); at.flipY = material.map.flipY; material.alphaMap = at; material.alphaTest = 0.5; }
  material.needsUpdate = true;
}
function hsl(r, g, b) { r /= 255; g /= 255; b /= 255; const mx = Math.max(r, g, b), mn = Math.min(r, g, b); const l = (mx + mn) / 2; let h = 0, s = 0; if (mx !== mn) { const d = mx - mn; s = l > .5 ? d / (2 - mx - mn) : d / (mx + mn); h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h /= 6; } return [h * 360, s, l]; }
const MODE = Q.get('wardrobe') || 'ibrahim';
if (MODE === 'ibrahim') {
  // Top: tan jacket -> faded blue-grey work jacket; purple vest + white shirt -> dirty ribbed undershirt; rose & bow tie -> hidden
  remap(meshes.Wolf3D_Outfit_Top.material, (R, G, B, u, v, r) => {
    const [h, s, l] = hsl(R, G, B);
    const isRose = (h > 320 || h < 15) && s > 0.45 && R > 150;
    const isLeaf = h > 80 && h < 170 && s > 0.3;
    if (isRose || isLeaf) return [0, 0, 0, 0];
    const isPurple = h > 255 && h < 335 && s > 0.08;
    const isWhite = l > 0.68 && s < 0.35;
    const n = (r() - .5) * 18;
    if (isPurple || isWhite) { const rib = (Math.floor(u * 900) % 3 === 0) ? -14 : 0; const dirt = Math.sin(u * 40) * Math.sin(v * 30) > 0.6 ? -40 : 0; const L = 215 + n + rib + dirt + (l - 0.6) * 60; return [L, L - 6, L - 20, 255]; }
    if (h > 15 && h < 55 && l < 0.35 && s > 0.3) return [R * 0.5, G * 0.5, B * 0.5, 255]; // brown buttons/belt darker
    // jacket: luminance-preserving recolor to slate blue-grey
    const L = l * 255 * 0.85; return [L * 0.78 + n, L * 0.86 + n, L * 0.98 + n, 255];
  }, true);
  // Pants: tan -> blue-grey striped pyjama
  remap(meshes.Wolf3D_Outfit_Bottom.material, (R, G, B, u, v, r) => {
    const [h, s, l] = hsl(R, G, B); const n = (r() - .5) * 14;
    if (l < 0.22) return [R, G, B];
    const stripe = (Math.floor(u * 160) % 5 === 0) ? 1 : 0;
    const L = 70 + l * 120 + n; return stripe ? [L * 1.25, L * 1.3, L * 1.45] : [L * 0.66, L * 0.74, L * 0.88];
  });
  // Hat -> hidden (keep hair); Ibrahim is balding on top
  remap(meshes.Wolf3D_Headwear.material, (R, G, B) => { const [h, s, l] = hsl(R, G, B); if (h > 60 && h < 170 && s > 0.12) return [0, 0, 0, 0]; return [R * 0.55, G * 0.55, B * 0.55, 255]; }, true);
  // Mustache / beard darker, thicker look
  remap(meshes.Wolf3D_Beard.material, (R, G, B) => [R * 0.25, G * 0.22, B * 0.2]);
  // skin: a bit more tanned
  for (const k of ['Wolf3D_Head', 'Wolf3D_Body']) remap(meshes[k].material, (R, G, B) => [R * 0.86, G * 0.74, B * 0.62]);
}

// --- geometry probe ---
{
  av.updateMatrixWorld(true);
  const hb = av.getObjectByName('Head').getWorldPosition(new THREE.Vector3());
  const ht = av.getObjectByName('HeadTop_End').getWorldPosition(new THREE.Vector3());
  const nk = av.getObjectByName('Neck').getWorldPosition(new THREE.Vector3());
  const geo = { head: hb.toArray().map(v=>+v.toFixed(3)), top: ht.toArray().map(v=>+v.toFixed(3)), neck: nk.toArray().map(v=>+v.toFixed(3)) };
  for (const k of ['Wolf3D_Headwear','Wolf3D_Outfit_Top','Wolf3D_Head']) {
    const m = meshes[k]; const p = m.geometry.attributes.position; const v = new THREE.Vector3(); const ys=[]; let mn=[9,9,9], mx=[-9,-9,-9];
    for (let i=0;i<p.count;i++){ v.fromBufferAttribute(p,i).applyMatrix4(m.matrixWorld); const a=v.toArray(); for(let j=0;j<3;j++){mn[j]=Math.min(mn[j],a[j]);mx[j]=Math.max(mx[j],a[j]);} }
    geo[k] = { n: p.count, mn: mn.map(x=>+x.toFixed(3)), mx: mx.map(x=>+x.toFixed(3)) };
  }
  window.__geo = geo;
}
// --- geometric trims: drop the hat (keep side hair: Ibrahim is balding) and the bow tie ---
function trim(mesh, kill) {
  const g = mesh.geometry; const p = g.attributes.position; const idx = g.index.array; const keep = [];
  const a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3();
  for (let i = 0; i < idx.length; i += 3) {
    a.fromBufferAttribute(p, idx[i]).applyMatrix4(mesh.matrixWorld); b.fromBufferAttribute(p, idx[i + 1]).applyMatrix4(mesh.matrixWorld); c.fromBufferAttribute(p, idx[i + 2]).applyMatrix4(mesh.matrixWorld);
    if (!kill(a, b, c)) keep.push(idx[i], idx[i + 1], idx[i + 2]);
  }
  g.setIndex(keep);
}
const TRIM = Q.get('trim') ? Q.get('trim').split(',').map(Number) : [0.112, 1.775, 0.06, 1.45, 1.53, 0.1];
if (MODE === 'ibrahim') {
  const rad = v => Math.hypot(v.x, v.z - 0.02);
  trim(meshes.Wolf3D_Headwear, (a, b, c) => [a, b, c].some(v => rad(v) > TRIM[0] || v.y > TRIM[1]));
  trim(meshes.Wolf3D_Outfit_Top, (a, b, c) => { const m = a.clone().add(b).add(c).multiplyScalar(1 / 3); return m.y > TRIM[3] && m.y < TRIM[4] && Math.abs(m.x) < TRIM[2] && m.z > TRIM[5]; });
}
// --- bones ---
const tb = {}; av.traverse(o => { if (o.isBone) tb[o.name] = o; });
const sb = {}; xbG.scene.traverse(o => { if (o.isBone) sb[o.name.replace('mixamorig', '')] = o; });
const ORDER = []; (function walk(b) { if (b.isBone && sb[b.name]) ORDER.push(b.name); b.children.forEach(walk); })(av);
const xbMixer = new THREE.AnimationMixer(xbG.scene);
const clips = Object.fromEntries(xbG.animations.map(a => [a.name, a]));
const act = {}; for (const n of ['idle', 'walk', 'agree', 'headShake']) { act[n] = xbMixer.clipAction(clips[n]); act[n].play(); act[n].setEffectiveWeight(0); }
xbG.scene.updateMatrixWorld(true); av.updateMatrixWorld(true);
// align the target's rest pose (A-pose) to the source rest (T-pose), bone by bone along each bone's direction
{
  const pref = { Hips: null, Spine2: 'Neck', LeftHand: 'LeftHandMiddle1', RightHand: 'RightHandMiddle1' };
  const wp = (o) => o.getWorldPosition(new THREE.Vector3());
  for (const n of ORDER) {
    if (!(n in pref) || pref[n]) {
      const b = tb[n]; let cn = pref[n];
      if (!cn) { const ch = b.children.find(c => c.isBone && sb[c.name]); if (!ch) continue; cn = ch.name; }
      if (!sb[cn] || !tb[cn]) continue;
      const ds = wp(sb[cn]).sub(wp(sb[n])).normalize();
      const dt = wp(tb[cn]).sub(wp(b)).normalize();
      const q = new THREE.Quaternion().setFromUnitVectors(dt, ds);
      const cw = b.getWorldQuaternion(new THREE.Quaternion());
      const nw = q.multiply(cw);
      const pw = b.parent.getWorldQuaternion(new THREE.Quaternion()).invert();
      b.quaternion.copy(pw.multiply(nw)); b.updateMatrixWorld(true);
    }
  }
}
const srcRest = {}, tgtRest = {}, tgtRestLocal = {};
for (const n of ORDER) { srcRest[n] = sb[n].getWorldQuaternion(new THREE.Quaternion()); tgtRest[n] = tb[n].getWorldQuaternion(new THREE.Quaternion()); tgtRestLocal[n] = tb[n].quaternion.clone(); }
const srcHipsRest = sb.Hips.getWorldPosition(new THREE.Vector3());
const tgtHipsRest = tb.Hips.getWorldPosition(new THREE.Vector3());
const hipRatio = tgtHipsRest.y / srcHipsRest.y;
const _q = new THREE.Quaternion(), _q2 = new THREE.Quaternion(), _v = new THREE.Vector3();
const yawQ = new THREE.Quaternion();
const extra = {}; // additive local rotations per bone (procedural acting)
function retarget() {
  xbG.scene.updateMatrixWorld(true);
  ib.updateMatrixWorld(true);
  yawQ.copy(ib.quaternion);
  for (const n of ORDER) {
    const b = tb[n];
    const sw = sb[n].getWorldQuaternion(_q);
    const delta = _q2.copy(sw).multiply(_q.copy(srcRest[n]).invert()); // world delta (char space)
    const tw = new THREE.Quaternion().copy(yawQ).multiply(delta).multiply(tgtRest[n]);
    const pw = b.parent.getWorldQuaternion(new THREE.Quaternion());
    b.quaternion.copy(pw.invert().multiply(tw));
    if (extra[n]) b.quaternion.multiply(extra[n]);
    b.updateMatrixWorld(true);
    if (n === 'Hips') {
      const sp = sb.Hips.getWorldPosition(_v).sub(srcHipsRest);
      const desired = tgtHipsRest.clone().add(new THREE.Vector3(sp.x * hipRatio, sp.y * hipRatio, 0));
      b.position.copy(b.parent.worldToLocal(ib.localToWorld(desired)));
      b.updateMatrixWorld(true);
    }
  }
}
function setPose(weights, times) {
  for (const n in act) { act[n].setEffectiveWeight(weights[n] || 0); act[n].time = times[n] || 0; }
  xbMixer.update(0);
  retarget();
}

// --- measure walk speed and footfalls (in-place clip) ---
const WALK_DUR = clips.walk.duration;
let WALK_SPEED = 1.3; const stepPhases = [];
{
  const N = 96; const fz = [], fy = [];
  for (let i = 0; i <= N; i++) {
    setPose({ walk: 1 }, { walk: i / N * WALK_DUR });
    const l = tb.LeftFoot.getWorldPosition(new THREE.Vector3()), r = tb.RightFoot.getWorldPosition(new THREE.Vector3());
    fz.push([l.z, r.z]); fy.push([l.y, r.y]);
  }
  let sum = 0, cnt = 0; let prev = fy[0][0] < fy[0][1] ? 0 : 1;
  for (let i = 1; i <= N; i++) {
    const p = fy[i][0] < fy[i][1] ? 0 : 1;
    if (p === prev) { sum += -(fz[i][p] - fz[i - 1][p]) / (WALK_DUR / N); cnt++; } else stepPhases.push(i / N);
    prev = p;
  }
  WALK_SPEED = clamp(sum / Math.max(cnt, 1), 0.6, 2.2);
}

// --- props on the character: goggles, pencil, wrench ---
setPose({ idle: 1 }, { idle: 0 });
const brass = new THREE.MeshStandardMaterial({ color: 0xb08a3a, roughness: 0.3, metalness: 1 });
const lensM = new THREE.MeshStandardMaterial({ color: 0x3a5a4a, roughness: 0.05, metalness: 0.6, transparent: true, opacity: 0.85 });
const strapM = new THREE.MeshStandardMaterial({ color: 0x2a1c12, roughness: 0.8 });
const headPos = tb.Head.getWorldPosition(new THREE.Vector3());
const GOG = Q.get('gog') ? Q.get('gog').split(',').map(Number) : [0.0, 0.142, 0.088, -0.15];
const goggles = new THREE.Group();
for (const s of [-1, 1]) {
  const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.034, 0.038, 0.035, 16), brass); cup.rotation.x = Math.PI / 2; cup.position.set(s * 0.042, 0, 0); goggles.add(cup);
  const lens = new THREE.Mesh(new THREE.CircleGeometry(0.03, 16), lensM); lens.position.set(s * 0.042, 0, 0.0185); goggles.add(lens);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.033, 0.006, 6, 16), brass); rim.position.set(s * 0.042, 0, 0.019); goggles.add(rim);
}
const bridge = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.02, 6), brass); bridge.rotation.z = Math.PI / 2; goggles.add(bridge);
const strap = new THREE.Mesh(new THREE.TorusGeometry(0.098, 0.009, 6, 32, Math.PI * 1.25), strapM); strap.rotation.set(0, 0, 0); strap.rotation.x = Math.PI / 2; strap.rotation.z = -Math.PI * 0.125 - Math.PI / 2 + Math.PI; strap.position.set(0, 0, -0.085); goggles.add(strap);
goggles.position.set(headPos.x + GOG[0], headPos.y + GOG[1], headPos.z + GOG[2]); goggles.rotation.x = -0.35 + GOG[3];
goggles.traverse(o => { if (o.isMesh) o.castShadow = true; });
ib.add(goggles); tb.Head.attach(goggles);
const pencil = new THREE.Group();
{ const b = new THREE.Mesh(new THREE.CylinderGeometry(0.0045, 0.0045, 0.12, 6), new THREE.MeshStandardMaterial({ color: 0xe8b818, roughness: 0.6 })); pencil.add(b); const tip = new THREE.Mesh(new THREE.ConeGeometry(0.0045, 0.018, 6), new THREE.MeshStandardMaterial({ color: 0xd8b890 })); tip.position.y = 0.069; pencil.add(tip); }
pencil.position.set(headPos.x - 0.088, headPos.y + 0.075, headPos.z - 0.01); pencil.rotation.set(1.35, 0.0, 0.25);
ib.add(pencil); tb.Head.attach(pencil);
const wrench = new THREE.Group();
{
  const steel = new THREE.MeshStandardMaterial({ color: 0x9a9a96, roughness: 0.35, metalness: 1 });
  const h = new THREE.Mesh(new THREE.BoxGeometry(0.022, 0.26, 0.012), steel); wrench.add(h);
  const jaw = new THREE.Mesh(new THREE.TorusGeometry(0.03, 0.011, 6, 12, Math.PI * 1.4), steel); jaw.position.y = 0.15; jaw.rotation.z = -0.4; wrench.add(jaw);
  const grip = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.1, 0.02), new THREE.MeshStandardMaterial({ color: 0x8a1a12, roughness: 0.7 })); grip.position.y = -0.08; wrench.add(grip);
  wrench.traverse(o => { if (o.isMesh) o.castShadow = true; });
}
{
  const hand = tb.RightHand.getWorldPosition(new THREE.Vector3());
  const WR = Q.get('wr') ? Q.get('wr').split(',').map(Number) : [0, -0.06, 0.02, 0, 0, 0];
  wrench.position.set(hand.x + WR[0], hand.y + WR[1], hand.z + WR[2]); wrench.rotation.set(WR[3], WR[4], WR[5]);
  ib.add(wrench); tb.RightHand.attach(wrench);
}

// ---------- post processing ----------
const composer = new EffectComposer(renderer);
composer.setSize(W, H);
composer.addPass(new RenderPass(scene, camera));
let gtao = null;
if (!NO_AO) { gtao = new GTAOPass(scene, camera, W, H); gtao.blendIntensity = 0.85; gtao.updateGtaoMaterial({ radius: 0.6, distanceExponent: 1.5, thickness: 1.5, scale: 1.0 }); const ov = gtao.overrideVisibility.bind(gtao); gtao.overrideVisibility = function () { ov(); scene.traverse(o => { if (o.isSprite) o.visible = false; }); }; composer.addPass(gtao); }
const bloom = new UnrealBloomPass(new THREE.Vector2(W, H), 0.75, 0.85, 0.72); composer.addPass(bloom);
composer.addPass(new OutputPass());
const Grade = {
  uniforms: { tDiffuse: { value: null }, uTime: { value: 0 }, uFreeze: { value: 0 }, uSeed: { value: 0 } },
  vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
  fragmentShader: `
    uniform sampler2D tDiffuse; uniform float uTime; uniform float uFreeze; uniform float uSeed; varying vec2 vUv;
    float hash(vec2 p){ return fract(sin(dot(p, vec2(12.9898,78.233)) + uSeed*7.13) * 43758.5453); }
    void main(){
      vec2 uv = vUv; vec2 cc = uv - 0.5;
      float ca = 0.0016 + 0.0024*dot(cc,cc)*4.0;
      vec3 col;
      col.r = texture2D(tDiffuse, uv + cc*ca*2.0).r;
      col.g = texture2D(tDiffuse, uv).g;
      col.b = texture2D(tDiffuse, uv - cc*ca*2.0).b;
      // soft halo (the hazy glow of that era)
      vec3 blur = vec3(0.0);
      for(int i=0;i<8;i++){ float a = float(i)*0.785; blur += texture2D(tDiffuse, uv + vec2(cos(a),sin(a))*0.006).rgb; }
      blur /= 8.0;
      col = max(col, mix(col, blur, 0.55));
      float lum = dot(col, vec3(0.299,0.587,0.114));
      // desaturate toward a dirty sepia
      vec3 sep = vec3(lum)*vec3(1.08,1.0,0.86);
      col = mix(sep, col, mix(0.58, 0.18, uFreeze));
      // split tone: olive-teal shadows, amber highlights
      vec3 sh = vec3(0.88,0.97,1.0), hi = vec3(1.07,0.99,0.84);
      col *= mix(sh, hi, smoothstep(0.08, 0.7, lum));
      col += vec3(0.018,0.02,0.014)*(1.0-lum); // lifted, smoggy blacks
      // contrast curve
      col = mix(col, col*col*(3.0-2.0*col), 0.45 + 0.3*uFreeze);
      // freeze-frame wash
      col = mix(col, vec3(dot(col,vec3(0.33)))*vec3(1.0,0.93,0.8), uFreeze*0.25);
      // vignette
      float v = smoothstep(0.95, 0.25, length(cc*vec2(1.1,1.0)));
      col *= mix(0.55, 1.0, v);
      // grain
      float n = hash(uv*vec2(1280.0,720.0) + uTime);
      col += (n-0.5)*0.055;
      gl_FragColor = vec4(clamp(col,0.0,1.0), 1.0);
    }`,
};
const gradePass = new ShaderPass(Grade); composer.addPass(gradePass);

// ---------- 2D overlay output ----------
const out = document.getElementById('out'); const og = out.getContext('2d');

// ---------- timeline ----------
const FREEZE = 8.6, T_STOP = 4.0, DECEL = 0.9;
// root distance travelled: speed * walkWeight integrated
function walkW(t) { return 1 - smooth(T_STOP - DECEL / 2, T_STOP + DECEL / 2, t); }
function distAt(t) { const N = 200; let d = 0; for (let i = 0; i < N; i++) { const tt = (i + 0.5) / N * t; d += walkW(tt) * WALK_SPEED * (t / N); } return d; }
const TOTAL = distAt(6);
const STOP = new THREE.Vector3(HALF - 1.85, 0, 2.1);
const START_Z = STOP.z - TOTAL;
// footfall times for the audio track
const steps = []; { const cycStart = 0; for (let c = 0; c < 12; c++) for (const ph of stepPhases) { const t = (c + ph) * WALK_DUR; if (t < T_STOP + 0.25) steps.push(+t.toFixed(3)); } }

function charState(t) {
  const tc = Math.min(t, FREEZE);
  const z = START_Z + distAt(tc);
  const ww = walkW(tc);
  const w = { walk: ww, idle: 1 - ww, agree: 0, headShake: 0 };
  const tm = { walk: tc % WALK_DUR, idle: (tc - 3.5 + 10) % clips.idle.duration, agree: 0, headShake: 0 };
  // nod (agree) 4.7 - 6.5
  const ag = smooth(4.6, 4.9, tc) * (1 - smooth(6.3, 6.6, tc));
  if (ag > 0) { w.agree = ag; tm.agree = clamp(tc - 4.6, 0, clips.agree.duration - 0.01); w.idle *= 1 - ag; }
  // flinch / head shake 7.6+
  const hs = smooth(7.55, 7.75, tc);
  if (hs > 0) { w.headShake = hs; tm.headShake = clamp((tc - 7.55) * 1.25, 0, clips.headShake.duration - 0.01); w.idle *= 1 - hs; }
  // yaw: faces +z while walking, turns toward the engine (+x side) after the nod
  const yaw = lerp(0, 1.15, smooth(6.6, 7.3, tc)) - 0.35 * smooth(7.55, 7.7, tc);
  return { z, w, tm, yaw };
}

function camAt(t, s) {
  const tc = Math.min(t, FREEZE);
  const cz = s.z;
  // per-shot camera; handheld drift
  const sh = (a, f) => Math.sin(tc * f) * a + Math.sin(tc * f * 2.31 + 1.3) * a * 0.5;
  let pos, look, fov = 38;
  if (tc < 4.4) {          // A: low tracking shot, walking toward camera
    const d = lerp(4.6, 3.1, smooth(0, 4.4, tc));
    pos = new THREE.Vector3(STOP.x - 0.6 + sh(0.03, 1.7), 0.62 + sh(0.025, 2.3), cz + d);
    look = new THREE.Vector3(STOP.x - 0.1, 1.25, cz);
  } else if (tc < 6.7) {   // B: medium close-up, slow arc
    const a = lerp(-0.45, -0.15, smooth(4.4, 6.7, tc));
    const R = lerp(1.65, 1.35, smooth(4.4, 6.7, tc));
    pos = new THREE.Vector3(STOP.x + Math.sin(a) * R + sh(0.01, 1.3), 1.5 + sh(0.01, 1.9), STOP.z + Math.cos(a) * R);
    look = new THREE.Vector3(STOP.x + 0.02, 1.52, STOP.z); fov = 34;
  } else {                 // C: wide low angle from across the street, ibrahim + engine + workshop
    const k = smooth(6.7, 8.6, tc);
    pos = new THREE.Vector3(-0.7 + sh(0.015, 1.1), 0.85 + k * 0.08, STOP.z + 4.3 - k * 0.5);
    look = new THREE.Vector3(STOP.x + 0.5, 1.38, STOP.z + 0.45); fov = 39 - k * 3;
  }
  if (t > FREEZE) { fov -= smooth(FREEZE, FREEZE + 1.2, t) * 2.0; }
  return { pos, look, fov };
}

function renderFrame(t) {
  const s = charState(t);
  ib.position.set(STOP.x, 0, s.z); ib.rotation.y = s.yaw; ib.updateMatrixWorld(true);
  setPose(s.w, s.tm);
  // face morphs
  const tc = Math.min(t, FREEZE);
  const smile = 0.35 + 0.55 * smooth(4.7, 5.0, tc) * (1 - smooth(6.6, 7.0, tc)) - 0.35 * smooth(7.55, 7.65, tc);
  const open = 0.75 * smooth(7.56, 7.62, tc);
  for (const k of ['Wolf3D_Head', 'Wolf3D_Teeth', 'Wolf3D_Beard']) { const m = meshes[k]; if (m.morphTargetInfluences) { m.morphTargetInfluences[m.morphTargetDictionary.mouthSmile] = clamp(smile, 0, 1); m.morphTargetInfluences[m.morphTargetDictionary.mouthOpen] = clamp(open, 0, 1); } }
  // laundry sway
  for (const [cl, ph] of laundry) cl.rotation.x = Math.sin(tc * 1.6 + ph) * 0.12;
  // engine idle shake + backfire
  const eng = window.__engine; eng.position.y = Math.abs(Math.sin(tc * 55)) * 0.006 * (1 + 3 * smooth(7.5, 7.6, tc) * (1 - smooth(8.2, 8.5, tc)));
  for (const p of puffs) {
    const u = p.userData; const age = tc - u.t0;
    if (age < 0 || age > u.life) { p.material.opacity = 0; continue; }
    const k = age / u.life;
    p.position.set(exhaustTip.x + u.vx * age, exhaustTip.y + u.vy * age - (u.big ? 0.35 * age * age * 0.2 : 0), exhaustTip.z + u.vz * age);
    const sc = u.s0 + age * (u.big ? 1.1 : 0.35); p.scale.set(sc, sc, sc);
    p.material.opacity = (u.big ? 0.95 : 0.35) * smooth(0, 0.08, age) * (1 - k);
    p.material.rotation = u.rot + age * 0.4;
  }
  const fa = tc - 7.55; flash.intensity = fa > 0 && fa < 0.3 ? 60 * (1 - fa / 0.3) * (0.7 + 0.3 * Math.sin(fa * 120)) : 0;
  for (const sp of sparks) { const u = sp.userData; if (fa > 0 && fa < u.d) { sp.visible = true; sp.position.copy(exhaustTip).addScaledVector(u.v, fa); sp.position.y -= 4.9 * fa * fa; sp.lookAt(sp.position.clone().add(u.v)); } else sp.visible = false; }
  // camera
  const c = camAt(t, s);
  camera.position.copy(c.pos); camera.fov = c.fov; camera.updateProjectionMatrix(); camera.lookAt(c.look);
  const fz = smooth(FREEZE, FREEZE + 0.15, t);
  gradePass.uniforms.uTime.value = t * 24.0; gradePass.uniforms.uSeed.value = (t * 24) % 97;
  gradePass.uniforms.uFreeze.value = fz;
  composer.render();
  // compose onto output canvas
  og.drawImage(renderer.domElement, 0, 0);
  // letterbox bars (cinematic)
  const bar = 54; og.fillStyle = '#000'; og.fillRect(0, 0, W, bar); og.fillRect(0, H - bar, W, bar);
  if (t > FREEZE) drawCard(t - FREEZE);
}

function drawCard(dt) {
  // freeze-frame character intro
  const a = smooth(0, 0.25, dt);
  og.save();
  // white flash on the freeze
  if (dt < 0.12) { og.fillStyle = `rgba(255,255,255,${0.55 * (1 - dt / 0.12)})`; og.fillRect(0, 0, W, H); }
  const x0 = 96, y0 = 470;
  const slide = (1 - smooth(0, 0.3, dt)) * -60;
  og.globalAlpha = a;
  og.fillStyle = 'rgba(0,0,0,0.0)';
  og.font = '112px Anton'; og.textBaseline = 'alphabetic';
  og.lineWidth = 10; og.strokeStyle = 'rgba(0,0,0,0.9)'; og.lineJoin = 'round';
  og.strokeText('IBRAHIM', x0 + slide, y0); og.fillStyle = '#f2ead8'; og.fillText('IBRAHIM', x0 + slide, y0);
  const a2 = smooth(0.25, 0.5, dt); og.globalAlpha = a2;
  og.font = '58px Lalezar'; og.direction = 'rtl'; og.textAlign = 'left';
  og.lineWidth = 8; og.strokeText('إبراهيم', x0 + 470, y0 - 8); og.fillStyle = '#e0b04a'; og.fillText('إبراهيم', x0 + 470, y0 - 8);
  og.direction = 'ltr';
  const a3 = smooth(0.5, 0.8, dt); og.globalAlpha = a3;
  og.font = '34px Anton'; og.lineWidth = 6;
  og.strokeText('THE INVENTOR', x0 + 4, y0 + 52); og.fillStyle = '#c8c0b0'; og.fillText('THE INVENTOR', x0 + 4, y0 + 52);
  og.font = '30px Lalezar'; og.direction = 'rtl';
  og.strokeText('— المخترع', x0 + 470, y0 + 50); og.fillStyle = '#c8c0b0'; og.fillText('— المخترع', x0 + 470, y0 + 50);
  og.restore();
}

window.renderFrame = renderFrame;
window.frameData = () => out.toDataURL('image/png');
window.INFO = { GEO: window.__geo, WALK_SPEED, WALK_DUR, stepPhases, steps, TOTAL, START_Z, hipRatio, FREEZE };
window.READY = true;
