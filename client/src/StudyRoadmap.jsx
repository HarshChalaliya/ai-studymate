import { useState } from "react";
import "./StudyRoadmap.css";
import { apiFetch } from "./utils/api";

function StudyRoadmap() {
  const [topic, setTopic] = useState("");
  const [timeframe, setTimeframe] = useState("7 Days");
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [completedTasks, setCompletedTasks] = useState({});

  const popularSubjects = [
    "Data Mining & Data Warehousing",
    "Java Web Technology & Servlets",
    "Machine Learning Zero to Hero",
    "Software Engineering & Agile SDLC",
    "Search Engine Optimization (SEO)",
  ];

  const generateRoadmap = async (selectedTopic) => {
    const topicToUse = selectedTopic || topic;
    if (!topicToUse.trim()) {
      alert("Please enter a subject or topic.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setRoadmap(null);
      setCompletedTasks({});

      const response = await apiFetch("/generate-roadmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: topicToUse, timeframe }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate roadmap");
      }

      setRoadmap(data.roadmap);
      setTopic(topicToUse);
    } catch (err) {
      console.error("Roadmap Error:", err);
      setError(err.message || "Failed to generate study roadmap.");
    } finally {
      setLoading(false);
    }
  };

  const toggleTask = (taskKey) => {
    setCompletedTasks((prev) => ({
      ...prev,
      [taskKey]: !prev[taskKey],
    }));
  };

  const getTotalTasksCount = () => {
    if (!roadmap || !roadmap.phases) return 0;
    return roadmap.phases.reduce((acc, p) => acc + (p.actionItems?.length || 0), 0);
  };

  const getCompletedCount = () => {
    return Object.values(completedTasks).filter(Boolean).length;
  };

  const totalTasks = getTotalTasksCount();
  const completedCount = getCompletedCount();
  const progressPercent = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

  return (
    <div className="roadmap-page">
      <div className="roadmap-header">
        <div>
          <h1>🗺️ AI Study Roadmap Generator</h1>
          <p>Get a personalized step-by-step learning plan with milestones and action tasks.</p>
        </div>
      </div>

      <div className="roadmap-input-card">
        <div className="input-row">
          <div className="field-group flex-2">
            <label>Subject or Exam Topic</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && generateRoadmap()}
              placeholder="e.g., Computer Organization & Architecture"
            />
          </div>

          <div className="field-group flex-1">
            <label>Target Timeframe</label>
            <select value={timeframe} onChange={(e) => setTimeframe(e.target.value)}>
              <option value="3 Days">⚡ 3 Days (Crash Course)</option>
              <option value="7 Days">📅 7 Days (Standard)</option>
              <option value="2 Weeks">🗓️ 2 Weeks (Deep Dive)</option>
              <option value="1 Month">🚀 1 Month (Mastery)</option>
            </select>
          </div>

          <button className="primary-btn align-end" onClick={() => generateRoadmap()} disabled={loading}>
            {loading ? "🤖 Planning..." : "✨ Build Roadmap"}
          </button>
        </div>

        <div className="chip-container">
          <p>Suggested Syllabi:</p>
          <div className="chips">
            {popularSubjects.map((s, idx) => (
              <button
                key={idx}
                className="chip-btn"
                onClick={() => {
                  setTopic(s);
                  generateRoadmap(s);
                }}
              >
                🎓 {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading && (
        <div className="roadmap-loading">
          <div className="spinner">🗺️</div>
          <h2>Structuring your personalized study path...</h2>
          <p>Analyzing key topics, breaking into phases, and assigning daily action items.</p>
        </div>
      )}

      {error && <div className="roadmap-error">⚠️ {error}</div>}

      {roadmap && !loading && (
        <div className="roadmap-result">
          <div className="roadmap-topbar">
            <div>
              <h2>{roadmap.title}</h2>
              <p className="roadmap-desc">{roadmap.overview}</p>
            </div>
            <div className="roadmap-badge-box">
              <span className="time-badge">⏱️ {roadmap.timeframe}</span>
            </div>
          </div>

          <div className="roadmap-progress-bar-card">
            <div className="progress-info">
              <span>Overall Roadmap Progress: <strong>{progressPercent}%</strong> ({completedCount}/{totalTasks} tasks completed)</span>
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>

          <div className="timeline">
            {roadmap.phases?.map((phase, pIdx) => (
              <div key={pIdx} className="timeline-item">
                <div className="timeline-marker">{pIdx + 1}</div>
                <div className="timeline-content">
                  <div className="phase-header">
                    <span className="phase-tag">{phase.phase}</span>
                    <h3>{phase.title}</h3>
                  </div>

                  {phase.topics && phase.topics.length > 0 && (
                    <div className="phase-subtopics">
                      <strong>Focus Topics:</strong>
                      <div className="topic-tags">
                        {phase.topics.map((t, tIdx) => (
                          <span key={tIdx} className="topic-tag">📌 {t}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {phase.actionItems && (
                    <div className="action-items">
                      <strong>Action Checklist:</strong>
                      <ul>
                        {phase.actionItems.map((item, iIdx) => {
                          const key = `p${pIdx}-i${iIdx}`;
                          const isDone = !!completedTasks[key];
                          return (
                            <li
                              key={iIdx}
                              className={`action-item ${isDone ? "completed" : ""}`}
                              onClick={() => toggleTask(key)}
                            >
                              <input
                                type="checkbox"
                                checked={isDone}
                                onChange={() => {}}
                              />
                              <span>{item}</span>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="roadmap-actions">
            <button className="print-btn" onClick={() => window.print()}>
              🖨️ Print / Save PDF
            </button>
            <button className="new-btn" onClick={() => setRoadmap(null)}>
              🔄 Create Another Roadmap
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default StudyRoadmap;
