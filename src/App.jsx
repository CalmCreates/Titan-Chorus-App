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
  { term: "Diminuendo / Decrescendo", def: "Gradually getting softer." },
  { term: "Fermata", def: "Hold the note or rest longer than its written value." }
];

// RISER CONFIGURATION: Risers A through F, Overflow Riser G, and Floor Spots
const RISER_SECTIONS = [
  { id: 'A', name: 'Riser A (Far Left)', rows: [4, 3, 2, 1] },
  { id: 'B', name: 'Riser B (Left Center)', rows: [4, 3, 2, 1] },
  { id: 'C', name: 'Riser C (Center Left)', rows: [4, 3, 2, 1] },
  { id: 'D', name: 'Riser D (Center Right)', rows: [4, 3, 2, 1] },
  { id: 'E', name: 'Riser E (Right Center)', rows: [4, 3, 2, 1] },
  { id: 'F', name: 'Riser F (Far Right)', rows: [4, 3, 2, 1] },
  { id: 'G', name: 'Riser G (Overflow)', rows: [4, 3, 2, 1] },
  { id: 'FLOOR', name: 'Floor Level (In Front of Risers)', rows: [1] }
];

// PITCH WHEEL NOTE FREQUENCIES (C2 to C5)
const NOTE_FREQS = {
  "C2": 65.41, "C#2": 69.30, "D2": 73.42, "D#2": 77.78, "E2": 82.41, "F2": 87.31, "F#2": 92.50, "G2": 98.00, "G#2": 103.83, "A2": 110.00, "A#2": 116.54, "B2": 123.47,
  "C3": 130.81, "C#3": 138.59, "D3": 146.83, "D#3": 155.56, "E3": 164.81, "F3": 174.61, "F#3": 185.00, "G3": 196.00, "G#3": 207.65, "A3": 220.00, "A#3": 233.08, "B3": 246.94,
  "C4": 261.63, "C#4": 277.18, "D4": 293.66, "D#4": 311.13, "E4": 329.63, "F4": 349.23, "F#4": 369.99, "G4": 392.00, "G#4": 415.30, "A4": 440.00, "A#4": 466.16, "B4": 493.88,
  "C5": 523.25
};

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // DIRECTOR / STUDENT MODE TOGGLE
  const [viewMode, setViewMode] = useState('director');

  // PASSWORD CHANGE MODAL
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [passUpdateMsg, setPassUpdateMsg] = useState('');

  // TABS
  const [directorTab, setDirectorTab] = useState('welcome');
  const [clcTab, setClcTab] = useState('attendance');
  const [studentTab, setStudentTab] = useState('home');

  // DATA STATES
  const [students, setStudents] = useState([]);
  const [eventsList, setEventsList] = useState([]);
  const [budgetTransactions, setBudgetTransactions] = useState([]);
  const [startingBudget, setStartingBudget] = useState(0);
  const [newStartingBudget, setNewStartingBudget] = useState('');

  // RISER STATE (Key: "SECTION-ROW-SPOT", Value: student_id)
  const [riserAssignments, setRiserAssignments] = useState({
    "C-R3-S2": "S101" // Example initial assignment for testing
  });
  const [selectedRiserSection, setSelectedRiserSection] = useState('A');

  // EAR TRAINING QUIZ STATE
  const [quizScore, setQuizScore] = useState(0);
  const [quizQuestionCount, setQuizQuestionCount] = useState(1);
  const [showCelebrationModal, setShowCelebrationModal] = useState(false);

  // METRONOME STATE
  const [bpm, setBpm] = useState(100);
  const [isMetronomePlaying, setIsMetronomePlaying] = useState(false);
  const metronomeTimer = useRef(null);

  // PITCH WHEEL / KEYBOARD STATE
  const [selectedOctave, setSelectedOctave] = useState(4);
  const [pitchViewMode, setPitchViewMode] = useState('wheel'); // 'wheel' or 'keyboard'
  const audioCtxRef = useRef(null);

  // FINANCIAL FORM STATE
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

  // METRONOME AUDIO TICK LOGIC
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
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
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
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
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

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPassUpdateMsg('');
    try {
      const res = await fetch(`${API_BASE}/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: currentUser.student_id,
          old_password: oldPass,
          new_password: newPass
        })
      });
      const data = await res.json();
      if (data.success) {
        setPassUpdateMsg('✅ Password updated successfully!');
        setOldPass('');
        setNewPass('');
      } else {
        setPassUpdateMsg(`❌ ${data.message}`);
      }
    } catch (e) {
      setPassUpdateMsg('❌ Error changing password.');
    }
  };

  const handleRoleChange = async (studentId, newRole) => {
    try {
      await fetch(`${API_BASE}/students/role`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ student_id: studentId, role: newRole })
      });
      fetchStudents();
    } catch (e) { console.error(e); }
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

  const handleAutoAssignRiser = () => {
    const unassigned = students.filter(s => s.role !== 'director' && !Object.values(riserAssignments).includes(s.student_id));
    const newAssignments = { ...riserAssignments };

    let studentIndex = 0;
    ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'FLOOR'].forEach(secId => {
      [4, 3, 2, 1].forEach(rowNum => {
        for (let spot = 1; spot <= 4; spot++) {
          if (studentIndex >= unassigned.length) return;
          const key = `${secId}-R${rowNum}-S${spot}`;
          if (!newAssignments[key]) {
            newAssignments[key] = unassigned[studentIndex].student_id;
            studentIndex++;
          }
        }
      });
    });

    setRiserAssignments(newAssignments);
  };

  const handleQuizAnswer = (isCorrect) => {
    const newScore = isCorrect ? quizScore + 1 : quizScore;
    setQuizScore(newScore);

    if (quizQuestionCount >= 20) {
      if (newScore === 20) {
        setShowCelebrationModal(true);
      } else {
        alert(`Quiz Finished! Final Score: ${newScore}/20`);
      }
      setQuizQuestionCount(1);
      setQuizScore(0);
    } else {
      setQuizQuestionCount(prev => prev + 1);
    }
  };

  // FIND ASSIGNED SEAT FOR LOGGED IN STUDENT
  const getStudentAssignedSeat = () => {
    if (!currentUser) return null;
    const foundEntry = Object.entries(riserAssignments).find(([_, id]) => id === currentUser.student_id);
    if (!foundEntry) return null;

    const [key] = foundEntry;
    const [sec, row, spot] = key.split('-');
    const sectionName = RISER_SECTIONS.find(s => s.id === sec)?.name || sec;
    const rowNum = row.replace('R', '');
    const spotNum = spot.replace('S', '');

    return `${sectionName}, Row ${rowNum}, Spot #${spotNum}`;
  };

  const getDailyWarmups = () => {
    const today = new Date();
    const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
    const index1 = dayOfYear % WARMUP_BANK.length;
    const index2 = (dayOfYear + 2) % WARMUP_BANK.length;
    const index3 = (dayOfYear + 4) % WARMUP_BANK.length;
    return [WARMUP_BANK[index1], WARMUP_BANK[index2], WARMUP_BANK[index3]];
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
          className="bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold px-4 py-2 rounded-lg transition inline-flex items-center gap-1 shadow"
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
          <div className="mb-6">
            <img
              src="/Olympia Titan Chorus 26 Logo - 3.PNG"
              alt="Olympia Logo"
              className="w-28 h-28 mx-auto rounded-full border-2 border-teal-400 shadow-xl object-cover bg-slate-950 mb-3"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
            <h1 className="text-2xl font-bold text-teal-400">Olympia High School</h1>
            <h2 className="text-xl font-semibold text-slate-200">Titan Chorus Hub</h2>
            <p className="text-xs text-slate-400 mt-1">Director: Cesar Lengua-Miranda</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 text-left">
            <div>
              <label className="block text-xs uppercase font-bold text-slate-400 mb-1">Student ID / Admin</label>
              <input
                type="text"
                required
                placeholder="Student ID or ADMIN"
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-teal-400"
              />
            </div>

            <div>
              <label className="block text-xs uppercase font-bold text-slate-400 mb-1">Password</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-teal-400"
              />
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-950/80 border border-rose-500 rounded-lg text-rose-200 text-xs text-center font-semibold">
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full bg-teal-600 hover:bg-teal-500 text-white font-bold py-2.5 rounded-lg transition shadow-md"
            >
              {isLoggingIn ? 'Connecting...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  const role = currentUser.role;
  const assignedSeatText = getStudentAssignedSeat();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
      {/* HEADER WITH MODE SWITCH */}
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
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition flex items-center gap-1.5 ${
                viewMode === 'director' ? 'bg-amber-600 text-white border-amber-400' : 'bg-slate-800 text-slate-300 border-slate-700'
              }`}
            >
              🔄 Mode: {viewMode === 'director' ? '👑 Director' : '🎓 Student Preview'}
            </button>
          )}

          <button onClick={() => setShowPasswordModal(true)} className="bg-slate-800 border border-slate-700 text-xs text-slate-200 px-3 py-2 rounded-lg">🔑 Password</button>
          <button onClick={() => setCurrentUser(null)} className="bg-rose-950 border border-rose-800 text-xs text-rose-200 px-3 py-2 rounded-lg">Sign Out</button>
        </div>
      </header>

      {/* CELEBRATION MODAL (BLUE PENGUIN + CONFETTI) */}
      {showCelebrationModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-teal-500 p-8 rounded-2xl max-w-sm w-full text-center space-y-4 shadow-2xl">
            <img
              src="image_agent_tag_17732973670649559727"
              alt="Blue Penguin Mascot Celebrating"
              className="w-32 h-32 mx-auto object-contain animate-bounce"
            />
            <h2 className="text-2xl font-extrabold text-teal-300">PERFECT 20/20 SCORE!</h2>
            <p className="text-xs text-slate-300">Incredible ear training accuracy! You mastered every interval and chord quality!</p>
            <button
              onClick={() => setShowCelebrationModal(false)}
              className="w-full bg-teal-600 hover:bg-teal-500 text-white font-bold py-2 rounded-lg text-xs"
            >
              Continue Practice
            </button>
          </div>
        </div>
      )}

      {/* DIRECTOR VIEW */}
      {role === 'director' && viewMode === 'director' && (
        <div>
          <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3 mb-6">
            {[
              { id: 'welcome', label: '🏠 Welcome Hub' },
              { id: 'risers', label: '🎶 Riser Charts (A-F, G & Floor)' },
              { id: 'fva', label: '📖 FVA Terms' },
              { id: 'eartraining', label: '👂 Ear Training' },
              { id: 'absences', label: '📝 Absence Requests' },
              { id: 'budget', label: '💰 Program Finances' },
              { id: 'roster', label: '📋 Roster & Roles' }
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setDirectorTab(t.id)}
                className={`px-4 py-2 rounded-lg text-xs font-bold border transition ${
                  directorTab === t.id ? 'bg-teal-600 text-white border-teal-400' : 'bg-slate-900 text-slate-400 border-slate-800'
                }`}
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
                <h3 className="text-sm font-bold text-teal-400 uppercase tracking-wider">🎶 Today's Daily Vocal Warm-Up Routine</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {getDailyWarmups().map((w, idx) => (
                    <div key={idx} className="bg-slate-950 p-4 rounded-xl border border-teal-900/40 space-y-2">
                      <span className="text-[10px] uppercase font-extrabold text-teal-400 bg-teal-950 px-2 py-0.5 rounded">Exercise #{idx + 1}</span>
                      <h4 className="font-bold text-white text-sm">{w.title}</h4>
                      <p className="text-xs text-slate-300 leading-relaxed">{w.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl space-y-4">
                <h3 className="text-sm font-bold text-teal-400 uppercase tracking-wider">📅 Titan Chorus Calendar</h3>
                <div className="w-full h-[600px] bg-slate-950 rounded-xl overflow-hidden border border-slate-800">
                  <iframe
                    src="https://calendar.google.com/calendar/embed?src=c_54746e83b58761dc633c39e40e6dd52b622aa84c89efc6669e5b8081f47fdf60%40group.calendar.google.com&ctz=America%2FNew_York"
                    style={{ border: 0, width: '100%', height: '100%' }}
                    frameBorder="0"
                    scrolling="no"
                    title="Titan Chorus Calendar"
                  />
                </div>
              </div>
            </div>
          )}

          {/* INTERACTIVE CHORAL RISERS TAB */}
          {directorTab === 'risers' && (
            <div className="space-y-6">
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl space-y-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-teal-400">🎶 Interactive Riser Chart Layout</h3>
                    <p className="text-xs text-slate-400">Organize rosters across Risers A–F, Overflow Riser G, and Floor Spots.</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={handleAutoAssignRiser} className="bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs px-3 py-2 rounded-lg">⚡ Auto-Fill Unassigned</button>
                    <button onClick={() => setRiserAssignments({})} className="bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800 font-bold text-xs px-3 py-2 rounded-lg">Reset Layout</button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3">
                  {RISER_SECTIONS.map(sec => (
                    <button
                      key={sec.id}
                      onClick={() => setSelectedRiserSection(sec.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition ${
                        selectedRiserSection === sec.id ? 'bg-amber-600 text-white border-amber-400' : 'bg-slate-950 text-slate-400 border-slate-800'
                      }`}
                    >
                      {sec.name}
                    </button>
                  ))}
                </div>

                <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 space-y-4">
                  <h4 className="text-xs font-bold text-amber-400 uppercase">
                    Currently Viewing: {RISER_SECTIONS.find(s => s.id === selectedRiserSection)?.name}
                  </h4>

                  <div className="space-y-3">
                    {[4, 3, 2, 1].map(rowNum => {
                      if (selectedRiserSection === 'FLOOR' && rowNum > 1) return null;
                      return (
                        <div key={rowNum} className="flex items-center gap-3">
                          <span className="text-[10px] uppercase font-mono font-bold text-slate-500 w-16">
                            {selectedRiserSection === 'FLOOR' ? 'FLOOR' : `ROW ${rowNum}`}
                          </span>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 flex-1">
                            {[1, 2, 3, 4].map(spotNum => {
                              const spotKey = `${selectedRiserSection}-R${rowNum}-S${spotNum}`;
                              const assignedStudentId = riserAssignments[spotKey];
                              const assignedStudent = students.find(s => s.student_id === assignedStudentId);

                              return (
                                <div key={spotNum} className="bg-slate-900 border border-slate-800 p-2 rounded-lg space-y-1">
                                  <div className="flex justify-between items-center text-[10px] font-mono text-slate-500">
                                    <span>Spot #{spotNum}</span>
                                    {assignedStudent && <span className="text-teal-400 font-bold">{assignedStudent.voice_part}</span>}
                                  </div>
                                  <select
                                    value={assignedStudentId || ''}
                                    onChange={(e) => handleAssignSpot(spotKey, e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-700 text-xs text-white p-1 rounded"
                                  >
                                    <option value="">-- Empty Spot --</option>
                                    {students.filter(s => s.role !== 'director').map(s => (
                                      <option key={s.student_id} value={s.student_id}>{s.name} ({s.student_id})</option>
                                    ))}
                                  </select>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {directorTab === 'fva' && (
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl space-y-4">
              <h3 className="text-lg font-bold text-teal-400">📖 Florida Vocal Association (FVA) Study Glossary</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {FVA_TERMS.map((item, idx) => (
                  <div key={idx} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
                    <span className="font-bold text-teal-300 text-sm">{item.term}</span>
                    <p className="text-xs text-slate-300">{item.def}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {directorTab === 'eartraining' && (
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl space-y-4 max-w-xl mx-auto text-center">
              <h3 className="text-lg font-bold text-teal-400">👂 Ear Training: Intervals & Chord Quality</h3>
              <div className="flex justify-between items-center bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs font-mono">
                <span>Question: {quizQuestionCount} / 20</span>
                <span className="text-teal-400 font-bold">Current Score: {quizScore}</span>
              </div>
              <div className="p-6 bg-slate-950 rounded-xl border border-slate-800 space-y-4">
                <p className="text-sm font-semibold text-white">Identify the played interval/chord quality:</p>
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => handleQuizAnswer(true)} className="bg-slate-800 hover:bg-teal-600 border border-slate-700 p-3 rounded-lg text-xs font-bold text-white transition">Major 3rd</button>
                  <button onClick={() => handleQuizAnswer(false)} className="bg-slate-800 hover:bg-teal-600 border border-slate-700 p-3 rounded-lg text-xs font-bold text-white transition">Perfect 5th</button>
                  <button onClick={() => handleQuizAnswer(false)} className="bg-slate-800 hover:bg-teal-600 border border-slate-700 p-3 rounded-lg text-xs font-bold text-white transition">Minor 7th</button>
                  <button onClick={() => handleQuizAnswer(false)} className="bg-slate-800 hover:bg-teal-600 border border-slate-700 p-3 rounded-lg text-xs font-bold text-white transition">Diminished Triad</button>
                </div>
              </div>
            </div>
          )}

          {directorTab === 'absences' && <AbsenceRequestModule />}

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

          {directorTab === 'roster' && (
            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 space-y-4">
              <h3 className="text-lg font-bold text-teal-400">📋 Roster & Student Dues Balance</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 uppercase">
                      <th className="py-2 px-2">ID</th>
                      <th className="py-2 px-2">Name</th>
                      <th className="py-2 px-2">Ensemble</th>
                      <th className="py-2 px-2">Role</th>
                      <th className="py-2 px-2">Total Dues Recorded</th>
                      <th className="py-2 px-2">Access Role Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {students.filter(s => s.role !== 'director').map((s) => (
                      <tr key={s.student_id}>
                        <td className="py-2 px-2 font-mono text-teal-400">{s.student_id}</td>
                        <td className="py-2 px-2 font-bold text-white">{s.name}</td>
                        <td className="py-2 px-2 text-slate-300">{s.ensemble}</td>
                        <td className="py-2 px-2 uppercase font-bold text-xs">
                          <span className={s.role === 'clc' ? 'text-amber-400' : s.role === 'alumni' ? 'text-indigo-400' : 'text-slate-400'}>
                            {s.role}
                          </span>
                        </td>
                        <td className="py-2 px-2 font-mono font-bold text-emerald-400">
                          ${(s.dues_paid_amount || 0).toFixed(2)}
                        </td>
                        <td className="py-2 px-2 space-x-2">
                          <button onClick={() => handleRoleChange(s.student_id, 'clc')} className="bg-amber-950 text-amber-300 px-2 py-1 rounded text-[10px] font-bold">Set CLC</button>
                          <button onClick={() => handleRoleChange(s.student_id, 'student')} className="bg-slate-800 text-slate-300 px-2 py-1 rounded text-[10px]">Set Student</button>
                          <button onClick={() => handleRoleChange(s.student_id, 'alumni')} className="bg-indigo-950 text-indigo-300 px-2 py-1 rounded text-[10px] font-bold">Graduate</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* REGULAR STUDENT VIEW OR DIRECTOR STUDENT PREVIEW MODE */}
      {(role === 'student' || (role === 'director' && viewMode === 'student')) && (
        <div className="space-y-6 max-w-4xl mx-auto">
          <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3">
            <button onClick={() => setStudentTab('home')} className={`px-4 py-2 rounded-lg text-xs font-bold ${studentTab === 'home' ? 'bg-teal-600 text-white' : 'bg-slate-900 text-slate-400'}`}>🏠 Home & Riser Seat</button>
            <button onClick={() => setStudentTab('tools')} className={`px-4 py-2 rounded-lg text-xs font-bold ${studentTab === 'tools' ? 'bg-teal-600 text-white' : 'bg-slate-900 text-slate-400'}`}>🎹 Pitch Pipe & Metronome</button>
            <button onClick={() => setStudentTab('fva')} className={`px-4 py-2 rounded-lg text-xs font-bold ${studentTab === 'fva' ? 'bg-teal-600 text-white' : 'bg-slate-900 text-slate-400'}`}>📖 FVA Terms</button>
            <button onClick={() => setStudentTab('eartraining')} className={`px-4 py-2 rounded-lg text-xs font-bold ${studentTab === 'eartraining' ? 'bg-teal-600 text-white' : 'bg-slate-900 text-slate-400'}`}>👂 Ear Training</button>
            <button onClick={() => setStudentTab('absences')} className={`px-4 py-2 rounded-lg text-xs font-bold ${studentTab === 'absences' ? 'bg-teal-600 text-white' : 'bg-slate-900 text-slate-400'}`}>📝 Absence Form</button>
          </div>

          {/* HOME TAB WITH STUDENT RISER SEAT BANNER & GOOGLE CALENDAR */}
          {studentTab === 'home' && (
            <div className="space-y-6">
              {/* DYNAMIC STUDENT RISER POSITION BANNER */}
              <div className="bg-teal-950/80 border border-teal-500/60 p-6 rounded-xl space-y-2">
                <span className="text-[10px] uppercase font-bold text-teal-400 block tracking-wider">Your Assigned Riser Spot</span>
                <h2 className="text-xl font-bold text-white">
                  {assignedSeatText ? `📍 ${assignedSeatText}` : '📍 Standing Assignment: Julia Brown, Riser C Row 3 Left Center'}
                </h2>
                <p className="text-xs text-slate-300">Ensemble: {currentUser.ensemble} • Voice Part: {currentUser.voice_part}</p>
              </div>

              {/* STUDENT GOOGLE CALENDAR */}
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl space-y-4">
                <h3 className="text-sm font-bold text-teal-400 uppercase tracking-wider">📅 Chorus Performance & Practice Calendar</h3>
                <div className="w-full h-[550px] bg-slate-950 rounded-xl overflow-hidden border border-slate-800">
                  <iframe
                    src="https://calendar.google.com/calendar/embed?src=c_54746e83b58761dc633c39e40e6dd52b622aa84c89efc6669e5b8081f47fdf60%40group.calendar.google.com&ctz=America%2FNew_York"
                    style={{ border: 0, width: '100%', height: '100%' }}
                    frameBorder="0"
                    scrolling="no"
                    title="Student Titan Chorus Calendar"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STUDENT PITCH PIPE WHEEL & WORKING METRONOME TAB */}
          {studentTab === 'tools' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* WORKING AUDIO METRONOME */}
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
                    isMetronomePlaying ? 'bg-rose-600 hover:bg-rose-500 text-white' : 'bg-teal-600 hover:bg-teal-500 text-white'
                  }`}
                >
                  {isMetronomePlaying ? '⏹️ Stop Metronome' : '▶️ Start Metronome'}
                </button>
              </div>

              {/* CHROMATIC PITCH PIPE WHEEL & KEYBOARD (C2 - C5) */}
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl space-y-4 text-center">
                <div className="flex justify-between items-center">
                  <h3 className="text-md font-bold text-teal-400 uppercase">🎵 Pitch Pipe Tool</h3>
                  <button
                    onClick={() => setPitchViewMode(pitchViewMode === 'wheel' ? 'keyboard' : 'wheel')}
                    className="bg-slate-800 hover:bg-slate-700 text-xs px-2.5 py-1 rounded text-slate-300 font-bold border border-slate-700"
                  >
                    Switch to {pitchViewMode === 'wheel' ? '🎹 Keyboard' : '🎡 Pitch Wheel'}
                  </button>
                </div>

                {/* OCTAVE SELECTOR */}
                <div className="flex justify-center gap-2">
                  {[2, 3, 4, 5].map(oct => (
                    <button
                      key={oct}
                      onClick={() => setSelectedOctave(oct)}
                      className={`px-3 py-1 rounded text-xs font-bold border ${
                        selectedOctave === oct ? 'bg-amber-600 text-white border-amber-400' : 'bg-slate-950 text-slate-400 border-slate-800'
                      }`}
                    >
                      Octave {oct}
                    </button>
                  ))}
                </div>

                {/* WHEEL VIEW */}
                {pitchViewMode === 'wheel' && (
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
                )}

                {/* KEYBOARD VIEW */}
                {pitchViewMode === 'keyboard' && (
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
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl space-y-4">
              <h3 className="text-lg font-bold text-teal-400">📖 FVA Study Glossary</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {FVA_TERMS.map((item, idx) => (
                  <div key={idx} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
                    <span className="font-bold text-teal-300 text-sm">{item.term}</span>
                    <p className="text-xs text-slate-300">{item.def}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {studentTab === 'eartraining' && (
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl space-y-4 max-w-xl mx-auto text-center">
              <h3 className="text-lg font-bold text-teal-400">👂 Ear Training Practice</h3>
              <div className="flex justify-between items-center bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs font-mono">
                <span>Question: {quizQuestionCount} / 20</span>
                <span className="text-teal-400 font-bold">Current Score: {quizScore}</span>
              </div>
              <div className="p-6 bg-slate-950 rounded-xl border border-slate-800 space-y-4">
                <p className="text-sm font-semibold text-white">Identify the interval/chord quality:</p>
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => handleQuizAnswer(true)} className="bg-slate-800 hover:bg-teal-600 border border-slate-700 p-3 rounded-lg text-xs font-bold text-white transition">Major 3rd</button>
                  <button onClick={() => handleQuizAnswer(false)} className="bg-slate-800 hover:bg-teal-600 border border-slate-700 p-3 rounded-lg text-xs font-bold text-white transition">Perfect 5th</button>
                  <button onClick={() => handleQuizAnswer(false)} className="bg-slate-800 hover:bg-teal-600 border border-slate-700 p-3 rounded-lg text-xs font-bold text-white transition">Minor 7th</button>
                  <button onClick={() => handleQuizAnswer(false)} className="bg-slate-800 hover:bg-teal-600 border border-slate-700 p-3 rounded-lg text-xs font-bold text-white transition">Diminished Triad</button>
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
