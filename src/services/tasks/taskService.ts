import { api } from '../api/axios'
import type { Task, CreateTaskInput, UpdateTaskInput } from '../../types/task'

export const taskService = {
  async getTasks(): Promise<Task[]> {
    const response = await api.get<Task[]>('/tasks')
    return response.data
  },

  async createTask(input: CreateTaskInput): Promise<Task> {
    const response = await api.post<Task>('/tasks', input)
    return response.data
  },

  async updateTask(id: string, input: UpdateTaskInput): Promise<Task> {
    const response = await api.patch<Task>(`/tasks/${id}`, input)
    return response.data
  },

  async deleteTask(id: string): Promise<void> {
    await api.delete(`/tasks/${id}`)
  },
}
