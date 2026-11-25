import React, { useEffect, useState } from 'react';
import { Plus, Copy, Trash2, Save, Eraser, Play, Sparkles } from 'lucide-react';
import { audioEngine } from '../audio/audioEngine';

export type NoteDuration = 1 | 2 | 4 | 8 | 16;
export type NoteTechnique = '' | 'h' | 'sl' | 'v';

export interface TabNoteCell {
  fret: number | 'x';
  tech?: NoteTechnique;
}

export interface TabBeat {
  id: string;
  duration: NoteDuration;
  // stringIdx 0 = high e (AlphaTex string 1), ..., 5 = low E (AlphaTex string 6)
  strings: Record<number, TabNoteCell>;
}

export interface TabMeasure {
  id: string;
  beats: TabBeat[];
}

export interface VisualTabDoc {
  title: string;
  tempo: number;
  instrument: number; // GM program (25 steel, 26 jazz, 27 clean, 29 overdrive)
  measures: TabMeasure[];
}

const STRING_LABELS = ['e', 'B', 'G', 'D', 'A', 'E'];
const STRING_OPEN_MIDI = [64, 59, 55, 50, 45, 40]; // high e .. low E

export function createDefaultTabDoc(): VisualTabDoc {
  const mkBeat = (dur: NoteDuration, notes: Record<number, TabNoteCell>): TabBeat => ({
    id: `b-${Math.random().toString(36).slice(2, 8)}`,
    duration: dur,
    strings: notes,
  });
  return {
    title: 'Mein eigenes Riff / Übung',
    tempo: 100,
    instrument: 27,
    measures: [
      {
        id: 'm-1',
        beats: [
          mkBeat(8, { 5: { fret: 5 } }),
          mkBeat(8, { 5: { fret: 8 } }),
          mkBeat(8, { 4: { fret: 5 } }),
          mkBeat(8, { 4: { fret: 7 } }),
          mkBeat(8, { 3: { fret: 5 } }),
          mkBeat(8, { 3: { fret: 7 } }),
          mkBeat(8, { 2: { fret: 5 } }),
          mkBeat(8, { 2: { fret: 7 } }),
        ],
      },
      {
        id: 'm-2',
        beats: [
          mkBeat(8, { 1: { fret: 5 } }),
          mkBeat(8, { 1: { fret: 8 } }),
          mkBeat(8, { 0: { fret: 5 } }),
          mkBeat(8, { 0: { fret: 8 } }),
          mkBeat(4, { 5: { fret: 5 }, 3: { fret: 5 }, 2: { fret: 5 }, 1: { fret: 5 } }),
          mkBeat(4, {}),
        ],
      },
    ],
  };
}

/**
 * Compiles VisualTabDoc cleanly into 100% valid AlphaTex syntax!
 */
export function compileVisualTabToAlphaTex(doc: VisualTabDoc): string {
  const safeTitle = (doc.title || 'Eigener Tab').replace(/"/g, "'");
  const lines: string[] = [
    `\\title "${safeTitle}"`,
    `\\tempo ${Math.max(40, Math.min(260, doc.tempo))}`,
    '.',
    '\\track "Guitar"',
    '\\staff {score tabs}',
    `\\instrument ${doc.instrument}`,
  ];

  const barStrings = doc.measures.map(m => {
    const beatTokens = m.beats.map(b => {
      const entries = Object.entries(b.strings)
        .map(([sIdx, cell]) => ({ alphaStr: Number(sIdx) + 1, cell }))
        .sort((a, b2) => b2.alphaStr - a.alphaStr);

      if (entries.length === 0) {
        return `r.${b.duration}`;
      }

      const formatCell = (alphaStr: number, cell: TabNoteCell) => {
        const fretStr = cell.fret === 'x' ? 'x' : String(cell.fret);
        const eff = cell.tech ? `{${cell.tech}}` : '';
        return `${fretStr}.${alphaStr}${eff}`;
      };

      if (entries.length === 1) {
        const { alphaStr, cell } = entries[0];
        const fretStr = cell.fret === 'x' ? 'x' : String(cell.fret);
        const eff = cell.tech ? `{${cell.tech}}` : '';
        return `${fretStr}.${alphaStr}.${b.duration}${eff}`;
      }

      const inner = entries.map(e => formatCell(e.alphaStr, e.cell)).join(' ');
      return `(${inner}).${b.duration}`;
    });
    return beatTokens.join(' ');
  });

  lines.push(barStrings.join(' |\n'));
  return lines.join('\n');
}

interface VisualTabEditorProps {
  onApplyAlphaTex: (title: string, tex: string) => void;
  onSaveAsExercise?: (title: string, tex: string, tempo: number) => void;
}

export const VisualTabEditor: React.FC<VisualTabEditorProps> = ({
  onApplyAlphaTex,
  onSaveAsExercise,
}) => {
  const [doc, setDoc] = useState<VisualTabDoc>(() => createDefaultTabDoc());
  const [cursor, setCursor] = useState<{ mIdx: number; bIdx: number; sIdx: number }>({
    mIdx: 0,
    bIdx: 0,
    sIdx: 5,
  });
  const [lastDigitTime, setLastDigitTime] = useState<number>(0);

  // Sync to AlphaTab viewer whenever doc changes
  useEffect(() => {
    const tex = compileVisualTabToAlphaTex(doc);
    onApplyAlphaTex(doc.title, tex);
  }, [doc]);

  const currentMeasure = doc.measures[cursor.mIdx] ?? doc.measures[0];
  const currentBeat = currentMeasure?.beats[cursor.bIdx] ?? currentMeasure?.beats[0];
  const currentCell = currentBeat?.strings[cursor.sIdx];

  const setCellFret = (fret: number | 'x' | null, tech?: NoteTechnique) => {
    setDoc(prev => {
      const measures = prev.measures.map((m, mi) => {
        if (mi !== cursor.mIdx) return m;
        const beats = m.beats.map((b, bi) => {
          if (bi !== cursor.bIdx) return b;
          const nextStrings = { ...b.strings };
          if (fret === null) {
            delete nextStrings[cursor.sIdx];
          } else {
            nextStrings[cursor.sIdx] = {
              fret,
              tech: tech !== undefined ? tech : nextStrings[cursor.sIdx]?.tech ?? '',
            };
          }
          return { ...b, strings: nextStrings };
        });
        return { ...m, beats };
      });
      return { ...prev, measures };
    });

    if (typeof fret === 'number') {
      const midi = STRING_OPEN_MIDI[cursor.sIdx] + fret;
      audioEngine.playNote(midi, { timbre: 'guitar', duration: 0.65, velocity: 0.72 });
    }
  };

  const setBeatDuration = (dur: NoteDuration) => {
    setDoc(prev => ({
      ...prev,
      measures: prev.measures.map((m, mi) =>
        mi !== cursor.mIdx
          ? m
          : {
              ...m,
              beats: m.beats.map((b, bi) => (bi !== cursor.bIdx ? b : { ...b, duration: dur })),
            }
      ),
    }));
  };

  const setCellTech = (tech: NoteTechnique) => {
    if (!currentCell) return;
    setCellFret(currentCell.fret, currentCell.tech === tech ? '' : tech);
  };

  const addBeatToCurrentMeasure = () => {
    setDoc(prev => ({
      ...prev,
      measures: prev.measures.map((m, mi) =>
        mi !== cursor.mIdx
          ? m
          : {
              ...m,
              beats: [
                ...m.beats,
                { id: `b-${Date.now()}-${Math.random()}`, duration: currentBeat?.duration ?? 8, strings: {} },
              ],
            }
      ),
    }));
  };

  const removeCurrentBeat = () => {
    if (!currentMeasure || currentMeasure.beats.length <= 1) return;
    setDoc(prev => ({
      ...prev,
      measures: prev.measures.map((m, mi) =>
        mi !== cursor.mIdx ? m : { ...m, beats: m.beats.filter((_, bi) => bi !== cursor.bIdx) }
      ),
    }));
    setCursor(c => ({ ...c, bIdx: Math.max(0, c.bIdx - 1) }));
  };

  const addMeasure = (duplicate = false) => {
    setDoc(prev => {
      const src = prev.measures[cursor.mIdx];
      const newM: TabMeasure = duplicate && src
        ? {
            id: `m-${Date.now()}`,
            beats: src.beats.map(b => ({
              id: `b-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
              duration: b.duration,
              strings: JSON.parse(JSON.stringify(b.strings)),
            })),
          }
        : {
            id: `m-${Date.now()}`,
            beats: Array.from({ length: 8 }, () => ({
              id: `b-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
              duration: 8 as NoteDuration,
              strings: {},
            })),
          };
      return { ...prev, measures: [...prev.measures, newM] };
    });
    setCursor(c => ({ ...c, mIdx: doc.measures.length, bIdx: 0 }));
  };

  const deleteMeasure = () => {
    if (doc.measures.length <= 1) return;
    setDoc(prev => ({
      ...prev,
      measures: prev.measures.filter((_, mi) => mi !== cursor.mIdx),
    }));
    setCursor(c => ({ ...c, mIdx: Math.max(0, c.mIdx - 1), bIdx: 0 }));
  };

  // Guitar-Pro-style Keyboard Navigation & 2-Digit Fret Entry inside the Grid!
  const handleGridKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setCursor(c => ({ ...c, sIdx: Math.max(0, c.sIdx - 1) }));
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setCursor(c => ({ ...c, sIdx: Math.min(5, c.sIdx + 1) }));
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      setCursor(c => {
        const m = doc.measures[c.mIdx];
        if (c.bIdx + 1 < m.beats.length) return { ...c, bIdx: c.bIdx + 1 };
        if (c.mIdx + 1 < doc.measures.length) return { ...c, mIdx: c.mIdx + 1, bIdx: 0 };
        return c;
      });
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      setCursor(c => {
        if (c.bIdx > 0) return { ...c, bIdx: c.bIdx - 1 };
        if (c.mIdx > 0) {
          const prevM = doc.measures[c.mIdx - 1];
          return { ...c, mIdx: c.mIdx - 1, bIdx: prevM.beats.length - 1 };
        }
        return c;
      });
    } else if (e.key === 'Backspace' || e.key === 'Delete') {
      e.preventDefault();
      setCellFret(null);
    } else if (e.key.toLowerCase() === 'x') {
      e.preventDefault();
      setCellFret('x');
    } else if (/^[0-9]$/.test(e.key)) {
      e.preventDefault();
      const digit = Number(e.key);
      const now = Date.now();
      const prevFret = currentCell?.fret;
      // Support typing 2-digit frets (e.g., 1 then 2 -> 12) within 650ms!
      if (typeof prevFret === 'number' && prevFret >= 1 && prevFret <= 2 && now - lastDigitTime < 650) {
        const combined = prevFret * 10 + digit;
        if (combined <= 24) {
          setCellFret(combined);
          setLastDigitTime(0);
          return;
        }
      }
      setCellFret(digit);
      setLastDigitTime(now);
    }
  };

  return (
    <div className="studio-card rounded-2xl p-4 space-y-3.5 border-cyan-500/35">
      {/* Header Row: Title, BPM, Instrument & Save */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 text-xs">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="font-bold text-white">Visueller Tab-Editor</span>
          <input
            type="text"
            value={doc.title}
            onChange={e => setDoc(d => ({ ...d, title: e.target.value }))}
            className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-semibold min-w-[180px]"
            placeholder="Titel deiner Übung..."
          />
          <label className="flex items-center gap-1.5 text-slate-300">
            BPM:
            <input
              type="number"
              min={40}
              max={240}
              value={doc.tempo}
              onChange={e => setDoc(d => ({ ...d, tempo: Number(e.target.value) || 100 }))}
              className="w-16 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-amber-300 font-bold"
            />
          </label>
          <select
            value={doc.instrument}
            onChange={e => setDoc(d => ({ ...d, instrument: Number(e.target.value) }))}
            className="bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-slate-200"
          >
            <option value={27}>Clean E-Gitarre</option>
            <option value={26}>Jazz Archtop</option>
            <option value={25}>Steel Akustik</option>
            <option value={24}>Nylon Klassik</option>
            <option value={29}>Overdrive Lead</option>
          </select>
        </div>

        {onSaveAsExercise && (
          <button
            onClick={() => onSaveAsExercise(doc.title, compileVisualTabToAlphaTex(doc), doc.tempo)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" /> In Meine Übungen speichern
          </button>
        )}
      </div>

      {/* Toolbar: Note Duration, Techniques & Measure Actions */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-slate-400 font-semibold mr-1">Notenwert:</span>
          {([
            { dur: 1, label: '1/1' },
            { dur: 2, label: '1/2' },
            { dur: 4, label: '1/4' },
            { dur: 8, label: '1/8' },
            { dur: 16, label: '1/16' },
          ] as const).map(item => (
            <button
              key={item.dur}
              onClick={() => setBeatDuration(item.dur)}
              className={`px-2 py-1 rounded-lg font-bold border cursor-pointer ${
                currentBeat?.duration === item.dur
                  ? 'bg-amber-500 text-slate-950 border-amber-400'
                  : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-600'
              }`}
            >
              {item.label}
            </button>
          ))}

          <span className="text-slate-600 mx-1">|</span>
          <span className="text-slate-400 font-semibold">Technik:</span>
          {([
            { t: 'h', label: 'H/P' },
            { t: 'sl', label: 'Slide' },
            { t: 'v', label: 'Vibrato' },
          ] as const).map(item => (
            <button
              key={item.t}
              onClick={() => setCellTech(item.t)}
              className={`px-2 py-1 rounded-lg font-bold border cursor-pointer ${
                currentCell?.tech === item.t
                  ? 'bg-cyan-500/25 border-cyan-400 text-cyan-200'
                  : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-600'
              }`}
            >
              {item.label}
            </button>
          ))}
          <button
            onClick={() => setCellFret('x')}
            className="px-2 py-1 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-600 text-slate-300 font-bold cursor-pointer"
          >
            ✕ Dead
          </button>
          <button
            onClick={() => setCellFret(null)}
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 font-bold cursor-pointer"
          >
            <Eraser className="w-3 h-3" /> Leer
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={addBeatToCurrentMeasure}
            className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold cursor-pointer"
          >
            + Beat
          </button>
          <button
            onClick={removeCurrentBeat}
            className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-rose-300 font-semibold cursor-pointer"
          >
            - Beat
          </button>
          <button
            onClick={() => addMeasure(false)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 font-bold cursor-pointer"
          >
            <Plus className="w-3 h-3" /> Takt
          </button>
          <button
            onClick={() => addMeasure(true)}
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold cursor-pointer"
            title="Aktuellen Takt duplizieren"
          >
            <Copy className="w-3 h-3" /> Dupl.
          </button>
          {doc.measures.length > 1 && (
            <button
              onClick={deleteMeasure}
              className="p-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 cursor-pointer"
              title="Aktuellen Takt löschen"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Interactive 6-String Tablature Grid (Keyboard + Click!) */}
      <div
        tabIndex={0}
        onKeyDown={handleGridKeyDown}
        className="overflow-x-auto pb-2 focus:outline-none focus:ring-2 focus:ring-amber-500/40 rounded-xl bg-slate-950/90 border border-slate-800 p-3"
      >
        <div className="text-[11px] text-slate-400 mb-2 flex items-center justify-between">
          <span>
            Klicke eine Position und tippe Bünde (<strong className="text-amber-300">0–24</strong>, <strong className="text-amber-300">x</strong>, <strong className="text-amber-300">Entf</strong>) oder nutze Pfeiltasten ← ↑ ↓ →
          </span>
          <span className="font-mono text-cyan-300">
            Takt {cursor.mIdx + 1} • Beat {cursor.bIdx + 1} • Saite {STRING_LABELS[cursor.sIdx]}
          </span>
        </div>

        <div className="flex items-stretch gap-3 min-w-max">
          {doc.measures.map((measure, mIdx) => (
            <div
              key={measure.id}
              className={`rounded-xl border p-2 transition-colors ${
                cursor.mIdx === mIdx ? 'border-amber-500/50 bg-slate-900/70' : 'border-slate-800 bg-slate-900/35'
              }`}
            >
              <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 mb-1.5 px-1">
                <span>Takt {mIdx + 1}</span>
                <span>{measure.beats.length} Beats</span>
              </div>

              <div className="space-y-1">
                {/* Duration header per beat */}
                <div className="flex items-center gap-1 pl-6">
                  {measure.beats.map((b, bIdx) => (
                    <div
                      key={b.id}
                      onClick={() => setCursor({ mIdx, bIdx, sIdx: cursor.sIdx })}
                      className={`w-9 text-center text-[9px] font-mono rounded py-0.5 cursor-pointer ${
                        cursor.mIdx === mIdx && cursor.bIdx === bIdx
                          ? 'bg-amber-500/25 text-amber-300 font-bold'
                          : 'text-slate-500'
                      }`}
                    >
                      1/{b.duration}
                    </div>
                  ))}
                </div>

                {/* 6 Strings */}
                {STRING_LABELS.map((sLbl, sIdx) => (
                  <div key={sLbl} className="flex items-center gap-1">
                    <span className="w-5 text-[11px] font-mono font-bold text-slate-400 text-center">
                      {sLbl}
                    </span>
                    {measure.beats.map((beat, bIdx) => {
                      const cell = beat.strings[sIdx];
                      const isSel = cursor.mIdx === mIdx && cursor.bIdx === bIdx && cursor.sIdx === sIdx;
                      return (
                        <button
                          key={`${beat.id}-${sIdx}`}
                          type="button"
                          onClick={() => setCursor({ mIdx, bIdx, sIdx })}
                          className={`relative w-9 h-7 rounded-md font-mono text-xs font-bold flex items-center justify-center cursor-pointer transition-all ${
                            isSel
                              ? 'bg-amber-500 text-slate-950 ring-2 ring-amber-200 scale-105 z-10'
                              : cell
                                ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-500/40 hover:bg-cyan-500/30'
                                : 'bg-slate-950/60 text-slate-600 hover:bg-slate-800/80 border border-slate-800/50'
                          }`}
                        >
                          {/* Horizontal string line behind empty cells */}
                          {!cell && !isSel && (
                            <span className="w-full h-[1px] bg-slate-700/70 absolute left-0 top-1/2" />
                          )}
                          {cell && (
                            <span>
                              {cell.fret}
                              {cell.tech ? <sup className="text-[8px] ml-0.5">{cell.tech}</sup> : null}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Tap Fret Pad (great for mouse / tablet / touch!) */}
      <div className="flex flex-wrap items-center gap-1 text-xs">
        <span className="text-slate-400 font-semibold mr-1">Schnell-Bund:</span>
        {Array.from({ length: 16 }, (_, f) => (
          <button
            key={f}
            onClick={() => setCellFret(f)}
            className={`w-7 h-7 rounded-lg font-mono font-bold border cursor-pointer ${
              currentCell?.fret === f
                ? 'bg-amber-500 text-slate-950 border-amber-300'
                : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-200'
            }`}
          >
            {f}
          </button>
        ))}
        <button
          onClick={() => {
            const notes = Object.entries(currentBeat?.strings ?? {})
              .filter(([, c]) => typeof c.fret === 'number')
              .map(([s, c]) => STRING_OPEN_MIDI[Number(s)] + (c.fret as number));
            if (notes.length) audioEngine.playChord(notes, { timbre: 'guitar' });
          }}
          className="ml-auto flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold cursor-pointer"
        >
          <Play className="w-3 h-3 fill-current" /> Beat vorhören
        </button>
      </div>
    </div>
  );
};
