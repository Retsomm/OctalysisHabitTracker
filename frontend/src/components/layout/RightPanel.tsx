import React from 'react'
import { drives } from '@/constants/drives'
import { useGetUserProfileQuery, useGetLeaderboardQuery } from '@/store/api'
import { ACHIEVEMENTS } from '@/types'
import { FireIcon, MedalIcon, SproutIcon, StarIcon, DiamondIcon, TargetIcon } from '@/components/common/Icons'

const achievementIconMap: Record<string, React.ReactNode> = {
  first_habit: <SproutIcon size={18} />,
  week_streak: <FireIcon size={18} />,
  level_5: <StarIcon size={18} />,
  all_drives: <TargetIcon size={18} />,
  hundred_xp: <DiamondIcon size={18} />,
}

const driveHexColors: Record<number, string> = {
  1: '#6b4a5e',
  2: '#a87625',
  3: '#4d5a3a',
  4: '#3a4a5c',
  5: '#6b4a5e',
  6: '#b7552e',
  7: '#3a4a5c',
  8: '#b7552e',
}

const RightPanel = (): React.JSX.Element => {
  const { id: myId, achievements, driveScores } = useGetUserProfileQuery(undefined, {
    selectFromResult: ({ data }) => ({
      id: data?.id,
      achievements: data?.achievements,
      driveScores: data?.driveScores,
    }),
  })
  const { data: leaderboard = [] } = useGetLeaderboardQuery()
  const topLeaderboard = leaderboard.slice(0, 10)

  const allAchievements = ACHIEVEMENTS.map(a => {
    const earned = achievements?.find(ea => ea.id === a.id)
    return { ...a, earned: !!earned, earnedAt: earned?.earnedAt }
  })

  return (
    <aside className="flex flex-col gap-5 py-7 px-1">
      {/* 本週排行 */}
      <section>
        <div className="flex items-baseline justify-between pb-2.5 border-b border-line-2 mb-2.5">
          <span className="font-serif text-[18px] text-ink-1">本週排行</span>
          <span className="font-mono text-sm text-ink-4 tracking-[0.1em]">WK · {new Date().toLocaleDateString('en-US', { week: 'numeric' } as Intl.DateTimeFormatOptions) || Math.ceil(new Date().getDate() / 7)}</span>
        </div>
        <div className="flex flex-col gap-0.5">
          {topLeaderboard.length === 0 ? (
            <div className="grid grid-cols-[20px_1fr_auto] gap-2.5 items-center py-1.5">
              <span className="font-mono text-[12px] text-ink-4">01</span>
              <span className="text-[13px] text-ink-4">尚無排行數據</span>
              <span className="font-mono text-[12px] text-ink-3">—</span>
            </div>
          ) : (
            topLeaderboard.map((lu, i) => {
              const isMe = lu.id === myId
              return (
                <div
                  key={lu.id}
                  className={`grid grid-cols-[20px_1fr_auto] gap-2.5 items-center py-1.5 px-1 rounded-lg transition-colors ${
                    isMe ? 'bg-accent-soft/40' : ''
                  }`}
                >
                  <span className="font-mono text-[12px] text-ink-4">{String(i + 1).padStart(2, '0')}</span>
                  <div>
                    <div className={`text-[13px] ${isMe ? 'text-accent font-medium' : 'text-ink-2'}`}>{lu.displayName}</div>
                  </div>
                  <span className="font-mono text-[12px] text-ink-3">{lu.xp.toLocaleString()} XP</span>
                </div>
              )
            })
          )}
        </div>
      </section>

      {/* 最近成就 */}
      <section>
        <div className="flex items-baseline justify-between pb-2.5 border-b border-line-2 mb-2.5">
          <span className="font-serif text-[18px] text-ink-1">最近成就</span>
          <span className="font-mono text-sm text-ink-4 tracking-[0.1em]">
            {allAchievements.filter(a => a.earned).length} / {allAchievements.length}
          </span>
        </div>
        <div className="flex flex-col gap-2.5">
          {allAchievements.slice(0, 4).map(ach => (
            <div
              key={ach.id}
              className={`flex items-start gap-3 ${!ach.earned ? 'opacity-50' : ''}`}
            >
              <div className={`w-9 h-9 rounded-[10px] border flex items-center justify-center shrink-0 ${
                ach.earned ? 'border-warm-amber/30 bg-warm-amber-soft text-warm-amber' : 'border-line bg-paper text-ink-3'
              }`}>
                {achievementIconMap[ach.id] ?? <MedalIcon size={18} />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13.5px] text-ink-1 font-medium">{ach.title}</div>
                <div className="text-[13px] text-ink-3 mt-0.5 leading-tight">{ach.description}</div>
              </div>
              <span className={`text-sm px-2 py-0.5 rounded-full border font-mono shrink-0 mt-0.5 ${
                ach.earned
                  ? 'bg-ink-1 text-paper border-ink-1'
                  : 'bg-paper text-ink-4 border-line'
              }`}>
                {ach.earned ? '已獲得' : '未獲得'}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* 每日一則 */}
      <section className="bg-ivory border border-line rounded-[14px] p-4">
        <div className="font-serif text-[20px] text-ink-1 leading-[1.3]">
          我們是<em className="italic text-accent">重複的行為</em>所塑造的。因此卓越不是一種行動，而是一種習慣。
        </div>
        <div className="font-mono text-sm text-ink-4 tracking-[0.12em] uppercase mt-2.5">Aristotle · 每日一則</div>
      </section>

      {/* 驅動力概覽 */}
      <section>
        <div className="flex items-baseline justify-between pb-2.5 border-b border-line-2 mb-2.5">
          <span className="font-serif text-[18px] text-ink-1">驅動力概覽</span>
          <span className="font-mono text-sm text-ink-4 tracking-[0.1em]">8 Drives</span>
        </div>
        <div className="flex flex-col gap-0.5">
          {drives.map(drive => {
            const score = driveScores?.[drive.id] ?? 0
            return (
              <div key={drive.id} className="py-2 border-t border-line-2 first:border-t-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-[12px] text-ink-4">0{drive.id}</span>
                    <span className="text-[12.5px] text-ink-2">{drive.chineseName}</span>
                  </div>
                  <span className="font-mono text-[12px] text-ink-3">{score}%</span>
                </div>
                <div className="h-[3px] bg-line-2 rounded-full overflow-hidden mt-1.5">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${score}%`, background: driveHexColors[drive.id] }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </section>
    </aside>
  )
}

export default RightPanel
