import { useState, useEffect } from "react";
import "./VivaExaminer.css";
import { apiFetch } from "./utils/api";

function VivaExaminer() {
  const [topic, setTopic] = useState("");
  const [vivaState, setVivaState] = useState(null); // { vivaQuestion, examinerComment, score, questionNumber }
  const [studentAnswer, setStudentAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);
  const [speechEnabled, setSpeechEnabled] = useState(true);

  const startViva = async (selectedTopic) => {
    const t = selectedTopic || topic;
    if (!t.trim()) {
      alert("Please enter a subject or topic for your viva voce.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setVivaState(null);
      setHistory([]);
      setStudentAnswer("");

      const res = await apiFetch("/viva-examiner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: t, questionNumber: 1 }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to start viva voce.");

      setVivaState(data.vivaData);
      setTopic(t);
      speakQuestion(data.vivaData.vivaQuestion);
    } catch (err) {
      console.error("Viva Error:", err);
      setError(err.message || "Failed to connect to Viva Examiner.");
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = async () => {
    if (!studentAnswer.trim() || !vivaState) return;

    const currentQNum = vivaState.questionNumber;
    const currentQ = vivaState.vivaQuestion;
    const ans = studentAnswer;

    try {
      setLoading(true);
      setError("");
      setStudentAnswer("");

      const res = await apiFetch("/viva-examiner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          studentAnswer: ans,
          questionNumber: currentQNum + 1,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to evaluate viva response.");

      setHistory((prev) => [
        ...prev,
        {
          qNum: currentQNum,
          question: currentQ,
          answer: ans,
          score: data.vivaData.score,
          feedback: data.vivaData.examinerComment,
        },
      ]);

      setVivaState(data.vivaData);
      speakQuestion(data.vivaData.vivaQuestion);
    } catch (err) {
      console.error("Submit Answer Error:", err);
      setError(err.message || "Failed to evaluate answer.");
    } finally {
      setLoading(false);
    }
  };

  const speakQuestion = (text) => {
    if (!speechEnabled || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
  };

  const getAvgScore = () => {
    if (history.length === 0) return 0;
    const total = history.reduce((acc, h) => acc + (Number(h.score) || 0), 0);
    return (total / history.length).toFixed(1);
  };

  return (
    <div className="viva-page">
      <div className="viva-header">
        <div>
          <h1>🎙️ AI Viva-Voce External Examiner</h1>
          <p>Simulate university oral exams with spoken questions, real-time score grading & feedback.</p>
        </div>

        <button
          className={`speech-toggle-btn ${speechEnabled ? "active" : ""}`}
          onClick={() => {
            setSpeechEnabled(!speechEnabled);
            if (speechEnabled) window.speechSynthesis.cancel();
          }}
        >
          {speechEnabled ? "🔊 Speech Enabled" : "🔇 Muted"}
        </button>
      </div>

      {!vivaState && !loading && (
        <div className="viva-input-card">
          <label>Enter Examination Subject / Unit</label>
          <div className="input-group">
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && startViva()}
              placeholder="e.g., Computer Networks & Protocol Layers"
            />
            <button className="primary-btn" onClick={() => startViva()} disabled={loading}>
              👨‍🏫 Begin Oral Viva
            </button>
          </div>

          <div className="chip-container">
            <p>Popular Viva Subjects:</p>
            <div className="chips">
              {["Data Mining", "Java Web Technology", "Machine Learning", "Software Engineering", "Search Engine Optimization"].map((t, idx) => (
                <button key={idx} className="chip-btn" onClick={() => startViva(t)}>
                  🎓 {t}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="viva-loading">
          <div className="examiner-avatar pulse">👨‍🏫</div>
          <h2>External Examiner is listening & preparing evaluation...</h2>
        </div>
      )}

      {error && <div className="viva-error">⚠️ {error}</div>}

      {vivaState && !loading && (
        <div className="viva-stage">
          <div className="examiner-card">
            <div className="examiner-avatar">👨‍🏫</div>
            <div className="examiner-dialog">
              <div className="examiner-tag">University External Examiner</div>
              <h3 className="viva-question">"{vivaState.vivaQuestion}"</h3>
              <p className="examiner-comment">{vivaState.examinerComment}</p>
            </div>
          </div>

          <div className="student-response-card">
            <label>Your Viva Response (Type or speak your answer clearly):</label>
            <textarea
              value={studentAnswer}
              onChange={(e) => setStudentAnswer(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  submitAnswer();
                }
              }}
              placeholder="Explain the technical concept in your own words..."
              rows="4"
            />

            <div className="response-actions">
              <button className="secondary-btn" onClick={() => speakQuestion(vivaState.vivaQuestion)}>
                🔊 Repeat Question
              </button>
              <button className="primary-btn" onClick={submitAnswer} disabled={!studentAnswer.trim() || loading}>
                ✨ Submit Answer to Examiner →
              </button>
            </div>
          </div>

          {history.length > 0 && (
            <div className="viva-scorecard">
              <div className="scorecard-header">
                <h3>📊 Viva Scorecard</h3>
                <span className="avg-badge">Average Marks: <strong>{getAvgScore()} / 10</strong></span>
              </div>

              <div className="history-timeline">
                {history.map((item, idx) => (
                  <div key={idx} className="history-entry">
                    <div className="entry-header">
                      <span className="q-tag">Question #{item.qNum}</span>
                      <span className="score-badge">Score: <strong>{item.score} / 10</strong></span>
                    </div>
                    <p className="hist-q"><strong>Q:</strong> {item.question}</p>
                    <p className="hist-a"><strong>Your Answer:</strong> {item.answer}</p>
                    <p className="hist-fb">💡 <strong>Examiner Remarks:</strong> {item.feedback}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default VivaExaminer;
