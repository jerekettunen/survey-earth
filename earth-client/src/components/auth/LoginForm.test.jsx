import { describe, it, expect, vi } from 'vitest'
import { renderWithProviders, screen, userEvent } from '@/test/testUtils'
import { LOGIN } from '@/queries'
import LoginForm from './LoginForm'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

describe('LoginForm', () => {
  beforeEach(() => {
    mockNavigate.mockReset()
  })

  it('renders the form correctly', () => {
    renderWithProviders(<LoginForm />)

    expect(screen.getByTestId('login-heading')).toHaveTextContent(/login/i)
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument()
  })

  it('validates form inputs', async () => {
    const user = userEvent.setup()
    renderWithProviders(<LoginForm />)

    await user.click(screen.getByRole('button', { name: /login/i }))

    expect(
      await screen.findByText(/Invalid email address/i)
    ).toBeInTheDocument()
  })

  it('submits the form with valid data', async () => {
    const user = userEvent.setup()

    const mocks = [
      {
        request: {
          query: LOGIN,
          variables: { username: 'test@example.com', password: 'password123' },
        },
        result: {
          data: {
            login: { value: 'test-token' },
          },
        },
      },
    ]

    renderWithProviders(<LoginForm />, { mocks })

    await user.type(screen.getByLabelText(/username/i), 'test@example.com')
    await user.type(screen.getByLabelText(/password/i), 'password123')
    await user.click(screen.getByRole('button', { name: /login/i }))

    // Check that we're redirected after successful login
    await vi.waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/projects')
    })
  })
})
