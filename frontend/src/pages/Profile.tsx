import React, { useState, useRef } from 'react'
import { useAppSelector, useAppDispatch } from '@/store/hooks'
import { logout } from '@/store/authSlice'
import { googleLogout } from '@react-oauth/google'
import { useGetUserProfileQuery, useGetHabitsQuery, useUpdateProfileMutation } from '@/store/api'
import { drives } from '@/constants/drives'
import { ACHIEVEMENTS } from '@/types'
import XpBar from '@/components/common/XpBar'
import { FireIcon, BoltIcon, MedalIcon, SproutIcon, StarIcon, DiamondIcon, TargetIcon } from '@/components/common/Icons'
import type { DriveType } from '@/types'

const achievementIconMap: Record<string, React.ReactNode> = {
  first_habit: <SproutIcon size={20} />,
  week_streak: <FireIcon size={20} />,
  level_5: <StarIcon size={20} />,
  all_drives: <TargetIcon size={20} />,
  hundred_xp: <DiamondIcon size={20} />,
}

const resizeImageToBase64 = (file: File, maxSize = 256): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = e => {
      const img = new Image()
      img.onload = () => {
        const scale = Math.min(maxSize / img.width, maxSize / img.height, 1)
        const canvas = document.createElement('canvas')
        canvas.width = img.width * scale
        canvas.height = img.height * scale
        canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL('image/jpeg', 0.8))
      }
      img.onerror = reject
      img.src = e.target!.result as string
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })

const Profile = (): React.JSX.Element => {
  const dispatch = useAppDispatch()
  const authUser = useAppSelector(state => state.auth.user)
  const { data: profile } = useGetUserProfileQuery()
  const { data: habits = [] } = useGetHabitsQuery()
  const [updateProfile, { isLoading: isSaving }] = useUpdateProfileMutation()

  const [editing, setEditing] = useState(false)
  const [editName, setEditName] = useState('')
  const [editAvatar, setEditAvatar] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const isGuest = authUser?.provider === 'guest'

  const handleLogout = (): void => {
    if (authUser?.provider === 'google') googleLogout()
    dispatch(logout())
  }

  const handleStartEdit = (): void => {
    setEditName(profile?.displayName ?? '')
    setEditAvatar(profile?.avatar ?? '')
    setEditing(true)
  }

  const handleCancelEdit = (): void => {
    setEditing(false)
  }

  const handleSave = async (): Promise<void> => {
    await updateProfile({ name: editName, avatar: editAvatar })
    setEditing(false)
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = e.target.files?.[0]
    if (!file) return
    const base64 = await resizeImageToBase64(file)
    setEditAvatar(base64)
  }

  const totalHabits = habits.length
  const completedHabits = habits.filter(h => h.completed).length
  const longestStreak = habits.reduce((max, h) => Math.max(max, h.streak), 0)

  const allAchievements = ACHIEVEMENTS.map(a => {
    const earned = profile?.achievements.find(ea => ea.id === a.id)
    return { ...a, earned: !!earned, earnedAt: earned?.earnedAt }
  })

  const earnedCount = allAchievements.filter(a => a.earned).length

  const habitsByDrive: Record<number, number> = {}
  habits.forEach(h => {
    habitsByDrive[h.driveType] = (habitsByDrive[h.driveType] ?? 0) + 1
  })

  const topDrive = Object.entries(habitsByDrive).sort(([, a], [, b]) => b - a)[0]
  const topDriveId = topDrive ? parseInt(topDrive[0]) as DriveType : null
  const topDriveData = topDriveId ? drives.find(d => d.id === topDriveId) : null

  const displayAvatar = editing ? editAvatar : (profile?.avatar ?? '')
  const displayName = editing ? editName : (profile?.displayName ?? '')

  return (
    <div>
      {/* Header */}
      <div className="sticky top-0 bg-ivory/90 backdrop-blur-md border-b border-line-2 z-20 px-6 py-4 flex items-center justify-between">
        <div>
          <div className="font-mono text-[13px] text-ink-4 tracking-[0.14em] uppercase flex items-center gap-2">
            <span className="text-accent">●</span> 個人資料
          </div>
          <h1 className="font-serif text-[32px] leading-[1.02] text-ink-1 mt-5">你的<em className="italic text-accent">勳章匣</em></h1>
        </div>
        <button
          onClick={handleLogout}
          className={`md:hidden flex items-center gap-1.5 text-sm transition-colors cursor-pointer ${isGuest ? 'text-ink-4 hover:text-accent' : 'text-ink-4 hover:text-accent'}`}
        >
          {isGuest ? '登入' : '登出'}
        </button>
      </div>

      {/* Cover banner */}
      <div className="relative h-44 overflow-hidden border-b border-line">
        <div className="absolute inset-0"
          style={{
            background: `radial-gradient(circle at 20% 30%, #e8d6c6, transparent 50%),
              radial-gradient(circle at 80% 70%, #d9dcc6, transparent 50%),
              radial-gradient(circle at 50% 50%, #cdd4dc, transparent 60%),
              #fbf8f2`
          }}
        />
        <svg viewBox="0 0 800 180" width="100%" height="100%" className="absolute inset-0 opacity-30">
          <g fill="none" stroke="#1a1915" strokeWidth="0.5" opacity=".35">
            <circle cx="120" cy="60" r="30"/><circle cx="180" cy="100" r="46"/>
            <circle cx="700" cy="120" r="28"/><circle cx="620" cy="60" r="20"/>
            <path d="M 50 160 Q 200 40 400 110 T 780 60"/>
          </g>
        </svg>
      </div>

      {/* Profile info */}
      <div className="px-6 pb-6">
        {/* Avatar + action buttons */}
        <div className="flex items-end justify-between -mt-14 mb-4 relative z-10">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-ink-1 border-4 border-ivory flex items-center justify-center text-4xl overflow-hidden">
              {(displayAvatar?.includes('http') || displayAvatar?.startsWith('data:')) ? (
                <img src={displayAvatar} alt={displayName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <span className="font-serif text-4xl italic text-paper">
                  {(displayAvatar && displayAvatar.length <= 10) ? displayAvatar : (displayName?.charAt(0) || '?')}
                </span>
              )}
            </div>
            {editing && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 rounded-full bg-ink-1/50 flex items-center justify-center text-paper text-sm font-medium cursor-pointer hover:bg-ink-1/60 transition-colors"
              >
                更換
              </button>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={e => { void handleFileChange(e) }} />
            {!editing && (
              <div className="absolute -bottom-1 -right-1 bg-accent text-paper text-sm font-bold font-mono px-2 py-0.5 rounded-full border-2 border-ivory">
                {profile?.level ?? 1}
              </div>
            )}
          </div>

          {editing ? (
            <div className="flex items-center gap-2">
              <button onClick={handleCancelEdit} className="px-4 py-1.5 rounded-[10px] border border-line text-ink-2 text-sm font-medium hover:bg-line-2 transition-colors cursor-pointer">
                取消
              </button>
              <button
                onClick={() => { void handleSave() }}
                disabled={isSaving || !editName.trim()}
                className={`px-4 py-1.5 rounded-[10px] text-sm font-medium transition-colors cursor-pointer border ${isSaving || !editName.trim() ? 'bg-accent-soft text-accent/50 border-accent/20 cursor-not-allowed' : 'bg-ink-1 border-ink-1 text-paper hover:bg-ink-2'}`}
              >
                {isSaving ? '儲存中...' : '儲存'}
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <button onClick={handleStartEdit} className="px-4 py-1.5 rounded-[10px] border border-line text-ink-2 text-sm font-medium hover:bg-line-2 transition-colors cursor-pointer bg-paper">
                編輯資料
              </button>
            </div>
          )}
        </div>

        {/* Name & username */}
        {editing ? (
          <div className="mb-4">
            <input
              type="text"
              value={editName}
              onChange={e => setEditName(e.target.value)}
              maxLength={30}
              placeholder="顯示名稱"
              className="bg-paper border border-line rounded-[10px] px-3 py-2 text-ink-1 font-serif text-2xl w-full outline-none focus:border-accent/40 transition-colors mb-1"
            />
            <div className="flex justify-between items-center">
              <p className="text-ink-3 text-sm font-mono">{profile?.username ?? ''}</p>
              <span className="text-ink-4 text-sm font-mono">{editName.length}/30</span>
            </div>
          </div>
        ) : (
          <>
            <h2 className="font-serif text-[38px] leading-[1] text-ink-1">{profile?.displayName ?? ''}</h2>
            <p className="text-ink-3 text-sm font-mono mb-2">{profile?.username ?? ''}</p>
          </>
        )}

        {/* Level & streak (hidden when editing) */}
        {!editing && (
          <>
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <span className="text-sm px-2.5 py-1 rounded-full border border-line bg-paper text-ink-3 font-mono flex items-center gap-1"><FireIcon size={13} /> {profile?.totalStreak ?? 0} 天連勝</span>
              <span className="text-sm px-2.5 py-1 rounded-full border border-line bg-paper text-ink-3 font-mono flex items-center gap-1"><BoltIcon size={13} /> {(profile?.xp ?? 0).toLocaleString()} XP</span>
              <span className="text-sm px-2.5 py-1 rounded-full border border-line bg-paper text-ink-3 font-mono flex items-center gap-1"><MedalIcon size={13} /> {earnedCount}/{ACHIEVEMENTS.length} 成就</span>
              {topDriveData && (
                <span className={`text-sm px-2.5 py-1 rounded-full border font-mono ${topDriveData.color} ${topDriveData.bgColor} ${topDriveData.borderColor}`}>
                  主要：{topDriveData.chineseName}
                </span>
              )}
            </div>
            <div className="mb-5">
              <XpBar xp={profile?.xp ?? 0} xpToNextLevel={profile?.xpToNextLevel ?? 100} level={profile?.level ?? 1} />
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-2.5 mb-6">
              {[
                { label: '總習慣', value: totalHabits, unit: '個' },
                { label: '已完成', value: completedHabits, unit: '次' },
                { label: '最長連勝', value: longestStreak, unit: '天' },
                { label: '獲得成就', value: `${earnedCount}/${ACHIEVEMENTS.length}`, unit: '枚' },
              ].map(stat => (
                <div key={stat.label} className="bg-card border border-line rounded-[14px] p-4 text-center">
                  <div className="font-mono text-sm text-ink-4 tracking-[0.1em] uppercase">{stat.label}</div>
                  <div className="font-serif text-[32px] leading-[1] text-ink-1 mt-1">
                    {stat.value}
                    <span className="text-sm text-ink-3 font-serif italic"> {stat.unit}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3.5 my-5 text-line">
              <div className="flex-1 h-px bg-line" />
              <span className="font-serif text-[18px] italic text-ink-4">§</span>
              <div className="flex-1 h-px bg-line" />
            </div>

            {/* Achievements */}
            <div className="mb-6">
              <div className="font-mono text-[13px] text-ink-4 tracking-[0.14em] uppercase mb-1">成就展示</div>
              <div className="font-serif text-[26px] text-ink-1 mt-1 mb-4">你的<em className="italic text-accent">勳章匣</em></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {allAchievements.map(ach => (
                  <div key={ach.id} className={`flex items-center gap-3.5 p-4 rounded-[14px] border transition-all ${ach.earned ? 'bg-card border-line' : 'bg-paper border-line opacity-50'}`}>
                    <div className={`w-11 h-11 rounded-full flex items-center justify-center border ${ach.earned ? 'bg-warm-amber-soft border-warm-amber/20 text-warm-amber' : 'bg-line-2 border-line text-ink-3'}`}>
                      {achievementIconMap[ach.id] ?? <MedalIcon size={20} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-serif text-[17px] text-ink-1">{ach.title}</span>
                        {ach.earned ? (
                          <span className="text-leaf text-sm bg-leaf-soft px-1.5 py-0.5 rounded-full border border-leaf/20 font-mono">已解鎖</span>
                        ) : (
                          <span className="text-ink-4 text-sm bg-line-2 px-1.5 py-0.5 rounded-full font-mono">未解鎖</span>
                        )}
                      </div>
                      <p className="text-ink-3 text-sm mt-0.5">{ach.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Habit History */}
            <div>
              <div className="font-mono text-[13px] text-ink-4 tracking-[0.14em] uppercase mb-1">習慣記錄</div>
              <div className="font-serif text-[26px] text-ink-1 mt-1 mb-4">所有<em className="italic text-accent">練習</em></div>
              <div className="space-y-2">
                {habits.map(habit => {
                  const drive = drives.find(d => d.id === habit.driveType)
                  return (
                    <div key={habit.id} className="flex items-center gap-3 p-3.5 bg-card border border-line rounded-[14px] hover:border-ink-4/30 transition-colors">
                      <div className="w-1 h-10 rounded-full" style={{ background: drive ? '#b7552e' : '#e6dfd2' }} />
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
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default Profile
