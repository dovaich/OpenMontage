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
