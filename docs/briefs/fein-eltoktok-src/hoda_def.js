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
