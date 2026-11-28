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
