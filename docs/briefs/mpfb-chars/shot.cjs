// node shot.cjs <model.glb> <out.png>  -> contact sheet: front full, side, face, face with mouth open/round/wide + blink
(async () => {
const { chromium } = require('playwright'); const fs = require('fs');
const [,, model, out] = process.argv;
const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const p = await b.newPage({ viewport: { width: 540, height: 960 } }); p.on('pageerror', e => console.log('ERR', e.message)); p.on('console', m => { if (m.type() === 'error') console.log('C', m.text()); });
await p.goto('http://127.0.0.1:8899/index.html?m=' + model); await p.waitForFunction(() => window.READY, null, { timeout: 60000 });
console.log(JSON.stringify(await p.evaluate(() => window.INFO)));
const shots = [
  [[0, 1.0, 4.6, 0, 0.92, 0, 30], {}], [[3.2, 1.2, 2.6, 0, 0.92, 0, 30], {}],
  [[0.25, 1.62, 0.75, 0, 1.58, 0, 30], {}], [[0.25, 1.62, 0.75, 0, 1.58, 0, 30], { open: 0.8 }],
  [[0.25, 1.62, 0.75, 0, 1.58, 0, 30], { round: 1 }], [[0.25, 1.62, 0.75, 0, 1.58, 0, 30], { wide: 1, smile: 0.6 }],
  [[0.25, 1.62, 0.75, 0, 1.58, 0, 30], { blinkL: 1, blinkR: 1, browsUp: 1 }], [[-0.55, 1.6, -0.6, 0, 1.55, 0, 30], {}]];
for (let i = 0; i < shots.length; i++) { const d = await p.evaluate(([v, m]) => window.shot(v, m), shots[i]); fs.writeFileSync(`/tmp/shot_${i}.png`, Buffer.from(d.split(',')[1], 'base64')); }
await b.close();
require('child_process').execSync(`ffmpeg -v error -y ${shots.map((_, i) => `-i /tmp/shot_${i}.png`).join(' ')} -filter_complex "${shots.map((_, i) => `[${i}]`).join('')}hstack=${shots.length},scale=${shots.length * 220}:-1" ${out}`);
console.log('ok', out);
})();
