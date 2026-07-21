import React, { useEffect, useState } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import axios from 'axios'
import Home from './pages/Home'
import Callback from './pages/Callback'
import Dashboard from './pages/Dashboard'
import './App.css'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    // Check if user is already authenticated
    const checkAuth = async () => {
      try {
        const response = await axios.get('/auth/session')
        setUser(response.data.user)
      } catch (error) {
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const handleLogout = async () => {
    try {
      const response = await axios.post('/auth/logout')
      setUser(null)
      window.location.href = response.data.logoutUrl
    } catch (error) {
      console.error('Logout error:', error)
      setUser(null)
      navigate('/')
    }
  }

  if (loading) {
    return (
      <div className="app-container loading">
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <div className="app-container">
      <Routes>
        <Route path="/" element={<Home user={user} />} />
        <Route path="/auth/callback" element={<Callback setUser={setUser} />} />
        <Route path="/dashboard" element={user ? <Dashboard user={user} onLogout={handleLogout} /> : <Home user={user} />} />
      </Routes>
    </div>
  )
}

export default App
