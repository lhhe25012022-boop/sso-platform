import React, { useEffect, useState } from 'react'
import axios from 'axios'
import '../styles/Dashboard.css'

function Dashboard({ user, onLogout }) {
  const [protectedData, setProtectedData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchProtectedData = async () => {
      try {
        const response = await axios.get('/api/protected')
        setProtectedData(response.data)
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to fetch protected data')
      }
    }

    fetchProtectedData()
  }, [])

  return (
    <div className="dashboard">
      <div className="dashboard-container">
        <div className="header">
          <h1>App C - Dashboard</h1>
          <button className="logout-btn" onClick={onLogout}>
            Logout
          </button>
        </div>

        <div className="user-card">
          <div className="user-header">
            {user.picture && <img src={user.picture} alt="Profile" className="avatar" />}
            <div>
              <h2>{user.name || user.given_name || user.email}</h2>
              <p>{user.email}</p>
            </div>
          </div>
          <div className="user-details">
            <div className="detail-item">
              <span className="label">Subject ID:</span>
              <span className="value">{user.sub}</span>
            </div>
            {user.family_name && (
              <div className="detail-item">
                <span className="label">Family Name:</span>
                <span className="value">{user.family_name}</span>
              </div>
            )}
          </div>
        </div>

        {protectedData && (
          <div className="data-card">
            <h3>Protected Data</h3>
            <p className="message">{protectedData.message}</p>
            <p className="timestamp">Fetched at: {new Date(protectedData.timestamp).toLocaleString()}</p>
          </div>
        )}

        {error && (
          <div className="error-card">
            <p>Error: {error}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard
