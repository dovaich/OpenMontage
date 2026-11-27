// =====================================================================
// تضامن — the whole cast after the Ring Road tanker fire: blood donation, help, food, prayers. SERIOUS, no comedy, no game HUD. vertical 9:16
// L01 son L02 dad L03 mom L04 son (home, night) | L05 dad L06 son (home) | L07 hoda L08 alamy L09 shehata (blood-donation street, day)
// L10 mom (kitchen, packing food) | L11 sayed L12 samir L13 mom(dua) L14 dad(إنا لله) (candle vigil, night) then a condolence card
// =====================================================================
NAMES.hoda = ['حودة', 'HODA', '#c8a000'];
scene.add(samir.root);
const Lx = (i) => LINES[i - 1];
const T_STREET = Lx(7).t0 - 0.3, T_KIT = Lx(10).t0 - 0.2, T_VIG = Lx(11).t0 - 0.4, T_CARD = Lx(14).t1 + 0.8;
const setAt = (t) => t < T_STREET ? 'home' : t < T_KIT ? 'street' : t < T_VIG ? 'kitchen' : 'vigil';
// ---------- props ----------
const phone = new THREE.Group(); scene.add(phone); mesh(box(0.06, 0.13, 0.012), P(0x222222), 0, 0, 0, phone); mesh(new THREE.PlaneGeometry(0.05, 0.11), new THREE.MeshBasicMaterial({ color: 0xffb070 }), 0, 0, 0.007, phone);
const SX = 420; const street = new THREE.Group(); street.position.x = SX; scene.add(street);
{
  const tiles = canvasTex(16, 16, (g) => { g.fillStyle = '#8a8478'; g.fillRect(0, 0, 16, 16); g.fillStyle = '#76705f'; g.fillRect(0, 0, 8, 8); g.fillRect(8, 8, 8, 8); }); tiles.wrapS = tiles.wrapT = THREE.RepeatWrapping; tiles.repeat.set(14, 8);
  mesh(new THREE.PlaneGeometry(20, 10), M(0xffffff, { map: tiles }), 0, 0, -1, street).rotation.x = -Math.PI / 2;
  mesh(new THREE.PlaneGeometry(20, 8), M(0x3a3a3e), 0, 0.005, 7, street).rotation.x = -Math.PI / 2;
  const wallT = canvasTex(32, 32, (g) => { g.fillStyle = '#d8c8a8'; g.fillRect(0, 0, 32, 32); g.fillStyle = '#c8b898'; for (let i = 0; i < 9; i++) g.fillRect((i * 13) % 30, (i * 7) % 30, 3, 2); }); wallT.wrapS = wallT.wrapT = THREE.RepeatWrapping; wallT.repeat.set(8, 4);
  mesh(new THREE.PlaneGeometry(20, 9), M(0xffffff, { map: wallT }), 0, 4.5, -5.2, street);
  for (let fl = 0; fl < 2; fl++) for (const x of [-7, -4, -1, 2, 5, 8]) mesh(new THREE.PlaneGeometry(1.0, 1.2), new THREE.MeshBasicMaterial({ color: 0x5a6a80 }), x, 2.2 + fl * 2.6, -5.18, street);
  mesh(box(5, 0.9, 0.12), P(0xf4f4f4), -1.5, 7.4, -5.1, street); mesh(box(0.7, 0.2, 0.14), new THREE.MeshBasicMaterial({ color: 0xd8231b }), -3.6, 7.4, -5.05, street); mesh(box(0.2, 0.7, 0.14), new THREE.MeshBasicMaterial({ color: 0xd8231b }), -3.6, 7.4, -5.05, street);
}
const hospT = canvasTex(256, 48, () => {}); const bannerT = canvasTex(256, 64, () => {});
function drawSigns() { let g = hospT.image.getContext('2d'); g.fillStyle = '#f4f4f4'; g.fillRect(0, 0, 256, 48); g.fillStyle = '#1a3a7a'; g.font = '34px Lalezar'; g.direction = 'rtl'; g.textAlign = 'center'; g.fillText('مستشفى', 140, 38); hospT.needsUpdate = true;
  g = bannerT.image.getContext('2d'); g.fillStyle = '#ffffff'; g.fillRect(0, 0, 256, 64); g.fillStyle = '#d8231b'; g.fillRect(0, 0, 256, 8); g.fillRect(0, 56, 256, 8); g.font = '38px Lalezar'; g.direction = 'rtl'; g.textAlign = 'center'; g.fillText('تبرّع بالدم... أنقذ حياة', 128, 46); bannerT.needsUpdate = true; }
mesh(new THREE.PlaneGeometry(3.8, 0.7), new THREE.MeshBasicMaterial({ map: hospT }), SX - 1.2, 7.4, -5.03, scene);
const bus = new THREE.Group(); bus.position.set(SX + 2.6, 0, -3.3); scene.add(bus);
mesh(box(7.5, 2.6, 2.4), P(0xf4f4f4, { shininess: 80 }), 0, 1.65, 0, bus); mesh(box(7.52, 0.3, 2.42), P(0xd8231b), 0, 0.9, 0, bus);
for (let i = 0; i < 5; i++) mesh(box(1.0, 0.7, 0.05), P(0x2a3a4a, { shininess: 120 }), -3 + i * 1.4, 2.25, 1.22, bus);
mesh(new THREE.PlaneGeometry(3.6, 0.9), new THREE.MeshBasicMaterial({ map: bannerT }), 0.8, 1.45, 1.23, bus);
const dropT = canvasTex(32, 32, (g) => { g.fillStyle = '#d8231b'; g.beginPath(); g.moveTo(16, 2); g.bezierCurveTo(28, 18, 26, 30, 16, 30); g.bezierCurveTo(6, 30, 4, 18, 16, 2); g.fill(); });
mesh(new THREE.PlaneGeometry(0.8, 0.8), M(0xffffff, { map: dropT, transparent: true }), -2.4, 1.45, 1.23, bus);
for (const x of [-2.6, 2.6]) for (const s of [-1, 1]) mesh(cyl(0.45, 0.45, 0.3, 12), M(0x111111), x, 0.45, s * 1.1, bus).rotation.x = Math.PI / 2;
mesh(box(0.9, 1.9, 0.06), P(0xc8c8c8), -3.0, 1.3, 1.23, bus);
const wtab = new THREE.Group(); wtab.position.set(SX + 4.6, 0, 0.2); scene.add(wtab);
mesh(box(1.4, 0.06, 0.7), M(0x8a5a2b, { map: woodTex }), 0, 0.8, 0, wtab); for (const [x, z] of [[-0.6, -0.3], [0.6, -0.3], [-0.6, 0.3], [0.6, 0.3]]) mesh(box(0.05, 0.8, 0.05), M(0x6a4220), x, 0.4, z, wtab);
for (let i = 0; i < 12; i++) mesh(cyl(0.035, 0.035, 0.24, 8), P(i % 3 ? 0x9fd0ff : 0xffa030, { transparent: true, opacity: 0.85 }), -0.55 + (i % 6) * 0.2, 0.95, -0.12 + Math.floor(i / 6) * 0.22, wtab);
const bottle = mesh(cyl(0.035, 0.035, 0.24, 8), P(0x9fd0ff, { transparent: true, opacity: 0.85 }), 0, 0, 0, scene);
const tuk = new THREE.Group(); tuk.position.set(SX - 4.2, 0, 0.6); tuk.rotation.y = 0.5; scene.add(tuk);
mesh(box(1.3, 1.0, 2.0), P(0xd8231b, { shininess: 80 }), 0, 0.9, 0.2, tuk); mesh(box(1.4, 0.08, 2.3), P(0x222222), 0, 1.85, 0.1, tuk);
for (const s of [-1, 1]) mesh(box(0.06, 0.95, 0.06), P(0x222222), s * 0.65, 1.4, -0.75, tuk); mesh(box(1.1, 0.5, 0.05), P(0x2a3a4a, { shininess: 120 }), 0, 1.45, -0.78, tuk);
mesh(box(0.8, 0.5, 0.6), P(0xd8231b), 0, 0.6, -1.0, tuk);
for (const [x, z] of [[0, -1.2], [-0.6, 0.8], [0.6, 0.8]]) mesh(cyl(0.28, 0.28, 0.18, 10), M(0x111111), x, 0.28, z, tuk).rotation.z = Math.PI / 2;
const food = new THREE.Group(); food.position.set(KX - 0.4, 0.95, -1.15); scene.add(food);
for (let i = 0; i < 6; i++) { mesh(box(0.22, 0.09, 0.16), P(0xf0f0f0, { transparent: true, opacity: 0.9 }), -0.6 + i * 0.25, 0.04, 0, food); mesh(box(0.2, 0.05, 0.14), M([0xd89a3a, 0x2f7a2a, 0xb0502a][i % 3]), -0.6 + i * 0.25, 0.05, 0, food); }
const bag = new THREE.Group(); bag.position.set(KX + 0.9, 0.95, -1.15); scene.add(bag); mesh(box(0.4, 0.4, 0.25), P(0xf4f4ff, { transparent: true, opacity: 0.85 }), 0, 0.2, 0, bag);
const CAST = () => [hoda, shehata, sayed, samir, son, dad, mom, alamy, bastam, asly, gazzar];
const WHO = ['hoda', 'shehata', 'sayed', 'samir', 'son', 'dad', 'mom', 'alamy', 'bastam', 'asly', 'gazzar'];
const candles = [], cflames = [], candleLights = [];
CAST().forEach(() => { const cg = new THREE.Group(); scene.add(cg); mesh(cyl(0.025, 0.025, 0.14, 8), P(0xf4f0e0), 0, 0.07, 0, cg); const f = mesh(new THREE.ConeGeometry(0.016, 0.05, 6), new THREE.MeshBasicMaterial({ color: 0xffc050 }), 0, 0.17, 0, cg); candles.push(cg); cflames.push(f); });
for (let i = 0; i < 4; i++) { const l = new THREE.PointLight(0xffb060, 0, 4, 1.5); scene.add(l); candleLights.push(l); }
// ---------- positions ----------
const SEAT = { ...POSE0, lL: 1.45, lR: 1.45, aLx: 0.7, eL: 1.1, aRx: 0.7, eR: 1.1 };
const VIG = (i) => V(SX - 4.0 + i * 0.8, 0, Math.abs(i - 5) * 0.08);
const QUEUE = { dad: V(SX - 1.3, 0, -1.35), son: V(SX - 0.65, 0, -1.3), bastam: V(SX + 0.0, 0, -1.35), asly: V(SX + 0.75, 0, -1.4), gazzar: V(SX + 1.5, 0, -1.35) };
let TT = 0;
function place(c, p, ry, pose, eyes, mouth, opts, who) { c.root.visible = true; c.root.position.copy(p); c.root.rotation.set(0, ry, 0); applyPose(c, who ? talkPose(pose, TT, who, 0.15) : pose); setFace(c, eyes, (who && talkMouth(TT, who)) || mouth, opts || {}); }
const DUA = (p) => { p.aLx = 0.75; p.aRx = 0.75; p.eL = 1.2; p.eR = 1.2; p.aLz = 0.35; p.aRz = 0.35; p.hx = 0.2; return p; };
const CANDLE = (p) => { p.aRx = 0.9; p.eR = 1.3; p.aRz = 0.05; p.hx = 0.15; return p; };
const faceOpts = (who) => who === 'alamy' ? ALAMY_FACE : who === 'samir' ? { stache: true, stacheColor: '#eeeeee' } : (who === 'dad' || who === 'shehata') ? { stache: true } : {};
function stateAt(t) {
  TT = t; const S = setAt(t);
  room.visible = S === 'home'; balcony.visible = false; kitchen.visible = S === 'kitchen'; street.visible = S === 'street' || S === 'vigil'; cane.visible = false;
  bus.visible = S === 'street' || S === 'vigil'; wtab.visible = S === 'street'; tuk.visible = S === 'street' || S === 'vigil'; food.visible = bag.visible = S === 'kitchen';
  for (const l of laundry) l.visible = false;
  for (const c of CAST()) c.root.visible = false; phone.visible = false; bottle.visible = false; candles.forEach(c => c.visible = false); candleLights.forEach(l => l.intensity = 0);
  if (S === 'home') {
    const up = t >= Lx(5).t0 - 0.3;
    place(son, V(-0.6, 0, -1.97), 0.15, { ...SEAT, y: -0.31, aRx: 1.0, eR: 1.5, hx: t < Lx(2).t0 ? 0.25 : 0.05 }, 'tired', 'flat', {}, 'son');
    if (t < Lx(4).t1) { phone.visible = true; const hp = son.arms[1].hand.getWorldPosition(V(0, 0, 0)); phone.position.copy(hp).add(V(0, 0.07, 0.02)); phone.rotation.set(-0.9, 0.15, 0); }
    const dpos = up ? VL(V(0, 0, -1.97), V(0.15, 0, -1.2), easeInOut(seg(t, Lx(5).t0 - 0.3, Lx(5).t0 + 0.5))) : V(0, 0, -1.97);
    place(dad, dpos, 0, up ? { ...POSE0 } : { ...SEAT, y: -0.4, hx: 0.12 }, up ? 'flat' : 'tired', 'flat', { stache: true }, 'dad');
    const pm = { ...SEAT, y: -0.33, hx: 0.1 }; if (inT(t, Lx(3).t0, Lx(3).t1)) { pm.aLx = 1.3; pm.eL = 1.9; pm.aLz = 0.2; } place(mom, V(0.6, 0, -1.97), -0.15, pm, t >= Lx(3).t0 ? 'tears' : 'sad', 'frown', {}, 'mom');
  } else if (S === 'street') {
    for (const [n, c] of [['dad', dad], ['son', son], ['bastam', bastam], ['asly', asly], ['gazzar', gazzar]]) { const p = { ...POSE0 }; if (n === 'dad') { p.aLx = 0.3; p.eL = 1.6; } place(c, QUEUE[n], -0.25, p, 'flat', 'flat', faceOpts(n), n); }
    { const p = { ...POSE0 }; if (inT(t, Lx(8).t0, Lx(8).t1)) { p.aRx = 1.0; p.aRz = 0.5; p.eR = 0.4; } place(alamy, V(SX - 2.3, 0, -0.4), 0.35, p, 'flat', 'flat', ALAMY_FACE, 'alamy'); }
    { const p = { ...POSE0 }; if (inT(t, Lx(7).t0, Lx(7).t1)) { p.aLx = 0.9; p.aLz = 0.6; p.eL = 0.3; } place(hoda, V(SX - 3.3, 0, 1.25), 0.2, p, 'flat', 'smile', {}, 'hoda'); }
    { place(shehata, V(SX + 4.6, 0, -0.45), 0.1, { ...POSE0, aRx: 1.2, eR: 0.5 }, 'flat', 'smile', { stache: true }, 'shehata'); bottle.visible = true; const hp = shehata.arms[1].hand.getWorldPosition(V(0, 0, 0)); bottle.position.copy(hp).add(V(0, 0.1, 0.05)); }
  } else if (S === 'kitchen') {
    const p = { ...POSE0, aLx: 1.2, eL: 0.6, aRx: 1.2, eR: 0.6, hx: 0.35, bend: 0.15 }; if (t > Lx(10).t1 - 0.5) { p.hx = 0.05; p.bend = 0; }
    place(mom, V(KX + 0.2, 0, -0.45), 0, p, 'sad', 'flat', {}, 'mom');
  } else {
    const dua = t >= Lx(13).t0 - 0.2 && t < Lx(13).t1 + 0.3;
    CAST().forEach((c, i) => { const who = WHO[i]; const p = dua ? DUA({ ...POSE0 }) : CANDLE({ ...POSE0 });
      const eyes = t >= Lx(13).t0 - 0.2 && t < Lx(14).t1 ? 'closed' : who === 'mom' ? 'tears' : 'tired';
      place(c, VIG(i), 0, p, eyes, 'flat', faceOpts(who), who);
      candles[i].visible = !dua; if (!dua) { const hp = c.arms[1].hand.getWorldPosition(V(0, 0, 0)); candles[i].position.copy(hp).add(V(0, 0.05, 0.04)); cflames[i].scale.y = 1 + Math.sin(t * 13 + i) * 0.2; } });
    candleLights.forEach((l, j) => { l.position.copy(VIG(1 + j * 3)).add(V(0, 1.3, 0.5)); l.intensity = 1.3 + Math.sin(t * 9 + j) * 0.12; });
  }
  const day = S === 'street';
  scene.background = new THREE.Color(day ? 0x9fc4e8 : 0x05070f);
  roomLight.position.set(S === 'kitchen' ? KX : 0, 2.8, 1.0); roomLight.intensity = S === 'home' ? 0.45 : S === 'kitchen' ? 1.1 : 0;
  ambient.color.setHex(day ? 0xfff0e0 : 0x6070a0); ambient.intensity = day ? 0.85 : 0.45; moon.intensity = day ? 1.1 : 0.3; moon.position.set(SX - 4, 10, 6);
  fill.intensity = day ? 1.2 : 0.7; tvLight.position.set(0, 1.3, 0.6); tvLight.color.setHex(0xffa060); tvLight.intensity = S === 'home' ? 2.2 + Math.sin(t * 7) * 0.3 : 0;
  balcLight.intensity = 0; bathLight.intensity = 0; kitLight.intensity = S === 'kitchen' ? 1.0 : 0; hallLight.intensity = 0;
}
function shotAt(t) {
  const S = setAt(t);
  if (S === 'home') {
    if (t < Lx(2).t0 - 0.1) { faceCam(son, 1.6 - 0.25 * easeInOut(seg(t, 0, Lx(1).t1)), 0.15, 0.05, 54, 0.3); return; }
    if (t < Lx(3).t0 - 0.1) { faceCam(dad, 1.7 - 0.2 * seg(t, Lx(2).t0, Lx(2).t1), 0.0, 0.05, 54, 0.3); return; }
    if (t < Lx(4).t0 - 0.1) { faceCam(mom, 1.5 - 0.2 * seg(t, Lx(3).t0, Lx(3).t1), -0.1, 0.05, 54, 0.3); return; }
    if (t < Lx(5).t0 - 0.1) { faceCam(son, 1.4, 0.2, 0.05, 54, 0.3); return; }
    if (t < Lx(6).t0 - 0.1) { faceCam(dad, 1.6, -0.1, 0.0, 56, 0.25); return; }
    faceCam(son, 1.5, 0.2, 0.15, 56, 0.35); return;
  }
  if (S === 'street') {
    if (t < Lx(8).t0 - 0.1) { const k = easeOut(seg(t, T_STREET, T_STREET + 1.2)); faceCam(hoda, 2.4 - 0.4 * k, 0.6, 0.15, 60, 0.3); return; }
    if (t < Lx(9).t0 - 0.1) { faceCam(alamy, 2.6, -0.8, 0.2, 62, 0.25); return; }
    faceCam(shehata, 2.0, -0.6, 0.1, 60, 0.3); return;
  }
  if (S === 'kitchen') { faceCam(mom, 1.9, 0.5, 0.25, 58, 0.45); return; }
  if (t < Lx(12).t0 - 0.1) { faceCam(sayed, 1.6, 0.3, 0.05, 54, 0.25); return; }
  if (t < Lx(13).t0 - 0.1) { faceCam(samir, 1.6, -0.3, 0.05, 54, 0.25); return; }
  if (t < Lx(14).t0 - 0.1) { const k = easeInOut(seg(t, Lx(13).t0 - 0.1, Lx(13).t1)); cam(VL(V(SX - 2.6, 1.6, 4.6), V(SX + 2.8, 1.6, 4.6), k), VL(V(SX - 1.8, 1.2, 0), V(SX + 2.2, 1.2, 0), k), 56); return; }
  const k = easeInOut(seg(t, Lx(14).t0, DUR)); cam(VL(V(SX + 0.2, 1.6, 4.0), V(SX + 0.4, 2.4, 9.5), k), V(SX + 0.4, 1.15, 0), 58);
}
function particles(t) { emit([], starPool); emit([], puffPool); emit([], trailPool); emit([], sweatPool); }
function drawPlace(g, t) {
  const tags = [[T_STREET, 'تاني يوم الصبح... قدام المستشفى'], [T_KIT, 'في البيت'], [T_VIG, 'بالليل... في الشارع']];
  for (const [a, s] of tags) { if (!inT(t, a, a + 2.4)) continue; const al = Math.min(1, (t - a) / 0.4, (a + 2.4 - t) / 0.4); g.save(); g.globalAlpha = al; g.fillStyle = 'rgba(0,0,0,0.55)'; g.fillRect(0, 60, W, 56); arText(g, s, W / 2, 62, 28, '#fff', 'center'); g.restore(); }
}
function drawCard(g, t) {
  if (t < T_CARD - 0.8) return; const k = easeInOut(seg(t, T_CARD - 0.8, T_CARD + 0.4));
  g.fillStyle = `rgba(0,0,0,${0.86 * k})`; g.fillRect(0, 0, W, H); if (t < T_CARD) return; const a = easeOut(seg(t, T_CARD, T_CARD + 1.0));
  g.save(); g.globalAlpha = a; g.translate(W / 2, 230);
  g.fillStyle = '#2a2a2a'; g.strokeStyle = '#888'; g.lineWidth = 2; g.beginPath(); g.moveTo(-10, 0); g.lineTo(-38, 90); g.lineTo(-20, 92); g.lineTo(0, 30); g.lineTo(20, 92); g.lineTo(38, 90); g.lineTo(10, 0); g.closePath(); g.fill(); g.stroke(); g.beginPath(); g.arc(0, -14, 22, 0, 7); g.fill(); g.stroke();
  arText(g, 'خالص العزاء', 0, 120, 44, '#ffffff', 'center', 'ReemKufi');
  arText(g, 'لأسر ضحايا حادث الطريق الدائري', 0, 180, 28, '#e8e8e8', 'center'); arText(g, 'بالوراق', 0, 218, 28, '#e8e8e8', 'center');
  arText(g, 'ربنا يرحمهم ويغفر لهم', 0, 290, 30, '#ffd890', 'center'); arText(g, 'ويشفي المصابين ويصبّر أهاليهم', 0, 330, 30, '#ffd890', 'center');
  arText(g, 'إنا لله وإنا إليه راجعون', 0, 410, 32, '#ffffff', 'center', 'ReemKufi');
  g.globalAlpha = a * easeOut(seg(t, T_CARD + 1.2, T_CARD + 2.0)); arText(g, 'اتبرّع بالدم... وسوق براحة', 0, 500, 26, '#9fd0ff', 'center');
  g.restore();
  if (t > DUR - 0.8) { g.fillStyle = `rgba(0,0,0,${clamp((t - DUR + 0.8) / 0.8)})`; g.fillRect(0, 0, W, H); }
}
window.renderFrame = function (t) {
  stateAt(t); shotAt(t); particles(t);
  renderer.render(scene, camera);
  ctx.clearRect(0, 0, W, H); ctx.filter = setAt(t) === 'street' ? 'saturate(0.8)' : 'saturate(0.55) brightness(0.92)'; ctx.drawImage(glCanvas, 0, 0); ctx.filter = 'none';
  h.clearRect(0, 0, W, H);
  if (t < T_CARD - 0.8) drawDialogueV(h, t);
  drawPlace(h, t); drawCard(h, t);
  ctx.drawImage(hud, 0, 0); vignette(ctx, 0.45);
  return true;
};
window.frameData = () => out.toDataURL('image/png');
window.DUR = DUR;
document.fonts.load('10px PS2P').then(() => document.fonts.load('20px Lalezar', 'ع')).then(() => document.fonts.load('700 20px ReemKufi', 'ع')).then(() => { drawSigns(); window.READY = true; });
