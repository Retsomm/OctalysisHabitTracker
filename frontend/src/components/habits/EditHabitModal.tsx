import React, { useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { useUpdateHabitFullMutation, useGetProjectsQuery, useCreateProjectMutation } from '@/store/api'
import { drives } from '@/constants/drives'
import type { DriveType, FeedHabit } from '@/types'
import TimePicker from '@/components/common/TimePicker'

interface EditHabitModalProps {
  habit: FeedHabit
  onClose: () => void
}

const EditHabitModal = ({ habit, onClose }: EditHabitModalProps): React.JSX.Element => {
  const [updateHabit, { isLoading }] = useUpdateHabitFullMutation()
  const [createProject] = useCreateProjectMutation()
  const { data: projects = [] } = useGetProjectsQuery()

  const [title, setTitle] = useState(habit.title)
  const [description, setDescription] = useState(habit.description)
  const [selectedDrive, setSelectedDrive] = useState<DriveType>(habit.driveType)
  const [frequency, setFrequency] = useState<'daily' | 'weekly'>(habit.frequency)
  const [imagePreview, setImagePreview] = useState<string | null>(habit.imageUrl ?? null)
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>(habit.projects.map(p => p.id))
  const [reminderEnabled, setReminderEnabled] = useState(!!habit.reminderTime)
  const [reminderTime, setReminderTime] = useState(habit.reminderTime ?? '08:00')
  const [newProjectName, setNewProjectName] = useState('')
  const [isCreatingProject, setIsCreatingProject] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      toast.error('圖片大小不可超過 5MB')
      return
    }
    const reader = new FileReader()
    reader.onload = ev => setImagePreview(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  const handleProjectToggle = (id: string): void => {
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
      toast.success(`已建立專案「${project.name}」`)
    } catch {
      toast.error('建立專案失敗')
    } finally {
      setIsCreatingProject(false)
    }
  }

  const handleSave = async (): Promise<void> => {
    if (!title.trim()) return
    await updateHabit({
      id: habit.id,
      title: title.trim(),
      description: description.trim(),
      driveType: selectedDrive,
      frequency,
      imageUrl: imagePreview ?? null,
      reminderTime: reminderEnabled ? reminderTime : null,
      projectIds: selectedProjectIds,
    })
    toast.success('習慣已更新！')
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-ink-1/40 backdrop-blur-sm p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-lg bg-card border border-line rounded-t-3xl sm:rounded-[22px] max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-line sticky top-0 bg-card z-10">
          <h2 className="font-serif text-[22px] text-ink-1">編輯習慣</h2>
          <button
            onClick={onClose}
            className="text-ink-4 hover:text-ink-1 transition-colors text-xl leading-none cursor-pointer w-8 h-8 flex items-center justify-center rounded-full hover:bg-line-2"
          >✕</button>
        </div>

        <div className="px-5 py-4 space-y-4">
          {/* 標題 */}
          <div>
            <label className="font-mono text-sm text-ink-4 uppercase tracking-[0.12em] block mb-1.5">習慣名稱</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              maxLength={100}
              className="w-full bg-paper border border-line rounded-[10px] px-4 py-2.5 text-ink-1 text-sm outline-none focus:border-accent/40 transition-colors"
            />
          </div>

          {/* 描述 */}
          <div>
            <label className="font-mono text-sm text-ink-4 uppercase tracking-[0.12em] block mb-1.5">描述</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              className="w-full bg-paper border border-line rounded-[10px] px-4 py-2.5 text-ink-2 text-sm outline-none focus:border-accent/40 transition-colors resize-none leading-relaxed"
            />
          </div>

          {/* 圖片 */}
          <div>
            <label className="font-mono text-sm text-ink-4 uppercase tracking-[0.12em] block mb-1.5">圖片</label>
            {imagePreview ? (
              <div className="relative">
                <img src={imagePreview} alt="預覽" className="w-full max-h-40 object-cover rounded-[10px] border border-line" />
                <button
                  onClick={() => { setImagePreview(null); if (fileInputRef.current) fileInputRef.current.value = '' }}
                  className="absolute top-2 right-2 bg-paper/80 text-ink-3 rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-paper cursor-pointer border border-line"
                >✕</button>
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-3 border border-dashed border-line rounded-[10px] text-ink-4 hover:text-ink-2 hover:border-ink-4/40 transition-colors text-sm cursor-pointer"
              >
                + 選擇圖片
              </button>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
          </div>

          {/* 專案 */}
          <div>
            <label className="font-mono text-sm text-ink-4 uppercase tracking-[0.12em] block mb-1.5">歸屬專案</label>
            <div className="bg-paper border border-line rounded-[10px] p-3 space-y-2">
              {projects.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {projects.map(p => (
                    <button
                      key={p.id}
                      onClick={() => handleProjectToggle(p.id)}
                      className={`px-2.5 py-1 rounded-full text-sm border transition-all cursor-pointer ${
                        selectedProjectIds.includes(p.id)
                          ? 'bg-accent/10 text-accent border-accent/30'
                          : 'text-ink-4 border-line hover:border-ink-4 hover:text-ink-2'
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
                  className="flex-1 bg-card text-ink-2 text-sm placeholder-ink-4 outline-none border border-line rounded-lg px-3 py-1.5 focus:border-accent/40"
                />
                <button
                  onClick={() => { void handleCreateProject() }}
                  disabled={!newProjectName.trim() || isCreatingProject}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium bg-accent/10 text-accent hover:bg-accent/20 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed border border-accent/20"
                >
                  {isCreatingProject ? '...' : '+ 新增'}
                </button>
              </div>
            </div>
          </div>

          {/* 提醒 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="font-mono text-sm text-ink-4 uppercase tracking-[0.12em]">每日提醒</label>
              <button
                onClick={() => setReminderEnabled(prev => !prev)}
                className={`relative w-10 h-5 rounded-full transition-colors cursor-pointer ${reminderEnabled ? 'bg-warm-amber' : 'bg-line'}`}
              >
                <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${reminderEnabled ? 'left-5.5' : 'left-0.5'}`} />
              </button>
            </div>
            {reminderEnabled && (
              <div className="bg-paper border border-line rounded-[10px] p-3 flex items-center justify-center">
                <TimePicker value={reminderTime} onChange={setReminderTime} />
              </div>
            )}
          </div>

          {/* Drive */}
          <div>
            <label className="font-mono text-sm text-ink-4 uppercase tracking-[0.12em] block mb-1.5">驅動力類型</label>
            <div className="flex flex-wrap gap-1.5">
              {drives.map(drive => (
                <button
                  key={drive.id}
                  onClick={() => setSelectedDrive(drive.id)}
                  className={`px-2.5 py-1 rounded-full text-sm font-medium border transition-all cursor-pointer ${
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

          {/* 頻率 */}
          <div>
            <label className="font-mono text-sm text-ink-4 uppercase tracking-[0.12em] block mb-1.5">頻率</label>
            <div className="flex gap-2">
              {(['daily', 'weekly'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFrequency(f)}
                  className={`px-4 py-2 rounded-[10px] text-sm border transition-all cursor-pointer ${
                    frequency === f
                      ? 'text-ink-1 bg-ink-1/10 border-ink-1/30 font-medium'
                      : 'text-ink-4 border-line hover:border-ink-4'
                  }`}
                >
                  {f === 'daily' ? '每日' : '每週'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-line flex items-center justify-end gap-3 sticky bottom-0 bg-card">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-[10px] text-sm text-ink-2 hover:text-ink-1 border border-line hover:border-ink-4/30 transition-all cursor-pointer"
          >
            取消
          </button>
          <button
            onClick={() => { void handleSave() }}
            disabled={!title.trim() || isLoading}
            className={`px-6 py-2 rounded-[10px] text-sm font-medium transition-all cursor-pointer border ${
              title.trim() && !isLoading
                ? 'bg-accent border-accent text-paper hover:bg-accent/90'
                : 'bg-accent-soft/50 border-accent/20 text-accent/50 cursor-not-allowed'
            }`}
          >
            {isLoading ? '儲存中...' : '儲存'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default EditHabitModal
