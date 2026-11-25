import React, { useMemo, useRef, useState } from 'react';
import { Compass, Play, Square, Plus, Trash2, ArrowRight, Volume2, Sparkles } from 'lucide-react';
import {
  CIRCLE_OF_FIFTHS,
  DiatonicChordInfo,
  getDiatonicChords,
  getSecondaryDominants,
  getVoiceLedChordMidi,
  formatChordName,
  FLAT_KEYS,
  pcToName,
} from '../theory/musicTheory';
import { audioEngine, InstrumentTimbre } from '../audio/audioEngine';
import { KeySignatureSVG } from '../components/ClassicalStaffSVG';

export interface SongwritingChord {
  id: string;
  rootPc: number;
  chordId: string;
  roman: string;
}

interface CircleOfFifthsToolProps {
  onSendToProgression?: (chords: Array<{ rootPc: number; chordId: string; beats: number }>, keyPc: number) => void;
}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function describeRingSlice(
  cx: number,
  cy: number,
  rInner: number,
  rOuter: number,
  startDeg: number,
  endDeg: number
): string {
  const p1 = polarToCartesian(cx, cy, rOuter, startDeg);
  const p2 = polarToCartesian(cx, cy, rOuter, endDeg);
  const p3 = polarToCartesian(cx, cy, rInner, endDeg);
  const p4 = polarToCartesian(cx, cy, rInner, startDeg);
  return [
    `M ${p1.x} ${p1.y}`,
    `A ${rOuter} ${rOuter} 0 0 1 ${p2.x} ${p2.y}`,
    `L ${p3.x} ${p3.y}`,
    `A ${rInner} ${rInner} 0 0 0 ${p4.x} ${p4.y}`,
    'Z',
  ].join(' ');
}

export const CircleOfFifthsTool: React.FC<CircleOfFifthsToolProps> = ({ onSendToProgression }) => {
  const [selectedKeyIdx, setSelectedKeyIdx] = useState(0); // 0 = C major
  const [useSevenths, setUseSevenths] = useState(true);
  const [showSecondary, setShowSecondary] = useState(true);
  const [timbre, setTimbre] = useState<InstrumentTimbre>('piano');
  const [addOnClick, setAddOnClick] = useState(true);
  const [progression, setProgression] = useState<SongwritingChord[]>([
    { id: 'sw-1', rootPc: 0, chordId: 'maj7', roman: 'Imaj7' },
    { id: 'sw-2', rootPc: 9, chordId: 'm7', roman: 'vim7' },
    { id: 'sw-3', rootPc: 2, chordId: 'm7', roman: 'iim7' },
    { id: 'sw-4', rootPc: 7, chordId: '7', roman: 'V7' },
  ]);
  const [isPlayingSeq, setIsPlayingSeq] = useState(false);
  const [playingIdx, setPlayingIdx] = useState(-1);
  const timerRef = useRef<number | null>(null);
  const prevVoicesRef = useRef<number[] | null>(null);

  const selectedKey = CIRCLE_OF_FIFTHS[selectedKeyIdx];
  const diatonic = useMemo(() => getDiatonicChords(selectedKeyIdx), [selectedKeyIdx]);
  const secondaryPairs = useMemo(() => getSecondaryDominants(selectedKeyIdx), [selectedKeyIdx]);

  // Quick lookup for Secondary Dominant badges on outer circle
  const secVByCircleIdx = useMemo(() => {
    const map = new Map<number, string>();
    secondaryPairs.forEach(p => {
      if (!map.has(p.secVCircleIdx)) map.set(p.secVCircleIdx, p.secVRoman);
    });
    return map;
  }, [secondaryPairs]);

  // Quick lookup for Roman numeral overlay inside wheel wedges
  const outerDegreeByCircleIdx = useMemo(() => {
    const map = new Map<number, DiatonicChordInfo>();
    diatonic.filter(d => d.ring === 'outer').forEach(d => map.set(d.circleIndex, d));
    return map;
  }, [diatonic]);

  const innerDegreeByCircleIdx = useMemo(() => {
    const map = new Map<number, DiatonicChordInfo>();
    diatonic.filter(d => d.ring === 'inner').forEach(d => map.set(d.circleIndex, d));
    return map;
  }, [diatonic]);

  const dimChord = diatonic.find(d => d.ring === 'dim');

  const playCustomChord = (rootPc: number, chordId: string, roman: string, forceAdd = false) => {
    const voiced = getVoiceLedChordMidi(rootPc, chordId, prevVoicesRef.current);
    prevVoicesRef.current = voiced.upperVoices;
    audioEngine.playChord(voiced.allNotes, { timbre, duration: 1.6 });
    if (addOnClick || forceAdd) {
      setProgression(prev => [
        ...prev,
        {
          id: `sw-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          rootPc,
          chordId,
          roman,
        },
      ]);
    }
  };

  const playAndMaybeAdd = (info: DiatonicChordInfo, forceAdd = false) => {
    const chordId = useSevenths ? info.seventhId : info.triadId;
    const roman = useSevenths ? info.romanSeventh : info.romanTriad;
    playCustomChord(info.rootPc, chordId, roman, forceAdd);
  };

  const togglePlayProgression = () => {
    if (isPlayingSeq) {
      if (timerRef.current !== null) window.clearInterval(timerRef.current);
      timerRef.current = null;
      setIsPlayingSeq(false);
      setPlayingIdx(-1);
      prevVoicesRef.current = null;
      return;
    }
    if (progression.length === 0) return;

    setIsPlayingSeq(true);
    prevVoicesRef.current = null;
    let idx = 0;
    const playStep = () => {
      const c = progression[idx];
      if (!c) return;
      setPlayingIdx(idx);
      const voiced = getVoiceLedChordMidi(c.rootPc, c.chordId, prevVoicesRef.current);
      prevVoicesRef.current = voiced.upperVoices;
      audioEngine.playChord(voiced.allNotes, { timbre, duration: 1.4 });
      idx = (idx + 1) % progression.length;
    };
    playStep();
    timerRef.current = window.setInterval(playStep, 1250);
  };

  const cx = 240;
  const cy = 240;

  // Signed accidental count for KeySignatureSVG (-6..0..+6): C=0, G=+1..B=+5, Gb=-6, Db=-5..F=-1
  const keyAccidentalCount = (idx: number) => (idx <= 5 ? idx : idx === 6 ? -6 : idx - 12);

  // Localized display name for a circle entry (respects DE H/B vs Intl B/Bb!)
  const circleMajorLabel = (idx: number) => {
    const e = CIRCLE_OF_FIFTHS[idx];
    return pcToName(e.majorPc, idx >= 6);
  };
  const circleMinorLabel = (idx: number) => {
    const e = CIRCLE_OF_FIFTHS[idx];
    return `${pcToName(e.minorPc, idx >= 6)}m`;
  };

  // Symmetrical Quick Key Bar: ♭-keys left (6♭..1♭) -> C CENTER (0) -> ♯-keys right (1♯..6♯)
  const symmetricKeyOrder: Array<{ idx: number; accLabel: string; isSharpSide: boolean }> = [
    { idx: 6, accLabel: '6♭', isSharpSide: false }, // Gb
    { idx: 7, accLabel: '5♭', isSharpSide: false }, // Db
    { idx: 8, accLabel: '4♭', isSharpSide: false }, // Ab
    { idx: 9, accLabel: '3♭', isSharpSide: false }, // Eb
    { idx: 10, accLabel: '2♭', isSharpSide: false }, // Bb / B
    { idx: 11, accLabel: '1♭', isSharpSide: false }, // F
    { idx: 0, accLabel: '0', isSharpSide: false },   // C (CENTER!)
    { idx: 1, accLabel: '1♯', isSharpSide: true },   // G
    { idx: 2, accLabel: '2♯', isSharpSide: true },   // D
    { idx: 3, accLabel: '3♯', isSharpSide: true },   // A
    { idx: 4, accLabel: '4♯', isSharpSide: true },   // E
    { idx: 5, accLabel: '5♯', isSharpSide: true },   // B / H
    { idx: 6, accLabel: '6♯', isSharpSide: true },   // F#
  ];
  const [preferSharpTritone, setPreferSharpTritone] = useState(false);
  const currentAccCount =
    selectedKeyIdx === 6 ? (preferSharpTritone ? 6 : -6) : keyAccidentalCount(selectedKeyIdx);
  const currentKeyDisplayName =
    selectedKeyIdx === 6
      ? preferSharpTritone
        ? 'F♯-Dur'
        : 'G♭-Dur'
      : `${circleMajorLabel(selectedKeyIdx)}-Dur`;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Compass className="w-6 h-6 text-amber-400" />
            Interaktiver Quintenzirkel
          </h2>
          <p className="text-sm text-slate-400">
            Wähle eine Tonart für das aktive Stufen-Segment (I–vi + vii°), schalte zwischen Dreiklängen &amp; Vierklängen um und klicke Akkorde fürs Songwriting an.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Triads vs 7th Chords */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-0.5">
            <button
              onClick={() => setUseSevenths(false)}
              className={`px-3 py-1.5 rounded-lg font-bold cursor-pointer ${
                !useSevenths ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              Dreiklänge
            </button>
            <button
              onClick={() => setUseSevenths(true)}
              className={`px-3 py-1.5 rounded-lg font-bold cursor-pointer ${
                useSevenths ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              Vierklänge (7th)
            </button>
          </div>

          <button
            onClick={() => setShowSecondary(v => !v)}
            className={`px-3 py-2 rounded-xl font-bold border cursor-pointer ${
              showSecondary
                ? 'bg-rose-500/20 border-rose-500 text-rose-200'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Sekundäre ii–V: {showSecondary ? 'AN' : 'AUS'}
          </button>

          <select
            value={timbre}
            onChange={e => setTimbre(e.target.value as InstrumentTimbre)}
            className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-200"
          >
            <option value="piano">Grand Piano</option>
            <option value="epiano">Neo-Soul Rhodes</option>
            <option value="warmPad">Warm Analog Pad</option>
            <option value="strings">Orchestral Strings</option>
            <option value="organ">Warm Jazz Organ</option>
            <option value="guitar">Clean Gitarre</option>
            <option value="nylon">Akustik Gitarre</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
        {/* INTERACTIVE SVG CIRCLE OF FIFTHS */}
        <div className="xl:col-span-6 studio-card rounded-2xl p-4 sm:p-5 flex flex-col items-center">
          <div className="flex items-center justify-between w-full mb-2 text-xs">
            <span className="text-slate-400">
              Klicke äußere Tonart zum Wechseln • Markierte Stufen (I–vi) zum Anhören
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-300 font-bold">
              Tonart: {currentKeyDisplayName} / {circleMinorLabel(selectedKeyIdx)}
            </span>
          </div>

          {/* Classical Engraved Treble Clef Key Signature (Vorzeichen im Violinschlüssel) */}
          <div className="w-full mb-3">
            <KeySignatureSVG accidentalCount={currentAccCount} keyLabel={`${currentKeyDisplayName} / ${circleMinorLabel(selectedKeyIdx)}`} />
          </div>

          <svg viewBox="0 0 480 480" className="w-full max-w-[470px] h-auto select-none">
            <defs>
              <filter id="wedgeGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="4" result="b" />
                <feMerge>
                  <feMergeNode in="b" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Outer Major Ring + Inner Minor Ring */}
            {CIRCLE_OF_FIFTHS.map((entry, idx) => {
              const startDeg = idx * 30 - 15;
              const endDeg = idx * 30 + 15;
              const midDeg = idx * 30;

              const outerDiatonic = outerDegreeByCircleIdx.get(idx);
              const innerDiatonic = innerDegreeByCircleIdx.get(idx);
              const isTonic = idx === selectedKeyIdx;
              const isDimSlice = dimChord?.circleIndex === idx;
              const secVRoman = showSecondary && !outerDiatonic ? secVByCircleIdx.get(idx) : undefined;

              const outerLabelPos = polarToCartesian(cx, cy, 188, midDeg);
              const outerRomanPos = polarToCartesian(cx, cy, 155, midDeg);
              const innerLabelPos = polarToCartesian(cx, cy, 114, midDeg);
              const innerRomanPos = polarToCartesian(cx, cy, 85, midDeg);

              return (
                <g key={entry.majorName}>
                  {/* OUTER MAJOR WEDGE */}
                  <path
                    d={describeRingSlice(cx, cy, 138, 224, startDeg, endDeg)}
                    fill={
                      isTonic
                        ? 'rgba(245, 158, 11, 0.34)'
                        : outerDiatonic
                          ? 'rgba(6, 182, 212, 0.22)'
                          : secVRoman
                            ? 'rgba(244, 63, 94, 0.16)'
                            : 'rgba(15, 23, 42, 0.85)'
                    }
                    stroke={isTonic ? '#f59e0b' : outerDiatonic ? '#22d3ee' : secVRoman ? '#fb7185' : '#1e293b'}
                    strokeWidth={isTonic ? 2.8 : outerDiatonic ? 1.8 : secVRoman ? 1.5 : 1.2}
                    className="cursor-pointer transition-all hover:brightness-125"
                    onClick={() => {
                      if (outerDiatonic) {
                        playAndMaybeAdd(outerDiatonic);
                      } else if (secVRoman) {
                        playCustomChord(entry.majorPc, '7', secVRoman);
                      } else {
                        setSelectedKeyIdx(idx);
                        const v = getVoiceLedChordMidi(entry.majorPc, useSevenths ? 'maj7' : 'maj', null);
                        audioEngine.playChord(v.allNotes, { timbre });
                      }
                    }}
                    onDoubleClick={() => setSelectedKeyIdx(idx)}
                  />

                  {/* Major Name */}
                  <text
                    x={outerLabelPos.x}
                    y={outerLabelPos.y + 5}
                    textAnchor="middle"
                    fontSize={isTonic ? 18 : 15}
                    fontWeight={800}
                    fill={isTonic ? '#fef3c7' : outerDiatonic ? '#cffafe' : secVRoman ? '#fecdd3' : '#cbd5e1'}
                    pointerEvents="none"
                  >
                    {circleMajorLabel(idx)}
                    {useSevenths && outerDiatonic
                      ? outerDiatonic.degree === 5
                        ? '7'
                        : 'Δ7'
                      : secVRoman
                        ? '7'
                        : ''}
                  </text>

                  {/* Roman Numeral badge on Outer Ring (I, IV, V) or Secondary Dominant (V7/x) */}
                  {outerDiatonic && (
                    <g pointerEvents="none">
                      <rect
                        x={outerRomanPos.x - 16}
                        y={outerRomanPos.y - 10}
                        width={32}
                        height={19}
                        rx={6}
                        fill={isTonic ? '#f59e0b' : '#0891b2'}
                      />
                      <text
                        x={outerRomanPos.x}
                        y={outerRomanPos.y + 3.5}
                        textAnchor="middle"
                        fontSize={10.5}
                        fontWeight={900}
                        fill={isTonic ? '#0b0d12' : '#ffffff'}
                      >
                        {outerDiatonic.romanTriad}
                      </text>
                    </g>
                  )}

                  {secVRoman && (
                    <g pointerEvents="none">
                      <rect
                        x={outerRomanPos.x - 18}
                        y={outerRomanPos.y - 9}
                        width={36}
                        height={17}
                        rx={5}
                        fill="#e11d48"
                      />
                      <text
                        x={outerRomanPos.x}
                        y={outerRomanPos.y + 3}
                        textAnchor="middle"
                        fontSize={9}
                        fontWeight={800}
                        fill="#ffffff"
                      >
                        {secVRoman}
                      </text>
                    </g>
                  )}

                  {/* INNER MINOR WEDGE */}
                  <path
                    d={describeRingSlice(cx, cy, 68, 138, startDeg, endDeg)}
                    fill={
                      innerDiatonic
                        ? innerDiatonic.degree === 6
                          ? 'rgba(16, 185, 129, 0.30)'
                          : 'rgba(139, 92, 246, 0.24)'
                        : isDimSlice
                          ? 'rgba(244, 63, 94, 0.16)'
                          : 'rgba(15, 23, 42, 0.65)'
                    }
                    stroke={
                      innerDiatonic
                        ? innerDiatonic.degree === 6
                          ? '#34d399'
                          : '#a78bfa'
                        : isDimSlice
                          ? '#fb7185'
                          : '#1e293b'
                    }
                    strokeWidth={innerDiatonic ? 1.8 : 1}
                    className="cursor-pointer transition-all hover:brightness-125"
                    onClick={() => {
                      if (innerDiatonic) {
                        playAndMaybeAdd(innerDiatonic);
                      } else if (isDimSlice && dimChord) {
                        playAndMaybeAdd(dimChord);
                      } else {
                        setSelectedKeyIdx(idx);
                      }
                    }}
                  />

                  <text
                    x={innerLabelPos.x}
                    y={innerLabelPos.y + 4}
                    textAnchor="middle"
                    fontSize={12.5}
                    fontWeight={700}
                    fill={innerDiatonic ? '#f8fafc' : isDimSlice ? '#fda4af' : '#94a3b8'}
                    pointerEvents="none"
                  >
                    {circleMinorLabel(idx)}
                  </text>

                  {/* Roman Numeral badge on Inner Ring (ii, iii, vi) or vii° */}
                  {innerDiatonic && (
                    <g pointerEvents="none">
                      <rect
                        x={innerRomanPos.x - 13}
                        y={innerRomanPos.y - 8}
                        width={26}
                        height={16}
                        rx={5}
                        fill={innerDiatonic.degree === 6 ? '#10b981' : '#8b5cf6'}
                      />
                      <text
                        x={innerRomanPos.x}
                        y={innerRomanPos.y + 3.5}
                        textAnchor="middle"
                        fontSize={10}
                        fontWeight={900}
                        fill="#ffffff"
                      >
                        {innerDiatonic.romanTriad}
                      </text>
                    </g>
                  )}

                  {isDimSlice && dimChord && (
                    <text
                      x={innerRomanPos.x}
                      y={innerRomanPos.y + 4}
                      textAnchor="middle"
                      fontSize={9.5}
                      fontWeight={800}
                      fill="#fb7185"
                      pointerEvents="none"
                    >
                      vii°
                    </text>
                  )}
                </g>
              );
            })}

            {/* Highlight arc around the 3-wedge active I-vi diatonic window */}
            <path
              d={describeRingSlice(
                cx,
                cy,
                68,
                224,
                selectedKeyIdx * 30 - 45,
                selectedKeyIdx * 30 + 45
              )}
              fill="none"
              stroke="#fbbf24"
              strokeWidth={3}
              strokeDasharray="6 4"
              pointerEvents="none"
              filter="url(#wedgeGlow)"
            />

            {/* Center Key Badge */}
            <circle cx={cx} cy={cy} r={62} fill="#0b0d12" stroke="#334155" strokeWidth={2} />
            <text x={cx} y={cy - 12} textAnchor="middle" fontSize={11} fontWeight={700} fill="#94a3b8">
              TONART
            </text>
            <text x={cx} y={cy + 14} textAnchor="middle" fontSize={26} fontWeight={900} fill="#fbbf24">
              {selectedKeyIdx === 6 ? (preferSharpTritone ? 'F#' : 'Gb') : circleMajorLabel(selectedKeyIdx)}
            </text>
            <text x={cx} y={cy + 34} textAnchor="middle" fontSize={12} fontWeight={600} fill="#34d399">
              {circleMinorLabel(selectedKeyIdx)} • {currentAccCount === 0 ? '0' : currentAccCount > 0 ? `${currentAccCount}♯` : `${Math.abs(currentAccCount)}♭`}
            </text>
          </svg>

          {/* Symmetrical Quick Key Selector Bar: ♭-Tonarten ← C (Mitte) → ♯-Tonarten */}
          <div className="w-full pt-3 border-t border-slate-800/80 space-y-1.5">
            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider px-1">
              <span className="text-cyan-400">← ♭-Tonarten (Be)</span>
              <span className="text-amber-400">C (Mitte)</span>
              <span className="text-rose-400">♯-Tonarten (Kreuz) →</span>
            </div>
            <div className="flex flex-wrap justify-center gap-1">
              {symmetricKeyOrder.map(item => {
                const isSelected =
                  selectedKeyIdx === item.idx &&
                  (item.idx !== 6 || preferSharpTritone === item.isSharpSide);
                const label =
                  item.idx === 6
                    ? item.isSharpSide
                      ? 'F#'
                      : 'Gb'
                    : circleMajorLabel(item.idx);
                return (
                  <button
                    key={`${item.idx}-${item.accLabel}`}
                    onClick={() => {
                      setSelectedKeyIdx(item.idx);
                      if (item.idx === 6) setPreferSharpTritone(item.isSharpSide);
                    }}
                    className={`px-2 py-1 rounded-lg text-xs font-bold cursor-pointer transition-all flex flex-col items-center leading-tight min-w-[34px] ${
                      isSelected
                        ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/25'
                        : item.idx === 0
                          ? 'bg-slate-800 border border-amber-500/40 text-amber-200 hover:bg-slate-700'
                          : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span>{label}</span>
                    <span className={`text-[9px] font-mono ${isSelected ? 'text-slate-900' : 'text-slate-500'}`}>
                      {item.accLabel}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT SIDE: DIATONIC CHORD CARDS + SONGWRITING SCRATCHPAD */}
        <div className="xl:col-span-6 space-y-5">
          {/* Diatonic Chords Grid */}
          <div className="studio-card rounded-2xl p-4 sm:p-5 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Stufenakkorde in {selectedKey.majorName}-Dur ({useSevenths ? 'Vierklänge' : 'Dreiklänge'})
              </h3>
              <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={addOnClick}
                  onChange={e => setAddOnClick(e.target.checked)}
                  className="accent-amber-500"
                />
                Bei Klick zur Songwriting-Leiste hinzufügen
              </label>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {diatonic.map(d => {
                const name = useSevenths ? d.seventhName : d.triadName;
                const roman = useSevenths ? d.romanSeventh : d.romanTriad;
                const fnColor =
                  d.functionLabel === 'Tonika'
                    ? 'text-amber-300 bg-amber-500/15 border-amber-500/30'
                    : d.functionLabel === 'Subdominante'
                      ? 'text-cyan-300 bg-cyan-500/15 border-cyan-500/30'
                      : 'text-rose-300 bg-rose-500/15 border-rose-500/30';
                return (
                  <button
                    key={d.degree}
                    onClick={() => playAndMaybeAdd(d)}
                    className="p-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/50 text-left transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-amber-400">{roman}</span>
                      <Volume2 className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-300" />
                    </div>
                    <div className="text-lg font-extrabold text-white mt-1">{name}</div>
                    <span className={`inline-block mt-1.5 px-1.5 py-0.5 rounded text-[10px] font-semibold border ${fnColor}`}>
                      {d.functionLabel}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Secondary ii & V Chords Panel */}
          {showSecondary && (
            <div className="studio-card rounded-2xl p-4 sm:p-5 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-rose-400" />
                  Sekundäre ii–V &amp; Sekundärdominanten (in {selectedKey.majorName}-Dur)
                </h3>
                <span className="text-[11px] text-slate-400">Klicken zum Vorhören &amp; Einfügen</span>
              </div>

              <div className="space-y-1.5">
                {secondaryPairs.map(pair => (
                  <div
                    key={pair.targetDegree}
                    className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-900/75 border border-slate-800"
                  >
                    <div className="flex items-center gap-1.5 text-xs">
                      <button
                        onClick={() => playCustomChord(pair.secIiRootPc, pair.secIiChordId, pair.secIiRoman)}
                        className="px-2.5 py-1.5 rounded-lg bg-violet-500/15 hover:bg-violet-500/30 border border-violet-500/40 text-violet-200 font-bold cursor-pointer"
                      >
                        <span className="text-[10px] opacity-80 mr-1">{pair.secIiRoman}</span>
                        {pair.secIiName}
                      </button>
                      <span className="text-slate-600">→</span>
                      <button
                        onClick={() => playCustomChord(pair.secVRootPc, pair.secVChordId, pair.secVRoman)}
                        className="px-2.5 py-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/30 border border-rose-500/40 text-rose-200 font-bold cursor-pointer"
                      >
                        <span className="text-[10px] opacity-80 mr-1">{pair.secVRoman}</span>
                        {pair.secVName}
                      </button>
                      <span className="text-slate-500">→</span>
                      <button
                        onClick={() => {
                          const targetInfo = diatonic.find(
                            d => d.romanTriad.toLowerCase() === pair.targetDegree.toLowerCase()
                          );
                          if (targetInfo) playAndMaybeAdd(targetInfo);
                        }}
                        title="Zielakkord abspielen & hinzufügen"
                        className="px-2.5 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/30 border border-amber-500/40 text-amber-200 font-bold cursor-pointer transition-colors"
                      >
                        <span className="text-[10px] opacity-80 mr-1">{pair.targetDegree}</span>
                        {pair.targetChordName}
                      </button>
                    </div>

                    <button
                      onClick={() => {
                        const ctx = audioEngine.getContext();
                        const v1 = getVoiceLedChordMidi(pair.secIiRootPc, pair.secIiChordId, null);
                        const v2 = getVoiceLedChordMidi(pair.secVRootPc, pair.secVChordId, v1.upperVoices);
                        audioEngine.playChord(v1.allNotes, { time: ctx.currentTime, timbre, duration: 0.9 });
                        audioEngine.playChord(v2.allNotes, { time: ctx.currentTime + 0.85, timbre, duration: 1.2 });
                        setProgression(prev => [
                          ...prev,
                          { id: `s2-${Date.now()}`, rootPc: pair.secIiRootPc, chordId: pair.secIiChordId, roman: pair.secIiRoman },
                          { id: `s5-${Date.now() + 1}`, rootPc: pair.secVRootPc, chordId: pair.secVChordId, roman: pair.secVRoman },
                        ]);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-[11px] font-bold text-slate-200 cursor-pointer"
                    >
                      + ii–V Paar
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Songwriting Progression Builder */}
          <div className="studio-card rounded-2xl p-4 sm:p-5 space-y-3.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-white">Songwriting Akkord-Skizze</h3>
                <p className="text-xs text-slate-400">
                  Kombiniere Stufenakkorde, hör sie im Loop an oder übe sie direkt im Progression-Trainer.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={togglePlayProgression}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold cursor-pointer ${
                    isPlayingSeq
                      ? 'bg-rose-500 text-white'
                      : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                  }`}
                >
                  {isPlayingSeq ? <Square className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                  {isPlayingSeq ? 'Stopp' : 'Abspielen'}
                </button>
                <button
                  onClick={() => setProgression([])}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-rose-400 cursor-pointer"
                  title="Leeren"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {progression.length === 0 ? (
              <div className="p-6 rounded-xl border border-dashed border-slate-700 text-center text-xs text-slate-400">
                Klicke links im Quintenzirkel oder oben auf einen Stufenakkord, um deine Akkordfolge zusammenzustellen.
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {progression.map((c, idx) => {
                  const isCurrent = playingIdx === idx;
                  const useFlat = FLAT_KEYS.has(selectedKey.majorPc);
                  return (
                    <div
                      key={c.id}
                      onClick={() => {
                        const v = getVoiceLedChordMidi(c.rootPc, c.chordId, null);
                        audioEngine.playChord(v.allNotes, { timbre });
                      }}
                      className={`group relative px-3.5 py-2.5 rounded-xl border cursor-pointer transition-all ${
                        isCurrent
                          ? 'bg-amber-500/25 border-amber-400 scale-105'
                          : 'bg-slate-900/80 border-slate-800 hover:border-slate-600'
                      }`}
                    >
                      <div className="text-[10px] font-bold text-amber-400">{c.roman}</div>
                      <div className="text-base font-black text-white">{formatChordName(c.rootPc, c.chordId, useFlat)}</div>
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          setProgression(prev => prev.filter(p => p.id !== c.id));
                        }}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-slate-800 hover:bg-rose-500 text-slate-300 hover:text-white text-[10px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Quick classic cadence templates */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800">
              <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                <span className="text-slate-500">Ideen:</span>
                {[
                  { label: 'ii–V–I', degrees: [2, 5, 1] },
                  { label: 'I–V–vi–IV', degrees: [1, 5, 6, 4] },
                  { label: 'I–vi–IV–V', degrees: [1, 6, 4, 5] },
                  { label: 'IV–iii–ii–I', degrees: [4, 3, 2, 1] },
                ].map(tpl => (
                  <button
                    key={tpl.label}
                    onClick={() => {
                      const next = tpl.degrees.map((deg, idx) => {
                        const info = diatonic.find(d => d.degree === deg)!;
                        return {
                          id: `tpl-${idx}-${Date.now()}`,
                          rootPc: info.rootPc,
                          chordId: useSevenths ? info.seventhId : info.triadId,
                          roman: useSevenths ? info.romanSeventh : info.romanTriad,
                        };
                      });
                      setProgression(next);
                    }}
                    className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold cursor-pointer flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> {tpl.label}
                  </button>
                ))}
              </div>

              {onSendToProgression && progression.length > 0 && (
                <button
                  onClick={() =>
                    onSendToProgression(
                      progression.map(p => ({ rootPc: p.rootPc, chordId: p.chordId, beats: 4 })),
                      selectedKey.majorPc
                    )
                  }
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold cursor-pointer"
                >
                  Im Progression-Trainer üben <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
