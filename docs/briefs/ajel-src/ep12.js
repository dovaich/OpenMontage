// =====================================================================
// عاجل! — the local news bulletin recaps the series' disasters
// =====================================================================
room.visible = true; hallway.visible = false; balcony.visible = false;
son.root.visible = false; samir.root.visible = false;
scene.fog = null;
const inT = (t, a, b) => t >= a && t < b;
const sun = new THREE.DirectionalLight(0xfff2dc, 0); sun.position.set(3, 8, 6); scene.add(sun);
const T_EXPLODE = 19.0, T_OUT = 34.25, T_CRASH = 41.4, T_POP = 107.45, T_PLUG = 113.0, T_HOME = 116.5;
function txtTex(w, h, bg, fn) { const t = canvasTex(w, h, (g) => { if (bg) { g.fillStyle = bg; g.fillRect(0, 0, w, h); } if (fn) fn(g, w, h); }); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; }
function arC(g, s, x, y, size, col, font = 'Lalezar') { g.font = `${size}px ${font}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.direction = 'rtl'; g.fillStyle = col; g.fillText(s, x, y); }
const lateDraw = []; // textures that need the Arabic font, drawn once fonts are ready

// ---------- the microphone (a reporter's arm comes in from frame left) ----------
function makeMic() {
  const g = new THREE.Group(); scene.add(g);
  mesh(cyl(0.02, 0.017, 0.22, 6), P(0x111111), 0, 0.11, 0, g);
  mesh(new THREE.IcosahedronGeometry(0.05, 0), P(0x9a9aa2, { shininess: 90 }), 0, 0.25, 0, g);
  const flagT = txtTex(32, 32, '#d8231b'); lateDraw.push(() => { const c = flagT.userData.g; c.fillStyle = '#d8231b'; c.fillRect(0, 0, 32, 32); arC(c, 'عاجل', 16, 17, 13, '#fff'); flagT.needsUpdate = true; });
  mesh(box(0.08, 0.07, 0.08), M(0xffffff, { map: flagT }), 0, 0.17, 0, g);
  mesh(new THREE.IcosahedronGeometry(0.055, 0), M(0xc8946a), 0, 0.03, 0, g); // reporter's hand
  g.visible = false; return g;
}
const mic = makeMic();
const micArm = mesh(box(0.09, 0.09, 1), M(0x1f2f5a), 0, 0, 0, scene); micArm.visible = false;
// mic held 0.5 m in front of the mouth; the reporter's arm runs out to the camera's left edge, never through anyone
function placeMic(c, side = 1) {
  const h = headOf(c); const f = c.head.getWorldDirection(V(0, 0, 0)); f.y = 0; f.normalize(); const r = V(f.z, 0, -f.x);
  const top = h.clone().add(f.clone().multiplyScalar(0.52)).add(r.clone().multiplyScalar(side * 0.12)).add(V(0, -0.14, 0));
  const grip = top.clone().add(f.clone().multiplyScalar(0.12)).add(V(0, -0.2, 0));
  mic.visible = true; mic.position.copy(grip); mic.quaternion.setFromUnitVectors(V(0, 1, 0), top.clone().sub(grip).normalize());
  const left = V(-1, 0, 0).applyQuaternion(camera.quaternion); left.y = 0; left.normalize();
  const end = grip.clone().add(left.multiplyScalar(1.6)).add(V(0, -0.6, 0)).add(camera.position.clone().sub(grip).normalize().multiplyScalar(0.4));
  micArm.visible = true; micArm.position.copy(grip.clone().add(end).multiplyScalar(0.5)); micArm.scale.set(1, 1, grip.distanceTo(end)); micArm.lookAt(end);
}

// =====================================================================
// STUDIO (x = 50)
// =====================================================================
const S = 50;
const studio = new THREE.Group(); scene.add(studio);
{
  const gridT = txtTex(32, 32, '#121a34', (g) => { g.fillStyle = '#1c2850'; g.fillRect(0, 0, 32, 1); g.fillRect(0, 0, 1, 32); }); gridT.repeat.set(10, 8);
  mesh(new THREE.PlaneGeometry(16, 12), M(0xffffff, { map: gridT }), S, 0, 0, studio).rotation.x = -Math.PI / 2;
  mesh(new THREE.PlaneGeometry(16, 7), M(0x0d1430), S, 3.5, -2.8, studio);
  for (const sx of [-1, 1]) {
    mesh(box(0.5, 6, 0.5), M(0x18224a), S + sx * 3.6, 3, -2.4, studio);
    mesh(box(0.08, 5.4, 0.52), new THREE.MeshBasicMaterial({ color: 0x3aa0ff }), S + sx * 3.6, 3, -2.4, studio);
    mesh(box(0.3, 0.06, 4), new THREE.MeshBasicMaterial({ color: 0xd8231b }), S + sx * 4.6, 0.04, 0, studio);
  }
  for (let i = -3; i <= 3; i++) mesh(box(0.5, 0.12, 0.3), new THREE.MeshBasicMaterial({ color: 0xfff6e0 }), S + i * 1.2, 4.6, 0.5, studio);
  // desk
  mesh(box(3.4, 0.86, 0.8), P(0x1a2a6a, { shininess: 70 }), S, 0.43, -0.15, studio);
  mesh(box(3.6, 0.05, 1.0), P(0xe8ecf4, { shininess: 100 }), S, 0.885, -0.15, studio);
  const deskT = txtTex(128, 24, '#d8231b'); lateDraw.push(() => { const g = deskT.userData.g; g.fillStyle = '#d8231b'; g.fillRect(0, 0, 128, 24); g.fillStyle = '#fff'; g.fillRect(0, 21, 128, 3); arC(g, 'عاجل جدًا', 64, 11, 18, '#fff'); deskT.needsUpdate = true; });
  mesh(new THREE.PlaneGeometry(1.6, 0.3), new THREE.MeshBasicMaterial({ map: deskT }), S, 0.55, 0.256, studio);
  for (const x of [S - 0.7, S + 0.9]) { mesh(box(0.55, 0.75, 0.1), M(0x111522), x, 0.85, -1.2, studio); mesh(box(0.55, 0.08, 0.5), M(0x111522), x, 0.46, -0.95, studio); }
  // papers + mugs
  mesh(box(0.3, 0.01, 0.4), M(0xffffff), S - 0.75, 0.915, -0.3, studio).rotation.y = 0.15;
  mesh(cyl(0.05, 0.045, 0.12, 8), P(0xd8231b), S + 0.35, 0.97, -0.2, studio);
  // power strip in front of the desk (the fatal socket)
  mesh(box(0.5, 0.06, 0.12), P(0xf0f0f0), S + 1.95, 0.03, 0.55, studio);
  for (let i = 0; i < 3; i++) mesh(box(0.06, 0.005, 0.06), M(0x333333), S + 1.8 + i * 0.14, 0.065, 0.55, studio);
  mesh(box(0.05, 0.03, 0.04), M(0xd8231b), S + 2.15, 0.065, 0.5, studio);
}
const wallTex = canvasTex(192, 108, () => { });
const vwall = mesh(new THREE.PlaneGeometry(5.6, 3.15), new THREE.MeshBasicMaterial({ map: wallTex }), S, 2.2, -2.62, studio);
mesh(box(5.8, 3.35, 0.05), M(0x05070f), S, 2.2, -2.66, studio);
const studioLight = new THREE.PointLight(0xffffff, 0, 9, 1.0); studioLight.position.set(S, 3.2, 2.5); scene.add(studioLight);

function drawWall(t) {
  const g = wallTex.userData.g, w = 192, h = 108; g.imageSmoothingEnabled = false; g.direction = 'rtl';
  const mode = t >= T_PLUG ? 'static' : t < 9.6 ? 'logo' : t < 28.3 ? 'kitchen' : t < 50.9 ? 'power' : t < 69.6 ? 'guest' : t < 81.6 ? 'call' : t < 101 ? 'sky' : 'logo';
  const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#0a2a6a'); gr.addColorStop(1, '#04102e'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 6; i++) { g.fillStyle = 'rgba(80,160,255,0.12)'; g.fillRect(((t * 30 + i * 40) % (w + 40)) - 40, 0, 14, h); }
  const head = (s) => { g.fillStyle = '#d8231b'; g.fillRect(0, 0, w, 20); arC(g, s, w / 2, 11, 15, '#fff'); };
  if (mode === 'logo') { g.fillStyle = '#d8231b'; g.fillRect(36, 30, 120, 44); arC(g, 'عاجل جدًا', 96, 52, 28, '#fff'); g.fillStyle = '#fff'; g.fillRect(36, 78, 120, 4); }
  if (mode === 'kitchen') { head('انفجار في الدور التالت'); const k = (t * 3) % 1; g.fillStyle = '#eee'; g.fillRect(70, 50, 40, 40); g.fillStyle = '#d8231b'; g.fillRect(78, 38, 24, 14); g.fillStyle = `rgba(255,${150 + k * 100},0,0.9)`; g.beginPath(); for (let i = 0; i < 12; i++) { const a = i / 12 * 6.28, r = i % 2 ? 16 : 34; g.lineTo(130 + Math.cos(a) * r, 52 + Math.sin(a) * r); } g.fill(); }
  if (mode === 'power') { head(t < 37.6 ? 'انقطاع الكهربا' : 'توكتوك طاير'); if (t < 37.6) { g.fillStyle = '#ffe14a'; g.beginPath(); g.arc(96, 58, 20, 0, 7); g.fill(); g.fillRect(88, 76, 16, 10); g.strokeStyle = '#d8231b'; g.lineWidth = 6; g.beginPath(); g.moveTo(66, 30); g.lineTo(126, 96); g.stroke(); } else { g.fillStyle = '#d8231b'; g.fillRect(70, 48, 50, 26); g.fillStyle = '#111'; g.fillRect(74, 74, 10, 10); g.fillRect(108, 74, 10, 10); g.fillStyle = '#fff'; g.beginPath(); g.moveTo(80, 48); g.lineTo(60, 34); g.lineTo(100, 46); g.fill(); } }
  if (mode === 'guest') { head('ضيف الحلقة'); g.fillStyle = '#b27448'; g.beginPath(); g.arc(96, 58, 22, 0, 7); g.fill(); g.fillStyle = '#c9a227'; g.fillRect(76, 40, 40, 6); g.fillStyle = '#111'; g.fillRect(84, 66, 24, 4); arC(g, 'المخترع العالمي', 96, 96, 14, '#ffe14a'); }
  if (mode === 'call') { head('على التليفون'); const k = Math.floor(t * 3) % 2; g.fillStyle = k ? '#3df05a' : '#2fb84a'; g.fillRect(84, 34, 26, 46); g.fillStyle = '#04102e'; g.fillRect(88, 40, 18, 30); arC(g, 'العالمي', 96, 94, 15, '#fff'); }
  if (mode === 'sky') { head('مباشر من السما'); g.fillStyle = '#8ec8ff'; g.fillRect(20, 24, 152, 76); for (let i = 0; i < 4; i++) { g.fillStyle = '#fff'; g.beginPath(); g.arc(40 + i * 40 + Math.sin(t + i) * 6, 50 + (i % 2) * 22, 12, 0, 7); g.fill(); } const bx = 96 + Math.sin(t * 2) * 30, by = 60 + Math.cos(t * 3) * 10; g.fillStyle = '#b07a50'; g.beginPath(); g.arc(bx, by, 9, 0, 7); g.fill(); g.fillStyle = '#d8231b'; g.fillRect(bx - 9, by - 10, 18, 5); g.fillStyle = '#d8231b'; g.fillRect(bx - 14, by + 6, 28, 14); g.fillStyle = '#111'; g.fillRect(bx - 12, by + 19, 5, 5); g.fillRect(bx + 7, by + 19, 5, 5); }
  if (mode === 'static') { for (let i = 0; i < 300; i++) { const v = (hash(i + Math.floor(t * 30) * 7) * 255) | 0; g.fillStyle = `rgb(${v},${v},${v})`; g.fillRect((hash(i * 3 + Math.floor(t * 30)) * w) | 0, (hash(i * 5 + 1 + Math.floor(t * 30)) * h) | 0, 12, 6); } }
  wallTex.needsUpdate = true;
}

// ---------- Nashwa, the anchor (new) ----------
const nashwa = makeChar({
  seed: 121, skin: 0xd09a70, hipY: 0.84, legX: 0.1, legColor: 0x1a1a22, shoe: 0x1a1a1a, hand: 0xd09a70,
  torsoGeo: cyl(0.23, 0.21, 0.6, 8), torsoTex: null, torsoColor: 0xc8202a, torsoY: 0.3, sleeve: true, sleeveColor: 0xc8202a,
  shoulderX: 0.29, shoulderY: 0.54, neckY: 0.6, headR: 0.26,
  build(head, torso, reg) {
    const hair = reg(M(0x2a1810));
    const cap = mesh(new THREE.SphereGeometry(0.285, 10, 6, 0, Math.PI * 2, 0, Math.PI * 0.55), hair, 0, 0.02, -0.03, head); cap.rotation.x = -0.45;
    for (const sx of [-1, 1]) mesh(box(0.07, 0.36, 0.3), hair, sx * 0.25, -0.06, -0.04, head); // bob
    mesh(box(0.42, 0.3, 0.1), hair, 0, -0.08, -0.22, head);
    for (const sx of [-1, 1]) mesh(new THREE.IcosahedronGeometry(0.025, 0), reg(P(0xd4a62a, { shininess: 120 })), sx * 0.27, -0.15, 0.04, head);
    mesh(box(0.12, 0.3, 0.02), reg(M(0xf6f6f2)), 0, 0.42, 0.22, torso);
    for (const sx of [-1, 1]) { const l = mesh(box(0.06, 0.3, 0.025), reg(M(0xa8161e)), sx * 0.08, 0.44, 0.228, torso); l.rotation.z = sx * 0.3; }
    mesh(box(0.04, 0.04, 0.01), reg(P(0xd4a62a)), -0.13, 0.48, 0.235, torso);
    return {};
  }
}, scene);
const NASH_P = V(S - 0.7, 0, -0.75), DAD_P = V(S + 0.9, 0, -0.75);
const SEAT = { y: -0.36, lL: 1.45, lR: 1.45, aLx: 0.55, eL: 0.95, aRx: 0.55, eR: 0.95 };

// ---------- the nuclear booster (dish + coat hanger + pan) ----------
const booster = new THREE.Group(); scene.add(booster);
{
  const d = mesh(new THREE.SphereGeometry(0.34, 10, 4, 0, Math.PI * 2, 0, Math.PI / 3), P(0xeeeeee, { side: THREE.DoubleSide }), 0, 0, 0, booster); d.rotation.x = Math.PI / 2;
  mesh(cyl(0.16, 0.13, 0.05, 10), P(0x1d1d1f, { shininess: 80 }), 0, 0, 0.12, booster).rotation.x = Math.PI / 2;
  mesh(box(0.04, 0.03, 0.3), P(0x111111), 0, -0.25, 0.12, booster).rotation.x = 0.5;
  const hook = mesh(new THREE.TorusGeometry(0.1, 0.012, 4, 10, Math.PI * 1.4), P(0xcccccc), 0, 0.42, 0.05, booster);
  mesh(box(0.012, 0.18, 0.012), P(0xcccccc), 0, 0.3, 0.05, booster);
}
const boosterGlow = mesh(new THREE.CircleGeometry(0.15, 10), new THREE.MeshBasicMaterial({ color: 0xff6a10, transparent: true, opacity: 0 }), 0, 0, 0.155, booster);
const cableMat = new THREE.LineBasicMaterial({ color: 0x111111 });
const cableGeo = new THREE.BufferGeometry().setFromPoints([V(0, 0, 0), V(0, 0, 0), V(0, 0, 0), V(0, 0, 0)]);
const cable = new THREE.Line(cableGeo, cableMat); scene.add(cable);
const plug = mesh(box(0.06, 0.05, 0.08), P(0xf0f0f0), 0, 0, 0, scene);

// =====================================================================
// ARCHIVE 1: the kitchen (x = 100)
// =====================================================================
const K = 100;
{
  const kt = txtTex(16, 16, '#f2f2ee', (g) => { g.fillStyle = '#c8d8e8'; g.fillRect(0, 0, 8, 8); g.fillRect(8, 8, 8, 8); }); kt.repeat.set(8, 6);
  mesh(new THREE.PlaneGeometry(7, 6), M(0xffffff, { map: kt }), K, 0, 0, scene).rotation.x = -Math.PI / 2;
  const wt = txtTex(16, 16, '#eef4f8', (g) => { g.fillStyle = '#9fc0d8'; g.fillRect(0, 15, 16, 1); g.fillRect(15, 0, 1, 16); }); wt.repeat.set(10, 5);
  mesh(new THREE.PlaneGeometry(7, 3.2), M(0xffffff, { map: wt }), K, 1.6, -2.3, scene);
  mesh(new THREE.PlaneGeometry(6, 3.2), M(0xffffff, { map: wt }), K - 3.4, 1.6, 0.6, scene).rotation.y = Math.PI / 2;
  mesh(box(4.2, 0.9, 0.6), M(0x8a5a2b, { map: woodTex }), K - 1.0, 0.45, -1.95, scene); mesh(box(4.3, 0.05, 0.65), P(0xdedede), K - 1.0, 0.92, -1.95, scene);
  mesh(box(4.2, 0.7, 0.35), M(0x8a5a2b, { map: woodTex }), K - 1.0, 2.15, -2.1, scene);
  mesh(box(0.7, 0.1, 0.45), P(0xb8c0c8), K - 1.8, 0.95, -1.95, scene); // sink
  mesh(box(0.8, 0.9, 0.6), P(0xdedede), K - 2.8, 0.45, -1.95, scene); for (let i = 0; i < 4; i++) mesh(cyl(0.09, 0.09, 0.02, 8), M(0x222222), K - 3.0 + (i % 2) * 0.4, 0.92, -2.05 + Math.floor(i / 2) * 0.25, scene);
  mesh(box(0.4, 0.25, 0.3), P(0xc0c0c0), K - 0.6, 1.07, -2.0, scene); // pot
}
const machine = new THREE.Group(); machine.position.set(K + 1.6, 0, -1.7); scene.add(machine);
mesh(box(0.85, 0.85, 0.65), P(0xf4f4f4), 0, 0.425, 0, machine); mesh(box(0.75, 0.5, 0.02), P(0xd8d8d8), 0, 0.42, 0.33, machine);
const mEngine = mesh(box(0.5, 0.4, 0.45), P(0xd8231b, { shininess: 70 }), 0, 1.05, 0, machine);
for (let i = 0; i < 3; i++) mesh(box(0.88, 0.05, 0.02), P(0xc9ccd1), 0, 0.6 + i * 0.25, 0.335, machine);
const mPipe = mesh(cyl(0.05, 0.05, 0.5, 6), P(0x8a4a22), 0.45, 1.05, 0, machine); mPipe.rotation.z = Math.PI / 2;
const plates = []; for (let i = 0; i < 14; i++) { const p = mesh(cyl(0.13, 0.13, 0.015, 10), P(0xffffff), 0, 0, 0, scene); p.visible = false; plates.push({ p, v: V((hash(i) - .5) * 5, 2 + hash(i + 9) * 4, 1 + hash(i + 3) * 3), s: hash(i + 5) * 10 }); }
const soot = []; for (let i = 0; i < 6; i++) { const s = mesh(new THREE.CircleGeometry(0.4 + hash(i) * 0.5, 7), new THREE.MeshBasicMaterial({ color: 0x111111, transparent: true, opacity: 0.75 }), K + 1.6 + (hash(i + 2) - .5) * 2.4, 1.0 + hash(i + 4) * 1.6, -2.28 + i * 0.001, scene); s.visible = false; soot.push(s); }

// =====================================================================
// ARCHIVE 2: the blackout (x = 150)
// =====================================================================
const N = -400; const wins = [];
const winOn = 0xffd890, winOff = 0x0e1424;
function winPlane(x, y, z, w = 0.7, h = 0.9) { const m = mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: winOn }), x, y, z, scene); wins.push(m); return m; }
{
  mesh(new THREE.PlaneGeometry(80, 40), M(0x1a1c26), N, 0, 0, scene).rotation.x = -Math.PI / 2;
  mesh(box(8, 12, 0.5), M(0x8a7a68), N, 6, -0.25, scene);
  for (let c = 0; c < 5; c++) for (let r = 0; r < 5; r++) winPlane(N - 3.2 + c * 1.6, 1.6 + r * 2.1, 0.01);
  const r0 = rng(31);
  for (let i = 0; i < 16; i++) {
    const x = N - 24 + i * 3.2 + (r0() - .5), z = -9 - r0() * 12, hh = 6 + r0() * 14, ww = 2.4 + r0();
    mesh(box(ww, hh, 2), M([0x3a3a4a, 0x4a4038, 0x30384a][i % 3]), x, hh / 2, z, scene);
    for (let yy = 1.2; yy < hh - 0.5; yy += 1.4) for (let xx = -ww / 2 + 0.5; xx < ww / 2 - 0.3; xx += 0.8) if (r0() > 0.35) winPlane(x + xx, yy, z + 1.01, 0.4, 0.6);
  }
  // Ibrahim's balcony on the 4th row
  mesh(box(1.6, 0.12, 0.9), M(0x9a8a78), N + 1.6, 7.0, 0.45, scene);
  mesh(box(1.6, 0.06, 0.06), P(0x3a3a3a), N + 1.6, 7.9, 0.88, scene);
  for (let i = 0; i < 8; i++) mesh(box(0.025, 0.85, 0.025), P(0x3a3a3a), N + 0.85 + i * 0.21, 7.45, 0.88, scene);
  const d = mesh(new THREE.SphereGeometry(0.4, 8, 4, 0, Math.PI * 2, 0, Math.PI / 3), P(0xeeeeee, { side: THREE.DoubleSide }), N + 2.0, 7.9, 0.5, scene); d.rotation.x = -1.0;
  for (let i = 0; i < 4; i++) { mesh(cyl(0.05, 0.06, 4.5, 6), M(0x222222), N - 9 + i * 6, 2.25, 4, scene); }
}
const panGlow = mesh(new THREE.CircleGeometry(0.17, 10), new THREE.MeshBasicMaterial({ color: 0xff5a10 }), N + 2.0, 8.05, 0.78, scene); panGlow.rotation.x = -0.6;
const lamps = []; for (let i = 0; i < 4; i++) lamps.push(mesh(new THREE.SphereGeometry(0.22, 6, 4), new THREE.MeshBasicMaterial({ color: 0xffe8a0 }), N - 9 + i * 6, 4.55, 4, scene));
const moonDisc = mesh(new THREE.CircleGeometry(1.4, 12), new THREE.MeshBasicMaterial({ color: 0xf4f0d8 }), N - 10, 22, -30, scene);
const PAN_W = V(N + 2.0, 8.05, 0.78);

// =====================================================================
// ARCHIVE 3 + interview: the market (x = 200), tuk-tuk from tuk_block
// =====================================================================
const MK = 200;
tuk.add(engine6); engine6.position.set(0.9, 0.35, 0); bay.visible = false; engine6.visible = true;
street.position.set(MK, 0, 0);
const melons = []; const melonT = txtTex(16, 16, '#3f8a2f', (g) => { g.fillStyle = '#1f5a1f'; for (let i = 0; i < 16; i += 4) g.fillRect(i, 0, 2, 16); });
const signT = txtTex(64, 20, '#ffe14a');
lateDraw.push(() => { const g = signT.userData.g; g.fillStyle = '#ffe14a'; g.fillRect(0, 0, 64, 20); arC(g, 'بطيخ مستورد', 32, 11, 13, '#c11'); signT.needsUpdate = true; });
const stallTop = new THREE.Group(); stallTop.position.set(MK, 0, -2.6); scene.add(stallTop);
{
  mesh(new THREE.PlaneGeometry(50, 30), M(0xb8ab8e), MK, 0, 0, scene).rotation.x = -Math.PI / 2;
  for (let i = -3; i <= 3; i++) { mesh(box(4.6, 5 + (i % 2) * 1.5, 1), M([0xd8b080, 0xc99a5a, 0xb48a6a][(i + 3) % 3]), MK + i * 4.8, 2.5, -7, scene); mesh(new THREE.PlaneGeometry(2.4, 2.2), M(0x2a2018), MK + i * 4.8, 1.2, -6.49, scene); }
  const awnT = txtTex(16, 16, '#fff', (g) => { for (let i = 0; i < 4; i++) { g.fillStyle = i % 2 ? '#fff' : '#d8231b'; g.fillRect(i * 4, 0, 4, 16); } }); awnT.repeat.set(3, 1);
  mesh(box(3.0, 0.7, 1.4), M(0x8a5a2b, { map: woodTex }), 0, 0.35, 0, stallTop);
  for (const sx of [-1.45, 1.45]) for (const sz of [-0.65, 0.65]) mesh(box(0.06, 2.4, 0.06), M(0x6a4220), sx, 1.2, sz, stallTop);
  const aw = mesh(box(3.3, 0.06, 1.8), M(0xffffff, { map: awnT }), 0, 2.45, 0.1, stallTop); aw.rotation.x = -0.15; stallTop.userData.aw = aw;
  mesh(new THREE.PlaneGeometry(1.4, 0.44), new THREE.MeshBasicMaterial({ map: signT }), 0, 2.0, 0.66, stallTop);
  for (let i = 0; i < 18; i++) { const m = mesh(new THREE.SphereGeometry(0.24, 7, 5), M(0xffffff, { map: melonT }), -1.1 + (i % 6) * 0.44, 0.92 + Math.floor(i / 6) * 0.36, -0.35 + (Math.floor(i / 6) % 2) * 0.3, stallTop); m.scale.set(1.3, 1, 1); melons.push({ m, base: m.position.clone(), v: V((hash(i) - .5) * 6, 2 + hash(i + 1) * 4, 1 + hash(i + 2) * 4) }); }
  // other stalls
  for (const [x, col] of [[-4.5, 0xff8a1a], [4.5, 0xd8231b]]) { mesh(box(2.6, 0.8, 1.2), M(0x8a5a2b, { map: woodTex }), MK + x, 0.4, -3, scene); const r = rng(x * 9 + 3); for (let i = 0; i < 30; i++) mesh(new THREE.SphereGeometry(0.09, 6, 4), M(col), MK + x - 1 + r() * 2, 0.9 + Math.floor(i / 10) * 0.12, -3.4 + r() * 0.8, scene); }
}
const chunks = []; for (let i = 0; i < 26; i++) { const c = mesh(new THREE.TetrahedronGeometry(0.1 + hash(i) * 0.08, 0), M(i % 3 ? 0xe8303a : 0x2f7a2f), 0, 0, 0, scene); c.visible = false; chunks.push({ c, v: V((hash(i + 1) - .5) * 8, 2 + hash(i + 2) * 5, (hash(i + 3) - .2) * 6) }); }
const melonHalf = new THREE.Group(); scene.add(melonHalf);
mesh(new THREE.SphereGeometry(0.24, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), M(0x2f7a2f, { side: THREE.DoubleSide }), 0, 0, 0, melonHalf).rotation.x = Math.PI;
mesh(new THREE.CircleGeometry(0.22, 8), M(0xe8303a), 0, 0.001, 0, melonHalf).rotation.x = -Math.PI / 2;
const shehata = makeChar({
  seed: 51, skin: 0x9a6440, hipY: 0.86, legX: 0.14, legColor: 0x4a5a7a, shoe: 0x3a2a1a, hand: 0x9a6440,
  torsoGeo: cyl(0.34, 0.46, 0.7, 7), torsoTex: canvasTex(16, 16, (g) => { g.fillStyle = '#e8eef8'; g.fillRect(0, 0, 16, 16); g.fillStyle = '#3a5aa8'; g.fillRect(0, 0, 2, 16); g.fillRect(6, 0, 2, 16); g.fillRect(12, 0, 2, 16); }, [3, 2]), torsoColor: 0xffffff, torsoY: 0.35,
  skirt: cyl(0.46, 0.5, 0.7, 7), sleeve: true, shoulderX: 0.44, shoulderY: 0.62, neckY: 0.7, headR: 0.3,
  build(head, torso, reg) {
    mesh(new THREE.SphereGeometry(0.31, 8, 4, 0, Math.PI * 2, 0, Math.PI * 0.35), reg(M(0xf2f2f2)), 0, 0.04, 0, head);
    mesh(box(0.7, 0.55, 0.05), reg(M(0xd8c8a0)), 0, 0.25, 0.42, torso);
    return {};
  }
}, scene);

// =====================================================================
// Uncle Sayed's doorstep (x = 250)
// =====================================================================
const SY = 300;
{
  mesh(new THREE.PlaneGeometry(30, 20), M(0x9a9080), SY, 0, 0, scene).rotation.x = -Math.PI / 2;
  mesh(box(12, 9, 0.4), M(0xd8b080), SY, 4.5, -1.8, scene);
  mesh(new THREE.PlaneGeometry(1.3, 2.3), M(0x2a1e14), SY + 1.2, 1.15, -1.59, scene);
  for (let c = -2; c <= 2; c++) for (let r = 0; r < 2; r++) if (!(c === 1 && r === 0)) mesh(new THREE.PlaneGeometry(0.8, 1.0), M(0x3a4a6a), SY + c * 2.2, 2.0 + r * 3, -1.59, scene);
  mesh(box(1.8, 0.45, 0.55), M(0x8a5a2b, { map: woodTex }), SY - 0.4, 0.225, -1.1, scene);
  const plate = txtTex(64, 20, '#1f5fd8'); lateDraw.push(() => { const g = plate.userData.g; g.fillStyle = '#1f5fd8'; g.fillRect(0, 0, 64, 20); arC(g, 'عمارة ١٢', 32, 11, 13, '#fff'); plate.needsUpdate = true; });
  mesh(new THREE.PlaneGeometry(0.8, 0.25), new THREE.MeshBasicMaterial({ map: plate }), SY + 1.2, 2.55, -1.58, scene);
}
const sayed = makeChar({
  seed: 41, skin: 0x8a5a3a, hipY: 0.84, legX: 0.12, legColor: 0x6b5a48, shoe: 0x3a2a1a, hand: 0x8a5a3a,
  torsoGeo: cyl(0.28, 0.34, 0.66, 7), torsoTex: null, torsoColor: 0x6b5a48, torsoY: 0.33,
  skirt: cyl(0.34, 0.44, 0.75, 7), sleeve: true, sleeveColor: 0x6b5a48, shoulderX: 0.34, shoulderY: 0.6, neckY: 0.66, headR: 0.28,
  build(head, torso, reg) {
    const tw = reg(M(0xf4f2ea));
    const turban = mesh(new THREE.TorusGeometry(0.24, 0.09, 5, 10), tw, 0, 0.2, -0.02, head); turban.rotation.x = Math.PI / 2;
    mesh(new THREE.SphereGeometry(0.2, 7, 4, 0, Math.PI * 2, 0, Math.PI / 2), tw, 0, 0.22, -0.02, head);
    mesh(box(0.62, 0.1, 0.05), reg(M(0xd8d0b8)), 0, 0.45, 0.24, torso);
    return {};
  }
}, scene);
const emptyTea = mesh(cyl(0.04, 0.035, 0.11, 6), P(0xdde8f0, { transparent: true, opacity: 0.6 }), 0, 0, 0, sayed.arms[1].hand);
emptyTea.position.set(0, 0.03, 0.06);

// =====================================================================
// El-Alamy's office corner at the service center (x = -100)
// =====================================================================
const G = -100;
{
  mesh(new THREE.PlaneGeometry(14, 10), M(0x8a8a8e), G, 0, 0, scene).rotation.x = -Math.PI / 2;
  const mt = txtTex(16, 32, '#6f8fa8', (g) => { g.fillStyle = '#5a7890'; for (let x = 0; x < 16; x += 4) g.fillRect(x, 0, 2, 32); }); mt.repeat.set(8, 1);
  mesh(new THREE.PlaneGeometry(10, 5), M(0xffffff, { map: mt }), G, 2.5, -2.2, scene);
  const sg = txtTex(160, 32, '#d8231b'); lateDraw.push(() => { const g = sg.userData.g; g.fillStyle = '#d8231b'; g.fillRect(0, 0, 160, 32); g.fillStyle = '#fff'; g.fillRect(0, 0, 160, 3); g.fillRect(0, 29, 160, 3); arC(g, 'مركز الصيانة', 80, 17, 20, '#fff'); sg.needsUpdate = true; });
  mesh(new THREE.PlaneGeometry(3.6, 0.72), new THREE.MeshBasicMaterial({ map: sg }), G, 3.4, -2.18, scene);
  mesh(box(1.4, 0.06, 0.7), M(0x6a4220), G + 1.3, 0.8, -1.4, scene); for (const [x, z] of [[-0.6, -0.3], [0.6, -0.3], [-0.6, 0.3], [0.6, 0.3]]) mesh(box(0.05, 0.8, 0.05), M(0x333333), G + 1.3 + x, 0.4, -1.4 + z, scene);
  mesh(box(0.6, 0.4, 0.05), M(0x111111), G + 1.3, 1.1, -1.6, scene); mesh(new THREE.PlaneGeometry(0.55, 0.35), new THREE.MeshBasicMaterial({ color: 0x0a2a5a }), G + 1.3, 1.1, -1.57, scene);
  for (let k = 0; k < 4; k++) mesh(new THREE.TorusGeometry(0.38, 0.16, 6, 12), M(0x1a1a1a), G - 2.6, 0.16 + k * 0.32, -1.6, scene).rotation.x = Math.PI / 2;
  mesh(box(2.4, 1.2, 0.06), M(0xc8a060), G - 0.8, 2.0, -2.15, scene);
}
const alamy = makeAlamy(scene);
const phoneA = new THREE.Group(); alamy.arms[1].hand.add(phoneA); mesh(box(0.1, 0.19, 0.015), P(0xc8c4e8, { shininess: 120 }), 0, 0.02, 0.07, phoneA);

// =====================================================================
// The sky (Bastam), around x = 440
// =====================================================================
const SKX = 2000, BP = V(SKX, 130, 0);
{
  mesh(new THREE.PlaneGeometry(1400, 1400), M(0xd8bc80), SKX, 0, 0, scene).rotation.x = -Math.PI / 2;
  mesh(new THREE.PlaneGeometry(800, 1400), M(0x2f7fc8), SKX + 462, 0.6, 0, scene).rotation.x = -Math.PI / 2;
  mesh(new THREE.PlaneGeometry(12, 1400), M(0xf0dca8), SKX + 58, 0.3, 0, scene).rotation.x = -Math.PI / 2;
  const r = rng(9); for (let i = 0; i < 90; i++) { const h = 4 + r() * 14; mesh(box(4 + r() * 5, h, 4 + r() * 5), M([0xf4f0e8, 0xe8dcc0, 0xd8d0c0][i % 3]), SKX + 18 + r() * 36, h / 2, -130 + r() * 260, scene); }
  mesh(cyl(2.5, 3.5, 24, 6), M(0xe8dcc0), SKX + 60, 12, 20, scene); mesh(cyl(1.8, 1.8, 4, 6), new THREE.MeshBasicMaterial({ color: 0xfff0a0 }), SKX + 60, 26, 20, scene);
  for (let i = 0; i < 3; i++) { const hh = 40 - i * 8; const p = mesh(new THREE.ConeGeometry(34 - i * 7, hh, 4), M(0xe0c070), SKX - 120 + i * 42, hh / 2, -110 + i * 24, scene); p.rotation.y = Math.PI / 4; }
}
const clouds = []; for (let i = 0; i < 18; i++) { const c = mesh(new THREE.IcosahedronGeometry(2 + hash(i) * 2.5, 0), new THREE.MeshLambertMaterial({ color: 0xffffff, transparent: true, opacity: 0.88, flatShading: true }), BP.x + (hash(i + 1) - .5) * 70, BP.y - 8 + hash(i + 2) * 14, (hash(i + 3) - .5) * 70, scene); c.scale.y = 0.5; clouds.push(c); }
${BASTAM}
const tuk2 = tuk.clone(true); scene.add(tuk2); tuk2.add(bastam.root);
const phoneB = new THREE.Group(); bastam.arms[1].hand.add(phoneB); mesh(box(0.1, 0.19, 0.015), P(0x222222), 0, 0.02, 0.07, phoneB);

// =====================================================================
// HOME (engine8 living room at the origin): the ending
// =====================================================================
const MOM_P = V(-1.0, 0, 1.72);

// ---------- poses / state ----------
function talkPose(p, t, who, amt = 1) {
  if (speakerAt(t) !== who) return p; const e = envAt(t) * amt;
  p.aRx += e * 0.35 * (1 + Math.sin(t * 5.3)); p.eR += e * 0.5; p.hx += Math.sin(t * 7) * e * 0.05; p.hy += Math.sin(t * 2.1) * 0.08; return p;
}
function setFace(c, eyes, mouth, opts = {}) { c.faceMat.map = faceTexture(eyes, mouth, opts); c.faceMat.needsUpdate = true; }

function stateAt(t) {
  // ----- studio -----
  nashwa.root.position.copy(NASH_P); nashwa.root.rotation.set(0, 0.12, 0);
  let np = { ...POSE0, ...SEAT };
  if (inT(t, 64.9, 66.6)) np.hz = -0.12;
  if (t >= 111.0) { const k = easeOut(seg(t, 111.0, 111.3)); np.aLx = lerp(0.55, 1.4, k); np.eL = lerp(0.95, 1.9, k); np.aRx = lerp(0.55, 1.4, k); np.eR = lerp(0.95, 1.9, k); np.y = -0.36 + 0.2 * k; }
  if (inT(t, 69.6, 70.4)) np.hy = 0.5;
  applyPose(nashwa, talkPose(np, t, 'nashwa', 0.7));
  let ne = 'default', nm = talkMouth(t, 'nashwa') || 'smile';
  if (inT(t, 51.2, 53.6)) ne = 'side'; if (inT(t, 64.9, 66.6)) ne = 'smug';
  if (inT(t, 92.7, 94.7)) ne = 'wide'; if (t >= 107.4) { ne = 'wide'; if (!talkMouth(t, 'nashwa')) nm = 'o'; }
  if (t >= 111.0 && talkMouth(t, 'nashwa')) nm = envAt(t) > 0.5 ? 'scream' : 'talk2';
  setFace(nashwa, ne, nm, { blush: true });

  // Ibrahim: seated guest, stands up angry at the call, ducks, pops up with the booster
  dad.root.position.copy(DAD_P); dad.root.rotation.set(0, -0.12, 0); dad.root.visible = true;
  let dp = { ...POSE0, ...SEAT };
  if (t >= 78.0 && t < 82) { const k = easeBack(seg(t, 78.0, 78.4)); dp.y = lerp(-0.36, 0, k); dp.lL = dp.lR = lerp(1.45, 0, k); dp.aLx = lerp(0.55, 1.6, k) + Math.sin(t * 9) * 0.2; dp.aLz = 0.3; dp.eL = 0.4; }
  if (t >= 100.9 && t < T_POP) dad.root.visible = false;
  if (t >= T_POP) { const k = easeBack(seg(t, T_POP, T_POP + 0.35)); dp = { ...POSE0, y: lerp(-1.3, 0, k), aLx: 1.1, eL: 0.9, aRx: 1.1, eR: 0.9, aLz: 0.25, aRz: 0.25 }; dad.root.position.x = S + 1.2; dad.root.rotation.y = -0.3;
    if (t >= 112.3) { const k2 = easeOut(seg(t, 112.3, 112.7)); dp.bend = 0.5 * k2; dp.y = -0.25 * k2; dp.aRx = lerp(1.1, 0.4, k2); dp.eR = lerp(0.9, 0.1, k2); }
  }
  applyPose(dad, talkPose(dp, t, 'dad'));
  let de = 'smug', dm = talkMouth(t, 'dad', 'grin') || 'smile';
  if (inT(t, 66.9, 69.6)) de = 'closed';
  if (inT(t, 70.4, 78.0)) { de = 'angry'; dm = 'frown'; }
  if (inT(t, 78.0, 82)) { de = 'angry'; dm = talkMouth(t, 'dad', 'scream') || 'clench'; }
  if (t >= T_POP) { de = 'sparkle'; dm = talkMouth(t, 'dad', 'grin') || 'grin'; }
  if (t >= T_PLUG) { de = 'x'; dm = 'o'; }
  setFace(dad, de, dm, { stache: true, soot: t >= T_PLUG + 0.1 });
  // booster in Ibrahim's hands
  booster.visible = t >= T_POP && t < T_HOME; cable.visible = plug.visible = booster.visible;
  if (booster.visible) {
    const a = dad.arms[0].hand.getWorldPosition(V(0, 0, 0)), b = dad.arms[1].hand.getWorldPosition(V(0, 0, 0));
    booster.position.copy(a.clone().add(b).multiplyScalar(0.5)).add(V(0, 0.28, 0.12)); booster.rotation.set(-0.2, dad.root.rotation.y, 0);
    const sock = V(S + 2.15, 0.08, 0.5); const from = booster.position.clone().add(V(0, -0.25, 0.1));
    const k = easeIn(seg(t, 112.4, T_PLUG)); const pp = VL(V(S + 2.0, 0.6, 0.9), sock, k); plug.position.copy(pp);
    const mid1 = VL(from, pp, 0.33).add(V(0, -0.3, 0.3)), mid2 = VL(from, pp, 0.66).add(V(0, -0.2, 0.3));
    cable.geometry.setFromPoints([from, mid1, mid2, pp]);
    boosterGlow.material.opacity = t >= T_PLUG ? 0.6 + 0.4 * Math.sin(t * 40) : 0;
  }
  studioLight.intensity = t >= T_PLUG ? (hash(Math.floor(t * 20)) > 0.5 ? 2.5 : 0.2) : 1.2;

  // ----- kitchen archive -----
  { const sh = t > 14.5 && t < T_EXPLODE ? (t - 14.5) * 0.012 : 0; machine.position.set(K + 1.6 + Math.sin(t * 60) * sh, 0, -1.7 + Math.cos(t * 53) * sh); machine.visible = t < T_EXPLODE;
    const a = t - T_EXPLODE; plates.forEach((o) => { o.p.visible = a > 0 && a < 3; if (o.p.visible) { o.p.position.set(K + 1.6 + o.v.x * a, Math.max(0.02, 1.0 + o.v.y * a - 4.9 * a * a), -1.7 + o.v.z * a); o.p.rotation.set(o.s * a, o.s * a * 0.7, 0); } });
    soot.forEach(s => s.visible = t >= T_EXPLODE); }
  // ----- blackout archive -----
  wins.forEach((w) => { const off = T_OUT + w.position.distanceTo(PAN_W) * 0.045; w.material.color.setHex(t >= off && t < 50 ? winOff : winOn); });
  lamps.forEach((l, i) => l.material.color.setHex(t >= T_OUT + 0.5 + i * 0.1 && t < 50 ? 0x222222 : 0xffe8a0));
  { const k = clamp((t - 32.0) / 2.2); panGlow.material.color.setRGB(1, 0.35 + 0.65 * k * (0.7 + 0.3 * Math.sin(t * 30)), 0.06 + 0.9 * k * k); panGlow.visible = t < T_OUT + 0.15; }
  // ----- market archive: tuk-tuk crash -----
  { let p, rz = 0, ry = -0.5;
    if (t < 38.4) p = V(-30, 12, -10);
    else if (t < T_CRASH) { const k = seg(t, 38.4, T_CRASH); p = VL(V(-14, 9, -8), V(0.2, 1.1, -2.5), easeIn(k)); rz = -0.25 - 0.3 * k; ry = -0.5 + 0.3 * k; }
    else { p = V(0.2, 0.75, -2.3); rz = -0.42; ry = -0.2; }
    tuk.position.copy(p); tuk.rotation.set(0, ry, rz); wheels.forEach(w => w.rotation.y = t * 9); }
  { const a = t - T_CRASH; melons.forEach((o, i) => { if (a > 0 && i % 2 === 0) { const tt = Math.min(a, 1.6); o.m.position.copy(o.base.clone().add(o.v.clone().multiplyScalar(tt)).add(V(0, -4.9 * tt * tt, 0))); if (o.m.position.y < -0.6) o.m.position.y = -0.6; } else o.m.position.copy(o.base); });
    chunks.forEach((o) => { o.c.visible = a > 0; if (a > 0) { const tt = Math.min(a, 1.4); o.c.position.set(MK + 0.2 + o.v.x * tt, Math.max(0.05, 1.1 + o.v.y * tt - 4.9 * tt * tt), -2.4 + o.v.z * tt); o.c.rotation.set(tt * 9, tt * 7, 0); } });
    stallTop.userData.aw.rotation.x = a > 0 ? -0.15 - 0.5 * easeOut(clamp(a / 0.3)) : -0.15; stallTop.userData.aw.position.y = a > 0 ? 2.45 - 0.9 * easeOut(clamp(a / 0.3)) : 2.45; }
  { const interview = t >= 43.3;
    shehata.root.position.copy(interview ? V(MK + 0.9, 0, 0.4) : V(MK + 1.9, 0, -0.9)); shehata.root.rotation.set(0, interview ? 0.15 : -0.5, 0);
    let sp = { ...POSE0 };
    if (!interview && t > T_CRASH - 0.3) { sp.aLz = 2.6 + Math.sin(t * 14) * 0.2; sp.aRz = 2.6 + Math.sin(t * 14 + 1) * 0.2; sp.y = -0.1; }
    if (interview) { sp.aRx = 1.0 + Math.sin(t * 3) * 0.15; sp.eR = 1.2; sp.aLz = 0.5 + envAt(t) * 0.6 * (speakerAt(t) === 'shehata' ? 1 : 0); }
    applyPose(shehata, talkPose(sp, t, 'shehata', 0.4));
    setFace(shehata, interview ? 'angry' : (t > T_CRASH - 0.3 ? 'wide' : 'default'), talkMouth(t, 'shehata', 'scream') || (t > T_CRASH - 0.3 && !interview ? 'scream' : 'frown'), { stache: true });
    melonHalf.visible = interview && t < 52; if (melonHalf.visible) { const hp = shehata.arms[1].hand.getWorldPosition(V(0, 0, 0)); melonHalf.position.copy(hp).add(V(0, 0.12, 0.05)); } }
  // ----- Sayed -----
  sayed.root.position.set(SY - 0.4, 0, -1.15); sayed.root.rotation.set(0, 0.25, 0);
  { const p = { ...POSE0, y: -0.38, lL: 1.5, lR: 1.5, aRx: 0.9, eR: 1.3, aRz: 0.15, aLz: 0.3, aLx: 0.4, eL: 0.6 };
    if (inT(t, 26.7, 28.4)) { p.aRx = 1.3 + Math.sin(t * 6) * 0.15; p.eR = 1.1; }
    applyPose(sayed, talkPose(p, t, 'sayed', 0.3));
    setFace(sayed, inT(t, 26.7, 28.4) ? 'side' : 'tired', talkMouth(t, 'sayed') || 'smile', { stache: true, stacheColor: '#dddddd' }); }
  // ----- El-Alamy (phone) -----
  alamy.root.position.set(G - 0.2, 0, -0.4); alamy.root.rotation.set(0, 0.2, 0);
  applyPose(alamy, talkPose({ ...POSE0, aLz: 0.12, aRx: 1.05, aRz: 0.35, eR: 1.75, hx: 0.1 }, t, 'alamy', 0.2));
  setFace(alamy, inT(t, 78.2, 81.6) ? 'smug' : 'smug', talkMouth(t, 'alamy') || (t > 78.2 ? 'smile' : 'flat'), ALAMY_FACE);
  // ----- Bastam in the sky -----
  { const bob = V(Math.sin(t * 0.7) * 0.6, Math.sin(t * 1.3) * 0.4, Math.cos(t * 0.5) * 0.5);
    const yawTo = (p) => { const d = p.clone().sub(BP); return Math.atan2(d.z, -d.x); };
    const yP = yawTo(V(SKX - 80, 0, -90)), yA = yawTo(V(SKX + 45, 0, 10));
    let yaw = t * 0.3; if (t >= 95) yaw = t < 96.9 ? yP : lerp(yP, yA, easeInOut(seg(t, 96.9, 97.9)));
    tuk2.position.copy(BP).add(bob); tuk2.rotation.set(Math.sin(t * 1.1) * 0.08, yaw, (t >= 95 && t < 99 ? 0.18 : 0) + Math.sin(t * 1.7) * 0.06);
    bastam.root.position.set(-0.3, 0.42, 0); bastam.root.rotation.set(0, -Math.PI / 2, 0);
    const w = Math.sin(t * 9);
    const bp = { ...POSE0, y: -0.4, lL: 1.4, lR: 1.4, aLz: 2.3 + w * 0.4, eL: 0.3, aRx: 0.4, aRz: 0.6, eR: 2.3, hy: Math.sin(t * 3) * 0.2 };
    if (inT(t, 99.0, 100.9)) { bp.aLz = 2.6 + w * 0.3; bp.aRz = 2.6 - w * 0.3; bp.aRx = 0; bp.eR = 0.3; bp.eL = 0.2; }
    applyPose(bastam, bp); phoneB.visible = !inT(t, 99.0, 100.9);
    setFace(bastam, 'wide', talkMouth(t, 'bastam', 'scream') || 'o', { fuzz: true }); }
  clouds.forEach((c, i) => { c.position.y = BP.y - 8 + hash(i + 2) * 14 + ((t * 2.5 + i * 7) % 30) - 15; });
  // ----- home -----
  mom.root.position.copy(MOM_P); mom.root.rotation.set(0, Math.PI, 0);
  { const p = { ...POSE0, y: -0.33, lL: 1.45, lR: 1.45, aLx: 0.3, eL: 1.2, aRx: 0.3, eR: 1.2 };
    if (t >= 118.9) { const k = easeBack(seg(t, 118.9, 119.2)); p.y = lerp(-0.33, 0, k); p.lL = p.lR = lerp(1.45, 0, k); p.aLz = 2.4 * k; p.aRz = 2.4 * k; p.eL = p.eR = 0.3; }
    applyPose(mom, p);
    setFace(mom, t >= 118.9 ? 'angry' : inT(t, 116.9, 118.9) ? 'side' : 'flat', talkMouth(t, 'mom', 'scream') || (t >= 119.8 ? 'clench' : 'flat'), {}); }
  dad.afro.visible = false;
  mic.visible = false; micArm.visible = false;
}

// ---------- lighting per set ----------
function look(kind, t) {
  const L = {
    studio: [0xc0c8e0, 0.75, 0x101a3a, 0.9, 0.0],
    day: [0xfff4e0, 0.7, 0x8ec8ff, 1.1, 0.0],
    kitchen: [0xfff4e0, 0.75, 0x202020, 0.9, 0.0],
    night: [0x5060a0, 0.4, 0x070b1c, 0.0, 0.25],
    sky: [0xffffff, 0.8, 0x8ec8ff, 1.2, 0.0],
    home: [0x203050, 0.18, 0x000000, 0.0, 0.08],
  }[kind];
  ambient.color.setHex(L[0]); ambient.intensity = L[1]; scene.background = new THREE.Color(L[2]); sun.intensity = L[3]; moon.intensity = L[4];
  tvLight.intensity = kind === 'home' ? 1.5 + 2.5 * hash(Math.floor(t * 24)) : 0; tvLight.color.setHex(0xcfe0ff);
  hallLight.intensity = 0; balcLight.intensity = 0; camera.far = kind === 'sky' ? 900 : 90;
  fill.intensity = kind === 'home' ? 0.15 : kind === 'night' ? 0.4 : 1.2;
}

// ---------- shots ----------
// returns a description; 'split' shots render two views side by side
function shotAt(t) {
  if (t < 2.6) return { set: 'studio', f: () => { const k = easeInOut(seg(t, 0, 2.6)); cam(VL(V(S, 3.4, 9.5), V(S, 2.0, 4.6), k), V(S, 1.4, -1.2), 48); } };
  if (t < 9.6) return { set: 'studio', f: () => { const k = easeInOut(seg(t, 2.6, 5.0)); cam(VL(V(S - 0.3, 1.8, 3.6), V(S - 0.45, 1.45, 1.4), k), VL(V(S, 1.2, -0.8), headOf(nashwa).add(V(0.15, -0.15, 0)), k), lerp(46, 40, k)); } };
  if (t < 12.85) return { set: 'studio', f: () => faceCam(nashwa, 2.4, 0.6, 0.05, 42, 0.25) };
  if (t < 21.3) return { set: 'kitchen', archive: true, f: () => {
    if (t < T_EXPLODE) { const k = easeInOut(seg(t, 12.85, T_EXPLODE)); cam(VL(V(K - 0.8, 1.7, 2.6), V(K + 0.9, 1.35, 0.4), k), V(K + 1.5, 0.8, -1.7), 50); }
    else cam(V(K - 0.4, 1.9, 2.9).add(shake(t, t < T_EXPLODE + 0.8 ? 0.25 : 0.03)), V(K + 1.2, 1.0, -1.6), 56); } };
  if (t < 28.3) return { set: 'day', f: () => { faceCam(sayed, 2.3, 0.5, 0.05, 44, 0.3); placeMic(sayed, -1); } };
  if (t < 32.0) return { set: 'studio', f: () => faceCam(nashwa, 2.3, -0.55, 0.05, 40, 0.25) };
  if (t < 37.6) return { set: 'night', archive: true, f: () => {
    if (t < T_OUT) { const k = easeInOut(seg(t, 32.0, T_OUT)); cam(VL(V(N - 1.5, 1.7, 13), V(N - 0.2, 3.5, 7.5), k), PAN_W.clone().add(V(-0.5, -0.5, 0)), 40); }
    else { const k = easeOut(seg(t, T_OUT, 37.6)); cam(VL(V(N - 0.2, 3.5, 7.5), V(N + 1, 5, 24), k).add(shake(t, t < T_OUT + 0.4 ? 0.12 : 0)), VL(PAN_W, V(N, 6, -8), k), lerp(40, 60, k)); } } };
  if (t < 43.3) return { set: 'day', archive: true, f: () => {
    const tp = tuk.getWorldPosition(V(0, 0, 0));
    if (t < T_CRASH) cam(V(MK + 3.2, 1.5, 6.8), VL(V(MK, 1.6, -2.6), tp.clone().add(V(0, 1, 0)), 0.55), 52);
    else cam(V(MK + 2.6, 1.6, 6.0).add(shake(t, t < T_CRASH + 0.6 ? 0.22 : 0.02)), V(MK + 0.2, 1.0, -2.4), 52); } };
  if (t < 50.9) return { set: 'day', f: () => { faceCam(shehata, 2.6, -0.7, 0.05, 46, 0.3); placeMic(shehata, -1); } };
  if (t < 57.2) return { set: 'studio', f: () => { const k = easeInOut(seg(t, 50.9, 57.2)); cam(VL(V(S + 0.1, 1.9, 4.0), V(S + 0.1, 1.75, 3.0), k), V(S + 0.1, 1.2, -0.8), 46); } };
  if (t < 64.7) return { set: 'studio', f: () => faceCam(dad, 2.3, -0.5, 0.05, 40, 0.25) };
  if (t < 66.7) return { set: 'studio', f: () => faceCam(nashwa, 1.9, 0.35, 0.02, 38, 0.2) };
  if (t < 69.6) return { set: 'studio', f: () => faceCam(dad, 2.0, -0.4, 0.05, 40, 0.2) };
  if (t < 81.6) return { split: true, labels: ['الاستوديو', 'على التليفون'],
    a: () => { look('studio', t); if (t < 78.0) faceCam(dad, 2.2, -0.2, 0.05, 50, 0.25); else cam(headOf(dad).add(V(-0.3, 0.0, 1.9)).add(shake(t, t < 78.5 ? 0.05 : 0)), headOf(dad).add(V(0, -0.35, 0)), 56); },
    b: () => { look('day', t); scene.background = new THREE.Color(0x30384a); faceCam(alamy, 2.2, -0.35, 0.0, 50, 0.25); } };
  if (t < 85.7) return { set: 'studio', f: () => faceCam(nashwa, 2.3, 0.5, 0.05, 40, 0.25) };
  if (t < 95.0) return { split: true, labels: ['الاستوديو', 'مباشر من السما'],
    a: () => { look('studio', t); faceCam(nashwa, 2.1, 0.25, 0.05, 50, 0.25); },
    b: () => { look('sky', t); camera.far = 900; const h = headOf(bastam); const tp = tuk2.position; cam(tp.clone().add(V(Math.sin(t * 0.3 + 1.2) * 4.2, 1.6, Math.cos(t * 0.3 + 1.2) * 4.2)).add(shake(t, 0.05)), h.clone().add(V(0, -0.6, 0)), 56); } };
  if (t < 100.9) return { set: 'sky', f: () => {
    const h = headOf(bastam); tuk2.updateMatrixWorld(true);
    const fw = V(-1, 0, 0).applyQuaternion(tuk2.getWorldQuaternion(new THREE.Quaternion())); fw.y = 0; fw.normalize(); const sd = V(fw.z, 0, -fw.x);
    if (t < 99.0) { const tgt = t < 96.9 ? V(SKX - 80, 0, -90) : VL(V(SKX - 80, 0, -90), V(SKX + 45, 0, 10), easeInOut(seg(t, 96.9, 97.9)));
      cam(h.clone().sub(fw.clone().multiplyScalar(1.6)).add(sd.multiplyScalar(4.2)).add(V(0, 1.4, 0)), h.clone().add(tgt.clone().sub(h).normalize().multiplyScalar(5.0)), 66); }
    else cam(h.clone().add(fw.clone().multiplyScalar(2.3)).add(V(0, 0.05, 0)).add(shake(t, 0.05)), h.clone().add(V(0, -0.15, 0)), 50); } };
  if (t < 107.1) return { twoD: 'weather' };
  if (t < 111.0) return { set: 'studio', f: () => { cam(V(S + 0.5, 1.75, 3.6).add(shake(t, t < T_POP + 0.3 ? 0.06 : 0)), V(S + 0.6, 1.4, -0.8), 46); } };
  if (t < 112.4) return { set: 'studio', f: () => faceCam(nashwa, 1.8, 0.3, 0.05, 40, 0.2) };
  if (t < T_PLUG) return { set: 'studio', f: () => cam(V(S + 2.6, 0.55, 1.6), V(S + 2.05, 0.1, 0.5), 44) };
  if (t < 113.4) return { set: 'studio', f: () => cam(V(S + 0.5, 1.75, 3.6).add(shake(t, 0.3)), V(S + 0.6, 1.3, -0.8), 50) };
  if (t < T_HOME) return { twoD: 'nosignal' };
  return { set: 'home', f: () => {
    const h = headOf(mom);
    if (t < 118.9) { const k = easeInOut(seg(t, T_HOME, 118.9)); cam(VL(V(-0.6, 1.4, -1.6), V(-0.85, 1.35, -0.2), k), h.clone().add(V(0, -0.1, 0)), 46); }
    else if (t < 120.4) cam(h.clone().add(V(0.1, 0.05, -1.25)).add(shake(t, 0.08)), h.clone().add(V(0, -0.05, 0)), 46);
    else { const k = easeInOut(seg(t, 120.4, 128)); cam(VL(V(-0.6, 1.5, -1.4), V(0.6, 2.2, -3.2), k), VL(h, V(-0.6, 1.0, 1.0), k), 50); } } };
}

// ---------- 2D: news graphics ----------
const TICK = '   عاجل: بستم لسه طاير   •   سعر البطيخ المكسور: اتنين بخمسة   •   الفانلة الحمرا لسه تريند   •   أبو سمير يحذّر: ممنوع السرقة   •   المطبخ لسه بيتصلّح   •';
function drawTicker(g, t) {
  const y = 314; g.fillStyle = 'rgba(8,14,40,0.92)'; g.fillRect(0, y, W, 24); g.fillStyle = '#d8231b'; g.fillRect(W - 78, y, 78, 24);
  arText(g, 'عاجل', W - 14, y + 1, 19, '#fff'); g.save(); g.beginPath(); g.rect(0, y, W - 78, 24); g.clip();
  g.font = '17px Lalezar'; g.direction = 'rtl'; const tw = g.measureText(TICK).width; const off = (t * 70) % tw;
  for (let k = -1; k <= 1; k++) arText(g, TICK, (W - 90) + off - k * tw - tw + tw, y + 3, 17, '#ffe14a');
  g.restore();
}
function drawBug(g, t) {
  g.fillStyle = '#d8231b'; g.fillRect(16, 14, 84, 26); pxText(g, 'LIVE', 24, 22, 10, '#fff', 'left', false);
  if (Math.floor(t * 2) % 2) { g.fillStyle = '#fff'; g.beginPath(); g.arc(88, 27, 5, 0, 7); g.fill(); }
  g.fillStyle = 'rgba(8,14,40,0.85)'; g.fillRect(W - 140, 14, 124, 30); g.fillStyle = '#d8231b'; g.fillRect(W - 140, 40, 124, 4);
  arText(g, 'عاجل جدًا', W - 24, 14, 22, '#fff');
  const mm = Math.floor(t / 60), ss = Math.floor(t % 60); pxText(g, `21:${String(4 + mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`, 16, 48, 8, '#9fd0ff', 'left');
}
const LOWER = [
  [3.0, 8.8, 'نشوى', 'مذيعة نشرة «عاجل جدًا»', 0],
  [21.7, 27.6, 'عم سيد', 'شاهد عيان — بوّاب العمارة', 0],
  [43.7, 50.3, 'شحاتة', 'تاجر بطيخ مستورد (متضرر)', 0],
  [51.4, 62.0, 'إبراهيم', 'GUEST', 0],
  [71.0, 77.6, 'العالمي', 'مدير مركز الصيانة — على التليفون', 1],
  [88.2, 94.6, 'بستم', 'مباشر من السما', 1],
];
function drawLower(g, t) {
  for (const [a, b, name, role, half] of LOWER) {
    if (t < a || t >= b) continue;
    const k = easeOut(clamp((t - a) / 0.35)) * (1 - easeIn(clamp((t - b + 0.3) / 0.3)));
    const x0 = half ? W / 2 + 10 : 16, ww = half ? W / 2 - 26 : 330, x = x0 - (1 - k) * (ww + 40), y = 254;
    g.fillStyle = '#d8231b'; g.fillRect(x, y, ww, 30); g.fillStyle = 'rgba(8,14,40,0.92)'; g.fillRect(x, y + 30, ww, 22);
    arText(g, name, x + ww - 10, y + 1, 24, '#fff');
    let r = role;
    if (role === 'GUEST') {
      if (t < 53.9) r = 'المتهم الأول';
      else { r = 'الضيف: المخترع العالمي'; }
      if (t >= 53.6 && t < 54.2) { arText(g, 'المتهم الأول', x + ww - 10, y + 31, 17, '#ffe14a'); g.fillStyle = '#ffe14a'; g.fillRect(x + ww - 10 - 100 * easeOut(seg(t, 53.6, 53.9)), y + 42, 100 * easeOut(seg(t, 53.6, 53.9)), 3); continue; }
    }
    arText(g, r, x + ww - 10, y + 31, 17, '#ffe14a');
  }
}
function drawArchive(g, t) {
  g.fillStyle = 'rgba(0,0,0,0.55)'; g.fillRect(16, 14, 150, 30); g.fillStyle = '#fff'; arText(g, 'أرشيف', 158, 14, 22, '#fff'); pxText(g, 'ARCHIVE', 24, 24, 9, '#ffe14a', 'left', false);
  if (Math.floor(t * 2) % 2) { g.fillStyle = '#d8231b'; g.beginPath(); g.arc(W - 70, 30, 6, 0, 7); g.fill(); } pxText(g, 'REC', W - 58, 24, 9, '#fff', 'left');
  for (let i = 0; i < 3; i++) { const yy = ((t * 90 + i * 160) % (H + 40)) - 20; g.fillStyle = 'rgba(255,255,255,0.08)'; g.fillRect(0, yy, W, 3); }
}
function drawSplitFrame(g, labels) {
  g.fillStyle = '#fff'; g.fillRect(W / 2 - 2, 0, 4, H);
  for (const [i, s] of labels.entries()) { const x = i ? W - 16 : W / 2 - 16; g.fillStyle = 'rgba(8,14,40,0.85)'; g.fillRect(x - 130, 52, 130, 26); arText(g, s, x - 8, 52, 19, i ? '#ffe14a' : '#fff'); }
}
function drawWeather(g, t) {
  const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#0a3a8a'); gr.addColorStop(1, '#04163e'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
  g.fillStyle = '#2f7fc8'; g.fillRect(0, 60, W, 44);
  const pts = [[160, 100], [300, 92], [380, 98], [430, 106], [500, 92], [482, 150], [458, 196], [440, 160], [432, 140], [448, 230], [502, 330], [160, 330]];
  g.fillStyle = '#e0c070'; g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.closePath(); g.fill(); g.strokeStyle = '#fff'; g.lineWidth = 2; g.stroke();
  g.strokeStyle = '#2f7fc8'; g.lineWidth = 4; g.beginPath(); g.moveTo(362, 330); g.lineTo(370, 240); g.lineTo(362, 152); g.stroke();
  g.lineWidth = 3; for (const dx of [-30, -12, 8, 26]) { g.beginPath(); g.moveTo(362, 152); g.lineTo(362 + dx, 104); g.stroke(); }
  const city = (x, y, n) => { g.fillStyle = '#fff'; g.beginPath(); g.arc(x, y, 4, 0, 7); g.fill(); arText(g, n, x - 8, y - 8, 15, '#04163e'); };
  city(318, 110, 'إسكندرية'); city(364, 156, 'القاهرة'); city(398, 270, 'الأقصر');
  const sunI = (x, y) => { g.fillStyle = '#ffd400'; g.beginPath(); g.arc(x, y, 12, 0, 7); g.fill(); g.strokeStyle = '#ffd400'; g.lineWidth = 3; for (let i = 0; i < 8; i++) { const a = i / 8 * 6.28 + t; g.beginPath(); g.moveTo(x + Math.cos(a) * 16, y + Math.sin(a) * 16); g.lineTo(x + Math.cos(a) * 22, y + Math.sin(a) * 22); g.stroke(); } };
  sunI(250, 200); sunI(430, 290); pxText(g, '34°', 236, 222, 10, '#fff'); pxText(g, '41°', 416, 312, 10, '#fff');
  // Bastam's flight path over Greater Cairo
  const k = clamp((t - 101.5) / 4.5); const path = (u) => [300 + u * 90 + Math.sin(u * 9) * 18, 70 + u * 80 + Math.cos(u * 7) * 14];
  g.strokeStyle = 'rgba(255,255,255,0.8)'; g.setLineDash([6, 6]); g.lineWidth = 2; g.beginPath(); for (let u = 0; u <= k; u += 0.02) { const [x, y] = path(u); u ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke(); g.setLineDash([]);
  const [bx, by] = path(k); g.fillStyle = '#d8231b'; g.fillRect(bx - 16, by + 4, 32, 14); g.fillStyle = '#111'; g.fillRect(bx - 13, by + 17, 6, 6); g.fillRect(bx + 7, by + 17, 6, 6); g.fillStyle = '#b07a50'; g.beginPath(); g.arc(bx, by, 11, 0, 7); g.fill(); g.fillStyle = '#d8231b'; g.beginPath(); g.arc(bx, by - 3, 11, Math.PI, 0); g.fill(); g.fillStyle = '#111'; g.fillRect(bx - 5, by + 1, 3, 3); g.fillRect(bx + 2, by + 1, 3, 3);
  if (t > 103.9) { const a = easeBack(seg(t, 103.9, 104.3)); g.save(); g.translate(452, 150); g.scale(a, a); g.fillStyle = '#d8231b'; g.fillRect(-92, -26, 184, 54); g.strokeStyle = '#fff'; g.lineWidth = 2; g.strokeRect(-92, -26, 184, 54); arText(g, 'احتمال سقوط بستم', 82, -24, 18, '#fff'); pxText(g, '90%', 0, 6, 14, '#ffe14a', 'center'); g.restore(); }
  g.fillStyle = '#d8231b'; g.fillRect(0, 0, W, 56); arText(g, 'النشرة الجوية', W - 20, 6, 32, '#fff'); pxText(g, 'WEATHER', 20, 22, 12, '#ffe14a', 'left');
}
function drawNoSignal(g, t) {
  const cols = ['#c0c0c0', '#c0c000', '#00c0c0', '#00c000', '#c000c0', '#c00000', '#0000c0'];
  if (t < T_PLUG + 0.9) { cols.forEach((c, i) => { g.fillStyle = c; g.fillRect(i * W / 7, 0, W / 7 + 1, H); }); }
  else { g.fillStyle = '#000'; g.fillRect(0, 0, W, H); }
  for (let i = 0; i < 900; i++) { const v = (hash(i + Math.floor(t * 30) * 13) * 255) | 0; g.fillStyle = `rgba(${v},${v},${v},0.85)`; g.fillRect((hash(i * 3 + Math.floor(t * 30)) * W) | 0, (hash(i * 7 + 2 + Math.floor(t * 30)) * H) | 0, 6, 3); }
  g.fillStyle = 'rgba(0,0,0,0.75)'; g.fillRect(W / 2 - 170, H / 2 - 52, 340, 92);
  arText(g, 'لا توجد إشارة', W / 2, H / 2 - 50, 40, '#fff', 'center'); pxText(g, 'NO SIGNAL', W / 2, H / 2 + 12, 14, '#ffe14a', 'center');
}
function drawIntro(g, t) {
  if (t >= 2.7) return;
  const a = easeBack(seg(t, 0.15, 0.55)), out = easeIn(seg(t, 2.2, 2.6));
  g.save(); g.translate(W / 2 - out * W * 1.2, 200); g.scale(a, a);
  g.fillStyle = '#d8231b'; g.fillRect(-230, -60, 460, 120); g.strokeStyle = '#fff'; g.lineWidth = 4; g.strokeRect(-230, -60, 460, 120);
  arText(g, 'عاجل!', 0, -62, 92, '#fff', 'center', 'ReemKufi'); g.fillStyle = '#04163e'; g.fillRect(-230, 60, 460, 30); pxText(g, 'BREAKING NEWS', 0, 68, 14, '#ffe14a', 'center');
  g.restore();
  for (let i = 0; i < 5; i++) { const x = ((t * 900 + i * 160) % (W + 200)) - 100; g.fillStyle = 'rgba(255,255,255,0.18)'; g.fillRect(x, 0, 10, H); }
}
function drawEnd(g, t) {
  if (t < 120.4) return;
  { const a = easeOut(seg(t, 120.5, 120.9)); g.fillStyle = `rgba(0,0,0,${0.45 * a})`; g.fillRect(0, 0, W, H);
    g.save(); g.globalAlpha = a; g.fillStyle = 'rgba(20,20,30,0.95)'; g.fillRect(60, 40, W - 120, 92); g.strokeStyle = '#d8231b'; g.lineWidth = 3; g.strokeRect(60, 40, W - 120, 92);
    pxText(g, 'BROADCAST LOST', 80, 54, 14, '#ff5a4a', 'left', false); pxText(g, 'SIGNAL', 80, 92, 10, '#fff', 'left', false);
    for (let i = 0; i < 10; i++) { g.fillStyle = '#333'; g.fillRect(170 + i * 24, 86, 18, 22); } pxText(g, '0%', 430, 92, 12, '#ff5a4a', 'left', false);
    arText(g, 'الإرسال انقطع', W - 80, 50, 26, '#fff'); g.restore(); }
  if (t >= 124.4 && t < 129.4) { const k = easeBack(seg(t, 124.4, 124.75)); g.save(); g.translate(W / 2, 236); g.scale(k, k); g.fillStyle = 'rgba(0,0,30,0.9)'; g.fillRect(-250, -40, 500, 84); g.strokeStyle = '#ffe14a'; g.lineWidth = 3; g.strokeRect(-250, -40, 500, 84);
    g.fillStyle = '#ffe14a'; g.beginPath(); for (let i = 0; i < 10; i++) { const a = i / 10 * 6.28 - Math.PI / 2, r = i % 2 ? 9 : 20; g.lineTo(-206 + Math.cos(a) * r, 2 + Math.sin(a) * r); } g.fill();
    pxText(g, 'ACHIEVEMENT UNLOCKED', 30, -28, 11, '#ffe14a', 'center', false); arText(g, 'كارثة على الهوا', 30, -8, 34, '#fff', 'center'); g.restore(); }
  if (t >= 129.4) { const k = easeOut(seg(t, 129.4, 129.8)); g.fillStyle = `rgba(0,0,0,${0.7 * k})`; g.fillRect(0, 0, W, H); g.save(); g.translate(W / 2, 200); g.scale(k, k); arText(g, 'يُتبع...', 0, -40, 54, '#ffe14a', 'center', 'ReemKufi'); pxText(g, 'TO BE CONTINUED', 0, 30, 16, '#fff', 'center'); g.restore(); }
  if (t > 132.0) { g.fillStyle = `rgba(0,0,0,${clamp((t - 132.0) / 0.8)})`; g.fillRect(0, 0, W, H); }
}

// ---------- names + portraits for the dialogue box ----------
const NAMES = { nashwa: ['نشوى', 'NASHWA', '#d8231b'], sayed: ['عم سيد', 'UNCLE SAYED', '#6b5a48'], shehata: ['شحاتة', 'SHEHATA', '#3a5aa8'], dad: ['إبراهيم', 'IBRAHIM', '#c9a227'], alamy: ['العالمي', 'EL-ALAMY', '#151518'], bastam: ['بستم', 'BASTAM', '#2f5fb0'], mom: ['أم حمادة', 'OM HAMADA', '#1f9e5a'] };
function portrait(g, x, y, who, t) {
  g.fillStyle = '#123'; g.fillRect(x, y, 64, 64); g.strokeStyle = '#fff'; g.lineWidth = 2; g.strokeRect(x, y, 64, 64);
  g.save(); g.beginPath(); g.rect(x + 2, y + 2, 60, 60); g.clip();
  const skin = { nashwa: '#d09a70', sayed: '#8a5a3a', shehata: '#9a6440', dad: '#b27448', alamy: '#c08a60', bastam: '#b07a50', mom: '#c98d5f' }[who];
  const shirt = { nashwa: '#c8202a', sayed: '#6b5a48', shehata: '#e8eef8', dad: '#f3f0e3', alamy: '#151518', bastam: '#2f5fb0', mom: '#e86a8a' }[who];
  g.fillStyle = shirt; g.fillRect(x + 8, y + 54, 48, 10);
  if (who === 'nashwa') { g.fillStyle = '#2a1810'; g.fillRect(x + 10, y + 20, 44, 34); g.fillStyle = '#f6f6f2'; g.beginPath(); g.moveTo(x + 26, y + 54); g.lineTo(x + 38, y + 54); g.lineTo(x + 32, y + 63); g.fill(); }
  if (who === 'mom') { g.fillStyle = '#1f9e5a'; g.beginPath(); g.arc(x + 32, y + 36, 25, 0, 7); g.fill(); }
  g.fillStyle = skin; g.beginPath(); g.arc(x + 32, y + 36, 20, 0, 7); g.fill();
  if (who === 'nashwa') { g.fillStyle = '#2a1810'; g.beginPath(); g.arc(x + 32, y + 30, 21, Math.PI, 0); g.fill(); }
  if (who === 'mom') { g.fillStyle = '#1f9e5a'; g.beginPath(); g.arc(x + 32, y + 30, 22, Math.PI, 0); g.fill(); }
  if (who === 'sayed') { g.fillStyle = '#f4f2ea'; g.beginPath(); g.ellipse(x + 32, y + 18, 22, 9, 0, 0, 7); g.fill(); }
  if (who === 'shehata') { g.fillStyle = '#f2f2f2'; g.beginPath(); g.arc(x + 32, y + 26, 21, Math.PI, 0); g.fill(); }
  if (who === 'bastam') { g.fillStyle = '#d8231b'; g.beginPath(); g.arc(x + 32, y + 26, 21, Math.PI, 0); g.fill(); }
  if (who === 'alamy') { g.fillStyle = '#101013'; g.fillRect(x + 24, y + 50, 16, 14); g.fillStyle = '#b9bcc4'; g.fillRect(x + 23, y + 54, 2, 10); g.fillRect(x + 39, y + 54, 2, 10); g.fillStyle = '#0c0a09'; g.beginPath(); g.arc(x + 32, y + 29, 20.5, Math.PI, 0); g.fill(); g.beginPath(); g.ellipse(x + 34, y + 12, 15, 5, -0.1, 0, 7); g.fill(); g.fillRect(x + 11, y + 28, 4, 9); g.fillRect(x + 49, y + 28, 4, 9); }
  if (who === 'dad') { g.fillStyle = '#1b1410'; g.fillRect(x + 10, y + 30, 5, 12); g.fillRect(x + 49, y + 30, 5, 12); g.fillStyle = '#c9a227'; g.fillRect(x + 14, y + 16, 36, 5); }
  const fc = document.createElement('canvas'); fc.width = 32; fc.height = 32; const fg = fc.getContext('2d');
  const e = envAt(t); const mouth = speakerAt(t) === who ? (e < 0.1 ? 'closed' : e < 0.4 ? 'talk1' : 'talk2') : 'closed';
  const eyes = { nashwa: 'default', sayed: 'tired', shehata: 'angry', dad: 'smug', alamy: 'smug', bastam: 'wide', mom: 'angry' }[who];
  drawFace(fg, 32, eyes, mouth, { stache: who === 'dad' || who === 'sayed' || who === 'shehata', stacheColor: who === 'sayed' ? '#dddddd' : undefined, fuzz: who === 'bastam', blush: who === 'nashwa' });
  g.imageSmoothingEnabled = false; g.drawImage(fc, x + 14, y + 20, 36, 36); g.restore();
}

// ---------- particles ----------
function particles(t) {
  const stars = [], puffs = [], trails = [];
  // pan sparks before the blackout
  if (t >= 32.0 && t < T_OUT + 0.3) for (let i = 0; i < 10; i++) { const k = (t * 2.2 + i * 0.1) % 1; stars.push({ pos: PAN_W.clone().add(V((hash(i) - .5) * 1.4 * k, 0.2 + k * 1.2, (hash(i + 4) - .5) * k)), size: 0.2 * (1 - k), color: 0xffd040 }); }
  // kitchen explosion
  { const a = t - T_EXPLODE; if (a > 0 && a < 2.3) { for (let i = 0; i < 14; i++) { const k = Math.min(1, a * (0.8 + hash(i) * 0.6)); puffs.push({ pos: V(K + 1.6 + (hash(i + 1) - .5) * 3 * k, 0.8 + k * 1.6 * hash(i + 2), -1.6 + (hash(i + 3) - .2) * 2 * k), size: 0.5 + k * 1.4, op: 1 - a / 2.3, color: i % 3 ? 0x555555 : 0xff8a30 }); }
      for (let i = 0; i < 10; i++) { const k = a * 3; stars.push({ pos: V(K + 1.6 + Math.cos(i) * k, 1.0 + Math.sin(i * 2) * k * 0.5 + 0.3, -1.4 + Math.sin(i) * k * 0.5), size: 0.3 * Math.max(0, 1 - a), color: 0xffe14a }); } }
    if (t > 14.5 && t < T_EXPLODE) for (let i = 0; i < 4; i++) { const k = (t * 1.5 + i * 0.25) % 1; puffs.push({ pos: V(K + 2.05 + k * 0.4, 1.05 + k * 0.5, -1.7), size: 0.15 + k * 0.4, op: 0.8 * (1 - k), color: 0x777777 }); } }
  // sky tuk exhaust
  if (t >= 85.0 && t < 101) { const q = tuk2.getWorldQuaternion(new THREE.Quaternion()); const dir = V(1, 0, 0).applyQuaternion(q); const base = V(0.9, 0.6, 0).applyMatrix4(tuk2.matrixWorld); for (let i = 0; i < 10; i++) { const ph = (t * 3.5 + i / 10) % 1; trails.push({ pos: base.clone().add(dir.clone().multiplyScalar(0.3 + ph * 2.2)), size: 0.35 + ph * 0.5, op: 1 - ph, color: ph < 0.3 ? 0xffa030 : 0xdddddd }); } }
  // tuk trail
  if (t >= 38.4 && t < T_CRASH) { const tp = tuk.getWorldPosition(V(0, 0, 0)); for (let i = 0; i < 10; i++) trails.push({ pos: tp.clone().add(V(-0.8 - i * 0.45, 0.6 + i * 0.12, -i * 0.15)), size: 0.5 + i * 0.08, op: 1 - i / 10, color: i < 2 ? 0xffa030 : 0xdddddd }); }
  { const a = t - T_CRASH; if (a > 0 && a < 1.8) for (let i = 0; i < 12; i++) { const k = Math.min(1, a * 1.5); puffs.push({ pos: V(MK + 0.2 + (hash(i) - .5) * 4 * k, 0.5 + hash(i + 1) * 2 * k, -2.4 + (hash(i + 2) - .5) * 2 * k), size: 0.6 + k, op: 1 - a / 1.8, color: 0xc8b890 }); } }
  // studio plug sparks
  if (t >= T_PLUG && t < 113.4) { for (let i = 0; i < 12; i++) { const k = ((t - T_PLUG) * 4 + i * 0.08) % 1; const o = i % 2 ? booster.position : V(S + 2.15, 0.1, 0.5); stars.push({ pos: o.clone().add(V(Math.cos(i * 2.3) * k * 0.9, Math.sin(i * 1.7) * k * 0.6 + 0.2, Math.sin(i) * k * 0.4)), size: 0.18 * (1 - k), color: i % 3 ? 0x9fd0ff : 0xffffff }); } }
  emit(stars, starPool); emit(puffs, puffPool); emit(trails, trailPool); emit([], sweatPool);
}

// ---------- TV static at home ----------
function drawHomeTV(t) {
  const g = tvTex.userData.g; for (let i = 0; i < 220; i++) { const v = (hash(i + Math.floor(t * 24) * 11) * 255) | 0; g.fillStyle = `rgb(${v},${v},${v})`; g.fillRect((hash(i * 3 + Math.floor(t * 24)) * 128) | 0, (hash(i * 7 + Math.floor(t * 24)) * 96) | 0, 10, 5); } tvTex.needsUpdate = true;
}

function fullView() { renderer.setScissorTest(false); renderer.setViewport(0, 0, W, H); camera.aspect = W / H; camera.updateProjectionMatrix(); }
window.renderFrame = function (t) {
  stateAt(t); drawWall(t); particles(t);
  const s = shotAt(t);
  ctx.clearRect(0, 0, W, H);
  if (s.twoD) { /* 2D only */ }
  else if (s.split) {
    renderer.setScissorTest(true); renderer.setClearColor(0x000000, 1);
    for (const [i, fn] of [[0, s.a], [1, s.b]]) { mic.visible = false; micArm.visible = false; fn(); camera.aspect = (W / 2) / H; camera.updateProjectionMatrix(); renderer.setViewport(i * W / 2, 0, W / 2, H); renderer.setScissor(i * W / 2, 0, W / 2, H); renderer.render(scene, camera); }
    fullView(); ctx.drawImage(glCanvas, 0, 0);
  } else {
    look(s.set, t); fullView(); s.f(); camera.aspect = W / H; camera.updateProjectionMatrix();
    if (s.set === 'home') drawHomeTV(t);
    renderer.render(scene, camera);
    if (s.archive) ctx.filter = 'sepia(0.55) saturate(0.85) contrast(1.08)';
    ctx.drawImage(glCanvas, 0, 0); ctx.filter = 'none';
  }
  h.clearRect(0, 0, W, H);
  if (s.twoD === 'weather') drawWeather(h, t);
  if (s.twoD === 'nosignal') drawNoSignal(h, t);
  const news = !s.twoD && s.set !== 'home';
  if (s.archive) drawArchive(h, t); else if (news) drawBug(h, t);
  if (s.split) drawSplitFrame(h, s.labels);
  if (news || s.twoD === 'weather') drawTicker(h, t);
  if (news) drawLower(h, t);
  drawIntro(h, t);
  if (s.set === 'kitchen' && t >= T_EXPLODE + 0.4) { const k = easeBack(seg(t, T_EXPLODE + 0.4, T_EXPLODE + 0.7)); h.save(); h.translate(W / 2, 150); h.scale(k, k); h.fillStyle = 'rgba(20,0,0,0.85)'; h.fillRect(-200, -34, 400, 68); h.strokeStyle = '#ff3a2a'; h.lineWidth = 3; h.strokeRect(-200, -34, 400, 68); pxText(h, 'KITCHEN HEALTH: 0%', 0, -18, 14, '#ff5a4a', 'center'); arText(h, 'صحة المطبخ: صفر', 0, -2, 22, '#fff', 'center'); h.restore(); }
  drawDialogue(h, t);
  drawEnd(h, t);
  ctx.drawImage(hud, 0, 0); vignette(ctx, 0.3);
  if (t >= T_EXPLODE && t < T_EXPLODE + 0.08) { ctx.fillStyle = 'rgba(255,240,200,0.85)'; ctx.fillRect(0, 0, W, H); }
  if (t >= T_OUT && t < T_OUT + 0.06) { ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.fillRect(0, 0, W, H); }
  if (t >= T_CRASH && t < T_CRASH + 0.07) { ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.fillRect(0, 0, W, H); }
  if (t >= T_PLUG && t < T_PLUG + 0.1) { ctx.fillStyle = 'rgba(200,230,255,0.9)'; ctx.fillRect(0, 0, W, H); }
  if (t >= 116.2 && t < T_HOME) { ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); }
  return true;
};
window.frameData = () => out.toDataURL('image/png');
window.DUR = DUR;
document.fonts.load('10px PS2P').then(() => document.fonts.load('20px Lalezar', 'ع')).then(() => document.fonts.load('700 20px ReemKufi', 'ع')).then(() => {
  lateDraw.forEach(f => f()); window.READY = true;
});
