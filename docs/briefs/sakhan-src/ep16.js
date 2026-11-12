// =====================================================================
// السخان النووي — vertical 9:16
// =====================================================================
room.visible = true;
const T_RW = 3.3, T_HOOK = 3.9, T_REVEAL = 9.9, T_TURBO = 19.35, T_SCALD = 20.2, T_SPA = 27.0, T_ANNO = 30.17;
// ---------- the Nuclear Water Heater 3000 ----------
const heater = new THREE.Group(); heater.position.set(BX + 1.0, 2.05, -1.25); scene.add(heater);
mesh(cyl(0.28, 0.28, 0.85, 12), P(0xf4f4f4, { shininess: 60 }), 0, 0, 0, heater);
mesh(new THREE.CircleGeometry(0.07, 10), M(0xffffff), 0.0, 0.1, 0.281, heater);
const needle = mesh(box(0.012, 0.06, 0.01), M(0xd8231b), 0, 0.12, 0.29, heater);
const heatGlow = mesh(cyl(0.285, 0.285, 0.86, 12, true), new THREE.MeshBasicMaterial({ color: 0xff3a10, transparent: true, opacity: 0, side: THREE.DoubleSide }), 0, 0, 0, heater);
const kettle = new THREE.Group(); kettle.position.set(-0.32, -0.55, 0.12); heater.add(kettle);
mesh(cyl(0.11, 0.13, 0.22, 10), P(0xd8d8e0, { shininess: 100 }), 0, 0, 0, kettle); mesh(cyl(0.02, 0.03, 0.14, 5), P(0xd8d8e0), 0.14, 0.04, 0, kettle).rotation.z = -1.0; mesh(box(0.04, 0.16, 0.04), M(0x222222), -0.13, 0.03, 0, kettle);
const dryer = new THREE.Group(); dryer.position.set(0.25, -0.5, 0.18); heater.add(dryer);
mesh(cyl(0.07, 0.08, 0.28, 8), P(0xff5fa8), 0, 0, 0, dryer).rotation.z = Math.PI / 2; mesh(box(0.06, 0.18, 0.06), P(0xff5fa8), -0.06, -0.12, 0, dryer);
mesh(cyl(0.2, 0.16, 0.05, 10), P(0x1d1d1f, { shininess: 80 }), 0, -0.48, 0.22, heater).rotation.x = 1.2; // pan
for (let i = 0; i < 3; i++) mesh(box(0.62, 0.04, 0.02), P(0xc9ccd1), 0, -0.2 - i * 0.16, 0.29, heater);
const turbo = mesh(box(0.14, 0.14, 0.06), new THREE.MeshBasicMaterial({ color: 0xd8231b }), BX + 0.55, 1.4, -1.45, scene);
const turboT = txtTex(32, 16, '#d8231b', (g) => { g.fillStyle = '#fff'; g.font = '8px PS2P'; g.textAlign = 'center'; g.fillText('TURBO', 16, 11); });
mesh(new THREE.PlaneGeometry(0.22, 0.11), new THREE.MeshBasicMaterial({ map: turboT }), BX + 0.55, 1.58, -1.47, scene);
for (const z of [-1.45]) mesh(cyl(0.025, 0.025, 1.6, 6), P(0xb8c0c8), BX + 0.1, 2.35, z, scene).rotation.z = Math.PI / 2; // pipe to the shower
// towel for Hamada
const towel = mesh(cyl(0.3, 0.32, 0.45, 8), M(0xf4f4f4), 0, -0.05, 0, son.hips);
const towelD = mesh(box(0.5, 0.05, 0.25), M(0xf0e8d8), 0, 0.58, 0.05, dad.torso); // towel over Ibrahim's shoulder
const skinOrig = son.mats[0].color.clone();

function steamAt(t) { return t < T_RW + 0.1 || t >= 23.4 ? 1 : t >= T_SCALD ? 0.7 : 0; }
function where(t) { return t < T_RW + 0.6 ? 'room' : t < 23.4 ? 'bath' : 'room'; }

function stateAt(t) {
  const W_ = where(t);
  // ----- Hamada -----
  let sp = { ...POSE0 }, sr = 0, spos;
  if (W_ === 'bath') {
    if (t < T_TURBO) { spos = V(BX - 0.05, 0, 0.25); sr = 0.15; sp = { ...POSE0, aLx: 1.2, eL: 1.8, aRx: 1.2, eR: 1.8, aLz: 0.2, aRz: 0.2, hz: Math.sin(t * 40) * 0.04 }; // hugging himself, shivering
      if (inT(t, 13.6, 16.5)) { sp.aLz = 0.9; sp.aLx = 0; sp.eL = 0.2; } }
    else { spos = V(BX - 0.25, 0, -0.35); sr = 0.2; const j = Math.sin(t * 12); sp = { ...POSE0, aLz: 2.5 + j * 0.3, aRz: 2.5 - j * 0.3, eL: 0.3, eR: 0.3, y: Math.abs(j) * 0.12, lL: j * 0.4, lR: -j * 0.4 }; }
  } else { spos = V(-0.4, 0, 0.6); sr = 0.25; sp = { ...POSE0, aLx: 0.9, eL: 1.5, aRx: 0.9, eR: 1.5, hz: Math.sin(t * 3) * 0.05 }; }
  if (W_ === 'bath' && t < T_SCALD) spos.x += Math.sin(t * 50) * 0.008;
  son.root.position.copy(spos); son.root.rotation.set(0, sr, 0); applyPose(son, talkPose(sp, t, 'son', 0.4));
  son.root.visible = !(t < T_RW + 0.6) && !inT(t, 23.4, T_SPA - 0.4);
  const red = t >= T_SCALD; const cold = W_ === 'bath' && t < T_TURBO;
  son.mats[0].color.copy(red ? new THREE.Color(0xe0503a) : cold ? new THREE.Color(0x8aa8c8) : skinOrig);
  towel.visible = t >= T_SCALD;
  let se = cold ? 'tired' : 'wide', sm = talkMouth(t, 'son', 'scream') || (cold ? 'wobble' : 'o');
  if (inT(t, 13.6, 16.5)) { se = 'flat'; } if (t >= T_SCALD) { se = t >= T_SPA ? 'dizzy' : 'x'; sm = talkMouth(t, 'son', 'scream') || 'wobble'; }
  setFace(son, se, sm, { blush: red });

  // ----- Ibrahim -----
  let dp = { ...POSE0 }, dr = -0.3, dpos;
  if (W_ === 'bath') { dpos = V(BX + 0.55, 0, -0.45); if (inT(t, 8.1, 13.5)) { dr = -0.2; if (t > T_REVEAL - 0.3) { dp.aLx = 1.9; dp.aLz = 0.5; dp.eL = 0.2; } }
    if (inT(t, 16.7, T_TURBO + 0.4)) { dr = 0.35; const k = easeIn(seg(t, 18.9, T_TURBO)); dp.aRx = 1.3 + 0.2 * k; dp.eR = 0.5; dp.aRz = 0.0; }
    if (t >= T_TURBO + 0.4) { dr = -0.2; dp.aLz = 0.4; dp.aRz = 0.4; } }
  else { dpos = V(0.55, 0, 0.45); dr = -0.15; if (t >= T_SPA) { dp.aLz = 0.9; dp.aLx = 0.4; dp.eL = 0.3; dp.aRz = 0.3; } }
  dad.root.position.copy(dpos); dad.root.rotation.set(0, dr, 0); applyPose(dad, talkPose(dp, t, 'dad'));
  dad.root.visible = !(t < T_RW + 0.6) && !inT(t, 23.4, T_SPA - 0.4);
  towelD.visible = t >= T_SPA - 0.4;
  let de = 'smug', dm = talkMouth(t, 'dad', 'grin') || 'smile';
  if (inT(t, T_REVEAL - 0.3, 13.6)) de = 'sparkle'; if (inT(t, 18.9, 20.2)) { de = 'sparkle'; dm = 'grin'; } if (inT(t, T_SCALD, 23.4)) { de = 'wide'; dm = 'clench'; }
  if (t >= T_SPA) { de = 'smug'; dm = talkMouth(t, 'dad', 'grin') || 'grin'; }
  setFace(dad, de, dm, { stache: true });

  // ----- Om Hamada -----
  const momIn = t < T_RW + 0.6 || t >= 23.4; mom.root.visible = momIn;
  if (momIn) { mom.root.position.set(t < T_RW + 0.6 || t < T_SPA - 0.4 ? 0.1 : 1.35, 0, t < T_SPA - 0.4 || t < T_RW + 0.6 ? 0.55 : 0.1); mom.root.rotation.set(0, t >= T_SPA - 0.4 && t > 5 ? -0.5 : 0, 0);
    const p = { ...POSE0, aLz: 0.6, aRz: 0.6, eL: 1.2, eR: 1.2, aLx: 0.3, aRx: 0.3 }; if (speakerAt(t) === 'mom') { p.aLz = 2.2 + Math.sin(t * 9) * 0.2; p.aRz = 2.2; p.eL = p.eR = 0.3; } if (t >= T_SPA) { p.aLx = 1.3; p.eL = 1.9; p.aRx = 1.3; p.eR = 1.9; p.aLz = p.aRz = 0.3; }
    applyPose(mom, talkPose(p, t, 'mom', 0.3)); setFace(mom, t >= T_SPA ? 'flat' : 'angry', talkMouth(t, 'mom', 'scream') || 'frown', {}); }

  // ----- the heater -----
  { const turboOn = t >= T_TURBO; const k = turboOn ? clamp((t - T_TURBO) / 0.8) : 0;
    heater.position.set(BX + 1.0 + (turboOn && t < 23.4 ? Math.sin(t * 60) * 0.015 : 0), 2.05, -1.25); heatGlow.material.opacity = turboOn ? 0.25 + 0.25 * Math.sin(t * 20) * k + 0.2 * k : 0;
    needle.rotation.z = turboOn ? -2.2 * k + Math.sin(t * 30) * 0.05 : 0.6; turbo.scale.z = inT(t, T_TURBO - 0.05, T_TURBO + 0.25) ? 0.4 : 1; }
  const s = steamAt(t); scene.fog = s > 0 ? new THREE.Fog(0xdfe6ee, 2.0, 7.5 + (1 - s) * 5) : null;
  bathLight.intensity = W_ === 'bath' ? 1.6 : 0; roomLight.position.set(0, 2.6, 1.0); roomLight.intensity = W_ === 'room' ? 1.6 : 0;
  ambient.color.setHex(0xfff0e0); ambient.intensity = 0.62; moon.intensity = 0.2; fill.intensity = 1.0;
  curtain.visible = true;
}

function shotAt(t) {
  if (t < T_RW + 0.6) { faceCam(mom, 2.1, 0.3, 0.05, 60, 0.35); camera.position.add(shake(t, 0.03)); return; }
  if (t < 8.1) { faceCam(son, 1.9, 0.3, 0.0, 58, 0.35); return; }
  if (t < 13.6) { const k = easeOut(seg(t, 8.1, T_REVEAL)); cam(VL(V(BX + 0.1, 1.55, 1.5), V(BX + 0.25, 1.7, 1.9), k), V(BX + 0.8, lerp(1.4, 1.6, k), -1.0), 64); return; }
  if (t < 16.6) { faceCam(son, 1.8, 0.3, 0.0, 58, 0.35); return; }
  if (t < T_TURBO) { faceCam(dad, 1.9, 0.45, 0.05, 60, 0.25); return; }
  if (t < T_SCALD) { cam(V(BX + 0.75, 1.75, 0.35).add(shake(t, 0.05)), V(BX + 0.95, 1.85, -1.25), 56); return; }
  if (t < 23.4) { faceCam(son, 2.1, 0.3, 0.05, 60, 0.3); camera.position.add(shake(t, 0.03)); return; }
  if (t < T_SPA - 0.4) { faceCam(mom, 2.0, 0.3, 0.05, 60, 0.35); return; }
  if (t < T_ANNO) { cam(V(0.1, 1.55, 2.75), V(0.15, 1.2, 0.3), 64); return; }
  const k = easeInOut(seg(t, T_ANNO, 36)); cam(VL(V(0.1, 1.6, 2.75), V(0.1, 2.0, 2.9), k), V(0.2, lerp(1.2, 1.6, k), 0.2), 68);
}

function particles(t) {
  const pf = [], st = [];
  const s = steamAt(t);
  if (s > 0) { const W_ = where(t); const c = W_ === 'bath' ? V(BX - 0.5, 1.0, -0.6) : V(0.2, 1.0, 0.4); for (let i = 0; i < 14; i++) { const k = (t * 0.35 + i / 14) % 1; pf.push({ pos: c.clone().add(V((hash(i) - .5) * 3.2, k * 2.2, (hash(i + 5) - .5) * 2.4)), size: 0.6 + k * 1.2, op: 0.32 * s * (1 - k), color: 0xf4f8fc }); } }
  if (inT(t, T_TURBO, 23.4)) { const p = heater.position; for (let i = 0; i < 6; i++) { const k = (t * 3 + i / 6) % 1; st.push({ pos: p.clone().add(V(Math.cos(i * 2) * 0.4 * k, -0.3 + Math.sin(i * 3) * 0.4 * k, 0.3)), size: 0.1 * (1 - k), color: 0xffa040 }); } }
  emit(pf, puffPool); emit(st, starPool); emit([], trailPool); emit([], sweatPool);
}

function drawThermo(g, t) {
  if (!inT(t, T_TURBO, 23.4)) return; const k = clamp((t - T_TURBO) / 1.6);
  const x = 40, y = 230, hh = 300; g.fillStyle = 'rgba(0,0,0,0.6)'; g.fillRect(x - 14, y - 40, 76, hh + 90);
  pxText(g, 'TEMP', x - 6, y - 30, 9, '#fff', 'left', false); g.fillStyle = '#fff'; g.fillRect(x, y, 40, hh); g.fillStyle = '#ddd'; g.fillRect(x + 4, y + 4, 32, hh - 8);
  const lvl = (hh - 8) * k; const col = k < 0.4 ? '#4aa8ff' : k < 0.8 ? '#ff9a1a' : (Math.floor(t * 8) % 2 ? '#ff2a2a' : '#ffe14a'); g.fillStyle = col; g.fillRect(x + 4, y + hh - 4 - lvl, 32, lvl);
  g.beginPath(); g.arc(x + 20, y + hh + 18, 26, 0, 7); g.fill(); if (k >= 1) arText(g, 'بيغلي!', x + 20, y + hh + 2, 20, '#fff', 'center');
}
function drawSpa(g, t) {
  if (!inT(t, T_SPA + 0.6, T_ANNO)) return; const k = easeBack(seg(t, T_SPA + 0.6, T_SPA + 0.95));
  g.save(); g.translate(W / 2, 130); g.scale(k, k); g.fillStyle = '#1f9e5a'; g.fillRect(-200, -50, 400, 100); g.strokeStyle = '#ffe14a'; g.lineWidth = 4; g.strokeRect(-200, -50, 400, 100);
  arText(g, 'سبا إبراهيم', 0, -52, 44, '#fff', 'center'); arText(g, 'الدخول ٥٠ جنيه', 0, 0, 24, '#ffe14a', 'center'); g.restore();
}

window.renderFrame = function (t) {
  stateAt(t); shotAt(t); particles(t);
  renderer.render(scene, camera);
  ctx.clearRect(0, 0, W, H); ctx.drawImage(glCanvas, 0, 0);
  h.clearRect(0, 0, W, H);
  drawHookV(h, t, T_HOOK, 7.6, 'لما السخان يبوظ', 'في عز الشتا');
  drawInventionV(h, t, T_REVEAL, 13.5, 'السخان النووي ٣٠٠٠', [['HEAT', 10, '#ff5a2a'], ['SAFETY', 0, '#ff5a4a']]);
  drawThermo(h, t); drawSpa(h, t); drawRewind(h, t, T_RW, T_HOOK, 'قبلها بربع ساعة...');
  drawDialogueV(h, t);
  drawEndV(h, t, T_ANNO + 0.1, 'APARTMENT: SAUNA', 'الشقة بقت حمّام بخار', [['WATER TEMP', 'المية: بتغلي', 31.4, '#ff5a2a'], ['STEAM', 'البخار: آخره', 33.0, '#cfe0ff']], DUR);
  ctx.drawImage(hud, 0, 0); vignette(ctx, 0.3);
  if (t >= T_TURBO && t < T_TURBO + 0.07) { ctx.fillStyle = 'rgba(255,200,150,0.6)'; ctx.fillRect(0, 0, W, H); }
  return true;
};
window.frameData = () => out.toDataURL('image/png');
window.DUR = DUR;
document.fonts.load('10px PS2P').then(() => document.fonts.load('20px Lalezar', 'ع')).then(() => document.fonts.load('700 20px ReemKufi', 'ع')).then(() => { window.READY = true; });
