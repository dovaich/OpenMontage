// =====================================================================
// عربية أبو سمير — the service center, vertical 9:16
// line order: L01 samir(cold) L02 bastam L03 samir L04 asly L05 samir L06 gazzar L07 alamy L08 samir L09 bastam L10 anno
// =====================================================================
room.visible = false;
${GARAGE}
const G = -100; garage.position.x = G;
const lateDraw = [];
lateDraw.push(() => { const c = signT.image.getContext('2d'); c.fillStyle = '#d8231b'; c.fillRect(0, 0, 160, 32); c.fillStyle = '#fff'; c.fillRect(0, 0, 160, 3); c.fillRect(0, 29, 160, 3); c.font = '18px Lalezar'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.direction = 'rtl'; c.fillText('مركز العالمي لصيانة السيارات', 80, 16); signT.needsUpdate = true; });
${CREW}
const alamy = makeAlamy(scene);
scene.add(samir.root);
const Lx = (i) => LINES[i - 1];
const T_RW = Lx(1).t1 + 0.15, T_HOOK = T_RW + 0.6, T_ANNO = Lx(10).t0;

// ---------- Abu Samir's 1980 car (samir_car.js) ----------
const S_CAR = V(G + 0.1, 0, -1.0);
const SC = makeSamirCar(scene); const sCar = SC.g; sCar.position.copy(S_CAR); sCar.rotation.y = -0.2;
const carHood = SC.hood, engineBay = SC.bay, wires = SC.wires; lateDraw.push(SC.late);
const horn = new THREE.Group(); scene.add(horn); mesh(cyl(0.06, 0.12, 0.16, 10), P(0xd8d8d8, { shininess: 120 }), 0, 0, 0, horn).rotation.z = Math.PI / 2; mesh(box(0.05, 0.05, 0.05), M(0x222222), -0.1, 0, 0, horn);
const laptopA = new THREE.Group(); scene.add(laptopA);
mesh(box(0.42, 0.025, 0.3), P(0x3a3a44), 0, 0, 0, laptopA);
{ const lid = new THREE.Group(); lid.position.set(0, 0.0125, -0.15); laptopA.add(lid); lid.rotation.x = -0.35; mesh(box(0.42, 0.28, 0.015), P(0x3a3a44), 0, 0.14, -0.008, lid); mesh(new THREE.PlaneGeometry(0.38, 0.24), new THREE.MeshBasicMaterial({ color: 0xff6aa0 }), 0, 0.14, 0.001, lid); }
const cableA = new THREE.Line(new THREE.BufferGeometry().setFromPoints([V(0, 0, 0), V(0, 0, 0), V(0, 0, 0)]), new THREE.LineBasicMaterial({ color: 0x111111 })); scene.add(cableA);
const garLight = new THREE.PointLight(0xfff6e8, 1.8, 14, 1.0); garLight.position.set(G + 0.5, 4.2, 1.5); scene.add(garLight);
const caneS = mesh(cyl(0.015, 0.015, 0.9, 5), M(0x6a4220), 0, 0, 0, scene);

// positions (world)
const P_SAMIR = V(G - 0.7, 0, 0.75), P_BASTAM = V(G - 1.7, 0, 0.35), P_ASLY = V(G + 2.35, 0, 0.55), P_GAZ = V(G + 2.75, 0, -0.75), P_ALAMY = V(G + 1.0, 0, 1.25);

function stateAt(t) {
  const sp = speakerAt(t);
  // ----- Abu Samir -----
  samir.root.visible = true; samir.root.position.copy(P_SAMIR); samir.root.rotation.set(0, 0.5, 0);
  let mp = { ...POSE0, aLx: 0.5, eL: 0.4, aLz: 0.15 };
  const angry = t < T_RW + 0.6 || inT(t, Lx(8).t0 - 0.1, Lx(9).t0);
  if (angry) { mp = { ...POSE0, aLz: 2.3 + Math.sin(t * 9) * 0.25, eL: 0.3, aRz: 0.5, eR: 0.4, bend: 0.2 }; }
  if (inT(t, Lx(5).t0, Lx(5).t1 + 0.3)) { mp.aRx = 0.9; mp.eR = 1.9; mp.aRz = 0.2; mp.hx = -0.2; } // proud, hand on chest
  applyPose(samir, talkPose(mp, t, 'samir', 0.3));
  setFace(samir, angry ? 'angry' : inT(t, Lx(5).t0, Lx(5).t1 + 0.3) ? 'smug' : inT(t, Lx(3).t0, Lx(3).t1) ? 'sad' : 'tired', talkMouth(t, 'samir', 'scream') || (angry ? 'scream' : 'frown'), { stache: true, stacheColor: '#eeeeee' });
  { const hp = samir.arms[0].hand.getWorldPosition(V(0, 0, 0)); caneS.position.copy(hp).add(V(0, angry ? 0.3 : -0.4, 0)); caneS.rotation.set(0, 0, angry ? 0.3 + Math.sin(t * 9) * 0.3 : 0.05); }
  // ----- Bestem -----
  bastam.root.position.copy(P_BASTAM); bastam.root.rotation.set(0, 0.6, 0);
  let bp = { ...POSE0 };
  if (inT(t, Lx(2).t0 - 0.2, Lx(2).t1 + 0.2)) { bp = { ...POSE0, aLx: 1.0, eL: 1.8, aLz: 0.2, aRz: 0.95, eR: 1.9, hx: -0.25 }; bastam.root.rotation.y = 1.2; }
  const hornOut = t >= Lx(9).t0 - 0.3; if (hornOut) { bp.aRx = 1.4; bp.eR = 0.5; bp.aLz = 0.4; }
  applyPose(bastam, talkPose(bp, t, 'bastam', 0.4));
  setFace(bastam, hornOut ? 'sparkle' : 'wide', talkMouth(t, 'bastam', 'scream') || (hornOut ? 'grin' : 'o'), { fuzz: true });
  horn.visible = hornOut; if (hornOut) { horn.position.copy(bastam.arms[1].hand.getWorldPosition(V(0, 0, 0))).add(V(0, 0.08, 0.05)); horn.rotation.set(0, 0.6, 0.3); }
  // ----- El-Asly at the carHood -----
  asly.root.position.copy(inT(t, Lx(6).t0 - 0.3, Lx(7).t0) ? V(G + 2.7, 0, 1.7) : P_ASLY); asly.root.rotation.set(0, -2.5, 0);
  let ap = { ...POSE0, bend: 0.35, aLx: 1.0, eL: 0.6, aRx: 1.0, eR: 0.6 };
  if (inT(t, Lx(4).t0 - 0.1, Lx(5).t0)) { ap = { ...POSE0, bend: 0, aRx: 1.9, eR: 0.2, aLz: 0.8, eL: 1.2 }; asly.root.rotation.y = -0.6; asly.root.position.y = Math.abs(Math.sin(t * 9)) * 0.04; }
  applyPose(asly, talkPose(ap, t, 'asly', 0.3));
  setFace(asly, 'angry', talkMouth(t, 'asly', 'scream') || 'clench', { stache: true });
  // ----- El-Gazzar, ear on the engine -----
  gazzar.root.position.copy(P_GAZ); gazzar.root.rotation.set(0, -1.75, 0);
  const gp = { ...POSE0, bend: 0.75, y: -0.15, aLx: 0.9, eL: 0.5, aRz: 0.3, hz: 0.5 };
  if (inT(t, Lx(6).t0 - 0.2, Lx(6).t1 + 0.3)) { gp.bend = 0.4; gp.hz = 0.2; gazzar.root.rotation.y = -1.2; }
  applyPose(gazzar, talkPose(gp, t, 'gazzar', 0.2));
  setFace(gazzar, 'tired', talkMouth(t, 'gazzar') || 'smile', { fuzz: true });
  // ----- El-Alamy with the laptop (cable into the sCar) -----
  alamy.root.position.copy(P_ALAMY); alamy.root.rotation.set(0, 0.2, 0);
  applyPose(alamy, talkPose({ ...POSE0, aLx: 0.9, eL: 1.1, aRx: 0.9, eR: 1.1, hx: 0.1 }, t, 'alamy', 0.2));
  { const a = alamy.arms[0].hand.getWorldPosition(V(0, 0, 0)), b = alamy.arms[1].hand.getWorldPosition(V(0, 0, 0)); laptopA.position.copy(a.add(b).multiplyScalar(0.5)).add(V(0, -0.02, 0)); laptopA.rotation.set(0, alamy.root.rotation.y + Math.PI, 0);
    const e = engineBay.getWorldPosition(V(0, 0, 0)); cableA.geometry.setFromPoints([laptopA.position.clone(), VL(laptopA.position, e, 0.5).add(V(0, -0.5, 0)), e]); }
  setFace(alamy, 'smug', talkMouth(t, 'alamy') || 'smile', ALAMY_FACE);
  // ----- the sCar: carHood open, sobbing shake, horn missing at the end -----
  carHood.rotation.z = t >= Lx(2).t1 ? 1.15 : 0;
  const sob = inT(t, Lx(3).t0, Lx(4).t0) || inT(t, Lx(6).t0, Lx(7).t0);
  sCar.position.copy(S_CAR).add(V(0, sob ? Math.abs(Math.sin(t * 14)) * 0.025 : 0, 0)); sCar.rotation.z = sob ? Math.sin(t * 7) * 0.012 : 0;
  wires.forEach((w, i) => { w.rotation.x = inT(t, Lx(4).t0, Lx(5).t0) ? Math.sin(t * 30 + i) * 0.3 : 0; });
  ambient.color.setHex(0xfff4e0); ambient.intensity = 0.7; moon.intensity = 0.2; fill.intensity = 1.0; bathLight.intensity = 0; kitLight.intensity = 0; roomLight.intensity = 0;
  scene.background = new THREE.Color(0x8ec8ff);
}

function shotAt(t) {
  if (t < T_RW + 0.6) { faceCam(samir, 1.9, 0.3, 0.05, 60, 0.3); camera.position.add(shake(t, 0.03)); return; }
  if (t < Lx(3).t0 - 0.1) { const k = easeOut(seg(t, T_HOOK, Lx(2).t1)); cam(VL(V(G + 0.6, 4.2, 4.6), V(G + 0.5, 3.6, 4.0), k), V(G + 0.2, 0.5, -0.9), 66); return; }
  if (t < Lx(4).t0 - 0.1) { faceCam(samir, 1.9, -0.35, 0.05, 60, 0.3); return; }
  if (t < Lx(5).t0 - 0.1) { const h = headOf(asly); cam(h.clone().add(V(-0.4, 0.1, 1.9)).add(shake(t, 0.015)), h.clone().add(V(0, -0.35, 0)), 62); return; }
  if (t < Lx(6).t0 - 0.1) { faceCam(samir, 1.8, -0.35, 0.05, 60, 0.3); return; }
  if (t < Lx(7).t0 - 0.1) { const h = headOf(gazzar); cam(h.clone().add(V(0.3, 0.25, 1.7)), h.clone().add(V(0, -0.3, 0)), 60); return; }
  if (t < Lx(8).t0 - 0.1) { faceCam(alamy, 2.1, 0.45, 0.1, 60, 0.3); return; }
  if (t < Lx(9).t0 - 0.1) { faceCam(samir, 1.8, 0.35, 0.05, 60, 0.3); camera.position.add(shake(t, 0.02)); return; }
  if (t < T_ANNO) { faceCam(bastam, 2.0, 0.4, 0.05, 60, 0.3); return; }
  const k = easeInOut(seg(t, T_ANNO, DUR - 3)); cam(VL(V(G - 0.2, 1.9, 4.6), V(G - 0.2, 2.6, 5.6), k), V(G + 0.2, 1.1, 0.4), 70);
}
function particles(t) {
  const st = [], sw = [];
  if (inT(t, Lx(4).t0, Lx(5).t0)) { const e = engineBay.getWorldPosition(V(0, 0, 0)); for (let i = 0; i < 8; i++) { const k = (t * 3 + i / 8) % 1; st.push({ pos: e.clone().add(V(Math.cos(i * 2.3) * k * 0.6, 0.15 + k * 0.6, Math.sin(i * 1.7) * k * 0.4)), size: 0.1 * (1 - k), color: 0x9fd0ff }); } }
  const sob = inT(t, Lx(3).t0, Lx(4).t0) || inT(t, Lx(6).t0, Lx(7).t0);
  if (sob) { for (const z of [-0.35, 0.35]) { const lp = V(2.02, 0.68, z * 1.77).applyMatrix4(sCar.matrixWorld); for (let i = 0; i < 2; i++) { const k = (t * 1.4 + i * 0.5 + (z > 0 ? 0.25 : 0)) % 1; sw.push({ pos: lp.clone().add(V(0.05, -k * 0.4, 0)), size: 0.08, op: 1 - k }); } } }
  emit(st, starPool); emit([], puffPool); emit([], trailPool); emit(sw, sweatPool);
}
function drawDiag(g, t) {
  if (!inT(t, Lx(7).t0 + 0.2, Lx(8).t0 - 0.1)) return; const k = easeBack(seg(t, Lx(7).t0 + 0.2, Lx(7).t0 + 0.5));
  g.save(); g.translate(W / 2, 170); g.scale(k, k); g.fillStyle = '#111'; g.fillRect(-210, -90, 420, 180); g.fillStyle = '#0a1a3a'; g.fillRect(-200, -80, 400, 160);
  pxText(g, 'CAR DIAGNOSTIC', 0, -72, 11, '#3df05a', 'center', false);
  arText(g, 'الحالة: زعلانة', 0, -50, 26, '#ff8ab8', 'center'); arText(g, 'محتاجة: حب', 0, -16, 26, '#fff', 'center');
  if (t > Lx(7).t0 + 1.8) arText(g, '+ ٣٠٠٠ جنيه', 0, 22, 32, '#ffe14a', 'center'); g.restore();
}
function drawBill(g, t) {
  const show = t < T_RW || inT(t, Lx(8).t0, Lx(9).t0); if (!show) return; const a = t < T_RW ? 0.25 : Lx(8).t0;
  const k = easeBack(seg(t, a, a + 0.3)); g.save(); g.translate(W - 120, 320); g.rotate(0.06); g.scale(k, k);
  g.fillStyle = '#faf6e8'; g.fillRect(-95, -100, 190, 200); g.strokeStyle = '#999'; g.lineWidth = 2; g.strokeRect(-95, -100, 190, 200);
  arText(g, 'فاتورة الصيانة', 0, -94, 20, '#d8231b', 'center'); arText(g, 'حب: مجاني', 0, -56, 18, '#333', 'center'); arText(g, 'مصنعية: ٣٠٠٠', 0, -28, 18, '#333', 'center');
  g.fillStyle = '#d8231b'; g.fillRect(-80, 10, 160, 3); arText(g, '٣٠٠٠ جنيه', 0, 20, 36, '#d8231b', 'center'); g.restore();
}
window.renderFrame = function (t) {
  stateAt(t); shotAt(t); particles(t);
  renderer.render(scene, camera);
  ctx.clearRect(0, 0, W, H); ctx.drawImage(glCanvas, 0, 0);
  h.clearRect(0, 0, W, H);
  drawHookV(h, t, T_HOOK, T_HOOK + 3.4, 'لما تودّي العربية', 'الصيانة');
  drawDiag(h, t); drawBill(h, t); drawRewind(h, t, T_RW, T_HOOK, 'قبلها بساعة...');
  drawDialogueV(h, t);
  drawEndV(h, t, T_ANNO + 0.1, 'CAR STATUS: EMOTIONAL', 'العربية زعلانة... والفاتورة ٣٠٠٠', [['FEELINGS', 'المشاعر: مجروحة', T_ANNO + 1.4, '#ff8ab8'], ['BILL', 'الحساب: ٣٠٠٠', T_ANNO + 3.0, '#ff5a4a']], DUR);
  ctx.drawImage(hud, 0, 0); vignette(ctx, 0.3);
  return true;
};
window.frameData = () => out.toDataURL('image/png');
window.carSheet = (i) => { stateAt(1.0); samir.root.position.copy(sCar.position.clone().add(V(0.4, 0, 1.5))); samir.root.rotation.set(0, 0.3, 0); applyPose(samir, { ...POSE0, aLz: 0.15 }); bastam.root.visible = alamy.root.visible = asly.root.visible = gazzar.root.visible = false; carHood.rotation.z = 0; laptopA.visible = cableA.visible = false;
  const c = sCar.position.clone().add(V(0, 0.8, 0)); const views = [[V(4.2, 1.8, 4.2), 50], [V(-4.8, 1.6, 2.6), 50], [V(0.5, 1.6, 6.0), 48], [V(5.5, 3.2, -0.3), 46]]; const [o, f] = views[i];
  camera.aspect = W / H; cam(c.clone().add(o.applyAxisAngle(V(0, 1, 0), -0.2)), c, f); renderer.render(scene, camera); ctx.clearRect(0, 0, W, H); ctx.drawImage(glCanvas, 0, 0); return out.toDataURL('image/png'); };
window.DUR = DUR;
document.fonts.load('10px PS2P').then(() => document.fonts.load('20px Lalezar', 'ع')).then(() => document.fonts.load('700 20px ReemKufi', 'ع')).then(() => { lateDraw.forEach(f => f()); window.READY = true; });
