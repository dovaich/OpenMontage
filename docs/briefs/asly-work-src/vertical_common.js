// =====================================================================
// Shared vertical (9:16) helpers + home sets for the family episodes
// (needs engine8 globals; engine8 built with W = 540, H = 960)
// =====================================================================
hallway.visible = false; balcony.visible = false; samir.root.visible = false;
skyB.visible = false; streetGlow.visible = false;
tvLight.intensity = 0; hallLight.intensity = 0; balcLight.intensity = 0;
const inT = (t, a, b) => t >= a && t < b;
function setFace(c, eyes, mouth, opts = {}) { c.faceMat.map = faceTexture(eyes, mouth, opts); c.faceMat.needsUpdate = true; }
function talkPose(p, t, who, amt = 1) { if (speakerAt(t) !== who) return p; const e = envAt(t) * amt; p.aRx += e * 0.35 * (1 + Math.sin(t * 5.3)); p.eR += e * 0.5; p.hy += Math.sin(t * 2.1) * 0.08; return p; }
function txtTex(w, h, bg, fn) { const t = canvasTex(w, h, (g) => { if (bg) { g.fillStyle = bg; g.fillRect(0, 0, w, h); } if (fn) fn(g, w, h); }); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; }
const roomLight = new THREE.PointLight(0xfff0d8, 0, 9, 1.1); scene.add(roomLight);

// ---------- BATHROOM (x = 60) ----------
const BX = 60;
const bath = new THREE.Group(); bath.position.x = BX; scene.add(bath);
{
  const tile = txtTex(16, 16, '#dfeef4', (g) => { g.fillStyle = '#a8c8d8'; g.fillRect(0, 15, 16, 1); g.fillRect(15, 0, 1, 16); }); tile.repeat.set(8, 6);
  const ftile = txtTex(16, 16, '#d8d8d0', (g) => { g.fillStyle = '#b8b8b0'; g.fillRect(0, 0, 8, 8); g.fillRect(8, 8, 8, 8); }); ftile.repeat.set(6, 6);
  mesh(new THREE.PlaneGeometry(4, 4), M(0xffffff, { map: ftile }), 0, 0, 0, bath).rotation.x = -Math.PI / 2;
  mesh(new THREE.PlaneGeometry(4, 3), M(0xffffff, { map: tile }), 0, 1.5, -1.5, bath);
  mesh(new THREE.PlaneGeometry(4, 3), M(0xffffff, { map: tile }), -1.8, 1.5, 0.5, bath).rotation.y = Math.PI / 2;
  mesh(new THREE.PlaneGeometry(4, 3), M(0xffffff, { map: tile }), 1.8, 1.5, 0.5, bath).rotation.y = -Math.PI / 2;
  mesh(new THREE.PlaneGeometry(4, 4), M(0xe8e8e0), 0, 2.9, 0, bath).rotation.x = Math.PI / 2;
  // shower stall (left) with a curtain
  mesh(box(1.3, 0.12, 1.2), P(0xf4f4f4), -1.1, 0.06, -0.85, bath);
  mesh(cyl(0.02, 0.02, 1.4, 6), P(0xcccccc), -0.44, 2.2, -0.85, bath).rotation.x = Math.PI / 2;
  const sh = new THREE.Group(); sh.position.set(-1.1, 2.15, -1.42); bath.add(sh); mesh(cyl(0.12, 0.08, 0.06, 10), P(0xcccccc), 0, 0, 0.12, sh).rotation.x = Math.PI / 2 - 0.5; mesh(cyl(0.015, 0.015, 0.2, 5), P(0xcccccc), 0, 0.05, 0.05, sh).rotation.x = 0.6;
  // toilet (right)
  const wc = new THREE.Group(); wc.position.set(1.05, 0, -1.05); bath.add(wc);
  mesh(cyl(0.2, 0.16, 0.4, 10), P(0xffffff), 0, 0.2, 0.1, wc); mesh(cyl(0.22, 0.22, 0.04, 12), P(0xf0f0f0), 0, 0.42, 0.12, wc); mesh(box(0.45, 0.45, 0.18), P(0xffffff), 0, 0.62, -0.18, wc);
  mesh(new THREE.CircleGeometry(0.15, 10), M(0x6ab8e0), 0, 0.41, 0.12, wc).rotation.x = -Math.PI / 2;
  // sink + mirror
  mesh(box(0.55, 0.15, 0.4), P(0xffffff), 0.1, 0.85, -1.3, bath); mesh(cyl(0.04, 0.05, 0.85, 6), P(0xffffff), 0.1, 0.42, -1.35, bath);
  mesh(new THREE.PlaneGeometry(0.5, 0.65), P(0xbfd8e8, { shininess: 120 }), 0.1, 1.55, -1.49, bath);
}
const curtain = mesh(new THREE.PlaneGeometry(1.2, 1.9), new THREE.MeshLambertMaterial({ color: 0x3a8ad8, side: THREE.DoubleSide, transparent: true, opacity: 0.92 }), BX - 0.44, 1.2, -0.85, scene); curtain.rotation.y = Math.PI / 2;
const bathLight = new THREE.PointLight(0xfff6e8, 0, 6, 1.2); bathLight.position.set(BX, 2.6, 0); scene.add(bathLight);

// ---------- KITCHEN (x = 120) ----------
const KX = 120;
const kitchen = new THREE.Group(); kitchen.position.x = KX; scene.add(kitchen);
{
  const kt = txtTex(16, 16, '#f2f2ee', (g) => { g.fillStyle = '#c8d8e8'; g.fillRect(0, 0, 8, 8); g.fillRect(8, 8, 8, 8); }); kt.repeat.set(8, 6);
  mesh(new THREE.PlaneGeometry(6, 5), M(0xffffff, { map: kt }), 0, 0, 0, kitchen).rotation.x = -Math.PI / 2;
  const wt = txtTex(16, 16, '#eef4f8', (g) => { g.fillStyle = '#9fc0d8'; g.fillRect(0, 15, 16, 1); g.fillRect(15, 0, 1, 16); }); wt.repeat.set(10, 5);
  mesh(new THREE.PlaneGeometry(6, 3.2), M(0xffffff, { map: wt }), 0, 1.6, -1.6, kitchen);
  mesh(box(3.6, 0.9, 0.6), M(0x8a5a2b, { map: woodTex }), -0.4, 0.45, -1.25, kitchen); mesh(box(3.7, 0.05, 0.65), P(0xdedede), -0.4, 0.92, -1.25, kitchen);
  mesh(box(3.6, 0.7, 0.35), M(0x8a5a2b, { map: woodTex }), -0.4, 2.15, -1.4, kitchen);
  mesh(box(0.8, 0.9, 0.6), P(0xdedede), 0.6, 0.45, -1.25, kitchen); // stove
  for (let i = 0; i < 4; i++) mesh(cyl(0.09, 0.09, 0.02, 8), M(0x222222), 0.42 + (i % 2) * 0.36, 0.92, -1.38 + Math.floor(i / 2) * 0.26, kitchen);
  mesh(box(0.8, 1.9, 0.7), P(0xf0f0f0), 2.1, 0.95, -1.2, kitchen); mesh(box(0.04, 0.4, 0.04), P(0x888888), 1.75, 1.2, -0.84, kitchen); // fridge
}
const flames = []; for (let i = 0; i < 7; i++) { const f = mesh(new THREE.ConeGeometry(0.045, 0.16, 5), new THREE.MeshBasicMaterial({ color: i % 2 ? 0xff9a1a : 0x4a8aff }), KX + 0.6 + Math.cos(i * 0.9) * 0.1, 0.97, -1.25 + Math.sin(i * 0.9) * 0.1, scene); flames.push(f); }
const kitLight = new THREE.PointLight(0xfff6e8, 0, 7, 1.2); kitLight.position.set(KX, 2.6, 0.2); scene.add(kitLight);

// ---------- DINING TABLE in the living room (origin) ----------
const dtable = new THREE.Group(); dtable.position.set(0, 0, -1.25); room.add(dtable);
{
  const cloth = txtTex(16, 16, '#f4f0e0', (g) => { g.fillStyle = '#d8231b'; g.fillRect(0, 0, 16, 2); g.fillRect(0, 7, 16, 2); g.fillRect(0, 14, 16, 2); }); cloth.repeat.set(4, 2);
  mesh(box(2.0, 0.06, 1.0), M(0xffffff, { map: cloth }), 0, 0.76, 0, dtable);
  for (const [x, z] of [[-0.9, -0.42], [0.9, -0.42], [-0.9, 0.42], [0.9, 0.42]]) mesh(box(0.06, 0.74, 0.06), M(0x6a4220), x, 0.37, z, dtable);
  for (const x of [-0.6, 0, 0.6]) { mesh(box(0.42, 0.06, 0.42), M(0x6a4220), x, 0.46, -0.72, dtable); mesh(box(0.42, 0.6, 0.06), M(0x6a4220), x, 0.78, -0.93, dtable); }
  for (const x of [-0.6, 0, 0.6]) mesh(cyl(0.14, 0.12, 0.02, 10), P(0xffffff), x, 0.8, -0.25, dtable);
  mesh(cyl(0.05, 0.04, 0.22, 6), P(0x8fd0ff, { transparent: true, opacity: 0.7 }), -0.85, 0.9, 0.2, dtable);
}

// ---------- 2D overlays (portrait layout) ----------
function drawHookV(g, t, a, b, l1, l2) {
  if (t < a || t >= b) return; const k = easeBack(seg(t, a, a + 0.3)) * (1 - easeIn(seg(t, b - 0.3, b)));
  g.save(); g.translate(W / 2, 150); g.scale(k, k); g.fillStyle = 'rgba(255,255,255,0.95)'; g.fillRect(-250, -66, 500, 132); g.fillStyle = '#d8231b'; g.fillRect(-250, 58, 500, 8);
  arText(g, l1, 0, -66, 46, '#111', 'center'); arText(g, l2, 0, -10, 46, '#d8231b', 'center'); g.restore();
}
function drawRewind(g, t, a, b, ar) {
  if (t < a || t >= b) return; g.fillStyle = 'rgba(0,0,0,0.5)'; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 8; i++) { g.fillStyle = 'rgba(255,255,255,0.25)'; g.fillRect(0, ((t * 1600 + i * 130) % H), W, 6); }
  pxText(g, '<< REWIND', W / 2, H / 2 - 60, 18, '#fff', 'center'); arText(g, ar, W / 2, H / 2 - 30, 34, '#ffe14a', 'center');
}
function drawInventionV(g, t, a, b, ar, bars) {
  if (t < a || t >= b) return; const k = easeBack(seg(t, a, a + 0.35)) * (1 - easeIn(seg(t, b - 0.4, b)));
  g.save(); g.translate(W / 2, 150); g.scale(k, k); g.fillStyle = 'rgba(10,10,30,0.92)'; g.fillRect(-240, -80, 480, 168); g.strokeStyle = '#ffe14a'; g.lineWidth = 3; g.strokeRect(-240, -80, 480, 168);
  pxText(g, 'NEW INVENTION!', 0, -70, 12, '#ffe14a', 'center', false); arText(g, ar, 0, -52, 36, '#fff', 'center');
  bars.forEach(([lbl, n, col], i) => { const y = 8 + i * 24; pxText(g, lbl, -220, y, 9, '#9fd0ff', 'left', false); for (let j = 0; j < 10; j++) { g.fillStyle = j < n ? col : '#333'; g.fillRect(-40 + j * 22, y - 3, 17, 14); } });
  g.restore();
}
function drawEndV(g, t, a, head, ar, meters, dur) {
  if (t >= a && t < dur - 3.2) {
    const k = easeBack(seg(t, a, a + 0.35)); g.save(); g.translate(W / 2, H - 240); g.scale(k, k);
    g.fillStyle = 'rgba(0,0,30,0.92)'; g.fillRect(-240, -100, 480, 200); g.strokeStyle = '#ff3a2a'; g.lineWidth = 3; g.strokeRect(-240, -100, 480, 200);
    pxText(g, head, 0, -88, 14, '#3df05a', 'center'); arText(g, ar, 0, -66, 30, '#fff', 'center');
    meters.forEach(([lbl, arl, t0, col], i) => { if (t < t0) return; const c = Math.min(10, Math.floor((t - t0) * 7)); const y = 0 + i * 46; pxText(g, lbl, -220, y, 9, '#fff', 'left', false); for (let j = 0; j < 10; j++) { g.fillStyle = j < c ? col : '#333'; g.fillRect(-20 + j * 22, y - 4, 18, 18); } if (c >= 10) arText(g, arl, 0, y + 14, 22, '#ffe14a', 'center'); });
    g.restore();
  }
  if (t >= dur - 3.2) { const k = easeOut(seg(t, dur - 3.2, dur - 2.8)); g.fillStyle = `rgba(0,0,0,${0.7 * k})`; g.fillRect(0, 0, W, H); g.save(); g.translate(W / 2, H / 2 - 60); g.scale(k, k); arText(g, 'يُتبع...', 0, -40, 64, '#ffe14a', 'center', 'ReemKufi'); pxText(g, 'TO BE CONTINUED', 0, 40, 16, '#fff', 'center'); g.restore(); }
  if (t > dur - 0.8) { g.fillStyle = `rgba(0,0,0,${clamp((t - dur + 0.8) / 0.8)})`; g.fillRect(0, 0, W, H); }
}
const NAMES = { son: ['حمادة', 'HAMADA', '#d4141c'], dad: ['إبراهيم', 'IBRAHIM', '#c9a227'], mom: ['أم حمادة', 'OM HAMADA', '#1f9e5a'], samir: ['أبو سمير', 'ABU SAMIR', '#6a6f78'], bastam: ['بستم', 'BESTEM', '#2f5fb0'], alamy: ['العالمي', 'EL-ALAMY', '#151518'], asly: ['الأصلي', 'EL-ASLY', '#6a6a6a'], gazzar: ['الجزار', 'EL-GAZZAR', '#4a4a38'] };
function portrait(g, x, y, who, t, S = 64) {
  const u = S / 64; g.save(); g.translate(x, y); g.scale(u, u);
  g.fillStyle = '#123'; g.fillRect(0, 0, 64, 64); g.strokeStyle = '#fff'; g.lineWidth = 2; g.strokeRect(0, 0, 64, 64);
  g.beginPath(); g.rect(2, 2, 60, 60); g.clip();
  const skin = { son: '#b98058', dad: '#b27448', mom: '#c98d5f', samir: '#c8946a', bastam: '#b07a50', alamy: '#c08a60', asly: '#a86a40', gazzar: '#a87048' }[who]; const shirt = { son: '#d4141c', dad: '#f3f0e3', mom: '#e86a8a', samir: '#8a8f96', bastam: '#2f5fb0', alamy: '#151518', asly: '#6a6a6a', gazzar: '#4a4a38' }[who];
  g.fillStyle = shirt; g.fillRect(8, 54, 48, 10);
  if (who === 'mom') { g.fillStyle = '#1f9e5a'; g.beginPath(); g.arc(32, 36, 25, 0, 7); g.fill(); }
  g.fillStyle = skin; g.beginPath(); g.arc(32, 36, 20, 0, 7); g.fill();
  if (who === 'mom') { g.fillStyle = '#1f9e5a'; g.beginPath(); g.arc(32, 30, 22, Math.PI, 0); g.fill(); }
  if (who === 'son') { g.fillStyle = '#17110c'; for (let i = 0; i < 6; i++) { g.beginPath(); g.arc(16 + i * 6.5, 19 + (i % 2) * 2, 6, 0, 7); g.fill(); } g.fillStyle = '#222'; g.fillRect(9, 30, 6, 12); g.fillRect(49, 30, 6, 12); }
  if (who === 'dad') { g.fillStyle = '#1b1410'; g.fillRect(10, 30, 5, 12); g.fillRect(49, 30, 5, 12); g.fillStyle = '#c9a227'; g.fillRect(14, 16, 36, 5); }
  if (who === 'samir') { g.fillStyle = '#ffffff'; g.beginPath(); g.arc(32, 27, 21, Math.PI, 0); g.fill(); g.fillStyle = '#f2f2f2'; g.fillRect(10, 30, 5, 10); g.fillRect(49, 30, 5, 10); }
  if (who === 'bastam') { g.fillStyle = '#d8231b'; g.beginPath(); g.arc(32, 26, 21, Math.PI, 0); g.fill(); }
  if (who === 'alamy') { g.fillStyle = '#101013'; g.fillRect(24, 50, 16, 14); g.fillStyle = '#0c0a09'; g.beginPath(); g.arc(32, 29, 20.5, Math.PI, 0); g.fill(); g.beginPath(); g.ellipse(34, 12, 15, 5, -0.1, 0, 7); g.fill(); g.fillRect(11, 28, 4, 9); g.fillRect(49, 28, 4, 9); }
  if (who === 'asly') { g.fillStyle = '#2a1a10'; g.fillRect(9, 30, 6, 12); g.fillRect(49, 30, 6, 12); }
  if (who === 'gazzar') { g.fillStyle = '#120c08'; for (let i = 0; i < 6; i++) { g.beginPath(); g.arc(14 + i * 7, 18 + (i % 2) * 3, 8, 0, 7); g.fill(); } g.fillStyle = '#d8231b'; g.fillRect(10, 22, 44, 4); }
  const fc = document.createElement('canvas'); fc.width = 32; fc.height = 32; const fg = fc.getContext('2d');
  const e = envAt(t); const mouth = speakerAt(t) === who ? (e < 0.1 ? 'closed' : e < 0.4 ? 'talk1' : 'talk2') : 'closed';
  drawFace(fg, 32, { son: 'tired', dad: 'smug', mom: 'angry', samir: 'angry', bastam: 'wide', alamy: 'smug', asly: 'angry', gazzar: 'tired' }[who] || 'default', mouth, { stache: who === 'dad' || who === 'samir' || who === 'asly', stacheColor: who === 'samir' ? '#eeeeee' : undefined, fuzz: who === 'bastam' || who === 'gazzar' });
  g.imageSmoothingEnabled = false; g.drawImage(fc, 14, 20, 36, 36); g.restore();
}
function drawDialogueV(g, t) {
  const L = LINES.find(l => l.s !== 'anno' && t >= l.t0 - 0.05 && t < l.t1 + Math.min(0.45, l.gap_after));
  if (!L) return;
  const x = 12, w = W - 24, hh = 168, y = H - hh - 40;
  const gr = g.createLinearGradient(0, y, 0, y + hh); gr.addColorStop(0, 'rgba(20,40,150,0.9)'); gr.addColorStop(1, 'rgba(5,10,60,0.94)');
  g.fillStyle = gr; g.fillRect(x, y, w, hh); g.strokeStyle = '#fff'; g.lineWidth = 3; g.strokeRect(x + 1.5, y + 1.5, w - 3, hh - 3);
  portrait(g, x + w - 92, y + 16, L.s, t, 80);
  const [name, nameEn, col] = NAMES[L.s];
  g.fillStyle = col; g.fillRect(x + w - 210, y - 20, 190, 30); g.strokeStyle = '#fff'; g.lineWidth = 2; g.strokeRect(x + w - 210, y - 20, 190, 30);
  arText(g, name, x + w - 28, y - 22, 24, '#fff'); pxText(g, nameEn, x + w - 202, y - 10, 8, '#fff', 'left');
  const words = L.ar.split(' '); const n = revealCount(L, t); const shown = words.slice(0, n).join(' ');
  g.font = '30px Lalezar'; g.direction = 'rtl'; const maxW = w - 120; const rows = [''];
  for (const wd of shown.split(' ').filter(Boolean)) { const tr = rows[rows.length - 1] ? rows[rows.length - 1] + ' ' + wd : wd; if (g.measureText(tr).width > maxW && rows[rows.length - 1]) rows.push(wd); else rows[rows.length - 1] = tr; }
  rows.slice(0, 3).forEach((r, i) => arText(g, r, x + w - 108, y + 10 + i * 40, 30, '#ffffff', 'right'));
  const ew = L.en.split(' '); const en = ew.slice(0, Math.ceil(ew.length * n / words.length)).join(' ');
  g.font = '8px PS2P'; const er = ['']; for (const wd of en.split(' ')) { const tr = er[er.length - 1] ? er[er.length - 1] + ' ' + wd : wd; if (g.measureText(tr).width > w - 40 && er[er.length - 1]) er.push(wd); else er[er.length - 1] = tr; }
  er.slice(0, 2).forEach((r, i) => pxText(g, r, x + 14, y + hh - 34 + i * 14, 8, '#9fd0ff', 'left'));
}
