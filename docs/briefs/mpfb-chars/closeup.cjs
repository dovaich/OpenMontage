(async () => { const { chromium } = require('playwright'); const fs = require('fs'); const [,, model, out, ang] = process.argv;
const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] }); const p = await b.newPage({ viewport: { width: 540, height: 960 } });
await p.goto('http://127.0.0.1:8899/index.html?m=' + model); await p.waitForFunction(() => window.READY);
const top = await p.evaluate(() => window.INFO.top); const a = Number(ang || 0) * Math.PI / 180, y = top - 0.2;
const d = await p.evaluate(([v]) => window.shot(v, {}), [[Math.sin(a) * 0.6, y, Math.cos(a) * 0.6, 0, y, 0, 26]]);
fs.writeFileSync(out, Buffer.from(d.split(',')[1], 'base64')); await b.close(); })();
