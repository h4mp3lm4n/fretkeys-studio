import React, { useEffect, useRef, useState } from 'react';
import { Play, Square, Drum, Volume2, RotateCcw, Zap, Hand, Save, Bookmark } from 'lucide-react';
import { audioEngine, DrumKitId, DrumPiece } from '../audio/audioEngine';
import {
  PRESET_KEYS,
  SavedPreset,
  deleteUserPreset,
  loadUserPresets,
  saveUserPreset,
} from '../utils/storage';

interface GroovePreset {
  id: string;
  name: string;
  timeSig: string;
  stepsPerBar: number;
  stepsPerBeat: number;
  bpm: number;
  swing: number;
  kit: DrumKitId;
  tracks: Partial<Record<DrumPiece, number[]>>; // 0=off, 1=ghost/soft, 2=normal, 3=accent
}

const TRACK_ROWS: Array<{ piece: DrumPiece; label: string; color: string }> = [
  { piece: 'ride', label: 'Ride', color: 'bg-cyan-400' },
  { piece: 'hihatOpen', label: 'Open HH', color: 'bg-sky-400' },
  { piece: 'hihatClosed', label: 'Closed HH', color: 'bg-teal-400' },
  { piece: 'snare', label: 'Snare', color: 'bg-amber-400' },
  { piece: 'rim', label: 'Rim / Click', color: 'bg-violet-400' },
  { piece: 'tomHigh', label: 'Tom', color: 'bg-orange-400' },
  { piece: 'kick', label: 'Kick', color: 'bg-rose-500' },
];

const GROOVE_PRESETS: GroovePreset[] = [
  {
    id: 'rock_44',
    name: 'Studio Rock (4/4)',
    timeSig: '4/4',
    stepsPerBar: 16,
    stepsPerBeat: 4,
    bpm: 100,
    swing: 0,
    kit: 'acoustic',
    tracks: {
      hihatClosed: [3, 0, 2, 0, 3, 0, 2, 0, 3, 0, 2, 0, 3, 0, 2, 0],
      snare:       [0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 1],
      kick:        [3, 0, 0, 0, 0, 0, 0, 2, 3, 0, 2, 0, 0, 0, 0, 0],
    },
  },
  {
    id: 'funk_16',
    name: 'Tight Funk Pocket (4/4)',
    timeSig: '4/4',
    stepsPerBar: 16,
    stepsPerBeat: 4,
    bpm: 96,
    swing: 8,
    kit: 'funk',
    tracks: {
      hihatClosed: [3, 1, 2, 1, 3, 1, 2, 1, 3, 1, 2, 1, 3, 1, 0, 1],
      hihatOpen:   [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0],
      snare:       [0, 0, 0, 0, 3, 0, 0, 1, 0, 1, 0, 0, 3, 0, 0, 1],
      kick:        [3, 0, 0, 2, 0, 0, 2, 0, 0, 0, 3, 0, 0, 0, 0, 0],
    },
  },
  {
    id: 'jazz_swing',
    name: 'Jazz Swing Ride (4/4 Triolen)',
    timeSig: '4/4 (12/8)',
    stepsPerBar: 12,
    stepsPerBeat: 3,
    bpm: 128,
    swing: 0,
    kit: 'jazz',
    tracks: {
      ride:        [3, 0, 0, 3, 0, 2, 3, 0, 0, 3, 0, 2],
      hihatClosed: [0, 0, 0, 2, 0, 0, 0, 0, 0, 2, 0, 0],
      snare:       [0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0],
      kick:        [2, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
    },
  },
  {
    id: 'neosoul',
    name: 'Neo-Soul Laid-Back (4/4)',
    timeSig: '4/4',
    stepsPerBar: 16,
    stepsPerBeat: 4,
    bpm: 82,
    swing: 26,
    kit: 'funk',
    tracks: {
      hihatClosed: [2, 0, 2, 0, 2, 0, 2, 1, 2, 0, 2, 0, 2, 0, 2, 1],
      snare:       [0, 0, 0, 0, 3, 0, 0, 0, 0, 1, 0, 0, 3, 0, 0, 0],
      rim:         [0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0],
      kick:        [3, 0, 0, 1, 0, 0, 0, 2, 0, 0, 3, 0, 0, 1, 0, 0],
    },
  },
  {
    id: 'take_five',
    name: 'Take Five Odd-Meter (5/4)',
    timeSig: '5/4 (3+2)',
    stepsPerBar: 10,
    stepsPerBeat: 2,
    bpm: 148,
    swing: 22,
    kit: 'jazz',
    tracks: {
      ride:        [3, 0, 2, 2, 2, 0, 3, 0, 2, 2],
      hihatClosed: [0, 0, 2, 0, 0, 0, 0, 0, 2, 0],
      snare:       [0, 0, 2, 0, 0, 0, 0, 0, 2, 1],
      kick:        [3, 0, 0, 0, 0, 2, 2, 0, 0, 0],
    },
  },
  {
    id: 'seven_eight',
    name: 'Prog / Balkan (7/8 • 2+2+3)',
    timeSig: '7/8',
    stepsPerBar: 14,
    stepsPerBeat: 2,
    bpm: 132,
    swing: 0,
    kit: 'acoustic',
    tracks: {
      hihatClosed: [3, 0, 2, 0, 3, 0, 2, 0, 3, 0, 2, 0, 2, 0],
      snare:       [0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 3, 0, 0, 0],
      kick:        [3, 0, 0, 0, 0, 0, 2, 0, 3, 0, 0, 0, 2, 0],
    },
  },
  {
    id: 'nine_eight',
    name: 'Odd Groove (9/8 • 2+2+2+3)',
    timeSig: '9/8',
    stepsPerBar: 9,
    stepsPerBeat: 1,
    bpm: 165,
    swing: 0,
    kit: 'acoustic',
    tracks: {
      ride:        [3, 1, 2, 1, 2, 1, 3, 1, 2],
      snare:       [0, 0, 0, 0, 3, 0, 0, 0, 2],
      kick:        [3, 0, 2, 0, 0, 0, 3, 0, 0],
    },
  },
  {
    id: 'eleven_eight',
    name: 'Math / Fusion (11/8 • 3+3+3+2)',
    timeSig: '11/8',
    stepsPerBar: 11,
    stepsPerBeat: 1,
    bpm: 185,
    swing: 0,
    kit: 'acoustic',
    tracks: {
      hihatClosed: [3, 1, 1, 2, 1, 1, 2, 1, 1, 3, 1],
      snare:       [0, 0, 0, 3, 0, 0, 0, 0, 0, 3, 0],
      kick:        [3, 0, 0, 0, 0, 2, 3, 0, 0, 0, 0],
    },
  },
  {
    id: 'bluegrass',
    name: 'Bluegrass / Country Train (4/4)',
    timeSig: '4/4',
    stepsPerBar: 16,
    stepsPerBeat: 4,
    bpm: 116,
    swing: 0,
    kit: 'acoustic',
    tracks: {
      snare:       [1, 1, 2, 1, 3, 1, 2, 1, 1, 1, 2, 1, 3, 1, 2, 1],
      kick:        [3, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0],
      hihatClosed: [0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0],
    },
  },
  {
    id: 'blues_shuffle',
    name: 'Blues Shuffle (12/8)',
    timeSig: '12/8',
    stepsPerBar: 12,
    stepsPerBeat: 3,
    bpm: 95,
    swing: 0,
    kit: 'acoustic',
    tracks: {
      ride:        [3, 0, 2, 3, 0, 2, 3, 0, 2, 3, 0, 2],
      snare:       [0, 0, 0, 3, 0, 0, 0, 0, 0, 3, 0, 1],
      kick:        [3, 0, 0, 0, 0, 2, 3, 0, 0, 0, 0, 0],
    },
  },
  {
    id: 'waltz_34',
    name: 'Walzer / Jazz Waltz (3/4)',
    timeSig: '3/4',
    stepsPerBar: 6,
    stepsPerBeat: 2,
    bpm: 120,
    swing: 16,
    kit: 'jazz',
    tracks: {
      ride:        [3, 0, 2, 2, 2, 0],
      hihatClosed: [0, 0, 2, 0, 2, 0],
      kick:        [3, 0, 0, 0, 0, 0],
      rim:         [0, 0, 0, 0, 2, 0],
    },
  },
  {
    id: 'four_on_floor',
    name: 'Four on the Floor (House / Disco)',
    timeSig: '4/4',
    stepsPerBar: 16,
    stepsPerBeat: 4,
    bpm: 122,
    swing: 0,
    kit: 'electronic',
    tracks: {
      hihatOpen:   [0, 0, 2, 0, 0, 0, 2, 0, 0, 0, 2, 0, 0, 0, 2, 0],
      hihatClosed: [2, 1, 0, 1, 2, 1, 0, 1, 2, 1, 0, 1, 2, 1, 0, 1],
      snare:       [0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0],
      kick:        [3, 0, 0, 0, 3, 0, 0, 0, 3, 0, 0, 0, 3, 0, 0, 0],
    },
  },
  {
    id: 'bo_diddley',
    name: 'Bo Diddley Beat (3–2 Clave)',
    timeSig: '4/4',
    stepsPerBar: 16,
    stepsPerBeat: 4,
    bpm: 108,
    swing: 0,
    kit: 'acoustic',
    tracks: {
      hihatClosed: [2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0],
      tomHigh:     [3, 0, 0, 3, 0, 0, 3, 0, 0, 0, 3, 0, 3, 0, 0, 0],
      rim:         [3, 0, 0, 3, 0, 0, 3, 0, 0, 0, 3, 0, 3, 0, 0, 0],
      kick:        [3, 0, 0, 2, 0, 0, 2, 0, 3, 0, 2, 0, 2, 0, 0, 0],
    },
  },
  {
    id: 'impeach_president',
    name: 'Impeach the President (Breakbeat)',
    timeSig: '4/4',
    stepsPerBar: 16,
    stepsPerBeat: 4,
    bpm: 96,
    swing: 12,
    kit: 'boombap',
    tracks: {
      hihatClosed: [3, 0, 2, 0, 3, 0, 2, 2, 3, 0, 0, 0, 3, 0, 2, 0],
      hihatOpen:   [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0],
      snare:       [0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0],
      kick:        [3, 0, 0, 0, 0, 0, 0, 2, 3, 0, 0, 0, 0, 0, 2, 0],
    },
  },
  {
    id: 'boom_bap',
    name: '90s Boom Bap (Dusty Hip-Hop)',
    timeSig: '4/4',
    stepsPerBar: 16,
    stepsPerBeat: 4,
    bpm: 88,
    swing: 24,
    kit: 'boombap',
    tracks: {
      hihatClosed: [2, 0, 2, 1, 2, 0, 2, 1, 2, 0, 2, 1, 2, 0, 2, 1],
      snare:       [0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 1],
      kick:        [3, 0, 2, 0, 0, 0, 0, 2, 0, 0, 3, 0, 0, 0, 0, 0],
    },
  },
  {
    id: 'bossa_nova',
    name: 'Bossa Nova (Cross-Stick Clave)',
    timeSig: '4/4',
    stepsPerBar: 16,
    stepsPerBeat: 4,
    bpm: 118,
    swing: 0,
    kit: 'jazz',
    tracks: {
      hihatClosed: [2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0],
      rim:         [3, 0, 0, 2, 0, 0, 3, 0, 0, 0, 2, 0, 0, 2, 0, 0],
      kick:        [3, 0, 0, 2, 3, 0, 0, 2, 3, 0, 0, 2, 3, 0, 0, 2],
    },
  },
  {
    id: 'reggae_onedrop',
    name: 'Reggae One Drop (4/4)',
    timeSig: '4/4',
    stepsPerBar: 16,
    stepsPerBeat: 4,
    bpm: 78,
    swing: 18,
    kit: 'acoustic',
    tracks: {
      hihatClosed: [2, 0, 1, 2, 2, 0, 1, 2, 2, 0, 1, 2, 2, 0, 1, 2],
      rim:         [0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0],
      kick:        [0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0],
    },
  },
  {
    id: 'motown',
    name: 'Motown / Classic Soul (4/4)',
    timeSig: '4/4',
    stepsPerBar: 16,
    stepsPerBeat: 4,
    bpm: 116,
    swing: 0,
    kit: 'acoustic',
    tracks: {
      hihatClosed: [2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0],
      snare:       [3, 0, 0, 0, 3, 0, 0, 0, 3, 0, 0, 0, 3, 0, 0, 0],
      kick:        [3, 0, 0, 0, 0, 0, 2, 0, 3, 0, 2, 0, 0, 0, 0, 0],
    },
  },
  {
    id: 'purdie_shuffle',
    name: 'Purdie Half-Time Shuffle (12/8)',
    timeSig: '12/8',
    stepsPerBar: 12,
    stepsPerBeat: 3,
    bpm: 92,
    swing: 0,
    kit: 'funk',
    tracks: {
      hihatClosed: [3, 0, 2, 3, 0, 2, 3, 0, 2, 3, 0, 2],
      snare:       [0, 1, 0, 0, 1, 0, 3, 1, 0, 0, 1, 0],
      kick:        [3, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 2],
    },
  },
  {
    id: 'metronome_74',
    name: 'Woodblock Metronom (7/4)',
    timeSig: '7/4',
    stepsPerBar: 7,
    stepsPerBeat: 1,
    bpm: 112,
    swing: 0,
    kit: 'woodblock',
    tracks: {
      rim:         [3, 2, 2, 2, 3, 2, 2],
    },
  },
];

function buildGridFromPreset(preset: GroovePreset): Record<DrumPiece, number[]> {
  const grid = {} as Record<DrumPiece, number[]>;
  TRACK_ROWS.forEach(r => {
    const src = preset.tracks[r.piece];
    grid[r.piece] = Array.from({ length: preset.stepsPerBar }, (_, i) => src?.[i] ?? 0);
  });
  return grid;
}

export const DrumMachineTool: React.FC = () => {
  const [selectedPresetId, setSelectedPresetId] = useState<string>(GROOVE_PRESETS[0].id);
  const [stepsPerBar, setStepsPerBar] = useState<number>(GROOVE_PRESETS[0].stepsPerBar);
  const [stepsPerBeat, setStepsPerBeat] = useState<number>(GROOVE_PRESETS[0].stepsPerBeat);
  const [bpm, setBpm] = useState<number>(GROOVE_PRESETS[0].bpm);
  const [swing, setSwing] = useState<number>(GROOVE_PRESETS[0].swing);
  const [kit, setKit] = useState<DrumKitId>(GROOVE_PRESETS[0].kit);
  const [grid, setGrid] = useState<Record<DrumPiece, number[]>>(() => buildGridFromPreset(GROOVE_PRESETS[0]));
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [metronomeClick, setMetronomeClick] = useState(false);

  // Speed Trainer
  const [speedTrainer, setSpeedTrainer] = useState(false);
  const [speedStepBpm, setSpeedStepBpm] = useState(4);
  const [speedEveryBars, setSpeedEveryBars] = useState(4);
  const [barCount, setBarCount] = useState(0);

  // Tap tempo state
  const tapTimesRef = useRef<number[]>([]);

  // User Saved Grooves
  interface SavedGrooveData {
    stepsPerBar: number;
    stepsPerBeat: number;
    bpm: number;
    swing: number;
    kit: DrumKitId;
    grid: Record<DrumPiece, number[]>;
  }
  const [savedGrooves, setSavedGrooves] = useState<SavedPreset<SavedGrooveData>[]>(() =>
    loadUserPresets<SavedGrooveData>(PRESET_KEYS.DRUM_GROOVES)
  );
  const [grooveSaveName, setGrooveSaveName] = useState('');

  const handleSaveGroove = () => {
    const label = grooveSaveName.trim() || `Groove ${savedGrooves.length + 1}`;
    const updated = saveUserPreset<SavedGrooveData>(PRESET_KEYS.DRUM_GROOVES, label, {
      stepsPerBar,
      stepsPerBeat,
      bpm,
      swing,
      kit,
      grid,
    });
    setSavedGrooves(updated);
    setGrooveSaveName('');
  };

  // Refs for sample-accurate Web Audio lookahead scheduler
  const stateRef = useRef({
    grid,
    bpm,
    swing,
    kit,
    stepsPerBar,
    stepsPerBeat,
    metronomeClick,
    speedTrainer,
    speedStepBpm,
    speedEveryBars,
  });
  stateRef.current = {
    grid,
    bpm,
    swing,
    kit,
    stepsPerBar,
    stepsPerBeat,
    metronomeClick,
    speedTrainer,
    speedStepBpm,
    speedEveryBars,
  };

  const nextNoteTimeRef = useRef(0);
  const currentStepRef = useRef(0);
  const barCounterRef = useRef(0);
  const schedulerIdRef = useRef<number | null>(null);

  const loadPreset = (preset: GroovePreset) => {
    setSelectedPresetId(preset.id);
    setStepsPerBar(preset.stepsPerBar);
    setStepsPerBeat(preset.stepsPerBeat);
    setBpm(preset.bpm);
    setSwing(preset.swing);
    setKit(preset.kit);
    setGrid(buildGridFromPreset(preset));
    currentStepRef.current = 0;
  };

  const changeCustomSteps = (nextSteps: number, nextPerBeat: number) => {
    setSelectedPresetId('custom');
    setStepsPerBar(nextSteps);
    setStepsPerBeat(nextPerBeat);
    setGrid(prev => {
      const updated = {} as Record<DrumPiece, number[]>;
      TRACK_ROWS.forEach(r => {
        const old = prev[r.piece] ?? [];
        updated[r.piece] = Array.from({ length: nextSteps }, (_, i) => old[i] ?? 0);
      });
      return updated;
    });
    currentStepRef.current = 0;
  };

  useEffect(() => {
    if (!isPlaying) {
      if (schedulerIdRef.current !== null) {
        window.clearInterval(schedulerIdRef.current);
        schedulerIdRef.current = null;
      }
      setCurrentStep(-1);
      return;
    }

    const ctx = audioEngine.getContext();
    currentStepRef.current = 0;
    barCounterRef.current = 0;
    setBarCount(0);
    nextNoteTimeRef.current = ctx.currentTime + 0.05;

    const lookaheadMs = 25;
    const scheduleAheadSec = 0.12;

    const scheduleStep = (step: number, time: number) => {
      const s = stateRef.current;

      // Schedule drums
      TRACK_ROWS.forEach(row => {
        const velLevel = s.grid[row.piece]?.[step] ?? 0;
        if (velLevel > 0) {
          const velocity = velLevel === 1 ? 0.35 : velLevel === 2 ? 0.72 : 1.0;
          audioEngine.playDrum(row.piece, s.kit, velocity, time);
        }
      });

      // Optional Woodblock click overlay on beat boundaries
      if (s.metronomeClick && step % s.stepsPerBeat === 0) {
        audioEngine.playDrum(step === 0 ? 'accentClick' : 'normalClick', 'woodblock', step === 0 ? 0.85 : 0.55, time);
      }

      // Sync visual cursor closely with scheduled audio time
      const delayMs = Math.max(0, (time - ctx.currentTime) * 1000);
      window.setTimeout(() => {
        setCurrentStep(step);
      }, delayMs);
    };

    const advanceStep = () => {
      const s = stateRef.current;
      const baseStepSec = 60 / s.bpm / s.stepsPerBeat;
      // Apply swing on odd-indexed subdivisions
      const swingFactor = (s.swing / 100) * 0.45;
      const stepDuration =
        s.stepsPerBeat >= 2
          ? currentStepRef.current % 2 === 0
            ? baseStepSec * (1 + swingFactor)
            : baseStepSec * (1 - swingFactor)
          : baseStepSec;

      nextNoteTimeRef.current += Math.max(0.03, stepDuration);
      currentStepRef.current = (currentStepRef.current + 1) % s.stepsPerBar;

      if (currentStepRef.current === 0) {
        barCounterRef.current += 1;
        setBarCount(barCounterRef.current);
        if (s.speedTrainer && barCounterRef.current % s.speedEveryBars === 0) {
          setBpm(prev => Math.min(250, prev + s.speedStepBpm));
        }
      }
    };

    schedulerIdRef.current = window.setInterval(() => {
      while (nextNoteTimeRef.current < ctx.currentTime + scheduleAheadSec) {
        scheduleStep(currentStepRef.current, nextNoteTimeRef.current);
        advanceStep();
      }
    }, lookaheadMs);

    return () => {
      if (schedulerIdRef.current !== null) {
        window.clearInterval(schedulerIdRef.current);
        schedulerIdRef.current = null;
      }
    };
  }, [isPlaying]);

  const cycleCell = (piece: DrumPiece, step: number) => {
    setGrid(prev => {
      const next = [...prev[piece]];
      next[step] = (next[step] + 1) % 4; // 0 -> 1 (ghost) -> 2 (normal) -> 3 (accent) -> 0
      if (next[step] > 0) {
        const vel = next[step] === 1 ? 0.35 : next[step] === 2 ? 0.72 : 1.0;
        audioEngine.playDrum(piece, kit, vel);
      }
      return { ...prev, [piece]: next };
    });
  };

  const clearGrid = () => {
    setGrid(() => {
      const empty = {} as Record<DrumPiece, number[]>;
      TRACK_ROWS.forEach(r => {
        empty[r.piece] = new Array(stepsPerBar).fill(0);
      });
      return empty;
    });
  };

  const handleTapTempo = () => {
    const now = performance.now();
    const taps = tapTimesRef.current;
    if (taps.length > 0 && now - taps[taps.length - 1] > 2000) {
      tapTimesRef.current = [];
    }
    tapTimesRef.current.push(now);
    if (tapTimesRef.current.length > 6) tapTimesRef.current.shift();
    if (tapTimesRef.current.length >= 2) {
      const diffs: number[] = [];
      for (let i = 1; i < tapTimesRef.current.length; i++) {
        diffs.push(tapTimesRef.current[i] - tapTimesRef.current[i - 1]);
      }
      const avg = diffs.reduce((a, b) => a + b, 0) / diffs.length;
      const nextBpm = Math.round(60000 / avg);
      if (nextBpm >= 40 && nextBpm <= 250) setBpm(nextBpm);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Drum className="w-6 h-6 text-rose-400" />
            Metronom &amp; Studio Drum-Machine
          </h2>
          <p className="text-sm text-slate-400">
            Sample-genaue Timing-Engine mit ungeraden Taktarten (5/4, 7/8, 9/8, 11/8), 5 Studio-Drumkits, Swing &amp; Speed-Trainer.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleTapTempo}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 cursor-pointer"
          >
            <Hand className="w-3.5 h-3.5 text-amber-400" />
            Tap Tempo
          </button>
          <button
            onClick={() => setIsPlaying(p => !p)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm cursor-pointer transition-all ${
              isPlaying
                ? 'bg-rose-500 hover:bg-rose-400 text-white shadow-lg shadow-rose-500/25'
                : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/25'
            }`}
          >
            {isPlaying ? <Square className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
            {isPlaying ? 'Stopp' : 'Start Groove'}
          </button>
        </div>
      </div>

      {/* Presets Strip */}
      <div className="studio-card rounded-2xl p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Groove &amp; Taktart-Vorlagen</div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={grooveSaveName}
              onChange={e => setGrooveSaveName(e.target.value)}
              placeholder="Eigenen Groove benennen..."
              className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-amber-500 w-44"
            />
            <button
              onClick={handleSaveGroove}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" /> Speichern
            </button>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {GROOVE_PRESETS.map(p => (
            <button
              key={p.id}
              onClick={() => loadPreset(p)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                selectedPresetId === p.id
                  ? 'bg-amber-500/20 border-amber-500 text-amber-200'
                  : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-600'
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>

        {savedGrooves.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-800/80 text-xs">
            <span className="flex items-center gap-1 text-amber-400 font-bold mr-1">
              <Bookmark className="w-3.5 h-3.5" /> Eigene Grooves:
            </span>
            {savedGrooves.map(g => (
              <div
                key={g.id}
                className="flex items-center gap-1 pl-2.5 pr-1 py-1 rounded-lg bg-slate-900 border border-amber-500/35"
              >
                <button
                  onClick={() => {
                    setSelectedPresetId(g.id);
                    setStepsPerBar(g.data.stepsPerBar);
                    setStepsPerBeat(g.data.stepsPerBeat);
                    setBpm(g.data.bpm);
                    setSwing(g.data.swing);
                    setKit(g.data.kit);
                    setGrid(g.data.grid);
                    currentStepRef.current = 0;
                  }}
                  className="text-slate-100 hover:text-amber-300 font-semibold cursor-pointer"
                >
                  {g.name} ({g.data.bpm} BPM)
                </button>
                <button
                  onClick={() => setSavedGrooves(deleteUserPreset(PRESET_KEYS.DRUM_GROOVES, g.id))}
                  className="p-0.5 text-slate-500 hover:text-rose-400 cursor-pointer"
                  title="Löschen"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Controls Bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* BPM */}
        <div className="studio-card rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Tempo</span>
            <span className="text-2xl font-black text-amber-400 font-mono">{bpm} <span className="text-xs text-slate-400">BPM</span></span>
          </div>
          <input
            type="range"
            min={40}
            max={240}
            value={bpm}
            onChange={e => setBpm(Number(e.target.value))}
            className="w-full accent-amber-500"
          />
          <div className="flex justify-between gap-1">
            {[-10, -5, +5, +10].map(delta => (
              <button
                key={delta}
                onClick={() => setBpm(b => Math.max(40, Math.min(240, b + delta)))}
                className="flex-1 py-1 rounded bg-slate-900 hover:bg-slate-800 text-[11px] font-bold text-slate-300 cursor-pointer"
              >
                {delta > 0 ? `+${delta}` : delta}
              </button>
            ))}
          </div>
        </div>

        {/* Drum Kit & Click */}
        <div className="studio-card rounded-2xl p-4 space-y-2.5">
          <div className="text-xs font-semibold text-slate-400">Studio Drum-Kit</div>
          <select
            value={kit}
            onChange={e => setKit(e.target.value as DrumKitId)}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white"
          >
            <option value="acoustic">Studio Acoustic (Rock &amp; Pop)</option>
            <option value="funk">Dry Piccolo Funk (Tight &amp; Snappy)</option>
            <option value="jazz">Vintage Jazz Kit (Brush &amp; Ride)</option>
            <option value="boombap">90s Boom-Bap (Dusty Vinyl Hip-Hop)</option>
            <option value="electronic">Modern 808 / 909 Punch</option>
            <option value="woodblock">Woodblock / Claves Metronom</option>
          </select>
          <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={metronomeClick}
              onChange={e => setMetronomeClick(e.target.checked)}
              className="accent-amber-500"
            />
            Zusätzlicher Metronom-Click auf Zählzeiten
          </label>
        </div>

        {/* Odd Meter & Swing */}
        <div className="studio-card rounded-2xl p-4 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-400">Steps / Takt</span>
            <span className="font-mono text-cyan-300 font-bold">{stepsPerBar} Steps ({stepsPerBeat}/Beat)</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {[
              { label: '4/4 (16)', s: 16, b: 4 },
              { label: '3/4 (12)', s: 12, b: 4 },
              { label: '5/4 (10)', s: 10, b: 2 },
              { label: '7/8 (14)', s: 14, b: 2 },
              { label: '9/8 (9)', s: 9, b: 1 },
              { label: '11/8 (11)', s: 11, b: 1 },
            ].map(m => (
              <button
                key={m.label}
                onClick={() => changeCustomSteps(m.s, m.b)}
                className={`px-2 py-1 rounded text-[11px] font-semibold cursor-pointer ${
                  stepsPerBar === m.s && stepsPerBeat === m.b
                    ? 'bg-cyan-500/25 text-cyan-200'
                    : 'bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
          <label className="block text-xs text-slate-400">
            Swing: <span className="text-amber-300 font-bold">{swing}%</span>
            <input
              type="range"
              min={0}
              max={45}
              value={swing}
              onChange={e => setSwing(Number(e.target.value))}
              className="w-full accent-cyan-400 mt-0.5"
            />
          </label>
        </div>

        {/* Speed Trainer */}
        <div className="studio-card rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              Speed-Trainer
            </span>
            <input
              type="checkbox"
              checked={speedTrainer}
              onChange={e => setSpeedTrainer(e.target.checked)}
              className="accent-amber-500 w-4 h-4 cursor-pointer"
            />
          </div>
          <p className="text-[11px] text-slate-400">
            Erhöht automatisch das Tempo nach N Takten (Takt: {barCount})
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <label className="text-slate-400">
              +BPM:
              <input
                type="number"
                min={1}
                max={20}
                value={speedStepBpm}
                onChange={e => setSpeedStepBpm(Math.max(1, Number(e.target.value)))}
                className="w-full mt-0.5 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-white"
              />
            </label>
            <label className="text-slate-400">
              Alle Takte:
              <input
                type="number"
                min={1}
                max={16}
                value={speedEveryBars}
                onChange={e => setSpeedEveryBars(Math.max(1, Number(e.target.value)))}
                className="w-full mt-0.5 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-white"
              />
            </label>
          </div>
        </div>
      </div>

      {/* STEP SEQUENCER MATRIX */}
      <div className="studio-card rounded-2xl p-4 sm:p-5 space-y-3 overflow-x-auto">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-4 text-slate-400">
            <span>Klicke Zellen für Dynamik:</span>
            <span className="inline-flex items-center gap-1"><span className="w-3 h-3 rounded bg-amber-400/35 inline-block" /> Ghost</span>
            <span className="inline-flex items-center gap-1"><span className="w-3 h-3 rounded bg-amber-400/75 inline-block" /> Normal</span>
            <span className="inline-flex items-center gap-1"><span className="w-3 h-3 rounded bg-amber-400 ring-2 ring-white inline-block" /> Akzent</span>
          </div>
          <button
            onClick={clearGrid}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Pattern leeren
          </button>
        </div>

        <div className="min-w-[640px] space-y-1.5">
          {/* Beat ruler */}
          <div className="grid items-center gap-1" style={{ gridTemplateColumns: `112px repeat(${stepsPerBar}, minmax(28px, 1fr))` }}>
            <div />
            {Array.from({ length: stepsPerBar }, (_, i) => {
              const isBeatStart = i % stepsPerBeat === 0;
              const isActive = currentStep === i;
              return (
                <div
                  key={`head-${i}`}
                  className={`text-center text-[11px] font-mono font-bold py-1 rounded-md transition-colors ${
                    isActive
                      ? 'bg-amber-500 text-slate-950'
                      : isBeatStart
                        ? 'text-slate-200 bg-slate-800/70'
                        : 'text-slate-500'
                  }`}
                >
                  {isBeatStart ? Math.floor(i / stepsPerBeat) + 1 : '·'}
                </div>
              );
            })}
          </div>

          {/* Instrument Rows */}
          {TRACK_ROWS.map(row => (
            <div
              key={row.piece}
              className="grid items-center gap-1"
              style={{ gridTemplateColumns: `112px repeat(${stepsPerBar}, minmax(28px, 1fr))` }}
            >
              <button
                onClick={() => audioEngine.playDrum(row.piece, kit, 0.9)}
                className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg bg-slate-900/90 hover:bg-slate-800 text-xs font-semibold text-slate-200 text-left cursor-pointer"
              >
                <Volume2 className="w-3 h-3 text-slate-500" />
                {row.label}
              </button>

              {Array.from({ length: stepsPerBar }, (_, step) => {
                const level = grid[row.piece]?.[step] ?? 0;
                const isActive = currentStep === step;
                const isBeatStart = step % stepsPerBeat === 0;
                return (
                  <button
                    key={`${row.piece}-${step}`}
                    onClick={() => cycleCell(row.piece, step)}
                    className={`h-9 rounded-lg border transition-all cursor-pointer flex items-center justify-center ${
                      isActive ? 'ring-2 ring-amber-400 scale-[1.04]' : ''
                    } ${
                      level === 0
                        ? isBeatStart
                          ? 'bg-slate-800/70 border-slate-700/70 hover:bg-slate-700/70'
                          : 'bg-slate-900/70 border-slate-800/70 hover:bg-slate-800/70'
                        : level === 1
                          ? `${row.color} opacity-35 border-white/20`
                          : level === 2
                            ? `${row.color} opacity-80 border-white/30`
                            : `${row.color} opacity-100 border-white shadow-md`
                    }`}
                  >
                    {level === 3 && <span className="w-2 h-2 rounded-full bg-slate-950/75" />}
                    {level === 1 && <span className="w-1.5 h-1.5 rounded-full bg-slate-950/60" />}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
