// Driving: arcade car physics shared by the player and traffic, the traffic AI on the road grid, parked cars you can take.
import * as THREE from 'three';
import { clamp, lerp } from './kit.js';
import { buildCarModel, CAR_TYPES, CAR_COLORS } from './carmodels.js';
import { XR, ZR, groundAt, queryColliders, parking, RIVER } from './world.js';

const LANE = 2.2;
const tmp = [];
const angDiff = (a, b) => { let d = b - a; while (d > Math.PI) d -= Math.PI * 2; while (d < -Math.PI) d += Math.PI * 2; return d; };
const rnd = (a) => a[Math.floor(Math.random() * a.length)];

export class Vehicles {
  constructor(scene, events) {
    this.scene = scene; this.events = events; this.list = []; this.player = null;
    this.parkedSpots = parking.map((p, i) => ({ ...p, i, v: null, taken: false }));
  }
  // ---------- creation ----------
  make(type, color, opts = {}) {
    const m = buildCarModel(type, color ?? rnd(CAR_COLORS), opts.load ? { load: opts.load } : undefined);
    const root = new THREE.Group(); root.add(m.g); this.scene.add(root);
    const T = CAR_TYPES[type];
    const v = { kind: 'car', type, ar: T.ar, root, body: m.g, dummy: m.dummy, wheels: m.wheels, L: m.L, W: m.W, H: m.H, seat: m.seat, max: T.max, acc: T.acc, mass: T.mass,
      pos: new THREE.Vector3(), yaw: 0, speed: 0, steer: 0, vy: 0, onGround: true, pitch: 0, roll: 0, ai: null, driver: null, wheelSign: 1, damage: 0, honkT: 0, stuckT: 0, crashCool: 0, lastHitT: 0 };
    this.list.push(v); return v;
  }
  adoptSpecial(kind, obj) {
    // Abu Samir's 128 / Hooda's tuk-tuk, built by world.js
    const root = new THREE.Group(); this.scene.add(root); root.add(obj.g); obj.g.position.set(0, 0, 0);
    let wheels = obj.wheels, seat, L, W, H, max, acc, mass;
    if (kind === 'samir') {
      wheels = obj.wheels.map((w, i) => { const p = w.parent; const steer = new THREE.Group(); steer.position.copy(w.position); p.add(steer); const spin = new THREE.Group(); steer.add(spin); spin.add(w); w.position.set(0, 0, 0); return { steer, spin, r: 0.32 * 1.2, front: w.position.x > 0 || i % 2 === 1 }; });
      wheels.forEach((w, i) => { w.front = [false, true, false, true][i]; });
      seat = { x: 0.12, y: 0.12, z: -0.48 }; L = obj.L; W = obj.Wd; H = 1.8; max = 22; acc = 8; mass = 1;
    } else { seat = { x: 0.6, y: 0.3, z: 0 }; L = 2.6; W = 1.45; H = 2.3; max = 17; acc = 9; mass = 0.6; }
    const v = { kind, type: kind, ar: kind === 'samir' ? 'عربية أبو سمير' : 'توكتوك حودة', root, body: obj.g, wheels, L, W, H, seat, max, acc, mass,
      pos: new THREE.Vector3(), yaw: 0, speed: 0, steer: 0, vy: 0, onGround: true, pitch: 0, roll: 0, ai: null, driver: null, wheelSign: kind === 'tuk' ? -1 : 1, damage: 0, honkT: 0, stuckT: 0, crashCool: 0, special: true, src: obj, lastHitT: 0 };
    this.list.push(v); return v;
  }
  place(v, x, z, yaw) { v.pos.set(x, groundAt(x, z), z); v.yaw = yaw; v.speed = 0; v.vy = 0; v.onGround = true; this.sync(v); }
  remove(v) { this.scene.remove(v.root); this.list.splice(this.list.indexOf(v), 1); if (v.spot) v.spot.v = null; }
  sync(v) { v.root.position.copy(v.pos); v.root.rotation.set(0, v.yaw, 0); v.body.rotation.z = v.pitch; v.body.rotation.x = v.roll; }
  fwd(v) { return [Math.cos(v.yaw), -Math.sin(v.yaw)]; }

  // ---------- physics ----------
  drive(v, throttle, steerIn, brake, dt, boost = 0) {
    const maxSteer = 0.6 * (1 - Math.min(0.45, Math.abs(v.speed) / 45));
    v.steer = lerp(v.steer, steerIn * maxSteer, Math.min(1, dt * 7));
    const max = v.max * (1 + (v.upgrade || 0) * 0.25) * (boost ? 1.8 : 1);
    const acc = v.acc * (1 + (v.upgrade || 0) * 0.3) * (boost ? 2.2 : 1);
    if (v.onGround || v.flying) {
      if (throttle > 0) v.speed += (v.speed < -0.5 ? throttle * acc * 2.4 : throttle * acc * (1 - Math.max(0, v.speed) / max)) * dt;
      else if (throttle < 0) v.speed += (v.speed > 0.5 ? throttle * acc * 2.6 : throttle * acc * 0.7) * dt;
      v.speed = clamp(v.speed, -v.max * 0.4, max);
      v.speed -= v.speed * 0.18 * dt;
      if (throttle === 0) v.speed -= Math.sign(v.speed) * Math.min(Math.abs(v.speed), 2.5 * dt);
      if (brake) v.speed *= Math.max(0, 1 - dt * 3.5);
      const wb = v.L * 0.62;
      v.yaw += v.speed / wb * Math.tan(v.steer) * dt * (v.onGround ? 1 : 0.4);
    }
    const [fx, fz] = this.fwd(v);
    v.pos.x += fx * v.speed * dt; v.pos.z += fz * v.speed * dt;
    // vertical
    const g = groundAt(v.pos.x, v.pos.z, v.pos.y);
    if (v.flying) { v.vy = lerp(v.vy, v.flyLift ?? 0, dt * 2); v.pos.y += v.vy * dt; if (v.pos.y < g) { v.pos.y = g; v.vy = 0; } v.onGround = v.pos.y <= g + 0.05; }
    else if (v.onGround) {
      if (g >= v.pos.y - 0.35) { const vyG = (g - v.pos.y) / Math.max(dt, 1e-3); v.vy = clamp(vyG, -3, 14); v.pos.y = g; }
      else v.onGround = false;
    } else {
      v.vy -= 22 * dt; v.pos.y += v.vy * dt;
      if (v.pos.y <= g) { if (v.vy < -9) this.events.land?.(v, -v.vy); v.pos.y = g; v.vy = 0; v.onGround = true; }
    }
    // body pitch/roll for feel
    const targetPitch = v.onGround ? clamp(Math.atan2(v.vy, Math.max(2, Math.abs(v.speed))), -0.4, 0.4) : clamp(v.pitch - dt * 0.4, -0.5, 0.5);
    v.pitch = lerp(v.pitch, v.flying ? 0.05 : targetPitch, Math.min(1, dt * 8));
    v.roll = lerp(v.roll, clamp(-v.steer * v.speed * 0.012, -0.12, 0.12), Math.min(1, dt * 5));
    this.collide(v, dt);
    // wheels
    for (const w of v.wheels) { w.spin.rotation.z -= v.wheelSign * v.speed / (w.r * 1.15) * dt; if (w.front) w.steer.rotation.y = v.steer * v.wheelSign; }
    if (v.pos.y < -0.9) this.events.drown?.(v);
    this.sync(v);
  }
  collide(v, dt) {
    const [fx, fz] = this.fwd(v);
    const n = Math.max(2, Math.round(v.L / 1.8)), r = v.W / 2;
    let hit = 0;
    for (let i = 0; i < n; i++) {
      const off = -v.L / 2 + r * 0.9 + (v.L - r * 1.8) * (i / (n - 1));
      const cx = v.pos.x + fx * off, cz = v.pos.z + fz * off;
      for (const b of queryColliders(cx, cz, r + 0.5, tmp)) {
        if (b.circle) { const dx = cx - b.x, dz = cz - b.z, rr = b.r + r, d2 = dx * dx + dz * dz; if (d2 < rr * rr && d2 > 1e-6) { const d = Math.sqrt(d2), p = rr - d; v.pos.x += dx / d * p; v.pos.z += dz / d * p; hit = Math.max(hit, p); } continue; }
        if (v.pos.y > b.h - 0.2) continue;
        const qx = clamp(cx, b.x0, b.x1), qz = clamp(cz, b.z0, b.z1); const dx = cx - qx, dz = cz - qz, d2 = dx * dx + dz * dz;
        if (d2 < r * r) {
          if (d2 > 1e-6) { const d = Math.sqrt(d2), p = r - d; v.pos.x += dx / d * p; v.pos.z += dz / d * p; hit = Math.max(hit, p); }
          else { const o = [[cx - b.x0, -1, 0], [b.x1 - cx, 1, 0], [cz - b.z0, 0, -1], [b.z1 - cz, 0, 1]].sort((a, c) => a[0] - c[0])[0]; v.pos.x += o[1] * (o[0] + r); v.pos.z += o[2] * (o[0] + r); hit = 1; }
        }
      }
    }
    // other vehicles
    for (const o of this.list) {
      if (o === v || !o.root.visible) continue;
      const dx = v.pos.x - o.pos.x, dz = v.pos.z - o.pos.z, reach = (v.L + o.L) / 2;
      if (dx * dx + dz * dz > reach * reach || Math.abs(v.pos.y - o.pos.y) > 2) continue;
      // test my circles against theirs
      const [ox, oz] = this.fwd(o); const nr = Math.max(2, Math.round(o.L / 1.8)), orr = o.W / 2;
      for (let i = 0; i < n; i++) {
        const off = -v.L / 2 + r * 0.9 + (v.L - r * 1.8) * (i / (n - 1)); const ax = v.pos.x + fx * off, az = v.pos.z + fz * off;
        for (let j = 0; j < nr; j++) {
          const off2 = -o.L / 2 + orr * 0.9 + (o.L - orr * 1.8) * (j / (nr - 1)); const bx = o.pos.x + ox * off2, bz = o.pos.z + oz * off2;
          const ddx = ax - bx, ddz = az - bz, rr = r + orr, d2 = ddx * ddx + ddz * ddz;
          if (d2 < rr * rr && d2 > 1e-6) {
            const d = Math.sqrt(d2), p = rr - d, wv = o.mass / (v.mass + o.mass);
            v.pos.x += ddx / d * p * wv; v.pos.z += ddz / d * p * wv; o.pos.x -= ddx / d * p * (1 - wv); o.pos.z -= ddz / d * p * (1 - wv);
            const rel = Math.abs(v.speed - o.speed * (fx * ox + fz * oz));
            if (rel > 3 && v.crashCool <= 0) { this.events.crash?.(v, o, rel); v.crashCool = 0.6; }
            const vs = v.speed; v.speed = lerp(v.speed, o.speed * 0.5, 0.5 * wv) * 0.8; o.speed = lerp(o.speed, vs * 0.6, 0.6 * (1 - wv));
            if (o.ai) o.ai.angry = 3;
            this.sync(o);
          }
        }
      }
    }
    v.crashCool -= dt;
    if (hit > 0.02) {
      const imp = Math.abs(v.speed);
      if (imp > 4 && v.crashCool <= 0) { this.events.crash?.(v, null, imp); v.crashCool = 0.5; v.damage += imp; }
      v.speed *= imp > 6 ? -0.25 : 0.6;
    }
  }
  // people in the way: knock over (fast) or push aside (slow)
  hitPeople(v, people) {
    const [fx, fz] = this.fwd(v);
    for (const p of people) {
      if (!p.alive || p.knocked || p.inVehicle) continue;
      const dx = p.pos.x - v.pos.x, dz = p.pos.z - v.pos.z;
      if (dx * dx + dz * dz > (v.L / 2 + 1) ** 2 || Math.abs(p.pos.y - v.pos.y) > 1.6) continue;
      const lx = dx * fx + dz * fz, lz = -dx * fz + dz * fx;
      if (Math.abs(lx) < v.L / 2 + 0.3 && Math.abs(lz) < v.W / 2 + 0.3) {
        if (Math.abs(v.speed) > 2.2) { this.events.knock?.(p, v, fx * Math.sign(v.speed), fz * Math.sign(v.speed), Math.abs(v.speed)); v.speed *= 0.85; }
        else { const s = Math.sign(lz) || 1; p.pos.x += -fz * s * 0.15; p.pos.z += fx * s * 0.15; }
      }
    }
  }

  // ---------- traffic ----------
  nodeDirs(x, z) {
    const d = [];
    if (x < 120) d.push([1, 0]); if (x > -160) d.push([-1, 0]); if (z < 160) d.push([0, 1]); if (z > -160) d.push([0, -1]);
    return d;
  }
  planFrom(v, nx, nz, d) {
    // v is about to cross node (nx,nz) heading d: queue the turn waypoints and the approach to the next node
    const R = (dd) => [-dd[1], dd[0]];
    const opts = this.nodeDirs(nx, nz).filter(o => !(o[0] === -d[0] && o[1] === -d[1]));
    let d2 = opts.length ? (Math.random() < 0.5 && opts.some(o => o[0] === d[0] && o[1] === d[1]) ? d : rnd(opts)) : [-d[0], -d[1]];
    const wps = [];
    const [r1x, r1z] = R(d), [r2x, r2z] = R(d2);
    if (nx === 0 && nz === 0) {
      // roundabout: drive around it (counter-clockwise on the map)
      const a0 = Math.atan2(-d[1] * 8 + r1z * LANE, -d[0] * 8 + r1x * LANE), a1 = Math.atan2(d2[1] * 8 + r2z * LANE, d2[0] * 8 + r2x * LANE);
      let a = a0, end = a1; while (end > a) end -= Math.PI * 2; if (a - end < 0.6) end -= Math.PI * 2;
      for (; a > end; a -= 0.5) wps.push([Math.cos(a) * 7, Math.sin(a) * 7]);
      wps.push([d2[0] * 9 + r2x * LANE, d2[1] * 9 + r2z * LANE]);
    } else {
      wps.push([nx - d[0] * 5 + r1x * LANE, nz - d[1] * 5 + r1z * LANE]);
      if (d2[0] !== d[0] || d2[1] !== d[1]) wps.push([nx + (r1x + r2x) * LANE * 0.5 + (d2[0] - d[0]) * 1.2, nz + (r1z + r2z) * LANE * 0.5 + (d2[1] - d[1]) * 1.2]);
      wps.push([nx + d2[0] * 6 + r2x * LANE, nz + d2[1] * 6 + r2z * LANE]);
    }
    const tx = nx + d2[0] * 40, tz = nz + d2[1] * 40;
    wps.push([tx - d2[0] * 8 + r2x * LANE, tz - d2[1] * 8 + r2z * LANE]);
    v.ai.wps = wps; v.ai.node = [tx, tz]; v.ai.d = d2;
  }
  spawnTraffic(px, pz, minD = 50, maxD = 130) {
    for (let tries = 0; tries < 20; tries++) {
      const nx = rnd(XR), nz = rnd(ZR);
      const d = rnd(this.nodeDirs(nx, nz));
      const t = 10 + Math.random() * 20;
      const [rx, rz] = [-d[1], d[0]];
      const x = nx + d[0] * t + rx * LANE, z = nz + d[1] * t + rz * LANE;
      const dist = Math.hypot(x - px, z - pz); if (dist < minD || dist > maxD) continue;
      if (this.list.some(o => Math.hypot(o.pos.x - x, o.pos.z - z) < 9)) continue;
      const type = rnd(['sedan', 'sedan', 'sedanNew', 'hatch', 'taxi', 'taxi', 'taxiWhite', 'microbus', 'microbus', 'wagon', 'pickup', 'truck', 'bus']);
      const v = this.make(type, undefined, type === 'pickup' ? { load: rnd(['melons', 'gas', 'boxes']) } : {});
      this.place(v, x, z, Math.atan2(-d[1], d[0]));
      v.ai = { wps: [], d, node: null, cruise: (type === 'bus' || type === 'truck' ? 8 : type === 'microbus' ? 12 : 10) + Math.random() * 2, angry: 0, blockT: 0 };
      v.ai.node = [nx + d[0] * 40, nz + d[1] * 40]; v.ai.wps = [[nx + d[0] * 32 + rx * LANE, nz + d[1] * 32 + rz * LANE]];
      return v;
    }
    return null;
  }
  updateAI(v, dt, ctx) {
    const ai = v.ai;
    if (!ai.wps.length) this.planFrom(v, ai.node[0], ai.node[1], ai.d);
    const [wx, wz] = ai.wps[0];
    const dx = wx - v.pos.x, dz = wz - v.pos.z, dist = Math.hypot(dx, dz);
    if (dist < 3) ai.wps.shift();
    const want = Math.atan2(-dz, dx); const err = angDiff(v.yaw, want);
    let desired = ai.cruise * (Math.abs(err) > 0.35 ? 0.6 : 1);
    // look ahead for anything in the way
    const [fx, fz] = this.fwd(v); let block = 99;
    const look = (x, z, w) => { const ox = x - v.pos.x, oz = z - v.pos.z; const ahead = ox * fx + oz * fz; const side = Math.abs(-ox * fz + oz * fx); if (ahead > 0 && ahead < 11 + v.L / 2 && side < w) block = Math.min(block, ahead - v.L / 2); };
    for (const o of this.list) if (o !== v) look(o.pos.x, o.pos.z, 1.2 + o.W / 2);
    for (const p of ctx.people) if (p.alive && !p.inVehicle) look(p.pos.x, p.pos.z, 1.4);
    if (block < 9) desired = Math.min(desired, Math.max(0, (block - 2.5) * 1.4));
    if (v.stuckT > 5) { desired = Math.max(desired, 3); if (v.honkT <= 0) { this.events.honk?.(v); v.honkT = 3; } } // creep past whatever is in the way
    if (block < 4 && ctx.playerNear(v)) { ai.blockT += dt; if (ai.blockT > 1.2 && v.honkT <= 0) { this.events.honk?.(v); v.honkT = 2.5 + Math.random() * 2; } } else ai.blockT = 0;
    v.honkT -= dt;
    const throttle = clamp((desired - v.speed) * 0.45, -1, 1);
    this.drive(v, throttle, clamp(err * 2.2, -1, 1), desired < 0.5 && v.speed > 0.2, dt);
    v.stuckT = v.speed < 0.5 ? v.stuckT + dt : 0;
  }

  // ---------- per frame ----------
  update(dt, ctx) {
    const px = ctx.focus.x, pz = ctx.focus.z;
    // traffic population
    const traffic = this.list.filter(v => v.ai);
    for (const v of traffic) {
      const d = Math.hypot(v.pos.x - px, v.pos.z - pz);
      if (d > 170 || (v.stuckT > 12 && d > 40)) { this.remove(v); continue; }
    }
    let n = this.list.filter(v => v.ai).length;
    for (let k = 0; k < 2 && n < ctx.trafficCount; k++) { if (this.spawnTraffic(px, pz, ctx.initial ? 15 : 55, 130)) n++; }
    // parked cars near the player
    let parkedN = this.list.filter(v => v.parked).length;
    for (const s of this.parkedSpots) {
      const d = Math.hypot(s.x - px, s.z - pz);
      if (!s.v && !s.taken && d < 60 && parkedN < (ctx.parkedMax ?? 10)) { parkedN++; const v = this.make(rnd(['sedan', 'sedan', 'sedanNew', 'hatch', 'wagon', 'taxi', 'pickup', 'microbus'])); this.place(v, s.x, s.z, s.ry); v.spot = s; v.parked = true; s.v = v; }
      else if (s.v && s.v.parked && d > 75) this.remove(s.v);
    }
    // abandoned cars far away disappear (not the special ones)
    for (const v of [...this.list]) if (!v.ai && !v.parked && !v.special && v !== this.player && Math.hypot(v.pos.x - px, v.pos.z - pz) > 160) this.remove(v);
    for (const v of this.list) {
      const far = Math.hypot(v.pos.x - px, v.pos.z - pz);
      v.root.visible = far < ctx.viewDist * 0.8;
      if (v.dummy) v.dummy.visible = !!v.ai || (!!v.race && v !== this.player);
      if (v.ai) { if (far < 140) this.updateAI(v, dt, ctx); }
      else if (v !== this.player) { if (Math.abs(v.speed) > 0.05 || !v.onGround) this.drive(v, 0, 0, true, dt); }
      if (Math.abs(v.speed) > 1) this.hitPeople(v, ctx.people);
    }
  }
  nearestEnterable(x, z, maxD = 3.2) {
    let best = null, bd = 1e9;
    for (const v of this.list) {
      const [fx, fz] = this.fwd(v); const dx = x - v.pos.x, dz = z - v.pos.z;
      const lx = dx * fx + dz * fz, lz = -dx * fz + dz * fx;
      const ex = Math.max(0, Math.abs(lx) - v.L / 2), ez = Math.max(0, Math.abs(lz) - v.W / 2);
      const d = Math.hypot(ex, ez);
      if (d < maxD && d < bd && Math.abs(v.speed) < 4) { bd = d; best = v; }
    }
    return best;
  }
  exitPoint(v) {
    const [fx, fz] = this.fwd(v); const side = -1; // driver's door (left side)
    for (const s of [side, -side]) for (const t of [0, 1.2, -1.2]) {
      const x = v.pos.x + (-fz) * s * (v.W / 2 + 0.9) + fx * t, z = v.pos.z + fx * s * (v.W / 2 + 0.9) + fz * t;
      if (!queryColliders(x, z, 0.4, tmp).some(b => b.circle ? Math.hypot(x - b.x, z - b.z) < b.r + 0.4 : (x > b.x0 - 0.4 && x < b.x1 + 0.4 && z > b.z0 - 0.4 && z < b.z1 + 0.4 && b.h > v.pos.y + 0.5))) return [x, z];
    }
    return [v.pos.x, v.pos.z];
  }
}
export { RIVER };
