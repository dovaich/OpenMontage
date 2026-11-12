(async () => {
const { chromium } = require('playwright'); const fs = require('fs');
const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const p = await b.newPage({ viewport: { width: 1080, height: 1350 } });
p.on('pageerror', e => console.log('PAGEERR', e.message)); p.on('console', m => { if (m.type() === 'error') console.log('ERR', m.text()); });
await p.goto('http://127.0.0.1:8765/cards.html'); await p.waitForFunction(() => window.READY === true, null, { timeout: 60000 });
const files = await p.evaluate(() => window.CARD_FILES);
for (let i = 0; i < files.length; i++) { const d = await p.evaluate(i => window.drawCardN(i), i); fs.writeFileSync(`../renders/${files[i]}.png`, Buffer.from(d.split(',')[1], 'base64')); console.log('ok', files[i]); }
await b.close();
})();
