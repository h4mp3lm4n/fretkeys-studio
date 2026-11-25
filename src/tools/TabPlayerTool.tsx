import React, { useEffect, useRef, useState } from 'react';
import {
  Play,
  Pause,
  Square,
  Upload,
  Repeat,
  FileMusic,
  Code2,
  Timer,
  ArrowUpDown,
  Download,
  BookOpen,
  PenTool,
  TrendingUp,
  Compass,
  RotateCcw,
} from 'lucide-react';
import * as alphaTab from '@coderline/alphatab';
import { CURATED_EXERCISES } from '../data/exercises';
import { VisualTabEditor } from '../components/VisualTabEditor';
import { saveUserPreset } from '../utils/storage';

const DEFAULT_EXERCISE = CURATED_EXERCISES[0];
export const CUSTOM_EXERCISES_KEY = 'fk_custom_tab_exercises_v1';

export interface TabHandoffPayload {
  title: string;
  tex?: string;
  fileUrl?: string;
  id: string;
}

export interface TabPlayerToolProps {
  externalAlphaTex?: TabHandoffPayload | null;
}

type TabTransposeAutoMode = 'none' | 'chromatic_up' | 'chromatic_down' | 'cw' | 'ccw' | 'random';

function computeNextTranspose(curr: number, mode: TabTransposeAutoMode): number {
  const wrapGuitarRange = (val: number) => {
    // Keep within comfortable guitar transposition range [-5, +6] semitones
    let m = ((val % 12) + 12) % 12;
    if (m > 6) m -= 12;
    return m;
  };
  if (mode === 'chromatic_up') return wrapGuitarRange(curr + 1);
  if (mode === 'chromatic_down') return wrapGuitarRange(curr - 1);
  if (mode === 'cw') return wrapGuitarRange(curr + 7);
  if (mode === 'ccw') return wrapGuitarRange(curr + 5);
  if (mode === 'random') {
    let next = curr;
    while (next === curr) next = Math.floor(Math.random() * 12) - 5;
    return next;
  }
  return curr;
}

export const TabPlayerTool: React.FC<TabPlayerToolProps> = ({ externalAlphaTex }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const apiRef = useRef<alphaTab.AlphaTabApi | null>(null);

  const initialTex = externalAlphaTex?.tex ?? DEFAULT_EXERCISE.alphaTex;
  const initialFileUrl = externalAlphaTex?.fileUrl ?? DEFAULT_EXERCISE.fileUrl;
  const initialTitle = externalAlphaTex?.title ?? DEFAULT_EXERCISE.title;
  const initialId = externalAlphaTex?.id ?? DEFAULT_EXERCISE.id;

  const initialPayloadRef = useRef<{ tex?: string; fileUrl?: string }>({
    tex: initialTex,
    fileUrl: initialFileUrl,
  });
  const lastExternalIdRef = useRef<string | null>(externalAlphaTex?.id ?? null);

  const [alphaTex, setAlphaTex] = useState<string>(initialTex ?? '');
  const [selectedBuiltinId, setSelectedBuiltinId] = useState<string>(initialId);
  const [editorMode, setEditorMode] = useState<'none' | 'visual' | 'alphatex'>('none');
  const [fileName, setFileName] = useState<string>(initialTitle);
  const [isReady, setIsReady] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(1.0);
  const [transpose, setTranspose] = useState<number>(0);
  const [isLooping, setIsLooping] = useState<boolean>(true);
  const [metronome, setMetronome] = useState<boolean>(false);
  const [countIn, setCountIn] = useState<boolean>(true);
  const [tracks, setTracks] = useState<Array<{ index: number; name: string }>>([]);
  const [selectedTrackIdx, setSelectedTrackIdx] = useState<number>(0);
  const [statusMsg, setStatusMsg] = useState<string>('Lade SoundFont & Noten-Engine...');

  // Auto-Speed & Auto-Transpose Trainer (per Loop / Repetition)
  const [completedLoops, setCompletedLoops] = useState<number>(0);
  const [autoSpeedEnabled, setAutoSpeedEnabled] = useState<boolean>(false);
  const [autoSpeedEveryLoops, setAutoSpeedEveryLoops] = useState<number>(2);
  const [autoSpeedStepPct, setAutoSpeedStepPct] = useState<number>(5);
  const [autoSpeedMaxPct, setAutoSpeedMaxPct] = useState<number>(125);
  const [autoTransposeMode, setAutoTransposeMode] = useState<TabTransposeAutoMode>('none');
  const [autoTransposeEveryLoops, setAutoTransposeEveryLoops] = useState<number>(2);

  const loopCountRef = useRef<number>(0);
  const resumeAfterTransposeRef = useRef<boolean>(false);
  const practiceRef = useRef({
    speed,
    transpose,
    isLooping,
    autoSpeedEnabled,
    autoSpeedEveryLoops,
    autoSpeedStepPct,
    autoSpeedMaxPct,
    autoTransposeMode,
    autoTransposeEveryLoops,
  });
  practiceRef.current = {
    speed,
    transpose,
    isLooping,
    autoSpeedEnabled,
    autoSpeedEveryLoops,
    autoSpeedStepPct,
    autoSpeedMaxPct,
    autoTransposeMode,
    autoTransposeEveryLoops,
  };

  const applyTransposeToApi = (api: alphaTab.AlphaTabApi, semitones: number) => {
    const count = Math.max(1, api.score?.tracks.length ?? 1);
    const arr = Array.from({ length: count }, () => semitones);
    api.settings.notation.transpositionPitches = arr;
    api.settings.notation.displayTranspositionPitches = arr;
    api.updateSettings();
    api.render();
  };

  const loadScoreIntoApi = async (api: alphaTab.AlphaTabApi, payload: { tex?: string; fileUrl?: string }) => {
    try {
      if (payload.fileUrl) {
        setStatusMsg('Lade Guitar-Pro-Datei...');
        const res = await fetch(payload.fileUrl);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const buf = await res.arrayBuffer();
        api.load(new Uint8Array(buf));
      } else if (payload.tex) {
        api.tex(payload.tex);
      }
    } catch (err) {
      setStatusMsg(`Ladefehler: ${err instanceof Error ? err.message : 'Unbekannt'}`);
    }
  };

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const settings = new alphaTab.Settings();
    settings.core.fontDirectory = './alphatab/font/';
    settings.core.useWorkers = false;
    settings.core.engine = 'svg';
    settings.player.enablePlayer = true;
    settings.player.enableCursor = true;
    settings.player.enableUserInteraction = true;
    settings.player.soundFont = './alphatab/soundfont/sonivox.sf2';
    settings.display.layoutMode = alphaTab.LayoutMode.Page;
    settings.display.scale = 1.05;

    const api = new alphaTab.AlphaTabApi(el, settings);
    apiRef.current = api;

    api.scoreLoaded.on(score => {
      setTracks(score.tracks.map(t => ({ index: t.index, name: t.name || `Spur ${t.index + 1}` })));
      setSelectedTrackIdx(0);
      setStatusMsg(`${score.title || 'Unbenannt'} • ${score.masterBars.length} Takte geladen`);
    });

    api.playerReady.on(() => {
      setIsReady(true);
      setStatusMsg('Bereit – Klicke Play oder markiere Takte zum Loopen');
    });

    api.playerStateChanged.on(args => {
      setIsPlaying(args.state === alphaTab.synth.PlayerState.Playing);
    });

    api.midiLoaded.on(() => {
      if (resumeAfterTransposeRef.current) {
        resumeAfterTransposeRef.current = false;
        window.setTimeout(() => {
          if (apiRef.current && apiRef.current.playerState !== alphaTab.synth.PlayerState.Playing) {
            apiRef.current.play();
          }
        }, 60);
      }
    });

    api.playerFinished.on(() => {
      const cfg = practiceRef.current;
      loopCountRef.current += 1;
      const nextLoop = loopCountRef.current;
      setCompletedLoops(nextLoop);

      const updates: string[] = [];

      if (cfg.autoSpeedEnabled && nextLoop % cfg.autoSpeedEveryLoops === 0) {
        const maxSpeed = cfg.autoSpeedMaxPct / 100;
        const step = cfg.autoSpeedStepPct / 100;
        const nextSpeed = Math.min(maxSpeed, Math.round((cfg.speed + step) * 100) / 100);
        if (nextSpeed !== cfg.speed) {
          practiceRef.current.speed = nextSpeed;
          setSpeed(nextSpeed);
          api.playbackSpeed = nextSpeed;
          updates.push(`Tempo → ${Math.round(nextSpeed * 100)}%`);
        }
      }

      if (cfg.autoTransposeMode !== 'none' && nextLoop % cfg.autoTransposeEveryLoops === 0) {
        const nextSemi = computeNextTranspose(cfg.transpose, cfg.autoTransposeMode);
        practiceRef.current.transpose = nextSemi;
        setTranspose(nextSemi);
        if (cfg.isLooping) resumeAfterTransposeRef.current = true;
        applyTransposeToApi(api, nextSemi);
        updates.push(`Transpose → ${nextSemi > 0 ? `+${nextSemi}` : nextSemi} HT`);
      }

      if (updates.length > 0) {
        setStatusMsg(`Loop #${nextLoop} abgeschlossen • ${updates.join(' • ')}`);
      }
    });

    api.error.on(err => {
      setStatusMsg(`Hinweis: ${err.message || 'Fehler beim Laden der Datei'}`);
    });

    void loadScoreIntoApi(api, initialPayloadRef.current);

    return () => {
      try {
        api.destroy();
      } catch {
        // ignore cleanup error
      }
      el.innerHTML = '';
      apiRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!externalAlphaTex) return;
    if (lastExternalIdRef.current === externalAlphaTex.id) return;
    lastExternalIdRef.current = externalAlphaTex.id;
    initialPayloadRef.current = { tex: externalAlphaTex.tex, fileUrl: externalAlphaTex.fileUrl };

    setAlphaTex(externalAlphaTex.tex ?? '');
    setFileName(externalAlphaTex.title);
    setSelectedBuiltinId(externalAlphaTex.id);
    setTranspose(0);

    if (apiRef.current) {
      apiRef.current.stop();
      void loadScoreIntoApi(apiRef.current, { tex: externalAlphaTex.tex, fileUrl: externalAlphaTex.fileUrl });
    }
  }, [externalAlphaTex]);

  useEffect(() => {
    if (apiRef.current) apiRef.current.playbackSpeed = speed;
  }, [speed]);

  useEffect(() => {
    if (apiRef.current) apiRef.current.isLooping = isLooping;
  }, [isLooping]);

  useEffect(() => {
    if (apiRef.current) apiRef.current.metronomeVolume = metronome ? 0.85 : 0;
  }, [metronome]);

  useEffect(() => {
    if (apiRef.current) apiRef.current.countInVolume = countIn ? 0.8 : 0;
  }, [countIn]);

  const handleTransposeChange = (semitones: number) => {
    setTranspose(semitones);
    const api = apiRef.current;
    if (!api) return;
    applyTransposeToApi(api, semitones);
  };

  const resetPracticeProgress = () => {
    loopCountRef.current = 0;
    setCompletedLoops(0);
  };

  const loadBuiltinExercise = (id: string) => {
    const ex = CURATED_EXERCISES.find(e => e.id === id);
    if (!ex || !apiRef.current) return;
    setSelectedBuiltinId(ex.id);
    setAlphaTex(ex.alphaTex ?? '');
    setFileName(ex.title);
    setTranspose(0);
    resetPracticeProgress();
    apiRef.current.stop();
    void loadScoreIntoApi(apiRef.current, { tex: ex.alphaTex, fileUrl: ex.fileUrl });
  };

  const handleFileUpload = async (file: File) => {
    const api = apiRef.current;
    if (!api) return;
    setFileName(file.name);
    setSelectedBuiltinId('');
    setStatusMsg(`Lade ${file.name}...`);
    try {
      api.stop();
      if (file.name.toLowerCase().endsWith('.tex') || file.name.toLowerCase().endsWith('.txt')) {
        const text = await file.text();
        setAlphaTex(text);
        api.tex(text);
      } else {
        const buf = await file.arrayBuffer();
        api.load(new Uint8Array(buf));
      }
    } catch (err) {
      setStatusMsg(`Fehler beim Laden von ${file.name}: ${err instanceof Error ? err.message : 'Unbekanntes Format'}`);
    }
  };

  const handleTrackSwitch = (idx: number) => {
    setSelectedTrackIdx(idx);
    const api = apiRef.current;
    if (!api || !api.score) return;
    const track = api.score.tracks[idx];
    if (track) api.renderTracks([track]);
  };

  const handleExportTex = () => {
    const blob = new Blob([alphaTex], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName.replace(/[^a-z0-9_-]/gi, '_')}.tex`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSaveVisualTab = (title: string, tex: string, tempo: number) => {
    saveUserPreset(CUSTOM_EXERCISES_KEY, title, { tex, tempo });
    setStatusMsg(`Gespeichert: "${title}" – ab sofort im Übungsgenerator unter "Eigene Tabs" verfügbar!`);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <FileMusic className="w-6 h-6 text-amber-400" />
            Tab &amp; Guitar Pro Viewer / Editor
          </h2>
          <p className="text-sm text-slate-400">
            Öffne echte Guitar-Pro-Dateien (.gp/.gp5/.gpx), MusicXML &amp; AlphaTex oder schreibe eigene Tabs direkt im visuellen Editor mit Live-SoundFont-Playback.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setEditorMode(m => (m === 'visual' ? 'none' : 'visual'))}
            className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold border cursor-pointer transition-all ${
              editorMode === 'visual'
                ? 'bg-amber-500 border-amber-400 text-slate-950 shadow-lg shadow-amber-500/20'
                : 'bg-slate-900 border-amber-500/50 hover:bg-amber-500/15 text-amber-300'
            }`}
          >
            <PenTool className="w-4 h-4" />
            Visueller Tab-Editor
          </button>

          <button
            onClick={() => setEditorMode(m => (m === 'alphatex' ? 'none' : 'alphatex'))}
            className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold border cursor-pointer ${
              editorMode === 'alphatex'
                ? 'bg-cyan-500/20 border-cyan-500 text-cyan-200'
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-600'
            }`}
          >
            <Code2 className="w-4 h-4" />
            AlphaTex Code
          </button>

          <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs cursor-pointer shadow-lg shadow-cyan-500/20">
            <Upload className="w-4 h-4" />
            GP / XML / .tex öffnen
            <input
              type="file"
              accept=".gp,.gpx,.gp5,.gp4,.gp3,.xml,.musicxml,.mxl,.tex,.txt"
              className="hidden"
              onChange={e => {
                const f = e.target.files?.[0];
                if (f) void handleFileUpload(f);
              }}
            />
          </label>
        </div>
      </div>

      {/* Built-in Etudes & Real Guitar Pro Studies Quick Switcher */}
      <div className="studio-card rounded-2xl p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-300 font-bold">
          <BookOpen className="w-4 h-4 text-cyan-400" />
          Übungen &amp; echte Guitar-Pro-Studien ({CURATED_EXERCISES.length}):
        </div>
        <select
          value={selectedBuiltinId}
          onChange={e => loadBuiltinExercise(e.target.value)}
          className="flex-1 min-w-[260px] max-w-xl bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-amber-500"
        >
          <option value="" disabled>
            -- Eigener Tab / Datei geladen --
          </option>
          {CURATED_EXERCISES.map(ex => (
            <option key={ex.id} value={ex.id}>
              {ex.fileUrl ? '[GP] ' : ''}[{ex.topics[0]}] {ex.title}
            </option>
          ))}
        </select>
      </div>

      {/* Interactive Visual Tab Editor (Live Synced with AlphaTab Viewer below!) */}
      {editorMode === 'visual' && (
        <VisualTabEditor
          onApplyAlphaTex={(title, tex) => {
            setFileName(title || 'Eigener Tab');
            setAlphaTex(tex);
            setSelectedBuiltinId('');
            if (apiRef.current) {
              apiRef.current.tex(tex);
            }
          }}
          onSaveAsExercise={handleSaveVisualTab}
        />
      )}

      {/* Raw AlphaTex Editor */}
      {editorMode === 'alphatex' && (
        <div className="studio-card rounded-2xl p-4 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-cyan-300">
              AlphaTex Quelltext-Editor (direkt bearbeiten &amp; rendern)
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleExportTex}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" /> .tex speichern
              </button>
              <button
                onClick={() => apiRef.current?.tex(alphaTex)}
                className="px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold cursor-pointer"
              >
                Neu rendern
              </button>
            </div>
          </div>
          <textarea
            value={alphaTex}
            onChange={e => setAlphaTex(e.target.value)}
            rows={7}
            spellCheck={false}
            className="w-full rounded-xl bg-slate-950 border border-slate-800 p-3 font-mono text-xs text-emerald-300 focus:outline-none focus:border-cyan-500"
          />
        </div>
      )}

      {/* Transport & Practice Bar */}
      <div className="studio-card rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <button
            disabled={!isReady}
            onClick={() => apiRef.current?.playPause()}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm cursor-pointer transition-all disabled:opacity-40 ${
              isPlaying
                ? 'bg-amber-500 text-slate-950'
                : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
            }`}
          >
            {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
            {isPlaying ? 'Pause' : 'Abspielen'}
          </button>
          <button
            disabled={!isReady}
            onClick={() => {
              apiRef.current?.stop();
              resetPracticeProgress();
            }}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer disabled:opacity-40"
            title="Stopp & Loop-Zähler zurücksetzen"
          >
            <Square className="w-4 h-4 fill-current" />
          </button>

          <button
            onClick={() => setIsLooping(v => !v)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border cursor-pointer ${
              isLooping
                ? 'bg-cyan-500/20 border-cyan-500 text-cyan-200'
                : 'bg-slate-900 border-slate-800 text-slate-400'
            }`}
            title="Markiere mit der Maus einen Bereich in den Tabs zum Loopen"
          >
            <Repeat className="w-3.5 h-3.5" /> Loop
          </button>

          <button
            onClick={() => setMetronome(v => !v)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border cursor-pointer ${
              metronome
                ? 'bg-amber-500/20 border-amber-500 text-amber-200'
                : 'bg-slate-900 border-slate-800 text-slate-400'
            }`}
          >
            <Timer className="w-3.5 h-3.5" /> Klick
          </button>

          <button
            onClick={() => setCountIn(v => !v)}
            className={`px-3 py-2 rounded-xl text-xs font-bold border cursor-pointer ${
              countIn
                ? 'bg-amber-500/20 border-amber-500 text-amber-200'
                : 'bg-slate-900 border-slate-800 text-slate-400'
            }`}
          >
            Einzähler
          </button>
        </div>

        {/* Speed & Transpose */}
        <div className="flex flex-wrap items-center gap-4 text-xs">
          <label className="flex items-center gap-2 text-slate-300">
            <span>Tempo:</span>
            <input
              type="range"
              min={0.25}
              max={1.5}
              step={0.05}
              value={speed}
              onChange={e => setSpeed(Number(e.target.value))}
              className="w-28 accent-amber-500"
            />
            <span className="font-mono font-bold text-amber-300 w-10">{Math.round(speed * 100)}%</span>
          </label>

          <div className="flex items-center gap-1.5 text-slate-300">
            <ArrowUpDown className="w-3.5 h-3.5 text-cyan-400" />
            <span>Transpose:</span>
            <button
              onClick={() => handleTransposeChange(Math.max(-12, transpose - 1))}
              className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 font-bold cursor-pointer"
            >
              -
            </button>
            <span className="font-mono font-bold text-cyan-300 w-8 text-center">
              {transpose > 0 ? `+${transpose}` : transpose}
            </span>
            <button
              onClick={() => handleTransposeChange(Math.min(12, transpose + 1))}
              className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 font-bold cursor-pointer"
            >
              +
            </button>
          </div>

          {tracks.length > 1 && (
            <select
              value={selectedTrackIdx}
              onChange={e => handleTrackSwitch(Number(e.target.value))}
              className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200"
            >
              {tracks.map(t => (
                <option key={t.index} value={t.index}>
                  Spur: {t.name}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Auto-Speed & Auto-Transpose Practice Trainer (per Repetition / Loop) */}
      <div className="studio-card rounded-2xl p-3.5 sm:p-4 grid grid-cols-1 xl:grid-cols-2 gap-3.5 text-xs">
        {/* Auto-Speed Trainer */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setAutoSpeedEnabled(v => {
                  const next = !v;
                  if (next) setIsLooping(true);
                  return next;
                });
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold border cursor-pointer transition-all ${
                autoSpeedEnabled
                  ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                  : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-500'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              Auto-Speed: {autoSpeedEnabled ? 'AN' : 'AUS'}
            </button>
            <span className="text-slate-400 hidden sm:inline">Tempo steigern:</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <label className="flex items-center gap-1 text-slate-300">
              <span>+</span>
              <select
                value={autoSpeedStepPct}
                onChange={e => setAutoSpeedStepPct(Number(e.target.value))}
                className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-amber-300 font-bold"
              >
                <option value={2}>2%</option>
                <option value={5}>5%</option>
                <option value={10}>10%</option>
              </select>
            </label>

            <label className="flex items-center gap-1 text-slate-300">
              <span>alle</span>
              <select
                value={autoSpeedEveryLoops}
                onChange={e => setAutoSpeedEveryLoops(Number(e.target.value))}
                className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-white font-bold"
              >
                {[1, 2, 3, 4, 6, 8].map(n => (
                  <option key={n} value={n}>
                    {n}x
                  </option>
                ))}
              </select>
            </label>

            <label className="flex items-center gap-1 text-slate-300">
              <span>Max:</span>
              <select
                value={autoSpeedMaxPct}
                onChange={e => setAutoSpeedMaxPct(Number(e.target.value))}
                className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-emerald-300 font-bold"
              >
                {[100, 110, 120, 125, 140, 150].map(m => (
                  <option key={m} value={m}>
                    {m}%
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        {/* Auto-Transpose Trainer */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80">
          <div className="flex items-center gap-2">
            <Compass className={`w-4 h-4 ${autoTransposeMode !== 'none' ? 'text-cyan-400' : 'text-slate-500'}`} />
            <span className="font-bold text-slate-200">Auto-Transpose:</span>
            <select
              value={autoTransposeMode}
              onChange={e => {
                const mode = e.target.value as TabTransposeAutoMode;
                setAutoTransposeMode(mode);
                if (mode !== 'none') setIsLooping(true);
              }}
              className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-cyan-300 font-bold"
            >
              <option value="none">Aus</option>
              <option value="chromatic_up">Chromatisch (+1 HT)</option>
              <option value="chromatic_down">Chromatisch (-1 HT)</option>
              <option value="cw">Quintenzirkel ↻ (+7)</option>
              <option value="ccw">Quartenzirkel ↺ (+5)</option>
              <option value="random">Zufällig (-5..+6)</option>
            </select>
          </div>

          <div className="flex items-center gap-2.5">
            <label className="flex items-center gap-1 text-slate-300">
              <span>alle</span>
              <select
                value={autoTransposeEveryLoops}
                onChange={e => setAutoTransposeEveryLoops(Number(e.target.value))}
                className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-white font-bold"
              >
                {[1, 2, 3, 4, 6, 8].map(n => (
                  <option key={n} value={n}>
                    {n}x
                  </option>
                ))}
              </select>
            </label>

            <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 font-mono text-amber-300 font-bold">
              Loops: {completedLoops}
            </span>

            {completedLoops > 0 && (
              <button
                onClick={resetPracticeProgress}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                title="Loop-Zähler zurücksetzen"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Score Rendering Viewport */}
      <div className="studio-card rounded-2xl p-4 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
          <span className="font-semibold text-slate-200">{fileName}</span>
          <span>{statusMsg} • Tipp: Ziehe über Takte im Notenbild, um eine Loop-Sektion zu markieren</span>
        </div>
        <div className="rounded-xl bg-white p-2 sm:p-4 overflow-x-auto min-h-[340px] max-h-[680px] overflow-y-auto shadow-inner">
          <div ref={containerRef} />
        </div>
      </div>
    </div>
  );
};
