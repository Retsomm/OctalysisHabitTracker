import { configureStore } from '@reduxjs/toolkit'
import habitsReducer from './habitsSlice'
import authReducer from './authSlice'
import { api } from './api'

export const store = configureStore({
  reducer: {
    habits: habitsReducer,
    auth: authReducer,
    [api.reducerPath]: api.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
