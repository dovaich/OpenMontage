# usage: python kwait.py <slug> <outdir>  — wait for a Kaggle kernel, print the log tail, download its output files
import sys, time, json, os, urllib.request, kg
slug, out = sys.argv[1], sys.argv[2]; os.makedirs(out, exist_ok=True)
time.sleep(30)
while True:
    s = kg.call('kernels.KernelsApiService', 'GetKernelSessionStatus', {'userName': 'dovaich', 'kernelSlug': slug}).get('status', '?')
    if s in ('COMPLETE', 'ERROR', 'CANCEL_ACKNOWLEDGED'): break
    time.sleep(30)
d = kg.call('kernels.KernelsApiService', 'ListKernelSessionOutput', {'userName': 'dovaich', 'kernelSlug': slug})
log = d.get('log', '')
try: txt = ''.join(e.get('data', '') for e in json.loads(log))
except Exception: txt = log
print('STATUS', s); print(txt[-1800:])
for f in d.get('files', []):
    name = f['fileName']
    if name.startswith('__'): continue
    open(os.path.join(out, name), 'wb').write(urllib.request.urlopen(f['url'], timeout=300).read()); print('got', name)
