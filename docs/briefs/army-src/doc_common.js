// ---------- shared documentary toolkit («حصلت إزاي؟») ----------
const NARR = LINES.filter(l => l.s === 'anno'), DL = LINES.filter(l => l.s === 'dad'), OL = LINES.filter(l => l.s !== 'anno' && l.s !== 'dad');
const NX = (i) => NARR[i - 1], DX = (i) => DL[i - 1], OX2 = (i) => OL[i - 1];
camera.far = 1500;
const hemi = new THREE.HemisphereLight(0xbfd8ff, 0x3a3020, 0); scene.add(hemi);
const sun = new THREE.DirectionalLight(0xffffff, 0); scene.add(sun); scene.add(sun.target);
function fixedLight(ref, sky, ground, hi, sunCol, si, bg, fogCol, f0, f1) {
  hemi.color.setHex(sky); hemi.groundColor.setHex(ground); hemi.intensity = hi; sun.color.setHex(sunCol); sun.intensity = si; sun.position.copy(ref).add(V(-60, 80, 40)); sun.target.position.copy(ref);
  scene.background = new THREE.Color(bg); scene.fog = fogCol == null ? null : new THREE.Fog(fogCol, f0, f1);
  ambient.intensity = 0; moon.intensity = 0; fill.intensity = 0; tvLight.intensity = 0; balcLight.intensity = 0; bathLight.intensity = 0; kitLight.intensity = 0; hallLight.intensity = 0; roomLight.intensity = 0;
}
function homeLight() { scene.background = new THREE.Color(0x101010); scene.fog = null; hemi.intensity = 0; sun.intensity = 0; ambient.intensity = 0.6; moon.intensity = 0.3; fill.intensity = 0; tvLight.intensity = 0; balcLight.intensity = 0; bathLight.intensity = 0; kitLight.intensity = 0; hallLight.intensity = 0; roomLight.position.set(0, 2.8, 1.0); roomLight.intensity = 1.4; }
// a person in the cast style (makeChar): big head, painted face, mitten hands
function makePerson(parent, o) {
  const skin = o.skin || [0xc8946a, 0xb98058, 0xd8a878, 0xa87048][(o.seed || 0) % 4];
  const tex = o.coatTex || canvasTex(16, 16, (g) => { g.fillStyle = '#' + (o.coat || 0x2a3a5a).toString(16).padStart(6, '0'); g.fillRect(0, 0, 16, 16); if (o.buttons !== false) { g.fillStyle = 'rgba(255,255,255,0.35)'; for (let i = 0; i < 3; i++) g.fillRect(7, 3 + i * 4, 2, 2); } });
  return makeChar({ seed: 300 + (o.seed || 0), skin, hipY: o.hipY || 0.84, legX: 0.11, legColor: o.legs || 0x2a2a30, shoe: o.shoe || 0x111111, hand: o.hand || skin,
    torsoGeo: cyl(o.w || 0.25, (o.w || 0.25) + 0.02, 0.64, 6), torsoTex: tex, torsoColor: 0xffffff, torsoY: 0.32, skirt: o.skirt || null,
    sleeve: true, sleeveColor: o.sleeve || o.coat || 0x2a3a5a, shoulderX: (o.w || 0.25) + 0.06, shoulderY: 0.57, neckY: 0.64, headR: 0.27,
    build(head, torso, reg) { if (o.hat) o.hat(head, torso, reg); return {}; } }, parent);
}
// overlay pass: pop-in characters are drawn as their own layer over the frozen frame (never cut into the set)
const overlay = new THREE.Scene(); overlay.add(new THREE.HemisphereLight(0xfff4e8, 0x504030, 1.0)); { const d = new THREE.DirectionalLight(0xffffff, 0.8); d.position.set(2, 4, 3); overlay.add(d); overlay.add(d.target); }
function renderOverlay(list) { const parents = list.map(c => c.root.parent); list.forEach(c => { overlay.add(c.root); c.root.visible = true; }); renderer.autoClear = false; renderer.clearDepth(); renderer.render(overlay, camera); renderer.autoClear = true; list.forEach((c, i) => parents[i].add(c.root)); }
function placeInFront(c, t, a, b, side, dist = 2.4, drop = -1.55) {
  const f = camera.getWorldDirection(V(0, 0, 0)); const r = V().crossVectors(f, V(0, 1, 0)).normalize();
  const kin = easeBack(seg(t, a, a + 0.45)), kout = easeIn(seg(t, b - 0.35, b));
  const slide = side + (1 - kin) * 2.6 * Math.sign(side || 1) + kout * -3.0; const hop = Math.abs(Math.sin(seg(t, a, a + 0.45) * Math.PI)) * 0.5 + kout * 1.2;
  c.root.position.copy(camera.position.clone().add(f.clone().multiplyScalar(dist)).add(r.multiplyScalar(slide)).add(V(0, drop + hop, 0)));
  c.root.rotation.set(0, Math.atan2(-f.x, -f.z) - side * 0.25, 0);
}
function drawPause(h) { h.save(); h.fillStyle = 'rgba(10,10,30,0.85)'; h.fillRect(W / 2 - 90, 40, 180, 50); h.strokeStyle = '#ffe14a'; h.lineWidth = 2; h.strokeRect(W / 2 - 90, 40, 180, 50); h.fillStyle = '#ffe14a'; h.fillRect(W / 2 - 70, 52, 8, 26); h.fillRect(W / 2 - 56, 52, 8, 26); pxText(h, 'PAUSE', W / 2 + 16, 54, 16, '#ffe14a', 'center'); h.restore(); }
function wrapAr(g, s, size, maxW) { g.font = `${size}px Lalezar`; const w = s.split(' '); const out = []; let cur = ''; for (const x of w) { const c = cur ? cur + ' ' + x : x; if (g.measureText(c).width > maxW && cur) { out.push(cur); cur = x; } else cur = c; } if (cur) out.push(cur); return out; }
function drawSub(g, t) {
  const l = LINES.find(l => l.s === 'anno' && t >= l.t0 - 0.05 && t < l.t1 + 0.3); if (!l || !l.ar) return;
  const a = Math.min(1, (t - l.t0 + 0.05) / 0.25, (l.t1 + 0.3 - t) / 0.25); g.save(); g.globalAlpha = a; const lines = wrapAr(g, l.ar, 26, W - 70); const hh = 20 + lines.length * 38;
  g.fillStyle = 'rgba(0,0,0,0.6)'; g.fillRect(20, H - 70 - hh, W - 40, hh); lines.forEach((s, i) => arText(g, s, W / 2, H - 70 - hh + 6 + i * 38, 26, '#fff', 'center')); g.restore();
}
function drawTitleCard(g, t, e, title, sub) { if (t > e) return; const a = Math.min(1, t / 0.6, (e - t) / 0.5); g.save(); g.globalAlpha = a; g.fillStyle = 'rgba(0,0,0,0.55)'; g.fillRect(0, 90, W, 130); arText(g, title, W / 2, 96, 36, '#fff', 'center', 'ReemKufi'); arText(g, sub, W / 2, 152, 24, '#ffd890', 'center'); g.restore(); }
function drawTags(g, t, tags) { for (const [a, ar, en] of tags) { if (!inT(t, a, a + 2.6)) continue; const al = Math.min(1, (t - a) / 0.4, (a + 2.6 - t) / 0.4); g.save(); g.globalAlpha = al; g.fillStyle = 'rgba(0,0,0,0.55)'; g.fillRect(0, 70, W, 70); arText(g, ar, W / 2, 70, 30, '#ffe8b0', 'center', 'ReemKufi'); pxText(g, en, W / 2, 114, 10, '#ddd', 'center', false); g.restore(); } }
function drawCTAbox(g, t, a, l1, l2) { if (t < a || t >= DUR - 0.8) return; const k = easeBack(seg(t, a, a + 0.3)); g.save(); g.translate(W / 2, 140); g.scale(k, k); g.fillStyle = 'rgba(255,255,255,0.96)'; g.fillRect(-250, -54, 500, 108); g.fillStyle = '#d8231b'; g.fillRect(-250, 48, 500, 6); arText(g, l1, 0, -56, 32, '#111', 'center'); arText(g, l2, 0, -14, 30, '#d8231b', 'center'); g.restore(); }
for (const c of [mom, son, samir]) c.root.visible = false; scene.add(samir.root);
