import { useState, useEffect } from "react";
import "./QuizBattle.css";
import { apiFetch } from "./utils/api";

function QuizBattle() {
  const [topic, setTopic] = useState("");
  const [battleQuestions, setBattleQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userScore, setUserScore] = useState(0);
  const [botScore, setBotScore] = useState(0);
  const [userAnswered, setUserAnswered] = useState(null);
  const [botAnswered, setBotAnswered] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [battleFinished, setBattleFinished] = useState(false);

  const startBattle = async (selectedTopic) => {
    const t = selectedTopic || topic;
    if (!t.trim()) {
      alert("Please enter a topic for the Speed Battle.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setBattleQuestions([]);
      setCurrentIdx(0);
      setUserScore(0);
      setBotScore(0);
      setUserAnswered(null);
      setBotAnswered(null);
      setBattleFinished(false);

      const res = await apiFetch("/quiz-battle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: t }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to start quiz battle.");

      setBattleQuestions(data.battleData || []);
      setTopic(t);
    } catch (err) {
      console.error("Battle Error:", err);
      setError(err.message || "Failed to initialize speed battle.");
    } finally {
      setLoading(false);
    }
  };

  const handleUserSelect = (option) => {
    if (userAnswered !== null) return;
    const currentQ = battleQuestions[currentIdx];
    setUserAnswered(option);

    const isCorrect = option === currentQ.correctAnswer;
    if (isCorrect) setUserScore((prev) => prev + 100);

    // Simulate AI Bot response after 1.2 sec
    setTimeout(() => {
      const botChoice = currentQ.botSelection || currentQ.correctAnswer;
      setBotAnswered(botChoice);
      if (botChoice === currentQ.correctAnswer) {
        setBotScore((prev) => prev + 100);
      }
    }, 1000);
  };

  const nextQuestion = () => {
    if (currentIdx < battleQuestions.length - 1) {
      setCurrentIdx((prev) => prev + 1);
      setUserAnswered(null);
      setBotAnswered(null);
    } else {
      setBattleFinished(true);
    }
  };

  const currentQ = battleQuestions[currentIdx];

  return (
    <div className="battle-page">
      <div className="battle-header">
        <div>
          <h1>⚔️ AI Speed Quiz Battle</h1>
          <p>Compete in a rapid-fire duel against the AI Study Bot!</p>
        </div>
      </div>

      {battleQuestions.length === 0 && !loading && (
        <div className="battle-input-card">
          <label>Choose Battle Topic</label>
          <div className="input-group">
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && startBattle()}
              placeholder="e.g., Fast Data Structures & Algorithms Duel"
            />
            <button className="primary-btn battle-btn" onClick={() => startBattle()} disabled={loading}>
              ⚔️ Start AI Duel
            </button>
          </div>

          <div className="chip-container">
            <p>Popular Battle Arenas:</p>
            <div className="chips">
              {["Data Mining Rapid Battle", "Java Web Tech Duel", "Machine Learning Speed Quiz", "Software Engineering Blitz", "SEO Ranking Speed Test"].map((t, idx) => (
                <button key={idx} className="chip-btn" onClick={() => startBattle(t)}>
                  ⚔️ {t}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="battle-loading">
          <div className="spinner">⚔️</div>
          <h2>AI Bot is entering the arena...</h2>
          <p>Preparing 5 rapid-fire speed questions.</p>
        </div>
      )}

      {error && <div className="battle-error">⚠️ {error}</div>}

      {battleQuestions.length > 0 && !battleFinished && (
        <div className="arena-container">
          <div className="duel-scoreboard">
            <div className="player-score user-card">
              <div className="avatar">🧑‍🎓</div>
              <div>
                <span className="player-name">YOU</span>
                <strong className="score-val">{userScore} PTS</strong>
              </div>
            </div>

            <div className="vs-badge">VS</div>

            <div className="player-score bot-card">
              <div>
                <span className="player-name">AI BOT</span>
                <strong className="score-val">{botScore} PTS</strong>
              </div>
              <div className="avatar">🤖</div>
            </div>
          </div>

          {currentQ && (
            <div className="battle-q-card">
              <div className="q-progress">Round {currentIdx + 1} of {battleQuestions.length}</div>
              <h2>{currentQ.question}</h2>

              <div className="battle-options">
                {currentQ.options.map((opt, oIdx) => {
                  const isUserSel = userAnswered === opt;
                  const isBotSel = botAnswered === opt;
                  const isCorrect = opt === currentQ.correctAnswer;

                  let optClass = "";
                  if (userAnswered !== null) {
                    if (isCorrect) optClass = "correct-battle";
                    else if (isUserSel && !isCorrect) optClass = "wrong-battle";
                  }

                  return (
                    <button
                      key={oIdx}
                      className={`battle-opt-btn ${optClass}`}
                      onClick={() => handleUserSelect(opt)}
                      disabled={userAnswered !== null}
                    >
                      <span>{opt}</span>
                      <div className="tags-group">
                        {isUserSel && <span className="user-tag">🧑‍🎓 You</span>}
                        {isBotSel && <span className="bot-tag">🤖 Bot</span>}
                      </div>
                    </button>
                  );
                })}
              </div>

              {userAnswered !== null && (
                <div className="round-footer">
                  <span className="status-text">
                    {botAnswered !== null
                      ? botAnswered === currentQ.correctAnswer
                        ? "🤖 AI Bot answered correctly!"
                        : "🤖 AI Bot missed this round!"
                      : "🤖 AI Bot is answering..."}
                  </span>

                  <button className="primary-btn" onClick={nextQuestion}>
                    {currentIdx < battleQuestions.length - 1 ? "Next Round ➡️" : "View Final Winner 🏆"}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {battleFinished && (
        <div className="victory-screen">
          <div className="victory-card">
            <div className="victory-icon">
              {userScore > botScore ? "🏆" : userScore === botScore ? "🤝" : "🤖"}
            </div>
            <h2>
              {userScore > botScore ? "VICTORY! You Defeated the AI Bot!" : userScore === botScore ? "IT'S A TIE!" : "AI Bot Won This Round!"}
            </h2>

            <div className="final-scores">
              <div>You: <strong>{userScore} PTS</strong></div>
              <div>AI Bot: <strong>{botScore} PTS</strong></div>
            </div>

            <button className="primary-btn" onClick={() => startBattle(topic)}>
              ⚔️ Rematch AI Bot
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default QuizBattle;
