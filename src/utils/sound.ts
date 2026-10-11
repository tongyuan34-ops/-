/**
 * Web Audio API synthesizer for ambient study sounds & focus alerts
 */

class SoundSynthesizer {
  private ctx: AudioContext | null = null;
  private currentSourceNodes: { [key: string]: any } = {};
  private activeSound: string = 'none';
  private gainNode: GainNode | null = null;
  private volume: number = 0.5;

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.gainNode && this.ctx) {
      this.gainNode.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }
  }

  public stopAmbient() {
    if (this.gainNode && this.ctx) {
      this.gainNode.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.3);
    }
    setTimeout(() => {
      Object.values(this.currentSourceNodes).forEach((node: any) => {
        try {
          if (node.stop) node.stop();
          if (node.disconnect) node.disconnect();
          if (node.intervalId) clearInterval(node.intervalId);
        } catch {
          // ignore
        }
      });
      this.currentSourceNodes = {};
      this.activeSound = 'none';
    }, 350);
  }

  public playAmbient(type: string) {
    this.initCtx();
    if (!this.ctx) return;

    if (this.activeSound === type) return;
    this.stopAmbient();

    if (type === 'none') {
      this.activeSound = 'none';
      return;
    }

    this.activeSound = type;
    const now = this.ctx.currentTime;

    this.gainNode = this.ctx.createGain();
    this.gainNode.gain.setValueAtTime(0.001, now);
    this.gainNode.gain.linearRampToValueAtTime(this.volume, now + 1);
    this.gainNode.connect(this.ctx.destination);

    if (type === 'rain') {
      this.playRain(this.gainNode);
    } else if (type === 'white_noise') {
      this.playDeepNoise(this.gainNode);
    } else if (type === 'library_clock') {
      this.playLibraryClock(this.gainNode);
    } else if (type === 'temple_bell') {
      this.playTempleChimes(this.gainNode);
    } else if (type === 'fireplace') {
      this.playFireplace(this.gainNode);
    }
  }

  private playRain(destination: GainNode) {
    if (!this.ctx) return;
    const bufferSize = 2 * this.ctx.sampleRate;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.1;
      b6 = white * 0.115926;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 900;

    whiteNoise.connect(filter);
    filter.connect(destination);
    whiteNoise.start();

    this.currentSourceNodes['rainSource'] = whiteNoise;
  }

  private playDeepNoise(destination: GainNode) {
    if (!this.ctx) return;
    const bufferSize = 2 * this.ctx.sampleRate;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + 0.02 * white) / 1.02;
      lastOut = output[i];
      output[i] *= 3.5;
    }

    const brownNoise = this.ctx.createBufferSource();
    brownNoise.buffer = noiseBuffer;
    brownNoise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 450;

    brownNoise.connect(filter);
    filter.connect(destination);
    brownNoise.start();

    this.currentSourceNodes['deepNoise'] = brownNoise;
  }

  private playLibraryClock(destination: GainNode) {
    if (!this.ctx) return;
    const intervalId = window.setInterval(() => {
      if (!this.ctx || this.activeSound !== 'library_clock') return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(620, now);
      osc.frequency.exponentialRampToValueAtTime(120, now + 0.04);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      osc.connect(gain);
      gain.connect(destination);
      osc.start(now);
      osc.stop(now + 0.05);
    }, 1000);

    this.currentSourceNodes['clockInterval'] = { intervalId };
  }

  private playTempleChimes(destination: GainNode) {
    if (!this.ctx) return;

    const triggerChime = () => {
      if (!this.ctx || this.activeSound !== 'temple_bell') return;
      const now = this.ctx.currentTime;
      const freqs = [329.63, 659.25, 987.77, 1318.51]; // E4 harmonic series

      freqs.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq + (Math.random() - 0.5) * 1.5, now);

        const amp = 0.15 / (idx + 1);
        g.gain.setValueAtTime(amp, now);
        g.gain.exponentialRampToValueAtTime(0.0001, now + 4.5);

        osc.connect(g);
        g.connect(destination);
        osc.start(now);
        osc.stop(now + 5);
      });
    };

    triggerChime();
    const intervalId = window.setInterval(triggerChime, 8000);
    this.currentSourceNodes['chimeInterval'] = { intervalId };
  }

  private playFireplace(destination: GainNode) {
    if (!this.ctx) return;
    // Low rumble
    const bufferSize = 2 * this.ctx.sampleRate;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * 0.2;
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 280;

    noise.connect(filter);
    filter.connect(destination);
    noise.start();
    this.currentSourceNodes['fireNoise'] = noise;

    // Crackle ticks
    const intervalId = window.setInterval(() => {
      if (!this.ctx || this.activeSound !== 'fireplace') return;
      if (Math.random() > 0.4) {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(1400 + Math.random() * 1200, now);
        g.gain.setValueAtTime(0.12, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.02);
        osc.connect(g);
        g.connect(destination);
        osc.start(now);
        osc.stop(now + 0.03);
      }
    }, 180);

    this.currentSourceNodes['fireCrackle'] = { intervalId };
  }

  public playDistractionWarning() {
    this.initCtx();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(330, now + 0.35);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.4);
  }

  public playCompletionChime() {
    this.initCtx();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const chord = [523.25, 659.25, 783.99, 1046.50]; // C Major chord

    chord.forEach((freq, i) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.12);

      gain.gain.setValueAtTime(0.15, now + i * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.12 + 3);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + i * 0.12);
      osc.stop(now + i * 0.12 + 3.2);
    });
  }

  public playBreakChime() {
    this.initCtx();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const notes = [440, 554.37, 659.25]; // A Major gentle triad
    notes.forEach((freq, i) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + i * 0.18);
      gain.gain.setValueAtTime(0.12, now + i * 0.18);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.18 + 2.5);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + i * 0.18);
      osc.stop(now + i * 0.18 + 2.6);
    });
  }
}

export const soundManager = new SoundSynthesizer();
