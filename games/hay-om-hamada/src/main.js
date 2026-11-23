// «حي أم حمادة» — open world: walk, drive anything, enter buildings, missions and side jobs, day/night.
import '@fontsource/lalezar/400.css';
import '@fontsource/press-start-2p/400.css';
import './style.css';
import * as THREE from 'three';
import { clamp, lerp, V, POSE0, applyPose, faceTexture, mesh, box, M } from './kit.js';
import { CAST, CAST_BY_ID, buildCharacter } from './chars.js';
import { buildWorld, cullChunks, queryColliders, zones, mapRects, spawns, groundAt, doors, ramps, facadeMats, lampBulbMat, RIVER, inRiver } from './world.js';
import { Vehicles } from './vehicles.js';
import { Peds, Football } from './peds.js';
import { buildInteriors } from './interiors.js';
import { Sound } from './audio.js';
import { createGameplay } from './gameplay.js';

const $ = (id) => document.getElementById(id);
const SAVE_KEY = 'hay-om-hamada-save-v2';
const store = { get() { try { return JSON.parse(localStorage.getItem(SAVE_KEY) || 'null'); } catch { return null; } }, set(v) { try { localStorage.setItem(SAVE_KEY, JSON.stringify(v)); } catch { /* storage blocked */ } }, clear() { try { localStorage.removeItem(SAVE_KEY); } catch { /* */ } } };
const AR_DIGITS = '٠١٢٣٤٥٦٧٨٩'; const ar = (n) => String(n).replace(/\d/g, d => AR_DIGITS[d]);
const angDiff = (a, b) => { let d = b - a; while (d > Math.PI) d -= Math.PI * 2; while (d < -Math.PI) d += Math.PI * 2; return d; };

// ---------- renderer ----------
const canvas = $('game');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance' });
renderer.outputColorSpace = THREE.SRGBColorSpace;
const scene = new THREE.Scene();
const FOG_FAR = 120;
scene.fog = new THREE.Fog(0xe8d8b8, 40, FOG_FAR);
const camera = new THREE.PerspectiveCamera(60, 1, 0.3, 1500);
const hemi = new THREE.HemisphereLight(0xdcecff, 0xa08060, 1.15); scene.add(hemi);
const sun = new THREE.DirectionalLight(0xfff0d0, 1.5); sun.position.set(40, 70, 25); scene.add(sun);
let quality = 1;
function resize() {
  const w = window.innerWidth, h = window.innerHeight;
  renderer.setPixelRatio(clamp((380 * quality) / Math.min(w, h), 0.35, 2)); renderer.setSize(w, h, false);
  camera.aspect = w / h; camera.fov = w < h ? 72 : 58; camera.updateProjectionMatrix();
  document.body.classList.toggle('portrait', w < h);
}
window.addEventListener('resize', resize);

// ---------- persistent state ----------
const S = { money: 30, flags: [], done: [], bolts: [], ramps: [], cards: [], upgrades: {}, time: 8.5, who: 'dad', pos: null, goals: 0, fares: 0, deliveries: 0, races: [], knocked: 0, paint: {} };
function loadState() { const s = store.get(); if (s && s.v === 2) Object.assign(S, s.state); }
function saveState() { if (!player) return; const p = vehicleOf() ? vehicleOf().pos : player.pos; S.who = player.meta.id; S.pos = interior || p.y > 3 ? null : [p.x, p.z]; store.set({ v: 2, state: S }); }
const hasFlag = (f) => S.flags.includes(f), setFlag = (f) => { if (!hasFlag(f)) S.flags.push(f); };

// ---------- input ----------
const input = { jump: false, keys: new Set(), brake: false, red: false };
const joy = { id: null, ox: 0, oy: 0, x: 0, y: 0 };
const look = { id: null, lx: 0, ly: 0, t: 0 };
let camYaw = Math.PI, camPitch = 0.32, camDist = 5.6;
const joyEl = $('joy'), knobEl = $('knob');
canvas.addEventListener('pointerdown', (e) => {
  if (e.target.closest('.ui')) return;
  sound.start();
  const left = e.clientX < window.innerWidth * 0.45;
  if (left && joy.id === null && e.pointerType !== 'mouse') { joy.id = e.pointerId; joy.ox = e.clientX; joy.oy = e.clientY; joy.x = joy.y = 0; joyEl.style.left = `${e.clientX}px`; joyEl.style.top = `${e.clientY}px`; joyEl.classList.add('on'); knobEl.style.transform = 'translate(-50%,-50%)'; }
  else if (look.id === null) { look.id = e.pointerId; look.lx = e.clientX; look.ly = e.clientY; look.t = 0; }
});
window.addEventListener('pointermove', (e) => {
  if (e.pointerId === joy.id) { const R = 56; let dx = e.clientX - joy.ox, dy = e.clientY - joy.oy; const d = Math.hypot(dx, dy); if (d > R) { dx *= R / d; dy *= R / d; } joy.x = dx / R; joy.y = -dy / R; knobEl.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`; }
  else if (e.pointerId === look.id) { const sens = e.pointerType === 'mouse' ? 0.006 : 0.009; camYaw -= (e.clientX - look.lx) * sens; camPitch = clamp(camPitch + (e.clientY - look.ly) * sens * 0.6, 0.02, 1.2); look.lx = e.clientX; look.ly = e.clientY; look.t = 1.5; }
});
const onUp = (e) => { if (e.pointerId === joy.id) { joy.id = null; joy.x = joy.y = 0; joyEl.classList.remove('on'); } if (e.pointerId === look.id) look.id = null; };
window.addEventListener('pointerup', onUp); window.addEventListener('pointercancel', onUp);
window.addEventListener('wheel', (e) => { camDist = clamp(camDist + e.deltaY * 0.004, 3, 12); });
window.addEventListener('keydown', (e) => {
  if (e.repeat) return; input.keys.add(e.code); sound.start();
  if (e.code === 'Space') input.jump = true;
  if (e.code === 'KeyE' || e.code === 'KeyF') doContext();
  if (e.code === 'KeyQ') togglePicker();
  if (e.code === 'KeyH') honk();
  if (e.code === 'KeyR') input.red = !input.red;
  if (e.code === 'KeyM' || e.code === 'Tab') { e.preventDefault(); togglePhone(); }
});
window.addEventListener('keyup', (e) => input.keys.delete(e.code));
function readInput() {
  const k = input.keys; let x = joy.x, y = joy.y;
  if (k.has('KeyW') || k.has('ArrowUp')) y = 1; if (k.has('KeyS') || k.has('ArrowDown')) y = -1;
  if (k.has('KeyA') || k.has('ArrowLeft')) x = -1; if (k.has('KeyD') || k.has('ArrowRight')) x = 1;
  const m = Math.hypot(x, y); if (m > 1) { x /= m; y /= m; }
  return { x, y, mag: Math.min(1, m), run: k.has('ShiftLeft') || k.has('ShiftRight') || Math.hypot(joy.x, joy.y) > 0.92, brake: input.brake || k.has('Space') };
}

// ---------- world ----------
const sound = new Sound();
let world, interiors, vehicles, peds, football, game;
const actors = []; const byId = {};
let player = null, interior = null;
const people = [];

// ---------- particles ----------
const fx = { puffs: [] };
const dotTex = (c) => { const cv = document.createElement('canvas'); cv.width = cv.height = 16; const g = cv.getContext('2d'); g.fillStyle = c; g.beginPath(); g.arc(8, 8, 7, 0, 7); g.fill(); const t = new THREE.CanvasTexture(cv); t.magFilter = THREE.NearestFilter; return t; };
const puffT = dotTex('#e8dcc0'), fireT = dotTex('#ffb020'), smokeT = dotTex('#5a5a5a');
for (let i = 0; i < 40; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: puffT, transparent: true, depthWrite: false })); s.visible = false; scene.add(s); fx.puffs.push({ s, life: 0, max: 1, v: V(0, 0, 0), grow: 1, size: 0.4 }); }
function emitPuff(x, y, z, n = 5, tex = puffT, spd = 1.5, life = 0.6, size = 0.4, grow = 0.6) {
  let k = 0; for (const p of fx.puffs) { if (p.life > 0) continue; if (k++ >= n) break; p.life = p.max = life * (0.7 + Math.random() * 0.6); p.s.material.map = tex; p.s.visible = true; const a = Math.random() * 6.28, u = Math.random(); p.v.set(Math.cos(a) * spd * u, 0.4 + Math.random() * spd * 0.8, Math.sin(a) * spd * u); p.s.position.set(x, y, z); p.size = size; p.grow = grow; }
}
function updatePuffs(dt) { for (const p of fx.puffs) { if (p.life <= 0) continue; p.life -= dt; p.s.position.addScaledVector(p.v, dt); const k = p.life / p.max; p.s.scale.setScalar(p.size + (1 - k) * p.grow); p.s.material.opacity = k * 0.9; if (p.life <= 0) p.s.visible = false; } }
let shakeT = 0, shakeAmp = 0;
function explosion(x, y, z, big2 = 1) {
  emitPuff(x, y + 0.5, z, 14, fireT, 6 * big2, 0.7, 0.8 * big2, 2.5 * big2); emitPuff(x, y + 1, z, 14, smokeT, 4 * big2, 1.6, 1.0 * big2, 3 * big2);
  shakeT = 0.8; shakeAmp = 0.35 * big2; sound.boom();
  peds.startle(x, z, 25);
  for (const a of [...actors, ...peds.list]) { const d = Math.hypot(a.pos.x - x, a.pos.z - z); if (d < 4 * big2 && Math.abs(a.pos.y - y) < 3 && !a.inVehicle) knockPerson(a, (a.pos.x - x) / (d || 1), (a.pos.z - z) / (d || 1), 8); }
}

// ---------- cast actors ----------
function makeActor(meta) {
  const c = buildCharacter(meta.id, scene); const sp = spawns[meta.id];
  const a = { meta, c, pos: V(sp.x, 0, sp.z), ry: sp.ry, vy: 0, onGround: true, phase: Math.random() * 6, moveK: 0, runK: 0, blinkT: 2 + Math.random() * 3, talkUntil: 0, lineIx: 0, home: V(sp.x, 0, sp.z), homeRy: sp.ry, alive: true, knocked: false, kt: 0, kvel: V(0, 0, 0), isActor: true };
  a.pos.y = groundAt(a.pos.x, a.pos.z); actors.push(a); byId[meta.id] = a; return a;
}
const tmpQ = [];
function collideCircle(p, r, self) {
  for (const b of queryColliders(p.x, p.z, r + 0.5, tmpQ)) {
    if (b.circle) { const dx = p.x - b.x, dz = p.z - b.z, rr = b.r + r, d2 = dx * dx + dz * dz; if (d2 < rr * rr && d2 > 1e-8 && p.y < 3 + (b.h || 0)) { const d = Math.sqrt(d2); p.x = b.x + dx / d * rr; p.z = b.z + dz / d * rr; } continue; }
    if (p.y > b.h) continue;
    const cx = clamp(p.x, b.x0, b.x1), cz = clamp(p.z, b.z0, b.z1); const dx = p.x - cx, dz = p.z - cz, d2 = dx * dx + dz * dz;
    if (d2 < r * r) { if (d2 > 1e-8) { const d = Math.sqrt(d2); p.x = cx + dx / d * r; p.z = cz + dz / d * r; } else { const o = [[p.x - b.x0, -1, 0], [b.x1 - p.x, 1, 0], [p.z - b.z0, 0, -1], [b.z1 - p.z, 0, 1]].sort((u, v) => u[0] - v[0])[0]; p.x += o[1] * (o[0] + r); p.z += o[2] * (o[0] + r); } }
  }
  for (const o of actors) { if (o === self || o.inVehicle || !o.c.root.visible) continue; const dx = p.x - o.pos.x, dz = p.z - o.pos.z, rr = r + 0.38, d2 = dx * dx + dz * dz; if (d2 < rr * rr && d2 > 1e-8) { const d = Math.sqrt(d2); p.x = o.pos.x + dx / d * rr; p.z = o.pos.z + dz / d * rr; } }
  for (const v of vehicles.list) {
    if (!v.root.visible || Math.abs(v.pos.y - p.y) > 1.8) continue; const [fx2, fz2] = vehicles.fwd(v); const dx = p.x - v.pos.x, dz = p.z - v.pos.z;
    const lx = dx * fx2 + dz * fz2, lz = -dx * fz2 + dz * fx2; const hx = v.L / 2 + r, hz = v.W / 2 + r;
    if (Math.abs(lx) < hx && Math.abs(lz) < hz) { const px = hx - Math.abs(lx), pz = hz - Math.abs(lz); if (px < pz) { const s = Math.sign(lx); p.x += fx2 * s * px; p.z += fz2 * s * px; } else { const s = Math.sign(lz); p.x += -fz2 * s * pz; p.z += fx2 * s * pz; } }
  }
}
function physics(a, dt) {
  const g = groundAt(a.pos.x, a.pos.z, a.pos.y);
  a.vy -= 15 * dt; a.pos.y += a.vy * dt;
  if (a.pos.y <= g) { if (!a.onGround && a.vy < -4) emitPuff(a.pos.x, a.pos.y + 0.1, a.pos.z, 5); a.pos.y = g; a.vy = 0; a.onGround = true; }
  else if (a.pos.y - g > 0.3) a.onGround = false;
  collideCircle(a.pos, 0.36, a);
  if (a === player && inRiver(a.pos.x, a.pos.z) && a.pos.y < -0.8) drowned(a);
}
function knockPerson(p, dx, dz, spd) {
  if (p.isPed) { peds.knock(p, dx, dz, spd); return; }
  if (p.knocked) return;
  p.knocked = true; p.kt = 0; p.kvel.set(dx * Math.min(12, spd * 0.8), 4 + Math.min(5, spd * 0.3), dz * Math.min(12, spd * 0.8)); p.vy = 0;
  peds.starOwner = p; sound.bonk();
  if (p === player) toast('آآآه! اتخبطت!');
  else bark(p, ['يا ابني حاسب!', 'هو أنا شفاف؟!', 'عيني... ضهري...', 'هقول لأم حمادة!'][Math.floor(Math.random() * 4)]);
}
function updateWalker(a, dt, inp) {
  if (a.knocked) { a.kt += dt; a.kvel.y -= 18 * dt; a.pos.addScaledVector(a.kvel, dt); const g = groundAt(a.pos.x, a.pos.z, a.pos.y); if (a.pos.y < g) { a.pos.y = g; a.kvel.multiplyScalar(0.3); a.kvel.y = 0; } collideCircle(a.pos, 0.36, a); if (a.kt > 2.2) a.knocked = false; return; }
  if (inp) {
    const fxc = -Math.sin(camYaw), fzc = -Math.cos(camYaw), rx = -fzc, rz = fxc;
    let mx = fxc * inp.y + rx * inp.x, mz = fzc * inp.y + rz * inp.x; const mag = Math.hypot(mx, mz);
    const speed = (inp.run ? 6.2 : 3.3) * a.meta.speed * (interior ? 0.75 : 1);
    if (mag > 0.05) { mx /= mag; mz /= mag; a.ry += angDiff(a.ry, Math.atan2(mx, mz)) * Math.min(1, dt * 12); }
    a.pos.x += mx * speed * inp.mag * dt; a.pos.z += mz * speed * inp.mag * dt;
    a.moveK = lerp(a.moveK, mag > 0.05 ? inp.mag : 0, Math.min(1, dt * 10)); a.runK = lerp(a.runK, inp.run && mag > 0.05 ? 1 : 0, Math.min(1, dt * 6));
    a.phase += dt * (5.2 + a.runK * 4.5) * (0.4 + a.moveK * 0.6);
    if (input.jump && a.onGround) { a.vy = 5.4; a.onGround = false; }
    input.jump = false;
  }
  physics(a, dt);
}
function updateNPC(a, dt) {
  if (a.inVehicle) return;
  if (a.knocked) { updateWalker(a, dt, null); return; }
  if (a.ai) { a.ai(a, dt); physics(a, dt); return; }
  let target = a.homeRy; const near = player && !vehicleOf() && a.pos.distanceTo(player.pos) < 3.2;
  if (near) target = Math.atan2(player.pos.x - a.pos.x, player.pos.z - a.pos.z);
  a.ry += angDiff(a.ry, target) * Math.min(1, dt * 4);
  const dx = a.home.x - a.pos.x, dz = a.home.z - a.pos.z, d = Math.hypot(dx, dz);
  if (d > 80 && !a.c.root.visible) { a.pos.copy(a.home); a.pos.y = groundAt(a.home.x, a.home.z); a.returning = false; }
  else if (a.returning && d > 0.5 && !near) { const sp = 2.2 * a.meta.speed; a.pos.x += dx / d * sp * dt; a.pos.z += dz / d * sp * dt; a.ry += angDiff(a.ry, Math.atan2(dx, dz)) * Math.min(1, dt * 8); a.moveK = lerp(a.moveK, 0.8, dt * 6); a.phase += dt * 5.5; }
  else { if (d <= 0.5) a.returning = false; a.moveK = lerp(a.moveK, 0, dt * 6); a.phase += dt * 1.2; }
  a.runK = lerp(a.runK, 0, dt * 6);
  physics(a, dt);
}
function poseActor(a, t, dt) {
  const s = Math.sin(a.phase), mk = a.moveK, rk = a.runK, amp = 0.55 + rk * 0.35;
  const p = { ...POSE0 };
  if (a.inVehicle) { p.lL = 1.5; p.lR = 1.5; p.y = -0.42; p.aLx = 1.0; p.aRx = 1.0; p.eL = 0.5; p.eR = 0.5; p.aLz = 0.2; p.aRz = 0.2; const st = a.inVehicle.steer || 0; p.aLx += st * 0.6; p.aRx -= st * 0.6; }
  else if (a.knocked) { p.aLx = 2.6; p.aRx = 2.6; p.lL = 1.2; }
  else {
    p.lL = s * amp * mk; p.lR = -s * amp * mk; p.aLx = -s * (0.45 + rk * 0.5) * mk; p.aRx = s * (0.45 + rk * 0.5) * mk;
    p.eL = 0.15 + mk * (0.25 + rk * 0.9); p.eR = p.eL; p.bend = 0.05 * mk + rk * 0.18;
    p.y = -Math.abs(Math.cos(a.phase)) * 0.05 * mk + (1 - mk) * Math.sin(t * 1.8 + a.phase) * 0.008;
    if (!a.onGround) { p.aLx = 2.5; p.aRx = 2.5; p.aLz = 0.5; p.aRz = 0.5; p.lL = 0.5; p.lR = -0.2; }
    if (t < a.talkUntil) { const e = 0.5 + 0.5 * Math.sin(t * 9); p.aRx += 0.6 + e * 0.4; p.eR += 0.8; p.hy += Math.sin(t * 2.3) * 0.12; }
    if (a.throwT > t) { p.aRx = 2.9; p.eR = 0.2; }
  }
  applyPose(a.c, p);
  if (a.inVehicle) { const v = a.inVehicle; const sc = v.body.scale.x || 1; a.c.root.position.set(v.seat.x / sc, v.seat.y / sc, v.seat.z / sc); a.c.root.rotation.set(0, Math.PI / 2, 0); a.c.root.scale.setScalar(1 / sc); }
  else if (a.knocked) { a.c.root.position.copy(a.pos); a.c.root.rotation.set(-Math.PI / 2 * Math.min(1, a.kt * 5) * (a.kt < 1.8 ? 1 : (2.2 - a.kt) / 0.4), a.ry, 0, 'YXZ'); a.c.root.scale.setScalar(1); }
  else { a.c.root.position.copy(a.pos); a.c.root.rotation.set(0, a.ry, 0); a.c.root.scale.setScalar(1); }
  a.blinkT -= dt; if (a.blinkT < -0.12) a.blinkT = 2 + Math.random() * 3.5;
  const talking = t < a.talkUntil;
  let eyes = a === player ? (rk > 0.5 ? 'wide' : 'default') : a.meta.mood;
  if (a.meta.id === 'sayed' && a !== player && !talking && Math.floor(t / 4) % 3 === 0) eyes = 'closed';
  if (a.blinkT < 0) eyes = 'closed';
  if (a.knocked) eyes = 'dizzy';
  if (a.chasing) eyes = 'angry';
  const mouth = a.knocked ? 'wobble' : talking ? (Math.floor(t * 10) % 3 === 0 ? 'closed' : (Math.floor(t * 10) % 2 ? 'talk1' : 'talk2')) : a.chasing ? 'scream' : (a.meta.mood === 'angry' && a !== player ? 'frown' : 'smile');
  const key = eyes + mouth;
  if (a.faceKey !== key) { a.faceKey = key; a.c.faceMat.map = faceTexture(eyes, mouth, a.meta.face); a.c.faceMat.needsUpdate = true; }
}

// ---------- vehicles: entering / leaving ----------
const vehicleOf = () => player && player.inVehicle;
function enterVehicle(v) {
  if (v.kind === 'samir' && !hasFlag('samirCar') && !game.allow('samir')) { bark(byId.samir, 'إوعى تقرب من العربية!'); toast('أبو سمير مش موافق لسه... المهمات هتفتحها'); return; }
  if (v.kind === 'tuk' && !hasFlag('tuk') && !game.allow('tuk')) { bark(byId.hooda, 'التوكتوك ده رزقي يا باشا!'); toast('حودة مش موافق لسه... المهمات هتفتحها'); return; }
  if (v.ai) {
    const [ex, ez] = vehicles.exitPoint(v); const d = peds.spawn(ex, ez); d.state = 'angry'; d.t = 0; bark(d, ['يا حرامي!', 'عربيتي!', 'إنت مين يا عم؟!'][Math.floor(Math.random() * 3)]);
    v.ai = null; addChaos(0.8);
  }
  if (v.parked) { v.parked = false; if (v.spot) { v.spot.taken = true; v.spot.v = null; v.spot = null; } }
  player.inVehicle = v; v.driver = player; vehicles.player = v;
  v.body.add(player.c.root);
  camYaw = v.yaw - Math.PI / 2; sound.blip(); game.emit('enterVehicle', v); updateDriveUI();
}
function exitVehicle(force) {
  const v = vehicleOf(); if (!v) return;
  if (!force && Math.abs(v.speed) > 6) { toast('هدّي السرعة الأول!'); return; }
  const [x, z] = vehicles.exitPoint(v);
  scene.add(player.c.root); player.c.root.scale.setScalar(1); player.inVehicle = null; v.driver = null; vehicles.player = null; v.flying = false; input.red = false;
  player.pos.set(x, groundAt(x, z, v.pos.y + 1), z); player.vy = 0; player.ry = Math.atan2(x - v.pos.x, z - v.pos.z); camYaw = player.ry + Math.PI;
  game.emit('exitVehicle', v); updateDriveUI();
}
function honk() { const v = vehicleOf(); if (!v) return; sound.horn(v.kind === 'tuk' ? 'tuk' : v.type); peds.startle(v.pos.x, v.pos.z, 12); }
let airT = 0, airStart = null, flyFuel = 1;
function updateDriving(v, dt) {
  const inp = readInput();
  const red = input.red && v.kind === 'samir' && hasFlag('redButton');
  if (red && flyFuel > 0) { v.flying = true; v.flyLift = inp.y > 0.2 ? 5 : inp.y < -0.2 ? -6 : 0.6; flyFuel -= dt / 16; if (flyFuel <= 0) { input.red = false; toast('البنزين النووي خلص!'); } }
  else { v.flying = false; flyFuel = Math.min(1, flyFuel + dt / 30); }
  const throttle = v.flying ? 0.9 : inp.y;
  vehicles.drive(v, throttle, -inp.x, inp.brake, dt, red ? 1 : 0);
  player.pos.copy(v.pos);
  if (!v.onGround && !v.flying) { if (airStart === null) { airStart = { x: v.pos.x, z: v.pos.z }; airT = 0; } airT += dt; }
  else if (airStart) { if (airT > 0.7) jumpLanded(v, airT, airStart); airStart = null; airT = 0; }
  sound.setEngine(true, v.speed, v.kind === 'tuk' ? 'tuk' : v.type);
  $('speed').textContent = ar(Math.round(Math.abs(v.speed) * 3.3)) + ' كم/س';
  $('redBtn').classList.toggle('lit', input.red);
  $('fuel').style.width = (flyFuel * 100) + '%';
}
function jumpLanded(v, t, start) {
  let ramp = null; for (const r of ramps) if (Math.hypot(r.x - start.x, r.z - start.z) < 10) ramp = r;
  if (ramp && !S.ramps.includes(ramp.id)) { S.ramps.push(ramp.id); addMoney(50, ramp.ar); big('قفزة جديدة!', `${ramp.ar} — ${ar(S.ramps.length)}/${ar(ramps.length)}`); sound.jingle(); }
  else toast(`طيران ${ar(Math.round(t * 10) / 10)} ثانية!`);
  game.emit('jump', { t, ramp });
}
function drowned() {
  if (vehicleOf()) exitVehicle(true);
  big('غرقت!', 'النيل مش للعربيات'); sound.jingle(false);
  respawnAt(118, -10); addMoney(-Math.min(S.money, 20)); game.emit('drown');
}

// ---------- interiors ----------
function enterInterior(id, spawnKey = 'door') {
  const def = interiors[id]; if (!def || vehicleOf()) return;
  fade(() => {
    if (interior) interiors[interior].g.visible = false;
    interior = id; def.g.visible = true;
    const [x, z, ry] = def.spawn[spawnKey] || def.spawn.door;
    player.pos.set(x, 0, z); player.vy = 0; player.ry = ry; camYaw = ry + Math.PI; camPitch = 0.4;
    showCard(def.ar, ''); game.emit('enterInterior', id);
  });
}
function leaveInterior(doorId) {
  const d = doors.find(o => o.id === doorId);
  fade(() => {
    if (interior) interiors[interior].g.visible = false;
    const was = interior; interior = null;
    if (d) {
      let x = d.x, z = d.z + 1.0, ry = 0;
      if (d.id === 'roofdoor') { x = d.x - 1.0; z = d.z - 1.6; ry = Math.PI; }
      if (d.id === 'studio') { x = d.x + 1.2; z = d.z; ry = Math.PI / 2; }
      if (d.id === 'cafe') { z = d.z - 1.0; ry = Math.PI; }
      player.pos.set(x, (d.y || 0) + 0.3, z); player.vy = 0; player.ry = ry; camYaw = ry + Math.PI;
    }
    game.emit('leaveInterior', was);
  });
}
function fade(fn) { const f = $('fade'); f.classList.add('on'); setTimeout(() => { fn(); setTimeout(() => f.classList.remove('on'), 120); }, 260); }
function respawnAt(x, z) { if (interior) { interiors[interior].g.visible = false; interior = null; } player.pos.set(x, groundAt(x, z), z); player.vy = 0; player.knocked = false; }

// ---------- money, chaos (slipper meter), barks, toasts ----------
function addMoney(n, why) { S.money = Math.max(0, Math.round(S.money + n)); $('money').textContent = ar(S.money) + ' ج'; if (n > 0) { sound.cash(); if (why) toast(`+${ar(n)} ج — ${why}`); } }
let chaos = 0, chaosCool = 0, slipperHits = 0; const slippers = [];
function addChaos(n) { if (game && game.noChaos()) return; chaos = clamp(chaos + n, 0, 5); chaosCool = 0; }
function updateChaos(dt) {
  chaosCool += dt; if (chaosCool > 18) chaos = Math.max(0, chaos - dt * 0.12);
  const lvl = Math.floor(chaos + 0.001);
  const el = $('slip'); if (el.dataset.l !== String(lvl)) { el.dataset.l = lvl; el.innerHTML = ''; for (let i = 0; i < 5; i++) { const s = document.createElement('i'); if (i < lvl) s.className = 'on'; el.appendChild(s); } el.classList.toggle('hot', lvl >= 3); }
  const chaser = player.meta.id === 'mom' ? byId.dad : byId.mom;
  if (lvl >= 3 && !interior && !game.inMission()) {
    if (!chaser.chasing) { chaser.chasing = true; chaser.returning = false; const p = G.pos(); const a = Math.random() * 6.28; const sx = p.x + Math.cos(a) * 25, sz = p.z + Math.sin(a) * 25; chaser.pos.set(sx, groundAt(sx, sz), sz); bark(chaser, chaser === byId.mom ? 'إبراهييييم! الشبشب جاي!' : 'يا أم حمادة استني!'); toast('أم حمادة جاية بالشبشب! اهرب!'); }
    chaser.ai = chaseAI;
  } else if (chaser.chasing && (lvl < 2 || game.inMission())) { chaser.chasing = false; chaser.ai = null; chaser.returning = true; }
  for (const s of slippers) {
    s.t += dt; const tgt = G.pos();
    const k = Math.min(1, s.t / s.dur); const x = lerp(s.from.x, tgt.x, k), z = lerp(s.from.z, tgt.z, k), y = lerp(s.from.y, tgt.y + 1.2, k) + Math.sin(k * Math.PI) * 3;
    s.m.position.set(x, y, z); s.m.rotation.y += dt * 14; s.m.rotation.x += dt * 9;
    if (k >= 1) {
      scene.remove(s.m); s.dead = true; sound.bonk(); peds.starOwner = player; slipperHits++; toast('طاخ! شبشب!'); shakeT = 0.3; shakeAmp = 0.15; game.emit('slipperHit');
      if (slipperHits >= 3 && !game.inMission()) { slipperHits = 0; chaos = 0; big('اتمسكت!', 'أم حمادة رجّعتك البيت... ودفعت غرامة'); addMoney(-Math.min(S.money, 30)); if (vehicleOf()) exitVehicle(true); respawnAt(11, -4.5); for (const c of [byId.mom, byId.dad]) { if (c === player) continue; c.chasing = false; c.ai = null; c.pos.copy(c.home); } }
    }
  }
  for (let i = slippers.length - 1; i >= 0; i--) if (slippers[i].dead) slippers.splice(i, 1);
}
const slipperGeo = new THREE.BoxGeometry(0.5, 0.06, 0.2), slipperMat = M(0x1f5fd8);
function throwSlipper(from) {
  const m = new THREE.Mesh(slipperGeo, slipperMat); mesh(box(0.08, 0.08, 0.22), M(0xffd400), 0.05, 0.05, 0, m); scene.add(m);
  slippers.push({ m, t: 0, dur: 1.0, from: from.pos.clone().add(V(0, 1.4, 0)) }); sound.whoosh(); from.throwT = clock.elapsedTime + 0.4;
}
function chaseAI(a, dt) {
  const tgt = G.pos();
  const dx = tgt.x - a.pos.x, dz = tgt.z - a.pos.z, d = Math.hypot(dx, dz);
  if (d > 60) { const k = (d - 40) / d; a.pos.x += dx * k; a.pos.z += dz * k; a.pos.y = groundAt(a.pos.x, a.pos.z); }
  const spd = a.chaseSpeed || 6.0;
  if (d > 2.5) { a.pos.x += dx / d * spd * dt; a.pos.z += dz / d * spd * dt; a.moveK = 1; a.runK = 1; a.phase += dt * 10; } else a.moveK = lerp(a.moveK, 0, dt * 5);
  a.ry += angDiff(a.ry, Math.atan2(dx, dz)) * Math.min(1, dt * 8);
  a.throwCD = (a.throwCD ?? 2) - dt;
  if (d < (a.throwRange || 22) && a.throwCD <= 0) { throwSlipper(a); a.throwCD = a.throwEvery || 2.2; }
}

const barks = [];
function bark(who, text) {
  if (!who) return; const el = document.createElement('div'); el.className = 'bark'; el.textContent = text; $('hud').appendChild(el);
  barks.push({ el, who, t: 2.6 }); if (barks.length > 3) { const b = barks.shift(); b.el.remove(); }
  if (who.isActor) who.talkUntil = clock.elapsedTime + 1.2; else who.talkT = 1.2;
}
const projV = V(0, 0, 0);
function updateBarks(dt) {
  for (let i = barks.length - 1; i >= 0; i--) {
    const b = barks[i]; b.t -= dt; if (b.t <= 0) { b.el.remove(); barks.splice(i, 1); continue; }
    const base = b.who.inVehicle ? b.who.inVehicle.pos : b.who.pos; projV.set(base.x, base.y + 2.4, base.z).project(camera);
    if (projV.z > 1) { b.el.style.display = 'none'; continue; }
    b.el.style.display = ''; b.el.style.left = `${(projV.x * 0.5 + 0.5) * window.innerWidth}px`; b.el.style.top = `${(-projV.y * 0.5 + 0.5) * window.innerHeight}px`; b.el.style.opacity = Math.min(1, b.t * 2);
  }
}
let toastT = 0;
function toast(text) { const el = $('toast'); el.textContent = text; el.classList.add('on'); toastT = 2.6; }
let bigT = 0;
function big(title, sub = '') { $('bigT').textContent = title; $('bigS').textContent = sub; const el = $('big'); el.classList.remove('on'); void el.offsetWidth; el.classList.add('on'); bigT = 3.4; }

// ---------- camera ----------
const camTarget = V(0, 0, 0);
function rayBoxT(ox, oz, dx, dz, b) {
  let t0 = 0, t1 = 1;
  for (const [o, d, lo, hi] of [[ox, dx, b.x0, b.x1], [oz, dz, b.z0, b.z1]]) { if (Math.abs(d) < 1e-9) { if (o < lo || o > hi) return 2; continue; } let a = (lo - o) / d, c = (hi - o) / d; if (a > c) [a, c] = [c, a]; t0 = Math.max(t0, a); t1 = Math.min(t1, c); if (t0 > t1) return 2; }
  return t0;
}
const camQ = [], tgtV = V(0, 0, 0);
function updateCamera(dt) {
  const v = vehicleOf(); const base = v ? v.pos : player.pos;
  const headY = base.y + (v ? Math.max(1.6, v.H * 0.8) : 1.55);
  camTarget.lerp(tgtV.set(base.x, headY, base.z), Math.min(1, dt * (v ? 14 : 10)));
  let dist = v ? (v.L * 0.9 + 3.6) * (document.body.classList.contains('portrait') ? 1.35 : 1) : camDist * (document.body.classList.contains('portrait') ? 1.15 : 1);
  if (interior) dist = Math.min(dist, 3.4);
  if (v && look.id === null) { look.t -= dt; if (look.t <= 0) { camYaw += angDiff(camYaw, v.yaw - Math.PI / 2 + (v.speed < -1 ? Math.PI : 0)) * Math.min(1, dt * 3); camPitch = lerp(camPitch, 0.22, dt * 2); } }
  const cx = Math.sin(camYaw) * Math.cos(camPitch) * dist, cz = Math.cos(camYaw) * Math.cos(camPitch) * dist, cy = Math.sin(camPitch) * dist;
  let t = 1;
  for (const b of queryColliders(camTarget.x + cx / 2, camTarget.z + cz / 2, dist / 2 + 1, camQ)) { if (b.circle || b.h < 1.5) continue; const bt = rayBoxT(camTarget.x, camTarget.z, cx, cz, { x0: b.x0 - 0.25, x1: b.x1 + 0.25, z0: b.z0 - 0.25, z1: b.z1 + 0.25 }); if (bt < t && camTarget.y + cy * bt < b.h) t = bt; }
  t = Math.max(0.15, t - 0.02);
  let shx = 0, shy = 0; if (shakeT > 0) { shakeT -= dt; shx = (Math.random() - 0.5) * shakeAmp; shy = (Math.random() - 0.5) * shakeAmp; }
  camera.position.set(camTarget.x + cx * t + shx, Math.max(base.y + 0.4, camTarget.y + cy * t) + shy, camTarget.z + cz * t);
  camera.lookAt(camTarget.x, camTarget.y - 0.15, camTarget.z);
  const wantFov = (document.body.classList.contains('portrait') ? 72 : 58) + (v ? Math.min(12, Math.abs(v.speed) * 0.4) : 0);
  if (Math.abs(camera.fov - wantFov) > 0.1) { camera.fov = lerp(camera.fov, wantFov, Math.min(1, dt * 3)); camera.updateProjectionMatrix(); }
}
function autoFollow(dt) {
  if (vehicleOf() || look.id !== null || player.moveK < 0.3 || input.keys.size) return;
  camYaw += angDiff(camYaw, player.ry + Math.PI) * Math.min(1, dt * 0.9) * player.moveK;
}

// ---------- day / night ----------
const skyDay = new THREE.Color(0xffffff), skyDusk = new THREE.Color(0xffb080), skyNight = new THREE.Color(0x1a2050);
const fogDay = new THREE.Color(0xe8d8b8), fogNight = new THREE.Color(0x1a1e38), fogDusk = new THREE.Color(0xd88a60);
const tmpC = new THREE.Color(), tmpC2 = new THREE.Color();
function updateDayNight(dt) {
  S.time = (S.time + dt * 0.025) % 24;
  const h = S.time, elev = Math.sin((h - 6) / 12 * Math.PI);
  const day = clamp(elev * 2.2 + 0.25, 0, 1), dusk = clamp(1 - Math.abs(elev) * 4, 0, 1) * (h > 4 && h < 21 ? 1 : 0);
  sun.intensity = interior ? 0.6 : 0.22 + day * 1.3; sun.color.copy(tmpC.set(0x6070c0).lerp(tmpC2.set(0xfff0d0), day)).lerp(tmpC2.set(0xff9a50), dusk);
  sun.position.set(Math.cos((h - 6) / 12 * Math.PI) * 60, 20 + Math.max(0, elev) * 60, 25);
  hemi.intensity = interior ? 1.1 : 0.2 + day * 0.95; hemi.color.copy(tmpC.set(0x5060a0).lerp(tmpC2.set(0xdcecff), day));
  world.dyn.sky.material.color.copy(tmpC.copy(skyNight).lerp(skyDay, day)).lerp(skyDusk, dusk * 0.6);
  scene.fog.color.copy(tmpC.copy(fogNight).lerp(fogDay, day)).lerp(fogDusk, dusk * 0.5);
  world.dyn.skyline.material.color.copy(tmpC.set(0x404060).lerp(skyDay, day));
  world.dyn.pyramids.children[0].material.color.copy(tmpC.set(0x3a3048).lerp(tmpC2.set(0xd8b070), day));
  const night = clamp(1 - day * 1.6, 0, 1);
  for (const m of facadeMats) m.emissiveIntensity = night * 0.9;
  lampBulbMat.color.copy(tmpC.set(0xd8d8c8).lerp(tmpC2.set(0xfff0a0), night));
  world.dyn.water.material.color.copy(tmpC.set(0x101a30).lerp(tmpC2.set(0x3a7aa8), day));
  const hh = Math.floor(h), mm = Math.floor((h - hh) * 6) * 10;
  $('clock').textContent = `${ar(((hh + 11) % 12) + 1)}:${ar(String(mm).padStart(2, '0'))} ${hh < 12 ? 'ص' : 'م'}`;
}

// ---------- maps ----------
const MAPX0 = -185, MAPZ0 = -185, MAPW = 620, MAPH = 820;
const mapBase = document.createElement('canvas'); mapBase.width = MAPW; mapBase.height = MAPH;
function drawMapBase() {
  const g = mapBase.getContext('2d'); const X = (x) => x - MAPX0, Z = (z) => z - MAPZ0;
  g.fillStyle = '#d8b878'; g.fillRect(0, 0, MAPW, MAPH);
  g.fillStyle = '#4a4a4e'; g.fillRect(X(-165), Z(-165), 290, 330);
  g.fillStyle = '#3a7aa8'; g.fillRect(X(RIVER.x0), 0, RIVER.x1 - RIVER.x0, MAPH);
  const I = RIVER.isle; g.fillStyle = '#4f8a3a'; g.fillRect(X(I.x0), Z(I.z0), I.x1 - I.x0, I.z1 - I.z0);
  g.fillStyle = '#5a5a5e'; g.fillRect(X(RIVER.bridge.x0), Z(-5), RIVER.bridge.x1 - RIVER.bridge.x0, 10); g.fillRect(X(-6), Z(165), 12, 420);
  g.fillStyle = '#8a7a5a'; g.fillRect(X(15), Z(190), 110, 120);
  const col = { bld: '#b49a74', home: '#1f9e5a', garage: '#2f5fb0', plaza: '#d8c49a', stall: '#8a5a2b', mosque: '#3a8a6a', studio: '#d8231b', scrap: '#6a5a48', mall: '#7a90a8', school: '#c8a050', factory: '#9ab0c8', ramp: '#ffd400' };
  for (const r of mapRects) { g.fillStyle = col[r.kind] || '#b49a74'; g.fillRect(X(r.x0), Z(r.z0), r.x1 - r.x0, r.z1 - r.z0); }
  g.fillStyle = '#4f8a3a'; g.beginPath(); g.arc(X(0), Z(0), 4, 0, 7); g.fill(); g.fillRect(X(46.5), Z(46.5), 27, 27);
}
const mm = $('minimap'), mg = mm.getContext('2d');
function drawMinimap() {
  const S2 = mm.width, scale = 1.0, pz = interior ? null : G.pos();
  mg.fillStyle = '#0b0f2e'; mg.fillRect(0, 0, S2, S2);
  if (!pz) { mg.fillStyle = '#fff'; mg.font = '18px Lalezar'; mg.textAlign = 'center'; mg.fillText('جوّه', S2 / 2, S2 / 2 + 6); return; }
  const view = S2 / scale; mg.imageSmoothingEnabled = false;
  mg.drawImage(mapBase, pz.x - MAPX0 - view / 2, pz.z - MAPZ0 - view / 2, view, view, 0, 0, S2, S2);
  const T = (x, z) => [S2 / 2 + (x - pz.x) * scale, S2 / 2 + (z - pz.z) * scale];
  for (const m of game.mapMarkers()) {
    let [x, y] = T(m.x, m.z); const out = x < 7 || y < 7 || x > S2 - 7 || y > S2 - 7; x = clamp(x, 7, S2 - 7); y = clamp(y, 7, S2 - 7);
    mg.fillStyle = m.col || '#ffd400'; mg.strokeStyle = '#000'; mg.lineWidth = 2; mg.beginPath(); mg.arc(x, y, out ? 4 : 6, 0, 7); mg.fill(); mg.stroke();
    if (m.icon && !out) { mg.fillStyle = '#000'; mg.font = '10px Lalezar'; mg.textAlign = 'center'; mg.fillText(m.icon, x, y + 4); }
  }
  mg.save(); mg.translate(S2 / 2, S2 / 2); mg.rotate(vehicleOf() ? -vehicleOf().yaw + Math.PI / 2 : -player.ry + Math.PI);
  mg.fillStyle = '#fff'; mg.strokeStyle = '#000'; mg.lineWidth = 1.5; mg.beginPath(); mg.moveTo(0, -7); mg.lineTo(5, 5); mg.lineTo(0, 2.5); mg.lineTo(-5, 5); mg.closePath(); mg.stroke(); mg.fill(); mg.restore();
}
function drawBigMap() {
  const c = $('bigmap'); if (!c) return; const g = c.getContext('2d'); const W = c.width, H = c.height;
  const s = Math.min(W / MAPW, H / MAPH); const ox = (W - MAPW * s) / 2, oy = (H - MAPH * s) / 2;
  g.fillStyle = '#0b0f2e'; g.fillRect(0, 0, W, H); g.imageSmoothingEnabled = false; g.drawImage(mapBase, ox, oy, MAPW * s, MAPH * s);
  const T = (x, z) => [ox + (x - MAPX0) * s, oy + (z - MAPZ0) * s];
  g.font = '12px Lalezar'; g.textAlign = 'center';
  for (const zn of zones) { if (zn.r < 4 || zn.y) continue; const [x, y] = T(zn.x, zn.z); g.fillStyle = 'rgba(0,0,0,0.7)'; g.fillText(zn.ar, x + 1, y + 1); g.fillStyle = '#fff'; g.fillText(zn.ar, x, y); }
  for (const m of game.mapMarkers(true)) { const [x, y] = T(m.x, m.z); g.fillStyle = m.col || '#ffd400'; g.strokeStyle = '#000'; g.lineWidth = 2; g.beginPath(); g.arc(x, y, 6, 0, 7); g.fill(); g.stroke(); if (m.icon) { g.fillStyle = '#000'; g.font = '10px Lalezar'; g.fillText(m.icon, x, y + 4); g.font = '12px Lalezar'; } }
  if (!interior) { const p = G.pos(); const [x, y] = T(p.x, p.z); g.fillStyle = '#fff'; g.strokeStyle = '#d8231b'; g.lineWidth = 3; g.beginPath(); g.arc(x, y, 7, 0, 7); g.fill(); g.stroke(); }
  c.onclick = (e) => { const r = c.getBoundingClientRect(); const x = (e.clientX - r.left) / r.width * W, y = (e.clientY - r.top) / r.height * H; game.setWaypoint((x - ox) / s + MAPX0, (y - oy) / s + MAPZ0); drawBigMap(); toast('اتحطت علامة على الخريطة'); };
}

// ---------- portraits, picker, phone ----------
const portraits = {};
function makePortraits() {
  const pc = document.createElement('canvas'); pc.width = pc.height = 96;
  const r = new THREE.WebGLRenderer({ canvas: pc, antialias: false, alpha: true, preserveDrawingBuffer: true }); r.outputColorSpace = THREE.SRGBColorSpace;
  const sc = new THREE.Scene(); sc.add(new THREE.HemisphereLight(0xffffff, 0x806050, 1.6)); const dl = new THREE.DirectionalLight(0xffffff, 1.2); dl.position.set(1, 2, 3); sc.add(dl);
  const cam = new THREE.PerspectiveCamera(30, 1, 0.05, 20);
  for (const meta of CAST) {
    const c = buildCharacter(meta.id, sc); applyPose(c, POSE0); c.faceMat.map = faceTexture('default', 'smile', meta.face); c.faceMat.needsUpdate = true;
    c.root.updateMatrixWorld(true); const h = c.head.getWorldPosition(V(0, 0, 0));
    cam.position.set(h.x + 0.35, h.y + 0.05, h.z + 1.6); cam.lookAt(h.x, h.y - 0.08, h.z); r.render(sc, cam); portraits[meta.id] = pc.toDataURL(); sc.remove(c.root);
  }
  r.dispose(); r.forceContextLoss();
}
function buildPicker() {
  const grid = $('pickgrid'); grid.innerHTML = '';
  for (const meta of CAST) {
    const b = document.createElement('button'); b.className = 'pick ui'; b.dataset.id = meta.id;
    b.innerHTML = `<img src="${portraits[meta.id]}" alt=""><span style="background:${meta.col}">${meta.ar}</span>`;
    b.addEventListener('click', () => { if (game.inMission()) { toast('خلّص المهمة الأول'); return; } switchTo(meta.id); togglePicker(false); });
    grid.appendChild(b);
  }
}
function togglePicker(force) { const el = $('picker'); const on = force ?? !el.classList.contains('on'); el.classList.toggle('on', on); if (on) { $('phone').classList.remove('on'); for (const b of document.querySelectorAll('.pick')) b.classList.toggle('cur', b.dataset.id === player.meta.id); } }
$('switchBtn').addEventListener('click', () => togglePicker());
$('pickClose').addEventListener('click', () => togglePicker(false));
function switchTo(id, quiet) {
  const next = byId[id]; if (!next || next === player) return;
  if (vehicleOf()) exitVehicle(true);
  if (interior) { interiors[interior].g.visible = false; interior = null; }
  if (player) { player.returning = true; }
  player = next; player.returning = false; player.ai = null; player.chasing = false; player.knocked = false;
  if (next.inVehicle) { const v = next.inVehicle; next.inVehicle = null; scene.add(next.c.root); next.c.root.scale.setScalar(1); v.driver = null; next.pos.copy(v.pos); }
  camYaw = player.ry + Math.PI;
  $('switchImg').src = portraits[id]; $('switchName').textContent = player.meta.ar; $('switchName').style.background = player.meta.col;
  if (started && !quiet) showCard(`بقيت ${player.meta.ar}`, player.meta.en);
}
let phoneTab = 'missions';
function togglePhone(force) { const el = $('phone'); const on = force ?? !el.classList.contains('on'); el.classList.toggle('on', on); if (on) { $('picker').classList.remove('on'); renderPhone(); } }
$('phoneBtn').addEventListener('click', () => togglePhone());
$('phoneClose').addEventListener('click', () => togglePhone(false));
for (const b of document.querySelectorAll('.tab')) b.addEventListener('click', () => { phoneTab = b.dataset.tab; renderPhone(); });
function renderPhone() {
  for (const b of document.querySelectorAll('.tab')) b.classList.toggle('cur', b.dataset.tab === phoneTab);
  const body = $('phoneBody'); body.innerHTML = '';
  if (phoneTab === 'map') { const c = document.createElement('canvas'); c.id = 'bigmap'; c.width = 420; c.height = 540; body.appendChild(c); const h = document.createElement('p'); h.className = 'hint2'; h.textContent = 'دوس على أي مكان عشان تحط علامة، وهتلاقي سهم يوديك'; body.appendChild(h); drawBigMap(); return; }
  body.appendChild(game.phonePage(phoneTab, { reset: () => { store.clear(); location.reload(); } }));
}

// ---------- context action ----------
let ctxAction = null;
function computeContext() {
  if (dlgActive()) return null;
  const cands = []; const v = vehicleOf();
  if (!v && !player.knocked) {
    if (interior) { for (const e of interiors[interior].exits) if (Math.hypot(player.pos.x - e.x, player.pos.z - e.z) < e.r + 0.6) cands.push({ p: 5, ar: e.ar, fn: () => leaveInterior(e.to) }); }
    else for (const d of doors) { if (Math.abs((d.y || 0) - player.pos.y) > 2) continue; if (Math.hypot(player.pos.x - d.x, player.pos.z - d.z) < d.r + 0.4) cands.push({ p: 5, ar: d.ar, fn: () => (d.id === 'roofdoor' ? enterInterior('apartment', 'stairs') : enterInterior(d.interior)) }); }
    if (!interior) { const nv = vehicles.nearestEnterable(player.pos.x, player.pos.z); if (nv) cands.push({ p: 4, ar: `اركب ${nv.ar}`, fn: () => enterVehicle(nv) }); }
    let best = null, bd = 2.4; for (const a of actors) { if (a === player || a.inVehicle || !a.c.root.visible || a.knocked) continue; const d = a.pos.distanceTo(player.pos); if (d < bd) { bd = d; best = a; } }
    if (best) cands.push({ p: 3, ar: `كلّم ${best.meta.ar}`, fn: () => talkTo(best) });
  }
  for (const c of game.contextActions()) cands.push(c);
  cands.sort((a, b) => b.p - a.p);
  return cands[0] || null;
}
function doContext() { if (dlgActive()) { advanceDlg(); return; } if (ctxAction) ctxAction.fn(); }
$('ctxBtn').addEventListener('click', doContext);
$('jumpBtn').addEventListener('pointerdown', (e) => { e.preventDefault(); input.jump = true; });
$('exitBtn').addEventListener('click', () => exitVehicle());
$('hornBtn').addEventListener('pointerdown', (e) => { e.preventDefault(); honk(); });
$('brakeBtn').addEventListener('pointerdown', (e) => { e.preventDefault(); input.brake = true; });
for (const ev of ['pointerup', 'pointerleave', 'pointercancel']) $('brakeBtn').addEventListener(ev, () => { input.brake = false; });
$('redBtn').addEventListener('click', () => { input.red = !input.red; if (input.red) toast('الزرار الأحمر!! الجويستيك لفوق = اطلع'); });
function updateDriveUI() { const v = vehicleOf(); document.body.classList.toggle('driving', !!v); $('redWrap').classList.toggle('off', !(v && v.kind === 'samir' && hasFlag('redButton'))); }

// ---------- dialogue sequences ----------
let dlgQueue = [], dlgCur = null, dlgTimer = 0, dlgShown = 0, dlgDone = null;
const dlgActive = () => !!dlgCur;
function say(lines, done) { dlgQueue = lines.slice(); dlgDone = done || null; nextLine(); }
function nextLine() {
  const l = dlgQueue.shift();
  if (!l) { dlgCur = null; $('dlg').classList.remove('on'); const d = dlgDone; dlgDone = null; if (d) d(); return; }
  const [who, text] = l; const meta = CAST_BY_ID[who] || { ar: who, en: '', col: '#555' };
  dlgCur = { who, text }; dlgShown = 0; dlgTimer = 1.8 + text.length * 0.065;
  $('dlgImg').src = portraits[who] || ''; $('dlgImg').style.visibility = portraits[who] ? '' : 'hidden';
  $('dlgName').textContent = meta.ar; $('dlgName').style.background = meta.col; $('dlgEn').textContent = meta.en || ''; $('dlgText').textContent = ''; $('dlg').classList.add('on');
  const a = byId[who]; if (a) a.talkUntil = clock.elapsedTime + Math.min(dlgTimer - 0.5, 0.8 + text.length * 0.045);
}
function advanceDlg() { if (!dlgCur) return; if (dlgShown < dlgCur.text.length) dlgShown = dlgCur.text.length; else nextLine(); }
$('dlg').addEventListener('click', advanceDlg);
function updateDialogue(dt) {
  if (!dlgCur) return;
  dlgTimer -= dt; dlgShown = Math.min(dlgCur.text.length, dlgShown + dt * 24);
  const words = dlgCur.text.split(' '); let acc = 0; const out = [];
  for (const w of words) { if (acc + w.length * 0.5 <= dlgShown) { out.push(w); acc += w.length + 1; } else break; }
  $('dlgText').textContent = out.join(' ');
  if (dlgTimer <= 0) nextLine();
}
function talkTo(a) { const custom = game.talkOverride(a.meta.id); if (custom) { say(custom); return; } say([[a.meta.id, a.meta.lines[a.lineIx++ % a.meta.lines.length]]]); }

let cardTimer = 0, curZone = null;
function showCard(ar2, en) { $('cardAr').textContent = ar2; $('cardEn').textContent = en; const el = $('card'); el.classList.remove('on'); void el.offsetWidth; el.classList.add('on'); cardTimer = 2.6; }
function updateZone() {
  if (interior) return; const p = G.pos();
  let z = null; for (const q of zones) { if (q.y ? Math.abs(p.y - q.y) > 3 : p.y > 6) continue; if ((p.x - q.x) ** 2 + (p.z - q.z) ** 2 < q.r * q.r) { if (!z || q.r < z.r) z = q; } }
  if (z && z !== curZone) showCard(z.ar, z.en);
  curZone = z;
}

// ---------- the API handed to gameplay.js ----------
const clock = new THREE.Clock();
let started = false;
const G = {
  S, scene, camera, sound, actors, byId, ar, CAST_BY_ID,
  get vehicles() { return vehicles; }, get peds() { return peds; }, get interiors() { return interiors; }, get world() { return world; },
  get player() { return player; }, get interior() { return interior; }, get started() { return started; },
  vehicleOf, hasFlag, setFlag, addMoney, addChaos, say, toast, big, bark, showCard, explosion, emitPuff, chaseAI,
  switchTo, enterVehicle, exitVehicle, enterInterior, leaveInterior, respawnAt, saveState, knockPerson, throwSlipper, fade, portraits, dlgActive,
  get t() { return clock.elapsedTime; }, get chaos() { return chaos; }, set chaos(v) { chaos = v; }, resetSlipperHits() { slipperHits = 0; },
  pos() { return vehicleOf() ? vehicleOf().pos : player.pos; },
  teleport(x, z, ry = 0, y) { if (interior) { interiors[interior].g.visible = false; interior = null; } const v = vehicleOf(); if (v) vehicles.place(v, x, z, ry); else { player.pos.set(x, y ?? groundAt(x, z), z); player.vy = 0; player.ry = ry; } camYaw = v ? ry - Math.PI / 2 : ry + Math.PI; },
};

// ---------- boot ----------
async function boot() {
  resize(); loadState();
  await Promise.all([document.fonts.load('22px Lalezar'), document.fonts.load('14px "Press Start 2P"')]).catch(() => {});
  world = buildWorld(scene);
  interiors = buildInteriors(scene);
  vehicles = new Vehicles(scene, {
    crash: (v, o, imp) => { if (v === vehicleOf() || o === vehicleOf()) { sound.crash(imp); shakeT = 0.25; shakeAmp = Math.min(0.3, imp * 0.02); addChaos(o && o.ai ? 0.35 : 0.1); game.emit('crash', { v, o, imp }); if (o && o.ai) bark({ pos: o.pos, isPed: true }, ['يا عم بص قدامك!', 'العربية!!', 'هتدفع التصليح!'][Math.floor(Math.random() * 3)]); } },
    knock: (p, v, dx, dz, spd) => { knockPerson(p, dx, dz, spd); if (v === vehicleOf()) { addChaos(p.isActor ? 0.6 : 0.5); S.knocked++; game.emit('knock', p); } },
    honk: (v) => { if (Math.hypot(v.pos.x - camera.position.x, v.pos.z - camera.position.z) < 40) sound.horn(v.type); },
    land: (v, impact) => { if (v === vehicleOf()) { emitPuff(v.pos.x, v.pos.y + 0.2, v.pos.z, 8, puffT, 3); shakeT = 0.2; shakeAmp = 0.15; sound.crash(impact * 0.5); } },
    drown: (v) => { if (v === vehicleOf()) drowned(); },
  });
  const samirV = vehicles.adoptSpecial('samir', world.samirCar); vehicles.place(samirV, 19.5, -3.4, 0);
  const tukV = vehicles.adoptSpecial('tuk', world.tuk); vehicles.place(tukV, -3.4, 11.2, -Math.PI / 2);
  G.samirV = samirV; G.tukV = tukV;
  peds = new Peds(scene, { bark: (p, text) => bark(p, text) });
  football = new Football(scene, peds);
  for (const meta of CAST) makeActor(meta);
  makePortraits(); buildPicker(); drawMapBase();
  game = createGameplay(G);
  player = null; switchTo(byId[S.who] ? S.who : 'dad', true);
  if (S.pos) { player.pos.set(S.pos[0], groundAt(S.pos[0], S.pos[1]), S.pos[1]); camYaw = player.ry + Math.PI; }
  camTarget.set(player.pos.x, player.pos.y + 1.55, player.pos.z);
  addMoney(0); updateDriveUI(); updateDayNight(0);
  const ctx0 = frameCtx(0, true); for (let i = 0; i < 12; i++) { vehicles.update(0.016, ctx0); peds.update(0.016, ctx0); }
  window.__game = { scene, renderer, camera, actors, vehicles, peds, world, G, game, player: () => player, switchTo, setInput: (x, y, run) => { joy.x = x; joy.y = y; input.keys.clear(); if (run) input.keys.add('ShiftLeft'); }, setCam: (yaw, pitch) => { camYaw = yaw; if (pitch !== undefined) camPitch = pitch; }, teleport: (x, z, ry) => G.teleport(x, z, ry), enter: (v) => enterVehicle(v), exit: () => exitVehicle(true), ctx: () => ctxAction, doContext, setTime: (h) => { S.time = h; }, S, red: (on) => { input.red = on; } };
  $('loading').classList.add('hide'); $('startBtn').classList.add('on');
  if (store.get()) { $('startBtn').textContent = 'كمّل'; $('newBtn').classList.add('on'); }
  renderer.setAnimationLoop(loop);
}
$('startBtn').addEventListener('click', async () => {
  $('title').classList.add('hide'); started = true; curZone = null; sound.start();
  try { if (matchMedia('(pointer: coarse)').matches && document.documentElement.requestFullscreen) await document.documentElement.requestFullscreen(); } catch { /* not allowed */ }
  game.onStart();
});
$('newBtn').addEventListener('click', () => { store.clear(); location.reload(); });

function frameCtx(t, initial = false) {
  const focus = G.pos(); const inside = !!interior;
  return { focus, t, initial, people, player: inside ? null : focus, inVehicle: !!vehicleOf(), trafficCount: inside ? 0 : quality < 0.8 ? 6 : 10, pedCount: inside ? 0 : quality < 0.8 ? 10 : 16, parkedMax: quality < 0.8 ? 6 : 10, viewDist: FOG_FAR,
    playerNear: (v) => Math.hypot(focus.x - v.pos.x, focus.z - v.pos.z) < 14,
    events: { kick: () => sound.blip(), goal: (byPlayer) => { if (byPlayer) { S.goals++; addMoney(10, 'جووول!'); sound.cheer(); game.emit('goal'); } } } };
}
let fpsAcc = 0, fpsN = 0, saveT = 0;
function loop() {
  const dt = Math.min(0.05, clock.getDelta()); const t = clock.elapsedTime;
  if (!player) return;
  people.length = 0; for (const a of actors) people.push(a); for (const p of peds.list) people.push(p);
  const ctx = frameCtx(t);
  const paused = $('phone').classList.contains('on') || $('picker').classList.contains('on');
  if (!paused) {
    const v = vehicleOf();
    if (started && !dlgActive() && !game.frozen()) { if (v) updateDriving(v, dt); else { updateWalker(player, dt, readInput()); autoFollow(dt); sound.setEngine(false, 0); } }
    else if (v) { vehicles.drive(v, 0, 0, true, dt); player.pos.copy(v.pos); }
    else { updateWalker(player, dt, null); player.moveK = lerp(player.moveK, 0, dt * 8); }
    for (const a of actors) if (a !== player) updateNPC(a, dt);
    vehicles.update(dt, ctx); peds.update(dt, ctx); if (!interior) football.update(dt, ctx);
    if (started) { updateChaos(dt); updateZone(); updateDialogue(dt); game.update(dt); updateDayNight(dt); }
    else { camYaw += dt * 0.08; }
  }
  for (const a of actors) {
    let vis;
    if (a === player) vis = true;
    else if (a.inVehicle) vis = a.inVehicle.root.visible;
    else vis = a.pos.distanceTo(camera.position) < 70 && ((a.pos.x > 900) === !!interior);
    a.c.root.visible = vis; if (vis) poseActor(a, t, dt);
  }
  updatePuffs(dt); updateBarks(dt);
  updateCamera(dt);
  cullChunks(camera.position.x, camera.position.z, FOG_FAR);
  world.dyn.skyline.position.x = camera.position.x; world.dyn.skyline.position.z = camera.position.z;
  world.dyn.sky.position.copy(camera.position);
  for (const f of world.dyn.feluccas) { f.z += f.v * dt; if (f.z > 200) f.z = -200; f.g.position.set(f.x, -1.0 + Math.sin(t + f.x) * 0.08, f.z); f.g.rotation.set(Math.sin(t * 0.8 + f.x) * 0.04, -Math.PI / 2, 0); }
  renderer.render(scene, camera);
  drawMinimap();
  ctxAction = started ? computeContext() : null;
  const cb = $('ctxBtn'); if (ctxAction) { cb.classList.add('on'); cb.textContent = ctxAction.ar; } else cb.classList.remove('on');
  if (cardTimer > 0) { cardTimer -= dt; if (cardTimer <= 0) $('card').classList.remove('on'); }
  if (toastT > 0) { toastT -= dt; if (toastT <= 0) $('toast').classList.remove('on'); }
  if (bigT > 0) { bigT -= dt; if (bigT <= 0) $('big').classList.remove('on'); }
  saveT += dt; if (saveT > 4 && started) { saveT = 0; saveState(); }
  fpsAcc += dt; fpsN++;
  if (fpsAcc > 2) { const fps = fpsN / fpsAcc; fpsAcc = 0; fpsN = 0; if (fps < 26 && quality > 0.55) { quality -= 0.15; resize(); } }
}
boot();
