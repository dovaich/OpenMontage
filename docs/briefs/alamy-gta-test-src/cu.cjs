// node cu.cjs out.png t query  -> renders frame t with a debug head CU camera when query has cu=1
(async()=>{const { chromium } = require('playwright');const [,,out,t,q]=process.argv;
const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const p=await b.newPage({viewport:{width:720,height:1280}});p.on('pageerror',e=>console.log('ERR',e.message));
await p.goto('http://127.0.0.1:8791/index.html?'+(q||''));await p.waitForFunction(()=>window.READY===true,null,{timeout:300000});
const d=await p.evaluate((t)=>{window.renderFrame(t);return window.frameData();},Number(t));require('fs').writeFileSync(out,Buffer.from(d.split(',')[1],'base64'));await b.close();})();
