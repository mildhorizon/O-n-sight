import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

export default function SettingsPage() {
  const navigate = useNavigate()
  const fileInputRef = useRef(null)

  const [activeTab, setActiveTab] = useState('profile')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState({ text: "", type: "" })

  // Profile States
  const [name, setName] = useState("")
  const storedId = localStorage.getItem('WHITE ALBUM_user_id')
  const [enrollmentNo, setEnrollmentNo] = useState("")
  const [pfpImage, setPfpImage] = useState(localStorage.getItem(`WHITE ALBUM_pfp_${storedId}`) || "")

  // Security States
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  useEffect(() => {
    const storedId = localStorage.getItem('WHITE ALBUM_user_id')
    if (!storedId) {
      navigate('/login')
      return
    }

    const fetchUserData = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/users/${storedId}`)
        if (response.ok) {
          const data = await response.json()
          setName(data.name || "")
          setEnrollmentNo(data.enrollmentNo || "")
        }
      } catch (error) {
        console.error("Failed to fetch user data", error)
      }
    }
    fetchUserData()
  }, [navigate])

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type })
    setTimeout(() => setMessage({ text: "", type: "" }), 3000)
  }

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      showMessage("Image too large. Please use a file under 2MB.", "error");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPfpImage(reader.result);
    };
    reader.readAsDataURL(file);
  }

  const handleSaveProfile = async () => {
    setIsLoading(true)
    localStorage.setItem(`WHITE ALBUM_pfp_${storedId}`, pfpImage)

    try {
      const storedId = localStorage.getItem('WHITE ALBUM_user_id')
      await fetch(`http://localhost:5000/api/users/${storedId}/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, pfpUrl: pfpImage })
      })
      showMessage("Profile saved successfully!")
    } catch (error) {
      showMessage("Saved locally. Backend sync failed.", "error")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveSecurity = async () => {
    if (newPassword !== confirmPassword) {
      showMessage("New passwords do not match!", "error")
      return
    }
    setIsLoading(true)

    try {
      const storedId = localStorage.getItem('WHITE ALBUM_user_id')
      const response = await fetch(`http://localhost:5000/api/users/${storedId}/password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword })
      })

      if (response.ok) {
        showMessage("Password updated successfully!")
        setCurrentPassword("")
        setNewPassword("")
        setConfirmPassword("")
      } else {
        showMessage("Access denied: Incorrect current password.", "error")
      }
    } catch (error) {
      showMessage("Failed to connect to the server.", "error")
    } finally {
      setIsLoading(false)
    }
  }

  const handleRaiseTicket = () => {
    window.open("mailto:umaru999chan999@gmail.com?subject=WHITE ALBUM%20Support%20Ticket", "_blank");
  }

  return (
    <div style={{ minHeight: "100vh", width: "100vw", backgroundColor: "var(--bg-color)", color: "var(--text-main)", display: "flex", fontFamily: "var(--font-body)", overflowX: "hidden" }}>

      <div style={{ width: "280px", minHeight: "100vh", backgroundColor: "rgba(0,0,0,0.03)", borderRight: "1px solid var(--glass-border)", display: "flex", flexDirection: "column", padding: "40px 0" }}>

        <div style={{ padding: "0 30px", marginBottom: "40px" }}>
          <h2 style={{ margin: 0, fontSize: "1.3rem", fontWeight: "800", letterSpacing: "1px" }}>WHITE ALBUM</h2>
          <div style={{ fontSize: "0.75rem", color: "var(--accent)", marginTop: "5px", textTransform: "uppercase", letterSpacing: "1px", fontWeight: "bold" }}>Account Settings</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "5px", padding: "0 15px", flex: 1 }}>
          <button onClick={() => setActiveTab('profile')} style={{ background: activeTab === 'profile' ? "var(--glass-border)" : "transparent", color: activeTab === 'profile' ? "var(--accent)" : "var(--text-muted)", padding: "12px 20px", textAlign: "left", borderRadius: "8px", border: "none", cursor: "pointer", fontSize: "0.9rem", fontWeight: activeTab === 'profile' ? "bold" : "500", transition: "0.2s", display: "flex", alignItems: "center", gap: "10px" }}>
            👤 Profile
          </button>
          <button onClick={() => setActiveTab('security')} style={{ background: activeTab === 'security' ? "rgba(239, 68, 68, 0.1)" : "transparent", color: activeTab === 'security' ? "#ef4444" : "var(--text-muted)", padding: "12px 20px", textAlign: "left", borderRadius: "8px", border: "none", cursor: "pointer", fontSize: "0.9rem", fontWeight: activeTab === 'security' ? "bold" : "500", transition: "0.2s", display: "flex", alignItems: "center", gap: "10px" }}>
            🔒 Security
          </button>
          <button onClick={() => setActiveTab('backup')} style={{ background: activeTab === 'backup' ? "var(--glass-border)" : "transparent", color: activeTab === 'backup' ? "var(--accent)" : "var(--text-muted)", padding: "12px 20px", textAlign: "left", borderRadius: "8px", border: "none", cursor: "pointer", fontSize: "0.9rem", fontWeight: activeTab === 'backup' ? "bold" : "500", transition: "0.2s", display: "flex", alignItems: "center", gap: "10px" }}>
            💾 Data & Privacy
          </button>
        </div>

        <div style={{ padding: "0 20px", display: "flex", flexDirection: "column", gap: "12px" }}>
          <button onClick={handleRaiseTicket} className="logic-btn" style={{ width: "100%", padding: "10px", fontSize: "0.8rem", background: "rgba(255,255,255,0.02)", color: "var(--text-main)", borderColor: "var(--glass-border)" }}>
            ✉️ RAISE TICKET
          </button>
          <button onClick={() => navigate('/dashboard')} className="logic-btn" style={{ width: "100%", padding: "10px", fontSize: "0.8rem", background: "transparent", color: "var(--text-main)", borderColor: "var(--glass-border)" }}>
            ◀ RETURN TO DASHBOARD
          </button>
        </div>
      </div>

      <div style={{ flex: 1, padding: "60px 80px", overflowY: "auto", position: "relative" }}>

        {message.text && (
          <div style={{ position: "absolute", top: "30px", right: "60px", padding: "12px 24px", borderRadius: "8px", fontSize: "0.9rem", fontWeight: "bold", backgroundColor: message.type === 'error' ? "rgba(220, 38, 38, 0.1)" : "rgba(104, 211, 145, 0.1)", color: message.type === 'error' ? "#ef4444" : "#68d391", border: `1px solid ${message.type === 'error' ? "#ef4444" : "#68d391"}`, zIndex: 100 }}>
            {message.text}
          </div>
        )}

        <div style={{ width: "100%", maxWidth: "1000px" }}>

          {activeTab === 'profile' && (
            <div style={{ animation: "fadeIn 0.3s ease" }}>
              <div style={{ marginBottom: "40px" }}>
                <h1 style={{ margin: "0 0 5px 0", fontSize: "2.2rem" }}>Profile</h1>
                <p style={{ color: "var(--text-muted)", margin: 0, fontSize: "1rem" }}>Manage your personal information and profile picture.</p>
              </div>

              <div style={{ backgroundColor: "rgba(0,0,0,0.02)", border: "1px solid var(--glass-border)", borderRadius: "16px", padding: "40px", marginBottom: "30px" }}>

                <div style={{ display: "flex", alignItems: "center", gap: "40px", marginBottom: "40px", paddingBottom: "40px", borderBottom: "1px solid var(--glass-border)" }}>
                  <div
                    onClick={() => fileInputRef.current.click()}
                    style={{ width: "100px", height: "100px", borderRadius: "50%", border: "2px dashed var(--accent)", backgroundColor: "rgba(0,0,0,0.05)", overflow: "hidden", display: "flex", justifyContent: "center", alignItems: "center", color: "var(--accent)", fontSize: "2.5rem", fontWeight: "bold", cursor: "pointer", position: "relative", flexShrink: 0 }}
                    title="Click to change avatar"
                  >
                    {pfpImage ? <img src={pfpImage} alt="Avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : (name ? name.charAt(0) : "?")}
                    <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", opacity: 0, transition: "0.2s" }} onMouseOver={(e) => e.currentTarget.style.opacity = 1} onMouseOut={(e) => e.currentTarget.style.opacity = 0}>
                      <span style={{ fontSize: "1.5rem", color: "#fff" }}>📷</span>
                    </div>
                  </div>

                  <div>
                    <h3 style={{ margin: "0 0 8px 0", fontSize: "1.2rem" }}>Profile Picture</h3>
                    <p style={{ color: "var(--text-muted)", margin: "0 0 15px 0", fontSize: "0.9rem" }}>Click the circle to upload a custom image directly from your desktop. Keep it under 2MB.</p>
                    <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageUpload} style={{ display: "none" }} />
                    <div style={{ display: "flex", gap: "10px" }}>
                      <button onClick={() => fileInputRef.current.click()} className="logic-btn" style={{ padding: "8px 16px", fontSize: "0.85rem", borderColor: "var(--glass-border)", color: "var(--text-main)" }}>Browse Desktop Files</button>

                      {pfpImage && (
                        <button
                          onClick={() => setPfpImage("")}
                          className="logic-btn"
                          style={{ padding: "8px 16px", fontSize: "0.85rem", borderColor: "#ef4444", color: "#ef4444", background: "rgba(220, 38, 38, 0.05)" }}
                        >
                          Remove Image
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "30px" }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: "block", marginBottom: "10px", fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: "bold", letterSpacing: "1px" }}>DISPLAY NAME</label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} style={{ width: "100%", padding: "14px", backgroundColor: "var(--bg-color)", border: "1px solid var(--glass-border)", color: "var(--text-main)", borderRadius: "8px", outline: "none", transition: "0.2s", fontSize: "1rem" }} onFocus={(e) => e.target.style.borderColor = "var(--accent)"} onBlur={(e) => e.target.style.borderColor = "var(--glass-border)"} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: "block", marginBottom: "10px", fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: "bold", letterSpacing: "1px" }}>ENROLLMENT NO. (LOCKED)</label>
                    <input type="text" value={enrollmentNo} disabled style={{ width: "100%", padding: "14px", backgroundColor: "rgba(0,0,0,0.05)", border: "1px dashed var(--glass-border)", color: "var(--text-muted)", borderRadius: "8px", outline: "none", cursor: "not-allowed", fontSize: "1rem" }} />
                  </div>
                </div>
              </div>

              <button onClick={handleSaveProfile} disabled={isLoading} className="logic-btn" style={{ padding: "14px 30px", fontSize: "1rem" }}>
                {isLoading ? "SAVING..." : "SAVE CHANGES"}
              </button>
            </div>
          )}

          {activeTab === 'security' && (
            <div style={{ animation: "fadeIn 0.3s ease" }}>
              <div style={{ marginBottom: "40px" }}>
                <h1 style={{ margin: "0 0 5px 0", fontSize: "2.2rem", color: "#ef4444" }}>Password & Security</h1>
                <p style={{ color: "var(--text-muted)", margin: 0, fontSize: "1rem" }}>Update your password to keep your account secure.</p>
              </div>

              <div style={{ backgroundColor: "rgba(239, 68, 68, 0.02)", border: "1px solid rgba(239, 68, 68, 0.2)", borderRadius: "16px", padding: "40px", marginBottom: "30px" }}>

                <div style={{ marginBottom: "40px", paddingBottom: "40px", borderBottom: "1px solid rgba(239, 68, 68, 0.2)" }}>
                  <h3 style={{ margin: "0 0 20px 0", fontSize: "1.2rem" }}>Current Password</h3>
                  <label style={{ display: "block", marginBottom: "10px", fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: "bold", letterSpacing: "1px" }}>CURRENT PASSWORD</label>
                  <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Enter current password to unlock changes..." style={{ width: "100%", maxWidth: "450px", padding: "14px", backgroundColor: "var(--bg-color)", border: "1px solid var(--glass-border)", color: "var(--text-main)", borderRadius: "8px", outline: "none", fontSize: "1rem" }} onFocus={(e) => e.target.style.borderColor = "#ef4444"} onBlur={(e) => e.target.style.borderColor = "var(--glass-border)"} />
                </div>

                <div>
                  <h3 style={{ margin: "0 0 20px 0", fontSize: "1.2rem" }}>New Password</h3>
                  <div style={{ display: "flex", gap: "30px" }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: "block", marginBottom: "10px", fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: "bold", letterSpacing: "1px" }}>NEW PASSWORD</label>
                      <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Minimum 8 characters..." style={{ width: "100%", padding: "14px", backgroundColor: "var(--bg-color)", border: "1px solid var(--glass-border)", color: "var(--text-main)", borderRadius: "8px", outline: "none", fontSize: "1rem" }} onFocus={(e) => e.target.style.borderColor = "#ef4444"} onBlur={(e) => e.target.style.borderColor = "var(--glass-border)"} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: "block", marginBottom: "10px", fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: "bold", letterSpacing: "1px" }}>CONFIRM NEW PASSWORD</label>
                      <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Repeat new password..." style={{ width: "100%", padding: "14px", backgroundColor: "var(--bg-color)", border: "1px solid var(--glass-border)", color: "var(--text-main)", borderRadius: "8px", outline: "none", fontSize: "1rem" }} onFocus={(e) => e.target.style.borderColor = "#ef4444"} onBlur={(e) => e.target.style.borderColor = "var(--glass-border)"} />
                    </div>
                  </div>
                </div>
              </div>

              <button onClick={handleSaveSecurity} disabled={isLoading} className="logic-btn" style={{ padding: "14px 30px", fontSize: "1rem", borderColor: "#ef4444", color: "#ef4444", background: "rgba(220, 38, 38, 0.05)" }}>
                {isLoading ? "SAVING..." : "UPDATE PASSWORD"}
              </button>
            </div>
          )}

          {activeTab === 'backup' && (
            <div style={{ animation: "fadeIn 0.3s ease" }}>
              <div style={{ marginBottom: "40px" }}>
                <h1 style={{ margin: "0 0 5px 0", fontSize: "2.2rem" }}>Data & Privacy</h1>
                <p style={{ color: "var(--text-muted)", margin: 0, fontSize: "1rem" }}>Download your learning records or permanently delete your account.</p>
              </div>

              <div style={{ backgroundColor: "rgba(0,0,0,0.02)", border: "1px solid var(--glass-border)", borderRadius: "16px", padding: "40px", marginBottom: "30px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h3 style={{ margin: "0 0 8px 0", fontSize: "1.2rem" }}>Download Your Data</h3>
                  <p style={{ color: "var(--text-muted)", margin: 0, fontSize: "0.9rem", maxWidth: "400px" }}>Download a complete CSV record of your skill tree progress, mastery timestamps, and quiz history.</p>
                </div>
                <button className="logic-btn" onClick={() => alert("Backend export route not connected yet!")} style={{ padding: "12px 24px", fontSize: "0.9rem" }}>
                  📥 DOWNLOAD DATA
                </button>
              </div>

              <div style={{ backgroundColor: "rgba(239, 68, 68, 0.05)", border: "1px solid rgba(239, 68, 68, 0.3)", borderRadius: "16px", padding: "40px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h3 style={{ margin: "0 0 8px 0", fontSize: "1.2rem", color: "#ef4444" }}>Danger Zone</h3>
                  <p style={{ color: "rgba(239, 68, 68, 0.8)", margin: 0, fontSize: "0.9rem", maxWidth: "400px" }}>Permanently delete your account and all associated learning data. This action cannot be undone.</p>
                </div>
                <button className="logic-btn" onClick={() => alert("Safety Protocol Active. Account deletion requires administrative override.")} style={{ padding: "12px 24px", fontSize: "0.9rem", backgroundColor: "#ef4444", color: "#fff", borderColor: "#ef4444" }}>
                  DELETE ACCOUNT
                </button>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  )
}