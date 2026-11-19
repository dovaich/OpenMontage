// =====================================================================
// الجمعة البيضاء — Ibrahim's deal-hunter buys everything (and a camel). vertical 9:16
// linear, no cold open/rewind/hook. L02 son L03 dad L04 son L05 dad L06 mom L07 dad L08 anno
// =====================================================================
room.visible = true;
const Lx = (i) => LINES[i - 2]; // no cold open: story starts at Lx(2)
const T_RW = -10, T_HOOK = 0, T_ON = Lx(3).t1 - 0.2, T_CAMEL = Lx(4).vox[Lx(4).vox.length - 1][0] - 0.1, T_ANNO = Lx(8).t0;
const lateDraw = [];

// ---------- the Nuclear Deal Hunter 3000: phone on a stand + a fan with a rubber glove "finger" tapping BUY ----------
const hunter = new THREE.Group(); hunter.position.set(0.9, 0, -2.3); hunter.rotation.y = -0.35; scene.add(hunter);
mesh(box(0.8, 0.7, 0.5), M(0x8a5a2b, { map: woodTex }), 0, 0.35, 0, hunter); // little table
const stand = new THREE.Group(); stand.position.set(0.15, 0.7, 0.05); hunter.add(stand);
mesh(box(0.06, 0.25, 0.06), M(0x333333), 0, 0.12, 0, stand);
const hPhone = mesh(box(0.2, 0.36, 0.02), P(0x111111), 0, 0.42, 0.02, stand); hPhone.rotation.x = -0.25;
const scrT = canvasTex(40, 72, () => { }); const hScr = mesh(new THREE.PlaneGeometry(0.18, 0.33), new THREE.MeshBasicMaterial({ map: scrT }), 0, 0.42, 0.035, stand); hScr.rotation.x = -0.25;
const fanH = new THREE.Group(); fanH.position.set(-0.22, 0.7, 0.05); hunter.add(fanH);
mesh(cyl(0.12, 0.14, 0.04, 8), M(0x2a8a8a), 0, 0.02, 0, fanH); mesh(cyl(0.025, 0.025, 0.35, 6), M(0x2a8a8a), 0, 0.2, 0, fanH);
const rotor = new THREE.Group(); rotor.position.set(0, 0.42, 0.05); rotor.rotation.y = Math.PI / 2; fanH.add(rotor);
for (let k = 0; k < 3; k++) { const b = mesh(box(0.05, 0.15, 0.01), M(0x8fd0ff), 0, 0.08, 0, rotor); b.position.set(Math.sin(k * 2.09) * 0.08, Math.cos(k * 2.09) * 0.08, 0); b.rotation.z = -k * 2.09; }
const finger = mesh(box(0.04, 0.16, 0.04), M(0xffd400), 0, 0.2, 0, rotor); // yellow kitchen glove finger
const nuke = canvasTex(16, 16, (g) => { g.fillStyle = '#ffd400'; g.fillRect(0, 0, 16, 16); g.fillStyle = '#111'; g.beginPath(); g.arc(8, 8, 2, 0, 7); g.fill(); for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(8, 8); g.arc(8, 8, 7, i * 2.09, i * 2.09 + 1.05); g.fill(); } });
mesh(new THREE.PlaneGeometry(0.18, 0.18), M(0xffffff, { map: nuke }), 0, 0.42, 0.252, hunter);
for (let i = 0; i < 2; i++) mesh(box(0.84, 0.03, 0.02), P(0xc9ccd1), 0, 0.5 + i * 0.12, 0.26, hunter);

// ---------- delivery boxes piling up ----------
const boxT = canvasTex(16, 16, (g) => { g.fillStyle = '#c89a5a'; g.fillRect(0, 0, 16, 16); g.fillStyle = '#a87a3a'; g.fillRect(7, 0, 2, 16); g.fillStyle = '#e8d8b0'; g.fillRect(2, 3, 4, 3); });
const boxes = []; { const r = rng(11);
  const spots = [];
  for (let i = 0; i < 70; i++) { const a = r() * 6.28, d = 0.5 + r() * 3.0; spots.push(V(Math.cos(a) * d * 1.2, 0, -0.9 + Math.sin(a) * d * 0.9)); }
  spots.forEach((p, i) => { const s = 0.3 + r() * 0.25; const b = mesh(box(s, s * 0.8, s), M(0xffffff, { map: boxT }), 0, 0, 0, scene); const stack = Math.floor(i / 35); b.position.set(Math.max(-4.1, Math.min(4.1, p.x)), s * 0.4 + stack * 0.45, Math.max(-3.7, Math.min(2.6, p.z))); b.rotation.y = r() * 3; boxes.push(b); }); }
// ring of boxes burying Om Hamada (cold open + L06)
const MOM_P = V(-0.2, 0, 0.2);
const bury = []; for (let i = 0; i < 14; i++) { const a = i / 14 * 6.28; const b = mesh(box(0.38, 0.32, 0.38), M(0xffffff, { map: boxT }), MOM_P.x + Math.cos(a) * 0.55, 0.16 + (i % 2) * 0.33, MOM_P.z + Math.sin(a) * 0.5, scene); b.rotation.y = a; bury.push(b); }
for (let i = 0; i < 8; i++) { const a = i / 8 * 6.28 + 0.3; bury.push(mesh(box(0.34, 0.3, 0.34), M(0xffffff, { map: boxT }), MOM_P.x + Math.cos(a) * 0.52, 0.66, MOM_P.z + Math.sin(a) * 0.48, scene)); }

// ---------- the camel ----------
const camel = new THREE.Group(); camel.position.set(-2.3, 0, -2.2); camel.rotation.y = 0.6; scene.add(camel);
{ const cm = M(0xc8a060), dk = M(0x8a6a3a);
  mesh(box(1.5, 0.6, 0.6), cm, 0, 1.25, 0, camel); mesh(new THREE.SphereGeometry(0.38, 8, 6), cm, -0.1, 1.6, 0, camel);
  const neck = mesh(box(0.22, 0.85, 0.22), cm, 0.78, 1.65, 0, camel); neck.rotation.z = -0.5;
  const hd = mesh(box(0.42, 0.22, 0.24), cm, 1.15, 2.05, 0, camel);
  for (const z of [-0.08, 0.08]) { mesh(box(0.04, 0.06, 0.02), M(0xffffff), 1.24, 2.11, z + (z > 0 ? 0.04 : -0.04), camel); mesh(box(0.02, 0.03, 0.02), M(0x111111), 1.26, 2.11, z + (z > 0 ? 0.055 : -0.055), camel); }
  mesh(box(0.1, 0.05, 0.2), dk, 1.38, 1.98, 0, camel);
  for (const [x, z] of [[-0.55, -0.22], [-0.55, 0.22], [0.55, -0.22], [0.55, 0.22]]) mesh(box(0.13, 0.95, 0.13), cm, x, 0.48, z, camel);
  const bow = M(0xd8231b); mesh(box(0.3, 0.12, 0.62), bow, 0.2, 1.4, 0, camel); // delivery ribbon
  const tag = canvasTex(48, 24, () => { }); lateDraw.push(() => { const g = tag.userData.g; g.fillStyle = '#fff'; g.fillRect(0, 0, 48, 24); g.fillStyle = '#d8231b'; g.font = '14px Lalezar'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.direction = 'rtl'; g.fillText('-٧٠٪', 24, 13); tag.needsUpdate = true; });
  mesh(new THREE.PlaneGeometry(0.3, 0.15), new THREE.MeshBasicMaterial({ map: tag, side: THREE.DoubleSide }), 0.2, 1.4, 0.32, camel); }
const camelHead = camel.children[3];

const phoneS = new THREE.Group(); son.arms[1].hand.add(phoneS); mesh(box(0.08, 0.15, 0.012), P(0x222222), 0, 0.02, 0.06, phoneS); mesh(new THREE.PlaneGeometry(0.07, 0.13), new THREE.MeshBasicMaterial({ color: 0x9fd0ff }), 0, 0.02, 0.0665, phoneS);
const bill = mesh(new THREE.PlaneGeometry(0.22, 0.42), new THREE.MeshBasicMaterial({ color: 0xfaf6e8, side: THREE.DoubleSide }), 0, 0, 0, scene);

function cartCount(t) { if (t < T_ON) return 0; return Math.min(999, Math.floor(Math.pow((t - T_ON) * 6, 1.35))); }
function boxesShown(t) { return t < T_RW + 0.6 || t >= Lx(6).t0 - 0.3 ? boxes.length : Math.min(boxes.length, Math.floor(Math.max(0, t - T_ON) * 5)); }
function buried(t) { return t < T_RW + 0.6 || t >= Lx(6).t0 - 0.3; }

function stateAt(t) {
  // boxes + camel
  const n = boxesShown(t); boxes.forEach((b, i) => b.visible = i < n);
  bury.forEach(b => b.visible = buried(t));
  camel.visible = t < T_RW + 0.6 || t >= T_CAMEL;
  camelHead.rotation.z = Math.sin(t * 1.3) * 0.12; camel.children[2].rotation.y = Math.sin(t * 0.7) * 0.1;
  // gadget
  const on = t >= T_ON || t < T_RW + 0.6; rotor.rotation.x = on ? -t * 14 : 0;
  { const g = scrT.userData.g; g.fillStyle = '#fff'; g.fillRect(0, 0, 40, 72); g.fillStyle = '#d8231b'; g.fillRect(0, 0, 40, 12); g.fillStyle = '#ffe14a'; g.fillRect(4, 18, 32, 18); g.fillStyle = '#1f9e5a'; g.fillRect(6, 52, 28, 12); scrT.needsUpdate = true; }
  // Om Hamada
  const momIn = buried(t); mom.root.visible = momIn;
  if (momIn) { mom.root.position.copy(MOM_P); mom.root.rotation.set(0, 0.1, 0); const p = { ...POSE0, aLz: 2.3 + Math.sin(t * 8) * 0.2, aRz: 2.3 - Math.sin(t * 8) * 0.2, eL: 0.4, eR: 0.4 }; applyPose(mom, talkPose(p, t, 'mom', 0.3)); setFace(mom, 'angry', talkMouth(t, 'mom', 'scream') || 'scream', {}); }
  // Hamada
  son.root.visible = t >= T_RW + 0.6 && !buried(t) || inT(t, Lx(6).t0 - 0.3, DUR) ;
  son.root.position.set(-1.2, 0, -0.7); son.root.rotation.set(0, 0.5, 0);
  { let p = { ...POSE0, aRx: 1.2, eR: 1.4 }; if (inT(t, Lx(2).t0, Lx(2).t1)) { p.aLz = 2.2 + Math.sin(t * 9) * 0.2; p.aRx = 1.6; p.eR = 0.4; }
    if (t >= T_CAMEL) { p.aLx = 1.2; p.eL = 0.3; p.aLz = 0.6; p.hy = 0.5; }
    applyPose(son, talkPose(p, t, 'son', 0.3));
    let se = 'sparkle', sm = talkMouth(t, 'son', 'grin') || 'grin'; if (inT(t, Lx(4).t0, DUR)) { se = 'wide'; sm = talkMouth(t, 'son', 'scream') || 'o'; } setFace(son, se, sm, {}); }
  // Ibrahim
  dad.root.visible = t >= T_RW + 0.6; dad.root.position.set(1.75, 0, -1.6); dad.root.rotation.set(0, -0.45, 0);
  { let p = { ...POSE0 }; if (inT(t, Lx(3).t0, Lx(3).t1)) { p.aLx = 1.4; p.aLz = 0.9; p.eL = 0.2; dad.root.rotation.y = -0.7; }
    if (inT(t, Lx(5).t0, Lx(5).t1)) { p.aLx = 1.1; p.aLz = 0.6; p.eL = 0.3; }
    if (t >= Lx(7).t0 - 0.2) { p.aRx = 0.8; p.eR = 1.0; p.aRz = 0.3; p.hx = 0.2; }
    applyPose(dad, talkPose(p, t, 'dad', 0.4));
    let de = 'smug', dm = talkMouth(t, 'dad', 'grin') || 'smile'; if (inT(t, Lx(3).t0, Lx(4).t0)) de = 'sparkle'; if (t >= Lx(6).t0 - 0.3) { de = 'side'; dm = talkMouth(t, 'dad') || 'clench'; }
    setFace(dad, de, dm, { stache: true }); }
  bill.visible = t >= Lx(7).t0 - 0.2 && t < T_ANNO + 6; if (bill.visible) { bill.position.copy(dad.arms[1].hand.getWorldPosition(V(0, 0, 0))).add(V(0.12, 0.05, 0.12)); bill.rotation.set(-0.3, -0.45, 0.05); }
  roomLight.position.set(0, 2.8, 1.0); roomLight.intensity = 1.7; ambient.color.setHex(0xfff0e0); ambient.intensity = 0.62; moon.intensity = 0.2; fill.intensity = 1.0; tvLight.intensity = 0;
  bathLight.intensity = 0; kitLight.intensity = 0;
}
function shotAt(t) {
  if (t < T_RW + 0.6) { cam(V(0.2, 1.75, 2.6).add(shake(t, 0.03)), V(-0.4, 1.1, -0.6), 66); return; }
  if (t < Lx(3).t0 - 0.1) { faceCam(son, 1.9, 0.35, 0.05, 58, 0.3); return; }
  if (t < Lx(4).t0 - 0.1) { const k = easeOut(seg(t, Lx(3).t0, Lx(3).t0 + 1.0)); cam(VL(V(0.8, 1.5, 0.9), V(0.7, 1.55, 1.5), k), V(1.25, 1.42, -1.9), 64); return; }
  if (t < T_CAMEL) { const k = easeInOut(seg(t, Lx(4).t0, T_CAMEL)); cam(VL(V(-0.3, 1.6, 1.3), V(-0.3, 1.9, 2.2), k), V(-0.6, 1.0, -1.2), 64); return; }
  if (t < Lx(5).t0 - 0.1) { const k = easeOut(seg(t, T_CAMEL, T_CAMEL + 0.4)); cam(V(-0.6, 1.6, 1.2).add(shake(t, t < T_CAMEL + 0.4 ? 0.03 : 0)), VL(V(-0.6, 1.0, -1.2), V(-2.0, 1.6, -2.2), k), 60); return; }
  if (t < Lx(6).t0 - 0.1) { const hd = headOf(dad); cam(hd.clone().add(V(-1.0, 0.1, 1.6)), VL(hd, V(-2.0, 1.7, -2.2), 0.25), 66); return; }
  if (t < Lx(7).t0 - 0.1) { faceCam(mom, 1.9, -0.3, 0.05, 60, 0.35); camera.position.add(shake(t, 0.02)); return; }
  if (t < T_ANNO) { faceCam(dad, 1.8, -0.35, 0.05, 58, 0.3); return; }
  const k = easeInOut(seg(t, T_ANNO, DUR - 3)); cam(VL(V(0.2, 1.8, 2.6), V(0.2, 2.4, 2.8), k), V(-0.4, 1.0, -1.2), 70);
}
function particles(t) {
  const st = [];
  if (t >= T_ON && t < Lx(6).t0) { const p = V(0.05, 0.42, 0.04).applyMatrix4(stand.matrixWorld); for (let i = 0; i < 5; i++) { const k = (t * 3 + i / 5) % 1; st.push({ pos: p.clone().add(V(Math.cos(i * 2) * k * 0.5, k * 0.6, 0.2)), size: 0.07 * (1 - k), color: 0x3df05a }); } }
  emit(st, starPool); emit([], puffPool); emit([], trailPool); emit([], sweatPool);
}
function drawShop(g, t) {
  if (!(inT(t, Lx(4).t0 - 0.1, Lx(6).t0 - 0.3))) return;
  const n = cartCount(t); g.save(); g.translate(112, 560); g.scale(0.9, 0.9);
  g.fillStyle = '#111'; g.fillRect(-95, -150, 190, 300); g.fillStyle = '#fff'; g.fillRect(-86, -134, 172, 268);
  g.fillStyle = '#d8231b'; g.fillRect(-86, -134, 172, 34); arText(g, 'الجمعة البيضاء', 0, -134, 22, '#fff', 'center');
  g.fillStyle = '#ffe14a'; g.fillRect(-76, -92, 152, 54); pxText(g, '-70%', 0, -84, 22, '#d8231b', 'center', false);
  arText(g, 'في السلة:', 70, -30, 20, '#111'); pxText(g, String(n), -60, -22, 18, n > 40 ? '#d8231b' : '#111', 'left', false);
  const items = ['تلاجة', 'خلاط ×٤٠', 'جمل 🐪']; const shown = t < Lx(4).t0 ? 0 : 1 + Math.floor((t - Lx(4).t0) / 1.1);
  items.slice(0, Math.min(3, shown)).forEach((s, i) => { g.fillStyle = i === 2 ? '#fff1c0' : '#f0f0f0'; g.fillRect(-76, 8 + i * 40, 152, 34); arText(g, '✓ ' + s, 66, 8 + i * 40, 20, i === 2 ? '#d8231b' : '#111'); });
  g.restore();
}
function drawBill(g, t) {
  if (!inT(t, Lx(7).vox[Lx(7).vox.length - 1][0] - 0.2, T_ANNO)) return; const k = easeBack(seg(t, Lx(7).vox[Lx(7).vox.length - 1][0] - 0.2, Lx(7).vox[Lx(7).vox.length - 1][0] + 0.1));
  g.save(); g.translate(W / 2, 200); g.rotate(-0.05); g.scale(k, k); g.fillStyle = '#faf6e8'; g.fillRect(-180, -70, 360, 140); g.strokeStyle = '#999'; g.lineWidth = 2; g.strokeRect(-180, -70, 360, 140);
  arText(g, 'الفاتورة', 0, -66, 24, '#1f5fd8', 'center'); arText(g, 'خصم: من مرتب إبراهيم', 0, -24, 26, '#d8231b', 'center'); g.restore();
}
function drawAsk(g, t) {
  if (t < T_ANNO + 0.3 || t >= DUR - 3.2) return; const k = easeBack(seg(t, T_ANNO + 0.3, T_ANNO + 0.6));
  g.save(); g.translate(W / 2, 130); g.scale(k, k); g.fillStyle = 'rgba(255,255,255,0.96)'; g.fillRect(-250, -50, 500, 100); g.fillStyle = '#d8231b'; g.fillRect(-250, 44, 500, 6);
  arText(g, 'إنت اشتريت إيه في', 0, -52, 32, '#111', 'center'); arText(g, 'الجمعة البيضاء؟ 👇', 0, -10, 34, '#d8231b', 'center'); g.restore();
}
window.renderFrame = function (t) {
  stateAt(t); shotAt(t); particles(t);
  renderer.render(scene, camera);
  ctx.clearRect(0, 0, W, H); ctx.drawImage(glCanvas, 0, 0);
  h.clearRect(0, 0, W, H);
  drawInventionV(h, t, Lx(3).vox[Math.min(1, Lx(3).vox.length - 1)][0], Lx(4).t0, 'صياد العروض النووي ٣٠٠٠', [['DISCOUNT', 10, '#3df05a'], ['WALLET', 0, '#ff5a4a']]);
  drawShop(h, t); drawBill(h, t);
  drawDialogueV(h, t); drawAsk(h, t);
  drawEndV(h, t, T_ANNO + 0.1, 'CAMELS OWNED: 1', 'عندنا جمل في الصالة', [['DISCOUNT', 'الخصم: ٧٠٪', T_ANNO + 1.3, '#3df05a'], ['SALARY', 'المرتب: راح', T_ANNO + 2.6, '#ff5a4a']], DUR);
  ctx.drawImage(hud, 0, 0); vignette(ctx, 0.3);
  if (t >= T_CAMEL && t < T_CAMEL + 0.06) { ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.fillRect(0, 0, W, H); }
  return true;
};
window.frameData = () => out.toDataURL('image/png');
window.DUR = DUR;
document.fonts.load('10px PS2P').then(() => document.fonts.load('20px Lalezar', 'ع')).then(() => document.fonts.load('700 20px ReemKufi', 'ع')).then(() => { lateDraw.forEach(f => f()); window.READY = true; });
