import React, { useState, useEffect, useRef } from 'react';

const API_BASE = "https://titan-chorus-app.onrender.com/api";

const INSPIRATIONAL_QUOTES = [
  { quote: "Music can change the world because it can change people.", author: "Bono" },
  { quote: "Where words fail, music speaks.", author: "Hans Christian Andersen" },
  { quote: "To sing is to pray twice.", author: "St. Augustine" },
  { quote: "Singing is the divine way to tell beautiful, poetic things to the heart.", author: "Pablo Casals" }
];

const WARMUP_BANK = [
  { title: "Staccato Arpeggio (1-3-5-3-1)", desc: "Sing 'Sing-ee-sing' on staccato 1-3-5-3-1 to activate diaphragmatic support and light placement." },
  { title: "Lip Trills / Buzzes (5-4-3-2-1)", desc: "Gentle descending lip trills to relax tension and align breath flow before belt work." },
  { title: "Vowels Alignment (Mee-May-Mah-Moh-Moo)", desc: "Sustain single pitch per vowel string keeping space open in the back of the pharynx." },
  { title: "Siren Glide (Octave + Octave)", desc: "Continuous vocal siren from lowest comfortable pitch to head voice peak on 'Ngoo'." }
];

const FVA_TERMS = [
  { term: "A Cappella", def: "Singing without instrumental accompaniment." },
  { term: "Andante", def: "At a walking pace; moderately slow tempo." },
  { term: "Subito", def: "Suddenly (e.g., subito piano - suddenly soft)." },
  { term: "Staccato", def: "Short, detached, separated articulation." },
  { term: "Legato", def: "Smooth and connected notes." },
  { term: "Crescendo", def: "Gradually growing louder." },
  { term: "Diminuendo", def: "Gradually getting softer." },
  { term: "Fermata", def: "Hold the note or rest longer than its written value." }
];

const INTERVAL_PROMPTS = [
  { notes: ["C4", "G4"], label: "Perfect 5th", options: ["Perfect 5th", "Major 3rd", "Minor 7th", "Perfect 4th"] },
  { notes: ["C4", "E4"], label: "Major 3rd", options: ["Major 3rd", "Perfect 5th", "Octave", "Minor 3rd"] },
  { notes: ["C4", "F4"], label: "Perfect 4th", options: ["Perfect 4th", "Perfect 5th", "Major 6th", "Major 2nd"] }
];

const CHORD_PROMPTS = [
  { notes: ["C4", "E4", "G4"], label: "Major Triad", options: ["Major Triad", "Minor Triad", "Diminished Triad", "Augmented Triad"] },
  { notes: ["C4", "D#4", "G4"], label: "Minor Triad", options: ["Major Triad", "Minor Triad", "Diminished Triad", "Augmented Triad"] },
  { notes: ["C4", "D#4", "F#4"], label: "Diminished Triad", options: ["Major Triad", "Minor Triad", "Diminished Triad", "Augmented Triad"] },
  { notes: ["C4", "E4", "G#4"], label: "Augmented Triad", options: ["Major Triad", "Minor Triad", "Diminished Triad", "Augmented Triad"] }
];

const SHEET_MUSIC_LIBRARY = [
  {
    folder: "🍂 Fall Concert Collection",
    songs: [
      { title: "Titan Anthem", pdfUrl: "#" },
      { title: "Autumn Leaves Harmony", pdfUrl: "#" }
    ]
  },
  {
    folder: "❄️ Holiday Festival Collection",
    songs: [
      { title: "Carol of the Bells", pdfUrl: "#" },
      { title: "Glow - Eric Whitacre", pdfUrl: "#" }
    ]
  },
  {
    folder: "🗺️ MPA Assessment List (State Standard)",
    songs: [
      { title: "Ave Verum Corpus", pdfUrl: "#" },
      { title: "Lacrymosa", pdfUrl: "#" }
    ]
  }
];

const RISER_SECTIONS = [
  { id: 'A', name: 'Riser A (Far Left)', color: 'bg-rose-950/60 border-rose-500/50 text-rose-300', rotation: '-rotate-6' },
  { id: 'B', name: 'Riser B (Left Center)', color: 'bg-amber-950/60 border-amber-500/50 text-amber-300', rotation: '-rotate-3' },
  { id: 'C', name: 'Riser C (Center Left)', color: 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300', rotation: 'rotate-0' },
  { id: 'D', name: 'Riser D (Center Right)', color: 'bg-teal-950/60 border-teal-500/50 text-teal-300', rotation: 'rotate-0' },
  { id: 'E', name: 'Riser E (Right Center)', color: 'bg-sky-950/60 border-sky-500/50 text-sky-300', rotation: 'rotate-3' },
  { id: 'F', name: 'Riser F (Far Right)', color: 'bg-indigo-950/60 border-indigo-500/50 text-indigo-300', rotation: 'rotate-6' },
  { id: 'G', name: 'Riser G (Overflow Rear)', color: 'bg-purple-950/60 border-purple-500/50 text-purple-300', rotation: 'rotate-0' },
  { id: 'FLOOR', name: 'Floor Level', color: 'bg-slate-900 border-slate-700 text-slate-300', rotation: 'rotate-0' }
];

const NOTE_FREQS = {
  "C2": 65.41, "C#2": 69.30, "D2": 73.42, "D#2": 77.78, "E2": 82.41, "F2": 87.31, "F#2": 92.50, "G2": 98.00, "G#2": 103.83, "A2": 110.00, "A#2": 116.54, "B2": 123.47,
  "C3": 130.81, "C#3": 138.59, "D3": 146.83, "D#3": 155.56, "E3": 164.81, "F3": 174.61, "F#3": 185.00, "G3": 196.00, "G#3": 207.65, "A3": 220.00, "A#3": 233.08, "B3": 246.94,
  "C4": 261.63, "C#4": 277.18, "D4": 293.66, "D#4": 311.13, "E4": 329.63, "F4": 349.23, "F#4": 369.99, "G4": 392.00, "G#4": 415.30, "A4": 440.00, "A#4": 466.16, "B4": 493.88,
  "C5": 523.25
};

const shuffleArray = (array) => {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [viewMode, setViewMode] = useState('director');
  const [directorTab, setDirectorTab] = useState('welcome');
  const [studentTab, setStudentTab] = useState('home');

  const [students, setStudents] = useState([]);
  const [budgetTransactions, setBudgetTransactions] = useState([]);
  const [startingBudget, setStartingBudget] = useState(0);
  const [newStartingBudget, setNewStartingBudget] = useState('');

  const [riserAssignments, setRiserAssignments] = useState({});
  const [riserDisplayView, setRiserDisplayView] = useState('full');
  const [selectedRiserSection, setSelectedRiserSection] = useState('A');

  const [fvaMode, setFvaMode] = useState('study');
  const [fvaCardIndex, setFvaCardIndex] = useState(0);
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [fvaScore, setFvaScore] = useState(0);
  const [fvaAttempts, setFvaAttempts] = useState(0);
  const [fvaCurrentQuestionIndex, setFvaCurrentQuestionIndex] = useState(0);
  const [fvaFeedback, setFvaFeedback] = useState('');

  const [earCategory, setEarCategory] = useState('chords');
  const [earScore, setEarScore] = useState(0);
  const [earAttempts, setEarAttempts] = useState(0);
  const [currentEarIndex, setCurrentEarIndex] = useState(0);
  const [shuffledEarOptions, setShuffledEarOptions] = useState([]);
  const [earFeedback, setEarFeedback] = useState('');

  const [bpm, setBpm] = useState(100);
  const [isMetronomePlaying, setIsMetronomePlaying] = useState(false);
  const [selectedOctave, setSelectedOctave] = useState(4);
  const [pitchViewMode, setPitchViewMode] = useState('wheel');
  const metronomeTimer = useRef(null);
  const audioCtxRef = useRef(null);

  const [transDate, setTransDate] = useState(new Date().toISOString().split('T')[0]);
  const [transCategory, setTransCategory] = useState('Dues');
  const [transDesc, setTransDesc] = useState('');
  const [transType, setTransType] = useState('income');
  const [transAmount, setTransAmount] = useState('');
  const [transStudentId, setTransStudentId] = useState('');

  const randomQuote = INSPIRATIONAL_QUOTES[0];

  useEffect(() => {
    if (currentUser) {
      fetchStudents();
      fetchBudget();
      fetchStartingBudget();
    }
  }, [currentUser]);

  useEffect(() => {
    const bank = earCategory === 'intervals' ? INTERVAL_PROMPTS : CHORD_PROMPTS;
    const currentPrompt = bank[currentEarIndex % bank.length];
    if (currentPrompt) {
      setShuffledEarOptions(shuffleArray(currentPrompt.options));
    }
  }, [currentEarIndex, earCategory]);

  useEffect(() => {
    if (isMetronomePlaying) {
      const intervalMs = (60 / bpm) * 1000;
      metronomeTimer.current = setInterval(() => {
        playTickSound();
      }, intervalMs);
    } else {
      clearInterval(metronomeTimer.current);
    }
    return () => clearInterval(metronomeTimer.current);
  }, [isMetronomePlaying, bpm]);

  const playTickSound = () => {
    if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    const ctx = audioCtxRef.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.frequency.setValueAtTime(800, ctx.currentTime);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  };

  const playPitchNote = (noteName) => {
    if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    const ctx = audioCtxRef.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    const freq = NOTE_FREQS[noteName] || 440;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(0.4, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 1.2);
  };

  const playEarPrompt = () => {
    if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    const ctx = audioCtxRef.current;

    const bank = earCategory === 'intervals' ? INTERVAL_PROMPTS : CHORD_PROMPTS;
    const prompt = bank[currentEarIndex % bank.length];
    const notes = prompt.notes;

    let delay = 0;
    notes.forEach((n) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const freq = NOTE_FREQS[n] || 261.63;

      osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);
      gain.gain.setValueAtTime(0.3, ctx.currentTime + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.5);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + delay);
      osc.stop(ctx.currentTime + delay + 0.5);

      delay += 0.55;
    });

    const harmonicStart = delay + 0.2;
    const gainH = ctx.createGain();
    gainH.gain.setValueAtTime(0.25, ctx.currentTime + harmonicStart);
    gainH.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + harmonicStart + 1.5);
    gainH.connect(ctx.destination);

    notes.forEach((n) => {
      const osc = ctx.createOscillator();
      const freq = NOTE_FREQS[n] || 261.63;
      osc.frequency.setValueAtTime(freq, ctx.currentTime + harmonicStart);
      osc.connect(gainH);
      osc.start(ctx.currentTime + harmonicStart);
      osc.stop(ctx.currentTime + harmonicStart + 1.5);
    });
  };

  const handleEarAnswer = (chosenOption) => {
    const bank = earCategory === 'intervals' ? INTERVAL_PROMPTS : CHORD_PROMPTS;
    const currentPrompt = bank[currentEarIndex % bank.length];
    const isCorrect = chosenOption === currentPrompt.label;

    const newScore = isCorrect ? earScore + 1 : earScore;
    const newAttempts = earAttempts + 1;

    setEarScore(newScore);
    setEarAttempts(newAttempts);

    if (isCorrect) {
      setEarFeedback('✅ Correct! Excellent ear accuracy.');
    } else {
      setEarFeedback(`❌ Incorrect. The right answer was "${currentPrompt.label}".`);
    }

    setTimeout(() => {
      const nextIndex = Math.floor(Math.random() * bank.length);
      setCurrentEarIndex(nextIndex);
      setEarFeedback('');
    }, 1500);
  };

  const handleFvaQuizAnswer = (targetIndex) => {
    const isCorrect = targetIndex === fvaCurrentQuestionIndex;
    const newScore = isCorrect ? fvaScore + 1 : fvaScore;
    const newAttempts = fvaAttempts + 1;

    setFvaScore(newScore);
    setFvaAttempts(newAttempts);

    if (isCorrect) {
      setFvaFeedback('✅ Correct!');
    } else {
      setFvaFeedback(`❌ Incorrect. Definition: "${FVA_TERMS[fvaCurrentQuestionIndex].def}"`);
    }

    setTimeout(() => {
      const nextQ = Math.floor(Math.random() * FVA_TERMS.length);
      setFvaCurrentQuestionIndex(nextQ);
      setFvaFeedback('');
    }, 1500);
  };

  const fetchStudents = async () => {
    try {
      const res = await fetch(`${API_BASE}/students`);
      if (res.ok) setStudents(await res.json());
    } catch (e) { console.error(e); }
  };

  const fetchBudget = async () => {
    try {
      const res = await fetch(`${API_BASE}/budget`);
      if (res.ok) setBudgetTransactions(await res.json());
    } catch (e) { console.error(e); }
  };

  const fetchStartingBudget = async () => {
    try {
      const res = await fetch(`${API_BASE}/budget/starting`);
      if (res.ok) {
        const data = await res.json();
        setStartingBudget(data.starting_budget || 0);
      }
    } catch (e) { console.error(e); }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoggingIn(true);

    try {
      const res = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ student_id: loginId.trim(), password: password.trim() })
      });

      const data = await res.json();
      setIsLoggingIn(false);

      if (data.success) {
        setCurrentUser(data);
        setViewMode(data.role === 'director' ? 'director' : 'student');
        setPassword('');
      } else {
        setErrorMsg(data.message || 'Invalid Student ID or Password.');
      }
    } catch (err) {
      setIsLoggingIn(false);
      setErrorMsg('Server offline or warming up. Please try again.');
    }
  };

  const handleAssignSpot = (spotKey, studentId) => {
    setRiserAssignments(prev => {
      const updated = { ...prev };
      if (!studentId) {
        delete updated[spotKey];
      } else {
        Object.keys(updated).forEach(k => {
          if (updated[k] === studentId) delete updated[k];
        });
        updated[spotKey] = studentId;
      }
      return updated;
    });
  };

  const getAssignedSeatText = () => {
    if (!currentUser) return 'Not Signed In';
    if (currentUser.role === 'director' && viewMode === 'director') {
      return 'Director Podium (Conductor Stand)';
    }

    const foundEntry = Object.entries(riserAssignments).find(([_, id]) => id === currentUser.student_id);
    if (!foundEntry) return 'Unassigned / Placement Pending';

    const [key] = foundEntry;
    const [sec, row, spot] = key.split('-');
    const sectionName = RISER_SECTIONS.find(s => s.id === sec)?.name || sec;
    return `${sectionName}, Row ${row.replace('R', '')}, Spot #${spot.replace('S', '')}`;
  };

  const formattedToday = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  const totalIncome = budgetTransactions.filter(t => t.trans_type === 'income').reduce((acc, t) => acc + t.amount, 0);
  const totalExpenses = budgetTransactions.filter(t => t.trans_type === 'expense').reduce((acc, t) => acc + t.amount, 0);
  const currentBalance = startingBudget + totalIncome - totalExpenses;

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100 p-4">
        <div className="bg-slate-900 border border-teal-800/60 p-8 rounded-xl shadow-2xl max-w-md w-full text-center">
          <img
            src="/Olympia Titan Chorus 26 Logo - 3.PNG"
            alt="Olympia Logo"
            className="w-24 h-24 mx-auto rounded-full border-2 border-teal-400 mb-3 object-cover"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
          <h1 className="text-2xl font-bold text-teal-400">Titan Chorus Hub</h1>
          <p className="text-xs text-slate-400 mb-6">Director: Cesar Lengua-Miranda</p>

          <form onSubmit={handleLogin} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Student ID / Admin</label>
              <input
                type="text"
                required
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white text-sm"
              />
            </div>
            {errorMsg && <p className="text-xs text-rose-400 font-bold text-center">{errorMsg}</p>}
            <button type="submit" disabled={isLoggingIn} className="w-full bg-teal-600 hover:bg-teal-500 font-bold text-xs py-2.5 rounded text-white shadow">
              {isLoggingIn ? 'Signing In...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  const role = currentUser.role;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
      <header className="flex justify-between items-center border-b border-teal-900/60 pb-4 mb-6">
        <div className="flex items-center space-x-3">
          <img
            src="/Olympia Titan Chorus 26 Logo - 3.PNG"
            alt="Olympia Logo"
            className="w-10 h-10 rounded-full border border-teal-400 object-cover"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
          <div>
            <h1 className="text-xl font-bold text-teal-400">Titan Chorus Hub</h1>
            <p className="text-xs text-slate-400">{currentUser.name} ({role.toUpperCase()})</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {role === 'director' && (
            <button
              onClick={() => setViewMode(viewMode === 'director' ? 'student' : 'director')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition ${
                viewMode === 'director' ? 'bg-amber-600 text-white border-amber-400' : 'bg-slate-800 text-slate-300 border-slate-700'
              }`}
            >
              🔄 Mode: {viewMode === 'director' ? '👑 Director' : '🎓 Student Preview'}
            </button>
          )}
          <button onClick={() => setCurrentUser(null)} className="bg-rose-950 border border-rose-800 text-xs text-rose-200 px-3 py-2 rounded-lg">Sign Out</button>
        </div>
      </header>

      {(role === 'director' && viewMode === 'director') ? (
        <div className="space-y-6">
          <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3">
            {[
              { id: 'welcome', label: '🏠 Welcome Hub' },
              { id: 'music', label: '🎼 Sheet Music & Part Tracks' },
              { id: 'risers', label: '🎶 Arc Riser Map' },
              { id: 'fva', label: '📖 FVA Terms' },
              { id: 'eartraining', label: '👂 Ear Training Studio' },
              { id: 'budget', label: '💰 Program Finances' }
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setDirectorTab(t.id)}
                className={`px-4 py-2 rounded-lg text-xs font-bold border ${directorTab === t.id ? 'bg-teal-600 text-white border-teal-400' : 'bg-slate-900 text-slate-400 border-slate-800'}`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {directorTab === 'welcome' && (
            <div className="space-y-6">
              <div className="bg-slate-900 border border-teal-500/40 p-6 rounded-xl flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-extrabold text-white">Welcome, Director Lengua-Miranda!</h2>
                  <p className="text-xs text-teal-400 mt-1">Olympia Titan Chorus Command Center</p>
                </div>
                <div className="text-right">
                  <span className="text-xs uppercase font-bold text-slate-400 block">Today's Date</span>
                  <span className="text-sm font-mono font-bold text-teal-300">{formattedToday}</span>
                </div>
              </div>

              {/* INSPIRATIONAL QUOTE BANNER */}
              <div className="bg-gradient-to-r from-teal-950 to-slate-900 border border-teal-500/50 p-6 rounded-xl text-center space-y-1">
                <p className="text-md font-serif italic text-teal-200">"{randomQuote.quote}"</p>
                <span className="text-xs text-teal-400 font-bold uppercase">— {randomQuote.author}</span>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl space-y-4">
                <h3 className="text-sm font-bold text-teal-400 uppercase">📅 Titan Chorus Google Calendar</h3>
                <div className="w-full h-[500px] bg-slate-950 rounded-xl overflow-hidden border border-slate-800">
                  <iframe
                    src="https://calendar.google.com/calendar/embed?src=c_54746e83b58761dc633c39e40e6dd52b622aa84c89efc6669e5b8081f47fdf60%40group.calendar.google.com&ctz=America%2FNew_York"
                    style={{ border: 0, width: '100%', height: '100%' }}
                    frameBorder="0"
                    title="Calendar"
                  />
                </div>
              </div>
            </div>
          )}

          {directorTab === 'music' && <DigitalSheetMusicTab />}

          {directorTab === 'risers' && (
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-teal-400">🎶 Stage Curved Arc Riser Layout</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-6 gap-3 pt-4 border-b border-slate-800 pb-6">
                {RISER_SECTIONS.slice(0, 6).map(sec => (
                  <div key={sec.id} className={`p-3 rounded-xl border ${sec.color} ${sec.rotation} transform transition space-y-2`}>
                    <h4 className="font-bold text-[11px] uppercase text-center">{sec.name}</h4>
                    <div className="space-y-1 text-[10px] font-mono">
                      {[4, 3, 2, 1].map(row => (
                        <div key={row} className="flex justify-between bg-black/40 p-1 rounded">
                          <span>Row {row}</span>
                          <span>{Object.keys(riserAssignments).filter(k => k.startsWith(`${sec.id}-R${row}`)).length}/4</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {directorTab === 'fva' && (
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl space-y-6 max-w-2xl mx-auto">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <h3 className="text-lg font-bold text-teal-400">📖 FVA Terms</h3>
              </div>

              {/* 4 OPTION MULTIPLE CHOICE */}
              {(() => {
                const currentTerm = FVA_TERMS[fvaCurrentQuestionIndex];
                const incorrects = FVA_TERMS.filter((_, idx) => idx !== fvaCurrentQuestionIndex);
                const shuffledDistractors = shuffleArray(incorrects).slice(0, 3);
                const fourChoices = shuffleArray([currentTerm, ...shuffledDistractors]);

                return (
                  <div className="space-y-4 text-center">
                    <div className="flex justify-between text-xs font-mono bg-slate-950 p-2 rounded">
                      <span>Attempts: {fvaAttempts}</span>
                      <span className="text-teal-400 font-bold">Score: {fvaScore} / {fvaAttempts}</span>
                    </div>

                    {fvaFeedback && <p className="text-xs font-bold text-teal-300">{fvaFeedback}</p>}

                    <div className="p-6 bg-slate-950 rounded-xl border border-slate-800 space-y-4">
                      <p className="text-sm font-bold text-white">What is the definition of "{currentTerm.term}"?</p>
                      <div className="grid grid-cols-1 gap-2">
                        {fourChoices.map((choice, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleFvaQuizAnswer(choice.def === currentTerm.def ? fvaCurrentQuestionIndex : -1)}
                            className="bg-slate-800 hover:bg-teal-600 p-2.5 rounded text-xs text-left text-white transition"
                          >
                            {choice.def}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {directorTab === 'eartraining' && (
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl space-y-6 max-w-xl mx-auto text-center">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-teal-400">👂 Ear Training Studio</h3>
                <div className="flex gap-2">
                  <button onClick={() => setEarCategory('intervals')} className={`px-3 py-1 rounded text-xs font-bold ${earCategory === 'intervals' ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-400'}`}>Intervals</button>
                  <button onClick={() => setEarCategory('chords')} className={`px-3 py-1 rounded text-xs font-bold ${earCategory === 'chords' ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-400'}`}>Chord Quality</button>
                </div>
              </div>

              {earFeedback && <p className="text-xs font-bold text-teal-300">{earFeedback}</p>}

              <button onClick={playEarPrompt} className="bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs px-6 py-3 rounded-xl shadow-lg">
                🔊 Play Prompt (Slow Melodic ➔ Harmonic)
              </button>

              <div className="p-6 bg-slate-950 rounded-xl border border-slate-800 space-y-4">
                <p className="text-sm font-semibold text-white">Identify the {earCategory === 'intervals' ? 'interval' : 'chord quality'} played above:</p>
                <div className="grid grid-cols-2 gap-3">
                  {shuffledEarOptions.map((opt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleEarAnswer(opt)}
                      className="bg-slate-800 hover:bg-teal-600 p-3 rounded text-xs font-bold text-white transition"
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* STUDENT VIEW */
        <div className="space-y-6 max-w-4xl mx-auto">
          <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3">
            <button onClick={() => setStudentTab('home')} className={`px-4 py-2 rounded-lg text-xs font-bold ${studentTab === 'home' ? 'bg-teal-600 text-white' : 'bg-slate-900 text-slate-400'}`}>🏠 Home & Riser Seat</button>
            <button onClick={() => setStudentTab('music')} className={`px-4 py-2 rounded-lg text-xs font-bold ${studentTab === 'music' ? 'bg-teal-600 text-white' : 'bg-slate-900 text-slate-400'}`}>🎼 Music & Practice Tracks</button>
            <button onClick={() => setStudentTab('tools')} className={`px-4 py-2 rounded-lg text-xs font-bold ${studentTab === 'tools' ? 'bg-teal-600 text-white' : 'bg-slate-900 text-slate-400'}`}>🎹 Pitch Pipe & Metronome</button>
            <button onClick={() => setStudentTab('fva')} className={`px-4 py-2 rounded-lg text-xs font-bold ${studentTab === 'fva' ? 'bg-teal-600 text-white' : 'bg-slate-900 text-slate-400'}`}>📖 FVA Terms</button>
            <button onClick={() => setStudentTab('eartraining')} className={`px-4 py-2 rounded-lg text-xs font-bold ${studentTab === 'eartraining' ? 'bg-teal-600 text-white' : 'bg-slate-900 text-slate-400'}`}>👂 Ear Training Studio</button>
          </div>

          {studentTab === 'home' && (
            <div className="space-y-6">
              <div className="bg-teal-950/80 border border-teal-500/60 p-6 rounded-xl space-y-1">
                <span className="text-[10px] uppercase font-bold text-teal-400 block tracking-wider">Your Live Assigned Riser Spot</span>
                <h2 className="text-xl font-bold text-white">📍 {getAssignedSeatText()}</h2>
                <p className="text-xs text-slate-300">Ensemble: {currentUser.ensemble} • Voice Part: {currentUser.voice_part}</p>
              </div>

              {/* INSPIRATIONAL QUOTE BANNER */}
              <div className="bg-gradient-to-r from-teal-950 to-slate-900 border border-teal-500/50 p-6 rounded-xl text-center space-y-1">
                <p className="text-md font-serif italic text-teal-200">"{randomQuote.quote}"</p>
                <span className="text-xs text-teal-400 font-bold uppercase">— {randomQuote.author}</span>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl space-y-4">
                <h3 className="text-sm font-bold text-teal-400 uppercase">📅 Chorus Performance & Practice Calendar</h3>
                <div className="w-full h-[500px] bg-slate-950 rounded-xl overflow-hidden border border-slate-800">
                  <iframe
                    src="https://calendar.google.com/calendar/embed?src=c_54746e83b58761dc633c39e40e6dd52b622aa84c89efc6669e5b8081f47fdf60%40group.calendar.google.com&ctz=America%2FNew_York"
                    style={{ border: 0, width: '100%', height: '100%' }}
                    frameBorder="0"
                    title="Student Calendar"
                  />
                </div>
              </div>
            </div>
          )}

          {studentTab === 'music' && <DigitalSheetMusicTab />}

          {studentTab === 'tools' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl space-y-4 text-center">
                <h3 className="text-md font-bold text-teal-400 uppercase">⏱️ Audio Metronome</h3>
                <div className="text-4xl font-mono font-bold text-white">{bpm} <span className="text-xs text-slate-400 font-normal">BPM</span></div>
                <input
                  type="range"
                  min="40"
                  max="218"
                  value={bpm}
                  onChange={(e) => setBpm(parseInt(e.target.value))}
                  className="w-full accent-teal-500 cursor-pointer"
                />
                <button
                  onClick={() => setIsMetronomePlaying(!isMetronomePlaying)}
                  className={`w-full font-bold text-xs py-3 rounded-lg transition ${
                    isMetronomePlaying ? 'bg-rose-600 text-white' : 'bg-teal-600 text-white'
                  }`}
                >
                  {isMetronomePlaying ? '⏹️ Stop Metronome' : '▶️ Start Metronome'}
                </button>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl space-y-4 text-center">
                <div className="flex justify-between items-center">
                  <h3 className="text-md font-bold text-teal-400 uppercase">🎵 Pitch Pipe Tool</h3>
                  <button
                    onClick={() => setPitchViewMode(pitchViewMode === 'wheel' ? 'keyboard' : 'wheel')}
                    className="bg-slate-800 text-xs px-2.5 py-1 rounded text-slate-300 font-bold border border-slate-700"
                  >
                    Switch to {pitchViewMode === 'wheel' ? '🎹 Keyboard' : '🎡 Pitch Wheel'}
                  </button>
                </div>

                {pitchViewMode === 'wheel' ? (
                  <div className="grid grid-cols-4 gap-2 pt-2">
                    {['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'].map(note => (
                      <button
                        key={note}
                        onClick={() => playPitchNote(`${note}${selectedOctave}`)}
                        className="bg-slate-950 hover:bg-teal-600 border border-slate-800 hover:border-teal-400 p-3 rounded-lg text-xs font-mono font-bold text-teal-300 transition"
                      >
                        {`${note}${selectedOctave}`}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="relative flex justify-center items-start pt-4 pb-2 h-44 bg-slate-950 rounded-xl p-4 border border-slate-800 overflow-x-auto">
                    <div className="relative flex">
                      {['C', 'D', 'E', 'F', 'G', 'A', 'B'].map((note) => (
                        <button
                          key={note}
                          onClick={() => playPitchNote(`${note}${selectedOctave}`)}
                          className="w-10 h-32 bg-slate-100 hover:bg-teal-200 text-slate-900 font-bold text-[11px] rounded-b-md border border-slate-300 flex items-end justify-center pb-2 transition shadow-md active:bg-teal-400"
                        >
                          {`${note}${selectedOctave}`}
                        </button>
                      ))}
                      <button onClick={() => playPitchNote(`C#${selectedOctave}`)} className="absolute left-[26px] top-0 w-6 h-20 bg-slate-900 hover:bg-amber-500 text-amber-300 text-[9px] font-mono font-bold rounded-b border border-slate-700 z-10 flex items-end justify-center pb-1 shadow-lg">C#</button>
                      <button onClick={() => playPitchNote(`D#${selectedOctave}`)} className="absolute left-[66px] top-0 w-6 h-20 bg-slate-900 hover:bg-amber-500 text-amber-300 text-[9px] font-mono font-bold rounded-b border border-slate-700 z-10 flex items-end justify-center pb-1 shadow-lg">D#</button>
                      <button onClick={() => playPitchNote(`F#${selectedOctave}`)} className="absolute left-[146px] top-0 w-6 h-20 bg-slate-900 hover:bg-amber-500 text-amber-300 text-[9px] font-mono font-bold rounded-b border border-slate-700 z-10 flex items-end justify-center pb-1 shadow-lg">F#</button>
                      <button onClick={() => playPitchNote(`G#${selectedOctave}`)} className="absolute left-[186px] top-0 w-6 h-20 bg-slate-900 hover:bg-amber-500 text-amber-300 text-[9px] font-mono font-bold rounded-b border border-slate-700 z-10 flex items-end justify-center pb-1 shadow-lg">G#</button>
                      <button onClick={() => playPitchNote(`A#${selectedOctave}`)} className="absolute left-[226px] top-0 w-6 h-20 bg-slate-900 hover:bg-amber-500 text-amber-300 text-[9px] font-mono font-bold rounded-b border border-slate-700 z-10 flex items-end justify-center pb-1 shadow-lg">A#</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const DigitalSheetMusicTab = () => (
  <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl space-y-6">
    <div>
      <h3 className="text-lg font-bold text-teal-400">🎶 Digital Sheet Music Library & Part Tracks</h3>
      <p className="text-xs text-slate-400">View performance PDFs and stream section practice tracks.</p>
    </div>

    <div className="space-y-6">
      {SHEET_MUSIC_LIBRARY.map((cat, idx) => (
        <div key={idx} className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-4">
          <h4 className="font-bold text-amber-400 text-sm border-b border-slate-800 pb-2">{cat.folder}</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {cat.songs.map((song, sIdx) => (
              <div key={sIdx} className="bg-slate-900 p-4 rounded-lg border border-slate-800 space-y-3">
                <div className="flex justify-between items-center">
                  <h5 className="font-bold text-white text-xs">{song.title}</h5>
                  <a href={song.pdfUrl} target="_blank" rel="noreferrer" className="bg-teal-600 hover:bg-teal-500 text-white text-[10px] font-bold px-2.5 py-1 rounded">
                    📄 Open PDF
                  </a>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Section Practice Audio Tracks</span>
                  <div className="grid grid-cols-2 gap-1.5 text-[10px] font-mono">
                    <button className="bg-slate-950 hover:bg-teal-900/60 border border-slate-800 p-1.5 rounded text-slate-300 text-left">▶ Soprano Track</button>
                    <button className="bg-slate-950 hover:bg-teal-900/60 border border-slate-800 p-1.5 rounded text-slate-300 text-left">▶ Alto Track</button>
                    <button className="bg-slate-950 hover:bg-teal-900/60 border border-slate-800 p-1.5 rounded text-slate-300 text-left">▶ Tenor Track</button>
                    <button className="bg-slate-950 hover:bg-teal-900/60 border border-slate-800 p-1.5 rounded text-slate-300 text-left">▶ Bass Track</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);
