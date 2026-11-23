// Night lighting that stays cheap on phones:
// - a warm light pool on the ground under every street lamp (one instanced draw call)
// - a glow halo on every bulb (one Points draw call)
// - 4 real point lights that hop to the lamps nearest the camera, so people, cars and walls are lit too
// - headlights: a real spot light on the car you drive, glow on traffic headlights
import * as THREE from 'three';

function radial(inner, outer) {
  const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d');
  const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, inner); gr.addColorStop(0.45, outer); gr.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 64, 64); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

export function createNightLights(scene, lampSpots) {
  const n = lampSpots.length;
  // ground pools
  const poolMat = new THREE.MeshBasicMaterial({ map: radial('rgba(255,210,140,0.9)', 'rgba(255,170,80,0.35)'), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0 });
  const poolGeo = new THREE.PlaneGeometry(10, 10); poolGeo.rotateX(-Math.PI / 2);
  const pools = new THREE.InstancedMesh(poolGeo, poolMat, n); pools.frustumCulled = false; pools.renderOrder = 2;
  const m = new THREE.Matrix4();
  lampSpots.forEach((l, i) => { m.makeTranslation(l.x, 0.16, l.z); pools.setMatrixAt(i, m); });
  pools.instanceMatrix.needsUpdate = true; scene.add(pools);
  // bulb halos
  const haloGeo = new THREE.BufferGeometry(); haloGeo.setAttribute('position', new THREE.Float32BufferAttribute(lampSpots.flatMap(l => [l.x, l.y, l.z]), 3));
  const haloMat = new THREE.PointsMaterial({ map: radial('rgba(255,250,220,1)', 'rgba(255,200,120,0.5)'), size: 2.6, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0 });
  const halos = new THREE.Points(haloGeo, haloMat); halos.frustumCulled = false; scene.add(halos);
  // real lights near the camera
  const lights = []; for (let i = 0; i < 4; i++) { const pl = new THREE.PointLight(0xffc880, 0, 16, 1.2); pl.position.set(0, -50, 0); scene.add(pl); lights.push(pl); }
  // headlights of the car you drive
  const spot = new THREE.SpotLight(0xfff2d0, 0, 34, 0.55, 0.6, 1); spot.position.set(0, -50, 0); scene.add(spot); scene.add(spot.target);
  // traffic headlight glows
  const MAXC = 40; const carGeo = new THREE.BufferGeometry(); carGeo.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(MAXC * 3), 3));
  const carMat = new THREE.PointsMaterial({ map: radial('rgba(255,255,230,1)', 'rgba(255,230,160,0.4)'), size: 1.3, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0 });
  const carPts = new THREE.Points(carGeo, carMat); carPts.frustumCulled = false; scene.add(carPts);
  const beamGeo = new THREE.PlaneGeometry(1, 1); beamGeo.rotateX(-Math.PI / 2);
  const beamMat = new THREE.MeshBasicMaterial({ map: radial('rgba(255,240,200,0.7)', 'rgba(255,220,150,0.25)'), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0 });
  const beams = new THREE.InstancedMesh(beamGeo, beamMat, 20); beams.frustumCulled = false; beams.renderOrder = 2; scene.add(beams);

  let pickT = 0; const near = [];
  const q = new THREE.Quaternion(), sc = new THREE.Vector3(), pos = new THREE.Vector3(), up = new THREE.Vector3(0, 1, 0);
  return {
    update(dt, night, cam, vehicles, myCar, inside) {
      const on = inside ? 0 : night;
      poolMat.opacity = on * 0.85; haloMat.opacity = on; carMat.opacity = on; beamMat.opacity = on * 0.8;
      pools.visible = halos.visible = carPts.visible = beams.visible = on > 0.02;
      // real lights: re-pick the nearest lamps a few times a second
      pickT -= dt;
      if (pickT <= 0 && on > 0.02) {
        pickT = 0.35; near.length = 0;
        const cx = cam.x, cz = cam.z;
        for (const l of lampSpots) { const d = (l.x - cx) ** 2 + (l.z - cz) ** 2; if (d < 1600) near.push([d, l]); }
        near.sort((a, b) => a[0] - b[0]);
        lights.forEach((pl, i) => { const l = near[i]?.[1]; if (l) pl.position.set(l.x, l.y - 0.4, l.z); else pl.position.set(0, -50, 0); });
      }
      for (const pl of lights) pl.intensity = on * 9;
      // my car's headlights
      if (myCar && on > 0.02) {
        const fx = Math.cos(myCar.yaw), fz = -Math.sin(myCar.yaw);
        spot.position.set(myCar.pos.x + fx * myCar.L * 0.5, myCar.pos.y + 0.9, myCar.pos.z + fz * myCar.L * 0.5);
        spot.target.position.set(myCar.pos.x + fx * 14, myCar.pos.y, myCar.pos.z + fz * 14);
        spot.intensity = on * 40;
      } else spot.intensity = 0;
      // traffic headlights: two glow dots + a light patch on the road in front
      const arr = carGeo.attributes.position.array; let k = 0, b = 0;
      if (on > 0.02) for (const v of vehicles) {
        if (!v.root.visible || !(v.ai || v === myCar)) continue;
        if ((v.pos.x - cam.x) ** 2 + (v.pos.z - cam.z) ** 2 > 6400) continue;
        const fx = Math.cos(v.yaw), fz = -Math.sin(v.yaw), rx = -fz, rz = fx, hx = v.L / 2 + 0.05, hy = v.pos.y + 0.75;
        for (const s of [-1, 1]) { if (k >= MAXC) break; arr[k * 3] = v.pos.x + fx * hx + rx * s * v.W * 0.33; arr[k * 3 + 1] = hy; arr[k * 3 + 2] = v.pos.z + fz * hx + rz * s * v.W * 0.33; k++; }
        if (b < 20) { pos.set(v.pos.x + fx * (hx + 3.5), v.pos.y + 0.17, v.pos.z + fz * (hx + 3.5)); q.setFromAxisAngle(up, v.yaw); sc.set(7, 1, v.W * 1.6); m.compose(pos, q, sc); beams.setMatrixAt(b++, m); }
      }
      for (let i = k; i < MAXC; i++) arr[i * 3 + 1] = -100;
      carGeo.attributes.position.needsUpdate = true; carGeo.setDrawRange(0, Math.max(1, k));
      beams.count = b; beams.instanceMatrix.needsUpdate = true;
    },
  };
}
