import React, { useState, useEffect, useRef } from 'react';

const API_BASE = "https://titan-chorus-app.onrender.com/api";

const DAILY_QUOTES = [
  "Music can change the world because it can change people. — Bono",
  "Where words fail, music speaks. — Hans Christian Andersen",
  "We don't sing because we are happy; we are happy because we sing. — William James",
  "To sing is to pray twice. — Saint Augustine",
  "Choral singing is a model for human harmony. — Eric Whitacre",
  "Music is the literature of the heart; it commences where speech ends. — Alphonse de Lamartine",
  "Excellence is not an act, but a habit. Practice with purpose! — Aristotle",
  "The only thing better than singing is more singing. — Ella Fitzgerald",
  "Singing in a choir is a unique opportunity to build harmony together.",
  "Music produces a kind of pleasure which human nature cannot do without. — Confucius",
  "One good thing about music, when it hits you, you feel no pain. — Bob Marley",
  "Strive for progress, not perfection.",
  "There is no harmony without diversity of voices.",
  "Your voice is an instrument like no other; care for it and lead with heart.",
  "Music gives a soul to the universe, wings to the mind, and life to everything. — Plato",
  "Great choirs are not made of great voices, but of committed hearts.",
  "Listen with your ears, sing with your soul.",
  "Vocal energy is contagious — lift up those singing beside you!",
  "A choir is the ultimate team sport.",
  "Consistency in rehearsal breeds confidence on stage.",
  "When you sing, you open your heart to the world.",
  "Music brings us together when words alone fall short.",
  "Tone quality is built note by note, breath by breath.",
  "Every rehearsal is an opportunity to touch a life.",
  "Sing with conviction, perform with passion.",
  "Posture, breath, support — the foundation of every great phrase.",
  "The secret to choir unity is active listening.",
  "Believe in your sound, trust your choir family.",
  "Music washes away from the soul the dust of everyday life. — Berthold Auerbach",
  "We strive to touch lives through the power of song!",
  "Sing like nobody is listening, rehearse like everyone is."
];

const DEFAULT_FVA_TERMS = [
  { num: 1, term: "Anacrusis", definition: "upbeat or pickup", category: "Music Terms" },
  { num: 2, term: "Arpeggio", definition: "the notes of the chord played in succession to one another, rather than simultaneously; a broken chord", category: "Music Terms" },
  { num: 3, term: "Chromatic", definition: "motion by half steps; also describes harmony or melody that employs some of the sequential 12 pitches in an octave", category: "Music Terms" },
  { num: 4, term: "Descant", definition: "a high obligato part above the melody", category: "Music Terms" },
  { num: 5, term: "Divisi", definition: "performers singing the same part are divided to sing different parts.", category: "Music Terms" },
  { num: 6, term: "Falsetto", definition: "type of vocal phonation that enables the singer to sing notes beyond the normal vocal range.", category: "Music Terms" },
  { num: 7, term: "Fermata", definition: "a pause or hold", category: "Music Terms" },
  { num: 8, term: "Improvisation", definition: "music that is created spontaneously", category: "Music Terms" },
  { num: 9, term: "Interval", definition: "the relationship between two pitches, the distance between an upper and a lower pitch", category: "Music Terms" },
  { num: 10, term: "Ledger lines", definition: "short horizontal lines used to extend a staff either higher or lower", category: "Music Terms" },
  { num: 11, term: "Mezzo forte", definition: "medium loud", category: "Music Terms" },
  { num: 12, term: "Modulation", definition: "to change key within a composition", category: "Music Terms" },
  { num: 13, term: "Opera", definition: "a major vocal work that involves theatrical elements", category: "Music Terms" },
  { num: 14, term: "Oratorio", definition: "large scale musical composition on a sacred subject.", category: "Music Terms" },
  { num: 15, term: "Senza", definition: "without", category: "Music Terms" },
  { num: 16, term: "Solfege", definition: "a system used for teaching sight-reading (Do-Re-Mi)", category: "Music Terms" },
  { num: 17, term: "Tessitura", definition: "most widely used range of pitches in a piece of music", category: "Music Terms" },
  { num: 18, term: "Triad", definition: "three note chord consisting of the root, third, and fifth", category: "Music Terms" },
  { num: 19, term: "Vibrato", definition: "a rapid fluctuation of pitch slightly higher or lower than the main pitch", category: "Music Terms" },
  { num: 20, term: "Form", definition: "the organization and structure of a composition", category: "Form" },
  { num: 21, term: "Binary form", definition: "AB- form of a composition that has two distinct sections", category: "Form" },
  { num: 22, term: "Strophic", definition: "describes a song where the stanzas are all sung to the same music", category: "Form" },
  { num: 23, term: "Part song", definition: "an unaccompanied homophonic choral composition for three or more voices", category: "Form" },
  { num: 24, term: "D. C. or Da Capo", definition: "repeat from the beginning of the composition", category: "Form" },
  { num: 25, term: "Bel canto", definition: "“beautiful singing”; an Italian Opera term", category: "Style and Phrasing" },
  { num: 26, term: "Cantabile", definition: "in a singing style; singable", category: "Style and Phrasing" },
  { num: 27, term: "Dolce", definition: "sweetly, usually also softly", category: "Style and Phrasing" },
  { num: 28, term: "Espressivo", definition: "to play or sing with expression", category: "Style and Phrasing" },
  { num: 29, term: "Legato", definition: "to play or sing in a smooth, connected manner", category: "Style and Phrasing" },
  { num: 30, term: "Meno mosso", definition: "less motion", category: "Style and Phrasing" },
  { num: 31, term: "Motif", definition: "a short musical idea or melodic theme, usually shorter than a musical phrase", category: "Style and Phrasing" },
  { num: 32, term: "Niente", definition: "dying away to nothing", category: "Style and Phrasing" },
  { num: 33, term: "Poco piu mosso", definition: "a little more motion", category: "Style and Phrasing" },
  { num: 34, term: "Sforzando", definition: "strongly accented; forced", category: "Style and Phrasing" },
  { num: 35, term: "Sotto voce", definition: "Softly; with subdued sound; performed in an undertone", category: "Style and Phrasing" },
  { num: 36, term: "Subito", definition: "suddenly; quickly", category: "Style and Phrasing" },
  { num: 37, term: "A tempo", definition: "return to the original tempo after some deviation", category: "Tempo and Meter" },
  { num: 38, term: "Accelerando", definition: "becoming gradually faster", category: "Tempo and Meter" },
  { num: 39, term: "Allargando", definition: "slowing of tempo, usually with increasing volume; most frequently occurs toward the end of a piece", category: "Tempo and Meter" },
  { num: 40, term: "Allegro con spirito", definition: "fast tempo with spirit", category: "Tempo and Meter" },
  { num: 41, term: "Andante", definition: "rather slow, at a moderate walking speed", category: "Tempo and Meter" },
  { num: 42, term: "Grandioso", definition: "grand, majestic", category: "Tempo and Meter" },
  { num: 43, term: "Largo", definition: "very slow and broad", category: "Tempo and Meter" },
  { num: 44, term: "L’istesso", definition: "the beat remains constant when the meter changes", category: "Tempo and Meter" },
  { num: 45, term: "Meter", definition: "indicated by a time signature, can be simple or compound", category: "Tempo and Meter" },
  { num: 46, term: "Presto", definition: "very fast; faster than allegro", category: "Tempo and Meter" },
  { num: 47, term: "Rallentando", definition: "gradually slowing down", category: "Tempo and Meter" },
  { num: 48, term: "Rubato", definition: "Making the established pulse flexible by accelerating and slowing down the tempo; an expressive device", category: "Tempo and Meter" },
  { num: 49, term: "Tranquillo", definition: "to perform in a relaxed tempo", category: "Tempo and Meter" },
  { num: 50, term: "Vivace", definition: "lively; briskly", category: "Tempo and Meter" }
];

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  // Director View Switcher
  const [viewAsStudentMode, setViewAsStudentMode] = useState(false);

  // Audio Instrument & Metronome
  const [audioInstrument, setAudioInstrument] = useState('pitch_pipe');
  const [octaveOffset, setOctaveOffset] = useState(0);
  const [activePitch, setActivePitch] = useState(null);
  const [bpm, setBpm] = useState(100);
  const [isPlayingMetronome, setIsPlayingMetronome] = useState(false);
  const audioCtxRef = useRef(null);
  const metronomeTimerRef = useRef(null);

  // Master Roster & Risers
  const [students, setStudents] = useState([]);
  const [ensembles, setEnsembles] = useState([]);
  const [filterEnsemble, setFilterEnsemble] = useState('All Ensembles');
  const [overflowEnabled, setOverflowEnabled] = useState(false);

  // FVA Practice Hub State
  const [fvaTerms, setFvaTerms] = useState(DEFAULT_FVA_TERMS);
  const [fvaDisplayMode, setFvaDisplayMode] = useState('category');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [termIndex, setTermIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  // EAR TRAINING HUB STATE
  const [earModule, setEarModule] = useState('intervals');
  const [earMode, setEarMode] = useState('practice');
  const [earQuestion, setEarQuestion] = useState(null);
  const [earFeedback, setEarFeedback] = useState('');
  const [earScore, setEarScore] = useState({ correct: 0, total: 0 });

  // EVENT ATTENDANCE STATE
  const [eventsList, setEventsList] = useState([]);
  const [selectedEventReport, setSelectedEventReport] = useState(null);
  const [eventReportData, setEventReportData] = useState([]);
  const [checkInStatusMsg, setCheckInStatusMsg] = useState('');

  // Director New Event Form
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventLocation, setNewEventLocation] = useState('Olympia HS Choir Room');
  const [newEventDate, setNewEventDate] = useState('');
  const [newEventCallTime, setNewEventCallTime] = useState('');
  const [newEventLat, setNewEventLat] = useState(28.5284);
  const [newEventLon, setNewEventLon] = useState(-81.5471);
  const [newEventRadius, setNewEventRadius] = useState(150);

  // SHEET MUSIC STATE
  const [sheetMusicList, setSheetMusicList] = useState([]);
  const [selectedConcertFolder, setSelectedConcertFolder] = useState('ALL SHEET MUSIC');
  const [concertFolders, setConcertFolders] = useState(['Fall Choral Showcase', 'Winter Concert', 'MPA Assessment', 'Spring Concert']);
  const [newFolderName, setNewFolderName] = useState('');
  const [previewPdf, setPreviewPdf] = useState(null);
  const [newPieceTitle, setNewPieceTitle] = useState('');
  const [newPieceComposer, setNewPieceComposer] = useState('');
  const [newPieceFolder, setNewPieceFolder] = useState('Fall Choral Showcase');
  const [newPiecePdfData, setNewPiecePdfData] = useState('');

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

  const whiteKeys = [
    { note: 'B3', label: 'B3', freq: 246.94 },
    { note: 'C4', label: 'C4', freq: 261.63 },
    { note: 'D4', label: 'D4', freq: 293.66 },
    { note: 'E4', label: 'E4', freq: 329.63 },
    { note: 'F4', label: 'F4', freq: 349.23 },
    { note: 'G4', label: 'G4', freq: 392.00 },
    { note: 'A4', label: 'A4', freq: 440.00 },
    { note: 'B4', label: 'B4', freq: 493.88 },
    { note: 'C5', label: 'C5', freq: 523.25 }
  ];

  const blackKeys = [
    { note: 'C#4', label: 'C#/Db', freq: 277.18, leftPos: '14.5%' },
    { note: 'D#4', label: 'D#/Eb', freq: 311.13, leftPos: '26.5%' },
    { note: 'F#4', label: 'F#/Gb', freq: 369.99, leftPos: '50.5%' },
    { note: 'G#4', label: 'G#/Ab', freq: 415.30, leftPos: '62.5%' },
    { note: 'A#4', label: 'A#/Bb', freq: 466.16, leftPos: '74.5%' }
  ];

  // Helper for Daily Quote & Formatting Date
  const getDailyQuote = () => {
    const today = new Date();
    const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
    return DAILY_QUOTES[dayOfYear % DAILY_QUOTES.length];
  };

  const getFormattedDate = () => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  useEffect(() => {
    if (currentUser) {
      fetchEnsembles();
      fetchStudents();
      fetchFvaTerms();
      fetchEvents();
      fetchSheetMusic();
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

  const playFrequency = (baseFreq, noteName) => {
    try {
      const ctx = getAudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

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
      if (res.ok) setEnsembles(await res.json());
    } catch (e) { console.error('Error fetching ensembles:', e); }
  };

  const fetchStudents = async () => {
    try {
      const res = await fetch(`${API_BASE}/students`);
      if (res.ok) setStudents(await res.json());
    } catch (e) { console.error('Error fetching roster:', e); }
  };

  const fetchFvaTerms = async () => {
    try {
      const res = await fetch(`${API_BASE}/fva-terms`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) setFvaTerms(data);
      }
    } catch (e) { console.error('Error fetching FVA terms:', e); }
  };

  const fetchEvents = async () => {
    try {
      const res = await fetch(`${API_BASE}/events`);
      if (res.ok) setEventsList(await res.json());
    } catch (e) { console.error('Error fetching events:', e); }
  };

  const fetchSheetMusic = async () => {
    try {
      const res = await fetch(`${API_BASE}/sheet-music`);
      if (res.ok) setSheetMusicList(await res.json());
    } catch (e) { console.error('Error fetching sheet music:', e); }
  };

  const handleGetCurrentGps = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setNewEventLat(pos.coords.latitude);
          setNewEventLon(pos.coords.longitude);
          alert(`Captured Venue GPS Coordinates:\nLatitude: ${pos.coords.latitude}\nLongitude: ${pos.coords.longitude}`);
        },
        (err) => alert("GPS Permission denied or unavailable.")
      );
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    try {
      await fetch(`${API_BASE}/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newEventTitle,
          location_name: newEventLocation,
          event_date: newEventDate,
          call_time: newEventCallTime,
          latitude: newEventLat,
          longitude: newEventLon,
          radius_feet: newEventRadius
        })
      });
      setNewEventTitle('');
      fetchEvents();
    } catch (err) {
      console.error('Error creating event:', err);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (window.confirm("Delete this event and all check-in records?")) {
      try {
        await fetch(`${API_BASE}/events/${eventId}`, { method: 'DELETE' });
        fetchEvents();
        if (selectedEventReport && selectedEventReport.id === eventId) setSelectedEventReport(null);
      } catch (err) { console.error('Error deleting event:', err); }
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "application/pdf") {
      const reader = new FileReader();
      reader.onloadend = () => setNewPiecePdfData(reader.result);
      reader.readAsDataURL(file);
    } else {
      alert("Please upload a valid PDF document.");
    }
  };

  const handleSaveSheetMusic = async (e) => {
    e.preventDefault();
    if (!newPiecePdfData) {
      alert("Please select a PDF file first.");
      return;
    }
    try {
      await fetch(`${API_BASE}/sheet-music`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newPieceTitle,
          composer: newPieceComposer,
          concert_folder: newPieceFolder,
          pdf_data: newPiecePdfData
        })
      });
      setNewPieceTitle('');
      setNewPieceComposer('');
      setNewPiecePdfData('');
      fetchSheetMusic();
    } catch (e) {
      console.error('Error uploading score:', e);
    }
  };

  const handleDeleteSheetMusic = async (id) => {
    if (window.confirm("Are you sure you want to delete this score?")) {
      try {
        await fetch(`${API_BASE}/sheet-music/${id}`, { method: 'DELETE' });
        fetchSheetMusic();
        if (previewPdf && previewPdf.id === id) setPreviewPdf(null);
      } catch (e) { console.error('Error deleting score:', e); }
    }
  };

  const handleStudentGpsCheckIn = (eventId) => {
    setCheckInStatusMsg("🛰 Accessing GPS Location...");
    if (!navigator.geolocation) {
      setCheckInStatusMsg("❌ Geolocation is not supported by your device.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res = await fetch(`${API_BASE}/attendance/checkin`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              event_id: eventId,
              student_id: currentUser.student_id,
              student_name: currentUser.name,
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude
            })
          });
          const data = await res.json();
          setCheckInStatusMsg(data.message);
        } catch (err) {
          setCheckInStatusMsg("❌ Connection error while logging attendance.");
        }
      },
      (err) => {
        setCheckInStatusMsg("❌ Location Permission Denied. Please enable GPS location services on your device.");
      },
      { enableHighAccuracy: true }
    );
  };

  const handleFetchAttendanceReport = async (event) => {
    setSelectedEventReport(event);
    try {
      const res = await fetch(`${API_BASE}/attendance/report/${event.id}`);
      if (res.ok) setEventReportData(await res.json());
    } catch (e) { console.error('Error fetching report:', e); }
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
        setErrorMsg(data.message || 'Invalid Student ID or Password');
      }
    } catch (err) {
      setErrorMsg('Connection error. Is backend online?');
    }
  };

  // ALPHABETICAL DE-DUPLICATED ROSTER COMPUTATION
  const getProcessedRoster = () => {
    let filtered = filterEnsemble === 'All Ensembles'
      ? students
      : students.filter(s => s.ensemble === filterEnsemble || s.additional_ensembles?.includes(filterEnsemble));

    const uniqueMap = new Map();
    filtered.forEach(s => {
      if (!uniqueMap.has(s.student_id)) {
        uniqueMap.set(s.student_id, s);
      }
    });

    const sorted = Array.from(uniqueMap.values()).sort((a, b) => {
      const lastCompare = a.last_name.localeCompare(b.last_name);
      if (lastCompare !== 0) return lastCompare;
      return a.first_name.localeCompare(b.first_name);
    });

    return sorted.map((item, idx) => ({ ...item, rosterNumber: idx + 1 }));
  };

  // EAR TRAINING MODULE SWITCHING & PLAYBACK LOGIC
  const handleModuleSwitch = (moduleName) => {
    setEarModule(moduleName);
    setEarScore({ correct: 0, total: 0 });
    setEarFeedback('');
    setEarQuestion(null);
  };

  const resetEarScore = () => {
    setEarScore({ correct: 0, total: 0 });
    setEarFeedback('');
  };

  const generateEarQuestion = () => {
    setEarFeedback('');
    const baseFreq = 261.63;
    if (earModule === 'intervals') {
      const intervals = [
        { name: 'Unison', semitones: 0 },
        { name: 'Minor 2nd', semitones: 1 },
        { name: 'Major 2nd', semitones: 2 },
        { name: 'Minor 3rd', semitones: 3 },
        { name: 'Major 3rd', semitones: 4 },
        { name: 'Perfect 4th', semitones: 5 },
        { name: 'Tritone', semitones: 6 },
        { name: 'Perfect 5th', semitones: 7 },
        { name: 'Minor 6th', semitones: 8 },
        { name: 'Major 6th', semitones: 9 },
        { name: 'Minor 7th', semitones: 10 },
        { name: 'Major 7th', semitones: 11 },
        { name: 'Octave', semitones: 12 }
      ];
      const picked = intervals[Math.floor(Math.random() * intervals.length)];
      const freq2 = baseFreq * Math.pow(2, picked.semitones / 12);
      setEarQuestion({ answer: picked.name, freq1: baseFreq, freq2 });
      playIntervalMelodicThenHarmonic(baseFreq, freq2);
    } else {
      const chords = [
        { name: 'Major Triad', ratios: [0, 4, 7] },
        { name: 'Minor Triad', ratios: [0, 3, 7] },
        { name: 'Augmented Triad', ratios: [0, 4, 8] },
        { name: 'Diminished Triad', ratios: [0, 3, 6] }
      ];
      const picked = chords[Math.floor(Math.random() * chords.length)];
      const freqs = picked.ratios.map(r => baseFreq * Math.pow(2, r / 12));
      setEarQuestion({ answer: picked.name, freqs });
      playChordMelodicThenHarmonicSlower(freqs);
    }
  };

  const playIntervalMelodicThenHarmonic = (f1, f2) => {
    try {
      const ctx = getAudioContext();
      const osc1 = ctx.createOscillator();
      const g1 = ctx.createGain();
      osc1.frequency.setValueAtTime(f1, ctx.currentTime);
      g1.gain.setValueAtTime(0.3, ctx.currentTime);
      g1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
      osc1.connect(g1); g1.connect(ctx.destination);
      osc1.start(ctx.currentTime); osc1.stop(ctx.currentTime + 1.2);

      const osc2 = ctx.createOscillator();
      const g2 = ctx.createGain();
      osc2.frequency.setValueAtTime(f2, ctx.currentTime + 1.5);
      g2.gain.setValueAtTime(0.3, ctx.currentTime + 1.5);
      g2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2.7);
      osc2.connect(g2); g2.connect(ctx.destination);
      osc2.start(ctx.currentTime + 1.5); osc2.stop(ctx.currentTime + 2.7);

      const hOsc1 = ctx.createOscillator();
      const hOsc2 = ctx.createOscillator();
      const hG = ctx.createGain();
      hOsc1.frequency.setValueAtTime(f1, ctx.currentTime + 3.0);
      hOsc2.frequency.setValueAtTime(f2, ctx.currentTime + 3.0);
      hG.gain.setValueAtTime(0.25, ctx.currentTime + 3.0);
      hG.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 4.5);
      hOsc1.connect(hG); hOsc2.connect(hG); hG.connect(ctx.destination);
      hOsc1.start(ctx.currentTime + 3.0); hOsc1.stop(ctx.currentTime + 4.5);
      hOsc2.start(ctx.currentTime + 3.0); hOsc2.stop(ctx.currentTime + 4.5);

    } catch (e) { console.error('Audio Error:', e); }
  };

  const playChordMelodicThenHarmonicSlower = (freqs) => {
    try {
      const ctx = getAudioContext();
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        const t = ctx.currentTime + (idx * 1.0);
        osc.frequency.setValueAtTime(freq, t);
        g.gain.setValueAtTime(0.3, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 1.2);
        osc.connect(g); g.connect(ctx.destination);
        osc.start(t); osc.stop(t + 1.2);
      });

      freqs.forEach((freq) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        const t = ctx.currentTime + 3.5;
        osc.frequency.setValueAtTime(freq, t);
        g.gain.setValueAtTime(0.2, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 2.0);
        osc.connect(g); g.connect(ctx.destination);
        osc.start(t); osc.stop(t + 2.0);
      });
    } catch (e) { console.error('Chord Audio Error:', e); }
  };

  const handleAnswerEarQuestion = (userChoice) => {
    if (!earQuestion) return;
    if (userChoice === earQuestion.answer) {
      setEarFeedback('✓ Correct!');
      if (earMode === 'test') setEarScore(prev => ({ correct: prev.correct + 1, total: prev.total + 1 }));
    } else {
      setEarFeedback(`❌ Incorrect. Answer was: ${earQuestion.answer}`);
      if (earMode === 'test') setEarScore(prev => ({ ...prev, total: prev.total + 1 }));
    }
  };

  const handleSaveUniformChecklist = async (updatedState) => {
    setStudentUniforms(updatedState);
    try {
      await fetch(`${API_BASE}/students/uniform`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ student_id: currentUser.student_id, ...updatedState })
      });
      fetchStudents();
    } catch (e) { console.error('Error updating uniform:', e); }
  };

  // LOGIN SCREEN
  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100 p-4">
        <div className="bg-slate-900 border border-teal-800/60 p-8 rounded-xl shadow-2xl max-w-md w-full">
          <div className="text-center mb-6">
            <a href="https://www.instagram.com/olympiatitanchorus" target="_blank" rel="noreferrer" className="inline-block transform hover:scale-105 transition mb-3">
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
                placeholder="Enter Student ID or ADMIN"
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

  // DAILY MOTIVATIONAL BANNER COMPONENT
  const renderDailyMotivationHeader = () => (
    <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 border border-teal-500/40 p-4 rounded-xl mb-6 shadow-xl flex flex-col md:flex-row justify-between items-center text-center md:text-left gap-3">
      <div>
        <span className="text-[10px] font-bold uppercase tracking-widest text-teal-300 block mb-0.5">
          📅 TODAY IS {getFormattedDate().toUpperCase()}
        </span>
        <p className="text-sm font-semibold text-amber-200 italic">
          "{getDailyQuote()}"
        </p>
      </div>
      <span className="text-xs bg-teal-900/60 border border-teal-500/50 text-teal-300 font-bold px-3 py-1.5 rounded-full whitespace-nowrap">
        ✨ Titan Inspiration
      </span>
    </div>
  );

  // REHEARSAL AUDIO TOOLBAR WIDGET
  const renderAudioToolbar = () => (
    <div className="bg-slate-900 border border-teal-900/40 p-5 rounded-xl mb-6">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-4 border-b border-slate-800 pb-3">
        <div>
          <h3 className="text-sm font-bold text-teal-400 uppercase tracking-wider">🎹 Rehearsal Pitch & Metronome Tools</h3>
          <p className="text-xs text-slate-400">Toggle between Pitch Pipe and Piano (B3-C5)</p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setAudioInstrument('pitch_pipe')}
            className={`px-3 py-1.5 rounded text-xs font-bold transition border ${
              audioInstrument === 'pitch_pipe' ? 'bg-teal-600 text-white border-teal-400' : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            🎵 Pitch Pipe
          </button>
          <button
            onClick={() => setAudioInstrument('piano')}
            className={`px-3 py-1.5 rounded text-xs font-bold transition border ${
              audioInstrument === 'piano' ? 'bg-teal-600 text-white border-teal-400' : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            🎹 Keyboard (B3–C5)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
              isPlayingMetronome ? 'bg-red-600 text-white' : 'bg-teal-600 text-white'
            }`}
          >
            {isPlayingMetronome ? '⏹ Stop' : '▶ Start'}
          </button>
        </div>

        <div className="md:col-span-2 bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-xs font-bold text-teal-300 uppercase">
              {audioInstrument === 'pitch_pipe' ? '🎵 Chromatic Pitch Pipe' : '🎹 Rehearsal Keyboard (B3–C5)'}
            </h4>

            <div className="flex items-center space-x-1">
              <span className="text-[10px] text-slate-400 uppercase mr-1">Octave Shift:</span>
              {[-2, -1, 0, 1, 2].map((off) => (
                <button
                  key={off}
                  onClick={() => setOctaveOffset(off)}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold transition border ${
                    octaveOffset === off ? 'bg-amber-500 text-slate-950 border-white' : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  {off === 0 ? 'Std' : off > 0 ? `+${off}` : off}
                </button>
              ))}
            </div>
          </div>

          {audioInstrument === 'pitch_pipe' ? (
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {pitchPipePitches.map((p) => (
                <button
                  key={p.note}
                  onClick={() => playFrequency(p.freq, p.note)}
                  className={`py-3 rounded font-mono font-bold text-xs transition border flex flex-col items-center justify-center ${
                    activePitch === p.note ? 'bg-teal-500 text-slate-950 border-white' : 'bg-slate-900 text-slate-200 border-slate-800'
                  }`}
                >
                  <span>{p.note}</span>
                  <span className="text-[9px] text-teal-300 font-normal">{p.label}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto pb-2">
              <div className="relative min-w-[500px] h-36 bg-slate-900 p-2 rounded-lg border border-slate-800 select-none flex justify-center">
                <div className="flex w-full h-full relative">
                  {whiteKeys.map((wk) => (
                    <button
                      key={wk.note}
                      onClick={() => playFrequency(wk.freq, wk.note)}
                      className={`flex-1 h-full bg-slate-100 text-slate-900 border border-slate-400 rounded-b flex flex-col justify-end items-center pb-2 transition shadow-inner ${
                        activePitch === wk.note ? '!bg-amber-400 ring-2 ring-amber-300' : ''
                      }`}
                    >
                      <span className="text-[10px] font-extrabold font-mono">{wk.label}</span>
                    </button>
                  ))}

                  {blackKeys.map((bk) => (
                    <button
                      key={bk.note}
                      onClick={() => playFrequency(bk.freq, bk.note)}
                      style={{ left: bk.leftPos }}
                      className={`absolute top-0 w-[10%] h-[60%] bg-slate-950 text-teal-300 border border-slate-700 rounded-b flex flex-col justify-end items-center pb-1 transition z-20 shadow-2xl ${
                        activePitch === bk.note ? '!bg-amber-500 text-slate-950 ring-2 ring-amber-300' : ''
                      }`}
                    >
                      <span className="text-[8px] font-bold font-mono text-center leading-tight">{bk.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // DIRECTOR SHEET MUSIC LIBRARY COMPONENT
  const renderDirectorMusicLibrary = () => {
    const filteredScores = selectedConcertFolder === 'ALL SHEET MUSIC'
      ? sheetMusicList
      : sheetMusicList.filter(s => s.concert_folder === selectedConcertFolder);

    return (
      <section className="bg-slate-900 border border-teal-900/40 p-6 rounded-xl mb-6 space-y-6">
        <div className="flex flex-wrap justify-between items-center gap-4 border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-xl font-bold text-teal-400">🎼 Concert Sheet Music Library</h2>
            <p className="text-xs text-slate-400">Upload and preview emergency backup PDF scores organized by Concert Folder.</p>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="text"
              placeholder="Add New Concert Folder..."
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              className="bg-slate-800 border border-slate-700 px-3 py-1.5 rounded text-xs text-white"
            />
            <button
              onClick={() => {
                if (newFolderName.trim() && !concertFolders.includes(newFolderName)) {
                  setConcertFolders([...concertFolders, newFolderName.trim()]);
                  setNewFolderName('');
                }
              }}
              className="bg-teal-600 hover:bg-teal-500 text-white font-bold px-3 py-1.5 rounded text-xs"
            >
              + Add Folder
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {['ALL SHEET MUSIC', ...concertFolders].map((folder) => (
            <button
              key={folder}
              onClick={() => setSelectedConcertFolder(folder)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition border ${
                selectedConcertFolder === folder
                  ? 'bg-amber-500 text-slate-950 border-white'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
              }`}
            >
              📁 {folder}
            </button>
          ))}
        </div>

        <form onSubmit={handleSaveSheetMusic} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
          <h3 className="text-xs font-bold text-teal-300 uppercase">+ Upload New PDF Score</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              type="text"
              required
              placeholder="Score Title (e.g. Sicut Cervus)"
              value={newPieceTitle}
              onChange={(e) => setNewPieceTitle(e.target.value)}
              className="bg-slate-800 border border-slate-700 px-3 py-2 rounded text-xs text-white"
            />
            <input
              type="text"
              placeholder="Composer (e.g. Palestrina)"
              value={newPieceComposer}
              onChange={(e) => setNewPieceComposer(e.target.value)}
              className="bg-slate-800 border border-slate-700 px-3 py-2 rounded text-xs text-white"
            />
            <select
              value={newPieceFolder}
              onChange={(e) => setNewPieceFolder(e.target.value)}
              className="bg-slate-800 border border-slate-700 px-3 py-2 rounded text-xs text-white"
            >
              {concertFolders.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-2">
            <input
              type="file"
              accept="application/pdf"
              onChange={handleFileUpload}
              className="text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-teal-400 hover:file:bg-slate-700 cursor-pointer"
            />
            <button
              type="submit"
              className="w-full sm:w-auto bg-teal-600 hover:bg-teal-500 text-white font-bold px-6 py-2 rounded-lg text-xs transition shadow-md"
            >
              Save to Library
            </button>
          </div>
        </form>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredScores.map((score) => (
            <div key={score.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-between space-y-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider block mb-1">
                  📁 {score.concert_folder}
                </span>
                <h4 className="text-base font-bold text-white leading-snug">{score.title}</h4>
                <p className="text-xs text-slate-400">{score.composer}</p>
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-slate-800/80">
                <button
                  onClick={() => setPreviewPdf(score)}
                  className="bg-teal-600 hover:bg-teal-500 text-white font-bold px-3 py-1.5 rounded text-xs transition"
                >
                  👁 Open PDF Reader
                </button>
                <button
                  onClick={() => handleDeleteSheetMusic(score.id)}
                  className="text-rose-400 hover:text-rose-300 font-bold text-xs"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {previewPdf && (
          <div className="fixed inset-0 bg-slate-950/90 z-50 flex flex-col p-4 md:p-8">
            <div className="flex justify-between items-center bg-slate-900 border border-slate-800 p-4 rounded-t-xl">
              <div>
                <h3 className="text-lg font-bold text-teal-400">{previewPdf.title}</h3>
                <p className="text-xs text-slate-400">{previewPdf.composer} — Folder: {previewPdf.concert_folder}</p>
              </div>
              <button
                onClick={() => setPreviewPdf(null)}
                className="bg-rose-600 hover:bg-rose-500 text-white font-bold px-4 py-2 rounded text-xs"
              >
                ✕ Close Reader
              </button>
            </div>

            <iframe
              src={previewPdf.pdf_data}
              title="PDF Reader"
              className="w-full flex-1 rounded-b-xl border border-slate-800 bg-white"
            />
          </div>
        )}
      </section>
    );
  };

  // DIRECTOR EVENT MANAGEMENT & ATTENDANCE REPORTING
  const renderDirectorAttendanceManager = () => (
    <section className="bg-slate-900 border border-teal-900/40 p-6 rounded-xl mb-6 space-y-6">
      <div className="border-b border-slate-800 pb-3">
        <h2 className="text-xl font-bold text-teal-400">📍 Event GPS Attendance Manager</h2>
        <p className="text-xs text-slate-400">Create performance events with 150 ft GPS geofences and generate live check-in reports.</p>
      </div>

      <form onSubmit={handleCreateEvent} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
        <h3 className="text-xs font-bold text-teal-300 uppercase">+ Create New Event with GPS Geofence</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <input
            type="text"
            required
            placeholder="Event Title (e.g. Fall Showcase Call)"
            value={newEventTitle}
            onChange={(e) => setNewEventTitle(e.target.value)}
            className="bg-slate-800 border border-slate-700 px-3 py-2 rounded text-xs text-white"
          />
          <input
            type="text"
            required
            placeholder="Venue Name (e.g. Auditorium)"
            value={newEventLocation}
            onChange={(e) => setNewEventLocation(e.target.value)}
            className="bg-slate-800 border border-slate-700 px-3 py-2 rounded text-xs text-white"
          />
          <input
            type="text"
            required
            placeholder="Date (e.g. Oct 28, 2026)"
            value={newEventDate}
            onChange={(e) => setNewEventDate(e.target.value)}
            className="bg-slate-800 border border-slate-700 px-3 py-2 rounded text-xs text-white"
          />
          <input
            type="text"
            required
            placeholder="Call Time (e.g. 6:15 PM Call)"
            value={newEventCallTime}
            onChange={(e) => setNewEventCallTime(e.target.value)}
            className="bg-slate-800 border border-slate-700 px-3 py-2 rounded text-xs text-white"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <input
            type="number"
            step="any"
            required
            placeholder="Latitude"
            value={newEventLat}
            onChange={(e) => setNewEventLat(Number(e.target.value))}
            className="bg-slate-800 border border-slate-700 px-3 py-2 rounded text-xs text-white"
          />
          <input
            type="number"
            step="any"
            required
            placeholder="Longitude"
            value={newEventLon}
            onChange={(e) => setNewEventLon(Number(e.target.value))}
            className="bg-slate-800 border border-slate-700 px-3 py-2 rounded text-xs text-white"
          />
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-400">Radius (ft):</span>
            <input
              type="number"
              value={newEventRadius}
              onChange={(e) => setNewEventRadius(Number(e.target.value))}
              className="w-full bg-slate-800 border border-slate-700 px-3 py-2 rounded text-xs text-white font-bold"
            />
          </div>
        </div>

        <div className="flex flex-wrap justify-between items-center gap-3 pt-2">
          <button
            type="button"
            onClick={handleGetCurrentGps}
            className="bg-slate-800 hover:bg-slate-700 text-teal-300 font-bold px-3 py-2 rounded text-xs border border-slate-700"
          >
            📍 Capture My Current GPS Coordinates
          </button>
          <button
            type="submit"
            className="bg-teal-600 hover:bg-teal-500 text-white font-bold px-6 py-2 rounded text-xs transition shadow-md"
          >
            Publish Event
          </button>
        </div>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {eventsList.map((evt) => (
          <div key={evt.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="text-base font-bold text-white">{evt.title}</h4>
                <p className="text-xs text-teal-400 font-semibold">{evt.location_name} • {evt.event_date}</p>
                <p className="text-xs text-amber-300 font-mono mt-0.5">⏱ Call Time: {evt.call_time}</p>
                <p className="text-[10px] text-slate-500 font-mono mt-1">
                  GPS Geofence: {evt.latitude.toFixed(4)}, {evt.longitude.toFixed(4)} (Within {evt.radius_feet} ft)
                </p>
              </div>
              <button
                onClick={() => handleDeleteEvent(evt.id)}
                className="text-rose-400 hover:text-rose-300 text-xs font-bold"
              >
                Delete
              </button>
            </div>

            <div className="flex gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => handleFetchAttendanceReport(evt)}
                className="flex-1 bg-teal-600 hover:bg-teal-500 text-white font-bold py-2 rounded text-xs transition"
              >
                📋 View Check-In Report
              </button>
              <a
                href={`${API_BASE}/attendance/export/${evt.id}`}
                download
                className="bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold px-3 py-2 rounded text-xs border border-slate-700 text-center"
              >
                📥 CSV
              </a>
            </div>
          </div>
        ))}
      </div>

      {selectedEventReport && (
        <div className="bg-slate-950 p-5 rounded-xl border border-teal-500/50 space-y-4">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-lg font-bold text-teal-400">
                Attendance Log: {selectedEventReport.title}
              </h3>
              <p className="text-xs text-slate-400">Total Check-Ins: {eventReportData.length} Students</p>
            </div>
            <button
              onClick={() => setSelectedEventReport(null)}
              className="text-slate-400 hover:text-white text-xs font-bold"
            >
              ✕ Close
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase">
                  <th className="py-2 px-2">Student ID</th>
                  <th className="py-2 px-2">Student Name</th>
                  <th className="py-2 px-2">Check-In Timestamp</th>
                  <th className="py-2 px-2">Distance from Venue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {eventReportData.map((row, i) => (
                  <tr key={i}>
                    <td className="py-2 px-2 font-mono text-teal-400">{row.student_id}</td>
                    <td className="py-2 px-2 font-bold text-white">{row.student_name}</td>
                    <td className="py-2 px-2 text-amber-300 font-mono">{row.check_in_time}</td>
                    <td className="py-2 px-2 text-slate-300 font-mono">{row.distance_feet} ft</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );

  // FVA VOCABULARY TAB RENDERER
  const renderFvaTab = () => {
    const rawList = (fvaTerms && fvaTerms.length > 0) ? fvaTerms : DEFAULT_FVA_TERMS;
    const categories = ['All', 'Music Terms', 'Form', 'Style and Phrasing', 'Tempo and Meter'];
    const filteredList = selectedCategory === 'All' ? rawList : rawList.filter(t => t.category === selectedCategory);
    const safeList = filteredList.length > 0 ? filteredList : rawList;
    const currentTerm = safeList[termIndex % safeList.length];

    return (
      <div className="space-y-6 max-w-2xl mx-auto">
        <div className="bg-slate-900 border border-teal-900/40 p-6 rounded-xl space-y-4 text-center">
          <h3 className="text-xl font-bold text-teal-400">🎵 FVA All-State Vocabulary (50 Terms)</h3>
          
          <div className="flex flex-wrap justify-center items-center gap-2">
            <button
              onClick={() => { setFvaDisplayMode('category'); setTermIndex(0); }}
              className={`px-3 py-1 rounded text-xs font-bold border transition ${
                fvaDisplayMode === 'category' ? 'bg-teal-600 text-white border-teal-400' : 'bg-slate-800 text-slate-400'
              }`}
            >
              📂 Grouped by Category
            </button>
            <button
              onClick={() => { setFvaDisplayMode('random'); setTermIndex(Math.floor(Math.random() * rawList.length)); }}
              className={`px-3 py-1 rounded text-xs font-bold border transition ${
                fvaDisplayMode === 'random' ? 'bg-teal-600 text-white border-teal-400' : 'bg-slate-800 text-slate-400'
              }`}
            >
              🔀 Random Shuffle Mode
            </button>
          </div>

          {fvaDisplayMode === 'category' && (
            <div className="flex flex-wrap justify-center gap-1.5 pt-2">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => { setSelectedCategory(cat); setTermIndex(0); setShowAnswer(false); }}
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold transition border ${
                    selectedCategory === cat ? 'bg-amber-500 text-slate-950 border-white' : 'bg-slate-800 text-slate-300 border-slate-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          <div
            onClick={() => setShowAnswer(!showAnswer)}
            className="my-4 p-8 bg-slate-950 border border-slate-800 hover:border-teal-500/60 rounded-xl cursor-pointer transition min-h-[170px] flex flex-col justify-center items-center shadow-xl"
          >
            <span className="text-[10px] uppercase font-bold text-teal-400 tracking-wider mb-2">
              #{currentTerm.num} • {currentTerm.category}
            </span>
            <h4 className="text-2xl font-bold text-slate-100">{currentTerm.term}</h4>
            {showAnswer ? (
              <p className="text-teal-300 mt-4 text-sm font-medium leading-relaxed max-w-lg">{currentTerm.definition}</p>
            ) : (
              <p className="text-xs text-slate-500 mt-4">Click card to reveal definition</p>
            )}
          </div>

          <div className="flex justify-between items-center text-xs text-slate-400">
            <button
              disabled={termIndex === 0}
              onClick={() => { setShowAnswer(false); setTermIndex(prev => Math.max(0, prev - 1)); }}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 rounded font-semibold text-white"
            >
              ← Previous
            </button>

            <span>Card {(termIndex % safeList.length) + 1} of {safeList.length}</span>

            <button
              onClick={() => {
                setShowAnswer(false);
                if (fvaDisplayMode === 'random') setTermIndex(Math.floor(Math.random() * rawList.length));
                else setTermIndex(prev => (prev + 1) % safeList.length);
              }}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded font-semibold text-white"
            >
              Next →
            </button>
          </div>
        </div>
      </div>
    );
  };

  // EAR TRAINING TAB RENDERER
  const renderEarTrainingTab = () => (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="bg-slate-900 border border-teal-900/40 p-6 rounded-xl space-y-4">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <h3 className="text-lg font-bold text-teal-400">🎧 Ear Training Hub</h3>
          <div className="flex space-x-2">
            <button
              onClick={() => { setEarMode('practice'); resetEarScore(); }}
              className={`px-3 py-1 rounded text-xs font-bold transition border ${
                earMode === 'practice' ? 'bg-teal-600 text-white' : 'bg-slate-800 text-slate-400'
              }`}
            >
              Practice
            </button>
            <button
              onClick={() => { setEarMode('test'); resetEarScore(); }}
              className={`px-3 py-1 rounded text-xs font-bold transition border ${
                earMode === 'test' ? 'bg-teal-600 text-white' : 'bg-slate-800 text-slate-400'
              }`}
            >
              Test Mode
            </button>
          </div>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={() => handleModuleSwitch('intervals')}
            className={`px-3 py-1.5 rounded text-xs font-bold flex-1 border ${
              earModule === 'intervals' ? 'bg-amber-500 text-slate-950 border-white' : 'bg-slate-800 text-slate-300'
            }`}
          >
            Intervals
          </button>
          <button
            onClick={() => handleModuleSwitch('chords')}
            className={`px-3 py-1.5 rounded text-xs font-bold flex-1 border ${
              earModule === 'chords' ? 'bg-amber-500 text-slate-950 border-white' : 'bg-slate-800 text-slate-300'
            }`}
          >
            Chord Qualities
          </button>
        </div>

        {earMode === 'test' && (
          <div className="bg-slate-950 p-3 rounded-lg flex justify-between items-center text-xs font-bold border border-slate-800">
            <span className="text-teal-300">
              Score: {earScore.correct} / {earScore.total} ({earScore.total > 0 ? Math.round((earScore.correct / earScore.total) * 100) : 0}%)
            </span>
            <button
              onClick={resetEarScore}
              className="text-amber-400 hover:text-amber-300 underline text-[11px]"
            >
              🔄 Reset Score
            </button>
          </div>
        )}

        <button
          onClick={generateEarQuestion}
          className="w-full bg-teal-600 hover:bg-teal-500 text-white font-bold py-3 rounded-lg text-sm transition shadow-lg"
        >
          ▶ Play Question
        </button>

        {earFeedback && (
          <p className={`text-center font-bold text-sm ${earFeedback.includes('Correct') ? 'text-emerald-400' : 'text-red-400'}`}>
            {earFeedback}
          </p>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2">
          {(earModule === 'intervals'
            ? ['Unison', 'Minor 2nd', 'Major 2nd', 'Minor 3rd', 'Major 3rd', 'Perfect 4th', 'Tritone', 'Perfect 5th', 'Minor 6th', 'Major 6th', 'Minor 7th', 'Major 7th', 'Octave']
            : ['Major Triad', 'Minor Triad', 'Augmented Triad', 'Diminished Triad']
          ).map((item) => (
            <button
              key={item}
              onClick={() => handleAnswerEarQuestion(item)}
              className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold py-2.5 px-2 rounded text-xs transition"
            >
              {item}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  // STUDENT ATTENDANCE CHECK-IN TAB RENDERER
  const renderStudentAttendanceTab = () => (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="bg-slate-900 border border-teal-900/40 p-6 rounded-xl space-y-4">
        <div className="border-b border-slate-800 pb-3">
          <h3 className="text-lg font-bold text-teal-400">📍 Event Check-In Portal</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Verify your presence upon arrival for performances and rehearsals. You must be within 150 feet of the venue for check-in to process.
          </p>
        </div>

        {checkInStatusMsg && (
          <div className={`p-4 rounded-xl text-xs font-bold text-center border ${
            checkInStatusMsg.includes('Successful') || checkInStatusMsg.includes('Already')
              ? 'bg-emerald-950/80 border-emerald-500 text-emerald-200'
              : 'bg-rose-950/80 border-rose-500 text-rose-200'
          }`}>
            {checkInStatusMsg}
          </div>
        )}

        <div className="space-y-4 pt-2">
          {eventsList.length === 0 ? (
            <p className="text-center text-xs text-slate-500 py-6">No upcoming events currently scheduled for check-in.</p>
          ) : (
            eventsList.map((evt) => (
              <div key={evt.id} className="bg-slate-950 p-5 rounded-xl border border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <span className="text-[10px] font-bold uppercase text-amber-400 tracking-wider">
                    📅 {evt.event_date}
                  </span>
                  <h4 className="text-lg font-bold text-white leading-snug">{evt.title}</h4>
                  <p className="text-xs text-teal-300 font-semibold">{evt.location_name}</p>
                  <p className="text-xs text-slate-400 mt-1">⏱ Call Time: <strong className="text-slate-200">{evt.call_time}</strong></p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Geofence Limit: 150 ft radius from venue</p>
                </div>

                <button
                  onClick={() => handleStudentGpsCheckIn(evt.id)}
                  className="w-full sm:w-auto bg-teal-600 hover:bg-teal-500 text-white font-bold px-6 py-3 rounded-xl text-xs transition shadow-lg flex items-center justify-center space-x-2"
                >
                  <span>📍 Check In Now</span>
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );

  // DIRECTOR ADMIN DASHBOARD VIEW
  if (isDirector && !viewAsStudentMode) {
    const processedRoster = getProcessedRoster();

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

        {renderDailyMotivationHeader()}
        {renderAudioToolbar()}
        {renderDirectorMusicLibrary()}
        {renderDirectorAttendanceManager()}

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
                className="bg-slate-800 border border-slate-700 px-3 py-1.5 rounded text-sm text-slate-200 font-bold"
              >
                <option value="All Ensembles">All Ensembles (De-duplicated Roster)</option>
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
                              const singer = processedRoster.find(
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
                                >
                                  {singer ? (
                                    <>
                                      <p className="text-[10px] font-bold text-white leading-tight">
                                        <span className="text-amber-400 mr-0.5">#{singer.rosterNumber}</span>
                                        {singer.first_name} {singer.last_name[0]}.
                                      </p>
                                      <p className="text-[8px] text-teal-400 font-mono">{singer.voice_part}</p>
                                      <p className="text-[7px] text-slate-400">{singer.height_inches || 65}"</p>
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

        {/* ALPHABETICAL DE-DUPLICATED ROSTER TABLE */}
        <section className="bg-slate-900 border border-teal-900/40 p-5 rounded-xl">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-200">
                Alphabetical Class Roster ({processedRoster.length} Singers)
              </h2>
              <p className="text-xs text-slate-400">Sorted alphabetically by Last Name with no duplicate Student IDs.</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase">
                  <th className="py-2.5 px-3">#</th>
                  <th className="py-2.5 px-3">Student ID</th>
                  <th className="py-2.5 px-3">Name</th>
                  <th className="py-2.5 px-3">Primary Ensemble</th>
                  <th className="py-2.5 px-3">Voice Part</th>
                  <th className="py-2.5 px-3">Height</th>
                  <th className="py-2.5 px-3">Spot Location</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {processedRoster.map((s) => (
                  <tr key={s.student_id} className="hover:bg-slate-800/50">
                    <td className="py-2.5 px-3 font-mono text-amber-400 font-bold">{s.rosterNumber}</td>
                    <td className="py-2.5 px-3 font-mono text-teal-400">{s.student_id}</td>
                    <td className="py-2.5 px-3 font-medium text-white">{s.last_name}, {s.first_name}</td>
                    <td className="py-2.5 px-3">{s.ensemble}</td>
                    <td className="py-2.5 px-3">{s.voice_part}</td>
                    <td className="py-2.5 px-3 font-bold text-amber-300">{s.height_inches || 65}"</td>
                    <td className="py-2.5 px-3 font-semibold text-teal-300">
                      {s.wenger_section || 'Riser A'} — {s.wenger_row || 'Row 1'} ({s.wenger_slot || 'Far Left'})
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

  // STUDENT VIEW
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
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

      {renderDailyMotivationHeader()}
      {renderAudioToolbar()}

      {/* TABS NAVIGATION BAR */}
      <div className="flex flex-wrap gap-2 border-b border-teal-900/60 pb-3 mb-6">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${
            activeTab === 'overview' ? 'bg-teal-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-slate-200'
          }`}
        >
          My Profile
        </button>
        <button
          onClick={() => setActiveTab('attendance')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${
            activeTab === 'attendance' ? 'bg-teal-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-slate-200'
          }`}
        >
          📍 Event Attendance
        </button>
        <button
          onClick={() => setActiveTab('uniform')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${
            activeTab === 'uniform' ? 'bg-teal-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-slate-200'
          }`}
        >
          👔 Uniform Checklist
        </button>
        <button
          onClick={() => setActiveTab('fva')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${
            activeTab === 'fva' ? 'bg-teal-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-slate-200'
          }`}
        >
          🎵 FVA Vocabulary
        </button>
        <button
          onClick={() => setActiveTab('ear')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${
            activeTab === 'ear' ? 'bg-teal-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-slate-200'
          }`}
        >
          🎧 Ear Training
        </button>
      </div>

      {/* TAB CONTENT ROUTING */}
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

      {activeTab === 'attendance' && renderStudentAttendanceTab()}

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

      {activeTab === 'fva' && renderFvaTab()}
      {activeTab === 'ear' && renderEarTrainingTab()}
    </div>
  );
}
