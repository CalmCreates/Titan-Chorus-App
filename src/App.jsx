import React, { useState, useEffect, useRef } from 'react';

const API_BASE = "https://titan-chorus-app.onrender.com/api";

const WARMUP_BANK = [
  { title: "Staccato Arpeggio (1-3-5-3-1)", desc: "Sing 'Sing-ee-sing' on staccato 1-3-5-3-1 to activate diaphragmatic support and light placement." },
  { title: "Lip Trills / Buzzes (5-4-3-2-1)", desc: "Gentle descending lip trills to relax tension and align breath flow before belt work." },
  { title: "Vowels Alignment (Mee-May-Mah-Moh-Moo)", desc: "Sustain single pitch per vowel string keeping space open in the back of the pharynx." },
  { title: "Siren Glide (Octave + Octave)", desc: "Continuous vocal siren from lowest comfortable pitch to head voice peak on 'Ngoo'." },
  { title: "Diction Speed Drill (The Tip of the Tongue)", desc: "Fast articulation on single pitch: 'The tip of the tongue, the teeth, the lips'." },
  { title: "Consonant Bounce (K-T-P-S)", desc: "Short rhythmic expulsion of unvoiced consonants to engage abdominal wall elasticity." },
  { title: "Minor Octave Leap (1-8-7-6-5-4-3-2-1)", desc: "Ascend 1 to 8 on 'Ha', descend smoothly to build upper register agility." }
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

// EAR TRAINING PROMPTS BANK WITH SPECIFIC ROOT AND TARGET PITCHES
const EAR_PROMPTS_BANK = [
  { root: "C4", target: "G4", label: "Perfect 5th", options: ["Perfect 5th", "Major 3rd", "Minor 7th", "Perfect 4th"] },
  { root: "C4", target: "E4", label: "Major 3rd", options: ["Major 3rd", "Perfect 5th", "Octave", "Minor 3rd"] },
  { root: "C4", target: "F4", label: "Perfect 4th", options: ["Perfect 4th", "Perfect 5th", "Major 6th", "Major 2nd"] },
  { root: "C4", target: "B4", label: "Major 7th", options: ["Major 7th", "Minor 7th", "Perfect 5th", "Octave"] },
  { root: "C4", target: "C5", label: "Octave", options: ["Octave", "Perfect 5th", "Major 7th", "Major 3rd"] },
  { root: "C4", target: "D4", label: "Major 2nd", options: ["Major 2nd", "Minor 3rd", "Perfect 4th", "Perfect 5th"] },
  { root: "C4", target: "D#4", label: "Minor 3rd", options: ["Minor 3rd", "Major 3rd", "Perfect 5th", "Minor 7th"] },
  { root: "C4", target: "A4", label: "Major 6th", options: ["Major 6th", "Perfect 5th", "Major 7th", "Octave"] }
];

const RISER_SECTIONS = [
  { id: 'A', name: 'Riser A (Far Left)', color: 'bg-rose-950/60 border-rose-500/50 text-rose-300' },
  { id: 'B', name: 'Riser B (Left Center)', color: 'bg-amber-950/60 border-amber-500/50 text-amber-300' },
  { id: 'C', name: 'Riser C (Center Left)', color: 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300' },
  { id: 'D', name: 'Riser D (Center Right)', color: 'bg-teal-950/60 border-teal-500/50 text-teal-300' },
  { id: 'E', name: 'Riser E (Right Center)', color: 'bg-sky-950/60 border-sky-500/50 text-sky-300' },
  { id: 'F', name: 'Riser F (Far Right)', color: 'bg-indigo-950/60 border-indigo-500/50 text-indigo-300' },
  { id: 'G', name: 'Riser G (Overflow)', color: 'bg-purple-950/60 border-purple-500/50 text-purple-300' },
  { id: 'FLOOR', name: 'Floor Level', color: 'bg-slate-900 border-slate-700 text-slate-300' }
];

const NOTE_FREQS = {
  "C2": 65.41, "C#2": 69.30, "D2": 73.42, "D#2": 77.78, "E2": 82.41, "F2": 87.31, "F#2": 92.50, "G2": 98.00, "G#2": 103.83, "A2": 110.00, "A#2": 116.54, "B2": 123.47,
  "C3": 130.81, "C#3": 138.59, "D3": 146.83, "D#3": 155.56, "E3": 164.81, "F3": 174.61, "F#3": 185.00, "G3": 196.00, "G#3": 207.65, "A3": 220.00, "A#3": 233.08, "B3": 246.94,
  "C4": 261.63, "C#4": 277.18, "D4": 293.66, "D#4": 311.13, "E4": 329.63, "F4": 349.23, "F#4": 369.99, "G4": 392.00, "G#4": 415.30, "A4": 440.00, "A#4": 466.16, "B4": 493.88,
  "C5": 523.25
};

// SHUFFLE HELPER UTILITY (FISHER-YATES SHUFFLE)
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

  // VIEW MODE & NAVIGATION
  const [viewMode, setViewMode] = useState('director');
  const [directorTab, setDirectorTab] = useState('welcome');
  const [studentTab, setStudentTab] = useState('home');

  // DATA STATES
  const [students, setStudents] = useState([]);
  const [eventsList, setEventsList] = useState([]);
  const [budgetTransactions, setBudgetTransactions] = useState([]);
  const [startingBudget, setStartingBudget] = useState(0);
  const [newStartingBudget, setNewStartingBudget] = useState('');

  // RISER STATE
  const [riserAssignments, setRiserAssignments] = useState({});
  const [riserDisplayView, setRiserDisplayView] = useState('full');
  const [selectedRiserSection, setSelectedRiserSection] = useState('A');

  // FVA TERMS STATE
  const [fvaMode, setFvaMode] = useState('study');
  const [fvaCardIndex, setFvaCardIndex] = useState(0);
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [fvaScore, setFvaScore] = useState(0);
  const [fvaAttempts, setFvaAttempts] = useState(0);
  const [fvaCurrentQuestionIndex, setFvaCurrentQuestionIndex] = useState(0);
  const [fvaFeedback, setFvaFeedback] = useState('');

  // EAR TRAINING STATE WITH SHUFFLED OPTIONS
  const [earScore, setEarScore] = useState(0);
  const [earAttempts, setEarAttempts] = useState(0);
  const [currentEarIndex, setCurrentEarIndex] = useState(0);
  const [shuffledEarOptions, setShuffledEarOptions] = useState([]);
  const [earFeedback, setEarFeedback] = useState('');
  const [showCelebrationModal, setShowCelebrationModal] = useState(false);

  // METRONOME & PITCH STATE
  const [bpm, setBpm] = useState(100);
  const [isMetronomePlaying, setIsMetronomePlaying] = useState(false);
  const [selectedOctave, setSelectedOctave] = useState(4);
  const [pitchViewMode, setPitchViewMode] = useState('wheel');
  const metronomeTimer = useRef(null);
  const audioCtxRef = useRef(null);

  // BUDGET FORM STATE
  const [transDate, setTransDate] = useState(new Date().toISOString().split('T')[0]);
  const [transCategory, setTransCategory] = useState('Dues');
  const [transDesc, setTransDesc] = useState('');
  const [transType, setTransType] = useState('income');
  const [transAmount, setTransAmount] = useState('');
  const [transStudentId, setTransStudentId] = useState('');

  useEffect(() => {
    if (currentUser) {
      fetchStudents();
      fetchEvents();
      fetchBudget();
      fetchStartingBudget();
    }
  }, [currentUser]);

  // SHUFFLE EAR OPTIONS WHENEVER THE PROMPT INDEX CHANGES
  useEffect(() => {
    const currentPrompt = EAR_PROMPTS_BANK[currentEarIndex];
    if (currentPrompt) {
      setShuffledEarOptions(shuffleArray(currentPrompt.options));
    }
  }, [currentEarIndex]);

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

    const prompt = EAR_PROMPTS_BANK[currentEarIndex];
    const rootFreq = NOTE_FREQS[prompt.root] || 261.63;
    const targetFreq = NOTE_FREQS[prompt.target] || 392.00;

    // 1. Melodic Root Note
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.frequency.setValueAtTime(rootFreq, ctx.currentTime);
    gain1.gain.setValueAtTime(0.3, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.6);

    // 2. Melodic Target Note (Delayed 0.6s)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.frequency.setValueAtTime(targetFreq, ctx.currentTime + 0.6);
    gain2.gain.setValueAtTime(0.3, ctx.currentTime + 0.6);
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(ctx.currentTime + 0.6);
    osc2.stop(ctx.currentTime + 1.2);

    // 3. Harmonic Together (Delayed 1.4s)
    const osc3 = ctx.createOscillator();
    const osc4 = ctx.createOscillator();
    const gainH = ctx.createGain();

    osc3.frequency.setValueAtTime(rootFreq, ctx.currentTime + 1.4);
    osc4.frequency.setValueAtTime(targetFreq, ctx.currentTime + 1.4);
    gainH.gain.setValueAtTime(0.25, ctx.currentTime + 1.4);
    gainH.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2.4);

    osc3.connect(gainH);
    osc4.connect(gainH);
    gainH.connect(ctx.destination);

    osc3.start(ctx.currentTime + 1.4);
    osc4.start(ctx.currentTime + 1.4);
    osc3.stop(ctx.currentTime + 2.4);
    osc4.stop(ctx.currentTime + 2.4);
  };

  const handleEarAnswer = (chosenOption) => {
    const currentPrompt = EAR_PROMPTS_BANK[currentEarIndex];
    const isCorrect = chosenOption === currentPrompt.label;

    const newScore = isCorrect ? earScore + 1 : earScore;
    const newAttempts = earAttempts + 1;

    setEarScore(newScore);
    setEarAttempts(newAttempts);

    if (isCorrect) {
      setEarFeedback('✅ Correct! Perfect pitch accuracy.');
    } else {
      setEarFeedback(`❌ Incorrect. The correct answer was "${currentPrompt.label}".`);
    }

    if (newScore === 20 && newAttempts === 20) {
      setShowCelebrationModal(true);
    }

    // Load next random prompt
    setTimeout(() => {
      let nextIndex = Math.floor(Math.random() * EAR_PROMPTS_BANK.length);
      if (nextIndex === currentEarIndex) {
        nextIndex = (nextIndex + 1) % EAR_PROMPTS_BANK.length;
      }
      setCurrentEarIndex(nextIndex);
      setEarFeedback('');
    }, 1500);
  };

  const handleFvaQuizAnswer = (chosenIndex) => {
    const isCorrect = chosenIndex === fvaCurrentQuestionIndex;
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

  const fetchEvents = async () => {
    try {
      const res = await fetch(`${API_BASE}/events`);
      if (res.ok) setEventsList(await res.json());
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

  const handleUpdateStartingBudget = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/budget/starting`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ starting_budget: parseFloat(newStartingBudget || 0) })
      });
      if (res.ok) {
        fetchStartingBudget();
        setNewStartingBudget('');
      }
    } catch (e) { console.error(e); }
  };

  const handleAddTransaction = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/budget`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trans_date: transDate,
          category: transCategory,
          description: transDesc,
          trans_type: transType,
          amount: parseFloat(transAmount || 0),
          student_id: transStudentId || null
        })
      });
      if (res.ok) {
        fetchBudget();
        fetchStudents();
        setTransDesc('');
        setTransAmount('');
        setTransStudentId('');
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

  const AbsenceRequestModule = () => (
    <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl space-y-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
        <div>
          <h3 className="text-lg font-bold text-teal-400">📝 Excused Absence & Leave Request Form</h3>
          <p className="text-xs text-slate-400">Submit requests for planned absences, illness, or school event conflicts.</p>
        </div>
        <a
          href="https://forms.gle/vphmxYqnLMcVkibL9"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold px-4 py-2 rounded-lg shadow"
        >
          ↗ Open Form in New Window
        </a>
      </div>

      <div className="w-full bg-slate-950 rounded-xl overflow-hidden border border-slate-800 flex justify-center py-4">
        <iframe
          src="https://docs.google.com/forms/d/e/1FAIpQLSer4jIeMA77VSji0H5Nsmq8dG8Q8aRWLDqQv20MKXYSVeSJ_Q/viewform?embedded=true"
          width="100%"
          height="800"
          frameBorder="0"
          className="max-w-2xl w-full"
          title="Excused Absence Form"
        >
          Loading…
        </iframe>
      </div>
    </div>
  );

  // LOGIN SCREEN
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
      {/* HEADER WITH MODE TOGGLE */}
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

      {/* CELEBRATION MODAL */}
      {showCelebrationModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-teal-500 p-8 rounded-2xl max-w-sm w-full text-center space-y-4 shadow-2xl">
            <div className="text-4xl animate-bounce">🐧🎉</div>
            <h2 className="text-2xl font-extrabold text-teal-300">PERFECT 20/20 SCORE!</h2>
            <p className="text-xs text-slate-300">Incredible ear training accuracy!</p>
            <button onClick={() => setShowCelebrationModal(false)} className="w-full bg-teal-600 text-white font-bold py-2 rounded-lg text-xs">Continue</button>
          </div>
        </div>
      )}

      {/* DIRECTOR VIEW */}
      {(role === 'director' && viewMode === 'director') ? (
        <div className="space-y-6">
          <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3">
            {[
              { id: 'welcome', label: '🏠 Welcome Hub' },
              { id: 'risers', label: '🎶 Stage Riser Map' },
              { id: 'fva', label: '📖 FVA Terms' },
              { id: 'eartraining', label: '👂 Ear Training Studio' },
              { id: 'absences', label: '📝 Absence Form' },
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

          {directorTab === 'risers' && (
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-teal-400">🎶 Stage Riser Charts</h3>
                <div className="flex gap-2">
                  <button onClick={() => setRiserDisplayView('full')} className={`px-3 py-1.5 rounded text-xs font-bold ${riserDisplayView === 'full' ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-400'}`}>Full Stage Overview</button>
                  <button onClick={() => setRiserDisplayView('section')} className={`px-3 py-1.5 rounded text-xs font-bold ${riserDisplayView === 'section' ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-400'}`}>Section Detail View</button>
                </div>
              </div>

              {riserDisplayView === 'full' ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {RISER_SECTIONS.map(sec => (
                    <div key={sec.id} className={`p-4 rounded-xl border ${sec.color} space-y-2`}>
                      <h4 className="font-bold text-xs uppercase">{sec.name}</h4>
                      <div className="space-y-1 text-[10px] font-mono">
                        {[4, 3, 2, 1].map(row => (
                          <div key={row} className="flex justify-between bg-black/40 p-1 rounded">
                            <span>Row {row}</span>
                            <span>{Object.keys(riserAssignments).filter(k => k.startsWith(`${sec.id}-R${row}`)).length} / 4 Filled</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {RISER_SECTIONS.map(sec => (
                      <button key={sec.id} onClick={() => setSelectedRiserSection(sec.id)} className={`px-3 py-1 rounded text-xs font-bold border ${selectedRiserSection === sec.id ? 'bg-teal-600 text-white' : 'bg-slate-950 text-slate-400'}`}>
                        {sec.id}
                      </button>
                    ))}
                  </div>

                  <div className="space-y-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
                    {[4, 3, 2, 1].map(rowNum => (
                      <div key={rowNum} className="flex items-center gap-3">
                        <span className="text-[10px] uppercase font-mono font-bold text-slate-500 w-16">Row {rowNum}</span>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 flex-1">
                          {[1, 2, 3, 4].map(spotNum => {
                            const spotKey = `${selectedRiserSection}-R${rowNum}-S${spotNum}`;
                            const assignedId = riserAssignments[spotKey];
                            return (
                              <div key={spotNum} className="bg-slate-900 p-2 rounded border border-slate-800 space-y-1">
                                <span className="text-[10px] text-slate-500">Spot #{spotNum}</span>
                                <select value={assignedId || ''} onChange={(e) => handleAssignSpot(spotKey, e.target.value)} className="w-full bg-slate-950 text-xs text-white p-1 rounded border border-slate-700">
                                  <option value="">-- Empty --</option>
                                  {students.filter(s => s.role !== 'director').map(s => (
                                    <option key={s.student_id} value={s.student_id}>{s.name}</option>
                                  ))}
                                </select>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {directorTab === 'fva' && (
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl space-y-6 max-w-2xl mx-auto">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <h3 className="text-lg font-bold text-teal-400">📖 FVA Terms</h3>
                <div className="flex gap-2">
                  <button onClick={() => setFvaMode('study')} className={`px-3 py-1 rounded text-xs font-bold ${fvaMode === 'study' ? 'bg-teal-600 text-white' : 'bg-slate-800 text-slate-400'}`}>Study Flashcards</button>
                  <button onClick={() => setFvaMode('quiz')} className={`px-3 py-1 rounded text-xs font-bold ${fvaMode === 'quiz' ? 'bg-teal-600 text-white' : 'bg-slate-800 text-slate-400'}`}>Multiple Choice Quiz</button>
                </div>
              </div>

              {fvaMode === 'study' ? (
                <div className="text-center space-y-4">
                  <div
                    onClick={() => setIsCardFlipped(!isCardFlipped)}
                    className="h-48 bg-slate-950 border border-teal-500/50 rounded-2xl flex flex-col justify-center items-center p-6 cursor-pointer"
                  >
                    <span className="text-[10px] uppercase font-bold text-teal-400 mb-2">{isCardFlipped ? 'Definition' : 'FVA Term (Click to Flip)'}</span>
                    <h4 className="text-2xl font-extrabold text-white">{isCardFlipped ? FVA_TERMS[fvaCardIndex].def : FVA_TERMS[fvaCardIndex].term}</h4>
                  </div>
                  <div className="flex justify-between items-center">
                    <button onClick={() => { setIsCardFlipped(false); setFvaCardIndex((fvaCardIndex - 1 + FVA_TERMS.length) % FVA_TERMS.length); }} className="bg-slate-800 px-4 py-2 rounded text-xs font-bold">← Previous</button>
                    <span className="text-xs text-slate-400">{fvaCardIndex + 1} of {FVA_TERMS.length}</span>
                    <button onClick={() => { setIsCardFlipped(false); setFvaCardIndex((fvaCardIndex + 1) % FVA_TERMS.length); }} className="bg-slate-800 px-4 py-2 rounded text-xs font-bold">Next →</button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 text-center">
                  <div className="flex justify-between text-xs font-mono bg-slate-950 p-2 rounded">
                    <span>Attempts: {fvaAttempts}</span>
                    <span className="text-teal-400 font-bold">Score: {fvaScore} / {fvaAttempts}</span>
                  </div>

                  {fvaFeedback && <p className="text-xs font-bold text-teal-300">{fvaFeedback}</p>}

                  <div className="p-6 bg-slate-950 rounded-xl border border-slate-800 space-y-4">
                    <p className="text-sm font-bold text-white">What is the definition of "{FVA_TERMS[fvaCurrentQuestionIndex].term}"?</p>
                    <div className="grid grid-cols-1 gap-2">
                      {FVA_TERMS.map((t, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleFvaQuizAnswer(idx)}
                          className="bg-slate-800 hover:bg-teal-600 p-2.5 rounded text-xs text-left text-white transition"
                        >
                          {t.def}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* EAR TRAINING STUDIO WITH SHUFFLED OPTIONS & MATCHED AUDIO */}
          {directorTab === 'eartraining' && (
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl space-y-6 max-w-xl mx-auto text-center">
              <h3 className="text-lg font-bold text-teal-400">👂 Ear Training Studio</h3>

              <div className="flex justify-between text-xs font-mono bg-slate-950 p-3 rounded border border-slate-800">
                <span>Total Attempts: {earAttempts}</span>
                <span className="text-teal-400 font-bold">Score: {earScore} / {earAttempts}</span>
              </div>

              {earFeedback && <p className="text-xs font-bold text-teal-300">{earFeedback}</p>}

              <button onClick={playEarPrompt} className="bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs px-6 py-3 rounded-xl shadow-lg">
                🔊 Play Prompt (Slow Melodic ➔ Harmonic)
              </button>

              <div className="p-6 bg-slate-950 rounded-xl border border-slate-800 space-y-4">
                <p className="text-sm font-semibold text-white">Identify the interval played above:</p>
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

          {directorTab === 'budget' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-2">
                  <span className="text-xs uppercase font-bold text-slate-400 block">Starting Budget</span>
                  <div className="text-2xl font-mono font-bold text-amber-400">${startingBudget.toFixed(2)}</div>
                  <form onSubmit={handleUpdateStartingBudget} className="flex gap-2 pt-1">
                    <input
                      type="number"
                      step="0.01"
                      placeholder="New starting $"
                      value={newStartingBudget}
                      onChange={(e) => setNewStartingBudget(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                    />
                    <button type="submit" className="bg-amber-600 text-white font-bold text-xs px-2 py-1 rounded">Set</button>
                  </form>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-1">
                  <span className="text-xs uppercase font-bold text-emerald-400 block">Total Revenue</span>
                  <div className="text-2xl font-mono font-bold text-emerald-300">+${totalIncome.toFixed(2)}</div>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-1">
                  <span className="text-xs uppercase font-bold text-rose-400 block">Total Expenses</span>
                  <div className="text-2xl font-mono font-bold text-rose-300">-${totalExpenses.toFixed(2)}</div>
                </div>

                <div className="bg-slate-900 border border-teal-500/50 p-4 rounded-xl space-y-1">
                  <span className="text-xs uppercase font-bold text-teal-400 block">Net Available Balance</span>
                  <div className="text-2xl font-mono font-bold text-teal-200">${currentBalance.toFixed(2)}</div>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl space-y-4">
                <h3 className="text-md font-bold text-teal-400">💵 Record Payment or Expense</h3>
                <form onSubmit={handleAddTransaction} className="grid grid-cols-1 md:grid-cols-6 gap-3">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Date</label>
                    <input type="date" required value={transDate} onChange={(e) => setTransDate(e.target.value)} className="w-full bg-slate-950 border border-slate-800 p-2 rounded text-xs text-white" />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Type</label>
                    <select value={transType} onChange={(e) => setTransType(e.target.value)} className="w-full bg-slate-950 border border-slate-800 p-2 rounded text-xs text-white">
                      <option value="income">Income (+)</option>
                      <option value="expense">Expense (-)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Attach to Student</label>
                    <select value={transStudentId} onChange={(e) => setTransStudentId(e.target.value)} className="w-full bg-slate-950 border border-slate-800 p-2 rounded text-xs text-white">
                      <option value="">(None - General Program)</option>
                      {students.filter(s => s.role !== 'director').map(s => (
                        <option key={s.student_id} value={s.student_id}>{s.name} ({s.student_id})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Category</label>
                    <input type="text" required placeholder="e.g. Fair Share Dues" value={transCategory} onChange={(e) => setTransCategory(e.target.value)} className="w-full bg-slate-950 border border-slate-800 p-2 rounded text-xs text-white" />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Amount ($)</label>
                    <input type="number" step="0.01" required placeholder="100.00" value={transAmount} onChange={(e) => setTransAmount(e.target.value)} className="w-full bg-slate-950 border border-slate-800 p-2 rounded text-xs text-white" />
                  </div>

                  <div className="flex items-end">
                    <button type="submit" className="w-full bg-teal-600 hover:bg-teal-500 font-bold text-xs py-2 rounded text-white shadow">Log Entry</button>
                  </div>
                </form>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl space-y-4">
                <h3 className="text-md font-bold text-teal-400">📜 Financial Ledger</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 uppercase">
                        <th className="py-2 px-2">Date</th>
                        <th className="py-2 px-2">Type</th>
                        <th className="py-2 px-2">Category</th>
                        <th className="py-2 px-2">Attached Student</th>
                        <th className="py-2 px-2 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {budgetTransactions.map((t) => {
                        const linkedStudent = students.find(s => s.student_id === t.student_id);
                        return (
                          <tr key={t.id}>
                            <td className="py-2 px-2 font-mono text-slate-400">{t.trans_date}</td>
                            <td className="py-2 px-2 uppercase font-bold text-[10px]">
                              <span className={t.trans_type === 'income' ? 'text-emerald-400' : 'text-rose-400'}>
                                {t.trans_type}
                              </span>
                            </td>
                            <td className="py-2 px-2 font-semibold text-white">{t.category}</td>
                            <td className="py-2 px-2 text-slate-300">
                              {linkedStudent ? `${linkedStudent.name} (${linkedStudent.student_id})` : '-'}
                            </td>
                            <td className={`py-2 px-2 font-mono font-bold text-right ${t.trans_type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {t.trans_type === 'income' ? '+' : '-'}${t.amount.toFixed(2)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {directorTab === 'absences' && <AbsenceRequestModule />}
        </div>
      ) : (
        /* STUDENT VIEW OR DIRECTOR STUDENT PREVIEW */
        <div className="space-y-6 max-w-4xl mx-auto">
          <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3">
            <button onClick={() => setStudentTab('home')} className={`px-4 py-2 rounded-lg text-xs font-bold ${studentTab === 'home' ? 'bg-teal-600 text-white' : 'bg-slate-900 text-slate-400'}`}>🏠 Home & Riser Seat</button>
            <button onClick={() => setStudentTab('tools')} className={`px-4 py-2 rounded-lg text-xs font-bold ${studentTab === 'tools' ? 'bg-teal-600 text-white' : 'bg-slate-900 text-slate-400'}`}>🎹 Pitch Pipe & Metronome</button>
            <button onClick={() => setStudentTab('fva')} className={`px-4 py-2 rounded-lg text-xs font-bold ${studentTab === 'fva' ? 'bg-teal-600 text-white' : 'bg-slate-900 text-slate-400'}`}>📖 FVA Terms & Flashcards</button>
            <button onClick={() => setStudentTab('eartraining')} className={`px-4 py-2 rounded-lg text-xs font-bold ${studentTab === 'eartraining' ? 'bg-teal-600 text-white' : 'bg-slate-900 text-slate-400'}`}>👂 Ear Training Studio</button>
            <button onClick={() => setStudentTab('absences')} className={`px-4 py-2 rounded-lg text-xs font-bold ${studentTab === 'absences' ? 'bg-teal-600 text-white' : 'bg-slate-900 text-slate-400'}`}>📝 Absence Request</button>
          </div>

          {studentTab === 'home' && (
            <div className="space-y-6">
              <div className="bg-teal-950/80 border border-teal-500/60 p-6 rounded-xl space-y-1">
                <span className="text-[10px] uppercase font-bold text-teal-400 block tracking-wider">Your Live Assigned Riser Spot</span>
                <h2 className="text-xl font-bold text-white">📍 {getAssignedSeatText()}</h2>
                <p className="text-xs text-slate-300">Ensemble: {currentUser.ensemble} • Voice Part: {currentUser.voice_part}</p>
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

                <div className="flex justify-center gap-2">
                  {[2, 3, 4, 5].map(oct => (
                    <button
                      key={oct}
                      onClick={() => setSelectedOctave(oct)}
                      className={`px-3 py-1 rounded text-xs font-bold border ${selectedOctave === oct ? 'bg-amber-600 text-white border-amber-400' : 'bg-slate-950 text-slate-400 border-slate-800'}`}
                    >
                      Octave {oct}
                    </button>
                  ))}
                </div>

                {pitchViewMode === 'wheel' ? (
                  <div className="grid grid-cols-4 gap-2 pt-2">
                    {['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'].map(note => {
                      const fullNote = `${note}${selectedOctave}`;
                      return (
                        <button
                          key={note}
                          onClick={() => playPitchNote(fullNote)}
                          className="bg-slate-950 hover:bg-teal-600 border border-slate-800 hover:border-teal-400 p-3 rounded-lg text-xs font-mono font-bold text-teal-300 transition"
                        >
                          {fullNote}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex justify-center items-end gap-1 pt-4 h-36 bg-slate-950 rounded-xl p-2 border border-slate-800">
                    {['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'].map(note => {
                      const isSharp = note.includes('#');
                      const fullNote = `${note}${selectedOctave}`;
                      return (
                        <button
                          key={note}
                          onClick={() => playPitchNote(fullNote)}
                          className={`flex-1 rounded-b text-[10px] font-bold font-mono transition ${
                            isSharp
                              ? 'bg-slate-800 text-amber-300 h-20 border border-slate-700 z-10'
                              : 'bg-slate-100 text-slate-900 h-28 hover:bg-teal-200'
                          }`}
                        >
                          {note}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {studentTab === 'fva' && (
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl space-y-6 max-w-2xl mx-auto">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <h3 className="text-lg font-bold text-teal-400">📖 FVA Terms</h3>
                <div className="flex gap-2">
                  <button onClick={() => setFvaMode('study')} className={`px-3 py-1 rounded text-xs font-bold ${fvaMode === 'study' ? 'bg-teal-600 text-white' : 'bg-slate-800 text-slate-400'}`}>Study Flashcards</button>
                  <button onClick={() => setFvaMode('quiz')} className={`px-3 py-1 rounded text-xs font-bold ${fvaMode === 'quiz' ? 'bg-teal-600 text-white' : 'bg-slate-800 text-slate-400'}`}>Multiple Choice Quiz</button>
                </div>
              </div>

              {fvaMode === 'study' ? (
                <div className="text-center space-y-4">
                  <div
                    onClick={() => setIsCardFlipped(!isCardFlipped)}
                    className="h-48 bg-slate-950 border border-teal-500/50 rounded-2xl flex flex-col justify-center items-center p-6 cursor-pointer"
                  >
                    <span className="text-[10px] uppercase font-bold text-teal-400 mb-2">{isCardFlipped ? 'Definition' : 'FVA Term (Click to Flip)'}</span>
                    <h4 className="text-2xl font-extrabold text-white">{isCardFlipped ? FVA_TERMS[fvaCardIndex].def : FVA_TERMS[fvaCardIndex].term}</h4>
                  </div>
                  <div className="flex justify-between items-center">
                    <button onClick={() => { setIsCardFlipped(false); setFvaCardIndex((fvaCardIndex - 1 + FVA_TERMS.length) % FVA_TERMS.length); }} className="bg-slate-800 px-4 py-2 rounded text-xs font-bold">← Previous</button>
                    <span className="text-xs text-slate-400">{fvaCardIndex + 1} of {FVA_TERMS.length}</span>
                    <button onClick={() => { setIsCardFlipped(false); setFvaCardIndex((fvaCardIndex + 1) % FVA_TERMS.length); }} className="bg-slate-800 px-4 py-2 rounded text-xs font-bold">Next →</button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 text-center">
                  <div className="flex justify-between text-xs font-mono bg-slate-950 p-2 rounded">
                    <span>Attempts: {fvaAttempts}</span>
                    <span className="text-teal-400 font-bold">Score: {fvaScore} / {fvaAttempts}</span>
                  </div>

                  {fvaFeedback && <p className="text-xs font-bold text-teal-300">{fvaFeedback}</p>}

                  <div className="p-6 bg-slate-950 rounded-xl border border-slate-800 space-y-4">
                    <p className="text-sm font-bold text-white">What is the definition of "{FVA_TERMS[fvaCurrentQuestionIndex].term}"?</p>
                    <div className="grid grid-cols-1 gap-2">
                      {FVA_TERMS.map((t, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleFvaQuizAnswer(idx)}
                          className="bg-slate-800 hover:bg-teal-600 p-2.5 rounded text-xs text-left text-white"
                        >
                          {t.def}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {studentTab === 'eartraining' && (
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl space-y-6 max-w-xl mx-auto text-center">
              <h3 className="text-lg font-bold text-teal-400">👂 Ear Training Studio</h3>

              <div className="flex justify-between text-xs font-mono bg-slate-950 p-3 rounded border border-slate-800">
                <span>Total Attempts: {earAttempts}</span>
                <span className="text-teal-400 font-bold">Score: {earScore} / {earAttempts}</span>
              </div>

              {earFeedback && <p className="text-xs font-bold text-teal-300">{earFeedback}</p>}

              <button onClick={playEarPrompt} className="bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs px-6 py-3 rounded-xl shadow-lg">
                🔊 Play Prompt (Slow Melodic ➔ Harmonic)
              </button>

              <div className="p-6 bg-slate-950 rounded-xl border border-slate-800 space-y-4">
                <p className="text-sm font-semibold text-white">Identify the interval played above:</p>
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

          {studentTab === 'absences' && <AbsenceRequestModule />}
        </div>
      )}
    </div>
  );
}
