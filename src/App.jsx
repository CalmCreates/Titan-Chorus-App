import React, { useState, useEffect, useRef } from 'react';

const API_BASE = "https://titan-chorus-app.onrender.com/api";

const DAILY_QUOTES = [
  "Music can change the world because it can change people. — Bono",
  "Where words fail, music speaks. — Hans Christian Andersen",
  "Excellence is not an act, but a habit. Practice with purpose! — Aristotle",
  "Choral singing is a model for human harmony. — Eric Whitacre",
  "We strive to touch lives through the power of song!"
];

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  
  // NAVIGATION TABS
  const [directorTab, setDirectorTab] = useState('attendance'); 
  const [studentTab, setStudentTab] = useState('overview'); 
  const [viewAsStudentMode, setViewAsStudentMode] = useState(false);

  // FINANCIAL BUDGET STATE
  const [budgetTransactions, setBudgetTransactions] = useState([]);
  const [transDate, setTransDate] = useState('');
  const [transCategory, setTransCategory] = useState('SchoolCashOnline Dues');
  const [transDesc, setTransDesc] = useState('');
  const [transType, setTransType] = useState('income');
  const [transAmount, setTransAmount] = useState('');
  const [transYear, setTransYear] = useState('2026-2027');

  // MASTER ROSTER & RISERS
  const [students, setStudents] = useState([]);
  const [eventsList, setEventsList] = useState([]);

  useEffect(() => {
    if (currentUser) {
      fetchStudents();
      fetchEvents();
      fetchBudget();
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

  const handleAddBudgetTransaction = async (e) => {
    e.preventDefault();
    try {
      await fetch(`${API_BASE}/budget`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trans_date: transDate || new Date().toISOString().split('T')[0],
          category: transCategory,
          description: transDesc,
          trans_type: transType,
          amount: parseFloat(transAmount),
          school_year: transYear
        })
      });
      setTransDesc('');
      setTransAmount('');
      fetchBudget();
    } catch (e) { console.error(e); }
  };

  const handleUpdateStudentPayment = async (studentId, newAmount) => {
    try {
      await fetch(`${API_BASE}/students/payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ student_id: studentId, amount: parseFloat(newAmount) })
      });
      fetchStudents();
    } catch (e) { console.error(e); }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoggingIn(true);

    const sanitizedId = loginId.trim();
    const sanitizedPassword = password.trim();

    try {
      const res = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ student_id: sanitizedId, password: sanitizedPassword })
      });
      
      const data = await res.json();
      setIsLoggingIn(false);

      if (data.success) {
        setCurrentUser(data);
        setPassword('');
      } else {
        setErrorMsg(data.message || 'Invalid Student ID or Password. (Note: Director ID is ADMIN)');
      }
    } catch (err) {
      setIsLoggingIn(false);
      setErrorMsg('Server warming up or offline. Please wait 10 seconds and try again.');
    }
  };

  const getRequiredDues = (ensembleName) => {
    const tier85 = ['Master Singers', 'Bella Voce', 'Olympian Voices'];
    return tier85.includes(ensembleName) ? 85.0 : 55.0;
  };

  // LOGIN SCREEN WITH OLYMPIA LOGO RESTORED
  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100 p-4">
        <div className="bg-slate-900 border border-teal-800/60 p-8 rounded-xl shadow-2xl max-w-md w-full text-center">
          
          {/* RESTORED OLYMPIA TITAN CHORUS LOGO */}
          <div className="mb-6">
            <a 
              href="https://www.instagram.com/olympiatitanchorus" 
              target="_blank" 
              rel="noreferrer" 
              className="inline-block transform hover:scale-105 transition mb-3"
            >
              <img
                src="/Olympia Titan Chorus 26 Logo - 3.PNG"
                alt="Olympia High School Titan Chorus Crest"
                className="w-28 h-28 mx-auto rounded-full border-2 border-teal-400 shadow-xl object-cover bg-slate-950"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.style.display = 'none';
                }}
              />
            </a>
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
                placeholder="Enter Student ID or ADMIN"
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
              className="w-full bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white font-bold py-2.5 rounded-lg transition shadow-md"
            >
              {isLoggingIn ? 'Connecting...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  const isDirector = currentUser.role === 'director';

  const renderDirectorBudgetHub = () => {
    const totalIncome = budgetTransactions.filter(t => t.trans_type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = budgetTransactions.filter(t => t.trans_type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const netBalance = totalIncome - totalExpense;

    return (
      <section className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-900 border border-emerald-500/40 p-5 rounded-xl">
            <h4 className="text-xs font-bold uppercase text-emerald-400">Total Program Revenue</h4>
            <p className="text-3xl font-extrabold text-white mt-2">${totalIncome.toFixed(2)}</p>
          </div>
          <div className="bg-slate-900 border border-rose-500/40 p-5 rounded-xl">
            <h4 className="text-xs font-bold uppercase text-rose-400">Total Expenses & Payouts</h4>
            <p className="text-3xl font-extrabold text-white mt-2">${totalExpense.toFixed(2)}</p>
          </div>
          <div className="bg-slate-900 border border-teal-500/40 p-5 rounded-xl">
            <h4 className="text-xs font-bold uppercase text-teal-400">Net Program Balance</h4>
            <p className={`text-3xl font-extrabold mt-2 ${netBalance >= 0 ? 'text-teal-300' : 'text-rose-400'}`}>
              ${netBalance.toFixed(2)}
            </p>
          </div>
        </div>

        <form onSubmit={handleAddBudgetTransaction} className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-4">
          <h3 className="text-sm font-bold text-teal-400 uppercase">+ Log Program Income or Expense</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <input
              type="date"
              required
              value={transDate}
              onChange={(e) => setTransDate(e.target.value)}
              className="bg-slate-800 border border-slate-700 px-3 py-2 rounded text-xs text-white"
            />
            <select
              value={transType}
              onChange={(e) => setTransType(e.target.value)}
              className="bg-slate-800 border border-slate-700 px-3 py-2 rounded text-xs text-white font-bold"
            >
              <option value="income">🟢 Income / Revenue</option>
              <option value="expense">🔴 Program Expense</option>
            </select>
            <select
              value={transCategory}
              onChange={(e) => setTransCategory(e.target.value)}
              className="bg-slate-800 border border-slate-700 px-3 py-2 rounded text-xs text-white"
            >
              <option value="SchoolCashOnline Dues">SchoolCashOnline Dues</option>
              <option value="Fundraiser Revenue">Fundraiser Revenue</option>
              <option value="VPA Resource Grant">VPA Resource Grant</option>
              <option value="ICA Contractor Payout">ICA Contractor Payout</option>
              <option value="All-State Registration">All-State Audition Registration</option>
              <option value="FVA MPA Registration">FVA MPA Registration</option>
              <option value="Sheet Music Purchase">Sheet Music Purchase</option>
              <option value="Uniforms & Apparel">Uniforms & Apparel</option>
            </select>
            <input
              type="number"
              step="0.01"
              required
              placeholder="Amount ($)"
              value={transAmount}
              onChange={(e) => setTransAmount(e.target.value)}
              className="bg-slate-800 border border-slate-700 px-3 py-2 rounded text-xs text-white font-bold"
            />
          </div>

          <div className="flex gap-3">
            <input
              type="text"
              required
              placeholder="Transaction Memo / Description (e.g. Fall MPA Accompanist Payout)"
              value={transDesc}
              onChange={(e) => setTransDesc(e.target.value)}
              className="flex-1 bg-slate-800 border border-slate-700 px-3 py-2 rounded text-xs text-white"
            />
            <button type="submit" className="bg-teal-600 hover:bg-teal-500 text-white font-bold px-6 py-2 rounded text-xs">
              Save Transaction
            </button>
          </div>
        </form>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
          <h3 className="text-sm font-bold text-slate-200 mb-3">Program Financial Ledger</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase">
                  <th className="py-2 px-2">Date</th>
                  <th className="py-2 px-2">Category</th>
                  <th className="py-2 px-2">Description</th>
                  <th className="py-2 px-2">Type</th>
                  <th className="py-2 px-2">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {budgetTransactions.map((t) => (
                  <tr key={t.id}>
                    <td className="py-2 px-2 font-mono text-slate-400">{t.trans_date}</td>
                    <td className="py-2 px-2 text-teal-300 font-semibold">{t.category}</td>
                    <td className="py-2 px-2 text-slate-200">{t.description}</td>
                    <td className="py-2 px-2 uppercase font-bold text-[10px]">
                      <span className={t.trans_type === 'income' ? 'text-emerald-400' : 'text-rose-400'}>{t.trans_type}</span>
                    </td>
                    <td className={`py-2 px-2 font-mono font-bold ${t.trans_type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {t.trans_type === 'income' ? '+' : '-'}${t.amount.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    );
  };

  const renderStudentBalanceTab = () => {
    const reqDues = getRequiredDues(currentUser.ensemble);
    const paidAmt = currentUser.dues_paid_amount || 0.0;
    const isPaidInFull = paidAmt >= reqDues;
    const remaining = Math.max(0, reqDues - paidAmt);
    const pct = Math.min(100, Math.round((paidAmt / reqDues) * 100));

    return (
      <div className="max-w-xl mx-auto space-y-6">
        <div className={`p-6 rounded-xl border text-center space-y-4 shadow-xl ${
          isPaidInFull ? 'bg-emerald-950/60 border-emerald-500' : 'bg-rose-950/60 border-rose-500'
        }`}>
          <span className="text-xs uppercase tracking-widest font-bold text-slate-300">
            {currentUser.ensemble} Fair Share Dues Status
          </span>

          <div className="py-2">
            <span className={`text-4xl font-extrabold font-mono ${isPaidInFull ? 'text-emerald-300' : 'text-rose-400'}`}>
              ${paidAmt.toFixed(2)} /${reqDues.toFixed(2)}
            </span>
          </div>

          <div className="w-full bg-slate-900 h-4 rounded-full overflow-hidden border border-slate-700">
            <div
              className={`h-full transition-all duration-500 ${isPaidInFull ? 'bg-emerald-500' : 'bg-rose-500'}`}
              style={{ width: `${pct}%` }}
            />
          </div>

          <div className="pt-2">
            {isPaidInFull ? (
              <span className="inline-block bg-emerald-500 text-slate-950 font-black px-4 py-2 rounded-lg text-sm">
                ✓ PAID IN FULL — Thank You!
              </span>
            ) : (
              <div className="space-y-1">
                <span className="inline-block bg-rose-600 text-white font-bold px-4 py-1.5 rounded-lg text-xs">
                  ⚠️ Outstanding Balance: ${remaining.toFixed(2)} Remaining
                </span>
                <p className="text-[11px] text-slate-300">
                  Please submit payment through <strong>SchoolCashOnline</strong> to update your account balance.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (isDirector && !viewAsStudentMode) {
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
              <h1 className="text-2xl font-bold text-teal-400">Titan Chorus Director Portal</h1>
              <p className="text-xs text-slate-400">Director: {currentUser.name}</p>
            </div>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setViewAsStudentMode(true)}
              className="bg-teal-950 border border-teal-400 text-teal-300 text-xs font-bold px-3 py-2 rounded-lg"
            >
              👁 Student View
            </button>
            <button onClick={() => setCurrentUser(null)} className="bg-slate-800 text-slate-300 text-sm px-4 py-2 rounded-lg">
              Sign Out
            </button>
          </div>
        </header>

        <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3 mb-6">
          {[
            { id: 'attendance', label: '📍 GPS Attendance' },
            { id: 'music', label: '🎼 Music Library' },
            { id: 'risers', label: '🎶 Riser Charts' },
            { id: 'roster', label: '📋 Roster Management' },
            { id: 'budget', label: '💰 Program Budget & Finances' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setDirectorTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition border ${
                directorTab === tab.id
                  ? 'bg-teal-600 text-white border-teal-400'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {directorTab === 'attendance' && (
          <section className="bg-slate-900 p-6 rounded-xl border border-slate-800 space-y-4">
            <h3 className="text-lg font-bold text-teal-400">📍 Active GPS Event Geofences</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {eventsList.map((e) => (
                <div key={e.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <h4 className="font-bold text-white">{e.title}</h4>
                  <p className="text-xs text-teal-300">{e.location_name} • {e.event_date}</p>
                  <p className="text-xs text-slate-400 mt-1">Call Time: {e.call_time} (Radius: {e.radius_feet} ft)</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {directorTab === 'risers' && (
          <section className="bg-slate-900 p-6 rounded-xl border border-slate-800 text-center">
            <h3 className="text-lg font-bold text-teal-400 mb-2">🎶 Interactive Choral Riser Layout</h3>
            <p className="text-xs text-slate-400">Riser Map layout active for 6 standard Risers + Overflow.</p>
          </section>
        )}

        {directorTab === 'roster' && (
          <section className="bg-slate-900 p-6 rounded-xl border border-slate-800">
            <h3 className="text-lg font-bold text-teal-400 mb-4">📋 Class Roster & SchoolCashOnline Tracking</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase">
                    <th className="py-2 px-2">Student ID</th>
                    <th className="py-2 px-2">Name</th>
                    <th className="py-2 px-2">Ensemble</th>
                    <th className="py-2 px-2">Paid Dues ($)</th>
                    <th className="py-2 px-2">Required Dues</th>
                    <th className="py-2 px-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {students.map((s) => {
                    const req = getRequiredDues(s.ensemble);
                    const paid = s.dues_paid_amount || 0.0;
                    const complete = paid >= req;
                    return (
                      <tr key={s.student_id}>
                        <td className="py-2 px-2 font-mono text-teal-400">{s.student_id}</td>
                        <td className="py-2 px-2 font-bold text-white">{s.last_name}, {s.first_name}</td>
                        <td className="py-2 px-2 text-slate-300">{s.ensemble}</td>
                        <td className="py-2 px-2">
                          <input
                            type="number"
                            step="5"
                            value={paid}
                            onChange={(e) => handleUpdateStudentPayment(s.student_id, e.target.value)}
                            className="w-20 bg-slate-800 border border-slate-700 px-2 py-1 rounded text-white text-xs font-mono font-bold"
                          />
                        </td>
                        <td className="py-2 px-2 font-mono text-slate-400">${req.toFixed(2)}</td>
                        <td className="py-2 px-2 font-bold">
                          {complete ? (
                            <span className="text-emerald-400">✓ Paid</span>
                          ) : (
                            <span className="text-rose-400">Unpaid (${(req - paid).toFixed(2)})</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {directorTab === 'budget' && renderDirectorBudgetHub()}
      </div>
    );
  }

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
            <h1 className="text-2xl font-bold text-teal-400">Titan Chorus Student Hub</h1>
            <p className="text-xs text-slate-400">Welcome, {currentUser.name}</p>
          </div>
        </div>
        <button onClick={() => setCurrentUser(null)} className="bg-slate-800 text-slate-300 text-sm px-4 py-2 rounded-lg">
          Sign Out
        </button>
      </header>

      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3 mb-6">
        <button
          onClick={() => setStudentTab('overview')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold ${studentTab === 'overview' ? 'bg-teal-600 text-white' : 'bg-slate-900 text-slate-400'}`}
        >
          My Profile
        </button>
        <button
          onClick={() => setStudentTab('balance')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold ${studentTab === 'balance' ? 'bg-teal-600 text-white' : 'bg-slate-900 text-slate-400'}`}
        >
          💳 Fair Share Dues Balance
        </button>
      </div>

      {studentTab === 'overview' && (
        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
          <h3 className="text-lg font-bold text-teal-400 mb-2">{currentUser.ensemble}</h3>
          <p className="text-sm text-slate-300">Voice Part: {currentUser.voice_part}</p>
        </div>
      )}

      {studentTab === 'balance' && renderStudentBalanceTab()}
    </div>
  );
}
