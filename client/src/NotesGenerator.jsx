import { useState, useEffect } from "react";
import "./NotesGenerator.css";
import { FormattedText } from "./utils/formatText";
import { apiFetch } from "./utils/api";

function NotesGenerator() {
  const [topic, setTopic] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  // Saved Notes Tab State
  const [activeTab, setActiveTab] = useState("generator"); // 'generator' | 'saved'
  const [savedNotesList, setSavedNotesList] = useState([]);
  const [savedLoading, setSavedLoading] = useState(false);
  const [selectedSavedNote, setSelectedSavedNote] = useState(null);

  useEffect(() => {
    if (activeTab === "saved") {
      fetchSavedNotes();
    }
  }, [activeTab]);

  const fetchSavedNotes = async () => {
    try {
      setSavedLoading(true);
      const res = await apiFetch("/notes");
      const data = await res.json();
      if (res.ok) {
        setSavedNotesList(data.notes || []);
      }
    } catch (err) {
      console.error("Fetch Saved Notes Error:", err);
    } finally {
      setSavedLoading(false);
    }
  };

  const generateNotes = async () => {
    if (!topic.trim()) {
      alert("Please enter a topic first.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setNotes("");
      setSavedSuccess(false);

      const prompt = `
You are an AI study assistant for MCA / CS students.

Create simple, comprehensive, exam-oriented study notes for:

Topic: ${topic}

Structure your notes cleanly using markdown:

# 📚 ${topic} - Exam Study Notes

## 💡 Topic Overview & Introduction
Provide a clear, beginner-friendly introduction to the core concept.

## 🔑 Key Concepts & Definitions
Explain the essential terms, principles, or architectural layers in detail.

## 📝 Important Exam Points & Frequently Asked Questions
List key points that frequently appear in university exams.

## 💻 Real-World Example / Code Snippet
Provide a practical real-world scenario or brief code example demonstrating the topic.

## ⚡ Quick 1-Minute Revision Summary
5 essential bullet points to memorize before stepping into the exam hall.
`;

      const response = await apiFetch("/ask-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: prompt }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate notes");
      }

      setNotes(data.answer || "");
    } catch (err) {
      console.error("Notes Error:", err);
      setError(err.message || "Failed to generate notes.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNote = async (contentToSave, topicToSave) => {
    try {
      const res = await apiFetch("/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: topicToSave || topic,
          content: contentToSave || notes,
          category: "Exam Notes",
        }),
      });

      if (res.ok) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    } catch (err) {
      console.error("Save Note Error:", err);
      alert("Failed to save note to Database.");
    }
  };

  const handleDeleteSavedNote = async (id) => {
    if (!window.confirm("Are you sure you want to delete this saved note?")) return;
    try {
      const res = await apiFetch(`/notes/${id}`, { method: "DELETE" });
      if (res.ok) {
        setSavedNotesList((prev) => prev.filter((n) => n._id !== id));
        if (selectedSavedNote?._id === id) {
          setSelectedSavedNote(null);
        }
      }
    } catch (err) {
      console.error("Delete Note Error:", err);
    }
  };

  const handleCopy = (textToCopy) => {
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadMarkdown = (title, content) => {
    const element = document.createElement("a");
    const file = new Blob([content], { type: "text/markdown" });
    element.href = URL.createObjectURL(file);
    element.download = `${title.replace(/[^a-zA-Z0-9]/g, "_")}_Notes.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="notes-page">
      <div className="notes-header">
        <div>
          <h1>📝 AI Notes Generator</h1>
          <p>Generate, export & store comprehensive exam-oriented study notes.</p>
        </div>

        <div className="notes-tab-switch">
          <button
            className={`tab-btn ${activeTab === "generator" ? "active" : ""}`}
            onClick={() => setActiveTab("generator")}
          >
            ✨ Create Notes
          </button>
          <button
            className={`tab-btn ${activeTab === "saved" ? "active" : ""}`}
            onClick={() => setActiveTab("saved")}
          >
            💾 Saved Notes ({savedNotesList.length})
          </button>
        </div>
      </div>

      {activeTab === "generator" && (
        <>
          <div className="notes-input-card">
            <label>Enter Subject or Exam Topic</label>
            <div className="input-group">
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && generateNotes()}
                placeholder="Example: Operating System Process Scheduling Algorithms"
              />
              <button onClick={generateNotes} disabled={loading} className="primary-btn">
                {loading ? "🤖 Generating Notes..." : "✨ Generate Notes"}
              </button>
            </div>
          </div>

          {loading && (
            <div className="notes-loading">
              <div className="spinner">🤖</div>
              <h2>AI is compiling exam-oriented study notes...</h2>
              <p>Structuring concepts, exam FAQs, and revision summaries.</p>
            </div>
          )}

          {error && <div className="notes-error">⚠️ {error}</div>}

          {notes && !loading && (
            <div className="notes-result-card">
              <div className="notes-result-header">
                <div>
                  <span>📚</span>
                  <div>
                    <h2>{topic}</h2>
                    <p>AI-generated structured study material</p>
                  </div>
                </div>

                <div className="notes-action-buttons">
                  <button
                    className="action-btn save-btn"
                    onClick={() => handleSaveNote(notes, topic)}
                  >
                    {savedSuccess ? "✅ Saved!" : "💾 Save to DB"}
                  </button>
                  <button className="action-btn copy-btn" onClick={() => handleCopy(notes)}>
                    {copied ? "✅ Copied!" : "📋 Copy"}
                  </button>
                  <button
                    className="action-btn download-btn"
                    onClick={() => handleDownloadMarkdown(topic, notes)}
                  >
                    ⬇️ Download .md
                  </button>
                  <button className="action-btn print-btn" onClick={() => window.print()}>
                    🖨️ Print
                  </button>
                </div>
              </div>

              <div className="notes-content paper-style">
                <FormattedText text={notes} />
              </div>
            </div>
          )}
        </>
      )}

      {activeTab === "saved" && (
        <div className="saved-notes-view">
          {savedLoading && <div className="notes-loading"><div className="spinner">⏳</div><h3>Loading saved notes...</h3></div>}

          {!savedLoading && savedNotesList.length === 0 && (
            <div className="empty-state">
              <div className="icon">📁</div>
              <h2>No saved notes found</h2>
              <p>Generate new notes and click "Save to DB" to store them here.</p>
            </div>
          )}

          {!savedLoading && savedNotesList.length > 0 && (
            <div className="saved-notes-grid">
              <div className="saved-sidebar-list">
                <h3>Your Notes Library</h3>
                {savedNotesList.map((item) => (
                  <div
                    key={item._id}
                    className={`saved-item-card ${selectedSavedNote?._id === item._id ? "active" : ""}`}
                    onClick={() => setSelectedSavedNote(item)}
                  >
                    <div className="item-title">📝 {item.topic}</div>
                    <div className="item-meta">
                      <span>{new Date(item.date).toLocaleDateString()}</span>
                      <button
                        className="delete-icon-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteSavedNote(item._id);
                        }}
                        title="Delete Note"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="saved-detail-view">
                {selectedSavedNote ? (
                  <div className="notes-result-card">
                    <div className="notes-result-header">
                      <h2>{selectedSavedNote.topic}</h2>
                      <div className="notes-action-buttons">
                        <button className="action-btn copy-btn" onClick={() => handleCopy(selectedSavedNote.content)}>
                          {copied ? "✅ Copied!" : "📋 Copy"}
                        </button>
                        <button
                          className="action-btn download-btn"
                          onClick={() => handleDownloadMarkdown(selectedSavedNote.topic, selectedSavedNote.content)}
                        >
                          ⬇️ Download .md
                        </button>
                      </div>
                    </div>
                    <div className="notes-content paper-style">
                      <FormattedText text={selectedSavedNote.content} />
                    </div>
                  </div>
                ) : (
                  <div className="select-prompt">
                    👈 Select a note from the left sidebar to view contents
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default NotesGenerator;