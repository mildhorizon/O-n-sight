import React, { useState } from 'react';

export default function OptimizerPanel({ 
  code, 
  width, 
  isZenMode, 
  onShowDiff 
}) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [complexity, setComplexity] = useState({ time: "?", space: "?" });
  const [optimizedCode, setOptimizedCode] = useState("// AI Optimized code will appear here...");

  const handleAnalyzeCode = async () => {
    setIsAnalyzing(true);
    
    try {
      const response = await fetch('http://localhost:5000/api/compiler/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language: 'cpp', code: code }),
      });

      if (!response.ok) throw new Error("Backend connection failed");

      const data = await response.json();

      setComplexity({ time: data.time, space: data.space });
      setOptimizedCode(data.optimizedCode);

    } catch (error) {
      console.error("Analysis failed:", error);
      setComplexity({ time: "ERR", space: "ERR" });
      setOptimizedCode("// Failed to reach the WHITE ALBUM AI Backend. Check your server.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="memory-panel" style={{ 
        width: width, 
        padding: "15px", 
        borderRadius: isZenMode ? "0" : "8px", 
        border: isZenMode ? "none" : "1px solid var(--glass-border)", 
        borderLeft: "none", 
        display: "flex", 
        flexDirection: "column" 
    }}>
      <h4 style={{ color: "var(--accent)", margin: "0 0 15px 0", borderBottom: "1px solid #333", paddingBottom: "10px", letterSpacing: "1px" }}>
        Code Analyzer
      </h4>
      
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "20px" }}>
        
        <div style={{ display: "flex", gap: "10px" }}>
          <div style={{ flex: 1, background: "rgba(255,255,255,0.05)", padding: "10px", borderRadius: "6px", border: "1px solid #333", textAlign: "center" }}>
            <div style={{ fontSize: "0.65rem", color: "#888", marginBottom: "5px" }}>TIME</div>
            <div style={{ color: "#4ade80", fontWeight: "bold", fontSize: "1.2rem", fontFamily: "monospace" }}>{complexity.time}</div>
          </div>
          <div style={{ flex: 1, background: "rgba(255,255,255,0.05)", padding: "10px", borderRadius: "6px", border: "1px solid #333", textAlign: "center" }}>
            <div style={{ fontSize: "0.65rem", color: "#888", marginBottom: "5px" }}>SPACE</div>
            <div style={{ color: "#f6ad55", fontWeight: "bold", fontSize: "1.2rem", fontFamily: "monospace" }}>{complexity.space}</div>
          </div>
        </div>

        <button 
          onClick={handleAnalyzeCode} 
          disabled={isAnalyzing}
          style={{ width: "100%", padding: "10px", background: "var(--glass-border)", color: "#fff", border: "1px solid var(--accent)", borderRadius: "4px", cursor: "pointer", fontSize: "0.8rem", fontWeight: "bold" }}
        >
          {isAnalyzing ? "ANALYZING..." : "CALCULATE COMPLEXITY"}
        </button>

        <div style={{ borderTop: "1px solid #333", margin: "10px 0" }}></div>

        <div>
          <h5 style={{ color: "#aaa", margin: "0 0 10px 0", fontSize: "0.75rem" }}>Code Optimizer</h5>
          <p style={{ fontSize: "0.75rem", color: "#666", marginBottom: "15px", lineHeight: "1.4" }}>Check if there is a more efficient approach to this problem.</p>
          
          <button 
            onClick={() => onShowDiff(optimizedCode)}
            disabled={complexity.time === "?"}
            style={{ 
                width: "100%", 
                padding: "10px", 
                background: complexity.time === "?" ? "#222" : "var(--accent)", 
                color: complexity.time === "?" ? "#555" : "var(--bg-color)", 
                border: "none", 
                borderRadius: "4px", 
                cursor: complexity.time === "?" ? "not-allowed" : "pointer", 
                fontSize: "0.8rem", 
                fontWeight: "bold", 
                opacity: complexity.time === "?" ? 0.5 : 1 
            }}
          >
            COMPARE OPTIMIZED CODE
          </button>
        </div>

      </div>
    </div>
  );
}