import { ThemeProvider } from './components/theme-provider'
import { SidebarProvider } from '@/components/ui/sidebar'
import AppContent from './components/AppContent'

import './App.css'

const App = () => {
  return (
    <ThemeProvider defaultTheme="system" storageKey="earth-client-theme">
      <SidebarProvider
        defaultOpen={false}
        style={{
          '--sidebar-width': '16rem',
          '--sidebar-width-icon': '3rem',
          '--content-max-width': '100%',
        }}
      >
        <AppContent />
      </SidebarProvider>
    </ThemeProvider>
  )
}

export default App
