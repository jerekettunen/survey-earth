import { useTheme } from '@/components/Providers/ThemeProvider'
import { Moon, Sun } from 'lucide-react'

import { SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar'

const ModeToggleSide = () => {
  const { theme, setTheme } = useTheme()

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      >
        {theme === 'dark' ? (
          <Sun className="h-4 w-4 mr-2" />
        ) : (
          <Moon className="h-4 w-4 mr-2" />
        )}
        <span>Toggle {theme === 'dark' ? 'Light' : 'Dark'}</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}
export default ModeToggleSide
