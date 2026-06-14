import { api } from '../api/axios'
import type { User } from '../../types/auth'
import type { CreateUserInput, UpdateUserInput } from '../../types/user'

export const userService = {
  async getUsers(): Promise<User[]> {
    const response = await api.get<User[]>('/users')
    return response.data
  },

  async getUserById(id: string): Promise<User> {
    const response = await api.get<User>(`/users/${id}`)
    return response.data
  },

  async createUser(input: CreateUserInput): Promise<User> {
    const response = await api.post<User>('/users', input)
    return response.data
  },

  async updateUser(id: string, input: UpdateUserInput): Promise<User> {
    const response = await api.patch<User>(`/users/${id}`, input)
    return response.data
  },

  async deleteUser(id: string): Promise<void> {
    await api.delete(`/users/${id}`)
  },
}
