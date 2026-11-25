import React, { useEffect, useState } from 'react';
import {
  LayoutGrid,
  Layers,
  Radio,
  FileMusic,
  Piano,
  Dumbbell,
  Drum,
  Compass,
  Crosshair,
  Repeat,
  GraduationCap,
  Menu,
  X,
  Volume2,
  Guitar,
  Sparkles,
  ArrowRight,
  Cable,
  Download,
} from 'lucide-react';
import { FretboardHelper } from './tools/FretboardHelper';
import { TunerTool } from './tools/TunerTool';
import { DrumMachineTool } from './tools/DrumMachineTool';
import { CircleOfFifthsTool } from './tools/CircleOfFifthsTool';
import { ProgressionTrainerTool } from './tools/ProgressionTrainerTool';
import { TabHandoffPayload, TabPlayerTool } from './tools/TabPlayerTool';
import { MidiSynthesiaPlayer } from './tools/MidiSynthesiaPlayer';
import { ExerciseGeneratorTool } from './tools/ExerciseGeneratorTool';
import { FretboardTrainerTool } from './tools/FretboardTrainerTool';
import { QuizHubTool } from './tools/QuizHubTool';
import { audioEngine } from './audio/audioEngine';
import { midiInput, MidiManagerSnapshot } from './audio/midiInput';
import {
  NoteNamingLocale,
  getNoteNamingLocale,
  midiToNoteName,
  setNoteNamingLocale,
  subscribeNoteNaming,
} from './theory/musicTheory';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

type ToolId =
  | 'dashboard'
  | 'fretboard-helper'
  | 'progression-trainer'
  | 'circle-of-fifths'
  | 'tab-player'
  | 'midi-synthesia'
  | 'exercise-generator'
  | 'drum-machine'
  | 'tuner'
  | 'fretboard-trainer'
  | 'quizzes';

interface NavTool {
  id: ToolId;
  label: string;
  shortDesc: string;
  badge?: string;
  accent: string;
  icon: React.FC<{ className?: string }>;
}

const TOOLS: NavTool[] = [
  {
    id: 'fretboard-helper',
    label: 'Fretboard & Piano Helper',
    shortDesc: 'Skalen, Multi-Layer Merge, Akkord-Lagen & Arpeggio-Sequenz Player',
    badge: 'Gitarre + Piano',
    accent: 'from-amber-500/20 to-cyan-500/10 border-amber-500/30',
    icon: Layers,
  },
  {
    id: 'progression-trainer',
    label: 'Progression-Übungstool',
    shortDesc: 'Aktueller + Folgeakkord live am Griffbrett mit Quintenzirkel-Modulation',
    badge: 'Voice-Leading',
    accent: 'from-cyan-500/20 to-blue-500/10 border-cyan-500/30',
    icon: Repeat,
  },
  {
    id: 'circle-of-fifths',
    label: 'Quintenzirkel',
    shortDesc: 'Interaktives I–vi Segment, Dreiklänge & Vierklänge, Songwriting-Leiste',
    badge: 'Theorie',
    accent: 'from-amber-500/20 to-orange-500/10 border-amber-500/30',
    icon: Compass,
  },
  {
    id: 'tab-player',
    label: 'Tab / GP Viewer & Editor',
    shortDesc: 'GP3–GP8, MusicXML, AlphaTex & visueller 6-Saiten Tab-Editor mit SoundFont-Playback',
    badge: 'GP + Editor',
    accent: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/30',
    icon: FileMusic,
  },
  {
    id: 'midi-synthesia',
    label: 'MIDI Synthesia & Noten',
    shortDesc: 'Tasten-Wasserfall + Live-Notensystem inkl. 26 kompletter Klassik-MIDIs (Mutopia)',
    badge: 'Synthesia',
    accent: 'from-sky-500/20 to-indigo-500/10 border-sky-500/30',
    icon: Piano,
  },
  {
    id: 'exercise-generator',
    label: 'Übungsgenerator',
    shortDesc: 'Echte Guitar-Pro-Studien (bis 72 Takte), Ausdauer-Etüden & eigene Tabs',
    badge: 'GP & Workouts',
    accent: 'from-orange-500/20 to-rose-500/10 border-orange-500/30',
    icon: Dumbbell,
  },
  {
    id: 'drum-machine',
    label: 'Metronom & Drum-Machine',
    shortDesc: 'Studio-Drums, ungerade Takte (5/4, 7/8, 9/8, 11/8), Swing & Speed-Trainer',
    badge: 'Odd Meters',
    accent: 'from-rose-500/20 to-pink-500/10 border-rose-500/30',
    icon: Drum,
  },
  {
    id: 'tuner',
    label: 'Stimmgerät & Stimmpfeife',
    shortDesc: 'Echtzeit-Frequenzerkennung (Mikro / Line-In) + chromatische Stimmpfeife',
    badge: 'Live Mic',
    accent: 'from-emerald-500/20 to-cyan-500/10 border-emerald-500/30',
    icon: Radio,
  },
  {
    id: 'fretboard-trainer',
    label: 'Fretboard Trainer',
    shortDesc: 'Noten am Griffbrett blitzschnell erkennen & finden inkl. 60s Sprint',
    badge: 'Drill',
    accent: 'from-amber-500/20 to-yellow-500/10 border-amber-500/30',
    icon: Crosshair,
  },
  {
    id: 'quizzes',
    label: 'Gehörbildung & Quizzes',
    shortDesc: 'Intervalle, Akkordtypen, Progressionen & Pitch mit Richtung & Umfang',
    badge: 'Ear Training',
    accent: 'from-violet-500/20 to-fuchsia-500/10 border-violet-500/30',
    icon: GraduationCap,
  },
];

export function App() {
  const [activeTool, setActiveTool] = useState<ToolId>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [masterVol, setMasterVol] = useState(0.85);

  // Cross-tool handoff states
  const [handoffAlphaTex, setHandoffAlphaTex] = useState<TabHandoffPayload | null>(null);
  const [handoffProg, setHandoffProg] = useState<{
    chords: Array<{ rootPc: number; chordId: string; beats: number }>;
    keyPc: number;
  } | null>(null);

  // Global Web MIDI, Note Naming Locale (DE vs Intl) & PWA Install state
  const [midiState, setMidiState] = useState<MidiManagerSnapshot>(() => midiInput.getSnapshot());
  const [noteLocale, setNoteLocale] = useState<NoteNamingLocale>(() => getNoteNamingLocale());
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const unsub = midiInput.subscribeState(setMidiState);
    const unsubLocale = subscribeNoteNaming(setNoteLocale);
    const onInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', onInstallPrompt);
    return () => {
      unsub();
      unsubLocale();
      window.removeEventListener('beforeinstallprompt', onInstallPrompt);
    };
  }, []);

  const handleInstallPwa = async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    await installPrompt.userChoice;
    setInstallPrompt(null);
  };

  const navigate = (id: ToolId) => {
    setActiveTool(id);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleVolumeChange = (v: number) => {
    setMasterVol(v);
    audioEngine.setMasterVolume(v);
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row text-slate-100">
      {/* Mobile Top Header */}
      <header className="lg:hidden sticky top-0 z-40 flex items-center justify-between px-4 py-3 bg-[#0b0d12]/95 backdrop-blur-md border-b border-slate-800/80">
        <button onClick={() => navigate('dashboard')} className="flex items-center gap-2.5 cursor-pointer">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-amber-500/20">
            <Guitar className="w-4 h-4" />
          </div>
          <span className="font-black tracking-tight text-white">
            FretKeys <span className="text-amber-400">Studio</span>
          </span>
        </button>

        <button
          onClick={() => setMobileMenuOpen(v => !v)}
          className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 cursor-pointer"
          aria-label="Menü umschalten"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* Sidebar Navigation */}
      <aside
        className={`w-[264px] shrink-0 h-screen bg-[#0d1018]/98 backdrop-blur-xl border-r border-slate-800/80 flex flex-col z-30 lg:sticky lg:top-0 max-lg:fixed max-lg:top-0 max-lg:left-0 max-lg:transition-transform max-lg:duration-200 ${
          mobileMenuOpen ? 'max-lg:translate-x-0' : 'max-lg:-translate-x-full'
        }`}
      >
        {/* Brand */}
        <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
          <button onClick={() => navigate('dashboard')} className="flex items-center gap-3 text-left cursor-pointer group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-orange-600 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/25 group-hover:scale-105 transition-transform">
              <Guitar className="w-5 h-5" />
            </div>
            <div>
              <div className="font-black tracking-tight text-base text-white leading-tight">
                FretKeys <span className="text-amber-400">Studio</span>
              </div>
              <div className="text-[11px] text-slate-400 font-medium">Gitarre &amp; Klavier Suite</div>
            </div>
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          <button
            onClick={() => navigate('dashboard')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTool === 'dashboard'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
            }`}
          >
            <LayoutGrid className="w-4 h-4 shrink-0" />
            <span>Studio Übersicht</span>
          </button>

          <div className="pt-3 pb-1 px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Trainings-Tools
          </div>

          {TOOLS.map(tool => {
            const Icon = tool.icon;
            const isActive = activeTool === tool.id;
            return (
              <button
                key={tool.id}
                onClick={() => navigate(tool.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-slate-800/95 text-amber-300 border border-amber-500/35 shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800/50 hover:text-white border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                <span className="truncate">{tool.label}</span>
              </button>
            );
          })}
        </nav>

        {/* MIDI, Note Naming (DE/Intl), PWA Install & Master Volume Footer */}
        <div className="p-3.5 border-t border-slate-800/80 space-y-2.5">
          {/* Global German (H/B) vs International (B/Bb) Note Naming Switch */}
          <div className="flex items-center justify-between gap-2 px-2.5 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-[11px]">
            <span className="font-bold text-slate-300">Notennamen</span>
            <div className="flex bg-slate-950 rounded-lg p-0.5 border border-slate-800">
              <button
                onClick={() => setNoteNamingLocale('intl')}
                className={`px-2 py-0.5 rounded-md font-bold cursor-pointer transition-colors ${
                  noteLocale === 'intl' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
                title="Internationale Schreibweise: Bb und B"
              >
                Intl (B/Bb)
              </button>
              <button
                onClick={() => setNoteNamingLocale('de')}
                className={`px-2 py-0.5 rounded-md font-bold cursor-pointer transition-colors ${
                  noteLocale === 'de' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
                title="Deutsche Schreibweise: B (=Bb) und H (=B)"
              >
                DE (H/B)
              </button>
            </div>
          </div>

          {/* Web MIDI Keyboard Status Card */}
          <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between gap-1.5">
              <span className="flex items-center gap-1.5 text-[11px] font-bold text-slate-200">
                <Cable className={`w-3.5 h-3.5 ${midiState.connected ? 'text-emerald-400' : 'text-slate-500'}`} />
                USB-MIDI Keyboard
              </span>
              <span
                className={`w-2 h-2 rounded-full ${
                  midiState.connected ? 'bg-emerald-400 shadow-sm shadow-emerald-400' : 'bg-slate-600'
                }`}
              />
            </div>

            {midiState.connected ? (
              <div className="space-y-1.5">
                <div className="text-[10px] text-emerald-300 font-semibold truncate">
                  {midiState.devices[0]?.name}
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={midiState.monitorAudio}
                      onChange={e => midiInput.setMonitorAudio(e.target.checked)}
                      className="accent-emerald-500"
                    />
                    Audio-Monitor
                  </label>
                  {midiState.activeNotes.length > 0 && (
                    <span className="font-mono font-bold text-amber-300">
                      {midiState.activeNotes.slice(0, 3).map(m => midiToNoteName(m)).join(' ')}
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <button
                onClick={() => void midiInput.connect()}
                className="w-full py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-semibold text-cyan-300 cursor-pointer transition-colors"
              >
                {midiState.supported ? 'MIDI verbinden' : 'Kein Web-MIDI'}
              </button>
            )}
          </div>

          {installPrompt && (
            <button
              onClick={() => void handleInstallPwa()}
              className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 text-xs font-bold cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" /> Als App installieren (PWA)
            </button>
          )}

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5 font-semibold">
                <Volume2 className="w-3.5 h-3.5 text-amber-400" /> Master
              </span>
              <span className="font-mono text-slate-300">{Math.round(masterVol * 100)}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={1.2}
              step={0.05}
              value={masterVol}
              onChange={e => handleVolumeChange(Number(e.target.value))}
              className="w-full accent-amber-500"
            />
          </div>
        </div>
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/60 backdrop-blur-xs lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 max-w-[1440px] w-full mx-auto">
        {activeTool === 'dashboard' && (
          <div className="space-y-7">
            {/* Hero Welcome */}
            <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-slate-900 via-[#121726] to-slate-950 border border-slate-800 shadow-2xl">
              <div className="relative z-10 max-w-3xl space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold">
                  <Sparkles className="w-3.5 h-3.5" />
                  All-in-One Cross-Platform Practice Suite
                </div>
                <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
                  Willkommen im <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-cyan-400">FretKeys Studio</span>
                </h1>
                <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                  Deine modulare Trainingsumgebung für <strong className="text-white">Gitarre &amp; Klavier</strong> – vom interaktiven Multi-Layer Fretboard Helper, Guitar Pro Tab-Player und Synthesia MIDI-Wasserfall über ungerade Studio-Drum-Grooves bis zu Quintenzirkel, Progression-Modulation und Gehörbildung.
                </p>
                <div className="flex flex-wrap gap-2.5 pt-2">
                  <button
                    onClick={() => navigate('fretboard-helper')}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer shadow-lg shadow-amber-500/20"
                  >
                    Fretboard Helper öffnen <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => navigate('midi-synthesia')}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-200 font-bold text-xs cursor-pointer"
                  >
                    MIDI Synthesia starten <Piano className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => navigate('exercise-generator')}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs cursor-pointer"
                  >
                    Tages-Übungsplan erstellen <Dumbbell className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Tool Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {TOOLS.map(tool => {
                const Icon = tool.icon;
                return (
                  <button
                    key={tool.id}
                    onClick={() => navigate(tool.id)}
                    className={`group text-left p-5 rounded-2xl bg-gradient-to-br ${tool.accent} border hover:scale-[1.015] transition-all cursor-pointer flex flex-col justify-between space-y-4`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="w-11 h-11 rounded-xl bg-slate-950/75 border border-white/10 flex items-center justify-center text-amber-400 group-hover:text-white group-hover:bg-amber-500 transition-colors">
                        <Icon className="w-5 h-5" />
                      </div>
                      {tool.badge && (
                        <span className="px-2.5 py-1 rounded-full bg-slate-950/60 border border-white/10 text-[10px] font-bold text-slate-200">
                          {tool.badge}
                        </span>
                      )}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white group-hover:text-amber-200 transition-colors">
                        {tool.label}
                      </h3>
                      <p className="text-xs text-slate-300/90 mt-1 leading-relaxed">{tool.shortDesc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div key={noteLocale}>
          {activeTool === 'fretboard-helper' && <FretboardHelper />}
          {activeTool === 'tuner' && <TunerTool />}
          {activeTool === 'drum-machine' && <DrumMachineTool />}
          {activeTool === 'circle-of-fifths' && (
            <CircleOfFifthsTool
              onSendToProgression={(chords, keyPc) => {
                setHandoffProg({ chords, keyPc });
                navigate('progression-trainer');
              }}
            />
          )}
          {activeTool === 'progression-trainer' && (
            <ProgressionTrainerTool
              initialChords={handoffProg?.chords}
              initialKeyPc={handoffProg?.keyPc}
            />
          )}
          {activeTool === 'tab-player' && (
            <TabPlayerTool key={handoffAlphaTex?.id ?? 'default'} externalAlphaTex={handoffAlphaTex} />
          )}
          {activeTool === 'midi-synthesia' && <MidiSynthesiaPlayer />}
          {activeTool === 'exercise-generator' && (
            <ExerciseGeneratorTool
              onOpenInTabPlayer={ex => {
                setHandoffAlphaTex(ex);
                navigate('tab-player');
              }}
            />
          )}
          {activeTool === 'fretboard-trainer' && <FretboardTrainerTool />}
          {activeTool === 'quizzes' && <QuizHubTool />}
        </div>
      </main>
    </div>
  );
}

export default App;
