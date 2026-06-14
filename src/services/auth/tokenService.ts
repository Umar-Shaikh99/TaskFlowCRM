/**
 * Token Service Abstraction (Phase 2)
 *
 * Manages access and refresh tokens inside browser localStorage.
 * Includes helpers to decode base64 mock JWT payloads.
 */

export const tokenService = {
  getToken(): string | null {
    return localStorage.getItem('taskflow_access_token')
  },

  setToken(token: string): void {
    localStorage.setItem('taskflow_access_token', token)
  },

  removeToken(): void {
    localStorage.removeItem('taskflow_access_token')
  },

  getRefreshToken(): string | null {
    return localStorage.getItem('taskflow_refresh_token')
  },

  setRefreshToken(token: string): void {
    localStorage.setItem('taskflow_refresh_token', token)
  },

  removeRefreshToken(): void {
    localStorage.removeItem('taskflow_refresh_token')
  },

  clearTokens(): void {
    localStorage.removeItem('taskflow_access_token')
    localStorage.removeItem('taskflow_refresh_token')
  },

  isValidToken(token: string): boolean {
    if (!token) return false
    try {
      const payload = JSON.parse(atob(token))
      return payload.exp > Date.now()
    } catch {
      return false
    }
  },

  getUserFromToken(token: string): {
    id: string
    name: string
    email: string
    role: 'ADMIN' | 'MANAGER' | 'USER'
    createdAt: string
  } | null {
    if (!token) return null
    try {
      const payload = JSON.parse(atob(token))
      return {
        id: payload.sub,
        name: payload.name,
        email: payload.email,
        role: payload.role,
        createdAt: payload.createdAt || new Date().toISOString().split('T')[0],
      }
    } catch {
      return null
    }
  },
}
