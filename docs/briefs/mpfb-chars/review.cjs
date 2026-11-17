// node review.cjs <model.glb> <out.png>: row 1 = body (front, 3/4, side, back), row 2 = head (front, 3/4, side, back-3/4), row 3 = face acting
(async () => { const { chromium } = require('playwright'); const fs = require('fs'); const [,, model, out] = process.argv;
const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] }); const p = await b.newPage({ viewport: { width: 540, height: 960 } });
p.on('pageerror', e => console.log('ERR', e.message)); p.on('console', m => { if (m.type() === 'error') console.log('C', m.text()); });
await p.goto('http://127.0.0.1:8899/index.html?m=' + model); await p.waitForFunction(() => window.READY);
const TOPY = await p.evaluate(() => window.INFO.top); const HY = TOPY - 0.155, tag = require('path').basename(model, '.glb');
const v = (a, r, y, ly, fov) => [Math.sin(a * Math.PI / 180) * r, y, Math.cos(a * Math.PI / 180) * r, 0, ly, 0, fov];
const shots = [[v(0, 4.4, 1.0, 0.92, 28), {}], [v(40, 4.4, 1.0, 0.92, 28), {}], [v(90, 4.4, 1.0, 0.92, 28), {}], [v(180, 4.4, 1.0, 0.92, 28), {}],
  [v(0, 0.95, HY + 0.03, HY, 24), {}], [v(40, 0.95, HY + 0.03, HY, 24), {}], [v(90, 0.95, HY + 0.03, HY, 24), {}], [v(145, 0.95, HY + 0.03, HY, 24), {}],
  [v(15, 0.75, HY, HY - 0.03, 22), { open: 0.7 }], [v(15, 0.75, HY, HY - 0.03, 22), { round: 1 }], [v(15, 0.75, HY, HY - 0.03, 22), { smile: 0.8, wide: 0.3 }], [v(15, 0.75, HY, HY - 0.03, 22), { blinkL: 1, blinkR: 1, browsUp: 0.8 }]];
for (let i = 0; i < shots.length; i++) { const d = await p.evaluate(([vv, m]) => window.shot(vv, m), shots[i]); fs.writeFileSync(`/tmp/r_${tag}_${i}.png`, Buffer.from(d.split(',')[1], 'base64')); }
await b.close();
const row = (a) => a.map(i => `[${i}]crop=540:540:0:${i < 4 ? 210 : 210}[c${i}];`).join('') + a.map(i => `[c${i}]`).join('') + `hstack=4[row${a[0]}];`;
require('child_process').execSync(`ffmpeg -v error -y ${shots.map((_, i) => `-i /tmp/r_${tag}_${i}.png`).join(' ')} -filter_complex "${[0,1,2,3].map(i=>`[${i}]scale=304:540,pad=540:540:118:0:0x5a6a7a[c${i}];`).join('')}[c0][c1][c2][c3]hstack=4[r0];${[4,5,6,7].map(i=>`[${i}]crop=540:540:0:110[c${i}];`).join("")+[8,9,10,11].map(i=>`[${i}]crop=540:540:0:210[c${i}];`).join('')}[c4][c5][c6][c7]hstack=4[r1];[c8][c9][c10][c11]hstack=4[r2];[r0][r1][r2]vstack=3,scale=1440:-1" ${out}`); console.log('ok'); })();
