(async()=>{const { chromium } = require('playwright'); const fs=require('fs'); const out=process.argv[2]; fs.mkdirSync(out,{recursive:true});
const b=await chromium.launch(); const p=await b.newPage({viewport:{width:720,height:1280}}); p.on('pageerror',e=>console.log('ERR',e.message));
await p.goto('http://127.0.0.1:8792/overlay.html'); await p.waitForFunction(()=>window.READY===true,null,{timeout:60000});
for (let i=0;i<720;i++){ const d=await p.evaluate((t)=>window.draw(t), i/24); fs.writeFileSync(`${out}/o${String(i).padStart(4,'0')}.png`, Buffer.from(d.split(',')[1],'base64')); }
await b.close(); console.log('done');})();
