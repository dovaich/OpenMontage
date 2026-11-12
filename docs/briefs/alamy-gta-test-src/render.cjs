// usage: node render.cjs <outDir> <fps> <query> [t1,t2,...]
(async () => {
const { chromium } = require('playwright'); const fs = require('fs');
const [,, outDir, fpsArg, query, list] = process.argv; const fps = Number(fpsArg || 24);
fs.mkdirSync(outDir, { recursive: true });
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const page = await browser.newPage({ viewport: { width: 720, height: 1280 } });
page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') console.log('PAGE', m.type(), m.text().slice(0, 300)); });
page.on('pageerror', e => console.log('PAGEERR', e.message));
await page.goto('http://127.0.0.1:8791/index.html' + (query && query !== '-' ? '?' + query : ''));
await page.waitForFunction(() => window.READY === true, null, { timeout: 300000 });
console.log(JSON.stringify(await page.evaluate(() => window.INFO)));
const R = (process.env.RANGE || '0-1022').split('-').map(Number);
const times = list ? list.split(',').map(Number) : Array.from({ length: R[1] - R[0] }, (_, i) => (i + R[0]) / fps);
let i = list ? 0 : R[0];
const i0 = i; const t0 = Date.now();
for (const t of times) {
  const data = await page.evaluate((t) => { window.renderFrame(t); return window.frameData(); }, t);
  const name = list ? `t${t.toFixed(2)}.png` : `f${String(i).padStart(5, '0')}.png`;
  fs.writeFileSync(`${outDir}/${name}`, Buffer.from(data.split(',')[1], 'base64'));
  i++; if ((i - i0) % 24 === 0 || list) console.log(i, '/', times.length, ((Date.now() - t0) / (i - i0)).toFixed(0) + 'ms/frame');
}
await browser.close(); console.log('done', i);
})();
