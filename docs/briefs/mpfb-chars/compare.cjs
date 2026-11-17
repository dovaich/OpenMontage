(async () => { const { chromium } = require('playwright'); const fs = require('fs'); const out = process.argv[2];
const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const views = { mpfb: [[[0.6, 1.25, 3.4, 0, 1.0, 0, 30], {}], [[0.35, 1.5, 1.6, 0, 1.4, 0, 30], { smile: 0.3 }], [[0.18, 1.66, 0.62, 0, 1.63, 0, 30], {}], [[0.62, 1.66, 0.3, 0, 1.63, 0, 30], {}]],
  kaggle: [[[0.6, 1.25, 3.4, 0, 1.0, 0, 30], {}], [[0.35, 1.5, 1.6, 0, 1.4, 0, 30], {}], [[0.18, 1.66, 0.62, 0, 1.63, 0, 30], {}], [[0.62, 1.66, 0.3, 0, 1.63, 0, 30], {}]] };
const files = [];
for (const [name, m] of [['mpfb', 'ibrahim.glb'], ['kaggle', 'kaggle_ibrahim.glb&norm=1']]) {
  const p = await b.newPage({ viewport: { width: 540, height: 960 } }); p.on('pageerror', e => console.log('ERR', e.message));
  await p.goto('http://127.0.0.1:8899/index.html?m=' + m); await p.waitForFunction(() => window.READY);
  if (name === 'kaggle') await p.evaluate(() => { /* scale Kaggle model to 1.76 m, feet on floor */ });
  for (let i = 0; i < 4; i++) { const d = await p.evaluate(([v, mo]) => window.shot(v, mo), views[name][i]); const f = `/tmp/c_${name}_${i}.png`; fs.writeFileSync(f, Buffer.from(d.split(',')[1], 'base64')); files.push(f); }
  await p.close(); }
await b.close();
require('child_process').execSync(`ffmpeg -v error -y ${files.map(f => `-i ${f}`).join(' ')} -filter_complex "[0][1][2][3]hstack=4[a];[4][5][6][7]hstack=4[b];[a][b]vstack,scale=1440:-1" ${out}`); console.log('ok'); })();
