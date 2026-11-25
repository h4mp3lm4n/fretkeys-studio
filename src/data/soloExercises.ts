import type { PracticeExercise } from './exercises';

export const SOLO_ROCK_EXERCISES: PracticeExercise[] = [
  // 1. Pentatonic Diagonal Runs & 5er Cascades
  {
    id: 'solo-pentatonic-diagonal-run',
    title: 'Pentatonik Diagonal-Runs & 5er-Kaskaden (A-Moll, Pos. 1 → Pos. 5)',
    section: 'Solo-Läufe, Classic & Hard Rock',
    topics: ['Solieren', 'Fast-Picking', 'Classic & Hard Rock'],
    instrument: 'Gitarre',
    difficulty: 'Mittel',
    startBpm: 76,
    targetBpm: 132,
    durationMin: 10,
    barsCount: 8,
    source: 'FretKeys Solo Masterclass (8 Takte)',
    summary: 'Verbindet alle 5 A-Moll-Pentatonik-Boxen diagonal über das Griffbrett (Bund 3 bis Bund 17) mit typischen Eric-Johnson-/Zakk-Wylde-Kaskaden.',
    techniqueFocus: 'Flüssige Slides beim Box-Wechsel (Ringfinger auf G- und e-Saite) und gleichmäßiger 16tel-Wechselschlag.',
    progressionTip: 'Nutze den neuen Auto-Speed-Trainer im Tab-Player: Starte bei 70% und lass nach jedem 2. Loop automatisch +5% steigern!',
    previewNotes: [57, 60, 62, 64, 67, 69, 72, 74],
    alphaTex: `\\title "Pentatonic Diagonal Runs & Cascades (A Minor)"
\\tempo 100
.
\\track "Lead Guitar"
\\staff {score tabs}
\\instrument 29
:16 3.6 5.6 5.5 7.5 5.4 7.4 7.4{sl} 9.4 7.3 9.3 8.2 10.2 8.1 10.1 10.1{sl} 12.1 |
12.1 10.1 13.2 10.2 12.3 9.3 12.4 10.4 12.5 10.5 12.6 10.6 10.6 12.6 10.5 12.5 |
10.5 12.5 10.4 12.4 12.4{sl} 14.4 12.3 14.3 13.2 15.2 12.1 15.1 15.1{sl} 17.1 15.1 17.2 |
17.1 15.1 17.2 15.2 15.1 17.2 15.2 14.3 17.2 15.2 14.3 12.3 14.4 12.4 15.5 12.5 |
5.6 8.6 5.5 7.5 8.6 5.5 7.5 5.4 5.5 7.5 5.4 7.4 7.5 5.4 7.4 5.3 |
5.4 7.4 5.3 7.3 7.4 5.3 7.3 5.2 5.3 7.3 5.2 8.2 7.3 5.2 8.2 5.1 |
8.1 5.1 8.2 5.2 7.3 5.1 8.2 5.2 7.3 5.3 8.2 5.2 7.3 5.3 7.4 5.3 |
7.3 5.3 7.4 5.4 7.5 5.4 7.5 5.5 8.6 5.6 7.5 5.5 5.6.4`,
  },

  // 2. Pentatonic High-Speed 4er & 6er Box-Connect (E Minor)
  {
    id: 'solo-pentatonic-cascades-4s',
    title: 'Pentatonik High-Speed 4er- & 6er-Sequenzen (E-Moll, Bund 12 → 19)',
    section: 'Solo-Läufe, Classic & Hard Rock',
    topics: ['Solieren', 'Fast-Picking', 'Classic & Hard Rock'],
    instrument: 'Gitarre',
    difficulty: 'Fortgeschritten',
    startBpm: 80,
    targetBpm: 142,
    durationMin: 10,
    barsCount: 8,
    source: 'FretKeys Solo Masterclass (8 Takte)',
    summary: 'Brennende Pentatonik-Läufe in hoher Lage (E-Moll, Bund 12–19): 4er-Ketten aufwärts, 6er-Gruppen abwärts und explosive Finale-Läufe.',
    techniqueFocus: 'Konsequentes Alternate Picking mit klarer Betonung auf jeder 1. Note der Sequenzgruppe (Downstroke-Akzent).',
    progressionTip: 'Aktiviere im Tab-Player zusätzlich Auto-Transpose (+1 Halbton alle 2 Loops), um das Muster sicher über das ganze Griffbrett zu beherrschen.',
    previewNotes: [64, 67, 69, 71, 74, 76, 79, 81],
    alphaTex: `\\title "High-Speed Pentatonic 4s & 6s (E Minor)"
\\tempo 106
.
\\track "Lead Guitar"
\\staff {score tabs}
\\instrument 29
:16 12.6 15.6 12.5 14.5 15.6 12.5 14.5 12.4 12.5 14.5 12.4 14.4 14.5 12.4 14.4 12.3 |
12.4 14.4 12.3 14.3 14.4 12.3 14.3 12.2 12.3 14.3 12.2 15.2 14.3 12.2 15.2 12.1 |
15.1 12.1 15.2 12.2 12.1 15.2 12.2 14.3 15.2 12.2 14.3 12.3 12.2 14.3 12.3 14.4 |
14.3 12.3 14.4 12.4 12.3 14.4 12.4 14.5 14.4 12.4 14.5 12.5 12.4 14.5 12.5 15.6 |
14.4 12.3 14.3 16.3 15.2 17.2 15.1 17.1 19.1 17.1 15.1 17.2 15.2 16.3 14.3 12.3 |
17.1 15.1 17.2 15.2 17.1 15.1 17.2 15.2 19.1 17.1 19.2 17.2 19.1 17.1 15.1 17.2 |
15.1 12.1 15.2 12.2 14.3 12.3 15.2 12.2 14.3 12.3 14.4 12.4 14.3 12.3 14.4 12.4 |
14.5 12.5 14.4 12.4 12.3 14.3 12.2 15.2 12.1 15.1 17.1 19.1 19.1.4`,
  },

  // 3. Pedal Note Phrases (Neoclassical / Malmsteen / Rhoads / Maiden)
  {
    id: 'solo-pedal-note-neoclassical',
    title: 'Pedal-Note Phrasen: Harmonisch Moll & Rock (E-Moll – Malmsteen / Rhoads Style)',
    section: 'Solo-Läufe, Classic & Hard Rock',
    topics: ['Solieren', 'Fast-Picking', 'Classic & Hard Rock'],
    instrument: 'Gitarre',
    difficulty: 'Fortgeschritten',
    startBpm: 76,
    targetBpm: 138,
    durationMin: 10,
    barsCount: 8,
    source: 'FretKeys Solo Masterclass (8 Takte)',
    summary: 'Klassische Pedal-Tone-Sequenzen (statischer Referenzton im Wechsel mit bewegter Melodielinie) in E-Moll & E-Harmonisch-Moll über e- und H-Saite.',
    techniqueFocus: 'Sauberes Alternate Picking zwischen hohem Pedalton (z. B. 12. Bund) und sich bewegender Melodie – absolut gleichmäßiges 16tel-Raster.',
    progressionTip: 'Übe erst die reine e-Saiten-Linie (Takte 1–4) im Loop und nimm dann die 2-Saiten-Pedal-Sprünge (Takte 5–8) dazu.',
    previewNotes: [76, 79, 76, 78, 76, 75, 76, 83],
    alphaTex: `\\title "Pedal-Note Phrases: Neoclassical & Hard Rock (E Minor)"
\\tempo 102
.
\\track "Lead Guitar"
\\staff {score tabs}
\\instrument 29
:16 12.1 15.1 12.1 14.1 12.1 15.1 12.1 17.1 12.1 19.1 12.1 17.1 12.1 15.1 12.1 14.1 |
11.1 14.1 11.1 12.1 11.1 14.1 11.1 15.1 11.1 17.1 11.1 15.1 11.1 14.1 11.1 12.1 |
12.1 19.1 12.1 17.1 12.1 15.1 12.1 14.1 12.1 15.1 12.1 14.1 12.1 11.1 12.1 14.1 |
15.1 19.1 15.1 17.1 14.1 17.1 14.1 15.1 12.1 15.1 12.1 14.1 11.1 14.1 11.1 12.1 |
12.1 12.2 12.1 13.2 12.1 15.2 12.1 13.2 12.1 12.2 12.1 10.2 12.1 12.2 12.1 13.2 |
14.1 12.2 14.1 13.2 14.1 15.2 14.1 17.2 15.1 13.2 15.1 15.2 15.1 17.2 15.1 19.2 |
19.1 12.1 17.1 12.1 15.1 12.1 14.1 12.1 15.1 11.1 14.1 11.1 12.1 11.1 14.1 11.1 |
12.1 15.1 14.1 12.1 15.2 13.2 12.2 11.3 12.3 14.3 12.2 13.2 12.1.4`,
  },

  // 4. Open-String Pedal-Note & Pull-Off Rock Runs
  {
    id: 'solo-pedal-note-open-string',
    title: 'Open-String Pedal-Note & Pull-Off Rock-Läufe (E-Moll – AC/DC / Maiden / EVH)',
    section: 'Solo-Läufe, Classic & Hard Rock',
    topics: ['Classic & Hard Rock', 'Legato', 'Fast-Picking', 'Solieren'],
    instrument: 'Gitarre',
    difficulty: 'Mittel',
    startBpm: 80,
    targetBpm: 144,
    durationMin: 9,
    barsCount: 8,
    source: 'FretKeys Solo Masterclass (8 Takte)',
    summary: 'Hochenergetische Leersaiten-Pedal-Läufe auf hoher e- und H-Saite: blitzschnelle Pull-Offs zur Leersaite im Stil von Iron Maiden, AC/DC & Van Halen.',
    techniqueFocus: 'Präzise Pull-Offs nach unten abziehen, damit die Leersaite genauso kraftvoll klingt wie der gegriffene Ton; Handballen dämpft tiefe Saiten.',
    progressionTip: 'Erst mit sauberem Wechselschlag jede Note anschlagen, danach im reinen Pull-Off-Modus auf hohes Tempo bringen!',
    previewNotes: [76, 64, 74, 64, 72, 64, 71, 64],
    alphaTex: `\\title "Open-String Pedal-Note & Pull-Off Rock Runs (E Minor)"
\\tempo 112
.
\\track "Rock Lead"
\\staff {score tabs}
\\instrument 29
:16 12.1{h} 0.1 10.1{h} 0.1 8.1{h} 0.1 7.1{h} 0.1 8.1{h} 0.1 7.1{h} 0.1 5.1{h} 0.1 3.1{h} 0.1 |
7.1{h} 0.1 8.1{h} 0.1 10.1{h} 0.1 8.1{h} 0.1 12.1{h} 0.1 10.1{h} 0.1 8.1{h} 0.1 7.1{h} 0.1 |
12.2{h} 0.2 10.2{h} 0.2 8.2{h} 0.2 7.2{h} 0.2 5.2{h} 0.2 7.2{h} 0.2 8.2{h} 0.2 10.2{h} 0.2 |
12.2{h} 0.2 13.2{h} 0.2 15.2{h} 0.2 13.2{h} 0.2 12.2{h} 0.2 10.2{h} 0.2 8.2{h} 0.2 7.2{h} 0.2 |
7.1{h} 0.1 5.1{h} 0.1 7.1{h} 0.1 8.1{h} 0.1 10.1{h} 0.1 0.1 8.1{h} 0.1 7.1{h} 0.1 5.1{h} 0.1 |
12.1{h} 0.1 14.1{h} 0.1 15.1{h} 0.1 14.1{h} 0.1 12.1{h} 0.1 10.1{h} 0.1 12.1{h} 0.1 15.1{h} 0.1 |
15.1{h} 12.1{h} 0.1 14.1{h} 10.1{h} 0.1 12.1{h} 8.1{h} 0.1 10.1{h} 7.1{h} 0.1 8.1{h} 5.1{h} 0.1 7.1 |
5.1{h} 3.1{h} 0.1 2.1{h} 0.1 3.2{h} 0.2 5.2{h} 0.2 4.3{h} 0.3 2.4 0.1.4`,
  },

  // 5. Fast Legato Bursts over 2 Strings (B & e)
  {
    id: 'solo-fast-legato-2string',
    title: 'Schnelle 2-Saiten Legato-Bursts (H- & e-Saite – Satriani / Greg Howe Style)',
    section: 'Solo-Läufe, Classic & Hard Rock',
    topics: ['Legato', 'Solieren'],
    instrument: 'Gitarre',
    difficulty: 'Fortgeschritten',
    startBpm: 72,
    targetBpm: 132,
    durationMin: 9,
    barsCount: 8,
    source: 'FretKeys Solo Masterclass (8 Takte)',
    summary: 'Flüssige, extrem schnelle Legato-Phrasen gezielt über nur 2 Saiten (H- & e-Saite) in G-Dur/E-Moll – von Bund 5 bis Bund 17 mit flüssigen Lagen-Slides.',
    techniqueFocus: 'Nur der 1. Ton pro Saite wird sanft angeschlagen; die linke Hand erzeugt den kompletten Rest per Hammer-On, Pull-Off und Slide.',
    progressionTip: 'Halte den Daumen der Greifhand mittig hinter dem Hals, damit weite 3NPS-Spannungen (z. B. 7–8–10 und 12–14–15) mühelos laufen.',
    previewNotes: [64, 66, 67, 69, 71, 72, 74, 76],
    alphaTex: `\\title "Fast 2-String Legato Bursts (G Major / E Minor)"
\\tempo 98
.
\\track "Legato Lead"
\\staff {score tabs}
\\instrument 29
:16 5.2{h} 7.2{h} 8.2 5.1{h} 7.1{h} 8.1{h} 7.1{h} 5.1 8.2{h} 7.2{h} 5.2 7.2{h} 8.2 5.1{h} 7.1{h} 8.1 |
7.2{h} 8.2{h} 10.2 7.1{h} 8.1{h} 10.1{h} 8.1{h} 7.1 10.2{h} 8.2{h} 7.2 8.2{h} 10.2 7.1{h} 8.1{h} 10.1 |
8.2{h} 10.2{h} 12.2 8.1{h} 10.1{h} 12.1{h} 10.1{h} 8.1 12.2{h} 10.2{h} 8.2 10.2{h} 12.2 8.1{h} 10.1{h} 12.1 |
10.2{h} 12.2{h} 13.2 10.1{h} 12.1{h} 14.1{h} 12.1{h} 10.1 13.2{h} 12.2{h} 10.2 12.2{h} 13.2 10.1{h} 12.1{h} 14.1 |
12.2{h} 13.2{h} 15.2 12.1{h} 14.1{h} 15.1{h} 14.1{h} 12.1 15.2{h} 13.2{h} 12.2 13.2{h} 15.2 12.1{h} 14.1{h} 15.1 |
15.1{h} 14.1{h} 12.1 15.2{h} 13.2{h} 12.2 14.1{h} 12.1{h} 10.1 13.2{h} 12.2{h} 10.2 12.1{h} 10.1{h} 8.1 12.2 |
10.2{h} 8.2 10.1{h} 8.1{h} 7.1 10.2{h} 8.2{h} 7.2 8.1{h} 7.1{h} 5.1 8.2{h} 7.2{h} 5.2 7.1{h} 5.1 |
8.2{h} 7.2{h} 5.2 7.2{h} 8.2 7.1{h} 8.1 10.1{h} 12.1 12.1{sl} 15.1 14.1{h} 12.1 12.1.4`,
  },

  // 6. Fast Legato Sequences over 3 Strings (G-B-e)
  {
    id: 'solo-fast-legato-3string',
    title: 'Schnelle 3-Saiten Legato-Phrasen (G–H–e – Guthrie Govan / Holdsworth Flow)',
    section: 'Solo-Läufe, Classic & Hard Rock',
    topics: ['Legato', 'Solieren'],
    instrument: 'Gitarre',
    difficulty: 'Fortgeschritten',
    startBpm: 70,
    targetBpm: 126,
    durationMin: 10,
    barsCount: 8,
    source: 'FretKeys Solo Masterclass (8 Takte)',
    summary: 'Moderne 3-Saiten-Legato-Linien (G–H–e) in A-Dorisch mit weiten 3NPS-Hammer-Ons, flüssigen Richtungswechseln und Lagen-Shifts.',
    techniqueFocus: 'Kein harter Anschlag beim Saitenwechsel – nutze "Hammer-On from Nowhere" beim Abwärts-Wechsel auf die tiefere Saite.',
    progressionTip: 'Konzentriere dich auf absolut rundes, saxophonartiges Legato ohne Lautstärkesprünge zwischen den Saiten.',
    previewNotes: [69, 71, 72, 74, 76, 78, 79, 81],
    alphaTex: `\\title "Fast 3-String Legato Phrases (A Dorian)"
\\tempo 94
.
\\track "Fusion Legato"
\\staff {score tabs}
\\instrument 29
:16 5.3{h} 7.3{h} 9.3 7.2{h} 8.2{h} 10.2 7.1{h} 8.1{h} 10.1 8.1{h} 7.1 10.2{h} 8.2{h} 7.2 9.3{h} 7.3 |
7.3{h} 9.3{h} 11.3 8.2{h} 10.2{h} 12.2 8.1{h} 10.1{h} 12.1 10.1{h} 8.1 12.2{h} 10.2{h} 8.2 11.3{h} 9.3 |
9.3{h} 11.3{h} 12.3 10.2{h} 12.2{h} 14.2 10.1{h} 12.1{h} 14.1 12.1{h} 10.1 14.2{h} 12.2{h} 10.2 12.3{h} 11.3 |
11.3{h} 12.3{h} 14.3 12.2{h} 14.2{h} 15.2 12.1{h} 14.1{h} 15.1 14.1{h} 12.1 15.2{h} 14.2{h} 12.2 14.3{h} 12.3 |
15.1{h} 14.1{h} 12.1 15.2{h} 14.2{h} 12.2 14.3{h} 12.3{h} 11.3 12.2{h} 14.2{h} 15.2 12.1{h} 14.1{h} 15.1 14.1 |
14.1{h} 12.1{h} 10.1 14.2{h} 12.2{h} 10.2 12.3{h} 11.3{h} 9.3 10.2{h} 12.2{h} 14.2 10.1{h} 12.1{h} 14.1 12.1 |
12.1{h} 10.1{h} 8.1 12.2{h} 10.2{h} 8.2 11.3{h} 9.3{h} 7.3 8.2{h} 10.2{h} 12.2 8.1{h} 10.1{h} 12.1 10.1 |
10.1{h} 8.1{h} 7.1 10.2{h} 8.2{h} 7.2 9.3{h} 7.3{h} 5.3 7.3{h} 9.3 10.2.4`,
  },

  // 7. Alternate Picking + Hammer-On / Pull-Off Combo Sequence
  {
    id: 'solo-altpick-legato-combo',
    title: 'Alternate Picking + Hammer-On / Pull-Off Kombi-Sequenz (A-Moll Hybrid-Flow)',
    section: 'Solo-Läufe, Classic & Hard Rock',
    topics: ['Fast-Picking', 'Legato', 'Solieren', 'Classic & Hard Rock'],
    instrument: 'Gitarre',
    difficulty: 'Mittel',
    startBpm: 76,
    targetBpm: 136,
    durationMin: 10,
    barsCount: 8,
    source: 'FretKeys Solo Masterclass (8 Takte)',
    summary: 'Die wichtigste Profi-Technik für entspannte High-Speed-Läufe: schlage die Saitenübergänge mit Alternate Picking an und lass die 3-Noten-Phrasen dazwischen per Hammer-On/Pull-Off rollen.',
    techniqueFocus: 'Achte auf das Timing beim Wechsel zwischen hart gepickten und gebundenen Tönen – kein "Eilen" im Legato-Teil!',
    progressionTip: 'Perfekt für den Auto-Speed-Trainer: starte bei 75% mit Klick und steigere alle 2 Durchgänge um +5%.',
    previewNotes: [57, 59, 60, 62, 64, 65, 67, 69],
    alphaTex: `\\title "Alternate Picking + Hammer-On/Pull-Off Combo (A Minor)"
\\tempo 100
.
\\track "Rock Lead"
\\staff {score tabs}
\\instrument 29
:16 5.4 7.4 9.4 5.3{h} 7.3{h} 9.3 7.3 5.3 9.4 7.4 5.4 7.4 9.4 5.3{h} 7.3{h} 9.3 |
5.3 7.3 9.3 6.2{h} 8.2{h} 10.2 8.2 6.2 9.3 7.3 5.3 7.3 9.3 6.2{h} 8.2{h} 10.2 |
6.2 8.2 10.2 7.1{h} 8.1{h} 10.1 8.1 7.1 10.2 8.2 6.2 8.2 10.2 7.1{h} 8.1{h} 10.1 |
12.1{h} 10.1{h} 8.1 10.1 12.1 10.1 8.1 10.2 10.1{h} 8.1{h} 7.1 8.1 10.1 8.1 7.1 8.2 |
8.1{h} 7.1{h} 5.1 7.1 8.1 7.1 5.1 6.2 10.2{h} 8.2{h} 6.2 8.2 10.2 8.2 6.2 9.3 |
7.4 9.4 10.4 7.3{h} 9.3{h} 10.3 9.3 7.3 10.4 9.4 7.4 9.4 10.4 7.3{h} 9.3{h} 10.3 |
8.2 10.2 12.2 8.1{h} 10.1{h} 12.1 10.1 8.1 12.2 10.2 8.2 10.2 12.2 8.1{h} 10.1{h} 12.1 |
13.1{h} 12.1{h} 10.1 12.1 15.1{h} 13.1{h} 12.1 13.1 17.1{h} 15.1{h} 13.1 12.1 17.1.4`,
  },

  // 8. Pick-PullOff-Pick 16tel Bursts over 3 Strings (Timmons / Vai)
  {
    id: 'solo-pick-pulloff-bursts',
    title: 'Pick–Pull-Off–Pick 16tel-Bursts über 3 Saiten (E-Moll – Timmons / Vai Style)',
    section: 'Solo-Läufe, Classic & Hard Rock',
    topics: ['Fast-Picking', 'Legato', 'Solieren'],
    instrument: 'Gitarre',
    difficulty: 'Fortgeschritten',
    startBpm: 74,
    targetBpm: 132,
    durationMin: 9,
    barsCount: 8,
    source: 'FretKeys Solo Masterclass (8 Takte)',
    summary: 'Explosive 4-Noten- und 6-Noten-Bursts aus Pick + Pull-Off + Saitenwechsel – erzeugt diesen typisch schnappigen, dynamischen Rock-Fusion-Attack.',
    techniqueFocus: 'Knackiger Abschlag auf die höchste Note der Figur, sofortiger Pull-Off und sauberer Aufschlag auf der Nachbarsaite.',
    progressionTip: 'Übe die Bursts zuerst mit bewusster Pause zwischen je 2 Gruppen, dann nahtlos durchlaufend.',
    previewNotes: [76, 74, 71, 74, 71, 69, 67, 64],
    alphaTex: `\\title "Pick-PullOff-Pick 16th Bursts (E Minor)"
\\tempo 98
.
\\track "Lead Guitar"
\\staff {score tabs}
\\instrument 29
:16 15.1{h} 12.1 15.2 12.1 15.1{h} 12.1 15.2 12.2 14.1{h} 12.1 15.2 12.1 14.1{h} 12.1 15.2 12.2 |
15.2{h} 12.2 14.3 12.2 15.2{h} 12.2 14.3 12.3 13.2{h} 12.2 14.3 12.2 13.2{h} 12.2 14.3 12.3 |
14.3{h} 12.3 14.4 12.3 14.3{h} 12.3 14.4 12.4 12.3{h} 11.3 14.4 11.3 12.3{h} 11.3 14.4 12.4 |
12.3{h} 14.3 12.2 15.2{h} 12.2 14.3 12.1 15.1{h} 12.1 15.2 14.1 15.1{h} 14.1 12.1 15.2 12.2 |
17.1{h} 15.1 17.2 15.1 17.1{h} 15.1 17.2 15.2 19.1{h} 15.1 17.2 15.1 19.1{h} 15.1 17.2 15.2 |
19.1{h} 17.1{h} 15.1 17.2 17.1{h} 15.1{h} 14.1 15.2 15.1{h} 14.1{h} 12.1 15.2 14.1{h} 12.1{h} 10.1 13.2 |
12.1{h} 10.1{h} 8.1 12.2 10.1{h} 8.1{h} 7.1 10.2 8.1{h} 7.1{h} 5.1 8.2 7.1{h} 5.1{h} 3.1 7.2 |
5.1{h} 3.1{h} 2.1 5.2 3.1{h} 2.1{h} 0.1 3.2 5.2{h} 3.2 4.3 2.3 5.2.4`,
  },

  // 9. Jimmy Page Classic Rock Licks (Led Zeppelin Style)
  {
    id: 'rock-jimmy-page-licks',
    title: 'Jimmy Page Classic Rock Etüde: Cyclic Pull-Off Flurries & Stairway-Licks (A-Moll)',
    section: 'Solo-Läufe, Classic & Hard Rock',
    topics: ['Classic & Hard Rock', 'Blues', 'Solieren', 'Legato'],
    instrument: 'Gitarre',
    difficulty: 'Mittel',
    startBpm: 80,
    targetBpm: 136,
    durationMin: 10,
    barsCount: 8,
    source: 'FretKeys Classic Rock Repertoire (8 Takte)',
    summary: 'Das klassische Jimmy-Page-Vokabular (Stairway / Heartbreaker / Whole Lotta Love): rasante zyklische 3-Noten-Pull-Off-Flurries, Pentatonik-Abstürze und treibende Blues-Rock-Endungen.',
    techniqueFocus: 'Das berühmte Page-Muster (8p5 auf e-Saite → 8 auf H-Saite) als 16tel-Kette über den Takt verschieben – erzeugt sofort Vintage-Rock-Spannung!',
    progressionTip: 'Mit leicht angezerrtem Sound üben und die Zählzeiten bewusst spüren, während die 3er-Figur über das 4/4-Raster wandert.',
    previewNotes: [72, 69, 67, 72, 69, 67, 74, 72],
    alphaTex: `\\title "Jimmy Page Classic Rock Licks (A Minor)"
\\tempo 108
.
\\track "Classic Rock Les Paul"
\\staff {score tabs}
\\instrument 29
:16 8.1{h} 5.1 8.2 8.1{h} 5.1 8.2 8.1{h} 5.1 8.2 8.1{h} 5.1 8.2 8.1{h} 5.1 8.2 5.1 |
7.3 5.2 8.2{h} 5.2 7.3 5.3 7.3{h} 5.3 7.4 5.4 7.3 5.3 7.4{h} 5.4 7.5 5.5 |
5.3{h} 7.3 5.2 8.2{h} 5.2 7.3 5.2 5.1 8.1{h} 5.1 8.2 5.1 8.1{h} 5.1 8.2 5.2 |
8.2{h} 5.2 7.3 8.2{h} 5.2 7.3 8.2{h} 5.2 7.3 8.2{h} 5.2 7.3 7.3{h} 5.3 7.4 5.3 |
10.1{h} 8.1 10.2 10.1{h} 8.1 10.2 10.1{h} 8.1 10.2 10.1{h} 8.1 10.2 12.1{h} 10.1 13.2 10.1 |
15.1{h} 12.1 15.2 15.1{h} 12.1 15.2 15.1{h} 12.1 15.2 12.1 15.2{h} 13.2 12.2 14.3 12.3 14.4 |
14.3 12.3 14.4 12.4 12.3 14.3 12.2 13.2 15.2 12.1 15.1 17.1 15.1 12.1 15.2 13.2 |
7.3{sl} 9.3 8.2 10.2 10.1{h} 8.1 10.2 8.2 7.3{h} 5.3 7.4 5.3 7.4.4`,
  },

  // 10. Angus Young Hard Rock Licks (AC/DC Style)
  {
    id: 'rock-angus-young-licks',
    title: 'Angus Young Hard-Rock Etüde: Open-String Boogie, Double-Stops & Mixolydik (A)',
    section: 'Solo-Läufe, Classic & Hard Rock',
    topics: ['Classic & Hard Rock', 'Blues', 'Solieren'],
    instrument: 'Gitarre',
    difficulty: 'Mittel',
    startBpm: 88,
    targetBpm: 144,
    durationMin: 10,
    barsCount: 8,
    source: 'FretKeys Classic Rock Repertoire (8 Takte)',
    summary: 'Purer AC/DC-Lead-Style in A: bissige kleine-zu-große-Terz-Slides (C→C#), energiegeladene Double-Stops, Open-String-Boogie-Läufe und rockige Turnarounds.',
    techniqueFocus: 'Fester, perkussiver Plektrum-Anschlag (Attitude!), sauberes Abdämpfen zwischen Double-Stops und glasklare Pull-Offs.',
    progressionTip: 'Kombiniere diese 8 Takte mit der Drum-Machine auf "Rock 8tel" oder "Back in Black" Groove bei 110–130 BPM!',
    previewNotes: [60, 61, 64, 69, 67, 64, 60, 61],
    alphaTex: `\\title "Angus Young Hard-Rock Licks (Key of A)"
\\tempo 116
.
\\track "SG Hard Rock"
\\staff {score tabs}
\\instrument 29
:8 5.3{sl} 6.3 (5.2 5.1) (5.2 5.1) 8.2{h} 5.2 7.3 5.3 7.4 |
5.3{sl} 6.3 5.2 5.1 8.1{h} 5.1 8.2 5.2 7.3 5.3 |
:16 0.2 5.2{h} 0.2 7.2{h} 0.2 8.2{h} 0.2 7.2{h} 0.2 5.2{h} 0.2 7.2{h} 0.2 8.2{h} 0.2 10.2{h} |
0.2 12.2{h} 0.2 10.2{h} 0.2 8.2{h} 0.2 7.2{h} 0.2 8.2{h} 0.2 7.2{h} 0.2 5.2{h} 0.2 3.2{h} |
:8 (5.2 5.1) (5.2 5.1) 8.2 5.2 (5.3 5.2) (6.3 5.2) (7.4 7.3) 5.3 |
:16 5.3{h} 6.3 5.2 5.1 8.1{h} 5.1 8.2 5.2 7.3{h} 5.3 7.4 5.4 7.5{h} 5.5 3.6 5.6 |
:8 14.3 15.2 17.2 14.1 17.1{h} 14.1 17.2 15.2 |
:16 14.3 15.2 17.2 14.1 17.1 14.1 17.2 15.2 14.3{h} 12.3 14.4 12.4 14.4.4`,
  },

  // 11. Paul Gilbert Intense Rock 6-Note Picking & String Skipping
  {
    id: 'rock-paul-gilbert-intense',
    title: 'Paul Gilbert "Intense Rock": 6er-Picking-Motiv & String-Skipping (E-Moll / G-Dur)',
    section: 'Solo-Läufe, Classic & Hard Rock',
    topics: ['Classic & Hard Rock', 'Fast-Picking', 'Solieren'],
    instrument: 'Gitarre',
    difficulty: 'Fortgeschritten',
    startBpm: 76,
    targetBpm: 148,
    durationMin: 12,
    barsCount: 8,
    source: 'FretKeys Classic Rock Repertoire (8 Takte)',
    summary: 'Das legendäre Paul-Gilbert-6-Noten-Picking-Lick durch 4 diatonische Lagen in G-Dur/E-Moll – plus typische Gilbert-String-Skipping-Arpeggios im zweiten Teil.',
    techniqueFocus: '100% striktes Alternate Picking (Inside/Outside-Picking sauber halten!), Plektrum leicht angewinkelt für minimalen Widerstand.',
    progressionTip: 'Spiele erst Takte 1–4 im Loop mit dem Auto-Speed-Trainer von 65% auf 110% – das ist eine der effektivsten Picking-Übungen der Rockgeschichte.',
    previewNotes: [76, 78, 79, 78, 76, 74, 76, 78],
    alphaTex: `\\title "Paul Gilbert Intense Rock: 6s & String Skipping (E Minor)"
\\tempo 104
.
\\track "Shred Lead"
\\staff {score tabs}
\\instrument 29
:16 12.1 14.1 15.1 14.1 12.1 15.2 12.1 14.1 15.1 14.1 12.1 15.2 12.1 14.1 15.1 14.1 |
10.1 12.1 14.1 12.1 10.1 13.2 10.1 12.1 14.1 12.1 10.1 13.2 10.1 12.1 14.1 12.1 |
8.1 10.1 12.1 10.1 8.1 12.2 8.1 10.1 12.1 10.1 8.1 12.2 8.1 10.1 12.1 10.1 |
7.1 8.1 10.1 8.1 7.1 10.2 7.1 8.1 10.1 8.1 7.1 10.2 7.1 8.1 10.1 12.1 |
12.3 9.3 12.1 15.1 12.1 9.3 12.3 15.1 11.3 7.3 10.1 14.1 10.1 7.3 11.3 14.1 |
9.3 5.3 8.1 12.1 8.1 5.3 9.3 12.1 8.3 4.3 7.1 11.1 7.1 4.3 8.3 11.1 |
7.3 9.3 11.3 8.1 10.1 12.1 9.3 11.3 12.3 10.1 12.1 14.1 11.3 12.3 14.3 12.1 |
14.1 15.1 14.1 12.1 15.2 13.2 12.2 14.3 12.3 11.3 12.2 15.2 12.1.4`,
  },

  // 12. Slash / Gary Moore Melodic Hard Rock & Chromatic Escalator
  {
    id: 'rock-slash-blues-melodic',
    title: 'Slash / Gary Moore Hard-Rock Etüde: Chromatic Passing & Escalator Runs (E-Moll)',
    section: 'Solo-Läufe, Classic & Hard Rock',
    topics: ['Classic & Hard Rock', 'Blues', 'Solieren', 'Legato'],
    instrument: 'Gitarre',
    difficulty: 'Mittel',
    startBpm: 78,
    targetBpm: 128,
    durationMin: 10,
    barsCount: 8,
    source: 'FretKeys Classic Rock Repertoire (8 Takte)',
    summary: 'Melodischer 80s/90s Hard-Rock-Lead-Style à la Slash & Gary Moore: chromatische Durchgangstöne in der Moll-Pentatonik, emotionale Lagen-Climbs und schnelle Escalator-Licks.',
    techniqueFocus: 'Saftiges Fingervibrato auf den Zielnoten (Takte 4 & 8) und fließende chromatische Übergänge (z. B. 14–13–12) ohne Hängenbleiben.',
    progressionTip: 'Achte darauf, die chromatischen Noten leicht durchlaufen zu lassen und auf den Akkordtönen (E, G, H) klangvoll zu landen.',
    previewNotes: [76, 75, 74, 71, 70, 69, 67, 64],
    alphaTex: `\\title "Slash & Gary Moore Melodic Hard Rock (E Minor)"
\\tempo 102
.
\\track "Les Paul Lead"
\\staff {score tabs}
\\instrument 29
:16 12.3 14.3 15.3 14.3 12.3 14.4 12.4 14.3 12.2 15.2 14.2 13.2 12.2 15.2 14.3 12.3 |
12.2 13.2 15.2 12.1 14.1 15.1 14.1 12.1 15.2 13.2 12.2 14.3 12.3 11.3 12.3 14.3 |
15.2 12.1 14.1 15.1 17.1 15.1 14.1 12.1 15.2 17.2 15.1 17.1 19.1 17.1 15.1 17.2 |
17.1.8 15.1.8 14.1.8 15.1.8 12.1.2{v} |
14.4 12.3 14.3 15.3 12.2 14.2 15.2 12.1 14.1 15.1 14.1 12.1 15.2 14.2 12.2 15.3 |
14.3 12.3 15.3 14.3 12.3 14.4 12.4 14.5 12.5 14.4 12.3 14.3 12.2 15.2 12.1 15.1 |
15.1{h} 12.1 15.2{h} 12.2 14.3{h} 12.3 14.4{h} 12.4 12.3 14.3 12.2 15.2 12.1 14.1 15.1 17.1 |
19.1{h} 17.1 15.1 14.1 15.1{h} 14.1 12.1 15.2 12.1.2{v}`,
  },

  // 13. Eddie Van Halen Style 3NPS Symmetry & Trill Runs
  {
    id: 'rock-evh-tremolo-legato',
    title: 'Van Halen Style: Symmetrische 3NPS-Legato-Läufe & High-Speed Trills (A-Moll)',
    section: 'Solo-Läufe, Classic & Hard Rock',
    topics: ['Classic & Hard Rock', 'Legato', 'Fast-Picking', 'Solieren'],
    instrument: 'Gitarre',
    difficulty: 'Fortgeschritten',
    startBpm: 80,
    targetBpm: 146,
    durationMin: 10,
    barsCount: 8,
    source: 'FretKeys Classic Rock Repertoire (8 Takte)',
    summary: 'Typische EVH-Signature-Muster: symmetrische 3-Noten-pro-Saite-Formen über alle 6 Saiten (5–7–8 / 7–9–10), schnelle Triller-Ketten und rasante Aufwärts-Runs.',
    techniqueFocus: 'Lockeres Handgelenk bei den schnellen Trillern und absolut sauberes Synchronisieren bei den symmetrischen 3-Bund-Sprüngen.',
    progressionTip: 'Mit dem Auto-Speed-Trainer langsam bei 70% anfangen – sobald das symmetrische Griffmuster im Muskelgedächtnis sitzt, fliegt der Lauf!',
    previewNotes: [57, 59, 60, 62, 64, 65, 67, 69],
    alphaTex: `\\title "Van Halen Style Symmetrical Legato & Trills (A Minor)"
\\tempo 108
.
\\track "EVH Lead"
\\staff {score tabs}
\\instrument 29
:16 5.6{h} 7.6{h} 8.6 5.5{h} 7.5{h} 8.5 5.4{h} 7.4{h} 8.4 5.3{h} 7.3{h} 8.3 5.2{h} 7.2{h} 8.2 5.1 |
8.1{h} 7.1{h} 5.1 8.2{h} 7.2{h} 5.2 8.3{h} 7.3{h} 5.3 8.4{h} 7.4{h} 5.4 8.5{h} 7.5{h} 5.5 8.6 |
7.6{h} 9.6{h} 10.6 7.5{h} 9.5{h} 10.5 7.4{h} 9.4{h} 10.4 7.3{h} 9.3{h} 10.3 8.2{h} 10.2{h} 12.2 8.1 |
12.1{h} 10.1{h} 8.1 12.2{h} 10.2{h} 8.2 10.3{h} 9.3{h} 7.3 10.4{h} 9.4{h} 7.4 10.5{h} 9.5{h} 7.5 10.6 |
5.1{h} 8.1{h} 5.1{h} 8.1 7.1{h} 10.1{h} 7.1{h} 10.1 8.1{h} 12.1{h} 8.1{h} 12.1 10.1{h} 13.1{h} 10.1{h} 13.1 |
12.1{h} 15.1{h} 12.1{h} 15.1 13.1{h} 17.1{h} 13.1{h} 17.1 15.1{h} 17.1{h} 15.1{h} 13.1 12.1{h} 13.1{h} 12.1{h} 10.1 |
12.3{h} 14.3{h} 16.3 13.2{h} 15.2{h} 17.2 12.1{h} 15.1{h} 17.1 15.1{h} 12.1 17.2{h} 15.2{h} 13.2 16.3{h} 14.3 |
12.3{h} 14.3 15.2{h} 17.2 15.1{h} 17.1 19.1{h} 17.1 17.1.2{v}`,
  },

  // 14. Ritchie Blackmore / Deep Purple Classic Rock (D Dorian / Harmonic Minor)
  {
    id: 'rock-ritchie-blackmore-neorock',
    title: 'Ritchie Blackmore / Deep Purple Classic Rock: Dorisch & Harmonisch Moll (D-Moll)',
    section: 'Solo-Läufe, Classic & Hard Rock',
    topics: ['Classic & Hard Rock', 'Fast-Picking', 'Solieren'],
    instrument: 'Gitarre',
    difficulty: 'Mittel',
    startBpm: 80,
    targetBpm: 134,
    durationMin: 10,
    barsCount: 8,
    source: 'FretKeys Classic Rock Repertoire (8 Takte)',
    summary: 'Der klassische 70s-Hard-Rock-Sound von Deep Purple & Rainbow: barocke Sequenzen in D-Moll / D-Harmonisch-Moll (Highway Star / Burn Style) mit treibenden 16tel-Arpeggios.',
    techniqueFocus: 'Markanter, artikulierter Strat-Anschlag mit sauberer Trennung zwischen den Akkordbrechungen (Dm – Gm – A7 – Dm).',
    progressionTip: 'Wechsle im Tab-Player zwischen Original-Tempo und 115% für das echte Highway-Star-Solo-Gefühl!',
    previewNotes: [62, 65, 69, 74, 72, 70, 69, 67],
    alphaTex: `\\title "Ritchie Blackmore Classic Hard Rock (D Minor)"
\\tempo 110
.
\\track "Strat Lead"
\\staff {score tabs}
\\instrument 29
:16 10.1 13.1 10.1 10.2 10.1 13.1 10.1 10.2 12.1 15.1 12.1 12.2 12.1 15.1 12.1 12.2 |
13.1 17.1 13.1 15.2 13.1 17.1 13.1 15.2 12.1 15.1 12.1 13.2 10.1 13.1 10.1 11.2 |
9.1 12.1 9.1 10.2 9.1 12.1 9.1 10.2 10.1 13.1 10.1 10.2 12.1 15.1 13.1 12.1 |
10.1 13.2 11.2 10.2 12.3 10.3 9.3 10.3 12.3 10.2 11.2 13.2 10.1.4 |
10.4 12.4 14.4 10.3 12.3 14.3 10.2 11.2 13.2 10.1 12.1 13.1 12.1 10.1 13.2 11.2 |
10.2 12.3 10.3 9.3 12.4 10.4 9.4 10.4 12.4 9.3 10.3 12.3 10.2 11.2 13.2 10.1 |
13.1 12.1 10.1 12.1 10.1 9.1 10.1 9.1 10.2 11.2 10.2 9.1 10.1 12.1 13.1 15.1 |
17.1 15.1 13.1 12.1 13.1 12.1 10.1 13.2 11.2 10.2 9.3 10.3 10.2.4`,
  },

  // 15. Blues-Rock Sequences: Repeating 3-Note Phrases, Double-Stops & b5 Runs
  {
    id: 'solo-blues-rock-sequences',
    title: 'Blues-Rock Solo-Sequenzen: Repeating Licks, Double-Stops & b5-Läufe (A-Blues)',
    section: 'Solo-Läufe, Classic & Hard Rock',
    topics: ['Blues', 'Classic & Hard Rock', 'Solieren'],
    instrument: 'Gitarre',
    difficulty: 'Mittel',
    startBpm: 76,
    targetBpm: 124,
    durationMin: 10,
    barsCount: 8,
    source: 'FretKeys Solo Masterclass (8 Takte)',
    summary: 'Komplette 8-Takt-Blues-Rock-Studie in A: wiederholende 3-Noten-Phrasen, aggressive Chuck-Berry-Double-Stops, b5-Blue-Note-Passagen und ein klassischer Blues-Rock-Turnaround.',
    techniqueFocus: 'Betone den Groove (leicht geschwungener Rock-Feel), lass die Double-Stops satt zusammenklingen und artikuliere die b5-Blue-Note klar.',
    progressionTip: 'Übe die Sequenz auch transponiert nach E-Moll (+7 Halbtöne) oder G-Moll (-2 Halbtöne) im Tab-Player!',
    previewNotes: [57, 60, 62, 63, 64, 67, 69, 72],
    alphaTex: `\\title "Blues-Rock Solo Sequences & Double-Stops (A Blues)"
\\tempo 100
.
\\track "Blues Rock Guitar"
\\staff {score tabs}
\\instrument 29
:16 5.3 7.3 8.3 7.3 5.3 7.4 5.4 7.3 5.2 8.2 5.2 7.3 8.3 7.3 5.3 7.4 |
(5.2 5.1).8 (5.2 5.1).8 8.2{h} 5.2 7.3 5.3 (5.2 5.1).8 8.2{h} 5.2 7.3 5.3 7.4 5.4 |
5.1 8.1{h} 5.1 8.2 5.1 8.1{h} 5.1 8.2 5.1 8.1{h} 5.1 8.2 5.2 7.3 8.3 7.3 |
5.3 7.4 5.4 7.5 6.5 5.5 3.6 5.6 5.5 6.5 7.5 5.4 7.4.4 |
8.2 10.2 8.1 10.1 11.1 10.1 8.1 10.2 8.2 9.3 7.3 9.3 8.2 10.2 8.1 10.1 |
(10.2 10.1).8 (10.2 10.1).8 12.1{h} 10.1 13.2 10.2 (10.2 10.1).8 13.2{h} 10.2 12.3 9.3 12.4 10.4 |
8.1 7.1 5.1 8.2 7.2 5.2 8.3 7.3 5.3 7.4 6.4 5.4 7.5 6.5 5.5 3.6 |
:8 (5.2 5.1) (8.2 8.1) (7.2 7.1) (6.2 6.1) (5.2 5.1) 7.4 5.5.4`,
  },

  // 16. SRV / Hendrix Texas Blues-Rock Runs (E Blues)
  {
    id: 'solo-blues-rock-texas-shuffle',
    title: 'SRV / Hendrix Texas Blues-Rock: Power-Runs, Rakes & Turnaround-Feuerwerk (E-Blues)',
    section: 'Solo-Läufe, Classic & Hard Rock',
    topics: ['Blues', 'Classic & Hard Rock', 'Solieren'],
    instrument: 'Gitarre',
    difficulty: 'Fortgeschritten',
    startBpm: 78,
    targetBpm: 126,
    durationMin: 10,
    barsCount: 8,
    source: 'FretKeys Solo Masterclass (8 Takte)',
    summary: 'Kraftvolle Texas-Blues-Rock-Läufe in E (Bund 12 bis Leersaite): typische Stevie-Ray-Vaughan-Schnellläufe, Hendrix-Double-Stops und ein druckvoller Open-E-Turnaround.',
    techniqueFocus: 'Kräftiger Anschlag aus dem Handgelenk (kein dünnes Tippen!) und saubere Kontrolle über Leersaiten-Resonanzen.',
    progressionTip: 'Mit dem Auto-Speed-Trainer von 75% auf 105% hocharbeiten und jeden Abschlag auf den schweren Beats wirklich "spüren".',
    previewNotes: [64, 67, 69, 70, 71, 74, 76, 79],
    alphaTex: `\\title "SRV / Hendrix Texas Blues-Rock Fire (E Blues)"
\\tempo 104
.
\\track "Texas Strat"
\\staff {score tabs}
\\instrument 29
:16 12.1 15.1{h} 12.1 15.2 12.2 14.3 15.3 14.3 12.3 14.4 12.4 14.3 12.3 15.2 12.2 12.1 |
(12.2 12.1).8 (12.2 12.1).8 15.2{h} 12.2 14.3 12.3 (12.3 12.2).8 14.4 12.4 14.3 12.3 14.4 12.4 |
14.5{h} 12.5 15.6 12.6 12.5 14.5 12.4 14.4 12.3 14.3 15.3 14.3 12.2 15.2 12.1 15.1 |
17.1{h} 15.1 12.1 15.2 17.1{h} 15.1 12.1 15.2 15.1{h} 12.1 15.2{h} 12.2 14.3 12.3 14.4.8 |
3.1{h} 0.1 3.2{h} 0.2 2.3{h} 0.3 2.4{h} 0.4 0.3 2.3 3.3 2.3 0.3 2.4 0.4 2.5 |
3.6 0.6 2.5{h} 0.5 2.4{h} 0.4 0.3 2.3 0.2 3.2 0.1 3.1 0.1 3.2 0.2 2.3 |
(3.2 3.1).8 (0.2 0.1).8 3.2{h} 0.2 2.3{h} 0.3 2.4{h} 0.4 1.5 2.5 0.4 2.4 0.3 2.3 |
:8 4.3 0.1 3.3 0.1 2.3 0.1 1.3 0.1 0.6.4 2.5.4`,
  },

  // 17. Hard Rock & Fusion String-Skipping Arpeggios (Em - C - D - Bm)
  {
    id: 'solo-string-skipping-arpeggios',
    title: 'Rock & Fusion String-Skipping Arpeggios (Em – C – D – Bm, Paul Gilbert Style)',
    section: 'Solo-Läufe, Classic & Hard Rock',
    topics: ['Classic & Hard Rock', 'Fast-Picking', 'Legato', 'Solieren'],
    instrument: 'Gitarre',
    difficulty: 'Fortgeschritten',
    startBpm: 72,
    targetBpm: 128,
    durationMin: 10,
    barsCount: 8,
    source: 'FretKeys Solo Masterclass (8 Takte)',
    summary: 'Breite, epische Akkord-Arpeggios über übersprungene Saiten (A→G→e bzw. D→H) über Em – C – D – Bm – klingt gewaltig und trainiert extreme Zielgenauigkeit.',
    techniqueFocus: 'Sauberes Überspringen der mittleren Saite ohne Mitklingen; kombiniere Pick auf dem 1. Ton und Hammer-On auf dem 2. Ton jeder Saite.',
    progressionTip: 'Ideal, um die Akkordtöne über eine typische Rock-Progression direkt im Solo hörbar zu machen!',
    previewNotes: [52, 55, 59, 64, 67, 71, 76, 71],
    alphaTex: `\\title "Rock & Fusion String-Skipping Arpeggios (Em-C-D-Bm)"
\\tempo 96
.
\\track "Rock Lead"
\\staff {score tabs}
\\instrument 29
:16 7.5{h} 10.5 9.3{h} 12.3 12.1{h} 15.1 12.1 12.3{h} 9.3 10.5{h} 7.5 10.5 9.3{h} 12.3 12.1 15.1 |
3.5{h} 7.5 5.3{h} 9.3 8.1{h} 12.1 8.1 9.3{h} 5.3 7.5{h} 3.5 7.5 5.3{h} 9.3 8.1 12.1 |
5.5{h} 9.5 7.3{h} 11.3 10.1{h} 14.1 10.1 11.3{h} 7.3 9.5{h} 5.5 9.5 7.3{h} 11.3 10.1 14.1 |
2.5{h} 5.5 4.3{h} 7.3 7.1{h} 10.1 7.1 7.3{h} 4.3 5.5{h} 2.5 5.5 4.3{h} 7.3 7.1 10.1 |
12.6{h} 15.6 14.4{h} 17.4 12.2{h} 15.2 12.2 17.4{h} 14.4 15.6{h} 12.6 14.4 12.2 15.2 12.1 15.1 |
8.6{h} 12.6 10.4{h} 14.4 8.2{h} 12.2 8.2 14.4{h} 10.4 12.6{h} 8.6 10.4 8.2 12.2 8.1 12.1 |
10.6{h} 14.6 12.4{h} 16.4 10.2{h} 14.2 10.2 16.4{h} 12.4 14.6{h} 10.6 12.4 10.2 14.2 10.1 14.1 |
7.6{h} 10.6 9.4{h} 12.4 7.2{h} 10.2 7.2 12.4{h} 9.4 12.1 14.1 15.1 12.1.4`,
  },

  // 18. Modern Rock-Fusion Dorian Thirds & Hybrid Runs (D Dorian)
  {
    id: 'solo-dorian-fusion-climb',
    title: 'Moderne Rock-Fusion Solo-Etüde: Terzen-Sequenzen & Lagen-Climbs (D-Dorisch)',
    section: 'Solo-Läufe, Classic & Hard Rock',
    topics: ['Solieren', 'Fast-Picking', 'Legato', 'Jazz'],
    instrument: 'Gitarre',
    difficulty: 'Mittel',
    startBpm: 76,
    targetBpm: 128,
    durationMin: 10,
    barsCount: 8,
    source: 'FretKeys Solo Masterclass (8 Takte)',
    summary: 'Melodische D-Dorisch-Soloetüde (Santana / Robben Ford / Fusion-Style): bricht typisches Skalen-Auf-und-Ab durch diatonische Terzen-Sprünge, Slides und Legato-Wendungen auf.',
    techniqueFocus: 'Betone die charakteristische große Sexte (H) von D-Dorisch und verbinde Terzen-Sprünge ohne abgehackte Pausen.',
    progressionTip: 'Teste dieselbe Etüde im Progression-Tool über den "Funk Dorian Vamp (i9–IV13)" in D!',
    previewNotes: [62, 65, 64, 67, 65, 69, 67, 71],
    alphaTex: `\\title "Modern Rock-Fusion Dorian Thirds & Climbs (D Dorian)"
\\tempo 100
.
\\track "Fusion Lead"
\\staff {score tabs}
\\instrument 29
:16 10.6 13.6 12.6 10.5 13.6 12.5 10.5 14.5 12.5 10.4 14.5 12.4 10.4 14.4 12.4 10.3 |
14.4 12.3 10.3 14.3 12.3 10.2 14.3 12.2 10.2 13.2 12.2 10.1 13.2 12.1 10.1 13.1 |
13.1 10.1 12.1 13.2 10.1 12.2 13.2 10.2 12.2 14.3 10.2 12.3 14.3 10.3 12.3 14.4 |
10.3 12.4 14.4 10.4 12.4 14.5 10.4 12.5 14.5 10.5 12.5 13.6 10.5 12.6 10.6.8 |
10.3{sl} 12.3 10.2{h} 12.2{h} 13.2 10.1{h} 12.1{h} 13.1 12.1{h} 10.1 13.2{h} 12.2 10.2 12.3 10.3 12.4 |
12.3{sl} 14.3 12.2{h} 13.2{h} 15.2 12.1{h} 13.1{h} 15.1 13.1{h} 12.1 15.2{h} 13.2 12.2 14.3 12.3 14.4 |
12.1 15.1 13.1 17.1 15.1 19.1 17.1 15.1 13.1 15.1 12.1 13.1 10.1 12.1 13.2 12.2 |
10.2{h} 12.2 13.2 10.1 12.1 13.1 15.1{sl} 17.1 15.1 13.1 12.1 10.1 10.1.4{v}`,
  },
];
