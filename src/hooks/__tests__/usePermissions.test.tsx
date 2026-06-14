import React from 'react'
import { renderWithProviders } from '../../test/utils'
import { usePermissions } from '../usePermissions'
import { describe, it, expect } from 'vitest'

// Helper component to test hooks
const TestHookComponent: React.FC<{
  onTest: (utils: ReturnType<typeof usePermissions>) => void
}> = ({ onTest }) => {
  const permissions = usePermissions()
  onTest(permissions)
  return null
}

describe('usePermissions Hook', () => {
  it('allows all permissions for ADMIN role', () => {
    let result: ReturnType<typeof usePermissions> | null = null

    renderWithProviders(
      <TestHookComponent
        onTest={(res) => {
          result = res
        }}
      />,
      {
        preloadedState: {
          auth: {
            currentUser: { id: '1', name: 'Admin User', role: 'ADMIN' },
            isAuthenticated: true,
          },
        },
      }
    )

    expect(result!.can('tasks:create')).toBe(true)
    expect(result!.can('tasks:delete')).toBe(true)
    expect(result!.can('users:manage')).toBe(true)
  })

  it('restricts USER role to settings view only by default', () => {
    let result: ReturnType<typeof usePermissions> | null = null

    renderWithProviders(
      <TestHookComponent
        onTest={(res) => {
          result = res
        }}
      />,
      {
        preloadedState: {
          auth: {
            currentUser: { id: '3', name: 'Regular User', role: 'USER' },
            isAuthenticated: true,
          },
        },
      }
    )

    expect(result!.can('tasks:create')).toBe(false)
    expect(result!.can('tasks:delete')).toBe(false)
    expect(result!.can('users:manage')).toBe(false)
    expect(result!.can('settings:view')).toBe(true)
  })

  it('allows USER role tasks:edit override if they are the assignee', () => {
    let result: ReturnType<typeof usePermissions> | null = null

    renderWithProviders(
      <TestHookComponent
        onTest={(res) => {
          result = res
        }}
      />,
      {
        preloadedState: {
          auth: {
            currentUser: { id: '3', name: 'Regular User', role: 'USER' },
            isAuthenticated: true,
          },
        },
      }
    )

    // User is assignee ('3')
    expect(result!.can('tasks:edit', '3')).toBe(true)
    // User is NOT assignee ('4')
    expect(result!.can('tasks:edit', '4')).toBe(false)
  })
})
