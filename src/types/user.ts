import type { User } from './auth'

export interface UserState {
  users: User[]
  selectedUser: User | null
  isLoading: boolean
  error: string | null
  rollbackCache?: Record<string, any>
}

export interface CreateUserInput {
  name: string
  email: string
  role: 'ADMIN' | 'MANAGER' | 'USER'
  password?: string
  status?: 'ACTIVE' | 'INACTIVE'
}

export interface UpdateUserInput {
  name?: string
  role?: 'ADMIN' | 'MANAGER' | 'USER'
  avatarUrl?: string
  email?: string
  status?: 'ACTIVE' | 'INACTIVE'
  password?: string
}
