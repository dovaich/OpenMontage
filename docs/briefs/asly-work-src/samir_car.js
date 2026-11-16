// ===== Abu Samir's car: a 1980 «١٢٨» (Egyptian Fiat 128), reusable =====
// Scale: characters are ~1.9 units tall (≈ 1.75 m), so 1 unit ≈ 0.92 m.
// Car: length 4.0 (≈ 3.7 m), width 1.75, height 1.45 (≈ 1.35 m), like the real car next to a person.
// Look: mustard-orange body + white roof, chrome bumpers, whitewall tyres, one cream (replaced) door, rust patches,
// duct tape, a roof rack (rolled carpet + butane cylinder), fuzzy dice, a blue evil-eye charm, «ما شاء الله» sticker, plate «س م ر ١٩٨٠».
// Needs engine8 globals (mesh, box, cyl, M, P, canvasTex). Front faces local +x.
function makeSamirCar(parent) {
  const g = new THREE.Group(); parent.add(g);
  const body = P(0xe8a020, { shininess: 70 }), roofC = P(0xf4f0e6, { shininess: 60 }), chrome = P(0xe0e0e8, { shininess: 140, specular: 0xffffff });
  const glass = new THREE.MeshPhongMaterial({ color: 0x9fc8e0, transparent: true, opacity: 0.55, shininess: 120 });
  const L = 4.0, Wd = 1.75;
  // lower body (boxy 128 shape) + hood + trunk slopes
  mesh(box(L, 0.55, Wd), body, 0, 0.6, 0, g);
  mesh(box(L - 0.1, 0.06, Wd - 0.05), M(0x2a2a2a), 0, 0.32, 0, g); // sill shadow
  // cabin
  mesh(box(2.0, 0.08, Wd - 0.12), roofC, -0.2, 1.42, 0, g);
  for (const [x, z] of [[0.75, 0.78], [0.75, -0.78], [-1.15, 0.78], [-1.15, -0.78]]) mesh(box(0.08, 0.55, 0.08), roofC, x, 1.13, z, g);
  mesh(box(1.9, 0.52, Wd - 0.16), glass, -0.2, 1.13, 0, g);
  const ws = mesh(box(0.06, 0.6, Wd - 0.2), glass, 0.86, 1.12, 0, g); ws.rotation.z = -0.35;
  // replaced cream front-left door + rust + tape
  mesh(new THREE.PlaneGeometry(0.95, 0.5), M(0xece0c0), 0.25, 0.62, Wd / 2 + 0.006, g);
  for (const [x, y, s] of [[-1.4, 0.5, 0.3], [1.5, 0.42, 0.22], [-0.6, 0.38, 0.18]]) mesh(new THREE.PlaneGeometry(s, s * 0.6), M(0x8a4a22), x, y, Wd / 2 + 0.008, g);
  for (const [x, y, s] of [[-1.0, 0.5, 0.28], [1.2, 0.45, 0.2]]) { const r = mesh(new THREE.PlaneGeometry(s, s * 0.6), M(0x8a4a22), x, y, -Wd / 2 - 0.008, g); r.rotation.y = Math.PI; }
  for (let i = 0; i < 2; i++) mesh(box(0.05, 0.57, Wd + 0.02), P(0xc9ccd1), 1.0 + i * 0.3, 0.6, 0, g);
  // wheels: black + whitewall + chrome hub
  const wheels = [];
  for (const [x, z] of [[-1.25, 0.82], [1.25, 0.82], [-1.25, -0.82], [1.25, -0.82]]) {
    const w = new THREE.Group(); w.position.set(x, 0.32, z); w.rotation.x = Math.PI / 2; g.add(w);
    mesh(cyl(0.32, 0.32, 0.2, 14), M(0x111111), 0, 0, 0, w); mesh(cyl(0.2, 0.2, 0.21, 14), M(0xf4f4f4), 0, 0, 0, w); mesh(cyl(0.12, 0.12, 0.22, 10), chrome, 0, 0, 0, w); wheels.push(w);
  }
  for (const x of [-1.25, 1.25]) for (const z of [-1, 1]) mesh(box(0.85, 0.12, 0.08), body, x, 0.68, z * (Wd / 2 + 0.03), g); // wheel arches
  // chrome bumpers + grille + round headlamps + tail lights
  for (const x of [L / 2 + 0.05, -L / 2 - 0.05]) mesh(box(0.1, 0.14, Wd + 0.08), chrome, x, 0.42, 0, g);
  mesh(box(0.02, 0.22, 0.8), M(0x222222), L / 2 + 0.005, 0.66, 0, g);
  for (let i = 0; i < 4; i++) mesh(box(0.025, 0.02, 0.78), chrome, L / 2 + 0.012, 0.58 + i * 0.05, 0, g);
  const lamps = [];
  for (const z of [-0.62, 0.62]) { lamps.push(mesh(new THREE.CircleGeometry(0.13, 12), new THREE.MeshBasicMaterial({ color: 0xfff6c0 }), L / 2 + 0.012, 0.68, z, g)); lamps[lamps.length - 1].rotation.y = Math.PI / 2; mesh(new THREE.TorusGeometry(0.13, 0.02, 4, 12), chrome, L / 2 + 0.01, 0.68, z, g).rotation.y = Math.PI / 2; }
  for (const z of [-0.62, 0.62]) mesh(box(0.02, 0.14, 0.26), new THREE.MeshBasicMaterial({ color: 0xd8231b }), -L / 2 - 0.005, 0.7, z, g);
  // plate + sticker
  const plateT = canvasTex(64, 20, (c) => { c.fillStyle = '#f0f0f0'; c.fillRect(0, 0, 64, 20); c.fillStyle = '#1f5fd8'; c.fillRect(0, 0, 64, 5); });
  const plate = mesh(new THREE.PlaneGeometry(0.42, 0.13), new THREE.MeshBasicMaterial({ map: plateT }), L / 2 + 0.11, 0.42, 0, g); plate.rotation.y = Math.PI / 2;
  const stickT = canvasTex(64, 20, (c) => { c.fillStyle = '#d8231b'; c.fillRect(0, 0, 64, 20); });
  const stick = mesh(new THREE.PlaneGeometry(0.6, 0.19), new THREE.MeshBasicMaterial({ map: stickT }), -L / 2 - 0.006, 0.62, 0, g); stick.rotation.y = -Math.PI / 2;
  // roof rack: rolled carpet + butane cylinder
  for (const x of [-0.8, 0.4]) mesh(box(0.05, 0.08, Wd - 0.2), chrome, x, 1.5, 0, g);
  mesh(box(1.6, 0.04, 0.05), chrome, -0.2, 1.54, 0.7, g); mesh(box(1.6, 0.04, 0.05), chrome, -0.2, 1.54, -0.7, g);
  const carpet = mesh(cyl(0.16, 0.16, 1.5, 10), M(0xb8342a), -0.3, 1.66, 0.2, g); carpet.rotation.x = Math.PI / 2;
  for (let i = 0; i < 3; i++) { const s = mesh(cyl(0.165, 0.165, 0.06, 10), M(0xf0d070), -0.3, 1.66, -0.4 + i * 0.4, g); s.rotation.x = Math.PI / 2; }
  mesh(cyl(0.16, 0.16, 0.5, 10), P(0x2f6fd8), 0.15, 1.78, -0.45, g).rotation.z = Math.PI / 2;
  // mirror charm (blue evil eye) + fuzzy dice
  const charm = mesh(new THREE.CircleGeometry(0.06, 10), M(0x1f5fd8, { side: THREE.DoubleSide }), 0.55, 1.15, 0, g); charm.rotation.y = Math.PI / 2;
  for (const dz of [-0.06, 0.06]) mesh(box(0.08, 0.08, 0.08), M(0xff5fa8), 0.6, 1.25 - Math.abs(dz) * 2, dz, g);
  // hood (hinged at the windshield) + engine bay with the taped wiring
  const hood = new THREE.Group(); hood.position.set(0.9, 0.88, 0); g.add(hood); mesh(box(1.12, 0.05, Wd - 0.06), body, 0.56, 0, 0, hood);
  const bay = new THREE.Group(); bay.position.set(1.4, 0.6, 0); g.add(bay);
  mesh(box(0.7, 0.12, 1.1), M(0x2a2a2a), 0, 0, 0, bay); mesh(box(0.45, 0.16, 0.5), M(0x555555), -0.05, 0.1, 0, bay);
  const wires = []; for (let i = 0; i < 5; i++) wires.push(mesh(box(0.6, 0.025, 0.025), M([0xd8231b, 0xffd400, 0x1f5fd8, 0x3df05a, 0xffffff][i]), 0, 0.2, -0.3 + i * 0.15, bay));
  for (let i = 0; i < 3; i++) mesh(box(0.07, 0.04, 0.8), P(0xc9ccd1), -0.15 + i * 0.15, 0.22, 0, bay);
  const late = () => { const c1 = plateT.userData.g; c1.fillStyle = '#f0f0f0'; c1.fillRect(0, 5, 64, 15); c1.fillStyle = '#111'; c1.font = '12px Lalezar'; c1.textAlign = 'center'; c1.textBaseline = 'middle'; c1.direction = 'rtl'; c1.fillText('س م ر ١٩٨٠', 32, 13); plateT.needsUpdate = true;
    const c2 = stickT.userData.g; c2.fillStyle = '#d8231b'; c2.fillRect(0, 0, 64, 20); c2.fillStyle = '#ffe14a'; c2.font = '13px Lalezar'; c2.textAlign = 'center'; c2.textBaseline = 'middle'; c2.direction = 'rtl'; c2.fillText('ما شاء الله', 32, 11); stickT.needsUpdate = true; };
  return { g, hood, bay, wires, wheels, lamps, late, L, Wd };
}
