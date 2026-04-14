import { useState, useEffect } from 'react'
import Editor, { DiffEditor } from '@monaco-editor/react'
import OptimizerPanel from './OptimizerPanel'
import ConsoleTerminal from './ConsoleTerminal'

function CodeWorkspace({ code, onCodeChange, isZenMode, chatWidth }) {
  const [isAnalyzerOpen, setIsAnalyzerOpen] = useState(false)
  const [isShowingDiff, setIsShowingDiff] = useState(false)
  const [optimizedCode, setOptimizedCode] = useState("// AI Optimized code will appear here...")
  
  const [analyzerWidth, setAnalyzerWidth] = useState(250)
  const [isResizingAnalyzer, setIsResizingAnalyzer] = useState(false)

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isResizingAnalyzer) {
        const rightOffset = isZenMode ? 0 : parseInt(chatWidth, 10) || 0
        const newWidth = window.innerWidth - e.clientX - rightOffset - 40 
        
        if (newWidth > 200 && newWidth < 600) {
            setAnalyzerWidth(newWidth)
        }
      }
    }
    
    const handleMouseUp = () => { 
      setIsResizingAnalyzer(false)
      document.body.style.cursor = 'default'
    }
    
    if (isResizingAnalyzer) { 
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.body.style.userSelect = 'none'
    }
    
    return () => { 
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isResizingAnalyzer, isZenMode, chatWidth])

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0, position: "relative" }}>
      <div style={{ flex: 1, display: "flex", minHeight: 0 }}>
        
        <div style={{ flex: 1, position: "relative", border: isZenMode ? "none" : "1px solid var(--glass-border)", borderRadius: isZenMode ? "0" : "8px", overflow: "hidden" }}>
          
          {isShowingDiff ? (
            <DiffEditor
              height="100%"
              language="cpp"
              theme="vs-dark"
              original={code}
              modified={optimizedCode}
              options={{ 
                renderSideBySide: true, 
                minimap: { enabled: false }, 
                fontSize: 14, 
                fontFamily: "'Courier New', Courier, monospace", 
                padding: { top: 25 } 
              }}
            />
          ) : (
            <Editor
              height="100%"
              defaultLanguage="cpp"
              theme="vs-dark"
              value={code}
              onChange={onCodeChange}
              options={{ minimap: { enabled: false }, fontSize: 16, fontFamily: "'Courier New', Courier, monospace", padding: { top: 25 }, mouseWheelZoom: true }}
            />
          )}

          <div style={{ position: "absolute", bottom: isZenMode ? "80px" : "25px", right: "20px", display: "flex", gap: "10px", zIndex: 100, transition: "bottom 0.2s ease" }}>
            {isShowingDiff && (
               <button 
                 onClick={() => setIsShowingDiff(false)} 
                 style={{ background: "#e53e3e", padding: "6px 12px", borderRadius: "4px", fontSize: "0.75rem", border: "1px solid #fc8181", color: "#fff", cursor: "pointer" }}
               >
                 EXIT DIFF VIEW
               </button>
            )}
            <button 
              onClick={() => setIsAnalyzerOpen(!isAnalyzerOpen)} 
              style={{ background: "#1e1e1e", padding: "6px 12px", borderRadius: "4px", fontSize: "0.75rem", border: "1px solid var(--accent)", color: "var(--accent)", cursor: "pointer" }}
            >
              {isAnalyzerOpen ? "❌ CLOSE OPTIMIZER" : " OPTIMIZER"}
            </button>
          </div>
        </div>

        {isAnalyzerOpen && (
          <>
            <div className="resizer-vertical" onMouseDown={() => { setIsResizingAnalyzer(true); document.body.style.cursor = 'col-resize'; }} style={{ margin: "0 5px" }}></div>
            <OptimizerPanel 
              code={code}
              width={analyzerWidth}
              isZenMode={isZenMode}
              onShowDiff={(optimized) => {
                setOptimizedCode(optimized);
                setIsShowingDiff(true);
                setIsAnalyzerOpen(false);
              }}
            />
          </>
        )}
      </div>

      <ConsoleTerminal code={code} isZenMode={isZenMode} />
      
    </div>
  )
}

export default CodeWorkspace