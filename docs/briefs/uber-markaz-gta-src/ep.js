// =====================================================================
// العربية في المركز — TEST (GTA-era look: real character models + glossy cars). vertical 9:16
// L01 bastam(cold) L02 dad L03 bastam L04 alamy L05 dad L06 gazzar L07 asly L08 dad L09 alamy L10 dad L11 bastam L12 samir L13 dad L14 anno
// =====================================================================
room.visible = false;
${GARAGE}
const G = -100; garage.position.x = G;
const lateDraw = [];
lateDraw.push(() => { const c = signT.image.getContext('2d'); c.fillStyle = '#d8231b'; c.fillRect(0, 0, 160, 32); c.fillStyle = '#fff'; c.fillRect(0, 0, 160, 3); c.fillRect(0, 29, 160, 3); c.font = '18px Lalezar'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.direction = 'rtl'; c.fillText('مركز العالمي لصيانة السيارات', 80, 16); signT.needsUpdate = true; });
${CREW}
const alamy = makeAlamy(scene);
scene.add(samir.root); scene.add(dad.root);
// the cartoon cars of the garage set → GTA-era cars
sedan.visible = false; car2.visible = false;
const cLift = makeGtaCar(scene, { color: 0x3a3d42, interior: false, plate: 'ط ر ٤٤١' }); cLift.g.position.set(G - 3.6, 1.72, -2.4); cLift.g.scale.setScalar(0.8); lateDraw.push(cLift.late); gtaCarModel(cLift, 'sedan_grey', { len: 4.5 });
const cRed = makeGtaCar(scene, { color: 0x7a1418, interior: false, plate: 'م ص ٧٢١' }); cRed.g.position.set(G + 3.6, 0, -3.6); cRed.g.rotation.y = 0.25; lateDraw.push(cRed.late); gtaCarModel(cRed, 'sedan_red', { len: 4.5 });
// Abu Samir's 128 (the crashed Uber), with the red button
const SC = makeGtaCar(scene, { style: '128', plate: 'س م ر ١٩٨٠' }); const car = SC.g; lateDraw.push(SC.late); gtaCarModel(SC, 'samir128', { len: 4.25 });
const melonT = canvasTex(16, 16, (g) => { g.fillStyle = '#3f8a2f'; g.fillRect(0, 0, 16, 16); g.fillStyle = '#1f5a1f'; for (let i = 0; i < 16; i += 4) g.fillRect(i, 0, 2, 16); });
for (let i = 0; i < 7; i++) { const m = mesh(new THREE.TetrahedronGeometry(0.09 + hash(i) * 0.07, 0), new THREE.MeshLambertMaterial({ color: i % 3 ? 0xe8303a : 0x2f7a2f }), 0, 0, 0, SC.body); m.position.set(-0.6 + hash(i + 3) * 2.6, i < 4 ? 1.45 : 0.93, (hash(i + 7) - .5) * 1.2); m.rotation.set(i, i * 2, 0); }
const crack = mesh(new THREE.PlaneGeometry(0.5, 0.35), new THREE.MeshBasicMaterial({ transparent: true, map: canvasTex(64, 48, (g) => { g.strokeStyle = 'rgba(255,255,255,0.85)'; g.lineWidth = 1; for (let i = 0; i < 9; i++) { g.beginPath(); g.moveTo(30, 22); let x = 30, y = 22; for (let k = 0; k < 4; k++) { x += Math.cos(i * 0.7 + k) * 7; y += Math.sin(i * 0.7 + k * 0.5) * 6; g.lineTo(x, y); } g.stroke(); } }) }), 1.05, 1.18, 0.25, SC.body); crack.rotation.y = Math.PI / 2; crack.rotation.x = -0.6;
const rocketFl = new THREE.Group(); SC.body.add(rocketFl); rocketFl.position.set(-0.6, 0.2, 0);
const rocketCones = []; for (let i = 0; i < 4; i++) { const f = mesh(new THREE.ConeGeometry(0.22, 1.2, 8), new THREE.MeshBasicMaterial({ color: [0xffdd33, 0xff9a1a][i % 2], transparent: true, opacity: 0.85 }), (i % 2 - 0.5) * 1.6, -0.5, (i < 2 ? -1 : 1) * 0.45, rocketFl); f.rotation.z = Math.PI; rocketCones.push(f); }
const roofHole = mesh(new THREE.CircleGeometry(1.6, 9), new THREE.MeshBasicMaterial({ color: 0x9fd0ff, side: THREE.DoubleSide }), 0, 4.97, 0, scene); roofHole.rotation.x = Math.PI / 2;
const holeRim = mesh(new THREE.RingGeometry(1.55, 1.85, 9), new THREE.MeshBasicMaterial({ color: 0x2a2a2e, side: THREE.DoubleSide }), 0, 4.965, 0, scene); holeRim.rotation.x = Math.PI / 2;
const debris = []; for (let i = 0; i < 22; i++) { const d = mesh(new THREE.BoxGeometry(0.25 + hash(i) * 0.4, 0.04, 0.2 + hash(i + 1) * 0.3), new THREE.MeshLambertMaterial({ color: i % 2 ? 0x6f8fa8 : 0x5a5a60 }), 0, 0, 0, scene); d.visible = false; debris.push({ d, v: V((hash(i + 2) - .5) * 6, 1 + hash(i + 3) * 5, (hash(i + 4) - .5) * 6) }); }
const tablet = new THREE.Group(); scene.add(tablet); mesh(box(0.24, 0.17, 0.015), new THREE.MeshPhongMaterial({ color: 0x151518, shininess: 90 }), 0, 0, 0, tablet); mesh(new THREE.PlaneGeometry(0.21, 0.14), new THREE.MeshBasicMaterial({ map: monTex }), 0, 0, 0.009, tablet);
const fist = mesh(new THREE.SphereGeometry(0.07, 10, 8), new THREE.MeshLambertMaterial({ color: 0x8a5a3a }), 0, 0, 0, scene); fist.scale.set(1, 0.9, 1.3); fist.visible = false;
const hemi = new THREE.HemisphereLight(0xdfe8ff, 0x4a4036, 0.55); scene.add(hemi);
const garLight = new THREE.PointLight(0xfff6e8, 1.6, 16, 1.0); garLight.position.set(G - 0.5, 4.3, 1.5); scene.add(garLight);
const doorSun = new THREE.DirectionalLight(0xfff0d8, 0.9); doorSun.position.set(G + 12, 6, 2); doorSun.target.position.set(G, 0, -1); scene.add(doorSun); scene.add(doorSun.target);
scene.background = new THREE.Color(0x9fd0ff);

const Lx = (i) => LINES[i - 1];
const T_RW = Lx(1).t1 + 0.15, T_HOOK = T_RW + 0.6, T_SW = Lx(10).t1 + 0.08, T_BTN = T_SW + 0.85, T_ANNO = Lx(14).t0;
const CAR0 = V(G + 0.3, 0, -1.2);
function launchA(t) { return t < T_RW + 0.6 ? t * 0.85 + 0.75 : t - T_BTN; }
function carState(t) {
  if (t >= T_RW + 0.6 && t < Lx(2).t1 + 0.2) { const k = easeOut(seg(t, Lx(2).t0 - 0.3, Lx(2).t1)); return { p: V(lerp(G + 6.8, CAR0.x, k), 0, CAR0.z), rz: 0, fly: false }; }
  const a = launchA(t);
  if (a <= 0) { const rum = t > T_BTN - 0.2 ? 0.02 : 0; return { p: CAR0.clone().add(V(noise1(t * 40) * rum, Math.abs(noise1(t * 33)) * rum, 0)), rz: 0, fly: false }; }
  const y = Math.min(3.4 * a * a, 26 + a * 3); return { p: CAR0.clone().add(V(a * 0.15, y, 0)), rz: Math.min(0.35, a * 0.4), fly: true };
}
const T_ROOF = T_BTN + Math.sqrt(4.4 / 3.4);
const holeOpen = (t) => (t < T_RW + 0.6 && launchA(t) > Math.sqrt(4.4 / 3.4)) || t >= T_ROOF;

// ---------- seating Bestem in the 128 ----------
function seatIn(c, extra = {}) { if (c.root.parent !== SC.body) SC.body.add(c.root); c.root.position.copy(SC.seats.driver); c.root.rotation.set(0, Math.PI / 2, 0); return { ...POSE0, y: 0.5 - c.cfg.hipY, lL: 1.45, lR: 1.45, aLx: 1.2, eL: 0.4, aRx: 1.2, eR: 0.4, ...extra }; }
function outOf(c) { if (c.root.parent !== scene) scene.add(c.root); }

function stateAt(t) {
  const cs = carState(t); car.position.copy(cs.p); car.rotation.set(0, 0, cs.rz); car.updateMatrixWorld(true);
  SC.wheels.forEach(w => w.rotation.z = t < Lx(2).t1 ? -t * 6 : 0);
  rocketFl.visible = cs.fly; rocketCones.forEach((f, i) => f.scale.set(1, 0.8 + 0.35 * Math.sin(t * 30 + i), 1));
  if (SC.btn) SC.btn.material.color.setHex(t > T_BTN || t < T_RW + 0.6 ? 0xffe14a : (Math.floor(t * 3) % 2 ? 0xff2020 : 0xaa0000));
  roofHole.position.set(CAR0.x, 4.97, CAR0.z); holeRim.position.set(CAR0.x, 4.965, CAR0.z); roofHole.visible = holeRim.visible = holeOpen(t);
  const cold = t < T_RW + 0.6, H = speakerAt(t);
  // ----- Bestem: shouting by the lift, then in the driver's seat honking (from L09), launched (L11 + cold open) -----
  if (cold || t >= Lx(8).t1) { const sp = seatIn(bastam); if (cold || t >= T_BTN) { sp.aLz = 2.4 + Math.sin(t * 13) * 0.3; sp.aRz = 2.4 - Math.sin(t * 13) * 0.3; sp.aLx = sp.aRx = 0; sp.hx = -0.2; } else if (Math.floor(t * 2) % 2) { sp.aRx = 1.0; sp.eR = 1.0; } applyPose(bastam, talkPose(sp, t, 'bastam', 0.3)); }
  else { outOf(bastam); bastam.root.position.set(G - 2.4, 0, 0.6); bastam.root.rotation.set(0, 0.9, 0); const bp = { ...POSE0, aRx: 0.3 }; if (H === 'bastam') { bp.aLz = 1.5 + Math.sin(t * 9) * 0.2; bp.eL = 1.2; bp.aRz = 1.2; bp.eR = 1.0; bp.hx = -0.15; } applyPose(bastam, talkPose(bp, t, 'bastam', 0.4)); }
  // ----- Ibrahim -----
  { const r = dad.root; let dp = { ...POSE0 };
    if (t < Lx(2).t1 + 0.2 && !cold) { r.position.copy(car.position).add(V(2.75, 0, 0)); r.rotation.set(0, -Math.PI / 2, 0); dp = { ...POSE0, bend: 0.45, aLx: 1.35, aRx: 1.35, eL: 0.25, eR: 0.25, lL: Math.sin(t * 7) * 0.35, lR: -Math.sin(t * 7) * 0.35 }; }
    else { r.position.set(G + 2.1, 0, 0.9); r.rotation.set(0, -0.55, 0);
      if (inT(t, Lx(5).t0, Lx(5).t1)) { dp.aRx = 0.9; dp.eR = 1.2; dp.aRz = 0.3; dp.hz = 0.12; }
      if (inT(t, Lx(8).t0, Lx(8).t1 + 0.3)) { dp.aLx = 0.4; dp.eL = 1.9; dp.aLz = 0.5; dp.aRx = 0.4; dp.eR = 1.9; dp.aRz = 0.5; dp.bend = -0.12; dp.hx = -0.2; } // hands on chest, chin up
      if (inT(t, Lx(10).t0, Lx(10).t1)) { dp.aLz = 1.1; dp.aRz = 1.1; dp.eL = 0.6; dp.eR = 0.6; dp.hx = -0.1; }
      if (inT(t, T_SW + 0.2, T_SW + 1.5)) { dp = { ...POSE0, y: -0.38, bend: 0.75, lL: 0.7, lR: 0.7, aLx: 2.2, aRx: 2.2, eL: 1.6, eR: 1.6 }; } // ducks
      if (t >= Lx(13).t0 - 0.2) { dp = { ...POSE0, aRx: 2.9, eR: 0.1, hx: -0.15, aLz: 0.2 }; } // pointing up at the sky
    }
    applyPose(dad, talkPose(dp, t, 'dad', 0.4)); }
  // ----- El-Alamy with his tablet -----
  { alamy.root.position.set(G - 1.0, 0, 1.9); alamy.root.rotation.set(0, 0.45, 0); const ap = { ...POSE0, aLx: 1.25, eL: 0.9, aRx: 1.1, eR: 1.0, hx: 0.12 }; if (H === 'alamy') { ap.hx = -0.05; ap.aRz = 0.2; } applyPose(alamy, talkPose(ap, t, 'alamy', 0.25));
    alamy.root.updateMatrixWorld(true); const hp = alamy.arms[0].hand.getWorldPosition(V(0, 0, 0)).lerp(alamy.arms[1].hand.getWorldPosition(V(0, 0, 0)), 0.5); tablet.position.copy(hp).add(V(0, 0.04, 0.05)); tablet.rotation.set(-0.9, 0.45, 0); }
  // ----- El-Gazzar: ear on the car (L06), otherwise by the bench -----
  { const gp = { ...POSE0 }; if (inT(t, Lx(5).t1, Lx(6).t1 + 0.3)) { gazzar.root.position.copy(CAR0).add(V(2.62, 0, 0.1)); gazzar.root.rotation.set(0, -Math.PI / 2, 0); Object.assign(gp, { bend: 0.62, hz: 0.55, hy: 0.25, aLx: 1.0, eL: 0.4, aRx: 0.8, eR: 0.3, lL: 0.15 }); }
    else { gazzar.root.position.set(G + 0.9, 0, 2.2); gazzar.root.rotation.set(0, -0.2, 0); Object.assign(gp, { hz: 0.15, aLz: 0.1 }); }
    applyPose(gazzar, talkPose(gp, t, 'gazzar', 0.15)); }
  // ----- El-Asly: peering into the window, the red button, the punch -----
  { const ap = { ...POSE0 }; asly.root.position.set(CAR0.x + 0.75, 0, CAR0.z + 1.3); asly.root.rotation.set(0, Math.PI, 0); fist.visible = false;
    if (inT(t, Lx(7).t0, Lx(7).t1)) { asly.root.rotation.y = Math.PI - 0.9; ap.aRx = 1.5; ap.eR = 0.1; ap.aRz = -0.4; ap.hx = -0.1; }
    if (inT(t, Lx(7).t1, T_SW)) { asly.root.rotation.y = -2.4; ap.aLz = 0.4; ap.aRz = 0.4; ap.eL = 1.4; ap.eR = 1.4; ap.aLx = 0.6; ap.aRx = 0.6; }
    if (inT(t, T_SW, T_BTN + 0.6)) { const k = seg(t, T_SW, T_SW + 0.45); asly.root.rotation.y = lerp(-2.2, -0.2 + Math.PI, easeInOut(seg(t, T_SW + 0.35, T_BTN))); ap.aRx = k < 1 ? lerp(0.5, 2.6, k) : lerp(2.6, 1.5, easeIn(seg(t, T_SW + 0.45, T_BTN))); ap.eR = k < 1 ? 1.6 : 0.1; ap.bend = 0.3 * seg(t, T_SW + 0.45, T_BTN); ap.twist = -0.4; }
    if (t >= T_BTN + 0.6) { asly.root.rotation.y = Math.PI - 0.3; ap.hx = -0.55; ap.aLz = 0.8; ap.aRz = 0.8; } // stares up
    applyPose(asly, talkPose(ap, t, 'asly', 0.4)); }
  // ----- Abu Samir walks in at the door (L12) -----
  { const on = t >= Lx(11).t1 - 0.3; samir.root.visible = on; const k = easeOut(seg(t, Lx(11).t1 - 0.3, Lx(12).t0 + 0.6)); samir.root.position.set(lerp(G + 8.0, G + 5.2, k), 0, 0.4); samir.root.rotation.set(0, -Math.PI / 2 - 0.3, 0);
    const sp = { ...POSE0, lL: k < 1 ? Math.sin(t * 8) * 0.4 : 0, lR: k < 1 ? -Math.sin(t * 8) * 0.4 : 0, hx: t > Lx(12).t0 + 0.6 ? -0.5 : 0 }; if (H === 'samir') { sp.aLz = 1.2; sp.aRz = 1.2; sp.eL = 0.8; sp.eR = 0.8; } applyPose(samir, talkPose(sp, t, 'samir', 0.3)); }
  // roof debris
  { const a = cold ? -1 : t - T_ROOF; debris.forEach((o, i) => { o.d.visible = a > 0 && a < 2.4; if (o.d.visible) { const tt = a; o.d.position.set(CAR0.x + o.v.x * tt * 0.4, Math.max(0.03, 5 + o.v.y * tt * 0.6 - 4.9 * tt * tt), CAR0.z + o.v.z * tt * 0.4); o.d.rotation.set(tt * 7 + i, tt * 5, 0); } }); }
}
function faceShot(c, dist, side = 0.3, up = 0.02, fov = 40, ld = 0.05) { faceCam(c, dist, side, up, fov, ld); }
function inCar(local, target, fov = 62) { SC.setExterior(false); cam(local.clone().applyMatrix4(SC.body.matrixWorld), target, fov); }
function shotAt(t) {
  SC.setExterior(true); SC.glass.forEach(g => g.visible = true);
  if (t < T_RW + 0.6) { // cold open: from under the roof hole, the car punches out with Bestem screaming
    cam(V(CAR0.x + 1.3, 0.6, CAR0.z + 2.2), car.position.clone().add(V(0, 0.6, 0)), 64); camera.position.add(shake(t, 0.03)); return; }
  if (t < Lx(2).t1 + 0.2) { const k = easeInOut(seg(t, T_RW + 0.6, Lx(2).t1)); cam(VL(V(G - 2.8, 1.7, 3.9), V(G - 1.8, 1.5, 3.3), k), V(G + 3.2, 0.9, -0.8), 58); return; }
  if (t < Lx(3).t1 + 0.15) { faceShot(bastam, 2.6, -0.5, 0.05, 40, 0.12); return; }
  if (t < Lx(4).t1 + 0.15) { faceShot(alamy, 2.8, 0.6, 0.05, 40, 0.2); return; }
  if (t < Lx(5).t1 + 0.15) { faceShot(dad, 2.5, 0.4, 0.02, 40, 0.12); return; }
  if (t < Lx(6).t1 + 0.15) { const hd = headOf(gazzar); cam(hd.clone().add(V(0.4, 0.15, 1.55)), hd.clone().add(V(-0.25, -0.15, -0.1)), 46); return; }
  if (t < Lx(7).t0 + 1.0) { SC.glass.forEach(g => g.visible = false); inCar(V(0.05, 1.12, 0.35), SC.btn.getWorldPosition(V(0, 0, 0)), 50); return; }
  if (t < Lx(7).t1 + 0.15) { faceShot(asly, 2.6, -0.5, 0.05, 42, 0.15); camera.position.add(shake(t, 0.012)); return; }
  if (t < Lx(8).t1 + 0.15) { const hd = headOf(dad); cam(hd.clone().add(V(0.35, -0.45, 1.6)), hd.clone().add(V(0, 0.0, 0)), 44); return; }
  if (t < Lx(9).t1 + 0.15) { faceShot(alamy, 2.4, 0.4, 0.04, 40, 0.15); return; }
  if (t < T_SW) { faceShot(dad, 2.0, -0.3, 0.02, 42, 0.1); camera.position.add(shake(t, 0.015)); return; }
  if (t < T_BTN - 0.25) { cam(V(G + 2.4, 1.5, 4.2), V(G + 1.4, 1.0, 0.2), 56); return; }               // the swing, Ibrahim ducks
  if (t < T_BTN + 0.35) { SC.glass.forEach(g => g.visible = false); const b = SC.btn.getWorldPosition(V(0, 0, 0)); fist.visible = true; fist.position.copy(b).add(V(0.02, 0.06, lerp(0.5, 0.06, easeIn(seg(t, T_BTN - 0.25, T_BTN))))); inCar(V(0.2, 1.2, -0.05), b, 46); camera.position.add(shake(t, t > T_BTN ? 0.02 : 0)); return; }
  if (t < Lx(11).t1 + 0.3) { const a = t - T_BTN; if (a < 0.9) cam(V(CAR0.x + 3.6, 1.0, CAR0.z + 4.6), car.position.clone().add(V(0, 0.8, 0)), 62); else cam(V(CAR0.x + 1.3, 0.6, CAR0.z + 2.2), car.position.clone().add(V(0, 0.6, 0)), 64); camera.position.add(shake(t, 0.04)); return; }
  if (t < Lx(12).t1 + 0.15) { const hd = headOf(samir); cam(hd.clone().add(V(-2.1, -0.15, 0.9)), hd.clone().add(V(0, -0.15, 0)), 44); return; }
  if (t < T_ANNO) { faceShot(dad, 2.3, 0.35, -0.05, 42, 0.0); return; }
  const k = easeInOut(seg(t, T_ANNO, DUR - 2)); cam(V(CAR0.x + 1.0, lerp(1.2, 0.8, k), CAR0.z + 2.4), V(CAR0.x, 5.2, CAR0.z - 0.3), 74);
}
function particles(t) {
  const pf = [], st = [], sw = [];
  if (t < Lx(6).t1 && t > T_RW + 0.6) { const p = V(1.9, 0.95, 0).applyMatrix4(SC.body.matrixWorld); for (let i = 0; i < 4; i++) { const k = (t * 0.6 + i / 4) % 1; pf.push({ pos: p.clone().add(V(k * 0.3, k * 1.4, (hash(i) - .5) * 0.4)), size: 0.25 + k * 0.6, op: 0.45 * (1 - k), color: 0x8a8a8a }); } } // radiator smoke
  if (carState(t).fly) { const base = car.position.clone(); for (let i = 0; i < 8; i++) { const k = (t * 3 + i / 8) % 1; pf.push({ pos: base.clone().add(V((hash(i) - .5) * 1.4, -0.2 - k * 1.1, (hash(i + 4) - .5) * 0.9)), size: 0.25 + k * 0.45, op: 0.75 * (1 - k), color: k < 0.3 ? 0xffa030 : 0xcccccc }); } }
  if (inT(t, T_BTN, T_BTN + 0.7)) { const p = SC.btn.getWorldPosition(V(0, 0, 0)); for (let i = 0; i < 6; i++) { const a = (t - T_BTN) * 3; st.push({ pos: p.clone().add(V(Math.cos(i) * a * 0.3, 0.1 + a * 0.2, Math.sin(i) * a * 0.3)), size: 0.08, color: 0xffe14a }); } }
  if (t >= Lx(13).t0) { const hd = headOf(dad); for (let i = 0; i < 2; i++) { const k = (t * 1.2 + i / 2) % 1; sw.push({ pos: hd.clone().add(V((i - 0.5) * 0.18, 0.08 - k * 0.15, 0.08)), size: 0.05, color: 0xffffff }); } }
  emit(pf, puffPool); emit(st, starPool); emit(sw, sweatPool); emit([], trailPool);
}
// ---------- portrait: a live 3D close-up of the speaker ----------
const PORT = { dad, bastam, alamy, asly, gazzar, samir };
function portrait(g, x, y, who, t, S = 64) {
  g.fillStyle = '#123'; g.fillRect(x, y, S, S);
  const c = PORT[who];
  if (c) {
    const sp = camera.position.clone(), sq = camera.quaternion.clone(), sf = camera.fov, sa = camera.aspect;
    const hd = headOf(c); const f = c.head.getWorldDirection(V(0, 0, 0)); f.y = 0; f.normalize();
    SC.glass.forEach(gl => gl.visible = false);
    camera.position.copy(hd).add(f.multiplyScalar(0.62)).add(V(0, 0.02, 0)); camera.lookAt(hd.clone().add(V(0, -0.03, 0))); camera.fov = 30; camera.aspect = 1; camera.updateProjectionMatrix();
    const px = S; renderer.setScissorTest(true); renderer.setViewport(0, 0, px, px); renderer.setScissor(0, 0, px, px); renderer.render(scene, camera);
    renderer.setScissorTest(false); renderer.setViewport(0, 0, W, H);
    g.drawImage(glCanvas, 0, H - px, px, px, x, y, S, S);
    camera.position.copy(sp); camera.quaternion.copy(sq); camera.fov = sf; camera.aspect = sa; camera.updateProjectionMatrix(); SC.glass.forEach(gl => gl.visible = true);
  }
  g.strokeStyle = '#fff'; g.lineWidth = 2; g.strokeRect(x, y, S, S);
}
function card(g, t, a, b, draw) { if (!inT(t, a, b)) return; const k = easeBack(seg(t, a, a + 0.3)); g.save(); g.translate(W / 2, 250); g.scale(k, k); draw(g); g.restore(); }
function drawCards(g, t) {
  card(g, t, Lx(5).t0 + 1.0, Lx(5).t1 + 0.4, (g) => { g.fillStyle = '#111'; g.fillRect(-150, -70, 300, 140); g.fillStyle = '#fff'; g.fillRect(-143, -63, 286, 126); g.fillStyle = '#000'; g.fillRect(-143, -63, 286, 28);
    pxText(g, 'UBER', -130, -55, 10, '#fff', 'left', false); arText(g, 'تقييم الكابتن', 135, -63, 18, '#fff'); g.font = '30px sans-serif'; g.fillStyle = '#d8231b'; g.textAlign = 'center'; g.direction = 'ltr'; g.fillText('★☆☆☆☆', 0, 20); arText(g, '«الكابتن طيّرني»', 0, 32, 20, '#d8231b', 'center'); });
  card(g, t, Lx(9).t0 + 2.4, Lx(10).t1, (g) => { g.fillStyle = '#ffe14a'; g.fillRect(-160, -70, 320, 140); g.strokeStyle = '#111'; g.lineWidth = 4; g.strokeRect(-156, -66, 312, 132);
    arText(g, 'فاتورة مركز العالمي', 0, -62, 24, '#111', 'center'); arText(g, '٥٠٠٠ جنيه', 0, -18, 44, '#c11', 'center'); pxText(g, 'BILL: 5000 EGP', 0, 50, 9, '#111', 'center', false); });
}
window.renderFrame = function (t) {
  stateAt(t); gtaLipSync(t, PORT); shotAt(t); particles(t);
  renderer.render(scene, camera);
  ctx.clearRect(0, 0, W, H); ctx.drawImage(glCanvas, 0, 0);
  h.clearRect(0, 0, W, H);
  drawHookV(h, t, T_HOOK, T_HOOK + 3.2, 'لما تعمل حادثة بعربية جارك', 'وتوديها المركز من وراه');
  drawRewind(h, t, T_RW, T_HOOK, 'قبلها بساعة...');
  drawCards(h, t);
  drawDialogueV(h, t);
  drawEndV(h, t, T_ANNO + 0.8, 'CAR: AIRBORNE', 'العربية: في الجو', [['BILL', 'الفاتورة: ٥٠٠٠', T_ANNO + 1.8, '#ffe14a'], ['UBER', 'التقييم: نجمة', T_ANNO + 3.0, '#ff5a4a']], DUR);
  ctx.drawImage(hud, 0, 0); vignette(ctx, 0.25);
  if (t >= T_BTN && t < T_BTN + 0.08) { ctx.fillStyle = 'rgba(255,230,160,0.7)'; ctx.fillRect(0, 0, W, H); }
  return true;
};
window.frameData = () => out.toDataURL('image/png');
window.DUR = DUR;
window.GTA_READY().then(() => document.fonts.load('10px PS2P')).then(() => document.fonts.load('20px Lalezar', 'ع')).then(() => document.fonts.load('700 20px ReemKufi', 'ع')).then(() => { lateDraw.forEach(f => f()); window.READY = true; });
