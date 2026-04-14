import React, { useState, useEffect } from 'react';

export default function ConsoleTerminal({ code, isZenMode }) {
  const [userInput, setUserInput] = useState(""); 
  const [consoleOutput, setConsoleOutput] = useState("Compiler Ready.");
  const [isCompiling, setIsCompiling] = useState(false);
  
  const [terminalHeight, setTerminalHeight] = useState(180);
  const [inputHeight, setInputHeight] = useState(60); 
  const [isResizingTerminal, setIsResizingTerminal] = useState(false);
  const [isResizingInput, setIsResizingInput] = useState(false); 
  const [isTerminalMinimized, setIsTerminalMinimized] = useState(false);

  useEffect(() => {
    if (isZenMode) setIsTerminalMinimized(true);
  }, [isZenMode]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isResizingTerminal && !isZenMode) {
        const newHeight = window.innerHeight - e.clientY - 60;
        if (newHeight > 50 && newHeight < 600) setTerminalHeight(newHeight);
      }
      if (isResizingInput) {
        setInputHeight((prev) => {
          const newHeight = prev + e.movementY;
          return newHeight >= 40 && newHeight <= 300 ? newHeight : prev;
        });
      }
    };
    
    const handleMouseUp = () => { 
      setIsResizingTerminal(false);
      setIsResizingInput(false); 
      document.body.style.cursor = 'default';
    };
    
    if (isResizingTerminal || isResizingInput) { 
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = 'none';
    }
    
    return () => { 
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizingTerminal, isResizingInput, isZenMode]);

  const handleRunCode = async () => {
    if (!code.trim()) return;
    setIsCompiling(true);
    setConsoleOutput("Compiling and running...");
    setIsTerminalMinimized(false);

    try {
      const response = await fetch('http://localhost:5000/api/compiler/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language: 'cpp', code: code, input: userInput }),
      });

      const data = await response.json();

      if (data.type === 'compile_error') setConsoleOutput(`COMPILATION ERROR:\n${data.output}`);
      else if (data.type === 'run_error') setConsoleOutput(`RUNTIME ERROR:\n${data.output}`);
      else if (data.type === 'success') setConsoleOutput(data.output === "" ? "[Program finished with empty output]" : data.output);
      else setConsoleOutput(`SYSTEM ERROR: ${data.message || 'Unknown state'}`);
      
    } catch (error) {
      setConsoleOutput('System Error: Failed to connect to the WHITE ALBUM backend.');
    } finally {
      setIsCompiling(false);
    }
  };

  return (
    <>
      {!isZenMode && <div className="resizer-horizontal" onMouseDown={() => { setIsResizingTerminal(true); document.body.style.cursor = 'row-resize'; }}></div>}

      <div style={{ height: isTerminalMinimized ? "45px" : (isZenMode ? "250px" : terminalHeight), minHeight: "45px", display: "flex", flexDirection: "column", transition: "height 0.2s ease", ...(isZenMode ? { position: "absolute", bottom: "20px", left: "20px", width: "calc(100% - 40px)", zIndex: 100, backgroundColor: "var(--bg-color)", borderRadius: "8px", border: "1px solid var(--glass-border)", boxShadow: "0 20px 40px rgba(0,0,0,0.5)", padding: "10px" } : {}) }}>
        
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "5px" }}>
          <span style={{ fontSize: "0.75rem", color: "var(--text-main)", fontWeight: "bold", letterSpacing: "1px", display: "flex", alignItems: "center", gap: "15px" }}>
            TERMINAL
            <div style={{ display: "flex", gap: "5px" }}>
                <button 
                  onClick={() => setIsTerminalMinimized(!isTerminalMinimized)} 
                  style={{ background: "var(--glass-border)", border: "1px solid var(--accent)", color: "var(--accent)", cursor: "pointer", fontSize: "0.7rem", fontWeight: "bold", padding: "4px 8px", borderRadius: "4px" }}
                >
                  {isTerminalMinimized ? "▲ EXPAND" : "▼ MINIMIZE"}
                </button>
                
                {!isTerminalMinimized && (
                  <button 
                    onClick={() => setConsoleOutput("Compiler Ready.")} 
                    title="Clear Terminal Output"
                    style={{ background: "transparent", border: "1px solid var(--glass-border)", color: "var(--text-muted)", cursor: "pointer", fontSize: "0.7rem", fontWeight: "bold", padding: "4px 8px", borderRadius: "4px", transition: "color 0.2s, border-color 0.2s" }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = "#fc8181"; e.currentTarget.style.borderColor = "#fc8181"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-muted)"; e.currentTarget.style.borderColor = "var(--glass-border)"; }}
                  >
                    🗑️ CLEAR
                  </button>
                )}
            </div>
          </span>
          <button className="logic-btn" onClick={handleRunCode} disabled={isCompiling} style={{ padding: "4px 12px", fontSize: "0.8rem", width: "auto" }}>{isCompiling ? "..." : "▶ RUN CODE"}</button>
        </div>
        
        {!isTerminalMinimized && (
          <div className="terminal-window" style={{ flex: 1, margin: 0, borderRadius: "4px", display: "flex", flexDirection: "column", overflow: "hidden" }}>
            
            <textarea
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Enter inputs here (e.g., 3 10 20 30)"
              style={{
                width: "100%",
                height: `${inputHeight}px`,
                minHeight: "40px",
                background: "rgba(255,255,255,0.05)",
                border: "none",
                color: "#fff",
                padding: "8px 10px",
                fontFamily: "'Courier New', monospace",
                fontSize: "0.8rem",
                resize: "none", 
                outline: "none"
              }}
            />

            <div 
              onMouseDown={() => { setIsResizingInput(true); document.body.style.cursor = 'row-resize'; }}
              style={{ height: "4px", background: "var(--glass-border)", cursor: "row-resize", transition: "background 0.2s" }}
              onMouseEnter={(e) => e.target.style.background = "var(--accent)"}
              onMouseLeave={(e) => e.target.style.background = "var(--glass-border)"}
            />

            <div style={{ flex: 1, overflowY: "auto", padding: "10px" }}>
              <pre style={{ margin: 0, whiteSpace: "pre-wrap", fontFamily: "'Courier New', monospace" }}>{consoleOutput}</pre>
            </div>
          </div>
        )}
      </div>
    </>
  );
}