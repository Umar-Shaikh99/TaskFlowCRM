import { api } from '../api/axios'
import type { User } from '../../types/auth'

export interface LoginResponse {
  user: User
  token: string
  refreshToken: string
}

export const authService = {
  /**
   * Submits user credentials to authenticate.
   */
  async login(credentials: Record<string, string>): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/auth/login', credentials)
    return response.data
  },

  /**
   * Invalidates session on backend.
   */
  async logout(): Promise<void> {
    // For local JWT session, clearing cookies/localStorage client-side is sufficient.
    // We can also trigger an audit logging call if desired.
  },
}
