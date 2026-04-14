import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Landing from './Landing'
import Login from './Login'
import Dashboard from './Dashboard'
import FocusRoom from './Focusroom'
import SettingsPage from './SettingsPage';
import './App.css'

function App() {
  const [userLevel, setUserLevel] = useState(0)

  const handleLevelUp = (newLevel) => {
    if (newLevel > userLevel) {
      setUserLevel(newLevel)
    }
  }

  return (
    <Router>
      <div className="container">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/login" element={<Login />} />
          
          
          <Route path="/dashboard" element={<Dashboard userLevel={userLevel} />} />
          <Route path="/focus/:topicId" element={<FocusRoom levelUp={handleLevelUp} />} />
        </Routes>
      </div>
    </Router>
  ) 
}

export default App