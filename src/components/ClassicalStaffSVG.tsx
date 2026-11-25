import React from 'react';
import { CHROMA_NOTES_COLORS, pcToName } from '../theory/musicTheory';

export interface StaffRenderNote {
  id: number | string;
  midi: number;
  time: number; // seconds (for scrolling mode)
  duration: number; // seconds
  trackIdx?: number;
}

interface ClassicalStaffSVGProps {
  notes: StaffRenderNote[];
  currentTime: number;
  baseBpm: number;
  timeSignature?: [number, number];
  /** Key signature in Circle of Fifths (-7..+7: negative = flats, positive = sharps) */
  keyFifths?: number;
  transpose?: number;
  scale?: number; // 0.85 .. 1.8
  colorNotationKids?: boolean;
  /** Optional static chord-chart mode for Progression Tool: displays measures with chord symbols & stacked voicings */
  staticChords?: Array<{
    symbol: string;
    roman?: string;
    midis: number[];
    isCurrent?: boolean;
    isNext?: boolean;
    onClick?: () => void;
  }>;
}

const DIATONIC_STEP = [0, 0, 1, 1, 2, 3, 3, 4, 4, 5, 5, 6];
const IS_SHARP_PC = [false, true, false, true, false, false, true, false, true, false, true, false];
const LETTER_NATURAL_PC = [0, 2, 4, 5, 7, 9, 11]; // C, D, E, F, G, A, B
const SHARP_LETTER_ORDER = [3, 0, 4, 1, 5, 2, 6]; // F, C, G, D, A, E, B
const FLAT_LETTER_ORDER = [6, 2, 5, 1, 4, 0, 3]; // B, E, A, D, G, C, F

// Classical standard Bravura key-signature vertical positions (diatonic steps from C4)
const TREBLE_SHARP_STEPS = [10, 7, 11, 8, 5, 9, 6]; // F5, C5, G5, D5, A4, E5, B4
const BASS_SHARP_STEPS = [-4, -7, -3, -6, -9, -5, -8]; // F3, C3, G3, D3, A2, E3, B2
const TREBLE_FLAT_STEPS = [6, 9, 5, 8, 4, 7, 3]; // B4, E5, A4, D5, G4, C5, F4
const BASS_FLAT_STEPS = [-8, -5, -9, -6, -10, -7, -11]; // B2, E3, A2, D3, G2, C3, F2

// SMuFL Bravura Music Engraving Codepoints
const GLYPH = {
  BRACE: '\uE000',
  TREBLE_CLEF: '\uE050',
  BASS_CLEF: '\uE062',
  TIME_0: '\uE080',
  NOTE_WHOLE: '\uE0A2',
  NOTE_HALF: '\uE0A3',
  NOTE_BLACK: '\uE0A4',
  FLAT: '\uE260',
  NATURAL: '\uE261',
  SHARP: '\uE262',
  FLAG_8_UP: '\uE240',
  FLAG_8_DOWN: '\uE241',
  FLAG_16_UP: '\uE242',
  FLAG_16_DOWN: '\uE243',
};

function smuflDigit(n: number): string {
  return String(n)
    .split('')
    .map(ch => String.fromCharCode(0xe080 + Number(ch)))
    .join('');
}

function midiToDiatonic(midi: number): { stepFromC4: number; isSharp: boolean; pc: number } {
  const octave = Math.floor(midi / 12) - 1;
  const pc = ((midi % 12) + 12) % 12;
  const stepFromC4 = (octave - 4) * 7 + DIATONIC_STEP[pc];
  return { stepFromC4, isSharp: IS_SHARP_PC[pc], pc };
}

function buildKeyAlterations(keyFifths: number): number[] {
  const alts = [0, 0, 0, 0, 0, 0, 0];
  const clamped = Math.max(-7, Math.min(7, Math.round(keyFifths)));
  if (clamped > 0) {
    for (let i = 0; i < clamped; i++) alts[SHARP_LETTER_ORDER[i]] = 1;
  } else if (clamped < 0) {
    for (let i = 0; i < -clamped; i++) alts[FLAT_LETTER_ORDER[i]] = -1;
  }
  return alts;
}

/**
 * Key-signature-aware note spelling:
 * - Notes belonging to the key signature sit on their true diatonic letter line/space with NO accidental.
 * - Notes cancelling a key-signature sharp/flat get a Natural (♮).
 * - Chromatic alterations use ♭ in flat keys and ♯ in sharp/C keys.
 */
function midiToKeySpelled(
  midi: number,
  keyFifths: number,
  keyAlts: number[]
): { stepFromC4: number; accidental: 'none' | 'sharp' | 'flat' | 'natural'; pc: number } {
  const pc = ((midi % 12) + 12) % 12;

  // 1) Check if pitch belongs to the key signature's 7 diatonic notes
  for (let L = 0; L < 7; L++) {
    const diatonicPc = (LETTER_NATURAL_PC[L] + keyAlts[L] + 12) % 12;
    if (diatonicPc === pc) {
      const oct = Math.round((midi - LETTER_NATURAL_PC[L] - keyAlts[L]) / 12) - 1;
      return { stepFromC4: (oct - 4) * 7 + L, accidental: 'none', pc };
    }
  }

  // 2) If it's a natural pitch whose letter is altered in the key signature -> show Natural (♮)
  for (let L = 0; L < 7; L++) {
    if (LETTER_NATURAL_PC[L] === pc) {
      const oct = Math.round((midi - LETTER_NATURAL_PC[L]) / 12) - 1;
      return { stepFromC4: (oct - 4) * 7 + L, accidental: 'natural', pc };
    }
  }

  // 3) Chromatic black key outside the key signature -> flat in flat keys, sharp in sharp/C keys
  if (keyFifths < 0) {
    for (let L = 0; L < 7; L++) {
      if ((LETTER_NATURAL_PC[L] - 1 + 12) % 12 === pc) {
        const oct = Math.round((midi - (LETTER_NATURAL_PC[L] - 1)) / 12) - 1;
        return { stepFromC4: (oct - 4) * 7 + L, accidental: 'flat', pc };
      }
    }
  }
  for (let L = 0; L < 7; L++) {
    if ((LETTER_NATURAL_PC[L] + 1) % 12 === pc) {
      const oct = Math.round((midi - (LETTER_NATURAL_PC[L] + 1)) / 12) - 1;
      return { stepFromC4: (oct - 4) * 7 + L, accidental: 'sharp', pc };
    }
  }

  const fb = midiToDiatonic(midi);
  return { stepFromC4: fb.stepFromC4, accidental: fb.isSharp ? 'sharp' : 'none', pc };
}

/**
 * Publication-grade Classical Grand Staff SVG using the SMuFL Bravura engraving font.
 * Supports:
 * 1) Scrolling live notation for MIDI Synthesia (with engraved clefs, key signature, brace, time signature, beaming, flags & ledger lines)
 * 2) Static interactive chord-voicing Grand Staff for the Progression Trainer!
 */
export const ClassicalStaffSVG: React.FC<ClassicalStaffSVGProps> = ({
  notes,
  currentTime,
  baseBpm,
  timeSignature = [4, 4],
  keyFifths = 0,
  transpose = 0,
  scale = 1.1,
  colorNotationKids = false,
  staticChords,
}) => {
  // Engraved Grand Staff vertical geometry (1 staff space = 8.4 units => 1 diatonic step = 4.2 units)
  const stepPx = 4.3;
  const trebleCenterY = 66; // B4 (step +6 from C4)
  const bassCenterY = 144; // D3 (step -6 from C4)

  // Map a diatonic step to Treble or Bass staff Y
  const getStaffY = (stepFromC4: number, clef: 'treble' | 'bass') => {
    if (clef === 'treble') {
      // B4 = step 6 is middle line of treble staff (trebleCenterY)
      return trebleCenterY - (stepFromC4 - 6) * stepPx;
    }
    // D3 = step -6 is middle line of bass staff (bassCenterY)
    return bassCenterY - (stepFromC4 - -6) * stepPx;
  };

  // Treble lines: E4(2), G4(4), B4(6), D5(8), F5(10)
  const trebleLines = [2, 4, 6, 8, 10].map(s => getStaffY(s, 'treble'));
  // Bass lines: G2(-10), B2(-8), D3(-6), F3(-4), A3(-2)
  const bassLines = [-10, -8, -6, -4, -2].map(s => getStaffY(s, 'bass'));

  const topTrebleY = trebleLines[4];
  const botTrebleY = trebleLines[0];
  const topBassY = bassLines[4];
  const botBassY = bassLines[0];

  const heightPx = Math.round((staticChords ? 195 : 210) * scale);

  // ==========================================================
  // MODE B: STATIC PROGRESSION GRAND STAFF (Clickable Measures)
  // ==========================================================
  if (staticChords && staticChords.length > 0) {
    const viewW = Math.max(760, 120 + staticChords.length * 140);
    const colW = (viewW - 115) / staticChords.length;

    return (
      <div className="rounded-xl bg-[#fcfbf7] border border-slate-300/90 shadow-inner overflow-x-auto">
        <svg
          viewBox={`0 0 ${viewW} 206`}
          style={{ height: `${heightPx}px`, minWidth: `${Math.min(viewW, 740)}px` }}
          className="w-full block select-none"
          role="img"
          aria-label="Klassisches Notensystem der Akkordfolge"
        >
          {/* Left system barline & curly brace */}
          <line x1={38} y1={topTrebleY} x2={38} y2={botBassY} stroke="#111827" strokeWidth={1.8} />
          <text
            x={33}
            y={botBassY}
            fontSize={botBassY - topTrebleY + 2}
            fill="#111827"
            textAnchor="end"
            className="bravura-glyph"
          >
            {GLYPH.BRACE}
          </text>

          {/* Staff lines */}
          {trebleLines.map((y, i) => (
            <line key={`tl-${i}`} x1={38} y1={y} x2={viewW - 18} y2={y} stroke="#1e293b" strokeWidth={1.0} />
          ))}
          {bassLines.map((y, i) => (
            <line key={`bl-${i}`} x1={38} y1={y} x2={viewW - 18} y2={y} stroke="#1e293b" strokeWidth={1.0} />
          ))}

          {/* Bravura Treble & Bass Clefs */}
          <text x={45} y={trebleLines[1]} fontSize={34} fill="#111827" className="bravura-glyph">
            {GLYPH.TREBLE_CLEF}
          </text>
          <text x={46} y={bassLines[3]} fontSize={34} fill="#111827" className="bravura-glyph">
            {GLYPH.BASS_CLEF}
          </text>

          {/* Final double barline */}
          <line x1={viewW - 23} y1={topTrebleY} x2={viewW - 23} y2={botBassY} stroke="#111827" strokeWidth={1.2} />
          <line x1={viewW - 18} y1={topTrebleY} x2={viewW - 18} y2={botBassY} stroke="#111827" strokeWidth={3.2} />

          {/* Chord measures */}
          {staticChords.map((ch, idx) => {
            const xStart = 104 + idx * colW;
            const cx = xStart + colW * 0.45;
            const sortedMidis = [...ch.midis].sort((a, b) => a - b);

            // Split bass (< 54) vs treble (>= 54) cleanly
            const bassNotes = sortedMidis.filter(m => m < 54);
            const trebleNotes = sortedMidis.filter(m => m >= 54);
            const inkColor = ch.isCurrent ? '#0f172a' : '#1e293b';

            const renderCluster = (cluster: number[], clef: 'treble' | 'bass') => {
              const items = cluster.map(m => ({ midi: m, ...midiToDiatonic(m) }));
              // Offset adjacent seconds horizontally so engraved noteheads never collide
              let prevStep: number | null = null;
              let shiftedPrev = false;
              return items.map((it, nIdx) => {
                const isSecond = prevStep !== null && Math.abs(it.stepFromC4 - prevStep) <= 1 && !shiftedPrev;
                shiftedPrev = isSecond;
                prevStep = it.stepFromC4;

                const nx = cx + (isSecond ? 13.5 : 0);
                const ny = getStaffY(it.stepFromC4, clef);

                // Ledger lines (centered dead-on the whole-note visual center nx!)
                const ledgers: number[] = [];
                if (clef === 'treble') {
                  for (let ls = 0; ls >= it.stepFromC4; ls -= 2) ledgers.push(ls);
                  for (let ls = 12; ls <= it.stepFromC4; ls += 2) ledgers.push(ls);
                } else {
                  for (let ls = 0; ls <= it.stepFromC4; ls += 2) ledgers.push(ls);
                  for (let ls = -12; ls >= it.stepFromC4; ls -= 2) ledgers.push(ls);
                }

                return (
                  <g key={`${clef}-${idx}-${nIdx}`}>
                    {ledgers.map(ls => {
                      const ly = getStaffY(ls, clef);
                      return (
                        <line key={ls} x1={nx - 11.5} y1={ly} x2={nx + 11.5} y2={ly} stroke="#1e293b" strokeWidth={1.15} />
                      );
                    })}
                    {it.isSharp && (
                      <text x={nx - 16.5 - (isSecond ? 13.5 : 0)} y={ny + 0.5} fontSize={26} fill={inkColor} className="bravura-glyph">
                        {GLYPH.SHARP}
                      </text>
                    )}
                    {/* Bravura whole-note width at 32px is ~14.4 units -> left x = nx - 7.2 centers it exactly on nx */}
                    <text x={nx - 7.2} y={ny + 0.5} fontSize={32} fill={inkColor} className="bravura-glyph">
                      {GLYPH.NOTE_WHOLE}
                    </text>
                  </g>
                );
              });
            };

            return (
              <g
                key={`meas-${idx}`}
                onClick={ch.onClick}
                className={ch.onClick ? 'cursor-pointer' : undefined}
              >
                {/* Subtle highlight box for current / next chord */}
                <rect
                  x={xStart + 2}
                  y={6}
                  width={colW - 4}
                  height={194}
                  rx={6}
                  fill={
                    ch.isCurrent
                      ? 'rgba(245, 158, 11, 0.14)'
                      : ch.isNext
                        ? 'rgba(244, 63, 94, 0.06)'
                        : 'transparent'
                  }
                  stroke={
                    ch.isCurrent
                      ? '#d97706'
                      : ch.isNext
                        ? 'rgba(225, 29, 72, 0.35)'
                        : 'transparent'
                  }
                  strokeWidth={ch.isCurrent ? 1.8 : 1.2}
                  strokeDasharray={ch.isNext && !ch.isCurrent ? '4 3' : undefined}
                />

                {/* Measure barline */}
                {idx > 0 && (
                  <line x1={xStart} y1={topTrebleY} x2={xStart} y2={botBassY} stroke="#475569" strokeWidth={1} />
                )}

                {/* Engraved Chord Symbol above staff */}
                <text
                  x={cx + 3}
                  y={25}
                  textAnchor="middle"
                  fontSize={15}
                  fontWeight={800}
                  fontFamily="Georgia, 'Times New Roman', serif"
                  fill={ch.isCurrent ? '#b45309' : '#0f172a'}
                >
                  {ch.symbol}
                </text>

                {renderCluster(trebleNotes, 'treble')}
                {renderCluster(bassNotes, 'bass')}
              </g>
            );
          })}
        </svg>
      </div>
    );
  }

  // ==========================================================
  // MODE A: SCROLLING CLASSICAL ENGRAVED GRAND STAFF (MIDI)
  // ==========================================================
  const viewW = 960;
  const clampedFifths = Math.max(-7, Math.min(7, Math.round(keyFifths)));
  const keyAccCount = Math.abs(clampedFifths);
  const keyIsSharp = clampedFifths > 0;
  const keyAlts = buildKeyAlterations(clampedFifths);

  // Dynamic left header layout so Clef -> Key Signature -> Time Signature -> Playhead NEVER collide!
  const keyStartX = 76;
  const keyStepX = 9.5;
  const timeSigX = keyAccCount > 0 ? keyStartX + keyAccCount * keyStepX + 16 : 88;
  const clipStartX = timeSigX + 20;
  const fadeWidth = 22;
  const playheadX = Math.max(176, clipStartX + 52);

  const pxPerSec = 172;
  const beatSec = 60 / Math.max(30, baseBpm);
  const barSec = beatSec * timeSignature[0];

  // Prepare positioned notes with key-aware spelling, stem, clef & beaming metadata
  const positioned = notes.map(n => {
    const shifted = n.midi + transpose;
    const { stepFromC4, accidental, pc } = midiToKeySpelled(shifted, clampedFifths, keyAlts);
    // Assign clef cleanly by hand/track if available, otherwise split at Middle C (MIDI 60)
    const clef: 'treble' | 'bass' =
      n.trackIdx === 1 && shifted < 64
        ? 'bass'
        : n.trackIdx === 0 && shifted >= 55
          ? 'treble'
          : shifted >= 60
            ? 'treble'
            : 'bass';
    const x = playheadX + (n.time - currentTime) * pxPerSec;
    const y = getStaffY(stepFromC4, clef);
    const beatsDur = n.duration / beatSec;
    const durationKind: 'whole' | 'half' | 'quarter' | 'eighth' | 'sixteenth' =
      beatsDur >= 3.2
        ? 'whole'
        : beatsDur >= 1.6
          ? 'half'
          : beatsDur >= 0.72
            ? 'quarter'
            : beatsDur >= 0.36
              ? 'eighth'
              : 'sixteenth';

    const stemDown = clef === 'treble' ? stepFromC4 >= 6 : stepFromC4 >= -6;
    const isActive = n.time <= currentTime && n.time + n.duration >= currentTime;

    return {
      ...n,
      shifted,
      stepFromC4,
      accidental,
      pc,
      clef,
      x,
      y,
      durationKind,
      stemDown,
      isActive,
    };
  });

  // Group consecutive 8th / 16th notes in the same clef & same beat into engraved beam groups!
  // IMPORTANT: Do NOT filter by x before beaming — keep complete groups intact so beams & stems
  // NEVER break apart or flip direction as they glide past the left mask boundary!
  const beamedIds = new Set<number | string>();
  const beamGroups: Array<{
    clef: 'treble' | 'bass';
    stemDown: boolean;
    isSixteenth: boolean;
    notes: typeof positioned;
  }> = [];

  for (const clef of ['treble', 'bass'] as const) {
    const sub = positioned
      .filter(p => p.clef === clef && (p.durationKind === 'eighth' || p.durationKind === 'sixteenth'))
      .sort((a, b) => a.time - b.time);

    let group: typeof positioned = [];
    const flushGroup = () => {
      if (group.length >= 2) {
        const avgStep = group.reduce((s, g) => s + g.stepFromC4, 0) / group.length;
        const stemDown = clef === 'treble' ? avgStep >= 6 : avgStep >= -6;
        const isSixteenth = group.every(g => g.durationKind === 'sixteenth');
        group.forEach(g => beamedIds.add(g.id));
        beamGroups.push({ clef, stemDown, isSixteenth, notes: [...group] });
      }
      group = [];
    };

    for (const item of sub) {
      if (group.length === 0) {
        group.push(item);
      } else {
        const prev = group[group.length - 1];
        const dt = item.time - prev.time;
        const sameHalfBar = Math.floor(item.time / (beatSec * 2)) === Math.floor(prev.time / (beatSec * 2));
        if (dt > 0.04 && dt <= beatSec * 0.65 && sameHalfBar && group.length < 4) {
          group.push(item);
        } else {
          flushGroup();
          group.push(item);
        }
      }
    }
    flushGroup();
  }

  // Override stem directions for beamed notes so all stems connect to the shared beam
  const beamStemOverride = new Map<number | string, { stemDown: boolean; beamY: number }>();
  const beamSvgElements: React.ReactNode[] = [];

  beamGroups.forEach((grp, gIdx) => {
    const first = grp.notes[0];
    const last = grp.notes[grp.notes.length - 1];
    // Skip drawing beams that are completely outside the visible viewport
    if (last.x < clipStartX - 24 || first.x > viewW + 24) return;
    const stemLen = 28;
    // Compute clean beam endpoint Ys so beam clears every notehead in the group
    let y1 = grp.stemDown ? first.y + stemLen : first.y - stemLen;
    let y2 = grp.stemDown ? last.y + stemLen : last.y - stemLen;
    // Limit slope to keep classical engraving elegance
    const maxSlope = 14;
    if (Math.abs(y2 - y1) > maxSlope) {
      const mid = (y1 + y2) / 2;
      y1 = y1 < y2 ? mid - maxSlope / 2 : mid + maxSlope / 2;
      y2 = y2 < y1 ? mid - maxSlope / 2 : mid + maxSlope / 2;
    }
    // Ensure clearance from extreme notes in group
    grp.notes.forEach(n => {
      const t = last.x > first.x ? (n.x - first.x) / (last.x - first.x) : 0;
      const lineY = y1 + (y2 - y1) * t;
      if (grp.stemDown && lineY < n.y + 20) {
        const shift = n.y + 20 - lineY;
        y1 += shift;
        y2 += shift;
      } else if (!grp.stemDown && lineY > n.y - 20) {
        const shift = lineY - (n.y - 20);
        y1 -= shift;
        y2 -= shift;
      }
    });

    const xOff = grp.stemDown ? -4.2 : 4.2;
    grp.notes.forEach(n => {
      const t = last.x > first.x ? (n.x - first.x) / (last.x - first.x) : 0;
      beamStemOverride.set(n.id, { stemDown: grp.stemDown, beamY: y1 + (y2 - y1) * t });
    });

    const beamInk = colorNotationKids ? '#334155' : '#0f172a';
    beamSvgElements.push(
      <g key={`beam-${gIdx}`}>
        <line
          x1={first.x + xOff}
          y1={y1}
          x2={last.x + xOff}
          y2={y2}
          stroke={beamInk}
          strokeWidth={4.2}
          strokeLinecap="butt"
        />
        {grp.isSixteenth && (
          <line
            x1={first.x + xOff}
            y1={grp.stemDown ? y1 - 6.5 : y1 + 6.5}
            x2={last.x + xOff}
            y2={grp.stemDown ? y2 - 6.5 : y2 + 6.5}
            stroke={beamInk}
            strokeWidth={3.6}
            strokeLinecap="butt"
          />
        )}
      </g>
    );
  });

  // Scrolling Measure Barlines
  const firstBar = Math.max(0, Math.floor((currentTime - 1.2) / barSec));
  const barlines: React.ReactNode[] = [];
  for (let b = firstBar; b <= firstBar + 8; b++) {
    const bx = playheadX + (b * barSec - currentTime) * pxPerSec;
    if (bx < clipStartX - 10 || bx > viewW - 10) continue;
    barlines.push(
      <g key={`bar-${b}`}>
        <line x1={bx} y1={topTrebleY} x2={bx} y2={botBassY} stroke="#64748b" strokeWidth={1.0} />
        <text
          x={bx + 4}
          y={topTrebleY - 8}
          fontSize={10}
          fontStyle="italic"
          fontFamily="Georgia, serif"
          fill="#64748b"
        >
          {b + 1}
        </text>
      </g>
    );
  }

  const trebleKeySteps = keyIsSharp
    ? TREBLE_SHARP_STEPS.slice(0, keyAccCount)
    : TREBLE_FLAT_STEPS.slice(0, keyAccCount);
  const bassKeySteps = keyIsSharp
    ? BASS_SHARP_STEPS.slice(0, keyAccCount)
    : BASS_FLAT_STEPS.slice(0, keyAccCount);

  return (
    <div className="rounded-xl bg-[#fcfbf7] border border-slate-300/90 shadow-inner overflow-hidden">
      <svg
        viewBox={`0 0 ${viewW} 212`}
        style={{ height: `${heightPx}px` }}
        className="w-full block select-none"
        role="img"
        aria-label="Klassisches Notensystem"
      >
        <defs>
          <linearGradient id="notesLeftFadeGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="black" />
            <stop offset="100%" stopColor="white" />
          </linearGradient>
          <mask id="notesFadeMask">
            <rect x={clipStartX} y={0} width={fadeWidth} height={212} fill="url(#notesLeftFadeGrad)" />
            <rect x={clipStartX + fadeWidth} y={0} width={viewW - clipStartX - fadeWidth - 8} height={212} fill="white" />
          </mask>
        </defs>

        {/* Left System Barline & Bravura Curly Grand-Staff Brace */}
        <line x1={38} y1={topTrebleY} x2={38} y2={botBassY} stroke="#111827" strokeWidth={1.8} />
        <text
          x={33}
          y={botBassY}
          fontSize={botBassY - topTrebleY + 2}
          fill="#111827"
          textAnchor="end"
          className="bravura-glyph"
        >
          {GLYPH.BRACE}
        </text>

        {/* Classical Fine Engraved Staff Lines */}
        {trebleLines.map((y, i) => (
          <line key={`tl-${i}`} x1={38} y1={y} x2={viewW - 12} y2={y} stroke="#1e293b" strokeWidth={0.95} />
        ))}
        {bassLines.map((y, i) => (
          <line key={`bl-${i}`} x1={38} y1={y} x2={viewW - 12} y2={y} stroke="#1e293b" strokeWidth={0.95} />
        ))}

        {/* Bravura Engraved Treble & Bass Clefs */}
        <text x={45} y={trebleLines[1]} fontSize={34} fill="#111827" className="bravura-glyph">
          {GLYPH.TREBLE_CLEF}
        </text>
        <text x={46} y={bassLines[3]} fontSize={34} fill="#111827" className="bravura-glyph">
          {GLYPH.BASS_CLEF}
        </text>

        {/* Bravura Engraved Key Signature (Treble & Bass!) */}
        {trebleKeySteps.map((st, idx) => (
          <text
            key={`ks-t-${idx}`}
            x={keyStartX + idx * keyStepX}
            y={getStaffY(st, 'treble') + 0.5}
            fontSize={28}
            fill="#111827"
            className="bravura-glyph"
          >
            {keyIsSharp ? GLYPH.SHARP : GLYPH.FLAT}
          </text>
        ))}
        {bassKeySteps.map((st, idx) => (
          <text
            key={`ks-b-${idx}`}
            x={keyStartX + idx * keyStepX}
            y={getStaffY(st, 'bass') + 0.5}
            fontSize={28}
            fill="#111827"
            className="bravura-glyph"
          >
            {keyIsSharp ? GLYPH.SHARP : GLYPH.FLAT}
          </text>
        ))}

        {/* Engraved Time Signature (e.g., 4/4, 3/4, 6/4, 9/8) */}
        <text x={timeSigX} y={trebleLines[3]} fontSize={32} fill="#111827" textAnchor="middle" className="bravura-glyph">
          {smuflDigit(timeSignature[0])}
        </text>
        <text x={timeSigX} y={trebleLines[1]} fontSize={32} fill="#111827" textAnchor="middle" className="bravura-glyph">
          {smuflDigit(timeSignature[1])}
        </text>
        <text x={timeSigX} y={bassLines[3]} fontSize={32} fill="#111827" textAnchor="middle" className="bravura-glyph">
          {smuflDigit(timeSignature[0])}
        </text>
        <text x={timeSigX} y={bassLines[1]} fontSize={32} fill="#111827" textAnchor="middle" className="bravura-glyph">
          {smuflDigit(timeSignature[1])}
        </text>

        {/* Refined Hairline Playhead Cursor */}
        <line
          x1={playheadX}
          y1={topTrebleY - 14}
          x2={playheadX}
          y2={botBassY + 14}
          stroke="#b45309"
          strokeWidth={1.6}
          opacity={0.72}
        />

        {/* Smoothly Masked Scrolling Notes, Barlines & Beams */}
        <g mask="url(#notesFadeMask)">
          {barlines}
          {beamSvgElements}

          {positioned.map(n => {
            if (n.x < clipStartX - 32 || n.x > viewW + 18) return null;

            const inkColor = colorNotationKids
              ? CHROMA_NOTES_COLORS[n.pc].hex
              : n.isActive
                ? '#b45309'
                : '#0f172a';

            const ledgers: number[] = [];
            if (n.clef === 'treble') {
              for (let ls = 0; ls >= n.stepFromC4; ls -= 2) ledgers.push(ls);
              for (let ls = 12; ls <= n.stepFromC4; ls += 2) ledgers.push(ls);
            } else {
              for (let ls = 0; ls <= n.stepFromC4; ls += 2) ledgers.push(ls);
              for (let ls = -12; ls >= n.stepFromC4; ls -= 2) ledgers.push(ls);
            }

            const beamInfo = beamStemOverride.get(n.id);
            const stemDown = beamInfo ? beamInfo.stemDown : n.stemDown;
            const stemX = n.x + (stemDown ? -4.2 : 4.2);
            const stemEndY = beamInfo ? beamInfo.beamY : stemDown ? n.y + 28 : n.y - 28;

            const headGlyph =
              n.durationKind === 'whole'
                ? GLYPH.NOTE_WHOLE
                : n.durationKind === 'half'
                  ? GLYPH.NOTE_HALF
                  : GLYPH.NOTE_BLACK;

            const showFlag =
              !beamInfo && (n.durationKind === 'eighth' || n.durationKind === 'sixteenth');
            const flagGlyph =
              n.durationKind === 'sixteenth'
                ? stemDown
                  ? GLYPH.FLAG_16_DOWN
                  : GLYPH.FLAG_16_UP
                : stemDown
                  ? GLYPH.FLAG_8_DOWN
                  : GLYPH.FLAG_8_UP;

            const accidentalGlyph =
              n.accidental === 'sharp'
                ? GLYPH.SHARP
                : n.accidental === 'flat'
                  ? GLYPH.FLAT
                  : n.accidental === 'natural'
                    ? GLYPH.NATURAL
                    : null;

            return (
              <g key={n.id}>
                {ledgers.map(ls => {
                  const ly = getStaffY(ls, n.clef);
                  const halfW = n.durationKind === 'whole' ? 11.2 : 9.2;
                  return (
                    <line
                      key={ls}
                      x1={n.x - halfW}
                      y1={ly}
                      x2={n.x + halfW}
                      y2={ly}
                      stroke="#1e293b"
                      strokeWidth={1.1}
                    />
                  );
                })}

                {accidentalGlyph && (
                  <text
                    x={n.x - (n.durationKind === 'whole' ? 16 : 14)}
                    y={n.y + 0.5}
                    fontSize={27}
                    fill={inkColor}
                    className="bravura-glyph"
                  >
                    {accidentalGlyph}
                  </text>
                )}

                {/* Engraved Bravura Notehead (exact optical horizontal centering!) */}
                {colorNotationKids ? (
                  <>
                    <circle cx={n.x} cy={n.y} r={7.2} fill={inkColor} stroke="#0f172a" strokeWidth={0.8} />
                    <text x={n.x} y={n.y + 3} fontSize={8.2} fontWeight={900} fill="#ffffff" textAnchor="middle">
                      {n.pc === 11 ? 'H' : pcToName(n.pc)}
                    </text>
                  </>
                ) : (
                  <text
                    x={n.x - (n.durationKind === 'whole' ? 7.2 : 5.2)}
                    y={n.y + 0.5}
                    fontSize={33}
                    fill={inkColor}
                    className="bravura-glyph"
                  >
                    {headGlyph}
                  </text>
                )}

                {/* Stem (for everything except whole notes) */}
                {n.durationKind !== 'whole' && (
                  <line
                    x1={stemX}
                    y1={n.y + (stemDown ? 1.5 : -1.5)}
                    x2={stemX}
                    y2={stemEndY}
                    stroke={inkColor}
                    strokeWidth={1.25}
                  />
                )}

                {/* Engraved Flag if unbeamed 8th/16th */}
                {showFlag && (
                  <text x={stemX} y={stemEndY} fontSize={31} fill={inkColor} className="bravura-glyph">
                    {flagGlyph}
                  </text>
                )}
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
};

/**
 * Classical Bravura-engraved Treble Clef Key Signature display (for the Circle of Fifths).
 * accidentalCount: -6..0..+6 (negative = flats, positive = sharps)
 */
export const KeySignatureSVG: React.FC<{
  accidentalCount: number;
  keyLabel: string;
}> = ({ accidentalCount, keyLabel }) => {
  // Treble staff lines (step from C4): E4=2, G4=4, B4=6, D5=8, F5=10
  const stepPx = 5.0;
  const centerY = 50; // B4 (step 6)
  const yOf = (step: number) => centerY - (step - 6) * stepPx;
  const staffLines = [2, 4, 6, 8, 10].map(yOf);

  // Classical standard order & exact treble staff positions:
  // Sharps: F5(10), C5(7), G5(11), D5(8), A4(5), E5(9), B4(6)
  const sharpSteps = [10, 7, 11, 8, 5, 9, 6];
  // Flats: B4(6), E5(9), A4(5), D5(8), G4(4), C5(7), F4(3)
  const flatSteps = [6, 9, 5, 8, 4, 7, 3];

  const isSharp = accidentalCount > 0;
  const count = Math.min(7, Math.abs(accidentalCount));
  const steps = isSharp ? sharpSteps.slice(0, count) : flatSteps.slice(0, count);

  return (
    <div className="rounded-xl bg-[#fcfbf7] border border-slate-300/90 shadow-inner px-3 py-2 flex items-center justify-between gap-3">
      <svg viewBox="0 0 215 96" className="h-[74px] w-[190px] block shrink-0 select-none" role="img" aria-label={`Vorzeichen für ${keyLabel}`}>
        {/* Left & right barlines */}
        <line x1={12} y1={staffLines[4]} x2={12} y2={staffLines[0]} stroke="#111827" strokeWidth={1.6} />
        <line x1={203} y1={staffLines[4]} x2={203} y2={staffLines[0]} stroke="#111827" strokeWidth={1.4} />
        <line x1={208} y1={staffLines[4]} x2={208} y2={staffLines[0]} stroke="#111827" strokeWidth={3.0} />

        {/* 5 Staff lines */}
        {staffLines.map((y, idx) => (
          <line key={idx} x1={12} y1={y} x2={208} y2={y} stroke="#1e293b" strokeWidth={1.05} />
        ))}

        {/* Bravura Treble Clef */}
        <text x={20} y={staffLines[1]} fontSize={40} fill="#111827" className="bravura-glyph">
          {GLYPH.TREBLE_CLEF}
        </text>

        {/* Classical Engraved Accidentals */}
        {steps.map((st, idx) => (
          <text
            key={idx}
            x={64 + idx * 17}
            y={yOf(st) + 0.5}
            fontSize={33}
            fill="#0f172a"
            className="bravura-glyph"
          >
            {isSharp ? GLYPH.SHARP : GLYPH.FLAT}
          </text>
        ))}

        {count === 0 && (
          <text x={118} y={54} fontSize={12} fontStyle="italic" fontFamily="Georgia, serif" fill="#64748b">
            keine Vorzeichen
          </text>
        )}
      </svg>

      <div className="text-right pr-1">
        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Vorzeichen</div>
        <div className="text-base font-black text-slate-900 font-serif">{keyLabel}</div>
        <div className="text-xs font-semibold text-amber-700">
          {count === 0 ? '0 Vorzeichen' : `${count} ${isSharp ? 'Kreuz (♯)' : 'Be (♭)'}`}
        </div>
      </div>
    </div>
  );
};
