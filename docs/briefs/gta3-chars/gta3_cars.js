// ===== GTA3-era style cars (glossy vertex-lit body with a fake sky reflection, dark tinted glass, alloy wheels, textured lamps) =====
// makeGtaCar(parent, opts) → { g, body, wheels, glass, btn, seats, late }. Front is +x, driver on -z (like makeSamirCar).
// opts: { color, roof, style: 'modern' | '128', scale, interior, plate }
const GTA_ENV = (() => {
  const face = (top) => { const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d');
    const gr = g.createLinearGradient(0, 0, 0, 64);
    if (top === 'up') { gr.addColorStop(0, '#dfeeff'); gr.addColorStop(1, '#ffffff'); } else if (top === 'down') { gr.addColorStop(0, '#3a3530'); gr.addColorStop(1, '#2a2622'); }
    else { gr.addColorStop(0, '#cfe4ff'); gr.addColorStop(0.48, '#f4f4f0'); gr.addColorStop(0.52, '#5a554e'); gr.addColorStop(1, '#2e2a26'); }
    g.fillStyle = gr; g.fillRect(0, 0, 64, 64); return c; };
  const s = face('side'); const t = new THREE.CubeTexture([s, s, face('up'), face('down'), s, s]); t.needsUpdate = true; t.colorSpace = THREE.SRGBColorSpace; return t;
})();
const gtaPaint = (color) => new THREE.MeshPhongMaterial({ color, shininess: 90, specular: 0x777777, envMap: GTA_ENV, reflectivity: 0.28, combine: THREE.MixOperation });
const gtaChrome = () => new THREE.MeshPhongMaterial({ color: 0xd8dadc, shininess: 140, specular: 0xffffff, envMap: GTA_ENV, reflectivity: 0.75, combine: THREE.MixOperation });
const gtaGlass = () => new THREE.MeshPhongMaterial({ color: 0x0d1418, shininess: 160, specular: 0xffffff, envMap: GTA_ENV, reflectivity: 0.45, combine: THREE.MixOperation, transparent: true, opacity: 0.88 });
const gtaRubber = () => new THREE.MeshLambertMaterial({ color: 0x1b1b1d });
function gtaCanvas(w, h, draw) { const t = canvasTex(w, h, draw); t.magFilter = THREE.LinearFilter; t.minFilter = THREE.LinearFilter; return t; }
const gtaRimTex = gtaCanvas(64, 64, (g) => {
  g.fillStyle = '#1b1b1d'; g.fillRect(0, 0, 64, 64);
  const gr = g.createRadialGradient(28, 26, 2, 32, 32, 26); gr.addColorStop(0, '#f2f4f6'); gr.addColorStop(1, '#8e9296'); g.fillStyle = gr; g.beginPath(); g.arc(32, 32, 25, 0, 7); g.fill();
  g.fillStyle = '#2a2c2e'; for (let i = 0; i < 5; i++) { g.save(); g.translate(32, 32); g.rotate(i * Math.PI * 0.4 + 0.3); g.beginPath(); g.moveTo(-4, -8); g.lineTo(4, -8); g.lineTo(7, -21); g.lineTo(-7, -21); g.fill(); g.restore(); }
  g.fillStyle = '#c8ccd0'; g.beginPath(); g.arc(32, 32, 6, 0, 7); g.fill(); g.fillStyle = '#555'; g.beginPath(); g.arc(32, 32, 2, 0, 7); g.fill();
  g.strokeStyle = '#5a5e62'; g.lineWidth = 1.5; g.beginPath(); g.arc(32, 32, 24.5, 0, 7); g.stroke();
});
const gtaSteelRimTex = gtaCanvas(64, 64, (g) => { // 1980s whitewall + chrome hubcap for the 128
  g.fillStyle = '#1b1b1d'; g.fillRect(0, 0, 64, 64); g.fillStyle = '#eeeae0'; g.beginPath(); g.arc(32, 32, 27, 0, 7); g.fill();
  g.fillStyle = '#1b1b1d'; g.beginPath(); g.arc(32, 32, 21, 0, 7); g.fill();
  const gr = g.createRadialGradient(28, 27, 1, 32, 32, 16); gr.addColorStop(0, '#ffffff'); gr.addColorStop(1, '#9aa0a6'); g.fillStyle = gr; g.beginPath(); g.arc(32, 32, 15, 0, 7); g.fill();
  g.strokeStyle = '#6a6e72'; for (let i = 0; i < 12; i++) { g.beginPath(); g.moveTo(32, 32); g.lineTo(32 + Math.cos(i / 12 * 6.28) * 14, 32 + Math.sin(i / 12 * 6.28) * 14); g.stroke(); }
});
const gtaGrilleTex = (round) => gtaCanvas(128, 32, (g) => {
  g.fillStyle = '#16181a'; g.fillRect(0, 0, 128, 32);
  const cx = round ? 64 : 64; g.fillStyle = '#9ea2a6'; for (let y = 3; y < 30; y += 4) g.fillRect(round ? 30 : 36, y, round ? 68 : 56, 2);
  g.fillStyle = '#c9ccd0'; g.fillRect(round ? 29 : 35, 1, round ? 70 : 58, 2); g.fillRect(round ? 29 : 35, 29, round ? 70 : 58, 2);
  const lamp = (x) => { if (round) { const gr = g.createRadialGradient(x - 3, 13, 1, x, 16, 13); gr.addColorStop(0, '#ffffff'); gr.addColorStop(0.5, '#e8eef0'); gr.addColorStop(1, '#8a9094'); g.fillStyle = '#c9ccd0'; g.beginPath(); g.arc(x, 16, 14, 0, 7); g.fill(); g.fillStyle = gr; g.beginPath(); g.arc(x, 16, 11.5, 0, 7); g.fill(); }
    else { const gr = g.createLinearGradient(x - 14, 6, x + 14, 26); gr.addColorStop(0, '#ffffff'); gr.addColorStop(0.6, '#cfd8dc'); gr.addColorStop(1, '#7e868a'); g.fillStyle = '#c9ccd0'; g.fillRect(x - 16, 5, 32, 22); g.fillStyle = gr; g.fillRect(x - 14, 7, 28, 18); g.fillStyle = '#e8a020'; g.fillRect(x + (x < 64 ? -16 : 10), 7, 6, 18); } };
  lamp(14); lamp(114);
});
const gtaTailTex = gtaCanvas(128, 32, (g) => {
  g.fillStyle = '#1a1a1a'; g.fillRect(0, 0, 128, 32);
  for (const x of [2, 90]) { const gr = g.createLinearGradient(0, 4, 0, 28); gr.addColorStop(0, '#ff5a50'); gr.addColorStop(1, '#8a0a0a'); g.fillStyle = gr; g.fillRect(x, 4, 36, 24); g.fillStyle = '#f4f4f4'; g.fillRect(x + (x < 64 ? 26 : 0), 4, 10, 24); g.fillStyle = '#e8a020'; g.fillRect(x + (x < 64 ? 0 : 28), 4, 8, 24); }
});
function gtaPlateTex(txt) { const t = gtaCanvas(96, 32, (g) => { g.fillStyle = '#f2f0e8'; g.fillRect(0, 0, 96, 32); g.fillStyle = '#2a5bd7'; g.fillRect(0, 0, 96, 8); g.strokeStyle = '#222'; g.strokeRect(1, 1, 94, 30); }); t.userData.txt = txt; return t; }

function makeGtaCar(parent, opts = {}) {
  const S = opts.scale || 1; const is128 = opts.style === '128';
  const g = new THREE.Group(); parent.add(g);
  const body = new THREE.Group(); body.scale.setScalar(S); g.add(body);
  const paint = gtaPaint(opts.color ?? (is128 ? 0xd89a2a : 0x3a3d42)), chrome = gtaChrome(), glassM = gtaGlass();
  const Lh = is128 ? 2.05 : 2.2, Wd = is128 ? 0.82 : 0.86, wb = is128 ? 1.25 : 1.32, wr = is128 ? 0.29 : 0.32;
  // lower body: side profile with wheel arches, extruded and bevelled
  const sh = new THREE.Shape();
  const yb = 0.22, yt = is128 ? 0.86 : 0.9;
  sh.moveTo(-Lh, yb + 0.05); sh.lineTo(-wb - wr - 0.06, yb);
  sh.absarc(-wb, yb, wr + 0.06, Math.PI, 0, true);
  sh.lineTo(wb - wr - 0.06, yb); sh.absarc(wb, yb, wr + 0.06, Math.PI, 0, true);
  sh.lineTo(Lh, yb + 0.05); sh.lineTo(Lh + 0.02, is128 ? 0.72 : 0.68); sh.lineTo(Lh - 0.15, yt - (is128 ? 0.02 : 0.06));
  sh.lineTo(is128 ? 0.95 : 0.9, yt); sh.lineTo(-1.1, yt); sh.lineTo(-Lh + 0.12, yt - 0.02); sh.lineTo(-Lh - 0.02, is128 ? 0.72 : 0.74); sh.closePath();
  const lower = new THREE.ExtrudeGeometry(sh, { depth: Wd * 2 - 0.12, bevelEnabled: true, bevelThickness: 0.06, bevelSize: 0.05, bevelSegments: 2, curveSegments: 8 });
  lower.translate(0, 0, -(Wd - 0.06)); lower.computeVertexNormals();
  mesh(lower, paint, 0, 0, 0, body);
  // greenhouse: dark tinted glass block + body-coloured roof and pillars
  const gs = new THREE.Shape();
  const r0 = is128 ? -0.95 : -1.05, r1 = is128 ? 0.75 : 0.62, top = is128 ? 1.38 : 1.4;
  gs.moveTo(r0 - 0.1, yt); gs.lineTo(r0 + (is128 ? 0.12 : 0.38), top); gs.lineTo(r1 - (is128 ? 0.12 : 0.05), top); gs.lineTo(r1 + (is128 ? 0.22 : 0.5), yt); gs.closePath();
  const gh = new THREE.ExtrudeGeometry(gs, { depth: Wd * 2 - 0.3, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.03, bevelSegments: 1 });
  gh.translate(0, 0, -(Wd - 0.15)); const glass = [];
  const ghm = mesh(gh, glassM, 0, 0, 0, body); glass.push(ghm);
  const roofW = Wd * 2 - 0.26;
  const roof = mesh(box((r1 - 0.12) - (r0 + 0.2) + (is128 ? 0.1 : 0), 0.05, roofW), is128 ? gtaPaint(opts.roof ?? 0xf2efe6) : paint, (r0 + r1) / 2 + (is128 ? 0 : 0.05), top + 0.03, 0, body);
  for (const z of [-1, 1]) { // pillars (B pillar + door line)
    mesh(box(0.07, top - yt, 0.03), paint, -0.12, (top + yt) / 2, z * (Wd - 0.13), body);
    mesh(box(0.012, yt - 0.3, 0.01), new THREE.MeshBasicMaterial({ color: 0x15161a }), -0.12, (yt + 0.3) / 2 + 0.02, z * (Wd + 0.002), body);
    mesh(box(0.012, yt - 0.3, 0.01), new THREE.MeshBasicMaterial({ color: 0x15161a }), 0.95, (yt + 0.3) / 2 + 0.02, z * (Wd + 0.002), body);
    mesh(box(0.12, 0.025, 0.02), chrome, 0.62, yt - 0.12, z * (Wd + 0.01), body); mesh(box(0.12, 0.025, 0.02), chrome, -0.5, yt - 0.12, z * (Wd + 0.01), body); // handles
    const mir = mesh(box(0.1, 0.07, 0.1), is128 ? chrome : paint, r1 + 0.28, yt + 0.06, z * (Wd + 0.06), body); mir.rotation.y = z * 0.2;
    if (!is128) mesh(box(Lh * 1.6, 0.05, 0.012), new THREE.MeshPhongMaterial({ color: 0x222428, shininess: 60 }), 0, 0.42, z * (Wd + 0.004), body); // rubbing strip
    else mesh(box(Lh * 1.8, 0.02, 0.012), chrome, 0, 0.6, z * (Wd + 0.004), body);
  }
  // front & rear
  const grille = mesh(new THREE.PlaneGeometry(Wd * 2 - 0.08, 0.27), new THREE.MeshPhongMaterial({ map: gtaGrilleTex(is128), shininess: 80, specular: 0x666666 }), Lh + 0.081, is128 ? 0.6 : 0.58, 0, body); grille.rotation.y = Math.PI / 2;
  const tail = mesh(new THREE.PlaneGeometry(Wd * 2 - 0.08, 0.2), new THREE.MeshPhongMaterial({ map: gtaTailTex, shininess: 80, emissive: 0x220000 }), -Lh - 0.081, 0.66, 0, body); tail.rotation.y = -Math.PI / 2;
  const bumpM = is128 ? chrome : new THREE.MeshPhongMaterial({ color: 0x2a2c30, shininess: 40 });
  for (const sx of [1, -1]) { const b = mesh(new THREE.CapsuleGeometry(0.075, Wd * 2 - 0.12, 4, 8), bumpM, sx * (Lh + 0.1), 0.38, 0, body); b.rotation.x = Math.PI / 2; b.scale.set(1.0, 1, 0.75); }
  const plateTex = gtaPlateTex(opts.plate || 'ق ص ٢٠٠٤');
  for (const sx of [1, -1]) { const p = mesh(new THREE.PlaneGeometry(0.36, 0.12), new THREE.MeshLambertMaterial({ map: plateTex }), sx * (Lh + 0.18), 0.38, 0, body); p.rotation.y = sx * Math.PI / 2; }
  // wheels
  const wheels = [];
  for (const [x, z] of [[wb, 1], [wb, -1], [-wb, 1], [-wb, -1]]) {
    const w = new THREE.Group(); w.position.set(x, wr, z * (Wd - 0.12)); body.add(w);
    mesh(new THREE.CylinderGeometry(wr, wr, 0.22, 16), gtaRubber(), 0, 0, 0, w).rotation.x = Math.PI / 2;
    const rim = mesh(new THREE.CircleGeometry(wr * 0.98, 16), new THREE.MeshPhongMaterial({ map: is128 ? gtaSteelRimTex : gtaRimTex, shininess: 90, specular: 0xaaaaaa }), 0, 0, z * 0.112, w); rim.rotation.y = z > 0 ? 0 : Math.PI;
    wheels.push(w);
  }
  // simple cabin interior (visible through the glass) + the red button for the 128
  let btn = null; const seats = { driver: V(0.15, 0.14, -0.42), front: V(0.15, 0.14, 0.42), back: V(-0.75, 0.14, 0) };
  if (opts.interior !== false) {
    const seatM = new THREE.MeshLambertMaterial({ color: is128 ? 0x6a1a22 : 0x2a2a2e });
    for (const z of [-0.42, 0.42]) { mesh(box(0.5, 0.14, 0.52), seatM, -0.05, 0.42, z, body); const bk = mesh(box(0.12, 0.6, 0.5), seatM, -0.32, 0.72, z, body); bk.rotation.z = 0.15; }
    mesh(box(0.55, 0.16, Wd * 2 - 0.3), seatM, -0.85, 0.42, 0, body); mesh(box(0.14, 0.55, Wd * 2 - 0.3), seatM, -1.12, 0.72, 0, body);
    mesh(box(0.3, 0.26, Wd * 2 - 0.25), new THREE.MeshLambertMaterial({ color: 0x1e1e22 }), 0.72, 0.88, 0, body);
    const wheelS = mesh(new THREE.TorusGeometry(0.17, 0.025, 6, 16), new THREE.MeshLambertMaterial({ color: 0x151515 }), 0.48, 0.98, -0.42, body); wheelS.rotation.y = Math.PI / 2; wheelS.rotation.x = 0.35;
    if (is128) {
      const plate = mesh(box(0.12, 0.02, 0.12), new THREE.MeshBasicMaterial({ map: gtaCanvas(16, 16, (g) => { for (let i = -16; i < 32; i += 4) { g.fillStyle = (i / 4) % 2 ? '#111' : '#f2c010'; g.beginPath(); g.moveTo(i, 0); g.lineTo(i + 4, 0); g.lineTo(i + 20, 16); g.lineTo(i + 16, 16); g.fill(); } }) }), 0.7, 1.02, 0.05, body);
      btn = mesh(new THREE.SphereGeometry(0.04, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshPhongMaterial({ color: 0xff2020, shininess: 120, emissive: 0x440000 }), 0.7, 1.03, 0.05, body);
    }
  }
  const blob = mesh(new THREE.PlaneGeometry(Lh * 2.3, Wd * 2.4), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.45, depthWrite: false }), 0, 0.012, 0, body); blob.rotation.x = -Math.PI / 2;
  const late = () => { const c = plateTex.userData.canvas.getContext('2d'); c.fillStyle = '#111'; c.font = '17px Lalezar'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.direction = 'rtl'; c.fillText(plateTex.userData.txt, 48, 21); plateTex.needsUpdate = true; };
  return { g, body, wheels, glass, btn, seats, late, paint, roof };
}

// ===== image → Hunyuan3D car models. The procedural car stays underneath for interior shots (seats, wheel, red button). =====
// gtaCarModel(carObj, file, { len, rotY }) → normalises the GLB to `len` metres along x (front = +x), wheels on the ground.
// carObj.setExterior(true) shows the model and hides the procedural shell; false shows the procedural car (for in-car close-ups).
function gtaCarModel(C, file, o = {}) {
  let res; GTA_LOADS.push(new Promise(r => res = r));
  C.shell = C.body.children.filter(ch => ch.isMesh || ch.isGroup); // everything procedural (wheels too); interior is re-shown for in-car shots
  new GLTFLoader().load('gta/models/' + file + '.glb', (gl) => {
    gl.scene.updateMatrixWorld(true); let src = null; gl.scene.traverse(m => { if (m.isMesh && !src) src = m; });
    const geo = src.geometry.clone(); geo.applyMatrix4(src.matrixWorld);
    { // align the car's long axis with x (the drawing was a 3/4 view, so the mesh comes out rotated)
      const p = geo.attributes.position; let mx = 0, mz = 0; for (let i = 0; i < p.count; i++) { mx += p.getX(i); mz += p.getZ(i); } mx /= p.count; mz /= p.count;
      let cxx = 0, czz = 0, cxz = 0; for (let i = 0; i < p.count; i++) { const dx = p.getX(i) - mx, dz = p.getZ(i) - mz; cxx += dx * dx; czz += dz * dz; cxz += dx * dz; }
      const ang = 0.5 * Math.atan2(2 * cxz, cxx - czz); geo.rotateY(ang); }
    if (o.rotY) geo.rotateY(o.rotY);
    geo.computeBoundingBox(); const b = geo.boundingBox; const k = (o.len || 4.3) / (b.max.x - b.min.x);
    geo.translate(-(b.max.x + b.min.x) / 2, -b.min.y, -(b.max.z + b.min.z) / 2); geo.scale(k, k, k); geo.computeVertexNormals();
    const map = src.material.map; if (map) { map.colorSpace = THREE.SRGBColorSpace; map.anisotropy = 4; }
    const mat = new THREE.MeshPhongMaterial({ map, shininess: 60, specular: 0x3a3a3a, envMap: GTA_ENV, reflectivity: 0.06, combine: THREE.MixOperation });
    C.model = new THREE.Mesh(geo, mat); C.body.add(C.model);
    C.setExterior = (on) => { C.model.visible = on; C.shell.forEach(m => m.visible = !on); };
    C.setExterior(true); res();
  }, undefined, () => { C.setExterior = () => {}; res(); });
  C.setExterior = () => {};
}
