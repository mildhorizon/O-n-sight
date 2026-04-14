import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

mermaid.initialize({
  startOnLoad: false,
  theme: 'base', 
  themeVariables: {
    background: 'transparent',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  themeCSS: `
    /* --- THE MINDMAP STYLES --- */
    .mindmap-node rect, .mindmap-node path, .mindmap-node circle, .mindmap-node polygon { 
      fill: var(--bg-color, #f4f1ea) !important; 
      stroke: var(--accent, #d9777f) !important; 
      stroke-width: 2px !important;
      transition: all 0.2s ease-in-out !important; /* Smooth animation added back */
    }
    
    /* THE HOVER EFFECT: Turns background red, matches the + NEW button */
    .mindmap-node:hover rect, .mindmap-node:hover path, .mindmap-node:hover circle, .mindmap-node:hover polygon {
      fill: var(--accent, #d9777f) !important;
      cursor: pointer !important;
    }
    
    /* Turns text white on hover */
    .mindmap-node:hover foreignObject div, .mindmap-node:hover foreignObject span, .mindmap-node:hover text {
      color: var(--bg-color, #f4f1ea) !important;
      fill: var(--bg-color, #f4f1ea) !important;
    }

    path.edge {
      stroke: var(--accent, #d9777f) !important;
      stroke-width: 3px !important;
    }

    /* --- THE FLOWCHART STYLES --- */
    .node rect, .node circle, .node polygon {
      fill: var(--bg-color, #f4f1ea) !important; 
      stroke: var(--accent, #d9777f) !important; 
      stroke-width: 2px !important;
    }
    .node text {
      fill: var(--text-main, #2d3748) !important;
      font-weight: 600 !important;
    }
    .edgePath .path, .flowchart-link {
      stroke: var(--text-muted, #718096) !important;
      stroke-width: 2px !important;
    }
    .marker {
      fill: var(--text-muted, #718096) !important;
      stroke: var(--text-muted, #718096) !important;
    }

    /* Keeps text un-clickable so the node hover registers properly */
    .mindmap-node foreignObject div, .mindmap-node foreignObject span, .mindmap-node text { 
      color: var(--text-main, #2d3748) !important; 
      fill: var(--text-main, #2d3748) !important; 
      font-weight: 600 !important;
      pointer-events: none !important; 
      transition: all 0.2s ease-in-out !important;
    }
  `,
  securityLevel: 'loose',
});

export default function MermaidViewer({ chartCode, onNodeClick }) {
  const containerRef = useRef(null);
  
  const [zoomPercent, setZoomPercent] = useState(100);
  const isMindMap = chartCode && chartCode.toLowerCase().includes('mindmap');

 useEffect(() => {
    if (chartCode && containerRef.current) {
      const renderChart = async () => {
        try {
          containerRef.current.innerHTML = '';
          const id = `mermaid-map-${Date.now()}`;
          const { svg } = await mermaid.render(id, chartCode);
          containerRef.current.innerHTML = svg;

          const svgEl = containerRef.current.querySelector('svg');
          if (svgEl) {
            svgEl.removeAttribute('width');
            svgEl.removeAttribute('height');
            
            if (isMindMap) {
              svgEl.style.width = '100%';
              svgEl.style.height = '100%';
              svgEl.style.maxWidth = '600px';
            } else {
              svgEl.style.width = '100%';
              svgEl.style.maxWidth = '480px'; 
              svgEl.style.height = 'auto'; 
            }
            
            svgEl.style.display = 'block';
            svgEl.style.margin = '0 auto';
          }
        } catch (error) {
          console.error("Mermaid Error:", error);
          containerRef.current.innerHTML = `
            <div style="color: #e53e3e; padding: 20px; font-family: monospace; text-align: left; background: rgba(0,0,0,0.02); border: 1px solid #e53e3e; border-radius: 8px; width: 100%; max-width: 600px; margin: 0 auto;">
              <b>[RENDER ERROR] Espada generated invalid syntax:</b><br/><br/>
              <pre style="white-space: pre-wrap; font-size: 12px; color: var(--text-main);">${chartCode}</pre>
            </div>`;
        }
      };
      renderChart();
    }
  }, [chartCode]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const handleClick = (e) => {
      const node = e.target.closest('.mindmap-node');
      if (node && onNodeClick) {
        const text = node.textContent || node.innerText;
        if (text) onNodeClick(text.replace(/\s+/g, ' ').trim());
      }
    };
    container.addEventListener('click', handleClick);
    return () => container.removeEventListener('click', handleClick);
  }, [onNodeClick]);

  return (
    <div style={{ 
      position: 'relative', 
      width: '100%', 
      height: '100%', 
      overflow: 'auto', 
      display: 'flex',
      flexDirection: 'column',
      justifyContent: isMindMap ? 'center' : 'flex-start', 
      alignItems: 'center',
      padding: '20px'
    }}>
      
      {!isMindMap && chartCode && !chartCode.includes("Error:") && (
        <div style={{ position: 'absolute', top: '15px', right: '20px', display: 'flex', gap: '8px', zIndex: 50, background: 'var(--bg-color)', padding: '6px', borderRadius: '8px', border: '1px solid var(--glass-border)', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <button onClick={() => setZoomPercent(z => Math.max(20, z - 20))} style={{ cursor: 'pointer', background: 'transparent', border: '1px solid var(--glass-border)', color: 'var(--text-main)', borderRadius: '4px', padding: '4px 10px', fontSize: '1rem' }}>-</button>
          <span style={{ color: 'var(--text-main)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', minWidth: '40px', justifyContent: 'center', fontFamily: 'monospace' }}>{zoomPercent}%</span>
          <button onClick={() => setZoomPercent(z => Math.min(300, z + 20))} style={{ cursor: 'pointer', background: 'transparent', border: '1px solid var(--glass-border)', color: 'var(--text-main)', borderRadius: '4px', padding: '4px 10px', fontSize: '1rem' }}>+</button>
          <button onClick={() => setZoomPercent(100)} style={{ cursor: 'pointer', background: 'var(--accent)', border: 'none', color: 'var(--bg-color)', borderRadius: '4px', padding: '4px 12px', fontSize: '0.75rem', fontWeight: 'bold' }}>FIT</button>
        </div>
      )}

      <div 
        ref={containerRef} 
        style={{ 
          width: '100%', 
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zoom: isMindMap ? 'normal' : `${zoomPercent}%` 
        }} 
      />
    </div>
  );
}