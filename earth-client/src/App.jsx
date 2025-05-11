import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Routes, Route, useMatch, Link, Navigate } from 'react-router-dom'
import NewProjectForm from './components/NewProjectForm'
import Projects from './components/Projects'
import ProjectSingle from './components/ProjectSingle'

import './App.css'

function App() {
  const [count, setCount] = useState(0)
  const match = useMatch('/projects/:id')
  const projectId = match ? match.params.id : null

  return (
    <div className="flex flex-col items-center min-h-svh">
      <div>
        <Button asChild>
          <Link to="/">Home</Link>
        </Button>
        <Button asChild>
          <Link to="/projects">Projects</Link>
        </Button>
        <Button asChild>
          <Link to="/login">Login</Link>
        </Button>
        <Button asChild>
          <Link to="/add">Add</Link>
        </Button>
        <div>
          <Routes>
            <Route path="/" element={<div>Home</div>} />
            <Route path="/projects" element={<Projects />} />
            <Route
              path="/projects/:id"
              element={<ProjectSingle id={projectId} />}
            />
            <Route path="/add" element={<NewProjectForm />} />
            <Route path="/login" element={<div>Login</div>} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </div>
    </div>
  )
}

export default App
