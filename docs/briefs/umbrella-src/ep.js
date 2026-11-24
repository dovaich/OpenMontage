// =====================================================================
// المظلة النووية — first rain, Hamada late for school, Ibrahim's umbDish + hair-dryer umbrella. vertical 9:16
// linear (no cold open / rewind / hook). L01 son L02 dad L03 son L04 dad L05 mom L06 son L07 mom L08 dad(حاضر) L09 dad(CTA) L10 anno
// =====================================================================
room.visible = false; balcony.visible = true;
laundry.forEach(c => c.visible = false); balcony.children.forEach(c => { if (Math.abs(c.position.z - 0.6) < 0.02 && c.position.y > 2.3) c.visible = false; });
const Lx = (i) => LINES[i - 1];
const lastVox = (i) => Lx(i).vox[Lx(i).vox.length - 1][0];
const T_GRAB = Lx(3).t0 - 0.2, T_LIFT = Lx(3).t0 + 0.9, T_THROW = Lx(5).t1 - 0.15, T_HIT = T_THROW + 0.45, T_LAND = T_HIT + 0.55,
  T_IN = Lx(7).t1 + 0.1, T_ANNO = Lx(10).t0;
const lateDraw = [];
// ---------- the Nuclear Umbrella 3000: upside-down satellite umbDish on a broom stick + pink hair dryer on top ----------
const umb = new THREE.Group(); scene.add(umb);
mesh(cyl(0.022, 0.022, 1.1, 6), M(0x8a5a2b), 0, 0.55, 0, umb);
const umbDish = mesh(new THREE.SphereGeometry(0.62, 12, 4, 0, Math.PI * 2, 0, 1.0), P(0xd8dce2, { side: THREE.DoubleSide, shininess: 80 }), 0, 0.72, 0, umb);
mesh(cyl(0.05, 0.05, 0.12, 6), M(0x555555), 0, 1.18, 0, umb);
const dryerU = new THREE.Group(); dryerU.position.set(0, 1.3, 0); umb.add(dryerU);
mesh(cyl(0.07, 0.08, 0.26, 8), P(0xff5fa8), 0, 0.06, 0, dryerU); mesh(box(0.05, 0.16, 0.05), P(0xff5fa8), 0.08, -0.06, 0, dryerU).rotation.z = 0.5;
const nukeU = canvasTex(16, 16, (g) => { g.fillStyle = '#ffd400'; g.fillRect(0, 0, 16, 16); g.fillStyle = '#111'; g.beginPath(); g.arc(8, 8, 2, 0, 7); g.fill(); for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(8, 8); g.arc(8, 8, 7, i * 2.09, i * 2.09 + 1.05); g.fill(); } });
const nukeS = mesh(new THREE.PlaneGeometry(0.18, 0.18), M(0xffffff, { map: nukeU, side: THREE.DoubleSide }), 0, 1.02, 0.36, umb); nukeS.rotation.x = -0.9;
for (let i = 0; i < 3; i++) mesh(box(0.5, 0.02, 0.04), P(0xc9ccd1), 0, 1.0 + i * 0.03, 0.2 - i * 0.2, umb).rotation.x = -0.6;
// wash basin (طشت) full of rain water
const BASIN = V(-1.35, 0, -0.35);
mesh(cyl(0.5, 0.42, 0.28, 12), P(0xa8aeb6, { shininess: 90 }), BASIN.x, 0.14, BASIN.z, balcony);
const water = mesh(cyl(0.47, 0.47, 0.02, 12), new THREE.MeshBasicMaterial({ color: 0x4a7ab8 }), BASIN.x, 0.24, BASIN.z, balcony);
// school bag
const bag = mesh(box(0.32, 0.4, 0.14), M(0x2f6fd8), 0, 0, 0, scene);
// slipper
const slip = new THREE.Group(); scene.add(slip); mesh(box(0.12, 0.03, 0.3), M(0x2f6fd8), 0, 0, 0, slip); mesh(box(0.13, 0.05, 0.04), M(0x1a3a8a), 0, 0.03, 0.05, slip);
// ---------- rain ----------
const NR = 420; const rainGeo = new THREE.BufferGeometry(); const rainPos = new Float32Array(NR * 6); rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPos, 3));
const rain = new THREE.LineSegments(rainGeo, new THREE.LineBasicMaterial({ color: 0xb8cce6, transparent: true, opacity: 0.55 })); scene.add(rain);
function rainAt(t) {
  for (let i = 0; i < NR; i++) { const x = -3.5 + hash(i) * 7, z = -1.2 + hash(i + 999) * 7, sp = 8 + hash(i + 77) * 3; const y = 4.5 - ((hash(i + 333) * 4.5 + t * sp) % 4.5);
    rainPos.set([x, y, z, x - 0.03, y + 0.28, z], i * 6); }
  rainGeo.attributes.position.needsUpdate = true;
}
// positions
const DAD0 = V(0.95, 0, -0.25), SON0 = V(-0.45, 0, -0.1), MOM0 = V(1.75, 0, -1.25), MOM1 = V(-0.15, 0, -0.6), DOOR = V(1.7, 0, -1.25);
function sonY(t) {
  if (t < T_LIFT) return 0;
  if (t < T_HIT) return Math.min(5.2, easeIn(seg(t, T_LIFT, T_LIFT + 2.6)) * 5.2) + Math.sin(t * 3) * 0.08;
  return 0;
}
function sonPos(t) {
  if (t < T_HIT) { const p = SON0.clone(); p.y = sonY(t); p.x += t >= T_LIFT ? Math.sin(t * 1.7) * 0.25 * seg(t, T_LIFT, T_LIFT + 1) : 0; return p; }
  const a = SON0.clone(); a.y = sonY(T_HIT - 0.01); a.x += Math.sin((T_HIT - 0.01) * 1.7) * 0.25;
  const b = BASIN.clone().add(V(0, 0.05, 0)); const k = seg(t, T_HIT, T_LAND); const p = VL(a, b, k); p.y = VL(a, b, k).y + Math.sin(k * Math.PI) * 0.4 * (1 - k);
  if (t >= T_LAND) p.copy(b); if (t >= T_IN) { const w = easeInOut(seg(t, T_IN, T_IN + 0.9)); p.copy(VL(b, DOOR, w)); }
  return p;
}
function stateAt(t) {
  rainAt(t);
  const flying = t >= T_LIFT && t < T_HIT, inBasin = t >= T_LAND;
  // Hamada
  son.root.visible = t < T_IN + 0.85; son.root.position.copy(sonPos(t)); son.root.rotation.set(0, 0.45, flying ? Math.sin(t * 4) * 0.12 : 0);
  { let p = { ...POSE0 };
    if (t < T_GRAB) { p.aLx = 0.3; p.aRx = 0.3; if (inT(t, Lx(1).t0, Lx(1).t1)) { p.aRz = 2.2 + Math.sin(t * 10) * 0.2; p.eR = 0.3; } }
    if (t >= T_GRAB && t < T_HIT) { p.aRx = 3.0; p.aRz = 0.2; p.eR = 0.1; p.aLx = 3.0; p.aLz = -0.2; p.eL = 0.1; }
    if (flying) { p.lL = Math.sin(t * 9) * 0.6; p.lR = -Math.sin(t * 9) * 0.6; }
    if (inT(t, T_HIT, T_LAND)) { p = { ...POSE0, aLz: 2.6, aRz: 2.6, lL: 1.2, lR: 0.8 }; }
    if (inBasin && t < T_IN) { p = { ...POSE0, y: -0.48, lL: 1.5, lR: 1.5, aLx: 0.6, aRx: 0.6, eL: 0.6, eR: 0.6 }; }
    if (t >= T_IN) { p = { ...POSE0, lL: Math.sin(t * 9) * 0.5, lR: -Math.sin(t * 9) * 0.5 }; son.root.rotation.y = -2.4; }
    applyPose(son, talkPose(p, t, 'son', 0.3));
    let se = 'wide', sm = talkMouth(t, 'son', 'scream') || 'o';
    if (inT(t, Lx(2).t0, Lx(3).t0)) { se = 'sparkle'; sm = talkMouth(t, 'son') || 'grin'; }
    if (inBasin) { se = 'tired'; sm = talkMouth(t, 'son') || 'flat'; }
    setFace(son, se, sm, {}); }
  bag.visible = son.root.visible; bag.position.copy(son.root.position).add(V(0, 1.05, 0).applyAxisAngle(V(0, 1, 0), 0)).add(V(-Math.sin(son.root.rotation.y) * 0.18, 0, -Math.cos(son.root.rotation.y) * 0.18)); bag.rotation.y = son.root.rotation.y;
  // the umbrella: dad shows it, then Hamada holds it up
  const broken = t >= T_HIT;
  if (t < Lx(2).t0 - 0.3) { umb.visible = true; umb.position.copy(DAD0).add(V(0.45, 0, -0.35)); umb.rotation.set(0, 0, 0.15); umb.scale.setScalar(1); }
  else if (t < T_GRAB) { umb.visible = true; const hp = dad.arms[1].hand.getWorldPosition(V(0, 0, 0)); umb.position.copy(hp).add(V(0, -0.55, 0)); umb.rotation.set(0, 0, -0.1); }
  else if (!broken) { const hp = son.arms[1].hand.getWorldPosition(V(0, 0, 0)); umb.position.copy(hp).add(V(0.05, -0.45, 0)); umb.rotation.set(0, 0, Math.sin(t * 5) * 0.06); }
  else { const k = easeOut(seg(t, T_HIT, T_HIT + 0.9)); const a = son.root.position.clone(); umb.position.set(SON0.x + 0.2 + k * 1.2, 5.0 + k * 1.8, SON0.z - 0.3 - k * 0.6); umb.rotation.set(k * 3, k * 2, 1.2 + k * 2); umb.visible = t < T_HIT + 0.9; }
  dryerU.rotation.y = (t >= T_GRAB && !broken) ? t * 30 : 0;
  // Ibrahim
  dad.root.visible = true; dad.root.position.copy(DAD0); dad.root.rotation.set(0, -0.35, 0);
  { let p = { ...POSE0 };
    if (inT(t, Lx(2).t0 - 0.3, T_GRAB)) { p.aRx = 2.8; p.aRz = 0.3; p.eR = 0.2; dad.root.rotation.y = -0.1; }
    if (inT(t, Lx(4).t0, Lx(4).t1)) { p.aLx = 1.0; p.eL = 1.4; p.aRx = 1.0; p.eR = 1.4; p.hx = -0.3; }
    if (t >= T_IN) { dad.root.rotation.y = 0; p = { ...POSE0, aLx: 0.2, aRx: 0.2, bend: 0.15 }; if (inT(t, Lx(9).t0, Lx(9).t1)) { p.aRx = 1.4; p.aRz = 0.5; p.eR = 0.5; p.bend = 0; } }
    applyPose(dad, talkPose(p, t, 'dad', 0.35));
    let de = 'smug', dm = talkMouth(t, 'dad', 'grin') || 'smile';
    if (inT(t, Lx(2).t0, Lx(3).t0)) de = 'sparkle'; if (inT(t, Lx(5).t0, T_LAND)) { de = 'wide'; dm = 'o'; }
    if (t >= Lx(7).t0) { de = 'sad'; dm = talkMouth(t, 'dad') || 'frown'; } if (inT(t, Lx(9).t0, Lx(9).t1 + 0.3)) { de = 'smug'; dm = talkMouth(t, 'dad', 'grin') || 'smile'; }
    setFace(dad, de, dm, { stache: true }); }
  // Om Hamada: comes out at L5, throws the slipper, sends Ibrahim to the balcony, takes Hamada inside
  mom.root.visible = t >= Lx(5).t0 - 0.6 && t < T_IN + 0.85;
  { const k = easeOut(seg(t, Lx(5).t0 - 0.6, Lx(5).t0)); mom.root.position.copy(VL(MOM0, MOM1, k)); mom.root.rotation.set(0, -0.5, 0);
    let p = { ...POSE0 };
    if (inT(t, Lx(5).t0, T_THROW)) { p.aRx = 2.8; p.aRz = 0.4; p.eR = 0.6; p.hx = -0.4; mom.root.rotation.y = -0.9; }
    if (inT(t, T_THROW, T_THROW + 0.3)) { p.aRx = 1.0; p.eR = 0.1; mom.root.rotation.y = -0.9; }
    if (inT(t, Lx(7).t0, Lx(7).t1)) { mom.root.rotation.y = 0.2; p.aRx = 1.5; p.aRz = 0.2; p.eR = 0.1; }
    if (t >= T_IN) { const w = easeInOut(seg(t, T_IN, T_IN + 0.9)); mom.root.position.copy(VL(MOM1, DOOR, w)); mom.root.rotation.y = Math.PI - 0.3; p.lL = Math.sin(t * 9) * 0.5; p.lR = -Math.sin(t * 9) * 0.5; }
    applyPose(mom, talkPose(p, t, 'mom', 0.3));
    let me = 'angry', mm = talkMouth(t, 'mom', 'scream') || 'frown'; if (t >= Lx(7).t0) { me = 'smug'; mm = talkMouth(t, 'mom') || 'flat'; }
    setFace(mom, me, mm, {}); }
  slip.visible = inT(t, Lx(5).t0, T_HIT + 0.6);
  if (t < T_THROW) { slip.position.copy(mom.arms[1].hand.getWorldPosition(V(0, 0, 0))).add(V(0, 0.08, 0)); slip.rotation.set(0.5, 0, 0); }
  else if (t < T_HIT) { const k = seg(t, T_THROW, T_HIT); const a = MOM1.clone().add(V(0, 2.0, 0)); const b = umb.position.clone().add(V(0, 1.0, 0)); const p = VL(a, b, k); p.y += Math.sin(k * Math.PI) * 0.6; slip.position.copy(p); slip.rotation.set(t * 20, t * 7, 0); }
  else { const k = seg(t, T_HIT, T_HIT + 0.6); slip.position.set(SON0.x + 0.3 - k * 0.3, 5.4 - k * 5.4, SON0.z); slip.rotation.set(t * 12, 0, 0); }
  bDoorGlow.material.color.setHex(t >= T_IN + 0.9 ? 0x332a20 : 0xffd890);
  // grey rainy morning
  scene.background = new THREE.Color(0x5a6272); roomLight.intensity = 0; ambient.color.setHex(0xc8d0e0); ambient.intensity = 0.62; moon.intensity = 0.5; fill.intensity = 0.9;
  balcLight.intensity = t >= T_IN + 0.9 ? 0.2 : 1.0; balcLight.position.set(1.5, 2.2, 0.2); tvLight.intensity = 0; bathLight.intensity = 0; kitLight.intensity = 0;
  if (t >= T_HIT && t < T_HIT + 0.08) { tvLight.intensity = 3; tvLight.color.setHex(0xffffff); tvLight.position.set(SON0.x, 3, 1); }
}
function shotAt(t) {
  if (t < Lx(2).t0 - 0.1) { faceCam(son, 1.9 - 0.25 * easeOut(seg(t, 0, 1.5)), 0.3, 0.1, 60, 0.4); camera.position.add(shake(t, 0.02)); return; }
  if (t < Lx(3).t0 - 0.1) { faceCam(dad, 2.5, -0.3, 0.25, 62, 0.15); return; }
  if (t < Lx(4).t0 - 0.1) { if (t < T_LIFT) { faceCam(son, 1.9, 0.3, 0.15, 60, 0.3); return; } const h = headOf(son); const k = easeOut(seg(t, T_LIFT, T_LIFT + 0.8)); cam(VL(V(-0.2, 1.9, 2.0), V(-0.3, 2.6, 4.6), k), h.clone().add(V(0, -0.2 * k, 0)), 60); return; }
  if (t < Lx(5).t0 - 0.1) { const h = headOf(son); cam(V(-0.2, h.y - 0.9, 4.8), h.clone().add(V(0, -0.3, 0)), 60); return; }
  if (t < T_THROW) { faceCam(mom, 1.8, 0.4, 0.05, 60, 0.3); camera.position.add(shake(t, 0.02)); return; }
  if (t < T_LAND + 0.5) { cam(V(0.1, 3.0, 7.0).add(shake(t, t > T_HIT ? 0.05 : 0)), V(-0.3, 2.8, -0.4), 64); return; }
  if (t < Lx(7).t0 - 0.1) { const b = BASIN.clone(); cam(V(b.x + 0.5, 1.15, 1.15), b.clone().add(V(0, 0.65, 0)), 58); return; }
  if (t < T_IN) { faceCam(mom, 1.8, 0.4, 0.05, 60, 0.3); return; }
  if (t < T_ANNO) { faceCam(dad, 1.9 - 0.3 * seg(t, Lx(9).t0, Lx(9).t1), 0.2, 0.05, 58, 0.3); return; }
  const k = easeInOut(seg(t, T_ANNO, DUR - 3)); faceCam(dad, 1.9 + 0.9 * k, 0.25, 0.25 + 0.3 * k, 60, 0.3);
}
function particles(t) {
  const pf = [], st = [], sw = [];
  if (t >= T_GRAB && t < T_HIT) { const p = dryerU.getWorldPosition(V(0, 0, 0)); for (let i = 0; i < 6; i++) { const k = (t * 2.2 + i / 6) % 1; pf.push({ pos: p.clone().add(V(Math.cos(i * 2.3) * (1 - k) * 0.9, 0.9 * (1 - k), Math.sin(i * 2.3) * (1 - k) * 0.6)), size: 0.1 + 0.15 * (1 - k), op: 0.5 * k, color: 0xdde8f4 }); } }
  if (inT(t, T_HIT, T_HIT + 0.6)) { const p = V(SON0.x + 0.2, 5.6, SON0.z); for (let i = 0; i < 8; i++) { const a = (t - T_HIT) * 3; st.push({ pos: p.clone().add(V(Math.cos(i) * a, Math.sin(i * 2) * a * 0.5, Math.sin(i) * a * 0.4)), size: 0.18, color: [0xffd400, 0xffffff][i % 2] }); } }
  if (inT(t, T_LAND, T_LAND + 0.8)) { const k = seg(t, T_LAND, T_LAND + 0.8); for (let i = 0; i < 10; i++) { const a = i / 10 * 6.28; pf.push({ pos: BASIN.clone().add(V(Math.cos(a) * (0.3 + k * 0.8), 0.3 + Math.sin(k * Math.PI) * 0.7, Math.sin(a) * (0.3 + k * 0.8))), size: 0.15, op: 0.8 * (1 - k), color: 0x8fb8e8 }); } }
  if (t >= T_LAND && t < T_IN) { const h = headOf(son); for (let i = 0; i < 3; i++) { const k = (t * 1.5 + i / 3) % 1; sw.push({ pos: h.clone().add(V(-0.2 + i * 0.2, 0.1 - k * 0.5, 0.2)), size: 0.07, op: 1 }); } }
  emit(st, starPool); emit(pf, puffPool); emit([], trailPool); emit(sw, sweatPool);
}
// ---------- HUD ----------
const BALC0 = 41;
function drawBalc(g, t) {
  if (t < Lx(8).t0 - 0.2 || t >= T_ANNO) return; const k = easeBack(seg(t, Lx(8).t0 - 0.2, Lx(8).t0 + 0.1)); const n = t >= Lx(8).t0 + 0.4 ? BALC0 + 1 : BALC0;
  g.save(); g.translate(W - 120, 600); g.scale(k, k); g.fillStyle = 'rgba(0,0,0,0.72)'; g.fillRect(-105, -48, 210, 96); g.strokeStyle = '#ffe14a'; g.lineWidth = 2; g.strokeRect(-105, -48, 210, 96);
  arText(g, 'ليالي البلكونة', 0, -48, 20, '#fff', 'center'); pxText(g, String(n), 0, 2, 26, n > BALC0 && Math.floor(t * 4) % 2 ? '#ff5a4a' : '#ffe14a', 'center'); g.restore();
}
function drawCTA(g, t) {
  if (t < Lx(9).t0 || t >= T_ANNO) return; const k = easeBack(seg(t, Lx(9).t0, Lx(9).t0 + 0.3));
  g.save(); g.translate(W / 2, 140); g.scale(k, k); g.fillStyle = 'rgba(255,255,255,0.96)'; g.fillRect(-250, -54, 500, 108); g.fillStyle = '#d8231b'; g.fillRect(-250, 48, 500, 6);
  arText(g, 'اقترح اختراع لإبراهيم 👇', 0, -56, 32, '#111', 'center'); arText(g, 'أحسن كومنت هيبقى حلقة!', 0, -14, 30, '#d8231b', 'center'); g.restore();
}
window.renderFrame = function (t) {
  stateAt(t); shotAt(t); particles(t);
  renderer.render(scene, camera);
  ctx.clearRect(0, 0, W, H); ctx.drawImage(glCanvas, 0, 0);
  h.clearRect(0, 0, W, H);
  drawInventionV(h, t, Lx(2).vox[Math.min(1, Lx(2).vox.length - 1)][0], Lx(3).t0, 'المظلة النووية ٣٠٠٠', [['DRY', 10, '#8fd0ff'], ['LANDING', 0, '#ff5a4a']]);
  drawDialogueV(h, t); drawBalc(h, t); drawCTA(h, t);
  drawEndV(h, t, T_ANNO + 0.1, 'HAMADA: AIRBORNE', 'حمادة وصل... مبلول', [['RAIN', 'المطرة: ١٠٠٪', T_ANNO + 1.3, '#8fd0ff'], ['IBRAHIM', 'إبراهيم: البلكونة', T_ANNO + 2.6, '#ff5a4a']], DUR);
  ctx.drawImage(hud, 0, 0); vignette(ctx, 0.35);
  if (t >= T_HIT && t < T_HIT + 0.06) { ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.fillRect(0, 0, W, H); }
  return true;
};
window.frameData = () => out.toDataURL('image/png');
window.DUR = DUR;
document.fonts.load('10px PS2P').then(() => document.fonts.load('20px Lalezar', 'ع')).then(() => document.fonts.load('700 20px ReemKufi', 'ع')).then(() => { lateDraw.forEach(f => f()); window.READY = true; });
