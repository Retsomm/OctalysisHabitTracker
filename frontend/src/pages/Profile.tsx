import React, { useState, useRef } from 'react'
import { useAppSelector, useAppDispatch } from '../store/hooks'
import { logout } from '../store/authSlice'
import { googleLogout } from '@react-oauth/google'
import { useGetUserProfileQuery, useGetHabitsQuery, useUpdateProfileMutation } from '../store/api'
import { drives } from '../constants/drives'
import { ACHIEVEMENTS } from '../types'
import XpBar from '../components/common/XpBar'
import StreakBadge from '../components/common/StreakBadge'
import type { DriveType } from '../types'

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
      <div className="sticky top-0 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800 z-20 px-4 py-3 flex items-center justify-between">
        <h1 className="text-white font-bold text-xl">個人資料</h1>
        <button
          onClick={handleLogout}
          className={`md:hidden flex items-center gap-1.5 text-sm transition-colors cursor-pointer ${isGuest ? 'text-zinc-500 hover:text-violet-400' : 'text-zinc-500 hover:text-red-400'}`}
        >
          {isGuest ? (
            <>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                <polyline points="8 17 3 12 8 7"/>
                <line x1="3" y1="12" x2="15" y2="12"/>
              </svg>
              登入
            </>
          ) : (
            <>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              登出
            </>
          )}
        </button>
      </div>

      {/* Cover image */}
      <div className="relative h-40 bg-gradient-to-br from-violet-900/50 via-zinc-900 to-cyan-900/50 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          {Array.from({ length: 6 }, (_, i) => (
            <svg key={i} className="absolute" style={{ left: `${15 + i * 15}%`, top: `${10 + (i % 2) * 30}%`, opacity: 0.3 + (i % 3) * 0.2 }} width="60" height="60" viewBox="0 0 60 60">
              <polygon points="18,3 42,3 57,18 57,42 42,57 18,57 3,42 3,18" fill="none" stroke="white" strokeWidth="1" />
            </svg>
          ))}
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-zinc-950 to-transparent" />
      </div>

      {/* Profile info */}
      <div className="px-4 pb-4">
        {/* Avatar + action buttons */}
        <div className="flex items-end justify-between -mt-8 mb-3">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-zinc-800 border-4 border-zinc-950 flex items-center justify-center text-4xl overflow-hidden">
              {(displayAvatar?.includes('http') || displayAvatar?.startsWith('data:')) ? (
                <img src={displayAvatar} alt={displayName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <span>{(displayAvatar && displayAvatar.length <= 10) ? displayAvatar : (displayName?.charAt(0) || '?')}</span>
              )}
            </div>
            {editing && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center text-white text-xs font-semibold cursor-pointer hover:bg-black/60 transition-colors"
              >
                更換
              </button>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={e => { void handleFileChange(e) }} />
            {!editing && (
              <div className="absolute -bottom-1 -right-1 bg-violet-600 text-white text-sm font-black px-2 py-0.5 rounded-full border-2 border-zinc-950">
                {profile?.level ?? 1}
              </div>
            )}
          </div>

          {editing ? (
            <div className="flex items-center gap-2">
              <button onClick={handleCancelEdit} className="px-4 py-1.5 rounded-full border border-zinc-600 text-zinc-400 text-sm font-semibold hover:bg-zinc-800 transition-colors cursor-pointer">
                取消
              </button>
              <button
                onClick={() => { void handleSave() }}
                disabled={isSaving || !editName.trim()}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors cursor-pointer ${isSaving || !editName.trim() ? 'bg-violet-600/40 text-violet-800 cursor-not-allowed' : 'bg-violet-600 text-white hover:bg-violet-500'}`}
              >
                {isSaving ? '儲存中...' : '儲存'}
              </button>
            </div>
          ) : (
            <button onClick={handleStartEdit} className="px-4 py-1.5 rounded-full border border-zinc-600 text-white text-sm font-semibold hover:bg-zinc-800 transition-colors cursor-pointer">
              編輯資料
            </button>
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
              className="bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white font-bold text-xl w-full outline-none focus:border-violet-500 transition-colors mb-1"
            />
            <div className="flex justify-between items-center">
              <p className="text-zinc-500 text-sm">{profile?.username ?? ''}</p>
              <span className="text-zinc-600 text-xs">{editName.length}/30</span>
            </div>
          </div>
        ) : (
          <>
            <h2 className="text-white font-bold text-xl">{profile?.displayName ?? ''}</h2>
            <p className="text-zinc-500 text-sm mb-2">{profile?.username ?? ''}</p>
          </>
        )}

        {/* Level & streak (hidden when editing) */}
        {!editing && (
          <>
            <div className="flex items-center gap-3 mb-4 flex-wrap">
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
            <div className="mb-5">
              <XpBar xp={profile?.xp ?? 0} xpToNextLevel={profile?.xpToNextLevel ?? 100} level={profile?.level ?? 1} />
            </div>
            <div className="grid grid-cols-4 gap-2 mb-6">
              {[
                { label: '習慣', value: totalHabits },
                { label: '已完成', value: completedHabits },
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
              <h3 className="text-white font-bold text-base mb-3">成就展示</h3>
              <div className="space-y-2">
                {allAchievements.map(ach => (
                  <div key={ach.id} className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${ach.earned ? 'bg-zinc-900 border-zinc-700' : 'bg-zinc-900/50 border-zinc-800 opacity-50'}`}>
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl border ${ach.earned ? 'bg-amber-500/10 border-amber-500/30' : 'bg-zinc-800 border-zinc-700 grayscale'}`}>
                      {ach.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-white font-semibold text-sm">{ach.title}</span>
                        {ach.earned ? (
                          <span className="text-emerald-400 text-xs bg-emerald-500/10 px-1.5 py-0.5 rounded-full border border-emerald-500/20">已解鎖</span>
                        ) : (
                          <span className="text-zinc-600 text-xs bg-zinc-800 px-1.5 py-0.5 rounded-full">未解鎖</span>
                        )}
                      </div>
                      <p className="text-zinc-500 text-xs mt-0.5">{ach.description}</p>
                      {ach.earned && ach.earnedAt && <p className="text-zinc-600 text-xs mt-0.5">解鎖於 {ach.earnedAt}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Habit History */}
            <div>
              <h3 className="text-white font-bold text-base mb-3">習慣記錄</h3>
              <div className="space-y-2">
                {habits.map(habit => {
                  const drive = drives.find(d => d.id === habit.driveType)
                  return (
                    <div key={habit.id} className="flex items-center gap-3 p-3 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-zinc-700 transition-colors">
                      <div className={`w-2 h-10 rounded-full ${drive?.barColor ?? 'bg-zinc-600'}`} />
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
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default Profile
