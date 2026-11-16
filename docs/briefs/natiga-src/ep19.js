// =====================================================================
// موقع النتيجة — vertical 9:16 (living room, dining table)
// =====================================================================
room.visible = true;
const T_RW = 4.5, T_HOOK = 5.1, T_REVEAL = 10.3, T_FAN = 17.4, T_OK = 20.5, T_FIFTY = 22.9, T_MOM = 24.6, T_TV = 29.4, T_ANNO = 35.13;
// ---------- laptop on the table ----------
const lap = new THREE.Group(); lap.position.set(0, 0.8, -1.45); lap.rotation.y = Math.PI; scene.add(lap);
mesh(box(0.42, 0.025, 0.3), P(0x3a3a44), 0, 0, 0, lap);
const lid = new THREE.Group(); lid.position.set(0, 0.0125, -0.15); lap.add(lid); lid.rotation.x = -0.35; mesh(box(0.42, 0.28, 0.015), P(0x3a3a44), 0, 0.14, -0.008, lid);
const lapScr = mesh(new THREE.PlaneGeometry(0.38, 0.24), new THREE.MeshBasicMaterial({ color: 0xffffff }), 0, 0.14, 0.001, lid);
// ---------- the Nuclear Website Booster 3000: router tied to a stand fan ----------
const rig = new THREE.Group(); rig.position.set(0.95, 0, -0.75); rig.rotation.y = -0.6; scene.add(rig);
mesh(cyl(0.18, 0.2, 0.05, 8), M(0x2a8a8a), 0, 0.03, 0, rig); mesh(cyl(0.03, 0.03, 1.0, 6), M(0x2a8a8a), 0, 0.52, 0, rig);
const fhead = new THREE.Group(); fhead.position.set(0, 1.1, 0); rig.add(fhead); mesh(new THREE.TorusGeometry(0.26, 0.015, 4, 14), M(0xdddddd), 0, 0, 0.04, fhead);
const blades = new THREE.Group(); fhead.add(blades); for (let k = 0; k < 3; k++) { const b = mesh(box(0.08, 0.22, 0.01), M(0x8fd0ff), 0, 0, 0, blades); b.position.set(Math.sin(k * 2.09) * 0.11, Math.cos(k * 2.09) * 0.11, 0); b.rotation.z = -k * 2.09; }
const router = new THREE.Group(); router.position.set(0, 1.1, 0.16); rig.add(router);
mesh(box(0.3, 0.07, 0.2), P(0x222222), 0, 0, 0, router); for (const s of [-1, 1]) mesh(cyl(0.01, 0.01, 0.25, 4), P(0x222222), s * 0.1, 0.15, -0.05, router);
const leds = []; for (let i = 0; i < 4; i++) leds.push(mesh(box(0.03, 0.015, 0.01), new THREE.MeshBasicMaterial({ color: 0x3df05a }), -0.09 + i * 0.06, 0, 0.105, router));
for (let i = 0; i < 2; i++) mesh(box(0.34, 0.03, 0.02), P(0xc9ccd1), 0, -0.02 + i * 0.04, 0.12, router);
const nuke = txtTex(16, 16, '#ffd400', (g) => { g.fillStyle = '#111'; g.beginPath(); g.arc(8, 8, 2, 0, 7); g.fill(); for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(8, 8); g.arc(8, 8, 7, i * 2.09, i * 2.09 + 1.05); g.fill(); } });
mesh(new THREE.PlaneGeometry(0.14, 0.14), M(0xffffff, { map: nuke }), 0, 0.35, 0.08, rig);

function stateAt(t) {
  // ----- Hamada at the laptop (seated behind the table, facing the camera) -----
  son.root.position.set(0, 0, -1.92); son.root.rotation.set(0, 0, 0);
  let sp = { ...POSE0, y: -0.36, lL: 1.45, lR: 1.45, aLx: 0.6, eL: 1.0, aRx: 0.6, eR: 1.0 };
  if (inT(t, T_RW, 9.1)) { sp.aRx = 0.8 + (Math.floor(t * 4) % 2) * 0.15; }
  if (inT(t, 13.8, 15.9)) { sp.aLz = 0.9; sp.aLx = 0; sp.hz = 0.15; }
  if (inT(t, 17.8, T_OK)) { sp.aLx = sp.aRx = 0.7 + (Math.floor(t * 8) % 2) * 0.1; } // typing
  if (inT(t, T_OK, T_FIFTY)) { sp.aLz = 2.5; sp.aRz = 2.5; sp.eL = sp.eR = 0.3; sp.y = -0.25; }
  if (t >= T_FIFTY) { sp.hx = 0.35; sp.aLx = 0.9; sp.eL = 1.9; }
  applyPose(son, talkPose(sp, t, 'son', 0.3));
  let se = 'tired', sm = talkMouth(t, 'son', 'scream') || 'flat';
  if (inT(t, T_RW, 9.1)) se = 'wide'; if (inT(t, 13.8, 15.9)) se = 'flat'; if (inT(t, T_OK, T_FIFTY)) { se = 'sparkle'; sm = talkMouth(t, 'son', 'grin') || 'grin'; } if (t >= T_FIFTY) { se = 'sad'; sm = talkMouth(t, 'son') || 'wobble'; }
  if (t < T_RW + 0.6) { se = 'tears'; sm = 'wobble'; }
  setFace(son, se, sm, {});
  // ----- Ibrahim by the rig -----
  dad.root.position.set(0.55, 0, -0.35); dad.root.rotation.set(0, -0.35, 0);
  let dp = { ...POSE0 };
  if (inT(t, T_REVEAL - 0.4, 13.7)) { dp.aRx = 1.6; dp.aRz = 0.8; dp.eR = 0.2; dad.root.rotation.y = 0.2; }
  if (inT(t, 16.0, T_OK)) { dad.root.position.set(1.5, 0, -0.45); dad.root.rotation.y = -0.9; dp.aRx = 1.2; dp.eR = 0.3; }
  if (t >= T_TV - 0.2) { dp.aLx = 1.7; dp.aLz = 0.7; dp.eL = 0.1; dad.root.rotation.y = -0.6; }
  dad.root.visible = t >= T_RW + 0.6; applyPose(dad, talkPose(dp, t, 'dad'));
  let de = 'smug', dm = talkMouth(t, 'dad', 'grin') || 'smile';
  if (inT(t, T_REVEAL - 0.4, 13.7) || inT(t, T_FAN, T_FIFTY)) de = 'sparkle'; if (inT(t, T_MOM, T_TV)) { de = 'side'; dm = 'clench'; } if (t >= T_TV) { de = 'sparkle'; dm = talkMouth(t, 'dad', 'grin') || 'grin'; }
  setFace(dad, de, dm, { stache: true });
  // ----- Om Hamada -----
  const momIn = t < T_RW + 0.6 || t >= T_MOM; mom.root.visible = momIn;
  if (momIn) { const k = t < T_RW + 0.6 ? 1 : easeOut(seg(t, T_MOM, T_MOM + 0.6)); mom.root.position.copy(VL(V(-1.6, 0, 0.6), V(-0.75, 0, -0.35), k)); mom.root.rotation.set(0, 0.45, 0);
    const p = { ...POSE0, aLx: 1.5, eL: 0.1, aLz: 0.5, aRz: 0.3 }; if (speakerAt(t) === 'mom' && envAt(t) > 0.5) { p.aRz = 2.2; p.eR = 0.3; } if (t >= T_TV) { p.aLx = 0.6; p.eL = 1.6; p.aRx = 0.6; p.eR = 1.6; }
    applyPose(mom, talkPose(p, t, 'mom', 0.3)); setFace(mom, t >= T_TV ? 'flat' : 'angry', talkMouth(t, 'mom', 'scream') || 'frown', {}); }
  // ----- rig + screens -----
  const on = t >= T_FAN || t < T_RW + 0.6; blades.rotation.z = on ? -t * 35 : 0; rig.position.x = 0.95 + (on ? Math.sin(t * 50) * 0.006 : 0);
  leds.forEach((l, i) => l.material.color.setHex(on ? (Math.floor(t * 12 + i) % 2 ? 0x3df05a : 0xff3a2a) : 0x3df05a));
  lapScr.material.color.setHex(t < T_RW + 0.6 ? 0xff5040 : t < T_OK ? 0xf0f0f0 : t < T_FIFTY ? 0x3df05a : 0xffe14a);
  drawTVN(t);
  roomLight.position.set(0, 2.6, 0.5); roomLight.intensity = 1.6; ambient.color.setHex(0xfff0e0); ambient.intensity = 0.6; moon.intensity = 0.2; fill.intensity = 1.0;
  tvLight.intensity = t >= T_TV ? 3 : 0.8; tvLight.color.setHex(0xfff0c0); bathLight.intensity = 0; kitLight.intensity = 0;
}
function drawTVN(t) {
  const g = tvTex.userData.g, w = 128, h = 96; g.direction = 'rtl';
  if (t >= T_TV - 0.3 || t < T_RW + 0.6) { g.fillStyle = '#d8231b'; g.fillRect(0, 0, w, h); g.fillStyle = '#fff'; g.font = '14px Lalezar'; g.textAlign = 'center'; g.textBaseline = 'middle';
    if (t < T_RW + 0.6) { g.fillText('الموقع واقع', w / 2, 30); g.font = '22px Lalezar'; g.fillText('ERROR 503', w / 2, 62); }
    else { g.fillText('عاجل: نتيجة حمادة', w / 2, 22); g.font = '40px Lalezar'; g.fillStyle = Math.floor(t * 3) % 2 ? '#ffe14a' : '#fff'; g.fillText('٥٠٪', w / 2, 62); } }
  else { g.fillStyle = '#0a1a3a'; g.fillRect(0, 0, w, h); g.fillStyle = '#3a6ad8'; for (let i = 0; i < 6; i++) g.fillRect(10, 10 + i * 14, 40 + (i * 37) % 70, 6); }
  tvTex.needsUpdate = true;
}

function shotAt(t) {
  if (t < T_RW + 0.6) { cam(V(-0.3, 1.6, 1.4).add(shake(t, 0.02)), V(-0.2, 1.05, -1.4), 64); return; }
  if (t < 9.2) { faceCam(son, 1.6, 0.25, 0.05, 58, 0.25); return; }
  if (t < 13.8) { const k = easeOut(seg(t, 9.2, T_REVEAL)); cam(VL(V(0.6, 1.6, 1.5), V(0.75, 1.65, 1.75), k), V(0.85, 1.2, -0.6), 62); return; }
  if (t < 16.0) { faceCam(son, 1.5, 0.25, 0.05, 58, 0.25); return; }
  if (t < T_OK) { cam(V(0.75, 1.55, 1.0).add(shake(t, t > T_FAN ? 0.015 : 0)), V(0.8, 1.15, -0.8), 60); return; }
  if (t < T_MOM) { faceCam(son, 1.5, 0.25, 0.05, 58, 0.25); return; }
  if (t < T_TV) { faceCam(mom, 1.9, 0.35, 0.05, 60, 0.3); return; }
  if (t < T_ANNO) { const k = easeOut(seg(t, T_TV, T_TV + 1.2)); if (t < 31.4) cam(V(0.6, 1.6, 1.2), headOf(dad).add(V(0, -0.15, 0)), 60); else { const k2 = easeInOut(seg(t, 31.4, 32.4)); cam(VL(V(0.6, 1.6, 1.2), V(0.75, 1.35, -0.7), k2), VL(headOf(dad), V(-0.05, 1.0, -3.24), k2), 56); } return; }
  const k = easeInOut(seg(t, T_ANNO, 41)); cam(VL(V(0.2, 1.6, 1.6), V(0.2, 1.9, 2.4), k), V(0, 1.1, -2.0), 66);
}
function particles(t) {
  const st = [];
  if (t >= T_FAN && t < T_FIFTY || t < T_RW + 0.6) { const p = V(0.95, 1.1, -0.6); for (let i = 0; i < 8; i++) { const k = (t * 1.5 + i / 8) % 1; st.push({ pos: p.clone().add(V(-k * 1.0, Math.sin(i * 2 + t * 4) * 0.15, -k * 0.8)), size: 0.07, color: [0x5ab8ff, 0x3df05a, 0xffe14a][i % 3] }); } }
  emit(st, starPool); emit([], puffPool); emit([], trailPool); emit([], sweatPool);
}
function drawLaptopUI(g, t) {
  let mode = null; if (t < T_RW) mode = 'err'; else if (inT(t, 5.6, 9.2)) mode = 'load'; else if (inT(t, 17.8, T_OK)) mode = 'type'; else if (inT(t, T_OK, T_MOM)) mode = 'res'; else if (inT(t, T_MOM + 0.4, T_TV)) mode = 'crowd';
  if (!mode) return;
  g.save(); g.translate(W - 130, 330); g.fillStyle = '#222'; g.fillRect(-110, -80, 220, 150); g.fillStyle = '#f4f4f4'; g.fillRect(-102, -72, 204, 128);
  g.fillStyle = '#1f5fd8'; g.fillRect(-102, -72, 204, 24); arText(g, 'موقع النتيجة', 0, -74, 18, '#fff', 'center');
  if (mode === 'err') { arText(g, 'الموقع واقع', 0, -42, 24, '#d8231b', 'center'); pxText(g, 'ERROR 503', 0, 8, 12, '#d8231b', 'center', false); }
  if (mode === 'load') { const a = t * 6; g.strokeStyle = '#1f5fd8'; g.lineWidth = 6; g.beginPath(); g.arc(0, 0, 22, a, a + 4.5); g.stroke(); arText(g, 'جاري التحميل...', 0, 22, 16, '#333', 'center'); }
  if (mode === 'type') { arText(g, 'رقم الجلوس:', 80, -40, 18, '#333'); const s = '٤٥٦٧٨٩'; const n = Math.min(s.length, Math.floor((t - 17.8) * 3)); g.fillStyle = '#fff'; g.fillRect(-80, -12, 160, 30); g.strokeStyle = '#999'; g.lineWidth = 1; g.strokeRect(-80, -12, 160, 30); arText(g, s.slice(0, n), 0, -12, 22, '#111', 'center'); }
  if (mode === 'res') { if (t < T_FIFTY) { arText(g, 'اتفتح!', 0, -40, 30, '#1f9e5a', 'center'); } else { arText(g, 'المجموع:', 0, -44, 18, '#333', 'center'); arText(g, '٥٠٪', 0, -18, 40, '#d8231b', 'center'); } }
  if (mode === 'crowd') { arText(g, 'الموقع واقع', 0, -44, 20, '#d8231b', 'center'); arText(g, 'المستنيين: ٢ مليون', 0, -10, 18, '#333', 'center'); }
  g.restore();
}

window.renderFrame = function (t) {
  stateAt(t); shotAt(t); particles(t);
  renderer.render(scene, camera);
  ctx.clearRect(0, 0, W, H); ctx.drawImage(glCanvas, 0, 0);
  h.clearRect(0, 0, W, H);
  drawHookV(h, t, T_HOOK, 8.8, 'لما موقع النتيجة', 'يقع يوم النتيجة');
  drawInventionV(h, t, T_REVEAL, 13.7, 'مسرّع المواقع النووي', [['SPEED', 10, '#3df05a'], ['SERVER DAMAGE', 10, '#ff5a4a']]);
  drawLaptopUI(h, t); drawRewind(h, t, T_RW, T_HOOK, 'قبلها بنص ساعة...');
  drawDialogueV(h, t);
  drawEndV(h, t, T_ANNO + 0.1, 'SERVER: DOWN', 'الموقع وقع للمحافظة كلها', [['SERVER', 'السيرفر: واقع', 36.6, '#ff5a4a'], ['HAMADA', 'حمادة: ٥٠٪', 38.6, '#ffe14a']], DUR);
  ctx.drawImage(hud, 0, 0); vignette(ctx, 0.3);
  if (t >= T_FAN && t < T_FAN + 0.06) { ctx.fillStyle = 'rgba(200,230,255,0.5)'; ctx.fillRect(0, 0, W, H); }
  return true;
};
window.frameData = () => out.toDataURL('image/png');
window.DUR = DUR;
document.fonts.load('10px PS2P').then(() => document.fonts.load('20px Lalezar', 'ع')).then(() => document.fonts.load('700 20px ReemKufi', 'ع')).then(() => { window.READY = true; });
