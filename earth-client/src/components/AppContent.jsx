import { useState, useEffect } from 'react'
import { useAuth } from '@/components/Providers/AuthProvider'
import { Button } from '@/components/ui/button'
import { Routes, Route, useMatch, Link, Navigate } from 'react-router-dom'
import { SidebarTrigger, useSidebar } from '@/components/ui/sidebar'

import ModeToggle from '@/components/ModeToggle'
import NewProjectForm from '@/components/NewProjectForm'
import Projects from '@/components/Projects'
import ProjectSingle from '@/components/ProjectSingle'
import LoginForm from '@/components/auth/LoginForm'
import SignUpForm from '@/components/auth/SignUpForm'
import DashSideBar from '@/components/DashSideBar'
import HomePage from './HomePage'
import ProtectedRoute from '@/components/ProtectedRoute'
import { ProjectRoleProvider } from '@/components/Providers/ProjectRoleProvider'
import { Home } from 'lucide-react'

const AppContent = () => {
  const { isAuthenticated, logout } = useAuth()

  const match = useMatch('/projects/:id')
  const projectId = match ? match.params.id : null

  const { open } = useSidebar()

  return (
    <>
      <div className="flex flex-col min-h-screen w-full max-w-[3000px] mx-auto relative">
        {isAuthenticated ? (
          // Show these links only when logged in
          <>
            <SidebarTrigger
              className={`fixed top-3 z-50 transition-all ${
                open ? 'left-[calc(var(--sidebar-width))]' : 'left-13'
              }`}
            />
            <DashSideBar handleLogout={logout} />
          </>
        ) : (
          // Show only login when not logged in
          <div className="absolute top-3 right-3 flex flex-col sm:flex-row gap-2 z-50">
            <ModeToggle />
            <Button
              asChild
              variant="ghost"
              className="bg-blue-900/50 hover:bg-blue-900/70 text-white border border-blue-400/30 backdrop-blur-sm text-xs sm:text-sm whitespace-nowrap"
            >
              <Link to="/">Home</Link>
            </Button>
            <Button
              asChild
              variant="ghost"
              className="bg-blue-900/50 hover:bg-blue-900/70 text-white border border-blue-400/30 backdrop-blur-sm text-xs sm:text-sm whitespace-nowrap"
            >
              <Link to="/login">Login</Link>
            </Button>
          </div>
        )}
        <div className="flex flex-col items-center w-full mx-auto px-4 py-2">
          <Routes>
            <Route path="/" element={<HomePage />} />

            <Route
              path="/projects"
              element={
                <ProtectedRoute>
                  <Projects />
                </ProtectedRoute>
              }
            />
            <Route
              path="/projects/:id"
              element={
                <ProtectedRoute>
                  <ProjectRoleProvider>
                    <ProjectSingle id={projectId} />
                  </ProjectRoleProvider>
                </ProtectedRoute>
              }
            />
            <Route
              path="/add"
              element={
                <ProtectedRoute>
                  <NewProjectForm />
                </ProtectedRoute>
              }
            />

            <Route path="/login" element={<LoginForm />} />
            <Route path="/register" element={<SignUpForm />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </div>
    </>
  )
}

export default AppContent
