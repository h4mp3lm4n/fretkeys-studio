import React from 'react';
import { FretDot, GuitarTuning, GUITAR_TUNINGS } from '../theory/musicTheory';
import { audioEngine, InstrumentTimbre } from '../audio/audioEngine';

export interface FretPositionFrame {
  minFret: number;
  maxFret: number;
  label: string;
  color: string;
  dashed?: boolean;
}

export interface FretboardSVGProps {
  tuning?: GuitarTuning;
  numFrets?: number;
  dots: FretDot[];
  labelMode: 'note' | 'degree' | 'none';
  highlightWindow?: { minFret: number; maxFret: number } | null;
  positionFrames?: FretPositionFrame[];
  activeArpDot?: { stringIdx: number; fret: number } | null;
  mysteryDot?: { stringIdx: number; fret: number; revealedLabel?: string; status?: 'idle' | 'correct' | 'wrong' } | null;
  mutedStrings?: number[]; // stringIdx that are muted (X) in chord voicing mode
  interactive?: boolean;
  timbre?: InstrumentTimbre;
  onFretClick?: (stringIdx: number, fret: number, midi: number) => void;
  compact?: boolean;
}

const SINGLE_INLAYS = new Set([3, 5, 7, 9, 15, 17, 19, 21]);
const DOUBLE_INLAYS = new Set([12, 24]);

export const FretboardSVG: React.FC<FretboardSVGProps> = ({
  tuning = GUITAR_TUNINGS[0],
  numFrets = 15,
  dots,
  labelMode,
  highlightWindow = null,
  positionFrames = [],
  activeArpDot = null,
  mysteryDot = null,
  mutedStrings = [],
  interactive = true,
  timbre = 'guitar',
  onFretClick,
  compact = false,
}) => {
  const numStrings = tuning.midiNotes.length;
  const leftMargin = 56;
  const rightMargin = 20;
  const topMargin = compact ? 22 : 28;
  const bottomMargin = compact ? 28 : 34;
  const stringGap = compact ? 26 : 32;
  const boardHeight = (numStrings - 1) * stringGap;
  const svgHeight = topMargin + boardHeight + bottomMargin;

  // Slightly tapered realistic fret spacing
  const fretPositions: number[] = [leftMargin];
  const totalBoardWidth = 960;
  let totalWeight = 0;
  const weights: number[] = [];
  for (let f = 1; f <= numFrets; f++) {
    const w = Math.pow(0.955, f - 1);
    weights.push(w);
    totalWeight += w;
  }
  let acc = leftMargin;
  for (let f = 1; f <= numFrets; f++) {
    acc += (weights[f - 1] / totalWeight) * totalBoardWidth;
    fretPositions.push(acc);
  }
  const svgWidth = fretPositions[numFrets] + rightMargin;

  // Map string index (0 = low E at bottom, numStrings-1 = high e at top)
  const stringY = (sIdx: number) => topMargin + (numStrings - 1 - sIdx) * stringGap;

  const fretCenterX = (fret: number) => {
    if (fret === 0) return leftMargin - 20;
    return (fretPositions[fret - 1] + fretPositions[fret]) / 2;
  };

  const dotLookup = new Map<string, FretDot>();
  for (const d of dots) {
    dotLookup.set(`${d.stringIdx}-${d.fret}`, d);
  }
  const mutedSet = new Set(mutedStrings);

  const handleSpotClick = (sIdx: number, fret: number) => {
    const midi = tuning.midiNotes[sIdx] + fret;
    if (interactive) {
      audioEngine.playNote(midi, { timbre, duration: 1.3 });
    }
    onFretClick?.(sIdx, fret, midi);
  };

  return (
    <div className="w-full overflow-x-auto pb-2 select-none">
      <svg
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        className="w-full min-w-[740px] h-auto block"
        role="img"
        aria-label="Interaktives Gitarren-Griffbrett"
      >
        <defs>
          <linearGradient id="rosewoodGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#261c17" />
            <stop offset="50%" stopColor="#1e1612" />
            <stop offset="100%" stopColor="#16100d" />
          </linearGradient>
          <linearGradient id="nutGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#f1e8d8" />
            <stop offset="100%" stopColor="#cfc2ac" />
          </linearGradient>
          <filter id="dotGlow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Rosewood fretboard body */}
        <rect
          x={leftMargin}
          y={topMargin - 12}
          width={fretPositions[numFrets] - leftMargin}
          height={boardHeight + 24}
          rx={6}
          fill="url(#rosewoodGrad)"
          stroke="#3b2d25"
          strokeWidth={1.5}
        />

        {/* Highlighted fret position window */}
        {highlightWindow && (highlightWindow.minFret > 0 || highlightWindow.maxFret < numFrets) && (
          <>
            {/* Dim left of window */}
            {highlightWindow.minFret > 1 && (
              <rect
                x={leftMargin}
                y={topMargin - 12}
                width={fretPositions[highlightWindow.minFret - 1] - leftMargin}
                height={boardHeight + 24}
                fill="rgba(7, 9, 14, 0.58)"
              />
            )}
            {/* Dim right of window */}
            {highlightWindow.maxFret < numFrets && (
              <rect
                x={fretPositions[highlightWindow.maxFret]}
                y={topMargin - 12}
                width={fretPositions[numFrets] - fretPositions[highlightWindow.maxFret]}
                height={boardHeight + 24}
                fill="rgba(7, 9, 14, 0.58)"
              />
            )}
            {/* Highlight border around active window */}
            {positionFrames.length === 0 && (
              <rect
                x={highlightWindow.minFret === 0 ? leftMargin : fretPositions[highlightWindow.minFret - 1]}
                y={topMargin - 13}
                width={
                  fretPositions[Math.min(numFrets, highlightWindow.maxFret)] -
                  (highlightWindow.minFret === 0 ? leftMargin : fretPositions[highlightWindow.minFret - 1])
                }
                height={boardHeight + 26}
                rx={4}
                fill="rgba(245, 158, 11, 0.05)"
                stroke="rgba(245, 158, 11, 0.45)"
                strokeWidth={1.5}
                strokeDasharray="5 4"
              />
            )}
          </>
        )}

        {/* Labeled Position Frames (e.g. Main Box + Neighboring Positions) */}
        {positionFrames.map((frame, idx) => {
          const x1 = frame.minFret === 0 ? leftMargin : fretPositions[Math.max(0, frame.minFret - 1)];
          const x2 = fretPositions[Math.min(numFrets, frame.maxFret)];
          const fw = Math.max(12, x2 - x1);
          const inset = idx * 2;
          return (
            <g key={`pframe-${idx}`} pointerEvents="none">
              <rect
                x={x1 + inset}
                y={topMargin - 14 + inset}
                width={Math.max(10, fw - inset * 2)}
                height={boardHeight + 28 - inset * 2}
                rx={5}
                fill={frame.color}
                fillOpacity={frame.dashed ? 0.04 : 0.08}
                stroke={frame.color}
                strokeWidth={frame.dashed ? 1.5 : 2.2}
                strokeDasharray={frame.dashed ? '5 4' : undefined}
              />
              <rect
                x={x1 + 4}
                y={topMargin - 24}
                width={Math.min(fw - 8, Math.max(46, frame.label.length * 6.2 + 10))}
                height={14}
                rx={4}
                fill={frame.color}
                opacity={frame.dashed ? 0.8 : 0.95}
              />
              <text
                x={x1 + 9}
                y={topMargin - 14}
                fontSize={9}
                fontWeight={800}
                fill="#0b0d12"
              >
                {frame.label}
              </text>
            </g>
          );
        })}

        {/* Fret inlay markers */}
        {Array.from({ length: numFrets }, (_, i) => i + 1).map(f => {
          const cx = fretCenterX(f);
          const midY = topMargin + boardHeight / 2;
          if (SINGLE_INLAYS.has(f)) {
            return <circle key={`inlay-${f}`} cx={cx} cy={midY} r={5.5} fill="#cbd5e1" opacity={0.18} />;
          }
          if (DOUBLE_INLAYS.has(f)) {
            return (
              <g key={`inlay-${f}`}>
                <circle cx={cx} cy={topMargin + stringGap * 1.1} r={5.5} fill="#cbd5e1" opacity={0.22} />
                <circle cx={cx} cy={topMargin + boardHeight - stringGap * 1.1} r={5.5} fill="#cbd5e1" opacity={0.22} />
              </g>
            );
          }
          return null;
        })}

        {/* Fret wires */}
        {fretPositions.map((x, idx) =>
          idx === 0 ? (
            <rect
              key="nut"
              x={x - 3.5}
              y={topMargin - 13}
              width={7}
              height={boardHeight + 26}
              rx={2}
              fill="url(#nutGrad)"
            />
          ) : (
            <line
              key={`fret-${idx}`}
              x1={x}
              y1={topMargin - 12}
              x2={x}
              y2={topMargin + boardHeight + 12}
              stroke="#94a3b8"
              strokeWidth={idx === 12 ? 2.6 : 1.8}
              opacity={0.55}
            />
          )
        )}

        {/* Strings */}
        {tuning.midiNotes.map((_, sIdx) => {
          const y = stringY(sIdx);
          const thickness = 1.1 + ((numStrings - 1 - sIdx) / numStrings) * 2.1;
          const isMuted = mutedSet.has(sIdx);
          return (
            <g key={`string-${sIdx}`}>
              <line
                x1={leftMargin - 3}
                y1={y}
                x2={fretPositions[numFrets]}
                y2={y}
                stroke={isMuted ? '#475569' : sIdx < 3 ? '#d6b98c' : '#e2e8f0'}
                strokeWidth={thickness}
                opacity={isMuted ? 0.35 : 0.78}
              />
              {/* String tuning label on the left */}
              <text
                x={14}
                y={y + 4}
                fontSize={11}
                fontWeight={700}
                fill={isMuted ? '#ef4444' : '#94a3b8'}
                textAnchor="middle"
              >
                {isMuted ? '✕' : tuning.labels[sIdx].replace(/\d/, '')}
              </text>
            </g>
          );
        })}

        {/* Fret numbers */}
        {Array.from({ length: numFrets + 1 }, (_, f) => (
          <text
            key={`fnum-${f}`}
            x={fretCenterX(f)}
            y={svgHeight - 8}
            fontSize={11}
            fontWeight={SINGLE_INLAYS.has(f) || DOUBLE_INLAYS.has(f) ? 700 : 500}
            fill={SINGLE_INLAYS.has(f) || DOUBLE_INLAYS.has(f) ? '#e2e8f0' : '#64748b'}
            textAnchor="middle"
          >
            {f === 0 ? '0' : f}
          </text>
        ))}

        {/* Interactive invisible click targets for every fret */}
        {interactive &&
          tuning.midiNotes.map((_, sIdx) =>
            Array.from({ length: numFrets + 1 }, (_, f) => {
              const cx = fretCenterX(f);
              const cy = stringY(sIdx);
              return (
                <rect
                  key={`hit-${sIdx}-${f}`}
                  x={f === 0 ? leftMargin - 34 : fretPositions[f - 1]}
                  y={cy - stringGap / 2}
                  width={f === 0 ? 30 : fretPositions[f] - fretPositions[f - 1]}
                  height={stringGap}
                  fill="transparent"
                  className="cursor-pointer hover:fill-white/5 transition-colors"
                  onClick={() => handleSpotClick(sIdx, f)}
                />
              );
            })
          )}

        {/* Dots */}
        {Array.from(dotLookup.values()).map(dot => {
          if (dot.fret > numFrets) return null;
          const cx = fretCenterX(dot.fret);
          const cy = stringY(dot.stringIdx);
          const isArpActive = activeArpDot?.stringIdx === dot.stringIdx && activeArpDot?.fret === dot.fret;
          const r = compact ? (dot.isRoot ? 11.5 : 10) : dot.isRoot ? 13 : 11.5;

          const hasSecondary = dot.secondaryColors && dot.secondaryColors.length > 0;
          const fillColor = dot.outlineOnly
            ? 'rgba(15, 23, 42, 0.82)'
            : dot.isRoot
              ? '#f59e0b'
              : dot.color;
          const strokeColor = dot.outlineOnly
            ? dot.color
            : dot.isRoot
              ? '#fef3c7'
              : hasSecondary
                ? dot.secondaryColors![0]
                : 'rgba(255,255,255,0.28)';

          const textLabel =
            labelMode === 'none'
              ? ''
              : labelMode === 'note'
                ? dot.noteName
                : dot.degree;

          return (
            <g
              key={`dot-${dot.stringIdx}-${dot.fret}`}
              className="cursor-pointer transition-transform"
              onClick={() => handleSpotClick(dot.stringIdx, dot.fret)}
              filter={isArpActive || dot.isRoot ? 'url(#dotGlow)' : undefined}
            >
              {/* Multi-layer outer ring if note belongs to 2+ merged chords/scales */}
              {hasSecondary && !dot.outlineOnly && (
                <circle
                  cx={cx}
                  cy={cy}
                  r={r + 3.5}
                  fill="none"
                  stroke={dot.secondaryColors![0]}
                  strokeWidth={2.8}
                  strokeDasharray={dot.secondaryColors!.length > 1 ? '6 3' : undefined}
                />
              )}

              {/* Active Arpeggio pulse ring */}
              {isArpActive && (
                <circle
                  cx={cx}
                  cy={cy}
                  r={r + 6}
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth={2.5}
                  opacity={0.95}
                />
              )}

              {/* Main circle */}
              <circle
                cx={cx}
                cy={cy}
                r={isArpActive ? r + 2 : r}
                fill={isArpActive ? '#ffffff' : fillColor}
                stroke={isArpActive ? '#f59e0b' : strokeColor}
                strokeWidth={dot.outlineOnly ? 2.4 : dot.isRoot ? 2.4 : hasSecondary ? 2 : 1.2}
                strokeDasharray={dot.outlineOnly ? '4 2.5' : undefined}
              />

              {/* Inner label */}
              {textLabel && (
                <text
                  x={cx}
                  y={cy + 4}
                  fontSize={textLabel.length > 2 ? 8.5 : 10.5}
                  fontWeight={800}
                  fill={isArpActive ? '#0f172a' : dot.outlineOnly ? dot.color : dot.isRoot ? '#0f172a' : '#ffffff'}
                  textAnchor="middle"
                  pointerEvents="none"
                >
                  {textLabel}
                </text>
              )}
            </g>
          );
        })}

        {/* Mystery dot for Fretboard Trainer */}
        {mysteryDot && (
          <g filter="url(#dotGlow)">
            <circle
              cx={fretCenterX(mysteryDot.fret)}
              cy={stringY(mysteryDot.stringIdx)}
              r={16}
              fill="none"
              stroke={
                mysteryDot.status === 'correct'
                  ? '#10b981'
                  : mysteryDot.status === 'wrong'
                    ? '#f43f5e'
                    : '#f59e0b'
              }
              strokeWidth={2.5}
              opacity={0.65}
            />
            <circle
              cx={fretCenterX(mysteryDot.fret)}
              cy={stringY(mysteryDot.stringIdx)}
              r={12.5}
              fill={
                mysteryDot.status === 'correct'
                  ? '#10b981'
                  : mysteryDot.status === 'wrong'
                    ? '#f43f5e'
                    : '#f59e0b'
              }
              stroke="#ffffff"
              strokeWidth={2}
            />
            <text
              x={fretCenterX(mysteryDot.fret)}
              y={stringY(mysteryDot.stringIdx) + 4.5}
              fontSize={12}
              fontWeight={900}
              fill="#0b0d12"
              textAnchor="middle"
            >
              {mysteryDot.revealedLabel ?? '?'}
            </text>
          </g>
        )}
      </svg>
    </div>
  );
};
