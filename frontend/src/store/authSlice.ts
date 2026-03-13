import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { AuthUser } from '../types'

interface AuthState {
  isAuthenticated: boolean
  user: AuthUser | null
  token: string | null
}

const savedToken = localStorage.getItem('auth_token')
const savedUser = localStorage.getItem('auth_user')

const initialState: AuthState = {
  isAuthenticated: !!savedToken,
  user: savedUser ? JSON.parse(savedUser) as AuthUser : null,
  token: savedToken,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess: (state, action: PayloadAction<{ user: AuthUser; token: string }>) => {
      state.isAuthenticated = true
      state.user = action.payload.user
      state.token = action.payload.token
      localStorage.setItem('auth_token', action.payload.token)
      localStorage.setItem('auth_user', JSON.stringify(action.payload.user))
    },
    logout: (state) => {
      state.isAuthenticated = false
      state.user = null
      state.token = null
      localStorage.removeItem('auth_token')
      localStorage.removeItem('auth_user')
    },
  },
})

export const { loginSuccess, logout } = authSlice.actions
export default authSlice.reducer
