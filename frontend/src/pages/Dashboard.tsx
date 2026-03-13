import React, { useState } from 'react'
import { useGetUserProfileQuery, useGetHabitsQuery } from '../store/api'
import { drives } from '../constants/drives'
import OctalysisChart from '../components/octalysis/OctalysisChart'
import DriveCard from '../components/octalysis/DriveCard'
import XpBar from '../components/common/XpBar'
import type { Drive, DriveType } from '../types'

type JourneyStage = 'discovery' | 'onboarding' | 'scaffolding' | 'endgame'

interface JourneyStep {
  key: JourneyStage
  label: string
  description: string
  minLevel: number
  icon: string
}

const journeySteps: JourneyStep[] = [
  { key: 'discovery', label: '探索期', description: '了解八角框架', minLevel: 1, icon: '🌱' },
  { key: 'onboarding', label: '入門期', description: '建立基礎習慣', minLevel: 5, icon: '🚀' },
  { key: 'scaffolding', label: '成長期', description: '深化習慣系統', minLevel: 10, icon: '⚡' },
  { key: 'endgame', label: '精通期', description: '成為習慣大師', minLevel: 20, icon: '👑' },
]

const driveDetails: Record<number, { intro: string; examples: string[]; whiteHat: boolean }> = {
  1: {
    intro: '史詩意義與使命感讓人相信自己正在做比個人更偉大的事情，或被「選中」去完成某項任務。這是最強大的長期動機來源之一。',
    examples: ['為社會公益建立習慣', '每日冥想連結人生使命', '培養利他的生活方式'],
    whiteHat: true,
  },
  2: {
    intro: '發展成就感驅動人們追求進步、技能提升和克服挑戰。看到自己的成長與進步數字是強力的內在激勵。',
    examples: ['每日閱讀提升知識', '練習新技能並追蹤進步', '完成具挑戰性的目標'],
    whiteHat: true,
  },
  3: {
    intro: '創意授權讓人能夠透過創意表達自我，並透過即時回饋感到滿足。當人們有策略選擇與創意空間時，參與度大幅提升。',
    examples: ['每日寫作或繪圖練習', '嘗試新的解決方案', '設計個人化的習慣系統'],
    whiteHat: true,
  },
  4: {
    intro: '所有權與掌控感讓人覺得自己擁有某些東西，因而想要改善和保護它。累積的資產（XP、連勝）強化了這種感覺。',
    examples: ['維護個人財務記錄', '建立自己的知識庫', '打造屬於自己的習慣組合'],
    whiteHat: true,
  },
  5: {
    intro: '社會影響力包含師徒制、社交接受、競爭和同伴壓力。人類作為社會動物，他人的行為和認可深刻影響著我們的動機。',
    examples: ['與朋友互相打卡鼓勵', '分享學習成果到社群', '加入習慣挑戰小組'],
    whiteHat: true,
  },
  6: {
    intro: '稀缺性與渴望讓人更珍視難以獲得或限量的事物。限時挑戰、限量名額等機制能有效激發行動力。',
    examples: ['限時完成重要任務', '利用限量挑戰保持動力', '設置截止日期強化執行力'],
    whiteHat: false,
  },
  7: {
    intro: '不確定性與好奇心讓大腦對未知充滿探索欲。隨機獎勵、神秘元素和意外驚喜能持續抓住注意力。',
    examples: ['隨機學習新事物', '挑戰未知領域的習慣', '打開意外驚喜獎勵盒'],
    whiteHat: false,
  },
  8: {
    intro: '損失規避與迫切感驅使人們避免失去已擁有的東西。害怕打破連勝紀錄或失去成就，是強大的短期行動催化劑。',
    examples: ['維護不間斷的每日連勝', '保護已累積的 XP 分數', '避免中斷已建立的好習慣'],
    whiteHat: false,
  },
}

interface DriveModalProps {
  drive: Drive
  score: number
  onClose: () => void
}

const DriveModal = ({ drive, score, onClose }: DriveModalProps): React.JSX.Element => {
  const details = driveDetails[drive.id]
  const driveSymbols: Record<number, string> = { 1: '✦', 2: '◈', 3: '◎', 4: '◆', 5: '◉', 6: '◑', 7: '◐', 8: '◗' }
  const symbol = driveSymbols[drive.id] ?? '✦'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className={`w-full max-w-md rounded-3xl border p-6 ${drive.bgColor} ${drive.borderColor} bg-zinc-950`}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl font-bold border ${drive.bgColor} ${drive.borderColor} ${drive.color}`}>
              {symbol}
            </div>
            <div>
              <div className={`text-xs font-semibold ${drive.color}`}>Drive #{drive.id} · {details.whiteHat ? '白帽' : '黑帽'}</div>
              <h2 className="text-white font-bold text-lg leading-tight">{drive.chineseName}</h2>
              <div className="text-zinc-500 text-xs">{drive.name}</div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-white transition-colors text-xl leading-none cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Score bar */}
        <div className="mb-5">
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-zinc-500">你的活躍度</span>
            <span className={`font-bold ${drive.color}`}>{score}%</span>
          </div>
          <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${drive.barColor}`}
              style={{ width: `${score}%` }}
            />
          </div>
        </div>

        {/* Intro */}
        <p className="text-zinc-300 text-sm leading-relaxed mb-5">{details.intro}</p>

        {/* Examples */}
        <div>
          <div className="text-zinc-500 text-xs font-semibold uppercase tracking-wider mb-2">習慣範例</div>
          <div className="space-y-2">
            {details.examples.map((example, i) => (
              <div key={i} className={`flex items-center gap-2 text-sm ${drive.color}`}>
                <span className="text-xs opacity-60">{i + 1}.</span>
                <span className="text-zinc-300">{example}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tag */}
        <div className="mt-5 pt-4 border-t border-zinc-800">
          <span className={`text-xs px-3 py-1 rounded-full border font-medium ${drive.color} ${drive.bgColor} ${drive.borderColor}`}>
            {details.whiteHat ? '✦ 白帽驅動力 — 帶來長期滿足感' : '◆ 黑帽驅動力 — 短期高效但需謹慎'}
          </span>
        </div>
      </div>
    </div>
  )
}

const Dashboard = (): React.JSX.Element => {
  const { data: profile, isLoading: profileLoading } = useGetUserProfileQuery()
  const { data: habits = [] } = useGetHabitsQuery()
  const [selectedDrive, setSelectedDrive] = useState<Drive | null>(null)

  const getCurrentStage = (level: number): JourneyStage => {
    if (level >= 20) return 'endgame'
    if (level >= 10) return 'scaffolding'
    if (level >= 5) return 'onboarding'
    return 'discovery'
  }

  const level = profile?.level ?? 1
  const currentStage = getCurrentStage(level)
  const currentStageIndex = journeySteps.findIndex(s => s.key === currentStage)

  const habitCountByDrive = (driveId: DriveType): number =>
    habits.filter(h => h.driveType === driveId).length

  const totalXpEarned = habits.reduce((sum, h) => sum + (h.completed ? h.xp : 0), 0)
  const completedHabits = habits.filter(h => h.completed).length

  if (profileLoading) {
    return (
      <div>
        <div className="sticky top-0 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800 z-20 px-4 py-3">
          <h1 className="text-white font-bold text-xl">儀表板</h1>
        </div>
        <div className="flex items-center justify-center py-20">
          <svg className="animate-spin w-6 h-6 text-zinc-500" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="sticky top-0 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800 z-20 px-4 py-3">
        <h1 className="text-white font-bold text-xl">儀表板</h1>
      </div>

      <div className="px-4 py-6 space-y-6">
        {/* User Level & XP */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <div className="flex items-center gap-4 mb-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-zinc-800 border-2 border-violet-500/50 flex items-center justify-center text-3xl overflow-hidden">
                {profile?.avatar && (profile.avatar.includes('http') || profile.avatar.startsWith('data:')) ? (
                  <img src={profile.avatar} alt={profile.displayName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <span>{(profile?.avatar && profile.avatar.length <= 10) ? profile.avatar : (profile?.displayName?.charAt(0) || '?')}</span>
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 bg-violet-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-full border border-zinc-950">
                {profile?.level ?? 1}
              </div>
            </div>
            <div className="flex-1">
              <h2 className="text-white font-bold text-lg">{profile?.displayName ?? ''}</h2>
              <p className="text-zinc-500 text-sm">{profile?.username ?? ''}</p>
              <div className="flex items-center gap-3 mt-1 flex-wrap">
                <span className="text-zinc-400 text-xs">🔥 {profile?.totalStreak ?? 0} 天連勝</span>
                <span className="text-zinc-400 text-xs">⚡ {completedHabits}/{habits.length} 完成</span>
                <span className="text-amber-400 text-xs font-semibold">+{totalXpEarned} XP 今日</span>
              </div>
            </div>
          </div>
          <XpBar xp={profile?.xp ?? 0} xpToNextLevel={profile?.xpToNextLevel ?? 100} level={profile?.level ?? 1} />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: '總習慣', value: habits.length, color: 'text-blue-400' },
            { label: '最長連勝', value: `${profile?.totalStreak ?? 0}天`, color: 'text-orange-400' },
            { label: '總XP', value: (profile?.xp ?? 0).toLocaleString(), color: 'text-amber-400' },
          ].map(stat => (
            <div key={stat.label} className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-center">
              <div className={`text-lg font-bold ${stat.color}`}>{stat.value}</div>
              <div className="text-zinc-500 text-xs mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Octalysis Chart */}
        {profile?.driveScores && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
            <h3 className="text-white font-bold text-base mb-1">八角分析雷達圖</h3>
            <p className="text-zinc-500 text-xs mb-4">你的八大驅動力分布圖</p>
            <div className="flex justify-center">
              <OctalysisChart scores={profile.driveScores} />
            </div>
          </div>
        )}

        {/* Drive Cards Grid */}
        <div>
          <h3 className="text-white font-bold text-base mb-1">八大驅動力</h3>
          <p className="text-zinc-500 text-xs mb-3">點擊卡片了解各驅動力介紹</p>
          <div className="grid grid-cols-2 gap-3">
            {drives.map(drive => (
              <DriveCard
                key={drive.id}
                drive={drive}
                score={profile?.driveScores?.[drive.id] ?? 0}
                habitCount={habitCountByDrive(drive.id)}
                onClick={() => setSelectedDrive(drive)}
              />
            ))}
          </div>
        </div>

        {/* User Journey */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <h3 className="text-white font-bold text-base mb-1">使用者旅程</h3>
          <p className="text-zinc-500 text-xs mb-4">你的習慣成長階段</p>
          <div className="relative">
            {/* Progress line */}
            <div className="absolute top-5 left-5 right-5 h-0.5 bg-zinc-800">
              <div
                className="h-full bg-gradient-to-r from-violet-500 to-amber-500 transition-all duration-1000"
                style={{ width: `${(currentStageIndex / (journeySteps.length - 1)) * 100}%` }}
              />
            </div>
            <div className="flex justify-between relative">
              {journeySteps.map((step, index) => {
                const isCompleted = index <= currentStageIndex
                const isCurrent = index === currentStageIndex
                return (
                  <div key={step.key} className="flex flex-col items-center gap-2 w-20">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl border-2 transition-all z-10 ${
                      isCurrent
                        ? 'border-violet-500 bg-violet-500/20 shadow-lg shadow-violet-500/30'
                        : isCompleted
                        ? 'border-amber-500/50 bg-amber-500/10'
                        : 'border-zinc-700 bg-zinc-900'
                    }`}>
                      {step.icon}
                    </div>
                    <div className="text-center">
                      <div className={`text-xs font-semibold ${isCurrent ? 'text-violet-400' : isCompleted ? 'text-zinc-300' : 'text-zinc-600'}`}>
                        {step.label}
                      </div>
                      <div className="text-zinc-600 text-xs leading-tight">{step.description}</div>
                      <div className={`text-xs ${isCompleted ? 'text-amber-400' : 'text-zinc-700'}`}>
                        Lv.{step.minLevel}+
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Drive Detail Modal */}
      {selectedDrive && (
        <DriveModal
          drive={selectedDrive}
          score={profile?.driveScores?.[selectedDrive.id] ?? 0}
          onClose={() => setSelectedDrive(null)}
        />
      )}
    </div>
  )
}

export default Dashboard
