import React from 'react'
import { useState } from 'react'
import type { FeedHabit } from '../../types'
import { drives } from '../../constants/drives'
import { useToggleHabitMutation, useGetUserProfileQuery } from '../../store/api'
import StreakBadge from '../common/StreakBadge'
import { HeartIcon, ChatIcon, ShareIcon, CheckIcon, CircleIcon } from '../common/Icons'

interface HabitCardProps {
  habit: FeedHabit
}

const AvatarDisplay = ({ avatar, name, size = 'w-9 h-9' }: { avatar?: string; name?: string; size?: string }): React.JSX.Element => {
  const isImage = avatar?.includes('http') || avatar?.startsWith('data:')
  const isShortStr = avatar && avatar.length <= 10 && !isImage

  if (isImage) {
    return <img src={avatar} alt={name} className={`${size} rounded-full object-cover border border-zinc-700 shrink-0`} referrerPolicy="no-referrer" />
  }
  return (
    <div className={`${size} rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-lg shrink-0`}>
      {isShortStr ? avatar : (name?.charAt(0) || '?')}
    </div>
  )
}

const HabitCard = ({ habit }: HabitCardProps): React.JSX.Element => {
  const [toggleHabit] = useToggleHabitMutation()
  const { data: profile } = useGetUserProfileQuery()
  const drive = drives.find(d => d.id === habit.driveType)
  const [encouraged, setEncouraged] = useState(false)
  const [encourageCount, setEncourageCount] = useState(0)

  const isOwner = profile?.id === habit.userId

  const handleToggle = (): void => {
    void toggleHabit({ id: habit.id, completed: !habit.completedToday })
  }

  const handleEncourage = (): void => {
    setEncouraged(prev => !prev)
    setEncourageCount(prev => encouraged ? prev - 1 : prev + 1)
  }

  const borderColorMap: Record<number, string> = {
    1: 'border-violet-500',
    2: 'border-amber-500',
    3: 'border-emerald-500',
    4: 'border-blue-500',
    5: 'border-pink-500',
    6: 'border-orange-500',
    7: 'border-cyan-500',
    8: 'border-red-500',
  }

  const rateBarColorMap: Record<number, string> = {
    1: 'bg-violet-500',
    2: 'bg-amber-500',
    3: 'bg-emerald-500',
    4: 'bg-blue-500',
    5: 'bg-pink-500',
    6: 'bg-orange-500',
    7: 'bg-cyan-500',
    8: 'bg-red-500',
  }

  const leftBorderColor = borderColorMap[habit.driveType] ?? 'border-zinc-600'
  const rateBarColor = rateBarColorMap[habit.driveType] ?? 'bg-zinc-500'

  return (
    <article className="border-b border-zinc-800 hover:bg-zinc-900/40 transition-colors duration-200 cursor-pointer">
      <div className={`flex gap-0 border-l-4 ${leftBorderColor} mx-0`}>
        <div className="flex-1 px-4 py-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-2 mb-2 min-w-0">
            <div className="flex items-center gap-2 min-w-0">
              <AvatarDisplay avatar={habit.avatar} name={habit.displayName} />
              <div className="min-w-0">
                <span className="text-white font-semibold text-sm truncate">{habit.displayName}</span>
                <span className="text-zinc-500 text-xs ml-2 hidden sm:inline">{habit.username}</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              {drive && (
                <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${drive.color} ${drive.bgColor} ${drive.borderColor}`}>
                  {drive.chineseName}
                </span>
              )}
              <span className="hidden xs:inline text-xs px-2 py-0.5 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-400">
                {habit.frequency === 'daily' ? '每日' : '每週'}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="ml-11">
            <h3 className="text-white font-semibold text-base mb-1">{habit.title}</h3>
            <p className="text-zinc-400 text-sm leading-relaxed mb-3">{habit.description}</p>

            {/* Completion rate progress bar */}
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-zinc-500 text-xs">完成率</span>
                <span className={`text-xs font-semibold ${habit.completionRate >= 70 ? 'text-emerald-400' : habit.completionRate >= 40 ? 'text-amber-400' : 'text-zinc-400'}`}>
                  {habit.completionRate}%
                </span>
              </div>
              <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${rateBarColor}`}
                  style={{ width: `${habit.completionRate}%` }}
                />
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-3 mb-3">
              <StreakBadge streak={habit.streak} size="sm" />
              <span className="text-xs text-amber-400 font-semibold bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                +{habit.xp} XP
              </span>
              {habit.completedToday && (
                <span className="text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  ✓ 今日完成
                </span>
              )}
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between gap-2 min-w-0">
              <div className="flex items-center gap-0.5 min-w-0">
                <button
                  onClick={e => { e.stopPropagation(); handleEncourage() }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-all hover:bg-pink-500/10 cursor-pointer ${
                    encouraged ? 'text-pink-400' : 'text-zinc-500 hover:text-pink-400'
                  }`}
                >
                  <HeartIcon filled={encouraged} size={14} />
                  <span>{encourageCount}</span>
                </button>

                <button
                  onClick={e => e.stopPropagation()}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs text-zinc-500 hover:text-blue-400 hover:bg-blue-500/10 transition-all cursor-pointer"
                >
                  <ChatIcon size={14} />
                </button>

                <button
                  onClick={e => e.stopPropagation()}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs text-zinc-500 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all cursor-pointer"
                >
                  <ShareIcon size={14} />
                </button>
              </div>

              {/* Only show toggle for own habits */}
              {isOwner && (
                <button
                  onClick={e => { e.stopPropagation(); handleToggle() }}
                  className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer ${
                    habit.completedToday
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20'
                      : 'bg-zinc-800 text-zinc-300 border border-zinc-700 hover:bg-zinc-700 hover:text-white hover:border-zinc-600'
                  }`}
                >
                  {habit.completedToday ? (
                    <>
                      <CheckIcon size={12} />
                      <span>已完成</span>
                    </>
                  ) : (
                    <>
                      <CircleIcon size={12} />
                      <span>打卡</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </article>
  )
}

export default HabitCard
