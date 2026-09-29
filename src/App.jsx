import React, { useState, useEffect, useRef } from 'react';

const API_BASE = "https://titan-chorus-app.onrender.com/api";

const DEFAULT_FVA_TERMS = [
  { num: 1, term: "Anacrusis", definition: "upbeat or pickup", category: "Music Terms" },
  { num: 2, term: "Arpeggio", definition: "the notes of the chord played in succession to one another, rather than simultaneously; a broken chord", category: "Music Terms" },
  { num: 3, term: "Chromatic", definition: "motion by half steps; also describes harmony or melody that employs some of the sequential 12 pitches in an octave", category: "Music Terms" },
  { num: 4, term: "Descant", definition: "a high obligato part above the melody", category: "Music Terms" },
  { num: 5, term: "Divisi", definition: "performers singing the same part are divided to sing different parts.", category: "Music Terms" },
  { num: 6, term: "Falsetto", definition: "type of vocal phonation that enables the singer to sing notes beyond the normal vocal range.", category: "Music Terms" },
  { num: 7, term: "Fermata", definition: "a pause or hold", category: "Music Terms" },
  { num: 8, term: "Improvisation", definition: "music that is created spontaneously", category: "Music Terms" },
  { num: 9, term: "Interval", definition: "the relationship between two pitches, the distance between an upper and a lower pitch", category: "Music Terms" },
  { num: 10, term: "Ledger lines", definition: "short horizontal lines used to extend a staff either higher or lower", category: "Music Terms" },
  { num: 11, term: "Mezzo forte", definition: "medium loud", category: "Music Terms" },
  { num: 12, term: "Modulation", definition: "to change key within a composition", category: "Music Terms" },
  { num: 13, term: "Opera", definition: "a major vocal work that involves theatrical elements", category: "Music Terms" },
  { num: 14, term: "Oratorio", definition: "large scale musical composition on a sacred subject.", category: "Music Terms" },
  { num: 15, term: "Senza", definition: "without", category: "Music Terms" },
  { num: 16, term: "Solfege", definition: "a system used for teaching sight-reading (Do-Re-Mi)", category: "Music Terms" },
  { num: 17, term: "Tessitura", definition: "most widely used range of pitches in a piece of music", category: "Music Terms" },
  { num: 18, term: "Triad", definition: "three note chord consisting of the root, third, and fifth", category: "Music Terms" },
  { num: 19, term: "Vibrato", definition: "a rapid fluctuation of pitch slightly higher or lower than the main pitch", category: "Music Terms" },
  { num: 20, term: "Form", definition: "the organization and structure of a composition", category: "Form" },
  { num: 21, term: "Binary form", definition: "AB- form of a composition that has two distinct sections", category: "Form" },
  { num: 22, term: "Strophic", definition: "describes a song where the stanzas are all sung to the same music", category: "Form" },
  { num: 23, term: "Part song", definition: "an unaccompanied homophonic choral composition for three or more voices", category: "Form" },
  { num: 24, term: "D. C. or Da Capo", definition: "repeat from the beginning of the composition", category: "Form" },
  { num: 25, term: "Bel canto", definition: "“beautiful singing”; an Italian Opera term", category: "Style and Phrasing" },
  { num: 26, term: "Cantabile", definition: "in a singing style; singable", category: "Style and Phrasing" },
  { num: 27, term: "Dolce", definition: "sweetly, usually also softly", category: "Style and Phrasing" },
  { num: 28, term: "Espressivo", definition: "to play or sing with expression", category: "Style and Phrasing" },
  { num: 29, term: "Legato", definition: "to play or sing in a smooth, connected manner", category: "Style and Phrasing" },
  { num: 30, term: "Meno mosso", definition: "less motion", category: "Style and Phrasing" },
  { num: 31, term: "Motif", definition: "a short musical idea or melodic theme, usually shorter than a musical phrase", category: "Style and Phrasing" },
  { num: 32, term: "Niente", definition: "dying away to nothing", category: "Style and Phrasing" },
  { num: 33, term: "Poco piu mosso", definition: "a little more motion", category: "Style and Phrasing" },
  { num: 34, term: "Sforzando", definition: "strongly accented; forced", category: "Style and Phrasing" },
  { num: 35, term: "Sotto voce", definition: "Softly; with subdued sound; performed in an undertone", category: "Style and Phrasing" },
  { num: 36, term: "Subito", definition: "suddenly; quickly", category: "Style and Phrasing" },
  { num: 37, term: "A tempo", definition: "return to the original tempo after some deviation", category: "Tempo and Meter" },
  { num: 38, term: "Accelerando", definition: "becoming gradually faster", category: "Tempo and Meter" },
  { num: 39, term: "Allargando", definition: "slowing of tempo, usually with increasing volume; most frequently occurs toward the end of a piece", category: "Tempo and Meter" },
  { num: 40, term: "Allegro con spirito", definition: "fast tempo with spirit", category: "Tempo and Meter" },
  { num: 41, term: "Andante", definition: "rather slow, at a moderate walking speed", category: "Tempo and Meter" },
  { num: 42, term: "Grandioso", definition: "grand, majestic", category: "Tempo and Meter" },
  { num: 43, term: "Largo", definition: "very slow and broad", category: "Tempo and Meter" },
  { num: 44, term: "L’istesso", definition: "the beat remains constant when the meter changes", category: "Tempo and Meter" },
  { num: 45, term: "Meter", definition: "indicated by a time signature, can be simple or compound", category: "Tempo and Meter" },
  { num: 46, term: "Presto", definition: "very fast; faster than allegro", category: "Tempo and Meter" },
  { num: 47, term: "Rallentando", definition: "gradually slowing down", category: "Tempo and Meter" },
  { num: 48, term: "Rubato", definition: "Making the established pulse flexible by accelerating and slowing down the tempo; an expressive device", category: "Tempo and Meter" },
  { num: 49, term: "Tranquillo", definition: "to perform in a relaxed tempo", category: "Tempo and Meter" },
  { num: 50, term: "Vivace", definition: "lively; briskly", category: "Tempo and Meter" }
];

const NOTE_FREQS = {
  'C3': 130.81, 'D3': 146.83, 'E3': 164.81, 'F3': 174.61, 'G3': 196.00, 'A3': 220.00, 'B3': 246.94,
  'C4': 261.63, 'D4': 293.66, 'E4': 329.63, 'F4': 349.23, 'G4': 392.00, 'A4': 440.00, 'B4': 493.88, 'C5': 523.25
};

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  // Director View Switcher
  const [viewAsStudentMode, setViewAsStudentMode] = useState(false);

  // Audio Instrument Selector & Octave State
  const [audioInstrument, setAudioInstrument] = useState('pitch_pipe');
  const [octaveOffset, setOctaveOffset] = useState(0);
  const [activePitch, setActivePitch] = useState(null);

  // Metronome State
  const [bpm, setBpm] = useState(100);
  const [isPlayingMetronome, setIsPlayingMetronome] = useState(false);
  const audioCtxRef = useRef(null);
  const metronomeTimerRef = useRef(null);

  // Roster & Riser State
  const [students, setStudents] = useState([]);
  const [ensembles, setEnsembles] = useState([]);
  const [filterEnsemble, setFilterEnsemble] = useState('All');
  const [editingStudent, setEditingStudent] = useState(null);
  const [overflowEnabled, setOverflowEnabled] = useState(false);

  // FVA Practice Hub State
  const [fvaTerms, setFvaTerms] = useState(DEFAULT_FVA_TERMS);
  const [fvaDisplayMode, setFvaDisplayMode] = useState('category');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [termIndex, setTermIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  // EAR TRAINING HUB STATE
  const [earModule, setEarModule] = useState('intervals');
  const [earMode, setEarMode] = useState('practice');
  const [earQuestion, setEarQuestion] = useState(null);
  const [earFeedback, setEarFeedback] = useState('');
  const [earScore, setEarScore] = useState({ correct: 0, total: 0 });

  // SIGHT SINGING ENGINE STATE
  const [sightLevel, setSightLevel] = useState(1);
  const [sightClef, setSightClef] = useState('treble');
  const [studyWindow, setStudyWindow] = useState(20);
  const [sightMelody, setSightMelody] = useState([]);
  const [currentNoteIdx, setCurrentNoteIdx] = useState(0);
  const [statusText, setStatusText] = useState('Ready');
  const [detectedPitchHz, setDetectedPitchHz] = useState(0);
  const [centsDev, setCentsDev] = useState(0);
  const [isPitchCorrect, setIsPitchCorrect] = useState(null);
  const [finalSightScore, setFinalSightScore] = useState(null);
  const [isAssessingSight, setIsAssessingSight] = useState(false);

  // Uniform Tracking State
  const [studentUniforms, setStudentUniforms] = useState({
    uniform_tshirt: false,
    uniform_tshirt_size: 'M',
    uniform_polo: false,
    uniform_polo_size: 'M',
    uniform_dress: false,
    uniform_jacket: false,
    uniform_silver_tie: false,
    uniform_teal_tie: false,
    uniform_red_tie: false,
    uniform_white_tie: false,
    uniform_backpack: false,
    uniform_other: '',
    uniform_other_checked: false
  });

  const sizes = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'];
  const baseRisers = ['Riser A', 'Riser B', 'Riser C', 'Riser D', 'Riser E', 'Riser F'];
  const activeRisers = overflowEnabled ? [...baseRisers, 'Riser G'] : baseRisers;
  const activeRows = overflowEnabled ? ['Row 4', 'Row 3', 'Row 2', 'Row 1', 'Ground'] : ['Row 4', 'Row 3', 'Row 2', 'Row 1'];
  const slots = ['Far Left', 'Center Left', 'Center Right', 'Far Right'];

  const pitchPipePitches = [
    { note: 'C', label: 'C', freq: 261.63 },
    { note: 'C#', label: 'C#/Db', freq: 277.18 },
    { note: 'D', label: 'D', freq: 293.66 },
    { note: 'D#', label: 'D#/Eb', freq: 311.13 },
    { note: 'E', label: 'E', freq: 329.63 },
    { note: 'F', label: 'F', freq: 349.23 },
    { note: 'F#', label: 'F#/Gb', freq: 369.99 },
    { note: 'G', label: 'G', freq: 392.00 },
    { note: 'G#', label: 'G#/Ab', freq: 415.30 },
    { note: 'A', label: 'A', freq: 440.00 },
    { note: 'A#', label: 'A#/Bb', freq: 466.16 },
    { note: 'B', label: 'B', freq: 493.88 }
  ];

  const whiteKeys = [
    { note: 'B3', label: 'B3', freq: 246.94 },
    { note: 'C4', label: 'C4', freq: 261.63 },
    { note: 'D4', label: 'D4', freq: 293.66 },
    { note: 'E4', label: 'E4', freq: 329.63 },
    { note: 'F4', label: 'F4', freq: 349.23 },
    { note: 'G4', label: 'G4', freq: 392.00 },
    { note: 'A4', label: 'A4', freq: 440.00 },
    { note: 'B4', label: 'B4', freq: 493.88 },
    { note: 'C5', label: 'C5', freq: 523.25 }
  ];

  const blackKeys = [
    { note: 'C#4', label: 'C#/Db', freq: 277.18, leftPos: '14.5%' },
    { note: 'D#4', label: 'D#/Eb', freq: 311.13, leftPos: '26.5%' },
    { note: 'F#4', label: 'F#/Gb', freq: 369.99, leftPos: '50.5%' },
    { note: 'G#4', label: 'G#/Ab', freq: 415.30, leftPos: '62.5%' },
    { note: 'A#4', label: 'A#/Bb', freq: 466.16, leftPos: '74.5%' }
  ];

  useEffect(() => {
    if (currentUser) {
      fetchEnsembles();
      fetchStudents();
      fetchFvaTerms();
      generateSightMelody();
    }
  }, [currentUser, sightLevel, sightClef]);

  const getAudioContext = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  };

  const playFrequency = (baseFreq, noteName) => {
    try {
      const ctx = getAudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      const adjustedFreq = baseFreq * Math.pow(2, octaveOffset);

      osc.type = audioInstrument === 'piano' ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(adjustedFreq, ctx.currentTime);

      gain.gain.setValueAtTime(0.35, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.8);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 1.8);
      setActivePitch(noteName);

      setTimeout(() => setActivePitch(null), 1800);
    } catch (e) {
      console.error('Audio Synth Error:', e);
    }
  };

  const toggleMetronome = () => {
    if (isPlayingMetronome) {
      clearInterval(metronomeTimerRef.current);
      setIsPlayingMetronome(false);
    } else {
      setIsPlayingMetronome(true);
      const interval = (60 / bpm) * 1000;
      metronomeTimerRef.current = setInterval(() => {
        try {
          const ctx = getAudioContext();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'square';
          osc.frequency.setValueAtTime(800, ctx.currentTime);

          gain.gain.setValueAtTime(0.2, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start();
          osc.stop(ctx.currentTime + 0.05);
        } catch (e) {
          console.error('Metronome Error:', e);
        }
      }, interval);
    }
  };

  const fetchEnsembles = async () => {
    try {
      const res = await fetch(`${API_BASE}/ensembles`);
      if (res.ok) {
        const data = await res.json();
        setEnsembles(data);
      }
    } catch (e) {
      console.error('Error fetching ensembles:', e);
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await fetch(`${API_BASE}/students`);
      if (res.ok) {
        const data = await res.json();
        setStudents(data);
      }
    } catch (e) {
      console.error('Error fetching roster:', e);
    }
  };

  const fetchFvaTerms = async () => {
    try {
      const res = await fetch(`${API_BASE}/fva-terms`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) {
          setFvaTerms(data);
        }
      }
    } catch (e) {
      console.error('Error fetching FVA terms:', e);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      const res = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ student_id: loginId, password })
      });
      const data = await res.json();
      if (data.success) {
        setCurrentUser(data);
        setPassword('');
      } else {
        setErrorMsg(data.message || 'Login failed');
      }
    } catch (err) {
      setErrorMsg('Connection error. Is backend online?');
    }
  };

  // GENERATIVE SIGHT SINGING MELODY (8 MEASURES)
  const generateSightMelody = () => {
    setFinalSightScore(null);
    setCurrentNoteIdx(0);
    const scale = sightClef === 'treble'
      ? ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5']
      : ['C3', 'D3', 'E3', 'F3', 'G3', 'A3', 'B3', 'C4'];

    const solfeges = ['do', 're', 'mi', 'fa', 'sol', 'la', 'ti', 'do'];
    const melody = [];

    let lastIdx = 0; // Always start on Tonic
    melody.push({ note: scale[lastIdx], solfege: solfeges[lastIdx], freq: NOTE_FREQS[scale[lastIdx]] });

    for (let i = 1; i < 8; i++) {
      let step = 0;
      if (sightLevel === 1) step = Math.random() > 0.5 ? 1 : -1;
      else if (sightLevel === 2) step = Math.floor(Math.random() * 3) - 1;
      else if (sightLevel === 3) step = Math.floor(Math.random() * 3) - 1; // 6/8 meter
      else if (sightLevel === 4) step = Math.floor(Math.random() * 5) - 2;
      else step = Math.floor(Math.random() * 7) - 3;

      lastIdx = Math.max(0, Math.min(scale.length - 1, lastIdx + step));
      melody.push({ note: scale[lastIdx], solfege: solfeges[lastIdx], freq: NOTE_FREQS[scale[lastIdx]] });
    }

    setSightMelody(melody);
  };

  const playSightTonic = () => {
    if (sightMelody.length > 0) {
      playFrequency(sightMelody[0].freq, sightMelody[0].note);
    }
  };

  const startSightAssessment = async () => {
    setIsAssessingSight(true);
    playSightTonic();

    let countdown = studyWindow;
    setStatusText(`Study Window: ${countdown}s remaining`);

    const studyInterval = setInterval(() => {
      countdown--;
      if (countdown > 0) {
        setStatusText(`Study Window: ${countdown}s remaining`);
      } else {
        clearInterval(studyInterval);
        setStatusText('🎙 SING NOW! Performance Active...');
        beginMicPitchAssessor();
      }
    }, 1000);
  };

  const beginMicPitchAssessor = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const ctx = getAudioContext();
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 2048;
      source.connect(analyser);

      const buffer = new Float32Array(analyser.fftSize);
      let totalSamples = 0;
      let correctSamples = 0;
      let step = 0;

      const noteDuration = (studyWindow * 1000) / sightMelody.length;

      const stepTimer = setInterval(() => {
        step++;
        if (step < sightMelody.length) {
          setCurrentNoteIdx(step);
        }
      }, noteDuration);

      const sampleLoop = () => {
        analyser.getFloatTimeDomainData(buffer);
        const pitchHz = autoCorrelate(buffer, ctx.sampleRate);

        if (pitchHz > 0) {
          setDetectedPitchHz(pitchHz.toFixed(1));
          const target = sightMelody[step] || sightMelody[0];
          const noteNum = 12 * (Math.log(pitchHz / 440) / Math.log(2)) + 69;
          const targetNum = 12 * (Math.log(target.freq / 440) / Math.log(2)) + 69;
          const dev = Math.round((noteNum - targetNum) * 100);

          setCentsDev(dev);
          totalSamples++;

          if (Math.abs(dev) <= 50) {
            correctSamples++;
            setIsPitchCorrect(true);
          } else {
            setIsPitchCorrect(false);
          }
        } else {
          setIsPitchCorrect(null);
        }

        if (isAssessingSight) {
          requestAnimationFrame(sampleLoop);
        }
      };

      requestAnimationFrame(sampleLoop);

      setTimeout(() => {
        clearInterval(stepTimer);
        setIsAssessingSight(false);
        stream.getTracks().forEach(t => t.stop());
        setStatusText('✅ Assessment Complete!');

        const finalPct = totalSamples > 0 ? Math.round((correctSamples / totalSamples) * 100) : 0;
        setFinalSightScore(finalPct);
      }, studyWindow * 1000);

    } catch (e) {
      alert('Microphone access denied or unsupported.');
      setIsAssessingSight(false);
    }
  };

  const autoCorrelate = (buf, sampleRate) => {
    let SIZE = buf.length;
    let rms = 0;
    for (let i = 0; i < SIZE; i++) rms += buf[i] * buf[i];
    rms = Math.sqrt(rms / SIZE);
    if (rms < 0.01) return -1;

    let r1 = 0, r2 = SIZE - 1, thres = 0.2;
    for (let i = 0; i < SIZE / 2; i++) { if (Math.abs(buf[i]) < thres) { r1 = i; break; } }
    for (let i = 1; i < SIZE / 2; i++) { if (Math.abs(buf[SIZE - i]) < thres) { r2 = SIZE - i; break; } }

    buf = buf.slice(r1, r2);
    SIZE = buf.length;

    let c = new Array(SIZE).fill(0);
    for (let i = 0; i < SIZE; i++) {
      for (let j = 0; j < SIZE - i; j++) {
        c[i] = c[i] + buf[j] * buf[j + i];
      }
    }

    let d = 0;
    while (c[d] > c[d + 1]) d++;
    let maxval = -1, maxpos = -1;

    for (let i = d; i < SIZE; i++) {
      if (c[i] > maxval) { maxval = c[i]; maxpos = i; }
    }

    return sampleRate / maxpos;
  };

  // LOGIN SCREEN
  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100 p-4">
        <div className="bg-slate-900 border border-teal-800/60 p-8 rounded-xl shadow-2xl max-w-md w-full">
          <div className="text-center mb-6">
            <a href="https://www.instagram.com/olympiatitanchorus" target="_blank" rel="noreferrer" className="inline-block transform hover:scale-105 transition mb-3">
              <img
                src="/Olympia Titan Chorus 26 Logo - 3.PNG"
                alt="Olympia Titan Chorus Crest"
                className="w-28 h-28 mx-auto rounded-full border-2 border-teal-400 shadow-xl object-cover"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            </a>
            <h1 className="text-2xl font-bold text-teal-400">Olympia High School</h1>
            <h2 className="text-xl font-semibold text-slate-200">Titan Chorus Hub</h2>
            <p className="text-xs text-slate-400 mt-1">Director: Cesar Lengua-Miranda</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Student ID or Username</label>
              <input
                type="text"
                required
                placeholder="Enter Student ID"
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-teal-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Password</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-teal-400"
              />
            </div>

            {errorMsg && <p className="text-red-400 text-sm text-center">{errorMsg}</p>}

            <button
              type="submit"
              className="w-full bg-teal-600 hover:bg-teal-500 text-white font-bold py-2.5 rounded-lg transition shadow-md"
            >
              Sign In
            </button>
          </form>
        </div>
      </div>
    );
  }

  const isDirector = currentUser.role === 'director';

  // REHEARSAL AUDIO TOOLBAR WIDGET
  const renderAudioToolbar = () => (
    <div className="bg-slate-900 border border-teal-900/40 p-5 rounded-xl mb-6">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-4 border-b border-slate-800 pb-3">
        <div>
          <h3 className="text-sm font-bold text-teal-400 uppercase tracking-wider">🎹 Rehearsal Pitch & Metronome Tools</h3>
          <p className="text-xs text-slate-400">Toggle between Pitch Buttons and Visual Piano (B3-C5 with Enharmonics)</p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setAudioInstrument('pitch_pipe')}
            className={`px-3 py-1.5 rounded text-xs font-bold transition border ${
              audioInstrument === 'pitch_pipe'
                ? 'bg-teal-600 text-white border-teal-400'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
            }`}
          >
            🎵 Pitch Pipe
          </button>
          <button
            onClick={() => setAudioInstrument('piano')}
            className={`px-3 py-1.5 rounded text-xs font-bold transition border ${
              audioInstrument === 'piano'
                ? 'bg-teal-600 text-white border-teal-400'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
            }`}
          >
            🎹 Visual Keyboard (B3–C5)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-bold text-teal-300 uppercase mb-2">⏱ Metronome</h4>
            <div className="text-center my-2">
              <span className="text-3xl font-extrabold text-white font-mono">{bpm}</span>
              <span className="text-xs text-slate-400 block">BPM</span>
            </div>
            <input
              type="range"
              min="40"
              max="208"
              value={bpm}
              onChange={(e) => setBpm(Number(e.target.value))}
              className="w-full accent-teal-500 cursor-pointer"
            />
          </div>
          <button
            onClick={toggleMetronome}
            className={`w-full py-2 rounded font-bold text-xs transition mt-3 ${
              isPlayingMetronome ? 'bg-red-600 hover:bg-red-500 text-white' : 'bg-teal-600 hover:bg-teal-500 text-white'
            }`}
          >
            {isPlayingMetronome ? '⏹ Stop' : '▶ Start'}
          </button>
        </div>

        <div className="md:col-span-2 bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-xs font-bold text-teal-300 uppercase">
              {audioInstrument === 'pitch_pipe' ? '🎵 Chromatic Pitch Pipe' : '🎹 Visual Keyboard (B3–C5)'}
            </h4>

            <div className="flex items-center space-x-1">
              <span className="text-[10px] text-slate-400 uppercase mr-1">Octave Shift:</span>
              {[-2, -1, 0, 1, 2].map((off) => (
                <button
                  key={off}
                  onClick={() => setOctaveOffset(off)}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold transition border ${
                    octaveOffset === off
                      ? 'bg-amber-500 text-slate-950 border-white'
                      : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                  }`}
                >
                  {off === 0 ? 'Std' : off > 0 ? `+${off}` : off}
                </button>
              ))}
            </div>
          </div>

          {audioInstrument === 'pitch_pipe' ? (
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {pitchPipePitches.map((p) => (
                <button
                  key={p.note}
                  onClick={() => playFrequency(p.freq, p.note)}
                  className={`py-3 rounded font-mono font-bold text-xs transition border flex flex-col items-center justify-center ${
                    activePitch === p.note
                      ? 'bg-teal-500 text-slate-950 border-white scale-105 shadow-lg'
                      : 'bg-slate-900 text-slate-200 border-slate-800 hover:border-teal-400'
                  }`}
                >
                  <span>{p.note}</span>
                  <span className="text-[9px] text-teal-300 font-normal">{p.label}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto pb-2">
              <div className="relative min-w-[500px] h-36 bg-slate-900 p-2 rounded-lg border border-slate-800 select-none flex justify-center">
                <div className="flex w-full h-full relative">
                  {whiteKeys.map((wk) => (
                    <button
                      key={wk.note}
                      onClick={() => playFrequency(wk.freq, wk.note)}
                      className={`flex-1 h-full bg-slate-100 hover:bg-white text-slate-900 border border-slate-400 rounded-b flex flex-col justify-end items-center pb-2 transition shadow-inner ${
                        activePitch === wk.note ? '!bg-amber-400 ring-2 ring-amber-300' : ''
                      }`}
                    >
                      <span className="text-[10px] font-extrabold font-mono">{wk.label}</span>
                    </button>
                  ))}

                  {blackKeys.map((bk) => (
                    <button
                      key={bk.note}
                      onClick={() => playFrequency(bk.freq, bk.note)}
                      style={{ left: bk.leftPos }}
                      className={`absolute top-0 w-[10%] h-[60%] bg-slate-950 hover:bg-slate-800 text-teal-300 border border-slate-700 rounded-b flex flex-col justify-end items-center pb-1 transition z-20 shadow-2xl ${
                        activePitch === bk.note ? '!bg-amber-500 text-slate-950 ring-2 ring-amber-300' : ''
                      }`}
                    >
                      <span className="text-[8px] font-bold font-mono text-center leading-tight">{bk.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // SIGHT SINGING ENGINE TAB RENDERER
  const renderSightSingingEngine = () => (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="bg-slate-900 border border-teal-900/40 p-6 rounded-xl space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-800 pb-3 gap-3">
          <h3 className="text-lg font-bold text-teal-400">🎼 FVA All-State Sight-Singing Grader</h3>
          
          <div className="flex flex-wrap gap-2 text-xs">
            <select
              value={sightClef}
              onChange={(e) => setSightClef(e.target.value)}
              className="bg-slate-800 border border-slate-700 px-2 py-1 rounded text-white font-bold"
            >
              <option value="treble">🎼 Treble</option>
              <option value="bass">𝄢 Bass</option>
            </select>

            <select
              value={sightLevel}
              onChange={(e) => setSightLevel(Number(e.target.value))}
              className="bg-slate-800 border border-slate-700 px-2 py-1 rounded text-white font-bold"
            >
              <option value={1}>Level 1 (4/4 Meter)</option>
              <option value={2}>Level 2 (4/4 Meter)</option>
              <option value={3}>Level 3 (6/8 Meter)</option>
              <option value={4}>Level 4 (4/4 Meter)</option>
              <option value={5}>Level 5 (4/4 Meter)</option>
            </select>

            <select
              value={studyWindow}
              onChange={(e) => setStudyWindow(Number(e.target.value))}
              className="bg-slate-800 border border-slate-700 px-2 py-1 rounded text-white font-bold"
            >
              <option value={10}>10s Study</option>
              <option value={20}>20s Study</option>
              <option value={30}>30s Study</option>
            </select>
          </div>
        </div>

        {/* NOTATION CANVAS DISPLAY */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
          <div className="flex justify-between items-center text-xs font-mono">
            <span className="text-teal-300 font-bold">
              Meter: {sightLevel === 3 ? '6/8' : '4/4'} | Key: C Major | 8 Measures
            </span>
            <span className="text-amber-400 font-bold">{statusText}</span>
          </div>

          <div className="py-6 border-y border-slate-800 flex justify-around items-center min-h-[120px] overflow-x-auto">
            {sightMelody.map((n, idx) => (
              <div key={idx} className="flex flex-col items-center px-1">
                <span className={`text-2xl font-extrabold ${idx === currentNoteIdx && isAssessingSight ? 'text-amber-400 scale-125' : 'text-white'}`}>♩</span>
                <span className="text-[10px] font-mono font-bold text-teal-300">{n.solfege}</span>
                <span className="text-[9px] font-mono text-slate-500">{n.note}</span>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center bg-slate-900 p-3 rounded-lg border border-slate-800 text-xs">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${isPitchCorrect === true ? 'bg-emerald-500' : isPitchCorrect === false ? 'bg-rose-600' : 'bg-slate-700'}`}></div>
              <span className="text-white font-mono">Pitch: {detectedPitchHz ? `${detectedPitchHz} Hz` : '--'}</span>
            </div>

            <span className="text-slate-400 font-mono">Dev: {centsDev > 0 ? `+${centsDev}` : centsDev} cents</span>
            <span className="text-teal-300 font-bold font-mono">Score: {finalSightScore !== null ? `${finalSightScore}%` : '--'}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={playSightTonic}
            className="bg-slate-800 hover:bg-slate-700 text-teal-300 font-bold py-3 px-4 rounded-xl text-xs transition border border-teal-900/60"
          >
            🔊 Play Tonic Pitch
          </button>

          <button
            onClick={generateSightMelody}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold py-3 px-4 rounded-xl text-xs transition border border-slate-700"
          >
            🎲 Generate New Example
          </button>

          <button
            onClick={startSightAssessment}
            disabled={isAssessingSight}
            className="bg-teal-600 hover:bg-teal-500 text-slate-950 font-black py-3 px-4 rounded-xl text-xs transition shadow-lg"
          >
            ⏱ Start Study & Recording Test
          </button>
        </div>
      </div>
    </div>
  );

  // DIRECTOR ADMIN DASHBOARD VIEW
  if (isDirector && !viewAsStudentMode) {
    const filteredRoster = filterEnsemble === 'All'
      ? students
      : students.filter(s => s.ensemble === filterEnsemble || s.additional_ensembles?.includes(filterEnsemble));

    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
        <header className="flex justify-between items-center border-b border-teal-900/60 pb-4 mb-6">
          <div className="flex items-center space-x-3">
            <a href="https://www.instagram.com/olympiatitanchorus" target="_blank" rel="noreferrer" className="group">
              <img
                src="/Olympia Titan Chorus 26 Logo - 3.PNG"
                alt="Olympia Titan Chorus Logo"
                className="w-12 h-12 rounded-full border-2 border-teal-400 shadow-md transform group-hover:scale-105 transition object-cover"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            </a>
            <div>
              <h1 className="text-2xl font-bold text-teal-400">Titan Chorus Admin Portal</h1>
              <p className="text-xs text-slate-400">Director: {currentUser.name}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setViewAsStudentMode(true)}
              className="bg-teal-950 border border-teal-400 hover:bg-teal-900 text-teal-300 text-xs font-bold px-3.5 py-2 rounded-lg transition flex items-center space-x-1.5 shadow-md"
            >
              <span>👁 Preview Student View</span>
            </button>
            <button
              onClick={() => setCurrentUser(null)}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm px-4 py-2 rounded-lg"
            >
              Sign Out
            </button>
          </div>
        </header>

        {renderAudioToolbar()}

        {/* DIRECTOR'S VIEW CHORAL RISER MAP */}
        <section className="bg-slate-900 border border-teal-900/40 p-6 rounded-xl mb-6">
          <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
            <div>
              <h2 className="text-lg font-bold text-teal-400">🎶 Director's View Choral Riser Chart</h2>
              <p className="text-xs text-slate-400">Conductor Podium at Stage Front (Bottom). Displays singer voice part and height in inches.</p>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => setOverflowEnabled(!overflowEnabled)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition border ${
                  overflowEnabled
                    ? 'bg-teal-500 text-slate-950 border-teal-300'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-teal-400'
                }`}
              >
                {overflowEnabled ? '✓ Overflow Mode Active (Riser G + Ground)' : '+ Enable Overflow Mode'}
              </button>

              <select
                value={filterEnsemble}
                onChange={(e) => setFilterEnsemble(e.target.value)}
                className="bg-slate-800 border border-slate-700 px-3 py-1.5 rounded text-sm text-slate-200"
              >
                <option value="All">All Ensembles</option>
                {ensembles.map(e => <option key={e} value={e}>{e}</option>)}
              </select>
            </div>
          </div>

          <div className="bg-slate-950/90 border border-slate-800 p-4 rounded-xl overflow-x-auto">
            <div className="min-w-[1000px] space-y-3">
              {activeRows.map((rowName) => (
                <div key={rowName} className="flex items-center space-x-2">
                  <div className="w-32 text-right pr-3">
                    <span className="text-[11px] font-bold uppercase text-slate-400">{rowName}</span>
                  </div>

                  <div className={`grid gap-2 flex-1 ${overflowEnabled ? 'grid-cols-7' : 'grid-cols-6'}`}>
                    {activeRisers.map((secName) => {
                      const isGround = rowName === 'Ground';

                      return (
                        <div
                          key={secName}
                          className={`p-2 rounded border transition min-h-[75px] flex flex-col justify-between ${
                            isGround
                              ? 'bg-teal-950/20 border-dashed border-teal-500/40 hover:bg-teal-900/30'
                              : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <span className="text-[9px] uppercase text-slate-500 font-mono text-center">{secName}</span>

                          <div className="grid grid-cols-4 gap-1 mt-1">
                            {slots.map((slotName) => {
                              const singer = filteredRoster.find(
                                s => (s.wenger_section || 'Riser A') === secName &&
                                     (s.wenger_row || 'Row 1') === rowName &&
                                     (s.wenger_slot || 'Far Left') === slotName
                              );

                              return (
                                <div
                                  key={slotName}
                                  className={`p-1 rounded text-center border min-h-[42px] flex flex-col justify-center ${
                                    singer
                                      ? 'bg-slate-800 border-slate-700 hover:border-teal-400 cursor-pointer'
                                      : 'bg-slate-950/40 border-slate-800/60'
                                  }`}
                                  onClick={() => singer && setEditingStudent(singer)}
                                >
                                  {singer ? (
                                    <>
                                      <p className="text-[10px] font-bold text-white leading-tight">{singer.first_name} {singer.last_name[0]}.</p>
                                      <p className="text-[8px] text-teal-400 font-mono">{singer.voice_part}</p>
                                      <p className="text-[7px] text-amber-300 font-bold">{singer.height_inches || 65}"</p>
                                    </>
                                  ) : (
                                    <span className="text-[8px] text-slate-700">•</span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-6 pt-3 border-t border-slate-800/80">
              <span className="text-xs uppercase tracking-widest text-teal-400 font-bold">
                ▼ STAGE FRONT — CONDUCTOR PODIUM (DIRECTOR'S VIEW) ▼
              </span>
            </div>
          </div>
        </section>

        {/* ROSTER TABLE */}
        <section className="bg-slate-900 border border-teal-900/40 p-5 rounded-xl">
          <h2 className="text-lg font-semibold text-slate-200 mb-4">Active Roster ({filteredRoster.length})</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase">
                  <th className="py-2.5 px-3">Student ID</th>
                  <th className="py-2.5 px-3">Name</th>
                  <th className="py-2.5 px-3">Primary Ensemble</th>
                  <th className="py-2.5 px-3">Voice Part</th>
                  <th className="py-2.5 px-3">Height</th>
                  <th className="py-2.5 px-3">Spot Location</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {filteredRoster.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-800/50">
                    <td className="py-2.5 px-3 font-mono text-teal-400">{s.student_id}</td>
                    <td className="py-2.5 px-3 font-medium text-white">{s.first_name} {s.last_name}</td>
                    <td className="py-2.5 px-3">{s.ensemble}</td>
                    <td className="py-2.5 px-3">{s.voice_part}</td>
                    <td className="py-2.5 px-3 font-bold text-amber-300">{s.height_inches || 65}"</td>
                    <td className="py-2.5 px-3 font-semibold text-teal-300">
                      {s.wenger_section || 'Riser A'} — {s.wenger_row || 'Row 1'} ({s.wenger_slot || 'Far Left'})
                    </td>
                    <td className="py-2.5 px-3 text-right space-x-2">
                      <button
                        onClick={() => setEditingStudent(s)}
                        className="text-slate-300 hover:text-white text-xs px-2.5 py-1 rounded bg-slate-800 border border-slate-700"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    );
  }

  // STUDENT VIEW
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
      {isDirector && viewAsStudentMode && (
        <div className="bg-teal-900/90 border border-teal-400 text-white px-4 py-2 rounded-xl mb-4 flex justify-between items-center text-xs font-bold">
          <span>👁 PREVIEW MODE: Viewing app as a Student</span>
          <button
            onClick={() => setViewAsStudentMode(false)}
            className="bg-teal-500 hover:bg-teal-400 text-slate-950 px-3 py-1 rounded font-black"
          >
            ← Return to Director Portal
          </button>
        </div>
      )}

      <header className="flex justify-between items-center border-b border-teal-900/60 pb-4 mb-6">
        <div className="flex items-center space-x-3">
          <a href="https://www.instagram.com/olympiatitanchorus" target="_blank" rel="noreferrer" className="group">
            <img
              src="/Olympia Titan Chorus 26 Logo - 3.PNG"
              alt="Olympia Titan Chorus Logo"
              className="w-12 h-12 rounded-full border-2 border-teal-400 shadow-md transform group-hover:scale-105 transition object-cover"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          </a>
          <div>
            <h1 className="text-2xl font-bold text-teal-400">Titan Chorus Student Hub</h1>
            <p className="text-xs text-slate-400">Welcome, {currentUser.name}</p>
          </div>
        </div>

        <button
          onClick={() => setCurrentUser(null)}
          className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm px-4 py-2 rounded-lg"
        >
          Sign Out
        </button>
      </header>

      {renderAudioToolbar()}

      {/* NAVIGATION TABS */}
      <div className="flex flex-wrap gap-2 border-b border-teal-900/60 pb-3 mb-6">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${
            activeTab === 'overview' ? 'bg-teal-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-slate-200'
          }`}
        >
          My Profile
        </button>
        <button
          onClick={() => setActiveTab('uniform')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${
            activeTab === 'uniform' ? 'bg-teal-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-slate-200'
          }`}
        >
          👔 Uniform Checklist
        </button>
        <button
          onClick={() => setActiveTab('fva')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${
            activeTab === 'fva' ? 'bg-teal-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-slate-200'
          }`}
        >
          🎵 FVA Vocabulary
        </button>
        <button
          onClick={() => setActiveTab('sight')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${
            activeTab === 'sight' ? 'bg-teal-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-slate-200'
          }`}
        >
          🎼 Sight-Singing Hub
        </button>
      </div>

      {/* TAB CONTENT ROUTING */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-900 border border-teal-900/40 p-6 rounded-xl">
            <h3 className="text-xs uppercase font-bold text-slate-400 mb-2">My Primary Ensemble</h3>
            <p className="text-2xl font-bold text-teal-400">{currentUser.ensemble}</p>
          </div>

          <div className="bg-slate-900 border border-teal-900/40 p-6 rounded-xl">
            <h3 className="text-xs uppercase font-bold text-slate-400 mb-2">My Voice Part</h3>
            <p className="text-2xl font-bold text-slate-200">{currentUser.voice_part}</p>
          </div>
        </div>
      )}

      {activeTab === 'sight' && renderSightSingingEngine()}
    </div>
  );
}
