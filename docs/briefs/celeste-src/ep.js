// =====================================================================
// المركب اللي لقوها فاضية — Mary Celeste, 1872. Documentary mystery, narrator like the Ring Road video. vertical 9:16
// narrator NX1..NX8, Ibrahim DX1 (frozen PAUSE pop-in after NX5), DX2 CTA at home. Fixed lighting per scene, cast-style characters.
// =====================================================================
const NARR = LINES.filter(l => l.s === 'anno'), DL = LINES.filter(l => l.s === 'dad');
const NX = (i) => NARR[i - 1], DX = (i) => DL[i - 1];
const POPS = [[DX(1).t0 - 0.55, DX(1).t1 + 0.45]];
const popAt = (t) => POPS.find(([a, b]) => t >= a && t < b) || null;
const T_THEORY = NX(7).t0 + (NX(7).t1 - NX(7).t0) * 0.32, T_SNAP = NX(7).t1 - 0.8, T_HOME = DX(2).t0 - 0.3;
const sceneAt = (t) => t < NX(2).t0 - 0.2 ? 'ny' : t < NX(3).t0 - 0.2 ? 'deck' : t < NX(4).t0 - 0.2 ? 'found' : t < NX(6).t0 - 0.2 ? 'board' : t < NX(7).t0 - 0.2 ? 'log' : t < T_THEORY ? 'hold' : t < NX(8).t0 - 0.2 ? 'theory' : t < T_HOME ? 'fog' : 'home';
camera.far = 1500;
// ---------- our own fixed lights ----------
const hemi = new THREE.HemisphereLight(0xbfd8ff, 0x3a3020, 0); scene.add(hemi);
const sun = new THREE.DirectionalLight(0xffffff, 0); sun.position.set(-60, 80, 40); scene.add(sun); scene.add(sun.target);
const plankTex = canvasTex(64, 16, (g) => { g.fillStyle = '#8a6a44'; g.fillRect(0, 0, 64, 16); g.fillStyle = '#6a4e30'; for (let y = 0; y < 16; y += 4) g.fillRect(0, y, 64, 1); }); plankTex.wrapS = plankTex.wrapT = THREE.RepeatWrapping;
// ---------- SEA (x = 0 world offset OX) ----------
const OX = 1200; const sea = new THREE.Group(); sea.position.x = OX; scene.add(sea);
const SEG = 110, SZ = 360;
const waterGeo = new THREE.PlaneGeometry(SZ, SZ, SEG, SEG); waterGeo.rotateX(-Math.PI / 2);
const waterMat = new THREE.MeshPhongMaterial({ color: 0x1f4a6a, specular: 0x88aacc, shininess: 60, flatShading: true });
const water = new THREE.Mesh(waterGeo, waterMat); sea.add(water);
const W0 = waterGeo.attributes.position.array.slice();
let STORM = 0; let WT = 0;
function waveH(x, z, t, s = STORM) { // world-local (sea) coords
  const a = 0.25 + 2.6 * s;
  return a * (Math.sin(x * 0.11 + t * 1.1) * 0.6 + Math.sin(z * 0.08 - t * 0.9 + 1.3) * 0.7 + Math.sin((x + z) * 0.05 + t * 0.6) * 0.5) + (0.05 + 0.6 * s) * Math.sin(x * 0.5 + z * 0.4 + t * 2.2);
}
function updateWater(t, cx, cz) {
  water.position.set(cx, 0, cz); const p = waterGeo.attributes.position.array;
  for (let i = 0; i < p.length; i += 3) p[i + 1] = waveH(W0[i] + cx, W0[i + 2] + cz, t);
  waterGeo.attributes.position.needsUpdate = true; waterGeo.computeVertexNormals();
}
function floatPose(obj, x, z, yaw, t, len = 10, wid = 4, extraRoll = 0) {
  const h = waveH(x, z, t), f = V(Math.sin(yaw), 0, Math.cos(yaw)), r = V(f.z, 0, -f.x);
  const hf = waveH(x + f.x * len / 2, z + f.z * len / 2, t), hb = waveH(x - f.x * len / 2, z - f.z * len / 2, t);
  const hr = waveH(x + r.x * wid / 2, z + r.z * wid / 2, t), hl = waveH(x - r.x * wid / 2, z - r.z * wid / 2, t);
  obj.position.set(OX + x, h, z); obj.rotation.set(0, 0, 0); obj.rotation.order = 'YXZ'; obj.rotation.y = yaw; obj.rotation.x = -Math.atan2(hf - hb, len) ; obj.rotation.z = Math.atan2(hr - hl, wid) + extraRoll;
}
function hullGeo(L, B, H) {
  const sh = new THREE.Shape(); sh.moveTo(-B / 2, -L / 2); sh.lineTo(B / 2, -L / 2); sh.lineTo(B / 2, L * 0.25); sh.quadraticCurveTo(B / 2, L * 0.45, 0, L / 2); sh.quadraticCurveTo(-B / 2, L * 0.45, -B / 2, L * 0.25); sh.closePath();
  const geo = new THREE.ExtrudeGeometry(sh, { depth: H, bevelEnabled: false }); geo.rotateX(-Math.PI / 2); geo.translate(0, -H * 0.55, 0); return geo;
}
const ropeGeo = new THREE.BufferGeometry(); ropeGeo.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(3 * 24), 3)); const rope = new THREE.Line(ropeGeo, new THREE.LineBasicMaterial({ color: 0xd8c8a0 })); scene.add(rope);
function setRope(a, b2, sag) { const p = ropeGeo.attributes.position.array; for (let i = 0; i < 24; i++) { const k = i / 23; const v = VL(a, b2, k); v.y -= Math.sin(k * Math.PI) * sag; p[i * 3] = v.x; p[i * 3 + 1] = v.y; p[i * 3 + 2] = v.z; } ropeGeo.attributes.position.needsUpdate = true; }
// ---------- sailors (low-poly, 1877 look) ----------
function makeSailor(parent, coat = 0x1f2a44, cap = 0x1f2a44, captain = false, seed = 1) {
  // same construction as the series cast (makeChar): big head, painted face texture, mitten hands
  const skin = [0xc8946a, 0xb98058, 0xd8a878, 0xa87048][seed % 4];
  const c = makeChar({ seed: 100 + seed, skin, hipY: 0.84, legX: 0.11, legColor: 0x2a2a30, shoe: 0x111111, hand: skin,
    torsoGeo: cyl(0.25, 0.27, 0.64, 6), torsoTex: canvasTex(16, 16, (g) => { g.fillStyle = '#' + coat.toString(16).padStart(6, '0'); g.fillRect(0, 0, 16, 16); g.fillStyle = '#d8c890'; for (let i = 0; i < 3; i++) g.fillRect(7, 3 + i * 4, 2, 2); }), torsoColor: 0xffffff, torsoY: 0.32,
    sleeve: true, sleeveColor: coat, shoulderX: 0.31, shoulderY: 0.57, neckY: 0.64, headR: 0.27,
    build(head, torso, reg) {
      if (captain) { mesh(cyl(0.29, 0.29, 0.14, 12), reg(M(0x1a1a2a)), 0, 0.2, 0, head); mesh(box(0.42, 0.03, 0.22), reg(M(0x111111)), 0, 0.14, 0.2, head); mesh(box(0.14, 0.06, 0.02), reg(M(0xd8b030)), 0, 0.22, 0.29, head); }
      else { mesh(cyl(0.26, 0.25, 0.16, 10), reg(M(cap)), 0, 0.2, 0, head); mesh(box(0.06, 0.18, 0.02), reg(M(0x111111)), 0.2, 0.12, -0.2, head); }
      const beard = mesh(box(0.42, 0.14, 0.1), reg(M([0x2a1a10, 0x4a3a2a, 0x1a1410][seed % 3])), 0, -0.2, 0.2, head);
      return {};
    } }, parent);
  return c;
}
function wrapAr(g, s, size, maxW) { g.font = `${size}px Lalezar`; const w = s.split(' '); const out = []; let cur = ''; for (const x of w) { const c = cur ? cur + ' ' + x : x; if (g.measureText(c).width > maxW && cur) { out.push(cur); cur = x; } else cur = c; } if (cur) out.push(cur); return out; }
function drawSub(g, t) {
  const l = LINES.find(l => l.s === 'anno' && t >= l.t0 - 0.05 && t < l.t1 + 0.3); if (!l || !l.ar) return;
  const a = Math.min(1, (t - l.t0 + 0.05) / 0.25, (l.t1 + 0.3 - t) / 0.25); g.save(); g.globalAlpha = a; const lines = wrapAr(g, l.ar, 26, W - 70); const hh = 20 + lines.length * 38;
  g.fillStyle = 'rgba(0,0,0,0.6)'; g.fillRect(20, H - 70 - hh, W - 40, hh); lines.forEach((s, i) => arText(g, s, W / 2, H - 70 - hh + 6 + i * 38, 26, '#fff', 'center')); g.restore();
}
function popIn(t, pop) {
  const [a, b] = pop; const f = camera.getWorldDirection(V(0, 0, 0)); const up = V(0, 1, 0); const r = V().crossVectors(f, up).normalize();
  const kin = easeBack(seg(t, a, a + 0.45)), kout = easeIn(seg(t, b - 0.35, b));
  const slide = (1 - kin) * 2.6 + kout * -3.0; const hop = Math.abs(Math.sin(seg(t, a, a + 0.45) * Math.PI)) * 0.5 + kout * 1.2;
  const base = camera.position.clone().add(f.clone().multiplyScalar(2.3)).add(r.clone().multiplyScalar(slide)).add(V(0, -1.55 + hop, 0));
  dad.root.visible = true; dad.root.position.copy(base); dad.root.rotation.set(0, Math.atan2(-f.x, -f.z) + (1 - kin) * 0.6, 0);
  const p = { ...POSE0, aRx: 1.25, aRz: 0.55, eR: 0.35, aLz: 0.9 + Math.sin(t * 5) * 0.15, eL: 0.6, hy: Math.sin(t * 2) * 0.1 };
  applyPose(dad, talkPose(p, t, 'dad', 0.35)); setFace(dad, 'sparkle', talkMouth(t, 'dad', 'grin') || 'grin', { stache: true });
  popLight.position.copy(camera.position).add(V(0, 0.5, 0)); popLight.intensity = 2.2;
}
// ---------- the brigantine (Mary Celeste and Dei Gratia) ----------
const sailTex = canvasTex(32, 32, (g) => { g.fillStyle = '#ece4cc'; g.fillRect(0, 0, 32, 32); g.fillStyle = '#d8ceb0'; for (let x = 0; x < 32; x += 6) g.fillRect(x, 0, 1, 32); g.fillStyle = 'rgba(120,100,70,0.15)'; g.fillRect(0, 26, 32, 6); });
function sail(parent, w, h, x, y, z, ry = 0) { const geo = new THREE.PlaneGeometry(w, h, 6, 6); const p = geo.attributes.position.array; for (let i = 0; i < p.length; i += 3) p[i + 2] = Math.sin((p[i + 1] / h + 0.5) * Math.PI) * 0.35 * Math.cos(p[i] / w * Math.PI); geo.computeVertexNormals(); const m = mesh(geo, M(0xffffff, { map: sailTex, side: THREE.DoubleSide }), x, y, z, parent); m.rotation.y = ry; return m; }
function line(parent, pts, col = 0x2a2218) { return mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 6, 0.02, 3), M(col), 0, 0, 0, parent); }
function makeBrig(hullCol, stripeCol) {
  const g = new THREE.Group(); scene.add(g); const b = new THREE.Group(); g.add(b); const L = 30, B = 7;
  const wood = canvasTex(64, 16, (c) => { c.fillStyle = '#' + hullCol.toString(16).padStart(6, '0'); c.fillRect(0, 0, 64, 16); c.fillStyle = 'rgba(0,0,0,0.25)'; for (let y = 0; y < 16; y += 3) c.fillRect(0, y, 64, 1); }); wood.wrapS = wood.wrapT = THREE.RepeatWrapping; wood.repeat.set(4, 2);
  mesh(hullGeo(L, B, 4.4), M(0xffffff, { map: wood }), 0, 0, 0, b);
  mesh(hullGeo(L * 1.002, B * 1.01, 0.35), P(stripeCol), 0, 1.4, 0, b); mesh(hullGeo(L * 1.003, B * 1.012, 0.5), P(0x1a1a1a), 0, 1.9, 0, b); mesh(hullGeo(L * 0.998, B * 1.005, 0.6), P(0x7a3a1a), 0, -2.0, 0, b);
  mesh(hullGeo(L * 0.96, B * 0.92, 0.12), M(0xffffff, { map: plankTex }), 0, 2.0, 0, b); // deck
  for (const s of [-1, 1]) { mesh(box(0.12, 0.9, L * 0.72), P(0x5a3a22), s * (B / 2 - 0.12), 2.5, -1.5, b); for (let i = 0; i < 16; i++) mesh(box(0.1, 0.9, 0.1), P(0x4a2a12), s * (B / 2 - 0.12), 2.5, -12 + i * 1.5, b); }
  // deckhouse aft, galley, hatches, wheel
  mesh(box(4, 1.8, 5), P(0xf0ece0), 0, 2.95, 7.5, b); mesh(box(4.3, 0.15, 5.3), P(0x5a3a22), 0, 3.9, 7.5, b); for (const s of [-1, 1]) for (let i = 0; i < 3; i++) mesh(box(0.02, 0.5, 0.6), P(0x2a3a4a, { shininess: 120 }), s * 2.01, 3.0, 6 + i * 1.4, b);
  mesh(box(2, 1.4, 2), P(0xf0ece0), 0, 2.75, -6, b); mesh(cyl(0.15, 0.15, 1.0, 8), P(0x222222), 0.5, 4.0, -6, b);
  for (const z of [-2, 2]) { mesh(box(2.4, 0.4, 2), P(0x6a4a2a), 0, 2.25, z, b); mesh(box(2.2, 0.05, 1.8), M(0x3a2a1a), 0, 2.46, z, b); }
  const wheel = new THREE.Group(); wheel.position.set(0, 3.0, 11.6); b.add(wheel); mesh(new THREE.TorusGeometry(0.55, 0.05, 6, 16), P(0x6a4a2a), 0, 0, 0, wheel); for (let i = 0; i < 8; i++) { const sp = mesh(box(0.05, 1.3, 0.05), P(0x6a4a2a), 0, 0, 0, wheel); sp.rotation.z = i * Math.PI / 8; } mesh(box(0.3, 1.0, 0.3), P(0x5a3a22), 0, -0.5, 0.1, wheel);
  // masts
  const fore = V(0, 2, -8), main = V(0, 2, 3);
  mesh(cyl(0.22, 0.3, 22, 8), P(0x6a4a2a), fore.x, fore.y + 11, fore.z, b); mesh(cyl(0.22, 0.3, 21, 8), P(0x6a4a2a), main.x, main.y + 10.5, main.z, b);
  const sails = [];
  for (const [y, w, h] of [[7.5, 10, 4.2], [12, 8.5, 3.8], [16, 7, 3.2], [19.4, 5.5, 2.4]]) { mesh(box(w + 1, 0.15, 0.15), P(0x5a3a22), fore.x, fore.y + y + h / 2, fore.z, b); sails.push(sail(b, w, h, fore.x, fore.y + y, fore.z - 0.3)); }
  mesh(box(0.15, 0.15, 9), P(0x5a3a22), main.x, main.y + 3.2, main.z + 4.5, b); mesh(box(0.15, 0.15, 7), P(0x5a3a22), main.x, main.y + 12.5, main.z + 3.5, b).rotation.x = -0.3;
  sails.push(sail(b, 8.5, 9, main.x, main.y + 7.6, main.z + 4.4, Math.PI / 2)); sails.push(sail(b, 5, 6, main.x, main.y + 16.5, main.z + 2.4, Math.PI / 2));
  const bs = mesh(cyl(0.15, 0.25, 11, 8), P(0x6a4a2a), 0, 3.4, -L / 2 - 4, b); bs.rotation.x = Math.PI / 2 - 0.2;
  const jib = new THREE.Shape(); jib.moveTo(0, 0); jib.lineTo(0, 13); jib.lineTo(-8, 0); jib.closePath(); const jg = mesh(new THREE.ShapeGeometry(jib), M(0xffffff, { map: sailTex, side: THREE.DoubleSide }), 0, 3.6, -L / 2 - 0.5, b); jg.rotation.y = Math.PI / 2; sails.push(jg);
  // rigging
  for (const m of [fore, main]) for (const s of [-1, 1]) for (const dz of [-1.2, 0, 1.2]) line(b, [V(s * (B / 2 - 0.1), 2.9, m.z + dz), V(s * 0.3, m.y + 18, m.z)]);
  line(b, [V(0, fore.y + 21, fore.z), V(0, 3.6, -L / 2 - 8.5)]); line(b, [V(0, main.y + 20, main.z), V(0, fore.y + 21, fore.z)]); line(b, [V(0, main.y + 20, main.z), V(0, 3, 14.5)]);
  // stern davits + lifeboat
  for (const s of [-1, 1]) { const d = mesh(box(0.12, 2.0, 0.12), P(0x3a3a3a), s * 1.4, 3.6, 14.2, b); d.rotation.x = 0.4; }
  const lifeboat = new THREE.Group(); lifeboat.position.set(0, 3.3, 15.6); b.add(lifeboat); mesh(hullGeo(5, 1.6, 0.8), P(0xf0ece0), 0, 0, 0, lifeboat).rotation.y = Math.PI / 2;
  for (const s of [-1, 1]) line(b, [V(s * 1.4, 4.5, 14.7), V(s * 1.4, 3.6, 15.6)]);
  // barrels on deck near the hatch (for the first scene) + lanterns
  const deckBarrels = []; for (let i = 0; i < 6; i++) deckBarrels.push(mesh(cyl(0.4, 0.4, 1.0, 10), P(0x7a5a32), -1.8 + (i % 3) * 0.9, 2.55, -3.8 + Math.floor(i / 3) * 0.9, b));
  const lamp = mesh(new THREE.SphereGeometry(0.18, 8, 6), new THREE.MeshBasicMaterial({ color: 0xffd890 }), 0, 4.4, 10.1, b);
  const nameT = canvasTex(256, 32, () => {}); const plate = mesh(new THREE.PlaneGeometry(4, 0.5), new THREE.MeshBasicMaterial({ map: nameT, transparent: true }), 0, 1.0, L / 2 - 0.4, b); plate.rotation.y = 0;
  return { g, b, sails, lifeboat, deckBarrels, wheel, nameT, plate, L };
}
const mc = makeBrig(0x5a3a22, 0xf0ece0), dg = makeBrig(0x3a2a1a, 0x2a6a4a);
function drawNames() { for (const [s, txt] of [[mc, 'MARY CELESTE'], [dg, 'DEI GRATIA']]) { const g = s.nameT.image.getContext('2d'); g.clearRect(0, 0, 256, 32); g.fillStyle = '#f0e0a0'; g.font = '22px PS2P'; g.textAlign = 'center'; g.fillText(txt, 128, 26); s.nameT.needsUpdate = true; } }
// ---------- the people (cast style) ----------
const crew = []; for (let i = 0; i < 7; i++) { const sl = makeSailor(mc.b, [0x2a3a5a, 0x3a3a3a, 0x5a3a2a, 0x3a4a3a][i % 4], 0x1a1a2a, false, i); crew.push(sl); }
const briggs = makeSailor(mc.b, 0x1a1a2a, 0x1a1a2a, true, 3);
function makeWoman(parent, dress, seed, kid = false) {
  const c = makeChar({ seed, skin: 0xe0b890, hipY: kid ? 0.5 : 0.82, legX: 0.1, legColor: 0xe0b890, shoe: 0x2a1a10, hand: 0xe0b890,
    torsoGeo: cyl(kid ? 0.18 : 0.24, kid ? 0.22 : 0.3, kid ? 0.4 : 0.6, 7), torsoTex: null, torsoColor: dress, torsoY: kid ? 0.2 : 0.3,
    skirt: cyl(kid ? 0.24 : 0.32, kid ? 0.36 : 0.52, kid ? 0.5 : 0.85, 8), sleeve: true, sleeveColor: dress, shoulderX: kid ? 0.22 : 0.29, shoulderY: kid ? 0.36 : 0.54, neckY: kid ? 0.4 : 0.6, headR: kid ? 0.24 : 0.27,
    build(head, torso, reg) { const hair = reg(M(kid ? 0x8a5a2a : 0x3a2414)); mesh(new THREE.SphereGeometry(kid ? 0.25 : 0.285, 8, 5, 0, Math.PI * 2, 0, Math.PI * 0.5), hair, 0, 0.03, -0.02, head); mesh(new THREE.SphereGeometry(kid ? 0.08 : 0.1, 6, 5), hair, 0, 0.05, -0.27, head);
      if (!kid) mesh(box(0.5, 0.06, 0.1), reg(M(0xf0ece0)), 0, 0.56, 0.2, torso); return {}; } }, parent);
  // engine skirts use the torso texture; tint them via the registered material
  return c;
}
const sarah = makeWoman(mc.b, 0x2a3a6a, 201), sophia = makeWoman(mc.b, 0xd86a8a, 202, true);
// boarding party from Dei Gratia + their boat
const dgBoat = new THREE.Group(); scene.add(dgBoat); mesh(hullGeo(5, 1.6, 0.8), P(0xe0d8c0), 0, 0.2, 0, dgBoat);
const boarders = []; for (let i = 0; i < 3; i++) { const sl = makeSailor(dgBoat, [0x3a4a3a, 0x2a3a5a, 0x5a3a2a][i], 0x1a1a2a, false, 20 + i); sl.root.position.set(i === 1 ? 0 : (i ? 0.4 : -0.4), 0.05, -1 + i * 1.0); sl.root.rotation.y = Math.PI; boarders.push(sl); }
// theory: the Mary Celeste's own lifeboat with all ten aboard, on a tow line
const tboat = new THREE.Group(); scene.add(tboat); mesh(hullGeo(5.6, 1.8, 0.8), P(0xf0ece0), 0, 0.2, 0, tboat);
const tpeople = []; for (let i = 0; i < 8; i++) { const sl = makeSailor(tboat, [0x2a3a5a, 0x3a3a3a, 0x5a3a2a, 0x3a4a3a][i % 4], 0x1a1a2a, i === 0, 40 + i); sl.root.position.set(i % 2 ? 0.42 : -0.42, 0.05, -2.0 + Math.floor(i / 2) * 1.15); tpeople.push(sl); }
const tsarah = makeWoman(tboat, 0x2a3a6a, 211), tsophia = makeWoman(tboat, 0xd86a8a, 212, true); tsarah.root.position.set(0, 0.05, 2.3); tsophia.root.position.set(0.3, 0.05, 2.1);
const towGeo = new THREE.BufferGeometry(); towGeo.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(3 * 24), 3)); const tow = new THREE.Line(towGeo, new THREE.LineBasicMaterial({ color: 0xd8c8a0 })); scene.add(tow);
function setTow(a, b2, sag, cut) { const p = towGeo.attributes.position.array; for (let i = 0; i < 24; i++) { const k = i / 23; const v = VL(a, b2, k); v.y -= Math.sin(k * Math.PI) * sag; if (cut && k > 0.5) v.copy(VL(b2, b2.clone().add(V(0, -1.5, 0)), (k - 0.5) * 2)); if (cut && k <= 0.5) { v.copy(VL(a, a.clone().add(V(0, -2, 1)), k * 2)); } p[i * 3] = v.x; p[i * 3 + 1] = v.y; p[i * 3 + 2] = v.z; } towGeo.attributes.position.needsUpdate = true; }
// ---------- NEW YORK harbour (x = 2600) ----------
const NYX = 2600; const ny = new THREE.Group(); ny.position.x = NYX; scene.add(ny);
{ const r = rng(12); for (let i = 0; i < 40; i++) { const x = -160 + i * 8 + r() * 4, h = 6 + r() * 18; mesh(box(6 + r() * 4, h, 8), P([0x6a5a4a, 0x7a6a58, 0x5a4a3a][i % 3]), x, h / 2, -120 - r() * 20, ny); for (let j = 0; j < 3; j++) mesh(new THREE.PlaneGeometry(0.8, 1.0), new THREE.MeshBasicMaterial({ color: r() > 0.4 ? 0xffd08a : 0x4a5060 }), x + (r() - 0.5) * 3, 2 + r() * (h - 3), -115.9 - r() * 0.1, ny); }
  for (const x of [-60, 20, 90]) { mesh(box(4, 26, 4), P(0x8a7a68), x, 13, -128, ny); mesh(new THREE.ConeGeometry(3, 10, 4), P(0x5a5048), x, 31, -128, ny).rotation.y = Math.PI / 4; }
  for (let i = 0; i < 6; i++) { mesh(box(6, 1.2, 30), M(0x6a4a2a, { map: plankTex }), -120 + i * 45, 0.6, -95, ny); for (let j = 0; j < 4; j++) mesh(cyl(0.3, 0.3, 4, 6), P(0x3a2a1a), -122 + i * 45, -1, -108 + j * 9, ny); }
  for (let i = 0; i < 3; i++) { const m = mesh(cyl(0.2, 0.25, 18, 6), P(0x4a3a2a), -100 + i * 40, 9, -88, ny); } }
// ---------- cabin with the logbook (x = 3000) ----------
const CBX = 3000; const cabin = new THREE.Group(); cabin.position.x = CBX; scene.add(cabin);
{ mesh(new THREE.PlaneGeometry(8, 8), M(0xffffff, { map: plankTex }), 0, 0, 0, cabin).rotation.x = -Math.PI / 2; for (const [x, z, ry] of [[0, -3, 0], [-3, 0, Math.PI / 2], [3, 0, -Math.PI / 2]]) { const w = mesh(new THREE.PlaneGeometry(8, 3), M(0x6a4a2a, { map: plankTex }), x, 1.5, z, cabin); w.rotation.y = ry; }
  mesh(new THREE.CircleGeometry(0.35, 12), P(0x8fb0c8, { shininess: 120 }), -1.2, 1.8, -2.98, cabin); mesh(new THREE.TorusGeometry(0.37, 0.05, 6, 14), P(0xc9a227), -1.2, 1.8, -2.97, cabin);
  mesh(box(2.4, 0.08, 1.4), P(0x5a3a22), 0, 0.85, -1.5, cabin); for (const [x, z] of [[-1.1, -2.1], [1.1, -2.1], [-1.1, -0.9], [1.1, -0.9]]) mesh(box(0.08, 0.85, 0.08), P(0x4a2a12), x, 0.42, z, cabin);
  const bookT = canvasTex(128, 64, (g) => { g.fillStyle = '#efe6c8'; g.fillRect(0, 0, 128, 64); g.fillStyle = '#8a6a44'; g.fillRect(63, 0, 2, 64); g.fillStyle = '#3a2a1a'; for (let y = 8; y < 60; y += 6) { g.fillRect(6, y, 50 - (y * 7) % 20, 1); if (y < 32) g.fillRect(70, y, 46 - (y * 5) % 18, 1); } });
  mesh(new THREE.PlaneGeometry(0.9, 0.45), M(0xffffff, { map: bookT }), 0.1, 0.9, -1.4, cabin).rotation.x = -Math.PI / 2;
  mesh(cyl(0.03, 0.03, 0.3, 6), P(0x222222), 0.7, 0.92, -1.3, cabin).rotation.z = 1.2; // pen
  mesh(cyl(0.12, 0.15, 0.35, 8), P(0xc9a227), -0.8, 1.06, -1.7, cabin); mesh(new THREE.SphereGeometry(0.09, 8, 6), new THREE.MeshBasicMaterial({ color: 0xffd890 }), -0.8, 1.12, -1.7, cabin);
  mesh(box(0.6, 0.06, 0.6), P(0x5a3a22), 0.2, 0.5, -0.3, cabin); mesh(box(0.6, 0.7, 0.06), P(0x5a3a22), 0.2, 0.85, 0.0, cabin);
  // the hold with barrels
  const hold = new THREE.Group(); hold.position.set(0, 0, 6); cabin.add(hold); mesh(new THREE.PlaneGeometry(10, 8), M(0x4a3a2a), 0, 0.01, 0, hold).rotation.x = -Math.PI / 2;
  for (let i = 0; i < 40; i++) { const x = -4 + (i % 8) * 1.05, z = -3 + Math.floor(i / 8) * 1.2; const empty = [3, 9, 12, 17, 22, 26, 29, 33, 38].includes(i); const br = mesh(cyl(0.45, 0.45, 1.1, 12), P(empty ? 0x9a6a3a : 0x7a5a32), x, 0.55, z, hold); br.userData.empty = empty; for (const y of [0.15, 0.95]) mesh(new THREE.TorusGeometry(0.46, 0.03, 4, 12), P(0x3a3a3a), x, y, z, hold).rotation.x = Math.PI / 2; } }
const cabinLamp = new THREE.PointLight(0xffc880, 0, 6, 1.4); scene.add(cabinLamp);
// ---------- positions on the Mary Celeste deck ----------
const CREWPOS = [[-2, -9, 0.3], [2.2, -5, -0.6], [-2.4, -1, 1.2], [2.5, 1.5, -1.0], [-1.0, 4.5, 0.2], [1.6, -11, 2.8], [-2.6, 9.5, 1.5]];
function stateAt(t) {
  const S = sceneAt(t);
  room.visible = S === 'home'; balcony.visible = kitchen.visible = hallway.visible = false; ny.visible = S === 'ny'; cabin.visible = S === 'log' || S === 'hold';
  const atSea = ['ny', 'deck', 'found', 'board', 'theory', 'fog'].includes(S); sea.visible = atSea; mc.g.visible = atSea && S !== 'fog'; dg.g.visible = S === 'found' || S === 'board';
  for (const c of [mom, son, samir]) c.root.visible = false; cane.visible = false;
  const people = S === 'ny' || S === 'deck'; crew.forEach(c => c.root.visible = people); briggs.root.visible = people; sarah.root.visible = people; sophia.root.visible = people;
  mc.lifeboat.visible = people; mc.deckBarrels.forEach(b => b.visible = people);
  dgBoat.visible = S === 'board' && t < NX(4).t1; boarders.forEach(b => b.root.visible = dgBoat.visible);
  tboat.visible = S === 'theory' || S === 'fog'; tow.visible = S === 'theory';
  dad.root.visible = S === 'home';
  // sea state + ships
  STORM = S === 'found' || S === 'board' ? 0.25 : S === 'fog' || S === 'theory' ? 0.12 : 0.06;
  const drift = S === 'found' || S === 'board' || S === 'theory';
  if (atSea) {
    const yaw = Math.PI + (drift ? Math.sin(t * 0.25) * 0.35 : 0); const mz = S === 'theory' ? (Math.min(t, T_SNAP) - T_THEORY) * 1.2 + Math.max(0, t - T_SNAP) * 3.0 : 0;
    floatPose(mc.g, 0, mz, yaw, t, 30, 7); mc.g.position.y -= 0.8;
    mc.sails.forEach((s, i) => { const torn = drift || S === 'fog'; s.scale.y = torn && i % 2 ? 0.45 : 1; s.position.x = torn ? Math.sin(t * 2 + i) * 0.1 : 0; });
    if (dg.g.visible) { const k = easeOut(seg(t, NX(3).t0 - 0.2, NX(4).t0)); floatPose(dg.g, -70 + 40 * k, -55 + 15 * k, Math.PI * 0.6, t, 30, 7); dg.g.position.y -= 0.8; }
    if (dgBoat.visible) { const k = seg(t, NX(4).t0 - 0.2, NX(4).t0 + 2.6); floatPose(dgBoat, -26 + 21 * k, -36 + 30 * k, Math.PI * 0.7, t, 5, 1.6); boarders.forEach((sl, i) => { const st = Math.sin(t * 4 + i); applyPose(sl, { ...POSE0, y: -0.38, lL: 1.45, lR: 1.45, aLx: 1.2 + st * 0.5, aRx: 1.2 + st * 0.5, eL: 0.6, eR: 0.6 }); setFace(sl, 'flat', 'flat', {}); }); }
    if (tboat.visible) { const stern = mc.b.localToWorld(V(0, 2.5, 15.5)); const mzS = (T_SNAP - T_THEORY) * 1.2; const bz = S === 'theory' ? Math.min(mz, mzS) - 15.5 - 9 : 0;
      floatPose(tboat, S === 'theory' ? Math.sin(t * 0.3) * 0.8 : 0, bz, 0, t, 5.6, 1.8);
      if (S === 'theory') setTow(stern, tboat.localToWorld(V(0, 0.6, -2.6)), 0.6, t > T_SNAP);
      tpeople.forEach((sl, i) => { applyPose(sl, { ...POSE0, y: -0.38, lL: 1.45, lR: 1.45, aLx: 0.7, eL: 1.2, aRx: 0.7, eR: 1.2, hx: 0.1 }); setFace(sl, t > T_SNAP ? 'wide' : 'flat', t > T_SNAP ? 'o' : 'flat', i === 0 ? { stache: true } : {}); });
      for (const w of [tsarah, tsophia]) { applyPose(w, { ...POSE0, y: -0.3, lL: 1.45, lR: 1.45, aLx: 0.8, eL: 1.3, aRx: 0.8, eR: 1.3 }); setFace(w, t > T_SNAP ? 'wide' : 'sad', 'flat', {}); } }
    if (S === 'ny' || S === 'deck') {
      CREWPOS.forEach(([x, z, ry], i) => { const c = crew[i]; c.root.position.set(x, 2.06, z); c.root.rotation.set(0, ry, 0); const p = { ...POSE0 }; if (i % 3 === 0) { p.aLx = 2.4 + Math.sin(t * 3 + i) * 0.3; p.aRx = 2.2; p.eL = 0.3; } else if (i % 3 === 1) { p.bend = 0.4; p.aLx = 1.2; p.aRx = 1.2; } applyPose(c, p); setFace(c, 'flat', 'smile', {}); });
      briggs.root.position.set(0.9, 2.06, 4.3); briggs.root.rotation.set(0, 1.4, 0); applyPose(briggs, { ...POSE0, aLx: 1.3, aRx: 1.3, eL: 0.5, eR: 0.5 }); setFace(briggs, 'flat', 'smile', { stache: true });
      sarah.root.position.set(1.6, 2.06, 3.6); sarah.root.rotation.set(0, 1.3, 0); applyPose(sarah, { ...POSE0, aRz: 0.5, aRx: 0.6, eR: 0.8 }); setFace(sarah, 'flat', 'smile', {});
      sophia.root.position.set(1.9, 2.06, 2.8); sophia.root.rotation.set(0, 1.5, 0); applyPose(sophia, { ...POSE0, aLz: 1.6 + Math.sin(t * 4) * 0.3 }); setFace(sophia, 'wide', 'smile', {});
      mc.wheel.rotation.z = Math.sin(t * 0.7) * 0.3; }
    updateWater(t, 0, mz - 10);
  }
  if (S === 'home') { dad.root.position.set(0.2, 0, -1.0); dad.root.rotation.set(0, -0.15, 0); applyPose(dad, talkPose({ ...POSE0, aRx: 1.3, aRz: 0.5, eR: 0.4, aLx: 0.6, eL: 1.4, hx: -0.05 }, t, 'dad', 0.3)); setFace(dad, 'side', talkMouth(t, 'dad') || 'flat', { stache: true }); }
  // hold: empty barrels glow faintly when the narrator mentions them
  if (S === 'hold') cabin.children.forEach(() => {});
  // fixed light per scene (nothing follows the camera)
  const L = { home: [0xfff0e0, 0x403020, 0.55, 0xffe6c8, 0.0], ny: [0xffc890, 0x403040, 0.8, 0xffa060, 0.9], deck: [0xcfe8ff, 0x305070, 0.85, 0xfff8e8, 1.15], found: [0xb8c4d0, 0x303a44, 0.85, 0xd8dde4, 0.6], board: [0xc8d2dc, 0x404a54, 1.05, 0xe0e4ea, 0.75], log: [0x8a7058, 0x201810, 0.5, 0xffc880, 0.0], hold: [0x7a6a58, 0x201810, 0.45, 0xffc880, 0.0], theory: [0x9aa8b8, 0x283038, 0.75, 0xc8d0d8, 0.45], fog: [0x8a96a4, 0x283038, 0.7, 0xb8c0c8, 0.3] }[S];
  hemi.color.setHex(L[0]); hemi.groundColor.setHex(L[1]); hemi.intensity = L[2]; sun.color.setHex(L[3]); sun.intensity = L[4];
  const ref = S === 'ny' ? V(NYX, 0, 0) : S === 'log' || S === 'hold' ? V(CBX, 0, 0) : V(OX, 0, 0); sun.position.copy(ref).add(V(-60, 80, 40)); sun.target.position.copy(ref);
  scene.background = new THREE.Color({ home: 0x101010, ny: 0xe89a68, deck: 0x8fc0e8, found: 0x9aa6b2, board: 0x9aa6b2, log: 0x000000, hold: 0x000000, theory: 0x7a8694, fog: 0x8a949e }[S]);
  scene.fog = S === 'home' || S === 'log' || S === 'hold' ? null : new THREE.Fog({ ny: 0xe0a078, deck: 0x9fc8ec, found: 0xa0aab4, board: 0xa0aab4, theory: 0x7a8694, fog: 0x8a949e }[S], S === 'fog' ? 6 : 60, S === 'fog' ? 60 : 600);
  waterMat.color.setHex(S === 'deck' ? 0x1f5a7a : 0x2a4a5e);
  cabinLamp.position.set(CBX - 0.8, 1.8, -1.2); cabinLamp.intensity = S === 'log' ? 2.2 : 0; if (S === 'hold') { cabinLamp.position.set(CBX, 3, 6); cabinLamp.intensity = 2.4; }
  ambient.intensity = S === 'home' ? 0.6 : 0; moon.intensity = S === 'home' ? 0.3 : 0; fill.intensity = 0; tvLight.intensity = 0; balcLight.intensity = 0; bathLight.intensity = 0; kitLight.intensity = 0; hallLight.intensity = 0; roomLight.position.set(0, 2.8, 1.0); roomLight.intensity = S === 'home' ? 1.4 : 0;
}
function shotAt(t) {
  const S = sceneAt(t); const m = mc.g.position;
  if (S === 'ny') { const k = easeInOut(seg(t, 0, NX(2).t0)); cam(V(m.x + 40 - 15 * k, 18 - 8 * k, m.z + 50 - 20 * k), m.clone().add(V(0, 6, -10)), 55); return; }
  if (S === 'deck') { const k = easeInOut(seg(t, NX(2).t0 - 0.2, NX(3).t0)); cam(mc.b.localToWorld(V(9.5 - 1.5 * k, 7.5 - 1 * k, 6 - 6 * k)), mc.b.localToWorld(V(0, 3.0, 4 - 6 * k)), 58); return; }
  if (S === 'found') { const d = dg.b.localToWorld(V(0, 6, -16)); cam(d, m.clone().add(V(0, 5, 0)), 50); return; }
  if (S === 'board') { if (t < NX(4).t0 + 2.6) { const b = dgBoat.position; cam(V(b.x + 8, 4.5, b.z + 7), b.clone().add(V(0, 1, -4)), 56); return; }
    const k = easeInOut(seg(t, NX(4).t0 + 2.6, NX(6).t0)); cam(mc.b.localToWorld(V(-2.7, 4.2, -12 + 22 * k)), mc.b.localToWorld(V(-0.8, 2.8, -6 + 22 * k)), 62); return; }
  if (S === 'log') { const k = easeInOut(seg(t, NX(6).t0 - 0.2, NX(7).t0)); cam(V(CBX + 0.6 - 0.4 * k, 1.9 - 0.4 * k, -0.2 - 0.5 * k), V(CBX + 0.05, 0.9, -1.4), 52); return; }
  if (S === 'hold') { const k = easeInOut(seg(t, NX(7).t0 - 0.2, T_THEORY)); cam(V(CBX - 3 + 3 * k, 2.6, 10.5), V(CBX, 0.6, 5.5), 60); return; }
  if (S === 'theory') { const b = tboat.position; const k = seg(t, T_THEORY, NX(8).t0); cam(V(b.x + 12 + 4 * k, 5.5 + 3 * k, b.z - 12 - 6 * k), VL(b, m, 0.4).add(V(0, 2, 0)), 58); return; }
  if (S === 'fog') { const b = tboat.position; const k = easeInOut(seg(t, NX(8).t0 - 0.2, T_HOME)); cam(V(b.x + 6 + 10 * k, 3 + 5 * k, b.z + 6 + 14 * k), b.clone().add(V(0, 0.8, 0)), 56); return; }
  faceCam(dad, 1.8 - 0.2 * seg(t, T_HOME, DUR), -0.2, 0.1, 56, 0.3);
}
const sprayPool = spritePool(puffTex, 20);
function particles(t) { const S = sceneAt(t), sp = []; if (S === 'found' || S === 'board') { for (let i = 0; i < 14; i++) { const k = (t * 0.6 + i / 14) % 1; sp.push({ pos: mc.g.position.clone().add(V(Math.sin(i * 2.1) * 4, 0.3 + k * 1.5, -14 + i * 2)), size: 0.8 + k * 1.6, op: 0.35 * (1 - k), color: 0xe8eef4 }); } }
  emit(sp, sprayPool); emit([], starPool); emit([], puffPool); emit([], trailPool); emit([], sweatPool); }
// ---------- overlays ----------
function drawTag(g, t) {
  const tags = [[NX(3).t0 - 0.2, 'المحيط الأطلسي • ديسمبر ١٨٧٢', 'ATLANTIC OCEAN, DEC 1872'], [NX(6).t0 - 0.2, 'دفتر المركب', 'THE LOGBOOK'], [T_THEORY, 'نظرية', 'THEORY']];
  for (const [a, ar, en] of tags) { if (!inT(t, a, a + 2.6)) continue; const al = Math.min(1, (t - a) / 0.4, (a + 2.6 - t) / 0.4); g.save(); g.globalAlpha = al; g.fillStyle = 'rgba(0,0,0,0.55)'; g.fillRect(0, 70, W, 70); arText(g, ar, W / 2, 70, 30, '#ffe8b0', 'center', 'ReemKufi'); pxText(g, en, W / 2, 114, 10, '#ddd', 'center', false); g.restore(); }
}
function drawTitle(g, t) { const e = NX(1).t1 + 0.2; if (t > e) return; const a = Math.min(1, t / 0.6, (e - t) / 0.5); g.save(); g.globalAlpha = a; g.fillStyle = 'rgba(0,0,0,0.55)'; g.fillRect(0, 90, W, 130); arText(g, 'المركب اللي لقوها فاضية', W / 2, 96, 36, '#fff', 'center', 'ReemKufi'); arText(g, 'قصة حقيقية • نيويورك ١٨٧٢', W / 2, 152, 24, '#ffd890', 'center'); g.restore(); }
function drawCTA(g, t) {
  if (t < DX(2).t0 || t >= DUR - 0.8) return; const k = easeBack(seg(t, DX(2).t0, DX(2).t0 + 0.3));
  g.save(); g.translate(W / 2, 140); g.scale(k, k); g.fillStyle = 'rgba(255,255,255,0.96)'; g.fillRect(-250, -54, 500, 108); g.fillStyle = '#d8231b'; g.fillRect(-250, 48, 500, 6);
  arText(g, 'إيه اللي حصل في رأيك؟ 👇', 0, -56, 32, '#111', 'center'); arText(g, 'اكتب نظريتك في الكومنتات', 0, -14, 30, '#d8231b', 'center'); g.restore();
}
const popLight = new THREE.PointLight(0xfff0d8, 0, 6, 1.2); scene.add(popLight);
window.renderFrame = function (t) {
  const pop = popAt(t); const ts = pop ? pop[0] : t;
  popLight.intensity = 0; stateAt(ts); shotAt(ts); particles(ts); if (pop) popIn(t, pop);
  renderer.render(scene, camera);
  ctx.clearRect(0, 0, W, H); ctx.drawImage(glCanvas, 0, 0);
  h.clearRect(0, 0, W, H);
  if (pop) { h.save(); h.fillStyle = 'rgba(10,10,30,0.85)'; h.fillRect(W / 2 - 90, 40, 180, 50); h.strokeStyle = '#ffe14a'; h.lineWidth = 2; h.strokeRect(W / 2 - 90, 40, 180, 50); h.fillStyle = '#ffe14a'; h.fillRect(W / 2 - 70, 52, 8, 26); h.fillRect(W / 2 - 56, 52, 8, 26); pxText(h, 'PAUSE', W / 2 + 16, 54, 16, '#ffe14a', 'center'); h.restore(); }
  if (sceneAt(t) === 'home' || pop) drawDialogueV(h, t); else drawSub(h, t);
  drawTitle(h, t); drawTag(h, t); drawCTA(h, t);
  ctx.drawImage(hud, 0, 0); vignette(ctx, sceneAt(t) === 'fog' ? 0.55 : 0.35);
  if (t > DUR - 0.8) { ctx.fillStyle = `rgba(0,0,0,${clamp((t - DUR + 0.8) / 0.8)})`; ctx.fillRect(0, 0, W, H); }
  return true;
};
window.frameData = () => out.toDataURL('image/png');
window.DUR = DUR;
document.fonts.load('10px PS2P').then(() => document.fonts.load('20px Lalezar', 'ع')).then(() => document.fonts.load('700 20px ReemKufi', 'ع')).then(() => { drawNames(); window.READY = true; });
