import { useState, useEffect, useRef } from "react";
import mermaid from "mermaid";
import "./MindMap.css";
import { apiFetch } from "./utils/api";

// Initialize mermaid
mermaid.initialize({
  startOnLoad: false,
  theme: "dark",
  securityLevel: "loose",
});

function MindMap() {
  const [topic, setTopic] = useState("");
  const [mindmapData, setMindmapData] = useState(null); // { topic, mermaidCode, breakdown }
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const svgRef = useRef(null);

  const generateMindMap = async (selectedTopic) => {
    const t = selectedTopic || topic;
    if (!t.trim()) {
      alert("Please enter a subject or topic for the MindMap.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setMindmapData(null);

      const res = await apiFetch("/generate-mindmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: t }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate MindMap.");

      setMindmapData(data.mindmapData);
      setTopic(t);
    } catch (err) {
      console.error("MindMap Error:", err);
      setError(err.message || "Failed to generate MindMap diagram.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (mindmapData && mindmapData.mermaidCode && svgRef.current) {
      const renderDiagram = async () => {
        try {
          const uniqueId = `mermaid-${Date.now()}`;
          const cleanCode = mindmapData.mermaidCode.replace(/```mermaid/gi, "").replace(/```/g, "").trim();
          const { svg } = await mermaid.render(uniqueId, cleanCode);
          if (svgRef.current) {
            svgRef.current.innerHTML = svg;
          }
        } catch (mErr) {
          console.error("Mermaid Render Error:", mErr);
          // Fallback diagram rendering
          svgRef.current.innerHTML = `<div class="fallback-diagram">
            <h3>📌 ${mindmapData.topic}</h3>
            <p>Diagram generated. View structured breakdown below.</p>
          </div>`;
        }
      };
      renderDiagram();
    }
  }, [mindmapData]);

  return (
    <div className="mindmap-page">
      <div className="mindmap-header">
        <div>
          <h1>🧠 AI Visual MindMap & Flowcharts</h1>
          <p>Instantly visualize complex system architectures, algorithms & concept hierarchies.</p>
        </div>
      </div>

      <div className="mindmap-input-card">
        <label>Enter Subject or Concept to Map</label>
        <div className="input-group">
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && generateMindMap()}
            placeholder="e.g., Compiler Design Phases & Syntax Trees"
          />
          <button className="primary-btn" onClick={() => generateMindMap()} disabled={loading}>
            {loading ? "🤖 Mapping..." : "🧠 Generate MindMap"}
          </button>
        </div>

        <div className="chip-container">
          <p>Popular MindMap Topics:</p>
          <div className="chips">
            {["Data Mining Techniques", "Java Web Servlet & JSP", "Machine Learning Neural Networks", "Software Engineering SDLC", "SEO Ranking Factors"].map((t, idx) => (
              <button key={idx} className="chip-btn" onClick={() => generateMindMap(t)}>
                📌 {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading && (
        <div className="mindmap-loading">
          <div className="spinner">🧠</div>
          <h2>AI is constructing your visual flowchart diagram...</h2>
          <p>Parsing nodes, relationships, and structural dependencies.</p>
        </div>
      )}

      {error && <div className="mindmap-error">⚠️ {error}</div>}

      {mindmapData && !loading && (
        <div className="mindmap-result">
          <div className="diagram-viewer-card">
            <div className="viewer-header">
              <h2>📊 Diagram: {mindmapData.topic}</h2>
              <button className="action-btn print-btn" onClick={() => window.print()}>
                🖨️ Print Diagram
              </button>
            </div>

            <div className="svg-container" ref={svgRef} />
          </div>

          {mindmapData.breakdown && mindmapData.breakdown.length > 0 && (
            <div className="breakdown-grid">
              <h3>📌 Concept Node Explanations</h3>
              <div className="cards-grid">
                {mindmapData.breakdown.map((item, idx) => (
                  <div key={idx} className="node-card">
                    <h4>{item.node}</h4>
                    <p>{item.explanation}</p>
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

export default MindMap;
