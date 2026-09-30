import { useState } from "react";
import "./ExamPredictor.css";
import { apiFetch } from "./utils/api";

function ExamPredictor() {
  const [syllabus, setSyllabus] = useState("");
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const predictQuestions = async (selectedTopic) => {
    const s = selectedTopic || syllabus;
    if (!s.trim()) {
      alert("Please enter a subject or syllabus topics.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setPrediction(null);

      const res = await apiFetch("/predict-exam", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ syllabus: s }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to predict exam questions.");

      setPrediction(data.predictionData);
      setSyllabus(s);
    } catch (err) {
      console.error("Predictor Error:", err);
      setError(err.message || "Failed to analyze syllabus.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="predictor-page">
      <div className="predictor-header">
        <div>
          <h1>🔮 AI Exam Paper Predictor</h1>
          <p>AI Paper Setter analysis: Predicts most expected 7-mark & 3-mark university exam questions.</p>
        </div>
      </div>

      <div className="predictor-input-card">
        <label>Enter Subject or Syllabus Units</label>
        <div className="input-group">
          <input
            type="text"
            value={syllabus}
            onChange={(e) => setSyllabus(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && predictQuestions()}
            placeholder="e.g., MCA Unit 1: Operating System Concepts & Process Management"
          />
          <button className="primary-btn" onClick={() => predictQuestions()} disabled={loading}>
            {loading ? "🔮 Predicting..." : "🔮 Predict Exam Questions"}
          </button>
        </div>

        <div className="chip-container">
          <p>Sample Syllabus Inputs:</p>
          <div className="chips">
            {["Data Mining K-Means & Clustering", "Java Web Servlets, JSP & Spring", "Machine Learning Regression & SVM", "Software Engineering Agile & SDLC", "Search Engine Optimization Keywords & Indexing"].map((s, idx) => (
              <button key={idx} className="chip-btn" onClick={() => predictQuestions(s)}>
                🔮 {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading && (
        <div className="predictor-loading">
          <div className="spinner">🔮</div>
          <h2>AI Paper Setter is analyzing question patterns...</h2>
          <p>Calculating topic weightage, 7-mark probability, and model answer structures.</p>
        </div>
      )}

      {error && <div className="predictor-error">⚠️ {error}</div>}

      {prediction && !loading && (
        <div className="predictor-result">
          <div className="result-topbar">
            <div>
              <h2>Paper Prediction: {prediction.subject}</h2>
              <p>Based on university exam patterns & weightage analysis</p>
            </div>
            <button className="action-btn print-btn" onClick={() => window.print()}>
              🖨️ Print Paper Outline
            </button>
          </div>

          {prediction.trickyTopics && prediction.trickyTopics.length > 0 && (
            <div className="tricky-box">
              <h3>⚠️ High-Risk Tricky Topics to Revise First:</h3>
              <div className="tricky-tags">
                {prediction.trickyTopics.map((t, idx) => (
                  <span key={idx} className="tricky-tag">🔥 {t}</span>
                ))}
              </div>
            </div>
          )}

          <div className="questions-section">
            <h3 className="section-title">🏆 Top Predicted 7-Mark Long Questions</h3>
            <div className="questions-grid">
              {prediction.predicted7Markers?.map((q, idx) => (
                <div key={idx} className="predicted-card long-card">
                  <div className="card-top">
                    <span className="q-type">7-Mark Question</span>
                    <span className="prob-badge">{q.probability} Probability</span>
                  </div>
                  <h3>{q.question}</h3>
                  <div className="model-outline">
                    <strong>Model Answer Structure:</strong>
                    <pre>{q.modelAnswerOutline}</pre>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="questions-section">
            <h3 className="section-title">⚡ Top Predicted 3-Mark Short Questions</h3>
            <div className="questions-grid">
              {prediction.predicted3Markers?.map((q, idx) => (
                <div key={idx} className="predicted-card short-card">
                  <div className="card-top">
                    <span className="q-type short">3-Mark Short Question</span>
                    <span className="prob-badge">{q.probability} Probability</span>
                  </div>
                  <h3>{q.question}</h3>
                  {q.keyTerms && (
                    <div className="key-terms">
                      <span>Key Terms to Mention:</span>
                      <div className="terms-list">
                        {q.keyTerms.map((term, tIdx) => (
                          <span key={tIdx} className="term-chip">{term}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ExamPredictor;
