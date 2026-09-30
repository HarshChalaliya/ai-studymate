import { useEffect, useState } from "react";
import "./App.css";

import AskAI from "./AskAI";
import MCQGenerator from "./MCQGenerator";
import StudyHistory from "./StudyHistory";
import NotesGenerator from "./NotesGenerator";
import ExplainTopic from "./ExplainTopic";
import Flashcards from "./Flashcards";
import StudyRoadmap from "./StudyRoadmap";

// 6 UNIQUE NEW FEATURES
import VivaExaminer from "./VivaExaminer";
import MindMap from "./MindMap";
import ExamPredictor from "./ExamPredictor";
import CheatSheet from "./CheatSheet";
import QuizBattle from "./QuizBattle";
import PomodoroRoom from "./PomodoroRoom";

import { apiFetch } from "./utils/api";

/* =========================
   STUDENT PROFILE MODAL
========================= */
function ProfileModal({ isOpen, onClose, currentName, onSave }) {
  const [nameInput, setNameInput] = useState(currentName || "Harsh Chalaliya");

  useEffect(() => {
    setNameInput(currentName || "Harsh Chalaliya");
  }, [currentName, isOpen]);

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    if (!nameInput.trim()) {
      alert("Please enter a valid student name.");
      return;
    }
    onSave(nameInput.trim());
  };

  const presetNames = [
    "Harsh Chalaliya",
    "MCA Student",
    "Guest Learner",
    "Alex Johnson",
  ];

  return (
    <div className="profile-modal-backdrop" onClick={onClose}>
      <div className="profile-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <span className="modal-icon">👤</span>
            <div>
              <h3>Student Profile Switcher</h3>
              <p>Personalize your workspace, dashboard, and study history.</p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSave} className="profile-form">
          <label>Enter Student Name</label>
          <div className="input-with-icon">
            <span className="input-icon">🎓</span>
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="e.g. Harsh Chalaliya or Rahul Patel"
              autoFocus
            />
          </div>

          <div className="preset-chips-section">
            <span>Quick Presets:</span>
            <div className="preset-chips">
              {presetNames.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={`preset-chip ${nameInput === preset ? "active" : ""}`}
                  onClick={() => setNameInput(preset)}
                >
                  ✨ {preset}
                </button>
              ))}
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="secondary-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="primary-btn glow-btn">
              💾 Save Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* =========================
   SIDEBAR COMPONENT
========================= */
function Sidebar({ page, setPage, theme, toggleTheme, studentName, openProfileModal }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <button className="mobile-menu-toggle" onClick={() => setMobileOpen(!mobileOpen)}>
        {mobileOpen ? "✕" : "☰"}
      </button>

      <aside className={`sidebar ${mobileOpen ? "open" : ""}`}>
        <div className="sidebar-brand">
          <div className="logo-icon">🤖</div>
          <div>
            <h2>AI StudyMate</h2>
            <span className="brand-badge">PRO EDITION</span>
          </div>
        </div>

        <nav className="nav-menu">
          <button
            className={page === "dashboard" ? "active" : ""}
            onClick={() => { setPage("dashboard"); setMobileOpen(false); }}
          >
            <span className="nav-icon">🏠</span> Dashboard
          </button>

          <button
            className={page === "ask-ai" ? "active" : ""}
            onClick={() => { setPage("ask-ai"); setMobileOpen(false); }}
          >
            <span className="nav-icon">💬</span> Ask AI
          </button>

          <button
            className={page === "viva" ? "active" : ""}
            onClick={() => { setPage("viva"); setMobileOpen(false); }}
          >
            <span className="nav-icon">🎙️</span> AI Viva Examiner
          </button>

          <button
            className={page === "mindmap" ? "active" : ""}
            onClick={() => { setPage("mindmap"); setMobileOpen(false); }}
          >
            <span className="nav-icon">🧠</span> Visual MindMaps
          </button>

          <button
            className={page === "predictor" ? "active" : ""}
            onClick={() => { setPage("predictor"); setMobileOpen(false); }}
          >
            <span className="nav-icon">🔮</span> Exam Predictor
          </button>

          <button
            className={page === "cheatsheet" ? "active" : ""}
            onClick={() => { setPage("cheatsheet"); setMobileOpen(false); }}
          >
            <span className="nav-icon">📄</span> 1-Page CheatSheet
          </button>

          <button
            className={page === "battle" ? "active" : ""}
            onClick={() => { setPage("battle"); setMobileOpen(false); }}
          >
            <span className="nav-icon">⚔️</span> Speed Quiz Duel
          </button>

          <button
            className={page === "mcq" || page === "weak-mcq" ? "active" : ""}
            onClick={() => { setPage("mcq"); setMobileOpen(false); }}
          >
            <span className="nav-icon">❓</span> MCQ Generator
          </button>

          <button
            className={page === "notes" ? "active" : ""}
            onClick={() => { setPage("notes"); setMobileOpen(false); }}
          >
            <span className="nav-icon">📝</span> Notes Generator
          </button>

          <button
            className={page === "explain" ? "active" : ""}
            onClick={() => { setPage("explain"); setMobileOpen(false); }}
          >
            <span className="nav-icon">💡</span> Explain Topic
          </button>

          <button
            className={page === "flashcards" ? "active" : ""}
            onClick={() => { setPage("flashcards"); setMobileOpen(false); }}
          >
            <span className="nav-icon">🎴</span> AI Flashcards
          </button>

          <button
            className={page === "roadmap" ? "active" : ""}
            onClick={() => { setPage("roadmap"); setMobileOpen(false); }}
          >
            <span className="nav-icon">🗺️</span> Study Roadmap
          </button>

          <button
            className={page === "pomodoro" ? "active" : ""}
            onClick={() => { setPage("pomodoro"); setMobileOpen(false); }}
          >
            <span className="nav-icon">⏱️</span> Pomodoro Focus
          </button>

          <button
            className={page === "history" ? "active" : ""}
            onClick={() => { setPage("history"); setMobileOpen(false); }}
          >
            <span className="nav-icon">📚</span> Study History
          </button>
        </nav>

        <div className="sidebar-footer">
          <button className="theme-toggle-btn" onClick={toggleTheme}>
            {theme === "dark" ? "☀️ Light Mode" : "🌙 Dark Mode"}
          </button>

          <div className="active-student-pill" onClick={openProfileModal} title="Click to Switch Student Profile">
            <span className="student-icon">🎓</span>
            <div className="student-text-group">
              <span className="student-label">ACTIVE STUDENT</span>
              <strong className="student-name">{studentName}</strong>
            </div>
            <span className="edit-icon-chip">✏️</span>
          </div>

          <div className="developer-card">
            <div className="dev-avatar">👨‍💻</div>
            <div className="dev-info">
              <span className="dev-label">PROJECT DEVELOPER</span>
              <strong className="dev-name">Harsh Chalaliya</strong>
              <span className="dev-status">✨ Verified Developer</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

/* =========================
   DASHBOARD
========================= */
function Dashboard({ setPage, setWeakPracticeData, studentName, openProfileModal }) {
  const [history, setHistory] = useState([]);
  const [savedNotesCount, setSavedNotesCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [resResults, resNotes] = await Promise.all([
        apiFetch("/results"),
        apiFetch("/notes"),
      ]);

      const dataResults = await resResults.json();
      const dataNotes = await resNotes.json();

      setHistory(dataResults.results || []);
      setSavedNotesCount(dataNotes.notes?.length || 0);
    } catch (error) {
      console.error("Dashboard Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const quizCount = history.length;
  const averageScore =
    quizCount > 0
      ? Math.round(
          history.reduce((total, item) => total + Number(item.percentage || 0), 0) / quizCount
        )
      : 0;

  const latestQuiz = history[0];
  const latestWeakQuiz = history.find(
    (item) => item.weakQuestions && item.weakQuestions.length > 0
  );

  const weakAreas = latestWeakQuiz?.weakQuestions || [];

  const startWeakPractice = () => {
    if (!latestWeakQuiz || !latestWeakQuiz.weakQuestions?.length) {
      alert("No weak areas available for practice yet. Attempt a quiz first!");
      return;
    }

    setWeakPracticeData({
      topic: latestWeakQuiz.topic,
      weakQuestions: latestWeakQuiz.weakQuestions,
    });
    setPage("weak-mcq");
  };

  return (
    <div className="dashboard-view">
      <header className="dash-header">
        <div>
          <h1>Welcome back, {studentName} 👋</h1>
          <p>Your intelligent AI exam preparation companion & learning workstation</p>
        </div>

        <div className="dash-header-pills">
          <div className="student-profile-pill" onClick={openProfileModal} title="Click to Switch Profile">
            <span className="pill-sub">Student Profile</span>
            <div className="pill-name-row">
              <strong>{studentName}</strong>
              <span className="edit-badge">✏️ Switch</span>
            </div>
          </div>

          <div className="author-pill">
            <span>Developer</span>
            <strong>Harsh Chalaliya</strong>
          </div>
        </div>
      </header>

      <section className="hero-banner">
        <div className="hero-content">
          <h2>Master Any Subject with AI 🚀</h2>
          <p>
            Experience AI Viva Examinations, Visual MindMaps, Exam Paper Prediction, Speed Duel Battles & 1-Page CheatSheets!
          </p>
          <div className="hero-cta-group">
            <button className="primary-btn glow-btn" onClick={() => setPage("viva")}>
              🎙️ Try AI Viva Examiner
            </button>
            <button className="secondary-btn" onClick={() => setPage("mindmap")}>
              🧠 MindMaps
            </button>
          </div>
        </div>
        <div className="hero-graphic">
          <div className="floating-badge badge-1">🧠 AI Study Partner</div>
          <div className="floating-badge badge-2">🎓 MCA Exam Ready</div>
          <div className="hero-robot">🤖</div>
        </div>
      </section>

      <h2 className="section-title">📊 Your Performance Overview</h2>

      <section className="stats-grid">
        <div className="stat-card">
          <span className="stat-icon">📝</span>
          <div>
            <h3>{loading ? "..." : quizCount}</h3>
            <p>Quizzes Completed</p>
          </div>
        </div>

        <div className="stat-card">
          <span className="stat-icon">📈</span>
          <div>
            <h3>{loading ? "..." : `${averageScore}%`}</h3>
            <p>Average Accuracy</p>
          </div>
        </div>

        <div className="stat-card">
          <span className="stat-icon">📁</span>
          <div>
            <h3>{loading ? "..." : savedNotesCount}</h3>
            <p>Saved Notes</p>
          </div>
        </div>

        <div className="stat-card">
          <span className="stat-icon">🏆</span>
          <div>
            <h3>{loading ? "..." : latestQuiz ? `${latestQuiz.score}/${latestQuiz.totalQuestions}` : "—"}</h3>
            <p>Latest Quiz Score</p>
          </div>
        </div>
      </section>

      {!loading && weakAreas.length > 0 && (
        <section className="weak-alert-box">
          <div className="weak-alert-header">
            <div>
              <h2>🎯 Targeted Weak Area Practice</h2>
              <p>Based on your recent quiz on <strong>{latestWeakQuiz?.topic}</strong>, here are questions to focus on:</p>
            </div>
            <button className="primary-btn practice-now-btn" onClick={startWeakPractice}>
              🤖 Practice Weak Questions →
            </button>
          </div>
          <div className="weak-tags-list">
            {weakAreas.slice(0, 4).map((q, idx) => (
              <span key={idx} className="weak-tag">⚠️ {q}</span>
            ))}
          </div>
        </section>
      )}

      <h2 className="section-title">✨ Unique AI Learning Suite</h2>

      <section className="tools-grid">
        <div className="tool-card" onClick={() => setPage("viva")}>
          <div className="tool-icon">🎙️</div>
          <h3>AI Viva Examiner</h3>
          <p>Simulate university oral exams with spoken questions and score evaluation.</p>
          <span className="tool-arrow">Open Tool →</span>
        </div>

        <div className="tool-card" onClick={() => setPage("mindmap")}>
          <div className="tool-icon">🧠</div>
          <h3>Visual MindMaps</h3>
          <p>Generate interactive visual flowcharts and concept diagrams dynamically.</p>
          <span className="tool-arrow">Open Tool →</span>
        </div>

        <div className="tool-card" onClick={() => setPage("predictor")}>
          <div className="tool-icon">🔮</div>
          <h3>Exam Paper Predictor</h3>
          <p>Predict 7-mark & 3-mark university questions with model answer outlines.</p>
          <span className="tool-arrow">Open Tool →</span>
        </div>

        <div className="tool-card" onClick={() => setPage("cheatsheet")}>
          <div className="tool-icon">📄</div>
          <h3>1-Page CheatSheet</h3>
          <p>Create condensed 5-minute pre-exam revision notes and comparison tables.</p>
          <span className="tool-arrow">Open Tool →</span>
        </div>

        <div className="tool-card" onClick={() => setPage("battle")}>
          <div className="tool-icon">⚔️</div>
          <h3>Speed Quiz Duel</h3>
          <p>Play rapid-fire speed quiz matches against AI Bot with live leaderboards.</p>
          <span className="tool-arrow">Open Tool →</span>
        </div>

        <div className="tool-card" onClick={() => setPage("pomodoro")}>
          <div className="tool-icon">⏱️</div>
          <h3>Pomodoro Focus Room</h3>
          <p>25-min study timer with synthesised ambient rain, ocean & cafe sounds.</p>
          <span className="tool-arrow">Open Tool →</span>
        </div>

        <div className="tool-card" onClick={() => setPage("ask-ai")}>
          <div className="tool-icon">💬</div>
          <h3>Ask AI Assistant</h3>
          <p>Get instant answers to any academic or programming questions.</p>
          <span className="tool-arrow">Open Tool →</span>
        </div>

        <div className="tool-card" onClick={() => setPage("mcq")}>
          <div className="tool-icon">❓</div>
          <h3>MCQ Exam Mode</h3>
          <p>Generate MCQs with timers and detailed option explanations.</p>
          <span className="tool-arrow">Open Tool →</span>
        </div>

        <div className="tool-card" onClick={() => setPage("notes")}>
          <div className="tool-icon">📝</div>
          <h3>Notes Generator</h3>
          <p>Create exam notes, save to DB, or export as Markdown.</p>
          <span className="tool-arrow">Open Tool →</span>
        </div>
      </section>
    </div>
  );
}

/* =========================
   APP ROOT
========================= */

function App() {
  const [page, setPage] = useState("dashboard");
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("study_mate_theme") || "dark";
  });

  const [studentName, setStudentName] = useState(() => {
    return localStorage.getItem("studymate_student_name") || "Harsh Chalaliya";
  });

  const [showProfileModal, setShowProfileModal] = useState(false);

  const [weakPracticeData, setWeakPracticeData] = useState({
    topic: "",
    weakQuestions: [],
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("study_mate_theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const handleSaveProfile = (newName) => {
    setStudentName(newName);
    localStorage.setItem("studymate_student_name", newName);
    setShowProfileModal(false);
  };

  const startWeakPracticeFromHistory = (data) => {
    setWeakPracticeData(data);
    setPage("weak-mcq");
  };

  return (
    <div className="app-container">
      <Sidebar
        page={page}
        setPage={setPage}
        theme={theme}
        toggleTheme={toggleTheme}
        studentName={studentName}
        openProfileModal={() => setShowProfileModal(true)}
      />

      <main className="main-content">
        {page === "dashboard" && (
          <Dashboard
            setPage={setPage}
            setWeakPracticeData={setWeakPracticeData}
            studentName={studentName}
            openProfileModal={() => setShowProfileModal(true)}
          />
        )}

        {page === "viva" && <VivaExaminer />}

        {page === "mindmap" && <MindMap />}

        {page === "predictor" && <ExamPredictor />}

        {page === "cheatsheet" && <CheatSheet />}

        {page === "battle" && <QuizBattle />}

        {page === "pomodoro" && <PomodoroRoom />}

        {page === "ask-ai" && <AskAI />}

        {page === "mcq" && <MCQGenerator />}

        {page === "weak-mcq" && (
          <MCQGenerator
            weakMode={true}
            weakTopic={weakPracticeData.topic}
            weakQuestions={weakPracticeData.weakQuestions}
          />
        )}

        {page === "notes" && <NotesGenerator />}

        {page === "explain" && <ExplainTopic />}

        {page === "flashcards" && <Flashcards />}

        {page === "roadmap" && <StudyRoadmap />}

        {page === "history" && (
          <StudyHistory onStartWeakPractice={startWeakPracticeFromHistory} />
        )}
      </main>

      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        currentName={studentName}
        onSave={handleSaveProfile}
      />
    </div>
  );
}

export default App;