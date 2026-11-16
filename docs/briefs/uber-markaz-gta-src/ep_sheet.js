room.visible = false;
${GARAGE}
const G = -100; garage.position.x = G;
${CREW}
const alamy = makeAlamy(scene);
scene.add(samir.root);
const garLight = new THREE.PointLight(0xfff6e8, 1.8, 14, 1.0); garLight.position.set(G - 0.5, 4.2, 2.0); scene.add(garLight);
const sun = new THREE.DirectionalLight(0xfff2dd, 0.9); sun.position.set(G + 3, 6, 5); sun.target.position.set(G, 0, 0); scene.add(sun); scene.add(sun.target);
lift.children.forEach(o => { if (o !== sedan && false) {} }); sedan.visible = false; car2.visible = false;
const cA = makeGtaCar(scene, { color: 0x3a3d42 }); cA.g.position.set(G - 3.6, 1.7, -2.4); cA.g.scale.setScalar(0.85);
const cB = makeGtaCar(scene, { color: 0x8a1a1e }); cB.g.position.set(G + 2.8, 0, -3.3); cB.g.rotation.y = 0.3;
const cC = makeGtaCar(scene, { style: '128', plate: 'س م ر ١٩٨٠' }); cC.g.position.set(G + 0.2, 0, -1.4); cC.g.rotation.y = -0.4;
// El-Alamy: drop the cartoon jacket add-ons (the leather photo texture carries the jacket)
alamy.torso.children.forEach(o => { if (o !== alamy.torsoMesh && o.isMesh && (o.geometry.type === 'BoxGeometry' || o.geometry.type === 'CylinderGeometry')) o.visible = false; });
alamy.arms.forEach(a => a.sh.children.forEach(o => { if (o.isMesh && o.geometry.type === 'BoxGeometry') o.visible = false; }));
const cast = [dad, bastam, asly, gazzar, alamy, samir];
cast.forEach((c, i) => { c.root.position.set(G - 3.0 + i * 1.2, 0, 1.0); c.root.rotation.set(0, 0, 0); c.root.visible = true; });
dad.afro.visible = false;
const EX = [['default', 'default'], ['angry', 'scream'], ['wide', 'talk2'], ['smug', 'smile'], ['tired', 'o'], ['sad', 'frown']];
window.renderFrame = function (t) {
  const k = Math.floor(t) % 6;
  cast.forEach((c, i) => { applyPose(c, { ...POSE0, aRx: i === k ? 1.2 : 0, eR: i === k ? 0.8 : 0.15 }); });
  setFace(dad, ...EX[(k + 0) % 6], { stache: true }); setFace(bastam, ...EX[(k + 1) % 6], { fuzz: true }); setFace(asly, ...EX[(k + 2) % 6], { stache: true });
  setFace(gazzar, ...EX[(k + 3) % 6], { fuzz: true }); setFace(alamy, ...EX[(k + 4) % 6], ALAMY_FACE); setFace(samir, ...EX[(k + 5) % 6], { stache: true, stacheColor: '#eeeeee' });
  if (t < 1) cam(V(G, 1.5, 6.4), V(G, 1.1, 1.0), 50);
  else if (t < 7) faceCam(cast[(Math.floor(t) - 1) % 6], 7.5, 1.2, -0.75, 40, 0.75);
  else if (t < 8) faceCam(dad, 1.4, 0.35, 0.0, 40, 0.02);
  else faceCam(asly, 1.4, -0.35, 0.0, 40, 0.02);
  renderer.render(scene, camera);
  ctx.clearRect(0, 0, W, H); ctx.drawImage(glCanvas, 0, 0);
  return true;
};
function portrait() {}
window.frameData = () => out.toDataURL('image/png');
window.DUR = DUR;
window.GTA_READY().then(() => document.fonts.load('20px Lalezar', 'ع')).then(() => { cA.late(); cB.late(); cC.late(); }).then(() => { window.READY = true; });
