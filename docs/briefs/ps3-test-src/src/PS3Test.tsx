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
import env from "./env.json";

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
type Assets = { xbot: { scene: THREE.Object3D; animations: THREE.AnimationClip[] }; hdri: THREE.Texture; tex: Record<string, { map: THREE.Texture; normalMap: THREE.Texture; roughnessMap: THREE.Texture }> };
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
      setAssets({ xbot, hdri, tex });
      continueRender(handle);
    })();
  }, [handle]);
  return assets;
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

// ---------- characters: Mixamo X Bot rig, Mixamo mocap clips driven by the Remotion frame ----------
type Layer = { clip: string; w: number; time: number };
type Tweak = { bone: string; axis: [number, number, number]; angle: number };
const X = new THREE.Vector3(), Q = new THREE.Quaternion(), QP = new THREE.Quaternion(), QB = new THREE.Quaternion();

const mat = (color: string, o: Partial<THREE.MeshStandardMaterialParameters> = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.6, ...o });
const part = (geo: THREE.BufferGeometry, m: THREE.Material, p: [number, number, number], rot: [number, number, number] = [0, 0, 0], sc: [number, number, number] = [1, 1, 1]) => {
  const o = new THREE.Mesh(geo, m);
  o.position.set(...p); o.rotation.set(...rot); o.scale.set(...sc); o.castShadow = true;
  return o;
};

const useRig = (assets: Assets, surface: THREE.Material, joints: THREE.Material, dress: (bones: Record<string, THREE.Object3D>) => void) =>
  useMemo(() => {
    const root = skeletonClone(assets.xbot.scene) as THREE.Object3D;
    const bones: Record<string, THREE.Object3D> = {};
    root.traverse((o: any) => {
      if (o.isBone) bones[o.name.replace("mixamorig", "")] = o;
      if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; o.frustumCulled = false; o.material = /Joints/.test(o.material.name) ? joints : surface; }
    });
    dress(bones);
    const mixer = new THREE.AnimationMixer(root);
    const actions: Record<string, THREE.AnimationAction> = {};
    for (const c of assets.xbot.animations) { actions[c.name] = mixer.clipAction(c); actions[c.name].play(); actions[c.name].setEffectiveWeight(0); }
    return { root, bones, mixer, actions };
    // eslint-disable-next-line
  }, [assets]);

const pose = (rig: ReturnType<typeof useRig>, layers: Layer[], tweaks: Tweak[]) => {
  for (const k of Object.keys(rig.actions)) rig.actions[k].setEffectiveWeight(0);
  for (const l of layers) {
    const a = rig.actions[l.clip];
    a.setEffectiveWeight(l.w);
    const d = a.getClip().duration;
    a.time = ((l.time % d) + d) % d;
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

const OmHamada: React.FC<{ t: number; assets: Assets }> = ({ t, assets }) => {
  const rig = useRig(assets,
    useMemo(() => mat("#ff8fb4", { normalMap: assets.tex.floral_jacquard.normalMap, roughness: 0.85 }), [assets]),
    useMemo(() => mat("#0d8f58", { roughness: 0.7 }), []),
    (b) => {
      const scarf = mat("#0d8f58", { roughness: 0.75 }), glove = mat("#ffd21f", { roughness: 0.3 });
      b.Head.add(part(new THREE.SphereGeometry(12.6, 24, 18, 0, Math.PI * 2, 0, Math.PI * 0.62), scarf, [0, 3.8, -0.5], [-0.35, 0, 0]));
      b.Head.add(part(new THREE.SphereGeometry(5, 12, 10), scarf, [0, -3, -12.5]));
      b.Hips.add(part(new THREE.CylinderGeometry(17, 31, 92, 28, 1, true), mat("#ff8fb4", { normalMap: assets.tex.floral_jacquard.normalMap, roughness: 0.9, side: THREE.DoubleSide }), [0, -44, 0]));
      for (const h of ["LeftHand", "RightHand"]) b[h].add(part(new THREE.SphereGeometry(6.5, 14, 12), glove, [0, 6, 0], [0, 0, 0], [1, 1.3, 0.75]));
    });
  const talk = envAt("om", t, OM_START);
  const turn = easeBack(seg(t, 0.45, 0.8));
  const shout = easeOut(seg(t, 0.75, 0.95)) * (1 - easeInOut(seg(t, 1.9, 2.3)));
  const point = easeOut(seg(t, 2.15, 2.45)) * (1 - seg(t, 3.85, 4.1));
  const after = t >= CUT3;
  const jit = Math.sin(t * 36) * 0.07 * (0.3 + talk);
  useLayoutEffect(() => {
    if (after) {
      pose(rig, [{ clip: "idle", w: 0.35, time: t }, { clip: "sad_pose", w: 0.65, time: 0 }], [
        { bone: "Head", axis: [0, 1, 0], angle: -0.5 }, { bone: "LeftArm", axis: [1, 0, 0], angle: -0.25 }, { bone: "RightArm", axis: [1, 0, 0], angle: -0.25 },
      ]);
    } else {
      const hs = seg(t, 2.3, 2.6) * (1 - seg(t, 3.8, 4.1));
      pose(rig, [{ clip: "idle", w: 1 - hs * 0.8, time: t }, { clip: "headShake", w: hs * 0.8, time: (t - 2.3) * 1.5 }], [
        { bone: "LeftArm", axis: [0, 0, 1], angle: shout * (2.35 + jit) },
        { bone: "RightArm", axis: [0, 0, 1], angle: -shout * (2.35 - jit) },
        { bone: "RightArm", axis: [1, 0, 0], angle: -point * (1.35 + jit * 0.6) },
        { bone: "RightArm", axis: [0, 1, 0], angle: -point * 0.35 },
        { bone: "LeftArm", axis: [0, 0, 1], angle: point * 0.55 },
        { bone: "LeftForeArm", axis: [0, 1, 0], angle: -point * 1.5 },
        { bone: "Spine", axis: [1, 0, 0], angle: point * 0.16 - shout * 0.12 },
        { bone: "Head", axis: [1, 0, 0], angle: -shout * 0.25 + talk * 0.1 },
      ]);
    }
  });
  return (
    <group position={[-0.6, 0, -1.0]} rotation={[0, after ? 0.5 : lerp(Math.PI * 0.86, 0.42, turn), 0]} scale={[1.06, 0.87 * (1 + talk * 0.02), 1.06]}>
      <primitive object={rig.root} />
    </group>
  );
};

const Ibrahim: React.FC<{ t: number; assets: Assets }> = ({ t, assets }) => {
  const gogRef = React.useRef<THREE.Group | null>(null);
  const rig = useRig(assets,
    useMemo(() => mat("#4f72b0", { roughness: 0.7 }), []),
    useMemo(() => mat("#26324d", { roughness: 0.6 }), []),
    (b) => {
      const black = mat("#0d0907", { roughness: 0.9 }), brass = mat("#c9973a", { metalness: 1, roughness: 0.25 });
      b.Head.add(part(new THREE.CapsuleGeometry(2.3, 11, 6, 12), black, [0, -2, 11.6], [0, 0, Math.PI / 2]));
      const g = new THREE.Group();
      for (const s of [-1, 1]) {
        g.add(part(new THREE.TorusGeometry(3.6, 1.0, 10, 20), brass, [s * 4.6, 0, 0]));
        g.add(part(new THREE.CircleGeometry(3.5, 20), mat("#0b1a16", { metalness: 0.9, roughness: 0.08 }), [s * 4.6, 0, 0]));
      }
      g.add(part(new THREE.TorusGeometry(10.6, 0.9, 8, 28), mat("#3a2a1a", { roughness: 0.8 }), [0, 0, -9.6], [Math.PI / 2, 0, 0]));
      b.Head.add(g);
      gogRef.current = g;
    });
  const talk = envAt("ib", t, IB_START);
  const walkK = seg(t, CUT2, 5.0);
  const stop = easeInOut(seg(t, 4.85, 5.2));
  const calm = seg(t, 4.5, 4.75) * (1 - seg(t, 5.7, 6.0));
  const hero = easeBack(seg(t, 6.0, 6.35));
  const gog = easeInOut(seg(t, 7.2, 7.5));
  const after = t >= CUT3;
  const tada = after ? easeBack(seg(t, CUT3, CUT3 + 0.4)) : 0;
  const pat = Math.sin(t * 11) * 0.14 * calm;
  useLayoutEffect(() => {
    gogRef.current?.position.set(0, lerp(11.5, 4.5, gog), lerp(8.5, 11.6, gog));
    gogRef.current?.rotation.set(lerp(-0.5, 0, gog), 0, 0);
    if (after) {
      pose(rig, [{ clip: "idle", w: 1, time: t }], [
        { bone: "LeftArm", axis: [0, 0, 1], angle: tada * 1.75 }, { bone: "RightArm", axis: [0, 0, 1], angle: -tada * 1.75 },
        { bone: "Spine", axis: [1, 0, 0], angle: -tada * 0.15 },
      ]);
    } else {
      const nod = seg(t, 6.3, 6.6) * 0.7;
      pose(rig, [{ clip: "walk", w: 1 - stop, time: (t - CUT2) * 1.0 }, { clip: "idle", w: stop * (1 - nod), time: t }, { clip: "agree", w: stop * nod, time: t - 6.3 }], [
        { bone: "LeftArm", axis: [1, 0, 0], angle: -calm * 1.0 - pat },
        { bone: "LeftForeArm", axis: [1, 0, 0], angle: -calm * 0.5 + pat },
        { bone: "RightArm", axis: [1, 0, 0], angle: -hero * 2.75 },
        { bone: "RightArm", axis: [0, 0, 1], angle: -hero * 0.2 },
        { bone: "Spine", axis: [1, 0, 0], angle: -hero * 0.1 },
        { bone: "Head", axis: [1, 0, 0], angle: -hero * 0.12 + talk * 0.08 },
      ]);
    }
  });
  const pos: [number, number, number] = after ? [0.95, 0, -1.0] : [lerp(1.95, 1.4, easeOut(walkK)), 0, -0.35];
  return (
    <group position={pos} rotation={[0, after ? -0.7 : -1.05, 0]} scale={[0.9, 0.97, 0.9]}>
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
      p = [0.15 + Math.sin(a) * 2.7, 1.5, -1.66 + Math.cos(a) * 2.7];
      l = [0.15, 1.2, -1.5];
      fov = 50;
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
