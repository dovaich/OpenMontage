// The series cast, rebuilt from the episode sources (engine8.js, crew_def.js, alamy.js, fein-eltoktok-src).
// Every character is playable. Create them only after the fonts are loaded (Hamada's jersey draws text).
import * as THREE from 'three';
import { rng, canvasTex, M, P, mesh, box, cyl, makeChar } from './kit.js';

let TEX = null;
function textures() {
  if (TEX) return TEX;
  const floral = canvasTex(32, 32, (g) => {
    g.fillStyle = '#ec86ad'; g.fillRect(0, 0, 32, 32);
    const r = rng(4); for (let i = 0; i < 9; i++) { const x = r() * 28 | 0, y = r() * 28 | 0; g.fillStyle = '#fff3a6'; g.fillRect(x + 1, y, 2, 4); g.fillRect(x, y + 1, 4, 2); g.fillStyle = '#c0306a'; g.fillRect(x + 1, y + 1, 2, 2); }
  }, [3, 3]);
  const stripe = canvasTex(16, 16, (g) => { g.fillStyle = '#7f8fa8'; g.fillRect(0, 0, 16, 16); g.fillStyle = '#3d4e6b'; g.fillRect(2, 0, 3, 16); g.fillRect(10, 0, 2, 16); }, [3, 2]);
  const jersey = canvasTex(32, 32, (g) => {
    g.fillStyle = '#d4141c'; g.fillRect(0, 0, 32, 32);
    g.fillStyle = '#ffffff'; g.fillRect(0, 2, 32, 2); g.fillRect(0, 28, 32, 1);
    g.fillStyle = '#ffffff'; g.font = '14px "Press Start 2P"'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('10', 16, 17);
  });
  const shorts = canvasTex(16, 16, (g) => { g.fillStyle = '#1b1b1b'; g.fillRect(0, 0, 16, 16); g.fillStyle = '#ffffff'; g.fillRect(13, 0, 2, 16); });
  const coverall = (c) => canvasTex(16, 16, (g) => { g.fillStyle = c; g.fillRect(0, 0, 16, 16); g.fillStyle = 'rgba(0,0,0,0.18)'; g.fillRect(7, 0, 2, 16); g.fillStyle = 'rgba(255,255,255,0.12)'; g.fillRect(2, 3, 4, 3); });
  const hooda = canvasTex(32, 32, (g) => { g.fillStyle = '#ffd400'; g.fillRect(0, 0, 32, 32); g.fillStyle = '#111'; g.fillRect(0, 12, 32, 3); g.fillRect(0, 20, 32, 2); });
  const shehata = canvasTex(16, 16, (g) => { g.fillStyle = '#e8eef8'; g.fillRect(0, 0, 16, 16); g.fillStyle = '#3a5aa8'; g.fillRect(0, 0, 2, 16); g.fillRect(6, 0, 2, 16); g.fillRect(12, 0, 2, 16); }, [3, 2]);
  const gazzar = canvasTex(16, 16, (g) => { g.fillStyle = '#4a4a38'; g.fillRect(0, 0, 16, 16); g.fillStyle = '#1a1a14'; g.fillRect(3, 5, 4, 3); g.fillRect(10, 11, 3, 2); });
  TEX = { floral, stripe, jersey, shorts, coverall, hooda, shehata, gazzar };
  return TEX;
}

function makeAlamy(parent) {
  const JACKET = 0x151518, KNIT = 0x101013, SILVER = 0xb9bcc4, HAIR = 0x0c0a09;
  const c = makeChar({ seed: 71, skin: 0xb98258, hipY: 0.86, legX: 0.11, legColor: 0x5a5d64, shoe: 0x0c0c10, hand: 0xb98258,
    torsoGeo: cyl(0.25, 0.22, 0.64, 8), torsoTex: null, torsoColor: JACKET, torsoY: 0.32, sleeve: true, sleeveColor: JACKET,
    shoulderX: 0.31, shoulderY: 0.57, neckY: 0.64, headR: 0.27,
    build(head, torso, reg) {
      const hair = reg(M(HAIR));
      const cap = mesh(new THREE.SphereGeometry(0.286, 10, 6, 0, Math.PI * 2, 0, Math.PI * 0.5), hair, 0, 0.0, -0.01, head); cap.rotation.x = -0.4;
      const vol = mesh(new THREE.SphereGeometry(0.17, 8, 5), hair, 0, 0.215, 0.0, head); vol.scale.set(1.5, 0.45, 1.4);
      const swoop = mesh(new THREE.SphereGeometry(0.12, 8, 5), hair, 0, 0.235, 0.13, head); swoop.scale.set(1.75, 0.5, 1.0); swoop.rotation.x = -0.35;
      for (const sx of [-1, 1]) mesh(box(0.02, 0.12, 0.22), hair, sx * 0.272, 0.04, -0.04, head);
      mesh(box(0.17, 0.5, 0.02), reg(M(KNIT)), 0, 0.36, 0.236, torso);
      mesh(cyl(0.125, 0.135, 0.13, 8), reg(M(KNIT)), 0, 0.68, 0, torso);
      for (const sx of [-1, 1]) mesh(box(0.016, 0.56, 0.03), reg(M(SILVER)), sx * 0.092, 0.33, 0.245, torso);
      mesh(box(0.3, 0.08, 0.04), reg(P(JACKET, { shininess: 80, specular: 0x777777 })), 0, 0.66, -0.13, torso);
      for (const sx of [-1, 1]) { const b = mesh(box(0.04, 0.08, 0.2), reg(P(JACKET, { shininess: 80, specular: 0x777777 })), sx * 0.15, 0.66, 0.05, torso); b.rotation.y = sx * -0.35; }
      mesh(box(0.03, 0.03, 0.02), reg(M(SILVER)), 0.14, 0.66, 0.16, torso);
      mesh(box(0.46, 0.05, 0.03), reg(M(0x111114)), 0, 0.03, 0.215, torso);
      return {};
    } }, parent);
  const leather = () => { const m = P(JACKET, { shininess: 50, specular: 0x404048 }); m.userData.orig = m.color.clone(); c.mats.push(m); return m; };
  c.torsoMesh.material = leather();
  for (const a of c.arms) {
    a.sh.children[0].material = leather();
    a.el.children[0].material = leather();
    for (const y of [-0.04, -0.08, -0.12]) mesh(box(0.136, 0.012, 0.136), M(0x0a0a0c), 0, y, 0, a.sh);
    mesh(box(0.125, 0.04, 0.125), M(0x111114), 0, -0.3, 0, a.el);
  }
  c.legs.forEach(l => { l.userData.shoe.material = P(0x0c0c10, { shininess: 140, specular: 0xffffff }); });
  return c;
}

const BUILD = {
  dad(parent) {
    const T = textures();
    return makeChar({
      seed: 5, skin: 0xb27448, hipY: 0.9, legX: 0.11, legColor: 0xffffff, legTex: T.stripe, shoe: 0x6b4a2a, hand: 0xb27448,
      torsoGeo: cyl(0.25, 0.22, 0.7, 6), torsoTex: null, torsoColor: 0xf3f0e3, torsoY: 0.35,
      shoulderX: 0.31, shoulderY: 0.63, neckY: 0.72, headR: 0.29,
      build(head, torso, reg) {
        const hairMat = reg(M(0x1b1410));
        mesh(box(0.08, 0.16, 0.24), hairMat, 0.28, 0.02, -0.04, head); mesh(box(0.08, 0.16, 0.24), hairMat, -0.28, 0.02, -0.04, head);
        const gog = new THREE.Group(); head.add(gog); gog.position.set(0, 0.2, 0.2); gog.rotation.x = -0.6;
        const brass = reg(P(0xc9a227, { shininess: 80 }));
        for (const s of [-1, 1]) { mesh(new THREE.TorusGeometry(0.07, 0.025, 4, 8), brass, s * 0.1, 0, 0, gog); mesh(new THREE.CircleGeometry(0.06, 8), reg(P(0x335a3a, { shininess: 100 })), s * 0.1, 0, -0.005, gog); }
        mesh(box(0.06, 0.06, 0.01), reg(M(0x3a2d22)), 0.1, 0.2, 0.245, torso);
        mesh(box(0.05, 0.04, 0.01), reg(M(0x2a2a2a)), -0.12, 0.35, 0.245, torso);
        return { gog };
      }
    }, parent);
  },
  mom(parent) {
    const T = textures();
    return makeChar({
      seed: 3, skin: 0xc98d5f, hipY: 0.82, legX: 0.14, legColor: 0xc98d5f, shoe: 0x2f6fff, hand: 0xffd400,
      torsoGeo: cyl(0.3, 0.42, 0.62, 7), torsoTex: T.floral, torsoColor: 0xffffff, torsoY: 0.31,
      skirt: cyl(0.42, 0.55, 0.55, 7), sleeve: true, shoulderX: 0.37, shoulderY: 0.56, neckY: 0.62, headR: 0.3,
      build(head, torso, reg) {
        const scarfMat = reg(M(0x1f9e5a));
        const scarf = mesh(new THREE.SphereGeometry(0.33, 8, 5, 0, Math.PI * 2, 0, Math.PI * 0.55), scarfMat, 0, 0.03, -0.03, head); scarf.rotation.x = -0.35;
        mesh(new THREE.IcosahedronGeometry(0.09, 0), scarfMat, 0, -0.12, -0.3, head);
        mesh(box(0.08, 0.22, 0.04), scarfMat, 0.05, -0.28, -0.3, head);
        return {};
      }
    }, parent);
  },
  son(parent) {
    const T = textures();
    return makeChar({
      seed: 9, skin: 0xb98058, hipY: 0.8, legX: 0.11, legColor: 0xb98058, shoe: 0xf0f0f0, hand: 0xb98058,
      torsoGeo: cyl(0.24, 0.27, 0.62, 6), torsoTex: T.jersey, torsoColor: 0xffffff, torsoY: 0.31,
      shorts: cyl(0.27, 0.29, 0.3, 6), shortsTex: T.shorts, sleeve: true, sleeveTex: null, sleeveColor: 0xd4141c,
      shoulderX: 0.3, shoulderY: 0.55, neckY: 0.62, headR: 0.27,
      build(head, torso, reg) {
        const hairMat = reg(M(0x17110c)); const r = rng(12);
        for (let i = 0; i < 10; i++) { const a = r() * 6.28; mesh(new THREE.IcosahedronGeometry(0.11, 0), hairMat, Math.cos(a) * 0.17, 0.2 + r() * 0.08, Math.sin(a) * 0.15 - 0.04, head); }
        const hp = new THREE.Group(); hp.position.set(0, 0.6, 0.02); torso.add(hp);
        const band = mesh(new THREE.TorusGeometry(0.2, 0.025, 4, 10, Math.PI), reg(P(0x222222)), 0, 0, 0, hp); band.rotation.x = Math.PI / 2 + 0.3;
        for (const s of [-1, 1]) mesh(cyl(0.07, 0.07, 0.06, 8), reg(P(0x2a2a2a)), s * 0.2, -0.02, 0.05, hp).rotation.z = Math.PI / 2;
        return {};
      }
    }, parent);
  },
  samir(parent) {
    return makeChar({
      seed: 21, skin: 0xc8946a, hipY: 0.84, legX: 0.12, legColor: 0x8a8f96, shoe: 0x5a3a22, hand: 0xc8946a,
      torsoGeo: cyl(0.27, 0.33, 0.66, 7), torsoTex: null, torsoColor: 0x8a8f96, torsoY: 0.33,
      skirt: cyl(0.33, 0.42, 0.75, 7), sleeve: true, sleeveColor: 0x8a8f96, shoulderX: 0.33, shoulderY: 0.6, neckY: 0.66, headR: 0.28,
      build(head, torso, reg) {
        const white = reg(M(0xf2f2f2));
        mesh(box(0.08, 0.14, 0.24), white, 0.27, 0.0, -0.04, head); mesh(box(0.08, 0.14, 0.24), white, -0.27, 0.0, -0.04, head);
        mesh(box(0.36, 0.12, 0.08), white, 0, -0.02, -0.26, head);
        mesh(new THREE.SphereGeometry(0.29, 8, 4, 0, Math.PI * 2, 0, Math.PI * 0.42), reg(M(0xffffff)), 0, 0.02, 0, head);
        return {};
      }
    }, parent);
  },
  hooda(parent) {
    const T = textures();
    return makeChar({
      seed: 31, skin: 0xa87048, hipY: 0.84, legX: 0.11, legColor: 0x2f4f8f, shoe: 0xf2f2f2, hand: 0xa87048,
      torsoGeo: cyl(0.24, 0.25, 0.64, 6), torsoTex: T.hooda, torsoColor: 0xffffff, torsoY: 0.32,
      sleeve: true, sleeveColor: 0xffd400, shoulderX: 0.3, shoulderY: 0.57, neckY: 0.64, headR: 0.27,
      build(head, torso, reg) {
        const hair = reg(M(0x120c08));
        for (let i = 0; i < 7; i++) { const s = mesh(new THREE.ConeGeometry(0.07, 0.22, 4), hair, -0.15 + i * 0.05, 0.27, -0.02 + (i % 2) * 0.05, head); s.rotation.z = (i - 3) * 0.18; s.rotation.x = -0.4; }
        mesh(box(0.5, 0.1, 0.45), hair, 0, 0.17, -0.05, head);
        const chain = mesh(new THREE.TorusGeometry(0.12, 0.012, 4, 10), reg(P(0xffd700, { shininess: 100 })), 0, 0.58, 0.18, torso); chain.rotation.x = 1.2;
        return {};
      }
    }, parent);
  },
  sayed(parent) {
    return makeChar({
      seed: 41, skin: 0x8a5a3a, hipY: 0.84, legX: 0.12, legColor: 0x6b5a48, shoe: 0x3a2a1a, hand: 0x8a5a3a,
      torsoGeo: cyl(0.28, 0.34, 0.66, 7), torsoTex: null, torsoColor: 0x6b5a48, torsoY: 0.33,
      skirt: cyl(0.34, 0.44, 0.75, 7), sleeve: true, sleeveColor: 0x6b5a48, shoulderX: 0.34, shoulderY: 0.6, neckY: 0.66, headR: 0.28,
      build(head, torso, reg) { const tw = reg(M(0xf4f2ea)); const turban = mesh(new THREE.TorusGeometry(0.24, 0.09, 5, 10), tw, 0, 0.2, -0.02, head); turban.rotation.x = Math.PI / 2; mesh(new THREE.SphereGeometry(0.2, 7, 4, 0, Math.PI * 2, 0, Math.PI / 2), tw, 0, 0.22, -0.02, head); mesh(box(0.62, 0.1, 0.05), reg(M(0xd8d0b8)), 0, 0.45, 0.24, torso); return {}; }
    }, parent);
  },
  shehata(parent) {
    const T = textures();
    return makeChar({
      seed: 51, skin: 0x9a6440, hipY: 0.86, legX: 0.14, legColor: 0x4a5a7a, shoe: 0x3a2a1a, hand: 0x9a6440,
      torsoGeo: cyl(0.34, 0.46, 0.7, 7), torsoTex: T.shehata, torsoColor: 0xffffff, torsoY: 0.35,
      skirt: cyl(0.46, 0.5, 0.7, 7), sleeve: true, shoulderX: 0.44, shoulderY: 0.62, neckY: 0.7, headR: 0.3,
      build(head, torso, reg) { mesh(new THREE.SphereGeometry(0.31, 8, 4, 0, Math.PI * 2, 0, Math.PI * 0.35), reg(M(0xf2f2f2)), 0, 0.04, 0, head); mesh(box(0.7, 0.55, 0.05), reg(M(0xd8c8a0)), 0, 0.25, 0.42, torso); return {}; }
    }, parent);
  },
  bastam(parent) {
    const T = textures();
    return makeChar({ seed: 61, skin: 0xb07a50, hipY: 0.84, legX: 0.11, legColor: 0x2f5fb0, shoe: 0x222222, hand: 0xb07a50,
      torsoGeo: cyl(0.24, 0.26, 0.64, 6), torsoTex: T.coverall('#2f5fb0'), torsoColor: 0xffffff, torsoY: 0.32, sleeve: true, sleeveColor: 0x2f5fb0, shoulderX: 0.3, shoulderY: 0.57, neckY: 0.64, headR: 0.27,
      build(head, torso, reg) { mesh(new THREE.SphereGeometry(0.28, 8, 4, 0, Math.PI * 2, 0, Math.PI * 0.42), reg(M(0xd8231b)), 0, 0.04, 0, head); mesh(box(0.3, 0.03, 0.2), reg(M(0xd8231b)), 0, 0.1, -0.3, head); mesh(box(0.12, 0.08, 0.02), reg(M(0xffffff)), 0.12, 0.45, 0.25, torso); return {}; } }, parent);
  },
  alamy: makeAlamy,
  asly(parent) {
    const T = textures();
    return makeChar({ seed: 81, skin: 0xa86a40, hipY: 0.86, legX: 0.16, legColor: 0x6a6a6a, shoe: 0x222222, hand: 0xa86a40,
      torsoGeo: cyl(0.4, 0.54, 0.72, 8), torsoTex: T.coverall('#6a6a6a'), torsoColor: 0xffffff, torsoY: 0.34, sleeve: true, sleeveColor: 0x6a6a6a, shoulderX: 0.44, shoulderY: 0.62, neckY: 0.7, headR: 0.32,
      build(head, torso, reg) { mesh(box(0.08, 0.14, 0.26), reg(M(0x2a1a10)), 0.31, 0.0, -0.04, head); mesh(box(0.08, 0.14, 0.26), reg(M(0x2a1a10)), -0.31, 0.0, -0.04, head); mesh(cyl(0.3, 0.3, 0.06, 8), reg(M(0xffd400)), 0, -0.05, 0.52, torso).rotation.x = Math.PI / 2; return {}; } }, parent);
  },
  gazzar(parent) {
    const T = textures();
    return makeChar({ seed: 91, skin: 0xa87048, hipY: 0.84, legX: 0.11, legColor: 0x3a3a2a, shoe: 0x222222, hand: 0xa87048,
      torsoGeo: cyl(0.24, 0.26, 0.64, 6), torsoTex: T.gazzar, torsoColor: 0xffffff, torsoY: 0.32, sleeve: true, sleeveColor: 0x4a4a38, shoulderX: 0.3, shoulderY: 0.57, neckY: 0.64, headR: 0.27,
      build(head, torso, reg) { const hair = reg(M(0x120c08)); const r = rng(14); for (let i = 0; i < 12; i++) { const a = r() * 6.28; mesh(new THREE.IcosahedronGeometry(0.1, 0), hair, Math.cos(a) * 0.2, 0.12 + r() * 0.1, Math.sin(a) * 0.18 - 0.08, head); } mesh(new THREE.TorusGeometry(0.27, 0.035, 4, 12), reg(M(0xd8231b)), 0, 0.12, 0, head).rotation.x = Math.PI / 2 - 0.1; return {}; } }, parent);
  },
};

// name, English name, tag colour, face options, walk speed multiplier, idle mood, lines they say when you talk to them
export const CAST = [
  { id: 'dad', ar: 'إبراهيم', en: 'IBRAHIM', col: '#c9a227', face: { stache: true }, speed: 1.0, mood: 'smug',
    lines: ['أنا المخترع العالمي... ومحدش فاهمني.', 'ناقصني قطعة واحدة بس... والاختراع يبقى نووي.', 'اوعى حد يلمس الزرار الأحمر.', 'الطبق ده لو لفّيته شمال... نلقط النت من اليابان.'] },
  { id: 'mom', ar: 'أم حمادة', en: 'OM HAMADA', col: '#1f9e5a', face: {}, speed: 0.95, mood: 'angry',
    lines: ['إبراهيم! لو الاختراع ده ولّع تاني... هتبات في البلكونة!', 'حمادة! الغدا بقاله ساعة على السفرة!', 'الشبشب جاهز... متجربنيش.', 'هو مفيش راجل في الحي ده بيصلّح حاجة من غير ما تنفجر؟'] },
  { id: 'son', ar: 'حمادة', en: 'HAMADA', col: '#d4141c', face: {}, speed: 1.12, mood: 'tired',
    lines: ['يا بابا النت فاصل... والماتش رانكد!', 'خمس دقايق وهقوم... والله.', 'لو ماما سألت... أنا بذاكر.', 'Achievement جديد: هربت من الشبشب ٣ مرات النهارده.'] },
  { id: 'samir', ar: 'أبو سمير', en: 'ABU SAMIR', col: '#6a6f78', face: { stache: true, stacheColor: '#eeeeee' }, speed: 0.7, mood: 'side',
    lines: ['الباسورد اتغيّر... ومحدش هياخده.', 'العربية زعلانة... محتاجة حب.', 'مين اللي ركن جنب الـ١٢٨؟!', 'أنا ساكن فوقكم من سنة ٨٠... والنت بتاعي.'] },
  { id: 'hooda', ar: 'حودة', en: 'HOODA', col: '#e0b000', face: {}, speed: 1.1, mood: 'smug',
    lines: ['التوكتوك ده مش أي توكتوك... ده ٣٠٠٠.', 'اركب يا باشا... أي حتة بخمسة.', 'ما شاء الله ولا قوة إلا بالله.', 'آخر مرة إبراهيم صلّحلي الموتور... طرت.'] },
  { id: 'sayed', ar: 'عم سيد', en: 'UNCLE SAYED', col: '#6b5a48', face: { stache: true, stacheColor: '#dddddd' }, speed: 0.75, mood: 'tired',
    lines: ['اتفضل يا أستاذ... بس متقولش إن الشاي بيفكّر.', 'أنا صاحي... أنا بس مغمّض.', 'العمارة دي فيها ٤٠ شقة... و٤٠ مشكلة.'] },
  { id: 'shehata', ar: 'شحاتة', en: 'SHEHATA', col: '#3a5aa8', face: { stache: true }, speed: 0.85, mood: 'angry',
    lines: ['البطيخ المستورد! مين كسر البطيخ؟!', 'اتنين بخمسة... عشانك بس.', 'التوكتوك لو قرّب من الفرشة تاني... هبيعه بالكيلو.'] },
  { id: 'bastam', ar: 'بستم', en: 'BESTEM', col: '#2f5fb0', face: { fuzz: true }, speed: 1.0, mood: 'wide',
    lines: ['يا جزااااار!', 'الكمبيوتر ده بيشتغل بإيه؟ بنزين؟', 'يا عالمي! الواد بيقول الإيميل وقع... نلمّه إزاي؟'] },
  { id: 'alamy', ar: 'العالمي', en: 'EL-ALAMY', col: '#3a3a44', face: {}, speed: 1.0, mood: 'smug',
    lines: ['حسب حساباتي... محدش هنا فاهم حاجة.', 'أنا العالمي. هو مخترع عالمي ليه أصلًا؟', 'السيستم شغال... الناس هي اللي واقعة.'] },
  { id: 'asly', ar: 'الأصلي', en: 'EL-ASLY', col: '#6a6a6a', face: { stache: true }, speed: 0.9, mood: 'angry',
    lines: ['مين اللي لمس الفيشة؟! هاتهولي!', 'أنا النهارده هضرب حد... لسه مش عارف مين.', 'الكهربا دي أنا اللي مربّيها.'] },
  { id: 'gazzar', ar: 'الجزار', en: 'EL-GAZZAR', col: '#4a4a38', face: { fuzz: true }, speed: 0.8, mood: 'tired',
    lines: ['العربية دي... بتكلمني... ولا أنا اللي بكلمها؟', 'ركّبتلها موتور... من إيه؟ مش فاكر.', 'أنا كويس... أنا بس بفكّر في البستم.'] },
];
export const CAST_BY_ID = Object.fromEntries(CAST.map(c => [c.id, c]));

export function buildCharacter(id, parent) {
  const c = BUILD[id](parent);
  c.id = id;
  return c;
}
