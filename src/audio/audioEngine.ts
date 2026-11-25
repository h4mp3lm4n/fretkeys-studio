import { midiToFreq } from '../theory/musicTheory';

export type InstrumentTimbre =
  | 'guitar'
  | 'nylon'
  | 'piano'
  | 'epiano'
  | 'warmPad'
  | 'strings'
  | 'organ';

export type DrumKitId = 'acoustic' | 'jazz' | 'funk' | 'boombap' | 'electronic' | 'woodblock';
export type DrumPiece =
  | 'kick'
  | 'snare'
  | 'hihatClosed'
  | 'hihatOpen'
  | 'ride'
  | 'rim'
  | 'tomHigh'
  | 'tomLow'
  | 'accentClick'
  | 'normalClick';

class StudioAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private compressor: DynamicsCompressorNode | null = null;
  private reverbNode: ConvolverNode | null = null;
  private reverbSend: GainNode | null = null;
  private hallReverbNode: ConvolverNode | null = null;
  private hallSend: GainNode | null = null;
  private noiseBuffer: AudioBuffer | null = null;
  private pinkNoiseBuffer: AudioBuffer | null = null;
  private activeDroneNodes: Map<number, { stop: () => void }> = new Map();

  public getContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();

      this.compressor = this.ctx.createDynamicsCompressor();
      this.compressor.threshold.value = -12;
      this.compressor.knee.value = 16;
      this.compressor.ratio.value = 3.5;
      this.compressor.attack.value = 0.005;
      this.compressor.release.value = 0.15;

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.85;

      this.compressor.connect(this.masterGain);
      this.masterGain.connect(this.ctx.destination);

      // Tight studio wood room reverb (0.75s)
      this.reverbNode = this.ctx.createConvolver();
      this.reverbNode.buffer = this.createRoomIR(this.ctx, 0.75, 2.8, 0.72);
      this.reverbSend = this.ctx.createGain();
      this.reverbSend.gain.value = 0.22;
      this.reverbSend.connect(this.reverbNode);
      this.reverbNode.connect(this.compressor);

      // Lush concert hall reverb for Pads & Strings (2.2s)
      this.hallReverbNode = this.ctx.createConvolver();
      this.hallReverbNode.buffer = this.createRoomIR(this.ctx, 2.2, 2.2, 0.82);
      this.hallSend = this.ctx.createGain();
      this.hallSend.gain.value = 0.34;
      this.hallSend.connect(this.hallReverbNode);
      this.hallReverbNode.connect(this.compressor);

      this.noiseBuffer = this.createNoiseBuffer(this.ctx, 2.0, false);
      this.pinkNoiseBuffer = this.createNoiseBuffer(this.ctx, 2.0, true);
    }

    if (this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }
    return this.ctx;
  }

  public setMasterVolume(vol: number) {
    this.getContext();
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(Math.max(0, Math.min(1.5, vol)), this.ctx.currentTime, 0.02);
    }
  }

  private createRoomIR(ctx: AudioContext, duration: number, decay: number, damping: number): AudioBuffer {
    const length = Math.floor(ctx.sampleRate * duration);
    const buffer = ctx.createBuffer(2, length, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const data = buffer.getChannelData(ch);
      let lp = 0;
      for (let i = 0; i < length; i++) {
        const t = i / length;
        const env = Math.pow(1 - t, decay);
        const white = (Math.random() * 2 - 1) * env;
        lp = lp * damping + white * (1 - damping);
        data[i] = lp * 0.85;
      }
    }
    return buffer;
  }

  private createNoiseBuffer(ctx: AudioContext, duration: number, pink: boolean): AudioBuffer {
    const length = Math.floor(ctx.sampleRate * duration);
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    if (!pink) {
      for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;
      return buffer;
    }
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < length; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
      b6 = white * 0.115926;
    }
    return buffer;
  }

  private getOutputNode(): AudioNode {
    this.getContext();
    return this.compressor!;
  }

  public playNote(
    midi: number,
    options: {
      time?: number;
      duration?: number;
      velocity?: number;
      timbre?: InstrumentTimbre;
    } = {}
  ) {
    const ctx = this.getContext();
    const t = options.time ?? ctx.currentTime;
    const duration = options.duration ?? 1.5;
    const velocity = Math.max(0.05, Math.min(1, options.velocity ?? 0.72));
    const timbre = options.timbre ?? 'guitar';
    const freq = midiToFreq(midi);

    switch (timbre) {
      case 'piano':
        this.synthPianoNote(ctx, freq, t, duration, velocity);
        break;
      case 'epiano':
        this.synthEPianoNote(ctx, freq, t, duration, velocity);
        break;
      case 'warmPad':
        this.synthWarmPadNote(ctx, freq, t, duration, velocity);
        break;
      case 'strings':
        this.synthStringsNote(ctx, freq, t, duration, velocity);
        break;
      case 'organ':
        this.synthOrganNote(ctx, freq, t, duration, velocity);
        break;
      case 'nylon':
        this.synthGuitarNote(ctx, freq, t, duration, velocity, true);
        break;
      default:
        this.synthGuitarNote(ctx, freq, t, duration, velocity, false);
        break;
    }
  }

  public playChord(
    midiNotes: number[],
    options: {
      time?: number;
      duration?: number;
      velocity?: number;
      timbre?: InstrumentTimbre;
      strumMs?: number;
    } = {}
  ) {
    const ctx = this.getContext();
    const baseTime = options.time ?? ctx.currentTime;
    const timbre = options.timbre ?? 'guitar';
    const isSustained = timbre === 'warmPad' || timbre === 'strings' || timbre === 'organ';
    const defaultStrum = isSustained ? 8 : timbre === 'piano' || timbre === 'epiano' ? 14 : 26;
    const strumSec = (options.strumMs ?? defaultStrum) / 1000;
    const sorted = [...midiNotes].sort((a, b) => a - b);
    const scaleFactor = isSustained ? 0.56 : sorted.length > 4 ? 0.62 : 0.75;
    const perNoteVel = (options.velocity ?? 0.72) * scaleFactor;

    sorted.forEach((m, idx) => {
      this.playNote(m, {
        time: baseTime + idx * strumSec,
        duration: options.duration ?? (isSustained ? 2.4 : 1.8),
        velocity: perNoteVel * (0.94 + Math.random() * 0.08),
        timbre,
      });
    });
  }

  /**
   * Ultra-Soft Velvet Warm Pad – pure warm sine/triangle chorus with silky lowpass (zero harsh saw buzz).
   */
  private synthWarmPadNote(ctx: AudioContext, freq: number, t: number, duration: number, velocity: number) {
    const out = this.getOutputNode();
    const attack = Math.min(0.45, duration * 0.3);
    const release = 0.85;
    const holdEnd = t + Math.max(duration, 0.55);

    // Gentle 2-stage silky lowpass filter (24dB/oct feel, zero harsh resonance)
    const lp1 = ctx.createBiquadFilter();
    lp1.type = 'lowpass';
    lp1.Q.value = 0.5;
    lp1.frequency.setValueAtTime(Math.min(1150, Math.max(320, freq * 2.1)), t);
    lp1.frequency.linearRampToValueAtTime(Math.min(1600, Math.max(460, freq * 2.9)), t + attack * 1.3);
    lp1.frequency.linearRampToValueAtTime(Math.min(950, Math.max(320, freq * 1.9)), holdEnd);

    const lp2 = ctx.createBiquadFilter();
    lp2.type = 'lowpass';
    lp2.Q.value = 0.5;
    lp2.frequency.value = Math.min(1450, Math.max(520, freq * 2.6));

    const env = ctx.createGain();
    const peak = velocity * 0.28;
    env.gain.setValueAtTime(0.0001, t);
    env.gain.linearRampToValueAtTime(peak, t + attack);
    env.gain.setValueAtTime(peak * 0.94, holdEnd);
    env.gain.exponentialRampToValueAtTime(0.0008, holdEnd + release);

    const voices: Array<{ mult: number; detune: number; type: OscillatorType; amp: number }> = [
      { mult: 1, detune: -6, type: 'sine', amp: 0.44 },
      { mult: 1, detune: 6, type: 'sine', amp: 0.44 },
      { mult: 1, detune: 0, type: 'triangle', amp: 0.24 },
      { mult: 2, detune: 4, type: 'sine', amp: 0.11 },
      { mult: 0.5, detune: -2, type: 'sine', amp: 0.18 },
    ];
    voices.forEach(v => {
      const osc = ctx.createOscillator();
      osc.type = v.type;
      osc.frequency.setValueAtTime(freq * v.mult, t);
      osc.detune.setValueAtTime(v.detune, t);
      const g = ctx.createGain();
      g.gain.value = v.amp;
      osc.connect(g);
      g.connect(lp1);
      osc.start(t);
      osc.stop(holdEnd + release + 0.06);
    });

    lp1.connect(lp2);
    lp2.connect(env);
    env.connect(out);
    if (this.hallSend) env.connect(this.hallSend);
  }

  /**
   * Warm Bowed Orchestral Strings Ensemble – woody violin/cello formant sculpting,
   * steep harmonic rolloff (eliminating buzzy saw-synth edge), gentle ensemble vibrato & breathy bow rosins.
   */
  private synthStringsNote(ctx: AudioContext, freq: number, t: number, duration: number, velocity: number) {
    const out = this.getOutputNode();
    const attack = Math.min(0.38, duration * 0.28);
    const release = 0.72;
    const holdEnd = t + Math.max(duration, 0.5);

    // Delayed natural string vibrato (fades in gently after bow attack)
    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 5.4;
    const lfoGain = ctx.createGain();
    lfoGain.gain.setValueAtTime(0.001, t);
    lfoGain.gain.linearRampToValueAtTime(freq * 0.0055, t + attack + 0.25);
    lfo.connect(lfoGain);

    // Dual-stage steep lowpass so upper saw harmonics never sound buzzy/electronic
    const lp1 = ctx.createBiquadFilter();
    lp1.type = 'lowpass';
    lp1.Q.value = 0.55;
    lp1.frequency.setValueAtTime(Math.min(1800, Math.max(550, freq * 2.8)), t);
    lp1.frequency.linearRampToValueAtTime(Math.min(2400, Math.max(750, freq * 3.8)), t + attack);

    const lp2 = ctx.createBiquadFilter();
    lp2.type = 'lowpass';
    lp2.Q.value = 0.5;
    lp2.frequency.value = Math.min(2200, Math.max(820, freq * 3.5));

    // Violin/Cello wooden body formants (warm 280Hz body + 680Hz bridge resonance, slight scoop at 1.4kHz)
    const woodBody = ctx.createBiquadFilter();
    woodBody.type = 'peaking';
    woodBody.frequency.value = freq < 220 ? 240 : 440;
    woodBody.Q.value = 1.1;
    woodBody.gain.value = 4.0;

    const nasalCut = ctx.createBiquadFilter();
    nasalCut.type = 'peaking';
    nasalCut.frequency.value = 1550;
    nasalCut.Q.value = 1.2;
    nasalCut.gain.value = -4.5;

    const env = ctx.createGain();
    const peak = velocity * 0.26;
    env.gain.setValueAtTime(0.0001, t);
    env.gain.linearRampToValueAtTime(peak, t + attack);
    env.gain.setValueAtTime(peak * 0.94, holdEnd);
    env.gain.exponentialRampToValueAtTime(0.0008, holdEnd + release);

    // Blend warm triangle core with softly detuned filtered bowed partials
    const ensemble: Array<{ type: OscillatorType; detune: number; amp: number; mult: number }> = [
      { type: 'triangle', detune: -5, amp: 0.36, mult: 1 },
      { type: 'triangle', detune: 5, amp: 0.36, mult: 1 },
      { type: 'sawtooth', detune: -9, amp: 0.14, mult: 1 },
      { type: 'sawtooth', detune: 9, amp: 0.14, mult: 1 },
      { type: 'sine', detune: 2, amp: 0.18, mult: 2 },
    ];

    ensemble.forEach(v => {
      const osc = ctx.createOscillator();
      osc.type = v.type;
      osc.frequency.setValueAtTime(freq * v.mult, t);
      osc.detune.setValueAtTime(v.detune, t);
      lfoGain.connect(osc.frequency);
      const g = ctx.createGain();
      g.gain.value = v.amp;
      osc.connect(g);
      g.connect(lp1);
      osc.start(t);
      osc.stop(holdEnd + release + 0.06);
    });

    // Subtle bow hair breathiness
    if (this.pinkNoiseBuffer) {
      const bow = ctx.createBufferSource();
      bow.buffer = this.pinkNoiseBuffer;
      bow.loop = true;
      const bp = ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.value = Math.min(2600, freq * 3.2 + 400);
      bp.Q.value = 2.4;
      const bg = ctx.createGain();
      bg.gain.setValueAtTime(0.0001, t);
      bg.gain.linearRampToValueAtTime(velocity * 0.025, t + attack * 0.7);
      bg.gain.setValueAtTime(velocity * 0.015, holdEnd);
      bg.gain.exponentialRampToValueAtTime(0.0001, holdEnd + 0.25);
      bow.connect(bp);
      bp.connect(bg);
      bg.connect(env);
      bow.start(t);
      bow.stop(holdEnd + 0.3);
    }

    lp1.connect(lp2);
    lp2.connect(woodBody);
    woodBody.connect(nasalCut);
    nasalCut.connect(env);
    env.connect(out);
    if (this.hallSend) env.connect(this.hallSend);

    lfo.start(t);
    lfo.stop(holdEnd + release + 0.06);
  }

  /**
   * Warm Jazz / Gospel Drawbar Organ – instant sustained organ harmonics, zero decay while held.
   */
  private synthOrganNote(ctx: AudioContext, freq: number, t: number, duration: number, velocity: number) {
    const out = this.getOutputNode();
    const holdEnd = t + Math.max(duration, 0.3);
    const release = 0.14;

    const env = ctx.createGain();
    const peak = velocity * 0.25;
    env.gain.setValueAtTime(0.0001, t);
    env.gain.linearRampToValueAtTime(peak, t + 0.015);
    env.gain.setValueAtTime(peak * 0.95, holdEnd);
    env.gain.exponentialRampToValueAtTime(0.0008, holdEnd + release);

    const drawbars = [
      { mult: 0.5, amp: 0.35 },
      { mult: 1, amp: 0.65 },
      { mult: 2, amp: 0.32 },
      { mult: 3, amp: 0.18 },
      { mult: 4, amp: 0.11 },
    ];
    drawbars.forEach(d => {
      if (freq * d.mult > 10000) return;
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq * d.mult, t);
      const g = ctx.createGain();
      g.gain.value = d.amp;
      osc.connect(g);
      g.connect(env);
      osc.start(t);
      osc.stop(holdEnd + release + 0.04);
    });

    env.connect(out);
    if (this.reverbSend) env.connect(this.reverbSend);
  }

  /**
   * Upgraded Plucked Guitar (Electric Clean & Warm Nylon Acoustic) with body resonance EQ.
   */
  private synthGuitarNote(ctx: AudioContext, freq: number, t: number, duration: number, velocity: number, isNylon: boolean) {
    const out = this.getOutputNode();
    const voiceGain = ctx.createGain();

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.Q.value = isNylon ? 0.9 : 1.5;

    const brightStart = Math.min(9500, freq * (isNylon ? 4.8 : 8.5) * (0.65 + velocity * 0.55));
    const warmEnd = Math.max(280, freq * (isNylon ? 1.65 : 2.3));
    filter.frequency.setValueAtTime(brightStart, t);
    filter.frequency.exponentialRampToValueAtTime(warmEnd, t + Math.min(duration * 0.72, 0.85));

    // Acoustic wood / electric cab body warmth
    const body = ctx.createBiquadFilter();
    body.type = 'peaking';
    body.frequency.value = isNylon ? 210 : 380;
    body.Q.value = 1.2;
    body.gain.value = isNylon ? 4.5 : 2.5;

    const osc1 = ctx.createOscillator();
    osc1.type = isNylon ? 'triangle' : 'sawtooth';
    osc1.frequency.setValueAtTime(freq, t);

    const osc2 = ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(freq * 2, t);
    osc2.detune.setValueAtTime(1.5, t);

    const osc3 = ctx.createOscillator();
    osc3.type = 'triangle';
    osc3.frequency.setValueAtTime(freq * 3, t);

    const g1 = ctx.createGain();
    g1.gain.value = isNylon ? 0.84 : 0.48;
    const g2 = ctx.createGain();
    g2.gain.value = isNylon ? 0.28 : 0.30;
    const g3 = ctx.createGain();
    g3.gain.value = isNylon ? 0.08 : 0.14;

    osc1.connect(g1);
    osc2.connect(g2);
    osc3.connect(g3);
    g1.connect(filter);
    g2.connect(filter);
    g3.connect(filter);

    if (this.pinkNoiseBuffer) {
      const pluck = ctx.createBufferSource();
      pluck.buffer = this.pinkNoiseBuffer;
      const pluckBp = ctx.createBiquadFilter();
      pluckBp.type = 'bandpass';
      pluckBp.frequency.value = Math.min(3600, freq * 4.5 + 300);
      pluckBp.Q.value = 1.8;
      const pluckGain = ctx.createGain();
      pluckGain.gain.setValueAtTime(velocity * (isNylon ? 0.12 : 0.2), t);
      pluckGain.gain.exponentialRampToValueAtTime(0.0008, t + 0.024);
      pluck.connect(pluckBp);
      pluckBp.connect(pluckGain);
      pluckGain.connect(voiceGain);
      pluck.start(t);
      pluck.stop(t + 0.032);
    }

    const peak = velocity * 0.36;
    voiceGain.gain.setValueAtTime(0.0001, t);
    voiceGain.gain.linearRampToValueAtTime(peak, t + 0.006);
    voiceGain.gain.exponentialRampToValueAtTime(peak * 0.44, t + Math.min(0.4, duration * 0.38));
    voiceGain.gain.exponentialRampToValueAtTime(0.0008, t + duration);

    filter.connect(body);
    body.connect(voiceGain);
    voiceGain.connect(out);
    if (this.reverbSend) voiceGain.connect(this.reverbSend);

    osc1.start(t);
    osc2.start(t);
    osc3.start(t);
    osc1.stop(t + duration + 0.05);
    osc2.stop(t + duration + 0.05);
    osc3.stop(t + duration + 0.05);
  }

  /**
   * Upgraded Warm Concert Grand Piano.
   */
  private synthPianoNote(ctx: AudioContext, freq: number, t: number, duration: number, velocity: number) {
    const out = this.getOutputNode();
    const voiceGain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.Q.value = 0.65;

    const cutoffPeak = Math.min(11000, freq * (3.8 + velocity * 6.5));
    filter.frequency.setValueAtTime(cutoffPeak, t);
    filter.frequency.exponentialRampToValueAtTime(Math.max(360, freq * 1.9), t + Math.min(1.6, duration));

    const partials: Array<{ mult: number; amp: number; detune: number; type: OscillatorType }> = [
      { mult: 1, amp: 0.66, detune: -1.1, type: 'triangle' },
      { mult: 1, amp: 0.46, detune: 1.2, type: 'sine' },
      { mult: 2, amp: 0.26, detune: 0.6, type: 'sine' },
      { mult: 3, amp: 0.12, detune: 2.0, type: 'sine' },
      { mult: 4, amp: 0.05, detune: -1.4, type: 'sine' },
    ];

    partials.forEach(p => {
      if (freq * p.mult > 13000) return;
      const osc = ctx.createOscillator();
      osc.type = p.type;
      osc.frequency.setValueAtTime(freq * p.mult, t);
      osc.detune.setValueAtTime(p.detune, t);
      const g = ctx.createGain();
      g.gain.value = p.amp;
      osc.connect(g);
      g.connect(filter);
      osc.start(t);
      osc.stop(t + duration + 0.07);
    });

    if (this.pinkNoiseBuffer) {
      const hammer = ctx.createBufferSource();
      hammer.buffer = this.pinkNoiseBuffer;
      const hp = ctx.createBiquadFilter();
      hp.type = 'bandpass';
      hp.frequency.value = Math.min(2800, freq * 3 + 380);
      hp.Q.value = 1.1;
      const hg = ctx.createGain();
      hg.gain.setValueAtTime(velocity * 0.14, t);
      hg.gain.exponentialRampToValueAtTime(0.0005, t + 0.02);
      hammer.connect(hp);
      hp.connect(hg);
      hg.connect(voiceGain);
      hammer.start(t);
      hammer.stop(t + 0.028);
    }

    const peak = velocity * 0.34;
    voiceGain.gain.setValueAtTime(0.0001, t);
    voiceGain.gain.linearRampToValueAtTime(peak, t + 0.005);
    voiceGain.gain.exponentialRampToValueAtTime(peak * 0.48, t + Math.min(0.5, duration * 0.45));
    voiceGain.gain.exponentialRampToValueAtTime(0.0008, t + duration);

    filter.connect(voiceGain);
    voiceGain.connect(out);
    if (this.reverbSend) voiceGain.connect(this.reverbSend);
  }

  /**
   * Warm Rhodes / Neo-Soul Electric Piano.
   */
  private synthEPianoNote(ctx: AudioContext, freq: number, t: number, duration: number, velocity: number) {
    const out = this.getOutputNode();
    const voiceGain = ctx.createGain();

    const body = ctx.createOscillator();
    body.type = 'sine';
    body.frequency.setValueAtTime(freq, t);

    const tine = ctx.createOscillator();
    tine.type = 'sine';
    tine.frequency.setValueAtTime(freq * 4, t);
    const tineGain = ctx.createGain();
    tineGain.gain.setValueAtTime(velocity * 0.17, t);
    tineGain.gain.exponentialRampToValueAtTime(0.001, t + 0.24);

    const warm2 = ctx.createOscillator();
    warm2.type = 'triangle';
    warm2.frequency.setValueAtTime(freq * 2, t);
    const warm2Gain = ctx.createGain();
    warm2Gain.gain.setValueAtTime(velocity * 0.13, t);
    warm2Gain.gain.exponentialRampToValueAtTime(0.005, t + Math.min(0.9, duration));

    body.connect(voiceGain);
    tine.connect(tineGain);
    tineGain.connect(voiceGain);
    warm2.connect(warm2Gain);
    warm2Gain.connect(voiceGain);

    const peak = velocity * 0.34;
    voiceGain.gain.setValueAtTime(0.0001, t);
    voiceGain.gain.linearRampToValueAtTime(peak, t + 0.008);
    voiceGain.gain.exponentialRampToValueAtTime(peak * 0.58, t + Math.min(0.55, duration * 0.5));
    voiceGain.gain.exponentialRampToValueAtTime(0.0008, t + duration);

    voiceGain.connect(out);
    if (this.reverbSend) voiceGain.connect(this.reverbSend);

    body.start(t);
    tine.start(t);
    warm2.start(t);
    body.stop(t + duration + 0.05);
    tine.stop(t + 0.26);
    warm2.stop(t + duration + 0.05);
  }

  public togglePitchPipeTone(midi: number, a4 = 440): boolean {
    if (this.activeDroneNodes.has(midi)) {
      this.stopPitchPipeTone(midi);
      return false;
    }
    const ctx = this.getContext();
    const out = this.getOutputNode();
    const freq = midiToFreq(midi, a4);
    const t = ctx.currentTime;

    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = Math.min(2800, freq * 4.5);

    const osc1 = ctx.createOscillator();
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(freq, t);

    const osc2 = ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(freq * 2, t);
    const osc2G = ctx.createGain();
    osc2G.gain.value = 0.25;

    const osc3 = ctx.createOscillator();
    osc3.type = 'sine';
    osc3.frequency.setValueAtTime(freq * 3, t);
    const osc3G = ctx.createGain();
    osc3G.gain.value = 0.09;

    osc1.connect(filter);
    osc2.connect(osc2G);
    osc2G.connect(filter);
    osc3.connect(osc3G);
    osc3G.connect(filter);
    filter.connect(gain);
    gain.connect(out);

    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.linearRampToValueAtTime(0.24, t + 0.06);

    osc1.start(t);
    osc2.start(t);
    osc3.start(t);

    this.activeDroneNodes.set(midi, {
      stop: () => {
        const now = ctx.currentTime;
        gain.gain.cancelScheduledValues(now);
        gain.gain.setValueAtTime(gain.gain.value, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);
        setTimeout(() => {
          try {
            osc1.stop();
            osc2.stop();
            osc3.stop();
          } catch {
            // already stopped
          }
        }, 100);
      },
    });
    return true;
  }

  public stopPitchPipeTone(midi: number) {
    const active = this.activeDroneNodes.get(midi);
    if (active) {
      active.stop();
      this.activeDroneNodes.delete(midi);
    }
  }

  public stopAllPitchPipes() {
    for (const key of Array.from(this.activeDroneNodes.keys())) {
      this.stopPitchPipeTone(key);
    }
  }

  /**
   * 6 Clearly Distinct Drum Kits (Acoustic Rock, Vintage Jazz Brush, Tight Piccolo Funk,
   * Dusty 90s Boom-Bap, Sub-Heavy 808/909 Electronic, and Organic Woodblock Metronome).
   */
  public playDrum(piece: DrumPiece, kit: DrumKitId = 'acoustic', velocity = 0.85, time?: number) {
    const ctx = this.getContext();
    const t = time ?? ctx.currentTime;
    const out = this.getOutputNode();
    const vel = Math.max(0.05, Math.min(1, velocity));

    if (piece === 'accentClick' || piece === 'normalClick') {
      this.synthWoodblock(ctx, out, t, piece === 'accentClick' ? 1240 : 840, vel * (piece === 'accentClick' ? 0.95 : 0.65));
      return;
    }

    if (kit === 'woodblock') {
      const freqMap: Record<string, number> = {
        kick: 380,
        snare: 760,
        hihatClosed: 1560,
        hihatOpen: 1840,
        ride: 1320,
        rim: 1020,
        tomHigh: 640,
        tomLow: 490,
      };
      this.synthWoodblock(ctx, out, t, freqMap[piece] ?? 800, vel * 0.85);
      return;
    }

    switch (piece) {
      case 'kick':
        this.synthKick(ctx, out, t, vel, kit);
        break;
      case 'snare':
        this.synthSnare(ctx, out, t, vel, kit);
        break;
      case 'hihatClosed':
        this.synthHiHat(ctx, out, t, vel, false, kit);
        break;
      case 'hihatOpen':
        this.synthHiHat(ctx, out, t, vel, true, kit);
        break;
      case 'ride':
        this.synthRide(ctx, out, t, vel, kit);
        break;
      case 'rim':
        this.synthRimshot(ctx, out, t, vel, kit);
        break;
      case 'tomHigh':
        this.synthTom(ctx, out, t, vel, kit === 'jazz' ? 230 : kit === 'electronic' ? 160 : 195);
        break;
      case 'tomLow':
        this.synthTom(ctx, out, t, vel, kit === 'jazz' ? 155 : kit === 'electronic' ? 92 : 118);
        break;
    }
  }

  private synthWoodblock(ctx: AudioContext, out: AudioNode, t: number, freq: number, vel: number) {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq * 1.07, t);
    osc.frequency.exponentialRampToValueAtTime(freq, t + 0.015);

    const osc2 = ctx.createOscillator();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(freq * 2.42, t);

    const g = ctx.createGain();
    g.gain.setValueAtTime(0.001, t);
    g.gain.linearRampToValueAtTime(vel * 0.55, t + 0.002);
    g.gain.exponentialRampToValueAtTime(0.0008, t + 0.075);

    const g2 = ctx.createGain();
    g2.gain.setValueAtTime(vel * 0.18, t);
    g2.gain.exponentialRampToValueAtTime(0.0005, t + 0.028);

    osc.connect(g);
    osc2.connect(g2);
    g2.connect(g);
    g.connect(out);
    if (this.reverbSend) g.connect(this.reverbSend);

    osc.start(t);
    osc2.start(t);
    osc.stop(t + 0.09);
    osc2.stop(t + 0.04);
  }

  private synthKick(ctx: AudioContext, out: AudioNode, t: number, vel: number, kit: DrumKitId) {
    const cfg = {
      acoustic:   { start: 165, end: 48, pitchTime: 0.06, decay: 0.32, clickFreq: 2600, clickAmp: 0.22, drive: 1.0 },
      funk:       { start: 195, end: 58, pitchTime: 0.04, decay: 0.18, clickFreq: 3400, clickAmp: 0.28, drive: 1.1 },
      jazz:       { start: 132, end: 74, pitchTime: 0.055, decay: 0.28, clickFreq: 950, clickAmp: 0.10, drive: 0.85 },
      boombap:    { start: 148, end: 44, pitchTime: 0.075, decay: 0.29, clickFreq: 1200, clickAmp: 0.24, drive: 1.3 },
      electronic: { start: 180, end: 36, pitchTime: 0.09, decay: 0.55, clickFreq: 4200, clickAmp: 0.06, drive: 1.2 },
      woodblock:  { start: 150, end: 50, pitchTime: 0.05, decay: 0.2, clickFreq: 1800, clickAmp: 0.1, drive: 1.0 },
    }[kit];

    const osc = ctx.createOscillator();
    osc.type = kit === 'boombap' ? 'triangle' : 'sine';
    osc.frequency.setValueAtTime(cfg.start, t);
    osc.frequency.exponentialRampToValueAtTime(cfg.end, t + cfg.pitchTime);

    const bodyGain = ctx.createGain();
    bodyGain.gain.setValueAtTime(0.001, t);
    bodyGain.gain.linearRampToValueAtTime(vel * 0.92 * cfg.drive, t + 0.003);
    bodyGain.gain.exponentialRampToValueAtTime(0.001, t + cfg.decay);

    // Warm lowpass on boom bap & jazz
    if (kit === 'boombap' || kit === 'jazz') {
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = kit === 'boombap' ? 420 : 580;
      osc.connect(lp);
      lp.connect(bodyGain);
    } else {
      osc.connect(bodyGain);
    }
    bodyGain.connect(out);

    // Acoustic beater click
    if (this.pinkNoiseBuffer && cfg.clickAmp > 0.05) {
      const click = ctx.createBufferSource();
      click.buffer = this.pinkNoiseBuffer;
      const bp = ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.value = cfg.clickFreq;
      bp.Q.value = 1.6;
      const cg = ctx.createGain();
      cg.gain.setValueAtTime(vel * cfg.clickAmp, t);
      cg.gain.exponentialRampToValueAtTime(0.001, t + 0.016);
      click.connect(bp);
      bp.connect(cg);
      cg.connect(out);
      click.start(t);
      click.stop(t + 0.022);
    }

    osc.start(t);
    osc.stop(t + cfg.decay + 0.04);
  }

  private synthSnare(ctx: AudioContext, out: AudioNode, t: number, vel: number, kit: DrumKitId) {
    const cfg = {
      acoustic:   { shell: 192, shellAmp: 0.48, hp: 1100, peakFreq: 3200, peakGain: 3, wireAmp: 0.56, decay: 0.22, reverb: true },
      funk:       { shell: 278, shellAmp: 0.56, hp: 1900, peakFreq: 4600, peakGain: 6, wireAmp: 0.52, decay: 0.11, reverb: false },
      jazz:       { shell: 215, shellAmp: 0.18, hp: 2400, peakFreq: 3800, peakGain: 1, wireAmp: 0.34, decay: 0.26, reverb: true },
      boombap:    { shell: 158, shellAmp: 0.58, hp: 780,  peakFreq: 2100, peakGain: 5, wireAmp: 0.62, decay: 0.17, reverb: true },
      electronic: { shell: 175, shellAmp: 0.42, hp: 1500, peakFreq: 5200, peakGain: 4, wireAmp: 0.48, decay: 0.15, reverb: false },
      woodblock:  { shell: 220, shellAmp: 0.4,  hp: 1400, peakFreq: 3000, peakGain: 2, wireAmp: 0.4,  decay: 0.15, reverb: false },
    }[kit];

    // Shell resonance
    const shell = ctx.createOscillator();
    shell.type = kit === 'boombap' ? 'sawtooth' : 'triangle';
    shell.frequency.setValueAtTime(cfg.shell * 1.48, t);
    shell.frequency.exponentialRampToValueAtTime(cfg.shell, t + 0.036);

    const shellLp = ctx.createBiquadFilter();
    shellLp.type = 'lowpass';
    shellLp.frequency.value = kit === 'boombap' ? 680 : 1800;

    const shellGain = ctx.createGain();
    shellGain.gain.setValueAtTime(vel * cfg.shellAmp, t);
    shellGain.gain.exponentialRampToValueAtTime(0.001, t + (kit === 'funk' ? 0.08 : 0.13));

    shell.connect(shellLp);
    shellLp.connect(shellGain);
    shellGain.connect(out);
    if (cfg.reverb && this.reverbSend) shellGain.connect(this.reverbSend);

    // Snare wires / brush swish
    const buf = kit === 'boombap' || kit === 'jazz' ? this.pinkNoiseBuffer : this.noiseBuffer;
    if (buf) {
      const noise = ctx.createBufferSource();
      noise.buffer = buf;

      const hp = ctx.createBiquadFilter();
      hp.type = 'highpass';
      hp.frequency.value = cfg.hp;

      const bodyEq = ctx.createBiquadFilter();
      bodyEq.type = 'peaking';
      bodyEq.frequency.value = cfg.peakFreq;
      bodyEq.gain.value = cfg.peakGain;

      const nGain = ctx.createGain();
      nGain.gain.setValueAtTime(0.001, t);
      nGain.gain.linearRampToValueAtTime(vel * cfg.wireAmp, t + (kit === 'jazz' ? 0.012 : 0.003));
      nGain.gain.exponentialRampToValueAtTime(0.001, t + cfg.decay);

      noise.connect(hp);
      hp.connect(bodyEq);
      bodyEq.connect(nGain);
      nGain.connect(out);
      if (cfg.reverb && this.reverbSend) nGain.connect(this.reverbSend);

      noise.start(t);
      noise.stop(t + cfg.decay + 0.03);
    }

    shell.start(t);
    shell.stop(t + 0.15);
  }

  private synthHiHat(ctx: AudioContext, out: AudioNode, t: number, vel: number, isOpen: boolean, kit: DrumKitId) {
    const decay = isOpen
      ? kit === 'jazz' ? 0.48 : kit === 'funk' ? 0.22 : 0.34
      : kit === 'funk' ? 0.034 : kit === 'boombap' ? 0.075 : kit === 'electronic' ? 0.05 : 0.058;

    const hpFreq = kit === 'boombap' ? 4200 : kit === 'electronic' ? 8200 : kit === 'jazz' ? 5200 : 6600;
    const ratios = kit === 'electronic' ? [310, 465, 512, 688, 920, 1210] : [263, 400, 421, 474, 587, 845];

    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = hpFreq;

    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = kit === 'boombap' ? 6400 : 9600;
    bp.Q.value = kit === 'boombap' ? 1.2 : 0.85;

    const env = ctx.createGain();
    env.gain.setValueAtTime(0.001, t);
    env.gain.linearRampToValueAtTime(vel * (isOpen ? 0.25 : 0.22), t + 0.002);
    env.gain.exponentialRampToValueAtTime(0.0008, t + decay);

    ratios.forEach(r => {
      const osc = ctx.createOscillator();
      osc.type = 'square';
      osc.frequency.value = r * 1.45;
      const g = ctx.createGain();
      g.gain.value = kit === 'boombap' ? 0.06 : 0.11;
      osc.connect(g);
      g.connect(hp);
      osc.start(t);
      osc.stop(t + decay + 0.02);
    });

    if (this.noiseBuffer) {
      const noise = ctx.createBufferSource();
      noise.buffer = this.noiseBuffer;
      const ng = ctx.createGain();
      ng.gain.value = kit === 'boombap' ? 0.68 : 0.55;
      noise.connect(ng);
      ng.connect(hp);
      noise.start(t);
      noise.stop(t + decay + 0.02);
    }

    hp.connect(bp);
    bp.connect(env);
    env.connect(out);
    if (this.reverbSend && isOpen) env.connect(this.reverbSend);
  }

  private synthRide(ctx: AudioContext, out: AudioNode, t: number, vel: number, kit: DrumKitId) {
    const decay = kit === 'jazz' ? 0.62 : 0.42;
    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = kit === 'jazz' ? 3200 : 4200;

    const env = ctx.createGain();
    env.gain.setValueAtTime(0.001, t);
    env.gain.linearRampToValueAtTime(vel * 0.28, t + 0.003);
    env.gain.exponentialRampToValueAtTime(0.0008, t + decay);

    const ping = ctx.createOscillator();
    ping.type = 'triangle';
    ping.frequency.value = kit === 'jazz' ? 2350 : 3100;
    const pingG = ctx.createGain();
    pingG.gain.setValueAtTime(vel * 0.13, t);
    pingG.gain.exponentialRampToValueAtTime(0.0005, t + 0.16);
    ping.connect(pingG);
    pingG.connect(out);
    ping.start(t);
    ping.stop(t + 0.18);

    [320, 487, 612, 795, 1020].forEach(f => {
      const osc = ctx.createOscillator();
      osc.type = 'square';
      osc.frequency.value = f * (kit === 'jazz' ? 1.85 : 2.2);
      const g = ctx.createGain();
      g.gain.value = 0.09;
      osc.connect(g);
      g.connect(hp);
      osc.start(t);
      osc.stop(t + decay + 0.02);
    });

    if (this.noiseBuffer) {
      const n = ctx.createBufferSource();
      n.buffer = this.noiseBuffer;
      const ng = ctx.createGain();
      ng.gain.value = 0.35;
      n.connect(ng);
      ng.connect(hp);
      n.start(t);
      n.stop(t + decay + 0.02);
    }

    hp.connect(env);
    env.connect(out);
    if (this.reverbSend) env.connect(this.reverbSend);
  }

  private synthRimshot(ctx: AudioContext, out: AudioNode, t: number, vel: number, kit: DrumKitId) {
    const pitch = kit === 'electronic' ? 1680 : kit === 'jazz' ? 490 : kit === 'boombap' ? 420 : 580;
    this.synthWoodblock(ctx, out, t, pitch, vel * 0.85);
    if (this.noiseBuffer) {
      const n = ctx.createBufferSource();
      n.buffer = this.noiseBuffer;
      const bp = ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.value = kit === 'electronic' ? 3200 : 2200;
      bp.Q.value = 3.2;
      const g = ctx.createGain();
      g.gain.setValueAtTime(vel * 0.26, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.03);
      n.connect(bp);
      bp.connect(g);
      g.connect(out);
      n.start(t);
      n.stop(t + 0.04);
    }
  }

  private synthTom(ctx: AudioContext, out: AudioNode, t: number, vel: number, baseFreq: number) {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(baseFreq * 1.45, t);
    osc.frequency.exponentialRampToValueAtTime(baseFreq, t + 0.075);
    const g = ctx.createGain();
    g.gain.setValueAtTime(vel * 0.65, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.28);
    osc.connect(g);
    g.connect(out);
    if (this.reverbSend) g.connect(this.reverbSend);
    osc.start(t);
    osc.stop(t + 0.32);
  }
}

export const audioEngine = new StudioAudioEngine();

/**
 * High-accuracy YIN-inspired Autocorrelation Pitch Detector for Guitar & Piano tuning.
 */
export function detectPitch(buffer: Float32Array, sampleRate: number): { freq: number; clarity: number } | null {
  const size = buffer.length;
  let rms = 0;
  for (let i = 0; i < size; i++) {
    rms += buffer[i] * buffer[i];
  }
  rms = Math.sqrt(rms / size);
  if (rms < 0.009) return null;

  const half = Math.floor(size / 2);
  const diff = new Float32Array(half);

  for (let tau = 0; tau < half; tau++) {
    let sum = 0;
    for (let i = 0; i < half; i++) {
      const d = buffer[i] - buffer[i + tau];
      sum += d * d;
    }
    diff[tau] = sum;
  }

  const cmndf = new Float32Array(half);
  cmndf[0] = 1;
  let runningSum = 0;
  for (let tau = 1; tau < half; tau++) {
    runningSum += diff[tau];
    cmndf[tau] = runningSum > 0 ? (diff[tau] * tau) / runningSum : 1;
  }

  const minTau = Math.max(2, Math.floor(sampleRate / 1400));
  const maxTau = Math.min(half - 2, Math.floor(sampleRate / 55));

  const threshold = 0.14;
  let bestTau = -1;
  for (let tau = minTau; tau < maxTau; tau++) {
    if (cmndf[tau] < threshold) {
      while (tau + 1 < maxTau && cmndf[tau + 1] < cmndf[tau]) {
        tau++;
      }
      bestTau = tau;
      break;
    }
  }

  if (bestTau === -1) return null;

  const s0 = cmndf[bestTau - 1];
  const s1 = cmndf[bestTau];
  const s2 = cmndf[bestTau + 1];
  const denom = 2 * (2 * s1 - s2 - s0);
  const betterTau = Math.abs(denom) > 1e-6 ? bestTau + (s2 - s0) / denom : bestTau;
  const freq = sampleRate / betterTau;

  if (freq < 50 || freq > 1500) return null;
  return { freq, clarity: Math.max(0, 1 - s1) };
}
