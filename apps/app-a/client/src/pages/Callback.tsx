import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSearchParams } from 'react-router-dom'

interface CallbackProps {
  setUser: (user: any) => void
}

function Callback({ setUser }: CallbackProps) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  useEffect(() => {
    const processCallback = async () => {
      try {
        const token = searchParams.get('token')
        if (token) {
          // Token stored in localStorage/session by server
          // Redirect to dashboard
          setTimeout(() => {
            navigate('/dashboard')
          }, 500)
        }
      } catch (error) {
        console.error('Callback processing error:', error)
        navigate('/')
      }
    }

    processCallback()
  }, [navigate, searchParams])

  return (
    <div className="callback">
      <div className="card">
        <div className="spinner"></div>
        <p>Processing authentication...</p>
      </div>
    </div>
  )
}

export default Callback
