export interface MidiLibraryNote {
  id: number;
  midi: number;
  time: number;
  duration: number;
  velocity: number;
  trackIdx: number;
}

export interface MidiLibraryTrack {
  index: number;
  name: string;
  color: string;
  muted: boolean;
  noteCount: number;
}

export type MidiGenre =
  | 'Barock'
  | 'Klassik'
  | 'Romantik'
  | 'Impressionismus'
  | 'Ragtime'
  | 'Jazz'
  | 'Neo-Soul'
  | 'Technik & Etüde'
  | 'Kinder & Einsteiger';

export interface MidiLibraryPiece {
  id: string;
  title: string;
  artist: string;
  genre: MidiGenre;
  difficulty: 'Einsteiger' | 'Mittel' | 'Fortgeschritten';
  tags: string[];
  bpm: number;
  timeSignature: [number, number];
  durationLabel: string;
  sourceLabel: string;
  /** Optional fallback key signature in fifths (-7..+7, negative = flats, positive = sharps) if .mid omits header */
  keyFifths?: number;
  /** Path to real complete .mid file inside public/midi/ */
  midiUrl?: string;
  /** Optional inline builder for complete kids songs & custom exercises */
  build?: () => {
    tracks: MidiLibraryTrack[];
    notes: MidiLibraryNote[];
    duration: number;
    bpm: number;
    timeSignature: [number, number];
  };
}

export const MIDI_TRACK_COLORS = ['#06b6d4', '#f59e0b', '#10b981', '#f43f5e', '#8b5cf6', '#ec4899'];

function makeTracks(notes: MidiLibraryNote[], names: string[]): MidiLibraryTrack[] {
  return names.map((name, index) => ({
    index,
    name,
    color: MIDI_TRACK_COLORS[index % MIDI_TRACK_COLORS.length],
    muted: false,
    noteCount: notes.filter(n => n.trackIdx === index).length,
  }));
}

export const MIDI_LIBRARY: MidiLibraryPiece[] = [
  // =========================================================================
  // 26 COMPLETE PUBLIC-DOMAIN CONCERT CLASSICAL & RAGTIME MIDI FILES (MUTOPIA)
  // =========================================================================
  {
    id: 'bach_bwv846',
    title: 'Präludium in C-Dur (BWV 846 – Vollständig)',
    artist: 'J.S. Bach',
    genre: 'Barock',
    difficulty: 'Einsteiger',
    tags: ['Vollständig', 'Arpeggio', 'C-Dur', 'Wohltemperiertes Klavier'],
    bpm: 78,
    timeSignature: [4, 4],
    durationLabel: '2:20',
    sourceLabel: 'Mutopia Project (Public Domain)',
    midiUrl: './midi/bach_bwv846_prelude_c.mid',
  },
  {
    id: 'bach_minuet_g',
    title: 'Menuett in G-Dur (BWV Anh. 114 – Vollständig)',
    artist: 'J.S. Bach / Petzold',
    genre: 'Barock',
    difficulty: 'Einsteiger',
    tags: ['Vollständig', '3/4 Takt', 'G-Dur', 'Anna Magdalena'],
    bpm: 132,
    timeSignature: [3, 4],
    durationLabel: '0:41',
    sourceLabel: 'Mutopia Project (Public Domain)',
    midiUrl: './midi/bach_minuet_g.mid',
  },
  {
    id: 'bach_inv_01',
    title: 'Invention Nr. 1 in C-Dur (BWV 772 – Vollständig)',
    artist: 'J.S. Bach',
    genre: 'Barock',
    difficulty: 'Mittel',
    tags: ['Vollständig', 'Kontrapunkt', 'Zweistimmig', 'C-Dur'],
    bpm: 80,
    timeSignature: [4, 4],
    durationLabel: '1:06',
    sourceLabel: 'Mutopia Project (Public Domain)',
    midiUrl: './midi/bach_invention_01.mid',
  },
  {
    id: 'bach_inv_04',
    title: 'Invention Nr. 4 in d-Moll (BWV 775 – Vollständig)',
    artist: 'J.S. Bach',
    genre: 'Barock',
    difficulty: 'Mittel',
    tags: ['Vollständig', '3/8 Takt', 'd-Moll', 'Kontrapunkt'],
    bpm: 90,
    timeSignature: [3, 8],
    durationLabel: '0:51',
    sourceLabel: 'Mutopia Project (Public Domain)',
    midiUrl: './midi/bach_invention_04.mid',
  },
  {
    id: 'bach_inv_08',
    title: 'Invention Nr. 8 in F-Dur (BWV 779 – Vollständig)',
    artist: 'J.S. Bach',
    genre: 'Barock',
    difficulty: 'Mittel',
    tags: ['Vollständig', '3/4 Takt', 'F-Dur', 'Geläufigkeit'],
    bpm: 96,
    timeSignature: [3, 4],
    durationLabel: '1:06',
    sourceLabel: 'Mutopia Project (Public Domain)',
    midiUrl: './midi/bach_invention_08.mid',
  },
  {
    id: 'bach_inv_13',
    title: 'Invention Nr. 13 in a-Moll (BWV 784 – Vollständig)',
    artist: 'J.S. Bach',
    genre: 'Barock',
    difficulty: 'Fortgeschritten',
    tags: ['Vollständig', 'a-Moll', 'Arpeggio', 'Kontrapunkt'],
    bpm: 100,
    timeSignature: [4, 4],
    durationLabel: '1:00',
    sourceLabel: 'Mutopia Project (Public Domain)',
    midiUrl: './midi/bach_invention_13.mid',
  },
  {
    id: 'beethoven_fur_elise',
    title: 'Für Elise (WoO 59 – Vollständig)',
    artist: 'Ludwig van Beethoven',
    genre: 'Klassik',
    difficulty: 'Mittel',
    tags: ['Vollständig', '3/8 Takt', 'a-Moll', 'Welthit'],
    bpm: 72,
    timeSignature: [3, 8],
    durationLabel: '2:10',
    sourceLabel: 'Mutopia Project (Public Domain)',
    midiUrl: './midi/beethoven_fur_elise.mid',
  },
  {
    id: 'beethoven_moonlight_1',
    title: 'Mondscheinsonate Op. 27 Nr. 2 – 1. Satz Adagio (Vollständig)',
    artist: 'Ludwig van Beethoven',
    genre: 'Romantik',
    difficulty: 'Mittel',
    tags: ['Vollständig', 'cis-Moll', 'Triolen', 'Adagio'],
    bpm: 56,
    timeSignature: [4, 4],
    durationLabel: '5:10',
    sourceLabel: 'Mutopia Project (Public Domain)',
    midiUrl: './midi/beethoven_moonlight_1.mid',
  },
  {
    id: 'beethoven_moonlight_3',
    title: 'Mondscheinsonate Op. 27 Nr. 2 – 3. Satz Presto Agitato (Vollständig)',
    artist: 'Ludwig van Beethoven',
    genre: 'Romantik',
    difficulty: 'Fortgeschritten',
    tags: ['Vollständig', 'Virtuos', 'cis-Moll', 'Schnell'],
    bpm: 160,
    timeSignature: [4, 4],
    durationLabel: '6:30',
    sourceLabel: 'Mutopia Project (Public Domain)',
    midiUrl: './midi/beethoven_moonlight_3.mid',
  },
  {
    id: 'mozart_kv545_1',
    title: 'Klaviersonate C-Dur KV 545 – 1. Satz Allegro (Vollständig)',
    artist: 'W.A. Mozart',
    genre: 'Klassik',
    difficulty: 'Mittel',
    tags: ['Vollständig', 'C-Dur', 'Alberti-Bass', 'Sonate'],
    bpm: 132,
    timeSignature: [4, 4],
    durationLabel: '2:12',
    sourceLabel: 'Mutopia Project (Public Domain)',
    midiUrl: './midi/mozart_kv545_1.mid',
  },
  {
    id: 'mozart_alla_turca',
    title: 'Türkischer Marsch – Rondo Alla Turca KV 331 (Vollständig)',
    artist: 'W.A. Mozart',
    genre: 'Klassik',
    difficulty: 'Fortgeschritten',
    tags: ['Vollständig', 'a-Moll', '2/4 Takt', 'Rondo'],
    bpm: 120,
    timeSignature: [2, 4],
    durationLabel: '4:15',
    sourceLabel: 'Mutopia Project (Public Domain)',
    midiUrl: './midi/mozart_alla_turca.mid',
  },
  {
    id: 'chopin_nocturne_op9_2',
    title: 'Nocturne in Es-Dur (Op. 9 Nr. 2 – Vollständig)',
    artist: 'Frédéric Chopin',
    genre: 'Romantik',
    difficulty: 'Fortgeschritten',
    tags: ['Vollständig', '12/8 Takt', 'Es-Dur', 'Nocturne'],
    bpm: 66,
    timeSignature: [12, 8],
    durationLabel: '3:22',
    sourceLabel: 'Mutopia Project (Public Domain)',
    midiUrl: './midi/chopin_nocturne_op9_2.mid',
  },
  {
    id: 'chopin_op28_4',
    title: 'Prélude in e-Moll (Op. 28 Nr. 4 – Vollständig)',
    artist: 'Frédéric Chopin',
    genre: 'Romantik',
    difficulty: 'Einsteiger',
    tags: ['Vollständig', 'e-Moll', 'Ausdruck', 'Voice-Leading'],
    bpm: 56,
    timeSignature: [2, 2],
    durationLabel: '1:48',
    sourceLabel: 'Mutopia Project (Public Domain)',
    midiUrl: './midi/chopin_prelude_op28_4.mid',
  },
  {
    id: 'chopin_op28_7',
    title: 'Prélude in A-Dur (Op. 28 Nr. 7 – Vollständig)',
    artist: 'Frédéric Chopin',
    genre: 'Romantik',
    difficulty: 'Einsteiger',
    tags: ['Vollständig', '3/4 Takt', 'A-Dur', 'Lyrisch'],
    bpm: 100,
    timeSignature: [3, 4],
    durationLabel: '0:36',
    sourceLabel: 'Mutopia Project (Public Domain)',
    midiUrl: './midi/chopin_prelude_op28_7.mid',
  },
  {
    id: 'chopin_op28_15',
    title: 'Regentropfen-Prélude Des-Dur (Op. 28 Nr. 15 – Vollständig)',
    artist: 'Frédéric Chopin',
    genre: 'Romantik',
    difficulty: 'Mittel',
    tags: ['Vollständig', 'Des-Dur', 'Raindrop', 'Romantik'],
    bpm: 80,
    timeSignature: [4, 4],
    durationLabel: '4:27',
    sourceLabel: 'Mutopia Project (Public Domain)',
    midiUrl: './midi/chopin_prelude_op28_15.mid',
  },
  {
    id: 'liszt_liebestraum_3',
    title: 'Liebestraum Nr. 3 in As-Dur (S. 541 – Vollständig)',
    artist: 'Franz Liszt',
    genre: 'Romantik',
    difficulty: 'Fortgeschritten',
    tags: ['Vollständig', 'As-Dur', '6/4 Takt', 'Romantik', 'Konzertstück'],
    bpm: 84,
    timeSignature: [6, 4],
    durationLabel: '4:05',
    sourceLabel: 'Public Domain MIDI Archive',
    midiUrl: './midi/liszt_liebestraum_3.mid',
  },
  {
    id: 'liszt_consolation_3',
    title: 'Consolation Nr. 3 in Des-Dur (S. 172 – Vollständig)',
    artist: 'Franz Liszt',
    genre: 'Romantik',
    difficulty: 'Mittel',
    tags: ['Vollständig', 'Des-Dur', 'Lyrisch', 'Arpeggio', 'Romantik'],
    bpm: 60,
    timeSignature: [4, 4],
    durationLabel: '4:03',
    sourceLabel: 'Mutopia Project (Public Domain)',
    midiUrl: './midi/liszt_consolation_3.mid',
  },
  {
    id: 'chopin_valse_op64_1',
    title: 'Minutenwalzer Des-Dur (Op. 64 Nr. 1 – Vollständig)',
    artist: 'Frédéric Chopin',
    genre: 'Romantik',
    difficulty: 'Fortgeschritten',
    tags: ['Vollständig', 'Walzer', '3/4 Takt', 'Des-Dur', 'Virtuos'],
    bpm: 140,
    timeSignature: [3, 4],
    durationLabel: '1:29',
    sourceLabel: 'Mutopia Project (Public Domain)',
    midiUrl: './midi/chopin_valse_op64_1.mid',
  },
  {
    id: 'chopin_valse_op64_2',
    title: 'Walzer in cis-Moll (Op. 64 Nr. 2 – Vollständig)',
    artist: 'Frédéric Chopin',
    genre: 'Romantik',
    difficulty: 'Mittel',
    tags: ['Vollständig', 'Walzer', '3/4 Takt', 'cis-Moll', 'Melancholisch'],
    bpm: 120,
    timeSignature: [3, 4],
    durationLabel: '4:03',
    sourceLabel: 'Public Domain MIDI Archive',
    keyFifths: 4,
    midiUrl: './midi/chopin_valse_op64_2.mid',
  },
  {
    id: 'chopin_valse_op69_2',
    title: 'Walzer in h-Moll (Op. 69 Nr. 2 – Vollständig)',
    artist: 'Frédéric Chopin',
    genre: 'Romantik',
    difficulty: 'Mittel',
    tags: ['Vollständig', 'Walzer', '3/4 Takt', 'h-Moll', 'Beliebt'],
    bpm: 152,
    timeSignature: [3, 4],
    durationLabel: '2:51',
    sourceLabel: 'Mutopia Project (Public Domain)',
    midiUrl: './midi/chopin_valse_op69_2.mid',
  },
  {
    id: 'chopin_valse_op34_2',
    title: 'Valse Brillante in a-Moll (Op. 34 Nr. 2 – Vollständig)',
    artist: 'Frédéric Chopin',
    genre: 'Romantik',
    difficulty: 'Mittel',
    tags: ['Vollständig', 'Walzer', '3/4 Takt', 'a-Moll', 'Lyrisch'],
    bpm: 120,
    timeSignature: [3, 4],
    durationLabel: '5:13',
    sourceLabel: 'Public Domain MIDI Archive',
    midiUrl: './midi/chopin_valse_op34_2.mid',
  },
  {
    id: 'chopin_fantaisie_impromptu',
    title: 'Fantaisie-Impromptu in cis-Moll (Op. 66 – Vollständig)',
    artist: 'Frédéric Chopin',
    genre: 'Romantik',
    difficulty: 'Fortgeschritten',
    tags: ['Vollständig', 'cis-Moll', 'Polyrhythmus', '4 gegen 3'],
    bpm: 168,
    timeSignature: [4, 4],
    durationLabel: '4:13',
    sourceLabel: 'Mutopia Project (Public Domain)',
    midiUrl: './midi/chopin_fantaisie_impromptu.mid',
  },
  {
    id: 'schubert_moment_3',
    title: 'Moment Musical Nr. 3 in f-Moll (Op. 94 / D. 780 – Vollständig)',
    artist: 'Franz Schubert',
    genre: 'Romantik',
    difficulty: 'Mittel',
    tags: ['Vollständig', 'f-Moll', '2/4 Takt', 'Klassiker'],
    bpm: 80,
    timeSignature: [2, 4],
    durationLabel: '1:57',
    sourceLabel: 'Mutopia Project (Public Domain)',
    midiUrl: './midi/schubert_moment_musical_3.mid',
  },
  {
    id: 'schubert_d899_2',
    title: 'Impromptu in Es-Dur (Op. 90 Nr. 2 / D. 899 – Vollständig)',
    artist: 'Franz Schubert',
    genre: 'Romantik',
    difficulty: 'Fortgeschritten',
    tags: ['Vollständig', 'Es-Dur', '3/4 Takt', 'Triolen'],
    bpm: 160,
    timeSignature: [3, 4],
    durationLabel: '5:19',
    sourceLabel: 'Mutopia Project (Public Domain)',
    midiUrl: './midi/schubert_impromptu_d899_2.mid',
  },
  {
    id: 'schubert_d899_3',
    title: 'Impromptu in Ges-Dur (Op. 90 Nr. 3 / D. 899 – Vollständig)',
    artist: 'Franz Schubert',
    genre: 'Romantik',
    difficulty: 'Fortgeschritten',
    tags: ['Vollständig', 'Ges-Dur', 'Lyrisch', 'Arpeggio'],
    bpm: 120,
    timeSignature: [4, 2],
    durationLabel: '5:54',
    sourceLabel: 'Mutopia Project (Public Domain)',
    midiUrl: './midi/schubert_impromptu_d899_3.mid',
  },
  {
    id: 'schubert_d899_4',
    title: 'Impromptu in As-Dur (Op. 90 Nr. 4 / D. 899 – Vollständig)',
    artist: 'Franz Schubert',
    genre: 'Romantik',
    difficulty: 'Fortgeschritten',
    tags: ['Vollständig', 'As-Dur', '3/4 Takt', 'Arpeggio'],
    bpm: 120,
    timeSignature: [3, 4],
    durationLabel: '7:35',
    sourceLabel: 'Mutopia Project (Public Domain)',
    midiUrl: './midi/schubert_impromptu_d899_4.mid',
  },
  {
    id: 'schubert_d935_2',
    title: 'Impromptu in As-Dur (Op. 142 Nr. 2 / D. 935 – Vollständig)',
    artist: 'Franz Schubert',
    genre: 'Romantik',
    difficulty: 'Mittel',
    tags: ['Vollständig', 'As-Dur', '3/4 Takt', 'Gesanglich'],
    bpm: 100,
    timeSignature: [3, 4],
    durationLabel: '7:12',
    sourceLabel: 'Mutopia Project (Public Domain)',
    midiUrl: './midi/schubert_impromptu_d935_2.mid',
  },
  {
    id: 'mendelssohn_gondellied',
    title: 'Venetianisches Gondellied (Op. 19 Nr. 6 – Vollständig)',
    artist: 'Felix Mendelssohn',
    genre: 'Romantik',
    difficulty: 'Einsteiger',
    tags: ['Vollständig', 'g-Moll', '6/8 Takt', 'Lieder ohne Worte'],
    bpm: 60,
    timeSignature: [6, 8],
    durationLabel: '2:18',
    sourceLabel: 'Mutopia Project (Public Domain)',
    midiUrl: './midi/mendelssohn_gondellied.mid',
  },
  {
    id: 'debussy_clair_de_lune',
    title: 'Clair de Lune – Suite Bergamasque (Vollständig)',
    artist: 'Claude Debussy',
    genre: 'Impressionismus',
    difficulty: 'Fortgeschritten',
    tags: ['Vollständig', '9/8 Takt', 'Des-Dur', 'Atmosphärisch'],
    bpm: 60,
    timeSignature: [9, 8],
    durationLabel: '5:22',
    sourceLabel: 'Mutopia Project (Public Domain)',
    midiUrl: './midi/debussy_clair_de_lune.mid',
  },
  {
    id: 'debussy_arabesque_1',
    title: 'Arabesque Nr. 1 in E-Dur (L. 66 – Vollständig)',
    artist: 'Claude Debussy',
    genre: 'Impressionismus',
    difficulty: 'Fortgeschritten',
    tags: ['Vollständig', 'Triolen', 'E-Dur', 'Polyrhythmus'],
    bpm: 120,
    timeSignature: [4, 4],
    durationLabel: '2:56',
    sourceLabel: 'Mutopia Project (Public Domain)',
    midiUrl: './midi/debussy_arabesque_1.mid',
  },
  {
    id: 'satie_gymnopedie_1',
    title: 'Gymnopédie Nr. 1 (Vollständig)',
    artist: 'Erik Satie',
    genre: 'Impressionismus',
    difficulty: 'Einsteiger',
    tags: ['Vollständig', '3/4 Takt', 'Major-7', 'Entspannend'],
    bpm: 66,
    timeSignature: [3, 4],
    durationLabel: '2:21',
    sourceLabel: 'Mutopia Project (Public Domain)',
    midiUrl: './midi/satie_gymnopedie_1.mid',
  },
  {
    id: 'satie_gnossienne_1',
    title: 'Gnossienne Nr. 1 (Vollständig)',
    artist: 'Erik Satie',
    genre: 'Impressionismus',
    difficulty: 'Einsteiger',
    tags: ['Vollständig', 'f-Moll', 'Exotisch', 'Mystisch'],
    bpm: 96,
    timeSignature: [4, 4],
    durationLabel: '3:16',
    sourceLabel: 'Mutopia Project (Public Domain)',
    midiUrl: './midi/satie_gnossienne_1.mid',
  },
  {
    id: 'burgmuller_candeur',
    title: 'La Candeur Op. 100 Nr. 1 (Vollständig)',
    artist: 'Friedrich Burgmüller',
    genre: 'Technik & Etüde',
    difficulty: 'Einsteiger',
    tags: ['Vollständig', 'C-Dur', 'Klavier-Etüde'],
    bpm: 120,
    timeSignature: [4, 4],
    durationLabel: '0:36',
    sourceLabel: 'Mutopia Project (Public Domain)',
    midiUrl: './midi/burgmuller_candeur.mid',
  },
  {
    id: 'burgmuller_arabesque',
    title: 'Arabesque Op. 100 Nr. 2 (Vollständig)',
    artist: 'Friedrich Burgmüller',
    genre: 'Technik & Etüde',
    difficulty: 'Einsteiger',
    tags: ['Vollständig', 'a-Moll', '2/4 Takt', 'Geläufigkeit'],
    bpm: 120,
    timeSignature: [2, 4],
    durationLabel: '0:30',
    sourceLabel: 'Mutopia Project (Public Domain)',
    midiUrl: './midi/burgmuller_arabesque.mid',
  },
  {
    id: 'burgmuller_ballade',
    title: 'Ballade Op. 100 Nr. 15 (Vollständig)',
    artist: 'Friedrich Burgmüller',
    genre: 'Technik & Etüde',
    difficulty: 'Mittel',
    tags: ['Vollständig', 'c-Moll', '3/8 Takt', 'Dramatisch'],
    bpm: 104,
    timeSignature: [3, 8],
    durationLabel: '1:22',
    sourceLabel: 'Mutopia Project (Public Domain)',
    midiUrl: './midi/burgmuller_ballade.mid',
  },
  {
    id: 'schumann_melodie',
    title: 'Melodie – Album für die Jugend Op. 68 Nr. 1 (Vollständig)',
    artist: 'Robert Schumann',
    genre: 'Romantik',
    difficulty: 'Einsteiger',
    tags: ['Vollständig', 'C-Dur', 'Schüler-Klassiker'],
    bpm: 68,
    timeSignature: [4, 4],
    durationLabel: '1:36',
    sourceLabel: 'Mutopia Project (Public Domain)',
    midiUrl: './midi/schumann_melodie.mid',
  },
  {
    id: 'schumann_kinderszenen_1',
    title: 'Von fremden Ländern und Menschen – Op. 15 Nr. 1 (Vollständig)',
    artist: 'Robert Schumann',
    genre: 'Romantik',
    difficulty: 'Mittel',
    tags: ['Vollständig', 'Kinderszenen', 'G-Dur'],
    bpm: 72,
    timeSignature: [2, 4],
    durationLabel: '0:42',
    sourceLabel: 'Mutopia Project (Public Domain)',
    midiUrl: './midi/schumann_kinderszenen_1.mid',
  },
  {
    id: 'joplin_entertainer',
    title: 'The Entertainer – Ragtime (Vollständig)',
    artist: 'Scott Joplin',
    genre: 'Ragtime',
    difficulty: 'Fortgeschritten',
    tags: ['Vollständig', 'Ragtime', 'Synkopen', 'C-Dur'],
    bpm: 76,
    timeSignature: [2, 4],
    durationLabel: '4:12',
    sourceLabel: 'Mutopia Project (Public Domain)',
    midiUrl: './midi/joplin_entertainer.mid',
  },
  {
    id: 'joplin_maple_leaf',
    title: 'Maple Leaf Rag (Vollständig)',
    artist: 'Scott Joplin',
    genre: 'Ragtime',
    difficulty: 'Fortgeschritten',
    tags: ['Vollständig', 'Ragtime', 'As-Dur', 'Stride Piano'],
    bpm: 104,
    timeSignature: [2, 4],
    durationLabel: '2:24',
    sourceLabel: 'Mutopia Project (Public Domain)',
    midiUrl: './midi/joplin_maple_leaf_rag.mid',
  },

  // =========================================================================
  // 12 COMPLETE JAZZ STANDARD PIANO MIDI FILES (COMPING, WALKING BASS & SOLO)
  // =========================================================================
  {
    id: 'jazz_std_autumn_leaves',
    title: 'Autumn Leaves – 32-Bar AABC Form (2 Choruses: Comping + Solo)',
    artist: 'Jazz Standard (Kosma)',
    genre: 'Jazz',
    difficulty: 'Mittel',
    tags: ['Vollständig', 'Jazz Standard', 'Swing', 'Walking Bass', 'G-Moll'],
    bpm: 132,
    timeSignature: [4, 4],
    durationLabel: '1:58',
    sourceLabel: 'FretKeys Jazz Piano Arrangement (.mid)',
    keyFifths: -2,
    midiUrl: './midi/jazz_autumn_leaves.mid',
  },
  {
    id: 'jazz_std_take_the_a_train',
    title: "Take the 'A' Train – 32-Bar AABA Form (2 Choruses: II7#11 & Swing)",
    artist: 'Jazz Standard (Strayhorn / Ellington)',
    genre: 'Jazz',
    difficulty: 'Mittel',
    tags: ['Vollständig', 'Jazz Standard', 'Swing', 'C-Dur', 'Lydian Dominant'],
    bpm: 156,
    timeSignature: [4, 4],
    durationLabel: '1:39',
    sourceLabel: 'FretKeys Jazz Piano Arrangement (.mid)',
    keyFifths: 0,
    midiUrl: './midi/jazz_take_the_a_train.mid',
  },
  {
    id: 'jazz_std_wave',
    title: 'Wave – 44-Bar AABA Bossa Nova Form (2 Choruses, D-Dur)',
    artist: 'Jazz Standard (A.C. Jobim)',
    genre: 'Jazz',
    difficulty: 'Fortgeschritten',
    tags: ['Vollständig', 'Jazz Standard', 'Bossa Nova', 'D-Dur', 'Sekundär-Dominanten'],
    bpm: 128,
    timeSignature: [4, 4],
    durationLabel: '2:46',
    sourceLabel: 'FretKeys Jazz Piano Arrangement (.mid)',
    keyFifths: 2,
    midiUrl: './midi/jazz_wave_bossa.mid',
  },
  {
    id: 'jazz_std_blue_bossa',
    title: 'Blue Bossa – 16-Bar Bossa Form (3 Choruses: Comping + Solo, C-Moll)',
    artist: 'Jazz Standard (Kenny Dorham)',
    genre: 'Jazz',
    difficulty: 'Einsteiger',
    tags: ['Vollständig', 'Jazz Standard', 'Bossa Nova', 'C-Moll', 'Db Modulation'],
    bpm: 136,
    timeSignature: [4, 4],
    durationLabel: '1:26',
    sourceLabel: 'FretKeys Jazz Piano Arrangement (.mid)',
    keyFifths: -3,
    midiUrl: './midi/jazz_blue_bossa.mid',
  },
  {
    id: 'jazz_std_all_the_things',
    title: 'All The Things You Are – 36-Bar Form (2 Choruses, Ab-Dur)',
    artist: 'Jazz Standard (Jerome Kern)',
    genre: 'Jazz',
    difficulty: 'Fortgeschritten',
    tags: ['Vollständig', 'Jazz Standard', 'Quartenzirkel', 'Sekundär ii-V-I', 'Ab-Dur'],
    bpm: 134,
    timeSignature: [4, 4],
    durationLabel: '2:10',
    sourceLabel: 'FretKeys Jazz Piano Arrangement (.mid)',
    keyFifths: -4,
    midiUrl: './midi/jazz_all_the_things.mid',
  },
  {
    id: 'jazz_std_fly_me_to_the_moon',
    title: 'Fly Me to the Moon – 32-Bar ABAC Form (2 Choruses, C-Dur)',
    artist: 'Jazz Standard (Bart Howard)',
    genre: 'Jazz',
    difficulty: 'Einsteiger',
    tags: ['Vollständig', 'Jazz Standard', 'Swing', 'Quintenzirkel', 'C-Dur'],
    bpm: 126,
    timeSignature: [4, 4],
    durationLabel: '2:03',
    sourceLabel: 'FretKeys Jazz Piano Arrangement (.mid)',
    keyFifths: 0,
    midiUrl: './midi/jazz_fly_me_to_the_moon.mid',
  },
  {
    id: 'jazz_std_satin_doll',
    title: 'Satin Doll – 32-Bar AABA Form (2 Choruses: ii–V Chains, C-Dur)',
    artist: 'Jazz Standard (Duke Ellington)',
    genre: 'Jazz',
    difficulty: 'Mittel',
    tags: ['Vollständig', 'Jazz Standard', 'Swing', 'ii-V Ketten', 'C-Dur'],
    bpm: 118,
    timeSignature: [4, 4],
    durationLabel: '2:12',
    sourceLabel: 'FretKeys Jazz Piano Arrangement (.mid)',
    keyFifths: 0,
    midiUrl: './midi/jazz_satin_doll.mid',
  },
  {
    id: 'jazz_std_misty',
    title: 'Misty – 32-Bar AABA Jazz Ballad (2 Choruses, Eb-Dur)',
    artist: 'Jazz Standard (Erroll Garner)',
    genre: 'Jazz',
    difficulty: 'Mittel',
    tags: ['Vollständig', 'Jazz Standard', 'Ballade', 'Eb-Dur', 'Spread Voicings'],
    bpm: 72,
    timeSignature: [4, 4],
    durationLabel: '3:36',
    sourceLabel: 'FretKeys Jazz Piano Arrangement (.mid)',
    keyFifths: -3,
    midiUrl: './midi/jazz_misty_ballad.mid',
  },
  {
    id: 'jazz_std_there_will_never_be',
    title: 'There Will Never Be Another You – 32-Bar ABAC (2 Choruses, Eb-Dur)',
    artist: 'Jazz Standard (Harry Warren)',
    genre: 'Jazz',
    difficulty: 'Mittel',
    tags: ['Vollständig', 'Jazz Standard', 'Swing', 'Eb-Dur', 'Backdoor bVII7'],
    bpm: 146,
    timeSignature: [4, 4],
    durationLabel: '1:46',
    sourceLabel: 'FretKeys Jazz Piano Arrangement (.mid)',
    keyFifths: -3,
    midiUrl: './midi/jazz_there_will_never_be.mid',
  },
  {
    id: 'jazz_std_summertime',
    title: 'Summertime – 16-Bar Minor Jazz Standard (3 Choruses, A-Moll)',
    artist: 'Jazz Standard (George Gershwin)',
    genre: 'Jazz',
    difficulty: 'Einsteiger',
    tags: ['Vollständig', 'Jazz Standard', 'Ballade', 'A-Moll', 'Minor Blues'],
    bpm: 94,
    timeSignature: [4, 4],
    durationLabel: '2:04',
    sourceLabel: 'FretKeys Jazz Piano Arrangement (.mid)',
    keyFifths: 0,
    midiUrl: './midi/jazz_summertime_minor.mid',
  },
  {
    id: 'jazz_std_cantaloupe',
    title: 'Cantaloupe Island – 16-Bar Modal Groove (3 Choruses, F-Moll)',
    artist: 'Jazz Standard (Herbie Hancock)',
    genre: 'Jazz',
    difficulty: 'Einsteiger',
    tags: ['Vollständig', 'Jazz Standard', 'Modal', 'Groove', 'F-Moll'],
    bpm: 116,
    timeSignature: [4, 4],
    durationLabel: '1:41',
    sourceLabel: 'FretKeys Jazz Piano Arrangement (.mid)',
    keyFifths: -4,
    midiUrl: './midi/jazz_cantaloupe_modal.mid',
  },
  {
    id: 'jazz_std_solar',
    title: 'Solar – 12-Bar Descending ii–V–I Form (4 Choruses, C-Moll)',
    artist: 'Jazz Standard (Miles Davis)',
    genre: 'Jazz',
    difficulty: 'Fortgeschritten',
    tags: ['Vollständig', 'Jazz Standard', 'Swing', 'Sekundär ii-V-I', 'C-Moll'],
    bpm: 142,
    timeSignature: [4, 4],
    durationLabel: '1:22',
    sourceLabel: 'FretKeys Jazz Piano Arrangement (.mid)',
    keyFifths: -3,
    midiUrl: './midi/jazz_solar_changes.mid',
  },

  // =========================================================================
  // TECHNIK, JAZZ, NEO-SOUL & VOLLSTÄNDIGE DE/EN KINDERLIEDER (FARBNOTATION!)
  // =========================================================================
  {
    id: 'hanon_1_full',
    title: 'Hanon Nr. 1 – Vollständig (2 Oktaven Auf & Ab)',
    artist: 'Charles-Louis Hanon',
    genre: 'Technik & Etüde',
    difficulty: 'Einsteiger',
    tags: ['Vollständig', 'Warmup', 'Geläufigkeit', 'Beide Hände'],
    bpm: 96,
    timeSignature: [4, 4],
    durationLabel: '1:00',
    sourceLabel: 'Public Domain Etüde',
    build: () => {
      const bpm = 96;
      const s = 60 / bpm / 4;
      const scale = [0, 2, 4, 5, 7, 9, 11, 12, 14, 16, 17, 19, 21, 23, 24, 26, 28, 29, 31, 33, 35, 36];
      const upPat = [0, 2, 3, 4, 5, 4, 3, 2];
      const downPat = [5, 3, 2, 1, 0, 1, 2, 3];
      const notes: MidiLibraryNote[] = [];
      let id = 0;
      let step = 0;
      // 14 bars ascending (2 full octaves)
      for (let deg = 0; deg < 14; deg++) {
        for (const p of upPat) {
          const semi = scale[deg + p];
          notes.push({ id: id++, midi: 60 + semi, time: step * s, duration: s * 0.9, velocity: 0.78, trackIdx: 0 });
          notes.push({ id: id++, midi: 48 + semi, time: step * s, duration: s * 0.9, velocity: 0.74, trackIdx: 1 });
          step++;
        }
      }
      // 14 bars descending back to C
      for (let deg = 14; deg >= 1; deg--) {
        for (const p of downPat) {
          const semi = scale[deg + p - 1];
          notes.push({ id: id++, midi: 60 + semi, time: step * s, duration: s * 0.9, velocity: 0.78, trackIdx: 0 });
          notes.push({ id: id++, midi: 48 + semi, time: step * s, duration: s * 0.9, velocity: 0.74, trackIdx: 1 });
          step++;
        }
      }
      notes.push({ id: id++, midi: 60, time: step * s, duration: s * 8, velocity: 0.85, trackIdx: 0 });
      notes.push({ id: id++, midi: 48, time: step * s, duration: s * 8, velocity: 0.85, trackIdx: 1 });
      return { bpm, timeSignature: [4, 4], duration: (step + 10) * s, tracks: makeTracks(notes, ['Rechte Hand', 'Linke Hand']), notes };
    },
  },
  {
    id: 'jazz_autumn_voicings',
    title: 'Jazz Standard Progression – Rootless Voicings & Bebop-Chorus (16 Takte)',
    artist: 'Bill Evans Stil',
    genre: 'Jazz',
    difficulty: 'Mittel',
    tags: ['ii-V-I', 'Rootless', '16 Takte', 'Swing'],
    bpm: 100,
    timeSignature: [4, 4],
    durationLabel: '0:42',
    sourceLabel: 'Studio Jazz Etüde',
    build: () => {
      const bpm = 100;
      const beat = 60 / bpm;
      const notes: MidiLibraryNote[] = [];
      let id = 0;
      const prog = [
        { lh: [53, 57, 60, 64], rh: [65, 67, 69, 72, 71, 69, 67, 65] }, // Dm9
        { lh: [53, 57, 59, 64], rh: [64, 65, 67, 71, 74, 72, 71, 67] }, // G13
        { lh: [52, 55, 59, 62], rh: [64, 67, 71, 74, 76, 74, 71, 67] }, // Cmaj9
        { lh: [52, 55, 57, 60], rh: [69, 67, 64, 62, 60, 62, 64, 67] }, // Fmaj7/Am7
        { lh: [50, 53, 57, 59], rh: [62, 65, 69, 71, 69, 68, 65, 64] }, // Bm7b5
        { lh: [50, 53, 56, 60], rh: [64, 62, 60, 59, 62, 64, 68, 71] }, // E7b9
        { lh: [52, 55, 57, 60], rh: [72, 71, 69, 67, 64, 67, 69, 72] }, // Am9
        { lh: [50, 55, 58, 61], rh: [71, 69, 67, 65, 64, 61, 62, 64] }, // A7alt
      ];
      // Play 2 full choruses (16 bars!)
      for (let chorus = 0; chorus < 2; chorus++) {
        prog.forEach((bar, bIdx) => {
          const t0 = (chorus * prog.length + bIdx) * 4 * beat;
          bar.lh.forEach(m => notes.push({ id: id++, midi: m, time: t0, duration: beat * 3.7, velocity: 0.65, trackIdx: 1 }));
          bar.rh.forEach((m, i) =>
            notes.push({
              id: id++,
              midi: m + (chorus === 1 && i % 2 === 0 ? 0 : 0),
              time: t0 + i * (beat / 2),
              duration: beat * 0.46,
              velocity: 0.82,
              trackIdx: 0,
            })
          );
        });
      }
      notes.sort((a, b) => a.time - b.time);
      return { bpm, timeSignature: [4, 4], duration: 16 * 4 * beat + 1, tracks: makeTracks(notes, ['Rechte Hand', 'Linke Hand (Rootless)']), notes };
    },
  },
  {
    id: 'neosoul_extended',
    title: 'Neo-Soul Extended Chords & Gospel Passing (16 Takte)',
    artist: 'Robert Glasper Stil',
    genre: 'Neo-Soul',
    difficulty: 'Mittel',
    tags: ['Rhodes', '9er/13er', '16 Takte', 'Laid-Back'],
    bpm: 82,
    timeSignature: [4, 4],
    durationLabel: '0:48',
    sourceLabel: 'Studio Neo-Soul Etüde',
    build: () => {
      const bpm = 82;
      const beat = 60 / bpm;
      const notes: MidiLibraryNote[] = [];
      let id = 0;
      const bars = [
        { lh: [40, 50], rh: [55, 59, 62, 66], mel: [[67, 2], [66, 2.5], [64, 3]] },
        { lh: [45, 55], rh: [55, 61, 64, 66], mel: [[69, 2], [66, 2.5], [64, 3]] },
        { lh: [38, 45], rh: [54, 57, 61, 64], mel: [[66, 1.5], [69, 2.5], [73, 3.5]] },
        { lh: [43, 50], rh: [54, 59, 62, 66], mel: [[64, 2], [62, 3]] },
        { lh: [42, 52], rh: [57, 60, 64, 66], mel: [[69, 1.5], [67, 2.5], [66, 3.5]] },
        { lh: [47, 57], rh: [57, 60, 63, 66], mel: [[69, 2], [67, 3]] },
        { lh: [40, 50], rh: [55, 59, 62, 66], mel: [[71, 1.5], [69, 2.5], [67, 3.5]] },
        { lh: [45, 55], rh: [55, 59, 61, 66], mel: [[64, 2], [62, 3]] },
      ];
      for (let rep = 0; rep < 2; rep++) {
        bars.forEach((b, idx) => {
          const t0 = (rep * bars.length + idx) * 4 * beat;
          b.lh.forEach(m => notes.push({ id: id++, midi: m, time: t0, duration: beat * 3.6, velocity: 0.68, trackIdx: 1 }));
          b.rh.forEach(m => notes.push({ id: id++, midi: m, time: t0, duration: beat * 3.2, velocity: 0.72, trackIdx: 0 }));
          b.mel.forEach(([m, bOff]) => notes.push({ id: id++, midi: m, time: t0 + bOff * beat, duration: beat * 0.7, velocity: 0.84, trackIdx: 0 }));
        });
      }
      notes.sort((a, b) => a.time - b.time);
      return { bpm, timeSignature: [4, 4], duration: 16 * 4 * beat + 1, tracks: makeTracks(notes, ['Rechte Hand', 'Linke Hand']), notes };
    },
  },
  // === COMPLETE GERMAN & ENGLISH CHILDREN'S SONGS (IDEAL FOR COLOR STICKER MODE!) ===
  {
    id: 'kinder_entchen',
    title: 'Alle meine Entchen (Vollständig)',
    artist: 'Deutsches Kinderlied',
    genre: 'Kinder & Einsteiger',
    difficulty: 'Einsteiger',
    tags: ['Deutsch', 'Vollständig', 'Farbnotation', 'C-Dur'],
    bpm: 100,
    timeSignature: [4, 4],
    durationLabel: '0:25',
    sourceLabel: 'Volkslied (Public Domain)',
    build: () => {
      const bpm = 100;
      const q = 60 / bpm;
      const melody: Array<[number, number]> = [
        [60, 1], [62, 1], [64, 1], [65, 1], [67, 2], [67, 2],
        [69, 1], [69, 1], [69, 1], [69, 1], [67, 4],
        [69, 1], [69, 1], [69, 1], [69, 1], [67, 4],
        [65, 1], [65, 1], [65, 1], [65, 1], [64, 2], [64, 2],
        [62, 1], [62, 1], [62, 1], [62, 1], [60, 4],
      ];
      const notes: MidiLibraryNote[] = [];
      let id = 0;
      let t = 0;
      melody.forEach(([m, beats]) => {
        notes.push({ id: id++, midi: m, time: t, duration: beats * q * 0.9, velocity: 0.84, trackIdx: 0 });
        t += beats * q;
      });
      return { bpm, timeSignature: [4, 4], duration: t + 0.6, tracks: makeTracks(notes, ['Melodie (R.H.)']), notes };
    },
  },
  {
    id: 'kinder_haenschen_klein',
    title: 'Hänschen klein (Vollständig)',
    artist: 'Deutsches Kinderlied',
    genre: 'Kinder & Einsteiger',
    difficulty: 'Einsteiger',
    tags: ['Deutsch', 'Vollständig', 'Farbnotation', '5-Finger-Lage'],
    bpm: 104,
    timeSignature: [4, 4],
    durationLabel: '0:38',
    sourceLabel: 'Volkslied (Public Domain)',
    build: () => {
      const bpm = 104;
      const q = 60 / bpm;
      const melody: Array<[number, number]> = [
        [67, 1], [64, 1], [64, 2], [65, 1], [62, 1], [62, 2],
        [60, 1], [62, 1], [64, 1], [65, 1], [67, 1], [67, 1], [67, 2],
        [67, 1], [64, 1], [64, 2], [65, 1], [62, 1], [62, 2],
        [60, 1], [64, 1], [67, 1], [67, 1], [60, 4],
        [62, 1], [62, 1], [62, 1], [62, 1], [62, 1], [64, 1], [65, 2],
        [64, 1], [64, 1], [64, 1], [64, 1], [64, 1], [65, 1], [67, 2],
        [67, 1], [64, 1], [64, 2], [65, 1], [62, 1], [62, 2],
        [60, 1], [64, 1], [67, 1], [67, 1], [60, 4],
      ];
      const bass = [48, 43, 48, 43, 48, 43, 48, 48, 43, 43, 48, 48, 48, 43, 48, 48];
      const notes: MidiLibraryNote[] = [];
      let id = 0;
      let t = 0;
      melody.forEach(([m, beats]) => {
        notes.push({ id: id++, midi: m, time: t, duration: beats * q * 0.9, velocity: 0.84, trackIdx: 0 });
        t += beats * q;
      });
      bass.forEach((b, i) => notes.push({ id: id++, midi: b, time: i * 4 * q, duration: 3.6 * q, velocity: 0.62, trackIdx: 1 }));
      notes.sort((a, b) => a.time - b.time);
      return { bpm, timeSignature: [4, 4], duration: t + 0.6, tracks: makeTracks(notes, ['Melodie (R.H.)', 'Begleitung (L.H.)']), notes };
    },
  },
  {
    id: 'kinder_bruder_jakob',
    title: 'Bruder Jakob / Frère Jacques (Vollständig)',
    artist: 'Deutsches & Franz. Kinderlied',
    genre: 'Kinder & Einsteiger',
    difficulty: 'Einsteiger',
    tags: ['Deutsch', 'Vollständig', 'Farbnotation', 'Kanon'],
    bpm: 108,
    timeSignature: [4, 4],
    durationLabel: '0:20',
    sourceLabel: 'Volkslied (Public Domain)',
    build: () => {
      const bpm = 108;
      const q = 60 / bpm;
      const melody: Array<[number, number]> = [
        [60, 1], [62, 1], [64, 1], [60, 1], [60, 1], [62, 1], [64, 1], [60, 1],
        [64, 1], [65, 1], [67, 2], [64, 1], [65, 1], [67, 2],
        [67, 0.5], [69, 0.5], [67, 0.5], [65, 0.5], [64, 1], [60, 1],
        [67, 0.5], [69, 0.5], [67, 0.5], [65, 0.5], [64, 1], [60, 1],
        [60, 1], [55, 1], [60, 2], [60, 1], [55, 1], [60, 2],
      ];
      const notes: MidiLibraryNote[] = [];
      let id = 0;
      let t = 0;
      melody.forEach(([m, beats]) => {
        notes.push({ id: id++, midi: m, time: t, duration: beats * q * 0.9, velocity: 0.84, trackIdx: 0 });
        t += beats * q;
      });
      for (let bar = 0; bar < 8; bar++) {
        notes.push({ id: id++, midi: 48, time: bar * 4 * q, duration: 1.8 * q, velocity: 0.62, trackIdx: 1 });
        notes.push({ id: id++, midi: 43, time: (bar * 4 + 2) * q, duration: 1.8 * q, velocity: 0.6, trackIdx: 1 });
      }
      notes.sort((a, b) => a.time - b.time);
      return { bpm, timeSignature: [4, 4], duration: t + 0.6, tracks: makeTracks(notes, ['Melodie (R.H.)', 'Bass (L.H.)']), notes };
    },
  },
  {
    id: 'kinder_fuchs_gans',
    title: 'Fuchs, du hast die Gans gestohlen (Vollständig)',
    artist: 'Deutsches Kinderlied',
    genre: 'Kinder & Einsteiger',
    difficulty: 'Einsteiger',
    tags: ['Deutsch', 'Vollständig', 'Farbnotation', 'C-Dur'],
    bpm: 104,
    timeSignature: [4, 4],
    durationLabel: '0:28',
    sourceLabel: 'Volkslied (Public Domain)',
    build: () => {
      const bpm = 104;
      const q = 60 / bpm;
      const melody: Array<[number, number]> = [
        [60, 1], [62, 1], [64, 1], [65, 1], [67, 1], [69, 1], [67, 2],
        [69, 1], [72, 1], [67, 2], [69, 1], [72, 1], [67, 2],
        [65, 1], [65, 1], [65, 1], [65, 1], [64, 1], [64, 1], [64, 2],
        [62, 1], [62, 1], [64, 1], [62, 1], [60, 1], [64, 1], [67, 2],
        [65, 1], [65, 1], [65, 1], [65, 1], [64, 1], [64, 1], [64, 2],
        [62, 1], [62, 1], [64, 1], [62, 1], [60, 4],
      ];
      const notes: MidiLibraryNote[] = [];
      let id = 0;
      let t = 0;
      melody.forEach(([m, beats]) => {
        notes.push({ id: id++, midi: m, time: t, duration: beats * q * 0.9, velocity: 0.84, trackIdx: 0 });
        t += beats * q;
      });
      return { bpm, timeSignature: [4, 4], duration: t + 0.6, tracks: makeTracks(notes, ['Melodie (R.H.)']), notes };
    },
  },
  {
    id: 'kinder_backe_kuchen',
    title: 'Backe, backe Kuchen (Vollständig)',
    artist: 'Deutsches Kinderlied',
    genre: 'Kinder & Einsteiger',
    difficulty: 'Einsteiger',
    tags: ['Deutsch', 'Vollständig', 'Farbnotation', 'Sehr leicht'],
    bpm: 102,
    timeSignature: [4, 4],
    durationLabel: '0:20',
    sourceLabel: 'Volkslied (Public Domain)',
    build: () => {
      const bpm = 102;
      const q = 60 / bpm;
      const melody: Array<[number, number]> = [
        [67, 1], [67, 1], [69, 1], [69, 1], [67, 2], [64, 2],
        [67, 1], [67, 1], [69, 1], [69, 1], [67, 2], [64, 2],
        [65, 1], [65, 1], [64, 1], [64, 1], [62, 1], [62, 1], [60, 2],
        [65, 1], [65, 1], [64, 1], [64, 1], [62, 1], [62, 1], [60, 2],
      ];
      const notes: MidiLibraryNote[] = [];
      let id = 0;
      let t = 0;
      melody.forEach(([m, beats]) => {
        notes.push({ id: id++, midi: m, time: t, duration: beats * q * 0.9, velocity: 0.84, trackIdx: 0 });
        t += beats * q;
      });
      return { bpm, timeSignature: [4, 4], duration: t + 0.6, tracks: makeTracks(notes, ['Melodie (R.H.)']), notes };
    },
  },
  {
    id: 'ode_an_die_freude',
    title: 'Ode an die Freude – 9. Sinfonie (Leicht, Vollständig)',
    artist: 'Ludwig van Beethoven',
    genre: 'Kinder & Einsteiger',
    difficulty: 'Einsteiger',
    tags: ['Deutsch', 'Vollständig', 'Farbnotation', '5-Finger-Lage'],
    bpm: 104,
    timeSignature: [4, 4],
    durationLabel: '0:20',
    sourceLabel: 'Public Domain Arrangement',
    build: () => {
      const bpm = 104;
      const q = 60 / bpm;
      const melody: Array<[number, number]> = [
        [64, 1], [64, 1], [65, 1], [67, 1], [67, 1], [65, 1], [64, 1], [62, 1],
        [60, 1], [60, 1], [62, 1], [64, 1], [64, 1.5], [62, 0.5], [62, 2],
        [64, 1], [64, 1], [65, 1], [67, 1], [67, 1], [65, 1], [64, 1], [62, 1],
        [60, 1], [60, 1], [62, 1], [64, 1], [62, 1.5], [60, 0.5], [60, 2],
      ];
      const bass = [48, 43, 48, 43, 48, 43, 48, 43];
      const notes: MidiLibraryNote[] = [];
      let id = 0;
      let t = 0;
      melody.forEach(([m, beats]) => {
        notes.push({ id: id++, midi: m, time: t, duration: beats * q * 0.9, velocity: 0.82, trackIdx: 0 });
        t += beats * q;
      });
      bass.forEach((b, i) => notes.push({ id: id++, midi: b, time: i * 4 * q, duration: 3.6 * q, velocity: 0.65, trackIdx: 1 }));
      notes.sort((a, b) => a.time - b.time);
      return { bpm, timeSignature: [4, 4], duration: t + 0.6, tracks: makeTracks(notes, ['Rechte Hand', 'Linke Hand']), notes };
    },
  },
  {
    id: 'kinder_twinkle',
    title: 'Twinkle, Twinkle, Little Star / Morgen kommt der Weihnachtsmann',
    artist: 'English Nursery Rhyme',
    genre: 'Kinder & Einsteiger',
    difficulty: 'Einsteiger',
    tags: ['Englisch', 'Deutsch', 'Vollständig', 'Farbnotation'],
    bpm: 100,
    timeSignature: [4, 4],
    durationLabel: '0:30',
    sourceLabel: 'Public Domain',
    build: () => {
      const bpm = 100;
      const q = 60 / bpm;
      const melody: Array<[number, number]> = [
        [60, 1], [60, 1], [67, 1], [67, 1], [69, 1], [69, 1], [67, 2],
        [65, 1], [65, 1], [64, 1], [64, 1], [62, 1], [62, 1], [60, 2],
        [67, 1], [67, 1], [65, 1], [65, 1], [64, 1], [64, 1], [62, 2],
        [67, 1], [67, 1], [65, 1], [65, 1], [64, 1], [64, 1], [62, 2],
        [60, 1], [60, 1], [67, 1], [67, 1], [69, 1], [69, 1], [67, 2],
        [65, 1], [65, 1], [64, 1], [64, 1], [62, 1], [62, 1], [60, 2],
      ];
      const bass = [48, 53, 53, 48, 55, 53, 55, 53, 48, 53, 53, 48];
      const notes: MidiLibraryNote[] = [];
      let id = 0;
      let t = 0;
      melody.forEach(([m, beats]) => {
        notes.push({ id: id++, midi: m, time: t, duration: beats * q * 0.9, velocity: 0.84, trackIdx: 0 });
        t += beats * q;
      });
      bass.forEach((b, i) => notes.push({ id: id++, midi: b, time: i * 4 * q, duration: 3.6 * q, velocity: 0.62, trackIdx: 1 }));
      notes.sort((a, b) => a.time - b.time);
      return { bpm, timeSignature: [4, 4], duration: t + 0.6, tracks: makeTracks(notes, ['Melodie (R.H.)', 'Bass (L.H.)']), notes };
    },
  },
  {
    id: 'kinder_mary_lamb',
    title: 'Mary Had a Little Lamb (Vollständig)',
    artist: 'English Nursery Rhyme',
    genre: 'Kinder & Einsteiger',
    difficulty: 'Einsteiger',
    tags: ['Englisch', 'Vollständig', 'Farbnotation', 'Sehr leicht'],
    bpm: 108,
    timeSignature: [4, 4],
    durationLabel: '0:19',
    sourceLabel: 'Public Domain',
    build: () => {
      const bpm = 108;
      const q = 60 / bpm;
      const melody: Array<[number, number]> = [
        [64, 1], [62, 1], [60, 1], [62, 1], [64, 1], [64, 1], [64, 2],
        [62, 1], [62, 1], [62, 2], [64, 1], [67, 1], [67, 2],
        [64, 1], [62, 1], [60, 1], [62, 1], [64, 1], [64, 1], [64, 1], [64, 1],
        [62, 1], [62, 1], [64, 1], [62, 1], [60, 4],
      ];
      const notes: MidiLibraryNote[] = [];
      let id = 0;
      let t = 0;
      melody.forEach(([m, beats]) => {
        notes.push({ id: id++, midi: m, time: t, duration: beats * q * 0.9, velocity: 0.84, trackIdx: 0 });
        t += beats * q;
      });
      return { bpm, timeSignature: [4, 4], duration: t + 0.6, tracks: makeTracks(notes, ['Melodie (R.H.)']), notes };
    },
  },
  {
    id: 'kinder_old_macdonald',
    title: 'Old MacDonald Had a Farm (Vollständig)',
    artist: 'English Nursery Rhyme',
    genre: 'Kinder & Einsteiger',
    difficulty: 'Einsteiger',
    tags: ['Englisch', 'Vollständig', 'Farbnotation', 'C-Dur'],
    bpm: 112,
    timeSignature: [4, 4],
    durationLabel: '0:19',
    sourceLabel: 'Public Domain',
    build: () => {
      const bpm = 112;
      const q = 60 / bpm;
      const melody: Array<[number, number]> = [
        [60, 1], [60, 1], [60, 1], [55, 1], [57, 1], [57, 1], [55, 2],
        [64, 1], [64, 1], [62, 1], [62, 1], [60, 3], [55, 1],
        [60, 1], [60, 1], [60, 1], [55, 1], [57, 1], [57, 1], [55, 2],
        [64, 1], [64, 1], [62, 1], [62, 1], [60, 4],
      ];
      const notes: MidiLibraryNote[] = [];
      let id = 0;
      let t = 0;
      melody.forEach(([m, beats]) => {
        notes.push({ id: id++, midi: m, time: t, duration: beats * q * 0.9, velocity: 0.84, trackIdx: 0 });
        t += beats * q;
      });
      return { bpm, timeSignature: [4, 4], duration: t + 0.6, tracks: makeTracks(notes, ['Melodie (R.H.)']), notes };
    },
  },
  {
    id: 'kinder_london_bridge',
    title: 'London Bridge Is Falling Down (Vollständig)',
    artist: 'English Nursery Rhyme',
    genre: 'Kinder & Einsteiger',
    difficulty: 'Einsteiger',
    tags: ['Englisch', 'Vollständig', 'Farbnotation'],
    bpm: 108,
    timeSignature: [4, 4],
    durationLabel: '0:19',
    sourceLabel: 'Public Domain',
    build: () => {
      const bpm = 108;
      const q = 60 / bpm;
      const melody: Array<[number, number]> = [
        [67, 1.5], [69, 0.5], [67, 1], [65, 1], [64, 1], [65, 1], [67, 2],
        [62, 1], [64, 1], [65, 2], [64, 1], [65, 1], [67, 2],
        [67, 1.5], [69, 0.5], [67, 1], [65, 1], [64, 1], [65, 1], [67, 2],
        [62, 2], [67, 2], [64, 1], [60, 3],
      ];
      const notes: MidiLibraryNote[] = [];
      let id = 0;
      let t = 0;
      melody.forEach(([m, beats]) => {
        notes.push({ id: id++, midi: m, time: t, duration: beats * q * 0.9, velocity: 0.84, trackIdx: 0 });
        t += beats * q;
      });
      return { bpm, timeSignature: [4, 4], duration: t + 0.6, tracks: makeTracks(notes, ['Melodie (R.H.)']), notes };
    },
  },
  {
    id: 'kinder_happy_birthday',
    title: 'Happy Birthday to You (Vollständig)',
    artist: 'English / International',
    genre: 'Kinder & Einsteiger',
    difficulty: 'Einsteiger',
    tags: ['Englisch', '3/4 Takt', 'Vollständig', 'Farbnotation'],
    bpm: 104,
    timeSignature: [3, 4],
    durationLabel: '0:16',
    sourceLabel: 'Public Domain',
    build: () => {
      const bpm = 104;
      const q = 60 / bpm;
      const melody: Array<[number, number]> = [
        [60, 0.75], [60, 0.25], [62, 1], [60, 1], [65, 1], [64, 2],
        [60, 0.75], [60, 0.25], [62, 1], [60, 1], [67, 1], [65, 2],
        [60, 0.75], [60, 0.25], [72, 1], [69, 1], [65, 1], [64, 1], [62, 1],
        [70, 0.75], [70, 0.25], [69, 1], [65, 1], [67, 1], [65, 2],
      ];
      const notes: MidiLibraryNote[] = [];
      let id = 0;
      let t = 0;
      melody.forEach(([m, beats]) => {
        notes.push({ id: id++, midi: m, time: t, duration: beats * q * 0.9, velocity: 0.84, trackIdx: 0 });
        t += beats * q;
      });
      return { bpm, timeSignature: [3, 4], duration: t + 0.6, tracks: makeTracks(notes, ['Melodie (R.H.)']), notes };
    },
  },
];

export const ALL_MIDI_GENRES: MidiGenre[] = [
  'Barock',
  'Klassik',
  'Romantik',
  'Impressionismus',
  'Ragtime',
  'Jazz',
  'Neo-Soul',
  'Technik & Etüde',
  'Kinder & Einsteiger',
];
