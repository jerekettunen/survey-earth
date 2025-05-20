import { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './AuthProvider'
import { useParams } from 'react-router-dom'
import { useQuery } from '@apollo/client'
import { GET_PROJECT } from '@/queries'

const ProjectRoleContext = createContext(null)

export const ProjectRoleProvider = ({ children }) => {
  const [userRole, setUserRole] = useState(null)
  const [isOwner, setIsOwner] = useState(false)
  const { isAuthenticated, loading: authLoading, currentUser } = useAuth()
  const { id } = useParams() // Get project ID from URL

  // Skip query if not authenticated or no project ID
  const skip = !isAuthenticated || !id || authLoading

  const { loading, data } = useQuery(GET_PROJECT, {
    variables: { id },
    skip,
  })

  useEffect(() => {
    // Set defaults initially
    let currentRole = null
    let ownerStatus = false

    // Only process if we have all the data
    if (data?.project && isAuthenticated && currentUser && !loading) {
      const { project } = data

      const ownerId = String(project.owner?.id || '').trim()
      const userId = String(currentUser?.id || '').trim()

      // Check ownership
      ownerStatus = Boolean(ownerId && userId && ownerId === userId)

      if (ownerStatus) {
        currentRole = 'Admin'
      } else {
        // Find collaborator role with correct return statement
        const userCollab = project.collaborators?.find(
          (c) => String(c.user?.id) === String(userId)
        )
        currentRole = userCollab?.role || null
      }
    }

    // Always set the state at the end
    setUserRole(currentRole)
    setIsOwner(ownerStatus)
  }, [data, isAuthenticated, currentUser, loading])

  // Permission check helpers
  const can = {
    view: Boolean(userRole) || isOwner,
    edit: ['Editor', 'Admin'].includes(userRole) || isOwner,
    manage: userRole === 'Admin' || isOwner,
    delete: isOwner, // Only owner can delete project
  }
  return (
    <ProjectRoleContext.Provider
      value={{
        userRole,
        isOwner,
        loading: loading || authLoading,
        can,
      }}
    >
      {children}
    </ProjectRoleContext.Provider>
  )
}

// Custom hook
export const useProjectRole = () => {
  const context = useContext(ProjectRoleContext)
  if (!context) {
    throw new Error('useProjectRole must be used within ProjectRoleProvider')
  }
  return context
}
