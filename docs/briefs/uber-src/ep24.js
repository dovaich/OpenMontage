// =====================================================================
// أوبر إبراهيم — Ibrahim drives Uber in Abu Samir's car; the red button. vertical 9:16
// L01 shehata(cold) L02 mom L03 dad L04 sayed L05 dad L06 shehata L07 dad L08 shehata L09 dad L10 anno
// =====================================================================
room.visible = true;
const lateDraw = [];
const Lx = (i) => LINES[i - 1];
const T_RW = Lx(1).t1 + 0.15, T_HOOK = T_RW + 0.6, T_ROAD = Lx(4).t0 - 0.6, T_BTN = Lx(7).t1 - 0.25, T_LAND = Lx(10).t0 + 0.6, T_ANNO = Lx(10).t0;
function phase(t) { return t < T_RW + 0.6 ? 'sky' : t < T_ROAD ? 'home' : t < T_BTN + 1.2 ? 'road' : t < T_LAND - 1.0 ? 'sky' : 'market'; }

// ---------- passengers ----------
const sayed = makeChar({
  seed: 41, skin: 0x8a5a3a, hipY: 0.84, legX: 0.12, legColor: 0x6b5a48, shoe: 0x3a2a1a, hand: 0x8a5a3a,
  torsoGeo: cyl(0.28, 0.34, 0.66, 7), torsoTex: null, torsoColor: 0x6b5a48, torsoY: 0.33,
  skirt: cyl(0.34, 0.44, 0.75, 7), sleeve: true, sleeveColor: 0x6b5a48, shoulderX: 0.34, shoulderY: 0.6, neckY: 0.66, headR: 0.28,
  build(head, torso, reg) { const tw = reg(M(0xf4f2ea)); const turban = mesh(new THREE.TorusGeometry(0.24, 0.09, 5, 10), tw, 0, 0.2, -0.02, head); turban.rotation.x = Math.PI / 2; mesh(new THREE.SphereGeometry(0.2, 7, 4, 0, Math.PI * 2, 0, Math.PI / 2), tw, 0, 0.22, -0.02, head); mesh(box(0.62, 0.1, 0.05), reg(M(0xd8d0b8)), 0, 0.45, 0.24, torso); return {}; }
}, scene);
const shehata = makeChar({
  seed: 51, skin: 0x9a6440, hipY: 0.86, legX: 0.14, legColor: 0x4a5a7a, shoe: 0x3a2a1a, hand: 0x9a6440,
  torsoGeo: cyl(0.34, 0.46, 0.7, 7), torsoTex: canvasTex(16, 16, (g) => { g.fillStyle = '#e8eef8'; g.fillRect(0, 0, 16, 16); g.fillStyle = '#3a5aa8'; g.fillRect(0, 0, 2, 16); g.fillRect(6, 0, 2, 16); g.fillRect(12, 0, 2, 16); }, [3, 2]), torsoColor: 0xffffff, torsoY: 0.35,
  skirt: cyl(0.46, 0.5, 0.7, 7), sleeve: true, shoulderX: 0.44, shoulderY: 0.62, neckY: 0.7, headR: 0.3,
  build(head, torso, reg) { mesh(new THREE.SphereGeometry(0.31, 8, 4, 0, Math.PI * 2, 0, Math.PI * 0.35), reg(M(0xf2f2f2)), 0, 0.04, 0, head); mesh(box(0.7, 0.55, 0.05), reg(M(0xd8c8a0)), 0, 0.25, 0.42, torso); return {}; }
}, scene);
const melonT = canvasTex(16, 16, (g) => { g.fillStyle = '#3f8a2f'; g.fillRect(0, 0, 16, 16); g.fillStyle = '#1f5a1f'; for (let i = 0; i < 16; i += 4) g.fillRect(i, 0, 2, 16); });
const lapMelons = [0, 1].map(i => { const m = mesh(new THREE.SphereGeometry(0.2, 7, 5), M(0xffffff, { map: melonT }), 0, 0, 0, scene); m.scale.set(1.3, 1, 1); return m; });
const fallMelons = [0, 1, 2].map(i => { const m = mesh(new THREE.SphereGeometry(0.2, 7, 5), M(0xffffff, { map: melonT }), 0, 0, 0, scene); m.scale.set(1.3, 1, 1); return m; });

// ---------- the car (Abu Samir's 128) + the red button + nuclear engine glow ----------
const SC = makeSamirCar(scene); const car = SC.g; lateDraw.push(SC.late);
const carGlass = []; SC.body.children.forEach(o => { if (o.isMesh && o.position.y > 1.05) carGlass.push(o); });
const redBtn = mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.04, 10), new THREE.MeshBasicMaterial({ color: 0xff2020 }), 0.74, 1.18, -0.12, car); redBtn.rotation.z = Math.PI / 2 - 0.4;
const flameGrp = new THREE.Group(); flameGrp.position.set(-2.5, 0.54, 0); car.add(flameGrp);
const carFlames = []; for (let i = 0; i < 6; i++) { const f = mesh(new THREE.ConeGeometry(0.16 - i * 0.015, 0.6 + i * 0.15, 6), new THREE.MeshBasicMaterial({ color: [0xffdd33, 0xff9a1a, 0xff5a10][i % 3], transparent: true, opacity: 0.85 - i * 0.1 }), -i * 0.18, 0, (i % 2 - 0.5) * 0.15, flameGrp); f.rotation.z = Math.PI / 2; carFlames.push(f); }
const phoneD = new THREE.Group(); car.add(phoneD); phoneD.position.set(0.9, 1.34, -0.3); mesh(box(0.012, 0.15, 0.08), P(0x222222), 0, 0, 0, phoneD); mesh(new THREE.PlaneGeometry(0.07, 0.13), new THREE.MeshBasicMaterial({ color: 0x3df05a }), -0.007, 0, 0, phoneD).rotation.y = -Math.PI / 2;
const SEATS = { dad: V(0.18, 0.08, -0.5), shehata: V(0.18, 0.08, 0.5), sayed: V(-1.0, 0.08, -0.25) };
const HEADSIDE = { dad: -1, shehata: 1, sayed: -1 };
function seatIn(c, key, extra = {}) { if (c.root.parent !== car) car.add(c.root); c.root.position.copy(SEATS[key]); c.root.rotation.set(0, Math.PI / 2, 0); return { ...POSE0, y: -0.42, lL: 1.45, lR: 1.45, aLx: 0.5, eL: 0.9, aRx: 0.5, eR: 0.9, hy: 0, ...extra }; }
function outOf(c) { if (c.root.parent !== scene) scene.add(c.root); }

// ---------- ROAD (x = 400): street with shops on both sides ----------
const RX = 400;
{
  mesh(new THREE.PlaneGeometry(260, 8), M(0x3a3a3e), RX + 100, 0.01, 0, scene).rotation.x = -Math.PI / 2;
  for (let i = 0; i < 52; i++) mesh(box(1.6, 0.02, 0.12), M(0xf4f4f4), RX - 20 + i * 5, 0.02, 0, scene);
  for (const z of [-5, 5]) { mesh(new THREE.PlaneGeometry(260, 2.5), M(0xb8ab8e), RX + 100, 0.03, z, scene).rotation.x = -Math.PI / 2; }
  const r = rng(24);
  for (let i = 0; i < 40; i++) for (const side of [-1, 1]) { const hh = 5 + r() * 8, w = 4 + r() * 2; const x = RX - 20 + i * 6.5; mesh(box(w, hh, 3), M([0xd8b080, 0xc99a5a, 0xb48a6a, 0xe0c89a][(i + (side > 0 ? 1 : 0)) % 4]), x, hh / 2, side * 8.0, scene);
    mesh(new THREE.PlaneGeometry(w * 0.7, 1.8), M([0xd8231b, 0x1f5fd8, 0x2a8a3a, 0xffd400][i % 4]), x, 1.2, side * 6.49, scene).rotation.y = side > 0 ? Math.PI : 0;
    for (let k = 0; k < 3; k++) mesh(new THREE.PlaneGeometry(0.8, 0.9), M(0x2a3a5a), x - 1 + k, 3.2 + (k % 2), side * 6.49, scene).rotation.y = side > 0 ? Math.PI : 0; }
  for (let i = 0; i < 30; i++) { const x = RX - 18 + i * 8.5; mesh(cyl(0.05, 0.06, 4, 5), M(0x333333), x, 2, -4.2, scene); }
}
const roadSky = mesh(new THREE.PlaneGeometry(400, 80), new THREE.MeshBasicMaterial({ color: 0x8ec8ff }), RX + 100, 20, -60, scene);
const CAR_SPEED = 7.0;

// ---------- SKY over Cairo (x = 2000) ----------
const SKX = 2000;
{
  mesh(new THREE.PlaneGeometry(1400, 1400), M(0xd8bc80), SKX, 0, 0, scene).rotation.x = -Math.PI / 2;
  mesh(new THREE.PlaneGeometry(800, 1400), M(0x2f7fc8), SKX + 462, 0.6, 0, scene).rotation.x = -Math.PI / 2;
  const r = rng(9); for (let i = 0; i < 120; i++) { const h = 4 + r() * 14; mesh(box(4 + r() * 5, h, 4 + r() * 5), M([0xf4f0e8, 0xe8dcc0, 0xd8d0c0][i % 3]), SKX - 60 + r() * 120, h / 2, -130 + r() * 260, scene); }
  for (let i = 0; i < 3; i++) { const hh = 40 - i * 8; const p = mesh(new THREE.ConeGeometry(34 - i * 7, hh, 4), M(0xe0c070), SKX - 160 + i * 42, hh / 2, -150 + i * 24, scene); p.rotation.y = Math.PI / 4; }
  mesh(cyl(2.5, 3.5, 30, 6), M(0xe8dcc0), SKX + 20, 15, -40, scene); mesh(new THREE.ConeGeometry(3, 8, 6), M(0x5fae6a), SKX + 20, 34, -40, scene);
}
const skyClouds = []; for (let i = 0; i < 18; i++) { const c = mesh(new THREE.IcosahedronGeometry(3 + hash(i) * 3, 0), new THREE.MeshLambertMaterial({ color: 0xffffff, transparent: true, opacity: 0.88, flatShading: true }), SKX + (hash(i + 1) - .5) * 160, 50 + hash(i + 2) * 18, -25 - hash(i + 3) * 80, scene); c.scale.y = 0.5; skyClouds.push(c); }

// ---------- MARKET (x = 200): Shehata's stall (crash target) ----------
const MK = 200;
const stallMelons = [];
{
  mesh(new THREE.PlaneGeometry(60, 30), M(0xb8ab8e), MK, 0, 0, scene).rotation.x = -Math.PI / 2;
  for (let i = -3; i <= 3; i++) { mesh(box(4.6, 5 + (i % 2) * 1.5, 1), M([0xd8b080, 0xc99a5a, 0xb48a6a][(i + 3) % 3]), MK + i * 4.8, 2.5, -7, scene); mesh(new THREE.PlaneGeometry(2.4, 2.2), M(0x2a2018), MK + i * 4.8, 1.2, -6.49, scene); }
  const awnT = canvasTex(16, 16, (g) => { for (let i = 0; i < 4; i++) { g.fillStyle = i % 2 ? '#fff' : '#d8231b'; g.fillRect(i * 4, 0, 4, 16); } }, [3, 1]);
  const st = new THREE.Group(); st.position.set(MK, 0, -2.6); scene.add(st);
  mesh(box(3.0, 0.7, 1.4), M(0x8a5a2b, { map: woodTex }), 0, 0.35, 0, st);
  for (const sx of [-1.45, 1.45]) for (const sz of [-0.65, 0.65]) mesh(box(0.06, 2.4, 0.06), M(0x6a4220), sx, 1.2, sz, st);
  mesh(box(3.3, 0.06, 1.8), M(0xffffff, { map: awnT }), 0, 2.45, 0.1, st).rotation.x = -0.15;
  for (let i = 0; i < 18; i++) { const m = mesh(new THREE.SphereGeometry(0.24, 7, 5), M(0xffffff, { map: melonT }), -1.1 + (i % 6) * 0.44, 0.92 + Math.floor(i / 6) * 0.36, -0.35 + (Math.floor(i / 6) % 2) * 0.3, st); m.scale.set(1.3, 1, 1); stallMelons.push({ m, base: m.position.clone(), v: V((hash(i) - .5) * 6, 2 + hash(i + 1) * 4, 1 + hash(i + 2) * 4) }); }
}
const mkChunks = []; for (let i = 0; i < 26; i++) { const c = mesh(new THREE.TetrahedronGeometry(0.1 + hash(i) * 0.08, 0), M(i % 3 ? 0xe8303a : 0x2f7a2f), 0, 0, 0, scene); c.visible = false; mkChunks.push({ c, v: V((hash(i + 1) - .5) * 8, 2 + hash(i + 2) * 5, (hash(i + 3) - .2) * 6) }); }
const sun = new THREE.DirectionalLight(0xfff2dc, 0); sun.position.set(3, 8, 6); scene.add(sun);

// ---------- car path ----------
function carPose(t) {
  const ph = phase(t);
  if (ph === 'road') { const x = RX + (t - T_ROAD) * CAR_SPEED; const lift = t > T_BTN ? Math.pow(Math.max(0, t - T_BTN), 2) * 3 : 0; return { p: V(x, lift, -1.6), ry: 0, rz: t > T_BTN ? Math.min(0.5, (t - T_BTN) * 0.6) : 0, fly: t > T_BTN }; }
  if (ph === 'sky') { const a = t < T_RW + 0.6 ? t : t - (T_BTN + 1.2) + 0.5; return { p: V(SKX - 30 + a * 9, 80 + Math.sin(a * 0.8) * 2, Math.sin(a * 0.3) * 6), ry: -0.2 + Math.sin(a * 0.5) * 0.1, rz: 0.12 + Math.sin(a * 1.3) * 0.06, fly: true }; }
  if (ph === 'market') { const k = clamp((t - (T_LAND - 1.0)) / 1.0); const p = VL(V(MK - 12, 9, 4), V(MK + 0.3, 0.9, -1.8), easeIn(k)); return { p, ry: -0.4, rz: k < 1 ? -0.35 : -0.25, fly: k < 1, crashed: k >= 1 }; }
  return { p: V(RX - 40, 0, 0), ry: 0, rz: 0, fly: false, hide: true };
}

function stateAt(t) {
  const ph = phase(t); const cp = carPose(t);
  car.position.copy(cp.p); car.rotation.set(0, cp.ry, cp.rz); car.visible = !cp.hide; car.updateMatrixWorld(true);
  SC.wheels.forEach(w => w.rotation.y = -t * 8);
  flameGrp.visible = !!cp.fly; carFlames.forEach((f, i) => f.scale.set(1, 0.8 + 0.4 * Math.sin(t * 30 + i), 1));
  redBtn.material.color.setHex(t > T_BTN ? 0xffe14a : (Math.floor(t * 3) % 2 ? 0xff2020 : 0xaa0000));
  room.visible = ph === 'home';
  // ----- home: Om Hamada lays down the law -----
  mom.root.visible = ph === 'home'; son.root.visible = false; samir.root.visible = false;
  if (ph === 'home') {
    outOf(dad); dad.root.position.set(0.45, 0, 0.2); dad.root.rotation.set(0, -0.6, 0);
    const dp = { ...POSE0, aRx: 1.3, eR: 0.9 }; if (speakerAt(t) === 'dad') { dp.aLz = 0.9; dp.eL = 0.3; }
    applyPose(dad, talkPose(dp, t, 'dad', 0.4)); setFace(dad, speakerAt(t) === 'dad' ? 'sparkle' : 'sad', talkMouth(t, 'dad', 'grin') || 'frown', { stache: true });
    mom.root.position.set(-0.45, 0, 0.1); mom.root.rotation.set(0, 0.6, 0); applyPose(mom, talkPose({ ...POSE0, aLx: 1.5, eL: 0.1, aLz: 0.4, aRz: 0.3 }, t, 'mom', 0.3)); setFace(mom, 'angry', talkMouth(t, 'mom') || 'frown', {});
    phoneH.visible = true; phoneH.position.copy(dad.arms[1].hand.getWorldPosition(V(0, 0, 0))).add(V(0, 0.08, 0.05));
    sayed.root.visible = shehata.root.visible = false;
  } else phoneH.visible = false;
  // ----- in the car -----
  if (ph !== 'home') {
    dad.root.visible = sayed.root.visible = shehata.root.visible = true;
    const crashed = cp.crashed;
    let dp = seatIn(dad, 'dad', { aLx: 1.2, eL: 0.4, aRx: 1.2, eR: 0.4 }); // hands on the wheel
    if (inT(t, Lx(5).t0 - 0.2, Lx(5).t1 + 0.2)) { dp.aRx = 1.0; dp.eR = 0.9; dp.aRz = 0.5; } // covering the button
    if (inT(t, T_BTN - 0.4, T_BTN + 0.2)) { dp.aRx = 1.3; dp.eR = 0.3; dp.aRz = 0.6; }
    applyPose(dad, talkPose(dp, t, 'dad', 0.3));
    let de = 'smug', dm = talkMouth(t, 'dad', 'grin') || 'smile';
    if (inT(t, Lx(5).t0 - 0.3, Lx(5).t1 + 0.3)) { de = 'side'; dm = talkMouth(t, 'dad') || 'clench'; } if (inT(t, Lx(7).t0, T_BTN + 1)) { de = 'sparkle'; dm = talkMouth(t, 'dad', 'grin') || 'grin'; }
    if (ph === 'sky') { de = 'smug'; dm = talkMouth(t, 'dad', 'grin') || 'smile'; } if (crashed) { de = 'x'; dm = 'o'; }
    setFace(dad, de, dm, { stache: true });
    const scared = cp.fly || crashed;
    let sp = seatIn(shehata, 'shehata', { aLx: 0.9, eL: 1.4, aRx: 0.9, eR: 1.4 }); // hugging melons
    if (scared) { sp.aLz = 2.5 + Math.sin(t * 12) * 0.25; sp.aRz = 2.5 - Math.sin(t * 12) * 0.25; sp.aLx = sp.aRx = 0; sp.eL = sp.eR = 0.3; }
    applyPose(shehata, talkPose(sp, t, 'shehata', 0.3));
    setFace(shehata, scared ? 'wide' : 'angry', talkMouth(t, 'shehata', 'scream') || (scared ? 'scream' : 'frown'), { stache: true });
    const zz = cp.fly && ph === 'sky';
    let yp = seatIn(sayed, 'sayed', { aLx: 0.4, eL: 0.6, aRx: 0.4, eR: 0.6 }); if (inT(t, Lx(4).t0, Lx(4).t1)) { yp.aRx = 1.0; yp.eR = 0.3; yp.hx = 0.2; } if (zz || crashed) { yp.hz = 0.45; yp.hx = 0.2; }
    applyPose(sayed, talkPose(yp, t, 'sayed', 0.3));
    setFace(sayed, zz || crashed ? 'closed' : inT(t, Lx(4).t0, Lx(4).t1) ? 'side' : 'tired', talkMouth(t, 'sayed') || ((zz || crashed) && Math.floor(t * 1.5) % 2 ? 'o' : 'smile'), { stache: true, stacheColor: '#dddddd' });
    lapMelons.forEach((m, i) => { m.visible = !cp.fly && !crashed; if (m.visible) m.position.copy(V(0.62, 0.72 + i * 0.25, 0.5).applyMatrix4(car.matrixWorld)); });
    fallMelons.forEach((m, i) => { m.visible = ph === 'sky'; if (m.visible) { const a = ((t * 0.7 + i / 3) % 1); m.position.copy(car.position).add(V(-1 - a * 3, -a * a * 25, 1 + i * 0.4)); m.rotation.set(t * 5, t * 3, 0); } });
  } else { lapMelons.forEach(m => m.visible = false); fallMelons.forEach(m => m.visible = false); outOf(sayed); outOf(shehata); }
  // market crash
  { const a = t - T_LAND; stallMelons.forEach((o, i) => { if (a > 0 && i % 2 === 0) { const tt = Math.min(a, 1.6); o.m.position.copy(o.base.clone().add(o.v.clone().multiplyScalar(tt)).add(V(0, -4.9 * tt * tt, 0))); if (o.m.position.y < -0.6) o.m.position.y = -0.6; } else o.m.position.copy(o.base); });
    mkChunks.forEach((o) => { o.c.visible = a > 0 && a < 3; if (o.c.visible) { const tt = Math.min(a, 1.4); o.c.position.set(MK + 0.2 + o.v.x * tt, Math.max(0.05, 1.1 + o.v.y * tt - 4.9 * tt * tt), -2.0 + o.v.z * tt); o.c.rotation.set(tt * 9, tt * 7, 0); } }); }
  // lights
  const day = ph !== 'home';
  ambient.color.setHex(day ? 0xfff4e0 : 0xfff0e0); ambient.intensity = day ? 0.75 : 0.6; sun.intensity = day ? 1.0 : 0; moon.intensity = 0.2; fill.intensity = 1.0;
  roomLight.position.set(0, 2.6, 1.0); roomLight.intensity = ph === 'home' ? 1.6 : 0; tvLight.intensity = 0; bathLight.intensity = 0; kitLight.intensity = 0;
  scene.background = new THREE.Color(ph === 'sky' ? 0x8ec8ff : ph === 'home' ? 0x101010 : 0x8ec8ff);
  camera.far = ph === 'sky' ? 900 : 200;
}
const phoneH = new THREE.Group(); scene.add(phoneH); mesh(box(0.08, 0.15, 0.012), P(0x222222), 0, 0, 0, phoneH); mesh(new THREE.PlaneGeometry(0.07, 0.13), new THREE.MeshBasicMaterial({ color: 0x3df05a }), 0, 0, 0.007, phoneH);

function faceIn(c, side, fov = 56, far = 1) { carGlass.forEach(g => g.visible = false); const q = car.getWorldQuaternion(new THREE.Quaternion()); const r = V(0, 0, 1).applyQuaternion(q), f = V(1, 0, 0).applyQuaternion(q); const hd = headOf(c); cam(hd.clone().add(r.multiplyScalar(side * 1.25 * far)).add(f.multiplyScalar(1.1 * far)).add(V(0, 0.02, 0)), hd.clone().add(V(0, -0.1, 0)), fov); }
function inCar(local, look, fov) { carGlass.forEach(g => g.visible = false); const p = local.clone().applyMatrix4(car.matrixWorld), l = look.clone().applyMatrix4(car.matrixWorld); cam(p, l, fov); }
function shotAt(t) {
  const ph = phase(t); carGlass.forEach(g => g.visible = true);
  if (t < T_RW + 0.6) { const c = car.position; cam(c.clone().add(V(-4.5, 1.6, 4.2)).add(shake(t, 0.05)), c.clone().add(V(0.5, 0.6, 0)), 60); return; }
  if (ph === 'home') { if (speakerAt(t) === 'dad') faceCam(dad, 1.9, -0.35, 0.05, 58, 0.3); else faceCam(mom, 1.9, 0.35, 0.05, 58, 0.3); return; }
  if (ph === 'road') {
    if (t < Lx(4).t0 + 0.2) { const c = car.position; const k = easeOut(seg(t, T_ROAD, Lx(4).t0 + 0.2)); cam(c.clone().add(VL(V(6, 2.5, 5), V(4, 1.6, 3.6), k)), c.clone().add(V(0, 0.8, 0)), 60); return; }
    if (t < Lx(5).t0 - 0.1) { faceIn(sayed, -1, 54); return; }   // Sayed in the back seat
    if (t < Lx(6).t0 - 0.1) { faceIn(dad, -1); return; }  // Ibrahim
    if (t < Lx(7).t0 - 0.1) { faceIn(shehata, 1); return; } // Shehata + melons
    if (t < T_BTN) { faceIn(dad, -1); return; }
    const c = car.position; cam(V(c.x - 6, 1.4, 4.5), c.clone().add(V(0, 0.6, 0)), 62); return;
  }
  if (ph === 'sky') {
    if (t < Lx(9).t0 - 0.1) { faceIn(shehata, 1, 64, 1.5); camera.position.add(shake(t, 0.02)); return; }
    if (t < T_ANNO) { faceIn(dad, -1, 64, 1.5); return; }
    const c = car.position; cam(c.clone().add(V(-5, 2, 6)), c.clone().add(V(1, 0, 0)), 62); return;
  }
  // market
  const k = easeInOut(seg(t, T_LAND, DUR - 3)); cam(VL(V(MK - 3.5, 2.2, 6.0), V(MK - 3.8, 3.0, 7.5), k).add(shake(t, t < T_LAND + 0.8 ? 0.15 : 0)), V(MK, 1.0, -2.0), 64);
}
function particles(t) {
  const tr = [], pf = [], st = [];
  if (carPose(t).fly && phase(t) !== 'market' || (phase(t) === 'market' && t < T_LAND)) { const base = V(-2.5, 0.54, 0).applyMatrix4(car.matrixWorld); const q = car.getWorldQuaternion(new THREE.Quaternion()); const dir = V(-1, 0, 0).applyQuaternion(q); for (let i = 0; i < 12; i++) { const ph2 = (t * 3.5 + i / 12) % 1; tr.push({ pos: base.clone().add(dir.clone().multiplyScalar(0.3 + ph2 * 3)).add(V(0, ph2 * 0.6, 0)), size: 0.5 + ph2 * 0.8, op: 1 - ph2, color: ph2 < 0.3 ? 0xffa030 : 0xdddddd }); } }
  { const a = t - T_LAND; if (a > 0 && a < 2) for (let i = 0; i < 12; i++) { const k = Math.min(1, a * 1.5); pf.push({ pos: V(MK + 0.3 + (hash(i) - .5) * 4 * k, 0.5 + hash(i + 1) * 2 * k, -1.8 + (hash(i + 2) - .5) * 2 * k), size: 0.6 + k, op: 1 - a / 2, color: 0xc8b890 }); } }
  if (carPose(t).crashed && t > T_LAND + 0.5) { const hd = headOf(dad); for (let i = 0; i < 4; i++) { const a = t * 4 + i * 1.57; st.push({ pos: hd.clone().add(V(Math.cos(a) * 0.35, 0.32, Math.sin(a) * 0.35)), size: 0.12, color: 0xffe14a }); } }
  emit(tr, trailPool); emit(pf, puffPool); emit(st, starPool); emit([], sweatPool);
}
function stars(n) { return '★'.repeat(n) + '☆'.repeat(5 - n); }
function drawApp(g, t) {
  const ph = phase(t); if (!(ph === 'road' && t < T_BTN + 0.8) && !(t >= T_ANNO)) return;
  const end = t >= T_ANNO; const n = end ? Math.max(1, 5 - Math.floor((t - T_ANNO) * 3)) : 5;
  g.save(); g.translate(end ? W / 2 : W - 140, end ? 200 : 240); const s = end ? 1.3 : 1; g.scale(s, s);
  g.fillStyle = '#111'; g.fillRect(-115, -70, 230, 140); g.fillStyle = '#fff'; g.fillRect(-108, -63, 216, 126);
  g.fillStyle = '#000'; g.fillRect(-108, -63, 216, 26); pxText(g, 'UBER', -96, -56, 10, '#fff', 'left', false); arText(g, end ? 'تقييم الكابتن' : 'رحلة مشتركة', 100, -63, 18, '#fff');
  arText(g, 'الكابتن: إبراهيم', 96, -30, 18, '#111'); g.font = '22px sans-serif'; g.fillStyle = n <= 1 ? '#d8231b' : '#f2b01e'; g.textAlign = 'center'; g.direction = 'ltr'; g.fillText(stars(n), 0, 18);
  if (end && n <= 1) arText(g, '«الكابتن طيّرني»', 0, 32, 18, '#d8231b', 'center'); else arText(g, 'زبونين: عم سيد + شحاتة', 0, 32, 16, '#555', 'center');
  g.restore();
}
function drawAltitude(g, t) {
  if (!(carPose(t).fly) || phase(t) === 'market') return; const alt = phase(t) === 'sky' ? Math.round(carPose(t).p.y * 10) : Math.round(carPose(t).p.y * 10);
  g.save(); g.translate(20, 230); g.fillStyle = 'rgba(0,0,0,0.65)'; g.fillRect(0, 0, 190, 54); arText(g, 'الارتفاع', 180, 0, 20, '#fff'); pxText(g, `${alt} M`, 12, 28, 14, '#ffe14a', 'left', false); g.restore();
}
window.renderFrame = function (t) {
  stateAt(t); shotAt(t); particles(t);
  renderer.render(scene, camera);
  ctx.clearRect(0, 0, W, H); ctx.drawImage(glCanvas, 0, 0);
  h.clearRect(0, 0, W, H);
  drawHookV(h, t, T_HOOK, T_HOOK + 3.2, 'لما أبوك يشتغل', 'أوبر');
  drawApp(h, t); drawAltitude(h, t); drawRewind(h, t, T_RW, T_HOOK, 'قبلها بربع ساعة...');
  drawDialogueV(h, t);
  drawEndV(h, t, T_ANNO + 1.8, 'RATING: ONE STAR', 'الكابتن إبراهيم: موقوف', [['RATING', 'التقييم: نجمة', T_ANNO + 2.6, '#ff5a4a'], ['MELONS', 'البطيخ: اتكسر', T_ANNO + 3.6, '#3df05a']], DUR);
  ctx.drawImage(hud, 0, 0); vignette(ctx, 0.3);
  if (t >= T_BTN && t < T_BTN + 0.08) { ctx.fillStyle = 'rgba(255,230,160,0.7)'; ctx.fillRect(0, 0, W, H); }
  if (t >= T_LAND && t < T_LAND + 0.08) { ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.fillRect(0, 0, W, H); }
  return true;
};
window.frameData = () => out.toDataURL('image/png');
window.DUR = DUR;
document.fonts.load('10px PS2P').then(() => document.fonts.load('20px Lalezar', 'ع')).then(() => document.fonts.load('700 20px ReemKufi', 'ع')).then(() => { lateDraw.forEach(f => f()); window.READY = true; });
