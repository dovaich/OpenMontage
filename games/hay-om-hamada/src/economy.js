// What the money is for: the car showroom, Ibrahim's workshop upgrades, the tailor, buying businesses (daily income),
// and your own cars (parked at home, callable from the phone).
import * as THREE from 'three';
import { mesh, box, cyl, M } from './kit.js';
import { signMesh } from './atlas.js';
import { OUTFITS } from './chars.js';
import { groundAt, queryColliders } from './world.js';

export const CAR_SHOP = [
  { type: 'hatch', ar: 'عربية صغيرة', price: 400, color: 0x3a6a8a },
  { type: 'sedan', ar: 'عربية ملاكي قديمة', price: 600, color: 0x8a1a1a },
  { type: 'wagon', ar: 'ستيشن ٧ راكب', price: 750, color: 0xc8c0a0 },
  { type: 'taxiWhite', ar: 'تاكسي أبيض (يشتغل تاكسي)', price: 900, color: 0xf2f2f2 },
  { type: 'pickup', ar: 'ربع نقل (يشتغل توصيل)', price: 1000, color: 0x2f5fb0 },
  { type: 'microbus', ar: 'ميكروباص', price: 1300, color: 0xf0f0f0 },
  { type: 'sedanNew', ar: 'عربية ملاكي جديدة', price: 1800, color: 0x111111 },
  { type: 'truck', ar: 'عربية نقل', price: 2400, color: 0x2f8f3a },
  { type: 'bus', ar: 'أتوبيس', price: 3500, color: 0xd8231b },
  { type: 'sport', ar: 'عربية سبور ٣٠٠٠', price: 6000, color: 0xffc020 },
];
export const WORKSHOP = [
  { id: 'magnet', ar: 'المغناطيس النووي', desc: 'يشد المسامير والقطع من ٣ أضعاف المسافة', price: 400 },
  { id: 'radar', ar: 'رادار المسامير', desc: 'مسامير الدهب تبان على الخريطة', price: 300 },
  { id: 'antiSlipper', ar: 'درع ضد الشبشب', desc: 'عداد الشبشب يعلى أبطأ، وأم حمادة محتاجة ٥ ضربات بدل ٣', price: 600 },
  { id: 'nitro', ar: 'نيترو ٣٠٠٠', desc: 'زرار نيترو لأي عربية (٣ ثواني سرعة نووية)', price: 800 },
  { id: 'fuel', ar: 'بنزين نووي مضاعف', desc: 'الزرار الأحمر يطير الضعف', price: 700, need: 'redButton' },
];
export const PROPS = [
  { id: 'tukstand', ar: 'موقف التوكتوك', x: -5.6, z: 9.4, price: 600, income: 25 },
  { id: 'shehata', ar: 'شراكة في فرشة شحاتة', x: -9.0, z: 13.8, price: 800, income: 30 },
  { id: 'grocery', ar: 'بقالة الأمل', x: 20.6, z: -5.2, price: 1000, income: 40 },
  { id: 'cafe', ar: 'قهوة الحبايب', x: 13.2, z: 4.6, price: 1500, income: 60 },
  { id: 'garage', ar: 'مركز الصيانة', x: -8.2, z: -7.0, price: 3000, income: 120, perk: 'التعديلات بنص التمن' },
  { id: 'gas', ar: 'البنزينة', x: 11, z: -87.5, price: 4000, income: 160 },
  { id: 'studio', ar: 'قناة عاجل جدًا', x: 35.4, z: 31.5, price: 6000, income: 220 },
  { id: 'mall', ar: 'سنتر النجوم', x: -14, z: -91, price: 9000, income: 320 },
];
const HOME_SLOTS = [[27, -4.6, 0], [32.5, -4.6, 0], [4.6, -16, -Math.PI / 2], [4.6, -26, -Math.PI / 2]];
const SHOWROOM = { x: -45.8, z: -20 }, TAILOR = { x: 28.8, z: -5.9 }, BENCH = { x: 9, z: -9.8, y: 18.5 };

export function createEconomy(G, h) {
  const S = G.S, ar = G.ar;
  S.owned ||= []; S.props ||= []; S.outfits ||= {}; S.lastIncomeDay ??= -1; S.day ??= 0;
  const has = (f) => G.hasFlag(f);
  const price = (p) => (S.props.includes('garage') ? Math.round(p / 2) : p);

  // ---------- set dressing: showroom sign + display cars, tailor stand ----------
  { const sg = signMesh(4.2, 0.9, 'معرض عربيات ٣٠٠٠', '#151518', '#ffd400', { double: true }); sg.position.set(SHOWROOM.x - 0.3, 3.4, SHOWROOM.z); sg.rotation.y = Math.PI / 2; G.scene.add(sg);
    for (const s of [-1, 1]) mesh(box(0.15, 3.4, 0.15), M(0x3a3a3e), SHOWROOM.x - 0.3, 1.7, SHOWROOM.z + s * 2, G.scene);
    for (const [type, z, c] of [['sport', -13, 0xffc020], ['sedanNew', -27, 0x1f5fd8]]) { const v = G.vehicles.make(type, c); G.vehicles.place(v, -44.4, z, -Math.PI / 2); v.special = true; v.display = true; } }
  { const g = new THREE.Group(); g.position.set(TAILOR.x, 0.12, TAILOR.z); G.scene.add(g);
    mesh(cyl(0.25, 0.3, 0.1, 8), M(0x6a4220), 0, 0.05, 0, g); mesh(cyl(0.05, 0.05, 1.0, 5), M(0x6a4220), 0, 0.55, 0, g); mesh(cyl(0.22, 0.28, 0.6, 8), M(0xd8a020), 0, 1.3, 0, g); mesh(new THREE.SphereGeometry(0.14, 8, 6), M(0xe8d8c0), 0, 1.75, 0, g);
    const sg = signMesh(2.4, 0.5, 'ترزي الأناقة', '#6a2a5a', '#ffd400', { double: true }); sg.position.set(0, 2.4, 0.2); g.add(sg); }

  // ---------- your cars ----------
  for (const sp of G.vehicles.parkedSpots) if (HOME_SLOTS.some(([x, z]) => Math.hypot(sp.x - x, sp.z - z) < 6) || Math.hypot(sp.x + 44.4, sp.z + 20) < 12) sp.taken = true;
  const spawned = new Map(); // owned index -> vehicle
  function spawnOwned(i, x, z, yaw) {
    const o = S.owned[i]; let v = spawned.get(i);
    if (!v || !G.vehicles.list.includes(v)) { v = G.vehicles.make(o.type, o.color); v.special = true; v.owned = i; v.upgrade = o.up || 0; v.ar = `${o.ar} (بتاعتك)`; spawned.set(i, v); }
    G.vehicles.place(v, x, z, yaw); return v;
  }
  S.owned.forEach((o, i) => { if (i < HOME_SLOTS.length) spawnOwned(i, ...HOME_SLOTS[i]); });
  function callCar(i) {
    if (S.money < 20) { G.toast('محتاج ٢٠ جنيه للسواق اللي هيجيبها'); return; }
    if (G.interior) { G.toast('اطلع بره الأول'); return; }
    const p = G.pos(); const ry = G.player.ry; const fx = Math.sin(ry), fz = Math.cos(ry);
    // first free spot: in front, behind, left, right of you; the car faces where you are looking
    const free = (x, z) => !queryColliders(x, z, 3, []).some(b => b.circle ? Math.hypot(x - b.x, z - b.z) < b.r + 1.4 : (x > b.x0 - 1.4 && x < b.x1 + 1.4 && z > b.z0 - 1.4 && z < b.z1 + 1.4 && b.h > 0.6));
    const tries = [[fx * 4.5, fz * 4.5], [-fx * 4.5, -fz * 4.5], [-fz * 3.5, fx * 3.5], [fz * 3.5, -fx * 3.5], [fx * 8, fz * 8]];
    const t = tries.find(([dx, dz]) => free(p.x + dx, p.z + dz)) || tries[0];
    G.addMoney(-20); spawnOwned(i, p.x + t[0], p.z + t[1], ry - Math.PI / 2); G.toast('عربيتك وصلت!'); G.sound.horn('car');
  }

  // ---------- sheets (shown in the phone panel) ----------
  function list(title, rows) {
    const div = document.createElement('div'); div.className = 'list';
    const t = document.createElement('p'); t.className = 'hint2'; t.textContent = title; div.appendChild(t);
    for (const r of rows) {
      const b = document.createElement(r.fn ? 'button' : 'div'); b.className = 'row' + (r.fn ? ' ui' : '') + (r.cls ? ' ' + r.cls : '');
      b.innerHTML = `<b>${r.a}</b><span>${r.b ?? ''}</span>`; if (r.fn) { b.disabled = !!r.disabled; b.onclick = () => { r.fn(); refresh(); }; } div.appendChild(b);
    }
    return div;
  }
  let current = null;
  function refresh() { if (!current) return; const body = document.getElementById('phoneBody'); body.innerHTML = ''; body.appendChild(SHEETS[current]()); document.getElementById('money').textContent = ar(S.money) + ' ج'; }
  function open(kind) { current = kind; document.getElementById('phone').classList.add('on'); document.querySelectorAll('.tab').forEach(b => b.classList.remove('cur')); refresh(); }
  const SHEETS = {
    showroom: () => list('معرض عربيات ٣٠٠٠ — العربية اللي تشتريها بتتركن قدام البيت ومحدش ياخدها', CAR_SHOP.map(c => {
      const n = S.owned.filter(o => o.type === c.type).length;
      return { a: c.ar + (n ? ` (عندك ${ar(n)})` : ''), b: `${ar(c.price)} ج`, disabled: S.money < c.price, fn: () => {
        G.addMoney(-c.price); S.owned.push({ type: c.type, color: c.color, ar: c.ar, up: 0 }); const i = S.owned.length - 1;
        const slot = HOME_SLOTS[i % HOME_SLOTS.length]; spawnOwned(i, slot[0], slot[1], slot[2]); G.big('عربية جديدة!', c.ar); G.sound.jingle(); G.saveState();
      } };
    })),
    workshop: () => list('ورشة إبراهيم — اختراعات بتفيدك في اللعب', WORKSHOP.map(w => {
      const own = has(w.id), locked = w.need && !has(w.need);
      return { a: `${w.ar} — ${w.desc}`, b: own ? '✔ عندك' : locked ? '🔒 بعد مهمة الزرار الأحمر' : `${ar(w.price)} ج`, cls: own ? 'ok' : '', disabled: own || locked || S.money < w.price,
        fn: () => { G.addMoney(-w.price); G.setFlag(w.id); G.big('اختراع جديد!', w.ar); G.sound.jingle(); h.onUpgrade?.(w.id); G.saveState(); } };
    })),
    tailor: () => {
      const id = G.player.meta.id;
      if (id === 'alamy') return list('ترزي الأناقة', [{ a: 'العالمي لبسه ثابت: جاكت جلد إسود وبولو رقبة.', b: '' }]);
      const cur = S.outfits[id] || 'orig';
      return list(`ترزي الأناقة — لبس ${G.player.meta.ar}`, OUTFITS.map(o => ({ a: o.ar, b: cur === o.id ? '✔ لابسه' : o.price ? `${ar(o.price)} ج` : 'مجانًا', cls: cur === o.id ? 'ok' : '', disabled: cur === o.id || S.money < o.price,
        fn: () => { if (o.price) G.addMoney(-o.price); S.outfits[id] = o.id; G.rebuildActor(G.player, o.id); G.toast(`${G.player.meta.ar} بقى شيك!`); G.saveState(); } })));
    },
    property: () => {
      const p = PROPS.find(q => q.id === current_prop);
      if (!p) return list('', []);
      const own = S.props.includes(p.id);
      return list(own ? `${p.ar} ملكك` : `تشتري ${p.ar}؟`, [
        { a: 'الإيراد اليومي', b: `${ar(p.income)} ج كل يوم الساعة ٨ الصبح` },
        ...(p.perk ? [{ a: 'ميزة', b: p.perk }] : []),
        own ? { a: 'ملكك بالفعل', b: '✔', cls: 'ok' } : { a: 'اشتري', b: `${ar(p.price)} ج`, disabled: S.money < p.price, fn: () => { G.addMoney(-p.price); S.props.push(p.id); G.big('بقيت صاحب ملك!', p.ar); G.sound.jingle(); G.saveState(); } },
      ]);
    },
  };
  let current_prop = null;

  // ---------- daily income ----------
  let prevTime = S.time;
  function update() {
    const now = S.time; const crossed = (prevTime < 8 && now >= 8) || (prevTime > now && now >= 8);
    if (prevTime > now) S.day++;
    prevTime = now;
    if (crossed && S.props.length && S.lastIncomeDay !== S.day) {
      S.lastIncomeDay = S.day; const total = PROPS.filter(p => S.props.includes(p.id)).reduce((a, p) => a + p.income, 0);
      G.addMoney(total); G.big('الإيراد اليومي', `+${ar(total)} ج من ${ar(S.props.length)} ملك`); G.saveState();
    }
  }

  function contextActions() {
    const out = []; if (G.vehicleOf() || G.dlgActive()) return out;
    const p = G.pos(); const d = (q) => Math.hypot(p.x - q.x, p.z - q.z);
    if (G.interior) return out;
    if (d(SHOWROOM) < 3.5) out.push({ p: 7, ar: 'معرض العربيات', fn: () => open('showroom') });
    if (d(TAILOR) < 2.2) out.push({ p: 7, ar: 'ترزي الأناقة (غيّر اللبس)', fn: () => open('tailor') });
    if (d(BENCH) < 2.6 && Math.abs(p.y - BENCH.y) < 2 && !h.craftActive()) out.push({ p: 7, ar: 'ورشة إبراهيم (اختراعات)', fn: () => open('workshop') });
    for (const q of PROPS) if (d(q) < 1.8 && p.y < 3) out.push({ p: 4, ar: S.props.includes(q.id) ? `${q.ar} (ملكك)` : `اشتري ${q.ar} — ${ar(q.price)} ج`, fn: () => { current_prop = q.id; open('property'); } });
    return out;
  }
  function mapMarkers(all) {
    const out = [{ x: SHOWROOM.x, z: SHOWROOM.z, col: '#ffffff', icon: 'ع' }];
    if (all) out.push({ x: TAILOR.x, z: TAILOR.z, col: '#d8a020', icon: 'ت' });
    for (const q of PROPS) if (all || !S.props.includes(q.id)) out.push({ x: q.x, z: q.z, col: S.props.includes(q.id) ? '#3df05a' : '#7dff8a', icon: '$' });
    return out;
  }
  function ownedPage() {
    const div = document.createElement('div'); div.className = 'list';
    const t = (s) => { const p = document.createElement('p'); p.className = 'hint2'; p.textContent = s; div.appendChild(p); };
    t('عربياتي (دوس عشان السواق يجيبهالك — ٢٠ ج):');
    if (!S.owned.length) { const r = document.createElement('div'); r.className = 'row'; r.innerHTML = '<b>لسه معندكش عربية</b><span>معرض العربيات غرب الحي</span>'; div.appendChild(r); }
    S.owned.forEach((o, i) => { const b = document.createElement('button'); b.className = 'row ui'; b.innerHTML = `<b>${o.ar}</b><span>موتور ${ar(o.up || 0)}/٣ — هاتها</span>`; b.onclick = () => { callCar(i); document.getElementById('phone').classList.remove('on'); }; div.appendChild(b); });
    t('أملاكي:');
    let total = 0;
    for (const q of PROPS) { const own = S.props.includes(q.id); if (own) total += q.income; const r = document.createElement('div'); r.className = 'row ' + (own ? 'ok' : 'lock'); r.innerHTML = `<b>${q.ar}</b><span>${own ? `+${ar(q.income)} ج/يوم` : `${ar(q.price)} ج`}</span>`; div.appendChild(r); }
    const r = document.createElement('div'); r.className = 'row av'; r.innerHTML = `<b>الإيراد اليومي</b><span>${ar(total)} ج</span>`; div.appendChild(r);
    t('اختراعات الورشة:');
    for (const w of WORKSHOP) { const r2 = document.createElement('div'); r2.className = 'row ' + (has(w.id) ? 'ok' : 'lock'); r2.innerHTML = `<b>${w.ar}</b><span>${has(w.id) ? '✔' : ar(w.price) + ' ج'}</span>`; div.appendChild(r2); }
    return div;
  }
  return { update, contextActions, mapMarkers, ownedPage, price, open, spawned, closeSheet: () => { current = null; } };
}
export { groundAt };
