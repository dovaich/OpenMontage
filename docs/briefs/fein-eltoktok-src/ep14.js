// =====================================================================
// فين التوكتوك؟ — Hoda's quest to find his tuk-tuk
// =====================================================================
room.visible = false; hallway.visible = false; balcony.visible = true;
samir.root.visible = false; skyB.visible = false; streetGlow.visible = false;
scene.fog = null; tvLight.intensity = 0; hallLight.intensity = 0;
const inT = (t, a, b) => t >= a && t < b;
const sun = new THREE.DirectionalLight(0xfff2dc, 0); sun.position.set(3, 8, 6); scene.add(sun);
function setFace(c, eyes, mouth, opts = {}) { c.faceMat.map = faceTexture(eyes, mouth, opts); c.faceMat.needsUpdate = true; }
function txtTex(w, h, bg, fn) { const t = canvasTex(w, h, (g) => { if (bg) { g.fillStyle = bg; g.fillRect(0, 0, w, h); } if (fn) fn(g, w, h); }); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; }
function arC(g, s, x, y, size, col, font = 'Lalezar') { g.font = `${size}px ${font}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.direction = 'rtl'; g.fillStyle = col; g.fillText(s, x, y); }
const lateDraw = [];
// scene boundaries
const T_G = 3.0, T_MK = 22.6, T_SY = 38.6, T_BAL = 55.0, T_CLUE1 = 19.95, T_ITEM = 35.5, T_CLUE3 = 52.1, T_SAG = 80.2;

// =====================================================================
// THE SERVICE CENTER (garage from «مركز الصيانة», moved to x = -100)
// =====================================================================
${GARAGE}
garage.position.x = -100;
lateDraw.push(() => { const c = signT.image.getContext('2d'); c.fillStyle = '#d8231b'; c.fillRect(0, 0, 160, 32); c.fillStyle = '#fff'; c.fillRect(0, 0, 160, 3); c.fillRect(0, 29, 160, 3); c.font = '18px Lalezar'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.direction = 'rtl'; c.fillText('مركز العالمي لصيانة السيارات', 80, 16); signT.needsUpdate = true; });
const G = -100;
const alamy = makeAlamy(scene);
const laptopA = new THREE.Group(); scene.add(laptopA);
mesh(box(0.42, 0.025, 0.3), P(0x3a3a44), 0, 0, 0, laptopA);
{ const lid = new THREE.Group(); lid.position.set(0, 0.0125, -0.15); laptopA.add(lid); lid.rotation.x = -0.35; mesh(box(0.42, 0.28, 0.015), P(0x3a3a44), 0, 0.14, -0.008, lid); mesh(new THREE.PlaneGeometry(0.38, 0.24), new THREE.MeshBasicMaterial({ color: 0x0a3a6a }), 0, 0.14, 0.001, lid); }

// =====================================================================
// THE MARKET (x = 200)
// =====================================================================
const MK = 200;
const melonT = txtTex(16, 16, '#3f8a2f', (g) => { g.fillStyle = '#1f5a1f'; for (let i = 0; i < 16; i += 4) g.fillRect(i, 0, 2, 16); });
const signM = txtTex(64, 20, '#ffe14a');
lateDraw.push(() => { const g = signM.userData.g; g.fillStyle = '#ffe14a'; g.fillRect(0, 0, 64, 20); arC(g, 'بطيخ مستورد', 32, 11, 13, '#c11'); signM.needsUpdate = true; });
{
  mesh(new THREE.PlaneGeometry(50, 30), M(0xb8ab8e), MK, 0, 0, scene).rotation.x = -Math.PI / 2;
  for (let i = -3; i <= 3; i++) { mesh(box(4.6, 5 + (i % 2) * 1.5, 1), M([0xd8b080, 0xc99a5a, 0xb48a6a][(i + 3) % 3]), MK + i * 4.8, 2.5, -7, scene); mesh(new THREE.PlaneGeometry(2.4, 2.2), M(0x2a2018), MK + i * 4.8, 1.2, -6.49, scene); }
  const awnT = txtTex(16, 16, '#fff', (g) => { for (let i = 0; i < 4; i++) { g.fillStyle = i % 2 ? '#fff' : '#d8231b'; g.fillRect(i * 4, 0, 4, 16); } }); awnT.repeat.set(3, 1);
  const st = new THREE.Group(); st.position.set(MK, 0, -2.6); scene.add(st);
  mesh(box(3.0, 0.7, 1.4), M(0x8a5a2b, { map: woodTex }), 0, 0.35, 0, st);
  for (const sx of [-1.45, 1.45]) for (const sz of [-0.65, 0.65]) mesh(box(0.06, 2.4, 0.06), M(0x6a4220), sx, 1.2, sz, st);
  mesh(box(3.3, 0.06, 1.8), M(0xffffff, { map: awnT }), 0, 2.45, 0.1, st).rotation.x = -0.15;
  mesh(new THREE.PlaneGeometry(1.4, 0.44), new THREE.MeshBasicMaterial({ map: signM }), 0, 2.0, 0.66, st);
  for (let i = 0; i < 18; i++) { const m = mesh(new THREE.SphereGeometry(0.24, 7, 5), M(0xffffff, { map: melonT }), -1.1 + (i % 6) * 0.44, 0.92 + Math.floor(i / 6) * 0.36, -0.35 + (Math.floor(i / 6) % 2) * 0.3, st); m.scale.set(1.3, 1, 1); }
  // a "broken melons: 2 for 5" crate in front
  const crate = mesh(box(0.9, 0.35, 0.6), M(0x8a5a2b, { map: woodTex }), MK - 1.0, 0.18, -1.3, scene);
  for (let i = 0; i < 4; i++) { const h = new THREE.Group(); h.position.set(MK - 1.25 + (i % 2) * 0.45, 0.42, -1.4 + Math.floor(i / 2) * 0.25); scene.add(h); mesh(new THREE.SphereGeometry(0.17, 7, 4, 0, Math.PI * 2, 0, Math.PI / 2), M(0x2f7a2f, { side: THREE.DoubleSide }), 0, 0, 0, h).rotation.x = Math.PI; mesh(new THREE.CircleGeometry(0.16, 8), M(0xe8303a), 0, 0.001, 0, h).rotation.x = -Math.PI / 2; }
  const priceT = txtTex(48, 20, '#fff'); lateDraw.push(() => { const g = priceT.userData.g; g.fillStyle = '#fff'; g.fillRect(0, 0, 48, 20); arC(g, '٢ بـ ٥', 24, 11, 13, '#c11'); priceT.needsUpdate = true; });
  mesh(new THREE.PlaneGeometry(0.5, 0.2), new THREE.MeshBasicMaterial({ map: priceT }), MK - 1.0, 0.25, -0.99, scene);
}
const shehata = makeChar({
  seed: 51, skin: 0x9a6440, hipY: 0.86, legX: 0.14, legColor: 0x4a5a7a, shoe: 0x3a2a1a, hand: 0x9a6440,
  torsoGeo: cyl(0.34, 0.46, 0.7, 7), torsoTex: canvasTex(16, 16, (g) => { g.fillStyle = '#e8eef8'; g.fillRect(0, 0, 16, 16); g.fillStyle = '#3a5aa8'; g.fillRect(0, 0, 2, 16); g.fillRect(6, 0, 2, 16); g.fillRect(12, 0, 2, 16); }, [3, 2]), torsoColor: 0xffffff, torsoY: 0.35,
  skirt: cyl(0.46, 0.5, 0.7, 7), sleeve: true, shoulderX: 0.44, shoulderY: 0.62, neckY: 0.7, headR: 0.3,
  build(head, torso, reg) { mesh(new THREE.SphereGeometry(0.31, 8, 4, 0, Math.PI * 2, 0, Math.PI * 0.35), reg(M(0xf2f2f2)), 0, 0.04, 0, head); mesh(box(0.7, 0.55, 0.05), reg(M(0xd8c8a0)), 0, 0.25, 0.42, torso); return {}; }
}, scene);

// =====================================================================
// THE BUILDING DOOR (x = 300): Uncle Sayed + the only lit balcony
// =====================================================================
const SY = 300;
{
  mesh(new THREE.PlaneGeometry(40, 24), M(0x6a6458), SY, 0, 0, scene).rotation.x = -Math.PI / 2;
  mesh(box(12, 15, 0.4), M(0xb89a70), SY, 7.5, -1.8, scene);
  mesh(new THREE.PlaneGeometry(1.3, 2.3), M(0x2a1e14), SY + 1.2, 1.15, -1.59, scene);
  for (let c = -2; c <= 2; c++) for (let r = 0; r < 4; r++) if (!(c === 1 && r === 0) && !(c === 1 && r === 2)) mesh(new THREE.PlaneGeometry(0.8, 1.0), M(0x1a2236), SY + c * 2.2, 2.0 + r * 3.3, -1.59, scene);
  mesh(box(1.8, 0.45, 0.55), M(0x8a5a2b, { map: woodTex }), SY - 0.4, 0.225, -1.1, scene);
  const plate = txtTex(64, 20, '#1f5fd8'); lateDraw.push(() => { const g = plate.userData.g; g.fillStyle = '#1f5fd8'; g.fillRect(0, 0, 64, 20); arC(g, 'عمارة ١٢', 32, 11, 13, '#fff'); plate.needsUpdate = true; });
  mesh(new THREE.PlaneGeometry(0.8, 0.25), new THREE.MeshBasicMaterial({ map: plate }), SY + 1.2, 2.55, -1.58, scene);
  // the lit balcony (3rd floor): slab, railing, glowing door, the tuk's red nose
  mesh(box(2.4, 0.15, 1.0), M(0x9a8a78), SY + 2.2, 7.6, -1.1, scene);
  mesh(box(2.4, 0.06, 0.06), P(0x3a3a3a), SY + 2.2, 8.5, -0.62, scene);
  for (let i = 0; i < 12; i++) mesh(box(0.025, 0.9, 0.025), P(0x3a3a3a), SY + 1.05 + i * 0.21, 8.05, -0.62, scene);
  mesh(new THREE.PlaneGeometry(0.9, 1.9), new THREE.MeshBasicMaterial({ color: 0xffd890 }), SY + 2.5, 8.6, -1.585, scene);
  mesh(box(0.9, 0.7, 0.6), P(0xd8231b), SY + 1.6, 8.05, -1.0, scene);
  for (let i = 0; i < 9; i++) mesh(new THREE.SphereGeometry(0.06, 5, 4), new THREE.MeshBasicMaterial({ color: [0xffd400, 0xff3355, 0x33cc66][i % 3] }), SY + 1.1 + i * 0.24, 8.9 + Math.sin(i) * 0.06, -0.6, scene);
  // poster: MISSING
  const post = txtTex(48, 64, '#f4f0e0'); lateDraw.push(() => { const g = post.userData.g; g.fillStyle = '#f4f0e0'; g.fillRect(0, 0, 48, 64); arC(g, 'مفقود', 24, 10, 15, '#c11'); g.fillStyle = '#d8231b'; g.fillRect(10, 24, 28, 16); g.fillStyle = '#111'; g.fillRect(12, 40, 6, 6); g.fillRect(30, 40, 6, 6); arC(g, 'توكتوك ٣٠٠٠', 24, 54, 9, '#111'); post.needsUpdate = true; });
  mesh(new THREE.PlaneGeometry(0.6, 0.8), new THREE.MeshBasicMaterial({ map: post }), SY - 2.4, 1.6, -1.585, scene);
  // other dark buildings + street lamps (off)
  for (let i = 0; i < 6; i++) { const x = SY - 22 + i * 8 + (i > 2 ? 12 : 0), hh = 10 + (i % 3) * 4; mesh(box(6, hh, 4), M(0x2a2e3a), x, hh / 2, -6, scene); }
}
const balGlow = new THREE.PointLight(0xffd08a, 0, 9, 1.2); balGlow.position.set(SY + 2.2, 8.6, -0.4); scene.add(balGlow);
const sayed = makeChar({
  seed: 41, skin: 0x8a5a3a, hipY: 0.84, legX: 0.12, legColor: 0x6b5a48, shoe: 0x3a2a1a, hand: 0x8a5a3a,
  torsoGeo: cyl(0.28, 0.34, 0.66, 7), torsoTex: null, torsoColor: 0x6b5a48, torsoY: 0.33,
  skirt: cyl(0.34, 0.44, 0.75, 7), sleeve: true, sleeveColor: 0x6b5a48, shoulderX: 0.34, shoulderY: 0.6, neckY: 0.66, headR: 0.28,
  build(head, torso, reg) { const tw = reg(M(0xf4f2ea)); const turban = mesh(new THREE.TorusGeometry(0.24, 0.09, 5, 10), tw, 0, 0.2, -0.02, head); turban.rotation.x = Math.PI / 2; mesh(new THREE.SphereGeometry(0.2, 7, 4, 0, Math.PI * 2, 0, Math.PI / 2), tw, 0, 0.22, -0.02, head); mesh(box(0.62, 0.1, 0.05), reg(M(0xd8d0b8)), 0, 0.45, 0.24, torso); return {}; }
}, scene);
const melonHalf = new THREE.Group(); scene.add(melonHalf);
mesh(new THREE.SphereGeometry(0.2, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), M(0x2f7a2f, { side: THREE.DoubleSide }), 0, 0, 0, melonHalf).rotation.x = Math.PI;
mesh(new THREE.CircleGeometry(0.19, 8), M(0xe8303a), 0, 0.001, 0, melonHalf).rotation.x = -Math.PI / 2;

// =====================================================================
// THE BALCONY (engine8 at the origin) + the plugged-in tuk-tuk
// =====================================================================
${BASTAM}
tuk.add(engine6); engine6.position.set(0.9, 0.35, 0); bay.visible = false; engine6.visible = true;
const TUK_LAND = V(-1.55, 0, 0.05); tuk.position.copy(TUK_LAND); tuk.rotation.set(0, 0.25, 0.06);
const engGlow = mesh(new THREE.CircleGeometry(0.15, 8), new THREE.MeshBasicMaterial({ color: 0xff6a10 }), 0, 0.04, 0, eng6pan); engGlow.rotation.x = -Math.PI / 2;
const socket = mesh(box(0.12, 0.16, 0.03), P(0xf0f0f0), 0.9, 0.4, -1.27, balcony);
const cable = new THREE.Line(new THREE.BufferGeometry().setFromPoints([V(0, 0, 0), V(0, 0, 0), V(0, 0, 0), V(0, 0, 0)]), new THREE.LineBasicMaterial({ color: 0x111111 })); scene.add(cable);
const doorLight = new THREE.PointLight(0xffd08a, 1.6, 7, 1.2); doorLight.position.set(1.7, 1.6, -0.6); scene.add(doorLight);
const bulb = mesh(new THREE.SphereGeometry(0.07, 6, 5), new THREE.MeshBasicMaterial({ color: 0xfff0b0 }), 1.35, 2.05, 0.6, scene);
const bulbLight = new THREE.PointLight(0xfff0b0, 1.6, 4, 1.4); bulbLight.position.set(1.35, 1.95, 0.6); scene.add(bulbLight);
const plates = []; for (let i = 0; i < 4; i++) plates.push(mesh(cyl(0.12, 0.1, 0.03, 10), P(0xffffff), -0.75 + i * 0.5, 0.07, -0.2, scene));
laundry.forEach(c => c.visible = false); mattress.scale.y = 0.4; mattress.position.y = 0.03; blanket.position.y = 0.08; pillowB.position.set(-0.35, 0.12, -0.95);
// the city across the street: dark, with a few lit windows only in our building
{ const r = rng(77); for (let i = 0; i < 22; i++) { const x = -20 + i * 1.9 + (r() - .5), z = 8 + r() * 16, top = -1 + r() * 9, bot = -10, ww = 2.6 + r() * 1.5, hh = top - bot; mesh(box(ww, hh, 3), M([0x1c2030, 0x221f1c, 0x191d2a][i % 3]), x, bot + hh / 2, z, scene); } }
const stars = new THREE.Points(new THREE.BufferGeometry().setFromPoints(Array.from({ length: 260 }, (_, i) => { const a = hash(i) * 6.28, b = 0.15 + hash(i + 7) * 1.2; return V(Math.cos(a) * Math.cos(b) * 70, Math.sin(b) * 70, Math.sin(a) * Math.cos(b) * 70 + 10); })), new THREE.PointsMaterial({ color: 0xffffff, size: 2, sizeAttenuation: false }));
scene.add(stars);

// ---------- Hoda ----------
${HODA}
const carryMelons = []; for (let i = 0; i < 2; i++) { const m = mesh(new THREE.SphereGeometry(0.22, 7, 5), M(0xffffff, { map: melonT }), 0, 0, 0, hoda.arms[i].hand); m.scale.set(1.3, 1, 1); m.position.set(0, -0.12, 0.12); carryMelons.push(m); }

// ---------- state ----------
function where(t) { return t < T_G ? 'open' : t < T_MK ? 'garage' : t < T_SY ? 'market' : t < T_BAL ? 'door' : 'balcony'; }
function walk(t, a, b, p0, p1) { const k = easeInOut(seg(t, a, b)); return { p: VL(p0, p1, k), moving: t > a && t < b }; }
function stateAt(t) {
  const W_ = where(t);
  // ----- Hoda -----
  let hp = { ...POSE0 }, pos, rot = 0, moving = false;
  if (W_ === 'open') { pos = V(SY - 2.4, 0, -0.95); rot = Math.PI; hp.aLx = 2.6; hp.eL = 0.2; hp.aRx = 2.4; hp.eR = 0.3; }
  else if (W_ === 'garage') { const w = walk(t, T_G, 5.4, V(G + 9, 0, 0.2), V(G + 5.6, 0, 0.7)); pos = w.p; moving = w.moving; rot = -Math.PI / 2 - 0.3; if (inT(t, 14.2, 15.3)) { hp.aLz = 0.9; hp.aRz = 0.9; } }
  else if (W_ === 'market') { const w = walk(t, T_MK, 23.2, V(MK - 3.5, 0, 1.4), V(MK - 0.9, 0, 0.6)); pos = w.p; moving = w.moving; rot = 1.2;
    if (inT(t, 30.1, 32.5)) { hp.aLz = 0.7; hp.aRz = 0.7; hp.eL = hp.eR = 1.2; }
    if (t >= T_ITEM - 0.6) { const w2 = walk(t, T_ITEM, 38.6, V(MK - 0.9, 0, 0.6), V(MK - 3.0, 0, 2.2)); pos = w2.p; moving = w2.moving; rot = t > T_ITEM ? -2.2 : 1.2; hp.aLx = hp.aRx = 1.1; hp.eL = hp.eR = 0.9; } }
  else if (W_ === 'door') { const w = walk(t, T_SY, 39.0, V(SY + 2.5, 0, 1.6), V(SY + 0.7, 0, -0.3)); pos = w.p; moving = w.moving; rot = -1.9;
    hp.aLx = hp.aRx = 1.1; hp.eL = hp.eR = 0.9; if (t >= 46.3) { hp.aLx = 1.1; hp.eL = 0.9; hp.aRx = 0.2; hp.eR = 0.2; } if (t >= 52.1) { hp.hx = -0.6; } }
  else { const w = walk(t, T_BAL, 55.6, V(1.7, 0, -1.7), V(1.15, 0, -0.05)); pos = w.p; moving = w.moving; rot = -1.5;
    if (inT(t, 55.4, 57.9)) { hp.aLz = 2.4; hp.aRz = 2.4; hp.eL = hp.eR = 0.3; }
    if (inT(t, 58.2, 70.4)) rot = -0.4; if (inT(t, 62.3, 64.8)) { hp.aLx = 1.2; hp.eL = 1.6; hp.aRx = 1.2; hp.eR = 1.6; hp.hz = 0.15; }
    if (t >= 70.4 && t < T_SAG) { const k = easeInOut(seg(t, 70.4, 71.0)); pos = VL(V(1.15, 0, -0.05), V(0.7, 0, 0.55), k); rot = lerp(-0.4, 2.5, k); if (inT(t, 75.6, 76.5)) { hp.aLx = hp.aRx = 0.9; hp.eL = hp.eR = 1.7; } }
    if (t >= T_SAG) { pos = V(0.6, 0, -0.75); rot = 0; Object.assign(hp, { y: -0.5, lL: 1.45, lR: 1.45, aLx: 0.7, eL: 1.2, aRx: 0.7, eR: 1.2 }); } }
  if (moving) { const ph = t * 11; hp.lL = Math.sin(ph) * 0.6; hp.lR = -Math.sin(ph) * 0.6; hp.aLx += -Math.sin(ph) * 0.5; hp.aRx += Math.sin(ph) * 0.5; hp.y += Math.abs(Math.sin(ph)) * 0.04; }
  hoda.root.position.copy(pos); hoda.root.rotation.set(0, rot, 0); applyPose(hoda, hp);
  carryMelons.forEach((m, i) => m.visible = t >= T_ITEM - 0.6 && t < 46.3 + (i ? 99 : 0) && t < T_BAL);
  let he = 'wide', hm = talkMouth(t, 'hoda', 'scream') || 'o';
  if (W_ === 'open') { he = 'sad'; hm = 'frown'; } if (inT(t, 20, 22.6)) { he = 'side'; hm = 'flat'; } if (inT(t, T_ITEM, 38.6)) { he = 'tired'; hm = 'frown'; }
  if (inT(t, 46.3, 48)) { he = 'flat'; hm = 'flat'; } if (t >= 52.1 && t < T_BAL) { he = 'sparkle'; hm = 'grin'; }
  if (inT(t, 62.3, 64.8)) { he = 'tears'; hm = talkMouth(t, 'hoda', 'scream') || 'wobble'; } if (inT(t, 65.1, 70.4)) { he = 'flat'; hm = 'flat'; }
  if (inT(t, 75.6, 80.2)) { he = 'sparkle'; hm = talkMouth(t, 'hoda') || 'grin'; } if (t >= T_SAG) { he = 'wide'; hm = 'o'; }
  setFace(hoda, he, hm, {});

  // ----- El-Alamy at the office corner -----
  alamy.root.position.set(G + 3.7, 0, 1.6); alamy.root.rotation.set(0, Math.PI / 2 - 0.25, 0);
  { const p = { ...POSE0, aLx: 0.9, eL: 1.1, aRx: 0.9, eR: 1.1, hx: 0.1 }; if (speakerAt(t) === 'alamy') { p.aRx = 1.3 + envAt(t) * 0.4; p.eR = 0.8; p.hy = 0.2; } applyPose(alamy, p);
    const a = alamy.arms[0].hand.getWorldPosition(V(0, 0, 0)), b = alamy.arms[1].hand.getWorldPosition(V(0, 0, 0)); laptopA.position.copy(a.add(b).multiplyScalar(0.5)).add(V(0, -0.02, 0)); laptopA.rotation.set(0, alamy.root.rotation.y + Math.PI, 0);
    setFace(alamy, 'smug', talkMouth(t, 'alamy') || 'smile', ALAMY_FACE); }
  // ----- Shehata -----
  shehata.root.position.set(MK + 0.7, 0, -0.9); shehata.root.rotation.set(0, -0.6, 0);
  { const p = { ...POSE0 }; if (inT(t, 25.8, 30)) { p.aRx = 1.6; p.eR = 0.2; p.aLz = 0.6; } if (inT(t, 32.8, 35.5)) { p.aRx = 0.8; p.eR = 1.0; p.aRz = 0.4; p.aLz = 0.3; }
    applyPose(shehata, talkPose(p, t, 'shehata'));
    setFace(shehata, inT(t, 25.8, 32.8) ? 'angry' : inT(t, 32.8, 36) ? 'smug' : 'default', talkMouth(t, 'shehata', 'scream') || (inT(t, 32.8, 36) ? 'grin' : 'frown'), { stache: true }); }
  // ----- Sayed -----
  sayed.root.position.set(SY - 0.4, 0, -1.15); sayed.root.rotation.set(0, 0.35, 0);
  { const p = { ...POSE0, y: -0.38, lL: 1.5, lR: 1.5, aRx: 0.5, eR: 0.9, aLz: 0.3, aLx: 0.4, eL: 0.6 }; const eat = t >= 46.6;
    if (eat) { p.aRx = 1.2 + (inT(t, 46.6, 48) ? Math.sin(t * 10) * 0.15 : 0); p.eR = 1.6; }
    applyPose(sayed, talkPose(p, t, 'sayed', 0.3));
    melonHalf.visible = eat && t < T_BAL; if (melonHalf.visible) melonHalf.position.copy(sayed.arms[1].hand.getWorldPosition(V(0, 0, 0))).add(V(0, 0.1, 0.05));
    setFace(sayed, inT(t, 41.8, 46.3) ? 'side' : eat ? 'closed' : 'tired', talkMouth(t, 'sayed') || (eat ? (Math.floor(t * 6) % 2 ? 'talk1' : 'closed') : 'smile'), { stache: true, stacheColor: '#dddddd' }); }
  // ----- the balcony family -----
  dad.root.position.set(-0.15, 0, -0.55); dad.root.rotation.set(0, 0.9, 0);
  { let p = { ...POSE0 }; if (inT(t, 58.2, 62.0)) { p.aLz = 0.6; p.aRx = 0.8; p.eR = 0.3; p.aRz = 0.5; } if (inT(t, 65.1, 69.8)) { p.aRx = 0.9; p.eR = 0.5; p.aRz = 0.2; }
    if (t >= T_SAG) { dad.root.position.set(-0.05, 0, -0.75); dad.root.rotation.set(0, 0, 0); p = { ...POSE0, y: -0.5, lL: 1.45, lR: 1.45, aLx: 0.7, eL: 1.2, aRx: 0.7, eR: 1.2 }; }
    applyPose(dad, talkPose(p, t, 'dad')); setFace(dad, t >= T_SAG ? 'wide' : 'smug', talkMouth(t, 'dad', 'grin') || (t >= T_SAG ? 'o' : 'smile'), { stache: true }); }
  bastam.root.position.set(-0.75, 0, -0.75); bastam.root.rotation.set(0, 0.2, 0);
  applyPose(bastam, { ...POSE0, y: -0.5, lL: 1.45, lR: 1.45, aRx: 0.9 + (Math.floor(t * 2) % 2) * 0.3, eR: 1.6, aLx: 0.7, eL: 1.2 });
  setFace(bastam, t >= T_SAG ? 'wide' : 'closed', t >= T_SAG ? 'o' : (Math.floor(t * 4) % 2 ? 'talk1' : 'closed'), { fuzz: true });
  son.root.position.set(-1.25, 0, -0.75); son.root.rotation.set(0, 0.35, 0);
  applyPose(son, { ...POSE0, y: -0.5, lL: 1.45, lR: 1.45, aRx: 1.0, eR: 1.5, aLx: 0.6, eL: 1.0, hx: 0.3 }); setFace(son, t >= T_SAG ? 'wide' : 'tired', 'flat', {});
  const momIn = t >= 70.0 && t < 80.6; mom.root.visible = momIn;
  if (momIn) { const k = easeOut(seg(t, 70.0, 70.6)); const k2 = easeIn(seg(t, 80.0, 80.6)); mom.root.position.copy(VL(VL(V(1.7, 0, -1.7), V(1.75, 0, -0.85), k), V(1.7, 0, -1.7), k2)); mom.root.rotation.set(0, -0.5 + k2 * 3.0, 0);
    const p = { ...POSE0, aRz: 0.15, aLz: 0.15 }; if (inT(t, 76.8, 80)) { p.aLx = 1.4; p.eL = 0.1; p.aLz = 0.5; } applyPose(mom, talkPose(p, t, 'mom', 0.4));
    setFace(mom, inT(t, 70.4, 75.4) ? 'default' : 'smug', talkMouth(t, 'mom') || 'smile', {}); }
  // tuk engine + cable
  engGlow.material.color.setHex(Math.floor(t * 10) % 2 ? 0xff8a20 : 0xff5a10);
  { const e = engine6.getWorldPosition(V(0, 0, 0)).add(V(0, 0.3, 0)); const sk = socket.getWorldPosition(V(0, 0, 0)).add(V(0, 0, 0.05)); cable.geometry.setFromPoints([e, VL(e, sk, 0.33).add(V(0, -0.35, 0)), VL(e, sk, 0.66).add(V(0, -0.3, 0)), sk]); }
  // the balcony sags under four people
  { const k = t >= T_SAG ? easeBack(seg(t, T_SAG, T_SAG + 0.5)) : 0; const wob = t >= T_SAG ? Math.sin(t * 20) * 0.01 * Math.exp(-(t - T_SAG) * 0.8) : 0; balcony.position.y = -0.06 * k + wob; balcony.rotation.z = 0.025 * k; }
  balGlow.intensity = 2.2 * (0.9 + 0.1 * Math.sin(t * 13));
}
function talkPose(p, t, who, amt = 1) { if (speakerAt(t) !== who) return p; const e = envAt(t) * amt; p.aRx += e * 0.35 * (1 + Math.sin(t * 5.3)); p.eR += e * 0.5; p.hy += Math.sin(t * 2.1) * 0.08; return p; }

// ---------- lighting ----------
function look(kind, t) {
  const L = { day: [0xfff4e0, 0.75, 0x8ec8ff, 1.0, 0], evening: [0x6070b0, 0.5, 0x1a2244, 0.15, 0.35], night: [0x5060a0, 0.42, 0x060a1a, 0, 0.35] }[kind];
  ambient.color.setHex(L[0]); ambient.intensity = L[1]; scene.background = new THREE.Color(L[2]); sun.intensity = L[3]; moon.intensity = L[4];
  doorLight.intensity = kind === 'night' ? 1.6 : 0; bulbLight.intensity = kind === 'night' ? 1.6 : 0; balcLight.intensity = 0;
}

// ---------- shots ----------
function shotAt(t) {
  if (t < T_G) { look('evening', t); const k = easeInOut(seg(t, 0, T_G)); cam(VL(V(SY - 1.0, 1.5, 2.2), V(SY - 1.5, 1.6, 1.4), k), V(SY - 2.4, 1.4, -1.5), 46); return; }
  if (t < 8.11) { look('day', t); cam(V(G + 5.2, 1.7, 3.8), VL(V(G + 8, 1.2, 0.2), headOf(hoda).add(V(0, -0.3, 0)), easeInOut(seg(t, T_G, 5.4))), 52); return; }
  if (t < 14.21) { look('day', t); faceCam(alamy, 2.3, 0.55, 0.15, 44, 0.3); return; }
  if (t < 15.61) { look('day', t); faceCam(hoda, 1.9, -0.4, 0.05, 44, 0.2); return; }
  if (t < T_MK) { look('day', t); if (t < 19.9) faceCam(alamy, 2.3, 0.55, 0.15, 44, 0.3); else cam(V(G + 6.6, 1.8, 3.9), V(G + 4.8, 1.2, 0.9), 50); return; }
  if (t < 25.88) { look('day', t); cam(V(MK - 0.6, 1.7, 4.2), V(MK - 0.2, 1.1, -0.6), 50); return; }
  if (t < 30.19) { look('day', t); faceCam(shehata, 2.2, 0.45, 0.05, 44, 0.25); return; }
  if (t < 32.88) { look('day', t); faceCam(hoda, 1.9, -0.45, 0.05, 44, 0.2); return; }
  if (t < T_ITEM) { look('day', t); faceCam(shehata, 2.3, 0.6, 0.05, 44, 0.25); return; }
  if (t < T_SY) { look('day', t); cam(V(MK - 1.5, 1.4, 4.6), headOf(hoda).add(V(0, -0.5, 0)), 48); return; }
  if (t < 41.85) { look('evening', t); cam(V(SY + 1.6, 1.5, 3.2), V(SY + 0.1, 1.0, -0.8), 50); return; }
  if (t < 46.3) { look('evening', t); faceCam(sayed, 2.1, -0.55, 0.05, 44, 0.3); return; }
  if (t < 48.07) { look('evening', t); cam(V(SY + 1.0, 1.3, 2.4), V(SY + 0.1, 0.8, -0.8), 48); return; }
  if (t < T_CLUE3) { look('evening', t); faceCam(sayed, 2.0, -0.55, 0.05, 44, 0.3); return; }
  if (t < T_BAL) { look('evening', t); const k = easeInOut(seg(t, T_CLUE3, 54.2)); cam(VL(V(SY + 1.3, 1.5, 3.2), V(SY + 1.0, 2.2, 6.5), k), VL(headOf(hoda), V(SY + 2.2, 8.2, -1.1), k), lerp(50, 42, k)); return; }
  look('night', t);
  if (t < 58.21) { cam(V(0.9, 1.5, 3.2), V(-0.6, 0.9, -0.2), 54); return; }
  if (t < 62.34) { faceCam(dad, 2.1, -0.5, 0.05, 44, 0.25); return; }
  if (t < 65.13) { faceCam(hoda, 1.9, 0.45, 0.05, 44, 0.2); return; }
  if (t < 70.46) { faceCam(dad, 2.0, -0.5, 0.05, 44, 0.25); return; }
  if (t < 75.7) { faceCam(mom, 2.2, 0.5, 0.05, 44, 0.25); return; }
  if (t < 76.79) { cam(V(0.3, 1.5, 2.7), V(1.2, 1.15, -0.3), 46); return; }
  if (t < T_SAG) { faceCam(mom, 2.4, 0.6, 0.05, 46, 0.25); return; }
  const k = easeInOut(seg(t, T_SAG + 0.8, 94)); cam(VL(V(-0.3, 1.5, 3.3), V(-0.2, 3.2, 8.5), k).add(shake(t, t < T_SAG + 0.8 ? 0.08 : 0)), VL(V(-0.3, 0.6, -0.6), V(-0.3, 0.8, -0.8), k), 50);
}

// ---------- particles ----------
function particles(t) {
  const st = [], pf = [], sw = [];
  if (t >= T_SAG && t < T_SAG + 1.5) { const a = t - T_SAG; for (let i = 0; i < 10; i++) pf.push({ pos: V(-2.6 + i * 0.6, 0.05 + a * 0.5 * hash(i), 1.25 + hash(i + 3) * 0.2), size: 0.25 + a * 0.4, op: 0.7 * (1 - a / 1.5), color: 0x9a8a78 }); }
  if (inT(t, 62.3, 64.8)) { const h = headOf(hoda); for (let i = 0; i < 2; i++) { const k = (t * 1.5 + i * 0.5) % 1; sw.push({ pos: h.clone().add(V((i ? 1 : -1) * 0.25, 0.1 - k * 0.4, 0.1)), size: 0.07, op: 1 - k }); } }
  if (t >= T_CLUE3 - 0.2 && t < T_BAL) for (let i = 0; i < 6; i++) { const a = t * 2 + i; st.push({ pos: V(SY + 2.2 + Math.cos(a) * 1.4, 8.6 + Math.sin(a * 1.3) * 0.6, -0.5), size: 0.25, color: 0xffe14a }); }
  emit(st, starPool); emit(pf, puffPool); emit([], trailPool); emit(sw, sweatPool);
}

// ---------- 2D ----------
function drawTitle(g, t) {
  if (t >= 3.0) return; const a = t < 0.3 ? t / 0.3 : t > 2.5 ? 1 - (t - 2.5) / 0.5 : 1;
  g.save(); g.globalAlpha = Math.max(0, a); g.fillStyle = 'rgba(0,0,20,0.55)'; g.fillRect(0, 150, W, 120);
  arText(g, 'فين التوكتوك؟', W / 2, 152, 64, '#ffe14a', 'center', 'ReemKufi'); pxText(g, 'WHERE IS THE TUK-TUK?', W / 2, 238, 12, '#9fd0ff', 'center'); g.restore();
}
function clues(t) { return t < T_CLUE1 ? 0 : t < T_ITEM ? 1 : t < T_CLUE3 ? 2 : 3; }
function drawQuest(g, t) {
  if (t < 1.2 || t >= T_SAG) return; const k = easeOut(seg(t, 1.2, 1.6));
  const x = 16 - (1 - k) * 240, y = 16; g.fillStyle = 'rgba(0,0,30,0.8)'; g.fillRect(x, y, 214, 62); g.strokeStyle = '#ffe14a'; g.lineWidth = 2; g.strokeRect(x, y, 214, 62);
  pxText(g, 'QUEST', x + 10, y + 8, 8, '#ffe14a', 'left', false); arText(g, 'لاقي التوكتوك ٣٠٠٠', x + 204, y + 2, 20, '#fff');
  pxText(g, 'CLUES', x + 10, y + 40, 8, '#9fd0ff', 'left', false); for (let i = 0; i < 3; i++) { g.fillStyle = i < clues(t) ? '#3df05a' : '#333'; g.fillRect(x + 70 + i * 26, y + 36, 20, 16); }
  pxText(g, `${clues(t)}/3`, x + 160, y + 40, 8, '#fff', 'left', false);
}
const LOC = [[T_G, 'مركز الصيانة', 'SERVICE CENTER'], [T_MK, 'السوق', 'THE MARKET'], [T_SY, 'باب العمارة', 'BUILDING DOOR'], [T_BAL, 'البلكونة', 'THE BALCONY']];
function drawLoc(g, t) {
  for (const [a, ar, en] of LOC) { if (t < a || t >= a + 2.6) continue; const k = easeOut(seg(t, a, a + 0.3)) * (1 - easeIn(seg(t, a + 2.2, a + 2.6)));
    g.save(); g.globalAlpha = k; g.fillStyle = 'rgba(0,0,30,0.8)'; g.fillRect(W - 200, 18, 184, 52); g.fillStyle = '#d8231b'; g.fillRect(W - 200, 66, 184, 4);
    arText(g, ar, W - 26, 16, 26, '#fff'); pxText(g, en, W - 190, 52, 7, '#ffe14a', 'left', false); g.restore(); }
}
function popup(g, t, a, b, head, ar, col) {
  if (t < a || t >= b) return; const k = easeBack(seg(t, a, a + 0.3)) * (1 - easeIn(seg(t, b - 0.3, b)));
  g.save(); g.translate(W / 2, 150); g.scale(k, k); g.fillStyle = 'rgba(0,0,30,0.92)'; g.fillRect(-220, -40, 440, 82); g.strokeStyle = col; g.lineWidth = 3; g.strokeRect(-220, -40, 440, 82);
  pxText(g, head, 0, -30, 12, col, 'center', false); arText(g, ar, 0, -12, 28, '#fff', 'center'); g.restore();
}
function drawEnd(g, t) {
  if (t >= 81.6 && t < 92.2) {
    const k = easeBack(seg(t, 81.6, 82.0)); g.save(); g.translate(W / 2, 160); g.scale(k, k);
    g.fillStyle = 'rgba(0,0,30,0.92)'; g.fillRect(-240, -100, 480, 200); g.strokeStyle = '#3df05a'; g.lineWidth = 3; g.strokeRect(-240, -100, 480, 200);
    pxText(g, 'QUEST COMPLETE!', 0, -88, 16, '#3df05a', 'center'); arText(g, 'التوكتوك اتلاقى... ومربوط في الفيشة', 0, -60, 24, '#fff', 'center');
    if (t > 85.6) { const c = Math.min(4, Math.floor(1 + (t - 85.6) * 2.5)); pxText(g, 'BALCONY CAPACITY', -220, 2, 9, '#fff', 'left', false); for (let i = 0; i < 4; i++) { g.fillStyle = i < c ? (i >= 3 ? (Math.floor(t * 6) % 2 ? '#ff2a2a' : '#ffe14a') : '#ff5a4a') : '#333'; g.fillRect(-20 + i * 40, -2, 32, 18); } pxText(g, `${c}/3`, 150, 2, 10, '#ff5a4a', 'left', false); }
    if (t > 89.4 && Math.floor(t * 4) % 2) { g.fillStyle = '#d8231b'; g.fillRect(-200, 34, 400, 46); pxText(g, '!! OVERLOAD !!', 0, 40, 14, '#fff', 'center'); arText(g, 'البلكونة هتقع', 0, 50, 22, '#ffe14a', 'center'); }
    g.restore();
  }
  if (t >= 92.2) { const k = easeOut(seg(t, 92.2, 92.6)); g.fillStyle = `rgba(0,0,0,${0.7 * k})`; g.fillRect(0, 0, W, H); g.save(); g.translate(W / 2, 200); g.scale(k, k); arText(g, 'يُتبع...', 0, -40, 54, '#ffe14a', 'center', 'ReemKufi'); pxText(g, 'TO BE CONTINUED', 0, 30, 16, '#fff', 'center'); g.restore(); }
  if (t > 95.9) { g.fillStyle = `rgba(0,0,0,${clamp((t - 95.9) / 0.8)})`; g.fillRect(0, 0, W, H); }
}

// ---------- names + portraits ----------
const NAMES = { hoda: ['حودة', 'HODA', '#c8a000'], alamy: ['العالمي', 'EL-ALAMY', '#151518'], shehata: ['شحاتة', 'SHEHATA', '#3a5aa8'], sayed: ['عم سيد', 'UNCLE SAYED', '#6b5a48'], dad: ['إبراهيم', 'IBRAHIM', '#c9a227'], mom: ['أم حمادة', 'OM HAMADA', '#1f9e5a'] };
function portrait(g, x, y, who, t) {
  g.fillStyle = '#123'; g.fillRect(x, y, 64, 64); g.strokeStyle = '#fff'; g.lineWidth = 2; g.strokeRect(x, y, 64, 64);
  g.save(); g.beginPath(); g.rect(x + 2, y + 2, 60, 60); g.clip();
  const skin = { hoda: '#a87048', alamy: '#c08a60', shehata: '#9a6440', sayed: '#8a5a3a', dad: '#b27448', mom: '#c98d5f' }[who];
  const shirt = { hoda: '#ffd400', alamy: '#151518', shehata: '#e8eef8', sayed: '#6b5a48', dad: '#f3f0e3', mom: '#e86a8a' }[who];
  g.fillStyle = shirt; g.fillRect(x + 8, y + 54, 48, 10); if (who === 'hoda') { g.fillStyle = '#111'; g.fillRect(x + 8, y + 58, 48, 2); }
  if (who === 'mom') { g.fillStyle = '#1f9e5a'; g.beginPath(); g.arc(x + 32, y + 36, 25, 0, 7); g.fill(); }
  g.fillStyle = skin; g.beginPath(); g.arc(x + 32, y + 36, 20, 0, 7); g.fill();
  if (who === 'hoda') { g.fillStyle = '#120c08'; g.fillRect(x + 12, y + 14, 40, 8); for (let i = 0; i < 6; i++) { g.beginPath(); g.moveTo(x + 14 + i * 7, y + 16); g.lineTo(x + 17 + i * 7, y + 6); g.lineTo(x + 20 + i * 7, y + 16); g.fill(); } }
  if (who === 'mom') { g.fillStyle = '#1f9e5a'; g.beginPath(); g.arc(x + 32, y + 30, 22, Math.PI, 0); g.fill(); }
  if (who === 'sayed') { g.fillStyle = '#f4f2ea'; g.beginPath(); g.ellipse(x + 32, y + 18, 22, 9, 0, 0, 7); g.fill(); }
  if (who === 'shehata') { g.fillStyle = '#f2f2f2'; g.beginPath(); g.arc(x + 32, y + 26, 21, Math.PI, 0); g.fill(); }
  if (who === 'alamy') { g.fillStyle = '#101013'; g.fillRect(x + 24, y + 50, 16, 14); g.fillStyle = '#b9bcc4'; g.fillRect(x + 23, y + 54, 2, 10); g.fillRect(x + 39, y + 54, 2, 10); g.fillStyle = '#0c0a09'; g.beginPath(); g.arc(x + 32, y + 29, 20.5, Math.PI, 0); g.fill(); g.beginPath(); g.ellipse(x + 34, y + 12, 15, 5, -0.1, 0, 7); g.fill(); g.fillRect(x + 11, y + 28, 4, 9); g.fillRect(x + 49, y + 28, 4, 9); }
  if (who === 'dad') { g.fillStyle = '#1b1410'; g.fillRect(x + 10, y + 30, 5, 12); g.fillRect(x + 49, y + 30, 5, 12); g.fillStyle = '#c9a227'; g.fillRect(x + 14, y + 16, 36, 5); }
  const fc = document.createElement('canvas'); fc.width = 32; fc.height = 32; const fg = fc.getContext('2d');
  const e = envAt(t); const mouth = speakerAt(t) === who ? (e < 0.1 ? 'closed' : e < 0.4 ? 'talk1' : 'talk2') : 'closed';
  const eyes = { hoda: 'wide', alamy: 'smug', shehata: 'angry', sayed: 'tired', dad: 'smug', mom: 'default' }[who];
  drawFace(fg, 32, eyes, mouth, { stache: who === 'dad' || who === 'sayed' || who === 'shehata', stacheColor: who === 'sayed' ? '#dddddd' : undefined });
  g.imageSmoothingEnabled = false; g.drawImage(fc, x + 14, y + 20, 36, 36); g.restore();
}

window.renderFrame = function (t) {
  stateAt(t); shotAt(t); particles(t);
  renderer.render(scene, camera);
  ctx.clearRect(0, 0, W, H); ctx.drawImage(glCanvas, 0, 0);
  h.clearRect(0, 0, W, H);
  drawTitle(h, t); drawQuest(h, t); drawLoc(h, t);
  popup(h, t, T_CLUE1, T_MK - 0.1, 'CLUE FOUND! 1/3', 'يا إما إسكندرية... يا إما بلكونة', '#3df05a');
  popup(h, t, T_ITEM, T_SY - 0.1, 'ITEM GET! + CLUE 2/3', 'بطيختين (رشوة لعم سيد)', '#ffe14a');
  popup(h, t, T_CLUE3 + 0.2, T_BAL - 0.1, 'CLUE FOUND! 3/3', 'البلكونة اللي منوّرة!', '#3df05a');
  drawDialogue(h, t); drawEnd(h, t);
  ctx.drawImage(hud, 0, 0); vignette(ctx, 0.32);
  return true;
};
window.frameData = () => out.toDataURL('image/png');
window.DUR = DUR;
document.fonts.load('10px PS2P').then(() => document.fonts.load('20px Lalezar', 'ع')).then(() => document.fonts.load('700 20px ReemKufi', 'ع')).then(() => { lateDraw.forEach(f => f()); window.READY = true; });
