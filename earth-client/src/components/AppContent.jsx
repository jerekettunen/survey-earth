import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Routes, Route, useMatch, Link, Navigate } from 'react-router-dom'
import { useApolloClient } from '@apollo/client'
import { SidebarTrigger, useSidebar } from '@/components/ui/sidebar'
import { Toaster } from '@/components/ui/sonner'
import { toast } from 'sonner'

import ModeToggle from '@/components/ModeToggle'
import NewProjectForm from '@/components/NewProjectForm'
import Projects from '@/components/Projects'
import ProjectSingle from '@/components/ProjectSingle'
import LoginForm from '@/components/LoginForm'
import SignUpForm from '@/components/SignUpForm'
import DashSideBar from '@/components/DashSideBar'

const AppContent = () => {
  const [token, setToken] = useState(null)
  const [toastMessage, setToastMessage] = useState(null)
  const client = useApolloClient()

  const match = useMatch('/projects/:id')
  const projectId = match ? match.params.id : null

  const { open } = useSidebar()

  useEffect(() => {
    const token = localStorage.getItem('user-token')
    if (token) {
      setToken(token)
    }
    if (toastMessage) {
      const { title, description, duration } = toastMessage
      toast(title, {
        description,
        duration: duration || 3000,
        onOpen: () => {
          setToastMessage(null)
        },
      })
    }
  }, [toastMessage])

  const handleLogout = () => {
    localStorage.clear()
    client.clearStore()
    setToken(null)
  }

  return (
    <>
      <div className="flex flex-col min-h-screen w-full max-w-[3000px] mx-auto relative">
        {token ? (
          // Show these links only when logged in
          <>
            <SidebarTrigger
              className={`fixed top-3 z-50 transition-all ${
                open ? 'left-[calc(var(--sidebar-width))]' : 'left-13'
              }`}
            />
            <DashSideBar handleLogout={handleLogout} />
          </>
        ) : (
          // Show only login when not logged in
          <div className="absolute top-3 right-3 flex gap-2">
            <ModeToggle />
            <Button asChild variant="ghost">
              <Link to="/">Home</Link>
            </Button>
            <Button asChild variant="ghost">
              <Link to="/login">Login</Link>
            </Button>
          </div>
        )}
        <div className="flex flex-col items-center w-full max-w-6xl mx-auto px-4 py-2">
          <Routes>
            <Route path="/" element={<div>Home</div>} />
            <Route path="/projects" element={<Projects />} />
            <Route
              path="/projects/:id"
              element={<ProjectSingle id={projectId} />}
            />
            <Route path="/add" element={<NewProjectForm />} />
            <Route path="/login" element={<LoginForm setToken={setToken} />} />
            <Route
              path="/register"
              element={<SignUpForm setToastMessage={setToastMessage} />}
            />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
        <Toaster
          toastOptions={{
            className: 'sonner-toast',
            style: {
              background: 'var(--background)',
              color: 'var(--text)',
            },
          }}
          richColors
        />
      </div>
    </>
  )
}

export default AppContent
