// «حي أم حمادة» — open-world phase 1: walk the neighbourhood, talk to everyone, play as any of the cast.
import '@fontsource/lalezar/400.css';
import '@fontsource/press-start-2p/400.css';
import './style.css';
import * as THREE from 'three';
import { clamp, lerp, V, POSE0, applyPose, faceTexture } from './kit.js';
import { CAST, CAST_BY_ID, buildCharacter } from './chars.js';
import { buildWorld, colliders, circles, zones, mapRects, spawns, groundAt } from './world.js';

const $ = (id) => document.getElementById(id);
const SAVE_KEY = 'hay-om-hamada-save-v1';
const save = { get() { try { return JSON.parse(localStorage.getItem(SAVE_KEY) || 'null'); } catch { return null; } }, set(v) { try { localStorage.setItem(SAVE_KEY, JSON.stringify(v)); } catch { /* private mode */ } } };

// ---------- renderer: low internal resolution, scaled up with nearest-neighbour (PS2 look) ----------
const canvas = $('game');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance' });
renderer.outputColorSpace = THREE.SRGBColorSpace;
const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0xe8d8b8, 30, 95);
const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 400);
scene.add(new THREE.HemisphereLight(0xdcecff, 0xa08060, 1.15));
const sun = new THREE.DirectionalLight(0xfff0d0, 1.5); sun.position.set(40, 70, 25); scene.add(sun);

let quality = 1;
function resize() {
  const w = window.innerWidth, h = window.innerHeight;
  const pr = clamp((380 * quality) / Math.min(w, h), 0.35, 2);
  renderer.setPixelRatio(pr); renderer.setSize(w, h, false);
  camera.aspect = w / h; camera.fov = w < h ? 72 : 58; camera.updateProjectionMatrix();
  document.body.classList.toggle('portrait', w < h);
}
window.addEventListener('resize', resize);

// ---------- input ----------
const input = { x: 0, y: 0, run: false, jump: false, keys: new Set() };
const joy = { id: null, ox: 0, oy: 0, x: 0, y: 0 };
const look = { id: null, lx: 0, ly: 0 };
let camYaw = Math.PI, camPitch = 0.32, camDist = 5.6;
const joyEl = $('joy'), knobEl = $('knob');
function onDown(e) {
  if (e.target.closest('.ui')) return;
  const left = e.clientX < window.innerWidth * 0.45;
  if (left && joy.id === null && e.pointerType !== 'mouse') {
    joy.id = e.pointerId; joy.ox = e.clientX; joy.oy = e.clientY; joy.x = joy.y = 0;
    joyEl.style.left = `${e.clientX}px`; joyEl.style.top = `${e.clientY}px`; joyEl.classList.add('on'); knobEl.style.transform = 'translate(-50%,-50%)';
  } else if (look.id === null) { look.id = e.pointerId; look.lx = e.clientX; look.ly = e.clientY; }
}
function onMove(e) {
  if (e.pointerId === joy.id) {
    const R = 56; let dx = e.clientX - joy.ox, dy = e.clientY - joy.oy; const d = Math.hypot(dx, dy);
    if (d > R) { dx *= R / d; dy *= R / d; }
    joy.x = dx / R; joy.y = -dy / R; knobEl.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
  } else if (e.pointerId === look.id) {
    const sens = e.pointerType === 'mouse' ? 0.006 : 0.009;
    camYaw -= (e.clientX - look.lx) * sens; camPitch = clamp(camPitch + (e.clientY - look.ly) * sens * 0.6, 0.05, 1.1);
    look.lx = e.clientX; look.ly = e.clientY;
  }
}
function onUp(e) {
  if (e.pointerId === joy.id) { joy.id = null; joy.x = joy.y = 0; joyEl.classList.remove('on'); }
  if (e.pointerId === look.id) look.id = null;
}
canvas.addEventListener('pointerdown', onDown); window.addEventListener('pointermove', onMove); window.addEventListener('pointerup', onUp); window.addEventListener('pointercancel', onUp);
window.addEventListener('wheel', (e) => { camDist = clamp(camDist + e.deltaY * 0.004, 3, 10); });
window.addEventListener('keydown', (e) => {
  input.keys.add(e.code);
  if (e.code === 'Space') input.jump = true;
  if (e.code === 'KeyE') talk();
  if (e.code === 'KeyQ' || e.code === 'Tab') { e.preventDefault(); togglePicker(); }
});
window.addEventListener('keyup', (e) => input.keys.delete(e.code));
function readInput() {
  const k = input.keys; let x = joy.x, y = joy.y;
  if (k.has('KeyW') || k.has('ArrowUp')) y = 1; if (k.has('KeyS') || k.has('ArrowDown')) y = -1;
  if (k.has('KeyA') || k.has('ArrowLeft')) x = -1; if (k.has('KeyD') || k.has('ArrowRight')) x = 1;
  const m = Math.hypot(x, y); if (m > 1) { x /= m; y /= m; }
  const run = k.has('ShiftLeft') || k.has('ShiftRight') || Math.hypot(joy.x, joy.y) > 0.92;
  return { x, y, mag: Math.min(1, m), run };
}

// ---------- actors ----------
const actors = []; const byId = {};
let player = null;
function makeActor(meta) {
  const c = buildCharacter(meta.id, scene);
  const sp = spawns[meta.id];
  const a = { meta, c, pos: V(sp.x, 0, sp.z), ry: sp.ry, vy: 0, onGround: true, phase: Math.random() * 6, moveK: 0, runK: 0, blinkT: 2 + Math.random() * 3, talkUntil: 0, lineIx: 0, home: V(sp.x, 0, sp.z), homeRy: sp.ry, lookAt: null };
  a.pos.y = groundAt(a.pos.x, a.pos.z);
  actors.push(a); byId[meta.id] = a; return a;
}

function collide(p, r, self) {
  for (const b of colliders) {
    if (p.y > b.h) continue;
    const cx = clamp(p.x, b.x0, b.x1), cz = clamp(p.z, b.z0, b.z1);
    const dx = p.x - cx, dz = p.z - cz, d2 = dx * dx + dz * dz;
    if (d2 < r * r) {
      if (d2 > 1e-8) { const d = Math.sqrt(d2); p.x = cx + dx / d * r; p.z = cz + dz / d * r; }
      else { // centre inside the box: push out along the shortest axis
        const o = [[p.x - b.x0, -1, 0], [b.x1 - p.x, 1, 0], [p.z - b.z0, 0, -1], [b.z1 - p.z, 0, 1]].sort((u, v) => u[0] - v[0])[0];
        p.x += o[1] * (o[0] + r); p.z += o[2] * (o[0] + r);
      }
    }
  }
  for (const c of circles) { const dx = p.x - c.x, dz = p.z - c.z, rr = c.r + r, d2 = dx * dx + dz * dz; if (d2 < rr * rr && d2 > 1e-8) { const d = Math.sqrt(d2); p.x = c.x + dx / d * rr; p.z = c.z + dz / d * rr; } }
  for (const o of actors) { if (o === self) continue; const dx = p.x - o.pos.x, dz = p.z - o.pos.z, rr = r + 0.38, d2 = dx * dx + dz * dz; if (d2 < rr * rr && d2 > 1e-8) { const d = Math.sqrt(d2); p.x = o.pos.x + dx / d * rr; p.z = o.pos.z + dz / d * rr; } }
  p.x = clamp(p.x, -44.6, 44.6); p.z = clamp(p.z, -44.6, 44.6);
}
const angDiff = (a, b) => { let d = b - a; while (d > Math.PI) d -= Math.PI * 2; while (d < -Math.PI) d += Math.PI * 2; return d; };

function updatePlayer(a, dt) {
  const inp = readInput();
  const fx = -Math.sin(camYaw), fz = -Math.cos(camYaw); // camera forward on the ground
  const rx = -fz, rz = fx;
  let mx = fx * inp.y + rx * inp.x, mz = fz * inp.y + rz * inp.x;
  const mag = Math.hypot(mx, mz);
  const speed = (inp.run ? 6.2 : 3.3) * a.meta.speed;
  if (mag > 0.05) { mx /= mag; mz /= mag; a.ry += angDiff(a.ry, Math.atan2(mx, mz)) * Math.min(1, dt * 12); }
  const k = Math.min(1, inp.mag);
  a.pos.x += mx * speed * k * dt; a.pos.z += mz * speed * k * dt;
  a.moveK = lerp(a.moveK, mag > 0.05 ? k : 0, Math.min(1, dt * 10)); a.runK = lerp(a.runK, inp.run && mag > 0.05 ? 1 : 0, Math.min(1, dt * 6));
  a.phase += dt * (5.2 + a.runK * 4.5) * (0.4 + a.moveK * 0.6);
  if (input.jump && a.onGround) { a.vy = 5.4; a.onGround = false; }
  input.jump = false;
  physics(a, dt);
}
function physics(a, dt) {
  const g = groundAt(a.pos.x, a.pos.z);
  a.vy -= 15 * dt; a.pos.y += a.vy * dt;
  if (a.pos.y <= g) { if (!a.onGround && a.vy < -3) landPuff(a); a.pos.y = a.onGround ? lerp(a.pos.y, g, 0.5) : g; a.vy = 0; a.onGround = true; if (g - a.pos.y < 0.2) a.pos.y = g; }
  else if (a.pos.y - g > 0.25) a.onGround = false;
  collide(a.pos, 0.36, a);
}

function updateNPC(a, dt, t) {
  // turn toward whoever is close (or the speaker), otherwise drift back to the home heading
  let target = a.homeRy;
  const near = player && a.pos.distanceTo(player.pos) < 3.2;
  if (near) target = Math.atan2(player.pos.x - a.pos.x, player.pos.z - a.pos.z);
  a.ry += angDiff(a.ry, target) * Math.min(1, dt * 4);
  // walk back home if they were left somewhere else (after a switch)
  const dx = a.home.x - a.pos.x, dz = a.home.z - a.pos.z, d = Math.hypot(dx, dz);
  if (a.returning && d > 0.4 && !near) {
    const sp = 2.2 * a.meta.speed; a.pos.x += dx / d * sp * dt; a.pos.z += dz / d * sp * dt; a.ry += angDiff(a.ry, Math.atan2(dx, dz)) * Math.min(1, dt * 8);
    a.moveK = lerp(a.moveK, 0.8, dt * 6); a.phase += dt * 5.5;
  } else { a.returning = a.returning && d > 0.4; a.moveK = lerp(a.moveK, 0, dt * 6); a.phase += dt * 1.2; }
  a.runK = lerp(a.runK, 0, dt * 6);
  physics(a, dt);
}

function poseActor(a, t, dt) {
  const s = Math.sin(a.phase), mk = a.moveK, rk = a.runK;
  const amp = 0.55 + rk * 0.35;
  const p = { ...POSE0 };
  p.lL = s * amp * mk; p.lR = -s * amp * mk;
  p.aLx = -s * (0.45 + rk * 0.5) * mk; p.aRx = s * (0.45 + rk * 0.5) * mk;
  p.eL = 0.15 + mk * (0.25 + rk * 0.9); p.eR = p.eL;
  p.bend = 0.05 * mk + rk * 0.18;
  p.y = -Math.abs(Math.cos(a.phase)) * 0.05 * mk + (1 - mk) * Math.sin(t * 1.8 + a.phase) * 0.008;
  if (!a.onGround) { p.aLx = 2.5; p.aRx = 2.5; p.aLz = 0.5; p.aRz = 0.5; p.lL = 0.5; p.lR = -0.2; }
  if (t < a.talkUntil) { const e = 0.5 + 0.5 * Math.sin(t * 9); p.aRx += 0.6 + e * 0.4; p.eR += 0.8; p.hy += Math.sin(t * 2.3) * 0.12; }
  applyPose(a.c, p);
  a.c.root.position.copy(a.pos); a.c.root.rotation.y = a.ry;
  // face: blink, talk, mood
  a.blinkT -= dt; if (a.blinkT < -0.12) a.blinkT = 2 + Math.random() * 3.5;
  const talking = t < a.talkUntil;
  let eyes = a === player ? (rk > 0.5 ? 'wide' : 'default') : a.meta.mood;
  if (a.meta.id === 'sayed' && a !== player && !talking && Math.floor(t / 4) % 3 === 0) eyes = 'closed';
  if (a.blinkT < 0) eyes = 'closed';
  const mouth = talking ? (Math.floor(t * 10) % 3 === 0 ? 'closed' : (Math.floor(t * 10) % 2 ? 'talk1' : 'talk2')) : (a.meta.mood === 'angry' && a !== player ? 'frown' : 'smile');
  const key = eyes + mouth;
  if (a.faceKey !== key) { a.faceKey = key; a.c.faceMat.map = faceTexture(eyes, mouth, a.meta.face); a.c.faceMat.needsUpdate = true; }
}

// dust puff when landing
const puffs = [];
const puffTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 16; const g = c.getContext('2d'); g.fillStyle = '#e8dcc0'; g.beginPath(); g.arc(8, 8, 7, 0, 7); g.fill(); const t = new THREE.CanvasTexture(c); t.magFilter = THREE.NearestFilter; return t; })();
for (let i = 0; i < 12; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: puffTex, transparent: true, depthWrite: false })); s.visible = false; scene.add(s); puffs.push({ s, life: 0, v: V(0, 0, 0) }); }
function landPuff(a) { let n = 0; for (const p of puffs) { if (p.life > 0 || n >= 5) continue; n++; p.life = 0.5; p.s.visible = true; const ang = Math.random() * 6.28; p.v.set(Math.cos(ang) * 1.5, 0.4, Math.sin(ang) * 1.5); p.s.position.set(a.pos.x, a.pos.y + 0.1, a.pos.z); } }
function updatePuffs(dt) { for (const p of puffs) { if (p.life <= 0) continue; p.life -= dt; p.s.position.addScaledVector(p.v, dt); const k = p.life / 0.5; p.s.scale.setScalar(0.3 + (1 - k) * 0.5); p.s.material.opacity = k * 0.8; if (p.life <= 0) p.s.visible = false; } }

// ---------- camera with wall avoidance ----------
const camTarget = V(0, 0, 0);
function rayBoxT(ox, oz, dx, dz, b) {
  let t0 = 0, t1 = 1;
  for (const [o, d, lo, hi] of [[ox, dx, b.x0, b.x1], [oz, dz, b.z0, b.z1]]) {
    if (Math.abs(d) < 1e-9) { if (o < lo || o > hi) return 2; continue; }
    let a = (lo - o) / d, c = (hi - o) / d; if (a > c) [a, c] = [c, a];
    t0 = Math.max(t0, a); t1 = Math.min(t1, c); if (t0 > t1) return 2;
  }
  return t0;
}
function updateCamera(dt) {
  const head = player.pos.y + 1.55;
  camTarget.lerp(V(player.pos.x, head, player.pos.z), Math.min(1, dt * 10));
  const dist = camDist * (document.body.classList.contains('portrait') ? 1.15 : 1);
  const cx = Math.sin(camYaw) * Math.cos(camPitch) * dist, cz = Math.cos(camYaw) * Math.cos(camPitch) * dist, cy = Math.sin(camPitch) * dist;
  let t = 1;
  for (const b of colliders) { if (b.h < 1.5) continue; const bt = rayBoxT(camTarget.x, camTarget.z, cx, cz, { x0: b.x0 - 0.25, x1: b.x1 + 0.25, z0: b.z0 - 0.25, z1: b.z1 + 0.25 }); if (bt < t && camTarget.y + cy * bt < b.h) t = bt; }
  t = Math.max(0.15, t - 0.02);
  camera.position.set(camTarget.x + cx * t, Math.max(0.4, camTarget.y + cy * t), camTarget.z + cz * t);
  camera.lookAt(camTarget.x, camTarget.y - 0.15, camTarget.z);
}
// auto-follow: when moving and not dragging, ease the camera behind the character
function autoFollow(dt) {
  if (look.id !== null || player.moveK < 0.3 || input.keys.size) return;
  const behind = player.ry + Math.PI;
  camYaw += angDiff(camYaw, behind) * Math.min(1, dt * 0.9) * player.moveK;
}

// ---------- HUD ----------
const portraits = {};
function makePortraits() {
  const pc = document.createElement('canvas'); pc.width = pc.height = 96;
  const r = new THREE.WebGLRenderer({ canvas: pc, antialias: false, alpha: true, preserveDrawingBuffer: true });
  r.outputColorSpace = THREE.SRGBColorSpace;
  const sc = new THREE.Scene(); sc.add(new THREE.HemisphereLight(0xffffff, 0x806050, 1.6)); const dl = new THREE.DirectionalLight(0xffffff, 1.2); dl.position.set(1, 2, 3); sc.add(dl);
  const cam = new THREE.PerspectiveCamera(30, 1, 0.05, 20);
  for (const meta of CAST) {
    const c = buildCharacter(meta.id, sc); applyPose(c, POSE0);
    c.faceMat.map = faceTexture('default', 'smile', meta.face); c.faceMat.needsUpdate = true;
    c.root.updateMatrixWorld(true); const h = c.head.getWorldPosition(V(0, 0, 0));
    cam.position.set(h.x + 0.35, h.y + 0.05, h.z + 1.6); cam.lookAt(h.x, h.y - 0.08, h.z);
    r.render(sc, cam); portraits[meta.id] = pc.toDataURL();
    sc.remove(c.root);
  }
  r.dispose(); r.forceContextLoss();
}

function buildPicker() {
  const grid = $('pickgrid'); grid.innerHTML = '';
  for (const meta of CAST) {
    const b = document.createElement('button'); b.className = 'pick ui'; b.dataset.id = meta.id;
    b.innerHTML = `<img src="${portraits[meta.id]}" alt=""><span style="background:${meta.col}">${meta.ar}</span>`;
    b.addEventListener('click', () => { switchTo(meta.id); togglePicker(false); });
    grid.appendChild(b);
  }
}
function togglePicker(force) { const el = $('picker'); const on = force ?? !el.classList.contains('on'); el.classList.toggle('on', on); if (on) for (const b of document.querySelectorAll('.pick')) b.classList.toggle('cur', b.dataset.id === player.meta.id); }
$('switchBtn').addEventListener('click', () => togglePicker());
$('pickClose').addEventListener('click', () => togglePicker(false));

function switchTo(id) {
  const next = byId[id]; if (!next || next === player) return;
  if (player) { player.returning = false; }
  player = next; player.returning = false;
  camYaw = player.ry + Math.PI;
  $('switchImg').src = portraits[id]; $('switchName').textContent = player.meta.ar; $('switchName').style.background = player.meta.col;
  if (started) showCard(`بقيت ${player.meta.ar}`, player.meta.en);
  persist();
}

// location card
let cardTimer = 0, curZone = null;
function showCard(ar, en) { $('cardAr').textContent = ar; $('cardEn').textContent = en; const el = $('card'); el.classList.remove('on'); void el.offsetWidth; el.classList.add('on'); cardTimer = 2.6; }
function updateZone() {
  let z = null; for (const q of zones) { if ((player.pos.x - q.x) ** 2 + (player.pos.z - q.z) ** 2 < q.r * q.r) { if (!z || q.r < z.r) z = q; } }
  if (z && z !== curZone) showCard(z.ar, z.en);
  curZone = z;
}

// talking
let talkTarget = null, dlgTimer = 0, dlgText = '', dlgShown = 0;
function nearestNPC() { let best = null, bd = 2.6; for (const a of actors) { if (a === player) continue; const d = a.pos.distanceTo(player.pos); if (d < bd) { bd = d; best = a; } } return best; }
function talk() {
  const a = nearestNPC(); if (!a) return;
  const line = a.meta.lines[a.lineIx++ % a.meta.lines.length];
  talkTarget = a; dlgText = line; dlgShown = 0; dlgTimer = 1.4 + line.length * 0.07;
  a.talkUntil = clock.elapsedTime + Math.min(dlgTimer - 0.6, 0.9 + line.length * 0.045);
  $('dlgImg').src = portraits[a.meta.id]; $('dlgName').textContent = a.meta.ar; $('dlgName').style.background = a.meta.col; $('dlgEn').textContent = a.meta.en;
  $('dlg').classList.add('on'); $('dlgText').textContent = '';
}
$('talkBtn').addEventListener('click', talk);
$('dlg').addEventListener('click', () => { if (dlgShown < dlgText.length) dlgShown = dlgText.length; else dlgTimer = 0; });
$('jumpBtn').addEventListener('pointerdown', (e) => { e.preventDefault(); input.jump = true; });
function updateDialogue(dt) {
  if (dlgTimer > 0) {
    dlgTimer -= dt; dlgShown = Math.min(dlgText.length, dlgShown + dt * 22);
    const words = dlgText.split(' '); let acc = 0, out = [];
    for (const w of words) { if (acc + w.length * 0.5 <= dlgShown) { out.push(w); acc += w.length + 1; } else break; }
    $('dlgText').textContent = out.join(' ');
    if (dlgTimer <= 0 || (talkTarget && talkTarget.pos.distanceTo(player.pos) > 5)) { $('dlg').classList.remove('on'); dlgTimer = 0; talkTarget = null; }
  }
  const n = nearestNPC(); const btn = $('talkBtn');
  if (n && dlgTimer <= 0) { btn.classList.add('on'); $('talkName').textContent = n.meta.ar; } else btn.classList.remove('on');
}

// minimap (static layer drawn once, then the dots on top)
const mm = $('minimap'), mg = mm.getContext('2d'); const MMS = mm.width;
const mmBase = document.createElement('canvas'); mmBase.width = mmBase.height = MMS;
function drawMapBase() {
  const g = mmBase.getContext('2d'); const sc = MMS / 92; const tx = (x) => (x + 46) * sc;
  g.fillStyle = '#4a4a4e'; g.fillRect(0, 0, MMS, MMS);
  const col = { bld: '#b49a74', home: '#1f9e5a', garage: '#2f5fb0', plaza: '#d8c49a', stall: '#8a5a2b', mosque: '#3a8a6a', studio: '#d8231b', car: '#ddd', samircar: '#e8a020', tuk: '#d8231b' };
  for (const r of mapRects) { g.fillStyle = col[r.kind] || '#b49a74'; g.fillRect(tx(r.x0), tx(r.z0), (r.x1 - r.x0) * sc, (r.z1 - r.z0) * sc); }
  g.fillStyle = '#4f8a3a'; g.beginPath(); g.arc(tx(0), tx(0), 4 * sc, 0, 7); g.fill();
  g.strokeStyle = 'rgba(0,0,0,0.35)'; g.lineWidth = 1; for (const r of mapRects) if (r.kind === 'bld') g.strokeRect(tx(r.x0) + 0.5, tx(r.z0) + 0.5, (r.x1 - r.x0) * sc - 1, (r.z1 - r.z0) * sc - 1);
}
function drawMap() {
  const sc = MMS / 92; const tx = (x) => (x + 46) * sc;
  mg.drawImage(mmBase, 0, 0);
  for (const a of actors) { if (a === player) continue; mg.fillStyle = a.meta.col; mg.fillRect(tx(a.pos.x) - 2, tx(a.pos.z) - 2, 4, 4); }
  mg.save(); mg.translate(tx(player.pos.x), tx(player.pos.z)); mg.rotate(-player.ry + Math.PI);
  mg.fillStyle = '#fff'; mg.strokeStyle = '#000'; mg.lineWidth = 1.5; mg.beginPath(); mg.moveTo(0, -6); mg.lineTo(4.5, 5); mg.lineTo(0, 2.5); mg.lineTo(-4.5, 5); mg.closePath(); mg.stroke(); mg.fill(); mg.restore();
}

function persist() { if (!player) return; save.set({ who: player.meta.id, x: player.pos.x, z: player.pos.z, ry: player.ry }); }

// ---------- boot ----------
const clock = new THREE.Clock();
let started = false, fpsAcc = 0, fpsN = 0, saveT = 0;
async function boot() {
  resize();
  await Promise.all([document.fonts.load('22px Lalezar'), document.fonts.load('14px "Press Start 2P"')]).catch(() => {});
  const world = buildWorld(scene);
  for (const meta of CAST) makeActor(meta);
  makePortraits(); buildPicker(); drawMapBase();
  const sv = save.get();
  const startId = sv && byId[sv.who] ? sv.who : 'dad';
  player = null; switchTo(startId);
  if (sv && byId[sv.who]) { player.pos.set(sv.x, groundAt(sv.x, sv.z), sv.z); player.ry = sv.ry; camYaw = sv.ry + Math.PI; }
  camTarget.set(player.pos.x, player.pos.y + 1.55, player.pos.z);
  window.__game = { scene, renderer, camera, actors, player: () => player, switchTo, talk, world, setInput: (x, y, run) => { joy.x = x; joy.y = y; input.keys.clear(); if (run) input.keys.add('ShiftLeft'); }, setCam: (yaw, pitch) => { camYaw = yaw; if (pitch !== undefined) camPitch = pitch; }, teleport: (x, z) => { player.pos.set(x, groundAt(x, z), z); } };
  $('loading').classList.add('hide');
  $('startBtn').classList.add('on');
  renderer.setAnimationLoop(loop);
}
$('startBtn').addEventListener('click', async () => {
  $('title').classList.add('hide'); started = true; curZone = null;
  try { if (matchMedia('(pointer: coarse)').matches && document.documentElement.requestFullscreen) await document.documentElement.requestFullscreen(); } catch { /* not allowed */ }
});

function loop() {
  const dt = Math.min(0.05, clock.getDelta()); const t = clock.elapsedTime;
  for (const a of actors) { if (a === player && started) updatePlayer(a, dt); else updateNPC(a, dt, t); }
  for (const a of actors) poseActor(a, t, dt);
  updatePuffs(dt);
  if (started) { autoFollow(dt); updateZone(); updateDialogue(dt); }
  else camYaw += dt * 0.08; // slow orbit behind the title screen
  updateCamera(dt);
  renderer.render(scene, camera);
  drawMap();
  if (cardTimer > 0) { cardTimer -= dt; if (cardTimer <= 0) $('card').classList.remove('on'); }
  saveT += dt; if (saveT > 3) { saveT = 0; if (started) persist(); }
  // adaptive resolution: drop the internal resolution if the phone struggles
  fpsAcc += dt; fpsN++;
  if (fpsAcc > 2) { const fps = fpsN / fpsAcc; fpsAcc = 0; fpsN = 0; if (fps < 26 && quality > 0.6) { quality -= 0.15; resize(); } }
}
boot();
