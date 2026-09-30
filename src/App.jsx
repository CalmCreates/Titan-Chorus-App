import React, { useState, useEffect } from 'react';

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

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

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

  // NEW TRANSACTION FORM STATE
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

  // FINANCIAL TOTALS
  const totalIncome = budgetTransactions.filter(t => t.trans_type === 'income').reduce((acc, t) => acc + t.amount, 0);
  const totalExpenses = budgetTransactions.filter(t => t.trans_type === 'expense').reduce((acc, t) => acc + t.amount, 0);
  const currentBalance = startingBudget + totalIncome - totalExpenses;

  // REUSABLE ABSENCE REQUEST COMPONENT
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
          marginHeight="0"
          marginWidth="0"
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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
      {/* HEADER */}
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

        <div className="flex space-x-2">
          <button onClick={() => setShowPasswordModal(true)} className="bg-slate-800 border border-slate-700 text-xs text-slate-200 px-3 py-2 rounded-lg">🔑 Password</button>
          <button onClick={() => setCurrentUser(null)} className="bg-rose-950 border border-rose-800 text-xs text-rose-200 px-3 py-2 rounded-lg">Sign Out</button>
        </div>
      </header>

      {/* PASSWORD MODAL */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-700 p-6 rounded-xl max-w-sm w-full space-y-4">
            <h3 className="text-md font-bold text-teal-400">Change Password</h3>
            <form onSubmit={handleChangePassword} className="space-y-3">
              <input type="password" required placeholder="Current Password" value={oldPass} onChange={(e) => setOldPass(e.target.value)} className="w-full bg-slate-800 border border-slate-700 p-2 rounded text-xs text-white" />
              <input type="password" required placeholder="New Password" value={newPass} onChange={(e) => setNewPass(e.target.value)} className="w-full bg-slate-800 border border-slate-700 p-2 rounded text-xs text-white" />
              {passUpdateMsg && <p className="text-xs text-center font-bold">{passUpdateMsg}</p>}
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowPasswordModal(false)} className="bg-slate-800 text-xs px-3 py-1.5 rounded">Close</button>
                <button type="submit" className="bg-teal-600 text-xs font-bold px-4 py-1.5 rounded text-white">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DIRECTOR VIEW */}
      {role === 'director' && (
        <div>
          <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3 mb-6">
            {[
              { id: 'welcome', label: '🏠 Welcome Hub' },
              { id: 'absences', label: '📝 Absence Requests' },
              { id: 'budget', label: '💰 Program Finances' },
              { id: 'roster', label: '📋 Roster & Roles' },
              { id: 'attendance', label: '📍 GPS Attendance' },
              { id: 'risers', label: '🎶 Riser Charts' }
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

          {directorTab === 'attendance' && (
            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 space-y-4">
              <h3 className="text-lg font-bold text-teal-400">📍 Active GPS Event Geofences</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {eventsList.map((e) => (
                  <div key={e.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                    <h4 className="font-bold text-white">{e.title}</h4>
                    <p className="text-xs text-teal-300">{e.location_name} • {e.event_date}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {directorTab === 'risers' && (
            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 text-center">
              <h3 className="text-lg font-bold text-teal-400 mb-2">🎶 Interactive Choral Riser Layout</h3>
              <p className="text-xs text-slate-400">Riser Map active for all ensembles.</p>
            </div>
          )}
        </div>
      )}

      {/* CLC VIEW */}
      {role === 'clc' && (
        <div className="space-y-6">
          <div className="bg-amber-950/40 border border-amber-500/50 p-4 rounded-xl">
            <h2 className="text-lg font-bold text-amber-300">⭐ Choir Leadership Council (CLC) Hub</h2>
            <p className="text-xs text-amber-200/80">Authorized attendance check-in, leave form, & riser monitoring access.</p>
          </div>

          <div className="flex gap-2 border-b border-slate-800 pb-3">
            <button onClick={() => setClcTab('attendance')} className={`px-4 py-2 rounded-lg text-xs font-bold ${clcTab === 'attendance' ? 'bg-amber-600 text-white' : 'bg-slate-900 text-slate-400'}`}>📍 GPS Attendance Check</button>
            <button onClick={() => setClcTab('absences')} className={`px-4 py-2 rounded-lg text-xs font-bold ${clcTab === 'absences' ? 'bg-amber-600 text-white' : 'bg-slate-900 text-slate-400'}`}>📝 Absence Form</button>
            <button onClick={() => setClcTab('risers')} className={`px-4 py-2 rounded-lg text-xs font-bold ${clcTab === 'risers' ? 'bg-amber-600 text-white' : 'bg-slate-900 text-slate-400'}`}>🎶 Riser Maps</button>
          </div>

          {clcTab === 'attendance' && (
            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
              <h3 className="text-sm font-bold text-amber-400 mb-3">Live Geofence Check-in Status</h3>
              <p className="text-xs text-slate-400">View real-time student check-in markers for upcoming performances.</p>
            </div>
          )}

          {clcTab === 'absences' && <AbsenceRequestModule />}

          {clcTab === 'risers' && (
            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
              <h3 className="text-sm font-bold text-amber-400 mb-3">Choral Riser Map</h3>
              <p className="text-xs text-slate-400">Verify row positions and voice placements for rehearsals.</p>
            </div>
          )}
        </div>
      )}

      {/* REGULAR STUDENT VIEW */}
      {role === 'student' && (
        <div className="space-y-6 max-w-4xl mx-auto">
          <div className="flex gap-2 border-b border-slate-800 pb-3">
            <button onClick={() => setStudentTab('home')} className={`px-4 py-2 rounded-lg text-xs font-bold ${studentTab === 'home' ? 'bg-teal-600 text-white' : 'bg-slate-900 text-slate-400'}`}>🏠 Student Portal</button>
            <button onClick={() => setStudentTab('absences')} className={`px-4 py-2 rounded-lg text-xs font-bold ${studentTab === 'absences' ? 'bg-teal-600 text-white' : 'bg-slate-900 text-slate-400'}`}>📝 Submit Absence Request</button>
          </div>

          {studentTab === 'home' && (
            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 space-y-2">
              <h3 className="text-lg font-bold text-teal-400">{currentUser.ensemble}</h3>
              <p className="text-sm text-slate-300">Voice Part: <span className="font-bold text-white">{currentUser.voice_part}</span></p>
            </div>
          )}

          {studentTab === 'absences' && <AbsenceRequestModule />}
        </div>
      )}

      {/* ALUMNI VIEW */}
      {role === 'alumni' && (
        <div className="space-y-6 max-w-3xl mx-auto">
          <div className="bg-indigo-950/60 border border-indigo-500/50 p-6 rounded-xl text-center space-y-2">
            <h2 className="text-2xl font-extrabold text-indigo-300">🎓 Titan Chorus Alumni Portal</h2>
            <p className="text-xs text-slate-300">Once a Titan, always a Titan. Stay connected with the program!</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl space-y-4">
            <h3 className="text-sm font-bold text-indigo-400 uppercase">💌 Send Thanks & Encouragement to Director Lengua-Miranda</h3>
            <a href="mailto:Cesar.Lengua@ocps.net?subject=Olympia%20Titan%20Chorus%20Alumni%20Note" className="inline-block bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-6 py-2.5 rounded-lg text-xs">✉️ Write Thank You Email</a>
          </div>
        </div>
      )}
    </div>
  );
}
