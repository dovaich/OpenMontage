// =====================================================================
// التكييف النووي — vertical 9:16 (all in the kitchen)
// =====================================================================
room.visible = false;
const T_RW = 5.45, T_HOOK = 6.05, T_REVEAL = 11.5, T_SIT = 21.4, T_COLD = 22.4, T_MOM = 27.0, T_ICE = 32.9, T_ANNO = 36.6;
// ---------- fridge door + fan (the Nuclear AC 3000) ----------
const FR = V(KX + 2.1, 0, -1.2);
const frDoor = new THREE.Group(); frDoor.position.set(KX + 1.71, 0.95, -0.84); scene.add(frDoor);
mesh(box(0.78, 1.88, 0.05), P(0xf4f4f4), 0.39, 0, 0, frDoor); mesh(box(0.04, 0.5, 0.05), P(0x888888), 0.7, 0.2, 0.05, frDoor);
const fridgeGlow = mesh(new THREE.PlaneGeometry(0.7, 1.7), new THREE.MeshBasicMaterial({ color: 0xd8f0ff }), KX + 2.1, 0.95, -0.849, scene);
for (let i = 0; i < 3; i++) mesh(box(0.68, 0.02, 0.5), P(0xe0f0ff), KX + 2.1, 0.45 + i * 0.5, -1.1, scene);
mesh(cyl(0.08, 0.08, 0.2, 8), M(0xffffff), KX + 1.95, 0.57, -1.0, scene); mesh(box(0.15, 0.15, 0.15), M(0xd8231b), KX + 2.25, 1.08, -1.0, scene);
const fan = new THREE.Group(); fan.position.set(KX + 1.45, 0, -0.25); fan.rotation.y = -Math.PI / 2 + 0.3; scene.add(fan);
mesh(cyl(0.18, 0.2, 0.05, 8), M(0x2a8a8a), 0, 0.03, 0, fan); mesh(cyl(0.03, 0.03, 0.75, 6), M(0x2a8a8a), 0, 0.4, 0, fan);
const fhead = new THREE.Group(); fhead.position.set(0, 0.85, 0); fan.add(fhead); mesh(new THREE.TorusGeometry(0.26, 0.015, 4, 14), M(0xdddddd), 0, 0, 0.04, fhead);
const blades = new THREE.Group(); fhead.add(blades); for (let k = 0; k < 3; k++) { const b = mesh(box(0.08, 0.22, 0.01), M(0x8fd0ff), 0, 0, 0, blades); b.position.set(Math.sin(k * 2.09) * 0.11, Math.cos(k * 2.09) * 0.11, 0); b.rotation.z = -k * 2.09; }
for (let i = 0; i < 2; i++) mesh(box(0.5, 0.03, 0.02), P(0xc9ccd1), 0, 0.3 + i * 0.2, 0.04, fan);
const nuke = txtTex(16, 16, '#ffd400', (g) => { g.fillStyle = '#111'; g.beginPath(); g.arc(8, 8, 2, 0, 7); g.fill(); for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(8, 8); g.arc(8, 8, 7, i * 2.09, i * 2.09 + 1.05); g.fill(); } });
mesh(new THREE.PlaneGeometry(0.14, 0.14), M(0xffffff, { map: nuke }), 0, 0.12, 0.13, fan);
const chair = new THREE.Group(); chair.position.set(KX + 0.45, 0, -0.2); scene.add(chair);
mesh(box(0.45, 0.05, 0.45), M(0x6a4220), 0, 0.46, 0, chair); mesh(box(0.06, 0.6, 0.45), M(0x6a4220), -0.22, 0.78, 0, chair); for (const [x, z] of [[-0.2, -0.2], [0.2, -0.2], [-0.2, 0.2], [0.2, 0.2]]) mesh(box(0.04, 0.46, 0.04), M(0x6a4220), x, 0.23, z, chair);
// icicles on Hamada's head + frost on the floor
const icicles = new THREE.Group(); son.head.add(icicles); for (let i = 0; i < 7; i++) { const c = mesh(new THREE.ConeGeometry(0.025, 0.12, 4), new THREE.MeshLambertMaterial({ color: 0xcfeaff }), -0.15 + i * 0.05, 0.08, 0.27, icicles); c.rotation.x = Math.PI; }
const frost = mesh(new THREE.CircleGeometry(1.6, 16), new THREE.MeshBasicMaterial({ color: 0xe8f6ff, transparent: true, opacity: 0 }), KX + 1.0, 0.005, -0.4, scene); frost.rotation.x = -Math.PI / 2;
// the bill + the ice block
const bill = mesh(new THREE.PlaneGeometry(0.22, 0.3), new THREE.MeshBasicMaterial({ color: 0xfaf6e8, side: THREE.DoubleSide }), 0, 0, 0, scene);
const iceBlock = mesh(box(0.3, 0.22, 0.22), new THREE.MeshPhongMaterial({ color: 0xbfe6ff, transparent: true, opacity: 0.8, shininess: 120 }), 0, 0, 0, scene);
const skinOrig = son.mats[0].color.clone();

function cold(t) { return t < T_RW + 0.6 || t >= T_COLD; }
function stateAt(t) {
  const c = cold(t);
  // ----- Hamada -----
  let sp = { ...POSE0 }, sr = 0;
  if (t < T_SIT) { son.root.position.set(KX - 0.4, 0, -0.2); sr = 0.3; sp = { ...POSE0, aLz: 0.8 + Math.sin(t * 3) * 0.2, aRx: 1.3, eR: 1.8, bend: 0.2, hx: 0.2 }; // fanning himself, melting
    if (inT(t, 14.5, 18.0)) { sp.aLz = 0.9; sp.aRx = 0; sp.eR = 0.2; sp.bend = 0; sp.hz = 0.15; } }
  else { son.root.position.set(KX + 0.45, 0, -0.2); sr = Math.PI / 2; sp = { ...POSE0, y: -0.36, lL: 1.45, lR: 1.45, aLx: 0.9, eL: 1.2, aRx: 0.9, eR: 1.2, aLz: 0.3, aRz: 0.3, hz: c ? Math.sin(t * 40) * 0.04 : 0 }; }
  if (t < T_RW + 0.6) { son.root.position.set(KX + 0.45, 0, -0.2); sr = Math.PI / 2; sp = { ...POSE0, y: -0.36, lL: 1.45, lR: 1.45, aLx: 1.2, eL: 1.8, aRx: 1.2, eR: 1.8, hz: Math.sin(t * 40) * 0.04 }; }
  son.root.rotation.set(0, sr, 0); applyPose(son, talkPose(sp, t, 'son', 0.4));
  son.mats[0].color.copy(c ? new THREE.Color(0x8ab0d8) : skinOrig); icicles.visible = c;
  let se = 'tired', sm = talkMouth(t, 'son', 'scream') || 'o';
  if (inT(t, 14.5, 18.0)) { se = 'flat'; } if (c) { se = 'wide'; sm = talkMouth(t, 'son', 'scream') || 'wobble'; }
  setFace(son, se, sm, {});
  // ----- Ibrahim -----
  let dp = { ...POSE0 }; dad.root.position.set(KX + 1.0, 0, 0.35); let dr = -0.3; if (inT(t, 22.9, T_MOM)) dad.root.position.set(KX + 1.6, 0, 1.3);
  if (inT(t, T_REVEAL - 0.4, 14.4)) { dp.aRx = 1.7; dp.aRz = 0.6; dp.eR = 0.2; dr = 0.4; }
  if (inT(t, 18.2, 22.2)) { dp.aLx = 1.2; dp.eL = 0.4; dp.aLz = 0.4; dr = -0.6; }
  if (t >= T_ICE) { dp.aLx = dp.aRx = 1.1; dp.eL = dp.eR = 0.8; dr = -0.5; }
  if (t < T_RW + 0.6) dad.root.visible = false; else dad.root.visible = true;
  dad.root.rotation.set(0, dr, 0); applyPose(dad, talkPose(dp, t, 'dad'));
  let de = 'smug', dm = talkMouth(t, 'dad', 'grin') || 'smile';
  if (inT(t, T_REVEAL - 0.4, 14.4)) de = 'sparkle'; if (inT(t, T_MOM, T_ICE)) { de = 'side'; dm = 'clench'; } if (t >= T_ICE) { de = 'smug'; dm = talkMouth(t, 'dad', 'grin') || 'grin'; }
  setFace(dad, de, dm, { stache: true });
  // ----- Om Hamada with the bill -----
  const momIn = t < T_RW + 0.6 || t >= T_MOM; mom.root.visible = momIn;
  if (momIn) { const k = t < T_RW + 0.6 ? 1 : easeOut(seg(t, T_MOM, T_MOM + 0.6)); mom.root.position.copy(VL(V(KX - 1.6, 0, 0.6), V(KX - 0.35, 0, 0.5), k)); mom.root.rotation.set(0, 0.5, 0);
    const p = { ...POSE0, aRx: 1.6, eR: 0.4, aRz: 0.2, aLz: 0.2 }; if (speakerAt(t) === 'mom' && envAt(t) > 0.5) { p.aLz = 2.2; p.eL = 0.3; } applyPose(mom, talkPose(p, t, 'mom', 0.2));
    setFace(mom, 'wide', talkMouth(t, 'mom', 'scream') || 'o', {});
    bill.visible = true; bill.position.copy(mom.arms[1].hand.getWorldPosition(V(0, 0, 0))).add(V(0, 0.18, 0.08)); bill.rotation.set(-0.2, 0.5, 0.1); } else bill.visible = false;
  iceBlock.visible = t >= T_ICE; if (iceBlock.visible) { const a = dad.arms[0].hand.getWorldPosition(V(0, 0, 0)), b = dad.arms[1].hand.getWorldPosition(V(0, 0, 0)); iceBlock.position.copy(a.add(b).multiplyScalar(0.5)).add(V(0, 0.05, 0.05)); iceBlock.rotation.set(0, -0.5, 0); }
  // ----- the machine -----
  const on = t >= T_REVEAL - 0.4 || t < T_RW + 0.6;
  frDoor.rotation.y = on ? -1.9 : 0; fridgeGlow.visible = on; blades.rotation.z = on ? -t * 30 : 0;
  frost.material.opacity = c ? 0.75 : 0;
  scene.fog = c ? new THREE.Fog(0xcfe6ff, 2.5, 9) : null;
  kitLight.intensity = 1.6; kitLight.color.setHex(c ? 0xcfe6ff : 0xffc890);
  ambient.color.setHex(c ? 0xb8d8ff : 0xffd8a8); ambient.intensity = 0.62; moon.intensity = 0.2; fill.intensity = 1.0; bathLight.intensity = 0; roomLight.intensity = 0;
}

function shotAt(t) {
  if (t < T_RW + 0.6) { const k = easeOut(seg(t, 0, 2)); cam(VL(V(KX + 0.2, 1.7, 2.6), V(KX - 0.1, 1.6, 2.1), k).add(shake(t, 0.015)), V(KX - 0.1, 1.2, 0.2), 64); return; }
  if (t < 9.9) { faceCam(son, 1.9, 0.3, 0.0, 58, 0.35); return; }
  if (t < 14.5) { const k = easeOut(seg(t, 9.9, T_REVEAL)); cam(VL(V(KX + 0.6, 1.6, 2.2), V(KX + 0.9, 1.6, 2.5), k), V(KX + 1.5, 1.1, -0.6), 64); return; }
  if (t < 18.2) { faceCam(son, 1.8, 0.3, 0.0, 58, 0.35); return; }
  if (t < 22.9) { cam(V(KX + 0.9, 1.5, 2.2), V(KX + 1.0, 0.9, -0.4), 64); return; }
  if (t < T_MOM) { const h = headOf(son); cam(h.clone().add(V(1.5, 0.2, 1.15)).add(shake(t, 0.01)), h.clone().add(V(0, -0.3, 0)), 58); return; }
  if (t < T_ICE) { faceCam(mom, 1.9, -0.35, 0.05, 60, 0.3); return; }
  if (t < T_ANNO) { faceCam(dad, 2.0, 0.4, 0.05, 60, 0.3); return; }
  const k = easeInOut(seg(t, T_ANNO, 43)); cam(VL(V(KX + 0.4, 1.6, 2.6), V(KX + 0.4, 2.0, 3.2), k), V(KX + 0.6, 1.1, -0.4), 68);
}
function particles(t) {
  const pf = [], sw = [];
  const c = cold(t);
  if (c || t >= T_REVEAL) { const n = c ? 18 : 6; for (let i = 0; i < n; i++) { const k = (t * 0.7 + i / n) % 1; pf.push({ pos: V(KX + 1.4 - k * 1.6, 0.6 + hash(i) * 1.4 - k * 0.3, -0.25 + (hash(i + 2) - .5) * 0.8), size: c ? 0.06 + hash(i) * 0.05 : 0.25 + k * 0.4, op: c ? 0.9 : 0.35 * (1 - k), color: c ? 0xffffff : 0xcfe6ff }); } }
  if (t >= T_RW + 0.6 && t < 9.9) { const h = headOf(son); for (let i = 0; i < 3; i++) { const k = (t * 1.2 + i / 3) % 1; sw.push({ pos: h.clone().add(V((i - 1) * 0.25, 0.15 - k * 0.45, 0.1)), size: 0.07, op: 1 - k }); } }
  emit(pf, puffPool); emit([], starPool); emit([], trailPool); emit(sw, sweatPool);
}
function drawBillUI(g, t) {
  const show = t < T_RW || inT(t, T_MOM + 0.6, T_ICE); if (!show) return; const a = t < T_RW ? 0.3 : T_MOM + 0.6;
  const k = easeBack(seg(t, a, a + 0.3)); g.save(); g.translate(W - 120, 330); g.rotate(0.06); g.scale(k, k);
  g.fillStyle = '#faf6e8'; g.fillRect(-95, -110, 190, 220); g.strokeStyle = '#999'; g.lineWidth = 2; g.strokeRect(-95, -110, 190, 220);
  arText(g, 'فاتورة الكهربا', 0, -104, 22, '#1f5fd8', 'center'); g.fillStyle = '#ccc'; for (let i = 0; i < 4; i++) g.fillRect(-75, -60 + i * 18, 150, 6);
  arText(g, '٥٠٠٠ جنيه', 0, 20, 40, '#d8231b', 'center'); pxText(g, 'PAY NOW!', 0, 80, 10, '#d8231b', 'center', false); g.restore();
}
function drawTemp(g, t) {
  if (!inT(t, T_RW + 0.6, 27.0)) return; const temp = t < T_SIT ? 45 : Math.round(lerp(45, -10, clamp((t - T_SIT) / 3)));
  g.save(); g.translate(W - 110, 300); g.fillStyle = 'rgba(0,0,0,0.65)'; g.fillRect(-90, -40, 180, 80); pxText(g, 'TEMP', -78, -30, 9, '#fff', 'left', false);
  pxText(g, `${temp}°C`, 0, -6, 22, temp > 30 ? '#ff5a2a' : temp > 0 ? '#ffe14a' : '#8fd0ff', 'center'); g.restore();
}

window.renderFrame = function (t) {
  stateAt(t); shotAt(t); particles(t);
  renderer.render(scene, camera);
  ctx.clearRect(0, 0, W, H); ctx.drawImage(glCanvas, 0, 0);
  h.clearRect(0, 0, W, H);
  if (t >= T_RW + 0.6 && t < T_SIT) { h.fillStyle = 'rgba(255,120,30,0.12)'; h.fillRect(0, 0, W, H); }
  drawHookV(h, t, T_HOOK, 9.6, 'لما الحر يضرب', '٤٥ درجة');
  drawInventionV(h, t, T_REVEAL, 14.4, 'التكييف النووي ٣٠٠٠', [['COOLING', 10, '#4aa8ff'], ['BILL', 10, '#ff5a4a']]);
  drawTemp(h, t); drawBillUI(h, t); drawRewind(h, t, T_RW, T_HOOK, 'قبلها بساعة...');
  drawDialogueV(h, t);
  drawEndV(h, t, T_ANNO + 0.1, 'ROOM TEMP: -10°C', 'الأوضة بقت فريزر', [['COLD', 'البرد: آخره', 38.2, '#4aa8ff'], ['BILL', 'الفاتورة: نووية', 40.2, '#ff5a4a']], DUR);
  ctx.drawImage(hud, 0, 0); vignette(ctx, 0.3);
  return true;
};
window.frameData = () => out.toDataURL('image/png');
window.DUR = DUR;
document.fonts.load('10px PS2P').then(() => document.fonts.load('20px Lalezar', 'ع')).then(() => document.fonts.load('700 20px ReemKufi', 'ع')).then(() => { window.READY = true; });
