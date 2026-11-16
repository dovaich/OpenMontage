// model sheet for El-Alamy's current look
room.visible = false; hallway.visible = false; balcony.visible = false;
for (const ch of [mom, son, dad, samir]) ch.root.visible = false;
tvLight.intensity = 0; scene.fog = null; scene.background = new THREE.Color(0x23262e);
ambient.intensity = 0.75; moon.intensity = 0.3;
const key = new THREE.DirectionalLight(0xffffff, 1.3); key.position.set(2.5, 4, 4); scene.add(key);
const rim = new THREE.DirectionalLight(0x9fc0ff, 0.9); rim.position.set(-3, 3, -3); scene.add(rim);
const floorD = mesh(new THREE.CircleGeometry(1.6, 24), M(0x3a3e48), 0, 0.001, 0, scene); floorD.rotation.x = -Math.PI / 2;
const al = makeAlamy(scene);
const phone = new THREE.Group(); al.arms[1].hand.add(phone);
mesh(box(0.1, 0.19, 0.015), P(0xc8c4e8, { shininess: 120 }), 0, 0.02, 0.07, phone);
const VIEWS = [
  { ry: 0, pose: { aLz: 0.16, aRz: 0.16 }, cam: [V(0, 1.15, 4.3), V(0, 1.02, 0), 40], ar: 'قدّام', en: 'FRONT', face: ['smug', 'smile'] },
  { ry: 0.55, pose: { aLz: 0.12, aRx: 1.05, aRz: 0.35, eR: 1.75, hx: 0.25 }, cam: [V(0, 1.15, 4.3), V(0, 1.02, 0), 40], ar: 'السيلفي', en: 'MIRROR SELFIE', face: ['smug', 'flat'], phone: true },
  { ry: 2.5, pose: { aLz: 0.16, aRz: 0.16, hy: -0.5 }, cam: [V(0, 1.15, 4.3), V(0, 1.02, 0), 40], ar: 'من ضهره', en: 'BACK 3/4', face: ['smug', 'smile'] },
  { ry: 0.25, pose: { aLz: 0.16, aRz: 0.16 }, cam: [V(0.15, 1.78, 1.25), V(0, 1.68, 0), 42], ar: 'الوش', en: 'CLOSE-UP', face: ['smug', 'grin'] },
];
window.renderFrame = function (i) {
  const v = VIEWS[i];
  al.root.rotation.y = v.ry; applyPose(al, { ...POSE0, ...v.pose }); phone.visible = !!v.phone;
  al.faceMat.map = faceTexture(v.face[0], v.face[1], ALAMY_FACE); al.faceMat.needsUpdate = true;
  cam(...v.cam);
  renderer.render(scene, camera);
  ctx.clearRect(0, 0, W, H); ctx.drawImage(glCanvas, 0, 0);
  h.clearRect(0, 0, W, H);
  h.fillStyle = 'rgba(0,0,0,0.6)'; h.fillRect(0, 0, W, 54); h.fillStyle = '#d8231b'; h.fillRect(0, 54, W, 3);
  arText(h, 'العالمي — ' + v.ar, W - 16, 8, 30, '#ffe14a');
  pxText(h, 'EL-ALAMY', 16, 12, 12, '#fff'); pxText(h, v.en, 16, 32, 8, '#9fd0ff');
  ctx.drawImage(hud, 0, 0);
  return true;
};
window.frameData = () => out.toDataURL('image/png');
document.fonts.load('10px PS2P').then(() => document.fonts.load('20px Lalezar', 'ع')).then(() => { window.READY = true; });
