import React, { useMemo, useState } from 'react';
import {
  Dumbbell,
  Play,
  FileMusic,
  Sparkles,
  CheckCircle2,
  Circle,
  Upload,
  Download,
  Clock,
  Target,
  Flame,
  Search,
  ChevronDown,
  ChevronRight,
  LayoutList,
  LayoutGrid,
  Trash2,
  PenTool,
  Guitar,
} from 'lucide-react';
import {
  ALL_SECTIONS,
  ALL_TOPICS,
  CURATED_EXERCISES,
  DifficultyLevel,
  ExerciseSection,
  ExerciseTopic,
  PracticeExercise,
  getExerciseSection,
} from '../data/exercises';
import { audioEngine } from '../audio/audioEngine';
import { CUSTOM_EXERCISES_KEY, TabHandoffPayload } from './TabPlayerTool';
import { SavedPreset, deleteUserPreset, loadUserPresets } from '../utils/storage';

interface CustomTabData {
  tex: string;
  tempo?: number;
}

interface ExerciseGeneratorToolProps {
  onOpenInTabPlayer: (exercise: TabHandoffPayload) => void;
}

export const ExerciseGeneratorTool: React.FC<ExerciseGeneratorToolProps> = ({ onOpenInTabPlayer }) => {
  const [exercises, setExercises] = useState<PracticeExercise[]>(CURATED_EXERCISES);
  const [customTabs, setCustomTabs] = useState<SavedPreset<CustomTabData>[]>(() =>
    loadUserPresets<CustomTabData>(CUSTOM_EXERCISES_KEY)
  );
  const [activeSection, setActiveSection] = useState<ExerciseSection | 'Alle'>('Alle');
  const [onlyGuitarPro, setOnlyGuitarPro] = useState<boolean>(false);
  const [selectedTopics, setSelectedTopics] = useState<ExerciseTopic[]>([]);
  const [difficultyFilter, setDifficultyFilter] = useState<DifficultyLevel | 'Alle'>('Alle');
  const [instrumentFilter, setInstrumentFilter] = useState<'Alle' | 'Gitarre' | 'Klavier'>('Alle');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewLayout, setViewLayout] = useState<'compact' | 'cards'>('compact');
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

  // Daily Routine Generator
  const [routineIds, setRoutineIds] = useState<string[]>([]);
  const [completedIds, setCompletedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('fk_completed_exercises');
      return saved ? (JSON.parse(saved) as string[]) : [];
    } catch {
      return [];
    }
  });
  const [routineMinutes, setRoutineMinutes] = useState<number>(25);

  const toggleTopic = (t: ExerciseTopic) => {
    setSelectedTopics(prev => (prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]));
  };

  const filteredExercises = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return exercises.filter(ex => {
      if (onlyGuitarPro && !ex.fileUrl) return false;
      if (activeSection !== 'Alle' && getExerciseSection(ex) !== activeSection) return false;
      if (selectedTopics.length > 0 && !ex.topics.some(t => selectedTopics.includes(t))) return false;
      if (difficultyFilter !== 'Alle' && ex.difficulty !== difficultyFilter) return false;
      if (instrumentFilter !== 'Alle' && ex.instrument !== 'Beide' && ex.instrument !== instrumentFilter) return false;
      if (q) {
        const hay = `${ex.title} ${ex.summary} ${ex.techniqueFocus} ${ex.source ?? ''} ${ex.topics.join(' ')}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [exercises, onlyGuitarPro, activeSection, selectedTopics, difficultyFilter, instrumentFilter, searchQuery]);

  const gpStudyCount = useMemo(() => exercises.filter(e => Boolean(e.fileUrl)).length, [exercises]);

  const handleDeleteCustomTab = (id: string) => {
    setCustomTabs(deleteUserPreset<CustomTabData>(CUSTOM_EXERCISES_KEY, id));
  };

  // Group filtered exercises cleanly by pedagogical section
  const groupedExercises = useMemo(() => {
    const groups: Array<{ section: ExerciseSection; items: PracticeExercise[] }> = [];
    for (const sec of ALL_SECTIONS) {
      const items = filteredExercises.filter(ex => getExerciseSection(ex) === sec);
      if (items.length > 0) groups.push({ section: sec, items });
    }
    return groups;
  }, [filteredExercises]);

  const toggleCompleted = (id: string) => {
    setCompletedIds(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      try {
        localStorage.setItem('fk_completed_exercises', JSON.stringify(next));
      } catch {
        // ignore storage errors
      }
      return next;
    });
  };

  // Smart balanced routine: always tries to start with 1 Warmup + filtered core exercises!
  const generateRoutine = () => {
    const warmups = exercises.filter(e => getExerciseSection(e) === 'Warmup & Fingerakrobatik');
    const pool = filteredExercises.length > 0 ? [...filteredExercises] : [...exercises];
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }

    const picked: string[] = [];
    let accMin = 0;

    // Pick 1 short warmup first if available
    if (warmups.length > 0 && activeSection === 'Alle') {
      const w = warmups[Math.floor(Math.random() * warmups.length)];
      picked.push(w.id);
      accMin += w.durationMin;
    }

    for (const ex of pool) {
      if (picked.includes(ex.id)) continue;
      if (accMin + ex.durationMin <= routineMinutes + 4 || picked.length === 0) {
        picked.push(ex.id);
        accMin += ex.durationMin;
      }
      if (accMin >= routineMinutes) break;
    }
    setRoutineIds(picked);
  };

  const playPreview = (ex: PracticeExercise) => {
    const ctx = audioEngine.getContext();
    const timbre = ex.instrument === 'Klavier' ? 'piano' : 'guitar';
    ex.previewNotes.forEach((m, i) => {
      audioEngine.playNote(m, {
        time: ctx.currentTime + i * 0.17,
        duration: 0.45,
        timbre,
        velocity: 0.78,
      });
    });
  };

  const handleExportPack = () => {
    const blob = new Blob([JSON.stringify(exercises, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'fretkeys-exercises-pack.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportPack = async (file: File) => {
    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as PracticeExercise[];
      if (!Array.isArray(parsed)) throw new Error('JSON muss ein Array aus Übungen sein.');
      const valid = parsed.filter(item => item.id && item.title && (item.alphaTex || item.fileUrl));
      if (valid.length === 0) throw new Error('Keine gültigen Übungen mit AlphaTex gefunden.');
      setExercises(prev => {
        const map = new Map(prev.map(e => [e.id, e]));
        valid.forEach(v => map.set(v.id, v));
        return Array.from(map.values());
      });
      alert(`${valid.length} Übungen erfolgreich importiert!`);
    } catch (err) {
      alert(`Import fehlgeschlagen: ${err instanceof Error ? err.message : 'Ungültiges JSON-Format'}`);
    }
  };

  const routineExercises = routineIds
    .map(id => exercises.find(e => e.id === id))
    .filter((e): e is PracticeExercise => Boolean(e));

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Dumbbell className="w-6 h-6 text-amber-400" />
            Übungsgenerator &amp; Strukturierte Bibliothek ({exercises.length})
          </h2>
          <p className="text-sm text-slate-400">
            Nach Trainingsbereichen gruppiert: Warmups &amp; Fingerakrobatik, Picking &amp; Legato, Funk-Strumming, Jazz Voicings, Walking Bass, Blues, Bluegrass &amp; Klavier.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <label className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-cyan-500 text-slate-200 font-semibold cursor-pointer">
            <Upload className="w-3.5 h-3.5 text-cyan-400" />
            JSON-Pack importieren
            <input
              type="file"
              accept=".json"
              className="hidden"
              onChange={e => {
                const f = e.target.files?.[0];
                if (f) void handleImportPack(f);
              }}
            />
          </label>
          <button
            onClick={handleExportPack}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-amber-500 text-slate-200 font-semibold cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-amber-400" />
            Exportieren
          </button>
        </div>
      </div>

      {/* Section Category Tabs (Clean Top-Level Ordering!) */}
      <div className="flex flex-wrap gap-1.5">
        <button
          onClick={() => setOnlyGuitarPro(v => !v)}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
            onlyGuitarPro
              ? 'bg-emerald-500 border-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20'
              : 'bg-emerald-500/10 border-emerald-500/35 text-emerald-300 hover:bg-emerald-500/20'
          }`}
        >
          <Guitar className="w-3.5 h-3.5" />
          Guitar Pro Studien (.gp/.gp5) <span className="opacity-80">({gpStudyCount})</span>
        </button>

        {(['Alle', ...ALL_SECTIONS] as const).map(sec => {
          const count = sec === 'Alle' ? exercises.length : exercises.filter(e => getExerciseSection(e) === sec).length;
          const active = activeSection === sec;
          return (
            <button
              key={sec}
              onClick={() => setActiveSection(sec)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                active
                  ? 'bg-amber-500 border-amber-400 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-slate-900/90 border-slate-800 text-slate-300 hover:border-slate-600'
              }`}
            >
              {sec} <span className={`ml-1 ${active ? 'text-slate-900/80' : 'text-slate-500'}`}>({count})</span>
            </button>
          );
        })}
      </div>

      {/* Custom User-Created Tabs from Visual Tab Editor */}
      {customTabs.length > 0 && (
        <div className="studio-card rounded-2xl p-4 border border-cyan-500/30 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-bold text-cyan-300 flex items-center gap-2">
              <PenTool className="w-4 h-4" />
              Eigene Tabs aus dem Visuellen Editor ({customTabs.length})
            </h3>
            <span className="text-[11px] text-slate-400">Lokal im Browser gespeichert</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {customTabs.map(item => (
              <div
                key={item.id}
                className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-2"
              >
                <div className="min-w-0">
                  <div className="text-xs font-bold text-white truncate">{item.name}</div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    {item.data.tempo ? `${item.data.tempo} BPM • ` : ''}AlphaTex Eigenkomposition
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() =>
                      onOpenInTabPlayer({
                        title: item.name,
                        tex: item.data.tex,
                        id: item.id,
                      })
                    }
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-[11px] font-bold cursor-pointer"
                  >
                    <FileMusic className="w-3 h-3" /> Öffnen
                  </button>
                  <button
                    onClick={() => handleDeleteCustomTab(item.id)}
                    className="p-1.5 rounded-lg bg-slate-900 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 cursor-pointer"
                    title="Eigenen Tab löschen"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search, Filters, View Switcher & Routine Generator */}
      <div className="studio-card rounded-2xl p-4 space-y-3.5">
        <div className="flex flex-wrap items-center gap-2.5 text-xs">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Übung, Technik oder Künstler-Stil suchen (z.B. Petrucci, Walking Bass, Drop-2, Legato)..."
              className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <select
            value={difficultyFilter}
            onChange={e => setDifficultyFilter(e.target.value as DifficultyLevel | 'Alle')}
            className="bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-2 text-slate-200"
          >
            <option value="Alle">Level: Alle</option>
            <option value="Einsteiger">Einsteiger</option>
            <option value="Mittel">Mittel</option>
            <option value="Fortgeschritten">Fortgeschritten</option>
          </select>

          <select
            value={instrumentFilter}
            onChange={e => setInstrumentFilter(e.target.value as 'Alle' | 'Gitarre' | 'Klavier')}
            className="bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-2 text-slate-200"
          >
            <option value="Alle">Instrument: Alle</option>
            <option value="Gitarre">Gitarre</option>
            <option value="Klavier">Klavier</option>
          </select>

          <div className="flex bg-slate-950 border border-slate-800 rounded-xl p-0.5">
            <button
              onClick={() => setViewLayout('compact')}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-semibold cursor-pointer ${
                viewLayout === 'compact' ? 'bg-slate-800 text-white' : 'text-slate-400'
              }`}
              title="Kompakte Listenansicht (übersichtlich)"
            >
              <LayoutList className="w-3.5 h-3.5" /> Liste
            </button>
            <button
              onClick={() => setViewLayout('cards')}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-semibold cursor-pointer ${
                viewLayout === 'cards' ? 'bg-slate-800 text-white' : 'text-slate-400'
              }`}
              title="Detail-Kartenansicht"
            >
              <LayoutGrid className="w-3.5 h-3.5" /> Karten
            </button>
          </div>
        </div>

        {/* Fine-grained Tag Chips */}
        <div className="flex flex-wrap gap-1.5">
          {ALL_TOPICS.map(topic => {
            const active = selectedTopics.includes(topic);
            return (
              <button
                key={topic}
                onClick={() => toggleTopic(topic)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all cursor-pointer ${
                  active
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200'
                    : 'bg-slate-900/70 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                #{topic}
              </button>
            );
          })}
          {selectedTopics.length > 0 && (
            <button
              onClick={() => setSelectedTopics([])}
              className="px-2 py-1 rounded-lg text-[11px] text-rose-300 hover:text-rose-200 cursor-pointer"
            >
              Tags zurücksetzen
            </button>
          )}
        </div>

        {/* Smart Session Generator */}
        <div className="pt-2.5 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 text-xs text-slate-300">
            <Flame className="w-4 h-4 text-amber-400" />
            <span className="font-semibold">Tages-Routine (inkl. Warmup):</span>
            <select
              value={routineMinutes}
              onChange={e => setRoutineMinutes(Number(e.target.value))}
              className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-amber-300 font-bold"
            >
              <option value={15}>15 Min. Express</option>
              <option value={25}>25 Min. Fokus</option>
              <option value={40}>40 Min. Deep Practice</option>
            </select>
          </div>
          <button
            onClick={generateRoutine}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            Übungsplan generieren
          </button>
        </div>
      </div>

      {/* Generated Routine Highlight */}
      {routineExercises.length > 0 && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/12 via-cyan-500/10 to-slate-900/90 border border-amber-500/35 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-amber-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Deine generierte Übungs-Session ({routineExercises.reduce((s, e) => s + e.durationMin, 0)} Min.)
            </h3>
            <button
              onClick={() => setRoutineIds([])}
              className="text-xs text-slate-400 hover:text-white cursor-pointer"
            >
              Ausblenden
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
            {routineExercises.map((ex, idx) => {
              const done = completedIds.includes(ex.id);
              return (
                <div
                  key={ex.id}
                  className="p-3 rounded-xl bg-slate-950/75 border border-slate-800 flex items-start justify-between gap-2"
                >
                  <div className="space-y-1">
                    <div className="text-[10px] font-bold text-cyan-400">
                      Block {idx + 1} • {ex.durationMin} Min. • {ex.startBpm}–{ex.targetBpm} BPM
                    </div>
                    <div className="text-xs font-bold text-white">{ex.title}</div>
                    <button
                      onClick={() =>
                        onOpenInTabPlayer({ title: ex.title, tex: ex.alphaTex, fileUrl: ex.fileUrl, id: ex.id })
                      }
                      className="text-[11px] font-semibold text-amber-400 hover:text-amber-300 cursor-pointer"
                    >
                      → Im Tab-Player öffnen
                    </button>
                  </div>
                  <button
                    onClick={() => toggleCompleted(ex.id)}
                    className="text-slate-400 hover:text-emerald-400 cursor-pointer mt-0.5"
                  >
                    {done ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <Circle className="w-5 h-5" />}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Grouped Collapsible Exercise Library */}
      {groupedExercises.length === 0 ? (
        <div className="studio-card rounded-2xl p-8 text-center text-sm text-slate-400">
          Keine Übungen für diese Filter gefunden.
        </div>
      ) : (
        <div className="space-y-4">
          {groupedExercises.map(({ section, items }) => {
            const isCollapsed = Boolean(collapsedSections[section]);
            return (
              <div key={section} className="studio-card rounded-2xl overflow-hidden">
                {/* Collapsible Section Header */}
                <button
                  onClick={() =>
                    setCollapsedSections(prev => ({ ...prev, [section]: !prev[section] }))
                  }
                  className="w-full px-4 py-3 bg-slate-900/80 hover:bg-slate-800/80 border-b border-slate-800/80 flex items-center justify-between text-left cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    {isCollapsed ? (
                      <ChevronRight className="w-4 h-4 text-amber-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-amber-400" />
                    )}
                    <span className="text-sm font-bold text-white">{section}</span>
                    <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[11px] font-bold text-cyan-300">
                      {items.length}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500">
                    {items.filter(i => completedIds.includes(i.id)).length}/{items.length} erledigt
                  </span>
                </button>

                {!isCollapsed && viewLayout === 'compact' && (
                  <div className="divide-y divide-slate-800/70">
                    {items.map(ex => {
                      const done = completedIds.includes(ex.id);
                      const isExpanded = expandedCardId === ex.id;
                      return (
                        <div key={ex.id} className="px-4 py-3 hover:bg-slate-900/40 transition-colors">
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              <button
                                onClick={() => toggleCompleted(ex.id)}
                                className="text-slate-500 hover:text-emerald-400 cursor-pointer shrink-0"
                                title={done ? 'Erledigt' : 'Als erledigt markieren'}
                              >
                                {done ? (
                                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                ) : (
                                  <Circle className="w-4 h-4" />
                                )}
                              </button>
                              <button
                                onClick={() => setExpandedCardId(isExpanded ? null : ex.id)}
                                className="text-left min-w-0 flex-1 cursor-pointer group"
                              >
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                                    {ex.title}
                                  </span>
                                  {ex.fileUrl && (
                                    <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold">
                                      GP{ex.barsCount ? ` • ${ex.barsCount} Takte` : ''}
                                    </span>
                                  )}
                                  {!ex.fileUrl && ex.barsCount && ex.barsCount >= 8 && (
                                    <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-[10px] font-bold">
                                      {ex.barsCount} Takte
                                    </span>
                                  )}
                                  <span className="px-1.5 py-0.5 rounded bg-slate-800 text-amber-300 text-[10px] font-bold">
                                    {ex.difficulty}
                                  </span>
                                  <span className="text-[11px] font-mono text-slate-400">
                                    {ex.startBpm}→{ex.targetBpm} BPM • {ex.durationMin}m
                                  </span>
                                </div>
                                <div className="text-xs text-slate-400 truncate mt-0.5">{ex.summary}</div>
                              </button>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                onClick={() => playPreview(ex)}
                                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer"
                              >
                                <Play className="w-3 h-3 fill-current text-cyan-400" /> Vorhören
                              </button>
                              <button
                                onClick={() =>
                                  onOpenInTabPlayer({ title: ex.title, tex: ex.alphaTex, fileUrl: ex.fileUrl, id: ex.id })
                                }
                                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold cursor-pointer"
                              >
                                <FileMusic className="w-3.5 h-3.5" /> Tab-Player
                              </button>
                            </div>
                          </div>

                          {isExpanded && (
                            <div className="mt-3 ml-7 p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5 text-xs">
                              <p className="text-slate-300">{ex.summary}</p>
                              <div className="text-slate-300">
                                <span className="font-bold text-amber-400">Technik-Fokus:</span> {ex.techniqueFocus}
                              </div>
                              <div className="text-slate-400">
                                <span className="font-bold text-emerald-400">Steigerung:</span> {ex.progressionTip}
                              </div>
                              {ex.source && (
                                <div className="text-[11px] text-slate-500 pt-1">
                                  Quelle: <span className="text-slate-300">{ex.source}</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {!isCollapsed && viewLayout === 'cards' && (
                  <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {items.map(ex => {
                      const done = completedIds.includes(ex.id);
                      return (
                        <div
                          key={ex.id}
                          className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col justify-between space-y-3"
                        >
                          <div className="space-y-2.5">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <div className="flex flex-wrap items-center gap-1 mb-1">
                                  {ex.fileUrl && (
                                    <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold">
                                      GP{ex.barsCount ? ` • ${ex.barsCount} Takte` : ''}
                                    </span>
                                  )}
                                  {!ex.fileUrl && ex.barsCount && ex.barsCount >= 8 && (
                                    <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-[10px] font-bold">
                                      {ex.barsCount} Takte
                                    </span>
                                  )}
                                  {ex.topics.map(t => (
                                    <span key={t} className="px-1.5 py-0.5 rounded bg-cyan-500/15 text-cyan-300 text-[10px] font-bold">
                                      {t}
                                    </span>
                                  ))}
                                  <span className="px-1.5 py-0.5 rounded bg-slate-800 text-amber-300 text-[10px] font-bold">
                                    {ex.difficulty}
                                  </span>
                                </div>
                                <h4 className="text-sm font-bold text-white leading-snug">{ex.title}</h4>
                              </div>
                              <button
                                onClick={() => toggleCompleted(ex.id)}
                                className="text-slate-500 hover:text-emerald-400 cursor-pointer shrink-0"
                              >
                                {done ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <Circle className="w-5 h-5" />}
                              </button>
                            </div>
                            <p className="text-xs text-slate-300">{ex.summary}</p>
                            <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800/80 space-y-1 text-[11px]">
                              <div className="text-slate-300">
                                <span className="font-bold text-amber-400">Fokus:</span> {ex.techniqueFocus}
                              </div>
                              <div className="text-slate-400">
                                <span className="font-bold text-emerald-400">Tipp:</span> {ex.progressionTip}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800/70">
                            <div className="flex items-center gap-2.5 text-[11px] font-mono text-slate-400">
                              <span className="flex items-center gap-1">
                                <Target className="w-3 h-3 text-amber-400" />
                                {ex.startBpm}→{ex.targetBpm}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3 text-cyan-400" />
                                {ex.durationMin}m
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => playPreview(ex)}
                                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer"
                              >
                                <Play className="w-3 h-3 fill-current text-cyan-400" /> Vorhören
                              </button>
                              <button
                                onClick={() =>
                                  onOpenInTabPlayer({ title: ex.title, tex: ex.alphaTex, fileUrl: ex.fileUrl, id: ex.id })
                                }
                                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold cursor-pointer"
                              >
                                <FileMusic className="w-3.5 h-3.5" /> Tab-Player
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
