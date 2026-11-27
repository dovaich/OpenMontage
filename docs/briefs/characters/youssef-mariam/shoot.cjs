(async () => { const { chromium } = require('playwright'); const fs = require('fs'); const [,, m, h, out] = process.argv;
const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const p = await b.newPage({ viewport: { width: 600, height: 1000 } }); p.on('pageerror', e => console.log('ERR', e.message)); p.on('console', m => { if (m.type()==='error') console.log('PAGE', m.text().slice(0,200)) });
await p.goto(`http://127.0.0.1:8791/viewer.html?m=${m}&h=${h}`); await p.waitForFunction(() => window.READY === true, null, { timeout: 120000 });
console.log(JSON.stringify(await p.evaluate(() => window.INFO)));
const hh = Number(h), views = [[0, 4.6, hh * 0.55, hh * 0.52, 30], [0.7, 4.6, hh * 0.55, hh * 0.52, 30], [0, 0.95, hh * 0.93, hh * 0.92, 30], [0.6, 0.95, hh * 0.93, hh * 0.92, 30]];
let i = 0; for (const v of views) { const d = await p.evaluate(v => window.view(...v), v); fs.writeFileSync(`${out}_${i++}.jpg`, Buffer.from(d.split(',')[1], 'base64')); }
await b.close(); })();
