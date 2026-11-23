// Pedestrians: cheap 6-part people walking the sidewalk loops, reacting to cars, getting knocked over (cartoon stars),
// waving for a taxi, and the kids' football game in the school yard.
import * as THREE from 'three';
import { rng, clamp, lerp, mesh, box, cyl, M, plainGeo, vcMat, mergeGeometries, faceTexture } from './kit.js';
import { sidewalkLoops, groundAt, queryColliders } from './world.js';

const SKIN = [0x8a5a3a, 0xa87048, 0xb98058, 0xc98d5f, 0x9a6440, 0xb27448, 0x7a4a2e];
const SHIRT = [0xf0f0f0, 0x1f5fd8, 0xd8231b, 0x2f8f3a, 0xffd400, 0x6a4a8a, 0x3a3a3a, 0xe88a3a, 0x8ab0d8, 0xc8a080];
const PANTS = [0x2a2a3a, 0x3a4a6a, 0x5a4a3a, 0x6a6a6a, 0x1a1a1a, 0x8a7a5a];
const GALAB = [0xf0ece0, 0x8a8f96, 0x6b5a48, 0x3a4a5a, 0xc8b8a0, 0x2a3a2a];
const SCARF = [0x1f9e5a, 0xd8231b, 0x1f5fd8, 0x111111, 0xec86ad, 0x8a5a2b, 0xf0d060, 0x6a2a5a];
const DRESS = [0x111111, 0x2a2a4a, 0x5a2a3a, 0x3a4a3a, 0x6a5a8a];
const MOODS = ['default', 'side', 'tired', 'smug', 'default'];

const tmpC = new THREE.Color();
function part(list, geo, x, y, z, color, rx = 0, ry = 0, rz = 0, sx = 1, sy = 1, sz = 1) {
  const m = new THREE.Matrix4().compose(new THREE.Vector3(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz)), new THREE.Vector3(sx, sy, sz));
  list.push(plainGeo(geo, m, tmpC.setHex(color).clone()));
}
const G = { box: (w, h, d) => new THREE.BoxGeometry(w, h, d), cyl: (a, b, h, s = 6) => new THREE.CylinderGeometry(a, b, h, s), sph: (r, w = 8, h = 6) => new THREE.SphereGeometry(r, w, h), ico: (r) => new THREE.IcosahedronGeometry(r, 0) };

export function makePed(seed, opts = {}) {
  const r = rng(seed);
  const kid = opts.kid ?? r() < 0.15, female = opts.female ?? r() < 0.42, galab = !female && r() < 0.3;
  const s = kid ? 0.68 : 0.95 + r() * 0.1;
  const skin = SKIN[Math.floor(r() * SKIN.length)];
  const shirt = kid ? [0xd4141c, 0x1f5fd8, 0xffd400, 0x2f8f3a, 0xf0f0f0][Math.floor(r() * 5)] : SHIRT[Math.floor(r() * SHIRT.length)];
  const pants = PANTS[Math.floor(r() * PANTS.length)];
  const robe = female ? DRESS[Math.floor(r() * DRESS.length)] : galab ? GALAB[Math.floor(r() * GALAB.length)] : null;
  const fat = r() < 0.3 ? 1.25 : 1;
  const root = new THREE.Group();
  const hipY = 0.84;
  const hips = new THREE.Group(); hips.position.y = hipY; root.add(hips);
  // torso + head merged
  const tl = [];
  const tc = robe ?? shirt;
  part(tl, G.cyl(0.25 * fat, 0.28 * fat, 0.66, 7), 0, 0.33, 0, tc);
  if (robe) part(tl, G.cyl(0.3 * fat, 0.42 * fat, 0.72, 7), 0, -0.3, 0, robe);
  else part(tl, G.cyl(0.27 * fat, 0.27 * fat, 0.22, 7), 0, -0.02, 0, pants);
  part(tl, G.cyl(0.09, 0.1, 0.1, 6), 0, 0.7, 0, skin);
  const headY = 0.97, hr = 0.28;
  part(tl, G.sph(hr, 8, 6), 0, headY, 0, skin);
  part(tl, new THREE.ConeGeometry(0.06, 0.12, 4), 0, headY - 0.02, hr * 0.98, skin, Math.PI / 2);
  if (female) { const sc = SCARF[Math.floor(r() * SCARF.length)]; part(tl, new THREE.SphereGeometry(0.31, 8, 5, 0, Math.PI * 2, 0, Math.PI * 0.55), 0, headY + 0.03, -0.03, sc, -0.35); part(tl, G.ico(0.09), 0, headY - 0.12, -0.28, sc); part(tl, G.box(0.36, 0.3, 0.1), 0, 0.62, -0.18, sc); }
  else {
    const hairC = r() < 0.15 ? 0xd8d8d8 : 0x17110c; const st = r();
    if (st < 0.25) part(tl, new THREE.SphereGeometry(0.29, 8, 4, 0, Math.PI * 2, 0, Math.PI * 0.42), 0, headY + 0.02, 0, galab ? 0xf2f2f2 : 0x3a3a3a); // cap / taqiyah
    else if (st < 0.4) { part(tl, G.cyl(0.24, 0.26, 0.12, 8), 0, headY + 0.2, -0.02, 0xf4f2ea); part(tl, G.sph(0.2, 7, 4), 0, headY + 0.24, -0.02, 0xf4f2ea); } // turban
    else { for (let i = 0; i < 6; i++) { const a = r() * 6.28; part(tl, G.ico(0.11), Math.cos(a) * 0.16, headY + 0.2 + r() * 0.05, Math.sin(a) * 0.14 - 0.05, hairC); } }
  }
  if (!female && !kid && r() < 0.3) part(tl, G.box(0.2, 0.12, 0.02), 0.1, 0.45, 0.26 * fat, 0xffffff); // pocket pen/paper
  const torso = new THREE.Mesh(mergeGeometries(tl, false), vcMat()); hips.add(torso);
  const faceMat = new THREE.MeshBasicMaterial({ transparent: true, alphaTest: 0.5 });
  const face = new THREE.Mesh(new THREE.PlaneGeometry(hr * 1.7, hr * 1.7), faceMat); face.position.set(0, headY, hr * 0.93); hips.add(face);
  // legs
  const legs = [];
  for (const sx of [1, -1]) {
    const lg = new THREE.Group(); lg.position.set(sx * 0.11 * fat, 0, 0); hips.add(lg);
    const l = []; part(l, G.box(0.15, hipY - 0.06, 0.15), 0, -(hipY - 0.06) / 2, 0, robe && female ? skin : pants); part(l, G.box(0.17, 0.08, 0.28), 0, -hipY + 0.04, 0.05, female ? 0x5a2a2a : 0x2a2018);
    lg.add(new THREE.Mesh(mergeGeometries(l, false), vcMat())); legs.push(lg);
  }
  // arms
  const arms = [];
  for (const sx of [1, -1]) {
    const sh = new THREE.Group(); sh.position.set(sx * 0.31 * fat, 0.6, 0); hips.add(sh);
    const l = []; part(l, G.box(0.13, 0.36, 0.13), 0, -0.18, 0, robe ?? shirt); part(l, G.box(0.11, 0.32, 0.11), 0, -0.5, 0.02, skin); part(l, G.ico(0.085), 0, -0.7, 0.03, skin);
    sh.add(new THREE.Mesh(mergeGeometries(l, false), vcMat())); arms.push(sh);
  }
  root.scale.setScalar(s);
  const faceOpts = { stache: !female && !kid && r() < 0.5, stacheColor: r() < 0.3 ? '#dddddd' : '#111', beard: !female && !kid && r() < 0.15 };
  return { root, hips, legs, arms, face, faceMat, faceOpts, kid, female, scale: s, mood: MOODS[Math.floor(r() * MOODS.length)] };
}

const KNOCK_LINES = ['يا ساتر!', 'حاسب يا أسطى!', 'إنت أعمى؟!', 'هي سباق؟!', 'رخصتك منين يا عم؟', 'آآآه يا ضهري!', 'هشتكيك للحكومة!', 'ماشي يا حريف!'];
const STARTLE = ['يا نهار أبيض!', 'براحة يا عم!', 'حاسب!', 'إيه ده؟!'];

export class Peds {
  constructor(scene, events) {
    this.scene = scene; this.events = events; this.list = []; this.seed = 1;
    const starC = document.createElement('canvas'); starC.width = starC.height = 16; const g = starC.getContext('2d');
    g.fillStyle = '#ffe14a'; g.beginPath(); for (let i = 0; i < 10; i++) { const a = i * Math.PI / 5 - Math.PI / 2, rr = i % 2 ? 3 : 7.5; g.lineTo(8 + Math.cos(a) * rr, 8 + Math.sin(a) * rr); } g.fill();
    const t = new THREE.CanvasTexture(starC); t.magFilter = THREE.NearestFilter;
    this.stars = []; for (let i = 0; i < 9; i++) { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, transparent: true, depthWrite: false })); sp.scale.setScalar(0.32); sp.visible = false; scene.add(sp); this.stars.push(sp); }
    this.starOwner = null;
  }
  spawn(x, z, opts = {}) {
    const m = makePed(this.seed++ * 7919, opts); this.scene.add(m.root);
    const p = { m, pos: new THREE.Vector3(x, groundAt(x, z), z), ry: Math.random() * 6.28, alive: true, state: opts.state || 'walk', phase: Math.random() * 6, speed: 1.1 + Math.random() * 0.5,
      loop: null, corner: 0, dir: Math.random() < 0.5 ? 1 : -1, vel: new THREE.Vector3(), t: 0, faceKey: '', blink: Math.random() * 3, isPed: true, talkT: 0, home: opts.home };
    this.list.push(p); return p;
  }
  despawn(p) { this.scene.remove(p.m.root); p.alive = false; this.list.splice(this.list.indexOf(p), 1); }
  placeOnLoop(p, loop) {
    p.loop = loop; const c = this.corners(loop); const i = Math.floor(Math.random() * 4); const k = Math.random();
    const a = c[i], b = c[(i + 1) % 4]; p.pos.set(a[0] + (b[0] - a[0]) * k, 0, a[1] + (b[1] - a[1]) * k); p.pos.y = groundAt(p.pos.x, p.pos.z);
    p.corner = p.dir > 0 ? (i + 1) % 4 : i;
  }
  corners(l) { return [[l.x0, l.z0], [l.x1, l.z0], [l.x1, l.z1], [l.x0, l.z1]]; }
  knock(p, dx, dz, spd) {
    if (p.knocked) return;
    p.knocked = true; p.state = 'knocked'; p.t = 0;
    p.vel.set(dx * Math.min(14, spd * 0.9), 4 + Math.min(6, spd * 0.35), dz * Math.min(14, spd * 0.9));
    this.events.bark?.(p, KNOCK_LINES[Math.floor(Math.random() * KNOCK_LINES.length)]);
    this.starOwner = p;
  }
  startle(x, z, r) { for (const p of this.list) { if (p.state === 'walk' || p.state === 'idle') { const d = Math.hypot(p.pos.x - x, p.pos.z - z); if (d < r) { p.state = 'flee'; p.t = 0; p.fleeFrom = [x, z]; if (Math.random() < 0.3) this.events.bark?.(p, STARTLE[Math.floor(Math.random() * STARTLE.length)]); } } } }
  update(dt, ctx) {
    const fx = ctx.focus.x, fz = ctx.focus.z;
    // keep ~N people around the focus
    for (const p of [...this.list]) if (!p.pinned && Math.hypot(p.pos.x - fx, p.pos.z - fz) > 90 && p.state !== 'passenger') this.despawn(p);
    let n = this.list.filter(p => !p.pinned).length;
    for (let k = 0; k < 3 && n < ctx.pedCount; k++) {
      const near = sidewalkLoops.filter(l => { const cx = (l.x0 + l.x1) / 2, cz = (l.z0 + l.z1) / 2; const d = Math.hypot(cx - fx, cz - fz); return d < 75 && d > (ctx.initial ? 0 : 20); });
      if (!near.length) break;
      const p = this.spawn(0, 0); this.placeOnLoop(p, near[Math.floor(Math.random() * near.length)]);
      if (!ctx.initial && Math.hypot(p.pos.x - fx, p.pos.z - fz) < 30) { this.despawn(p); continue; }
      if (Math.random() < 0.18) p.state = 'idle';
      n++;
    }
    const t = ctx.t;
    for (const p of this.list) {
      const d = Math.hypot(p.pos.x - fx, p.pos.z - fz);
      p.m.root.visible = d < ctx.viewDist * 0.45;
      if (d > 70 && p.state === 'walk') { this.walk(p, dt, true); continue; }
      switch (p.state) {
        case 'walk': this.walk(p, dt); break;
        case 'idle': p.moveK = lerp(p.moveK || 0, 0, dt * 5); if (Math.random() < dt * 0.05) p.state = 'walk'; break;
        case 'flee': { p.t += dt; const ax = p.pos.x - p.fleeFrom[0], az = p.pos.z - p.fleeFrom[1], l = Math.hypot(ax, az) || 1; this.move(p, ax / l, az / l, 4.2, dt); if (p.t > 2.5) p.state = 'walk'; break; }
        case 'knocked': {
          p.t += dt; p.vel.y -= 18 * dt; p.pos.addScaledVector(p.vel, dt);
          const g = groundAt(p.pos.x, p.pos.z, p.pos.y); if (p.pos.y < g) { p.pos.y = g; p.vel.multiplyScalar(0.4); p.vel.y = Math.abs(p.vel.y) > 2 ? -p.vel.y * 0.3 : 0; }
          this.push(p, 0.3);
          if (p.t > 2.6) { p.state = 'getup'; p.t = 0; }
          break;
        }
        case 'getup': p.t += dt; if (p.t > 0.8) { p.knocked = false; p.state = 'angry'; p.t = 0; } break;
        case 'angry': p.t += dt; p.moveK = 0; if (ctx.player) p.ry += (Math.atan2(ctx.player.x - p.pos.x, ctx.player.z - p.pos.z) - p.ry) * Math.min(1, dt * 4); if (p.t > 3) p.state = 'walk'; break;
        case 'hail': p.moveK = 0; if (ctx.player) p.ry = Math.atan2(ctx.player.x - p.pos.x, ctx.player.z - p.pos.z); break;
        case 'stand': p.moveK = 0; break;
        case 'passenger': break;
        case 'goto': { const ax = p.target[0] - p.pos.x, az = p.target[1] - p.pos.z, l = Math.hypot(ax, az); if (l < 0.5) { p.state = p.after || 'idle'; } else this.move(p, ax / l, az / l, p.runTo ? 4 : 1.4, dt); break; }
      }
      this.pose(p, dt, t);
    }
    // stars over the last knocked person
    const so = this.starOwner;
    for (let i = 0; i < this.stars.length; i++) {
      const s = this.stars[i];
      if (so && so.knocked && so.alive) { const a = t * 4 + i * (Math.PI * 2 / this.stars.length); s.visible = i < 6; s.position.set(so.pos.x + Math.cos(a) * 0.45, so.pos.y + 0.55, so.pos.z + Math.sin(a) * 0.45); }
      else s.visible = false;
    }
  }
  walk(p, dt, cheap) {
    if (!p.loop) { p.state = 'idle'; return; }
    const c = this.corners(p.loop)[p.corner];
    const ax = c[0] - p.pos.x, az = c[1] - p.pos.z, l = Math.hypot(ax, az);
    if (l < 0.4) { p.corner = (p.corner + p.dir + 4) % 4; return; }
    if (cheap) { p.pos.x += ax / l * p.speed * dt; p.pos.z += az / l * p.speed * dt; return; }
    this.move(p, ax / l, az / l, p.speed, dt);
  }
  move(p, dx, dz, spd, dt) {
    p.pos.x += dx * spd * dt; p.pos.z += dz * spd * dt;
    const want = Math.atan2(dx, dz); let d = want - p.ry; while (d > Math.PI) d -= 6.283; while (d < -Math.PI) d += 6.283; p.ry += d * Math.min(1, dt * 8);
    p.moveK = lerp(p.moveK || 0, 1, dt * 6); p.runK = spd > 3 ? 1 : 0; p.phase += dt * (spd > 3 ? 10 : 6);
    this.push(p, 0.32);
    const g = groundAt(p.pos.x, p.pos.z, p.pos.y); p.pos.y = lerp(p.pos.y, g, 0.5);
  }
  push(p, r) {
    for (const b of queryColliders(p.pos.x, p.pos.z, r + 0.5, this._tmp || (this._tmp = []))) {
      if (b.circle) { const dx = p.pos.x - b.x, dz = p.pos.z - b.z, rr = b.r + r, d2 = dx * dx + dz * dz; if (d2 < rr * rr && d2 > 1e-6) { const dd = Math.sqrt(d2); p.pos.x = b.x + dx / dd * rr; p.pos.z = b.z + dz / dd * rr; } continue; }
      if (p.pos.y > b.h) continue;
      const qx = clamp(p.pos.x, b.x0, b.x1), qz = clamp(p.pos.z, b.z0, b.z1), dx = p.pos.x - qx, dz = p.pos.z - qz, d2 = dx * dx + dz * dz;
      if (d2 < r * r && d2 > 1e-6) { const dd = Math.sqrt(d2); p.pos.x = qx + dx / dd * r; p.pos.z = qz + dz / dd * r; }
    }
  }
  pose(p, dt, t) {
    const m = p.m, mk = p.moveK || 0, s = Math.sin(p.phase), amp = p.runK ? 1.0 : 0.6;
    m.root.position.copy(p.pos);
    if (p.state === 'knocked' || p.state === 'getup') {
      const lie = p.state === 'knocked' ? Math.min(1, p.t * 5) : 1 - p.t / 0.8;
      m.root.rotation.set(-Math.PI / 2 * lie, p.ry, 0, 'YXZ'); m.hips.position.y = 0.84 - 0.6 * lie;
      for (const a of m.arms) a.rotation.x = -2.6 * lie; m.legs[0].rotation.x = 0.4; m.legs[1].rotation.x = -0.3;
    } else {
      m.root.rotation.set(0, p.ry, 0); m.hips.position.y = 0.84 - Math.abs(Math.cos(p.phase)) * 0.04 * mk;
      m.legs[0].rotation.x = -s * amp * mk; m.legs[1].rotation.x = s * amp * mk;
      m.arms[0].rotation.x = s * 0.5 * amp * mk; m.arms[1].rotation.x = -s * 0.5 * amp * mk;
      m.arms[0].rotation.z = 0.1; m.arms[1].rotation.z = -0.1;
      if (p.state === 'hail') { m.arms[1].rotation.x = -2.8; m.arms[1].rotation.z = -0.3 + Math.sin(t * 8) * 0.25; }
      if (p.state === 'angry') { m.arms[0].rotation.x = -2.2 + Math.sin(t * 10) * 0.3; }
      if (p.state === 'cheer') { m.arms[0].rotation.x = -2.9; m.arms[1].rotation.x = -2.9; m.hips.position.y = 0.84 + Math.abs(Math.sin(t * 8)) * 0.15; }
    }
    p.blink -= dt; if (p.blink < -0.12) p.blink = 2 + Math.random() * 3;
    const eyes = p.state === 'knocked' ? 'dizzy' : p.state === 'angry' ? 'angry' : p.state === 'flee' ? 'wide' : p.blink < 0 ? 'closed' : m.mood;
    const mouth = p.state === 'knocked' ? 'wobble' : p.state === 'angry' ? (Math.floor(t * 8) % 2 ? 'scream' : 'talk2') : p.state === 'flee' ? 'scream' : p.state === 'hail' ? 'grin' : p.talkT > 0 ? (Math.floor(t * 10) % 2 ? 'talk1' : 'talk2') : 'smile';
    p.talkT -= dt;
    const key = eyes + mouth; if (key !== p.faceKey) { p.faceKey = key; m.faceMat.map = faceTexture(eyes, mouth, m.faceOpts); m.faceMat.needsUpdate = true; }
  }
}

// ---------- kids' football in the school yard ----------
export class Football {
  constructor(scene, peds) {
    this.yard = { x0: 47, x1: 73, z0: -62.5, z1: -47 };
    this.goal = { x: 60, z: -48.2, w: 3.4 };
    this.ball = new THREE.Mesh(new THREE.IcosahedronGeometry(0.22, 1), new THREE.MeshLambertMaterial({ color: 0xffffff, flatShading: true }));
    { const b2 = new THREE.Mesh(new THREE.IcosahedronGeometry(0.225, 0), new THREE.MeshLambertMaterial({ color: 0x111111, wireframe: true })); this.ball.add(b2); }
    scene.add(this.ball);
    this.pos = new THREE.Vector3(60, 0.35, -55); this.vel = new THREE.Vector3();
    this.kids = []; this.peds = peds; this.goals = 0; this.cool = 0;
  }
  ensureKids(focus) {
    const near = Math.hypot(focus.x - 60, focus.z - 55 * -1) < 90;
    if (near && !this.kids.length) for (let i = 0; i < 4; i++) { const k = this.peds.spawn(52 + i * 4, -58 + (i % 2) * 3, { kid: true, state: 'stand' }); k.pinned = true; k.kidIx = i; this.kids.push(k); }
    if (!near && this.kids.length) { for (const k of this.kids) this.peds.despawn(k); this.kids = []; }
  }
  update(dt, ctx) {
    this.ensureKids(ctx.focus);
    const Y = this.yard;
    // kids chase the ball, the nearest one kicks it toward the goal
    let near = null, nd = 99;
    for (const k of this.kids) { if (k.knocked) continue; const d = Math.hypot(k.pos.x - this.pos.x, k.pos.z - this.pos.z); if (d < nd) { nd = d; near = k; } }
    for (const k of this.kids) {
      if (k.knocked) continue;
      const tx = k === near ? this.pos.x : clamp(this.pos.x + (k.kidIx - 1.5) * 4, Y.x0 + 1, Y.x1 - 1), tz = k === near ? this.pos.z + 0.4 : clamp(this.pos.z + 3 + (k.kidIx % 2) * 2, Y.z0 + 1, Y.z1 - 1);
      const dx = tx - k.pos.x, dz = tz - k.pos.z, l = Math.hypot(dx, dz);
      if (l > 0.6) { k.state = 'goto'; k.target = [tx, tz]; k.after = 'stand'; k.runTo = k === near; } else k.state = 'stand';
      if (k === near && nd < 0.7 && this.cool <= 0) { const gx = this.goal.x + (Math.random() - 0.5) * 6 - this.pos.x, gz = this.goal.z - this.pos.z, gl = Math.hypot(gx, gz); this.vel.set(gx / gl * 6, 1.5, gz / gl * 6); this.cool = 0.8; }
    }
    // the player can kick it too
    const p = ctx.player;
    if (p && !ctx.inVehicle && Math.hypot(p.x - this.pos.x, p.z - this.pos.z) < 0.7 && this.cool <= 0) {
      const dx = this.pos.x - p.x, dz = this.pos.z - p.z, l = Math.hypot(dx, dz) || 1;
      this.vel.set(dx / l * 9, 2.5, dz / l * 9); this.cool = 0.4; ctx.events.kick?.();
    }
    this.cool -= dt;
    this.vel.y -= 15 * dt; this.pos.addScaledVector(this.vel, dt);
    if (this.pos.y < 0.34) { this.pos.y = 0.34; this.vel.y = Math.abs(this.vel.y) > 1 ? -this.vel.y * 0.45 : 0; this.vel.x *= 0.985; this.vel.z *= 0.985; }
    this.vel.x *= 1 - dt * 0.6; this.vel.z *= 1 - dt * 0.6;
    if (this.pos.x < Y.x0 || this.pos.x > Y.x1) { this.vel.x *= -0.6; this.pos.x = clamp(this.pos.x, Y.x0, Y.x1); }
    if (this.pos.z < Y.z0) { this.vel.z *= -0.6; this.pos.z = Y.z0; }
    if (this.pos.z > Y.z1 - 0.8) {
      if (Math.abs(this.pos.x - this.goal.x) < this.goal.w / 2 && this.pos.y < 2) { this.goals++; ctx.events.goal?.(this.lastKickByPlayer); }
      this.pos.set(60, 0.6, -55); this.vel.set(0, 0, 0);
    }
    this.lastKickByPlayer = this.cool > 0.2 && p && Math.hypot(p.x - this.pos.x, p.z - this.pos.z) < 3 ? true : this.lastKickByPlayer;
    this.ball.position.copy(this.pos); this.ball.rotation.x += this.vel.z * dt * 3; this.ball.rotation.z -= this.vel.x * dt * 3;
  }
}
