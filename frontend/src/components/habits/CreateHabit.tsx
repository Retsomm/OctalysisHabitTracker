import React from 'react'
import { useState } from 'react'
import { useCreateHabitMutation, useGetUserProfileQuery } from '../../store/api'
import { drives } from '../../constants/drives'
import type { DriveType } from '../../types'
import { ImageIcon, GoalIcon, BellIcon } from '../common/Icons'

const AvatarDisplay = ({ avatar, name, size = 'w-10 h-10' }: { avatar?: string; name?: string; size?: string }): React.JSX.Element => {
  const isImage = avatar?.includes('http') || avatar?.startsWith('data:')
  const isShortStr = avatar && avatar.length <= 10 && !isImage

  if (isImage) {
    return <img src={avatar} alt={name} className={`${size} rounded-full object-cover border border-zinc-700`} referrerPolicy="no-referrer" />
  }
  return (
    <div className={`${size} rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-lg`}>
      {isShortStr ? avatar : (name?.charAt(0) || '?')}
    </div>
  )
}

const CreateHabit = (): React.JSX.Element => {
  const [createHabit, { isLoading }] = useCreateHabitMutation()
  const { data: profile } = useGetUserProfileQuery()
  const [expanded, setExpanded] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [selectedDrive, setSelectedDrive] = useState<DriveType>(2)
  const [frequency, setFrequency] = useState<'daily' | 'weekly'>('daily')

  const handleSubmit = async (): Promise<void> => {
    if (!title.trim()) return
    await createHabit({
      title: title.trim(),
      description: description.trim(),
      driveType: selectedDrive,
      frequency,
      xp: frequency === 'daily' ? 50 : 100,
    })
    setTitle('')
    setDescription('')
    setSelectedDrive(2)
    setFrequency('daily')
    setExpanded(false)
  }

  const selectedDriveData = drives.find(d => d.id === selectedDrive)

  return (
    <div className="border-b border-zinc-800 bg-zinc-950">
      <div className="px-4 py-4">
        {/* Compose area */}
        <div className="flex gap-3">
          <div className="shrink-0">
            <AvatarDisplay avatar={profile?.avatar} name={profile?.displayName} />
          </div>
          <div className="flex-1">
            <input
              type="text"
              placeholder="今天想建立什麼習慣？"
              value={title}
              onChange={e => setTitle(e.target.value)}
              onFocus={() => setExpanded(true)}
              className="w-full bg-transparent text-white text-lg placeholder-zinc-600 outline-none border-none mb-2"
            />

            {expanded && (
              <div className="space-y-3">
                <textarea
                  placeholder="描述這個習慣的意義和做法..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={2}
                  className="w-full bg-transparent text-zinc-300 text-sm placeholder-zinc-600 outline-none border-none resize-none leading-relaxed"
                />

                {/* Drive selector */}
                <div>
                  <div className="text-zinc-500 text-xs mb-2">選擇驅動力類型</div>
                  <div className="flex flex-wrap gap-1.5">
                    {drives.map(drive => (
                      <button
                        key={drive.id}
                        onClick={() => setSelectedDrive(drive.id)}
                        className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all duration-200 cursor-pointer ${
                          selectedDrive === drive.id
                            ? `${drive.color} ${drive.bgColor} ${drive.borderColor} font-semibold`
                            : 'text-zinc-500 border-zinc-700 hover:border-zinc-500 hover:text-zinc-300'
                        }`}
                      >
                        {drive.id}. {drive.chineseName}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Frequency */}
                <div className="flex items-center gap-2">
                  <div className="text-zinc-500 text-xs">頻率：</div>
                  <button
                    onClick={() => setFrequency('daily')}
                    className={`px-3 py-1 rounded-full text-xs border transition-all cursor-pointer ${
                      frequency === 'daily'
                        ? 'text-white bg-zinc-700 border-zinc-600'
                        : 'text-zinc-500 border-zinc-700 hover:border-zinc-500'
                    }`}
                  >
                    每日
                  </button>
                  <button
                    onClick={() => setFrequency('weekly')}
                    className={`px-3 py-1 rounded-full text-xs border transition-all cursor-pointer ${
                      frequency === 'weekly'
                        ? 'text-white bg-zinc-700 border-zinc-600'
                        : 'text-zinc-500 border-zinc-700 hover:border-zinc-500'
                    }`}
                  >
                    每週
                  </button>
                  {selectedDriveData && (
                    <div className="ml-auto flex items-center gap-1.5">
                      <span className={`text-xs ${selectedDriveData.color}`}>
                        {selectedDriveData.chineseName}
                      </span>
                      <span className="text-xs text-amber-400">
                        +{frequency === 'daily' ? 50 : 100} XP
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Bottom bar */}
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-zinc-800">
              <div className="flex items-center gap-2 text-zinc-500">
                <button className="hover:text-violet-400 transition-colors cursor-pointer" title="新增圖片">
                  <ImageIcon size={18} />
                </button>
                <button className="hover:text-emerald-400 transition-colors cursor-pointer" title="新增目標">
                  <GoalIcon size={18} />
                </button>
                <button className="hover:text-amber-400 transition-colors cursor-pointer" title="設定提醒">
                  <BellIcon size={18} />
                </button>
              </div>
              <div className="flex items-center gap-2">
                {expanded && title.length > 0 && (
                  <span className={`text-xs ${title.length > 80 ? 'text-red-400' : 'text-zinc-500'}`}>
                    {title.length}/100
                  </span>
                )}
                <button
                  onClick={() => { void handleSubmit() }}
                  disabled={!title.trim() || isLoading}
                  className={`px-5 py-2 rounded-full text-sm font-bold transition-all duration-200 cursor-pointer ${
                    title.trim() && !isLoading
                      ? 'bg-violet-600 text-white hover:bg-violet-500 shadow-lg shadow-violet-500/20'
                      : 'bg-violet-600/30 text-violet-800 cursor-not-allowed'
                  }`}
                >
                  {isLoading ? '建立中...' : '建立習慣'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreateHabit
