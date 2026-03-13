import React, { useEffect } from 'react'
import { useGetPublicProfileQuery, useGetPublicHabitsQuery } from '../../store/api'
import { drives } from '../../constants/drives'
import { ACHIEVEMENTS } from '../../types'
import XpBar from './XpBar'
import StreakBadge from './StreakBadge'
import type { DriveType } from '../../types'

interface UserProfileModalProps {
  userId: string
  onClose: () => void
}

const AvatarLarge = ({ avatar, name }: { avatar?: string; name?: string }): React.JSX.Element => {
  const isImage = avatar?.includes('http') || avatar?.startsWith('data:')
  const isShortStr = avatar && avatar.length <= 10 && !isImage
  if (isImage) {
    return <img src={avatar} alt={name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
  }
  return <span>{isShortStr ? avatar : (name?.charAt(0) || '?')}</span>
}

const UserProfileModal = ({ userId, onClose }: UserProfileModalProps): React.JSX.Element => {
  const { data: profile, isLoading: loadingProfile } = useGetPublicProfileQuery(userId)
  const { data: habits = [], isLoading: loadingHabits } = useGetPublicHabitsQuery(userId)

  // 按 ESC 關閉
  useEffect(() => {
    const handler = (e: KeyboardEvent): void => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const isLoading = loadingProfile || loadingHabits

  const longestStreak = habits.reduce((max, h) => Math.max(max, h.streak), 0)

  const allAchievements = ACHIEVEMENTS.map(a => {
    const earned = profile?.achievements.find(ea => ea.id === a.id)
    return { ...a, earned: !!earned, earnedAt: earned?.earnedAt }
  })
  const earnedCount = allAchievements.filter(a => a.earned).length

  const habitsByDrive: Record<number, number> = {}
  habits.forEach(h => { habitsByDrive[h.driveType] = (habitsByDrive[h.driveType] ?? 0) + 1 })
  const topDrive = Object.entries(habitsByDrive).sort(([, a], [, b]) => b - a)[0]
  const topDriveId = topDrive ? parseInt(topDrive[0]) as DriveType : null
  const topDriveData = topDriveId ? drives.find(d => d.id === topDriveId) : null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Sheet */}
      <div
        className="relative w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-t-3xl max-h-[90vh] overflow-y-auto scrollbar-none"
        onClick={e => e.stopPropagation()}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-zinc-700 rounded-full" />
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-zinc-500 text-sm">載入中...</div>
        ) : (
          <>
            {/* Cover */}
            <div className="relative h-28 bg-gradient-to-br from-violet-900/50 via-zinc-900 to-cyan-900/50 overflow-hidden mx-0">
              <div className="absolute inset-0 opacity-20">
                {Array.from({ length: 5 }, (_, i) => (
                  <svg key={i} className="absolute" style={{ left: `${10 + i * 20}%`, top: `${5 + (i % 2) * 30}%`, opacity: 0.3 }} width="48" height="48" viewBox="0 0 60 60">
                    <polygon points="18,3 42,3 57,18 57,42 42,57 18,57 3,42 3,18" fill="none" stroke="white" strokeWidth="1" />
                  </svg>
                ))}
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-zinc-950 to-transparent" />
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-3 right-3 w-8 h-8 bg-black/40 rounded-full flex items-center justify-center text-zinc-400 hover:text-white hover:bg-black/60 transition-colors cursor-pointer"
              >
                ×
              </button>
            </div>

            <div className="relative z-10 px-4 pb-6">
              {/* Avatar + name */}
              <div className="flex items-end gap-3 -mt-8 mb-3">
                <div className="w-16 h-16 rounded-full bg-zinc-800 border-4 border-zinc-950 flex items-center justify-center text-3xl overflow-hidden shrink-0">
                  <AvatarLarge avatar={profile?.avatar} name={profile?.displayName} />
                </div>
                <div className="pb-1 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-white font-bold text-lg truncate">{profile?.displayName}</h2>
                    <span className="text-violet-400 text-xs font-bold bg-violet-500/10 border border-violet-500/30 px-2 py-0.5 rounded-full shrink-0">Lv.{profile?.level}</span>
                  </div>
                  <p className="text-zinc-500 text-sm">@{profile?.username}</p>
                </div>
              </div>

              {/* Streak + XP + top drive */}
              <div className="flex items-center gap-3 mb-3 flex-wrap">
                <StreakBadge streak={profile?.totalStreak ?? 0} />
                <span className="text-zinc-600 text-sm">•</span>
                <span className="text-amber-400 text-sm font-semibold">{(profile?.xp ?? 0).toLocaleString()} XP</span>
                {topDriveData && (
                  <>
                    <span className="text-zinc-600 text-sm">•</span>
                    <span className={`text-sm ${topDriveData.color}`}>主要：{topDriveData.chineseName}</span>
                  </>
                )}
              </div>

              {/* XP bar */}
              <div className="mb-5">
                <XpBar xp={profile?.xp ?? 0} xpToNextLevel={profile?.xpToNextLevel ?? 100} level={profile?.level ?? 1} />
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2 mb-6">
                {[
                  { label: '習慣數', value: habits.length },
                  { label: '最長連勝', value: `${longestStreak}天` },
                  { label: '成就', value: `${earnedCount}/${ACHIEVEMENTS.length}` },
                ].map(stat => (
                  <div key={stat.label} className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-center">
                    <div className="text-white font-bold text-base">{stat.value}</div>
                    <div className="text-zinc-500 text-xs mt-0.5">{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* Achievements */}
              <div className="mb-6">
                <h3 className="text-white font-bold text-sm mb-3">成就</h3>
                <div className="space-y-2">
                  {allAchievements.map(ach => (
                    <div key={ach.id} className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${ach.earned ? 'bg-zinc-900 border-zinc-700' : 'bg-zinc-900/50 border-zinc-800 opacity-40'}`}>
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl border shrink-0 ${ach.earned ? 'bg-amber-500/10 border-amber-500/30' : 'bg-zinc-800 border-zinc-700 grayscale'}`}>
                        {ach.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-white font-semibold text-sm">{ach.title}</span>
                          {ach.earned && (
                            <span className="text-emerald-400 text-xs bg-emerald-500/10 px-1.5 py-0.5 rounded-full border border-emerald-500/20 shrink-0">已解鎖</span>
                          )}
                        </div>
                        <p className="text-zinc-500 text-xs mt-0.5 truncate">{ach.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Habit records */}
              <div>
                <h3 className="text-white font-bold text-sm mb-3">習慣記錄</h3>
                {habits.length === 0 ? (
                  <p className="text-zinc-600 text-sm text-center py-4">尚無習慣記錄</p>
                ) : (
                  <div className="space-y-2">
                    {habits.map(habit => {
                      const drive = drives.find(d => d.id === habit.driveType)
                      return (
                        <div key={habit.id} className="flex items-center gap-3 p-3 bg-zinc-900 border border-zinc-800 rounded-xl">
                          <div className={`w-2 h-10 rounded-full shrink-0 ${drive?.barColor ?? 'bg-zinc-600'}`} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-white text-sm font-semibold truncate">{habit.title}</span>
                              {habit.completed && <span className="text-emerald-400 text-xs shrink-0">✓</span>}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              {drive && <span className={`text-xs ${drive.color}`}>{drive.chineseName}</span>}
                              <span className="text-zinc-700 text-xs">•</span>
                              <span className="text-zinc-500 text-xs">{habit.frequency === 'daily' ? '每日' : '每週'}</span>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <div className="text-orange-400 text-xs font-semibold">🔥 {habit.streak}</div>
                            <div className="text-amber-400 text-xs">{habit.xp} XP</div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default UserProfileModal
