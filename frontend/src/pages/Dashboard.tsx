import React, { useState } from 'react'
import { useGetUserProfileQuery, useGetHabitsQuery } from '@/store/api'
import { drives } from '@/constants/drives'
import OctalysisChart from '@/components/octalysis/OctalysisChart'
import DriveCard from '@/components/octalysis/DriveCard'
import XpBar from '@/components/common/XpBar'
import { DashboardSkeleton } from '@/components/common/SkeletonCard'
import { FireIcon, BoltIcon, SproutIcon, RocketIcon, CrownIcon } from '@/components/common/Icons'
import type { Drive, DriveType } from '@/types'

type JourneyStage = 'discovery' | 'onboarding' | 'scaffolding' | 'endgame'

interface JourneyStep {
  key: JourneyStage
  label: string
  description: string
  minLevel: number
  icon: React.ReactNode
}

const journeySteps: JourneyStep[] = [
  { key: 'discovery', label: '探索期', description: '了解八角框架', minLevel: 1, icon: <SproutIcon size={18} /> },
  { key: 'onboarding', label: '入門期', description: '建立基礎習慣', minLevel: 5, icon: <RocketIcon size={18} /> },
  { key: 'scaffolding', label: '成長期', description: '深化習慣系統', minLevel: 10, icon: <BoltIcon size={18} /> },
  { key: 'endgame', label: '精通期', description: '成為習慣大師', minLevel: 20, icon: <CrownIcon size={18} /> },
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

const driveHexColors: Record<number, string> = {
  1: '#6b4a5e', 2: '#a87625', 3: '#4d5a3a', 4: '#3a4a5c',
  5: '#6b4a5e', 6: '#b7552e', 7: '#3a4a5c', 8: '#b7552e',
}

const driveHexSoftColors: Record<number, string> = {
  1: '#e0d0d8', 2: '#ecdcc0', 3: '#d9dcc6', 4: '#cdd4dc',
  5: '#e0d0d8', 6: '#e8d6c6', 7: '#cdd4dc', 8: '#e8d6c6',
}

interface DriveModalProps {
  drive: Drive
  score: number
  onClose: () => void
}

const DriveModal = ({ drive, score, onClose }: DriveModalProps): React.JSX.Element => {
  const details = driveDetails[drive.id]

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-1/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-[22px] border border-line bg-card p-6 shadow-xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-[14px] flex items-center justify-center text-xl font-bold border"
              style={{ background: driveHexSoftColors[drive.id], borderColor: `${driveHexColors[drive.id]}30`, color: driveHexColors[drive.id] }}
            >
              {drive.id}
            </div>
            <div>
              <div className="font-mono text-[12px] tracking-[0.1em] uppercase" style={{ color: driveHexColors[drive.id] }}>
                Drive #{drive.id} · {details.whiteHat ? '白帽' : '黑帽'}
              </div>
              <h2 className="font-serif text-xl text-ink-1 leading-tight">{drive.chineseName}</h2>
              <div className="text-ink-4 text-sm font-mono">{drive.name}</div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-ink-4 hover:text-ink-1 transition-colors text-xl leading-none cursor-pointer w-8 h-8 flex items-center justify-center rounded-full hover:bg-line-2"
          >
            ×
          </button>
        </div>

        <div className="mb-5">
          <div className="flex justify-between text-sm mb-1.5">
            <span className="text-ink-4 font-mono">你的活躍度</span>
            <span className="font-bold font-mono" style={{ color: driveHexColors[drive.id] }}>{score}%</span>
          </div>
          <div className="h-[6px] bg-line-2 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${score}%`, background: driveHexColors[drive.id] }}
            />
          </div>
        </div>

        <p className="text-ink-2 text-sm leading-relaxed mb-5">{details.intro}</p>

        <div>
          <div className="text-ink-4 text-sm font-mono uppercase tracking-widest mb-2">習慣範例</div>
          <div className="space-y-2">
            {details.examples.map((example, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <span className="font-mono text-sm text-ink-4">{i + 1}.</span>
                <span className="text-ink-2">{example}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-5 pt-4 border-t border-line-2">
          <span
            className="text-sm px-3 py-1 rounded-full border font-medium font-mono"
            style={{
              color: driveHexColors[drive.id],
              background: driveHexSoftColors[drive.id],
              borderColor: `${driveHexColors[drive.id]}30`,
            }}
          >
            {details.whiteHat ? '✦ 白帽驅動力 — 帶來長期滿足感' : '◆ 黑帽驅動力 — 短期高效但需謹慎'}
          </span>
        </div>
      </div>
    </div>
  )
}

const Dashboard = (): React.JSX.Element => {
  const { data: profile, isLoading: profileLoading } = useGetUserProfileQuery()
  const { data: habits } = useGetHabitsQuery()
  const habitList = habits ?? []
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
    habitList.filter(h => h.driveType === driveId).length

  const totalXpEarned = habitList.reduce((sum, h) => sum + (h.completed ? h.xp : 0), 0)
  const completedHabits = habitList.filter(h => h.completed).length

  if (profileLoading && !profile) {
    return (
      <div>
        <div className="sticky top-0 bg-ivory/90 backdrop-blur-md border-b border-line-2 z-20 px-6 py-4">
          <div className="font-mono text-[13px] text-ink-4 tracking-[0.14em] uppercase flex items-center gap-2">
            <span className="text-accent">●</span> 儀表板
          </div>
          <h1 className="font-serif text-[32px] text-ink-1 mt-5">你的<em className="italic text-accent">進度</em>一覽</h1>
        </div>
        <DashboardSkeleton />
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="sticky top-0 bg-ivory/90 backdrop-blur-md border-b border-line-2 z-20 px-6 py-4">
        <div className="font-mono text-[13px] text-ink-4 tracking-[0.14em] uppercase flex items-center gap-2">
          <span className="text-accent">●</span>
          儀表板 · {new Date().toLocaleDateString('zh-TW', { month: 'long', day: 'numeric' })}
        </div>
        <h1 className="font-serif text-[32px] leading-[1.02] text-ink-1 mt-5">你的<em className="italic text-accent">進度</em>一覽</h1>
        <p className="text-ink-3 text-base mt-5 max-w-xl leading-relaxed">
          Octalysis 框架將動機拆分為八種驅動力。觀察哪些正在推動你，哪些還沒被喚醒。
        </p>
      </div>

      <div className="px-6 py-6 space-y-6">
        {/* Divider */}
        <div className="flex items-center gap-3.5 text-line">
          <div className="flex-1 h-px bg-line" />
          <span className="font-serif text-[18px] italic text-ink-4">I</span>
          <div className="flex-1 h-px bg-line" />
        </div>

        {/* Hero stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <div className="bg-card border border-line rounded-[14px] p-5 sm:col-span-1">
            <div className="font-mono text-[13px] text-ink-4 tracking-[0.14em] uppercase">等級進度</div>
            <div className="flex items-baseline gap-2.5 mt-1.5">
              <div className="font-serif text-[52px] leading-[1] text-ink-1">Lv. {level}</div>
              <div className="text-ink-3 text-sm">→ Lv. {level + 1}</div>
            </div>
            <XpBar xp={profile?.xp ?? 0} xpToNextLevel={profile?.xpToNextLevel ?? 100} level={level} />
          </div>
          <div className="bg-card border border-line rounded-[14px] p-5">
            <div className="font-mono text-[13px] text-ink-4 tracking-[0.14em] uppercase">連續天數</div>
            <div className="font-serif text-[52px] leading-[1] text-ink-1 mt-1.5">
              {profile?.totalStreak ?? 0}
              <span className="text-[20px] text-ink-3 font-serif italic"> 天</span>
            </div>
            <div className="text-[12px] text-ink-3 mt-2 font-mono">最長紀錄 · {profile?.totalStreak ?? 0} 天</div>
          </div>
          <div className="bg-card border border-line rounded-[14px] p-5">
            <div className="font-mono text-[13px] text-ink-4 tracking-[0.14em] uppercase">今日 XP</div>
            <div className="font-serif text-[52px] leading-[1] text-ink-1 mt-1.5">+{totalXpEarned}</div>
            <div className="text-[12px] text-ink-3 mt-2 font-mono">{completedHabits} / {habitList.length} 完成</div>
          </div>
        </div>

        {/* User profile card */}
        {profile && (
          <div className="bg-card border border-line rounded-[14px] p-5">
            <div className="flex items-center gap-4 mb-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-accent-soft border-2 border-accent/30 flex items-center justify-center text-3xl overflow-hidden">
                  {profile.avatar && (profile.avatar.includes('http') || profile.avatar.startsWith('data:')) ? (
                    <img src={profile.avatar} alt={profile.displayName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <span className="font-serif text-2xl text-accent italic">
                      {(profile.avatar && profile.avatar.length <= 10) ? profile.avatar : (profile.displayName?.charAt(0) || '?')}
                    </span>
                  )}
                </div>
                <div className="absolute -bottom-1 -right-1 bg-accent text-paper text-sm font-bold font-mono px-1.5 py-0.5 rounded-full border-2 border-card">
                  {level}
                </div>
              </div>
              <div className="flex-1">
                <h2 className="font-serif text-2xl text-ink-1">{profile.displayName ?? ''}</h2>
                <p className="text-ink-3 text-sm font-mono">{profile.username ?? ''}</p>
                <div className="flex items-center gap-3 mt-1 flex-wrap">
                  <span className="text-ink-3 text-sm font-mono flex items-center gap-1"><FireIcon size={13} /> {profile.totalStreak ?? 0} 天連勝</span>
                  <span className="text-ink-3 text-sm font-mono flex items-center gap-1"><BoltIcon size={13} /> {completedHabits}/{habitList.length} 完成</span>
                  <span className="text-warm-amber text-sm font-semibold font-mono">+{totalXpEarned} XP 今日</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Octalysis Chart */}
        {profile?.driveScores && (
          <div className="bg-card border border-line rounded-[14px] p-5">
            <div className="font-mono text-[13px] text-ink-4 tracking-[0.14em] uppercase">八角分析</div>
            <div className="font-serif text-[26px] text-ink-1 mt-1 mb-4">雷達圖</div>
            <div className="flex justify-center">
              <OctalysisChart scores={profile.driveScores} />
            </div>
          </div>
        )}

        {/* Divider */}
        <div className="flex items-center gap-3.5 text-line">
          <div className="flex-1 h-px bg-line" />
          <span className="font-serif text-[18px] italic text-ink-4">II</span>
          <div className="flex-1 h-px bg-line" />
        </div>

        {/* Drive Cards Grid */}
        <div>
          <div className="font-mono text-[13px] text-ink-4 tracking-[0.14em] uppercase mb-1">八大驅動力</div>
          <div className="font-serif text-[28px] text-ink-1 mt-1 mb-4">
            點擊卡片了解每<em className="italic text-accent">一種動機</em>
          </div>
          <div className="grid grid-cols-2 gap-3.5">
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
        <div className="bg-card border border-line rounded-[14px] p-5">
          <div className="font-mono text-[13px] text-ink-4 tracking-[0.14em] uppercase">使用者旅程</div>
          <div className="font-serif text-[26px] text-ink-1 mt-1 mb-4">你的習慣成長階段</div>
          <div className="relative">
            <div className="absolute top-5 left-5 right-5 h-px bg-line">
              <div
                className="h-full bg-accent transition-all duration-1000"
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
                        ? 'border-accent bg-accent-soft'
                        : isCompleted
                        ? 'border-warm-amber/50 bg-warm-amber-soft/50'
                        : 'border-line bg-paper'
                    }`}>
                      {step.icon}
                    </div>
                    <div className="text-center">
                      <div className={`text-sm font-medium ${isCurrent ? 'text-accent' : isCompleted ? 'text-ink-2' : 'text-ink-4'}`}>
                        {step.label}
                      </div>
                      <div className="text-ink-4 text-sm leading-tight">{step.description}</div>
                      <div className={`text-sm font-mono ${isCompleted ? 'text-warm-amber' : 'text-ink-4'}`}>
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
