import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Play,
  Pause,
  Square,
  Upload,
  Repeat,
  Piano,
  Volume2,
  VolumeX,
  ArrowUpDown,
  Music2,
  Eye,
  Cable,
  HandMetal,
  Palette,
  ArrowUp,
  ArrowDown,
  ZoomIn,
  Library,
  Search,
  X,
} from 'lucide-react';
import { Midi } from '@tonejs/midi';
import { audioEngine, InstrumentTimbre } from '../audio/audioEngine';
import { midiInput, MidiManagerSnapshot } from '../audio/midiInput';
import { CHROMA_NOTES_COLORS, midiToNoteName, pcToName } from '../theory/musicTheory';
import {
  ALL_MIDI_GENRES,
  MIDI_LIBRARY,
  MIDI_TRACK_COLORS,
  MidiGenre,
  MidiLibraryNote,
  MidiLibraryPiece,
  MidiLibraryTrack,
} from '../data/midiLibrary';
import { ClassicalStaffSVG } from '../components/ClassicalStaffSVG';

const IS_BLACK = [false, true, false, true, false, false, true, false, true, false, true, false];

// Map @tonejs/midi relative major key name -> Circle of Fifths accidental count (-7..+7)
const MAJOR_KEY_TO_FIFTHS: Record<string, number> = {
  Cb: -7, Gb: -6, Db: -5, Ab: -4, Eb: -3, Bb: -2, F: -1,
  C: 0, G: 1, D: 2, A: 3, E: 4, B: 5, 'F#': 6, 'C#': 7,
};

const FIFTHS_LABEL: Record<number, string> = {
  [-7]: 'Ces-Dur / as-Moll (7♭)',
  [-6]: 'Ges-Dur / es-Moll (6♭)',
  [-5]: 'Des-Dur / b-Moll (5♭)',
  [-4]: 'As-Dur / f-Moll (4♭)',
  [-3]: 'Es-Dur / c-Moll (3♭)',
  [-2]: 'B-Dur / g-Moll (2♭)',
  [-1]: 'F-Dur / d-Moll (1♭)',
  [0]: 'C-Dur / a-Moll',
  [1]: 'G-Dur / e-Moll (1♯)',
  [2]: 'D-Dur / h-Moll (2♯)',
  [3]: 'A-Dur / fis-Moll (3♯)',
  [4]: 'E-Dur / cis-Moll (4♯)',
  [5]: 'H-Dur / gis-Moll (5♯)',
  [6]: 'Fis-Dur / dis-Moll (6♯)',
  [7]: 'Cis-Dur / ais-Moll (7♯)',
};

function transposeFifths(baseFifths: number, semitones: number): number {
  if (semitones === 0) return baseFifths;
  // +1 semitone = +7 fifths mod 12; wrap cleanly into [-6, +6]
  let f = ((baseFifths + semitones * 7) % 12 + 12) % 12;
  if (f > 6) f -= 12;
  return f;
}

// Fallback key estimator for user-uploaded MIDIs that omit the KeySignature meta-event
function estimateKeyFifthsFromNotes(notes: MidiLibraryNote[]): number {
  if (notes.length === 0) return 0;
  const counts = new Array(12).fill(0);
  for (const n of notes) {
    counts[((n.midi % 12) + 12) % 12] += Math.min(2, n.duration + 0.2);
  }
  const majorTemplate = [0, 2, 4, 5, 7, 9, 11];
  let bestFifths = 0;
  let bestScore = -1;
  for (let fifths = -6; fifths <= 6; fifths++) {
    const rootPc = ((fifths * 7) % 12 + 12) % 12;
    let score = 0;
    for (const iv of majorTemplate) {
      score += counts[(rootPc + iv) % 12];
    }
    // Slight tie-breaker preference for fewer accidentals (simpler key)
    score -= Math.abs(fifths) * 0.01;
    if (score > bestScore) {
      bestScore = score;
      bestFifths = fifths;
    }
  }
  return bestFifths;
}

export const MidiSynthesiaPlayer: React.FC = () => {
  const [pieceId, setPieceId] = useState<string>(MIDI_LIBRARY[0].id);
  const [pieceTitle, setPieceTitle] = useState<string>(`${MIDI_LIBRARY[0].artist} – ${MIDI_LIBRARY[0].title}`);
  const [tracks, setTracks] = useState<MidiLibraryTrack[]>([]);
  const [notes, setNotes] = useState<MidiLibraryNote[]>([]);
  const [totalDuration, setTotalDuration] = useState<number>(10);
  const [baseBpm, setBaseBpm] = useState<number>(MIDI_LIBRARY[0].bpm);
  const [timeSignature, setTimeSignature] = useState<[number, number]>(MIDI_LIBRARY[0].timeSignature);
  const [keyTimeline, setKeyTimeline] = useState<Array<{ time: number; fifths: number }>>([{ time: 0, fifths: 0 }]);
  const [loadingPiece, setLoadingPiece] = useState<boolean>(false);

  // Library Picker Drawer/Panel state
  const [libraryOpen, setLibraryOpen] = useState<boolean>(false);
  const [libSearch, setLibSearch] = useState<string>('');
  const [libGenre, setLibGenre] = useState<MidiGenre | 'Alle'>('Alle');
  const [libArtist, setLibArtist] = useState<string>('Alle');

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [speed, setSpeed] = useState(1.0);
  const [transpose, setTranspose] = useState(0);
  const [timbre, setTimbre] = useState<InstrumentTimbre>('piano');
  const [keyRange, setKeyRange] = useState<'61' | '88'>('61');

  // View Visibility, Order, Scale & Kids Color Notation
  const [showSynthesia, setShowSynthesia] = useState(true);
  const [showNotation, setShowNotation] = useState(true);
  const [layoutOrder, setLayoutOrder] = useState<'synthesia-first' | 'notation-first'>('synthesia-first');
  const [notationScale, setNotationScale] = useState<number>(1.1);
  const [colorNotationKids, setColorNotationKids] = useState<boolean>(false);
  const [showNoteLabels, setShowNoteLabels] = useState(true);

  // A-B Loop
  const [loopEnabled, setLoopEnabled] = useState(false);
  const [loopA, setLoopA] = useState(0);
  const [loopB, setLoopB] = useState(6);

  // Web MIDI & Wait-Mode
  const [midiState, setMidiState] = useState<MidiManagerSnapshot>(() => midiInput.getSnapshot());
  const [waitMode, setWaitMode] = useState(false);
  const [waitTrackFilter, setWaitTrackFilter] = useState<'all' | number>('all');
  const [waitingNotes, setWaitingNotes] = useState<number[]>([]);
  const [waitHits, setWaitHits] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const playTimeRef = useRef(0);
  const lastFrameRef = useRef<number | null>(null);
  const triggeredIdsRef = useRef<Set<number>>(new Set());
  const waitSatisfiedIdsRef = useRef<Set<number>>(new Set());
  const waitingBatchRef = useRef<Array<{ id: number; midi: number }>>([]);
  const activeMidiSetRef = useRef<Set<number>>(new Set());
  const rafRef = useRef<number | null>(null);
  const keyGeomRef = useRef<Map<number, { x: number; width: number; isBlack: boolean }>>(new Map());
  const kbHeightRef = useRef(108);

  const stateRef = useRef({
    notes,
    tracks,
    totalDuration,
    speed,
    transpose,
    timbre,
    loopEnabled,
    loopA,
    loopB,
    isPlaying,
    keyRange,
    showNoteLabels,
    waitMode,
    waitTrackFilter,
    colorNotationKids,
    showSynthesia,
    baseBpm,
  });
  stateRef.current = {
    notes,
    tracks,
    totalDuration,
    speed,
    transpose,
    timbre,
    loopEnabled,
    loopA,
    loopB,
    isPlaying,
    keyRange,
    showNoteLabels,
    waitMode,
    waitTrackFilter,
    colorNotationKids,
    showSynthesia,
    baseBpm,
  };

  const uniqueArtists = useMemo(() => {
    const set = new Set(MIDI_LIBRARY.map(p => p.artist));
    return ['Alle', ...Array.from(set)];
  }, []);

  const filteredLibrary = useMemo(() => {
    const q = libSearch.trim().toLowerCase();
    return MIDI_LIBRARY.filter(p => {
      if (libGenre !== 'Alle' && p.genre !== libGenre) return false;
      if (libArtist !== 'Alle' && p.artist !== libArtist) return false;
      if (q) {
        const hay = `${p.title} ${p.artist} ${p.genre} ${p.tags.join(' ')}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [libSearch, libGenre, libArtist]);

  useEffect(() => {
    const unsubState = midiInput.subscribeState(snap => {
      setMidiState(snap);
      activeMidiSetRef.current = new Set(snap.activeNotes);
    });
    const unsubNotes = midiInput.subscribeNotes(evt => {
      if (evt.type !== 'noteon') return;
      const batch = waitingBatchRef.current;
      if (batch.length > 0) {
        let hitAny = false;
        batch.forEach(item => {
          if (item.midi === evt.midi && !waitSatisfiedIdsRef.current.has(item.id)) {
            waitSatisfiedIdsRef.current.add(item.id);
            triggeredIdsRef.current.add(item.id);
            hitAny = true;
          }
        });
        if (hitAny) {
          setWaitHits(h => h + 1);
          const remaining = batch
            .filter(item => !waitSatisfiedIdsRef.current.has(item.id))
            .map(item => item.midi);
          setWaitingNotes(remaining);
          if (remaining.length === 0) {
            waitingBatchRef.current = [];
            lastFrameRef.current = performance.now();
          }
        }
      }
    });
    return () => {
      unsubState();
      unsubNotes();
    };
  }, []);

  const parseMidiBuffer = (buf: ArrayBuffer, fallbackTitle: string, idStr: string, fallbackKeyFifths?: number) => {
    const midi = new Midi(buf);
    const parsedTracks: MidiLibraryTrack[] = [];
    const parsedNotes: MidiLibraryNote[] = [];
    let id = 0;

    // Sort tracks so higher average pitch (Right Hand) comes first!
    const nonEmptyTracks = midi.tracks
      .filter(tr => tr.notes.length > 0)
      .map(tr => ({
        tr,
        avgMidi: tr.notes.reduce((s, n) => s + n.midi, 0) / tr.notes.length,
      }))
      .sort((a, b) => b.avgMidi - a.avgMidi);

    nonEmptyTracks.forEach(({ tr }, tIndex) => {
      const defaultHandName =
        nonEmptyTracks.length === 2
          ? tIndex === 0
            ? 'Rechte Hand'
            : 'Linke Hand'
          : tr.name || tr.instrument?.name || `Spur ${tIndex + 1}`;
      parsedTracks.push({
        index: tIndex,
        name: defaultHandName,
        color: MIDI_TRACK_COLORS[tIndex % MIDI_TRACK_COLORS.length],
        muted: false,
        noteCount: tr.notes.length,
      });
      tr.notes.forEach(n => {
        parsedNotes.push({
          id: id++,
          midi: n.midi,
          time: n.time,
          duration: Math.max(0.06, n.duration),
          velocity: Math.max(0.2, n.velocity),
          trackIdx: tIndex,
        });
      });
    });

    parsedNotes.sort((a, b) => a.time - b.time);
    const dur = Math.max(2, midi.duration || (parsedNotes.length ? parsedNotes[parsedNotes.length - 1].time + 1 : 4));
    const detectedBpm = Math.round(midi.header.tempos[0]?.bpm ?? 100);
    const ts = midi.header.timeSignatures[0]?.timeSignature;
    const detectedTs: [number, number] = ts && ts.length >= 2 ? [ts[0], ts[1]] : [4, 4];

    // Extract Key Signature timeline from MIDI header (including mid-piece modulations!)
    const rawKs = midi.header.keySignatures ?? [];
    const extractedKeys: Array<{ time: number; fifths: number }> = [];
    const seenTick = new Set<number>();
    for (const ks of rawKs) {
      if (seenTick.has(ks.ticks)) continue;
      seenTick.add(ks.ticks);
      const fifths = MAJOR_KEY_TO_FIFTHS[ks.key];
      if (typeof fifths === 'number') {
        extractedKeys.push({ time: midi.header.ticksToSeconds(ks.ticks), fifths });
      }
    }
    extractedKeys.sort((a, b) => a.time - b.time);
    if (extractedKeys.length === 0) {
      const f =
        typeof fallbackKeyFifths === 'number' ? fallbackKeyFifths : estimateKeyFifthsFromNotes(parsedNotes);
      extractedKeys.push({ time: 0, fifths: f });
    } else if (extractedKeys[0].time > 0.2) {
      // Some MIDIs put the first key meta-event slightly after tick 0; apply it from 0s
      extractedKeys[0].time = 0;
    }

    setPieceId(idStr);
    setPieceTitle(fallbackTitle);
    setTracks(parsedTracks);
    setNotes(parsedNotes);
    setTotalDuration(dur);
    setBaseBpm(detectedBpm);
    setTimeSignature(detectedTs);
    setKeyTimeline(extractedKeys);
    setLoopA(0);
    setLoopB(Math.min(dur, 12));
    setWaitTrackFilter('all');
    playTimeRef.current = 0;
    setCurrentTime(0);
    triggeredIdsRef.current.clear();
    waitSatisfiedIdsRef.current.clear();
    waitingBatchRef.current = [];
    setWaitingNotes([]);
  };

  const loadPiece = async (piece: MidiLibraryPiece) => {
    setIsPlaying(false);
    setLibraryOpen(false);
    if (piece.midiUrl) {
      setLoadingPiece(true);
      try {
        const res = await fetch(piece.midiUrl);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const buf = await res.arrayBuffer();
        parseMidiBuffer(buf, `${piece.artist} – ${piece.title}`, piece.id, piece.keyFifths);
      } catch (err) {
        alert(`MIDI-Datei konnte nicht geladen werden: ${err instanceof Error ? err.message : 'Fehler'}`);
      } finally {
        setLoadingPiece(false);
      }
      return;
    }

    if (piece.build) {
      const built = piece.build();
      setPieceId(piece.id);
      setPieceTitle(`${piece.artist} – ${piece.title}`);
      setTracks(built.tracks);
      setNotes(built.notes);
      setTotalDuration(built.duration);
      setBaseBpm(built.bpm);
      setTimeSignature(built.timeSignature);
      setKeyTimeline([{ time: 0, fifths: piece.keyFifths ?? 0 }]);
      setLoopA(0);
      setLoopB(Math.min(built.duration, 10));
      setWaitTrackFilter('all');
      playTimeRef.current = 0;
      setCurrentTime(0);
      triggeredIdsRef.current.clear();
      waitSatisfiedIdsRef.current.clear();
      waitingBatchRef.current = [];
      setWaitingNotes([]);
    }
  };

  // Load initial complete Bach BWV 846 MIDI on mount
  useEffect(() => {
    void loadPiece(MIDI_LIBRARY[0]);
  }, []);

  const handleMidiUpload = async (file: File) => {
    try {
      setIsPlaying(false);
      const buf = await file.arrayBuffer();
      parseMidiBuffer(buf, file.name.replace(/\.(mid|midi)$/i, ''), 'custom');
    } catch (err) {
      alert(`MIDI-Datei konnte nicht gelesen werden: ${err instanceof Error ? err.message : 'Unbekannter Fehler'}`);
    }
  };

  const seekTo = (t: number) => {
    const clamped = Math.max(0, Math.min(totalDuration, t));
    playTimeRef.current = clamped;
    setCurrentTime(clamped);
    triggeredIdsRef.current.clear();
    waitSatisfiedIdsRef.current.clear();
    waitingBatchRef.current = [];
    setWaitingNotes([]);
    notes.forEach(n => {
      if (n.time < clamped - 0.02) {
        triggeredIdsRef.current.add(n.id);
        waitSatisfiedIdsRef.current.add(n.id);
      }
    });
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    const kbTop = rect.height - kbHeightRef.current;
    if (clickY < kbTop) return;

    const inBlackZone = clickY < kbTop + kbHeightRef.current * 0.62;
    let hitMidi: number | null = null;

    if (inBlackZone) {
      keyGeomRef.current.forEach((g, midi) => {
        if (g.isBlack && clickX >= g.x && clickX <= g.x + g.width) hitMidi = midi;
      });
    }
    if (hitMidi === null) {
      keyGeomRef.current.forEach((g, midi) => {
        if (!g.isBlack && clickX >= g.x && clickX <= g.x + g.width) hitMidi = midi;
      });
    }

    if (hitMidi !== null) {
      audioEngine.playNote(hitMidi, { timbre, duration: 0.9, velocity: 0.85 });
      midiInput.triggerVirtualNote(hitMidi, 260);
    }
  };

  useEffect(() => {
    const renderFrame = (now: number) => {
      const s = stateRef.current;

      if (s.isPlaying) {
        if (lastFrameRef.current === null) lastFrameRef.current = now;
        const dtSec = Math.min(0.1, (now - lastFrameRef.current) / 1000) * s.speed;
        lastFrameRef.current = now;

        const mutedSet = new Set(s.tracks.filter(t => t.muted).map(t => t.index));
        const shouldWaitForNote = (n: MidiLibraryNote) =>
          s.waitMode &&
          !mutedSet.has(n.trackIdx) &&
          (s.waitTrackFilter === 'all' || s.waitTrackFilter === n.trackIdx);

        if (s.waitMode && waitingBatchRef.current.length > 0) {
          waitingBatchRef.current.forEach(item => {
            if (activeMidiSetRef.current.has(item.midi) && !waitSatisfiedIdsRef.current.has(item.id)) {
              waitSatisfiedIdsRef.current.add(item.id);
              triggeredIdsRef.current.add(item.id);
            }
          });
          const rem = waitingBatchRef.current.filter(item => !waitSatisfiedIdsRef.current.has(item.id));
          if (rem.length === 0) {
            waitingBatchRef.current = [];
            setWaitingNotes([]);
          }
        } else {
          const nextT = playTimeRef.current + dtSec;

          if (s.waitMode) {
            const nextRequired = s.notes.find(
              n =>
                shouldWaitForNote(n) &&
                !waitSatisfiedIdsRef.current.has(n.id) &&
                n.time <= nextT + 0.015
            );
            if (nextRequired) {
              const onsetTime = nextRequired.time;
              const chordBatch = s.notes
                .filter(
                  n =>
                    shouldWaitForNote(n) &&
                    !waitSatisfiedIdsRef.current.has(n.id) &&
                    Math.abs(n.time - onsetTime) <= 0.045
                )
                .map(n => ({ id: n.id, midi: n.midi + s.transpose }));

              s.notes.forEach(n => {
                if (
                  !shouldWaitForNote(n) &&
                  !mutedSet.has(n.trackIdx) &&
                  !triggeredIdsRef.current.has(n.id) &&
                  n.time <= onsetTime + 0.02
                ) {
                  triggeredIdsRef.current.add(n.id);
                  audioEngine.playNote(n.midi + s.transpose, {
                    duration: Math.max(0.18, Math.min(3.5, n.duration / s.speed)),
                    velocity: n.velocity * 0.8,
                    timbre: s.timbre,
                  });
                }
              });

              playTimeRef.current = onsetTime;
              setCurrentTime(onsetTime);
              waitingBatchRef.current = chordBatch;
              setWaitingNotes(chordBatch.map(b => b.midi));
            } else {
              advanceAndTrigger(nextT, mutedSet, shouldWaitForNote, s);
            }
          } else {
            advanceAndTrigger(nextT, mutedSet, shouldWaitForNote, s);
          }
        }
      } else {
        lastFrameRef.current = null;
      }

      const canvas = canvasRef.current;
      if (canvas && s.showSynthesia) {
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        const w = Math.max(600, Math.floor(rect.width));
        const h = Math.max(320, Math.floor(rect.height));
        if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
          canvas.width = w * dpr;
          canvas.height = h * dpr;
        }
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.save();
          ctx.scale(dpr, dpr);
          drawSynthesia(ctx, w, h, playTimeRef.current, s);
          ctx.restore();
        }
      }

      rafRef.current = requestAnimationFrame(renderFrame);
    };

    const advanceAndTrigger = (
      nextT: number,
      mutedSet: Set<number>,
      shouldWaitForNote: (n: MidiLibraryNote) => boolean,
      s: typeof stateRef.current
    ) => {
      if (s.loopEnabled && s.loopB > s.loopA + 0.2 && nextT >= s.loopB) {
        nextT = s.loopA;
        triggeredIdsRef.current.clear();
        waitSatisfiedIdsRef.current.clear();
        s.notes.forEach(n => {
          if (n.time < s.loopA - 0.02) {
            triggeredIdsRef.current.add(n.id);
            waitSatisfiedIdsRef.current.add(n.id);
          }
        });
      } else if (nextT >= s.totalDuration) {
        nextT = 0;
        triggeredIdsRef.current.clear();
        waitSatisfiedIdsRef.current.clear();
      }

      const prevT = playTimeRef.current;
      playTimeRef.current = nextT;
      setCurrentTime(nextT);

      for (const n of s.notes) {
        if (n.time > nextT + 0.015) break;
        if (n.time >= prevT - 0.05 && !triggeredIdsRef.current.has(n.id)) {
          triggeredIdsRef.current.add(n.id);
          if (!mutedSet.has(n.trackIdx) && !shouldWaitForNote(n)) {
            audioEngine.playNote(n.midi + s.transpose, {
              duration: Math.max(0.18, Math.min(3.5, n.duration / s.speed)),
              velocity: n.velocity * 0.85,
              timbre: s.timbre,
            });
          }
        }
      }
    };

    rafRef.current = requestAnimationFrame(renderFrame);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  function drawSynthesia(
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    t: number,
    s: typeof stateRef.current
  ) {
    const startMidi = s.keyRange === '88' ? 21 : 36;
    const endMidi = s.keyRange === '88' ? 108 : 96;
    const kbHeight = 108;
    kbHeightRef.current = kbHeight;
    const wfHeight = h - kbHeight;
    const lookaheadSec = 3.2;
    const pxPerSec = wfHeight / lookaheadSec;

    ctx.fillStyle = '#090c14';
    ctx.fillRect(0, 0, w, h);

    const whiteMidis: number[] = [];
    for (let m = startMidi; m <= endMidi; m++) {
      if (!IS_BLACK[m % 12]) whiteMidis.push(m);
    }
    const whiteW = w / whiteMidis.length;
    const blackW = whiteW * 0.64;
    const keyGeom = new Map<number, { x: number; width: number; isBlack: boolean }>();

    let wIdx = 0;
    for (let m = startMidi; m <= endMidi; m++) {
      if (!IS_BLACK[m % 12]) {
        keyGeom.set(m, { x: wIdx * whiteW, width: whiteW, isBlack: false });
        wIdx++;
      } else {
        keyGeom.set(m, { x: wIdx * whiteW - blackW / 2, width: blackW, isBlack: true });
      }
    }
    keyGeomRef.current = keyGeom;

    for (let m = startMidi; m <= endMidi; m++) {
      if (m % 12 === 0) {
        const g = keyGeom.get(m);
        if (g) {
          ctx.strokeStyle = 'rgba(148, 163, 184, 0.12)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(g.x, 0);
          ctx.lineTo(g.x, wfHeight);
          ctx.stroke();
        }
      }
    }

    const beatSec = 60 / s.baseBpm;
    const firstBeat = Math.floor(t / beatSec);
    for (let b = firstBeat; b <= firstBeat + Math.ceil(lookaheadSec / beatSec) + 1; b++) {
      const beatT = b * beatSec;
      const y = wfHeight - (beatT - t) * pxPerSec;
      if (y < 0 || y > wfHeight) continue;
      const isBar = b % 4 === 0;
      ctx.strokeStyle = isBar ? 'rgba(245, 158, 11, 0.20)' : 'rgba(148, 163, 184, 0.07)';
      ctx.lineWidth = isBar ? 1.4 : 1;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    if (s.loopEnabled) {
      [
        { time: s.loopA, color: '#10b981' },
        { time: s.loopB, color: '#f43f5e' },
      ].forEach(marker => {
        const y = wfHeight - (marker.time - t) * pxPerSec;
        if (y >= 0 && y <= wfHeight) {
          ctx.strokeStyle = marker.color;
          ctx.lineWidth = 2;
          ctx.setLineDash([6, 4]);
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(w, y);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      });
    }

    const activeKeyColor = new Map<number, string>();
    const waitingKeySet = new Set(waitingBatchRef.current.map(b => b.midi));
    const userPressedSet = activeMidiSetRef.current;
    const mutedSet = new Set(s.tracks.filter(tr => tr.muted).map(tr => tr.index));

    for (const n of s.notes) {
      if (n.time > t + lookaheadSec) break;
      if (n.time + n.duration < t) continue;

      const shiftedMidi = n.midi + s.transpose;
      const geom = keyGeom.get(shiftedMidi);
      if (!geom) continue;

      const isMuted = mutedSet.has(n.trackIdx);
      const pc = ((shiftedMidi % 12) + 12) % 12;
      const color = s.colorNotationKids
        ? CHROMA_NOTES_COLORS[pc].hex
        : s.tracks[n.trackIdx]?.color ?? MIDI_TRACK_COLORS[0];

      const yBottom = wfHeight - (n.time - t) * pxPerSec;
      const barH = Math.max(8, n.duration * pxPerSec);
      const yTop = yBottom - barH;

      const isHitting = n.time <= t && n.time + n.duration >= t;
      if (isHitting && !isMuted) {
        activeKeyColor.set(shiftedMidi, color);
      }

      ctx.save();
      ctx.globalAlpha = isMuted ? 0.18 : 0.94;
      if (isHitting && !isMuted) {
        ctx.shadowColor = color;
        ctx.shadowBlur = 14;
      }

      const pad = geom.isBlack ? 1 : 1.8;
      const bx = geom.x + pad;
      const bw = Math.max(4, geom.width - pad * 2);
      const clampedTop = Math.max(0, yTop);
      const clampedBottom = Math.min(wfHeight, yBottom);
      const clampedH = Math.max(2, clampedBottom - clampedTop);

      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.roundRect(bx, clampedTop, bw, clampedH, 4);
      ctx.fill();

      ctx.fillStyle = 'rgba(255,255,255,0.28)';
      ctx.fillRect(bx + 1, clampedTop + 1, bw - 2, Math.min(3, clampedH));

      if (s.showNoteLabels && clampedH > 16 && bw >= 12) {
        ctx.shadowBlur = 0;
        ctx.fillStyle = s.colorNotationKids ? '#ffffff' : '#090c14';
        ctx.font = `bold ${bw < 16 ? 8 : 10}px Inter, sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText(pcToName(pc), bx + bw / 2, clampedBottom - 5);
      }
      ctx.restore();
    }

    ctx.fillStyle = waitingKeySet.size > 0 ? '#10b981' : '#f59e0b';
    ctx.fillRect(0, wfHeight - 2, w, 2);

    for (let m = startMidi; m <= endMidi; m++) {
      const g = keyGeom.get(m);
      if (!g || g.isBlack) continue;
      const pc = m % 12;
      const isUserPressed = userPressedSet.has(m);
      const isWaitTarget = waitingKeySet.has(m);
      const hitColor = activeKeyColor.get(m);

      ctx.fillStyle = isUserPressed ? '#10b981' : isWaitTarget ? '#fef08a' : hitColor ?? '#f8fafc';
      ctx.fillRect(g.x, wfHeight, g.width - 1, kbHeight);
      ctx.strokeStyle = isWaitTarget ? '#10b981' : '#334155';
      ctx.lineWidth = isWaitTarget ? 2.5 : 1;
      ctx.strokeRect(g.x, wfHeight, g.width - 1, kbHeight);

      if (s.colorNotationKids) {
        const stickerColor = CHROMA_NOTES_COLORS[pc].hex;
        ctx.fillStyle = stickerColor;
        ctx.beginPath();
        ctx.arc(g.x + g.width / 2, wfHeight + kbHeight - 22, Math.min(9, g.width * 0.34), 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 8.5px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(pc === 11 ? 'H' : pcToName(pc), g.x + g.width / 2, wfHeight + kbHeight - 19);
      } else if (isWaitTarget) {
        ctx.fillStyle = '#047857';
        ctx.beginPath();
        ctx.arc(g.x + g.width / 2, wfHeight + kbHeight - 26, 5, 0, Math.PI * 2);
        ctx.fill();
      }

      if ((m % 12 === 0 || isWaitTarget) && !s.colorNotationKids) {
        ctx.fillStyle = isUserPressed || hitColor || isWaitTarget ? '#090c14' : '#475569';
        ctx.font = 'bold 9px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(
          isWaitTarget ? pcToName(pc) : `C${Math.floor(m / 12) - 1}`,
          g.x + g.width / 2,
          wfHeight + kbHeight - 8
        );
      }
    }

    const blackH = kbHeight * 0.60;
    for (let m = startMidi; m <= endMidi; m++) {
      const g = keyGeom.get(m);
      if (!g || !g.isBlack) continue;
      const pc = m % 12;
      const isUserPressed = userPressedSet.has(m);
      const isWaitTarget = waitingKeySet.has(m);
      const hitColor = activeKeyColor.get(m);

      ctx.fillStyle = isUserPressed ? '#10b981' : isWaitTarget ? '#facc15' : hitColor ?? '#0f172a';
      ctx.beginPath();
      ctx.roundRect(g.x, wfHeight, g.width, blackH, [0, 0, 3, 3]);
      ctx.fill();
      ctx.strokeStyle = isWaitTarget ? '#10b981' : '#020617';
      ctx.lineWidth = isWaitTarget ? 2 : 1;
      ctx.stroke();

      if (s.colorNotationKids) {
        ctx.fillStyle = CHROMA_NOTES_COLORS[pc].hex;
        ctx.beginPath();
        ctx.arc(g.x + g.width / 2, wfHeight + blackH - 10, Math.min(4.5, g.width * 0.3), 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  const activeKeyFifths = useMemo(() => {
    let base = keyTimeline[0]?.fifths ?? 0;
    for (const entry of keyTimeline) {
      if (entry.time <= currentTime + 0.05) base = entry.fifths;
      else break;
    }
    return transposeFifths(base, transpose);
  }, [keyTimeline, currentTime, transpose]);

  const visibleStaffNotes = useMemo(() => {
    // Generous lookback (1.6s) & lookahead (5.5s) so beamed note groups NEVER split/flip stems at the left clip boundary!
    const windowBefore = 1.6;
    const windowAhead = 5.5;
    const mutedSet = new Set(tracks.filter(tr => tr.muted).map(tr => tr.index));
    return notes.filter(
      n => !mutedSet.has(n.trackIdx) && n.time >= currentTime - windowBefore && n.time <= currentTime + windowAhead
    );
  }, [notes, tracks, currentTime]);

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const notationSection = showNotation ? (
    <div className="studio-card rounded-2xl p-3.5 sm:p-4 space-y-2.5">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <span className="font-bold text-slate-100">
          {colorNotationKids
            ? 'Notensystem – Farbnotationsstandard (Boomwhacker / Kinder-Sticker)'
            : 'Klassischer Notensatz (Bravura Engraving • Violin- & Bassschlüssel)'}
        </span>

        <div className="flex flex-wrap items-center gap-2 text-slate-400">
          <ZoomIn className="w-3.5 h-3.5 text-amber-400" />
          <span>Notengröße:</span>
          <input
            type="range"
            min={0.85}
            max={1.8}
            step={0.05}
            value={notationScale}
            onChange={e => setNotationScale(Number(e.target.value))}
            className="w-24 accent-amber-500"
          />
          <span className="font-mono font-bold text-amber-300 w-10">{Math.round(notationScale * 100)}%</span>
          <div className="flex gap-1">
            {[
              { label: 'S', val: 0.9 },
              { label: 'M', val: 1.1 },
              { label: 'L', val: 1.4 },
              { label: 'XL', val: 1.7 },
            ].map(sz => (
              <button
                key={sz.label}
                onClick={() => setNotationScale(sz.val)}
                className={`px-1.5 py-0.5 rounded text-[10px] font-bold cursor-pointer ${
                  Math.abs(notationScale - sz.val) < 0.08
                    ? 'bg-amber-500 text-slate-950'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {sz.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {colorNotationKids && (
        <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
          {[0, 2, 4, 5, 7, 9, 11].map(pc => (
            <span
              key={pc}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-white font-bold shadow-xs"
              style={{ backgroundColor: CHROMA_NOTES_COLORS[pc].hex }}
            >
              {CHROMA_NOTES_COLORS[pc].nameDe}
            </span>
          ))}
        </div>
      )}

      <ClassicalStaffSVG
        notes={visibleStaffNotes}
        currentTime={currentTime}
        baseBpm={baseBpm}
        timeSignature={timeSignature}
        keyFifths={activeKeyFifths}
        transpose={transpose}
        scale={notationScale}
        colorNotationKids={colorNotationKids}
      />
    </div>
  ) : null;

  const synthesiaSection = showSynthesia ? (
    <div className="studio-card rounded-2xl p-2 sm:p-3 overflow-hidden">
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        title="Klicke auf die Klaviertasten oder spiele über dein USB-MIDI-Keyboard"
        className="w-full h-[380px] sm:h-[430px] rounded-xl block cursor-pointer"
      />
    </div>
  ) : null;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Piano className="w-6 h-6 text-cyan-400" />
            MIDI Synthesia &amp; Klassischer Noten-Player
          </h2>
          <p className="text-sm text-slate-400">
            Klassischer Bravura-Notensatz, Synthesia-Wasserfall, Bibliothek mit {MIDI_LIBRARY.length} Stücken, USB-MIDI Warte-Modus &amp; A–B Loop.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setLibraryOpen(v => !v)}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold border cursor-pointer transition-all ${
              libraryOpen
                ? 'bg-amber-500 border-amber-400 text-slate-950 shadow-lg shadow-amber-500/20'
                : 'bg-slate-900 border-amber-500/50 hover:bg-amber-500/15 text-amber-300'
            }`}
          >
            <Library className="w-4 h-4" />
            Noten-Bibliothek ({MIDI_LIBRARY.length})
          </button>

          <button
            onClick={() => void midiInput.connect()}
            className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold border cursor-pointer ${
              midiState.connected
                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                : 'bg-slate-900 border-slate-700 hover:border-cyan-500 text-slate-200'
            }`}
          >
            <Cable className="w-4 h-4" />
            {midiState.connected ? `MIDI: ${midiState.devices[0]?.name}` : 'USB-MIDI'}
          </button>

          <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs cursor-pointer shadow-lg shadow-cyan-500/20">
            <Upload className="w-4 h-4" />
            Eigene .mid laden
            <input
              type="file"
              accept=".mid,.midi"
              className="hidden"
              onChange={e => {
                const f = e.target.files?.[0];
                if (f) void handleMidiUpload(f);
              }}
            />
          </label>
        </div>
      </div>

      {/* Expandable MIDI Library Picker (Genres, Artists/Komponisten, Search & Tags!) */}
      {libraryOpen && (
        <div className="studio-card rounded-2xl p-4 sm:p-5 space-y-4 border-amber-500/35">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-bold text-amber-300 flex items-center gap-2">
              <Library className="w-4 h-4" />
              Synthesia &amp; Noten-Bibliothek durchsuchen ({filteredLibrary.length} von {MIDI_LIBRARY.length})
            </h3>
            <button
              onClick={() => setLibraryOpen(false)}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Search + Artist dropdown */}
          <div className="flex flex-wrap items-center gap-2.5 text-xs">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={libSearch}
                onChange={e => setLibSearch(e.target.value)}
                placeholder="Stück, Komponist, Tag suchen (z.B. Bach, Chopin, 3/4, Jazz)..."
                className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <select
              value={libArtist}
              onChange={e => setLibArtist(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 font-semibold"
            >
              {uniqueArtists.map(a => (
                <option key={a} value={a}>
                  Komponist / Artist: {a}
                </option>
              ))}
            </select>
          </div>

          {/* Genre Filter Chips */}
          <div className="flex flex-wrap gap-1.5 text-xs">
            {(['Alle', ...ALL_MIDI_GENRES] as const).map(g => (
              <button
                key={g}
                onClick={() => setLibGenre(g)}
                className={`px-2.5 py-1 rounded-lg font-semibold border cursor-pointer ${
                  libGenre === g
                    ? 'bg-amber-500 text-slate-950 border-amber-400'
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-600'
                }`}
              >
                {g}
              </button>
            ))}
          </div>

          {/* Piece Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-[320px] overflow-y-auto pr-1">
            {filteredLibrary.map(p => {
              const active = pieceId === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => loadPiece(p)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer space-y-1.5 ${
                    active
                      ? 'bg-amber-500/20 border-amber-400'
                      : 'bg-slate-900/80 border-slate-800 hover:border-cyan-500/50 hover:bg-slate-800/80'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold text-amber-300">{p.artist}</span>
                    <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] font-semibold text-cyan-300">
                      {p.genre}
                    </span>
                  </div>
                  <div className="text-xs font-bold text-white leading-snug">{p.title}</div>
                  <div className="flex flex-wrap items-center gap-1 pt-0.5">
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-950 text-amber-300 font-mono font-bold">
                      {p.durationLabel}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-950 text-slate-400">
                      {p.timeSignature[0]}/{p.timeSignature[1]}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-950 text-emerald-300">
                      {p.difficulty}
                    </span>
                    {p.midiUrl && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/15 text-cyan-300 font-semibold">
                        Original .mid
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Current Piece Banner + Quick Picks */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-slate-400">{loadingPiece ? 'Lade MIDI...' : 'Geladen:'}</span>
          <span className="font-bold text-white">{pieceTitle}</span>
          <span className="px-2 py-0.5 rounded bg-slate-800 text-amber-300 font-mono text-[11px]">
            {timeSignature[0]}/{timeSignature[1]} • {FIFTHS_LABEL[activeKeyFifths] ?? 'C-Dur'} • {formatTime(totalDuration)} • {notes.length} Noten
          </span>
        </div>
        <button
          onClick={() => setLibraryOpen(v => !v)}
          className="text-cyan-400 hover:text-cyan-300 font-bold cursor-pointer"
        >
          {libraryOpen ? 'Bibliothek schließen' : 'Anderes Stück aus Bibliothek wählen →'}
        </button>
      </div>

      {/* Transport, Layout, Kids Color Notation & Practice Controls */}
      <div className="studio-card rounded-2xl p-4 space-y-3.5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsPlaying(p => !p)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm cursor-pointer ${
                isPlaying ? 'bg-amber-500 text-slate-950' : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
              }`}
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
              {isPlaying ? 'Pause' : 'Start'}
            </button>
            <button
              onClick={() => {
                setIsPlaying(false);
                seekTo(loopEnabled ? loopA : 0);
              }}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer"
              title="Zum Anfang"
            >
              <Square className="w-4 h-4 fill-current" />
            </button>

            <button
              onClick={() => {
                const next = !waitMode;
                setWaitMode(next);
                if (!next) {
                  waitingBatchRef.current = [];
                  setWaitingNotes([]);
                } else {
                  midiInput.autoConnectIfPossible();
                }
              }}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border cursor-pointer transition-all ${
                waitMode
                  ? 'bg-emerald-500/25 border-emerald-400 text-emerald-200'
                  : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-emerald-500/50'
              }`}
            >
              <HandMetal className="w-3.5 h-3.5" />
              Warte-Modus: {waitMode ? 'AN' : 'AUS'}
            </button>

            {waitMode && (
              <select
                value={waitTrackFilter === 'all' ? 'all' : String(waitTrackFilter)}
                onChange={e => setWaitTrackFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                className="bg-slate-900 border border-emerald-500/40 rounded-xl px-2 py-1.5 text-xs text-emerald-200 font-semibold"
              >
                <option value="all">Alle Spuren</option>
                {tracks.map(tr => (
                  <option key={tr.index} value={tr.index}>
                    Nur: {tr.name}
                  </option>
                ))}
              </select>
            )}

            <div className="text-xs font-mono text-slate-300 px-1.5">
              {formatTime(currentTime)} / {formatTime(totalDuration)}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs">
            <label className="flex items-center gap-1.5 text-slate-300">
              <span>{Math.round(baseBpm * speed)} BPM</span>
              <input
                type="range"
                min={0.25}
                max={1.5}
                step={0.05}
                value={speed}
                onChange={e => setSpeed(Number(e.target.value))}
                className="w-20 accent-amber-500"
              />
              <span className="font-mono font-bold text-amber-300 w-9">{Math.round(speed * 100)}%</span>
            </label>

            <div className="flex items-center gap-1 text-slate-300">
              <ArrowUpDown className="w-3.5 h-3.5 text-cyan-400" />
              <button
                onClick={() => setTranspose(v => Math.max(-12, v - 1))}
                className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 font-bold cursor-pointer"
              >
                -
              </button>
              <span className="font-mono font-bold text-cyan-300 w-7 text-center">
                {transpose > 0 ? `+${transpose}` : transpose}
              </span>
              <button
                onClick={() => setTranspose(v => Math.min(12, v + 1))}
                className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 font-bold cursor-pointer"
              >
                +
              </button>
            </div>

            <select
              value={timbre}
              onChange={e => setTimbre(e.target.value as InstrumentTimbre)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-slate-200"
            >
              <option value="piano">Grand Piano</option>
              <option value="epiano">Neo-Soul Rhodes</option>
              <option value="warmPad">Warm Analog Pad</option>
              <option value="strings">Orchestral Strings</option>
              <option value="organ">Warm Jazz Organ</option>
              <option value="guitar">Clean Gitarre</option>
              <option value="nylon">Nylon Gitarre</option>
            </select>
          </div>
        </div>

        {/* Display Controls */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2.5 border-t border-slate-800/80 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowSynthesia(v => !v)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg font-semibold border cursor-pointer ${
                showSynthesia
                  ? 'bg-cyan-500/20 border-cyan-500 text-cyan-200'
                  : 'bg-slate-900 border-slate-800 text-slate-400'
              }`}
            >
              <Piano className="w-3.5 h-3.5" /> Synthesia: {showSynthesia ? 'AN' : 'AUS'}
            </button>

            <button
              onClick={() => setShowNotation(v => !v)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg font-semibold border cursor-pointer ${
                showNotation
                  ? 'bg-amber-500/20 border-amber-500 text-amber-200'
                  : 'bg-slate-900 border-slate-800 text-slate-400'
              }`}
            >
              <Music2 className="w-3.5 h-3.5" /> Noten: {showNotation ? 'AN' : 'AUS'}
            </button>

            {showSynthesia && showNotation && (
              <button
                onClick={() =>
                  setLayoutOrder(o => (o === 'synthesia-first' ? 'notation-first' : 'synthesia-first'))
                }
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold cursor-pointer"
              >
                {layoutOrder === 'synthesia-first' ? (
                  <>
                    <ArrowDown className="w-3.5 h-3.5 text-amber-400" /> Synthesia → Noten
                  </>
                ) : (
                  <>
                    <ArrowUp className="w-3.5 h-3.5 text-cyan-400" /> Noten → Synthesia
                  </>
                )}
              </button>
            )}

            <button
              onClick={() => setColorNotationKids(v => !v)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold border cursor-pointer transition-all ${
                colorNotationKids
                  ? 'bg-gradient-to-r from-rose-500/25 via-amber-500/25 to-blue-500/25 border-amber-400 text-white'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-600'
              }`}
            >
              <Palette className="w-3.5 h-3.5 text-amber-400" />
              Farbnotation (Kinder): {colorNotationKids ? 'AN' : 'AUS'}
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setKeyRange(r => (r === '61' ? '88' : '61'))}
              className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 font-semibold cursor-pointer"
            >
              {keyRange} Tasten
            </button>
            <button
              onClick={() => setShowNoteLabels(v => !v)}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border cursor-pointer ${
                showNoteLabels ? 'bg-slate-800 border-slate-600 text-white' : 'bg-slate-900 border-slate-800 text-slate-400'
              }`}
            >
              <Eye className="w-3.5 h-3.5" /> Namen
            </button>
          </div>
        </div>

        {waitMode && (
          <div className="p-2.5 rounded-xl bg-emerald-500/12 border border-emerald-500/35 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-emerald-200 font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              {waitingNotes.length > 0 ? (
                <span>
                  Warte auf Taste(n):{' '}
                  <span className="font-mono font-black text-amber-300">
                    {waitingNotes.map(m => midiToNoteName(m)).join(' + ')}
                  </span>
                </span>
              ) : (
                <span>Warte-Modus aktiv – starte Wiedergabe und spiele die gelb markierten Ziel-Tasten.</span>
              )}
            </div>
            <span className="font-mono text-emerald-300 font-bold">Treffer: {waitHits}</span>
          </div>
        )}

        {/* Scrubber + A-B Loop + Tracks */}
        <div className="space-y-2 pt-2 border-t border-slate-800/80">
          <input
            type="range"
            min={0}
            max={totalDuration}
            step={0.05}
            value={currentTime}
            onChange={e => seekTo(Number(e.target.value))}
            className="w-full accent-amber-500 cursor-pointer"
          />

          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setLoopEnabled(v => !v)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold border cursor-pointer ${
                  loopEnabled
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                <Repeat className="w-3.5 h-3.5" /> A–B Loop: {loopEnabled ? 'AN' : 'AUS'}
              </button>
              <button
                onClick={() => {
                  const a = Math.min(currentTime, Math.max(0, loopB - 0.5));
                  setLoopA(a);
                  setLoopEnabled(true);
                }}
                className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-300 font-semibold cursor-pointer"
              >
                Set A ({formatTime(loopA)})
              </button>
              <button
                onClick={() => {
                  const b = Math.max(currentTime, loopA + 0.5);
                  setLoopB(Math.min(totalDuration, b));
                  setLoopEnabled(true);
                }}
                className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-rose-300 font-semibold cursor-pointer"
              >
                Set B ({formatTime(loopB)})
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {tracks.map(tr => (
                <button
                  key={tr.index}
                  onClick={() =>
                    setTracks(prev => prev.map(p => (p.index === tr.index ? { ...p, muted: !p.muted } : p)))
                  }
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold cursor-pointer transition-all ${
                    tr.muted
                      ? 'bg-slate-950 border-slate-800 text-slate-500 line-through'
                      : 'bg-slate-900 border-slate-700 text-slate-100'
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: tr.color }} />
                  {tr.name}
                  {tr.muted ? <VolumeX className="w-3 h-3 text-rose-400" /> : <Volume2 className="w-3 h-3 text-slate-400" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {!showSynthesia && !showNotation && (
        <div className="studio-card rounded-2xl p-8 text-center text-sm text-slate-400">
          Beide Ansichten sind ausgeblendet. Aktiviere oben <strong>Synthesia</strong> oder <strong>Noten</strong>.
        </div>
      )}

      {layoutOrder === 'synthesia-first' ? (
        <>
          {synthesiaSection}
          {notationSection}
        </>
      ) : (
        <>
          {notationSection}
          {synthesiaSection}
        </>
      )}
    </div>
  );
};
