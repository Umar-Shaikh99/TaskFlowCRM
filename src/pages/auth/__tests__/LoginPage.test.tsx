import { renderWithProviders, screen, fireEvent, waitFor } from '../../../test/utils'
import { LoginPage } from '../LoginPage'
import { describe, it, expect, vi } from 'vitest'
import * as authSlice from '../../../store/slices/authSlice'

// Mock the loginUser thunk action
vi.mock('../../../store/slices/authSlice', async (importOriginal) => {
  const actual = (await importOriginal()) as any
  return {
    ...actual,
    loginUser: vi.fn(() => ({
      type: 'auth/loginUser/fulfilled',
      payload: {
        user: { id: '1', name: 'Admin User', email: 'admin@test.com', role: 'ADMIN' },
        token: 'mock-token',
        refreshToken: 'mock-refresh-token',
      },
    })),
  }
})

describe('LoginPage Component', () => {
  it('renders login form inputs and submit button', () => {
    renderWithProviders(<LoginPage />)

    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('displays validation errors on empty submission', async () => {
    renderWithProviders(<LoginPage />)

    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument()
    })
  })

  it('triggers login thunk action dispatch on valid submission', async () => {
    const loginMock = vi.spyOn(authSlice, 'loginUser')
    renderWithProviders(<LoginPage />)

    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: 'admin@test.com' },
    })
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'admin123' },
    })

    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(loginMock).toHaveBeenCalled()
    })
  })
})
