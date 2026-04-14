import React from 'react';
import CodeBlock from './CodeBlock'; 

export default function ReadingMaterial({
    topicData,
    activeSubtopic,
    isZenMode,
    onLoadCode
}) {
    return (
        <div style={{ color: "var(--text-main)", maxWidth: "800px", margin: "0 auto", padding: isZenMode ? "40px" : "0" }}>
            <h1 style={{ color: "var(--accent)", fontSize: "2rem", marginBottom: "20px" }}>
                {topicData ? topicData.topic : activeSubtopic}
            </h1>
            <p style={{ lineHeight: "1.8", fontSize: "1.1rem", marginBottom: "30px", color: "var(--text-muted)" }}>
                {topicData ? topicData.description : "Establishing connection to WHITE ALBUM databanks..."}
            </p>

            {topicData && topicData.sections && topicData.sections.map((section, idx) => (
                <div key={idx} style={{ marginBottom: "40px", background: "rgba(0,0,0,0.02)", padding: "20px", borderRadius: "8px", border: "1px solid var(--glass-border)" }}>
                    <h3 style={{ color: "var(--text-main)", fontSize: "1.3rem", marginBottom: "15px" }}>{section.title}</h3>

                    <p style={{ lineHeight: "1.7", marginBottom: "15px", whiteSpace: "pre-line", fontWeight: "500" }}>{section.definition}</p>

                    {section.detailed_explanation && (
                        <p style={{ lineHeight: "1.7", marginBottom: "20px", whiteSpace: "pre-line", color: "var(--text-muted)" }}>
                            {section.detailed_explanation}
                        </p>
                    )}

                    {section.analogy && (
                        <div style={{ padding: "10px 15px", borderLeft: "3px solid #f6ad55", background: "rgba(246, 173, 85, 0.1)", marginBottom: "20px", fontStyle: "italic" }}>
                            💡 <strong>Mental Model:</strong> {section.analogy}
                        </div>
                    )}

                    {section.code && (
                        <div style={{ marginBottom: "15px" }}>
                            <CodeBlock language="cpp">{section.code}</CodeBlock>
                        </div>
                    )}

                    {section.dry_run && (
                        <div style={{ padding: "15px", background: "#0f172a", color: "#94a3b8", borderRadius: "8px", marginBottom: "15px", fontFamily: "monospace", fontSize: "0.85rem", border: "1px solid var(--glass-border)", whiteSpace: "pre-wrap", lineHeight: "1.6" }}>
                            <strong style={{ color: "#4ade80", fontSize: "0.95rem" }}>▶ DRY RUN / STEP-BY-STEP:</strong><br />
                            {section.dry_run}
                        </div>
                    )}

                    {section.code && (
                        <button
                            className="logic-btn"
                            style={{ fontSize: "0.8rem", padding: "6px 12px", marginTop: "5px" }}
                            onClick={() => onLoadCode(section.code)}
                        >
                            <span style={{ marginRight: "5px" }}>{'</>'}</span> LOAD CODE TO WORKSPACE
                        </button>
                    )}
                </div>
            ))}
        </div>
    );
}