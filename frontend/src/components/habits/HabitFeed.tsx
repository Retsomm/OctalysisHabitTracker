import React from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { setFilter } from '@/store/habitsSlice'
import { useGetFeedHabitsQuery } from '@/store/api'
import { drives } from '@/constants/drives'
import type { DriveType } from '@/types'
import HabitCard from './HabitCard'
import { HabitFeedSkeleton } from '@/components/common/SkeletonCard'

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
  const { data: habits, isLoading, isFetching } = useGetFeedHabitsQuery()
  const { filter } = useAppSelector(state => state.habits)

  const habitList = habits ?? []
  const showSkeleton = isLoading && !habits

  const driveTabs: FilterTab[] = drives.map(d => ({
    value: d.id as FilterValue,
    label: d.chineseName,
    color: d.color,
  }))

  const allTabs = [...staticTabs, ...driveTabs]

  const filteredHabits = habitList.filter(h => {
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
      {/* Sticky filter header */}
      <div className="sticky top-0 bg-ivory/90 backdrop-blur-md border-b border-line-2 z-10">
        <div className="flex items-center justify-between px-6 pt-4 pb-2">
          <div>
            <div className="font-mono text-sm text-ink-4 tracking-[0.14em] uppercase">習慣動態</div>
            <div className="font-serif text-[24px] text-ink-1 mt-0.5">
              {totalCount} 項 · 今日 <em className="italic text-accent">{overallRate}% 完成</em>
            </div>
          </div>
          <div className="text-right">
            <div className="font-mono text-[12px] text-ink-4">{completedCount} / {totalCount}</div>
            <div className="h-[3px] bg-line-2 rounded-full overflow-hidden w-20 mt-1.5">
              <div
                className="h-full bg-leaf rounded-full transition-all duration-500"
                style={{ width: `${overallRate}%` }}
              />
            </div>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-1 px-5 pb-3 overflow-x-auto scrollbar-none">
          {allTabs.map(tab => (
            <button
              key={String(tab.value)}
              onClick={() => dispatch(setFilter(tab.value))}
              className={`shrink-0 px-3 py-1.5 rounded-[8px] text-sm font-medium transition-all duration-200 cursor-pointer font-mono ${
                filter === tab.value
                  ? 'bg-ink-1 text-paper'
                  : 'text-ink-3 hover:text-ink-1 hover:bg-line-2'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Habit list */}
      <div>
        {showSkeleton ? (
          <HabitFeedSkeleton />
        ) : filteredHabits.length === 0 && !isFetching ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-8 border border-dashed border-line m-6 rounded-[14px] bg-paper">
            <div className="font-serif text-[60px] leading-[1] text-accent italic">∅</div>
            <div className="font-serif text-[26px] text-ink-1 mt-3.5">尚無習慣</div>
            <p className="text-ink-3 text-sm mt-2 max-w-xs leading-relaxed">
              {filter === 'all'
                ? '從一件微小的行動開始。譬如：每天清晨閱讀三分鐘，或晚餐後散步十步。'
                : '此分類下尚無習慣，試試切換到其他分類。'}
            </p>
            {filter === 'all' && (
              <div className="flex gap-2 flex-wrap justify-center mt-4">
                {['🍵 清晨一杯水', '📖 三分鐘閱讀', '🚶 散步十步', '✍️ 寫下一句話'].map(chip => (
                  <span key={chip} className="text-sm px-3 py-1.5 rounded-full border border-line bg-card text-ink-3 font-mono">{chip}</span>
                ))}
              </div>
            )}
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
