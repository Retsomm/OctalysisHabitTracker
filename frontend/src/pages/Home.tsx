import React from 'react'
import CreateHabit from '../components/habits/CreateHabit'
import HabitFeed from '../components/habits/HabitFeed'
import { drives } from '../constants/drives'
import { useGetRecentHabitsQuery } from '../store/api'

const Home = (): React.JSX.Element => {
  const { data: recentHabits = [] } = useGetRecentHabitsQuery()
  return (
    <div>
      {/* Page header */}
      <div className="sticky top-0 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800 z-20 px-4 py-3">
        <h1 className="text-white font-bold text-xl">首頁</h1>
      </div>

      {/* Create Habit */}
      <CreateHabit />

      {/* Recent Activity Banner */}
      <div className="border-b border-zinc-800 px-4 py-3 bg-zinc-900/30 min-w-0">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">最新動態</span>
          <div className="flex-1 h-px bg-zinc-800" />
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-emerald-400 text-xs">直播中</span>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-none">
          {recentHabits.length === 0 && (
            <span className="text-zinc-600 text-xs py-1">尚無動態，新增第一個習慣後就會出現！</span>
          )}
          {recentHabits.map(item => {
            const drive = drives.find(d => d.id === item.driveType)
            return (
              <div
                key={item.id}
                className="flex-shrink-0 flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 hover:border-zinc-700 transition-colors cursor-pointer"
              >
                <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center shrink-0 overflow-hidden text-base">
                  {item.avatar && (item.avatar.includes('http') || item.avatar.startsWith('data:')) ? (
                    <img src={item.avatar} alt={item.displayName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <span>{(item.avatar && item.avatar.length <= 10) ? item.avatar : item.displayName?.charAt(0) || '?'}</span>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <span className="text-white text-xs font-semibold">{item.displayName}</span>
                    <span className="text-zinc-500 text-xs">新增了習慣</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {drive && (
                      <span className={`text-xs ${drive.color}`}>●</span>
                    )}
                    <span className="text-zinc-400 text-xs">{item.habitTitle}</span>
                    <span className="text-zinc-600 text-xs">{item.frequency === 'daily' ? '每日' : '每週'}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Habit Feed */}
      <HabitFeed />
    </div>
  )
}

export default Home
