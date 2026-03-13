import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { DriveType } from '../types'

type FilterType = 'all' | 'daily' | 'weekly' | DriveType

interface HabitsState {
  selectedDrive: DriveType | null
  filter: FilterType
}

const initialState: HabitsState = {
  selectedDrive: null,
  filter: 'all',
}

const habitsSlice = createSlice({
  name: 'habits',
  initialState,
  reducers: {
    setFilter: (state, action: PayloadAction<FilterType>) => {
      state.filter = action.payload
    },
    setSelectedDrive: (state, action: PayloadAction<DriveType | null>) => {
      state.selectedDrive = action.payload
    },
  },
})

export const { setFilter, setSelectedDrive } = habitsSlice.actions
export default habitsSlice.reducer
