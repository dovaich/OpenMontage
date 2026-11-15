// Transparent 1080x1920 overlays: subtitles + the character name card. usage: node overlays.cjs <out_dir> <fonts_node_modules>
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs');
const out = process.argv[2], nm = path.resolve(process.argv[3]);
const f = (p) => 'data:font/woff2;base64,' + fs.readFileSync(path.join(nm, '@fontsource', p)).toString('base64');
const css = `
@font-face{font-family:Lalezar;src:url('${f('lalezar/files/lalezar-arabic-400-normal.woff2')}')}
@font-face{font-family:Cairo;font-weight:800;src:url('${f('cairo/files/cairo-arabic-800-normal.woff2')}')}
@font-face{font-family:Oswald;font-weight:600;src:url('${f('oswald/files/oswald-latin-600-normal.woff2')}')}
html,body{margin:0;width:1080px;height:1920px;background:transparent;overflow:hidden}
.sub{position:absolute;left:70px;right:70px;bottom:330px;text-align:center;direction:rtl;font:800 66px/1.35 Cairo;color:#fff;
 -webkit-text-stroke:3px #000;paint-order:stroke fill;text-shadow:0 5px 0 #000,0 0 22px rgba(0,0,0,.7)}
.card{position:absolute;left:0;right:0;bottom:250px;height:520px}
.bar{position:absolute;left:0;right:0;bottom:30px;height:400px;background:linear-gradient(90deg,rgba(0,0,0,.0),rgba(0,0,0,.55) 18%,rgba(0,0,0,.55) 82%,rgba(0,0,0,0))}
.ar{position:absolute;right:90px;bottom:150px;font:190px/1 Lalezar;color:#f2efe6;direction:rtl;text-shadow:0 8px 0 rgba(0,0,0,.6)}
.en{position:absolute;left:90px;bottom:345px;font:600 64px/1 Oswald;letter-spacing:10px;color:#e8c26a}
.role{position:absolute;right:95px;bottom:60px;font:800 44px/1 Cairo;color:#d9d4c8;direction:rtl}
.line{position:absolute;left:90px;right:90px;bottom:420px;height:4px;background:#e8c26a}`;
const pages = {
  sub1: `<div class=sub>المدينة دي كلها... فاكرة نفسها فاهمة في العربيات.</div>`,
  sub2: `<div class=sub>بس لما العربية تقف...</div>`,
  sub3: `<div class=sub>الكل بيتصل بالعالمي.</div>`,
  card: `<div class=card><div class=bar></div><div class=line></div><div class=en>EL-ALAMY</div>
         <div class=ar>العالمي</div><div class=role>مدير مركز الصيانة</div></div>`,
};
(async () => {
  fs.mkdirSync(out, { recursive: true });
  const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  for (const [k, html] of Object.entries(pages)) {
    await pg.setContent(`<html><head><style>${css}</style></head><body>${html}</body></html>`);
    await pg.evaluate(() => document.fonts.ready);
    await pg.screenshot({ path: path.join(out, k + '.png'), omitBackground: true });
  }
  await b.close(); console.log('overlays ok');
})();
