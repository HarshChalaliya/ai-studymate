import { useState } from "react";
import "./CheatSheet.css";
import { FormattedText } from "./utils/formatText";
import { apiFetch } from "./utils/api";

function CheatSheet() {
  const [topic, setTopic] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const generateCheatSheet = async (selectedTopic) => {
    const t = selectedTopic || topic;
    if (!t.trim()) {
      alert("Please enter a subject or topic for the cheat-sheet.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setContent("");

      const res = await apiFetch("/generate-cheatsheet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: t }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate cheat-sheet.");

      setContent(data.cheatSheet || "");
      setTopic(t);
    } catch (err) {
      console.error("CheatSheet Error:", err);
      setError(err.message || "Failed to generate 1-page cheat-sheet.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="cheatsheet-page">
      <div className="cheatsheet-header">
        <div>
          <h1>📄 Smart 1-Page Exam Cheat-Sheet</h1>
          <p>Condensed 5-minute pre-exam revision notes with comparison tables and formula summaries.</p>
        </div>
      </div>

      <div className="cheatsheet-input-card">
        <label>Enter Subject or Exam Module</label>
        <div className="input-group">
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && generateCheatSheet()}
            placeholder="e.g., Computer Organization Cache Memory & Pipelining"
          />
          <button className="primary-btn" onClick={() => generateCheatSheet()} disabled={loading}>
            {loading ? "⚡ Compiling..." : "📄 Create 1-Page Cheat-Sheet"}
          </button>
        </div>

        <div className="chip-container">
          <p>Popular Cheat-Sheet Topics:</p>
          <div className="chips">
            {["Data Mining Association Rules", "Java Web Architecture", "Machine Learning Algorithms", "Software Engineering Design Patterns", "Search Engine Optimization Checklist"].map((t, idx) => (
              <button key={idx} className="chip-btn" onClick={() => generateCheatSheet(t)}>
                ⚡ {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading && (
        <div className="cheatsheet-loading">
          <div className="spinner">⚡</div>
          <h2>AI is distilling topic into an ultra-dense 1-page cheat-sheet...</h2>
        </div>
      )}

      {error && <div className="cheatsheet-error">⚠️ {error}</div>}

      {content && !loading && (
        <div className="cheatsheet-result">
          <div className="result-header-bar">
            <h2>📄 1-Page Revision Sheet: {topic}</h2>
            <div className="action-buttons">
              <button className="action-btn copy-btn" onClick={handleCopy}>
                {copied ? "✅ Copied!" : "📋 Copy"}
              </button>
              <button className="action-btn print-btn" onClick={() => window.print()}>
                🖨️ Print / Save PDF
              </button>
            </div>
          </div>

          <div className="cheatsheet-paper paper-style">
            <FormattedText text={content} />
          </div>
        </div>
      )}
    </div>
  );
}

export default CheatSheet;
