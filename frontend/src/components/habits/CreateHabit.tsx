import React, { useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { useCreateHabitMutation, useGetUserProfileQuery, useGetProjectsQuery, useCreateProjectMutation } from '@/store/api'
import { drives } from '@/constants/drives'
import type { DriveType } from '@/types'
import { ImageIcon, FolderIcon, BellIcon } from '@/components/common/Icons'
import TimePicker from '@/components/common/TimePicker'

const AvatarDisplay = ({ avatar, name }: { avatar?: string; name?: string }): React.JSX.Element => {
  const isImage = avatar?.includes('http') || avatar?.startsWith('data:')
  const isShortStr = avatar && avatar.length <= 10 && !isImage

  if (isImage) {
    return <img src={avatar} alt={name} className="w-10 h-10 rounded-full object-cover border border-line shrink-0" referrerPolicy="no-referrer" />
  }
  return (
    <div className="w-10 h-10 rounded-full bg-accent-soft border border-line flex items-center justify-center text-accent font-serif text-lg shrink-0">
      {isShortStr ? avatar : '✎'}
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

  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [showProjects, setShowProjects] = useState(false)
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([])
  const [newProjectName, setNewProjectName] = useState('')
  const [isCreatingProject, setIsCreatingProject] = useState(false)

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
    <div className="border-b border-line bg-card px-5 py-5">
      <div className="flex gap-4">
        <div className="shrink-0">
          <AvatarDisplay avatar={avatar} name={displayName} />
        </div>
        <div className="flex-1">
          <input
            type="text"
            placeholder="寫下一個念頭，或點擊下方開始…"
            value={title}
            onChange={e => setTitle(e.target.value)}
            onFocus={() => setExpanded(true)}
            className="w-full bg-transparent text-ink-1 text-[15px] placeholder-ink-4 outline-none border-none mb-2 leading-relaxed"
          />

          {expanded && (
            <div className="space-y-3 border-t border-dashed border-line-2 pt-3">
              <textarea
                placeholder="描述這個習慣的意義和做法..."
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={2}
                className="w-full bg-transparent text-ink-2 text-sm placeholder-ink-4 outline-none border-none resize-none leading-relaxed"
              />

              {imagePreview && (
                <div className="relative">
                  <img src={imagePreview} alt="預覽" className="w-full max-h-48 object-cover rounded-[10px] border border-line" />
                  <button
                    onClick={() => { setImagePreview(null); if (fileInputRef.current) fileInputRef.current.value = '' }}
                    className="absolute top-2 right-2 bg-paper/80 text-ink-3 rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-paper cursor-pointer border border-line"
                  >✕</button>
                </div>
              )}

              {showProjects && (
                <div className="bg-accent-soft/20 border border-accent/20 rounded-[10px] p-3 space-y-2">
                  <div className="text-sm text-accent font-medium mb-2">歸屬專案</div>
                  {projects.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {projects.map(p => (
                        <button
                          key={p.id}
                          onClick={() => handleProjectSelect(p.id)}
                          className={`px-2.5 py-1 rounded-full text-sm border transition-all cursor-pointer ${
                            selectedProjectIds.includes(p.id)
                              ? 'bg-accent/10 text-accent border-accent/30'
                              : 'text-ink-3 border-line hover:border-ink-4 hover:text-ink-2'
                          }`}
                        >
                          {selectedProjectIds.includes(p.id) && <span className="mr-1">✓</span>}
                          {p.name}
                        </button>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="新增專案名稱..."
                      value={newProjectName}
                      onChange={e => setNewProjectName(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); void handleCreateProject() } }}
                      className="flex-1 bg-paper text-ink-2 text-sm placeholder-ink-4 outline-none border border-line rounded-lg px-3 py-1.5 focus:border-accent/40"
                    />
                    <button
                      onClick={() => { void handleCreateProject() }}
                      disabled={!newProjectName.trim() || isCreatingProject}
                      className="px-3 py-1.5 rounded-lg text-sm font-medium bg-accent/10 text-accent hover:bg-accent/20 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed border border-accent/20"
                    >
                      {isCreatingProject ? '建立中...' : '+ 新增'}
                    </button>
                  </div>
                </div>
              )}

              {selectedProjects.length > 0 && !showProjects && (
                <div className="flex flex-wrap gap-1.5">
                  {selectedProjects.map(p => (
                    <span key={p.id} className="px-2 py-0.5 rounded-full text-sm bg-accent-soft text-accent border border-accent/20">
                      📁 {p.name}
                    </span>
                  ))}
                </div>
              )}

              {showReminder && (
                <div className="bg-warm-amber-soft/30 border border-warm-amber/20 rounded-[10px] p-3">
                  <div className="text-sm text-warm-amber font-medium mb-3">設定每日提醒</div>
                  <div className="flex items-center justify-between">
                    <TimePicker
                      value={reminderTime}
                      onChange={t => { setReminderTime(t); setReminderEnabled(false) }}
                    />
                    <button
                      onClick={handleConfirmReminder}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all cursor-pointer border ${
                        reminderEnabled
                          ? 'bg-warm-amber/10 text-warm-amber border-warm-amber/30'
                          : 'bg-paper text-ink-2 hover:bg-line-2 border-line'
                      }`}
                    >
                      {reminderEnabled ? '✓ 已設定' : '確認'}
                    </button>
                  </div>
                </div>
              )}

              <div>
                <div className="text-ink-4 text-sm mb-2">選擇驅動力類型</div>
                <div className="flex flex-wrap gap-1.5">
                  {drives.map(drive => (
                    <button
                      key={drive.id}
                      onClick={() => setSelectedDrive(drive.id)}
                      className={`px-2.5 py-1 rounded-full text-sm font-medium border transition-all duration-200 cursor-pointer ${
                        selectedDrive === drive.id
                          ? `${drive.color} ${drive.bgColor} ${drive.borderColor}`
                          : 'text-ink-4 border-line hover:border-ink-4 hover:text-ink-2'
                      }`}
                    >
                      {drive.id}. {drive.chineseName}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="text-ink-4 text-sm">頻率：</div>
                {(['daily', 'weekly'] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setFrequency(f)}
                    className={`px-3 py-1 rounded-full text-sm border transition-all cursor-pointer ${
                      frequency === f
                        ? 'text-ink-1 bg-ink-1/10 border-ink-1/30'
                        : 'text-ink-4 border-line hover:border-ink-4'
                    }`}
                  >
                    {f === 'daily' ? '每日' : '每週'}
                  </button>
                ))}
                {selectedDriveData && (
                  <div className="ml-auto flex items-center gap-1.5">
                    <span className={`text-sm font-mono ${selectedDriveData.color}`}>
                      {selectedDriveData.chineseName}
                    </span>
                    <span className="text-sm font-mono text-warm-amber">
                      +{frequency === 'daily' ? 50 : 100} XP
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mt-3 pt-3 border-t border-line-2">
            <div className="flex items-center gap-2 text-ink-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageSelect}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className={`p-1.5 rounded-lg hover:bg-line-2 hover:text-ink-2 transition-colors cursor-pointer ${imagePreview ? 'text-accent' : ''}`}
                title="新增圖片"
              >
                <ImageIcon size={16} />
              </button>
              <button
                onClick={handleProjectToggle}
                className={`p-1.5 rounded-lg hover:bg-line-2 hover:text-ink-2 transition-colors cursor-pointer ${showProjects || selectedProjectIds.length > 0 ? 'text-accent' : ''}`}
                title="歸屬專案"
              >
                <FolderIcon size={16} />
              </button>
              <button
                onClick={handleReminderToggle}
                className={`p-1.5 rounded-lg hover:bg-line-2 hover:text-ink-2 transition-colors cursor-pointer ${showReminder || reminderEnabled ? 'text-warm-amber' : ''}`}
                title="設定提醒"
              >
                <BellIcon size={16} />
              </button>
            </div>
            <div className="flex items-center gap-2">
              {expanded && title.length > 0 && (
                <span className={`font-mono text-sm ${title.length > 80 ? 'text-accent' : 'text-ink-4'}`}>
                  {title.length}/100
                </span>
              )}
              <button
                onClick={() => { void handleSubmit() }}
                disabled={!title.trim() || isLoading}
                className={`px-5 py-2 rounded-[10px] text-sm font-medium transition-all duration-200 cursor-pointer border ${
                  title.trim() && !isLoading
                    ? 'bg-accent border-accent text-paper hover:bg-accent/90'
                    : 'bg-accent-soft/50 border-accent/20 text-accent/50 cursor-not-allowed'
                }`}
              >
                {isLoading ? '建立中...' : '建立習慣'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreateHabit
