import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import MemoryRefreshModal from './components/MemoryRefreshModal'
import './Dashboard.css'

function Dashboard() {
  const navigate = useNavigate()
  const [warning, setWarning] = useState("")
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(true)

  const [isGearHovered, setIsGearHovered] = useState(false);
  const storedId = localStorage.getItem('WHITE ALBUM_user_id');
  const [userPfp, setUserPfp] = useState(localStorage.getItem(`WHITE ALBUM_pfp_${storedId}`) || "");

  const [isMemoryModalOpen, setIsMemoryModalOpen] = useState(false)
  const [decayedNodeToTest, setDecayedNodeToTest] = useState(null)
  
  const [isHelpOpen, setIsHelpOpen] = useState(false)

  const skillTree = [
    { id: "fundamentals", title: "C++ Fundamentals", reqLevel: 0 },
    { id: "arrays_strings", title: "Arrays & Strings", reqLevel: 1 },
    { id: "memory_pointers", title: "Memory & Pointers", reqLevel: 2 },
    { id: "oop", title: "Object-Oriented Programming", reqLevel: 3 },
    { id: "linked_lists", title: "Linked Lists", reqLevel: 4 },
    { id: "stacks_queues", title: "Stacks & Queues", reqLevel: 5 },
    { id: "trees_heaps", title: "Trees & Heaps", reqLevel: 6 },
    { id: "graphs", title: "Graph Theory", reqLevel: 7 }
  ]

  useEffect(() => {
    const fetchUserData = async () => {
      const storedId = localStorage.getItem('WHITE ALBUM_user_id')

      if (!storedId) {
        navigate('/login')
        return
      }

      try {
        const response = await fetch(`http://localhost:5000/api/users/${storedId}`)
        if (response.ok) {
          const data = await response.json()
          setUserData(data)
        } else {
          localStorage.removeItem('WHITE ALBUM_user_id')
          navigate('/login')
        }
      } catch (error) {
        console.error("Dashboard failed to connect to backend", error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [navigate])

  const handleNodeClick = (node, isDecayed) => {
    if (!userData) return

    if (userData.currentLevel < node.reqLevel) {
      setWarning(`Please finish previous level before touching this (Requires Level ${node.reqLevel})`)
      setTimeout(() => setWarning(""), 3000)
    } else if (isDecayed) {
      setDecayedNodeToTest(node)
      setIsMemoryModalOpen(true)
    } else {
      navigate(`/focus/${node.id}`)
    }
  }

  const handleRefreshSuccess = async (nodeId) => {
    try {
      await fetch('http://localhost:5000/api/users/level-up', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enrollmentNo: userData.enrollmentNo,
          currentNodeId: nodeId
        })
      })
      window.location.reload()
    } catch (error) {
      console.error("Failed to refresh node", error)
    }
  }

  const handleRefreshFail = (nodeId) => {
    setIsMemoryModalOpen(false)
    navigate(`/focus/${nodeId}`) 
  }

  const handleRaiseTicket = () => {
    window.open("mailto:umaru999chan999@gmail.com?subject=WHITE ALBUM%20Support%20Ticket", "_blank");
  }

  if (loading) {
    return <div className="hub-layout" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><h2 style={{ color: "var(--accent)" }}>Syncing Neural Data...</h2></div>
  }

  return (
    <div className="hub-layout">

      <div className="top-nav">
        <h2 className="nav-title" style={{ margin: 0 }}>WHITE ALBUM <span style={{ color: "var(--text-muted)", fontSize: "1rem" }}>// THE DASHBOARD</span></h2>

        <div className="profile-area" style={{ display: "flex", alignItems: "center", gap: "15px" }}>
          <div style={{ textAlign: "right" }}>
            <h3 style={{ margin: 0, fontSize: "0.95rem", fontFamily: "var(--font-body)", textTransform: "capitalize", color: "var(--text-main)" }}>{userData?.name || "Unknown User"}</h3>
            <span style={{ color: "var(--text-muted)", fontSize: "0.75rem", letterSpacing: "1px" }}>
              {userData?.enrollmentNo}
            </span>
          </div>

          <div style={{ width: "40px", height: "40px", borderRadius: "50%", border: "2px solid var(--accent)", background: "var(--glass-border)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", color: "var(--accent)", fontSize: "1.2rem", textTransform: "uppercase", overflow: "hidden" }}>
            {userPfp ? (
              <img src={userPfp} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              userData?.name ? userData.name.charAt(0) : "?"
            )}
          </div>

          <div 
            style={{ position: "relative" }}
            onMouseEnter={() => setIsGearHovered(true)}
            onMouseLeave={() => setIsGearHovered(false)}
          >
            <button 
              onClick={() => navigate('/settings')} 
              className="logic-btn" 
              style={{ padding: "6px 12px", fontSize: "0.8rem", cursor: "pointer" }}
            >
              ⚙️
            </button>
            
            {isGearHovered && (
              <div style={{ position: "absolute", top: "100%", right: "0", paddingTop: "12px", zIndex: 50, minWidth: "160px" }}>
                <div style={{ backgroundColor: "var(--bg-color)", border: "1px solid var(--glass-border)", borderRadius: "8px", overflow: "hidden", boxShadow: "0 10px 25px rgba(0,0,0,0.5)", display: "flex", flexDirection: "column" }}>
                  <button 
                    onClick={() => navigate('/settings')} 
                    style={{ background: "transparent", border: "none", borderBottom: "1px solid rgba(255,255,255,0.05)", color: "var(--text-main)", padding: "12px 15px", textAlign: "left", cursor: "pointer", fontSize: "0.85rem", transition: "0.2s", display: "flex", alignItems: "center", gap: "8px" }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    ✏️ Edit Profile
                  </button>
                  <button 
                    onClick={() => { localStorage.removeItem('WHITE ALBUM_user_id'); navigate('/login'); }} 
                    style={{ background: "transparent", border: "none", color: "#ef4444", padding: "12px 15px", textAlign: "left", cursor: "pointer", fontSize: "0.85rem", transition: "0.2s", display: "flex", alignItems: "center", gap: "8px" }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(220, 38, 38, 0.1)'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    🚪 Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="map-container">
        <h1 className="map-title">THE AXIOMS</h1>

        <div className="skill-tree">
          {skillTree.map((node, index) => {
            const unlockedNodeData = userData?.unlockedNodes?.find(n => n.nodeId === node.id)
            const isUnlocked = !!unlockedNodeData
            let isDecayed = false

            if (isUnlocked) {
              const lastReviewedDate = new Date(unlockedNodeData.lastReviewed)
              const currentDate = new Date()
              const diffInDays = (currentDate - lastReviewedDate) / (1000 * 60 * 60 * 24)

              if (diffInDays > 7) {
                isDecayed = true
              }
            }

            let buttonClass = 'locked'
            let icon = '🔒 '

            if (isUnlocked) {
              if (isDecayed) {
                buttonClass = 'decayed'
                icon = '🟠 '
              } else {
                buttonClass = 'unlocked'
                icon = '🟢 '
              }
            }

            return (
              <button
                key={index}
                className={`node-btn ${buttonClass}`}
                onClick={() => handleNodeClick(node, isDecayed)}
              >
                {icon} {node.title}
              </button>
            )
          })}
        </div>

        {warning !== "" && (
          <div className="crimson-warning">
            {warning}
          </div>
        )}

        <div style={{ position: "fixed", bottom: "30px", right: "30px", display: "flex", gap: "10px", zIndex: 100 }}>
          <button 
            className="logic-btn" 
            onClick={() => setIsHelpOpen(true)}
            style={{ fontSize: "0.8rem", padding: "8px 16px", background: "var(--glass-bg)", color: "var(--text-main)", borderColor: "var(--glass-border)" }}
          >
            Help & Guide
          </button>
          <button 
            className="logic-btn" 
            onClick={handleRaiseTicket}
            style={{ fontSize: "0.8rem", padding: "8px 16px", background: "rgba(220, 38, 38, 0.1)", color: "#ef4444", borderColor: "#dc2626" }}
          >
            Raise Ticket
          </button>
        </div>

      </div>

      {isHelpOpen && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.7)", zIndex: 1000, display: "flex", justifyContent: "center", alignItems: "center", backdropFilter: "blur(4px)" }}>
          <div style={{ background: "var(--bg-color)", padding: "35px", borderRadius: "12px", border: "1px solid var(--accent)", width: "450px", boxShadow: "0 20px 50px rgba(0,0,0,0.5)" }}>
            <h3 style={{ color: "var(--accent)", margin: "0 0 20px 0", fontFamily: "var(--font-heading)", fontSize: "1.5rem", letterSpacing: "1px" }}>SYSTEM GUIDE</h3>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "15px", marginBottom: "25px" }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: "15px" }}>
                <span style={{ fontSize: "1.5rem" }}>🟢</span>
                <div>
                  <h4 style={{ margin: "0 0 5px 0", color: "var(--text-main)" }}>Mastered Nodes</h4>
                  <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: "1.5" }}>Fully unlocked topics. Click to re-enter the Focusroom and review material at any time.</p>
                </div>
              </div>
              
              <div style={{ display: "flex", alignItems: "flex-start", gap: "15px" }}>
                <span style={{ fontSize: "1.5rem" }}>🟠</span>
                <div>
                  <h4 style={{ margin: "0 0 5px 0", color: "var(--text-main)" }}>Decayed Nodes</h4>
                  <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: "1.5" }}>Topics you haven't reviewed in 7 days. You must pass a quick memory check to re-stabilize the pathway.</p>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "flex-start", gap: "15px" }}>
                <span style={{ fontSize: "1.5rem" }}>🔒</span>
                <div>
                  <h4 style={{ margin: "0 0 5px 0", color: "var(--text-main)" }}>Locked Nodes</h4>
                  <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: "1.5" }}>You must pass the Mastery Exam of the preceding node to unlock these advanced topics.</p>
                </div>
              </div>
            </div>

            <button className="logic-btn" onClick={() => setIsHelpOpen(false)} style={{ width: "100%", padding: "12px", fontSize: "0.9rem", fontWeight: "bold" }}>
              ACKNOWLEDGE
            </button>
          </div>
        </div>
      )}

      <MemoryRefreshModal
        isOpen={isMemoryModalOpen}
        onClose={() => { setIsMemoryModalOpen(false); setDecayedNodeToTest(null); }}
        node={decayedNodeToTest}
        onSuccess={handleRefreshSuccess}
        onFail={handleRefreshFail}
      />

    </div>
  )
}

export default Dashboard