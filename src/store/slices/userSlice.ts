import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { UserState, CreateUserInput, UpdateUserInput } from '../../types/user'
import type { User } from '../../types/auth'
import { userService } from '../../services/users/userService'

export const fetchUsers = createAsyncThunk('users/fetchUsers', async (_, { rejectWithValue }) => {
  try {
    const response = await userService.getUsers()
    return response
  } catch (err: any) {
    const message = err.response?.data?.message || 'Failed to fetch users'
    return rejectWithValue(message)
  }
})

export const createUser = createAsyncThunk(
  'users/createUser',
  async (input: CreateUserInput, { rejectWithValue }) => {
    try {
      // Add standard createdAt and default ACTIVE status for JSON server
      const seedInput = {
        ...input,
        status: 'ACTIVE' as const,
        createdAt: new Date().toISOString().split('T')[0],
      }
      const response = await userService.createUser(seedInput)
      return response
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to create user'
      return rejectWithValue(message)
    }
  }
)

export const updateUser = createAsyncThunk(
  'users/updateUser',
  async ({ id, input }: { id: string; input: UpdateUserInput }, { rejectWithValue }) => {
    try {
      const response = await userService.updateUser(id, input)
      return response
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to update user'
      return rejectWithValue(message)
    }
  }
)

export const deleteUser = createAsyncThunk(
  'users/deleteUser',
  async (id: string, { rejectWithValue }) => {
    try {
      await userService.deleteUser(id)
      return id
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to delete user'
      return rejectWithValue(message)
    }
  }
)

const initialState: UserState = {
  users: [],
  selectedUser: null,
  isLoading: false,
  error: null,
  rollbackCache: {},
}

const userSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    setSelectedUser(state, action: PayloadAction<User | null>) {
      state.selectedUser = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchUsers
      .addCase(fetchUsers.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.isLoading = false
        state.users = action.payload
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // createUser
      .addCase(createUser.pending, (state, action) => {
        state.isLoading = true
        state.error = null
        // Optimistic add
        const tempUser = {
          id: `temp-${action.meta.requestId}`,
          ...action.meta.arg,
          status: 'ACTIVE' as const,
          createdAt: new Date().toISOString().split('T')[0],
        }
        state.users.push(tempUser)
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.isLoading = false
        // Remove temp and add real
        state.users = state.users.filter((u) => u.id !== `temp-${action.meta.requestId}`)
        state.users.push(action.payload)
      })
      .addCase(createUser.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
        // Remove temp
        state.users = state.users.filter((u) => u.id !== `temp-${action.meta.requestId}`)
      })
      // updateUser
      .addCase(updateUser.pending, (state, action) => {
        state.isLoading = true
        state.error = null
        const user = state.users.find((u) => u.id === action.meta.arg.id)
        if (user) {
          if (!state.rollbackCache) state.rollbackCache = {}
          state.rollbackCache[action.meta.requestId] = { ...user }
          // Apply updates optimistically
          Object.assign(user, action.meta.arg.input)
        }
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.isLoading = false
        if (state.rollbackCache) {
          delete state.rollbackCache[action.meta.requestId]
        }
        const index = state.users.findIndex((u) => u.id === action.payload.id)
        if (index !== -1) {
          state.users[index] = action.payload
        }
        if (state.selectedUser?.id === action.payload.id) {
          state.selectedUser = action.payload
        }
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
        if (state.rollbackCache && state.rollbackCache[action.meta.requestId]) {
          const originalUser = state.rollbackCache[action.meta.requestId]
          const index = state.users.findIndex((u) => u.id === originalUser.id)
          if (index !== -1) {
            state.users[index] = originalUser
          }
          delete state.rollbackCache[action.meta.requestId]
        }
      })
      // deleteUser
      .addCase(deleteUser.pending, (state, action) => {
        state.isLoading = true
        state.error = null
        const user = state.users.find((u) => u.id === action.meta.arg)
        if (user) {
          if (!state.rollbackCache) state.rollbackCache = {}
          state.rollbackCache[action.meta.requestId] = { ...user }
          state.users = state.users.filter((u) => u.id !== action.meta.arg)
        }
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.isLoading = false
        if (state.rollbackCache) {
          delete state.rollbackCache[action.meta.requestId]
        }
        if (state.selectedUser?.id === action.payload) {
          state.selectedUser = null
        }
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
        if (state.rollbackCache && state.rollbackCache[action.meta.requestId]) {
          const originalUser = state.rollbackCache[action.meta.requestId]
          state.users.push(originalUser)
          delete state.rollbackCache[action.meta.requestId]
        }
      })
  },
})

export const { setSelectedUser } = userSlice.actions
export default userSlice.reducer
