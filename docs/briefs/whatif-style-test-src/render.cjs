// usage: node render.cjs <outDir> <fps> [t1,t2,...]
(async () => {
const { chromium } = require('playwright'); const fs = require('fs');
const [,, outDir, fpsArg, list] = process.argv; const fps = Number(fpsArg || 30);
fs.mkdirSync(outDir, { recursive: true });
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') console.log('PAGE', m.type(), m.text().slice(0,300)); });
page.on('pageerror', e => console.log('PAGEERR', e.message));
await page.goto('http://127.0.0.1:8791/index.html');
await page.waitForFunction(() => window.READY === true, null, { timeout: 120000 });
const dur = await page.evaluate(() => window.DUR);
const times = list ? list.split(',').map(Number) : Array.from({ length: Math.round(dur * fps) }, (_, i) => i / fps);
let i = 0; const t0 = Date.now();
for (const t of times) {
  const data = await page.evaluate((t) => { window.renderFrame(t); return window.frameData(); }, t);
  const name = list ? `t${t.toFixed(2)}.jpg` : `f${String(i).padStart(5, '0')}.jpg`;
  fs.writeFileSync(`${outDir}/${name}`, Buffer.from(data.split(',')[1], 'base64'));
  i++; if (i % 30 === 0) console.log(i, '/', times.length, ((Date.now() - t0) / i).toFixed(0) + 'ms/frame');
}
await browser.close(); console.log('done', i, ((Date.now() - t0) / i).toFixed(0) + 'ms/frame');
})();
