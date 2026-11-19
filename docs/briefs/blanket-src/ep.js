// =====================================================================
// البطانية النووية — first winter cold, one blanket, Ibrahim's heated blanket. vertical 9:16
// linear, no cold open/rewind/hook. L02 son L03 dad L04 son L05 dad L06 son L07 mom L08 dad L09 anno
// =====================================================================
room.visible = true;
const Lx = (i) => LINES[i - 2]; // no cold open: story starts at Lx(2)
const T_RW = -10, T_HOOK = 0, T_UNDER = Lx(5).t1 - 0.3, T_FIRE = Lx(6).t0 - 0.3, T_GRAB = Lx(7).t0 - 0.3, T_ANNO = Lx(9).t0;
const lateDraw = [];
const quilt = canvasTex(16, 16, (g) => { g.fillStyle = '#d8a030'; g.fillRect(0, 0, 16, 16); g.fillStyle = '#b07818'; g.fillRect(0, 7, 16, 2); g.fillRect(7, 0, 2, 16); g.fillStyle = '#f0c860'; g.fillRect(2, 2, 3, 3); g.fillRect(10, 10, 3, 3); }, [3, 3]);
const plainQ = canvasTex(16, 16, (g) => { g.fillStyle = '#4a7ac8'; g.fillRect(0, 0, 16, 16); g.fillStyle = '#3a62a8'; for (let i = 0; i < 16; i += 4) g.fillRect(0, i, 16, 1); }, [3, 3]);
// ---------- floor mattress (Hamada) ----------
const MAT = V(-0.3, 0, -1.2);
mesh(box(1.0, 0.12, 1.9), M(0xffffff, { map: mattressTex }), MAT.x, 0.06, MAT.z, room);
mesh(box(0.5, 0.12, 0.3), M(0xf0f0f0), MAT.x, 0.16, MAT.z - 0.8, room);
// ---------- the Nuclear Blanket 3000 ----------
const nb = new THREE.Group(); scene.add(nb);
const nbBody = mesh(box(1.1, 0.12, 1.2), M(0xffffff, { map: quilt }), 0, 0, 0, nb);
const iron = new THREE.Group(); iron.position.set(-0.25, 0.12, 0.2); nb.add(iron); mesh(box(0.22, 0.08, 0.12), P(0x2f6fd8), 0, 0, 0, iron); mesh(new THREE.ConeGeometry(0.08, 0.14, 3), P(0xc0c0c0), 0.14, -0.02, 0, iron).rotation.z = -Math.PI / 2;
const dryer = new THREE.Group(); dryer.position.set(0.25, 0.12, -0.15); nb.add(dryer); mesh(cyl(0.05, 0.06, 0.2, 8), P(0xff5fa8), 0, 0, 0, dryer).rotation.z = Math.PI / 2; mesh(box(0.04, 0.12, 0.04), P(0xff5fa8), -0.04, -0.06, 0, dryer);
const kettle = new THREE.Group(); kettle.position.set(0.0, 0.16, 0.35); nb.add(kettle); mesh(cyl(0.08, 0.1, 0.18, 10), P(0xd8d8e0, { shininess: 100 }), 0, 0, 0, kettle); mesh(cyl(0.015, 0.02, 0.1, 5), P(0xd8d8e0), 0.1, 0.03, 0, kettle).rotation.z = -1.0;
for (let i = 0; i < 3; i++) mesh(box(1.12, 0.02, 0.05), P(0xc9ccd1), 0, 0.07, -0.4 + i * 0.4, nb);
const nuke = canvasTex(16, 16, (g) => { g.fillStyle = '#ffd400'; g.fillRect(0, 0, 16, 16); g.fillStyle = '#111'; g.beginPath(); g.arc(8, 8, 2, 0, 7); g.fill(); for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(8, 8); g.arc(8, 8, 7, i * 2.09, i * 2.09 + 1.05); g.fill(); } });
mesh(new THREE.PlaneGeometry(0.2, 0.2), M(0xffffff, { map: nuke }), -0.3, 0.065, -0.3, nb).rotation.x = -Math.PI / 2;
const glow = mesh(box(1.14, 0.13, 1.24), new THREE.MeshBasicMaterial({ color: 0xff4a10, transparent: true, opacity: 0 }), 0, 0, 0, nb);
const flamesNB = []; for (let i = 0; i < 8; i++) { const f = mesh(new THREE.ConeGeometry(0.07, 0.3, 5), new THREE.MeshBasicMaterial({ color: [0xffdd33, 0xff9a1a, 0xff5a10][i % 3] }), -0.45 + (i % 4) * 0.3, 0.2, -0.4 + Math.floor(i / 4) * 0.8, nb); flamesNB.push(f); }
const cable = new THREE.Line(new THREE.BufferGeometry().setFromPoints([V(0, 0, 0), V(0, 0, 0), V(0, 0, 0)]), new THREE.LineBasicMaterial({ color: 0x111111 })); scene.add(cable);
const SOCKET = V(1.6, 0.35, -3.97); mesh(box(0.14, 0.18, 0.03), P(0xf0f0f0), SOCKET.x, SOCKET.y, SOCKET.z, room);
// ---------- mom's cocoon (the old blanket), then the nuclear one ----------
const cocoon = mesh(cyl(0.48, 0.55, 1.15, 10), M(0xffffff, { map: plainQ }), 0, 0, 0, scene);
const cocoonNB = mesh(cyl(0.5, 0.57, 1.15, 10), M(0xffffff, { map: quilt }), 0, 0, 0, scene);
const SOFA_MOM = V(-1.0, 0, 1.75);
// thin sheet on Hamada before
const sheet = mesh(box(0.9, 0.03, 0.7), M(0xf4f4f4), 0, 0, 0, scene);

function stateAt(t) {
  const fire = t >= T_FIRE && t < T_GRAB + 0.4 || t < T_RW + 0.6;
  // Hamada sitting on the floor mattress
  son.root.visible = true; son.root.position.copy(MAT).add(V(0, 0.12, -0.25)); son.root.rotation.set(0, 0, 0);
  { const cold = inT(t, T_RW + 0.6, T_UNDER); let p = { ...POSE0, y: -0.5, lL: 1.45, lR: 1.45, aLx: 1.2, eL: 1.8, aRx: 1.2, eR: 1.8, hz: cold ? Math.sin(t * 40) * 0.04 : 0 };
    if (inT(t, Lx(4).t0, Lx(4).t1)) { p.aLz = 0.9; p.aLx = 0.2; }
    if (fire) { p = { ...POSE0, y: -0.3 + Math.abs(Math.sin(t * 10)) * 0.1, lL: 1.0, lR: 1.0, aLz: 2.5 + Math.sin(t * 12) * 0.3, aRz: 2.5 - Math.sin(t * 12) * 0.3 }; }
    if (t >= T_GRAB + 0.4) { p = { ...POSE0, y: -0.5, lL: 1.45, lR: 1.45, aLx: 1.2, eL: 1.8, aRx: 1.2, eR: 1.8, hz: Math.sin(t * 40) * 0.04 }; }
    applyPose(son, talkPose(p, t, 'son', 0.3));
    let se = 'tired', sm = talkMouth(t, 'son', 'scream') || 'wobble'; if (fire) { se = 'wide'; sm = talkMouth(t, 'son', 'scream') || 'scream'; } if (inT(t, T_UNDER, T_FIRE)) { se = 'sparkle'; sm = 'grin'; }
    setFace(son, se, sm, {}); son.mats[0].color.copy(fire ? new THREE.Color(0xe0603a) : inT(t, T_RW + 0.6, T_UNDER) || t >= T_GRAB + 0.4 ? new THREE.Color(0x9ab8d8) : son.mats[0].userData.orig); }
  sheet.visible = inT(t, T_RW + 0.6, T_UNDER) || t >= T_GRAB + 0.4; sheet.position.copy(MAT).add(V(0, 0.38, -0.05)); sheet.rotation.set(0.2, 0, 0);
  // the nuclear blanket
  nb.visible = t >= Lx(3).t0 - 0.2 || t < T_RW + 0.6;
  const onMom = t >= T_GRAB + 0.4;
  if (t < T_RW + 0.6 || t >= T_UNDER) { nb.position.copy(MAT).add(V(0, 0.42, 0.1)); nb.rotation.set(0.15, 0, 0); } else { nb.position.set(0.15, 0.85, -1.55); nb.rotation.set(1.0, 0.25, 0); }
  if (inT(t, T_GRAB, T_GRAB + 0.4)) { const k = easeInOut(seg(t, T_GRAB, T_GRAB + 0.4)); nb.position.copy(VL(MAT.clone().add(V(0, 0.42, 0.1)), V(0.6, 1.2, 0.3), k)); }
  nb.visible = nb.visible && !onMom;
  glow.material.opacity = fire ? 0.35 + 0.25 * Math.sin(t * 25) : (t >= T_UNDER ? 0.15 : 0);
  flamesNB.forEach((f, i) => { f.visible = fire; f.scale.y = 0.8 + 0.5 * Math.sin(t * 20 + i); });
  { const a = nb.visible ? V(0.4, 0.05, -0.5).applyMatrix4(nb.matrixWorld) : cocoonNB.position.clone().add(V(0.3, 0.3, 0)); cable.visible = t >= Lx(3).t0 - 0.2 || t < T_RW + 0.6; cable.geometry.setFromPoints([a, VL(a, SOCKET, 0.5).add(V(0, -0.3, 0)), SOCKET]); }
  // Om Hamada: cocooned on the sofa, then steals the nuclear blanket
  mom.root.visible = true;
  if (t < T_GRAB) { mom.root.position.copy(SOFA_MOM); mom.root.rotation.set(0, Math.PI, 0); applyPose(mom, { ...POSE0, y: -0.33, lL: 1.45, lR: 1.45, aLx: 0.8, eL: 1.6, aRx: 0.8, eR: 1.6, hz: 0.3 }); setFace(mom, 'closed', Math.floor(t * 1.4) % 2 ? 'o' : 'flat', {}); }
  else { const k = easeOut(seg(t, T_GRAB, T_GRAB + 0.5)); mom.root.position.copy(VL(SOFA_MOM, V(0.6, 0, -0.3), k)); mom.root.rotation.set(0, Math.PI + k * (Math.PI - 0.3), 0); applyPose(mom, talkPose({ ...POSE0, aLx: 0.9, eL: 1.7, aRx: 0.9, eR: 1.7, hz: onMom ? Math.sin(t * 2) * 0.08 : 0 }, t, 'mom', 0.2)); setFace(mom, onMom ? 'closed' : 'smug', talkMouth(t, 'mom') || 'smile', { blush: onMom }); }
  cocoon.visible = t < T_GRAB; cocoon.position.copy(mom.root.position).add(V(0, 0.38, 0));
  cocoonNB.visible = onMom; cocoonNB.position.copy(mom.root.position).add(V(0, 0.75, 0));
  // Ibrahim
  dad.root.visible = t >= T_RW + 0.6; dad.root.position.set(0.85, 0, -1.6); dad.root.rotation.set(0, -0.5, 0);
  { let p = { ...POSE0 }; if (inT(t, Lx(3).t0, Lx(3).t1)) { p.aRx = 1.6; p.aRz = 0.7; p.eR = 0.2; dad.root.rotation.y = -0.2; }
    if (inT(t, Lx(5).t0, Lx(5).t1)) { p.aRx = 1.1; p.eR = 0.3; p.aRz = 0.5; }
    if (t >= Lx(8).t0 - 0.3) { const k = easeIn(seg(t, Lx(8).t1, Lx(8).t1 + 1.5)); dad.root.position.copy(VL(V(0.85, 0, -1.6), V(4.2, 0, 1.0), k)); dad.root.rotation.y = k > 0 ? 1.0 : -0.7; p = { ...POSE0, aLx: 1.2, eL: 1.8, aRx: 1.2, eR: 1.8, bend: 0.2, lL: k > 0 ? Math.sin(t * 9) * 0.5 : 0, lR: k > 0 ? -Math.sin(t * 9) * 0.5 : 0 }; }
    applyPose(dad, talkPose(p, t, 'dad', 0.3));
    let de = 'smug', dm = talkMouth(t, 'dad', 'grin') || 'smile'; if (inT(t, Lx(3).t0, Lx(4).t0)) de = 'sparkle'; if (fire) { de = 'wide'; dm = 'o'; } if (t >= Lx(8).t0 - 0.3) { de = 'sad'; dm = talkMouth(t, 'dad') || 'frown'; }
    setFace(dad, de, dm, { stache: true }); }
  // night room, warm glow when burning
  roomLight.position.set(0, 2.8, 0.5); roomLight.intensity = 0.9; ambient.color.setHex(0x8090c8); ambient.intensity = 0.45; moon.intensity = 0.4; fill.intensity = 0.8;
  tvLight.intensity = fire ? 4 : 0; tvLight.color.setHex(0xff7a30); tvLight.position.copy(MAT).add(V(0, 1.0, 0.6));
  bathLight.intensity = 0; kitLight.intensity = 0;
}
function shotAt(t) {
  if (t < T_RW + 0.6) { faceCam(son, 2.0, 0.35, 0.15, 62, 0.45); camera.position.add(shake(t, 0.03)); return; }
  if (t < Lx(3).t0 - 0.1) { faceCam(son, 2.1 - 0.3 * easeOut(seg(t, 0, 2)), 0.3, 0.1, 60, 0.4); return; }
  if (t < Lx(4).t0 - 0.1) { const k = easeOut(seg(t, Lx(3).t0, Lx(3).t0 + 1.0)); cam(VL(V(0.3, 1.5, 1.0), V(0.35, 1.55, 1.6), k), V(0.5, 1.42, -1.5), 64); return; }
  if (t < Lx(5).t0 - 0.1) { faceCam(son, 1.8, 0.35, 0.1, 58, 0.4); return; }
  if (t < Lx(6).t0 - 0.1) { faceCam(dad, 1.8, -0.35, 0.05, 58, 0.3); return; }
  if (t < Lx(7).t0 - 0.1) { faceCam(son, 2.0, 0.3, 0.15, 62, 0.45); camera.position.add(shake(t, 0.03)); return; }
  if (t < Lx(8).t0 - 0.1) { faceCam(mom, 1.8, 0.35, 0.05, 58, 0.3); return; }
  if (t < T_ANNO) { faceCam(dad, 1.8, -0.35, 0.05, 58, 0.3); return; }
  const k = easeInOut(seg(t, T_ANNO, DUR - 3)); cam(VL(V(0.1, 1.6, 2.4), V(0.1, 2.1, 2.7), k), V(0.0, 0.9, -1.0), 68);
}
function particles(t) {
  const pf = [], st = [], sw = [];
  const fire = t >= T_FIRE && t < T_GRAB + 0.4 || t < T_RW + 0.6;
  if (fire) { const c = MAT.clone().add(V(0, 0.6, 0.1)); for (let i = 0; i < 12; i++) { const k = (t * 0.8 + i / 12) % 1; pf.push({ pos: c.clone().add(V((hash(i) - .5) * 1.0, k * 1.6, (hash(i + 4) - .5) * 0.8)), size: 0.2 + k * 0.5, op: 0.6 * (1 - k), color: 0x555555 }); } for (let i = 0; i < 8; i++) { const k = (t * 2 + i / 8) % 1; st.push({ pos: c.clone().add(V(Math.cos(i) * k * 0.6, k * 0.8, Math.sin(i) * k * 0.4)), size: 0.06 * (1 - k), color: 0xffa020 }); } }
  if (inT(t, T_RW + 0.6, T_UNDER) || t >= T_GRAB + 0.4) { const h = headOf(son); for (let i = 0; i < 2; i++) { const k = (t * 0.6 + i / 2) % 1; pf.push({ pos: h.clone().add(V(0.05, -0.05 + k * 0.25, 0.3 + k * 0.2)), size: 0.06 + k * 0.12, op: 0.5 * (1 - k), color: 0xffffff }); } }
  emit(st, starPool); emit(pf, puffPool); emit([], trailPool); emit(sw, sweatPool);
}
function drawTemp(g, t) {
  if (t < T_HOOK + 0.5 || t >= T_ANNO) return; const fire = t >= T_FIRE && t < T_GRAB + 0.4; const temp = t < T_UNDER ? 9 : fire ? Math.min(180, Math.round(30 + (t - T_FIRE) * 120)) : t >= T_GRAB + 0.4 ? 9 : 32;
  g.save(); g.translate(W - 110, 300); g.fillStyle = 'rgba(0,0,0,0.65)'; g.fillRect(-90, -40, 180, 80); arText(g, 'حرارة حمادة', 80, -40, 18, '#fff');
  pxText(g, `${temp}°C`, 0, -2, 22, temp > 60 ? (Math.floor(t * 6) % 2 ? '#ff2a2a' : '#ffe14a') : temp > 20 ? '#ffe14a' : '#8fd0ff', 'center'); g.restore();
}
function drawAsk(g, t) {
  if (t < T_ANNO + 0.3 || t >= DUR - 3.2) return; const k = easeBack(seg(t, T_ANNO + 0.3, T_ANNO + 0.6));
  g.save(); g.translate(W / 2, 130); g.scale(k, k); g.fillStyle = 'rgba(255,255,255,0.96)'; g.fillRect(-250, -50, 500, 100); g.fillStyle = '#d8231b'; g.fillRect(-250, 44, 500, 6);
  arText(g, 'مين في بيتكم', 0, -52, 32, '#111', 'center'); arText(g, 'بياخد البطانية كلها؟ 👇', 0, -10, 32, '#d8231b', 'center'); g.restore();
}
window.renderFrame = function (t) {
  stateAt(t); shotAt(t); particles(t);
  renderer.render(scene, camera);
  ctx.clearRect(0, 0, W, H); ctx.drawImage(glCanvas, 0, 0);
  h.clearRect(0, 0, W, H);
  drawInventionV(h, t, Lx(3).vox[Math.min(1, Lx(3).vox.length - 1)][0], Lx(4).t0, 'البطانية النووية ٣٠٠٠', [['HEAT', 10, '#ff5a2a'], ['SAFETY', 0, '#ff5a4a']]);
  drawTemp(h, t);
  drawDialogueV(h, t); drawAsk(h, t);
  drawEndV(h, t, T_ANNO + 0.1, 'BLANKET: STOLEN', 'البطانية بقت بتاعة أم حمادة', [['WINTER', 'الشتا: وصل', T_ANNO + 1.3, '#8fd0ff'], ['IBRAHIM', 'إبراهيم: البلكونة', T_ANNO + 2.6, '#ff5a4a']], DUR);
  ctx.drawImage(hud, 0, 0); vignette(ctx, 0.35);
  if (t >= T_FIRE && t < T_FIRE + 0.06) { ctx.fillStyle = 'rgba(255,180,80,0.6)'; ctx.fillRect(0, 0, W, H); }
  return true;
};
window.frameData = () => out.toDataURL('image/png');
window.DUR = DUR;
document.fonts.load('10px PS2P').then(() => document.fonts.load('20px Lalezar', 'ع')).then(() => document.fonts.load('700 20px ReemKufi', 'ع')).then(() => { lateDraw.forEach(f => f()); window.READY = true; });
