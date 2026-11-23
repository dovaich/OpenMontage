// Interiors you can walk into. Each one is built far from the city (x ≥ 1000) and shown only while you are inside.
import * as THREE from 'three';
import { rng, canvasTex, M, P, mesh, box, cyl, bakeModel } from './kit.js';
import { addBox, addCircle } from './world.js';
import { signGeo, signMat } from './atlas.js';

function room(g, x0, x1, z0, z1, H, wallMat, floorMat, opts = {}) {
  const w = x1 - x0, d = z1 - z0, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
  const f = mesh(new THREE.PlaneGeometry(w, d), floorMat, cx, 0.01, cz, g); f.rotation.x = -Math.PI / 2;
  const c = mesh(new THREE.PlaneGeometry(w, d), M(opts.ceil ?? 0xf0ece0), cx, H, cz, g); c.rotation.x = Math.PI / 2;
  const walls = [[cx, z0, w, 0], [cx, z1, w, Math.PI], [x0, cz, d, Math.PI / 2], [x1, cz, d, -Math.PI / 2]];
  for (const [x, z, len, ry] of walls) { const q = mesh(new THREE.PlaneGeometry(len, H), wallMat, x, H / 2, z, g); q.rotation.y = ry; }
  addBox(x0 - 0.5, x0, z0 - 0.5, z1 + 0.5, 9); addBox(x1, x1 + 0.5, z0 - 0.5, z1 + 0.5, 9); addBox(x0 - 0.5, x1 + 0.5, z0 - 0.5, z0, 9); addBox(x0 - 0.5, x1 + 0.5, z1, z1 + 0.5, 9);
}
function divider(g, x0, x1, z0, z1, H, m, gapA, gapB) {
  // a wall with a doorway between gapA and gapB (along its long axis)
  const alongX = (x1 - x0) > (z1 - z0);
  const segs = alongX ? [[x0, gapA], [gapB, x1]] : [[z0, gapA], [gapB, z1]];
  for (const [a, b] of segs) {
    if (b - a < 0.05) continue;
    if (alongX) { mesh(box(b - a, H, z1 - z0), m, (a + b) / 2, H / 2, (z0 + z1) / 2, g); addBox(a, b, z0, z1, 9); }
    else { mesh(box(x1 - x0, H, b - a), m, (x0 + x1) / 2, H / 2, (a + b) / 2, g); addBox(x0, x1, a, b, 9); }
  }
  if (alongX) mesh(box(gapB - gapA, H - 2.4, z1 - z0), m, (gapA + gapB) / 2, 2.4 + (H - 2.4) / 2, (z0 + z1) / 2, g);
  else mesh(box(x1 - x0, H - 2.4, gapB - gapA), m, (x0 + x1) / 2, 2.4 + (H - 2.4) / 2, (gapA + gapB) / 2, g);
}
const tex = {
  wallpaper: () => canvasTex(32, 32, (g) => { g.fillStyle = '#c9b48a'; g.fillRect(0, 0, 32, 32); g.fillStyle = '#b39a6c'; for (let i = 0; i < 4; i++) g.fillRect(i * 8 + 3, 0, 2, 32); g.fillStyle = '#e2d2a6'; for (let y = 2; y < 32; y += 8) for (let x = 0; x < 32; x += 8) { g.fillRect(x + 1, y, 2, 2); g.fillRect(x + 5, y + 4, 2, 2); } }, [8, 3]),
  carpet: () => canvasTex(32, 32, (g) => { g.fillStyle = '#8f1f24'; g.fillRect(0, 0, 32, 32); g.fillStyle = '#1f2a5f'; g.fillRect(0, 0, 32, 3); g.fillRect(0, 29, 32, 3); g.fillRect(0, 0, 3, 32); g.fillRect(29, 0, 3, 32); g.fillStyle = '#e1b54a'; g.fillRect(14, 6, 4, 20); g.fillRect(6, 14, 20, 4); g.fillRect(12, 12, 8, 8); g.fillStyle = '#8f1f24'; g.fillRect(14, 14, 4, 4); }),
  tiles: (a = '#bfb39a', b = '#a79b80') => canvasTex(16, 16, (g) => { g.fillStyle = a; g.fillRect(0, 0, 16, 16); g.fillStyle = b; g.fillRect(0, 7, 16, 1); g.fillRect(7, 0, 1, 16); }, [10, 8]),
  kitchen: () => canvasTex(16, 16, (g) => { g.fillStyle = '#e8f0f0'; g.fillRect(0, 0, 16, 16); g.fillStyle = '#9ab8c8'; g.fillRect(0, 7, 16, 1); g.fillRect(7, 0, 1, 16); g.fillStyle = '#4a8ab0'; g.fillRect(2, 2, 3, 3); }, [10, 3]),
  sofa: () => canvasTex(16, 16, (g) => { g.fillStyle = '#5e7f3a'; g.fillRect(0, 0, 16, 16); g.fillStyle = '#7da04d'; for (let i = 0; i < 16; i += 4) g.fillRect(i, 0, 2, 16); g.fillStyle = '#e8c45a'; g.fillRect(6, 6, 3, 3); }, [3, 1]),
  skyline: () => canvasTex(128, 64, (g) => { const r = rng(5); const gr = g.createLinearGradient(0, 0, 0, 64); gr.addColorStop(0, '#6fa8d8'); gr.addColorStop(1, '#f0d8b0'); g.fillStyle = gr; g.fillRect(0, 0, 128, 64); for (let x = 0; x < 128; x += 7) { const h = 14 + r() * 30 | 0; g.fillStyle = ['#c8a878', '#b89868', '#d8b888'][x % 3]; g.fillRect(x, 64 - h, 6, h); g.fillStyle = '#4a5a7a'; for (let k = 0; k < 4; k++) g.fillRect(x + 1 + (r() * 4 | 0), 64 - h + 2 + (r() * (h - 4) | 0), 1, 2); } }),
};

export function buildInteriors(scene) {
  const defs = {};
  // ================= Om Hamada's apartment =================
  {
    const g = new THREE.Group(); scene.add(g); const X = 1000, Z = 0;
    const wp = M(0xffffff, { map: tex.wallpaper() }), fl = M(0xffffff, { map: tex.tiles() });
    // whole flat: x 994..1010, z -6..6 ; living room west half, kitchen NE, Hamada's room SE, balcony west
    room(g, X - 6, X + 10, Z - 6, Z + 6, 3.2, wp, fl);
    const carpet = mesh(new THREE.PlaneGeometry(5, 3.6), M(0xffffff, { map: tex.carpet() }), X - 1.5, 0.02, Z + 1, g); carpet.rotation.x = -Math.PI / 2;
    divider(g, X + 3.8, X + 4.0, Z - 6, Z + 6, 3.2, wp, Z - 4.2, Z - 2.8);
    divider(g, X + 4, X + 10, Z - 0.1, Z + 0.1, 3.2, M(0xffffff, { map: tex.kitchen() }), X + 6, X + 7.2);
    // sofa + TV + console
    const sofaM = M(0xffffff, { map: tex.sofa() });
    mesh(box(3.2, 0.5, 1.0), sofaM, X - 1.5, 0.35, Z + 4.8, g); mesh(box(3.2, 0.8, 0.3), sofaM, X - 1.5, 0.8, Z + 5.4, g); for (const s of [-1, 1]) mesh(box(0.3, 0.7, 1.0), sofaM, X - 1.5 + s * 1.6, 0.55, Z + 4.8, g);
    addBox(X - 3.2, X + 0.2, Z + 4.2, Z + 5.6, 1);
    mesh(box(2.2, 0.6, 0.6), M(0x6a4220), X - 1.5, 0.3, Z - 5.4, g); mesh(box(1.6, 1.0, 0.5), P(0x222222), X - 1.5, 1.1, Z - 5.4, g);
    mesh(new THREE.PlaneGeometry(1.35, 0.8), new THREE.MeshBasicMaterial({ color: 0x6fb8ff }), X - 1.5, 1.12, Z - 5.14, g);
    mesh(box(0.5, 0.12, 0.35), P(0x111111), X - 0.6, 0.66, Z - 5.3, g);
    addBox(X - 2.7, X - 0.3, Z - 6, Z - 5, 1.6);
    // dining table
    mesh(box(1.8, 0.08, 1.1), M(0x8a5a2b), X - 4.4, 0.8, Z - 1, g); for (const [a, b] of [[-0.8, -0.45], [0.8, -0.45], [-0.8, 0.45], [0.8, 0.45]]) mesh(box(0.08, 0.8, 0.08), M(0x6a4220), X - 4.4 + a, 0.4, Z - 1 + b, g);
    for (let i = 0; i < 4; i++) mesh(cyl(0.12, 0.12, 0.1, 8), M([0xffd400, 0xd8231b, 0xf0f0f0, 0x2f8f3a][i]), X - 4.9 + i * 0.35, 0.89, Z - 1, g);
    addBox(X - 5.4, X - 3.4, Z - 1.6, Z - 0.4, 1);
    // bookshelf, clock, family photo
    mesh(box(1.6, 2.2, 0.4), M(0x6a4220), X + 2.5, 1.1, Z + 5.7, g); for (let i = 0; i < 12; i++) mesh(box(0.1, 0.35, 0.28), M([0xd8231b, 0x1f5fd8, 0xffd400, 0x2f8f3a][i % 4]), X + 1.9 + (i % 6) * 0.22, 0.65 + Math.floor(i / 6) * 0.7, Z + 5.6, g);
    addBox(X + 1.7, X + 3.3, Z + 5.4, Z + 6, 2.2);
    mesh(cyl(0.3, 0.3, 0.05, 12), M(0xf0f0e0), X - 1.5, 2.5, Z - 5.95, g).rotation.x = Math.PI / 2;
    const photo = new THREE.Mesh(signGeo(1.2, 0.6, 'عيلة أم حمادة', '#f0e8d0', '#6a4220'), signMat); photo.position.set(X - 5.98, 2.0, Z + 2); photo.rotation.y = Math.PI / 2; g.add(photo);
    // kitchen (NE): stove, fridge, sink, a pot
    mesh(box(1.0, 0.9, 0.7), P(0xe8e8e8), X + 8.8, 0.45, Z - 5.5, g); for (let i = 0; i < 4; i++) mesh(cyl(0.12, 0.12, 0.02, 8), M(0x222222), X + 8.55 + (i % 2) * 0.5, 0.91, Z - 5.7 + Math.floor(i / 2) * 0.35, g);
    mesh(cyl(0.2, 0.18, 0.3, 10), P(0x8a8a8a), X + 8.55, 1.06, Z - 5.7, g);
    mesh(box(0.9, 2.0, 0.8), P(0xf4f4f4), X + 6.8, 1.0, Z - 5.5, g);
    mesh(box(1.6, 0.9, 0.7), M(0xd8d0c0), X + 5, 0.45, Z - 5.5, g);
    addBox(X + 4.1, X + 9.4, Z - 6, Z - 5.1, 2);
    // Hamada's room (SE): bed, desk, PC with the game, poster
    mesh(box(1.2, 0.45, 2.2), M(0x6c2a6f), X + 8.8, 0.25, Z + 4.6, g); mesh(box(1.2, 0.2, 0.4), M(0xf0f0f0), X + 8.8, 0.55, Z + 3.7, g);
    addBox(X + 8.1, X + 9.5, Z + 3.4, Z + 5.8, 0.8);
    mesh(box(1.4, 0.08, 0.7), M(0x3a3a3a), X + 5.2, 0.8, Z + 5.5, g); mesh(box(0.7, 0.45, 0.06), P(0x111111), X + 5.2, 1.15, Z + 5.75, g);
    mesh(new THREE.PlaneGeometry(0.62, 0.38), new THREE.MeshBasicMaterial({ color: 0xd84a3a }), X + 5.2, 1.15, Z + 5.71, g).rotation.y = Math.PI;
    addBox(X + 4.4, X + 6, Z + 5.1, Z + 6, 1);
    const poster = new THREE.Mesh(signGeo(1.4, 0.7, 'ممنوع الدخول - حمادة', '#151518', '#ffd400'), signMat); poster.position.set(X + 9.98, 1.9, Z + 2.5); poster.rotation.y = -Math.PI / 2; g.add(poster);
    // balcony (west, behind the dining table): a window onto the skyline
    const view = mesh(new THREE.PlaneGeometry(4, 2.2), new THREE.MeshBasicMaterial({ map: tex.skyline() }), X - 5.97, 1.5, Z - 3.6, g); view.rotation.y = Math.PI / 2;
    for (let i = 0; i < 9; i++) mesh(box(0.05, 1.0, 0.05), M(0x2a2a2a), X - 5.9, 0.5, Z - 5.4 + i * 0.45, g);
    // doors: flat door (to the street), stairs up to the roof
    mesh(new THREE.PlaneGeometry(1.1, 2.3), M(0x6a4220), X + 2.5, 1.15, Z - 5.98, g);
    const lbl1 = new THREE.Mesh(signGeo(1.2, 0.3, 'باب الشقة', '#6a4220', '#ffffff'), signMat); lbl1.position.set(X + 2.5, 2.5, Z - 5.97); g.add(lbl1);
    mesh(new THREE.PlaneGeometry(1.1, 2.3), M(0x4a4a4a), X - 5.98, 1.15, Z + 4.5, g).rotation.y = Math.PI / 2;
    const lbl2 = new THREE.Mesh(signGeo(1.2, 0.3, 'سلم السطح', '#4a4a4a', '#ffffff'), signMat); lbl2.position.set(X - 5.97, 2.5, Z + 4.5); lbl2.rotation.y = Math.PI / 2; g.add(lbl2);
    bakeModel(g);
    defs.apartment = { g, ar: 'شقة أم حمادة', spawn: { door: [X + 2.5, Z - 5, Math.PI], stairs: [X - 5, Z + 4.5, -Math.PI / 2] },
      exits: [{ x: X + 2.5, z: Z - 5.4, r: 0.9, to: 'home', ar: 'اخرج للشارع' }, { x: X - 5.4, z: Z + 4.5, r: 0.9, to: 'roofdoor', ar: 'اطلع السطح' }],
      spots: { sofa: [X - 1.5, Z + 4.4], tv: [X - 1.5, Z - 4.4], kitchen: [X + 8, Z - 4.6], hamada: [X + 5.2, Z + 4.6], table: [X - 4.4, Z - 2] } };
  }
  // ================= the café =================
  {
    const g = new THREE.Group(); scene.add(g); const X = 1060, Z = 0;
    room(g, X - 5, X + 5, Z - 4, Z + 4, 3.2, M(0x3a6a5a), M(0xffffff, { map: tex.tiles('#d8c8a0', '#b8a880') }));
    mesh(box(4, 1.0, 0.8), M(0x8a5a2b), X + 2, 0.5, Z - 3.4, g); mesh(box(4, 0.08, 0.9), M(0xd8c8a0), X + 2, 1.02, Z - 3.4, g); addBox(X, X + 4, Z - 4, Z - 3, 1.1);
    for (let i = 0; i < 6; i++) mesh(cyl(0.05, 0.04, 0.12, 6), new THREE.MeshPhongMaterial({ color: 0xc0601a, transparent: true, opacity: 0.85 }), X + 0.6 + i * 0.5, 1.12, Z - 3.4, g);
    mesh(cyl(0.18, 0.2, 0.35, 10), P(0xc8c8d0), X + 3.6, 1.24, Z - 3.4, g);
    mesh(box(1.8, 1.1, 0.12), P(0x111111), X - 2.5, 2.2, Z - 3.9, g); mesh(new THREE.PlaneGeometry(1.6, 0.9), new THREE.MeshBasicMaterial({ color: 0x3fae4a }), X - 2.5, 2.2, Z - 3.83, g);
    for (let i = 0; i < 4; i++) {
      const tx = X - 3 + (i % 2) * 3.8, tz = Z - 0.5 + Math.floor(i / 2) * 2.6;
      mesh(box(0.8, 0.06, 0.8), M(0xe8e8e8), tx, 0.75, tz, g); mesh(cyl(0.05, 0.05, 0.72, 4), M(0x6a6a6a), tx, 0.37, tz, g);
      if (i % 2 === 0) { mesh(box(0.6, 0.06, 0.4), M(0x6a3a1a), tx, 0.8, tz, g); mesh(box(0.02, 0.07, 0.4), M(0xd8c8a0), tx, 0.81, tz, g); } // backgammon
      for (const s of [-1, 1]) mesh(box(0.42, 0.05, 0.42), M(0x8a5a2b), tx + s * 0.7, 0.45, tz, g);
      addCircle(tx, tz, 0.6);
    }
    const sg = new THREE.Mesh(signGeo(3, 0.6, 'الشاي بـ٥ جنيه', '#f0e8d0', '#3a6a5a'), signMat); sg.position.set(X + 2, 2.4, Z - 3.98); g.add(sg);
    mesh(new THREE.PlaneGeometry(1.4, 2.3), M(0x6a4220), X, 1.15, Z + 3.98, g).rotation.y = Math.PI;
    bakeModel(g);
    defs.cafe = { g, ar: 'قهوة الحبايب', spawn: { door: [X, Z + 3, Math.PI] }, exits: [{ x: X, z: Z + 3.5, r: 0.9, to: 'cafe', ar: 'اخرج' }], seats: [[X - 3.7, Z - 0.5], [X + 1.5, Z + 2.1], [X - 2.3, Z + 2.1]], counter: [X + 2, Z - 2.4] };
  }
  // ================= the grocery «بقالة الأمل» =================
  {
    const g = new THREE.Group(); scene.add(g); const X = 1100, Z = 0;
    room(g, X - 4, X + 4, Z - 4, Z + 4, 3.0, M(0xe8e0c8), M(0xffffff, { map: tex.tiles('#c8c8c0', '#a8a8a0') }));
    const r = rng(9);
    for (const sx of [-3.4, 3.4]) { mesh(box(0.6, 2.4, 6), M(0x8a6a4a), X + sx, 1.2, Z - 0.5, g); addBox(X + sx - 0.3, X + sx + 0.3, Z - 3.5, Z + 2.5, 2.4);
      for (let s = 0; s < 4; s++) for (let k = 0; k < 10; k++) mesh(box(0.35, 0.3, 0.45), M([0xd8231b, 0xffd400, 0x1f5fd8, 0x2f8f3a, 0xf0f0f0, 0xe88a3a][Math.floor(r() * 6)]), X + sx - Math.sign(sx) * 0.1, 0.4 + s * 0.55, Z - 3 + k * 0.55, g); }
    mesh(box(2.4, 1.0, 0.8), M(0x6a4220), X, 0.5, Z - 2.6, g); addBox(X - 1.2, X + 1.2, Z - 3, Z - 2.2, 1.1);
    mesh(box(1.0, 1.9, 0.7), P(0xf0f0f0), X + 1.6, 0.95, Z - 3.6, g); mesh(new THREE.PlaneGeometry(0.8, 1.5), new THREE.MeshBasicMaterial({ color: 0xbfe8ff }), X + 1.6, 1.0, Z - 3.24, g);
    const sg = new THREE.Mesh(signGeo(3, 0.6, 'بقالة الأمل', '#1f6fd8', '#ffffff'), signMat); sg.position.set(X, 2.5, Z - 3.98); g.add(sg);
    mesh(new THREE.PlaneGeometry(1.4, 2.3), M(0x6a4220), X, 1.15, Z + 3.98, g).rotation.y = Math.PI;
    bakeModel(g);
    defs.grocery = { g, ar: 'بقالة الأمل', spawn: { door: [X, Z + 3, Math.PI] }, exits: [{ x: X, z: Z + 3.5, r: 0.9, to: 'grocery', ar: 'اخرج' }], cashier: [X, Z - 3.4], shop: [X, Z - 1.6] };
  }
  // ================= «عاجل جدًا» TV studio =================
  {
    const g = new THREE.Group(); scene.add(g); const X = 1140, Z = 0;
    room(g, X - 6, X + 6, Z - 5, Z + 5, 4, M(0x1a1a2a), M(0x2a2a3a), { ceil: 0x111118 });
    const back = new THREE.Mesh(signGeo(8, 2, 'عاجل جدًا', '#d8231b', '#ffffff'), signMat); back.position.set(X, 2.4, Z - 4.98); g.add(back);
    mesh(box(3.4, 0.9, 1.0), P(0xd8231b), X, 0.45, Z - 2.6, g); mesh(box(3.6, 0.08, 1.2), P(0xf0f0f0), X, 0.92, Z - 2.6, g); addBox(X - 1.8, X + 1.8, Z - 3.2, Z - 2, 1);
    for (const s of [-1, 1]) { mesh(cyl(0.05, 0.05, 1.6, 5), M(0x222222), X + s * 2.4, 0.8, Z + 2, g); mesh(box(0.5, 0.4, 0.8), P(0x333333), X + s * 2.4, 1.7, Z + 2, g); mesh(cyl(0.12, 0.12, 0.2, 8), P(0x111111), X + s * 2.4, 1.7, Z + 1.55, g).rotation.x = Math.PI / 2; addCircle(X + s * 2.4, Z + 2, 0.45); }
    for (let i = 0; i < 4; i++) mesh(box(0.4, 0.3, 0.3), new THREE.MeshBasicMaterial({ color: 0xfff2c0 }), X - 3 + i * 2, 3.8, Z - 1, g);
    mesh(new THREE.PlaneGeometry(1.4, 2.3), M(0x6a4220), X + 5.98, 1.15, Z + 3, g).rotation.y = -Math.PI / 2;
    bakeModel(g);
    defs.studio = { g, ar: 'استوديو عاجل جدًا', spawn: { door: [X + 5, Z + 3, -Math.PI / 2] }, exits: [{ x: X + 5.4, z: Z + 3, r: 0.9, to: 'studio', ar: 'اخرج' }], desk: [X, Z - 1.6] };
  }
  for (const k in defs) defs[k].g.visible = false;
  return defs;
}
