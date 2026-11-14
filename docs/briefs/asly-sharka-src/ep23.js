// =====================================================================
// أصلي شركة — Bestem keeps saying «أصلي», El-Asly takes it personally. vertical 9:16
// L01 asly(cold) L02 samir L03 bastam L04 asly L05 bastam L06 asly L07 alamy L08 gazzar L09 asly L10 samir L11 anno
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
const T_RW = Lx(1).t1 + 0.15, T_HOOK = T_RW + 0.6, T_HANG = Lx(6).t0 - 0.5, T_ANNO = Lx(11).t0;
const hung = (t) => t < T_RW + 0.6 || t >= T_HANG;

// ---------- set: Abu Samir's car parked, parts counter, the hook ----------
const SC = makeSamirCar(scene); SC.g.position.set(G + 1.4, 0, -2.2); SC.g.rotation.y = -0.15; lateDraw.push(SC.late);
const counter = new THREE.Group(); counter.position.set(G - 1.7, 0, 0.9); scene.add(counter);
mesh(box(0.6, 0.95, 1.4), M(0x8a5a2b, { map: woodTex }), 0, 0.475, 0, counter); mesh(box(0.66, 0.04, 1.46), P(0xdedede), 0, 0.97, 0, counter);
for (let i = 0; i < 4; i++) mesh(cyl(0.07, 0.07, 0.14, 8), M([0xd8231b, 0x1f5fd8, 0xffd400, 0x3df05a][i]), 0, 1.06, -0.5 + i * 0.3, counter);
const filter = new THREE.Group(); scene.add(filter); mesh(cyl(0.07, 0.07, 0.16, 10), P(0x1f5fd8, { shininess: 90 }), 0, 0, 0, filter); mesh(cyl(0.072, 0.072, 0.03, 10), P(0xc0c0c0), 0, 0.08, 0, filter);
const fTagT = canvasTex(32, 16, (g) => { g.fillStyle = '#ffe14a'; g.fillRect(0, 0, 32, 16); }); lateDraw.push(() => { const g = fTagT.userData.g; g.fillStyle = '#ffe14a'; g.fillRect(0, 0, 32, 16); g.fillStyle = '#c11'; g.font = '11px Lalezar'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.direction = 'rtl'; g.fillText('أصلي', 16, 9); fTagT.needsUpdate = true; });
mesh(new THREE.PlaneGeometry(0.14, 0.07), new THREE.MeshBasicMaterial({ map: fTagT, side: THREE.DoubleSide }), 0, 0, 0.073, filter);
const HOOK = V(G - 0.4, 3.0, -0.2);
mesh(cyl(0.02, 0.02, 2.0, 5), P(0x888888), HOOK.x, 4.0, HOOK.z, scene);
const hook = mesh(new THREE.TorusGeometry(0.1, 0.025, 5, 10, Math.PI * 1.4), P(0x999999, { shininess: 100 }), HOOK.x, HOOK.y, HOOK.z, scene); hook.rotation.z = 2.4;
const slipper = new THREE.Group(); scene.add(slipper); mesh(box(0.12, 0.03, 0.3), M(0x2f6fd8), 0, 0, 0, slipper); mesh(box(0.13, 0.05, 0.04), M(0x1a3a8a), 0, 0.03, 0.05, slipper);
const garLight = new THREE.PointLight(0xfff6e8, 1.8, 14, 1.0); garLight.position.set(G - 0.5, 4.2, 2.0); scene.add(garLight);

const P_SAM = V(G - 2.4, 0, 0.9), P_BST = V(G - 1.0, 0, 0.9), P_ASLY_WORK = V(G + 2.9, 0, -1.75);
const P_ASLY = V(G - 0.4, 0, 1.05), P_ALAMY = V(G - 1.15, 0, 1.2), P_GAZ = V(G + 0.35, 0, 1.2);
// slipper hits while he's hanging (Asly breaks free briefly)
const HITS = []; { const a = Lx(6); for (const x of [a.t0 + 0.6, a.t1 - 0.6]) HITS.push(x); HITS.push(Lx(9).t1 + 0.1); }

function stateAt(t) {
  const H = hung(t);
  // ----- Bestem -----
  let bp = { ...POSE0 };
  if (!H) {
    bastam.root.position.copy(P_BST); bastam.root.rotation.set(0, -Math.PI / 2, 0);
    bp = { ...POSE0, aRx: 1.3, eR: 0.6, aRz: 0.2 }; if (inT(t, Lx(3).t0, Lx(3).t1)) { bp.aLz = 1.6 + Math.sin(t * 9) * 0.2; bp.eL = 0.4; }
    if (inT(t, Lx(4).t0, Lx(6).t0)) { bastam.root.rotation.y = 0.6; bp = { ...POSE0, aLz: 0.8, aRz: 0.8, eL: 1.2, eR: 1.2 }; }
  } else { // hanging from the hook by the back of his coverall, swinging and kicking
    const hit = HITS.some(x => inT(t, x, x + 0.7)); const sw = Math.sin(t * 2.2) * 0.12 + (hit ? Math.sin((t % 1) * 20) * 0.25 : 0);
    bastam.root.position.copy(HOOK).add(V(Math.sin(sw) * 0.3, -1.98, 0.05)); bastam.root.rotation.set(0.12, 0.35 + Math.sin(t * 0.9) * 0.3, sw);
    const w = Math.sin(t * 8); bp = { ...POSE0, lL: 0.4 + w * 0.5, lR: 0.4 - w * 0.5, aLz: 2.6, aRz: 2.6, eL: 0.6, eR: 0.6, hx: 0.2 };
  }
  applyPose(bastam, talkPose(bp, t, 'bastam', 0.3));
  let be = 'sparkle', bm = talkMouth(t, 'bastam', 'grin') || 'grin';
  if (inT(t, Lx(4).t0, Lx(6).t0)) { be = 'wide'; bm = talkMouth(t, 'bastam', 'scream') || 'o'; } if (H) { be = HITS.some(x => inT(t, x, x + 0.7)) ? 'x' : 'sad'; bm = 'wobble'; }
  setFace(bastam, be, bm, { fuzz: true });
  filter.visible = !H || inT(t, Lx(10).t0 - 0.3, DUR);
  if (!H) { filter.position.copy(bastam.arms[1].hand.getWorldPosition(V(0, 0, 0))).add(V(0, 0.12, 0.04)); filter.rotation.set(0, -Math.PI / 2, 0); }
  // ----- Abu Samir -----
  let sp = { ...POSE0, aLx: 0.4, eL: 0.4 }; samir.root.visible = true;
  if (!H || t < T_RW + 0.6) { samir.root.position.copy(P_SAM); samir.root.rotation.set(0, Math.PI / 2, 0); if (inT(t, Lx(4).t0, Lx(6).t0)) { samir.root.rotation.y = 1.0; sp = { ...POSE0, aLz: 0.5, aRz: 0.5 }; } }
  else { // hiding behind the counter, then leaving with the fake filter
    if (t < Lx(10).t0 - 0.3) { samir.root.position.set(G - 2.2, 0, 1.9); samir.root.rotation.set(0, 1.2, 0); sp = { ...POSE0, aLx: 0.6, eL: 1.9, aRx: 0.6, eR: 1.9, bend: 0.2 }; }
    else { const k = easeInOut(seg(t, Lx(10).t0, Lx(10).t1 + 1.5)); samir.root.position.copy(VL(V(G - 2.2, 0, 1.9), V(G + 3.5, 0, 3.4), k)); samir.root.rotation.set(0, 1.4, 0); const ph = t * 10; sp = { ...POSE0, aRx: 1.2, eR: 0.6, lL: Math.sin(ph) * 0.5, lR: -Math.sin(ph) * 0.5, hy: -0.6 };
      filter.position.copy(samir.arms[1].hand.getWorldPosition(V(0, 0, 0))).add(V(0, 0.12, 0.04)); filter.rotation.set(0, 1.4, 0); }
  }
  applyPose(samir, talkPose(sp, t, 'samir', 0.3));
  setFace(samir, inT(t, Lx(4).t0, DUR) ? 'wide' : 'side', talkMouth(t, 'samir') || (H ? 'o' : 'frown'), { stache: true, stacheColor: '#eeeeee' });
  // ----- El-Asly -----
  let ap = { ...POSE0 };
  if (!H && t < Lx(4).t0 - 0.3) { asly.root.position.copy(P_ASLY_WORK); asly.root.rotation.set(0, -2.2, 0); ap = { ...POSE0, bend: 0.4, aLx: 1.2, eL: 0.5, aRx: 1.2, eR: 0.5 }; if (t > Lx(3).t0 + 0.6) { ap.bend = 0; ap.hy = 0.6; } }
  else if (!H) { const k = easeOut(seg(t, Lx(4).t0 - 0.3, Lx(4).t0 + 0.6)); asly.root.position.copy(VL(P_ASLY_WORK, V(G + 0.2, 0, 0.6), k)); asly.root.rotation.set(0, lerp(-2.2, -1.4, k), 0); ap = { ...POSE0, aLz: 0.4, aRz: 0.4, eL: 1.3, eR: 1.3 }; if (t > Lx(5).t0) { ap.aRx = 1.9; ap.eR = 0.3; } }
  else { // held back by El-Alamy and El-Gazzar, lunging at Bestem; turns on El-Gazzar at L09
    const hit = HITS.some(x => inT(t, x - 0.25, x + 0.35));
    asly.root.position.copy(P_ASLY).add(V(0, 0, hit ? -0.25 : Math.sin(t * 6) * 0.06)); asly.root.rotation.set(0, Math.PI, 0);
    ap = { ...POSE0, bend: 0.25, aLx: 1.1, eL: 0.4, aLz: 0.6, aRx: hit ? 2.4 : 1.4, eR: hit ? 0.1 : 0.6, aRz: 0.5, y: Math.abs(Math.sin(t * 7)) * 0.04 };
    if (inT(t, Lx(9).t0 - 0.2, Lx(9).t1 + 0.1)) { asly.root.rotation.y = Math.PI / 2 + 0.3; ap = { ...POSE0, aRx: 1.6, eR: 0.2, aLz: 0.5 }; }
  }
  applyPose(asly, talkPose(ap, t, 'asly', 0.3));
  let ae = 'angry', am = talkMouth(t, 'asly', 'scream') || 'clench';
  if (!H && t < Lx(4).t0 - 0.3) { ae = 'flat'; am = 'flat'; } if (inT(t, Lx(9).t0 - 0.2, Lx(9).t1 + 0.1)) { ae = 'wide'; am = talkMouth(t, 'asly', 'scream') || 'o'; }
  setFace(asly, ae, am, { stache: true, red: H && t < Lx(11).t0 });
  // slipper in Asly's right hand
  slipper.visible = H || t >= Lx(5).t0; slipper.position.copy(asly.arms[1].hand.getWorldPosition(V(0, 0, 0))).add(V(0, 0.1, 0)); slipper.rotation.set(0.6, asly.root.rotation.y, 0);
  // ----- El-Alamy & El-Gazzar holding him back -----
  alamy.root.visible = gazzar.root.visible = H;
  alamy.root.position.copy(P_ALAMY); alamy.root.rotation.set(0, Math.PI - 0.6, 0);
  applyPose(alamy, talkPose({ ...POSE0, aLx: 1.2, eL: 0.5, aRx: 1.3, eR: 0.6, bend: -0.15 }, t, 'alamy', 0.2)); setFace(alamy, 'side', talkMouth(t, 'alamy') || 'clench', ALAMY_FACE);
  const gLet = t >= Lx(9).t0 - 0.2;
  gazzar.root.position.copy(gLet ? P_GAZ.clone().add(V(0.7, 0, 0.5)) : P_GAZ); gazzar.root.rotation.set(0, gLet ? -0.4 : -(Math.PI - 0.6), 0);
  applyPose(gazzar, talkPose(gLet ? { ...POSE0, aLz: 1.2, aRz: 1.2, eL: 1.4, eR: 1.4 } : { ...POSE0, aLx: 1.1, eL: 0.5, aRx: 1.2, eR: 0.6, hz: 0.3 }, t, 'gazzar', 0.2));
  setFace(gazzar, gLet ? 'wide' : 'tired', talkMouth(t, 'gazzar') || (gLet ? 'o' : 'smile'), { fuzz: true });
  ambient.color.setHex(0xfff4e0); ambient.intensity = 0.7; moon.intensity = 0.2; fill.intensity = 1.0; bathLight.intensity = 0; kitLight.intensity = 0; roomLight.intensity = 0;
  scene.background = new THREE.Color(0x8ec8ff);
}

function shotAt(t) {
  if (t < T_RW + 0.6) { cam(V(G + 2.9, 1.8, 0.2).add(shake(t, 0.03)), V(G - 0.6, 1.3, 0.5), 66); return; }
  if (t < Lx(3).t0 - 0.1) { const k = easeOut(seg(t, T_HOOK, Lx(2).t1)); cam(VL(V(G - 1.7, 1.9, 4.2), V(G - 1.7, 1.7, 3.4), k), V(G - 1.7, 1.2, 0.9), 62); return; }
  if (t < Lx(4).t0 - 0.1) { faceCam(bastam, 0.95, 0.75, 0.1, 64, 0.3); return; }
  if (t < Lx(5).t0 - 0.1) { faceCam(asly, 1.8, -0.4, 0.05, 60, 0.3); return; }
  if (t < T_HANG) { const hd = headOf(bastam); cam(hd.clone().add(V(0.15, 0.1, 1.7)), hd.clone().add(V(-0.1, -0.35, 0)), 60); return; }
  if (t < Lx(7).t0 - 0.1) { cam(V(G + 2.9, 1.8, 0.2).add(shake(t, 0.02)), V(G - 0.6, 1.3, 0.5), 66); return; }
  if (t < Lx(8).t0 - 0.1) { const hd = headOf(alamy); cam(hd.clone().add(V(-0.45, 0.12, -1.45)), hd.clone().add(V(0.1, -0.35, 0)), 60); return; }
  if (t < Lx(9).t0 - 0.1) { const hd = headOf(gazzar); cam(hd.clone().add(V(0.45, 0.12, -1.45)), hd.clone().add(V(-0.1, -0.35, 0)), 60); return; }
  if (t < Lx(10).t0 - 0.1) { faceCam(asly, 1.8, 0.45, 0.05, 60, 0.3); camera.position.add(shake(t, 0.02)); return; }
  if (t < T_ANNO) { cam(V(G - 0.6, 1.8, 4.2), samir.root.position.clone().add(V(0, 1.1, 0)), 62); return; }
  const k = easeInOut(seg(t, T_ANNO, DUR - 3)); cam(VL(V(G + 3.0, 1.9, 0.6), V(G + 3.8, 2.5, 1.2), k), V(G - 0.6, 1.3, 0.5), 68);
}
function particles(t) {
  const st = [], pf = [];
  for (const x of HITS) if (inT(t, x, x + 0.6)) { const p = bastam.root.position.clone().add(V(0, 0.9, 0)); for (let i = 0; i < 8; i++) { const a = (t - x) * 4; st.push({ pos: p.clone().add(V(Math.cos(i) * a, Math.sin(i * 2) * a * 0.6, Math.sin(i) * a * 0.4)), size: 0.16, color: 0xffe14a }); } }
  if (hung(t)) { const hd = headOf(asly); for (let i = 0; i < 3; i++) { const k = (t * 1.1 + i / 3) % 1; pf.push({ pos: hd.clone().add(V((i - 1) * 0.15, 0.35 + k * 0.6, 0)), size: 0.12 + k * 0.25, op: 0.5 * (1 - k), color: 0xdddddd }); } }
  emit(st, starPool); emit(pf, puffPool); emit([], trailPool); emit([], sweatPool);
}
// running count of «أصلي» spoken so far (from the voice-synced reveal)
function asliCount(t) { let n = 0; for (const L of LINES) { if (L.s === 'anno' || t < L.t0 || L.id === 'L01') continue; const w = L.ar.split(' '); const k = t >= L.t1 ? w.length : revealCount(L, t); for (let i = 0; i < k; i++) if (w[i].replace(/[^؀-ۿ]/g, '') === 'أصلي') n++; } return n; }
function drawCounter(g, t) {
  if (t < Lx(3).t0 || t >= T_ANNO) return; const n = asliCount(t);
  g.save(); g.translate(18, 230); g.fillStyle = 'rgba(0,0,0,0.7)'; g.fillRect(0, 0, 200, 70); g.strokeStyle = '#ffe14a'; g.lineWidth = 2; g.strokeRect(0, 0, 200, 70);
  arText(g, 'عدد «أصلي»', 190, 2, 22, '#fff'); pxText(g, String(n), 20, 34, 22, n >= 6 ? (Math.floor(t * 6) % 2 ? '#ff2a2a' : '#ffe14a') : '#ffe14a', 'left'); g.restore();
}
function drawLater(g, t) {
  if (!inT(t, T_HANG - 0.45, T_HANG + 0.15)) return; g.fillStyle = '#111'; g.fillRect(0, 0, W, H);
  arText(g, 'بعد تلات ثواني...', W / 2, H / 2 - 40, 44, '#ffe14a', 'center'); pxText(g, '3 SECONDS LATER', W / 2, H / 2 + 20, 12, '#fff', 'center');
}

window.renderFrame = function (t) {
  stateAt(t); shotAt(t); particles(t);
  renderer.render(scene, camera);
  ctx.clearRect(0, 0, W, H); ctx.drawImage(glCanvas, 0, 0);
  h.clearRect(0, 0, W, H);
  drawHookV(h, t, T_HOOK, T_HOOK + 3.2, 'لما اسمك «الأصلي»', 'وإنت شغال في قطع غيار');
  drawCounter(h, t); drawRewind(h, t, T_RW, T_HOOK, 'قبلها بدقيقة...');
  drawDialogueV(h, t); drawLater(h, t);
  drawEndV(h, t, T_ANNO + 0.1, 'BESTEM: STILL HANGING', 'بستم لسه متعلّق', [['ASLI COUNT', 'أصلي: ' + asliCount(T_ANNO), T_ANNO + 1.2, '#ffe14a'], ['RAGE', 'الأصلي: مولّع', T_ANNO + 2.8, '#ff5a4a']], DUR);
  ctx.drawImage(hud, 0, 0); vignette(ctx, 0.3);
  for (const x of HITS) if (t >= x && t < x + 0.06) { ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.fillRect(0, 0, W, H); }
  return true;
};
window.frameData = () => out.toDataURL('image/png');
window.DUR = DUR;
document.fonts.load('10px PS2P').then(() => document.fonts.load('20px Lalezar', 'ع')).then(() => document.fonts.load('700 20px ReemKufi', 'ع')).then(() => { lateDraw.forEach(f => f()); window.READY = true; });
