import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Play,
  Square,
  Plus,
  Trash2,
  Repeat,
  RefreshCw,
  Compass,
  Guitar,
  Piano,
  Save,
  Bookmark,
  Sliders,
  Volume2,
  Music2,
  TrendingUp,
} from 'lucide-react';
import {
  CHORDS,
  GUITAR_TUNINGS,
  getNoteNamesArray,
  LayerSpec,
  FretDot,
  VoicingShapeCategory,
  computeFretboardDots,
  formatChordName,
  generateChordVoicings,
  getChordById,
  getLayerToneMap,
  getVoiceLedChordMidi,
  getCagedPositionsForRoot,
  get3NpsPositionsForRoot,
  pcToName,
  shouldUseFlats,
} from '../theory/musicTheory';
import { FretboardSVG, FretPositionFrame } from '../components/FretboardSVG';
import { PianoKeyboardSVG, PianoKeyHighlight } from '../components/PianoKeyboardSVG';
import { ClassicalStaffSVG } from '../components/ClassicalStaffSVG';
import { audioEngine, InstrumentTimbre } from '../audio/audioEngine';
import {
  PRESET_KEYS,
  SavedPreset,
  deleteUserPreset,
  loadUserPresets,
  saveUserPreset,
} from '../utils/storage';

export interface ProgressionChordStep {
  id: string;
  degreeOffset: number;
  chordId: string;
  beats: number;
}

interface ProgressionPreset {
  id: string;
  name: string;
  genre: string;
  bpm: number;
  chords: Array<{ degreeOffset: number; chordId: string; beats: number }>;
}

const PROGRESSION_PRESETS: ProgressionPreset[] = [
  {
    id: 'ii_v_i',
    name: 'Jazz ii–V–I (Major)',
    genre: 'Jazz',
    bpm: 112,
    chords: [
      { degreeOffset: 2, chordId: 'm7', beats: 4 },
      { degreeOffset: 7, chordId: '7', beats: 4 },
      { degreeOffset: 0, chordId: 'maj7', beats: 8 },
    ],
  },
  {
    id: 'minor_ii_v_i',
    name: 'Moll iiø–V7b9–im7',
    genre: 'Jazz',
    bpm: 106,
    chords: [
      { degreeOffset: 2, chordId: 'm7b5', beats: 4 },
      { degreeOffset: 7, chordId: '7b9', beats: 4 },
      { degreeOffset: 0, chordId: 'm7', beats: 8 },
    ],
  },
  {
    id: 'jazz_turnaround',
    name: 'Rhythm Changes / I–vi–ii–V',
    genre: 'Jazz',
    bpm: 124,
    chords: [
      { degreeOffset: 0, chordId: 'maj7', beats: 2 },
      { degreeOffset: 9, chordId: 'm7', beats: 2 },
      { degreeOffset: 2, chordId: 'm7', beats: 2 },
      { degreeOffset: 7, chordId: '7', beats: 2 },
    ],
  },
  {
    id: 'jazz_blues',
    name: 'Jazz Blues (12-Bar Standard)',
    genre: 'Jazz',
    bpm: 118,
    chords: [
      { degreeOffset: 0, chordId: '7', beats: 4 },
      { degreeOffset: 5, chordId: '7', beats: 4 },
      { degreeOffset: 0, chordId: '7', beats: 4 },
      { degreeOffset: 7, chordId: 'm7', beats: 2 },
      { degreeOffset: 0, chordId: '7', beats: 2 },
      { degreeOffset: 5, chordId: '7', beats: 4 },
      { degreeOffset: 6, chordId: 'dim7', beats: 4 },
      { degreeOffset: 0, chordId: 'maj7', beats: 4 },
      { degreeOffset: 9, chordId: '7', beats: 4 },
      { degreeOffset: 2, chordId: 'm7', beats: 4 },
      { degreeOffset: 7, chordId: '7', beats: 4 },
      { degreeOffset: 0, chordId: '7', beats: 2 },
      { degreeOffset: 9, chordId: '7', beats: 2 },
      { degreeOffset: 2, chordId: 'm7', beats: 2 },
      { degreeOffset: 7, chordId: '7', beats: 2 },
    ],
  },
  {
    id: 'autumn_leaves',
    name: 'Autumn Leaves (IV–VII–iii–vi)',
    genre: 'Jazz',
    bpm: 120,
    chords: [
      { degreeOffset: 2, chordId: 'm7', beats: 4 },
      { degreeOffset: 7, chordId: '7', beats: 4 },
      { degreeOffset: 0, chordId: 'maj7', beats: 4 },
      { degreeOffset: 5, chordId: 'maj7', beats: 4 },
      { degreeOffset: 11, chordId: 'm7b5', beats: 4 },
      { degreeOffset: 4, chordId: '7', beats: 4 },
      { degreeOffset: 9, chordId: 'm7', beats: 8 },
    ],
  },
  {
    id: 'blue_bossa',
    name: 'Blue Bossa (Moll + bII Modulation)',
    genre: 'Latin / Jazz',
    bpm: 124,
    chords: [
      { degreeOffset: 0, chordId: 'm7', beats: 8 },
      { degreeOffset: 5, chordId: 'm7', beats: 8 },
      { degreeOffset: 2, chordId: 'm7b5', beats: 4 },
      { degreeOffset: 7, chordId: '7b9', beats: 4 },
      { degreeOffset: 0, chordId: 'm7', beats: 8 },
      { degreeOffset: 3, chordId: 'm7', beats: 4 },
      { degreeOffset: 8, chordId: '7', beats: 4 },
      { degreeOffset: 1, chordId: 'maj7', beats: 8 },
    ],
  },
  {
    id: 'all_the_things',
    name: 'All The Things (Quartenzirkel)',
    genre: 'Jazz',
    bpm: 116,
    chords: [
      { degreeOffset: 9, chordId: 'm7', beats: 4 },
      { degreeOffset: 2, chordId: 'm7', beats: 4 },
      { degreeOffset: 7, chordId: '7', beats: 4 },
      { degreeOffset: 0, chordId: 'maj7', beats: 4 },
      { degreeOffset: 5, chordId: 'maj7', beats: 4 },
      { degreeOffset: 2, chordId: '7', beats: 4 },
      { degreeOffset: 7, chordId: 'maj7', beats: 8 },
    ],
  },
  {
    id: 'coltrane_changes',
    name: 'Coltrane Matrix (Giant Steps)',
    genre: 'Jazz',
    bpm: 130,
    chords: [
      { degreeOffset: 0, chordId: 'maj7', beats: 2 },
      { degreeOffset: 3, chordId: '7', beats: 2 },
      { degreeOffset: 8, chordId: 'maj7', beats: 2 },
      { degreeOffset: 11, chordId: '7', beats: 2 },
      { degreeOffset: 4, chordId: 'maj7', beats: 4 },
      { degreeOffset: 9, chordId: 'm7', beats: 2 },
      { degreeOffset: 2, chordId: '7', beats: 2 },
    ],
  },
  {
    id: 'neosoul_iv_iii_ii_i',
    name: 'Neo-Soul Smooth (IV–iii–ii–I)',
    genre: 'Neo-Soul',
    bpm: 82,
    chords: [
      { degreeOffset: 5, chordId: 'maj9', beats: 4 },
      { degreeOffset: 4, chordId: 'm9', beats: 4 },
      { degreeOffset: 2, chordId: 'm11', beats: 4 },
      { degreeOffset: 0, chordId: 'maj9', beats: 4 },
    ],
  },
  {
    id: 'just_the_two',
    name: 'Just The Two Of Us / Royal Road',
    genre: 'Neo-Soul / R&B',
    bpm: 92,
    chords: [
      { degreeOffset: 5, chordId: 'maj7', beats: 4 },
      { degreeOffset: 4, chordId: '7', beats: 4 },
      { degreeOffset: 9, chordId: 'm7', beats: 4 },
      { degreeOffset: 7, chordId: 'm7', beats: 2 },
      { degreeOffset: 0, chordId: '7', beats: 2 },
    ],
  },
  {
    id: 'gospel_backdoor',
    name: 'Gospel Backdoor (Imaj7–iv7–bVII7)',
    genre: 'Neo-Soul / Gospel',
    bpm: 86,
    chords: [
      { degreeOffset: 0, chordId: 'maj9', beats: 4 },
      { degreeOffset: 5, chordId: 'm9', beats: 4 },
      { degreeOffset: 10, chordId: '13', beats: 4 },
      { degreeOffset: 0, chordId: 'maj9', beats: 4 },
    ],
  },
  {
    id: 'sunny_soul',
    name: 'Sunny (Minor Soul Classic)',
    genre: 'Soul / Funk',
    bpm: 112,
    chords: [
      { degreeOffset: 0, chordId: 'm7', beats: 4 },
      { degreeOffset: 3, chordId: '7', beats: 4 },
      { degreeOffset: 8, chordId: 'maj7', beats: 4 },
      { degreeOffset: 2, chordId: 'm7b5', beats: 2 },
      { degreeOffset: 7, chordId: '7b9', beats: 2 },
    ],
  },
  {
    id: 'funk_dorian',
    name: 'Funk Dorian Vamp (i9–IV13)',
    genre: 'Funk',
    bpm: 102,
    chords: [
      { degreeOffset: 0, chordId: 'm9', beats: 4 },
      { degreeOffset: 5, chordId: '13', beats: 4 },
    ],
  },
  {
    id: 'so_what_modal',
    name: 'Modal Dorian (So What: im11–biim11)',
    genre: 'Modal Jazz',
    bpm: 118,
    chords: [
      { degreeOffset: 0, chordId: 'm11', beats: 8 },
      { degreeOffset: 1, chordId: 'm11', beats: 8 },
    ],
  },
  {
    id: 'blues_12bar',
    name: '12-Bar Blues (I7–IV7–V7)',
    genre: 'Blues',
    bpm: 98,
    chords: [
      { degreeOffset: 0, chordId: '7', beats: 4 },
      { degreeOffset: 5, chordId: '7', beats: 4 },
      { degreeOffset: 0, chordId: '7', beats: 8 },
      { degreeOffset: 5, chordId: '7', beats: 8 },
      { degreeOffset: 0, chordId: '7', beats: 8 },
      { degreeOffset: 7, chordId: '7', beats: 4 },
      { degreeOffset: 5, chordId: '7', beats: 4 },
      { degreeOffset: 0, chordId: '7', beats: 4 },
      { degreeOffset: 7, chordId: '7', beats: 4 },
    ],
  },
  {
    id: 'pop_axis',
    name: 'Pop / Rock Axis (I–V–vi–IV)',
    genre: 'Pop / Rock',
    bpm: 105,
    chords: [
      { degreeOffset: 0, chordId: 'maj', beats: 4 },
      { degreeOffset: 7, chordId: 'maj', beats: 4 },
      { degreeOffset: 9, chordId: 'min', beats: 4 },
      { degreeOffset: 5, chordId: 'maj', beats: 4 },
    ],
  },
  {
    id: 'doowop_50s',
    name: '50s Ballade / Doo-Wop (I–vi–IV–V)',
    genre: 'Pop / Soul',
    bpm: 92,
    chords: [
      { degreeOffset: 0, chordId: 'maj', beats: 4 },
      { degreeOffset: 9, chordId: 'min', beats: 4 },
      { degreeOffset: 5, chordId: 'maj', beats: 4 },
      { degreeOffset: 7, chordId: '7', beats: 4 },
    ],
  },
  {
    id: 'pachelbel',
    name: 'Pachelbel Kanon (I–V–vi–iii–IV–I–IV–V)',
    genre: 'Klassik / Pop',
    bpm: 90,
    chords: [
      { degreeOffset: 0, chordId: 'maj', beats: 4 },
      { degreeOffset: 7, chordId: 'maj', beats: 4 },
      { degreeOffset: 9, chordId: 'min', beats: 4 },
      { degreeOffset: 4, chordId: 'min', beats: 4 },
      { degreeOffset: 5, chordId: 'maj', beats: 4 },
      { degreeOffset: 0, chordId: 'maj', beats: 4 },
      { degreeOffset: 5, chordId: 'maj', beats: 4 },
      { degreeOffset: 7, chordId: 'maj', beats: 4 },
    ],
  },
  {
    id: 'creep_chromatic',
    name: 'Chromatischer Klassiker (I–III–IV–iv)',
    genre: 'Rock / Indie',
    bpm: 92,
    chords: [
      { degreeOffset: 0, chordId: 'maj', beats: 4 },
      { degreeOffset: 4, chordId: 'maj', beats: 4 },
      { degreeOffset: 5, chordId: 'maj', beats: 4 },
      { degreeOffset: 5, chordId: 'min', beats: 4 },
    ],
  },
  {
    id: 'lydian_dream',
    name: 'Lydian Dream (Imaj7–II7)',
    genre: 'Fusion / Film',
    bpm: 96,
    chords: [
      { degreeOffset: 0, chordId: 'maj7', beats: 8 },
      { degreeOffset: 2, chordId: '7', beats: 8 },
    ],
  },
  {
    id: 'andalusian',
    name: 'Andalusische Kadenz (im–bVII–bVI–V7)',
    genre: 'Flamenco / Rock',
    bpm: 110,
    chords: [
      { degreeOffset: 0, chordId: 'min', beats: 4 },
      { degreeOffset: 10, chordId: 'maj', beats: 4 },
      { degreeOffset: 8, chordId: 'maj', beats: 4 },
      { degreeOffset: 7, chordId: '7', beats: 4 },
    ],
  },
  {
    id: 'bluegrass_g',
    name: 'Bluegrass Classic (I–IV–I–V)',
    genre: 'Bluegrass',
    bpm: 132,
    chords: [
      { degreeOffset: 0, chordId: 'maj', beats: 4 },
      { degreeOffset: 5, chordId: 'maj', beats: 4 },
      { degreeOffset: 0, chordId: 'maj', beats: 4 },
      { degreeOffset: 7, chordId: '7', beats: 4 },
    ],
  },
  {
    id: 'bossa',
    name: 'Bossa Nova (Imaj7–II9–iim7–bII7)',
    genre: 'Latin / Jazz',
    bpm: 116,
    chords: [
      { degreeOffset: 0, chordId: 'maj7', beats: 8 },
      { degreeOffset: 2, chordId: '9', beats: 8 },
      { degreeOffset: 2, chordId: 'm7', beats: 4 },
      { degreeOffset: 1, chordId: '7', beats: 4 },
    ],
  },

  // --- LINE CLICHÉS ---
  {
    id: 'line_cliche_minor_bond',
    name: 'Minor Line Cliché (My Funny Valentine / Bond: im–imMaj7–im7–im6)',
    genre: 'Line Cliché',
    bpm: 88,
    chords: [
      { degreeOffset: 0, chordId: 'min', beats: 4 },
      { degreeOffset: 0, chordId: 'mMaj7', beats: 4 },
      { degreeOffset: 0, chordId: 'm7', beats: 4 },
      { degreeOffset: 0, chordId: 'm6', beats: 4 },
    ],
  },
  {
    id: 'line_cliche_stairway_resolve',
    name: 'Minor Line Cliché + Kadenz (im–imMaj7–im7–im6–bVImaj7–iiø7–V7b9)',
    genre: 'Line Cliché',
    bpm: 92,
    chords: [
      { degreeOffset: 0, chordId: 'min', beats: 4 },
      { degreeOffset: 0, chordId: 'mMaj7', beats: 4 },
      { degreeOffset: 0, chordId: 'm7', beats: 4 },
      { degreeOffset: 0, chordId: 'm6', beats: 4 },
      { degreeOffset: 8, chordId: 'maj7', beats: 4 },
      { degreeOffset: 2, chordId: 'm7b5', beats: 2 },
      { degreeOffset: 7, chordId: '7b9', beats: 2 },
    ],
  },
  {
    id: 'line_cliche_major_something',
    name: 'Major Line Cliché (Something / Beatles: I–Imaj7–I7–IV–iv)',
    genre: 'Line Cliché',
    bpm: 84,
    chords: [
      { degreeOffset: 0, chordId: 'maj', beats: 4 },
      { degreeOffset: 0, chordId: 'maj7', beats: 4 },
      { degreeOffset: 0, chordId: '7', beats: 4 },
      { degreeOffset: 5, chordId: 'maj7', beats: 4 },
      { degreeOffset: 5, chordId: 'm7', beats: 4 },
      { degreeOffset: 0, chordId: 'maj9', beats: 4 },
    ],
  },
  {
    id: 'line_cliche_ascending_aug',
    name: 'Ascending Line Cliché (I–I+–I6–I7–IVmaj7–#iv°7–I–V7)',
    genre: 'Line Cliché',
    bpm: 96,
    chords: [
      { degreeOffset: 0, chordId: 'maj', beats: 4 },
      { degreeOffset: 0, chordId: 'aug', beats: 4 },
      { degreeOffset: 0, chordId: '6', beats: 4 },
      { degreeOffset: 0, chordId: '7', beats: 4 },
      { degreeOffset: 5, chordId: 'maj7', beats: 4 },
      { degreeOffset: 6, chordId: 'dim7', beats: 4 },
      { degreeOffset: 0, chordId: 'maj7', beats: 4 },
      { degreeOffset: 7, chordId: '13', beats: 4 },
    ],
  },

  // --- GOSPEL WALK-UP & WALK-DOWN ---
  {
    id: 'gospel_chromatic_walkup',
    name: 'Gospel Chromatic Walk-Up (I–#i°7–ii7–#ii°7–iii7–VI7b9–ii9–V13)',
    genre: 'Gospel',
    bpm: 86,
    chords: [
      { degreeOffset: 0, chordId: 'maj9', beats: 2 },
      { degreeOffset: 1, chordId: 'dim7', beats: 2 },
      { degreeOffset: 2, chordId: 'm9', beats: 2 },
      { degreeOffset: 3, chordId: 'dim7', beats: 2 },
      { degreeOffset: 4, chordId: 'm7', beats: 4 },
      { degreeOffset: 9, chordId: '7b9', beats: 4 },
      { degreeOffset: 2, chordId: 'm9', beats: 4 },
      { degreeOffset: 7, chordId: '13', beats: 4 },
    ],
  },
  {
    id: 'gospel_walkup_4_sharp4',
    name: 'Gospel IV–#iv°7–I–vi–ii–V Walk-Up (Church Standard)',
    genre: 'Gospel',
    bpm: 82,
    chords: [
      { degreeOffset: 0, chordId: 'maj9', beats: 4 },
      { degreeOffset: 4, chordId: 'm7', beats: 2 },
      { degreeOffset: 5, chordId: 'maj9', beats: 2 },
      { degreeOffset: 6, chordId: 'dim7', beats: 2 },
      { degreeOffset: 0, chordId: '6', beats: 2 },
      { degreeOffset: 9, chordId: 'm9', beats: 4 },
      { degreeOffset: 2, chordId: 'm9', beats: 4 },
      { degreeOffset: 7, chordId: '9sus4', beats: 4 },
    ],
  },
  {
    id: 'gospel_walkdown_classic',
    name: 'Gospel Walk-Down (I–V7–vi9–v9–I13–IVmaj9–ivm9–I)',
    genre: 'Gospel',
    bpm: 80,
    chords: [
      { degreeOffset: 0, chordId: 'maj9', beats: 4 },
      { degreeOffset: 7, chordId: '9', beats: 2 },
      { degreeOffset: 9, chordId: 'm9', beats: 2 },
      { degreeOffset: 7, chordId: 'm9', beats: 2 },
      { degreeOffset: 0, chordId: '13', beats: 2 },
      { degreeOffset: 5, chordId: 'maj9', beats: 4 },
      { degreeOffset: 5, chordId: 'm9', beats: 4 },
      { degreeOffset: 0, chordId: 'maj9', beats: 4 },
    ],
  },
  {
    id: 'gospel_736251',
    name: 'Gospel 7–3–6–2–5–1 Church Chain (viiø7–III7alt–vi9–ii9–V9sus4–I)',
    genre: 'Gospel',
    bpm: 84,
    chords: [
      { degreeOffset: 11, chordId: 'm7b5', beats: 2 },
      { degreeOffset: 4, chordId: '7alt', beats: 2 },
      { degreeOffset: 9, chordId: 'm9', beats: 4 },
      { degreeOffset: 2, chordId: 'm9', beats: 2 },
      { degreeOffset: 7, chordId: '9sus4', beats: 2 },
      { degreeOffset: 0, chordId: 'maj9', beats: 4 },
    ],
  },

  // --- JAZZIGE PROGRESSIONEN MIT SEKUNDÄREN ii-V-I ---
  {
    id: 'jazz_take_a_train',
    name: "Take the 'A' Train (Imaj7–II7#11–ii7–V13–Sek. ii–V zu IV)",
    genre: 'Jazz (Sek. ii-V)',
    bpm: 144,
    chords: [
      { degreeOffset: 0, chordId: 'maj7', beats: 8 },
      { degreeOffset: 2, chordId: '7sharp11', beats: 8 },
      { degreeOffset: 2, chordId: 'm7', beats: 4 },
      { degreeOffset: 7, chordId: '13', beats: 4 },
      { degreeOffset: 0, chordId: 'maj7', beats: 4 },
      { degreeOffset: 7, chordId: 'm7', beats: 2 },
      { degreeOffset: 0, chordId: '7', beats: 2 },
      { degreeOffset: 5, chordId: 'maj7', beats: 8 },
      { degreeOffset: 2, chordId: '7', beats: 4 },
      { degreeOffset: 2, chordId: 'm7', beats: 2 },
      { degreeOffset: 7, chordId: '7b9', beats: 2 },
    ],
  },
  {
    id: 'jazz_wave_bossa',
    name: 'Wave – Jobim Bossa (Sekundär-Dominanten & absteigende ii–V)',
    genre: 'Jazz (Sek. ii-V)',
    bpm: 124,
    chords: [
      { degreeOffset: 0, chordId: 'maj7', beats: 4 },
      { degreeOffset: 8, chordId: 'dim7', beats: 4 },
      { degreeOffset: 7, chordId: 'm7', beats: 4 },
      { degreeOffset: 0, chordId: '7b9', beats: 4 },
      { degreeOffset: 5, chordId: 'maj7', beats: 4 },
      { degreeOffset: 5, chordId: 'm7', beats: 4 },
      { degreeOffset: 4, chordId: '7alt', beats: 4 },
      { degreeOffset: 9, chordId: '7b9', beats: 4 },
      { degreeOffset: 2, chordId: '13', beats: 4 },
      { degreeOffset: 8, chordId: '13', beats: 4 },
      { degreeOffset: 7, chordId: '7sus4', beats: 4 },
      { degreeOffset: 7, chordId: '7b9', beats: 4 },
    ],
  },
  {
    id: 'jazz_how_high_moon',
    name: 'How High the Moon / Solar (Sek. ii–V–I Kette: I → bVII → bVI)',
    genre: 'Jazz (Sek. ii-V)',
    bpm: 132,
    chords: [
      { degreeOffset: 0, chordId: 'maj7', beats: 8 },
      { degreeOffset: 0, chordId: 'm7', beats: 4 },
      { degreeOffset: 5, chordId: '7', beats: 4 },
      { degreeOffset: 10, chordId: 'maj7', beats: 8 },
      { degreeOffset: 10, chordId: 'm7', beats: 4 },
      { degreeOffset: 3, chordId: '7', beats: 4 },
      { degreeOffset: 8, chordId: 'maj7', beats: 4 },
      { degreeOffset: 2, chordId: 'm7b5', beats: 2 },
      { degreeOffset: 7, chordId: '7b9', beats: 2 },
    ],
  },
  {
    id: 'jazz_there_will_never_be',
    name: 'There Will Never Be Another You (Sek. ii–V zu vi, IV & bVII13)',
    genre: 'Jazz (Sek. ii-V)',
    bpm: 138,
    chords: [
      { degreeOffset: 0, chordId: 'maj7', beats: 8 },
      { degreeOffset: 11, chordId: 'm7b5', beats: 4 },
      { degreeOffset: 4, chordId: '7b9', beats: 4 },
      { degreeOffset: 9, chordId: 'm7', beats: 8 },
      { degreeOffset: 7, chordId: 'm7', beats: 4 },
      { degreeOffset: 0, chordId: '7', beats: 4 },
      { degreeOffset: 5, chordId: 'maj7', beats: 4 },
      { degreeOffset: 10, chordId: '13', beats: 4 },
      { degreeOffset: 0, chordId: 'maj7', beats: 4 },
      { degreeOffset: 9, chordId: 'm7', beats: 4 },
      { degreeOffset: 2, chordId: '7', beats: 4 },
      { degreeOffset: 2, chordId: 'm7', beats: 2 },
      { degreeOffset: 7, chordId: '7', beats: 2 },
    ],
  },
  {
    id: 'jazz_lady_bird_dameron',
    name: 'Lady Bird / Tadd Dameron Turnaround (Imaj7–bIIImaj7–bVImaj7–bIImaj7)',
    genre: 'Jazz (Sek. ii-V)',
    bpm: 130,
    chords: [
      { degreeOffset: 0, chordId: 'maj7', beats: 4 },
      { degreeOffset: 5, chordId: 'm7', beats: 2 },
      { degreeOffset: 10, chordId: '7', beats: 2 },
      { degreeOffset: 0, chordId: 'maj7', beats: 4 },
      { degreeOffset: 8, chordId: 'm7', beats: 2 },
      { degreeOffset: 1, chordId: '7', beats: 2 },
      { degreeOffset: 0, chordId: 'maj7', beats: 2 },
      { degreeOffset: 3, chordId: 'maj7', beats: 2 },
      { degreeOffset: 8, chordId: 'maj7', beats: 2 },
      { degreeOffset: 1, chordId: 'maj7', beats: 2 },
    ],
  },
  {
    id: 'jazz_rhythm_bridge',
    name: 'Rhythm Changes Bridge (Sekundär-Dominanten: III7–VI7–II7–V7)',
    genre: 'Jazz (Sek. ii-V)',
    bpm: 136,
    chords: [
      { degreeOffset: 4, chordId: '7', beats: 8 },
      { degreeOffset: 9, chordId: '7', beats: 8 },
      { degreeOffset: 2, chordId: '7', beats: 8 },
      { degreeOffset: 7, chordId: '13', beats: 8 },
    ],
  },

  // --- GOSPEL & NEO-SOUL PROGRESSIONS ---
  {
    id: 'neosoul_gospel_sec_251',
    name: 'Gospel Neo-Soul Sek. ii–V zu vi & IV (Imaj9–viiø7–III7#9–vi9–v9–I13–IVmaj9)',
    genre: 'Gospel / Neo-Soul',
    bpm: 82,
    chords: [
      { degreeOffset: 0, chordId: 'maj9', beats: 4 },
      { degreeOffset: 11, chordId: 'm7b5', beats: 2 },
      { degreeOffset: 4, chordId: '7sharp9', beats: 2 },
      { degreeOffset: 9, chordId: 'm9', beats: 4 },
      { degreeOffset: 7, chordId: 'm9', beats: 2 },
      { degreeOffset: 0, chordId: '13', beats: 2 },
      { degreeOffset: 5, chordId: 'maj9', beats: 4 },
      { degreeOffset: 10, chordId: '13', beats: 4 },
    ],
  },
  {
    id: 'neosoul_dangelo_walkup',
    name: "D'Angelo / Glasper Neo-Soul Walk-Up (IVmaj9–#iv°7–iii9–VI7alt–ii11–bII13)",
    genre: 'Gospel / Neo-Soul',
    bpm: 78,
    chords: [
      { degreeOffset: 5, chordId: 'maj9', beats: 4 },
      { degreeOffset: 6, chordId: 'dim7', beats: 2 },
      { degreeOffset: 4, chordId: 'm9', beats: 2 },
      { degreeOffset: 9, chordId: '7alt', beats: 4 },
      { degreeOffset: 2, chordId: 'm11', beats: 4 },
      { degreeOffset: 1, chordId: '13', beats: 4 },
      { degreeOffset: 0, chordId: 'maj9', beats: 4 },
    ],
  },
  {
    id: 'neosoul_tritone_church',
    name: 'Churchy Neo-Soul Tritone-Sub (ii9–V9sus4–bII13–Imaj9–VI7b9–ii9–V7alt)',
    genre: 'Gospel / Neo-Soul',
    bpm: 84,
    chords: [
      { degreeOffset: 2, chordId: 'm9', beats: 4 },
      { degreeOffset: 7, chordId: '9sus4', beats: 2 },
      { degreeOffset: 1, chordId: '13', beats: 2 },
      { degreeOffset: 0, chordId: 'maj9', beats: 4 },
      { degreeOffset: 9, chordId: '7b9', beats: 4 },
      { degreeOffset: 2, chordId: 'm9', beats: 4 },
      { degreeOffset: 7, chordId: '7alt', beats: 4 },
    ],
  },
];

type ModulationMode = 'none' | 'cw' | 'ccw' | 'random';
type PositionSystem = 'closed5' | '3nps' | 'manual' | 'full';
type NeighborMode = 'none' | 'lower' | 'higher' | 'both';
type FretDisplayMode = 'tones' | 'chords';
type InversionPref = 'auto' | 'root' | '1st' | '2nd' | '3rd';

interface ProgressionTrainerToolProps {
  initialChords?: Array<{ rootPc: number; chordId: string; beats: number }>;
  initialKeyPc?: number;
}

export const ProgressionTrainerTool: React.FC<ProgressionTrainerToolProps> = ({
  initialChords,
  initialKeyPc,
}) => {
  const [keyPc, setKeyPc] = useState<number>(initialKeyPc ?? 0);
  const [steps, setSteps] = useState<ProgressionChordStep[]>(() => {
    if (initialChords && initialChords.length > 0) {
      const base = initialKeyPc ?? 0;
      return initialChords.map((c, i) => ({
        id: `init-${i}`,
        degreeOffset: ((c.rootPc - base) % 12 + 12) % 12,
        chordId: c.chordId,
        beats: c.beats,
      }));
    }
    return PROGRESSION_PRESETS[0].chords.map((c, i) => ({ id: `p-${i}`, ...c }));
  });

  const [bpm, setBpm] = useState(104);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentChordIdx, setCurrentChordIdx] = useState(0);
  const [currentBeatInChord, setCurrentBeatInChord] = useState(0);
  const [completedLoops, setCompletedLoops] = useState(0);

  // Modulation & Auto-Speed settings
  const [modMode, setModMode] = useState<ModulationMode>('ccw');
  const [modEveryLoops, setModEveryLoops] = useState<number>(2);
  const [autoSpeedEnabled, setAutoSpeedEnabled] = useState<boolean>(false);
  const [autoSpeedEveryLoops, setAutoSpeedEveryLoops] = useState<number>(2);
  const [autoSpeedStepBpm, setAutoSpeedStepBpm] = useState<number>(5);
  const [autoSpeedMaxBpm, setAutoSpeedMaxBpm] = useState<number>(160);

  // Visualization & Position System settings
  const [viewMode, setViewMode] = useState<'guitar' | 'piano' | 'both'>('both');
  const [showNotation, setShowNotation] = useState<boolean>(true);
  const [showNextChord, setShowNextChord] = useState(true);
  const [labelMode, setLabelMode] = useState<'note' | 'degree'>('degree');

  const [fretDisplayMode, setFretDisplayMode] = useState<FretDisplayMode>('tones');
  const [chordVoicingCat, setChordVoicingCat] = useState<'all' | VoicingShapeCategory>('drop2');
  const [inversionPref, setInversionPref] = useState<InversionPref>('auto');

  const [posSystem, setPosSystem] = useState<PositionSystem>('closed5');
  const [selectedPosIdx, setSelectedPosIdx] = useState<number>(1); // 0..4 among the 5 positions
  const [neighborMode, setNeighborMode] = useState<NeighborMode>('none');
  const [showPosFrames, setShowPosFrames] = useState<boolean>(true);
  const [manualStartFret, setManualStartFret] = useState<number>(4);
  const [manualSpan, setManualSpan] = useState<number>(3); // tight 3-fret span (4 frets inclusive!)

  const [timbre, setTimbre] = useState<InstrumentTimbre>('warmPad');
  const [drumBacking, setDrumBacking] = useState(true);

  // User Saved Progressions
  interface SavedProgData {
    keyPc: number;
    bpm: number;
    modMode: ModulationMode;
    modEveryLoops: number;
    steps: ProgressionChordStep[];
  }
  const [savedProgs, setSavedProgs] = useState<SavedPreset<SavedProgData>[]>(() =>
    loadUserPresets<SavedProgData>(PRESET_KEYS.PROGRESSIONS)
  );
  const [progSaveName, setProgSaveName] = useState('');
  const [presetGenreFilter, setPresetGenreFilter] = useState<string>('Alle');

  const handleSaveProgression = () => {
    const label = progSaveName.trim() || `Progression ${savedProgs.length + 1}`;
    const updated = saveUserPreset<SavedProgData>(PRESET_KEYS.PROGRESSIONS, label, {
      keyPc,
      bpm,
      modMode,
      modEveryLoops,
      steps,
    });
    setSavedProgs(updated);
    setProgSaveName('');
  };

  const tuning = GUITAR_TUNINGS[0];

  useEffect(() => {
    if (initialChords && initialChords.length > 0) {
      const base = initialKeyPc ?? 0;
      setKeyPc(base);
      setSteps(
        initialChords.map((c, i) => ({
          id: `ext-${i}-${Date.now()}`,
          degreeOffset: ((c.rootPc - base) % 12 + 12) % 12,
          chordId: c.chordId,
          beats: c.beats,
        }))
      );
      setCurrentChordIdx(0);
      setCurrentBeatInChord(0);
      setCompletedLoops(0);
    }
  }, [initialChords, initialKeyPc]);

  const stateRef = useRef({
    steps,
    keyPc,
    bpm,
    modMode,
    modEveryLoops,
    autoSpeedEnabled,
    autoSpeedEveryLoops,
    autoSpeedStepBpm,
    autoSpeedMaxBpm,
    timbre,
    drumBacking,
  });
  stateRef.current = {
    steps,
    keyPc,
    bpm,
    modMode,
    modEveryLoops,
    autoSpeedEnabled,
    autoSpeedEveryLoops,
    autoSpeedStepBpm,
    autoSpeedMaxBpm,
    timbre,
    drumBacking,
  };

  const timerRef = useRef<number | null>(null);
  const chordIdxRef = useRef(0);
  const beatInChordRef = useRef(0);
  const loopCountRef = useRef(0);
  const prevUpperVoicesRef = useRef<number[] | null>(null);
  const [lastVoicedMidis, setLastVoicedMidis] = useState<number[]>([]);

  const computeNextKey = (curr: number, mode: ModulationMode): number => {
    if (mode === 'cw') return (curr + 7) % 12;
    if (mode === 'ccw') return (curr + 5) % 12;
    if (mode === 'random') {
      let next = curr;
      while (next === curr) next = Math.floor(Math.random() * 12);
      return next;
    }
    return curr;
  };

  useEffect(() => {
    if (!isPlaying) {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      prevUpperVoicesRef.current = null;
      return;
    }

    let cancelled = false;
    chordIdxRef.current = 0;
    beatInChordRef.current = 0;
    loopCountRef.current = 0;
    prevUpperVoicesRef.current = null;
    setCurrentChordIdx(0);
    setCurrentBeatInChord(0);
    setCompletedLoops(0);

    const tick = () => {
      if (cancelled) return;
      const s = stateRef.current;
      if (!s.steps.length) return;

      const beatMs = (60 / Math.max(40, s.bpm)) * 1000;
      const cIdx = chordIdxRef.current % s.steps.length;
      const bIdx = beatInChordRef.current;
      const chord = s.steps[cIdx];
      const absRoot = (s.keyPc + chord.degreeOffset) % 12;

      setCurrentChordIdx(cIdx);
      setCurrentBeatInChord(bIdx);

      const isSustainedTimbre = s.timbre === 'warmPad' || s.timbre === 'strings' || s.timbre === 'organ';

      // Play smooth voice-led chord on beat 1 (sustained timbres hold across the whole chord; percussive comp softly on beat 3)
      if (bIdx === 0) {
        const voiced = getVoiceLedChordMidi(absRoot, chord.chordId, prevUpperVoicesRef.current);
        prevUpperVoicesRef.current = voiced.upperVoices;
        setLastVoicedMidis(voiced.allNotes);

        const chordDurSec = (beatMs / 1000) * chord.beats * (isSustainedTimbre ? 0.98 : 0.92);
        audioEngine.playChord(voiced.allNotes, {
          timbre: s.timbre,
          duration: chordDurSec,
          velocity: isSustainedTimbre ? 0.72 : 0.78,
        });
      } else if (!isSustainedTimbre && bIdx === 2 && chord.beats >= 4) {
        const voiced = getVoiceLedChordMidi(absRoot, chord.chordId, prevUpperVoicesRef.current);
        audioEngine.playChord(voiced.upperVoices, {
          timbre: s.timbre,
          duration: (beatMs / 1000) * 1.45,
          velocity: 0.44,
        });
      }

      if (s.drumBacking) {
        const beatIn4 = bIdx % 4;
        audioEngine.playDrum('hihatClosed', 'jazz', beatIn4 === 0 ? 0.65 : 0.42);
        if (beatIn4 === 0) audioEngine.playDrum('kick', 'jazz', 0.68);
        if (beatIn4 === 1 || beatIn4 === 3) audioEngine.playDrum('rim', 'jazz', 0.42);
      }

      beatInChordRef.current += 1;
      if (beatInChordRef.current >= chord.beats) {
        beatInChordRef.current = 0;
        chordIdxRef.current += 1;

        if (chordIdxRef.current >= s.steps.length) {
          chordIdxRef.current = 0;
          loopCountRef.current += 1;
          setCompletedLoops(loopCountRef.current);

          if (s.modMode !== 'none' && loopCountRef.current % s.modEveryLoops === 0) {
            const nextK = computeNextKey(s.keyPc, s.modMode);
            stateRef.current.keyPc = nextK;
            setKeyPc(nextK);
          }

          if (s.autoSpeedEnabled && loopCountRef.current % s.autoSpeedEveryLoops === 0) {
            const nextBpm = Math.min(s.autoSpeedMaxBpm, s.bpm + s.autoSpeedStepBpm);
            if (nextBpm !== s.bpm) {
              stateRef.current.bpm = nextBpm;
              setBpm(nextBpm);
            }
          }
        }
      }

      const nextBeatMs = (60 / Math.max(40, stateRef.current.bpm)) * 1000;
      timerRef.current = window.setTimeout(tick, nextBeatMs);
    };

    tick();
    return () => {
      cancelled = true;
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isPlaying]);

  const useFlats = shouldUseFlats(keyPc, 'auto');
  const noteNames = getNoteNamesArray(useFlats);

  // Compute the 5 positions for current key (sorted left-to-right by minFret so neighbor +/-1 always moves up/down the neck)
  const fivePositions = useMemo(() => {
    if (posSystem === '3nps') {
      return get3NpsPositionsForRoot(keyPc, tuning.midiNotes[0]);
    }
    return [...getCagedPositionsForRoot(keyPc, tuning.midiNotes[0], false).slice(1)].sort(
      (a, b) => a.minFret - b.minFret
    );
  }, [posSystem, keyPc, tuning.midiNotes]);

  // Compute active fret window + labeled frames (main box + optional neighboring boxes!)
  const { activeMinFret, activeMaxFret, positionFrames } = useMemo(() => {
    if (posSystem === 'full') {
      return { activeMinFret: 0, activeMaxFret: 15, positionFrames: [] as FretPositionFrame[] };
    }
    if (posSystem === 'manual') {
      const fMax = Math.min(15, manualStartFret + manualSpan);
      const frames: FretPositionFrame[] = showPosFrames
        ? [{ minFret: manualStartFret, maxFret: fMax, label: `Bund ${manualStartFret}–${fMax}`, color: '#f59e0b' }]
        : [];
      return { activeMinFret: manualStartFret, activeMaxFret: fMax, positionFrames: frames };
    }

    const safeIdx = Math.max(0, Math.min(fivePositions.length - 1, selectedPosIdx));
    const main = fivePositions[safeIdx];
    const included: Array<{ pos: typeof main; isNeighbor: boolean }> = [{ pos: main, isNeighbor: false }];

    if ((neighborMode === 'lower' || neighborMode === 'both') && safeIdx > 0) {
      included.unshift({ pos: fivePositions[safeIdx - 1], isNeighbor: true });
    }
    if ((neighborMode === 'higher' || neighborMode === 'both') && safeIdx < fivePositions.length - 1) {
      included.push({ pos: fivePositions[safeIdx + 1], isNeighbor: true });
    }

    const minF = Math.min(...included.map(x => x.pos.minFret));
    const maxF = Math.max(...included.map(x => x.pos.maxFret));
    const frames: FretPositionFrame[] = showPosFrames
      ? included.map(item => ({
          minFret: item.pos.minFret,
          maxFret: item.pos.maxFret,
          label: item.isNeighbor ? `Nachbar ${item.pos.shortLabel}` : `${item.pos.shortLabel} (${item.pos.minFret}–${item.pos.maxFret})`,
          color: item.isNeighbor ? '#38bdf8' : '#f59e0b',
          dashed: item.isNeighbor,
        }))
      : [];

    return { activeMinFret: minF, activeMaxFret: maxF, positionFrames: frames };
  }, [posSystem, fivePositions, selectedPosIdx, neighborMode, showPosFrames, manualStartFret, manualSpan]);

  const activeChord = steps[currentChordIdx] ?? steps[0];
  const nextChordIdx = steps.length > 0 ? (currentChordIdx + 1) % steps.length : 0;
  const nextChord = steps[nextChordIdx] ?? activeChord;

  const willModulateNext =
    modMode !== 'none' &&
    currentChordIdx === steps.length - 1 &&
    (completedLoops + 1) % modEveryLoops === 0;
  const nextChordKeyPc = willModulateNext && modMode !== 'random' ? computeNextKey(keyPc, modMode) : keyPc;

  const currentAbsRoot = activeChord ? (keyPc + activeChord.degreeOffset) % 12 : 0;
  const nextAbsRoot = nextChord ? (nextChordKeyPc + nextChord.degreeOffset) % 12 : 0;

  // Precompute smooth voice-led chord voicings for every chord in the progression (powers clickable chords, piano highlight & engraved Grand-Staff notation!)
  const sequencedVoicings = useMemo(() => {
    let prevUpper: number[] | null = null;
    return steps.map(st => {
      const absRoot = (keyPc + st.degreeOffset) % 12;
      const voiced = getVoiceLedChordMidi(absRoot, st.chordId, prevUpper);
      prevUpper = voiced.upperVoices;
      return {
        symbol: formatChordName(absRoot, st.chordId, useFlats),
        absRoot,
        chordId: st.chordId,
        allNotes: voiced.allNotes,
        upperVoices: voiced.upperVoices,
      };
    });
  }, [steps, keyPc, useFlats]);

  const previewChordAtIndex = (idx: number) => {
    const v = sequencedVoicings[idx];
    if (!v) return;
    setCurrentChordIdx(idx);
    setLastVoicedMidis(v.allNotes);
    audioEngine.playChord(v.allNotes, {
      timbre,
      duration: timbre === 'warmPad' || timbre === 'strings' || timbre === 'organ' ? 1.8 : 1.5,
      velocity: 0.78,
    });
  };

  const { fretboardDots, chordMutedStrings, activeInversionLabel } = useMemo(() => {
    if (!activeChord) {
      return { fretboardDots: [] as FretDot[], chordMutedStrings: [] as number[], activeInversionLabel: '' };
    }

    // MODE 1: All chord tones in scale / arpeggio boxes
    if (fretDisplayMode === 'tones') {
      const layers: LayerSpec[] = [
        {
          id: 'curr',
          label: 'Aktueller Akkord',
          kind: 'chord',
          rootPc: currentAbsRoot,
          defId: activeChord.chordId,
          color: '#06b6d4',
          minFret: activeMinFret,
          maxFret: activeMaxFret,
          outlineOnly: false,
        },
      ];
      if (showNextChord && nextChord && steps.length > 1) {
        layers.push({
          id: 'next',
          label: 'Folgeakkord',
          kind: 'chord',
          rootPc: nextAbsRoot,
          defId: nextChord.chordId,
          color: '#f43f5e',
          minFret: activeMinFret,
          maxFret: activeMaxFret,
          outlineOnly: true,
        });
      }
      return {
        fretboardDots: computeFretboardDots(layers, tuning, 15, useFlats ? 'flat' : 'sharp'),
        chordMutedStrings: [] as number[],
        activeInversionLabel: '',
      };
    }

    // MODE 2: Playable Guitar Chord Voicings & Inversions!
    const pickVoicingForChord = (rootPc: number, chordId: string, targetFretCenter: number, invPref: InversionPref) => {
      const all = generateChordVoicings(rootPc, chordId, tuning);
      const filtered = chordVoicingCat === 'all' ? all : all.filter(v => v.category === chordVoicingCat);
      const pool = filtered.length > 0 ? filtered : all;
      if (pool.length === 0) return null;

      const chordDef = getChordById(chordId);
      const desiredBassIdx =
        invPref === 'root' ? 0 : invPref === '1st' ? 1 : invPref === '2nd' ? 2 : invPref === '3rd' ? 3 : -1;
      const desiredBassPc =
        desiredBassIdx >= 0 && chordDef.intervals[desiredBassIdx] !== undefined
          ? (rootPc + chordDef.intervals[desiredBassIdx]) % 12
          : -1;

      let best = pool[0];
      let bestScore = -Infinity;
      for (const v of pool) {
        const bassPc = v.midiNotes[0] % 12;
        const center = v.baseFret + v.span / 2;
        let sc = v.score * 0.4 - Math.abs(center - targetFretCenter) * 7;
        if (desiredBassPc >= 0) {
          sc += bassPc === desiredBassPc ? 140 : -40;
        }
        if (sc > bestScore) {
          bestScore = sc;
          best = v;
        }
      }
      return best;
    };

    const windowCenter = (activeMinFret + activeMaxFret) / 2;
    const currVoicing = pickVoicingForChord(currentAbsRoot, activeChord.chordId, windowCenter, inversionPref);
    const nextVoicing =
      showNextChord && nextChord && steps.length > 1
        ? pickVoicingForChord(
            nextAbsRoot,
            nextChord.chordId,
            currVoicing ? currVoicing.baseFret + currVoicing.span / 2 : windowCenter,
            inversionPref === 'auto' ? 'auto' : inversionPref
          )
        : null;

    const dotMap = new Map<string, FretDot>();
    const currToneMap = getLayerToneMap(currentAbsRoot, 'chord', activeChord.chordId);
    const nextToneMap = nextChord ? getLayerToneMap(nextAbsRoot, 'chord', nextChord.chordId) : new Map();

    if (currVoicing) {
      currVoicing.frets.forEach((f, sIdx) => {
        if (f === null) return;
        const midi = tuning.midiNotes[sIdx] + f;
        const pc = midi % 12;
        const info = currToneMap.get(pc);
        dotMap.set(`${sIdx}-${f}`, {
          stringIdx: sIdx,
          fret: f,
          midi,
          pc,
          noteName: pcToName(pc, useFlats),
          degree: info?.degree ?? '',
          isRoot: info?.isRoot ?? false,
          layerId: 'curr-voicing',
          color: '#06b6d4',
          outlineOnly: false,
        });
      });
    }

    if (nextVoicing && nextChord) {
      nextVoicing.frets.forEach((f, sIdx) => {
        if (f === null) return;
        const key = `${sIdx}-${f}`;
        const midi = tuning.midiNotes[sIdx] + f;
        const pc = midi % 12;
        const info = nextToneMap.get(pc);
        const existing = dotMap.get(key);
        if (existing) {
          existing.secondaryColors = ['#f43f5e'];
        } else {
          dotMap.set(key, {
            stringIdx: sIdx,
            fret: f,
            midi,
            pc,
            noteName: pcToName(pc, useFlats),
            degree: info?.degree ?? '',
            isRoot: info?.isRoot ?? false,
            layerId: 'next-voicing',
            color: '#f43f5e',
            outlineOnly: true,
          });
        }
      });
    }

    const muted = currVoicing
      ? currVoicing.frets.map((f, sIdx) => (f === null ? sIdx : -1)).filter(sIdx => sIdx >= 0)
      : [];
    const bassDeg = currVoicing ? currToneMap.get(currVoicing.midiNotes[0] % 12)?.degree ?? '' : '';
    const invName =
      bassDeg === 'R'
        ? 'Grundstellung'
        : bassDeg === '3' || bassDeg === 'b3'
          ? '1. Umkehrung (Terz-Bass)'
          : bassDeg === '5' || bassDeg === 'b5'
            ? '2. Umkehrung (Quint-Bass)'
            : bassDeg
              ? `3. Umkehrung (${bassDeg}-Bass)`
              : '';

    return {
      fretboardDots: Array.from(dotMap.values()),
      chordMutedStrings: muted,
      activeInversionLabel: currVoicing ? `${currVoicing.shapeTag} • ${invName}` : '',
    };
  }, [
    activeChord,
    nextChord,
    currentAbsRoot,
    nextAbsRoot,
    showNextChord,
    activeMinFret,
    activeMaxFret,
    tuning,
    useFlats,
    steps.length,
    fretDisplayMode,
    chordVoicingCat,
    inversionPref,
  ]);

  const pianoHighlights = useMemo<PianoKeyHighlight[]>(() => {
    if (!activeChord) return [];
    const out: PianoKeyHighlight[] = [];
    const currMap = getLayerToneMap(currentAbsRoot, 'chord', activeChord.chordId);
    const nextMap = showNextChord && nextChord ? getLayerToneMap(nextAbsRoot, 'chord', nextChord.chordId) : new Map();

    nextMap.forEach((info, pc) => {
      if (!currMap.has(pc)) {
        out.push({
          pc,
          color: '#f43f5e',
          outlineOnly: true,
          label: labelMode === 'note' ? pcToName(pc, useFlats) : info.degree,
        });
      }
    });

    currMap.forEach((info, pc) => {
      out.push({
        pc,
        color: '#06b6d4',
        secondaryColor: nextMap.has(pc) ? '#f43f5e' : undefined,
        isRoot: info.isRoot,
        label: labelMode === 'note' ? pcToName(pc, useFlats) : info.degree,
      });
    });

    return out;
  }, [activeChord, nextChord, currentAbsRoot, nextAbsRoot, showNextChord, labelMode, useFlats]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Repeat className="w-6 h-6 text-cyan-400" />
            Akkord-Progression Übungstool
          </h2>
          <p className="text-sm text-slate-400">
            Geschlossenes Voice-Leading ohne große Tonsprünge, Pad/Strings-Begleitung, 5 CAGED/3NPS-Lagen mit Nachbarboxen &amp; automatische Modulation.
          </p>
        </div>

        <button
          onClick={() => setIsPlaying(p => !p)}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm cursor-pointer transition-all ${
            isPlaying
              ? 'bg-rose-500 hover:bg-rose-400 text-white shadow-lg shadow-rose-500/25'
              : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/25'
          }`}
        >
          {isPlaying ? <Square className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
          {isPlaying ? 'Stopp' : 'Progression starten'}
        </button>
      </div>

      {/* LIVE CHORD TELEPROMPTER + FRETBOARD/PIANO */}
      <div className="studio-card rounded-2xl p-4 sm:p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
          <div className="flex items-center gap-3">
            <div className="px-3.5 py-2 rounded-xl bg-amber-500/15 border border-amber-500/35 text-center">
              <div className="text-[10px] font-bold uppercase text-amber-300/80">Tonart</div>
              <div className="text-2xl font-black text-amber-400">{pcToName(keyPc, useFlats)}</div>
            </div>
            <div className="text-xs text-slate-400 space-y-0.5">
              <div>Durchlauf: <span className="text-white font-bold">{completedLoops + 1}</span></div>
              <div>
                Modulation:{' '}
                <span className="text-cyan-300 font-semibold">
                  {modMode === 'none'
                    ? 'Aus'
                    : `Alle ${modEveryLoops}× (${modMode === 'cw' ? 'Quintenzirkel ↻' : modMode === 'ccw' ? 'Quartenzirkel ↺' : 'Zufall'})`}
                </span>
              </div>
              <div className="text-[11px] text-emerald-400 font-semibold">✓ Smooth Voice-Leading aktiv</div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => previewChordAtIndex(currentChordIdx)}
              title="Aktuellen Akkord abspielen"
              className="text-center group cursor-pointer px-3 py-1 rounded-xl hover:bg-slate-800/70 transition-colors"
            >
              <div className="text-[10px] uppercase tracking-wider font-bold text-cyan-400 flex items-center justify-center gap-1">
                Aktuell <Volume2 className="w-3 h-3 opacity-70 group-hover:opacity-100" />
              </div>
              <div className="text-4xl font-black text-white">
                {activeChord ? formatChordName(currentAbsRoot, activeChord.chordId, useFlats) : '--'}
              </div>
              <div className="flex justify-center gap-1 mt-1.5">
                {Array.from({ length: activeChord?.beats ?? 4 }, (_, b) => (
                  <span
                    key={b}
                    className={`w-2.5 h-2.5 rounded-full transition-all ${
                      isPlaying && b === currentBeatInChord
                        ? 'bg-amber-400 scale-125'
                        : b < currentBeatInChord && isPlaying
                          ? 'bg-cyan-500/60'
                          : 'bg-slate-700'
                    }`}
                  />
                ))}
              </div>
            </button>

            <div className="text-slate-600 text-2xl font-bold">→</div>

            <button
              onClick={() => previewChordAtIndex(nextChordIdx)}
              title="Folgeakkord vorhören"
              className="text-center opacity-85 hover:opacity-100 cursor-pointer px-3 py-1 rounded-xl hover:bg-slate-800/60 transition-all"
            >
              <div className="text-[10px] uppercase tracking-wider font-bold text-rose-400">
                Folgeakkord {willModulateNext ? '(Neue Tonart!)' : ''}
              </div>
              <div className="text-2xl font-extrabold text-rose-300">
                {nextChord
                  ? willModulateNext && modMode === 'random'
                    ? '? (Zufall)'
                    : formatChordName(nextAbsRoot, nextChord.chordId, shouldUseFlats(nextChordKeyPc, 'auto'))
                  : '--'}
              </div>
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2 text-xs">
            <button
              onClick={() => setShowNotation(v => !v)}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-semibold border cursor-pointer ${
                showNotation
                  ? 'bg-amber-500/20 border-amber-500/50 text-amber-200'
                  : 'bg-slate-900 border-slate-800 text-slate-400'
              }`}
            >
              <Music2 className="w-3.5 h-3.5" /> Noten
            </button>
            <button
              onClick={() => setShowNextChord(v => !v)}
              className={`px-2.5 py-1.5 rounded-lg font-semibold border cursor-pointer ${
                showNextChord
                  ? 'bg-rose-500/20 border-rose-500/50 text-rose-200'
                  : 'bg-slate-900 border-slate-800 text-slate-400'
              }`}
            >
              Folgeakkord-Vorschau
            </button>
            <button
              onClick={() => setLabelMode(m => (m === 'note' ? 'degree' : 'note'))}
              className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 font-semibold cursor-pointer"
            >
              {labelMode === 'note' ? 'Ton' : 'Stufe'}
            </button>
            <div className="flex bg-slate-900 border border-slate-800 rounded-lg p-0.5">
              <button
                onClick={() => setViewMode('guitar')}
                className={`p-1.5 rounded cursor-pointer ${viewMode === 'guitar' ? 'bg-slate-700 text-white' : 'text-slate-400'}`}
                title="Nur Gitarre"
              >
                <Guitar className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('both')}
                className={`px-2 py-1 rounded text-[11px] font-semibold cursor-pointer ${viewMode === 'both' ? 'bg-slate-700 text-white' : 'text-slate-400'}`}
              >
                Beide
              </button>
              <button
                onClick={() => setViewMode('piano')}
                className={`p-1.5 rounded cursor-pointer ${viewMode === 'piano' ? 'bg-slate-700 text-white' : 'text-slate-400'}`}
                title="Nur Klavier"
              >
                <Piano className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Position System & Chord Inversions Bar right above the Fretboard */}
        <div className="p-3 rounded-xl bg-slate-900/75 border border-slate-800/90 space-y-2.5 text-xs">
          {/* Primary Mode Toggle: All Chord Tones (Scale Boxes) vs Playable Chord Voicings & Inversions */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-800/70">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="font-bold text-slate-200 mr-1">Griffbrett-Modus:</span>
              <button
                onClick={() => setFretDisplayMode('tones')}
                className={`px-3 py-1.5 rounded-lg font-bold border cursor-pointer ${
                  fretDisplayMode === 'tones'
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                Skalen- &amp; Arpeggio-Lagen (Solieren)
              </button>
              <button
                onClick={() => setFretDisplayMode('chords')}
                className={`px-3 py-1.5 rounded-lg font-bold border cursor-pointer ${
                  fretDisplayMode === 'chords'
                    ? 'bg-amber-500/20 border-amber-400 text-amber-200'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                Akkord-Voicings &amp; Inversionen (Comping)
              </button>
            </div>
            {fretDisplayMode === 'chords' && activeInversionLabel && (
              <span className="px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-300 font-bold">
                {activeInversionLabel}
              </span>
            )}
          </div>

          {fretDisplayMode === 'chords' ? (
            <div className="flex flex-wrap items-center justify-between gap-2.5">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-slate-400 font-semibold">Voicing-Typ:</span>
                {([
                  { id: 'drop2', label: 'Drop-2 (Jazz)' },
                  { id: 'shell', label: 'Shell (R–3–7)' },
                  { id: 'triad', label: 'Triads (3 Saiten)' },
                  { id: 'caged', label: 'CAGED' },
                  { id: 'all', label: 'Alle' },
                ] as const).map(c => (
                  <button
                    key={c.id}
                    onClick={() => setChordVoicingCat(c.id)}
                    className={`px-2.5 py-1 rounded-lg font-semibold border cursor-pointer ${
                      chordVoicingCat === c.id
                        ? 'bg-amber-500/20 border-amber-500 text-amber-200'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-slate-400 font-semibold">Inversion / Umkehrung:</span>
                {([
                  { id: 'auto', label: 'Auto Voice-Leading' },
                  { id: 'root', label: 'Grundstellung' },
                  { id: '1st', label: '1. Umk. (3)' },
                  { id: '2nd', label: '2. Umk. (5)' },
                  { id: '3rd', label: '3. Umk. (7)' },
                ] as const).map(inv => (
                  <button
                    key={inv.id}
                    onClick={() => setInversionPref(inv.id)}
                    className={`px-2.5 py-1 rounded-lg font-semibold border cursor-pointer ${
                      inversionPref === inv.id
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {inv.label}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-amber-400" />
                  <span className="font-bold text-slate-200 mr-1">Lagen-System:</span>
                  {([
                    { id: 'closed5', label: 'Geschlossen (5 Boxen)' },
                    { id: '3nps', label: '3-Notes-Per-String (3NPS)' },
                    { id: 'manual', label: 'Manuell (Eng)' },
                    { id: 'full', label: 'Ganzes Griffbrett' },
                  ] as const).map(sys => (
                    <button
                      key={sys.id}
                      onClick={() => setPosSystem(sys.id)}
                      className={`px-2.5 py-1 rounded-lg font-semibold border cursor-pointer ${
                        posSystem === sys.id
                          ? 'bg-amber-500/20 border-amber-500 text-amber-200'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {sys.label}
                    </button>
                  ))}
                </div>

                {posSystem !== 'full' && (
                  <label className="flex items-center gap-1.5 text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showPosFrames}
                      onChange={e => setShowPosFrames(e.target.checked)}
                      className="accent-amber-500"
                    />
                    Positionen umrahmen
                  </label>
                )}
              </div>

              {(posSystem === 'closed5' || posSystem === '3nps') && (
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-800/70">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-slate-400">Position:</span>
                    {fivePositions.map((pos, idx) => (
                      <button
                        key={pos.id}
                        onClick={() => setSelectedPosIdx(idx)}
                        className={`px-2.5 py-1 rounded-lg font-bold border cursor-pointer ${
                          selectedPosIdx === idx
                            ? 'bg-amber-500 text-slate-950 border-amber-400'
                            : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-600'
                        }`}
                      >
                        {pos.shortLabel} ({pos.minFret}–{pos.maxFret})
                      </button>
                    ))}
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-slate-400">Benachbarte Positionen:</span>
                    {([
                      { id: 'none', label: 'Keine' },
                      { id: 'lower', label: '+ Tiefer' },
                      { id: 'higher', label: '+ Höher' },
                      { id: 'both', label: 'Beide (±1)' },
                    ] as const).map(nb => (
                      <button
                        key={nb.id}
                        onClick={() => setNeighborMode(nb.id)}
                        className={`px-2 py-1 rounded-lg font-semibold border cursor-pointer ${
                          neighborMode === nb.id
                            ? 'bg-sky-500/20 border-sky-400 text-sky-200'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {nb.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {posSystem === 'manual' && (
                <div className="flex flex-wrap items-center gap-4 pt-1 border-t border-slate-800/70">
                  <label className="flex items-center gap-2 text-slate-300">
                    Startbund: <span className="font-mono font-bold text-amber-300">{manualStartFret}</span>
                    <input
                      type="range"
                      min={0}
                      max={12}
                      value={manualStartFret}
                      onChange={e => setManualStartFret(Number(e.target.value))}
                      className="w-28 accent-amber-500"
                    />
                  </label>
                  <label className="flex items-center gap-2 text-slate-300">
                    Breite: <span className="font-mono font-bold text-cyan-300">{manualSpan + 1} Bünde</span>
                    <input
                      type="range"
                      min={2}
                      max={6}
                      value={manualSpan}
                      onChange={e => setManualSpan(Number(e.target.value))}
                      className="w-24 accent-cyan-400"
                    />
                  </label>
                </div>
              )}
            </>
          )}
        </div>

        {/* Visual Legend */}
        <div className="flex flex-wrap items-center gap-4 text-xs">
          <span className="inline-flex items-center gap-1.5 text-slate-300">
            <span className="w-3.5 h-3.5 rounded-full bg-amber-500 border-2 border-amber-100 inline-block" />
            Aktueller Grundton
          </span>
          <span className="inline-flex items-center gap-1.5 text-cyan-300">
            <span className="w-3.5 h-3.5 rounded-full bg-cyan-500 inline-block" />
            Aktueller Akkord
          </span>
          {showNextChord && (
            <>
              <span className="inline-flex items-center gap-1.5 text-rose-300">
                <span className="w-3.5 h-3.5 rounded-full border-2 border-dashed border-rose-500 inline-block" />
                Folgeakkord (Vorschau)
              </span>
              <span className="inline-flex items-center gap-1.5 text-slate-300">
                <span className="w-3.5 h-3.5 rounded-full bg-cyan-500 ring-2 ring-rose-500 inline-block" />
                Gemeinsamer Zielton
              </span>
            </>
          )}
        </div>

        {(viewMode === 'guitar' || viewMode === 'both') && (
          <FretboardSVG
            tuning={tuning}
            numFrets={15}
            dots={fretboardDots}
            labelMode={labelMode}
            highlightWindow={
              fretDisplayMode === 'tones' && posSystem !== 'full'
                ? { minFret: activeMinFret, maxFret: activeMaxFret }
                : null
            }
            positionFrames={fretDisplayMode === 'tones' ? positionFrames : []}
            mutedStrings={fretDisplayMode === 'chords' ? chordMutedStrings : []}
            timbre="guitar"
            compact
          />
        )}

        {(viewMode === 'piano' || viewMode === 'both') && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>Interaktive Klaviatur – klicke einzelne Tasten oder spiele den aktuellen Akkord:</span>
              <button
                onClick={() => previewChordAtIndex(currentChordIdx)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 font-bold cursor-pointer"
              >
                <Volume2 className="w-3.5 h-3.5" /> Akkord am Klavier abspielen
              </button>
            </div>
            <PianoKeyboardSVG
              startMidi={40}
              endMidi={76}
              highlights={pianoHighlights}
              activeMidiNotes={lastVoicedMidis.length > 0 ? lastVoicedMidis : sequencedVoicings[currentChordIdx]?.allNotes ?? []}
              timbre={timbre === 'guitar' ? 'piano' : timbre}
              height={118}
            />
          </div>
        )}

        {/* Classical Engraved Chord-Voicing Grand Staff (Interactive: click any measure to play!) */}
        {showNotation && sequencedVoicings.length > 0 && (
          <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-bold text-slate-200">
                Klassisches Notensystem – Voice-Leading Voicings (Violin- &amp; Bassschlüssel)
              </span>
              <span>Klicke einen Takt zum Vorhören</span>
            </div>
            <ClassicalStaffSVG
              notes={[]}
              currentTime={0}
              baseBpm={bpm}
              scale={0.98}
              staticChords={sequencedVoicings.map((v, idx) => ({
                symbol: v.symbol,
                midis: v.allNotes,
                isCurrent: idx === currentChordIdx,
                isNext: idx === nextChordIdx && sequencedVoicings.length > 1,
                onClick: () => previewChordAtIndex(idx),
              }))}
            />
          </div>
        )}
      </div>

      {/* PROGRESSION TIMELINE EDITOR */}
      <div className="studio-card rounded-2xl p-4 sm:p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-bold text-white">Akkordfolge (anklicken zum Springen oder Bearbeiten)</h3>
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              value={progSaveName}
              onChange={e => setProgSaveName(e.target.value)}
              placeholder="Name zum Speichern..."
              className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500 w-44"
            />
            <button
              onClick={handleSaveProgression}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" /> Speichern
            </button>
            <button
              onClick={() =>
                setSteps(prev => [...prev, { id: `st-${Date.now()}`, degreeOffset: 0, chordId: 'maj7', beats: 4 }])
              }
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 text-xs font-bold cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Akkord hinzufügen
            </button>
          </div>
        </div>

        {savedProgs.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
            <span className="flex items-center gap-1 text-amber-400 font-bold mr-1">
              <Bookmark className="w-3.5 h-3.5" /> Gespeichert:
            </span>
            {savedProgs.map(p => (
              <div
                key={p.id}
                className="flex items-center gap-1 pl-2.5 pr-1 py-1 rounded-lg bg-slate-900 border border-amber-500/35"
              >
                <button
                  onClick={() => {
                    setKeyPc(p.data.keyPc);
                    setBpm(p.data.bpm);
                    setModMode(p.data.modMode);
                    setModEveryLoops(p.data.modEveryLoops);
                    setSteps(p.data.steps);
                    setCurrentChordIdx(0);
                    setCurrentBeatInChord(0);
                    setCompletedLoops(0);
                  }}
                  className="text-slate-100 hover:text-amber-300 font-semibold cursor-pointer"
                >
                  {p.name}
                </button>
                <button
                  onClick={() => setSavedProgs(deleteUserPreset(PRESET_KEYS.PROGRESSIONS, p.id))}
                  className="p-0.5 text-slate-500 hover:text-rose-400 cursor-pointer"
                  title="Löschen"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {steps.map((st, idx) => {
            const absRoot = (keyPc + st.degreeOffset) % 12;
            const isCurrent = idx === currentChordIdx;
            const isNext = idx === nextChordIdx && steps.length > 1;
            return (
              <div
                key={st.id}
                onClick={() => previewChordAtIndex(idx)}
                title="Klicken zum Abspielen & Auswählen"
                className={`p-2.5 rounded-xl border transition-all space-y-1.5 min-w-[126px] cursor-pointer ${
                  isCurrent
                    ? 'bg-cyan-500/20 border-cyan-400 shadow-md shadow-cyan-500/10'
                    : isNext
                      ? 'bg-rose-500/10 border-rose-500/40'
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-base font-black text-white flex items-center gap-1">
                    {formatChordName(absRoot, st.chordId, useFlats)}
                    <Volume2 className="w-3 h-3 text-cyan-400/75" />
                  </span>
                  {steps.length > 1 && (
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        setSteps(prev => prev.filter(p => p.id !== st.id));
                        setCurrentChordIdx(0);
                      }}
                      className="text-slate-500 hover:text-rose-400 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <select
                    value={absRoot}
                    onClick={e => e.stopPropagation()}
                    onChange={e => {
                      const newAbs = Number(e.target.value);
                      const newOff = ((newAbs - keyPc) % 12 + 12) % 12;
                      setSteps(prev => prev.map(p => (p.id === st.id ? { ...p, degreeOffset: newOff } : p)));
                    }}
                    className="bg-slate-950 border border-slate-700 rounded px-1 py-0.5 text-[11px] font-bold text-amber-300"
                  >
                    {noteNames.map((n, pc) => (
                      <option key={pc} value={pc}>
                        {n}
                      </option>
                    ))}
                  </select>

                  <select
                    value={st.chordId}
                    onClick={e => e.stopPropagation()}
                    onChange={e =>
                      setSteps(prev => prev.map(p => (p.id === st.id ? { ...p, chordId: e.target.value } : p)))
                    }
                    className="bg-slate-950 border border-slate-700 rounded px-1 py-0.5 text-[11px] text-slate-200 flex-1"
                  >
                    {CHORDS.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.symbol || 'Dur'}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span>Beats:</span>
                  <div className="flex gap-1">
                    {[2, 4, 8].map(b => (
                      <button
                        key={b}
                        onClick={e => {
                          e.stopPropagation();
                          setSteps(prev => prev.map(p => (p.id === st.id ? { ...p, beats: b } : p)));
                        }}
                        className={`px-1.5 py-0.5 rounded cursor-pointer font-bold ${
                          st.beats === b ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SETTINGS + PRESET LIBRARY */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="studio-card rounded-2xl p-4 space-y-3.5">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Compass className="w-4 h-4 text-amber-400" />
            Tonart, Sound &amp; Auto-Modulation
          </h3>

          <div className="flex flex-wrap gap-1">
            {getNoteNamesArray(false).map((n, pc) => (
              <button
                key={pc}
                onClick={() => setKeyPc(pc)}
                className={`w-8 h-8 rounded-lg text-xs font-bold cursor-pointer ${
                  keyPc === pc ? 'bg-amber-500 text-slate-950' : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
                }`}
              >
                {n}
              </button>
            ))}
          </div>

          <div className="space-y-1.5 text-xs">
            <div className="text-slate-400 font-semibold">Tonart-Wechsel nach Wiederholungen:</div>
            <div className="grid grid-cols-2 gap-1.5">
              {([
                { id: 'none', label: 'Keine Modulation' },
                { id: 'cw', label: 'Quintenzirkel ↻ (CW)' },
                { id: 'ccw', label: 'Quintenzirkel ↺ (CCW)' },
                { id: 'random', label: 'Zufällig (Random)' },
              ] as const).map(m => (
                <button
                  key={m.id}
                  onClick={() => setModMode(m.id)}
                  className={`py-2 px-2 rounded-lg font-semibold border cursor-pointer ${
                    modMode === m.id
                      ? 'bg-amber-500/20 border-amber-500 text-amber-200'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {modMode !== 'none' && (
            <label className="block text-xs text-slate-400">
              Wechsel nach <span className="text-amber-300 font-bold">{modEveryLoops}</span> Durchläufen
              <input
                type="range"
                min={1}
                max={8}
                value={modEveryLoops}
                onChange={e => setModEveryLoops(Number(e.target.value))}
                className="w-full accent-amber-500 mt-1"
              />
            </label>
          )}

          <div className="pt-2 border-t border-slate-800 space-y-2.5 text-xs">
            <label className="block text-slate-400">
              Tempo: <span className="text-amber-300 font-bold">{bpm} BPM</span>
              <input
                type="range"
                min={55}
                max={190}
                value={bpm}
                onChange={e => setBpm(Number(e.target.value))}
                className="w-full accent-amber-500 mt-1"
              />
            </label>

            {/* Auto-Speed Trainer for Progressions */}
            <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <button
                  onClick={() => setAutoSpeedEnabled(v => !v)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-bold border cursor-pointer ${
                    autoSpeedEnabled
                      ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                      : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  Auto-Speed: {autoSpeedEnabled ? 'AN' : 'AUS'}
                </button>
                <span className="text-[11px] text-slate-400">Tempo nach Loops steigern</span>
              </div>

              {autoSpeedEnabled && (
                <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-300">
                  <label className="flex items-center gap-1">
                    <span>+</span>
                    <select
                      value={autoSpeedStepBpm}
                      onChange={e => setAutoSpeedStepBpm(Number(e.target.value))}
                      className="bg-slate-900 border border-slate-700 rounded px-1.5 py-0.5 text-amber-300 font-bold"
                    >
                      {[2, 4, 5, 8, 10].map(s => (
                        <option key={s} value={s}>
                          {s} BPM
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="flex items-center gap-1">
                    <span>alle</span>
                    <select
                      value={autoSpeedEveryLoops}
                      onChange={e => setAutoSpeedEveryLoops(Number(e.target.value))}
                      className="bg-slate-900 border border-slate-700 rounded px-1.5 py-0.5 text-white font-bold"
                    >
                      {[1, 2, 3, 4, 6, 8].map(n => (
                        <option key={n} value={n}>
                          {n}x
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="flex items-center gap-1">
                    <span>Max:</span>
                    <select
                      value={autoSpeedMaxBpm}
                      onChange={e => setAutoSpeedMaxBpm(Number(e.target.value))}
                      className="bg-slate-900 border border-slate-700 rounded px-1.5 py-0.5 text-emerald-300 font-bold"
                    >
                      {[120, 140, 160, 180, 190].map(m => (
                        <option key={m} value={m}>
                          {m} BPM
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between gap-2">
              <select
                value={timbre}
                onChange={e => setTimbre(e.target.value as InstrumentTimbre)}
                className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-slate-200 flex-1"
              >
                <option value="warmPad">Begleitung: Warm Analog Pad (Fläche)</option>
                <option value="strings">Begleitung: Orchestral Strings</option>
                <option value="organ">Begleitung: Warm Jazz Organ</option>
                <option value="epiano">Begleitung: Neo-Soul Rhodes</option>
                <option value="piano">Begleitung: Grand Piano</option>
                <option value="guitar">Begleitung: Clean Gitarre</option>
                <option value="nylon">Begleitung: Akustik Gitarre</option>
              </select>

              <label className="flex items-center gap-1.5 text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={drumBacking}
                  onChange={e => setDrumBacking(e.target.checked)}
                  className="accent-amber-500"
                />
                Drums
              </label>
            </div>
          </div>
        </div>

        {/* Famous Progressions Library */}
        <div className="lg:col-span-2 studio-card rounded-2xl p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-cyan-400" />
              Bekannte &amp; geläufige Progressionen
            </h3>
            <span className="text-xs text-slate-400">{PROGRESSION_PRESETS.length} Vorlagen</span>
          </div>

          <div className="flex flex-wrap gap-1 text-[11px]">
            {[
              { id: 'Alle', label: 'Alle' },
              { id: 'Line Cliché', label: 'Line Clichés' },
              { id: 'Gospel', label: 'Gospel (Walk-Up/Down)' },
              { id: 'Gospel / Neo-Soul', label: 'Gospel & Neo-Soul' },
              { id: 'Jazz (Sek. ii-V)', label: 'Jazz (Sek. ii–V–I)' },
              { id: 'Jazz', label: 'Jazz Standards' },
              { id: 'Other', label: 'Funk / Blues / Rock' },
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setPresetGenreFilter(cat.id)}
                className={`px-2.5 py-1 rounded-lg font-bold border cursor-pointer transition-colors ${
                  presetGenreFilter === cat.id
                    ? 'bg-cyan-500 border-cyan-400 text-slate-950'
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-600'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[420px] overflow-y-auto pr-1">
            {PROGRESSION_PRESETS.filter(p => {
              if (presetGenreFilter === 'Alle') return true;
              if (presetGenreFilter === 'Line Cliché') return p.genre === 'Line Cliché';
              if (presetGenreFilter === 'Gospel') return p.genre === 'Gospel';
              if (presetGenreFilter === 'Gospel / Neo-Soul')
                return p.genre.includes('Neo-Soul') || p.genre.includes('Gospel');
              if (presetGenreFilter === 'Jazz (Sek. ii-V)') return p.genre === 'Jazz (Sek. ii-V)';
              if (presetGenreFilter === 'Jazz') return p.genre.includes('Jazz');
              return (
                !p.genre.includes('Jazz') &&
                !p.genre.includes('Gospel') &&
                !p.genre.includes('Neo-Soul') &&
                p.genre !== 'Line Cliché'
              );
            }).map(p => (
              <button
                key={p.id}
                onClick={() => {
                  setSteps(p.chords.map((c, i) => ({ id: `${p.id}-${i}-${Date.now()}`, ...c })));
                  setBpm(p.bpm);
                  setCurrentChordIdx(0);
                  setCurrentBeatInChord(0);
                  setCompletedLoops(0);
                }}
                className="p-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/50 text-left transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-white">{p.name}</span>
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] font-semibold text-amber-300 shrink-0">
                    {p.genre}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 mt-1 font-mono truncate">
                  {p.chords
                    .slice(0, 6)
                    .map(c => formatChordName((keyPc + c.degreeOffset) % 12, c.chordId, useFlats))
                    .join(' → ')}
                  {p.chords.length > 6 ? ' …' : ''}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
