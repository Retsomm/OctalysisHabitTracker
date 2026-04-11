import { useDispatch, useSelector } from 'react-redux'
import type { RootState, AppDispatch } from './index'
import { api } from './api'

export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector = <T>(selector: (state: RootState) => T): T =>
  useSelector(selector)

export const useIsAnyFetching = (): boolean => {
  return useAppSelector(state => {
    const queries = state[api.reducerPath]?.queries
    if (!queries) return false
    return Object.values(queries).some(
      (query) => query && (query as { status: string }).status === 'pending'
    )
  })
}
