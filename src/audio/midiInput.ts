import { audioEngine, InstrumentTimbre } from './audioEngine';

export interface MidiDeviceInfo {
  id: string;
  name: string;
  manufacturer: string;
}

export interface MidiNoteEvent {
  type: 'noteon' | 'noteoff';
  midi: number;
  velocity: number; // 0..1
  channel: number;
}

type StateListener = (state: MidiManagerSnapshot) => void;
type NoteListener = (event: MidiNoteEvent) => void;

export interface MidiManagerSnapshot {
  supported: boolean;
  connected: boolean;
  devices: MidiDeviceInfo[];
  activeNotes: number[]; // currently held MIDI note numbers
  monitorAudio: boolean;
  monitorTimbre: InstrumentTimbre;
  error: string | null;
}

class WebMidiInputManager {
  private access: MIDIAccess | null = null;
  private heldNotes = new Set<number>();
  private stateListeners = new Set<StateListener>();
  private noteListeners = new Set<NoteListener>();
  private monitorAudio = true;
  private monitorTimbre: InstrumentTimbre = 'piano';
  private error: string | null = null;
  private initialized = false;

  public isSupported(): boolean {
    return typeof navigator !== 'undefined' && typeof navigator.requestMIDIAccess === 'function';
  }

  public getSnapshot(): MidiManagerSnapshot {
    const devices: MidiDeviceInfo[] = [];
    if (this.access) {
      this.access.inputs.forEach(input => {
        if (input.state === 'connected') {
          devices.push({
            id: input.id,
            name: input.name || 'MIDI Gerät',
            manufacturer: input.manufacturer || '',
          });
        }
      });
    }
    return {
      supported: this.isSupported(),
      connected: devices.length > 0,
      devices,
      activeNotes: Array.from(this.heldNotes).sort((a, b) => a - b),
      monitorAudio: this.monitorAudio,
      monitorTimbre: this.monitorTimbre,
      error: this.error,
    };
  }

  public async connect(): Promise<boolean> {
    if (!this.isSupported()) {
      this.error = 'Web MIDI wird von diesem Browser nicht unterstützt (Chrome/Edge/Opera empfohlen).';
      this.emitState();
      return false;
    }

    try {
      this.error = null;
      this.access = await navigator.requestMIDIAccess({ sysex: false });
      this.initialized = true;
      this.bindInputs();
      this.access.onstatechange = () => {
        this.bindInputs();
        this.emitState();
      };
      this.emitState();
      return true;
    } catch (err) {
      this.error = err instanceof Error ? err.message : 'MIDI-Zugriff verweigert.';
      this.emitState();
      return false;
    }
  }

  public autoConnectIfPossible() {
    if (!this.initialized && this.isSupported()) {
      void this.connect();
    }
  }

  private bindInputs() {
    if (!this.access) return;
    this.access.inputs.forEach(input => {
      input.onmidimessage = (msg: MIDIMessageEvent) => this.handleMidiMessage(msg);
    });
  }

  private handleMidiMessage(msg: MIDIMessageEvent) {
    const data = msg.data;
    if (!data || data.length < 3) return;
    const status = data[0] & 0xf0;
    const channel = data[0] & 0x0f;
    const midi = data[1];
    const rawVel = data[2];

    if (status === 0x90 && rawVel > 0) {
      const velocity = rawVel / 127;
      this.heldNotes.add(midi);
      if (this.monitorAudio) {
        audioEngine.playNote(midi, {
          timbre: this.monitorTimbre,
          velocity: Math.max(0.25, velocity),
          duration: 1.5,
        });
      }
      this.emitNote({ type: 'noteon', midi, velocity, channel });
      this.emitState();
    } else if (status === 0x80 || (status === 0x90 && rawVel === 0)) {
      this.heldNotes.delete(midi);
      this.emitNote({ type: 'noteoff', midi, velocity: 0, channel });
      this.emitState();
    }
  }

  /**
   * Allows virtual/on-screen keys to inject MIDI note events (great for testing Wait-Mode without hardware).
   */
  public triggerVirtualNote(midi: number, durationMs = 350) {
    this.heldNotes.add(midi);
    this.emitNote({ type: 'noteon', midi, velocity: 0.8, channel: 0 });
    this.emitState();
    window.setTimeout(() => {
      this.heldNotes.delete(midi);
      this.emitNote({ type: 'noteoff', midi, velocity: 0, channel: 0 });
      this.emitState();
    }, durationMs);
  }

  public setMonitorAudio(enabled: boolean) {
    this.monitorAudio = enabled;
    this.emitState();
  }

  public setMonitorTimbre(timbre: InstrumentTimbre) {
    this.monitorTimbre = timbre;
    this.emitState();
  }

  public subscribeState(listener: StateListener): () => void {
    this.stateListeners.add(listener);
    listener(this.getSnapshot());
    return () => {
      this.stateListeners.delete(listener);
    };
  }

  public subscribeNotes(listener: NoteListener): () => void {
    this.noteListeners.add(listener);
    return () => {
      this.noteListeners.delete(listener);
    };
  }

  private emitState() {
    const snap = this.getSnapshot();
    this.stateListeners.forEach(fn => fn(snap));
  }

  private emitNote(evt: MidiNoteEvent) {
    this.noteListeners.forEach(fn => fn(evt));
  }
}

export const midiInput = new WebMidiInputManager();
