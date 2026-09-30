import { useState, useEffect } from "react";
import "./MCQGenerator.css";
import { FormattedText } from "./utils/formatText";
import { apiFetch } from "./utils/api";

function MCQGenerator({
  weakMode = false,
  weakTopic = "",
  weakQuestions = [],
}) {
  const [topic, setTopic] = useState(weakMode ? weakTopic : "");
  const [questionCount, setQuestionCount] = useState(5); // 5 for fast (2 sec) or 10 for exam
  const [mcqs, setMcqs] = useState([]);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const [loading, setLoading] = useState(false);
  const [revisionLoading, setRevisionLoading] = useState(false);
  const [revision, setRevision] = useState("");
  const [error, setError] = useState("");

  // Quiz Timer State
  const [timerMinutes, setTimerMinutes] = useState(0);
  const [timeLeft, setTimeLeft] = useState(null);
  const [filterResultMode, setFilterResultMode] = useState("all");

  useEffect(() => {
    let interval = null;
    if (timeLeft !== null && timeLeft > 0 && !submitted) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && !submitted && mcqs.length > 0) {
      alert("⏱️ Time is up! Submitting your quiz automatically.");
      submitQuiz();
    }
    return () => clearInterval(interval);
  }, [timeLeft, submitted, mcqs]);

  const normalizeOption = (option) => {
    if (typeof option !== "string") return String(option || "");
    return option.replace(/\*\*/g, "").replace(/^["']|["']$/g, "").trim();
  };

  const normalizeMCQs = (rawMcqs) => {
    if (!Array.isArray(rawMcqs)) return [];

    return rawMcqs
      .map((item) => {
        if (!item) return null;

        const question = String(item.question || "")
          .replace(/\*\*/g, "")
          .replace(/^#+\s*/, "")
          .trim();

        let options = Array.isArray(item.options)
          ? item.options.map(normalizeOption).filter(Boolean)
          : [];

        options = options
          .map((opt) => opt.replace(/^[A-Da-d](?:[\.\:\-\)])\s*/, "").trim())
          .slice(0, 4);

        const correctAnswer = item.correctAnswer || item.answer || options[0];
        const explanation = item.explanation || "No explanation provided.";

        if (!question || options.length !== 4) return null;

        return { question, options, correctAnswer, explanation };
      })
      .filter(Boolean);
  };

  const generateMCQs = async () => {
    if (!topic.trim()) {
      alert("Please enter a topic first.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setMcqs([]);
      setScore(null);
      setSubmitted(false);
      setAnswers({});
      setRevision("");

      const endpoint = weakMode ? "/generate-weak-mcqs" : "/generate-mcqs";
      const body = weakMode
        ? { topic, weakQuestions, count: questionCount }
        : { topic, count: questionCount };

      const response = await apiFetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate MCQs");
      }

      const normalizedMCQs = normalizeMCQs(data.mcqs);

      if (normalizedMCQs.length === 0) {
        throw new Error("AI returned invalid MCQ formatting. Please try again.");
      }

      setMcqs(normalizedMCQs);
      if (timerMinutes > 0) {
        setTimeLeft(timerMinutes * 60);
      } else {
        setTimeLeft(null);
      }
    } catch (err) {
      console.error("MCQ Error:", err);
      setError(err.message || "Failed to generate MCQs.");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (questionIndex, answer) => {
    if (submitted) return;
    setAnswers((prev) => ({
      ...prev,
      [questionIndex]: answer,
    }));
  };

  const getWeakQuestions = () => {
    return mcqs
      .filter((q, index) => answers[index] !== q.correctAnswer)
      .map((q) => q.question);
  };

  const generateRevisionPlan = async (currentScore, totalCount, weakQs) => {
    try {
      setRevisionLoading(true);
      const res = await apiFetch("/personalized-revision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          score: currentScore,
          totalQuestions: totalCount,
          weakQuestions: weakQs,
        }),
      });

      const data = await res.json();
      if (res.ok && data.revision) {
        setRevision(data.revision);
      }
    } catch (err) {
      console.error("Revision Generation Error:", err);
    } finally {
      setRevisionLoading(false);
    }
  };

  const submitQuiz = async () => {
    if (mcqs.length === 0 || submitted) return;

    let finalScore = 0;
    mcqs.forEach((q, index) => {
      if (answers[index] === q.correctAnswer) {
        finalScore++;
      }
    });

    const totalQuestions = mcqs.length;
    const percentage = Math.round((finalScore / totalQuestions) * 100);

    setScore(finalScore);
    setSubmitted(true);
    setTimeLeft(null);

    const weakQs = getWeakQuestions();

    // Auto-generate revision material immediately
    generateRevisionPlan(finalScore, totalQuestions, weakQs);

    try {
      await apiFetch("/results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          score: finalScore,
          totalQuestions,
          percentage,
          weakQuestions: weakQs,
        }),
      });
    } catch (err) {
      console.error("Save Result Error:", err);
    }
  };

  const formatTimer = (seconds) => {
    if (seconds === null) return null;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const answeredCount = Object.keys(answers).length;
  const progressPercent = mcqs.length > 0 ? Math.round((answeredCount / mcqs.length) * 100) : 0;

  return (
    <div className="mcq-page">
      <div className="mcq-header">
        <div>
          <h1>{weakMode ? "🎯 Weak Area Practice Quiz" : "❓ AI Exam MCQ Generator"}</h1>
          <p>{weakMode ? "Targeted questions based on your weak performance." : "Practice exam-oriented questions generated by AI."}</p>
        </div>
      </div>

      {mcqs.length === 0 && !loading && (
        <div className="mcq-topic-card">
          <label>Enter Subject or Exam Topic</label>
          <div className="input-group">
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && generateMCQs()}
              placeholder="e.g., Data Mining Classification or Machine Learning"
              disabled={weakMode}
            />
            <button className="primary-btn generate-btn" onClick={generateMCQs} disabled={loading}>
              {weakMode ? `🎯 Practice (${questionCount} MCQs)` : `✨ Generate ${questionCount} MCQs`}
            </button>
          </div>

          {!weakMode && (
            <div className="quiz-settings-bar">
              <div className="setting-group">
                <span>⚡ Question Count:</span>
                <div className="chip-buttons">
                  <button
                    className={`timer-chip ${questionCount === 5 ? "active" : ""}`}
                    onClick={() => setQuestionCount(5)}
                  >
                    🚀 5 Questions (Ultra Fast)
                  </button>
                  <button
                    className={`timer-chip ${questionCount === 10 ? "active" : ""}`}
                    onClick={() => setQuestionCount(10)}
                  >
                    📝 10 Questions (Standard)
                  </button>
                </div>
              </div>

              <div className="setting-group">
                <span>⏱️ Timer:</span>
                <div className="chip-buttons">
                  {[0, 5, 10].map((m) => (
                    <button
                      key={m}
                      className={`timer-chip ${timerMinutes === m ? "active" : ""}`}
                      onClick={() => setTimerMinutes(m)}
                    >
                      {m === 0 ? "Untimed" : `${m} Mins`}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {error && <div className="mcq-error">⚠️ {error}</div>}
        </div>
      )}

      {loading && (
        <div className="mcq-loading">
          <div className="spinner">🤖</div>
          <h2>AI is constructing your exam quiz...</h2>
          <p>Generating {questionCount} targeted questions with option explanations.</p>
        </div>
      )}

      {mcqs.length > 0 && score === null && (
        <div className="quiz-container">
          <div className="quiz-topbar">
            <div>
              <span>📚 Topic: <strong>{topic}</strong></span>
              <span className="answered-status">Progress: {answeredCount} / {mcqs.length}</span>
            </div>

            {timeLeft !== null && (
              <div className={`quiz-timer ${timeLeft < 60 ? "warning" : ""}`}>
                ⏱️ Time Remaining: <strong>{formatTimer(timeLeft)}</strong>
              </div>
            )}
          </div>

          <div className="quiz-progress-track">
            <div className="quiz-progress-fill" style={{ width: `${progressPercent}%` }} />
          </div>

          {mcqs.map((question, qIdx) => (
            <div key={qIdx} className="question-card">
              <div className="question-number">Question {qIdx + 1} of {mcqs.length}</div>
              <h2>{question.question}</h2>

              <div className="options">
                {question.options.map((option, oIdx) => {
                  const selected = answers[qIdx] === option;
                  const optionLetter = String.fromCharCode(65 + oIdx);

                  return (
                    <button
                      key={oIdx}
                      type="button"
                      className={`option-btn ${selected ? "selected" : ""}`}
                      onClick={() => handleAnswer(qIdx, option)}
                    >
                      <span className="option-letter">{optionLetter}</span>
                      <span className="option-text">{option}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          <div className="submit-section">
            <button className="submit-btn" onClick={submitQuiz}>
              🏆 Submit Quiz & View Results
            </button>
          </div>
        </div>
      )}

      {score !== null && (
        <div className="result-container">
          <div className="result-card">
            <div className="result-icon">
              {score / mcqs.length >= 0.8 ? "🏆" : score / mcqs.length >= 0.5 ? "👍" : "📚"}
            </div>
            <h2>Quiz Result</h2>
            <div className="result-score">
              {score} <span>/ {mcqs.length}</span>
            </div>
            <div className="result-percentage">
              {Math.round((score / mcqs.length) * 100)}%
            </div>
            <p className="result-message">
              {score / mcqs.length >= 0.8
                ? "🎉 Outstanding! Excellent mastery of this topic."
                : score / mcqs.length >= 0.5
                ? "👍 Good job! Review the weak area revision below to reach 100%."
                : "📚 Needs revision. Read the AI explanations and revision plan below."}
            </p>

            <div className="result-actions">
              <button className="reset-btn" onClick={() => setMcqs([])}>
                🔄 Take Another Quiz
              </button>
            </div>
          </div>

          {/* AI REVISION PLAN CARD (AUTOMATIC) */}
          <div className="revision-section">
            <h3 className="section-title">🧠 Personalized AI Revision Plan</h3>
            {revisionLoading && (
              <div className="notes-loading">
                <div className="spinner">🧠</div>
                <p>AI is building your personalized weak area revision plan...</p>
              </div>
            )}

            {!revisionLoading && revision && (
              <div className="revision-card paper-style">
                <FormattedText text={revision} />
              </div>
            )}
          </div>

          <div className="result-filter-bar">
            <h3>Review Questions & Explanations</h3>
            <div className="filter-buttons">
              <button
                className={`filter-btn ${filterResultMode === "all" ? "active" : ""}`}
                onClick={() => setFilterResultMode("all")}
              >
                All ({mcqs.length})
              </button>
              <button
                className={`filter-btn ${filterResultMode === "correct" ? "active" : ""}`}
                onClick={() => setFilterResultMode("correct")}
              >
                Correct ({score})
              </button>
              <button
                className={`filter-btn ${filterResultMode === "incorrect" ? "active" : ""}`}
                onClick={() => setFilterResultMode("incorrect")}
              >
                Incorrect ({mcqs.length - score})
              </button>
            </div>
          </div>

          <div className="review-questions-list">
            {mcqs
              .map((q, idx) => ({ ...q, originalIndex: idx }))
              .filter((q) => {
                const isCorrect = answers[q.originalIndex] === q.correctAnswer;
                if (filterResultMode === "correct") return isCorrect;
                if (filterResultMode === "incorrect") return !isCorrect;
                return true;
              })
              .map((q) => {
                const selectedAns = answers[q.originalIndex];
                const isCorrect = selectedAns === q.correctAnswer;

                return (
                  <div key={q.originalIndex} className={`review-card ${isCorrect ? "is-correct" : "is-wrong"}`}>
                    <div className="review-header">
                      <span className="q-badge">Q{q.originalIndex + 1}</span>
                      <span className={`status-badge ${isCorrect ? "correct" : "wrong"}`}>
                        {isCorrect ? "✅ Correct" : "❌ Incorrect"}
                      </span>
                    </div>

                    <h3>{q.question}</h3>

                    <div className="review-options">
                      {q.options.map((opt, oIdx) => {
                        const isThisCorrect = opt === q.correctAnswer;
                        const isThisSelected = opt === selectedAns;

                        let optClass = "";
                        if (isThisCorrect) optClass = "correct-opt";
                        else if (isThisSelected && !isThisCorrect) optClass = "wrong-opt";

                        return (
                          <div key={oIdx} className={`review-opt ${optClass}`}>
                            <span>{String.fromCharCode(65 + oIdx)}. {opt}</span>
                            {isThisCorrect && <span className="tag">✓ Correct Answer</span>}
                            {isThisSelected && !isThisCorrect && <span className="tag">Your Selection</span>}
                          </div>
                        );
                      })}
                    </div>

                    <div className="explanation-box">
                      💡 <strong>AI Explanation:</strong> {q.explanation}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}

export default MCQGenerator;