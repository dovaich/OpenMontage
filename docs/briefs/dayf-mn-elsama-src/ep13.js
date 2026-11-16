// =====================================================================
// ضيف من السما — the blackout night on the balcony; Bestem crash-lands
// =====================================================================
room.visible = false; hallway.visible = false; balcony.visible = true;
samir.root.visible = false; skyB.visible = false; streetGlow.visible = false;
scene.fog = null; scene.background = new THREE.Color(0x060a1a);
tvLight.intensity = 0; hallLight.intensity = 0;
const inT = (t, a, b) => t >= a && t < b;
const T_REVEAL = 11.8, T_BIKE = 18.23, T_TWO = 30.9, T_WHISTLE = 32.4, T_CRASH = 38.6, T_OUT = 40.2, T_DOOR = 46.3, T_PLUG = 64.2, T_LIGHTS = 64.5, T_SHUT = 82.2;
function setFace(c, eyes, mouth, opts = {}) { c.faceMat.map = faceTexture(eyes, mouth, opts); c.faceMat.needsUpdate = true; }
function arC(g, s, x, y, size, col, font = 'Lalezar') { g.font = `${size}px ${font}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.direction = 'rtl'; g.fillStyle = col; g.fillText(s, x, y); }

// ---------- the city across the street (lights go out / come back) ----------
const wins = []; const winOn = 0xffd890, winOff = 0x0c1222;
{
  const r = rng(77);
  for (let i = 0; i < 22; i++) {
    const x = -20 + i * 1.9 + (r() - .5), z = 8 + r() * 16, top = -1 + r() * 9, bot = -10, ww = 2.6 + r() * 1.5, hh = top - bot;
    mesh(box(ww, hh, 3), M([0x232838, 0x2a2622, 0x1e2433][i % 3]), x, bot + hh / 2, z, scene);
    for (let yy = bot + 1.2; yy < top - 0.4; yy += 1.3) for (let xx = -ww / 2 + 0.45; xx < ww / 2 - 0.3; xx += 0.75) if (r() > 0.3) { const w = mesh(new THREE.PlaneGeometry(0.4, 0.55), new THREE.MeshBasicMaterial({ color: winOff }), x + xx, yy, z - 1.51, scene); w.rotation.y = Math.PI; wins.push(w); }
  }
  mesh(new THREE.PlaneGeometry(80, 30), M(0x111318), 0, -10, 15, scene).rotation.x = -Math.PI / 2;
}
const lamps = []; for (let i = 0; i < 6; i++) lamps.push(mesh(new THREE.SphereGeometry(0.25, 6, 4), new THREE.MeshBasicMaterial({ color: 0x222222 }), -12 + i * 5, -6, 5.5, scene));
const stars = new THREE.Points(new THREE.BufferGeometry().setFromPoints(Array.from({ length: 260 }, (_, i) => { const a = hash(i) * 6.28, b = 0.15 + hash(i + 7) * 1.2; return V(Math.cos(a) * Math.cos(b) * 70, Math.sin(b) * 70, Math.sin(a) * Math.cos(b) * 70 + 10); })), new THREE.PointsMaterial({ color: 0xffffff, size: 2, sizeAttenuation: false }));
scene.add(stars);
mesh(new THREE.CircleGeometry(3, 14), new THREE.MeshBasicMaterial({ color: 0xf4f0d8 }), -14, 24, 40, scene).rotation.y = Math.PI;
const socket = mesh(box(0.12, 0.16, 0.03), P(0xf0f0f0), 0.9, 0.4, -1.27, balcony);
const tukLight = new THREE.PointLight(0xff8a30, 0, 10, 1.2); scene.add(tukLight);
const doorLight = new THREE.PointLight(0xffd08a, 0, 7, 1.2); doorLight.position.set(1.7, 1.6, -0.6); scene.add(doorLight);

// ---------- the Pedal Generator 3000 (Hamada's bike on a stand) ----------
const BIKE = V(1.35, 0, 0.25);
const bike = new THREE.Group(); bike.position.copy(BIKE); scene.add(bike);
const wheelsB = [];
for (const x of [-0.5, 0.5]) { const w = new THREE.Group(); w.position.set(x, 0.38, 0); bike.add(w); mesh(new THREE.TorusGeometry(0.3, 0.035, 5, 12), M(0x111111), 0, 0, 0, w); for (let k = 0; k < 3; k++) mesh(box(0.56, 0.015, 0.015), M(0xaaaaaa), 0, 0, 0, w).rotation.z = k * Math.PI / 3; wheelsB.push(w); }
const frameM = P(0x1f6fd8, { shininess: 80 });
for (const [x, y, l, rz] of [[0, 0.55, 0.9, 0], [-0.22, 0.48, 0.45, 1.1], [0.25, 0.5, 0.42, -1.0], [-0.45, 0.62, 0.5, 0.25]]) mesh(box(l, 0.04, 0.04), frameM, x, y, 0, bike).rotation.z = rz;
mesh(box(0.2, 0.05, 0.1), M(0x111111), -0.12, 0.82, 0, bike); // seat
mesh(box(0.04, 0.04, 0.45), P(0xcccccc), 0.5, 0.9, 0, bike); mesh(box(0.04, 0.3, 0.04), frameM, 0.48, 0.76, 0, bike);
mesh(box(0.3, 0.14, 0.5), M(0x555555), -0.5, 0.07, 0, bike); // trainer stand
const dynamo = mesh(box(0.14, 0.14, 0.12), P(0xd8231b), -0.5, 0.3, 0.16, bike);
mesh(box(0.5, 0.03, 0.03), P(0xc9ccd1), -0.5, 0.36, 0.18, bike); // duct tape
const crank = new THREE.Group(); crank.position.set(0, 0.36, 0.06); bike.add(crank); mesh(box(0.04, 0.32, 0.02), M(0x333333), 0, 0, 0, crank);
// fan + bulb
const fan = new THREE.Group(); fan.position.set(2.35, 0, -0.55); scene.add(fan);
mesh(cyl(0.18, 0.2, 0.05, 8), M(0x2a8a8a), 0, 0.03, 0, fan); mesh(cyl(0.03, 0.03, 1.1, 6), M(0x2a8a8a), 0, 0.58, 0, fan);
const fanHead = new THREE.Group(); fanHead.position.set(0, 1.18, 0); fanHead.rotation.y = -0.6; fan.add(fanHead);
mesh(new THREE.TorusGeometry(0.26, 0.015, 4, 14), M(0xdddddd), 0, 0, 0.04, fanHead);
const blades = new THREE.Group(); fanHead.add(blades); for (let k = 0; k < 3; k++) { const b = mesh(box(0.08, 0.22, 0.01), M(0x8fd0ff), 0, 0.11, 0, blades); b.position.set(Math.sin(k * 2.09) * 0.11, Math.cos(k * 2.09) * 0.11, 0); b.rotation.z = -k * 2.09; }
const bulbMat = new THREE.MeshBasicMaterial({ color: 0x333322 });
const bulb = mesh(new THREE.SphereGeometry(0.07, 6, 5), bulbMat, 1.35, 2.05, 0.6, scene);
mesh(box(0.01, 0.38, 0.01), M(0x111111), 1.35, 2.26, 0.6, scene);
const bulbLight = new THREE.PointLight(0xfff0b0, 0, 4, 1.4); bulbLight.position.set(1.35, 1.95, 0.6); scene.add(bulbLight);
const wire = new THREE.Line(new THREE.BufferGeometry().setFromPoints([V(1.35 - 0.5, 0.3, 0.41), V(1.6, 0.1, 0.3), V(2.2, 0.2, -0.3), V(2.35, 1.0, -0.55)]), new THREE.LineBasicMaterial({ color: 0x111111 })); scene.add(wire);
// the cover (blanket over the invention)
const cover = mesh(box(1.5, 1.2, 0.7), M(0xb8b0a0), BIKE.x, 0.6, BIKE.z, scene);

// ---------- props ----------
const candle = new THREE.Group(); candle.position.set(0.35, 0, 0.55); scene.add(candle);
mesh(cyl(0.035, 0.035, 0.16, 6), M(0xf4f0e0), 0, 0.08, 0, candle);
const flameMat = new THREE.MeshBasicMaterial({ color: 0xffb030 });
const flame = mesh(new THREE.ConeGeometry(0.025, 0.07, 5), flameMat, 0, 0.2, 0, candle);
const candle2 = new THREE.Group(); scene.add(candle2); // Om Hamada's candle
mesh(cyl(0.03, 0.03, 0.14, 6), M(0xf4f0e0), 0, 0.07, 0, candle2); const flame2 = mesh(new THREE.ConeGeometry(0.025, 0.07, 5), flameMat, 0, 0.18, 0, candle2);
const phone = new THREE.Group(); son.arms[1].hand.add(phone);
mesh(box(0.08, 0.15, 0.012), P(0x222222), 0, 0.02, 0.06, phone); const phoneScr = mesh(new THREE.PlaneGeometry(0.07, 0.12), new THREE.MeshBasicMaterial({ color: 0x9fd0ff }), 0, 0.02, 0.0665, phone);
const plugP = mesh(box(0.05, 0.06, 0.08), P(0xf0f0f0), 0, 0, 0, scene);
const cable = new THREE.Line(new THREE.BufferGeometry().setFromPoints([V(0, 0, 0), V(0, 0, 0), V(0, 0, 0), V(0, 0, 0)]), new THREE.LineBasicMaterial({ color: 0x111111 })); scene.add(cable);
const plates = []; for (let i = 0; i < 3; i++) plates.push(mesh(cyl(0.12, 0.1, 0.03, 10), P(0xffffff), 0, 0, 0, scene));
const laundryBase = laundry.map(c => c.position.clone());

// ---------- Bestem + the tuk-tuk ----------
${BASTAM}
tuk.add(engine6); engine6.position.set(0.9, 0.35, 0); bay.visible = false; engine6.visible = true;
const engGlow = mesh(new THREE.CircleGeometry(0.15, 8), new THREE.MeshBasicMaterial({ color: 0xff6a10 }), 0, 0.04, 0, eng6pan); engGlow.rotation.x = -Math.PI / 2;
const TUK_LAND = V(-1.55, 0, 0.05);
const phoneB = new THREE.Group(); bastam.arms[1].hand.add(phoneB); mesh(box(0.08, 0.15, 0.012), P(0x222222), 0, 0.02, 0.06, phoneB);

// ---------- positions ----------
const SON_MAT = V(-0.25, 0, -0.45), DAD_P = V(0.55, 0, -0.35), MOM_DOOR = V(1.7, 0, -1.7), MOM_P = V(1.45, 0, -0.75);
const BES_P = V(-0.45, 0, 0.55);

function pedal(t) { return inT(t, T_BIKE, 33.6) ? (t < 23.6 ? 9 : 4.5) : 0; }
function charge(t) { return t < T_TWO ? 1 : 2; }

function stateAt(t) {
  // ----- Hamada -----
  let sp, sr = 0;
  if (t < T_BIKE) { son.root.position.copy(SON_MAT); sr = 0.25; sp = { ...POSE0, y: -0.38, lL: 1.45, lR: 1.45, aRx: 1.0, eR: 1.5, aLx: 0.4, eL: 0.8, hx: 0.25 };
    if (inT(t, 14.9, 17.9)) { sp.aLz = 0.9; sp.aRx = 0.4; sp.eR = 0.5; sp.hx = 0; } }
  else if (t < 36.0) { const ph = t * pedal(t); son.root.position.copy(BIKE).add(V(-0.12, 0.08, 0)); sr = Math.PI / 2; sp = { ...POSE0, y: -0.05, bend: 0.35, lL: 1.2 + Math.sin(ph) * 0.45, lR: 1.2 - Math.sin(ph) * 0.45, aLx: 1.2, eL: 0.3, aRx: 1.2, eR: 0.3 };
    if (t >= 23.6) sp.bend = 0.55; if (t >= 33.6) { sp.hx = -0.5; sp.bend = 0; } }
  else if (t < 82.6) { son.root.position.set(t < 77.0 ? 2.1 : 2.55, 0, t < 77.0 ? 0.4 : 0.65); sr = -0.6; sp = { ...POSE0, aLz: 0.2, aRz: 0.2 };
    if (inT(t, T_CRASH - 0.3, 41)) { sp.aLz = 2.4; sp.aRz = 2.4; sp.y = -0.15; }
    if (inT(t, 62.2, 64.4)) { sp.aRx = 0.9; sp.eR = 0.4; } }
  else { son.root.position.set(0.05, 0, -0.75); sr = 0.1; sp = { ...POSE0, y: -0.5, lL: 1.45, lR: 1.45, aLx: 0.7, eL: 1.2, aRx: 0.7, eR: 1.2 }; }
  son.root.rotation.set(0, sr, 0); applyPose(son, sp);
  phone.visible = t < 36.0; phoneScr.material.color.setHex(Math.floor(t * 2) % 2 && t < T_TWO ? 0xff5040 : 0x9fd0ff);
  let se = 'tired', sm = talkMouth(t, 'son') || 'flat';
  if (inT(t, 14.9, 17.9)) se = 'wide'; if (t >= 23.6 && t < 29) se = 'tired'; if (t >= 32.4 && t < 41) { se = 'wide'; if (!talkMouth(t, 'son')) sm = 'o'; }
  if (t >= 64.5 && t < 82.6) { se = 'sparkle'; sm = 'grin'; } if (t >= 82.6) { se = 'flat'; sm = talkMouth(t, 'son') || 'flat'; }
  setFace(son, se, sm, { sweat: t > 23.6 && t < 33 });

  // ----- Ibrahim -----
  let dp = { ...POSE0 }, dr = 0.1; dad.root.position.copy(DAD_P);
  if (inT(t, 8.5, 14.1)) { dr = 0.6; if (t > T_REVEAL - 0.2) { dp.aRx = 1.6; dp.aRz = 0.6; dp.eR = 0.2; dp.aLz = 0.8; } else { dp.aRx = 0.6; dp.eR = 1.2; } }
  if (inT(t, T_BIKE, 33.6)) { dr = 0.8; dp.aLz = 2.3 + Math.sin(t * 8) * 0.3; dp.aRz = 2.3 - Math.sin(t * 8) * 0.3; dp.eL = dp.eR = 0.3; dp.y = Math.abs(Math.sin(t * 8)) * 0.05; }
  if (inT(t, T_TWO, 32.4)) { dp.aLz = 2.6; dp.aRz = 2.6; dp.y = 0.08 * Math.abs(Math.sin(t * 12)); }
  if (t >= T_CRASH - 0.3 && t < 41) { dp.aLz = 2.4; dp.aRz = 2.4; dp.y = -0.12; }
  if (t >= 58.9 && t < 63.5) { dad.root.position.set(0.0, 0, 0.0); dr = -1.4; dp.hx = 0.2; if (t > 60.4) { dp.aRx = 1.4; dp.eR = 0.2; } }
  if (t >= 63.5 && t < 66.8) { const k = easeInOut(seg(t, 63.5, 64.1)); dad.root.position.copy(VL(V(0.0, 0, 0.0), V(0.75, 0, -0.75), k)); dr = lerp(-1.4, Math.PI, k); dp.bend = 0.4 * k; dp.aRx = 0.9; dp.eR = 0.4; dp.y = -0.1 * k; }
  if (inT(t, 66.8, 82.6)) { dad.root.position.set(0.75, 0, -0.35); dr = 0.5; if (inT(t, 71.7, 74.4)) { dp.aLz = 0.5; dp.aLx = 0.4; dp.hz = 0.1; } }
  if (t >= 82.6) { dad.root.position.set(-0.55, 0, -0.75); dr = 0.25; dp = { ...POSE0, y: -0.5, lL: 1.45, lR: 1.45, aLx: 0.7, eL: 1.2, aRx: 0.7, eR: 1.2 }; }
  dad.root.rotation.set(0, dr, 0); applyPose(dad, dp);
  let de = 'smug', dm = talkMouth(t, 'dad', 'grin') || 'smile';
  if (inT(t, T_BIKE, 33.6)) de = 'sparkle'; if (inT(t, 32.4, 41)) { de = 'wide'; if (!talkMouth(t, 'dad')) dm = 'o'; }
  if (inT(t, 44.4, 46.2)) de = 'flat'; if (inT(t, 58.9, 66.8)) de = 'sparkle'; if (t >= 82.6) { de = 'flat'; dm = 'flat'; }
  setFace(dad, de, dm, { stache: true });

  // ----- Om Hamada -----
  const momIn = t >= T_DOOR && t < T_SHUT + 0.4;
  mom.root.visible = momIn;
  if (momIn) { let p, r = 0.2;
    if (t < 47.1) { const k = easeOut(seg(t, T_DOOR, 47.1)); p = VL(MOM_DOOR, MOM_P, k); }
    else if (t < 81.6) p = MOM_P.clone(); else { const k = easeIn(seg(t, 81.6, T_SHUT + 0.4)); p = VL(MOM_P, MOM_DOOR, k); r = lerp(0.2, Math.PI, k); }
    mom.root.position.copy(p); mom.root.rotation.set(0, r, 0);
    const mp = { ...POSE0, aRx: 0.8, eR: 1.3, aRz: 0.1, aLz: 0.15 };
    if (inT(t, 47.1, 52.1)) { mp.aLx = 0.9; mp.eL = 0.2; mp.aLz = 0.3; }
    if (inT(t, 80.3, 81.6)) { mp.aLx = 1.5; mp.eL = 0.1; mp.aLz = 0.6; mp.hy = -0.4; }
    applyPose(mom, mp);
    let me = 'angry', mm = talkMouth(t, 'mom', 'scream') || 'frown';
    if (inT(t, 66.8, 71.4)) { me = 'wide'; mm = talkMouth(t, 'mom') || 'o'; } if (inT(t, 71.7, 75)) me = 'flat'; if (inT(t, 75, 79.2)) me = 'side';
    setFace(mom, me, mm, {});
    candle2.visible = t < T_LIGHTS + 1.5; const hp = mom.arms[1].hand.getWorldPosition(V(0, 0, 0)); candle2.position.copy(hp).add(V(0, 0.02, 0.05)); }
  else candle2.visible = false;

  // ----- Bestem + tuk-tuk -----
  { let p, ry = 0.25, rz = 0;
    if (t < 34.0) { p = V(-30, 40, 40); }
    else if (t < T_CRASH) { const k = seg(t, 34.0, T_CRASH); const e = easeIn(k); p = V(lerp(-18, TUK_LAND.x, e), lerp(7, 0, Math.pow(e, 1.2)), lerp(7, TUK_LAND.z, e)); ry = lerp(0.6, 0.25, e); rz = lerp(0.5, 0.15, e); }
    else { const a = t - T_CRASH; p = TUK_LAND.clone().add(V(0, Math.max(0, Math.sin(a * 9) * 0.25 * Math.exp(-a * 4)), 0)); rz = 0.06; }
    tuk.position.copy(p); tuk.rotation.set(0, ry, rz); wheels.forEach(w => w.rotation.y = t * 10);
    engGlow.material.color.setHex(Math.floor(t * 10) % 2 ? 0xff8a20 : 0xff5a10);
    tukLight.position.copy(tuk.position).add(V(0.5, 1.8, 0.8)); tukLight.intensity = inT(t, 34.0, T_CRASH + 0.5) ? 3.5 * (0.8 + 0.2 * Math.sin(t * 30)) : 0; }
  if (t < T_OUT) { if (bastam.root.parent !== tuk) tuk.add(bastam.root); bastam.root.position.set(-0.3, 0.42, 0); bastam.root.rotation.set(0, -Math.PI / 2, 0);
    const w = Math.sin(t * 10); applyPose(bastam, { ...POSE0, y: -0.4, lL: 1.4, lR: 1.4, aLz: 2.5 + w * 0.3, aRz: 2.5 - w * 0.3, eL: 0.2, eR: 0.2 }); }
  else { if (bastam.root.parent !== scene) scene.add(bastam.root);
    let p = BES_P.clone(), r = 0.3; const bp = { ...POSE0, aLz: 0.3, aRz: 0.3 };
    if (t < 40.9) { const k = easeOut(seg(t, T_OUT, 40.9)); p = VL(TUK_LAND.clone().add(V(0.2, 0.3, 0.5)), BES_P, k); }
    if (t < 46) { bp.hz = Math.sin(t * 3) * 0.2; bp.hx = Math.sin(t * 2.3) * 0.1; }
    if (inT(t, 52.4, 58.5)) { bp.aRx = 0.5 + envAt(t) * 0.6; bp.eR = 0.8; }
    if (inT(t, 75.0, 77.3)) { bp.aLx = 0.5; bp.eL = 1.6; bp.aRx = 0.5; bp.eR = 1.6; bp.hz = 0.15; }
    if (inT(t, 58.5, 66.8)) { p = V(1.1, 0, 0.75); r = -0.2; } else if (inT(t, 66.8, 82.6)) { p = V(-0.15, 0, 0.75); r = 0.2; }
    if (t >= 82.6) { p = V(0.75, 0, -0.65); r = -0.3; Object.assign(bp, { y: -0.5, lL: 1.45, lR: 1.45, aRx: 0.9, eR: 1.6, aLx: 0.7, eL: 1.2, hz: 0 }); }
    bastam.root.position.copy(p); bastam.root.rotation.set(0, r, 0); applyPose(bastam, bp); }
  phoneB.visible = t < T_OUT;
  let be = 'wide', bm = talkMouth(t, 'bastam', 'scream') || 'o';
  if (inT(t, T_OUT, 46)) { be = 'dizzy'; bm = talkMouth(t, 'bastam') || 'wobble'; } if (inT(t, 52.4, 66)) { be = 'default'; bm = talkMouth(t, 'bastam') || 'smile'; }
  if (inT(t, 66, 82.6)) { be = 'sad'; bm = talkMouth(t, 'bastam') || 'smile'; } if (t >= 82.6) { be = 'closed'; bm = (Math.floor(t * 4) % 2) ? 'talk1' : 'closed'; }
  setFace(bastam, be, bm, { fuzz: true });

  // ----- props -----
  cover.visible = t < T_REVEAL + 0.6; if (t >= T_REVEAL) { const a = t - T_REVEAL; cover.position.set(BIKE.x + a * 2.5, 0.6 + a * 3 - 4.9 * a * a * 0.4, BIKE.z + a * 1.5); cover.rotation.set(a * 4, a * 2, a * 3); } else { cover.position.set(BIKE.x, 0.6, BIKE.z); cover.rotation.set(0, 0, 0); }
  { const sp2 = pedal(t); wheelsB.forEach(w => w.rotation.z = -t * sp2 * 1.4); crank.rotation.z = -t * sp2; blades.rotation.z = -t * sp2 * 2.5;
    const lit = sp2 > 0 ? (0.25 + 0.3 * hash(Math.floor(t * 12))) * (t < 23.6 ? 1 : 0.6) : 0; const L = t >= T_LIGHTS ? 1 : lit;
    bulbMat.color.setRGB(0.2 + 0.8 * L, 0.2 + 0.75 * L, 0.13 + 0.5 * L); bulbLight.intensity = L * 2.2; }
  flame.visible = t < T_CRASH; flame.scale.y = 1 + 0.25 * Math.sin(t * 17);
  balcLight.position.copy(t < T_CRASH ? candle.position.clone().add(V(0, 0.4, 0)) : candle2.position.clone().add(V(0, 0.3, 0.2)));
  balcLight.intensity = (t < T_CRASH ? 1.4 : candle2.visible ? 1.3 : 0) * (0.9 + 0.1 * Math.sin(t * 23)); balcLight.distance = 6;
  // laundry blown away by the crash
  laundry.forEach((c, i) => { const a = t - (T_CRASH - 0.15); if (a > 0) { const tt = Math.min(a, 2.5); c.position.copy(laundryBase[i]).add(V((hash(i) - .5) * 4 * tt, 2.5 * tt - 2.5 * tt * tt, 3 * tt)); c.rotation.set(tt * 3 * hash(i + 2), tt * 2, tt * 4 * hash(i + 4)); c.visible = a < 2.5; } else { c.position.copy(laundryBase[i]); c.rotation.set(0, 0, 0); c.visible = true; } });
  { const k = t >= T_CRASH ? 1 : 0; mattress.scale.y = 1 - 0.6 * k; mattress.position.y = 0.07 - 0.04 * k; blanket.position.y = 0.2 - 0.12 * k; pillowB.position.set(-0.85 + k * 0.5, 0.22 - 0.1 * k, -0.95); }
  // cable from the tuk engine to the wall socket
  { const vis = t >= 62.6 && t < 99.5; cable.visible = plugP.visible = vis;
    if (vis) { const e = engine6.getWorldPosition(V(0, 0, 0)).add(V(0, 0.3, 0)); const hp = dad.arms[1].hand.getWorldPosition(V(0, 0, 0)); const sock = socket.getWorldPosition(V(0, 0, 0)).add(V(0, 0, 0.05));
      const pp = VL(hp, sock, easeIn(seg(t, 63.6, T_PLUG))); plugP.position.copy(pp);
      cable.geometry.setFromPoints([e, VL(e, pp, 0.33).add(V(0, -0.35, 0)), VL(e, pp, 0.66).add(V(0, -0.3, 0)), pp]); } }
  // power: door/window, then the city in a wave
  { const on = t >= T_LIGHTS; bDoorGlow.material.color.setHex(on ? 0xffd890 : 0x141828); bWin.material.color.setHex(on && t > T_LIGHTS + 0.2 ? 0xffe0a0 : 0x0e1424); doorLight.intensity = on ? 1.6 : 0;
    wins.forEach(w => { const d = Math.hypot(w.position.x, w.position.z); w.material.color.setHex(t >= T_LIGHTS + 0.5 + d * 0.06 ? winOn : winOff); });
    lamps.forEach((l, i) => l.material.color.setHex(t >= T_LIGHTS + 0.6 + i * 0.15 ? 0xffe8a0 : 0x222222)); }
  // dinner plates on the squashed mattress
  plates.forEach((p, i) => { p.visible = t >= 82.6; p.position.set(-0.55 + i * 0.65, 0.07, -0.25); });
  ambient.intensity = t >= T_LIGHTS ? 0.42 : inT(t, 35.7, T_CRASH) ? 0.9 : 0.22; ambient.color.setHex(0x5060a0); moon.intensity = 0.35;
}

// ---------- shots ----------
function shotAt(t) {
  if (t < 2.2) { const k = easeInOut(seg(t, 0, 2.2)); cam(VL(V(1.2, 3.8, 10), V(0.6, 2.2, 5.5), k), V(0.3, 0.9, -0.5), 50); return; }
  if (t < 8.5) { cam(V(0.1, 1.45, 3.4), V(0.2, 0.75, -0.4), 50); return; }
  if (t < T_REVEAL) { faceCam(dad, 2.2, 0.5, 0.05, 44, 0.2); return; }
  if (t < 14.97) { cam(V(1.2, 1.5, 3.6).add(shake(t, t < T_REVEAL + 0.3 ? 0.05 : 0)), V(1.1, 0.8, -0.1), 50); return; }
  if (t < T_BIKE) { faceCam(son, 2.0, 0.4, 0.05, 44, 0.2); return; }
  if (t < 21.0) { cam(V(0.9, 1.5, 3.7), V(1.05, 0.9, -0.1), 50); return; }
  if (t < 23.6) { const k = easeInOut(seg(t, 21.0, 23.6)); cam(VL(V(1.6, 0.6, 1.7), V(1.4, 1.6, 2.0), k), VL(BIKE.clone().add(V(0, 0.4, 0)), bulb.position, k), 48); return; }
  if (t < 29.38) { faceCam(son, 1.9, 0.5, 0.0, 44, 0.15); return; }
  if (t < 32.4) { faceCam(dad, 2.0, -0.4, 0.05, 44, 0.2); return; }
  if (t < 35.7) { faceCam(son, 1.7, 0.35, -0.45, 50, -0.4); return; }
  if (t < T_CRASH) { const tp = tuk.position.clone().add(V(0, 1, 0)); cam(V(1.8, 1.3, 1.0), tp, lerp(30, 62, easeIn(seg(t, 35.7, T_CRASH)))); return; }
  if (t < 40.6) { cam(V(0.6, 2.2, 5.6).add(shake(t, t < T_CRASH + 0.8 ? 0.28 : 0.02)), V(-0.9, 0.7, -0.1), 54); return; }
  if (t < 44.5) { faceCam(bastam, 2.0, 0.5, 0.05, 44, 0.2); return; }
  if (t < T_DOOR) { faceCam(dad, 2.0, -0.6, 0.05, 44, 0.2); return; }
  if (t < 47.16) { cam(V(1.3, 1.5, 2.6), V(1.6, 1.1, -1.3), 46); return; }
  if (t < 52.48) { faceCam(mom, 2.0, -0.5, 0.05, 44, 0.2); return; }
  if (t < 58.99) { cam(V(-0.2, 1.6, 3.3), V(-0.5, 0.95, 0.0), 50); return; }
  if (t < 63.5) { faceCam(dad, 2.0, 0.5, 0.05, 44, 0.2); return; }
  if (t < T_LIGHTS) { cam(V(1.35, 0.8, -0.35), V(0.85, 0.45, -1.2), 50); return; }
  if (t < 66.84) { const k = easeOut(seg(t, T_LIGHTS, 66.84)); cam(VL(V(0.0, 1.6, 1.15), V(0.0, 1.8, 1.25), k), V(0, 0.0, 16), 60); return; }
  if (t < 71.72) { faceCam(mom, 1.9, -0.5, 0.05, 44, 0.2); return; }
  if (t < 75.06) { faceCam(dad, 1.9, -0.45, 0.05, 44, 0.2); return; }
  if (t < 77.65) { faceCam(bastam, 1.8, 0.4, 0.05, 44, 0.2); return; }
  if (t < 80.3) { faceCam(mom, 2.7, -0.7, 0.05, 46, 0.3); return; }
  if (t < 82.6) { cam(V(0.4, 1.55, 3.5), V(0.6, 0.9, -0.6), 52); return; }
  const k = easeInOut(seg(t, 82.6, 97)); cam(VL(V(0.2, 1.4, 3.2), V(0.2, 3.6, 9.5), k), VL(V(0.0, 0.5, -0.6), V(0, 0.8, -0.8), k), 50);
}

// ---------- particles ----------
function particles(t) {
  const st = [], pf = [], tr = [], sw = [];
  if (t >= 34.0 && t < T_CRASH) { const q = tuk.getWorldQuaternion(new THREE.Quaternion()); const dir = V(1, 0, 0).applyQuaternion(q); const base = engine6.getWorldPosition(V(0, 0, 0)); for (let i = 0; i < 12; i++) { const ph = (t * 3.5 + i / 12) % 1; tr.push({ pos: base.clone().add(dir.clone().multiplyScalar(0.3 + ph * 2.5)).add(V(0, ph * 0.8, 0)), size: 0.4 + ph * 0.6, op: 1 - ph, color: ph < 0.3 ? 0xffa030 : 0xbbbbbb }); } }
  { const a = t - T_CRASH; if (a > 0 && a < 2.0) for (let i = 0; i < 9; i++) { const k = Math.min(1, a * 1.6); pf.push({ pos: TUK_LAND.clone().add(V((hash(i) - .5) * 3.5 * k, 0.3 + hash(i + 1) * 1.6 * k, (hash(i + 2) - .3) * 2.5 * k)), size: 0.3 + k * 0.5, op: 0.8 * (1 - a / 2), color: 0x8a8a90 }); }
    if (a > 0 && a < 0.6) for (let i = 0; i < 10; i++) st.push({ pos: TUK_LAND.clone().add(V(Math.cos(i) * a * 4, 0.5 + Math.sin(i * 2) * a * 2, Math.sin(i) * a * 3)), size: 0.25, color: 0xffe14a }); }
  if (inT(t, T_OUT, 46)) { const h = headOf(bastam); for (let i = 0; i < 4; i++) { const a = t * 4 + i * 1.57; st.push({ pos: h.clone().add(V(Math.cos(a) * 0.35, 0.32, Math.sin(a) * 0.35)), size: 0.12, color: 0xffe14a }); } }
  if (t > 23.6 && t < 33) { const h = headOf(son); for (let i = 0; i < 2; i++) { const k = (t * 1.1 + i * 0.5) % 1; sw.push({ pos: h.clone().add(V((i ? 1 : -1) * 0.28, 0.15 - k * 0.45, 0.05)), size: 0.07, op: 1 - k }); } }
  if (t >= T_PLUG && t < T_PLUG + 0.5) { const s = socket.getWorldPosition(V(0, 0, 0)); for (let i = 0; i < 8; i++) { const k = ((t - T_PLUG) * 4 + i / 8) % 1; st.push({ pos: s.clone().add(V(Math.cos(i * 2.3) * k * 0.4, Math.sin(i * 1.7) * k * 0.3, 0.1 + k * 0.2)), size: 0.1 * (1 - k), color: 0x9fd0ff }); } }
  if (t >= T_BIKE && t < 33.6) { const d = dynamo.getWorldPosition(V(0, 0, 0)); for (let i = 0; i < 3; i++) { const k = (t * 3 + i / 3) % 1; st.push({ pos: d.clone().add(V((hash(i + Math.floor(t * 3)) - .5) * 0.3 * k, 0.1 + k * 0.3, 0.1)), size: 0.06 * (1 - k), color: 0x9fd0ff }); } }
  emit(st, starPool); emit(pf, puffPool); emit(tr, trailPool); emit(sw, sweatPool);
}

// ---------- 2D ----------
function drawTitle(g, t) {
  if (t >= 2.6) return; const a = t < 0.3 ? t / 0.3 : t > 2.1 ? 1 - (t - 2.1) / 0.5 : 1;
  g.save(); g.globalAlpha = Math.max(0, a); g.fillStyle = 'rgba(0,0,20,0.55)'; g.fillRect(0, 150, W, 120);
  arText(g, 'ضيف من السما', W / 2, 152, 64, '#ffe14a', 'center', 'ReemKufi'); pxText(g, 'A GUEST FROM THE SKY', W / 2, 238, 12, '#9fd0ff', 'center'); g.restore();
}
function drawInvention(g, t) {
  if (t < 12.0 || t >= 15.0) return; const k = easeBack(seg(t, 12.0, 12.35)) * (1 - easeIn(seg(t, 14.6, 15.0)));
  g.save(); g.translate(W - 170, 150); g.scale(k, k);
  g.fillStyle = 'rgba(10,10,30,0.92)'; g.fillRect(-150, -90, 300, 180); g.strokeStyle = '#ffe14a'; g.lineWidth = 3; g.strokeRect(-150, -90, 300, 180);
  pxText(g, 'NEW INVENTION!', 0, -80, 11, '#ffe14a', 'center', false); arText(g, 'مولّد البدّال ٣٠٠٠', 0, -62, 30, '#fff', 'center');
  const bar = (y, lbl, n, col) => { pxText(g, lbl, -134, y, 8, '#9fd0ff', 'left', false); for (let i = 0; i < 10; i++) { g.fillStyle = i < n ? col : '#333'; g.fillRect(-30 + i * 17, y - 2, 13, 12); } };
  bar(-4, 'POWER', 1, '#3df05a'); bar(18, 'SWEAT', 10, '#4aa8ff'); bar(40, 'SAFETY', 2, '#ff5a4a'); pxText(g, 'PARTS: BIKE + FAN + TAPE', 0, 64, 7, '#bbb', 'center', false);
  g.restore();
}
function drawBattery(g, t) {
  if (t < T_BIKE || t >= 33.6) return;
  const x = W - 150, y = 60; g.fillStyle = 'rgba(0,0,20,0.75)'; g.fillRect(x, y, 134, 56); g.strokeStyle = '#fff'; g.lineWidth = 2; g.strokeRect(x, y, 134, 56);
  g.strokeStyle = '#fff'; g.strokeRect(x + 10, y + 14, 56, 26); g.fillStyle = '#fff'; g.fillRect(x + 66, y + 22, 5, 10);
  const c = charge(t); g.fillStyle = c < 2 || Math.floor(t * 4) % 2 ? '#ff4a3a' : '#3df05a'; g.fillRect(x + 13, y + 17, 3 * c, 20);
  pxText(g, `${c}%`, x + 82, y + 14, 14, c >= 2 ? '#3df05a' : '#ff5a4a', 'left'); if (Math.floor(t * 2) % 2) pxText(g, 'CHARGING', x + 10, y + 44, 7, '#9fd0ff', 'left', false);
  if (t >= T_TWO && t < T_TWO + 1.4) { const k = easeBack(seg(t, T_TWO, T_TWO + 0.3)); g.save(); g.translate(W / 2, 120); g.scale(k, k); g.fillStyle = 'rgba(0,0,30,0.9)'; g.fillRect(-150, -26, 300, 52); g.strokeStyle = '#ffe14a'; g.lineWidth = 3; g.strokeRect(-150, -26, 300, 52); pxText(g, '+1% CHARGE!', 0, -18, 14, '#ffe14a', 'center'); arText(g, 'إنجاز!', 0, -2, 22, '#fff', 'center'); g.restore(); }
}
function drawWarning(g, t) {
  if (t < 33.6 || t >= T_CRASH) return; if (Math.floor(t * 4) % 2) return;
  g.fillStyle = 'rgba(200,20,20,0.85)'; g.fillRect(0, 60, W, 44); pxText(g, '!! WARNING: INCOMING !!', W / 2, 66, 14, '#fff', 'center'); arText(g, 'حاجة نازلة من السما', W / 2, 78, 20, '#ffe14a', 'center');
}
function drawPower(g, t) {
  if (t < T_LIGHTS + 0.3 || t >= 67.5) return; const k = easeBack(seg(t, T_LIGHTS + 0.3, T_LIGHTS + 0.6));
  g.save(); g.translate(W / 2, 90); g.scale(k, k); g.fillStyle = 'rgba(0,30,0,0.88)'; g.fillRect(-190, -30, 380, 62); g.strokeStyle = '#3df05a'; g.lineWidth = 3; g.strokeRect(-190, -30, 380, 62);
  pxText(g, 'POWER RESTORED', 0, -20, 14, '#3df05a', 'center'); arText(g, 'الكهربا رجعت!', 0, -4, 24, '#fff', 'center'); g.restore();
}
function drawEnd(g, t) {
  if (t >= 83.8 && t < 94.4) {
    const k = easeBack(seg(t, 83.8, 84.2)); g.save(); g.translate(W / 2, 170); g.scale(k, k);
    g.fillStyle = 'rgba(0,0,30,0.92)'; g.fillRect(-230, -110, 460, 220); g.strokeStyle = '#ffe14a'; g.lineWidth = 3; g.strokeRect(-230, -110, 460, 220);
    pxText(g, 'NEW PARTY MEMBER!', 0, -100, 13, '#ffe14a', 'center', false);
    portrait(g, -200, -70, 'bastam', t); arText(g, 'بستم', 100, -76, 40, '#fff', 'center'); pxText(g, 'BESTEM  LV.1', 100, -24, 9, '#9fd0ff', 'center', false);
    if (t > 87.4) { const c = easeOut(seg(t, 87.4, 88.2)); pxText(g, 'BALCONY CAPACITY', -200, 20, 9, '#fff', 'left', false); for (let i = 0; i < 3; i++) { g.fillStyle = i < Math.round(c * 3) ? '#ff5a4a' : '#333'; g.fillRect(40 + i * 40, 16, 32, 18); } pxText(g, `${Math.round(c * 3)}/3`, 180, 20, 9, '#ff5a4a', 'left', false); }
    if (t > 89.6) { pxText(g, 'ELECTRICITY:', -200, 56, 9, '#fff', 'left', false); pxText(g, 'BORROWED', 0, 56, 9, Math.floor(t * 3) % 2 ? '#3df05a' : '#ffe14a', 'left', false); arText(g, 'الكهربا: سُلفة', 120, 70, 20, '#ffe14a', 'center'); }
    g.restore();
  }
  if (t >= 94.4) { const k = easeOut(seg(t, 94.4, 94.8)); g.fillStyle = `rgba(0,0,0,${0.7 * k})`; g.fillRect(0, 0, W, H); g.save(); g.translate(W / 2, 200); g.scale(k, k); arText(g, 'يُتبع...', 0, -40, 54, '#ffe14a', 'center', 'ReemKufi'); pxText(g, 'TO BE CONTINUED', 0, 30, 16, '#fff', 'center'); g.restore(); }
  if (t > 98.6) { g.fillStyle = `rgba(0,0,0,${clamp((t - 98.6) / 0.8)})`; g.fillRect(0, 0, W, H); }
}

// ---------- names + portraits ----------
const NAMES = { son: ['حمادة', 'HAMADA', '#d4141c'], dad: ['إبراهيم', 'IBRAHIM', '#c9a227'], mom: ['أم حمادة', 'OM HAMADA', '#1f9e5a'], bastam: ['بستم', 'BESTEM', '#2f5fb0'] };
function portrait(g, x, y, who, t) {
  g.fillStyle = '#123'; g.fillRect(x, y, 64, 64); g.strokeStyle = '#fff'; g.lineWidth = 2; g.strokeRect(x, y, 64, 64);
  g.save(); g.beginPath(); g.rect(x + 2, y + 2, 60, 60); g.clip();
  const skin = { son: '#b98058', dad: '#b27448', mom: '#c98d5f', bastam: '#b07a50' }[who];
  const shirt = { son: '#d4141c', dad: '#f3f0e3', mom: '#e86a8a', bastam: '#2f5fb0' }[who];
  g.fillStyle = shirt; g.fillRect(x + 8, y + 54, 48, 10);
  if (who === 'mom') { g.fillStyle = '#1f9e5a'; g.beginPath(); g.arc(x + 32, y + 36, 25, 0, 7); g.fill(); }
  g.fillStyle = skin; g.beginPath(); g.arc(x + 32, y + 36, 20, 0, 7); g.fill();
  if (who === 'mom') { g.fillStyle = '#1f9e5a'; g.beginPath(); g.arc(x + 32, y + 30, 22, Math.PI, 0); g.fill(); }
  if (who === 'son') { g.fillStyle = '#17110c'; for (let i = 0; i < 6; i++) { g.beginPath(); g.arc(x + 16 + i * 6.5, y + 19 + (i % 2) * 2, 6, 0, 7); g.fill(); } g.fillStyle = '#222'; g.fillRect(x + 9, y + 30, 6, 12); g.fillRect(x + 49, y + 30, 6, 12); }
  if (who === 'bastam') { g.fillStyle = '#d8231b'; g.beginPath(); g.arc(x + 32, y + 26, 21, Math.PI, 0); g.fill(); }
  if (who === 'dad') { g.fillStyle = '#1b1410'; g.fillRect(x + 10, y + 30, 5, 12); g.fillRect(x + 49, y + 30, 5, 12); g.fillStyle = '#c9a227'; g.fillRect(x + 14, y + 16, 36, 5); }
  const fc = document.createElement('canvas'); fc.width = 32; fc.height = 32; const fg = fc.getContext('2d');
  const e = envAt(t); const mouth = speakerAt(t) === who ? (e < 0.1 ? 'closed' : e < 0.4 ? 'talk1' : 'talk2') : 'closed';
  const eyes = { son: 'tired', dad: 'smug', mom: 'angry', bastam: 'wide' }[who];
  drawFace(fg, 32, eyes, mouth, { stache: who === 'dad', fuzz: who === 'bastam' });
  g.imageSmoothingEnabled = false; g.drawImage(fc, x + 14, y + 20, 36, 36); g.restore();
}

window.renderFrame = function (t) {
  stateAt(t); shotAt(t); particles(t);
  renderer.render(scene, camera);
  ctx.clearRect(0, 0, W, H); ctx.drawImage(glCanvas, 0, 0);
  h.clearRect(0, 0, W, H);
  drawTitle(h, t); drawInvention(h, t); drawBattery(h, t); drawWarning(h, t); drawPower(h, t);
  drawDialogue(h, t); drawEnd(h, t);
  ctx.drawImage(hud, 0, 0); vignette(ctx, 0.35);
  if (t >= T_CRASH && t < T_CRASH + 0.08) { ctx.fillStyle = 'rgba(255,240,200,0.8)'; ctx.fillRect(0, 0, W, H); }
  if (t >= T_LIGHTS && t < T_LIGHTS + 0.06) { ctx.fillStyle = 'rgba(255,240,200,0.5)'; ctx.fillRect(0, 0, W, H); }
  return true;
};
window.frameData = () => out.toDataURL('image/png');
window.DUR = DUR;
document.fonts.load('10px PS2P').then(() => document.fonts.load('20px Lalezar', 'ع')).then(() => document.fonts.load('700 20px ReemKufi', 'ع')).then(() => { window.READY = true; });
