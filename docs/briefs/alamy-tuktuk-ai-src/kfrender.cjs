// node kfrender.cjs <outDir> [ids,...] — renders the key frames from kf.html
(async()=>{const { chromium } = require('playwright'); const fs=require('fs'); const [,,out,ids]=process.argv; fs.mkdirSync(out,{recursive:true});
const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const p=await b.newPage({viewport:{width:720,height:1280}}); p.on('pageerror',e=>console.log('ERR',e.message)); p.on('console',m=>{if(m.type()==='error')console.log('PAGE',m.text().slice(0,300))});
await p.goto('http://127.0.0.1:8792/kf.html'); await p.waitForFunction(()=>window.READY===true,null,{timeout:300000});
const list = ids ? ids.split(',') : await p.evaluate(()=>window.KF_IDS);
for (const id of list) { for (const mode of ['', 'depth']) { const d=await p.evaluate(([id,mode])=>window.renderKF(id,mode), [id,mode]); fs.writeFileSync(`${out}/${id}${mode?'_depth':''}.png`, Buffer.from(d.split(',')[1],'base64')); } console.log('ok',id); }
await b.close();})();
