import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { AuthState } from '../../types/auth'
import { authService } from '../../services/auth/authService'
import { tokenService } from '../../services/auth/tokenService'
import { updateUser } from './userSlice'

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials: Record<string, string>, { rejectWithValue }) => {
    try {
      const response = await authService.login(credentials)
      tokenService.setToken(response.token)
      tokenService.setRefreshToken(response.refreshToken)
      return response
    } catch (err: any) {
      const message = err.response?.data?.message || 'Login failed'
      return rejectWithValue(message)
    }
  }
)

const initialState: AuthState = {
  currentUser: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      tokenService.clearTokens()
      state.currentUser = null
      state.token = null
      state.refreshToken = null
      state.isAuthenticated = false
      state.error = null
    },
    clearError(state) {
      state.error = null
    },
    rehydrateAuth(state) {
      const token = tokenService.getToken()
      if (token && tokenService.isValidToken(token)) {
        const user = tokenService.getUserFromToken(token)
        if (user) {
          state.currentUser = user
          state.token = token
          state.refreshToken = tokenService.getRefreshToken()
          state.isAuthenticated = true
        } else {
          tokenService.clearTokens()
        }
      } else {
        tokenService.clearTokens()
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false
        state.currentUser = action.payload.user
        state.token = action.payload.token
        state.refreshToken = action.payload.refreshToken
        state.isAuthenticated = true
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        if (state.currentUser && state.currentUser.id === action.payload.id) {
          state.currentUser = {
            ...state.currentUser,
            name: action.payload.name,
            email: action.payload.email,
            role: action.payload.role,
          }
        }
      })
  },
})

export const { logout, clearError, rehydrateAuth } = authSlice.actions
export default authSlice.reducer
