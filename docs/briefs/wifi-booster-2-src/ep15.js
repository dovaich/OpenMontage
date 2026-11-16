// =====================================================================
// مقوّي الواي فاي النووي ٢ — vertical 9:16 (540×960 → 1080×1920)
// =====================================================================
room.visible = false; hallway.visible = false; balcony.visible = true;
skyB.visible = false; streetGlow.visible = false; laundry.forEach(c => c.visible = false);
scene.fog = null; scene.background = new THREE.Color(0x060a1a);
tvLight.intensity = 0; hallLight.intensity = 0;
const inT = (t, a, b) => t >= a && t < b;
function setFace(c, eyes, mouth, opts = {}) { c.faceMat.map = faceTexture(eyes, mouth, opts); c.faceMat.needsUpdate = true; }
const T_HOOK = 1.9, T_REVEAL = 6.6, T_SAMIR = 13.3, T_PW = 15.3, T_CONNECT = 22.3, T_STREET = 25.6, T_SHOUT = 27.72, T_HIDE = 31.65, T_ANNO = 33.4;

// ---------- the street across: windows light up with phone glow when the whole street connects ----------
const wins = []; const winOff = 0x0c1222, winWarm = 0x6a5a40, winPhone = 0x5ab8ff;
{
  const r = rng(77);
  for (let i = 0; i < 22; i++) {
    const x = -20 + i * 1.9 + (r() - .5), z = 8 + r() * 16, top = 1 + r() * 9, bot = -10, ww = 2.6 + r() * 1.5, hh = top - bot;
    mesh(box(ww, hh, 3), M([0x232838, 0x2a2622, 0x1e2433][i % 3]), x, bot + hh / 2, z, scene);
    for (let yy = bot + 1.2; yy < top - 0.4; yy += 1.3) for (let xx = -ww / 2 + 0.45; xx < ww / 2 - 0.3; xx += 0.75) if (r() > 0.3) { const w = mesh(new THREE.PlaneGeometry(0.4, 0.55), new THREE.MeshBasicMaterial({ color: winOff }), x + xx, yy, z - 1.51, scene); w.rotation.y = Math.PI; w.userData.warm = r() > 0.6; wins.push(w); }
  }
}
const stars = new THREE.Points(new THREE.BufferGeometry().setFromPoints(Array.from({ length: 260 }, (_, i) => { const a = hash(i) * 6.28, b = 0.15 + hash(i + 7) * 1.2; return V(Math.cos(a) * Math.cos(b) * 70, Math.sin(b) * 70, Math.sin(a) * Math.cos(b) * 70 + 10); })), new THREE.PointsMaterial({ color: 0xffffff, size: 2, sizeAttenuation: false }));
scene.add(stars);
const doorLight = new THREE.PointLight(0xffd08a, 1.4, 7, 1.2); doorLight.position.set(1.7, 1.6, -0.6); scene.add(doorLight);
const upLight = new THREE.PointLight(0xffd08a, 1.2, 6, 1.2); upLight.position.set(-0.4, 4.8, 0.2); scene.add(upLight);

// ---------- the Password Stethoscope 3000 ----------
const rig = new THREE.Group(); scene.add(rig);
mesh(cyl(0.025, 0.025, 2.1, 6), M(0x8a5a2b), 0, 1.05, 0, rig); // broom stick
const pan = new THREE.Group(); pan.position.y = 2.12; rig.add(pan);
mesh(cyl(0.2, 0.16, 0.06, 10), P(0x1d1d1f, { shininess: 80 }), 0, 0, 0, pan); mesh(box(0.04, 0.03, 0.3), P(0x111111), 0, -0.01, 0.3, pan);
mesh(cyl(0.07, 0.07, 0.03, 10), P(0xc8ced6, { shininess: 110 }), 0, 0.045, 0, pan); // chest piece pressed to the ceiling
for (let i = 0; i < 3; i++) mesh(box(0.44, 0.03, 0.03), P(0xc9ccd1), 0, 1.6 - i * 0.12, 0.03, rig); // duct tape
const tubeMat = new THREE.MeshLambertMaterial({ color: 0x111111 });
let tubeL = null, tubeR = null;
function tube(a, b, c) { return new THREE.TubeGeometry(new THREE.CatmullRomCurve3([a, b, c]), 12, 0.012, 4); }

// ---------- phones ----------
const phoneH = new THREE.Group(); son.arms[1].hand.add(phoneH);
mesh(box(0.08, 0.15, 0.012), P(0x222222), 0, 0.02, 0.06, phoneH); const scrH = mesh(new THREE.PlaneGeometry(0.07, 0.12), new THREE.MeshBasicMaterial({ color: 0x9fd0ff }), 0, 0.02, 0.0665, phoneH);
const phoneS = new THREE.Group(); samir.arms[1].hand.add(phoneS);
mesh(box(0.08, 0.15, 0.012), P(0x222222), 0, 0.02, 0.06, phoneS); mesh(new THREE.PlaneGeometry(0.07, 0.12), new THREE.MeshBasicMaterial({ color: 0x9fd0ff }), 0, 0.02, 0.0665, phoneS);

const DAD_P = V(0.35, 0, 0.15), SON_P = V(-0.55, 0, 0.3), MOM_DOOR = V(1.7, 0, -1.7), MOM_P = V(1.35, 0, -0.65);

function stateAt(t) {
  // ----- Hamada -----
  son.root.position.copy(SON_P); son.root.rotation.set(0, 0.35, 0);
  let sp = { ...POSE0, aRx: 1.1, eR: 1.5, aLx: 0.6, eL: 1.0, hx: 0.25 };
  if (inT(t, 2.3, 4.4)) { sp.aLz = 0.6; sp.hx = 0.1; }
  if (inT(t, 8.3, 9.9)) { sp.aLz = 0.9; sp.aLx = 0; sp.hx = 0; sp.hz = 0.15; }
  if (inT(t, 18.9, T_CONNECT)) { sp.aLx = 1.1; sp.eL = 1.5; sp.hx = 0.35; }
  if (inT(t, T_CONNECT, 24.0)) { sp = { ...POSE0, aLz: 2.6, aRz: 2.6, eL: 0.3, eR: 0.3, y: Math.abs(Math.sin(t * 10)) * 0.12 }; }
  if (t >= T_HIDE) { const k = easeIn(seg(t, T_HIDE, T_HIDE + 0.4)); son.root.position.set(-0.6, 0, -0.5); son.root.rotation.set(0, 0, 0); sp = { ...POSE0, y: -0.75 * k, bend: 1.3 * k, lL: 1.4 * k, lR: 1.4 * k, aLx: 1.6, aRx: 1.6, eL: 1.2, eR: 1.2 }; }
  applyPose(son, sp); phoneH.visible = t < T_HIDE;
  scrH.material.color.setHex(t < T_CONNECT ? (Math.floor(t * 2) % 2 ? 0xff5040 : 0x9fd0ff) : 0x3df05a);
  let se = 'tired', sm = talkMouth(t, 'son', 'scream') || 'flat';
  if (inT(t, 2.2, 4.5)) se = 'wide'; if (inT(t, 8.3, 9.9)) se = 'flat'; if (inT(t, 13.3, 18.7)) { se = 'side'; } if (inT(t, 18.9, T_CONNECT)) se = 'wide';
  if (inT(t, T_CONNECT, 24.0)) { se = 'sparkle'; sm = talkMouth(t, 'son', 'scream') || 'grin'; } if (inT(t, 24.0, T_HIDE)) { se = 'wide'; sm = 'o'; } if (t >= T_HIDE) { se = 'closed'; sm = 'flat'; }
  setFace(son, se, sm, {});

  // ----- Ibrahim + the rig -----
  dad.root.position.copy(DAD_P); dad.root.rotation.set(0, -0.25, 0);
  let dp = { ...POSE0 };
  const rigUp = t >= T_REVEAL - 0.4 && t < T_HIDE;
  if (rigUp) { dp.aLx = 2.4; dp.eL = 0.5; dp.aLz = 0.15; dp.aRx = 1.9; dp.eR = 0.6; dp.hx = -0.25; }
  if (inT(t, 4.6, T_REVEAL - 0.4)) { dp.aRx = 0.7; dp.eR = 1.2; }
  if (inT(t, 10.1, 13.0)) { dp.aRx = 1.4; dp.eR = 2.4; dp.hx = -0.1; } // finger to lips, other hand holds the stick
  if (inT(t, T_CONNECT, 24.0)) { dp.aRz = 2.4; dp.eR = 0.3; dp.aRx = 0; }
  if (t >= T_HIDE) { const k = easeIn(seg(t, T_HIDE, T_HIDE + 0.4)); dad.root.position.set(0.3, 0, -0.5); dad.root.rotation.set(0, 0, 0); dp = { ...POSE0, y: -0.8 * k, bend: 1.3 * k, lL: 1.4 * k, lR: 1.4 * k, aLx: 1.6, aRx: 1.6, eL: 1.2, eR: 1.2 }; }
  applyPose(dad, dp);
  let de = 'smug', dm = talkMouth(t, 'dad', 'grin') || 'smile';
  if (inT(t, T_REVEAL, 8.2)) de = 'sparkle'; if (inT(t, 10.1, 18.7)) { de = 'side'; if (!talkMouth(t, 'dad')) dm = 'o'; }
  if (inT(t, 18.9, 24.0)) { de = 'sparkle'; dm = 'grin'; } if (inT(t, 24.0, T_HIDE)) { de = 'wide'; dm = 'clench'; } if (t >= T_HIDE) { de = 'closed'; dm = talkMouth(t, 'dad') || 'flat'; }
  setFace(dad, de, dm, { stache: true });
  rig.visible = t >= T_REVEAL - 0.4;
  if (rig.visible) {
    if (rigUp) { const hp = dad.arms[0].hand.getWorldPosition(V(0, 0, 0)); rig.position.set(hp.x, Math.max(0, 3.09 - 2.15), hp.z); rig.rotation.set(0, 0, 0); }
    else { rig.position.set(1.2, 0, 0.6); rig.rotation.set(0, 0, 0.9); }
    if (tubeL) { scene.remove(tubeL); tubeL.geometry.dispose(); scene.remove(tubeR); tubeR.geometry.dispose(); tubeL = tubeR = null; }
    if (rigUp) { const top = pan.getWorldPosition(V(0, 0, 0)).add(V(0, -0.05, 0.05)); const h = headOf(dad); const f = dad.head.getWorldDirection(V(0, 0, 0)); const r = V(f.z, 0, -f.x);
      const eL = h.clone().add(r.clone().multiplyScalar(0.3)), eR = h.clone().add(r.clone().multiplyScalar(-0.3)); const mid = top.clone().add(h).multiplyScalar(0.5).add(V(0, 0, 0.25));
      tubeL = new THREE.Mesh(tube(top, mid.clone().add(r.clone().multiplyScalar(0.15)), eL), tubeMat); tubeR = new THREE.Mesh(tube(top, mid.clone().add(r.clone().multiplyScalar(-0.15)), eR), tubeMat); scene.add(tubeL); scene.add(tubeR); }
  }

  // ----- Abu Samir upstairs -----
  samir.root.visible = true; samir.root.position.set(-0.4, 0.09, 0.85); samir.root.rotation.set(0, 0.25, 0);
  let mp = { ...POSE0, aRx: 1.1, eR: 1.5, aLx: 0.5, eL: 1.0, hx: 0.3 };
  const angry = t < 1.4 || t >= T_SHOUT;
  if (angry) { mp = { ...POSE0, aLz: 2.4 + Math.sin(t * 9) * 0.25, eL: 0.3, aRx: 0.6, eR: 0.4, aRz: 0.4, hx: -0.15, bend: 0.25 }; samir.root.position.z = 1.0; }
  applyPose(samir, talkPose(mp, t, 'samir', 0.3)); phoneS.visible = !angry;
  cane.visible = angry; if (angry) { const hp = samir.arms[0].hand.getWorldPosition(V(0, 0, 0)); upper.worldToLocal(hp); cane.position.copy(hp).add(V(0, 0.3, 0)); cane.rotation.set(0, 0, 0.3 + Math.sin(t * 9) * 0.3); }
  setFace(samir, angry ? 'angry' : inT(t, T_SAMIR, 18.7) ? 'smug' : 'tired', talkMouth(t, 'samir', 'scream') || (angry ? 'scream' : 'smile'), { stache: true, stacheColor: '#eeeeee' });
  samLed.material.color.setHex(t >= T_CONNECT ? (Math.floor(t * 12) % 2 ? 0x3df05a : 0xff3a2a) : (Math.floor(t * 3) % 2 ? 0x3df05a : 0x1a6a2a));

  // ----- Om Hamada -----
  const momIn = t >= 23.7 && t < T_HIDE; mom.root.visible = momIn;
  if (momIn) { const k = easeOut(seg(t, 23.7, 24.3)); mom.root.position.copy(VL(MOM_DOOR, MOM_P, k)); mom.root.rotation.set(0, -0.3, 0);
    const p = { ...POSE0, aLx: 0.9, eL: 0.3, aRz: 0.2 }; if (t > 25.5) { p.aLx = 1.5; p.eL = 0.1; p.aLz = 0.7; p.hy = 0.6; }
    applyPose(mom, talkPose(p, t, 'mom', 0.4)); setFace(mom, t < 25.5 ? 'side' : 'wide', talkMouth(t, 'mom', 'scream') || 'o', {}); }

  // ----- the street connects: windows switch to phone-blue -----
  wins.forEach((w, i) => { const on = t < 1.4 || t >= T_STREET + Math.hypot(w.position.x, w.position.z) * 0.05 - 0.4;
    w.material.color.setHex(on ? (w.userData.warm ? winWarm : (Math.floor(t * 3 + i) % 5 ? winPhone : 0x9fe0ff)) : (w.userData.warm ? winWarm : winOff)); });
  ambient.color.setHex(0x5060a0); ambient.intensity = 0.42; moon.intensity = 0.35; balcLight.intensity = 0;
}
function talkPose(p, t, who, amt = 1) { if (speakerAt(t) !== who) return p; const e = envAt(t) * amt; p.aRx += e * 0.35 * (1 + Math.sin(t * 5.3)); p.eR += e * 0.5; p.hy += Math.sin(t * 2.1) * 0.08; return p; }

// ---------- shots (portrait framing) ----------
function shotAt(t) {
  if (t < 1.4) { const h = headOf(samir); cam(h.clone().add(V(0.3, -0.9, 2.6)).add(shake(t, 0.05)), h.clone().add(V(0, -0.2, 0)), 62); return; }
  if (t < 4.6) { faceCam(son, 1.7, 0.3, 0.0, 58, 0.35); return; }
  if (t < 8.37) { const k = easeOut(seg(t, 4.6, T_REVEAL + 0.4)); cam(VL(V(0.5, 1.5, 2.6), V(0.6, 1.4, 3.4), k), V(0.35, lerp(1.3, 2.0, k), 0), 68); return; }
  if (t < 10.14) { faceCam(son, 1.6, 0.35, 0.0, 58, 0.35); return; }
  if (t < 13.3) { faceCam(dad, 1.7, -0.3, 0.1, 60, 0.15); return; }
  if (t < 18.7) { const h = headOf(samir); cam(h.clone().add(V(0.5, 0.15, 1.7)), h.clone().add(V(0, -0.35, 0)), 60); return; }
  if (t < 24.06) { faceCam(son, 1.8, 0.35, 0.05, 60, 0.4); return; }
  if (t < T_STREET) { faceCam(mom, 1.9, -0.4, 0.05, 58, 0.3); return; }
  if (t < T_SHOUT) { const k = easeOut(seg(t, T_STREET, T_SHOUT)); cam(VL(V(-0.3, 1.9, 1.05), V(-0.3, 2.2, 1.15), k), V(0, 0.0, 16), 70); return; }
  if (t < T_HIDE) { const h = headOf(samir); cam(h.clone().add(V(0.4, -1.2, 2.4)).add(shake(t, 0.04)), h.clone().add(V(0, -0.3, 0)), 62); return; }
  if (t < T_ANNO) { cam(V(-0.1, 1.2, 2.3), V(-0.1, 0.45, -0.4), 60); return; }
  const k = easeInOut(seg(t, T_ANNO, 40)); cam(VL(V(0.2, 1.4, 4.0), V(0.2, 1.6, 6.2), k), VL(V(0, 2.6, 0), V(0, 3.0, 0), k), 74);
}

// ---------- particles ----------
function particles(t) {
  const st = [], sw = [];
  if (inT(t, T_CONNECT, 24.2)) { const p = phoneH.getWorldPosition(V(0, 0, 0)); for (let i = 0; i < 14; i++) { const k = ((t - T_CONNECT) * 1.2 + i / 14) % 1; st.push({ pos: p.clone().add(V(Math.cos(i * 2.3) * k * 1.2, k * 1.4, Math.sin(i * 1.7) * k * 0.6)), size: 0.12 * (1 - k * 0.5), color: [0xffe14a, 0x3df05a, 0x5ab8ff][i % 3] }); } }
  if (t >= T_SHOUT || t < 1.4) { const h = headOf(samir); for (let i = 0; i < 3; i++) { const k = (t * 1.5 + i / 3) % 1; sw.push({ pos: h.clone().add(V((i - 1) * 0.25, 0.3 + k * 0.4, 0.1)), size: 0.09, op: 1 - k }); } }
  emit(st, starPool); emit([], puffPool); emit([], trailPool); emit(sw, sweatPool);
}

// ---------- 2D overlays (portrait layout) ----------
function wrapAr(g, s, x, y, size, maxW, color, lh) { g.font = `${size}px Lalezar`; g.direction = 'rtl'; const rows = ['']; for (const w of s.split(' ')) { const tr = rows[rows.length - 1] ? rows[rows.length - 1] + ' ' + w : w; if (g.measureText(tr).width > maxW && rows[rows.length - 1]) rows.push(w); else rows[rows.length - 1] = tr; } rows.forEach((r, i) => arText(g, r, x, y + i * lh, size, color, 'center')); return rows.length; }
function drawHook(g, t) {
  if (t < T_HOOK || t >= 5.2) return; const k = easeBack(seg(t, T_HOOK, T_HOOK + 0.3)) * (1 - easeIn(seg(t, 4.9, 5.2)));
  g.save(); g.translate(W / 2, 150); g.scale(k, k); g.fillStyle = 'rgba(255,255,255,0.95)'; g.fillRect(-250, -66, 500, 132); g.fillStyle = '#d8231b'; g.fillRect(-250, 58, 500, 8);
  arText(g, 'لما الجيران', 0, -66, 46, '#111', 'center'); arText(g, 'يغيّروا باسورد الواي فاي', 0, -10, 46, '#d8231b', 'center'); g.restore();
}
function phoneUI(g, t, x, y, s, mode, extra) {
  g.save(); g.translate(x, y); g.scale(s, s);
  g.fillStyle = '#111'; g.fillRect(-90, -160, 180, 320); g.fillStyle = '#0a1a3a'; g.fillRect(-80, -140, 160, 280);
  pxText(g, 'Wi-Fi', -66, -128, 9, '#fff', 'left', false);
  g.fillStyle = 'rgba(255,255,255,0.12)'; g.fillRect(-74, -104, 148, 52); arText(g, 'أبو سمير', 64, -104, 20, '#fff');
  if (mode === 'wrong') { g.fillStyle = '#d8231b'; g.fillRect(-74, -36, 148, 60); arText(g, 'كلمة السر غلط', 0, -34, 22, '#fff', 'center'); pxText(g, 'X', 0, -2, 14, '#fff', 'center', false); }
  if (mode === 'typing') { g.fillStyle = '#fff'; g.fillRect(-74, -36, 148, 40); arText(g, extra, 66, -34, 18, '#111'); if (Math.floor(t * 4) % 2) { g.fillStyle = '#111'; g.fillRect(-66, -28, 2, 24); } }
  if (mode === 'ok') { g.fillStyle = '#1f9e5a'; g.fillRect(-74, -36, 148, 60); arText(g, 'اتوصل!', 0, -34, 26, '#fff', 'center'); pxText(g, 'CONNECTED', 0, 2, 7, '#fff', 'center', false); }
  if (mode === 'devices') { g.fillStyle = '#d8231b'; g.fillRect(-74, -36, 148, 96); pxText(g, `${extra}`, 0, -28, 28, '#fff', 'center'); arText(g, 'جهاز متوصل', 0, 14, 20, '#fff', 'center'); }
  g.restore();
}
function drawPhones(g, t) {
  if (t < 1.4) { phoneUI(g, t, W - 110, 250, 0.75, 'devices', 47); return; }
  if (inT(t, 2.2, 4.6)) phoneUI(g, t, W - 110, 380, 0.7, 'wrong');
  if (inT(t, 18.9, T_CONNECT)) { const full = 'إبراهيم_حرامي'; const n = Math.min(full.length, Math.floor((t - 19.0) / (21.7 - 19.0) * full.length)); phoneUI(g, t, W - 110, 380, 0.75, 'typing', full.slice(0, Math.max(0, n))); }
  if (inT(t, T_CONNECT, 24.0)) phoneUI(g, t, W - 110, 380, 0.75 * easeBack(seg(t, T_CONNECT, T_CONNECT + 0.3)), 'ok');
  if (inT(t, T_STREET, T_SHOUT)) { const c = Math.min(47, Math.floor(1 + (t - T_STREET) * 26)); phoneUI(g, t, W - 110, 300, 0.75, 'devices', c); }
}
function drawPasswordBubble(g, t) {
  if (!inT(t, T_PW, 18.7)) return; const k = easeBack(seg(t, T_PW, T_PW + 0.3));
  g.save(); g.translate(W / 2, 170); g.scale(k, k); g.fillStyle = '#fff'; g.fillRect(-200, -46, 400, 92); g.strokeStyle = '#111'; g.lineWidth = 4; g.strokeRect(-200, -46, 400, 92);
  pxText(g, 'NEW PASSWORD', 0, -38, 10, '#d8231b', 'center', false); arText(g, 'إبراهيم_حرامي', 0, -22, 40, '#111', 'center'); g.restore();
}
function drawInvention(g, t) {
  if (t < T_REVEAL + 0.1 || t >= 9.9) return; const k = easeBack(seg(t, T_REVEAL + 0.1, T_REVEAL + 0.45)) * (1 - easeIn(seg(t, 9.5, 9.9)));
  g.save(); g.translate(W / 2, 150); g.scale(k, k); g.fillStyle = 'rgba(10,10,30,0.92)'; g.fillRect(-230, -80, 460, 160); g.strokeStyle = '#ffe14a'; g.lineWidth = 3; g.strokeRect(-230, -80, 460, 160);
  pxText(g, 'NEW INVENTION!', 0, -70, 12, '#ffe14a', 'center', false); arText(g, 'سمّاعة الباسورد ٣٠٠٠', 0, -50, 36, '#fff', 'center');
  const bar = (y, lbl, n, col) => { pxText(g, lbl, -210, y, 9, '#9fd0ff', 'left', false); for (let i = 0; i < 10; i++) { g.fillStyle = i < n ? col : '#333'; g.fillRect(-40 + i * 22, y - 3, 17, 14); } };
  bar(10, 'HEARING', 9, '#3df05a'); bar(34, 'LEGALITY', 0, '#ff5a4a'); g.restore();
}
function drawColdOpen(g, t) {
  if (t >= 1.95) return;
  if (t >= 1.4) { g.fillStyle = 'rgba(0,0,0,0.5)'; g.fillRect(0, 0, W, H); for (let i = 0; i < 8; i++) { g.fillStyle = 'rgba(255,255,255,0.25)'; g.fillRect(0, ((t * 1600 + i * 130) % H), W, 6); } pxText(g, '<< REWIND', W / 2, H / 2 - 60, 18, '#fff', 'center'); arText(g, 'قبلها بدقيقة...', W / 2, H / 2 - 30, 34, '#ffe14a', 'center'); }
}
function drawEnd(g, t) {
  if (t >= T_ANNO + 0.1 && t < 38.6) {
    const k = easeBack(seg(t, T_ANNO + 0.1, T_ANNO + 0.45)); g.save(); g.translate(W / 2, H - 230); g.scale(k, k);
    g.fillStyle = 'rgba(0,0,30,0.92)'; g.fillRect(-240, -100, 480, 200); g.strokeStyle = '#ff3a2a'; g.lineWidth = 3; g.strokeRect(-240, -100, 480, 200);
    pxText(g, 'PASSWORD CRACKED!', 0, -88, 14, '#3df05a', 'center'); arText(g, 'الباسورد اتكسر', 0, -66, 32, '#fff', 'center');
    if (t > 35.2) { const c = Math.min(10, Math.floor((t - 35.2) * 6)); pxText(g, 'NEIGHBOR ANGER', -220, 4, 9, '#fff', 'left', false); for (let i = 0; i < 10; i++) { g.fillStyle = i < c ? (i > 6 ? '#ff2a2a' : '#ff8a3a') : '#333'; g.fillRect(-60 + i * 22, 0, 18, 18); }
      if (c >= 10 && Math.floor(t * 5) % 2) { pxText(g, 'MAX!', 0, 40, 18, '#ff2a2a', 'center'); arText(g, 'غضب الجيران: آخره', 0, 62, 24, '#ffe14a', 'center'); } }
    g.restore();
  }
  if (t >= 38.6) { const k = easeOut(seg(t, 38.6, 39.0)); g.fillStyle = `rgba(0,0,0,${0.7 * k})`; g.fillRect(0, 0, W, H); g.save(); g.translate(W / 2, H / 2 - 60); g.scale(k, k); arText(g, 'يُتبع...', 0, -40, 64, '#ffe14a', 'center', 'ReemKufi'); pxText(g, 'TO BE CONTINUED', 0, 40, 16, '#fff', 'center'); g.restore(); }
  if (t > 40.7) { g.fillStyle = `rgba(0,0,0,${clamp((t - 40.7) / 0.8)})`; g.fillRect(0, 0, W, H); }
}
const NAMES = { son: ['حمادة', 'HAMADA', '#d4141c'], dad: ['إبراهيم', 'IBRAHIM', '#c9a227'], mom: ['أم حمادة', 'OM HAMADA', '#1f9e5a'], samir: ['أبو سمير', 'ABU SAMIR', '#6a6f78'] };
function portrait(g, x, y, who, t, S = 64) {
  const u = S / 64; g.save(); g.translate(x, y); g.scale(u, u);
  g.fillStyle = '#123'; g.fillRect(0, 0, 64, 64); g.strokeStyle = '#fff'; g.lineWidth = 2; g.strokeRect(0, 0, 64, 64);
  g.beginPath(); g.rect(2, 2, 60, 60); g.clip();
  const skin = { son: '#b98058', dad: '#b27448', mom: '#c98d5f', samir: '#c8946a' }[who];
  const shirt = { son: '#d4141c', dad: '#f3f0e3', mom: '#e86a8a', samir: '#8a8f96' }[who];
  g.fillStyle = shirt; g.fillRect(8, 54, 48, 10);
  if (who === 'mom') { g.fillStyle = '#1f9e5a'; g.beginPath(); g.arc(32, 36, 25, 0, 7); g.fill(); }
  g.fillStyle = skin; g.beginPath(); g.arc(32, 36, 20, 0, 7); g.fill();
  if (who === 'mom') { g.fillStyle = '#1f9e5a'; g.beginPath(); g.arc(32, 30, 22, Math.PI, 0); g.fill(); }
  if (who === 'son') { g.fillStyle = '#17110c'; for (let i = 0; i < 6; i++) { g.beginPath(); g.arc(16 + i * 6.5, 19 + (i % 2) * 2, 6, 0, 7); g.fill(); } g.fillStyle = '#222'; g.fillRect(9, 30, 6, 12); g.fillRect(49, 30, 6, 12); }
  if (who === 'samir') { g.fillStyle = '#ffffff'; g.beginPath(); g.arc(32, 27, 21, Math.PI, 0); g.fill(); g.fillStyle = '#f2f2f2'; g.fillRect(10, 30, 5, 10); g.fillRect(49, 30, 5, 10); }
  if (who === 'dad') { g.fillStyle = '#1b1410'; g.fillRect(10, 30, 5, 12); g.fillRect(49, 30, 5, 12); g.fillStyle = '#c9a227'; g.fillRect(14, 16, 36, 5); }
  const fc = document.createElement('canvas'); fc.width = 32; fc.height = 32; const fg = fc.getContext('2d');
  const e = envAt(t); const mouth = speakerAt(t) === who ? (e < 0.1 ? 'closed' : e < 0.4 ? 'talk1' : 'talk2') : 'closed';
  const eyes = { son: 'tired', dad: 'smug', mom: 'angry', samir: 'angry' }[who];
  drawFace(fg, 32, eyes, mouth, { stache: who === 'dad' || who === 'samir', stacheColor: who === 'samir' ? '#eeeeee' : undefined });
  g.imageSmoothingEnabled = false; g.drawImage(fc, 14, 20, 36, 36); g.restore();
}
// big, phone-readable dialogue box at the bottom
function drawDialogueV(g, t) {
  const L = LINES.find(l => l.s !== 'anno' && t >= l.t0 - 0.05 && t < l.t1 + Math.min(0.45, l.gap_after));
  if (!L) return;
  const x = 12, w = W - 24, hh = 168, y = H - hh - 40;
  const gr = g.createLinearGradient(0, y, 0, y + hh); gr.addColorStop(0, 'rgba(20,40,150,0.9)'); gr.addColorStop(1, 'rgba(5,10,60,0.94)');
  g.fillStyle = gr; g.fillRect(x, y, w, hh); g.strokeStyle = '#fff'; g.lineWidth = 3; g.strokeRect(x + 1.5, y + 1.5, w - 3, hh - 3);
  portrait(g, x + w - 92, y + 16, L.s, t, 80);
  const [name, nameEn, col] = NAMES[L.s];
  g.fillStyle = col; g.fillRect(x + w - 210, y - 20, 190, 30); g.strokeStyle = '#fff'; g.lineWidth = 2; g.strokeRect(x + w - 210, y - 20, 190, 30);
  arText(g, name, x + w - 28, y - 22, 24, '#fff'); pxText(g, nameEn, x + w - 202, y - 10, 8, '#fff', 'left');
  const words = L.ar.split(' '); const n = revealCount(L, t); const shown = words.slice(0, n).join(' ');
  g.font = '30px Lalezar'; g.direction = 'rtl'; const maxW = w - 120; const rows = [''];
  for (const wd of shown.split(' ').filter(Boolean)) { const tr = rows[rows.length - 1] ? rows[rows.length - 1] + ' ' + wd : wd; if (g.measureText(tr).width > maxW && rows[rows.length - 1]) rows.push(wd); else rows[rows.length - 1] = tr; }
  rows.slice(0, 3).forEach((r, i) => arText(g, r, x + w - 108, y + 10 + i * 40, 30, '#ffffff', 'right'));
  const ew = L.en.split(' '); const en = ew.slice(0, Math.ceil(ew.length * n / words.length)).join(' ');
  g.font = '8px PS2P'; const er = ['']; for (const wd of en.split(' ')) { const tr = er[er.length - 1] ? er[er.length - 1] + ' ' + wd : wd; if (g.measureText(tr).width > w - 40 && er[er.length - 1]) er.push(wd); else er[er.length - 1] = tr; }
  er.slice(0, 2).forEach((r, i) => pxText(g, r, x + 14, y + hh - 34 + i * 14, 8, '#9fd0ff', 'left'));
}

window.renderFrame = function (t) {
  stateAt(t); shotAt(t); particles(t);
  renderer.render(scene, camera);
  ctx.clearRect(0, 0, W, H); ctx.drawImage(glCanvas, 0, 0);
  h.clearRect(0, 0, W, H);
  drawHook(h, t); drawInvention(h, t); drawPasswordBubble(h, t); drawPhones(h, t); drawColdOpen(h, t);
  drawDialogueV(h, t); drawEnd(h, t);
  ctx.drawImage(hud, 0, 0); vignette(ctx, 0.3);
  if (t >= T_CONNECT && t < T_CONNECT + 0.06) { ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.fillRect(0, 0, W, H); }
  return true;
};
window.frameData = () => out.toDataURL('image/png');
window.DUR = DUR;
document.fonts.load('10px PS2P').then(() => document.fonts.load('20px Lalezar', 'ع')).then(() => document.fonts.load('700 20px ReemKufi', 'ع')).then(() => { window.READY = true; });
