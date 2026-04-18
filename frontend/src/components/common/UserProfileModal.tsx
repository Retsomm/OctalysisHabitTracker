import React, { useEffect } from 'react'
import { useGetPublicProfileQuery, useGetPublicHabitsQuery } from '@/store/api'
import { drives } from '@/constants/drives'
import { ACHIEVEMENTS } from '@/types'
import XpBar from './XpBar'
import StreakBadge from './StreakBadge'
import { FireIcon, MedalIcon, SproutIcon, StarIcon, DiamondIcon, TargetIcon } from './Icons'
import type { DriveType } from '@/types'

const achievementIconMap: Record<string, React.ReactNode> = {
  first_habit: <SproutIcon size={18} />,
  week_streak: <FireIcon size={18} />,
  level_5: <StarIcon size={18} />,
  all_drives: <TargetIcon size={18} />,
  hundred_xp: <DiamondIcon size={18} />,
}

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
        className="relative w-full max-w-lg bg-card border border-line rounded-t-3xl max-h-[90vh] overflow-y-auto scrollbar-none"
        onClick={e => e.stopPropagation()}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-line rounded-full" />
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-ink-4 text-sm font-mono">載入中...</div>
        ) : (
          <>
            {/* Cover */}
            <div className="relative h-28 overflow-hidden" style={{
              background: `radial-gradient(circle at 20% 30%, #e8d6c6, transparent 50%), radial-gradient(circle at 80% 70%, #d9dcc6, transparent 50%), #fbf8f2`
            }}>
              <svg viewBox="0 0 600 112" width="100%" height="100%" className="absolute inset-0 opacity-25">
                <g fill="none" stroke="#1a1915" strokeWidth="0.5" opacity=".35">
                  <circle cx="80" cy="40" r="30"/><circle cx="520" cy="80" r="24"/>
                  <path d="M 0 100 Q 150 20 350 70 T 620 30"/>
                </g>
              </svg>
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-3 right-3 w-8 h-8 bg-paper/80 rounded-full flex items-center justify-center text-ink-3 hover:text-ink-1 hover:bg-paper transition-colors cursor-pointer border border-line"
              >
                ×
              </button>
            </div>

            <div className="relative z-10 px-5 pb-6">
              {/* Avatar + name */}
              <div className="flex items-end gap-3 -mt-8 mb-3">
                <div className="w-16 h-16 rounded-full bg-ink-1 border-4 border-card flex items-center justify-center text-3xl overflow-hidden shrink-0">
                  <AvatarLarge avatar={profile?.avatar} name={profile?.displayName} />
                </div>
                <div className="pb-1 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="font-serif text-[22px] text-ink-1 truncate">{profile?.displayName}</h2>
                    <span className="text-accent text-sm font-bold font-mono bg-accent-soft border border-accent/20 px-2 py-0.5 rounded-full shrink-0">Lv.{profile?.level}</span>
                  </div>
                  <p className="text-ink-4 text-sm font-mono">@{profile?.username}</p>
                </div>
              </div>

              {/* Streak + XP + top drive */}
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <StreakBadge streak={profile?.totalStreak ?? 0} />
                <span className="text-warm-amber text-sm font-semibold font-mono">{(profile?.xp ?? 0).toLocaleString()} XP</span>
                {topDriveData && (
                  <span className={`text-sm px-2 py-0.5 rounded-full border font-mono ${topDriveData.color} ${topDriveData.bgColor} ${topDriveData.borderColor}`}>
                    {topDriveData.chineseName}
                  </span>
                )}
              </div>

              {/* XP bar */}
              <div className="mb-5">
                <XpBar xp={profile?.xp ?? 0} xpToNextLevel={profile?.xpToNextLevel ?? 100} level={profile?.level ?? 1} />
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2.5 mb-6">
                {[
                  { label: '習慣數', value: habits.length },
                  { label: '最長連勝', value: `${longestStreak}天` },
                  { label: '成就', value: `${earnedCount}/${ACHIEVEMENTS.length}` },
                ].map(stat => (
                  <div key={stat.label} className="bg-paper border border-line rounded-[12px] p-3 text-center">
                    <div className="font-serif text-[22px] text-ink-1">{stat.value}</div>
                    <div className="text-ink-4 text-sm mt-0.5 font-mono">{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* Achievements */}
              <div className="mb-6">
                <div className="font-mono text-[12px] text-ink-4 tracking-[0.1em] uppercase mb-3">成就</div>
                <div className="space-y-2">
                  {allAchievements.map(ach => (
                    <div key={ach.id} className={`flex items-center gap-3 p-3 rounded-[12px] border transition-all ${ach.earned ? 'bg-card border-line' : 'bg-paper border-line opacity-40'}`}>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center border shrink-0 ${ach.earned ? 'bg-warm-amber-soft border-warm-amber/20 text-warm-amber' : 'bg-line-2 border-line text-ink-3'}`}>
                        {achievementIconMap[ach.id] ?? <MedalIcon size={18} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-serif text-[15px] text-ink-1">{ach.title}</span>
                          {ach.earned && (
                            <span className="text-leaf text-sm bg-leaf-soft px-1.5 py-0.5 rounded-full border border-leaf/20 shrink-0 font-mono">已解鎖</span>
                          )}
                        </div>
                        <p className="text-ink-3 text-sm mt-0.5 truncate">{ach.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Habit records */}
              <div>
                <div className="font-mono text-[12px] text-ink-4 tracking-[0.1em] uppercase mb-3">習慣記錄</div>
                {habits.length === 0 ? (
                  <p className="text-ink-4 text-sm text-center py-4 font-mono">尚無習慣記錄</p>
                ) : (
                  <div className="space-y-2">
                    {habits.map(habit => {
                      const drive = drives.find(d => d.id === habit.driveType)
                      return (
                        <div key={habit.id} className="flex items-center gap-3 p-3 bg-paper border border-line rounded-[12px]">
                          <div className="w-1 h-10 rounded-full shrink-0 bg-accent" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-ink-1 text-sm font-medium truncate">{habit.title}</span>
                              {habit.completed && <span className="text-leaf text-sm shrink-0 font-mono">✓</span>}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              {drive && <span className={`text-sm ${drive.color} font-mono`}>{drive.chineseName}</span>}
                              <span className="text-ink-4 text-sm">·</span>
                              <span className="text-ink-4 text-sm font-mono">{habit.frequency === 'daily' ? '每日' : '每週'}</span>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <div className="text-accent text-sm font-mono flex items-center gap-1"><FireIcon size={12} /> {habit.streak}</div>
                            <div className="text-warm-amber text-sm font-mono">{habit.xp} XP</div>
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
