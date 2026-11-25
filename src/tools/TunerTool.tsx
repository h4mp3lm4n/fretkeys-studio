import React, { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Radio, SlidersHorizontal } from 'lucide-react';
import {
  GUITAR_TUNINGS,
  getNoteNamesArray,
  freqToMidi,
  midiToFreq,
  midiToNoteName,
} from '../theory/musicTheory';
import { audioEngine, detectPitch } from '../audio/audioEngine';

export const TunerTool: React.FC = () => {
  const [tuningIdx, setTuningIdx] = useState(0);
  const [a4Ref, setA4Ref] = useState(440);
  const [pipeOctave, setPipeOctave] = useState(4);
  const [activePipes, setActivePipes] = useState<number[]>([]);
  const [micActive, setMicActive] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);

  const [detectedFreq, setDetectedFreq] = useState<number | null>(null);
  const [detectedMidi, setDetectedMidi] = useState<number | null>(null);
  const [cents, setCents] = useState<number>(0);
  const [clarity, setClarity] = useState<number>(0);
  const [inputLevel, setInputLevel] = useState<number>(0);

  const streamRef = useRef<MediaStream | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef<number | null>(null);
  const smoothFreqRef = useRef<number[]>([]);

  const tuning = GUITAR_TUNINGS[tuningIdx];

  useEffect(() => {
    return () => {
      stopMic();
      audioEngine.stopAllPitchPipes();
    };
  }, []);

  const startMic = async () => {
    setMicError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      });
      const ctx = audioEngine.getContext();
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 4096;
      analyser.smoothingTimeConstant = 0.2;
      source.connect(analyser);

      streamRef.current = stream;
      analyserRef.current = analyser;
      smoothFreqRef.current = [];
      setMicActive(true);

      const buffer = new Float32Array(analyser.fftSize);
      const loop = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getFloatTimeDomainData(buffer);

        // Input level meter
        let sumSq = 0;
        for (let i = 0; i < buffer.length; i++) sumSq += buffer[i] * buffer[i];
        const rms = Math.sqrt(sumSq / buffer.length);
        setInputLevel(Math.min(1, rms * 6));

        const res = detectPitch(buffer, ctx.sampleRate);
        if (res && res.clarity > 0.72) {
          smoothFreqRef.current.push(res.freq);
          if (smoothFreqRef.current.length > 5) smoothFreqRef.current.shift();
          const sorted = [...smoothFreqRef.current].sort((a, b) => a - b);
          const medianFreq = sorted[Math.floor(sorted.length / 2)];

          const exactMidi = freqToMidi(medianFreq, a4Ref);
          const nearestMidi = Math.round(exactMidi);
          const centOffset = Math.round((exactMidi - nearestMidi) * 100);

          setDetectedFreq(medianFreq);
          setDetectedMidi(nearestMidi);
          setCents(Math.max(-50, Math.min(50, centOffset)));
          setClarity(res.clarity);
        } else {
          if (rms < 0.008) {
            smoothFreqRef.current = [];
          }
        }
        rafRef.current = requestAnimationFrame(loop);
      };
      rafRef.current = requestAnimationFrame(loop);
    } catch (err) {
      setMicError(
        err instanceof Error
          ? `Mikrofon/Line-In nicht verfügbar: ${err.message}`
          : 'Mikrofonzugriff wurde abgelehnt oder kein Gerät gefunden.'
      );
      setMicActive(false);
    }
  };

  const stopMic = () => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    analyserRef.current = null;
    setMicActive(false);
    setInputLevel(0);
  };

  const togglePipe = (midi: number) => {
    const isNowOn = audioEngine.togglePitchPipeTone(midi, a4Ref);
    setActivePipes(prev => (isNowOn ? [...prev.filter(m => m !== midi), midi] : prev.filter(m => m !== midi)));
  };

  const stopAllPipes = () => {
    audioEngine.stopAllPitchPipes();
    setActivePipes([]);
  };

  const inTune = detectedMidi !== null && Math.abs(cents) <= 4;
  const closeTune = detectedMidi !== null && Math.abs(cents) <= 12;
  const needleAngle = (cents / 50) * 65; // degrees (-65 to +65)

  // Find closest string in current tuning
  const closestStringIdx =
    detectedMidi !== null
      ? tuning.midiNotes.reduce(
          (bestIdx, m, idx) =>
            Math.abs(m - detectedMidi) < Math.abs(tuning.midiNotes[bestIdx] - detectedMidi) ? idx : bestIdx,
          0
        )
      : -1;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Radio className="w-6 h-6 text-emerald-400" />
            Stimmgerät &amp; Stimmpfeife
          </h2>
          <p className="text-sm text-slate-400">
            Echtzeit-Frequenzerkennung über Mikrofon / Audio-Interface (Line-In) + Referenz-Stimmpfeife.
          </p>
        </div>

        <div className="flex items-center gap-2.5 text-xs">
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2">
            <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-slate-400">Kammerton A4:</span>
            {[432, 440, 442].map(hz => (
              <button
                key={hz}
                onClick={() => setA4Ref(hz)}
                className={`px-2 py-0.5 rounded font-bold cursor-pointer ${
                  a4Ref === hz ? 'bg-amber-500 text-slate-950' : 'text-slate-300 hover:text-white'
                }`}
              >
                {hz} Hz
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* LIVE CHROMATIC MICROPHONE / LINE-IN TUNER */}
        <div className="studio-card rounded-2xl p-5 flex flex-col justify-between space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Chromatischer Live-Tuner</h3>
              <p className="text-xs text-slate-400">YIN-Autokorrelation • optimiert für Gitarre, Bass &amp; Klavier</p>
            </div>
            <button
              onClick={micActive ? stopMic : startMic}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                micActive
                  ? 'bg-rose-500 hover:bg-rose-400 text-white shadow-lg shadow-rose-500/20'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20'
              }`}
            >
              {micActive ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              {micActive ? 'Mikro stoppen' : 'Mikro / Line-In aktivieren'}
            </button>
          </div>

          {micError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300">
              {micError}
            </div>
          )}

          {/* Radial Tuner Gauge */}
          <div className="flex flex-col items-center py-2">
            <svg viewBox="0 0 320 175" className="w-full max-w-[330px]">
              {/* Gauge arc background */}
              <path
                d="M 35 155 A 125 125 0 0 1 285 155"
                fill="none"
                stroke="#1e293b"
                strokeWidth={14}
                strokeLinecap="round"
              />
              {/* Green sweet spot */}
              <path
                d="M 148 31 A 125 125 0 0 1 172 31"
                fill="none"
                stroke="#10b981"
                strokeWidth={14}
                strokeLinecap="round"
                opacity={0.75}
              />

              {/* Tick marks */}
              {[-50, -25, 0, 25, 50].map(val => {
                const rad = (((val / 50) * 65 - 90) * Math.PI) / 180;
                const x1 = 160 + Math.cos(rad) * 110;
                const y1 = 155 + Math.sin(rad) * 110;
                const x2 = 160 + Math.cos(rad) * 134;
                const y2 = 155 + Math.sin(rad) * 134;
                return (
                  <g key={val}>
                    <line
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke={val === 0 ? '#10b981' : '#64748b'}
                      strokeWidth={val === 0 ? 3 : 1.5}
                    />
                  </g>
                );
              })}

              {/* Labels */}
              <text x="28" y="168" fill="#64748b" fontSize="11" fontWeight="700">♭ -50c</text>
              <text x="160" y="18" fill="#10b981" fontSize="11" fontWeight="700" textAnchor="middle">0c</text>
              <text x="292" y="168" fill="#64748b" fontSize="11" fontWeight="700" textAnchor="end">+50c ♯</text>

              {/* Needle */}
              <g transform={`rotate(${detectedMidi !== null ? needleAngle : 0} 160 155)`}>
                <line
                  x1={160}
                  y1={155}
                  x2={160}
                  y2={42}
                  stroke={inTune ? '#10b981' : closeTune ? '#f59e0b' : detectedMidi !== null ? '#f43f5e' : '#475569'}
                  strokeWidth={4}
                  strokeLinecap="round"
                />
                <circle cx={160} cy={155} r={8} fill="#e2e8f0" />
              </g>
            </svg>

            {/* Big Note Readout */}
            <div className="text-center -mt-3">
              <div
                className={`text-5xl font-black tracking-tight transition-colors ${
                  inTune
                    ? 'text-emerald-400'
                    : closeTune
                      ? 'text-amber-300'
                      : detectedMidi !== null
                        ? 'text-white'
                        : 'text-slate-600'
                }`}
              >
                {detectedMidi !== null ? midiToNoteName(detectedMidi) : '--'}
              </div>
              <div className="flex items-center justify-center gap-4 mt-2 text-xs font-mono text-slate-400">
                <span>{detectedFreq ? `${detectedFreq.toFixed(1)} Hz` : '0.0 Hz'}</span>
                <span
                  className={`font-bold ${
                    inTune ? 'text-emerald-400' : cents > 0 ? 'text-rose-400' : cents < 0 ? 'text-cyan-400' : 'text-slate-400'
                  }`}
                >
                  {detectedMidi !== null ? `${cents > 0 ? '+' : ''}${cents} Cent` : 'Bereit'}
                </span>
                {detectedMidi !== null && (
                  <span>
                    {inTune ? 'Perfekt gestimmt!' : cents < 0 ? '↑ Höher stimmen' : '↓ Tiefer stimmen'}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Input Level Bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>Eingangspegel {micActive ? '(Aktiv)' : '(Aus)'}</span>
              <span>Klarheit: {Math.round(clarity * 100)}%</span>
            </div>
            <div className="h-2 rounded-full bg-slate-900 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 via-amber-400 to-rose-500 transition-all duration-75"
                style={{ width: `${Math.round(inputLevel * 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* INTERACTIVE PITCH PIPE (STIMMPFEIFE) */}
        <div className="studio-card rounded-2xl p-5 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-bold text-white">Stimmpfeife (Referenztöne)</h3>
              <p className="text-xs text-slate-400">Klicke eine Saite oder Note für anhaltenden Referenzton</p>
            </div>
            {activePipes.length > 0 && (
              <button
                onClick={stopAllPipes}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 text-xs font-semibold cursor-pointer"
              >
                <VolumeX className="w-3.5 h-3.5" /> Alle stumm
              </button>
            )}
          </div>

          {/* Guitar Tuning Selector */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-slate-300">Gitarren-Stimmung</span>
              <select
                value={tuningIdx}
                onChange={e => {
                  stopAllPipes();
                  setTuningIdx(Number(e.target.value));
                }}
                className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200"
              >
                {GUITAR_TUNINGS.map((t, i) => (
                  <option key={t.id} value={i}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {tuning.midiNotes.map((midi, idx) => {
                const isOn = activePipes.includes(midi);
                const isDetectedTarget = micActive && closestStringIdx === idx;
                const freq = midiToFreq(midi, a4Ref);
                return (
                  <button
                    key={`${tuning.id}-${idx}`}
                    onClick={() => togglePipe(midi)}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                      isOn
                        ? 'bg-amber-500 border-amber-300 text-slate-950 shadow-lg shadow-amber-500/25'
                        : isDetectedTarget
                          ? 'bg-emerald-500/15 border-emerald-400 text-emerald-200'
                          : 'bg-slate-900/80 border-slate-800 text-slate-200 hover:border-slate-600'
                    }`}
                  >
                    <div className="text-[10px] opacity-70 font-semibold">Saite {tuning.midiNotes.length - idx}</div>
                    <div className="text-lg font-black mt-0.5">{tuning.labels[idx]}</div>
                    <div className="text-[10px] font-mono opacity-75">{freq.toFixed(1)} Hz</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Chromatic 12-Tone Pitch Pipe with Octave Control */}
          <div className="space-y-2.5 pt-2 border-t border-slate-800">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
              <span className="font-semibold text-slate-300">
                Chromatische Stimmpfeife (C{pipeOctave} – B{pipeOctave})
              </span>
              <div className="flex items-center gap-1">
                <span className="text-slate-400 mr-1">Oktave:</span>
                {[2, 3, 4, 5, 6].map(oct => (
                  <button
                    key={oct}
                    onClick={() => {
                      stopAllPipes();
                      setPipeOctave(oct);
                    }}
                    className={`w-7 h-7 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                      pipeOctave === oct
                        ? 'bg-cyan-500 text-slate-950'
                        : 'bg-slate-900 border border-slate-800 text-slate-300 hover:border-slate-600'
                    }`}
                  >
                    {oct}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5">
              {getNoteNamesArray(false).map((name, pc) => {
                const midi = (pipeOctave + 1) * 12 + pc;
                const isOn = activePipes.includes(midi);
                return (
                  <button
                    key={midi}
                    onClick={() => togglePipe(midi)}
                    className={`py-2 px-2 rounded-lg text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-1 ${
                      isOn
                        ? 'bg-cyan-500 border-cyan-300 text-slate-950'
                        : 'bg-slate-900/70 border-slate-800 text-slate-300 hover:border-slate-600'
                    }`}
                  >
                    {isOn && <Volume2 className="w-3 h-3" />}
                    {name}{pipeOctave}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
