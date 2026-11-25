import React, { useCallback, useEffect, useState } from 'react';
import { GraduationCap, Volume2, Flame, Trophy, RefreshCw, Ear, Music, Layers } from 'lucide-react';
import {
  CHORDS,
  INTERVALS,
  getNoteNamesArray,
  getPianoChordMidi,
  pcToName,
} from '../theory/musicTheory';
import { audioEngine, InstrumentTimbre } from '../audio/audioEngine';
import { midiInput } from '../audio/midiInput';

type QuizCategory = 'intervals' | 'chords' | 'progressions' | 'pitch';
type DirectionMode = 'up' | 'down' | 'harmonic' | 'mixed';
type RangeMode = 'narrow' | 'medium' | 'wide';
type QuizDifficulty = 'easy' | 'medium' | 'pro';

interface QuizQuestion {
  prompt: string;
  options: Array<{ id: string; label: string; sub?: string }>;
  correctId: string;
  play: () => void;
  explanation: string;
}

const PROG_QUIZ_BANK: Array<{
  id: string;
  label: string;
  sub: string;
  level: QuizDifficulty;
  chords: Array<{ offset: number; chordId: string }>;
}> = [
  { id: 'I-IV-V-I', label: 'I – IV – V – I', sub: 'Klassische Kadenz', level: 'easy', chords: [{ offset: 0, chordId: 'maj' }, { offset: 5, chordId: 'maj' }, { offset: 7, chordId: 'maj' }, { offset: 0, chordId: 'maj' }] },
  { id: 'I-V-vi-IV', label: 'I – V – vi – IV', sub: 'Pop / Axis Progression', level: 'easy', chords: [{ offset: 0, chordId: 'maj' }, { offset: 7, chordId: 'maj' }, { offset: 9, chordId: 'min' }, { offset: 5, chordId: 'maj' }] },
  { id: 'I-vi-IV-V', label: 'I – vi – IV – V', sub: '50s Doo-Wop Kadenz', level: 'easy', chords: [{ offset: 0, chordId: 'maj' }, { offset: 9, chordId: 'min' }, { offset: 5, chordId: 'maj' }, { offset: 7, chordId: 'maj' }] },
  { id: 'ii-V-I', label: 'ii7 – V7 – Imaj7', sub: 'Jazz Standard Kadenz', level: 'medium', chords: [{ offset: 2, chordId: 'm7' }, { offset: 7, chordId: '7' }, { offset: 0, chordId: 'maj7' }, { offset: 0, chordId: 'maj7' }] },
  { id: 'vi-IV-I-V', label: 'vi – IV – I – V', sub: 'Moderne Moll-Start Pop', level: 'medium', chords: [{ offset: 9, chordId: 'min' }, { offset: 5, chordId: 'maj' }, { offset: 0, chordId: 'maj' }, { offset: 7, chordId: 'maj' }] },
  { id: 'im-bVII-bVI-V7', label: 'i – bVII – bVI – V7', sub: 'Andalusische Kadenz', level: 'medium', chords: [{ offset: 0, chordId: 'min' }, { offset: 10, chordId: 'maj' }, { offset: 8, chordId: 'maj' }, { offset: 7, chordId: '7' }] },
  { id: 'iiø-V7b9-im7', label: 'iiø7 – V7b9 – im7', sub: 'Jazz Moll ii–V–i', level: 'pro', chords: [{ offset: 2, chordId: 'm7b5' }, { offset: 7, chordId: '7b9' }, { offset: 0, chordId: 'm7' }, { offset: 0, chordId: 'm7' }] },
  { id: 'IVmaj7-iii7-ii7-Imaj7', label: 'IVmaj7 – iii7 – ii7 – Imaj7', sub: 'Neo-Soul Descent', level: 'pro', chords: [{ offset: 5, chordId: 'maj7' }, { offset: 4, chordId: 'm7' }, { offset: 2, chordId: 'm7' }, { offset: 0, chordId: 'maj7' }] },
];

export const QuizHubTool: React.FC = () => {
  const [category, setCategory] = useState<QuizCategory>('chords');
  const [direction, setDirection] = useState<DirectionMode>('up');
  const [range, setRange] = useState<RangeMode>('medium');
  const [difficulty, setDifficulty] = useState<QuizDifficulty>('medium');
  const [timbre, setTimbre] = useState<InstrumentTimbre>('piano');

  const [question, setQuestion] = useState<QuizQuestion | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [streak, setStreak] = useState(0);
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);

  const pickBaseMidi = useCallback(() => {
    if (range === 'narrow') return 55 + Math.floor(Math.random() * 10); // G3..E4
    if (range === 'medium') return 48 + Math.floor(Math.random() * 17); // C3..E4
    return 40 + Math.floor(Math.random() * 28); // E2..G4
  }, [range]);

  const buildQuestion = useCallback((): QuizQuestion => {
    const dirActual: 'up' | 'down' | 'harmonic' =
      direction === 'mixed'
        ? (['up', 'down', 'harmonic'] as const)[Math.floor(Math.random() * 3)]
        : direction;

    // 1. INTERVALS QUIZ
    if (category === 'intervals') {
      const allowed =
        difficulty === 'easy'
          ? [3, 4, 5, 7, 12]
          : difficulty === 'medium'
            ? [1, 2, 3, 4, 5, 7, 8, 9, 10, 12]
            : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
      const targetSemi = allowed[Math.floor(Math.random() * allowed.length)];
      const ivDef = INTERVALS.find(i => i.semitones === targetSemi)!;
      const baseMidi = pickBaseMidi();
      const secondMidi = dirActual === 'down' ? baseMidi - targetSemi : baseMidi + targetSemi;

      const play = () => {
        const ctx = audioEngine.getContext();
        const t = ctx.currentTime;
        if (dirActual === 'harmonic') {
          audioEngine.playNote(baseMidi, { time: t, duration: 1.5, timbre });
          audioEngine.playNote(baseMidi + targetSemi, { time: t, duration: 1.5, timbre });
        } else {
          audioEngine.playNote(baseMidi, { time: t, duration: 0.75, timbre });
          audioEngine.playNote(secondMidi, { time: t + 0.55, duration: 1.1, timbre });
        }
      };

      return {
        prompt: `Welches Intervall hörst du? (${dirActual === 'up' ? 'Aufsteigend ↑' : dirActual === 'down' ? 'Absteigend ↓' : 'Harmonisch ∥'})`,
        options: allowed.map(s => {
          const def = INTERVALS.find(i => i.semitones === s)!;
          return { id: String(s), label: def.nameDe, sub: def.short };
        }),
        correctId: String(targetSemi),
        play,
        explanation: `${ivDef.nameDe} (${ivDef.short}) • ${pcToName(baseMidi % 12)} → ${pcToName(((secondMidi % 12) + 12) % 12)}`,
      };
    }

    // 2. CHORD TYPE QUIZ
    if (category === 'chords') {
      const poolIds =
        difficulty === 'easy'
          ? ['maj', 'min', 'dim', 'aug', 'sus4']
          : difficulty === 'medium'
            ? ['maj', 'min', 'maj7', 'm7', '7', 'm7b5', 'sus4', 'dim7']
            : ['maj7', 'm7', '7', 'm7b5', 'dim7', 'mMaj7', 'maj9', 'm9', '7sharp9', '13'];
      const targetId = poolIds[Math.floor(Math.random() * poolIds.length)];
      const rootPc = Math.floor(Math.random() * 12);
      const chordDef = CHORDS.find(c => c.id === targetId)!;
      const midis = getPianoChordMidi(rootPc, targetId, range === 'narrow' ? 3 : 3 + Math.floor(Math.random() * 2) - 0);

      const play = () => {
        const ctx = audioEngine.getContext();
        const t = ctx.currentTime;
        if (dirActual === 'harmonic') {
          audioEngine.playChord(midis, { time: t, timbre, duration: 1.9, strumMs: timbre === 'guitar' ? 30 : 12 });
        } else {
          const ordered = dirActual === 'down' ? [...midis].reverse() : midis;
          ordered.forEach((m, i) => {
            audioEngine.playNote(m, { time: t + i * 0.24, duration: 1.4, timbre });
          });
        }
      };

      return {
        prompt: `Welcher Akkordtyp erklingt hier? (${dirActual === 'up' ? 'Arpeggio ↑' : dirActual === 'down' ? 'Arpeggio ↓' : 'Zusammenklang'})`,
        options: poolIds.map(id => {
          const c = CHORDS.find(x => x.id === id)!;
          return { id: c.id, label: c.name, sub: c.symbol || 'Dur' };
        }),
        correctId: targetId,
        play,
        explanation: `${pcToName(rootPc)}${chordDef.symbol} (${chordDef.name}) – Stufen: ${chordDef.degrees.join(' - ')}`,
      };
    }

    // 3. PROGRESSION RECOGNITION QUIZ
    if (category === 'progressions') {
      const pool =
        difficulty === 'easy'
          ? PROG_QUIZ_BANK.filter(p => p.level === 'easy')
          : difficulty === 'medium'
            ? PROG_QUIZ_BANK.filter(p => p.level !== 'pro')
            : PROG_QUIZ_BANK;
      const target = pool[Math.floor(Math.random() * pool.length)];
      const keyPc = [0, 2, 5, 7, 9][Math.floor(Math.random() * 5)];

      const play = () => {
        const ctx = audioEngine.getContext();
        const t0 = ctx.currentTime;
        // Play brief tonic reference first, then the progression
        target.chords.forEach((c, idx) => {
          const midis = getPianoChordMidi((keyPc + c.offset) % 12, c.chordId, 3);
          audioEngine.playChord(midis, {
            time: t0 + idx * 0.95,
            duration: 0.9,
            timbre,
            velocity: 0.78,
          });
        });
      };

      return {
        prompt: `Erkenne die Akkord-Progression (Tonart: ${pcToName(keyPc)})`,
        options: pool.map(p => ({ id: p.id, label: p.label, sub: p.sub })),
        correctId: target.id,
        play,
        explanation: `${target.label} (${target.sub}) in ${pcToName(keyPc)}`,
      };
    }

    // 4. PITCH / NOTE RECOGNITION (with Reference C4!)
    const allowedPcs = difficulty === 'easy' ? [0, 2, 4, 5, 7, 9, 11] : [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
    const targetPc = allowedPcs[Math.floor(Math.random() * allowedPcs.length)];
    const octaveShift = range === 'wide' ? (Math.floor(Math.random() * 3) - 1) * 12 : 0;
    const targetMidi = 60 + targetPc + octaveShift;

    const play = () => {
      const ctx = audioEngine.getContext();
      const t = ctx.currentTime;
      // Reference tone C4, then mystery note
      audioEngine.playNote(60, { time: t, duration: 0.65, timbre, velocity: 0.65 });
      audioEngine.playNote(targetMidi, { time: t + 0.75, duration: 1.3, timbre, velocity: 0.85 });
    };

    return {
      prompt: 'Zuerst hörst du den Referenzton C4, danach den gesuchten Ton. Welche Note ist es?',
      options: allowedPcs.map(pc => ({ id: String(pc), label: getNoteNamesArray(false)[pc] })),
      correctId: String(targetPc),
      play,
      explanation: `Gesuchte Note: ${pcToName(targetPc)} (Referenz war C4)`,
    };
  }, [category, direction, range, difficulty, timbre, pickBaseMidi]);

  const nextQuestion = useCallback(
    (autoPlay = true) => {
      const q = buildQuestion();
      setQuestion(q);
      setSelectedId(null);
      if (autoPlay) {
        window.setTimeout(() => q.play(), 120);
      }
    },
    [buildQuestion]
  );

  useEffect(() => {
    nextQuestion(false);
  }, [category, direction, range, difficulty, timbre]);

  const handleAnswer = useCallback(
    (id: string) => {
      if (!question || selectedId !== null) return;
      setSelectedId(id);
      setTotal(t => t + 1);
      if (id === question.correctId) {
        setScore(s => s + 1);
        setStreak(st => st + 1);
      } else {
        setStreak(0);
      }
    },
    [question, selectedId]
  );

  // Allow answering Pitch / Note Quiz directly via connected USB MIDI Keyboard!
  useEffect(() => {
    if (category !== 'pitch') return;
    return midiInput.subscribeNotes(evt => {
      if (evt.type === 'noteon' && selectedId === null) {
        const pc = ((evt.midi % 12) + 12) % 12;
        handleAnswer(String(pc));
      }
    });
  }, [category, selectedId, handleAnswer]);

  const accuracy = total > 0 ? Math.round((score / total) * 100) : 100;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <GraduationCap className="w-6 h-6 text-violet-400" />
            Gehörbildung &amp; Musiktheorie-Quizzes
          </h2>
          <p className="text-sm text-slate-400">
            Trainiere Intervalle, Akkordtypen, Akkord-Progressionen und Tonhöhen – mit konfigurierbarer Richtung, Tonumfang &amp; Schwierigkeit.
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-400" />
            <span className="text-slate-400">Serie:</span>
            <span className="font-black text-white">{streak}</span>
          </div>
          <div className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-emerald-400" />
            <span className="font-black text-emerald-400">{accuracy}%</span>
            <span className="text-slate-500">({score}/{total})</span>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
        {([
          { id: 'chords', label: 'Akkordtypen erkennen', icon: Layers, desc: 'Dur, Moll, 7th, Neo-Soul' },
          { id: 'intervals', label: 'Intervalle erkennen', icon: Ear, desc: 'Aufsteigend, Absteigend, Harmonisch' },
          { id: 'progressions', label: 'Progressionen erkennen', icon: Music, desc: 'ii–V–I, Pop, Andalusisch…' },
          { id: 'pitch', label: 'Pitch / Note erkennen', icon: Volume2, desc: 'Relatives Gehör ab C4' },
        ] as const).map(cat => {
          const Icon = cat.icon;
          const active = category === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                active
                  ? 'bg-violet-500/20 border-violet-400 shadow-lg shadow-violet-500/10'
                  : 'bg-slate-900/80 border-slate-800 hover:border-slate-600'
              }`}
            >
              <Icon className={`w-5 h-5 mb-1.5 ${active ? 'text-violet-300' : 'text-slate-400'}`} />
              <div className="text-sm font-bold text-white">{cat.label}</div>
              <div className="text-[11px] text-slate-400 mt-0.5">{cat.desc}</div>
            </button>
          );
        })}
      </div>

      {/* Quiz Configuration Bar */}
      <div className="studio-card rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          {(category === 'intervals' || category === 'chords') && (
            <label className="flex items-center gap-1.5 text-slate-300">
              <span className="text-slate-400">Richtung:</span>
              <select
                value={direction}
                onChange={e => setDirection(e.target.value as DirectionMode)}
                className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-semibold"
              >
                <option value="up">Aufsteigend (↑)</option>
                <option value="down">Absteigend (↓)</option>
                <option value="harmonic">Harmonisch (Gleichzeitig)</option>
                <option value="mixed">Gemischt (Zufall)</option>
              </select>
            </label>
          )}

          <label className="flex items-center gap-1.5 text-slate-300">
            <span className="text-slate-400">Umfang:</span>
            <select
              value={range}
              onChange={e => setRange(e.target.value as RangeMode)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-semibold"
            >
              <option value="narrow">Eng (1 Oktave)</option>
              <option value="medium">Mittel (1,5 Oktaven)</option>
              <option value="wide">Groß (2,5 Oktaven)</option>
            </select>
          </label>

          <label className="flex items-center gap-1.5 text-slate-300">
            <span className="text-slate-400">Stufe:</span>
            <select
              value={difficulty}
              onChange={e => setDifficulty(e.target.value as QuizDifficulty)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-semibold"
            >
              <option value="easy">Einsteiger</option>
              <option value="medium">Fortgeschritten</option>
              <option value="pro">Profi / Jazz</option>
            </select>
          </label>

          <label className="flex items-center gap-1.5 text-slate-300">
            <span className="text-slate-400">Klang:</span>
            <select
              value={timbre}
              onChange={e => setTimbre(e.target.value as InstrumentTimbre)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-semibold"
            >
              <option value="piano">Grand Piano</option>
              <option value="guitar">Clean Gitarre</option>
              <option value="epiano">Neo-Soul Rhodes</option>
              <option value="warmPad">Warm Analog Pad</option>
              <option value="strings">Orchestral Strings</option>
              <option value="organ">Warm Jazz Organ</option>
              <option value="nylon">Nylon Gitarre</option>
            </select>
          </label>
        </div>
      </div>

      {/* Active Quiz Card */}
      {question && (
        <div className="studio-card rounded-2xl p-5 sm:p-6 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="text-xs font-bold uppercase tracking-wider text-violet-400">Hörbeispiel</div>
              <h3 className="text-lg font-bold text-white">{question.prompt}</h3>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => question.play()}
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 cursor-pointer"
              >
                <Volume2 className="w-5 h-5" />
                Abspielen / Wiederholen
              </button>
              <button
                onClick={() => nextQuestion(true)}
                className="flex items-center gap-1.5 px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                Nächste Frage
              </button>
            </div>
          </div>

          {/* Options Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
            {question.options.map(opt => {
              const isChosen = selectedId === opt.id;
              const isRight = opt.id === question.correctId;
              let style = 'bg-slate-900/90 border-slate-800 hover:border-violet-400 text-white';
              if (selectedId !== null) {
                if (isRight) {
                  style = 'bg-emerald-500/25 border-emerald-400 text-emerald-200 ring-2 ring-emerald-500/40';
                } else if (isChosen && !isRight) {
                  style = 'bg-rose-500/25 border-rose-400 text-rose-200';
                } else {
                  style = 'bg-slate-950/60 border-slate-800/60 text-slate-500';
                }
              }

              return (
                <button
                  key={opt.id}
                  onClick={() => handleAnswer(opt.id)}
                  className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${style}`}
                >
                  <div className="text-sm font-bold">{opt.label}</div>
                  {opt.sub && <div className="text-[11px] opacity-75 mt-0.5">{opt.sub}</div>}
                </button>
              );
            })}
          </div>

          {/* Feedback banner */}
          {selectedId !== null && (
            <div
              className={`p-4 rounded-xl border flex flex-wrap items-center justify-between gap-3 ${
                selectedId === question.correctId
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-200'
                  : 'bg-rose-500/15 border-rose-500/40 text-rose-200'
              }`}
            >
              <div className="text-sm font-semibold">
                {selectedId === question.correctId ? '✓ Stark! ' : '✕ Leider daneben. '}
                <span className="font-bold text-white">{question.explanation}</span>
              </div>
              <button
                onClick={() => nextQuestion(true)}
                className="px-4 py-2 rounded-xl bg-white text-slate-950 font-bold text-xs cursor-pointer hover:bg-slate-200"
              >
                Weiter →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
