// =====================================================================
// حادث الطريق الدائري بالوراق — respectful reconstruction (Interior Ministry statement). NO comedy, NO game HUD, no people shown.
// narrator lines: L1 setting, L2 tanker + car weaving, L3 overtake from the right + impact, L4 tanker loses control / microbus / overturns,
// L5 fuel leaks + fire spreads, L6 toll + investigation, L7 condolences, L8 drive carefully
// =====================================================================
const Lx = (i) => LINES[i - 1];
const T_HIT = Lx(3).t1 - 0.6, T_MB = Lx(4).t0 + 4.3, T_ROLL = Lx(4).t0 + 5.9, T_REST = T_ROLL + 1.1, T_FIRE = Lx(5).t0 + 1.4, T_CARD = Lx(7).t0 - 0.4;
const RX = 300; const VS = 13; // road origin, traffic speed (m/s)
const road = new THREE.Group(); road.position.x = RX; scene.add(road);
const LANE = [-3.3, -1.1, 1.1, 3.3];
{
  const at = canvasTex(32, 32, (g) => { g.fillStyle = '#2c2c30'; g.fillRect(0, 0, 32, 32); g.fillStyle = '#34343a'; for (let i = 0; i < 20; i++) g.fillRect((i * 7) % 32, (i * 13) % 32, 1, 1); }); at.wrapS = at.wrapT = THREE.RepeatWrapping; at.repeat.set(4, 120);
  mesh(new THREE.PlaneGeometry(9.6, 1200), M(0xffffff, { map: at }), 0, 0, -400, road).rotation.x = -Math.PI / 2;
  const dash = canvasTex(4, 32, (g) => { g.fillStyle = '#e8e8d8'; g.fillRect(0, 0, 4, 14); }); dash.wrapS = dash.wrapT = THREE.RepeatWrapping; dash.repeat.set(1, 200);
  for (const x of [-2.2, 0, 2.2]) mesh(new THREE.PlaneGeometry(0.12, 1200), M(0xffffff, { map: dash, transparent: true }), x, 0.01, -400, road).rotation.x = -Math.PI / 2;
  for (const x of [-4.7, 4.7]) { mesh(box(0.35, 0.8, 1200), P(0x9a9a92), x, 0.4, -400, road); mesh(box(0.5, 0.12, 1200), P(0xb8b8ae), x, 0.84, -400, road); }
  mesh(box(10.4, 0.6, 1200), P(0x6a6a66), 0, -0.3, -400, road); // the elevated deck
  mesh(new THREE.PlaneGeometry(7.4, 1200), M(0xffffff, { map: at }), -8.6, 0, -400, road).rotation.x = -Math.PI / 2; mesh(box(7.8, 0.6, 1200), P(0x6a6a66), -8.6, -0.3, -400, road);
  for (const x of [-6.6, -10.6]) mesh(new THREE.PlaneGeometry(0.12, 1200), M(0xffffff, { map: dash, transparent: true }), x + 0.9, 0.01, -400, road).rotation.x = -Math.PI / 2;
  mesh(box(0.35, 0.8, 1200), P(0x9a9a92), -12.4, 0.4, -400, road);
  for (let i = 0; i < 60; i++) { const z = 60 - i * 20; for (const s of [-1, 1]) { mesh(cyl(0.07, 0.09, 6, 6), P(0x777777), s * 4.9, 3, z, road); const arm = mesh(box(1.6, 0.08, 0.1), P(0x777777), s * 4.2, 6, z, road); mesh(box(0.5, 0.1, 0.25), new THREE.MeshBasicMaterial({ color: 0xffd890 }), s * 3.5, 5.93, z, road); } }
  // city below: random lit windows / blocks far away
  const r = rng(77);
  for (let i = 0; i < 140; i++) { const s = r() > 0.5 ? 1 : -1; const x = s * (14 + r() * 60), z = 40 - r() * 500, h = 4 + r() * 22; mesh(box(5 + r() * 6, h, 5 + r() * 6), M(0x1a1c26), x, h / 2 - 14, z, road);
    for (let j = 0; j < 4; j++) mesh(new THREE.PlaneGeometry(0.9, 0.9), new THREE.MeshBasicMaterial({ color: r() > 0.3 ? 0xffd08a : 0x9fd0ff }), x - s * 3.2, -12 + r() * h, z + (r() - 0.5) * 4, road).rotation.y = s * Math.PI / 2; }
  // the tunnel 10 portal below the bridge (simple sign)
}
const sign10 = canvasTex(128, 32, () => {}); function drawSign10() { const g = sign10.image.getContext('2d'); g.fillStyle = '#1f6a3a'; g.fillRect(0, 0, 128, 32); g.strokeStyle = '#fff'; g.lineWidth = 2; g.strokeRect(2, 2, 124, 28); g.fillStyle = '#fff'; g.font = '20px Lalezar'; g.direction = 'rtl'; g.textAlign = 'center'; g.fillText('الدائري - الوراق', 64, 24); sign10.needsUpdate = true; }
const gantry = new THREE.Group(); gantry.position.set(RX, 0, -150); scene.add(gantry); mesh(box(10.4, 0.3, 0.3), P(0x666666), 0, 6.5, 0, gantry); for (const s of [-1, 1]) mesh(box(0.25, 6.5, 0.25), P(0x666666), s * 5.0, 3.25, 0, gantry); mesh(new THREE.PlaneGeometry(3.6, 0.9), new THREE.MeshBasicMaterial({ map: sign10 }), 1.6, 5.9, 0.17, gantry);
// ---------- vehicles (front points to -z) ----------
const glowTex = canvasTex(32, 32, (g) => { const gr = g.createRadialGradient(16, 16, 0, 16, 16, 16); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.3, 'rgba(255,255,255,0.5)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 32, 32); });
function glow(parent, col, s, x, y, z) { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: col, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); sp.scale.set(s, s, 1); sp.position.set(x, y, z); parent.add(sp); return sp; }
function wheel(parent, x, y, z, r = 0.33, wdt = 0.24) { const wg = new THREE.Group(); wg.position.set(x, y, z); parent.add(wg); mesh(cyl(r, r, wdt, 14), M(0x141414), 0, 0, 0, wg).rotation.z = Math.PI / 2; mesh(cyl(r * 0.58, r * 0.58, wdt + 0.02, 10), P(0xb8bcc4, { shininess: 120 }), 0, 0, 0, wg).rotation.z = Math.PI / 2; mesh(cyl(r * 0.15, r * 0.15, wdt + 0.04, 6), P(0x555555), 0, 0, 0, wg).rotation.z = Math.PI / 2; return wg; }
function carMesh(col, w = 1.8, l = 4.4, h = 1.42, kind = 'sedan') {
  const g = new THREE.Group(); scene.add(g); const body = new THREE.Group(); g.add(body);
  const paint = P(col, { shininess: 110, specular: 0x666666 }), glass = P(0x1c2836, { shininess: 160, specular: 0xaaaaaa }), trim = P(0x1a1a1a), chrome = P(0xd0d4da, { shininess: 140 });
  const y0 = 0.3; // floor height
  mesh(box(w, 0.42, l), paint, 0, y0 + 0.21, 0, body); // lower body
  mesh(box(w * 0.98, 0.16, l * 0.3), paint, 0, y0 + 0.5, -l * 0.33, body).rotation.x = 0.06; // hood
  mesh(box(w * 0.98, 0.16, l * 0.2), paint, 0, y0 + 0.5, l * 0.39, body); // trunk
  // cabin with sloped glass
  const cab = new THREE.Group(); cab.position.set(0, y0 + 0.58, l * 0.05); body.add(cab);
  const cl = kind === 'hatch' ? l * 0.55 : l * 0.46;
  mesh(box(w * 0.86, 0.06, cl * 0.6), paint, 0, 0.5, 0.02, cab); // roof
  const ws = mesh(box(w * 0.84, 0.06, 0.62), glass, 0, 0.26, -cl * 0.42, cab); ws.rotation.x = -0.9; // windscreen
  const rw = mesh(box(w * 0.84, 0.06, 0.55), glass, 0, 0.26, cl * 0.42, cab); rw.rotation.x = 0.95; // rear window
  for (const s of [-1, 1]) { mesh(box(0.05, 0.42, cl * 0.62), glass, s * w * 0.43, 0.26, 0.02, cab); mesh(box(0.06, 0.44, 0.06), paint, s * w * 0.43, 0.26, 0.0, cab); } // side windows + B pillar
  // bumpers, grille, lights
  mesh(box(w * 1.01, 0.16, 0.14), trim, 0, y0 + 0.08, -l / 2 - 0.03, body); mesh(box(w * 1.01, 0.16, 0.14), trim, 0, y0 + 0.08, l / 2 + 0.03, body);
  mesh(box(w * 0.4, 0.13, 0.03), chrome, 0, y0 + 0.3, -l / 2 - 0.01, body);
  for (const s of [-1, 1]) {
    mesh(box(0.38, 0.12, 0.04), new THREE.MeshBasicMaterial({ color: 0xfff6e0 }), s * w * 0.34, y0 + 0.33, -l / 2 - 0.01, body); glow(body, 0xfff0c8, 1.1, s * w * 0.34, y0 + 0.33, -l / 2 - 0.15);
    mesh(box(0.42, 0.13, 0.04), new THREE.MeshBasicMaterial({ color: 0xff2020 }), s * w * 0.33, y0 + 0.34, l / 2 + 0.01, body); glow(body, 0xff2a2a, 0.75, s * w * 0.33, y0 + 0.34, l / 2 + 0.12);
    mesh(box(0.12, 0.08, 0.16), paint, s * (w / 2 + 0.05), y0 + 0.62, -l * 0.16, body); // mirrors
    mesh(box(0.03, 0.02, l * 0.5), chrome, s * (w / 2 + 0.005), y0 + 0.3, 0, body); // side trim
  }
  const wl = []; for (const [x, z] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) wl.push(wheel(body, x * (w / 2 - 0.08), 0.33, z * l * 0.31));
  return { g, body, wl };
}
function vanMesh(col, stripe) {
  const g = new THREE.Group(); scene.add(g); const body = new THREE.Group(); g.add(body); const w = 2.0, l = 5.0;
  const paint = P(col, { shininess: 100 }), glass = P(0x1c2836, { shininess: 160 });
  mesh(box(w, 1.75, l * 0.82), paint, 0, 1.25, 0.35, body); mesh(box(w, 1.0, l * 0.22), paint, 0, 0.85, -l * 0.39, body);
  const ws = mesh(box(w * 0.92, 0.06, 0.9), glass, 0, 1.62, -l * 0.3, body); ws.rotation.x = -0.75;
  for (const s of [-1, 1]) for (let i = 0; i < 3; i++) mesh(box(0.05, 0.5, 0.8), glass, s * (w / 2 + 0.01), 1.6, -0.4 + i * 1.05, body);
  if (stripe) mesh(box(w + 0.02, 0.18, l * 0.8), P(stripe), 0, 1.0, 0.35, body);
  for (const s of [-1, 1]) { mesh(box(0.36, 0.14, 0.04), new THREE.MeshBasicMaterial({ color: 0xfff6e0 }), s * 0.7, 0.75, -l / 2 - 0.01, body); glow(body, 0xfff0c8, 1.2, s * 0.7, 0.75, -l / 2 - 0.15);
    mesh(box(0.3, 0.3, 0.04), new THREE.MeshBasicMaterial({ color: 0xff2020 }), s * 0.85, 0.9, l / 2 + 0.36, body); glow(body, 0xff2a2a, 0.8, s * 0.85, 0.9, l / 2 + 0.45); }
  const wl = []; for (const [x, z] of [[-1, -1.6], [1, -1.6], [-1, 1.8], [1, 1.8]]) wl.push(wheel(body, x * (w / 2 - 0.08), 0.35, z, 0.36));
  return { g, body, wl };
}
function truckMesh(col) {
  const g = new THREE.Group(); scene.add(g); const body = new THREE.Group(); g.add(body);
  mesh(box(2.3, 2.0, 2.0), P(col, { shininess: 80 }), 0, 1.5, -3.2, body); mesh(box(2.1, 0.7, 0.06), P(0x1c2836, { shininess: 160 }), 0, 2.0, -4.22, body);
  mesh(box(2.4, 2.4, 5.4), P(0xc8c0a8), 0, 1.75, 0.7, body);
  for (const s of [-1, 1]) { glow(body, 0xfff0c8, 1.2, s * 0.8, 0.9, -4.35); glow(body, 0xff2a2a, 0.9, s * 1.0, 0.8, 3.5); }
  const wl = []; for (const z of [-3.1, 1.6, 2.8]) for (const s of [-1, 1]) wl.push(wheel(body, s * 1.05, 0.45, z, 0.45, 0.3));
  return { g, body, wl };
}
function microbus() { return vanMesh(0xf0f0f0, 0x2f6fd8); }
function tankerMesh() {
  const g = new THREE.Group(); scene.add(g); const body = new THREE.Group(); g.add(body);
  mesh(box(2.4, 2.2, 2.2), P(0xf0f0f0), 0, 1.6, -4.4, body); mesh(box(2.2, 0.8, 0.06), P(0x223040, { shininess: 120 }), 0, 2.1, -5.52, body);
  mesh(box(2.4, 0.4, 9.6), P(0x333333), 0, 0.75, 0.5, body);
  const tank = mesh(cyl(1.25, 1.25, 7.6, 14), P(0xd8d8d0, { shininess: 90 }), 0, 2.1, 1.3, body); tank.rotation.x = Math.PI / 2;
  mesh(box(2.52, 0.3, 7.0), P(0xff7a1a), 0, 2.1, 1.3, body); // orange stripe
  for (const s of [-1, 1]) mesh(box(0.3, 0.15, 0.05), new THREE.MeshBasicMaterial({ color: 0xfff6d8 }), s * 0.85, 1.0, -5.52, body);
  for (const s of [-1, 1]) mesh(box(0.35, 0.18, 0.05), new THREE.MeshBasicMaterial({ color: 0xd8231b }), s * 1.0, 0.9, 5.3, body);
  for (const z of [-4.2, 2.2, 3.6, 4.6]) for (const s of [-1, 1]) mesh(cyl(0.5, 0.5, 0.35, 10), M(0x111111), s * 1.1, 0.5, z, body).rotation.z = Math.PI / 2;
  return { g, body };
}
const tanker = tankerMesh(); const sedan = carMesh(0x4a4a56); const mbus = microbus();
const COLS = [0x8a2a2a, 0xd8d8d8, 0x2a4a7a, 0x9a9a9a, 0xd8c8a0, 0x3a6a3a, 0x666a70, 0xe0e0e0, 0x7a5a2a, 0xb0b8c0];
const traffic = []; { const r = rng(5); const kinds = ['sedan', 'sedan', 'hatch', 'van', 'sedan', 'truck', 'hatch', 'sedan'];
  // same direction: ahead of the tanker and a long queue behind
  for (let i = 0; i < 34; i++) { const k = kinds[i % kinds.length]; const c = k === 'van' ? vanMesh([0xf0f0f0, 0xe8e0c8][i % 2], [0x2f6fd8, 0xd8a020][i % 2]) : k === 'truck' ? truckMesh(COLS[i % COLS.length]) : carMesh(COLS[(i * 7) % COLS.length], 1.8, k === 'hatch' ? 3.9 : 4.4, 1.42, k);
    const ahead = i < 12; const lane = LANE[(i * 3 + 1) % 4]; if (!ahead && Math.abs(lane - LANE[2]) < 0.1 && i < 15) continue;
    traffic.push({ c, x: lane + (r() - 0.5) * 0.3, z0: ahead ? -26 - i * 9 - r() * 5 : 16 + (i - 12) * 6.5 + r() * 3, ahead }); } }
// opposite carriageway (other direction), separated by the median
const OPP = []; { const r = rng(9); for (let i = 0; i < 26; i++) { const k = ['sedan', 'hatch', 'van', 'sedan', 'truck'][i % 5]; const c = k === 'van' ? vanMesh(0xf0f0f0, 0x2f6fd8) : k === 'truck' ? truckMesh(COLS[(i * 3) % COLS.length]) : carMesh(COLS[(i * 5) % COLS.length], 1.8, 4.4, 1.42, k);
  OPP.push({ c, x: -6.2 - (i % 3) * 2.2 + (r() - 0.5) * 0.3, z0: 60 - i * 14 - r() * 6 }); } }
const ambul = carMesh(0xf4f4f4, 2.0, 5.0, 2.2); mesh(box(2.02, 0.18, 4.9), P(0xd8231b), 0, 1.0, 0, ambul.body); const siren = [mesh(box(0.4, 0.15, 0.3), new THREE.MeshBasicMaterial({ color: 0x2a6aff }), -0.4, 2.3, -1.6, ambul.body), mesh(box(0.4, 0.15, 0.3), new THREE.MeshBasicMaterial({ color: 0xff2a2a }), 0.4, 2.3, -1.6, ambul.body)];
const sirenL = new THREE.PointLight(0x2a6aff, 0, 14, 1.4); scene.add(sirenL);
// ---------- kinematics ----------
function cruise(z0, t, ts = 1e9, br = 1.5) { if (t < ts) return z0 - VS * t; const d = Math.min(t - ts, br); return z0 - VS * ts - VS * (d - d * d / (2 * br)); }
const TK = { x: LANE[2], z0: 0 };
function tankerPose(t) {
  // straight until the hit, then veer hard left (towards -x), hit the microbus, roll onto the median barrier and stop
  const zHit = TK.z0 - VS * T_HIT;
  if (t < T_HIT) return { x: TK.x, z: TK.z0 - VS * t, yaw: 0, roll: 0, y: 0 };
  const a = seg(t, T_HIT, T_ROLL), vz = VS * (1 - 0.45 * a);
  const z = zHit - VS * Math.min(t - T_HIT, T_ROLL - T_HIT) * (1 - 0.22 * a) - (t > T_ROLL ? VS * 0.5 * Math.min(t - T_ROLL, 1.1) * (1 - Math.min(t - T_ROLL, 1.1) / 2.2) : 0);
  const x = TK.x + (-2.0 - TK.x) * easeInOut(a) + Math.sin(seg(t, T_HIT, T_HIT + 0.6) * Math.PI) * 0.25;
  const yaw = Math.sin(a * Math.PI) * 0.45 + (t > T_ROLL ? 0.25 * seg(t, T_ROLL, T_REST) : 0);
  const roll = t > T_ROLL ? 1.45 * easeIn(seg(t, T_ROLL, T_REST)) : Math.sin(seg(t, T_HIT, T_HIT + 0.5) * Math.PI) * 0.05;
  return { x, z, yaw, roll, y: t > T_ROLL ? 0.7 * Math.sin(seg(t, T_ROLL, T_REST) * Math.PI) * 0.5 : 0 };
}
function sedanPose(t) {
  // weaving lanes behind, then squeezing past on the right and hitting the tanker's rear-right corner
  const t0 = T_HIT - 4.0; const tp = tankerPose(Math.min(t, T_HIT));
  if (t < T_HIT) { const k = seg(t, t0, T_HIT); let x = LANE[1] + Math.sin(seg(t, t0, t0 + 1.4) * Math.PI) * 0 ; if (t < t0 + 1.2) x = VL(V(LANE[1], 0, 0), V(LANE[0] + 0.4, 0, 0), easeInOut(seg(t, t0, t0 + 1.2))).x; else if (t < t0 + 2.6) x = VL(V(LANE[0] + 0.4, 0, 0), V(LANE[3], 0, 0), easeInOut(seg(t, t0 + 1.2, t0 + 2.6))).x; else x = VL(V(LANE[3], 0, 0), V(LANE[2] + 1.75, 0, 0), easeIn(seg(t, t0 + 3.2, T_HIT))).x;
    const zt = tp.z + 5.3 + 2.4; const z = zt + 18 * (1 - easeOut(k)); const yaw = t < t0 + 2.6 ? -Math.cos(seg(t, t0, t0 + 2.6) * Math.PI * 2) * 0.08 : 0.12 * seg(t, t0 + 3.2, T_HIT); return { x, z, yaw, spin: 0 }; }
  const d = t - T_HIT; const zh = tp.z + 7.7; return { x: LANE[2] + 1.75 + Math.min(d, 1.2) * 0.8, z: zh - VS * 0.4 * Math.min(d, 1.4) * (1 - Math.min(d, 1.4) / 2.8), yaw: 0.12 + easeOut(seg(t, T_HIT, T_HIT + 1.4)) * 1.2, spin: 0 };
}
function mbusPose(t) {
  const x = LANE[0] + 0.1; const zMB = tankerPose(T_MB).z - 4.5; if (t < T_MB) return { x, z: zMB + VS * (T_MB - t), yaw: 0 };
  const d = t - T_MB; const k = Math.min(d, 1.2);
  return { x: x - 0.6 * easeOut(seg(t, T_MB, T_MB + 0.8)), z: zMB - VS * 0.6 * k * (1 - k / 2.4), yaw: -0.5 * easeOut(seg(t, T_MB, T_MB + 1.0)) };
}
// fire spreads from the wreck to every car stopped behind it, nearest first
function burnAt(c) { const w = wreck(1e9); const d = Math.max(0, c.g.position.z - w.z); return T_FIRE + 0.4 + d / 9; }
const BURN = []; function burnList(t) { return BURN.filter(c => t >= c.bt); }
function char(c, k) { c.g.traverse(o => { if (o.isMesh && o.material && o.material.color && !o.material.isMeshBasicMaterial) { if (!o.userData.oc) o.userData.oc = o.material.color.clone(); o.material.color.copy(o.userData.oc).lerp(new THREE.Color(0x151210), k); } if (o.isSprite) o.visible = k < 0.5; }); }
function wreck(t) { return tankerPose(Math.max(t, T_REST)); }
function stateAt(t) {
  for (const g of [room, balcony, hallway, kitchen]) g.visible = false; mom.root.visible = dad.root.visible = son.root.visible = samir.root.visible = false; cane.visible = false;
  const tp = tankerPose(t); tanker.g.position.set(RX + tp.x, tp.y, tp.z); tanker.g.rotation.set(0, tp.yaw, 0); tanker.body.rotation.z = tp.roll; { const sn = Math.sin(tp.roll), cs = Math.cos(tp.roll); let mn = 0; for (const x of [-1.25, 1.25]) for (const y of [0, 3.4]) mn = Math.min(mn, x * sn + y * cs); tanker.body.position.y = -mn; tanker.g.position.y = 0; }
  const sp = sedanPose(t); sedan.g.position.set(RX + sp.x, 0, sp.z); sedan.g.rotation.set(0, sp.yaw, 0);
  const mp = mbusPose(t); mbus.g.position.set(RX + mp.x, 0, mp.z); mbus.g.rotation.set(0, mp.yaw, 0);
  const wk = wreck(t);
  traffic.forEach((v, i) => { let z; if (v.ahead) z = v.z0 + (TK.z0 - 0) - VS * 1.05 * t; else { const ts = T_HIT + 0.4 + i * 0.12; z = cruise(v.z0, t, ts, 1.6 + (i % 3) * 0.3); }
    v.c.g.position.set(RX + v.x, 0, z); v.c.g.rotation.set(0, 0, 0); v.zNow = z; });
  { const tz = tankerPose(t).z; OPP.forEach((v) => { const zabs = v.z0 - VS * 0 + 0.95 * VS * t - 140; const rel = (((zabs - tz) + 180) % 360 + 360) % 360 - 180; v.c.g.position.set(RX + v.x, 0, tz + rel); v.c.g.rotation.set(0, Math.PI, 0); }); }
  for (const v of [...traffic, ...OPP]) if (v.c.wl) v.c.wl.forEach(w => { w.rotation.x = -t * 40; });
  // ambulance arrives during the toll line
  const ta = Lx(6).t0 - 1.0; ambul.g.visible = t >= ta; if (ambul.g.visible) { const k = easeOut(seg(t, ta, ta + 4)); ambul.g.position.set(RX + LANE[3], 0, wk.z + 60 - 40 * k); }
  const fl = Math.floor(t * 4) % 2; siren[0].material.color.setHex(fl ? 0x2a6aff : 0x0a1a44); siren[1].material.color.setHex(fl ? 0x440a0a : 0xff2a2a);
  sirenL.position.copy(ambul.g.position).add(V(0, 3, 0)); sirenL.color.setHex(fl ? 0x2a6aff : 0xff2a2a); sirenL.intensity = ambul.g.visible ? 2.5 : 0;
  // lights: night
  scene.background = new THREE.Color(0x070a16); ambient.color.setHex(0x8a96b8); ambient.intensity = 1.05; moon.intensity = 0.9; moon.position.set(RX - 4, 10, 3);
  roomLight.intensity = 0; tvLight.intensity = 0; balcLight.intensity = 0; bathLight.intensity = 0; kitLight.intensity = 0; hallLight.intensity = 0;
  // fire light
  const fk = t >= T_FIRE ? Math.min(1, (t - T_FIRE) / 1.2) : 0; fireL.position.set(RX + wk.x + 1, 3, wk.z + 2); fireL.intensity = fk * (6 + Math.sin(t * 17) * 1.2 + Math.sin(t * 7.3) * 0.8);
  fireL2.position.set(RX + wk.x + 2, 2, wk.z + 9); fireL2.intensity = t >= T_FIRE + 1.2 ? Math.min(1, (t - T_FIRE - 1.2) / 1.5) * (4 + Math.sin(t * 13) * 0.8) : 0;
  if (!BURN.length && t >= T_FIRE) {}
  // charring (time-based, deterministic): compute burn time once from rest positions
  if (BURN.inited !== true) { BURN.inited = true; }
  [mbus, sedan, tanker].forEach(c => { if (c.bt === undefined) c.bt = T_FIRE + (c === tanker ? 0 : 0.5); });
  traffic.forEach(v => { if (!v.ahead) { v.c.bt = T_FIRE + 0.4 + Math.max(0, (cruise(v.z0, 1e3, T_HIT + 0.4 + traffic.indexOf(v) * 0.12, 1.6 + (traffic.indexOf(v) % 3) * 0.3)) - wreck(1e9).z) / 9; } });
  if (BURN.length === 0) { BURN.push(mbus, sedan); traffic.forEach(v => { if (!v.ahead) BURN.push(v.c); }); }
  [...BURN, tanker].forEach(c => char(c, t >= c.bt ? Math.min(1, (t - c.bt) / 2.5) : 0));
  hitL.position.set(RX + LANE[2] + 1.2, 1, tankerPose(T_HIT).z + 5.3); hitL.intensity = inT(t, T_HIT, T_HIT + 0.15) || inT(t, T_MB, T_MB + 0.12) ? 6 : 0;
  fill.position.copy(camera.position); fill.intensity = 1.2; fill.distance = 30;
}
const fireL = new THREE.PointLight(0xff7a2a, 0, 40, 1.2); scene.add(fireL); const fireL2 = new THREE.PointLight(0xff8a3a, 0, 30, 1.3); scene.add(fireL2);
const hitL = new THREE.PointLight(0xfff0c0, 0, 12, 1.5); scene.add(hitL);
const flameTex = canvasTex(32, 64, (g) => { const gr = g.createRadialGradient(16, 46, 1, 16, 40, 22); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.35, 'rgba(255,255,255,0.75)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.beginPath(); g.moveTo(16, 2); g.bezierCurveTo(30, 30, 30, 62, 16, 62); g.bezierCurveTo(2, 62, 2, 30, 16, 2); g.fill(); });
const firePool = spritePool(flameTex, 280);
const pool = mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ color: 0xff6a1a, transparent: true, opacity: 0.0, blending: THREE.AdditiveBlending, depthWrite: false }), 0, 0.03, 0, scene); pool.rotation.x = -Math.PI / 2; firePool.forEach(s => { s.material.blending = THREE.AdditiveBlending; });
const smokePool = spritePool(puffTex, 40);
function shotAt(t) {
  const tp = tankerPose(t), wk = wreck(t);
  if (t < Lx(2).t0 - 0.1) { const k = easeInOut(seg(t, 0, Lx(2).t0)); cam(V(RX + 20 - 8 * k, 26 - 6 * k, tp.z + 40 - 10 * k), V(RX, 0, tp.z - 10), 55); return; }
  if (t < Lx(3).t0 - 0.1) { cam(V(RX + 2.5, 7.0, tp.z + 24), V(RX + 0.8, 1.0, tp.z + 4), 55); return; }
  if (t < T_HIT + 0.9) { cam(V(RX + 3.6, 4.2, tp.z + 17), V(RX + 1.6, 1.0, tp.z + 4), 54); camera.position.add(shake(t, inT(t, T_HIT, T_HIT + 0.5) ? 0.15 : 0)); return; }
  if (t < T_FIRE) { const ref = tankerPose(Math.min(t, T_REST)); cam(V(RX + 3.5, 10, ref.z + 22), V(RX + ref.x * 0.5 - 0.5, 1.0, ref.z - 2), 58); camera.position.add(shake(t, inT(t, T_MB, T_MB + 0.4) || inT(t, T_REST - 0.2, T_REST + 0.3) ? 0.2 : 0)); return; }
  if (t < Lx(6).t0 - 0.1) { const k = easeInOut(seg(t, T_FIRE, Lx(6).t0)); cam(V(RX + 10 + 4 * k, 6 + 8 * k, wk.z + 24 + 8 * k), V(RX - 1, 2, wk.z + 4), 55); return; }
  const k = easeInOut(seg(t, Lx(6).t0, DUR)); cam(V(RX + 26 + 6 * k, 30 + 8 * k, wk.z + 46 + 10 * k), V(RX - 1, 0, wk.z + 6), 50);
}
function particles(t) {
  const fire = [], smoke = [], st = []; pool.material.opacity = 0;
  if (inT(t, T_HIT, T_HIT + 0.5)) { const p = V(RX + LANE[2] + 1.2, 1.0, tankerPose(T_HIT).z + 5.4); for (let i = 0; i < 8; i++) { const a = (t - T_HIT) * 8; st.push({ pos: p.clone().add(V(Math.cos(i) * a * 0.3, 0.2 + Math.sin(i * 2) * a * 0.2, Math.sin(i) * a * 0.3)), size: 0.3, color: 0xffe08a }); } }
  if (inT(t, T_MB, T_MB + 0.5)) { const p = mbus.g.position.clone().add(V(1.0, 1.2, 0)); for (let i = 0; i < 8; i++) { const a = (t - T_MB) * 8; st.push({ pos: p.clone().add(V(Math.cos(i) * a * 0.3, Math.sin(i * 2) * a * 0.2, Math.sin(i) * a * 0.3)), size: 0.3, color: 0xffe08a }); } }
  // fuel leak shimmer before ignition
  if (inT(t, T_REST - 0.2, T_FIRE + 0.3)) { const w = wreck(t); for (let i = 0; i < 6; i++) smoke.push({ pos: V(RX + w.x + 0.8 + i * 0.4, 0.05, w.z + 1 + i * 0.6), size: 1.2, op: 0.25, color: 0x8a7a3a }); }
  if (t >= T_FIRE) {
    const w = wreck(t); const age = t - T_FIRE; const spread = Math.min(1, age / 4.5);
    // fire spreads back from the wreck over the stopped cars
    const pts = [V(RX + w.x + 0.5, 0, w.z - 2), V(RX + w.x + 0.8, 0, w.z + 2), V(RX + w.x + 1.0, 0, w.z + 5)];
    burnList(t).forEach(c => pts.push(c.g.position.clone()));
    let n = 0; pts.forEach((p, j) => { for (let i = 0; i < (j < 3 ? 7 : 4) && n < 170; i++, n++) { const k = (t * (0.9 + (i % 3) * 0.2) + i / 6 + j * 0.37) % 1; const big = j < 3 ? 1.9 : 1.4; fire.push({ pos: p.clone().add(V(Math.sin(i * 2.1 + j) * 0.9 * big, 0.4 + k * 3.2 * big, Math.cos(i * 1.7 + j) * 0.9 * big)), size: (1.6 - k * 0.8) * big * Math.min(1, age * 1.5), sx: 0.7, op: 0.85 * (1 - k), color: k < 0.3 ? 0xffe08a : k < 0.6 ? 0xff8a2a : 0xd8401a }); } });
    { const reach = 6 + 40 * Math.min(1, age / 7); let m = 0;
      for (let z = -4; z < reach && m < 110; z += 2.6) for (let xi = 0; xi < 5 && m < 110; xi++, m++) { const x = -3.8 + xi * 1.9 + Math.sin(z * 1.7 + xi) * 0.5; const k = (t * 1.3 + xi * 0.21 + z * 0.13) % 1; const fade = Math.min(1, (reach - z) / 4);
        fire.push({ pos: V(RX + x, 0.4 + k * 1.6, w.z + z), size: (2.0 - k * 1.0) * fade, sx: 0.65, op: 0.75 * (1 - k) * fade, color: k < 0.35 ? 0xffd070 : 0xff6a1a }); }
      pool.position.set(RX - 0.6, 0.03, w.z + reach / 2 - 2); pool.scale.set(8.6, reach + 4, 1); pool.material.opacity = 0.35 + Math.sin(t * 9) * 0.05; }
    for (let i = 0; i < 40; i++) { const k = (t * 0.25 + i / 40) % 1; smoke.push({ pos: V(RX + w.x + 2 + Math.sin(i * 1.3) * 2.5 + k * 4, 3 + k * 18, w.z + 4 + (i / 40) * 40 * spread + Math.cos(i * 0.9) * 3 + k * 3), size: 2 + k * 6, op: 0.55 * (1 - k) * Math.min(1, age), color: 0x1a1a1e }); }
  }
  emit(fire, firePool); emit(smoke, smokePool); emit(st, starPool); emit([], puffPool); emit([], trailPool); emit([], sweatPool);
}
// ---------- overlays ----------
function drawSub(g, t) {
  if (t >= T_CARD) return; const l = LINES.find(l => t >= l.t0 - 0.05 && t < l.t1 + 0.3); if (!l || !l.ar) return;
  const a = Math.min(1, (t - l.t0 + 0.05) / 0.25, (l.t1 + 0.3 - t) / 0.25);
  g.save(); g.globalAlpha = a; const lines = wrapAr(g, l.ar, 26, W - 70); const hh = 20 + lines.length * 38;
  g.fillStyle = 'rgba(0,0,0,0.62)'; g.fillRect(20, H - 70 - hh, W - 40, hh); lines.forEach((s, i) => arText(g, s, W / 2, H - 70 - hh + 6 + i * 38, 26, '#fff', 'center')); g.restore();
}
function wrapAr(g, s, size, maxW) { g.font = `${size}px Lalezar`; const w = s.split(' '); const out = []; let cur = ''; for (const x of w) { const c = cur ? cur + ' ' + x : x; if (g.measureText(c).width > maxW && cur) { out.push(cur); cur = x; } else cur = c; } if (cur) out.push(cur); return out; }
function drawTitle(g, t) {
  if (t > Lx(2).t0 + 0.5) return; const a = Math.min(1, t / 0.6, (Lx(2).t0 + 0.5 - t) / 0.5);
  g.save(); g.globalAlpha = a; g.fillStyle = 'rgba(0,0,0,0.55)'; g.fillRect(0, 90, W, 120); arText(g, 'حادث الطريق الدائري - الوراق', W / 2, 96, 34, '#fff', 'center', 'ReemKufi'); arText(g, 'الأربعاء ٢٥ نوفمبر ٢٠٢٦', W / 2, 150, 24, '#ffd890', 'center'); g.restore();
}
function drawNote(g, t) {
  if (t < Lx(2).t0 || t >= T_CARD) return; g.save(); g.globalAlpha = 0.85; g.fillStyle = 'rgba(0,0,0,0.5)'; g.fillRect(0, 22, W, 34); arText(g, 'إعادة تمثيل توضيحية وفقًا لبيان وزارة الداخلية', W / 2, 22, 19, '#ddd', 'center'); g.restore();
}
function drawCard(g, t) {
  if (t < T_CARD - 0.6) return; const k = easeInOut(seg(t, T_CARD - 0.6, T_CARD + 0.6));
  g.fillStyle = `rgba(0,0,0,${0.88 * k})`; g.fillRect(0, 0, W, H); if (t < T_CARD) return; const a = easeOut(seg(t, T_CARD, T_CARD + 1.0));
  g.save(); g.globalAlpha = a; g.translate(W / 2, 230);
  g.fillStyle = '#2a2a2a'; g.strokeStyle = '#888'; g.lineWidth = 2; g.beginPath(); g.moveTo(-10, 0); g.lineTo(-38, 90); g.lineTo(-20, 92); g.lineTo(0, 30); g.lineTo(20, 92); g.lineTo(38, 90); g.lineTo(10, 0); g.closePath(); g.fill(); g.stroke(); g.beginPath(); g.arc(0, -14, 22, 0, 7); g.fill(); g.stroke();
  arText(g, 'خالص العزاء لأهالي الضحايا', 0, 120, 38, '#ffffff', 'center', 'ReemKufi');
  arText(g, 'ربنا يرحمهم ويغفر لهم', 0, 190, 30, '#ffd890', 'center'); arText(g, 'ويشفي المصابين ويصبّر أهاليهم', 0, 230, 30, '#ffd890', 'center');
  arText(g, 'إنا لله وإنا إليه راجعون', 0, 300, 32, '#ffffff', 'center', 'ReemKufi');
  g.globalAlpha = a * easeOut(seg(t, Lx(8).t0, Lx(8).t0 + 0.8)); arText(g, 'سوق براحة... في حد مستنيك في البيت', 0, 390, 26, '#9fd0ff', 'center');
  g.globalAlpha = a * 0.7; arText(g, 'المصدر: بيان وزارة الداخلية ووزارة الصحة • التحقيقات مستمرة', 0, 520, 16, '#aaa', 'center');
  g.restore();
  if (t > DUR - 0.8) { g.fillStyle = `rgba(0,0,0,${clamp((t - DUR + 0.8) / 0.8)})`; g.fillRect(0, 0, W, H); }
}
const lateDraw0 = [drawSign10];
window.renderFrame = function (t) {
  stateAt(t); shotAt(t); particles(t);
  renderer.render(scene, camera);
  ctx.clearRect(0, 0, W, H); ctx.filter = 'saturate(0.75)'; ctx.drawImage(glCanvas, 0, 0); ctx.filter = 'none';
  h.clearRect(0, 0, W, H);
  drawTitle(h, t); drawNote(h, t); drawSub(h, t); drawCard(h, t);
  ctx.drawImage(hud, 0, 0); vignette(ctx, 0.45);
  return true;
};
window.frameData = () => out.toDataURL('image/png');
window.DUR = DUR;
document.fonts.load('10px PS2P').then(() => document.fonts.load('20px Lalezar', 'ع')).then(() => document.fonts.load('700 20px ReemKufi', 'ع')).then(() => { lateDraw0.forEach(f => f()); window.READY = true; });
