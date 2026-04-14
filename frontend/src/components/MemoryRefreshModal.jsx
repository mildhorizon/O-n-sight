import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function MemoryRefreshModal({ isOpen, onClose, node, onSuccess, onFail }) {
  const navigate = useNavigate();
  const [isGenerating, setIsGenerating] = useState(false);
  const [quizData, setQuizData] = useState(null);
  const [answers, setAnswers] = useState({});
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isPassed, setIsPassed] = useState(false);

  useEffect(() => {
    if (isOpen && node && !quizData && !isGenerating) {
      generateMemoryCheck();
    }
  }, [isOpen, node]);

  const generateMemoryCheck = async () => {
    setIsGenerating(true);
    setHasSubmitted(false);
    setAnswers({});
    
    const curriculumScope = {
      "fundamentals": "Basic Syntax, Variables, Data Types, and Control Flow (if/else, loops). ABSOLUTELY NO pointers, arrays, or classes.",
      "arrays_strings": "1D Arrays, 2D Arrays, and String Manipulation. No pointers.",
      "memory_pointers": "Pointer Basics, Dynamic Allocation, and Smart Pointers.",
      "oop": "Classes, Objects, Inheritance, Polymorphism.",
      "linked_lists": "Singly, Doubly, and Circular Linked Lists.",
      "stacks_queues": "Stacks, Queues, Deques.",
      "trees_heaps": "Binary Trees, BST, Min/Max Heaps.",
      "graphs": "Graph representations, BFS, DFS, Dijkstra."
    };

    const specificScope = curriculumScope[node.id] || "General concepts";

    const prompt = `[SYSTEM COMMAND: Activate <quiz_generator> mode. Generate exactly 2 intermediate-level multiple-choice questions to test memory retention on the C++ module: ${node.title}. 
    
    CRITICAL RESTRICTION: Limit questions STRICTLY to these subtopics: ${specificScope}. Do NOT ask about advanced concepts outside this scope.
    
    Rules:
    1. Return ONLY a valid JSON array. No markdown, no backticks, no explanations.
    2. Format: [{"question": "...", "options": ["...", "...", "...", "..."], "answer": 0}, ...]
    3. "answer" must be the integer index (0-3) of the correct option.]`;

    try {
      const response = await fetch('http://localhost:5000/api/compiler/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: "Memory Refresh", history: [{ role: 'user', text: prompt }] })
      });
      
      const data = await response.json();
      let reply = data.reply.trim();
      
      if (reply.startsWith("```json")) reply = reply.replace(/```json/g, "").replace(/```/g, "").trim();
      else if (reply.startsWith("```")) reply = reply.replace(/```/g, "").trim();

      setQuizData(JSON.parse(reply));
    } catch (error) {
      console.error("Failed to generate memory check:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = () => {
    let score = 0;
    quizData.forEach((q, idx) => {
      if (answers[idx] === q.answer) score++;
    });

    setHasSubmitted(true);
    
    if (score === 2) {
      setIsPassed(true);
      setTimeout(() => onSuccess(node.id), 2000); 
    } else {
      setIsPassed(false);
      setTimeout(() => onFail(node.id), 3000); 
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.85)", zIndex: 1000, display: "flex", justifyContent: "center", alignItems: "center", backdropFilter: "blur(5px)" }}>
      <div style={{ background: "var(--bg-color)", width: "90%", maxWidth: "600px", borderRadius: "12px", border: "1px solid #f6ad55", boxShadow: "0 10px 40px rgba(246, 173, 85, 0.2)", overflow: "hidden", display: "flex", flexDirection: "column", maxHeight: "90vh" }}>
        
        <div style={{ padding: "20px", borderBottom: "1px solid var(--glass-border)", display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(246, 173, 85, 0.1)" }}>
          <div>
            <h3 style={{ margin: 0, color: "#f6ad55", letterSpacing: "1px", display: "flex", alignItems: "center", gap: "10px" }}>
              ⚠️ THE AXIOMS DECAY DETECTED
            </h3>
            <p style={{ margin: "5px 0 0 0", fontSize: "0.8rem", color: "var(--text-muted)" }}>Topic: {node?.title}</p>
          </div>
          {!hasSubmitted && <button onClick={onClose} className="logic-btn" style={{ padding: "4px 10px", width: "auto" }}>ABORT</button>}
        </div>

        <div style={{ padding: "30px", overflowY: "auto", flex: 1 }}>
          {isGenerating ? (
            <div style={{ textAlign: "center", padding: "40px 0", color: "#f6ad55", fontFamily: "monospace" }}>
              <span style={{ fontSize: "2rem", animation: "blink 1s infinite" }}>█</span>
              <p>Extracting memory verification protocols...</p>
            </div>
          ) : !hasSubmitted ? (
            <div>
              <p style={{ color: "var(--text-main)", marginBottom: "25px", lineHeight: "1.6" }}>
                Your mastery of this topic is fading. Answer these two questions correctly to reinforce the pathway. Failure will result in mandatory retraining.
              </p>
              
              {quizData && quizData.map((q, qIdx) => (
                <div key={qIdx} style={{ marginBottom: "25px", background: "#ffffff", padding: "20px", borderRadius: "8px", border: "1px solid var(--glass-border)", boxShadow: "0 4px 10px rgba(0,0,0,0.05)" }}>
                  <p style={{ fontWeight: "bold", marginBottom: "15px", color: "#1a1a1a" }}>{qIdx + 1}. {q.question}</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {q.options.map((opt, oIdx) => (
                      <label key={oIdx} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px", background: "var(--bg-color)", border: `1px solid ${answers[qIdx] === oIdx ? 'var(--accent)' : 'var(--glass-border)'}`, borderRadius: "6px", cursor: "pointer", transition: "all 0.2s" }}>
                        <input type="radio" name={`q${qIdx}`} checked={answers[qIdx] === oIdx} onChange={() => setAnswers({...answers, [qIdx]: oIdx})} style={{ accentColor: "var(--accent)" }} />
                        <span style={{ color: "var(--text-main)", fontSize: "0.9rem" }}>{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}

              <button 
                onClick={handleSubmit} 
                disabled={Object.keys(answers).length < 2}
                className="logic-btn" 
                style={{ width: "100%", padding: "15px", fontSize: "1rem", marginTop: "10px", borderColor: "#f6ad55", color: "#f6ad55", opacity: Object.keys(answers).length < 2 ? 0.5 : 1 }}
              >
                VERIFY MEMORY
              </button>
            </div>
          ) : (
             <div style={{ textAlign: "center", padding: "40px 0" }}>
               {isPassed ? (
                 <>
                   <div style={{ fontSize: "4rem", marginBottom: "10px" }}>🟢</div>
                   <h2 style={{ color: "#4ade80" }}>MEMORY VERIFIED</h2>
                   <p style={{ color: "var(--text-muted)" }}>Pathway reinforced. Returning to Dashboard...</p>
                 </>
               ) : (
                 <>
                   <div style={{ fontSize: "4rem", marginBottom: "10px" }}>🔴</div>
                   <h2 style={{ color: "#ef4444" }}>VERIFICATION FAILED</h2>
                   <p style={{ color: "var(--text-muted)" }}>Pathway critically decayed. Rerouting to training facility...</p>
                 </>
               )}
             </div>
          )}
        </div>
      </div>
    </div>
  );
}