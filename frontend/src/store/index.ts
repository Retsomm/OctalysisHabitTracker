import { configureStore, combineReducers } from '@reduxjs/toolkit'
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import habitsReducer from './habitsSlice'
import authReducer from './authSlice'
import { api } from './api'

const apiPersistConfig = {
  key: 'api',
  storage,
  whitelist: ['queries', 'provided'],
}

const rootReducer = combineReducers({
  habits: habitsReducer,
  auth: authReducer,
  [api.reducerPath]: persistReducer(apiPersistConfig, api.reducer),
})

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(api.middleware),
})

export const persistor = persistStore(store)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
