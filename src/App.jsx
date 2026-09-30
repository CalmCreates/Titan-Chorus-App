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

// RISER SECTIONS WITH COLOR THEMES
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
  "C4": 261.63, "C#4": 277.18, "D4": 293.66, "D#4": 311.13, "E4": 329.63,
  "F4": 349.23, "F#4": 369.99, "G4": 392.00, "G#4": 415.30, "A4": 440.00,
  "A#4": 466.16, "B4": 493.88, "C5": 523.25
};

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // VIEW MODE & NAVIGATION
  const [viewMode, setViewMode] = useState('director');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [passUpdateMsg, setPassUpdateMsg] = useState('');

  const [directorTab, setDirectorTab] = useState('welcome');
  const [studentTab, setStudentTab] = useState('home');

  // DATA STATES
  const [students, setStudents] = useState([]);
  const [eventsList, setEventsList] = useState([]);
  const [budgetTransactions, setBudgetTransactions] = useState([]);
  const [startingBudget, setStartingBudget] = useState(0);

  // RISER STATE
  const [riserAssignments, setRiserAssignments] = useState({});
  const [riserDisplayView, setRiserDisplayView] = useState('full'); // 'full' or 'section'
  const [selectedRiserSection, setSelectedRiserSection] = useState('A');

  // FVA TERMS STATE
  const [fvaMode, setFvaMode] = useState('study'); // 'study' or 'quiz'
  const [fvaCardIndex, setFvaCardIndex] = useState(0);
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [fvaQuizScore, setFvaQuizScore] = useState(0);
  const [fvaQuizQuestion, setFvaQuizQuestion] = useState(1);

  // EAR TRAINING STATE
  const [earMode, setEarMode] = useState('intervals'); // 'intervals' or 'chords'
  const [earSubMode, setEarSubMode] = useState('quiz'); // 'study' or 'quiz'
  const [earScore, setEarScore] = useState(0);
  const [earQuestionCount, setEarQuestionCount] = useState(1);
  const [currentPrompt, setCurrentPrompt] = useState({ root: 'C4', target: 'G4', type: 'Interval: Perfect 5th' });

  // METRONOME & PITCH STATE
  const [bpm, setBpm] = useState(100);
  const [isMetronomePlaying, setIsMetronomePlaying] = useState(false);
  const metronomeTimer = useRef(null);
  const audioCtxRef = useRef(null);

  // BUDGET FORM STATE
  const [transDate, setTransDate] = useState(new Date().toISOString().split('T')[0]);
  const [transCategory, setTransCategory] = useState('Dues');
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

  // AUDIO PROMPT: MELODICALLY SLOWLY, THEN HARMONICALLY TOGETHER
  const playAudioPrompt = () => {
    if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    const ctx = audioCtxRef.current;

    const rootFreq = NOTE_FREQS[currentPrompt.root] || 261.63;
    const targetFreq = NOTE_FREQS[currentPrompt.target] || 392.00;

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

  // GET DYNAMIC SEAT ASSIGNMENT FOR STUDENT OR DIRECTOR
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

      {/* MAIN CONTAINER */}
      {(role === 'director' && viewMode === 'director') ? (
        <div className="space-y-6">
          <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3">
            {[
              { id: 'welcome', label: '🏠 Welcome Hub' },
              { id: 'risers', label: '🎶 Stage Riser Map (Full & Section View)' },
              { id: 'fva', label: '📖 FVA Study & Test' },
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

          {/* COLOR-CODED RISER MAP WITH FULL STAGE & SECTION VIEWS */}
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
                <div className="space-y-4">
                  <p className="text-xs text-slate-400 text-center">Full Stage Layout: Risers A–F, Overflow G, and Floor Level</p>
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

          {/* FVA STUDY TERMS WITH FLASHCARDS & QUIZ */}
          {directorTab === 'fva' && (
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl space-y-6 max-w-2xl mx-auto">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <h3 className="text-lg font-bold text-teal-400">📖 FVA Study & Test Studio</h3>
                <div className="flex gap-2">
                  <button onClick={() => setFvaMode('study')} className={`px-3 py-1 rounded text-xs font-bold ${fvaMode === 'study' ? 'bg-teal-600 text-white' : 'bg-slate-800 text-slate-400'}`}>Study Flashcards</button>
                  <button onClick={() => setFvaMode('quiz')} className={`px-3 py-1 rounded text-xs font-bold ${fvaMode === 'quiz' ? 'bg-teal-600 text-white' : 'bg-slate-800 text-slate-400'}`}>Multiple Choice Quiz</button>
                </div>
              </div>

              {fvaMode === 'study' ? (
                <div className="text-center space-y-4">
                  <div
                    onClick={() => setIsCardFlipped(!isCardFlipped)}
                    className="h-48 bg-slate-950 border border-teal-500/50 rounded-2xl flex flex-col justify-center items-center p-6 cursor-pointer transition transform hover:scale-105 shadow-xl"
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
                    <span>Question {fvaQuizQuestion} / 8</span>
                    <span className="text-teal-400 font-bold">Score: {fvaQuizScore}</span>
                  </div>
                  <div className="p-6 bg-slate-950 rounded-xl border border-slate-800 space-y-4">
                    <p className="text-sm font-bold text-white">What is the definition of "{FVA_TERMS[fvaQuizQuestion - 1].term}"?</p>
                    <div className="grid grid-cols-1 gap-2">
                      {FVA_TERMS.map((t, idx) => (
                        <button key={idx} onClick={() => { if (idx === fvaQuizQuestion - 1) setFvaQuizScore(fvaQuizScore + 1); if (fvaQuizQuestion < 8) setFvaQuizQuestion(fvaQuizQuestion + 1); else alert('Quiz Done!'); }} className="bg-slate-800 hover:bg-teal-600 p-2.5 rounded text-xs text-left font-semibold text-white transition">
                          {t.def}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* EAR TRAINING STUDIO WITH REPLAY & SLOW MELODIC THEN HARMONIC SOUNDS */}
          {directorTab === 'eartraining' && (
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl space-y-6 max-w-xl mx-auto text-center">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <h3 className="text-lg font-bold text-teal-400">👂 Ear Training Studio</h3>
                <div className="flex gap-2">
                  <button onClick={() => setEarSubMode('study')} className={`px-3 py-1 rounded text-xs font-bold ${earSubMode === 'study' ? 'bg-teal-600 text-white' : 'bg-slate-800 text-slate-400'}`}>Study Mode</button>
                  <button onClick={() => setEarSubMode('quiz')} className={`px-3 py-1 rounded text-xs font-bold ${earSubMode === 'quiz' ? 'bg-teal-600 text-white' : 'bg-slate-800 text-slate-400'}`}>Quiz Mode</button>
                </div>
              </div>

              <div className="space-y-4">
                <button onClick={playAudioPrompt} className="bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs px-6 py-3 rounded-xl shadow-lg">
                  🔊 Play Prompt (Slow Melodic ➔ Harmonic)
                </button>

                <div className="p-6 bg-slate-950 rounded-xl border border-slate-800 space-y-4">
                  <p className="text-sm font-semibold text-white">Identify the prompt played above:</p>
                  <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => alert('Correct!')} className="bg-slate-800 hover:bg-teal-600 p-3 rounded text-xs font-bold text-white">Perfect 5th</button>
                    <button onClick={() => alert('Try again')} className="bg-slate-800 hover:bg-teal-600 p-3 rounded text-xs font-bold text-white">Major 3rd</button>
                    <button onClick={() => alert('Try again')} className="bg-slate-800 hover:bg-teal-600 p-3 rounded text-xs font-bold text-white">Minor 7th</button>
                    <button onClick={() => alert('Try again')} className="bg-slate-800 hover:bg-teal-600 p-3 rounded text-xs font-bold text-white">Diminished Triad</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {directorTab === 'absences' && <AbsenceRequestModule />}
        </div>
      ) : (
        /* STUDENT VIEW OR DIRECTOR STUDENT PREVIEW */
        <div className="space-y-6 max-w-4xl mx-auto">
          {/* STUDENT ASSIGNED SEAT BANNER */}
          <div className="bg-teal-950/80 border border-teal-500/60 p-6 rounded-xl space-y-1">
            <span className="text-[10px] uppercase font-bold text-teal-400 block tracking-wider">Your Live Assigned Riser Spot</span>
            <h2 className="text-xl font-bold text-white">📍 {getAssignedSeatText()}</h2>
            <p className="text-xs text-slate-300">Ensemble: {currentUser.ensemble} • Voice Part: {currentUser.voice_part}</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl space-y-4">
            <h3 className="text-sm font-bold text-teal-400 uppercase">📅 Titan Chorus Calendar</h3>
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
    </div>
  );
}
