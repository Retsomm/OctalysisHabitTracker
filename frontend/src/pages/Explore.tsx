import React, { useState } from 'react'
import { drives } from '@/constants/drives'
import { useGetLeaderboardQuery, useGetActivityQuery, useGetTrendingDrivesQuery } from '@/store/api'
import UserProfileModal from '@/components/common/UserProfileModal'

const formatTimestamp = (ts: string): string => {
  const diff = Date.now() - new Date(ts).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return '剛剛'
  if (mins < 60) return `${mins}分鐘前`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}小時前`
  return `${Math.floor(hours / 24)}天前`
}

const AvatarDisplay = ({ avatar, name }: { avatar?: string; name?: string }): React.JSX.Element => {
  const isImage = avatar?.includes('http') || avatar?.startsWith('data:')
  const isShortStr = avatar && avatar.length <= 10 && !isImage

  if (isImage) {
    return <img src={avatar} alt={name} className="w-10 h-10 rounded-full object-cover border border-line shrink-0" referrerPolicy="no-referrer" />
  }
  return (
    <div className="w-10 h-10 rounded-full bg-line border border-line flex items-center justify-center text-xl shrink-0">
      {isShortStr ? avatar : (name?.charAt(0) || '?')}
    </div>
  )
}

const LeaderboardAvatarDisplay = ({ avatar, name }: { avatar?: string; name?: string }): React.JSX.Element => {
  const isImage = avatar?.includes('http') || avatar?.startsWith('data:')
  const isShortStr = avatar && avatar.length <= 10 && !isImage

  if (isImage) {
    return <img src={avatar} alt={name} className="w-11 h-11 rounded-full object-cover border border-line" referrerPolicy="no-referrer" />
  }
  return (
    <div className="w-11 h-11 rounded-full bg-line border border-line flex items-center justify-center text-xl font-serif italic">
      {isShortStr ? avatar : (name?.charAt(0) || '?')}
    </div>
  )
}

const Explore = (): React.JSX.Element => {
  const { data: leaderboard = [] } = useGetLeaderboardQuery()
  const { data: activityFeed = [] } = useGetActivityQuery()
  const { data: trendingDrives = [] } = useGetTrendingDrivesQuery()
  const topLeaderboard = leaderboard.slice(0, 10)
  const latestActivityFeed = activityFeed.slice(0, 5)

  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)

  const sortedDrives = [...drives].sort((a, b) => {
    const aCount = trendingDrives.find(t => t.driveType === a.id)?.count ?? 0
    const bCount = trendingDrives.find(t => t.driveType === b.id)?.count ?? 0
    return bCount - aCount
  })

  return (
    <div>
      {/* Header */}
      <div className="sticky top-0 bg-ivory/90 backdrop-blur-md border-b border-line-2 z-20 px-6 py-4">
        <div className="font-mono text-[13px] text-ink-4 tracking-[0.14em] uppercase flex items-center gap-2">
          <span className="text-accent">●</span> 探索 · 社群與動機
        </div>
        <h1 className="font-serif text-[32px] leading-[1.02] text-ink-1 mt-5">找到你的<em className="italic text-accent">同路人</em>。</h1>
        <p className="text-ink-3 text-base mt-5 leading-relaxed">瀏覽八大驅動力分類下的熱門習慣、加入社群挑戰、關注你仰慕的實踐者。</p>
      </div>

      <div className="px-6 py-5 space-y-6">
        {/* Divider */}
        <div className="flex items-center gap-3.5 text-line">
          <div className="flex-1 h-px bg-line" />
          <span className="font-serif text-[18px] italic text-ink-4">I</span>
          <div className="flex-1 h-px bg-line" />
        </div>

        {/* Trending Drives */}
        <div>
            <div className="font-mono text-[13px] text-ink-4 tracking-[0.14em] uppercase mb-1">熱門驅動力類別</div>
            <div className="font-serif text-[26px] text-ink-1 mt-1 mb-4">從<em className="italic text-accent">動機</em>開始探索</div>
            <div className="space-y-2.5">
              {sortedDrives.map((drive) => {
                const trendData = trendingDrives.find(t => t.driveType === drive.id)
                const count = trendData?.count ?? 0
                return (
                  <div
                    key={drive.id}
                    className={`grid grid-cols-[36px_1fr_auto_auto] gap-4 items-center p-3.5 rounded-[14px] border cursor-pointer transition-all hover:shadow-sm ${drive.bgColor} ${drive.borderColor}`}
                  >
                    <div className={`font-serif text-[26px] italic leading-[1] ${drive.color}`}>{drive.id}</div>
                    <div>
                      <div className={`font-serif text-[19px] leading-[1.1] ${drive.color}`}>{drive.chineseName}</div>
                      <div className="font-mono text-sm text-ink-4 mt-0.5 tracking-[0.04em]">{drive.name}</div>
                    </div>
                    <span className="font-mono text-[12px] text-ink-3">{count > 0 ? `${count} 位實踐者` : '0 位實踐者'}</span>
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" className={`${drive.color} shrink-0`}>
                      <path d="M5 3l5 5-5 5"/>
                    </svg>
                  </div>
                )
              })}
            </div>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3.5 text-line">
          <div className="flex-1 h-px bg-line" />
          <span className="font-serif text-[18px] italic text-ink-4">II</span>
          <div className="flex-1 h-px bg-line" />
        </div>

        {/* Community Activity */}
        {latestActivityFeed.length > 0 && (
          <div>
            <div className="font-mono text-[13px] text-ink-4 tracking-[0.14em] uppercase mb-1">社群動態</div>
            <div className="font-serif text-[26px] text-ink-1 mt-1 mb-4">本週<em className="italic text-accent">靜默的練習者</em></div>
            <div className="space-y-3">
              {latestActivityFeed.map(item => {
                const drive = drives.find(d => d.id === item.driveType)
                return (
                  <div
                    key={item.id}
                    className="flex items-start gap-3 p-4 bg-card border border-line rounded-[14px] hover:border-ink-4/30 transition-colors cursor-pointer"
                  >
                    <AvatarDisplay avatar={item.avatar} name={item.displayName} />
                    <div className="flex-1">
                      <div className="flex items-center gap-1 flex-wrap">
                        <span className="font-serif text-[18px] text-ink-1">{item.displayName}</span>
                        <span className="text-ink-3 text-sm">{item.action}</span>
                        <span className="text-ink-1 text-sm font-medium">「{item.habitTitle}」</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1.5">
                        {drive && (
                          <span className={`text-sm px-2 py-0.5 rounded-full ${drive.bgColor} ${drive.color} ${drive.borderColor} border font-mono`}>
                            {drive.chineseName}
                          </span>
                        )}
                        <span className="text-warm-amber text-sm font-semibold font-mono">+{item.xpEarned} XP</span>
                        <span className="text-ink-4 text-sm ml-auto font-mono">{formatTimestamp(item.timestamp)}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Top Community Members */}
        {topLeaderboard.length > 0 && (
          <div>
            <div className="font-mono text-[13px] text-ink-4 tracking-[0.14em] uppercase mb-1">社群精選</div>
            <div className="font-serif text-[26px] text-ink-1 mt-1 mb-4">本週<em className="italic text-accent">靜默的練習者</em></div>
            <div className="grid grid-cols-2 gap-3">
              {topLeaderboard.slice(0, 4).map((lu, index) => {
                const rankColors = [
                  'bg-warm-amber text-paper',
                  'bg-ink-3 text-paper',
                  'bg-accent-soft text-accent',
                ]
                return (
                  <div
                    key={lu.id}
                    onClick={() => setSelectedUserId(lu.id)}
                    className="flex items-start gap-3.5 p-4 bg-card border border-line rounded-[14px] hover:border-ink-4/30 transition-colors cursor-pointer"
                  >
                    <div className="relative shrink-0">
                      <LeaderboardAvatarDisplay avatar={lu.avatar} name={lu.displayName} />
                      {index < 3 && (
                        <span className={`absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center font-mono text-[10px] font-bold border-2 border-card ${rankColors[index]}`}>
                          {index + 1}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between gap-1">
                        <div className="font-serif text-[18px] text-ink-1 truncate">{lu.displayName}</div>
                      </div>
                      <div className="text-ink-3 text-sm font-mono mt-0.5 truncate">@{lu.username}</div>
                      <div className="flex gap-1.5 mt-2.5">
                        <span className="text-[12px] px-2 py-0.5 rounded-full border border-line bg-paper text-ink-3 font-mono cursor-pointer hover:bg-line-2">關注</span>
                        <span className="text-[12px] px-2 py-0.5 rounded-full border border-line bg-paper text-ink-3 font-mono cursor-pointer hover:bg-line-2">查看</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {selectedUserId && (
        <UserProfileModal userId={selectedUserId} onClose={() => setSelectedUserId(null)} />
      )}
    </div>
  )
}

export default Explore
