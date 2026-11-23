// One shared texture for every Arabic sign in the game (shop signs, plates, taxi roof signs...): one material, one draw call per chunk.
import * as THREE from 'three';
const CW = 256, CH = 64, COLS = 4, ROWS = 48;
const cv = document.createElement('canvas'); cv.width = CW * COLS; cv.height = CH * ROWS;
const g = cv.getContext('2d');
export const atlasTex = new THREE.CanvasTexture(cv);
atlasTex.magFilter = THREE.NearestFilter; atlasTex.minFilter = THREE.LinearFilter; atlasTex.generateMipmaps = false; atlasTex.colorSpace = THREE.SRGBColorSpace;
export const signMat = new THREE.MeshLambertMaterial({ map: atlasTex, emissiveMap: atlasTex, emissive: 0xffffff, emissiveIntensity: 0 });
export const signMatDouble = new THREE.MeshLambertMaterial({ map: atlasTex, emissiveMap: atlasTex, emissive: 0xffffff, emissiveIntensity: 0, side: THREE.DoubleSide });
export const signMatGlow = new THREE.MeshBasicMaterial({ map: atlasTex });
const cache = new Map(); let n = 0;
export function signUV(text, bg = '#1f6fd8', fg = '#ffffff', size = 40) {
  const key = text + '|' + bg + '|' + fg + '|' + size;
  if (cache.has(key)) return cache.get(key);
  const i = n++ % (COLS * ROWS), cx = (i % COLS) * CW, cy = Math.floor(i / COLS) * CH;
  g.save(); g.beginPath(); g.rect(cx, cy, CW, CH); g.clip();
  g.fillStyle = bg; g.fillRect(cx, cy, CW, CH);
  g.fillStyle = 'rgba(255,255,255,0.22)'; g.fillRect(cx, cy, CW, 4); g.fillStyle = 'rgba(0,0,0,0.3)'; g.fillRect(cx, cy + CH - 4, CW, 4);
  g.font = `${size}px Lalezar`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.direction = 'rtl';
  let s = size; while (g.measureText(text).width > CW - 16 && s > 14) { s -= 2; g.font = `${s}px Lalezar`; }
  g.fillStyle = 'rgba(0,0,0,0.45)'; g.fillText(text, cx + CW / 2 + 2, cy + CH / 2 + 4); g.fillStyle = fg; g.fillText(text, cx + CW / 2, cy + CH / 2 + 2);
  g.restore();
  atlasTex.needsUpdate = true;
  const W = cv.width, H = cv.height, pad = 0.5;
  const uv = { u0: (cx + pad) / W, u1: (cx + CW - pad) / W, v0: 1 - (cy + CH - pad) / H, v1: 1 - (cy + pad) / H };
  cache.set(key, uv); return uv;
}
// a plane whose UVs point at one sign cell
export function signGeo(w, h, text, bg, fg, size) {
  const uv = signUV(text, bg, fg, size);
  const geo = new THREE.PlaneGeometry(w, h); const a = geo.attributes.uv;
  for (let i = 0; i < a.count; i++) a.setXY(i, a.getX(i) ? uv.u1 : uv.u0, a.getY(i) ? uv.v1 : uv.v0);
  return geo;
}
export function signMesh(w, h, text, bg, fg, opts = {}) {
  return new THREE.Mesh(signGeo(w, h, text, bg, fg, opts.size), opts.double ? signMatDouble : opts.glow ? signMatGlow : signMat);
}
