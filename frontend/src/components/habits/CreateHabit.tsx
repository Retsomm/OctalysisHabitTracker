import React, { useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { useCreateHabitMutation, useGetUserProfileQuery, useGetProjectsQuery, useCreateProjectMutation } from '@/store/api'
import { drives } from '@/constants/drives'
import type { DriveType } from '@/types'
import { ImageIcon, FolderIcon, BellIcon } from '@/components/common/Icons'
import TimePicker from '@/components/common/TimePicker'

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
  const [createProject] = useCreateProjectMutation()
  const { avatar, displayName } = useGetUserProfileQuery(undefined, {
    selectFromResult: ({ data }) => ({ avatar: data?.avatar, displayName: data?.displayName }),
  })
  const { data: projects = [] } = useGetProjectsQuery()

  const [expanded, setExpanded] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [selectedDrive, setSelectedDrive] = useState<DriveType>(2)
  const [frequency, setFrequency] = useState<'daily' | 'weekly'>('daily')

  // 圖片
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 專案
  const [showProjects, setShowProjects] = useState(false)
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([])
  const [newProjectName, setNewProjectName] = useState('')
  const [isCreatingProject, setIsCreatingProject] = useState(false)

  // 提醒
  const [showReminder, setShowReminder] = useState(false)
  const [reminderTime, setReminderTime] = useState('08:00')
  const [reminderEnabled, setReminderEnabled] = useState(false)

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      toast.error('圖片大小不可超過 5MB')
      return
    }
    const reader = new FileReader()
    reader.onload = ev => {
      setImagePreview(ev.target?.result as string)
      setExpanded(true)
    }
    reader.readAsDataURL(file)
  }

  const handleProjectToggle = (): void => {
    setShowProjects(prev => !prev)
    setExpanded(true)
  }

  const handleProjectSelect = (id: string): void => {
    setSelectedProjectIds(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    )
  }

  const handleCreateProject = async (): Promise<void> => {
    if (!newProjectName.trim()) return
    setIsCreatingProject(true)
    try {
      const project = await createProject({ name: newProjectName.trim() }).unwrap()
      setSelectedProjectIds(prev => [...prev, project.id])
      setNewProjectName('')
      setIsCreatingProject(false)
      toast.success(`已建立專案「${project.name}」`)
    } catch {
      toast.error('建立專案失敗，請再試一次')
      setIsCreatingProject(false)
    }
  }

  const handleReminderToggle = (): void => {
    setShowReminder(prev => !prev)
    setExpanded(true)
  }

  const handleConfirmReminder = (): void => {
    localStorage.setItem('habitReminderTime', reminderTime)
    setReminderEnabled(true)
    toast.success(`已設定每日 ${reminderTime} 提醒`)
  }

  const handleSubmit = async (): Promise<void> => {
    if (!title.trim()) return
    await createHabit({
      title: title.trim(),
      description: description.trim(),
      driveType: selectedDrive,
      frequency,
      xp: frequency === 'daily' ? 50 : 100,
      imageUrl: imagePreview ?? null,
      reminderTime: reminderEnabled ? reminderTime : null,
      projectIds: selectedProjectIds,
    })

    toast.success('習慣已建立！')
    setTitle('')
    setDescription('')
    setSelectedDrive(2)
    setFrequency('daily')
    setImagePreview(null)
    setShowProjects(false)
    setSelectedProjectIds([])
    setNewProjectName('')
    setShowReminder(false)
    setReminderEnabled(false)
    setExpanded(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const selectedDriveData = drives.find(d => d.id === selectedDrive)
  const selectedProjects = projects.filter(p => selectedProjectIds.includes(p.id))

  return (
    <div className="border-b border-zinc-800 bg-zinc-950">
      <div className="px-4 py-4">
        <div className="flex gap-3">
          <div className="shrink-0">
            <AvatarDisplay avatar={avatar} name={displayName} />
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

                {/* 圖片預覽 */}
                {imagePreview && (
                  <div className="relative">
                    <img src={imagePreview} alt="預覽" className="w-full max-h-48 object-cover rounded-xl border border-zinc-700" />
                    <button
                      onClick={() => { setImagePreview(null); if (fileInputRef.current) fileInputRef.current.value = '' }}
                      className="absolute top-2 right-2 bg-zinc-900/80 text-zinc-300 rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-zinc-800 cursor-pointer"
                    >✕</button>
                  </div>
                )}

                {/* 專案選擇器 */}
                {showProjects && (
                  <div className="bg-violet-500/5 border border-violet-500/20 rounded-xl p-3 space-y-2">
                    <div className="text-xs text-violet-400 font-semibold mb-2">歸屬專案</div>

                    {projects.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {projects.map(p => (
                          <button
                            key={p.id}
                            onClick={() => handleProjectSelect(p.id)}
                            className={`px-2.5 py-1 rounded-full text-xs border transition-all cursor-pointer ${
                              selectedProjectIds.includes(p.id)
                                ? 'bg-violet-500/20 text-violet-300 border-violet-500/40'
                                : 'text-zinc-500 border-zinc-700 hover:border-zinc-500 hover:text-zinc-300'
                            }`}
                          >
                            {selectedProjectIds.includes(p.id) && <span className="mr-1">✓</span>}
                            {p.name}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* 新增專案 */}
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="新增專案名稱..."
                        value={newProjectName}
                        onChange={e => setNewProjectName(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); void handleCreateProject() } }}
                        className="flex-1 bg-zinc-800/60 text-zinc-300 text-sm placeholder-zinc-600 outline-none border border-zinc-700 rounded-lg px-3 py-1.5 focus:border-violet-500/50"
                      />
                      <button
                        onClick={() => { void handleCreateProject() }}
                        disabled={!newProjectName.trim() || isCreatingProject}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-violet-600/30 text-violet-300 hover:bg-violet-600/50 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed border border-violet-500/30"
                      >
                        {isCreatingProject ? '建立中...' : '+ 新增'}
                      </button>
                    </div>
                  </div>
                )}

                {/* 已選專案 tag（收起時也顯示） */}
                {selectedProjects.length > 0 && !showProjects && (
                  <div className="flex flex-wrap gap-1.5">
                    {selectedProjects.map(p => (
                      <span key={p.id} className="px-2 py-0.5 rounded-full text-xs bg-violet-500/15 text-violet-300 border border-violet-500/30">
                        📁 {p.name}
                      </span>
                    ))}
                  </div>
                )}

                {/* 提醒設定 */}
                {showReminder && (
                  <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-3">
                    <div className="text-xs text-amber-400 font-semibold mb-3">設定每日提醒</div>
                    <div className="flex items-center justify-between">
                      <TimePicker
                        value={reminderTime}
                        onChange={t => { setReminderTime(t); setReminderEnabled(false) }}
                      />
                      <button
                        onClick={handleConfirmReminder}
                        className={`px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer border ${
                          reminderEnabled
                            ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                            : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600 border-zinc-600'
                        }`}
                      >
                        {reminderEnabled ? '✓ 已設定' : '確認'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Drive 選擇 */}
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

                {/* 頻率 */}
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
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageSelect}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className={`hover:text-violet-400 transition-colors cursor-pointer ${imagePreview ? 'text-violet-400' : ''}`}
                  title="新增圖片"
                >
                  <ImageIcon size={18} />
                </button>
                <button
                  onClick={handleProjectToggle}
                  className={`hover:text-violet-400 transition-colors cursor-pointer ${showProjects || selectedProjectIds.length > 0 ? 'text-violet-400' : ''}`}
                  title="歸屬專案"
                >
                  <FolderIcon size={18} />
                </button>
                <button
                  onClick={handleReminderToggle}
                  className={`hover:text-amber-400 transition-colors cursor-pointer ${showReminder || reminderEnabled ? 'text-amber-400' : ''}`}
                  title="設定提醒"
                >
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
