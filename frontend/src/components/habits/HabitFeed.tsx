import React from 'react'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { setFilter } from '../../store/habitsSlice'
import { useGetFeedHabitsQuery } from '../../store/api'
import { drives } from '../../constants/drives'
import type { DriveType } from '../../types'
import HabitCard from './HabitCard'

type FilterValue = 'all' | 'daily' | 'weekly' | DriveType

interface FilterTab {
  value: FilterValue
  label: string
  color?: string
}

const staticTabs: FilterTab[] = [
  { value: 'all', label: '全部' },
  { value: 'daily', label: '每日' },
  { value: 'weekly', label: '每週' },
]

const HabitFeed = (): React.JSX.Element => {
  const dispatch = useAppDispatch()
  const { data: habits = [], isLoading } = useGetFeedHabitsQuery()
  const { filter } = useAppSelector(state => state.habits)

  const driveTabs: FilterTab[] = drives.map(d => ({
    value: d.id as FilterValue,
    label: d.chineseName,
    color: d.color,
  }))

  const allTabs = [...staticTabs, ...driveTabs]

  const filteredHabits = habits.filter(h => {
    if (filter === 'all') return true
    if (filter === 'daily') return h.frequency === 'daily'
    if (filter === 'weekly') return h.frequency === 'weekly'
    return h.driveType === filter
  })

  const completedCount = filteredHabits.filter(h => h.completedToday).length
  const totalCount = filteredHabits.length
  const overallRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  return (
    <div>
      {/* Header */}
      <div className="sticky top-0 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800 z-10">
        {/* Progress indicator */}
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <h2 className="text-white font-bold text-lg">習慣動態</h2>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-emerald-400 font-semibold">{completedCount}</span>
            <span className="text-zinc-600">/</span>
            <span className="text-zinc-400">{totalCount} 今日完成</span>
            <span className="text-zinc-600 text-xs">({overallRate}%)</span>
          </div>
        </div>

        {/* Today's progress bar */}
        <div className="px-4 pb-3">
          <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-linear-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-500"
              style={{ width: `${overallRate}%` }}
            />
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-1 px-3 pb-3 overflow-x-auto">
          {allTabs.map(tab => (
            <button
              key={String(tab.value)}
              onClick={() => dispatch(setFilter(tab.value))}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer ${
                filter === tab.value
                  ? tab.color
                    ? `${tab.color} bg-zinc-800 border border-zinc-600`
                    : 'text-white bg-zinc-800 border border-zinc-600'
                  : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900 border border-transparent'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Habit list */}
      <div>
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <svg className="animate-spin w-6 h-6 text-zinc-500" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        ) : filteredHabits.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-8">
            <div className="text-6xl mb-4">🌱</div>
            <h3 className="text-white font-semibold text-lg mb-2">尚無習慣</h3>
            <p className="text-zinc-500 text-sm">
              {filter === 'all'
                ? '開始建立你的第一個習慣吧！'
                : '此分類下尚無習慣，試試切換到其他分類。'}
            </p>
          </div>
        ) : (
          filteredHabits.map(habit => (
            <HabitCard key={habit.id} habit={habit} />
          ))
        )}
      </div>
    </div>
  )
}

export default HabitFeed
