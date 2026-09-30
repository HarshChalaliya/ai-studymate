import { useState } from "react";
import "./ExplainTopic.css";
import { FormattedText } from "./utils/formatText";
import { apiFetch } from "./utils/api";

function ExplainTopic() {
  const [topic, setTopic] = useState("");
  const [depth, setDepth] = useState("beginner"); // 'beginner' | 'exam' | 'code'
  const [explanation, setExplanation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const explainTopic = async (overrideTopic) => {
    const targetTopic = overrideTopic || topic;
    if (!targetTopic.trim()) {
      alert("Please enter a topic first.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setExplanation("");

      let modeInstruction = "";
      if (depth === "beginner") {
        modeInstruction = "Explain as if teaching a beginner or high school student using simple real-world analogies.";
      } else if (depth === "code") {
        modeInstruction = "Focus heavily on practical code examples, syntax, implementation details, and step-by-step execution logic.";
      } else {
        modeInstruction = "Focus on MCA university exam preparation: technical definitions, diagrams/flow explanation, and exam scoring points.";
      }

      const prompt = `
You are an expert AI tutor for MCA / Computer Science students.

Explain the topic: "${targetTopic}"

Target Mode: ${modeInstruction}

Format the response using clear structured markdown:

# 💡 ${targetTopic}

## 🎯 Simple Definition & Concept
Explain in crisp, clear language.

## ⚙️ How It Works (Step-by-Step)
Break down the exact workflow or logic.

## 💻 Real-World Analogy & Example
Provide an easy-to-remember analogy or code snippet.

## 📌 Top Exam Takeaways
Key points to remember for high-scoring exam answers.
`;

      const response = await apiFetch("/ask-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: prompt }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to explain topic");
      }

      setExplanation(data.answer || "");
      setTopic(targetTopic);
    } catch (err) {
      console.error("Explain Topic Error:", err);
      setError(err.message || "Failed to explain topic.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(explanation);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="explain-page">
      <div className="explain-header">
        <div>
          <h1>💡 AI Topic Explainer</h1>
          <p>Understand complex algorithms, system concepts & code with tailored AI explanations.</p>
        </div>
      </div>

      <div className="explain-input-card">
        <label>Topic to Explain</label>
        <div className="input-group">
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && explainTopic()}
            placeholder="e.g., Deadlock Prevention vs Avoidance in OS"
          />
          <button onClick={() => explainTopic()} disabled={loading} className="primary-btn">
            {loading ? "🤖 Explaining..." : "💡 Explain Topic"}
          </button>
        </div>

        <div className="mode-selector">
          <span>Explanation Style:</span>
          <div className="mode-buttons">
            <button
              className={`mode-btn ${depth === "beginner" ? "active" : ""}`}
              onClick={() => setDepth("beginner")}
            >
              🌱 Simple & Beginner
            </button>
            <button
              className={`mode-btn ${depth === "exam" ? "active" : ""}`}
              onClick={() => setDepth("exam")}
            >
              🎓 MCA Exam Focused
            </button>
            <button
              className={`mode-btn ${depth === "code" ? "active" : ""}`}
              onClick={() => setDepth("code")}
            >
              💻 Code & Technical
            </button>
          </div>
        </div>
      </div>

      {loading && (
        <div className="explain-loading">
          <div className="spinner">🧠</div>
          <h2>AI is crafting your explanation...</h2>
          <p>Breaking down complex ideas into intuitive, easy-to-remember concepts.</p>
        </div>
      )}

      {error && <div className="explain-error">⚠️ {error}</div>}

      {explanation && !loading && (
        <div className="explain-result-card">
          <div className="explain-result-header">
            <div>
              <span>💡</span>
              <div>
                <h2>{topic}</h2>
                <p>Tailored AI Explanation ({depth} mode)</p>
              </div>
            </div>

            <div className="action-buttons">
              <button className="action-btn copy-btn" onClick={handleCopy}>
                {copied ? "✅ Copied!" : "📋 Copy"}
              </button>
              <button className="action-btn print-btn" onClick={() => window.print()}>
                🖨️ Print
              </button>
            </div>
          </div>

          <div className="explain-content paper-style">
            <FormattedText text={explanation} />
          </div>
        </div>
      )}
    </div>
  );
}

export default ExplainTopic;