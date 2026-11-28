// ---------- shared documentary toolkit («حصلت إزاي؟») ----------
const NARR = LINES.filter(l => l.s === 'anno'), DL = LINES.filter(l => l.s === 'dad'), OL = LINES.filter(l => l.s !== 'anno' && l.s !== 'dad');
const NX = (i) => NARR[i - 1], DX = (i) => DL[i - 1], OX2 = (i) => OL[i - 1];
camera.far = 1500;
const hemi = new THREE.HemisphereLight(0xbfd8ff, 0x3a3020, 0); scene.add(hemi);
const sun = new THREE.DirectionalLight(0xffffff, 0); scene.add(sun); scene.add(sun.target);
// real shadows from the fixed sun + a gradient sky (same low-poly style, more depth)
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); { const c = sun.shadow.camera; c.left = -45; c.right = 45; c.top = 45; c.bottom = -45; c.near = 1; c.far = 300; } sun.shadow.bias = -0.0008; sun.shadow.normalBias = 0.02;
function enableShadows() { scene.traverse(o => { if (o.isMesh) { const bm = o.material && o.material.isMeshBasicMaterial; o.castShadow = !bm && !(o.material && o.material.transparent); o.receiveShadow = !bm; } }); }
const skyCache = {};
function gradSky(bg) { if (skyCache[bg]) return skyCache[bg]; const c = new THREE.Color(bg); const top = c.clone().multiplyScalar(0.62), hor = c.clone().lerp(new THREE.Color(0xffffff), 0.25);
  const t = canvasTex(4, 256, (g) => { const gr = g.createLinearGradient(0, 0, 0, 256); gr.addColorStop(0, '#' + top.getHexString()); gr.addColorStop(0.62, '#' + c.getHexString()); gr.addColorStop(1, '#' + hor.getHexString()); g.fillStyle = gr; g.fillRect(0, 0, 4, 256); }); skyCache[bg] = t; return t; }
let SHADOW_FOCUS = null; // optional: keep the shadow box centred on the action
function fixedLight(ref, sky, ground, hi, sunCol, si, bg, fogCol, f0, f1) {
  hemi.color.setHex(sky); hemi.groundColor.setHex(ground); hemi.intensity = hi; sun.color.setHex(sunCol); sun.intensity = si; const fc = SHADOW_FOCUS || ref; sun.position.copy(fc).add(V(-40, 80, 30)); sun.target.position.copy(fc); sun.castShadow = si > 0.2;
  scene.background = (bg === 0x000000 || bg === 0x050505 || bg === 0x08080c || bg === 0x111111) ? new THREE.Color(bg) : gradSky(bg); scene.fog = fogCol == null ? null : new THREE.Fog(fogCol, f0, f1);
  ambient.intensity = 0; moon.intensity = 0; fill.intensity = 0; tvLight.intensity = 0; balcLight.intensity = 0; bathLight.intensity = 0; kitLight.intensity = 0; hallLight.intensity = 0; roomLight.intensity = 0;
}
function homeLight() { scene.background = new THREE.Color(0x101010); scene.fog = null; hemi.intensity = 0; sun.intensity = 0; ambient.intensity = 0.6; moon.intensity = 0.3; fill.intensity = 0; tvLight.intensity = 0; balcLight.intensity = 0; bathLight.intensity = 0; kitLight.intensity = 0; hallLight.intensity = 0; roomLight.position.set(0, 2.8, 1.0); roomLight.intensity = 1.4; }
// a person in the cast style (makeChar): big head, painted face, mitten hands
function makePerson(parent, o) {
  const skin = o.skin || [0xc8946a, 0xb98058, 0xd8a878, 0xa87048][(o.seed || 0) % 4];
  const tex = o.coatTex || canvasTex(16, 16, (g) => { g.fillStyle = '#' + (o.coat || 0x2a3a5a).toString(16).padStart(6, '0'); g.fillRect(0, 0, 16, 16); if (o.buttons !== false) { g.fillStyle = 'rgba(255,255,255,0.35)'; for (let i = 0; i < 3; i++) g.fillRect(7, 3 + i * 4, 2, 2); } });
  return makeChar({ seed: 300 + (o.seed || 0), skin, hipY: o.hipY || 0.84, legX: 0.11, legColor: o.legs || 0x2a2a30, shoe: o.shoe || 0x111111, hand: o.hand || skin,
    torsoGeo: cyl(o.w || 0.25, (o.w || 0.25) + 0.02, 0.64, 6), torsoTex: tex, torsoColor: 0xffffff, torsoY: 0.32, skirt: o.skirt || null,
    sleeve: true, sleeveColor: o.sleeve || o.coat || 0x2a3a5a, shoulderX: (o.w || 0.25) + 0.06, shoulderY: 0.57, neckY: 0.64, headR: 0.27,
    build(head, torso, reg) { if (o.hat) o.hat(head, torso, reg); return {}; } }, parent);
}
// overlay pass: pop-in characters are drawn as their own layer over the frozen frame (never cut into the set)
const overlay = new THREE.Scene(); overlay.add(new THREE.HemisphereLight(0xfff4e8, 0x504030, 1.0)); { const d = new THREE.DirectionalLight(0xffffff, 0.8); d.position.set(2, 4, 3); overlay.add(d); overlay.add(d.target); }
function renderOverlay(list) { const parents = list.map(c => c.root.parent); list.forEach(c => { overlay.add(c.root); c.root.visible = true; }); renderer.autoClear = false; renderer.clearDepth(); renderer.render(overlay, camera); renderer.autoClear = true; list.forEach((c, i) => parents[i].add(c.root)); }
function placeInFront(c, t, a, b, side, dist = 2.4, drop = -1.55) {
  const f = camera.getWorldDirection(V(0, 0, 0)); const r = V().crossVectors(f, V(0, 1, 0)).normalize();
  const kin = easeBack(seg(t, a, a + 0.45)), kout = easeIn(seg(t, b - 0.35, b));
  const slide = side + (1 - kin) * 2.6 * Math.sign(side || 1) + kout * -3.0; const hop = Math.abs(Math.sin(seg(t, a, a + 0.45) * Math.PI)) * 0.5 + kout * 1.2;
  c.root.position.copy(camera.position.clone().add(f.clone().multiplyScalar(dist)).add(r.multiplyScalar(slide)).add(V(0, drop + hop, 0)));
  c.root.rotation.set(0, Math.atan2(-f.x, -f.z) - side * 0.25, 0);
}
function drawPause(h) { h.save(); h.fillStyle = 'rgba(10,10,30,0.85)'; h.fillRect(W / 2 - 90, 40, 180, 50); h.strokeStyle = '#ffe14a'; h.lineWidth = 2; h.strokeRect(W / 2 - 90, 40, 180, 50); h.fillStyle = '#ffe14a'; h.fillRect(W / 2 - 70, 52, 8, 26); h.fillRect(W / 2 - 56, 52, 8, 26); pxText(h, 'PAUSE', W / 2 + 16, 54, 16, '#ffe14a', 'center'); h.restore(); }
function wrapAr(g, s, size, maxW) { g.font = `${size}px Lalezar`; const w = s.split(' '); const out = []; let cur = ''; for (const x of w) { const c = cur ? cur + ' ' + x : x; if (g.measureText(c).width > maxW && cur) { out.push(cur); cur = x; } else cur = c; } if (cur) out.push(cur); return out; }
function drawSub(g, t) {
  const l = LINES.find(l => l.s === 'anno' && t >= l.t0 - 0.05 && t < l.t1 + 0.3); if (!l || !l.ar) return;
  const a = Math.min(1, (t - l.t0 + 0.05) / 0.25, (l.t1 + 0.3 - t) / 0.25); g.save(); g.globalAlpha = a; const lines = wrapAr(g, l.ar, 26, W - 70); const hh = 20 + lines.length * 38;
  g.fillStyle = 'rgba(0,0,0,0.6)'; g.fillRect(20, H - 70 - hh, W - 40, hh); lines.forEach((s, i) => arText(g, s, W / 2, H - 70 - hh + 6 + i * 38, 26, '#fff', 'center')); g.restore();
}
function drawTitleCard(g, t, e, title, sub) { if (t > e) return; const a = Math.min(1, t / 0.6, (e - t) / 0.5); g.save(); g.globalAlpha = a; g.fillStyle = 'rgba(0,0,0,0.55)'; g.fillRect(0, 90, W, 130); arText(g, title, W / 2, 96, 36, '#fff', 'center', 'ReemKufi'); arText(g, sub, W / 2, 152, 24, '#ffd890', 'center'); g.restore(); }
function drawTags(g, t, tags) { for (const [a, ar, en] of tags) { if (!inT(t, a, a + 2.6)) continue; const al = Math.min(1, (t - a) / 0.4, (a + 2.6 - t) / 0.4); g.save(); g.globalAlpha = al; g.fillStyle = 'rgba(0,0,0,0.55)'; g.fillRect(0, 70, W, 70); arText(g, ar, W / 2, 70, 30, '#ffe8b0', 'center', 'ReemKufi'); pxText(g, en, W / 2, 114, 10, '#ddd', 'center', false); g.restore(); } }
function drawCTAbox(g, t, a, l1, l2) { if (t < a || t >= DUR - 0.8) return; const k = easeBack(seg(t, a, a + 0.3)); g.save(); g.translate(W / 2, 140); g.scale(k, k); g.fillStyle = 'rgba(255,255,255,0.96)'; g.fillRect(-250, -54, 500, 108); g.fillStyle = '#d8231b'; g.fillRect(-250, 48, 500, 6); arText(g, l1, 0, -56, 32, '#111', 'center'); arText(g, l2, 0, -14, 30, '#d8231b', 'center'); g.restore(); }
for (const c of [mom, son, samir]) c.root.visible = false; scene.add(samir.root);
function aimShadow() { if (!sun.castShadow) return; const f = camera.getWorldDirection(V(0, 0, 0)); const focus = camera.position.clone().add(f.multiplyScalar(16)); focus.y = 0; sun.target.position.copy(focus); sun.position.copy(focus).add(V(-40, 80, 30)); }
// =====================================================================
// الحنفية اتعملت عشان إيد اتحرقت — history of the tap. Documentary (Schedar), Ibrahim + Om Hamada pop in. vertical 9:16
// NX1 hook (burnt hand) | NX2 Egypt, Sahure copper pipes | NX3 Knossos clay pipes | NX4 Roman bronze valves | NX5 two taps hot/cold | POP
// NX6 Al Moen burns his hand 1937 | NX7 the idea | NX8 1942 patent, single handle everywhere | NX9 sensor taps | DX2 CTA (kitchen)
// =====================================================================
const POP = [DX(1).t0 - 0.55, OX2(1).t1 + 0.45];
const T_HOME = DX(2).t0 - 0.3;
const sceneAt = (t) => t < NX(2).t0 - 0.2 ? 'hook' : t < NX(3).t0 - 0.2 ? 'egypt' : t < NX(4).t0 - 0.2 ? 'knossos' : t < NX(5).t0 - 0.2 ? 'rome' : t < NX(6).t0 - 0.2 ? 'twotaps' : t < NX(7).t0 - 0.2 ? 'moen' : t < NX(8).t0 - 0.2 ? 'idea' : t < NX(9).t0 - 0.2 ? 'patent' : t < T_HOME ? 'sensor' : 'home';
const chrome = () => P(0xd8dce2, { shininess: 180, specular: 0xffffff });
// ---------- a modern single-handle faucet ----------
function makeFaucet(parent) { const g = new THREE.Group(); parent.add(g); const c = chrome();
  mesh(cyl(0.09, 0.11, 0.08, 16), c, 0, 0.04, 0, g); mesh(cyl(0.06, 0.07, 0.42, 16), c, 0, 0.29, 0, g);
  const sp = mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([V(0, 0.48, 0), V(0, 0.62, 0.05), V(0, 0.6, 0.22), V(0, 0.48, 0.3)]), 16, 0.028, 10), c, 0, 0, 0, g);
  const lever = new THREE.Group(); lever.position.set(0, 0.52, -0.02); g.add(lever); mesh(cyl(0.045, 0.045, 0.06, 12), c, 0, 0, 0, lever); mesh(box(0.035, 0.03, 0.22), c, 0, 0.03, -0.11, lever);
  return { g, lever, mouth: V(0, 0.47, 0.3) }; }
function makeSink(parent, x, z) { const g = new THREE.Group(); g.position.set(x, 0, z); parent.add(g); mesh(box(1.6, 0.9, 0.7), P(0xf0f0f0), 0, 0.45, 0, g); mesh(box(1.7, 0.05, 0.8), P(0x3a3a40, { shininess: 80 }), 0, 0.92, 0, g); mesh(box(0.9, 0.04, 0.5), P(0xc8ccd2, { shininess: 120 }), 0, 0.93, 0.05, g); return g; }
// hook / sensor / home sink (x = 2600)
const HX = 2600; const bathS = new THREE.Group(); bathS.position.x = HX; scene.add(bathS);
{ const tile = canvasTex(16, 16, (g) => { g.fillStyle = '#e8eef2'; g.fillRect(0, 0, 16, 16); g.fillStyle = '#c8d2da'; g.fillRect(0, 15, 16, 1); g.fillRect(15, 0, 1, 16); }); tile.wrapS = tile.wrapT = THREE.RepeatWrapping; tile.repeat.set(10, 6);
  mesh(new THREE.PlaneGeometry(8, 4), M(0xffffff, { map: tile }), 0, 2, -0.6, bathS); mesh(new THREE.PlaneGeometry(8, 8), M(0x8a8a90), 0, 0, 2, bathS).rotation.x = -Math.PI / 2; }
makeSink(bathS, 0, -0.2); const fau = makeFaucet(bathS); fau.g.position.set(0, 0.95, -0.45);
const sensorEye = mesh(new THREE.CircleGeometry(0.018, 10), new THREE.MeshBasicMaterial({ color: 0x2a6aff }), 0, 1.5, -0.16, bathS);
// water stream (scaled cylinder) + steam
const stream = mesh(cyl(0.018, 0.022, 1, 8), new THREE.MeshPhongMaterial({ color: 0xbfe4ff, transparent: true, opacity: 0.7, shininess: 150 }), 0, 0, 0, scene);
const hand = makePerson(scene, { seed: 2, coat: 0x6a7a9a }); // used as a disembodied arm in the hook: only the arm reads in close-up
// ---------- EGYPT: Sahure temple with a copper drain (x = 3000) ----------
const EGX = 3000; const eg = new THREE.Group(); eg.position.x = EGX; scene.add(eg);
{ const sand = canvasTex(32, 32, (g) => { g.fillStyle = '#d8b878'; g.fillRect(0, 0, 32, 32); g.fillStyle = '#c8a868'; for (let i = 0; i < 40; i++) g.fillRect((i * 7) % 32, (i * 11) % 32, 2, 1); }); sand.wrapS = sand.wrapT = THREE.RepeatWrapping; sand.repeat.set(30, 30);
  mesh(new THREE.PlaneGeometry(300, 300), M(0xffffff, { map: sand }), 0, 0, 0, eg).rotation.x = -Math.PI / 2; mesh(box(14, 0.3, 30), P(0xd8c8a8), 0, 0.15, -6, eg);
  for (let i = 0; i < 6; i++) for (const s of [-1, 1]) { mesh(cyl(0.7, 0.8, 7, 10), P(0xc8b088), s * 4.5, 3.8, -i * 4.5, eg); mesh(box(1.8, 0.5, 1.8), P(0xb8a078), s * 4.5, 7.5, -i * 4.5, eg); }
  mesh(box(11, 0.6, 24), P(0xc0a880), 0, 7.9, -11, eg);
  const copper = P(0xc87a3a, { shininess: 120, specular: 0xffc890 }); for (let i = 0; i < 12; i++) mesh(cyl(0.12, 0.12, 2.3, 10), copper, -1.5, 0.32, 2 - i * 2.4, eg).rotation.x = Math.PI / 2;
  mesh(box(0.5, 0.1, 30), P(0x9a8a6a), -1.5, 0.28, -10, eg);
  const py = mesh(new THREE.ConeGeometry(30, 28, 4), P(0xd8b878), 20, 14, -80, eg); py.rotation.y = Math.PI / 4; }
// ---------- KNOSSOS: red Minoan columns, clay pipes, fountain (x = 3400) ----------
const KNX = 3400; const kn = new THREE.Group(); kn.position.x = KNX; scene.add(kn);
{ mesh(new THREE.PlaneGeometry(200, 200), M(0xc8b090), 0, 0, 0, kn).rotation.x = -Math.PI / 2; mesh(box(16, 0.4, 12), P(0xe8dcc0), 0, 0.2, -4, kn);
  for (let i = 0; i < 5; i++) { const x = -6 + i * 3; const col = mesh(cyl(0.45, 0.3, 4, 10), P(0xb8231b), x, 2.4, -7, kn); mesh(cyl(0.6, 0.6, 0.35, 10), P(0x1a1a1a), x, 4.55, -7, kn); }
  mesh(box(16, 0.6, 2), P(0xe8dcc0), 0, 5, -7, kn); mesh(box(16, 4.6, 0.3), P(0xe8c890), 0, 2.5, -8.2, kn);
  const clay = P(0xb86a3a); for (let i = 0; i < 6; i++) { const p = mesh(cyl(0.16, 0.12, 0.9, 10), clay, -4 + i * 0.92, 0.55, -1.5, kn); p.rotation.z = Math.PI / 2; }
  mesh(cyl(1.2, 1.3, 0.5, 16), P(0xe8dcc0), 2.5, 0.65, -1.5, kn); mesh(cyl(1.05, 1.05, 0.06, 16), new THREE.MeshPhongMaterial({ color: 0x5ab8d8, shininess: 120, transparent: true, opacity: 0.85 }), 2.5, 0.88, -1.5, kn); mesh(cyl(0.12, 0.15, 1.2, 10), P(0xe8dcc0), 2.5, 1.2, -1.5, kn); }
// ---------- ROME: bathS with a bronze stopcock + lion spout (x = 3800) ----------
const RMX = 3800; const rm = new THREE.Group(); rm.position.x = RMX; scene.add(rm);
{ mesh(new THREE.PlaneGeometry(200, 200), M(0xd8d0c0), 0, 0, 0, rm).rotation.x = -Math.PI / 2; mesh(box(8, 0.3, 5), P(0x6ab8c8, { shininess: 120 }), 0, 0.05, 0, rm);
  for (const s of [-1, 1]) mesh(box(8.6, 0.6, 0.3), P(0xe8e0d0), 0, 0.3, s * 2.65, rm); for (const s of [-1, 1]) mesh(box(0.3, 0.6, 5.6), P(0xe8e0d0), s * 4.15, 0.3, 0, rm);
  for (let i = 0; i < 4; i++) { const ax = -4.5 + i * 3; mesh(box(0.8, 5, 0.8), P(0xe0d8c8), ax, 2.5, -4, rm); } for (let i = 0; i < 3; i++) { const a = mesh(new THREE.TorusGeometry(1.1, 0.35, 6, 12, Math.PI), P(0xe0d8c8), -3 + i * 3, 5, -4, rm); }
  mesh(box(12, 6, 0.4), P(0xc8b8a0), 0, 3, -4.6, rm); const lion = mesh(new THREE.SphereGeometry(0.4, 10, 8), P(0xb88a4a, { shininess: 100 }), 0, 2.0, -4.2, rm); }
const valve = new THREE.Group(); scene.add(valve); { const br = P(0xb88a4a, { shininess: 120, specular: 0xffd890 }); mesh(cyl(0.22, 0.22, 0.5, 14), br, 0, 0, 0, valve).rotation.z = Math.PI / 2; mesh(cyl(0.1, 0.1, 1.6, 10), br, 0, 0, 0, valve).rotation.z = Math.PI / 2; const kh = new THREE.Group(); kh.position.y = 0.3; valve.add(kh); mesh(cyl(0.06, 0.06, 0.3, 8), br, 0, 0, 0, kh); mesh(box(0.5, 0.08, 0.08), br, 0, 0.18, 0, kh); valve.userData.kh = kh; }
// ---------- two taps H/C (Victorian sink) ----------
const TWX = 4200; const tw = new THREE.Group(); tw.position.x = TWX; scene.add(tw);
{ const wall = canvasTex(16, 16, (g) => { g.fillStyle = '#d8e8d8'; g.fillRect(0, 0, 16, 16); g.fillStyle = '#b8c8b8'; g.fillRect(0, 7, 16, 1); }); wall.wrapS = wall.wrapT = THREE.RepeatWrapping; wall.repeat.set(10, 6); mesh(new THREE.PlaneGeometry(8, 4), M(0xffffff, { map: wall }), 0, 2, -0.6, tw); mesh(new THREE.PlaneGeometry(8, 8), M(0x6a5a4a), 0, 0, 2, tw).rotation.x = -Math.PI / 2;
  mesh(cyl(0.45, 0.35, 0.3, 16), P(0xf4f4f0), 0, 0.95, -0.15, tw); mesh(cyl(0.08, 0.12, 0.95, 10), P(0xf4f4f0), 0, 0.47, -0.15, tw); }
const twoTaps = []; for (const s of [-1, 1]) { const g = new THREE.Group(); g.position.set(TWX + s * 0.28, 1.12, -0.48); scene.add(g); const c = chrome(); mesh(cyl(0.035, 0.04, 0.12, 10), c, 0, 0, 0, g); const sp = mesh(cyl(0.025, 0.025, 0.2, 8), c, 0, 0.0, 0.1, g); sp.rotation.x = Math.PI / 2;
  const hd = new THREE.Group(); hd.position.y = 0.1; g.add(hd); for (let i = 0; i < 4; i++) { const a = mesh(box(0.16, 0.02, 0.025), c, 0, 0, 0, hd); a.rotation.y = i * Math.PI / 4; } mesh(cyl(0.035, 0.035, 0.03, 10), new THREE.MeshBasicMaterial({ color: s < 0 ? 0xd8231b : 0x2a6aff }), 0, 0.02, 0, hd); twoTaps.push({ g, hd }); }
// ---------- 1937 American kitchen: Al Moen (x = 4600) ----------
const MKX = 4600; const mk = new THREE.Group(); mk.position.x = MKX; scene.add(mk);
{ const wp = canvasTex(16, 16, (g) => { g.fillStyle = '#f0e6c8'; g.fillRect(0, 0, 16, 16); g.fillStyle = '#d8a8a8'; g.fillRect(3, 3, 2, 2); g.fillRect(11, 11, 2, 2); }); wp.wrapS = wp.wrapT = THREE.RepeatWrapping; wp.repeat.set(12, 6);
  mesh(new THREE.PlaneGeometry(10, 4), M(0xffffff, { map: wp }), 0, 2, -0.8, mk); const ch = canvasTex(16, 16, (g) => { g.fillStyle = '#f0f0f0'; g.fillRect(0, 0, 16, 16); g.fillStyle = '#1a1a1a'; g.fillRect(0, 0, 8, 8); g.fillRect(8, 8, 8, 8); }); ch.wrapS = ch.wrapT = THREE.RepeatWrapping; ch.repeat.set(12, 12);
  mesh(new THREE.PlaneGeometry(10, 10), M(0xffffff, { map: ch }), 0, 0, 2, mk).rotation.x = -Math.PI / 2; makeSink(mk, 0, -0.4); mesh(box(1.4, 1.9, 0.7), P(0xf0f0e8), 2.4, 0.95, -0.45, mk); mesh(box(0.05, 0.4, 0.05), P(0xc8ccd2), 1.75, 1.2, -0.08, mk);
  mesh(box(1.2, 0.8, 0.05), P(0x8ab0d0), -2.2, 2.0, -0.78, mk); }
const oldTaps = []; for (const s of [-1, 1]) { const g = new THREE.Group(); g.position.set(MKX + s * 0.28, 0.97, -0.62); scene.add(g); const c = chrome(); mesh(cyl(0.035, 0.04, 0.12, 10), c, 0, 0.06, 0, g); const sp = mesh(cyl(0.025, 0.025, 0.22, 8), c, 0, 0.12, 0.1, g); sp.rotation.x = Math.PI / 2; const hd = new THREE.Group(); hd.position.y = 0.16; g.add(hd); for (let i = 0; i < 4; i++) { const a = mesh(box(0.16, 0.02, 0.025), c, 0, 0, 0, hd); a.rotation.y = i * Math.PI / 4; } mesh(cyl(0.035, 0.035, 0.03, 10), new THREE.MeshBasicMaterial({ color: s < 0 ? 0xd8231b : 0x2a6aff }), 0, 0.02, 0, hd); oldTaps.push({ g, hd }); }
const moen = makePerson(scene, { seed: 6, coat: 0x6a5a48, legs: 0x3a3a3a, hat: (h, torso, reg) => { mesh(new THREE.SphereGeometry(0.285, 8, 5, 0, Math.PI * 2, 0, Math.PI * 0.45), reg(M(0x2a1a10)), 0, 0.04, -0.02, h); mesh(box(0.08, 0.3, 0.02), reg(M(0x8a2a2a)), 0, 0.35, 0.27, torso); } });
// blueprint + patent paper
const bpT = canvasTex(256, 192, () => {}); function drawBP() { const g = bpT.image.getContext('2d'); g.fillStyle = '#1a4a8a'; g.fillRect(0, 0, 256, 192); g.strokeStyle = 'rgba(255,255,255,0.25)'; for (let x = 0; x < 256; x += 16) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, 192); g.stroke(); } for (let y = 0; y < 192; y += 16) { g.beginPath(); g.moveTo(0, y); g.lineTo(256, y); g.stroke(); }
  g.strokeStyle = '#fff'; g.lineWidth = 3; g.beginPath(); g.moveTo(110, 170); g.lineTo(110, 70); g.quadraticCurveTo(110, 40, 160, 45); g.lineTo(190, 60); g.stroke(); g.beginPath(); g.moveTo(100, 70); g.lineTo(60, 50); g.stroke(); g.strokeRect(90, 160, 40, 14);
  g.fillStyle = '#ff6a6a'; g.font = '12px PS2P'; g.fillText('HOT', 20, 120); g.fillStyle = '#9fd0ff'; g.fillText('COLD', 180, 120); g.fillStyle = '#fff'; g.font = '10px PS2P'; g.fillText('ONE HANDLE', 72, 24); bpT.needsUpdate = true; }
const bp = mesh(new THREE.PlaneGeometry(1.4, 1.05), new THREE.MeshBasicMaterial({ map: bpT }), MKX - 1.3, 1.7, -0.75, scene);
const patT = canvasTex(192, 256, () => {}); function drawPat() { const g = patT.image.getContext('2d'); g.fillStyle = '#f2ead4'; g.fillRect(0, 0, 192, 256); g.fillStyle = '#2a2a2a'; g.font = '14px PS2P'; g.textAlign = 'center'; g.fillText('PATENT', 96, 34); g.font = '10px PS2P'; g.fillText('1942', 96, 54); for (let y = 76; y < 230; y += 9) g.fillRect(20, y, 90 + (y * 13) % 60, 2); g.strokeStyle = '#8a2a2a'; g.lineWidth = 3; g.beginPath(); g.arc(150, 215, 22, 0, 7); g.stroke(); patT.needsUpdate = true; }
const paper = mesh(new THREE.PlaneGeometry(0.9, 1.2), new THREE.MeshBasicMaterial({ map: patT }), 0, 0, 0, scene);
const bulb = mesh(new THREE.SphereGeometry(0.16, 12, 10), new THREE.MeshBasicMaterial({ color: 0xffe14a }), 0, 0, 0, scene);
const steamPool = spritePool(puffTex, 24), splashPool = spritePool(puffTex, 20);
let STREAM = null;
function stateAt(t) {
  const S = sceneAt(t); STREAM = null;
  room.visible = balcony.visible = hallway.visible = false; kitchen.visible = S === 'home'; dad.root.visible = false; mom.root.visible = false;
  bathS.visible = S === 'hook' || S === 'sensor'; eg.visible = S === 'egypt'; kn.visible = S === 'knossos'; rm.visible = valve.visible = S === 'rome'; tw.visible = S === 'twotaps'; twoTaps.forEach(x => x.g.visible = S === 'twotaps');
  mk.visible = S === 'moen' || S === 'idea'; oldTaps.forEach(x => x.g.visible = mk.visible); moen.root.visible = mk.visible; bp.visible = S === 'idea'; paper.visible = S === 'patent'; bulb.visible = S === 'idea' && t > NX(7).t0 + 1.2;
  fau.g.visible = S === 'hook' || S === 'sensor' || S === 'patent'; hand.root.visible = S === 'hook' || S === 'sensor'; sensorEye.visible = S === 'sensor';
  // hook: hot water, the hand recoils
  if (S === 'hook' || S === 'sensor') { fau.g.position.set(0, 0.95, -0.45); bathS.add(fau.g); const on = S === 'hook' ? t > 0.6 : t > NX(9).t0 + 1.6; fau.lever.rotation.x = S === 'hook' && on ? -0.6 : 0; if (on) STREAM = fau.g.localToWorld(fau.mouth.clone());
    const recoil = S === 'hook' && t > 1.4; const k = S === 'sensor' ? easeOut(seg(t, NX(9).t0 + 0.3, NX(9).t0 + 1.5)) : 1;
    hand.root.position.set(HX + 0.95 + (S === 'sensor' ? 0.25 * (1 - k) : 0), recoil ? 0.1 + Math.sin(t * 30) * 0.03 : 0.0, 0.05); hand.root.rotation.set(0, -Math.PI / 2, 0); applyPose(hand, { ...POSE0, aRx: 1.5, eR: recoil ? 1.2 : 0.3, aRz: recoil ? 1.0 : 0.15, aLz: 0.2 }); setFace(hand, recoil ? 'scream' : 'flat', recoil ? 'scream' : 'flat', {}); sensorEye.material.color.setHex(S === 'sensor' && t > NX(9).t0 + 1.4 ? 0x3df05a : 0x2a6aff); }
  if (S === 'patent') { fau.g.position.set(HX + 0.6, 0, 0); scene.add(fau.g); fau.g.position.set(HX + 50, 0.8, 0.3); fau.g.rotation.y = t * 0.8; paper.position.set(HX + 49.3, 1.4, 0); paper.rotation.set(0, 0.25, 0.05); }
  else { fau.g.rotation.y = 0; }
  if (S === 'rome') { valve.position.set(RMX + 1.8, 0.8, 2.9); valve.userData.kh.rotation.y = seg(t, NX(4).t0 + 1.2, NX(4).t0 + 2.4) * Math.PI / 2; if (t > NX(4).t0 + 1.8) STREAM = V(RMX, 1.75, -3.9); }
  if (S === 'knossos') STREAM = V(KNX + 2.5, 1.85, -1.5);
  if (S === 'twotaps') { const k = Math.sin(t * 2); twoTaps[0].hd.rotation.y = k > 0 ? t * 3 : 0; twoTaps[1].hd.rotation.y = k <= 0 ? t * 3 : 0; STREAM = V(TWX + (k > 0 ? -0.28 : 0.28), 1.12, -0.36); }
  if (S === 'moen' || S === 'idea') { const burn = S === 'moen' && t > NX(6).t0 + 2.6; moen.root.position.set(MKX + (S === 'idea' ? -0.9 : 0.05), 0, S === 'idea' ? 0.15 : 0.32); moen.root.rotation.set(0, S === 'idea' ? -0.3 : Math.PI, 0);
    const p = { ...POSE0 }; if (S === 'moen') { p.aRx = 1.5; p.eR = burn ? 1.6 : 0.3; p.aRz = burn ? 1.2 : 0.1; if (burn) { moen.root.position.y = Math.abs(Math.sin(t * 12)) * 0.15; p.aLz = 1.4; } } else { p.aRx = 1.2; p.eR = 1.9; p.hx = -0.2; p.aLx = 0.6; }
    applyPose(moen, p); setFace(moen, burn ? 'scream' : S === 'idea' && t > NX(7).t0 + 1.2 ? 'sparkle' : 'flat', burn ? 'scream' : S === 'idea' ? 'smile' : 'flat', { stache: true, stacheColor: '#3a2414' });
    oldTaps[0].hd.rotation.y = S === 'moen' && t > NX(6).t0 + 1.4 ? t * 3 : 0; if (S === 'moen' && t > NX(6).t0 + 1.8) STREAM = V(MKX - 0.28, 1.09, -0.5);
    bulb.position.copy(headOf(moen)).add(V(0, 0.55, 0)); }
  if (S === 'home') { dad.root.visible = true; dad.root.position.set(KX + 0.5, 0, -0.5); dad.root.rotation.set(0, -0.2, 0); applyPose(dad, talkPose({ ...POSE0, aRx: 1.3, aRz: 0.5, eR: 0.4 }, t, 'dad', 0.3)); setFace(dad, 'sparkle', talkMouth(t, 'dad', 'grin') || 'smile', { stache: true }); homeLight(); kitLight.intensity = 1.0; roomLight.position.set(KX, 2.8, 1); }
  // stream geometry
  stream.visible = !!STREAM; if (STREAM) { const floor = S === 'knossos' ? 0.9 : S === 'rome' ? 0.3 : S === 'twotaps' ? 1.0 : 0.93; const len = Math.max(0.05, STREAM.y - floor); stream.scale.set(1, len, 1); stream.position.set(STREAM.x, STREAM.y - len / 2, STREAM.z); stream.material.color.setHex(S === 'rome' || S === 'knossos' ? 0x9fd8e8 : 0xbfe4ff); }
  if (S === 'home') return;
  if (S === 'hook' || S === 'sensor') fixedLight(V(HX, 0, 0), 0xf4f8ff, 0x606060, 0.95, 0xffffff, 0.5, 0x111111, null);
  else if (S === 'egypt') fixedLight(V(EGX, 0, 0), 0xffe0b0, 0x806040, 0.85, 0xffd8a0, 1.2, 0xe8b070, 0xe8c090, 60, 400);
  else if (S === 'knossos') fixedLight(V(KNX, 0, 0), 0xfff0d8, 0x806050, 0.85, 0xfff0d0, 1.1, 0x8fc4ec, 0xb8d0e0, 60, 400);
  else if (S === 'rome') fixedLight(V(RMX, 0, 0), 0xfff0e0, 0x706050, 0.85, 0xfff4e0, 1.0, 0x9fc4e0, 0xc8d4e0, 60, 400);
  else if (S === 'twotaps') fixedLight(V(TWX, 0, 0), 0xfff0d8, 0x504030, 0.85, 0xffe0b0, 0.6, 0x111111, null);
  else if (S === 'moen' || S === 'idea') fixedLight(V(MKX, 0, 0), 0xfff0d8, 0x605040, 0.9, 0xfff0d8, 0.7, 0x111111, null);
  else fixedLight(V(HX + 50, 0, 0), 0x8a90a0, 0x202020, 0.7, 0xffffff, 0.9, 0x1a1a22, null);
}
function shotAt(t) {
  const S = sceneAt(t);
  if (S === 'hook') { const k = easeInOut(seg(t, 0, NX(2).t0)); cam(V(HX - 0.7 + 0.2 * k, 1.6 - 0.1 * k, 1.0 - 0.2 * k), V(HX + 0.25, 1.2, -0.3), 52); return; }
  if (S === 'egypt') { const k = easeInOut(seg(t, NX(2).t0 - 0.2, NX(3).t0)); cam(V(EGX + 2.5 - 1.0 * k, 1.6 + 0.4 * k, 6 - 8 * k), V(EGX - 1.5, 0.3, -2 - 8 * k), 55); return; }
  if (S === 'knossos') { const k = easeInOut(seg(t, NX(3).t0 - 0.2, NX(4).t0)); cam(V(KNX + 5 - 2 * k, 2.4, 6 - 1 * k), V(KNX + 0.5, 1.2, -3), 55); return; }
  if (S === 'rome') { if (t < NX(4).t0 + 2.6) { const v = valve.position; cam(v.clone().add(V(1.2, 0.8, 1.6)), v.clone().add(V(0, 0.2, 0)), 50); return; } cam(V(RMX + 2.5, 2.2, 3.5), V(RMX, 1.6, -3.9), 55); return; }
  if (S === 'twotaps') { const k = easeInOut(seg(t, NX(5).t0 - 0.2, NX(6).t0)); cam(V(TWX + 0.4, 1.55, 0.6 - 0.2 * k), V(TWX, 1.12, -0.45), 52); return; }
  if (S === 'moen') { if (t < NX(6).t0 + 2.4) cam(V(MKX - 1.6, 1.75, 1.1), V(MKX - 0.1, 1.15, -0.4), 55); else faceCam(moen, 1.8, 0.3, 0.1, 56, 0.3); return; }
  if (S === 'idea') { faceCam(moen, 2.2, -0.6, 0.25, 58, 0.15); return; }
  if (S === 'patent') { const k = easeInOut(seg(t, NX(8).t0 - 0.2, NX(9).t0)); cam(V(HX + 50.6 + 0.6 * k, 1.3, 2.2 - 0.4 * k), V(HX + 49.7, 1.15, 0.1), 50); return; }
  if (S === 'sensor') { cam(V(HX - 0.7, 1.5, 0.95), V(HX + 0.2, 1.2, -0.3), 50); return; }
  faceCam(dad, 1.8 - 0.2 * seg(t, T_HOME, DUR), -0.2, 0.1, 56, 0.3);
}
function particles(t) { const S = sceneAt(t), st = [], sp = [];
  if (S === 'hook' || (S === 'moen' && t > NX(6).t0 + 1.8)) { const b = S === 'hook' ? V(HX, 1.0, -0.15) : V(MKX - 0.28, 0.95, -0.5); for (let i = 0; i < 10; i++) { const k = (t * 0.6 + i / 10) % 1; st.push({ pos: b.clone().add(V(Math.sin(i * 2.3) * 0.1 + k * 0.08, k * 0.6, Math.cos(i * 1.7) * 0.08 + 0.1)), size: 0.05 + k * 0.14, op: 0.3 * (1 - k), color: 0xf4f4f4 }); } }
  if (STREAM) { const fl = S === 'knossos' ? 0.9 : S === 'rome' ? 0.3 : S === 'twotaps' ? 1.0 : 0.93; for (let i = 0; i < 10; i++) { const k = (t * 2 + i / 10) % 1; sp.push({ pos: V(STREAM.x + Math.sin(i * 2.1) * k * 0.12, fl + Math.sin(k * Math.PI) * 0.08, STREAM.z + Math.cos(i * 1.3) * k * 0.12), size: 0.05 + k * 0.06, op: 0.7 * (1 - k), color: 0xdff4ff }); } }
  emit(st, steamPool); emit(sp, splashPool); emit([], starPool); emit([], puffPool); emit([], trailPool); emit([], sweatPool); }
window.renderFrame = function (t) {
  const pop = t >= POP[0] && t < POP[1]; const ts = pop ? POP[0] : t;
  stateAt(ts); shotAt(ts); aimShadow(); particles(ts);
  if (pop) { dad.root.visible = false; mom.root.visible = false; renderer.render(scene, camera);
    placeInFront(dad, t, POP[0], POP[1], -0.35); applyPose(dad, talkPose({ ...POSE0, aRx: 1.2, eR: 0.4, aRz: 0.5, aLz: 0.6, eL: 0.6 }, t, 'dad', 0.35)); setFace(dad, t > OX2(1).t0 ? 'wide' : 'sparkle', talkMouth(t, 'dad', 'grin') || (t > OX2(1).t0 ? 'o' : 'grin'), { stache: true });
    const list = [dad]; if (t > OX2(1).t0 - 0.35) { placeInFront(mom, t, OX2(1).t0 - 0.35, POP[1], 0.55, 2.9); applyPose(mom, talkPose({ ...POSE0, aLz: 0.5, aRz: 0.5, eL: 2.0, eR: 2.0, aLx: 0.6, aRx: 0.6 }, t, 'mom', 0.3)); setFace(mom, 'smug', talkMouth(t, 'mom') || 'flat', {}); list.push(mom); }
    renderOverlay(list);
  } else renderer.render(scene, camera);
  ctx.clearRect(0, 0, W, H); ctx.drawImage(glCanvas, 0, 0);
  h.clearRect(0, 0, W, H);
  if (pop) drawPause(h);
  if (sceneAt(t) === 'home' || pop) drawDialogueV(h, t); else drawSub(h, t);
  drawTitleCard(h, t, NX(1).t1 + 0.6, 'الحنفية اتعملت إزاي؟', 'قصة حقيقية');
  drawTags(h, t, [[NX(2).t0 - 0.2, 'مصر القديمة • من ٤٥٠٠ سنة', 'ABUSIR, EGYPT'], [NX(3).t0 - 0.2, 'كنوسوس • كريت', 'KNOSSOS, CRETE'], [NX(4).t0 - 0.2, 'روما', 'ANCIENT ROME'], [NX(6).t0 - 0.2, '١٩٣٧', 'AL MOEN'], [NX(8).t0 - 0.2, '١٩٤٢', 'SINGLE-HANDLE MIXING FAUCET']]);
  drawCTAbox(h, t, DX(2).t0, 'الاختراع الجاي هيبقى إيه؟ 💡', 'اكتبولي في الكومنتات');
  ctx.drawImage(hud, 0, 0); vignette(ctx, 0.35);
  if (t > DUR - 0.8) { ctx.fillStyle = `rgba(0,0,0,${clamp((t - DUR + 0.8) / 0.8)})`; ctx.fillRect(0, 0, W, H); }
  return true;
};
window.frameData = () => out.toDataURL('image/png');
window.DUR = DUR;
document.fonts.load('10px PS2P').then(() => document.fonts.load('20px Lalezar', 'ع')).then(() => document.fonts.load('700 20px ReemKufi', 'ع')).then(() => { drawBP(); drawPat(); enableShadows(); window.READY = true; });
