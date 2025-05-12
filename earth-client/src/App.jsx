import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Routes, Route, useMatch, Link, Navigate } from 'react-router-dom'
import { useApolloClient } from '@apollo/client'

import NewProjectForm from './components/NewProjectForm'
import Projects from './components/Projects'
import ProjectSingle from './components/ProjectSingle'
import LoginForm from './components/LoginForm'

import './App.css'

const App = () => {
  const [token, setToken] = useState(null)
  const client = useApolloClient()

  const match = useMatch('/projects/:id')
  const projectId = match ? match.params.id : null

  useEffect(() => {
    const token = localStorage.getItem('user-token')
    if (token) {
      setToken(token)
    }
  }, [])

  const handleLogout = () => {
    localStorage.clear()
    client.clearStore()
    setToken(null)
  }

  return (
    <div className="flex flex-col items-center min-h-svh">
      <div>
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
      </div>
      <div>
        <Routes>
          <Route path="/" element={<div>Home</div>} />
          <Route path="/projects" element={<Projects />} />
          <Route
            path="/projects/:id"
            element={<ProjectSingle id={projectId} />}
          />
          <Route path="/add" element={<NewProjectForm />} />
          <Route path="/login" element={<LoginForm setToken={setToken} />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </div>
  )
}

export default App
