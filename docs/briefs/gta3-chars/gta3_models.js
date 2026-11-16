// ===== Real character models (image → Hunyuan3D-2 → GLB in T-pose) skinned onto the engine's rig =====
// The rig groups (hips, torso, neck, head, arms sh/el, legs) act as bones, so applyPose / poseAt / talkPose work unchanged.
// Needs: GLTFLoader import (build.py adds it), engine8 globals, makeChar from gta3_chars.js.
const GTA_MODELS = {
  5: { file: 'ibrahim', h: 1.76 }, 61: { file: 'bastam', h: 1.78 }, 81: { file: 'asly', h: 1.8, heavy: 1 }, 91: { file: 'gazzar', h: 1.78 },
  71: { file: 'alamy', h: 1.82 }, 21: { file: 'samir', h: 1.7, robe: 1 },
};
const sstep = (a, b, x) => { const k = clamp((x - a) / (b - a)); return k * k * (3 - 2 * k); };
function gtaAttachModel(c) {
  const M = GTA_MODELS[c.cfg.seed]; if (!M) return;
  let res; GTA_LOADS.push(new Promise(r => res = r));
  new GLTFLoader().load('gta/models/' + M.file + '.glb', (gl) => {
    try { gtaSkin(c, gl.scene, M); } catch (e) { console.error('model ' + M.file + ': ' + e.message); }
    res();
  }, undefined, () => { console.warn('no model ' + M.file); res(); });
}
function gtaSkin(c, sceneObj, M) {
  // 1) one geometry in model space, normalised: feet on y = 0, centred, height M.h, facing +z
  sceneObj.updateMatrixWorld(true); let src = null;
  sceneObj.traverse(o => { if (o.isMesh && !src) src = o; });
  const geo = src.geometry.clone(); geo.applyMatrix4(src.matrixWorld);
  if (M.flip) geo.rotateY(Math.PI);
  geo.computeBoundingBox(); let bb = geo.boundingBox; const k = M.h / (bb.max.y - bb.min.y);
  geo.translate(-(bb.max.x + bb.min.x) / 2, -bb.min.y, -(bb.max.z + bb.min.z) / 2); geo.scale(k, k, k); geo.computeBoundingBox(); bb = geo.boundingBox;
  const P = geo.attributes.position, n = P.count, X = i => P.getX(i), Y = i => P.getY(i);
  // 2) landmarks from the T-pose
  const half = Math.max(-bb.min.x, bb.max.x);
  const armYs = []; for (let i = 0; i < n; i++) if (Math.abs(X(i)) > half * 0.6) armYs.push(Y(i)); armYs.sort((a, b) => a - b);
  const armY = armYs[armYs.length >> 1];
  let torsoW = 0; for (let i = 0; i < n; i++) { const y = Y(i); if (y > armY - 0.26 && y < armY - 0.14) torsoW = Math.max(torsoW, Math.abs(X(i))); }
  const shX = Math.max(0.12, torsoW - 0.035), elX = shX + (half - shX) * 0.46;
  let crotch = 0; for (let y = 0.35 * M.h; y < 0.62 * M.h; y += 0.005) { let hit = false; for (let i = 0; i < n; i++) if (Math.abs(X(i)) < 0.02 && Math.abs(Y(i) - y) < 0.006) { hit = true; break; } if (hit) { crotch = y; break; } }
  if (M.robe || crotch < 0.3 * M.h) crotch = 0.46 * M.h;
  const hipY = crotch + 0.07;
  let lx = 0, ln = 0; for (let i = 0; i < n; i++) { const y = Y(i); if (y > crotch - 0.3 && y < crotch - 0.15) { lx += Math.abs(X(i)); ln++; } } const legX = M.robe ? 0.1 : clamp(lx / Math.max(1, ln), 0.07, 0.16);
  const neckY = armY + 0.05, headY = bb.max.y - 0.12;
  // 3) move the rig joints onto the model (bind pose = T-pose)
  c.cfg.hipY = hipY;
  c.hips.position.set(0, hipY, 0); c.hips.rotation.set(0, 0, 0); c.torso.rotation.set(0, 0, 0);
  c.legs.forEach((lp, j) => { lp.position.set((j ? -1 : 1) * legX, 0, 0); lp.rotation.set(0, 0, 0); });
  c.arms.forEach((a, j) => { const s = j ? -1 : 1; a.sh.position.set(s * shX, armY - hipY, 0); a.sh.rotation.set(0, 0, s * Math.PI / 2); a.el.position.set(0, -(elX - shX), 0); a.el.rotation.set(0, 0, 0); });
  c.neck.position.set(0, neckY - hipY, 0); c.head.position.set(0, headY - neckY, 0); c.head.rotation.set(0, 0, 0); c.head.scale.setScalar(1);
  // the procedural body goes away (keep the shadow blob)
  c.root.traverse(o => { if (o.isMesh && o !== c.blob) o.visible = false; });
  const saved = [c.root.position.clone(), c.root.rotation.clone(), c.root.scale.clone()];
  c.root.position.set(0, 0, 0); c.root.rotation.set(0, 0, 0); c.root.scale.setScalar(1); c.root.updateMatrixWorld(true);
  // 4) weights: torso / hips / legs / arms (upper, fore) / neck-head, with soft bands at every joint
  const bones = [c.hips, c.torso, c.head, c.arms[0].sh, c.arms[0].el, c.arms[1].sh, c.arms[1].el, c.legs[0], c.legs[1]];
  const si = new Uint16Array(n * 4), sw = new Float32Array(n * 4);
  for (let i = 0; i < n; i++) {
    const x = X(i), y = Y(i), ax = Math.abs(x), s = x >= 0 ? 0 : 1; const w = new Float32Array(bones.length);
    const armBand = y > armY - 0.16 && y < armY + 0.16;
    const wArm = armBand ? sstep(shX - 0.09, shX + 0.06, ax) : 0;
    const wFore = sstep(elX - 0.05, elX + 0.05, ax);
    const wLeg = sstep(hipY - 0.02, crotch - 0.09, y) * (M.robe ? 0.35 : 1);
    const wHead = sstep(neckY + 0.02, neckY + 0.11, y);
    const wTor = sstep(hipY - 0.04, hipY + 0.14, y);
    const rest = 1 - wArm;
    w[3 + s * 2] += wArm * (1 - wFore); w[4 + s * 2] += wArm * wFore;
    const body = rest * (1 - wLeg); w[7 + s] += rest * wLeg;
    w[2] += body * wHead; const b2 = body * (1 - wHead); w[1] += b2 * wTor; w[0] += b2 * (1 - wTor);
    const ord = [...w.keys()].sort((a, b) => w[b] - w[a]).slice(0, 4); let tot = 0; ord.forEach(j => tot += w[j]);
    ord.forEach((j, q) => { si[i * 4 + q] = j; sw[i * 4 + q] = w[j] / (tot || 1); });
  }
  geo.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(si, 4)); geo.setAttribute('skinWeight', new THREE.Float32BufferAttribute(sw, 4));
  geo.computeVertexNormals();
  const map = src.material.map; if (map) { map.colorSpace = THREE.SRGBColorSpace; map.anisotropy = 4; }
  const mat = new THREE.MeshLambertMaterial({ map, color: 0xffffff }); mat.userData.orig = mat.color.clone(); c.mats.push(mat);
  const sk = new THREE.SkinnedMesh(geo, mat); sk.frustumCulled = false; c.root.add(sk); c.root.updateMatrixWorld(true);
  sk.bind(new THREE.Skeleton(bones)); c.model = sk;
  c.root.position.copy(saved[0]); c.root.rotation.copy(saved[1]); c.root.scale.copy(saved[2]);
  c.modelInfo = { armY, shX, elX, crotch, hipY, legX, neckY, headY };
}
