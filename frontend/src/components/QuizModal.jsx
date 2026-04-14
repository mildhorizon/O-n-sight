import React from 'react';

export default function QuizModal({
  isOpen,
  onClose,
  isGenerating,
  quizData,
  quizAnswers,
  setQuizAnswers,
  quizScore,
  onSubmitQuiz,
  activeSubtopic
}) {
  if (!isOpen) return null;

  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0, 0, 0, 0.8)", zIndex: 9999, display: "flex", justifyContent: "center", alignItems: "center", backdropFilter: "blur(10px)" }}>
      <div className="focus-layout" style={{ width: "600px", maxHeight: "85vh", padding: "30px", display: "flex", flexDirection: "column", border: "1px solid var(--glass-border)", background: "var(--glass-bg)", boxShadow: "0 20px 50px rgba(0,0,0,0.3)", borderRadius: "12px" }}>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--glass-border)", paddingBottom: "15px", marginBottom: "20px" }}>
          <h2 style={{ color: "var(--accent)", margin: 0, fontFamily: "var(--font-heading)" }}>AI KNOWLEDGE CHECK</h2>
          <button className="logic-btn" onClick={onClose} style={{ padding: "4px 12px" }}>CLOSE</button>
        </div>

        {isGenerating ? (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "var(--accent)", gap: "15px", minHeight: "200px" }}>
            <span style={{ fontSize: "1.5rem", animation: "blink 1s step-end infinite" }}>█</span>
            <span>Espada is compiling questions on {activeSubtopic}...</span>
          </div>
        ) : quizData ? (
          <div style={{ flex: 1, overflowY: "auto", paddingRight: "10px" }}>

            {quizData.map((q, idx) => (
              <div key={idx} style={{ marginBottom: "20px", background: "#ffffff", padding: "15px", borderRadius: "8px", border: "1px solid var(--glass-border)", boxShadow: "0 4px 10px rgba(0,0,0,0.05)" }}>                  <p style={{ color: "var(--text-main)", marginBottom: "15px", fontWeight: "bold" }}>{idx + 1}. {q.question}</p>
                {q.options.map((opt, optIdx) => (
                  <label key={optIdx} style={{ display: "flex", alignItems: "center", color: "var(--text-muted)", marginBottom: "8px", cursor: "pointer", padding: "8px", borderRadius: "4px", background: quizAnswers[idx] === optIdx ? "rgba(246, 173, 85, 0.1)" : "transparent", border: `1px solid ${quizAnswers[idx] === optIdx ? "var(--accent)" : "transparent"}`, transition: "all 0.2s" }}>
                    <input
                      type="radio"
                      name={`ai-quiz-${idx}`}
                      value={optIdx}
                      checked={quizAnswers[idx] === optIdx}
                      onChange={() => setQuizAnswers(prev => ({ ...prev, [idx]: optIdx }))}
                      style={{ marginRight: "12px", accentColor: "var(--accent)" }}
                    />
                    <span style={{ fontSize: "0.95rem" }}>{opt}</span>
                  </label>
                ))}
              </div>
            ))}

            {quizScore === null ? (
              <button
                className="logic-btn"
                onClick={onSubmitQuiz}
                disabled={Object.keys(quizAnswers).length < quizData.length}
                style={{ width: "100%", padding: "12px", marginTop: "10px", opacity: Object.keys(quizAnswers).length < quizData.length ? 0.5 : 1 }}
              >
                SUBMIT FOR GRADING
              </button>
            ) : (
              <div style={{ textAlign: "center", padding: "20px", background: quizScore === 5 ? "rgba(34, 197, 94, 0.1)" : "rgba(246, 173, 85, 0.1)", border: `1px solid ${quizScore === 5 ? "#22c55e" : "var(--accent)"}`, borderRadius: "8px", marginTop: "10px" }}>
                <h3 style={{ color: quizScore === 5 ? "#22c55e" : "var(--accent)", margin: "0 0 10px 0" }}>SCORE: {quizScore} / 5</h3>
                <p style={{ color: "var(--text-main)", margin: 0 }}>
                  {quizScore === 5 ? "Perfect! You've mastered this subtopic." : "Review the material and try again to hit 100%."}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div style={{ color: "var(--text-muted)", textAlign: "center", padding: "40px 0" }}>Failed to generate quiz. Check engine connection.</div>
        )}
      </div>
    </div>
  );
}