// ---------- shared documentary toolkit («حصلت إزاي؟») ----------
const NARR = LINES.filter(l => l.s === 'anno'), DL = LINES.filter(l => l.s === 'dad'), OL = LINES.filter(l => l.s !== 'anno' && l.s !== 'dad');
const NX = (i) => NARR[i - 1], DX = (i) => DL[i - 1], OX2 = (i) => OL[i - 1];
camera.far = 1500;
const hemi = new THREE.HemisphereLight(0xbfd8ff, 0x3a3020, 0); scene.add(hemi);
const sun = new THREE.DirectionalLight(0xffffff, 0); scene.add(sun); scene.add(sun.target);
function fixedLight(ref, sky, ground, hi, sunCol, si, bg, fogCol, f0, f1) {
  hemi.color.setHex(sky); hemi.groundColor.setHex(ground); hemi.intensity = hi; sun.color.setHex(sunCol); sun.intensity = si; sun.position.copy(ref).add(V(-60, 80, 40)); sun.target.position.copy(ref);
  scene.background = new THREE.Color(bg); scene.fog = fogCol == null ? null : new THREE.Fog(fogCol, f0, f1);
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
// =====================================================================
// الراجل اللي طلع من التلج — Ötzi the Iceman, 1991. Documentary, narrator Schedar. Ibrahim + Uncle Sayed pop in on a frozen frame. vertical 9:16
// NX1 Alps | NX2 hikers find a body | NX3 dug out with tools | NX4 5300 years old (Copper Age) | POP | NX5 his gear | NX6 2001 X-ray, arrowhead | NX7 he was killed | NX8 mystery | DX2 CTA
// =====================================================================
const POP = [DX(1).t0 - 0.55, OX2(1).t1 + 0.45];
const T_HOME = DX(2).t0 - 0.3;
const sceneAt = (t) => t < NX(2).t0 - 0.2 ? 'alps' : t < NX(3).t0 - 0.2 ? 'find' : t < NX(4).t0 - 0.2 ? 'rescue' : t < NX(5).t0 - 0.2 ? 'past' : t < NX(6).t0 - 0.2 ? 'gear' : t < NX(7).t0 - 0.2 ? 'xray' : t < NX(8).t0 - 0.2 ? 'murder' : t < T_HOME ? 'snow' : 'home';
// Uncle Sayed (same model as the series)
const sayed = makeChar({
  seed: 41, skin: 0x8a5a3a, hipY: 0.84, legX: 0.12, legColor: 0x6b5a48, shoe: 0x3a2a1a, hand: 0x8a5a3a,
  torsoGeo: cyl(0.28, 0.34, 0.66, 7), torsoTex: null, torsoColor: 0x6b5a48, torsoY: 0.33,
  skirt: cyl(0.34, 0.44, 0.75, 7), sleeve: true, sleeveColor: 0x6b5a48, shoulderX: 0.34, shoulderY: 0.6, neckY: 0.66, headR: 0.28,
  build(head, torso, reg) { const tw = reg(M(0xf4f2ea)); const turban = mesh(new THREE.TorusGeometry(0.24, 0.09, 5, 10), tw, 0, 0.2, -0.02, head); turban.rotation.x = Math.PI / 2; mesh(new THREE.SphereGeometry(0.2, 7, 4, 0, Math.PI * 2, 0, Math.PI / 2), tw, 0, 0.22, -0.02, head); mesh(box(0.62, 0.1, 0.05), reg(M(0xd8d0b8)), 0, 0.45, 0.24, torso); return {}; }
}, scene); sayed.root.visible = false;
// ---------- the Alps (x = 2400) ----------
const MX = 2400; const alps = new THREE.Group(); alps.position.x = MX; scene.add(alps);
const snowT = canvasTex(32, 32, (g) => { g.fillStyle = '#eef4fa'; g.fillRect(0, 0, 32, 32); g.fillStyle = '#d8e4f0'; for (let i = 0; i < 40; i++) g.fillRect((i * 7) % 32, (i * 11) % 32, 2, 1); }); snowT.wrapS = snowT.wrapT = THREE.RepeatWrapping; snowT.repeat.set(50, 50);
const snowGround = mesh(new THREE.PlaneGeometry(600, 600, 150, 150), M(0xffffff, { map: snowT }), 0, 0, 0, alps); snowGround.rotation.x = -Math.PI / 2;
{ const p = snowGround.geometry.attributes.position.array; for (let i = 0; i < p.length; i += 3) { const x = p[i], y = p[i + 1]; const d = Math.hypot(x, y); const r = clamp((d - 40) / 60); p[i + 2] = r * r * (Math.sin(x * 0.03) * 6 + Math.cos(y * 0.025) * 8 + 10) + Math.sin(x * 0.2) * Math.cos(y * 0.17) * 0.12; } snowGround.geometry.computeVertexNormals(); }
{ const r = rng(9); for (let i = 0; i < 16; i++) { const ang = r() * 6.28, d = 140 + r() * 120, h = 70 + r() * 80; const mx = Math.cos(ang) * d, mz = -Math.abs(Math.sin(ang)) * d - 40; mesh(new THREE.ConeGeometry(45 + r() * 30, h, 7), P(0x6a6a72), mx, h / 2 - 5, mz, alps); mesh(new THREE.ConeGeometry((45 + r() * 30) * 0.42, h * 0.42, 7), M(0xffffff, { map: snowT }), mx, h - 5 - h * 0.21 + 2, mz, alps); }
  for (let i = 0; i < 14; i++) mesh(new THREE.DodecahedronGeometry(1.5 + r() * 2.5, 0), P(0x5a5a62), -30 + r() * 60, 0.5, -10 - r() * 30, alps); }
// the ice gully with the body (face down, half in the ice)
const gully = new THREE.Group(); gully.position.set(MX, 0, 0); scene.add(gully);
mesh(new THREE.PlaneGeometry(6, 3), new THREE.MeshPhongMaterial({ color: 0x9fd0e8, transparent: true, opacity: 0.85, shininess: 120 }), 0, 0.12, 0, gully).rotation.x = -Math.PI / 2;
const iceBody = makePerson(gully, { seed: 5, skin: 0x6a4a30, coat: 0x5a4030, legs: 0x5a4030, buttons: false }); iceBody.root.position.set(0, 0.05, 0); iceBody.root.rotation.set(-Math.PI / 2 + 0.05, 0, 0.1); applyPose(iceBody, { ...POSE0, aLz: 0.8, aRz: 0.2, eL: 0.3 }); setFace(iceBody, 'closed', 'flat', {});
const iceCover = mesh(box(1.4, 0.3, 1.1), new THREE.MeshPhongMaterial({ color: 0xbfe4f4, transparent: true, opacity: 0.8, shininess: 120 }), 0, 0.2, 0.7, gully);
// hikers + rescuers (cast style)
const backpack = (col) => (h, torso, reg) => { mesh(box(0.4, 0.5, 0.22), reg(M(col)), 0, 0.35, -0.24, torso); mesh(new THREE.SphereGeometry(0.28, 8, 4, 0, Math.PI * 2, 0, Math.PI * 0.45), reg(M(0x2a2a2a)), 0, 0.04, 0, h); };
const hiker1 = makePerson(scene, { seed: 1, coat: 0xd8231b, legs: 0x2a2a3a, hat: backpack(0x2a5aa8) }), hiker2 = makePerson(scene, { seed: 2, coat: 0x2a6ad8, legs: 0x3a3a3a, skirt: null, hat: backpack(0xd8a020) });
const rescuers = [0, 1].map(i => makePerson(scene, { seed: 10 + i, coat: 0xff7a1a, legs: 0x2a2a2a, hat: (h, t2, reg) => mesh(new THREE.SphereGeometry(0.29, 8, 4, 0, Math.PI * 2, 0, Math.PI * 0.45), reg(M(0xf0f0f0)), 0, 0.04, 0, h) }));
const picks = rescuers.map(r => { const g = new THREE.Group(); r.arms[1].hand.add(g); mesh(box(0.04, 0.9, 0.04), P(0x3a3a3a), 0, 0.1, 0, g); mesh(box(0.4, 0.06, 0.06), P(0x9a9ea2), 0, -0.35, 0, g); return g; });
// Ötzi alive (Copper Age): fur cape, fur hat, bow, quiver, copper axe
const furT = canvasTex(16, 16, (g) => { g.fillStyle = '#6a5038'; g.fillRect(0, 0, 16, 16); g.fillStyle = '#4a3828'; for (let i = 0; i < 16; i += 2) g.fillRect(i, 0, 1, 16); g.fillStyle = '#8a6a48'; for (let y = 0; y < 16; y += 4) g.fillRect(0, y, 16, 1); });
const otzi = makePerson(scene, { seed: 7, skin: 0xb98058, coatTex: furT, sleeve: 0x5a4030, legs: 0x5a4030, shoe: 0x3a2a1a, hat: (h, torso, reg) => { mesh(new THREE.SphereGeometry(0.29, 8, 5, 0, Math.PI * 2, 0, Math.PI * 0.4), reg(M(0x4a3828)), 0, 0.08, 0, h); mesh(box(0.44, 0.16, 0.1), reg(M(0x3a2a1a)), 0, -0.2, 0.22, h); mesh(box(0.35, 0.8, 0.12), reg(M(0x4a3828)), 0, 0.2, -0.24, torso); } });
const bow = mesh(new THREE.TorusGeometry(0.9, 0.03, 4, 12, Math.PI * 0.9), P(0x6a4e30), 0, 0, 0, scene); const axe = new THREE.Group(); otzi.arms[1].hand.add(axe); mesh(box(0.05, 0.6, 0.05), P(0x6a4e30), 0, 0.1, 0, axe); mesh(box(0.06, 0.12, 0.2), P(0xc87a3a, { shininess: 90 }), 0, 0.38, 0.08, axe);
const archer = makePerson(scene, { seed: 9, skin: 0x2a2018, coatTex: furT, sleeve: 0x1a1410, legs: 0x1a1410 }); archer.mats.forEach(m => m.color.setHex(0x2a221c));
const rock = mesh(new THREE.DodecahedronGeometry(2.4, 0), P(0x5a5a62), 0, 0, 0, scene);
const arrow = new THREE.Group(); scene.add(arrow); mesh(box(0.02, 0.02, 0.8), P(0x6a4e30), 0, 0, 0, arrow); mesh(new THREE.ConeGeometry(0.03, 0.08, 4), P(0x3a3a3a), 0, 0, -0.43, arrow).rotation.x = -Math.PI / 2;
// museum table with his gear (x = 2800)
const GX = 2800; const gear = new THREE.Group(); gear.position.x = GX; scene.add(gear);
{ mesh(new THREE.PlaneGeometry(20, 20), M(0x1a1a20), 0, 0, 0, gear).rotation.x = -Math.PI / 2; mesh(box(4, 0.12, 1.6), P(0x2a2a30), 0, 0.9, 0, gear); mesh(box(4.1, 0.02, 1.7), M(0x8a8a90), 0, 0.97, 0, gear);
  mesh(box(0.6, 0.5, 0.3), M(0x6a5038, { map: furT }), -1.4, 1.22, 0, gear); // bag
  const b2 = mesh(new THREE.TorusGeometry(1.2, 0.03, 4, 14, Math.PI * 0.7), P(0x6a4e30), -0.2, 1.0, 0.3, gear); b2.rotation.set(-Math.PI / 2, 0, 0.2);
  mesh(cyl(0.1, 0.12, 0.9, 8), M(0x6a5038, { map: furT }), 0.7, 1.0, -0.2, gear).rotation.z = Math.PI / 2; for (let i = 0; i < 4; i++) mesh(box(0.015, 0.015, 0.8), P(0x8a6a44), 0.6 + i * 0.05, 1.03, 0.2 + i * 0.05, gear);
  const ax2 = new THREE.Group(); ax2.position.set(1.5, 1.0, 0.1); gear.add(ax2); mesh(box(0.06, 0.06, 0.6), P(0x6a4e30), 0, 0, 0, ax2); mesh(box(0.06, 0.22, 0.12), P(0xc87a3a, { shininess: 100 }), 0, 0.05, -0.3, ax2); }
const spot = new THREE.SpotLight(0xfff0d8, 0, 12, 0.5, 0.4, 1); spot.position.set(GX, 5, 2); spot.target.position.set(GX, 0.9, 0); scene.add(spot); scene.add(spot.target);
// X-ray (x = 3200): shoulder bones glowing on dark blue
const XX = 3200; const xr = new THREE.Group(); xr.position.x = XX; scene.add(xr);
{ const bone = new THREE.MeshBasicMaterial({ color: 0xbfe8ff, transparent: true, opacity: 0.85 }); mesh(box(0.25, 2.2, 0.2), bone, 0, 1.4, 0, xr); for (let i = 0; i < 7; i++) { const rb = mesh(new THREE.TorusGeometry(0.7 - i * 0.02, 0.04, 4, 16, Math.PI), bone, 0, 2.2 - i * 0.28, 0, xr); rb.rotation.z = Math.PI; }
  const sc = new THREE.Shape(); sc.moveTo(0, 0); sc.lineTo(0.9, 0.2); sc.lineTo(0.7, -1.0); sc.closePath(); mesh(new THREE.ShapeGeometry(sc), bone, 0.3, 2.3, 0.05, xr);
  mesh(cyl(0.12, 0.1, 1.6, 8), bone, 1.3, 2.3, 0, xr).rotation.z = 1.2; mesh(new THREE.SphereGeometry(0.18, 8, 6), bone, 0.85, 2.55, 0, xr); }
const arrowhead = mesh(new THREE.ConeGeometry(0.1, 0.32, 4), new THREE.MeshBasicMaterial({ color: 0xff3a2a }), XX + 0.6, 1.95, 0.1, scene); arrowhead.rotation.z = 2.4;
const snowPool = spritePool(puffTex, 60), icePool = spritePool(puffTex, 16);
function stateAt(t) {
  const S = sceneAt(t);
  room.visible = S === 'home'; balcony.visible = kitchen.visible = hallway.visible = false; dad.root.visible = S === 'home'; mom.root.visible = false; sayed.root.visible = false;
  const onAlps = ['alps', 'find', 'rescue', 'past', 'murder', 'snow'].includes(S); alps.visible = onAlps; gully.visible = S === 'alps' || S === 'find' || S === 'rescue';
  gear.visible = S === 'gear'; xr.visible = arrowhead.visible = S === 'xray'; spot.intensity = S === 'gear' ? 30 : 0;
  hiker1.root.visible = hiker2.root.visible = S === 'alps' || S === 'find'; rescuers.forEach(r => r.root.visible = S === 'rescue');
  otzi.root.visible = S === 'past' || S === 'murder'; bow.visible = otzi.root.visible; archer.root.visible = S === 'murder'; arrow.visible = S === 'murder' && t > NX(7).t0 + 2.4 && t < NX(7).t0 + 3.2;
  iceCover.visible = S !== 'rescue' || t < NX(3).t1 - 1.5;
  if (S === 'alps' || S === 'find') { const k = S === 'alps' ? seg(t, 0, NX(2).t0) : 1; const walk = S === 'alps' || t < NX(2).t0 + 1.6;
    [hiker1, hiker2].forEach((h, i) => { const z = 14 - 10 * (S === 'alps' ? k : 1) + i * 1.4; h.root.position.set(MX + 0.8 - i * 1.3, 0.05, z + (walk && S === 'find' ? -seg(t, NX(2).t0, NX(2).t0 + 1.6) * 1.5 : 0) - (S === 'find' ? 1.5 : 0)); h.root.rotation.set(0, Math.PI, 0);
      const st = walk ? Math.sin(t * 6 + i) : 0; const shock = S === 'find' && t > NX(2).t0 + 2.2; applyPose(h, { ...POSE0, lL: Math.max(0, st) * 0.5, lR: Math.max(0, -st) * 0.5, aLx: shock ? 0.4 : st * 0.3, aRx: shock ? 1.5 : -st * 0.3, eR: shock ? 0.3 : 0.2, hx: shock ? 0.35 : 0 }); setFace(h, shock ? 'wide' : 'flat', shock ? 'o' : 'smile', {}); }); }
  if (S === 'rescue') rescuers.forEach((r, i) => { r.root.position.set(MX + (i ? 1.0 : -1.0), 0.05, 0.6); r.root.rotation.set(0, i ? -1.6 : 1.6, 0); const sw = Math.sin(t * 5 + i * 1.5); applyPose(r, { ...POSE0, bend: 0.45, aRx: 1.5 + sw * 0.7, eR: 0.3, aLx: 1.0, eL: 0.6 }); setFace(r, 'flat', 'clench', {}); });
  if (S === 'past' || S === 'murder') { const z = S === 'past' ? 8 - seg(t, NX(4).t0, NX(5).t0) * 6 : 4 - seg(t, NX(7).t0, NX(7).t0 + 2.6) * 2.5; otzi.root.position.set(MX - 6, 0.2, z); otzi.root.rotation.set(0, Math.PI, 0);
    const hit = S === 'murder' && t > NX(7).t0 + 3.1; const st = hit ? 0 : Math.sin(t * 5); applyPose(otzi, { ...POSE0, lL: Math.max(0, st) * 0.45, lR: Math.max(0, -st) * 0.45, aLx: 0.6, eL: 0.8, aRx: 0.4 - st * 0.2, bend: hit ? -0.3 : 0.05, hx: hit ? -0.3 : 0 }); setFace(otzi, hit ? 'wide' : 'flat', hit ? 'o' : 'flat', { stache: true, stacheColor: '#3a2414' });
    const back = otzi.torso.localToWorld(V(0.1, 0.3, -0.3)); bow.position.copy(back); bow.rotation.set(0, Math.PI / 2, 1.2);
    rock.visible = S === 'murder'; rock.position.set(MX - 4, 0.6, 12);
    if (S === 'murder') { archer.root.position.set(MX - 4, 2.9, 12); archer.root.rotation.set(0, Math.PI, 0); applyPose(archer, { ...POSE0, aLx: 1.6, eL: 0, aRx: 1.5, eR: 2.0, aRz: -0.2 }); setFace(archer, 'menace', 'flat', {});
      const k = seg(t, NX(7).t0 + 2.4, NX(7).t0 + 3.1); const a = archer.root.position.clone().add(V(0, 1.6, -0.8)), b = otzi.torso.localToWorld(V(0.15, 0.45, -0.2)); arrow.position.copy(VL(a, b, k)); arrow.lookAt(b); } }
  if (S === 'home') { dad.root.position.set(0.2, 0, -1.0); dad.root.rotation.set(0, -0.15, 0); applyPose(dad, talkPose({ ...POSE0, aRx: 1.3, aRz: 0.5, eR: 0.4, aLx: 0.8, eL: 1.6, hx: 0.1 }, t, 'dad', 0.3)); setFace(dad, 'side', talkMouth(t, 'dad') || 'flat', { stache: true }); homeLight(); return; }
  if (onAlps) { const past = S === 'past' || S === 'murder'; fixedLight(V(MX, 0, 0), past ? 0xeef0f8 : 0xd8ecff, 0x506070, 0.85, past ? 0xfff0dc : 0xffffff, 1.0, S === 'snow' ? 0x9aa8b8 : past ? 0xb8cce0 : 0x8fc4f0, S === 'snow' ? 0x9aa8b8 : past ? 0xc8d8e8 : 0xc8e0f4, S === 'snow' ? 8 : 80, S === 'snow' ? 90 : 700); }
  else if (S === 'gear') { fixedLight(V(GX, 0, 0), 0xfff0e0, 0x303030, 0.75, 0xfff0d8, 0.6, 0x08080c, null); }
  else fixedLight(V(XX, 0, 0), 0x203050, 0x000000, 0.3, 0xffffff, 0, 0x061428, null);
}
function shotAt(t) {
  const S = sceneAt(t);
  if (S === 'alps') { const k = easeInOut(seg(t, 0, NX(2).t0)); cam(V(MX + 60 - 45 * k, 45 - 38 * k, 90 - 70 * k), V(MX, 2, 0), 55); return; }
  if (S === 'find') { if (t < NX(2).t0 + 2.2) { const h = headOf(hiker1); cam(h.clone().add(V(-1.5, 0.3, -3.2)), h.clone().add(V(0, -0.1, 0)), 55); return; } cam(V(MX + 1.6, 1.4, 2.4), V(MX, 0.2, 0.3), 52); return; }
  if (S === 'rescue') { const k = easeInOut(seg(t, NX(3).t0 - 0.2, NX(4).t0)); cam(V(MX + 3 - 1 * k, 2.6, 3.5 - 0.5 * k), V(MX, 0.4, 0.4), 55); return; }
  if (S === 'past') { const o = otzi.root.position; cam(V(o.x + 2.4, 2.6, o.z - 4.2), o.clone().add(V(0, 1.0, 0)), 55); return; }
  if (S === 'gear') { const k = easeInOut(seg(t, NX(5).t0 - 0.2, NX(6).t0)); cam(V(GX - 1.4 + 2.8 * k, 2.8, 3.6), V(GX - 0.8 + 1.6 * k, 0.95, 0), 54); return; }
  if (S === 'xray') { const k = easeInOut(seg(t, NX(6).t0 - 0.2, NX(7).t0)); cam(V(XX + 0.4, 1.9, 4.2 - 1.6 * k), V(XX + 0.5 * k, 1.9, 0), 55); return; }
  if (S === 'murder') { if (t < NX(7).t0 + 2.4) { const o = otzi.root.position; const tg = VL(o.clone().add(V(0, 1.4, 0)), archer.root.position.clone().add(V(0, 1.2, 0)), 0.55); cam(V(o.x - 3.5, 2.6, o.z - 6), tg, 58); return; } const o = otzi.root.position; cam(V(o.x + 2.6, 2.4, o.z - 5.5), archer.root.position.clone().add(V(0, 0.4, 0)), 56); return; }
  if (S === 'snow') { const k = easeInOut(seg(t, NX(8).t0 - 0.2, T_HOME)); cam(V(MX + 6 + 20 * k, 3 + 14 * k, 8 + 20 * k), V(MX - 4, 0.5, 2), 55); return; }
  faceCam(dad, 1.8 - 0.2 * seg(t, T_HOME, DUR), -0.2, 0.1, 56, 0.3);
}
function particles(t) {
  const S = sceneAt(t), sn = [], ic = [];
  if (S === 'snow' || S === 'alps' || S === 'find') { const c = camera.position; for (let i = 0; i < (S === 'snow' ? 60 : 25); i++) { const k = (t * 0.15 + hash(i)) % 1; sn.push({ pos: V(c.x + (hash(i + 3) - 0.5) * 24, c.y + 6 - k * 14, c.z - 4 - hash(i + 9) * 14), size: 0.12, op: 0.9, color: 0xffffff }); } }
  if (S === 'rescue') for (let i = 0; i < 16; i++) { const k = (t * 2 + i / 16) % 1; ic.push({ pos: V(MX + Math.sin(i * 2) * 0.6, 0.2 + k * 0.9, 0.6 + Math.cos(i * 3) * 0.4), size: 0.12 + k * 0.1, op: 0.8 * (1 - k), color: 0xdff4ff }); }
  emit(sn, snowPool); emit(ic, icePool); emit([], starPool); emit([], puffPool); emit([], trailPool); emit([], sweatPool);
}
window.renderFrame = function (t) {
  const pop = t >= POP[0] && t < POP[1]; const ts = pop ? POP[0] : t;
  stateAt(ts); shotAt(ts); particles(ts);
  if (pop) { dad.root.visible = false; renderer.render(scene, camera);
    placeInFront(dad, t, POP[0], POP[1], -0.35); applyPose(dad, talkPose({ ...POSE0, aRx: 1.2, eR: 0.4, aRz: 0.5, aLz: 0.6, eL: 0.6 }, t, 'dad', 0.35)); setFace(dad, 'sparkle', talkMouth(t, 'dad', 'grin') || 'grin', { stache: true });
    const list = [dad]; if (t > OX2(1).t0 - 0.35) { placeInFront(sayed, t, OX2(1).t0 - 0.35, POP[1], 0.6, 2.9); applyPose(sayed, talkPose({ ...POSE0, aRx: 1.2, eR: 0.5, aRz: 0.4, aLz: 0.4 }, t, 'sayed', 0.3)); setFace(sayed, 'angry', talkMouth(t, 'sayed') || 'frown', { stache: true, stacheColor: '#eeeeee' }); list.push(sayed); }
    renderOverlay(list);
  } else renderer.render(scene, camera);
  ctx.clearRect(0, 0, W, H); ctx.drawImage(glCanvas, 0, 0);
  h.clearRect(0, 0, W, H);
  if (pop) drawPause(h);
  if (sceneAt(t) === 'xray') { h.save(); pxText(h, 'X-RAY • 2001', W / 2, 60, 14, '#bfe8ff', 'center'); h.restore(); }
  if (sceneAt(t) === 'home' || pop) drawDialogueV(h, t); else drawSub(h, t);
  drawTitleCard(h, t, NX(1).t1 + 0.2, 'الراجل اللي طلع من التلج', 'قصة حقيقية • جبال الألب ١٩٩١');
  drawTags(h, t, [[NX(4).t0 - 0.2, 'من حوالي ٥٣٠٠ سنة', '~3300 BC'], [NX(5).t0 - 0.2, 'حاجات أوتزي', 'OTZI\'S GEAR']]);
  drawCTAbox(h, t, DX(2).t0, 'مين قتل أوتزي؟ 🕵️', 'اكتبوا نظريتكم في الكومنتات');
  ctx.drawImage(hud, 0, 0); vignette(ctx, 0.35);
  if (sceneAt(t) === 'murder' && t > NX(7).t0 + 3.1 && t < NX(7).t0 + 3.6) { ctx.fillStyle = 'rgba(0,0,0,0.92)'; ctx.fillRect(0, 0, W, H); }
  if (t > DUR - 0.8) { ctx.fillStyle = `rgba(0,0,0,${clamp((t - DUR + 0.8) / 0.8)})`; ctx.fillRect(0, 0, W, H); }
  return true;
};
window.frameData = () => out.toDataURL('image/png');
window.DUR = DUR;
document.fonts.load('10px PS2P').then(() => document.fonts.load('20px Lalezar', 'ع')).then(() => document.fonts.load('700 20px ReemKufi', 'ع')).then(() => { window.READY = true; });
