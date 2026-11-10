
// =====================================================================
// شروط الرجوع — morning: back inside, terms & conditions, power returns
// =====================================================================
const T_POWER = 26.3, T_FREEZE = 32.95;
mattress.visible = true; blanket.visible = true; pillowB.visible = true; dish.visible = true;

// ---------- morning versions of the textures ----------
const dawnTex = canvasTex(128, 64, (g) => {
  const gr = g.createLinearGradient(0, 0, 0, 64); gr.addColorStop(0, '#7fb6ff'); gr.addColorStop(0.6, '#ffd6a0'); gr.addColorStop(1, '#ffb070'); g.fillStyle = gr; g.fillRect(0, 0, 128, 64);
  g.fillStyle = '#fff3c0'; g.beginPath(); g.arc(30, 44, 9, 0, 7); g.fill();
  const r = rng(5); for (let x = 0; x < 128; x += 7) { const h = 10 + r() * 16 | 0; g.fillStyle = '#b48a6a'; g.fillRect(x, 64 - h, 6, h); g.fillStyle = '#ddd'; if (r() > 0.6) g.fillRect(x + 2, 64 - h - 2, 2, 2); }
  g.fillStyle = '#b48a6a'; g.fillRect(40, 22, 3, 42); g.fillRect(38, 30, 7, 2); g.fillRect(39, 19, 5, 3);
});
skyB.material.map = dawnTex; skyB.material.needsUpdate = true;
const dayWinTex = canvasTex(32, 32, (g) => { const gr = g.createLinearGradient(0, 0, 0, 32); gr.addColorStop(0, '#9cc8ff'); gr.addColorStop(1, '#ffe0b0'); g.fillStyle = gr; g.fillRect(0, 0, 32, 32); const r = rng(8); for (let x = 0; x < 32; x += 5) { const h = 6 + r() * 12 | 0; g.fillStyle = '#b48a6a'; g.fillRect(x, 32 - h, 4, h); } });
win.children[0].material.map = dayWinTex; win.children[0].material.needsUpdate = true;
const sun = new THREE.DirectionalLight(0xffe2b0, 0); sun.position.set(-6, 5, -1); scene.add(sun);

// balcony door panel (hinged), opened by Om Hamada
const bDoor = new THREE.Group(); bDoor.position.set(1.7 - 0.475, 0, -1.25); balcony.add(bDoor);
mesh(box(0.95, 2.1, 0.05), M(0x6a4220, { map: woodTex }), 0.475, 1.05, 0, bDoor);
mesh(new THREE.PlaneGeometry(0.6, 0.8), new THREE.MeshBasicMaterial({ color: 0x9fb6d0 }), 0.475, 1.45, 0.03, bDoor);
// ceiling lamp (living room) + its light
const lamp = mesh(new THREE.SphereGeometry(0.22, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0x555555, side: THREE.DoubleSide }), 0, 3.0, -1.0, room); lamp.rotation.x = Math.PI;
const lampLight = new THREE.PointLight(0xfff0d0, 0, 9, 1.1); lampLight.position.set(0, 2.7, -1.0); scene.add(lampLight);
// router on the TV stand (power-on blinking)
const r5 = mesh(box(0.28, 0.06, 0.18), P(0xffffff), -0.6, 0.58, -3.45, room);
const r5led = mesh(box(0.2, 0.015, 0.01), new THREE.MeshBasicMaterial({ color: 0x111111 }), -0.6, 0.6, -3.355, room);
// hose + flying plates from the kitchen
let hose5 = null; const hoseMat5 = M(0xc0201a);
const plates = []; for (let i = 0; i < 8; i++) { const p = mesh(cyl(0.2, 0.15, 0.035, 8), P(0xffffff), 0, 0, 0, scene); p.visible = false; plates.push(p); }

${SHARED}

// ---------- TV ----------
function drawTV5(t) {
  const g = tvTex.userData.g, w = 128, h = 96;
  if (t < T_POWER) { g.fillStyle = '#0c0c10'; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(255,255,255,0.06)'; g.fillRect(10, 8, 40, 20); }
  else if (t < T_POWER + 0.35) { const f = Math.floor(t * 15); const img = g.createImageData(w, h); for (let i = 0; i < w * h; i++) { const v = hash(i * 0.731 + f * 13.1) * 220; img.data[i * 4] = img.data[i * 4 + 1] = img.data[i * 4 + 2] = v; img.data[i * 4 + 3] = 255; } g.putImageData(img, 0, 0); }
  else {
    g.fillStyle = '#4fb0ff'; g.fillRect(0, 0, w, 40); g.fillStyle = '#d9c27a'; g.fillRect(0, 40, w, 56);
    for (let y = 40; y < h; y++) { const k = (y - 40) / 56; const half = 6 + k * 70; g.fillStyle = '#555'; g.fillRect(64 - half, y, half * 2, 1); const z = 1 / (k + 0.05); if (Math.floor(z * 2 + t * 6) % 2) { g.fillStyle = '#fff'; g.fillRect(63 - k * 2, y, 2 + k * 4, 1); } }
    const bx = 50 + Math.sin(t * 2.1) * 8, by = 66; g.fillStyle = '#f2f2f2'; g.fillRect(bx, by, 30, 20); g.fillStyle = '#1f5fd8'; g.fillRect(bx, by + 11, 30, 3); g.fillStyle = '#223'; g.fillRect(bx + 3, by + 3, 24, 6);
    g.fillStyle = '#000'; g.fillRect(0, 0, w, 10); g.fillStyle = '#ffe14a'; g.font = '6px PS2P'; g.textAlign = 'left'; g.textBaseline = 'top'; g.fillText('LAP 1/3', 2, 2);
    g.textAlign = 'center'; g.fillStyle = Math.floor(t * 4) % 2 ? '#ff4040' : '#fff'; g.fillText('VOLUME MAX', 64, 30);
  }
  g.fillStyle = 'rgba(0,0,0,0.22)'; for (let y = 0; y < h; y += 2) g.fillRect(0, y, w, 1);
  tvTex.needsUpdate = true;
}

const KEYS = {};
KEYS.dadB = [[0, { y: -0.7, lL: 1.45, lR: 1.45, aLz: 0.3, aRz: 0.3, bend: -0.3, hx: 0.4, hz: 0.3 }], [1.6, { y: -0.7, lL: 1.45, lR: 1.45, aLz: 2.4, aRz: 2.4, eL: 0.3, eR: 0.3, bend: 0.05, hx: -0.1 }, 0.3], [2.6, { y: -0.7, lL: 1.45, lR: 1.45, aLz: 0.4, aRz: 0.4, bend: 0.0, hy: 0.4 }, 0.3]];
KEYS.sonB = [[0, { y: -0.62, lL: 1.45, lR: 1.45, aLz: 0.3, aRz: 0.3, bend: -0.4, hx: 0.5, hz: -0.3 }], [2.0, { y: -0.62, lL: 1.45, lR: 1.45, aLz: 0.3, aRz: 0.3, bend: 0.05, hy: 0.5 }, 0.3], [3.74, { y: -0.5, lL: 1.45, lR: 1.45, aLz: 2.4, aRz: 2.4, eL: 0.3, eR: 0.3, bend: -0.1, hy: 0.6, hx: -0.15 }, 0.12]];
KEYS.mom = [
  [0, { aLz: 0.3, aRz: 0.3 }],
  [0.6, { aRx: 0.8, aRz: 0.6, eR: 0.4, aLz: 0.3 }, 0.3],
  [1.8, { aLz: 0.3, aRz: 0.3, hz: 0.15 }],
  [4.96, { aLx: 1.0, eL: 1.8, aRx: 0.9, eR: 1.2, aRz: 0.2, hx: 0.05 }],
  [6.2, { aLx: 1.0, eL: 1.8, aRx: 2.6, aRz: 0.2, eR: 0.2, hx: -0.05 }, 0.12],
  [8.3, { aLx: 1.0, eL: 1.8, aRx: 2.6, aRz: 0.35, eR: 0.2, tr: 1, hx: -0.05, hz: 0.1 }, 0.12],
  [10.7, { aLx: 1.25, eL: 1.95, aRx: 1.15, eR: 2.0, aLz: -0.2, aRz: -0.25 }],
  [12.8, { aLx: 1.25, eL: 1.95, aRx: 1.15, eR: 2.0, aLz: -0.2, aRz: -0.25, hx: -0.05, bend: 0.1 }],
  [19.0, { aLz: 0.95, eL: 1.9, aRz: 0.95, eR: 1.9 }],
  [T_POWER, { aLz: 2.4, aRz: 2.4, eL: 0.3, eR: 0.3, hx: -0.5 }, 0.15],
  [28.3, { aLz: 0.95, eL: 1.9, aRz: 0.95, eR: 1.9, hx: -0.2 }],
  [29.6, { aLz: 2.6, aRz: 2.6, eL: 0.2, eR: 0.2, hx: -0.1, y: 0.05 }, 0.1],
  [36.9, { aRx: 1.6, aRz: 0.9, eR: 0.0, aLz: 0.95, eL: 1.9, bend: 0.15, twist: 0.4, hy: 0.4 }, 0.1],
];
KEYS.dad = [
  [0, { aLz: 0.2, aRz: 0.2, bend: 0.1, hx: 0.1 }],
  [11.1, { aRz: 2.9, eR: 0.0, aLz: 0.2, bend: 0.05, hx: -0.1, hz: 0.12 }, 0.12],
  [12.5, { aLz: 0.2, aRz: 0.2, bend: 0.25, hx: 0.25 }],
  [15.4, { aLx: 1.4, eL: 1.5, aRx: 1.4, eR: 1.5, aLz: -0.3, aRz: -0.3, bend: 0.2, hx: 0.1 }, 0.1],
  [21.4, { aRx: 1.2, eR: 1.6, aRz: 0.3, aLz: 0.2, bend: 0.2, twist: -0.3, hy: -0.35, hx: 0.05 }, 0.15],
  [26.3, { aLz: 2.4, aRz: 2.4, eL: 0.3, eR: 0.3, hx: -0.5 }, 0.15],
  [28.6, { aLx: 1.6, eL: 2.4, aRx: 1.6, eR: 2.4, aLz: 0.4, aRz: 0.4, bend: -0.25, hx: -0.15 }, 0.1],
  [30.0, { aLz: 2.6, aRz: 2.6, eL: 0.2, eR: 0.2, bend: -0.2, y: 0.08 }, 0.1],
];
KEYS.son = [
  [0, { aLz: 0.2, aRz: 0.2, hx: 0.05 }],
  [6.0, { aLz: 0.2, aRz: 0.2, hx: 0.25, hy: 0.4 }],
  [12.8, { aLx: 1.0, eL: 1.2, aRx: 1.0, eR: 1.2, aLz: -0.2, aRz: -0.2, bend: 0.1, hx: 0.1 }],
  [19.25, { aRx: 1.3, eR: 1.4, aLz: 0.2, bend: 0.15, hx: 0.1 }, 0.1],
  [21.4, { aLz: 0.2, aRz: 0.2, bend: 0.2, twist: 0.3, hy: 0.35, hx: 0.05 }, 0.15],
  [26.3, { aLz: 2.4, aRz: 2.4, eL: 0.3, eR: 0.3, hx: -0.5 }, 0.15],
  [29.6, { aLx: 1.6, eL: 2.4, aRx: 1.6, eR: 2.4, aLz: 0.4, aRz: 0.4, bend: -0.25 }, 0.1],
  [30.4, { aLz: 2.6, aRz: 2.6, eL: 0.2, eR: 0.2, bend: -0.2, y: 0.08 }, 0.1],
];
KEYS.walk = [[38.62, { aLz: 0.15, aRz: 0.15, bend: 0.3, hx: 0.4 }]];

const MOM_P = V(0.3, 0, -2.55), DAD_P = V(-0.55, 0, -0.75), SON_P = V(0.65, 0, -0.75);
function placeHose(t) {
  if (hose5) { scene.remove(hose5); hose5.geometry.dispose(); }
  if (t < 29.6 || t >= T_FREEZE + 3.7) { hose5 = null; return; }
  const pts = []; const k = clamp((t - 29.6) / 0.5);
  for (let i = 0; i <= 7; i++) { const f = i / 7; pts.push(V(4.9 - f * 1.6 * k + Math.sin(t * 9 + i) * 0.4 * f * k, 1.0 + f * 0.8 * k + Math.cos(t * 7 + i) * 0.3 * f * k, 1.0 + Math.sin(t * 5 + i * 1.3) * 0.5 * f * k)); }
  hose5 = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 30, 0.05, 5), hoseMat5); scene.add(hose5);
}
const isBalc = t => t < 4.96 || t >= 38.62;
function stateAt(t) {
  const balc = isBalc(t), hallShot = t >= 29.6 && t < 31.3;
  balcony.visible = balc; room.visible = !balc; hallway.visible = !balc;
  scene.background = new THREE.Color(balc ? 0xffd6a0 : 0x101010);
  scene.fog = balc ? new THREE.Fog(0xffd6a0, 12, 40) : null;
  drawTV5(t);
  const power = t >= T_POWER;
  // lighting: morning
  ambient.color.setHex(0xfff0e0); ambient.intensity = balc ? 1.0 : 0.85;
  moon.intensity = 0; sun.intensity = balc ? 1.6 : 1.2; sun.position.set(balc ? 4 : -6, 5, balc ? 6 : -1);
  balcLight.intensity = balc && t < 4.96 && t > 0.6 ? 2.5 : 0; balcLight.position.set(1.7, 1.4, -0.6);
  bDoorGlow.material.color.setHex(0xffe8c0);
  const flick = power && t < T_POWER + 0.6 ? (hash(Math.floor(t * 20)) > 0.4 ? 1 : 0) : 1;
  lampLight.intensity = power && !balc ? 3.5 * flick * (t > 29.6 && t < T_FREEZE ? (hash(Math.floor(t * 12)) > 0.3 ? 1 : 0.4) : 1) : 0;
  lamp.material.color.setHex(power && flick ? 0xfff6d0 : 0x555555);
  tvLight.intensity = power && !balc ? 4 * (0.85 + 0.15 * noise1(t * 7)) : 0; tvLight.color.setHex(0x6fb8ff);
  hallLight.intensity = !balc ? (power ? 6 + 4 * Math.abs(noise1(t * 8)) : 1.5) : 0; hallLight.color.setHex(power && t > 29.2 ? 0xff8030 : 0xffc070);
  hallLight.position.set(6.5, 2.0, 1.0);
  kitchenGlow.material.color.setHex(power && t > 29.2 ? (Math.floor(t * 10) % 2 ? 0xff8a30 : 0xffc060) : 0xfff0c0);
  r5led.material.color.setHex(power ? (Math.floor(t * 10) % 2 ? 0x3df05a : 0x115511) : 0x111111);
  // balcony door
  let dr = 0;
  if (t >= 0.5 && t < 4.96) dr = -1.6 * easeOut(seg(t, 0.5, 1.2));
  if (t >= 38.62) dr = -1.6 * (1 - easeIn(seg(t, 39.4, 39.7)));
  bDoor.rotation.y = dr;
  // door to hallway stays open
  doorPivot.rotation.y = -1.9; hallGlowMat.color.setHex(0xffd8a0);
  // shake during chaos
  room.position.set(0, 0, 0);
  if (t >= 29.2 && t < T_FREEZE) { const a = 0.02; room.position.set(noise1(t * 30) * a, Math.abs(noise1(t * 27)) * a, 0); }
  placeHose(t >= T_FREEZE ? Math.min(t, T_FREEZE) : t);

  // ---- characters ----
  dad.afro.visible = false; dad.extras.setGoggles(false);
  if (balc) {
    if (t < 4.96) {
      dad.root.position.set(-0.75, 0.14, -0.55); dad.root.rotation.set(0, 0.15, 0); applyPose(dad, poseAt(t, KEYS.dadB));
      son.root.position.set(0.25, 0.14, -0.5); son.root.rotation.set(0, -0.15, 0); applyPose(son, poseAt(t, KEYS.sonB));
      mom.root.position.set(1.7, 0, -1.2); mom.root.rotation.y = -0.3; mom.root.visible = t >= 0.7;
      blanket.visible = true; pillowB.visible = true; mattress.visible = true;
    } else {
      const k = seg(t, 38.62, 39.3);
      dad.root.position.set(lerp(1.6, 0.0, k), 0, lerp(-1.0, 0.2, k)); dad.root.rotation.set(0, 0.2, 0);
      son.root.position.set(lerp(1.9, 0.9, k), 0, lerp(-0.9, 0.3, k)); son.root.rotation.set(0, -0.2, 0);
      const wp = poseAt(t, KEYS.walk); const w = Math.sin(t * 8) * (k < 1 ? 0.4 : 0);
      applyPose(dad, { ...wp, lL: w, lR: -w }); applyPose(son, { ...wp, lL: -w, lR: w });
      mom.root.visible = false; blanket.visible = false; pillowB.visible = false;
    }
    mom.root.visible = mom.root.visible && t < 4.96;
    applyPose(mom, poseAt(t, KEYS.mom));
    samir.root.visible = t >= 38.62; samir.root.position.set(-0.4, 0.09, 0.85);
    applyPose(samir, { ...POSE0, bend: 0.35, aRx: 1.3, eR: 1.6, aLx: 0.6, eL: 0.4, hx: 0.5 }); cane.visible = false;
  } else {
    samir.root.visible = false;
    mom.root.visible = true; mom.root.position.copy(MOM_P); mom.root.rotation.set(0, 0, 0);
    const mz = poseAt(t, KEYS.mom); if (t >= 36.9) mom.root.rotation.y = -0.6;
    applyPose(mom, mz);
    dad.root.position.copy(DAD_P); dad.root.rotation.set(0, Math.PI, 0);
    son.root.position.copy(SON_P); son.root.rotation.set(0, Math.PI, 0);
    const dz = poseAt(t, KEYS.dad), sz = poseAt(t, KEYS.son);
    if (t >= 21.4 && t < 26.3) { dad.root.position.x += 0.18; son.root.position.x -= 0.18; }
    if (t >= 19.25 && t < 20.94) { const tap = Math.abs(Math.sin((t - 19.25) * Math.PI * 1.9)); sz.aRx = 1.0 + tap * 0.4; sz.hx = 0.1 + tap * 0.2; }
    if (t >= 29.6 && t < T_FREEZE) { dad.root.position.y = Math.abs(Math.sin(t * 12)) * 0.05; son.root.position.y = Math.abs(Math.sin(t * 12 + 1)) * 0.05; }
    if (t >= 36.9) { dad.root.rotation.y = Math.PI - 0.4; son.root.rotation.y = Math.PI - 0.6; Object.assign(dz, { bend: 0.35, hx: 0.4, aLz: 0.1, aRz: 0.1 }); Object.assign(sz, { bend: 0.35, hx: 0.4, aLz: 0.1, aRz: 0.1 }); }
    applyPose(dad, dz); applyPose(son, sz);
  }
  // plates flying out of the hallway
  plates.forEach((p, i) => { const t0 = 30.0 + i * 0.32; const a = Math.min(t, T_FREEZE) - t0; p.visible = !balc && a > 0 && a < 1.0; if (p.visible) { const from = V(4.7, 1.2 + hash(i) * 0.6, 1.0), to = V(-2.5 + hash(i + 2) * 3, 0.6 + hash(i + 3) * 1.6, -2.5 + hash(i + 4) * 2); p.position.copy(VL(from, to, a)); p.position.y += Math.sin(a * Math.PI) * 0.6; p.rotation.set(a * 12, a * 8, a * 5); } });

  // particles: smoke from the hallway
  const smoke = [];
  if (!balc && t >= 29.2) { const tt2 = Math.min(t, T_FREEZE); for (let i = 0; i < 20; i++) { const ph = (tt2 * 0.6 + i / 20) % 1; smoke.push({ pos: V(lerp(7.5, 2.5, ph) + Math.sin(i) * 0.3, 1.8 + ph * 0.9 + Math.cos(i * 2) * 0.2, 1.0 + (hash(i) - .5) * 1.2 * ph), size: 0.5 + ph * 1.1, op: 0.65 * (1 - ph * 0.6), color: hash(i + 1) > 0.5 ? 0x444444 : 0x666666 }); } }
  emit(smoke, puffPool);
  const stars = [];
  if (!balc && t >= 29.2 && t < T_FREEZE) { const tb = Math.floor(t * 8) / 8; const r = rng(Math.floor(t * 8)); for (let j = 0; j < 8; j++) { const age = t - tb; stars.push({ pos: V(6.0 + (r() - .5) * 2, 1.0 + r() * 1.5 + age, 1.0 + (r() - .5)), size: 0.18, rot: j }); } }
  if (balc && t < 4.96 && t >= 3.74) { const hd = son.head.getWorldPosition(V(0, 0, 0)); for (let i = 0; i < 4; i++) { const a = t * 4 + i * 1.57; stars.push({ pos: hd.clone().add(V(Math.cos(a) * 0.4, 0.3, Math.sin(a) * 0.4)), size: 0.1, rot: t * 3 }); } }
  emit(stars, starPool);
  emit([], sweatPool);
  const sw = [];
  if (!balc && ((t >= 12.8 && t < 17.0) || (t >= 21.4 && t < 26.0) || (t >= 28.6 && t < T_FREEZE))) for (const c of [dad, son]) { const hd = c.head.getWorldPosition(V(0, 0, 0)); for (let i = 0; i < 2; i++) { const k = (t * 1.2 + i * 0.5) % 1; sw.push({ pos: hd.clone().add(V((i ? 1 : -1) * 0.26, 0.18 - k * 0.5, -0.05)), size: 0.07, op: 1 - k }); } }
  emit(sw, trailPool);
  laundry.forEach((c, i) => { c.rotation.y = Math.sin(t * 1.3 + i) * 0.25; });

  // ---- faces ----
  let me = 'normal', mm = talkMouth(t, 'mom') || 'smile';
  if (t < 4.96) me = 'smug';
  else if (t < 10.7) { me = 'flat'; mm = talkMouth(t, 'mom') || 'flat'; }
  else if (t < 12.8) { me = 'flat'; mm = 'flat'; }
  else if (t < 17.0) { me = 'menace'; mm = talkMouth(t, 'mom') || 'evil'; }
  else if (t < T_POWER) { me = 'smug'; mm = 'smile'; }
  else if (t < 29.6) { me = 'sparkle'; mm = talkMouth(t, 'mom') || 'grin'; }
  else if (t < 36.9) { me = 'pin'; mm = 'o'; }
  else { me = 'angry'; mm = talkMouth(t, 'mom', 'scream') || 'clench'; }
  let de = 'tired', dm = 'closed';
  if (t < 1.6) { de = 'closed'; dm = 'o'; }
  else if (t < 4.96) { de = 'tired'; dm = 'smile'; }
  else if (t < 11.1) { de = 'normal'; dm = 'flat'; }
  else if (t < 12.8) { de = 'sparkle'; dm = talkMouth(t, 'dad') || 'fakegrin'; }
  else if (t < 17.33) { de = 'wide'; dm = 'wobble'; }
  else if (t < 21.4) { de = 'normal'; dm = 'flat'; }
  else if (t < T_POWER) { de = 'side'; dm = talkMouth(t, 'dad') || 'flat'; }
  else if (t < 28.6) { de = 'sparkle'; dm = 'grin'; }
  else if (t < 36.9) { de = 'pin'; dm = talkMouth(t, 'dad', 'scream') || 'scream'; }
  else { de = 'sad'; dm = 'frown'; }
  let se = 'normal', sm = 'closed';
  if (t < 2.0) { se = 'closed'; sm = 'tongue'; }
  else if (t < 3.74) { se = 'tired'; sm = 'flat'; }
  else if (t < 4.96) { se = 'sparkle'; sm = talkMouth(t, 'son', 'scream') || 'grin'; }
  else if (t < 12.8) { se = 'normal'; sm = 'flat'; }
  else if (t < 17.33) { se = 'wide'; sm = 'wobble'; }
  else if (t < 21.4) { se = 'sparkle'; sm = talkMouth(t, 'son') || 'grin'; }
  else if (t < T_POWER) { se = 'side'; sm = talkMouth(t, 'son') || 'flat'; }
  else if (t < 28.6) { se = 'sparkle'; sm = 'grin'; }
  else if (t < 36.9) { se = 'pin'; sm = 'scream'; }
  else { se = 'sad'; sm = 'frown'; }
  const blink = (list) => list.some(b => t >= b && t < b + 0.18);
  if (blink([8.0, 14.5, 23.0, 40.0]) && me !== 'pin') me = 'closed';
  if (blink([9.0, 18.0, 40.4])) { de = 'closed'; se = 'closed'; }
  mom.faceMat.map = faceTexture(me, mm, {}); mom.faceMat.needsUpdate = true;
  dad.faceMat.map = faceTexture(de, dm, { stache: true }); dad.faceMat.needsUpdate = true;
  son.faceMat.map = faceTexture(se, sm, { fuzz: true }); son.faceMat.needsUpdate = true;
  samir.faceMat.map = faceTexture('smug', 'smile', { stache: true, stacheColor: '#eeeeee', glasses: true }); samir.faceMat.needsUpdate = true;
}

function cameraAt(t) {
  if (t < 3.74) { const k = seg(t, 0, 3.74); cam(VL(V(0.3, 1.5, 2.9), V(0.4, 1.3, 2.3), k), V(0.6, 0.8, -0.8), 50); }
  else if (t < 4.96) { faceCam(son, 1.1, 0.25, 0.05, 48, 0.05); }
  else if (t < 11.1) { const k = seg(t, 4.96, 11.1); cam(VL(V(3.1, 1.6, -0.5), V(2.8, 1.55, -0.9), k), V(-0.1, 1.1, -1.7), 52); }
  else if (t < 12.8) { faceCam(dad, 1.25, -0.35, 0.1, 50, 0.15); }
  else if (t < 17.33) { const k = seg(t, 12.8, 17.0); faceCam(mom, lerp(1.75, 1.3, k), 0.05, -0.05, 44, 0.06); }
  else if (t < 21.44) { faceCam(son, 1.35, 0.4, 0.15, 50, 0.15); }
  else if (t < 26.3) { cam(V(0.05, 1.5, -1.95), V(0.05, 1.3, -0.75), 70); }
  else if (t < 28.6) { faceCam(mom, 1.6, 0.4, -0.35, 54, -0.15); }
  else if (t < 29.6) { faceCam(dad, 1.05, -0.2, 0.0, 46, 0.05); camera.position.add(shake(t, 0.03, 25)); }
  else if (t < 31.3) { const k = seg(t, 29.6, 31.3); cam(VL(V(4.7, 1.3, 1.0), V(4.9, 1.35, 1.0), k).add(shake(t, 0.05, 25)), V(9.0, 1.4, 1.0), 56); }
  else if (t < 36.9) { const tt = Math.min(t, T_FREEZE); cam(V(3.8, 2.4, 2.4).add(shake(tt, 0.04, 22)), V(-0.4, 0.9, -1.6), 58); }
  else if (t < 38.62) { faceCam(mom, 1.7, -0.6, -0.4, 56, -0.1); }
  else { const k = easeInOut(seg(t, 38.62, 41.3)); cam(VL(V(0.4, 1.4, 2.9), V(0.4, 1.9, 3.8), k), V(0.3, 1.3, -0.4), 54); }
}

// ---------- HUD ----------
const NAMES = { mom: ['أم حمادة', 'OM HAMADA', '#1f9e5a'], son: ['حمادة', 'HAMADA', '#d4141c'], dad: ['إبراهيم', 'IBRAHIM', '#c9a227'] };
function portrait(g, x, y, who, t) {
  g.fillStyle = '#123'; g.fillRect(x, y, 64, 64); g.strokeStyle = '#fff'; g.lineWidth = 2; g.strokeRect(x, y, 64, 64);
  g.save(); g.beginPath(); g.rect(x + 2, y + 2, 60, 60); g.clip();
  if (who === 'mom') { g.fillStyle = '#1f9e5a'; g.beginPath(); g.arc(x + 32, y + 34, 27, 0, 7); g.fill(); g.fillStyle = '#c98d5f'; g.beginPath(); g.arc(x + 32, y + 38, 19, 0, 7); g.fill(); g.fillStyle = '#ec86ad'; g.fillRect(x + 6, y + 58, 52, 6); }
  else if (who === 'son') { g.fillStyle = '#d4141c'; g.fillRect(x + 8, y + 54, 48, 10); g.fillStyle = '#b98058'; g.beginPath(); g.arc(x + 32, y + 36, 19, 0, 7); g.fill(); g.fillStyle = '#17110c'; for (let i = 0; i < 7; i++) { g.beginPath(); g.arc(x + 14 + i * 6, y + 18 + (i % 2) * 3, 7, 0, 7); g.fill(); } }
  else { g.fillStyle = '#f3f0e3'; g.fillRect(x + 10, y + 54, 44, 10); g.fillStyle = '#b27448'; g.beginPath(); g.arc(x + 32, y + 36, 20, 0, 7); g.fill(); g.fillStyle = '#1b1410'; g.fillRect(x + 10, y + 30, 5, 12); g.fillRect(x + 49, y + 30, 5, 12); g.fillStyle = '#c9a227'; g.fillRect(x + 14, y + 16, 36, 5); g.fillStyle = '#335a3a'; g.fillRect(x + 18, y + 15, 10, 7); g.fillRect(x + 36, y + 15, 10, 7); }
  const fc = document.createElement('canvas'); fc.width = 32; fc.height = 32; const fg = fc.getContext('2d');
  const e = envAt(t); const mouth = speakerAt(t) === who ? (e < 0.1 ? 'closed' : e < 0.4 ? 'talk1' : 'talk2') : 'closed';
  const eyes = who === 'mom' ? (t > 12.8 && t < 17 ? 'menace' : t > 36 ? 'angry' : 'smug') : who === 'son' ? (t > 28 ? 'pin' : 'sparkle') : (t > 28 ? 'pin' : 'sparkle');
  drawFace(fg, 32, eyes, mouth, { stache: who === 'dad', fuzz: who === 'son' });
  g.imageSmoothingEnabled = false; g.drawImage(fc, x + 14, y + 20, 36, 36); g.restore();
}
function drawTitle(g, t) {
  if (t >= 1.6) return; const op = t < 1.2 ? 1 : 1 - seg(t, 1.2, 1.6);
  g.globalAlpha = op; g.fillStyle = 'rgba(0,0,0,0.6)'; g.fillRect(0, 196, W, 76);
  arText(g, 'شروط الرجوع', W / 2, 198, 40, '#ffe14a', 'center', 'ReemKufi'); pxText(g, 'TERMS OF RETURN', W / 2, 250, 10, '#fff', 'center'); g.globalAlpha = 1;
}
function drawRules(g, t) {
  if (t < 6.2 || t >= 19.0) return;
  const x = 18, y = 14, w = 300;
  const rows = [[6.2, 'ممنوع الاختراعات', 'NO INVENTIONS', '#3df05a'], [8.3, 'ممنوع البلايستيشن بعد 12', 'NO CONSOLE AFTER 00:00', '#3df05a'], [13.7, 'المطبخ = البلكونة للأبد', 'KITCHEN = BALCONY FOREVER', '#ff3030']];
  const n = rows.filter(r => t >= r[0]).length; const hh = 40 + n * 46;
  g.fillStyle = 'rgba(0,0,30,0.82)'; g.fillRect(x, y, w, hh); g.strokeStyle = '#fff'; g.lineWidth = 2; g.strokeRect(x, y, w, hh);
  pxText(g, 'HOUSE RULES', x + 10, y + 8, 10, '#ffe14a'); arText(g, 'قوانين البيت', x + w - 10, y + 2, 18, '#fff');
  rows.forEach(([t0, ar, en, col], i) => {
    if (t < t0) return; const k = easeBack(seg(t, t0, t0 + 0.2)); const yy = y + 36 + i * 46;
    g.save(); g.translate(x + w / 2, yy + 20); g.scale(k, k); g.translate(-(x + w / 2), -(yy + 20));
    g.fillStyle = col; g.fillRect(x + 10, yy + 4, 30, 30); pxText(g, String(i + 1), x + 18, yy + 12, 14, '#000', 'left', false);
    arText(g, ar, x + w - 10, yy, 20, i === 2 ? '#ff6060' : '#fff'); pxText(g, en, x + 48, yy + 28, 7, '#9fd0ff');
    g.restore();
  });
}
function drawTerms(g, t) {
  if (t < 17.33 || t >= 21.4) return;
  const k = easeBack(seg(t, 17.33, 17.55)); g.save(); g.translate(W / 2, 200); g.scale(k, k);
  g.fillStyle = 'rgba(230,230,240,0.97)'; g.fillRect(-230, -150, 460, 280); g.strokeStyle = '#1f5fd8'; g.lineWidth = 4; g.strokeRect(-230, -150, 460, 280);
  g.fillStyle = '#1f5fd8'; g.fillRect(-230, -150, 460, 30); pxText(g, 'TERMS & CONDITIONS', -220, -142, 10, '#fff', 'left', false);
  // wall of tiny text, scrolling
  g.save(); g.beginPath(); g.rect(-220, -112, 440, 150); g.clip();
  g.fillStyle = '#555'; const off = (t - 17.33) * 60;
  for (let i = 0; i < 40; i++) { const yy = -110 + i * 8 - off % 8 - Math.floor(off / 8) * 0; for (let j = 0; j < 9; j++) g.fillRect(-215 + j * 48, yy, 30 + hash(i * 9 + j) * 14, 3); }
  g.restore();
  g.fillStyle = '#111'; g.font = '14px Lalezar'; g.textAlign = 'center'; g.direction = 'rtl'; g.textBaseline = 'top'; g.fillText('بندخولك البيت إنت موافق على 4,382 شرط', 0, 44);
  // buttons
  const clicks = [19.35, 19.9, 20.45].filter(c => t >= c).length;
  g.fillStyle = '#3df05a'; g.fillRect(-200, 76, 180, 40); pxText(g, 'I ACCEPT', -110, 90, 10, '#000', 'center', false);
  if (clicks) pxText(g, 'x' + clicks, -30, 66, 10, '#ff2020', 'center', false);
  g.fillStyle = '#999'; g.fillRect(20, 76, 180, 40); pxText(g, 'DECLINE', 110, 90, 10, '#666', 'center', false);
  g.strokeStyle = '#ff2020'; g.lineWidth = 3; g.beginPath(); g.moveTo(20, 76); g.lineTo(200, 116); g.stroke();
  // cursor
  const cx = -110 + Math.sin(t * 20) * (t > 19.25 && t < 20.94 ? 4 : 0), cy = 96 + ([19.35, 19.9, 20.45].some(c => t >= c && t < c + 0.1) ? 3 : 0);
  g.fillStyle = '#fff'; g.strokeStyle = '#000'; g.lineWidth = 1; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx, cy + 20); g.lineTo(cx + 5, cy + 15); g.lineTo(cx + 12, cy + 15); g.closePath(); g.fill(); g.stroke();
  g.restore();
}
function drawAchievement(g, t) {
  const a = t - 33.0; if (a < 0 || t >= 36.9) return;
  g.fillStyle = 'rgba(0,0,0,0.35)'; g.fillRect(0, 0, W, H);
  const k = easeOut(clamp(a / 0.3)); const y = lerp(-90, 30, k);
  g.fillStyle = 'rgba(20,20,30,0.95)'; g.fillRect(70, y, W - 140, 84); g.strokeStyle = '#ffd400'; g.lineWidth = 3; g.strokeRect(70, y, W - 140, 84);
  // trophy
  g.fillStyle = '#ffd400'; g.fillRect(92, y + 18, 34, 26); g.fillRect(104, y + 44, 10, 12); g.fillRect(96, y + 56, 26, 6); g.fillStyle = '#c99a00'; g.fillRect(84, y + 22, 8, 14); g.fillRect(126, y + 22, 8, 14);
  pxText(g, 'ACHIEVEMENT UNLOCKED', 150, y + 14, 10, '#ffd400', 'left', false);
  arText(g, 'ساكن البلكونة', W - 86, y + 30, 28, '#fff');
  pxText(g, 'BALCONY RESIDENT', 150, y + 58, 9, '#9fd0ff', 'left', false);
  if (a > 0.6) pxText(g, '+1000G', W - 140, y + 92, 12, '#3df05a', 'left');
  if (a > 1.0) { const k2 = easeBack(seg(t, 34.0, 34.25)); g.save(); g.translate(W / 2, 260); g.scale(k2, k2); pxText(g, 'FREEZE!', 0, -12, 24, '#ff4040', 'center'); g.restore(); }
}
function drawEnd(g, t) {
  const a = t - 39.8; if (a < 0) return; const k = easeOut(clamp(a / 0.4));
  g.fillStyle = `rgba(0,0,0,${0.5 * k})`; g.fillRect(0, 0, W, H);
  g.save(); g.translate(W / 2, 190); g.scale(k, k); arText(g, 'يُتبع...', 0, -40, 54, '#ffe14a', 'center', 'ReemKufi'); pxText(g, 'TO BE CONTINUED', 0, 30, 16, '#fff', 'center'); g.restore();
}
function desat(g, amt) { const img = g.getImageData(0, 0, W, H); const d = img.data; for (let i = 0; i < d.length; i += 4) { const l = d[i] * 0.3 + d[i + 1] * 0.59 + d[i + 2] * 0.11; d[i] = lerp(d[i], l, amt); d[i + 1] = lerp(d[i + 1], l, amt); d[i + 2] = lerp(d[i + 2], l, amt); } g.putImageData(img, 0, 0); }

window.renderFrame = function (t) {
  const st = (t >= T_FREEZE && t < 36.9) ? T_FREEZE : t;
  stateAt(st); cameraAt(st);
  renderer.render(scene, camera);
  ctx.clearRect(0, 0, W, H); ctx.drawImage(glCanvas, 0, 0);
  if (t >= T_FREEZE && t < 36.9) desat(ctx, 0.6);
  if (t >= 12.8 && t < 16.83) { ctx.fillStyle = `rgba(160,0,0,${0.18 + 0.1 * Math.sin(t * 3)})`; ctx.fillRect(0, 0, W, H); }
  h.clearRect(0, 0, W, H);
  drawRules(h, t); drawTerms(h, t); drawDialogue(h, t); drawAchievement(h, t); drawEnd(h, t); drawTitle(h, t);
  ctx.drawImage(hud, 0, 0);
  vignette(ctx, 0.35);
  if (t >= T_POWER && t < T_POWER + 0.06) { ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.fillRect(0, 0, W, H); }
  if (t >= 13.7 && t < 13.76) { ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.fillRect(0, 0, W, H); }
  return true;
};
window.frameData = () => out.toDataURL('image/png');
window.DUR = DUR;
document.fonts.load('10px PS2P').then(() => document.fonts.load('20px Lalezar', 'ع')).then(() => document.fonts.load('700 20px ReemKufi', 'ع')).then(() => {
  const g = jerseyTex.userData.g; g.fillStyle = '#d4141c'; g.fillRect(0, 0, 32, 32); g.fillStyle = '#fff'; g.fillRect(0, 2, 32, 2); g.font = '12px PS2P'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('10', 16, 18); jerseyTex.needsUpdate = true;
  window.READY = true;
});
