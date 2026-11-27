const hoda = makeChar({
  seed: 31, skin: 0xa87048, hipY: 0.84, legX: 0.11, legColor: 0x2f4f8f, shoe: 0xf2f2f2, hand: 0xa87048,
  torsoGeo: cyl(0.24, 0.25, 0.64, 6), torsoTex: canvasTex(32, 32, (g) => { g.fillStyle = '#ffd400'; g.fillRect(0, 0, 32, 32); g.fillStyle = '#111'; g.fillRect(0, 12, 32, 3); g.fillRect(0, 20, 32, 2); }), torsoColor: 0xffffff, torsoY: 0.32,
  sleeve: true, sleeveColor: 0xffd400, shoulderX: 0.3, shoulderY: 0.57, neckY: 0.64, headR: 0.27,
  build(head, torso, reg) {
    const hair = reg(M(0x120c08));
    for (let i = 0; i < 7; i++) { const s = mesh(new THREE.ConeGeometry(0.07, 0.22, 4), hair, -0.15 + i * 0.05, 0.27, -0.02 + (i % 2) * 0.05, head); s.rotation.z = (i - 3) * 0.18; s.rotation.x = -0.4; }
    mesh(box(0.5, 0.1, 0.45), hair, 0, 0.17, -0.05, head);
    const chain = mesh(new THREE.TorusGeometry(0.12, 0.012, 4, 10), reg(P(0xffd700, { shininess: 100 })), 0, 0.58, 0.18, torso); chain.rotation.x = 1.2;
    return {};
  }
}, scene);
const sayed = makeChar({
  seed: 41, skin: 0x8a5a3a, hipY: 0.84, legX: 0.12, legColor: 0x6b5a48, shoe: 0x3a2a1a, hand: 0x8a5a3a,
  torsoGeo: cyl(0.28, 0.34, 0.66, 7), torsoTex: null, torsoColor: 0x6b5a48, torsoY: 0.33,
  skirt: cyl(0.34, 0.44, 0.75, 7), sleeve: true, sleeveColor: 0x6b5a48, shoulderX: 0.34, shoulderY: 0.6, neckY: 0.66, headR: 0.28,
  build(head, torso, reg) {
    const tw = reg(M(0xf4f2ea));
    const turban = mesh(new THREE.TorusGeometry(0.24, 0.09, 5, 10), tw, 0, 0.2, -0.02, head); turban.rotation.x = Math.PI / 2;
    mesh(new THREE.SphereGeometry(0.2, 7, 4, 0, Math.PI * 2, 0, Math.PI / 2), tw, 0, 0.22, -0.02, head);
    mesh(box(0.62, 0.1, 0.05), reg(M(0xd8d0b8)), 0, 0.45, 0.24, torso);
    return {};
  }
}, scene);
const shehata = makeChar({
  seed: 51, skin: 0x9a6440, hipY: 0.86, legX: 0.14, legColor: 0x4a5a7a, shoe: 0x3a2a1a, hand: 0x9a6440,
  torsoGeo: cyl(0.34, 0.46, 0.7, 7), torsoTex: canvasTex(16, 16, (g) => { g.fillStyle = '#e8eef8'; g.fillRect(0, 0, 16, 16); g.fillStyle = '#3a5aa8'; g.fillRect(0, 0, 2, 16); g.fillRect(6, 0, 2, 16); g.fillRect(12, 0, 2, 16); }, [3, 2]), torsoColor: 0xffffff, torsoY: 0.35,
  skirt: cyl(0.46, 0.5, 0.7, 7), sleeve: true, shoulderX: 0.44, shoulderY: 0.62, neckY: 0.7, headR: 0.3,
  build(head, torso, reg) {
    mesh(new THREE.SphereGeometry(0.31, 8, 4, 0, Math.PI * 2, 0, Math.PI * 0.35), reg(M(0xf2f2f2)), 0, 0.04, 0, head); // white cap
    mesh(box(0.7, 0.55, 0.05), reg(M(0xd8c8a0)), 0, 0.25, 0.42, torso); // apron
    return {};
  }
}, scene);
const coverall = (c) => canvasTex(16, 16, (g) => { g.fillStyle = c; g.fillRect(0, 0, 16, 16); g.fillStyle = 'rgba(0,0,0,0.18)'; g.fillRect(7, 0, 2, 16); g.fillStyle = 'rgba(255,255,255,0.12)'; g.fillRect(2, 3, 4, 3); });
const bastam = makeChar({ seed: 61, skin: 0xb07a50, hipY: 0.84, legX: 0.11, legColor: 0x2f5fb0, shoe: 0x222222, hand: 0xb07a50,
  torsoGeo: cyl(0.24, 0.26, 0.64, 6), torsoTex: coverall('#2f5fb0'), torsoColor: 0xffffff, torsoY: 0.32, sleeve: true, sleeveColor: 0x2f5fb0, shoulderX: 0.3, shoulderY: 0.57, neckY: 0.64, headR: 0.27,
  build(head, torso, reg) { const cap = mesh(new THREE.SphereGeometry(0.28, 8, 4, 0, Math.PI * 2, 0, Math.PI * 0.42), reg(M(0xd8231b)), 0, 0.04, 0, head); mesh(box(0.3, 0.03, 0.2), reg(M(0xd8231b)), 0, 0.1, -0.3, head); mesh(box(0.12, 0.08, 0.02), reg(M(0xffffff)), 0.12, 0.45, 0.25, torso); return {}; } }, scene);
const asly = makeChar({ seed: 81, skin: 0xa86a40, hipY: 0.86, legX: 0.16, legColor: 0x6a6a6a, shoe: 0x222222, hand: 0xa86a40,
  torsoGeo: cyl(0.4, 0.54, 0.72, 8), torsoTex: coverall('#6a6a6a'), torsoColor: 0xffffff, torsoY: 0.34, sleeve: true, sleeveColor: 0x6a6a6a, shoulderX: 0.44, shoulderY: 0.62, neckY: 0.7, headR: 0.32,
  build(head, torso, reg) { mesh(box(0.08, 0.14, 0.26), reg(M(0x2a1a10)), 0.31, 0.0, -0.04, head); mesh(box(0.08, 0.14, 0.26), reg(M(0x2a1a10)), -0.31, 0.0, -0.04, head); mesh(cyl(0.3, 0.3, 0.06, 8), reg(M(0xffd400)), 0, -0.05, 0.52, torso).rotation.x = Math.PI / 2; return {}; } }, scene);
const gazzar = makeChar({ seed: 91, skin: 0xa87048, hipY: 0.84, legX: 0.11, legColor: 0x3a3a2a, shoe: 0x222222, hand: 0xa87048,
  torsoGeo: cyl(0.24, 0.26, 0.64, 6), torsoTex: canvasTex(16, 16, (g) => { g.fillStyle = '#4a4a38'; g.fillRect(0, 0, 16, 16); g.fillStyle = '#1a1a14'; g.fillRect(3, 5, 4, 3); g.fillRect(10, 11, 3, 2); }), torsoColor: 0xffffff, torsoY: 0.32, sleeve: true, sleeveColor: 0x4a4a38, shoulderX: 0.3, shoulderY: 0.57, neckY: 0.64, headR: 0.27,
  build(head, torso, reg) { const hair = reg(M(0x120c08)); const r = rng(14); for (let i = 0; i < 12; i++) { const a = r() * 6.28; mesh(new THREE.IcosahedronGeometry(0.1, 0), hair, Math.cos(a) * 0.2, 0.12 + r() * 0.1, Math.sin(a) * 0.18 - 0.08, head); } mesh(new THREE.TorusGeometry(0.27, 0.035, 4, 12), reg(M(0xd8231b)), 0, 0.12, 0, head).rotation.x = Math.PI / 2 - 0.1; return {}; } }, scene);
// ===== El-Alamy — current look (for future episodes) =====
// Black moto leather jacket (band collar + snap, quilted shoulders) open over a black turtleneck,
// slim grey trousers, black shoes, tall black pompadour with faded sides, clean-shaven.
// Needs engine8 globals (makeChar, mesh, box, cyl, M, P). Face opts: ALAMY_FACE.
const ALAMY_FACE = {}; // clean-shaven
function makeAlamy(parent) {
  const JACKET = 0x151518, KNIT = 0x101013, SILVER = 0xb9bcc4, HAIR = 0x0c0a09;
  const c = makeChar({ seed: 71, skin: 0xb98258, hipY: 0.86, legX: 0.11, legColor: 0x5a5d64, shoe: 0x0c0c10, hand: 0xb98258,
    torsoGeo: cyl(0.25, 0.22, 0.64, 8), torsoTex: null, torsoColor: JACKET, torsoY: 0.32, sleeve: true, sleeveColor: JACKET,
    shoulderX: 0.31, shoulderY: 0.57, neckY: 0.64, headR: 0.27,
    build(head, torso, reg) {
      // pompadour: dark cap, tall swept-up volume, faded sides
      const hair = reg(M(HAIR));
      const cap = mesh(new THREE.SphereGeometry(0.286, 10, 6, 0, Math.PI * 2, 0, Math.PI * 0.5), hair, 0, 0.0, -0.01, head); cap.rotation.x = -0.4;
      const vol = mesh(new THREE.SphereGeometry(0.17, 8, 5), hair, 0, 0.215, 0.0, head); vol.scale.set(1.5, 0.45, 1.4);
      const swoop = mesh(new THREE.SphereGeometry(0.12, 8, 5), hair, 0, 0.235, 0.13, head); swoop.scale.set(1.75, 0.5, 1.0); swoop.rotation.x = -0.35;
      for (const sx of [-1, 1]) mesh(box(0.02, 0.12, 0.22), hair, sx * 0.272, 0.04, -0.04, head); // short sides, same color
      // black turtleneck under the open jacket
      mesh(box(0.17, 0.5, 0.02), reg(M(KNIT)), 0, 0.36, 0.236, torso);
      mesh(cyl(0.125, 0.135, 0.13, 8), reg(M(KNIT)), 0, 0.68, 0, torso);
      // open zip edges
      for (const sx of [-1, 1]) mesh(box(0.016, 0.56, 0.03), reg(M(SILVER)), sx * 0.092, 0.33, 0.245, torso);
      // moto band collar (stands up, open at the front) + one snap
      mesh(box(0.3, 0.08, 0.04), reg(P(JACKET, { shininess: 80, specular: 0x777777 })), 0, 0.66, -0.13, torso);
      for (const sx of [-1, 1]) { const b = mesh(box(0.04, 0.08, 0.2), reg(P(JACKET, { shininess: 80, specular: 0x777777 })), sx * 0.15, 0.66, 0.05, torso); b.rotation.y = sx * -0.35; }
      mesh(box(0.03, 0.03, 0.02), reg(M(SILVER)), 0.14, 0.66, 0.16, torso);
      // ribbed hem
      mesh(box(0.46, 0.05, 0.03), reg(M(0x111114)), 0, 0.03, 0.215, torso);
      return {};
    } }, parent);
  // shiny leather on the body and full-length sleeves, quilted shoulder ribs, cuffs
  const leather = () => { const m = P(JACKET, { shininess: 50, specular: 0x404048 }); m.userData.orig = m.color.clone(); c.mats.push(m); return m; };
  c.torsoMesh.material = leather();
  for (const a of c.arms) {
    a.sh.children[0].material = leather();
    a.el.children[0].material = leather();
    for (const y of [-0.04, -0.08, -0.12]) mesh(box(0.136, 0.012, 0.136), M(0x0a0a0c), 0, y, 0, a.sh);
    mesh(box(0.125, 0.04, 0.125), M(0x111114), 0, -0.3, 0, a.el);
  }
  c.legs.forEach(l => { l.userData.shoe.material = P(0x0c0c10, { shininess: 140, specular: 0xffffff }); });
  return c;
}
const alamy = makeAlamy(scene);
