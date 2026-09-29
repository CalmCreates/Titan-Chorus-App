import React, { useState } from 'react';
import { 
  Users, UserCheck, ShieldAlert, Award, PhoneCall, 
  RefreshCw, Mail, Search, CheckCircle, XCircle, 
  Calendar as CalendarIcon, Plus, ChevronRight, FileText, Settings
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('roster'); // 'roster', 'alumni', 'calendar', 'custom_fields'
  const [filterClass, setFilterClass] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showCallModal, setShowCallModal] = useState(false);
  const [callReason, setCallReason] = useState('');
  const [callNotes, setCallNotes] = useState('');

  // Sample student database
  const [students, setStudents] = useState([
    {
      id: 1,
      ocps_id: '4801234567',
      first_name: 'Jordan',
      last_name: 'Smith',
      email: 'jordan.smith@student.ocps.net',
      phone: '407-555-0192',
      graduation_year: 2027,
      status: 'Active',
      shirt_size: 'M',
      polo_size: 'M',
      class_assigned: 'A Cappella',
      voice_type: 'Tenor 1',
      paperwork_submitted: true,
      school_cash_online_paid: true,
      section_leader: true,
      committee_chair: 'Publicity Chair',
      audition_all_state: true,
      audition_all_county: true,
      audition_fl_acda: false,
      audition_national_acda: false,
      calls_home_count: 0,
      parent: { name: 'Sarah Smith', phone: '407-555-0100', email: 'sarah.smith@gmail.com' }
    },
    {
      id: 2,
      ocps_id: '4809876543',
      first_name: 'Alex',
      last_name: 'Rivera',
      email: 'alex.rivera@student.ocps.net',
      phone: '407-555-0144',
      graduation_year: 2026,
      status: 'Active',
      shirt_size: 'L',
      polo_size: 'L',
      class_assigned: 'Concert Choir',
      voice_type: 'Alto 2',
      paperwork_submitted: false,
      school_cash_online_paid: true,
      section_leader: false,
      committee_chair: null,
      audition_all_state: false,
      audition_all_county: true,
      audition_fl_acda: true,
      audition_national_acda: false,
      calls_home_count: 1,
      parent: { name: 'Carlos Rivera', phone: '407-555-0188', email: 'crivera@gmail.com' }
    }
  ]);

  // Convert iCal URL to Google Embed URL format
  const calendarEmbedUrl = "https://calendar.google.com/calendar/embed?src=c_54746e83b58761dc633c39e40e6dd52b622aa84c89efc6669e5b8081f47fdf60%40group.calendar.google.com&ctz=America%2FNew_York";

  const handleTogglePaperwork = (id) => {
    setStudents(students.map(s => s.id === id ? { ...s, paperwork_submitted: !s.paperwork_submitted } : s));
  };

  const handleTogglePayment = (id) => {
    setStudents(students.map(s => s.id === id ? { ...s, school_cash_online_paid: !s.school_cash_online_paid } : s));
  };

  const handleLogCallHome = (e) => {
    e.preventDefault();
    if (!selectedStudent) return;
    setStudents(students.map(s => s.id === selectedStudent.id ? { ...s, calls_home_count: s.calls_home_count + 1 } : s));
    setShowCallModal(false);
    setCallReason('');
    setCallNotes('');
    alert(`Call home logged for ${selectedStudent.first_name} ${selectedStudent.last_name}`);
  };

  const handleAnnualRollover = () => {
    if (window.confirm("Run Annual Rollover? This will archive seniors graduating this year and reset yearly paperwork, audition, and payment statuses for continuing students.")) {
      setStudents(students.map(s => {
        if (s.graduation_year <= 2026 && s.status === 'Active') {
          return { ...s, status: 'Archived_Alumni' };
        }
        if (s.status === 'Active') {
          return { 
            ...s, 
            paperwork_submitted: false, 
            school_cash_online_paid: false, 
            audition_all_county: false, 
            audition_all_state: false,
            audition_fl_acda: false,
            audition_national_acda: false
          };
        }
        return s;
      }));
      alert("Annual Rollover completed successfully!");
    }
  };

  return (
    <div className="flex h-screen bg-slate-900 font-sans text-slate-100">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-black border-r border-teal-900/50 flex flex-col justify-between p-4">
        <div>
          <div className="mb-6 border-b border-teal-900/40 pb-4 text-center">
            <h1 className="text-xl font-bold tracking-wider text-teal-400 uppercase">Titan Chorus</h1>
            <p className="text-[11px] text-teal-200/70 mt-1 italic font-serif">"We Strive to Touch Lives!"</p>
          </div>
          <nav className="space-y-1.5">
            <button 
              onClick={() => setActiveTab('roster')} 
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${activeTab === 'roster' ? 'bg-teal-600 text-white font-semibold' : 'text-slate-300 hover:bg-slate-800'}`}
            >
              <Users size={18} /> Active Roster
            </button>

            <button 
              onClick={() => setActiveTab('calendar')} 
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${activeTab === 'calendar' ? 'bg-teal-600 text-white font-semibold' : 'text-slate-300 hover:bg-slate-800'}`}
            >
              <CalendarIcon size={18} /> Chorus Calendar
            </button>

            <button 
              onClick={() => setActiveTab('alumni')} 
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${activeTab === 'alumni' ? 'bg-teal-600 text-white font-semibold' : 'text-slate-300 hover:bg-slate-800'}`}
            >
              <UserCheck size={18} /> Alumni Archive
            </button>
          </nav>
        </div>

        <div className="border-t border-slate-800 pt-4 space-y-2">
          <button 
            onClick={handleAnnualRollover} 
            className="w-full bg-slate-900 hover:bg-teal-950 text-teal-300 border border-teal-500/30 font-medium py-2 px-3 rounded-lg flex items-center justify-center gap-2 text-xs transition"
          >
            <RefreshCw size={14} /> Annual Rollover
          </button>
        </div>
      </aside>

      {/* Main Content Dashboard */}
      <main className="flex-1 flex flex-col overflow-hidden bg-slate-950">
        {/* Header Bar */}
        <header className="bg-slate-900 border-b border-slate-800 px-6 py-3.5 flex justify-between items-center">
          <div className="relative w-80">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search by student name or OCPS ID..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-1.5 w-full text-xs bg-slate-800 text-slate-100 border border-slate-700 rounded-md focus:outline-none focus:border-teal-500"
            />
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-400">
            <span>School Year: <strong className="text-teal-400">2026 - 2027</strong></span>
          </div>
        </header>

        {/* Tab Content Views */}
        <div className="flex-1 overflow-auto p-6">
          {/* TAB 1: ACTIVE ROSTER */}
          {activeTab === 'roster' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                  {['All', 'Titan Chorus', 'Bel Canto', 'A Cappella', 'Concert Choir', 'Treble Choir'].map((cls) => (
                    <button
                      key={cls}
                      onClick={() => setFilterClass(cls)}
                      className={`px-3 py-1 rounded-md text-xs font-medium transition ${filterClass === cls ? 'bg-teal-500 text-black font-semibold' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
                    >
                      {cls}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-slate-900 rounded-lg border border-slate-800 overflow-hidden">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-slate-950 text-slate-400 uppercase font-semibold text-[10px] border-b border-slate-800">
                    <tr>
                      <th className="p-3">Student Name</th>
                      <th className="p-3">OCPS ID</th>
                      <th className="p-3">Class & Voice</th>
                      <th className="p-3">Paperwork</th>
                      <th className="p-3">SchoolCash</th>
                      <th className="p-3">Auditions</th>
                      <th className="p-3">Leadership</th>
                      <th className="p-3">Calls Home</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {students
                      .filter(s => s.status === 'Active')
                      .filter(s => filterClass === 'All' || s.class_assigned === filterClass)
                      .filter(s => `${s.first_name} ${s.last_name} ${s.ocps_id}`.toLowerCase().includes(searchTerm.toLowerCase()))
                      .map((s) => (
                      <tr key={s.id} className="hover:bg-slate-800/60 transition">
                        <td className="p-3 font-medium text-slate-100">
                          {s.first_name} {s.last_name}
                          <div className="text-[10px] text-slate-400">Grad: '{s.graduation_year.toString().slice(-2)} | Sizes: {s.shirt_size}/{s.polo_size}</div>
                        </td>
                        <td className="p-3 text-slate-400 font-mono">{s.ocps_id}</td>
                        <td className="p-3">
                          <div className="font-semibold text-teal-400">{s.class_assigned}</div>
                          <div className="text-[10px] text-slate-400">{s.voice_type}</div>
                        </td>
                        <td className="p-3">
                          <button onClick={() => handleTogglePaperwork(s.id)}>
                            {s.paperwork_submitted 
                              ? <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold"><CheckCircle size={14}/> Complete</span>
                              : <span className="inline-flex items-center gap-1 text-rose-400 font-semibold"><XCircle size={14}/> Missing</span>}
                          </button>
                        </td>
                        <td className="p-3">
                          <button onClick={() => handleTogglePayment(s.id)}>
                            {s.school_cash_online_paid 
                              ? <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold"><CheckCircle size={14}/> Paid</span>
                              : <span className="inline-flex items-center gap-1 text-rose-400 font-semibold"><XCircle size={14}/> Unpaid</span>}
                          </button>
                        </td>
                        <td className="p-3">
                          <div className="flex flex-wrap gap-1">
                            {s.audition_all_state && <span className="bg-teal-950 text-teal-300 border border-teal-500/40 text-[9px] font-bold px-1.5 py-0.5 rounded">STATE</span>}
                            {s.audition_all_county && <span className="bg-slate-800 text-slate-300 text-[9px] font-bold px-1.5 py-0.5 rounded">COUNTY</span>}
                            {s.audition_fl_acda && <span className="bg-slate-800 text-slate-300 text-[9px] font-bold px-1.5 py-0.5 rounded">FL ACDA</span>}
                          </div>
                        </td>
                        <td className="p-3">
                          {s.section_leader && <div className="font-bold text-teal-400">Section Leader</div>}
                          {s.committee_chair && <div className="text-[10px] text-slate-400">{s.committee_chair}</div>}
                        </td>
                        <td className="p-3">
                          {s.calls_home_count > 0 ? (
                            <span className="inline-flex items-center gap-1 text-amber-400 font-bold bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800">
                              <PhoneCall size={12}/> {s.calls_home_count}
                            </span>
                          ) : <span className="text-slate-600">-</span>}
                        </td>
                        <td className="p-3 text-right">
                          <button 
                            onClick={() => { setSelectedStudent(s); setShowCallModal(true); }}
                            className="text-xs bg-slate-800 hover:bg-slate-700 text-teal-300 px-2.5 py-1 rounded transition"
                          >
                            Log Call
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: CHORUS CALENDAR */}
          {activeTab === 'calendar' && (
            <div className="h-full flex flex-col space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold text-teal-400">Titan Chorus Calendar</h2>
                <a 
                  href="https://calendar.google.com/calendar/r" 
                  target="_blank" 
                  rel="noreferrer"
                  className="text-xs bg-teal-600 hover:bg-teal-500 text-white font-medium px-3 py-1.5 rounded transition"
                >
                  Open in Google Calendar
                </a>
              </div>
              <div className="flex-1 bg-slate-900 border border-slate-800 rounded-lg overflow-hidden min-h-[500px]">
                <iframe 
                  src={calendarEmbedUrl}
                  style={{ border: 0, width: '100%', height: '100%', minHeight: '550px' }} 
                  frameBorder="0" 
                  scrolling="no"
                  title="Titan Chorus Calendar"
                ></iframe>
              </div>
            </div>
          )}

          {/* TAB 3: ALUMNI ARCHIVE */}
          {activeTab === 'alumni' && (
            <div className="space-y-4">
              <div className="bg-slate-900 p-4 rounded-lg border border-slate-800 flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-bold text-teal-400">Automated Alumni Outreach</h3>
                  <p className="text-xs text-slate-400">Seniors are automatically added to this archive upon graduation rollover.</p>
                </div>
                <button 
                  onClick={() => alert("Alumni newsletter invitation emails dispatched via SendGrid API!")}
                  className="bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs px-3 py-2 rounded flex items-center gap-2"
                >
                  <Mail size={14} /> Broadcast Alumni Newsletter
                </button>
              </div>

              <div className="bg-slate-900 rounded-lg border border-slate-800 overflow-hidden">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-slate-950 text-slate-400 uppercase font-semibold text-[10px] border-b border-slate-800">
                    <tr>
                      <th className="p-3">Alumni Name</th>
                      <th className="p-3">Grad Class</th>
                      <th className="p-3">Contact Email</th>
                      <th className="p-3">Parent Info</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {students.filter(s => s.status === 'Archived_Alumni').map(alumni => (
                      <tr key={alumni.id}>
                        <td className="p-3 font-semibold text-slate-200">{alumni.first_name} {alumni.last_name}</td>
                        <td className="p-3 text-teal-400 font-bold">Class of {alumni.graduation_year}</td>
                        <td className="p-3 text-slate-300">{alumni.email}</td>
                        <td className="p-3 text-slate-400">{alumni.parent.name} ({alumni.parent.phone})</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Call Home Log Modal */}
      {showCallModal && selectedStudent && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-teal-500/40 rounded-lg max-w-md w-full p-6 space-y-4">
            <h3 className="text-sm font-bold text-teal-400">Log Call Home: {selectedStudent.first_name} {selectedStudent.last_name}</h3>
            <form onSubmit={handleLogCallHome} className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Reason for Call</label>
                <input 
                  type="text" 
                  required
                  value={callReason}
                  onChange={(e) => setCallReason(e.target.value)}
                  placeholder="e.g., Missing Paperwork, Fee Due, Praise" 
                  className="w-full text-xs bg-slate-800 border border-slate-700 rounded p-2 text-slate-100"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Log Notes</label>
                <textarea 
                  rows={3}
                  value={callNotes}
                  onChange={(e) => setCallNotes(e.target.value)}
                  placeholder="Summarize discussion with parent..." 
                  className="w-full text-xs bg-slate-800 border border-slate-700 rounded p-2 text-slate-100"
                ></textarea>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button 
                  type="button" 
                  onClick={() => setShowCallModal(false)}
                  className="text-xs px-3 py-1.5 rounded bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="text-xs px-3 py-1.5 rounded bg-teal-600 text-white font-semibold"
                >
                  Save Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
