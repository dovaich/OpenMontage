// node head.cjs <model.glb> <out.png>: head sheet (front, 3/4, side, back-3/4, back) at ear level
(async () => { const { chromium } = require('playwright'); const fs = require('fs'); const [,, model, out] = process.argv;
const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] }); const p = await b.newPage({ viewport: { width: 540, height: 960 } });
p.on('pageerror', e => console.log('ERR', e.message));
await p.goto('http://127.0.0.1:8899/index.html?m=' + model); await p.waitForFunction(() => window.READY);
const H = 1.63, R = 0.85; const angs = [0, 35, 90, 140, 180];
for (let i = 0; i < angs.length; i++) { const a = angs[i] * Math.PI / 180;
  const d = await p.evaluate(([v]) => window.shot(v, {}), [[Math.sin(a) * R, H + 0.02, Math.cos(a) * R, 0, H, 0, 22]]);
  fs.writeFileSync(`/tmp/h_${i}.png`, Buffer.from(d.split(',')[1], 'base64')); }
await b.close();
require('child_process').execSync(`ffmpeg -v error -y ${angs.map((_, i) => `-i /tmp/h_${i}.png`).join(' ')} -filter_complex "${angs.map((_, i) => `[${i}]crop=540:540:0:120[c${i}];`).join('')}${angs.map((_, i) => `[c${i}]`).join('')}hstack=${angs.length},scale=1600:-1" ${out}`); console.log('ok'); })();
