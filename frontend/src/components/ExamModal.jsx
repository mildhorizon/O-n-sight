import React from 'react';
import Editor from '@monaco-editor/react';

export default function ExamModal({
  isOpen,
  onClose,
  topicId,
  examData,
  mcqAnswers,
  setMcqAnswers,
  examCodes,
  setExamCodes,
  chatScrollTrigger,
  setChatScrollTrigger,
  isGrading,
  examResult,
  onSubmitExam,
  onPassQuiz
}) {
  if (!isOpen) return null;

  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0, 0, 0, 0.9)", zIndex: 1000, display: "flex", justifyContent: "center", alignItems: "center", backdropFilter: "blur(50px)" }}>
      
      <div className="focus-layout" style={{ width: "900px", height: "85vh", padding: "40px", display: "flex", flexDirection: "column", border: "1px solid var(--glass-border)", background: "var(--glass-bg)", boxShadow: "0 20px 50px rgba(0,0,0,0.3)" }}>
        
        <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--glass-border)", paddingBottom: "20px", marginBottom: "20px" }}>
          <h2 style={{ color: "var(--accent)", letterSpacing: "2px", margin: 0, fontFamily: "var(--font-heading)" }}>MODULE EXAM: {topicId.toUpperCase()}</h2>
          <button className="logic-btn" onClick={onClose} style={{ padding: "4px 12px" }}>ABORT</button>
        </div>

        {!examData ? (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", fontSize: "1.2rem", fontFamily: "var(--font-heading)" }}>
            Downloading Neural Challenge...
          </div>
        ) : (
          <div style={{ flex: 1, overflowY: "auto", paddingRight: "15px" }}>
            
            <h3 style={{ color: "var(--text-main)", marginBottom: "20px", fontSize: "1.4rem", fontFamily: "var(--font-heading)" }}>PART 1: MCQS</h3>
            {examData.mcqs.map((q, idx) => (
              <div key={idx} style={{ marginBottom: "20px", background: "var(--bg-color)", padding: "20px", borderRadius: "8px", border: "1px solid var(--glass-border)" }}>
                <p style={{ color: "var(--text-main)", marginBottom: "15px", fontWeight: "bold", fontSize: "1.05rem" }}>{idx + 1}. {q.question}</p>
                {q.options.map((opt, optIdx) => (
                  <label key={optIdx} style={{ display: "flex", alignItems: "center", color: "var(--text-muted)", marginBottom: "10px", cursor: "pointer", padding: "8px", borderRadius: "4px", transition: "all 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.background = "var(--glass-border)"} onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                    <input 
                      type="radio" 
                      name={`mcq-${idx}`} 
                      value={optIdx} 
                      checked={mcqAnswers[idx] === optIdx}
                      onChange={() => setMcqAnswers(prev => ({ ...prev, [idx]: optIdx }))}
                      style={{ marginRight: "12px", accentColor: "var(--accent)", transform: "scale(1.2)" }}
                    />
                    <span style={{ fontSize: "0.95rem" }}>{opt}</span>
                  </label>
                ))}
              </div>
            ))}

            <h3 style={{ color: "var(--text-main)", marginTop: "40px", marginBottom: "20px", fontSize: "1.4rem", fontFamily: "var(--font-heading)" }}>PART 2: Code</h3>
            {examData.codingChallenges.map((challenge, idx) => {
              const isZoomed = chatScrollTrigger?.zoomIdx === idx; 
              
              return (
              <div key={idx} style={isZoomed ? {
                  position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, background: "var(--glass-bg)", backdropFilter: "blur(16px)", padding: "40px", display: "flex", flexDirection: "column"
              } : { 
                  background: "var(--bg-color)", padding: "20px", borderRadius: "8px", border: "1px solid var(--glass-border)", marginBottom: "30px" 
              }}>
                
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "15px", gap: "20px" }}>
                  <p style={{ color: "var(--text-main)", lineHeight: "1.6", fontWeight: "500", fontSize: isZoomed ? "1.1rem" : "1rem", margin: 0 }}>{challenge.prompt}</p>
                  <button 
                    className="logic-btn"
                    onClick={() => setChatScrollTrigger(prev => ({ ...prev, zoomIdx: isZoomed ? null : idx }))} 
                    style={{ padding: "4px 12px", flexShrink: 0 }}
                  >
                    {isZoomed ? "⤡ EXIT FULL SCREEN" : "⤢ FULL SCREEN"}
                  </button>
                </div>

                <div style={{ display: "flex", flexDirection: "column", flex: isZoomed ? 1 : "none", borderRadius: "8px", overflow: "hidden", boxShadow: "0 10px 30px rgba(0,0,0,0.15)", border: "1px solid var(--glass-border)" }}>
                  
                  {/* Mac-Style Terminal Header */}
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 15px", background: "#1e1e1e", borderBottom: "1px solid #333", alignItems: "center" }}>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#ff5f56" }} />
                      <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#ffbd2e" }} />
                      <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#27c93f" }} />
                    </div>
                    <span style={{ color: "#94a3b8", fontSize: "0.85rem", fontFamily: "'Courier New', monospace", fontWeight: "bold", letterSpacing: "1px" }}>challenge_0{idx + 1}.cpp</span>
                    <div style={{ width: "60px" }}></div>
                  </div>

                  <div style={{ flex: isZoomed ? 1 : "none", height: isZoomed ? "auto" : "300px", background: "#1e1e1e", paddingTop: "10px" }}>
                    <Editor
                      height="100%"
                      defaultLanguage="cpp"
                      theme="vs-dark"
                      value={examCodes[idx] || ""}
                      onChange={(val) => setExamCodes(prev => ({ ...prev, [idx]: val }))}
                      options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                        fontFamily: "'Courier New', monospace",
                        scrollBeyondLastLine: false,
                        padding: { top: 10, bottom: 10 },
                        roundedSelection: false,
                        formatOnPaste: true,
                      }}
                    />
                  </div>
                </div>
              </div>
            )})}

            <div style={{ marginTop: "40px", display: "flex", flexDirection: "column", alignItems: "center", gap: "20px", paddingBottom: "20px" }}>
              
              {isGrading && <div style={{ color: "#f59e0b", fontWeight: "bold", fontSize: "1.1rem", fontFamily: "var(--font-heading)" }}>...</div>}
              
              {examResult && (
                <div style={{ width: "100%", padding: "20px", borderRadius: "8px", textAlign: "center", background: examResult.passed ? "rgba(34, 197, 94, 0.1)" : "rgba(239, 68, 68, 0.1)", border: `1px solid ${examResult.passed ? "#22c55e" : "#ef4444"}` }}>
                  <h3 style={{ color: examResult.passed ? "#22c55e" : "#ef4444", marginBottom: "10px", fontSize: "1.3rem", fontFamily: "var(--font-heading)" }}>
                    {examResult.passed ? "VERIFICATION PASSED" : "VERIFICATION FAILED"}
                  </h3>
                  <p style={{ color: "var(--text-main)", lineHeight: "1.5" }}>{examResult.feedback}</p>
                </div>
              )}

              {!examResult?.passed ? (
                <button 
                  className="logic-btn" 
                  onClick={onSubmitExam} 
                  disabled={isGrading || Object.keys(mcqAnswers).length < examData.mcqs.length}
                  style={{ width: "250px", padding: "12px", fontWeight: "bold", fontSize: "1rem", opacity: (isGrading || Object.keys(mcqAnswers).length < examData.mcqs.length) ? 0.5 : 1 }}
                >
                  {isGrading ? "EVALUATING..." : "SUBMIT EXAM"}
                </button>
              ) : (
                <button 
                  className="logic-btn" 
                  onClick={onPassQuiz} 
                  style={{ width: "300px", padding: "12px", background: "#22c55e", color: "#ffffff", borderColor: "#16a34a", fontWeight: "bold", fontSize: "1rem" }}
                >
                  NEXT MODULE
                </button>
              )}
            </div>

          </div>
        )}
      </div>
    </div>
  );
}