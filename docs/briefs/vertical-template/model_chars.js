// ---------- real 3D character models on the cartoon rig (opt-in, append after ep.js, before framing_check.js) ----------
// EXPERIMENT (user rule): never call useModel() in an episode unless the user explicitly asked for the 3D models.
// A GLB in T-pose (drawing -> Hunyuan3D-2 on Kaggle, see docs/briefs/model-chars/README.md) is skinned onto the engine's rig groups
// (hips, torso, neck, head, arms, legs), so applyPose / poseAt and every existing ep.js pose keeps working. A jaw bone follows the voice.
// In ep.js (anywhere):   useModel(dad, 'ibrahim', { h: 1.76 });  useModel(mom, 'om_hamada', { h: 1.62, robe: 1 });
//   h = height in metres, robe = long dress/galabiya (legs move less), flip = model faces -z.
// Models are read from build/models/<file>.glb (build.py copies them from docs/briefs/model-chars/models/).
// Real heads are about half the size of the cartoon heads: faceCam() distances are scaled by MODEL_FACE_K for model characters.
// Props that ep.js hangs on the cartoon head/torso still show (they are added after the cartoon parts were hidden).
const MODEL_FACE_K = 0.6;
// state lives on window: ep.js calls useModel() before this file's consts exist
function modelState() { return window.__MODELS || (window.__MODELS = { loads: [], use: [] }); }
const sstep = (a, b, x) => { const k = clamp((x - a) / (b - a)); return k * k * (3 - 2 * k); };
window.MODELS_READY = () => Promise.all(modelState().loads);
function useModel(c, file, opts = {}) {
  const M = { file, h: 1.75, ...opts }; modelState().use.push(c);
  let res; modelState().loads.push(new Promise(r => res = r));
  new GLTFLoader().load('models/' + file + '.glb', (gl) => {
    try { skinModel(c, gl.scene, M); } catch (e) { console.error('model ' + file + ': ' + e.message); }
    res();
  }, undefined, () => { console.error('missing model models/' + file + '.glb'); res(); });
}
function skinModel(c, sceneObj, M) {
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
  // arm line: fit y = a + b·|x| on the outer arm (handles A-poses too)
  let sx = 0, sy = 0, sxx = 0, sxy = 0, na = 0; for (let i = 0; i < n; i++) { const ax = Math.abs(X(i)); if (ax > half * 0.55 && ax < half * 0.9) { const y = Y(i); sx += ax; sy += y; sxx += ax * ax; sxy += ax * y; na++; } }
  const slope = na > 10 ? (na * sxy - sx * sy) / (na * sxx - sx * sx) : 0, icpt = (sy - slope * sx) / Math.max(1, na);
  const armAng = Math.atan(-Math.min(0, slope)); // radians below horizontal
  const armAt = (ax) => icpt + slope * ax;
  const armY0 = armAt(half * 0.45); const chest = []; for (let i = 0; i < n; i++) { const y = Y(i), ax = Math.abs(X(i)); if (y > armY0 - 0.3 && y < armY0 - 0.2 && ax < 0.3) chest.push(ax); } chest.sort((a, b) => a - b); const torsoW = chest.length ? chest[Math.floor(chest.length * 0.97)] : 0.18;
  const shX = clamp(torsoW * 1.0, 0.15, 0.27), elX = shX + (half - shX) * 0.46; const armY = armAt(shX) + 0.03;
  let crotch = 0; for (let y = 0.35 * M.h; y < 0.62 * M.h; y += 0.005) { let hit = false; for (let i = 0; i < n; i++) if (Math.abs(X(i)) < 0.02 && Math.abs(Y(i) - y) < 0.006) { hit = true; break; } if (hit) { crotch = y; break; } }
  if (M.robe || crotch < 0.3 * M.h) crotch = 0.46 * M.h;
  const hipY = crotch + 0.07;
  let lx = 0, ln = 0; for (let i = 0; i < n; i++) { const y = Y(i); if (y > crotch - 0.3 && y < crotch - 0.15) { lx += Math.abs(X(i)); ln++; } } const legX = M.robe ? 0.1 : clamp(lx / Math.max(1, ln), 0.07, 0.16);
  const top = bb.max.y; let neckM = armY + 0.06, minW = 9, headWm = 0;
  for (let y = armY + 0.03; y < top - 0.05; y += 0.006) { let w0 = 9, w1 = -9; for (let i = 0; i < n; i++) { if (Math.abs(Y(i) - y) < 0.004 && Math.abs(X(i)) < 0.2) { w0 = Math.min(w0, X(i)); w1 = Math.max(w1, X(i)); } } const w = w1 - w0; if (w > 0 && w < minW && y < top - 0.16) { minW = w; neckM = y; } if (y > neckM + 0.05) headWm = Math.max(headWm, w); }
  const neckY = neckM - 0.01, headY = (top + neckM) / 2, mouthY = top - (top - neckM) * 0.74;
  // 3) move the rig joints onto the model (bind pose = T-pose)
  c.cfg.hipY = hipY;
  c.hips.position.set(0, hipY, 0); c.hips.rotation.set(0, 0, 0); c.torso.rotation.set(0, 0, 0);
  c.legs.forEach((lp, j) => { lp.position.set((j ? -1 : 1) * legX, 0, 0); lp.rotation.set(0, 0, 0); });
  c.arms.forEach((a, j) => { const s = j ? -1 : 1; a.sh.position.set(s * shX, armY - hipY, 0); a.sh.rotation.set(0, 0, s * (Math.PI / 2 - armAng)); a.el.position.set(0, -(elX - shX) / Math.cos(armAng), 0); a.el.rotation.set(0, 0, 0); });
  c.neck.position.set(0, neckY - hipY, 0); c.head.position.set(0, headY - neckY, 0); c.head.rotation.set(0, 0, 0); c.head.scale.setScalar(1);
  const jaw = new THREE.Group(); c.head.add(jaw); jaw.position.set(0, mouthY + 0.012 - headY, -0.035); c.jaw = jaw;
  // dark mouth cavity behind the lips (shows when the jaw drops)
  let zf = 0; for (let i = 0; i < n; i++) if (Math.abs(Y(i) - mouthY) < 0.01 && Math.abs(X(i)) < 0.02) zf = Math.max(zf, P.getZ(i));
  const cav = null;
  // the procedural body goes away (keep the shadow blob)
  c.root.traverse(o => { if (o !== c.blob && o !== c.root) o.layers.set(1); });   // cartoon body: layer 1 = never drawn, whatever ep.js toggles
  const saved = [c.root.position.clone(), c.root.rotation.clone(), c.root.scale.clone()];
  c.root.position.set(0, 0, 0); c.root.rotation.set(0, 0, 0); c.root.scale.setScalar(1); c.root.updateMatrixWorld(true);
  // 4) weights: torso / hips / legs / arms (upper, fore) / neck-head, with soft bands at every joint
  const bones = [c.hips, c.torso, c.head, c.arms[0].sh, c.arms[0].el, c.arms[1].sh, c.arms[1].el, c.legs[0], c.legs[1], jaw];
  const si = new Uint16Array(n * 4), sw = new Float32Array(n * 4);
  for (let i = 0; i < n; i++) {
    const x = X(i), y = Y(i), ax = Math.abs(x), s = x >= 0 ? 0 : 1; const w = new Float32Array(bones.length);
    const dx = Math.cos(armAng), dy = -Math.sin(armAng); const vx = ax - shX, vy = y - armY;
    const proj = vx * dx + vy * dy, perp = Math.abs(vx * dy - vy * dx);
    const L1 = (elX - shX) / Math.cos(armAng); const rad = 0.105 + 0.03 * (1 - clamp(proj / 0.15));
    const wArm = sstep(-0.07, 0.05, proj) * (1 - sstep(rad, rad + 0.05, perp)) * (y > armY - 0.75 ? 1 : 0);
    const wFore = sstep(L1 - 0.05, L1 + 0.05, proj);
    const wLeg = sstep(hipY - 0.02, crotch - 0.09, y) * (M.robe ? 0.35 : 1);
    const wHead = sstep(neckY + 0.02, neckY + 0.11, y);
    const wTor = sstep(hipY - 0.04, hipY + 0.14, y);
    const rest = 1 - wArm;
    w[3 + s * 2] += wArm * (1 - wFore); w[4 + s * 2] += wArm * wFore;
    const body = rest * (1 - wLeg); w[7 + s] += rest * wLeg;
    const wJaw = (P.getZ(i) > 0 && Math.abs(x) < headWm * 0.45) ? sstep(mouthY - 0.004, mouthY - 0.016, y) * sstep(neckM - 0.01, neckM + 0.02, y) : 0;
    w[9] += body * wHead * wJaw; w[2] += body * wHead * (1 - wJaw); const b2 = body * (1 - wHead); w[1] += b2 * wTor; w[0] += b2 * (1 - wTor);
    const ord = [...w.keys()].sort((a, b) => w[b] - w[a]).slice(0, 4); let tot = 0; ord.forEach(j => tot += w[j]);
    ord.forEach((j, q) => { si[i * 4 + q] = j; sw[i * 4 + q] = w[j] / (tot || 1); });
  }
  geo.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(si, 4)); geo.setAttribute('skinWeight', new THREE.Float32BufferAttribute(sw, 4));
  geo.computeVertexNormals();
  const map = src.material.map; if (map) { map.colorSpace = THREE.SRGBColorSpace; map.anisotropy = 4; }
  const mat = new THREE.MeshLambertMaterial({ map, color: 0xffffff }); mat.userData.orig = mat.color.clone(); c.mats.push(mat);
  const mats = mat;
  const sk = new THREE.SkinnedMesh(geo, mats); sk.frustumCulled = false; c.root.add(sk); c.root.updateMatrixWorld(true);
  sk.bind(new THREE.Skeleton(bones)); c.model = sk;
  c.root.position.copy(saved[0]); c.root.rotation.copy(saved[1]); c.root.scale.copy(saved[2]);
  c.modelInfo = { mouthY, neckM, headWm, armAng, armY, shX, elX, crotch, hipY, legX, neckY, headY };
}

// jaw follows the speaker's voice envelope; faceCam comes closer for the smaller real heads
function modelLipSync(t) { for (const c of modelState().use) { if (!c.jaw) continue; const id = Object.keys(MODEL_IDS).find(k => MODEL_IDS[k] === c); const e = id && speakerAt(t) === id ? envAt(t) : 0; c.jaw.rotation.x = Math.min(0.14, e * 0.16); } }
const MODEL_IDS = {};   // line id -> character, filled from window.CAST and the usual variable names
const _faceCam0 = faceCam;
faceCam = function (c, dist, ...rest) { return _faceCam0(c, c.model ? dist * MODEL_FACE_K : dist, ...rest); };
{
  const ids = ['mom', 'son', 'dad', 'samir', 'bastam', 'alamy', 'asly', 'gazzar', 'teta', 'sayed', 'shehata', 'hoda', 'nashwa'];
  for (const id of ids) { let c; try { c = (window.CAST || {})[id] || eval(id); } catch (e) { c = null; } if (c && c.head) MODEL_IDS[id] = c; }
  const rf = window.renderFrame;
  window.renderFrame = function (t) { modelLipSync(t); return rf(t); };
}
