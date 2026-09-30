import { useState } from "react";
import "./Flashcards.css";
import { FormattedText } from "./utils/formatText";
import { apiFetch } from "./utils/api";

function Flashcards() {
  const [topic, setTopic] = useState("");
  const [cards, setCards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mastered, setMastered] = useState({});

  const popularTopics = [
    "Data Mining & Warehousing",
    "Java Web Tech (Servlets & JSP)",
    "Machine Learning Supervised Learning",
    "Software Engineering SDLC",
    "Search Engine Optimization (SEO)",
  ];

  const generateCards = async (selectedTopic) => {
    const topicToUse = selectedTopic || topic;
    if (!topicToUse.trim()) {
      alert("Please enter a topic first.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setCards([]);
      setCurrentIndex(0);
      setIsFlipped(false);
      setMastered({});

      const response = await apiFetch("/generate-flashcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: topicToUse }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate flashcards");
      }

      if (!Array.isArray(data.flashcards) || data.flashcards.length === 0) {
        throw new Error("No flashcards returned from AI.");
      }

      setCards(data.flashcards);
      setTopic(topicToUse);
    } catch (err) {
      console.error("Flashcards Error:", err);
      setError(err.message || "Something went wrong generating flashcards.");
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < cards.length - 1) {
      setIsFlipped(false);
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setIsFlipped(false);
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const toggleMastered = (id) => {
    setMastered((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const currentCard = cards[currentIndex];
  const masteredCount = Object.values(mastered).filter(Boolean).length;

  return (
    <div className="flashcards-page">
      <div className="flashcards-header">
        <div>
          <h1>🎴 AI Interactive Flashcards</h1>
          <p>Master key concepts faster with active recall & 3D flip study cards.</p>
        </div>
      </div>

      {cards.length === 0 && !loading && (
        <div className="flashcards-input-card">
          <label>Enter Subject or Topic</label>
          <div className="input-group">
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && generateCards()}
              placeholder="e.g., Operating System Paging & Segmentation"
            />
            <button className="primary-btn" onClick={() => generateCards()} disabled={loading}>
              ✨ Generate Cards
            </button>
          </div>

          <div className="chip-container">
            <p>Popular Topics:</p>
            <div className="chips">
              {popularTopics.map((t, idx) => (
                <button
                  key={idx}
                  className="chip-btn"
                  onClick={() => {
                    setTopic(t);
                    generateCards(t);
                  }}
                >
                  ⚡ {t}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="flashcards-loading">
          <div className="spinner">🎴</div>
          <h2>AI is crafting your flashcards...</h2>
          <p>Extracting high-value exam definitions and concepts for active recall.</p>
        </div>
      )}

      {error && (
        <div className="flashcards-error">
          ⚠️ {error}
          <button onClick={() => generateCards()} className="retry-btn">
            🔄 Try Again
          </button>
        </div>
      )}

      {cards.length > 0 && !loading && (
        <div className="flashcards-deck-container">
          <div className="deck-stats-bar">
            <div className="deck-topic">
              📚 <strong>{topic}</strong> ({cards.length} Cards)
            </div>
            <div className="deck-mastery">
              🏆 Mastered: <strong>{masteredCount} / {cards.length}</strong>
            </div>
            <button className="new-deck-btn" onClick={() => setCards([])}>
              ➕ New Topic
            </button>
          </div>

          <div className="flashcard-wrapper">
            <div
              className={`flashcard 3d-card ${isFlipped ? "flipped" : ""}`}
              onClick={() => setIsFlipped(!isFlipped)}
            >
              <div className="card-face card-front">
                <div className="card-badge">Card {currentIndex + 1} of {cards.length}</div>
                <div className="card-category">{currentCard?.category || "Concept"}</div>
                <div className="card-content">
                  <h3>{currentCard?.front}</h3>
                </div>
                <div className="flip-hint">💡 Click card or press flip to reveal answer</div>
              </div>

              <div className="card-face card-back">
                <div className="card-badge back-badge">Answer / Definition</div>
                <div className="card-content">
                  <FormattedText text={currentCard?.back} />
                </div>
                <div className="flip-hint">🔄 Click to return to question</div>
              </div>
            </div>
          </div>

          <div className="flashcard-controls">
            <button
              className="ctrl-btn prev-btn"
              onClick={handlePrev}
              disabled={currentIndex === 0}
            >
              ⬅️ Previous
            </button>

            <button
              className="ctrl-btn flip-btn"
              onClick={() => setIsFlipped(!isFlipped)}
            >
              🔄 Flip Card
            </button>

            <button
              className={`ctrl-btn master-btn ${mastered[currentCard?.id] ? "is-mastered" : ""}`}
              onClick={() => toggleMastered(currentCard?.id)}
            >
              {mastered[currentCard?.id] ? "✅ Mastered!" : "⭐ Mark Mastered"}
            </button>

            <button
              className="ctrl-btn next-btn"
              onClick={handleNext}
              disabled={currentIndex === cards.length - 1}
            >
              Next ➡️
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Flashcards;
