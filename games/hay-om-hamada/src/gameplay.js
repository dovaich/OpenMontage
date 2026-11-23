// Missions (story), side jobs (taxi, deliveries, races), collectibles (golden bolts), cards, garage upgrades, phone pages.
import * as THREE from 'three';
import { rng } from './kit.js';
import { sidewalkLoops, zones, doors, ramps, groundAt, RIVER } from './world.js';
import { MISSIONS, CARDS, RACES, PASSENGER_LINES, DEST_ZONES } from './missiondata.js';

export function createGameplay(G) {
  const S = G.S; const ar = G.ar;
  const listeners = {};
  const emit = (name, data) => { (listeners[name] || []).forEach(f => f(data)); };
  const on = (name, f) => { (listeners[name] ||= []).push(f); };

  // ---------- 3D markers ----------
  const beam = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.1, 40, 12, 1, true), new THREE.MeshBasicMaterial({ color: 0xffd400, transparent: true, opacity: 0.35, side: THREE.DoubleSide, depthWrite: false, fog: false }));
  beam.visible = false; G.scene.add(beam);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(1.4, 0.12, 6, 20), new THREE.MeshBasicMaterial({ color: 0xffd400, fog: false })); ring.rotation.x = Math.PI / 2; ring.visible = false; G.scene.add(ring);
  const bangTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d'); g.fillStyle = '#ffd400'; g.beginPath(); g.arc(32, 32, 28, 0, 7); g.fill(); g.lineWidth = 5; g.strokeStyle = '#000'; g.stroke(); g.fillStyle = '#000'; g.font = 'bold 40px "Press Start 2P", monospace'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('!', 34, 34); const t = new THREE.CanvasTexture(c); t.magFilter = THREE.NearestFilter; return t; })();
  const bangs = []; for (let i = 0; i < 3; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: bangTex, depthTest: false, fog: false })); s.scale.setScalar(0.9); s.visible = false; s.renderOrder = 10; G.scene.add(s); bangs.push(s); }
  const pickGeo = new THREE.OctahedronGeometry(0.35, 0);
  const pickMats = { bolt: new THREE.MeshLambertMaterial({ color: 0xffd400, emissive: 0x806000, flatShading: true }), part: new THREE.MeshLambertMaterial({ color: 0x3df0ff, emissive: 0x106070, flatShading: true }), trash: new THREE.MeshLambertMaterial({ color: 0x2a2a2a, flatShading: true }) };
  const pickups = [];
  function addPickup(x, z, kind = 'part', label, y) {
    const m = new THREE.Mesh(kind === 'trash' ? new THREE.DodecahedronGeometry(0.4, 0) : pickGeo, pickMats[kind]); G.scene.add(m);
    const p = { x, z, y: y ?? groundAt(x, z, 50), m, kind, label, got: false }; m.position.set(x, p.y + 0.8, z); pickups.push(p); return p;
  }
  function removePickup(p) { G.scene.remove(p.m); pickups.splice(pickups.indexOf(p), 1); }

  // ---------- golden bolts (30 collectibles) ----------
  const BOLTS = (() => {
    const r = rng(777), out = [];
    const special = [[11, -11, 18.5], [-100, -25], [236, -60], [240, -24], [160, 0.3], [70, 300], [-30, 260], [0, 540], [60, 60], [-140, 70], [100, -150], [-150, -150], [-16, 15], [11, 8]];
    for (const s of special) out.push(s);
    const loops = sidewalkLoops.slice(); while (out.length < 30) { const l = loops[Math.floor(r() * loops.length)]; const side = Math.floor(r() * 4), k = r(); const pts = [[l.x0, l.z0], [l.x1, l.z0], [l.x1, l.z1], [l.x0, l.z1]]; const a = pts[side], b = pts[(side + 1) % 4]; out.push([a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k]); }
    return out.map(([x, z, y], i) => ({ id: 'b' + i, x, z, y }));
  })();
  const boltMeshes = new Map();
  function updateBolts() {
    const p = G.pos();
    for (const b of BOLTS) {
      if (S.bolts.includes(b.id)) { if (boltMeshes.has(b.id)) { G.scene.remove(boltMeshes.get(b.id)); boltMeshes.delete(b.id); } continue; }
      const d = Math.hypot(p.x - b.x, p.z - b.z);
      if (d < 70 && !boltMeshes.has(b.id) && !G.interior) { const m = new THREE.Mesh(pickGeo, pickMats.bolt); m.scale.setScalar(0.8); m.position.set(b.x, (b.y ?? groundAt(b.x, b.z)) + 0.9, b.z); G.scene.add(m); boltMeshes.set(b.id, m); }
      else if ((d > 80 || G.interior) && boltMeshes.has(b.id)) { G.scene.remove(boltMeshes.get(b.id)); boltMeshes.delete(b.id); }
      const m = boltMeshes.get(b.id); if (!m) continue;
      m.rotation.y = G.t * 3; m.position.y = (b.y ?? groundAt(b.x, b.z)) + 0.9 + Math.sin(G.t * 3 + b.x) * 0.15;
      if (d < (G.vehicleOf() ? 2.6 : 1.4) && Math.abs(p.y - (b.y ?? 0)) < 2.5) {
        S.bolts.push(b.id); G.sound.pickup(); G.addMoney(10);
        G.big('مسمار دهب!', `${ar(S.bolts.length)}/${ar(BOLTS.length)}`);
        if (S.bolts.length === 15) giveCard('bolt15');
        if (S.bolts.length === BOLTS.length) { giveCard('bolt30'); G.setFlag('goldPaint'); G.toast('فتحت الدهان الدهب للعربيات!'); }
      }
    }
  }
  function giveCard(id) { if (S.cards.includes(id)) return; S.cards.push(id); const c = CARDS.find(k => k.id === id); if (c) setTimeout(() => G.big('كارت جديد!', c.ar), 1600); }

  // ---------- missions ----------
  let active = null, waypoint = null;
  const doneSet = () => new Set(S.done);
  function available() {
    const done = doneSet();
    return MISSIONS.filter(m => !done.has(m.id) && (m.after || []).every(a => done.has(a)));
  }
  function giverPos(m) { const a = G.byId[m.giver]; return a ? a.pos : null; }
  function startMission(m) {
    if (G.vehicleOf() && m.onFootStart !== false) G.exitVehicle(true);
    if (m.who && G.player.meta.id !== m.who) G.switchTo(m.who);
    active = { m, i: -1, st: null, crashes: 0, hits: 0, t0: G.t, data: {} };
    G.chaos = 0; G.resetSlipperHits();
    G.showCard(m.ar, 'مهمة');
    m.setup?.(G, api);
    nextStep();
  }
  function nextStep() {
    if (!active) return;
    cleanupStep();
    active.i++;
    const step = active.m.steps[active.i];
    if (!step) { passMission(); return; }
    const st = active.st = { s: step, t: 0, done: false, data: {} };
    setObjective(step.text || '');
    const H = HANDLERS[step.t]; H.enter?.(st);
  }
  function cleanupStep() {
    const st = active?.st; if (!st) return;
    HANDLERS[st.s.t].exit?.(st);
    for (const p of [...pickups]) if (p.step === st) removePickup(p);
  }
  function passMission() {
    const m = active.m; cleanupStep();
    S.done.push(m.id); active = null; setObjective('');
    if (m.reward) G.addMoney(m.reward);
    for (const f of m.unlock || []) G.setFlag(f);
    if (m.card) giveCard(m.card);
    G.big('مهمة ناجحة!', `${m.ar} — +${ar(m.reward || 0)} ج`); G.sound.jingle(true);
    m.after2?.(G, api);
    G.saveState();
  }
  function failMission(why) {
    const m = active.m; cleanupStep(); m.cleanup?.(G, api); active = null; setObjective('');
    G.big('المهمة فشلت', why); G.sound.jingle(false);
    for (const id of ['mom', 'dad']) { const a = G.byId[id]; if (a !== G.player && a.ai) { a.ai = null; a.chasing = false; a.returning = true; } }
  }
  function setObjective(text) { const el = document.getElementById('obj'); el.textContent = text; el.classList.toggle('on', !!text); }
  const dist2 = (x, z) => { const p = G.pos(); return Math.hypot(p.x - x, p.z - z); };
  function vehicleOk(req) { const v = G.vehicleOf(); if (!req) return true; if (req === 'foot') return !v; if (!v) return false; if (req === 'any') return true; return v.kind === req || v.type === req || (req === 'taxi' && (v.type === 'taxi' || v.type === 'taxiWhite' || v.kind === 'samir' || v.kind === 'tuk')); }
  function target(x, z, y) { active.st.target = { x, z, y }; }

  const HANDLERS = {
    say: { enter(st) { G.say(st.s.lines, () => { st.done = true; }); }, update(st) { return st.done; } },
    goto: {
      enter(st) { target(st.s.x, st.s.z, st.s.y); },
      update(st) {
        const s = st.s; const p = G.pos();
        if (s.interior && G.interior !== s.interior) { const d = doors.find(o => o.interior === s.interior && !o.y); if (d) target(d.x, d.z); return false; }
        if (s.interior) { st.target = null; return Math.hypot(p.x - s.x, p.z - s.z) < (s.r || 1.5); }
        if (G.interior) { st.target = null; return false; }
        target(s.x, s.z, s.y);
        if (s.y !== undefined && Math.abs(p.y - s.y) > 2.5) return false;
        if (!vehicleOk(s.vehicle)) return false;
        return Math.hypot(p.x - s.x, p.z - s.z) < (s.r || 3);
      },
    },
    enter: {
      update(st) {
        const k = st.s.vehicle; const v = k === 'samir' ? G.samirV : k === 'tuk' ? G.tukV : null;
        if (v) { st.target = { x: v.pos.x, z: v.pos.z }; } else st.target = null;
        return vehicleOk(k);
      },
    },
    collect: {
      enter(st) { st.items = st.s.items.map(([x, z, y, label]) => { const p = addPickup(x, z, st.s.kind || 'part', label, y); p.step = st; return p; }); },
      update(st) {
        const p = G.pos(); let left = 0, nearest = null, nd = 1e9;
        for (const it of st.items) {
          if (it.got) continue;
          const d = Math.hypot(p.x - it.x, p.z - it.z);
          if (d < (G.vehicleOf() ? 2.8 : 1.5) && Math.abs(p.y - it.y) < 2.5 && !G.interior) { it.got = true; G.sound.pickup(); G.scene.remove(it.m); if (it.label) G.toast(`لقيت: ${it.label}`); continue; }
          left++; if (d < nd) { nd = d; nearest = it; }
        }
        st.target = nearest ? { x: nearest.x, z: nearest.z, y: nearest.y > 3 ? nearest.y : undefined } : null;
        setObjective(`${st.s.text} (${ar(st.items.length - left)}/${ar(st.items.length)})${st.s.time ? ' — ' + ar(Math.max(0, Math.ceil(st.s.time - st.t))) + ' ث' : ''}`);
        return left === 0;
      },
    },
    wait: { update(st) { return st.t > st.s.dur; } },
    craft: {
      enter(st) { st.phase = 0; target(st.s.x, st.s.z, st.s.y); },
      update(st) {
        const s = st.s; const p = G.pos();
        if (st.phase === 0) { if (!G.interior && Math.hypot(p.x - s.x, p.z - s.z) < 2.2 && Math.abs(p.y - s.y) < 2) { st.phase = 1; st.pt = 0; G.toast('بيركّب...'); } return false; }
        st.pt += G.dt; if (Math.random() < 0.3) G.emitPuff(s.x, s.y + 1.1, s.z, 2, undefined, 2, 0.4, 0.15, 0.2);
        if (st.pt > 2.2 && st.phase === 1) { st.phase = 2; if (s.boom !== false) G.explosion(s.x, s.y + 1, s.z, s.big || 1); }
        return st.pt > 3.2;
      },
    },
    escape: {
      enter(st) {
        const s = st.s; const ch = G.byId[s.chaser || 'mom'];
        const p = G.pos(); const a = Math.random() * 6.28; const sx = p.x + Math.cos(a) * (s.startDist || 14), sz = p.z + Math.sin(a) * (s.startDist || 14);
        ch.pos.set(sx, groundAt(sx, sz), sz); ch.chasing = true; ch.ai = G.chaseAI; ch.chaseSpeed = s.speed || 5.4; ch.throwRange = 16; ch.throwEvery = s.every || 2.6; ch.throwCD = 2.5;
        st.ch = ch; st.hits = 0; st.off = on('slipperHit', () => { if (active?.st === st) st.hits++; });
        if (s.safe) target(s.safe[0], s.safe[1]);
      },
      update(st) {
        const s = st.s; if (st.hits >= (s.maxHits || 3)) { failMission('أم حمادة جابتك بالشبشب'); return false; }
        const left = Math.max(0, Math.ceil((s.time || 999) - st.t));
        setObjective(`${s.text} — ${ar(3 - st.hits)} قلوب ${s.time ? '— ' + ar(left) + ' ث' : ''}`);
        if (s.safe) return dist2(s.safe[0], s.safe[1]) < (s.safe[2] || 2.5);
        return st.t > s.time;
      },
      exit(st) { const ch = st.ch; ch.chasing = false; ch.ai = null; ch.returning = true; ch.chaseSpeed = undefined; ch.throwRange = undefined; ch.throwEvery = undefined; },
    },
    jump: { enter(st) { st.ok = false; on('jump', (j) => { if (active?.st === st && j.t >= (st.s.minAir || 1)) st.ok = true; }); if (st.s.x !== undefined) target(st.s.x, st.s.z); }, update(st) { if (!vehicleOk(st.s.vehicle)) return false; return st.ok; } },
    goals: { enter(st) { st.n = 0; on('goal', () => { if (active?.st === st) st.n++; }); target(60, -55); }, update(st) { setObjective(`${st.s.text} (${ar(st.n)}/${ar(st.s.count)})`); return st.n >= st.s.count; } },
    taxi: { enter(st) { st.n0 = S.fares; if (!taxi.on) G.toast('دوس «شغّل التاكسي» من زرار العربية'); }, update(st) { const n = S.fares - st.n0; setObjective(`${st.s.text} (${ar(n)}/${ar(st.s.count)})`); if (taxi.on && taxi.target) st.target = taxi.target; else st.target = null; return n >= st.s.count; } },
    race: {
      enter(st) { startRace(st.s.race, st); },
      update(st) { if (!race || race.st !== st) return st.result === 'win'; return false; },
      exit() { if (race) endRace(); },
    },
    fn: { enter(st) { st.s.run(G, api, st); st.done = true; }, update(st) { return st.done; } },
    land: { update(st) { const v = G.vehicleOf(); target(st.s.x, st.s.z); return !!v && v.onGround && !v.flying && dist2(st.s.x, st.s.z) < (st.s.r || 12); } },
  };
  on('crash', () => { if (active) active.crashes++; if (delivery && delivery.on) delivery.crashes++; });
  on('drown', () => { if (active) failMission('غرقت في النيل'); });

  function updateMission(dt) {
    if (!active) return;
    const st = active.st; if (!st) return;
    st.t += dt; G.dt = dt;
    const s = st.s;
    if (s.time && s.t !== 'escape' && st.t > s.time) { failMission('الوقت خلص'); return; }
    if (s.fragile !== undefined) { if (st.c0 === undefined) st.c0 = active.crashes; const used = active.crashes - st.c0; if (used > s.fragile) { failMission(s.fragileFail || 'البضاعة اتكسرت!'); return; } st.fragileLeft = s.fragile - used; }
    if (s.need && !vehicleOk(s.need) && s.t !== 'enter') { setObjective(s.needText || 'ارجع للعربية'); }
    const H = HANDLERS[s.t];
    if (H.update(st)) { nextStep(); return; }
    if (s.time || s.fragile !== undefined) {
      let txt = s.text || ''; if (s.time) txt += ` — ${ar(Math.max(0, Math.ceil(s.time - st.t)))} ث`; if (s.fragile !== undefined) txt += ` — خبطات: ${ar(st.fragileLeft ?? s.fragile)}`;
      if (s.t !== 'collect' && s.t !== 'escape' && s.t !== 'taxi') setObjective(txt);
    }
  }

  // ---------- taxi job ----------
  const taxi = { on: false, phase: 'find', ped: null, dest: null, target: null, t: 0, limit: 0, pay: 0 };
  function taxiVehicleOk() { const v = G.vehicleOf(); return !!v && (v.kind === 'samir' || v.kind === 'tuk' || v.type === 'taxi' || v.type === 'taxiWhite'); }
  function taxiStart() { taxi.on = true; taxi.phase = 'find'; taxi.ped = null; G.toast('الشغل بدأ! دوّر على زبون بيشاورلك'); spawnFare(); }
  function taxiStop(msg) { if (taxi.ped) { const p = taxi.ped; if (p.state === 'passenger') { p.m.root.visible = true; p.inVehicle = false; const v = G.vehicleOf(); if (v) { const [x, z] = G.vehicles.exitPoint(v); p.pos.set(x, groundAt(x, z), z); } } p.state = 'walk'; p.pinned = false; } taxi.on = false; taxi.ped = null; taxi.target = null; if (msg) G.toast(msg); }
  function spawnFare() {
    const p = G.pos(); const cands = sidewalkLoops.filter(l => { const cx = (l.x0 + l.x1) / 2, cz = (l.z0 + l.z1) / 2, d = Math.hypot(cx - p.x, cz - p.z); return d > 35 && d < 110; });
    if (!cands.length) { taxi.target = null; return; }
    const l = cands[Math.floor(Math.random() * cands.length)]; const side = Math.floor(Math.random() * 4); const pts = [[l.x0, l.z0], [l.x1, l.z0], [l.x1, l.z1], [l.x0, l.z1]]; const a = pts[side], b = pts[(side + 1) % 4]; const k = 0.3 + Math.random() * 0.4;
    const x = a[0] + (b[0] - a[0]) * k, z = a[1] + (b[1] - a[1]) * k;
    const ped = G.peds.spawn(x, z, { state: 'hail' }); ped.pinned = true; taxi.ped = ped; taxi.phase = 'find'; taxi.target = { x, z };
  }
  function updateTaxi(dt) {
    if (!taxi.on) return;
    if (!taxiVehicleOk()) { taxiStop('الشغل وقف... انزلت من العربية'); return; }
    const v = G.vehicleOf(); const p = taxi.ped;
    if (!p || !p.alive) { spawnFare(); return; }
    if (taxi.phase === 'find') {
      taxi.target = { x: p.pos.x, z: p.pos.z };
      if (Math.hypot(v.pos.x - p.pos.x, v.pos.z - p.pos.z) < 5.5 && Math.abs(v.speed) < 3) {
        p.state = 'passenger'; p.inVehicle = true; p.m.root.visible = false;
        const here = v.pos; const opts = DEST_ZONES.map(id => zones.find(z => z.id === id)).filter(z => z && Math.hypot(z.x - here.x, z.z - here.z) > 70);
        const dz = opts[Math.floor(Math.random() * opts.length)] || zones[0];
        taxi.dest = dz; taxi.phase = 'ride'; taxi.t = 0; const d = Math.hypot(dz.x - here.x, dz.z - here.z); taxi.limit = Math.round(d / 7 + 25); taxi.pay = Math.round(15 + d * 0.35);
        const L = PASSENGER_LINES[Math.floor(Math.random() * PASSENGER_LINES.length)];
        G.bark({ pos: v.pos, isPed: true, inVehicle: null }, L.in.replace('%', dz.ar));
        taxi.line = L;
      }
    } else if (taxi.phase === 'ride') {
      taxi.t += dt; taxi.target = { x: taxi.dest.x, z: taxi.dest.z };
      setObjective(`وصّل الزبون: ${taxi.dest.ar} — ${ar(Math.max(0, Math.ceil(taxi.limit - taxi.t)))} ث`);
      if (Math.hypot(v.pos.x - taxi.dest.x, v.pos.z - taxi.dest.z) < Math.max(8, taxi.dest.r * 0.6) && Math.abs(v.speed) < 4) {
        const fast = taxi.t < taxi.limit; const pay = fast ? taxi.pay + Math.round((taxi.limit - taxi.t) * 0.5) : Math.round(taxi.pay * 0.5);
        const [x, z] = G.vehicles.exitPoint(v); p.pos.set(x, groundAt(x, z), z); p.m.root.visible = true; p.inVehicle = false; p.state = 'walk'; p.pinned = false;
        G.bark(p, fast ? taxi.line.good : taxi.line.late); S.fares++; G.addMoney(pay, fast ? 'أجرة + بقشيش' : 'أجرة (اتأخرت)');
        if (S.fares === 10) giveCard('taxi10');
        taxi.ped = null; if (!active || active.st?.s.t !== 'taxi') setObjective(''); spawnFare();
      }
    }
  }

  // ---------- delivery job (Shehata's melons) ----------
  let delivery = null;
  function deliveryStart() {
    const v = G.vehicleOf(); if (!v || !(v.kind === 'tuk' || v.type === 'pickup')) { G.toast('محتاج التوكتوك أو عربية ربع نقل'); return; }
    const here = v.pos; const opts = DEST_ZONES.map(id => zones.find(z => z.id === id)).filter(z => z && Math.hypot(z.x - here.x, z.z - here.z) > 60);
    const dz = opts[Math.floor(Math.random() * opts.length)]; const d = Math.hypot(dz.x - here.x, dz.z - here.z);
    delivery = { on: true, dest: dz, t: 0, limit: Math.round(d / 7 + 30), crashes: 0, pay: Math.round(40 + d * 0.3) };
    G.say([['shehata', `البطيخ ده رايح ${dz.ar}... لو بطيخة واحدة اتكسرت هخصمها منك!`]]);
  }
  function updateDelivery(dt) {
    if (!delivery?.on) return;
    const v = G.vehicleOf(); delivery.t += dt;
    if (!v) { delivery = null; G.toast('التوصيل اتلغى'); setObjective(''); return; }
    if (delivery.crashes > 3) { delivery = null; G.big('البطيخ اتكسر!', 'شحاتة هيزعل'); G.sound.jingle(false); setObjective(''); return; }
    setObjective(`وصّل البطيخ: ${delivery.dest.ar} — ${ar(Math.max(0, Math.ceil(delivery.limit - delivery.t)))} ث — خبطات: ${ar(3 - delivery.crashes)}`);
    if (Math.hypot(v.pos.x - delivery.dest.x, v.pos.z - delivery.dest.z) < Math.max(8, delivery.dest.r * 0.6)) {
      const pay = delivery.t < delivery.limit ? delivery.pay : Math.round(delivery.pay * 0.5);
      S.deliveries++; G.addMoney(pay, 'توصيل بطيخ'); if (S.deliveries === 5) giveCard('melon5'); delivery = null; setObjective('');
    }
  }

  // ---------- races ----------
  let race = null;
  function startRace(id, st) {
    const R = RACES.find(r => r.id === id); if (!R) return;
    const v = G.vehicleOf(); if (!v) { G.toast('لازم تكون راكب'); return; }
    G.teleport(R.start[0], R.start[1], R.start[2]);
    const rivals = R.rivals.map(([type, dx, dz], i) => { const rv = G.vehicles.make(type, [0x2f5fb0, 0xffd400, 0x8a1a1a][i % 3], type === 'pickup' ? { load: 'boxes' } : {}); const yaw = R.start[2]; const fx = Math.cos(yaw), fz = -Math.sin(yaw); G.vehicles.place(rv, R.start[0] + fx * dx - fz * dz, R.start[1] + fz * dx + fx * dz, yaw); rv.race = { cp: 0 }; rv.max *= R.rivalSpeed || 1; return rv; });
    race = { R, st, cp: 0, t: 0, rivals, count: 3.5, done: false };
    G.toast(R.ar);
  }
  function endRace() { if (!race) return; for (const r of race.rivals) G.vehicles.remove(r); race = null; }
  function updateRace(dt) {
    if (!race) return;
    const R = race.R; const v = G.vehicleOf();
    if (race.count > 0) { race.count -= dt; setObjective(race.count > 0.5 ? `استعد... ${ar(Math.ceil(race.count - 0.5))}` : 'انطلق!'); if (v) { v.speed = 0; } for (const r of race.rivals) r.speed = 0; return; }
    race.t += dt;
    if (!v) { lose('نزلت من العربية'); return; }
    const cp = R.cps[race.cp]; race.st && (race.st.target = { x: cp[0], z: cp[1] });
    if (Math.hypot(v.pos.x - cp[0], v.pos.z - cp[1]) < 9) { race.cp++; G.sound.blip(); if (race.cp >= R.cps.length) { win(); return; } }
    setObjective(`${R.ar} — نقطة ${ar(race.cp + 1)}/${ar(R.cps.length)} — ${ar(Math.floor(race.t))} ث`);
    for (const r of race.rivals) {
      const c = R.cps[Math.min(r.race.cp, R.cps.length - 1)]; const dx = c[0] - r.pos.x, dz = c[1] - r.pos.z; const d = Math.hypot(dx, dz);
      if (d < 8) { r.race.cp++; if (r.race.cp >= R.cps.length) { lose('حد سبقك!'); return; } }
      const want = Math.atan2(-dz, dx); let err = want - r.yaw; while (err > Math.PI) err -= 6.283; while (err < -Math.PI) err += 6.283;
      const desired = (Math.abs(err) > 0.5 ? 0.55 : 1) * r.max * 0.92;
      G.vehicles.drive(r, Math.max(-1, Math.min(1, (desired - r.speed) * 0.4)), Math.max(-1, Math.min(1, err * 2.2)), false, dt);
    }
    function win() { const R2 = race.R; if (!S.races.includes(R2.id)) S.races.push(R2.id); const st = race.st; G.addMoney(R2.pay, 'كسبت السباق'); G.big('كسبت!', R2.ar); G.sound.cheer(); if (st) st.result = 'win'; endRace(); setObjective(''); if (S.races.length >= RACES.length) giveCard('races'); }
    function lose(why) { const st = race.st; endRace(); setObjective(''); if (st && active?.st === st) failMission(why); else { G.big('خسرت السباق', why); G.sound.jingle(false); } }
  }

  // ---------- garage upgrades, café, grocery ----------
  let lastVehicle = null;
  on('exitVehicle', (v) => { lastVehicle = v; });
  on('enterVehicle', (v) => { lastVehicle = v; if (S.upgrades[v.kind === 'car' ? 'car' : v.kind]) v.upgrade = S.upgrades[v.kind === 'car' ? 'car' : v.kind]; });
  function garagePage() {
    const div = document.createElement('div'); div.className = 'list';
    const v = lastVehicle; const key = v ? (v.kind === 'car' ? 'car' : v.kind) : null;
    const h = document.createElement('p'); h.className = 'hint2'; h.textContent = v ? `ورشة العالمي — العربية: ${v.ar}` : 'هات عربية الأول وانزل منها جنب الورشة'; div.appendChild(h);
    if (!v) return div;
    const lvl = S.upgrades[key] || 0; const prices = [150, 300, 500];
    const item = (label, price, fn, disabled) => { const b = document.createElement('button'); b.className = 'row ui'; b.innerHTML = `<b>${label}</b><span>${price ? ar(price) + ' ج' : ''}</span>`; b.disabled = !!disabled || (price && S.money < price); b.onclick = () => { if (price) G.addMoney(-price); fn(); G.sound.cash(); div.replaceWith(garagePage()); }; div.appendChild(b); };
    if (lvl < 3) item(`موتور ٣٠٠٠ — المستوى ${ar(lvl + 1)}`, prices[lvl], () => { S.upgrades[key] = lvl + 1; v.upgrade = lvl + 1; G.toast('العربية بقت أسرع!'); });
    else item('الموتور في آخر مستوى', 0, () => {}, true);
    if (v.kind === 'car') {
      const cols = [[0xd8231b, 'أحمر'], [0x1f5fd8, 'أزرق'], [0x111111, 'أسود'], [0xf0f0f0, 'أبيض'], [0x2f8f3a, 'أخضر'], ...(G.hasFlag('goldPaint') ? [[0xffc020, 'دهب']] : [])];
      for (const [c, n] of cols) item(`دهان ${n}`, 40, () => { v.body.traverse(o => { if (o.isMesh && o.material.vertexColors && o.geometry.attributes.color) { /* repaint: tint body by recolouring the vc material copy */ } }); repaint(v, c); });
    }
    item('تصليح وتلميع', 20, () => { v.damage = 0; G.toast('زي الفل!'); });
    return div;
  }
  function repaint(v, color) {
    // the body colour is baked into vertex colours: replace the dominant body colour
    const target = new THREE.Color(color);
    v.body.traverse(o => {
      if (!o.isMesh || !o.geometry.attributes.color || o.parent !== v.body) return;
      const c = o.geometry.attributes.color; const counts = new Map();
      for (let i = 0; i < c.count; i++) { const k = c.getX(i).toFixed(3) + c.getY(i).toFixed(3) + c.getZ(i).toFixed(3); counts.set(k, (counts.get(k) || 0) + 1); }
      let best = null, bn = 0; for (const [k, n] of counts) if (n > bn) { bn = n; best = k; }
      for (let i = 0; i < c.count; i++) { const k = c.getX(i).toFixed(3) + c.getY(i).toFixed(3) + c.getZ(i).toFixed(3); if (k === best) c.setXYZ(i, target.r, target.g, target.b); }
      c.needsUpdate = true;
    });
  }

  // ---------- context actions ----------
  function contextActions() {
    const out = []; const p = G.pos(); const v = G.vehicleOf();
    if (G.dlgActive()) return out;
    if (!active && !G.interior) {
      for (const m of available().slice(0, 3)) { const gp = giverPos(m); if (gp && Math.hypot(p.x - gp.x, p.z - gp.z) < 3 && !v) out.push({ p: 9, ar: `مهمة: ${m.ar}`, fn: () => startMission(m) }); }
    }
    if (v && G.hasFlag('taxiJob') && taxiVehicleOk() && !race && !delivery?.on) out.push({ p: 2, ar: taxi.on ? 'وقّف الشغل' : 'شغّل التاكسي', fn: () => (taxi.on ? taxiStop('الشغل وقف') : taxiStart()) });
    if (v && G.hasFlag('deliveryJob') && !delivery?.on && !taxi.on && Math.hypot(p.x + 11, p.z - 9) < 8 && Math.abs(v.speed) < 2) out.push({ p: 6, ar: 'شغل توصيل البطيخ', fn: deliveryStart });
    if (v && !active && !race) for (const R of RACES) { if ((R.need || []).every(f => G.hasFlag(f)) && Math.hypot(p.x - R.start[0], p.z - R.start[1]) < 10 && Math.abs(v.speed) < 2) out.push({ p: 6, ar: `ابدأ ${R.ar}`, fn: () => startRace(R.id, null) }); }
    if (!v && !G.interior && Math.hypot(p.x + 11, p.z + 11.4) < 2.2) out.push({ p: 7, ar: 'ورشة العالمي (تعديل العربية)', fn: () => openSheet('garage') });
    if (G.interior === 'cafe') { const c = G.interiors.cafe.counter; if (Math.hypot(p.x - c[0], p.z - c[1]) < 2) out.push({ p: 7, ar: 'اشرب شاي واقعد ساعة (٥ ج)', fn: () => { if (S.money < 5) { G.toast('معاكش فلوس'); return; } G.addMoney(-5); S.time = (S.time + 1) % 24; G.toast('شاي بالنعناع... الساعة عدّت'); } }); }
    if (G.interior === 'grocery') { const c = G.interiors.grocery.shop; if (Math.hypot(p.x - c[0], p.z - c[1]) < 1.8) out.push({ p: 7, ar: 'اشتري حاجة ساقعة (١٠ ج)', fn: () => { if (S.money < 10) { G.toast('معاكش فلوس'); return; } G.addMoney(-10); G.toast(['كانز ساقع... آه يا حلاوة', 'كيس شيبس بالشطة', 'عصير مانجا', 'آيس كريم بالفانيليا'][Math.floor(Math.random() * 4)]); } }); }
    return out;
  }
  function openSheet(kind) { const el = document.getElementById('phone'); el.classList.add('on'); document.querySelectorAll('.tab').forEach(b => b.classList.remove('cur')); const body = document.getElementById('phoneBody'); body.innerHTML = ''; body.appendChild(kind === 'garage' ? garagePage() : document.createElement('div')); }

  // ---------- markers for the minimap ----------
  function mapMarkers(all) {
    const out = [];
    const st = active?.st;
    if (st?.target) out.push({ x: st.target.x, z: st.target.z, col: '#ffd400', icon: '★' });
    if (taxi.on && taxi.target && !(st?.s.t === 'taxi')) out.push({ x: taxi.target.x, z: taxi.target.z, col: '#3df05a', icon: 'ت' });
    if (delivery?.on) out.push({ x: delivery.dest.x, z: delivery.dest.z, col: '#3df05a', icon: 'ب' });
    if (race && !race.st) { const c = race.R.cps[Math.min(race.cp, race.R.cps.length - 1)]; out.push({ x: c[0], z: c[1], col: '#ff5050', icon: 'س' }); }
    if (!active) for (const m of available().slice(0, 3)) { const gp = giverPos(m); if (gp) out.push({ x: gp.x, z: gp.z, col: '#ffd400', icon: '!' }); }
    if (!active && !race) for (const R of RACES) if ((R.need || []).every(f => G.hasFlag(f))) out.push({ x: R.start[0], z: R.start[1], col: '#ff5050', icon: 'س' });
    if (all || !active) out.push({ x: -11, z: -11, col: '#2f5fb0', icon: 'و' });
    if (waypoint) out.push({ x: waypoint.x, z: waypoint.z, col: '#ff40ff', icon: '✕' });
    return out;
  }
  function currentTarget() {
    const st = active?.st; if (st?.target) return st.target;
    if (taxi.on && taxi.target) return taxi.target; if (delivery?.on) return { x: delivery.dest.x, z: delivery.dest.z };
    if (race) { const c = race.R.cps[Math.min(race.cp, race.R.cps.length - 1)]; return { x: c[0], z: c[1] }; }
    return waypoint;
  }

  // ---------- phone pages ----------
  function phonePage(tab, opts) {
    const div = document.createElement('div'); div.className = 'list';
    const row = (a, b, cls = '') => { const r = document.createElement('div'); r.className = 'row ' + cls; r.innerHTML = `<b>${a}</b><span>${b}</span>`; div.appendChild(r); return r; };
    if (tab === 'missions') {
      const done = doneSet(); const av = new Set(available().map(m => m.id));
      for (const m of MISSIONS) { const st = done.has(m.id) ? '✔ خلصت' : av.has(m.id) ? `متاحة — روح لـ${G.CAST_BY_ID[m.giver].ar}` : '🔒'; const r = row(m.ar, st, done.has(m.id) ? 'ok' : av.has(m.id) ? 'av' : 'lock'); if (av.has(m.id)) { r.classList.add('ui'); r.onclick = () => { const gp = giverPos(m); if (gp) { waypoint = { x: gp.x, z: gp.z }; G.toast('اتحطت علامة'); } }; } }
      const h = document.createElement('p'); h.className = 'hint2'; h.textContent = 'شغلانات جانبية:'; div.appendChild(h);
      row('تاكسي / أوبر', G.hasFlag('taxiJob') ? `${ar(S.fares)} مشوار — اركب التاكسي أو التوكتوك أو الـ١٢٨` : '🔒 بعد مهمة «أوبر إبراهيم»');
      row('توصيل بطيخ شحاتة', G.hasFlag('deliveryJob') ? `${ar(S.deliveries)} توصيلة — اركن جنب الفرشة` : '🔒 بعد مهمة «البطيخ المستورد»');
      for (const R of RACES) row(R.ar, (R.need || []).every(f => G.hasFlag(f)) ? (S.races.includes(R.id) ? '✔ كسبت' : `${ar(R.pay)} ج`) : '🔒');
      row('كورة في المدرسة', `${ar(S.goals)} جون`);
    } else if (tab === 'cards') {
      const grid = document.createElement('div'); grid.className = 'cards';
      for (const c of CARDS) { const has = S.cards.includes(c.id); const el = document.createElement('div'); el.className = 'card2 ' + (has ? c.rar : 'lock'); el.innerHTML = has ? `<b>${c.ar}</b><small>${c.rarAr}</small><p>${c.desc}</p>` : `<b>؟؟؟</b><small>${c.hint}</small>`; grid.appendChild(el); }
      div.appendChild(grid);
    } else if (tab === 'stats') {
      const done = doneSet();
      row('الفلوس', `${ar(S.money)} ج`); row('المهمات', `${ar(done.size)}/${ar(MISSIONS.length)}`); row('مسامير الدهب', `${ar(S.bolts.length)}/${ar(BOLTS.length)}`);
      row('القفزات', `${ar(S.ramps.length)}/${ar(ramps.length)}`); row('الكروت', `${ar(S.cards.length)}/${ar(CARDS.length)}`); row('مشاوير التاكسي', ar(S.fares)); row('توصيل البطيخ', ar(S.deliveries)); row('السباقات', `${ar(S.races.length)}/${ar(RACES.length)}`); row('الجون', ar(S.goals)); row('ناس وقعتهم', ar(S.knocked));
      const pct = Math.round((done.size / MISSIONS.length * 50) + (S.bolts.length / BOLTS.length * 15) + (S.ramps.length / ramps.length * 10) + (S.races.length / RACES.length * 10) + (S.cards.length / CARDS.length * 15));
      row('اللعبة خلصت بنسبة', `${ar(pct)}٪`, 'av');
    } else if (tab === 'settings') {
      const b = document.createElement('button'); b.className = 'row ui'; b.innerHTML = `<b>الصوت</b><span>${G.sound.on ? 'شغال' : 'مقفول'}</span>`; b.onclick = () => { G.sound.on = !G.sound.on; b.querySelector('span').textContent = G.sound.on ? 'شغال' : 'مقفول'; }; div.appendChild(b);
      const n = document.createElement('button'); n.className = 'row ui danger'; n.innerHTML = '<b>لعبة جديدة</b><span>هيمسح التقدم</span>'; n.onclick = () => { if (n.dataset.sure) opts.reset(); else { n.dataset.sure = 1; n.querySelector('span').textContent = 'دوس تاني للتأكيد'; } }; div.appendChild(n);
      const h = document.createElement('p'); h.className = 'hint2'; h.textContent = 'كيبورد: WASD مشي/سواقة — Shift جري — Space نط/فرامل — E الزرار الكبير — H كلاكس — R الزرار الأحمر — Q تبديل — M الموبايل'; div.appendChild(h);
    }
    return div;
  }

  // ---------- per frame ----------
  const arrowEl = document.getElementById('arrow');
  function update(dt) {
    updateMission(dt); updateTaxi(dt); updateDelivery(dt); updateRace(dt); updateBolts();
    for (const pk of pickups) { pk.m.rotation.y = G.t * 3; pk.m.position.y = pk.y + 0.8 + Math.sin(G.t * 3 + pk.x) * 0.15; pk.m.visible = !pk.got && !G.interior; }
    // target beam + direction arrow
    const tg = currentTarget(); const p = G.pos();
    if (tg && !G.interior) {
      beam.visible = true; ring.visible = true; const y = tg.y ?? groundAt(tg.x, tg.z, 50);
      beam.position.set(tg.x, y + 20, tg.z); ring.position.set(tg.x, y + 0.2 + Math.sin(G.t * 4) * 0.1, tg.z); ring.rotation.z = G.t;
      const d = Math.hypot(tg.x - p.x, tg.z - p.z);
      const ang = Math.atan2(tg.x - p.x, tg.z - p.z); const camAng = Math.atan2(G.camera.position.x - p.x, G.camera.position.z - p.z);
      arrowEl.style.display = d > 6 ? '' : 'none'; arrowEl.style.transform = `rotate(${(-(ang - camAng) + Math.PI) * 180 / Math.PI}deg)`;
      document.getElementById('arrowD').textContent = `${ar(Math.round(d))} م`;
      if (waypoint && tg === waypoint && d < 8) waypoint = null;
    } else { beam.visible = false; ring.visible = false; arrowEl.style.display = 'none'; document.getElementById('arrowD').textContent = ''; }
    // "!" over mission givers
    const av = active ? [] : available().slice(0, 3);
    bangs.forEach((b, i) => { const m = av[i]; const a = m && G.byId[m.giver]; if (a && a.c.root.visible && !G.interior) { b.visible = true; b.position.set(a.pos.x, a.pos.y + 2.9 + Math.sin(G.t * 3) * 0.12, a.pos.z); } else b.visible = false; });
  }
  const api = { startMission, setObjective, addPickup, giveCard, emit, on, failMission, nextStep, get active() { return active; } };
  return {
    _debug: { missions: MISSIONS, get active() { return active; }, nextStep, startMission, taxi, get race() { return race; } },
    update, emit, contextActions, mapMarkers, phonePage, setWaypoint: (x, z) => { waypoint = { x, z }; },
    inMission: () => !!active || !!race, frozen: () => false, noChaos: () => !!active?.m.noChaos,
    allow: (kind) => !!active && (active.m.allow || []).includes(kind),
    talkOverride: (id) => { const m = !active && available().find(mm => mm.giver === id); return m ? [[id, m.teaser || 'عندي ليك شغلانة... قرّب.']] : null; },
    onStart: () => { if (!S.done.length && !S.flags.includes('welcomed')) { G.setFlag('welcomed'); setTimeout(() => G.say([['mom', 'إبراهيم! إنت لسه واقف في الشارع؟ تعالى عايزاك!'], ['dad', '(روح لأم حمادة... علامة الـ«!» الصفرا فوق دماغها)']]), 900); } },
  };
}
