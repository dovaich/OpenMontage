// =====================================================================
// ماكينة الفراخ النووية — end of the month, one potato in the fridge, Ibrahim's machine turns potatoes into "chickens". vertical 9:16
// linear (no cold open / rewind / hook). L01 mom(kitchen) L02 dad L03 son L04 dad L05 mom L06 dad L07 mom L08 dad(CTA, balcony) L09 anno
// =====================================================================
const Lx = (i) => LINES[i - 1];
const T_LR = Lx(2).t0 - 0.15, T_POP = Lx(2).t1 - 0.35, T_CRAZY = Lx(4).t1 + 0.1, T_BALC = Lx(8).t0 - 0.25, T_ANNO = Lx(9).t0;
const lateDraw = [];
// ---------- kitchen: open fridge with one lonely potato ----------
const FR = V(KX + 2.1, 0, -1.2);
const frIn = mesh(box(0.7, 1.75, 0.05), new THREE.MeshBasicMaterial({ color: 0xeef6ff }), FR.x, 0.95, FR.z + 0.36, scene);
for (let i = 0; i < 3; i++) mesh(box(0.68, 0.02, 0.4), new THREE.MeshBasicMaterial({ color: 0xc8d8e8 }), FR.x, 0.5 + i * 0.45, FR.z + 0.5, scene);
const frDoor = new THREE.Group(); frDoor.position.set(FR.x - 0.4, 0, FR.z + 0.36); scene.add(frDoor);
mesh(box(0.8, 1.88, 0.06), P(0xf4f4f4), 0.4, 0.95, 0, frDoor); frDoor.rotation.y = -1.9;
const kitLamp = new THREE.PointLight(0xdfefff, 1.6, 3, 1.5); kitLamp.position.set(FR.x, 1.2, FR.z + 0.9); scene.add(kitLamp);
const potatoMat = M(0xc8a060);
function potato(parent, s = 1) { const p = mesh(new THREE.IcosahedronGeometry(0.075 * s, 0), potatoMat, 0, 0, 0, parent); p.scale.set(1.3, 0.85, 1); return p; }
const lonePotato = potato(scene); lonePotato.position.set(FR.x, 0.97, FR.z + 0.5);
// ---------- living room: the Nuclear Chicken Machine 3000 ----------
const MACH = V(0.25, 0, -1.7);
const mach = new THREE.Group(); mach.position.copy(MACH); scene.add(mach);
const machBody = new THREE.Group(); mach.add(machBody);
mesh(box(0.85, 0.95, 0.65), P(0xe8dcc0), 0, 0.48, 0, machBody);
mesh(new THREE.ConeGeometry(0.28, 0.4, 8, 1, true), P(0xc0c0c8, { side: THREE.DoubleSide }), 0, 1.15, 0, machBody).rotation.x = Math.PI;
mesh(box(0.3, 0.2, 0.35), P(0x9a9aa2), 0, 0.22, 0.42, machBody); // chute
mesh(box(0.26, 0.02, 0.3), M(0x222222), 0, 0.13, 0.45, machBody);
const crank = new THREE.Group(); crank.position.set(0.45, 0.6, 0); machBody.add(crank); mesh(new THREE.TorusGeometry(0.16, 0.025, 4, 10), P(0x2f6fd8), 0, 0, 0, crank).rotation.y = Math.PI / 2; mesh(box(0.04, 0.04, 0.2), P(0xffd400), 0.05, 0.12, 0.1, crank);
const bulb = mesh(new THREE.SphereGeometry(0.06, 8, 6), new THREE.MeshBasicMaterial({ color: 0x661111 }), -0.28, 1.0, 0.2, machBody);
mesh(cyl(0.05, 0.05, 0.5, 6), M(0x555555), -0.3, 1.2, -0.2, machBody);
const nukeC = canvasTex(16, 16, (g) => { g.fillStyle = '#ffd400'; g.fillRect(0, 0, 16, 16); g.fillStyle = '#111'; g.beginPath(); g.arc(8, 8, 2, 0, 7); g.fill(); for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(8, 8); g.arc(8, 8, 7, i * 2.09, i * 2.09 + 1.05); g.fill(); } });
mesh(new THREE.PlaneGeometry(0.22, 0.22), M(0xffffff, { map: nukeC }), 0.2, 0.7, 0.33, machBody);
const labelT = canvasTex(128, 32, (g) => { g.fillStyle = '#fff'; g.fillRect(0, 0, 128, 32); g.fillStyle = '#d8231b'; g.font = '22px Lalezar'; g.direction = 'rtl'; g.textAlign = 'center'; g.fillText('بطاطس = فراخ', 64, 24); });
lateDraw.push(() => { const c = labelT.image; const g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, 128, 32); g.fillStyle = '#d8231b'; g.font = '22px Lalezar'; g.direction = 'rtl'; g.textAlign = 'center'; g.fillText('بطاطس = فراخ', 64, 24); labelT.needsUpdate = true; });
mesh(new THREE.PlaneGeometry(0.5, 0.13), M(0xffffff, { map: labelT }), -0.08, 0.45, 0.33, machBody);
for (let i = 0; i < 2; i++) mesh(box(0.87, 0.03, 0.05), P(0xc9ccd1), 0, 0.3 + i * 0.4, 0.33, machBody);
// ---------- potato chickens ----------
function makePC() {
  const g = new THREE.Group(); scene.add(g);
  const body = mesh(new THREE.IcosahedronGeometry(0.13, 0), potatoMat, 0, 0.2, 0, g); body.scale.set(1.25, 0.9, 1);
  for (let i = 0; i < 3; i++) mesh(box(0.025, 0.025, 0.01), M(0x7a5a30), -0.06 + i * 0.06, 0.24 + (i % 2) * 0.05, 0.12, g);
  const head = new THREE.Group(); head.position.set(0, 0.34, 0.08); g.add(head);
  mesh(new THREE.IcosahedronGeometry(0.07, 0), potatoMat, 0, 0, 0, head);
  mesh(box(0.025, 0.06, 0.08), M(0xe0201a), 0, 0.07, 0, head);
  const beak = mesh(new THREE.ConeGeometry(0.025, 0.06, 4), M(0xffa020), 0, -0.01, 0.08, head); beak.rotation.x = Math.PI / 2;
  for (const s of [-1, 1]) { mesh(box(0.02, 0.02, 0.01), M(0x111111), s * 0.03, 0.02, 0.06, head); }
  const legs = []; for (const s of [-1, 1]) { const l = new THREE.Group(); l.position.set(s * 0.05, 0.12, 0); g.add(l); mesh(box(0.02, 0.12, 0.02), M(0xffa020), 0, -0.06, 0, l); mesh(box(0.06, 0.01, 0.06), M(0xffa020), 0, -0.12, 0.02, l); legs.push(l); }
  return { g, head, beak, legs };
}
const NPC = 30; const PCS = []; for (let i = 0; i < NPC; i++) PCS.push(makePC());
const T_SPAWN = (i) => (i === 0 ? T_POP : T_CRAZY + 0.25 + (i - 1) * 0.11);
function pcRoom(i, t) { // running loop around the living room
  const s = t - T_SPAWN(i), sp = 0.6 + hash(i) * 0.5, ph = hash(i + 50) * 6.28, rx = 0.8 + hash(i + 9) * 1.6, rz = 0.5 + hash(i + 19) * 1.1, dir = hash(i + 3) > 0.5 ? 1 : -1;
  const a = ph + dir * s * sp; return V(Math.cos(a) * rx - 0.2, 0, Math.sin(a) * rz - 0.6);
}
function pcState(t) {
  const crazy = t >= T_CRAZY;
  PCS.forEach((c, i) => {
    let vis = t >= T_SPAWN(i) && t < T_BALC; let p, ry = 0, run = false;
    const chute = MACH.clone().add(V(0, 0.2, 0.6));
    if (i === 0 && t < Lx(3).t0 - 0.1) { const k = seg(t, T_POP, T_POP + 0.4); p = VL(chute, chute.clone().add(V(-0.3, -0.2, 0.5)), k); p.y += Math.sin(k * Math.PI) * 0.4; }
    else if (i === 0 && t < T_CRAZY) { const r = son.root.rotation.y; p = son.root.position.clone().add(V(Math.sin(r) * 0.42, 0.95, Math.cos(r) * 0.42)); ry = r; }
    else { const s = t - Math.max(T_SPAWN(i), i === 0 ? T_CRAZY : 0); if (s < 0.5 && i > 0) { const k = s / 0.5; const a = chute, b = pcRoom(i, T_SPAWN(i) + 0.5); p = VL(a, b, k); p.y = Math.max(0, a.y + Math.sin(k * Math.PI) * 0.6 - k * a.y); }
      else { const tt2 = i === 0 ? t - 0.5 : t; p = pcRoom(i, tt2); const q = pcRoom(i, tt2 + 0.05); ry = Math.atan2(q.x - p.x, q.z - p.z); run = true; p.y = Math.abs(Math.sin(t * 14 + i)) * 0.04; } }
    if (t >= T_BALC && i < 8) { vis = true; const a = i / 8 * 6.28 + t * 0.3; p = V(0.2 + Math.cos(a) * 0.9, Math.abs(Math.sin(t * 10 + i)) * 0.03, 0.15 + Math.sin(a) * 0.55); ry = a + Math.PI / 2; run = true; }
    c.g.visible = vis; if (!vis) return; c.g.position.copy(p); c.g.rotation.set(0, ry, 0);
    c.legs[0].rotation.x = run ? Math.sin(t * 20 + i) * 0.7 : 0; c.legs[1].rotation.x = run ? -Math.sin(t * 20 + i) * 0.7 : 0;
    c.head.rotation.x = Math.max(0, Math.sin(t * 9 + i * 1.7)) * 0.5; c.beak.scale.y = 1 + (Math.floor(t * 8 + i) % 2) * 0.4;
  });
}
// balcony plastic chair
const chair = new THREE.Group(); balcony.add(chair); chair.position.set(0.2, 0, -0.2);
mesh(box(0.48, 0.05, 0.45), P(0x2fae5a), 0, 0.45, 0, chair); mesh(box(0.48, 0.5, 0.05), P(0x2fae5a), 0, 0.72, -0.2, chair);
for (const [x, z] of [[-0.2, -0.18], [0.2, -0.18], [-0.2, 0.18], [0.2, 0.18]]) mesh(box(0.04, 0.45, 0.04), P(0x2fae5a), x, 0.22, z, chair);
// positions
const DAD0 = V(1.05, 0, -1.25), SON0 = V(-0.55, 0, -0.85), MOMK = V(KX + 1.25, 0, -0.35), MOMR0 = V(-2.6, 0, 0.3), MOMR = V(-1.25, 0, -0.15);
function stateAt(t) {
  const set = t < T_LR ? 'kitchen' : t < T_BALC ? 'room' : 'balcony';
  kitchen.visible = set === 'kitchen'; room.visible = set === 'room'; balcony.visible = set === 'balcony'; mach.visible = set === 'room';
  frIn.visible = frDoor.visible = lonePotato.visible = set === 'kitchen'; kitLamp.intensity = set === 'kitchen' ? 1.6 : 0;
  const crazy = t >= T_CRAZY;
  // machine
  machBody.position.set(crazy ? Math.sin(t * 40) * 0.03 : 0, crazy ? Math.abs(Math.sin(t * 25)) * 0.04 : 0, 0); crank.rotation.x = (t >= Lx(2).t0 + 1 ? t * 6 : 0) * (crazy ? 3 : 1);
  bulb.material.color.setHex((t >= T_POP - 0.2 && Math.floor(t * 6) % 2) ? 0xff2a2a : 0x661111);
  pcState(t);
  // Om Hamada
  mom.root.visible = set === 'kitchen' || (set === 'room' && t >= Lx(5).t0 - 0.7);
  { let p = { ...POSE0 };
    if (set === 'kitchen') { mom.root.position.copy(MOMK); mom.root.rotation.set(0, -0.35, 0); p.aRx = 1.4; p.aRz = -0.6; p.eR = 0.3; if (inT(t, Lx(1).t0 + 1.2, Lx(1).t1)) { p.aLx = 1.6; p.aLz = 0.6; p.eL = 0.2; } }
    else { const k = easeOut(seg(t, Lx(5).t0 - 0.7, Lx(5).t0 - 0.1)); mom.root.position.copy(VL(MOMR0, MOMR, k)); mom.root.rotation.set(0, 0.5, 0);
      if (inT(t, Lx(5).t0, Lx(5).t1)) { p.aLz = 2.4 + Math.sin(t * 12) * 0.2; p.aRz = 2.4 - Math.sin(t * 12) * 0.2; p.lL = Math.max(0, Math.sin(t * 14)) * 0.6; p.lR = Math.max(0, -Math.sin(t * 14)) * 0.6; mom.root.position.y = Math.abs(Math.sin(t * 14)) * 0.08; }
      if (t >= Lx(7).t0 - 0.1) { mom.root.rotation.y = 0.9; p.aRx = 1.5; p.aRz = 0.9; p.eR = 0.1; } }
    applyPose(mom, talkPose(p, t, 'mom', 0.3));
    let me = 'angry', mm = talkMouth(t, 'mom', 'scream') || 'frown'; if (inT(t, Lx(5).t0, Lx(5).t1)) { me = 'wide'; mm = talkMouth(t, 'mom', 'scream') || 'scream'; } if (t >= Lx(7).t0 - 0.1) { me = 'smug'; mm = talkMouth(t, 'mom') || 'flat'; }
    setFace(mom, me, mm, {}); }
  // Hamada
  son.root.visible = set === 'room'; son.root.position.copy(SON0); son.root.rotation.set(0, 0.45, 0);
  { let p = { ...POSE0 }; if (inT(t, Lx(3).t0 - 0.1, T_CRAZY)) { p.aRx = 1.5; p.aRz = 0.2; p.eR = 0.3; son.root.rotation.y = 0.2; }
    if (crazy) { p.lL = Math.max(0, Math.sin(t * 14)) * 0.7; p.lR = Math.max(0, -Math.sin(t * 14)) * 0.7; son.root.position.y = Math.abs(Math.sin(t * 14)) * 0.07; p.aLz = 1.8; p.aRz = 1.8; }
    applyPose(son, talkPose(p, t, 'son', 0.3));
    let se = 'wide', sm = talkMouth(t, 'son', 'scream') || 'o'; if (inT(t, Lx(3).t0, Lx(3).t1)) { se = 'side'; } setFace(son, se, sm, {}); }
  // Ibrahim
  dad.root.visible = set !== 'kitchen';
  { let p = { ...POSE0 };
    if (set === 'room') { dad.root.position.copy(DAD0); dad.root.rotation.set(0, -0.45, 0);
      if (inT(t, Lx(2).t0, Lx(2).t1)) { p.aLx = 1.5; p.aLz = 0.8; p.eL = 0.2; dad.root.rotation.y = -0.7; }
      if (inT(t, Lx(4).t0, Lx(4).t1)) { p.aRx = 1.1; p.eR = 0.4; p.aRz = 0.4; }
      if (inT(t, Lx(6).t0, Lx(6).t1)) { p.aLx = 0.8; p.aRx = 0.8; p.eL = 1.2; p.eR = 1.2; p.hx = 0.15; } }
    else { dad.root.position.set(0.2, 0, -0.2); dad.root.rotation.set(0, 0, 0); p = { ...POSE0, y: -0.33, lL: 1.45, lR: 1.45, aLx: 0.6, eL: 1.0, aRx: 0.6, eR: 1.0 }; if (inT(t, Lx(8).t0, Lx(8).t1)) { p.aRx = 1.3; p.aRz = 0.5; p.eR = 0.4; } }
    applyPose(dad, talkPose(p, t, 'dad', 0.35));
    let de = 'smug', dm = talkMouth(t, 'dad', 'grin') || 'smile'; if (inT(t, Lx(2).t0, Lx(3).t0)) de = 'sparkle'; if (crazy && set === 'room') { de = 'wide'; dm = talkMouth(t, 'dad') || 'o'; } if (inT(t, Lx(6).t0, Lx(6).t1)) { de = 'side'; dm = talkMouth(t, 'dad') || 'fakegrin'; } if (t >= Lx(7).t0) { de = 'sad'; dm = talkMouth(t, 'dad') || 'frown'; } if (set === 'balcony') { de = 'smug'; dm = talkMouth(t, 'dad', 'grin') || 'smile'; }
    setFace(dad, de, dm, { stache: true }); }
  // lights
  const night = set === 'balcony';
  scene.background = new THREE.Color(night ? 0x060a1a : 0x101010);
  roomLight.position.set(set === 'kitchen' ? KX : 0, 2.8, 1.0); roomLight.intensity = night ? 0 : 1.6; ambient.color.setHex(night ? 0x5060a0 : 0xfff0e0); ambient.intensity = night ? 0.5 : 0.62;
  moon.intensity = night ? 0.5 : 0.2; fill.intensity = 1.0; balcLight.intensity = night ? 1.2 : 0; balcLight.position.set(1.5, 2.2, 0.2);
  tvLight.intensity = 0; bathLight.intensity = 0; kitLight.intensity = set === 'kitchen' ? 1.0 : 0;
}
function shotAt(t) {
  if (t < T_LR) { faceCam(mom, 2.4 - 0.3 * easeOut(seg(t, 0, 1.6)), -0.5, 0.1, 62, 0.3); camera.position.add(shake(t, 0.015)); return; }
  if (t < Lx(3).t0 - 0.1) { if (t < T_POP) { const k = easeOut(seg(t, Lx(2).t0, Lx(2).t0 + 1.2)); cam(VL(V(1.0, 1.55, 0.9), V(0.9, 1.5, 1.4), k), V(0.65, 1.25, -1.5), 64); return; } cam(V(0.3, 1.0, 0.4), MACH.clone().add(V(-0.2, 0.3, 0.6)), 60); return; }
  if (t < Lx(4).t0 - 0.1) { faceCam(son, 1.7, 0.35, -0.05, 58, 0.45); return; }
  if (t < T_CRAZY) { faceCam(dad, 1.8, -0.3, 0.05, 58, 0.3); return; }
  if (t < Lx(5).t0 - 0.1) { cam(V(0.0, 1.9, 2.8).add(shake(t, 0.03)), V(-0.1, 0.4, -0.8), 70); return; }
  if (t < Lx(6).t0 - 0.1) { faceCam(mom, 1.9, 0.3, 0.05, 62, 0.35); camera.position.add(shake(t, 0.02)); return; }
  if (t < Lx(7).t0 - 0.1) { faceCam(dad, 1.8, -0.3, 0.05, 58, 0.3); return; }
  if (t < T_BALC) { faceCam(mom, 1.9, 0.3, 0.05, 60, 0.3); return; }
  if (t < T_ANNO) { faceCam(dad, 2.3 - 0.4 * seg(t, Lx(8).t0, Lx(8).t1), 0.1, 0.15, 60, 0.4); return; }
  const k = easeInOut(seg(t, T_ANNO, DUR - 3)); cam(VL(V(0.3, 1.5, 2.8), V(0.3, 2.0, 3.4), k), V(0.2, 0.6, -0.3), 64);
}
function particles(t) {
  const pf = [], st = [];
  if (t >= Lx(2).t0 + 1 && t < T_BALC) { const p = MACH.clone().add(V(-0.3, 1.5, -0.2)); const n = t >= T_CRAZY ? 6 : 3; for (let i = 0; i < n; i++) { const k = (t * 0.9 + i / n) % 1; pf.push({ pos: p.clone().add(V(k * 0.3, k * 1.0, 0)), size: 0.12 + k * 0.3, op: 0.6 * (1 - k), color: 0x777777 }); } }
  if (inT(t, T_POP, T_POP + 0.5)) { const p = MACH.clone().add(V(0, 0.3, 0.6)); for (let i = 0; i < 6; i++) { const a = (t - T_POP) * 3; st.push({ pos: p.clone().add(V(Math.cos(i) * a, 0.2 + Math.sin(i * 2) * a * 0.5, Math.sin(i) * a * 0.3)), size: 0.14, color: [0xffd400, 0xffffff][i % 2] }); } }
  emit(st, starPool); emit(pf, puffPool); emit([], trailPool); emit([], sweatPool);
}
// ---------- HUD ----------
const BALC0 = 42;
function drawMonth(g, t) {
  if (t >= T_LR) return; const k = easeBack(seg(t, 0.3, 0.6)); g.save(); g.translate(W - 110, 600); g.scale(k, k); g.fillStyle = '#fff'; g.fillRect(-90, -60, 180, 120); g.fillStyle = '#d8231b'; g.fillRect(-90, -60, 180, 34);
  arText(g, 'باقي على المرتب', 0, -62, 20, '#fff', 'center'); pxText(g, '20', -20, -10, 30, '#111', 'center', false); arText(g, 'يوم', 45, -16, 28, '#111', 'center'); g.restore();
}
function drawCount(g, t) {
  if (t < T_CRAZY + 0.3 || t >= T_BALC) return; let n = 0; for (let i = 0; i < NPC; i++) if (t >= T_SPAWN(i)) n++;
  g.save(); g.translate(W - 110, 600); g.fillStyle = 'rgba(0,0,0,0.7)'; g.fillRect(-95, -40, 190, 80); arText(g, 'فراخ في الصالة', 0, -40, 18, '#fff', 'center'); pxText(g, String(n), 0, -2, 22, '#ffe14a', 'center'); g.restore();
}
function drawBalc(g, t) {
  if (t < T_BALC || t >= T_ANNO) return; const k = easeBack(seg(t, T_BALC, T_BALC + 0.3)); const n = t >= T_BALC + 0.6 ? BALC0 + 1 : BALC0;
  g.save(); g.translate(W - 120, 600); g.scale(k, k); g.fillStyle = 'rgba(0,0,0,0.72)'; g.fillRect(-105, -48, 210, 96); g.strokeStyle = '#ffe14a'; g.lineWidth = 2; g.strokeRect(-105, -48, 210, 96);
  arText(g, 'ليالي البلكونة', 0, -48, 20, '#fff', 'center'); pxText(g, String(n), 0, 2, 26, n > BALC0 && Math.floor(t * 4) % 2 ? '#ff5a4a' : '#ffe14a', 'center'); g.restore();
}
function drawCTA(g, t) {
  if (t < Lx(8).t0 || t >= T_ANNO) return; const k = easeBack(seg(t, Lx(8).t0, Lx(8).t0 + 0.3));
  g.save(); g.translate(W / 2, 140); g.scale(k, k); g.fillStyle = 'rgba(255,255,255,0.96)'; g.fillRect(-250, -54, 500, 108); g.fillStyle = '#d8231b'; g.fillRect(-250, 48, 500, 6);
  arText(g, 'اقترح اختراع لإبراهيم 👇', 0, -56, 32, '#111', 'center'); arText(g, 'أحسن كومنت هيبقى حلقة!', 0, -14, 30, '#d8231b', 'center'); g.restore();
}
window.renderFrame = function (t) {
  stateAt(t); shotAt(t); particles(t);
  renderer.render(scene, camera);
  ctx.clearRect(0, 0, W, H); ctx.drawImage(glCanvas, 0, 0);
  h.clearRect(0, 0, W, H);
  drawInventionV(h, t, Lx(2).vox[Math.min(1, Lx(2).vox.length - 1)][0], T_POP, 'ماكينة الفراخ النووية ٣٠٠٠', [['CHICKEN', 3, '#ffe14a'], ['POTATO', 10, '#c8a060']]);
  drawDialogueV(h, t); drawMonth(h, t); drawCount(h, t); drawBalc(h, t); drawCTA(h, t);
  drawEndV(h, t, T_ANNO + 0.1, 'POTATOES: CHICKENS', 'الصالة بقت مزرعة', [['SALARY', 'المرتب: خلص', T_ANNO + 1.3, '#ff5a4a'], ['CHICKENS', 'الفراخ: ٣٠', T_ANNO + 2.6, '#ffe14a']], DUR);
  ctx.drawImage(hud, 0, 0); vignette(ctx, 0.35);
  if (t >= T_POP && t < T_POP + 0.06) { ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.fillRect(0, 0, W, H); }
  return true;
};
window.frameData = () => out.toDataURL('image/png');
window.DUR = DUR;
document.fonts.load('10px PS2P').then(() => document.fonts.load('20px Lalezar', 'ع')).then(() => document.fonts.load('700 20px ReemKufi', 'ع')).then(() => { lateDraw.forEach(f => f()); window.READY = true; });
