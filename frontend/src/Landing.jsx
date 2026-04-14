import { useNavigate } from 'react-router-dom'
import './Landing.css'

function Landing() {
    const nav = useNavigate()

    const goToLogin = () => {
        nav('/login')
    }

    return (
        <div className="landing-wrapper">
            <div className="bg-grid"></div>

            <nav className="landing-nav">
                <h2 className="landing-logo">WHITE ALBUM</h2>
                <button className="logic-btn" onClick={goToLogin}>LOGIN / SIGNUP</button>
            </nav>

            <main className="hero-section">
                <div className="hero-text">
                    <div className="system-status">
                        <span className="status-dot"></span>
                        <span className="status-text">WHITE ALBUM ENGINE ONLINE</span>
                    </div>

                    <h1 className="hero-title">
                        Master Logic.<br />
                        <span className="accent-text">At Your Own<br />Pace.</span>
                    </h1>
                    <p className="hero-sub">
                        An adaptive AI mentor that molds to your brain. Stop struggling with static courses and start learning dynamically through code, visuals, and theory.
                    </p>
                    <button className="logic-btn hero-btn" onClick={goToLogin}>ENTER THE SYSTEM</button>
                </div>

                <div className="hero-visual">
                    <div className="ambient-glow"></div>

                    <div className="floating-terminal">
                        <div className="terminal-header">
                            <span className="dot red"></span>
                            <span className="dot yellow"></span>
                            <span className="dot green"></span>
                            <span className="terminal-title">memory_leak.cpp</span>
                        </div>
                        <div className="terminal-body">
                            <pre className="code-block">
                                <code>
                                    <span className="line-num">1</span> <span className="keyword">int*</span> arr = <span className="keyword">new int</span>[10];<br />
                                    <span className="line-num">2</span> <span className="keyword">for</span>(<span className="keyword">int</span> i = <span className="number">0</span>; i &lt; <span className="number">10</span>; ++i) &#123;<br />
                                    <span className="line-num">3</span>     arr[i] = i * i;<span className="comment"> // Populate data</span><br />
                                    <span className="line-num">4</span> &#125;<br />
                                    <span className="line-num">5</span> <span className="comment">// Missing deallocation here!</span><br />
                                    <span className="line-num">6</span> <span className="keyword">return</span> 0;<span className="blinking-cursor">█</span>
                                </code>
                            </pre>
                            <div className="ai-correction">
                                <span className="ai-badge">AI MENTOR</span>
                                <p><strong>Memory Leak Detected:</strong> Allocated \`arr\` never freed. Add \`delete[] arr;\` before exit.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}

export default Landing