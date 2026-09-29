import React, { useState, useEffect } from 'react';

const API_BASE = "https://titan-chorus-app.onrender.com/api";

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  
  // Student Password Change State
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passChangeStatus, setPassChangeStatus] = useState({ type: '', msg: '' });

  // Director Roster Management State
  const [students, setStudents] = useState([]);
  const [filterEnsemble, setFilterEnsemble] = useState('All');
  const [newStudent, setNewStudent] = useState({
    student_id: '',
    first_name: '',
    last_name: '',
    ensemble: 'Concert Chorus',
    voice_part: 'Soprano 1'
  });

  const ensembles = ['All', 'Concert Chorus', 'Bel Canto', 'Titan A Cappella', 'Treble Chorus'];
  const voiceParts = ['Soprano 1', 'Soprano 2', 'Alto 1', 'Alto 2', 'Tenor 1', 'Tenor 2', 'Bass 1', 'Bass 2'];

  useEffect(() => {
    if (currentUser && currentUser.role === 'director') {
      fetchStudents();
    }
  }, [currentUser]);

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

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPassChangeStatus({ type: '', msg: '' });
    try {
      const res = await fetch(`${API_BASE}/user/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: currentUser.student_id,
          old_password: oldPassword,
          new_password: newPassword
        })
      });
      const data = await res.json();
      if (data.success) {
        setPassChangeStatus({ type: 'success', msg: data.message });
        setOldPassword('');
        setNewPassword('');
      } else {
        setPassChangeStatus({ type: 'error', msg: data.message });
      }
    } catch (err) {
      setPassChangeStatus({ type: 'error', msg: 'Failed to update password.' });
    }
  };

  const handleDirectorResetPassword = async (studentId, studentName) => {
    const customPass = window.prompt(
      `Reset password for ${studentName} (ID: ${studentId}).\nEnter new temporary password (or leave blank for 'titan123'):`,
      'titan123'
    );
    if (customPass === null) return; // User cancelled

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
      if (data.success) {
        alert(data.message);
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (err) {
      alert('Failed to reset student password.');
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
          ensemble: 'Concert Chorus',
          voice_part: 'Soprano 1'
        });
      }
    } catch (err) {
      alert('Failed to add student.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this student from roster?')) {
      await fetch(`${API_BASE}/students/${id}`, { method: 'DELETE' });
      fetchStudents();
    }
  };

  // LOGIN SCREEN
  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100 p-4">
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-xl shadow-2xl max-w-md w-full">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-amber-400">Olympia High School</h1>
            <h2 className="text-xl font-semibold text-slate-200">Titan Chorus Hub</h2>
            <p className="text-xs text-slate-400 mt-1">"We Strive to Touch Lives!"</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Student ID or Username</label>
              <input
                type="text"
                required
                placeholder="e.g. 4801234567 or ADMIN"
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-amber-400"
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
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            {errorMsg && <p className="text-red-400 text-sm text-center">{errorMsg}</p>}

            <button
              type="submit"
              className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-2.5 rounded-lg transition"
            >
              Sign In
            </button>
          </form>

          <div className="mt-6 text-xs text-slate-500 text-center">
            <p>Default Director Login: ID <code className="text-amber-400">ADMIN</code> / Password <code className="text-amber-400">titan2026</code></p>
          </div>
        </div>
      </div>
    );
  }

  // DIRECTOR DASHBOARD
  if (currentUser.role === 'director') {
    const filteredRoster = filterEnsemble === 'All'
      ? students
      : students.filter(s => s.ensemble === filterEnsemble);

    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
        <header className="flex justify-between items-center border-b border-slate-800 pb-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-amber-400">Titan Chorus Admin Portal</h1>
            <p className="text-xs text-slate-400">Signed in as: {currentUser.name} (Director)</p>
          </div>
          <button
            onClick={() => setCurrentUser(null)}
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm px-4 py-2 rounded-lg"
          >
            Sign Out
          </button>
        </header>

        {/* ADD STUDENT FORM */}
        <section className="bg-slate-900 border border-slate-800 p-5 rounded-xl mb-6">
          <h2 className="text-lg font-semibold text-slate-200 mb-4">+ Add New Student</h2>
          <form onSubmit={handleAddStudent} className="grid grid-cols-1 md:grid-cols-6 gap-3">
            <input
              type="text"
              placeholder="OCPS Student ID"
              required
              value={newStudent.student_id}
              onChange={(e) => setNewStudent({ ...newStudent, student_id: e.target.value })}
              className="bg-slate-800 border border-slate-700 px-3 py-2 rounded text-sm"
            />
            <input
              type="text"
              placeholder="First Name"
              required
              value={newStudent.first_name}
              onChange={(e) => setNewStudent({ ...newStudent, first_name: e.target.value })}
              className="bg-slate-800 border border-slate-700 px-3 py-2 rounded text-sm"
            />
            <input
              type="text"
              placeholder="Last Name"
              required
              value={newStudent.last_name}
              onChange={(e) => setNewStudent({ ...newStudent, last_name: e.target.value })}
              className="bg-slate-800 border border-slate-700 px-3 py-2 rounded text-sm"
            />
            <select
              value={newStudent.ensemble}
              onChange={(e) => setNewStudent({ ...newStudent, ensemble: e.target.value })}
              className="bg-slate-800 border border-slate-700 px-3 py-2 rounded text-sm"
            >
              {ensembles.filter(e => e !== 'All').map(e => <option key={e} value={e}>{e}</option>)}
            </select>
            <select
              value={newStudent.voice_part}
              onChange={(e) => setNewStudent({ ...newStudent, voice_part: e.target.value })}
              className="bg-slate-800 border border-slate-700 px-3 py-2 rounded text-sm"
            >
              {voiceParts.map(vp => <option key={vp} value={vp}>{vp}</option>)}
            </select>
            <button
              type="submit"
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded text-sm transition"
            >
              Add Student
            </button>
          </form>
        </section>

        {/* ROSTER TABLE */}
        <section className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-slate-200">Active Roster ({filteredRoster.length})</h2>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-400">Filter Ensemble:</span>
              <select
                value={filterEnsemble}
                onChange={(e) => setFilterEnsemble(e.target.value)}
                className="bg-slate-800 border border-slate-700 px-3 py-1.5 rounded text-sm text-slate-200"
              >
                {ensembles.map(e => <option key={e} value={e}>{e}</option>)}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase">
                  <th className="py-2.5 px-3">Student ID</th>
                  <th className="py-2.5 px-3">Name</th>
                  <th className="py-2.5 px-3">Ensemble</th>
                  <th className="py-2.5 px-3">Voice Part</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {filteredRoster.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-6 text-center text-slate-500">No students found. Add one above!</td>
                  </tr>
                ) : (
                  filteredRoster.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-800/50">
                      <td className="py-2.5 px-3 font-mono text-amber-400">{s.student_id}</td>
                      <td className="py-2.5 px-3 font-medium text-white">{s.first_name} {s.last_name}</td>
                      <td className="py-2.5 px-3">{s.ensemble}</td>
                      <td className="py-2.5 px-3">{s.voice_part}</td>
                      <td className="py-2.5 px-3 text-right space-x-2">
                        <button
                          onClick={() => handleDirectorResetPassword(s.student_id, `${s.first_name} ${s.last_name}`)}
                          className="text-amber-400 hover:text-amber-300 text-xs px-2.5 py-1 rounded bg-amber-950/40 border border-amber-800/50"
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
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    );
  }

  // STUDENT PORTAL VIEW
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
      <header className="flex justify-between items-center border-b border-slate-800 pb-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-amber-400">Titan Chorus Student Hub</h1>
          <p className="text-xs text-slate-400">Welcome, {currentUser.name}</p>
        </div>
        <button
          onClick={() => setCurrentUser(null)}
          className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm px-4 py-2 rounded-lg"
        >
          Sign Out
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
          <h3 className="text-xs uppercase font-bold text-slate-400 mb-2">My Ensemble</h3>
          <p className="text-2xl font-bold text-amber-400">{currentUser.ensemble}</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
          <h3 className="text-xs uppercase font-bold text-slate-400 mb-2">My Voice Part</h3>
          <p className="text-2xl font-bold text-slate-200">{currentUser.voice_part}</p>
        </div>
      </div>

      {/* STUDENT SELF-SERVICE PASSWORD CHANGE */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl max-w-md">
        <h3 className="text-lg font-semibold text-slate-200 mb-2">Change My Password</h3>
        <p className="text-xs text-slate-400 mb-4">
          Default initial password is <code className="text-amber-400">titan123</code>. You can set a private password below.
        </p>

        <form onSubmit={handleChangePassword} className="space-y-3">
          <div>
            <label className="block text-xs text-slate-400 mb-1">Current Password</label>
            <input
              type="password"
              required
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 px-3 py-2 rounded text-sm text-white focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">New Password</label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 px-3 py-2 rounded text-sm text-white focus:outline-none focus:border-amber-400"
            />
          </div>

          {passChangeStatus.msg && (
            <p className={`text-xs ${passChangeStatus.type === 'success' ? 'text-emerald-400' : 'text-red-400'}`}>
              {passChangeStatus.msg}
            </p>
          )}

          <button
            type="submit"
            className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-2 rounded text-sm transition"
          >
            Update Password
          </button>
        </form>
      </div>
    </div>
  );
}
