import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAppSelector } from '../store/hooks'
import type { UserRole } from '../types/auth'

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: UserRole[]
}

/**
 * ProtectedRoute Component (Phase 1 Guard Shell)
 *
 * Enforces authentication and authorization scopes before rendering child routes.
 *
 * TODO: Implement token verification, JWT exp checks, and dynamic redirection in Phase 2.
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const location = useLocation()
  const { isAuthenticated, currentUser } = useAppSelector((state) => state.auth)

  // TODO: Replace this static check with active token validation and renewal in Phase 2.
  // Note: To easily inspect dashboard layouts during Phase 1 development, you can
  // temporarily modify `initialState.isAuthenticated = true` in src/store/slices/authSlice.ts
  // or mock a currentUser.
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Role checking validation
  if (allowedRoles && currentUser && !allowedRoles.includes(currentUser.role)) {
    return <Navigate to="/not-found" replace />
  }

  return <>{children}</>
}
