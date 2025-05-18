import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Routes, Route, useMatch, Link, Navigate } from 'react-router-dom'
import { useApolloClient } from '@apollo/client'

import { ThemeProvider } from './components/theme-provider'
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import ModeToggle from './components/mode-toggle'
import NewProjectForm from './components/NewProjectForm'
import Projects from './components/Projects'
import ProjectSingle from './components/ProjectSingle'
import LoginForm from './components/LoginForm'
import SignUpForm from './components/SignUpForm'
import DashSideBar from './components/DashSideBar'

import { Toaster } from '@/components/ui/sonner'
import { toast } from 'sonner'

import './App.css'

const App = () => {
  const [token, setToken] = useState(null)
  const [toastMessage, setToastMessage] = useState(null)
  const client = useApolloClient()

  const match = useMatch('/projects/:id')
  const projectId = match ? match.params.id : null

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
    <ThemeProvider defaultTheme="system" storageKey="earth-client-theme">
      <SidebarProvider>
        <DashSideBar />
        <div className="flex flex-col items-center min-h-screen">
          <SidebarTrigger />
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
          <div className="flex flex-col items-center w-full max-w-4xl p-4">
            <Routes>
              <Route path="/" element={<div>Home</div>} />
              <Route path="/projects" element={<Projects />} />
              <Route
                path="/projects/:id"
                element={<ProjectSingle id={projectId} />}
              />
              <Route path="/add" element={<NewProjectForm />} />
              <Route
                path="/login"
                element={<LoginForm setToken={setToken} />}
              />
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
      </SidebarProvider>
    </ThemeProvider>
  )
}

export default App
