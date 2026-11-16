import wave, numpy as np, sys, json
f=sys.argv[1]; minsil=float(sys.argv[2]) if len(sys.argv)>2 else 0.18
w=wave.open(f); sr=w.getframerate(); ch=w.getnchannels()
a=np.frombuffer(w.readframes(w.getnframes()),np.int16).astype(float)/32768
if ch>1: a=a.reshape(-1,ch).mean(1)
hop=int(sr*0.01); e=np.array([np.sqrt(np.mean(a[i:i+hop]**2)) for i in range(0,len(a)-hop,hop)])
db=20*np.log10(e+1e-9); sp=db>db.max()-38
segs=[];i=0;n=len(sp); ms=int(minsil*100)
while i<n:
    if sp[i]:
        j=i
        while j<n:
            if not sp[j]:
                k=j
                while k<n and not sp[k]: k+=1
                if k-j>=ms or k==n: break
                j=k
            else: j+=1
        segs.append((i/100,j/100)); i=j
    else: i+=1
segs=[s for s in segs if s[1]-s[0]>0.08]
def f0(x):
    x=x-x.mean()
    if np.sqrt(np.mean(x**2))<0.02: return None
    c=np.correlate(x,x,'full')[len(x)-1:]; lo,hi=int(sr/450),int(sr/70); k=lo+np.argmax(c[lo:hi])
    return sr/k if c[k]>0.35*c[0] else None
print(f, "sr",sr,"ch",ch,"dur",round(len(a)/sr,2))
pe=0
for s,e2 in segs:
    fs=[x for x in (f0(a[int(t*sr):int(t*sr)+int(0.04*sr)]) for t in np.arange(s,e2-0.04,0.02)) if x]
    r=np.sqrt(np.mean(a[int(s*sr):int(e2*sr)]**2))
    print(f"  {s:6.2f}-{e2:6.2f} gap={s-pe:4.2f} dur={e2-s:4.2f} f0={np.median(fs) if fs else 0:4.0f} rms={20*np.log10(r):5.1f}"); pe=e2
