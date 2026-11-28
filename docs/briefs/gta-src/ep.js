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
// ---------- detailed cars v2 (smooth extruded body, real glass, lights, rims, plates, contact shadow) ----------
const glowTex = canvasTex(32, 32, (g) => { const gr = g.createRadialGradient(16, 16, 0, 16, 16, 16); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.3, 'rgba(255,255,255,0.5)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 32, 32); });
function glow(parent, col, s, x, y, z) { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: col, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); sp.scale.set(s, s, 1); sp.position.set(x, y, z); parent.add(sp); return sp; }
const shadowTex = canvasTex(64, 64, (g) => { const gr = g.createRadialGradient(32, 32, 4, 32, 32, 32); gr.addColorStop(0, 'rgba(0,0,0,0.6)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); });
function blob(parent, w, l) { const m = mesh(new THREE.PlaneGeometry(w, l), new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false }), 0, 0.02, 0, parent); m.rotation.x = -Math.PI / 2; return m; }
const rimTex = canvasTex(32, 32, (g) => { g.fillStyle = '#c8ccd2'; g.beginPath(); g.arc(16, 16, 15, 0, 7); g.fill(); g.fillStyle = '#5a5e64'; for (let i = 0; i < 5; i++) { const a = i / 5 * 6.283; g.beginPath(); g.moveTo(16, 16); g.arc(16, 16, 13, a + 0.35, a + 0.9); g.fill(); } g.fillStyle = '#2a2a2a'; g.beginPath(); g.arc(16, 16, 3, 0, 7); g.fill(); });
function wheel(parent, x, y, z, r = 0.34, wdt = 0.25) { const wg = new THREE.Group(); wg.position.set(x, y, z); parent.add(wg); const tire = mesh(cyl(r, r, wdt, 18), P(0x141414, { shininess: 10 }), 0, 0, 0, wg); tire.rotation.z = Math.PI / 2;
  const rim = mesh(new THREE.CircleGeometry(r * 0.66, 16), M(0xffffff, { map: rimTex }), Math.sign(x) * (wdt / 2 + 0.003), 0, 0, wg); rim.rotation.y = Math.sign(x) * Math.PI / 2; return wg; }
const plateTex = canvasTex(64, 16, (g) => { g.fillStyle = '#f4f4f0'; g.fillRect(0, 0, 64, 16); g.strokeStyle = '#1a3a8a'; g.lineWidth = 2; g.strokeRect(1, 1, 62, 14); g.fillStyle = '#111'; g.font = '9px PS2P'; g.textAlign = 'center'; g.fillText('123 ABC', 32, 12); });
function sideProfile(l, h, kind) { // x = along the car (front = -l/2), y = up
  const s = new THREE.Shape(); const f = -l / 2, b = l / 2, base = 0.22;
  const hood = kind === 'hatch' ? 0.38 : 0.34, cabF = kind === 'hatch' ? -0.12 : -0.08, cabB = kind === 'hatch' ? 0.47 : 0.3, roofF = kind === 'hatch' ? 0.02 : 0.05, roofB = kind === 'hatch' ? 0.45 : 0.22;
  s.moveTo(f, base + 0.12); s.lineTo(f + 0.05, base + 0.45); s.quadraticCurveTo(f + 0.12, base + 0.58, f + l * 0.12, base + 0.6); // nose
  s.lineTo(l * cabF, base + 0.68); // hood
  s.lineTo(l * roofF, h); s.lineTo(l * roofB, h); // windscreen + roof
  s.lineTo(l * cabB, base + 0.68); // rear glass
  if (kind !== 'hatch') { s.lineTo(b - 0.12, base + 0.66); s.quadraticCurveTo(b, base + 0.62, b, base + 0.45); } else s.lineTo(b, base + 0.5); // trunk
  s.lineTo(b, base + 0.12); s.quadraticCurveTo(b, base, b - 0.15, base); s.lineTo(f + 0.15, base); s.quadraticCurveTo(f, base, f, base + 0.12); return { s, hood, cabF, cabB, roofF, roofB, base };
}
function carMesh(col, w = 1.82, l = 4.5, h = 1.45, kind = 'sedan') {
  const g = new THREE.Group(); scene.add(g); const body = new THREE.Group(); g.add(body);
  const paint = P(col, { shininess: 120, specular: 0x8a8a8a }), glass = P(0x16202c, { shininess: 200, specular: 0xbfd0e0 }), trim = P(0x161616, { shininess: 30 }), chrome = P(0xd8dce2, { shininess: 160, specular: 0xffffff });
  const pr = sideProfile(l, h, kind);
  const geo = new THREE.ExtrudeGeometry(pr.s, { depth: w - 0.1, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.04, bevelSegments: 2, curveSegments: 6 }); geo.translate(0, 0, -w / 2 + 0.05); geo.rotateY(-Math.PI / 2);
  mesh(geo, paint, 0, 0, 0, body);
  // glass: side windows (a polygon inside the greenhouse) + windscreen + rear glass
  const y0 = pr.base + 0.72, y1 = h - 0.06; const xf = l * pr.cabF + 0.18, xr = l * pr.cabB - (kind === 'hatch' ? 0.42 : 0.14), rf = l * pr.roofF + 0.06, rb = l * pr.roofB - 0.04;
  const win = new THREE.Shape(); win.moveTo(xf, y0); win.lineTo(rf, y1); win.lineTo(rb, y1); win.lineTo(xr, y0); win.closePath();
  const glassS = glass.clone(); glassS.side = THREE.DoubleSide;
  for (const s of [-1, 1]) { const wg = mesh(new THREE.ShapeGeometry(win), glassS, s * (w / 2 + 0.012), 0, 0, body); wg.rotation.y = -Math.PI / 2;
    const bp = mesh(box(0.02, y1 - y0, 0.07), paint, s * (w / 2 + 0.016), (y0 + y1) / 2, (xf + xr) / 2 + 0.05, body); }
  const wsLen = Math.hypot(l * pr.roofF - l * pr.cabF, h - (pr.base + 0.68)), wsAng = Math.atan2(h - (pr.base + 0.68), l * pr.roofF - l * pr.cabF);
  const wsN = V(0, l * pr.roofF - l * pr.cabF, -(h - (pr.base + 0.68))).normalize().multiplyScalar(0.035); const ws = mesh(box(w * 0.84, 0.02, wsLen * 0.86), glass, 0, (h + pr.base + 0.68) / 2 + wsN.y, (l * pr.cabF + l * pr.roofF) / 2 + wsN.z, body); ws.rotation.x = -wsAng;
  const rgLen = Math.hypot(l * pr.cabB - l * pr.roofB, h - (pr.base + 0.68)), rgAng = Math.atan2(h - (pr.base + 0.68), l * pr.cabB - l * pr.roofB);
  const rgN = V(0, l * pr.cabB - l * pr.roofB, h - (pr.base + 0.68)).normalize().multiplyScalar(0.035); const rg = mesh(box(w * 0.82, 0.02, rgLen * 0.84), glass, 0, (h + pr.base + 0.68) / 2 + rgN.y, (l * pr.cabB + l * pr.roofB) / 2 + rgN.z, body); rg.rotation.x = rgAng;
  // front: grille, headlights, bumper; rear: light strip, plate, bumper
  const F = -l / 2 - 0.06, B = l / 2 + 0.06;
  mesh(box(w * 0.42, 0.16, 0.03), trim, 0, pr.base + 0.36, F, body); for (let i = 0; i < 3; i++) mesh(box(w * 0.4, 0.015, 0.035), chrome, 0, pr.base + 0.3 + i * 0.05, F - 0.005, body);
  for (const s of [-1, 1]) { mesh(box(0.34, 0.11, 0.03), new THREE.MeshBasicMaterial({ color: 0xfff6e0 }), s * w * 0.34, pr.base + 0.42, F, body); glow(body, 0xfff0c8, 1.0, s * w * 0.34, pr.base + 0.42, F - 0.12); mesh(box(0.12, 0.05, 0.02), new THREE.MeshBasicMaterial({ color: 0xffb040 }), s * w * 0.4, pr.base + 0.3, F, body); }
  mesh(box(w * 1.02, 0.14, 0.12), trim, 0, pr.base + 0.08, F + 0.06, body); mesh(box(w * 1.02, 0.14, 0.12), trim, 0, pr.base + 0.08, B - 0.06, body);
  mesh(box(w * 0.9, 0.08, 0.03), new THREE.MeshBasicMaterial({ color: 0xc81818 }), 0, pr.base + 0.47, B, body); for (const s of [-1, 1]) glow(body, 0xff2a2a, 0.6, s * w * 0.36, pr.base + 0.47, B + 0.1);
  mesh(new THREE.PlaneGeometry(0.46, 0.12), M(0xffffff, { map: plateTex }), 0, pr.base + 0.26, B + 0.005, body);
  const fp = mesh(new THREE.PlaneGeometry(0.46, 0.12), M(0xffffff, { map: plateTex }), 0, pr.base + 0.2, F - 0.005, body); fp.rotation.y = Math.PI;
  // sides: door seams, handles, mirrors, sill, wheel arches
  for (const s of [-1, 1]) { const sx = s * (w / 2 + 0.012);
    for (const x of [l * 0.02, kind === 'hatch' ? 99 : l * 0.27]) if (x < 50) mesh(box(0.012, 0.5, 0.012), trim, sx, pr.base + 0.42, x, body);
    for (const x of [-l * 0.08, l * 0.17]) mesh(box(0.02, 0.03, 0.12), chrome, sx + s * 0.01, pr.base + 0.6, x, body);
    const mir = mesh(box(0.12, 0.09, 0.16), paint, s * (w / 2 + 0.08), pr.base + 0.76, l * pr.cabF + 0.25, body); mesh(box(0.02, 0.07, 0.13), P(0x8aa0b8, { shininess: 200 }), s * (w / 2 + 0.14), pr.base + 0.76, l * pr.cabF + 0.25, body);
    mesh(box(0.03, 0.06, l * 0.6), trim, sx, pr.base + 0.06, 0, body);
  }
  const wl = []; for (const [x, z] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) wl.push(wheel(body, x * (w / 2 - 0.07), 0.34, z * l * 0.31));
  blob(g, w * 1.5, l * 1.25);
  return { g, body, wl };
}
function vanMesh(col, stripe) {
  const g = new THREE.Group(); scene.add(g); const body = new THREE.Group(); g.add(body); const w = 2.0, l = 5.0;
  const paint = P(col, { shininess: 110, specular: 0x7a7a7a }), glass = P(0x16202c, { shininess: 200, specular: 0xbfd0e0 }), trim = P(0x161616);
  const s = new THREE.Shape(); s.moveTo(-l / 2, 0.35); s.lineTo(-l / 2 + 0.05, 1.05); s.lineTo(-l / 2 + 0.7, 1.35); s.lineTo(-l / 2 + 1.2, 2.2); s.lineTo(l / 2 - 0.1, 2.25); s.quadraticCurveTo(l / 2, 2.25, l / 2, 2.1); s.lineTo(l / 2, 0.35); s.closePath();
  const geo = new THREE.ExtrudeGeometry(s, { depth: w, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.05, bevelSegments: 2 }); geo.translate(0, 0, -w / 2); geo.rotateY(-Math.PI / 2); mesh(geo, paint, 0, 0, 0, body);
  const ws = mesh(box(w * 0.9, 0.02, 1.0), glass, 0, 1.78, -l / 2 + 0.95, body); ws.rotation.x = Math.atan2(0.85, 0.5);
  for (const sd of [-1, 1]) { for (let i = 0; i < 3; i++) mesh(box(0.02, 0.5, 0.85), glass, sd * (w / 2 + 0.065), 1.65, -0.6 + i * 1.05, body); mesh(box(0.02, 0.04, l * 0.8), trim, sd * (w / 2 + 0.065), 1.05, 0.2, body); }
  if (stripe) for (const sd of [-1, 1]) mesh(box(0.015, 0.18, l * 0.82), P(stripe), sd * (w / 2 + 0.067), 0.95, 0.1, body);
  for (const sd of [-1, 1]) { mesh(box(0.32, 0.14, 0.03), new THREE.MeshBasicMaterial({ color: 0xfff6e0 }), sd * 0.7, 0.8, -l / 2 - 0.06, body); glow(body, 0xfff0c8, 1.1, sd * 0.7, 0.8, -l / 2 - 0.18); mesh(box(0.22, 0.4, 0.03), new THREE.MeshBasicMaterial({ color: 0xc81818 }), sd * 0.8, 1.0, l / 2 + 0.06, body); glow(body, 0xff2a2a, 0.7, sd * 0.8, 1.0, l / 2 + 0.16); }
  mesh(box(w * 1.02, 0.16, 0.14), trim, 0, 0.42, -l / 2 - 0.02, body); mesh(box(w * 1.02, 0.16, 0.14), trim, 0, 0.42, l / 2 + 0.02, body);
  const wl = []; for (const [x, z] of [[-1, -1.6], [1, -1.6], [-1, 1.7], [1, 1.7]]) wl.push(wheel(body, x * (w / 2 - 0.06), 0.36, z, 0.36)); blob(g, w * 1.5, l * 1.25);
  return { g, body, wl };
}
function truckMesh(col) {
  const g = new THREE.Group(); scene.add(g); const body = new THREE.Group(); g.add(body); const paint = P(col, { shininess: 100 }), glass = P(0x16202c, { shininess: 200, specular: 0xbfd0e0 });
  mesh(box(2.3, 2.0, 2.0), paint, 0, 1.55, -3.2, body); const ws = mesh(box(2.1, 0.02, 0.9), glass, 0, 2.15, -4.22, body); ws.rotation.x = Math.PI / 2 - 0.15; mesh(box(2.2, 0.25, 0.05), P(0xc8ccd2, { shininess: 150 }), 0, 1.0, -4.23, body);
  mesh(box(2.4, 2.5, 5.6), P(0xd8d0b8), 0, 1.85, 0.7, body); for (let i = 0; i < 8; i++) mesh(box(2.42, 2.4, 0.04), P(0xc0b8a0), 0, 1.85, -1.9 + i * 0.75, body);
  for (const s of [-1, 1]) { glow(body, 0xfff0c8, 1.2, s * 0.8, 0.95, -4.35); mesh(box(0.25, 0.25, 0.03), new THREE.MeshBasicMaterial({ color: 0xc81818 }), s * 1.0, 0.8, 3.52, body); glow(body, 0xff2a2a, 0.9, s * 1.0, 0.8, 3.6); }
  const wl = []; for (const z of [-3.1, 1.6, 2.8]) for (const s of [-1, 1]) wl.push(wheel(body, s * 1.08, 0.46, z, 0.46, 0.3)); blob(g, 3.4, 8.5);
  return { g, body, wl };
}
function microbus() { return vanMesh(0xf0f0f0, 0x2f6fd8); }
// =====================================================================
// لعبة اتعملت بالغلط — the history of Rockstar Games and GTA. Documentary (narrator Schedar), Hamada + Ibrahim pop in on a frozen frame.
// NX1 hook | NX2 Dundee 1988 | NX3 Race'n'Chase 1995 | NX4 the police bug | NX5 you are the thief | NX6 GTA 1997 | POP Hamada + Ibrahim
// NX7 Rockstar NY 1998 | NX8 3D city 2001 | NX9 $1bn in 3 days 2013 | NX10 GTA VI 19 Nov 2026 | Hamada CTA at home
// All visuals are generic/original (no logos, no game characters).
// =====================================================================
const SL = LINES.filter(l => l.s === 'son'); const SX2 = (i) => SL[i - 1];
const POP = [SX2(1).t0 - 0.55, DX(1).t1 + 0.45];
const T_HOME = SX2(2).t0 - 0.3;
const sceneAt = (t) => t < NX(2).t0 - 0.2 ? 'hook' : t < NX(3).t0 - 0.2 ? 'dundee' : t < NX(4).t0 - 0.2 ? 'dev' : t < NX(5).t0 - 0.2 ? 'bug' : t < NX(6).t0 - 0.2 ? 'flip' : t < NX(7).t0 - 0.2 ? 'box' : t < NX(8).t0 - 0.2 ? 'ny' : t < NX(9).t0 - 0.2 ? 'city3d' : t < NX(10).t0 - 0.2 ? 'billion' : t < T_HOME ? 'vi' : 'home';
// ---------- an office (x = 2200): Dundee 1988 / dev room 1995 ----------
const OFX = 2200; const office = new THREE.Group(); office.position.x = OFX; scene.add(office);
const plank = canvasTex(32, 32, (g) => { g.fillStyle = '#6a5a4a'; g.fillRect(0, 0, 32, 32); g.fillStyle = '#5a4a3a'; for (let y = 0; y < 32; y += 4) g.fillRect(0, y, 32, 1); }); plank.wrapS = plank.wrapT = THREE.RepeatWrapping; plank.repeat.set(4, 4);
mesh(new THREE.PlaneGeometry(10, 10), M(0xffffff, { map: plank }), 0, 0, 0, office).rotation.x = -Math.PI / 2;
for (const [x, z, ry] of [[0, -3, 0], [-4, 0, Math.PI / 2], [4, 0, -Math.PI / 2]]) { const w = mesh(new THREE.PlaneGeometry(10, 3.2), M(0xb8b0a0), x, 1.6, z, office); w.rotation.y = ry; }
mesh(new THREE.PlaneGeometry(1.6, 1.0), new THREE.MeshBasicMaterial({ color: 0x8a96a8 }), 2.2, 1.8, -2.98, office); // window: grey Scottish sky
const desk = new THREE.Group(); desk.position.set(0, 0, -1.6); office.add(desk); mesh(box(2.4, 0.08, 1.0), P(0x7a5a3a), 0, 0.78, 0, desk); for (const [x, z] of [[-1.1, -0.4], [1.1, -0.4], [-1.1, 0.4], [1.1, 0.4]]) mesh(box(0.06, 0.78, 0.06), P(0x5a3a22), x, 0.39, z, desk);
const crt = new THREE.Group(); crt.position.set(0, 0.82, -0.15); desk.add(crt); mesh(box(0.75, 0.62, 0.6), P(0xd8d0c0), 0, 0.31, 0, crt); mesh(box(0.8, 0.08, 0.5), P(0xc8c0b0), 0, -0.02, 0.2, crt);
const screenT = canvasTex(160, 128, () => {}); const screen = mesh(new THREE.PlaneGeometry(0.6, 0.46), new THREE.MeshBasicMaterial({ map: screenT }), 0, 0.33, 0.301, crt);
mesh(box(0.6, 0.03, 0.2), P(0xd8d0c0), 0, 0.02, 0.45, crt); // keyboard
const screenLight = new THREE.PointLight(0x9fd0ff, 0, 3, 1.5); scene.add(screenLight);
function drawScreen(t, mode) { const g = screenT.image.getContext('2d'); g.fillStyle = '#04140a'; g.fillRect(0, 0, 160, 128);
  if (mode === 'error') { g.fillStyle = Math.floor(t * 4) % 2 ? '#ff3a2a' : '#801010'; g.font = '16px PS2P'; g.textAlign = 'center'; g.fillText('ERROR', 80, 60); g.font = '8px PS2P'; g.fillStyle = '#3df05a'; g.fillText('BUG FOUND', 80, 84); }
  else if (mode === 'code') { g.fillStyle = '#3df05a'; g.font = '8px PS2P'; for (let i = 0; i < 12; i++) g.fillRect(8, 6 + i * 10, 20 + ((i * 37 + Math.floor(t * 3)) % 110), 3); }
  else { g.fillStyle = '#2a2a2a'; g.fillRect(0, 0, 160, 128); g.fillStyle = '#4a4a4a'; for (let i = 0; i < 4; i++) { g.fillRect(0, 20 + i * 30, 160, 10); g.fillRect(20 + i * 40, 0, 10, 128); }
    const k = (t * 0.25) % 1; const cx = 25 + k * 120, cy = 25; g.fillStyle = '#ff3a2a'; g.fillRect(cx, cy - 3, 8, 5); g.fillStyle = '#ffffff'; g.fillRect(cx - 20, cy - 3, 8, 5); g.fillStyle = Math.floor(t * 6) % 2 ? '#2a6aff' : '#ff2a2a'; g.fillRect(cx - 18, cy - 5, 4, 2); }
  screenT.needsUpdate = true; }
const dev = makePerson(scene, { seed: 3, coat: 0x4a5a7a, legs: 0x2a2a3a, hat: (h, t2, reg) => { const hair = reg(M(0x3a2414)); mesh(new THREE.SphereGeometry(0.285, 8, 5, 0, Math.PI * 2, 0, Math.PI * 0.5), hair, 0, 0.03, -0.02, h); } });
const chair = new THREE.Group(); scene.add(chair); mesh(box(0.5, 0.06, 0.5), P(0x2a2a2a), 0, 0.48, 0, chair); mesh(box(0.5, 0.6, 0.06), P(0x2a2a2a), 0, 0.8, 0.25, chair); mesh(cyl(0.04, 0.04, 0.48, 6), P(0x555555), 0, 0.24, 0, chair);
// Dundee street outside (x = 2400)
const DX0 = 2400; const dundee = new THREE.Group(); dundee.position.x = DX0; scene.add(dundee);
{ mesh(new THREE.PlaneGeometry(80, 80), M(0x5a5a5e), 0, 0, 0, dundee).rotation.x = -Math.PI / 2; mesh(new THREE.PlaneGeometry(80, 4), M(0x8a8a86), 0, 0.01, 5, dundee).rotation.x = -Math.PI / 2;
  for (let i = 0; i < 8; i++) { const x = -21 + i * 6; mesh(box(5.8, 9 + (i % 3), 5), P([0x8a7a6a, 0x9a8a78, 0x7a6a5a][i % 3]), x, 4.5, -2, dundee); for (let f = 0; f < 3; f++) for (const dx of [-1.6, 0, 1.6]) mesh(new THREE.PlaneGeometry(0.8, 1.2), new THREE.MeshBasicMaterial({ color: f === 0 && dx === 0 ? 0xffd890 : 0x3a4250 }), x + dx, 1.6 + f * 2.8, 0.51, dundee); }
  const signT = canvasTex(256, 48, (g) => { g.fillStyle = '#1a2a4a'; g.fillRect(0, 0, 256, 48); g.fillStyle = '#f0e0a0'; g.font = '22px PS2P'; g.textAlign = 'center'; g.fillText('DMA DESIGN', 128, 32); }); mesh(new THREE.PlaneGeometry(3.2, 0.6), new THREE.MeshBasicMaterial({ map: signT }), -3, 3.2, 0.52, dundee); }
// ---------- the top-down mini city where the bug happens (x = 2800) ----------
const TX = 2800; const tcity = new THREE.Group(); tcity.position.x = TX; scene.add(tcity);
{ mesh(new THREE.PlaneGeometry(120, 120), M(0x3a3a3e), 0, 0, 0, tcity).rotation.x = -Math.PI / 2; const r = rng(17);
  for (let i = -3; i <= 3; i++) for (let j = -3; j <= 3; j++) { if ((i === -1 || i === 0) && (j === -1 || j === 0)) continue; const h = 3 + r() * 9; mesh(box(9, h, 9), P([0x8a8478, 0x6a7080, 0x9a8a70, 0x7a6a6a][(i + j + 9) % 4]), i * 15 + 7.5, h / 2, j * 15 + 7.5, tcity); mesh(box(9.2, 0.15, 9.2), P(0x555555), i * 15 + 7.5, h, j * 15 + 7.5, tcity); }
  for (let i = -4; i <= 4; i++) { mesh(new THREE.PlaneGeometry(0.2, 120), M(0xd8d0a0), i * 15, 0.02, 0, tcity).rotation.x = -Math.PI / 2; } }
function policeCar() { const c = carMesh(0xf0f0f0); mesh(box(1.82, 0.22, 2.2), P(0x1a1a1a), 0, 0.66, 0, c.body); const bar = new THREE.Group(); bar.position.set(0, 1.42, 0.2); c.body.add(bar); const lb = mesh(box(0.5, 0.12, 0.25), new THREE.MeshBasicMaterial({ color: 0x2a6aff }), -0.28, 0, 0, bar), lr = mesh(box(0.5, 0.12, 0.25), new THREE.MeshBasicMaterial({ color: 0xff2a2a }), 0.28, 0, 0, bar); c.lb = lb; c.lr = lr; return c; }
const cops = [0, 1, 2, 3].map(() => policeCar()); const civ = [0x2a6ad8, 0xd8a020, 0x3a8a4a, 0x8a2a8a, 0xd86a2a].map(c => carMesh(c)); const hero = carMesh(0xd8231b);
// ---------- New York at night (x = 3300) and a big 3D street city (x = 3800) ----------
const NYX = 3300; const nyc = new THREE.Group(); nyc.position.x = NYX; scene.add(nyc);
{ const r = rng(21); mesh(new THREE.PlaneGeometry(400, 400), M(0x1a1a22), 0, 0, 0, nyc).rotation.x = -Math.PI / 2;
  for (let i = 0; i < 70; i++) { const x = -120 + (i % 14) * 18 + r() * 4, z = -40 - Math.floor(i / 14) * 22, h = 20 + r() * 70; mesh(box(12, h, 12), P(0x2a2e3a), x, h / 2, z, nyc); for (let w = 0; w < 10; w++) mesh(new THREE.PlaneGeometry(1.2, 1.6), new THREE.MeshBasicMaterial({ color: r() > 0.45 ? 0xffd890 : 0x3a4250 }), x - 4 + r() * 8, 4 + r() * (h - 6), z + 6.01, nyc); }
  mesh(box(18, 50, 14), P(0x3a3e4a), 0, 25, -10, nyc); for (let f = 0; f < 10; f++) for (let w = 0; w < 5; w++) mesh(new THREE.PlaneGeometry(2.2, 2.6), new THREE.MeshBasicMaterial({ color: f === 6 && w === 2 ? 0xfff0b0 : (f + w) % 3 ? 0x3a4250 : 0xd8c088 }), -6.6 + w * 3.3, 6 + f * 4.4, -2.98, nyc); }
const CX3 = 3800; const city = new THREE.Group(); city.position.x = CX3; scene.add(city);
{ const r = rng(33); mesh(new THREE.PlaneGeometry(400, 400), M(0x3a3a40), 0, 0, 0, city).rotation.x = -Math.PI / 2; mesh(new THREE.PlaneGeometry(12, 400), M(0x2a2a30), 0, 0.01, 0, city).rotation.x = -Math.PI / 2;
  for (const s of [-1, 1]) { mesh(new THREE.PlaneGeometry(4, 400), M(0x8a8a86), s * 8, 0.12, 0, city).rotation.x = -Math.PI / 2; for (let i = 0; i < 26; i++) { const z = 150 - i * 12, h = 10 + r() * 40; mesh(box(10, h, 10), P([0x8a7a6a, 0x6a7a8a, 0xb8a888, 0x7a8a7a][i % 4]), s * 16, h / 2, z, city); for (let w = 0; w < 8; w++) mesh(new THREE.PlaneGeometry(1.2, 1.6), new THREE.MeshBasicMaterial({ color: 0x2a3a4a }), s * 10.99, 2 + w * 4 % h, z - 3 + (w % 3) * 3, city).rotation.y = -s * Math.PI / 2; mesh(cyl(0.08, 0.1, 5, 6), P(0x555555), s * 6.5, 2.5, z, city); mesh(box(1.2, 0.12, 0.3), new THREE.MeshBasicMaterial({ color: 0xffe0a0 }), s * 6, 5, z, city); } }
  mesh(new THREE.PlaneGeometry(0.15, 400), M(0xe8d890), 0, 0.02, 0, city).rotation.x = -Math.PI / 2; }
const traffic3 = [0x2a6ad8, 0xd8a020, 0xf0f0f0, 0x3a3a3a, 0x8a2a2a, 0x3a8a4a].map((c, i) => ({ c: carMesh(c), x: i % 2 ? 2.8 : -2.8, z0: 120 - i * 25, dir: i % 2 ? -1 : 1 }));
// ---------- the 2026 coastal city at dusk with palm trees (x = 4300) ----------
const VX = 4300; const coast = new THREE.Group(); coast.position.x = VX; scene.add(coast);
{ const r = rng(44); mesh(new THREE.PlaneGeometry(400, 400), M(0xe8d0a0), 0, 0, 0, coast).rotation.x = -Math.PI / 2; const sea2 = mesh(new THREE.PlaneGeometry(400, 200), new THREE.MeshPhongMaterial({ color: 0x2a8ab8, shininess: 80 }), 0, 0.05, 110, coast); sea2.rotation.x = -Math.PI / 2;
  mesh(new THREE.PlaneGeometry(400, 10), M(0x3a3a40), 0, 0.03, -4, coast).rotation.x = -Math.PI / 2;
  for (let i = 0; i < 14; i++) { const x = -90 + i * 14, h = 18 + r() * 45; mesh(box(11, h, 11), P([0xf0e0d0, 0xe8c8d8, 0xd0e8e8, 0xf0d8b0][i % 4]), x, h / 2, -24, coast); for (let w = 0; w < 6; w++) mesh(new THREE.PlaneGeometry(9, 0.6), new THREE.MeshBasicMaterial({ color: [0xff5ab8, 0x5affd8, 0xffb05a][(i + w) % 3] }), x, 4 + w * (h / 7), -18.49, coast); }
  for (let i = 0; i < 16; i++) { const pg = new THREE.Group(); pg.position.set(-80 + i * 11, 0, 4 + (i % 2) * 3); coast.add(pg); const tr = mesh(cyl(0.25, 0.35, 8, 6), P(0x8a6a44), 0, 4, 0, pg); tr.rotation.z = 0.08; for (let l = 0; l < 6; l++) { const lf = mesh(box(0.4, 0.1, 3.6), P(0x2a7a3a), Math.cos(l) * 1.4, 8.1, Math.sin(l) * 1.4, pg); lf.rotation.y = -l; lf.rotation.x = 0.35; } } }
const viCars = [0xff5ab8, 0xf0f0f0, 0x2a2a2a, 0x5affd8].map((c, i) => ({ c: carMesh(c), z: i % 2 ? -2.5 : -5.5, x0: -80 + i * 30, dir: i % 2 ? 1 : -1 }));
// ---------- the game box on a shop shelf (in the office, 1997) ----------
const boxT = canvasTex(128, 160, (g) => {}); function drawBox() { const g = boxT.image.getContext('2d'); const gr = g.createLinearGradient(0, 0, 0, 160); gr.addColorStop(0, '#1a1a1a'); gr.addColorStop(1, '#3a3a3a'); g.fillStyle = gr; g.fillRect(0, 0, 128, 160); g.fillStyle = '#ffd400'; g.fillRect(0, 0, 128, 6); g.fillStyle = '#fff'; g.font = '13px PS2P'; g.textAlign = 'center'; g.fillText('GRAND', 64, 42); g.fillText('THEFT', 64, 62); g.fillText('AUTO', 64, 82); g.fillStyle = '#ff3a2a'; g.fillRect(24, 100, 80, 30); g.fillStyle = '#fff'; g.font = '10px PS2P'; g.fillText('1997', 64, 120); g.fillStyle = '#ffd400'; g.font = '6px PS2P'; g.fillText('PC CD-ROM', 64, 150); boxT.needsUpdate = true; }
const gbox = new THREE.Group(); scene.add(gbox); mesh(box(0.8, 1.0, 0.18), P(0x222222), 0, 0, 0, gbox); mesh(new THREE.PlaneGeometry(0.78, 0.98), new THREE.MeshBasicMaterial({ map: boxT }), 0, 0, 0.091, gbox);
const shelf = new THREE.Group(); scene.add(shelf); mesh(box(3, 0.06, 0.6), P(0x8a6a44), 0, 0, 0, shelf); for (let i = 0; i < 6; i++) { if (i === 3) continue; const b = mesh(box(0.42, 0.55, 0.1), P([0x2a4a8a, 0x8a2a2a, 0x3a6a3a, 0x6a4a8a, 0x8a6a2a, 0x2a6a8a][i]), -1.2 + i * 0.48, 0.3, 0, shelf); }
// Hamada's controller for the pop-in + home
const pad = new THREE.Group(); son.arms[1].hand.add(pad); mesh(box(0.28, 0.06, 0.16), P(0x1a1a1e), 0.1, 0.05, 0.1, pad); for (const s of [-1, 1]) mesh(cyl(0.035, 0.035, 0.03, 8), P(0x4a4a4e), 0.1 + s * 0.08, 0.09, 0.08, pad); pad.visible = false;
const moneyPool = spritePool(canvasTex(32, 16, (g) => { g.fillStyle = '#3a8a3a'; g.fillRect(0, 0, 32, 16); g.fillStyle = '#9ad89a'; g.fillRect(2, 2, 28, 12); g.fillStyle = '#3a8a3a'; g.font = '10px PS2P'; g.fillText('$', 12, 12); }), 40);
function stateAt(t) {
  const S = sceneAt(t);
  room.visible = S === 'home'; balcony.visible = kitchen.visible = hallway.visible = false; dad.root.visible = false; son.root.visible = S === 'home'; pad.visible = S === 'home';
  office.visible = S === 'hook' || S === 'dundee' || S === 'dev' || S === 'box'; dundee.visible = S === 'dundee'; tcity.visible = S === 'bug' || S === 'flip'; nyc.visible = S === 'ny'; city.visible = S === 'city3d' || S === 'billion'; coast.visible = S === 'vi';
  gbox.visible = shelf.visible = S === 'box'; dev.root.visible = chair.visible = S === 'dundee' || S === 'dev';
  cops.forEach(c => c.g.visible = S === 'bug' || S === 'flip'); civ.forEach(c => c.g.visible = S === 'bug' || S === 'flip'); hero.g.visible = S === 'flip';
  traffic3.forEach(v => v.c.g.visible = S === 'city3d' || S === 'billion'); viCars.forEach(v => v.c.g.visible = S === 'vi');
  drawScreen(t, S === 'hook' ? 'error' : S === 'dundee' ? 'code' : 'race');
  if (S === 'dundee' || S === 'dev') { chair.position.set(OFX, 0, -0.85); dev.root.position.set(OFX, 0, -0.95); dev.root.rotation.set(0, Math.PI, 0); const ty = Math.sin(t * 14) * 0.15; applyPose(dev, { ...POSE0, y: -0.36, lL: 1.45, lR: 1.45, aLx: 1.3 + ty, aRx: 1.3 - ty, eL: 0.8, eR: 0.8, hx: 0.1 }); setFace(dev, 'flat', 'flat', {}); }
  // top-down chaos: cops ram everything (bug) / chase the red car (flip)
  if (S === 'bug' || S === 'flip') { cops.forEach((c, i) => { const ph = t * (S === 'bug' ? 0.6 : 0.45) + i * 1.6; let x, z, yaw; if (S === 'bug') { x = Math.sin(ph * 1.3 + i) * 12; z = Math.cos(ph * 0.9 + i * 2) * 12; yaw = Math.atan2(Math.cos(ph * 1.3 + i) * 1.3, -Math.sin(ph * 0.9 + i * 2) * 0.9) + Math.PI; }
      else { const hk = (t * 0.35) % 1; const hx = -45 + hk * 90; x = hx - 6 - i * 4.5; z = 0 + (i % 2 ? 1.2 : -1.2); yaw = -Math.PI / 2; }
      c.g.position.set(TX + x, 0, z); c.g.rotation.set(0, yaw, Math.sin(t * 9 + i) * (S === 'bug' ? 0.08 : 0)); const fl = Math.floor(t * 6 + i) % 2; c.lb.material.color.setHex(fl ? 0x2a6aff : 0x0a1a44); c.lr.material.color.setHex(fl ? 0x440a0a : 0xff2a2a); });
    civ.forEach((c, i) => { const hit = S === 'bug' && Math.sin(t * 2 + i * 1.7) > 0.7; c.g.position.set(TX - 20 + i * 9, hit ? 0.3 : 0, (i % 2 ? 7.5 : -7.5)); c.g.rotation.set(hit ? 0.3 : 0, i * 0.7 + (hit ? t * 4 : 0), hit ? 0.2 : 0); });
    if (S === 'flip') { const hk = (t * 0.35) % 1; hero.g.position.set(TX - 45 + hk * 90, 0, 0); hero.g.rotation.set(0, -Math.PI / 2, 0); } }
  if (S === 'box') { shelf.position.set(OFX, 1.2, -2.6); gbox.position.set(OFX + 0.24, 1.75, -2.5); gbox.rotation.set(0, Math.sin(t * 0.8) * 0.4, 0); }
  if (S === 'city3d' || S === 'billion') traffic3.forEach((v) => { const z = ((v.z0 - v.dir * t * 12) % 300 + 300) % 300 - 150; v.c.g.position.set(CX3 + v.x, 0, z); v.c.g.rotation.set(0, v.dir > 0 ? Math.PI : 0, 0); if (v.c.wl) v.c.wl.forEach(w => w.rotation.x = t * 30 * v.dir); });
  if (S === 'vi') viCars.forEach(v => { const x = ((v.x0 + v.dir * t * 10) % 200 + 200) % 200 - 100; v.c.g.position.set(VX + x, 0, v.z); v.c.g.rotation.set(0, v.dir > 0 ? -Math.PI / 2 : Math.PI / 2, 0); });
  screenLight.position.set(OFX, 1.4, -1.2); screenLight.intensity = office.visible && S !== 'box' ? 1.6 : 0;
  if (S === 'home') { son.root.position.set(-0.6, 0, -1.3); son.root.rotation.set(0, 0.2, 0); applyPose(son, talkPose({ ...POSE0, aRx: 1.1, eR: 0.9, aLx: 1.1, eL: 0.9 }, t, 'son', 0.3)); setFace(son, 'sparkle', talkMouth(t, 'son', 'grin') || 'grin', {}); homeLight(); tvLight.intensity = 3; tvLight.color.setHex(0xff8ad8); return; }
  if (S === 'hook' || S === 'box') fixedLight(V(OFX, 0, 0), 0x6a7080, 0x202020, 0.45, 0xffffff, 0.3, 0x050505, null);
  else if (S === 'dundee') fixedLight(V(OFX, 0, 0), 0xb8c0c8, 0x403830, 0.75, 0xd8dce0, 0.5, 0x8a96a8, null);
  else if (S === 'dev') fixedLight(V(OFX, 0, 0), 0x8a90a0, 0x302820, 0.6, 0xd8dce0, 0.4, 0x202530, null);
  else if (S === 'bug' || S === 'flip') fixedLight(V(TX, 0, 0), 0xd8e0e8, 0x404040, 0.9, 0xffffff, 0.9, 0x6a7a8a, null);
  else if (S === 'ny') fixedLight(V(NYX, 0, 0), 0x4a5a80, 0x101018, 0.6, 0x8a9ac0, 0.35, 0x0a1020, 0x0a1020, 80, 400);
  else if (S === 'city3d') fixedLight(V(CX3, 0, 0), 0xcfe0f0, 0x504840, 0.85, 0xfff4e0, 1.0, 0x9fc0e0, 0xb0c8e0, 60, 300);
  else if (S === 'billion') fixedLight(V(CX3, 0, 0), 0xffc890, 0x504030, 0.8, 0xffa060, 1.0, 0xe8a070, 0xd8a080, 60, 300);
  else fixedLight(V(VX, 0, 0), 0xffb8d8, 0x504060, 0.85, 0xff9a60, 1.0, 0xe878a8, 0xe090b0, 80, 400);
}
function shotAt(t) {
  const S = sceneAt(t);
  if (S === 'hook') { const k = easeInOut(seg(t, 0, NX(2).t0)); cam(V(OFX + 0.15, 1.18, -1.0 - 0.45 * k), V(OFX, 1.15, -1.75), 52 - 10 * k); return; }
  if (S === 'dundee') { if (t < NX(2).t0 + 3) { const k = easeInOut(seg(t, NX(2).t0 - 0.2, NX(2).t0 + 3)); cam(V(DX0 + 6 - 3 * k, 2.2 + k, 14 - 4 * k), V(DX0 - 3, 3, 0), 55); return; } cam(V(OFX + 1.6, 1.7, 0.6), V(OFX, 1.1, -1.4), 55); return; }
  if (S === 'dev') { const k = easeInOut(seg(t, NX(3).t0 - 0.2, NX(4).t0)); cam(V(OFX + 0.95 - 0.55 * k, 1.4 - 0.15 * k, -0.95 - 0.25 * k), V(OFX, 1.15, -1.45), 50 - 16 * k); return; }
  if (S === 'bug') { cam(V(TX + 0.1, 34, 22), V(TX, 0, 0), 52); return; }
  if (S === 'flip') { const hp = hero.g.position; cam(V(hp.x - 10, 30, 14), hp.clone().add(V(-6, 0, 0)), 50); return; }
  if (S === 'box') { const k = easeInOut(seg(t, NX(6).t0 - 0.2, NX(7).t0)); cam(V(OFX + 0.24 + 0.6 * (1 - k), 1.8, -1.2 + 0.2 * k), V(OFX + 0.24, 1.75, -2.5), 50); return; }
  if (S === 'ny') { const k = easeInOut(seg(t, NX(7).t0 - 0.2, NX(8).t0)); cam(V(NYX + 40 - 30 * k, 12 + 20 * k, 90 - 50 * k), V(NYX, 32, -3), 55); return; }
  if (S === 'city3d') { const v = traffic3[0].c.g.position; cam(v.clone().add(V(3.5, 3.2, 10)), v.clone().add(V(0, 1.2, -6)), 58); return; }
  if (S === 'billion') { const k = easeInOut(seg(t, NX(9).t0 - 0.2, NX(10).t0)); cam(V(CX3 + 4, 3 + 40 * k, 60 - 20 * k), V(CX3, 10 + 10 * k, -40), 58); return; }
  if (S === 'vi') { const k = easeInOut(seg(t, NX(10).t0 - 0.2, T_HOME)); cam(V(VX + 30 - 50 * k, 6 + 8 * k, 30), V(VX - 10 * k, 8, -10), 55); return; }
  faceCam(son, 1.6 - 0.2 * seg(t, T_HOME, DUR), 0.2, 0.1, 56, 0.3);
}
function particles(t) { const S = sceneAt(t), mo = []; if (S === 'billion') for (let i = 0; i < 40; i++) { const k = (t * 0.25 + hash(i)) % 1; const c = camera.position; mo.push({ pos: V(c.x + (hash(i + 3) - 0.5) * 16, c.y + 8 - k * 18, c.z - 10 - hash(i + 9) * 8), size: 0.8, op: 1, color: 0xffffff, rot: t * 2 + i }); }
  emit(mo, moneyPool); emit([], starPool); emit([], puffPool); emit([], trailPool); emit([], sweatPool); }
function drawBillion(g, t) { if (sceneAt(t) !== 'billion') return; const k = easeOut(seg(t, NX(9).t0 + 0.8, NX(9).t1 - 1.0)); const n = Math.floor(1e9 * k); g.save(); g.fillStyle = 'rgba(0,0,0,0.6)'; g.fillRect(30, 230, W - 60, 110); pxText(g, '$' + n.toLocaleString('en-US'), W / 2, 248, 20, '#3df05a', 'center'); arText(g, 'في ٣ أيام بس', W / 2, 286, 30, '#ffd890', 'center'); g.restore(); }
window.renderFrame = function (t) {
  const pop = t >= POP[0] && t < POP[1]; const ts = pop ? POP[0] : t;
  stateAt(ts); shotAt(ts); aimShadow(); particles(ts);
  if (pop) { son.root.visible = false; dad.root.visible = false; renderer.render(scene, camera);
    placeInFront(son, t, POP[0], POP[1], -0.3); pad.visible = true; applyPose(son, talkPose({ ...POSE0, aRx: 1.2, eR: 1.0, aLz: 1.6 + Math.sin(t * 6) * 0.2, eL: 0.4 }, t, 'son', 0.35)); setFace(son, 'wide', talkMouth(t, 'son', 'scream') || 'o', {});
    const list = [son]; if (t > DX(1).t0 - 0.35) { placeInFront(dad, t, DX(1).t0 - 0.35, POP[1], 0.6, 2.9); applyPose(dad, talkPose({ ...POSE0, aRx: 1.0, eR: 1.6, aRz: 0.3, aLx: 1.0, eL: 1.6, hx: -0.1 }, t, 'dad', 0.3)); setFace(dad, 'smug', talkMouth(t, 'dad', 'grin') || 'smile', { stache: true }); list.push(dad); }
    renderOverlay(list); pad.visible = false;
  } else renderer.render(scene, camera);
  ctx.clearRect(0, 0, W, H); ctx.drawImage(glCanvas, 0, 0);
  h.clearRect(0, 0, W, H);
  if (pop) drawPause(h);
  if (sceneAt(t) === 'home' || pop) drawDialogueV(h, t); else drawSub(h, t);
  drawTitleCard(h, t, NX(1).t1 + 0.6, 'لعبة اتعملت بالغلط', 'قصة روكستار و GTA');
  drawTags(h, t, [[NX(2).t0 - 0.2, 'داندي، اسكتلندا ١٩٨٨', 'DUNDEE, SCOTLAND 1988'], [NX(3).t0 - 0.2, '١٩٩٥', "RACE 'N' CHASE"], [NX(5).t0 - 0.2, 'إنت الحرامي!', 'YOU ARE THE CRIMINAL'], [NX(6).t0 - 0.2, '١٩٩٧', 'GRAND THEFT AUTO'], [NX(7).t0 - 0.2, 'نيويورك ١٩٩٨', 'ROCKSTAR GAMES'], [NX(8).t0 - 0.2, '٢٠٠١', 'FIRST TIME IN 3D'], [NX(9).t0 - 0.2, '٢٠١٣', 'GTA V'], [NX(10).t0 - 0.2, '١٩ نوفمبر ٢٠٢٦', 'GTA VI']]);
  drawBillion(h, t);
  drawCTAbox(h, t, SX2(2).t0, 'أحلى جزء عندك إيه؟ 🎮', 'اكتب في الكومنتات');
  ctx.drawImage(hud, 0, 0); vignette(ctx, 0.35);
  if (t > DUR - 0.8) { ctx.fillStyle = `rgba(0,0,0,${clamp((t - DUR + 0.8) / 0.8)})`; ctx.fillRect(0, 0, W, H); }
  return true;
};
window.frameData = () => out.toDataURL('image/png');
window.DUR = DUR;
document.fonts.load('10px PS2P').then(() => document.fonts.load('20px Lalezar', 'ع')).then(() => document.fonts.load('700 20px ReemKufi', 'ع')).then(() => { drawBox(); enableShadows(); window.READY = true; });
