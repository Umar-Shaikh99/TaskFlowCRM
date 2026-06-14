import { renderWithProviders, screen, fireEvent } from '../../../test/utils'
import { UsersPage } from '../UsersPage'
import { describe, it, expect } from 'vitest'

const preloadedState = {
  users: {
    users: [
      {
        id: '1',
        name: 'Tony Stark',
        email: 'tony@stark.com',
        role: 'ADMIN' as const,
        status: 'ACTIVE' as const,
        createdAt: '2026-06-14',
      },
      {
        id: '2',
        name: 'Bruce Banner',
        email: 'bruce@banner.com',
        role: 'USER' as const,
        status: 'ACTIVE' as const,
        createdAt: '2026-06-14',
      },
    ],
    isLoading: false,
    error: null,
  },
  auth: {
    currentUser: {
      id: '1',
      name: 'Tony Stark',
      email: 'tony@stark.com',
      role: 'ADMIN' as const,
      createdAt: '2026-06-14',
    },
    isAuthenticated: true,
    token: 'mock',
    refreshToken: 'mock',
    isLoading: false,
    error: null,
  },
}

describe('UsersPage Component', () => {
  it('renders a list of users from the store state', () => {
    renderWithProviders(<UsersPage />, { preloadedState })

    expect(screen.getByText('Tony Stark')).toBeInTheDocument()
    expect(screen.getByText('Bruce Banner')).toBeInTheDocument()
    expect(screen.getByText('tony@stark.com')).toBeInTheDocument()
    expect(screen.getByText('bruce@banner.com')).toBeInTheDocument()
  })

  it('filters the list based on search queries', () => {
    renderWithProviders(<UsersPage />, { preloadedState })

    const searchInput = screen.getByPlaceholderText(/search by name or email/i)
    fireEvent.change(searchInput, { target: { value: 'Bruce' } })

    expect(screen.getByText('Bruce Banner')).toBeInTheDocument()
    expect(screen.queryByText('Tony Stark')).not.toBeInTheDocument()
  })

  it('opens add user modal dialog upon clicking Add User button', () => {
    renderWithProviders(<UsersPage />, { preloadedState })

    fireEvent.click(screen.getByRole('button', { name: /add user/i }))

    expect(screen.getByRole('heading', { name: /add new user/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument()
  })
})
