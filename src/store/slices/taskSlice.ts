import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { TaskState, Task, CreateTaskInput, UpdateTaskInput } from '../../types/task'
import { taskService } from '../../services/tasks/taskService'
import type { RootState } from '../store'

export const fetchTasks = createAsyncThunk('tasks/fetchTasks', async (_, { rejectWithValue }) => {
  try {
    const response = await taskService.getTasks()
    return response
  } catch (err: any) {
    const message = err.response?.data?.message || 'Failed to fetch tasks'
    return rejectWithValue(message)
  }
})

export const createTask = createAsyncThunk(
  'tasks/createTask',
  async (input: CreateTaskInput, { rejectWithValue }) => {
    try {
      // Add standard createdAt and creatorId default properties for JSON server database
      const seedInput = {
        ...input,
        creatorId: '1', // Default to current candidate user id
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
      }
      const response = await taskService.createTask(seedInput)
      return response
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to create task'
      return rejectWithValue(message)
    }
  }
)

export const updateTask = createAsyncThunk(
  'tasks/updateTask',
  async ({ id, input }: { id: string; input: UpdateTaskInput }, { rejectWithValue }) => {
    try {
      const response = await taskService.updateTask(id, {
        ...input,
        updatedAt: new Date().toISOString().split('T')[0],
      } as any)
      return response
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to update task'
      return rejectWithValue(message)
    }
  }
)

export const deleteTask = createAsyncThunk(
  'tasks/deleteTask',
  async (id: string, { rejectWithValue }) => {
    try {
      await taskService.deleteTask(id)
      return id
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to delete task'
      return rejectWithValue(message)
    }
  }
)

const initialState: TaskState = {
  tasks: [],
  selectedTask: null,
  isLoading: false,
  error: null,
  rollbackCache: {},
}

const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    setSelectedTask(state, action: PayloadAction<Task | null>) {
      state.selectedTask = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchTasks
      .addCase(fetchTasks.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.isLoading = false
        state.tasks = action.payload.map((t: Task) => ({
          ...t,
          id: String(t.id),
        }))
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // createTask
      .addCase(createTask.pending, (state, action) => {
        state.isLoading = true
        state.error = null
        // Optimistic add
        const tempTask = {
          id: `temp-${action.meta.requestId}`,
          ...action.meta.arg,
          creatorId: '1',
          createdAt: new Date().toISOString().split('T')[0],
          updatedAt: new Date().toISOString().split('T')[0],
        }
        state.tasks.push(tempTask)
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.isLoading = false
        // Remove temp and add real
        state.tasks = state.tasks.filter((t) => t.id !== `temp-${action.meta.requestId}`)
        state.tasks.push({
          ...action.payload,
          id: String(action.payload.id),
        })
      })
      .addCase(createTask.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
        // Remove temp
        state.tasks = state.tasks.filter((t) => t.id !== `temp-${action.meta.requestId}`)
      })
      // updateTask
      .addCase(updateTask.pending, (state, action) => {
        state.isLoading = true
        state.error = null
        const task = state.tasks.find((t) => String(t.id) === String(action.meta.arg.id))
        if (task) {
          if (!state.rollbackCache) state.rollbackCache = {}
          state.rollbackCache[action.meta.requestId] = { ...task }
          // Apply updates optimistically
          Object.assign(task, action.meta.arg.input)
        }
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        state.isLoading = false
        if (state.rollbackCache) {
          delete state.rollbackCache[action.meta.requestId]
        }
        const updatedTask = {
          ...action.payload,
          id: String(action.payload.id),
        }
        const index = state.tasks.findIndex((t) => String(t.id) === updatedTask.id)
        if (index !== -1) {
          state.tasks[index] = updatedTask
        }
        if (state.selectedTask && String(state.selectedTask.id) === updatedTask.id) {
          state.selectedTask = updatedTask
        }
      })
      .addCase(updateTask.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
        if (state.rollbackCache && state.rollbackCache[action.meta.requestId]) {
          const originalTask = state.rollbackCache[action.meta.requestId]
          const index = state.tasks.findIndex((t) => String(t.id) === String(originalTask.id))
          if (index !== -1) {
            state.tasks[index] = originalTask
          }
          delete state.rollbackCache[action.meta.requestId]
        }
      })
      // deleteTask
      .addCase(deleteTask.pending, (state, action) => {
        state.isLoading = true
        state.error = null
        const task = state.tasks.find((t) => String(t.id) === String(action.meta.arg))
        if (task) {
          if (!state.rollbackCache) state.rollbackCache = {}
          state.rollbackCache[action.meta.requestId] = { ...task }
          state.tasks = state.tasks.filter((t) => String(t.id) !== String(action.meta.arg))
        }
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.isLoading = false
        if (state.rollbackCache) {
          delete state.rollbackCache[action.meta.requestId]
        }
        if (state.selectedTask && String(state.selectedTask.id) === String(action.payload)) {
          state.selectedTask = null
        }
      })
      .addCase(deleteTask.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
        if (state.rollbackCache && state.rollbackCache[action.meta.requestId]) {
          const originalTask = state.rollbackCache[action.meta.requestId]
          state.tasks.push(originalTask)
          delete state.rollbackCache[action.meta.requestId]
        }
      })
  },
})

export const { setSelectedTask } = taskSlice.actions

export const selectTasks = (state: RootState) => state.tasks.tasks
export const selectUsersState = (state: RootState) => state.users.users

export const selectDashboardMetrics = createSelector(
  [selectTasks, selectUsersState],
  (tasks, users) => {
    const totalTasks = tasks.length
    const activeTasks = tasks.filter((t) => t.status !== 'DONE').length
    const completedTasks = tasks.filter((t) => t.status === 'DONE').length
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
    const totalUsers = users.length

    return {
      totalTasks,
      activeTasks,
      completedTasks,
      completionRate,
      totalUsers,
    }
  }
)

export default taskSlice.reducer
