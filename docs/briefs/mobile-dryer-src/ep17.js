// =====================================================================
// مجفف الموبايلات النووي — vertical 9:16
// =====================================================================
room.visible = true;
const T_RW = 2.15, T_HOOK = 2.7, T_DROP = 3.25, T_KIT = 6.0, T_REVEAL = 7.2, T_IN = 12.9, T_FIRE = 13.8, T_MOM = 15.6, T_GRAB = 17.3, T_DIN = 19.2, T_RING = 20.4, T_DIG = 22.8, T_SNIFF = 25.1, T_ANNO = 27.06;

// ---------- guests ----------
scene.add(samir.root); // Abu Samir comes down for dinner
const soad = makeChar({
  seed: 77, skin: 0xc8946a, hipY: 0.82, legX: 0.13, legColor: 0x5a3a7a, shoe: 0x222222, hand: 0xc8946a,
  torsoGeo: cyl(0.3, 0.4, 0.62, 7), torsoTex: null, torsoColor: 0x7a3a9a, torsoY: 0.31,
  skirt: cyl(0.4, 0.5, 0.55, 7), sleeve: true, sleeveColor: 0x7a3a9a, shoulderX: 0.36, shoulderY: 0.56, neckY: 0.62, headR: 0.29,
  build(head, torso, reg) { const sc = reg(M(0xe8a8d0)); const s = mesh(new THREE.SphereGeometry(0.32, 8, 5, 0, Math.PI * 2, 0, Math.PI * 0.55), sc, 0, 0.03, -0.03, head); s.rotation.x = -0.35; mesh(new THREE.IcosahedronGeometry(0.09, 0), sc, 0, -0.12, -0.3, head); mesh(box(0.06, 0.06, 0.02), reg(P(0xd4a62a)), 0.12, 0.45, 0.31, torso); return {}; }
}, scene);

// ---------- the Nuclear Phone Dryer 3000 (rice pot + hair dryer) ----------
const pot = new THREE.Group(); scene.add(pot);
mesh(cyl(0.22, 0.2, 0.26, 12), P(0xc8ced6, { shininess: 110 }), 0, 0.13, 0, pot);
const lid = mesh(cyl(0.23, 0.23, 0.03, 12), P(0xb8bec6, { shininess: 110 }), 0, 0.28, 0, pot); mesh(box(0.08, 0.04, 0.04), M(0x222222), 0, 0.31, 0, pot);
for (const sx of [-1, 1]) mesh(box(0.08, 0.03, 0.05), M(0x222222), sx * 0.25, 0.22, 0, pot);
const pdry = new THREE.Group(); pdry.position.set(0.24, 0.16, 0.06); pot.add(pdry); mesh(cyl(0.06, 0.07, 0.24, 8), P(0xff5fa8), 0, 0, 0, pdry).rotation.z = Math.PI / 2; mesh(box(0.05, 0.15, 0.05), P(0xff5fa8), 0.04, -0.1, 0, pdry);
for (let i = 0; i < 2; i++) mesh(box(0.46, 0.03, 0.02), P(0xc9ccd1), 0, 0.08 + i * 0.1, 0.205, pot).rotation.y = 0;
const nuke = txtTex(16, 16, '#ffd400', (g) => { g.fillStyle = '#111'; g.beginPath(); g.arc(8, 8, 2, 0, 7); g.fill(); for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(8, 8); g.arc(8, 8, 7, i * 2.09, i * 2.09 + 1.05); g.fill(); } });
mesh(new THREE.PlaneGeometry(0.12, 0.12), M(0xffffff, { map: nuke }), -0.06, 0.13, 0.215, pot);
const POT_STOVE = V(KX + 0.6, 0.95, -1.25);
// phone (Hamada's) + rice plate on the dinner table
const phone = new THREE.Group(); scene.add(phone);
mesh(box(0.08, 0.15, 0.012), P(0x222222), 0, 0, 0, phone); const phoneScr = mesh(new THREE.PlaneGeometry(0.07, 0.12), new THREE.MeshBasicMaterial({ color: 0x9fd0ff }), 0, 0, 0.0065, phone);
const grains = []; for (let i = 0; i < 8; i++) grains.push(mesh(box(0.012, 0.012, 0.03), M(0xf4f0e0), (hash(i) - .5) * 0.06, (hash(i + 3) - .5) * 0.12, 0.012, phone));
const tray = new THREE.Group(); scene.add(tray);
mesh(cyl(0.34, 0.32, 0.03, 14), P(0xd4b14a, { shininess: 90 }), 0, 0, 0, tray);
const riceMound = mesh(new THREE.SphereGeometry(0.27, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), M(0xf4ecd8), 0, 0.015, 0, tray); riceMound.scale.y = 0.6;
for (let i = 0; i < 10; i++) mesh(box(0.03, 0.01, 0.01), M(0x8a5a2b), Math.cos(i) * 0.15, 0.1 + hash(i) * 0.05, Math.sin(i * 1.7) * 0.15, tray); // vermicelli bits
const glowR = mesh(new THREE.CircleGeometry(0.08, 10), new THREE.MeshBasicMaterial({ color: 0x9fd0ff, transparent: true, opacity: 0 }), 0, 0.17, 0.05, tray); glowR.rotation.x = -Math.PI / 2 + 0.3;
const TRAY_P = V(0, 0.8, -1.2);

function where(t) { return t < T_RW + 0.5 ? 'dinner' : t < T_KIT ? 'bath' : t < T_DIN ? 'kitchen' : 'dinner'; }
function seat(c, x, z, r = 0) { c.root.position.set(x, 0, z); c.root.rotation.set(0, r, 0); return { ...POSE0, y: -0.36, lL: 1.45, lR: 1.45, aLx: 0.55, eL: 0.95, aRx: 0.55, eR: 0.95 }; }

function stateAt(t) {
  const W_ = where(t);
  const ringing = (t < T_RW + 0.5) || inT(t, T_RING - 0.2, T_DIG);
  // ----- guests + dad at the table -----
  const atTable = W_ === 'dinner';
  samir.root.visible = soad.root.visible = atTable;
  { const ps = seat(samir, -0.6, -1.92, 0.1); const pz = seat(soad, 0.0, -1.92, 0); if (ringing) { ps.aLz = pz.aLz = 1.0; ps.aRz = pz.aRz = 1.0; ps.y = pz.y = -0.3; }
    applyPose(samir, ps); applyPose(soad, pz);
    setFace(samir, ringing || t >= T_DIG ? 'wide' : 'smug', ringing ? 'o' : t >= T_SNIFF ? 'frown' : 'smile', { stache: true, stacheColor: '#eeeeee' });
    setFace(soad, ringing || t >= T_DIG ? 'wide' : 'default', ringing ? 'o' : 'smile', { blush: true }); }
  // ----- Ibrahim -----
  let dp = { ...POSE0 };
  if (W_ === 'dinner') { dp = seat(dad, 0.6, -1.92, -0.1); if (ringing) { dp.hx = 0.2; } }
  else if (W_ === 'kitchen') { dad.root.position.set(KX + 0.05, 0, -0.5); dad.root.rotation.set(0, 0.35, 0);
    if (inT(t, T_REVEAL - 0.2, 10.5)) { dp.aRx = 1.8; dp.aRz = 0.7; dp.eR = 0.2; } if (inT(t, 12.2, 15.1)) { dad.root.rotation.y = 1.0; dp.aRx = 1.2; dp.eR = 0.4; dp.bend = 0.2; }
    if (inT(t, T_MOM, T_DIN)) { dp.aLx = 1.0; dp.eL = 1.6; dp.aRx = 1.0; dp.eR = 1.6; dad.root.rotation.y = 0.9; } }
  dad.root.visible = W_ !== 'bath';
  applyPose(dad, talkPose(dp, t, 'dad'));
  let de = 'smug', dm = talkMouth(t, 'dad', 'grin') || 'smile';
  if (inT(t, T_REVEAL - 0.2, 10.5)) de = 'sparkle'; if (inT(t, T_FIRE, T_MOM)) { de = 'sparkle'; dm = 'grin'; } if (inT(t, T_MOM, T_DIN)) { de = 'side'; dm = 'clench'; } if (ringing && W_ === 'dinner') { de = 'wide'; dm = 'clench'; } if (t >= T_DIG) { de = 'sparkle'; dm = 'grin'; }
  setFace(dad, de, dm, { stache: true });
  // ----- Hamada -----
  let sp = { ...POSE0 };
  if (W_ === 'bath') { son.root.position.set(BX + 0.45, 0, -0.35); son.root.rotation.set(0, 0.35, 0); if (t < T_DROP) { sp.aRx = 1.0; sp.eR = 1.4; } else { sp.aLz = 2.2; sp.aRz = 2.2; sp.eL = sp.eR = 0.5; sp.bend = 0.2; } }
  else if (W_ === 'kitchen') { son.root.position.set(KX - 0.65, 0, -0.35); son.root.rotation.set(0, 0.35, 0); if (inT(t, 10.5, 12.1)) { sp.aLz = 0.9; sp.hz = 0.15; } }
  else { son.root.position.set(-0.95, 0, -0.55); son.root.rotation.set(0, 1.15, 0); if (t >= T_DIG) { sp.aRx = 1.5; sp.eR = 1.3; sp.aLz = t < T_SNIFF ? 2.2 : 0.3; } if (t >= T_SNIFF) { sp.aRx = 1.2; sp.eR = 2.0; sp.hx = 0.15; } }
  applyPose(son, talkPose(sp, t, 'son', 0.4));
  let se = 'wide', sm = talkMouth(t, 'son', 'scream') || 'o';
  if (W_ === 'bath' && t < T_DROP) { se = 'default'; sm = 'smile'; } if (inT(t, 10.5, 12.1)) se = 'flat'; if (inT(t, T_DIG, T_SNIFF)) { se = 'sparkle'; sm = talkMouth(t, 'son', 'grin') || 'grin'; } if (t >= T_SNIFF) { se = 'side'; sm = talkMouth(t, 'son') || 'frown'; }
  if (W_ === 'kitchen' && t < 10.5) { se = 'sad'; sm = 'frown'; }
  setFace(son, se, sm, {});
  // ----- Om Hamada -----
  const momIn = W_ === 'dinner' || t >= T_MOM; mom.root.visible = momIn;
  if (momIn) { let p = { ...POSE0 }, pos, r;
    if (W_ === 'kitchen') { const k = easeOut(seg(t, T_MOM, T_MOM + 0.6)); pos = VL(V(KX + 1.8, 0, 0.4), V(KX + 1.0, 0, -0.5), k); r = -0.6; if (t >= T_GRAB) { p.aLx = p.aRx = 1.2; p.eL = p.eR = 0.8; r = 0.3; } }
    else { pos = V(0.95, 0, -0.55); r = -1.15; if (ringing) { p.aLz = 2.3 + Math.sin(t * 9) * 0.2; p.aRz = 2.3; p.eL = p.eR = 0.3; } }
    mom.root.position.copy(pos); mom.root.rotation.set(0, r, 0); applyPose(mom, talkPose(p, t, 'mom', 0.3));
    setFace(mom, ringing ? 'wide' : W_ === 'kitchen' ? 'side' : t >= T_SNIFF ? 'angry' : 'default', talkMouth(t, 'mom', 'scream') || (ringing ? 'scream' : 'frown'), {}); }
  // ----- props -----
  pot.visible = W_ === 'kitchen';
  if (W_ === 'kitchen') { if (t >= T_GRAB) { const a = mom.arms[0].hand.getWorldPosition(V(0, 0, 0)), b = mom.arms[1].hand.getWorldPosition(V(0, 0, 0)); pot.position.copy(a.add(b).multiplyScalar(0.5)).add(V(0, -0.1, 0)); pot.rotation.set(0, 0.3, 0); }
    else { pot.position.copy(POT_STOVE); pot.rotation.set(0, -0.3, 0); }
    lid.position.y = inT(t, 12.5, T_IN + 0.3) ? 0.38 : 0.28; lid.rotation.z = inT(t, T_FIRE, T_GRAB) ? Math.sin(t * 25) * 0.08 : 0; }
  flames.forEach((f, i) => { const big = inT(t, T_FIRE, T_GRAB); f.visible = W_ === 'kitchen' && t >= 9.0 && t < T_GRAB; f.scale.set(big ? 2.2 : 1, (big ? 3.2 : 1) * (0.8 + 0.3 * Math.sin(t * 20 + i)), big ? 2.2 : 1); f.material.color.setHex(big ? (i % 2 ? 0xff9a1a : 0xffd400) : (i % 2 ? 0xff9a1a : 0x4a8aff)); });
  // phone: in Hamada's hand → falls into the toilet → into the pot → in the rice → Hamada's hand
  phone.visible = true; grains.forEach(g => g.visible = t >= T_DIG);
  if (W_ === 'bath') { if (t < T_DROP) { phone.position.copy(son.arms[1].hand.getWorldPosition(V(0, 0, 0))).add(V(0, 0.05, 0.06)); phone.rotation.set(0, 0.35, 0); }
    else { const a = Math.min(1, (t - T_DROP) / 0.35); const from = V(BX + 0.62, 1.1, -0.2), to = V(BX + 1.05, 0.38, -0.93); phone.position.copy(VL(from, to, a)); phone.rotation.set(a * 5, 0, a * 3); phone.visible = a < 1; } }
  else if (W_ === 'kitchen') { if (t < T_IN) { phone.position.copy(dad.arms[1].hand.getWorldPosition(V(0, 0, 0))).add(V(0, 0.05, 0.06)); phone.rotation.set(-0.3, 0, 0); phone.visible = t >= 11.8; } else phone.visible = false; }
  else { if (t >= T_DIG) { phone.position.copy(son.arms[1].hand.getWorldPosition(V(0, 0, 0))).add(V(0, 0.08, 0.05)); phone.rotation.set(0, 1.15, 0); } else phone.visible = false; }
  phoneScr.material.color.setHex(t >= T_DIG ? (Math.floor(t * 3) % 2 ? 0x3df05a : 0x9fd0ff) : 0x9fd0ff);
  tray.visible = W_ === 'dinner' && (t < T_RW + 0.5 || t >= T_DIN + 0.3);
  { const k = t >= T_DIN && t < T_DIN + 0.9 ? easeOut(seg(t, T_DIN, T_DIN + 0.9)) : 1; tray.position.copy(VL(V(0.8, 1.1, -0.7), TRAY_P, k)); const v = ringing ? Math.sin(t * 70) * 0.012 : 0; tray.position.x += v; tray.rotation.set(0, 0, ringing ? Math.sin(t * 55) * 0.02 : 0);
    glowR.material.opacity = ringing ? 0.6 + 0.4 * Math.sin(t * 18) : 0; riceMound.scale.y = t >= T_DIG && W_ === 'dinner' ? 0.45 : 0.6; }
  // ----- lights -----
  bathLight.intensity = W_ === 'bath' ? 1.6 : 0; kitLight.intensity = W_ === 'kitchen' ? 1.6 : 0; roomLight.position.set(0, 2.6, 0.2); roomLight.intensity = W_ === 'dinner' ? 1.7 : 0;
  ambient.color.setHex(0xfff0e0); ambient.intensity = 0.62; moon.intensity = 0.2; fill.intensity = 1.0; scene.fog = null;
}

function shotAt(t) {
  const W_ = where(t);
  if (W_ === 'dinner' && t < T_DIN) { cam(V(0.0, 1.55, 1.25).add(shake(t, 0.025)), V(0, 0.95, -1.35), 64); return; }
  if (W_ === 'bath') { const k = easeOut(seg(t, T_DROP, T_DROP + 0.3)); cam(VL(V(BX + 0.1, 1.55, 1.5), V(BX + 0.25, 1.4, 1.3), k), VL(headOf(son).add(V(0, -0.25, 0)), V(BX + 0.8, 0.8, -0.8), k * 0.5), 60); return; }
  if (t < 10.6) { const k = easeOut(seg(t, T_KIT, T_REVEAL)); cam(VL(V(KX - 0.2, 1.6, 1.7), V(KX + 0.1, 1.6, 1.5), k), V(KX + 0.4, 1.15, -0.9), 64); return; }
  if (t < 12.2) { faceCam(son, 1.8, 0.3, 0.0, 58, 0.35); return; }
  if (t < 15.5) { cam(V(KX + 1.0, 1.6, 0.45).add(shake(t, t > T_FIRE ? 0.02 : 0)), V(KX + 0.5, 1.05, -1.2), 60); return; }
  if (t < T_DIN) { faceCam(mom, 2.0, -0.35, 0.05, 60, 0.3); return; }
  if (t < T_RING - 0.2) { cam(V(0.0, 1.55, 1.25), V(0, 0.95, -1.35), 64); return; }
  if (t < T_DIG) { const k = easeOut(seg(t, T_RING - 0.2, T_RING + 0.6)); cam(VL(V(0.0, 1.55, 1.25), V(0.1, 1.45, 0.3), k).add(shake(t, 0.02)), VL(V(0, 0.95, -1.35), TRAY_P.clone().add(V(0, 0.1, 0)), k), 60); return; }
  if (t < T_ANNO) { faceCam(son, 1.9, 0.35, 0.05, 58, 0.35); return; }
  const k = easeInOut(seg(t, T_ANNO, 33)); cam(VL(V(0.0, 1.55, 1.25), V(0.0, 1.9, 1.6), k), V(0, 1.0, -1.35), 66);
}

function particles(t) {
  const st = [], pf = [];
  if (inT(t, T_DROP + 0.33, T_DROP + 1.2)) { const a = t - T_DROP - 0.33; for (let i = 0; i < 10; i++) pf.push({ pos: V(BX + 1.05 + Math.cos(i * 2.4) * a * 0.6, 0.45 + a * 1.2 - a * a * 2, -0.93 + Math.sin(i * 2.4) * a * 0.5), size: 0.08, op: 1 - a, color: 0x6ab8e0 }); }
  if (inT(t, T_FIRE, T_GRAB)) { for (let i = 0; i < 6; i++) { const k = (t * 0.8 + i / 6) % 1; pf.push({ pos: POT_STOVE.clone().add(V((hash(i) - .5) * 0.3, 0.35 + k * 0.9, 0)), size: 0.15 + k * 0.4, op: 0.6 * (1 - k), color: 0xdddddd }); } }
  const ringing = (t < T_RW + 0.5) || inT(t, T_RING - 0.2, T_DIG);
  if (ringing) { for (let i = 0; i < 6; i++) { const a = t * 6 + i; st.push({ pos: TRAY_P.clone().add(V(Math.cos(a) * 0.35, 0.25 + Math.sin(a * 1.3) * 0.08, Math.sin(a) * 0.2)), size: 0.06, color: 0x9fd0ff }); } }
  if (t >= T_SNIFF && t < T_ANNO) { const p = phone.position; for (let i = 0; i < 3; i++) { const k = (t * 1.2 + i / 3) % 1; pf.push({ pos: p.clone().add(V(Math.sin(k * 6 + i) * 0.05, k * 0.4, 0)), size: 0.06 + k * 0.1, op: 0.6 * (1 - k), color: 0xe8d8a0 }); } }
  emit(st, starPool); emit(pf, puffPool); emit([], trailPool); emit([], sweatPool);
}
function drawRing(g, t) {
  const ringing = (t < T_RW + 0.5) || inT(t, T_RING - 0.2, T_DIG); if (!ringing) return;
  const k = Math.floor(t * 6) % 2; g.save(); g.translate(W / 2, 330 + (k ? 3 : -3)); g.rotate(k ? 0.08 : -0.08);
  g.fillStyle = 'rgba(255,255,255,0.95)'; g.fillRect(-120, -34, 240, 68); g.strokeStyle = '#111'; g.lineWidth = 3; g.strokeRect(-120, -34, 240, 68);
  pxText(g, 'RING RING!', 0, -24, 14, '#d8231b', 'center', false); arText(g, 'ترن ترن!', 0, -6, 26, '#111', 'center'); g.restore();
}

window.renderFrame = function (t) {
  stateAt(t); shotAt(t); particles(t);
  renderer.render(scene, camera);
  ctx.clearRect(0, 0, W, H); ctx.drawImage(glCanvas, 0, 0);
  h.clearRect(0, 0, W, H);
  drawHookV(h, t, T_HOOK, 6.0, 'لما الموبايل', 'يقع في الحمام');
  drawInventionV(h, t, T_REVEAL, 10.5, 'مجفف الموبايلات النووي', [['DRYING', 7, '#3df05a'], ['FLAVOR', 9, '#ffd400']]);
  drawRing(h, t); drawRewind(h, t, T_RW, T_HOOK, 'قبلها بساعة...');
  drawDialogueV(h, t);
  drawEndV(h, t, T_ANNO + 0.1, 'PHONE STATUS: ALIVE', 'الموبايل عايش... والرز بيرن', [['BATTERY', 'البطارية: مليانة', 28.6, '#3df05a'], ['RICE SMELL', 'الريحة: رز بالشعرية', 30.4, '#ffd400']], DUR);
  ctx.drawImage(hud, 0, 0); vignette(ctx, 0.3);
  if (t >= T_FIRE && t < T_FIRE + 0.07) { ctx.fillStyle = 'rgba(255,200,120,0.5)'; ctx.fillRect(0, 0, W, H); }
  return true;
};
window.frameData = () => out.toDataURL('image/png');
window.DUR = DUR;
document.fonts.load('10px PS2P').then(() => document.fonts.load('20px Lalezar', 'ع')).then(() => document.fonts.load('700 20px ReemKufi', 'ع')).then(() => { window.READY = true; });
