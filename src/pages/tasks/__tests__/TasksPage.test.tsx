import { renderWithProviders, screen, fireEvent } from '../../../test/utils'
import { TasksPage } from '../TasksPage'
import { describe, it, expect } from 'vitest'

const preloadedState = {
  tasks: {
    tasks: [
      {
        id: '101',
        title: 'Task One',
        description: 'First task description details.',
        status: 'TODO' as const,
        priority: 'MEDIUM' as const,
        dueDate: '2026-06-20',
        assignedTo: '1',
        creatorId: '1',
        createdAt: '2026-06-14',
        updatedAt: '2026-06-14',
      },
      {
        id: '102',
        title: 'Task Two',
        description: 'Second task description details.',
        status: 'IN_PROGRESS' as const,
        priority: 'HIGH' as const,
        dueDate: '2026-06-22',
        assignedTo: '2',
        creatorId: '1',
        createdAt: '2026-06-14',
        updatedAt: '2026-06-14',
      },
    ],
    isLoading: false,
    error: null,
  },
  users: {
    users: [
      {
        id: '1',
        name: 'Tony Stark',
        email: 'tony@stark.com',
        role: 'ADMIN' as const,
        createdAt: '2026-06-14',
      },
      {
        id: '2',
        name: 'Bruce Banner',
        email: 'bruce@banner.com',
        role: 'USER' as const,
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
  },
}

describe('TasksPage Kanban Board', () => {
  it('renders Kanban board columns and tasks in active status lists', () => {
    renderWithProviders(<TasksPage />, { preloadedState })

    expect(screen.getByText('Task One')).toBeInTheDocument()
    expect(screen.getByText('Task Two')).toBeInTheDocument()
    expect(screen.getByText('Tony Stark')).toBeInTheDocument()
    expect(screen.getByText('Bruce Banner')).toBeInTheDocument()
  })

  it('renders New Task button if user has permission to create tasks', () => {
    renderWithProviders(<TasksPage />, { preloadedState })

    const createBtn = screen.getByRole('button', { name: /new task/i })
    expect(createBtn).toBeInTheDocument()
  })

  it('opens task creation dialog upon click', () => {
    renderWithProviders(<TasksPage />, { preloadedState })

    fireEvent.click(screen.getByRole('button', { name: /new task/i }))

    expect(screen.getByRole('heading', { name: /create new task/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/task title/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/task description/i)).toBeInTheDocument()
  })
})
