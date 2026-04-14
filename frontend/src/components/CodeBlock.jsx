import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';

export default function CodeBlock({ language, children }) {
  const [isCopied, setIsCopied] = useState(false);
  const codeString = String(children).replace(/\n$/, '');

  const handleCopy = () => {
    navigator.clipboard.writeText(codeString);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000); 
  };

  return (
    <div style={{ 
      borderRadius: "8px", 
      margin: "15px 0", 
      border: "1px solid var(--glass-border)", 
      overflow: "hidden",
      boxShadow: "0 10px 20px rgba(0,0,0,0.15)"
    }}>
      <div style={{ 
        background: "#e2e8f0", 
        padding: "8px 15px", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "space-between", 
        borderBottom: "1px solid #cbd5e1"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#ff5f56" }}></div>
          <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#ffbd2e" }}></div>
          <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#27c93f" }}></div>
          <span style={{ marginLeft: "10px", color: "#64748b", fontSize: "0.75rem", fontFamily: "monospace", fontWeight: "bold" }}>
            {language}
          </span>
        </div>
        
        <button 
          onClick={handleCopy}
          style={{
            background: isCopied ? "rgba(39, 201, 63, 0.1)" : "transparent",
            border: `1px solid ${isCopied ? "#27c93f" : "#cbd5e1"}`,
            borderRadius: "4px",
            padding: "4px 8px",
            fontSize: "0.7rem",
            color: isCopied ? "#27c93f" : "#64748b",
            cursor: "pointer",
            fontWeight: "bold",
            display: "flex",
            alignItems: "center",
            gap: "4px",
            transition: "all 0.2s"
          }}
        >
          {isCopied ? "✓ COPIED" : "📋 COPY"}
        </button>
      </div>
      
      <SyntaxHighlighter 
        language={language} 
        style={oneLight}
        customStyle={{ margin: 0, padding: "15px", fontSize: "0.85rem", background: "#f8fafc" }}
      >
        {codeString}
      </SyntaxHighlighter>
    </div>
  );
}