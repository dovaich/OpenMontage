import React, { useEffect, useLayoutEffect, useMemo, useState } from "react";
import { AbsoluteFill, Audio, Sequence, continueRender, delayRender, staticFile, useCurrentFrame } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import {
  Bloom, BrightnessContrast, EffectComposer, HueSaturation, N8AO, Noise, Sepia, ToneMapping, Vignette,
} from "@react-three/postprocessing";
import { ToneMappingMode } from "postprocessing";
import * as THREE from "three";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { clone as skeletonClone } from "three/examples/jsm/utils/SkeletonUtils.js";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import env from "./env.json";

// Mixamo FBX downloads ("Without Skin" is enough) dropped in public/models/anims/. The clip name is the file name.
const FBX_ANIMS = ["yelling", "angry_point", "arguing", "talking", "bragging", "shrug", "facepalm", "scared", "fall_back", "silly_dance"];

const FPS = 30;
// Timeline (seconds). Voiced windows were measured from the generated takes.
const OM_START = 0.5, IB_START = 4.3, CUT2 = 4.1, CUT3 = 8.05, TOAST = 8.5;

const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const seg = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const easeOut = (k: number) => 1 - Math.pow(1 - k, 3);
const easeInOut = (k: number) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
const easeBack = (k: number) => 1 + 2.9 * Math.pow(k - 1, 3) + 1.9 * Math.pow(k - 1, 2);
const rng = (seed: number) => () => {
  seed = (seed * 1664525 + 1013904223) >>> 0;
  return seed / 4294967296;
};
const envAt = (k: "om" | "ib", t: number, start: number) => {
  const i = Math.floor((t - start) * FPS);
  const a = (env as any)[k] as number[];
  return i >= 0 && i < a.length ? a[i] : 0;
};

// ---------- assets (Poly Haven, CC0) ----------
type Assets = { xbot: { scene: THREE.Object3D; animations: THREE.AnimationClip[] }; clips: THREE.AnimationClip[]; hdri: THREE.Texture; tex: Record<string, { map: THREE.Texture; normalMap: THREE.Texture; roughnessMap: THREE.Texture }> };
const TEX: Record<string, [number, number]> = {
  long_white_tiles: [3, 2], floor_tiles_06: [3, 3], oak_wood_planks: [2, 1], floral_jacquard: [3, 2],
};
const useAssets = (): Assets | null => {
  const [assets, setAssets] = useState<Assets | null>(null);
  const [handle] = useState(() => delayRender("assets"));
  useEffect(() => {
    const tl = new THREE.TextureLoader();
    const load = (id: string, name: string, srgb: boolean) =>
      tl.loadAsync(staticFile(`textures/${id}/${name}.jpg`)).then((t) => {
        t.wrapS = t.wrapT = THREE.RepeatWrapping;
        t.repeat.set(...TEX[id]);
        t.anisotropy = 4;
        if (srgb) t.colorSpace = THREE.SRGBColorSpace;
        return t;
      });
    const font = (file: string) => new FontFace("Lalezar", `url(${staticFile("fonts/" + file)})`).load().then((f) => (document as any).fonts.add(f));
    (async () => {
      const hdri = await new RGBELoader().loadAsync(staticFile("hdri/small_empty_room_1_1k.hdr"));
      hdri.mapping = THREE.EquirectangularReflectionMapping;
      const tex: Assets["tex"] = {};
      for (const id of Object.keys(TEX)) {
        const [map, normalMap, roughnessMap] = await Promise.all([load(id, "diff", true), load(id, "nor", false), load(id, "rough", false)]);
        tex[id] = { map, normalMap, roughnessMap };
      }
      await Promise.all([font("lalezar-arabic-400-normal.woff2"), font("lalezar-latin-400-normal.woff2")]);
      const xbot = await new GLTFLoader().loadAsync(staticFile("models/xbot/Xbot.glb"));
      const clips = [...xbot.animations];
      for (const name of FBX_ANIMS) {
        const fbx = await new FBXLoader().loadAsync(staticFile(`models/anims/${name}.fbx`));
        const clip = retarget(fbx, name, xbot.scene);
        clips.push(clip);
      }
      setAssets({ xbot, clips, hdri, tex });
      continueRender(handle);
    })();
  }, [handle]);
  return assets;
};

// Mixamo's own FBX skeleton and the GLB skeleton share bone names and proportions but not the bones' rest orientations,
// so a downloaded clip cannot be played as is. Bake it: copy each bone's world-space rotation away from the T-pose onto the GLB rig.
const retarget = (fbx: THREE.Object3D & { animations: THREE.AnimationClip[] }, name: string, glbRoot: THREE.Object3D) => {
  const src: Record<string, THREE.Object3D> = {}, dst: Record<string, THREE.Object3D> = {};
  fbx.traverse((o: any) => { if (o.isBone) src[o.name] = o; });
  glbRoot.traverse((o: any) => { if (o.isBone) dst[o.name] = o; });
  fbx.updateMatrixWorld(true); glbRoot.updateMatrixWorld(true);
  const names = Object.keys(dst).filter((n) => src[n]); // parent-first
  const wq = (o: THREE.Object3D) => o.getWorldQuaternion(new THREE.Quaternion());
  const srcRootInv = wq(src.mixamorigHips.parent!).invert(), dstRootInv = wq(dst.mixamorigHips.parent!).invert();
  const srcRestInv: Record<string, THREE.Quaternion> = {}, dstRest: Record<string, THREE.Quaternion> = {};
  for (const n of names) { srcRestInv[n] = srcRootInv.clone().multiply(wq(src[n])).invert(); dstRest[n] = dstRootInv.clone().multiply(wq(dst[n])); }
  const clip = fbx.animations[0];
  const mixer = new THREE.AnimationMixer(fbx);
  mixer.clipAction(clip).play();
  const N = Math.max(2, Math.round(clip.duration * 30) + 1);
  const times = new Float32Array(N), quats: Record<string, Float32Array> = {}, hips = new Float32Array(N * 3);
  for (const n of names) quats[n] = new Float32Array(N * 4);
  const rest = dst.mixamorigHips.position;
  const G: Record<string, THREE.Quaternion> = {};
  for (let i = 0; i < N; i++) {
    times[i] = Math.min(i / 30, clip.duration);
    mixer.setTime(times[i]);
    fbx.updateMatrixWorld(true);
    for (const n of names) {
      G[n] = srcRootInv.clone().multiply(wq(src[n])).multiply(srcRestInv[n]).multiply(dstRest[n]);
      const par = dst[n].parent!;
      const local = G[par.name] ? G[par.name].clone().invert().multiply(G[n]) : G[n].clone();
      local.toArray(quats[n], i * 4);
    }
    // keep the hips' height, drop root travel: the scene decides where the character stands
    hips.set([rest.x, src.mixamorigHips.position.y, rest.z], i * 3);
  }
  const tracks: THREE.KeyframeTrack[] = names.map((n) => new THREE.QuaternionKeyframeTrack(`${n}.quaternion`, times as any, quats[n] as any));
  tracks.push(new THREE.VectorKeyframeTrack("mixamorigHips.position", times as any, hips as any));
  return new THREE.AnimationClip(name, clip.duration, tracks);
};

const canvasTex = (w: number, h: number, draw: (g: CanvasRenderingContext2D) => void) => {
  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  draw(c.getContext("2d")!);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
};

// ---------- characters: the series' own low-poly designs, mounted on the Mixamo skeleton ----------
// Only the Mixamo rig is kept (the X Bot mesh is hidden). Every body part is a rigid piece attached to its bone,
// so any Mixamo clip (GLB or "Without Skin" FBX) drives Om Hamada and Ibrahim directly.
type Layer = { clip: string; w: number; time: number; hold?: boolean };
type Tweak = { bone: string; axis: [number, number, number]; angle: number };
const X = new THREE.Vector3(), Q = new THREE.Quaternion(), QP = new THREE.Quaternion(), QB = new THREE.Quaternion();
const UP = new THREE.Vector3(0, 1, 0);

const smooth = (color: string | number, o: any = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.78, ...o });
const tex2d = (w: number, h: number, draw: (g: CanvasRenderingContext2D) => void, rep?: [number, number]) => {
  const t = canvasTex(w, h, draw);
  t.anisotropy = 4;
  if (rep) t.repeat.set(...rep);
  return t;
};
// cloth: base colour, an optional pattern, then soft vertical folds
const cloth = (base: string, pattern?: (g: CanvasRenderingContext2D, r: () => number) => void, rep: [number, number] = [2, 1], seed = 3) =>
  tex2d(256, 256, (g) => {
    const r = rng(seed);
    g.fillStyle = base; g.fillRect(0, 0, 256, 256);
    pattern?.(g, r);
    for (let i = 0; i < 26; i++) {
      const x = r() * 256, w = 3 + r() * 9;
      g.fillStyle = r() < 0.55 ? `rgba(0,0,0,${0.04 + r() * 0.07})` : `rgba(255,255,255,${0.03 + r() * 0.06})`;
      g.beginPath(); g.ellipse(x, 128, w, 150, (r() - 0.5) * 0.12, 0, 7); g.fill();
    }
  }, rep);
const M3 = (geo: THREE.BufferGeometry, m: THREE.Material, x = 0, y = 0, z = 0, parent?: THREE.Object3D) => {
  const o = new THREE.Mesh(geo, m);
  o.position.set(x, y, z); o.castShadow = true; o.receiveShadow = true;
  parent?.add(o);
  return o;
};

// ---- painted head texture (wraps the skull; the face sits at u = 0.25) ----
type HeadLook = { skin: string; hair?: string; stache?: boolean; lips?: string; brow: string; stubble?: boolean; blush?: boolean };
const drawHead = (g: CanvasRenderingContext2D, c: HeadLook, eyes: string, mouth: string) => {
  const CX = 128;
  g.fillStyle = c.skin; g.fillRect(0, 0, 512, 256);
  // soft modelling: lit forehead/cheeks, darker jaw and temples
  let gr = g.createRadialGradient(CX, 112, 8, CX, 120, 110);
  gr.addColorStop(0, "rgba(255,225,190,0.22)"); gr.addColorStop(1, "rgba(60,25,10,0.20)");
  g.fillStyle = gr; g.fillRect(0, 0, 512, 256);
  gr = g.createLinearGradient(0, 150, 0, 256); gr.addColorStop(0, "rgba(50,20,8,0)"); gr.addColorStop(1, "rgba(50,20,8,0.45)");
  g.fillStyle = gr; g.fillRect(0, 150, 512, 106);
  if (c.hair) { // balding: hair on the sides and back only, ragged edge
    const r = rng(11);
    g.fillStyle = c.hair;
    for (let x = CX + 74; x < 512 + CX - 74; x += 4) {
      const top = 78 + r() * 10 + (Math.abs(x - 320) < 150 ? -6 : 8), bot = 176 + r() * 8;
      g.fillRect(x % 512, top, 5, bot - top);
    }
  }
  if (c.blush) for (const s of [-1, 1]) { g.fillStyle = "rgba(225,90,90,0.28)"; g.beginPath(); g.ellipse(CX + s * 40, 140, 15, 10, 0, 0, 7); g.fill(); }
  if (c.stubble) { g.fillStyle = "rgba(30,20,15,0.20)"; g.beginPath(); g.ellipse(CX, 176, 52, 30, 0, 0, 7); g.fill(); }
  // features are drawn larger than life so they read on a phone
  g.translate(CX, 132); g.scale(1.4, 1.4); g.translate(-CX, -132);
  const open = ({ neutral: 1, wide: 1.55, angry: 0.78, smug: 0.5, closed: 0, happy: 0 } as any)[eyes] ?? 1;
  const tilt = ({ angry: 7, wide: -3, smug: 1, happy: -2 } as any)[eyes] ?? 0;
  for (const s of [-1, 1]) {
    const ex = CX + s * 27, ey = 116;
    g.fillStyle = "rgba(60,25,15,0.22)"; g.beginPath(); g.ellipse(ex, ey + 1, 15, 11, 0, 0, 7); g.fill(); // socket
    if (open > 0) {
      g.save(); g.beginPath(); g.ellipse(ex, ey, 11.5, 6.6 * open, 0, 0, 7); g.clip();
      g.fillStyle = "#f4efe6"; g.fillRect(ex - 14, ey - 14, 28, 28);
      const py = eyes === "smug" ? ey + 1.5 : ey;
      g.fillStyle = "#4a2c14"; g.beginPath(); g.arc(ex, py, 5.6, 0, 7); g.fill();
      g.fillStyle = "#0c0705"; g.beginPath(); g.arc(ex, py, eyes === "wide" ? 1.9 : 2.6, 0, 7); g.fill();
      g.fillStyle = "#fff"; g.beginPath(); g.arc(ex + 2, py - 2, 1.2, 0, 7); g.fill();
      g.restore();
      g.strokeStyle = "#1c0f08"; g.lineWidth = 2.6; g.beginPath(); g.ellipse(ex, ey, 11.5, 6.6 * open, 0, Math.PI, Math.PI * 2); g.stroke();
      g.strokeStyle = "rgba(60,25,12,0.5)"; g.lineWidth = 1.2; g.beginPath(); g.ellipse(ex, ey, 11.5, 6.6 * open, 0, 0, Math.PI); g.stroke();
    } else {
      g.strokeStyle = "#1c0f08"; g.lineWidth = 3; g.beginPath();
      if (eyes === "happy") g.arc(ex, ey + 5, 10, Math.PI * 1.15, Math.PI * 1.85); else { g.moveTo(ex - 11, ey + 1); g.quadraticCurveTo(ex, ey + 5, ex + 11, ey + 1); }
      g.stroke();
    }
    const by = ey - 15 - (eyes === "wide" ? 6 : 0);
    g.strokeStyle = c.brow; g.lineWidth = 6.5; g.lineCap = "round"; g.beginPath();
    g.moveTo(ex - s * 13, by + tilt); g.quadraticCurveTo(ex, by - 4 - tilt * 0.2, ex + s * 14, by - tilt * 0.4 + 2); g.stroke();
  }
  g.fillStyle = "rgba(50,20,10,0.5)"; for (const s of [-1, 1]) { g.beginPath(); g.ellipse(CX + s * 5.5, 144, 3, 2, 0, 0, 7); g.fill(); }
  const my = c.stache ? 167 : 162;
  const teeth = (w: number, y: number, h: number) => { g.fillStyle = "#f3eee2"; g.fillRect(CX - w, y, w * 2, h); g.strokeStyle = "rgba(0,0,0,0.25)"; g.lineWidth = 1; for (let x = -w + 6; x < w; x += 6) { g.beginPath(); g.moveTo(CX + x, y); g.lineTo(CX + x, y + h); g.stroke(); } };
  const cavity = (rx: number, ry: number) => { g.fillStyle = "#3a0c0c"; g.beginPath(); g.ellipse(CX, my, rx, ry, 0, 0, 7); g.fill(); g.save(); g.clip(); teeth(rx, my - ry, Math.min(5, ry * 0.5)); if (ry > 9) { g.fillStyle = "#c2475a"; g.beginPath(); g.ellipse(CX, my + ry * 0.7, rx * 0.6, ry * 0.5, 0, 0, 7); g.fill(); } g.restore(); g.strokeStyle = c.lips || "rgba(90,35,25,0.8)"; g.lineWidth = c.lips ? 3 : 2; g.beginPath(); g.ellipse(CX, my, rx, ry, 0, 0, 7); g.stroke(); };
  if (mouth === "small") cavity(9, 4.5);
  else if (mouth === "open") cavity(12, 9);
  else if (mouth === "scream") cavity(15, 16);
  else if (mouth === "grin") { g.save(); g.beginPath(); g.moveTo(CX - 19, my - 5); g.quadraticCurveTo(CX, my + 15, CX + 19, my - 5); g.closePath(); g.clip(); teeth(20, my - 6, 16); g.restore(); g.strokeStyle = c.lips || "rgba(90,35,25,0.9)"; g.lineWidth = 2.5; g.beginPath(); g.moveTo(CX - 19, my - 5); g.quadraticCurveTo(CX, my + 15, CX + 19, my - 5); g.closePath(); g.stroke(); }
  else { g.strokeStyle = c.lips || "rgba(80,30,20,0.85)"; g.lineWidth = c.lips ? 4 : 3; g.beginPath(); g.moveTo(CX - 13, my); g.quadraticCurveTo(CX, my + (eyes === "smug" ? 4 : 1), CX + 13, my - (eyes === "smug" ? 2 : 0)); g.stroke(); }
  if (c.stache) { g.fillStyle = "#120b07"; g.beginPath(); g.moveTo(CX, 147); g.bezierCurveTo(CX + 22, 143, CX + 34, 152, CX + 36, 166); g.bezierCurveTo(CX + 24, 157, CX + 10, 158, CX, 156); g.bezierCurveTo(CX - 10, 158, CX - 24, 157, CX - 36, 166); g.bezierCurveTo(CX - 34, 152, CX - 22, 143, CX, 147); g.fill(); }
};

type CharCfg = {
  look: HeadLook; skin: string; headScale: number;
  chest: number; waist: number; hip: number; depth: number; belly?: number; bust?: number;
  arm: [number, number, number]; topMat: THREE.Material; sleeveMat?: THREE.Material; gloveMat?: THREE.Material;
  legMat?: THREE.Material; skirt?: number; shoe: THREE.Material; build?: (head: THREE.Group, hw: number, hh: number, hd: number) => any;
};
const buildChar = (assets: Assets, cfg: CharCfg) => {
  const root = skeletonClone(assets.xbot.scene) as THREE.Object3D;
  const bones: Record<string, THREE.Object3D> = {};
  root.traverse((o: any) => {
    if (o.isBone) bones[o.name.replace("mixamorig", "")] = o;
    if (o.isMesh) o.visible = false;
  });
  root.updateMatrixWorld(true);
  const wp = (n: string) => bones[n].getWorldPosition(new THREE.Vector3());
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  const bind = (bone: string, o: THREE.Object3D) => { o.updateMatrixWorld(true); bones[bone].attach(o); return o; };
  // tapered, slightly flattened tube from p0 to p1 (the era's rigid body segment)
  const tube = (bone: string, p0: THREE.Vector3, p1: THREE.Vector3, r0: number, r1: number, m: THREE.Material, depth = 1, seg = 12) => {
    const d = p1.clone().sub(p0), len = d.length();
    const o = M3(new THREE.CylinderGeometry(r1, r0, len, seg, 1), m);
    o.position.copy(p0).addScaledVector(d, 0.5);
    o.quaternion.setFromUnitVectors(UP, d.normalize());
    o.scale.z = depth;
    return bind(bone, o);
  };
  const ball = (bone: string, p: THREE.Vector3, r: number, m: THREE.Material, sc: [number, number, number] = [1, 1, 1]) => {
    const o = M3(new THREE.SphereGeometry(r, 16, 12), m, p.x, p.y, p.z); o.scale.set(...sc); return bind(bone, o);
  };
  const slab = (bone: string, p0: THREE.Vector3, p1: THREE.Vector3, thick: number, width: number, m: THREE.Material, grow = 0) => {
    const d = p1.clone().sub(p0), len = d.length() + grow;
    const o = M3(new THREE.BoxGeometry(thick, len, width), m);
    o.position.copy(p0).addScaledVector(d.normalize(), len / 2);
    o.quaternion.setFromUnitVectors(UP, d);
    return bind(bone, o);
  };
  const skin = smooth(cfg.skin, { roughness: 0.62 });
  const hips = wp("Hips"), sp1 = wp("Spine1"), sp2 = wp("Spine2"), neck = wp("Neck"), D = cfg.depth;
  // torso: one smooth lathe (rigid, like the era's characters); a dress runs down to the ankles in the same piece
  const lathe = (bone: string, pts: [number, number][], m: THREE.Material) => {
    const o = M3(new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), 22), m, hips.x, 0, hips.z);
    o.scale.z = D;
    return bind(bone, o);
  };
  const hy = hips.y, ny = neck.y, cy = sp2.y + 0.07;
  if (cfg.skirt) {
    lathe("Hips", [[cfg.skirt * 0.98, 0.1], [cfg.skirt, 0.14], [cfg.hip * 1.08, hy - 0.1], [cfg.hip, hy + 0.02], [cfg.waist, hy + 0.14], [cfg.chest * 1.08, cy - 0.04],
      [cfg.chest * 1.05, cy + 0.03], [cfg.chest * 0.86, ny - 0.07], [cfg.chest * 0.55, ny - 0.03], [0.062, ny]], cfg.topMat);
  } else {
    tube("Hips", V(hips.x, hy - 0.15, hips.z), V(hips.x, hy + 0.06, hips.z), cfg.hip * 0.9, cfg.hip * 1.03, cfg.legMat!, D);
    lathe("Spine1", [[cfg.hip * 1.08, hy - 0.02], [cfg.hip * 1.08 + (cfg.belly || 0) * 0.2, hy + 0.09], [cfg.waist, hy + 0.2], [cfg.chest, cy - 0.03],
      [cfg.chest * 1.02, cy + 0.03], [cfg.chest * 0.84, ny - 0.07], [cfg.chest * 0.5, ny - 0.03], [0.06, ny]], cfg.topMat);
  }
  tube("Neck", V(neck.x, neck.y - 0.03, neck.z), wp("Head").add(V(0, 0.03, 0)), 0.05, 0.046, skin);
  for (const S of ["Left", "Right"]) {
    const [ru, re, rw] = cfg.arm, up = cfg.sleeveMat || skin;
    const a = wp(S + "Arm"), e = wp(S + "ForeArm"), h = wp(S + "Hand");
    ball(S + "Arm", a, ru * 1.12, cfg.sleeveMat || skin);
    tube(S + "Arm", a, e, ru, re, up, 1, 10);
    ball(S + "ForeArm", e, re * 1.04, up);
    tube(S + "ForeArm", e, h, re, rw, skin, 1, 10);
    const hm = cfg.gloveMat || skin;
    if (cfg.gloveMat) tube(S + "ForeArm", e.clone().lerp(h, 0.45), h, re * 1.02, rw * 1.25, hm, 1, 10);
    const m1 = bones[S + "HandMiddle1"] ? wp(S + "HandMiddle1") : h.clone().add(h.clone().sub(e).setLength(0.09));
    const m4 = bones[S + "HandMiddle4"] ? wp(S + "HandMiddle4") : m1.clone().add(h.clone().sub(e).setLength(0.08));
    slab(S + "Hand", h, m1, 0.03, 0.082, hm, 0.01);
    slab(bones[S + "HandMiddle1"] ? S + "HandMiddle1" : S + "Hand", m1, m4, 0.022, 0.076, hm);
    if (bones[S + "HandThumb1"] && bones[S + "HandThumb4"]) slab(S + "HandThumb1", wp(S + "HandThumb1"), wp(S + "HandThumb4"), 0.024, 0.026, hm);
    const u = wp(S + "UpLeg"), k = wp(S + "Leg"), f = wp(S + "Foot"), toe = wp(S + "ToeBase");
    if (cfg.legMat) {
      ball(S + "UpLeg", u, 0.096, cfg.legMat);
      tube(S + "UpLeg", u, k, 0.096, 0.074, cfg.legMat, 1, 10);
      ball(S + "Leg", k, 0.073, cfg.legMat);
      tube(S + "Leg", k, f.clone().add(V(0, 0.03, 0)), 0.071, 0.062, cfg.legMat, 1, 10);
      tube(S + "Foot", f.clone().add(V(0, 0.05, 0)), f.clone().add(V(0, -0.02, 0)), 0.036, 0.034, skin, 1, 8);
    }
    slab(S + "Foot", V(f.x, 0.035, f.z - 0.05), V(toe.x, 0.035, toe.z), 0.07, 0.095, cfg.shoe);
    slab(S + "ToeBase", V(toe.x, 0.03, toe.z), V(toe.x, 0.03, toe.z + 0.085), 0.055, 0.095, cfg.shoe);
  }
  // head: painted skull, chin, nose, ears
  const hb = wp("Head"), top = bones.HeadTop_End ? wp("HeadTop_End") : hb.clone().add(V(0, 0.2, 0));
  const hh = (top.y - hb.y) * 0.56 * cfg.headScale, hw = hh * 0.84, hd = hh * 0.92;
  const head = new THREE.Group();
  head.position.set(hb.x, hb.y + hh * 0.92, hb.z + 0.012);
  const headMat = new THREE.MeshStandardMaterial({ roughness: 0.6 });
  const skull = M3(new THREE.SphereGeometry(1, 28, 20), headMat, 0, 0, 0, head); skull.scale.set(hw, hh, hd);
  const nose = M3(new THREE.ConeGeometry(hw * 0.2, hh * 0.42, 5), skin, 0, hh * -0.1, hd * 0.99, head); nose.rotation.x = 1.25;
  for (const s of [-1, 1]) M3(new THREE.SphereGeometry(1, 8, 6), skin, s * hw * 0.99, hh * 0.02, -hd * 0.08, head).scale.set(hw * 0.13, hh * 0.22, hd * 0.16);
  const extras = cfg.build ? cfg.build(head, hw, hh, hd) : {};
  bind("Head", head);
  const faces = new Map<string, THREE.Texture>();
  const setFace = (eyes: string, mouth: string) => {
    const k = eyes + "|" + mouth;
    if (!faces.has(k)) faces.set(k, tex2d(512, 256, (g) => drawHead(g, cfg.look, eyes, mouth)));
    headMat.map = faces.get(k)!;
  };
  setFace("neutral", "closed");
  const mixer = new THREE.AnimationMixer(root);
  const actions: Record<string, THREE.AnimationAction> = {};
  for (const c of assets.clips) { actions[c.name] = mixer.clipAction(c); actions[c.name].play(); actions[c.name].setEffectiveWeight(0); }
  return { root, bones, mixer, actions, setFace, extras };
};
type Rig = ReturnType<typeof buildChar>;

const pose = (rig: Rig, layers: Layer[], tweaks: Tweak[]) => {
  for (const k of Object.keys(rig.actions)) rig.actions[k].setEffectiveWeight(0);
  for (const l of layers) {
    const a = rig.actions[l.clip];
    a.setEffectiveWeight(l.w);
    const d = a.getClip().duration;
    a.time = l.hold ? clamp(l.time, 0, d - 0.04) : ((l.time % d) + d) % d;
  }
  rig.mixer.update(0);
  // world-space additive tweaks, expressed in character space (x = character's left, y = up, z = forward)
  for (const tw of tweaks) {
    const bone = rig.bones[tw.bone];
    if (!bone || !tw.angle) continue;
    rig.root.updateMatrixWorld(true);
    rig.root.getWorldQuaternion(Q);
    X.set(...tw.axis).normalize().applyQuaternion(Q);
    bone.getWorldQuaternion(QB);
    bone.parent!.getWorldQuaternion(QP);
    Q.setFromAxisAngle(X, tw.angle).multiply(QB);
    bone.quaternion.copy(QP.invert().multiply(Q));
  }
};
const mouthOf = (talk: number, loud = false) => (talk > 0.55 ? (loud ? "scream" : "open") : talk > 0.28 ? "open" : talk > 0.1 ? "small" : "closed");

const OmHamada: React.FC<{ t: number; assets: Assets }> = ({ t, assets }) => {
  const rig = useMemo(() => {
    const dress = smooth(0xffffff, { map: cloth("#e9799f", (g, r) => {
      for (let i = 0; i < 46; i++) {
        const x = r() * 256, y = r() * 256, q = 5 + r() * 3;
        g.fillStyle = "#fff0a8"; for (let p = 0; p < 5; p++) { g.beginPath(); g.arc(x + Math.cos(p * 1.257) * q, y + Math.sin(p * 1.257) * q, q * 0.62, 0, 7); g.fill(); }
        g.fillStyle = "#b8245c"; g.beginPath(); g.arc(x, y, q * 0.5, 0, 7); g.fill();
        g.fillStyle = "#3f9a55"; g.beginPath(); g.ellipse(x + q * 1.7, y + q * 1.2, q * 0.7, q * 0.3, 0.6, 0, 7); g.fill();
      }
    }, [4, 7], 4), roughness: 0.9 });
    const scarf = smooth(0xffffff, { map: cloth("#1a8f55", undefined, [2, 1], 8), roughness: 0.85, side: THREE.DoubleSide });
    return buildChar(assets, {
      look: { skin: "#c98d5f", brow: "#24120a", lips: "#9c3a52", blush: true }, skin: "#c98d5f", headScale: 1.7,
      chest: 0.2, waist: 0.21, hip: 0.225, depth: 0.84, bust: 0.085, skirt: 0.3,
      arm: [0.066, 0.052, 0.036], topMat: dress, sleeveMat: dress, gloveMat: smooth("#ffd21f", { roughness: 0.32 }), shoe: smooth("#2b62d9", { roughness: 0.4 }),
      build(head, hw, hh, hd) {
        const cap = M3(new THREE.SphereGeometry(1, 24, 14, 0, Math.PI * 2, 0, Math.PI * 0.56), scarf, 0, hh * 0.1, -hd * 0.16, head);
        cap.scale.set(hw * 1.14, hh * 1.1, hd * 1.14); cap.rotation.x = -0.72;
        M3(new THREE.CylinderGeometry(hw * 0.95, hw * 0.8, hh * 0.9, 14, 1, true, Math.PI * 0.72, Math.PI * 1.56), scarf, 0, -hh * 0.5, -hd * 0.12, head);
        M3(new THREE.SphereGeometry(hw * 0.36, 10, 8), scarf, 0, -hh * 0.3, -hd * 1.12, head);
        return {};
      },
    });
  }, [assets]);
  const talk = envAt("om", t, OM_START);
  const turn = easeBack(seg(t, 0.45, 0.8));
  const shout = easeOut(seg(t, 0.75, 0.95)) * (1 - easeInOut(seg(t, 1.9, 2.3)));
  const point = easeOut(seg(t, 2.15, 2.45)) * (1 - seg(t, 3.85, 4.1));
  const after = t >= CUT3;
  const jit = Math.sin(t * 36) * 0.07 * (0.3 + talk);
  useLayoutEffect(() => {
    if (after) {
      rig.setFace("smug", "closed");
      pose(rig, [{ clip: "facepalm", w: 1, time: t - CUT3 + 0.6, hold: true }], []);
    } else {
      rig.setFace(t < 0.6 ? "neutral" : shout > 0.3 ? "wide" : "angry", t < 0.6 ? "closed" : mouthOf(talk, true));
      const y = seg(t, 0.55, 0.85), ap = easeInOut(seg(t, 2.1, 2.5));
      pose(rig, [
        { clip: "idle", w: 1 - y, time: t },
        { clip: "yelling", w: y * (1 - ap), time: t - 0.55 },
        { clip: "angry_point", w: y * ap, time: t - 2.1 },
      ], [{ bone: "Head", axis: [1, 0, 0], angle: talk * 0.1 }]);
    }
  });
  return (
    <group position={[-0.6, 0, -1.0]} rotation={[0, after ? 0.5 : lerp(Math.PI * 0.86, 0.42, turn), 0]} scale={[1, 0.9, 1]}>
      <primitive object={rig.root} />
    </group>
  );
};

const Ibrahim: React.FC<{ t: number; assets: Assets }> = ({ t, assets }) => {
  const rig = useMemo(() => {
    const pajama = smooth(0xffffff, { map: cloth("#8493ad", (g) => { for (let x = 0; x < 256; x += 32) { g.fillStyle = "#3b4c6c"; g.fillRect(x + 4, 0, 9, 256); g.fillStyle = "#c9d2e2"; g.fillRect(x + 20, 0, 2, 256); } }, [2, 1], 6), roughness: 0.88 });
    const vest = smooth(0xffffff, { map: cloth("#f1eee3", (g) => { g.fillStyle = "rgba(120,110,90,0.07)"; for (let x = 0; x < 256; x += 5) g.fillRect(x, 0, 1.5, 256); }, [3, 1], 9), roughness: 0.85 });
    return buildChar(assets, {
      look: { skin: "#b27448", brow: "#150c07", hair: "#1b1410", stache: true, stubble: true }, skin: "#b27448", headScale: 1.6,
      chest: 0.17, waist: 0.15, hip: 0.155, depth: 0.74, belly: 0.07,
      arm: [0.053, 0.044, 0.035], topMat: vest, legMat: pajama, shoe: smooth("#5a3a20", { roughness: 0.5 }),
      build(head, hw, hh, hd) {
        const gog = new THREE.Group(); head.add(gog);
        const brass = smooth(0xc9a227, { metalness: 1, roughness: 0.25, side: THREE.DoubleSide }), lens = smooth(0x1d3a2c, { metalness: 0.8, roughness: 0.08 });
        for (const s of [-1, 1]) {
          const rim = M3(new THREE.CylinderGeometry(hw * 0.4, hw * 0.4, hw * 0.3, 14, 1, true), brass, s * hw * 0.42, 0, 0, gog); rim.rotation.x = Math.PI / 2;
          M3(new THREE.CircleGeometry(hw * 0.39, 14), lens, s * hw * 0.42, 0, hw * 0.1, gog);
        }
        const strap = M3(new THREE.TorusGeometry(hw * 1.0, hw * 0.07, 6, 24), smooth(0x3a2a1a), 0, 0, -hd * 0.95, gog); strap.rotation.x = Math.PI / 2; strap.scale.set(1, hd / hw, 1);
        return { gog, hw, hh, hd };
      },
    });
  }, [assets]);
  const talk = envAt("ib", t, IB_START);
  const walkK = seg(t, CUT2, 5.0);
  const stop = easeInOut(seg(t, 4.85, 5.2));
  const calm = seg(t, 4.5, 4.75) * (1 - seg(t, 5.7, 6.0));
  const hero = easeBack(seg(t, 6.0, 6.35));
  const gog = easeInOut(seg(t, 7.2, 7.5));
  const after = t >= CUT3;
  const pat = Math.sin(t * 11) * 0.14 * calm;
  useLayoutEffect(() => {
    const { gog: g, hh, hd } = rig.extras;
    g.position.set(0, lerp(hh * 0.62, hh * 0.13, gog), lerp(hd * 0.72, hd * 0.97, gog));
    g.rotation.x = lerp(-0.75, 0, gog);
    if (after) {
      rig.setFace("happy", "grin");
      pose(rig, [{ clip: "silly_dance", w: 1, time: t - CUT3 + 1.0 }], []);
    } else {
      const br = easeInOut(seg(t, 5.9, 6.3));
      rig.setFace(br > 0.5 ? "wide" : "smug", br > 0.5 && talk < 0.1 ? "grin" : mouthOf(talk));
      pose(rig, [
        { clip: "walk", w: 1 - stop, time: t - CUT2 },
        { clip: "talking", w: stop * (1 - br), time: t - 4.85 },
        { clip: "bragging", w: stop * br, time: t - 5.9, hold: true },
      ], [{ bone: "Head", axis: [1, 0, 0], angle: talk * 0.08 }]);
    }
  });
  const pos: [number, number, number] = after ? [0.85, 0, -0.55] : [lerp(1.95, 1.4, easeOut(walkK)), 0, -0.35];
  return (
    <group position={pos} rotation={[0, after ? -0.25 : -1.05, 0]} scale={0.98}>
      <primitive object={rig.root} />
    </group>
  );
};

// ---------- set ----------
const Kitchen: React.FC<{ t: number; assets: Assets }> = ({ t, assets }) => {
  const { tex } = assets;
  const dishes = useMemo(() => {
    const r = rng(7);
    const out: { p: [number, number, number]; rot: [number, number, number]; kind: number; s: number }[] = [];
    let y = 0.93;
    for (let i = 0; i < 30; i++) {
      const kind = r() < 0.62 ? 0 : r() < 0.6 ? 1 : 2;
      const s = 0.8 + r() * 0.5;
      const h = kind === 0 ? 0.022 : kind === 1 ? 0.1 * s : 0.07;
      out.push({ p: [-1.2 + (r() - 0.5) * 0.12 + i * 0.004, y + h / 2, -1.62 + (r() - 0.5) * 0.1], rot: [(r() - 0.5) * 0.22, r() * 6, (r() - 0.5) * 0.22], kind, s });
      y += h * 0.92;
    }
    return out;
  }, []);
  const sign = useMemo(() => canvasTex(256, 128, (g) => {
    g.fillStyle = "#b98a55"; g.fillRect(0, 0, 256, 128);
    g.fillStyle = "#a57845"; for (let y = 6; y < 128; y += 10) g.fillRect(0, y, 256, 2);
    g.fillStyle = "#c21d1d"; g.font = "bold 104px Lalezar"; g.textAlign = "center"; g.textBaseline = "middle";
    g.save(); g.translate(128, 70); g.rotate(-0.06); g.fillText("3000", 0, 0); g.restore();
  }), []);
  const tile = <meshStandardMaterial {...tex.long_white_tiles} color="#8ff0e6" roughness={0.35} />;
  const wood = <meshStandardMaterial {...tex.oak_wood_planks} roughness={0.7} />;
  const steel = <meshStandardMaterial color="#c9ccd0" metalness={1} roughness={0.22} />;
  const run = t >= CUT3 ? 1 : 0;
  const vib = run * Math.sin(t * 90) * 0.004;
  const glow = 1.5 + run * (2.5 + 2.5 * Math.sin(t * 14));
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[4.2, 4.2]} />
        <meshStandardMaterial {...tex.floor_tiles_06} roughness={0.4} />
      </mesh>
      <mesh position={[0, 1.35, -2]} receiveShadow><planeGeometry args={[4.2, 2.7]} />{tile}</mesh>
      <mesh position={[-2, 1.35, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow><planeGeometry args={[4.2, 2.7]} />{tile}</mesh>
      <mesh position={[2, 1.35, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow><planeGeometry args={[4.2, 2.7]} />{tile}</mesh>
      <mesh position={[0, 2.7, 0]} rotation={[Math.PI / 2, 0, 0]}><planeGeometry args={[4.2, 4.2]} /><meshStandardMaterial color="#d9d3c2" roughness={0.9} /></mesh>
      {/* fluorescent tube */}
      <mesh position={[0, 2.66, -0.6]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.025, 0.025, 1.2, 10]} />
        <meshStandardMaterial color="#eaffea" emissive="#d8ffd0" emissiveIntensity={3} />
      </mesh>
      {/* window (left wall) */}
      <mesh position={[-1.985, 1.6, -0.5]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[0.95, 1.05]} />
        <meshStandardMaterial color="#fff" emissive="#ffe2b0" emissiveIntensity={3.2} />
      </mesh>
      {[[-0.5, 1.6, 0.06, 1.15], [-0.5, 1.6, 1.05, 0.06]].map(([z, y, w, h], i) => (
        <mesh key={i} position={[-1.97, y, z]} rotation={[0, Math.PI / 2, 0]}><boxGeometry args={[w, h, 0.04]} /><meshStandardMaterial color="#5b3a1d" roughness={0.6} /></mesh>
      ))}
      {/* doorway (right wall) */}
      <mesh position={[1.985, 1.05, -0.35]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[0.95, 2.1]} />
        <meshStandardMaterial color="#fff" emissive="#fff0d0" emissiveIntensity={1.5} />
      </mesh>
      {[[-0.86, 1.05, 0.08, 2.18], [0.16, 1.05, 0.08, 2.18], [-0.35, 2.14, 1.1, 0.08]].map(([z, y, w, h], i) => (
        <mesh key={i} position={[1.96, y, z]} rotation={[0, -Math.PI / 2, 0]} castShadow><boxGeometry args={[w, h, 0.08]} /><meshStandardMaterial color="#5b3a1d" roughness={0.55} /></mesh>
      ))}
      {/* counter + sink */}
      <mesh position={[-0.65, 0.45, -1.68]} castShadow receiveShadow><boxGeometry args={[2.6, 0.86, 0.62]} /><meshStandardMaterial color="#e9e2cf" roughness={0.6} /></mesh>
      <mesh position={[-0.65, 0.9, -1.68]} castShadow receiveShadow><boxGeometry args={[2.66, 0.05, 0.66]} />{wood}</mesh>
      <mesh position={[-1.2, 0.925, -1.66]} receiveShadow><boxGeometry args={[0.6, 0.03, 0.46]} />{steel}</mesh>
      <mesh position={[-1.2, 1.1, -1.9]} castShadow><cylinderGeometry args={[0.018, 0.018, 0.36, 8]} />{steel}</mesh>
      {dishes.map((d, i) => (
        <mesh key={i} position={d.p} rotation={d.rot} castShadow receiveShadow>
          {d.kind === 0 ? <cylinderGeometry args={[0.13 * d.s, 0.08 * d.s, 0.022, 20]} /> : d.kind === 1 ? <cylinderGeometry args={[0.11 * d.s, 0.1 * d.s, 0.1 * d.s, 18]} /> : <cylinderGeometry args={[0.035, 0.03, 0.07, 10]} />}
          {d.kind === 0 ? <meshStandardMaterial color={i % 3 ? "#f3efe6" : "#9fc4e8"} roughness={0.18} /> : d.kind === 1 ? steel : <meshStandardMaterial color="#c26a2a" roughness={0.1} transparent opacity={0.8} />}
        </mesh>
      ))}
      {/* fridge */}
      <mesh position={[1.35, 0.85, -1.66]} castShadow receiveShadow><boxGeometry args={[0.66, 1.7, 0.62]} /><meshStandardMaterial color="#efe6c8" roughness={0.3} /></mesh>
      <mesh position={[1.1, 1.0, -1.34]}><boxGeometry args={[0.03, 0.34, 0.03]} />{steel}</mesh>
      {/* JET DISHWASHER 3000 */}
      <group position={[0.15 + vib, 0.925, -1.66]}>
        <mesh position={[0, 0.1, 0]} castShadow receiveShadow><boxGeometry args={[0.46, 0.2, 0.34]} />{wood}</mesh>
        <mesh position={[0, 0.32 + vib, 0]} castShadow><boxGeometry args={[0.26, 0.24, 0.22]} /><meshStandardMaterial color="#c0201c" metalness={0.5} roughness={0.35} /></mesh>
        {[0, 1, 2, 3, 4].map((i) => (
          <mesh key={i} position={[0, 0.25 + i * 0.04 + vib, 0]} castShadow><boxGeometry args={[0.33, 0.012, 0.28]} /><meshStandardMaterial color="#8d1512" metalness={0.6} roughness={0.4} /></mesh>
        ))}
        <mesh position={[0, 0.5 + vib, 0]} castShadow><cylinderGeometry args={[0.07, 0.08, 0.12, 14]} />{steel}</mesh>
        <mesh position={[0.22, 0.38, -0.02]} rotation={[0, 0, -1.1]} castShadow><cylinderGeometry args={[0.028, 0.035, 0.34, 10]} /><meshStandardMaterial color="#6b3a1c" metalness={0.8} roughness={0.6} /></mesh>
        {[0, 1, 2].map((i) => (
          <mesh key={i} position={[-0.36, 0.045 + i * 0.07, 0.02]} rotation={[Math.PI / 2, 0, 0]} castShadow><torusGeometry args={[0.12 - i * 0.008, 0.036, 10, 24]} /><meshStandardMaterial color="#c8281f" roughness={0.75} /></mesh>
        ))}
        <mesh position={[-0.36, 0.3, 0.02]} castShadow><coneGeometry args={[0.045, 0.14, 12]} /><meshStandardMaterial color="#d3a442" metalness={1} roughness={0.2} /></mesh>
        <mesh position={[0, 0.72, 0.0]} rotation={[0, 0, 0.05]} castShadow><boxGeometry args={[0.34, 0.17, 0.012]} /><meshStandardMaterial map={sign} roughness={0.9} /></mesh>
        <mesh position={[0, 0.6, 0]}><cylinderGeometry args={[0.008, 0.008, 0.12, 6]} />{wood}</mesh>
        <mesh position={[0.14, 0.03, 0.22]} castShadow><boxGeometry args={[0.13, 0.06, 0.1]} /><meshStandardMaterial color="#e3c12a" metalness={0.7} roughness={0.35} /></mesh>
        <mesh position={[0.14, 0.075, 0.22]}><cylinderGeometry args={[0.04, 0.04, 0.035, 16]} /><meshStandardMaterial color="#ff2a1a" emissive="#ff2010" emissiveIntensity={glow} roughness={0.3} /></mesh>
        <pointLight position={[0.14, 0.2, 0.3]} color="#ff3020" intensity={run * 0.6} distance={1.5} />
      </group>
    </group>
  );
};

const Rig: React.FC<{ t: number }> = ({ t }) => {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  useLayoutEffect(() => {
    let p: number[], l: number[], fov: number;
    if (t < CUT2) {
      const k = easeInOut(seg(t, 0, CUT2));
      const snap = easeOut(seg(t, 0.75, 0.95));
      p = [lerp(0.75, 0.45, k), 1.35, lerp(2.6, 2.2, k) - snap * 0.5];
      l = [-0.62, lerp(0.95, 1.1, snap), -1.0];
      fov = 42;
      const sh = envAt("om", t, OM_START) * 0.012;
      p[0] += Math.sin(t * 53) * sh; p[1] += Math.cos(t * 47) * sh;
    } else if (t < CUT3) {
      const k = easeOut(seg(t, CUT2, CUT3));
      p = [lerp(0.1, 0.3, k), lerp(0.4, 0.5, k), lerp(1.25, 1.0, k)];
      l = [1.43, lerp(1.05, 1.15, k), -0.36];
      fov = 50;
    } else {
      const k = seg(t, CUT3, 10);
      const a = lerp(-0.35, 0.3, k);
      p = [0.35 + Math.sin(a) * 3.3, 1.45, -1.5 + Math.cos(a) * 3.3];
      l = [0.35, 1.0, -1.3];
      fov = 52;
    }
    camera.position.set(p[0], p[1], p[2]);
    camera.fov = fov;
    camera.lookAt(l[0], l[1], l[2]);
    camera.updateProjectionMatrix();
  }, [t, camera]);
  return null;
};

const World: React.FC<{ t: number; assets: Assets }> = ({ t, assets }) => {
  const scene = useThree((s) => s.scene);
  useLayoutEffect(() => {
    scene.environment = assets.hdri;
    scene.environmentIntensity = 0.95;
    scene.background = new THREE.Color("#120d0a");
  }, [scene, assets]);
  return (
    <>
      <Rig t={t} />
      <directionalLight position={[-4.5, 3.6, 1.2]} intensity={2.6} color="#ffd9a8" castShadow shadow-mapSize={[2048, 2048]} shadow-bias={-0.0004} shadow-normalBias={0.02}
        shadow-camera-left={-3} shadow-camera-right={3} shadow-camera-top={3} shadow-camera-bottom={-3} shadow-camera-near={0.5} shadow-camera-far={12} />
      <pointLight position={[1.75, 1.7, -0.35]} intensity={0.9} color="#ffe9c4" distance={5} decay={1.6} />
      <pointLight position={[0, 2.5, -0.6]} intensity={0.9} color="#d9ffd6" distance={6} decay={1.4} />
      <Kitchen t={t} assets={assets} />
      <OmHamada t={t} assets={assets} />
      {t >= CUT2 - 0.01 ? <Ibrahim t={t} assets={assets} /> : null}
      <EffectComposer multisampling={0}>
        <N8AO aoRadius={0.35} distanceFalloff={0.6} intensity={2.2} quality="medium" />
        <Bloom intensity={0.8} luminanceThreshold={0.7} luminanceSmoothing={0.25} mipmapBlur />
        <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
        <HueSaturation saturation={-0.24} />
        <Sepia intensity={0.16} />
        <BrightnessContrast brightness={-0.02} contrast={0.1} />
        <Vignette offset={0.28} darkness={0.6} />
        <Noise opacity={0.05} />
      </EffectComposer>
    </>
  );
};

// ---------- HUD ----------
const LINES = [
  { who: "أم حمادة", color: "#ff8fb4", start: OM_START, vox: [[0.29, 2.75]], end: 3.9, parts: ["إيه ده يا إبراهيم؟! موتور توك توك في المطبخ تاني؟!"] },
  { who: "إبراهيم", color: "#ffd21f", start: IB_START, vox: [[0.29, 1.33], [1.75, 3.5]], end: 7.95, parts: ["اهدي يا ولية..", "ده اختراع القرن!"] },
];
const Subtitle: React.FC<{ t: number }> = ({ t }) => {
  const line = LINES.find((l) => t >= l.start && t < l.end);
  if (!line) return null;
  const lt = t - line.start;
  const text = line.parts.map((p, i) => {
    const words = p.split(" ");
    const [a, b] = line.vox[i];
    return words.slice(0, Math.ceil(seg(lt, a, b - 0.25) * words.length)).join(" ");
  }).filter(Boolean).join(" ");
  if (!text) return null;
  return (
    <div style={{ position: "absolute", left: 70, right: 70, bottom: 330, textAlign: "center", direction: "rtl", fontFamily: "Lalezar" }}>
      <div style={{ display: "inline-block", background: line.color, color: "#1a1208", fontSize: 44, padding: "2px 26px", borderRadius: 10, marginBottom: 14 }}>{line.who}</div>
      <div style={{ color: "#fff", fontSize: 78, lineHeight: 1.25, textShadow: "0 5px 0 #000, 0 0 18px rgba(0,0,0,.9)", WebkitTextStroke: "3px #000", paintOrder: "stroke fill" }}>{text}</div>
    </div>
  );
};
const Toast: React.FC<{ t: number }> = ({ t }) => {
  const k = easeBack(seg(t, TOAST, TOAST + 0.3));
  if (t < TOAST) return null;
  return (
    <div style={{ position: "absolute", top: 210, right: 60, transform: `translateX(${(1 - k) * 800}px)`, display: "flex", alignItems: "center", gap: 26, direction: "rtl", fontFamily: "Lalezar",
      background: "linear-gradient(#6f6f73, #3d3d41)", border: "3px solid #b9b9bd", borderRadius: 22, padding: "20px 34px", boxShadow: "0 10px 30px rgba(0,0,0,.6)" }}>
      <div style={{ width: 96, height: 96, borderRadius: 14, background: "linear-gradient(#ffe27a,#c8901a)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 64 }}>🏆</div>
      <div>
        <div style={{ color: "#e6e6ea", fontSize: 38 }}>اختراع جديد اتفتح</div>
        <div style={{ color: "#fff", fontSize: 56, lineHeight: 1.1 }}>غسالة المواعين النفاثة ٣٠٠٠</div>
      </div>
    </div>
  );
};

export const PS3Test: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const assets = useAssets();
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {assets ? (
        <ThreeCanvas width={1080} height={1920} shadows gl={{ antialias: false, powerPreference: "high-performance" }} camera={{ fov: 42, near: 0.05, far: 40 }}>
          <World t={t} assets={assets} />
        </ThreeCanvas>
      ) : null}
      <AbsoluteFill>
        <Subtitle t={t} />
        <Toast t={t} />
      </AbsoluteFill>
      <Sequence from={Math.round(OM_START * FPS)}><Audio src={staticFile("audio/om.wav")} /></Sequence>
      <Sequence from={Math.round(IB_START * FPS)}><Audio src={staticFile("audio/ib.wav")} /></Sequence>
      <Sequence from={Math.round(TOAST * FPS)}><Audio src={staticFile("audio/ding.wav")} volume={0.7} /></Sequence>
    </AbsoluteFill>
  );
};
