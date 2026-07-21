import React from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import '../styles/Home.css'

function Home({ user }) {
  const navigate = useNavigate()

  const handleLogin = async () => {
    try {
      const response = await axios.get('/auth/login-url')
      window.location.href = response.data.loginUrl
    } catch (error) {
      console.error('Error getting login URL:', error)
    }
  }

  if (user) {
    navigate('/dashboard')
  }

  return (
    <div className="home">
      <div className="card">
        <div className="card-content">
          <h1>App A</h1>
          <p className="subtitle">SSO Platform Demo</p>
          <p className="description">
            Secure Single Sign-On using PingOne
          </p>
          <button className="login-btn" onClick={handleLogin}>
            Sign in with PingOne
          </button>
          <div className="info-box">
            <h3>Features</h3>
            <ul>
              <li>OAuth2 Authorization Code Flow</li>
              <li>OpenID Connect Support</li>
              <li>Secure Token Management</li>
              <li>User Session Management</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home
