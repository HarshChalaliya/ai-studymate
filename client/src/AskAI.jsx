import { useState } from "react";
import "./AskAI.css";
import { FormattedText } from "./utils/formatText";
import { apiFetch } from "./utils/api";

function AskAI() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const sampleQuestions = [
    "What is the difference between Process and Thread in OS?",
    "Explain B-Tree vs B+ Tree in Database Indexing.",
    "How does TCP 3-Way Handshake work?",
    "Explain React Virtual DOM and Reconciliation.",
  ];

  const handleAsk = async (queryText) => {
    const q = queryText || question;
    if (!q.trim()) return;

    setLoading(true);
    setAnswer("");

    try {
      const response = await apiFetch("/ask-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      setAnswer(data.answer);
      setQuestion(q);
    } catch (error) {
      console.error(error);
      setAnswer("❌ Failed to get AI response. Please make sure the backend server is running.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(answer);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="ask-ai-page">
      <div className="ask-header">
        <h1>💬 Ask AI Assistant</h1>
        <p>Instant academic & technical answers powered by Gemini AI.</p>
      </div>

      <div className="ask-card">
        <label>Your Question</label>
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleAsk();
            }
          }}
          placeholder="Ask anything... (e.g. Explain SQL Joins with examples, or how Dijkstra's algorithm works)"
          rows="4"
        />

        <div className="ask-card-footer">
          <span className="hint-text">💡 Press Enter to submit (Shift+Enter for new line)</span>
          <button className="primary-btn ask-button" onClick={() => handleAsk()} disabled={loading}>
            {loading ? "🤖 Thinking..." : "✨ Ask AI"}
          </button>
        </div>

        <div className="sample-prompts">
          <span>Quick Suggestions:</span>
          <div className="prompts-list">
            {sampleQuestions.map((q, idx) => (
              <button key={idx} className="prompt-chip" onClick={() => handleAsk(q)}>
                ⚡ {q}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading && (
        <div className="ask-loading">
          <div className="spinner">🤖</div>
          <h3>AI is analyzing your question...</h3>
        </div>
      )}

      {answer && !loading && (
        <div className="answer-card">
          <div className="answer-header">
            <h2>🤖 AI Answer</h2>
            <button className="action-btn copy-btn" onClick={handleCopy}>
              {copied ? "✅ Copied!" : "📋 Copy"}
            </button>
          </div>
          <div className="answer-body paper-style">
            <FormattedText text={answer} />
          </div>
        </div>
      )}
    </div>
  );
}

export default AskAI;