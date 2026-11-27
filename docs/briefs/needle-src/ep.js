// =====================================================================
// المسلة اللي تاهت في البحر — Cleopatra's Needle, 1877. Documentary style, Ibrahim hosts. vertical 9:16
// starts like the Ring Road video: title over an establishing shot, narrator straight away.
// narrator: L01 3000 yrs | L02 1877 cylinder + Olga | L03 storm | L04 six sailors | L05 rope cut | L06 found off Spain | L07 London | L08 dad | L09 dad CTA
// Lighting is FIXED per scene (hemisphere + directional), no camera-attached lights, so surfaces never flicker.
// =====================================================================
const NARR = LINES.filter(l => l.s === 'anno'), DL = LINES.filter(l => l.s === 'dad');
const NX = (i) => NARR[i - 1], DX = (i) => DL[i - 1];
// Ibrahim pops into a FROZEN frame twice: after the cylinder idea (NX 2) and after it is found (NX 6)
const POPS = [[DX(1).t0 - 0.55, DX(1).t1 + 0.45], [DX(2).t0 - 0.55, DX(2).t1 + 0.45]];
const popAt = (t) => POPS.find(([a, b]) => t >= a && t < b) || null;
const T_SEA = 0, T_HOME2 = DX(3).t0 - 0.3;
const sceneAt = (t) => t < NX(2).t0 - 0.2 ? 'egypt' : t < NX(3).t0 - 0.2 ? 'calm' : t < NX(6).t0 - 0.2 ? 'storm' : t < NX(7).t0 - 0.2 ? 'found' : t < T_HOME2 ? 'london' : 'home';
camera.far = 1500;
// ---------- our own fixed lights ----------
const hemi = new THREE.HemisphereLight(0xbfd8ff, 0x3a3020, 0); scene.add(hemi);
const sun = new THREE.DirectionalLight(0xffffff, 0); sun.position.set(-60, 80, 40); scene.add(sun); scene.add(sun.target);
// ---------- textures ----------
const glyphTex = canvasTex(64, 512, (g) => { g.fillStyle = '#c9a77a'; g.fillRect(0, 0, 64, 512); const r = rng(3); g.fillStyle = '#8a6a44';
  for (let y = 12; y < 500; y += 18) { const k = Math.floor(r() * 5); if (k === 0) { g.beginPath(); g.arc(32, y + 6, 6, 0, 7); g.fill(); } else if (k === 1) { g.fillRect(24, y, 16, 3); g.fillRect(30, y, 3, 14); } else if (k === 2) { g.beginPath(); g.moveTo(22, y + 12); g.lineTo(32, y); g.lineTo(42, y + 12); g.fill(); } else if (k === 3) { g.fillRect(22, y + 4, 20, 6); g.fillRect(36, y, 4, 4); } else { g.fillRect(28, y, 8, 14); g.fillRect(22, y + 10, 20, 3); } }
  g.fillStyle = 'rgba(0,0,0,0.12)'; for (let i = 0; i < 200; i++) g.fillRect(r() * 64, r() * 512, 2, 2); });
const ironTex = canvasTex(64, 64, (g) => { g.fillStyle = '#5a5e62'; g.fillRect(0, 0, 64, 64); g.fillStyle = '#4a4e52'; for (let x = 0; x < 64; x += 16) g.fillRect(x, 0, 2, 64); g.fillStyle = '#7a7268'; for (let x = 0; x < 64; x += 16) for (let y = 4; y < 64; y += 8) g.fillRect(x + 4, y, 2, 2); g.fillStyle = 'rgba(140,80,40,0.35)'; for (let i = 0; i < 30; i++) g.fillRect((i * 23) % 64, (i * 37) % 64, 5, 3); }); ironTex.wrapS = ironTex.wrapT = THREE.RepeatWrapping; ironTex.repeat.set(6, 2);
const plankTex = canvasTex(64, 16, (g) => { g.fillStyle = '#8a6a44'; g.fillRect(0, 0, 64, 16); g.fillStyle = '#6a4e30'; for (let y = 0; y < 16; y += 4) g.fillRect(0, y, 64, 1); }); plankTex.wrapS = plankTex.wrapT = THREE.RepeatWrapping;
// ---------- the obelisk ----------
function makeObelisk(parent) {
  const g = new THREE.Group(); parent.add(g); const stone = M(0xffffff, { map: glyphTex });
  const shaft = new THREE.CylinderGeometry(0.9, 1.25, 20, 4, 1); const s = mesh(shaft, stone, 0, 10, 0, g); s.rotation.y = Math.PI / 4;
  const cap = mesh(new THREE.ConeGeometry(0.9 * 1.0, 1.6, 4), P(0xd8b888), 0, 20.8, 0, g); cap.rotation.y = Math.PI / 4;
  return g;
}
// ---------- EGYPT: obelisk at a temple at sunset (x = 800) ----------
const EX = 800; const egypt = new THREE.Group(); egypt.position.x = EX; scene.add(egypt);
{ const sand = canvasTex(32, 32, (g) => { g.fillStyle = '#d8b878'; g.fillRect(0, 0, 32, 32); g.fillStyle = '#c8a868'; for (let i = 0; i < 40; i++) g.fillRect((i * 7) % 32, (i * 11) % 32, 2, 1); }); sand.wrapS = sand.wrapT = THREE.RepeatWrapping; sand.repeat.set(40, 40);
  mesh(new THREE.PlaneGeometry(400, 400), M(0xffffff, { map: sand }), 0, 0, 0, egypt).rotation.x = -Math.PI / 2;
  mesh(box(4, 1.2, 4), P(0xb89868), 0, 0.6, 0, egypt); makeObelisk(egypt).position.y = 1.2;
  for (const s of [-1, 1]) { const py = new THREE.Group(); py.position.set(s * 14, 0, -30); egypt.add(py); mesh(box(9, 16, 4), P(0xc8a878), 0, 8, 0, py); mesh(box(10, 1.2, 4.4), P(0xb89868), 0, 16.4, 0, py); } // temple pylons
  for (let i = 0; i < 6; i++) for (const s of [-1, 1]) mesh(cyl(0.9, 1.0, 9, 10), P(0xc8a878), s * 6, 4.5, -8 - i * 4, egypt);
  for (const x of [-120, -60, 80]) { const p = mesh(new THREE.ConeGeometry(30, 28, 4), P(0xd8b070), x, 14, -260, egypt); p.rotation.y = Math.PI / 4; }
}
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
// ---------- the Cleopatra cylinder ship ----------
function makeCylinder() {
  const g = new THREE.Group(); scene.add(g); const b = new THREE.Group(); g.add(b);
  const iron = M(0xffffff, { map: ironTex });
  const c = mesh(cyl(2.3, 2.3, 26, 20), iron, 0, 0.6, 0, b); c.rotation.x = Math.PI / 2;
  for (const s of [-1, 1]) { const e = mesh(new THREE.ConeGeometry(2.3, 3.4, 20), iron, 0, 0.6, s * 14.7, b); e.rotation.x = s * Math.PI / 2; }
  for (let i = 0; i < 9; i++) { const ring = mesh(new THREE.TorusGeometry(2.33, 0.07, 6, 24), P(0x3a3e42), 0, 0.6, -12 + i * 3, b); }
  mesh(box(0.3, 1.2, 24), P(0x3a3e42), 0, -1.8, 0, b); // keel
  // deck + cabin + mast + rudder
  mesh(box(3.2, 0.15, 10), M(0xffffff, { map: plankTex }), 0, 3.0, -1, b);
  for (const s of [-1, 1]) for (let i = 0; i < 9; i++) mesh(box(0.05, 0.6, 0.05), P(0x8a6a44), s * 1.55, 3.35, -5.5 + i * 1.1, b);
  for (const s of [-1, 1]) mesh(box(0.05, 0.05, 10), P(0x8a6a44), s * 1.55, 3.65, -1, b);
  mesh(box(2.2, 1.6, 3), P(0xe8e0d0), 0, 3.9, 1.5, b); mesh(box(2.4, 0.15, 3.2), P(0x6a4e30), 0, 4.78, 1.5, b);
  for (const s of [-1, 1]) mesh(box(0.02, 0.4, 0.6), P(0x2a3a4a, { shininess: 120 }), s * 1.11, 4.0, 1.5, b);
  mesh(cyl(0.12, 0.15, 9, 8), P(0x6a4e30), 0, 7.5, -3.5, b); mesh(box(4.0, 0.12, 0.12), P(0x6a4e30), 0, 10, -3.5, b);
  const flag = mesh(new THREE.PlaneGeometry(1.2, 0.7), M(0xd8231b, { side: THREE.DoubleSide }), 0.65, 11.6, -3.5, b);
  mesh(box(0.15, 3.0, 2.0), P(0x4a3a2a), 0, 0.6, 15.5, b); // rudder
  const lamp = mesh(new THREE.SphereGeometry(0.15, 8, 6), new THREE.MeshBasicMaterial({ color: 0xffd890 }), 0, 9.0, -3.5, b);
  return { g, b, flag, lamp };
}
// ---------- the steamship Olga (and a sister ship for the rescue) ----------
function hullGeo(L, B, H) {
  const sh = new THREE.Shape(); sh.moveTo(-B / 2, -L / 2); sh.lineTo(B / 2, -L / 2); sh.lineTo(B / 2, L * 0.25); sh.quadraticCurveTo(B / 2, L * 0.45, 0, L / 2); sh.quadraticCurveTo(-B / 2, L * 0.45, -B / 2, L * 0.25); sh.closePath();
  const geo = new THREE.ExtrudeGeometry(sh, { depth: H, bevelEnabled: false }); geo.rotateX(-Math.PI / 2); geo.translate(0, -H * 0.55, 0); return geo;
}
function makeSteamer(hullCol, bandCol) {
  const g = new THREE.Group(); scene.add(g); const b = new THREE.Group(); g.add(b);
  const L = 42, B = 7.5;
  mesh(hullGeo(L, B, 5), P(hullCol, { shininess: 50 }), 0, 0, 0, b);
  mesh(hullGeo(L * 0.995, B * 1.01, 0.5), P(0x9a2a1a), 0, -2.0, 0, b); // waterline paint
  const deck = mesh(hullGeo(L * 0.97, B * 0.95, 0.15), M(0xffffff, { map: plankTex }), 0, 2.3, 0, b);
  for (const s of [-1, 1]) for (let i = 0; i < 18; i++) mesh(cyl(0.18, 0.18, 0.05, 8), P(0xd8c890), s * (B / 2 + 0.01), 0.8, -16 + i * 1.8, b).rotation.z = Math.PI / 2; // portholes
  for (const s of [-1, 1]) mesh(box(0.06, 0.7, L * 0.7), P(0xe8e0d0), s * (B / 2 - 0.1), 2.9, -3, b); // bulwark rails
  // superstructure
  mesh(box(5, 2.2, 9), P(0xf0ece0), 0, 3.6, -2, b); mesh(box(5.4, 0.2, 9.4), P(0x6a4e30), 0, 4.8, -2, b);
  for (let i = 0; i < 6; i++) for (const s of [-1, 1]) mesh(box(0.02, 0.6, 0.7), P(0x2a3a4a, { shininess: 120 }), s * 2.51, 3.8, -5.5 + i * 1.4, b);
  mesh(box(3, 1.6, 3), P(0xf0ece0), 0, 5.7, -4.5, b); // bridge
  for (let i = 0; i < 4; i++) mesh(box(0.6, 0.5, 0.02), P(0x2a3a4a, { shininess: 120 }), -1.0 + i * 0.66, 5.9, -6.01, b);
  // funnel
  const fun = mesh(cyl(1.1, 1.2, 6, 14), P(0x1a1a1a), 0, 7.6, 1.2, b); mesh(cyl(1.13, 1.13, 1.0, 14), P(bandCol), 0, 8.6, 1.2, b);
  // masts, yards and rigging
  for (const [z, h] of [[-12, 16], [12, 14]]) { mesh(cyl(0.18, 0.25, h, 8), P(0x6a4e30), 0, 2.3 + h / 2, z, b); mesh(box(7, 0.15, 0.15), P(0x6a4e30), 0, 2.3 + h * 0.75, z, b); mesh(box(5, 0.12, 0.12), P(0x6a4e30), 0, 2.3 + h * 0.92, z, b);
    for (const s of [-1, 1]) { const pts = [V(s * 3.6, 2.4, z - 1.5), V(0, 2.3 + h * 0.95, z), V(s * 3.6, 2.4, z + 1.5)]; mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 8, 0.025, 3), M(0x222222), 0, 0, 0, b); } }
  mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([V(0, 15, -12), V(0, 12, 0), V(0, 13, 12)]), 10, 0.03, 3), M(0x222222), 0, 0, 0, b);
  const bow = mesh(cyl(0.12, 0.2, 8, 6), P(0x6a4e30), 0, 3.6, -L / 2 - 2.5, b); bow.rotation.x = Math.PI / 2 - 0.25; // bowsprit
  // lifeboats on davits
  const boats = []; for (const s of [-1, 1]) { const lb = new THREE.Group(); lb.position.set(s * 3.4, 4.2, 6); b.add(lb); mesh(box(1.4, 0.7, 5), P(0xf0ece0), 0, 0, 0, lb); mesh(box(1.2, 0.08, 4.6), P(0x8a6a44), 0, 0.33, 0, lb); boats.push(lb); for (const zz of [-2.2, 2.2]) mesh(cyl(0.06, 0.06, 2.2, 5), P(0x333333), s * 0.3, 0.9, zz, lb); }
  const lights = [mesh(new THREE.SphereGeometry(0.2, 8, 6), new THREE.MeshBasicMaterial({ color: 0xffe0a0 }), 0, 18, -12, b), mesh(new THREE.SphereGeometry(0.15, 8, 6), new THREE.MeshBasicMaterial({ color: 0x3df05a }), 3.8, 5, -4, b), mesh(new THREE.SphereGeometry(0.15, 8, 6), new THREE.MeshBasicMaterial({ color: 0xff3020 }), -3.8, 5, -4, b)];
  return { g, b, fun, boats, L };
}
const cyl1 = makeCylinder(); const olga = makeSteamer(0x1a1a1e, 0xd8a020); const rescuer = makeSteamer(0x2a3a2a, 0xd8231b);
// tow rope (updated each frame)
const ropeGeo = new THREE.BufferGeometry(); ropeGeo.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(3 * 24), 3)); const rope = new THREE.Line(ropeGeo, new THREE.LineBasicMaterial({ color: 0xd8c8a0 })); scene.add(rope);
function setRope(a, b2, sag) { const p = ropeGeo.attributes.position.array; for (let i = 0; i < 24; i++) { const k = i / 23; const v = VL(a, b2, k); v.y -= Math.sin(k * Math.PI) * sag; p[i * 3] = v.x; p[i * 3 + 1] = v.y; p[i * 3 + 2] = v.z; } ropeGeo.attributes.position.needsUpdate = true; }
// rowboat
const row = new THREE.Group(); scene.add(row); { mesh(hullGeo(5, 1.6, 0.8), P(0xf0ece0), 0, 0.2, 0, row); mesh(box(1.4, 0.06, 0.3), P(0x8a6a44), 0, 0.5, -0.8, row); mesh(box(1.4, 0.06, 0.3), P(0x8a6a44), 0, 0.5, 0.8, row); for (const s of [-1, 1]) for (const z of [-0.8, 0.8]) { const o = mesh(box(0.06, 0.06, 3.2), P(0xc8a878), s * 1.2, 0.55, z, row); o.rotation.y = s * 1.2; } }

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
const rowers = []; for (let i = 0; i < 6; i++) { const sl = makeSailor(row, [0x2a3a5a, 0x3a3a3a, 0x5a3a2a][i % 3], 0x1a1a2a, false, i); sl.root.position.set(i % 2 ? 0.38 : -0.38, 0.05, -1.6 + Math.floor(i / 2) * 1.4); sl.root.rotation.y = Math.PI; rowers.push(sl); }
const cylCrew = []; for (let i = 0; i < 2; i++) { const sl = makeSailor(cyl1.b, 0x3a3a3a, 0x1a1a2a, i === 0, i + 7); sl.root.position.set(i ? 0.6 : -0.5, 3.08, -4 + i * 1.2); sl.root.rotation.y = i ? 2.6 : 0.4; cylCrew.push(sl); }
const captain = makeSailor(olga.b, 0x1a1a2a, 0x1a1a2a, true, 2); captain.root.position.set(0.9, 2.45, 19.3);
const axe = new THREE.Group(); captain.arms[1].hand.add(axe); axe.position.set(0, 0, 0.05); mesh(box(0.04, 0.6, 0.04), P(0x6a4e30), 0, -0.2, 0, axe); mesh(box(0.06, 0.18, 0.22), P(0x9a9ea2, { shininess: 100 }), 0, -0.48, 0.08, axe);
const rescued = []; for (let i = 0; i < 5; i++) { const sl = makeSailor(olga.b, [0x3a3a3a, 0x2a3a5a][i % 2], 0x1a1a2a, i === 0, i + 3); sl.root.position.set(-2.4 + i * 1.0, 2.45, 15.8 - (i % 2) * 0.5); rescued.push(sl); }
// rain
const RN = 900; const rainGeo = new THREE.BufferGeometry(); rainGeo.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(RN * 6), 3)); const rain = new THREE.LineSegments(rainGeo, new THREE.LineBasicMaterial({ color: 0x9fb4d0, transparent: true, opacity: 0.45 })); scene.add(rain);
function updateRain(t, c) { const p = rainGeo.attributes.position.array; for (let i = 0; i < RN; i++) { const x = c.x + (hash(i) - 0.5) * 70, z = c.z + (hash(i + 900) - 0.5) * 70; const y = 40 - ((t * 30 + hash(i + 77) * 40) % 40); p[i * 6] = x; p[i * 6 + 1] = y; p[i * 6 + 2] = z; p[i * 6 + 3] = x + 0.6; p[i * 6 + 4] = y - 1.6; p[i * 6 + 5] = z; } rainGeo.attributes.position.needsUpdate = true; }
// distant Spanish coast cliffs
const coast = new THREE.Group(); scene.add(coast); for (let i = 0; i < 12; i++) mesh(box(30 + hash(i) * 30, 20 + hash(i + 5) * 30, 25), P(0x6a7a5a), OX - 200 + i * 40, 10, -220 - hash(i + 9) * 30, coast);
// ---------- LONDON: Thames embankment (x = 1700) ----------
const LX = 1700; const london = new THREE.Group(); london.position.x = LX; scene.add(london);
{ const pave = canvasTex(32, 32, (g) => { g.fillStyle = '#9a968c'; g.fillRect(0, 0, 32, 32); g.fillStyle = '#8a867c'; for (let y = 0; y < 32; y += 8) g.fillRect(0, y, 32, 1); for (let x = 0; x < 32; x += 8) g.fillRect(x, 0, 1, 32); }); pave.wrapS = pave.wrapT = THREE.RepeatWrapping; pave.repeat.set(30, 6);
  mesh(new THREE.PlaneGeometry(200, 40), M(0xffffff, { map: pave }), 0, 2, -20, london).rotation.x = -Math.PI / 2;
  mesh(box(200, 4, 1.5), P(0x8a8478), 0, 0, 0.5, london); // embankment wall
  for (let i = 0; i < 40; i++) mesh(box(0.3, 1.0, 0.3), P(0x5a5e62), -100 + i * 5, 2.5, 0.8, london);
  mesh(box(200, 0.12, 0.2), P(0x3a3e42), 0, 3.0, 0.8, london);
  const river = mesh(new THREE.PlaneGeometry(400, 300), new THREE.MeshPhongMaterial({ color: 0x3a5060, specular: 0x667788, shininess: 40 }), 0, -0.5, 150, london); river.rotation.x = -Math.PI / 2;
  // pedestal, obelisk, sphinxes
  mesh(box(5, 2.5, 5), P(0x6a6a6e), 0, 3.25, -5, london); mesh(box(5.6, 0.4, 5.6), P(0x5a5a5e), 0, 4.7, -5, london);
  const ob = makeObelisk(london); ob.position.set(0, 4.9, -5);
  for (const s of [-1, 1]) { const sp = new THREE.Group(); sp.position.set(s * 7, 2, -5); sp.rotation.y = s * -Math.PI / 2 + Math.PI / 2; london.add(sp); mesh(box(1.6, 1.0, 4), P(0x6a6a6e), 0, 0.5, 0, sp); mesh(box(1.4, 1.4, 3.2), P(0x3a3a30), 0, 1.6, 0.2, sp); mesh(box(1.2, 1.8, 1.0), P(0x3a3a30), 0, 2.4, 1.6, sp); mesh(box(1.5, 1.2, 0.6), P(0x3a3a30), 0, 3.0, 1.5, sp); }
  // lamp posts
  for (let i = 0; i < 10; i++) { const x = -45 + i * 10; mesh(cyl(0.12, 0.18, 4.5, 8), P(0x2a3a2a), x, 4.25, 1.2, london); mesh(new THREE.SphereGeometry(0.35, 8, 6), new THREE.MeshBasicMaterial({ color: 0xffe0a0 }), x, 6.6, 1.2, london); }
  // Parliament + Big Ben silhouette in the distance, bridge
  mesh(box(90, 18, 10), P(0x6a6458), -60, 11, -120, london); for (let i = 0; i < 16; i++) mesh(box(1.2, 6, 1.2), P(0x6a6458), -100 + i * 5.3, 22, -115, london);
  const tower = new THREE.Group(); tower.position.set(-8, 2, -110); london.add(tower); mesh(box(8, 60, 8), P(0x7a7060), 0, 30, 0, tower); mesh(box(9, 8, 9), P(0x8a8070), 0, 52, 0, tower);
  for (const [x, z, ry] of [[0, 4.6, 0], [4.6, 0, Math.PI / 2]]) { const f = mesh(new THREE.CircleGeometry(3, 20), M(0xf0ead8), x, 52, z, tower); f.rotation.y = ry; }
  mesh(new THREE.ConeGeometry(6, 16, 4), P(0x3a4a3a), 0, 64, 0, tower).rotation.y = Math.PI / 4;
  mesh(box(150, 2.5, 8), P(0x6a7a6a), 60, 7, 90, london); for (let i = 0; i < 6; i++) mesh(box(3, 8, 6), P(0x5a6a5a), 0 + i * 25, 3, 90, london);
}
// ---------- kinematics ----------
const Lx_after = () => NX(6).t0 - 0.2;
const T_STORM = NX(3).t0 - 0.2, T_BOAT = NX(4).t0, T_FLIP = NX(4).t0 + NX(4).vox.length && NX(4).vox.length > 1 ? NX(4).vox[NX(4).vox.length - 1][0] : NX(4).t1 - 1.5, T_CUT = NX(5).t0 + 2.5;
function stateAt(t) {
  const S = sceneAt(t); WT = t;
  room.visible = S === 'home'; balcony.visible = kitchen.visible = hallway.visible = false; egypt.visible = S === 'egypt'; london.visible = S === 'london';
  const atSea = S === 'calm' || S === 'storm' || S === 'found'; sea.visible = atSea; cyl1.g.visible = atSea; olga.g.visible = S === 'calm' || (S === 'storm' && t < T_CUT + 6); rescuer.g.visible = S === 'found'; rope.visible = (S === 'calm' || S === 'storm') && t < T_CUT; row.visible = S === 'storm' && t >= T_BOAT && t < NX(5).t0; rain.visible = S === 'storm'; coast.visible = S === 'found';
  for (const c of [mom, son, samir]) c.root.visible = false; cane.visible = false;
  // Ibrahim at home
  dad.root.visible = S === 'home';
  if (S === 'home') { dad.root.position.set(0.2, 0, -1.0); dad.root.rotation.set(0, -0.15, 0); const p = { ...POSE0 }; if (t < T_SEA) { p.bend = 0.18; p.hx = 0.1; p.aRx = 1.1; p.eR = 0.6; p.aRz = 0.3; } else if (t < DX(4).t0) { p.aLx = 1.0; p.aLz = 0.5; p.eL = 0.4; } else { p.aRx = 1.3; p.aRz = 0.5; p.eR = 0.4; }
    applyPose(dad, talkPose(p, t, 'dad', 0.3)); setFace(dad, t < T_SEA ? 'side' : 'smug', talkMouth(t, 'dad', 'grin') || 'smile', { stache: true }); }
  // sea state
  STORM = S === 'storm' ? Math.min(1, (t - T_STORM) / 2.0) * (t > NX(5).t1 ? Math.max(0.35, 1 - (t - NX(5).t1) / 2) : 1) : 0;
  // course: heading +z (towards camera side is -z?) ships sail along -z, cylinder behind on the rope
  const sp = S === 'calm' ? 4 : 2; const oz = -t * sp; const cz = oz + 60;
  if (atSea) {
    let cyx = 0, cyz = cz, cyYaw = Math.PI, cyRoll = 0;
    if (S === 'storm') { cyRoll = Math.sin(t * 1.3) * 0.5 * STORM + Math.sin(t * 2.7) * 0.2 * STORM; cyx = Math.sin(t * 0.4) * 4 * STORM; cyYaw = Math.PI + Math.sin(t * 0.6) * 0.5 * STORM; if (t > T_CUT) { cyz = cz + (t - T_CUT) * 3; cyx += (t - T_CUT) * 1.5; } }
    if (S === 'found') { cyx = 0; cyz = 0; cyYaw = Math.PI + 0.4; }
    floatPose(cyl1.g, cyx, cyz, cyYaw, t, 26, 4.6, cyRoll); cyl1.g.position.y -= 0.9; cyl1.flag.rotation.y = Math.sin(t * 6) * 0.3 * (0.4 + STORM);
    if (olga.g.visible) { let ox = 0, ozz = oz, oyaw = Math.PI; if (S === 'storm' && t > T_CUT) { ozz = oz - (t - T_CUT) * 4; ox = -(t - T_CUT) * 1.0; } floatPose(olga.g, ox, ozz, oyaw, t, 42, 7.5, S === 'storm' ? Math.sin(t * 1.1) * 0.12 * STORM : 0); olga.g.position.y -= 0.6; }
    if (rescuer.g.visible) { const k = easeOut(seg(t, NX(6).t0 - 0.2, NX(6).t1)); floatPose(rescuer.g, -60 + 40 * k, -30 + 10 * k, Math.PI / 2 + 0.3, t, 42, 7.5, 0); rescuer.g.position.y -= 0.6; }
    if (rope.visible) { const a = olga.b.localToWorld(V(0, 2.5, 21)); const b2 = cyl1.b.localToWorld(V(0, 1.5, -16)); setRope(a, b2, S === 'storm' ? 0.5 + Math.sin(t * 3) * 0.4 : 1.2); }
    if (row.visible) { const k = seg(t, T_BOAT, T_FLIP); const ox = VL(V(-9, 0, oz + 26), V(-8.5, 0, cz - 4), k); const flip = easeIn(seg(t, T_FLIP, T_FLIP + 1.0)); floatPose(row, ox.x, ox.z, Math.PI * 0.8, t, 5, 1.6, flip * Math.PI * 0.95); row.position.y -= flip * 0.8; }

    { const flip = seg(t, T_FLIP, T_FLIP + 1.0); rowers.forEach((sl, i) => { sl.root.visible = row.visible && flip < 0.35; const st = Math.sin(t * 4 + (i % 2) * 0.3);
        applyPose(sl, { ...POSE0, y: -0.38, lL: 1.45, lR: 1.45, aLx: 1.2 + st * 0.5, aRx: 1.2 + st * 0.5, eL: 0.6, eR: 0.6, bend: st * 0.15 }); setFace(sl, 'wide', t > T_FLIP - 0.8 ? 'scream' : 'clench', {}); }); }
    cylCrew.forEach((sl, i) => { sl.root.visible = (S === 'calm' || S === 'storm') && t < NX(5).t0; applyPose(sl, { ...POSE0, aLz: S === 'storm' ? 1.2 + Math.sin(t * 3 + i) * 0.3 : 0.2, aRx: S === 'storm' ? 1.4 : 0.2, eR: 0.4 }); setFace(sl, S === 'storm' ? 'wide' : 'flat', S === 'storm' ? 'o' : 'flat', {}); });
    { const on = S === 'storm' && t >= NX(5).t0 - 0.2 && t < Lx_after(); captain.root.visible = on; rescued.forEach(r => r.root.visible = on);
      const sw = seg(t, T_CUT - 0.6, T_CUT); axe.visible = t >= T_CUT - 1.6;
      applyPose(captain, { ...POSE0, aRx: t < T_CUT - 1.6 ? 0.3 : t < T_CUT - 0.6 ? 2.6 : 2.6 - 2.2 * easeIn(sw), eR: 0.3, aLx: 0.6, eL: 0.8 }); setFace(captain, 'angry', 'clench', { stache: true });
      rescued.forEach((r, i) => { applyPose(r, { ...POSE0, aLx: 0.9, aRx: 0.9, eL: 1.6, eR: 1.6, bend: 0.2, hx: 0.25 }); setFace(r, 'tired', 'frown', {}); }); }

    if (row.visible) { const k = seg(t, T_BOAT, T_FLIP); const ox = VL(V(-9, 0, oz + 26), V(-8.5, 0, cz - 4), k); const flip = easeIn(seg(t, T_FLIP, T_FLIP + 1.0)); floatPose(row, ox.x, ox.z, Math.PI * 0.8, t, 5, 1.6, flip * Math.PI * 0.95); row.position.y -= flip * 0.8; }

    updateWater(t, S === 'found' ? 0 : 0, S === 'found' ? 0 : cz - 20);
    if (S === 'storm') updateRain(t, cyl1.g.position);
  }
  // fixed lighting per scene
  const L = { home: [0xfff0e0, 0x403020, 0.55, 0xffe6c8, 0.0], egypt: [0xffd8a0, 0x806040, 0.7, 0xffb060, 1.2], calm: [0xbfe0ff, 0x204060, 0.8, 0xfff4e0, 1.1], storm: [0x6a7ca0, 0x18222c, 0.8, 0xb0c4e0, 0.7], found: [0xcfe8ff, 0x305070, 0.85, 0xfff8e8, 1.15], london: [0xffd8b0, 0x404850, 0.75, 0xffc890, 0.9] }[S];
  hemi.color.setHex(L[0]); hemi.groundColor.setHex(L[1]); hemi.intensity = L[2]; sun.color.setHex(L[3]); sun.intensity = L[4];
  const ref = S === 'egypt' ? V(EX, 0, 0) : S === 'london' ? V(LX, 0, 0) : V(OX, 0, 0); sun.position.copy(ref).add(V(-60, 80, 40)); sun.target.position.copy(ref);
  scene.background = new THREE.Color({ home: 0x101010, egypt: 0xf0a860, calm: 0x8fc0e8, storm: 0x1a2230, found: 0xa8d0f0, london: 0xe8a878 }[S]);
  scene.fog = S === 'home' ? null : new THREE.Fog({ egypt: 0xf0b070, calm: 0x9fc8ec, storm: 0x1a2230, found: 0xb0d4f0, london: 0xd8a888 }[S] || 0x000000, S === 'storm' ? 30 : 80, S === 'storm' ? 220 : 700);
  waterMat.color.setHex(S === 'storm' ? 0x1e3a50 : 0x1f5a7a);
  // engine lights: only the room uses them; nothing follows the camera
  ambient.intensity = S === 'home' ? 0.6 : 0; moon.intensity = S === 'home' ? 0.3 : 0; fill.intensity = 0; tvLight.intensity = 0; balcLight.intensity = 0; bathLight.intensity = 0; kitLight.intensity = 0; hallLight.intensity = 0; roomLight.position.set(0, 2.8, 1.0); roomLight.intensity = S === 'home' ? 1.4 : 0;
  // lightning: two soft, short flashes in the storm only
  for (const tl of [T_STORM + 1.2, T_STORM + 4.6]) if (S === 'storm' && inT(t, tl, tl + 0.18)) { hemi.intensity = 1.6; scene.background = new THREE.Color(0x6a7a9a); }
}
function shotAt(t) {
  const S = sceneAt(t);
  if (S === 'home') { if (t < T_SEA) faceCam(dad, 1.4 - 0.25 * easeOut(seg(t, 0, T_SEA)), 0.25, 0.05, 54, 0.3); else faceCam(dad, 1.8 - 0.2 * seg(t, T_HOME2, DUR), -0.2, 0.1, 56, 0.3); return; }
  if (S === 'egypt') { const k = easeInOut(seg(t, 0, NX(2).t0)); cam(V(EX + 40 - 34 * k, 34 - 30 * k, 60 - 44 * k), V(EX, 8 + 4 * k, 0), 58); return; }
  const c = cyl1.g.position, o = olga.g.position;
  if (S === 'calm') { const k = easeInOut(seg(t, NX(2).t0, NX(3).t0)); cam(V(c.x + 30 - 10 * k, 12 + 4 * k, c.z + 30 - 50 * k), VL(c, o, 0.45).add(V(0, 2, 0)), 55); return; }
  if (S === 'storm') {
    if (t < T_BOAT - 0.2) { cam(V(c.x + 15, 5.5 + Math.sin(t) * 0.6, c.z + 12), c.clone().add(V(0, 1.5, -3)), 58); return; }
    if (t < NX(5).t0 - 0.2) { const r = row.position; const hi = seg(t, T_FLIP - 0.5, T_FLIP + 0.5); cam(V(r.x - 9 - 2 * hi, 4 + 4 * hi, r.z + 7 + 2 * hi), r.clone().add(V(1.5, 0.6, 0)), 56); return; }
    if (t < T_CUT - 0.8) { const a = olga.b.localToWorld(V(0, 3.4, 17)); cam(olga.b.localToWorld(V(7, 5.2, 24)), a, 56); return; }
    if (t < T_CUT + 0.5) { const a = olga.b.localToWorld(V(0, 3, 21)); const m = VL(a, cyl1.g.position, 0.5); cam(m.clone().add(V(26, 9, 4)), m.clone().add(V(0, 1, 0)), 58); return; }
    const k = easeInOut(seg(t, T_CUT, NX(6).t0)); cam(V(c.x + 20 + 15 * k, 10 + 12 * k, c.z + 25 + 20 * k), c.clone().add(V(0, 1, 0)), 55); return;
  }
  if (S === 'found') { const k = easeInOut(seg(t, NX(6).t0, NX(7).t0)); cam(V(c.x + 28 - 6 * k, 8 + 2 * k, c.z + 30 - 6 * k), VL(c, rescuer.g.position, 0.3 * k).add(V(0, 2, 0)), 55); return; }
  const k = easeInOut(seg(t, NX(7).t0 - 0.2, T_HOME2)); cam(V(LX + 14 - 4 * k, 4 + 2 * k, 30 - 12 * k), V(LX, 12 - 2 * k, -5), 58);
}
const sprayPool = spritePool(puffTex, 30), smokePool = spritePool(puffTex, 24);
function particles(t) {
  const S = sceneAt(t), spray = [], smoke = [];
  if (olga.g.visible) { const f = olga.b.localToWorld(V(0, 10.8, 1.2)); for (let i = 0; i < 18; i++) { const k = (t * 0.35 + i / 18) % 1; smoke.push({ pos: f.clone().add(V(Math.sin(i) * 0.3 + k * 2, k * 10, k * 10)), size: 1.4 + k * 4, op: 0.55 * (1 - k), color: 0x2a2a2a }); } }
  if (rescuer.g.visible) { const f = rescuer.b.localToWorld(V(0, 10.8, 1.2)); for (let i = 0; i < 12; i++) { const k = (t * 0.35 + i / 12) % 1; smoke.push({ pos: f.clone().add(V(k * 2, k * 9, k * 4)), size: 1.2 + k * 3, op: 0.5 * (1 - k), color: 0x3a3a3a }); } }
  if (S === 'storm') { const c = cyl1.g.position; for (let i = 0; i < 30; i++) { const k = (t * 0.8 + i / 30) % 1; spray.push({ pos: c.clone().add(V(Math.sin(i * 2.3) * 4, 0.5 + k * 4, Math.cos(i * 1.7) * 13)), size: 1 + k * 2.5, op: 0.5 * (1 - k) * STORM, color: 0xdfe8f0 }); } }
  emit(spray, sprayPool); emit(smoke, smokePool); emit([], starPool); emit([], puffPool); emit([], trailPool); emit([], sweatPool);
}
// ---------- overlays ----------
function wrapAr(g, s, size, maxW) { g.font = `${size}px Lalezar`; const w = s.split(' '); const out = []; let cur = ''; for (const x of w) { const c = cur ? cur + ' ' + x : x; if (g.measureText(c).width > maxW && cur) { out.push(cur); cur = x; } else cur = c; } if (cur) out.push(cur); return out; }
function drawSub(g, t) {
  const l = LINES.find(l => l.s === 'anno' && t >= l.t0 - 0.05 && t < l.t1 + 0.3); if (!l || !l.ar) return;
  const a = Math.min(1, (t - l.t0 + 0.05) / 0.25, (l.t1 + 0.3 - t) / 0.25); g.save(); g.globalAlpha = a; const lines = wrapAr(g, l.ar, 26, W - 70); const hh = 20 + lines.length * 38;
  g.fillStyle = 'rgba(0,0,0,0.6)'; g.fillRect(20, H - 70 - hh, W - 40, hh); lines.forEach((s, i) => arText(g, s, W / 2, H - 70 - hh + 6 + i * 38, 26, '#fff', 'center')); g.restore();
}
function drawTag(g, t) {
  const tags = [[NX(2).t0 - 0.2, 'الإسكندرية ١٨٧٧', 'ALEXANDRIA 1877'], [T_STORM, 'خليج بسكاي', 'BAY OF BISCAY'], [NX(6).t0 - 0.2, 'قدام سواحل إسبانيا', 'OFF THE SPANISH COAST'], [NX(7).t0 - 0.2, 'لندن ١٨٧٨', 'LONDON 1878']];
  for (const [a, ar, en] of tags) { if (!inT(t, a, a + 2.6)) continue; const al = Math.min(1, (t - a) / 0.4, (a + 2.6 - t) / 0.4); g.save(); g.globalAlpha = al; g.fillStyle = 'rgba(0,0,0,0.55)'; g.fillRect(0, 70, W, 70); arText(g, ar, W / 2, 70, 30, '#ffe8b0', 'center', 'ReemKufi'); pxText(g, en, W / 2, 114, 10, '#ddd', 'center', false); g.restore(); }
}
function drawTitle(g, t) { const e = NX(1).t1 + 0.2; if (t > e) return; const a = Math.min(1, t / 0.6, (e - t) / 0.5); g.save(); g.globalAlpha = a; g.fillStyle = 'rgba(0,0,0,0.55)'; g.fillRect(0, 90, W, 130); arText(g, 'المسلة اللي تاهت في البحر', W / 2, 96, 36, '#fff', 'center', 'ReemKufi'); arText(g, 'قصة حقيقية • ١٨٧٧', W / 2, 152, 24, '#ffd890', 'center'); g.restore(); }
function drawCTA(g, t) {
  if (t < DX(4).t0 || t >= DUR - 0.8) return; const k = easeBack(seg(t, DX(4).t0, DX(4).t0 + 0.3));
  g.save(); g.translate(W / 2, 140); g.scale(k, k); g.fillStyle = 'rgba(255,255,255,0.96)'; g.fillRect(-250, -54, 500, 108); g.fillStyle = '#d8231b'; g.fillRect(-250, 48, 500, 6);
  arText(g, 'نحكي إيه المرة الجاية؟ 👇', 0, -56, 32, '#111', 'center'); arText(g, 'اكتبوا حدث محدش يعرفه!', 0, -14, 30, '#d8231b', 'center'); g.restore();
}
const popLight = new THREE.PointLight(0xfff0d8, 0, 6, 1.2); scene.add(popLight);
const overlay = new THREE.Scene(); overlay.add(new THREE.HemisphereLight(0xfff4e8, 0x504030, 1.0)); { const d = new THREE.DirectionalLight(0xffffff, 0.8); d.position.set(2, 4, 3); overlay.add(d); overlay.add(d.target); }
function renderOverlay(c) { const parent = c.root.parent; overlay.add(c.root); c.root.visible = true; renderer.autoClear = false; renderer.clearDepth(); renderer.render(overlay, camera); renderer.autoClear = true; parent.add(c.root); }
// pop 1: Ibrahim INSIDE the action, standing on the cylinder's deck while it is towed (no freeze)
function onDeck(t, pop) {
  cylCrew.forEach(c => c.root.visible = false); // keep the frame clear for Ibrahim
  const [a, b] = pop; const k = easeBack(seg(t, a, a + 0.5));
  const base = cyl1.b.localToWorld(V(0.3, 3.08, -1.5 + (1 - k) * 0)); dad.root.visible = true; dad.root.position.copy(base); dad.root.position.y += (1 - k) * 3;
  const q = new THREE.Quaternion(); cyl1.b.getWorldQuaternion(q); dad.root.quaternion.copy(q); dad.root.rotateY(Math.PI * 0.85);
  const p = { ...POSE0, aRx: 1.3, aRz: 0.6, eR: 0.3, aLz: 2.2 + Math.sin(t * 7) * 0.3, eL: 0.3, lL: 0, lR: 0 };
  applyPose(dad, talkPose(p, t, 'dad', 0.35)); setFace(dad, 'sparkle', talkMouth(t, 'dad', 'grin') || 'grin', { stache: true });
  const hd = headOf(dad); const f = dad.head.getWorldDirection(V(0, 0, 0)); f.y = 0; f.normalize();
  cam(hd.clone().add(f.multiplyScalar(3.2)).add(V(0.8, 0.6, 0)), hd.clone().add(V(0, -0.5, 0)), 56);
  popLight.position.copy(hd).add(V(1.5, 1.5, 2)); popLight.intensity = 1.5;
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
window.renderFrame = function (t) {
  const pop = popAt(t); const freeze = pop && pop === POPS[1]; const ts = freeze ? pop[0] : t;
  popLight.intensity = 0; stateAt(ts); shotAt(ts); particles(ts);
  if (freeze) { dad.root.visible = false; renderer.render(scene, camera); popIn(t, pop); renderOverlay(dad); }
  else { if (pop) onDeck(t, pop); renderer.render(scene, camera); }
  ctx.clearRect(0, 0, W, H); ctx.drawImage(glCanvas, 0, 0);
  h.clearRect(0, 0, W, H);
  if (freeze) { h.save(); h.fillStyle = 'rgba(10,10,30,0.85)'; h.fillRect(W / 2 - 90, 40, 180, 50); h.strokeStyle = '#ffe14a'; h.lineWidth = 2; h.strokeRect(W / 2 - 90, 40, 180, 50); h.fillStyle = '#ffe14a'; h.fillRect(W / 2 - 70, 52, 8, 26); h.fillRect(W / 2 - 56, 52, 8, 26); pxText(h, 'PAUSE', W / 2 + 16, 54, 16, '#ffe14a', 'center'); h.restore(); }
  if (sceneAt(t) === 'home' || popAt(t)) drawDialogueV(h, t); else drawSub(h, t);
  drawTitle(h, t); drawTag(h, t); drawCTA(h, t);
  ctx.drawImage(hud, 0, 0); vignette(ctx, 0.35);
  if (t > DUR - 0.8) { ctx.fillStyle = `rgba(0,0,0,${clamp((t - DUR + 0.8) / 0.8)})`; ctx.fillRect(0, 0, W, H); }
  return true;
};
window.frameData = () => out.toDataURL('image/png');
window.DUR = DUR;
document.fonts.load('10px PS2P').then(() => document.fonts.load('20px Lalezar', 'ع')).then(() => document.fonts.load('700 20px ReemKufi', 'ع')).then(() => { window.READY = true; });
