// Abu Samir's 1980 «١٢٨», ported from docs/briefs/vertical-template/samir_car.js. Front faces local +x.
import * as THREE from 'three';
import { M, P, mesh, box, cyl, canvasTex } from './kit.js';
function makeSamirCar(parent, scale = 1.2) {
  // scale 1.2 (default): roomy enough for seated characters (roof at 1.74)
  const root = new THREE.Group(); parent.add(root); const g = new THREE.Group(); g.scale.setScalar(scale); root.add(g);
  const body = P(0xe8a020, { shininess: 70 }), roofC = P(0xf4f0e6, { shininess: 60 }), chrome = P(0xe0e0e8, { shininess: 140, specular: 0xffffff });
  const glass = new THREE.MeshPhongMaterial({ color: 0x9fc8e0, transparent: true, opacity: 0.55, shininess: 120 });
  const L = 4.0, Wd = 1.75;
  // lower body (boxy 128 shape) + hood + trunk slopes
  // hollow body: solid engine block + trunk, open cabin tub (floor + thin side walls) so no orange shows inside
  mesh(box(1.18, 0.55, Wd), body, 1.41, 0.6, 0, g);
  mesh(box(0.64, 0.55, Wd), body, -1.68, 0.6, 0, g);
  mesh(box(2.12, 0.06, Wd), M(0x2a1a14), -0.24, 0.31, 0, g);
  for (const sz of [-1, 1]) mesh(box(2.12, 0.55, 0.04), body, -0.24, 0.6, sz * (Wd / 2 - 0.02), g);
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
  // ===== interior («صالون»): velour seats, dashboard, wheel, door panels, headliner with tassels =====
  const D2 = (c, o = {}) => new THREE.MeshLambertMaterial({ color: c, side: THREE.DoubleSide, flatShading: true, ...o });
  const velour = canvasTex(32, 32, (c) => { c.fillStyle = '#8a1a24'; c.fillRect(0, 0, 32, 32); c.fillStyle = '#b02a36'; for (let y = 0; y < 32; y += 8) c.fillRect(0, y, 32, 4); c.fillStyle = '#e8c070'; for (let x = 2; x < 32; x += 8) for (let y = 2; y < 32; y += 8) c.fillRect(x, y, 2, 2); }, [2, 2]);
  const velM = new THREE.MeshLambertMaterial({ map: velour, flatShading: true });
  const rug = canvasTex(32, 32, (c) => { c.fillStyle = '#3a2a22'; c.fillRect(0, 0, 32, 32); c.fillStyle = '#c8a040'; c.fillRect(0, 0, 32, 2); c.fillRect(0, 30, 32, 2); c.fillStyle = '#7a2a2a'; for (let i = 4; i < 32; i += 8) c.fillRect(i, 6, 3, 20); }, [3, 2]);
  const floorI = mesh(new THREE.PlaneGeometry(2.3, 1.6), new THREE.MeshLambertMaterial({ map: rug, side: THREE.DoubleSide }), -0.24, 0.345, 0, g); floorI.rotation.x = -Math.PI / 2;
  for (const z of [-0.4, 0.4]) { // front bucket seats
    mesh(box(0.5, 0.1, 0.46), velM, 0.1, 0.36, z, g);
    const bk = mesh(box(0.1, 0.55, 0.46), velM, -0.27, 0.66, z, g); bk.rotation.z = 0.12;
    mesh(box(0.08, 0.16, 0.26), velM, -0.31, 1.02, z, g);
  }
  mesh(box(0.5, 0.1, 1.5), velM, -0.84, 0.36, 0, g); // rear bench
  const rb = mesh(box(0.1, 0.55, 1.5), velM, -1.14, 0.66, 0, g); rb.rotation.z = 0.12;
  mesh(box(0.2, 0.05, 1.5), D2(0x2a1a14), -1.26, 0.9, 0, g); // rear shelf
  const tissue = new THREE.Group(); tissue.position.set(-1.25, 0.97, 0.45); g.add(tissue); mesh(box(0.18, 0.09, 0.11), M(0xff6ab0), 0, 0, 0, tissue); for (let i = 0; i < 10; i++) mesh(new THREE.IcosahedronGeometry(0.03, 0), M(0xffb0d8), -0.08 + (i % 5) * 0.04, 0.05, -0.04 + Math.floor(i / 5) * 0.08, tissue);
  // dashboard
  mesh(box(0.28, 0.24, 1.62), D2(0x2a1a14), 0.7, 0.8, 0, g);
  mesh(box(0.3, 0.04, 1.64), D2(0x161010), 0.7, 0.93, 0, g);
  mesh(box(0.02, 0.06, 1.4), D2(0x8a5a2b), 0.555, 0.78, 0, g); // wood strip
  const gauge = canvasTex(32, 32, (c) => { c.fillStyle = '#111'; c.fillRect(0, 0, 32, 32); c.strokeStyle = '#eee'; c.lineWidth = 2; c.beginPath(); c.arc(16, 16, 13, 0, 7); c.stroke(); c.fillStyle = '#ff3a2a'; c.save(); c.translate(16, 16); c.rotate(0.8); c.fillRect(-1, -11, 2, 11); c.restore(); for (let i = 0; i < 8; i++) { c.save(); c.translate(16, 16); c.rotate(i * 0.7 - 2.4); c.fillStyle = '#eee'; c.fillRect(-0.5, -13, 1, 3); c.restore(); } });
  for (const z of [-0.5, -0.3]) { const gg = mesh(new THREE.CircleGeometry(0.075, 14), new THREE.MeshBasicMaterial({ map: gauge }), 0.554, 0.86, z, g); gg.rotation.y = -Math.PI / 2; }
  const radioT = canvasTex(32, 16, (c) => { c.fillStyle = '#222'; c.fillRect(0, 0, 32, 16); c.fillStyle = '#3df05a'; c.fillRect(4, 4, 14, 5); c.fillStyle = '#bbb'; c.fillRect(22, 4, 6, 6); });
  const rad = mesh(new THREE.PlaneGeometry(0.26, 0.12), new THREE.MeshBasicMaterial({ map: radioT }), 0.554, 0.79, 0.12, g); rad.rotation.y = -Math.PI / 2;
  // steering wheel + column
  const wheelG = new THREE.Group(); wheelG.position.set(0.42, 0.88, -0.4); wheelG.rotation.set(0, Math.PI / 2, 0.45); g.add(wheelG);
  mesh(new THREE.TorusGeometry(0.17, 0.025, 6, 16), D2(0x111111), 0, 0, 0, wheelG); for (let k = 0; k < 3; k++) mesh(box(0.02, 0.17, 0.02), D2(0x222222), 0, 0.08, 0, wheelG).rotation.z = k * 2.09;
  const col = mesh(cyl(0.03, 0.03, 0.3, 6), D2(0x222222), 0.55, 0.83, -0.4, g); col.rotation.z = Math.PI / 2 - 0.45;
  // gear stick
  mesh(cyl(0.015, 0.02, 0.3, 6), D2(0x333333), 0.38, 0.5, 0.0, g); mesh(new THREE.SphereGeometry(0.04, 8, 6), P(0x111111, { shininess: 120 }), 0.38, 0.66, 0.0, g);
  // THE RED BUTTON on the dashboard top, with a yellow/black hazard plate and a warning label
  const hazard = canvasTex(16, 16, (c) => { c.fillStyle = '#ffd400'; c.fillRect(0, 0, 16, 16); c.fillStyle = '#111'; for (let i = -16; i < 32; i += 6) { c.beginPath(); c.moveTo(i, 0); c.lineTo(i + 3, 0); c.lineTo(i + 3 - 16, 16); c.lineTo(i - 16, 16); c.fill(); } });
  mesh(box(0.2, 0.02, 0.2), new THREE.MeshLambertMaterial({ map: hazard }), 0.66, 0.96, 0.02, g);
  const btn = mesh(new THREE.SphereGeometry(0.075, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0xff2020 }), 0.66, 0.97, 0.02, g);
  const warnT = canvasTex(64, 20, (c) => { c.fillStyle = '#d8231b'; c.fillRect(0, 0, 64, 20); });
  const warn = mesh(new THREE.PlaneGeometry(0.34, 0.1), new THREE.MeshBasicMaterial({ map: warnT }), 0.554, 0.9, 0.02, g); warn.rotation.y = -Math.PI / 2;
  // door panels + headliner + tassels + mirror with prayer beads
  for (const sz of [-1, 1]) mesh(new THREE.PlaneGeometry(2.1, 0.55), D2(0x5a1a20), -0.24, 0.62, sz * (Wd / 2 - 0.05), g);
  const head = mesh(new THREE.PlaneGeometry(2.0, 1.6), D2(0xd8ccb0), -0.2, 1.37, 0, g); head.rotation.x = Math.PI / 2;
  for (let i = 0; i < 16; i++) mesh(new THREE.ConeGeometry(0.025, 0.08, 4), M([0xffd400, 0xd8231b, 0x1f9e5a][i % 3]), 0.72, 1.31, -0.75 + i * 0.1, g).rotation.x = Math.PI;
  mesh(box(0.03, 0.06, 0.22), P(0x222222), 0.74, 1.27, 0.05, g);
  for (let i = 0; i < 9; i++) { const a = i / 8 * Math.PI; mesh(new THREE.SphereGeometry(0.014, 5, 4), P(0x1fae8a, { shininess: 80 }), 0.72, 1.2 - Math.sin(a) * 0.14, 0.05 + Math.cos(a) * 0.06, g); }
  const late = () => { const c1 = plateT.userData.g; c1.fillStyle = '#f0f0f0'; c1.fillRect(0, 5, 64, 15); c1.fillStyle = '#111'; c1.font = '12px Lalezar'; c1.textAlign = 'center'; c1.textBaseline = 'middle'; c1.direction = 'rtl'; c1.fillText('س م ر ١٩٨٠', 32, 13); plateT.needsUpdate = true;
    const c2 = stickT.userData.g; c2.fillStyle = '#d8231b'; c2.fillRect(0, 0, 64, 20); c2.fillStyle = '#ffe14a'; c2.font = '13px Lalezar'; c2.textAlign = 'center'; c2.textBaseline = 'middle'; c2.direction = 'rtl'; c2.fillText('ما شاء الله', 32, 11); stickT.needsUpdate = true;
    const c3 = warnT.userData.g; c3.fillStyle = '#d8231b'; c3.fillRect(0, 0, 64, 20); c3.fillStyle = '#fff'; c3.font = '13px Lalezar'; c3.textAlign = 'center'; c3.textBaseline = 'middle'; c3.direction = 'rtl'; c3.fillText('ممنوع اللمس', 32, 11); warnT.needsUpdate = true; };
  return { g: root, body: g, scale, btn, wheelG, hood, bay, wires, wheels, lamps, late, L: L * scale, Wd: Wd * scale };
}
export { makeSamirCar };
