export type UserRole = 'ADMIN' | 'MANAGER' | 'USER'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  avatarUrl?: string
  createdAt: string
}

export interface AuthState {
  currentUser: User | null
  token: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

export interface DecodedToken {
  sub: string
  email: string
  role: UserRole
  exp: number
}
