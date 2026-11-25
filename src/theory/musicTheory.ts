// Core Music Theory, Fretboard, Voicing & Piano Mapping Engine

export type AccidentalPreference = 'sharp' | 'flat' | 'auto';
export type NoteNamingLocale = 'intl' | 'de';

let currentNoteNaming: NoteNamingLocale =
  typeof localStorage !== 'undefined' && localStorage.getItem('fk_note_naming') === 'de'
    ? 'de'
    : 'intl';

const namingListeners = new Set<(locale: NoteNamingLocale) => void>();

export function getNoteNamingLocale(): NoteNamingLocale {
  return currentNoteNaming;
}

export function setNoteNamingLocale(locale: NoteNamingLocale) {
  currentNoteNaming = locale;
  try {
    localStorage.setItem('fk_note_naming', locale);
  } catch {
    // ignore storage errors
  }
  namingListeners.forEach(fn => fn(locale));
}

export function subscribeNoteNaming(fn: (locale: NoteNamingLocale) => void): () => void {
  namingListeners.add(fn);
  return () => {
    namingListeners.delete(fn);
  };
}

export const NOTE_NAMES_SHARP = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as const;
export const NOTE_NAMES_FLAT = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'] as const;
export const NOTE_NAMES_SHARP_DE = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'B', 'H'] as const;
export const NOTE_NAMES_FLAT_DE = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'B', 'H'] as const;

export function getNoteNamesArray(useFlats = false, locale: NoteNamingLocale = currentNoteNaming): readonly string[] {
  if (locale === 'de') {
    return useFlats ? NOTE_NAMES_FLAT_DE : NOTE_NAMES_SHARP_DE;
  }
  return useFlats ? NOTE_NAMES_FLAT : NOTE_NAMES_SHARP;
}

// Keys that conventionally use flats
export const FLAT_KEYS = new Set([5, 10, 3, 8, 1, 6]); // F, Bb, Eb, Ab, Db, Gb

export function shouldUseFlats(rootPc: number, pref: AccidentalPreference = 'auto'): boolean {
  if (pref === 'flat') return true;
  if (pref === 'sharp') return false;
  return FLAT_KEYS.has(((rootPc % 12) + 12) % 12);
}

export function pcToName(pc: number, useFlats = false, locale: NoteNamingLocale = currentNoteNaming): string {
  const norm = ((pc % 12) + 12) % 12;
  const arr = getNoteNamesArray(useFlats, locale);
  return arr[norm];
}

export function midiToNoteName(midi: number, useFlats = false, locale: NoteNamingLocale = currentNoteNaming): string {
  const octave = Math.floor(midi / 12) - 1;
  return `${pcToName(midi % 12, useFlats, locale)}${octave}`;
}

export function midiToFreq(midi: number, a4 = 440): number {
  return a4 * Math.pow(2, (midi - 69) / 12);
}

export function freqToMidi(freq: number, a4 = 440): number {
  return 69 + 12 * Math.log2(freq / a4);
}

export interface IntervalDef {
  semitones: number;
  short: string;
  nameDe: string;
}

export const INTERVALS: IntervalDef[] = [
  { semitones: 0, short: 'R', nameDe: 'Prime (Grundton)' },
  { semitones: 1, short: 'b2', nameDe: 'Kleine Sekunde' },
  { semitones: 2, short: '2', nameDe: 'Große Sekunde' },
  { semitones: 3, short: 'b3', nameDe: 'Kleine Terz' },
  { semitones: 4, short: '3', nameDe: 'Große Terz' },
  { semitones: 5, short: '4', nameDe: 'Reine Quarte' },
  { semitones: 6, short: 'b5', nameDe: 'Tritonus (b5/#4)' },
  { semitones: 7, short: '5', nameDe: 'Reine Quinte' },
  { semitones: 8, short: 'b6', nameDe: 'Kleine Sexte' },
  { semitones: 9, short: '6', nameDe: 'Große Sexte' },
  { semitones: 10, short: 'b7', nameDe: 'Kleine Septime' },
  { semitones: 11, short: '7', nameDe: 'Große Septime' },
  { semitones: 12, short: '8', nameDe: 'Oktave' },
];

export interface ScaleDef {
  id: string;
  name: string;
  category:
    | 'Modi'
    | 'Pentatonik & Blues'
    | 'Moll-Varianten'
    | 'Jazz & Bebop'
    | 'Asiatisch'
    | 'Arabisch, Indisch & Exotisch';
  intervals: number[];
  degrees: string[];
}

export const SCALES: ScaleDef[] = [
  { id: 'major', name: 'Dur (Ionisch)', category: 'Modi', intervals: [0, 2, 4, 5, 7, 9, 11], degrees: ['R', '2', '3', '4', '5', '6', '7'] },
  { id: 'minor', name: 'Natürliches Moll (Äolisch)', category: 'Modi', intervals: [0, 2, 3, 5, 7, 8, 10], degrees: ['R', '2', 'b3', '4', '5', 'b6', 'b7'] },
  { id: 'dorian', name: 'Dorisch', category: 'Modi', intervals: [0, 2, 3, 5, 7, 9, 10], degrees: ['R', '2', 'b3', '4', '5', '6', 'b7'] },
  { id: 'phrygian', name: 'Phrygisch', category: 'Modi', intervals: [0, 1, 3, 5, 7, 8, 10], degrees: ['R', 'b2', 'b3', '4', '5', 'b6', 'b7'] },
  { id: 'lydian', name: 'Lydisch', category: 'Modi', intervals: [0, 2, 4, 6, 7, 9, 11], degrees: ['R', '2', '3', '#4', '5', '6', '7'] },
  { id: 'mixolydian', name: 'Mixolydisch', category: 'Modi', intervals: [0, 2, 4, 5, 7, 9, 10], degrees: ['R', '2', '3', '4', '5', '6', 'b7'] },
  { id: 'locrian', name: 'Lokrisch', category: 'Modi', intervals: [0, 1, 3, 5, 6, 8, 10], degrees: ['R', 'b2', 'b3', '4', 'b5', 'b6', 'b7'] },
  { id: 'minor_pent', name: 'Moll-Pentatonik', category: 'Pentatonik & Blues', intervals: [0, 3, 5, 7, 10], degrees: ['R', 'b3', '4', '5', 'b7'] },
  { id: 'major_pent', name: 'Dur-Pentatonik', category: 'Pentatonik & Blues', intervals: [0, 2, 4, 7, 9], degrees: ['R', '2', '3', '5', '6'] },
  { id: 'blues', name: 'Blues-Skala (Moll)', category: 'Pentatonik & Blues', intervals: [0, 3, 5, 6, 7, 10], degrees: ['R', 'b3', '4', 'b5', '5', 'b7'] },
  { id: 'major_blues', name: 'Dur-Blues / Country', category: 'Pentatonik & Blues', intervals: [0, 2, 3, 4, 7, 9], degrees: ['R', '2', 'b3', '3', '5', '6'] },
  { id: 'harmonic_minor', name: 'Harmonisch Moll', category: 'Moll-Varianten', intervals: [0, 2, 3, 5, 7, 8, 11], degrees: ['R', '2', 'b3', '4', '5', 'b6', '7'] },
  { id: 'melodic_minor', name: 'Melodisch Moll', category: 'Moll-Varianten', intervals: [0, 2, 3, 5, 7, 9, 11], degrees: ['R', '2', 'b3', '4', '5', '6', '7'] },
  { id: 'phrygian_dom', name: 'Phrygisch Dominant (HM5 / Hijaz)', category: 'Moll-Varianten', intervals: [0, 1, 4, 5, 7, 8, 10], degrees: ['R', 'b2', '3', '4', '5', 'b6', 'b7'] },
  { id: 'lydian_dom', name: 'Lydisch Dominant', category: 'Jazz & Bebop', intervals: [0, 2, 4, 6, 7, 9, 10], degrees: ['R', '2', '3', '#4', '5', '6', 'b7'] },
  { id: 'altered', name: 'Alteriert (Super-Lokrisch)', category: 'Jazz & Bebop', intervals: [0, 1, 3, 4, 6, 8, 10], degrees: ['R', 'b9', '#9', '3', 'b5', '#5', 'b7'] },
  { id: 'dim_hw', name: 'Halbton-Ganzton (Vermindert)', category: 'Jazz & Bebop', intervals: [0, 1, 3, 4, 6, 7, 9, 10], degrees: ['R', 'b2', 'b3', '3', '#4', '5', '6', 'b7'] },
  { id: 'whole_tone', name: 'Ganztonskala', category: 'Jazz & Bebop', intervals: [0, 2, 4, 6, 8, 10], degrees: ['R', '2', '3', '#4', '#5', 'b7'] },
  { id: 'bebop_dom', name: 'Bebop Dominant', category: 'Jazz & Bebop', intervals: [0, 2, 4, 5, 7, 9, 10, 11], degrees: ['R', '2', '3', '4', '5', '6', 'b7', '7'] },
  { id: 'bebop_maj', name: 'Bebop Dur', category: 'Jazz & Bebop', intervals: [0, 2, 4, 5, 7, 8, 9, 11], degrees: ['R', '2', '3', '4', '5', '#5', '6', '7'] },
  // Asian Scales
  { id: 'hirajoshi', name: 'Hirajoshi (Japanisch)', category: 'Asiatisch', intervals: [0, 2, 3, 7, 8], degrees: ['R', '2', 'b3', '5', 'b6'] },
  { id: 'in_sen', name: 'In-Sen (Japanisch)', category: 'Asiatisch', intervals: [0, 1, 5, 7, 10], degrees: ['R', 'b2', '4', '5', 'b7'] },
  { id: 'iwato', name: 'Iwato (Japanisch)', category: 'Asiatisch', intervals: [0, 1, 5, 6, 10], degrees: ['R', 'b2', '4', 'b5', 'b7'] },
  { id: 'yo_scale', name: 'Yo-Skala (Japanisch)', category: 'Asiatisch', intervals: [0, 2, 5, 7, 9], degrees: ['R', '2', '4', '5', '6'] },
  { id: 'kumoi', name: 'Kumoi (Japanisch)', category: 'Asiatisch', intervals: [0, 2, 3, 7, 9], degrees: ['R', '2', 'b3', '5', '6'] },
  { id: 'pelog', name: 'Balinesisch (Pelog)', category: 'Asiatisch', intervals: [0, 1, 3, 7, 8], degrees: ['R', 'b2', 'b3', '5', 'b6'] },
  { id: 'chinese', name: 'Chinesisch (Lydisch Pentatonik)', category: 'Asiatisch', intervals: [0, 4, 6, 7, 11], degrees: ['R', '3', '#4', '5', '7'] },
  // Arabic, Indian & Exotic Scales
  { id: 'double_harmonic', name: 'Arabisch / Byzantinisch (Hijaz Kar)', category: 'Arabisch, Indisch & Exotisch', intervals: [0, 1, 4, 5, 7, 8, 11], degrees: ['R', 'b2', '3', '4', '5', 'b6', '7'] },
  { id: 'persian', name: 'Persisch', category: 'Arabisch, Indisch & Exotisch', intervals: [0, 1, 4, 5, 6, 8, 11], degrees: ['R', 'b2', '3', '4', 'b5', 'b6', '7'] },
  { id: 'egyptian', name: 'Ägyptisch (Suspended Pentatonik)', category: 'Arabisch, Indisch & Exotisch', intervals: [0, 2, 5, 7, 10], degrees: ['R', '2', '4', '5', 'b7'] },
  { id: 'hungarian_minor', name: 'Ungarisch Moll (Zigeunermoll)', category: 'Arabisch, Indisch & Exotisch', intervals: [0, 2, 3, 6, 7, 8, 11], degrees: ['R', '2', 'b3', '#4', '5', 'b6', '7'] },
  { id: 'indian_marwa', name: 'Indisch (Raga Marwa)', category: 'Arabisch, Indisch & Exotisch', intervals: [0, 1, 4, 6, 9, 11], degrees: ['R', 'b2', '3', '#4', '6', '7'] },
  { id: 'indian_purvi', name: 'Indisch (Raga Purvi)', category: 'Arabisch, Indisch & Exotisch', intervals: [0, 1, 4, 6, 7, 8, 11], degrees: ['R', 'b2', '3', '#4', '5', 'b6', '7'] },
  { id: 'neapolitan_minor', name: 'Neapolitanisch Moll', category: 'Arabisch, Indisch & Exotisch', intervals: [0, 1, 3, 5, 7, 8, 11], degrees: ['R', 'b2', 'b3', '4', '5', 'b6', '7'] },
  { id: 'spanish_8tone', name: 'Spanisch 8-Ton (Flamenco)', category: 'Arabisch, Indisch & Exotisch', intervals: [0, 1, 3, 4, 5, 6, 8, 10], degrees: ['R', 'b2', 'b3', '3', '4', 'b5', 'b6', 'b7'] },
  { id: 'enigmatic', name: 'Enigmatisch (Verdi)', category: 'Arabisch, Indisch & Exotisch', intervals: [0, 1, 4, 6, 8, 10, 11], degrees: ['R', 'b2', '3', '#4', '#5', 'b7', '7'] },
];

export interface ChordDef {
  id: string;
  symbol: string;
  name: string;
  category: 'Dreiklänge' | 'Septakkorde' | 'Erweitert & Neo-Soul' | 'Suspended & Power';
  intervals: number[]; // semitones mod 12 or extended for piano voicing
  degrees: string[];
  essentialIndices: number[]; // indices in intervals that MUST be present in guitar voicings
}

export const CHORDS: ChordDef[] = [
  { id: 'maj', symbol: '', name: 'Dur', category: 'Dreiklänge', intervals: [0, 4, 7], degrees: ['R', '3', '5'], essentialIndices: [0, 1, 2] },
  { id: 'min', symbol: 'm', name: 'Moll', category: 'Dreiklänge', intervals: [0, 3, 7], degrees: ['R', 'b3', '5'], essentialIndices: [0, 1, 2] },
  { id: 'dim', symbol: '°', name: 'Vermindert', category: 'Dreiklänge', intervals: [0, 3, 6], degrees: ['R', 'b3', 'b5'], essentialIndices: [0, 1, 2] },
  { id: 'aug', symbol: '+', name: 'Übermäßig', category: 'Dreiklänge', intervals: [0, 4, 8], degrees: ['R', '3', '#5'], essentialIndices: [0, 1, 2] },
  { id: 'maj7', symbol: 'maj7', name: 'Major 7', category: 'Septakkorde', intervals: [0, 4, 7, 11], degrees: ['R', '3', '5', '7'], essentialIndices: [0, 1, 3] },
  { id: 'm7', symbol: 'm7', name: 'Moll 7', category: 'Septakkorde', intervals: [0, 3, 7, 10], degrees: ['R', 'b3', '5', 'b7'], essentialIndices: [0, 1, 3] },
  { id: '7', symbol: '7', name: 'Dominant 7', category: 'Septakkorde', intervals: [0, 4, 7, 10], degrees: ['R', '3', '5', 'b7'], essentialIndices: [0, 1, 3] },
  { id: 'm7b5', symbol: 'm7b5', name: 'Halbvermindert (ø7)', category: 'Septakkorde', intervals: [0, 3, 6, 10], degrees: ['R', 'b3', 'b5', 'b7'], essentialIndices: [0, 1, 2, 3] },
  { id: 'dim7', symbol: '°7', name: 'Vermindert 7', category: 'Septakkorde', intervals: [0, 3, 6, 9], degrees: ['R', 'b3', 'b5', 'bb7'], essentialIndices: [0, 1, 2, 3] },
  { id: 'mMaj7', symbol: 'm(maj7)', name: 'Moll Major 7', category: 'Septakkorde', intervals: [0, 3, 7, 11], degrees: ['R', 'b3', '5', '7'], essentialIndices: [0, 1, 3] },
  { id: '6', symbol: '6', name: 'Dur 6', category: 'Erweitert & Neo-Soul', intervals: [0, 4, 7, 9], degrees: ['R', '3', '5', '6'], essentialIndices: [0, 1, 3] },
  { id: 'm6', symbol: 'm6', name: 'Moll 6', category: 'Erweitert & Neo-Soul', intervals: [0, 3, 7, 9], degrees: ['R', 'b3', '5', '6'], essentialIndices: [0, 1, 3] },
  { id: 'add9', symbol: 'add9', name: 'Add 9', category: 'Erweitert & Neo-Soul', intervals: [0, 4, 7, 14], degrees: ['R', '3', '5', '9'], essentialIndices: [0, 1, 3] },
  { id: 'maj9', symbol: 'maj9', name: 'Major 9', category: 'Erweitert & Neo-Soul', intervals: [0, 4, 7, 11, 14], degrees: ['R', '3', '5', '7', '9'], essentialIndices: [0, 1, 3, 4] },
  { id: 'm9', symbol: 'm9', name: 'Moll 9', category: 'Erweitert & Neo-Soul', intervals: [0, 3, 7, 10, 14], degrees: ['R', 'b3', '5', 'b7', '9'], essentialIndices: [0, 1, 3, 4] },
  { id: '9', symbol: '9', name: 'Dominant 9', category: 'Erweitert & Neo-Soul', intervals: [0, 4, 7, 10, 14], degrees: ['R', '3', '5', 'b7', '9'], essentialIndices: [0, 1, 3, 4] },
  { id: '7sharp9', symbol: '7#9', name: 'Dominant 7#9 (Hendrix)', category: 'Erweitert & Neo-Soul', intervals: [0, 4, 7, 10, 15], degrees: ['R', '3', '5', 'b7', '#9'], essentialIndices: [0, 1, 3, 4] },
  { id: '7b9', symbol: '7b9', name: 'Dominant 7b9', category: 'Erweitert & Neo-Soul', intervals: [0, 4, 7, 10, 13], degrees: ['R', '3', '5', 'b7', 'b9'], essentialIndices: [0, 1, 3, 4] },
  { id: '7sharp11', symbol: '7#11', name: 'Lydian Dominant (7#11)', category: 'Erweitert & Neo-Soul', intervals: [0, 4, 6, 10, 14], degrees: ['R', '3', '#11', 'b7', '9'], essentialIndices: [0, 1, 2, 3] },
  { id: '7alt', symbol: '7alt', name: 'Alteriert (7#5#9)', category: 'Erweitert & Neo-Soul', intervals: [0, 4, 8, 10, 15], degrees: ['R', '3', '#5', 'b7', '#9'], essentialIndices: [0, 1, 2, 3] },
  { id: '13', symbol: '13', name: 'Dominant 13', category: 'Erweitert & Neo-Soul', intervals: [0, 4, 7, 10, 21], degrees: ['R', '3', '5', 'b7', '13'], essentialIndices: [0, 1, 3, 4] },
  { id: 'm11', symbol: 'm11', name: 'Moll 11 (Neo-Soul)', category: 'Erweitert & Neo-Soul', intervals: [0, 3, 7, 10, 17], degrees: ['R', 'b3', '5', 'b7', '11'], essentialIndices: [0, 1, 3, 4] },
  { id: 'sus2', symbol: 'sus2', name: 'Suspended 2', category: 'Suspended & Power', intervals: [0, 2, 7], degrees: ['R', '2', '5'], essentialIndices: [0, 1, 2] },
  { id: 'sus4', symbol: 'sus4', name: 'Suspended 4', category: 'Suspended & Power', intervals: [0, 5, 7], degrees: ['R', '4', '5'], essentialIndices: [0, 1, 2] },
  { id: '7sus4', symbol: '7sus4', name: 'Dominant 7sus4', category: 'Suspended & Power', intervals: [0, 5, 7, 10], degrees: ['R', '4', '5', 'b7'], essentialIndices: [0, 1, 3] },
  { id: '9sus4', symbol: '9sus4', name: 'Gospel / Neo-Soul 9sus4', category: 'Suspended & Power', intervals: [0, 5, 7, 10, 14], degrees: ['R', '4', '5', 'b7', '9'], essentialIndices: [0, 1, 3, 4] },
  { id: '5', symbol: '5', name: 'Powerchord', category: 'Suspended & Power', intervals: [0, 7], degrees: ['R', '5'], essentialIndices: [0, 1] },
];

export function getScaleById(id: string): ScaleDef {
  return SCALES.find(s => s.id === id) ?? SCALES[0];
}

export function getChordById(id: string): ChordDef {
  return CHORDS.find(c => c.id === id) ?? CHORDS[0];
}

export function formatChordName(rootPc: number, chordId: string, useFlats?: boolean): string {
  const chord = getChordById(chordId);
  const flat = useFlats ?? shouldUseFlats(rootPc, 'auto');
  return `${pcToName(rootPc, flat)}${chord.symbol}`;
}

export interface GuitarTuning {
  id: string;
  name: string;
  // Ordered from LOWEST pitch string (index 0 = low E) to HIGHEST pitch string (index 5 = high e)
  midiNotes: number[];
  labels: string[];
}

export const GUITAR_TUNINGS: GuitarTuning[] = [
  { id: 'standard', name: 'Standard (E A D G B E)', midiNotes: [40, 45, 50, 55, 59, 64], labels: ['E2', 'A2', 'D3', 'G3', 'B3', 'E4'] },
  { id: 'drop_d', name: 'Drop D (D A D G B E)', midiNotes: [38, 45, 50, 55, 59, 64], labels: ['D2', 'A2', 'D3', 'G3', 'B3', 'E4'] },
  { id: 'eb_standard', name: 'Eb Standard (Halbton tiefer)', midiNotes: [39, 44, 49, 54, 58, 63], labels: ['Eb2', 'Ab2', 'Db3', 'Gb3', 'Bb3', 'Eb4'] },
  { id: 'dadgad', name: 'DADGAD (Celtic / Fingerstyle)', midiNotes: [38, 45, 50, 55, 57, 62], labels: ['D2', 'A2', 'D3', 'G3', 'A3', 'D4'] },
  { id: 'open_g', name: 'Open G (D G D G B D)', midiNotes: [38, 43, 50, 55, 59, 62], labels: ['D2', 'G2', 'D3', 'G3', 'B3', 'D4'] },
  { id: '7string', name: '7-Saiter Standard (B E A D G B E)', midiNotes: [35, 40, 45, 50, 55, 59, 64], labels: ['B1', 'E2', 'A2', 'D3', 'G3', 'B3', 'E4'] },
];

export interface FretPositionWindow {
  id: string;
  label: string;
  shortLabel: string;
  minFret: number;
  maxFret: number;
  shapeName?: string;
}

/**
 * Generates the 5 authentic CAGED / Pentatonic box positions for any root note on the fretboard.
 * Distinguishes Minor (has b3) vs Major (has 3) so every single box covers all 6 strings completely
 * with zero missing notes (e.g. A Minor Pentatonic Pos 5 = Bund 2–5, including D2 & G2!) and zero stray unisons.
 */
export function getCagedPositionsForRoot(
  rootPc: number,
  lowStringMidi = 40,
  isMinor = true
): FretPositionWindow[] {
  const baseFret = ((rootPc - (lowStringMidi % 12)) % 12 + 12) % 12;

  const shapes = isMinor
    ? [
        { name: 'Pos. 1 (Em-Form)', short: 'Pos 1', offset: 0, span: 3 },
        { name: 'Pos. 2 (Dm-Form)', short: 'Pos 2', offset: 2, span: 3 },
        { name: 'Pos. 3 (Cm-Form)', short: 'Pos 3', offset: 4, span: 4 },
        { name: 'Pos. 4 (Am-Form)', short: 'Pos 4', offset: 7, span: 3 },
        { name: 'Pos. 5 (Gm-Form)', short: 'Pos 5', offset: 9, span: 3 },
      ]
    : [
        { name: 'Pos. 1 (E-Form)', short: 'Pos 1', offset: -1, span: 3 },
        { name: 'Pos. 2 (D-Form)', short: 'Pos 2', offset: 1, span: 4 },
        { name: 'Pos. 3 (C-Form)', short: 'Pos 3', offset: 4, span: 3 },
        { name: 'Pos. 4 (A-Form)', short: 'Pos 4', offset: 6, span: 3 },
        { name: 'Pos. 5 (G-Form)', short: 'Pos 5', offset: 9, span: 3 },
      ];

  const windows: FretPositionWindow[] = [
    { id: 'all', label: 'Ganzes Griffbrett (0–15)', shortLabel: 'Alle', minFret: 0, maxFret: 15 },
  ];

  shapes.forEach((s, idx) => {
    let minF = ((baseFret + s.offset) % 12 + 12) % 12;
    let maxF = minF + s.span;
    if (maxF > 15) {
      minF = Math.max(0, minF - 12);
      maxF = minF + s.span;
    }
    windows.push({
      id: `pos_${idx + 1}`,
      label: `${s.name} (Bund ${minF}–${maxF})`,
      shortLabel: s.short,
      minFret: minF,
      maxFret: maxF,
      shapeName: s.name,
    });
  });

  return windows;
}

/**
 * Generates 5 wider 3-Notes-Per-String (3NPS) horizontal stretch windows (5 frets inclusive) across the neck.
 */
export function get3NpsPositionsForRoot(rootPc: number, lowStringMidi = 40): FretPositionWindow[] {
  const baseFret = ((rootPc - (lowStringMidi % 12)) % 12 + 12) % 12;
  const shapes = [
    { name: '3NPS Pos. 1', short: '3NPS 1', offset: 0, span: 5 },
    { name: '3NPS Pos. 2', short: '3NPS 2', offset: 2, span: 5 },
    { name: '3NPS Pos. 3', short: '3NPS 3', offset: 5, span: 5 },
    { name: '3NPS Pos. 4', short: '3NPS 4', offset: 7, span: 5 },
    { name: '3NPS Pos. 5', short: '3NPS 5', offset: 9, span: 5 },
  ];

  const out: FretPositionWindow[] = shapes.map((s, idx) => {
    let minF = (baseFret + s.offset) % 12;
    let maxF = minF + s.span;
    if (maxF > 15) {
      minF = Math.max(0, minF - 12);
      maxF = minF + s.span;
    }
    return {
      id: `3nps_${idx + 1}`,
      label: `${s.name} (Bund ${minF}–${maxF})`,
      shortLabel: s.short,
      minFret: minF,
      maxFret: maxF,
      shapeName: s.name,
    };
  });
  out.sort((a, b) => a.minFret - b.minFret);
  return out;
}

export interface FretDot {
  stringIdx: number; // 0 = low E, 5 = high e
  fret: number;
  midi: number;
  pc: number;
  noteName: string;
  degree: string;
  isRoot: boolean;
  layerId: string;
  color: string;
  secondaryColors?: string[];
  secondaryDegrees?: string[];
  outlineOnly?: boolean; // e.g., for "next chord" preview
}

export interface LayerSpec {
  id: string;
  label: string;
  kind: 'scale' | 'chord';
  rootPc: number;
  defId: string;
  color: string;
  minFret: number;
  maxFret: number;
  outlineOnly?: boolean;
}

export function getLayerToneMap(rootPc: number, kind: 'scale' | 'chord', defId: string): Map<number, { degree: string; isRoot: boolean }> {
  const map = new Map<number, { degree: string; isRoot: boolean }>();
  const def = kind === 'scale' ? getScaleById(defId) : getChordById(defId);
  def.intervals.forEach((iv, i) => {
    const pc = (rootPc + iv) % 12;
    if (!map.has(pc)) {
      map.set(pc, { degree: def.degrees[i] ?? '?', isRoot: iv % 12 === 0 });
    }
  });
  return map;
}

export function computeFretboardDots(
  layers: LayerSpec[],
  tuning: GuitarTuning,
  maxFrets = 15,
  useFlatsPref: AccidentalPreference = 'auto'
): FretDot[] {
  const dotMap = new Map<string, FretDot>();

  for (const layer of layers) {
    const toneMap = getLayerToneMap(layer.rootPc, layer.kind, layer.defId);
    const useFlats = shouldUseFlats(layer.rootPc, useFlatsPref);

    for (let s = 0; s < tuning.midiNotes.length; s++) {
      const openMidi = tuning.midiNotes[s];
      for (let f = Math.max(0, layer.minFret); f <= Math.min(maxFrets, layer.maxFret); f++) {
        const midi = openMidi + f;
        const pc = midi % 12;
        const match = toneMap.get(pc);
        if (!match) continue;

        const key = `${s}-${f}`;
        const existing = dotMap.get(key);
        if (!existing) {
          dotMap.set(key, {
            stringIdx: s,
            fret: f,
            midi,
            pc,
            noteName: pcToName(pc, useFlats),
            degree: match.degree,
            isRoot: match.isRoot,
            layerId: layer.id,
            color: layer.color,
            outlineOnly: layer.outlineOnly,
          });
        } else {
          // Merge multiple layers on the same fret position!
          if (!existing.secondaryColors) existing.secondaryColors = [];
          if (!existing.secondaryDegrees) existing.secondaryDegrees = [];
          if (!existing.secondaryColors.includes(layer.color) && existing.color !== layer.color) {
            existing.secondaryColors.push(layer.color);
          }
          existing.secondaryDegrees.push(match.degree);
          if (match.isRoot) existing.isRoot = true;
          if (!layer.outlineOnly) existing.outlineOnly = false;
        }
      }
    }
  }

  return Array.from(dotMap.values());
}

export type VoicingShapeCategory = 'caged' | 'drop2' | 'shell' | 'triad';

export interface ChordVoicing {
  id: string;
  label: string;
  shapeTag: string;
  category: VoicingShapeCategory;
  frets: (number | null)[]; // length = strings, null = muted
  midiNotes: number[];
  baseFret: number;
  span: number;
  hasRootInBass: boolean;
  score: number;
}

/**
 * Generates clean, playable guitar chord voicings across the neck for any root + chord type.
 */
export function generateChordVoicings(
  rootPc: number,
  chordId: string,
  tuning: GuitarTuning = GUITAR_TUNINGS[0]
): ChordVoicing[] {
  const chord = getChordById(chordId);
  const allowedPcs = new Set(chord.intervals.map(iv => (rootPc + iv) % 12));
  const essentialPcs = chord.essentialIndices.map(i => (rootPc + chord.intervals[i]) % 12);
  const numStrings = tuning.midiNotes.length;

  const results: ChordVoicing[] = [];
  const seenKey = new Set<string>();

  // Scan fret windows across the neck (open window + movable 4-fret windows up to fret 14)
  const windows: Array<{ minF: number; maxF: number; allowOpen: boolean }> = [
    { minF: 0, maxF: 4, allowOpen: true },
  ];
  for (let start = 1; start <= 12; start++) {
    windows.push({ minF: start, maxF: start + 3, allowOpen: false });
  }

  for (const win of windows) {
    // Candidate frets per string inside this window
    const candidates: (number | null)[][] = [];
    for (let s = 0; s < numStrings; s++) {
      const opts: (number | null)[] = [null];
      const openMidi = tuning.midiNotes[s];
      if (win.allowOpen && allowedPcs.has(openMidi % 12)) {
        opts.push(0);
      }
      for (let f = Math.max(1, win.minF); f <= win.maxF; f++) {
        if (allowedPcs.has((openMidi + f) % 12)) {
          opts.push(f);
        }
      }
      candidates.push(opts);
    }

    // Backtrack for compact, ergonomic chord shapes (4 to 6 strings, or 3+ for triads/power)
    const minActive = chord.intervals.length <= 2 ? 2 : chord.intervals.length === 3 ? 3 : 4;
    const current: (number | null)[] = new Array(numStrings).fill(null);

    const search = (sIdx: number) => {
      if (sIdx === numStrings) {
        const activeStrings: number[] = [];
        const pcs = new Set<number>();
        const frettedFrets: number[] = [];
        const midis: number[] = [];

        for (let s = 0; s < numStrings; s++) {
          const f = current[s];
          if (f !== null) {
            activeStrings.push(s);
            const m = tuning.midiNotes[s] + f;
            midis.push(m);
            pcs.add(m % 12);
            if (f > 0) frettedFrets.push(f);
          }
        }

        if (activeStrings.length < minActive) return;

        // Check all essential tones are covered
        for (const epc of essentialPcs) {
          if (!pcs.has(epc)) return;
        }

        // Avoid awkward internal muted gaps (at most 1 muted string inside, e.g., Jazz Drop-3)
        const firstS = activeStrings[0];
        const lastS = activeStrings[activeStrings.length - 1];
        const mutedInside = lastS - firstS + 1 - activeStrings.length;
        if (mutedInside > 1) return;

        // Must be playable with 4 fingers (unless barre on lowest fretted note)
        const minF = frettedFrets.length ? Math.min(...frettedFrets) : 0;
        const maxF = frettedFrets.length ? Math.max(...frettedFrets) : 0;
        const span = maxF - minF;
        if (span > 3) return;

        // Count distinct finger positions above potential barre
        const barreCount = frettedFrets.filter(f => f === minF).length;
        const nonBarre = frettedFrets.filter(f => f > minF).length;
        if (barreCount > 1 && nonBarre > 3) return;
        if (barreCount <= 1 && frettedFrets.length > 4) return;

        const key = current.map(f => (f === null ? 'x' : f)).join('-');
        if (seenKey.has(key)) return;
        seenKey.add(key);

        const bassPc = midis[0] % 12;
        const hasRootInBass = bassPc === rootPc;

        // Score ergonomics & musicality
        let score = 0;
        if (hasRootInBass) score += 35;
        if (mutedInside === 0) score += 15;
        if (win.allowOpen && current.some(f => f === 0)) score += 12;
        score += pcs.size * 8;
        score += Math.min(activeStrings.length, 5) * 4;
        score -= span * 4;
        // Prefer standard jazz/pop register (low E/A/D bass)
        if (firstS <= 2) score += 10;

        // Classify musical voicing shape (CAGED, Drop-2, Shell, Triad)
        const numActive = activeStrings.length;
        let category: VoicingShapeCategory = 'caged';
        let shapeTag = 'CAGED';

        if (numActive === 3 && chord.intervals.length >= 4) {
          category = 'shell';
          shapeTag = firstS === 0 ? 'Shell (E-Bass)' : 'Shell (A-Bass)';
        } else if (numActive === 3 && lastS - firstS === 2) {
          category = 'triad';
          shapeTag = `Triad (Saiten ${numStrings - firstS}–${numStrings - lastS})`;
        } else if (numActive === 4 && mutedInside === 0 && firstS >= 1) {
          category = 'drop2';
          shapeTag = firstS === 2 ? 'Drop-2 (D-G-B-e)' : 'Drop-2 (A-D-G-B)';
        } else {
          category = 'caged';
          if (firstS === 0) shapeTag = hasRootInBass ? 'E-Shape' : 'G-Shape';
          else if (firstS === 1) shapeTag = hasRootInBass ? 'A-Shape' : 'C-Shape';
          else if (firstS === 2) shapeTag = 'D-Shape';
          else shapeTag = 'CAGED';
        }

        results.push({
          id: key,
          label: minF === 0 ? 'Offene Lage' : `Lage ${minF}. Bund`,
          shapeTag,
          category,
          frets: [...current],
          midiNotes: midis,
          baseFret: minF,
          span,
          hasRootInBass,
          score,
        });
        return;
      }

      for (const opt of candidates[sIdx]) {
        current[sIdx] = opt;
        search(sIdx + 1);
      }
    };

    search(0);
  }

  // Also explicitly add clean 3-note Jazz Shell Voicings (R-3-7) and 3-String Triads across the neck!
  const addCompactShapes = (stringSets: number[][], cat: VoicingShapeCategory, tagPrefix: string, reqPcs: number[]) => {
    for (const sSet of stringSets) {
      if (sSet.some(s => s >= numStrings)) continue;
      for (let startF = 0; startF <= 12; startF++) {
        const endF = startF + 3;
        const optsPerS = sSet.map(s => {
          const openM = tuning.midiNotes[s];
          const arr: number[] = [];
          if (startF === 0 && reqPcs.includes(openM % 12)) arr.push(0);
          for (let f = Math.max(1, startF); f <= endF; f++) {
            if (reqPcs.includes((openM + f) % 12)) arr.push(f);
          }
          return arr;
        });
        if (optsPerS.some(a => a.length === 0)) continue;
        for (const f0 of optsPerS[0]) {
          for (const f1 of optsPerS[1]) {
            for (const f2 of optsPerS[2]) {
              const m0 = tuning.midiNotes[sSet[0]] + f0;
              const m1 = tuning.midiNotes[sSet[1]] + f1;
              const m2 = tuning.midiNotes[sSet[2]] + f2;
              const pcSet = new Set([m0 % 12, m1 % 12, m2 % 12]);
              if (pcSet.size < Math.min(3, reqPcs.length)) continue;
              if (cat === 'shell' && m0 % 12 !== rootPc) continue;
              const fretted = [f0, f1, f2].filter(f => f > 0);
              const minF = fretted.length ? Math.min(...fretted) : 0;
              const maxF = fretted.length ? Math.max(...fretted) : 0;
              if (maxF - minF > 3) continue;

              const frets: (number | null)[] = new Array(numStrings).fill(null);
              frets[sSet[0]] = f0;
              frets[sSet[1]] = f1;
              frets[sSet[2]] = f2;
              const key = frets.map(f => (f === null ? 'x' : f)).join('-');
              if (seenKey.has(key)) continue;
              seenKey.add(key);

              results.push({
                id: key,
                label: minF === 0 ? 'Offene Lage' : `Bund ${minF}`,
                shapeTag: `${tagPrefix} (${sSet.map(s => numStrings - s).join('-')})`,
                category: cat,
                frets,
                midiNotes: [m0, m1, m2],
                baseFret: minF,
                span: maxF - minF,
                hasRootInBass: m0 % 12 === rootPc,
                score: (m0 % 12 === rootPc ? 60 : 42) - (maxF - minF) * 3,
              });
            }
          }
        }
      }
    }
  };

  if (chord.intervals.length >= 4) {
    const shellPcs = [0, 1, 3].map(i => (rootPc + chord.intervals[i]) % 12);
    addCompactShapes([[0, 2, 3], [1, 2, 3]], 'shell', 'Shell R-3-7', shellPcs);
  }
  if (chord.intervals.length >= 3) {
    const triadPcs = [0, 1, 2].map(i => (rootPc + chord.intervals[i]) % 12);
    addCompactShapes([[3, 4, 5], [2, 3, 4], [1, 2, 3]], 'triad', 'Triad', triadPcs);
  }

  // Group by category + fret region so we get a diverse, musical library across CAGED, Drop-2, Shell & Triads
  results.sort((a, b) => b.score - a.score);
  const picked: ChordVoicing[] = [];
  const usedCatRegion = new Map<string, number>();

  for (const v of results) {
    const region = v.baseFret === 0 ? 0 : Math.floor((v.baseFret + 1) / 3);
    const k = `${v.category}-${region}`;
    const count = usedCatRegion.get(k) ?? 0;
    if (count < 2) {
      picked.push(v);
      usedCatRegion.set(k, count + 1);
    }
    if (picked.length >= 28) break;
  }

  picked.sort((a, b) => a.baseFret - b.baseFret || b.score - a.score);

  return picked.map((v, idx) => ({
    ...v,
    label: `${idx + 1}. ${v.baseFret === 0 ? 'Offen' : `Bund ${v.baseFret}`}${v.hasRootInBass ? '' : ' (Umk.)'}`,
  }));
}

/**
 * Generates an ordered arpeggio path on the fretboard for a single chord,
 * either locked to a fret window or spanning multiple positions.
 */
export function generateChordArpeggioNotes(
  rootPc: number,
  chordId: string,
  tuning: GuitarTuning,
  minFret: number,
  maxFret: number,
  direction: 'up' | 'down' | 'updown' = 'up'
): FretDot[] {
  const toneMap = getLayerToneMap(rootPc, 'chord', chordId);
  const useFlats = shouldUseFlats(rootPc, 'auto');

  const raw: FretDot[] = [];
  for (let s = 0; s < tuning.midiNotes.length; s++) {
    const openMidi = tuning.midiNotes[s];
    for (let f = minFret; f <= maxFret; f++) {
      const midi = openMidi + f;
      const pc = midi % 12;
      const match = toneMap.get(pc);
      if (match) {
        raw.push({
          stringIdx: s,
          fret: f,
          midi,
          pc,
          noteName: pcToName(pc, useFlats),
          degree: match.degree,
          isRoot: match.isRoot,
          layerId: 'arp',
          color: '#06b6d4',
        });
      }
    }
  }

  // Deduplicate identical MIDI pitches, preferring the dot closest to the center of the fret window
  const midFret = (minFret + maxFret) / 2;
  const byMidi = new Map<number, FretDot>();
  for (const d of raw) {
    const prev = byMidi.get(d.midi);
    if (!prev || Math.abs(d.fret - midFret) < Math.abs(prev.fret - midFret)) {
      byMidi.set(d.midi, d);
    }
  }

  let sorted = Array.from(byMidi.values()).sort((a, b) => a.midi - b.midi);

  // Start from the lowest root if available for musical phrasing
  const firstRootIdx = sorted.findIndex(d => d.isRoot);
  if (firstRootIdx > 0 && sorted.length - firstRootIdx >= 4) {
    sorted = sorted.slice(firstRootIdx);
  }

  // Cap at ~12 notes so a multi-position run stays snappy and musical
  if (sorted.length > 12) {
    sorted = sorted.slice(0, 12);
  }

  if (direction === 'down') {
    return [...sorted].reverse();
  }
  if (direction === 'updown' && sorted.length > 1) {
    return [...sorted, ...sorted.slice(1, -1).reverse()];
  }
  return sorted;
}

/**
 * Generates piano MIDI notes for a chord in a comfortable middle register (C3–C5).
 */
export function getPianoChordMidi(rootPc: number, chordId: string, baseOctave = 3): number[] {
  const chord = getChordById(chordId);
  let baseMidi = (baseOctave + 1) * 12 + rootPc;
  if (baseMidi > 60) baseMidi -= 12; // keep voicings warm near C3-B3
  return chord.intervals.map(iv => baseMidi + iv);
}

// Circle of Fifths ordered clockwise starting at 12 o'clock (C)
export interface CircleKeyEntry {
  majorPc: number;
  majorName: string;
  minorPc: number;
  minorName: string;
  sharpsFlats: string;
}

export const CIRCLE_OF_FIFTHS: CircleKeyEntry[] = [
  { majorPc: 0, majorName: 'C', minorPc: 9, minorName: 'Am', sharpsFlats: '0' },
  { majorPc: 7, majorName: 'G', minorPc: 4, minorName: 'Em', sharpsFlats: '1♯' },
  { majorPc: 2, majorName: 'D', minorPc: 11, minorName: 'Bm', sharpsFlats: '2♯' },
  { majorPc: 9, majorName: 'A', minorPc: 6, minorName: 'F#m', sharpsFlats: '3♯' },
  { majorPc: 4, majorName: 'E', minorPc: 1, minorName: 'C#m', sharpsFlats: '4♯' },
  { majorPc: 11, majorName: 'B', minorPc: 8, minorName: 'G#m', sharpsFlats: '5♯' },
  { majorPc: 6, majorName: 'Gb', minorPc: 3, minorName: 'Ebm', sharpsFlats: '6♭/6♯' },
  { majorPc: 1, majorName: 'Db', minorPc: 10, minorName: 'Bbm', sharpsFlats: '5♭' },
  { majorPc: 8, majorName: 'Ab', minorPc: 5, minorName: 'Fm', sharpsFlats: '4♭' },
  { majorPc: 3, majorName: 'Eb', minorPc: 0, minorName: 'Cm', sharpsFlats: '3♭' },
  { majorPc: 10, majorName: 'Bb', minorPc: 7, minorName: 'Gm', sharpsFlats: '2♭' },
  { majorPc: 5, majorName: 'F', minorPc: 2, minorName: 'Dm', sharpsFlats: '1♭' },
];

export interface DiatonicChordInfo {
  degree: number; // 1..7
  romanTriad: string;
  romanSeventh: string;
  rootPc: number;
  triadId: string;
  seventhId: string;
  triadName: string;
  seventhName: string;
  functionLabel: 'Tonika' | 'Subdominante' | 'Dominante';
  circleIndex: number; // 0..11 in CIRCLE_OF_FIFTHS
  ring: 'outer' | 'inner' | 'dim';
}

export function getDiatonicChords(majorKeyCircleIndex: number): DiatonicChordInfo[] {
  const entry = CIRCLE_OF_FIFTHS[((majorKeyCircleIndex % 12) + 12) % 12];
  const root = entry.majorPc;
  const useFlats = FLAT_KEYS.has(root);

  const specs: Array<{
    degree: number;
    offset: number;
    romanTriad: string;
    romanSeventh: string;
    triadId: string;
    seventhId: string;
    fn: 'Tonika' | 'Subdominante' | 'Dominante';
    circleDelta: number;
    ring: 'outer' | 'inner' | 'dim';
  }> = [
    { degree: 1, offset: 0, romanTriad: 'I', romanSeventh: 'Imaj7', triadId: 'maj', seventhId: 'maj7', fn: 'Tonika', circleDelta: 0, ring: 'outer' },
    { degree: 2, offset: 2, romanTriad: 'ii', romanSeventh: 'iim7', triadId: 'min', seventhId: 'm7', fn: 'Subdominante', circleDelta: -1, ring: 'inner' },
    { degree: 3, offset: 4, romanTriad: 'iii', romanSeventh: 'iiim7', triadId: 'min', seventhId: 'm7', fn: 'Tonika', circleDelta: 1, ring: 'inner' },
    { degree: 4, offset: 5, romanTriad: 'IV', romanSeventh: 'IVmaj7', triadId: 'maj', seventhId: 'maj7', fn: 'Subdominante', circleDelta: -1, ring: 'outer' },
    { degree: 5, offset: 7, romanTriad: 'V', romanSeventh: 'V7', triadId: 'maj', seventhId: '7', fn: 'Dominante', circleDelta: 1, ring: 'outer' },
    { degree: 6, offset: 9, romanTriad: 'vi', romanSeventh: 'vim7', triadId: 'min', seventhId: 'm7', fn: 'Tonika', circleDelta: 0, ring: 'inner' },
    { degree: 7, offset: 11, romanTriad: 'vii°', romanSeventh: 'viim7b5', triadId: 'dim', seventhId: 'm7b5', fn: 'Dominante', circleDelta: 2, ring: 'dim' },
  ];

  return specs.map(s => {
    const cRoot = (root + s.offset) % 12;
    const cIdx = (majorKeyCircleIndex + s.circleDelta + 12) % 12;
    return {
      degree: s.degree,
      romanTriad: s.romanTriad,
      romanSeventh: s.romanSeventh,
      rootPc: cRoot,
      triadId: s.triadId,
      seventhId: s.seventhId,
      triadName: formatChordName(cRoot, s.triadId, useFlats),
      seventhName: formatChordName(cRoot, s.seventhId, useFlats),
      functionLabel: s.fn,
      circleIndex: cIdx,
      ring: s.ring,
    };
  });
}

/**
 * Detects a chord name from a set of simultaneously played MIDI notes (e.g., from a Web MIDI keyboard).
 */
export function identifyChordFromMidis(midis: number[]): string | null {
  if (midis.length < 2) return null;
  const sorted = [...midis].sort((a, b) => a - b);
  const uniquePcs = Array.from(new Set(sorted.map(m => ((m % 12) + 12) % 12)));
  if (uniquePcs.length < 2) return null;

  const bassPc = sorted[0] % 12;
  let bestMatch: { name: string; score: number } | null = null;

  for (const candidateRoot of uniquePcs) {
    const relSet = new Set(uniquePcs.map(pc => (pc - candidateRoot + 12) % 12));
    for (const chord of CHORDS) {
      const chordRel = new Set(chord.intervals.map(iv => iv % 12));
      // Check if all played pitch classes belong to this chord AND all essential tones are present
      let allFit = true;
      for (const r of relSet) {
        if (!chordRel.has(r)) {
          allFit = false;
          break;
        }
      }
      if (!allFit) continue;

      let essentialHit = 0;
      for (const idx of chord.essentialIndices) {
        if (relSet.has(chord.intervals[idx] % 12)) essentialHit++;
      }
      if (essentialHit < chord.essentialIndices.length) continue;

      let score = relSet.size * 20 - Math.abs(chordRel.size - relSet.size) * 8;
      if (candidateRoot === bassPc) score += 25;
      const slash = candidateRoot !== bassPc ? `/${pcToName(bassPc)}` : '';
      const name = `${formatChordName(candidateRoot, chord.id)}${slash}`;
      if (!bestMatch || score > bestMatch.score) {
        bestMatch = { name, score };
      }
    }
  }

  return bestMatch?.name ?? null;
}

/**
 * Smooth Voice-Leading Chord Voicing Generator for natural, close-position playback!
 * Keeps a warm bass note in E2–E3 and packs upper chord voices closely around a target center (C4)
 * while minimizing total semitone movement from the previous chord's upper voices.
 */
export function getVoiceLedChordMidi(
  rootPc: number,
  chordId: string,
  prevUpperVoices: number[] | null = null
): { allNotes: number[]; upperVoices: number[]; bassNote: number } {
  const chord = getChordById(chordId);

  // Warm bass note in E2 (40) .. Eb3 (51)
  let bassNote = 48 + rootPc;
  if (bassNote > 51) bassNote -= 12;
  if (bassNote < 40) bassNote += 12;

  // Target center for close comping voices (around B3 / C4 = MIDI 59..61)
  const targetCenter =
    prevUpperVoices && prevUpperVoices.length > 0
      ? prevUpperVoices.reduce((s, n) => s + n, 0) / prevUpperVoices.length
      : 61;

  // Unique pitch classes for upper voices (for 5-note chords drop the 5th for clean jazz voicing)
  let pcs = chord.intervals.map(iv => (rootPc + iv) % 12);
  if (pcs.length >= 5) {
    const fifthPc = (rootPc + 7) % 12;
    pcs = pcs.filter((pc, idx) => idx === 0 || pc !== fifthPc);
  }
  const uniquePcs = Array.from(new Set(pcs));

  // Place each pitch class in the octave closest to either a matching prev voice or the target center
  const prevSet = new Set(prevUpperVoices ?? []);
  const placed: number[] = [];

  for (const pc of uniquePcs) {
    // Candidate pitches in comfortable close comping register (E3=52 .. F5=77)
    const candidates: number[] = [];
    for (let oct = 3; oct <= 5; oct++) {
      const m = (oct + 1) * 12 + pc;
      if (m >= 52 && m <= 75) candidates.push(m);
    }
    if (candidates.length === 0) candidates.push(60 + pc);

    // Score each candidate: huge bonus if it matches a common tone from prev chord, otherwise closest to prev voices / center
    let bestMidi = candidates[0];
    let bestCost = Infinity;

    for (const cand of candidates) {
      let cost = Math.abs(cand - targetCenter) * 0.7;
      if (prevSet.has(cand)) {
        cost -= 18; // Keep common tones glued!
      } else if (prevUpperVoices && prevUpperVoices.length > 0) {
        const minDistToPrev = Math.min(...prevUpperVoices.map(p => Math.abs(p - cand)));
        cost += minDistToPrev * 1.4;
      }
      // Slight penalty if too high (>71) or too low (<54)
      if (cand > 71) cost += (cand - 71) * 1.5;
      if (cand < 54) cost += (54 - cand) * 1.5;

      if (cost < bestCost) {
        bestCost = cost;
        bestMidi = cand;
      }
    }
    placed.push(bestMidi);
  }

  placed.sort((a, b) => a - b);

  // Prevent overly wide spread (> 13 semitones) by folding outer note inward if needed
  if (placed.length >= 3 && placed[placed.length - 1] - placed[0] > 14) {
    const lowest = placed[0];
    if (lowest + 12 <= 74) {
      placed[0] = lowest + 12;
      placed.sort((a, b) => a - b);
    }
  }

  return {
    bassNote,
    upperVoices: placed,
    allNotes: [bassNote, ...placed],
  };
}

/**
 * Secondary Dominant (V7/x) & Related Secondary ii (ii/x) harmony for the Circle of Fifths.
 */
export interface SecondaryPairInfo {
  targetDegree: string; // e.g., 'ii', 'iii', 'IV', 'V', 'vi'
  targetChordName: string;
  secIiRoman: string;
  secIiRootPc: number;
  secIiChordId: string;
  secIiName: string;
  secIiCircleIdx: number;
  secVRoman: string;
  secVRootPc: number;
  secVChordId: string;
  secVName: string;
  secVCircleIdx: number;
}

export function getSecondaryDominants(majorKeyCircleIndex: number): SecondaryPairInfo[] {
  const entry = CIRCLE_OF_FIFTHS[((majorKeyCircleIndex % 12) + 12) % 12];
  const keyRoot = entry.majorPc;
  const useFlats = FLAT_KEYS.has(keyRoot);

  // Targets: ii, iii, IV, V, vi
  const targets: Array<{
    label: string;
    offset: number;
    targetChordId: string;
    isMinorTarget: boolean;
  }> = [
    { label: 'ii', offset: 2, targetChordId: 'm7', isMinorTarget: true },
    { label: 'iii', offset: 4, targetChordId: 'm7', isMinorTarget: true },
    { label: 'IV', offset: 5, targetChordId: 'maj7', isMinorTarget: false },
    { label: 'V', offset: 7, targetChordId: '7', isMinorTarget: false },
    { label: 'vi', offset: 9, targetChordId: 'm7', isMinorTarget: true },
  ];

  const pcToCircleIdx = (pc: number) =>
    CIRCLE_OF_FIFTHS.findIndex(c => c.majorPc === ((pc % 12) + 12) % 12);

  return targets.map(t => {
    const targetRoot = (keyRoot + t.offset) % 12;
    const secVRoot = (targetRoot + 7) % 12; // fifth above target
    const secIiRoot = (targetRoot + 2) % 12; // second above target (fifth above V/x)
    const secIiId = t.isMinorTarget ? 'm7b5' : 'm7';
    const secVId = '7';

    return {
      targetDegree: t.label,
      targetChordName: formatChordName(targetRoot, t.targetChordId, useFlats),
      secIiRoman: `${t.isMinorTarget ? 'iiø' : 'ii'}/${t.label}`,
      secIiRootPc: secIiRoot,
      secIiChordId: secIiId,
      secIiName: formatChordName(secIiRoot, secIiId, useFlats),
      secIiCircleIdx: pcToCircleIdx(secIiRoot),
      secVRoman: `V7/${t.label}`,
      secVRootPc: secVRoot,
      secVChordId: secVId,
      secVName: formatChordName(secVRoot, secVId, useFlats),
      secVCircleIdx: pcToCircleIdx(secVRoot),
    };
  });
}

/**
 * Boomwhacker / Chroma-Notes Kids Color Notation Standard (for colored piano stickers!)
 * C = Red, D = Orange, E = Yellow, F = Light Green, G = Teal/Dark Green, A = Blue/Indigo, B/H = Violet
 */
export const CHROMA_NOTES_COLORS: Record<number, { hex: string; nameDe: string }> = {
  0: { hex: '#ef4444', nameDe: 'C (Rot)' },
  1: { hex: '#f43f5e', nameDe: 'C# (Koralle)' },
  2: { hex: '#f97316', nameDe: 'D (Orange)' },
  3: { hex: '#fb923c', nameDe: 'D# (Hellorange)' },
  4: { hex: '#eab308', nameDe: 'E (Gelb)' },
  5: { hex: '#22c55e', nameDe: 'F (Hellgrün)' },
  6: { hex: '#10b981', nameDe: 'F# (Smaragd)' },
  7: { hex: '#0d9488', nameDe: 'G (Türkis)' },
  8: { hex: '#06b6d4', nameDe: 'G# (Cyan)' },
  9: { hex: '#3b82f6', nameDe: 'A (Blau)' },
  10: { hex: '#6366f1', nameDe: 'A# (Indigo)' },
  11: { hex: '#9333ea', nameDe: 'H/B (Violett)' },
};
