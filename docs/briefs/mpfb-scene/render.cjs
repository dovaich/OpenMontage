// usage:
//   node render.cjs frames 15                 -> every frame, split over several browsers at once (default: one per CPU core, max 4)
//   node render.cjs frames 15 --jobs 2        -> choose the number of browsers
//   node render.cjs frames 15 --range 300-420 -> only frames 300..419 (fix one shot without re-rendering everything)
//   node render.cjs st 15 1.5,8,15,22         -> stills at these times (st/tX.XX.png)
//   HUD=1 node render.cjs hud 30 0,0.033,...  -> transparent PNGs with only the dialogue box/hook (for coldopen_flow.py)
//   node render.cjs check 15                  -> framing check (needs framing_check.js in scene.js): check/report.txt + check/*.png of the bad frames
// The page must expose window.renderFrame(t), window.frameData() and window.READY (and window.frameCheck(t) for "check").
(async () => {
const { chromium } = require('playwright');
const fs = require('fs');
const os = require('os');
const args = process.argv.slice(2);
let jobs = Math.min(4, os.cpus().length);
const ji = args.indexOf('--jobs'); if (ji >= 0) { jobs = Math.max(1, Number(args[ji + 1])); args.splice(ji, 2); }
let range = null; const ri = args.indexOf('--range'); if (ri >= 0) { range = args[ri + 1].split('-').map(Number); args.splice(ri, 2); }
const [outDir, fpsArg, list] = args;
const fps = Number(fpsArg || 15);
const URL = 'http://127.0.0.1:8901/scene.html';
const checkMode = outDir === 'check';
fs.mkdirSync(outDir, { recursive: true });
const allTimes = Array.from({ length: Math.ceil(12.48 * fps) }, (_, i) => i / fps);
const stills = list && list !== '-';
let items = stills ? list.split(',').map(Number).map((t, i) => [i, t]) : allTimes.map((t, i) => [i, t]);
if (range && !stills) items = items.slice(range[0], range[1]);   // frame indices [a, b): re-render only part of an episode
if (stills) jobs = Math.min(jobs, items.length);
if (checkMode) jobs = Math.min(jobs, 2);

async function openPage() {
  const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const page = await browser.newPage({ viewport: { width: 720, height: 1280 } });
  page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') console.log('PAGE', m.type(), m.text()); });
  page.on('pageerror', e => console.log('PAGEERR', e.message));
  if (process.env.HUD === '1') await page.addInitScript(() => { window.HUD_ONLY = true; });   // transparent frames with only the 2D layer
  await page.goto(URL);
  await page.waitForFunction(() => window.READY === true, null, { timeout: 120000 });
  await page.evaluate(() => window.MODELS_READY ? window.MODELS_READY() : null);   // 3D models (model_chars.js) finished loading
  return { browser, page };
}

const t0 = Date.now(); let done = 0; const issues = [];
async function worker(slice) {
  const { browser, page } = await openPage();
  for (const [i, t] of slice) {
    if (checkMode) {
      const r = await page.evaluate((t) => window.frameCheck(t), t);
      if (r && r.length) {   // "talks but is hidden" is fine for narration/voice-over lines: skip those with window.FRAME_SKIP
        issues.push([t, r]);
        const data = await page.evaluate(() => window.frameData());
        fs.writeFileSync(`${outDir}/t${t.toFixed(2)}.png`, Buffer.from(data.split(',')[1], 'base64'));
      }
    } else {
      const data = await page.evaluate((t) => { window.renderFrame(t); return window.frameData(); }, t);
      const name = stills ? `t${t.toFixed(2)}.png` : `f${String(i).padStart(5, '0')}.png`;
      fs.writeFileSync(`${outDir}/${name}`, Buffer.from(data.split(',')[1], 'base64'));
    }
    done++; if (done % 100 === 0) console.log(done, '/', items.length, ((Date.now() - t0) / done).toFixed(0) + 'ms/frame (all jobs)');
  }
  await browser.close();
}
// contiguous chunks, one per browser
const per = Math.ceil(items.length / jobs); const slices = [];
for (let j = 0; j < jobs; j++) { const s = items.slice(j * per, (j + 1) * per); if (s.length) slices.push(s); }
console.log(`${items.length} ${checkMode ? 'checks' : 'frames'}, ${slices.length} browser(s)`);
await Promise.all(slices.map(worker));
if (checkMode) {
  issues.sort((a, b) => a[0] - b[0]);
  // merge neighbouring frames that share the same problem into time ranges
  const ranges = [];
  for (const [t, r] of issues) for (const msg of r) {
    const last = ranges.find(x => x.msg === msg && t - x.b <= 1.5 / fps);
    if (last) last.b = t; else ranges.push({ msg, a: t, b: t });
  }
  ranges.sort((x, y) => x.a - y.a);
  const txt = ranges.map(x => `${x.a.toFixed(2)}-${x.b.toFixed(2)}s  ${x.msg}`).join('\n');
  fs.writeFileSync(`${outDir}/report.txt`, (txt || 'OK: no framing problems found') + '\n');
  console.log(txt || 'OK: no framing problems found');
  console.log(`check: ${ranges.length} problem range(s); stills of bad frames in ${outDir}/`);
}
console.log('done', done, 'in', ((Date.now() - t0) / 1000).toFixed(0) + 's');
})();
