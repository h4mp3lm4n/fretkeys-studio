import React from 'react';
import { pcToName } from '../theory/musicTheory';
import { audioEngine, InstrumentTimbre } from '../audio/audioEngine';

export interface PianoKeyHighlight {
  pc?: number; // highlights all octaves of this pitch class
  midi?: number; // or specific MIDI key
  color: string;
  secondaryColor?: string;
  label?: string;
  isRoot?: boolean;
  outlineOnly?: boolean;
}

export interface PianoKeyboardSVGProps {
  startMidi?: number; // default 48 (C3)
  endMidi?: number; // default 84 (C6)
  highlights: PianoKeyHighlight[];
  activeMidiNotes?: number[];
  timbre?: InstrumentTimbre;
  onKeyClick?: (midi: number) => void;
  height?: number;
}

const IS_BLACK = [false, true, false, true, false, false, true, false, true, false, true, false];

export const PianoKeyboardSVG: React.FC<PianoKeyboardSVGProps> = ({
  startMidi = 48,
  endMidi = 84,
  highlights,
  activeMidiNotes = [],
  timbre = 'piano',
  onKeyClick,
  height = 148,
}) => {
  const whiteKeys: number[] = [];
  const blackKeys: Array<{ midi: number; leftWhiteIndex: number }> = [];

  for (let m = startMidi; m <= endMidi; m++) {
    if (!IS_BLACK[m % 12]) {
      whiteKeys.push(m);
    } else {
      blackKeys.push({ midi: m, leftWhiteIndex: whiteKeys.length - 1 });
    }
  }

  const whiteW = 36;
  const blackW = 22;
  const blackH = height * 0.62;
  const totalW = whiteKeys.length * whiteW;
  const activeSet = new Set(activeMidiNotes);

  const getHighlight = (midi: number): PianoKeyHighlight | undefined => {
    const exact = highlights.find(h => h.midi === midi);
    if (exact) return exact;
    return highlights.find(h => h.midi === undefined && h.pc === midi % 12);
  };

  const handlePress = (midi: number) => {
    audioEngine.playNote(midi, { timbre, duration: 1.2 });
    onKeyClick?.(midi);
  };

  return (
    <div className="w-full overflow-x-auto pb-1 select-none">
      <svg
        viewBox={`0 0 ${totalW} ${height}`}
        className="w-full min-w-[600px] h-auto block rounded-lg overflow-hidden shadow-lg"
        role="img"
        aria-label="Interaktive Klaviertastatur"
      >
        {/* White Keys */}
        {whiteKeys.map((midi, idx) => {
          const x = idx * whiteW;
          const hl = getHighlight(midi);
          const isActive = activeSet.has(midi);
          const pc = midi % 12;
          const isC = pc === 0;

          let fill = '#f1f5f9';
          if (isActive) {
            fill = '#fbbf24';
          } else if (hl && !hl.outlineOnly) {
            fill = hl.isRoot ? '#f59e0b' : hl.color;
          }

          return (
            <g key={`wk-${midi}`} className="cursor-pointer" onClick={() => handlePress(midi)}>
              <rect
                x={x}
                y={0}
                width={whiteW - 1}
                height={height}
                rx={3}
                fill={fill}
                stroke="#1e293b"
                strokeWidth={1}
              />
              {/* Outline preview (next chord) */}
              {hl?.outlineOnly && (
                <rect
                  x={x + 4}
                  y={height - 34}
                  width={whiteW - 9}
                  height={26}
                  rx={5}
                  fill="rgba(15,23,42,0.12)"
                  stroke={hl.color}
                  strokeWidth={2.5}
                  strokeDasharray="4 2"
                />
              )}
              {/* Secondary layer indicator dot */}
              {hl?.secondaryColor && !hl.outlineOnly && (
                <circle cx={x + whiteW / 2} cy={height - 34} r={5} fill={hl.secondaryColor} stroke="#fff" strokeWidth={1.2} />
              )}
              {/* Label */}
              <text
                x={x + whiteW / 2}
                y={height - 10}
                fontSize={hl?.label ? 10.5 : 9}
                fontWeight={hl ? 800 : 600}
                fill={
                  isActive || (hl && !hl.outlineOnly && hl.isRoot)
                    ? '#0f172a'
                    : hl && !hl.outlineOnly
                      ? '#ffffff'
                      : hl?.outlineOnly
                        ? hl.color
                        : isC
                          ? '#0f172a'
                          : '#64748b'
                }
                textAnchor="middle"
                pointerEvents="none"
              >
                {hl?.label ?? (isC ? `C${Math.floor(midi / 12) - 1}` : pcToName(pc))}
              </text>
            </g>
          );
        })}

        {/* Black Keys */}
        {blackKeys.map(({ midi, leftWhiteIndex }) => {
          if (leftWhiteIndex < 0) return null;
          const x = (leftWhiteIndex + 1) * whiteW - blackW / 2 - 0.5;
          const hl = getHighlight(midi);
          const isActive = activeSet.has(midi);

          let fill = '#0f172a';
          if (isActive) {
            fill = '#fbbf24';
          } else if (hl && !hl.outlineOnly) {
            fill = hl.isRoot ? '#f59e0b' : hl.color;
          }

          return (
            <g key={`bk-${midi}`} className="cursor-pointer" onClick={() => handlePress(midi)}>
              <rect
                x={x}
                y={0}
                width={blackW}
                height={blackH}
                rx={3}
                fill={fill}
                stroke={hl?.outlineOnly ? hl.color : '#020617'}
                strokeWidth={hl?.outlineOnly ? 2.5 : 1.2}
                strokeDasharray={hl?.outlineOnly ? '4 2' : undefined}
              />
              {hl?.secondaryColor && !hl.outlineOnly && (
                <circle cx={x + blackW / 2} cy={blackH - 28} r={4} fill={hl.secondaryColor} stroke="#fff" strokeWidth={1} />
              )}
              {hl?.label && (
                <text
                  x={x + blackW / 2}
                  y={blackH - 9}
                  fontSize={8.5}
                  fontWeight={800}
                  fill={isActive || (hl.isRoot && !hl.outlineOnly) ? '#0f172a' : hl.outlineOnly ? hl.color : '#ffffff'}
                  textAnchor="middle"
                  pointerEvents="none"
                >
                  {hl.label}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
};
