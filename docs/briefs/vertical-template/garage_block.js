const garage = new THREE.Group(); scene.add(garage);
const concT = canvasTex(32, 32, (g) => { g.fillStyle = '#8a8a8e'; g.fillRect(0, 0, 32, 32); const r = rng(3); for (let i = 0; i < 60; i++) { g.fillStyle = r() > .5 ? '#9a9a9e' : '#7a7a7e'; g.fillRect(r() * 32 | 0, r() * 32 | 0, 2, 2); } g.fillStyle = 'rgba(20,20,20,0.5)'; g.beginPath(); g.ellipse(20, 12, 7, 4, 0.3, 0, 7); g.fill(); g.fillStyle = '#e8c020'; g.fillRect(0, 30, 32, 2); }, [8, 6]);
const metalT = canvasTex(16, 32, (g) => { g.fillStyle = '#6f8fa8'; g.fillRect(0, 0, 16, 32); g.fillStyle = '#5a7890'; for (let x = 0; x < 16; x += 4) g.fillRect(x, 0, 2, 32); g.fillStyle = '#8aa8c0'; g.fillRect(1, 0, 1, 32); }, [14, 2]);
const signT = canvasTex(160, 32, (g) => { g.fillStyle = '#d8231b'; g.fillRect(0, 0, 160, 32); g.fillStyle = '#fff'; g.fillRect(0, 0, 160, 3); g.fillRect(0, 29, 160, 3); });
const gw = (w, h, x, y, z, ry, mat) => { const m = mesh(new THREE.PlaneGeometry(w, h), mat, x, y, z, garage); m.rotation.y = ry; return m; };
const metalM = M(0xffffff, { map: metalT });
gw(14, 5, 0, 2.5, -5, 0, metalM); gw(10, 5, -7, 2.5, 0, Math.PI / 2, metalM);
gw(3, 5, 7, 2.5, -3.5, -Math.PI / 2, metalM); gw(3, 5, 7, 2.5, 3.5, -Math.PI / 2, metalM); gw(4, 1.2, 7, 4.4, 0, -Math.PI / 2, metalM); // big open door x=7, z -2..2
const doorSky = gw(4.2, 3.8, 7.6, 1.9, 0, -Math.PI / 2, new THREE.MeshBasicMaterial({ color: 0xbfe0ff }));
const gfloor = mesh(new THREE.PlaneGeometry(14, 10), M(0xffffff, { map: concT }), 0, 0, 0, garage); gfloor.rotation.x = -Math.PI / 2;
const gceil = mesh(new THREE.PlaneGeometry(14, 10), M(0x5a5a60), 0, 5, 0, garage); gceil.rotation.x = Math.PI / 2;
const sign = mesh(new THREE.PlaneGeometry(6.4, 1.28), new THREE.MeshBasicMaterial({ map: signT }), 0, 4.1, -4.97, garage);
for (let i = -2; i <= 2; i++) { mesh(box(1.6, 0.06, 0.15), M(0xdddddd), i * 2.8, 4.9, -0.5, garage); mesh(cyl(0.04, 0.04, 1.5, 6), new THREE.MeshBasicMaterial({ color: 0xf0fff4 }), i * 2.8, 4.85, -0.5, garage).rotation.z = Math.PI / 2; }
// tool board with wrenches
const board = mesh(box(3.2, 1.6, 0.06), M(0xc8a060), -3.8, 2.2, -4.95, garage);
{ const r = rng(5); for (let i = 0; i < 14; i++) { const t = mesh(box(0.06, 0.35 + r() * 0.3, 0.03), P(0xb8c0c8, { shininess: 90 }), -5.2 + i * 0.2, 2.2 + (r() - .5) * 0.6, -4.9, garage); t.rotation.z = (r() - .5) * 0.3; } }
// tire stacks + oil barrels
for (const [x, z] of [[-6.2, -4.2], [-6.2, -3.2], [5.6, -4.3]]) for (let k = 0; k < 4; k++) mesh(new THREE.TorusGeometry(0.38, 0.16, 6, 12), M(0x1a1a1a), x, 0.16 + k * 0.32, z, garage).rotation.x = Math.PI / 2;
for (const [x, z, c] of [[-6.3, 1.5, 0x1f5fd8], [-6.3, 2.4, 0xd8231b], [-5.5, 2.0, 0x1f5fd8]]) { mesh(cyl(0.32, 0.32, 0.95, 10), M(c), x, 0.475, z, garage); mesh(new THREE.TorusGeometry(0.32, 0.03, 4, 10), M(0x111111), x, 0.65, z, garage).rotation.x = Math.PI / 2; }
// car lift with a raised sedan
const lift = new THREE.Group(); lift.position.set(-3.6, 0, -2.4); garage.add(lift);
for (const s of [-1, 1]) mesh(box(0.25, 3.0, 0.25), M(0xe8c020), s * 1.5, 1.5, 0, lift);
mesh(box(3.2, 0.12, 1.4), M(0x333333), 0, 1.6, 0, lift);
const sedan = new THREE.Group(); sedan.position.set(0, 1.7, 0); lift.add(sedan);
mesh(box(3.0, 0.55, 1.35), M(0xf2f2f2), 0, 0.35, 0, sedan); mesh(box(1.5, 0.5, 1.25), M(0x223344), -0.1, 0.85, 0, sedan);
for (const [x, z] of [[-1.0, 0.68], [1.0, 0.68], [-1.0, -0.68], [1.0, -0.68]]) mesh(cyl(0.3, 0.3, 0.18, 10), M(0x111111), x, 0.2, z, sedan).rotation.x = Math.PI / 2;
// a second car on the floor with its hood up (El-Gazzar's spot)
const car2 = new THREE.Group(); car2.position.set(2.6, 0, -3.3); garage.add(car2);
mesh(box(3.0, 0.55, 1.35), M(0x1f5fd8), 0, 0.55, 0, car2); mesh(box(1.5, 0.5, 1.25), M(0x223344), 0.2, 1.05, 0, car2);
const hood = mesh(box(0.9, 0.05, 1.3), M(0x1f5fd8), -1.5, 1.25, 0, car2); hood.rotation.z = -1.0;
for (const [x, z] of [[-1.0, 0.68], [1.0, 0.68], [-1.0, -0.68], [1.0, -0.68]]) mesh(cyl(0.3, 0.3, 0.18, 10), M(0x111111), x, 0.3, z, car2).rotation.x = Math.PI / 2;
// El-Alamy's office corner: glass box + desk + monitor
const office = new THREE.Group(); office.position.set(4.4, 0, 2.6); garage.add(office);
mesh(box(1.4, 0.06, 0.7), M(0x6a4220), 0, 0.8, 0, office); for (const [x, z] of [[-0.6, -0.3], [0.6, -0.3], [-0.6, 0.3], [0.6, 0.3]]) mesh(box(0.05, 0.8, 0.05), M(0x333333), x, 0.4, z, office);
const monTex = canvasTex(64, 40, (g) => { g.fillStyle = '#0a2a5a'; g.fillRect(0, 0, 64, 40); g.fillStyle = '#3df05a'; for (let y = 4; y < 36; y += 5) g.fillRect(4, y, 20 + (y * 7 % 30), 2); });
mesh(box(0.6, 0.4, 0.05), M(0x111111), 0, 1.1, -0.2, office); mesh(new THREE.PlaneGeometry(0.55, 0.35), new THREE.MeshBasicMaterial({ map: monTex }), 0, 1.1, -0.17, office);
mesh(new THREE.PlaneGeometry(2.2, 2.6), new THREE.MeshPhongMaterial({ color: 0xcfe6ff, transparent: true, opacity: 0.18, side: THREE.DoubleSide }), 0, 1.3, 0.9, office);
// creeper board for El-Gazzar
const creeper = new THREE.Group(); garage.add(creeper);
mesh(box(0.55, 0.06, 1.5), M(0x333333), 0, 0.13, 0, creeper); for (const [x, z] of [[-0.22, -0.6], [0.22, -0.6], [-0.22, 0.6], [0.22, 0.6]]) mesh(new THREE.SphereGeometry(0.06, 5, 4), M(0x111111), x, 0.06, z, creeper);
