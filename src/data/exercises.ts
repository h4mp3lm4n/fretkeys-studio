import { SOLO_ROCK_EXERCISES } from './soloExercises';

export type ExerciseTopic =
  | 'Warmup & Akrobatik'
  | 'Classic & Hard Rock'
  | 'Jazz'
  | 'Jazz Voicings'
  | 'Walking Bass'
  | 'Funk'
  | 'Neo-Soul'
  | 'Solieren'
  | 'Fast-Picking'
  | 'Legato'
  | 'Fingerstyle'
  | 'Blues'
  | 'Bluegrass'
  | 'Klavier';

export type ExerciseSection =
  | 'Warmup & Fingerakrobatik'
  | 'Solo-Läufe, Classic & Hard Rock'
  | 'Technik: Picking & Legato'
  | 'Funk & Rhythmus-Strumming'
  | 'Jazz, Voicings & Walking Bass'
  | 'Blues, Bluegrass & Fingerstyle'
  | 'Klavier & Tasten';

export type DifficultyLevel = 'Einsteiger' | 'Mittel' | 'Fortgeschritten';

export interface PracticeExercise {
  id: string;
  title: string;
  section?: ExerciseSection;
  topics: ExerciseTopic[];
  instrument: 'Gitarre' | 'Klavier' | 'Beide';
  difficulty: DifficultyLevel;
  startBpm: number;
  targetBpm: number;
  durationMin: number;
  barsCount?: number;
  source?: string;
  summary: string;
  techniqueFocus: string;
  progressionTip: string;
  fileUrl?: string;
  alphaTex?: string;
  previewNotes: number[];
}

export const ALL_TOPICS: ExerciseTopic[] = [
  'Warmup & Akrobatik',
  'Classic & Hard Rock',
  'Solieren',
  'Fast-Picking',
  'Legato',
  'Funk',
  'Jazz',
  'Jazz Voicings',
  'Walking Bass',
  'Neo-Soul',
  'Fingerstyle',
  'Blues',
  'Bluegrass',
  'Klavier',
];

export const ALL_SECTIONS: ExerciseSection[] = [
  'Warmup & Fingerakrobatik',
  'Solo-Läufe, Classic & Hard Rock',
  'Technik: Picking & Legato',
  'Funk & Rhythmus-Strumming',
  'Jazz, Voicings & Walking Bass',
  'Blues, Bluegrass & Fingerstyle',
  'Klavier & Tasten',
];

export function getExerciseSection(ex: PracticeExercise): ExerciseSection {
  if (ex.section) return ex.section;
  if (ex.instrument === 'Klavier' || ex.topics.includes('Klavier')) return 'Klavier & Tasten';
  if (ex.topics.includes('Warmup & Akrobatik')) return 'Warmup & Fingerakrobatik';
  if (ex.topics.includes('Classic & Hard Rock')) return 'Solo-Läufe, Classic & Hard Rock';
  if (ex.topics.includes('Walking Bass') || ex.topics.includes('Jazz Voicings') || ex.topics.includes('Jazz'))
    return 'Jazz, Voicings & Walking Bass';
  if (ex.topics.includes('Funk') || ex.topics.includes('Neo-Soul')) return 'Funk & Rhythmus-Strumming';
  if (ex.topics.includes('Fast-Picking') || ex.topics.includes('Legato')) return 'Technik: Picking & Legato';
  return 'Blues, Bluegrass & Fingerstyle';
}

export const CURATED_EXERCISES: PracticeExercise[] = [
  {
    id: 'jazz-251-guide-tones',
    title: 'Jazz ii–V–I Bebop Enclosure & Guide-Tones',
    topics: ['Jazz', 'Solieren'],
    instrument: 'Gitarre',
    difficulty: 'Mittel',
    startBpm: 80,
    targetBpm: 145,
    durationMin: 8,
    summary: 'Verbindet Terzen und Septimen über Dm7 – G7 – Cmaj7 mit chromatischen Enclosures auf Ziel-Zählzeiten.',
    techniqueFocus: 'Sauberes Swing-Feel (Betonung auf "und"), minimaler Lagenwechsel in Position 5.',
    progressionTip: 'Wenn 120 BPM entspannt sitzen, im Quintenzirkel durch alle 12 Tonarten transponieren.',
    previewNotes: [50, 53, 57, 60, 59, 62, 65, 64],
    alphaTex: `\\title "Jazz ii-V-I Bebop Enclosure"
\\tempo 96
.
\\track "Jazz Guitar"
\\staff {score tabs}
\\instrument 26
:8 5.5 8.5 7.4 5.3 7.3 6.2 8.2 5.1 |
7.1 6.1 5.1 8.2 6.2 7.3 5.3 6.4 |
5.4 7.4 5.3 7.3 8.2 5.1 7.1 8.1 |
(5.5 7.4 5.3 5.2).1`,
  },
  {
    id: 'funk-16th-ghost',
    title: '16tel Funk Scratch & Syncopated Triads (E9)',
    topics: ['Funk'],
    instrument: 'Gitarre',
    difficulty: 'Mittel',
    startBpm: 76,
    targetBpm: 112,
    durationMin: 7,
    summary: 'Klassisches Nile-Rodgers / Cory-Wong 16tel-Pendel mit Dead-Notes (Ghost Strums) und knackigen 9er-Voicings.',
    techniqueFocus: 'Rechte Hand bleibt ununterbrochen im 16tel-Wechselschlag; Greifhand dämpft präzise zwischen den Akzenten.',
    progressionTip: 'Erst auf 80 BPM mit der Funk-Drum-Machine üben und auf 100% gleichmäßiges Pendeln achten.',
    previewNotes: [52, 56, 62, 66, 64, 62, 56, 52],
    alphaTex: `\\title "Funk 16th Syncopated E9"
\\tempo 92
.
\\track "Clean Funk Guitar"
\\staff {score tabs}
\\instrument 27
:16 (7.5 6.4 7.3 7.2) x.3 x.3 (7.5 6.4 7.3 7.2) x.3 (7.5 6.4 7.3 7.2) x.3 x.3 (9.4 9.3 9.2) x.3 x.3 (7.4 7.3 7.2) x.3 (9.4 9.3 9.2) x.3 x.3 |
:8 (7.5 6.4 7.3 7.2) x.3 (7.5 6.4 7.3 7.2) x.3 (9.4 9.3 9.2) x.3 (7.4 7.3 7.2) r`,
  },
  {
    id: 'neosoul-double-stops',
    title: 'Neo-Soul Hammer-On Double-Stops & m9 Slides',
    topics: ['Neo-Soul', 'Fingerstyle'],
    instrument: 'Gitarre',
    difficulty: 'Mittel',
    startBpm: 68,
    targetBpm: 92,
    durationMin: 8,
    summary: 'Mateus-Asato / Tom-Misch inspirierte Akkord-Melodie-Verzierungen über Em9 – A13 – Dmaj9.',
    techniqueFocus: 'Hybrid- oder Fingerpicking, weiche Hammer-Ons aus dem liegenden Barré, leichtes Laid-Back-Feel.',
    progressionTip: 'Experimentiere mit Dynamik (leise Ghost-Noten vs. singende Melodietöne auf H- und e-Saite).',
    previewNotes: [52, 59, 62, 66, 67, 66, 64, 61],
    alphaTex: `\\title "Neo-Soul Double-Stops in Em9"
\\tempo 80
.
\\track "Neo-Soul Clean"
\\staff {score tabs}
\\instrument 27
:8 (7.5 5.4 7.3 7.2) (7.3{h} 7.2{h}) (9.3 8.2) (7.3 7.2) (5.5 5.4 6.3 7.2) (6.3 7.2) (7.3 9.2) (6.3 7.2) |
(5.5 4.4 6.3 5.2).4 (6.3 5.2).8 (7.3 7.2).8 (6.3 5.2).2`,
  },
  {
    id: 'fast-picking-3nps',
    title: 'Alternate Picking 3-Notes-Per-String Sequenz (6er-Gruppen)',
    topics: ['Fast-Picking', 'Solieren'],
    instrument: 'Gitarre',
    difficulty: 'Fortgeschritten',
    startBpm: 75,
    targetBpm: 150,
    durationMin: 10,
    summary: 'Paul-Gilbert-inspirierte 6-Noten-Sextolen-Kette für perfekte Synchronisation von Anschlag- und Greifhand.',
    techniqueFocus: 'Striktes Alternate Picking (Down-Up), minimaler Pick-Weg (Pick Slanting bei Saitenwechsel), keine Anspannung.',
    progressionTip: 'Nutze den Speed-Trainer in der Drum-Machine: +3 BPM alle 4 sauberen Takte.',
    previewNotes: [57, 59, 60, 62, 64, 65, 67, 69],
    alphaTex: `\\title "Fast Picking 3NPS 6er-Pattern"
\\tempo 100
.
\\track "Lead Guitar"
\\staff {score tabs}
\\instrument 29
:16 5.6 7.6 8.6 5.5 7.5 8.5 7.6 8.6 5.5 7.5 8.5 5.4 7.5 8.5 5.4 7.4 |
5.4 7.4 9.4 5.3 7.3 9.3 7.4 9.4 5.3 7.3 9.3 6.2 8.2 10.2 8.2 10.2`,
  },
  {
    id: 'fast-picking-spider',
    title: 'Chromatische Spider- & String-Skipping Präzision',
    topics: ['Fast-Picking'],
    instrument: 'Gitarre',
    difficulty: 'Einsteiger',
    startBpm: 70,
    targetBpm: 135,
    durationMin: 6,
    summary: 'Bewährte Warmup- & Picking-Übung für Fingerunabhängigkeit und sauberes Überspringen von Saiten.',
    techniqueFocus: 'Alle Finger bleiben nah am Griffbrett (Economy of Motion), gleichmäßige Lautstärke bei Up- und Downstrokes.',
    progressionTip: 'Variiere die Fingerkombination täglich: 1-2-3-4, 1-3-2-4, 1-4-2-3, 4-3-2-1.',
    previewNotes: [45, 46, 47, 48, 55, 56, 57, 58],
    alphaTex: `\\title "Spider & String-Skipping Warmup"
\\tempo 90
.
\\track "Electric Guitar"
\\staff {score tabs}
\\instrument 27
:16 5.6 6.6 7.6 8.6 5.4 6.4 7.4 8.4 5.5 6.5 7.5 8.5 5.3 6.3 7.3 8.3 |
8.3 7.3 6.3 5.3 8.5 7.5 6.5 5.5 8.4 7.4 6.4 5.4 8.6 7.6 6.6 5.6`,
  },
  {
    id: 'legato-dorian-flows',
    title: 'Fließendes Legato – Dorische 3NPS Hammer-On & Pull-Off Kaskade',
    topics: ['Legato', 'Solieren'],
    instrument: 'Gitarre',
    difficulty: 'Mittel',
    startBpm: 72,
    targetBpm: 132,
    durationMin: 8,
    summary: 'Auf- und absteigende A-Dorisch-Linien mit nur einem Anschlag pro Saite für geschmeidigen Fusion-Sound.',
    techniqueFocus: 'Pull-Offs leicht nach unten "zupfen" (nicht nur abheben!), damit jeder Ton identische Lautstärke hat.',
    progressionTip: 'Übe die Passage komplett ohne rechten Hand-Anschlag (nur Left-Hand Tap/Hammer) zur Kraftbildung.',
    previewNotes: [57, 59, 60, 62, 64, 66, 67, 69],
    alphaTex: `\\title "Dorian Legato Flow (A Dorisch)"
\\tempo 88
.
\\track "Fusion Lead"
\\staff {score tabs}
\\instrument 29
:16 5.6{h} 7.6{h} 8.6 5.5{h} 7.5{h} 9.5 5.4{h} 7.4{h} 9.4 5.3{h} 7.3{h} 9.3 7.2{h} 8.2{h} 10.2 7.1 |
10.1{p} 8.1{p} 7.1 10.2{p} 8.2{p} 7.2 9.3{p} 7.3{p} 5.3 9.4{p} 7.4{p} 5.4 9.5{p} 7.5{p} 5.5 8.6`,
  },
  {
    id: 'fingerstyle-travis',
    title: 'Travis Picking – Unabhängiger Wechselbass & Synkopen',
    topics: ['Fingerstyle', 'Bluegrass'],
    instrument: 'Gitarre',
    difficulty: 'Einsteiger',
    startBpm: 68,
    targetBpm: 118,
    durationMin: 8,
    summary: 'Das Fundament des modernen Fingerstyle: Daumen spielt konstanten Viertel-Wechselbass, Zeige- & Mittelfinger synkopieren.',
    techniqueFocus: 'Daumen leicht palm-muted auf den Basssaiten (E/A/D), Melodiefinger klingen frei darüber aus.',
    progressionTip: 'Sobald C – Am – F – G flüssig läuft, eigene Melodietöne auf den hohen Saiten ergänzen.',
    previewNotes: [48, 55, 60, 64, 52, 60, 55, 64],
    alphaTex: `\\title "Travis Picking Grundlagen (C - Am)"
\\tempo 94
.
\\track "Acoustic Guitar"
\\staff {score tabs}
\\instrument 25
:8 (3.5 1.2) 2.4 0.3 3.5 1.2 2.4 0.3 2.4 |
(0.5 1.2) 2.4 2.3 0.5 1.2 2.4 2.3 2.4 |
(3.6 0.1) 0.4 0.3 3.6 0.2 0.4 0.3 0.4 |
(3.5 1.2 0.3).1`,
  },
  {
    id: 'blues-bb-box',
    title: 'Blues Phrasing – Mix aus Moll- & Dur-Pentatonik (A-Blues)',
    topics: ['Blues', 'Solieren'],
    instrument: 'Gitarre',
    difficulty: 'Einsteiger',
    startBpm: 76,
    targetBpm: 110,
    durationMin: 7,
    summary: 'Authentisches Blues-Vokabular: Übergang von der b3 auf die große 3 (Micro-Bend), Blue Note (b5) & Turnaround.',
    techniqueFocus: 'Ausdrucksstarkes Vibrato auf Zielnoten und gezieltes Auflösen der b3 → 3 über den A7-Akkord.',
    progressionTip: 'Übe Call-and-Response: 1 Takt Lick spielen, 1 Takt selbst variieren!',
    previewNotes: [57, 60, 61, 62, 63, 64, 67, 69],
    alphaTex: `\\title "A-Blues Classic Lick & Turnaround"
\\tempo 90
.
\\track "Blues Guitar"
\\staff {score tabs}
\\instrument 27
:8 5.3{h} 6.3 5.2 8.2 7.3 8.3 7.3 5.3 |
7.4 5.4 7.5 6.5 5.5 3.6 5.6.4 |
:8 5.1 8.2 7.2 6.2 5.2 7.4 5.4 (5.6 5.4 6.3).4`,
  },
  {
    id: 'bluegrass-g-run',
    title: 'Bluegrass Flatpicking – G-Run & Crosspicking Roll',
    topics: ['Bluegrass', 'Fast-Picking'],
    instrument: 'Gitarre',
    difficulty: 'Mittel',
    startBpm: 84,
    targetBpm: 148,
    durationMin: 8,
    summary: 'Legendärer Lester-Flatt G-Run kombiniert mit 3-Saiten Crosspicking-Muster für knackigen Akustik-Drive.',
    techniqueFocus: 'Kräftiger Down-Up Wechselschlag (Down auf Zählzeiten, Up auf "und"), offene Saiten voll klingen lassen.',
    progressionTip: 'Starte langsam mit der Bluegrass-Train-Drum-Machine und achte auf absolut konstanten Ton.',
    previewNotes: [43, 47, 50, 52, 55, 59, 62, 55],
    alphaTex: `\\title "Bluegrass G-Run & Crosspicking"
\\tempo 112
.
\\track "Steel Acoustic"
\\staff {score tabs}
\\instrument 25
:8 3.6 0.5 1.5{h} 2.5 0.4 2.4 0.3 0.4 |
2.4 0.4 2.5 0.5 3.6.4 r.4 |
:8 0.4 0.3 0.2 0.4 0.3 0.2 0.4 0.3 |
(3.6 2.5 0.4 0.3 0.2 3.1).1`,
  },
  {
    id: 'soloing-target-tones',
    title: 'Melodisches Solieren – Chord-Tone Targeting über I–V–vi–IV',
    topics: ['Solieren', 'Jazz', 'Neo-Soul'],
    instrument: 'Beide',
    difficulty: 'Mittel',
    startBpm: 85,
    targetBpm: 120,
    durationMin: 9,
    summary: 'Lerne auf Schlag 1 jedes Akkordwechsels gezielt die 3. oder 7. Stufe zu treffen – sofort hörbar melodischeres Spiel.',
    techniqueFocus: 'Den nächsten Akkord 2 Beats vorausdenken; kleine Intervallschritte (Sekunden/Terzen) verbinden die Harmonien.',
    progressionTip: 'Kombiniere diese Übung direkt mit dem Progression-Trainer (Folgeakkord-Vorschau aktivieren!).',
    previewNotes: [64, 67, 71, 69, 67, 64, 62, 60],
    alphaTex: `\\title "Chord-Tone Targeting (C - G - Am - F)"
\\tempo 96
.
\\track "Lead"
\\staff {score tabs}
\\instrument 26
:8 5.2 6.2 8.2 5.1 7.1 8.1 7.1 5.1 |
8.2 7.3 5.3 7.4 5.4 7.4 5.3 7.3 |
8.2 5.1 8.1 7.1 5.1 8.2 6.2 5.2 |
6.2.2 5.2.2`,
  },
  {
    id: 'piano-hanon-arpeggios',
    title: 'Klavier Technik – Gebrochene Vierklänge & Daumenuntersatz',
    topics: ['Klavier', 'Jazz', 'Neo-Soul'],
    instrument: 'Klavier',
    difficulty: 'Einsteiger',
    startBpm: 72,
    targetBpm: 120,
    durationMin: 8,
    summary: 'Fließende Cmaj7 – Dm7 – Em7 – Fmaj7 Arpeggios mit lockerem Handgelenk und geräuschlosem Daumenuntersatz.',
    techniqueFocus: 'Gewicht aus dem Arm statt verkrampfter Finger; gleichmäßige Dynamik über alle 5 Finger.',
    progressionTip: 'Übe erst Hände getrennt, dann parallel – nutze den MIDI Synthesia Player für Tempo-Steigerung.',
    previewNotes: [60, 64, 67, 71, 72, 71, 67, 64],
    alphaTex: `\\title "Klavier Vierklang-Arpeggios"
\\tempo 88
.
\\track "Acoustic Grand Piano"
\\staff {score}
\\tuning piano
\\instrument 0
:8 C4 E4 G4 B4 C5 B4 G4 E4 |
D4 F4 A4 C5 D5 C5 A4 F4 |
E4 G4 B4 D5 E5 D5 B4 G4 |
F4 A4 C5 E5 F5 E5 C5 A4`,
  },
  {
    id: 'jazz-bebop-parker-line',
    title: 'Bebop Dominant Scale – Charlie-Parker-Style Chromatic Descent',
    topics: ['Jazz', 'Solieren'],
    instrument: 'Gitarre',
    difficulty: 'Fortgeschritten',
    startBpm: 88,
    targetBpm: 165,
    durationMin: 9,
    summary: 'Klassische Bebop-8tel-Linie über G7 → Cmaj7 mit Durchgangs-Septime (F# zwischen G und F) für perfekten Downbeat-Flow.',
    techniqueFocus: 'Alle Akkordtöne landen auf schweren Zählzeiten (1, 2, 3, 4); leichte Ghost-Artikulation auf den Offbeats.',
    progressionTip: 'In 3 verschiedenen Lagen (Bund 3, Bund 7, Bund 10) lernen und mit Swing-Ride üben.',
    previewNotes: [67, 66, 65, 64, 62, 60, 59, 60],
    alphaTex: `\\title "Bebop Dominant Descent (G7 - Cmaj7)"
\\tempo 116
.
\\track "Jazz Archtop"
\\staff {score tabs}
\\instrument 26
:8 8.2 7.2 6.2 5.2 7.3 5.3 4.3 5.3 |
7.4 5.4 8.5 7.5 5.5 7.4 5.3 6.2 |
5.2 8.2 7.1 5.1 8.2 5.2 7.3 5.3 |
(3.5 5.4 4.3 5.2).1`,
  },
  {
    id: 'jazz-minor-altered',
    title: 'Jazz Moll iiø7–V7alt–im7 (Alterierte Spannung & Auflösung)',
    topics: ['Jazz', 'Solieren'],
    instrument: 'Gitarre',
    difficulty: 'Fortgeschritten',
    startBpm: 84,
    targetBpm: 140,
    durationMin: 9,
    summary: 'Authentische Jazz-Moll-Linie über Bm7b5 – E7alt (b9/#9/#5) – Am9 mit dramatischer Leittonauflösung.',
    techniqueFocus: 'Fokussiere auf die b9 (F) und #9 (G) über E7 und löse sauber auf Terz (C) oder Quinte (E) von Am9 auf.',
    progressionTip: 'Kombiniere diese Linie direkt mit der Progression "Moll iiø–V7b9–im7" im Progression-Trainer.',
    previewNotes: [59, 62, 65, 69, 68, 65, 63, 64],
    alphaTex: `\\title "Minor ii-V-i Altered Line (Am)"
\\tempo 102
.
\\track "Jazz Guitar"
\\staff {score tabs}
\\instrument 26
:8 7.6 5.5 8.5 7.4 6.4 5.4 8.5 6.5 |
7.5 6.4 9.4 6.3 8.3 6.2 5.2 8.2 |
5.1 7.1 8.1 7.1 5.1 8.2 5.2 7.3 |
(5.6 5.4 5.3 7.1).1`,
  },
  {
    id: 'sweep-arpeggios-3s5s',
    title: 'Sweep Picking – 3- & 5-Saiten Moll/Dur-Arpeggios (Am → F → E)',
    topics: ['Fast-Picking', 'Solieren'],
    instrument: 'Gitarre',
    difficulty: 'Fortgeschritten',
    startBpm: 68,
    targetBpm: 138,
    durationMin: 10,
    summary: 'Saubere Economy/Sweep-Bewegung über 5 Saiten (Am – F – E) mit sauberem Finger-Rolling und Saitendämpfung.',
    techniqueFocus: 'Greifhand hebt jeden Ton sofort wieder an, damit kein Akkord entsteht – Rechte Hand gleitet in einer fließenden Bewegung.',
    progressionTip: 'Erst absolut sauber und leise (clean!) üben, bevor Distortion/Overdrive dazukommt.',
    previewNotes: [57, 60, 64, 69, 72, 69, 64, 60],
    alphaTex: `\\title "Sweep Picking Arpeggios (Am - F - E)"
\\tempo 86
.
\\track "Lead Guitar"
\\staff {score tabs}
\\instrument 29
:16 12.5 10.4 9.3 10.2 8.1{h} 12.1{p} 8.1 10.2 9.3 10.4 12.5 10.4 9.3 10.2 8.1 12.1 |
8.5 7.4 5.3 6.2 5.1{h} 8.1{p} 5.1 6.2 7.5 6.4 4.3 5.2 4.1{h} 7.1{p} 4.1 5.2`,
  },
  {
    id: 'funk-octaves-double-stops',
    title: 'Funk Octaves, Slides & Staccato Double-Stops (A Dorisch)',
    topics: ['Funk', 'Neo-Soul'],
    instrument: 'Gitarre',
    difficulty: 'Mittel',
    startBpm: 84,
    targetBpm: 112,
    durationMin: 7,
    summary: 'Knackige Funk-Rhythm-Single-Note-Riffs mit Oktaven, 9er-Slides und Staccato-Akzenten auf den 16tel-Synkopen.',
    techniqueFocus: 'Zeigefinger dämpft die dazwischenliegende Saite beim Oktavspiel komplett ab; kurze, trockene Tondauer.',
    progressionTip: 'Übe mit dem "Dry Piccolo Funk" Kit und dem Preset "Tight Funk Pocket" in der Drum-Machine.',
    previewNotes: [45, 57, 48, 60, 50, 62, 52, 64],
    alphaTex: `\\title "Funk Octaves & Staccato Groove"
\\tempo 98
.
\\track "Funk Strat"
\\staff {score tabs}
\\instrument 27
:16 (5.6 7.4) r (5.6 7.4) r (8.6 10.4) r (5.5 7.3) r (7.5 9.3) r r (5.5 7.3) (7.5 9.3) r (5.6 7.4) r |
5.3 7.3 (5.2 5.1) r (7.2 7.1) r (5.2 5.1) r 7.3 5.3 7.4 5.4 7.5 r 5.6.8`,
  },
  {
    id: 'neosoul-dim-passing',
    title: 'Neo-Soul Gospel Passing Chords (Cmaj9 – C#°7 – Dm9 – G13)',
    topics: ['Neo-Soul', 'Jazz'],
    instrument: 'Beide',
    difficulty: 'Mittel',
    startBpm: 72,
    targetBpm: 94,
    durationMin: 8,
    summary: 'Verminderte Durchgangsakkorde (C#°7 → Dm9, D#°7 → Em9) mit geschmeidigem Voice-Leading und kleinen Verzierungen.',
    techniqueFocus: 'Alle Akkordtöne gleichmäßig warm anschlagen (Fingerstyle / Hybrid-Picking), chromatische Basslinie klar betonen.',
    progressionTip: 'Auch perfekt am Klavier mit dem "Neo-Soul Rhodes" oder "Warm Analog Pad" Sound nachspielbar.',
    previewNotes: [48, 52, 59, 62, 49, 55, 58, 64],
    alphaTex: `\\title "Neo-Soul Gospel Passing Chords"
\\tempo 78
.
\\track "Neo-Soul Guitar"
\\staff {score tabs}
\\instrument 27
:4 (3.5 2.4 4.3 3.2) (4.5 2.4 3.3 2.2) (5.5 3.4 5.3 5.2) (3.6 3.4 4.3 5.2) |
:8 (5.5 3.4 5.3 5.2) 7.2 (6.5 4.4 5.3 4.2) 5.2 (7.5 5.4 7.3 7.2).2`,
  },
  {
    id: 'fingerstyle-bach-bouree',
    title: 'Klassik & Fingerstyle – Bach Bourrée in e-Moll (Kontrapunkt)',
    topics: ['Fingerstyle'],
    instrument: 'Gitarre',
    difficulty: 'Mittel',
    startBpm: 76,
    targetBpm: 124,
    durationMin: 9,
    summary: 'Zweistimmiger Kontrapunkt (BWV 996): Unabhängige Bass- und Melodielinie – zeitlose Pflichtübung für Fingerpicking.',
    techniqueFocus: 'Daumen (p) spielt warmen Bass, Zeige-/Mittelfinger (i/m) im Wechselschlag für klare, gesangliche Oberstimme.',
    progressionTip: 'Erst jede Stimme einzeln spielen, danach langsam (75 BPM) zusammenführen und Phrasierung ausarbeiten.',
    previewNotes: [64, 66, 67, 66, 64, 63, 64, 59],
    alphaTex: `\\title "J.S. Bach - Bourree e-Moll (Auszug)"
\\tempo 104
.
\\track "Nylon Guitar"
\\staff {score tabs}
\\instrument 24
:8 0.1 2.1 |
(3.1 0.6).4 (2.1 2.5).8 (0.1 3.5).8 (2.2 2.5).4 (0.1 0.5).4 |
(0.2 2.5).4 (3.2 3.5).8 (0.2 2.5).8 (2.3 0.5).4 (4.4 2.5).8 (0.3 3.5).8 |
(2.3 2.5).4 (0.3 0.5).8 (4.4 3.6).8 (2.4 2.6).4 (0.4 0.6).4`,
  },
  {
    id: 'blues-srv-turnaround',
    title: 'Texas Blues Shuffle & Classic E-Blues Turnaround',
    topics: ['Blues', 'Solieren'],
    instrument: 'Gitarre',
    difficulty: 'Mittel',
    startBpm: 80,
    targetBpm: 118,
    durationMin: 7,
    summary: 'Kraftvoller SRV/Robert-Johnson Shuffle-Groove mit Double-Stop-Rake und klassischem chromatischem Turnaround auf B7.',
    techniqueFocus: 'Kräftiger, rhythmischer Anschlag (Shuffle-Triolen), Abdämpfen ungenutzter Saiten mit dem linken Daumen/Zeigefinger.',
    progressionTip: 'Spiele den Turnaround im Loop mit der "Blues Shuffle (12/8)" Drum-Machine.',
    previewNotes: [40, 52, 55, 56, 59, 58, 57, 56],
    alphaTex: `\\title "Texas Blues Shuffle & E-Turnaround"
\\tempo 98
.
\\track "Blues Strat"
\\staff {score tabs}
\\instrument 29
:8 (0.6 2.5) (0.6 2.5) (0.6 4.5) (0.6 2.5) (0.6 5.5) (0.6 4.5) (0.6 2.5) (0.6 2.5) |
(0.1 4.3) 0.1 (0.1 3.3) 0.1 (0.1 2.3) 0.1 (0.1 1.3) 0.1 |
2.5 1.4 2.3 0.2 (2.5 1.4 2.3 0.2 2.1).2`,
  },
  {
    id: 'bluegrass-blackberry',
    title: 'Bluegrass Flatpicking – Blackberry Blossom Melodie-Lauf',
    topics: ['Bluegrass', 'Fast-Picking'],
    instrument: 'Gitarre',
    difficulty: 'Fortgeschritten',
    startBpm: 78,
    targetBpm: 136,
    durationMin: 8,
    summary: 'Berühmtes Bluegrass-Fiddle-Tune in G-Dur mit schnellem Wechsel zwischen gegriffenen Tönen und offenen Resonanzsaiten.',
    techniqueFocus: 'Konsequenter Down-Up-Wechselschlag (Down = Schlag, Up = Offbeat) für authentischen Flatpicking-Bounce.',
    progressionTip: 'Nutze den Loop-Modus im Tab-Player für die ersten 4 Takte und steigere pro Tag um +5 BPM.',
    previewNotes: [67, 66, 64, 62, 60, 59, 57, 55],
    alphaTex: `\\title "Blackberry Blossom (Flatpicking)"
\\tempo 104
.
\\track "Dreadnought Acoustic"
\\staff {score tabs}
\\instrument 25
:8 3.1 2.1 0.1 3.2 1.2 0.2 2.3 0.3 |
2.4 0.4 2.3 0.3 1.2 0.2 2.3 0.3 |
0.4 2.4 0.3 2.3 0.2 1.2 3.2 0.1 |
3.1.4 0.1.4 3.2.2`,
  },
  {
    id: 'modern-string-skipping',
    title: 'Modernes Solieren – Pentatonik mit String-Skipping & weiten Intervallen',
    topics: ['Solieren', 'Legato'],
    instrument: 'Gitarre',
    difficulty: 'Fortgeschritten',
    startBpm: 76,
    targetBpm: 128,
    durationMin: 8,
    summary: 'Bricht aus der klassischen Pentatonik-Box aus durch weite Sext- & Nonensprünge (Eric-Johnson / Guthrie-Govan Style).',
    techniqueFocus: 'Hybrid-Picking oder sauberes Legato beim Überspringen der Nachbarsaite; keine Störgeräusche beim Saitenwechsel.',
    progressionTip: 'Übe die gleiche Idee auch über andere Skalen (z. B. Dorisch oder Hirajoshi aus dem Fretboard Helper!).',
    previewNotes: [57, 60, 67, 69, 62, 64, 72, 74],
    alphaTex: `\\title "String-Skipping Pentatonic Intervals"
\\tempo 96
.
\\track "Modern Lead"
\\staff {score tabs}
\\instrument 29
:8 5.6{h} 8.6 5.4{h} 7.4 5.5{h} 7.5 5.3{h} 7.3 |
5.4{h} 7.4 5.2{h} 8.2 5.3{h} 7.3 5.1{h} 8.1 |
8.1{p} 5.1 7.3{p} 5.3 8.2{p} 5.2 7.4{p} 5.4 |
5.5.2 7.4.2`,
  },
  {
    id: 'piano-bill-evans-rootless',
    title: 'Klavier Jazz – Bill-Evans Rootless Voicings (Dm9 – G13 – Cmaj9)',
    section: 'Klavier & Tasten',
    topics: ['Klavier', 'Jazz', 'Jazz Voicings', 'Neo-Soul'],
    instrument: 'Klavier',
    difficulty: 'Mittel',
    startBpm: 76,
    targetBpm: 116,
    durationMin: 8,
    summary: 'Die legendären grundtonlosen 4-stimmigen A-Form-Voicings der linken Hand (3–5–7–9) mit minimalem Voice-Leading.',
    techniqueFocus: 'Achte darauf, wie nur 1–2 Finger sich um einen Halbton bewegen (C → B von Dm9 zu G13, F → E zu Cmaj9!).',
    progressionTip: 'Spiele die Voicings mit der linken Hand und improvisiere rechts mit der C-Dur / Bebop-Skala.',
    previewNotes: [53, 57, 60, 64, 53, 57, 59, 64],
    alphaTex: `\\title "Bill Evans Rootless ii-V-I (C)"
\\tempo 90
.
\\track "Acoustic Grand Piano"
\\staff {score}
\\tuning piano
\\instrument 0
:2 (F3 A3 C4 E4) (F3 A3 C4 E4) |
:2 (F3 A3 B3 E4) (F3 A3 B3 E4) |
:1 (E3 G3 B3 D4) |
:1 (E3 G3 B3 D4)`,
  },
  // === NEUE WARMUP & FINGERAKROBATIK ÜBUNGEN ===
  {
    id: 'warmup-petrucci-stretch',
    title: 'Warmup: Petrucci-Style Chromatischer Stretch (Rock Discipline)',
    section: 'Warmup & Fingerakrobatik',
    topics: ['Warmup & Akrobatik', 'Fast-Picking'],
    instrument: 'Gitarre',
    difficulty: 'Mittel',
    startBpm: 64,
    targetBpm: 116,
    durationMin: 5,
    summary: 'Bewährtes Dehn- & Koordinations-Warmup (1–2–3–4 über zwei Saiten mit sukzessiver Spreizung) – löst die Greifhand in 3 Minuten.',
    techniqueFocus: 'Daumen mittig hinter dem Hals, Finger bleiben liegen bis sie gebraucht werden, lockeres Handgelenk ohne Druck.',
    progressionTip: 'Beginne im 7. Bund (enger) und wandere mit zunehmender Wärme Richtung 1. Bund.',
    previewNotes: [52, 58, 53, 59, 54, 60, 55, 61],
    alphaTex: `\\title "Petrucci Stretch Warmup"
\\tempo 76
.
\\track "Clean Warmup"
\\staff {score tabs}
\\instrument 27
:8 7.5 8.4 9.3 10.2 10.5 9.4 8.3 7.2 |
6.5 7.4 8.3 9.2 9.5 8.4 7.3 6.2 |
5.5 6.4 7.3 8.2 8.5 7.4 6.3 5.2 |
7.5 9.4 10.3 12.2 12.5 10.4 9.3 7.2`,
  },
  {
    id: 'warmup-spider-diagonal',
    title: 'Warmup: Diagonale Fingerakrobatik (1-3-2-4 Permutation)',
    section: 'Warmup & Fingerakrobatik',
    topics: ['Warmup & Akrobatik'],
    instrument: 'Gitarre',
    difficulty: 'Einsteiger',
    startBpm: 68,
    targetBpm: 128,
    durationMin: 4,
    summary: 'Kurze Fingerakrobatik mit versetztem Saitenwechsel (1-3-2-4 & 4-2-3-1) – trainiert gezielt Ring- und kleinen Finger.',
    techniqueFocus: 'Nur der aktive Finger hebt ab; minimales Abheben (ca. 3 mm über der Saite) bei striktem Wechselschlag.',
    progressionTip: 'Spiele die Figur einmal auf den tiefen Saiten (E–D) und direkt zurück über die hohen Saiten (G–e).',
    previewNotes: [45, 47, 51, 53, 50, 52, 56, 58],
    alphaTex: `\\title "Diagonale Fingerakrobatik (1-3-2-4)"
\\tempo 84
.
\\track "Clean Guitar"
\\staff {score tabs}
\\instrument 27
:16 5.6 7.5 6.6 8.5 5.5 7.4 6.5 8.4 5.4 7.3 6.4 8.3 5.3 7.2 6.3 8.2 |
8.1 6.2 7.1 5.2 8.2 6.3 7.2 5.3 8.3 6.4 7.3 5.4 8.4 6.5 7.4 5.5`,
  },
  {
    id: 'warmup-finger-independence',
    title: 'Warmup: Anchor-Finger Gymnastik (Saitenwechsel-Paare)',
    section: 'Warmup & Fingerakrobatik',
    topics: ['Warmup & Akrobatik'],
    instrument: 'Gitarre',
    difficulty: 'Mittel',
    startBpm: 60,
    targetBpm: 104,
    durationMin: 4,
    summary: 'Klassische Konservatoriums-Fingerakrobatik: Zeige-/Mittelfinger und Ring-/Kleinfinger springen gegengleich über Nachbarsaiten.',
    techniqueFocus: 'Jeder Ton klingt voll aus bis zum nächsten Anschlag – trainiert extreme Unabhängigkeit zwischen Finger 3 und 4.',
    progressionTip: 'Erst langsam auf 60 BPM sauber greifen, dann 1 Bund tiefer wiederholen.',
    previewNotes: [50, 56, 51, 57, 52, 58, 53, 59],
    alphaTex: `\\title "Anchor-Finger Unabhaengigkeit"
\\tempo 72
.
\\track "Clean Guitar"
\\staff {score tabs}
\\instrument 27
:8 5.4 6.3 7.4 8.3 5.3 6.4 7.3 8.4 |
5.4 7.3 6.4 8.3 5.3 7.4 6.3 8.4 |
5.5 8.2 6.4 7.3 7.4 6.3 8.5 5.2`,
  },
  // === NEUE LEGATO & ALTERNATE PICKING ÜBUNGEN ===
  {
    id: 'legato-finger34-trill',
    title: 'Legato: Ring- & Kleinfinger Ausdauer (Trill & 1-3-4 Sequenz)',
    section: 'Technik: Picking & Legato',
    topics: ['Legato', 'Warmup & Akrobatik'],
    instrument: 'Gitarre',
    difficulty: 'Mittel',
    startBpm: 72,
    targetBpm: 130,
    durationMin: 6,
    summary: 'Gezielte Kräftigung der schwächeren Finger 3 & 4 mit gleichmäßigen Hammer-Ons und kräftigen Pull-Offs in A-Moll.',
    techniqueFocus: 'Rechte Hand schlägt nur auf jedem Takt-Viertel einmal an – volle Lautstärke kommt allein aus der Greifhand.',
    progressionTip: 'Bei Müdigkeit im Unterarm kurz pausieren & ausschütteln; Konsistenz schlägt Kraft!',
    previewNotes: [62, 64, 65, 64, 62, 65, 64, 62],
    alphaTex: `\\title "Legato Finger 3-4 Ausdauer"
\\tempo 86
.
\\track "Fusion Lead"
\\staff {score tabs}
\\instrument 29
:16 5.3{h} 7.3{h} 9.3{p} 7.3 5.3{h} 7.3{h} 9.3{p} 7.3 5.2{h} 6.2{h} 8.2{p} 6.2 5.2{h} 6.2{h} 8.2{p} 6.2 |
5.1{h} 7.1{h} 8.1{p} 7.1 8.1{p} 7.1{p} 5.1 8.2{p} 6.2{p} 5.2 9.3{p} 7.3{p} 5.3 7.4 5.4 7.5`,
  },
  {
    id: 'legato-wide-stretch',
    title: 'Legato: Wide-Stretch Fusion (Holdsworth / Govan 2-Bund-Spreizung)',
    section: 'Technik: Picking & Legato',
    topics: ['Legato', 'Solieren'],
    instrument: 'Gitarre',
    difficulty: 'Fortgeschritten',
    startBpm: 68,
    targetBpm: 122,
    durationMin: 7,
    summary: 'Weite 3-Noten-pro-Saite Intervallsprünge (Bund 5–7–10) für modernen, fließenden Fusion-Legato-Sound ohne Skalen-Klischee.',
    techniqueFocus: 'Ellbogen entspannt, Daumen tief hinter dem Hals, weiche Übergänge mit nur 1 Anschlag pro Saite.',
    progressionTip: 'Im 9. Bund starten (enger) und schrittweise zum 5. Bund herunterarbeiten.',
    previewNotes: [50, 52, 55, 55, 57, 60, 59, 62],
    alphaTex: `\\title "Wide-Stretch Fusion Legato"
\\tempo 84
.
\\track "Fusion Lead"
\\staff {score tabs}
\\instrument 29
:16 5.6{h} 7.6{h} 10.6 5.5{h} 7.5{h} 10.5 5.4{h} 7.4{h} 10.4 5.3{h} 7.3{h} 9.3 6.2{h} 8.2{h} 10.2 5.1 |
10.1{p} 7.1{p} 5.1 10.2{p} 8.2{p} 6.2 9.3{p} 7.3{p} 5.3 10.4{p} 7.4{p} 5.4 10.5{p} 7.5{p} 5.5 10.6`,
  },
  {
    id: 'altpick-inside-outside',
    title: 'Alternate Picking: Inside / Outside String-Crossing Drill',
    section: 'Technik: Picking & Legato',
    topics: ['Fast-Picking'],
    instrument: 'Gitarre',
    difficulty: 'Mittel',
    startBpm: 76,
    targetBpm: 148,
    durationMin: 6,
    summary: 'Bewährte 2-Saiten-Picking-Übung (wie bei John Petrucci & Troy Grady): trainiert gezielt Inside- und Outside-Saitenwechsel.',
    techniqueFocus: 'Strikt D-U-D-U ohne Ausnahme! Beobachte, ob der Pick beim Saitenwechsel an der Saite hängenbleibt (leichtes Pick-Slanting).',
    progressionTip: 'Mit dem Speed-Trainer der Drum-Machine alle 4 Takte um +4 BPM steigern.',
    previewNotes: [55, 57, 59, 60, 62, 60, 59, 57],
    alphaTex: `\\title "Inside/Outside Alternate Picking"
\\tempo 96
.
\\track "Lead Guitar"
\\staff {score tabs}
\\instrument 29
:16 5.4 7.4 5.3 7.4 5.4 7.4 5.3 7.4 5.4 7.4 9.4 5.3 7.3 5.3 9.4 7.4 |
5.3 7.3 5.2 7.3 5.3 7.3 5.2 7.3 5.3 7.3 9.3 6.2 8.2 6.2 9.3 7.3`,
  },
  {
    id: 'altpick-pedaltone-malmsteen',
    title: 'Alternate Picking: Klassischer Pedalton-Lauf (A-Harmonisch Moll)',
    section: 'Technik: Picking & Legato',
    topics: ['Fast-Picking', 'Solieren'],
    instrument: 'Gitarre',
    difficulty: 'Fortgeschritten',
    startBpm: 80,
    targetBpm: 152,
    durationMin: 7,
    summary: 'Neoklassisches Pedalton-Motiv auf der hohen e-Saite (E-Pedal im Wechsel mit fallender A-Harmonisch-Moll-Melodie).',
    techniqueFocus: 'Präzise Synchronisation zwischen Zeigefinger-Anker (5. Bund) und Wechselschlag; keine Nebengeräusche.',
    progressionTip: 'Auch hervorragend als Warmup für schnelle Arpeggio- und Bluegrass-Flatpicking-Läufe.',
    previewNotes: [76, 69, 75, 69, 72, 69, 71, 69],
    alphaTex: `\\title "Pedalton Alternate Picking (Am)"
\\tempo 104
.
\\track "Neoclassical Lead"
\\staff {score tabs}
\\instrument 29
:16 12.1 5.1 10.1 5.1 8.1 5.1 7.1 5.1 8.1 5.1 10.1 5.1 12.1 5.1 10.1 5.1 |
13.1 5.1 12.1 5.1 10.1 5.1 8.1 5.1 7.1 5.1 8.1 5.1 7.1 4.1 5.1.8`,
  },
  // === NEUE FUNK RHYTHMUS STRUMMING ÜBUNGEN ===
  {
    id: 'funk-nile-rodgers-skank',
    title: 'Funk Strumming: Nile-Rodgers Triads & Upbeat Skanks (Cm7–F9)',
    section: 'Funk & Rhythmus-Strumming',
    topics: ['Funk'],
    instrument: 'Gitarre',
    difficulty: 'Einsteiger',
    startBpm: 86,
    targetBpm: 118,
    durationMin: 6,
    summary: 'Knackige 3-Saiten-Triads auf den hohen Saiten (G–H–e) mit treibenden 16tel-Ghost-Strums und offenen Upbeat-Akzenten.',
    techniqueFocus: 'Rechte Hand schwingt wie ein Uhrwerk im 16tel-Raster; Druck der Greifhand nur für Millisekunden bei den Akzenten.',
    progressionTip: 'Zusammen mit dem "Tight Funk Pocket" oder "Four on the Floor" Groove in der Drum-Machine üben.',
    previewNotes: [60, 63, 67, 65, 69, 72, 67, 63],
    alphaTex: `\\title "Nile Rodgers Funk Triads (Cm7 - F9)"
\\tempo 104
.
\\track "Funk Strat"
\\staff {score tabs}
\\instrument 27
:16 (8.3 8.2 8.1) x.2 x.2 (8.3 8.2 8.1) x.2 x.2 (8.3 8.2 8.1) x.2 x.2 (8.3 8.2 8.1) (8.3 8.2 8.1) x.2 (8.3 8.2 8.1) x.2 x.2 x.2 |
(8.3 8.2 8.1) x.2 x.2 (8.3 8.2 8.1) x.2 (10.3 10.2 10.1) x.2 x.2 (8.3 8.2 8.1) x.2 x.2 (8.3 8.2 8.1) x.2 x.2 (10.3 10.2 10.1) x.2`,
  },
  {
    id: 'funk-cory-wong-syncopation',
    title: 'Funk Rhythmus: 16tel-Akzentverschiebung & Double-Stop Slides',
    section: 'Funk & Rhythmus-Strumming',
    topics: ['Funk', 'Neo-Soul'],
    instrument: 'Gitarre',
    difficulty: 'Mittel',
    startBpm: 82,
    targetBpm: 114,
    durationMin: 7,
    summary: 'Moderne Funk-Strumming-Etüde mit versetzten 16tel-Akzenten ("1-e-und-a") und kurzen 2-Ton-Slides auf D–G–H.',
    techniqueFocus: 'Hände komplett entkoppeln: Anschlagshand bleibt konstant 16tel, Greifhand steuert Rhythmus und Artikulation.',
    progressionTip: 'Betone beim Üben laut die Zählzeit "e" und "a" mit, bis die Synkope völlig natürlich sitzt.',
    previewNotes: [57, 60, 64, 62, 65, 69, 64, 60],
    alphaTex: `\\title "Funk 16th Accent Shift (Am9)"
\\tempo 98
.
\\track "Funk Clean"
\\staff {score tabs}
\\instrument 27
:16 x.3 (5.4 5.3 5.2) x.3 x.3 x.3 (5.4 5.3 5.2) x.3 (7.4 7.3 7.2) x.3 x.3 (5.4 5.3 5.2) x.3 x.3 (7.4 7.3 7.2) x.3 (5.4 5.3 5.2) |
:8 (5.4 5.3 5.2) x.3 (7.4 7.3 7.2) (5.4 5.3 5.2) x.3 (5.3 5.2) (7.3 7.2) (5.4 5.3 5.2)`,
  },
  // === NEUE JAZZ VOICINGS & WALKING BASS ÜBUNGEN ===
  {
    id: 'jazz-freddie-green-shells',
    title: 'Jazz Voicings: Freddie-Green 3-Ton Shell Comping (F-Jazz-Blues)',
    section: 'Jazz, Voicings & Walking Bass',
    topics: ['Jazz', 'Jazz Voicings'],
    instrument: 'Gitarre',
    difficulty: 'Einsteiger',
    startBpm: 92,
    targetBpm: 150,
    durationMin: 7,
    summary: 'Das zeitlose Bigband-Comping (Grundton – Septime – Terz) auf den Saiten E–D–G und A–D–G über F7 – Bb7 – C7 – Gm7.',
    techniqueFocus: 'Nur die 3 gegriffenen Saiten klingen, die dazwischenliegende Saite wird sauber abgedämpft; trockener Viertel-Pulse.',
    progressionTip: 'Höre genau, wie die Guide-Tones (Terz & Septime) bei jedem Akkordwechsel um genau einen Halbton rutschen!',
    previewNotes: [41, 51, 57, 46, 50, 56, 43, 53, 58],
    alphaTex: `\\title "Freddie Green Shell Voicings (F-Blues)"
\\tempo 116
.
\\track "Jazz Archtop"
\\staff {score tabs}
\\instrument 26
:4 (1.6 1.4 2.3) (1.6 1.4 2.3) (1.6 1.4 2.3) (1.6 1.4 2.3) |
(1.5 0.4 1.3) (1.5 0.4 1.3) (1.5 0.4 1.3) (1.5 0.4 1.3) |
(3.6 3.4 3.3) (3.6 3.4 3.3) (3.5 2.4 3.3) (3.5 2.4 3.3) |
(1.6 1.4 2.3).2 (3.5 2.4 3.3).2`,
  },
  {
    id: 'jazz-drop2-inversions',
    title: 'Jazz Voicings: Drop-2 Umkehrungen über ii–V–I (Saiten D–G–H–e)',
    section: 'Jazz, Voicings & Walking Bass',
    topics: ['Jazz', 'Jazz Voicings'],
    instrument: 'Gitarre',
    difficulty: 'Mittel',
    startBpm: 72,
    targetBpm: 112,
    durationMin: 8,
    summary: 'Enges Voice-Leading mit Drop-2-Voicings über Dm7 – G7 – Cmaj7 – A7 auf dem oberen 4-Saiten-Satz (D–G–H–e).',
    techniqueFocus: 'Achte auf die Oberstimme (Melodie auf der hohen e-Saite) – so entsteht professionelles Jazz-Comping & Chord-Melody.',
    progressionTip: 'Übe dieselbe Verbindung im Progression-Tool im neuen Modus "Akkord-Voicings & Inversionen"!',
    previewNotes: [50, 57, 60, 65, 53, 55, 59, 62, 52, 55, 59, 60],
    alphaTex: `\\title "Drop-2 Voice Leading (Dm7 - G7 - Cmaj7)"
\\tempo 88
.
\\track "Jazz Guitar"
\\staff {score tabs}
\\instrument 26
:2 (0.4 2.3 1.2 1.1) (3.4 2.3 3.2 1.1) |
:2 (3.4 4.3 3.2 3.1) (3.4 4.3 3.2 1.1) |
:2 (2.4 0.3 0.2 0.1) (5.4 4.3 5.2 3.1) |
:1 (5.4 4.3 5.2 3.1)`,
  },
  {
    id: 'jazz-walking-bass-251',
    title: 'Walking Bass: Chromatische Approaches über ii–V–I–vi (C-Dur)',
    section: 'Jazz, Voicings & Walking Bass',
    topics: ['Jazz', 'Walking Bass'],
    instrument: 'Beide',
    difficulty: 'Einsteiger',
    startBpm: 88,
    targetBpm: 144,
    durationMin: 7,
    summary: 'Bewährtes Walking-Bass-System: Beat 1 = Grundton, Beat 2–3 = Akkord-/Skalentöne, Beat 4 = chromatischer Leitton zum Zielakkord.',
    techniqueFocus: 'Satter, tragender Viertel-Legato-Ton (leichter Druck mit Daumen oder Fingern) ohne Pausen zwischen den Schlägen.',
    progressionTip: 'Spiele die Basslinie zuerst auf Gitarre (E/A/D-Saite) oder mit der linken Hand am Klavier und zähle "2 & 4" mit.',
    previewNotes: [50, 53, 57, 56, 55, 50, 47, 49, 48],
    alphaTex: `\\title "Walking Bass ii-V-I-vi (C-Dur)"
\\tempo 112
.
\\track "Walking Bass"
\\staff {score tabs}
\\instrument 26
:4 5.5 8.5 7.4 6.4 |
5.4 5.5 2.5 4.5 |
3.5 5.5 7.5 6.5 |
5.6 8.6 7.5 4.5`,
  },
  {
    id: 'jazz-joepass-walking-chords',
    title: 'Walking Bass + Comping: Joe-Pass Solo-Jazz über Dm7–G7–Cmaj7',
    section: 'Jazz, Voicings & Walking Bass',
    topics: ['Jazz', 'Walking Bass', 'Jazz Voicings', 'Fingerstyle'],
    instrument: 'Gitarre',
    difficulty: 'Fortgeschritten',
    startBpm: 72,
    targetBpm: 118,
    durationMin: 9,
    summary: 'Kombiniert durchgehenden Walking Bass auf der E/A-Saite mit knackigen Offbeat-Akkordstabs (Terz & Septime) auf den mittleren Saiten.',
    techniqueFocus: 'Daumen hält den stetigen Viertel-Bass, Zeige- & Mittelfinger zupfen die Akkorde leicht synkopiert auf Schlag 1 und "2-und".',
    progressionTip: 'Erst nur die Basslinie verinnerlichen, dann langsam die Akkord-Einwürfe auf den Zählzeiten ergänzen.',
    previewNotes: [50, 60, 65, 53, 57, 56, 55, 59, 65],
    alphaTex: `\\title "Joe Pass Walking Bass & Chords"
\\tempo 92
.
\\track "Solo Jazz Archtop"
\\staff {score tabs}
\\instrument 26
:4 (5.5 5.3 6.2) 8.5 (7.4 5.3 6.2) 4.6 |
(3.6 3.4 4.3) 2.5 (5.5 3.4 4.3) 2.5 |
(3.5 4.3 5.2) 2.4 (5.4 4.3 5.2) 4.5 |
(5.6 5.4 5.3).2 (4.6 5.4 6.3).2`,
  },

  // =========================================================================
  // ECHTE MEHRTAKTIGE GUITAR-PRO-STUDIEN (.gp / .gp5 aus Open-Source-Archiven)
  // =========================================================================
  {
    id: 'gp-robben-ford-blues-improv',
    title: 'Robben Ford Blues-Improvisation (Komplettstudie, 2 Spuren)',
    section: 'Blues, Bluegrass & Fingerstyle',
    topics: ['Blues', 'Jazz', 'Solieren'],
    instrument: 'Gitarre',
    difficulty: 'Fortgeschritten',
    startBpm: 78,
    targetBpm: 112,
    durationMin: 15,
    barsCount: 72,
    source: 'GitHub: gbartolini/guitar-pro-exercises (.gp)',
    summary: 'Vollständige 72-Takt-Improvisation im Robben-Ford-Stil mit 2 Spuren (Lead-Gitarre + Begleitung) – Mixolydisch, Altered & Blues-Phrasierung.',
    techniqueFocus: 'Phrasierung über den Taktstrich, gezielte Zielnoten (3. & 7. Stufe) auf Akkordwechsel und kontrollierte Bendings.',
    progressionTip: 'Markiere im Tab-Player zunächst jeweils 4–8 Takte als Loop und arbeite dich Chorus für Chorus durch alle 72 Takte.',
    fileUrl: './tabs/robben_ford_blues_improv.gp',
    previewNotes: [55, 58, 60, 61, 62, 65, 67, 65],
  },
  {
    id: 'gp-fingerpicking-52bars',
    title: 'Fingerpicking Komplett-Workout (52 Takte, Muster-Progression)',
    section: 'Blues, Bluegrass & Fingerstyle',
    topics: ['Fingerstyle', 'Warmup & Akrobatik'],
    instrument: 'Gitarre',
    difficulty: 'Mittel',
    startBpm: 72,
    targetBpm: 116,
    durationMin: 12,
    barsCount: 52,
    source: 'GitHub: gbartolini/guitar-pro-exercises (.gp)',
    summary: 'Umfangreiche 52-Takt-Fingerpicking-Studie mit aufeinander aufbauenden Zupfmustern für Daumen-Unabhängigkeit (p-i-m-a) und Akkordwechsel.',
    techniqueFocus: 'Daumen hält gleichmäßigen Wechselbass, während i-m-a sauber und klanglich ausgeglichen die Diskantsaiten anschlagen.',
    progressionTip: 'Ideal als tägliche 10-Minuten-Fingerstyle-Routine: erst bei 75% Tempo im Tab-Player flüssig durchspielen.',
    fileUrl: './tabs/fingerpicking_exercises.gp',
    previewNotes: [40, 47, 52, 55, 59, 64, 59, 55],
  },
  {
    id: 'gp-brouwer-estudio-01',
    title: 'Leo Brouwer: Estudio Sencillo Nr. 1 (Klassik / Fingerstyle)',
    section: 'Blues, Bluegrass & Fingerstyle',
    topics: ['Fingerstyle'],
    instrument: 'Gitarre',
    difficulty: 'Einsteiger',
    startBpm: 80,
    targetBpm: 118,
    durationMin: 8,
    barsCount: 24,
    source: 'GitHub: otnemrasordep/gp-classical-guitar (.gp5)',
    summary: 'Berühmte moderne Konzertetüde (24 Takte): prägnante Bassmelodie im Daumen kombiniert mit rhythmischer Ostinato-Begleitung auf den Diskantsaiten.',
    techniqueFocus: 'Klarer Daumenanschlag (Apoyando/Tirando) für die Bassstimme, während die Oberstimme federleicht bleibt.',
    progressionTip: 'Hebe die dynamischen Akzente im Bass heraus – eine der meistunterrichteten Fingerstyle-Etüden weltweit.',
    fileUrl: './tabs/brouwer_estudio_01.gp5',
    previewNotes: [40, 52, 55, 43, 52, 55, 45, 52],
  },
  {
    id: 'gp-brouwer-estudio-06',
    title: 'Leo Brouwer: Estudio Sencillo Nr. 6 (Arpeggio-Etüde)',
    section: 'Blues, Bluegrass & Fingerstyle',
    topics: ['Fingerstyle', 'Warmup & Akrobatik'],
    instrument: 'Gitarre',
    difficulty: 'Mittel',
    startBpm: 72,
    targetBpm: 112,
    durationMin: 9,
    barsCount: 18,
    source: 'GitHub: otnemrasordep/gp-classical-guitar (.gp5)',
    summary: 'Legendäre 18-Takt-Arpeggio-Etüde für die rechte Hand: schwebende moderne Akkordklänge mit fließendem Saitenwechsel über alle 6 Saiten.',
    techniqueFocus: 'Alle Finger der Greifhand klingen lassen (Let Ring) und absolut gleichmäßige Anschlagdynamik in p-i-m-a.',
    progressionTip: 'Perfekt für Klangkultur und Ausdauer der Zupfhand – später auch mit alternativen Zupfmustern variierbar.',
    fileUrl: './tabs/brouwer_estudio_06.gp5',
    previewNotes: [40, 55, 59, 64, 59, 55, 45, 57],
  },
  {
    id: 'gp-brouwer-estudio-11',
    title: 'Leo Brouwer: Estudio Sencillo Nr. 11 (Legato & Bindungen)',
    section: 'Blues, Bluegrass & Fingerstyle',
    topics: ['Fingerstyle', 'Legato'],
    instrument: 'Gitarre',
    difficulty: 'Fortgeschritten',
    startBpm: 76,
    targetBpm: 114,
    durationMin: 12,
    barsCount: 42,
    source: 'GitHub: otnemrasordep/gp-classical-guitar (.gp5)',
    summary: 'Komplette 42-Takt-Konzertetüde mit anspruchsvollen Auf- und Abbindungen (Slurs / Hammer-Ons & Pull-Offs) sowie Lagenwechseln.',
    techniqueFocus: 'Präzise, kräftige Pull-Offs der Greifhand und sauberer Lagenwechsel ohne Nebengeräusche.',
    progressionTip: 'Übe die schnellen Bindungs-Abschnitte zunächst separat im Loop bei 65–75% Geschwindigkeit.',
    fileUrl: './tabs/brouwer_estudio_11.gp5',
    previewNotes: [45, 52, 57, 60, 62, 60, 57, 52],
  },
  {
    id: 'gp-harmonization-solo-g',
    title: 'Harmonized Solo in G-Dur (26-Takt Melodie- & Solostudie)',
    section: 'Technik: Picking & Legato',
    topics: ['Solieren', 'Fast-Picking', 'Legato'],
    instrument: 'Gitarre',
    difficulty: 'Mittel',
    startBpm: 80,
    targetBpm: 122,
    durationMin: 10,
    barsCount: 26,
    source: 'GitHub: gbartolini/guitar-pro-exercises (.gp)',
    summary: 'Durchkomponierte 26-Takt-Solostudie in G-Dur mit diatonischer Harmonisierung, Lagenverbindungen und melodischen Sequenzen.',
    techniqueFocus: 'Sauberes Alternate Picking kombiniert mit melodischem Vibrato und nahtlosen Lagenwechseln über das Griffbrett.',
    progressionTip: 'Analysiere nach dem Lernen die zugrunde liegenden Dreiklänge im Fretboard Helper (Tonart G-Dur).',
    fileUrl: './tabs/harmonization_solo_g.gp',
    previewNotes: [55, 57, 59, 60, 62, 64, 66, 67],
  },
  {
    id: 'gp-pentatonic-quartine',
    title: 'Pentatonik Quartinen-Workout (16tel-4er-Gruppen, GP-Studie)',
    section: 'Technik: Picking & Legato',
    topics: ['Fast-Picking', 'Solieren'],
    instrument: 'Gitarre',
    difficulty: 'Mittel',
    startBpm: 76,
    targetBpm: 136,
    durationMin: 8,
    barsCount: 5,
    source: 'GitHub: gbartolini/guitar-pro-exercises (.gp)',
    summary: 'Klassische 4-Noten-Sequenz ("Quartine") durch die Pentatonik – baut Geschwindigkeit, Synchronisation und Saitenwechsel-Sicherheit auf.',
    techniqueFocus: 'Konsequenter Wechselschlag (Down-Up) mit Betonung auf jeder ersten Note einer 4er-Gruppe.',
    progressionTip: 'Mit dem Speed-Trainer im Tab-Player in 5%-Schritten von 70% auf 110% steigern.',
    fileUrl: './tabs/pentatonic_quartine.gp',
    previewNotes: [57, 60, 62, 64, 60, 62, 64, 67],
  },
  {
    id: 'gp-funky-blues-1',
    title: 'Funky Blues Etüde #1 (13-Takt Groove & Phrasierung)',
    section: 'Funk & Rhythmus-Strumming',
    topics: ['Funk', 'Blues'],
    instrument: 'Gitarre',
    difficulty: 'Mittel',
    startBpm: 84,
    targetBpm: 112,
    durationMin: 9,
    barsCount: 13,
    source: 'GitHub: gbartolini/guitar-pro-exercises (.gp)',
    summary: 'Kompletter 13-Takt Funky-Blues Chorus (Teil 1 einer 4-teiligen Reihe): synkopierte Riffs, 16tel-Ghost-Notes und knackige Dominant-Licks.',
    techniqueFocus: 'Tightes Pocket-Timing, kurzes Abdämpfen (Staccato) und saubere Übergänge zwischen Rhythmus-Chords und Single-Note-Fills.',
    progressionTip: 'Aktiviere im Tab-Player den Loop und achte auf entspannte Handgelenk-Bewegung bei den 16tel-Passagen.',
    fileUrl: './tabs/funky_blues_1.gp',
    previewNotes: [45, 48, 50, 52, 55, 57, 55, 52],
  },
  {
    id: 'gp-funky-blues-2',
    title: 'Funky Blues Etüde #2 (13-Takt Synkopen & Double-Stops)',
    section: 'Funk & Rhythmus-Strumming',
    topics: ['Funk', 'Blues'],
    instrument: 'Gitarre',
    difficulty: 'Mittel',
    startBpm: 84,
    targetBpm: 114,
    durationMin: 9,
    barsCount: 13,
    source: 'GitHub: gbartolini/guitar-pro-exercises (.gp)',
    summary: 'Zweiter voller 13-Takt-Chorus der Funky-Blues-Reihe mit Fokus auf Double-Stops, Offbeat-Akzente und Turnaround-Phrasen.',
    techniqueFocus: 'Saubere Artikulation bei synkopierten Einwürfen und präzises Muting der nicht gespielten Saiten.',
    progressionTip: 'Verbinde Etüde #1 und #2 direkt hintereinander als 24-Takt-Performance.',
    fileUrl: './tabs/funky_blues_2.gp',
    previewNotes: [45, 52, 55, 57, 60, 62, 60, 57],
  },
  {
    id: 'gp-funky-blues-3',
    title: 'Funky Blues Etüde #3 (13-Takt Funk-Comping & Lead-Fills)',
    section: 'Funk & Rhythmus-Strumming',
    topics: ['Funk', 'Blues', 'Solieren'],
    instrument: 'Gitarre',
    difficulty: 'Fortgeschritten',
    startBpm: 86,
    targetBpm: 116,
    durationMin: 10,
    barsCount: 13,
    source: 'GitHub: gbartolini/guitar-pro-exercises (.gp)',
    summary: 'Dritter 13-Takt-Chorus mit raffinierter Kombination aus funkigen Akkord-Stabs und bluesigen Lead-Antworten.',
    techniqueFocus: 'Call-and-Response zwischen Rhythmus-Akkord und Melodie-Fill ohne Tempo-Schwankung.',
    progressionTip: 'Spiele danach eigene Variationen über die ersten 4 Takte im selben Groove.',
    fileUrl: './tabs/funky_blues_3.gp',
    previewNotes: [45, 48, 52, 55, 58, 57, 55, 52],
  },
  {
    id: 'gp-funky-blues-4',
    title: 'Funky Blues Etüde #4 (12-Takt Finale & Turnaround)',
    section: 'Funk & Rhythmus-Strumming',
    topics: ['Funk', 'Blues', 'Solieren'],
    instrument: 'Gitarre',
    difficulty: 'Fortgeschritten',
    startBpm: 86,
    targetBpm: 118,
    durationMin: 10,
    barsCount: 12,
    source: 'GitHub: gbartolini/guitar-pro-exercises (.gp)',
    summary: 'Abschließender 12-Takt-Chorus der Funky-Blues-Serie mit energiegeladenen 16tel-Phrasen und klassischem Blues-Turnaround.',
    techniqueFocus: 'Konstante 16tel-Subdivision im Kopf behalten und den Turnaround punktgenau auf die "1" auflösen.',
    progressionTip: 'Perfekt als Abschluss eines kompletten 4-Chorus-Funk-Blues-Workouts!',
    fileUrl: './tabs/funky_blues_4.gp',
    previewNotes: [45, 50, 52, 55, 57, 60, 62, 64],
  },
  {
    id: 'gp-robben-ford-diminished',
    title: 'Robben Ford: Halbton-Ganzton Verminderte Skala über Dominant7',
    section: 'Jazz, Voicings & Walking Bass',
    topics: ['Jazz', 'Blues', 'Solieren'],
    instrument: 'Gitarre',
    difficulty: 'Fortgeschritten',
    startBpm: 72,
    targetBpm: 118,
    durationMin: 7,
    barsCount: 2,
    source: 'GitHub: gbartolini/guitar-pro-exercises (.gp)',
    summary: 'Typische Robben-Ford-Linie mit der symmetrischen Halbton-Ganzton-Skala (HT-GT) für modernen Jazz-Blues-Tension-Sound über V7.',
    techniqueFocus: 'Saubere Fingersätze über die symmetrische 3-Bund-Struktur und bewusste Auflösung in die Terz der Tonika.',
    progressionTip: 'Verschiebe diese Figur jeweils um 3 Bünde (kleine Terz) – wegen der Symmetrie bleiben alle Akkordtöne erhalten!',
    fileUrl: './tabs/robben_ford_diminished.gp',
    previewNotes: [55, 56, 58, 59, 61, 62, 64, 65],
  },

  // =========================================================================
  // ERWEITERTE 8–12 TAKT AUSDAUER- & KOMPLETT-WORKOUTS (AlphaTex)
  // =========================================================================
  {
    id: 'workout-12bar-jazz-blues-walking',
    title: '12-Takt Jazz-Blues Komplett-Chorus: Walking Bass + Shell Voicings (F-Dur)',
    section: 'Jazz, Voicings & Walking Bass',
    topics: ['Jazz', 'Walking Bass', 'Jazz Voicings', 'Blues'],
    instrument: 'Gitarre',
    difficulty: 'Mittel',
    startBpm: 84,
    targetBpm: 132,
    durationMin: 12,
    barsCount: 12,
    source: 'FretKeys Studio Komplett-Etüde (12 Takte)',
    summary: 'Ein voller 12-Takt Jazz-Blues-Chorus in F (F7–Bb7–F7–Cm7 F7–Bb7–Bdim7–F7–D7–Gm7–C7–F7 D7–Gm7 C7) mit durchgehendem Walking Bass und Shell-Voicings.',
    techniqueFocus: 'Auf Beat 1 & 3 erklingen kompakte Guide-Tone-Voicings, auf Beat 2 & 4 führen chromatische Bass-Approaches nahtlos in den nächsten Akkord.',
    progressionTip: 'Wenn ein Chorus flüssig bei 110 BPM läuft, variiere den Rhythmus der Akkord-Einwürfe (z.B. Charleston-Rhythmus auf 1 und 2-und).',
    previewNotes: [41, 45, 46, 47, 48, 50, 52, 53],
    alphaTex: `\\title "12-Bar Jazz Blues: Walking Bass & Shells (F)"
\\tempo 104
.
\\track "Jazz Archtop"
\\staff {score tabs}
\\instrument 26
:4 (1.6 1.4 2.3) 3.6 (5.6 1.4 2.3) 0.5 |
(1.5 0.4 1.3) 3.5 (5.5 0.4 1.3) 0.6 |
(1.6 1.4 2.3) 5.6 (3.5 1.4 2.3) 2.5 |
(3.5 1.4 3.3) 5.5 (1.6 1.4 2.3) 0.5 |
(1.5 0.4 1.3) 3.5 (5.5 0.4 1.3) 1.5 |
(2.5 1.4 2.3) 5.5 (2.5 1.4 2.3) 0.6 |
(1.6 1.4 2.3) 3.6 (5.6 1.4 2.3) 4.5 |
(5.5 4.4 5.3) 2.5 (5.5 4.4 5.3) 4.6 |
(3.6 3.4 3.3) 5.6 (1.5 3.4 3.3) 2.5 |
(3.5 2.4 3.3) 5.5 (3.5 2.4 3.3) 0.6 |
(1.6 1.4 2.3) 4.5 (5.5 4.4 5.3) 4.6 |
(3.6 3.4 3.3) 2.5 (3.5 2.4 3.3) 0.6`,
  },
  {
    id: 'workout-8bar-picking-neckclimb',
    title: '8-Takt Alternate Picking Ausdauer-Etüde: 3NPS Neck-Climb (A-Moll)',
    section: 'Technik: Picking & Legato',
    topics: ['Fast-Picking', 'Solieren'],
    instrument: 'Gitarre',
    difficulty: 'Fortgeschritten',
    startBpm: 76,
    targetBpm: 136,
    durationMin: 10,
    barsCount: 8,
    source: 'FretKeys Studio Komplett-Etüde (8 Takte)',
    summary: 'Durchgehende 8-Takt-Ausdaueretüde in 16teln: klettert über 3-Notes-Per-String-Formen von Bund 5 bis Bund 17 und wieder zurück ohne abzubrechen.',
    techniqueFocus: '100% strikter Wechselschlag (Down-Up) mit minimalem Plektrum-Weg und entspanntem Unterarm auch bei Lagenwechseln.',
    progressionTip: 'Erst 2x sauber hintereinander ohne Verspannung bei 80 BPM schaffen, dann pro Woche +4 BPM steigern.',
    previewNotes: [57, 59, 60, 62, 64, 65, 67, 69],
    alphaTex: `\\title "8-Bar 3NPS Alternate Picking Endurance (A Minor)"
\\tempo 96
.
\\track "Lead Guitar"
\\staff {score tabs}
\\instrument 29
:16 5.6 7.6 8.6 5.5 7.5 8.5 5.4 7.4 9.4 5.3 7.3 9.3 6.2 8.2 10.2 7.1 |
8.1 10.1 8.1 7.1 10.2 8.2 6.2 9.3 7.3 5.3 9.4 7.4 5.4 8.5 7.5 5.5 |
7.6 8.6 10.6 7.5 8.5 10.5 7.4 9.4 10.4 7.3 9.3 10.3 8.2 10.2 12.2 8.1 |
10.1 12.1 10.1 8.1 12.2 10.2 8.2 10.3 9.3 7.3 10.4 9.4 7.4 10.5 8.5 7.5 |
10.6 12.6 13.6 10.5 12.5 14.5 10.4 12.4 14.4 10.3 12.3 14.3 12.2 13.2 15.2 12.1 |
13.1 15.1 17.1 15.1 13.1 12.1 15.2 13.2 12.2 14.3 12.3 10.3 14.4 12.4 10.4 12.5 |
12.1 10.1 8.1 10.2 8.2 6.2 9.3 7.3 5.3 9.4 7.4 5.4 8.5 7.5 5.5 8.6 |
7.6 5.6 7.6 8.6 5.5 7.5 8.5 5.4 7.4 9.4 5.3 7.3 5.4 7.5 5.5 5.6`,
  },
  {
    id: 'workout-8bar-legato-etude',
    title: '8-Takt Multi-Position Legato-Etüde (E-Dorisch / Satriani-Flow)',
    section: 'Technik: Picking & Legato',
    topics: ['Legato', 'Solieren'],
    instrument: 'Gitarre',
    difficulty: 'Fortgeschritten',
    startBpm: 72,
    targetBpm: 124,
    durationMin: 10,
    barsCount: 8,
    source: 'FretKeys Studio Komplett-Etüde (8 Takte)',
    summary: 'Fließende 8-Takt-Legato-Studie in E-Dorisch über 3 Griffbrettlagen: nur der erste Ton jeder Saite wird angeschlagen, der Rest per Hammer-On/Pull-Off geformt.',
    techniqueFocus: 'Gleichmäßige Lautstärke zwischen angeschlagenen und gebundenen Tönen; linker Zeigefinger dämpft die benachbarte höhere Saite.',
    progressionTip: 'Übe die Etüde auch komplett ohne Plektrum (nur Greifhand), um maximale Fingerkraft und Präzision zu trainieren.',
    previewNotes: [64, 66, 67, 69, 71, 73, 74, 76],
    alphaTex: `\\title "8-Bar E Dorian Multi-Position Legato Etude"
\\tempo 92
.
\\track "Legato Lead"
\\staff {score tabs}
\\instrument 29
:16 7.6{h} 9.6{h} 10.6 7.5{h} 9.5{h} 10.5 7.4{h} 9.4{h} 11.4 7.3{h} 9.3{h} 11.3 8.2{h} 10.2{h} 12.2 10.2 |
12.1{h} 10.1{h} 9.1 12.2{h} 10.2{h} 8.2 11.3{h} 9.3{h} 7.3 11.4{h} 9.4{h} 7.4 10.5{h} 9.5{h} 7.5 9.5 |
9.5{h} 10.5{h} 12.5 9.4{h} 11.4{h} 12.4 9.3{h} 11.3{h} 12.3 10.2{h} 12.2{h} 14.2 10.1{h} 12.1{h} 14.1 12.1 |
14.1{h} 12.1{h} 10.1 14.2{h} 12.2{h} 10.2 12.3{h} 11.3{h} 9.3 12.4{h} 11.4{h} 9.4 12.5{h} 10.5{h} 9.5 10.5 |
12.4{h} 14.4{h} 16.4 12.3{h} 14.3{h} 16.3 14.2{h} 15.2{h} 17.2 14.1{h} 15.1{h} 17.1 15.1{h} 14.1 17.2{h} 15.2 |
17.1{h} 15.1{h} 14.1 17.2{h} 15.2{h} 14.2 16.3{h} 14.3{h} 12.3 16.4{h} 14.4{h} 12.4 14.4{h} 12.4 14.5{h} 12.5 |
12.3{h} 11.3{h} 9.3 11.3{h} 9.3{h} 7.3 9.4{h} 7.4{h} 5.4 7.4{h} 5.4{h} 4.4 7.5{h} 5.5{h} 4.5 5.5 |
7.5.4 9.4{h} 11.4 9.3.2`,
  },
  {
    id: 'workout-8bar-funk-pocket',
    title: '8-Takt Funk Rhythmus & Groove-Etüde (E9 – A9 – B9 mit Fills)',
    section: 'Funk & Rhythmus-Strumming',
    topics: ['Funk'],
    instrument: 'Gitarre',
    difficulty: 'Mittel',
    startBpm: 80,
    targetBpm: 112,
    durationMin: 10,
    barsCount: 8,
    source: 'FretKeys Studio Komplett-Etüde (8 Takte)',
    summary: 'Komplette 8-Takt-Funk-Rhythmus-Studie im James-Brown/Tower-of-Power-Stil: 16tel-Dead-Notes, geslidete 9er-Akkorde, Single-Note-Skank und knackiger B9-Turnaround.',
    techniqueFocus: 'Die Schlaghand läuft wie ein Metronom im 16tel-Wechselschlag durch; Greifhand steuert exakt, welche 16tel klingen und welche perkussiv gedämpft sind.',
    progressionTip: 'Übe dazu die Drum-Machine mit dem "Impeach the President" oder "James Brown Funk" Beat bei 92–104 BPM!',
    previewNotes: [52, 56, 62, 66, 57, 61, 64, 67],
    alphaTex: `\\title "8-Bar Funk Pocket & 16th Groove Etude (E9)"
\\tempo 96
.
\\track "Clean Funk Guitar"
\\staff {score tabs}
\\instrument 27
:16 (7.5 6.4 7.3 7.2) x.3 x.3 (7.5 6.4 7.3 7.2) x.3 (7.5 6.4 7.3 7.2) x.3 x.3 (7.5 6.4 7.3 7.2) x.3 x.3 x.3 (6.4 7.3 7.2) x.3 (7.5 6.4 7.3 7.2) x.3 |
0.6 x.3 3.6 4.6 5.5 x.3 7.5 x.3 (7.5 6.4 7.3 7.2) x.3 x.3 (7.5 6.4 7.3 7.2) x.3 (9.3 9.2) x.3 (7.3 7.2) |
(7.5 6.4 7.3 7.2) x.3 x.3 (6.5 5.4 6.3 6.2) (7.5 6.4 7.3 7.2) x.3 x.3 x.3 (9.3 9.2 9.1) x.3 (7.3 7.2 7.1) x.3 x.3 (7.5 6.4 7.3 7.2) x.3 x.3 |
0.6 0.6 x.3 7.5 5.5 7.5 5.4 7.4 (7.5 6.4 7.3 7.2) x.3 x.3 x.3 (5.4 5.3 5.2) (6.4 6.3 6.2) (7.4 7.3 7.2) x.3 |
(5.4 6.3 5.2 5.1) x.3 x.3 (5.4 6.3 5.2 5.1) x.3 (5.4 6.3 5.2 5.1) x.3 x.3 (5.4 6.3 5.2 5.1) x.3 x.3 x.3 (7.4 7.3 7.2) x.3 (5.4 6.3 5.2) x.3 |
5.6 x.3 8.6 9.6 7.5 x.3 5.4 7.4 (5.4 6.3 5.2 5.1) x.3 x.3 (7.4 7.3 7.2) x.3 (5.4 5.3 5.2) x.3 x.3 |
(7.4 8.3 7.2 7.1) x.3 x.3 (7.4 8.3 7.2 7.1) x.3 x.3 (5.4 6.3 5.2 5.1) x.3 x.3 (5.4 6.3 5.2 5.1) x.3 x.3 (7.5 6.4 7.3 7.2) x.3 x.3 x.3 |
0.6 3.6 4.6 5.6 6.6 7.6 x.3 (7.4 8.3 7.2 7.1) x.3 (7.4 8.3 7.2 7.1) x.3 x.3 (7.5 6.4 7.3 7.2).4`,
  },
  {
    id: 'workout-8bar-neosoul-chordmelody',
    title: '8-Takt Neo-Soul Chord-Melody Etüde (Cmaj9 – Am9 – Dm9 – G13)',
    section: 'Funk & Rhythmus-Strumming',
    topics: ['Neo-Soul', 'Fingerstyle', 'Jazz Voicings'],
    instrument: 'Gitarre',
    difficulty: 'Mittel',
    startBpm: 66,
    targetBpm: 92,
    durationMin: 10,
    barsCount: 8,
    source: 'FretKeys Studio Komplett-Etüde (8 Takte)',
    summary: 'Ausgearbeitete 8-Takt Neo-Soul-Studie im Mateus-Asato / Tom-Misch-Stil mit weichen Maj9/Min9-Voicings, Hammer-On-Double-Stops und gleitenden Pentatonik-Verzierungen.',
    techniqueFocus: 'Lockeres hybrides oder reines Fingerpicking (p-i-m-a), wobei die Oberstimme singend über den liegenden Akkordtönen bleibt.',
    progressionTip: 'Lass jeden Akkord leicht arpeggiert (gerollt) erklingen und betone die Hammer-On-Verzierungen sanft.',
    previewNotes: [48, 55, 59, 62, 64, 57, 60, 64],
    alphaTex: `\\title "8-Bar Neo-Soul Chord Melody (Cmaj9 - Am9 - Dm9 - G13)"
\\tempo 78
.
\\track "Neo-Soul Clean"
\\staff {score tabs}
\\instrument 27
:8 (8.6 9.4 7.3 8.2).4 7.3{h} 9.3 (8.2 7.1) 10.2 |
(8.6 9.4 7.3 8.2).4 10.2{h} 12.2 10.2 8.2 |
(5.6 5.4 5.3 5.2).4 5.3{h} 7.3 (5.2 5.1) 8.2 |
(5.6 5.4 5.3 5.2).4 7.3{h} 5.3 7.4 5.4 |
(5.5 3.4 5.3 5.2).4 5.3{h} 7.3 (6.2 5.1) 8.2 |
(5.5 3.4 5.3 5.2).4 8.2{h} 10.2 8.2 6.2 |
(3.6 3.4 4.3 5.2).4 5.2{h} 6.2 5.2 3.2 |
(8.6 9.4 7.3 8.2).2 (8.6 9.4 9.3 8.2).2`,
  },
  {
    id: 'workout-8bar-spider-acrobatics',
    title: '8-Takt Fingerakrobatik Komplett-Warmup: 4 Permutationen über alle 6 Saiten',
    section: 'Warmup & Fingerakrobatik',
    topics: ['Warmup & Akrobatik', 'Fast-Picking'],
    instrument: 'Gitarre',
    difficulty: 'Mittel',
    startBpm: 68,
    targetBpm: 118,
    durationMin: 8,
    barsCount: 8,
    source: 'FretKeys Studio Komplett-Etüde (8 Takte)',
    summary: 'Ernsthaftes 8-Takt-Aufwärmprogramm durch 4 klassische Permutationen (1-2-3-4, 1-3-2-4, 1-4-2-3 und 4-3-2-1) mit kontinuierlichem Lagen-Aufstieg und Abstieg.',
    techniqueFocus: 'Minimale Fingerbewegung (Finger bleiben knapp über dem Griffbrett), entspannte Schulter und absolut präziser Wechselschlag.',
    progressionTip: 'Spiele diese 8 Takte jeden Tag als erstes 3–5 Minuten vor dem eigentlichen Üben – das schärft sofort die Synchronisation.',
    previewNotes: [57, 58, 59, 60, 62, 63, 64, 65],
    alphaTex: `\\title "8-Bar Spider & Permutation Warmup (All 6 Strings)"
\\tempo 84
.
\\track "Warmup Guitar"
\\staff {score tabs}
\\instrument 27
:16 5.6 6.6 7.6 8.6 5.5 6.5 7.5 8.5 5.4 6.4 7.4 8.4 5.3 6.3 7.3 8.3 |
5.2 6.2 7.2 8.2 5.1 6.1 7.1 8.1 9.1 8.1 7.1 6.1 9.2 8.2 7.2 6.2 |
9.3 8.3 7.3 6.3 9.4 8.4 7.4 6.4 9.5 8.5 7.5 6.5 9.6 8.6 7.6 6.6 |
5.6 7.6 6.6 8.6 5.5 7.5 6.5 8.5 5.4 7.4 6.4 8.4 5.3 7.3 6.3 8.3 |
5.2 7.2 6.2 8.2 5.1 7.1 6.1 8.1 9.1 7.1 8.1 6.1 9.2 7.2 8.2 6.2 |
5.6 8.6 6.6 7.6 5.5 8.5 6.5 7.5 5.4 8.4 6.4 7.4 5.3 8.3 6.3 7.3 |
5.2 8.2 6.2 7.2 5.1 8.1 6.1 7.1 8.1 7.1 6.1 5.1 8.2 7.2 6.2 5.2 |
8.3 7.3 6.3 5.3 8.4 7.4 6.4 5.4 8.5 7.5 6.5 5.5 8.6 7.6 6.6 5.6`,
  },

  ...SOLO_ROCK_EXERCISES,
];
