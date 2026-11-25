import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Play,
  Square,
  Plus,
  Trash2,
  Layers,
  Music,
  Sliders,
  Sparkles,
  Volume2,
  Guitar,
  Piano,
  Save,
  Bookmark,
  Cable,
} from 'lucide-react';
import {
  CHORDS,
  SCALES,
  GUITAR_TUNINGS,
  getNoteNamesArray,
  LayerSpec,
  computeFretboardDots,
  getCagedPositionsForRoot,
  generateChordVoicings,
  generateChordArpeggioNotes,
  getLayerToneMap,
  getPianoChordMidi,
  formatChordName,
  pcToName,
  shouldUseFlats,
  FretDot,
  identifyChordFromMidis,
  VoicingShapeCategory,
} from '../theory/musicTheory';
import { FretboardSVG } from '../components/FretboardSVG';
import { PianoKeyboardSVG, PianoKeyHighlight } from '../components/PianoKeyboardSVG';
import { audioEngine, InstrumentTimbre } from '../audio/audioEngine';
import { midiInput } from '../audio/midiInput';
import {
  PRESET_KEYS,
  SavedPreset,
  deleteUserPreset,
  loadUserPresets,
  saveUserPreset,
} from '../utils/storage';

type HelperTab = 'scales' | 'chords' | 'arpeggio';

const LAYER_COLORS = ['#06b6d4', '#10b981', '#f43f5e', '#8b5cf6', '#f97316', '#ec4899'];

interface ArpChordItem {
  id: string;
  rootPc: number;
  chordId: string;
}

const ARP_PRESETS: Array<{ name: string; chords: Array<{ rootPc: number; chordId: string }> }> = [
  { name: 'Jazz ii–V–I (C)', chords: [{ rootPc: 2, chordId: 'm7' }, { rootPc: 7, chordId: '7' }, { rootPc: 0, chordId: 'maj7' }] },
  { name: 'Neo-Soul (Em)', chords: [{ rootPc: 4, chordId: 'm9' }, { rootPc: 9, chordId: 'm7' }, { rootPc: 2, chordId: '9' }, { rootPc: 7, chordId: 'maj7' }] },
  { name: 'Moll-Kadenz (Am)', chords: [{ rootPc: 9, chordId: 'm7' }, { rootPc: 5, chordId: 'maj7' }, { rootPc: 2, chordId: 'm7b5' }, { rootPc: 4, chordId: '7' }] },
  { name: 'Blues Turnaround (A)', chords: [{ rootPc: 9, chordId: '7' }, { rootPc: 2, chordId: '7' }, { rootPc: 4, chordId: '7' }] },
];

export const FretboardHelper: React.FC = () => {
  const [subTab, setSubTab] = useState<HelperTab>('scales');
  const [viewMode, setViewMode] = useState<'guitar' | 'piano' | 'both'>('both');
  const [tuningIdx, setTuningIdx] = useState(0);
  const [labelMode, setLabelMode] = useState<'note' | 'degree'>('note');
  const [useFlats, setUseFlats] = useState(false);
  const [timbre, setTimbre] = useState<InstrumentTimbre>('guitar');

  // --- SCALES & MULTI-LAYER MERGE STATE ---
  const [layers, setLayers] = useState<LayerSpec[]>([
    {
      id: 'layer-1',
      label: 'A Moll-Pentatonik',
      kind: 'scale',
      rootPc: 9,
      defId: 'minor_pent',
      color: LAYER_COLORS[0],
      minFret: 5,
      maxFret: 8,
    },
  ]);
  const [selectedLayerId, setSelectedLayerId] = useState<string>('layer-1');
  const [globalPosLock, setGlobalPosLock] = useState<boolean>(true);
  const [minFret, setMinFret] = useState<number>(5);
  const [maxFret, setMaxFret] = useState<number>(8);

  // --- CHORD VOICINGS STATE ---
  const [chordRoot, setChordRoot] = useState<number>(0);
  const [chordTypeId, setChordTypeId] = useState<string>('maj7');
  const [voicingFilter, setVoicingFilter] = useState<'all' | VoicingShapeCategory>('all');
  const [selectedVoicingIdx, setSelectedVoicingIdx] = useState<number>(0);

  // --- ARPEGGIO PLAYER STATE ---
  const [arpChords, setArpChords] = useState<ArpChordItem[]>([
    { id: 'a1', rootPc: 2, chordId: 'm7' },
    { id: 'a2', rootPc: 7, chordId: '7' },
    { id: 'a3', rootPc: 0, chordId: 'maj7' },
  ]);
  const [arpScope, setArpScope] = useState<'single' | 'multi'>('single');
  const [arpMinFret, setArpMinFret] = useState<number>(5);
  const [arpMaxFret, setArpMaxFret] = useState<number>(9);
  const [arpDirection, setArpDirection] = useState<'up' | 'down' | 'updown'>('updown');
  const [arpBpm, setArpBpm] = useState<number>(110);
  const [arpPlaying, setArpPlaying] = useState<boolean>(false);
  const [arpActiveChordIdx, setArpActiveChordIdx] = useState<number>(0);
  const [arpActiveStepIdx, setArpActiveStepIdx] = useState<number>(-1);
  const arpTimerRef = useRef<number | null>(null);

  // --- USER PRESETS & LIVE WEB MIDI INPUT ---
  interface SavedFretboardSetup {
    layers: LayerSpec[];
    minFret: number;
    maxFret: number;
    globalPosLock: boolean;
  }
  const [savedSetups, setSavedSetups] = useState<SavedPreset<SavedFretboardSetup>[]>(() =>
    loadUserPresets<SavedFretboardSetup>(PRESET_KEYS.FRETBOARD_LAYERS)
  );
  const [presetNameInput, setPresetNameInput] = useState('');
  const [liveMidiNotes, setLiveMidiNotes] = useState<number[]>([]);

  useEffect(() => {
    return midiInput.subscribeState(snap => {
      setLiveMidiNotes(snap.activeNotes);
    });
  }, []);

  const liveMidiChordName = useMemo(() => identifyChordFromMidis(liveMidiNotes), [liveMidiNotes]);

  const handleSaveFretboardPreset = () => {
    const label = presetNameInput.trim() || `Setup ${savedSetups.length + 1}`;
    const updated = saveUserPreset<SavedFretboardSetup>(PRESET_KEYS.FRETBOARD_LAYERS, label, {
      layers,
      minFret,
      maxFret,
      globalPosLock,
    });
    setSavedSetups(updated);
    setPresetNameInput('');
  };

  const tuning = GUITAR_TUNINGS[tuningIdx];
  const noteNames = getNoteNamesArray(useFlats);

  // Primary selected layer for CAGED / Pentatonic presets (auto-detects Minor vs Major!)
  const activeLayer = layers.find(l => l.id === selectedLayerId) ?? layers[0];
  const activeLayerIsMinor = useMemo(() => {
    if (!activeLayer) return true;
    const def =
      activeLayer.kind === 'scale'
        ? SCALES.find(s => s.id === activeLayer.defId)
        : CHORDS.find(c => c.id === activeLayer.defId);
    if (!def) return true;
    return def.intervals.includes(3) && !def.intervals.includes(4);
  }, [activeLayer]);

  const cagedPositions = useMemo(
    () => getCagedPositionsForRoot(activeLayer?.rootPc ?? 0, tuning.midiNotes[0], activeLayerIsMinor),
    [activeLayer?.rootPc, tuning.midiNotes, activeLayerIsMinor]
  );

  // Sync global fret window to layers when globalPosLock is active
  const effectiveLayers = useMemo(() => {
    if (!globalPosLock) return layers;
    return layers.map(l => ({ ...l, minFret, maxFret }));
  }, [layers, globalPosLock, minFret, maxFret]);

  const scaleDots = useMemo(
    () => computeFretboardDots(effectiveLayers, tuning, 15, useFlats ? 'flat' : 'sharp'),
    [effectiveLayers, tuning, useFlats]
  );

  // --- CHORD VOICINGS COMPUTATION ---
  const allVoicings = useMemo(
    () => generateChordVoicings(chordRoot, chordTypeId, tuning),
    [chordRoot, chordTypeId, tuning]
  );
  const voicings = useMemo(
    () => (voicingFilter === 'all' ? allVoicings : allVoicings.filter(v => v.category === voicingFilter)),
    [allVoicings, voicingFilter]
  );
  const safeVoicingIdx = Math.min(selectedVoicingIdx, Math.max(0, voicings.length - 1));
  const currentVoicing = voicings[safeVoicingIdx] ?? null;

  const chordVoicingDots = useMemo<FretDot[]>(() => {
    if (!currentVoicing) return [];
    const toneMap = getLayerToneMap(chordRoot, 'chord', chordTypeId);
    const flat = useFlats || shouldUseFlats(chordRoot, 'auto');
    const out: FretDot[] = [];
    currentVoicing.frets.forEach((f, sIdx) => {
      if (f === null) return;
      const midi = tuning.midiNotes[sIdx] + f;
      const pc = midi % 12;
      const info = toneMap.get(pc);
      out.push({
        stringIdx: sIdx,
        fret: f,
        midi,
        pc,
        noteName: pcToName(pc, flat),
        degree: info?.degree ?? '',
        isRoot: info?.isRoot ?? false,
        layerId: 'voicing',
        color: '#06b6d4',
      });
    });
    return out;
  }, [currentVoicing, chordRoot, chordTypeId, tuning, useFlats]);

  const chordMutedStrings = useMemo(() => {
    if (!currentVoicing) return [];
    return currentVoicing.frets
      .map((f, idx) => (f === null ? idx : -1))
      .filter(idx => idx >= 0);
  }, [currentVoicing]);

  // --- ARPEGGIO PATHS PER CHORD ---
  const arpPaths = useMemo(() => {
    const fMin = arpScope === 'single' ? arpMinFret : 0;
    const fMax = arpScope === 'single' ? arpMaxFret : 15;
    return arpChords.map(c =>
      generateChordArpeggioNotes(c.rootPc, c.chordId, tuning, fMin, fMax, arpDirection)
    );
  }, [arpChords, arpScope, arpMinFret, arpMaxFret, arpDirection, tuning]);

  const currentArpPath = arpPaths[arpActiveChordIdx] ?? [];
  const currentArpDot =
    arpPlaying && arpActiveStepIdx >= 0 && arpActiveStepIdx < currentArpPath.length
      ? currentArpPath[arpActiveStepIdx]
      : null;

  // Arpeggio playback loop
  useEffect(() => {
    if (!arpPlaying) {
      if (arpTimerRef.current !== null) {
        window.clearInterval(arpTimerRef.current);
        arpTimerRef.current = null;
      }
      setArpActiveStepIdx(-1);
      return;
    }

    let chordIdx = 0;
    let stepIdx = 0;
    const stepMs = Math.max(90, (60 / arpBpm / 2) * 1000); // 8th notes

    const tick = () => {
      const paths = arpPaths;
      if (!paths.length) return;
      if (chordIdx >= paths.length) chordIdx = 0;
      const path = paths[chordIdx];
      if (!path.length) {
        chordIdx = (chordIdx + 1) % paths.length;
        return;
      }

      const note = path[stepIdx];
      setArpActiveChordIdx(chordIdx);
      setArpActiveStepIdx(stepIdx);
      audioEngine.playNote(note.midi, {
        timbre: viewMode === 'piano' ? 'piano' : timbre,
        duration: Math.max(0.45, (stepMs / 1000) * 1.9),
        velocity: note.isRoot ? 0.88 : 0.72,
      });

      stepIdx++;
      if (stepIdx >= path.length) {
        stepIdx = 0;
        chordIdx = (chordIdx + 1) % paths.length;
      }
    };

    tick();
    arpTimerRef.current = window.setInterval(tick, stepMs);
    return () => {
      if (arpTimerRef.current !== null) {
        window.clearInterval(arpTimerRef.current);
        arpTimerRef.current = null;
      }
    };
  }, [arpPlaying, arpBpm, arpPaths, timbre, viewMode]);

  // --- PIANO HIGHLIGHTS ---
  const pianoHighlights = useMemo<PianoKeyHighlight[]>(() => {
    if (subTab === 'scales') {
      const byPc = new Map<number, PianoKeyHighlight>();
      effectiveLayers.forEach(layer => {
        const toneMap = getLayerToneMap(layer.rootPc, layer.kind, layer.defId);
        const flat = useFlats || shouldUseFlats(layer.rootPc, 'auto');
        toneMap.forEach((info, pc) => {
          const prev = byPc.get(pc);
          if (!prev) {
            byPc.set(pc, {
              pc,
              color: layer.color,
              isRoot: info.isRoot,
              label: labelMode === 'note' ? pcToName(pc, flat) : info.degree,
            });
          } else {
            prev.secondaryColor = layer.color;
            if (info.isRoot) prev.isRoot = true;
          }
        });
      });
      return Array.from(byPc.values());
    }

    if (subTab === 'chords') {
      const midis = getPianoChordMidi(chordRoot, chordTypeId, 3);
      const toneMap = getLayerToneMap(chordRoot, 'chord', chordTypeId);
      const flat = useFlats || shouldUseFlats(chordRoot, 'auto');
      return midis.map(m => {
        const info = toneMap.get(m % 12);
        return {
          midi: m,
          color: '#06b6d4',
          isRoot: info?.isRoot,
          label: labelMode === 'note' ? pcToName(m % 12, flat) : info?.degree,
        };
      });
    }

    // Arpeggio tab
    const activeChord = arpChords[arpActiveChordIdx];
    if (!activeChord) return [];
    const toneMap = getLayerToneMap(activeChord.rootPc, 'chord', activeChord.chordId);
    const flat = useFlats || shouldUseFlats(activeChord.rootPc, 'auto');
    return Array.from(toneMap.entries()).map(([pc, info]) => ({
      pc,
      color: LAYER_COLORS[arpActiveChordIdx % LAYER_COLORS.length],
      isRoot: info.isRoot,
      label: labelMode === 'note' ? pcToName(pc, flat) : info.degree,
    }));
  }, [subTab, effectiveLayers, labelMode, useFlats, chordRoot, chordTypeId, arpChords, arpActiveChordIdx]);

  // --- LAYER HANDLERS ---
  const addLayer = (kind: 'scale' | 'chord') => {
    const idx = layers.length;
    const color = LAYER_COLORS[idx % LAYER_COLORS.length];
    const newLayer: LayerSpec = {
      id: `layer-${Date.now()}`,
      label: kind === 'scale' ? 'Neue Skala' : 'Neuer Akkord',
      kind,
      rootPc: kind === 'chord' ? 0 : 9,
      defId: kind === 'chord' ? 'maj7' : 'major',
      color,
      minFret,
      maxFret,
    };
    setLayers([...layers, newLayer]);
    setSelectedLayerId(newLayer.id);
  };

  const updateLayer = (id: string, patch: Partial<LayerSpec>) => {
    setLayers(prev => prev.map(l => (l.id === id ? { ...l, ...patch } : l)));
  };

  const removeLayer = (id: string) => {
    if (layers.length <= 1) return;
    const next = layers.filter(l => l.id !== id);
    setLayers(next);
    if (selectedLayerId === id) setSelectedLayerId(next[0].id);
  };

  const playActiveChordVoicing = () => {
    if (viewMode === 'piano') {
      audioEngine.playChord(getPianoChordMidi(chordRoot, chordTypeId, 3), { timbre: 'piano' });
    } else if (currentVoicing) {
      audioEngine.playChord(currentVoicing.midiNotes, { timbre });
    }
  };

  const displayedDots: FretDot[] =
    subTab === 'scales'
      ? scaleDots
      : subTab === 'chords'
        ? chordVoicingDots
        : currentArpPath.map(d => ({
            ...d,
            color: LAYER_COLORS[arpActiveChordIdx % LAYER_COLORS.length],
          }));

  const activeHighlightWindow =
    subTab === 'scales' && globalPosLock
      ? { minFret, maxFret }
      : subTab === 'arpeggio' && arpScope === 'single'
        ? { minFret: arpMinFret, maxFret: arpMaxFret }
        : null;

  return (
    <div className="space-y-5">
      {/* Header & Mode Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Layers className="w-6 h-6 text-amber-400" />
            Fretboard &amp; Piano Helper
          </h2>
          <p className="text-sm text-slate-400">
            Skalen &amp; Akkorde überlagern, Lagen eingrenzen, Voicings finden &amp; Arpeggio-Sequenzen live abspielen.
          </p>
        </div>

        {/* Sub-mode tabs */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-900/90 border border-slate-800">
          {([
            { id: 'scales', label: 'Skalen & Merge', icon: Layers },
            { id: 'chords', label: 'Akkord-Lagen', icon: Music },
            { id: 'arpeggio', label: 'Arpeggio-Player', icon: Sparkles },
          ] as const).map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setArpPlaying(false);
                  setSubTab(tab.id);
                }}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  subTab === tab.id
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Global Display Toolbar */}
      <div className="studio-card rounded-2xl p-3.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Instrument view */}
          <div className="flex items-center bg-slate-900/80 border border-slate-800 rounded-lg p-0.5 text-xs">
            <button
              onClick={() => setViewMode('guitar')}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md font-medium cursor-pointer ${
                viewMode === 'guitar' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Guitar className="w-3.5 h-3.5" /> Gitarre
            </button>
            <button
              onClick={() => setViewMode('both')}
              className={`px-2.5 py-1.5 rounded-md font-medium cursor-pointer ${
                viewMode === 'both' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Beide
            </button>
            <button
              onClick={() => setViewMode('piano')}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md font-medium cursor-pointer ${
                viewMode === 'piano' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Piano className="w-3.5 h-3.5" /> Klavier
            </button>
          </div>

          {/* Note vs Degree Toggle */}
          <div className="flex items-center bg-slate-900/80 border border-slate-800 rounded-lg p-0.5 text-xs">
            <button
              onClick={() => setLabelMode('note')}
              className={`px-2.5 py-1.5 rounded-md font-semibold cursor-pointer ${
                labelMode === 'note' ? 'bg-cyan-500/25 text-cyan-300' : 'text-slate-400 hover:text-white'
              }`}
            >
              Ton (C, E, G)
            </button>
            <button
              onClick={() => setLabelMode('degree')}
              className={`px-2.5 py-1.5 rounded-md font-semibold cursor-pointer ${
                labelMode === 'degree' ? 'bg-cyan-500/25 text-cyan-300' : 'text-slate-400 hover:text-white'
              }`}
            >
              Stufe (R, 3, 5)
            </button>
          </div>

          {/* # / b Toggle */}
          <button
            onClick={() => setUseFlats(f => !f)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white cursor-pointer"
          >
            Vorzeichen: <span className="text-amber-400">{useFlats ? '♭ (B)' : '♯ (Kreuz)'}</span>
          </button>
        </div>

        {/* Tuning & Sound */}
        <div className="flex flex-wrap items-center gap-2.5 text-xs">
          <select
            value={tuningIdx}
            onChange={e => setTuningIdx(Number(e.target.value))}
            className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-amber-500"
          >
            {GUITAR_TUNINGS.map((t, idx) => (
              <option key={t.id} value={idx}>
                Stimmung: {t.name}
              </option>
            ))}
          </select>

          <select
            value={timbre}
            onChange={e => setTimbre(e.target.value as InstrumentTimbre)}
            className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-amber-500"
          >
            <option value="guitar">Sound: Clean E-Gitarre</option>
            <option value="nylon">Sound: Akustik / Nylon</option>
            <option value="piano">Sound: Grand Piano</option>
            <option value="epiano">Sound: Neo-Soul Rhodes</option>
            <option value="warmPad">Sound: Warm Analog Pad</option>
            <option value="strings">Sound: Orchestral Strings</option>
            <option value="organ">Sound: Warm Jazz Organ</option>
          </select>
        </div>
      </div>

      {/* MAIN VISUALIZATION CANVAS (Fretboard + Piano) */}
      <div className="studio-card rounded-2xl p-4 sm:p-5 space-y-4">
        {/* Legend */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1.5 text-slate-300">
              <span className="w-3.5 h-3.5 rounded-full bg-amber-500 border-2 border-amber-100 inline-block" />
              Grundton (Root)
            </span>
            {subTab === 'scales' &&
              effectiveLayers.map((l, idx) => {
                const title =
                  l.kind === 'scale'
                    ? `${pcToName(l.rootPc, useFlats)} ${SCALES.find(s => s.id === l.defId)?.name}`
                    : formatChordName(l.rootPc, l.defId, useFlats);
                return (
                  <span key={l.id} className="inline-flex items-center gap-1.5 text-slate-200 font-medium">
                    <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: l.color }} />
                    Ebene {idx + 1}: {title}
                  </span>
                );
              })}
            {subTab === 'scales' && effectiveLayers.length > 1 && (
              <span className="inline-flex items-center gap-1.5 text-slate-400">
                <span className="w-3.5 h-3.5 rounded-full bg-cyan-500 ring-2 ring-emerald-400 inline-block" />
                Gemeinsamer Ton (Ring)
              </span>
            )}
            {subTab === 'arpeggio' && arpChords[arpActiveChordIdx] && (
              <span className="inline-flex items-center gap-2 text-cyan-300 font-semibold">
                Aktives Arpeggio:{' '}
                <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-200">
                  {formatChordName(arpChords[arpActiveChordIdx].rootPc, arpChords[arpActiveChordIdx].chordId, useFlats)}
                </span>
              </span>
            )}
          </div>
          <span className="text-slate-500">Klicke auf Bünde oder Tasten zum Vorhören</span>
        </div>

        {(viewMode === 'guitar' || viewMode === 'both') && (
          <FretboardSVG
            tuning={tuning}
            numFrets={15}
            dots={displayedDots}
            labelMode={labelMode}
            highlightWindow={activeHighlightWindow}
            activeArpDot={currentArpDot ? { stringIdx: currentArpDot.stringIdx, fret: currentArpDot.fret } : null}
            mutedStrings={subTab === 'chords' ? chordMutedStrings : []}
            timbre={timbre}
          />
        )}

        {(viewMode === 'piano' || viewMode === 'both') && (
          <div className="pt-1 space-y-2">
            {liveMidiNotes.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 text-xs px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/35 text-emerald-200">
                <Cable className="w-3.5 h-3.5 text-emerald-400" />
                <span>Live MIDI:</span>
                <span className="font-mono font-bold text-white">
                  {liveMidiNotes.map(m => pcToName(m % 12, useFlats)).join(' · ')}
                </span>
                {liveMidiChordName && (
                  <span className="px-2 py-0.5 rounded bg-amber-500 text-slate-950 font-black">
                    Erkannter Akkord: {liveMidiChordName}
                  </span>
                )}
              </div>
            )}
            <PianoKeyboardSVG
              startMidi={48}
              endMidi={84}
              highlights={pianoHighlights}
              activeMidiNotes={[...(currentArpDot ? [currentArpDot.midi] : []), ...liveMidiNotes]}
              timbre={timbre === 'epiano' ? 'epiano' : 'piano'}
              height={132}
            />
          </div>
        )}
      </div>

      {/* CONTROLS PANEL BY SUB-TAB */}
      {subTab === 'scales' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Multi-layer scale & chord merger */}
          <div className="lg:col-span-2 studio-card rounded-2xl p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                Skalen &amp; Akkorde zusammenführen (Multi-Layer)
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => addLayer('scale')}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-cyan-500/15 text-cyan-300 hover:bg-cyan-500/25 text-xs font-semibold cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> + Skala
                </button>
                <button
                  onClick={() => addLayer('chord')}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25 text-xs font-semibold cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> + Akkord
                </button>
              </div>
            </div>

            <div className="space-y-2.5">
              {layers.map((layer, idx) => (
                <div
                  key={layer.id}
                  onClick={() => setSelectedLayerId(layer.id)}
                  className={`p-3 rounded-xl border transition-all flex flex-wrap items-center gap-2.5 ${
                    selectedLayerId === layer.id
                      ? 'bg-slate-800/80 border-slate-600'
                      : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  {/* Color dot */}
                  <input
                    type="color"
                    value={layer.color}
                    onChange={e => updateLayer(layer.id, { color: e.target.value })}
                    title="Ebenen-Farbe wählen"
                    className="w-7 h-7 rounded-lg bg-transparent border-0 cursor-pointer"
                  />

                  <span className="text-xs font-bold text-slate-400 w-12">#{idx + 1}</span>

                  {/* Kind toggle */}
                  <select
                    value={layer.kind}
                    onChange={e => {
                      const nextKind = e.target.value as 'scale' | 'chord';
                      updateLayer(layer.id, {
                        kind: nextKind,
                        defId: nextKind === 'scale' ? 'major' : 'maj7',
                      });
                    }}
                    className="bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-200"
                  >
                    <option value="scale">Skala</option>
                    <option value="chord">Akkord</option>
                  </select>

                  {/* Root */}
                  <select
                    value={layer.rootPc}
                    onChange={e => updateLayer(layer.id, { rootPc: Number(e.target.value) })}
                    className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-bold text-amber-300"
                  >
                    {noteNames.map((n, pc) => (
                      <option key={pc} value={pc}>
                        {n}
                      </option>
                    ))}
                  </select>

                  {/* Scale / Chord Def */}
                  <select
                    value={layer.defId}
                    onChange={e => updateLayer(layer.id, { defId: e.target.value })}
                    className="flex-1 min-w-[160px] bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100"
                  >
                    {layer.kind === 'scale'
                      ? SCALES.map(s => (
                          <option key={s.id} value={s.id}>
                            {s.name} ({s.category})
                          </option>
                        ))
                      : CHORDS.map(c => (
                          <option key={c.id} value={c.id}>
                            {c.name} ({c.symbol || 'Dur'})
                          </option>
                        ))}
                  </select>

                  {/* Preview sound */}
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      if (layer.kind === 'chord') {
                        audioEngine.playChord(getPianoChordMidi(layer.rootPc, layer.defId, 3), { timbre });
                      } else {
                        const sc = SCALES.find(s => s.id === layer.defId) ?? SCALES[0];
                        const ctx = audioEngine.getContext();
                        const base = 48 + layer.rootPc;
                        [...sc.intervals, 12].forEach((iv, i) => {
                          audioEngine.playNote(base + iv, {
                            time: ctx.currentTime + i * 0.16,
                            duration: 0.45,
                            timbre,
                          });
                        });
                      }
                    }}
                    title="Anhören"
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-amber-300 cursor-pointer"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>

                  {layers.length > 1 && (
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        removeLayer(layer.id);
                      }}
                      title="Ebene entfernen"
                      className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* User Saved Layer Setups */}
            <div className="pt-3 border-t border-slate-800/80 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <Bookmark className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-xs font-bold text-slate-300">Eigene Setups speichern:</span>
                <input
                  type="text"
                  value={presetNameInput}
                  onChange={e => setPresetNameInput(e.target.value)}
                  placeholder="z.B. Am Pent + Cmaj7 Pos 5"
                  className="flex-1 min-w-[160px] bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                />
                <button
                  onClick={handleSaveFretboardPreset}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" /> Speichern
                </button>
              </div>
              {savedSetups.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {savedSetups.map(p => (
                    <div
                      key={p.id}
                      className="flex items-center gap-1 pl-2.5 pr-1 py-1 rounded-lg bg-slate-900 border border-slate-700 text-xs"
                    >
                      <button
                        onClick={() => {
                          setLayers(p.data.layers);
                          setMinFret(p.data.minFret);
                          setMaxFret(p.data.maxFret);
                          setGlobalPosLock(p.data.globalPosLock);
                          if (p.data.layers[0]) setSelectedLayerId(p.data.layers[0].id);
                        }}
                        className="text-slate-200 hover:text-amber-300 font-semibold cursor-pointer"
                      >
                        {p.name}
                      </button>
                      <button
                        onClick={() => setSavedSetups(deleteUserPreset(PRESET_KEYS.FRETBOARD_LAYERS, p.id))}
                        className="p-0.5 text-slate-500 hover:text-rose-400 cursor-pointer"
                        title="Preset löschen"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Position & Fret Range Selector */}
          <div className="studio-card rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-amber-400" />
                Griffbrett-Position
              </h3>
              <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={globalPosLock}
                  onChange={e => setGlobalPosLock(e.target.checked)}
                  className="accent-amber-500"
                />
                Bereich begrenzen
              </label>
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              {cagedPositions.map(pos => {
                const isSelected = globalPosLock && minFret === pos.minFret && maxFret === pos.maxFret;
                return (
                  <button
                    key={pos.id}
                    onClick={() => {
                      setGlobalPosLock(true);
                      setMinFret(pos.minFret);
                      setMaxFret(pos.maxFret);
                    }}
                    className={`px-2.5 py-2 rounded-lg text-xs font-medium text-left transition-all cursor-pointer border ${
                      isSelected
                        ? 'bg-amber-500/20 border-amber-500/60 text-amber-200'
                        : 'bg-slate-900/70 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    {pos.label}
                  </button>
                );
              })}
            </div>

            <div className="pt-2 border-t border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Manueller Bereich</span>
                <span className="font-mono text-amber-300">
                  Bund {minFret} – {maxFret}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <label className="text-xs text-slate-400">
                  Startbund: {minFret}
                  <input
                    type="range"
                    min={0}
                    max={14}
                    value={minFret}
                    onChange={e => {
                      const v = Number(e.target.value);
                      setMinFret(v);
                      if (v > maxFret) setMaxFret(Math.min(15, v + 3));
                      setGlobalPosLock(true);
                    }}
                    className="w-full accent-amber-500 mt-1"
                  />
                </label>
                <label className="text-xs text-slate-400">
                  Endbund: {maxFret}
                  <input
                    type="range"
                    min={1}
                    max={15}
                    value={maxFret}
                    onChange={e => {
                      const v = Number(e.target.value);
                      setMaxFret(v);
                      if (v < minFret) setMinFret(Math.max(0, v - 3));
                      setGlobalPosLock(true);
                    }}
                    className="w-full accent-amber-500 mt-1"
                  />
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {subTab === 'chords' && (
        <div className="studio-card rounded-2xl p-4 sm:p-5 space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Grundton</label>
                <div className="flex flex-wrap gap-1">
                  {noteNames.map((n, pc) => (
                    <button
                      key={pc}
                      onClick={() => {
                        setChordRoot(pc);
                        setSelectedVoicingIdx(0);
                      }}
                      className={`w-9 h-9 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        chordRoot === pc
                          ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/25'
                          : 'bg-slate-900 border border-slate-800 text-slate-300 hover:border-slate-600'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Akkordtyp</label>
                <select
                  value={chordTypeId}
                  onChange={e => {
                    setChordTypeId(e.target.value);
                    setSelectedVoicingIdx(0);
                  }}
                  className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm font-semibold text-white min-w-[200px]"
                >
                  {CHORDS.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.symbol || 'Dur'}) – {c.category}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={playActiveChordVoicing}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 cursor-pointer"
            >
              <Volume2 className="w-4 h-4" />
              {formatChordName(chordRoot, chordTypeId, useFlats)} abspielen
            </button>
          </div>

          {/* Griffmuster / Chord Shape Filter */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-slate-400 font-semibold mr-1">Griffmuster:</span>
                {([
                  { id: 'all', label: `Alle (${allVoicings.length})` },
                  { id: 'caged', label: 'CAGED (E/A/C/D/G)' },
                  { id: 'drop2', label: 'Drop-2 (Jazz)' },
                  { id: 'shell', label: 'Shell (R–3–7)' },
                  { id: 'triad', label: 'Triads (3 Saiten)' },
                ] as const).map(f => (
                  <button
                    key={f.id}
                    onClick={() => {
                      setVoicingFilter(f.id);
                      setSelectedVoicingIdx(0);
                    }}
                    className={`px-2.5 py-1.5 rounded-lg font-semibold border cursor-pointer ${
                      voicingFilter === f.id
                        ? 'bg-amber-500/20 border-amber-500 text-amber-200'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
              {currentVoicing && (
                <span className="font-mono text-cyan-300">
                  {currentVoicing.shapeTag} • TAB: {currentVoicing.frets.map(f => (f === null ? 'x' : f)).join(' - ')}
                </span>
              )}
            </div>

            {voicings.length === 0 ? (
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400">
                Für diesen Akkordtyp gibt es keine Treffer in der gewählten Griffmuster-Kategorie – wähle &bdquo;Alle&ldquo;.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                {voicings.map((v, idx) => (
                  <button
                    key={v.id}
                    onClick={() => {
                      setSelectedVoicingIdx(idx);
                      audioEngine.playChord(v.midiNotes, { timbre });
                    }}
                    className={`p-2.5 rounded-xl text-left text-xs border transition-all cursor-pointer space-y-1 ${
                      safeVoicingIdx === idx
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-100 shadow-md shadow-cyan-500/10'
                        : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-bold truncate">{v.label}</span>
                    </div>
                    <span className="inline-block px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300 text-[10px] font-bold">
                      {v.shapeTag}
                    </span>
                    <div className="text-[10px] font-mono text-slate-400">
                      {v.frets.map(f => (f === null ? 'x' : f)).join(' ')}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {subTab === 'arpeggio' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Arpeggio Sequence Builder */}
          <div className="lg:col-span-2 studio-card rounded-2xl p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                Arpeggio-Akkordsequenz
              </h3>
              <div className="flex flex-wrap items-center gap-1.5">
                {ARP_PRESETS.map(p => (
                  <button
                    key={p.name}
                    onClick={() => {
                      setArpPlaying(false);
                      setArpChords(p.chords.map((c, idx) => ({ id: `pre-${idx}-${Date.now()}`, ...c })));
                      setArpActiveChordIdx(0);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-[11px] font-medium text-slate-300 cursor-pointer"
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {arpChords.map((item, idx) => {
                const isCurrent = arpActiveChordIdx === idx;
                return (
                  <div
                    key={item.id}
                    onClick={() => setArpActiveChordIdx(idx)}
                    className={`flex items-center gap-1.5 p-2 rounded-xl border transition-all ${
                      isCurrent
                        ? 'bg-cyan-500/15 border-cyan-400/70'
                        : 'bg-slate-900/70 border-slate-800'
                    }`}
                  >
                    <select
                      value={item.rootPc}
                      onChange={e =>
                        setArpChords(prev =>
                          prev.map(c => (c.id === item.id ? { ...c, rootPc: Number(e.target.value) } : c))
                        )
                      }
                      className="bg-slate-950 border border-slate-700 rounded-md px-1.5 py-1 text-xs font-bold text-amber-300"
                    >
                      {noteNames.map((n, pc) => (
                        <option key={pc} value={pc}>
                          {n}
                        </option>
                      ))}
                    </select>
                    <select
                      value={item.chordId}
                      onChange={e =>
                        setArpChords(prev =>
                          prev.map(c => (c.id === item.id ? { ...c, chordId: e.target.value } : c))
                        )
                      }
                      className="bg-slate-950 border border-slate-700 rounded-md px-1.5 py-1 text-xs text-slate-100"
                    >
                      {CHORDS.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.symbol || 'Dur'}
                        </option>
                      ))}
                    </select>
                    {arpChords.length > 1 && (
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          setArpChords(prev => prev.filter(c => c.id !== item.id));
                          setArpActiveChordIdx(0);
                        }}
                        className="p-1 text-slate-500 hover:text-rose-400 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                );
              })}

              <button
                onClick={() =>
                  setArpChords(prev => [
                    ...prev,
                    { id: `arp-${Date.now()}`, rootPc: 0, chordId: 'maj7' },
                  ])
                }
                className="flex items-center gap-1 px-3 py-2 rounded-xl border border-dashed border-slate-700 hover:border-amber-400 text-xs text-slate-300 hover:text-amber-300 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Akkord
              </button>
            </div>
          </div>

          {/* Arpeggio Transport & Scope */}
          <div className="studio-card rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <button
                onClick={() => setArpPlaying(p => !p)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm cursor-pointer transition-all ${
                  arpPlaying
                    ? 'bg-rose-500 hover:bg-rose-400 text-white'
                    : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                }`}
              >
                {arpPlaying ? <Square className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                {arpPlaying ? 'Stopp' : 'Arpeggio starten'}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-1.5 text-xs">
              <button
                onClick={() => setArpScope('single')}
                className={`py-2 rounded-lg font-semibold border cursor-pointer ${
                  arpScope === 'single'
                    ? 'bg-amber-500/20 border-amber-500 text-amber-200'
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                1 Position ({arpMinFret}–{arpMaxFret})
              </button>
              <button
                onClick={() => setArpScope('multi')}
                className={`py-2 rounded-lg font-semibold border cursor-pointer ${
                  arpScope === 'multi'
                    ? 'bg-amber-500/20 border-amber-500 text-amber-200'
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                Mehrere Positionen
              </button>
            </div>

            {arpScope === 'single' && (
              <div className="flex items-center gap-3 text-xs text-slate-400">
                <label className="flex-1">
                  Startbund: {arpMinFret}
                  <input
                    type="range"
                    min={0}
                    max={11}
                    value={arpMinFret}
                    onChange={e => {
                      const v = Number(e.target.value);
                      setArpMinFret(v);
                      setArpMaxFret(Math.min(15, v + 4));
                    }}
                    className="w-full accent-amber-500"
                  />
                </label>
              </div>
            )}

            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400">Muster:</span>
              {(['up', 'down', 'updown'] as const).map(dir => (
                <button
                  key={dir}
                  onClick={() => setArpDirection(dir)}
                  className={`px-2 py-1 rounded-md font-semibold cursor-pointer ${
                    arpDirection === dir ? 'bg-cyan-500/25 text-cyan-200' : 'bg-slate-900 text-slate-400'
                  }`}
                >
                  {dir === 'up' ? '↑ Auf' : dir === 'down' ? '↓ Ab' : '↕ Auf & Ab'}
                </button>
              ))}
            </div>

            <label className="block text-xs text-slate-400">
              Tempo: <span className="text-amber-300 font-bold">{arpBpm} BPM</span>
              <input
                type="range"
                min={50}
                max={200}
                value={arpBpm}
                onChange={e => setArpBpm(Number(e.target.value))}
                className="w-full accent-amber-500 mt-1"
              />
            </label>
          </div>
        </div>
      )}
    </div>
  );
};
