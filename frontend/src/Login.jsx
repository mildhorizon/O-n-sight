import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Login.css'

function Login() {
  const [isSignup, setIsSignup] = useState(false)
  const [name, setName] = useState('')
  const [studentId, setStudentId] = useState('')
  const [password, setPassword] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  
  const navigate = useNavigate() 

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!studentId || !password || (isSignup && !name)) {
      setErrorMsg("Please fill all required fields.");
      return; 
    }

    try {
      if (isSignup) {
        const response = await fetch('http://localhost:5000/api/users/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, enrollmentNo: studentId }),
        });
        const data = await response.json();

        if (response.ok) {
          localStorage.setItem('WHITE ALBUM_user_id', studentId);
          navigate('/dashboard', { replace: true });
        } else {
          setErrorMsg(data.message || "Signup failed. ID may already exist.");
        }
      } else {
        const response = await fetch(`http://localhost:5000/api/users/${studentId}`);
        if (response.ok) {
          localStorage.setItem('WHITE ALBUM_user_id', studentId);
          navigate('/dashboard', { replace: true });
        } else {
          setErrorMsg("User not found. Please sign up first.");
        }
      }
    } catch (error) {
      setErrorMsg("System Error: Failed to connect to WHITE ALBUM Engine.");
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-glass">
        {/* Vintage JoJo quote - Narancia's Aerosmith */}
        <div className="jojo-quote">
          <p>"Volare via"</p>
          <div className="quote-author">— Aerosmith, Narancia Ghirga</div>
        </div>

        <h2 style={{ color: "var(--text-main)", letterSpacing: "2px", fontFamily: "var(--font-heading)" }}>
          {isSignup ? "SYSTEM ENROLLMENT" : "SYSTEM ACCESS"}
        </h2>
        
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px", marginTop: "20px" }}>
          {isSignup && (
            <input 
              type="text" 
              placeholder="Full Name" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="login-input"
            />
          )}
          <input 
            type="text" 
            placeholder="ID (e.g. S24CSEU1519)" 
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            className="login-input"
          />
          <input 
            type="password" 
            placeholder="Password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="login-input"
          />
          
          {errorMsg && <div style={{ color: "#ef4444", fontSize: "0.85rem", marginTop: "-5px", fontWeight: "bold" }}>{errorMsg}</div>}

          <button type="submit" className="logic-btn" style={{ marginTop: "10px" }}>
            {isSignup ? "INITIALIZE PROFILE" : "AUTHENTICATE"}
          </button>
        </form>

        <p style={{ marginTop: "20px", fontSize: "0.85rem", color: "var(--text-muted)" }}>
          {isSignup ? "Already have an access code?" : "No access code?"} 
          <span 
            onClick={() => { setIsSignup(!isSignup); setErrorMsg(''); }} 
            style={{ color: "var(--accent)", cursor: "pointer", marginLeft: "5px", fontWeight: "bold" }}
          >
            {isSignup ? "Log In" : "Sign Up"}
          </span>
        </p>
      </div>
    </div>
  )
}

export default Login