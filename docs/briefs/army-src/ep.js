// ---------- shared documentary toolkit («حصلت إزاي؟») ----------
const NARR = LINES.filter(l => l.s === 'anno'), DL = LINES.filter(l => l.s === 'dad'), OL = LINES.filter(l => l.s !== 'anno' && l.s !== 'dad');
const NX = (i) => NARR[i - 1], DX = (i) => DL[i - 1], OX2 = (i) => OL[i - 1];
camera.far = 1500;
const hemi = new THREE.HemisphereLight(0xbfd8ff, 0x3a3020, 0); scene.add(hemi);
const sun = new THREE.DirectionalLight(0xffffff, 0); scene.add(sun); scene.add(sun.target);
function fixedLight(ref, sky, ground, hi, sunCol, si, bg, fogCol, f0, f1) {
  hemi.color.setHex(sky); hemi.groundColor.setHex(ground); hemi.intensity = hi; sun.color.setHex(sunCol); sun.intensity = si; sun.position.copy(ref).add(V(-60, 80, 40)); sun.target.position.copy(ref);
  scene.background = new THREE.Color(bg); scene.fog = fogCol == null ? null : new THREE.Fog(fogCol, f0, f1);
  ambient.intensity = 0; moon.intensity = 0; fill.intensity = 0; tvLight.intensity = 0; balcLight.intensity = 0; bathLight.intensity = 0; kitLight.intensity = 0; hallLight.intensity = 0; roomLight.intensity = 0;
}
function homeLight() { scene.background = new THREE.Color(0x101010); scene.fog = null; hemi.intensity = 0; sun.intensity = 0; ambient.intensity = 0.6; moon.intensity = 0.3; fill.intensity = 0; tvLight.intensity = 0; balcLight.intensity = 0; bathLight.intensity = 0; kitLight.intensity = 0; hallLight.intensity = 0; roomLight.position.set(0, 2.8, 1.0); roomLight.intensity = 1.4; }
// a person in the cast style (makeChar): big head, painted face, mitten hands
function makePerson(parent, o) {
  const skin = o.skin || [0xc8946a, 0xb98058, 0xd8a878, 0xa87048][(o.seed || 0) % 4];
  const tex = o.coatTex || canvasTex(16, 16, (g) => { g.fillStyle = '#' + (o.coat || 0x2a3a5a).toString(16).padStart(6, '0'); g.fillRect(0, 0, 16, 16); if (o.buttons !== false) { g.fillStyle = 'rgba(255,255,255,0.35)'; for (let i = 0; i < 3; i++) g.fillRect(7, 3 + i * 4, 2, 2); } });
  return makeChar({ seed: 300 + (o.seed || 0), skin, hipY: o.hipY || 0.84, legX: 0.11, legColor: o.legs || 0x2a2a30, shoe: o.shoe || 0x111111, hand: o.hand || skin,
    torsoGeo: cyl(o.w || 0.25, (o.w || 0.25) + 0.02, 0.64, 6), torsoTex: tex, torsoColor: 0xffffff, torsoY: 0.32, skirt: o.skirt || null,
    sleeve: true, sleeveColor: o.sleeve || o.coat || 0x2a3a5a, shoulderX: (o.w || 0.25) + 0.06, shoulderY: 0.57, neckY: 0.64, headR: 0.27,
    build(head, torso, reg) { if (o.hat) o.hat(head, torso, reg); return {}; } }, parent);
}
// overlay pass: pop-in characters are drawn as their own layer over the frozen frame (never cut into the set)
const overlay = new THREE.Scene(); overlay.add(new THREE.HemisphereLight(0xfff4e8, 0x504030, 1.0)); { const d = new THREE.DirectionalLight(0xffffff, 0.8); d.position.set(2, 4, 3); overlay.add(d); overlay.add(d.target); }
function renderOverlay(list) { const parents = list.map(c => c.root.parent); list.forEach(c => { overlay.add(c.root); c.root.visible = true; }); renderer.autoClear = false; renderer.clearDepth(); renderer.render(overlay, camera); renderer.autoClear = true; list.forEach((c, i) => parents[i].add(c.root)); }
function placeInFront(c, t, a, b, side, dist = 2.4, drop = -1.55) {
  const f = camera.getWorldDirection(V(0, 0, 0)); const r = V().crossVectors(f, V(0, 1, 0)).normalize();
  const kin = easeBack(seg(t, a, a + 0.45)), kout = easeIn(seg(t, b - 0.35, b));
  const slide = side + (1 - kin) * 2.6 * Math.sign(side || 1) + kout * -3.0; const hop = Math.abs(Math.sin(seg(t, a, a + 0.45) * Math.PI)) * 0.5 + kout * 1.2;
  c.root.position.copy(camera.position.clone().add(f.clone().multiplyScalar(dist)).add(r.multiplyScalar(slide)).add(V(0, drop + hop, 0)));
  c.root.rotation.set(0, Math.atan2(-f.x, -f.z) - side * 0.25, 0);
}
function drawPause(h) { h.save(); h.fillStyle = 'rgba(10,10,30,0.85)'; h.fillRect(W / 2 - 90, 40, 180, 50); h.strokeStyle = '#ffe14a'; h.lineWidth = 2; h.strokeRect(W / 2 - 90, 40, 180, 50); h.fillStyle = '#ffe14a'; h.fillRect(W / 2 - 70, 52, 8, 26); h.fillRect(W / 2 - 56, 52, 8, 26); pxText(h, 'PAUSE', W / 2 + 16, 54, 16, '#ffe14a', 'center'); h.restore(); }
function wrapAr(g, s, size, maxW) { g.font = `${size}px Lalezar`; const w = s.split(' '); const out = []; let cur = ''; for (const x of w) { const c = cur ? cur + ' ' + x : x; if (g.measureText(c).width > maxW && cur) { out.push(cur); cur = x; } else cur = c; } if (cur) out.push(cur); return out; }
function drawSub(g, t) {
  const l = LINES.find(l => l.s === 'anno' && t >= l.t0 - 0.05 && t < l.t1 + 0.3); if (!l || !l.ar) return;
  const a = Math.min(1, (t - l.t0 + 0.05) / 0.25, (l.t1 + 0.3 - t) / 0.25); g.save(); g.globalAlpha = a; const lines = wrapAr(g, l.ar, 26, W - 70); const hh = 20 + lines.length * 38;
  g.fillStyle = 'rgba(0,0,0,0.6)'; g.fillRect(20, H - 70 - hh, W - 40, hh); lines.forEach((s, i) => arText(g, s, W / 2, H - 70 - hh + 6 + i * 38, 26, '#fff', 'center')); g.restore();
}
function drawTitleCard(g, t, e, title, sub) { if (t > e) return; const a = Math.min(1, t / 0.6, (e - t) / 0.5); g.save(); g.globalAlpha = a; g.fillStyle = 'rgba(0,0,0,0.55)'; g.fillRect(0, 90, W, 130); arText(g, title, W / 2, 96, 36, '#fff', 'center', 'ReemKufi'); arText(g, sub, W / 2, 152, 24, '#ffd890', 'center'); g.restore(); }
function drawTags(g, t, tags) { for (const [a, ar, en] of tags) { if (!inT(t, a, a + 2.6)) continue; const al = Math.min(1, (t - a) / 0.4, (a + 2.6 - t) / 0.4); g.save(); g.globalAlpha = al; g.fillStyle = 'rgba(0,0,0,0.55)'; g.fillRect(0, 70, W, 70); arText(g, ar, W / 2, 70, 30, '#ffe8b0', 'center', 'ReemKufi'); pxText(g, en, W / 2, 114, 10, '#ddd', 'center', false); g.restore(); } }
function drawCTAbox(g, t, a, l1, l2) { if (t < a || t >= DUR - 0.8) return; const k = easeBack(seg(t, a, a + 0.3)); g.save(); g.translate(W / 2, 140); g.scale(k, k); g.fillStyle = 'rgba(255,255,255,0.96)'; g.fillRect(-250, -54, 500, 108); g.fillStyle = '#d8231b'; g.fillRect(-250, 48, 500, 6); arText(g, l1, 0, -56, 32, '#111', 'center'); arText(g, l2, 0, -14, 30, '#d8231b', 'center'); g.restore(); }
for (const c of [mom, son, samir]) c.root.visible = false; scene.add(samir.root);
// =====================================================================
// الجيش اللي طلع من البير — Terracotta Army, 1974. Documentary, narrator Schedar. Ibrahim + Om Hamada pop in on a frozen frame. vertical 9:16
// NX1 village | NX2 digging, clay head | NX3 more figures | NX4 the whole army | POP Ibrahim (DX1) + Om Hamada (OX2 1) | NX5 emperor's mound | NX6 faces | NX7 colours fade | NX8 still buried | DX2 CTA at home
// =====================================================================
const POP = [DX(1).t0 - 0.55, OX2(1).t1 + 0.45];
const T_HOME = DX(2).t0 - 0.3;
const sceneAt = (t) => t < NX(2).t0 - 0.2 ? 'village' : t < NX(4).t0 - 0.2 ? 'dig' : t < NX(5).t0 - 0.2 ? 'army' : t < NX(6).t0 - 0.2 ? 'mound' : t < NX(7).t0 - 0.2 ? 'faces' : t < NX(8).t0 - 0.2 ? 'paint' : t < T_HOME ? 'buried' : 'home';
const AX = 2000; const site = new THREE.Group(); site.position.x = AX; scene.add(site);
const earthT = canvasTex(32, 32, (g) => { g.fillStyle = '#b89868'; g.fillRect(0, 0, 32, 32); g.fillStyle = '#a08050'; for (let i = 0; i < 30; i++) g.fillRect((i * 7) % 32, (i * 13) % 32, 3, 1); g.fillStyle = '#7a6040'; for (let i = 0; i < 6; i++) g.fillRect((i * 11) % 32, (i * 5) % 32, 1, 6); }); earthT.wrapS = earthT.wrapT = THREE.RepeatWrapping; earthT.repeat.set(60, 60);
const ground = mesh(new THREE.PlaneGeometry(500, 500), M(0xffffff, { map: earthT }), 0, 0, 0, site); ground.rotation.x = -Math.PI / 2;
// village: mud-brick houses, trees, distant hills
const villageG = new THREE.Group(); site.add(villageG);
{ const r = rng(4); for (let i = 0; i < 9; i++) { const hx = -40 + i * 9 + r() * 3, hz = -30 - r() * 10; mesh(box(6, 3.2, 5), P(0xc8a878), hx, 1.6, hz, villageG); const roof = mesh(box(6.6, 0.4, 5.6), P(0x5a5048), hx, 3.4, hz, villageG); mesh(box(1, 1.8, 0.1), P(0x4a3020), hx, 0.9, hz + 2.52, villageG); }
  for (let i = 0; i < 14; i++) { const tx = -60 + i * 9 + r() * 4, tz = -15 - r() * 20; mesh(cyl(0.15, 0.2, 3, 6), P(0x5a4030), tx, 1.5, tz, villageG); mesh(new THREE.IcosahedronGeometry(1.6, 0), P(0x6a7a3a), tx, 3.8, tz, villageG); }
  for (let i = 0; i < 7; i++) { const hl = mesh(new THREE.SphereGeometry(45 + r() * 20, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), P([0x8a8a5a, 0x7a7a4a][i % 2]), -180 + i * 60, 0, -240, site); hl.scale.y = 0.45; } }
// the well hole + soil pile + tools
const well = mesh(cyl(1.4, 1.4, 0.05, 16), M(0x3a2a1a), 0, 0.02, 0, site); const pile = mesh(new THREE.ConeGeometry(1.6, 1.1, 10), P(0xa88858), 2.6, 0.55, 0.6, site);
const clayHead = new THREE.Group(); scene.add(clayHead); mesh(new THREE.IcosahedronGeometry(0.32, 1), P(0x9a7a5a), 0, 0, 0, clayHead); mesh(box(0.16, 0.18, 0.12), P(0x8a6a4a), 0, 0.3, -0.05, clayHead);
// farmers (cast style, 1974 blue work clothes)
const farmers = []; for (let i = 0; i < 4; i++) { const f = makePerson(scene, { seed: i + 2, coat: [0x2a4a7a, 0x3a3a3a, 0x2a5a6a, 0x4a4a5a][i], legs: 0x2a2a3a, hat: i % 2 ? (h, t2, reg) => mesh(new THREE.ConeGeometry(0.42, 0.18, 10), reg(M(0xd8c890)), 0, 0.2, 0, h) : null }); farmers.push(f); }
const shovels = farmers.map(f => { const s = new THREE.Group(); f.arms[1].hand.add(s); mesh(box(0.04, 1.2, 0.04), P(0x6a4e30), 0, 0.2, 0, s); mesh(box(0.22, 0.28, 0.03), P(0x8a8e92), 0, -0.45, 0, s); return s; });
// the terracotta army in pits (rows), horses, a chariot
const PIT = new THREE.Group(); PIT.position.set(AX, 0, -60); scene.add(PIT);
mesh(box(40, 0.1, 50), M(0x9a7a52, { map: earthT }), 0, -3.0, 0, PIT);
for (let i = 0; i < 9; i++) mesh(box(1.2, 3, 50), M(0xb08a5a, { map: earthT }), -18 + i * 4.5, -1.5, 0, PIT); // earth walls between corridors
// ground around the open pit (a frame with a hole), so the army is visible from above
for (const [x, z, w, d] of [[0, -125, 300, 200], [0, 125, 300, 200], [-130, 0, 220, 50], [130, 0, 220, 50]]) { const g = mesh(new THREE.PlaneGeometry(w, d), M(0xffffff, { map: earthT }), x, 0, z, PIT); g.rotation.x = -Math.PI / 2; }
for (const [x, z, w, d] of [[0, -25, 40, 0.6], [0, 25, 40, 0.6], [-20, 0, 0.6, 50], [20, 0, 0.6, 50]]) mesh(box(w, 3, d), M(0xa08050, { map: earthT }), x, -1.5, z, PIT);
const clay = 0x9a7a5a, clayDark = 0x7a5e44;
const armorT = canvasTex(16, 16, (g) => { g.fillStyle = '#8a6c50'; g.fillRect(0, 0, 16, 16); g.fillStyle = '#6e5440'; for (let y = 0; y < 16; y += 3) for (let x = (y / 3) % 2 ? 0 : 2; x < 16; x += 4) g.fillRect(x, y, 3, 2); });
const EYES = ['flat', 'tired', 'side', 'smug', 'angry', 'sad', 'closed', 'wide'], MOUTHS = ['flat', 'frown', 'smile', 'clench', 'o'];
function makeWarrior(parent, seed, painted = false) {
  const c = makeChar({ seed: 500 + seed, skin: clay, hipY: 0.86, legX: 0.12, legColor: clayDark, shoe: clayDark, hand: clay,
    torsoGeo: cyl(0.27, 0.32, 0.66, 7), torsoTex: armorT, torsoColor: 0xffffff, torsoY: 0.33, skirt: cyl(0.32, 0.4, 0.4, 7), sleeve: true, sleeveColor: clayDark, shoulderX: 0.33, shoulderY: 0.58, neckY: 0.66, headR: 0.27,
    build(head, torso, reg) { mesh(new THREE.SphereGeometry(0.1, 6, 5), reg(M(clayDark)), 0.08, 0.27, -0.06, head); mesh(box(0.5, 0.06, 0.1), reg(M(clayDark)), 0, 0.3, 0.27, torso); return {}; } }, parent);
  applyPose(c, { ...POSE0, aRx: seed % 3 === 0 ? 0.9 : 0.2, eR: seed % 3 === 0 ? 1.3 : 0.3, aLx: 0.15 }); setFace(c, EYES[seed % EYES.length], MOUTHS[(seed * 3) % MOUTHS.length], { stache: seed % 2 === 0, stacheColor: '#5a4030' });
  return c;
}
const warriors = []; for (let j = 0; j < 8; j++) for (let s2 = 0; s2 < 2; s2++) for (let k = 0; k < 6; k++) { const w = makeWarrior(PIT, j * 12 + s2 * 6 + k); w.root.position.set(-15.75 + j * 4.5 + (s2 ? 0.9 : -0.9), -2.95, 22 - k * 2.4); warriors.push(w); }
function makeHorse(parent, x, z) { const h = new THREE.Group(); h.position.set(x, -2.95, z); parent.add(h); mesh(box(0.8, 0.8, 2.0), P(clay), 0, 1.3, 0, h); mesh(box(0.4, 0.9, 0.5), P(clay), 0, 1.9, -1.0, h).rotation.x = -0.5; mesh(box(0.35, 0.4, 0.7), P(clay), 0, 2.2, -1.45, h); for (const [a, b] of [[-0.28, -0.8], [0.28, -0.8], [-0.28, 0.8], [0.28, 0.8]]) mesh(box(0.16, 0.95, 0.16), P(clayDark), a, 0.48, b, h); return h; }
for (let i = 0; i < 4; i++) makeHorse(PIT, 17.6 - (i % 2) * 1.0 - 0.5, 8 - Math.floor(i / 2) * 2.6);
{ const ch = new THREE.Group(); ch.position.set(17.2, -2.95, 2); PIT.add(ch); mesh(box(1.6, 0.6, 1.4), P(0x6a4e30), 0, 1.0, 0, ch); for (const s of [-1, 1]) mesh(cyl(0.7, 0.7, 0.1, 12), P(0x5a3e20), s * 0.9, 0.7, 0, ch).rotation.z = Math.PI / 2; }
// the painted warrior that loses its colour
const pw = makeWarrior(scene, 7); const PWCOL = [[pw.mats, null]];
// the emperor's burial mound
const mound = new THREE.Group(); mound.position.set(AX + 300, 0, 0); scene.add(mound); mesh(new THREE.CylinderGeometry(40, 110, 50, 4), P(0x7a8a4a), 0, 25, -120, mound).rotation.y = Math.PI / 4; for (let i = 0; i < 20; i++) mesh(new THREE.IcosahedronGeometry(3, 0), P(0x4a6a2a), -60 + i * 6, 48 + (i % 3), -120 + (i % 4) * 5, mound);
const dirtPool = spritePool(puffTex, 20);
function stateAt(t) {
  const S = sceneAt(t);
  room.visible = S === 'home'; balcony.visible = kitchen.visible = hallway.visible = false; dad.root.visible = S === 'home'; mom.root.visible = false;
  const onSite = S === 'village' || S === 'dig'; site.visible = onSite || S === 'army' || S === 'faces' || S === 'buried'; PIT.visible = S === 'army' || S === 'faces' || S === 'buried'; ground.visible = !PIT.visible; villageG.visible = !PIT.visible; mound.visible = S === 'mound';
  well.visible = pile.visible = onSite; clayHead.visible = S === 'dig'; pw.root.visible = S === 'paint';
  farmers.forEach((f, i) => { f.root.visible = onSite; if (!onSite) return; const ang = i / 4 * 6.28 + 0.4; f.root.position.set(AX + Math.cos(ang) * 1.9, 0, Math.sin(ang) * 1.9); f.root.rotation.set(0, Math.atan2(-Math.cos(ang), -Math.sin(ang)), 0);
    const dig = S === 'dig' ? Math.sin(t * 5 + i * 1.4) : (S === 'village' && t > NX(1).t0 + 2 ? Math.sin(t * 4 + i) : 0);
    applyPose(f, { ...POSE0, bend: 0.35 + dig * 0.25, aRx: 1.2 + dig * 0.5, eR: 0.4, aLx: 1.0 + dig * 0.4, eL: 0.4 }); setFace(f, S === 'dig' && t > NX(2).t0 + 2.5 ? 'wide' : 'tired', S === 'dig' && t > NX(2).t0 + 2.5 ? 'o' : 'flat', {}); });
  // the head appears in the dirt, then more of the figure
  clayHead.position.set(AX + 0.2, -0.15 + Math.min(0.25, Math.max(0, t - NX(2).t0 - 2.0) * 0.2), 0.1); clayHead.rotation.set(0.4, 0.3, 0);
  // painted warrior: colour fades to clay over NX7
  if (S === 'paint') { const k = easeInOut(seg(t, NX(7).t0 + 1.8, NX(7).t1 - 0.5)); pw.root.position.set(AX + 500, 0, 0); pw.root.rotation.set(0, 0, 0);
    const painted = [0xd8231b, 0x2a6a4a, 0x2a3a8a, 0xd8a020, 0xf0e0c8]; pw.mats.forEach((m, i) => { const pc = new THREE.Color(painted[i % painted.length]); m.color.copy(pc).lerp(m.userData.orig, k); }); }
  if (S === 'home') { dad.root.position.set(0.2, 0, -1.0); dad.root.rotation.set(0, -0.15, 0); applyPose(dad, talkPose({ ...POSE0, aRx: 1.3, aRz: 0.5, eR: 0.4 }, t, 'dad', 0.3)); setFace(dad, 'sparkle', talkMouth(t, 'dad', 'grin') || 'smile', { stache: true }); homeLight(); return; }
  if (S === 'village' || S === 'dig') fixedLight(V(AX, 0, 0), 0xffe8c0, 0x806040, 0.85, 0xfff0d0, 1.2, 0xc8d8e8, 0xd8d0b8, 80, 500);
  else if (S === 'army' || S === 'faces' || S === 'buried') fixedLight(V(AX, 0, -60), 0xffe0b8, 0x705030, 0.8, 0xfff0d0, 1.0, 0xc8d0d8, 0xc8c0a8, 60, 400);
  else if (S === 'mound') fixedLight(V(AX + 300, 0, 0), 0xffc890, 0x504030, 0.75, 0xffa060, 1.0, 0xe8a070, 0xd89a70, 80, 600);
  else fixedLight(V(AX + 500, 0, 0), 0xfff0e0, 0x202020, 0.7, 0xffffff, 0.9, 0x111111, null);
}
function shotAt(t) {
  const S = sceneAt(t);
  if (S === 'village') { const k = easeInOut(seg(t, 0, NX(2).t0)); cam(V(AX + 22 - 12 * k, 14 - 8 * k, 26 - 14 * k), V(AX, 1, 0), 55); return; }
  if (S === 'dig') { if (t < NX(3).t0 - 0.2) { const k = easeInOut(seg(t, NX(2).t0, NX(3).t0)); cam(V(AX + 0.6, 6.0 - 2.0 * k, 3.4 - 0.6 * k), V(AX + 0.15, 0.0, 0.1), 50); return; } cam(V(AX + 5.5, 3.6, 5.5), V(AX, 0.6, 0), 56); return; }
  if (S === 'army') { const k = easeInOut(seg(t, NX(4).t0 - 0.2, NX(5).t0)); cam(V(AX + 3, 0.5 + 24 * k, -60 + 30 + 16 * k), V(AX, -2.5, -60 + 14 - 14 * k), 60); return; }
  if (S === 'mound') { const k = easeInOut(seg(t, NX(5).t0 - 0.2, NX(6).t0)); cam(V(AX + 300 + 90 - 30 * k, 30 - 10 * k, 80 - 20 * k), V(AX + 300, 25, -120), 55); return; }
  if (S === 'faces') { const k = easeInOut(seg(t, NX(6).t0 - 0.2, NX(7).t0)); const x = -16.6 + 25 * k; cam(V(AX + x, -1.2, -60 + 23.9), V(AX + x - 0.15, -1.3, -60 + 22), 50); return; }
  if (S === 'paint') { const k = easeInOut(seg(t, NX(7).t0 - 0.2, NX(8).t0)); cam(V(AX + 500 + 0.4, 1.55, 1.7 - 0.4 * k), V(AX + 500, 1.35, 0), 50); return; }
  if (S === 'buried') { const k = easeInOut(seg(t, NX(8).t0 - 0.2, T_HOME)); cam(V(AX + 20 + 30 * k, 22 + 30 * k, -20 + 40 * k), V(AX, -3, -60), 55); return; }
  faceCam(dad, 1.8 - 0.2 * seg(t, T_HOME, DUR), -0.2, 0.1, 56, 0.3);
}
function particles(t) { const S = sceneAt(t), d = []; if (S === 'dig' || (S === 'village' && t > NX(1).t0 + 2)) for (let i = 0; i < 16; i++) { const k = (t * 1.2 + i / 16) % 1; d.push({ pos: V(AX + Math.sin(i * 2.1) * 1.2, 0.2 + k * 1.2, Math.cos(i * 1.3) * 1.2), size: 0.3 + k * 0.6, op: 0.5 * (1 - k), color: 0xc8a878 }); }
  emit(d, dirtPool); emit([], starPool); emit([], puffPool); emit([], trailPool); emit([], sweatPool); }
const shovelPop = new THREE.Group(); dad.arms[1].hand.add(shovelPop); mesh(box(0.05, 1.3, 0.05), P(0x6a4e30), 0, 0.25, 0, shovelPop); mesh(box(0.26, 0.3, 0.03), P(0x8a8e92), 0, -0.45, 0, shovelPop); shovelPop.visible = false;
window.renderFrame = function (t) {
  const pop = t >= POP[0] && t < POP[1]; const ts = pop ? POP[0] : t;
  stateAt(ts); shotAt(ts); particles(ts);
  if (pop) { dad.root.visible = false; mom.root.visible = false; renderer.render(scene, camera);
    placeInFront(dad, t, POP[0], POP[1], -0.35); applyPose(dad, talkPose({ ...POSE0, aRx: 1.1, eR: 0.6, aRz: 0.3, aLz: 1.0 + Math.sin(t * 5) * 0.2, eL: 0.5 }, t, 'dad', 0.35)); setFace(dad, t > OX2(1).t0 ? 'wide' : 'sparkle', talkMouth(t, 'dad', 'grin') || (t > OX2(1).t0 ? 'o' : 'grin'), { stache: true }); shovelPop.visible = true;
    const list = [dad]; if (t > OX2(1).t0 - 0.35) { placeInFront(mom, t, OX2(1).t0 - 0.35, POP[1], 0.55, 2.9); applyPose(mom, talkPose({ ...POSE0, aLz: 0.5, aRz: 0.5, eL: 2.0, eR: 2.0, aLx: 0.6, aRx: 0.6 }, t, 'mom', 0.3)); setFace(mom, 'smug', talkMouth(t, 'mom') || 'flat', {}); list.push(mom); }
    renderOverlay(list); shovelPop.visible = false;
  } else renderer.render(scene, camera);
  ctx.clearRect(0, 0, W, H); ctx.drawImage(glCanvas, 0, 0);
  h.clearRect(0, 0, W, H);
  if (pop) drawPause(h);
  if (sceneAt(t) === 'home' || pop) drawDialogueV(h, t); else drawSub(h, t);
  drawTitleCard(h, t, NX(1).t1 + 0.2, 'الجيش اللي طلع من البير', 'قصة حقيقية • الصين ١٩٧٤');
  drawTags(h, t, [[NX(5).t0 - 0.2, 'قبر الإمبراطور', 'THE FIRST EMPEROR'], [NX(7).t0 - 0.2, 'الألوان الأصلية', 'THE ORIGINAL COLOURS']]);
  drawCTAbox(h, t, DX(2).t0, 'لو حفرنا تحت بيتنا هنلاقي إيه؟ 👇', 'اكتبولي في الكومنتات');
  ctx.drawImage(hud, 0, 0); vignette(ctx, 0.35);
  if (t > DUR - 0.8) { ctx.fillStyle = `rgba(0,0,0,${clamp((t - DUR + 0.8) / 0.8)})`; ctx.fillRect(0, 0, W, H); }
  return true;
};
window.frameData = () => out.toDataURL('image/png');
window.DUR = DUR;
document.fonts.load('10px PS2P').then(() => document.fonts.load('20px Lalezar', 'ع')).then(() => document.fonts.load('700 20px ReemKufi', 'ع')).then(() => { window.READY = true; });
