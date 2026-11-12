(async () => {
const { chromium } = require('playwright'); const fs = require('fs');
const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const p = await b.newPage({ viewport: { width: 1080, height: 1350 } }); p.on('pageerror', e => console.log('PAGEERR', e.message));
await p.goto('http://127.0.0.1:8765/cards.html'); await p.waitForFunction(() => window.READY === true, null, { timeout: 60000 });
const d = await p.evaluate(() => window.drawCover()); fs.writeFileSync('../renders/cover_all_inventions.png', Buffer.from(d.split(',')[1], 'base64')); console.log('ok'); await b.close();
})();
