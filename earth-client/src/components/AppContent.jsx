import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Routes, Route, useMatch, Link, Navigate } from 'react-router-dom'
import { useApolloClient } from '@apollo/client'
import { SidebarTrigger, useSidebar } from '@/components/ui/sidebar'
import { Toaster } from '@/components/ui/sonner'
import { toast } from 'sonner'

import ModeToggle from '@/components/mode-toggle'
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
      <SidebarTrigger
        className={`fixed top-3 z-50 transition-all ${
          open ? 'left-[calc(var(--sidebar-width))]' : 'left-13'
        }`}
      />
      <DashSideBar />
      <div className="flex flex-col min-h-screen w-full max-w-[3000px] mx-auto relative">
        <div className="flex flex-wrap justify-center gap-4 mt-6 mb-8">
          <Button asChild>
            <Link to="/">Home</Link>
          </Button>

          {token ? (
            // Show these links only when logged in
            <>
              <Button asChild>
                <Link to="/projects">Projects</Link>
              </Button>
              <Button asChild>
                <Link to="/add">Add Project</Link>
              </Button>
              <Button onClick={handleLogout}>Logout</Button>
            </>
          ) : (
            // Show only login when not logged in
            <Button asChild>
              <Link to="/login">Login</Link>
            </Button>
          )}
          <ModeToggle />
        </div>
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
