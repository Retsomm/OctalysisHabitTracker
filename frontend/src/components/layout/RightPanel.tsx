import React from 'react'
import { drives } from '../../constants/drives'
import { useGetUserProfileQuery, useGetLeaderboardQuery } from '../../store/api'
import { ACHIEVEMENTS } from '../../types'
import { TrophyIcon, MedalIcon, TargetIcon } from '../common/Icons'

const RightPanel = (): React.JSX.Element => {
  const { data: profile } = useGetUserProfileQuery()
  const { data: leaderboard = [] } = useGetLeaderboardQuery()

  const allAchievements = ACHIEVEMENTS.map(a => {
    const earned = profile?.achievements.find(ea => ea.id === a.id)
    return { ...a, earned: !!earned, earnedAt: earned?.earnedAt }
  })

  return (
    <aside className="w-80 flex flex-col gap-4 py-6">
      {/* 排行榜 */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
        <h3 className="text-white font-bold text-base mb-3 flex items-center gap-2">
          <span className="text-amber-400"><TrophyIcon size={15} /></span>
          本週排行榜
        </h3>
        {leaderboard.length === 0 ? (
          <p className="text-zinc-600 text-xs text-center py-4">尚無排行榜資料</p>
        ) : (
          <div className="space-y-2">
            {leaderboard.map((lu, index) => {
              const isMe = lu.id === profile?.id
              const medals = ['🥇', '🥈', '🥉']
              const rankIcon = index < 3 ? medals[index] : `${index + 1}`
              return (
                <div
                  key={lu.id}
                  className={`flex items-center gap-3 px-2 py-2 rounded-xl transition-colors ${
                    isMe
                      ? 'bg-violet-500/10 border border-violet-500/20'
                      : 'hover:bg-zinc-800/50'
                  }`}
                >
                  <span className="text-base w-6 text-center">{rankIcon}</span>
                  <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-base border border-zinc-700 shrink-0 overflow-hidden">
                    {lu.avatar && (lu.avatar.includes('http') || lu.avatar.startsWith('data:')) ? (
                      <img src={lu.avatar} alt={lu.displayName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <span>{(lu.avatar && lu.avatar.length <= 10) ? lu.avatar : lu.displayName?.charAt(0) || '?'}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm font-semibold truncate ${isMe ? 'text-violet-400' : 'text-white'}`}>
                      {lu.displayName}
                    </div>
                    <div className="text-zinc-500 text-xs">{lu.username}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-amber-400 text-xs font-bold">{lu.xp.toLocaleString()} XP</div>
                    <div className="text-zinc-500 text-xs">Lv.{lu.level}</div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* 你的成就 */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
        <h3 className="text-white font-bold text-base mb-3 flex items-center gap-2">
          <span className="text-amber-400"><MedalIcon size={15} /></span>
          最近成就
        </h3>
        <div className="space-y-2">
          {allAchievements.map(ach => (
            <div
              key={ach.id}
              className={`flex items-center gap-3 p-2 rounded-xl border transition-all ${
                ach.earned
                  ? 'border-zinc-700 bg-zinc-800/50'
                  : 'border-zinc-800 opacity-40 grayscale'
              }`}
            >
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-lg border ${
                ach.earned ? 'border-amber-500/30 bg-amber-500/10' : 'border-zinc-700 bg-zinc-800'
              }`}>
                {ach.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-white text-xs font-semibold">{ach.title}</div>
                <div className="text-zinc-500 text-xs truncate">{ach.description}</div>
              </div>
              {ach.earned && (
                <span className="text-emerald-400 text-xs">✓</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Drive Scores Quick View */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
        <h3 className="text-white font-bold text-base mb-3 flex items-center gap-2">
          <span className="text-violet-400"><TargetIcon size={15} /></span>
          驅動力概覽
        </h3>
        <div className="space-y-2">
          {drives.map(drive => {
            const score = profile?.driveScores?.[drive.id] ?? 0
            return (
              <div key={drive.id} className="flex items-center gap-2">
                <span className={`text-xs font-semibold w-4 ${drive.color}`}>{drive.id}</span>
                <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${drive.barColor}`}
                    style={{ width: `${score}%` }}
                  />
                </div>
                <span className="text-zinc-400 text-xs w-8 text-right">{score}</span>
              </div>
            )
          })}
        </div>
      </div>
    </aside>
  )
}

export default RightPanel
