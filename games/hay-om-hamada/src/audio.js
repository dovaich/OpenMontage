// Tiny WebAudio synth: engine hum, horn, bonk, cash, explosion, whoosh, goal cheer. No files needed.
export class Sound {
  constructor() { this.ctx = null; this.on = true; this.engine = null; }
  start() {
    if (this.ctx) { this.ctx.resume?.(); return; }
    try { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch { this.ctx = null; return; }
    const c = this.ctx; this.master = c.createGain(); this.master.gain.value = 0.55; this.master.connect(c.destination);
    // engine: two detuned saws through a low-pass
    const o1 = c.createOscillator(), o2 = c.createOscillator(), f = c.createBiquadFilter(), g = c.createGain();
    o1.type = 'sawtooth'; o2.type = 'square'; o2.detune.value = -1200; f.type = 'lowpass'; f.frequency.value = 400; g.gain.value = 0;
    o1.connect(f); o2.connect(f); f.connect(g); g.connect(this.master); o1.start(); o2.start();
    this.engine = { o1, o2, f, g };
    // street ambience: filtered noise
    const n = this.noiseBuf(2); const src = c.createBufferSource(); src.buffer = n; src.loop = true; const nf = c.createBiquadFilter(); nf.type = 'bandpass'; nf.frequency.value = 500; nf.Q.value = 0.4; const ng = c.createGain(); ng.gain.value = 0.025; src.connect(nf); nf.connect(ng); ng.connect(this.master); src.start(); this.amb = ng;
  }
  suspend() { try { this.ctx?.suspend(); } catch { /* */ } }
  resume() { try { this.ctx?.resume(); } catch { /* */ } }
  noiseBuf(sec) { const c = this.ctx, b = c.createBuffer(1, c.sampleRate * sec, c.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; return b; }
  setEngine(active, speed, kind) {
    if (!this.ctx || !this.engine) return; const t = this.ctx.currentTime, e = this.engine;
    const base = kind === 'tuk' ? 70 : kind === 'bus' || kind === 'truck' ? 38 : 50;
    e.o1.frequency.setTargetAtTime(base + Math.abs(speed) * (kind === 'tuk' ? 6 : 4.2), t, 0.1); e.o2.frequency.setTargetAtTime(base + Math.abs(speed) * 4, t, 0.1);
    e.f.frequency.setTargetAtTime(300 + Math.abs(speed) * 40, t, 0.1);
    e.g.gain.setTargetAtTime(active && this.on ? 0.08 + Math.min(0.08, Math.abs(speed) * 0.004) : 0, t, 0.15);
  }
  tone(freq, dur, type = 'square', vol = 0.15, slide = 0, delay = 0) {
    if (!this.ctx || !this.on) return; const c = this.ctx, t = c.currentTime + delay;
    const o = c.createOscillator(), g = c.createGain(); o.type = type; o.frequency.setValueAtTime(freq, t); if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(20, freq + slide), t + dur);
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur); o.connect(g); g.connect(this.master); o.start(t); o.stop(t + dur + 0.02);
  }
  noise(dur, freq = 800, vol = 0.3, delay = 0) {
    if (!this.ctx || !this.on) return; const c = this.ctx, t = c.currentTime + delay;
    const s = c.createBufferSource(); s.buffer = this.noiseBuf(dur + 0.05); const f = c.createBiquadFilter(); f.type = 'lowpass'; f.frequency.setValueAtTime(freq, t); f.frequency.exponentialRampToValueAtTime(60, t + dur);
    const g = c.createGain(); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur); s.connect(f); f.connect(g); g.connect(this.master); s.start(t); s.stop(t + dur + 0.05);
  }
  horn(kind) { const f = kind === 'tuk' ? 620 : kind === 'bus' || kind === 'truck' ? 220 : 400; this.tone(f, 0.35, 'square', 0.12); this.tone(f * 1.26, 0.35, 'square', 0.08); }
  bonk() { this.tone(520, 0.18, 'triangle', 0.25, -380); this.noise(0.08, 2000, 0.15); }
  crash(v) { this.noise(0.35, 1400, Math.min(0.5, 0.15 + v * 0.02)); this.tone(90, 0.25, 'sawtooth', 0.12, -40); }
  cash() { this.tone(988, 0.08, 'square', 0.1); this.tone(1319, 0.25, 'square', 0.1, 0, 0.08); }
  pickup() { this.tone(660, 0.07, 'square', 0.1); this.tone(880, 0.07, 'square', 0.1, 0, 0.07); this.tone(1320, 0.15, 'square', 0.1, 0, 0.14); }
  boom() { this.noise(1.4, 900, 0.6); this.tone(60, 1.0, 'sawtooth', 0.25, -30); }
  whoosh() { this.noise(0.5, 3000, 0.12); }
  jingle(good = true) { const seq = good ? [523, 659, 784, 1047] : [392, 330, 262, 196]; seq.forEach((f, i) => this.tone(f, 0.18, 'square', 0.1, 0, i * 0.12)); }
  cheer() { this.noise(1.2, 2500, 0.2); this.jingle(true); }
  blip() { this.tone(1200, 0.04, 'square', 0.06); }
}
