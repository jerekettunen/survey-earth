import { createContext, useState, useContext, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApolloClient } from '@apollo/client'
import { toast } from 'sonner'
import { jwtDecode } from 'jwt-decode'

// Create context
const AuthContext = createContext(null)

// Provider component
export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null)
  const [currentUser, setCurrentUser] = useState(null) // Add current user state
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const client = useApolloClient()

  const extractUserFromToken = (tokenToExtract) => {
    if (!tokenToExtract) return null

    try {
      const decodedToken = jwtDecode(tokenToExtract)
      return {
        id: decodedToken.id,
        username: decodedToken.username,
      }
    } catch (error) {
      console.error('Error extracting user data:', error)
      return null
    }
  }

  // Check token validity function
  const checkTokenValidity = (tokenToCheck) => {
    if (!tokenToCheck) return false

    try {
      const decodedToken = jwtDecode(tokenToCheck)
      const currentTime = Date.now() / 1000
      return decodedToken.exp > currentTime
    } catch (error) {
      console.error('Error decoding token:', error)
      return false
    }
  }

  useEffect(() => {
    const storedToken = localStorage.getItem('user-token')
    if (storedToken) {
      // Add this check for token expiration
      if (checkTokenValidity(storedToken)) {
        setToken(storedToken)
        setCurrentUser(extractUserFromToken(storedToken)) // Set current user
      } else {
        // Token is expired, logout silently
        localStorage.removeItem('user-token')
        client.clearStore()
        toast.error('Session expired', {
          description: 'Please log in again to continue.',
        })
      }
    }
    setLoading(false)
  }, [])

  // Regular token validation check
  useEffect(() => {
    if (!token) return

    const validateInterval = setInterval(() => {
      if (!checkTokenValidity(token)) {
        logout()
      }
    }, 60000) // Check every minute

    return () => clearInterval(validateInterval)
  }, [token])

  // Login function
  const login = (newToken) => {
    localStorage.setItem('user-token', newToken)
    setToken(newToken)
  }

  // Logout function is already well implemented
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
      value={{
        token,
        currentUser,
        login,
        logout,
        isAuthenticated: !!token,
        loading,
        checkTokenValidity, // Expose this for manual checks if needed
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook remains unchanged
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
