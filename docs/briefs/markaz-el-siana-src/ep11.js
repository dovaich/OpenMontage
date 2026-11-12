
// =====================================================================
// مركز الصيانة — the service center (new cast: Bastam, El-Alamy, El-Asly, El-Gazzar)
// =====================================================================
room.visible = false; hallway.visible = false; balcony.visible = false;
const T_LAND = 4.7, T_LAPTOP = 25.0, T_FIX = 60.1, T_START = 61.6, T_LAUNCH = 63.0, T_RES = 65.4, T_ENDC = 74.1;
const garage = new THREE.Group(); scene.add(garage);
const concT = canvasTex(32, 32, (g) => { g.fillStyle = '#8a8a8e'; g.fillRect(0, 0, 32, 32); const r = rng(3); for (let i = 0; i < 60; i++) { g.fillStyle = r() > .5 ? '#9a9a9e' : '#7a7a7e'; g.fillRect(r() * 32 | 0, r() * 32 | 0, 2, 2); } g.fillStyle = 'rgba(20,20,20,0.5)'; g.beginPath(); g.ellipse(20, 12, 7, 4, 0.3, 0, 7); g.fill(); g.fillStyle = '#e8c020'; g.fillRect(0, 30, 32, 2); }, [8, 6]);
const metalT = canvasTex(16, 32, (g) => { g.fillStyle = '#6f8fa8'; g.fillRect(0, 0, 16, 32); g.fillStyle = '#5a7890'; for (let x = 0; x < 16; x += 4) g.fillRect(x, 0, 2, 32); g.fillStyle = '#8aa8c0'; g.fillRect(1, 0, 1, 32); }, [14, 2]);
const signT = canvasTex(160, 32, (g) => { g.fillStyle = '#d8231b'; g.fillRect(0, 0, 160, 32); g.fillStyle = '#fff'; g.fillRect(0, 0, 160, 3); g.fillRect(0, 29, 160, 3); });
const gw = (w, h, x, y, z, ry, mat) => { const m = mesh(new THREE.PlaneGeometry(w, h), mat, x, y, z, garage); m.rotation.y = ry; return m; };
const metalM = M(0xffffff, { map: metalT });
gw(14, 5, 0, 2.5, -5, 0, metalM); gw(10, 5, -7, 2.5, 0, Math.PI / 2, metalM);
gw(3, 5, 7, 2.5, -3.5, -Math.PI / 2, metalM); gw(3, 5, 7, 2.5, 3.5, -Math.PI / 2, metalM); gw(4, 1.2, 7, 4.4, 0, -Math.PI / 2, metalM); // big open door x=7, z -2..2
const doorSky = gw(4.2, 3.8, 7.6, 1.9, 0, -Math.PI / 2, new THREE.MeshBasicMaterial({ color: 0xbfe0ff }));
const gfloor = mesh(new THREE.PlaneGeometry(14, 10), M(0xffffff, { map: concT }), 0, 0, 0, garage); gfloor.rotation.x = -Math.PI / 2;
const gceil = mesh(new THREE.PlaneGeometry(14, 10), M(0x5a5a60), 0, 5, 0, garage); gceil.rotation.x = Math.PI / 2;
const sign = mesh(new THREE.PlaneGeometry(6.4, 1.28), new THREE.MeshBasicMaterial({ map: signT }), 0, 4.1, -4.97, garage);
for (let i = -2; i <= 2; i++) { mesh(box(1.6, 0.06, 0.15), M(0xdddddd), i * 2.8, 4.9, -0.5, garage); mesh(cyl(0.04, 0.04, 1.5, 6), new THREE.MeshBasicMaterial({ color: 0xf0fff4 }), i * 2.8, 4.85, -0.5, garage).rotation.z = Math.PI / 2; }
// tool board with wrenches
const board = mesh(box(3.2, 1.6, 0.06), M(0xc8a060), -3.8, 2.2, -4.95, garage);
{ const r = rng(5); for (let i = 0; i < 14; i++) { const t = mesh(box(0.06, 0.35 + r() * 0.3, 0.03), P(0xb8c0c8, { shininess: 90 }), -5.2 + i * 0.2, 2.2 + (r() - .5) * 0.6, -4.9, garage); t.rotation.z = (r() - .5) * 0.3; } }
// tire stacks + oil barrels
for (const [x, z] of [[-6.2, -4.2], [-6.2, -3.2], [5.6, -4.3]]) for (let k = 0; k < 4; k++) mesh(new THREE.TorusGeometry(0.38, 0.16, 6, 12), M(0x1a1a1a), x, 0.16 + k * 0.32, z, garage).rotation.x = Math.PI / 2;
for (const [x, z, c] of [[-6.3, 1.5, 0x1f5fd8], [-6.3, 2.4, 0xd8231b], [-5.5, 2.0, 0x1f5fd8]]) { mesh(cyl(0.32, 0.32, 0.95, 10), M(c), x, 0.475, z, garage); mesh(new THREE.TorusGeometry(0.32, 0.03, 4, 10), M(0x111111), x, 0.65, z, garage).rotation.x = Math.PI / 2; }
// car lift with a raised sedan
const lift = new THREE.Group(); lift.position.set(-3.6, 0, -2.4); garage.add(lift);
for (const s of [-1, 1]) mesh(box(0.25, 3.0, 0.25), M(0xe8c020), s * 1.5, 1.5, 0, lift);
mesh(box(3.2, 0.12, 1.4), M(0x333333), 0, 1.6, 0, lift);
const sedan = new THREE.Group(); sedan.position.set(0, 1.7, 0); lift.add(sedan);
mesh(box(3.0, 0.55, 1.35), M(0xf2f2f2), 0, 0.35, 0, sedan); mesh(box(1.5, 0.5, 1.25), M(0x223344), -0.1, 0.85, 0, sedan);
for (const [x, z] of [[-1.0, 0.68], [1.0, 0.68], [-1.0, -0.68], [1.0, -0.68]]) mesh(cyl(0.3, 0.3, 0.18, 10), M(0x111111), x, 0.2, z, sedan).rotation.x = Math.PI / 2;
// a second car on the floor with its hood up (El-Gazzar's spot)
const car2 = new THREE.Group(); car2.position.set(2.6, 0, -3.3); garage.add(car2);
mesh(box(3.0, 0.55, 1.35), M(0x1f5fd8), 0, 0.55, 0, car2); mesh(box(1.5, 0.5, 1.25), M(0x223344), 0.2, 1.05, 0, car2);
const hood = mesh(box(0.9, 0.05, 1.3), M(0x1f5fd8), -1.5, 1.25, 0, car2); hood.rotation.z = -1.0;
for (const [x, z] of [[-1.0, 0.68], [1.0, 0.68], [-1.0, -0.68], [1.0, -0.68]]) mesh(cyl(0.3, 0.3, 0.18, 10), M(0x111111), x, 0.3, z, car2).rotation.x = Math.PI / 2;
// El-Alamy's office corner: glass box + desk + monitor
const office = new THREE.Group(); office.position.set(4.4, 0, 2.6); garage.add(office);
mesh(box(1.4, 0.06, 0.7), M(0x6a4220), 0, 0.8, 0, office); for (const [x, z] of [[-0.6, -0.3], [0.6, -0.3], [-0.6, 0.3], [0.6, 0.3]]) mesh(box(0.05, 0.8, 0.05), M(0x333333), x, 0.4, z, office);
const monTex = canvasTex(64, 40, (g) => { g.fillStyle = '#0a2a5a'; g.fillRect(0, 0, 64, 40); g.fillStyle = '#3df05a'; for (let y = 4; y < 36; y += 5) g.fillRect(4, y, 20 + (y * 7 % 30), 2); });
mesh(box(0.6, 0.4, 0.05), M(0x111111), 0, 1.1, -0.2, office); mesh(new THREE.PlaneGeometry(0.55, 0.35), new THREE.MeshBasicMaterial({ map: monTex }), 0, 1.1, -0.17, office);
mesh(new THREE.PlaneGeometry(2.2, 2.6), new THREE.MeshPhongMaterial({ color: 0xcfe6ff, transparent: true, opacity: 0.18, side: THREE.DoubleSide }), 0, 1.3, 0.9, office);
// creeper board for El-Gazzar
const creeper = new THREE.Group(); garage.add(creeper);
mesh(box(0.55, 0.06, 1.5), M(0x333333), 0, 0.13, 0, creeper); for (const [x, z] of [[-0.22, -0.6], [0.22, -0.6], [-0.22, 0.6], [0.22, 0.6]]) mesh(new THREE.SphereGeometry(0.06, 5, 4), M(0x111111), x, 0.06, z, creeper);
// the laptop (El-Alamy)
const lapTex = canvasTex(128, 80, () => { });
const laptop = new THREE.Group(); scene.add(laptop);
mesh(box(0.42, 0.025, 0.3), P(0x3a3a44), 0, 0, 0, laptop);
const lidL = new THREE.Group(); lidL.position.set(0, 0.0125, -0.15); laptop.add(lidL); lidL.rotation.x = -0.35;
mesh(box(0.42, 0.28, 0.015), P(0x3a3a44), 0, 0.14, -0.008, lidL); mesh(new THREE.PlaneGeometry(0.38, 0.24), new THREE.MeshBasicMaterial({ map: lapTex }), 0, 0.14, 0.001, lidL);
let cableL = null;
const teaG = mesh(cyl(0.04, 0.035, 0.1, 6), P(0xbf5a1a, { transparent: true, opacity: 0.85 }), 0, 0, 0, scene);
const wrench = new THREE.Group(); scene.add(wrench); mesh(box(0.06, 0.55, 0.03), P(0xb8c0c8, { shininess: 90 }), 0, 0, 0, wrench); mesh(new THREE.TorusGeometry(0.07, 0.025, 4, 8, Math.PI * 1.5), P(0xb8c0c8), 0, 0.3, 0, wrench);

${TUK}
tuk.add(engine6); engine6.position.set(0.9, 0.35, 0); bay.visible = false; engine6.visible = true;
street.visible = true;

// ---------- the new cast ----------
const coverall = (c) => canvasTex(16, 16, (g) => { g.fillStyle = c; g.fillRect(0, 0, 16, 16); g.fillStyle = 'rgba(0,0,0,0.18)'; g.fillRect(7, 0, 2, 16); g.fillStyle = 'rgba(255,255,255,0.12)'; g.fillRect(2, 3, 4, 3); });
const bastam = makeChar({ seed: 61, skin: 0xb07a50, hipY: 0.84, legX: 0.11, legColor: 0x2f5fb0, shoe: 0x222222, hand: 0xb07a50,
  torsoGeo: cyl(0.24, 0.26, 0.64, 6), torsoTex: coverall('#2f5fb0'), torsoColor: 0xffffff, torsoY: 0.32, sleeve: true, sleeveColor: 0x2f5fb0, shoulderX: 0.3, shoulderY: 0.57, neckY: 0.64, headR: 0.27,
  build(head, torso, reg) { const cap = mesh(new THREE.SphereGeometry(0.28, 8, 4, 0, Math.PI * 2, 0, Math.PI * 0.42), reg(M(0xd8231b)), 0, 0.04, 0, head); mesh(box(0.3, 0.03, 0.2), reg(M(0xd8231b)), 0, 0.1, -0.3, head); mesh(box(0.12, 0.08, 0.02), reg(M(0xffffff)), 0.12, 0.45, 0.25, torso); return {}; } }, scene);
const alamy = makeChar({ seed: 71, skin: 0xc08a60, hipY: 0.84, legX: 0.11, legColor: 0x2a2a35, shoe: 0x3a2a1a, hand: 0xc08a60,
  torsoGeo: cyl(0.24, 0.25, 0.64, 6), torsoTex: canvasTex(16, 16, (g) => { g.fillStyle = '#f4f4f0'; g.fillRect(0, 0, 16, 16); g.fillStyle = '#d8231b'; g.fillRect(9, 3, 4, 3); }), torsoColor: 0xffffff, torsoY: 0.32, sleeve: true, sleeveColor: 0xf4f4f0, shoulderX: 0.3, shoulderY: 0.57, neckY: 0.64, headR: 0.27,
  build(head, torso, reg) { const hair = reg(M(0x1a120c)); mesh(box(0.5, 0.12, 0.46), hair, 0, 0.2, -0.03, head); mesh(box(0.16, 0.1, 0.1), hair, 0.12, 0.24, 0.18, head); return {}; } }, scene);
const asly = makeChar({ seed: 81, skin: 0xa86a40, hipY: 0.86, legX: 0.16, legColor: 0x6a6a6a, shoe: 0x222222, hand: 0xa86a40,
  torsoGeo: cyl(0.4, 0.54, 0.72, 8), torsoTex: coverall('#6a6a6a'), torsoColor: 0xffffff, torsoY: 0.34, sleeve: true, sleeveColor: 0x6a6a6a, shoulderX: 0.44, shoulderY: 0.62, neckY: 0.7, headR: 0.32,
  build(head, torso, reg) { mesh(box(0.08, 0.14, 0.26), reg(M(0x2a1a10)), 0.31, 0.0, -0.04, head); mesh(box(0.08, 0.14, 0.26), reg(M(0x2a1a10)), -0.31, 0.0, -0.04, head); mesh(cyl(0.3, 0.3, 0.06, 8), reg(M(0xffd400)), 0, -0.05, 0.52, torso).rotation.x = Math.PI / 2; return {}; } }, scene);
const gazzar = makeChar({ seed: 91, skin: 0xa87048, hipY: 0.84, legX: 0.11, legColor: 0x3a3a2a, shoe: 0x222222, hand: 0xa87048,
  torsoGeo: cyl(0.24, 0.26, 0.64, 6), torsoTex: canvasTex(16, 16, (g) => { g.fillStyle = '#4a4a38'; g.fillRect(0, 0, 16, 16); g.fillStyle = '#1a1a14'; g.fillRect(3, 5, 4, 3); g.fillRect(10, 11, 3, 2); }), torsoColor: 0xffffff, torsoY: 0.32, sleeve: true, sleeveColor: 0x4a4a38, shoulderX: 0.3, shoulderY: 0.57, neckY: 0.64, headR: 0.27,
  build(head, torso, reg) { const hair = reg(M(0x120c08)); const r = rng(14); for (let i = 0; i < 12; i++) { const a = r() * 6.28; mesh(new THREE.IcosahedronGeometry(0.1, 0), hair, Math.cos(a) * 0.2, 0.12 + r() * 0.1, Math.sin(a) * 0.18 - 0.08, head); } mesh(new THREE.TorusGeometry(0.27, 0.035, 4, 12), reg(M(0xd8231b)), 0, 0.12, 0, head).rotation.x = Math.PI / 2 - 0.1; return {}; } }, scene);
dad.afro.visible = false; samir.root.visible = false; cane.visible = false; mom.root.visible = false; son.root.visible = false;

// =====================================================================
const KEYS = {};
const SHOUT = { aLx: 1.0, eL: 1.8, aLz: 0.2, aRz: 0.95, eR: 1.9, hx: -0.25, bend: -0.1 };
KEYS.bastam = [
  [0, { ...SHOUT }], [2.2, { ...SHOUT, aLx: 0.9, aLz: 0.6, hy: 0.6 }, 0.2], [4.66, { aLz: 0.95, eL: 1.9, aRz: 0.95, eR: 1.9 }, 0.3],
  [10.0, { aRx: 1.2, eR: 1.8, aRz: 0.4, aLz: 0.95, eL: 1.9, hz: 0.2 }, 0.2], [15.85, { aLz: 0.95, eL: 1.9, aRx: 1.5, eR: 0.2, aRz: 0.3 }, 0.15],
  [17.0, { ...SHOUT, hy: -0.7 }, 0.15], [19.4, { aLz: 0.3, aRz: 0.3 }, 0.3], [61.8, { aLz: 2.6, aRz: 2.6, eL: 0.2, eR: 0.2 }, 0.15],
];
KEYS.dad = [
  [0, { aLz: 0.3, aRz: 0.3 }], [5.9, { aRx: 1.3, aRz: 0.5, eR: 1.0, aLz: 0.3, hx: 0.05 }, 0.2], [13.15, { aLz: 0.95, eL: 1.9, aRz: 0.95, eR: 1.9, hx: 0.1, hz: 0.12 }, 0.2],
  [19.6, { aLz: 2.3, aRz: 2.3, eL: 0.4, eR: 0.4, hx: -0.15 }, 0.12], [21.4, { aLz: 0.3, aRz: 0.3 }, 0.3],
  [28.55, { aLz: 1.5, aRz: 1.5, eL: 2.4, eR: 2.4, aLx: 0.3, aRx: 0.3, hx: -0.1 }, 0.15], [37.25, { aRx: 1.2, aRz: 0.8, eR: 1.6, aLz: 0.3, bend: 0.1, hy: 0.4 }, 0.15],
  [41.3, { aRx: 1.3, eR: 1.5, aRz: 0.2, tr: 1, aLz: 0.95, eL: 1.9 }, 0.15], [42.8, { aRx: 1.3, eR: 2.2, aRz: 0.1, aLz: 0.95, eL: 1.9, hz: 0.2 }, 0.2],
  [44.6, { aLx: 1.4, eL: 1.5, aRx: 1.4, eR: 1.5, aLz: -0.3, aRz: -0.3, bend: 0.25, hx: 0.1 }, 0.12],
];
KEYS.alamy = [
  [0, { aLx: 1.0, eL: 1.2, aRx: 1.0, eR: 1.2, aLz: -0.15, aRz: -0.15 }], [21.4, { aLx: 1.0, eL: 1.2, aRx: 1.0, eR: 1.2, aLz: -0.15, aRz: -0.15, hx: 0.1, hy: 0.3 }, 0.3],
  [27.0, { aLx: 1.0, eL: 1.2, aRx: 1.2, eR: 1.5, aLz: -0.15, aRz: 0.2, hx: 0.15, bend: 0.3 }, 0.3], [32.3, { aLx: 1.0, eL: 1.2, aRx: 1.0, eR: 1.2, aLz: -0.15, aRz: -0.15, hx: 0.3 }, 0.3],
  [39.6, { aRx: 2.5, eR: 2.2, aRz: 0.2, aLz: 0.95, eL: 1.9, hx: 0.25, bend: 0.1 }, 0.2], [41.3, { aLz: 0.95, eL: 1.9, aRz: 0.95, eR: 1.9, hx: 0.2 }, 0.3],
];
KEYS.asly = [
  [0, { aRx: 0.4, eR: 0.6, aLz: 0.3 }], [44.6, { aRz: 2.6, eR: 0.5, aRx: 0.3, aLz: 0.95, eL: 1.9, bend: 0.1, hx: -0.1 }, 0.12], [46.6, { aRz: 2.2, eR: 1.2, aRx: 0.8, aLz: 0.95, eL: 1.9, bend: 0.2 }, 0.12],
  [49.2, { aRx: 0.6, eR: 0.8, aRz: 0.3, aLz: 0.95, eL: 1.9, hy: 0.6 }, 0.3], [54.6, { aRz: 2.6, eR: 0.4, aRx: 0.3, aLx: 1.2, eL: 0.4, aLz: 0.3, bend: 0.15 }, 0.12],
];
KEYS.gazzar = [
  [0, { aLz: 0.5, aRz: 0.5, eL: 0.3, eR: 0.3 }], [49.2, { aLz: 0.4, aRx: 1.2, eR: 1.8, aRz: 0.2, hx: -0.2 }, 0.8], [57.1, { aRz: 2.4, eR: 0.5, aLz: 0.5, hx: -0.15, hz: 0.15 }, 0.6],
];
const IB_P = V(3.0, 0, 1.2), BA_P = V(0.0, 0, 0.6), AL_P = V(1.2, 0, 1.6), AS_P = V(-0.6, 0, -0.3), GA_P = V(1.2, 0, -1.6);
const TUK_P = V(2.2, 0, -0.6);
function tukAt(t) {
  if (t < 3.0) return { pos: V(10, 9, 0), rz: 0, vis: false };
  if (t < T_LAND) { const k = seg(t, 3.0, T_LAND); return { pos: VL(V(9.5, 6.5, -0.2), TUK_P, easeOut(k)), rz: lerp(-0.4, 0, k), vis: true }; }
  if (t < T_LAUNCH) { const sh = t >= T_START ? 0.04 : 0; return { pos: TUK_P.clone().add(V(noise1(t * 40) * sh, Math.abs(noise1(t * 37)) * sh, 0)), rz: noise1(t * 33) * sh, vis: true }; }
  const a = t - T_LAUNCH; return { pos: V(TUK_P.x + 4.5 * a * a, 5 * Math.max(0, a - 0.7) ** 2, TUK_P.z), rz: Math.min(0.9, Math.max(0, a - 0.7) * 1.4), vis: a < 2.4 };
}
function stateAt(t) {
  const res = t >= T_RES;
  scene.background = new THREE.Color(0x101014); scene.fog = null;
  ambient.color.setHex(0xf4f8ff); ambient.intensity = 0.95; moon.intensity = 0; tvLight.intensity = 0; hallLight.intensity = 0; balcLight.intensity = 0;
  const tp = tukAt(t); tuk.visible = tp.vis; tuk.position.copy(tp.pos); tuk.rotation.set(0, Math.PI, tp.rz);
  wheels.forEach(w => w.rotation.y = t > T_LAUNCH ? t * 40 : 0); pan6mat.emissive.setRGB(t >= T_START ? 0.9 : 0.35, t >= T_START ? 0.25 : 0.1, 0);
  // laptop screen
  { const g = lapTex.userData ? null : null; }
  { const c = lapTex.image.getContext('2d'); const w = 128, h = 80; c.imageSmoothingEnabled = false;
    if (t < 26.0) { c.fillStyle = '#0a2a5a'; c.fillRect(0, 0, w, h); c.fillStyle = '#fff'; c.font = '7px PS2P'; c.textAlign = 'center'; c.textBaseline = 'top'; c.fillText('CONNECTING...', 64, 34); }
    else if (t < 32.3) { c.fillStyle = '#000'; c.fillRect(0, 0, w, h); c.fillStyle = '#3df05a'; c.font = '6px PS2P'; c.textAlign = 'left'; c.textBaseline = 'top'; c.fillText('ECU SCAN...', 4, 6); c.fillStyle = '#ff4040'; c.fillText('OS: PRESSURE', 4, 26); c.fillText('    COOKER v3000', 4, 36); c.fillStyle = '#ffd400'; c.fillText('WARNING: STEAM', 4, 56); }
    else { c.fillStyle = '#e8eef8'; c.fillRect(0, 0, w, h); c.fillStyle = '#1f5fd8'; c.fillRect(0, 0, w, 14); c.fillStyle = '#fff'; c.font = '10px Lalezar'; c.textAlign = 'center'; c.textBaseline = 'top'; c.direction = 'rtl'; c.fillText('الشبكة المتصلة', 64, 1); c.fillStyle = '#d8231b'; c.font = '14px Lalezar'; c.fillText('أبو سمير - ممنوع السرقة', 64, 30); c.direction = 'ltr'; }
    lapTex.needsUpdate = true; }
  // ---- characters ----
  dad.extras.setGoggles(t >= 28.55 && t < 32.0);
  dad.root.visible = t >= T_LAND - 0.2 && t < T_RES + 20;
  if (t < 5.6) { const k = easeOut(seg(t, T_LAND, 5.6)); dad.root.position.copy(VL(TUK_P.clone().add(V(-0.5, 0, 0.9)), IB_P, k)); dad.root.rotation.set(0, -1.2, 0); }
  else { dad.root.position.copy(IB_P); dad.root.rotation.set(0, -1.5, 0); if (t >= 21.4) dad.root.rotation.y = -1.9; if (t >= 44.6) { dad.root.position.copy(VL(IB_P, V(3.8, 0, 2.4), easeOut(seg(t, 46.0, 46.8)))); dad.root.rotation.y = -2.0; } }
  applyPose(dad, poseAt(t, KEYS.dad));
  bastam.root.visible = true;
  if (t < 61.8) { bastam.root.position.copy(BA_P); bastam.root.rotation.set(0, t < 4.66 ? 0.3 : 1.1, 0); if (t >= 15.85 && t < 19.4) bastam.root.rotation.y = 2.2; }
  if (t >= 61.8 && t < T_LAUNCH) { const k = easeInOut(seg(t, 61.8, 62.8)); bastam.root.position.copy(VL(BA_P, TUK_P.clone().add(V(0.2, 0, 0)), k)); bastam.root.rotation.set(0, lerp(1.1, 0, k), 0); }
  if (t >= T_LAUNCH) { if (bastam.root.parent !== tuk) tuk.add(bastam.root); bastam.root.position.set(-0.4, 0.42, 0); bastam.root.rotation.set(0, Math.PI / 2, 0); }
  else if (bastam.root.parent !== scene) scene.add(bastam.root);
  const bz = poseAt(t, KEYS.bastam); if (t >= T_LAUNCH) Object.assign(bz, { y: -0.4, lL: 1.4, lR: 1.4, aLz: 2.6, aRz: 2.6, eL: 0.2, eR: 0.2, aLx: 0, aRx: 0 });
  applyPose(bastam, bz); bastam.root.visible = !res || t < T_LAUNCH + 2.4;
  alamy.root.visible = t >= 21.0;
  { const k = easeOut(seg(t, 21.0, 22.4)); alamy.root.position.copy(VL(V(4.4, 0, 3.4), AL_P, k)); alamy.root.rotation.set(0, lerp(-2.6, -1.9, k), 0); if (t >= 25.0 && t < 44.6) { alamy.root.position.copy(V(1.6, 0, 0.1)); alamy.root.rotation.y = 0.9; } if (t >= 44.6) { alamy.root.position.copy(V(3.6, 0, 0.6)); alamy.root.rotation.y = -1.3; } }
  const az = poseAt(t, KEYS.alamy); if (t >= 21.0 && t < 22.4) { const w = Math.sin(t * 7); az.lL = w * 0.4; az.lR = -w * 0.4; }
  applyPose(alamy, az);
  { const a = alamy.arms[0].hand.getWorldPosition(V(0, 0, 0)), b = alamy.arms[1].hand.getWorldPosition(V(0, 0, 0)); laptop.visible = alamy.root.visible && t < 39.6; laptop.position.copy(a.add(b).multiplyScalar(0.5)).add(V(0, -0.02, 0)); laptop.rotation.set(0, alamy.root.rotation.y + Math.PI, 0); }
  if (cableL) { scene.remove(cableL); cableL.geometry.dispose(); cableL = null; }
  if (t >= T_LAPTOP && t < 39.6) { const a = laptop.position.clone(), b = engine6.getWorldPosition(V(0, 0, 0)).add(V(0, 0.3, 0)); cableL = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([a, VL(a, b, 0.5).add(V(0, -0.8, 0)), b]), 16, 0.015, 3), M(0x222222)); scene.add(cableL); }
  asly.root.visible = t >= 44.2;
  { const k = easeOut(seg(t, 44.2, 45.4)); asly.root.position.copy(VL(V(-3.6, 0, 1.6), AS_P, k)); asly.root.rotation.set(0, lerp(1.2, 0.9, k), 0); if (t >= 49.2) asly.root.rotation.y = 1.4; }
  const sz = poseAt(t, KEYS.asly); if (t >= 44.2 && t < 45.4) { const w = Math.sin(t * 9); sz.lL = w * 0.4; sz.lR = -w * 0.4; } if ((t >= 44.6 && t < 48.9) || (t >= 54.6 && t < 56.8)) { sz.aRz += Math.sin(t * 14) * 0.2; }
  applyPose(asly, sz);
  { const hp = asly.arms[1].hand.getWorldPosition(V(0, 0, 0)); wrench.position.copy(hp).add(V(0, 0.2, 0)); wrench.rotation.set(0, asly.root.rotation.y, 0.3 + (t >= 44.6 && t < 56.8 ? Math.sin(t * 14) * 0.4 : 0)); wrench.visible = asly.root.visible; }
  // El-Gazzar: lying on the creeper under the blue car, slides out at 49.2; slides under the tuk-tuk to fix it
  gazzar.root.visible = t >= 48.6;
  let cp = V(2.3, 0, -2.2), crot = 0.0;
  if (t >= 48.6 && t < 50.2) { const k = easeOut(seg(t, 48.6, 50.2)); cp = VL(V(2.3, 0, -3.3), V(2.3, 0, -1.4), k); }
  if (t >= 50.2) cp = V(2.3, 0, -1.4);
  if (t >= 59.4) { const k = easeInOut(seg(t, 59.4, 60.2)); cp = VL(V(2.3, 0, -1.4), TUK_P.clone().add(V(0, 0, 0.3)), k); }
  if (t >= T_START) cp = TUK_P.clone().add(V(0, 0, 1.3));
  creeper.position.copy(cp); creeper.rotation.y = crot; creeper.visible = gazzar.root.visible;
  gazzar.root.position.copy(cp).add(V(0, 0.16, 0.6)); gazzar.root.rotation.set(-Math.PI / 2, 0, 0); gazzar.root.rotation.order = 'XYZ';
  const gz = poseAt(t, KEYS.gazzar); Object.assign(gz, { y: 0, lL: 0, lR: 0 });
  if (t >= 50.2 && t < 59.4) { gazzar.root.rotation.set(-Math.PI / 2 + 0.9, 0, 0); } // propped up on an elbow, chilling
  if (t >= 60.1 && t < T_START) { gz.aLz = 1.2 + Math.sin(t * 30) * 0.4; gz.aRz = 1.2 + Math.cos(t * 30) * 0.4; }
  if (t >= T_START) { gazzar.root.rotation.set(-Math.PI / 2 + 1.2, 0, 0); Object.assign(gz, { aRz: 2.3, eR: 0.4, tr: 1 }); }
  applyPose(gazzar, gz);
  { const hp = gazzar.arms[0].hand.getWorldPosition(V(0, 0, 0)); teaG.position.copy(hp).add(V(0, 0.06, 0)); teaG.visible = gazzar.root.visible && t < 59.4; }

  // ---- particles ----
  const puffs = [];
  if (t >= T_LAND - 0.1 && t < T_LAND + 0.8) { const k = seg(t, T_LAND - 0.1, T_LAND + 0.8); for (let i = 0; i < 10; i++) { const a = i / 10 * 6.28; puffs.push({ pos: TUK_P.clone().add(V(Math.cos(a) * k * 1.8, 0.2 + k * 0.4, Math.sin(a) * k * 1.4)), size: 0.3 + k * 0.7, op: (1 - k) * 0.6, color: 0xb0b0b0 }); } }
  if (t >= T_START && t < T_LAUNCH + 2.5) { const base = engine6.getWorldPosition(V(0, 0, 0)); for (let i = 0; i < 14; i++) { const ph = (t * 1.5 + i / 14) % 1; puffs.push({ pos: base.clone().add(V(0.4 + ph * 1.2, 0.4 + ph, (hash(i) - .5) * ph)), size: 0.3 + ph * 0.8, op: (1 - ph) * 0.6, color: 0x666666 }); } }
  emit(puffs, puffPool);
  const sparks = [];
  if (t >= T_FIX && t < T_START) { const p0 = TUK_P.clone().add(V(0, 0.3, 0.4)); for (let i = 0; i < 10; i++) { const k = (t * 3 + i / 10) % 1; sparks.push({ pos: p0.clone().add(V((hash(i) - .5) * k * 1.2, k * 0.8, (hash(i + 2)) * k * 0.6)), size: 0.12 * (1 - k), rot: i }); } }
  if (t >= T_LAUNCH - 0.3) { const base = engine6.getWorldPosition(V(0, 0, 0)); const q = tuk.getWorldQuaternion(new THREE.Quaternion()); const dir = V(1, 0, 0).applyQuaternion(q); for (let i = 0; i < 12; i++) { const ph = (t * 3.5 + i / 12) % 1; sparks.push({ pos: base.clone().add(dir.clone().multiplyScalar(0.4 + ph * 2.0)), size: 0.3 * (1 - ph) + 0.05, rot: i, color: 0xffa020 }); } }
  emit(sparks, starPool);
  const sw = [];
  if (t >= 28.5 && t < 44.3) { const hd = alamy.head.getWorldPosition(V(0, 0, 0)); for (let i = 0; i < 2; i++) { const k = (t * 1.0 + i * 0.5) % 1; sw.push({ pos: hd.clone().add(V((i ? 1 : -1) * 0.27, 0.18 - k * 0.5, 0)), size: 0.07, op: 1 - k }); } }
  emit(sw, sweatPool); emit([], trailPool);

  // ---- faces ----
  let be = 'wide', bm = talkMouth(t, 'bastam', 'scream') || 'closed';
  if (t >= 4.66 && t < 10) be = 'normal'; if (t >= 10 && t < 12.9) be = 'side'; if (t >= 19.4 && t < 61.8) { be = 'normal'; if (bm === 'closed') bm = 'flat'; }
  if (t >= 61.8) { be = 'pin'; bm = 'scream'; }
  let ae = 'tired', am = talkMouth(t, 'alamy') || 'flat';
  if (t >= 27.0 && t < 32.3) { ae = 'wide'; if (am === 'flat') am = 'o'; } if (t >= 32.3 && t < 39.6) ae = 'angry'; if (t >= 39.6) ae = 'tired';
  let se = 'angry', sm = talkMouth(t, 'asly', 'scream') || 'clench'; if (t >= 49.2 && t < 54.6) { sm = 'clench'; } if (t >= T_START) { se = 'pin'; sm = 'o'; }
  let ge = 'tired', gm = talkMouth(t, 'gazzar') || 'smile'; if (t >= T_START) { ge = 'closed'; gm = 'grin'; }
  let de = 'smug', dm = talkMouth(t, 'dad') || 'grin';
  if (t >= 13.15 && t < 15.6) de = 'side'; if (t >= 21.4 && t < 28.5) { de = 'pin'; if (dm === 'grin') dm = 'o'; } if (t >= 37.25 && t < 39.3) { de = 'side'; } if (t >= 44.6) { de = 'pin'; if (dm === 'grin') dm = 'wobble'; } if (t >= T_LAUNCH) { de = 'sparkle'; dm = 'grin'; }
  bastam.faceMat.map = faceTexture(be, bm, { fuzz: true }); bastam.faceMat.needsUpdate = true;
  alamy.faceMat.map = faceTexture(ae, am, { glasses: true }); alamy.faceMat.needsUpdate = true;
  asly.faceMat.map = faceTexture(se, sm, { stache: true, red: t >= 44.6 && t < 57 }); asly.faceMat.needsUpdate = true;
  gazzar.faceMat.map = faceTexture(ge, gm, { fuzz: true }); gazzar.faceMat.needsUpdate = true;
  dad.faceMat.map = faceTexture(de, dm, { stache: true }); dad.faceMat.needsUpdate = true;
}

function cameraAt(t) {
  if (t < 1.0) { cam(V(6.2, 3.2, 5.2), V(0.4, 1.0, -1.0), 58); }
  else if (t < 3.0) { faceCam(bastam, 1.7, 0.3, 0.05, 50, 0.1); }
  else if (t < 5.9) { cam(V(-1.2, 1.6, 3.8), V(3.8, 1.3, -0.4), 56); }
  else if (t < 10.0) { faceCam(dad, 1.8, 0.4, 0.05, 50, 0.15); }
  else if (t < 13.15) { faceCam(bastam, 1.4, -0.3, 0.05, 48, 0.1); }
  else if (t < 15.85) { faceCam(dad, 1.4, -0.3, 0.05, 46, 0.1); }
  else if (t < 19.6) { faceCam(bastam, 1.6, 0.4, 0.05, 50, 0.1); }
  else if (t < 21.4) { faceCam(dad, 1.4, 0.2, 0.05, 46, 0.1); }
  else if (t < T_LAPTOP) { cam(V(0.6, 1.5, 3.6), V(2.2, 1.2, 1.2), 52); }
  else if (t < 28.55) { const hd = alamy.head.getWorldPosition(V(0, 0, 0)); const f = alamy.root.getWorldDirection(V(0, 0, 0)); f.y = 0; f.normalize(); const rt = V(f.z, 0, -f.x); cam(hd.clone().add(f.clone().multiplyScalar(-0.3)).add(rt.multiplyScalar(0.55)).add(V(0, 0.25, 0)), laptop.position.clone().add(V(0, 0.12, 0)), 46); }
  else if (t < 32.3) { faceCam(dad, 1.3, -0.75, 0.1, 50, 0.12); }
  else if (t < 37.25) { const k = seg(t, 32.3, 37.25); if (k < 0.5) { const hd = alamy.head.getWorldPosition(V(0, 0, 0)); const f = alamy.root.getWorldDirection(V(0, 0, 0)); f.y = 0; f.normalize(); const rt = V(f.z, 0, -f.x); cam(hd.clone().add(f.clone().multiplyScalar(-0.3)).add(rt.multiplyScalar(0.55)).add(V(0, 0.25, 0)), laptop.position.clone().add(V(0, 0.12, 0)), 44); } else faceCam(alamy, 1.3, 0.3, 0.05, 46, 0.1); }
  else if (t < 39.6) { faceCam(dad, 1.3, -0.75, 0.1, 48, 0.1); }
  else if (t < 41.3) { faceCam(alamy, 1.2, -0.2, 0.05, 44, 0.08); }
  else if (t < 44.6) { faceCam(dad, 1.3, -0.75, 0.1, 48, 0.1); }
  else if (t < 49.2) { faceCam(asly, 2.1, 0.3, 0.0, 52, 0.15); camera.position.add(shake(t, 0.025, 25)); }
  else if (t < 54.6) { const hd = gazzar.head.getWorldPosition(V(0, 0, 0)); cam(hd.clone().add(V(-1.1, 0.4, 0.9)), hd.clone().add(V(0, -0.05, 0)), 48); }
  else if (t < 57.1) { faceCam(asly, 1.7, -0.3, 0.0, 50, 0.1); camera.position.add(shake(t, 0.02, 25)); }
  else if (t < T_FIX) { const hd = gazzar.head.getWorldPosition(V(0, 0, 0)); cam(hd.clone().add(V(-0.9, 0.35, 0.8)), hd.clone().add(V(0, -0.05, 0)), 46); }
  else if (t < T_LAUNCH) { cam(V(-1.6, 1.4, 3.2).add(shake(t, t > T_START ? 0.04 : 0.01, 25)), TUK_P.clone().add(V(0, 0.8, 0)), 54); }
  else if (t < T_RES) { cam(V(-1.0, 1.7, 4.6).add(shake(t, 0.06 * (1 - seg(t, T_LAUNCH, T_RES)), 25)), tuk.position.clone().add(V(0, 0.8, 0)), 56); }
  else { const k = easeInOut(seg(t, T_RES, 76.0)); cam(VL(V(-2.6, 2.2, 5.0), V(-3.4, 2.8, 6.2), k), V(1.2, 1.0, -0.8), 56); }
}

// =====================================================================
const NAMES = { bastam: ['بستم', 'BASTAM', '#2f5fb0'], alamy: ['العالمي', 'EL-ALAMY', '#d8231b'], asly: ['الأصلي', 'EL-ASLY', '#6a6a6a'], gazzar: ['الجزار', 'EL-GAZZAR', '#4a4a38'], dad: ['إبراهيم', 'IBRAHIM', '#c9a227'] };
function portrait(g, x, y, who, t) {
  g.fillStyle = '#123'; g.fillRect(x, y, 64, 64); g.strokeStyle = '#fff'; g.lineWidth = 2; g.strokeRect(x, y, 64, 64);
  g.save(); g.beginPath(); g.rect(x + 2, y + 2, 60, 60); g.clip();
  const skin = { bastam: '#b07a50', alamy: '#c08a60', asly: '#a86a40', gazzar: '#a87048', dad: '#b27448' }[who];
  const shirt = { bastam: '#2f5fb0', alamy: '#f4f4f0', asly: '#6a6a6a', gazzar: '#4a4a38', dad: '#f3f0e3' }[who];
  g.fillStyle = shirt; g.fillRect(x + 8, y + 54, 48, 10); g.fillStyle = skin; g.beginPath(); g.arc(x + 32, y + 36, who === 'asly' ? 23 : 20, 0, 7); g.fill();
  if (who === 'bastam') { g.fillStyle = '#d8231b'; g.beginPath(); g.arc(x + 32, y + 26, 21, Math.PI, 0); g.fill(); }
  if (who === 'alamy') { g.fillStyle = '#1a120c'; g.fillRect(x + 12, y + 14, 40, 8); }
  if (who === 'gazzar') { g.fillStyle = '#120c08'; for (let i = 0; i < 6; i++) { g.beginPath(); g.arc(x + 14 + i * 7, y + 18 + (i % 2) * 3, 8, 0, 7); g.fill(); } g.fillStyle = '#d8231b'; g.fillRect(x + 10, y + 22, 44, 4); }
  if (who === 'dad') { g.fillStyle = '#1b1410'; g.fillRect(x + 10, y + 30, 5, 12); g.fillRect(x + 49, y + 30, 5, 12); g.fillStyle = '#c9a227'; g.fillRect(x + 14, y + 16, 36, 5); }
  const fc = document.createElement('canvas'); fc.width = 32; fc.height = 32; const fg = fc.getContext('2d');
  const e = envAt(t); const mouth = speakerAt(t) === who ? (e < 0.1 ? 'closed' : e < 0.4 ? 'talk1' : 'talk2') : 'closed';
  const eyes = { bastam: 'wide', alamy: 'tired', asly: 'angry', gazzar: 'tired', dad: 'smug' }[who];
  drawFace(fg, 32, eyes, mouth, { stache: who === 'dad' || who === 'asly', glasses: who === 'alamy', fuzz: who === 'bastam' || who === 'gazzar' });
  g.imageSmoothingEnabled = false; g.drawImage(fc, x + 14, y + 20, 36, 36); g.restore();
}
const INTROS = [
  [1.1, 'بستم', 'BASTAM', 'مدير الفنيين', [['VOLUME', 10, '#3df05a'], ['TECH', 0, '#ff3a3a']], '#2f5fb0'],
  [21.6, 'العالمي', 'EL-ALAMY', 'مدير المركز', [['TECH', 10, '#3df05a'], ['PATIENCE', 1, '#ff3a3a']], '#d8231b'],
  [44.7, 'الأصلي', 'EL-ASLY', 'فني كهربا', [['ANGER', 10, '#ff3a3a'], ['VOLTAGE', 9, '#ffd400']], '#6a6a6a'],
  [49.4, 'الجزار', 'EL-GAZZAR', 'ميكانيكي', [['SKILL', 10, '#3df05a'], ['SPEED', 1, '#9fd0ff']], '#7a7a50'],
];
function drawIntros(g, t) {
  INTROS.forEach(([t0, ar, en, role, stats, col]) => {
    const a = t - t0; if (a < 0 || a > 2.8) return;
    const kin = easeOut(clamp(a / 0.25)), kout = a > 2.5 ? seg(a, 2.5, 2.8) : 0;
    const x = lerp(-420, 20, kin) - kout * 440, y = 90;
    g.save(); g.translate(x, y); g.transform(1, 0, -0.18, 1, 0, 0);
    g.fillStyle = 'rgba(0,0,0,0.85)'; g.fillRect(0, 0, 360, 140); g.fillStyle = col; g.fillRect(0, 0, 360, 8); g.fillRect(0, 132, 360, 8);
    g.restore();
    arText(g, ar, x + 330, y + 6, 44, '#ffe14a', 'right', 'ReemKufi'); pxText(g, en, x + 24, y + 22, 12, '#fff');
    arText(g, role, x + 330, y + 58, 22, '#9fd0ff', 'right');
    stats.forEach(([lbl, n, c], i) => { const yy = y + 92 + i * 22; pxText(g, lbl, x + 14, yy, 8, '#fff'); for (let b = 0; b < 10; b++) { g.fillStyle = b < n ? c : '#333'; g.fillRect(x + 120 + b * 18, yy - 2, 14, 12); } });
  });
}
function drawAnger(g, t) {
  if (t < 44.6 || t >= T_LAUNCH) return; const v = clamp(seg(t, 44.6, 56.8) * 1.1);
  const x = W - 210, y = 14; g.fillStyle = 'rgba(40,0,0,0.85)'; g.fillRect(x, y, 196, 52); g.strokeStyle = '#ff3a3a'; g.lineWidth = 2; g.strokeRect(x, y, 196, 52);
  arText(g, 'غضب الأصلي', x + 188, y + 2, 16, '#fff'); pxText(g, 'RAGE', x + 8, y + 8, 8, '#ff9a4a');
  g.fillStyle = '#333'; g.fillRect(x + 8, y + 32, 180, 12); g.fillStyle = v > 0.9 ? (Math.floor(t * 8) % 2 ? '#ff2020' : '#ffd400') : '#ff5a2a'; g.fillRect(x + 8, y + 32, 180 * Math.min(1, v), 12);
  if (v > 0.9) pxText(g, 'MAX', x + 150, y + 8, 8, '#ffd400');
}
function drawTitle(g, t) {
  if (t >= 1.0) return; g.fillStyle = 'rgba(0,0,0,0.6)'; g.fillRect(0, 196, W, 76);
  arText(g, 'مركز الصيانة', W / 2, 198, 40, '#ffe14a', 'center', 'ReemKufi'); pxText(g, 'THE SERVICE CENTER', W / 2, 250, 10, '#fff', 'center');
}
function drawFix(g, t) {
  if (t >= T_FIX && t < T_START) { pxText(g, 'FIXING...', W / 2, 120, 18, '#ffe14a', 'center'); const p = seg(t, T_FIX, T_START - 0.1); g.fillStyle = '#333'; g.fillRect(W / 2 - 120, 150, 240, 14); g.fillStyle = '#3df05a'; g.fillRect(W / 2 - 120, 150, 240 * p, 14); }
  if (t >= T_START && t < T_LAUNCH) { const k = easeBack(seg(t, T_START, T_START + 0.2)); g.save(); g.translate(W / 2, 140); g.scale(k, k); pxText(g, 'FIXED!', 0, -16, 26, '#3df05a', 'center'); arText(g, 'في ثانية!', 0, 14, 26, '#fff', 'center'); g.restore(); }
  if (t >= T_LAUNCH && t < T_RES) { if (Math.floor(t * 6) % 2) pxText(g, 'LIFT OFF!', W / 2, 110, 24, '#ffe14a', 'center'); }
}
function drawResult(g, t) {
  if (t < T_RES || t >= T_ENDC + 0.2) return; const a = t - T_RES;
  const k = easeOut(clamp(a / 0.3)); const y = lerp(-90, 24, k);
  g.fillStyle = 'rgba(20,20,30,0.95)'; g.fillRect(50, y, W - 100, 84); g.strokeStyle = '#3df05a'; g.lineWidth = 3; g.strokeRect(50, y, W - 100, 84);
  pxText(g, 'NEW AREA UNLOCKED', 70, y + 14, 12, '#3df05a', 'left', false); arText(g, 'مركز الصيانة', W - 70, y + 26, 32, '#fff');
  pxText(g, 'THE SERVICE CENTER', 70, y + 56, 9, '#9fd0ff', 'left', false);
  if (a > 3.8) { const k2 = easeBack(seg(t, T_RES + 3.8, T_RES + 4.05)); g.save(); g.translate(W / 2, 190); g.scale(k2, k2); g.fillStyle = 'rgba(0,0,30,0.85)'; g.fillRect(-220, -34, 440, 70); pxText(g, 'BASTAM: STILL FLYING', 0, -24, 12, '#ffd400', 'center'); arText(g, 'بستم: لسه طاير', 0, -6, 28, '#fff', 'center'); g.restore(); }
}
function drawEnd(g, t) {
  const a = t - T_ENDC; if (a < 0) return; const k = easeOut(clamp(a / 0.4));
  g.fillStyle = `rgba(0,0,0,${0.55 * k})`; g.fillRect(0, 0, W, H);
  g.save(); g.translate(W / 2, 190); g.scale(k, k); arText(g, 'يُتبع...', 0, -40, 54, '#ffe14a', 'center', 'ReemKufi'); pxText(g, 'TO BE CONTINUED', 0, 30, 16, '#fff', 'center'); g.restore();
}
window.renderFrame = function (t) {
  stateAt(t); cameraAt(t);
  renderer.render(scene, camera);
  ctx.clearRect(0, 0, W, H); ctx.drawImage(glCanvas, 0, 0);
  h.clearRect(0, 0, W, H);
  drawIntros(h, t); drawAnger(h, t); drawFix(h, t); drawResult(h, t); drawDialogue(h, t); drawEnd(h, t); drawTitle(h, t);
  ctx.drawImage(hud, 0, 0); vignette(ctx, 0.3);
  if (t >= T_LAND && t < T_LAND + 0.06) { ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.fillRect(0, 0, W, H); }
  if (t >= T_LAUNCH && t < T_LAUNCH + 0.07) { ctx.fillStyle = 'rgba(255,240,200,0.8)'; ctx.fillRect(0, 0, W, H); }
  return true;
};
window.frameData = () => out.toDataURL('image/png');
window.DUR = DUR;
document.fonts.load('10px PS2P').then(() => document.fonts.load('20px Lalezar', 'ع')).then(() => document.fonts.load('700 20px ReemKufi', 'ع')).then(() => {
  const c = signT.image.getContext('2d'); c.fillStyle = '#d8231b'; c.fillRect(0, 0, 160, 32); c.fillStyle = '#fff'; c.fillRect(0, 0, 160, 3); c.fillRect(0, 29, 160, 3); c.font = '18px Lalezar'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.direction = 'rtl'; c.fillText('مركز العالمي لصيانة السيارات', 80, 16); signT.needsUpdate = true;
  const m1 = mashallahTex.image.getContext('2d'); m1.fillStyle = '#d8231b'; m1.fillRect(0, 0, 64, 20); m1.fillStyle = '#ffe14a'; m1.font = '13px Lalezar'; m1.textAlign = 'center'; m1.textBaseline = 'middle'; m1.direction = 'rtl'; m1.fillText('ما شاء الله', 32, 11); mashallahTex.needsUpdate = true;
  window.READY = true;
});
