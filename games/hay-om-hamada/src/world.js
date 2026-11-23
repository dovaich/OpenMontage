// The city around «حي أم حمادة». Coordinates: x east, z south, 1 unit ≈ 0.92 m. Roads every 40 units (10 wide).
// Districts: the neighbourhood (centre), downtown (north), industrial area + scrapyard (west), Nile corniche + bridge + island (east),
// low-rise edge (south) and the desert with the jump park beyond it.
import * as THREE from 'three';
import { rng, canvasTex, M, P, mesh, box, cyl, plainGeo, isPlain, vcMat, mergeGeometries } from './kit.js';
import { makeSamirCar } from './samir_car.js';
import { signGeo, signMat, signMatDouble, atlasTex } from './atlas.js';

export const XR = [-160, -120, -80, -40, 0, 40, 80, 120];
export const ZR = [-160, -120, -80, -40, 0, 40, 80, 120, 160];
export const RIVER = { x0: 126, x1: 420, isle: { x0: 196, x1: 276, z0: -70, z1: 70 }, bridge: { x0: 118, x1: 200, z0: -5.5, z1: 5.5 } };
export const colliders = [];   // {x0,x1,z0,z1,h}
export const circles = [];     // {x,z,r}
export const raised = [];      // rects {x0,x1,z0,z1,y} | discs {cx,cz,r,y} | ramps {x0,x1,z0,z1,axis,y0,y1}
export const zones = [];       // named places
export const mapRects = [];    // minimap
export const spawns = {};
export const doors = [];       // {id, x, z, r, ar, interior}
export const parking = [];     // {x, z, ry}
export const sidewalkLoops = []; // pedestrian loops (rect centre lines)
export const ramps = [];       // stunt jumps {x,z,ar,id}
export const lampBulbMat = new THREE.MeshBasicMaterial({ color: 0xd8d8c8 });
export const facadeMats = [];

// ---------- spatial hash for colliders and raised ground ----------
const CELL = 16, hashC = new Map(), hashR = new Map();
const hk = (i, j) => i * 100003 + j;
function hashAdd(map, o, x0, x1, z0, z1) {
  for (let i = Math.floor(x0 / CELL); i <= Math.floor(x1 / CELL); i++) for (let j = Math.floor(z0 / CELL); j <= Math.floor(z1 / CELL); j++) {
    const k = hk(i, j); if (!map.has(k)) map.set(k, []); map.get(k).push(o);
  }
}
let stamp = 1;
export function queryColliders(x, z, r, out = []) {
  out.length = 0; stamp++;
  for (let i = Math.floor((x - r) / CELL); i <= Math.floor((x + r) / CELL); i++) for (let j = Math.floor((z - r) / CELL); j <= Math.floor((z + r) / CELL); j++) {
    const l = hashC.get(hk(i, j)); if (!l) continue;
    for (const o of l) if (o._s !== stamp) { o._s = stamp; out.push(o); }
  }
  return out;
}
const addBox = (x0, x1, z0, z1, h = 20) => { const b = { x0: Math.min(x0, x1), x1: Math.max(x0, x1), z0: Math.min(z0, z1), z1: Math.max(z0, z1), h }; colliders.push(b); hashAdd(hashC, b, b.x0, b.x1, b.z0, b.z1); return b; };
const addCircle = (x, z, r) => { const c = { x, z, r, circle: true }; circles.push(c); hashAdd(hashC, c, x - r, x + r, z - r, z + r); return c; };
const addRaised = (o) => { raised.push(o); if (o.r !== undefined) hashAdd(hashR, o, o.cx - o.r, o.cx + o.r, o.cz - o.r, o.cz + o.r); else hashAdd(hashR, o, o.x0, o.x1, o.z0, o.z1); };
export { addBox, addCircle };

// ---------- materials & textures ----------
const matCache = new Map();
function mat(color, o = {}) {
  const k = color + JSON.stringify(o, (key, v) => (v && v.isTexture ? v.uuid : v));
  if (!matCache.has(k)) matCache.set(k, M(color, o));
  return matCache.get(k);
}
function uvScale(geo, su, sv) { const uv = geo.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * su, uv.getY(i) * sv); return geo; }
const PALETTES = [
  { wall: '#c99a5a', dark: '#a87e44', shut: '#4f7a3a' }, { wall: '#d8c49a', dark: '#b8a274', shut: '#7a4a2a' }, { wall: '#d89a7a', dark: '#b87a5c', shut: '#3a6a8a' },
  { wall: '#a8b0b8', dark: '#8a929a', shut: '#5a5a5a' }, { wall: '#e8dcc0', dark: '#c8b894', shut: '#4a7a5a' }, { wall: '#c8a050', dark: '#a88438', shut: '#6a3a2a' },
  { wall: '#b0603a', dark: '#8a4a2a', shut: '#3a3a3a', brick: true }, { wall: '#9ab0c8', dark: '#7a90a8', shut: '#2a3a5a', glass: true },
];
function facadePair(p, seed) {
  const r = rng(seed); const lit = [];
  const day = canvasTex(128, 128, (g) => {
    g.fillStyle = p.wall; g.fillRect(0, 0, 128, 128);
    if (p.brick) { g.fillStyle = '#9a5030'; for (let y = 0; y < 128; y += 4) for (let x = (y / 4 % 2) * 4; x < 128; x += 8) g.fillRect(x, y, 7, 3); }
    for (let i = 0; i < 260; i++) { g.fillStyle = r() > 0.5 ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)'; g.fillRect(r() * 128 | 0, r() * 128 | 0, 2, 2); }
    for (let cy = 0; cy < 4; cy++) for (let cx = 0; cx < 4; cx++) {
      const x = cx * 32, y = cy * 32;
      if (p.glass) { g.fillStyle = '#3a5a7a'; g.fillRect(x + 2, y + 4, 28, 24); g.fillStyle = '#6a8aaa'; g.fillRect(x + 4, y + 6, 8, 3); g.fillStyle = p.dark; g.fillRect(x, y + 29, 32, 3); lit.push([x + 2, y + 4, 28, 24, r() < 0.45]); continue; }
      if (p.brick) { g.fillStyle = '#b8b0a0'; g.fillRect(x, y + 29, 32, 3); g.fillRect(x, y, 2, 32); } else { g.fillStyle = p.dark; g.fillRect(x, y + 30, 32, 2); }
      g.fillStyle = '#e8e0d0'; g.fillRect(x + 8, y + 6, 16, 19);
      g.fillStyle = r() < 0.5 ? '#2a3a5a' : '#34465e'; g.fillRect(x + 9, y + 7, 14, 17);
      g.fillStyle = '#e8e0d0'; g.fillRect(x + 15, y + 7, 2, 17);
      const sh = r(); g.fillStyle = p.shut; let open = true;
      if (sh < 0.35) { open = false; g.fillRect(x + 9, y + 7, 14, 17); g.fillStyle = 'rgba(0,0,0,0.25)'; for (let k = 0; k < 17; k += 3) g.fillRect(x + 9, y + 7 + k, 14, 1); }
      else if (sh < 0.7) { g.fillRect(x + 3, y + 7, 5, 17); g.fillRect(x + 24, y + 7, 5, 17); g.fillStyle = 'rgba(0,0,0,0.25)'; for (let k = 0; k < 17; k += 3) { g.fillRect(x + 3, y + 7 + k, 5, 1); g.fillRect(x + 24, y + 7 + k, 5, 1); } }
      lit.push([x + 9, y + 7, 14, 17, open && r() < 0.55]);
      if (r() < 0.18) { g.fillStyle = '#e4e4e4'; g.fillRect(x + 10, y + 24, 10, 5); g.fillStyle = '#9a9a9a'; g.fillRect(x + 11, y + 25, 8, 1); g.fillRect(x + 11, y + 27, 8, 1); }
    }
  }, [1, 1]);
  const night = canvasTex(128, 128, (g) => { g.fillStyle = '#000'; g.fillRect(0, 0, 128, 128); for (const [x, y, w, h, on] of lit) if (on) { g.fillStyle = ['#ffd890', '#fff0c0', '#a8d8ff', '#ffc070'][(x + y) % 4]; g.fillRect(x, y, w, h); } }, [1, 1]);
  return { day, night };
}
function shopAtlas() {
  return canvasTex(64, 64, (g) => {
    for (let k = 0; k < 4; k++) {
      const ox = (k % 2) * 32, oy = Math.floor(k / 2) * 32, r = rng(k * 7 + 3), open = k % 2 === 0;
      g.fillStyle = '#5a5248'; g.fillRect(ox, oy, 32, 32);
      if (open) { g.fillStyle = '#2a2018'; g.fillRect(ox + 2, oy + 4, 28, 28); g.fillStyle = '#f0e0a0'; g.fillRect(ox + 2, oy + 4, 28, 2); for (let s = 0; s < 3; s++) { g.fillStyle = '#6a4a2a'; g.fillRect(ox + 3, oy + 10 + s * 7, 26, 1); for (let i = 0; i < 6; i++) { g.fillStyle = ['#d8231b', '#ffd400', '#2f8f3a', '#1f5fd8', '#f0f0f0'][(r() * 5) | 0]; g.fillRect(ox + 4 + i * 4, oy + 6 + s * 7, 3, 4); } } }
      else { g.fillStyle = '#9aa0a6'; g.fillRect(ox + 2, oy + 4, 28, 28); g.fillStyle = '#7a8086'; for (let y = 5; y < 32; y += 2) g.fillRect(ox + 2, oy + y, 28, 1); g.fillStyle = '#4a4e52'; g.fillRect(ox + 14, oy + 28, 4, 2); if (r() < 0.6) { g.fillStyle = 'rgba(20,20,20,0.55)'; g.fillRect(ox + 6, oy + 12, 10, 2); g.fillRect(ox + 8, oy + 15, 14, 2); } }
    }
  });
}
let facadeData, shopMat, roofMat, tileMat, plazaMat, grassMat, sandMat, concrete, railMat, tankMat, dishMat;
const clothCols = [0xd8231b, 0x1f5fd8, 0xffd400, 0xf0f0f0, 0x2f8f3a, 0xec86ad];
function initMaterials() {
  facadeData = PALETTES.map((p, i) => { const { day, night } = facadePair(p, 11 + i * 7); const m = new THREE.MeshLambertMaterial({ map: day, emissiveMap: night, emissive: 0xffffff, emissiveIntensity: 0, flatShading: true }); facadeMats.push(m); return m; });
  shopMat = mat(0xffffff, { map: shopAtlas() });
  roofMat = mat(0xffffff, { map: canvasTex(16, 16, (g) => { g.fillStyle = '#8a8478'; g.fillRect(0, 0, 16, 16); g.fillStyle = '#7a7468'; g.fillRect(0, 8, 16, 1); g.fillStyle = '#9a9488'; g.fillRect(3, 3, 4, 2); }, [1, 1]) });
  tileMat = mat(0xffffff, { map: canvasTex(16, 16, (g) => { g.fillStyle = '#b8ac98'; g.fillRect(0, 0, 16, 16); g.fillStyle = '#9a8e7a'; g.fillRect(0, 7, 16, 1); g.fillRect(7, 0, 1, 16); g.fillStyle = '#c8bca8'; g.fillRect(2, 2, 3, 2); }, [1, 1]) });
  plazaMat = mat(0xffffff, { map: canvasTex(32, 32, (g) => { g.fillStyle = '#c8b48a'; g.fillRect(0, 0, 32, 32); g.fillStyle = '#a8946a'; for (let i = 0; i < 32; i += 8) { g.fillRect(i, 0, 1, 32); g.fillRect(0, i, 32, 1); } g.fillStyle = '#d8c49a'; g.fillRect(3, 3, 3, 3); g.fillRect(19, 19, 3, 3); }, [1, 1]) });
  grassMat = mat(0xffffff, { map: canvasTex(16, 16, (g) => { const r = rng(3); g.fillStyle = '#4f8a3a'; g.fillRect(0, 0, 16, 16); for (let i = 0; i < 40; i++) { g.fillStyle = r() > 0.5 ? '#5f9a46' : '#3f7a2e'; g.fillRect(r() * 16 | 0, r() * 16 | 0, 1, 2); } }, [1, 1]) });
  sandMat = mat(0xffffff, { map: canvasTex(32, 32, (g) => { const r = rng(9); g.fillStyle = '#d8b878'; g.fillRect(0, 0, 32, 32); for (let i = 0; i < 120; i++) { g.fillStyle = r() > 0.5 ? '#e4c488' : '#c8a868'; g.fillRect(r() * 32 | 0, r() * 32 | 0, 2, 1); } }, [1, 1]) });
  concrete = mat(0xb8b0a0); railMat = mat(0x6a5a4a); tankMat = mat(0x2a3a5a); dishMat = mat(0xdcdcdc);
}

// ---------- builders ----------
let S;
function quad(w, h, m, x, y, z, ry = 0, su = 1, sv = 1) { const q = mesh(uvScale(new THREE.PlaneGeometry(w, h), su, sv), m, x, y, z, S); q.rotation.y = ry; return q; }
function shopQuad(w, h, k, x, y, z, ry) {
  const geo = new THREE.PlaneGeometry(w, h); const a = geo.attributes.uv; const ox = (k % 2) * 0.5, oy = Math.floor(k / 2) ? 0 : 0.5;
  for (let i = 0; i < a.count; i++) a.setXY(i, ox + a.getX(i) * 0.5, oy + a.getY(i) * 0.5);
  const q = mesh(geo, shopMat, x, y, z, S); q.rotation.y = ry; return q;
}
function sign(w, h, text, bg, fg, x, y, z, ry, opts = {}) { const q = new THREE.Mesh(signGeo(w, h, text, bg, fg, opts.size), opts.double ? signMatDouble : signMat); q.position.set(x, y, z); q.rotation.y = ry; S.add(q); return q; }

const SHOP_NAMES = ['بقالة الأمل', 'صيدلية الشفاء', 'مكوجي رِجل', 'حلاق النجوم', 'كشري أبو حمادة', 'موبايلات ٣٠٠٠', 'عصير قصب', 'فول وطعمية', 'أدوات منزلية', 'سايبر النجوم', 'مخبز العيش', 'عطارة الهنا', 'خردوات إبراهيم', 'ترزي الأناقة', 'كبدة الحاج', 'لعب أطفال', 'محمصة البن', 'ستوديو تصوير', 'كوافير القمر', 'مطعم السمك', 'مكتبة الطلبة', 'جزارة البركة', 'فطاطري', 'حلواني الحي'];
const SIGN_COLS = [['#1f6fd8', '#ffffff'], ['#d8231b', '#ffe14a'], ['#2f8f3a', '#ffffff'], ['#ffd400', '#1a1a1a'], ['#151518', '#ffd400'], ['#e8e8e8', '#d8231b']];
let shopIx = 0;
const FACE = { S: { ry: 0, n: [0, 1] }, N: { ry: Math.PI, n: [0, -1] }, E: { ry: Math.PI / 2, n: [1, 0] }, W: { ry: -Math.PI / 2, n: [-1, 0] } };

function building(x0, x1, z0, z1, floors, fronts, o = {}) {
  const r = rng(o.seed ?? Math.floor(Math.abs(x0 * 13 + z0 * 7) + 1000));
  const pi = o.pal ?? Math.floor(r() * 7);
  const fm = facadeData[pi], gm = mat(new THREE.Color(PALETTES[pi].dark).getHex()), dk = gm;
  const w = x1 - x0, d = z1 - z0, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
  const G = 3.5, H = G + floors * 3;
  addBox(x0, x1, z0, z1, H - 0.25);
  mapRects.push({ x0, x1, z0, z1, kind: o.kind || 'bld' });
  for (const f of ['S', 'N', 'E', 'W']) {
    const F = FACE[f]; const len = (f === 'S' || f === 'N') ? w : d;
    const px = cx + F.n[0] * (w / 2), pz = cz + F.n[1] * (d / 2);
    quad(len, H - G, fm, px, G + (H - G) / 2, pz, F.ry, len / 12, floors / 4);
    if (!fronts.includes(f) || o.noShops) { quad(len, G, gm, px, G / 2, pz, F.ry); continue; }
    const n = Math.max(1, Math.round(len / 4.5)); const sw = len / n;
    const along = (off) => [px + ((f === 'S' || f === 'N') ? off * (f === 'S' ? 1 : -1) : 0), pz + ((f === 'E' || f === 'W') ? off * (f === 'W' ? 1 : -1) : 0)];
    for (let i = 0; i < n; i++) {
      const [sx, sz] = along(-len / 2 + sw * (i + 0.5));
      shopQuad(sw - 0.3, 2.6, Math.floor(r() * 4), sx + F.n[0] * 0.01, 1.3, sz + F.n[1] * 0.01, F.ry);
      const [ex, ez] = along(-len / 2 + sw * (i + 1)); const pil = mesh(box(0.3, G, 0.12), gm, ex + F.n[0] * 0.02, G / 2, ez + F.n[1] * 0.02, S); pil.rotation.y = F.ry;
      if (r() < 0.75) { const name = o.signs?.[i] ?? SHOP_NAMES[shopIx++ % SHOP_NAMES.length]; const [bg, fg] = SIGN_COLS[(shopIx * 5 + i) % SIGN_COLS.length]; sign(sw - 0.5, 0.75, name, bg, fg, sx + F.n[0] * 0.06, 3.0, sz + F.n[1] * 0.06, F.ry); }
      if (r() < 0.4) { const a = mesh(box(sw - 0.4, 0.06, 0.9), mat(clothCols[Math.floor(r() * clothCols.length)]), sx + F.n[0] * 0.45, 2.75, sz + F.n[1] * 0.45, S); a.rotation.y = F.ry; a.rotateX(0.25); }
    }
    quad(len, G - 2.6, gm, px, 2.6 + (G - 2.6) / 2, pz, F.ry);
    if (o.lite || PALETTES[pi].glass) continue;
    const cols = Math.max(1, Math.round(len / 3));
    for (let fl = 1; fl <= floors; fl++) for (let c = 0; c < cols; c++) {
      if ((c + fl) % 2 && r() < 0.6) continue;
      if (r() < (o.balc ?? 0.15)) continue;
      const off = -len / 2 + (len / cols) * (c + 0.5);
      const bx = px + ((f === 'S' || f === 'N') ? off : 0) + F.n[0] * 0.45, bz = pz + ((f === 'E' || f === 'W') ? off : 0) + F.n[1] * 0.45;
      const g = new THREE.Group(); g.position.set(bx, G + (fl - 1) * 3, bz); g.rotation.y = F.ry; S.add(g);
      mesh(box(2.3, 0.16, 0.9), concrete, 0, 0, 0, g);
      mesh(box(2.3, 0.9, 0.08), dk, 0, 0.5, 0.42, g);
      for (const s of [-1, 1]) mesh(box(0.08, 0.9, 0.9), dk, s * 1.11, 0.5, 0, g);
      const rr = r();
      if (rr < 0.25) { mesh(box(2.1, 0.02, 0.02), railMat, 0, 1.35, 0.4, g); for (let k = 0; k < 4; k++) mesh(box(0.35, 0.5, 0.02), mat(clothCols[Math.floor(r() * clothCols.length)]), -0.75 + k * 0.5, 1.08, 0.42, g); }
      else if (rr < 0.38) { const dsh = mesh(new THREE.SphereGeometry(0.35, 8, 4, 0, Math.PI * 2, 0, Math.PI * 0.35), dishMat, 0.6, 1.25, 0.3, g); dsh.rotation.x = Math.PI / 2 + 0.5; }
      else if (rr < 0.5) { mesh(cyl(0.14, 0.1, 0.22, 6), mat(0xb8542a), -0.7, 1.05, 0.4, g); mesh(new THREE.IcosahedronGeometry(0.2, 0), mat(0x2f8f3a), -0.7, 1.3, 0.4, g); }
    }
  }
  const roof = mesh(uvScale(new THREE.PlaneGeometry(w, d), w / 3, d / 3), roofMat, cx, H, cz, S); roof.rotation.x = -Math.PI / 2;
  mesh(box(w, 0.8, 0.2), dk, cx, H + 0.4, z0 + 0.1, S); mesh(box(w, 0.8, 0.2), dk, cx, H + 0.4, z1 - 0.1, S);
  mesh(box(0.2, 0.8, d), dk, x0 + 0.1, H + 0.4, cz, S); mesh(box(0.2, 0.8, d), dk, x1 - 0.1, H + 0.4, cz, S);
  if (!o.lite) {
    const nt = 1 + Math.floor(r() * 2); for (let i = 0; i < nt; i++) mesh(cyl(0.6, 0.6, 1.2, 8), tankMat, x0 + 1.2 + r() * (w - 2.4), H + 1.4, z0 + 1.2 + r() * (d - 2.4), S);
    const nd = 1 + Math.floor(r() * 3);
    for (let i = 0; i < nd; i++) { const dx = x0 + 1 + r() * (w - 2), dz = z0 + 1 + r() * (d - 2); mesh(cyl(0.04, 0.04, 1.0, 4), railMat, dx, H + 0.5, dz, S); const dsh = mesh(new THREE.SphereGeometry(0.55, 8, 4, 0, Math.PI * 2, 0, Math.PI * 0.35), dishMat, dx, H + 1.1, dz, S); dsh.rotation.set(Math.PI / 2 + 0.6, r() * 6, 0); }
    if (r() < 0.3) mesh(box(2.2, 2.0, 2.0), mat(0xd8d0b8), x0 + 1.6, H + 1, z1 - 1.6, S);
    if (PALETTES[pi].brick && r() < 0.6) for (let i = 0; i < 6; i++) mesh(box(0.06, 1.4, 0.06), mat(0x6a4a3a), x0 + 0.4 + (i % 3) * (w - 0.8) / 2, H + 0.9, i < 3 ? z0 + 0.3 : z1 - 0.3, S);
  }
  return { H, cx, cz, pal: pi };
}
function sidewalk(x0, x1, z0, z1) {
  const w = x1 - x0, d = z1 - z0;
  mesh(uvScale(new THREE.BoxGeometry(w, 0.12, d), w / 1.5, d / 1.5), tileMat, (x0 + x1) / 2, 0.06, (z0 + z1) / 2, S);
  addRaised({ x0, x1, z0, z1, y: 0.12 });
}
function lamp(x, z, ry) {
  mesh(cyl(0.07, 0.1, 5.2, 6), mat(0x3a3a3e), x, 2.6, z, S);
  const arm = new THREE.Group(); arm.position.set(x, 5.1, z); arm.rotation.y = ry; S.add(arm);
  mesh(box(1.2, 0.08, 0.08), mat(0x3a3a3e), 0.6, 0, 0, arm); mesh(box(0.45, 0.14, 0.25), mat(0x3a3a3e), 1.2, -0.05, 0, arm);
  mesh(box(0.38, 0.03, 0.2), lampBulbMat, 1.2, -0.13, 0, arm);
  addCircle(x, z, 0.18);
}
function tree(x, z, s = 1) {
  mesh(cyl(0.12 * s, 0.18 * s, 2.2 * s, 6), mat(0x6a4a2a), x, 1.1 * s, z, S);
  const r = rng(Math.floor(Math.abs(x * 31 + z * 17) + 999));
  for (let i = 0; i < 4; i++) mesh(new THREE.IcosahedronGeometry((0.8 + r() * 0.4) * s, 0), mat(i % 2 ? 0x3f7a2e : 0x4f8a3a), x + (r() - 0.5) * 1.2 * s, (2.6 + r() * 0.8) * s, z + (r() - 0.5) * 1.2 * s, S);
  const c = addCircle(x, z, 0.25 * s); c.canopy = 1.3 * s; c.top = 3.8 * s; c.bottom = 1.8 * s;
}
function palm(x, z, h = 6) {
  for (let i = 0; i < 6; i++) { const seg = mesh(cyl(0.16, 0.2, h / 6 + 0.05, 6), mat(i % 2 ? 0x7a5a32 : 0x6a4a2a), x + Math.sin(i * 0.3) * 0.08 * i, h / 12 + i * h / 6, z, S); seg.rotation.z = 0.03 * i; }
  const top = new THREE.Group(); top.position.set(x + 0.4, h, z); S.add(top);
  for (let i = 0; i < 8; i++) { const fr = mesh(new THREE.ConeGeometry(0.28, 2.6, 4), mat(i % 2 ? 0x2f7a2a : 0x3f8a32), 0, 0, 0, top); fr.rotation.set(0, i * Math.PI / 4, 0); fr.rotateZ(Math.PI / 2 + 0.5); fr.translateY(1.2); }
  const c = addCircle(x, z, 0.25); c.canopy = 1.8; c.top = h + 1; c.bottom = h - 1;
}
const triGeo = (() => { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute([-0.18, 0, 0, 0.18, 0, 0, 0, -0.4, 0], 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute([0, 0, 1, 0, 0, 1, 0, 0, 1], 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute([0, 1, 1, 1, 0.5, 0], 2)); return g; })();
let flagMats;
function bunting(ax, az, bx, bz, y = 5.4) {
  const len = Math.hypot(bx - ax, bz - az); const n = Math.floor(len / 0.5);
  for (let i = 0; i <= n; i++) { const k = i / n; const t = mesh(triGeo, flagMats[i % flagMats.length], ax + (bx - ax) * k, y - Math.sin(k * Math.PI) * 0.8, az + (bz - az) * k, S); t.rotation.y = Math.atan2(-(bz - az), bx - ax); }
}
function stall(x, z, ry, fruit, awning) {
  const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; S.add(g);
  mesh(box(2.6, 0.1, 1.3), mat(0x8a5a2b), 0, 0.85, 0, g);
  for (const [lx, lz] of [[-1.2, 0.55], [1.2, 0.55], [-1.2, -0.55], [1.2, -0.55]]) mesh(box(0.08, 0.85, 0.08), mat(0x6a4220), lx, 0.42, lz, g);
  for (const [lx, lz] of [[-1.25, 0.6], [1.25, 0.6], [-1.25, -0.6], [1.25, -0.6]]) mesh(box(0.06, 2.4, 0.06), mat(0x6a4220), lx, 1.2, lz, g);
  const aw = mesh(box(2.9, 0.06, 1.7), mat(awning), 0, 2.45, 0, g); aw.rotation.x = 0.12;
  const r = rng(Math.floor(Math.abs(x * 7 + z * 3) + 77));
  for (let i = 0; i < 14; i++) { const f = fruit[i % fruit.length]; const s = mesh(new THREE.IcosahedronGeometry(f.r, 0), mat(f.c), -1.0 + (i % 7) * 0.33, 1.0 + f.r * 0.6 + (i >= 7 ? f.r * 0.9 : 0), (i >= 7 ? 0 : 0.25) - 0.1 + (r() - 0.5) * 0.1, g); if (f.sx) s.scale.set(f.sx, 1, 1); }
  for (let i = 0; i < 3; i++) mesh(box(0.6, 0.4, 0.45), mat(0xb08850), -0.8 + i * 0.8, 0.2, -0.95, g);
  const c = Math.abs(Math.cos(ry)) > 0.5; const hw = c ? 1.4 : 0.75, hd = c ? 0.75 : 1.4;
  addBox(x - hw, x + hw, z - hd, z + hd, 3.3);
  mapRects.push({ x0: x - hw, x1: x + hw, z0: z - hd, z1: z + hd, kind: 'stall' });
  return g;
}
function ramp(x, z, ry, len = 8, h = 2.2, w = 5, id, ar) {
  // a wooden ramp rising toward its local +x
  const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; S.add(g);
  const geo = new THREE.BufferGeometry();
  const L = len, Wd = w / 2;
  const v = [[-L / 2, 0, -Wd], [L / 2, 0, -Wd], [L / 2, h, -Wd], [-L / 2, 0, Wd], [L / 2, 0, Wd], [L / 2, h, Wd]];
  const tris = [[0, 2, 1], [3, 4, 5], [0, 3, 5], [0, 5, 2], [1, 2, 5], [1, 5, 4]];
  const pos = []; for (const t of tris) for (const i of t) pos.push(...v[i]);
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.computeVertexNormals();
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(new Float32Array(pos.length / 3 * 2), 2));
  mesh(geo, mat(0xa87a48, { side: THREE.DoubleSide }), 0, 0, 0, g);
  for (let i = 0; i < 5; i++) { const s = mesh(box(L / 5 * 1.02, 0.04, w), mat(i % 2 ? 0xffd400 : 0x222222), -L / 2 + L / 10 + i * L / 5, h * (0.1 + i * 0.2) + 0.03, 0, g); s.rotation.z = Math.atan2(h, L); }
  const c = Math.round(Math.cos(ry)), s2 = Math.round(Math.sin(ry));
  const axis = c !== 0 ? 'x' : 'z'; const sgn = c !== 0 ? c : -s2;
  const hw = axis === 'x' ? L / 2 : Wd, hd = axis === 'x' ? Wd : L / 2;
  addRaised({ x0: x - hw, x1: x + hw, z0: z - hd, z1: z + hd, ramp: true, axis, sgn, y0: 0, y1: h, cx: x, cz: z, L });
  if (id) ramps.push({ id, x: x + (axis === 'x' ? sgn * L / 2 : 0), z: z + (axis === 'z' ? sgn * L / 2 : 0), ar, h });
  mapRects.push({ x0: x - hw, x1: x + hw, z0: z - hd, z1: z + hd, kind: 'ramp' });
}

// ---------- bake: merge everything into chunks of 40×40 (by mesh centre), one mesh per material per chunk ----------
const chunks = [];
function bake(root, scene) {
  root.updateMatrixWorld(true);
  const groups = new Map(); const v = new THREE.Vector3();
  root.traverse(o => {
    if (!o.isMesh) return;
    if (!o.geometry.boundingSphere) o.geometry.computeBoundingSphere();
    v.copy(o.geometry.boundingSphere.center).applyMatrix4(o.matrixWorld);
    const big = o.geometry.boundingSphere.radius * o.matrixWorld.getMaxScaleOnAxis() > 50;
    const ck = big ? 'big' : Math.floor(v.x / 80) + ',' + Math.floor(v.z / 80);
    if (!groups.has(ck)) groups.set(ck, new Map());
    const plain = isPlain(o.material);
    const mk = plain ? (o.material.side === THREE.DoubleSide ? 'vcd' : 'vc') : o.material.uuid;
    const b = groups.get(ck); if (!b.has(mk)) b.set(mk, { mat: plain ? vcMat(o.material.side === THREE.DoubleSide) : o.material, geos: [] });
    b.get(mk).geos.push(plainGeo(o.geometry, o.matrixWorld, plain ? o.material.color : null));
  });
  let calls = 0;
  for (const [ck, b] of groups) {
    const g = new THREE.Group(); g.name = 'chunk ' + ck;
    for (const { mat: m, geos } of b.values()) { const me = new THREE.Mesh(mergeGeometries(geos, false), m); me.matrixAutoUpdate = false; g.add(me); calls++; }
    scene.add(g);
    if (ck === 'big') continue;
    const [i, j] = ck.split(',').map(Number);
    chunks.push({ g, x: i * 80 + 40, z: j * 80 + 40 });
  }
  return { drawCalls: calls, chunks: chunks.length };
}
export function cullChunks(px, pz, far) {
  const f2 = (far + 57) * (far + 57);
  for (const c of chunks) c.g.visible = (c.x - px) ** 2 + (c.z - pz) ** 2 < f2;
}

// =====================================================================
export function buildWorld(scene) {
  initMaterials();
  flagMats = [0xd8231b, 0xffd400, 0x2f8f3a, 0x1f5fd8, 0xf0f0f0, 0xec86ad].map(c => mat(c, { side: THREE.DoubleSide }));
  S = new THREE.Group();
  const dyn = {};

  // ---- sky, skyline, pyramids (not fogged) ----
  const skyTex = canvasTex(4, 64, (g) => { const gr = g.createLinearGradient(0, 0, 0, 64); gr.addColorStop(0, '#5fa0d8'); gr.addColorStop(0.55, '#a8cce8'); gr.addColorStop(1, '#f0dcb0'); g.fillStyle = gr; g.fillRect(0, 0, 4, 64); });
  dyn.sky = new THREE.Mesh(new THREE.SphereGeometry(1400, 16, 10), new THREE.MeshBasicMaterial({ map: skyTex, side: THREE.BackSide, fog: false, depthWrite: false }));
  scene.add(dyn.sky);
  const skyline = canvasTex(512, 64, (g) => {
    const r = rng(21); g.clearRect(0, 0, 512, 64);
    for (let x = 0; x < 512; x += 6 + (r() * 8 | 0)) { const h = 14 + r() * 34 | 0; const w = 6 + r() * 12 | 0; g.fillStyle = ['#b8a890', '#a89880', '#c8b8a0'][(r() * 3) | 0]; g.fillRect(x, 64 - h, w, h); g.fillStyle = 'rgba(60,60,80,0.35)'; for (let k = 0; k < 6; k++) g.fillRect(x + 1 + (r() * (w - 2) | 0), 64 - h + 2 + (r() * (h - 4) | 0), 2, 2); }
    for (const mx of [80, 260, 430]) { g.fillStyle = '#a89880'; g.fillRect(mx, 6, 4, 58); g.fillRect(mx - 2, 14, 8, 3); g.beginPath(); g.moveTo(mx - 1, 6); g.lineTo(mx + 2, 0); g.lineTo(mx + 5, 6); g.fill(); g.beginPath(); g.arc(mx + 22, 50, 14, Math.PI, 0); g.fill(); }
  });
  skyline.wrapS = THREE.RepeatWrapping; skyline.repeat.set(4, 1);
  dyn.skyline = new THREE.Mesh(new THREE.CylinderGeometry(520, 520, 70, 32, 1, true), new THREE.MeshBasicMaterial({ map: skyline, side: THREE.BackSide, transparent: true, fog: false, depthWrite: false }));
  dyn.skyline.position.y = 18; scene.add(dyn.skyline);
  { const pm = new THREE.MeshLambertMaterial({ color: 0xd8b070, flatShading: true, fog: false });
    const pg = new THREE.Group(); scene.add(pg); dyn.pyramids = pg;
    for (const [x, z, s] of [[-260, 1150, 210], [-20, 1250, 230], [190, 1120, 150]]) { const p = new THREE.Mesh(new THREE.ConeGeometry(s * 0.78, s * 0.95, 4), pm); p.position.set(x, s * 0.47 - 20, z); p.rotation.y = Math.PI / 4; pg.add(p); }
  }

  // ---- ground ----
  const asphalt = canvasTex(64, 64, (g) => { const r = rng(7); g.fillStyle = '#4a4a4e'; g.fillRect(0, 0, 64, 64); for (let i = 0; i < 500; i++) { const v = 60 + r() * 30 | 0; g.fillStyle = `rgb(${v},${v},${v + 4})`; g.fillRect(r() * 64 | 0, r() * 64 | 0, 1, 1); } g.fillStyle = '#3a3a3e'; g.fillRect(10, 30, 14, 2); g.fillRect(40, 8, 2, 10); }, [1, 1]);
  const city = mesh(uvScale(new THREE.PlaneGeometry(292, 340), 146, 170), mat(0xffffff, { map: asphalt }), -20, 0, 0, S); city.rotation.x = -Math.PI / 2;
  // sand all around the city (never under it, so the two planes don't flicker)
  for (const [x0, x1, z0, z1] of [[-1200, 126, 170, 1200], [-1200, -166, -1200, 170], [-166, 126, -1200, -170], [420, 1200, -1200, 1200]]) {
    const sd = mesh(uvScale(new THREE.PlaneGeometry(x1 - x0, z1 - z0), (x1 - x0) / 5, (z1 - z0) / 5), sandMat, (x0 + x1) / 2, -0.04, (z0 + z1) / 2, S); sd.rotation.x = -Math.PI / 2;
  }
  const bed = mesh(new THREE.PlaneGeometry(300, 1400), mat(0x3a4a3a), 273, -3, 100, S); bed.rotation.x = -Math.PI / 2;
  dyn.water = new THREE.Mesh(new THREE.PlaneGeometry(300, 1400, 1, 1), new THREE.MeshLambertMaterial({ color: 0x3a7aa8, transparent: true, opacity: 0.85 }));
  dyn.water.rotation.x = -Math.PI / 2; dyn.water.position.set(273, -1.2, 100); scene.add(dyn.water);
  for (const [a, b] of [[-700, -5.5], [5.5, 700]]) { mesh(box(1, 3.2, b - a), concrete, RIVER.x0 - 0.5, -1.5, (a + b) / 2, S); addBox(RIVER.x0 - 0.6, RIVER.x0, a, b, 1.2); }
  for (let z = -170; z < 170; z += 2.5) if (Math.abs(z) > 7) mesh(box(0.08, 1.0, 0.08), mat(0x2a6a5a), RIVER.x0 - 0.3, 0.5, z, S);
  for (const [a, b] of [[-170, -5.5], [5.5, 170]]) mesh(box(0.08, 0.08, b - a), mat(0x2a6a5a), RIVER.x0 - 0.3, 1.0, (a + b) / 2, S);

  // ---- road markings ----
  const dash = mat(0xf0f0e0);
  for (const x of XR) for (let z = -158; z <= 158; z += 3) { if (ZR.some(zz => Math.abs(z - zz) < 6.5)) continue; mesh(box(0.15, 0.01, 1.4), dash, x, 0.012, z, S); }
  for (const z of ZR) for (let x = -158; x <= 118; x += 3) { if (XR.some(xx => Math.abs(x - xx) < 6.5)) continue; mesh(box(1.4, 0.01, 0.15), dash, x, 0.012, z, S); }
  for (const x of XR) for (const z of ZR) {
    if (x === 0 && z === 0) continue;
    for (let i = -3; i <= 3; i++) { if (z > -160) mesh(box(0.5, 0.012, 2.0), dash, x + i * 1.1, 0.013, z - 6.4, S); if (x < 120) mesh(box(2.0, 0.012, 0.5), dash, x + 6.4, 0.013, z + i * 1.1, S); }
  }

  // ---- the roundabout ----
  mesh(new THREE.CylinderGeometry(4, 4.1, 0.3, 16), mat(0xb8b0a0), 0, 0.15, 0, S);
  { const gr = mesh(uvScale(new THREE.CircleGeometry(3.7, 16), 4, 4), grassMat, 0, 0.31, 0, S); gr.rotation.x = -Math.PI / 2; }
  addRaised({ cx: 0, cz: 0, r: 4, y: 0.3 });
  mesh(cyl(1.1, 1.2, 0.5, 12), mat(0xd8d0c0), 0, 0.55, 0, S);
  mesh(new THREE.CircleGeometry(1.0, 12), new THREE.MeshBasicMaterial({ color: 0x4aa8ff }), 0, 0.81, 0, S).rotation.x = -Math.PI / 2;
  mesh(cyl(0.12, 0.18, 1.4, 6), mat(0xd8d0c0), 0, 1.4, 0, S); mesh(cyl(0.5, 0.2, 0.15, 10), mat(0xd8d0c0), 0, 2.1, 0, S);
  addCircle(0, 0, 1.3);
  for (let i = 0; i < 4; i++) palm(Math.cos(i * Math.PI / 2 + 0.78) * 2.6, Math.sin(i * Math.PI / 2 + 0.78) * 2.6, 6 + (i % 2));
  zones.push({ id: 'midan', ar: 'الميدان', en: 'THE ROUNDABOUT', x: 0, z: 0, r: 6 });

  // ---- blocks ----
  function lots(bx0, bz0, skip, seed, o = {}) {
    const r = rng(seed);
    for (let row = 0; row < 3; row++) for (let col = 0; col < 3; col++) {
      if (skip.some(([c2, r2]) => c2 === col && r2 === row)) continue;
      const x0 = bx0 + 1.5 + col * 9, z0 = bz0 + 1.5 + row * 9;
      const fronts = []; if (row === 0) fronts.push('N'); if (row === 2) fronts.push('S'); if (col === 0) fronts.push('W'); if (col === 2) fronts.push('E');
      const inner = row === 1 && col === 1;
      const [f0, f1] = o.floors ?? [3, 7];
      const floors = inner ? f1 - 1 : f0 + Math.floor(r() * (f1 - f0 + 1));
      building(x0, x0 + 9, z0, z0 + 9, floors, inner ? [] : fronts, { seed: seed * 10 + row * 3 + col, pal: o.pals ? o.pals[Math.floor(r() * o.pals.length)] : undefined, lite: inner || o.lite, balc: o.balc });
    }
  }
  function blockFrame(bx0, bz0) {
    const bx1 = bx0 + 30, bz1 = bz0 + 30;
    sidewalk(bx0, bx1, bz0, bz0 + 1.5); sidewalk(bx0, bx1, bz1 - 1.5, bz1); sidewalk(bx0, bx0 + 1.5, bz0 + 1.5, bz1 - 1.5); sidewalk(bx1 - 1.5, bx1, bz0 + 1.5, bz1 - 1.5);
    sidewalkLoops.push({ x0: bx0 + 0.75, x1: bx1 - 0.75, z0: bz0 + 0.75, z1: bz1 - 0.75 });
    const r = rng(Math.floor(Math.abs(bx0 * 3 + bz0 * 11)) + 5);
    for (const t of [8, 22]) { lamp(bx0 + t, bz0 + 0.7, Math.PI / 2); lamp(bx0 + t, bz1 - 0.7, -Math.PI / 2); lamp(bx0 + 0.7, bz0 + t, Math.PI); lamp(bx1 - 0.7, bz0 + t, 0); }
    if (r() < 0.7) tree(bx0 + 15, bz1 - 0.75); if (r() < 0.5) tree(bx1 - 0.75, bz0 + 15);
    for (const t of [4, 26]) {
      if (r() < 0.55) parking.push({ x: bx0 + t, z: bz0 - 0.4, ry: Math.PI });
      if (r() < 0.55) parking.push({ x: bx0 + t, z: bz1 + 0.4, ry: 0 });
      if (r() < 0.45) parking.push({ x: bx0 - 0.4, z: bz0 + t, ry: Math.PI / 2 });
      if (r() < 0.45) parking.push({ x: bx1 + 0.4, z: bz0 + t, ry: -Math.PI / 2 });
    }
  }
  for (let i = 0; i < XR.length - 1; i++) for (let j = 0; j < ZR.length - 1; j++) {
    const bx0 = XR[i] + 5, bz0 = ZR[j] + 5, cx = bx0 + 15, cz = bz0 + 15;
    blockFrame(bx0, bz0);
    const seed = 100 + i * 17 + j * 31;
    if (Math.abs(cx) < 40 && Math.abs(cz) < 40) continue;
    if (bx0 === -115 && bz0 === -35) { scrapyard(bx0, bz0); continue; }
    if (bx0 === -155 && bz0 === 45) { iceFactory(bx0, bz0); continue; }
    if (bx0 === -35 && bz0 === -115) { mall(bx0, bz0); continue; }
    if (bx0 === 5 && bz0 === -115) { gasStation(bx0, bz0); lots(bx0, bz0, [[0, 0], [0, 1], [0, 2]], seed, { floors: [6, 10] }); continue; }
    if (bx0 === 45 && bz0 === 45) { park(bx0, bz0); continue; }
    if (bx0 === 45 && bz0 === -75) { school(bx0, bz0); continue; }
    if (bz0 <= -115) lots(bx0, bz0, [], seed, { floors: [6, 11], balc: 0.4 });
    else if (bx0 <= -115) warehouses(bx0, bz0, seed);
    else if (bx0 === 85) lots(bx0, bz0, [], seed, { floors: [6, 10], pals: [3, 4, 7, 0] });
    else if (bz0 === 125) lots(bx0, bz0, [], seed, { floors: [2, 4], pals: [6, 6, 6, 1, 5] });
    else lots(bx0, bz0, [], seed);
  }
  zones.push({ id: 'downtown', ar: 'وسط البلد', en: 'DOWNTOWN', x: -20, z: -135, r: 24 });
  zones.push({ id: 'industrial', ar: 'المنطقة الصناعية', en: 'INDUSTRIAL AREA', x: -140, z: 60, r: 26 });
  zones.push({ id: 'corniche', ar: 'الكورنيش', en: 'THE CORNICHE', x: 122, z: -60, r: 10 });

  hood(lots);

  for (let a = -178; a < 126; a += 12) building(a, a + 12, -178, -166, 8 + (((a + 178) / 12) & 3), ['S'], { seed: 900 + a, lite: true, noShops: true });
  for (let a = -166; a < 166; a += 12) building(-178, -166, a, a + 12, 7 + (((a + 166) / 12) & 3), ['E'], { seed: 1900 + a, lite: true, noShops: true });
  addBox(-220, 140, -230, -178, 99); addBox(-230, -178, -230, 640, 99);

  bridgeAndIsland();
  desert();

  const stats = bake(S, scene);

  const samirCar = makeSamirCar(scene, 1.2); samirCar.late && samirCar.late();
  const tuk = makeTuk(scene);
  dyn.feluccas = [];
  for (let i = 0; i < 6; i++) { const f = felucca(); scene.add(f); dyn.feluccas.push({ g: f, z: -150 + i * 60, x: i % 2 ? 160 : 320, v: 1.5 + (i % 3) * 0.5 }); }
  Object.assign(spawns, {
    dad: { x: 15.5, z: -2.2, ry: Math.PI }, mom: { x: 9.2, z: -5.8, ry: 0.3 }, son: { x: 5.8, z: -9.5, ry: -Math.PI / 2 },
    samir: { x: 22.6, z: -5.8, ry: -0.4 }, sayed: { x: 12.4, z: -6.0, ry: 0.2 }, hooda: { x: -5.7, z: 11.6, ry: Math.PI / 2 },
    shehata: { x: -11, z: 10, ry: Math.PI }, bastam: { x: -18.5, z: -7.8, ry: 0.2 }, alamy: { x: -11, z: -11.6, ry: Math.PI * 0.95 },
    asly: { x: -8.6, z: -8.6, ry: -0.6 }, gazzar: { x: -21, z: -9.6, ry: Math.PI }, nashwa: { x: 34.2, z: 26.4, ry: Math.PI / 2 },
  });
  return { stats, samirCar, tuk, dyn };
}

// ---------------------------------------------------------------------
function hood(lots) {
  lots(5, -35, [[0, 2], [1, 2]], 3);
  const home = building(6.5, 15.5, -15.5, -6.5, 5, ['S', 'W'], { pal: 0, seed: 77, noShops: true, kind: 'home' });
  building(15.5, 24.5, -15.5, -6.5, 4, ['S'], { pal: 1, seed: 78, signs: ['بقالة الأمل', 'خردوات إبراهيم'] });
  mesh(new THREE.PlaneGeometry(1.6, 2.6), mat(0x2a1e14), 11, 1.3, -6.48, S);
  mesh(box(2.2, 0.15, 0.6), concrete, 11, 2.75, -6.2, S);
  sign(2.4, 0.6, 'عمارة أم حمادة', '#1f9e5a', '#ffffff', 11, 3.25, -6.47, 0);
  mesh(box(0.55, 0.06, 0.55), mat(0x8a5a2b), 13.1, 0.62, -7.0, S); for (const [a, b] of [[-0.22, -0.22], [0.22, -0.22], [-0.22, 0.22], [0.22, 0.22]]) mesh(box(0.05, 0.5, 0.05), mat(0x6a4220), 13.1 + a, 0.37, -7.0 + b, S);
  mesh(box(0.55, 0.6, 0.06), mat(0x8a5a2b), 13.1, 0.95, -7.25, S);
  addBox(12.8, 13.4, -7.3, -6.7, 1);
  for (let i = 0; i < 4; i++) mesh(box(0.6, 0.45, 0.5), mat([0x8a5a2b, 0x4a6a8a, 0x8a3a2a, 0x6a6a6a][i]), 7.6 + (i % 2) * 0.65, 0.35 + Math.floor(i / 2) * 0.46, -7.3, S);
  { const d = mesh(new THREE.SphereGeometry(0.7, 10, 5, 0, Math.PI * 2, 0, Math.PI * 0.35), dishMat, 8.2, 1.6, -7.2, S); d.rotation.x = Math.PI / 2 - 0.4; }
  addBox(7.2, 9.0, -7.6, -6.6, 1.4);
  doors.push({ id: 'home', x: 11, z: -5.7, r: 1.3, ar: 'ادخل البيت', interior: 'apartment' });
  doors.push({ id: 'grocery', x: 17.8, z: -5.7, r: 1.2, ar: 'ادخل البقالة', interior: 'grocery' });
  { const H = home.H; addRaised({ x0: 6.5, x1: 15.5, z0: -15.5, z1: -6.5, y: H, roof: true });
    for (const [a, b, c2, d] of [[6.3, 6.7, -15.7, -6.3], [15.3, 15.7, -15.7, -6.3], [6.3, 15.7, -15.7, -15.3], [6.3, 15.7, -6.7, -6.3]]) addBox(a, b, c2, d, H + 1.2);
    mesh(box(2.4, 0.1, 1.0), mat(0x8a5a2b), 9, H + 0.95, -9, S); for (const [a, b] of [[-1.1, -0.4], [1.1, -0.4], [-1.1, 0.4], [1.1, 0.4]]) mesh(box(0.08, 0.95, 0.08), mat(0x6a4220), 9 + a, H + 0.47, -9 + b, S);
    addBox(7.8, 10.2, -9.5, -8.5, H + 1);
    for (let i = 0; i < 5; i++) mesh(box(0.3, 0.25, 0.3), mat([0xd8231b, 0xffd400, 0x2f5fb0, 0x6a6a6a, 0x2f8f3a][i]), 8.1 + i * 0.45, H + 1.13, -9, S);
    const big = mesh(new THREE.SphereGeometry(1.3, 12, 6, 0, Math.PI * 2, 0, Math.PI * 0.35), dishMat, 13.5, H + 1.6, -12.5, S); big.rotation.x = Math.PI / 2 - 0.6; mesh(cyl(0.06, 0.06, 1.4, 5), railMat, 13.5, H + 0.7, -12.5, S); addCircle(13.5, -12.5, 0.6);
    mesh(box(1.0, 1.2, 0.8), mat(0x3a5a3a), 8, H + 0.6, -14, S); mesh(cyl(0.1, 0.1, 0.8, 6), mat(0x222222), 8, H + 1.5, -14, S); addBox(7.4, 8.6, -14.5, -13.5, H + 1.2);
    mesh(box(1.6, 2.4, 1.6), mat(0xd8d0b8), 14.6, H + 1.2, -7.4, S); mesh(new THREE.PlaneGeometry(0.9, 1.9), mat(0x3a2a1a), 14.6, H + 0.95, -6.59, S);
    addBox(13.8, 15.4, -8.2, -6.6, H + 2.4);
    doors.push({ id: 'roofdoor', x: 13.2, z: -7.6, y: H, r: 1.0, ar: 'انزل الشقة', interior: 'apartment', spawn: 'stairs' });
    zones.push({ id: 'roof', ar: 'ورشة إبراهيم - السطح', en: "IBRAHIM'S ROOF WORKSHOP", x: 11, z: -11, r: 4.5, y: H });
  }
  zones.push({ id: 'home', ar: 'عمارة أم حمادة', en: "OM HAMADA'S BUILDING", x: 11, z: -4, r: 5.5 });
  bunting(5, -12, -5, -12); bunting(5, -22, -5, -22); bunting(14, -5, 14, 5, 5.6);

  lots(-35, -35, [[1, 2], [2, 2]], 5);
  { const x0 = -24.5, x1 = -6.5, z0 = -15.5, z1 = -6.5, H = 6.5;
    const wallM = mat(0xd8d8d0), blue = mat(0x2f5fb0);
    mesh(box(x1 - x0, H, 0.3), wallM, (x0 + x1) / 2, H / 2, z0 + 0.15, S); addBox(x0, x1, z0, z0 + 0.3, H);
    mesh(box(0.3, H, z1 - z0), wallM, x0 + 0.15, H / 2, (z0 + z1) / 2, S); addBox(x0, x0 + 0.3, z0, z1, H);
    mesh(box(0.3, H, z1 - z0), wallM, x1 - 0.15, H / 2, (z0 + z1) / 2, S); addBox(x1 - 0.3, x1, z0, z1, H);
    mesh(box(x1 - x0, 0.3, z1 - z0), mat(0x9a9a92), (x0 + x1) / 2, H, (z0 + z1) / 2, S);
    mesh(box(x1 - x0, 1.4, 0.3), blue, (x0 + x1) / 2, H - 0.7, z1 - 0.15, S);
    sign(9, 1.2, 'مركز الصيانة', '#2f5fb0', '#ffffff', (x0 + x1) / 2, H - 0.7, z1 + 0.02, 0);
    mesh(box(0.25, H - 1.4, 0.3), blue, (x0 + x1) / 2, (H - 1.4) / 2, z1 - 0.15, S); addBox((x0 + x1) / 2 - 0.15, (x0 + x1) / 2 + 0.15, z1 - 0.3, z1, H);
    const fl = mesh(uvScale(new THREE.PlaneGeometry(x1 - x0, z1 - z0), 6, 3), mat(0x8a8a86), (x0 + x1) / 2, 0.02, (z0 + z1) / 2, S); fl.rotation.x = -Math.PI / 2;
    mesh(box(4.4, 0.06, 0.25), mat(0xffd400), -21, 0.04, -10, S);
    for (const sx of [-1.6, 1.6]) mesh(box(0.3, 1.6, 0.3), mat(0xd8231b), -21 + sx, 0.8, -12, S);
    mesh(box(4.2, 0.12, 2.0), mat(0x444444), -21, 1.6, -12, S);
    { const g = new THREE.Group(); g.position.set(-21, 1.66, -12); S.add(g); mesh(box(3.8, 0.7, 1.7), mat(0xf0f0f0), 0, 0.45, 0, g); mesh(box(2.1, 0.6, 1.55), mat(0xf0f0f0), -0.2, 1.1, 0, g); mesh(box(2.0, 0.45, 1.58), mat(0x2a3a4a), -0.2, 1.12, 0, g); }
    addBox(-23.2, -18.8, -13.1, -10.9, 3);
    for (let i = 0; i < 5; i++) mesh(cyl(0.38, 0.38, 0.25, 10), mat(0x1a1a1a), -23.4, 0.15 + i * 0.26, -14.5, S);
    addCircle(-23.4, -14.5, 0.45);
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

  lots(-35, 5, [[1, 0], [2, 0], [1, 1], [2, 1]], 8);
  { const x0 = -24.5, x1 = -6.5, z0 = 6.5, z1 = 24.5;
    const pz = mesh(uvScale(new THREE.PlaneGeometry(x1 - x0 + 1.5, z1 - z0 + 1.5), 9, 9), plazaMat, (x0 + x1 + 1.5) / 2, 0.125, (z0 + z1 - 1.5) / 2, S); pz.rotation.x = -Math.PI / 2;
    addRaised({ x0, x1: x1 + 1.5, z0: z0 - 1.5, z1, y: 0.12 });
    mapRects.push({ x0, x1, z0, z1, kind: 'plaza' });
    const melon = [{ r: 0.2, c: 0x2f7a2f, sx: 1.3 }], oranges = [{ r: 0.1, c: 0xff8a1a }], toms = [{ r: 0.1, c: 0xd8231b }], mix = [{ r: 0.12, c: 0xffd400 }, { r: 0.11, c: 0x7a1a4a }, { r: 0.1, c: 0x2f8f3a }];
    const sh = stall(-11, 11, 0, melon, 0x2f8f3a);
    const sg = new THREE.Mesh(signGeo(2.6, 0.6, 'فرشة شحاتة', '#2f8f3a', '#ffe14a'), signMatDouble); sg.position.set(0, 2.9, 0.7); sh.add(sg);
    for (let i = 0; i < 6; i++) { const m = mesh(new THREE.IcosahedronGeometry(0.24, 0), mat(0x2f7a2f), -11.6 + (i % 3) * 0.55, 0.25, 12.6 + Math.floor(i / 3) * 0.5, S); m.scale.set(1.3, 1, 1); }
    addBox(-12.1, -10.1, 12.3, 13.3, 0.6);
    stall(-17, 11, 0, oranges, 0xd8231b); stall(-22, 11, 0, toms, 0xffd400);
    stall(-11, 19, Math.PI, mix, 0x1f5fd8); stall(-17, 19, Math.PI, oranges, 0xec86ad); stall(-22, 19, Math.PI, toms, 0x2f8f3a);
    bunting(-24, 14.5, -8, 14.5, 4.2); bunting(-24, 22, -8, 22, 4.2);
    for (const [cx, cz] of [[-8.3, 23.5], [-23.5, 7.8]]) tree(cx, cz, 1.1);
    zones.push({ id: 'market', ar: 'السوق', en: 'THE MARKET', x: -16, z: 15, r: 7 });
    zones.push({ id: 'shehata', ar: 'فرشة شحاتة', en: "SHEHATA'S STALL", x: -11, z: 12, r: 2.6 });
  }
  zones.push({ id: 'tuk', ar: 'موقف التوكتوك', en: 'TUK-TUK STAND', x: -3.4, z: 11, r: 3.5 });
  mesh(cyl(0.06, 0.06, 2.6, 5), mat(0x3a3a3e), -5.3, 1.3, 8.2, S);
  sign(1.6, 0.5, 'موقف التوكتوك', '#ffd400', '#1a1a1a', -5.3, 2.5, 8.2, Math.PI / 2, { double: true });
  addCircle(-5.3, 8.2, 0.15);

  lots(5, 5, [[0, 0], [1, 0], [2, 0], [2, 2]], 12);
  { building(6.5, 15.5, 6.5, 15.5, 2, ['W'], { pal: 4, seed: 91 });
    mesh(box(9, 3.4, 0.1), mat(0x3a6a5a), 11, 1.7, 6.45, S);
    sign(5, 0.9, 'قهوة الحبايب', '#3a6a5a', '#ffe14a', 11, 3.0, 6.38, Math.PI);
    mesh(new THREE.PlaneGeometry(7.5, 2.4), mat(0x1a1410), 11, 1.3, 6.38, S).rotation.y = Math.PI;
    for (let i = 0; i < 4; i++) {
      const tx = 7.6 + i * 2.2, tz = 5.6;
      mesh(cyl(0.35, 0.35, 0.05, 8), mat(0xe8e8e8), tx, 0.85, tz, S); mesh(cyl(0.04, 0.04, 0.75, 4), mat(0x6a6a6a), tx, 0.48, tz, S);
      for (const s of [-1, 1]) { mesh(box(0.42, 0.05, 0.42), mat(0x8a5a2b), tx + s * 0.6, 0.5, tz, S); mesh(box(0.42, 0.45, 0.05), mat(0x8a5a2b), tx + s * 0.6, 0.75, tz + 0.2, S); }
      if (i !== 1) addCircle(tx, tz, 0.45);
    }
    doors.push({ id: 'cafe', x: 9.8, z: 5.9, r: 1.1, ar: 'ادخل القهوة', interior: 'cafe' });
    zones.push({ id: 'cafe', ar: 'قهوة الحبايب', en: 'THE CAFÉ', x: 11, z: 4.5, r: 4.5 });
  }
  { building(15.5, 33.5, 6.5, 15.5, 1, [], { pal: 4, seed: 93, noShops: true, kind: 'mosque' });
    mesh(new THREE.SphereGeometry(3.2, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2), mat(0x3a8a6a), 24.5, 6.5, 11, S);
    mesh(cyl(0.08, 0.08, 1.2, 4), mat(0xffd400), 24.5, 10.2, 11, S);
    for (const [y, r, h] of [[0, 1.1, 9], [9, 0.85, 4], [13, 0.6, 3]]) mesh(cyl(r, r * 1.05, h, 8), mat(0xe8dcc0), 32, y + h / 2, 7.5, S);
    mesh(cyl(1.4, 1.4, 0.25, 8), mat(0xd8c8a8), 32, 9.1, 7.5, S); mesh(cyl(1.0, 1.0, 0.25, 8), mat(0xd8c8a8), 32, 13.1, 7.5, S);
    mesh(new THREE.ConeGeometry(0.7, 1.6, 8), mat(0x3a8a6a), 32, 16.8, 7.5, S);
    for (let i = 0; i < 5; i++) { const ax = 17.5 + i * 3.2; mesh(new THREE.PlaneGeometry(1.4, 2.6), mat(0x2a4a3a), ax, 1.6, 6.48, S).rotation.y = Math.PI; }
    zones.push({ id: 'mosque', ar: 'الجامع', en: 'THE MOSQUE', x: 24.5, z: 4.5, r: 5 });
  }
  { const r = building(24.5, 33.5, 24.5, 33.5, 4, ['E', 'S'], { pal: 3, seed: 95, noShops: true, kind: 'studio' });
    mesh(box(0.2, 2.2, 7.5), mat(0xd8231b), 33.65, 4.6, 29, S);
    sign(7.2, 1.9, 'عاجل جدًا', '#d8231b', '#ffffff', 33.78, 4.6, 29, Math.PI / 2);
    mesh(new THREE.PlaneGeometry(2.0, 2.6), mat(0x1a2a3a), 33.52, 1.3, 29, S).rotation.y = Math.PI / 2;
    const dsh = mesh(new THREE.SphereGeometry(1.6, 10, 5, 0, Math.PI * 2, 0, Math.PI * 0.35), dishMat, 29, r.H + 2.2, 29, S); dsh.rotation.x = Math.PI / 2 + 0.7;
    mesh(cyl(0.1, 0.1, 2, 4), railMat, 29, r.H + 1, 29, S); mesh(cyl(0.05, 0.08, 6, 4), mat(0xd8231b), 31.5, r.H + 3, 26.5, S);
    doors.push({ id: 'studio', x: 34.3, z: 29, r: 1.2, ar: 'ادخل القناة', interior: 'studio' });
    zones.push({ id: 'studio', ar: 'قناة عاجل جدًا', en: 'AGEL GEDDAN TV', x: 37, z: 29, r: 4.5 });
  }
}

function scrapyard(bx0, bz0) {
  const x0 = bx0 + 1.5, x1 = bx0 + 28.5, z0 = bz0 + 1.5, z1 = bz0 + 28.5;
  const wall = mat(0x8a8478);
  for (const [a, b, c, d] of [[x0, x1, z0, z0 + 0.4], [x0, x0 + 0.4, z0, z1], [x1 - 0.4, x1, z0, z1], [x0, (x0 + x1) / 2 - 3, z1 - 0.4, z1], [(x0 + x1) / 2 + 3, x1, z1 - 0.4, z1]]) { mesh(box(b - a, 2.6, d - c), wall, (a + b) / 2, 1.3, (c + d) / 2, S); addBox(a, b, c, d, 2.6); }
  sign(6, 1.1, 'مقلب الخردة', '#6a4a2a', '#ffd400', (x0 + x1) / 2, 3.2, z1 + 0.05, 0, { double: true });
  mesh(box(0.2, 3.6, 0.2), railMat, (x0 + x1) / 2 - 3.1, 1.8, z1, S); mesh(box(0.2, 3.6, 0.2), railMat, (x0 + x1) / 2 + 3.1, 1.8, z1, S);
  const r = rng(44);
  const fl = mesh(new THREE.PlaneGeometry(x1 - x0, z1 - z0), mat(0x6a5a48), (x0 + x1) / 2, 0.02, (z0 + z1) / 2, S); fl.rotation.x = -Math.PI / 2;
  for (let i = 0; i < 9; i++) {
    if (i === 7) continue; // the path from the gate
    const px = x0 + 4 + (i % 3) * 9, pz = z0 + 4 + Math.floor(i / 3) * 7.5;
    for (let k = 0; k < 7; k++) mesh(new THREE.IcosahedronGeometry(0.8 + r() * 0.9, 0), mat([0x5a4a3a, 0x6a6a6a, 0x8a3a2a, 0x3a4a5a, 0x7a6a4a][k % 5]), px + (r() - 0.5) * 2.5, 0.5 + r() * 0.8, pz + (r() - 0.5) * 2, S);
    addCircle(px, pz, 2.0);
  }
  for (let i = 0; i < 4; i++) { const g = new THREE.Group(); g.position.set(x1 - 3, 0.5 + i * 1.0, z0 + 3 + (i % 2) * 0.3); g.rotation.y = r() * 0.4; S.add(g); mesh(box(3.6, 0.9, 1.7), mat([0x8a1a1a, 0x1f3f7a, 0xc8c0a0, 0x2a2a2a][i]), 0, 0, 0, g); }
  addBox(x1 - 5, x1 - 1, z0 + 1.6, z0 + 4.6, 4.5);
  mesh(box(0.6, 10, 0.6), mat(0xffd400), x0 + 3, 5, z1 - 4, S); mesh(box(9, 0.5, 0.5), mat(0xffd400), x0 + 6.5, 10, z1 - 4, S); mesh(cyl(0.03, 0.03, 5, 4), mat(0x222222), x0 + 10, 7.5, z1 - 4, S);
  mesh(cyl(0.9, 0.9, 0.2, 10), mat(0x444444), x0 + 10, 5, z1 - 4, S); addBox(x0 + 2.6, x0 + 3.4, z1 - 4.4, z1 - 3.6, 10);
  mapRects.push({ x0, x1, z0, z1, kind: 'scrap' });
  zones.push({ id: 'scrap', ar: 'مقلب الخردة', en: 'THE SCRAPYARD', x: (x0 + x1) / 2, z: (z0 + z1) / 2, r: 13 });
}
function iceFactory(bx0, bz0) {
  building(bx0 + 1.5, bx0 + 28.5, bz0 + 1.5, bz0 + 16, 2, ['S'], { pal: 3, lite: true, noShops: true, kind: 'factory' });
  sign(10, 1.6, 'مصنع الثلج', '#1f5fd8', '#ffffff', bx0 + 15, 6.5, bz0 + 16.05, 0);
  for (let i = 0; i < 3; i++) mesh(new THREE.PlaneGeometry(3.4, 3.2), mat(0x6a7078), bx0 + 6 + i * 9, 1.6, bz0 + 16.03, S);
  for (let i = 0; i < 6; i++) mesh(box(1.1, 0.8, 0.8), mat(0xcfeeff), bx0 + 5 + i * 1.3, 0.4, bz0 + 19, S);
  addBox(bx0 + 4.4, bx0 + 12.6, bz0 + 18.6, bz0 + 19.4, 0.9);
  building(bx0 + 1.5, bx0 + 12, bz0 + 22, bz0 + 28.5, 1, ['S'], { lite: true, seed: 3 });
  zones.push({ id: 'ice', ar: 'مصنع الثلج', en: 'ICE FACTORY', x: bx0 + 15, z: bz0 + 19, r: 6 });
}
function warehouses(bx0, bz0, seed) {
  const r = rng(seed);
  building(bx0 + 1.5, bx0 + 14.5, bz0 + 1.5, bz0 + 14.5, 1 + Math.floor(r() * 2), ['N', 'W'], { pal: 3, lite: true, seed });
  building(bx0 + 15.5, bx0 + 28.5, bz0 + 1.5, bz0 + 14.5, 2, ['N', 'E'], { pal: 6, lite: true, seed: seed + 1 });
  building(bx0 + 1.5, bx0 + 28.5, bz0 + 15.5, bz0 + 28.5, 1 + Math.floor(r() * 3), ['S', 'W', 'E'], { pal: [1, 3, 6][seed % 3], lite: true, seed: seed + 2 });
}
function mall(bx0, bz0) {
  const x0 = bx0 + 1.5, x1 = bx0 + 28.5, z0 = bz0 + 1.5, z1 = bz0 + 18;
  building(x0, x1, z0, z1, 3, ['S'], { pal: 7, noShops: true, kind: 'mall' });
  sign(14, 2.2, 'سنتر النجوم', '#151518', '#ffd400', (x0 + x1) / 2, 8.6, z1 + 0.06, 0);
  mesh(new THREE.PlaneGeometry(6, 3), mat(0x9fc8e0), (x0 + x1) / 2, 1.5, z1 + 0.02, S);
  const lot = mesh(new THREE.PlaneGeometry(27, 9), mat(0x5a5a5e), (x0 + x1) / 2, 0.13, z1 + 5.25, S); lot.rotation.x = -Math.PI / 2;
  addRaised({ x0, x1, z0: z1, z1: bz0 + 28.5, y: 0.12 });
  for (let i = 0; i < 7; i++) { mesh(box(0.12, 0.01, 4.5), mat(0xf0f0e0), x0 + 2 + i * 3.8, 0.14, z1 + 5.5, S); if (i < 6) parking.push({ x: x0 + 3.9 + i * 3.8, z: z1 + 5.5, ry: Math.PI / 2, lot: true }); }
  zones.push({ id: 'mall', ar: 'سنتر النجوم', en: 'NOGOOM MALL', x: (x0 + x1) / 2, z: z1 + 4, r: 9 });
}
function gasStation(bx0, bz0) {
  const x0 = bx0 + 1.5, x1 = bx0 + 10.5, z0 = bz0 + 1.5, z1 = bz0 + 28.5;
  const fl = mesh(new THREE.PlaneGeometry(x1 - x0, z1 - z0), mat(0x6a6a6e), (x0 + x1) / 2, 0.13, (z0 + z1) / 2, S); fl.rotation.x = -Math.PI / 2;
  addRaised({ x0, x1, z0, z1, y: 0.12 });
  mesh(box(8, 0.5, 14), mat(0xf0f0f0), (x0 + x1) / 2, 5, (z0 + z1) / 2, S);
  mesh(box(8.1, 0.25, 14.1), mat(0xd8231b), (x0 + x1) / 2, 4.7, (z0 + z1) / 2, S);
  for (const dz of [-4.5, 0, 4.5]) { mesh(box(0.4, 4.8, 0.4), mat(0xe8e8e8), (x0 + x1) / 2, 2.4, (z0 + z1) / 2 + dz, S); mesh(box(0.8, 1.5, 0.6), mat(0xd8231b), (x0 + x1) / 2, 0.75, (z0 + z1) / 2 + dz + 1.2, S); addBox((x0 + x1) / 2 - 0.4, (x0 + x1) / 2 + 0.4, (z0 + z1) / 2 + dz - 0.3, (z0 + z1) / 2 + dz + 1.6, 5); }
  sign(5, 1.1, 'بنزينة الحي', '#d8231b', '#ffffff', x0 - 0.06, 5, (z0 + z1) / 2, -Math.PI / 2);
  zones.push({ id: 'gas', ar: 'البنزينة', en: 'GAS STATION', x: (x0 + x1) / 2, z: (z0 + z1) / 2, r: 7 });
}
function park(bx0, bz0) {
  const g = mesh(uvScale(new THREE.PlaneGeometry(27, 27), 14, 14), grassMat, bx0 + 15, 0.13, bz0 + 15, S); g.rotation.x = -Math.PI / 2;
  addRaised({ x0: bx0 + 1.5, x1: bx0 + 28.5, z0: bz0 + 1.5, z1: bz0 + 28.5, y: 0.12 });
  for (let i = 0; i < 10; i++) tree(bx0 + 4 + (i % 4) * 7.2, bz0 + 4 + Math.floor(i / 4) * 9.5, 1.2);
  for (let i = 0; i < 4; i++) { mesh(box(1.6, 0.1, 0.5), mat(0x8a5a2b), bx0 + 8 + i * 4.5, 0.5, bz0 + 15, S); mesh(box(1.6, 0.5, 0.08), mat(0x8a5a2b), bx0 + 8 + i * 4.5, 0.75, bz0 + 15.25, S); }
  for (const s of [-1, 1]) mesh(box(0.1, 2.6, 0.1), mat(0xd8231b), bx0 + 22 + s * 1.5, 1.3, bz0 + 22, S);
  mesh(box(3.1, 0.1, 0.1), mat(0xd8231b), bx0 + 22, 2.6, bz0 + 22, S);
  zones.push({ id: 'park', ar: 'جنينة الحي', en: 'THE PARK', x: bx0 + 15, z: bz0 + 15, r: 13 });
}
function school(bx0, bz0) {
  building(bx0 + 1.5, bx0 + 28.5, bz0 + 1.5, bz0 + 12, 3, ['S'], { pal: 5, noShops: true, kind: 'school' });
  sign(10, 1.3, 'مدرسة الحي الإعدادية', '#2f8f3a', '#ffffff', bx0 + 15, 3.0, bz0 + 12.06, 0);
  const yard = mesh(new THREE.PlaneGeometry(27, 15), mat(0xc8a878), bx0 + 15, 0.13, bz0 + 20.5, S); yard.rotation.x = -Math.PI / 2;
  addRaised({ x0: bx0 + 1.5, x1: bx0 + 28.5, z0: bz0 + 12, z1: bz0 + 28.5, y: 0.12 });
  for (const s of [-1, 1]) mesh(box(0.1, 2, 0.1), mat(0xffffff), bx0 + 15 + s * 1.8, 1, bz0 + 27, S);
  mesh(box(3.7, 0.1, 0.1), mat(0xffffff), bx0 + 15, 2, bz0 + 27, S);
  zones.push({ id: 'school', ar: 'المدرسة', en: 'THE SCHOOL', x: bx0 + 15, z: bz0 + 20, r: 10 });
}

function bridgeAndIsland() {
  const B = RIVER.bridge, I = RIVER.isle;
  mesh(box(B.x1 - B.x0, 0.5, 11), mat(0x8a8a86), (B.x0 + B.x1) / 2, 0.05, 0, S);
  addRaised({ x0: B.x0, x1: B.x1, z0: B.z0, z1: B.z1, y: 0.3 });
  for (const s of [-1, 1]) { mesh(box(B.x1 - B.x0 - 6, 1.0, 0.25), mat(0x2a6a5a), (B.x0 + B.x1) / 2, 0.8, s * 5.4, S); addBox(RIVER.x0, B.x1 - 4, s * 5.4 - 0.15, s * 5.4 + 0.15, 1.4); }
  for (let x = 130; x < 196; x += 11) { mesh(box(2, 4, 8), concrete, x, -2, 0, S); lamp(x, 5.6, -Math.PI / 2); }
  for (let x = 128; x < 198; x += 3) mesh(box(1.4, 0.01, 0.15), mat(0xf0f0e0), x, 0.32, 0, S);
  const isl = mesh(uvScale(new THREE.PlaneGeometry(I.x1 - I.x0, I.z1 - I.z0), 30, 50), grassMat, (I.x0 + I.x1) / 2, 0.01, 0, S); isl.rotation.x = -Math.PI / 2;
  mesh(box(I.x1 - I.x0, 3.2, I.z1 - I.z0), concrete, (I.x0 + I.x1) / 2, -1.61, 0, S);
  const road = mesh(new THREE.PlaneGeometry(I.x1 - I.x0 - 8, 10), mat(0x4a4a4e), (I.x0 + I.x1) / 2, 0.03, 0, S); road.rotation.x = -Math.PI / 2;
  for (const xx of [I.x0 + 9, I.x1 - 9]) { const r2 = mesh(new THREE.PlaneGeometry(10, I.z1 - I.z0 - 8), mat(0x4a4a4e), xx, 0.03, 0, S); r2.rotation.x = -Math.PI / 2; }
  const tx = 240, tz = -30;
  mesh(cyl(1.6, 2.4, 70, 10), mat(0xc8b8a0), tx, 35, tz, S);
  mesh(cyl(4, 3, 4, 12), mat(0x8a3a2a), tx, 70, tz, S); mesh(cyl(0.3, 0.3, 12, 6), mat(0xe8e8e8), tx, 78, tz, S);
  for (let i = 0; i < 30; i++) mesh(box(0.3, 1.2, 0.05), mat(0x2a3a4a), tx + Math.cos(i * 0.21) * 1.7, 4 + i * 2.2, tz + Math.sin(i * 0.21) * 1.7, S);
  addCircle(tx, tz, 2.6);
  for (let i = 0; i < 18; i++) palm(I.x0 + 20 + (i % 6) * 9, -55 + Math.floor(i / 6) * 50 + (i % 2) * 6 + 10, 7);
  addBox(I.x1, I.x1 + 0.5, I.z0, I.z1, 1.2); addBox(I.x0, I.x1, I.z0 - 0.5, I.z0, 1.2); addBox(I.x0, I.x1, I.z1, I.z1 + 0.5, 1.2);
  addBox(I.x0 - 0.5, I.x0, I.z0, -5.5, 1.2); addBox(I.x0 - 0.5, I.x0, 5.5, I.z1, 1.2);
  ramp(236, 45, Math.PI / 2, 10, 2.6, 6, 'jump-isle', 'قفزة الجزيرة');
  zones.push({ id: 'bridge', ar: 'كوبري الحي', en: 'THE BRIDGE', x: 160, z: 0, r: 30 });
  zones.push({ id: 'isle', ar: 'الجزيرة', en: 'THE ISLAND', x: 236, z: 10, r: 40 });
  zones.push({ id: 'tower', ar: 'برج الجزيرة', en: 'ISLAND TOWER', x: tx, z: tz, r: 8 });
}

function desert() {
  const hw = mesh(new THREE.PlaneGeometry(12, 420), mat(0x4a4a4e), 0, 0.04, 165 + 210, S); hw.rotation.x = -Math.PI / 2;
  for (let z = 170; z < 580; z += 6) mesh(box(0.15, 0.01, 2.5), mat(0xf0f0e0), 0, 0.06, z, S);
  sign(8, 1.6, 'الطريق الصحراوي', '#2f8f3a', '#ffffff', 8, 4.5, 175, 0, { double: true }); mesh(box(0.2, 4.5, 0.2), railMat, 4.5, 2.2, 175, S); mesh(box(0.2, 4.5, 0.2), railMat, 11.5, 2.2, 175, S);
  const px = 70, pz = 250;
  const pad = mesh(new THREE.PlaneGeometry(110, 120), mat(0x8a7a5a), px, 0.03, pz, S); pad.rotation.x = -Math.PI / 2;
  sign(12, 2.4, 'حديقة القفز ٣٠٠٠', '#d8231b', '#ffd400', px, 6, pz - 62, 0, { double: true }); for (const s of [-1, 1]) mesh(box(0.3, 6, 0.3), railMat, px + s * 6.2, 3, pz - 62, S);
  ramp(px - 30, pz - 30, 0, 10, 2.4, 6, 'jump-1', 'القفزة الأولى');
  ramp(px + 10, pz - 35, -Math.PI / 2, 12, 3.2, 6, 'jump-2', 'قفزة الموت');
  ramp(px - 10, pz + 10, Math.PI, 9, 2.0, 5, 'jump-3', 'قفزة البطيخ');
  ramp(px + 30, pz + 20, Math.PI / 2, 14, 4.2, 7, 'jump-4', 'قفزة النووي');
  ramp(px + 35, pz - 10, 0, 8, 1.6, 5, 'jump-5', 'القفزة الصغيرة');
  ramp(-30, 300, Math.PI / 2, 12, 3.0, 6, 'jump-6', 'قفزة الهرم');
  ramp(-80, -100, Math.PI / 2, 6, 1.0, 4, 'jump-7', 'قفزة وسط البلد');
  for (let i = 0; i < 6; i++) { const cx = px - 45 + i * 3, cz = pz + 40; mesh(box(2.6, 2.6, 6), mat([0x8a3a2a, 0x2f5f8a, 0x3a6a3a][i % 3]), cx, 1.3, cz, S); addBox(cx - 1.3, cx + 1.3, cz - 3, cz + 3, 2.6); }
  for (let i = 0; i < 20; i++) { const a = i / 20 * Math.PI * 2; mesh(cyl(0.5, 0.5, 0.5, 8), mat(i % 2 ? 0x111111 : 0xd8231b), px + Math.cos(a) * 52, 0.25, pz + Math.sin(a) * 56, S); }
  zones.push({ id: 'jumppark', ar: 'حديقة القفز ٣٠٠٠', en: 'JUMP PARK 3000', x: px, z: pz, r: 45 });
  zones.push({ id: 'desert', ar: 'الصحرا', en: 'THE DESERT', x: 0, z: 430, r: 120 });
  addBox(-230, 130, 600, 640, 99);
  for (let i = 0; i < 16; i++) { const s = 18 + (i % 4) * 6; const d = mesh(new THREE.SphereGeometry(s, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2), sandMat, -190 + i * 21, -2, 595 + (i % 3) * 8, S); d.scale.y = 0.35; }
}

function makeTuk(parent) {
  const tuk = new THREE.Group(); parent.add(tuk);
  const tb = new THREE.Group(); tuk.add(tb);
  const red = P(0xd8231b, { shininess: 70 }), blk = M(0x161616);
  mesh(box(2.2, 0.15, 1.2), blk, 0, 0.35, 0, tb);
  mesh(box(1.2, 0.9, 1.25), red, 0.4, 0.85, 0, tb);
  mesh(box(0.7, 0.85, 0.95), red, -0.75, 0.8, 0, tb);
  mesh(new THREE.PlaneGeometry(0.85, 0.55), new THREE.MeshPhongMaterial({ color: 0x9fd0ff, transparent: true, opacity: 0.55, side: THREE.DoubleSide }), -1.1, 1.5, 0, tb).rotation.y = Math.PI / 2;
  mesh(box(2.0, 0.08, 1.35), blk, -0.05, 1.95, 0, tb);
  for (const [x, z] of [[-1.05, 0.45], [-1.05, -0.45], [0.95, 0.6], [0.95, -0.6]]) mesh(box(0.05, 0.75, 0.05), blk, x, 1.55, z, tb);
  mesh(box(0.06, 0.06, 0.6), P(0xcccccc), -0.85, 1.3, 0, tb);
  const ms = new THREE.Mesh(signGeo(0.75, 0.24, 'ما شاء الله', '#d8231b', '#ffe14a'), signMat); ms.position.set(1.005, 1.0, 0); ms.rotation.y = Math.PI / 2; tb.add(ms);
  const pl = new THREE.Mesh(signGeo(0.4, 0.13, 'ح و د | ٣٠٠٠', '#f0f0f0', '#111111'), signMat); pl.position.set(1.005, 0.6, 0); pl.rotation.y = Math.PI / 2; tb.add(pl);
  { const eye = new THREE.Group(); eye.position.set(-1.11, 1.0, 0); eye.rotation.y = -Math.PI / 2; tb.add(eye); mesh(cyl(0.12, 0.12, 0.02, 10), M(0x1f5fd8), 0, 0, 0, eye).rotation.x = Math.PI / 2; mesh(cyl(0.06, 0.06, 0.03, 10), M(0xffffff), 0, 0, 0.005, eye).rotation.x = Math.PI / 2; mesh(cyl(0.03, 0.03, 0.04, 8), M(0x111111), 0, 0, 0.01, eye).rotation.x = Math.PI / 2; }
  for (let i = 0; i < 9; i++) mesh(new THREE.ConeGeometry(0.03, 0.12, 4), M([0xffd400, 0xff3355, 0x33cc66][i % 3]), -0.9 + i * 0.22, 1.85, 0.68, tb).rotation.x = Math.PI;
  const wheels = [];
  for (const [x, z] of [[-1.05, 0], [0.75, 0.62], [0.75, -0.62]]) {
    const steer = new THREE.Group(); steer.position.set(x, 0.26, z); tb.add(steer); const spin = new THREE.Group(); steer.add(spin);
    const w = mesh(cyl(0.26, 0.26, 0.16, 10), M(0x111111), 0, 0, 0, spin); w.rotation.x = Math.PI / 2; mesh(box(0.3, 0.04, 0.18), M(0x555555), 0, 0, 0, spin);
    wheels.push({ steer, spin, r: 0.26, front: x < 0 });
  }
  // the handlebar end (-x) is the front: turn the body so +x is forward like every other vehicle
  tb.rotation.y = Math.PI;
  tuk.scale.setScalar(1.15);
  return { g: tuk, body: tb, wheels };
}
function felucca() {
  const g = new THREE.Group();
  mesh(box(5, 0.6, 1.6), M(0xf0e8d8), 0, 0, 0, g); mesh(box(4.6, 0.12, 1.2), M(0x8a5a2b), 0, 0.3, 0, g);
  mesh(cyl(0.07, 0.07, 6, 5), M(0x6a4220), 0.6, 3, 0, g);
  const sailGeo = new THREE.BufferGeometry(); sailGeo.setAttribute('position', new THREE.Float32BufferAttribute([0.6, 0.6, 0, 0.6, 6.4, 0, -2.6, 0.9, 0], 3)); sailGeo.computeVertexNormals();
  g.add(new THREE.Mesh(sailGeo, new THREE.MeshLambertMaterial({ color: 0xf8f4ea, side: THREE.DoubleSide })));
  return g;
}

export function inRiver(x, z) {
  if (x <= RIVER.x0 || x >= RIVER.x1) return false;
  const B = RIVER.bridge, I = RIVER.isle;
  if (x >= B.x0 && x <= B.x1 && z >= B.z0 && z <= B.z1) return false;
  if (x >= I.x0 && x <= I.x1 && z >= I.z0 && z <= I.z1) return false;
  return true;
}
export function groundAt(x, z, y = 0) {
  let g = inRiver(x, z) ? -3 : 0;
  const l = hashR.get(hk(Math.floor(x / CELL), Math.floor(z / CELL)));
  if (l) for (const r of l) {
    if (r.r !== undefined) { if ((x - r.cx) ** 2 + (z - r.cz) ** 2 < r.r * r.r) g = Math.max(g, r.y); continue; }
    if (x < r.x0 || x > r.x1 || z < r.z0 || z > r.z1) continue;
    if (r.ramp) { const t = r.axis === 'x' ? (x - r.cx) * r.sgn / r.L + 0.5 : (z - r.cz) * r.sgn / r.L + 0.5; g = Math.max(g, r.y0 + (r.y1 - r.y0) * Math.min(1, Math.max(0, t))); continue; }
    if (r.roof && y < r.y - 2) continue;
    g = Math.max(g, r.y);
  }
  return g;
}
export { atlasTex };
