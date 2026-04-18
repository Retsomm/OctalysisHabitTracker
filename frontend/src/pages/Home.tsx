import React from 'react'
import CreateHabit from '@/components/habits/CreateHabit'
import HabitFeed from '@/components/habits/HabitFeed'
import { drives } from '@/constants/drives'
import { useGetRecentHabitsQuery } from '@/store/api'

const Home = (): React.JSX.Element => {
  const { data: recentHabits = [] } = useGetRecentHabitsQuery()
  const latestRecentHabits = recentHabits.slice(0, 5)

  const now = new Date()
  const weekNumber = Math.ceil((now.getDate() + new Date(now.getFullYear(), now.getMonth(), 1).getDay()) / 7)
  const dayNames = ['週日', '週一', '週二', '週三', '週四', '週五', '週六']
  const dayName = dayNames[now.getDay()]

  return (
    <div>
      {/* Page header */}
      <div className="sticky top-0 bg-ivory/90 backdrop-blur-md border-b border-line-2 z-20 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="font-mono text-[13px] text-ink-4 tracking-[0.14em] uppercase flex items-center gap-2">
            <span className="text-accent">●</span>
            第 {weekNumber} 週 · {dayName}
          </div>
        </div>
        <h1 className="font-serif text-[32px] leading-[1.02] tracking-[-0.015em] text-ink-1 mt-5">
          今天想建立<em className="italic text-accent">什麼習慣</em>？
        </h1>
      </div>

      {/* Create Habit */}
      <CreateHabit />

      {/* Recent Activity */}
      <div className="border-b border-line px-6 py-4 bg-paper/60">
        <div className="flex items-center gap-2 mb-3">
          <span className="font-mono text-sm text-ink-4 tracking-[0.14em] uppercase">最新動態</span>
          <div className="flex-1 h-px bg-line-2" />
          <div className="w-1.5 h-1.5 rounded-full bg-leaf animate-pulse" />
          <span className="font-mono text-sm text-leaf tracking-[0.04em]">直播中</span>
        </div>
        <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-none">
          {latestRecentHabits.length === 0 && (
            <span className="text-ink-4 text-sm py-1 font-mono">尚無動態，新增第一個習慣後就會出現！</span>
          )}
          {latestRecentHabits.map(item => {
            const drive = drives.find(d => d.id === item.driveType)
            return (
              <div
                key={item.id}
                className="flex-shrink-0 flex items-center gap-2 bg-card border border-line rounded-[10px] px-3 py-2 hover:border-ink-4/40 transition-colors cursor-pointer"
              >
                <div className="w-6 h-6 rounded-full bg-line flex items-center justify-center shrink-0 overflow-hidden text-sm">
                  {item.avatar && (item.avatar.includes('http') || item.avatar.startsWith('data:')) ? (
                    <img src={item.avatar} alt={item.displayName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <span className="font-serif text-sm text-ink-1">
                      {(item.avatar && item.avatar.length <= 10) ? item.avatar : item.displayName?.charAt(0) || '?'}
                    </span>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <span className="text-ink-1 text-sm font-medium">{item.displayName}</span>
                    <span className="text-ink-4 text-sm">新增了習慣</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {drive && (
                      <span className={`text-sm ${drive.color}`}>●</span>
                    )}
                    <span className="text-ink-3 text-sm">{item.habitTitle}</span>
                    <span className="text-ink-4 text-sm">{item.frequency === 'daily' ? '每日' : '每週'}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Divider ornament */}
      <div className="flex items-center gap-3.5 mx-6 my-5 text-line">
        <div className="flex-1 h-px bg-line" />
        <span className="font-serif text-[18px] italic text-ink-4">§</span>
        <div className="flex-1 h-px bg-line" />
      </div>

      {/* Habit Feed */}
      <HabitFeed />
    </div>
  )
}

export default Home
