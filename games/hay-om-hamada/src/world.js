// The neighbourhood «حي أم حمادة»: four inner blocks around a roundabout, a ring road, and a wall of buildings around it.
// Coordinates: x east, z south, 1 unit ≈ 0.92 m (characters are ~1.9 tall). Inner blocks span ±5..±35, the ring road ±35..±45.
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { rng, canvasTex, M, P, mesh, box, cyl } from './kit.js';
import { makeSamirCar } from './samir_car.js';

export const colliders = [];   // axis-aligned boxes {x0,x1,z0,z1,h}
export const circles = [];     // round obstacles {x,z,r}
export const raised = [];      // walkable raised areas {x0,x1,z0,z1,y} (sidewalks) and {cx,cz,r,y} (roundabout)
export const zones = [];       // named places for the location card and the minimap
export const mapRects = [];    // minimap drawing: {x0,x1,z0,z1,kind}
export const spawns = {};      // where each character starts

const addBox = (x0, x1, z0, z1, h = 20) => colliders.push({ x0: Math.min(x0, x1), x1: Math.max(x0, x1), z0: Math.min(z0, z1), z1: Math.max(z0, z1), h });

// ---------- shared material cache (keeps the merged draw calls low) ----------
const matCache = new Map();
function mat(color, o = {}) {
  const k = color + JSON.stringify(o, (key, v) => (v && v.isTexture ? v.uuid : v));
  if (!matCache.has(k)) matCache.set(k, M(color, o));
  return matCache.get(k);
}
function uvScale(geo, su, sv) { const uv = geo.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * su, uv.getY(i) * sv); return geo; }
const signCache = new Map();
function arSign(text, bg, fg, w = 128, h = 32, size = 22) {
  const key = [text, bg, fg, w, h, size].join('|');
  if (!signCache.has(key)) signCache.set(key, makeSign(text, bg, fg, w, h, size));
  return signCache.get(key);
}
function makeSign(text, bg, fg, w, h, size) {
  return canvasTex(w, h, (g) => {
    g.fillStyle = bg; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(255,255,255,0.25)'; g.fillRect(0, 0, w, 2); g.fillStyle = 'rgba(0,0,0,0.3)'; g.fillRect(0, h - 2, w, 2);
    g.font = `${size}px Lalezar`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.direction = 'rtl';
    g.fillStyle = 'rgba(0,0,0,0.45)'; g.fillText(text, w / 2 + 1, h / 2 + 2); g.fillStyle = fg; g.fillText(text, w / 2, h / 2 + 1);
  });
}

// ---------- textures ----------
const PALETTES = [
  { wall: '#c99a5a', dark: '#a87e44', shut: '#4f7a3a' },
  { wall: '#d8c49a', dark: '#b8a274', shut: '#7a4a2a' },
  { wall: '#d89a7a', dark: '#b87a5c', shut: '#3a6a8a' },
  { wall: '#a8b0b8', dark: '#8a929a', shut: '#5a5a5a' },
  { wall: '#e8dcc0', dark: '#c8b894', shut: '#4a7a5a' },
  { wall: '#c8a050', dark: '#a88438', shut: '#6a3a2a' },
  { wall: '#b0603a', dark: '#8a4a2a', shut: '#3a3a3a', brick: true },
];
function facadeTex(p, seed) {
  return canvasTex(128, 128, (g) => {
    const r = rng(seed);
    g.fillStyle = p.wall; g.fillRect(0, 0, 128, 128);
    if (p.brick) { g.fillStyle = '#9a5030'; for (let y = 0; y < 128; y += 4) for (let x = (y / 4 % 2) * 4; x < 128; x += 8) g.fillRect(x, y, 7, 3); }
    for (let i = 0; i < 260; i++) { g.fillStyle = r() > 0.5 ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)'; g.fillRect(r() * 128 | 0, r() * 128 | 0, 2, 2); }
    for (let cy = 0; cy < 4; cy++) for (let cx = 0; cx < 4; cx++) {
      const x = cx * 32, y = cy * 32;
      if (p.brick) { g.fillStyle = '#b8b0a0'; g.fillRect(x, y + 29, 32, 3); g.fillRect(x, y, 2, 32); }
      else { g.fillStyle = p.dark; g.fillRect(x, y + 30, 32, 2); }
      g.fillStyle = '#e8e0d0'; g.fillRect(x + 8, y + 6, 16, 19);
      const lit = r() < 0.12;
      g.fillStyle = lit ? '#f0d890' : (r() < 0.5 ? '#2a3a5a' : '#34465e'); g.fillRect(x + 9, y + 7, 14, 17);
      g.fillStyle = '#e8e0d0'; g.fillRect(x + 15, y + 7, 2, 17);
      const sh = r();
      g.fillStyle = p.shut;
      if (sh < 0.35) { g.fillRect(x + 9, y + 7, 14, 17); g.fillStyle = 'rgba(0,0,0,0.25)'; for (let k = 0; k < 17; k += 3) g.fillRect(x + 9, y + 7 + k, 14, 1); }
      else if (sh < 0.7) { g.fillRect(x + 3, y + 7, 5, 17); g.fillRect(x + 24, y + 7, 5, 17); g.fillStyle = 'rgba(0,0,0,0.25)'; for (let k = 0; k < 17; k += 3) { g.fillRect(x + 3, y + 7 + k, 5, 1); g.fillRect(x + 24, y + 7 + k, 5, 1); } }
      if (r() < 0.18) { g.fillStyle = '#e4e4e4'; g.fillRect(x + 10, y + 24, 10, 5); g.fillStyle = '#9a9a9a'; g.fillRect(x + 11, y + 25, 8, 1); g.fillRect(x + 11, y + 27, 8, 1); }
      if (r() < 0.15) { g.fillStyle = 'rgba(60,40,20,0.25)'; g.fillRect(x + 22, y + 25, 2, 6); }
    }
  }, [1, 1]);
}
function shopTex(open, seed) {
  return canvasTex(32, 32, (g) => {
    const r = rng(seed);
    g.fillStyle = '#5a5248'; g.fillRect(0, 0, 32, 32);
    if (open) {
      g.fillStyle = '#2a2018'; g.fillRect(2, 4, 28, 28);
      g.fillStyle = '#f0e0a0'; g.fillRect(2, 4, 28, 2);
      for (let s = 0; s < 3; s++) { g.fillStyle = '#6a4a2a'; g.fillRect(3, 10 + s * 7, 26, 1); for (let i = 0; i < 6; i++) { g.fillStyle = ['#d8231b', '#ffd400', '#2f8f3a', '#1f5fd8', '#f0f0f0'][(r() * 5) | 0]; g.fillRect(4 + i * 4, 6 + s * 7, 3, 4); } }
    } else {
      g.fillStyle = '#9aa0a6'; g.fillRect(2, 4, 28, 28);
      g.fillStyle = '#7a8086'; for (let y = 5; y < 32; y += 2) g.fillRect(2, y, 28, 1);
      g.fillStyle = '#4a4e52'; g.fillRect(14, 28, 4, 2);
      if (r() < 0.6) { g.fillStyle = 'rgba(20,20,20,0.55)'; g.fillRect(6, 12, 10, 2); g.fillRect(8, 15, 14, 2); }
    }
  });
}
const asphaltTex = canvasTex(64, 64, (g) => { const r = rng(7); g.fillStyle = '#4a4a4e'; g.fillRect(0, 0, 64, 64); for (let i = 0; i < 500; i++) { const v = 60 + r() * 30 | 0; g.fillStyle = `rgb(${v},${v},${v + 4})`; g.fillRect(r() * 64 | 0, r() * 64 | 0, 1, 1); } g.fillStyle = '#3a3a3e'; g.fillRect(10, 30, 14, 2); g.fillRect(40, 8, 2, 10); }, [60, 60]);
const tileTex = canvasTex(16, 16, (g) => { g.fillStyle = '#b8ac98'; g.fillRect(0, 0, 16, 16); g.fillStyle = '#9a8e7a'; g.fillRect(0, 7, 16, 1); g.fillRect(7, 0, 1, 16); g.fillStyle = '#c8bca8'; g.fillRect(2, 2, 3, 2); }, [1, 1]);
const plazaTex = canvasTex(32, 32, (g) => { g.fillStyle = '#c8b48a'; g.fillRect(0, 0, 32, 32); g.fillStyle = '#a8946a'; for (let i = 0; i < 32; i += 8) { g.fillRect(i, 0, 1, 32); g.fillRect(0, i, 32, 1); } g.fillStyle = '#d8c49a'; g.fillRect(3, 3, 3, 3); g.fillRect(19, 19, 3, 3); }, [1, 1]);
const roofTex = canvasTex(16, 16, (g) => { g.fillStyle = '#8a8478'; g.fillRect(0, 0, 16, 16); g.fillStyle = '#7a7468'; g.fillRect(0, 8, 16, 1); g.fillStyle = '#9a9488'; g.fillRect(3, 3, 4, 2); }, [1, 1]);
const grassTex = canvasTex(16, 16, (g) => { const r = rng(3); g.fillStyle = '#4f8a3a'; g.fillRect(0, 0, 16, 16); for (let i = 0; i < 40; i++) { g.fillStyle = r() > 0.5 ? '#5f9a46' : '#3f7a2e'; g.fillRect(r() * 16 | 0, r() * 16 | 0, 1, 2); } }, [1, 1]);

// ---------- helpers that build into the static group ----------
let S; // static group (merged at the end)
function quad(w, h, m, x, y, z, ry = 0, su = 1, sv = 1) { const q = mesh(uvScale(new THREE.PlaneGeometry(w, h), su, sv), m, x, y, z, S); q.rotation.y = ry; return q; }

const SHOP_NAMES = ['بقالة الأمل', 'صيدلية الشفاء', 'مكوجي رِجل', 'حلاق النجوم', 'كشري أبو حمادة', 'موبايلات ٣٠٠٠', 'عصير قصب', 'فول وطعمية', 'أدوات منزلية', 'سايبر النجوم', 'مخبز العيش', 'عطارة الهنا', 'خردوات إبراهيم', 'ترزي الأناقة', 'كبدة الحاج', 'لعب أطفال'];
const SIGN_COLS = [['#1f6fd8', '#ffffff'], ['#d8231b', '#ffe14a'], ['#2f8f3a', '#ffffff'], ['#ffd400', '#1a1a1a'], ['#151518', '#ffd400'], ['#e8e8e8', '#d8231b']];
let shopIx = 0;
const facadeMats = PALETTES.map((p, i) => mat(0xffffff, { map: facadeTex(p, 11 + i * 7) }));
const groundWallMats = PALETTES.map(p => mat(new THREE.Color(p.dark).getHex()));
const shopMats = [mat(0xffffff, { map: shopTex(true, 3) }), mat(0xffffff, { map: shopTex(false, 4) }), mat(0xffffff, { map: shopTex(true, 9) }), mat(0xffffff, { map: shopTex(false, 12) })];
const roofMat = mat(0xffffff, { map: roofTex });
const concrete = mat(0xb8b0a0), railMat = mat(0x6a5a4a), tankMat = mat(0x2a3a5a), dishMat = mat(0xdcdcdc);
const clothCols = [0xd8231b, 0x1f5fd8, 0xffd400, 0xf0f0f0, 0x2f8f3a, 0xec86ad];

// faces: 'S' front faces +z, 'N' faces -z, 'E' faces +x, 'W' faces -x
const FACE = {
  S: { ry: 0, n: [0, 1] }, N: { ry: Math.PI, n: [0, -1] }, E: { ry: Math.PI / 2, n: [1, 0] }, W: { ry: -Math.PI / 2, n: [-1, 0] },
};
function building(x0, x1, z0, z1, floors, fronts, o = {}) {
  const r = rng(o.seed ?? Math.floor(x0 * 13 + z0 * 7 + 1000));
  const pi = o.pal ?? Math.floor(r() * PALETTES.length);
  const fm = facadeMats[pi], gm = groundWallMats[pi];
  const w = x1 - x0, d = z1 - z0, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
  const G = 3.5, H = G + floors * 3;
  addBox(x0, x1, z0, z1, H);
  mapRects.push({ x0, x1, z0, z1, kind: o.kind || 'bld' });
  for (const f of ['S', 'N', 'E', 'W']) {
    const F = FACE[f]; const len = (f === 'S' || f === 'N') ? w : d;
    const px = cx + F.n[0] * (w / 2), pz = cz + F.n[1] * (d / 2);
    quad(len, H - G, fm, px, G + (H - G) / 2, pz, F.ry, len / 12, floors / 4);
    const isFront = fronts.includes(f);
    if (!isFront || o.noShops) { quad(len, G, gm, px, G / 2, pz, F.ry); continue; }
    // ground floor: shop fronts with signs
    const n = Math.max(1, Math.round(len / 4.5)); const sw = len / n;
    for (let i = 0; i < n; i++) {
      const off = -len / 2 + sw * (i + 0.5);
      const ox = (f === 'S' || f === 'N') ? off * (f === 'S' ? 1 : -1) : 0, oz = (f === 'E' || f === 'W') ? off * (f === 'W' ? 1 : -1) : 0;
      const sx = px + ox + F.n[0] * 0.01, sz = pz + oz + F.n[1] * 0.01;
      quad(sw - 0.3, 2.6, shopMats[Math.floor(r() * shopMats.length)], sx, 1.3, sz, F.ry);
      quad(0.3, G, gm, sx + (f === 'S' || f === 'N' ? (sw / 2) * (f === 'S' ? 1 : -1) : 0), G / 2, sz + (f === 'E' || f === 'W' ? (sw / 2) * (f === 'W' ? 1 : -1) : 0), F.ry);
      if (r() < 0.75) {
        const name = SHOP_NAMES[shopIx++ % SHOP_NAMES.length]; const [bg, fg] = SIGN_COLS[(shopIx * 5) % SIGN_COLS.length];
        const sign = quad(sw - 0.5, 0.75, mat(0xffffff, { map: arSign(name, bg, fg) }), sx + F.n[0] * 0.06, 3.0, sz + F.n[1] * 0.06, F.ry);
        sign.userData.keep = true;
      }
      // awning
      if (r() < 0.4) { const a = mesh(box(sw - 0.4, 0.06, 0.9), mat(clothCols[Math.floor(r() * clothCols.length)]), sx + F.n[0] * 0.45, 2.75, sz + F.n[1] * 0.45, S); a.rotation.y = F.ry; a.rotateX(0.25); }
    }
    quad(len, G - 2.6, gm, px, 2.6 + (G - 2.6) / 2, pz, F.ry);
    // balconies on the street side
    const cols = Math.max(1, Math.round(len / 3));
    for (let fl = 1; fl <= floors; fl++) for (let c = 0; c < cols; c++) {
      if ((c + fl) % 2 && r() < 0.6) continue;
      const off = -len / 2 + (len / cols) * (c + 0.5);
      const bx = px + ((f === 'S' || f === 'N') ? off : 0) + F.n[0] * 0.45, bz = pz + ((f === 'E' || f === 'W') ? off : 0) + F.n[1] * 0.45;
      const y = G + (fl - 1) * 3;
      const g = new THREE.Group(); g.position.set(bx, y, bz); g.rotation.y = F.ry; S.add(g);
      mesh(box(2.3, 0.16, 0.9), concrete, 0, 0, 0, g);
      mesh(box(2.3, 0.9, 0.08), mat(new THREE.Color(PALETTES[pi].dark).getHex()), 0, 0.5, 0.42, g);
      for (const s of [-1, 1]) mesh(box(0.08, 0.9, 0.9), mat(new THREE.Color(PALETTES[pi].dark).getHex()), s * 1.11, 0.5, 0, g);
      const rr = r();
      if (rr < 0.25) { // laundry
        mesh(box(2.1, 0.02, 0.02), railMat, 0, 1.35, 0.4, g);
        for (let k = 0; k < 4; k++) mesh(box(0.35, 0.5, 0.02), mat(clothCols[Math.floor(r() * clothCols.length)]), -0.75 + k * 0.5, 1.08, 0.42, g);
      } else if (rr < 0.38) { // dish on the railing
        const dsh = mesh(new THREE.SphereGeometry(0.35, 8, 4, 0, Math.PI * 2, 0, Math.PI * 0.35), dishMat, 0.6, 1.25, 0.3, g); dsh.rotation.x = Math.PI / 2 + 0.5;
      } else if (rr < 0.5) { // plant pots
        mesh(cyl(0.14, 0.1, 0.22, 6), mat(0xb8542a), -0.7, 1.05, 0.4, g); mesh(new THREE.IcosahedronGeometry(0.2, 0), mat(0x2f8f3a), -0.7, 1.3, 0.4, g);
      }
    }
  }
  // roof: parapet, water tanks, satellite dishes
  const roof = mesh(uvScale(new THREE.PlaneGeometry(w, d), w / 3, d / 3), roofMat, cx, H, cz, S); roof.rotation.x = -Math.PI / 2;
  const pm = mat(new THREE.Color(PALETTES[pi].dark).getHex());
  mesh(box(w, 0.8, 0.2), pm, cx, H + 0.4, z0 + 0.1, S); mesh(box(w, 0.8, 0.2), pm, cx, H + 0.4, z1 - 0.1, S);
  mesh(box(0.2, 0.8, d), pm, x0 + 0.1, H + 0.4, cz, S); mesh(box(0.2, 0.8, d), pm, x1 - 0.1, H + 0.4, cz, S);
  const nt = 1 + Math.floor(r() * 2);
  for (let i = 0; i < nt; i++) { mesh(cyl(0.6, 0.6, 1.2, 8), tankMat, x0 + 1.2 + r() * (w - 2.4), H + 1.4, z0 + 1.2 + r() * (d - 2.4), S); }
  const nd = 1 + Math.floor(r() * 3);
  for (let i = 0; i < nd; i++) {
    const dx = x0 + 1 + r() * (w - 2), dz = z0 + 1 + r() * (d - 2);
    mesh(cyl(0.04, 0.04, 1.0, 4), railMat, dx, H + 0.5, dz, S);
    const dsh = mesh(new THREE.SphereGeometry(0.55, 8, 4, 0, Math.PI * 2, 0, Math.PI * 0.35), dishMat, dx, H + 1.1, dz, S); dsh.rotation.set(Math.PI / 2 + 0.6, r() * 6, 0);
  }
  if (r() < 0.3) { mesh(box(2.2, 2.0, 2.0), mat(0xd8d0b8), x0 + 1.6, H + 1, z1 - 1.6, S); } // roof room (pigeon coop / stairs)
  return { H, cx, cz };
}

// sidewalk slab with a curb: walkable at y = 0.12
function sidewalk(x0, x1, z0, z1) {
  const w = x1 - x0, d = z1 - z0;
  const s = mesh(uvScale(new THREE.BoxGeometry(w, 0.12, d), w / 1.5, d / 1.5), mat(0xffffff, { map: tileTex }), (x0 + x1) / 2, 0.06, (z0 + z1) / 2, S);
  raised.push({ x0, x1, z0, z1, y: 0.12 });
  return s;
}

function lamp(x, z, ry) {
  mesh(cyl(0.07, 0.1, 5.2, 6), mat(0x3a3a3e), x, 2.6, z, S);
  const arm = new THREE.Group(); arm.position.set(x, 5.1, z); arm.rotation.y = ry; S.add(arm);
  mesh(box(1.2, 0.08, 0.08), mat(0x3a3a3e), 0.6, 0, 0, arm);
  mesh(box(0.45, 0.14, 0.25), mat(0x3a3a3e), 1.2, -0.05, 0, arm);
  mesh(box(0.38, 0.03, 0.2), new THREE.MeshBasicMaterial({ color: 0xfff2c0 }), 1.2, -0.13, 0, arm);
  circles.push({ x, z, r: 0.18 });
}
function tree(x, z, s = 1) {
  mesh(cyl(0.12 * s, 0.18 * s, 2.2 * s, 6), mat(0x6a4a2a), x, 1.1 * s, z, S);
  const r = rng(Math.floor(x * 31 + z * 17 + 999));
  for (let i = 0; i < 4; i++) mesh(new THREE.IcosahedronGeometry((0.8 + r() * 0.4) * s, 0), mat(i % 2 ? 0x3f7a2e : 0x4f8a3a), x + (r() - 0.5) * 1.2 * s, (2.6 + r() * 0.8) * s, z + (r() - 0.5) * 1.2 * s, S);
  circles.push({ x, z, r: 0.25 * s });
}
function palm(x, z, h = 6) {
  for (let i = 0; i < 6; i++) { const seg = mesh(cyl(0.16, 0.2, h / 6 + 0.05, 6), mat(i % 2 ? 0x7a5a32 : 0x6a4a2a), x + Math.sin(i * 0.3) * 0.08 * i, h / 12 + i * h / 6, z, S); seg.rotation.z = 0.03 * i; }
  const top = new THREE.Group(); top.position.set(x + 0.4, h, z); S.add(top);
  for (let i = 0; i < 8; i++) { const fr = mesh(new THREE.ConeGeometry(0.28, 2.6, 4), mat(i % 2 ? 0x2f7a2a : 0x3f8a32), 0, 0, 0, top); fr.rotation.set(0, i * Math.PI / 4, 0); fr.rotateZ(Math.PI / 2 + 0.5); fr.translateY(1.2); }
  circles.push({ x, z, r: 0.25 });
}
function parkedCar(x, z, ry, color, taxi = false) {
  const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; S.add(g);
  const body = mat(color);
  mesh(box(3.8, 0.7, 1.7), body, 0, 0.6, 0, g);
  mesh(box(2.1, 0.6, 1.55), taxi ? mat(0x111111) : body, -0.2, 1.25, 0, g);
  mesh(box(2.0, 0.45, 1.58), mat(0x2a3a4a), -0.2, 1.27, 0, g);
  if (taxi) mesh(box(3.82, 0.12, 1.72), mat(0xf0f0f0), 0, 0.75, 0, g);
  for (const [wx, wz] of [[-1.25, 0.8], [1.25, 0.8], [-1.25, -0.8], [1.25, -0.8]]) { const w = mesh(cyl(0.32, 0.32, 0.2, 8), mat(0x151515), wx, 0.32, wz, g); w.rotation.x = Math.PI / 2; }
  mesh(box(0.05, 0.18, 1.3), mat(0xfff2c0), 1.91, 0.65, 0, g);
  const c = Math.abs(Math.cos(ry)) > 0.5; const hw = c ? 1.95 : 0.9, hd = c ? 0.9 : 1.95;
  addBox(x - hw, x + hw, z - hd, z + hd, 1.6);
  mapRects.push({ x0: x - hw, x1: x + hw, z0: z - hd, z1: z + hd, kind: 'car' });
}
const triGeo = (() => { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute([-0.18, 0, 0, 0.18, 0, 0, 0, -0.4, 0], 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute([0, 0, 1, 0, 0, 1, 0, 0, 1], 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute([0, 1, 1, 1, 0.5, 0], 2)); return g; })();
const flagMats = [0xd8231b, 0xffd400, 0x2f8f3a, 0x1f5fd8, 0xf0f0f0, 0xec86ad].map(c => mat(c, { side: THREE.DoubleSide }));
function bunting(ax, az, bx, bz, y = 5.4) {
  const len = Math.hypot(bx - ax, bz - az); const n = Math.floor(len / 0.5);
  for (let i = 0; i <= n; i++) {
    const k = i / n; const sag = Math.sin(k * Math.PI) * 0.8;
    const px = ax + (bx - ax) * k, pz = az + (bz - az) * k;
    const t = mesh(triGeo, flagMats[i % flagMats.length], px, y - sag, pz, S); t.rotation.y = Math.atan2(-(bz - az), bx - ax);
  }
  const line = mesh(box(len, 0.02, 0.02), railMat, (ax + bx) / 2, y - 0.4, (az + bz) / 2, S); line.rotation.y = Math.atan2(-(bz - az), bx - ax);
}
function stall(x, z, ry, fruit, awning) {
  const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; S.add(g);
  mesh(box(2.6, 0.1, 1.3), mat(0x8a5a2b), 0, 0.85, 0, g);
  for (const [lx, lz] of [[-1.2, 0.55], [1.2, 0.55], [-1.2, -0.55], [1.2, -0.55]]) mesh(box(0.08, 0.85, 0.08), mat(0x6a4220), lx, 0.42, lz, g);
  for (const [lx, lz] of [[-1.25, 0.6], [1.25, 0.6], [-1.25, -0.6], [1.25, -0.6]]) mesh(box(0.06, 2.4, 0.06), mat(0x6a4220), lx, 1.2, lz, g);
  const aw = mesh(box(2.9, 0.06, 1.7), mat(awning), 0, 2.45, 0, g); aw.rotation.x = 0.12;
  const r = rng(Math.floor(x * 7 + z * 3 + 77));
  for (let i = 0; i < 14; i++) { const f = fruit[i % fruit.length]; const s = mesh(new THREE.IcosahedronGeometry(f.r, 0), mat(f.c), -1.0 + (i % 7) * 0.33, 1.0 + f.r * 0.6 + (i >= 7 ? f.r * 0.9 : 0), (i >= 7 ? 0 : 0.25) - 0.1 + (r() - 0.5) * 0.1, g); if (f.sx) s.scale.set(f.sx, 1, 1); }
  for (let i = 0; i < 3; i++) mesh(box(0.6, 0.4, 0.45), mat(0xb08850), -0.8 + i * 0.8, 0.2, -0.95, g);
  const c = Math.abs(Math.cos(ry)) > 0.5; const hw = c ? 1.4 : 0.75, hd = c ? 0.75 : 1.4;
  addBox(x - hw, x + hw, z - hd, z + hd, 3.3); // tall enough that the camera avoids the awning/sign
  mapRects.push({ x0: x - hw, x1: x + hw, z0: z - hd, z1: z + hd, kind: 'stall' });
  return g;
}

// ---------- the tuk-tuk (from fein-eltoktok-src/tuk_block.js) ----------
function makeTuk(parent) {
  const tuk = new THREE.Group(); parent.add(tuk);
  const tb = new THREE.Group(); tuk.add(tb);
  const txt = (w, h, bg, fn) => canvasTex(w, h, (g) => { g.fillStyle = bg; g.fillRect(0, 0, w, h); fn(g, w, h); });
  const mashallahTex = txt(64, 20, '#d8231b', (g) => { g.fillStyle = '#ffe14a'; g.font = '13px Lalezar'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.direction = 'rtl'; g.fillText('ما شاء الله', 32, 11); });
  const plateTex = txt(48, 16, '#f0f0f0', (g) => { g.fillStyle = '#d8231b'; g.fillRect(0, 0, 48, 4); g.fillStyle = '#111'; g.font = '9px Lalezar'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.direction = 'rtl'; g.fillText('ح و د | ٣٠٠٠', 24, 11); });
  const red = P(0xd8231b, { shininess: 70 }), blk = M(0x161616);
  mesh(box(2.2, 0.15, 1.2), blk, 0, 0.35, 0, tb);
  mesh(box(1.2, 0.9, 1.25), red, 0.4, 0.85, 0, tb);
  mesh(box(0.7, 0.85, 0.95), red, -0.75, 0.8, 0, tb);
  mesh(new THREE.PlaneGeometry(0.85, 0.55), new THREE.MeshPhongMaterial({ color: 0x9fd0ff, transparent: true, opacity: 0.55, side: THREE.DoubleSide }), -1.1, 1.5, 0, tb).rotation.y = Math.PI / 2;
  mesh(box(2.0, 0.08, 1.35), blk, -0.05, 1.95, 0, tb);
  for (const [x, z] of [[-1.05, 0.45], [-1.05, -0.45], [0.95, 0.6], [0.95, -0.6]]) mesh(box(0.05, 0.75, 0.05), blk, x, 1.55, z, tb);
  mesh(box(0.06, 0.06, 0.6), P(0xcccccc), -0.85, 1.3, 0, tb);
  mesh(new THREE.PlaneGeometry(0.75, 0.24), M(0xffffff, { map: mashallahTex }), 1.005, 1.0, 0, tb).rotation.y = Math.PI / 2;
  mesh(new THREE.PlaneGeometry(0.4, 0.13), M(0xffffff, { map: plateTex }), 1.005, 0.6, 0, tb).rotation.y = Math.PI / 2;
  { const eye = new THREE.Group(); eye.position.set(-1.11, 1.0, 0); eye.rotation.y = -Math.PI / 2; tb.add(eye); mesh(cyl(0.12, 0.12, 0.02, 10), M(0x1f5fd8), 0, 0, 0, eye).rotation.x = Math.PI / 2; mesh(cyl(0.06, 0.06, 0.03, 10), M(0xffffff), 0, 0, 0.005, eye).rotation.x = Math.PI / 2; mesh(cyl(0.03, 0.03, 0.04, 8), M(0x111111), 0, 0, 0.01, eye).rotation.x = Math.PI / 2; }
  for (let i = 0; i < 9; i++) mesh(new THREE.ConeGeometry(0.03, 0.12, 4), M([0xffd400, 0xff3355, 0x33cc66][i % 3]), -0.9 + i * 0.22, 1.85, 0.68, tb).rotation.x = Math.PI;
  for (const [x, z] of [[-1.05, 0], [0.75, 0.62], [0.75, -0.62]]) { const w = mesh(cyl(0.26, 0.26, 0.16, 10), M(0x111111), x, 0.26, z, tb); w.rotation.x = Math.PI / 2; }
  tuk.scale.setScalar(1.15);
  return tuk;
}

// ---------- bake: merge static meshes that share a material ----------
function bake(group, scene) {
  group.updateMatrixWorld(true);
  const buckets = new Map(); const keep = [];
  group.traverse(o => {
    if (!o.isMesh) return;
    let g = o.geometry.clone(); g.applyMatrix4(o.matrixWorld);
    if (g.index) g = g.toNonIndexed();
    for (const k of Object.keys(g.attributes)) if (!['position', 'normal', 'uv'].includes(k)) g.deleteAttribute(k);
    if (!g.attributes.uv) g.setAttribute('uv', new THREE.Float32BufferAttribute(new Float32Array(g.attributes.position.count * 2), 2));
    const k = o.material.uuid;
    if (!buckets.has(k)) buckets.set(k, { m: o.material, geos: [] });
    buckets.get(k).geos.push(g);
  });
  const out = new THREE.Group(); out.name = 'static';
  for (const { m, geos } of buckets.values()) { const merged = mergeGeometries(geos, false); const me = new THREE.Mesh(merged, m); me.matrixAutoUpdate = false; out.add(me); }
  scene.add(out);
  return { drawCalls: buckets.size };
}

// =====================================================================
export function buildWorld(scene) {
  S = new THREE.Group();

  // sky dome + distant Cairo skyline (no fog)
  const skyTex = canvasTex(4, 64, (g) => { const gr = g.createLinearGradient(0, 0, 0, 64); gr.addColorStop(0, '#5fa0d8'); gr.addColorStop(0.55, '#a8cce8'); gr.addColorStop(1, '#f0dcb0'); g.fillStyle = gr; g.fillRect(0, 0, 4, 64); });
  const sky = new THREE.Mesh(new THREE.SphereGeometry(300, 16, 10), new THREE.MeshBasicMaterial({ map: skyTex, side: THREE.BackSide, fog: false, depthWrite: false })); scene.add(sky);
  const skyline = canvasTex(512, 64, (g) => {
    const r = rng(21); g.clearRect(0, 0, 512, 64);
    for (let x = 0; x < 512; x += 6 + (r() * 8 | 0)) { const h = 14 + r() * 34 | 0; const w = 6 + r() * 12 | 0; g.fillStyle = ['#b8a890', '#a89880', '#c8b8a0'][(r() * 3) | 0]; g.fillRect(x, 64 - h, w, h); g.fillStyle = 'rgba(60,60,80,0.35)'; for (let k = 0; k < 6; k++) g.fillRect(x + 1 + (r() * (w - 2) | 0), 64 - h + 2 + (r() * (h - 4) | 0), 2, 2); }
    for (const mx of [80, 260, 430]) { g.fillStyle = '#a89880'; g.fillRect(mx, 6, 4, 58); g.fillRect(mx - 2, 14, 8, 3); g.beginPath(); g.moveTo(mx - 1, 6); g.lineTo(mx + 2, 0); g.lineTo(mx + 5, 6); g.fill(); g.beginPath(); g.arc(mx + 22, 50, 14, Math.PI, 0); g.fill(); }
  });
  skyline.wrapS = THREE.RepeatWrapping; skyline.repeat.set(3, 1);
  const ring = new THREE.Mesh(new THREE.CylinderGeometry(160, 160, 70, 24, 1, true), new THREE.MeshBasicMaterial({ map: skyline, side: THREE.BackSide, transparent: true, fog: false, depthWrite: false }));
  ring.position.y = 22; scene.add(ring);

  // ground: asphalt everywhere, then lane markings
  const ground = mesh(new THREE.PlaneGeometry(130, 130), mat(0xffffff, { map: asphaltTex }), 0, 0, 0, S); ground.rotation.x = -Math.PI / 2;
  const dash = mat(0xf0f0e0);
  for (let v = -42; v <= 42; v += 3) {
    if (Math.abs(v) > 6) { mesh(box(1.4, 0.01, 0.15), dash, v, 0.012, 0, S); mesh(box(0.15, 0.01, 1.4), dash, 0, 0.012, v, S); }
    for (const ring2 of [-40, 40]) { mesh(box(1.4, 0.01, 0.15), dash, v, 0.012, ring2, S); mesh(box(0.15, 0.01, 1.4), dash, ring2, 0.012, v, S); }
  }
  // zebra crossings by the roundabout
  for (let i = -3; i <= 3; i++) { mesh(box(0.5, 0.012, 2.2), dash, i * 1.1, 0.013, 6.3, S); mesh(box(0.5, 0.012, 2.2), dash, i * 1.1, 0.013, -6.3, S); mesh(box(2.2, 0.012, 0.5), dash, 6.3, 0.013, i * 1.1, S); mesh(box(2.2, 0.012, 0.5), dash, -6.3, 0.013, i * 1.1, S); }

  // sidewalks around the four inner blocks and along the outer buildings
  for (const [x0, x1, z0, z1] of [[5, 35, -35, -5], [-35, -5, -35, -5], [-35, -5, 5, 35], [5, 35, 5, 35]]) {
    sidewalk(x0, x1, z0, z0 + 1.5); sidewalk(x0, x1, z1 - 1.5, z1); sidewalk(x0, x0 + 1.5, z0 + 1.5, z1 - 1.5); sidewalk(x1 - 1.5, x1, z0 + 1.5, z1 - 1.5);
  }
  sidewalk(-45, 45, -45, -43.5); sidewalk(-45, 45, 43.5, 45); sidewalk(-45, -43.5, -43.5, 43.5); sidewalk(43.5, 45, -43.5, 43.5);

  // ---------- the roundabout «الميدان» ----------
  { const rb = mesh(new THREE.CylinderGeometry(4, 4.1, 0.3, 16), mat(0xb8b0a0), 0, 0.15, 0, S);
    const gr = mesh(uvScale(new THREE.CircleGeometry(3.7, 16), 4, 4), mat(0xffffff, { map: grassTex }), 0, 0.31, 0, S); gr.rotation.x = -Math.PI / 2;
    raised.push({ cx: 0, cz: 0, r: 4, y: 0.3 });
    // fountain + palms
    mesh(cyl(1.1, 1.2, 0.5, 12), mat(0xd8d0c0), 0, 0.55, 0, S);
    mesh(new THREE.CircleGeometry(1.0, 12), new THREE.MeshLambertMaterial({ color: 0x4aa8ff }), 0, 0.81, 0, S).rotation.x = -Math.PI / 2;
    mesh(cyl(0.12, 0.18, 1.4, 6), mat(0xd8d0c0), 0, 1.4, 0, S); mesh(cyl(0.5, 0.2, 0.15, 10), mat(0xd8d0c0), 0, 2.1, 0, S);
    circles.push({ x: 0, z: 0, r: 1.3 });
    for (let i = 0; i < 4; i++) palm(Math.cos(i * Math.PI / 2 + 0.78) * 2.6, Math.sin(i * Math.PI / 2 + 0.78) * 2.6, 6 + (i % 2));
    zones.push({ id: 'midan', ar: 'الميدان', en: 'THE ROUNDABOUT', x: 0, z: 0, r: 6 });
  }

  // ---------- inner blocks: 3×3 lots of 9×9 inside each block ----------
  function lots(bx0, bz0, skip, seed) {
    // bx0/bz0: block's west/north edge (e.g. 5, -35). lots start 1.5 inside.
    const r = rng(seed);
    for (let row = 0; row < 3; row++) for (let col = 0; col < 3; col++) {
      if (skip.some(([c2, r2]) => c2 === col && r2 === row)) continue;
      const x0 = bx0 + 1.5 + col * 9, z0 = bz0 + 1.5 + row * 9;
      const fronts = []; if (row === 0) fronts.push('N'); if (row === 2) fronts.push('S'); if (col === 0) fronts.push('W'); if (col === 2) fronts.push('E');
      const floors = (row === 1 && col === 1) ? 6 : 3 + Math.floor(r() * 5);
      building(x0, x0 + 9, z0, z0 + 9, floors, fronts, { seed: seed * 10 + row * 3 + col });
    }
  }

  // NE block (5..35, -35..-5): Om Hamada's building on the south-west lot
  lots(5, -35, [[0, 2]], 3);
  const home = building(6.5, 15.5, -15.5, -6.5, 5, ['S', 'W'], { pal: 0, seed: 77, noShops: true, kind: 'home' });
  { // entrance, doorman's chair, plaque
    mesh(new THREE.PlaneGeometry(1.6, 2.6), mat(0x2a1e14), 11, 1.3, -6.48, S);
    mesh(box(2.2, 0.15, 0.6), concrete, 11, 2.75, -6.2, S);
    const plaque = mesh(new THREE.PlaneGeometry(2.4, 0.6), mat(0xffffff, { map: arSign('عمارة أم حمادة', '#1f9e5a', '#ffffff', 128, 32, 20) }), 11, 3.25, -6.47, S); void plaque;
    mesh(box(0.55, 0.06, 0.55), mat(0x8a5a2b), 13.1, 0.62, -7.0, S); for (const [a, b] of [[-0.22, -0.22], [0.22, -0.22], [-0.22, 0.22], [0.22, 0.22]]) mesh(box(0.05, 0.5, 0.05), mat(0x6a4220), 13.1 + a, 0.37, -7.0 + b, S);
    mesh(box(0.55, 0.6, 0.06), mat(0x8a5a2b), 13.1, 0.95, -7.25, S);
    mesh(cyl(0.05, 0.04, 0.1, 6), new THREE.MeshPhongMaterial({ color: 0xc0601a, transparent: true, opacity: 0.8 }), 13.6, 0.72, -7.0, S);
    addBox(12.8, 13.4, -7.3, -6.7, 1);
    // Ibrahim's workshop junk by the entrance
    for (let i = 0; i < 4; i++) mesh(box(0.6, 0.45, 0.5), mat([0x8a5a2b, 0x4a6a8a, 0x8a3a2a, 0x6a6a6a][i]), 7.6 + (i % 2) * 0.65, 0.35 + Math.floor(i / 2) * 0.46, -7.3, S);
    const dishBig = mesh(new THREE.SphereGeometry(0.7, 10, 5, 0, Math.PI * 2, 0, Math.PI * 0.35), dishMat, 8.2, 1.6, -7.2, S); dishBig.rotation.x = Math.PI / 2 - 0.4;
    addBox(7.2, 9.0, -7.6, -6.6, 1.4);
  }
  zones.push({ id: 'home', ar: 'عمارة أم حمادة', en: "OM HAMADA'S BUILDING", x: 11, z: -4, r: 5.5 });
  bunting(5, -12, -5, -12); bunting(5, -22, -5, -22); bunting(14, -5, 14, 5, 5.6);

  // NW block (-35..-5, -35..-5): «مركز الصيانة» on the south lots (cols 1-2)
  lots(-35, -35, [[1, 2], [2, 2]], 5);
  { const x0 = -24.5, x1 = -6.5, z0 = -15.5, z1 = -6.5, H = 6.5;
    const wallM = mat(0xd8d8d0), blue = mat(0x2f5fb0);
    // back + side walls (open front), roof slab, sign, inside props
    mesh(box(x1 - x0, H, 0.3), wallM, (x0 + x1) / 2, H / 2, z0 + 0.15, S); addBox(x0, x1, z0, z0 + 0.3, H);
    mesh(box(0.3, H, z1 - z0), wallM, x0 + 0.15, H / 2, (z0 + z1) / 2, S); addBox(x0, x0 + 0.3, z0, z1, H);
    mesh(box(0.3, H, z1 - z0), wallM, x1 - 0.15, H / 2, (z0 + z1) / 2, S); addBox(x1 - 0.3, x1, z0, z1, H);
    mesh(box(x1 - x0, 0.3, z1 - z0), mat(0x9a9a92), (x0 + x1) / 2, H, (z0 + z1) / 2, S);
    mesh(box(x1 - x0, 1.4, 0.3), blue, (x0 + x1) / 2, H - 0.7, z1 - 0.15, S);
    const sg = mesh(new THREE.PlaneGeometry(9, 1.2), mat(0xffffff, { map: arSign('مركز الصيانة', '#2f5fb0', '#ffffff', 192, 32, 24) }), (x0 + x1) / 2, H - 0.7, z1 + 0.02, S); void sg;
    mesh(box(0.25, H - 1.4, 0.3), blue, (x0 + x1) / 2, (H - 1.4) / 2, z1 - 0.15, S); addBox((x0 + x1) / 2 - 0.15, (x0 + x1) / 2 + 0.15, z1 - 0.3, z1, H);
    const fl = mesh(uvScale(new THREE.PlaneGeometry(x1 - x0, z1 - z0), 6, 3), mat(0x8a8a86), (x0 + x1) / 2, 0.02, (z0 + z1) / 2, S); fl.rotation.x = -Math.PI / 2;
    // hazard stripe floor line, car lift with a car, tyres, shelves, El-Alamy's desk + laptop
    mesh(box(4.4, 0.06, 0.25), mat(0xffd400), -21, 0.04, -10, S);
    for (const sx of [-1.6, 1.6]) mesh(box(0.3, 1.6, 0.3), mat(0xd8231b), -21 + sx, 0.8, -12, S);
    mesh(box(4.2, 0.12, 2.0), mat(0x444444), -21, 1.6, -12, S);
    { const g = new THREE.Group(); g.position.set(-21, 1.66, -12); S.add(g); mesh(box(3.8, 0.7, 1.7), mat(0xf0f0f0), 0, 0.45, 0, g); mesh(box(2.1, 0.6, 1.55), mat(0xf0f0f0), -0.2, 1.1, 0, g); mesh(box(2.0, 0.45, 1.58), mat(0x2a3a4a), -0.2, 1.12, 0, g); }
    addBox(-23.2, -18.8, -13.1, -10.9, 3);
    for (let i = 0; i < 5; i++) { const t = mesh(cyl(0.38, 0.38, 0.25, 10), mat(0x1a1a1a), -23.4, 0.15 + i * 0.26, -14.5, S); void t; }
    circles.push({ x: -23.4, z: -14.5, r: 0.45 });
    for (let i = 0; i < 3; i++) { mesh(box(3.0, 0.08, 0.6), mat(0x6a6a6a), -15.5, 0.6 + i * 0.8, -15.0, S); for (let k = 0; k < 5; k++) mesh(box(0.35, 0.35, 0.35), mat([0xd8231b, 0x2f5fb0, 0xffd400, 0x2f8f3a, 0x8a5a2b][(i + k) % 5]), -16.7 + k * 0.6, 0.82 + i * 0.8, -15.0, S); }
    addBox(-17, -14, -15.4, -14.6, 2.6);
    mesh(box(2.0, 0.08, 1.0), mat(0x8a5a2b), -11, 0.95, -12.5, S); for (const [a, b] of [[-0.9, -0.4], [0.9, -0.4], [-0.9, 0.4], [0.9, 0.4]]) mesh(box(0.06, 0.95, 0.06), mat(0x6a4220), -11 + a, 0.47, -12.5 + b, S);
    mesh(box(0.6, 0.03, 0.4), mat(0x222222), -11, 1.01, -12.5, S); const scr = mesh(box(0.6, 0.4, 0.03), mat(0x222222), -11, 1.22, -12.7, S); scr.rotation.x = -0.2;
    mesh(new THREE.PlaneGeometry(0.52, 0.32), new THREE.MeshBasicMaterial({ color: 0x3df05a }), -11, 1.22, -12.68, S).rotation.x = -0.2;
    addBox(-12, -10, -13, -12, 1.2);
    mapRects.push({ x0, x1, z0, z1, kind: 'garage' });
    zones.push({ id: 'garage', ar: 'مركز الصيانة', en: 'THE SERVICE CENTER', x: -15.5, z: -9, r: 7 });
  }
  bunting(-5, 12, 5, 12); bunting(-12, -5, -12, 5);

  // SW block (-35..-5, 5..35): the market — open plaza on the north-east four lots
  lots(-35, 5, [[1, 0], [2, 0], [1, 1], [2, 1]], 8);
  { const x0 = -24.5, x1 = -6.5, z0 = 6.5, z1 = 24.5;
    const pz = mesh(uvScale(new THREE.PlaneGeometry(x1 - x0 + 1.5, z1 - z0 + 1.5), 9, 9), mat(0xffffff, { map: plazaTex }), (x0 + x1 + 1.5) / 2, 0.125, (z0 + z1 - 1.5) / 2, S); pz.rotation.x = -Math.PI / 2;
    raised.push({ x0, x1: x1 + 1.5, z0: z0 - 1.5, z1, y: 0.12 });
    mapRects.push({ x0, x1, z0, z1, kind: 'plaza' });
    const melon = [{ r: 0.2, c: 0x2f7a2f, sx: 1.3 }], oranges = [{ r: 0.1, c: 0xff8a1a }], toms = [{ r: 0.1, c: 0xd8231b }], mix = [{ r: 0.12, c: 0xffd400 }, { r: 0.11, c: 0x7a1a4a }, { r: 0.1, c: 0x2f8f3a }];
    // Shehata's stall (biggest, with his sign) + more stalls
    const sh = stall(-11, 11, 0, melon, 0x2f8f3a);
    const shSign = mesh(new THREE.PlaneGeometry(2.6, 0.6), M(0xffffff, { map: arSign('فرشة شحاتة', '#2f8f3a', '#ffe14a', 128, 32, 22), side: THREE.DoubleSide }), 0, 2.9, 0.7, sh); void shSign;
    for (let i = 0; i < 6; i++) { const m = mesh(new THREE.IcosahedronGeometry(0.24, 0), mat(0x2f7a2f), -11.6 + (i % 3) * 0.55, 0.25, 12.6 + Math.floor(i / 3) * 0.5, S); m.scale.set(1.3, 1, 1); }
    addBox(-12.1, -10.1, 12.3, 13.3, 0.6);
    stall(-17, 11, 0, oranges, 0xd8231b); stall(-22, 11, 0, toms, 0xffd400);
    stall(-11, 18, Math.PI, mix, 0x1f5fd8); stall(-17, 18, Math.PI, oranges, 0xec86ad); stall(-22, 18, Math.PI, toms, 0x2f8f3a);
    bunting(-24, 14.5, -8, 14.5, 4.2); bunting(-24, 21, -8, 21, 4.2);
    for (const [cx, cz] of [[-8.3, 23], [-23.5, 7.8]]) tree(cx, cz, 1.1);
    zones.push({ id: 'market', ar: 'السوق', en: 'THE MARKET', x: -16, z: 15, r: 7 });
    zones.push({ id: 'shehata', ar: 'فرشة شحاتة', en: "SHEHATA'S STALL", x: -11, z: 12, r: 2.6 });
  }
  // tuk-tuk stand: on the street by the market
  zones.push({ id: 'tuk', ar: 'موقف التوكتوك', en: 'TUK-TUK STAND', x: -3.4, z: 11, r: 3.5 });
  { const sg = mesh(cyl(0.06, 0.06, 2.6, 5), mat(0x3a3a3e), -5.3, 1.3, 8.2, S); void sg;
    const pl = mesh(new THREE.PlaneGeometry(1.6, 0.5), M(0xffffff, { map: arSign('موقف التوكتوك', '#ffd400', '#1a1a1a', 128, 32, 18), side: THREE.DoubleSide }), -5.3, 2.5, 8.2, S); pl.rotation.y = Math.PI / 2;
    circles.push({ x: -5.3, z: 8.2, r: 0.15 });
  }

  // SE block (5..35, 5..35): café (NW lot), mosque (NE two lots), «عاجل جدًا» studio (SE lot)
  lots(5, 5, [[0, 0], [1, 0], [2, 0], [2, 2]], 12);
  { // café: one floor, open front with chairs on the sidewalk and a TV
    building(6.5, 15.5, 6.5, 15.5, 2, ['W'], { pal: 4, seed: 91 });
    const cafeWall = mat(0x3a6a5a);
    mesh(box(9, 3.4, 0.1), cafeWall, 11, 1.7, 6.45, S);
    const sg = mesh(new THREE.PlaneGeometry(5, 0.9), mat(0xffffff, { map: arSign('قهوة الحبايب', '#3a6a5a', '#ffe14a', 128, 32, 22) }), 11, 3.0, 6.38, S); sg.rotation.y = Math.PI;
    mesh(new THREE.PlaneGeometry(7.5, 2.4), mat(0x1a1410), 11, 1.3, 6.38, S).rotation.y = Math.PI;
    const tv = mesh(box(1.1, 0.7, 0.2), mat(0x111111), 13.5, 2.3, 6.3, S); void tv; mesh(new THREE.PlaneGeometry(0.95, 0.55), new THREE.MeshBasicMaterial({ color: 0x3fae4a }), 13.5, 2.3, 6.19, S).rotation.y = Math.PI;
    for (let i = 0; i < 4; i++) {
      const tx = 7.6 + i * 2.2, tz = 5.6;
      mesh(cyl(0.35, 0.35, 0.05, 8), mat(0xe8e8e8), tx, 0.85, tz, S); mesh(cyl(0.04, 0.04, 0.75, 4), mat(0x6a6a6a), tx, 0.48, tz, S);
      mesh(cyl(0.05, 0.04, 0.1, 6), new THREE.MeshPhongMaterial({ color: 0xc0601a, transparent: true, opacity: 0.8 }), tx + 0.1, 0.93, tz, S);
      for (const s of [-1, 1]) { mesh(box(0.42, 0.05, 0.42), mat(0x8a5a2b), tx + s * 0.6, 0.5, tz, S); mesh(box(0.42, 0.45, 0.05), mat(0x8a5a2b), tx + s * 0.6, 0.75, tz + 0.2, S); }
      circles.push({ x: tx, z: tz, r: 0.45 });
    }
    zones.push({ id: 'cafe', ar: 'قهوة الحبايب', en: 'THE CAFÉ', x: 11, z: 4.5, r: 4.5 });
  }
  { // mosque
    const x0 = 15.5, x1 = 33.5, z0 = 6.5, z1 = 15.5;
    building(x0, x1, z0, z1, 1, [], { pal: 4, seed: 93, noShops: true, kind: 'mosque' });
    mesh(new THREE.SphereGeometry(3.2, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2), mat(0x3a8a6a), 24.5, 6.5, 11, S);
    mesh(cyl(0.08, 0.08, 1.2, 4), mat(0xffd400), 24.5, 10.2, 11, S); mesh(new THREE.TorusGeometry(0.3, 0.06, 4, 10, Math.PI * 1.4), mat(0xffd400), 24.5, 11.0, 11, S);
    // minaret
    for (const [y, r, h] of [[0, 1.1, 9], [9, 0.85, 4], [13, 0.6, 3]]) mesh(cyl(r, r * 1.05, h, 8), mat(0xe8dcc0), 32, y + h / 2, 7.5, S);
    mesh(cyl(1.4, 1.4, 0.25, 8), mat(0xd8c8a8), 32, 9.1, 7.5, S); mesh(cyl(1.0, 1.0, 0.25, 8), mat(0xd8c8a8), 32, 13.1, 7.5, S);
    mesh(new THREE.ConeGeometry(0.7, 1.6, 8), mat(0x3a8a6a), 32, 16.8, 7.5, S);
    for (let i = 0; i < 5; i++) { const ax = 17.5 + i * 3.2; mesh(new THREE.PlaneGeometry(1.4, 2.6), mat(0x2a4a3a), ax, 1.6, 6.48, S).rotation.y = Math.PI; mesh(new THREE.CircleGeometry(0.7, 8, 0, Math.PI), mat(0x2a4a3a), ax, 2.9, 6.48, S).rotation.y = Math.PI; }
    zones.push({ id: 'mosque', ar: 'الجامع', en: 'THE MOSQUE', x: 24.5, z: 4.5, r: 5 });
  }
  { // «عاجل جدًا» studio
    const r = building(24.5, 33.5, 24.5, 33.5, 4, ['E', 'S'], { pal: 3, seed: 95, noShops: true, kind: 'studio' });
    const red = mat(0xd8231b);
    mesh(box(0.2, 2.2, 7.5), red, 33.65, 4.6, 29, S);
    const sg = mesh(new THREE.PlaneGeometry(7.2, 1.9), mat(0xffffff, { map: arSign('عاجل جدًا', '#d8231b', '#ffffff', 128, 32, 24) }), 33.78, 4.6, 29, S); sg.rotation.y = Math.PI / 2;
    mesh(new THREE.PlaneGeometry(2.0, 2.6), mat(0x1a2a3a), 33.52, 1.3, 29, S).rotation.y = Math.PI / 2;
    const dsh = mesh(new THREE.SphereGeometry(1.6, 10, 5, 0, Math.PI * 2, 0, Math.PI * 0.35), dishMat, 29, r.H + 2.2, 29, S); dsh.rotation.x = Math.PI / 2 + 0.7;
    mesh(cyl(0.1, 0.1, 2, 4), railMat, 29, r.H + 1, 29, S);
    mesh(cyl(0.05, 0.08, 6, 4), mat(0xd8231b), 31.5, r.H + 3, 26.5, S);
    zones.push({ id: 'studio', ar: 'قناة عاجل جدًا', en: 'AGEL GEDDAN TV', x: 37, z: 29, r: 4.5 });
  }

  // ---------- the outer wall of buildings (facing the ring road) ----------
  { const r = rng(55); let i = 0;
    for (let a = -54; a < 54; a += 9) {
      const f1 = 3 + Math.floor(r() * 5), f2 = 3 + Math.floor(r() * 5), f3 = 3 + Math.floor(r() * 5), f4 = 3 + Math.floor(r() * 5);
      building(a, a + 9, -54, -45, f1, ['S'], { seed: 300 + i }); building(a, a + 9, 45, 54, f2, ['N'], { seed: 400 + i });
      if (a >= -45 && a < 45) { building(-54, -45, a, a + 9, f3, ['E'], { seed: 500 + i }); building(45, 54, a, a + 9, f4, ['W'], { seed: 600 + i }); }
      i++;
    }
    building(-54, -45, -54, -45, 5, [], { seed: 701 }); building(45, 54, -54, -45, 6, [], { seed: 702 }); building(-54, -45, 45, 54, 4, [], { seed: 703 }); building(45, 54, 45, 54, 7, [], { seed: 704 });
  }

  // ---------- street furniture ----------
  for (const v of [-30, -20, -10, 10, 20, 30]) { lamp(5.7, v, Math.PI); lamp(-5.7, v + 5, 0); lamp(v + 5, 5.7, -Math.PI / 2); lamp(v, -5.7, Math.PI / 2); }
  for (const v of [-38, -24, -12, 0, 12, 24, 38]) { lamp(44.2, v, Math.PI); lamp(-44.2, v, 0); lamp(v, 44.2, Math.PI / 2); lamp(v, -44.2, -Math.PI / 2); }
  for (const [x, z] of [[34.2, -20], [34.2, 20], [-34.2, -20], [-34.2, 25], [20, 34.2], [-20, -34.2], [20, -34.2], [5.8, 25], [-5.8, -25], [25, 5.8]]) tree(x, z);
  // parked cars along the streets (a Cairo black-and-white taxi or two)
  const carCols = [0xf0f0f0, 0x2a2a2a, 0x8a1a1a, 0x1f3f7a, 0xc8c0a0, 0x5a6a5a];
  [[3.4, -24, Math.PI / 2], [-3.4, -18, -Math.PI / 2], [3.4, 26, Math.PI / 2], [-28, 3.4, 0], [26, 3.4, 0], [-20, -3.4, Math.PI], [38, -15, Math.PI / 2], [-38, 18, -Math.PI / 2], [10, 41.6, 0], [-14, -41.6, Math.PI], [41.6, 30, Math.PI / 2], [-41.6, -28, -Math.PI / 2]]
    .forEach(([x, z, ry], i) => parkedCar(x, z, ry, carCols[i % carCols.length], i % 4 === 1));
  // gas cylinders + a trash pile + a pile of tyres (pure Cairo set dressing)
  for (let i = 0; i < 3; i++) mesh(cyl(0.18, 0.18, 0.6, 8), mat(0x2a6a3a), 34.0, 0.42, -12 + i * 0.4, S);
  circles.push({ x: 34.0, z: -11.6, r: 0.6 });
  for (let i = 0; i < 4; i++) mesh(new THREE.IcosahedronGeometry(0.35, 0), mat([0x2a2a2a, 0x3a4a2a, 0x4a3a2a][i % 3]), -34 + (i % 2) * 0.5, 0.3, 30 + Math.floor(i / 2) * 0.5, S);
  circles.push({ x: -33.8, z: 30.3, r: 0.7 });

  const stats = bake(S, scene);

  // ---------- dynamic props (they will drive later) ----------
  const samirCar = makeSamirCar(scene, 1.2); samirCar.late && samirCar.late();
  samirCar.g.position.set(19.5, 0, -3.4);
  addBox(19.5 - 2.5, 19.5 + 2.5, -3.4 - 1.1, -3.4 + 1.1, 1.7);
  mapRects.push({ x0: 17, x1: 22, z0: -4.5, z1: -2.3, kind: 'samircar' });
  const tuk = makeTuk(scene); tuk.position.set(-3.4, 0, 11.2); tuk.rotation.y = -Math.PI / 2;
  addBox(-4.2, -2.6, 9.9, 12.6, 1.8);
  mapRects.push({ x0: -4.2, x1: -2.6, z0: 9.9, z1: 12.6, kind: 'tuk' });

  Object.assign(spawns, {
    dad: { x: 15.5, z: -2.2, ry: Math.PI },
    mom: { x: 9.2, z: -5.8, ry: 0.3 },
    son: { x: 5.8, z: -9.5, ry: -Math.PI / 2 },
    samir: { x: 22.6, z: -5.8, ry: -0.4 },
    sayed: { x: 12.4, z: -6.0, ry: 0.2 },
    hooda: { x: -5.7, z: 11.6, ry: Math.PI / 2 },
    shehata: { x: -11, z: 10, ry: Math.PI },
    bastam: { x: -18.5, z: -7.8, ry: 0.2 },
    alamy: { x: -11, z: -11.6, ry: Math.PI * 0.95 },
    asly: { x: -8.6, z: -8.6, ry: -0.6 },
    gazzar: { x: -21, z: -9.6, ry: Math.PI },
  });
  return { stats, samirCar, tuk, home };
}

export function groundAt(x, z) {
  let y = 0;
  for (const r of raised) {
    if (r.r !== undefined) { if ((x - r.cx) ** 2 + (z - r.cz) ** 2 < r.r * r.r) y = Math.max(y, r.y); }
    else if (x >= r.x0 && x <= r.x1 && z >= r.z0 && z <= r.z1) y = Math.max(y, r.y);
  }
  return y;
}
