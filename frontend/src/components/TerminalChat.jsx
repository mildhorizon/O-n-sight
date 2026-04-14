import { useState, useEffect, useRef, useMemo } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm';
import CodeBlock from './CodeBlock';
import html2pdf from 'html2pdf.js';
import { marked } from 'marked';


export default function TerminalChat({ currentSpace, chatWidth, isZenMode, isZenChatOpen, onUpdateSpace, onOpenMindMap, onGenerateQuiz, chatScrollTrigger, topicData, whiteboardMode }) {
  const [currentQuery, setCurrentQuery] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [isRenaming, setIsRenaming] = useState(false)
  const [renameVal, setRenameVal] = useState("")
  const [isExporting, setIsExporting] = useState(false);
  const [showExportOptions, setShowExportOptions] = useState(false)

  const messageRefs = useRef([]);
  const activeMessages = currentSpace.threads.find(t => t.id === currentSpace.activeThreadId)?.messages || []

  const renderedMessages = useMemo(() => {
    return activeMessages.map((msg, index) => {
      let displayText = msg.text.replace(/```mermaid[\s\S]*?```|<mermaid>[\s\S]*?<\/mermaid>/gi, '');
      displayText = displayText.replace(/(?:#+\s*)?(?:\*\*?)?(?:Explanation\s+)?Flowchart:?(?:\*\*?)?\s*$/gi, '').trim();

      return (
        <div
          key={index}
          ref={(el) => (messageRefs.current[index] = el)}
          className={`message ${msg.role === 'ai' ? 'ai-message' : 'user-message'}`}
          style={{ color: "var(--text-main)", display: "flex", flexDirection: "column", gap: "10px" }}
        >
          {msg.role === 'user' ? (
            <div style={{ whiteSpace: "pre-wrap" }}>{displayText}</div>
          ) : (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({ node, className, children, ...props }) {
                  const isBlock = className || String(children).includes('\n');
                  const language = className ? className.replace('language-', '') : 'cpp';

                  return isBlock ? (
                    <CodeBlock language={language}>{children}</CodeBlock>
                  ) : (
                    <code {...props} style={{ background: "rgba(0,0,0,0.05)", padding: "2px 6px", borderRadius: "4px", fontFamily: "monospace", color: "#e53e3e", fontWeight: "bold" }}>
                      {children}
                    </code>
                  )
                },
                ol: ({ node, ...props }) => <ol style={{ paddingLeft: "1.5rem", margin: "10px 0" }} {...props} />,
                ul: ({ node, ...props }) => <ul style={{ paddingLeft: "1.5rem", margin: "10px 0" }} {...props} />,
                li: ({ node, ...props }) => <li style={{ marginBottom: "6px", lineHeight: "1.5" }} {...props} />,
                table: ({ node, ...props }) => <table style={{ width: '100%', borderCollapse: 'collapse', margin: '15px 0', fontSize: '0.9rem' }} {...props} />,
                th: ({ node, ...props }) => <th style={{ border: '1px solid rgba(0,0,0,0.2)', padding: '10px', backgroundColor: 'rgba(0,0,0,0.05)', textAlign: 'left' }} {...props} />,
                td: ({ node, ...props }) => <td style={{ border: '1px solid rgba(0,0,0,0.1)', padding: '10px' }} {...props} />
              }}
            >
              {displayText}
            </ReactMarkdown>
          )}
        </div>
      );
    });
  }, [activeMessages]);

  const handleExport = async (format, length) => {
    setShowExportOptions(false);
    setIsExporting(true);

    try {
      let content = "";

      if (length === 'summary') {
        const chatContext = activeMessages.map(m => `${m.role.toUpperCase()}: ${m.text}`).join('\n');
        
        const prompt = `[SYSTEM COMMAND: Generate a concise, high-level summary of this learning session. Focus ONLY on the most critical takeaways and core code concepts. Keep it brief.
        IMPORTANT: Output ONLY raw Markdown (.md). Do not include introductory conversational text.]
        
        CURRENT CODE: ${currentSpace.code || "None"}
        CHAT HISTORY: ${chatContext || "None"}`;

        const response = await fetch('http://localhost:5000/api/compiler/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            topic: `Session Export (summary)`,
            history: [{ role: 'user', text: prompt }]
          })
        });

        const data = await response.json();
        content = data.reply;

        if (content.startsWith("```markdown")) content = content.replace(/```markdown/g, "").replace(/```/g, "").trim();
        else if (content.startsWith("```")) content = content.replace(/```/g, "").trim();
      } 
      else {
        content = `# WHITE ALBUM Protocol // Full Transcript\n\n`;
        
        if (currentSpace.code) {
          content += `### Workspace Code\n\`\`\`cpp\n${currentSpace.code}\n\`\`\`\n\n`;
        }
        
        content += `### Session Log\n\n`;
        activeMessages.forEach(msg => {
          const roleName = msg.role === 'ai' ? 'ESPADA' : 'PRIYANSHU';
          content += `**${roleName}**:\n${msg.text}\n\n---\n\n`;
        });
      }

      if (format === 'md') {
        const blob = new Blob([content], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `WHITE ALBUM_${length.toUpperCase()}_Export.md`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

      } else if (format === 'pdf') {
        const parsedHTML = marked.parse(content);

        const wrappedHTML = `
          <style>
            .pdf-export h2 { color: #dd6b20; font-size: 24px; margin-top: 35px; border-bottom: 2px solid #edf2f7; padding-bottom: 8px; font-family: sans-serif; }
            .pdf-export h3 { color: #4a5568; font-size: 18px; margin-top: 25px; font-family: sans-serif; }
            .pdf-export p { margin-bottom: 16px; font-size: 15px; line-height: 1.7; font-family: sans-serif; }
            .pdf-export ul { margin-bottom: 20px; padding-left: 25px; font-family: sans-serif; }
            .pdf-export li { margin-bottom: 10px; font-size: 15px; line-height: 1.7; font-family: sans-serif; }
            .pdf-export pre { background-color: #1a202c; color: #f7fafc; padding: 20px; border-radius: 8px; font-size: 14px; white-space: pre-wrap; margin: 25px 0; font-family: monospace; }
            .pdf-export code { font-family: monospace; color: #e53e3e; background: #edf2f7; padding: 2px 6px; border-radius: 4px;}
            .pdf-export pre code { color: inherit; background: transparent; padding: 0; }
            .pdf-export hr { border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0; }
          </style>
          
          <div class="pdf-export" style="padding: 40px; background: #ffffff; width: 800px; color: #2d3748;">
            ${parsedHTML}
          </div>
        `;

        const opt = {
          margin:       0.5,
          filename:     `WHITE ALBUM_${length.toUpperCase()}_Export.pdf`,
          image:        { type: 'jpeg', quality: 1 },
          html2canvas:  { scale: 2, useCORS: true, backgroundColor: '#ffffff' },
          jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
        };

        await html2pdf().set(opt).from(wrappedHTML).save();
      }

    } catch (error) {
      console.error(`Failed to export ${format}:`, error);
      alert("System Error: Failed to generate export.");
    } finally {
      setIsExporting(false);
    }
  };

  useEffect(() => {
    if (chatScrollTrigger) {
      let userMsgCount = -1;
      let absoluteIndex = -1;
      for (let i = 0; i < activeMessages.length; i++) {
        if (activeMessages[i].role === 'user') {
          userMsgCount++;
          if (userMsgCount === chatScrollTrigger.index) {
            absoluteIndex = i;
            break;
          }
        }
      }

      if (absoluteIndex !== -1 && messageRefs.current[absoluteIndex]) {
        const el = messageRefs.current[absoluteIndex];
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });

        el.style.transition = 'background-color 0.4s ease';
        el.style.backgroundColor = 'rgba(181, 83, 92, 0.25)';
        el.style.borderRadius = '8px';

        setTimeout(() => {
          el.style.backgroundColor = 'transparent';
          setTimeout(() => {
            el.style.transition = '';
            el.style.backgroundColor = '';
            el.style.borderRadius = '';
          }, 400);
        }, 1200);
      }
    }
  }, [chatScrollTrigger, activeMessages]);

  const handleSwitchThread = (threadId) => {
    onUpdateSpace({ ...currentSpace, activeThreadId: threadId })
  }

  const handleNewThread = () => {
    const maxId = currentSpace.threads.length > 0
      ? Math.max(...currentSpace.threads.map(t => t.id))
      : 0;

    const newId = maxId + 1;
    const newTitle = `Thread ${newId}`;

    onUpdateSpace({
      ...currentSpace,
      threads: [...currentSpace.threads, { id: newId, title: newTitle, messages: [{ role: 'ai', text: '[NEW THREAD] Ready.' }] }],
      activeThreadId: newId
    });
  }

  const handleRenameThread = () => {
    const currentThread = currentSpace.threads.find(t => t.id === currentSpace.activeThreadId)
    setRenameVal(currentThread.title)
    setIsRenaming(true)
  }

  const saveThreadName = () => {
    if (renameVal.trim() !== "") {
      onUpdateSpace({
        ...currentSpace,
        threads: currentSpace.threads.map(t =>
          t.id === currentSpace.activeThreadId ? { ...t, title: renameVal } : t
        )
      })
    }
    setIsRenaming(false)
  }

  const handleDeleteThread = () => {
    if (currentSpace.threads.length <= 1) return

    const updatedThreads = currentSpace.threads.filter(t => t.id !== currentSpace.activeThreadId)
    onUpdateSpace({
      ...currentSpace,
      threads: updatedThreads,
      activeThreadId: updatedThreads[0].id
    })
  }

  const handleSend = async () => {
    if (currentQuery.trim() === "") return;

    const userMsg = { role: 'user', text: currentQuery };
    let updatedThreads = currentSpace.threads.map(t =>
      t.id === currentSpace.activeThreadId ? { ...t, messages: [...t.messages, userMsg] } : t
    );

    onUpdateSpace({ ...currentSpace, threads: updatedThreads });

    const threadHistory = updatedThreads.find(t => t.id === currentSpace.activeThreadId).messages;

    setCurrentQuery("");
    setIsTyping(true);

    try {
      const response = await fetch('http://localhost:5000/api/compiler/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: currentSpace.activeSubtopic,
          history: threadHistory
        })
      });

      const data = await response.json();

      const aiMsg = { role: 'ai', text: data.reply || "Error: No reply received." };
      updatedThreads = updatedThreads.map(t =>
        t.id === currentSpace.activeThreadId ? { ...t, messages: [...t.messages, aiMsg] } : t
      );

      onUpdateSpace({ ...currentSpace, threads: updatedThreads });

    } catch (error) {
      console.error("Chat connection failed:", error);
      const errorMsg = { role: 'ai', text: "System Error: Failed to connect to WHITE ALBUM Engine." };
      updatedThreads = updatedThreads.map(t =>
        t.id === currentSpace.activeThreadId ? { ...t, messages: [...t.messages, errorMsg] } : t
      );
      onUpdateSpace({ ...currentSpace, threads: updatedThreads });
    } finally {
      setIsTyping(false);
    }
  }

  if (isZenMode && !isZenChatOpen) return null

  return (
    <div
      className={!isZenMode ? "chat-zone" : ""}
      style={{
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        ...(isZenMode ? {
          position: "absolute",
          top: whiteboardMode === 'flowchart' ? "130px" : "80px",
          right: "20px",
          bottom: "20px",
          zIndex: 105,
          width: "480px",
          borderRadius: "8px",
          backgroundColor: "var(--bg-color)",
          border: "1px solid var(--glass-border)",
          boxShadow: "-10px 10px 30px rgba(0,0,0,0.8)"
        } : {
          width: chatWidth,
          minWidth: "250px"
        })
      }}
    >
      <div className="chat-header" style={{ backgroundColor: "var(--bg-color)", borderTopLeftRadius: "8px", borderTopRightRadius: "8px", padding: "15px", borderBottom: "1px solid var(--glass-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "5px", flex: 1 }}>
          {isRenaming ? (
            <>
              <input type="text" value={renameVal} onChange={(e) => setRenameVal(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && saveThreadName()} onBlur={() => setTimeout(saveThreadName, 150)} autoFocus style={{ backgroundColor: "var(--bg-color)", color: "var(--text-main)", border: "1px solid var(--accent)", padding: "4px 8px", borderRadius: "4px", outline: "none", fontSize: "0.8rem", flex: 1, maxWidth: "150px" }} />
              <button onClick={saveThreadName} style={{ background: "none", border: "none", cursor: "pointer", color: "#68d391", padding: "0 5px" }} title="Save">✔</button>
            </>
          ) : (
            <>
              <select value={currentSpace.activeThreadId} onChange={(e) => handleSwitchThread(Number(e.target.value))} style={{ backgroundColor: "var(--bg-color)", color: "var(--text-main)", border: "1px solid var(--glass-border)", padding: "4px", borderRadius: "4px", outline: "none", fontSize: "0.8rem", maxWidth: "150px" }}>
                {currentSpace.threads.map(t => <option key={t.id} value={t.id} style={{ backgroundColor: "var(--bg-color)" }}>{t.title}</option>)}
              </select>
              <button onClick={handleRenameThread} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: "0 5px" }} title="Rename Thread">✎</button>
              <button onClick={handleDeleteThread} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--accent)", padding: "0 5px", fontSize: "1rem" }} title="Delete Thread">🗑</button>
            </>
          )}
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <button
            className="logic-btn"
            onClick={onGenerateQuiz}
            style={{ padding: "6px 12px", fontSize: "0.75rem", width: "auto", borderColor: "var(--accent)", color: "var(--accent)", background: "transparent", transition: "all 0.2s ease" }}
            onMouseOver={(e) => { e.currentTarget.style.background = 'var(--accent)'; e.currentTarget.style.color = 'var(--bg-color)'; }}
            onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--accent)'; }}
            title="Generate a quiz based on the current reading"
          >
            QUIZ
          </button>


          {isExporting ? (
            <button className="logic-btn" disabled style={{ fontSize: "0.8rem", padding: "6px 12px", opacity: 0.5 }}>
              GENERATING...
            </button>
          ) : showExportOptions ? (
            <div style={{ display: "flex", gap: "5px", alignItems: "center", background: "rgba(0,0,0,0.05)", padding: "2px", borderRadius: "6px", border: "1px solid var(--glass-border)" }}>
              <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginLeft: "8px", fontWeight: "bold" }}>MD:</span>
              <button onClick={() => handleExport('md', 'summary')} className="logic-btn" style={{ fontSize: "0.7rem", padding: "4px 8px", minWidth: "auto", borderColor: "var(--glass-border)" }} title="Brief Summary">Sum</button>
              <button onClick={() => handleExport('md', 'full')} className="logic-btn" style={{ fontSize: "0.7rem", padding: "4px 8px", minWidth: "auto", borderColor: "var(--glass-border)" }} title="Full Detail">Full</button>
              
              <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginLeft: "8px", fontWeight: "bold" }}>PDF:</span>
              <button onClick={() => handleExport('pdf', 'summary')} className="logic-btn" style={{ fontSize: "0.7rem", padding: "4px 8px", minWidth: "auto", borderColor: "var(--glass-border)" }} title="Brief Summary">Sum</button>
              <button onClick={() => handleExport('pdf', 'full')} className="logic-btn" style={{ fontSize: "0.7rem", padding: "4px 8px", minWidth: "auto", borderColor: "var(--glass-border)" }} title="Full Detail">Full</button>

              <button onClick={() => setShowExportOptions(false)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: "0 8px", fontSize: "0.8rem" }} title="Cancel">✖</button>
            </div>
          ) : (
            <button
              onClick={() => setShowExportOptions(true)}
              className="logic-btn"
              style={{ fontSize: "0.8rem", padding: "6px 12px" }}
            >
              EXPORT
            </button>
          )}


          <button
            className="logic-btn"
            onClick={onOpenMindMap}
            style={{ padding: "6px 12px", fontSize: "0.75rem", width: "auto", borderColor: "var(--accent)", color: "var(--accent)", background: "transparent", transition: "all 0.2s ease" }}
            onMouseOver={(e) => { e.currentTarget.style.background = 'var(--accent)'; e.currentTarget.style.color = 'var(--bg-color)'; }}
            onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--accent)'; }}
          >
            MIND MAP
          </button>
          <button className="logic-btn" onClick={handleNewThread} style={{ padding: "6px 12px", fontSize: "0.75rem", width: "auto" }}>+ NEW</button>
        </div>
      </div>

      <div className="chat-history" style={{ backgroundColor: "var(--bg-color)", flex: 1, padding: "20px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "15px" }}>
        {renderedMessages}
        {isTyping && <div className="message ai-message" style={{ color: "var(--text-main)", fontStyle: "italic", opacity: 0.7 }}>Thinking...</div>}
      </div>

      <div className="chat-input-area" style={{ backgroundColor: "var(--bg-color)", padding: "15px", borderTop: "1px solid var(--glass-border)", display: "flex", gap: "10px", alignItems: "flex-end", borderBottomLeftRadius: "8px", borderBottomRightRadius: "8px" }}>

        <textarea
          placeholder="Ask AI..."
          value={currentQuery}
          onChange={(e) => setCurrentQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          style={{
            backgroundColor: "var(--bg-color)",
            color: "var(--text-main)",
            flex: 1,
            border: "1px solid var(--glass-border)",
            padding: "12px",
            borderRadius: "4px",
            outline: "none",
            resize: "none",
            minHeight: "44px",
            maxHeight: "150px",
            overflowY: "auto",
            fontFamily: "var(--font-body)",
            fontSize: "0.9rem"
          }}
          rows={1}
          ref={(el) => {
            if (el) {
              el.style.height = 'auto';
              el.style.height = (el.scrollHeight) + 'px';
            }
          }}
        />

        <button className="logic-btn" onClick={handleSend} style={{ width: "auto", height: "44px" }}>SEND</button>
      </div>
    </div>
  )
}