import numpy as np, wave, sys
SR=48000; D=10.3; N=int(SR*D); t=np.arange(N)/SR
def rd(p):
    w=wave.open(p); x=np.frombuffer(w.readframes(w.getnframes()),np.int16).astype(np.float32)/32768
    if w.getnchannels()==2: x=x.reshape(-1,2).mean(1)
    return x
narr=rd('narr.wav'); v=np.zeros(N); v[:min(N,len(narr))]=narr[:N]
m=np.zeros(N); rng=np.random.default_rng(3)
def note(f,st,dur,amp):
    i0=int(st*SR); n=int(dur*SR); tt=np.arange(n)/SR
    s=(np.sin(2*np.pi*f*tt)+0.35*np.sin(2*np.pi*2*f*tt)+0.12*np.sin(2*np.pi*3*f*tt))*np.exp(-tt*2.6)*np.minimum(1,tt*200)
    e=min(N,i0+n); m[i0:e]+=amp*s[:e-i0]
# soft piano arpeggio Am - F - C - G (2.5 s each)
ch=[[220,261.6,329.6],[174.6,220,261.6],[196,261.6,329.6],[196,246.9,293.7]]
for ci,c in enumerate(ch):
    b=ci*2.55
    for k,st in enumerate([0,0.42,0.85,1.27,1.7,2.12]):
        note(c[k%3]*(2 if k%3==2 and k>2 else 1),b+st,1.6,0.05)
    for f in c: # pad
        i0=int(b*SR); n=int(2.9*SR); tt=np.arange(n)/SR; env=np.sin(np.pi*np.minimum(tt/2.9,1))**2
        e=min(N,i0+n); m[i0:e]+=0.018*(np.sin(2*np.pi*f/2*tt)+0.5*np.sin(2*np.pi*f*1.003*tt))[:e-i0]*env[:e-i0]
# bubble: airy whoosh + glassy chime
def bub(st):
    i0=int(st*SR); n=int(0.9*SR); tt=np.arange(n)/SR
    nz=rng.standard_normal(n); nz=np.convolve(nz,np.ones(30)/30,'same')
    w=nz*np.sin(np.pi*np.minimum(tt/0.9,1))**2*0.35
    c=sum(np.sin(2*np.pi*f*tt)*np.exp(-tt*5) for f in (1318.5,1975.5,2637))*0.05*np.minimum(1,tt*300)
    e=min(N,i0+n); m[i0:e]+=(w+c)[:e-i0]
for st in (3.25,5.3): bub(st)
# cut swoosh into facepalm + low thud on the last line
i0=int(8.2*SR); n=int(0.4*SR); tt=np.arange(n)/SR; m[i0:i0+n]+=np.sin(2*np.pi*(70-40*tt)*tt)*np.exp(-tt*9)*0.25
# duck music under voice
env=np.convolve(np.abs(v),np.ones(4800)/4800,'same'); duck=1-0.45*np.clip(env/0.05,0,1)
out=v*1.0+m*duck
fade=np.ones(N); fn=int(0.4*SR); fade[-fn:]=np.linspace(1,0,fn); out*=fade
out=out/max(1e-6,np.abs(out).max())*0.89
w=wave.open('final_mix.wav','wb'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((out*32767).astype(np.int16).tobytes()); w.close()
print('ok')
