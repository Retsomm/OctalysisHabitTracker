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
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-lg bg-zinc-950 border border-zinc-800 rounded-t-3xl sm:rounded-3xl max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800 sticky top-0 bg-zinc-950 z-10">
          <h2 className="text-white font-bold text-lg">編輯習慣</h2>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-white transition-colors text-xl leading-none cursor-pointer"
          >✕</button>
        </div>

        <div className="px-5 py-4 space-y-4">
          {/* 標題 */}
          <div>
            <label className="text-zinc-500 text-xs font-semibold uppercase tracking-wide block mb-1.5">習慣名稱</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              maxLength={100}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-violet-500/50 transition-colors"
            />
          </div>

          {/* 描述 */}
          <div>
            <label className="text-zinc-500 text-xs font-semibold uppercase tracking-wide block mb-1.5">描述</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-zinc-300 text-sm outline-none focus:border-violet-500/50 transition-colors resize-none leading-relaxed"
            />
          </div>

          {/* 圖片 */}
          <div>
            <label className="text-zinc-500 text-xs font-semibold uppercase tracking-wide block mb-1.5">圖片</label>
            {imagePreview ? (
              <div className="relative">
                <img src={imagePreview} alt="預覽" className="w-full max-h-40 object-cover rounded-xl border border-zinc-700" />
                <button
                  onClick={() => { setImagePreview(null); if (fileInputRef.current) fileInputRef.current.value = '' }}
                  className="absolute top-2 right-2 bg-zinc-900/80 text-zinc-300 rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-zinc-800 cursor-pointer"
                >✕</button>
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-3 border border-dashed border-zinc-700 rounded-xl text-zinc-500 hover:text-zinc-300 hover:border-zinc-500 transition-colors text-sm cursor-pointer"
              >
                + 選擇圖片
              </button>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
          </div>

          {/* 專案 */}
          <div>
            <label className="text-zinc-500 text-xs font-semibold uppercase tracking-wide block mb-1.5">歸屬專案</label>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 space-y-2">
              {projects.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {projects.map(p => (
                    <button
                      key={p.id}
                      onClick={() => handleProjectToggle(p.id)}
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
                  {isCreatingProject ? '...' : '+ 新增'}
                </button>
              </div>
            </div>
          </div>

          {/* 提醒 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-zinc-500 text-xs font-semibold uppercase tracking-wide">每日提醒</label>
              <button
                onClick={() => setReminderEnabled(prev => !prev)}
                className={`relative w-10 h-5 rounded-full transition-colors cursor-pointer ${reminderEnabled ? 'bg-amber-500' : 'bg-zinc-700'}`}
              >
                <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${reminderEnabled ? 'left-5.5' : 'left-0.5'}`} />
              </button>
            </div>
            {reminderEnabled && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 flex items-center justify-center">
                <TimePicker value={reminderTime} onChange={setReminderTime} />
              </div>
            )}
          </div>

          {/* Drive */}
          <div>
            <label className="text-zinc-500 text-xs font-semibold uppercase tracking-wide block mb-1.5">驅動力類型</label>
            <div className="flex flex-wrap gap-1.5">
              {drives.map(drive => (
                <button
                  key={drive.id}
                  onClick={() => setSelectedDrive(drive.id)}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all cursor-pointer ${
                    selectedDrive === drive.id
                      ? `${drive.color} ${drive.bgColor} ${drive.borderColor}`
                      : 'text-zinc-500 border-zinc-700 hover:border-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  {drive.id}. {drive.chineseName}
                </button>
              ))}
            </div>
          </div>

          {/* 頻率 */}
          <div>
            <label className="text-zinc-500 text-xs font-semibold uppercase tracking-wide block mb-1.5">頻率</label>
            <div className="flex gap-2">
              {(['daily', 'weekly'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFrequency(f)}
                  className={`px-4 py-2 rounded-xl text-sm border transition-all cursor-pointer ${
                    frequency === f
                      ? 'text-white bg-zinc-700 border-zinc-600 font-semibold'
                      : 'text-zinc-500 border-zinc-700 hover:border-zinc-500'
                  }`}
                >
                  {f === 'daily' ? '每日' : '每週'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-zinc-800 flex items-center justify-end gap-3 sticky bottom-0 bg-zinc-950">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-full text-sm text-zinc-400 hover:text-white border border-zinc-700 hover:border-zinc-500 transition-all cursor-pointer"
          >
            取消
          </button>
          <button
            onClick={() => { void handleSave() }}
            disabled={!title.trim() || isLoading}
            className={`px-6 py-2 rounded-full text-sm font-bold transition-all cursor-pointer ${
              title.trim() && !isLoading
                ? 'bg-violet-600 text-white hover:bg-violet-500 shadow-lg shadow-violet-500/20'
                : 'bg-violet-600/30 text-violet-800 cursor-not-allowed'
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
