// Hand-built stylized characters (code-drawn, no external models). Units: meters, character faces +z, feet at y=0.
import * as THREE from 'three';

const V = (x, y, z) => new THREE.Vector3(x, y, z);
function mat(color, rough = 0.6, metal = 0, extra = {}) { return new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal, ...extra }); }
function mesh(geo, m, parent, x = 0, y = 0, z = 0) { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.castShadow = true; o.receiveShadow = true; parent.add(o); return o; }
function tube(points, r, m, parent, seg = 24) { const c = new THREE.CatmullRomCurve3(points); return mesh(new THREE.TubeGeometry(c, seg, r, 8, false), m, parent); }
function capsuleY(r, len, m, parent, y) { const o = mesh(new THREE.CapsuleGeometry(r, len, 8, 20), m, parent, 0, y, 0); return o; }
// a tapered limb segment from the group origin downward
function limb(r0, r1, len, m, parent) { const g = new THREE.CylinderGeometry(r0, r1, len, 20, 1); g.translate(0, -len / 2, 0); const o = mesh(g, m, parent); const cap = mesh(new THREE.SphereGeometry(r0, 20, 12), m, parent); return o; }
function lathe(profile, m, parent, depth = 0.7, phiStart = 0, phiLen = Math.PI * 2) {
  const g = new THREE.LatheGeometry(profile.map(([r, y]) => new THREE.Vector2(r, y)), 48, phiStart, phiLen);
  g.scale(1, 1, depth); return mesh(g, m, parent);
}
function noiseTex(base, amt, seed = 1, w = 256, lines = false) {
  const c = document.createElement('canvas'); c.width = c.height = w; const g = c.getContext('2d');
  g.fillStyle = base; g.fillRect(0, 0, w, w); let s = seed;
  const r = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
  for (let i = 0; i < w * w / 6; i++) { g.fillStyle = r() < 0.5 ? `rgba(0,0,0,${r() * amt})` : `rgba(255,255,255,${r() * amt * 0.6})`; g.fillRect(r() * w, r() * w, 1 + r() * 2, 1 + r() * 2); }
  if (lines) for (let y = 0; y < w; y += 3) { g.fillStyle = `rgba(0,0,0,${0.08 + r() * 0.05})`; g.fillRect(0, y, w, 1); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
}

function buildHead(o, P) {
  const head = new THREE.Group();
  const skin = P.skinMat;
  // skull + jaw + cheeks
  const skull = mesh(new THREE.SphereGeometry(0.108, 48, 32), skin, head); skull.scale.set(o.faceW ?? 0.93, 1.06, 1.0);
  const jaw = mesh(new THREE.SphereGeometry(0.086, 40, 24), skin, head, 0, -0.058, 0.022); jaw.scale.set(o.jawW ?? 0.98, 0.82, 0.95);
  for (const s of [-1, 1]) { const ck = mesh(new THREE.SphereGeometry(0.034, 20, 14), skin, head, s * 0.045, -0.03, 0.058); ck.scale.set(1, 0.8, 0.75); }
  if (o.chubby) { const dbl = mesh(new THREE.SphereGeometry(0.07, 24, 16), skin, head, 0, -0.105, 0.03); dbl.scale.set(1.15, 0.6, 0.9); }
  // nose
  const bridge = mesh(new THREE.CapsuleGeometry(0.013, 0.04, 6, 12), skin, head, 0, 0.0, 0.103); bridge.rotation.x = 0.32;
  const tip = mesh(new THREE.SphereGeometry(o.noseR ?? 0.02, 20, 14), skin, head, 0, -0.03, 0.117); tip.scale.set(1.15, 0.9, 1);
  for (const s of [-1, 1]) mesh(new THREE.SphereGeometry(0.012, 12, 10), skin, head, s * 0.016, -0.035, 0.106);
  // ears
  for (const s of [-1, 1]) { const e = mesh(new THREE.SphereGeometry(0.028, 16, 12), skin, head, s * 0.1, 0.0, -0.005); e.scale.set(0.4, 1, 0.75); }
  // eyes
  const white = mat(0xece6dc, 0.25), iris = mat(o.iris ?? 0x3a2414, 0.3), pupil = mat(0x050505, 0.2), hl = mat(0xffffff, 0.1, 0, { emissive: 0xffffff, emissiveIntensity: 0.6 });
  P.eyes = [];
  for (const s of [-1, 1]) {
    const eg = new THREE.Group(); eg.position.set(s * 0.036, 0.018, 0.084); head.add(eg);
    mesh(new THREE.SphereGeometry(0.0195, 24, 16), white, eg);
    const ir = mesh(new THREE.CircleGeometry(0.0105, 24), iris, eg, 0, 0, 0.0196); const pu = mesh(new THREE.CircleGeometry(0.005, 20), pupil, eg, 0, 0, 0.0198);
    mesh(new THREE.CircleGeometry(0.0024, 10), hl, eg, 0.0045, 0.0045, 0.0199);
    // eyelids (upper / lower) — skin shells
    const up = mesh(new THREE.SphereGeometry(0.0212, 24, 12, 0, Math.PI * 2, 0, Math.PI * 0.5), skin, eg); up.rotation.x = o.lid ?? 0.12;
    const lo = mesh(new THREE.SphereGeometry(0.021, 24, 12, 0, Math.PI * 2, Math.PI * 0.66, Math.PI * 0.34), skin, eg);
    const ridge = mesh(new THREE.CapsuleGeometry(0.012, 0.03, 6, 12), skin, head, s * 0.036, 0.042, 0.092); ridge.rotation.z = Math.PI / 2; ridge.scale.set(1, 1, 0.7);
    P.eyes.push({ g: eg, up });
  }
  // brows
  P.brows = [];
  for (const s of [-1, 1]) {
    const bg = new THREE.Group(); bg.position.set(s * 0.037, 0.05, 0.103); head.add(bg);
    tube([V(-s * 0.02, -0.004, -0.004), V(0, 0.003, 0.002), V(s * 0.022, -0.002, -0.006)], o.browT ?? 0.0055, P.hairMat, bg, 12);
    P.brows.push({ g: bg, s });
  }
  // mouth
  const lipM = mat(o.lip ?? 0x8a4a3e, 0.45);
  const mouth = new THREE.Group(); mouth.position.set(0, -0.066, 0.106); mouth.scale.set(1.25, 1.2, 1); head.add(mouth);
  const ul = mesh(new THREE.TorusGeometry(0.024, 0.0055, 8, 24, Math.PI), lipM, mouth); ul.rotation.z = Math.PI; ul.scale.set(1, 0.35, 1);
  const llg = new THREE.Group(); mouth.add(llg);
  const ll = mesh(new THREE.TorusGeometry(0.022, 0.0065, 8, 24, Math.PI), lipM, llg); ll.scale.set(1, 0.4, 1); ll.position.y = -0.002;
  const inside = mesh(new THREE.SphereGeometry(0.02, 16, 10), mat(0x200806, 0.8), mouth, 0, -0.004, -0.008); inside.scale.set(1.1, 0.25, 0.4);
  const teeth = mesh(new THREE.BoxGeometry(0.03, 0.006, 0.006), mat(0xe8e0d0, 0.3), mouth, 0, 0.0, -0.002);
  P.mouth = { ll: llg, inside, teeth };
  // mustache
  if (o.mustache) {
    for (const s of [-1, 1]) tube([V(0, -0.043, 0.118), V(s * 0.02, -0.046, 0.114), V(s * 0.038, -0.058, 0.1), V(s * 0.044, -0.075, 0.088)], 0.0085, P.hairMat, head, 16);
  }
  // hair
  if (o.hair === 'crop') {
    const cap = mesh(new THREE.SphereGeometry(0.114, 48, 24, 0, Math.PI * 2, 0, 1.2), P.hairMat, head, 0, 0.012, -0.006); cap.scale.set(0.96, 1.0, 1.04); cap.rotation.x = -0.12;
    const back = mesh(new THREE.SphereGeometry(0.111, 40, 20, 0, Math.PI * 2, 0, 1.9), P.hairMat, head, 0, 0.004, -0.012); back.scale.set(0.95, 1.0, 1.0); back.rotation.x = -1.15; // fade down the back
    // textured fringe: short tapered locks lying forward
    for (let i = 0; i < 11; i++) {
      const x = -0.06 + i * 0.012, lock = mesh(new THREE.ConeGeometry(0.011, 0.05, 8), P.hairMat, head, x, 0.088 - Math.abs(x) * 0.25, 0.07 - Math.abs(x) * 0.35);
      lock.rotation.set(1.95 + (i % 3) * 0.08, 0, x * 2.2);
    }
    const top = mesh(new THREE.SphereGeometry(0.06, 24, 12), P.hairMat, head, 0, 0.1, 0.03); top.scale.set(1.25, 0.4, 1.0); // soft volume
  } else if (o.hair === 'curly') {
    const cap = mesh(new THREE.SphereGeometry(0.112, 40, 20, 0, Math.PI * 2, 0, 1.25), P.hairMat, head, 0, 0.01, -0.006); cap.scale.set(0.98, 1.0, 1.04);
    const curl = new THREE.SphereGeometry(0.017, 10, 8); let s = 7; const r = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
    const inst = new THREE.InstancedMesh(curl, P.hairMat, 260); const m4 = new THREE.Matrix4(); let n = 0;
    for (let i = 0; i < 260; i++) {
      const th = r() * 1.15, ph = r() * Math.PI * 2; const R = 0.118 + r() * 0.006;
      const p = V(Math.sin(th) * Math.cos(ph) * R * 0.98, Math.cos(th) * R + 0.01, Math.sin(th) * Math.sin(ph) * R * 1.04 - 0.006);
      if (p.z > 0.06 && p.y < 0.07) continue;
      m4.compose(p, new THREE.Quaternion(), V(1, 0.8 + r() * 0.4, 1)); inst.setMatrixAt(n++, m4);
    }
    inst.count = n; inst.castShadow = true; head.add(inst);
  }
  return head;
}

function buildHand(m, parent, side) {
  const hand = new THREE.Group(); parent.add(hand);
  const palm = mesh(new THREE.BoxGeometry(0.075, 0.085, 0.028, 2, 2, 2), m, hand, 0, -0.045, 0);
  const fingers = [];
  for (let i = 0; i < 4; i++) {
    const f = new THREE.Group(); f.position.set(-0.027 + i * 0.018, -0.088, 0); hand.add(f);
    const l = 0.038 - Math.abs(i - 1.3) * 0.004; capsuleY(0.0085, l, m, f, -l / 2 - 0.006);
    fingers.push(f);
  }
  const th = new THREE.Group(); th.position.set(side * 0.038, -0.03, 0.012); th.rotation.z = side * 0.6; hand.add(th); capsuleY(0.0095, 0.03, m, th, -0.022);
  return { hand, fingers, thumb: th };
}

export function buildChar(o) {
  const P = {};
  const root = new THREE.Group();
  P.skinMat = mat(o.skin, 0.55, 0, { map: noiseTex('#ffffff', 0.05, 3) }); P.skinMat.color.set(o.skin);
  P.hairMat = mat(o.hairColor ?? 0x0b0908, 0.62, 0, { map: noiseTex('#ffffff', 0.25, 5, 256, true) }); P.hairMat.color.set(o.hairColor ?? 0x0b0908);
  const chubby = o.build === 'chubby';
  const hipsY = o.hipsY ?? 0.96;
  const hips = new THREE.Group(); hips.position.y = hipsY; root.add(hips);
  const spine = new THREE.Group(); hips.add(spine);
  // ---------- torso ----------
  const W = chubby ? 1.22 : 1.0;
  const prof = chubby
    ? [[0.0, -0.05], [0.17, -0.05], [0.2, 0.05], [0.235, 0.17], [0.23, 0.3], [0.21, 0.42], [0.205, 0.5], [0.13, 0.57], [0.0, 0.58]]
    : [[0.0, -0.05], [0.15, -0.05], [0.152, 0.06], [0.142, 0.18], [0.168, 0.34], [0.192, 0.45], [0.2, 0.5], [0.15, 0.555], [0.07, 0.58], [0.0, 0.585]];
  const shirtM = o.inner;
  lathe(prof, shirtM, spine, chubby ? 0.78 : 0.66);
  if (o.outfit === 'jacket') {
    const jp = prof.map(([r, y]) => [r > 0 ? r + 0.014 : 0, y]); jp[0] = [0.0, -0.08]; jp[1] = [0.17, -0.08];
    // open front: leave a gap facing +z
    const gap = 0.42; lathe(jp, o.jacketM, spine, 0.68, Math.PI / 2 + gap / 2 + Math.PI, Math.PI * 2 - gap).rotation.y = 0;
    // zip edges + band collar + quilted shoulder stitch lines
    for (const s of [-1, 1]) { const ze = mesh(new THREE.BoxGeometry(0.008, 0.6, 0.012), mat(0xb9bcc4, 0.3, 1), spine, s * 0.034, 0.22, 0.128); ze.rotation.x = -0.06; }
    const collar = mesh(new THREE.CylinderGeometry(0.07, 0.085, 0.06, 32, 1, true, Math.PI * 0.25, Math.PI * 1.5), o.jacketM, spine, 0, 0.6, -0.005); collar.rotation.y = 0; collar.material.side = THREE.DoubleSide;
    for (const s of [-1, 1]) for (let k = 0; k < 3; k++) mesh(new THREE.BoxGeometry(0.09, 0.004, 0.13), mat(0x0a0a0c, 0.5), spine, s * 0.16, 0.5 - k * 0.025, -0.0);
  }
  if (o.outfit === 'overalls') {
    const bib = mesh(new THREE.BoxGeometry(0.24, 0.26, 0.02), o.overallM, spine, 0, 0.29, (chubby ? 0.183 : 0.13)); bib.rotation.x = -0.12;
    mesh(new THREE.BoxGeometry(0.1, 0.07, 0.006), o.overallM, spine, 0, 0.3, (chubby ? 0.196 : 0.142));
    for (const s of [-1, 1]) { const st = mesh(new THREE.BoxGeometry(0.035, 0.3, 0.01), o.overallM, spine, s * 0.09, 0.42, 0.11); st.rotation.x = -0.35; mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.008, 12), mat(0xb0a070, 0.3, 1), spine, s * 0.09, 0.415, 0.19).rotation.x = Math.PI / 2; }
    // lower part of overalls over the hips
    lathe([[0, -0.12], [0.2 * W, -0.12], [0.21 * W, 0.0], [0.215 * W, 0.12], [0, 0.12]], o.overallM, spine, 0.8);
  }
  // neck + head
  const neckM = o.outfit === 'jacket' ? o.inner : P.skinMat;
  const neck = new THREE.Group(); neck.position.set(0, 0.56, 0.0); spine.add(neck);
  mesh(new THREE.CylinderGeometry(0.052, 0.06, 0.11, 24), o.outfit === 'jacket' ? o.inner : P.skinMat, neck, 0, 0.04, 0);
  if (o.outfit === 'jacket') mesh(new THREE.TorusGeometry(0.058, 0.014, 10, 28), o.inner, neck, 0, 0.0, 0).rotation.x = Math.PI / 2; // turtleneck roll
  const head = buildHead({ ...o, chubby }, P); head.position.set(0, 0.2, 0.012); neck.add(head);
  // ---------- arms ----------
  const arms = [];
  for (const s of [1, -1]) { // +1 = character's left (+x)
    const sh = new THREE.Group(); sh.position.set(s * (chubby ? 0.235 : 0.205), 0.5, -0.005); spine.add(sh);
    const sleeve = o.outfit === 'jacket' ? o.jacketM : o.sleeveM;
    mesh(new THREE.SphereGeometry(chubby ? 0.07 : 0.062, 20, 14), sleeve, sh);
    limb(chubby ? 0.062 : 0.054, chubby ? 0.052 : 0.046, 0.29, sleeve, sh);
    if (o.outfit === 'overalls') { const up = new THREE.Group(); sh.add(up); limb(0.06, 0.055, 0.13, o.sleeveM, up); }
    const el = new THREE.Group(); el.position.y = -0.29; sh.add(el);
    const fore = o.outfit === 'jacket' ? o.jacketM : P.skinMat;
    limb(chubby ? 0.05 : 0.044, chubby ? 0.04 : 0.035, 0.26, fore, el);
    if (o.outfit === 'jacket') mesh(new THREE.TorusGeometry(0.037, 0.008, 8, 20), mat(0x0b0b0d, 0.5), el, 0, -0.25, 0).rotation.x = Math.PI / 2; // cuff
    const wr = new THREE.Group(); wr.position.y = -0.265; el.add(wr);
    const h = buildHand(P.skinMat, wr, s);
    sh.rotation.z = s * 0.08; el.rotation.x = -0.15;
    arms.push({ s, sh, el, wr, ...h });
  }
  // ---------- legs ----------
  const legs = [];
  for (const s of [1, -1]) {
    const hp = new THREE.Group(); hp.position.set(s * (chubby ? 0.11 : 0.09), 0, 0); hips.add(hp);
    limb(chubby ? 0.095 : 0.075, chubby ? 0.07 : 0.06, 0.46, o.pantsM, hp);
    const kn = new THREE.Group(); kn.position.y = -0.46; hp.add(kn);
    limb(chubby ? 0.068 : 0.058, chubby ? 0.055 : 0.046, 0.45, o.pantsM, kn);
    const an = new THREE.Group(); an.position.y = -0.46; kn.add(an);
    const shoe = mesh(new THREE.BoxGeometry(0.1, 0.075, 0.27, 2, 2, 2), o.shoeM, an, 0, -0.03, 0.05);
    const toe = mesh(new THREE.SphereGeometry(0.052, 16, 10), o.shoeM, an, 0, -0.035, 0.17); toe.scale.set(0.95, 0.7, 1);
    legs.push({ s, hp, kn, an });
  }
  // fix overall height so feet rest at y=0
  const P2 = { root, hips, spine, neck, head, arms, legs, ...P };
  P2.setFace = (f) => {
    const open = f.open ?? 0; P.mouth.ll.position.y = -open * 0.018; P.mouth.inside.scale.y = 0.25 + open * 1.6; P.mouth.teeth.visible = open > 0.15;
    for (const b of P.brows) { b.g.position.y = 0.052 + (f.brow ?? 0) * 0.01; b.g.rotation.z = b.s * (f.browTilt ?? 0); }
    for (const e of P.eyes) e.up.rotation.x = f.lid ?? (o.lid ?? 0.12);
  };
  P2.setFace({});
  return P2;
}
