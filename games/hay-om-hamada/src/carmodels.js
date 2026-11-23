// Street vehicles of the city, in the same low-poly style as Abu Samir's «١٢٨».
// Local frame: front faces +x, width along z, y up. Each model returns wheels (for spin/steer), its size and the driver's seat.
import * as THREE from 'three';
import { M, P, mesh, box, cyl, bakeModel } from './kit.js';
import { signMesh } from './atlas.js';

const glassMat = new THREE.MeshPhongMaterial({ color: 0x9fc8e0, transparent: true, opacity: 0.55, shininess: 120 });
const darkGlass = M(0x2a3a4a);
const cabGlass = new THREE.MeshPhongMaterial({ color: 0x1a2c40, transparent: true, opacity: 0.55, shininess: 120, specular: 0x888888, flatShading: true });
const chrome = () => P(0xd8d8e0, { shininess: 140, specular: 0xffffff });
const tyre = M(0x151515), hub = P(0xc8c8d0, { shininess: 90 });
const headMat = M(0xfff2c0);
const tailMat = M(0xd02020);

// box whose top face is pulled in at the front (sf) and back (sb): a cabin with a sloped windscreen
function wedge(L, H, W, sf, sb, sw = 0.08) {
  const g = new THREE.BoxGeometry(L, H, W); const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    if (p.getY(i) > 0) { const x = p.getX(i); p.setX(i, x > 0 ? x - sf : x + sb); p.setZ(i, p.getZ(i) * (1 - sw)); }
  }
  g.computeVertexNormals(); return g;
}
function wheel(parent, x, z, r, w) {
  const steer = new THREE.Group(); steer.position.set(x, r, z); parent.add(steer);
  const spin = new THREE.Group(); steer.add(spin);
  const t = mesh(cyl(r, r, w, 14), tyre, 0, 0, 0, spin); t.rotation.x = Math.PI / 2;
  const h = mesh(cyl(r * 0.55, r * 0.55, w + 0.02, 12), hub, 0, 0, 0, spin); h.rotation.x = Math.PI / 2;
  const c = mesh(cyl(r * 0.2, r * 0.2, w + 0.05, 8), M(0x444444), 0, 0, 0, spin); c.rotation.x = Math.PI / 2;
  mesh(box(r * 0.9, 0.06, w + 0.04), M(0x555555), 0, 0, 0, spin);
  return { steer, spin, r, front: x > 0 };
}
function lights(g, L, y, W, round, h = 0.18) {
  for (const s of [-1, 1]) {
    if (round) { const l = mesh(cyl(0.13, 0.13, 0.06, 10), headMat, L / 2 + 0.02, y, s * W * 0.34, g); l.rotation.z = Math.PI / 2; }
    else mesh(box(0.05, h, 0.38), headMat, L / 2 + 0.01, y, s * W * 0.32, g);
    mesh(box(0.05, 0.16, 0.3), tailMat, -L / 2 - 0.01, y, s * W * 0.34, g);
  }
}
function plate(g, L, y, front = true) { mesh(box(0.03, 0.18, 0.5), M(0xf0f0f0), (front ? 1 : -1) * (L / 2 + 0.03), y, 0, g); mesh(box(0.035, 0.05, 0.5), M(0x1f5fd8), (front ? 1 : -1) * (L / 2 + 0.03), y + 0.07, 0, g); }

// ------- the three-box family car (sedan / hatch / wagon / taxi) -------
function car(o) {
  const g = new THREE.Group();
  const L = o.L, W = o.W, r = o.wheelR ?? 0.36, bh = o.bodyH ?? 0.62, by = r + bh / 2 - 0.05;
  const body = P(o.color, { shininess: 60 }), roof = P(o.roofColor ?? o.color, { shininess: 60 });
  mesh(box(L, bh, W), body, 0, by, 0, g);
  // hood/trunk slight bevel
  mesh(box(L - 0.2, 0.08, W - 0.08), body, 0, by + bh / 2 + 0.02, 0, g);
  const c0 = -L / 2 + o.trunk, c1 = L / 2 - o.hood, cl = c1 - c0, ch = o.cabinH ?? 0.62;
  const cab = mesh(wedge(cl, ch, W - 0.1, o.sf ?? 0.42, o.sb ?? 0.3), cabGlass, (c0 + c1) / 2, by + bh / 2 + ch / 2 + 0.03, 0, g);
  // interior: front seats, back bench, dashboard, steering wheel
  const seatM = M(o.seatColor ?? 0x6a2a24);
  for (const z of [-W * 0.22, W * 0.22]) { mesh(box(0.5, 0.12, 0.5), seatM, (c0 + c1) / 2 + 0.15, by + bh / 2 - 0.05, z, g); mesh(box(0.12, 0.6, 0.5), seatM, (c0 + c1) / 2 - 0.12, by + bh / 2 + 0.25, z, g); }
  mesh(box(0.5, 0.12, W - 0.4), seatM, (c0 + c1) / 2 - 0.75, by + bh / 2 - 0.05, 0, g);
  mesh(box(0.3, 0.25, W - 0.3), M(0x222222), c1 - 0.35, by + bh / 2 + 0.12, 0, g);
  { const sw = mesh(new THREE.TorusGeometry(0.15, 0.025, 4, 10), M(0x111111), c1 - 0.55, by + bh / 2 + 0.3, -W * 0.22, g); sw.rotation.y = Math.PI / 2; sw.rotation.x = 0.4; }
  void cab;
  const rl = cl - (o.sf ?? 0.42) - (o.sb ?? 0.3);
  mesh(box(rl + 0.06, 0.07, W - 0.22), roof, (c0 + c1) / 2 + ((o.sb ?? 0.3) - (o.sf ?? 0.42)) / 2, by + bh / 2 + ch + 0.05, 0, g);
  // pillars
  for (const s of [-1, 1]) {
    mesh(box(0.08, ch, 0.06), roof, (c0 + c1) / 2 + 0.02, by + bh / 2 + ch / 2 + 0.03, s * (W / 2 - 0.1), g);
    mesh(box(cl - 0.2, 0.06, 0.06), roof, (c0 + c1) / 2, by + bh / 2 + 0.05, s * (W / 2 - 0.04), g); // window sill
  }
  // bumpers, grille, lights, plates
  const ch2 = chrome();
  mesh(box(0.14, 0.16, W + 0.06), ch2, L / 2 + 0.05, r + 0.12, 0, g); mesh(box(0.14, 0.16, W + 0.06), ch2, -L / 2 - 0.05, r + 0.12, 0, g);
  mesh(box(0.04, 0.24, W * 0.45), M(0x222222), L / 2 + 0.01, by + 0.08, 0, g);
  lights(g, L, by + 0.08, W, o.round);
  plate(g, L, r + 0.28, true); plate(g, L, r + 0.28, false);
  // door seams + handles + mirrors
  for (const s of [-1, 1]) {
    for (const x of o.doors ?? [0.15, -0.75]) { mesh(box(0.03, bh - 0.1, 0.01), M(0x222222), x + 0.5, by, s * (W / 2 + 0.005), g); mesh(box(0.14, 0.04, 0.02), ch2, x + 0.25, by + 0.15, s * (W / 2 + 0.01), g); }
    mesh(box(0.12, 0.1, 0.16), body, c1 - 0.1, by + bh / 2 + 0.12, s * (W / 2 + 0.06), g);
    mesh(box(L * 0.3, 0.05, 0.02), ch2, 0, by - 0.12, s * (W / 2 + 0.005), g);
  }
  if (o.stripe) for (const s of [-1, 1]) mesh(box(L - 0.1, 0.12, 0.012), M(o.stripe), 0, by + 0.05, s * (W / 2 + 0.008), g);
  if (o.rack) { for (const x of [-0.4, 0.4]) mesh(box(0.05, 0.08, W - 0.3), M(0x333333), (c0 + c1) / 2 + x, by + bh / 2 + ch + 0.12, 0, g); }
  if (o.taxi) {
    const sg = signMesh(0.6, 0.18, 'تاكسي', '#ffd400', '#111111'); sg.position.set((c0 + c1) / 2, by + bh / 2 + ch + 0.2, 0); sg.rotation.y = Math.PI / 2; g.add(sg);
    const sg2 = sg.clone(); sg2.rotation.y = -Math.PI / 2; g.add(sg2);
    mesh(box(0.2, 0.2, 0.62), M(0xffd400), (c0 + c1) / 2, by + bh / 2 + ch + 0.2, 0, g);
    for (const s of [-1, 1]) for (let i = 0; i < 6; i++) mesh(box(0.25, 0.1, 0.012), M(i % 2 ? 0x111111 : 0xffffff), -L / 2 + 0.6 + i * 0.6, by + 0.18, s * (W / 2 + 0.009), g);
  }
  const wheels = []; const wx = L / 2 - (o.axle ?? 0.85);
  for (const x of [wx, -wx]) for (const s of [-1, 1]) wheels.push(wheel(g, x, s * (W / 2 - 0.1), r, 0.26));
  for (const x of [wx, -wx]) for (const s of [-1, 1]) mesh(box(0.85, 0.16, 0.06), M(0x1a1a1a), x, r + 0.32, s * (W / 2 + 0.01), g);
  return { g, wheels, L, W, H: by + bh / 2 + ch + 0.1, seat: { x: (c0 + c1) / 2 + 0.25, y: 0.05, z: -W * 0.22 }, glass: { x: (c0 + c1) / 2, y: by + bh / 2 + ch / 2, w: cl, h: ch } };
}

function microbus(o) {
  const g = new THREE.Group(); const L = 5.4, W = 2.15, r = 0.38;
  const body = P(o.color, { shininess: 50 });
  mesh(box(L - 0.6, 1.9, W), body, -0.3, r + 1.0, 0, g);
  mesh(wedge(0.9, 1.9, W, 0.55, 0, 0.02), body, L / 2 - 0.45, r + 1.0, 0, g);
  // window band
  for (const s of [-1, 1]) { mesh(box(L - 1.3, 0.62, 0.02), darkGlass, -0.35, r + 1.55, s * (W / 2 + 0.005), g); for (let i = 0; i < 4; i++) mesh(box(0.08, 0.62, 0.03), body, -2.2 + i * 1.05, r + 1.55, s * (W / 2 + 0.01), g); }
  const ws = mesh(box(0.05, 0.75, W - 0.2), darkGlass, L / 2 - 0.62, r + 1.5, 0, g); ws.rotation.z = -0.52;
  mesh(box(0.02, 0.62, W - 0.3), darkGlass, -L / 2 - 0.005, r + 1.55, 0, g);
  if (o.stripe) for (const s of [-1, 1]) mesh(box(L - 0.4, 0.14, 0.02), M(o.stripe), -0.1, r + 0.85, s * (W / 2 + 0.008), g);
  mesh(box(0.03, 1.2, 0.02), M(0x222222), 0.6, r + 0.9, W / 2 + 0.01, g); mesh(box(1.1, 0.03, 0.02), M(0x222222), 0.05, r + 1.25, W / 2 + 0.01, g);
  const ch2 = chrome(); mesh(box(0.14, 0.18, W + 0.04), ch2, L / 2 + 0.03, r + 0.15, 0, g); mesh(box(0.14, 0.18, W + 0.04), ch2, -L / 2 - 0.03, r + 0.15, 0, g);
  lights(g, L, r + 0.5, W, false, 0.2); plate(g, L, r + 0.3, true); plate(g, L, r + 0.3, false);
  mesh(box(L - 1, 0.08, W - 0.4), M(0x333333), -0.4, r + 2.0, 0, g); // roof rack
  for (let i = 0; i < 3; i++) mesh(box(0.6, 0.35, 0.5), M([0x8a5a2b, 0x2f5fb0, 0xd8231b][i]), -1.6 + i * 0.9, r + 2.22, (i - 1) * 0.3, g);
  const sg = signMesh(1.2, 0.25, o.route ?? 'رمسيس - الجيزة', '#ffffff', '#d8231b'); sg.position.set(L / 2 - 0.66, r + 1.95, 0); sg.rotation.y = Math.PI / 2; g.add(sg);
  const wheels = []; for (const x of [1.75, -1.75]) for (const s of [-1, 1]) wheels.push(wheel(g, x, s * (W / 2 - 0.12), r, 0.28));
  return { g, wheels, L, W, H: r + 2.4, seat: { x: 1.7, y: 0.35, z: -0.55 } };
}

function pickup(o) {
  const g = new THREE.Group(); const L = 5.0, W = 1.95, r = 0.38;
  const body = P(o.color, { shininess: 50 });
  mesh(box(L, 0.6, W), body, 0, r + 0.32, 0, g);
  mesh(box(1.1, 0.35, W - 0.05), body, L / 2 - 0.55, r + 0.75, 0, g);
  mesh(wedge(1.35, 0.85, W - 0.05, 0.35, 0.05), darkGlass, L / 2 - 1.75, r + 1.05, 0, g);
  mesh(box(1.0, 0.07, W - 0.2), body, L / 2 - 1.95, r + 1.5, 0, g);
  // open bed with sides
  for (const s of [-1, 1]) mesh(box(2.4, 0.5, 0.06), body, -1.2, r + 0.87, s * (W / 2 - 0.03), g);
  mesh(box(0.06, 0.5, W), body, -L / 2 + 0.03, r + 0.87, 0, g);
  const load = o.load ?? 'melons';
  if (load === 'melons') for (let i = 0; i < 14; i++) { const m = mesh(new THREE.IcosahedronGeometry(0.22, 0), M(0x2f7a2f), -2.2 + (i % 5) * 0.45, r + 0.85 + Math.floor(i / 5) * 0.25, ((i * 7) % 3 - 1) * 0.5, g); m.scale.set(1.3, 1, 1); }
  else if (load === 'gas') for (let i = 0; i < 8; i++) mesh(cyl(0.16, 0.16, 0.6, 8), M(0x2a6a3a), -2.1 + (i % 4) * 0.4, r + 1.0, (i < 4 ? -0.4 : 0.4), g);
  else for (let i = 0; i < 6; i++) mesh(box(0.55, 0.4, 0.45), M(0xb08850), -2.1 + (i % 3) * 0.6, r + 0.85 + Math.floor(i / 3) * 0.42, ((i % 2) - 0.5) * 0.6, g);
  const ch2 = chrome(); mesh(box(0.14, 0.16, W + 0.04), ch2, L / 2 + 0.03, r + 0.1, 0, g);
  lights(g, L, r + 0.5, W, true); plate(g, L, r + 0.25, true);
  const wheels = []; for (const x of [1.6, -1.6]) for (const s of [-1, 1]) wheels.push(wheel(g, x, s * (W / 2 - 0.1), r, 0.28));
  return { g, wheels, L, W, H: r + 1.6, seat: { x: 1.0, y: 0.1, z: -0.45 } };
}

function truck(o) {
  const g = new THREE.Group(); const L = 7.2, W = 2.4, r = 0.48;
  const cab = P(o.color, { shininess: 50 });
  mesh(box(1.9, 1.9, W), cab, L / 2 - 0.95, r + 1.15, 0, g);
  mesh(box(0.05, 0.8, W - 0.3), darkGlass, L / 2 + 0.005, r + 1.55, 0, g);
  for (const s of [-1, 1]) mesh(box(0.9, 0.7, 0.02), darkGlass, L / 2 - 0.6, r + 1.55, s * (W / 2 + 0.005), g);
  mesh(box(L - 2.0, 2.4, W), M(o.box ?? 0xe8e0d0), -1.0, r + 1.45, 0, g);
  for (const s of [-1, 1]) { const sg = signMesh(3.6, 0.8, o.text ?? 'نقل أثاث - الأمانة', '#e8e0d0', '#1f5fd8'); sg.position.set(-1.0, r + 1.6, s * (W / 2 + 0.01)); sg.rotation.y = s > 0 ? 0 : Math.PI; g.add(sg); }
  mesh(box(L, 0.25, W - 0.2), M(0x222222), 0, r + 0.15, 0, g);
  lights(g, L, r + 0.6, W, true); plate(g, L, r + 0.35, true);
  const wheels = []; for (const x of [2.7, -1.5, -2.6]) for (const s of [-1, 1]) wheels.push(wheel(g, x, s * (W / 2 - 0.15), r, 0.32));
  return { g, wheels, L, W, H: r + 2.8, seat: { x: 2.9, y: 0.65, z: -0.55 } };
}

function bus(o) {
  const g = new THREE.Group(); const L = 10.5, W = 2.6, r = 0.5;
  const body = P(o.color ?? 0xf0f0f0, { shininess: 40 });
  mesh(box(L, 2.6, W), body, 0, r + 1.5, 0, g);
  for (const s of [-1, 1]) { mesh(box(L - 1.2, 0.9, 0.02), darkGlass, -0.3, r + 2.1, s * (W / 2 + 0.005), g); for (let i = 0; i < 8; i++) mesh(box(0.1, 0.9, 0.03), body, -4.6 + i * 1.2, r + 2.1, s * (W / 2 + 0.01), g); mesh(box(L - 0.2, 0.3, 0.02), M(o.stripe ?? 0xd8231b), 0, r + 1.2, s * (W / 2 + 0.008), g); }
  mesh(box(0.05, 1.3, W - 0.2), darkGlass, L / 2 + 0.005, r + 1.95, 0, g);
  mesh(box(0.9, 1.9, 0.02), M(0x222222), L / 2 - 1.2, r + 1.2, W / 2 + 0.012, g);
  const sg = signMesh(2.0, 0.35, o.route ?? 'التحرير - الحي', '#111111', '#ffd400'); sg.position.set(L / 2 + 0.02, r + 2.75, 0); sg.rotation.y = Math.PI / 2; g.add(sg);
  lights(g, L, r + 0.55, W, false, 0.2); plate(g, L, r + 0.35, true);
  const wheels = []; for (const x of [3.6, -3.2]) for (const s of [-1, 1]) wheels.push(wheel(g, x, s * (W / 2 - 0.18), r, 0.34));
  return { g, wheels, L, W, H: r + 2.9, seat: { x: 4.4, y: 0.75, z: -0.65 } };
}

export const CAR_TYPES = {
  sedan: { make: (c) => car({ L: 4.6, W: 2.0, hood: 1.25, trunk: 1.0, color: c, round: true }), max: 21, acc: 9, mass: 1, ar: 'عربية' },
  sedanNew: { make: (c) => car({ L: 4.7, W: 2.05, hood: 1.35, trunk: 1.05, color: c, sf: 0.55, sb: 0.45, cabinH: 0.58 }), max: 25, acc: 11, mass: 1, ar: 'عربية' },
  hatch: { make: (c) => car({ L: 3.8, W: 1.85, hood: 0.95, trunk: 0.25, color: c, sb: 0.12, doors: [0.0], axle: 0.7 }), max: 19, acc: 10, mass: 0.8, ar: 'عربية صغيرة' },
  wagon: { make: (c) => car({ L: 5.0, W: 2.0, hood: 1.35, trunk: 0.3, color: c, sb: 0.1, rack: true, doors: [0.3, -0.7] }), max: 20, acc: 8, mass: 1.1, ar: 'عربية ستيشن' },
  taxi: { make: () => car({ L: 4.6, W: 2.0, hood: 1.25, trunk: 1.0, color: 0x161616, roofColor: 0x161616, taxi: true, round: true }), max: 22, acc: 9, mass: 1, ar: 'تاكسي' },
  taxiWhite: { make: () => car({ L: 4.7, W: 2.05, hood: 1.35, trunk: 1.05, color: 0xf2f2f2, taxi: true, sf: 0.55, sb: 0.45, cabinH: 0.58 }), max: 23, acc: 10, mass: 1, ar: 'تاكسي' },
  microbus: { make: (c) => microbus({ color: c, stripe: 0x1f5fd8 }), max: 18, acc: 6, mass: 1.6, ar: 'ميكروباص' },
  pickup: { make: (c, o) => pickup({ color: c, ...(o || {}) }), max: 18, acc: 7, mass: 1.4, ar: 'ربع نقل' },
  truck: { make: (c) => truck({ color: c }), max: 15, acc: 4.5, mass: 2.6, ar: 'نقل' },
  bus: { make: (c) => bus({ color: c }), max: 14, acc: 4, mass: 3, ar: 'أتوبيس' },
  sport: { make: (c) => { const m = car({ L: 4.8, W: 2.15, hood: 1.75, trunk: 1.0, color: c, bodyH: 0.5, cabinH: 0.46, sf: 0.75, sb: 0.55, wheelR: 0.36, doors: [0.0], seatColor: 0x111111, stripe: 0x111111 });
    // spoiler + side skirts + low front lip
    const sp = P(0x111111, { shininess: 80 }); mesh(box(0.08, 0.3, 0.1), sp, -m.L / 2 + 0.3, 1.05, -0.7, m.g); mesh(box(0.08, 0.3, 0.1), sp, -m.L / 2 + 0.3, 1.05, 0.7, m.g); mesh(box(0.45, 0.06, m.W), sp, -m.L / 2 + 0.3, 1.22, 0, m.g);
    mesh(box(m.L * 0.55, 0.1, 0.06), sp, 0, 0.42, m.W / 2 + 0.03, m.g); mesh(box(m.L * 0.55, 0.1, 0.06), sp, 0, 0.42, -m.W / 2 - 0.03, m.g);
    mesh(box(0.12, 0.08, m.W), sp, m.L / 2 + 0.05, 0.38, 0, m.g); m.H = 1.35; return m; }, max: 36, acc: 17, mass: 0.9, ar: 'عربية سبور ٣٠٠٠' },
};
export const CAR_COLORS = [0xf0f0f0, 0x2a2a2a, 0x8a1a1a, 0x1f3f7a, 0xc8c0a0, 0x5a6a5a, 0x3a6a8a, 0xd8a020, 0x6a2a5a, 0xb0b0b8, 0x2f6a3a];

// Build a vehicle model, then merge everything except the wheels into a few meshes.
export function buildCarModel(type, color, opts) {
  const T = CAR_TYPES[type];
  const m = T.make(color, opts);
  // a simple seated driver for traffic (hidden when the car is parked or you drive it)
  const dummy = new THREE.Group(); dummy.position.set(m.seat.x, m.seat.y, m.seat.z); m.g.add(dummy);
  const skin = [0x8a5a3a, 0xa87048, 0xb98058, 0xc98d5f][Math.floor(Math.random() * 4)], shirt = [0xf0f0f0, 0x1f5fd8, 0x3a3a3a, 0xd8231b, 0x8ab0d8][Math.floor(Math.random() * 5)];
  mesh(box(0.42, 0.58, 0.5), M(shirt), 0, 0.52, 0, dummy);
  mesh(new THREE.SphereGeometry(0.22, 8, 6), M(skin), 0.02, 1.04, 0, dummy);
  mesh(new THREE.SphereGeometry(0.23, 8, 4, 0, Math.PI * 2, 0, Math.PI * 0.45), M(Math.random() < 0.3 ? 0xf2f2f2 : 0x17110c), 0, 1.08, 0, dummy);
  for (const z of [-0.26, 0.26]) { const a = mesh(box(0.42, 0.12, 0.12), M(shirt), 0.25, 0.66, z, dummy); a.rotation.z = -0.3; }
  m.dummy = dummy;
  const keep = new Set([...m.wheels.map(w => w.steer), dummy]);
  bakeModel(m.g, keep); bakeModel(dummy);
  for (const w of m.wheels) bakeModel(w.spin);
  return m;
}
