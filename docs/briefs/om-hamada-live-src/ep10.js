
// =====================================================================
// أم حمادة لايف — the kitchen live stream
// =====================================================================
room.visible = false; hallway.visible = false; balcony.visible = false;
const T_SMOKE = 41.0, T_ALARM = 42.8, T_END_LIVE = 44.6, T_ENDC = 53.4;
const K0 = V(60, 0, 0);
const kitchen = new THREE.Group(); kitchen.position.copy(K0); scene.add(kitchen);
// textures
const tileT = canvasTex(32, 32, (g) => { g.fillStyle = '#2fb5b0'; g.fillRect(0, 0, 32, 32); g.fillStyle = '#5fd6cf'; g.fillRect(2, 2, 12, 3); g.fillRect(18, 18, 12, 3); g.fillStyle = '#1d7f7c'; g.fillRect(0, 15, 32, 2); g.fillRect(15, 0, 2, 32); g.fillStyle = '#e8f2ee'; g.fillRect(13, 13, 2, 2); }, [8, 3]);
const kfloorT = canvasTex(16, 16, (g) => { g.fillStyle = '#d9c9a3'; g.fillRect(0, 0, 16, 16); g.fillStyle = '#8a5a3c'; g.fillRect(0, 0, 8, 8); g.fillRect(8, 8, 8, 8); }, [8, 6]);
const kwall = (w, h, x, y, z, ry, mat) => { const m = mesh(new THREE.PlaneGeometry(w, h), mat, x, y, z, kitchen); m.rotation.y = ry; return m; };
const tileM = M(0xffffff, { map: tileT });
kwall(8, 3.2, 0, 1.6, -3, 0, tileM); kwall(6, 3.2, -4, 1.6, 0, Math.PI / 2, tileM);
kwall(2.2, 3.2, 4, 1.6, -1.9, -Math.PI / 2, tileM); kwall(2.6, 3.2, 4, 1.6, 1.7, -Math.PI / 2, tileM); kwall(1.2, 1.0, 4, 2.7, -0.2, -Math.PI / 2, tileM);
const kdoorGlow = kwall(1.2, 2.2, 4.2, 1.1, -0.2, -Math.PI / 2, new THREE.MeshBasicMaterial({ color: 0xffd8a0 }));
const kf = mesh(new THREE.PlaneGeometry(8, 6), M(0xffffff, { map: kfloorT }), 0, 0, 0, kitchen); kf.rotation.x = -Math.PI / 2;
const kc = mesh(new THREE.PlaneGeometry(8, 6), M(0xe8e4d0), 0, 3.2, 0, kitchen); kc.rotation.x = Math.PI / 2;
// counter, stove, sink, fridge, window, tube light, smoke alarm
mesh(box(5.6, 0.92, 0.7), M(0x6f9f4f, { map: woodTex }), 0.4, 0.46, -2.62, kitchen); mesh(box(5.7, 0.08, 0.75), M(0xd8d2c0), 0.4, 0.96, -2.6, kitchen);
const stove = new THREE.Group(); stove.position.set(1.2, 1.0, -2.6); kitchen.add(stove);
mesh(box(0.9, 0.12, 0.6), P(0xf0f0ea), 0, 0.06, 0, stove);
for (const sx of [-0.22, 0.22]) { const r = mesh(new THREE.TorusGeometry(0.12, 0.03, 4, 8), M(0x222222), sx, 0.14, 0, stove); r.rotation.x = Math.PI / 2; }
const flame = mesh(new THREE.ConeGeometry(0.1, 0.12, 8, 1, true), new THREE.MeshBasicMaterial({ color: 0x3f7fff, transparent: true, opacity: 0.8, side: THREE.DoubleSide }), -0.22, 0.2, 0, stove);
const pot = new THREE.Group(); pot.position.set(-0.22, 0.14, 0); stove.add(pot);
const potM = P(0xc8ced6, { shininess: 110, specular: 0xffffff });
mesh(cyl(0.26, 0.24, 0.36, 12), potM, 0, 0.18, 0, pot); for (const s of [-1, 1]) mesh(box(0.1, 0.04, 0.05), M(0x222222), s * 0.3, 0.3, 0, pot);
const potLid = mesh(cyl(0.27, 0.27, 0.03, 12), potM, 0, 0.38, 0, pot); mesh(new THREE.SphereGeometry(0.04, 6, 4), M(0x222222), 0, 0.42, 0, pot);
mesh(new THREE.PlaneGeometry(1.2, 0.9), new THREE.MeshBasicMaterial({ map: canvasTex(32, 24, (g) => { const gr = g.createLinearGradient(0, 0, 0, 24); gr.addColorStop(0, '#9cc8ff'); gr.addColorStop(1, '#ffe0b0'); g.fillStyle = gr; g.fillRect(0, 0, 32, 24); g.fillStyle = '#b48a6a'; for (let x = 0; x < 32; x += 5) g.fillRect(x, 14 + (x % 3) * 2, 4, 10); }) }), -1.2, 1.9, -2.99, kitchen);
for (const [x, y, w, h] of [[-1.2, 2.38, 1.3, 0.07], [-1.2, 1.42, 1.3, 0.07], [-1.86, 1.9, 0.07, 1.0], [-0.54, 1.9, 0.07, 1.0]]) mesh(box(w, h, 0.06), M(0x7a4a22), x, y, -2.97, kitchen);
mesh(box(1.0, 0.1, 0.55), P(0xf4f4f0), -1.2, 1.02, -2.6, kitchen); // sink
const fridge = new THREE.Group(); fridge.position.set(-3.45, 0, -2.4); kitchen.add(fridge);
mesh(box(0.9, 2.0, 0.85), P(0xf2e6c4), 0, 1.0, 0, fridge); { const r = rng(11); for (let i = 0; i < 9; i++) mesh(box(0.12, 0.1, 0.02), M([0xff3355, 0x33aaff, 0xffdd22, 0x44cc66][i % 4]), -0.3 + r() * 0.6, 0.8 + r() * 1.0, 0.43, fridge); }
mesh(box(1.4, 0.05, 0.1), M(0xdddddd), 0, 3.15, -0.8, kitchen); mesh(cyl(0.04, 0.04, 1.3, 6), new THREE.MeshBasicMaterial({ color: 0xe8fff0 }), 0, 3.08, -0.8, kitchen).rotation.z = Math.PI / 2;
const alarmLed = mesh(new THREE.SphereGeometry(0.03, 5, 4), new THREE.MeshBasicMaterial({ color: 0x330000 }), 1.2, 3.14, -1.2, kitchen); mesh(cyl(0.12, 0.12, 0.05, 10), M(0xf4f4f4), 1.2, 3.17, -1.2, kitchen);
// tray of cabbage rolls + cabbage head on the counter
const tray = new THREE.Group(); tray.position.set(0.0, 1.0, -2.55); kitchen.add(tray);
mesh(cyl(0.3, 0.3, 0.03, 12), P(0xc0c4cc), 0, 0, 0, tray);
for (let i = 0; i < 12; i++) { const r = mesh(cyl(0.035, 0.035, 0.12, 6), M(0x8fbf4f), -0.2 + (i % 4) * 0.13, 0.04, -0.12 + Math.floor(i / 4) * 0.12, tray); r.rotation.z = Math.PI / 2; }
mesh(new THREE.IcosahedronGeometry(0.2, 1), M(0x9fcf6f), 0.55, 1.18, -2.6, kitchen);
const kLight = new THREE.PointLight(0xfff4e0, 0, 9, 1.1); kLight.position.set(60, 2.8, -0.6); scene.add(kLight);
const sun = new THREE.DirectionalLight(0xffe2b0, 1.2); sun.position.set(54, 6, -6); sun.target.position.set(60, 0, 0); scene.add(sun); scene.add(sun.target);
const redFlash = new THREE.PointLight(0xff2020, 0, 8, 1.2); redFlash.position.set(61.2, 2.8, -1.2); scene.add(redFlash);
// the phone (in Om Hamada's right hand, selfie mode)
const phone = new THREE.Group(); scene.add(phone);
mesh(box(0.09, 0.17, 0.015), P(0x1a1a22), 0, 0, 0, phone); mesh(new THREE.PlaneGeometry(0.08, 0.15), new THREE.MeshBasicMaterial({ color: 0xff3355 }), 0, 0, -0.009, phone).rotation.y = Math.PI;
const burnt = mesh(cyl(0.22, 0.22, 0.05, 10), M(0x111111), 0, 0.37, 0, pot); burnt.visible = false;

// =====================================================================
const KEYS = {};
const SELFIE = { aRx: 1.55, aRz: 0.35, eR: 0.15, aLz: 0.95, eL: 1.9 };
KEYS.mom = [
  [0, { ...SELFIE, hz: 0.1 }],
  [3.5, { ...SELFIE, aLz: 2.4, eL: 0.4, hz: -0.1 }, 0.2],
  [6.5, { ...SELFIE }, 0.2],
  [8.6, { ...SELFIE, hz: 0.15, hx: -0.05 }],
  [14.4, { aRx: 1.55, aRz: 0.9, eR: 0.15, aLz: 0.95, eL: 1.9, twist: -0.5, hy: -0.4 }, 0.3],
  [18.4, { ...SELFIE }, 0.3],
  [25.4, { ...SELFIE, hx: 0.1 }, 0.1],
  [33.15, { ...SELFIE, aRx: 1.3, eR: 0.9, hx: 0.25, bend: 0.1 }, 0.25],
  [39.85, { ...SELFIE, aLx: 1.6, eL: 0.1, aLz: 0.6, hx: -0.05 }, 0.12],
  [T_ALARM, { aLz: 2.5, aRz: 2.5, eL: 0.3, eR: 0.3, hx: -0.4, hy: 0.5 }, 0.12],
];
KEYS.son = [
  [0, { aLz: 0.2, aRz: 0.2 }],
  [6.85, { aLz: 0.9, eL: 1.9, aRx: 1.3, aRz: 0.4, eR: 0.9, hx: 0.05 }, 0.15],
  [12.2, { aLx: 1.6, eL: 2.3, aRx: 1.6, eR: 2.3, aLz: 0.4, aRz: 0.4, hx: 0.1 }, 0.12],
  [14.4, { aLx: 1.8, eL: 2.6, aRx: 1.8, eR: 2.6, aLz: 0.2, aRz: 0.2, hx: 0.2, bend: 0.1 }, 0.15],
  [18.4, { aRx: 1.4, eR: 1.4, aRz: 0.2, aLz: 0.9, eL: 1.9, hx: 0.25 }, 0.2],
  [T_ALARM, { aLx: 1.8, eL: 2.6, aRx: 1.8, eR: 2.6, aLz: 0.2, aRz: 0.2, hx: 0.2 }, 0.15],
];
KEYS.dad = [
  [0, { aLz: 0.3, aRz: 0.3 }],
  [22.2, { aLx: 1.4, eL: 1.7, aLz: 0.6, aRz: 0.3, hx: -0.1 }, 0.15],
  [25.4, { aLz: 0.2, aRz: 0.2, hx: 0.05 }, 0.2],
  [27.85, { aLz: 2.3, aRz: 2.3, eL: 0.4, eR: 0.4, hx: -0.15 }, 0.12],
  [30.0, { aLz: 1.5, aRz: 1.5, eL: 2.4, eR: 2.4, aLx: 0.3, aRx: 0.3, hx: -0.1, bend: -0.1 }, 0.15],
  [33.15, { aLz: 0.95, eL: 1.9, aRz: 0.95, eR: 1.9, hy: 0.4 }, 0.2],
  [37.9, { aLz: 1.5, aRz: 1.5, eL: 2.4, eR: 2.4, aLx: 0.3, aRx: 0.3, hx: -0.15, y: 0.06 }, 0.1],
  [39.85, { aLz: 0.3, aRz: 0.3, bend: 0.2, hx: 0.3 }, 0.3],
  [T_ALARM, { aLz: 2.5, aRz: 2.5, eL: 0.3, eR: 0.3, hx: -0.3, hy: -0.5 }, 0.12],
];
const MOM_P = V(60.3, 0, -0.6), SON_P = V(62.6, 0, 0.6), DAD_DOOR = V(64.4, 0, -0.2), DAD_P = V(61.2, 0, 0.0);
const isPOV = t => (t >= 1.0 && t < 6.5) || (t >= 8.6 && t < 12.2) || (t >= 14.4 && t < 18.4) || (t >= 25.4 && t < 27.6) || (t >= 27.85 && t < 37.9) || (t >= 39.85 && t < 42.8);

function stateAt(t) {
  scene.background = new THREE.Color(0x101010); scene.fog = null;
  ambient.color.setHex(0xfff0e0); ambient.intensity = 0.85; moon.intensity = 0; tvLight.intensity = 0; hallLight.intensity = 0; balcLight.intensity = 0;
  kLight.intensity = 4; redFlash.intensity = t >= T_ALARM ? (Math.floor(t * 4) % 2 ? 5 : 0) : 0;
  alarmLed.material.color.setHex(t >= T_ALARM && Math.floor(t * 4) % 2 ? 0xff2020 : 0x330000);
  flame.visible = t < T_END_LIVE + 2; flame.scale.y = 1 + 0.2 * Math.sin(t * 20);
  potLid.position.y = 0.38 + (t >= T_SMOKE ? Math.abs(Math.sin(t * 25)) * 0.03 : 0);
  burnt.visible = t >= T_END_LIVE + 1.5; if (burnt.visible) { potLid.position.set(0.35, 0.05, 0.25); potLid.rotation.z = 1.2; } else { potLid.position.x = 0; potLid.position.z = 0; potLid.rotation.z = 0; }
  // characters
  dad.afro.visible = false; dad.extras.setGoggles(false); samir.root.visible = false; cane.visible = false;
  mom.root.position.copy(MOM_P); mom.root.rotation.set(0, 0.25, 0);
  if (t >= 14.4 && t < 18.4) mom.root.rotation.y = 0.6;
  if (t >= T_ALARM) mom.root.rotation.y = -0.4;
  applyPose(mom, poseAt(t, KEYS.mom));
  { const hd = mom.arms[1].hand; hd.updateWorldMatrix(true, false); phone.position.copy(hd.getWorldPosition(V(0, 0, 0))).add(V(0, 0.06, 0)); const f = mom.head.getWorldPosition(V(0, 0, 0)); phone.lookAt(f); phone.visible = t < T_ALARM + 0.5; }
  son.root.visible = t >= 6.6; son.root.position.copy(SON_P); son.root.rotation.set(0, -1.9, 0);
  if (t >= 6.6 && t < 7.4) son.root.position.x = lerp(64.3, SON_P.x, easeOut(seg(t, 6.6, 7.4)));
  if (t >= 14.4 && t < 18.4) { son.root.position.set(61.5, 0, 0.9); son.root.rotation.y = -2.6; }
  if (t >= 18.4) { son.root.position.set(59.3, 0, 0.2); son.root.rotation.y = 0.6; }
  const sz = poseAt(t, KEYS.son); if (t >= 6.6 && t < 7.4) { const w = Math.sin(t * 8); sz.lL = w * 0.4; sz.lR = -w * 0.4; }
  applyPose(son, sz);
  dad.root.visible = t >= 22.0;
  { const k = easeInOut(seg(t, 22.2, 24.6)); dad.root.position.copy(VL(DAD_DOOR, V(62.0, 0, -0.5), k)); dad.root.rotation.set(0, lerp(-Math.PI / 2, -0.9, k), 0); }
  if (t >= 27.85) { const k = easeOut(seg(t, 27.85, 28.4)); dad.root.position.copy(VL(V(62.0, 0, -0.5), DAD_P.clone().add(V(0.1, 0, -0.35)), k)); dad.root.rotation.y = lerp(-0.9, -0.2, k); }
  if (t >= 39.85) { const k = easeInOut(seg(t, 40.4, 42.6)); dad.root.position.copy(VL(DAD_P.clone().add(V(0.1, 0, -0.35)), V(63.6, 0, -0.2), k)); dad.root.rotation.y = lerp(-0.2, -Math.PI / 2 + 0.3, seg(t, 40.4, 40.8)); }
  if (t >= T_ALARM) { dad.root.position.set(62.6, 0, -0.4); dad.root.rotation.y = -1.2; }
  const dz = poseAt(t, KEYS.dad); if ((t >= 22.2 && t < 24.6) || (t >= 40.4 && t < 42.6)) { const w = Math.sin(t * 7); dz.lL = w * 0.4; dz.lR = -w * 0.4; }
  if (t >= 30.0 && t < 33.0) { dz.eL += Math.sin(t * 10) * 0.2; dz.eR -= Math.sin(t * 10) * 0.2; }
  applyPose(dad, dz);
  // particles: steam -> smoke
  const smoke = [];
  const pw = pot.getWorldPosition(V(0, 0, 0)).add(V(0, 0.45, 0));
  for (let i = 0; i < 16; i++) { const ph = (t * (t >= T_SMOKE ? 0.9 : 0.4) + i / 16) % 1; const black = t >= T_SMOKE; const big = t >= T_ALARM ? 2.2 : black ? 1.3 : 0.6; smoke.push({ pos: pw.clone().add(V((hash(i) - .5) * 0.3 * ph * big, ph * 1.6 * big, (hash(i + 3) - .5) * 0.3 * ph * big)), size: (0.1 + ph * 0.4) * big, op: (1 - ph) * (black ? 0.85 : 0.4), color: black ? (t >= T_ALARM ? 0x2a2a2a : 0x555555) : 0xf2f2f2 }); }
  if (t >= T_ALARM) for (let i = 0; i < 14; i++) smoke.push({ pos: V(57 + i * 0.5 + Math.sin(t + i) * 0.3, 2.9 - hash(i) * 0.4, -2.2 + hash(i + 9) * 2.4), size: 1.0 + hash(i + 2) * 0.5, op: 0.6 * seg(t, T_ALARM, T_ALARM + 1.5), color: 0x333333 });
  emit(smoke, puffPool);
  const sweat = [];
  if (t >= 12.2 && t < 21.3) { const hd = son.head.getWorldPosition(V(0, 0, 0)); for (let i = 0; i < 4; i++) { const k = (t * 1.3 + i * 0.25) % 1; sweat.push({ pos: hd.clone().add(V((i % 2 ? 1 : -1) * 0.27, 0.18 - k * 0.5, 0)), size: 0.07, op: 1 - k }); } }
  emit(sweat, sweatPool);
  const stars = [];
  if (t >= 37.9 && t < 39.6) { const hd = dad.head.getWorldPosition(V(0, 0, 0)); for (let i = 0; i < 6; i++) { const a = t * 3 + i; stars.push({ pos: hd.clone().add(V(Math.cos(a) * 0.5, 0.3 + Math.sin(a) * 0.15, Math.sin(a) * 0.5)), size: 0.12, rot: a }); } }
  emit(stars, starPool); emit([], trailPool);
  // faces
  let me = 'sparkle', mm = talkMouth(t, 'mom') || 'grin';
  if (t >= 6.85 && t < 8.6) { me = 'side'; mm = 'smile'; }
  if (t >= 25.4 && t < 27.6) { me = 'pin'; if (mm === 'grin') mm = 'fakegrin'; else if (mm !== 'closed') mm = mm; }
  if (t >= 27.6 && t < 33.15) { me = 'flat'; mm = 'fakegrin'; }
  if (t >= 33.15 && t < 37.9) { me = 'wide'; if (mm === 'grin') mm = 'o'; }
  if (t >= 37.9 && t < 39.85) { me = 'flat'; mm = 'flat'; }
  if (t >= 39.85 && t < T_ALARM) { me = 'angry'; if (mm === 'grin') mm = 'clench'; }
  if (t >= T_ALARM) { me = 'pin'; mm = 'scream'; }
  let se = 'tired', sm = talkMouth(t, 'son', 'scream') || 'o';
  if (t >= 12.2 && t < 21.3) se = 'pin';
  if (t >= 18.4 && t < 21.3) { se = 'wide'; }
  if (t >= 21.3) { se = 'flat'; sm = 'flat'; }
  if (t >= T_ALARM) { se = 'pin'; sm = 'o'; }
  let de = 'normal', dm = talkMouth(t, 'dad', 'scream') || 'closed';
  if (t >= 25.4 && t < 27.85) { de = 'pin'; dm = 'o'; }
  if (t >= 27.85 && t < 33.15) { de = 'sparkle'; if (dm === 'closed') dm = 'grin'; }
  if (t >= 33.15 && t < 37.9) { de = 'sparkle'; dm = 'grin'; }
  if (t >= 37.9 && t < 39.85) { de = 'sparkle'; if (dm === 'closed') dm = 'grin'; }
  if (t >= 39.85 && t < T_ALARM) { de = 'sad'; dm = 'frown'; }
  if (t >= T_ALARM) { de = 'pin'; dm = 'o'; }
  mom.faceMat.map = faceTexture(me, mm, {}); mom.faceMat.needsUpdate = true;
  son.faceMat.map = faceTexture(se, sm, { fuzz: true }); son.faceMat.needsUpdate = true;
  dad.faceMat.map = faceTexture(de, dm, { stache: true }); dad.faceMat.needsUpdate = true;
}

function povCam(t, targetFn) {
  // selfie at arm's length: in front of Om Hamada's face, slightly to the right and above, aimed at whoever is on stream
  const hd = mom.head.getWorldPosition(V(0, 0, 0)); const f = mom.root.getWorldDirection(V(0, 0, 0)); f.y = 0; f.normalize(); const r = V(f.z, 0, -f.x);
  const p = hd.clone().add(f.multiplyScalar(0.95)).add(r.multiplyScalar(-0.12)).add(V(0, 0.08, 0));
  cam(p.add(V(noise1(t * 2) * 0.01, noise1(t * 2.3) * 0.01, 0)), targetFn(), 60, noise1(t * 1.5) * 0.03);
}
function cameraAt(t) {
  const momFace = () => mom.head.getWorldPosition(V(0, 0, 0)).add(V(0, -0.05, 0));
  if (t < 1.0) { cam(V(63.3, 2.0, 2.6), V(60.4, 1.1, -1.6), 56); }
  else if (t < 6.5) { povCam(t, momFace); }
  else if (t < 8.6) { faceCam(son, 1.6, 0.4, 0.05, 50, 0.1); }
  else if (t < 12.2) { povCam(t, momFace); }
  else if (t < 14.4) { faceCam(son, 1.2, -0.3, 0.05, 46, 0.1); }
  else if (t < 18.4) { const sh = son.head.getWorldPosition(V(0, 0, 0)); const hd = mom.head.getWorldPosition(V(0, 0, 0)); cam(VL(hd, sh, 0.35).add(V(0, 0.05, 0)), sh.clone().add(V(0, -0.12, 0)), 58, noise1(t * 1.5) * 0.03); }
  else if (t < 21.3) { faceCam(son, 1.2, 0.3, 0.05, 46, 0.1); }
  else if (t < 22.2) { cam(V(60.8, 1.5, 1.8), V(60.3, 1.4, -0.6), 52); }
  else if (t < 25.4) { cam(V(59.2, 1.6, 1.6), VL(V(64.2, 1.5, -0.2), V(62.0, 1.5, -0.5), easeInOut(seg(t, 22.2, 24.6))), 54); }
  else if (t < 37.9) { povCam(t, () => { const m = momFace(); if (t < 27.85) return m; const d = dad.head.getWorldPosition(V(0, 0, 0)); return VL(m, d, t < 33.15 ? 0.55 : 0.3); }); }
  else if (t < 39.85) { faceCam(dad, 1.6, 0.3, 0.0, 50, 0.1); }
  else if (t < T_ALARM) { povCam(t, momFace); }
  else if (t < T_END_LIVE) { cam(V(59.0, 1.7, 2.2).add(shake(t, 0.03, 20)), V(61.0, 1.3, -1.8), 58); }
  else { const k = easeInOut(seg(t, T_END_LIVE, 55.5)); cam(VL(V(59.4, 1.8, 2.4), V(58.8, 2.4, 3.4), k), V(61.0, 1.0, -1.6), 56); }
}

// =====================================================================
const NAMES = { mom: ['أم حمادة', 'OM HAMADA', '#1f9e5a'], son: ['حمادة', 'HAMADA', '#d4141c'], dad: ['إبراهيم', 'IBRAHIM', '#c9a227'] };
function portrait(g, x, y, who, t) {
  g.fillStyle = '#123'; g.fillRect(x, y, 64, 64); g.strokeStyle = '#fff'; g.lineWidth = 2; g.strokeRect(x, y, 64, 64);
  g.save(); g.beginPath(); g.rect(x + 2, y + 2, 60, 60); g.clip();
  if (who === 'mom') { g.fillStyle = '#1f9e5a'; g.beginPath(); g.arc(x + 32, y + 34, 27, 0, 7); g.fill(); g.fillStyle = '#c98d5f'; g.beginPath(); g.arc(x + 32, y + 38, 19, 0, 7); g.fill(); g.fillStyle = '#ec86ad'; g.fillRect(x + 6, y + 58, 52, 6); }
  else if (who === 'son') { g.fillStyle = '#d4141c'; g.fillRect(x + 8, y + 54, 48, 10); g.fillStyle = '#b98058'; g.beginPath(); g.arc(x + 32, y + 36, 19, 0, 7); g.fill(); g.fillStyle = '#17110c'; for (let i = 0; i < 7; i++) { g.beginPath(); g.arc(x + 14 + i * 6, y + 18 + (i % 2) * 3, 7, 0, 7); g.fill(); } }
  else { g.fillStyle = '#f3f0e3'; g.fillRect(x + 10, y + 54, 44, 10); g.fillStyle = '#b27448'; g.beginPath(); g.arc(x + 32, y + 36, 20, 0, 7); g.fill(); g.fillStyle = '#1b1410'; g.fillRect(x + 10, y + 30, 5, 12); g.fillRect(x + 49, y + 30, 5, 12); g.fillStyle = '#c9a227'; g.fillRect(x + 14, y + 16, 36, 5); }
  const fc = document.createElement('canvas'); fc.width = 32; fc.height = 32; const fg = fc.getContext('2d');
  const e = envAt(t); const mouth = speakerAt(t) === who ? (e < 0.1 ? 'closed' : e < 0.4 ? 'talk1' : 'talk2') : 'closed';
  const eyes = who === 'mom' ? (t > 39.8 ? 'angry' : 'sparkle') : who === 'son' ? 'pin' : 'sparkle';
  drawFace(fg, 32, eyes, mouth, { stache: who === 'dad', fuzz: who === 'son' });
  g.imageSmoothingEnabled = false; g.drawImage(fc, x + 14, y + 20, 36, 36); g.restore();
}
function viewers(t) {
  const keys = [[0, 3], [14.4, 3], [16.0, 15], [18.0, 120], [19.6, 1001], [22.0, 1450], [25.4, 3200], [28.5, 15000], [31.5, 80000], [34.0, 250000], [38.4, 600000], [T_END_LIVE, 1000000]];
  for (let i = 1; i < keys.length; i++) if (t < keys[i][0]) { const [a, va] = keys[i - 1], [b, vb] = keys[i]; return Math.round(va + (vb - va) * easeInOut(seg(t, a, b))); }
  return 1000000;
}
function fmtV(n) { if (n >= 1e6) return '1M'; if (n >= 1e4) return (n / 1000).toFixed(0) + 'K'; if (n >= 1000) return (n / 1000).toFixed(1) + 'K'; return String(n); }
const COMMENTS = [
  [2.4, 'سارة', 'تسلم إيدك يا طنط'], [9.6, 'أم حمادة', 'أنا الواحد ده'], [15.4, 'كريم', 'حمادة صاحي الساعة ٢ ههههه'], [16.6, 'مازن', 'حمادة!! مش قلت إنك عيان؟'],
  [19.0, 'منة', 'حمادة طلع نايم ههههه'], [20.2, 'زياد', 'الحقوا اللايف'], [21.0, 'نور', 'حمادة تريند'],
  [24.4, 'عم سيد البواب', 'الفانلة عندي في الغسيل'], [29.0, 'أبو سمير', 'اقفلوا الواي فاي بتاعي'], [30.4, 'حودة', 'المخترع العالمي هههه'],
  [33.4, 'هبة', 'فين الفانلة الحمرا؟'], [34.2, 'علي', 'فين الفانلة الحمرا؟'], [35.0, 'يوسف', 'فين الفانلة الحمرا؟'], [36.0, 'شيماء', '#الفانلة_الحمرا'],
  [38.5, 'المعلم شحتة', 'إبراهيم ملك التريند'], [40.9, 'طنط سعاد', 'المحشي بيتحرق يا حبيبتي!'], [42.2, 'سارة', 'ريحة شياط!!'],
];
function drawLiveUI(g, t) {
  if (t < 1.0 || t >= T_END_LIVE) return;
  const pov = isPOV(t);
  // LIVE badge + viewers
  g.fillStyle = '#e8183a'; g.fillRect(14, 14, 62, 26); pxText(g, 'LIVE', 22, 21, 10, '#fff', 'left', false);
  g.fillStyle = 'rgba(0,0,0,0.55)'; g.fillRect(80, 14, 104, 26); g.fillStyle = '#fff'; g.beginPath(); g.arc(94, 27, 5, 0, 7); g.fill();
  pxText(g, fmtV(viewers(t)), 106, 21, 10, '#fff', 'left', false);
  const jump = [[19.6, '+1000'], [28.5, '+15K'], [34.0, '+250K']].find(([a]) => t >= a && t < a + 1.0);
  if (jump) { const k = seg(t, jump[0], jump[0] + 1.0); g.globalAlpha = 1 - k; pxText(g, jump[1], 190, 21 - k * 20, 10, '#3df05a', 'left'); g.globalAlpha = 1; }
  if (!pov) return;
  // phone-style frame
  g.strokeStyle = 'rgba(255,255,255,0.35)'; g.lineWidth = 2; g.strokeRect(6, 6, W - 12, H - 12);
  // comments (bottom-left, above the dialogue box)
  const shown = COMMENTS.filter(c => t >= c[0] && t < c[0] + 5.5).slice(-4);
  shown.forEach(([t0, who, txt], i) => {
    const y = 296 - (shown.length - 1 - i) * 34; const k = easeOut(seg(t, t0, t0 + 0.25));
    g.globalAlpha = k * (t > t0 + 5.0 ? 1 - seg(t, t0 + 5.0, t0 + 5.5) : 1);
    g.font = '15px Lalezar'; g.direction = 'rtl'; const w = Math.min(330, g.measureText(who + ': ' + txt).width + 24);
    g.fillStyle = 'rgba(0,0,0,0.5)'; g.fillRect(16, y, w, 28);
    g.textAlign = 'right'; g.textBaseline = 'top'; g.fillStyle = '#ffd400'; g.fillText(who + ':', 16 + w - 10, y + 4);
    const ww = g.measureText(who + ': ').width; g.fillStyle = '#fff'; g.fillText(txt, 16 + w - 10 - ww, y + 4);
    g.globalAlpha = 1;
  });
  // floating hearts on the right
  const rate = viewers(t) < 100 ? 1 : viewers(t) < 5000 ? 4 : 10;
  for (let i = 0; i < rate * 3; i++) { const ph = (t * 0.6 + i / (rate * 3)) % 1; const x = W - 40 + Math.sin(ph * 9 + i) * 14, y = 330 - ph * 220; g.globalAlpha = 1 - ph; g.fillStyle = ['#ff3355', '#ff6fa5', '#ffd400'][i % 3]; g.beginPath(); g.arc(x - 4, y, 5, 0, 7); g.arc(x + 4, y, 5, 0, 7); g.fill(); g.beginPath(); g.moveTo(x - 9, y + 2); g.lineTo(x + 9, y + 2); g.lineTo(x, y + 12); g.fill(); }
  g.globalAlpha = 1;
}
function drawTrend(g, t) {
  if (t < 37.9 || t >= 39.85) return; const k = easeBack(seg(t, 37.9, 38.1));
  g.save(); g.translate(W / 2, 130); g.scale(k, k); g.fillStyle = 'rgba(0,0,0,0.75)'; g.fillRect(-200, -34, 400, 70); g.strokeStyle = '#ff3355'; g.lineWidth = 3; g.strokeRect(-200, -34, 400, 70);
  pxText(g, 'TRENDING #1', 0, -26, 16, '#ff3355', 'center'); arText(g, '#الفانلة_الحمرا', 0, -4, 26, '#fff', 'center'); g.restore();
}
function drawTitle(g, t) {
  if (t >= 1.3) return; const op = t < 0.9 ? 1 : 1 - seg(t, 0.9, 1.3);
  g.globalAlpha = op; g.fillStyle = 'rgba(0,0,0,0.6)'; g.fillRect(0, 196, W, 76);
  arText(g, 'أم حمادة لايف', W / 2, 198, 40, '#ffe14a', 'center', 'ReemKufi'); pxText(g, 'OM HAMADA LIVE', W / 2, 250, 10, '#fff', 'center'); g.globalAlpha = 1;
}
function drawAlarm(g, t) {
  if (t < T_ALARM || t >= T_END_LIVE) return;
  if (Math.floor(t * 4) % 2) { pxText(g, 'SMOKE ALARM!', W / 2, 110, 22, '#ff3030', 'center'); arText(g, 'المحشي بيتحرق!', W / 2, 140, 28, '#ffe14a', 'center', 'ReemKufi'); }
}
function drawEndLive(g, t) {
  if (t < T_END_LIVE || t >= T_ENDC + 0.3) return; const a = t - T_END_LIVE;
  g.fillStyle = `rgba(0,0,0,${0.6 * clamp(a / 0.3)})`; g.fillRect(0, 0, W, H);
  const k = easeBack(clamp(a / 0.3)); g.save(); g.translate(W / 2, 80); g.scale(k, k);
  g.fillStyle = '#555'; g.fillRect(-60, -40, 120, 30); pxText(g, 'LIVE', 0, -32, 12, '#bbb', 'center', false);
  pxText(g, 'LIVE ENDED', 0, 0, 20, '#fff', 'center'); arText(g, 'انتهى البث', 0, 24, 26, '#ffe14a', 'center'); g.restore();
  const rows = [[1.2, 'المشاهدين: مليون', 'VIEWERS: 1,000,000'], [2.2, 'التريند: #الفانلة_الحمرا', 'TRENDING: RED UNDERSHIRT'], [3.6, 'المحشي: اتحرق', 'STUFFED CABBAGE: BURNT']];
  rows.forEach(([t0, ar, en], i) => { if (a < t0) return; const kk = easeBack(seg(a, t0, t0 + 0.2)); const yy = 168 + i * 54; g.save(); g.translate(W / 2, yy + 20); g.scale(kk, kk); g.fillStyle = 'rgba(10,10,40,0.88)'; g.fillRect(-230, -22, 460, 46); arText(g, ar, 220, -20, 24, i === 2 ? '#ff6060' : '#fff'); pxText(g, en, -220, -4, 8, '#9fd0ff'); g.restore(); });
}
function drawEnd(g, t) {
  const a = t - T_ENDC; if (a < 0) return; const k = easeOut(clamp(a / 0.4));
  g.fillStyle = `rgba(0,0,0,${0.55 * k})`; g.fillRect(0, 0, W, H);
  g.save(); g.translate(W / 2, 190); g.scale(k, k); arText(g, 'يُتبع...', 0, -40, 54, '#ffe14a', 'center', 'ReemKufi'); pxText(g, 'TO BE CONTINUED', 0, 30, 16, '#fff', 'center'); g.restore();
}

window.renderFrame = function (t) {
  stateAt(t); cameraAt(t);
  renderer.render(scene, camera);
  ctx.clearRect(0, 0, W, H); ctx.drawImage(glCanvas, 0, 0);
  if (t >= T_ALARM && t < T_END_LIVE && Math.floor(t * 4) % 2) { ctx.fillStyle = 'rgba(255,0,0,0.18)'; ctx.fillRect(0, 0, W, H); }
  h.clearRect(0, 0, W, H);
  drawLiveUI(h, t); drawTrend(h, t); drawAlarm(h, t); drawEndLive(h, t); drawDialogue(h, t); drawEnd(h, t); drawTitle(h, t);
  ctx.drawImage(hud, 0, 0);
  vignette(ctx, 0.3);
  return true;
};
window.frameData = () => out.toDataURL('image/png');
window.DUR = DUR;
document.fonts.load('10px PS2P').then(() => document.fonts.load('20px Lalezar', 'ع')).then(() => document.fonts.load('700 20px ReemKufi', 'ع')).then(() => {
  const g = jerseyTex.userData.g; g.fillStyle = '#d4141c'; g.fillRect(0, 0, 32, 32); g.fillStyle = '#fff'; g.fillRect(0, 2, 32, 2); g.font = '12px PS2P'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('10', 16, 18); jerseyTex.needsUpdate = true;
  window.READY = true;
});
