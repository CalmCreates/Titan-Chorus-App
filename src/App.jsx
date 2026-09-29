import React, { useState, useEffect, useRef } from 'react';

const API_BASE = "https://titan-chorus-app.onrender.com/api";

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  // Student Password Change State
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passChangeStatus, setPassChangeStatus] = useState({ type: '', msg: '' });

  // FVA Practice Hub State
  const [fvaTerms, setFvaTerms] = useState([]);
  const [termIndex, setTermIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  // Metronome & Pitch Pipe Audio Engine
  const [bpm, setBpm] = useState(100);
  const [isPlayingMetronome, setIsPlayingMetronome] = useState(false);
  const [activePitch, setActivePitch] = useState(null);
  const audioCtxRef = useRef(null);
  const metronomeTimerRef = useRef(null);

  // Director Master Roster & Riser Layout State
  const [students, setStudents] = useState([]);
  const [ensembles, setEnsembles] = useState([]);
  const [filterEnsemble, setFilterEnsemble] = useState('All');
  const [newEnsembleName, setNewEnsembleName] = useState('');
  const [editingStudent, setEditingStudent] = useState(null);
  const [overflowEnabled, setOverflowEnabled] = useState(false);

  const baseRisers = ['Riser A', 'Riser B', 'Riser C', 'Riser D', 'Riser E', 'Riser F'];
  const activeRisers = overflowEnabled ? [...baseRisers, 'Riser G'] : baseRisers;

  const baseRows = ['Row 4', 'Row 3', 'Row 2', 'Row 1'];
  const activeRows = overflowEnabled ? ['Row 4', 'Row 3', 'Row 2', 'Row 1', 'Ground'] : baseRows;

  const slots = ['Far Left', 'Center Left', 'Center Right', 'Far Right'];
  const voiceParts = ['Soprano 1', 'Soprano 2', 'Alto 1', 'Alto 2', 'Tenor 1', 'Tenor 2', 'Bass 1', 'Bass 2'];

  const upcomingEvents = [
    { date: 'Oct 6, 2026', title: 'FVA All-State Musicianship Exam Screening', location: 'Chorus Room' },
    { date: 'Oct 15, 2026', title: 'Titan Chorus Fall Concert Rehearsal', location: 'Olympia Auditorium' },
    { date: 'Oct 22, 2026', title: 'Fall Choral Showcase Performance', location: 'Olympia Main Stage' },
    { date: 'Nov 3, 2026', title: 'OCPS All-County Audition Prep', location: 'Chorus Room' }
  ];

  const pitchPipePitches = [
    { note: 'C4', freq: 261.63 },
    { note: 'C#4', freq: 277.18 },
    { note: 'D4', freq: 293.66 },
    { note: 'D#4', freq: 311.13 },
    { note: 'E4', freq: 329.63 },
    { note: 'F4', freq: 349.23 },
    { note: 'F#4', freq: 369.99 },
    { note: 'G4', freq: 392.00 },
    { note: 'G#4', freq: 415.30 },
    { note: 'A4', freq: 440.00 },
    { note: 'A#4', freq: 466.16 },
    { note: 'B4', freq: 493.88 }
  ];

  const [newStudent, setNewStudent] = useState({
    student_id: '',
    first_name: '',
    last_name: '',
    ensemble: '',
    additional_ensembles: '',
    voice_part: 'Soprano 1',
    wenger_section: 'Riser A',
    wenger_row: 'Row 1',
    wenger_slot: 'Far Left'
  });

  useEffect(() => {
    if (currentUser) {
      fetchEnsembles();
      if (currentUser.role === 'director') {
        fetchStudents();
      }
      fetchFvaTerms();
    }
  }, [currentUser]);

  const getAudioContext = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  };

  const playPitch = (freq, note) => {
    try {
      const ctx = getAudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.8);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 1.8);
      setActivePitch(note);

      setTimeout(() => setActivePitch(null), 1800);
    } catch (e) {
      console.error('Pitch Pipe Audio Error:', e);
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
          console.error('Metronome Audio Error:', e);
        }
      }, interval);
    }
  };

  useEffect(() => {
    if (isPlayingMetronome) {
      clearInterval(metronomeTimerRef.current);
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
          console.error('Metronome Audio Error:', e);
        }
      }, interval);
    }
  }, [bpm]);

  const fetchEnsembles = async () => {
    try {
      const res = await fetch(`${API_BASE}/ensembles`);
      if (res.ok) {
        const data = await res.json();
        setEnsembles(data);
        if (data.length > 0 && !newStudent.ensemble) {
          setNewStudent(prev => ({ ...prev, ensemble: data[0] }));
        }
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
        setFvaTerms(data);
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

  const handleAddEnsemble = async (e) => {
    e.preventDefault();
    if (!newEnsembleName.trim()) return;
    try {
      const res = await fetch(`${API_BASE}/ensembles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newEnsembleName.trim() })
      });
      if (res.ok) {
        setNewEnsembleName('');
        fetchEnsembles();
      }
    } catch (err) {
      alert('Failed to add ensemble.');
    }
  };

  const handleRenameEnsemble = async (oldName) => {
    const newName = window.prompt(`Rename ensemble "${oldName}" to:`, oldName);
    if (!newName || newName === oldName) return;
    try {
      const res = await fetch(`${API_BASE}/ensembles/rename`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ old_name: oldName, new_name: newName.trim() })
      });
      if (res.ok) {
        fetchEnsembles();
        fetchStudents();
      }
    } catch (err) {
      alert('Failed to rename ensemble.');
    }
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/students`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newStudent)
      });
      if (res.ok) {
        fetchStudents();
        setNewStudent({
          student_id: '',
          first_name: '',
          last_name: '',
          ensemble: ensembles[0] || '',
          additional_ensembles: '',
          voice_part: 'Soprano 1',
          wenger_section: 'Riser A',
          wenger_row: 'Row 1',
          wenger_slot: 'Far Left'
        });
      }
    } catch (err) {
      alert('Failed to add student.');
    }
  };

  const handleSaveStudentEdit = async () => {
    if (!editingStudent) return;
    try {
      const res = await fetch(`${API_BASE}/students/${editingStudent.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingStudent)
      });
      if (res.ok) {
        setEditingStudent(null);
        fetchStudents();
      }
    } catch (err) {
      alert('Failed to save student edits.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this student from roster?')) {
      await fetch(`${API_BASE}/students/${id}`, { method: 'DELETE' });
      fetchStudents();
    }
  };

  const handleDirectorResetPassword = async (studentId, studentName) => {
    const customPass = window.prompt(
      `Reset password for ${studentName} (ID: ${studentId}).\nEnter new temporary password (or leave blank for 'titan123'):`,
      'titan123'
    );
    if (customPass === null) return;

    try {
      const res = await fetch(`${API_BASE}/admin/reset-student-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: studentId,
          new_password: customPass.trim() || 'titan123'
        })
      });
      const data = await res.json();
      alert(data.message);
    } catch (err) {
      alert('Failed to reset student password.');
    }
  };

  // LOGIN SCREEN
  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100 p-4">
        <div className="bg-slate-900 border border-teal-800/60 p-8 rounded-xl shadow-2xl max-w-md w-full">
          <div className="text-center mb-6">
            <a
              href="https://www.instagram.com/olympiatitanchorus"
              target="_blank"
              rel="noreferrer"
              className="inline-block transform hover:scale-105 transition mb-3"
            >
              <img
                src="/Olympia Titan Chorus 26 Logo - 3.PNG"
                alt="Olympia Titan Chorus Crest"
                className="w-28 h-28 mx-auto rounded-full border-2 border-teal-400 shadow-xl object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </a>
            <h1 className="text-2xl font-bold text-teal-400">Olympia High School</h1>
            <h2 className="text-xl font-semibold text-slate-200">Titan Chorus Hub</h2>
            <p className="text-xs text-slate-400 mt-1">"We Strive to Touch Lives!"</p>
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

  // DIRECTOR ADMIN DASHBOARD
  if (currentUser.role === 'director') {
    const filteredRoster = filterEnsemble === 'All'
      ? students
      : students.filter(s => s.ensemble === filterEnsemble || s.additional_ensembles?.includes(filterEnsemble));

    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
        <header className="flex justify-between items-center border-b border-teal-900/60 pb-4 mb-6">
          <div className="flex items-center space-x-3">
            <a
              href="https://www.instagram.com/olympiatitanchorus"
              target="_blank"
              rel="noreferrer"
              title="Visit Titan Chorus Instagram @olympiatitanchorus"
              className="group"
            >
              <img
                src="/Olympia Titan Chorus 26 Logo - 3.PNG"
                alt="Olympia Titan Chorus Logo"
                className="w-12 h-12 rounded-full border-2 border-teal-400 shadow-md transform group-hover:scale-105 transition object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </a>
            <div>
              <h1 className="text-2xl font-bold text-teal-400">Titan Chorus Admin Portal</h1>
              <p className="text-xs text-slate-400">Signed in as: {currentUser.name} (Director)</p>
            </div>
          </div>

          <button
            onClick={() => setCurrentUser(null)}
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm px-4 py-2 rounded-lg"
          >
            Sign Out
          </button>
        </header>

        {/* QUICK TOOLS & CALENDAR WIDGET ROW */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* UPCOMING EVENTS */}
          <div className="bg-slate-900 border border-teal-900/40 p-5 rounded-xl">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-bold text-teal-400 uppercase tracking-wider">📅 Upcoming Events (Next 4 Weeks)</h3>
              <a
                href="https://calendar.google.com"
                target="_blank"
                rel="noreferrer"
                className="text-[10px] text-slate-400 hover:text-teal-300 underline"
              >
                Google Calendar ↗
              </a>
            </div>
            <div className="space-y-2">
              {upcomingEvents.map((evt, idx) => (
                <div key={idx} className="bg-slate-950 p-2.5 rounded border border-slate-800 text-xs">
                  <span className="font-semibold text-teal-300 block">{evt.date}</span>
                  <p className="text-white font-medium">{evt.title}</p>
                  <p className="text-[10px] text-slate-500">{evt.location}</p>
                </div>
              ))}
            </div>
          </div>

          {/* REHEARSAL METRONOME */}
          <div className="bg-slate-900 border border-teal-900/40 p-5 rounded-xl flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-teal-400 uppercase tracking-wider mb-2">⏱ Instant Rehearsal Metronome</h3>
              <div className="text-center my-4">
                <span className="text-4xl font-extrabold text-white font-mono">{bpm}</span>
                <span className="text-xs text-slate-400 block mt-1">BPM</span>
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
              className={`w-full py-2.5 rounded-lg font-bold text-sm transition mt-4 ${
                isPlayingMetronome ? 'bg-red-600 hover:bg-red-500 text-white' : 'bg-teal-600 hover:bg-teal-500 text-white'
              }`}
            >
              {isPlayingMetronome ? '⏹ Stop Metronome' : '▶ Start Metronome'}
            </button>
          </div>

          {/* CHROMATIC PITCH PIPE */}
          <div className="bg-slate-900 border border-teal-900/40 p-5 rounded-xl">
            <h3 className="text-sm font-bold text-teal-400 uppercase tracking-wider mb-3">🎵 Chromatic Pitch Pipe</h3>
            <p className="text-[11px] text-slate-400 mb-3">Click any pitch syllable to play vocal reference frequency:</p>
            <div className="grid grid-cols-4 gap-2">
              {pitchPipePitches.map((p) => (
                <button
                  key={p.note}
                  onClick={() => playPitch(p.freq, p.note)}
                  className={`py-2 rounded font-mono font-bold text-xs transition border ${
                    activePitch === p.note
                      ? 'bg-teal-500 text-slate-950 border-white scale-105'
                      : 'bg-slate-800 text-slate-200 border-slate-700 hover:border-teal-400'
                  }`}
                >
                  {p.note}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* DIRECTOR'S VIEW CHORAL RISER MAP */}
        <section className="bg-slate-900 border border-teal-900/40 p-6 rounded-xl mb-6">
          <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
            <div>
              <h2 className="text-lg font-bold text-teal-400">🎶 Director's View Choral Riser Chart</h2>
              <p className="text-xs text-slate-400">Conductor Podium at Stage Front (Bottom). 4 spots per row level.</p>
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
                    <span className="text-[11px] font-bold uppercase text-slate-400">
                      {rowName === 'Row 1' ? 'Row 1 (Stage Floor)' : rowName}
                    </span>
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
                          <span className="text-[9px] uppercase text-slate-500 font-mono text-center">
                            {secName}
                          </span>

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
                                  className={`p-1 rounded text-center border min-h-[38px] flex flex-col justify-center ${
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

        {/* ENSEMBLE MANAGER */}
        <section className="bg-slate-900 border border-teal-900/40 p-5 rounded-xl mb-6">
          <h2 className="text-lg font-semibold text-slate-200 mb-3">🎼 Ensemble & Class Manager</h2>
          <div className="flex flex-wrap items-center gap-3 mb-4">
            {ensembles.map((ens) => (
              <div key={ens} className="bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-lg flex items-center space-x-2 text-sm">
                <span className="font-medium text-teal-300">{ens}</span>
                <button
                  onClick={() => handleRenameEnsemble(ens)}
                  className="text-xs text-slate-400 hover:text-white underline"
                >
                  Rename
                </button>
              </div>
            ))}
          </div>

          <form onSubmit={handleAddEnsemble} className="flex gap-2 max-w-md">
            <input
              type="text"
              placeholder="New Ensemble Name (e.g. Madrigals)"
              value={newEnsembleName}
              onChange={(e) => setNewEnsembleName(e.target.value)}
              className="bg-slate-800 border border-slate-700 px-3 py-2 rounded text-sm flex-1 text-white"
            />
            <button
              type="submit"
              className="bg-teal-600 hover:bg-teal-500 text-white font-bold px-4 py-2 rounded text-sm transition"
            >
              + Add Choir
            </button>
          </form>
        </section>

        {/* ADD STUDENT FORM */}
        <section className="bg-slate-900 border border-teal-900/40 p-5 rounded-xl mb-6">
          <h2 className="text-lg font-semibold text-slate-200 mb-4">+ Add New Student</h2>
          <form onSubmit={handleAddStudent} className="grid grid-cols-1 md:grid-cols-8 gap-3">
            <input
              type="text"
              placeholder="OCPS Student ID"
              required
              value={newStudent.student_id}
              onChange={(e) => setNewStudent({ ...newStudent, student_id: e.target.value })}
              className="bg-slate-800 border border-slate-700 px-3 py-2 rounded text-sm text-white"
            />
            <input
              type="text"
              placeholder="First Name"
              required
              value={newStudent.first_name}
              onChange={(e) => setNewStudent({ ...newStudent, first_name: e.target.value })}
              className="bg-slate-800 border border-slate-700 px-3 py-2 rounded text-sm text-white"
            />
            <input
              type="text"
              placeholder="Last Name"
              required
              value={newStudent.last_name}
              onChange={(e) => setNewStudent({ ...newStudent, last_name: e.target.value })}
              className="bg-slate-800 border border-slate-700 px-3 py-2 rounded text-sm text-white"
            />
            <select
              value={newStudent.ensemble}
              onChange={(e) => setNewStudent({ ...newStudent, ensemble: e.target.value })}
              className="bg-slate-800 border border-slate-700 px-3 py-2 rounded text-sm text-white"
            >
              {ensembles.map(e => <option key={e} value={e}>{e}</option>)}
            </select>
            <select
              value={newStudent.voice_part}
              onChange={(e) => setNewStudent({ ...newStudent, voice_part: e.target.value })}
              className="bg-slate-800 border border-slate-700 px-3 py-2 rounded text-sm text-white"
            >
              {voiceParts.map(vp => <option key={vp} value={vp}>{vp}</option>)}
            </select>
            <select
              value={newStudent.wenger_section}
              onChange={(e) => setNewStudent({ ...newStudent, wenger_section: e.target.value })}
              className="bg-slate-800 border border-slate-700 px-3 py-2 rounded text-sm text-white"
            >
              {activeRisers.map(sec => <option key={sec} value={sec}>{sec}</option>)}
            </select>
            <select
              value={newStudent.wenger_row}
              onChange={(e) => setNewStudent({ ...newStudent, wenger_row: e.target.value })}
              className="bg-slate-800 border border-slate-700 px-3 py-2 rounded text-sm text-white"
            >
              {activeRows.map(row => <option key={row} value={row}>{row}</option>)}
            </select>
            <select
              value={newStudent.wenger_slot}
              onChange={(e) => setNewStudent({ ...newStudent, wenger_slot: e.target.value })}
              className="bg-slate-800 border border-slate-700 px-3 py-2 rounded text-sm text-white"
            >
              {slots.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <button
              type="submit"
              className="md:col-span-8 bg-teal-600 hover:bg-teal-500 text-white font-bold px-4 py-2.5 rounded text-sm transition"
            >
              Save Student Record
            </button>
          </form>
        </section>

        {/* ROSTER TABLE */}
        <section className="bg-slate-900 border border-teal-900/40 p-5 rounded-xl">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-slate-200">Active Roster ({filteredRoster.length})</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase">
                  <th className="py-2.5 px-3">Student ID</th>
                  <th className="py-2.5 px-3">Name</th>
                  <th className="py-2.5 px-3">Primary Ensemble</th>
                  <th className="py-2.5 px-3">Voice Part</th>
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
                    <td className="py-2.5 px-3 font-semibold text-teal-300">
                      {s.wenger_section || 'Riser A'} — {s.wenger_row || 'Row 1'} ({s.wenger_slot || 'Far Left'})
                    </td>
                    <td className="py-2.5 px-3 text-right space-x-2">
                      <button
                        onClick={() => setEditingStudent(s)}
                        className="text-slate-300 hover:text-white text-xs px-2.5 py-1 rounded bg-slate-800 border border-slate-700"
                      >
                        Edit Record
                      </button>
                      <button
                        onClick={() => handleDirectorResetPassword(s.student_id, `${s.first_name} ${s.last_name}`)}
                        className="text-teal-400 hover:text-teal-300 text-xs px-2.5 py-1 rounded bg-teal-950/40 border border-teal-800/50"
                      >
                        Reset Pass
                      </button>
                      <button
                        onClick={() => handleDelete(s.id)}
                        className="text-red-400 hover:text-red-300 text-xs px-2.5 py-1 rounded bg-red-950/40 border border-red-800/50"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* EDIT STUDENT MODAL */}
        {editingStudent && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-slate-900 border border-teal-800/60 p-6 rounded-xl max-w-md w-full space-y-4">
              <h3 className="text-lg font-bold text-teal-400">Edit Student Record</h3>
              
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="First Name"
                  value={editingStudent.first_name}
                  onChange={(e) => setEditingStudent({ ...editingStudent, first_name: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 px-3 py-2 rounded text-sm text-white"
                />
                <input
                  type="text"
                  placeholder="Last Name"
                  value={editingStudent.last_name}
                  onChange={(e) => setEditingStudent({ ...editingStudent, last_name: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 px-3 py-2 rounded text-sm text-white"
                />
                <select
                  value={editingStudent.ensemble}
                  onChange={(e) => setEditingStudent({ ...editingStudent, ensemble: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 px-3 py-2 rounded text-sm text-white"
                >
                  {ensembles.map(e => <option key={e} value={e}>{e}</option>)}
                </select>
                <select
                  value={editingStudent.voice_part}
                  onChange={(e) => setEditingStudent({ ...editingStudent, voice_part: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 px-3 py-2 rounded text-sm text-white"
                >
                  {voiceParts.map(vp => <option key={vp} value={vp}>{vp}</option>)}
                </select>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">Riser Section</label>
                  <select
                    value={editingStudent.wenger_section || 'Riser A'}
                    onChange={(e) => setEditingStudent({ ...editingStudent, wenger_section: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 px-3 py-2 rounded text-sm text-white"
                  >
                    {activeRisers.map(sec => <option key={sec} value={sec}>{sec}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">Riser Row / Level</label>
                  <select
                    value={editingStudent.wenger_row || 'Row 1'}
                    onChange={(e) => setEditingStudent({ ...editingStudent, wenger_row: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 px-3 py-2 rounded text-sm text-white"
                  >
                    {activeRows.map(row => <option key={row} value={row}>{row}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">Slot Position (4 Per Row)</label>
                  <select
                    value={editingStudent.wenger_slot || 'Far Left'}
                    onChange={(e) => setEditingStudent({ ...editingStudent, wenger_slot: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 px-3 py-2 rounded text-sm text-white"
                  >
                    {slots.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  onClick={() => setEditingStudent(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs rounded font-semibold text-slate-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveStudentEdit}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-xs rounded font-bold text-white"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // STUDENT PORTAL VIEW
  const currentTerm = fvaTerms[termIndex];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
      <header className="flex justify-between items-center border-b border-teal-900/60 pb-4 mb-6">
        <div className="flex items-center space-x-3">
          <a
            href="https://www.instagram.com/olympiatitanchorus"
            target="_blank"
            rel="noreferrer"
            title="Visit Titan Chorus Instagram @olympiatitanchorus"
            className="group"
          >
            <img
              src="/Olympia Titan Chorus 26 Logo - 3.PNG"
              alt="Olympia Titan Chorus Logo"
              className="w-12 h-12 rounded-full border-2 border-teal-400 shadow-md transform group-hover:scale-105 transition object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </a>
          <div>
            <h1 className="text-2xl font-bold text-teal-400">Titan Chorus Student Hub</h1>
            <p className="text-xs text-slate-400">Welcome back, {currentUser.name}</p>
          </div>
        </div>

        <button
          onClick={() => setCurrentUser(null)}
          className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm px-4 py-2 rounded-lg"
        >
          Sign Out
        </button>
      </header>

      {/* QUICK TOOLS ROW FOR STUDENTS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-slate-900 border border-teal-900/40 p-5 rounded-xl">
          <h3 className="text-sm font-bold text-teal-400 uppercase tracking-wider mb-3">📅 Upcoming Events</h3>
          <div className="space-y-2">
            {upcomingEvents.slice(0, 2).map((evt, idx) => (
              <div key={idx} className="bg-slate-950 p-2 rounded border border-slate-800 text-xs">
                <span className="font-semibold text-teal-300 block">{evt.date}</span>
                <p className="text-white font-medium">{evt.title}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-900 border border-teal-900/40 p-5 rounded-xl flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-teal-400 uppercase tracking-wider mb-2">⏱ Rehearsal Metronome</h3>
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

        <div className="bg-slate-900 border border-teal-900/40 p-5 rounded-xl">
          <h3 className="text-sm font-bold text-teal-400 uppercase tracking-wider mb-2">🎵 Pitch Pipe</h3>
          <div className="grid grid-cols-4 gap-1.5">
            {pitchPipePitches.map((p) => (
              <button
                key={p.note}
                onClick={() => playPitch(p.freq, p.note)}
                className={`py-1.5 rounded font-mono font-bold text-xs transition border ${
                  activePitch === p.note
                    ? 'bg-teal-500 text-slate-950 border-white scale-105'
                    : 'bg-slate-800 text-slate-200 border-slate-700 hover:border-teal-400'
                }`}
              >
                {p.note}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div className="flex space-x-2 border-b border-teal-900/60 pb-3 mb-6">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
            activeTab === 'overview' ? 'bg-teal-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-slate-200'
          }`}
        >
          My Profile
        </button>
        <button
          onClick={() => setActiveTab('fva')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
            activeTab === 'fva' ? 'bg-teal-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-slate-200'
          }`}
        >
          🎵 FVA All-State Musicianship Hub
        </button>
        <button
          onClick={() => setActiveTab('security')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
            activeTab === 'security' ? 'bg-teal-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-slate-200'
          }`}
        >
          Security & Password
        </button>
      </div>

      {/* TAB 1: OVERVIEW */}
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

      {/* TAB 2: FVA MUSICIANSHIP HUB */}
      {activeTab === 'fva' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-teal-900/40 p-6 rounded-xl max-w-xl mx-auto text-center">
            <span className="text-xs uppercase font-semibold text-teal-400 tracking-wider">
              {currentTerm?.category || "FVA Vocabulary"}
            </span>
            
            <div
              onClick={() => setShowAnswer(!showAnswer)}
              className="my-6 p-8 bg-slate-950 border border-slate-800 rounded-xl cursor-pointer hover:border-teal-500/50 transition min-h-[160px] flex flex-col justify-center items-center"
            >
              <h3 className="text-2xl font-bold text-slate-100">{currentTerm?.term}</h3>
              {showAnswer ? (
                <p className="text-teal-300 mt-4 text-sm font-medium leading-relaxed">{currentTerm?.definition}</p>
              ) : (
                <p className="text-xs text-slate-500 mt-4">Click to reveal definition</p>
              )}
            </div>

            <div className="flex justify-between items-center text-xs text-slate-400">
              <button
                disabled={termIndex === 0}
                onClick={() => {
                  setShowAnswer(false);
                  setTermIndex(prev => Math.max(0, prev - 1));
                }}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 rounded font-semibold"
              >
                ← Previous
              </button>

              <span>Term {termIndex + 1} of {fvaTerms.length}</span>

              <button
                disabled={termIndex === fvaTerms.length - 1}
                onClick={() => {
                  setShowAnswer(false);
                  setTermIndex(prev => Math.min(fvaTerms.length - 1, prev + 1));
                }}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 rounded font-semibold"
              >
                Next →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SECURITY */}
      {activeTab === 'security' && (
        <div className="bg-slate-900 border border-teal-900/40 p-6 rounded-xl max-w-md mx-auto">
          <h3 className="text-lg font-semibold text-slate-200 mb-2">Change Password</h3>
          <p className="text-xs text-slate-400 mb-4">Set a custom password for your student login account.</p>

          <form onSubmit={handleChangePassword} className="space-y-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Current Password</label>
              <input
                type="password"
                required
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 px-3 py-2 rounded text-sm text-white focus:outline-none focus:border-teal-400"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">New Password</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 px-3 py-2 rounded text-sm text-white focus:outline-none focus:border-teal-400"
              />
            </div>

            {passChangeStatus.msg && (
              <p className={`text-xs ${passChangeStatus.type === 'success' ? 'text-emerald-400' : 'text-red-400'}`}>
                {passChangeStatus.msg}
              </p>
            )}

            <button
              type="submit"
              className="w-full bg-teal-600 hover:bg-teal-500 text-white font-bold py-2 rounded text-sm transition"
            >
              Update Password
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
