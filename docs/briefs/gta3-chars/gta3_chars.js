// ---------- characters (GTA3-era look) ----------
// Drop-in replacement for engine8's character block (faceCache / drawFace / faceTexture / makeChar).
// Same returned interface as makeChar, so every episode's poses, setFace() calls and cfg.build extras keep working.
// Look: human proportions (smaller head on a neck), smooth-shaded tapered limbs, oval sculpted torso, mitten hands,
// and a painted semi-realistic face (eyes with iris + lids, nose shading, lips, stubble) wrapped on the skull.
const GTA_HS = 0.5;          // head scale vs the cartoon rig
const GTA_FACE_K = 0.42;     // faceCam distance multiplier (smaller heads)
const faceCache = new Map();
function drawFace(g, s, eyes, mouth, opts = {}) {
  const u = s / 128;
  g.save(); g.scale(u, u);
  const E = (x, y, rx, ry, c, rot = 0) => { g.fillStyle = c; g.beginPath(); g.ellipse(x, y, Math.max(0.1, rx), Math.max(0.1, ry), rot, 0, 7); g.fill(); };
  const line = (pts, c, w) => { g.strokeStyle = c; g.lineWidth = w; g.lineCap = 'round'; g.lineJoin = 'round'; g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.stroke(); };
  const quad = (a, c, b, col, w) => { g.strokeStyle = col; g.lineWidth = w; g.lineCap = 'round'; g.beginPath(); g.moveTo(a[0], a[1]); g.quadraticCurveTo(c[0], c[1], b[0], b[1]); g.stroke(); };
  const soot = opts.soot;
  const browC = soot ? '#3a3a3a' : (opts.browColor || '#1c110a');
  const stub = opts.fuzz || opts.stache || opts.beard;
  // --- soft modelling: eye sockets, cheek shade, nose ---
  const rg = (x, y, r, c) => { const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, c); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2); };
  g.translate(64, 70); g.scale(0.82, 0.82); g.translate(-64, -70);
  rg(47, 55, 12, 'rgba(60,30,15,0.3)'); rg(81, 55, 12, 'rgba(60,30,15,0.3)');
  if (opts.red) { g.fillStyle = 'rgba(220,30,20,0.35)'; g.fillRect(0, 0, 128, 128); }
  if (opts.blush) { rg(38, 76, 12, 'rgba(255,80,80,0.45)'); rg(90, 76, 12, 'rgba(255,80,80,0.45)'); }
  // stubble / five o'clock shadow
  if (stub && opts.beard) {
    const r = rng(77); g.fillStyle = 'rgba(25,15,10,0.13)';
    g.beginPath(); g.moveTo(24, 82); g.quadraticCurveTo(30, 122, 64, 126); g.quadraticCurveTo(98, 122, 104, 82); g.quadraticCurveTo(90, 100, 64, 104); g.quadraticCurveTo(38, 100, 24, 82); g.fill();
    g.beginPath(); g.ellipse(64, 88, 16, 5, 0, 0, 7); g.fill();
    for (let i = 0; i < 260; i++) { const x = 26 + r() * 76, y = 84 + r() * 40; if (Math.abs(x - 64) / 40 + (y - 84) / 44 > 1.25) continue; g.fillStyle = `rgba(20,12,8,${0.15 + r() * 0.2})`; g.fillRect(x, y, 1, 1); }
  }
  if (opts.beard) { g.fillStyle = 'rgba(30,20,14,0.85)'; g.beginPath(); g.moveTo(22, 76); g.quadraticCurveTo(26, 124, 64, 128); g.quadraticCurveTo(102, 124, 106, 76); g.lineTo(98, 78); g.quadraticCurveTo(92, 104, 64, 106); g.quadraticCurveTo(36, 104, 30, 78); g.fill(); }
  // --- nose ---
  quad([58, 58], [56, 74], [57, 80], 'rgba(70,32,16,0.35)', 2);
  quad([57, 81], [64, 86], [71, 81], 'rgba(70,32,16,0.45)', 2.2);
  E(58.5, 82, 2.6, 1.5, 'rgba(40,14,6,0.7)'); E(69.5, 82, 2.6, 1.5, 'rgba(40,14,6,0.7)');
  quad([50, 84], [46, 92], [48, 100], 'rgba(70,32,16,0.25)', 1.6); quad([78, 84], [82, 92], [80, 100], 'rgba(70,32,16,0.25)', 1.6);
  // --- eyes ---
  const eye = (cx, side) => {
    let h = 4.6, w = 8, irisDx = 0, irisDy = 0, lidDrop = 0, browY = 43, browTilt = 0, browLift = 0, pupilR = 1.8, sparkle = false;
    switch (eyes) {
      case 'wide': h = 8.5; browLift = 6; break;
      case 'pin': h = 8.5; browLift = 7; pupilR = 0.7; browTilt = side * 0.12; break;
      case 'sparkle': h = 7.5; browLift = 4; sparkle = true; break;
      case 'angry': h = 4.2; browTilt = side * 0.38; browY = 46; break;
      case 'menace': h = 3.6; browTilt = side * 0.45; browY = 47; irisDx = side * 0.5; break;
      case 'sad': case 'tears': h = 5.2; browTilt = -side * 0.35; browLift = 2; irisDy = 1; break;
      case 'smug': h = 3.8; lidDrop = 0.5; browLift = side > 0 ? 4 : -1; irisDx = 2; break;
      case 'tired': h = 3.4; lidDrop = 0.6; browY = 45; break;
      case 'side': irisDx = 4; browLift = side > 0 ? 2 : 0; break;
      case 'flat': h = 1.4; browY = 46; break;
      default: break;
    }
    const by = browY - browLift;
    // brow: thick, tapered
    g.save(); g.translate(cx, by); g.rotate(browTilt); g.fillStyle = browC; g.beginPath();
    g.moveTo(-11 * -side, 2); g.quadraticCurveTo(0, -3.5, 11 * -side, 0.5); g.quadraticCurveTo(0, 0.2, -11 * -side, 4.2); g.fill(); g.restore();
    if (eyes === 'closed') { quad([cx - w, 55], [cx, 59], [cx + w, 55], '#2a1610', 1.8); return; }
    if (eyes === 'x') { line([[cx - 6, 50], [cx + 6, 60]], '#1a0c08', 2.4); line([[cx + 6, 50], [cx - 6, 60]], '#1a0c08', 2.4); return; }
    if (eyes === 'dizzy') { g.strokeStyle = '#1a0c08'; g.lineWidth = 1.4; g.beginPath(); for (let a = 0; a < 14; a += 0.3) g.lineTo(cx + Math.cos(a) * a * 0.55, 55 + Math.sin(a) * a * 0.45); g.stroke(); return; }
    const ey = 55;
    // almond white
    g.save(); g.beginPath(); g.moveTo(cx - w, ey); g.quadraticCurveTo(cx, ey - h * 1.25, cx + w, ey); g.quadraticCurveTo(cx, ey + h * 0.9, cx - w, ey); g.closePath();
    g.fillStyle = soot ? '#ffffff' : '#d9cfc0'; g.fill(); g.clip();
    if (!soot) {
      E(cx + irisDx, ey + irisDy, 4.1, 4.1, '#3d2513'); E(cx + irisDx, ey + irisDy, 2.6, 2.6, '#26160b');
      E(cx + irisDx, ey + irisDy, pupilR, pupilR, '#070403'); E(cx + irisDx + 1.4, ey + irisDy - 1.4, 1.0, 1.0, 'rgba(255,255,255,0.9)');
      if (sparkle) { E(cx + irisDx - 1.6, ey + irisDy + 1.4, 0.8, 0.8, '#fff'); }
      if (lidDrop) { g.fillStyle = 'rgba(120,70,45,0.95)'; g.fillRect(cx - w, ey - h * 1.3, w * 2, h * 1.3 * lidDrop + 1.5); }
    }
    g.restore();
    // lids
    quad([cx - w - 0.5, ey + 0.3], [cx, ey - h * 1.3], [cx + w + 0.5, ey + 0.3], '#1a0d08', 1.9);
    quad([cx - w + 1, ey + 0.8], [cx, ey + h * 1.0], [cx + w - 1, ey + 0.8], 'rgba(60,30,18,0.45)', 1);
    quad([cx - w + 1, ey - h * 1.25 - 2.5], [cx, ey - h * 1.6 - 3], [cx + w - 1, ey - h * 1.25 - 2.5], 'rgba(70,35,18,0.3)', 1.1); // crease
    if (eyes === 'tired') quad([cx - w + 2, ey + 5], [cx, ey + 8], [cx + w - 2, ey + 5], 'rgba(90,50,80,0.45)', 1.6);
    if (eyes === 'tears') { g.fillStyle = 'rgba(120,200,255,0.75)'; g.fillRect(cx - 1 + side * 3, ey + 4, 2.4, 22); }
  };
  eye(47, -1); eye(81, 1);
  if (opts.glasses) { g.strokeStyle = '#2a2a2a'; g.lineWidth = 1.6; g.strokeRect(35, 47, 24, 16); g.strokeRect(69, 47, 24, 16); line([[59, 53], [69, 53]], '#2a2a2a', 1.6); }
  // --- mouth ---
  const my = 97, lip = 'rgba(122,52,40,0.85)', dark = '#2a0a08', teeth = '#f1ece0';
  const open = (w, h, tooth = true, tongue = false) => {
    g.save(); g.beginPath(); g.ellipse(64, my + h * 0.35, w, h, 0, 0, 7); g.fillStyle = dark; g.fill(); g.clip();
    if (tooth) { g.fillStyle = teeth; g.fillRect(64 - w, my + h * 0.35 - h - 1, w * 2, Math.max(2.5, h * 0.42)); }
    if (tongue) E(64, my + h * 1.0, w * 0.65, h * 0.45, '#b34a55');
    g.restore();
    g.strokeStyle = lip; g.lineWidth = 2.2; g.beginPath(); g.ellipse(64, my + h * 0.35, w + 0.6, h + 0.6, 0, 0, 7); g.stroke();
  };
  switch (mouth) {
    case 'talk1': open(7, 3); break;
    case 'talk2': open(9, 6, true, true); break;
    case 'scream': open(12, 11, true, true); break;
    case 'o': open(4.5, 4.5, false); break;
    case 'grin': g.save(); g.beginPath(); g.moveTo(48, my - 1); g.quadraticCurveTo(64, my + 14, 80, my - 1); g.quadraticCurveTo(64, my + 3, 48, my - 1); g.fillStyle = dark; g.fill(); g.clip(); g.fillStyle = teeth; g.fillRect(48, my - 2, 32, 5); g.restore(); quad([47, my - 2], [64, my + 15], [81, my - 2], lip, 2); quad([45, my - 4], [47, my - 1], [49, my - 1], 'rgba(70,32,16,0.5)', 1.4); quad([83, my - 4], [81, my - 1], [79, my - 1], 'rgba(70,32,16,0.5)', 1.4); break;
    case 'fakegrin': case 'clench': g.fillStyle = teeth; g.fillRect(50, my - 1, 28, 6); line([[50, my + 2], [78, my + 2]], '#a8a090', 0.8); for (let x = 54; x < 78; x += 4) line([[x, my - 1], [x, my + 5]], '#b8b0a0', 0.6); g.strokeStyle = lip; g.lineWidth = 2; g.strokeRect(49.5, my - 1.5, 29, 7); break;
    case 'smile': quad([51, my], [64, my + 6], [77, my], lip, 2.6); quad([49, my - 2], [50, my], [52, my + 0.5], 'rgba(70,32,16,0.5)', 1.3); quad([79, my - 2], [78, my], [76, my + 0.5], 'rgba(70,32,16,0.5)', 1.3); break;
    case 'evil': quad([52, my + 1], [66, my + 4], [79, my - 3], lip, 2.6); break;
    case 'frown': quad([52, my + 4], [64, my - 2], [76, my + 4], lip, 2.6); break;
    case 'flat': line([[53, my + 1], [75, my + 1]], lip, 2.4); break;
    case 'wobble': line([[51, my + 1], [55, my - 1], [59, my + 2], [64, my - 1], [69, my + 2], [73, my - 1], [77, my + 1]], lip, 2.2); break;
    case 'tongue': open(8, 4, false); E(68, my + 5, 4, 5, '#c0505e'); break;
    default: quad([53, my + 1], [64, my + 2.4], [75, my + 1], lip, 2.4); E(64, my + 4.2, 6, 1.6, 'rgba(150,70,55,0.35)');
  }
  // --- moustache (drawn over the upper lip) ---
  if (opts.stache) {
    const c = opts.stacheColor || '#1a1008';
    g.fillStyle = c; g.beginPath(); g.moveTo(64, my - 9); g.quadraticCurveTo(52, my - 11, 45, my - 2); g.quadraticCurveTo(44, my + 2, 47, my + 1); g.quadraticCurveTo(55, my - 4, 64, my - 3);
    g.quadraticCurveTo(73, my - 4, 81, my + 1); g.quadraticCurveTo(84, my + 2, 83, my - 2); g.quadraticCurveTo(76, my - 11, 64, my - 9); g.fill();
    const r = rng(5); g.strokeStyle = 'rgba(255,255,255,0.12)'; g.lineWidth = 0.6; for (let i = 0; i < 14; i++) { const x = 48 + r() * 32; line([[x, my - 8 + r() * 2], [x + (x < 64 ? -2 : 2), my - 2]], 'rgba(255,255,255,0.12)', 0.6); }
  }
  g.restore();
}
function faceTexture(eyes, mouth, opts) {
  const k = eyes + '|' + mouth + '|' + JSON.stringify(opts || {});
  if (!faceCache.has(k)) {
    const t = canvasTex(128, 128, (g, s) => drawFace(g, s, eyes, mouth, opts || {}));
    t.magFilter = THREE.LinearFilter; t.minFilter = THREE.LinearMipmapLinearFilter; t.generateMipmaps = true; t.anisotropy = 4;
    t.userData.key = [eyes, mouth, opts || {}]; faceCache.set(k, t);
  }
  return faceCache.get(k);
}
// smooth-shaded material for the new bodies
const SM = (color, o = {}) => new THREE.MeshLambertMaterial({ color, ...o });
// subtle cloth texture from a flat colour: weave noise + soft folds, bilinear filtered
const gtaClothCache = new Map();
function gtaCloth(hex, kind = 'cotton') {
  const k = hex + kind; if (gtaClothCache.has(k)) return gtaClothCache.get(k);
  const col = new THREE.Color(hex); const r = rng((hex & 0xffff) + kind.length);
  const t = canvasTex(64, 64, (g) => {
    g.fillStyle = '#' + col.getHexString(); g.fillRect(0, 0, 64, 64);
    for (let i = 0; i < 900; i++) { const v = r(); g.fillStyle = v > 0.5 ? `rgba(255,255,255,${0.03 + r() * 0.04})` : `rgba(0,0,0,${0.04 + r() * 0.06})`; g.fillRect(r() * 64 | 0, r() * 64 | 0, 1 + (r() * 2 | 0), 1); }
    if (kind === 'denim') { for (let y = 0; y < 64; y += 2) { g.fillStyle = 'rgba(255,255,255,0.05)'; g.fillRect(0, y, 64, 1); } }
    for (let i = 0; i < 5; i++) { const x = r() * 64; const gr = g.createLinearGradient(x - 5, 0, x + 5, 0); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(0.5, 'rgba(0,0,0,0.12)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(x - 5, 0, 10, 64); }
  });
  t.magFilter = THREE.LinearFilter; t.minFilter = THREE.LinearFilter; t.wrapS = t.wrapT = THREE.RepeatWrapping;
  gtaClothCache.set(k, t); return t;
}
const gtaSoft = (tex) => { if (tex && !tex.userData.gtaSoft) { tex.magFilter = THREE.LinearFilter; tex.minFilter = THREE.LinearFilter; tex.needsUpdate = true; tex.userData.gtaSoft = true; } return tex; };
function gtaTorsoGeo(geo) {
  const p = geo.parameters || {}; const rt = p.radiusTop ?? 0.25, rb = p.radiusBottom ?? 0.27, h = p.height ?? 0.64;
  const big = rb > 0.4; // dresses / heavy builds
  const pts = [
    [rb * 0.98, -h / 2], [rb * 1.0, -h / 2 + 0.06], [Math.max(rb * 0.9, rt * 0.86), -h / 2 + h * 0.3],
    [rt * (big ? 1.0 : 0.92), -h / 2 + h * 0.5], [rt * 1.06, -h / 2 + h * 0.74], [rt * 1.0, h / 2 - 0.07],
    [rt * 0.78, h / 2 - 0.015], [0.1, h / 2 + 0.02], [0.0, h / 2 + 0.025]
  ].map(([x, y]) => new THREE.Vector2(x, y));
  const g = new THREE.LatheGeometry(pts, 8); g.rotateY(Math.PI / 8); g.scale(1.06, 1, 0.62); return g;
}
// painted hair/skin per cast member (keyed by cfg.seed); hair is texture, not geometry
const GTA_LOOK = { 5: { hair: 'sides', hc: '#1b1410', stub: 1 }, 61: { hair: 'short', hc: '#1a120c', stub: 0.6 }, 81: { hair: 'sides', hc: '#2a1a10', stub: 1.2 },
  91: { hair: 'curly', hc: '#120c08', stub: 0.8 }, 71: { hair: 'short', hc: '#0c0a09', stub: 0 }, 21: { hair: 'sides', hc: '#dedad2', stub: 0.5, stubC: '200,200,195' },
  3: { hair: 'none' }, 9: { hair: 'curly', hc: '#17110c', stub: 0 } };
function gtaHeadTex(skinHex, look) {
  const sk = new THREE.Color(skinHex); const r = rng(11);
  const t = canvasTex(256, 128, (g) => {
    g.fillStyle = '#' + sk.getHexString(); g.fillRect(0, 0, 256, 128);
    for (let i = 0; i < 2500; i++) { g.fillStyle = r() > .5 ? 'rgba(255,220,190,0.05)' : 'rgba(90,40,20,0.06)'; g.fillRect(r() * 256, r() * 128, 2, 2); }
    const sh = g.createLinearGradient(0, 70, 0, 128); sh.addColorStop(0, 'rgba(60,25,10,0)'); sh.addColorStop(1, 'rgba(60,25,10,0.45)'); g.fillStyle = sh; g.fillRect(0, 70, 256, 58);
    // front is u = 0.25 (x 64), back u = 0.75 (x 192), ears at x 0/128/256
    const hc = look.hc || '#111';
    const hairBlob = (pts) => { g.fillStyle = hc; g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.closePath(); g.fill(); };
    if (look.hair === 'short' || look.hair === 'curly') {
      hairBlob([[-2, 0], [258, 0], [258, 70], [200, 74], [150, 62], [132, 58], [124, 44], [100, 40], [64, 34], [28, 40], [4, 44], [-4, 58]]);
      g.fillRect(118, 40, 8, 26); g.fillRect(2, 40, 8, 26); // sideburns
      for (let i = 0; i < 900; i++) { const x = r() * 256, y = r() * 72; g.fillStyle = look.hair === 'curly' ? `rgba(255,255,255,${r() * 0.12})` : `rgba(255,255,255,${r() * 0.06})`; g.fillRect(x, y, look.hair === 'curly' ? 3 : 1, look.hair === 'curly' ? 2 : 3); }
    } else if (look.hair === 'sides') {
      hairBlob([[118, 36], [140, 30], [192, 34], [244, 30], [262, 36], [262, 70], [200, 76], [140, 66], [122, 62]]);
      hairBlob([[-6, 36], [8, 34], [12, 62], [-6, 66]]);
      const gl = g.createRadialGradient(64, 10, 2, 64, 10, 60); gl.addColorStop(0, 'rgba(255,255,255,0.18)'); gl.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gl; g.fillRect(0, 0, 256, 60); // shiny scalp
    }
    if (look.stub) { const c = look.stubC || '25,15,10'; for (let i = 0; i < 1800 * look.stub; i++) { const x = 30 + r() * 68, y = 78 + r() * 40; if (Math.abs(x - 64) > 30 + (y - 78) * 0.2) continue; g.fillStyle = `rgba(${c},${0.12 + r() * 0.22})`; g.fillRect(x, y, 1, 1); } }
  });
  t.magFilter = THREE.LinearFilter; t.minFilter = THREE.LinearFilter; return t;
}
function gtaLimb(r0, r1, len, seg = 7) { const g = new THREE.CylinderGeometry(r0, r1, len, seg, 3); return g; }

// ---- photo-sourced look (how early-2000s games did it): a frontal face photo projected on the low-poly skull,
// photographed fabrics on the body, skin tone sampled from the face photo. Files live in build/gta/.
const GTA_PHOTO = {
  5: { face: 'ibrahim_face', mouthY: 0.735, top: 'undershirt', legs: 'pajama' },
  61: { face: 'bastam_face', mouthY: 0.72, top: 'coverall_blue', legs: 'coverall_blue', sleeve: 'coverall_blue' },
  81: { face: 'asly_face', mouthY: 0.69, top: 'coverall_grey', legs: 'coverall_grey', sleeve: 'coverall_grey' },
  91: { face: 'gazzar_face', mouthY: 0.70, top: 'olive_shirt', legs: 'work_pants', sleeve: 'olive_shirt', belt: 1 },
  71: { face: 'alamy_face', mouthY: 0.74, top: 'leather', legs: 'coverall_grey', sleeve: 'leather', belt: 1 },
  21: { face: 'samir_face', mouthY: 0.72, top: 'galabiya', legs: 'galabiya', sleeve: 'galabiya' },
};
const GTA_LOADS = []; const gtaTexCache = new Map();
function gtaPhotoTex(name, rep, onImg) {
  const k = name + (rep ? rep.join('x') : ''); if (gtaTexCache.has(k) && !onImg) return gtaTexCache.get(k);
  let res; GTA_LOADS.push(new Promise(r => res = r));
  const t = new THREE.TextureLoader().load('gta/' + name + '.png', (tx) => { if (onImg) onImg(tx.image); res(); }, undefined, () => res());
  t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  if (rep) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep[0], rep[1]); }
  gtaTexCache.set(k, t); return t;
}
window.GTA_READY = () => Promise.all(GTA_LOADS);
// mouth-only overlay in face-photo coordinates (GTA-era heads had no facial rig; we only open the mouth when talking)
const photoOverlayCache = new Map();
function photoOverlay(eyes, mouth, opts, my) {
  const k = [eyes, mouth, my, opts && opts.red].join('|'); if (photoOverlayCache.has(k)) return photoOverlayCache.get(k);
  const t = canvasTex(256, 256, (g) => {
    const cx = 128, cy = my * 256;
    const open = { talk1: [11, 4], talk2: [14, 8], scream: [18, 15], o: [7, 7], grin: [18, 5], tongue: [12, 6] }[mouth];
    if (open) { g.fillStyle = '#2a0c0a'; g.beginPath(); g.ellipse(cx, cy + open[1] * 0.3, open[0], open[1], 0, 0, 7); g.fill();
      g.fillStyle = 'rgba(235,228,214,0.95)'; g.beginPath(); g.ellipse(cx, cy - open[1] * 0.45, open[0] * 0.8, Math.max(2, open[1] * 0.28), 0, 0, 7); g.fill();
      g.strokeStyle = 'rgba(110,50,45,0.8)'; g.lineWidth = 3; g.beginPath(); g.ellipse(cx, cy + open[1] * 0.3, open[0] + 1, open[1] + 1, 0, 0, 7); g.stroke(); }
    if (eyes === 'closed' || eyes === 'x') { /* blink: handled by skin-coloured lids would need per-face colour; skipped */ }
    if (opts && opts.red) { g.fillStyle = 'rgba(220,30,20,0.3)'; g.fillRect(40, 40, 176, 200); }
  });
  t.magFilter = THREE.LinearFilter; t.minFilter = THREE.LinearFilter; photoOverlayCache.set(k, t); return t;
}
function planarFaceUV(geo, R) { // project the frontal photo; the back of the head reuses the side-hair columns
  const p = geo.attributes.position, uv = geo.attributes.uv;
  for (let i = 0; i < p.count; i++) { const x = p.getX(i) / R, y = p.getY(i) / R, z = p.getZ(i) / R;
    let u = 0.5 + 0.3 * x, v = 0.47 - 0.42 * y; if (z < -0.1) { u = 0.5 + Math.sign(x || 1) * (0.27 - 0.05 * Math.min(1, -z)); if (y < -0.2) { u = 0.5 + Math.sign(x || 1) * 0.2; v = 0.86; } }
    uv.setXY(i, clamp(u, 0.02, 0.98), 1 - clamp(v, 0.02, 0.98)); }
  uv.needsUpdate = true; return geo;
}
// ---------- anatomical lofts (cross-sections like a box-modelled game character, not primitives) ----------
// sections: [{ y, w, d, f = front depth mult, b = back depth mult, ox, oz }] along y; super-ellipse rings.
function loft(sections, seg = 16, n = 2.4, capTop = false, capBot = false) {
  const pos = [], uv = [], idx = []; const R = sections.length;
  const pw = 2 / n;
  sections.forEach((s, j) => {
    for (let i = 0; i <= seg; i++) {
      const a = i / seg * Math.PI * 2 + Math.PI / 2; const c = Math.cos(a), sn = Math.sin(a);
      const x = (s.ox || 0) + s.w * Math.sign(c) * Math.pow(Math.abs(c), pw);
      const zd = sn > 0 ? s.d * (s.f ?? 1) : s.d * (s.b ?? 1);
      const z = (s.oz || 0) + zd * Math.sign(sn) * Math.pow(Math.abs(sn), pw);
      pos.push(x, s.y, z); uv.push(i / seg, 1 - j / (R - 1));
    }
  });
  for (let j = 0; j < R - 1; j++) for (let i = 0; i < seg; i++) { const a = j * (seg + 1) + i, b = a + seg + 1; idx.push(a, b, a + 1, b, b + 1, a + 1); }
  const cap = (j, top) => { const s = sections[j]; const c = pos.length / 3; pos.push(s.ox || 0, s.y, s.oz || 0); uv.push(0.5, top ? 1 : 0); for (let i = 0; i < seg; i++) { const a = j * (seg + 1) + i; if (top) idx.push(c, a + 1, a); else idx.push(c, a, a + 1); } };
  if (capTop) cap(0, true); if (capBot) cap(R - 1, false);
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx);
  g.computeVertexNormals(); return g;
}
// --- the head: a sculpted skull in "R units" (cranium radius 1), front = +z. Landmarks shared with the photo projection.
const HEAD_LM = { eyeY: -0.22, chinY: -1.45, crownY: 1.0, halfW: 0.8 };
const gauss = (dx, dy, r) => Math.exp(-(dx * dx + dy * dy) / (r * r));
function sculptHead(R, rad = 1, ws = 14, hs = 12) {
  const g = new THREE.SphereGeometry(1, ws, hs); const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    let x = p.getX(i), y = p.getY(i), z = p.getZ(i);
    x *= 0.8; z *= 0.93; if (y < 0) y *= 1.45;
    const jaw = clamp((-y - 0.35) / 1.1); x *= 1 - 0.36 * jaw * jaw; // jaw taper to the chin
    if (z < 0 && y < -0.45) z *= 1 - 0.45 * clamp((-y - 0.45) / 0.8); // back of the skull tucks into the neck
    if (z > 0) {
      const fr = clamp(z / 0.93); // front-facing weight
      z *= 1 - 0.12 * clamp(1 - Math.abs(x) / 0.8) * (y < 0.3 && y > -1.2 ? 1 : 0) * 0; // (kept for tuning)
      let dz = 0;
      dz += 0.06 * gauss(x * 0.6, y + 0.04, 0.16);                                   // brow ridge
      dz -= 0.07 * (gauss(x - 0.3, y + 0.22, 0.14) + gauss(x + 0.3, y + 0.22, 0.14));  // eye sockets
      dz += 0.2 * gauss(x * 2.6, (y + 0.68) * 0.9, 0.2) * clamp((-y - 0.2) / 0.5);    // nose ridge → tip
      dz -= 0.05 * gauss(x * 2.6, y + 0.82, 0.07);                                    // under the nose
      dz += 0.045 * (gauss(x - 0.45, y + 0.48, 0.16) + gauss(x + 0.45, y + 0.48, 0.16)); // cheekbones
      dz += 0.06 * gauss(x * 1.4, y + 1.0, 0.12);                                     // lips
      dz -= 0.03 * gauss(x * 1.4, y + 1.14, 0.06);                                    // under the lip
      dz += 0.07 * gauss(x * 1.2, y + 1.3, 0.14);                                     // chin
      z += dz * fr;
    }
    // ears
    const ear = gauss(Math.abs(z) < 0.3 ? 0 : (Math.abs(z) - 0.3), y + 0.3, 0.28) * gauss(z + 0.05, 0, 0.3);
    if (Math.abs(x) > 0.6) x += Math.sign(x) * 0.13 * ear;
    p.setXYZ(i, x * R * rad, y * R * rad, z * R * rad);
  }
  g.computeVertexNormals(); return g;
}
function photoUV(geo, R, lm) { // frontal photo projection; back of head samples the hair columns, nape samples the neck
  const p = geo.attributes.position, uv = geo.attributes.uv; const L = { ...HEAD_LM, ...(lm || {}) };
  const sv = (L.chinV - L.eyeV) / (L.chinY - L.eyeY), su = (L.earU) / L.halfW;
  for (let i = 0; i < p.count; i++) { const x = p.getX(i) / R, y = p.getY(i) / R, z = p.getZ(i) / R;
    let u = 0.5 + su * x, v = L.eyeV + (y - L.eyeY) * sv;
    if (z < -0.05) { const k = clamp(-z / 0.6); u = 0.5 + Math.sign(x || 1) * lerp(su * Math.abs(x), L.earU * 0.82, k); if (y < -0.4) { u = 0.5 + Math.sign(x || 1) * 0.16; v = Math.min(0.95, L.chinV + 0.08); } }
    uv.setXY(i, clamp(u, 0.01, 0.99), 1 - clamp(v, 0.01, 0.99)); }
  uv.needsUpdate = true; return geo;
}
const PHOTO_LM = { eyeV: 0.465, chinV: 0.86, earU: 0.33 };

const GTA_FACE = {
  5: { hair: 'sides', hc: '#16100c', stache: '#120c08', brow: '#120c08', stub: 0.9, lines: 0.5 },
  61: { hair: 'short', hc: '#120c08', brow: '#140e0a', stub: 0.5 },
  81: { hair: 'sides', hc: '#1a120c', stache: '#0e0a08', brow: '#0e0a08', stub: 1.2, lines: 0.4, frown: 1 },
  91: { hair: 'curly', hc: '#0e0a08', brow: '#120c08', stub: 1.0, beard: 0.5, sleepy: 1 },
  71: { hair: 'quiff', hc: '#0a0807', brow: '#0e0a08', stub: 0 },
  21: { hair: 'sides', hc: '#e4e0d8', stache: '#efece6', brow: '#d8d4cc', stub: 0.4, stubC: '230,228,220', lines: 1 },
  3: { hair: 'none', brow: '#2a1608', fem: 1 }, 9: { hair: 'curly', hc: '#17110c', brow: '#17110c', stub: 0 },
};
function gtaFaceTex(skinHex, L) {
  const sk = new THREE.Color(skinHex); const base = '#' + sk.getHexString(); const r = rng(5);
  const t = canvasTex(128, 128, (g) => {
    g.fillStyle = base; g.fillRect(0, 0, 128, 128);
    const rg = (x, y, rx, ry, c0, c1 = 'rgba(0,0,0,0)') => { g.save(); g.translate(x, y); g.scale(1, ry / rx); const gr = g.createRadialGradient(0, 0, 0, 0, 0, rx); gr.addColorStop(0, c0); gr.addColorStop(1, c1); g.fillStyle = gr; g.fillRect(-rx, -rx, rx * 2, rx * 2); g.restore(); };
    const sh = 'rgba(70,32,14,', hl = 'rgba(255,225,190,';
    // planar shading baked like the old games: dark temples/sides, lit centre
    const side = g.createLinearGradient(0, 0, 128, 0); side.addColorStop(0, sh + '0.55)'); side.addColorStop(0.28, sh + '0.0)'); side.addColorStop(0.72, sh + '0.0)'); side.addColorStop(1, sh + '0.55)'); g.fillStyle = side; g.fillRect(0, 0, 128, 128);
    rg(64, 38, 30, 16, hl + '0.18)');                                   // forehead highlight
    rg(48, 60, 13, 8, sh + '0.55)'); rg(80, 60, 13, 8, sh + '0.55)');    // eye sockets
    g.fillStyle = sh + '0.35)'; g.fillRect(36, 51, 56, 4);                // brow shadow band
    rg(64, 68, 5, 14, hl + '0.22)');                                    // nose bridge
    rg(64, 82, 12, 4, sh + '0.6)');                                     // under the nose
    rg(40, 80, 12, 10, hl + '0.10)'); rg(88, 80, 12, 10, hl + '0.10)');  // cheekbones
    rg(36, 92, 10, 14, sh + '0.25)'); rg(92, 92, 10, 14, sh + '0.25)');  // hollow cheeks
    rg(64, 104, 16, 6, sh + '0.35)');                                   // under-lip / chin crease
    g.fillStyle = sh + '0.45)'; g.fillRect(0, 113, 128, 15);             // under-chin / neck
    if (L.lines) { g.strokeStyle = sh + (0.35 * L.lines) + ')'; g.lineWidth = 1; for (const y of [30, 35, 40]) { g.beginPath(); g.moveTo(48, y); g.quadraticCurveTo(64, y - 2, 80, y); g.stroke(); } g.beginPath(); g.moveTo(52, 84); g.quadraticCurveTo(47, 92, 50, 99); g.moveTo(76, 84); g.quadraticCurveTo(81, 92, 78, 99); g.stroke(); }
    // stubble / beard
    if (L.stub) { const c = L.stubC || '30,20,14'; g.fillStyle = `rgba(${c},${0.18 * L.stub})`; g.beginPath(); g.moveTo(30, 86); g.quadraticCurveTo(34, 118, 64, 120); g.quadraticCurveTo(94, 118, 98, 86); g.quadraticCurveTo(80, 98, 64, 98); g.quadraticCurveTo(48, 98, 30, 86); g.fill(); g.fillRect(52, 84, 24, 6);
      for (let i = 0; i < 500 * L.stub; i++) { const x = 30 + r() * 68, y = 84 + r() * 36; g.fillStyle = `rgba(${c},${0.25 + r() * 0.3})`; g.fillRect(x, y, 1, 1); } }
    if (L.beard) { g.fillStyle = `rgba(18,12,8,${0.7 * L.beard})`; g.beginPath(); g.moveTo(30, 90); g.quadraticCurveTo(36, 122, 64, 124); g.quadraticCurveTo(92, 122, 98, 90); g.quadraticCurveTo(84, 108, 64, 108); g.quadraticCurveTo(44, 108, 30, 90); g.fill(); }
    // eyes: small, dark, a sliver of white (that era's look)
    for (const ex of [48, 80]) {
      const lid = L.sleepy ? 2.2 : 0;
      g.fillStyle = '#d6cbbb'; g.beginPath(); g.ellipse(ex, 61, 7, 3.2 - lid * 0.4, 0, 0, 7); g.fill();
      g.fillStyle = '#3a2416'; g.beginPath(); g.arc(ex + (ex < 64 ? 1 : -1), 61, 3, 0, 7); g.fill(); g.fillStyle = '#0c0705'; g.beginPath(); g.arc(ex + (ex < 64 ? 1 : -1), 61, 1.4, 0, 7); g.fill();
      g.fillStyle = sh + '0.95)'; g.fillRect(ex - 8, 57 - (L.sleepy ? -1.5 : 0), 16, 2.4 + lid);       // heavy upper lid line
      g.fillStyle = sh + '0.35)'; g.fillRect(ex - 6, 65, 12, 1.2);
      // brow
      g.fillStyle = L.brow || '#1a100a'; g.save(); g.translate(ex, 52); if (L.frown) g.rotate(ex < 64 ? 0.22 : -0.22);
      g.beginPath(); g.moveTo(-10, 2); g.quadraticCurveTo(0, -3.5, 10, 0.5); g.lineTo(10, 3); g.quadraticCurveTo(0, -0.5, -10, 4.5); g.fill(); g.restore();
    }
    // nostrils + lips
    g.fillStyle = 'rgba(40,14,6,0.8)'; g.fillRect(57, 80, 4, 2); g.fillRect(67, 80, 4, 2);
    g.fillStyle = 'rgba(120,52,40,0.85)'; g.beginPath(); g.moveTo(53, 92); g.quadraticCurveTo(64, 89.5, 75, 92); g.quadraticCurveTo(64, 96.5, 53, 92); g.fill();
    g.fillStyle = 'rgba(40,12,8,0.9)'; g.fillRect(53, 91.6, 22, 1.2);
    if (L.stache) { g.fillStyle = L.stache; g.beginPath(); g.moveTo(64, 84.5); g.quadraticCurveTo(50, 84, 48, 93); g.lineTo(51, 93); g.quadraticCurveTo(56, 89, 64, 89); g.quadraticCurveTo(72, 89, 77, 93); g.lineTo(80, 93); g.quadraticCurveTo(78, 84, 64, 84.5); g.fill(); }
    if (L.fem) { rg(40, 82, 8, 6, 'rgba(220,90,90,0.25)'); rg(88, 82, 8, 6, 'rgba(220,90,90,0.25)'); }
    // painted hair (front hairline + the side/back columns that the back of the skull samples)
    if (L.hair !== 'none') { g.fillStyle = L.hc; const top = L.hair === 'sides' ? -1 : 1;
      if (top > 0) { g.beginPath(); g.moveTo(0, 0); g.lineTo(128, 0); g.lineTo(128, 60); g.lineTo(106, 56); g.lineTo(100, 36); g.quadraticCurveTo(64, L.hair === 'quiff' ? 18 : 24, 28, 36); g.lineTo(22, 56); g.lineTo(0, 60); g.fill(); }
      else { g.fillRect(0, 30, 24, 34); g.fillRect(104, 30, 24, 34); }
      for (let i = 0; i < 400; i++) { const x = r() * 128, y = r() * 60; if (top < 0 && x > 24 && x < 104) continue; g.fillStyle = `rgba(255,255,255,${r() * 0.08})`; g.fillRect(x, y, 1, 2); } }
  });
  t.magFilter = THREE.LinearFilter; t.minFilter = THREE.LinearFilter; return t;
}
// hair as its own low-poly piece (like the old models), in head (R) units
function gtaHairMesh(L, R) {
  if (!L || L.hair === 'none') return null;
  const m = new THREE.MeshLambertMaterial({ color: L.hc });
  const grp = new THREE.Group();
  const shell = (tl, phiS = 0, phiL = Math.PI * 2) => { const g = new THREE.SphereGeometry(R * 1.05, 10, 6, phiS, phiL, 0, tl); g.scale(0.82, 1.0, 0.97); return g; };
  if (L.hair === 'sides') { return null; const g = new THREE.SphereGeometry(R * 1.02, 10, 3, Math.PI / 2 + Math.PI * 0.45, Math.PI * 2 - Math.PI * 0.9, Math.PI * 0.36, Math.PI * 0.26); g.scale(0.83, 1.12, 0.96); grp.add(new THREE.Mesh(g, m)); }
  else { const c = new THREE.Mesh(shell(Math.PI * 0.4), m); c.position.z = -0.02 * R; c.rotation.x = -0.25; grp.add(c);
    if (L.hair === 'quiff') { const q = new THREE.Mesh(new THREE.ConeGeometry(R * 0.45, R * 0.55, 5), m); q.position.set(0, R * 1.0, R * 0.35); q.rotation.x = 0.5; q.scale.set(1.2, 1, 0.7); grp.add(q); }
    if (L.hair === 'curly') { const rr = rng(3); for (let i = 0; i < 9; i++) { const a = rr() * 6.28; const k = new THREE.Mesh(new THREE.IcosahedronGeometry(R * 0.32, 0), m); k.position.set(Math.cos(a) * R * 0.55, R * (0.75 + rr() * 0.2), Math.sin(a) * R * 0.55); grp.add(k); } } }
  return grp;
}
function makeChar(cfg, parent) {
  const root = new THREE.Group(); parent.add(root);
  const mats = [];
  const reg = m => { m.flatShading = false; mats.push(m); m.userData.orig = m.color.clone(); return m; };
  const skin = reg(SM(cfg.skin));
  const hips = new THREE.Group(); hips.position.y = cfg.hipY; root.add(hips);
  const PH = GTA_PHOTO[cfg.seed];
  if (PH) { cfg = { ...cfg, legTex: gtaPhotoTex(PH.legs, [1, 2]), legColor: 0xffffff, torsoTex: gtaPhotoTex(PH.top, [2, 1]), torsoColor: 0xffffff,
    sleeveTex: PH.sleeve ? gtaPhotoTex(PH.sleeve, [1, 1]) : null, sleeveColor: 0xffffff }; }
  const legMat = reg(SM(0xffffff, { map: gtaSoft(cfg.legTex) || gtaCloth(cfg.legColor ?? 0x333344, 'denim'), color: cfg.legTex ? (cfg.legColor ?? 0xffffff) : 0xffffff }));
  const heavy = (cfg.torsoGeo.parameters?.radiusBottom ?? 0.27) > 0.4;
  const H = heavy ? 1.22 : 1.0; // girth
  // pelvis (trousers)
  mesh(loft([{ y: 0.06, w: 0.185 * H, d: 0.115 * H }, { y: -0.03, w: 0.19 * H, d: 0.125 * H, b: 1.15 }, { y: -0.1, w: 0.17 * H, d: 0.11 * H, b: 1.1 }, { y: -0.14, w: 0.1, d: 0.06 }], 16, 2.4, false, true), legMat, 0, 0, 0, hips);
  const legs = [];
  const L = cfg.hipY - 0.07; const lx = 0.095 * H;
  for (const s of [1, -1]) {
    const lp = new THREE.Group(); lp.position.set(s * lx, 0, 0); hips.add(lp);
    const lg = loft([[0, 0.092, 0.1], [0.12, 0.09, 0.095], [0.3, 0.078, 0.082], [0.46, 0.068, 0.072], [0.6, 0.072, 0.075], [0.82, 0.066, 0.066], [0.97, 0.074, 0.074], [1.0, 0.076, 0.078]]
      .map(([t, w, d]) => ({ y: -t * L, w: w * (heavy ? 1.18 : 1) + 0.014, d: d * (heavy ? 1.15 : 1) + 0.01 })), 8, 2.8);
    mesh(lg, legMat, 0, 0, 0, lp);
    const shoeMat = reg(SM(cfg.shoe));
    const sg = loft([{ y: -0.07, w: 0.042, d: 0.045 }, { y: -0.02, w: 0.05, d: 0.055 }, { y: 0.08, w: 0.056, d: 0.05 }, { y: 0.17, w: 0.052, d: 0.038 }, { y: 0.22, w: 0.036, d: 0.026 }], 14, 2.6, true, true);
    sg.rotateX(Math.PI / 2);
    const shoe = mesh(sg, shoeMat, 0, -cfg.hipY + 0.062, 0.0, lp);
    mesh(box(0.115, 0.03, 0.31), reg(SM(new THREE.Color(cfg.shoe).lerp(new THREE.Color(0xe8e2d6), 0.55).getHex())), 0, -cfg.hipY + 0.016, 0.075, lp); // sole
    legs.push(lp); lp.userData.shoe = shoe;
  }
  // torso: chest/back/shoulder slope cross-sections
  const torso = new THREE.Group(); hips.add(torso);
  const torsoTex = cfg.torsoTex ? gtaSoft(cfg.torsoTex) : gtaCloth(cfg.torsoColor ?? 0xcccccc);
  const torsoMat = reg(SM(0xffffff, { map: torsoTex, color: cfg.torsoTex ? (cfg.torsoColor ?? 0xffffff) : 0xffffff }));
  const yS = cfg.shoulderY - 0.02; const bw = heavy ? 1.12 : 1;
  const TS = [
    { y: -0.04, w: 0.19 * H, d: 0.122 * H }, { y: yS * 0.2, w: 0.172 * H, d: 0.112 * H, f: heavy ? 1.35 : 1 }, { y: yS * 0.42, w: 0.18 * H, d: 0.12 * H, f: heavy ? 1.3 : 1.02 },
    { y: yS * 0.66, w: 0.198 * bw, d: 0.13 * bw, f: 1.08 }, { y: yS * 0.84, w: 0.228 * bw, d: 0.125 * bw, f: 1.0, b: 1.05 },
    { y: yS * 0.97, w: 0.235 * bw, d: 0.11 * bw }, { y: yS + 0.035, w: 0.2 * bw, d: 0.09 }, { y: yS + 0.06, w: 0.09, d: 0.07 }, { y: yS + 0.07, w: 0.06, d: 0.055 }];
  const torsoMesh = mesh(loft(TS, 10, 3.2), torsoMat, 0, 0, 0, torso);
  if (cfg.skirt) { const p = cfg.skirt.parameters; mesh(loft([{ y: 0.02, w: 0.2 * H, d: 0.13 * H }, { y: -0.3, w: 0.24 * H, d: 0.17 * H }, { y: -p.height + 0.02, w: Math.max(0.28 * H, p.radiusBottom * 0.62), d: 0.21 * H }], 18), reg(SM(0xffffff, { map: torsoTex, side: THREE.DoubleSide })), 0, -0.25 + 0.25, 0, hips); }
  if (cfg.shorts) mesh(loft([{ y: 0.04, w: 0.2, d: 0.13 }, { y: -0.24, w: 0.22, d: 0.14 }], 16), reg(SM(0xffffff, { map: gtaSoft(cfg.shortsTex) })), 0, -0.08 + 0.08, 0, hips);
  if (PH && PH.belt) { mesh(loft([{ y: 0.03, w: 0.193 * H, d: 0.126 * H }, { y: -0.015, w: 0.195 * H, d: 0.128 * H }], 16), reg(SM(0x2a1d14)), 0, 0, 0, hips); mesh(box(0.055, 0.04, 0.015), reg(SM(0x9a8a70)), 0, 0.007, 0.13 * H, hips); }
  // arms
  const arms = [];
  const longSleeve = !!(PH ? PH.sleeve : cfg.sleeve);
  const sleeveMat = cfg.sleeve || (PH && PH.sleeve) ? reg(SM(0xffffff, { map: gtaSoft(cfg.sleeveTex || cfg.torsoTex) || gtaCloth(cfg.sleeveColor ?? cfg.torsoColor ?? 0xcccccc), color: (cfg.sleeveTex || cfg.torsoTex) ? (cfg.sleeveColor || 0xffffff) : 0xffffff })) : skin;
  const handMat = PH ? skin : reg(SM(cfg.hand));
  const ab = (heavy ? 1.2 : 1) + (longSleeve ? 0.12 : 0);
  for (const s of [1, -1]) {
    const sh = new THREE.Group(); sh.position.set(s * 0.215 * bw, yS - 0.02, 0); torso.add(sh);
    mesh(loft([[0.06, 0.06, -0.06], [0.06, 0.062, 0.0], [0.055, 0.058, 0.06], [0.05, 0.052, 0.16], [0.045, 0.046, 0.27], [0.042, 0.044, 0.35]].map(([w, d, t]) => ({ y: -t, w: w * ab, d: d * ab })), 8, 2.4, true), sleeveMat, 0, 0, 0, sh); // upper arm = children[0]
    const el = new THREE.Group(); el.position.y = -0.34; sh.add(el);
    mesh(loft([[0.042, 0.044, -0.02], [0.046, 0.046, 0.06], [0.04, 0.038, 0.18], [0.032, 0.028, 0.29]].map(([w, d, t]) => ({ y: -t, w: w * ab, d: d * ab })), 8, 2.4, true), longSleeve ? sleeveMat : skin, 0, 0, 0, el); // forearm = children[0]
    if (longSleeve) mesh(loft([{ y: -0.27, w: 0.03, d: 0.025 }, { y: -0.32, w: 0.029, d: 0.024 }], 10), skin, 0, 0, 0, el);
    // hand: palm + half-curled fingers in one loft, thumb
    const hand = mesh(loft([{ y: -0.31, w: 0.03, d: 0.022 }, { y: -0.35, w: 0.044, d: 0.02 }, { y: -0.4, w: 0.046, d: 0.019, oz: 0.004 }, { y: -0.44, w: 0.042, d: 0.016, oz: 0.016 }, { y: -0.47, w: 0.036, d: 0.014, oz: 0.034 }, { y: -0.48, w: 0.026, d: 0.01, oz: 0.046 }], 12, 2.6, false, true), handMat, 0, 0, 0, el);
    const thumb = mesh(new THREE.CapsuleGeometry(0.014, 0.04, 3, 8), handMat, s * -0.035, -0.37, 0.022, el); thumb.rotation.z = s * 0.5; thumb.rotation.x = 0.5;
    arms.push({ sh, el, hand, thumb });
  }
  const neck = new THREE.Group(); neck.position.y = yS + 0.03; torso.add(neck);
  mesh(loft([{ y: -0.02, w: 0.064, d: 0.064 }, { y: 0.05, w: 0.056, d: 0.058 }, { y: 0.09, w: 0.052, d: 0.055 }], 8), skin, 0, 0, 0.005, neck);
  // head: cranium radius R (cartoon units, so cfg.build hats/hair still fit), scaled to a real ~0.23 m head
  const R = cfg.headR; const HS = 0.094 / R;
  const head = new THREE.Group(); head.scale.setScalar(HS); head.position.set(0, 0.035 + 1.45 * 0.094, 0.018); neck.add(head);
  const look = GTA_LOOK[cfg.seed] || { hair: 'short', hc: '#1a120c', stub: 0.5 };
  const skull = new THREE.Group(); head.add(skull);
  const FL = GTA_FACE[cfg.seed] || { hair: 'short', hc: '#1a120c', brow: '#1a100a', stub: 0.4 };
  const headMat = reg(SM(0xffffff, { map: gtaFaceTex(cfg.skin, FL) }));
  mesh(photoUV(sculptHead(R), R, PHOTO_LM), headMat, 0, 0, 0, skull);
  const nose = mesh(new THREE.ConeGeometry(R * 0.11, R * 0.36, 4), skin, 0, -R * 0.55, R * 0.86, skull); nose.rotation.x = -0.12; nose.rotation.y = Math.PI / 4; nose.scale.set(1, 1, 0.5);
  const hairM = gtaHairMesh(FL, R); if (hairM) skull.add(hairM);
  headMat.userData.orig = new THREE.Color(0xffffff);
  // face layer (talking mouth / old drawn faces), projected exactly like the photo
  const faceMat = new THREE.MeshLambertMaterial({ transparent: true, alphaTest: 0.02, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4 });
  const face = mesh(photoUV(sculptHead(R, 1.004), R * 1.004, PHOTO_LM), faceMat, 0, 0, 0, skull); face.renderOrder = 2;
  { let cur = null; Object.defineProperty(faceMat, 'map', { get: () => cur, set: (t) => { const k = t && t.userData.key; cur = k ? photoOverlay(k[0], k[1], k[2], 0.718) : t; } }); }
  const extras = cfg.build ? cfg.build(head, torso, reg) : {};
  head.traverse(o => {
    if (!o.isMesh || o === face || o.parent === skull || (hairM && o.parent && (o.parent === hairM))) return;
    if (o.material && o.material.flatShading) { o.material.flatShading = false; o.material.needsUpdate = true; }
    const gp = o.geometry.parameters || {};
    if (o.geometry.type === 'BoxGeometry' && o.parent === head && gp.depth > 0.05 && look.hair !== 'none') { o.visible = false; return; }
    if (o.material && o.material.color && o.material.color.getHSL({}).l < 0.09) { o.visible = false; return; }
    if (o.geometry.type === 'IcosahedronGeometry' && gp.detail === 0) o.geometry = new THREE.IcosahedronGeometry(gp.radius, 1);
  });
  // cartoon chest props were built for a fat cylinder: hide them on photo characters, pull the rest onto the chest
  torso.children.forEach(o => { if (o !== torsoMesh && o.isMesh && o !== neck) { if (PH && !(o.geometry.type === 'BoxGeometry' && o.geometry.parameters.depth < 0.05 && o.geometry.parameters.width < 0.2)) o.visible = false; else { o.position.z *= 0.55; o.position.x *= 0.7; } } });
  torso.traverse(o => { if (o.isMesh && o.material && o.material.flatShading) { o.material.flatShading = false; o.material.needsUpdate = true; } });
  const afro = new THREE.Group(); head.add(afro); afro.visible = false;
  { const afroMat = SM(0x1a1a1a); const r = rng(cfg.seed); for (let i = 0; i < 9; i++) { const a = r() * 6.28, b = r() * 1.2; mesh(new THREE.IcosahedronGeometry(R * (0.55 + r() * 0.2), 1), afroMat, Math.cos(a) * Math.sin(b) * R * 0.9, R * 0.55 + Math.cos(b) * R * 0.5, Math.sin(a) * Math.sin(b) * R * 0.7 - 0.05, afro); } }
  const blob = mesh(new THREE.CircleGeometry(0.42, 16), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.35, depthWrite: false }), 0, 0.012, 0, root); blob.rotation.x = -Math.PI / 2;
  const C = { root, hips, torso, torsoMesh, legs, arms, neck, head, face, faceMat, mats, cfg, extras, afro, blob };
  if (typeof gtaAttachModel === 'function') gtaAttachModel(C);
  return C;
}
