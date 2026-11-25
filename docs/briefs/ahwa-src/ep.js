// =====================================================================
// مولّد أصوات الشغل النووي — Ibrahim at the café playing backgammon with Abu Samir, lying to Om Hamada on the phone. vertical 9:16
// linear. L01 mom(room) L02 dad(café) L03 samir L04 mom L05 dad L06 mom L07 dad L08 samir L09 mom(café) L10 dad(CTA, balcony) L11-12 anno
// =====================================================================
const Lx = (i) => LINES[i - 1];
const T_CAFE = Lx(2).t0 - 0.15, T_BTN = Lx(2).vox[Lx(2).vox.length - 1][0] - 0.1, T_BUST = Lx(3).t0 + 0.4;
const T_WALK0 = Lx(7).t0 + 0.2, T_WALK1 = Lx(7).t1 + 0.4, T_REVEAL = Lx(8).t1 - 0.9, T_BALC = Lx(10).t0 - 0.25, T_ANNO = Lx(11).t0;
const T_ETA0 = Lx(6).t1 - 0.2, T_ETARESET = Lx(7).vox[Lx(7).vox.length - 1][0];
const LIES = [Lx(2).vox[1] ? Lx(2).vox[1][1] : Lx(2).t1, Lx(5).t1 - 0.2, Lx(7).t1 - 0.2];
const lateDraw = [];
const inRoom = (t) => t < T_CAFE || inT(t, Lx(4).t0 - 0.1, Lx(5).t0 - 0.1) || inT(t, Lx(6).t0 - 0.1, Lx(7).t0 - 0.1);

// ---------- props at home: cold lunch + phone ----------
const lunch = new THREE.Group(); scene.add(lunch); lunch.position.set(0, 0, -1.25);
mesh(cyl(0.16, 0.13, 0.08, 10), P(0xffffff), 0, 0.84, -0.1, lunch); mesh(cyl(0.13, 0.13, 0.02, 10), M(0xd89a3a), 0, 0.88, -0.1, lunch); // molokhia? rice
mesh(cyl(0.15, 0.12, 0.07, 10), P(0xffffff), -0.5, 0.83, -0.15, lunch); mesh(cyl(0.12, 0.12, 0.02, 10), M(0x2f7a2a), -0.5, 0.86, -0.15, lunch);
mesh(new THREE.IcosahedronGeometry(0.1, 0), M(0xb0502a), 0.45, 0.88, -0.1, lunch).scale.set(1.4, 0.7, 1);
const flies = []; for (let i = 0; i < 3; i++) flies.push(mesh(box(0.03, 0.03, 0.03), M(0x111111), 0, 0, 0, scene));
const phoneM = new THREE.Group(); scene.add(phoneM); mesh(box(0.05, 0.13, 0.015), P(0x222222), 0, 0, 0, phoneM); mesh(new THREE.PlaneGeometry(0.04, 0.1), new THREE.MeshBasicMaterial({ color: 0x9fd0ff }), 0, 0, 0.009, phoneM);
const phoneD = new THREE.Group(); scene.add(phoneD); mesh(box(0.05, 0.13, 0.015), P(0x222222), 0, 0, 0, phoneD); mesh(new THREE.PlaneGeometry(0.04, 0.1), new THREE.MeshBasicMaterial({ color: 0x9fd0ff }), 0, 0, 0.009, phoneD);
const slipper = new THREE.Group(); scene.add(slipper); mesh(box(0.11, 0.025, 0.28), P(0x2f6fff), 0, 0, 0, slipper); mesh(box(0.11, 0.03, 0.05), P(0x2f6fff), 0, 0.03, 0.05, slipper);

// ---------- THE CAFÉ (x = 180) «قهوة الحاج» ----------
const CX = 180;
const cafe = new THREE.Group(); cafe.position.x = CX; scene.add(cafe);
{
  const tiles = canvasTex(16, 16, (g) => { g.fillStyle = '#8a8478'; g.fillRect(0, 0, 16, 16); g.fillStyle = '#76705f'; g.fillRect(0, 0, 8, 8); g.fillRect(8, 8, 8, 8); }); tiles.wrapS = tiles.wrapT = THREE.RepeatWrapping; tiles.repeat.set(10, 8);
  mesh(new THREE.PlaneGeometry(14, 10), M(0xffffff, { map: tiles }), 0, 0, -1, cafe).rotation.x = -Math.PI / 2;
  const asph = mesh(new THREE.PlaneGeometry(14, 6), M(0x3a3a3e), 0, 0.005, 5.5, cafe); asph.rotation.x = -Math.PI / 2;
  // facade
  const wallT = canvasTex(32, 32, (g) => { g.fillStyle = '#c9a77a'; g.fillRect(0, 0, 32, 32); g.fillStyle = '#b8956a'; for (let i = 0; i < 9; i++) g.fillRect((i * 13) % 30, (i * 7) % 30, 3, 2); }); wallT.wrapS = wallT.wrapT = THREE.RepeatWrapping; wallT.repeat.set(6, 4);
  mesh(new THREE.PlaneGeometry(14, 9), M(0xffffff, { map: wallT }), 0, 4.5, -3.2, cafe);
  // café door/inside glow + shutter
  mesh(new THREE.PlaneGeometry(2.4, 2.3), new THREE.MeshBasicMaterial({ color: 0xffc070 }), -0.2, 1.15, -3.18, cafe);
  mesh(box(2.6, 0.12, 0.1), P(0x555555), -0.2, 2.35, -3.15, cafe);
  for (const x of [-4.2, 3.6]) { mesh(new THREE.PlaneGeometry(1.0, 1.3), new THREE.MeshBasicMaterial({ color: 0x2a3550 }), x, 1.6, -3.18, cafe); mesh(box(1.2, 0.08, 0.15), P(0x6a5a48), x, 0.92, -3.12, cafe); }
  // upper floor windows + balconies + AC units + satellite dish
  for (let fl = 0; fl < 2; fl++) for (const x of [-4, -1.3, 1.4, 4.1]) {
    const y = 4.0 + fl * 2.6; mesh(new THREE.PlaneGeometry(0.9, 1.2), new THREE.MeshBasicMaterial({ color: (x + fl) % 2 ? 0xffd890 : 0x2a3550 }), x, y, -3.18, cafe);
    mesh(box(1.3, 0.08, 0.6), P(0x9a8a78), x, y - 0.7, -2.9, cafe); for (let i = 0; i < 6; i++) mesh(box(0.03, 0.5, 0.03), P(0x333333), x - 0.6 + i * 0.24, y - 0.42, -2.62, cafe);
    if ((x + fl * 3) % 3 < 1) mesh(box(0.6, 0.4, 0.3), P(0xe8e8e8), x + 0.75, y + 0.3, -3.05, cafe);
  }
  const dishS = mesh(new THREE.SphereGeometry(0.4, 8, 4, 0, Math.PI * 2, 0, Math.PI * 0.4), P(0xdddddd, { side: THREE.DoubleSide }), 2.6, 7.6, -2.8, cafe); dishS.rotation.x = 1.2;
  // awning
  const aw = canvasTex(16, 4, (g) => { for (let i = 0; i < 16; i += 4) { g.fillStyle = '#1f8a4a'; g.fillRect(i, 0, 2, 4); g.fillStyle = '#f4f0e0'; g.fillRect(i + 2, 0, 2, 4); } }); aw.wrapS = THREE.RepeatWrapping; aw.repeat.set(6, 1);
  const awn = mesh(new THREE.PlaneGeometry(6.5, 1.2), M(0xffffff, { map: aw, side: THREE.DoubleSide }), -0.2, 2.75, -2.7, cafe); awn.rotation.x = -1.0;
  // string bulbs
  for (let i = 0; i < 14; i++) { const x = -3.4 + i * 0.5; mesh(new THREE.SphereGeometry(0.05, 6, 4), new THREE.MeshBasicMaterial({ color: [0xffe08a, 0xff8a5a, 0x8affc0][i % 3] }), x, 2.9 - Math.sin(i / 13 * Math.PI) * 0.35, -0.9, cafe); }
  mesh(cyl(0.05, 0.05, 3.2, 6), P(0x555555), -3.6, 1.6, -0.9, cafe); mesh(cyl(0.05, 0.05, 3.2, 6), P(0x555555), 3.4, 1.6, -0.9, cafe);
  // background table + chairs
  for (const [x, z] of [[-2.6, -1.9], [2.4, -2.0], [3.2, 0.4]]) { mesh(cyl(0.35, 0.35, 0.03, 10), P(0xc9ccd1), x, 0.72, z, cafe); mesh(cyl(0.03, 0.03, 0.72, 6), P(0x777777), x, 0.36, z, cafe); mesh(cyl(0.035, 0.03, 0.08, 6), P(0xdff4ff, { transparent: true, opacity: 0.8 }), x + 0.1, 0.78, z, cafe); }
  // minaret silhouette
  mesh(cyl(0.25, 0.3, 4, 8), M(0x6a6a78), -6, 9.5, -6, cafe); mesh(new THREE.ConeGeometry(0.3, 0.8, 8), M(0x6a6a78), -6, 11.9, -6, cafe);
}
// neon sign
const signT = canvasTex(256, 64, (g) => {});
function drawSign() { const g = signT.image.getContext('2d'); g.fillStyle = '#0a1a10'; g.fillRect(0, 0, 256, 64); g.shadowColor = '#3dff7a'; g.shadowBlur = 10; g.fillStyle = '#7dffaa'; g.font = '44px Lalezar'; g.direction = 'rtl'; g.textAlign = 'center'; g.fillText('قهوة الحاج', 128, 50); signT.needsUpdate = true; }
lateDraw.push(drawSign);
const sign = mesh(new THREE.PlaneGeometry(2.4, 0.6), new THREE.MeshBasicMaterial({ map: signT }), CX - 0.2, 3.25, -3.1, scene);
// main table, chairs, tawla, tea, shisha
const TB = V(CX, 0, -0.55);
const mainT = new THREE.Group(); mainT.position.copy(TB); scene.add(mainT);
mesh(cyl(0.45, 0.45, 0.03, 12), P(0xc9ccd1, { shininess: 60 }), 0, 0.72, 0, mainT); mesh(cyl(0.04, 0.04, 0.72, 6), P(0x777777), 0, 0.36, 0, mainT); mesh(cyl(0.25, 0.25, 0.02, 8), P(0x777777), 0, 0.01, 0, mainT);
const tawT = canvasTex(32, 16, (g) => { g.fillStyle = '#6a3a1a'; g.fillRect(0, 0, 32, 16); g.fillStyle = '#e8d8b0'; g.fillRect(1, 1, 30, 14); for (let i = 0; i < 12; i++) { g.fillStyle = i % 2 ? '#8a2a1a' : '#2a2a2a'; const x = 1 + (i % 6) * 2.5 + (i >= 6 ? 15 : 0); g.beginPath(); g.moveTo(x, 1); g.lineTo(x + 2.5, 1); g.lineTo(x + 1.25, 7); g.fill(); g.beginPath(); g.moveTo(x, 15); g.lineTo(x + 2.5, 15); g.lineTo(x + 1.25, 9); g.fill(); } g.fillStyle = '#6a3a1a'; g.fillRect(15, 0, 2, 16); });
const tawla = mesh(box(0.56, 0.03, 0.3), M(0xffffff, { map: tawT }), 0, 0.75, 0.05, mainT); tawla.rotation.y = 0.1;
const pieces = []; for (let i = 0; i < 10; i++) pieces.push(mesh(cyl(0.022, 0.022, 0.012, 8), P(i % 2 ? 0xf4f0e0 : 0x2a2a2a), -0.22 + (i % 5) * 0.11, 0.773, 0.05 + (i < 5 ? -0.09 : 0.09), mainT));
const dice = []; for (let i = 0; i < 2; i++) dice.push(mesh(box(0.03, 0.03, 0.03), P(0xffffff), 0.1 + i * 0.05, 0.785, 0.02, mainT));
for (const x of [-0.32, 0.32]) { mesh(cyl(0.03, 0.025, 0.08, 6), P(0xdff4ff, { transparent: true, opacity: 0.75 }), x, 0.78, 0.25, mainT); mesh(cyl(0.025, 0.025, 0.05, 6), M(0x8a2a10), x, 0.765, 0.25, mainT); }
const shisha = new THREE.Group(); shisha.position.set(CX + 0.95, 0, -0.75); scene.add(shisha);
mesh(new THREE.SphereGeometry(0.16, 8, 6), P(0x3a7a9a, { transparent: true, opacity: 0.8 }), 0, 0.16, 0, shisha); mesh(cyl(0.03, 0.03, 0.55, 6), P(0xc9a227), 0, 0.55, 0, shisha);
mesh(cyl(0.08, 0.04, 0.1, 8), P(0xa04a2a), 0, 0.86, 0, shisha); mesh(cyl(0.05, 0.05, 0.02, 8), new THREE.MeshBasicMaterial({ color: 0xff5a1a }), 0, 0.92, 0, shisha);
mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([V(0, 0.45, 0), V(-0.3, 0.2, 0.2), V(-0.6, 0.7, 0.3)]), 12, 0.015, 5), M(0x8a1a2a), 0, 0, 0, shisha);
// chairs under the two players
function chairAt(x, z, ry) { const c = new THREE.Group(); c.position.set(x, 0, z); c.rotation.y = ry; scene.add(c); mesh(box(0.42, 0.04, 0.42), M(0x8a5a2b, { map: woodTex }), 0, 0.46, 0, c); mesh(box(0.42, 0.5, 0.04), M(0x8a5a2b, { map: woodTex }), 0, 0.72, -0.2, c); for (const [a, b] of [[-0.18, -0.18], [0.18, -0.18], [-0.18, 0.18], [0.18, 0.18]]) mesh(box(0.035, 0.46, 0.035), M(0x6a4220), a, 0.23, b, c); return c; }
const DADC = V(CX - 0.62, 0, -0.42), SAMC = V(CX + 0.62, 0, -0.42);
chairAt(DADC.x - 0.08, DADC.z - 0.04, 1.15); chairAt(SAMC.x + 0.08, SAMC.z - 0.04, -1.15);
// ---------- the Nuclear Work-Noise Generator 3000 ----------
const gen = new THREE.Group(); gen.position.set(CX - 0.05, 0.735, -0.88); gen.rotation.y = 0.15; scene.add(gen);
const genBody = new THREE.Group(); gen.add(genBody);
mesh(box(0.42, 0.22, 0.14), P(0x8a8f96), 0, 0.11, 0, genBody);
for (const s of [-1, 1]) { mesh(cyl(0.065, 0.065, 0.02, 10), M(0x222222), s * 0.12, 0.11, 0.071, genBody).rotation.x = Math.PI / 2; mesh(cyl(0.025, 0.025, 0.025, 8), P(0x555555), s * 0.12, 0.11, 0.08, genBody).rotation.x = Math.PI / 2; }
mesh(box(0.1, 0.05, 0.02), M(0x223322), 0, 0.17, 0.072, genBody);
mesh(cyl(0.006, 0.006, 0.35, 4), P(0xcccccc), 0.17, 0.38, -0.03, genBody).rotation.z = -0.3;
const horn = mesh(new THREE.ConeGeometry(0.07, 0.16, 8, 1, true), P(0xffd400, { side: THREE.DoubleSide }), -0.27, 0.16, 0.0, genBody); horn.rotation.z = Math.PI / 2;
const btn = mesh(cyl(0.035, 0.035, 0.03, 10), new THREE.MeshBasicMaterial({ color: 0xd8231b }), 0.0, 0.235, 0.02, genBody);
const nukeG = canvasTex(16, 16, (g) => { g.fillStyle = '#ffd400'; g.fillRect(0, 0, 16, 16); g.fillStyle = '#111'; g.beginPath(); g.arc(8, 8, 2, 0, 7); g.fill(); for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(8, 8); g.arc(8, 8, 7, i * 2.09, i * 2.09 + 1.05); g.fill(); } });
mesh(new THREE.PlaneGeometry(0.07, 0.07), M(0xffffff, { map: nukeG }), 0, 0.06, 0.072, genBody);
const hamArm = new THREE.Group(); hamArm.position.set(0.21, 0.2, 0); genBody.add(hamArm);
mesh(box(0.2, 0.015, 0.015), P(0x6a4220), 0.1, 0, 0, hamArm); mesh(box(0.04, 0.06, 0.035), P(0x555555), 0.2, -0.02, 0, hamArm);
mesh(cyl(0.06, 0.06, 0.015, 10), P(0x9a9aa2, { shininess: 80 }), 0.42, -0.19, 0, genBody); // pan it hits
// ---------- waiter ----------
const waiter = makeChar({
  seed: 31, skin: 0xa86a40, hipY: 0.88, legX: 0.11, legColor: 0x222222, shoe: 0x111111, hand: 0xa86a40,
  torsoGeo: cyl(0.23, 0.22, 0.68, 6), torsoTex: null, torsoColor: 0xf4f4f0, torsoY: 0.34, sleeve: true, sleeveColor: 0xf4f4f0,
  shoulderX: 0.3, shoulderY: 0.62, neckY: 0.7, headR: 0.26,
  build(head, torso, reg) { mesh(new THREE.SphereGeometry(0.27, 8, 4, 0, Math.PI * 2, 0, Math.PI * 0.35), reg(M(0x17110c)), 0, 0.04, -0.02, head); mesh(box(0.42, 0.5, 0.05), reg(M(0x222222)), 0, 0.4, 0.2, torso); return {}; }
}, scene);
const tray = new THREE.Group(); scene.add(tray); mesh(cyl(0.18, 0.18, 0.015, 10), P(0xc9ccd1), 0, 0, 0, tray); for (let i = 0; i < 3; i++) mesh(cyl(0.03, 0.025, 0.08, 6), P(0xdff4ff, { transparent: true, opacity: 0.8 }), Math.cos(i * 2) * 0.09, 0.04, Math.sin(i * 2) * 0.09, tray);
// ---------- Abu Samir (defined in the engine, parented to the upper floor) ----------
scene.add(samir.root); cane.visible = false;
// balcony: plastic chair + little tawla table
const chairB = new THREE.Group(); balcony.add(chairB); chairB.position.set(0.0, 0, -0.35);
mesh(box(0.48, 0.05, 0.45), P(0x2fae5a), 0, 0.45, 0, chairB); mesh(box(0.48, 0.5, 0.05), P(0x2fae5a), 0, 0.72, -0.2, chairB);
for (const [x, z] of [[-0.2, -0.18], [0.2, -0.18], [-0.2, 0.18], [0.2, 0.18]]) mesh(box(0.04, 0.45, 0.04), P(0x2fae5a), x, 0.22, z, chairB);
const btab = new THREE.Group(); balcony.add(btab); btab.position.set(0.75, 0, 0.05);
mesh(box(0.5, 0.04, 0.4), P(0xf0f0f0), 0, 0.5, 0, btab); for (const [x, z] of [[-0.2, -0.16], [0.2, -0.16], [-0.2, 0.16], [0.2, 0.16]]) mesh(box(0.03, 0.5, 0.03), P(0xf0f0f0), x, 0.25, z, btab);
mesh(box(0.42, 0.03, 0.24), M(0xffffff, { map: tawT }), 0, 0.535, 0, btab);

// positions
const MOMR = V(0.85, 0, -0.5), MOMC0 = V(CX - 4.2, 0, -1.6), MOMC = V(CX - 0.75, 0, -1.5);
const SEAT = { ...POSE0, lL: 1.45, lR: 1.45, aLx: 0.7, eL: 1.1, aRx: 0.7, eR: 1.1 };
const EARPOSE = (p) => { p.aRx = 0.5; p.aRz = 0.9; p.eR = 2.5; return p; };
function stateAt(t) {
  const balc = t >= T_BALC, home = inRoom(t), cafeOn = !home && !balc;
  son.root.visible = false;
  room.visible = home; balcony.visible = balc; kitchen.visible = false; cafe.visible = cafeOn;
  for (const o of [sign, mainT, shisha, gen, tray]) o.visible = cafeOn; lunch.visible = home;
  scene.traverse && 0;
  // waiter strolls in the back, shouting with tray
  waiter.root.visible = cafeOn; { const k = (t * 0.12) % 1; const x = CX - 3 + Math.sin(k * 6.28) * 2.2; waiter.root.position.set(x, 0, -2.3); waiter.root.rotation.set(0, Math.cos(k * 6.28) > 0 ? 1.4 : -1.4, 0);
    const p = { ...POSE0, aRx: 1.3, eR: 1.4, aRz: 0.2, lL: Math.max(0, Math.sin(t * 6)) * 0.4, lR: Math.max(0, -Math.sin(t * 6)) * 0.4 }; applyPose(waiter, p); setFace(waiter, 'flat', 'smile', { stache: true });
    const hp = waiter.arms[1].hand.getWorldPosition(V(0, 0, 0)); tray.position.copy(hp).add(V(0, 0.08, 0)); }
  // generator
  const genOn = t >= T_BTN && t < Lx(4).t0 + 0.3; const bust = t >= T_BUST;
  btn.position.y = inT(t, T_BTN, T_BTN + 0.25) ? 0.22 : 0.235;
  hamArm.rotation.z = genOn ? -Math.abs(Math.sin(t * 22)) * 0.9 : 0; genBody.position.set(genOn ? Math.sin(t * 50) * 0.008 : 0, genOn ? Math.abs(Math.sin(t * 31)) * 0.01 : 0, 0);
  horn.scale.setScalar(genOn ? 1 + Math.abs(Math.sin(t * 17)) * 0.25 : 1);
  dice.forEach((d, i) => { const roll = inT(t, Lx(3).t0, Lx(3).t0 + 0.5) || inT(t, Lx(7).t0 + 0.4, Lx(7).t0 + 0.9); d.rotation.set(roll ? t * 20 + i : i, roll ? t * 13 : 0.4 * i, 0); d.position.y = 0.785 + (roll ? Math.abs(Math.sin(t * 18 + i)) * 0.06 : 0); });
  pieces[3].position.y = 0.773 + (inT(t, Lx(3).t0 + 0.1, Lx(3).t0 + 0.4) ? 0.12 * Math.sin(seg(t, Lx(3).t0 + 0.1, Lx(3).t0 + 0.4) * Math.PI) : 0);
  // flies over the cold lunch
  flies.forEach((f, i) => { f.visible = home; f.position.set(Math.sin(t * 3 + i * 2) * 0.35, 1.1 + Math.sin(t * 5 + i) * 0.1, -1.3 + Math.cos(t * 2.4 + i) * 0.2); });
  // ---- Om Hamada ----
  const momCafe = cafeOn && t >= T_WALK0;
  mom.root.visible = home || momCafe;
  { let p = { ...POSE0 };
    if (home) { mom.root.position.copy(MOMR); mom.root.rotation.set(0, -0.25, 0); EARPOSE(p); if (inT(t, Lx(1).t0 + 0.6, Lx(1).t1)) { p.aLx = 1.2; p.aLz = 0.7; p.eL = 0.3; } if (inT(t, Lx(4).t0, Lx(4).t1)) { p.aLz = 0.9; p.eL = 1.8; p.aLx = 0.3; p.hx = 0.1; } if (inT(t, Lx(6).t0, Lx(6).t1)) { p.aLx = 1.4; p.eL = 0.1; p.aLz = 0.2; } }
    else { const k = seg(t, T_WALK0, T_WALK1); mom.root.position.copy(VL(MOMC0, MOMC, easeInOut(k))); mom.root.rotation.set(0, k < 1 ? 1.25 : 0.55, 0);
      if (k < 1) { p.lL = Math.max(0, Math.sin(t * 9)) * 0.5; p.lR = Math.max(0, -Math.sin(t * 9)) * 0.5; }
      p.aRx = 0.3; p.aRz = 2.6; p.eR = 0.5; // slipper raised high
      if (t >= Lx(9).t0 - 0.1) { p.aLx = 1.5; p.aLz = 0.5; p.eL = 0.1; } }
    applyPose(mom, talkPose(p, t, 'mom', 0.3));
    let me = 'angry', mm = talkMouth(t, 'mom', 'scream') || 'frown';
    if (inT(t, Lx(4).t0, Lx(4).t1)) { me = 'side'; } if (inT(t, Lx(6).t0 - 0.1, Lx(7).t0)) { me = 'menace'; mm = talkMouth(t, 'mom') || 'flat'; }
    if (momCafe) { me = 'menace'; mm = talkMouth(t, 'mom') || 'flat'; }
    setFace(mom, me, mm, {}); }
  phoneM.visible = home; if (home) { const hp = mom.arms[1].hand.getWorldPosition(V(0, 0, 0)); phoneM.position.copy(hp).add(V(0, 0.05, 0)); phoneM.lookAt(headOf(mom)); }
  slipper.visible = momCafe; if (momCafe) { const hp = mom.arms[1].hand.getWorldPosition(V(0, 0, 0)); slipper.position.copy(hp).add(V(0, 0.1, 0)); slipper.rotation.set(-0.4 + (t >= Lx(9).t0 ? Math.sin(t * 6) * 0.15 : 0), 0, 0.2); }
  // ---- Ibrahim ----
  dad.root.visible = cafeOn || balc;
  { let p = { ...SEAT, y: -0.4 }; let de = 'smug', dm = talkMouth(t, 'dad', 'grin') || 'smile';
    if (cafeOn) { dad.root.position.copy(DADC); dad.root.rotation.set(0, 1.15, 0);
      if (t < Lx(7).t1 - 0.3) EARPOSE(p);
      if (inT(t, Lx(2).t0, Lx(3).t0)) { p.hy = -0.25; p.bend = 0.15; de = 'side'; if (t >= T_BTN) { p.aLx = 1.2; p.eL = 0.5; p.aLz = 0.1; de = 'sparkle'; dm = talkMouth(t, 'dad', 'grin') || 'grin'; } }
      if (inT(t, Lx(3).t0, Lx(5).t0)) { de = 'wide'; dm = talkMouth(t, 'dad') || 'o'; p.hy = 0.5; }
      if (inT(t, Lx(5).t0, Lx(5).t1)) { de = 'wide'; dm = talkMouth(t, 'dad', 'scream') || 'fakegrin'; p.aLx = 1.0; p.aLz = 0.6; p.eL = 0.5; }
      if (inT(t, Lx(5).t1, Lx(7).t1 + 0.2)) { de = 'smug'; dm = talkMouth(t, 'dad', 'grin') || 'smile'; p.bend = -0.12; }
      if (inT(t, Lx(7).t0 + 0.4, Lx(7).t0 + 0.9)) { p.aLx = 1.2; p.eL = 0.6; }
      if (t >= Lx(8).t0) { de = 'pin'; dm = talkMouth(t, 'dad') || 'flat'; p.hy = 0; }
      if (t >= T_REVEAL) { de = 'wide'; dm = 'scream'; dad.root.position.y = Math.abs(Math.sin(t * 30)) * 0.02; }
      if (t >= Lx(9).t1) { de = 'tears'; dm = 'frown'; } }
    else { dad.root.position.set(0.0, 0, -0.35); dad.root.rotation.set(0, 0, 0); p = { ...SEAT, y: -0.4, aRx: 1.0, eR: 0.9 }; de = 'smug'; dm = talkMouth(t, 'dad', 'grin') || 'smile'; if (inT(t, Lx(10).t0, Lx(10).t1)) { p.aRx = 1.3; p.aRz = 0.5; p.eR = 0.4; } if (t >= T_ANNO) { de = 'tired'; dm = 'flat'; } }
    applyPose(dad, talkPose(p, t, 'dad', 0.35)); setFace(dad, de, dm, { stache: true }); }
  phoneD.visible = cafeOn && t < Lx(7).t1 - 0.3; if (phoneD.visible) { const hp = dad.arms[1].hand.getWorldPosition(V(0, 0, 0)); phoneD.position.copy(hp).add(V(0, 0.05, 0)); phoneD.lookAt(headOf(dad)); }
  // ---- Abu Samir ----
  samir.root.visible = cafeOn;
  { samir.root.position.copy(SAMC); samir.root.rotation.set(0, -1.15, 0); let p = { ...SEAT, y: -0.34 }; let se = 'smug', sm = talkMouth(t, 'samir', 'scream') || 'smile';
    if (inT(t, Lx(3).t0, Lx(3).t1)) { se = 'wide'; const k = seg(t, Lx(3).t0, Lx(3).t0 + 0.4); p.aRx = 1.6 - Math.sin(k * Math.PI) * 0.8; p.aRz = 0.3; p.eR = 0.2; p.aLz = 1.4 + Math.sin(t * 8) * 0.3; }
    if (t >= Lx(8).t0 - 0.6) { se = 'pin'; sm = talkMouth(t, 'samir') || 'o'; p.bend = -0.15; samir.root.rotation.y = -1.25; }
    applyPose(samir, talkPose(p, t, 'samir', 0.3)); setFace(samir, se, sm, { stache: true, stacheColor: '#eeeeee' }); }
  // lights
  const night = balc;
  scene.background = new THREE.Color(night ? 0x060a1a : cafeOn ? 0x1a2238 : 0x101010);
  roomLight.position.set(cafeOn ? CX : 0, 2.8, 1.0); roomLight.intensity = night ? 0 : 1.6; ambient.color.setHex(night ? 0x5060a0 : cafeOn ? 0xc8b8a8 : 0xfff0e0); ambient.intensity = night ? 0.5 : 0.62;
  moon.intensity = night ? 0.5 : 0.3; fill.intensity = 1.0; balcLight.intensity = night ? 1.2 : cafeOn ? 1.4 : 0; balcLight.position.set(cafeOn ? CX - 0.2 : 1.5, 2.6, cafeOn ? -1.6 : 0.2); balcLight.color.setHex(cafeOn ? 0x7dffaa : 0xffd08a);
  tvLight.intensity = home ? 3 : 0; bathLight.intensity = 0; kitLight.intensity = 0;
}
function shotAt(t) {
  if (t < T_CAFE) { faceCam(mom, 2.0 - 0.3 * easeOut(seg(t, 0, 1.4)), 0.35, 0.1, 60, 0.35); camera.position.add(shake(t, t < 1.0 ? 0.02 : 0.005)); return; }
  if (t < T_BTN - 0.05) { faceCam(dad, 1.7, 0.3, 0.05, 58, 0.3); return; }
  if (t < Lx(3).t0 - 0.1) { const g = gen.getWorldPosition(V(0, 0, 0)); cam(g.clone().add(V(0.4, 0.5, 0.6)).add(shake(t, 0.012)), g.clone().add(V(0.05, 0.1, 0)), 46); return; }
  if (t < Lx(4).t0 - 0.1) { const k = easeOut(seg(t, Lx(3).t0, Lx(3).t0 + 0.4)); cam(VL(V(CX + 0.6, 1.25, 1.2), V(CX + 0.35, 1.3, 1.6), k).add(shake(t, t < Lx(3).t0 + 0.6 ? 0.03 : 0)), V(CX + 0.25, 1.05, -0.5), 62); return; }
  if (t < Lx(5).t0 - 0.1) { faceCam(mom, 1.6, -0.3, 0.05, 56, 0.3); return; }
  if (t < Lx(6).t0 - 0.1) { faceCam(dad, 1.6, -0.35, 0.0, 56, 0.3); camera.position.add(shake(t, 0.01)); return; }
  if (t < Lx(7).t0 - 0.1) { faceCam(mom, 1.4 - 0.25 * seg(t, Lx(6).t0, Lx(6).t1), 0.1, 0.0, 54, 0.3); return; }
  if (t < Lx(8).t0 - 0.1) { cam(V(CX + 0.35, 1.45, 1.65), V(CX - 1.05, 1.15, -0.85), 60); return; } // dad + mom walking in behind him
  if (t < T_REVEAL) { faceCam(samir, 1.35, -0.2, 0.0, 54, 0.3); return; }
  if (t < Lx(9).t0 - 0.1) { const k = easeOut(seg(t, T_REVEAL, T_REVEAL + 0.5)); cam(VL(V(CX + 0.9, 1.35, 0.6), V(CX + 0.8, 1.45, 0.9), k).add(shake(t, 0.01)), V(CX - 0.7, 1.3, -0.95), 62); return; }
  if (t < T_BALC) { faceCam(mom, 1.7, 0.25, -0.55, 60, -0.25); camera.position.add(shake(t, 0.008)); return; }
  if (t < T_ANNO) { faceCam(dad, 2.0 - 0.3 * seg(t, Lx(10).t0, Lx(10).t1), 0.2, 0.15, 60, 0.4); return; }
  const k = easeInOut(seg(t, T_ANNO, DUR - 3)); faceCam(dad, 2.2 + 1.0 * k, 0.3, 0.3 + 0.3 * k, 60, 0.3);
}
function particles(t) {
  const pf = [], st = [];
  if (!inRoom(t) && t < T_BALC) {
    const s = shisha.position.clone().add(V(-0.6, 0.75, 0.3)); for (let i = 0; i < 3; i++) { const k = (t * 0.5 + i / 3) % 1; pf.push({ pos: s.clone().add(V(k * 0.2, k * 0.6, 0)), size: 0.08 + k * 0.2, op: 0.4 * (1 - k), color: 0xdddddd }); }
    const tg = TB.clone().add(V(0.32, 0.85, 0.25)); for (let i = 0; i < 2; i++) { const k = (t * 0.7 + i / 2) % 1; pf.push({ pos: tg.clone().add(V(0, k * 0.25, 0)), size: 0.04 + k * 0.06, op: 0.4 * (1 - k), color: 0xffffff }); }
  }
  if (t >= T_BTN && t < Lx(4).t0 + 0.3 && !inRoom(t)) { const g = gen.getWorldPosition(V(0, 0, 0)).add(V(0.42, 0.0, 0.02)); if (Math.floor(t * 22) % 2) for (let i = 0; i < 3; i++) st.push({ pos: g.clone().add(V(Math.cos(t * 9 + i * 2) * 0.08, 0.05 + i * 0.03, 0.03)), size: 0.06, color: 0xffd400 }); }
  if (t >= T_BUST && t < T_BALC && !inRoom(t)) { const g = gen.getWorldPosition(V(0, 0, 0)).add(V(0, 0.25, 0)); for (let i = 0; i < 3; i++) { const k = (t * 0.8 + i / 3) % 1; pf.push({ pos: g.clone().add(V(k * 0.15, k * 0.6, 0)), size: 0.08 + k * 0.25, op: 0.6 * (1 - k), color: 0x555555 }); } }
  if (t >= T_REVEAL && t < Lx(9).t1 && !inRoom(t)) { const h = headOf(dad); for (let i = 0; i < 2; i++) st.push({ pos: h.clone().add(V(0.25 * (i ? 1 : -1), 0.15, 0.1)), size: 0.07, color: 0x8fd0ff }); }
  emit(st, starPool); emit(pf, puffPool); emit([], trailPool); emit([], sweatPool);
}
// ---------- HUD ----------
const BALC0 = 43;
const mmss = (s) => { s = Math.max(0, Math.ceil(s)); return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0'); };
function drawCall(g, t) {
  if (t >= Lx(7).t1 - 0.3 || inT(t, T_BTN, Lx(4).t0)) return; const home = inRoom(t);
  g.save(); g.translate(W / 2, 46); g.fillStyle = 'rgba(0,0,0,0.72)'; g.fillRect(-150, -26, 300, 52); g.fillStyle = Math.floor(t * 2) % 2 ? '#3df05a' : '#1f9e3a'; g.beginPath(); g.arc(-122, 0, 12, 0, 7); g.fill();
  arText(g, home ? 'بتكلّم: إبراهيم ❤️' : 'مكالمة: أم حمادة 😬', 18, -24, 22, '#fff', 'center'); pxText(g, '00:' + String(Math.floor(t + 12)).padStart(2, '0'), 18, 6, 10, '#9fd0ff', 'center', false); g.restore();
}
function drawLies(g, t) {
  let n = 0; for (const l of LIES) if (t >= l) n++;
  if (n === 0 || t >= T_BALC) return;
  g.save(); g.translate(W - 100, 600); g.fillStyle = 'rgba(0,0,0,0.72)'; g.fillRect(-85, -40, 170, 80); g.strokeStyle = '#ff3a2a'; g.lineWidth = 2; g.strokeRect(-85, -40, 170, 80);
  arText(g, 'عداد الكدب', 0, -40, 18, '#fff', 'center'); pxText(g, String(n), 0, -2, 24, '#ff5a4a', 'center'); g.restore();
  LIES.forEach((l, i) => { if (!inT(t, l, l + 1.0)) return; const k = easeBack(seg(t, l, l + 0.25)); g.save(); g.translate(W / 2, 530); g.rotate(-0.08); g.scale(k, k);
    g.fillStyle = '#d8231b'; g.fillRect(-170, -34, 340, 68); g.strokeStyle = '#fff'; g.lineWidth = 3; g.strokeRect(-170, -34, 340, 68); pxText(g, 'LIE DETECTED!', 0, -18, 20, '#fff', 'center');
    if (i > 0) pxText(g, 'COMBO x' + (i + 1), 0, 44, 14, '#ffe14a', 'center'); g.restore(); });
}
function drawETA(g, t) {
  if (t < T_ETA0 || t >= T_BALC) return; const base = t >= T_ETARESET ? T_ETARESET : T_ETA0; const left = 300 - (Math.min(t, T_REVEAL) - base);
  g.save(); g.translate(100, 600); g.fillStyle = 'rgba(0,0,0,0.72)'; g.fillRect(-85, -40, 170, 80); g.strokeStyle = '#ffe14a'; g.lineWidth = 2; g.strokeRect(-85, -40, 170, 80);
  arText(g, 'الوصول بعد', 0, -40, 18, '#fff', 'center'); pxText(g, t >= T_REVEAL && Math.floor(t * 4) % 2 ? '--:--' : mmss(left), 0, -2, 18, '#ffe14a', 'center'); g.restore();
  if (inT(t, T_ETARESET, T_ETARESET + 0.9)) { const k = easeBack(seg(t, T_ETARESET, T_ETARESET + 0.25)); g.save(); g.translate(100, 680); g.scale(k, k); pxText(g, 'ETA RESET!', 0, 0, 12, '#ff5a4a', 'center'); g.restore(); }
}
function drawBalc(g, t) {
  if (t < T_BALC || t >= T_ANNO) return; const k = easeBack(seg(t, T_BALC, T_BALC + 0.3)); const n = t >= T_BALC + 0.6 ? BALC0 + 1 : BALC0;
  g.save(); g.translate(W - 120, 600); g.scale(k, k); g.fillStyle = 'rgba(0,0,0,0.72)'; g.fillRect(-105, -48, 210, 96); g.strokeStyle = '#ffe14a'; g.lineWidth = 2; g.strokeRect(-105, -48, 210, 96);
  arText(g, 'ليالي البلكونة', 0, -48, 20, '#fff', 'center'); pxText(g, String(n), 0, 2, 26, n > BALC0 && Math.floor(t * 4) % 2 ? '#ff5a4a' : '#ffe14a', 'center'); g.restore();
}
function drawCTA(g, t) {
  if (t < Lx(10).t0 || t >= T_ANNO) return; const k = easeBack(seg(t, Lx(10).t0, Lx(10).t0 + 0.3));
  g.save(); g.translate(W / 2, 140); g.scale(k, k); g.fillStyle = 'rgba(255,255,255,0.96)'; g.fillRect(-250, -54, 500, 108); g.fillStyle = '#d8231b'; g.fillRect(-250, 48, 500, 6);
  arText(g, 'بتقولوا إيه لما تتأخروا؟ 👇', 0, -56, 32, '#111', 'center'); arText(g, 'أحسن كومنت هيبقى حلقة!', 0, -14, 30, '#d8231b', 'center'); g.restore();
}
window.renderFrame = function (t) {
  stateAt(t); shotAt(t); particles(t);
  renderer.render(scene, camera);
  ctx.clearRect(0, 0, W, H); ctx.drawImage(glCanvas, 0, 0);
  h.clearRect(0, 0, W, H);
  drawInventionV(h, t, T_BTN + 0.15, Lx(4).t0 - 0.1, 'مولّد أصوات الشغل ٣٠٠٠', [['NOISE', 10, '#ffe14a'], ['BELIEVABLE', 1, '#ff5a4a']]);
  drawDialogueV(h, t); drawCall(h, t); drawLies(h, t); drawETA(h, t); drawBalc(h, t); drawCTA(h, t);
  drawEndV(h, t, T_ANNO + 0.1, 'LIES: 3', 'الخمس دقايق لسه مخلصتش', [['ETA', 'الوصول: أبدًا', T_ANNO + 1.3, '#ffe14a'], ['IBRAHIM', 'إبراهيم: البلكونة', T_ANNO + 2.6, '#ff5a4a']], DUR);
  ctx.drawImage(hud, 0, 0); vignette(ctx, 0.35);
  if (t >= T_REVEAL && t < T_REVEAL + 0.06) { ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.fillRect(0, 0, W, H); }
  return true;
};
window.frameData = () => out.toDataURL('image/png');
window.DUR = DUR;
document.fonts.load('10px PS2P').then(() => document.fonts.load('20px Lalezar', 'ع')).then(() => document.fonts.load('700 20px ReemKufi', 'ع')).then(() => { lateDraw.forEach(f => f()); window.READY = true; });
