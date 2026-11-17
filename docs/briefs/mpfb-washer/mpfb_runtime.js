// Runtime for MPFB characters (docs/briefs/mpfb-chars): materials, Mixamo retargeting, lip sync, blinking. EXPERIMENT.
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';

// ---------- skin / fabric / hair detail: tiling normal maps made in a canvas ----------
function noiseNormal(size, freq, amp, seed) {
  const c = document.createElement('canvas'); c.width = c.height = size; const g = c.getContext('2d'); const d = g.createImageData(size, size);
  let s = seed; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647; const hgt = new Float32Array(size * size);
  for (let o = 0; o < 4; o++) {
    const n = freq << o; const grid = []; for (let i = 0; i < n * n; i++) grid.push(rnd());
    for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
      const gx = x / size * n, gy = y / size * n, x0 = Math.floor(gx), y0 = Math.floor(gy), fx = gx - x0, fy = gy - y0;
      const v = (a, b) => grid[((b % n) * n) + (a % n)]; const sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy);
      hgt[y * size + x] += (v(x0, y0) * (1 - sx) * (1 - sy) + v(x0 + 1, y0) * sx * (1 - sy) + v(x0, y0 + 1) * (1 - sx) * sy + v(x0 + 1, y0 + 1) * sx * sy) / (1 << o);
    }
  }
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const i = y * size + x; const dx = (hgt[y * size + (x + 1) % size] - hgt[y * size + (x + size - 1) % size]) * amp, dy = (hgt[((y + 1) % size) * size + x] - hgt[((y + size - 1) % size) * size + x]) * amp;
    const l = Math.hypot(dx, dy, 1); d.data[i * 4] = (-dx / l * 0.5 + 0.5) * 255; d.data[i * 4 + 1] = (-dy / l * 0.5 + 0.5) * 255; d.data[i * 4 + 2] = (1 / l * 0.5 + 0.5) * 255; d.data[i * 4 + 3] = 255;
  }
  g.putImageData(d, 0, 0); const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
}
let NM = null;
const CLOTHES = ['top', 'bottom', 'robe', 'coverall', 'coverall_trim', 'jacket', 'apron', 'headwear', 'band', 'headband'];
function dressMaterials(root) {
  if (!NM) {
    NM = { skin: noiseNormal(256, 32, 2.5, 7), cloth: noiseNormal(256, 32, 3, 11), hair: noiseNormal(256, 64, 4, 3) };
    NM.skin.repeat.set(20, 20); NM.cloth.repeat.set(2, 2); NM.hair.repeat.set(6, 6);
  }
  root.traverse(o => {
    if (!o.isMesh) return;
    o.castShadow = true; o.receiveShadow = true; o.frustumCulled = false;
    for (const m of (Array.isArray(o.material) ? o.material : [o.material])) {
      if (o.geometry.attributes.color) m.vertexColors = true;
      if (m.name === 'skin') { m.normalMap = NM.skin; m.normalScale.set(0.1, 0.1); m.roughness = 0.52; }
      if (['hair', 'mustache', 'brows'].includes(m.name)) { m.side = THREE.DoubleSide; m.roughness = 0.8; m.normalMap = NM.hair; m.normalScale.set(0.4, 0.4); }
      if (CLOTHES.includes(m.name)) { m.normalMap = NM.cloth; const k = m.name === 'headwear' ? 0.12 : 0.25; m.normalScale.set(k, k); }
    }
  });
}

// ---------- loading ----------
const gltfL = new GLTFLoader(), fbxL = new FBXLoader();
export async function loadClips(files) {
  const out = {};
  for (const [name, file] of Object.entries(files)) {
    if (file.endsWith('.glb')) {   // a GLB with several clips (three.js Xbot): name = prefix, each clip -> prefix.clip
      const g = await gltfL.loadAsync(file);
      for (const c of g.animations) out[c.name] = makeSource(g.scene, c);
    } else { const f = await fbxL.loadAsync(file); out[name] = makeSource(f, f.animations[0]); }
  }
  return out;
}
function makeSource(obj, clip) {
  // each clip gets its own copy of the source skeleton, so several can be evaluated in one frame
  const root = obj.clone(true); root.updateMatrixWorld(true);
  const rootQ = root.getWorldQuaternion(new THREE.Quaternion()).invert();
  const bones = {}; root.traverse(o => { if (o.isBone) bones[o.name] = o; });
  const rest = {}; for (const n in bones) rest[n] = rootQ.clone().multiply(bones[n].getWorldQuaternion(new THREE.Quaternion()));
  const hips = bones.mixamorigHips; const hipRest = hips.getWorldPosition(new THREE.Vector3());
  const mixer = new THREE.AnimationMixer(root); const action = mixer.clipAction(clip); action.play();
  return { root, bones, rest, rootQ, mixer, clip, hips, hipRest, dur: clip.duration };
}
export async function loadActor(file, scene) {
  const g = await gltfL.loadAsync(file); const root = g.scene; dressMaterials(root);
  const holder = new THREE.Group(); holder.add(root); scene.add(holder); holder.updateMatrixWorld(true);
  const bones = {}, order = []; root.traverse(o => { if (o.isBone) { bones[o.name] = o; order.push(o); } });
  const rootQ = root.getWorldQuaternion(new THREE.Quaternion()).invert();
  const rest = {}; for (const n in bones) rest[n] = rootQ.clone().multiply(bones[n].getWorldQuaternion(new THREE.Quaternion()));
  const restLocal = {}; for (const n in bones) restLocal[n] = { q: bones[n].quaternion.clone(), p: bones[n].position.clone() };
  const hips = bones.mixamorigHips; const hipH = hips.getWorldPosition(new THREE.Vector3()).y - holder.position.y;
  let morph = null; root.traverse(o => { if (o.morphTargetDictionary && !morph) morph = o; });
  const meshes = []; root.traverse(o => { if (o.morphTargetDictionary) meshes.push(o); });
  return { holder, root, bones, order, rest, restLocal, rootQ, hips, hipH, meshes };
}

// ---------- retargeting (world-space rotation deltas, rest = T-pose on both sides) ----------
const _q = new THREE.Quaternion(), _q2 = new THREE.Quaternion();
function sourceRel(src, t) {
  src.mixer.setTime(((t % src.dur) + src.dur) % src.dur); src.root.updateMatrixWorld(true);
  const rel = {};
  for (const n in src.bones) {
    const q = src.rootQ.clone().multiply(src.bones[n].getWorldQuaternion(new THREE.Quaternion()));
    rel[n] = q.multiply(_q.copy(src.rest[n]).invert());          // delta from rest, in root space
  }
  const hp = src.hips.getWorldPosition(new THREE.Vector3()).sub(src.hipRest); hp.applyQuaternion(src.rootQ);
  const hipH = src.hipRest.y;   // for scaling
  return { rel, hp, hipH };
}
// layers: [{src, t, w}] blended in order (w = weight of that layer over the previous ones)
export function pose(actor, layers, opts = {}) {
  const deltas = {}; let hp = new THREE.Vector3(), first = true;
  for (const L of layers) {
    if (L.w <= 0) continue;
    const s = sourceRel(L.src, L.t);
    for (const n in s.rel) {
      if (!actor.bones[n]) continue;
      if (first || !deltas[n]) deltas[n] = s.rel[n].clone(); else deltas[n].slerp(s.rel[n], L.w);
    }
    const scaled = s.hp.clone().multiplyScalar(actor.hipH / Math.max(0.01, s.hipH));
    hp = first ? scaled : hp.lerp(scaled, L.w); first = false;
  }
  const relNow = new Map();
  for (const b of actor.order) {
    const n = b.name; const parentRel = b.parent && relNow.has(b.parent) ? relNow.get(b.parent) : new THREE.Quaternion();
    let target;
    if (deltas[n]) {
      target = deltas[n].clone().multiply(actor.rest[n]);
      if (opts.extra && opts.extra[n]) target = opts.extra[n].clone().multiply(target);   // additive (head turns, leans)
      b.quaternion.copy(_q2.copy(parentRel).invert().multiply(target));
    } else {
      b.quaternion.copy(actor.restLocal[n].q);
      target = parentRel.clone().multiply(b.quaternion);
    }
    relNow.set(b, target);
  }
  const hpos = actor.restLocal.mixamorigHips.p.clone();
  if (opts.inPlace !== false) { hp.x = 0; hp.z = 0; }
  // hip offset is in root space; convert into the hips' parent space
  const parent = actor.hips.parent; const pq = relNow.has(parent) ? relNow.get(parent).clone().invert() : new THREE.Quaternion();
  const ps = parent.getWorldScale(new THREE.Vector3()).x || 1;
  actor.hips.position.copy(hpos.add(hp.applyQuaternion(pq).multiplyScalar(1 / ps)));
}

// ---------- face: lip sync from the voice envelope + the Arabic letters, blinking ----------
const OPEN = 'اآأإعحهءىةَ', ROUND = 'وُؤ', WIDE = 'يِئ', PRESS = 'مبف';
function letterAt(line, t) {
  const text = line.ar.replace(/[^؀-ۿ ]/g, ''); const letters = [...text.replace(/ /g, '')];
  const vox = line.vox && line.vox.length ? line.vox : [[line.t0, line.t1]];
  const total = vox.reduce((s, [a, b]) => s + (b - a), 0); let done = 0, inside = false;
  for (const [a, b] of vox) { if (t >= b) done += b - a; else if (t > a) { done += t - a; inside = true; } }
  if (!inside) return null;
  return letters[Math.min(letters.length - 1, Math.floor(done / total * letters.length))];
}
export function face(actor, id, t, data, extra = {}) {
  const w = { open: 0, round: 0, wide: 0, press: 0, smile: 0, frown: 0, blinkL: 0, blinkR: 0, browsUp: 0, browsDown: 0 };
  const L = data.lines.find(l => l.s === id && t >= l.t0 && t < l.t1);
  if (L) {
    const i = Math.floor((t - L.t0) * 30); const e = (L.env[i] || 0) * 0.65 + (L.env[i - 1] || 0) * 0.35;
    const ch = letterAt(L, t);
    w.open = Math.min(1, e * 0.85);
    if (ch && ROUND.includes(ch)) { w.round = 0.75 * Math.min(1, e * 2); w.open *= 0.6; }
    else if (ch && WIDE.includes(ch)) { w.wide = 0.6 * Math.min(1, e * 2); w.open *= 0.75; }
    else if (ch && PRESS.includes(ch)) { w.press = 0.7; w.open *= 0.15; }
    else if (ch && OPEN.includes(ch)) w.open = Math.min(1, w.open * 1.25);
    w.browsUp = Math.max(0, e - 0.6) * 1.2;
  }
  // blinks: every 2.5-4.5 s per character, 0.16 s long
  let seed = [...id].reduce((a, c) => a * 31 + c.charCodeAt(0), 7) % 1000;
  for (let tb = (seed % 100) / 40; tb < t + 1; tb += 2.5 + ((seed = (seed * 9301 + 49297) % 233280) / 233280) * 2) {
    const d = t - tb; if (d > 0 && d < 0.16) { const k = Math.sin(d / 0.16 * Math.PI); w.blinkL = w.blinkR = Math.max(w.blinkL, k); }
  }
  Object.assign(w, Object.fromEntries(Object.entries(extra).map(([k, v]) => [k, Math.max(w[k] || 0, v)])));
  for (const m of actor.meshes) for (const k in w) if (k in m.morphTargetDictionary) m.morphTargetInfluences[m.morphTargetDictionary[k]] = w[k];
}
export { THREE };
