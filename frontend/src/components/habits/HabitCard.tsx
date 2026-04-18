import React from 'react'
import { useState } from 'react'
import type { FeedHabit } from '@/types'
import { drives } from '@/constants/drives'
import { useToggleHabitMutation, useGetUserProfileQuery } from '@/store/api'
import StreakBadge from '@/components/common/StreakBadge'
import { HeartIcon, ChatIcon, ShareIcon, CheckIcon, CircleIcon } from '@/components/common/Icons'
import EditHabitModal from './EditHabitModal'

interface HabitCardProps {
  habit: FeedHabit
}

const AvatarDisplay = ({ avatar, name, size = 'w-9 h-9' }: { avatar?: string; name?: string; size?: string }): React.JSX.Element => {
  const isImage = avatar?.includes('http') || avatar?.startsWith('data:')
  const isShortStr = avatar && avatar.length <= 10 && !isImage

  if (isImage) {
    return <img src={avatar} alt={name} className={`${size} rounded-full object-cover border border-line shrink-0`} referrerPolicy="no-referrer" />
  }
  return (
    <div className={`${size} rounded-full bg-line border border-line flex items-center justify-center text-lg shrink-0`}>
      {isShortStr ? avatar : (name?.charAt(0) || '?')}
    </div>
  )
}

const EditIcon = ({ size = 14 }: { size?: number }): React.JSX.Element => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
)

const driveLeftBorderHex: Record<number, string> = {
  1: '#6b4a5e', 2: '#a87625', 3: '#4d5a3a', 4: '#3a4a5c',
  5: '#6b4a5e', 6: '#b7552e', 7: '#3a4a5c', 8: '#b7552e',
}

const driveBarHex: Record<number, string> = {
  1: '#6b4a5e', 2: '#a87625', 3: '#4d5a3a', 4: '#3a4a5c',
  5: '#6b4a5e', 6: '#b7552e', 7: '#3a4a5c', 8: '#b7552e',
}

const HabitCard = ({ habit }: HabitCardProps): React.JSX.Element => {
  const [toggleHabit, { isLoading: isToggling }] = useToggleHabitMutation()
  const { data: profile } = useGetUserProfileQuery()
  const drive = drives.find(d => d.id === habit.driveType)
  const [encouraged, setEncouraged] = useState(false)
  const [encourageCount, setEncourageCount] = useState(0)
  const [showEdit, setShowEdit] = useState(false)

  const isOwner = profile?.id === habit.userId

  const handleToggle = (): void => {
    void toggleHabit({ id: habit.id, completed: !habit.completedToday })
  }

  const handleEncourage = (): void => {
    setEncouraged(prev => !prev)
    setEncourageCount(prev => encouraged ? prev - 1 : prev + 1)
  }

  const leftBorderHex = driveLeftBorderHex[habit.driveType] ?? '#9b978e'
  const barHex = driveBarHex[habit.driveType] ?? '#9b978e'

  return (
    <>
      <article className="border-b border-line hover:bg-paper/60 transition-colors duration-150 cursor-pointer">
        <div className="flex gap-0 border-l-[3px]" style={{ borderLeftColor: leftBorderHex }}>
          <div className="flex-1 px-5 py-4">
            {/* Header */}
            <div className="flex items-start justify-between gap-2 mb-3 min-w-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <AvatarDisplay avatar={habit.avatar} name={habit.displayName} />
                <div className="min-w-0">
                  <span className="text-ink-1 font-medium text-sm truncate">{habit.displayName}</span>
                  <span className="text-ink-4 text-sm ml-2 hidden sm:inline font-mono">{habit.username}</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                {drive && (
                  <span className={`text-sm px-2 py-0.5 rounded-full border font-medium ${drive.color} ${drive.bgColor} ${drive.borderColor}`}>
                    {drive.chineseName}
                  </span>
                )}
                <span className="hidden xs:inline text-sm px-2 py-0.5 rounded-full bg-paper border border-line text-ink-3 font-mono">
                  {habit.frequency === 'daily' ? '每日' : '每週'}
                </span>
                {isOwner && (
                  <button
                    onClick={e => { e.stopPropagation(); setShowEdit(true) }}
                    className="p-1.5 rounded-full text-ink-4 hover:text-ink-2 hover:bg-line-2 transition-all cursor-pointer"
                    title="編輯習慣"
                  >
                    <EditIcon size={13} />
                  </button>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="ml-11">
              <h3 className="text-ink-1 font-semibold text-base mb-1 font-serif">{habit.title}</h3>
              <p className="text-ink-3 text-sm leading-relaxed mb-2">{habit.description}</p>

              {habit.projects.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {habit.projects.map(p => (
                    <span key={p.id} className="inline-flex items-center gap-1 text-sm px-2 py-0.5 rounded-full bg-accent-soft text-accent border border-accent/20">
                      <span className="text-[10px]">📁</span>
                      {p.name}
                    </span>
                  ))}
                </div>
              )}

              {habit.reminderTime && (
                <div className="flex items-center gap-1 mb-2">
                  <span className="text-sm text-warm-amber font-mono">🔔 每日 {habit.reminderTime} 提醒</span>
                </div>
              )}

              {/* Completion rate */}
              <div className="mb-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-ink-4 text-sm font-mono">完成率</span>
                  <span className={`text-sm font-semibold font-mono ${habit.completionRate >= 70 ? 'text-leaf' : habit.completionRate >= 40 ? 'text-warm-amber' : 'text-ink-3'}`}>
                    {habit.completionRate}%
                  </span>
                </div>
                <div className="h-[3px] bg-line-2 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${habit.completionRate}%`, background: barHex }}
                  />
                </div>
              </div>

              {habit.imageUrl && (
                <div className="mb-3 rounded-[10px] overflow-hidden border border-line">
                  <img src={habit.imageUrl} alt={habit.title} className="w-full max-h-48 object-cover" />
                </div>
              )}

              {/* Stats */}
              <div className="flex items-center gap-2.5 mb-3">
                <StreakBadge streak={habit.streak} size="sm" />
                <span className="text-sm font-mono text-warm-amber font-semibold bg-warm-amber-soft px-2 py-0.5 rounded-full border border-warm-amber/20">
                  +{habit.xp} XP
                </span>
                {habit.completedToday && (
                  <span className="text-sm font-mono text-leaf font-semibold bg-leaf-soft px-2 py-0.5 rounded-full border border-leaf/20">
                    ✓ 今日完成
                  </span>
                )}
              </div>

              {/* Action Bar */}
              <div className="flex items-center justify-between gap-2 min-w-0">
                <div className="flex items-center gap-0.5 min-w-0">
                  <button
                    onClick={e => { e.stopPropagation(); handleEncourage() }}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-sm transition-all hover:bg-accent-soft/50 cursor-pointer ${
                      encouraged ? 'text-accent' : 'text-ink-4 hover:text-accent'
                    }`}
                  >
                    <HeartIcon filled={encouraged} size={14} />
                    <span className="font-mono">{encourageCount}</span>
                  </button>

                  <button
                    onClick={e => e.stopPropagation()}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-sm text-ink-4 hover:text-dusk hover:bg-dusk-soft/50 transition-all cursor-pointer"
                  >
                    <ChatIcon size={14} />
                  </button>

                  <button
                    onClick={e => e.stopPropagation()}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-sm text-ink-4 hover:text-leaf hover:bg-leaf-soft/50 transition-all cursor-pointer"
                  >
                    <ShareIcon size={14} />
                  </button>
                </div>

                {isOwner && (
                  <button
                    onClick={e => { e.stopPropagation(); handleToggle() }}
                    disabled={isToggling}
                    className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed border ${
                      habit.completedToday
                        ? 'bg-leaf-soft text-leaf border-leaf/30 hover:bg-accent-soft hover:text-accent hover:border-accent/30'
                        : 'bg-paper text-ink-2 border-line hover:bg-ink-1 hover:text-paper hover:border-ink-1'
                    }`}
                  >
                    {isToggling ? (
                      <>
                        <span className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                        <span>處理中</span>
                      </>
                    ) : habit.completedToday ? (
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

      {showEdit && (
        <EditHabitModal habit={habit} onClose={() => setShowEdit(false)} />
      )}
    </>
  )
}

export default HabitCard
