import React, { useCallback, useEffect, useState } from 'react';
import { Crosshair, Flame, Trophy, Volume2, RotateCcw, Timer } from 'lucide-react';
import { GUITAR_TUNINGS, getNoteNamesArray, pcToName } from '../theory/musicTheory';
import { FretboardSVG } from '../components/FretboardSVG';
import { audioEngine } from '../audio/audioEngine';

const NATURAL_PCS = new Set([0, 2, 4, 5, 7, 9, 11]);

interface TargetSpot {
  stringIdx: number;
  fret: number;
  midi: number;
  pc: number;
}

export const FretboardTrainerTool: React.FC = () => {
  const tuning = GUITAR_TUNINGS[0];
  const [mode, setMode] = useState<'identify' | 'locate'>('identify');
  const [maxFret, setMaxFret] = useState<number>(12);
  const [naturalsOnly, setNaturalsOnly] = useState<boolean>(false);
  const [enabledStrings, setEnabledStrings] = useState<boolean[]>([true, true, true, true, true, true]);
  const [playAudioOnNew, setPlayAudioOnNew] = useState<boolean>(true);

  const [target, setTarget] = useState<TargetSpot>({ stringIdx: 0, fret: 5, midi: 45, pc: 9 });
  const [status, setStatus] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [revealedLabel, setRevealedLabel] = useState<string | undefined>(undefined);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [questionStartMs, setQuestionStartMs] = useState(Date.now());
  const [avgReactionMs, setAvgReactionMs] = useState<number>(0);

  // Optional 60s Sprint timer
  const [sprintRunning, setSprintRunning] = useState(false);
  const [sprintSecondsLeft, setSprintSecondsLeft] = useState(60);

  const pickNextTarget = useCallback(
    (avoid?: TargetSpot) => {
      const activeStringIndices = enabledStrings
        .map((on, idx) => (on ? idx : -1))
        .filter(idx => idx >= 0);
      const stringPool = activeStringIndices.length > 0 ? activeStringIndices : [0, 1, 2, 3, 4, 5];

      for (let attempt = 0; attempt < 40; attempt++) {
        const sIdx = stringPool[Math.floor(Math.random() * stringPool.length)];
        const fret = Math.floor(Math.random() * (maxFret + 1));
        const midi = tuning.midiNotes[sIdx] + fret;
        const pc = midi % 12;
        if (naturalsOnly && !NATURAL_PCS.has(pc)) continue;
        if (avoid && avoid.stringIdx === sIdx && avoid.fret === fret) continue;

        const next: TargetSpot = { stringIdx: sIdx, fret, midi, pc };
        setTarget(next);
        setStatus('idle');
        setRevealedLabel(undefined);
        setQuestionStartMs(Date.now());
        if (playAudioOnNew && mode === 'identify') {
          audioEngine.playNote(midi, { timbre: 'guitar', duration: 1.1 });
        }
        return;
      }
    },
    [enabledStrings, maxFret, naturalsOnly, tuning.midiNotes, playAudioOnNew, mode]
  );

  useEffect(() => {
    pickNextTarget();
  }, [maxFret, naturalsOnly, mode]);

  useEffect(() => {
    if (!sprintRunning) return;
    const id = window.setInterval(() => {
      setSprintSecondsLeft(prev => {
        if (prev <= 1) {
          setSprintRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [sprintRunning]);

  const recordResult = (isCorrect: boolean) => {
    const reaction = Date.now() - questionStartMs;
    setTotalCount(c => c + 1);
    if (isCorrect) {
      setCorrectCount(c => {
        const nextCorrect = c + 1;
        setAvgReactionMs(prev => (prev === 0 ? reaction : Math.round((prev * c + reaction) / nextCorrect)));
        return nextCorrect;
      });
      setStreak(s => {
        const ns = s + 1;
        setBestStreak(b => Math.max(b, ns));
        return ns;
      });
      setStatus('correct');
      setRevealedLabel(pcToName(target.pc));
      audioEngine.playNote(target.midi, { timbre: 'guitar', duration: 0.9 });
      window.setTimeout(() => pickNextTarget(target), 650);
    } else {
      setStreak(0);
      setStatus('wrong');
      setRevealedLabel(pcToName(target.pc));
      window.setTimeout(() => {
        setStatus('idle');
        setRevealedLabel(undefined);
      }, 950);
    }
  };

  const handleNoteGuess = (pc: number) => {
    if (status === 'correct') return;
    recordResult(pc === target.pc);
  };

  const handleLocateClick = (sIdx: number, fret: number, midi: number) => {
    if (mode !== 'locate' || status === 'correct') return;
    const isCorrect = sIdx === target.stringIdx && midi % 12 === target.pc && fret <= maxFret;
    recordResult(isCorrect);
  };

  const startSprint = () => {
    setCorrectCount(0);
    setTotalCount(0);
    setStreak(0);
    setAvgReactionMs(0);
    setSprintSecondsLeft(60);
    setSprintRunning(true);
    pickNextTarget();
  };

  const accuracy = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 100;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Crosshair className="w-6 h-6 text-amber-400" />
            Fretboard Trainer
          </h2>
          <p className="text-sm text-slate-400">
            Trainiere sofortige Griffbrett-Orientierung: Noten auf dem Griffbrett blitzschnell erkennen oder selbst finden.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-slate-900 border border-slate-800 rounded-xl p-0.5 text-xs">
            <button
              onClick={() => setMode('identify')}
              className={`px-3 py-2 rounded-lg font-bold cursor-pointer ${
                mode === 'identify' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              Note erraten
            </button>
            <button
              onClick={() => setMode('locate')}
              className={`px-3 py-2 rounded-lg font-bold cursor-pointer ${
                mode === 'locate' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              Auf Griffbrett finden
            </button>
          </div>

          <button
            onClick={startSprint}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-200 text-xs font-bold cursor-pointer"
          >
            <Timer className="w-4 h-4" />
            {sprintRunning ? `Sprint: ${sprintSecondsLeft}s` : '60s Sprint'}
          </button>
        </div>
      </div>

      {/* Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="studio-card rounded-2xl p-3.5 flex items-center gap-3">
          <Flame className="w-5 h-5 text-amber-400" />
          <div>
            <div className="text-[11px] text-slate-400">Serie / Best</div>
            <div className="text-lg font-black text-white">
              {streak} <span className="text-xs font-semibold text-slate-500">/ {bestStreak}</span>
            </div>
          </div>
        </div>
        <div className="studio-card rounded-2xl p-3.5 flex items-center gap-3">
          <Trophy className="w-5 h-5 text-emerald-400" />
          <div>
            <div className="text-[11px] text-slate-400">Genauigkeit</div>
            <div className="text-lg font-black text-emerald-400">
              {accuracy}% <span className="text-xs font-semibold text-slate-500">({correctCount}/{totalCount})</span>
            </div>
          </div>
        </div>
        <div className="studio-card rounded-2xl p-3.5">
          <div className="text-[11px] text-slate-400">Ø Reaktionszeit</div>
          <div className="text-lg font-black text-cyan-300 font-mono">
            {avgReactionMs > 0 ? `${(avgReactionMs / 1000).toFixed(2)}s` : '--'}
          </div>
        </div>
        <div className="studio-card rounded-2xl p-3.5 flex items-center justify-between">
          <div>
            <div className="text-[11px] text-slate-400">Ton abspielen</div>
            <button
              onClick={() => audioEngine.playNote(target.midi, { timbre: 'guitar' })}
              className="mt-0.5 flex items-center gap-1 text-xs font-bold text-amber-400 hover:text-amber-300 cursor-pointer"
            >
              <Volume2 className="w-4 h-4" /> Nochmal hören
            </button>
          </div>
          <button
            onClick={() => {
              setCorrectCount(0);
              setTotalCount(0);
              setStreak(0);
              setAvgReactionMs(0);
            }}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 cursor-pointer"
            title="Statistik zurücksetzen"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Prompt & Fretboard */}
      <div className="studio-card rounded-2xl p-4 sm:p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          {mode === 'identify' ? (
            <div className="text-sm font-bold text-white">
              Welche Note liegt auf{' '}
              <span className="text-amber-400">
                Saite {6 - target.stringIdx} ({tuning.labels[target.stringIdx].replace(/\d/, '')})
              </span>{' '}
              im <span className="text-cyan-400">{target.fret}. Bund</span>?
            </div>
          ) : (
            <div className="text-sm font-bold text-white">
              Klicke die Note <span className="text-2xl font-black text-amber-400 mx-1">{pcToName(target.pc)}</span> auf{' '}
              <span className="text-cyan-400">
                Saite {6 - target.stringIdx} ({tuning.labels[target.stringIdx].replace(/\d/, '')}-Saite)
              </span>{' '}
              (Bund 0–{maxFret})!
            </div>
          )}

          {status === 'correct' && (
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold">
              ✓ Richtig! ({pcToName(target.pc)})
            </span>
          )}
          {status === 'wrong' && (
            <span className="px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-bold">
              ✕ Nicht ganz – gesucht war {pcToName(target.pc)}
            </span>
          )}
        </div>

        <FretboardSVG
          tuning={tuning}
          numFrets={15}
          dots={[]}
          labelMode="none"
          highlightWindow={{ minFret: 0, maxFret }}
          mysteryDot={
            mode === 'identify'
              ? { stringIdx: target.stringIdx, fret: target.fret, revealedLabel, status }
              : status !== 'idle'
                ? { stringIdx: target.stringIdx, fret: target.fret, revealedLabel: pcToName(target.pc), status }
                : null
          }
          onFretClick={handleLocateClick}
        />

        {/* Answer Note Buttons (for Identify Mode) */}
        {mode === 'identify' && (
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-12 gap-2 pt-2">
            {getNoteNamesArray(false).map((name, pc) => {
              const disabled = naturalsOnly && !NATURAL_PCS.has(pc);
              return (
                <button
                  key={pc}
                  disabled={disabled}
                  onClick={() => handleNoteGuess(pc)}
                  className={`py-3 rounded-xl font-black text-sm border transition-all cursor-pointer disabled:opacity-20 disabled:cursor-not-allowed ${
                    status === 'correct' && target.pc === pc
                      ? 'bg-emerald-500 border-emerald-300 text-slate-950 scale-105'
                      : 'bg-slate-900 hover:bg-amber-500 hover:text-slate-950 border-slate-700 text-white'
                  }`}
                >
                  {name}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="studio-card rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-slate-400 font-semibold">Aktive Saiten:</span>
          {tuning.labels.map((lbl, idx) => (
            <button
              key={idx}
              onClick={() =>
                setEnabledStrings(prev => {
                  const next = [...prev];
                  next[idx] = !next[idx];
                  return next.some(Boolean) ? next : prev;
                })
              }
              className={`px-2.5 py-1.5 rounded-lg font-bold border cursor-pointer ${
                enabledStrings[idx]
                  ? 'bg-amber-500/20 border-amber-500 text-amber-200'
                  : 'bg-slate-900 border-slate-800 text-slate-500'
              }`}
            >
              {lbl.replace(/\d/, '')}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2 text-slate-300">
            Bund-Umfang: <span className="font-bold text-cyan-300">0–{maxFret}</span>
            <input
              type="range"
              min={5}
              max={15}
              value={maxFret}
              onChange={e => setMaxFret(Number(e.target.value))}
              className="w-24 accent-cyan-400"
            />
          </label>
          <label className="flex items-center gap-1.5 text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={naturalsOnly}
              onChange={e => setNaturalsOnly(e.target.checked)}
              className="accent-amber-500"
            />
            Nur Stammtöne (C–B)
          </label>
          <label className="flex items-center gap-1.5 text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={playAudioOnNew}
              onChange={e => setPlayAudioOnNew(e.target.checked)}
              className="accent-amber-500"
            />
            Ton vorspielen
          </label>
        </div>
      </div>
    </div>
  );
};
