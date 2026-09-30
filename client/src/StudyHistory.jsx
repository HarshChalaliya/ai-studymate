import { useEffect, useState } from "react";
import "./StudyHistory.css";
import { apiFetch } from "./utils/api";

function StudyHistory({ onStartWeakPractice }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await apiFetch("/results");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch study history");
      }

      setHistory(data.results || []);
    } catch (err) {
      console.error("Study History Error:", err);
      setError("❌ Failed to load study history. Please make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = async (id) => {
    if (!window.confirm("Are you sure you want to delete this quiz record?")) return;
    try {
      const res = await apiFetch(`/results/${id}`, { method: "DELETE" });
      if (res.ok) {
        setHistory((prev) => prev.filter((item) => item._id !== id));
      }
    } catch (err) {
      console.error("Delete History Error:", err);
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm("⚠️ Are you sure you want to CLEAR ALL quiz history? This action cannot be undone.")) return;
    try {
      const res = await apiFetch("/results", { method: "DELETE" });
      if (res.ok) {
        setHistory([]);
      }
    } catch (err) {
      console.error("Clear History Error:", err);
    }
  };

  const filteredHistory = history.filter((item) =>
    item.topic.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="history-page">
      <div className="history-header">
        <div>
          <h1>📚 Study History & Analytics</h1>
          <p>Track performance over time and re-practice weak areas.</p>
        </div>

        <div className="history-header-actions">
          {history.length > 0 && (
            <button className="clear-all-btn" onClick={handleClearAll}>
              🗑️ Clear All History
            </button>
          )}
          <button className="refresh-history-btn" onClick={fetchHistory} disabled={loading}>
            {loading ? "⏳ Loading..." : "🔄 Refresh"}
          </button>
        </div>
      </div>

      {history.length > 0 && (
        <div className="history-search-bar">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="🔍 Search past quizzes by topic..."
          />
        </div>
      )}

      {loading && (
        <div className="empty-history">
          <div className="empty-icon">⏳</div>
          <h2>Loading your study history...</h2>
          <p>Fetching quiz results from database.</p>
        </div>
      )}

      {!loading && error && (
        <div className="empty-history">
          <div className="empty-icon">⚠️</div>
          <h2>Something went wrong</h2>
          <p>{error}</p>
          <button className="refresh-history-btn" onClick={fetchHistory}>
            🔄 Try Again
          </button>
        </div>
      )}

      {!loading && !error && history.length === 0 && (
        <div className="empty-history">
          <div className="empty-icon">📖</div>
          <h2>No quiz history yet</h2>
          <p>Take an AI MCQ Quiz and your results and performance data will appear here.</p>
        </div>
      )}

      {!loading && !error && filteredHistory.length > 0 && (
        <div className="history-list">
          {filteredHistory.map((item) => (
            <div className="history-card" key={item._id}>
              <div className="history-card-top">
                <div className="history-info">
                  <h2>{item.topic}</h2>
                  <p>🕒 {new Date(item.date).toLocaleString()}</p>
                </div>

                <div className="history-right-group">
                  <div className="history-score">
                    <strong>{item.score}/{item.totalQuestions}</strong>
                    <span>({item.percentage}%)</span>
                  </div>
                  <button
                    className="delete-item-btn"
                    onClick={() => handleDeleteItem(item._id)}
                    title="Delete Record"
                  >
                    🗑️
                  </button>
                </div>
              </div>

              <div className="history-progress">
                <div
                  className="history-progress-fill"
                  style={{
                    width: `${item.percentage}%`,
                    backgroundColor: item.percentage >= 80 ? "#10b981" : item.percentage >= 50 ? "#f59e0b" : "#ef4444",
                  }}
                />
              </div>

              {item.weakQuestions && item.weakQuestions.length > 0 && (
                <div className="history-weak">
                  <div className="history-weak-header">
                    <strong>📚 Weak Areas Identified: ({item.weakQuestions.length})</strong>
                    {onStartWeakPractice && (
                      <button
                        className="practice-weak-btn"
                        onClick={() =>
                          onStartWeakPractice({
                            topic: item.topic,
                            weakQuestions: item.weakQuestions,
                          })
                        }
                      >
                        🎯 Practice These Weak Areas →
                      </button>
                    )}
                  </div>
                  <ul>
                    {item.weakQuestions.slice(0, 3).map((q, idx) => (
                      <li key={idx}>{q}</li>
                    ))}
                  </ul>
                  {item.weakQuestions.length > 3 && (
                    <small>+{item.weakQuestions.length - 3} more weak questions</small>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default StudyHistory;