// ---------- framing check (append LAST to scene.js, after ep.js) ----------
// window.frameCheck(t) renders frame t, then checks the character who is speaking at t:
//   - is the face in the shot, and above the dialogue box?
//   - is the face turned towards the camera?
//   - is anything (a wall, a roof, another character, a prop) between the camera and the face?
//   - is the lens inside / right against something?
// It returns a list of problems (empty = OK) and marks them on the frame in red, so `node render.cjs check 5`
// can save only the bad frames. Speaker ids are the ids in lines.json (mom, son, dad, samir, bastam, alamy, ...).
// Characters made in ep.js are found by their variable name. If the name differs, or one id has several models
// (young/old versions), register them in ep.js:  window.CAST = { teta: [tetaOld, tetaYoung], sayed: (t) => t < 10 ? sayedA : sayedB };
// Props that may cover a face on purpose:  window.FRAME_IGNORE = [mesh1, group2];   Skip a time range:  window.FRAME_SKIP = [[12.0, 13.5]];
const FC_DIALOGUE_TOP = H - 168 - 40;   // top of drawDialogueV's box
const fcRay = new THREE.Raycaster();
function fcVisible(o) { for (; o; o = o.parent) if (!o.visible) return false; return true; }
function fcInside(o, root) { for (; o; o = o.parent) if (o === root) return true; return false; }
function fcIgnored(o) { const ig = window.FRAME_IGNORE || []; for (; o; o = o.parent) if (ig.includes(o)) return true; return false; }
function fcCast(id, t) {
  const reg = window.CAST || {};
  let c = reg[id];
  if (c === undefined && /^[A-Za-z_][A-Za-z0-9_]*$/.test(id)) { try { c = eval(id); } catch (e) { c = undefined; } }
  if (typeof c === 'function' && !c.head) c = c(t);
  const list = (Array.isArray(c) ? c : [c]).filter(x => x && x.head && x.root);
  return list.find(x => fcVisible(x.root)) || list[0] || null;
}
function fcSolid(hit) {
  const o = hit.object;
  if (!o.isMesh || !fcVisible(o) || fcIgnored(o)) return false;
  const m = Array.isArray(o.material) ? o.material[hit.face ? hit.face.materialIndex : 0] : o.material;
  if (!m || m.visible === false || m.depthWrite === false) return false;
  if (m.transparent && m.opacity < 0.5) return false;
  if (m.alphaTest > 0 && m.map) return false;   // cut-out sprites/faces: can't tell from geometry
  return true;
}
function fcName(o) { for (let x = o; x; x = x.parent) if (x.name) return x.name; const p = o.getWorldPosition(V(0, 0, 0)); return `${o.geometry ? o.geometry.type.replace('Geometry', '') : 'mesh'} at (${p.x.toFixed(1)}, ${p.y.toFixed(1)}, ${p.z.toFixed(1)})`; }
function fcProject(p) { const v = p.clone().project(camera); return { x: (v.x + 1) / 2 * W, y: (1 - v.y) / 2 * H, z: v.z }; }
window.frameCheck = function (t) {
  window.renderFrame(t);
  if ((window.FRAME_SKIP || []).some(([a, b]) => t >= a && t < b)) return [];
  const id = speakerAt(t);
  if (!id || id === 'anno') return [];
  const c = fcCast(id, t);
  const probs = []; const marks = [];
  if (!c) return [`speaker "${id}": no model found (add window.CAST.${id} = <character> in ep.js)`];
  camera.updateMatrixWorld(); scene.updateMatrixWorld();
  const head = headOf(c); const r = c.cfg.headR * c.head.getWorldScale(V(0, 0, 0)).x;
  const camPos = camera.getWorldPosition(V(0, 0, 0));
  const s = fcProject(head);
  if (!fcVisible(c.root)) probs.push(`${id} talks but is hidden`);
  else if (s.z > 1 || s.z < -1 || s.x < 0 || s.x > W || s.y < 0 || s.y > H) probs.push(`${id}'s face is out of the shot`);
  else {
    if (s.y > FC_DIALOGUE_TOP - 10) probs.push(`${id}'s face is behind the dialogue box`);
    const fwd = c.head.getWorldDirection(V(0, 0, 0)).normalize();
    const toCam = camPos.clone().sub(head).normalize();
    if (fwd.dot(toCam) < 0.15) probs.push(`${id} is turned away from the camera`);
    // 5 rays: face centre, left/right cheek, forehead, chin. Blocked if 3+ are blocked.
    const right = V(0, 0, 0).crossVectors(toCam, V(0, 1, 0)).normalize();
    const pts = [V(0, 0, 0), right.clone().multiplyScalar(r * 0.6), right.clone().multiplyScalar(-r * 0.6), V(0, r * 0.6, 0), V(0, -r * 0.6, 0)].map(o => head.clone().add(o).add(toCam.clone().multiplyScalar(r * 0.9)));
    let blocked = 0; const by = {};
    for (const p of pts) {
      const dir = p.clone().sub(camPos); const dist = dir.length(); dir.normalize();
      fcRay.set(camPos, dir); fcRay.near = 0; fcRay.far = dist; fcRay.camera = camera;
      const hit = fcRay.intersectObject(scene, true).find(h => fcSolid(h) && !fcInside(h.object, c.root));
      if (hit) { blocked++; const n = fcName(hit.object); by[n] = (by[n] || 0) + 1; }
    }
    if (blocked >= 3) { const n = Object.entries(by).sort((a, b) => b[1] - a[1])[0][0]; probs.push(`${id}'s face is blocked by ${n}`); }
    marks.push(s);
  }
  // lens inside or touching something
  fcRay.set(camPos, camera.getWorldDirection(V(0, 0, 0))); fcRay.near = 0; fcRay.far = 0.12; fcRay.camera = camera;
  const near = fcRay.intersectObject(scene, true).find(fcSolid);
  if (near) probs.push(`camera lens is touching ${fcName(near.object)}`);
  if (probs.length) {
    ctx.save(); ctx.strokeStyle = '#ff2020'; ctx.lineWidth = 4;
    for (const m of marks) { ctx.beginPath(); ctx.arc(m.x, m.y, 34, 0, 7); ctx.stroke(); }
    ctx.fillStyle = 'rgba(0,0,0,0.75)'; ctx.fillRect(0, 0, W, 22 + probs.length * 18);
    ctx.fillStyle = '#ff5050'; ctx.font = '14px monospace'; ctx.textAlign = 'left'; ctx.direction = 'ltr';
    ctx.fillText(`t=${t.toFixed(2)}`, 8, 16); probs.forEach((p, i) => ctx.fillText(p, 8, 34 + i * 18));
    ctx.restore();
  }
  return probs;
};

// ---------- HUD-only frames (for laying the dialogue box / hook over a Flow clip, see docs/briefs/tools/coldopen_flow.py) ----------
// With window.HUD_ONLY = true (render.cjs sets it when HUD=1), the 3D picture is left out and the frame stays transparent,
// so only the 2D layer (dialogue box, hook text, REWIND...) is drawn. Episodes that paint flashes over the whole frame still show them.
if (window.HUD_ONLY) {
  const _draw = ctx.drawImage.bind(ctx);
  ctx.drawImage = function (src, ...a) { if (src === glCanvas) return; return _draw(src, ...a); };
  vignette = () => {};
}
