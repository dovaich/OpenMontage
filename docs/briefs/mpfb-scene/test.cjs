(async () => { const { chromium } = require('playwright'); const fs = require('fs'); const out = process.argv[2]; const model = process.argv[3] || 'ibrahim';
const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] }); const p = await b.newPage({ viewport: { width: 540, height: 960 } });
p.on('pageerror', e => console.log('ERR', e.message)); p.on('console', m => { if (m.type() === 'error') console.log('C', m.text()); });
await p.goto('http://127.0.0.1:8901/test.html?m=' + model); await p.waitForFunction(() => window.READY, null, { timeout: 120000 });
console.log(await p.evaluate(() => window.CLIPS.join(' ')));
const shots = (process.argv[4] || 'scared:4,scared:6,scared:8,scared:10,scared:13,scared:16,run:0.2,yelling:3').split(',').map(x => [x.split(':')[0], Number(x.split(':')[1])]);
for (let i = 0; i < shots.length; i++) { const d = await p.evaluate(([c, t]) => window.shot(c, t), shots[i]); fs.writeFileSync(`/tmp/t_${i}.png`, Buffer.from(d.split(',')[1], 'base64')); }
await b.close();
require('child_process').execSync(`ffmpeg -v error -y ${shots.map((_, i) => `-i /tmp/t_${i}.png`).join(' ')} -filter_complex "${shots.map((_, i) => `[${i}]`).join('')}hstack=${shots.length},scale=1500:-1" ${out}`); console.log('ok'); })();
