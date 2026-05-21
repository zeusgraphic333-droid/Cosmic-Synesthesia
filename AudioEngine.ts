export class AudioEngine {
  private context: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private dataArray: Uint8Array | null = null;
  
  private audioChaos: HTMLAudioElement | null = null;
  private audioOrder: HTMLAudioElement | null = null;
  
  private gainChaos: GainNode | null = null;
  private gainOrder: GainNode | null = null;
  
  private initialized = false;

  constructor() {}

  public async init(urlChaos: string = '/chaos.mp3', urlOrder: string = '/order.mp3') {
    if (this.initialized) return;

    this.context = new (window.AudioContext || (window as any).webkitAudioContext)();
    this.analyser = this.context.createAnalyser();
    this.analyser.fftSize = 512;
    this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);

    // Chaos Track
    this.audioChaos = new Audio(urlChaos);
    this.audioChaos.crossOrigin = 'anonymous';
    this.audioChaos.loop = true;
    const sourceChaos = this.context.createMediaElementSource(this.audioChaos);
    this.gainChaos = this.context.createGain();
    this.gainChaos.gain.value = 1.0;
    sourceChaos.connect(this.gainChaos);
    this.gainChaos.connect(this.analyser);

    // Order Track
    this.audioOrder = new Audio(urlOrder);
    this.audioOrder.crossOrigin = 'anonymous';
    this.audioOrder.loop = true;
    const sourceOrder = this.context.createMediaElementSource(this.audioOrder);
    this.gainOrder = this.context.createGain();
    this.gainOrder.gain.value = 0.0;
    sourceOrder.connect(this.gainOrder);
    this.gainOrder.connect(this.analyser);

    this.analyser.connect(this.context.destination);

    this.initialized = true;
  }

  public async play() {
    if (!this.initialized || !this.context) return;

    if (this.context.state === 'suspended') {
      await this.context.resume();
    }
    
    try {
      if (this.audioChaos) await this.audioChaos.play();
      if (this.audioOrder) await this.audioOrder.play();
    } catch (e) {
      console.warn('Audio play failed, requires interaction', e);
    }
  }

  public pause() {
    if (this.audioChaos) this.audioChaos.pause();
    if (this.audioOrder) this.audioOrder.pause();
  }

  // Crossfade between 0.0 (full chaos) and 1.0 (full order)
  public setMix(transition: number) {
    if (!this.gainChaos || !this.gainOrder) return;
    
    // Equal power crossfade
    const t = Math.max(0, Math.min(1, transition));
    this.gainChaos.gain.value = Math.cos(t * 0.5 * Math.PI);
    this.gainOrder.gain.value = Math.cos((1.0 - t) * 0.5 * Math.PI);
  }

  public getFrequencies() {
    if (!this.analyser || !this.dataArray) {
      return { bass: 0, mids: 0 };
    }

    this.analyser.getByteFrequencyData(this.dataArray);

    let bassSum = 0;
    let midsSum = 0;

    const bassStart = 0;
    const bassEnd = 4;
    const midsStart = 5;
    const midsEnd = 24;

    for (let i = bassStart; i <= bassEnd; i++) {
      bassSum += this.dataArray[i];
    }
    for (let i = midsStart; i <= midsEnd; i++) {
      midsSum += this.dataArray[i];
    }

    const bass = bassSum / (bassEnd - bassStart + 1) / 255.0;
    const mids = midsSum / (midsEnd - midsStart + 1) / 255.0;

    return { bass, mids };
  }
}
