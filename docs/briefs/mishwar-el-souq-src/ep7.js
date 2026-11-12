
// =====================================================================
// مشوار السوق — street -> sky over Cairo -> the market
// =====================================================================
room.visible = false; hallway.visible = false; balcony.visible = false; showroom.visible = false;
const T_ARRIVE = 4.2, T_LAUNCH = 11.6, T_DIVE = 19.4, T_CRASH = 21.2, T_RESULT = 30.4, T_END = 36.41;

// the tuk-tuk is already upgraded: engine installed
tuk.add(engine6); engine6.position.set(0.9, 0.35, 0); bay.visible = false;
// sunglasses for Hoda
const shades = new THREE.Group(); scene.add(shades);
for (const s of [-1, 1]) mesh(box(0.13, 0.08, 0.02), M(0x0a0a0a), s * 0.1, 0, 0, shades);
mesh(box(0.08, 0.02, 0.02), M(0x0a0a0a), 0, 0.02, 0, shades);

// ---------- Om Hamada's basket (قفة) ----------
const basket = new THREE.Group(); scene.add(basket);
mesh(cyl(0.2, 0.16, 0.24, 8, true), new THREE.MeshLambertMaterial({ color: 0xc8a060, side: THREE.DoubleSide, flatShading: true }), 0, 0, 0, basket);
const handle = mesh(new THREE.TorusGeometry(0.15, 0.015, 4, 10, Math.PI), M(0xa07840), 0, 0.12, 0, basket);
mesh(new THREE.IcosahedronGeometry(0.08, 0), M(0x3a9a3a), 0.05, 0.1, 0.02, basket); // parsley
const melonHalf = new THREE.Group(); scene.add(melonHalf);
mesh(new THREE.SphereGeometry(0.22, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), M(0x2f7a2f, { side: THREE.DoubleSide }), 0, 0, 0, melonHalf).rotation.x = Math.PI;
const flesh = mesh(new THREE.CircleGeometry(0.2, 8), M(0xe8303a), 0, 0.001, 0, melonHalf); flesh.rotation.x = -Math.PI / 2;

// ---------- the sky over Cairo ----------
const city = new THREE.Group(); city.position.set(300, 0, 0); scene.add(city);
{
  mesh(new THREE.PlaneGeometry(400, 400), M(0xc8b48a), 0, 0, 0, city).rotation.x = -Math.PI / 2;
  const nile = mesh(new THREE.PlaneGeometry(26, 400), M(0x3a7fc8), 30, 0.05, 0, city); nile.rotation.x = -Math.PI / 2; nile.rotation.z = 0.25;
  const r = rng(77);
  for (let i = 0; i < 260; i++) { const x = (r() - .5) * 220, z = (r() - .5) * 220; if (Math.abs(x - 30 - z * 0.25) < 16) continue; const hgt = 3 + r() * 9; mesh(box(4 + r() * 3, hgt, 4 + r() * 3), M([0xc99a5a, 0xb48a6a, 0xd8b080, 0xa87a50][i % 4]), x, hgt / 2, z, city); if (r() > 0.6) mesh(new THREE.ConeGeometry(0.6, 0.3, 6), M(0xeeeeee), x, hgt + 0.3, z, city); }
  for (let i = 0; i < 3; i++) { const p = mesh(new THREE.ConeGeometry(14 - i * 3, 12 - i * 2, 4), M(0xe0c070), -90 + i * 22, (12 - i * 2) / 2, -150 + i * 10, city); p.rotation.y = Math.PI / 4; } // pyramids on the horizon
  mesh(cyl(0.8, 1.0, 22, 6), M(0xe0d0b0), -20, 11, -40, city); mesh(new THREE.ConeGeometry(1.2, 3, 6), M(0x5fae6a), -20, 23.5, -40, city); // minaret
  mesh(new THREE.SphereGeometry(6, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), M(0xd8c8a0), -12, 4, -42, city);
  mesh(new THREE.PlaneGeometry(600, 160), new THREE.MeshBasicMaterial({ map: daySkyTex, fog: false }), 0, 40, -220, city);
}
const clouds = []; for (let i = 0; i < 14; i++) { const c = mesh(new THREE.IcosahedronGeometry(2 + hash(i) * 2, 0), new THREE.MeshLambertMaterial({ color: 0xffffff, transparent: true, opacity: 0.85, flatShading: true }), 0, 0, 0, city); c.scale.y = 0.5; clouds.push(c); }

// ---------- the market ----------
const market = new THREE.Group(); market.position.set(-300, 0, 0); scene.add(market);
const melons = [];
{
  mesh(new THREE.PlaneGeometry(60, 30), M(0xb8ab8e, { map: pavTex }), 0, 0, 0, market).rotation.x = -Math.PI / 2;
  const awnTex = canvasTex(16, 16, (g) => { for (let i = 0; i < 4; i++) { g.fillStyle = i % 2 ? '#fff' : '#d8231b'; g.fillRect(i * 4, 0, 4, 16); } }, [3, 1]);
  const awnTex2 = canvasTex(16, 16, (g) => { for (let i = 0; i < 4; i++) { g.fillStyle = i % 2 ? '#ffe14a' : '#1f6fd8'; g.fillRect(i * 4, 0, 4, 16); } }, [3, 1]);
  const stall = (x, z, tex, fruit, n, col) => {
    const st = new THREE.Group(); st.position.set(x, 0, z); market.add(st);
    mesh(box(2.6, 0.8, 1.2), M(0x8a5a2b, { map: woodTex }), 0, 0.4, 0, st);
    for (const sx of [-1.25, 1.25]) for (const sz of [-0.55, 0.55]) mesh(box(0.06, 2.4, 0.06), M(0x6a4220), sx, 1.2, sz, st);
    const aw = mesh(box(2.9, 0.06, 1.6), M(0xffffff, { map: tex }), 0, 2.45, 0.1, st); aw.rotation.x = -0.15;
    const rr = rng(x * 7 + z);
    for (let i = 0; i < n; i++) { const m = mesh(new THREE.SphereGeometry(fruit, 6, 4), M(col), -1.0 + rr() * 2.0, 0.85 + fruit + Math.floor(i / 8) * fruit * 1.4, -0.4 + rr() * 0.8, st); if (fruit > 0.15) m.scale.set(1.25, 1, 1); }
    return st;
  };
  stall(-4.5, -3, awnTex2, 0.09, 40, 0xff8a1a); stall(4.5, -3, awnTex2, 0.08, 40, 0xd8231b); stall(-8.5, -2.5, awnTex, 0.07, 36, 0xffd400);
  // Shehata's watermelon stall (crash target) at the centre
  const ws = new THREE.Group(); ws.position.set(0, 0, -2.6); market.add(ws);
  mesh(box(3.0, 0.7, 1.4), M(0x8a5a2b, { map: woodTex }), 0, 0.35, 0, ws);
  for (const sx of [-1.45, 1.45]) for (const sz of [-0.65, 0.65]) mesh(box(0.06, 2.4, 0.06), M(0x6a4220), sx, 1.2, sz, ws);
  const aw = mesh(box(3.3, 0.06, 1.8), M(0xffffff, { map: awnTex }), 0, 2.45, 0.1, ws); aw.rotation.x = -0.15;
  const stripeMelon = canvasTex(16, 16, (g) => { g.fillStyle = '#3f8a2f'; g.fillRect(0, 0, 16, 16); g.fillStyle = '#1f5a1f'; for (let i = 0; i < 16; i += 4) g.fillRect(i, 0, 2, 16); });
  const r2 = rng(5);
  for (let i = 0; i < 18; i++) { const m = mesh(new THREE.SphereGeometry(0.24, 7, 5), M(0xffffff, { map: stripeMelon }), -1.1 + (i % 6) * 0.44 + (r2() - .5) * 0.05, 0.92 + Math.floor(i / 6) * 0.36, -0.35 + (Math.floor(i / 6) % 2) * 0.3, ws); m.scale.set(1.3, 1, 1); melons.push({ m, base: m.position.clone(), v: V((r2() - .5) * 6, 3 + r2() * 4, 2 + r2() * 3), spin: r2() * 10 }); }
  const signTex = canvasTex(64, 20, (g) => { g.fillStyle = '#ffe14a'; g.fillRect(0, 0, 64, 20); g.fillStyle = '#c11'; g.font = '13px Lalezar'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.direction = 'rtl'; g.fillText('بطيخ مستورد', 32, 11); });
  const sign = mesh(new THREE.PlaneGeometry(1.4, 0.44), new THREE.MeshBasicMaterial({ map: signTex }), 0, 2.0, 0.6, ws); sign.userData.tex = signTex;
  window.__signTex = signTex;
  // shopfronts behind
  for (let i = -3; i <= 3; i++) { mesh(box(4.6, 5 + (i % 2) * 1.5, 1), M([0xd8b080, 0xc99a5a, 0xb48a6a][(i + 3) % 3]), i * 4.8, 2.5, -7, market); mesh(new THREE.PlaneGeometry(2.4, 2.2), M(0x2a2018), i * 4.8, 1.2, -6.49, market); }
  // bunting
  for (let i = 0; i < 18; i++) { const f = mesh(new THREE.ConeGeometry(0.16, 0.3, 3), new THREE.MeshLambertMaterial({ color: laundryCols[i % 5], side: THREE.DoubleSide }), -8 + i, 3.3 - Math.abs(Math.sin(i * 0.35)) * 0.3, -1.0, market); f.rotation.x = Math.PI; }
}
const chunks = []; for (let i = 0; i < 24; i++) { const c = mesh(new THREE.TetrahedronGeometry(0.1 + hash(i) * 0.08, 0), M(i % 3 ? 0xe8303a : 0x2f7a2f), 0, 0, 0, market); c.visible = false; chunks.push({ c, v: V((hash(i + 1) - .5) * 7, 2 + hash(i + 2) * 5, (hash(i + 3) - .2) * 5) }); }
const melonHat = new THREE.Group(); scene.add(melonHat);
mesh(new THREE.SphereGeometry(0.33, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), M(0x2f7a2f, { side: THREE.DoubleSide }), 0, 0, 0, melonHat);
mesh(new THREE.CircleGeometry(0.31, 8), M(0xe8303a, { side: THREE.DoubleSide }), 0, 0.001, 0, melonHat).rotation.x = Math.PI / 2;

// ---------- Shehata (new) ----------
const shehata = makeChar({
  seed: 51, skin: 0x9a6440, hipY: 0.86, legX: 0.14, legColor: 0x4a5a7a, shoe: 0x3a2a1a, hand: 0x9a6440,
  torsoGeo: cyl(0.34, 0.46, 0.7, 7), torsoTex: canvasTex(16, 16, (g) => { g.fillStyle = '#e8eef8'; g.fillRect(0, 0, 16, 16); g.fillStyle = '#3a5aa8'; g.fillRect(0, 0, 2, 16); g.fillRect(6, 0, 2, 16); g.fillRect(12, 0, 2, 16); }, [3, 2]), torsoColor: 0xffffff, torsoY: 0.35,
  skirt: cyl(0.46, 0.5, 0.7, 7), sleeve: true, shoulderX: 0.44, shoulderY: 0.62, neckY: 0.7, headR: 0.3,
  build(head, torso, reg) {
    mesh(new THREE.SphereGeometry(0.31, 8, 4, 0, Math.PI * 2, 0, Math.PI * 0.35), reg(M(0xf2f2f2)), 0, 0.04, 0, head); // white cap
    mesh(box(0.7, 0.55, 0.05), reg(M(0xd8c8a0)), 0, 0.25, 0.42, torso); // apron
    return {};
  }
}, scene);

const firePool7 = spritePool(canvasTex(16, 16, (g) => { g.fillStyle = '#ffdd33'; g.beginPath(); g.moveTo(8, 0); g.quadraticCurveTo(15, 9, 8, 16); g.quadraticCurveTo(1, 9, 8, 0); g.fill(); g.fillStyle = '#ff7a10'; g.beginPath(); g.arc(8, 11, 4, 0, 7); g.fill(); }), 26);
const MOM_ST = V(-0.6, 0.15, -2.2), TUK_P = V(1.6, 0, 0.3), SAY_P = V(-2.2, 0.15, -3.0);
const SH_P = V(-300 + 0.4, 0, -4.0), MOM_MK = V(-300 - 1.6, 0, 0.6), TUK_MK = V(-300 + 0.3, 0, -2.0);

const KEYS = {};
KEYS.mom = [
  [0, { aLz: 0.3, aRx: 0.4, aRz: 0.3, eR: 0.6 }],
  [1.0, { aLz: 2.7, eL: 0.2, aRx: 0.4, aRz: 0.3, eR: 0.6, hx: -0.1 }, 0.12],
  [2.2, { aLz: 2.4, eL: 0.6, aRx: 0.4, aRz: 0.3, eR: 0.6, hz: 0.1 }, 0.12],
  [4.5, { aLz: 0.95, eL: 1.9, aRx: 0.4, aRz: 0.3, eR: 0.6 }],
  [7.35, { aLx: 1.2, eL: 0.5, aLz: 0.4, aRx: 0.4, aRz: 0.3, eR: 0.6, bend: 0.15, hx: 0.1 }, 0.12],
  [8.4, { aLz: 2.5, eL: 0.3, aRx: 0.4, aRz: 0.3, eR: 0.6, bend: -0.1 }, 0.12],
  [10.0, { aLz: 0.95, eL: 1.9, aRx: 0.4, aRz: 0.3, eR: 0.6, hx: 0.1 }],
];
KEYS.momFly = [
  [0, { y: -0.4, lL: 1.4, lR: 1.4, aLz: 2.6, aRz: 2.6, eL: 0.2, eR: 0.2, hx: -0.2 }],
  [13.8, { y: -0.4, lL: 1.4, lR: 1.4, aLx: 1.5, eL: 0.2, aLz: 0.2, aRz: 0.6, eR: 1.6, hx: 0.0 }, 0.15],
  [16.7, { y: -0.4, lL: 1.4, lR: 1.4, aLz: 2.2, aRz: 2.2, eL: 0.3, eR: 0.3, hx: -0.15 }, 0.15],
];
KEYS.momMk = [
  [0, { aLz: 0.3, aRz: 0.3, hx: 0.3, bend: 0.1 }],
  [25.25, { aRx: 1.2, eR: 1.2, aRz: 0.1, aLz: 0.3, hx: 0.25, bend: 0.1 }, 0.3],
  [27.95, { aRx: 1.4, eR: 0.3, aRz: 0.2, aLx: 1.0, eL: 1.2, hx: -0.05 }, 0.15],
  [29.2, { aRx: 1.4, eR: 0.3, aRz: 0.2, aLz: 0.95, eL: 1.9, hx: -0.1 }, 0.15],
  [T_RESULT, { aLz: 2.6, aRz: 2.6, eL: 0.4, eR: 0.4, hx: -0.15 }, 0.15],
];
KEYS.shehata = [
  [0, { aLz: 0.95, eL: 1.9, aRz: 0.95, eR: 1.9 }],
  [21.9, { aLz: 2.4, aRz: 2.4, eL: 0.6, eR: 0.6, bend: 0.1, hx: 0.05 }, 0.12],
  [23.3, { aRx: 1.4, aRz: 0.3, eR: 0.2, aLz: 0.95, eL: 1.9, bend: 0.15 }, 0.12],
  [25.25, { aLz: 0.95, eL: 1.9, aRz: 0.95, eR: 1.9, hx: 0.1 }],
  [27.0, { aLz: 0.6, aRz: 0.6, aRx: 0.6, eR: 1.6, hz: 0.25 }, 0.15],
  [28.5, { aLz: 0.3, aRz: 0.3, bend: -0.1, hx: -0.2 }],
];

function tukPose(t) {
  if (t < T_ARRIVE) { const k = seg(t, 2.6, T_ARRIVE); return { grp: 'street', pos: V(lerp(-6, TUK_P.x, easeOut(k)), lerp(12, 0, easeOut(k)), TUK_P.z), rz: lerp(0.6, 0, k), vis: t >= 2.6 }; }
  if (t < T_LAUNCH) return { grp: 'street', pos: TUK_P.clone(), rz: 0, vis: true };
  if (t < 12.8) { const a = t - T_LAUNCH; return { grp: 'street', pos: V(TUK_P.x - 10 * a * a, 12 * Math.max(0, a - 0.3) ** 2, TUK_P.z), rz: -Math.min(0.9, Math.max(0, a - 0.3) * 1.6), vis: true }; }
  if (t < T_DIVE) { const a = t - 12.8; return { grp: 'city', pos: V(300 + 40 - a * 9, 34 + Math.sin(a * 1.3) * 1.5, -a * 4), rz: Math.sin(a * 2) * 0.08, ry: Math.PI * 0.35, vis: true }; }
  if (t < T_CRASH) { const k = seg(t, T_DIVE, T_CRASH); return { grp: 'market', pos: VL(V(-300 + 14, 18, 6), TUK_MK.clone().add(V(0, 0.9, 0)), easeIn(k)), rz: 0.9, ry: -0.6, vis: true }; }
  return { grp: 'market', pos: TUK_MK.clone().add(V(0, 0.15, 0)), rz: 0.35, ry: -0.6, rx: 0.15, vis: true };
}

function stateAt(t) {
  const where = t < 12.8 ? 'street' : t < T_DIVE ? 'city' : 'market';
  street.visible = where === 'street'; city.visible = where === 'city'; market.visible = where === 'market';
  scene.background = new THREE.Color(0x9fd0ff);
  scene.fog = where === 'city' ? new THREE.Fog(0xcfe6ff, 60, 260) : new THREE.Fog(0xcfe6ff, 30, 90);
  ambient.color.setHex(0xfff0e0); ambient.intensity = 0.9; moon.intensity = 0; sun6.intensity = 1.6; tvLight.intensity = 0; hallLight.intensity = 0; balcLight.intensity = 0; spot.intensity = 0;
  sun6.position.set(-6 + (where === 'market' ? -300 : where === 'city' ? 300 : 0), 12, 8); sun6.target.position.set(where === 'market' ? -300 : where === 'city' ? 300 : 0, 0, 0); sun6.target.updateMatrixWorld();

  // tuk-tuk (re-parented to the scene root so it can travel between sets)
  if (tuk.parent !== scene) scene.add(tuk);
  const tp = tukPose(t); tuk.visible = tp.vis; tuk.position.copy(tp.pos); tuk.rotation.set(tp.rx || 0, tp.ry || 0, tp.rz);
  wheels.forEach(w => w.rotation.y = t > T_LAUNCH && t < T_CRASH ? t * 30 : 0);
  pan6mat.emissive.setRGB(0.6, 0.15, 0);
  if (t >= T_CRASH) { tukBody.rotation.z = Math.sin(Math.max(0, t - T_CRASH) * 30) * 0.04 * Math.exp(-(t - T_CRASH) * 2); }

  // Hoda: always in the driver's seat
  if (hoda.root.parent !== tuk) tuk.add(hoda.root);
  hoda.root.position.set(-0.55, 0.42, 0); hoda.root.rotation.set(0, -Math.PI / 2, 0); hoda.root.visible = tp.vis;
  const hz = { ...POSE0, y: -0.4, lL: 1.4, lR: 1.4, aLx: 1.4, eL: 0.6, aRx: 1.4, eR: 0.6, aLz: -0.1, aRz: -0.1 };
  if (t >= 4.5 && t < T_LAUNCH) { hz.hy = -1.2; hz.aRx = 0.6; hz.aRz = 0.5; hz.eR = 1.6; }
  if (t >= 10.3 && t < T_LAUNCH) { hz.aRx = 2.3; hz.eR = 2.2; hz.aRz = 0.2; }
  if (t >= 16.7 && t < T_DIVE) { hz.hy = 1.0; hz.aLz = 2.4; hz.aLx = 0; hz.eL = 0.3; }
  if (t >= T_CRASH) { hz.bend = 0.5; hz.hx = 0.4; hz.aLz = 1.4; hz.aRz = 1.4; hz.aLx = 0; hz.aRx = 0; }
  applyPose(hoda, hz);
  // sunglasses: on forehead until 10.4, then down over the eyes
  { const hd = hoda.head; hd.updateWorldMatrix(true, false); const down = t >= 10.45 && t < T_CRASH; const local = down ? V(0, 0.03, 0.26) : V(0, 0.2, 0.22); shades.position.copy(local.applyMatrix4(hd.matrixWorld)); shades.quaternion.copy(hd.getWorldQuaternion(new THREE.Quaternion())); shades.visible = tp.vis && hoda.root.visible; }

  // Om Hamada
  if (t < 11.0) { if (mom.root.parent !== scene) scene.add(mom.root); mom.root.position.copy(MOM_ST); mom.root.rotation.set(0, 0.55, 0); applyPose(mom, poseAt(t, KEYS.mom)); if (t >= 4.5) mom.root.rotation.y = 0.9; }
  else if (t < T_CRASH) { if (mom.root.parent !== tuk) tuk.add(mom.root); mom.root.position.set(0.35, 0.45, 0); mom.root.rotation.set(0, -Math.PI / 2, 0); applyPose(mom, poseAt(t, KEYS.momFly)); }
  else { if (mom.root.parent !== scene) scene.add(mom.root); const k = easeOut(seg(t, T_CRASH, T_CRASH + 0.5)); mom.root.position.copy(VL(TUK_MK.clone().add(V(0.4, 0.8, 0.5)), MOM_MK, k)); mom.root.rotation.set(0, lerp(0, 0.85, k), 0); applyPose(mom, poseAt(t, KEYS.momMk)); }
  mom.root.visible = !(t >= 11.0 && t < 11.6 && false);
  // basket in her right hand (street), the melon half in the market
  { const hp = mom.arms[1].hand.getWorldPosition(V(0, 0, 0)); basket.position.copy(hp).add(V(0, -0.15, 0)); basket.visible = t < T_CRASH || t >= T_RESULT; if (t >= T_RESULT) basket.position.copy(mom.arms[0].hand.getWorldPosition(V(0, 0, 0))).add(V(0, -0.15, 0)); }
  { melonHalf.visible = t >= 25.25 && t < 29.4; const hp = mom.arms[1].hand.getWorldPosition(V(0, 0, 0)); melonHalf.position.copy(hp).add(V(0, 0.12, 0)); }
  // Uncle Sayed cameo (street only, sipping tea)
  sayed.root.visible = where === 'street'; sayed.root.position.copy(SAY_P); sayed.root.rotation.set(0, 0.35, 0); chair6.position.copy(SAY_P);
  applyPose(sayed, { ...POSE0, y: -0.38, lL: 1.5, lR: 1.5, aRx: 0.9 + (Math.sin(t * 0.8) > 0.6 ? 0.4 : 0), eR: 1.6 + (Math.sin(t * 0.8) > 0.6 ? 0.6 : 0), aRz: 0.2, aLz: 0.3, aLx: 0.6, eL: 0.6, bend: -0.2, hy: t > 9 ? 0.9 : 0.4 });
  sayed.faceMat.map = faceTexture(t > 11.6 ? 'wide' : 'tired', t > 11.6 ? 'o' : 'smile', { stache: true, stacheColor: '#dddddd' }); sayed.faceMat.needsUpdate = true;
  { const hp = sayed.arms[1].hand.getWorldPosition(V(0, 0, 0)); teaGlass6.position.copy(hp).add(V(0, 0.06, 0)); teaGlass6.visible = where === 'street'; }
  bill.visible = false;
  // Shehata
  shehata.root.visible = where === 'market';
  shehata.root.position.copy(SH_P); shehata.root.rotation.set(0, -0.35, 0);
  if (t >= T_CRASH) { const k = easeOut(seg(t, T_CRASH, T_CRASH + 0.4)); shehata.root.position.copy(VL(SH_P, SH_P.clone().add(V(-0.6, 0, 2.2)), k)); shehata.root.rotation.y = lerp(-0.35, 0.9, k); }
  const shz = poseAt(t, KEYS.shehata); if (t >= 21.9 && t < 23.3) { shz.aLz += Math.sin(t * 14) * 0.2; shz.aRz += Math.sin(t * 14 + 1) * 0.2; }
  applyPose(shehata, shz);
  { melonHat.visible = t >= T_CRASH + 0.25; shehata.head.updateWorldMatrix(true, false); melonHat.position.copy(V(0, 0.18, 0).applyMatrix4(shehata.head.matrixWorld)); melonHat.quaternion.copy(shehata.head.getWorldQuaternion(new THREE.Quaternion())); }
  // melons + chunks fly at the crash
  melons.forEach((o, i) => { const a = t - T_CRASH; if (a > 0 && i % 2 === 0) { o.m.position.copy(o.base.clone().add(o.v.clone().multiplyScalar(a)).add(V(0, -4.9 * a * a, 0))); if (o.m.position.y < 0.2) o.m.position.y = 0.2; o.m.rotation.set(a * o.spin, a * 3, 0); } else { o.m.position.copy(o.base); o.m.rotation.set(0, 0, 0); } });
  chunks.forEach((o, i) => { const a = t - T_CRASH; o.c.visible = where === 'market' && a > 0 && a < 1.6; if (o.c.visible) { o.c.position.set(0.3 + o.v.x * a, 1.0 + o.v.y * a - 4.9 * a * a, -2.0 + o.v.z * a); if (o.c.position.y < 0.05) o.c.position.y = 0.05; o.c.rotation.set(a * 9, a * 7, 0); } });
  // clouds drift
  clouds.forEach((c, i) => { c.position.set(300 + 60 - ((t * 6 + i * 23) % 140), 30 + (i % 4) * 4, -30 + (i * 37 % 60) - 10); });

  // ---- particles ----
  const fire = [];
  if (tp.vis && t >= T_LAUNCH - 0.5 && t < T_CRASH) { const base = engine6.getWorldPosition(V(0, 0, 0)); const q = tuk.getWorldQuaternion(new THREE.Quaternion()); const dir = V(1, 0, 0).applyQuaternion(q); for (let i = 0; i < 26; i++) { const ph = (t * 3.5 + i / 26) % 1; fire.push({ pos: base.clone().add(dir.clone().multiplyScalar(0.4 + ph * 2.4)).add(V((hash(i) - .5) * 0.3 * ph, (hash(i + 1) - .5) * 0.3 * ph, (hash(i + 2) - .5) * 0.3 * ph)), size: (0.2 + ph * 0.5) * (1 - ph * 0.5), op: 1 - ph, rot: i }); } }
  emit(fire, firePool7);
  const puffs = [];
  if (t >= 2.6 && t < T_ARRIVE + 0.6) { const k = seg(t, T_ARRIVE - 0.1, T_ARRIVE + 0.6); if (t >= T_ARRIVE - 0.1) for (let i = 0; i < 8; i++) { const a = i / 8 * 6.28; puffs.push({ pos: TUK_P.clone().add(V(Math.cos(a) * k * 1.6, 0.15, Math.sin(a) * k * 1.2)), size: 0.3 + k * 0.6, op: (1 - k) * 0.6, color: 0xc8b898 }); } }
  if (t >= T_CRASH && t < T_CRASH + 1.0) { const k = seg(t, T_CRASH, T_CRASH + 1.0); for (let i = 0; i < 12; i++) { const a = i / 12 * 6.28; puffs.push({ pos: V(-300 + 0.3 + Math.cos(a) * k * 2.4, 0.4 + k, -2.0 + Math.sin(a) * k * 1.8), size: 0.4 + k * 0.9, op: (1 - k) * 0.7, color: 0xd8c8a8 }); } }
  emit(puffs, puffPool);
  const stars = [];
  if (t >= T_CRASH + 0.3 && t < 25.0) { const hd = hoda.head.getWorldPosition(V(0, 0, 0)); for (let i = 0; i < 5; i++) { const a = t * 4 + i * 1.26; stars.push({ pos: hd.clone().add(V(Math.cos(a) * 0.35, 0.3, Math.sin(a) * 0.35)), size: 0.12, rot: a }); } }
  if (t >= T_RESULT) { const hd = mom.head.getWorldPosition(V(0, 0, 0)); for (let i = 0; i < 6; i++) { const a = t * 2 + i * 1.05; stars.push({ pos: hd.clone().add(V(Math.cos(a) * 0.6, 0.2 + Math.sin(a * 2) * 0.2, Math.sin(a) * 0.6)), size: 0.14, rot: a }); } }
  emit(stars, starPool);
  const sw = [];
  if (t >= 12.8 && t < 14.0) { const hd = mom.head.getWorldPosition(V(0, 0, 0)); for (let i = 0; i < 4; i++) { const k = (t * 1.5 + i * 0.25) % 1; sw.push({ pos: hd.clone().add(V((i % 2 ? 1 : -1) * 0.3, 0.2 - k * 0.5, 0)), size: 0.08, op: 1 - k }); } }
  emit(sw, sweatPool); emit([], trailPool);

  // ---- faces ----
  let me = 'normal', mm = talkMouth(t, 'mom', 'scream') || 'closed';
  if (t < 4.5) { me = 'wide'; }
  else if (t < 7.35) { me = 'flat'; mm = mm === 'closed' ? 'flat' : mm; }
  else if (t < 10.0) { me = 'angry'; if (mm === 'closed') mm = 'clench'; }
  else if (t < 12.8) { me = 'pin'; mm = 'o'; }
  else if (t < 13.8) { me = 'wide'; mm = talkMouth(t, 'mom', 'scream') || 'scream'; }
  else if (t < T_DIVE) { me = 'menace'; if (mm === 'closed') mm = 'flat'; }
  else if (t < T_CRASH) { me = 'pin'; mm = 'scream'; }
  else if (t < 25.25) { me = 'flat'; mm = 'flat'; }
  else if (t < T_RESULT) { me = 'smug'; if (mm === 'closed') mm = 'smile'; }
  else { me = 'sparkle'; mm = 'grin'; }
  let he = 'smug', hm = talkMouth(t, 'hoda') || 'grin';
  if (t >= T_LAUNCH && t < T_DIVE) { he = 'wide'; if (hm === 'grin' && t < 16.7) hm = 'grin'; }
  if (t >= T_DIVE && t < T_CRASH) { he = 'pin'; hm = 'scream'; }
  if (t >= T_CRASH) { he = 'dizzy'; hm = 'tongue'; }
  let se = 'angry', sm = talkMouth(t, 'shehata', 'scream') || 'clench';
  if (t < T_CRASH) { se = 'normal'; sm = 'smile'; }
  if (t >= 25.25 && t < 27.0) { se = 'side'; sm = 'flat'; }
  if (t >= 27.0) { se = 'pin'; sm = talkMouth(t, 'shehata') || 'o'; }
  if (t >= 29.2) { se = 'flat'; sm = 'wobble'; }
  mom.faceMat.map = faceTexture(me, mm, {}); mom.faceMat.needsUpdate = true;
  hoda.faceMat.map = faceTexture(he, hm, { fuzz: true }); hoda.faceMat.needsUpdate = true;
  shehata.faceMat.map = faceTexture(se, sm, { stache: true }); shehata.faceMat.needsUpdate = true;
}

// =====================================================================
function cameraAt(t) {
  if (t < 4.5) { const k = seg(t, 0, 4.5); cam(VL(V(-2.6, 1.5, 3.4), V(-2.2, 1.45, 2.8), k), VL(V(-0.6, 1.4, -2.2), V(0.4, 1.4, -0.8), easeInOut(seg(t, 2.4, 4.2))), 52); }
  else if (t < 7.35) { faceCam(hoda, 1.3, 0.3, 0.05, 48, 0.08); }
  else if (t < 10.0) { faceCam(mom, 1.4, -0.3, 0.05, 46, 0.08); }
  else if (t < T_LAUNCH) { faceCam(hoda, 1.0, 0.2, 0.02, 44, 0.03); }
  else if (t < 12.8) { cam(V(-1.5, 1.6, 7.5).add(shake(t, 0.08, 25)), tuk.position.clone().add(V(0, 0.8, 0)), 58); }
  else if (t < 16.7) { const p = tuk.position.clone(); cam(p.clone().add(V(-3.2, 3.2, 4.4)).add(shake(t, 0.03, 15)), p.clone().add(V(0.3, -1.2, 0)), 60, Math.sin(t) * 0.05); }
  else if (t < T_DIVE) { const p = tuk.position.clone(); cam(p.clone().add(V(-4.2, 2.6, -1.6)).add(shake(t, 0.03, 15)), p.clone().add(V(0, -0.6, 0)), 58); }
  else if (t < 21.9) { const tc = Math.min(t, T_CRASH + 0.6); cam(V(-300 - 3.5, 1.2, 5.5).add(shake(t, t > T_CRASH ? 0.15 * (1 - seg(t, T_CRASH, 21.9)) : 0, 25)), VL(V(-300 + 6, 9, 2), V(-300 + 0.2, 1.0, -2.2), easeIn(seg(tc, T_DIVE, T_CRASH))), 56); }
  else if (t < 25.25) { faceCam(shehata, 1.6, 0.3, 0.05, 48, 0.12); }
  else if (t < 27.0) { faceCam(mom, 1.4, -0.3, 0.0, 46, 0.15); }
  else if (t < 27.95) { faceCam(shehata, 1.2, 0.2, 0.02, 44, 0.08); }
  else if (t < T_RESULT) { faceCam(mom, 2.8, -1.1, 0.2, 54, 0.35); }
  else { const k = easeInOut(seg(t, T_RESULT, 38.5)); faceCam(mom, lerp(3.0, 4.6, k), -0.8, lerp(0.3, 1.0, k), 54, 0.4); }
}

// =====================================================================
// HUD
// =====================================================================
const NAMES = { mom: ['أم حمادة', 'OM HAMADA', '#1f9e5a'], hoda: ['حودة', 'HODA', '#e0a000'], shehata: ['المعلم شحتة', 'SHEHATA', '#3a5aa8'] };
function portrait(g, x, y, who, t) {
  g.fillStyle = '#123'; g.fillRect(x, y, 64, 64); g.strokeStyle = '#fff'; g.lineWidth = 2; g.strokeRect(x, y, 64, 64);
  g.save(); g.beginPath(); g.rect(x + 2, y + 2, 60, 60); g.clip();
  if (who === 'mom') { g.fillStyle = '#1f9e5a'; g.beginPath(); g.arc(x + 32, y + 34, 27, 0, 7); g.fill(); g.fillStyle = '#c98d5f'; g.beginPath(); g.arc(x + 32, y + 38, 19, 0, 7); g.fill(); g.fillStyle = '#ec86ad'; g.fillRect(x + 6, y + 58, 52, 6); }
  else if (who === 'hoda') { g.fillStyle = '#ffd400'; g.fillRect(x + 8, y + 54, 48, 10); g.fillStyle = '#a87048'; g.beginPath(); g.arc(x + 32, y + 36, 19, 0, 7); g.fill(); g.fillStyle = '#120c08'; for (let i = 0; i < 6; i++) { g.beginPath(); g.moveTo(x + 14 + i * 7, y + 22); g.lineTo(x + 17 + i * 7, y + 6); g.lineTo(x + 21 + i * 7, y + 22); g.fill(); } }
  else { g.fillStyle = '#e8eef8'; g.fillRect(x + 6, y + 54, 52, 10); g.fillStyle = '#9a6440'; g.beginPath(); g.arc(x + 32, y + 37, 21, 0, 7); g.fill(); g.fillStyle = '#f2f2f2'; g.beginPath(); g.arc(x + 32, y + 22, 20, Math.PI, 0); g.fill(); }
  const fc = document.createElement('canvas'); fc.width = 32; fc.height = 32; const fg = fc.getContext('2d');
  const e = envAt(t); const mouth = speakerAt(t) === who ? (e < 0.1 ? 'closed' : e < 0.4 ? 'talk1' : 'talk2') : 'closed';
  const eyes = who === 'mom' ? (t > 12.8 && t < 19.4 ? 'menace' : t > 25 ? 'smug' : 'angry') : who === 'hoda' ? 'smug' : (t > 27 ? 'pin' : 'angry');
  drawFace(fg, 32, eyes, mouth, { stache: who === 'shehata', fuzz: who === 'hoda' });
  g.imageSmoothingEnabled = false; g.drawImage(fc, x + 14, y + 20, 36, 36); g.restore();
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
function drawTitle(g, t) {
  if (t >= 1.3) return; const op = t < 0.9 ? 1 : 1 - seg(t, 0.9, 1.3);
  g.globalAlpha = op; g.fillStyle = 'rgba(0,0,0,0.6)'; g.fillRect(0, 196, W, 76);
  arText(g, 'مشوار السوق', W / 2, 198, 40, '#ffe14a', 'center', 'ReemKufi'); pxText(g, 'THE MARKET RUN', W / 2, 250, 10, '#fff', 'center'); g.globalAlpha = 1;
}
function fare(t) { if (t < 4.6) return null; if (t < 14.6) return 50; if (t < 16.0) return Math.round(lerp(50, 30, seg(t, 14.6, 16.0))); return 30; }
function drawFare(g, t) {
  const f = fare(t); if (f === null || t >= T_CRASH) return;
  const x = W - 190, y = 12; g.fillStyle = 'rgba(0,0,30,0.8)'; g.fillRect(x, y, 176, 56); g.strokeStyle = '#fff'; g.lineWidth = 2; g.strokeRect(x, y, 176, 56);
  pxText(g, 'FARE', x + 10, y + 8, 8, '#ffe14a'); arText(g, 'الأجرة', x + 168, y + 2, 16, '#fff');
  pxText(g, f + ' EGP', x + 10, y + 28, 16, f < 50 ? '#3df05a' : '#fff');
  if (t >= 14.6 && t < 16.4 && Math.floor(t * 8) % 2) pxText(g, 'HAGGLE!', x + 100, y + 30, 8, '#ff4040');
}
function drawAlt(g, t) {
  if (t < 12.8 || t >= T_CRASH) return;
  const alt = t < T_DIVE ? 340 + Math.round(Math.sin(t) * 10) : Math.max(0, Math.round(lerp(340, 0, seg(t, T_DIVE, T_CRASH))));
  const x = 14, y = 12; g.fillStyle = 'rgba(0,0,30,0.8)'; g.fillRect(x, y, 200, 56); g.strokeStyle = '#fff'; g.lineWidth = 2; g.strokeRect(x, y, 200, 56);
  pxText(g, 'ALTITUDE', x + 10, y + 8, 8, '#9fd0ff'); pxText(g, alt + ' M', x + 10, y + 28, 16, alt < 100 ? '#ff4040' : '#fff');
  pxText(g, 'BRAKES:', x + 120, y + 10, 7, '#fff'); pxText(g, 'NONE', x + 120, y + 26, 10, '#ff4040');
  if (t >= T_DIVE && Math.floor(t * 6) % 2) { pxText(g, 'WARNING!', W / 2, 120, 22, '#ff3030', 'center'); arText(g, 'خطر! فرشة بطيخ!', W / 2, 150, 24, '#ffe14a', 'center'); }
}
function drawSplat(g, t) {
  const a = t - T_CRASH; if (a < 0 || a > 0.7) return;
  const k = easeBack(clamp(a / 0.15)); g.save(); g.translate(W / 2, 200); g.scale(k, k); g.rotate(-0.1);
  pxText(g, 'SPLAT!', 0, -20, 40, '#e8303a', 'center'); g.restore();
}
function drawResult(g, t) {
  if (t < T_RESULT || t >= T_END + 0.3) return; const a = t - T_RESULT;
  g.fillStyle = `rgba(0,0,20,${0.55 * clamp(a / 0.3)})`; g.fillRect(0, 0, W, H);
  const k = easeBack(clamp(a / 0.3)); g.save(); g.translate(W / 2, 70); g.scale(k, k);
  pxText(g, 'SHOPPING COMPLETE', 0, -14, 18, '#3df05a', 'center'); arText(g, 'تم التسوق بنجاح', 0, 10, 26, '#fff', 'center'); g.restore();
  const rows = [[2.2, 'المشوار: ٣٠ بدل ٥٠', 'TRIP: 30 / 50 EGP'], [2.9, 'البطيخ: اتنين بخمسة', 'MELONS: 2 FOR 5'], [3.6, 'التوصيل: بالطيارة', 'DELIVERY: BY AIR'], [4.3, 'المعلم شحتة: في صدمة', 'SELLER: IN SHOCK']];
  rows.forEach(([t0, ar, en], i) => { if (a < t0 - 1.2) return; const yy = 140 + i * 46; g.fillStyle = 'rgba(10,10,40,0.85)'; g.fillRect(90, yy, W - 180, 40); arText(g, ar, W - 100, yy + 2, 20, '#fff'); pxText(g, en, 100, yy + 14, 8, '#9fd0ff'); });
  if (a > 4.4) { const k2 = easeBack(seg(t, T_RESULT + 4.4, T_RESULT + 4.7)); g.save(); g.translate(W / 2, 360); g.scale(k2, k2); g.rotate(-0.08); g.strokeStyle = '#ffd400'; g.lineWidth = 4; g.strokeRect(-200, -34, 400, 70); pxText(g, 'HAGGLING: LEGENDARY', 0, -18, 14, '#ffd400', 'center'); arText(g, 'مستوى الفصال: أسطوري', 0, 0, 24, '#ffe14a', 'center', 'ReemKufi'); g.restore(); }
}
function drawEnd(g, t) {
  const a = t - T_END - 0.3; if (a < 0) return; const k = easeOut(clamp(a / 0.4));
  g.fillStyle = `rgba(0,0,0,${0.55 * k})`; g.fillRect(0, 0, W, H);
  g.save(); g.translate(W / 2, 190); g.scale(k, k); arText(g, 'يُتبع...', 0, -40, 54, '#ffe14a', 'center', 'ReemKufi'); pxText(g, 'TO BE CONTINUED', 0, 30, 16, '#fff', 'center'); g.restore();
}

window.renderFrame = function (t) {
  stateAt(t); cameraAt(t);
  renderer.render(scene, camera);
  ctx.clearRect(0, 0, W, H); ctx.drawImage(glCanvas, 0, 0);
  h.clearRect(0, 0, W, H);
  drawFare(h, t); drawAlt(h, t); drawSplat(h, t); drawResult(h, t); drawDialogue(h, t); drawEnd(h, t); drawTitle(h, t);
  ctx.drawImage(hud, 0, 0);
  vignette(ctx, 0.3);
  if (t >= T_LAUNCH && t < T_LAUNCH + 0.07) { ctx.fillStyle = 'rgba(255,240,200,0.8)'; ctx.fillRect(0, 0, W, H); }
  if (t >= T_CRASH && t < T_CRASH + 0.06) { ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, W, H); }
  if (t >= 12.65 && t < 12.95) { ctx.fillStyle = '#fff'; ctx.globalAlpha = 1 - Math.abs(t - 12.8) / 0.15; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; }
  if (t >= T_DIVE - 0.1 && t < T_DIVE + 0.1) { ctx.fillStyle = '#fff'; ctx.globalAlpha = 1 - Math.abs(t - T_DIVE) / 0.1; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; }
  return true;
};
window.frameData = () => out.toDataURL('image/png');
window.DUR = DUR;
document.fonts.load('10px PS2P').then(() => document.fonts.load('20px Lalezar', 'ع')).then(() => document.fonts.load('700 20px ReemKufi', 'ع')).then(() => {
  const re = (tex, bg, fn) => { const g = tex.userData.g, c = tex.userData.canvas; g.fillStyle = bg; g.fillRect(0, 0, c.width, c.height); fn(g, c.width, c.height); tex.needsUpdate = true; };
  re(shopTex, '#1f6fd8', (g) => { g.fillStyle = '#fff'; g.font = '16px Lalezar'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.direction = 'rtl'; g.fillText('بقالة الأمل', 48, 13); });
  re(mashallahTex, '#d8231b', (g) => { g.fillStyle = '#ffe14a'; g.font = '13px Lalezar'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.direction = 'rtl'; g.fillText('ما شاء الله', 32, 11); });
  re(window.__signTex, '#ffe14a', (g) => { g.fillStyle = '#c11'; g.font = '13px Lalezar'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.direction = 'rtl'; g.fillText('بطيخ مستورد', 32, 11); });
  window.READY = true;
});
