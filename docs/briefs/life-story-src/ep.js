// =====================================================================
// حكاية المخترع العالمي — Ibrahim narrates his life (1975 → today). vertical 9:16
// L01 dad(cold, balcony) L02 dad 1975 L03 teta L04 dad 1985 L05 dad 1995 L06 mom(young) L07 dad(young) L08 mom(young)
// L09 dad 2000 wedding L10 dad 2010 Hamada L11 dad montage L12 mom(today) L13 dad L14 anno
// =====================================================================
const Lx = (i) => LINES[i - 1];
const T_RW = Lx(1).t1 + 0.15, T_HOOK = T_RW + 0.6, T_ANNO = Lx(14).t0;
const ERA = [
  { a: T_RW + 0.6, b: Lx(4).t0 - 0.2, key: '1975', ar: '١٩٧٥', label: 'الطفولة', sepia: 0.9 },
  { a: Lx(4).t0 - 0.2, b: Lx(5).t0 - 0.2, key: '1985', ar: '١٩٨٥', label: 'المدرسة', sepia: 0.75 },
  { a: Lx(5).t0 - 0.2, b: Lx(9).t0 - 0.2, key: '1995', ar: '١٩٩٥', label: 'الجامعة', sepia: 0.6 },
  { a: Lx(9).t0 - 0.2, b: Lx(10).t0 - 0.2, key: '2000', ar: '٢٠٠٠', label: 'الفرح', sepia: 0.45 },
  { a: Lx(10).t0 - 0.2, b: Lx(11).t0 - 0.1, key: '2010', ar: '٢٠١٠', label: 'حمادة', sepia: 0.25 },
  { a: Lx(11).t0 - 0.1, b: Lx(12).t0 - 0.3, key: 'montage', ar: '', label: '', sepia: 0 },
];
function era(t) { for (const e of ERA) if (t >= e.a && t < e.b) return e; return { key: 'today', sepia: 0 }; }
const lateDraw = [];

// ---------- helpers: extra people ----------
function woman(seed, skin, dressCol, scarfCol, parent = scene) {
  const dress = canvasTex(16, 16, (g) => { g.fillStyle = dressCol; g.fillRect(0, 0, 16, 16); g.fillStyle = 'rgba(255,255,255,0.18)'; for (let i = 0; i < 16; i += 4) g.fillRect(i, (i * 3) % 16, 2, 2); }, [2, 2]);
  return makeChar({ seed, skin, hipY: 0.82, legX: 0.14, legColor: skin, shoe: 0x3a2a1a, hand: skin,
    torsoGeo: cyl(0.3, 0.4, 0.62, 7), torsoTex: dress, torsoColor: 0xffffff, torsoY: 0.31,
    skirt: cyl(0.4, 0.52, 0.55, 7), sleeve: true, shoulderX: 0.36, shoulderY: 0.56, neckY: 0.62, headR: 0.3,
    build(head, torso, reg) { const sm = reg(M(scarfCol)); const s = mesh(new THREE.SphereGeometry(0.33, 8, 5, 0, Math.PI * 2, 0, Math.PI * 0.55), sm, 0, 0.03, -0.03, head); s.rotation.x = -0.35; mesh(new THREE.IcosahedronGeometry(0.09, 0), sm, 0, -0.12, -0.3, head); return {}; } }, parent);
}
function kid(seed, skin, shirtTex, hairCol, scale, parent = scene, bald = false) {
  const c = makeChar({ seed, skin, hipY: 0.8, legX: 0.11, legColor: skin, shoe: 0x222222, hand: skin,
    torsoGeo: cyl(0.24, 0.27, 0.62, 6), torsoTex: shirtTex, torsoColor: 0xffffff, torsoY: 0.31, sleeve: true, sleeveColor: 0xffffff, sleeveTex: shirtTex,
    shoulderX: 0.3, shoulderY: 0.55, neckY: 0.62, headR: 0.3,
    build(head, torso, reg) { if (!bald) mesh(new THREE.SphereGeometry(0.31, 8, 4, 0, Math.PI * 2, 0, Math.PI * 0.4), reg(M(hairCol)), 0, 0.03, -0.02, head); else mesh(new THREE.SphereGeometry(0.05, 5, 4), reg(M(hairCol)), 0, 0.3, 0.05, head); return {}; } }, parent);
  c.root.scale.setScalar(scale); return c;
}
const tex1 = (a, b) => canvasTex(16, 16, (g) => { g.fillStyle = a; g.fillRect(0, 0, 16, 16); g.fillStyle = b; g.fillRect(0, 10, 16, 2); });
const teta = woman(201, 0xc08a60, '#7a4a2a', 0x2a2a2a);
const babyI = kid(202, 0xb27448, tex1('#f4f4f4', '#9fc8e8'), 0x1b1410, 0.42, scene, true);
const kidI = kid(203, 0xb27448, tex1('#c8b88a', '#3a5aa8'), 0x1b1410, 0.66);     // school apron (مريلة)
const babyH = kid(204, 0xb98058, tex1('#9fd0ff', '#ffffff'), 0x17110c, 0.4, scene, true);
const guests = [samir, sayed()]; function sayed() { return makeChar({ seed: 41, skin: 0x8a5a3a, hipY: 0.84, legX: 0.12, legColor: 0x6b5a48, shoe: 0x3a2a1a, hand: 0x8a5a3a, torsoGeo: cyl(0.28, 0.34, 0.66, 7), torsoTex: null, torsoColor: 0x6b5a48, torsoY: 0.33, skirt: cyl(0.34, 0.44, 0.75, 7), sleeve: true, sleeveColor: 0x6b5a48, shoulderX: 0.34, shoulderY: 0.6, neckY: 0.66, headR: 0.28, build(head, torso, reg) { const tw = reg(M(0xf4f2ea)); const tb = mesh(new THREE.TorusGeometry(0.24, 0.09, 5, 10), tw, 0, 0.2, -0.02, head); tb.rotation.x = Math.PI / 2; mesh(new THREE.SphereGeometry(0.2, 7, 4, 0, Math.PI * 2, 0, Math.PI / 2), tw, 0, 0.22, -0.02, head); return {}; } }, scene); }
scene.add(samir.root);
// young-Ibrahim hair (full top), groom jacket, bride dress/veil, mom young scarf colour
const dadHair = mesh(new THREE.SphereGeometry(0.31, 8, 4, 0, Math.PI * 2, 0, Math.PI * 0.42), M(0x1b1410), 0, 0.04, -0.02, dad.head);
const groom = mesh(cyl(0.27, 0.24, 0.66, 6), M(0x1a1a22), 0, 0.35, 0, dad.torso); mesh(box(0.1, 0.3, 0.02), M(0xffffff), 0, 0.5, 0.25, dad.torso).visible = true;
const groomShirt = groom.parent.children[groom.parent.children.length - 1];
const bride = new THREE.Group(); mom.torso.add(bride);
mesh(cyl(0.32, 0.44, 0.64, 8), M(0xfdfbf4), 0, 0.31, 0, bride); mesh(cyl(0.46, 0.7, 0.62, 10), M(0xfdfbf4), 0, -0.28, 0, bride);
const veil = mesh(new THREE.ConeGeometry(0.45, 1.1, 10, 1, true), new THREE.MeshLambertMaterial({ color: 0xffffff, transparent: true, opacity: 0.7, side: THREE.DoubleSide }), 0, 0.15, -0.1, mom.head);
const near = (m, hx) => { const c = new THREE.Color(hx); return m.color && Math.abs(m.color.r - c.r) + Math.abs(m.color.g - c.g) + Math.abs(m.color.b - c.b) < 0.08; };
const scarfMat = mom.mats.find(m => near(m, 0x1f9e5a));
const momGloves = mom.mats.filter(m => near(m, 0xffd400));
console.log('scarf', !!scarfMat, 'gloves', momGloves.length);

// ---------- set: 1975 nursery (x = 300) ----------
const NX = 300;
{ const w = canvasTex(16, 16, (g) => { g.fillStyle = '#d8c89a'; g.fillRect(0, 0, 16, 16); g.fillStyle = '#c0a878'; g.fillRect(0, 0, 2, 16); g.fillRect(8, 0, 2, 16); }, [8, 3]);
  mesh(new THREE.PlaneGeometry(10, 8), M(0x8a6a4a, { map: woodTex }), NX, 0, 0, scene).rotation.x = -Math.PI / 2;
  mesh(new THREE.PlaneGeometry(10, 3.4), M(0xffffff, { map: w }), NX, 1.7, -2.0, scene);
  mesh(new THREE.PlaneGeometry(1.1, 0.9), M(0x9fc8e8), NX + 1.8, 1.8, -1.98, scene); // window
  mesh(new THREE.CircleGeometry(0.3, 12), M(0xf4f0e0), NX - 1.5, 2.2, -1.98, scene); // round photo frame
}
const crib = new THREE.Group(); crib.position.set(NX + 0.2, 0, -0.8); scene.add(crib);
const cribParts = []; { const wd = M(0xe8d0a0); for (let i = 0; i < 9; i++) cribParts.push(mesh(box(0.04, 0.6, 0.04), wd, -0.6 + i * 0.15, 0.6, 0.35, crib)); for (const z of [-0.35, 0.35]) cribParts.push(mesh(box(1.3, 0.05, 0.05), wd, 0, 0.92, z, crib)); cribParts.push(mesh(box(1.3, 0.05, 0.75), M(0xf4f4f4), 0, 0.3, 0, crib)); }
const cribScatter = cribParts.map((p, i) => ({ p, home: p.position.clone(), hr: p.rotation.clone(), to: V(-0.9 + hash(i) * 1.8, 0.03, 0.6 + hash(i + 7) * 0.8), rz: (hash(i + 3) - .5) * 3 }));
const screwdriver = new THREE.Group(); scene.add(screwdriver); mesh(box(0.04, 0.12, 0.04), M(0xffd400), 0, 0, 0, screwdriver); mesh(cyl(0.008, 0.008, 0.12, 5), P(0xcccccc), 0, 0.11, 0, screwdriver);
// ---------- set: 1985 classroom (x = 600) ----------
const CX = 600;
{ mesh(new THREE.PlaneGeometry(10, 8), M(0x8a8a7a), CX, 0, 0, scene).rotation.x = -Math.PI / 2;
  mesh(new THREE.PlaneGeometry(10, 3.4), M(0xa8c8a0), CX, 1.7, -2.2, scene); mesh(box(3, 1.3, 0.05), M(0x1f3a2a), CX, 1.9, -2.15, scene);
  for (const [x, z] of [[-1.6, 0.2], [1.6, 0.2], [-1.6, 1.4], [1.6, 1.4]]) { mesh(box(1.0, 0.06, 0.6), M(0x8a5a2b, { map: woodTex }), CX + x, 0.7, z, scene); mesh(box(0.06, 0.7, 0.06), M(0x333333), CX + x, 0.35, z, scene); } }
const chalkT = canvasTex(64, 24, () => { }); const chalk = mesh(new THREE.PlaneGeometry(2.6, 1.0), new THREE.MeshBasicMaterial({ map: chalkT, transparent: true }), CX, 1.92, -2.11, scene);
lateDraw.push(() => { const g = chalkT.userData.g; g.clearRect(0, 0, 64, 24); g.fillStyle = '#f4f4f4'; g.font = '11px Lalezar'; g.textAlign = 'center'; g.direction = 'rtl'; g.fillText('مشروع العلوم: البركان', 32, 15); chalkT.needsUpdate = true; });
const volc = new THREE.Group(); volc.position.set(CX, 0.73, 0.4); scene.add(volc); mesh(box(1.1, 0.06, 0.7), M(0x8a5a2b, { map: woodTex }), 0, -0.03, 0, volc); mesh(new THREE.ConeGeometry(0.3, 0.45, 8), M(0x6a4a2a), 0, 0.22, 0, volc); const lava = mesh(new THREE.CircleGeometry(0.08, 8), new THREE.MeshBasicMaterial({ color: 0xff4a10 }), 0, 0.45, 0, volc); lava.rotation.x = -Math.PI / 2;
// ---------- set: 1995 university courtyard (x = 900) ----------
const UX = 900;
{ mesh(new THREE.PlaneGeometry(16, 10), M(0xc8b890), UX, 0, 0, scene).rotation.x = -Math.PI / 2;
  mesh(box(12, 6, 1), M(0xe8dcc0), UX, 3, -4, scene); for (let i = -4; i <= 4; i++) mesh(cyl(0.22, 0.25, 4.5, 8), M(0xf4f0e8), UX + i * 1.3, 2.25, -3.3, scene);
  mesh(box(12, 0.5, 1.2), M(0xf4f0e8), UX, 4.6, -3.3, scene);
  for (const x of [-3.5, 3.5]) { mesh(cyl(0.12, 0.15, 1.6, 6), M(0x6a4a2a), UX + x, 0.8, -1.5, scene); mesh(new THREE.IcosahedronGeometry(0.9, 0), M(0x3a8a3a), UX + x, 2.1, -1.5, scene); }
  mesh(box(1.6, 0.08, 0.45), M(0x8a5a2b, { map: woodTex }), UX + 0.0, 0.45, -0.6, scene); }
const uniSign = canvasTex(64, 16, () => { }); mesh(new THREE.PlaneGeometry(4, 1), new THREE.MeshBasicMaterial({ map: uniSign }), UX, 4.6, -2.69, scene);
lateDraw.push(() => { const g = uniSign.userData.g; g.fillStyle = '#f4f0e8'; g.fillRect(0, 0, 64, 16); g.fillStyle = '#3a2a1a'; g.font = '11px Lalezar'; g.textAlign = 'center'; g.direction = 'rtl'; g.fillText('كلية الهندسة', 32, 12); uniSign.needsUpdate = true; });
const blender = new THREE.Group(); scene.add(blender); mesh(box(0.14, 0.1, 0.14), M(0x333333), 0, 0, 0, blender); mesh(cyl(0.07, 0.06, 0.2, 8), new THREE.MeshPhongMaterial({ color: 0xffa040, transparent: true, opacity: 0.7 }), 0, 0.15, 0, blender);
// ---------- set: 2000 wedding hall (x = 1200) ----------
const WX = 1200;
{ mesh(new THREE.PlaneGeometry(14, 10), M(0xb83a4a), WX, 0, 0, scene).rotation.x = -Math.PI / 2;
  const wl = canvasTex(16, 16, (g) => { g.fillStyle = '#f4e8c8'; g.fillRect(0, 0, 16, 16); g.fillStyle = '#d8b04a'; g.fillRect(7, 0, 2, 16); }, [10, 3]); mesh(new THREE.PlaneGeometry(14, 5), M(0xffffff, { map: wl }), WX, 2.5, -3, scene);
  mesh(box(3.2, 0.3, 1.4), M(0xd8b04a), WX, 0.15, -1.6, scene); // stage
  for (const x of [-0.5, 0.5]) { mesh(box(0.7, 0.1, 0.6), M(0xf4e8c8), WX + x, 0.75, -1.7, scene); mesh(box(0.7, 1.0, 0.1), M(0xd8b04a), WX + x, 1.2, -2.0, scene); }
  for (let i = 0; i < 6; i++) mesh(cyl(0.5, 0.5, 0.05, 12), M(0xf4f4f4), WX - 4 + (i % 3) * 4, 0.75, 1.5 + Math.floor(i / 3) * 2, scene); }
const chand = new THREE.Group(); chand.position.set(WX, 3.6, -0.6); scene.add(chand); mesh(new THREE.ConeGeometry(0.5, 0.6, 10), P(0xffd870, { shininess: 120 }), 0, 0, 0, chand); for (let i = 0; i < 10; i++) mesh(new THREE.SphereGeometry(0.06, 5, 4), new THREE.MeshBasicMaterial({ color: 0xfff6c0 }), Math.cos(i * 0.63) * 0.45, -0.3, Math.sin(i * 0.63) * 0.45, chand);
const rocketBox = new THREE.Group(); scene.add(rocketBox); mesh(box(0.3, 0.25, 0.3), M(0xd8231b), 0, 0, 0, rocketBox); for (let i = 0; i < 4; i++) mesh(cyl(0.03, 0.03, 0.25, 5), M(0xffd400), -0.08 + (i % 2) * 0.16, 0.2, -0.08 + Math.floor(i / 2) * 0.16, rocketBox);
// ---------- 2010: rocket crib in the living room ----------
const tcrib = new THREE.Group(); scene.add(tcrib); { const wd = M(0x9fc8e8); mesh(box(1.0, 0.05, 0.55), M(0xf4f4f4), 0, 0.3, 0, tcrib); for (let i = 0; i < 7; i++) mesh(box(0.03, 0.45, 0.03), wd, -0.45 + i * 0.15, 0.55, 0.27, tcrib); mesh(box(1.0, 0.04, 0.04), wd, 0, 0.78, 0.27, tcrib); mesh(cyl(0.1, 0.12, 0.3, 8), M(0xd8231b), -0.55, 0.35, 0, tcrib).rotation.z = Math.PI / 2; }
const TCRIB0 = V(0.6, 0, -1.6);
// ---------- cards for the montage ----------
const cardImgs = ['jet_dishwasher', 'wifi_booster', 'tuktuk_3000', 'lie_detector', 'pedal_generator', 'password_stethoscope', 'nuclear_heater', 'phone_dryer', 'nuclear_ac', 'website_booster', 'nuclear_vacuum'].map(n => { const im = new Image(); im.src = 'cards/' + n + '.png'; return im; });
const stars = new THREE.Points(new THREE.BufferGeometry().setFromPoints(Array.from({ length: 200 }, (_, i) => { const a = hash(i) * 6.28, b = 0.15 + hash(i + 7) * 1.2; return V(Math.cos(a) * Math.cos(b) * 70, Math.sin(b) * 70, Math.sin(a) * Math.cos(b) * 70 + 10); })), new THREE.PointsMaterial({ color: 0xffffff, size: 2, sizeAttenuation: false })); scene.add(stars);
const sunL = new THREE.DirectionalLight(0xfff2dc, 0); sunL.position.set(3, 8, 6); scene.add(sunL);
const P0 = V(-2000, 0, 0);

function hideAll() { for (const c of [mom, dad, son, samir, teta, babyI, kidI, babyH, ...guests]) { c.root.visible = false; c.root.position.copy(P0); } }
function stateAt(t) {
  const E = era(t); hideAll();
  room.visible = E.key === '2010'; balcony.visible = E.key === 'today' || t < T_RW + 0.6;
  dadHair.visible = E.key === '1995' || E.key === '2000'; groom.visible = groomShirt.visible = E.key === '2000'; bride.visible = veil.visible = E.key === '2000';
  const young = E.key === '1995' || E.key === '2000';
  if (scarfMat) { scarfMat.userData.orig = scarfMat.userData.orig || scarfMat.color.clone(); const c = E.key === '1995' ? 0xe86aa0 : 0x1f9e5a; scarfMat.color.setHex(c); scarfMat.userData.orig.setHex(c); }
  momGloves.forEach(m => { m.userData.orig = m.userData.orig || m.color.clone(); const c = E.key === 'today' || t < T_RW + 0.6 ? 0xffd400 : 0xc98d5f; m.color.setHex(c); m.userData.orig.setHex(c); });
  if (dad.extras.gog) dad.extras.gog.visible = !young;
  screwdriver.visible = blender.visible = rocketBox.visible = false; tcrib.visible = E.key === '2010';
  let set = 'balcony';
  if (E.key === 'today' || t < T_RW + 0.6) {
    dad.root.visible = true; dad.root.position.set(-0.2, 0, -0.45); dad.root.rotation.set(0, 0.2, 0);
    applyPose(dad, talkPose({ ...POSE0, y: -0.5, lL: 1.45, lR: 1.45, aLx: 0.6, eL: 1.1, aRx: 0.6, eR: 1.1, hy: t >= Lx(12).t0 && t < Lx(13).t0 + 0.2 ? 0.7 : 0 }, t, 'dad', 0.4));
    setFace(dad, inT(t, Lx(12).t0, Lx(13).t0) ? 'wide' : 'smug', talkMouth(t, 'dad', 'grin') || 'smile', { stache: true });
    const momIn = t >= Lx(12).t0 - 0.4 && t < T_ANNO + 6; mom.root.visible = momIn;
    if (momIn) { mom.root.position.set(1.7, 0, -1.05); mom.root.rotation.set(0, -0.5, 0); applyPose(mom, talkPose({ ...POSE0, aLz: 0.6, aRz: 0.6, eL: 1.2, eR: 1.2 }, t, 'mom', 0.3)); setFace(mom, 'angry', talkMouth(t, 'mom', 'scream') || 'frown', {}); }
  } else if (E.key === '1975') {
    set = 'nursery';
    babyI.root.visible = true; babyI.root.position.set(NX + 0.2, 0, 0.5); babyI.root.rotation.set(0, 0, 0);
    applyPose(babyI, { ...POSE0, y: -0.36, lL: 1.45, lR: 1.45, aRx: 1.1 + Math.sin(t * 8) * 0.2, eR: 0.8, aLz: 0.5 });
    setFace(babyI, 'sparkle', 'grin', {});
    screwdriver.visible = true; screwdriver.position.copy(babyI.arms[1].hand.getWorldPosition(V(0, 0, 0))).add(V(0, 0.04, 0.02)); screwdriver.rotation.set(0.4, 0, 0.3);
    const k = clamp((t - E.a - 1.5) / 1.5); cribScatter.forEach(o => { o.p.position.copy(VL(o.home, o.to, easeOut(k))); o.p.rotation.set(o.hr.x, o.hr.y, o.hr.z + o.rz * k); });
    if (t >= Lx(3).t0 - 0.5) { teta.root.visible = true; teta.root.position.set(NX - 1.0, 0, 0.1); teta.root.rotation.set(0, 0.6, 0); applyPose(teta, talkPose({ ...POSE0, aLz: 0.6, aRz: 0.6, eL: 1.3, eR: 1.3 }, t, 'teta', 0.4)); setFace(teta, 'angry', talkMouth(t, 'teta', 'scream') || 'frown', {}); }
  } else if (E.key === '1985') {
    set = 'class';
    kidI.root.visible = true; kidI.root.position.set(CX - 0.55, 0, 0.75); kidI.root.rotation.set(0, 0.5, 0);
    const boom = t > E.a + 1.8; applyPose(kidI, boom ? { ...POSE0, aLz: 2.5, aRz: 2.5, eL: 0.3, eR: 0.3, y: Math.abs(Math.sin(t * 10)) * 0.05 } : { ...POSE0, aRx: 1.2, eR: 0.4 });
    setFace(kidI, boom ? 'sparkle' : 'smug', boom ? 'grin' : 'smile', {});
    lava.scale.setScalar(boom ? 1.4 + Math.sin(t * 20) * 0.2 : 1);
  } else if (E.key === '1995') {
    set = 'uni';
    dad.root.visible = mom.root.visible = true;
    dad.root.position.set(UX + 0.6, 0, 0.2); dad.root.rotation.set(0, -0.9, 0); mom.root.position.set(UX - 0.6, 0, 0.2); mom.root.rotation.set(0, 0.9, 0);
    const splash = t >= Lx(8).t0 - 0.3;
    applyPose(dad, talkPose({ ...POSE0, aRx: inT(t, Lx(7).t0, Lx(8).t0) ? 1.4 : 0.6, eR: 0.5, aLz: 0.2 }, t, 'dad', 0.3)); setFace(dad, splash ? 'wide' : 'sparkle', talkMouth(t, 'dad', 'grin') || (splash ? 'o' : 'smile'), {});
    applyPose(mom, talkPose(splash ? { ...POSE0, aLx: 0.9, eL: 1.6, aRx: 0.3 } : { ...POSE0, aLx: 0.6, eL: 1.6, aRx: 0.6, eR: 1.6 }, t, 'mom', 0.3)); setFace(mom, splash ? 'closed' : 'side', talkMouth(t, 'mom') || (splash ? 'smile' : 'flat'), { blush: true });
    blender.visible = t >= Lx(7).t0 - 0.2; blender.position.copy(dad.arms[1].hand.getWorldPosition(V(0, 0, 0))).add(V(0, 0.1, 0)); blender.rotation.set(0, 0, splash ? Math.sin(t * 30) * 0.2 : 0);
  } else if (E.key === '2000') {
    set = 'wedding';
    dad.root.visible = mom.root.visible = true;
    dad.root.position.set(WX + 0.5, 0.3, -1.4); dad.root.rotation.set(0, 0, 0); mom.root.position.set(WX - 0.5, 0.3, -1.4); mom.root.rotation.set(0, 0, 0);
    const fire = t > E.a + 2.3; applyPose(dad, talkPose({ ...POSE0, aRx: fire ? 1.6 : 0.5, aRz: 0.4, eR: 0.3 }, t, 'dad', 0.3)); setFace(dad, fire ? 'sparkle' : 'smug', talkMouth(t, 'dad', 'grin') || 'grin', {});
    applyPose(mom, fire ? { ...POSE0, aLz: 2.3, aRz: 2.3 } : { ...POSE0, aLz: 0.3, aRz: 0.3 }); setFace(mom, fire ? 'wide' : 'sparkle', fire ? 'scream' : 'smile', { blush: true });
    rocketBox.visible = true; rocketBox.position.set(WX + 1.3, 0.45, -1.2);
    const fall = clamp((t - E.a - 3.2) / 0.5); chand.position.set(WX, 3.6 - 3.0 * fall * fall, -0.6); chand.rotation.z = fall * 0.6;
    guests.forEach((g2, i) => { g2.root.visible = true; const run = fire ? (t - E.a - 2.3) * 2.5 : 0; g2.root.position.set(WX - 2 + i * 4 + (i ? run : -run), 0, 1.4); g2.root.rotation.set(0, fire ? (i ? 1.5 : -1.5) : Math.PI - 0.0, 0); const ph = t * 12; applyPose(g2, fire ? { ...POSE0, aLz: 2.4, aRz: 2.4, lL: Math.sin(ph) * 0.7, lR: -Math.sin(ph) * 0.7 } : { ...POSE0, aLz: 1.0 + Math.abs(Math.sin(t * 5)) * 0.8, aRz: 1.0 + Math.abs(Math.cos(t * 5)) * 0.8 }); setFace(g2, fire ? 'wide' : 'sparkle', fire ? 'scream' : 'grin', { stache: true, stacheColor: '#eeeeee' }); });
  } else if (E.key === '2010') {
    set = 'room';
    mom.root.visible = dad.root.visible = true; dad.root.position.set(1.6, 0, -0.6); dad.root.rotation.set(0, -1.0, 0);
    const k = clamp((t - E.a - 1.8) / 1.0); tcrib.position.copy(TCRIB0).add(V(-k * 0.6, k * 1.4 + Math.sin(t * 20) * 0.02 * k, 0)); tcrib.rotation.z = k * 0.25;
    babyH.root.visible = true; babyH.root.position.copy(tcrib.position).add(V(0, 0.33, 0)); babyH.root.rotation.set(0, 0, tcrib.rotation.z); applyPose(babyH, { ...POSE0, y: -0.36, lL: 1.45, lR: 1.45, aLz: 2.4, aRz: 2.4 }); setFace(babyH, 'sparkle', 'grin', {});
    mom.root.position.set(-0.4, 0, -1.0); mom.root.rotation.set(0, 0.6, 0); applyPose(mom, k > 0.3 ? { ...POSE0, aLz: 2.4, aRz: 2.4, eL: 0.3, eR: 0.3 } : { ...POSE0 }); setFace(mom, k > 0.3 ? 'wide' : 'smile', k > 0.3 ? 'scream' : 'smile', {});
    applyPose(dad, talkPose({ ...POSE0, aRx: 0.9, eR: 0.4 }, t, 'dad', 0.3)); setFace(dad, 'sparkle', talkMouth(t, 'dad', 'grin') || 'grin', { stache: true });
  } else set = 'montage';
  // lights per set
  const night = set === 'balcony';
  ambient.color.setHex(night ? 0x5060a0 : 0xfff0e0); ambient.intensity = night ? 0.45 : 0.7; moon.intensity = night ? 0.35 : 0.2; sunL.intensity = set === 'uni' ? 1.0 : 0; fill.intensity = 1.0;
  roomLight.position.set(set === 'nursery' ? NX : set === 'class' ? CX : set === 'wedding' ? WX : 0, 2.8, 1.0); roomLight.intensity = night ? 0 : 1.6;
  balcLight.intensity = 0; bathLight.intensity = 0; kitLight.intensity = 0; tvLight.intensity = 0;
  scene.background = new THREE.Color(night ? 0x060a1a : set === 'uni' ? 0x8ec8ff : 0x101010);
  return set;
}
function shotAt(t, set) {
  if (set === 'balcony') {
    if (t < T_RW + 0.6) { faceCam(dad, 2.0, 0.3, 0.1, 60, 0.4); return; }
    if (t < T_ANNO) { if (speakerAt(t) === 'mom') faceCam(mom, 1.9, -0.35, 0.05, 58, 0.3); else faceCam(dad, 2.0, 0.35, 0.1, 60, 0.4); return; }
    cam(V(0.3, 1.6, 3.2), V(0.3, 0.8, -0.6), 64); return;
  }
  const E = era(t); const k = easeInOut(seg(t, E.a, E.b));
  if (set === 'nursery') { if (speakerAt(t) === 'teta') faceCam(teta, 1.9, 0.3, 0.05, 58, 0.3); else cam(VL(V(NX + 0.9, 1.6, 2.9), V(NX + 0.7, 1.3, 2.3), k), V(NX + 0.1, 0.4, -0.3), 60); return; }
  if (set === 'class') { cam(VL(V(CX - 0.2, 1.4, 2.6), V(CX - 0.1, 1.3, 2.2), k).add(shake(t, t > E.a + 1.8 ? 0.03 : 0)), V(CX - 0.2, 0.8, 0.3), 62); return; }
  if (set === 'uni') { const s = speakerAt(t); if (s === 'mom') faceCam(mom, 1.8, 0.3, 0.05, 58, 0.3); else if (inT(t, Lx(7).t0 - 0.1, Lx(8).t0)) faceCam(dad, 1.8, -0.3, 0.05, 58, 0.3); else cam(V(UX, 1.6, 3.4), V(UX, 1.2, 0), 60); return; }
  if (set === 'wedding') { cam(VL(V(WX, 2.0, 4.2), V(WX, 2.2, 5.0), k).add(shake(t, t > E.a + 3.2 ? 0.05 : 0)), V(WX, 1.5, -1.0), 64); return; }
  if (set === 'room') { cam(V(0.2, 1.6, 2.6), V(0.3, 1.0, -1.2), 64); return; }
  cam(V(0, 1.6, 3), V(0, 1, 0), 60);
}
function particles(t, set) {
  const st = [], pf = [], tr = [];
  const E = era(t);
  if (set === 'class' && t > E.a + 1.8) { const p = V(CX, 1.2, 0.4); for (let i = 0; i < 18; i++) { const k = ((t - E.a - 1.8) * 1.2 + i / 18) % 1; pf.push({ pos: p.clone().add(V(Math.cos(i * 2.1) * k * 1.6, k * 1.8 - k * k * 1.6, Math.sin(i * 1.3) * k * 1.0)), size: 0.18 + k * 0.3, op: 1 - k, color: i % 3 ? 0xff5a10 : 0xffd040 }); } }
  if (set === 'uni' && t >= Lx(8).t0 - 0.3 && t < Lx(8).t0 + 1.4) { const p = blender.position; for (let i = 0; i < 16; i++) { const k = ((t - Lx(8).t0 + 0.3) * 1.5 + i / 16) % 1; pf.push({ pos: p.clone().add(V(-k * 1.2, 0.2 + Math.sin(i) * k * 0.5, Math.cos(i * 2) * k * 0.4)), size: 0.1, op: 1 - k, color: 0xffa020 }); } }
  if (set === 'wedding' && t > E.a + 2.3 && t < E.a + 3.4) { const a = (t - E.a - 2.3) / 1.1; for (let i = 0; i < 4; i++) { const from = V(WX + 1.3, 0.6, -1.2), to = V(WX, 3.4, -0.6); tr.push({ pos: VL(from, to, clamp(a + i * 0.05)), size: 0.3, op: 1, color: [0xffd400, 0xff3a3a, 0x3df05a, 0x5ab8ff][i] }); } }
  if (set === 'wedding' && t > E.a + 3.2) { const p = chand.position; for (let i = 0; i < 10; i++) { const a = (t - E.a - 3.2) * 3; st.push({ pos: p.clone().add(V(Math.cos(i) * a, Math.sin(i * 2) * a * 0.5, Math.sin(i) * a)), size: 0.2, color: [0xffd400, 0xff3a3a, 0x3df05a, 0x5ab8ff][i % 4] }); } }
  if (set === 'room' && t > E.a + 1.8) { const p = tcrib.position.clone().add(V(-0.75, 0.35, 0)); for (let i = 0; i < 8; i++) { const k = (t * 3 + i / 8) % 1; tr.push({ pos: p.clone().add(V(-k * 1.2, -k * 0.3, 0)), size: 0.3 + k * 0.4, op: 1 - k, color: k < 0.3 ? 0xffa030 : 0xdddddd }); } }
  emit(st, starPool); emit(pf, puffPool); emit(tr, trailPool); emit([], sweatPool);
}
function drawYear(g, t) {
  const E = era(t); if (!E.ar) return; const k = easeOut(seg(t, E.a, E.a + 0.4));
  g.save(); g.globalAlpha = k; g.fillStyle = 'rgba(0,0,0,0.65)'; g.fillRect(16, 200, 200, 92); g.fillStyle = '#ffe14a'; g.fillRect(16, 288, 200, 4);
  arText(g, E.ar, 206, 196, 56, '#ffe14a'); arText(g, E.label, 206, 252, 26, '#fff'); g.restore();
}
function drawMontage(g, t) {
  const E = era(t); if (E.key !== 'montage') return;
  g.fillStyle = '#0a0a18'; g.fillRect(0, 0, W, H);
  const n = cardImgs.length, dur = (E.b - E.a) / n; const i = Math.min(n - 1, Math.floor((t - E.a) / dur)); const a = ((t - E.a) % dur) / dur;
  for (let j = Math.max(0, i - 2); j <= i; j++) { const im = cardImgs[j]; if (!im.complete || !im.naturalWidth) continue; const age = i - j + a; const s = j === i ? easeBack(clamp(a * 3)) : 1; const rot = (j % 2 ? 0.08 : -0.08) * (1 + age * 0.3);
    g.save(); g.translate(W / 2 + (j - i) * 50, 330 + (i - j) * 18); g.rotate(rot); g.scale(s * 1.4, s * 1.4); g.globalAlpha = j === i ? 1 : 0.6; g.drawImage(im, -im.naturalWidth / 2, -im.naturalHeight / 2); g.restore(); }
  arText(g, 'كل الاختراعات...', W / 2, 40, 40, '#ffe14a', 'center'); pxText(g, `${i + 1} / ${n}`, W / 2, 104, 14, '#fff', 'center');
}
function oldFilm(g, t, s) {
  if (s <= 0) return; for (let i = 0; i < 3; i++) { const x = (hash(Math.floor(t * 8) + i * 17) * W) | 0; g.fillStyle = `rgba(255,255,240,${0.18 * s})`; g.fillRect(x, 0, 2, H); }
  for (let i = 0; i < 40; i++) { g.fillStyle = `rgba(0,0,0,${0.25 * s})`; g.fillRect((hash(i + Math.floor(t * 15) * 7) * W) | 0, (hash(i * 3 + Math.floor(t * 15)) * H) | 0, 2, 2); }
}
window.renderFrame = function (t) {
  const set = stateAt(t); shotAt(t, set); particles(t, set);
  renderer.render(scene, camera);
  ctx.clearRect(0, 0, W, H); const sep = era(t).sepia;
  if (sep > 0) ctx.filter = `sepia(${sep}) saturate(${1 - sep * 0.4}) contrast(1.05)`; ctx.drawImage(glCanvas, 0, 0); ctx.filter = 'none';
  h.clearRect(0, 0, W, H);
  oldFilm(h, t, sep); drawMontage(h, t); drawYear(h, t);
  drawHookV(h, t, T_HOOK, T_HOOK + 3.2, 'حكاية المخترع العالمي', 'من أول ما اتولد');
  drawRewind(h, t, T_RW, T_HOOK, 'نرجع لسنة ١٩٧٥...');
  drawDialogueV(h, t);
  drawEndV(h, t, T_ANNO + 0.1, 'LIFE STORY UNLOCKED', 'حكاية حياة المخترع', [['INVENTIONS', 'الاختراعات: ١١', T_ANNO + 1.2, '#ffe14a'], ['BALCONY YEARS', 'سنين البلكونة: ٢٥', T_ANNO + 2.8, '#ff5a4a']], DUR);
  ctx.drawImage(hud, 0, 0); vignette(ctx, 0.3 + sep * 0.25);
  return true;
};
window.frameData = () => out.toDataURL('image/png');
window.DUR = DUR;
document.fonts.load('10px PS2P').then(() => document.fonts.load('20px Lalezar', 'ع')).then(() => document.fonts.load('700 20px ReemKufi', 'ع')).then(() => { lateDraw.forEach(f => f()); window.READY = true; });
