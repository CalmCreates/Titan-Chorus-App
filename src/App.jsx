import React, { useState, useEffect, useRef } from 'react';

const API_BASE = "https://titan-chorus-app.onrender.com/api";

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  // Director View Switcher
  const [viewAsStudentMode, setViewAsStudentMode] = useState(false);

  // Audio Instrument Selector & Octave State
  const [audioInstrument, setAudioInstrument] = useState('pitch_pipe'); // 'pitch_pipe' or 'piano'
  const [octaveOffset, setOctaveOffset] = useState(0); // -2, -1, 0, +1, +2
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
  const voiceParts = ['Soprano 1', 'Soprano 2', 'Alto 1', 'Alto 2', 'Tenor 1', 'Tenor 2', 'Bass 1', 'Bass 2'];

  const upcomingEvents = [
    { date: 'Oct 6, 2026', title: 'FVA All-State Musicianship Exam Screening', location: 'Chorus Room' },
    { date: 'Oct 15, 2026', title: 'Titan Chorus Fall Concert Rehearsal', location: 'Olympia Auditorium' },
    { date: 'Oct 22, 2026', title: 'Fall Choral Showcase Performance', location: 'Olympia Main Stage' },
    { date: 'Nov 3, 2026', title: 'OCPS All-County Audition Prep', location: 'Chorus Room' }
  ];

  // Octave 4 Base Frequencies
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

  // Piano Keys (B3 to C5)
  const pianoKeys = [
    { note: 'B3', label: 'B3', isBlack: false, freq: 246.94 },
    { note: 'C4', label: 'C4', isBlack: false, freq: 261.63 },
    { note: 'C#4', label: 'C#/Db', isBlack: true, freq: 277.18 },
    { note: 'D4', label: 'D4', isBlack: false, freq: 293.66 },
    { note: 'D#4', label: 'D#/Eb', isBlack: true, freq: 311.13 },
    { note: 'E4', label: 'E4', isBlack: false, freq: 329.63 },
    { note: 'F4', label: 'F4', isBlack: false, freq: 349.23 },
    { note: 'F#4', label: 'F#/Gb', isBlack: true, freq: 369.99 },
    { note: 'G4', label: 'G4', isBlack: false, freq: 392.00 },
    { note: 'G#4', label: 'G#/Ab', isBlack: true, freq: 415.30 },
    { note: 'A4', label: 'A4', isBlack: false, freq: 440.00 },
    { note: 'A#4', label: 'A#/Bb', isBlack: true, freq: 466.16 },
    { note: 'B4', label: 'B4', isBlack: false, freq: 493.88 },
    { note: 'C5', label: 'C5', isBlack: false, freq: 523.25 }
  ];

  useEffect(() => {
    if (currentUser) {
      fetchEnsembles();
      fetchStudents();
      fetchFvaTerms();
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser && students.length > 0) {
      const match = students.find(s => s.student_id === currentUser.student_id);
      if (match) {
        setStudentUniforms({
          uniform_tshirt: match.uniform_tshirt || false,
          uniform_tshirt_size: match.uniform_tshirt_size || 'M',
          uniform_polo: match.uniform_polo || false,
          uniform_polo_size: match.uniform_polo_size || 'M',
          uniform_dress: match.uniform_dress || false,
          uniform_jacket: match.uniform_jacket || false,
          uniform_silver_tie: match.uniform_silver_tie || false,
          uniform_teal_tie: match.uniform_teal_tie || false,
          uniform_red_tie: match.uniform_red_tie || false,
          uniform_white_tie: match.uniform_white_tie || false,
          uniform_backpack: match.uniform_backpack || false,
          uniform_other: match.uniform_other || '',
          uniform_other_checked: match.uniform_other_checked || false
        });
      }
    }
  }, [currentUser, students]);

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

      // Apply Octave Offset: 2^(octaveOffset)
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

  const handleSaveUniformChecklist = async (updatedState) => {
    setStudentUniforms(updatedState);
    try {
      await fetch(`${API_BASE}/students/uniform`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: currentUser.student_id,
          ...updatedState
        })
      });
      fetchStudents();
    } catch (e) {
      console.error('Error updating uniform:', e);
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

  // REHEARSAL AUDIO TOOLBAR WIDGET (Shared between Admin & Student Views)
  const renderAudioToolbar = () => (
    <div className="bg-slate-900 border border-teal-900/40 p-5 rounded-xl mb-6">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-4 border-b border-slate-800 pb-3">
        <div>
          <h3 className="text-sm font-bold text-teal-400 uppercase tracking-wider">🎹 Rehearsal Pitch & Metronome Tools</h3>
          <p className="text-xs text-slate-400">Toggle between Pitch Buttons and Piano (B3-C5 with Enharmonics)</p>
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
            🎹 Piano (B3–C5)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* METRONOME */}
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

        {/* PITCH INSTRUMENT DISPLAY */}
        <div className="md:col-span-2 bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-xs font-bold text-teal-300 uppercase">
              {audioInstrument === 'pitch_pipe' ? '🎵 Chromatic Pitch Pipe' : '🎹 Rehearsal Piano (B3–C5)'}
            </h4>

            {/* OCTAVE SWITCHER */}
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

          {/* INSTRUMENT VIEW 1: PITCH PIPE BUTTON MATRIX */}
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
            /* INSTRUMENT VIEW 2: PIANO KEYS (B3 to C5) WITH ENHARMONIC LABELS */
            <div className="overflow-x-auto pb-2">
              <div className="flex justify-center items-start min-w-[500px] h-36 bg-slate-900 p-2 rounded border border-slate-800 relative select-none">
                {pianoKeys.map((k) => (
                  <button
                    key={k.note}
                    onClick={() => playFrequency(k.freq, k.note)}
                    className={`flex flex-col justify-end items-center pb-2 transition border rounded-b ${
                      k.isBlack
                        ? 'bg-slate-950 text-teal-300 border-slate-800 w-9 h-22 -mx-2 z-10 hover:bg-slate-900'
                        : 'bg-slate-200 text-slate-950 border-slate-400 w-12 h-32 z-0 hover:bg-white'
                    } ${activePitch === k.note ? 'ring-2 ring-amber-400 scale-95' : ''}`}
                  >
                    <span className="text-[9px] font-bold font-mono text-center leading-tight">
                      {k.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
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

        {/* SHARED REHEARSAL AUDIO TOOLBAR */}
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

  // STUDENT VIEW (ACCESSIBLE TO STUDENTS AND DIRECTORS PREVIEWING)
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
      {/* DIRECTOR PREVIEW BANNER */}
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

      {/* SHARED REHEARSAL AUDIO TOOLBAR FOR STUDENTS */}
      {renderAudioToolbar()}

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
          onClick={() => setActiveTab('uniform')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
            activeTab === 'uniform' ? 'bg-teal-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-slate-200'
          }`}
        >
          👔 Uniform Checklist
        </button>
        <button
          onClick={() => setActiveTab('fva')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
            activeTab === 'fva' ? 'bg-teal-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-slate-200'
          }`}
        >
          🎵 FVA Musicianship
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

      {/* TAB 2: UNIFORM CHECKLIST */}
      {activeTab === 'uniform' && (
        <div className="space-y-6 max-w-2xl mx-auto">
          <div className="bg-amber-950/40 border border-amber-600/60 p-4 rounded-xl text-xs text-amber-200 leading-relaxed space-y-2">
            <p className="font-bold text-amber-300 text-sm">⚠️ UNIFORM CARE & CONCERT DAY GUIDELINES</p>
            <p>
              Please ensure your name is written <strong>LEGIBLY</strong> on your string backpack and that your choir uniforms are placed inside, neatly folded, on concert days.
            </p>
            <p>
              You may leave your bag hanging on a rack or in a designated practice room. <strong>Do not leave money or valuables in your bag unattended.</strong>
            </p>
            <p className="italic text-amber-400">
              Uniforms are a privilege and must be treated with care, kept clean, and laundered properly.
            </p>
          </div>

          <div className="bg-slate-900 border border-teal-900/40 p-6 rounded-xl space-y-4">
            <h3 className="text-lg font-bold text-teal-400">Olympia HS Issued Items Checklist</h3>
            <div className="space-y-3 pt-2">
              <div className="flex justify-between items-center bg-slate-950 p-3 rounded-lg border border-slate-800">
                <label className="flex items-center space-x-3 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={studentUniforms.uniform_tshirt}
                    disabled={studentUniforms.uniform_tshirt && !isDirector}
                    onChange={(e) => handleSaveUniformChecklist({ ...studentUniforms, uniform_tshirt: e.target.checked })}
                    className="w-4 h-4 accent-teal-500 rounded"
                  />
                  <span className="font-semibold text-white">Choir T-Shirt</span>
                </label>
                <select
                  value={studentUniforms.uniform_tshirt_size}
                  disabled={studentUniforms.uniform_tshirt && !isDirector}
                  onChange={(e) => handleSaveUniformChecklist({ ...studentUniforms, uniform_tshirt_size: e.target.value })}
                  className="bg-slate-800 border border-slate-700 px-2 py-1 rounded text-xs text-white"
                >
                  {sizes.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div className="flex justify-between items-center bg-slate-950 p-3 rounded-lg border border-slate-800">
                <label className="flex items-center space-x-3 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={studentUniforms.uniform_polo}
                    disabled={studentUniforms.uniform_polo && !isDirector}
                    onChange={(e) => handleSaveUniformChecklist({ ...studentUniforms, uniform_polo: e.target.checked })}
                    className="w-4 h-4 accent-teal-500 rounded"
                  />
                  <span className="font-semibold text-white">Choir Black Polo</span>
                </label>
                <select
                  value={studentUniforms.uniform_polo_size}
                  disabled={studentUniforms.uniform_polo && !isDirector}
                  onChange={(e) => handleSaveUniformChecklist({ ...studentUniforms, uniform_polo_size: e.target.value })}
                  className="bg-slate-800 border border-slate-700 px-2 py-1 rounded text-xs text-white"
                >
                  {sizes.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              {[
                { key: 'uniform_dress', label: 'Choir Dress' },
                { key: 'uniform_jacket', label: 'Choir Jacket' },
                { key: 'uniform_silver_tie', label: 'Silver Tie' },
                { key: 'uniform_teal_tie', label: 'Teal Tie' },
                { key: 'uniform_red_tie', label: 'Red Tie' },
                { key: 'uniform_white_tie', label: 'White Tie' },
                { key: 'uniform_backpack', label: 'Choir String Backpack' }
              ].map((item) => (
                <div key={item.key} className="flex justify-between items-center bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <label className="flex items-center space-x-3 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={studentUniforms[item.key]}
                      disabled={studentUniforms[item.key] && !isDirector}
                      onChange={(e) => handleSaveUniformChecklist({ ...studentUniforms, [item.key]: e.target.checked })}
                      className="w-4 h-4 accent-teal-500 rounded"
                    />
                    <span className="font-semibold text-white">{item.label}</span>
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: FVA MUSICIANSHIP */}
      {activeTab === 'fva' && (
        <div className="bg-slate-900 border border-teal-900/40 p-6 rounded-xl max-w-xl mx-auto text-center">
          <span className="text-xs uppercase font-semibold text-teal-400 tracking-wider">
            {fvaTerms[termIndex]?.category || "FVA Vocabulary"}
          </span>
          <div
            onClick={() => setShowAnswer(!showAnswer)}
            className="my-6 p-8 bg-slate-950 border border-slate-800 rounded-xl cursor-pointer hover:border-teal-500/50 transition min-h-[160px] flex flex-col justify-center items-center"
          >
            <h3 className="text-2xl font-bold text-slate-100">{fvaTerms[termIndex]?.term}</h3>
            {showAnswer ? (
              <p className="text-teal-300 mt-4 text-sm font-medium leading-relaxed">{fvaTerms[termIndex]?.definition}</p>
            ) : (
              <p className="text-xs text-slate-500 mt-4">Click to reveal definition</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
