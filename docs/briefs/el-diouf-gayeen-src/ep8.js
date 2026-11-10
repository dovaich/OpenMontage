
// =====================================================================
// الضيوف جايين — the living room speedrun + the forbidden salon
// =====================================================================
balcony.visible = false; hallway.visible = true;
const T_ALARM = 8.05, T_HIDE = 19.3, T_DOOR = 24.75, T_MSG = 33.9, T_RES = 44.0, T_ENDC = 51.9;
const dayWinTex = canvasTex(32, 32, (g) => { const gr = g.createLinearGradient(0, 0, 0, 32); gr.addColorStop(0, '#9cc8ff'); gr.addColorStop(1, '#ffe0b0'); g.fillStyle = gr; g.fillRect(0, 0, 32, 32); const r = rng(8); for (let x = 0; x < 32; x += 5) { const h = 6 + r() * 12 | 0; g.fillStyle = '#b48a6a'; g.fillRect(x, 32 - h, 4, h); } });
win.children[0].material.map = dayWinTex; win.children[0].material.needsUpdate = true;
const sun = new THREE.DirectionalLight(0xffe2b0, 1.2); sun.position.set(-6, 5, -1); scene.add(sun);
const alarm = new THREE.PointLight(0xff2020, 0, 12, 1.0); alarm.position.set(0, 2.8, -1); scene.add(alarm);
poster.position.x = 2.9;

// ---------- cut a doorway into the back wall (x -3.8..-2.2) ----------
const back = room.children.find(m => m.isMesh && Math.abs(m.position.z + 4) < 0.01 && m.geometry.parameters && m.geometry.parameters.width === 9);
back.visible = false;
wall(room, 6.7, 3.2, 1.15, 1.6, -4, 0, wallMat);           // x -2.2 .. 4.5
wall(room, 0.7, 3.2, -4.15, 1.6, -4, 0, wallMat);          // x -4.5 .. -3.8
wall(room, 1.6, 0.9, -3.0, 2.75, -4, 0, wallMat);          // above the door
const goldM = P(0xd4a62a, { shininess: 100, specular: 0xffffcc });
mesh(box(1.8, 0.12, 0.08), goldM, -3.0, 2.36, -3.97, room); for (const x of [-3.85, -2.15]) mesh(box(0.1, 2.36, 0.08), goldM, x, 1.18, -3.97, room);
// double doors (hinged at the sides, swing into the salon)
const doorL = new THREE.Group(); doorL.position.set(-3.8, 0, -4.0); room.add(doorL);
const doorR = new THREE.Group(); doorR.position.set(-2.2, 0, -4.0); room.add(doorR);
const doorTex = canvasTex(16, 32, (g) => { g.fillStyle = '#f2ead8'; g.fillRect(0, 0, 16, 32); g.strokeStyle = '#c8a050'; g.lineWidth = 1; g.strokeRect(2.5, 2.5, 11, 12); g.strokeRect(2.5, 17.5, 11, 12); g.fillStyle = '#d4a62a'; g.fillRect(12, 15, 2, 3); });
mesh(box(0.8, 2.3, 0.06), M(0xffffff, { map: doorTex }), 0.4, 1.15, -0.03, doorL); mesh(box(0.8, 2.3, 0.06), M(0xffffff, { map: doorTex }), -0.4, 1.15, -0.03, doorR);
const padlock = new THREE.Group(); padlock.position.set(-3.0, 1.2, -3.85); room.add(padlock);
mesh(box(0.5, 0.45, 0.15), P(0xd4a62a, { shininess: 100 }), 0, 0, 0, padlock); const shackle = mesh(new THREE.TorusGeometry(0.17, 0.05, 5, 10, Math.PI), P(0xbbbbbb, { shininess: 100 }), 0, 0.22, 0, padlock);
mesh(box(0.06, 0.14, 0.02), M(0x111111), 0, -0.02, 0.08, padlock); padlock.visible = false;

// ---------- the salon (behind the back wall) ----------
const salon = new THREE.Group(); room.add(salon);
const velvet = M(0x8a1424), plasticM = new THREE.MeshPhongMaterial({ color: 0xe8f4ff, transparent: true, opacity: 0.35, shininess: 120, specular: 0xffffff, side: THREE.DoubleSide });
const salonWall = M(0xffffff, { map: canvasTex(16, 16, (g) => { g.fillStyle = '#5a1a24'; g.fillRect(0, 0, 16, 16); g.fillStyle = '#c8a050'; g.fillRect(7, 2, 2, 2); g.fillRect(3, 9, 2, 2); g.fillRect(11, 9, 2, 2); }, [6, 3]) });
mesh(new THREE.PlaneGeometry(4, 3.2), salonWall, -3.0, 1.6, -7.5, salon);
const swL = mesh(new THREE.PlaneGeometry(3.5, 3.2), salonWall, -5.0, 1.6, -5.75, salon); swL.rotation.y = Math.PI / 2;
const swR = mesh(new THREE.PlaneGeometry(3.5, 3.2), salonWall, -1.0, 1.6, -5.75, salon); swR.rotation.y = -Math.PI / 2;
const sf = mesh(new THREE.PlaneGeometry(4, 3.5), M(0xffffff, { map: canvasTex(16, 16, (g) => { g.fillStyle = '#9a6a3a'; g.fillRect(0, 0, 16, 16); g.fillStyle = '#7a4a22'; for (let i = 0; i < 16; i += 4) g.fillRect(i, 0, 1, 16); g.fillStyle = '#b07a43'; g.fillRect(0, 7, 16, 1); }, [4, 4]) }), -3.0, 0.002, -5.75, salon); sf.rotation.x = -Math.PI / 2;
const sc = mesh(new THREE.PlaneGeometry(4, 3.5), M(0xf2ead8), -3.0, 3.2, -5.75, salon); sc.rotation.x = Math.PI / 2;
mesh(new THREE.PlaneGeometry(2.6, 2.0), M(0xffffff, { map: carpetTex }), -3.0, 0.01, -5.6, salon).rotation.x = -Math.PI / 2;
function goldChair(x, z, ry, wide) {
  const c = new THREE.Group(); c.position.set(x, 0, z); c.rotation.y = ry; salon.add(c); const w = wide ? 1.7 : 0.75;
  mesh(box(w, 0.18, 0.6), velvet, 0, 0.45, 0, c); mesh(box(w, 0.7, 0.12), velvet, 0, 0.85, -0.28, c);
  mesh(box(w + 0.1, 0.07, 0.07), goldM, 0, 1.22, -0.3, c); mesh(box(w + 0.1, 0.07, 0.07), goldM, 0, 0.36, 0.28, c);
  for (const sx of [-w / 2, w / 2]) { mesh(box(0.07, 0.6, 0.6), goldM, sx, 0.62, 0, c); mesh(cyl(0.035, 0.025, 0.36, 5), goldM, sx, 0.18, 0.25, c); mesh(cyl(0.035, 0.025, 0.36, 5), goldM, sx, 0.18, -0.25, c); }
  const plastic = mesh(box(w + 0.18, 1.0, 0.75), plasticM, 0, 0.78, -0.02, c);
  return { c, plastic };
}
const chairs = [goldChair(-3.0, -7.0, 0, true), goldChair(-4.4, -5.6, Math.PI / 2, false), goldChair(-1.6, -5.6, -Math.PI / 2, false)];
const ctable = new THREE.Group(); ctable.position.set(-3.0, 0, -5.6); salon.add(ctable);
mesh(cyl(0.45, 0.45, 0.05, 10), P(0xf4f4f8, { shininess: 120 }), 0, 0.45, 0, ctable); mesh(cyl(0.05, 0.08, 0.45, 6), goldM, 0, 0.22, 0, ctable);
mesh(box(0.5, 0.01, 0.35), M(0xf8f4e8), 0, 0.48, 0, ctable); // doily
// chandelier
const chand = new THREE.Group(); chand.position.set(-3.0, 2.7, -5.6); salon.add(chand);
mesh(new THREE.TorusGeometry(0.35, 0.03, 4, 12), goldM, 0, 0, 0, chand).rotation.x = Math.PI / 2;
mesh(cyl(0.015, 0.015, 0.5, 4), goldM, 0, 0.25, 0, chand);
for (let i = 0; i < 10; i++) { const a = i / 10 * 6.28; mesh(new THREE.OctahedronGeometry(0.05, 0), new THREE.MeshPhongMaterial({ color: 0xeaf6ff, emissive: 0x334455, shininess: 150, transparent: true, opacity: 0.85 }), Math.cos(a) * 0.35, -0.12, Math.sin(a) * 0.35, chand); }
const salonLight = new THREE.PointLight(0xffd890, 0, 6, 1.2); salonLight.position.set(-3.0, 2.3, -5.4); scene.add(salonLight);
// the nish (china cabinet) on the left salon wall
const nish = new THREE.Group(); nish.position.set(-4.75, 0, -6.6); nish.rotation.y = Math.PI / 2; salon.add(nish);
mesh(box(1.2, 2.2, 0.45), M(0x5a3418, { map: woodTex }), 0, 1.1, 0, nish);
mesh(new THREE.PlaneGeometry(1.0, 1.2), new THREE.MeshPhongMaterial({ color: 0xcfe6ff, transparent: true, opacity: 0.25, shininess: 150 }), 0, 1.55, 0.231, nish);
const nishGlasses = [];
for (let row = 0; row < 3; row++) for (let i = 0; i < 5; i++) { const gl = new THREE.Group(); gl.position.set(-0.4 + i * 0.2, 1.05 + row * 0.38, 0.05); nish.add(gl); mesh(cyl(0.05, 0.04, 0.13, 6), new THREE.MeshPhongMaterial({ color: 0xe8f6ff, transparent: true, opacity: 0.7, shininess: 150 }), 0, 0, 0, gl); mesh(new THREE.TorusGeometry(0.05, 0.008, 3, 8), goldM, 0, 0.065, 0, gl).rotation.x = Math.PI / 2; nishGlasses.push(gl); }
for (let row = 0; row < 3; row++) mesh(box(1.05, 0.02, 0.35), new THREE.MeshPhongMaterial({ color: 0xffffff, transparent: true, opacity: 0.4 }), 0, 0.97 + row * 0.38, 0, nish);
const nishGlow = new THREE.PointLight(0xffe08a, 0, 3, 1.5); nishGlow.position.set(-4.3, 1.5, -6.6); scene.add(nishGlow);
// Ibrahim's handheld treasure glass + Om Hamada's phone + newspaper
const goldGlass = new THREE.Group(); scene.add(goldGlass);
mesh(cyl(0.06, 0.05, 0.15, 6), new THREE.MeshPhongMaterial({ color: 0xe8f6ff, transparent: true, opacity: 0.75, shininess: 150 }), 0, 0, 0, goldGlass); mesh(new THREE.TorusGeometry(0.06, 0.01, 3, 8), goldM, 0, 0.075, 0, goldGlass).rotation.x = Math.PI / 2;
const phone = mesh(box(0.08, 0.16, 0.015), P(0x1a1a22, { emissive: 0x112244 }), 0, 0, 0, scene);
const paper = mesh(new THREE.PlaneGeometry(0.6, 0.42), new THREE.MeshLambertMaterial({ map: canvasTex(32, 24, (g) => { g.fillStyle = '#eeeae0'; g.fillRect(0, 0, 32, 24); g.fillStyle = '#333'; g.fillRect(2, 2, 28, 4); for (let y = 8; y < 22; y += 2) g.fillRect(2 + (y % 4), y, 12, 1); for (let y = 8; y < 22; y += 2) g.fillRect(17, y, 12, 1); }), side: THREE.DoubleSide }), 0, 0, 0, scene);
// clutter that gets shoved under the sofa
const clutter = [];
{ const r = rng(13); const cols = [0x3a77c8, 0xff5577, 0xffd400, 0x44cc66, 0xffffff, 0x222222];
  for (let i = 0; i < 14; i++) { const k = i % 4; const geo = k === 0 ? box(0.4, 0.06, 0.3) : k === 1 ? cyl(0.18, 0.15, 0.04, 8) : k === 2 ? box(0.25, 0.25, 0.25) : box(0.35, 0.1, 0.25); const m = mesh(geo, M(cols[i % 6]), 0, 0, 0, room); clutter.push({ m, p0: V(-2.5 + r() * 5, 0.05, -2.8 + r() * 2.6), r0: r() * 6, delay: r() * 1.8 }); } }

// =====================================================================
const KEYS = {};
const PHONE = { aRx: 2.3, aRz: 0.55, eR: 2.5, aLz: 0.95, eL: 1.9 };
KEYS.mom = [
  [0, { ...PHONE, hz: 0.12 }],
  [3.5, { ...PHONE, hz: -0.1, bend: 0.05 }, 0.3],
  [6.2, { aLz: 0.95, eL: 1.9, aRz: 0.95, eR: 1.9 }, 0.2],
  [T_ALARM, { aLz: 2.6, aRz: 2.6, eL: 0.3, eR: 0.3, hx: -0.15, y: 0.06 }, 0.1],
  [9.6, { aRx: 1.6, aRz: 0.3, eR: 0.0, aLz: 0.95, eL: 1.9, twist: 0.3 }, 0.12],
  [15.2, { aRx: 1.6, aRz: 0.9, eR: 0.0, aLz: 0.95, eL: 1.9, twist: -0.3 }, 0.12],
  [16.4, { aRx: 1.6, aRz: 0.1, eR: 0.0, aLz: 0.95, eL: 1.9, twist: 0.4 }, 0.12],
  [21.5, { aRx: 1.5, aRz: 0.2, eR: 0.0, aLz: 0.95, eL: 1.9, hy: 0.3 }, 0.12],
  [28.5, { aRx: 1.4, aRz: 0.6, eR: 0.1, aLz: 0.95, eL: 1.9, hy: 0.4, hx: -0.1 }, 0.12],
  [T_MSG, { aRx: 1.3, eR: 1.4, aRz: 0.1, aLz: 0.3, aLx: 0.3, hx: 0.35, bend: 0.1 }, 0.2],
  [35.6, { aRx: 1.0, eR: 1.2, aRz: 0.1, aLz: 0.1, hx: 0.45, bend: 0.35, y: -0.05 }, 0.8],
  [42.1, { aRx: 1.7, aRz: 0.3, eR: 0.0, aLz: 0.95, eL: 1.9, hx: -0.1, bend: -0.1, y: 0.05 }, 0.1],
  [43.6, { aLz: 0.95, eL: 1.9, aRz: 0.95, eR: 1.9 }, 0.3],
];
KEYS.son = [
  [0, { y: -0.62, lL: 1.45, lR: 1.45, aLx: 0.6, eL: 1.25, aRx: 0.6, eR: 1.25, aLz: -0.12, aRz: -0.12, bend: 0.15 }],
  [6.55, { y: -0.62, lL: 1.45, lR: 1.45, aLx: 0.6, eL: 1.25, aRx: 0.6, eR: 1.25, aLz: -0.12, aRz: -0.12, hy: 2.4, twist: 0.4 }, 0.2],
  [T_ALARM + 0.1, { y: 0.0, aLz: 2.5, aRz: 2.5, eL: 0.3, eR: 0.3, hx: -0.15 }, 0.1],
  [12.8, { aLx: 1.6, eL: 2.4, aRx: 1.6, eR: 2.4, aLz: 0.4, aRz: 0.4, bend: 0.1, hx: 0.05 }, 0.12],
  [18.45, { aLz: 1.4, aRz: 1.4, eL: 0.8, eR: 0.8, hy: 0.4 }, 0.12],
];
KEYS.dad = [
  [0, { y: -0.38, lL: 1.5, lR: 1.5, aLx: 1.2, eL: 1.1, aRx: 1.2, eR: 1.1, aLz: -0.25, aRz: -0.25, hx: 0.25 }],
  [T_ALARM + 0.1, { y: -0.3, lL: 1.3, lR: 1.3, aLz: 2.5, aRz: 2.5, eL: 0.3, eR: 0.3, hx: -0.15 }, 0.1],
  [9.5, { y: -0.38, lL: 1.5, lR: 1.5, aLz: 0.4, aRz: 0.4, hx: 0.0, hy: 0.4 }, 0.3],
  [21.5, { aLz: 0.3, aRz: 0.3, hy: 0.6 }, 0.3],
  [T_DOOR, { aLx: 0.6, aRx: 0.6, eL: 0.4, eR: 0.4, aLz: 0.6, aRz: 0.6, bend: -0.1, hx: -0.15 }, 0.3],
  [30.9, { aRx: 1.4, eR: 1.2, aRz: 0.05, aLx: 1.2, eL: 1.4, aLz: -0.2, bend: 0.1, hx: 0.15 }, 0.15],
  [T_MSG, { aRx: 1.4, eR: 1.2, aRz: 0.05, aLz: 0.4, hy: 0.6 }, 0.2],
  [38.3, { y: -0.38, lL: 1.5, lR: 1.3, aRx: 1.2, eR: 1.6, aRz: 0.1, aLz: 0.9, eL: 0.6, bend: -0.25, hx: -0.1, hy: 0.3 }, 0.3],
  [42.1, { y: 0.12, aLz: 2.5, aRz: 2.5, eL: 0.3, eR: 0.3, hx: -0.15 }, 0.08],
  [43.0, { aLz: 0.3, aRz: 0.3, bend: 0.3, hx: 0.4 }, 0.3],
];
const MOM_P = V(1.4, 0, -0.7), SON_P = V(-0.3, 0, -1.5), DAD_SOFA = V(-1.0, 0.0, 1.55);
const DAD_DOOR = V(-3.0, 0, -3.1), DAD_SALON = V(-3.0, 0.08, -6.7);

function stateAt(t) {
  scene.background = new THREE.Color(0x101010); scene.fog = null;
  ambient.color.setHex(0xfff0e0); ambient.intensity = 0.8; moon.intensity = 0; balcLight.intensity = 0; hallLight.intensity = 0.6;
  tvLight.intensity = 3.0; tvLight.color.setHex(0x6fb8ff);
  const alarmOn = t >= T_ALARM && t < T_MSG; alarm.intensity = alarmOn ? 4 + 4 * Math.abs(Math.sin(t * 6)) : 0;
  // TV: game until the alarm, then off
  { const g = tvTex.userData.g; if (t < T_ALARM) { g.fillStyle = '#4fb0ff'; g.fillRect(0, 0, 128, 40); g.fillStyle = '#5fae4a'; g.fillRect(0, 40, 128, 56); g.fillStyle = '#fff'; g.fillRect(56 + Math.sin(t * 3) * 30, 50, 12, 12); g.fillStyle = '#ffe14a'; g.font = '6px PS2P'; g.textAlign = 'left'; g.textBaseline = 'top'; g.fillText('GOAL! 3-2', 4, 4); } else { g.fillStyle = '#0c0c10'; g.fillRect(0, 0, 128, 96); } tvTex.needsUpdate = true; }
  // doors + salon
  let open = 0;
  if (t >= T_DOOR && t < T_RES + 0.4) open = easeOut(seg(t, T_DOOR, T_DOOR + 0.8));
  if (t >= T_RES) open = 1 - easeIn(seg(t, T_RES + 0.1, T_RES + 0.4));
  doorL.rotation.y = -1.4 * open; doorR.rotation.y = 1.4 * open;
  salon.visible = open > 0.01 || (t >= T_DOOR && t < T_RES + 0.4);
  salonLight.intensity = salon.visible ? 5 : 0;
  chairs.forEach((c, i) => { c.plastic.visible = t < 22.8 + i * 0.4; });
  padlock.visible = t >= T_RES + 0.45; if (padlock.visible) { const k = easeBack(seg(t, T_RES + 0.45, T_RES + 0.7)); padlock.scale.setScalar(Math.max(0.01, k)); shackle.position.y = 0.22 - (t > T_RES + 1.0 ? 0.06 : 0); }
  const nishOn = t >= 28.5 && t < T_RES; nishGlow.intensity = nishOn ? 3 + 2 * Math.sin(t * 5) : 0;
  nishGlasses.forEach((gl, i) => gl.visible = !(t >= 30.4 && i === 7));
  // clutter: lying around, then shoved under the sofa during the speedrun
  clutter.forEach((o, i) => { const k = easeIn(seg(t, T_HIDE - 0.4 + o.delay * 0.7, T_HIDE + 0.2 + o.delay * 0.7)); const under = V(-1.0 + (i % 5 - 2) * 0.35, 0.05, 1.85); o.m.position.copy(VL(o.p0, under, k)); o.m.position.y += Math.sin(k * Math.PI) * 0.8; o.m.rotation.set(k * 6, o.r0 + k * 4, 0); o.m.visible = k < 0.98; });

  // ---- characters ----
  dad.afro.visible = false; dad.extras.setGoggles(false); samir.root.visible = false; cane.visible = false;
  // mom
  mom.root.position.copy(MOM_P); mom.root.rotation.set(0, -1.2, 0);
  if (t >= T_ALARM) mom.root.rotation.y = -1.6;
  if (t >= 21.5 && t < T_MSG) { mom.root.position.set(0.2, 0, -2.4); mom.root.rotation.y = -1.9; }
  if (t >= T_MSG) { mom.root.position.set(-1.3, 0, -2.3); mom.root.rotation.y = 0.35; }
  applyPose(mom, poseAt(t, KEYS.mom));
  { const hp = mom.arms[1].hand.getWorldPosition(V(0, 0, 0)); phone.position.copy(hp).add(V(0, 0.06, 0)); phone.rotation.set(0, mom.root.rotation.y, 0.3); phone.visible = t < 6.4 || (t >= T_MSG - 0.2 && t < 38.0); phone.material.emissive.setHex(t >= T_MSG && t < 38 ? 0x3a8a3a : 0x112244); }
  // Hamada
  son.root.visible = true; son.root.rotation.set(0, 0, 0);
  if (t < T_ALARM) { son.root.position.copy(SON_P); son.root.rotation.y = Math.PI; }
  else if (t < T_HIDE) { son.root.position.set(-0.2, 0, -1.2); son.root.rotation.y = 0.5; if (t < T_ALARM + 0.35) son.root.position.y = Math.sin(seg(t, T_ALARM, T_ALARM + 0.35) * Math.PI) * 0.45; }
  else { // dives under the sofa: only the legs stick out
    const k = easeOut(seg(t, T_HIDE, T_HIDE + 0.5)); son.root.rotation.set(Math.PI / 2 * k, 0, 0); son.root.position.set(lerp(-0.2, -0.7, k), lerp(0, 0.12, k), lerp(-1.2, 0.95, k));
  }
  const sz = poseAt(t, KEYS.son);
  if (t >= T_HIDE) Object.assign(sz, { y: 0, bend: 0, aLz: 2.8, aRz: 2.8, eL: 0, eR: 0, aLx: 0, aRx: 0, lL: 0.1, lR: -0.1 + (t > 46 ? Math.max(0, Math.sin((t - 46) * 7)) * 0.4 : 0), hx: 0, hy: 0 });
  if (t >= 12.8 && t < 14.9) sz.hz = Math.sin(t * 20) * 0.1;
  applyPose(son, sz);
  // Ibrahim
  dad.root.rotation.set(0, Math.PI, 0); dad.root.position.copy(DAD_SOFA);
  if (t >= T_ALARM && t < T_ALARM + 0.35) dad.root.position.y += Math.sin(seg(t, T_ALARM, T_ALARM + 0.35) * Math.PI) * 0.3;
  if (t >= 21.5) { const k = easeInOut(seg(t, 22.2, 24.6)); dad.root.position.copy(VL(V(-1.0, 0, 0.9), DAD_DOOR, k)); dad.root.rotation.y = lerp(Math.PI, Math.PI, k); }
  if (t >= 30.9 && t < 38.3) { dad.root.position.set(-4.1, 0, -6.0); dad.root.rotation.y = -Math.PI / 2 + 0.6; }
  if (t >= 38.3) { const k = easeInOut(seg(t, 38.3, 39.2)); dad.root.position.copy(VL(V(-3.6, 0, -5.8), DAD_SALON.clone().add(V(0, 0, 0.35)), k)); dad.root.rotation.y = lerp(-Math.PI / 2, 0, k); }
  if (t >= 42.1) { dad.root.position.copy(DAD_SALON.clone().add(V(0, 0, 0.6))); dad.root.rotation.y = 0; }
  if (t >= T_RES) { const k = easeInOut(seg(t, T_RES, T_RES + 0.4)); dad.root.position.copy(VL(DAD_SALON.clone().add(V(0, 0, 0.6)), V(-2.4, 0, -2.9), k)); dad.root.rotation.y = 0.3; }
  const dz = poseAt(t, KEYS.dad);
  if (t >= 30.9 && t < T_MSG) { dz.aRx += Math.sin(t * 30) * 0.03; dz.eR += Math.sin(t * 27) * 0.04; }
  if (t >= 38.3 && t < 42.1) { const sit = easeInOut(seg(t, 38.6, 39.3)); dz.y = lerp(0, -0.38, sit); dz.lL = lerp(0, 1.5, sit); dz.lR = lerp(0, 1.25, sit); }
  applyPose(dad, dz);
  { const hp = dad.arms[1].hand.getWorldPosition(V(0, 0, 0)); goldGlass.position.copy(hp).add(V(0, 0.08, 0)); goldGlass.visible = t >= 30.4 && t < T_RES; }
  { const a = dad.arms[0].hand.getWorldPosition(V(0, 0, 0)), b = dad.arms[1].hand.getWorldPosition(V(0, 0, 0)); paper.visible = t < T_ALARM + 1.2; if (t < T_ALARM) { paper.position.copy(a.add(b).multiplyScalar(0.5)).add(V(0, 0.12, -0.1)); paper.rotation.set(-0.2, Math.PI, 0); } else { const k = seg(t, T_ALARM, T_ALARM + 1.2); paper.position.set(-1.0 + k * 0.6, 1.4 + 1.6 * k - 2.5 * k * k, 1.2 - k * 0.5); paper.rotation.set(k * 6, k * 4, k * 2); } }

  // ---- particles ----
  const dust = [];
  if (t >= T_DOOR && t < T_DOOR + 2.5) { const k = seg(t, T_DOOR, T_DOOR + 2.5); for (let i = 0; i < 18; i++) { const ph = (k + hash(i)) % 1; dust.push({ pos: V(-3.0 + (hash(i + 1) - .5) * 1.6, 0.3 + hash(i + 2) * 2.0 + ph * 0.3, -4.0 + ph * 1.8), size: 0.25 + ph * 0.5, op: (1 - ph) * 0.55 * (1 - k * 0.5), color: 0xd8c8a0 }); } }
  emit(dust, puffPool);
  const sparkle = [];
  if (t >= T_DOOR + 0.3 && t < T_RES) for (let i = 0; i < 6; i++) { const k = (t * 0.8 + i / 6) % 1; sparkle.push({ pos: V(-3.0 + Math.cos(i * 2 + t) * 0.6, 2.4 - k * 0.4, -5.6 + Math.sin(i * 2 + t) * 0.6), size: 0.1 * Math.sin(k * Math.PI), rot: t }); }
  if (t >= 28.5 && t < T_RES) for (let i = 0; i < 6; i++) { const k = (t * 1.1 + i / 6) % 1; sparkle.push({ pos: V(-4.45, 1.0 + k * 1.2, -6.6 + (hash(i) - .5) * 1.0), size: 0.14 * Math.sin(k * Math.PI), rot: t * 2 }); }
  emit(sparkle, starPool);
  const sweat = [];
  if ((t >= 12.8 && t < T_HIDE) || (t >= 30.9 && t < T_MSG)) { const c = t < T_HIDE ? son : dad; const hd = c.head.getWorldPosition(V(0, 0, 0)); for (let i = 0; i < 4; i++) { const k = (t * 1.3 + i * 0.25) % 1; sweat.push({ pos: hd.clone().add(V((i % 2 ? 1 : -1) * 0.27, 0.18 - k * 0.5, 0)), size: 0.07, op: 1 - k }); } }
  emit(sweat, sweatPool); emit([], trailPool);

  // ---- faces ----
  let me = 'normal', mm = talkMouth(t, 'mom', 'scream') || 'closed';
  if (t < 6.2) { me = 'sparkle'; if (mm === 'closed') mm = 'smile'; }
  else if (t < T_ALARM) { me = 'flat'; mm = 'flat'; }
  else if (t < 21.5) { me = 'wide'; if (mm === 'closed') mm = 'clench'; }
  else if (t < T_MSG) { me = 'smug'; if (mm === 'closed') mm = 'flat'; }
  else if (t < 38.3) { me = 'sad'; if (mm === 'closed') mm = 'frown'; }
  else if (t < 42.1) { me = 'flat'; mm = 'flat'; }
  else if (t < T_RES) { me = 'angry'; if (mm === 'closed') mm = 'clench'; }
  else { me = 'smug'; mm = 'smile'; }
  let se = 'normal', sm = talkMouth(t, 'son', 'scream') || 'closed';
  if (t < 6.55) { se = 'smug'; sm = 'tongue'; } else if (t < T_ALARM) { se = 'side'; if (sm === 'closed') sm = 'flat'; } else if (t < T_HIDE) { se = 'pin'; if (sm === 'closed') sm = 'o'; } else { se = 'closed'; sm = 'flat'; }
  let de = 'tired', dm = talkMouth(t, 'dad') || 'closed';
  if (t >= T_ALARM && t < 21.5) { de = 'wide'; dm = 'o'; }
  else if (t >= 21.5 && t < T_DOOR) { de = 'normal'; }
  else if (t >= T_DOOR && t < 30.9) { de = 'sparkle'; if (dm === 'closed') dm = 'o'; }
  else if (t >= 30.9 && t < T_MSG) { de = 'pin'; if (dm === 'closed') dm = 'wobble'; }
  else if (t >= T_MSG && t < 38.3) { de = 'side'; dm = 'flat'; }
  else if (t >= 38.3 && t < 42.1) { de = 'smug'; if (dm === 'closed') dm = 'grin'; }
  else if (t >= 42.1) { de = 'pin'; dm = 'o'; if (t > 43.6) { de = 'sad'; dm = 'frown'; } }
  const blink = (list) => list.some(b => t >= b && t < b + 0.18);
  if (blink([3.0, 23.0, 40.4])) me = 'closed';
  mom.faceMat.map = faceTexture(me, mm, {}); mom.faceMat.needsUpdate = true;
  son.faceMat.map = faceTexture(se, sm, { fuzz: true }); son.faceMat.needsUpdate = true;
  dad.faceMat.map = faceTexture(de, dm, { stache: true }); dad.faceMat.needsUpdate = true;
}

function cameraAt(t) {
  if (t < 6.2) { const k = seg(t, 0, 6.2); if (t < 1.4) cam(V(2.8, 2.3, 2.6), V(-0.6, 0.9, -1.4), 58); else faceCam(mom, lerp(1.9, 1.5, k), 0.4, 0.05, 48, 0.1); }
  else if (t < T_ALARM) { faceCam(son, 1.3, 0.3, 0.1, 48, 0.12); }
  else if (t < 12.8) { cam(V(3.2, 2.0, 1.8).add(shake(t, t < 9 ? 0.06 : 0.015, 22)), V(-0.4, 1.0, -0.8), 58, Math.sin(t * 6) * 0.02); }
  else if (t < 15.2) { faceCam(son, 1.1, -0.2, 0.05, 46, 0.08); }
  else if (t < 18.45) { faceCam(mom, 1.6, -0.3, 0.0, 48, 0.1); }
  else if (t < 21.5) { const k = seg(t, 18.45, 21.5); if (t < T_HIDE) faceCam(son, 1.3, 0.35, 0.05, 48, 0.1); else cam(VL(V(0.5, 1.0, -0.3), V(0.3, 0.9, -0.1), k), V(-0.8, 0.3, 1.4), 58); }
  else if (t < T_DOOR) { faceCam(mom, 1.7, 0.4, 0.0, 50, 0.1); }
  else if (t < 28.5) { const k = easeInOut(seg(t, T_DOOR, 28.5)); cam(VL(V(-2.6, 1.6, -0.6), V(-2.9, 1.5, -2.2), k), V(-3.0, 1.1, -6.2), 52); }
  else if (t < 30.9) { cam(V(-3.4, 1.5, -5.6), V(-4.6, 1.5, -6.6), 50); }
  else if (t < T_MSG) { faceCam(dad, 1.1, 0.25, 0.0, 46, 0.0); }
  else if (t < 38.3) { const k = seg(t, T_MSG, 38.3); faceCam(mom, lerp(1.2, 1.5, k), -0.25, 0.05, 46, 0.15); }
  else if (t < 42.1) { cam(V(-2.6, 1.5, -4.2), V(-3.0, 0.8, -6.4), 52); }
  else if (t < T_RES) { faceCam(mom, 1.4, 0.3, -0.05, 48, 0.0); camera.position.add(shake(t, 0.03, 25)); }
  else { const k = easeInOut(seg(t, T_RES, 54.0)); cam(VL(V(2.6, 1.7, 0.6), V(3.2, 2.2, 1.2), k), V(-1.9, 0.75, -1.2), 60); }
}

// =====================================================================
const NAMES = { mom: ['أم حمادة', 'OM HAMADA', '#1f9e5a'], son: ['حمادة', 'HAMADA', '#d4141c'], dad: ['إبراهيم', 'IBRAHIM', '#c9a227'] };
function portrait(g, x, y, who, t) {
  g.fillStyle = '#123'; g.fillRect(x, y, 64, 64); g.strokeStyle = '#fff'; g.lineWidth = 2; g.strokeRect(x, y, 64, 64);
  g.save(); g.beginPath(); g.rect(x + 2, y + 2, 60, 60); g.clip();
  if (who === 'mom') { g.fillStyle = '#1f9e5a'; g.beginPath(); g.arc(x + 32, y + 34, 27, 0, 7); g.fill(); g.fillStyle = '#c98d5f'; g.beginPath(); g.arc(x + 32, y + 38, 19, 0, 7); g.fill(); g.fillStyle = '#ec86ad'; g.fillRect(x + 6, y + 58, 52, 6); }
  else if (who === 'son') { g.fillStyle = '#d4141c'; g.fillRect(x + 8, y + 54, 48, 10); g.fillStyle = '#b98058'; g.beginPath(); g.arc(x + 32, y + 36, 19, 0, 7); g.fill(); g.fillStyle = '#17110c'; for (let i = 0; i < 7; i++) { g.beginPath(); g.arc(x + 14 + i * 6, y + 18 + (i % 2) * 3, 7, 0, 7); g.fill(); } }
  else { g.fillStyle = '#f3f0e3'; g.fillRect(x + 10, y + 54, 44, 10); g.fillStyle = '#b27448'; g.beginPath(); g.arc(x + 32, y + 36, 20, 0, 7); g.fill(); g.fillStyle = '#1b1410'; g.fillRect(x + 10, y + 30, 5, 12); g.fillRect(x + 49, y + 30, 5, 12); g.fillStyle = '#c9a227'; g.fillRect(x + 14, y + 16, 36, 5); g.fillStyle = '#335a3a'; g.fillRect(x + 18, y + 15, 10, 7); g.fillRect(x + 36, y + 15, 10, 7); }
  const fc = document.createElement('canvas'); fc.width = 32; fc.height = 32; const fg = fc.getContext('2d');
  const e = envAt(t); const mouth = speakerAt(t) === who ? (e < 0.1 ? 'closed' : e < 0.4 ? 'talk1' : 'talk2') : 'closed';
  const eyes = who === 'mom' ? (t < 6.2 ? 'sparkle' : t > 42 ? 'angry' : t > T_MSG ? 'sad' : 'wide') : who === 'son' ? 'pin' : (t > 38 && t < 42 ? 'smug' : 'wide');
  drawFace(fg, 32, eyes, mouth, { stache: who === 'dad', fuzz: who === 'son' });
  g.imageSmoothingEnabled = false; g.drawImage(fc, x + 14, y + 20, 36, 36); g.restore();
}
function drawTitle(g, t) {
  if (t >= 1.3) return; const op = t < 0.9 ? 1 : 1 - seg(t, 0.9, 1.3);
  g.globalAlpha = op; g.fillStyle = 'rgba(0,0,0,0.6)'; g.fillRect(0, 196, W, 76);
  arText(g, 'الضيوف جايين', W / 2, 198, 40, '#ffe14a', 'center', 'ReemKufi'); pxText(g, 'GUESTS INCOMING', W / 2, 250, 10, '#fff', 'center'); g.globalAlpha = 1;
}
function countdown(t) { if (t < 8.6) return 600; if (t < T_MSG) return Math.max(2, Math.round(600 - (t - 8.6) * 23.6)); return Math.round(600 - (T_MSG - 8.6) * 23.6); }
function drawCountdown(g, t) {
  if (t < 8.6 || t >= T_RES) return;
  const x = W / 2 - 150, y = 10; const left = countdown(t); const glitch = t >= T_MSG;
  g.fillStyle = 'rgba(40,0,0,0.85)'; g.fillRect(x, y, 300, 62); g.strokeStyle = glitch ? '#888' : '#ff3030'; g.lineWidth = 3; g.strokeRect(x, y, 300, 62);
  arText(g, 'الضيوف هيوصلوا خلال', x + 292, y + 2, 16, '#fff');
  const mm = String(Math.floor(left / 60)).padStart(2, '0'), ss = String(left % 60).padStart(2, '0');
  if (!glitch) pxText(g, mm + ':' + ss, x + 10, y + 30, 20, left < 120 && Math.floor(t * 4) % 2 ? '#ff3030' : '#ffe14a');
  else { pxText(g, 'CANCELLED', x + 10, y + 32, 16, '#888'); g.strokeStyle = '#ff3030'; g.lineWidth = 2; g.beginPath(); g.moveTo(x + 8, y + 40); g.lineTo(x + 170, y + 40); g.stroke(); }
  pxText(g, 'SPEEDRUN', x + 190, y + 36, 8, '#ff9a4a');
}
function drawHidden(g, t) {
  if (t < T_HIDE - 0.3 || t >= 22.4) return;
  const n = Math.min(47, Math.floor(seg(t, T_HIDE - 0.3, 21.0) * 47));
  const k = easeBack(seg(t, T_HIDE - 0.3, T_HIDE - 0.1)); g.save(); g.translate(W - 140, 120); g.scale(k, k);
  g.fillStyle = 'rgba(0,0,30,0.85)'; g.fillRect(-120, -30, 240, 64); g.strokeStyle = '#fff'; g.lineWidth = 2; g.strokeRect(-120, -30, 240, 64);
  arText(g, 'اتخبى تحت الكنبة', 112, -28, 16, '#fff'); pxText(g, '+' + n, -100, 2, 18, '#3df05a'); pxText(g, 'ITEMS', 10, 8, 8, '#9fd0ff');
  g.restore();
  if (t >= T_HIDE + 0.5 && t < 21.4) { pxText(g, '+1 HAMADA', W - 140, 170, 12, '#ffe14a', 'center'); }
}
function drawBanner(g, t, t0, t1, en, ar, col) {
  if (t < t0 || t >= t1) return; const k = easeBack(seg(t, t0, t0 + 0.2)); const op = t > t1 - 0.3 ? 1 - seg(t, t1 - 0.3, t1) : 1;
  g.globalAlpha = op; g.save(); g.translate(W / 2, 150); g.scale(k, k);
  g.fillStyle = 'rgba(0,0,0,0.75)'; g.fillRect(-250, -40, 500, 84); g.strokeStyle = col; g.lineWidth = 3; g.strokeRect(-250, -40, 500, 84);
  pxText(g, en, 0, -30, 13, col, 'center'); arText(g, ar, 0, -6, 30, '#fff', 'center', 'ReemKufi'); g.restore(); g.globalAlpha = 1;
}
function drawMessage(g, t) {
  if (t < T_MSG || t >= 37.9) return; const k = easeOut(seg(t, T_MSG, T_MSG + 0.25));
  const x = W - 300, y = 90 - (1 - k) * 80;
  g.fillStyle = 'rgba(245,245,245,0.97)'; g.fillRect(x, y, 280, 96); g.strokeStyle = '#888'; g.lineWidth = 1; g.strokeRect(x, y, 280, 96);
  g.fillStyle = '#2f9a4a'; g.fillRect(x, y, 280, 22); arText(g, 'طنط سعاد', x + 270, y - 2, 16, '#fff');
  g.fillStyle = '#dcf8c6'; g.fillRect(x + 12, y + 30, 256, 56);
  g.fillStyle = '#111'; g.font = '16px Lalezar'; g.direction = 'rtl'; g.textAlign = 'right'; g.textBaseline = 'top';
  g.fillText('معلش يا حبيبتي.. مش هنيجي النهارده', x + 260, y + 34); g.fillText('خليها مرة تانية', x + 260, y + 58);
}
function drawResult(g, t) {
  if (t < T_RES || t >= T_ENDC + 0.3) return; const a = t - T_RES;
  g.fillStyle = `rgba(0,0,20,${0.55 * clamp(a / 0.3)})`; g.fillRect(0, 0, W, H);
  const k = easeBack(clamp(a / 0.3)); g.save(); g.translate(W / 2, 64); g.scale(k, k);
  pxText(g, 'SPEEDRUN COMPLETE', 0, -14, 18, '#3df05a', 'center'); arText(g, 'خلصت الجولة', 0, 10, 26, '#fff', 'center'); g.restore();
  const rows = [[1.0, 'الوقت: ٩:٥٨', 'TIME: 9:58'], [2.0, 'الضيوف: صفر', 'GUESTS: 0'], [3.4, 'الصالون: اتقفل تاني', 'SALON: LOCKED AGAIN'], [5.0, 'حمادة: لسه تحت الكنبة', 'HAMADA: STILL UNDER THE SOFA']];
  rows.forEach(([t0, ar, en], i) => { if (a < t0) return; const kk = easeBack(seg(a, t0, t0 + 0.2)); const yy = 128 + i * 50; g.save(); g.translate(W / 2, yy + 20); g.scale(kk, kk); g.fillStyle = 'rgba(10,10,40,0.88)'; g.fillRect(-230, -20, 460, 42); arText(g, ar, 220, -18, 22, '#fff'); pxText(g, en, -220, -4, 8, '#9fd0ff'); g.restore(); });
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
  if (t >= T_ALARM && t < T_MSG) { ctx.fillStyle = `rgba(255,0,0,${0.08 + 0.08 * Math.abs(Math.sin(t * 6))})`; ctx.fillRect(0, 0, W, H); }
  h.clearRect(0, 0, W, H);
  drawCountdown(h, t); drawHidden(h, t);
  drawBanner(h, t, T_DOOR + 0.6, 28.4, 'NEW AREA UNLOCKED', 'الصالون', '#ffd400');
  drawBanner(h, t, 28.7, 30.8, 'LEGENDARY ITEM', 'طقم كوبايات النيش', '#ff9a4a');
  drawMessage(h, t); drawResult(h, t); drawDialogue(h, t); drawEnd(h, t); drawTitle(h, t);
  ctx.drawImage(hud, 0, 0);
  vignette(ctx, 0.35);
  if (t >= T_ALARM && t < T_ALARM + 0.06) { ctx.fillStyle = 'rgba(255,60,60,0.6)'; ctx.fillRect(0, 0, W, H); }
  if (t >= T_RES + 0.4 && t < T_RES + 0.46) { ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.fillRect(0, 0, W, H); }
  return true;
};
window.frameData = () => out.toDataURL('image/png');
window.DUR = DUR;
document.fonts.load('10px PS2P').then(() => document.fonts.load('20px Lalezar', 'ع')).then(() => document.fonts.load('700 20px ReemKufi', 'ع')).then(() => {
  const g = jerseyTex.userData.g; g.fillStyle = '#d4141c'; g.fillRect(0, 0, 32, 32); g.fillStyle = '#fff'; g.fillRect(0, 2, 32, 2); g.font = '12px PS2P'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('10', 16, 18); jerseyTex.needsUpdate = true;
  window.READY = true;
});
