
// =====================================================================
// كاشف الكدب ٣٠٠٠ — Ibrahim's pressure-cooker lie detector
// =====================================================================
const T_REVEAL = 3.4, T_W1 = 20.2, T_HELMSWAP = 27.1, T_MOM = 27.6, T_W2 = 37.1, T_BALC = 51.9, T_ENDC = 59.4;
const dayWinTex = canvasTex(32, 32, (g) => { const gr = g.createLinearGradient(0, 0, 0, 32); gr.addColorStop(0, '#9cc8ff'); gr.addColorStop(1, '#ffe0b0'); g.fillStyle = gr; g.fillRect(0, 0, 32, 32); const r = rng(8); for (let x = 0; x < 32; x += 5) { const h = 6 + r() * 12 | 0; g.fillStyle = '#b48a6a'; g.fillRect(x, 32 - h, 4, h); } });
win.children[0].material.map = dayWinTex; win.children[0].material.needsUpdate = true;
const daySky = canvasTex(128, 64, (g) => { const gr = g.createLinearGradient(0, 0, 0, 64); gr.addColorStop(0, '#ff9a5a'); gr.addColorStop(0.6, '#ffd090'); gr.addColorStop(1, '#ffb070'); g.fillStyle = gr; g.fillRect(0, 0, 128, 64); g.fillStyle = '#fff0b0'; g.beginPath(); g.arc(90, 46, 10, 0, 7); g.fill(); const r = rng(5); for (let x = 0; x < 128; x += 7) { const h = 10 + r() * 16 | 0; g.fillStyle = '#8a5a4a'; g.fillRect(x, 64 - h, 6, h); } });
skyB.material.map = daySky; skyB.material.needsUpdate = true;
const sun = new THREE.DirectionalLight(0xffe2b0, 1.2); sun.position.set(-6, 5, -1); scene.add(sun);
doorPivot.rotation.y = -1.9; hallGlowMat.color.setHex(0xffd8a0);

// ---------- the invention ----------
const inv = new THREE.Group(); inv.position.set(0.55, 0, -1.7); room.add(inv);
const table9 = new THREE.Group(); inv.add(table9);
mesh(box(0.8, 0.05, 0.6), M(0x8a5a2b, { map: woodTex }), 0, 0.62, 0, table9); for (const [x, z] of [[-0.35, -0.25], [0.35, -0.25], [-0.35, 0.25], [0.35, 0.25]]) mesh(box(0.05, 0.62, 0.05), M(0x6a4220), x, 0.31, z, table9);
const cooker = new THREE.Group(); cooker.position.set(0, 0.65, 0); inv.add(cooker);
const alu = P(0xc8ced6, { shininess: 110, specular: 0xffffff });
mesh(cyl(0.24, 0.22, 0.34, 12), alu, 0, 0.17, 0, cooker);
for (const s of [-1, 1]) mesh(box(0.22, 0.04, 0.06), M(0x1a1a1a), s * 0.33, 0.3, 0, cooker);
const lid = new THREE.Group(); lid.position.set(0, 0.35, 0); cooker.add(lid);
mesh(cyl(0.25, 0.25, 0.04, 12), alu, 0, 0, 0, lid); mesh(box(0.42, 0.05, 0.06), M(0x1a1a1a), 0.12, 0.04, 0, lid);
const weight = mesh(cyl(0.035, 0.05, 0.08, 8), M(0x333333), 0, 0.07, 0, lid);
// red police beacon on the lid
const beacon = new THREE.Group(); beacon.position.set(-0.1, 0.06, 0.05); lid.add(beacon);
mesh(cyl(0.06, 0.06, 0.03, 8), M(0x222222), 0, 0, 0, beacon);
const beaconBulb = mesh(new THREE.SphereGeometry(0.06, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0x661111 }), 0, 0.015, 0, beacon);
const beaconLight = new THREE.PointLight(0xff2020, 0, 5, 1.4); beacon.add(beaconLight); beaconLight.position.y = 0.1;
// TV remote duct-taped to the side
const remote = mesh(box(0.06, 0.2, 0.025), M(0x222222), 0.26, 0.17, 0.05, cooker); remote.rotation.z = 0.15;
for (let i = 0; i < 6; i++) mesh(box(0.012, 0.012, 0.01), M([0xff3355, 0x33aaff, 0x44cc66][i % 3]), 0.255 + (i % 2) * 0.02, 0.22 - Math.floor(i / 2) * 0.03, 0.065, cooker);
for (let i = 0; i < 2; i++) mesh(box(0.1, 0.03, 0.03), P(0xc9ccd1), 0.26, 0.12 + i * 0.1, 0.06, cooker);
// dial / "meter" made from a kitchen scale
const dial = new THREE.Group(); dial.position.set(-0.28, 0.66, 0.2); inv.add(dial);
mesh(cyl(0.11, 0.11, 0.05, 12), M(0xf0f0f0), 0, 0, 0, dial).rotation.x = Math.PI / 2 - 0.4;
const needle = mesh(box(0.008, 0.09, 0.005), M(0xd8231b), 0, 0.03, 0.03, dial); needle.rotation.x = -0.4;
// tarp
const tarp9 = mesh(box(0.95, 0.75, 0.75), M(0xffffff, { map: canvasTex(32, 32, (g) => { g.fillStyle = '#9ec8ff'; g.fillRect(0, 0, 32, 32); const r = rng(9); for (let i = 0; i < 12; i++) { g.fillStyle = ['#ffffff', '#ffd23f', '#ff6fa5'][i % 3]; g.fillRect(r() * 30 | 0, r() * 30 | 0, 3, 3); } }, [2, 2]) }), 0.55, 1.0, -1.7, room);
// the colander "sensor helmet" + wires to the cooker
const helmet = new THREE.Group(); scene.add(helmet);
mesh(new THREE.SphereGeometry(0.3, 10, 5, 0, Math.PI * 2, 0, Math.PI / 2), P(0xc8ced6, { shininess: 100, side: THREE.DoubleSide }), 0, 0, 0, helmet);
for (let i = 0; i < 12; i++) { const a = i / 12 * 6.28; mesh(cyl(0.012, 0.012, 0.01, 4), M(0x333333), Math.cos(a) * 0.2, 0.2, Math.sin(a) * 0.2, helmet); }
mesh(cyl(0.006, 0.006, 0.2, 4), M(0xd02020), 0.1, 0.38, 0, helmet); mesh(new THREE.SphereGeometry(0.025, 5, 4), M(0xffd400), 0.1, 0.48, 0, helmet);
let wires9 = null; const wireMat9 = M(0xd02020);
// a plastic chair for the suspect
const pchair = new THREE.Group(); pchair.position.set(-0.6, 0, -1.25); room.add(pchair);
mesh(box(0.45, 0.04, 0.45), P(0xf4f4f0), 0, 0.45, 0, pchair); mesh(box(0.45, 0.45, 0.04), P(0xf4f4f0), 0, 0.7, -0.21, pchair);
for (const [x, z] of [[-0.19, -0.19], [0.19, -0.19], [-0.19, 0.19], [0.19, 0.19]]) mesh(box(0.04, 0.45, 0.04), P(0xf4f4f0), x, 0.22, z, pchair);
// basbousa tray on the table (evidence: one corner missing)
const tray = new THREE.Group(); tray.position.set(-2.2, 0, 1.0); room.add(tray);
mesh(cyl(0.3, 0.3, 0.03, 12), P(0xc0c4cc), 0, 0.82, 0, tray);
const bas = mesh(box(0.42, 0.05, 0.42), M(0xd8a040), 0, 0.85, 0, tray);
const crumbs = mesh(box(0.15, 0.06, 0.15), M(0x111111), 0.14, 0.86, 0.14, tray); crumbs.visible = false;
const sideTable = mesh(box(0.7, 0.8, 0.7), M(0x6a4220, { map: woodTex }), -2.2, 0.4, 1.0, room);

// =====================================================================
const KEYS = {};
const SITC = { y: -0.38, lL: 1.5, lR: 1.5 };
KEYS.dad = [
  [0, { aLz: 0.95, eL: 1.9, aRz: 0.95, eR: 1.9, hx: -0.05 }],
  [T_REVEAL, { aRx: 2.5, aRz: 1.4, eR: 0.2, aLz: 0.6, twist: 0.4 }, 0.1],
  [4.2, { aLz: 2.4, aRz: 2.4, eL: 0.3, eR: 0.3, hx: -0.15 }, 0.12],
  [8.36, { aLz: 0.95, eL: 1.9, aRz: 0.95, eR: 1.9 }],
  [12.0, { aRx: 1.2, eR: 1.5, aRz: 0.2, tr: 1, aLz: 0.95, eL: 1.9, hx: 0.05 }, 0.15],
  [15.6, { aRx: 1.6, eR: 0.3, aRz: 0.5, aLz: 0.95, eL: 1.9, hy: 0.4 }, 0.15],
  [17.2, { aRx: 1.6, eR: 0.0, aRz: 0.1, aLz: 0.95, eL: 1.9, bend: 0.25, hx: 0.1, hy: 0.4 }, 0.12],
  [T_W1, { aLz: 2.6, aRz: 2.6, eL: 0.2, eR: 0.2, y: 0.08 }, 0.1],
  [23.6, { aLz: 0.95, eL: 1.9, aRz: 0.95, eR: 1.9, hy: 0.4 }],
  [T_HELMSWAP, { ...SITC, aLz: 0.3, aRz: 0.3, aLx: 0.6, eL: 0.6, aRx: 0.6, eR: 0.6 }, 0.25],
  [32.9, { ...SITC, aLx: 1.0, aRx: 1.0, eL: 1.6, eR: 1.6, aLz: -0.2, aRz: -0.2, bend: 0.1 }, 0.15],
  [34.3, { ...SITC, aLz: 2.2, aRz: 0.4, eL: 0.6, eR: 0.6, bend: -0.1, hy: -0.3 }, 0.12],
  [T_W2, { ...SITC, aLz: 2.6, aRz: 2.6, eL: 0.2, eR: 0.2, bend: -0.3, hx: -0.3 }, 0.08],
  [41.25, { ...SITC, aRx: 1.4, aRz: 0.9, eR: 0.3, aLz: 0.4, bend: 0.1 }, 0.12],
  [44.55, { ...SITC, aLz: 0.3, aRz: 0.3, hx: 0.1 }, 0.3],
  [49.2, { aLz: 0.2, aRz: 0.2, bend: 0.4, hx: 0.45 }, 0.6],
];
KEYS.son = [
  [0, { aLz: 0.3, aRz: 0.3, hx: 0.05 }],
  [8.7, { aLz: 0.95, eL: 1.9, aRx: 1.3, aRz: 0.3, eR: 0.3, hz: 0.12 }, 0.12],
  [11.7, { aLz: 0.3, aRz: 0.3 }],
  [15.6, { ...SITC, aLx: 0.6, eL: 0.6, aRx: 0.6, eR: 0.6, aLz: 0.3, aRz: 0.3 }, 0.25],
  [18.35, { ...SITC, aRx: 1.2, eR: 1.6, aRz: 0.2, tr: 1, aLx: 0.6, eL: 0.6, aLz: 0.3, bend: -0.15, hx: -0.1 }, 0.12],
  [T_W1, { ...SITC, aLz: 2.6, aRz: 2.6, eL: 0.2, eR: 0.2, bend: -0.3, hx: -0.3 }, 0.08],
  [23.9, { aRx: 1.6, eR: 0.1, aRz: 0.3, aLz: 0.95, eL: 1.9, hx: 0.05, hy: -0.2 }, 0.15],
  [27.6, { aLz: 0.95, eL: 1.9, aRz: 0.95, eR: 1.9, hy: -0.5 }, 0.3],
];
KEYS.mom = [
  [0, { aLz: 0.95, eL: 1.9, aRz: 0.95, eR: 1.9 }],
  [27.9, { aLx: 1.25, eL: 1.95, aRx: 1.15, eR: 2.0, aLz: -0.2, aRz: -0.25, hx: 0.1 }, 0.3],
  [38.8, { aLx: 1.25, eL: 1.95, aRx: 1.15, eR: 2.0, aLz: -0.2, aRz: -0.25, hx: 0.15, hz: 0.15 }, 0.3],
  [44.55, { aLz: 0.4, eL: 0.4, aRx: 1.2, eR: 2.4, aRz: -0.1, hz: -0.2, hx: -0.05 }, 0.3],
  [49.2, { aLx: 1.25, eL: 1.95, aRx: 1.15, eR: 2.0, aLz: -0.2, aRz: -0.25, hx: 0.05 }, 0.3],
];
const DAD_P = V(1.35, 0, -0.95), SON_P = V(-0.6, 0, -1.25);
function lieLevel(t) { // 0 = truth, 1 = big lie
  if (t < 17.2) return 0.1 + 0.05 * Math.sin(t * 2);
  if (t < T_W1) return lerp(0.1, 0.95, seg(t, 18.4, 20.0));
  if (t < 24.0) return lerp(0.95, 0.2, seg(t, 22.5, 24.0));
  if (t < 32.9) return 0.2 + 0.05 * Math.sin(t * 3);
  if (t < T_W2 + 1.6) return Math.min(1.2, lerp(0.2, 1.2, seg(t, 33.0, 36.8)));
  if (t < 44.55) return 0.9 + 0.1 * Math.sin(t * 8);
  return 0.5 + 0.5 * Math.sin(t * 9); // the trap question: needle goes crazy
}
const whistleAt = t => (t >= T_W1 && t < T_W1 + 1.2) || (t >= T_W2 && t < T_W2 + 1.6) || (t >= 49.4 && t < 51.7 && Math.floor(t * 3) % 2 === 0) || (t >= 57.5 && t < 58.1);

function stateAt(t) {
  const balc = t >= T_BALC && t < T_ENDC + 3;
  room.visible = !balc; hallway.visible = !balc; balcony.visible = balc;
  scene.background = new THREE.Color(balc ? 0xffb070 : 0x101010); scene.fog = balc ? new THREE.Fog(0xffb070, 12, 40) : null;
  ambient.color.setHex(0xfff0e0); ambient.intensity = balc ? 0.95 : 0.8; moon.intensity = 0; sun.intensity = balc ? 1.4 : 1.1; sun.position.set(balc ? 4 : -6, 5, balc ? 6 : -1);
  tvLight.intensity = 1.0; hallLight.intensity = 2.0; balcLight.intensity = 0;
  { const g = tvTex.userData.g; g.fillStyle = '#0c0c10'; g.fillRect(0, 0, 128, 96); tvTex.needsUpdate = true; }
  // invention
  tarp9.visible = t < 4.2;
  if (t >= T_REVEAL) { const k = seg(t, T_REVEAL, 4.2); tarp9.position.set(0.55 + k * 2.4, 1.0 + Math.sin(k * 3) * 1.2, -1.7 + k * 1.6); tarp9.rotation.set(k * 3, k * 4, k * 2); tarp9.scale.set(1 + k * 0.4, 1 - k * 0.7, 1); }
  else { tarp9.position.set(0.55, 1.0, -1.7); tarp9.rotation.set(0, 0, 0); tarp9.scale.set(1, 1, 1); }
  const whistle = whistleAt(t);
  lid.position.set(0, 0.35, 0); lid.rotation.set(0, 0, 0);
  if (t >= T_W2 + 0.4 && t < 51.0) { const a = t - (T_W2 + 0.4); const y = 0.35 + 9 * a - 9.8 * a * a; if (a < 0.62) { lid.position.y = Math.min(y, 2.45); lid.rotation.set(a * 14, a * 6, 0); } else { lid.position.set(0.3, 2.47, 0.1); lid.rotation.set(Math.PI, 0, 0.2); } } // flies up and sticks to the ceiling
  if (t >= 51.0) { lid.position.set(0.3, 2.47, 0.1); lid.rotation.set(Math.PI, 0, 0.2); }
  if (whistle) cooker.position.set(noise1(t * 50) * 0.01, 0.65 + Math.abs(noise1(t * 47)) * 0.015, 0); else cooker.position.set(0, 0.65, 0);
  weight.rotation.y = whistle ? t * 40 : 0;
  beaconBulb.material.color.setHex(whistle || (t >= 44.55 && t < 49.2 && Math.floor(t * 6) % 2) ? 0xff2020 : 0x661111);
  beaconLight.intensity = whistle ? 3 + 2 * Math.sin(t * 30) : 0;
  needle.rotation.z = lerp(1.1, -1.1, clamp(lieLevel(t) / 1.2));
  crumbs.visible = true; bas.scale.set(1, 1, 1);
  // ---- characters ----
  dad.afro.visible = false; samir.root.visible = false; cane.visible = false;
  dad.extras.setGoggles(t >= 4.2 && t < 12.0);
  if (!balc) {
    dad.root.visible = true; dad.root.position.copy(DAD_P); dad.root.rotation.set(0, -0.55, 0);
    if (t >= T_HELMSWAP) { const k = easeInOut(seg(t, T_HELMSWAP, 27.6)); dad.root.position.copy(VL(DAD_P, SON_P, k)); dad.root.rotation.y = lerp(-0.55, 0.45, k); }
    if (t >= 49.2) { const k = easeInOut(seg(t, 49.4, 51.8)); dad.root.position.copy(VL(SON_P, V(-3.6, 0, -1.6), k)); dad.root.rotation.y = lerp(0.45, -Math.PI / 2, seg(t, 49.4, 49.9)); }
  } else {
    dad.root.position.set(-0.6, 0.14, -0.5); dad.root.rotation.set(0, 0.2, 0);
  }
  const dz = poseAt(t, KEYS.dad);
  if (t >= 49.4 && t < 51.8) { const w = Math.sin(t * 6); dz.lL = w * 0.35; dz.lR = -w * 0.35; dz.y = 0; }
  if (balc) Object.assign(dz, { y: -0.7, lL: 1.45, lR: 1.45, aLz: 0.3, aRz: 0.3, eL: 0.5, eR: 0.5, aLx: 0.3, aRx: 0.3, bend: 0.25, hx: 0.3, hz: 0.1, tr: 0, twist: 0 });
  applyPose(dad, dz);
  // Hamada
  son.root.visible = !balc; son.root.rotation.set(0, 0, 0);
  son.root.position.copy(t >= 15.6 && t < 23.9 ? SON_P : V(-1.3, 0, -0.6)); son.root.rotation.y = t >= 15.6 && t < 23.9 ? 0.45 : 0.9;
  if (t >= 23.9) { son.root.position.set(-1.4, 0, -0.4); son.root.rotation.y = 0.8; }
  applyPose(son, poseAt(t, KEYS.son));
  // mom (enters from the hallway door)
  mom.root.visible = !balc && t >= T_MOM;
  { const k = easeOut(seg(t, T_MOM, 29.2)); mom.root.position.copy(VL(V(4.6, 0, 1.0), V(1.7, 0, 0.3), k)); mom.root.rotation.y = lerp(-Math.PI / 2, -1.05, k); }
  if (t < 29.2 && t >= T_MOM) { const w = Math.sin(t * 7); const mz = poseAt(t, KEYS.mom); mz.lL = w * 0.4; mz.lR = -w * 0.4; applyPose(mom, mz); } else applyPose(mom, poseAt(t, KEYS.mom));
  // helmet: on Hamada 15.6-27.1, then on Ibrahim (stays on him to the balcony)
  const wearer = t < T_HELMSWAP ? son : dad; helmet.visible = (t >= 15.8 && t < T_HELMSWAP) || t >= 27.6;
  if (t >= T_HELMSWAP && t < 27.6) { helmet.visible = true; const k = seg(t, T_HELMSWAP, 27.6); const a = son.head.getWorldPosition(V(0, 0, 0)).add(V(0, 0.18, 0)), b = dad.head.getWorldPosition(V(0, 0, 0)).add(V(0, 0.18, 0)); helmet.position.copy(VL(a, b, k)); helmet.position.y += Math.sin(k * Math.PI) * 0.4; }
  else { wearer.head.updateWorldMatrix(true, false); helmet.position.copy(V(0, 0.16, -0.02).applyMatrix4(wearer.head.matrixWorld)); helmet.quaternion.copy(wearer.head.getWorldQuaternion(new THREE.Quaternion())); }
  if (wires9) { scene.remove(wires9); wires9.geometry.dispose(); wires9 = null; }
  if (helmet.visible && !balc && t < 49.4) { const a = helmet.position.clone().add(V(0.1, 0.25, 0)); const b = cooker.getWorldPosition(V(0, 0, 0)).add(V(0.0, 0.3, 0)); const m1 = VL(a, b, 0.5).add(V(0, -0.6, 0.2)); wires9 = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([a, m1, b]), 16, 0.012, 3), wireMat9); scene.add(wires9); }

  // ---- particles ----
  const steam = [];
  const cp = cooker.getWorldPosition(V(0, 0, 0)).add(V(0, 0.45, 0));
  if (!balc && whistle) { const big = t >= T_W2 && t < T_W2 + 1.6 ? 2.2 : 1; for (let i = 0; i < 20; i++) { const ph = (t * 3 + i / 20) % 1; steam.push({ pos: cp.clone().add(V((hash(i) - .5) * 0.3 * ph * big, ph * 1.4 * big, (hash(i + 3) - .5) * 0.3 * ph * big)), size: (0.12 + ph * 0.5) * big, op: (1 - ph) * 0.8, color: 0xf2f2f2 }); } }
  if (!balc && t >= T_W2 + 0.4 && t < T_W2 + 3.5) { const k = seg(t, T_W2 + 0.4, T_W2 + 3.5); for (let i = 0; i < 16; i++) steam.push({ pos: V(0.55 + (hash(i) - .5) * 4 * k, 2.6 - hash(i + 1) * 0.6, -1.7 + (hash(i + 2) - .5) * 3 * k), size: 0.6 + k * 0.8, op: (1 - k) * 0.6, color: 0xeeeeee }); }
  emit(steam, puffPool);
  const sweat = [];
  const sweaty = (t >= 18.35 && t < 21.5) ? son : (t >= 32.9 && t < 51.8) ? dad : null;
  if (sweaty && !balc) { const hd = sweaty.head.getWorldPosition(V(0, 0, 0)); for (let i = 0; i < 6; i++) { const k = (t * 1.4 + i / 6) % 1; sweat.push({ pos: hd.clone().add(V((i % 2 ? 1 : -1) * 0.3, 0.15 - k * 0.5, 0.05)), size: 0.07, op: 1 - k }); } }
  emit(sweat, sweatPool);
  const stars = [];
  if (t >= 4.2 && t < 8.4) for (let i = 0; i < 6; i++) { const a = t * 2 + i * 1.05; stars.push({ pos: cp.clone().add(V(Math.cos(a) * 0.5, -0.1 + Math.sin(a * 2) * 0.1, Math.sin(a) * 0.5)), size: 0.1, rot: a }); }
  emit(stars, starPool); emit([], trailPool);
  laundry.forEach((c, i) => { c.rotation.y = Math.sin(t * 1.3 + i) * 0.25; });

  // ---- faces ----
  let de = 'smug', dm = talkMouth(t, 'dad', 'scream') || 'grin';
  if (t >= 4.2 && t < 8.4) de = 'sparkle';
  if (t >= 12.0 && t < 18.1) { de = 'smug'; }
  if (t >= T_W1 && t < 23.6) { de = 'sparkle'; }
  if (t >= 23.9 && t < 27.6) { de = 'pin'; dm = 'o'; }
  if (t >= 27.6 && t < 32.9) { de = 'side'; if (dm === 'grin') dm = 'clench'; }
  if (t >= 32.9 && t < 44.55) { de = 'wide'; if (dm === 'grin') dm = 'fakegrin'; }
  if (t >= 44.55 && t < 49.2) { de = 'pin'; dm = 'wobble'; }
  if (t >= 49.2) { de = 'tired'; if (dm === 'grin') dm = 'frown'; }
  if (balc) { de = t > 57.5 && t < 58.2 ? 'wide' : 'closed'; dm = 'smile'; }
  let se = 'flat', sm = talkMouth(t, 'son') || 'flat';
  if (t >= 18.35 && t < T_W1) { se = 'smug'; if (sm === 'flat') sm = 'fakegrin'; }
  if (t >= T_W1 && t < 23.9) { se = 'pin'; sm = 'o'; }
  if (t >= 23.9 && t < 27.6) { se = 'smug'; if (sm === 'flat') sm = 'grin'; }
  if (t >= 27.6) { se = 'smug'; sm = 'grin'; }
  let me = 'menace', mm = talkMouth(t, 'mom') || 'flat';
  if (t >= 44.55 && t < 49.2) { me = 'sparkle'; if (mm === 'flat') mm = 'smile'; }
  if (t >= 49.2) { me = 'smug'; mm = 'smile'; }
  dad.faceMat.map = faceTexture(de, dm, { stache: true }); dad.faceMat.needsUpdate = true;
  son.faceMat.map = faceTexture(se, sm, { fuzz: true }); son.faceMat.needsUpdate = true;
  mom.faceMat.map = faceTexture(me, mm, {}); mom.faceMat.needsUpdate = true;
}

function cameraAt(t) {
  if (t < 1.0) { cam(V(2.8, 2.0, 2.4), V(0.3, 0.9, -1.4), 56); }
  else if (t < T_REVEAL) { faceCam(dad, 1.9, 0.5, 0.0, 50, 0.2); }
  else if (t < 8.7) { const k = seg(t, T_REVEAL, 8.7); const c = V(0.55, 1.05, -1.7); const a = lerp(-0.6, 0.6, k); cam(c.clone().add(V(Math.sin(a) * 1.5, 0.3, Math.cos(a) * 1.5)), c, 50); }
  else if (t < 12.0) { faceCam(son, 1.3, 0.3, 0.05, 48, 0.1); }
  else if (t < 18.35) { cam(V(0.4, 1.6, 1.0), V(-0.2, 1.0, -1.3), 56); }
  else if (t < T_W1) { faceCam(son, 1.1, -0.2, 0.05, 46, 0.15); }
  else if (t < 21.5) { cam(V(0.9, 1.25, -0.9).add(shake(t, 0.03, 30)), V(0.55, 1.2, -1.7), 50); }
  else if (t < 23.9) { faceCam(dad, 1.4, -0.3, 0.05, 48, 0.1); }
  else if (t < T_MOM) { faceCam(son, 1.3, 0.3, 0.05, 48, 0.1); }
  else if (t < 29.4) { cam(V(1.0, 1.4, -0.8), V(4.2, 1.3, 1.0), 50); }
  else if (t < 32.9) { faceCam(mom, lerp(1.8, 1.4, seg(t, 29.4, 32.9)), 0.35, 0.05, 48, 0.1); }
  else if (t < T_W2) { faceCam(dad, 1.2, 0.25, 0.05, 46, 0.12); }
  else if (t < 38.8) { cam(V(2.4, 1.4, 1.6).add(shake(t, 0.07, 28)), V(0.2, 1.6, -1.6), 62); }
  else if (t < 41.25) { faceCam(mom, 1.4, 0.3, 0.0, 46, 0.1); }
  else if (t < 44.55) { faceCam(dad, 1.1, -0.25, 0.05, 46, 0.12); }
  else if (t < 49.2) { const k = seg(t, 44.55, 49.2); faceCam(mom, lerp(1.6, 1.2, k), -0.2, 0.0, 46, 0.08); }
  else if (t < T_BALC) { const k = seg(t, 49.2, T_BALC); if (t < 50.3) faceCam(dad, 1.7, 0.2, 0.05, 46, 0.12); else cam(V(0.6, 1.6, 1.6), VL(dad.head.getWorldPosition(V(0, 0, 0)), V(-3.8, 1.2, -1.6), k * 0.5), 54); }
  else { const k = easeInOut(seg(t, T_BALC, 61.5)); cam(VL(V(-0.1, 1.2, 2.4), V(-0.1, 1.9, 4.0), k), V(-0.5, 0.8, -0.5), 52); }
}

// =====================================================================
const NAMES = { mom: ['أم حمادة', 'OM HAMADA', '#1f9e5a'], son: ['حمادة', 'HAMADA', '#d4141c'], dad: ['إبراهيم', 'IBRAHIM', '#c9a227'] };
function portrait(g, x, y, who, t) {
  g.fillStyle = '#123'; g.fillRect(x, y, 64, 64); g.strokeStyle = '#fff'; g.lineWidth = 2; g.strokeRect(x, y, 64, 64);
  g.save(); g.beginPath(); g.rect(x + 2, y + 2, 60, 60); g.clip();
  if (who === 'mom') { g.fillStyle = '#1f9e5a'; g.beginPath(); g.arc(x + 32, y + 34, 27, 0, 7); g.fill(); g.fillStyle = '#c98d5f'; g.beginPath(); g.arc(x + 32, y + 38, 19, 0, 7); g.fill(); g.fillStyle = '#ec86ad'; g.fillRect(x + 6, y + 58, 52, 6); }
  else if (who === 'son') { g.fillStyle = '#d4141c'; g.fillRect(x + 8, y + 54, 48, 10); g.fillStyle = '#b98058'; g.beginPath(); g.arc(x + 32, y + 36, 19, 0, 7); g.fill(); g.fillStyle = '#17110c'; for (let i = 0; i < 7; i++) { g.beginPath(); g.arc(x + 14 + i * 6, y + 18 + (i % 2) * 3, 7, 0, 7); g.fill(); } }
  else { g.fillStyle = '#f3f0e3'; g.fillRect(x + 10, y + 54, 44, 10); g.fillStyle = '#b27448'; g.beginPath(); g.arc(x + 32, y + 36, 20, 0, 7); g.fill(); g.fillStyle = '#1b1410'; g.fillRect(x + 10, y + 30, 5, 12); g.fillRect(x + 49, y + 30, 5, 12); if (t > 27.4) { g.fillStyle = '#c8ced6'; g.beginPath(); g.arc(x + 32, y + 24, 22, Math.PI, 0); g.fill(); } else { g.fillStyle = '#c9a227'; g.fillRect(x + 14, y + 16, 36, 5); } }
  const fc = document.createElement('canvas'); fc.width = 32; fc.height = 32; const fg = fc.getContext('2d');
  const e = envAt(t); const mouth = speakerAt(t) === who ? (e < 0.1 ? 'closed' : e < 0.4 ? 'talk1' : 'talk2') : 'closed';
  const eyes = who === 'mom' ? (t > 44.5 ? 'sparkle' : 'menace') : who === 'son' ? 'smug' : (t > 32.9 ? 'wide' : 'smug');
  drawFace(fg, 32, eyes, mouth, { stache: who === 'dad', fuzz: who === 'son' });
  g.imageSmoothingEnabled = false; g.drawImage(fc, x + 14, y + 20, 36, 36); g.restore();
}
function drawTitle(g, t) {
  if (t >= 1.3) return; const op = t < 0.9 ? 1 : 1 - seg(t, 0.9, 1.3);
  g.globalAlpha = op; g.fillStyle = 'rgba(0,0,0,0.6)'; g.fillRect(0, 196, W, 76);
  arText(g, 'كاشف الكدب ٣٠٠٠', W / 2, 198, 40, '#ffe14a', 'center', 'ReemKufi'); pxText(g, 'LIE DETECTOR 3000', W / 2, 250, 10, '#fff', 'center'); g.globalAlpha = 1;
}
function drawItemCard(g, t) {
  const a = t - 4.4; if (a < 0 || t >= 8.5) return; const k = a < 0.18 ? easeBack(a / 0.18) : 1; const ex = t > 8.2 ? seg(t, 8.2, 8.5) : 0;
  g.save(); g.translate(W / 2 + ex * W, 180); g.scale(k, k);
  g.fillStyle = 'rgba(60,220,255,0.75)'; for (let i = 0; i < 16; i++) { const an = i / 16 * 6.28 + t * 1.5; g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.cos(an) * 240, Math.sin(an) * 240); g.lineTo(Math.cos(an + 0.18) * 240, Math.sin(an + 0.18) * 240); g.fill(); }
  g.fillStyle = 'rgba(10,10,60,0.93)'; g.fillRect(-210, -92, 420, 184); g.strokeStyle = '#fff'; g.lineWidth = 3; g.strokeRect(-210, -92, 420, 184);
  pxText(g, 'NEW INVENTION!', -195, -80, 13, '#7fdcff'); arText(g, '!اختراع جديد', 195, -88, 22, '#7fdcff', 'right');
  arText(g, 'كاشف الكدب ٣٠٠٠', 195, -54, 30, '#fff', 'right');
  const stat = (lbl, val, yy, col) => { pxText(g, lbl, -195, yy, 9, '#fff'); pxText(g, val, -60, yy, 9, col); };
  stat('BASE', 'PRESSURE COOKER', -6, '#ffd400'); stat('SENSOR', 'KITCHEN COLANDER', 16, '#ffd400'); stat('ACCURACY', '100% (TRUST ME)', 38, '#3df05a'); stat('DANGER', 'LID MAY FLY', 60, '#ff4a2a');
  g.restore();
}
function drawMeter(g, t) {
  if (t < 12.0 || t >= T_BALC) return;
  const v = clamp(lieLevel(t) / 1.2); const x = 16, y = 14, w = 240;
  g.fillStyle = 'rgba(0,0,30,0.82)'; g.fillRect(x, y, w, 58); g.strokeStyle = '#fff'; g.lineWidth = 2; g.strokeRect(x, y, w, 58);
  pxText(g, 'LIE METER', x + 10, y + 8, 8, '#ffe14a'); arText(g, 'مقياس الكدب', x + w - 10, y + 2, 16, '#fff');
  const gr = g.createLinearGradient(x + 10, 0, x + w - 10, 0); gr.addColorStop(0, '#3df05a'); gr.addColorStop(0.5, '#ffd400'); gr.addColorStop(1, '#ff2a2a');
  g.fillStyle = '#222'; g.fillRect(x + 10, y + 32, w - 20, 14); g.fillStyle = gr; g.fillRect(x + 10, y + 32, (w - 20) * v, 14);
  pxText(g, 'TRUTH', x + 10, y + 48, 6, '#3df05a'); pxText(g, 'LIE', x + w - 34, y + 48, 6, '#ff4040');
  if (t >= 44.55 && t < 49.2) { pxText(g, 'ERROR: NO SAFE ANSWER', W / 2, 96, 12, Math.floor(t * 6) % 2 ? '#ff4040' : '#ffe14a', 'center'); }
}
function drawLie(g, t) {
  const show = (t >= T_W1 && t < T_W1 + 1.4) || (t >= T_W2 && t < T_W2 + 1.8);
  if (!show) return; const t0 = t < T_W2 ? T_W1 : T_W2; const k = easeBack(seg(t, t0, t0 + 0.15));
  g.save(); g.translate(W / 2, 170); g.scale(k, k); g.rotate(-0.06);
  pxText(g, 'LIE DETECTED!', 0, -22, 26, Math.floor(t * 10) % 2 ? '#ff2a2a' : '#ffe14a', 'center'); arText(g, '!كداااب', 0, 10, 40, '#fff', 'center', 'ReemKufi');
  g.restore();
}
function drawResult(g, t) {
  if (t < 52.0 || t >= T_ENDC + 0.2) return; const a = t - 52.0;
  const k = easeOut(clamp(a / 0.3)); const y = lerp(-90, 24, k);
  g.fillStyle = 'rgba(20,20,30,0.95)'; g.fillRect(60, y, W - 120, 84); g.strokeStyle = '#ffd400'; g.lineWidth = 3; g.strokeRect(60, y, W - 120, 84);
  g.fillStyle = '#ffd400'; g.fillRect(82, y + 18, 34, 26); g.fillRect(94, y + 44, 10, 12); g.fillRect(86, y + 56, 26, 6);
  pxText(g, 'ACHIEVEMENT UNLOCKED', 140, y + 14, 10, '#ffd400', 'left', false);
  arText(g, 'متطوع البلكونة', W - 76, y + 30, 28, '#fff');
  pxText(g, 'BALCONY VOLUNTEER', 140, y + 58, 9, '#9fd0ff', 'left', false);
  if (a > 1.5) { const k2 = easeBack(seg(t, 53.5, 53.75)); g.save(); g.translate(W / 2, 170); g.scale(k2, k2); pxText(g, 'LIE DETECTED', 0, -10, 18, '#ff4040', 'center'); g.restore(); }
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
  if (whistleAt(t) && t < T_BALC) { ctx.fillStyle = `rgba(255,0,0,${0.12 + 0.1 * Math.abs(Math.sin(t * 20))})`; ctx.fillRect(0, 0, W, H); }
  h.clearRect(0, 0, W, H);
  drawItemCard(h, t); drawMeter(h, t); drawLie(h, t); drawResult(h, t); drawDialogue(h, t); drawEnd(h, t); drawTitle(h, t);
  ctx.drawImage(hud, 0, 0);
  vignette(ctx, 0.35);
  if (t >= T_REVEAL && t < T_REVEAL + 0.05) { ctx.fillStyle = 'rgba(255,255,255,0.45)'; ctx.fillRect(0, 0, W, H); }
  if (t >= T_BALC - 0.3 && t < T_BALC + 0.3) { ctx.fillStyle = `rgba(0,0,0,${1 - Math.abs(t - T_BALC) / 0.3})`; ctx.fillRect(0, 0, W, H); }
  return true;
};
window.frameData = () => out.toDataURL('image/png');
window.DUR = DUR;
document.fonts.load('10px PS2P').then(() => document.fonts.load('20px Lalezar', 'ع')).then(() => document.fonts.load('700 20px ReemKufi', 'ع')).then(() => {
  const g = jerseyTex.userData.g; g.fillStyle = '#d4141c'; g.fillRect(0, 0, 32, 32); g.fillStyle = '#fff'; g.fillRect(0, 2, 32, 2); g.font = '12px PS2P'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('10', 16, 18); jerseyTex.needsUpdate = true;
  window.READY = true;
});
