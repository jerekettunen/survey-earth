import React from 'react'
import { render } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { MockedProvider } from '@apollo/client/testing'
import { ThemeProvider } from '@/components/Providers/ThemeProvider'
import { AuthProvider } from '@/components/Providers/AuthProvider'
import { ToastProvider } from '@/components/Providers/ToastProvider'
import { SidebarProvider } from '@/components/ui/sidebar'

export function renderWithProviders(
  ui,
  {
    route = '/',
    mocks = [],
    authContext = { isAuthenticated: false },
    ...renderOptions
  } = {}
) {
  const Wrapper = ({ children }) => {
    return (
      <MockedProvider mocks={mocks} addTypename={false}>
        <BrowserRouter>
          <ThemeProvider defaultTheme="light">
            <AuthProvider initialState={authContext}>
              <ToastProvider>
                <SidebarProvider defaultOpen={false}>
                  {children}
                </SidebarProvider>
              </ToastProvider>
            </AuthProvider>
          </ThemeProvider>
        </BrowserRouter>
      </MockedProvider>
    )
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions })
}

// Re-export everything from testing-library
export * from '@testing-library/react'
export { userEvent } from '@testing-library/user-event'
