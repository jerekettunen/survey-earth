import { ThemeProvider } from './components/Providers/ThemeProvider'
import { SidebarProvider } from '@/components/ui/sidebar'
import { AuthProvider } from './components/Providers/AuthProvider'
import { ToastProvider } from './components/Providers/ToastProvider'
import { Toaster } from '@/components/ui/sonner'
import AppContent from './components/AppContent'

import './App.css'

const App = () => {
  return (
    <ThemeProvider defaultTheme="system" storageKey="earth-client-theme">
      <AuthProvider>
        <ToastProvider>
          <SidebarProvider
            defaultOpen={false}
            style={{
              '--sidebar-width': '16rem',
              '--sidebar-width-icon': '3rem',
              '--content-max-width': '100%',
            }}
          >
            <AppContent />
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
          </SidebarProvider>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
