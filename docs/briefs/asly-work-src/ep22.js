// =====================================================================
// الأصلي بيشتغل — El-Asly wiring Abu Samir's car; Bestem's shout; the slipper. vertical 9:16
// line order: L01 asly(cold) L02 asly L03 bastam L04 asly L05 bastam L06 asly L07 bastam L08 alamy L09 anno
// =====================================================================
room.visible = false;
${GARAGE}
const G = -100; garage.position.x = G;
const lateDraw = [];
lateDraw.push(() => { const c = signT.image.getContext('2d'); c.fillStyle = '#d8231b'; c.fillRect(0, 0, 160, 32); c.fillStyle = '#fff'; c.fillRect(0, 0, 160, 3); c.fillRect(0, 29, 160, 3); c.font = '18px Lalezar'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.direction = 'rtl'; c.fillText('مركز العالمي لصيانة السيارات', 80, 16); signT.needsUpdate = true; });
${CREW}
const alamy = makeAlamy(scene);
const Lx = (i) => LINES[i - 1];
const T_RW = Lx(1).t1 + 0.15, T_HOOK = T_RW + 0.6, T_ZAP = Lx(3).t0 + 0.55, T_CHASE = Lx(6).t1 - 0.2, T_BONK = Lx(7).t1 - 0.1, T_ANNO = Lx(9).t0;

// ---------- Abu Samir's car, hood up (callback) ----------
const SC = makeSamirCar(scene); SC.g.position.set(G + 0.1, 0, -1.2); SC.g.rotation.y = -0.2; SC.hood.rotation.z = 1.15; lateDraw.push(SC.late);
const BAY = () => SC.bay.getWorldPosition(V(0, 0, 0)).add(V(0, 0.25, 0));
// props: tea glass, slipper, phone, barrel landing, light
const tea = mesh(cyl(0.04, 0.035, 0.11, 6), P(0xbf5a1a, { transparent: true, opacity: 0.85 }), 0, 0, 0, scene);
const slipper = new THREE.Group(); scene.add(slipper); mesh(box(0.12, 0.03, 0.3), M(0x2f6fd8), 0, 0, 0, slipper); mesh(box(0.13, 0.05, 0.04), M(0x1a3a8a), 0, 0.03, 0.05, slipper);
const phoneA = new THREE.Group(); scene.add(phoneA); mesh(box(0.08, 0.15, 0.012), P(0xc8c4e8, { shininess: 120 }), 0, 0, 0, phoneA); mesh(new THREE.CircleGeometry(0.012, 8), new THREE.MeshBasicMaterial({ color: 0xff2a2a }), 0.025, 0.06, -0.007, phoneA).rotation.y = Math.PI;
const BARREL = V(G - 4.2, 0, 2.6);
mesh(cyl(0.5, 0.5, 1.2, 14), M(0xe86a10), BARREL.x, 0.6, BARREL.z, scene); mesh(new THREE.TorusGeometry(0.5, 0.04, 4, 14), M(0x222222), BARREL.x, 1.2, BARREL.z, scene).rotation.x = Math.PI / 2; mesh(new THREE.TorusGeometry(0.5, 0.04, 4, 14), M(0x222222), BARREL.x, 0.4, BARREL.z, scene).rotation.x = Math.PI / 2; mesh(new THREE.CircleGeometry(0.47, 14), M(0x111111), BARREL.x, 1.19, BARREL.z, scene).rotation.x = -Math.PI / 2;
const garLight = new THREE.PointLight(0xfff6e8, 1.8, 14, 1.0); garLight.position.set(G + 0.5, 4.2, 1.5); scene.add(garLight);
const P_ASLY = V(G + 2.45, 0, -0.75), P_BAST0 = V(G - 2.6, 0, 1.9), P_BAST = V(G - 0.6, 0, 1.0), P_ALAMY = V(G + 2.7, 0, 2.2), P_GAZ = V(G - 2.4, 0.18, -1.4);

function chasePos(t) { // both run around the car (ellipse), Bestem ahead
  const a = (t - T_CHASE) * 2.6; const c = V(G + 0.1, 0, -1.2);
  const bp = c.clone().add(V(Math.cos(a) * 3.0, 0, Math.sin(a) * 2.0)), ap = c.clone().add(V(Math.cos(a - 0.9) * 3.0, 0, Math.sin(a - 0.9) * 2.0));
  return { bp, ap, ang: a };
}
function stateAt(t) {
  const chasing = inT(t, T_CHASE, T_BONK) || t < T_RW + 0.6;
  // ----- El-Asly -----
  let ap = { ...POSE0 }, apos = P_ASLY.clone(), arot = -Math.PI / 2 - 0.2;
  if (t < T_ZAP + 0.6 && t >= T_RW + 0.6) arot = -Math.PI / 2 + 0.75;
  if (t < T_ZAP && t >= T_RW + 0.6) { ap = { ...POSE0, bend: 0.45, aLx: 1.2, eL: 0.5, aRx: 1.2, eR: 0.5, hx: 0.25 }; }                       // careful wiring
  if (inT(t, T_ZAP, T_ZAP + 0.6)) { const j = Math.sin(t * 60); ap = { ...POSE0, aLz: 2.5 + j * 0.3, aRz: 2.5 - j * 0.3, y: Math.abs(j) * 0.08 }; }   // electrocuted
  if (inT(t, T_ZAP + 0.6, T_CHASE)) { arot = -Math.PI / 2 + 1.0; ap = { ...POSE0, aLz: 0.5, aRz: 0.5, eL: 1.2, eR: 1.2, bend: -0.05 }; if (t >= Lx(6).t0) { ap.aRx = 1.9; ap.eR = 0.2; ap.aLz = 0.9; } }
  if (chasing) { const c = chasePos(t < T_RW + 0.6 ? T_CHASE + t : t); apos = c.ap; arot = -c.ang + Math.PI; const ph = t * 13; ap = { ...POSE0, lL: Math.sin(ph) * 0.8, lR: -Math.sin(ph) * 0.8, aRx: 2.2, eR: 0.3, aLx: -Math.sin(ph) * 0.6, y: Math.abs(Math.sin(ph)) * 0.06 }; }
  if (t >= T_BONK) { const c = chasePos(T_BONK); apos = c.ap; arot = -c.ang + Math.PI; ap = { ...POSE0, aLz: 0.3, aRz: 0.3 }; if (t > T_ANNO) { ap.aLx = ap.aRx = 0.8; ap.eL = ap.eR = 1.0; ap.aLz = ap.aRz = 0.2 + Math.abs(Math.sin(t * 8)) * 0.2; } } // dusting hands
  asly.root.position.copy(apos); asly.root.rotation.set(0, arot, 0); applyPose(asly, talkPose(ap, t, 'asly', 0.3));
  const sooty = t >= T_ZAP;
  let ae = t < T_ZAP ? 'flat' : 'angry', am = talkMouth(t, 'asly', 'scream') || (t < T_ZAP ? 'flat' : 'clench');
  if (inT(t, T_ZAP, T_ZAP + 0.6)) { ae = 'x'; am = 'scream'; } if (t >= T_BONK + 0.3) { ae = 'smug'; am = 'smile'; }
  setFace(asly, ae, am, { stache: true, soot: sooty });
  asly.mats.forEach(m => { if (m.userData.orig) m.color.copy(m.userData.orig).multiplyScalar(sooty && t < T_BONK + 2 ? 0.6 : 1); });
  // ----- Bestem -----
  let bp = { ...POSE0 }, bpos, brot = 0.8;
  if (t < Lx(3).t0 - 0.4) { bpos = P_BAST0.clone(); bastam.root.visible = t < T_RW + 0.6; }
  else bastam.root.visible = true;
  if (inT(t, Lx(3).t0 - 0.4, T_CHASE)) { const k = easeOut(seg(t, Lx(3).t0 - 0.4, Lx(3).t0)); bpos = VL(P_BAST0, P_BAST, k); brot = 1.0;
    if (inT(t, Lx(3).t0, Lx(3).t1)) bp = { ...POSE0, aLx: 1.0, eL: 1.8, aLz: 0.2, aRz: 0.95, eR: 1.9, hx: -0.25 };
    if (t >= Lx(5).t0 - 0.3) { bp = { ...POSE0, aRx: 1.2, eR: 0.9 }; } }
  if (chasing) { const c = chasePos(t < T_RW + 0.6 ? T_CHASE + t : t); bpos = c.bp; brot = -c.ang + Math.PI; const ph = t * 14; bp = { ...POSE0, lL: Math.sin(ph) * 0.9, lR: -Math.sin(ph) * 0.9, aLz: 2.5 + Math.sin(ph) * 0.3, aRz: 2.5 - Math.sin(ph) * 0.3, y: Math.abs(Math.sin(ph)) * 0.08 }; bastam.root.visible = true; }
  if (t >= T_BONK) { // launched in an arc into the oil barrel, legs kicking out
    const a = clamp((t - T_BONK) / 1.1); const from = chasePos(T_BONK).bp; const top = BARREL.clone().add(V(0, 2.25, 0));
    bpos = VL(from, top, a).add(V(0, Math.sin(a * Math.PI) * 2.2, 0)); bastam.root.position.copy(bpos);
    bastam.root.rotation.set(a * Math.PI * 3, 0, 0); if (a >= 1) bastam.root.rotation.set(Math.PI, 0, 0);
    const w = Math.sin(t * 10) * 0.5; bp = { ...POSE0, lL: w, lR: -w, aLz: 2.4, aRz: 2.4 };
  } else { bastam.root.position.copy(bpos); bastam.root.rotation.set(0, brot, 0); }
  applyPose(bastam, talkPose(bp, t, 'bastam', 0.3));
  let be = 'wide', bm = talkMouth(t, 'bastam', 'scream') || 'o';
  if (inT(t, Lx(5).t0 - 0.3, Lx(6).t0)) { be = 'default'; bm = talkMouth(t, 'bastam') || 'smile'; } if (t >= T_BONK) { be = 'dizzy'; bm = 'wobble'; }
  setFace(bastam, be, bm, { fuzz: true });
  tea.visible = inT(t, Lx(3).t0 - 0.4, T_CHASE + 0.4); if (tea.visible) tea.position.copy(bastam.arms[1].hand.getWorldPosition(V(0, 0, 0))).add(V(0, 0.08, 0.04));
  // ----- the slipper -----
  slipper.visible = inT(t, Lx(6).t0, T_BONK + 0.05) || t < T_RW + 0.6;
  if (slipper.visible) { if (t < T_BONK - 0.45 || t < T_RW + 0.6) { slipper.position.copy(asly.arms[1].hand.getWorldPosition(V(0, 0, 0))).add(V(0, 0.1, 0)); slipper.rotation.set(0.5, 0, 0); }
    else { const a = clamp((t - (T_BONK - 0.45)) / 0.45); const from = asly.arms[1].hand.getWorldPosition(V(0, 0, 0)); const to = headOf(bastam); slipper.position.copy(VL(from, to, a)).add(V(0, Math.sin(a * Math.PI) * 0.6, 0)); slipper.rotation.set(t * 20, t * 14, 0); } }
  // ----- El-Gazzar asleep under the car (never wakes) -----
  gazzar.root.position.copy(P_GAZ); gazzar.root.rotation.set(-Math.PI / 2, 0.2, 0); applyPose(gazzar, { ...POSE0, aLz: 0.2, aRz: 0.2 }); setFace(gazzar, 'closed', Math.floor(t * 1.5) % 2 ? 'o' : 'flat', { fuzz: true });
  // ----- El-Alamy filming -----
  alamy.root.position.copy(P_ALAMY); alamy.root.rotation.set(0, -2.5, 0);
  applyPose(alamy, talkPose({ ...POSE0, aRx: 1.6, eR: 0.6, aRz: 0.2, aLz: 0.15 }, t, 'alamy', 0.2));
  phoneA.position.copy(alamy.arms[1].hand.getWorldPosition(V(0, 0, 0))).add(V(0, 0.1, 0)); phoneA.rotation.set(0, alamy.root.rotation.y, 0);
  setFace(alamy, 'smug', talkMouth(t, 'alamy') || 'smile', ALAMY_FACE);
  // ----- lights: blackout flicker at the zap -----
  const out = inT(t, T_ZAP, T_ZAP + 1.4); const fl = out ? (hash(Math.floor(t * 18)) > 0.65 ? 1.2 : 0.08) : 1.8;
  garLight.intensity = fl; ambient.color.setHex(0xfff4e0); ambient.intensity = out ? 0.25 : 0.7; moon.intensity = 0.2; fill.intensity = out ? 0.3 : 1.0;
  bathLight.intensity = 0; kitLight.intensity = 0; roomLight.intensity = 0; scene.background = new THREE.Color(0x8ec8ff);
  SC.wires.forEach((w, i) => { w.rotation.x = inT(t, T_ZAP, T_ZAP + 1) ? Math.sin(t * 40 + i) * 0.4 : 0; });
}

function shotAt(t) {
  if (t < T_RW + 0.6) { const h = headOf(asly); cam(h.clone().add(V(-1.4, 0.2, 1.6)).add(shake(t, 0.04)), h.clone().add(V(0, -0.3, 0)), 62); return; }
  if (t < Lx(3).t0 - 0.4) { faceCam(asly, 1.9, 0.6, 0.25, 62, 0.5); return; }
  if (t < T_ZAP) { faceCam(bastam, 1.9, 0.35, 0.05, 60, 0.3); return; }
  if (t < Lx(4).t0 - 0.1) { faceCam(asly, 2.6, 0.7, 0.3, 66, 0.4); camera.position.add(shake(t, 0.06)); return; }
  if (t < Lx(5).t0 - 0.1) { faceCam(asly, 1.7, 0.35, 0.05, 58, 0.3); return; }
  if (t < Lx(6).t0 - 0.1) { faceCam(bastam, 1.8, 0.35, 0.05, 60, 0.3); return; }
  if (t < T_CHASE) { faceCam(asly, 1.6, 0.3, 0.05, 60, 0.3); camera.position.add(shake(t, 0.035)); return; }
  if (t < T_BONK + 0.2) { cam(V(G + 0.1, 7.0, 5.6), V(G + 0.1, 0.0, -1.2), 74); return; }
  if (t < Lx(8).t0 - 0.1) { cam(V(G - 1.0, 2.6, 6.2), VL(bastam.root.position.clone().add(V(0, -0.2, 0)), BARREL.clone().add(V(0, 1.3, 0)), clamp((t - T_BONK) / 1.1) * 0.6), 66); return; }
  if (t < T_ANNO) { faceCam(alamy, 2.0, -0.45, 0.1, 60, 0.3); return; }
  const k = easeInOut(seg(t, T_ANNO, DUR - 3)); cam(VL(V(G - 1.8, 2.2, 5.0), V(G - 1.6, 3.0, 6.2), k), V(G - 2.2, 0.9, 0.4), 70);
}
function particles(t) {
  const st = [], pf = [];
  if (inT(t, T_ZAP - 0.05, T_ZAP + 0.9)) { const b = BAY(); for (let i = 0; i < 16; i++) { const k = ((t - T_ZAP) * 3 + i / 16) % 1; st.push({ pos: b.clone().add(V(Math.cos(i * 2.3) * k * 1.2, k * 1.2 - k * k * 1.0, Math.sin(i * 1.7) * k * 0.8)), size: 0.12 * (1 - k), color: i % 2 ? 0x9fd0ff : 0xffffff }); } }
  if (t >= T_ZAP && t < T_BONK + 1.5 || t < T_RW + 0.6) { const hd = headOf(asly); for (let i = 0; i < 4; i++) { const k = (t * 0.9 + i / 4) % 1; pf.push({ pos: hd.clone().add(V((hash(i) - .5) * 0.3, 0.3 + k * 0.8, 0)), size: 0.15 + k * 0.3, op: 0.6 * (1 - k), color: 0x666666 }); } }
  if (t >= T_BONK && t < T_BONK + 0.5) { const p = slipper.position; for (let i = 0; i < 10; i++) { const a = (t - T_BONK) * 4; st.push({ pos: p.clone().add(V(Math.cos(i) * a, Math.sin(i * 2) * a * 0.6, Math.sin(i) * a * 0.5)), size: 0.18, color: 0xffe14a }); } }
  if (t >= T_BONK + 1.1) { const p = BARREL.clone().add(V(0, 1.1, 0)); for (let i = 0; i < 4; i++) { const a = t * 4 + i * 1.57; st.push({ pos: p.clone().add(V(Math.cos(a) * 0.35, 0.1, Math.sin(a) * 0.35)), size: 0.12, color: 0xffe14a }); } }
  emit(st, starPool); emit(pf, puffPool); emit([], trailPool); emit([], sweatPool);
}
function drawRage(g, t) {
  if (!inT(t, T_ZAP + 0.6, T_BONK)) return; const k = clamp((t - T_ZAP - 0.6) / (T_CHASE - T_ZAP - 0.6));
  g.save(); g.translate(20, 230); g.fillStyle = 'rgba(0,0,0,0.65)'; g.fillRect(0, 0, 230, 54); arText(g, 'غضب الأصلي', 220, 0, 20, '#fff');
  g.fillStyle = '#333'; g.fillRect(10, 30, 210, 16); g.fillStyle = k > 0.8 ? (Math.floor(t * 8) % 2 ? '#ff2a2a' : '#ffe14a') : '#ff8a3a'; g.fillRect(10, 30, 210 * k, 16);
  pxText(g, 'RAGE', 12, 8, 9, '#ff5a4a', 'left', false); g.restore();
}
function drawKO(g, t) {
  if (!inT(t, T_BONK, T_BONK + 1.6)) return; const k = easeBack(seg(t, T_BONK, T_BONK + 0.25));
  g.save(); g.translate(W / 2, 260); g.rotate(-0.08); g.scale(k * 1.4, k * 1.4); pxText(g, 'K.O.!', 0, -30, 40, '#ffe14a', 'center'); arText(g, 'ضربة شبشب!', 0, 14, 34, '#fff', 'center'); g.restore();
}
function drawViews(g, t) {
  if (!inT(t, Lx(8).t0, T_ANNO)) return; const n = Math.floor(lerp(1200, 1000000, clamp((t - Lx(8).t0) / 2.6)));
  g.save(); g.translate(W - 130, 300); g.fillStyle = '#111'; g.fillRect(-100, -150, 200, 300); g.fillStyle = '#000'; g.fillRect(-90, -130, 180, 260);
  g.fillStyle = '#fe2c55'; g.fillRect(-90, 60, 180, 70); pxText(g, '▶ ' + n.toLocaleString('en-US'), 0, 76, 12, '#fff', 'center', false); arText(g, 'مشاهدة', 0, 92, 20, '#fff', 'center');
  g.fillStyle = '#2f6fd8'; g.fillRect(-20, -60, 40, 14); g.fillStyle = '#b07a50'; g.beginPath(); g.arc(0, -20, 18, 0, 7); g.fill(); g.fillStyle = '#d8231b'; g.beginPath(); g.arc(0, -26, 18, Math.PI, 0); g.fill();
  pxText(g, 'BONK', 0, -110, 14, '#ffe14a', 'center', false); g.restore();
}

window.renderFrame = function (t) {
  stateAt(t); shotAt(t); particles(t);
  renderer.render(scene, camera);
  ctx.clearRect(0, 0, W, H); ctx.drawImage(glCanvas, 0, 0);
  h.clearRect(0, 0, W, H);
  drawHookV(h, t, T_HOOK, T_HOOK + 3.4, 'لما حد يزعق', 'وإنت بتشتغل كهربا');
  drawRage(h, t); drawKO(h, t); drawViews(h, t); drawRewind(h, t, T_RW, T_HOOK, 'قبلها بدقيقة...');
  drawDialogueV(h, t);
  drawEndV(h, t, T_ANNO + 0.1, 'BESTEM: LAUNCHED', 'بستم طار... تاني', [['RAGE', 'الغضب: آخره', T_ANNO + 1.3, '#ff5a4a'], ['VIEWS', 'المشاهدات: مليون', T_ANNO + 2.9, '#3df05a']], DUR);
  ctx.drawImage(hud, 0, 0); vignette(ctx, 0.3);
  if (t >= T_ZAP && t < T_ZAP + 0.08) { ctx.fillStyle = 'rgba(200,230,255,0.8)'; ctx.fillRect(0, 0, W, H); }
  if (t >= T_BONK && t < T_BONK + 0.06) { ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.fillRect(0, 0, W, H); }
  return true;
};
window.frameData = () => out.toDataURL('image/png');
window.DUR = DUR;
document.fonts.load('10px PS2P').then(() => document.fonts.load('20px Lalezar', 'ع')).then(() => document.fonts.load('700 20px ReemKufi', 'ع')).then(() => { lateDraw.forEach(f => f()); window.READY = true; });
