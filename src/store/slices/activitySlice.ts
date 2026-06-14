import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { api } from '../../services/api/axios'

export interface Activity {
  id: string
  type: string
  description: string
  userId: string
  createdAt: string
}

export interface ActivityState {
  activities: Activity[]
  isLoading: boolean
  error: string | null
}

const initialState: ActivityState = {
  activities: [],
  isLoading: false,
  error: null,
}

export const fetchActivities = createAsyncThunk(
  'activities/fetchActivities',
  async (_, { rejectWithValue }) => {
    try {
      // JSON server sort activities descending by default
      const response = await api.get<Activity[]>('/activities?_sort=createdAt&_order=desc')
      return response.data
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to fetch activities'
      return rejectWithValue(message)
    }
  }
)

const activitySlice = createSlice({
  name: 'activities',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchActivities.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchActivities.fulfilled, (state, action) => {
        state.isLoading = false
        state.activities = action.payload
      })
      .addCase(fetchActivities.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
  },
})

export default activitySlice.reducer
