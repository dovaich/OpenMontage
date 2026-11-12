// close-up of the head/chest at a given query: node closeup.cjs out.png query
(async()=>{const { chromium } = require('playwright');const [,,out,q]=process.argv;
const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const p=await b.newPage({viewport:{width:1280,height:720}});p.on('pageerror',e=>console.log('ERR',e.message));
await p.goto('http://127.0.0.1:8790/index.html?'+(q||''));await p.waitForFunction(()=>window.READY===true,null,{timeout:300000});
await p.evaluate(()=>{window.renderFrame(5.6);});
const d=await p.evaluate(()=>window.frameData());require('fs').writeFileSync(out,Buffer.from(d.split(',')[1],'base64'));await b.close();})();
