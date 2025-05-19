import { createContext, useState, useContext, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApolloClient } from '@apollo/client'
import { toast } from 'sonner'

// Create context
const AuthContext = createContext(null)

// Provider component
export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const client = useApolloClient()

  useEffect(() => {
    const storedToken = localStorage.getItem('user-token')
    if (storedToken) {
      setToken(storedToken)
    }
    setLoading(false)
  }, [])

  // Login function
  const login = (newToken) => {
    localStorage.setItem('user-token', newToken)
    setToken(newToken)
  }

  // Logout function
  const logout = () => {
    localStorage.clear()
    client.clearStore()
    setToken(null)
    navigate('/')
    toast('Logged out successfully', {
      description: 'You have been logged out.',
      duration: 3000,
    })
  }

  return (
    <AuthContext.Provider
      value={{ token, login, logout, isAuthenticated: !!token, loading }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook for using the auth context
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
