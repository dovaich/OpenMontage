// =====================================================================
// المكنسة النووية — Ibrahim's balcony workshop at 2 AM, vertical 9:16
// line order: L01 mom(cold) L02 son L03 dad L04 son L05 dad L06 son L07 mom L08 dad L09 anno
// =====================================================================
room.visible = false; balcony.visible = true; skyB.visible = false; streetGlow.visible = false;
scene.background = new THREE.Color(0x060a1a);
const Lx = (i) => LINES[i - 1];
const T_RW = Lx(1).t1 + 0.15, T_HOOK = T_RW + 0.6, T_ON = Lx(6).t0 - 0.15, T_ANNO = Lx(9).t0;
const lateDraw = [];
// city behind the railing (lit windows) + stars
{ const r = rng(77); for (let i = 0; i < 22; i++) { const x = -20 + i * 1.9 + (r() - .5), z = 8 + r() * 16, top = -1 + r() * 9, bot = -10, ww = 2.6 + r() * 1.5, hh = top - bot; mesh(box(ww, hh, 3), M([0x232838, 0x2a2622, 0x1e2433][i % 3]), x, bot + hh / 2, z, scene);
  for (let yy = bot + 1.2; yy < top - 0.4; yy += 1.3) for (let xx = -ww / 2 + 0.45; xx < ww / 2 - 0.3; xx += 0.75) if (r() > 0.75) { const w = mesh(new THREE.PlaneGeometry(0.4, 0.55), new THREE.MeshBasicMaterial({ color: 0xffd890 }), x + xx, yy, z - 1.51, scene); w.rotation.y = Math.PI; } } }
scene.add(new THREE.Points(new THREE.BufferGeometry().setFromPoints(Array.from({ length: 220 }, (_, i) => { const a = hash(i) * 6.28, b = 0.15 + hash(i + 7) * 1.2; return V(Math.cos(a) * Math.cos(b) * 70, Math.sin(b) * 70, Math.sin(a) * Math.cos(b) * 70 + 10); })), new THREE.PointsMaterial({ color: 0xffffff, size: 2, sizeAttenuation: false })));

// ---------- the workshop ----------
const bench = new THREE.Group(); bench.position.set(1.3, 0, -0.75); scene.add(bench);
mesh(box(1.5, 0.08, 0.7), M(0x8a5a2b, { map: woodTex }), 0, 0.82, 0, bench); for (const [x, z] of [[-0.68, -0.3], [0.68, -0.3], [-0.68, 0.3], [0.68, 0.3]]) mesh(box(0.06, 0.82, 0.06), M(0x5a3a1a), x, 0.41, z, bench);
for (let i = 0; i < 6; i++) { const t = mesh(box(0.05, 0.02, 0.22), P(0xb8c0c8, { shininess: 90 }), -0.6 + i * 0.12, 0.87, 0.2 + (i % 2) * 0.05, bench); t.rotation.y = (i - 2.5) * 0.3; }
mesh(cyl(0.05, 0.05, 0.1, 6), P(0xffd400), 0.55, 0.91, -0.2, bench); // tape roll
const lamp = new THREE.PointLight(0xffe0a0, 1.6, 6, 1.2); lamp.position.set(1.3, 2.0, -0.4); scene.add(lamp);
mesh(new THREE.SphereGeometry(0.07, 6, 5), new THREE.MeshBasicMaterial({ color: 0xfff0b0 }), 1.3, 2.15, -0.4, scene); mesh(box(0.01, 0.3, 0.01), M(0x111111), 1.3, 2.32, -0.4, scene);
// drill in Ibrahim's hand
const drill = new THREE.Group(); scene.add(drill); mesh(box(0.08, 0.18, 0.08), P(0x1f5fd8), 0, -0.05, 0, drill); mesh(box(0.08, 0.08, 0.22), P(0x1f5fd8), 0, 0.06, 0.08, drill); mesh(cyl(0.012, 0.012, 0.14, 5), P(0xcccccc), 0, 0.06, 0.25, drill).rotation.x = Math.PI / 2;
// the Nuclear Vacuum 3000: washing-machine motor + water hose + mom's pot + broom handle
const vac = new THREE.Group(); vac.position.set(0.15, 0, -0.55); scene.add(vac);
const vbody = new THREE.Group(); vac.add(vbody);
mesh(box(0.55, 0.5, 0.5), P(0xf2f2f2), 0, 0.25, 0, vbody); mesh(new THREE.CircleGeometry(0.17, 12), P(0x8fb8d0), 0, 0.28, 0.252, vbody); mesh(new THREE.TorusGeometry(0.17, 0.02, 4, 12), P(0xcccccc), 0, 0.28, 0.255, vbody);
const vpot = mesh(cyl(0.24, 0.21, 0.3, 12), P(0xc8ced6, { shininess: 110 }), 0, 0.65, 0, vbody); for (const sx of [-1, 1]) mesh(box(0.08, 0.03, 0.05), M(0x222222), sx * 0.27, 0.75, 0, vbody);
mesh(cyl(0.025, 0.025, 1.2, 6), M(0x8a5a2b), -0.25, 0.95, -0.15, vbody).rotation.z = 0.25;
for (let i = 0; i < 2; i++) mesh(box(0.6, 0.04, 0.03), P(0xc9ccd1), 0, 0.12 + i * 0.25, 0.26, vbody);
const nuke = canvasTex(16, 16, (g) => { g.fillStyle = '#ffd400'; g.fillRect(0, 0, 16, 16); g.fillStyle = '#111'; g.beginPath(); g.arc(8, 8, 2, 0, 7); g.fill(); for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(8, 8); g.arc(8, 8, 7, i * 2.09, i * 2.09 + 1.05); g.fill(); } });
mesh(new THREE.PlaneGeometry(0.16, 0.16), M(0xffffff, { map: nuke }), 0.18, 0.25, 0.253, vbody);
const switchB = mesh(box(0.08, 0.06, 0.04), new THREE.MeshBasicMaterial({ color: 0xd8231b }), -0.18, 0.45, 0.26, vbody);
// hose: from the pot toward the door, nozzle end free
const hoseMat = new THREE.MeshLambertMaterial({ color: 0x2f7fc8 });
let hose = null; const nozzle = mesh(cyl(0.09, 0.06, 0.18, 10), P(0x2f6fd8), 0, 0, 0, scene);
function hoseTo(end) { if (hose) { scene.remove(hose); hose.geometry.dispose(); } const a = vpot.getWorldPosition(V(0, 0, 0)).add(V(-0.2, 0.05, 0.05)); const m1 = VL(a, end, 0.4).add(V(0, -0.45, 0.2)), m2 = VL(a, end, 0.75).add(V(0, -0.2, 0.1)); hose = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([a, m1, m2, end]), 24, 0.05, 6), hoseMat); scene.add(hose); }
// sucked items: vCurtain at the balcony door, the carpet (balcony mattress blanket), laundry
const vCurtain = mesh(new THREE.PlaneGeometry(1.0, 2.0), new THREE.MeshLambertMaterial({ color: 0xc87ab0, side: THREE.DoubleSide }), 1.7, 1.1, -1.24, scene);
const vCurtainBase = vCurtain.position.clone();
const laundryBase = laundry.map(c => c.position.clone());
const notebook = mesh(box(0.16, 0.22, 0.02), M(0xf4ecd8), 0, 0, 0, scene);
const skinOrig = son.mats[0].color.clone();

const DAD_P = V(1.1, 0, -0.3), SON_DOOR = V(1.75, 0, -1.6), SON_P = V(0.9, 0, 0.35), MOM_P = V(1.6, 0, -0.9);
function suck(t) { return t >= T_ON || t < T_RW + 0.6; } // the cold open shows the aftermath
function swallowed(t) { return t < T_RW + 0.6 || t >= Lx(6).t1 - 0.2; }

function stateAt(t) {
  const on = suck(t);
  // ----- Ibrahim -----
  dad.root.position.copy(DAD_P); dad.root.rotation.set(0, 0.5, 0); dad.root.visible = t >= T_RW + 0.6;
  dad.extras.setGoggles(inT(t, T_HOOK, Lx(4).t0));
  let dp = { ...POSE0 };
  if (t < Lx(3).t0 + 1.2) { dp.aRx = 1.1; dp.eR = 0.6; dp.bend = 0.35; dad.root.rotation.y = 2.3; } // drilling at the vacuum
  if (inT(t, Lx(3).t0 + 1.2, Lx(4).t0)) { dp.aRx = 1.8; dp.aRz = 0.6; dp.eR = 0.2; }
  if (inT(t, Lx(5).t0, Lx(5).t1)) { dp.aRx = 1.4; dp.eR = 1.6; dp.hx = -0.1; }
  if (t >= T_ON) { dad.root.rotation.y = 0.2; dp.aLx = 1.0; dp.eL = 1.5; dp.aRx = 1.0; dp.eR = 1.5; dp.y = Math.sin(t * 20) * 0.01; } // writing in the notebook
  applyPose(dad, talkPose(dp, t, 'dad', 0.5));
  let de = 'smug', dm = talkMouth(t, 'dad', 'grin') || 'smile';
  if (t < Lx(4).t0) de = 'sparkle'; if (inT(t, Lx(5).t0, Lx(5).t1)) de = 'closed'; if (t >= Lx(8).t0) { de = 'smug'; dm = talkMouth(t, 'dad', 'grin') || 'grin'; }
  setFace(dad, de, dm, { stache: true });
  drill.visible = t < Lx(3).t0 + 1.2 && t >= T_RW + 0.6; if (drill.visible) { drill.position.copy(dad.arms[1].hand.getWorldPosition(V(0, 0, 0))).add(V(0, 0.05, 0)); drill.rotation.set(0, dad.root.rotation.y, 0); }
  notebook.visible = t >= T_ON; if (notebook.visible) { notebook.position.copy(dad.arms[0].hand.getWorldPosition(V(0, 0, 0))).add(V(0, 0.08, 0.06)); notebook.rotation.set(-0.6, 0.2, 0); }
  // ----- Hamada -----
  let sp = { ...POSE0 }, spos, sr = 0.2;
  if (swallowed(t)) { // upside down in the pot, only legs out
    const wob = Math.sin(t * 9) * 0.4; spos = vpot.getWorldPosition(V(0, 0, 0)).add(V(0, 1.6, 0)); sr = 0;
    son.root.position.copy(spos); son.root.rotation.set(Math.PI, 0, 0); sp = { ...POSE0, lL: wob, lR: -wob, aLz: 0.2, aRz: 0.2 };
  } else if (t < Lx(2).t1 + 0.3) { const k = easeOut(seg(t, T_HOOK, T_HOOK + 0.6)); spos = VL(SON_DOOR, V(1.6, 0, -0.85), k); sr = 0.4; son.root.position.copy(spos); son.root.rotation.set(0, sr, 0); sp = { ...POSE0, aLx: 1.4, eL: 2.0, hx: 0.15 }; } // rubbing his eyes
  else if (t < T_ON) { spos = SON_P.clone(); son.root.position.copy(spos); son.root.rotation.set(0, -0.3, 0); if (inT(t, Lx(4).t0, Lx(4).t1)) { sp.aRx = 1.2; sp.eR = 0.4; sp.aRz = 0.4; } if (t > Lx(6).t0 - 0.6) { sp.aRx = 0.9; sp.eR = 0.3; } }
  else { const k = easeIn(seg(t, T_ON + 0.4, Lx(6).t1 - 0.2)); spos = VL(SON_P, vpot.getWorldPosition(V(0, 0, 0)).add(V(0.4, 0, 0.5)), k); spos.y = 0; son.root.position.copy(spos); son.root.rotation.set(0, -0.9, -0.6 * k); sp = { ...POSE0, aLz: 2.4, aRz: 2.4, aLx: -0.6, aRx: -0.6, eL: 0.2, eR: 0.2, lL: -0.6 - k * 0.6, lR: -0.3 - k * 0.6, bend: -0.3 * k }; }
  applyPose(son, talkPose(sp, t, 'son', 0.3));
  let se = 'tired', sm = talkMouth(t, 'son', 'scream') || 'flat'; if (inT(t, Lx(4).t0, Lx(5).t0)) { se = 'wide'; } if (t >= T_ON) { se = 'wide'; sm = talkMouth(t, 'son', 'scream') || 'scream'; }
  setFace(son, se, sm, {});
  // ----- Om Hamada -----
  const momIn = t < T_RW + 0.6 || t >= Lx(7).t0 - 0.4; mom.root.visible = momIn;
  if (momIn) { mom.root.position.copy(MOM_P); mom.root.rotation.set(0, -0.2, 0); const p = { ...POSE0, aLz: 2.3 + Math.sin(t * 8) * 0.2, aRz: 1.2, eL: 0.3, eR: 0.6, bend: -0.1 }; applyPose(mom, talkPose(p, t, 'mom', 0.3)); setFace(mom, 'wide', talkMouth(t, 'mom', 'scream') || 'scream', {}); }
  // ----- the vacuum -----
  vbody.position.set(on ? Math.sin(t * 55) * 0.012 : 0, 0, 0); switchB.material.color.setHex(on ? 0x3df05a : 0xd8231b);
  const nozEnd = swallowed(t) ? V(0.6, 0.35, 0.5) : V(0.75, 0.25, 0.65); nozzle.position.copy(nozEnd); nozzle.rotation.set(Math.PI / 2, 0, 0.7); hoseTo(nozEnd);
  // sucked items
  const pull = on ? (t < T_RW + 0.6 ? 1 : clamp((t - T_ON) / 2.5)) : 0;
  vCurtain.position.copy(VL(vCurtainBase, V(0.5, 1.2, -1.15), pull * 0.7)); vCurtain.rotation.set(0, pull * 1.2, pull * 0.6 + (on ? Math.sin(t * 15) * 0.15 : 0)); vCurtain.scale.set(1 - pull * 0.5, 1 - pull * 0.4, 1);
  blanket.position.copy(VL(V(-0.3, 0.2, -0.25), V(0.0, 0.5, -0.4), pull)); blanket.rotation.set(pull * 0.8, pull * 2, Math.sin(t * 13) * 0.2 * pull); blanket.scale.setScalar(1 - pull * 0.6);
  laundry.forEach((c, i) => { const k = on ? clamp(pull * 1.5 - i * 0.12) : 0; c.position.copy(VL(laundryBase[i], vpot.getWorldPosition(V(0, 0, 0)).add(V(0, 0.4, 0)), k)); c.rotation.set(k * 4 + i, k * 3, k * 5); c.visible = k < 0.98; });
  ambient.color.setHex(0x5060a0); ambient.intensity = 0.45; moon.intensity = 0.35; fill.intensity = 0.9; roomLight.intensity = 0; bathLight.intensity = 0; kitLight.intensity = 0; balcLight.intensity = 0;
  bDoorGlow.material.color.setHex(0xffd890);
}

function shotAt(t) {
  if (t < T_RW + 0.6) { cam(V(0.6, 1.7, 2.9).add(shake(t, 0.02)), V(0.9, 1.0, -0.6), 64); return; }
  if (t < Lx(2).t1 + 0.3) { faceCam(son, 1.8, 0.3, 0.05, 58, 0.3); return; }
  if (t < Lx(4).t0) { const k = easeOut(seg(t, Lx(3).t0, Lx(3).t0 + 1.2)); cam(VL(V(0.2, 1.3, 1.4), V(0.4, 1.7, 2.3), k), VL(V(0.2, 0.6, -0.5), V(0.6, 1.0, -0.4), k), 62); return; }
  if (t < Lx(5).t0) { faceCam(son, 1.8, 0.3, 0.05, 58, 0.3); return; }
  if (t < T_ON) { faceCam(dad, 1.9, -0.4, 0.05, 58, 0.3); return; }
  if (t < Lx(7).t0 - 0.4) { cam(V(0.5, 1.6, 2.6).add(shake(t, 0.03)), V(0.6, 0.8, -0.3), 64); return; }
  if (t < Lx(8).t0) { faceCam(mom, 1.8, 0.75, 0.05, 60, 0.3); camera.position.add(shake(t, 0.015)); return; }
  if (t < T_ANNO) { faceCam(dad, 1.9, 0.4, 0.05, 58, 0.3); return; }
  const k = easeInOut(seg(t, T_ANNO, DUR - 3)); cam(VL(V(0.6, 1.7, 2.9), V(0.6, 2.4, 4.0), k), V(0.7, 0.9, -0.6), 66);
}
function particles(t) {
  const st = [], pf = [];
  if (inT(t, T_HOOK, Lx(3).t0 + 1.2)) { const d = drill.position.clone().add(V(0.1, 0.06, 0.2)); for (let i = 0; i < 10; i++) { const k = (t * 3 + i / 10) % 1; st.push({ pos: d.clone().add(V(Math.cos(i * 2.3) * k * 0.5, k * 0.4 - k * k * 0.6, Math.sin(i * 1.7) * k * 0.4)), size: 0.06 * (1 - k), color: i % 2 ? 0xffd040 : 0xffffff }); } }
  if (suck(t)) { const n = nozzle.position; for (let i = 0; i < 12; i++) { const k = (t * 2.2 + i / 12) % 1; const a = i * 0.52; pf.push({ pos: n.clone().add(V(Math.cos(a) * (1 - k) * 1.4, 0.2 + Math.sin(a * 2) * (1 - k) * 0.8, Math.sin(a) * (1 - k) * 1.0)), size: 0.08 + (1 - k) * 0.12, op: 0.6 * k, color: 0xdfe6ee }); } }
  emit(st, starPool); emit(pf, puffPool); emit([], trailPool); emit([], sweatPool);
}
function drawParts(g, t) {
  if (!inT(t, Lx(4).t0, Lx(5).t0)) return; const L = Lx(4); const items = ['موتور الغسالة', 'خرطوم المية', 'حلة ماما'];
  g.save(); g.translate(W - 30, 250); g.fillStyle = 'rgba(0,0,30,0.85)'; g.fillRect(-230, -16, 230, 150); g.strokeStyle = '#ffe14a'; g.lineWidth = 2; g.strokeRect(-230, -16, 230, 150);
  pxText(g, 'PARTS', -220, -8, 9, '#ffe14a', 'left', false);
  items.forEach((s, i) => { const vx = L.vox[Math.min(i, L.vox.length - 1)]; if (t < vx[0]) return; arText(g, s + ' ✓', -14, 14 + i * 38, 24, i === 2 ? '#ff8a8a' : '#fff'); });
  g.restore();
}
function drawLog(g, t) {
  if (!inT(t, Lx(8).t0 + 0.3, T_ANNO)) return; const k = easeBack(seg(t, Lx(8).t0 + 0.3, Lx(8).t0 + 0.6));
  g.save(); g.translate(W / 2, 170); g.rotate(-0.04); g.scale(k, k); g.fillStyle = '#f4ecd8'; g.fillRect(-200, -70, 400, 140); for (let i = 0; i < 4; i++) { g.fillStyle = '#9fc0e0'; g.fillRect(-190, -30 + i * 28, 380, 2); }
  arText(g, 'كشكول الاختراعات', 0, -66, 22, '#1f5fd8', 'center'); arText(g, 'الاختراع شغّال... بزيادة ✓', 0, -20, 26, '#111', 'center'); g.restore();
}

window.renderFrame = function (t) {
  stateAt(t); shotAt(t); particles(t);
  renderer.render(scene, camera);
  ctx.clearRect(0, 0, W, H); ctx.drawImage(glCanvas, 0, 0);
  h.clearRect(0, 0, W, H);
  drawHookV(h, t, T_HOOK, T_HOOK + 3.4, 'لما أبوك يبدأ', 'يصنّع اختراع');
  drawInventionV(h, t, Lx(3).vox[Math.min(2, Lx(3).vox.length - 1)][0], Lx(4).t0, 'المكنسة النووية ٣٠٠٠', [['SUCTION', 10, '#4aa8ff'], ['CONTROL', 0, '#ff5a4a']]);
  drawParts(h, t); drawLog(h, t); drawRewind(h, t, T_RW, T_HOOK, 'قبلها بنص ساعة...');
  drawDialogueV(h, t);
  drawEndV(h, t, T_ANNO + 0.1, 'SUCTION: MAXIMUM', 'المكنسة شفطت حمادة', [['SUCTION', 'الشفط: آخره', T_ANNO + 1.3, '#4aa8ff'], ['HAMADA', 'حمادة: مفقود', T_ANNO + 2.9, '#ff5a4a']], DUR);
  ctx.drawImage(hud, 0, 0); vignette(ctx, 0.3);
  if (t >= T_ON && t < T_ON + 0.07) { ctx.fillStyle = 'rgba(200,230,255,0.5)'; ctx.fillRect(0, 0, W, H); }
  return true;
};
window.frameData = () => out.toDataURL('image/png');
window.DUR = DUR;
document.fonts.load('10px PS2P').then(() => document.fonts.load('20px Lalezar', 'ع')).then(() => document.fonts.load('700 20px ReemKufi', 'ع')).then(() => { lateDraw.forEach(f => f()); window.READY = true; });
