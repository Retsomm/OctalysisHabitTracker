import React, { useState, useEffect } from 'react'
import { drives } from '../constants/drives'
import { useGetLeaderboardQuery, useGetActivityQuery, useSearchUsersQuery, useGetTrendingDrivesQuery } from '../store/api'
import { SearchIcon } from '../components/common/Icons'
import UserProfileModal from '../components/common/UserProfileModal'

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
    return <img src={avatar} alt={name} className="w-10 h-10 rounded-full object-cover border border-zinc-700 shrink-0" referrerPolicy="no-referrer" />
  }
  return (
    <div className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xl shrink-0">
      {isShortStr ? avatar : (name?.charAt(0) || '?')}
    </div>
  )
}

const LeaderboardAvatarDisplay = ({ avatar, name }: { avatar?: string; name?: string }): React.JSX.Element => {
  const isImage = avatar?.includes('http') || avatar?.startsWith('data:')
  const isShortStr = avatar && avatar.length <= 10 && !isImage

  if (isImage) {
    return <img src={avatar} alt={name} className="w-12 h-12 rounded-full object-cover border border-zinc-700" referrerPolicy="no-referrer" />
  }
  return (
    <div className="w-12 h-12 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-2xl">
      {isShortStr ? avatar : (name?.charAt(0) || '?')}
    </div>
  )
}

const Explore = (): React.JSX.Element => {
  const { data: leaderboard = [] } = useGetLeaderboardQuery()
  const { data: activityFeed = [] } = useGetActivityQuery()
  const { data: trendingDrives = [] } = useGetTrendingDrivesQuery()

  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery.trim()), 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  const { data: searchResult, isFetching: isSearching } = useSearchUsersQuery(debouncedQuery, {
    skip: !debouncedQuery,
  })

  // 根據熱門資料排序驅動力，若無資料則維持原序
  const sortedDrives = [...drives].sort((a, b) => {
    const aCount = trendingDrives.find(t => t.driveType === a.id)?.count ?? 0
    const bCount = trendingDrives.find(t => t.driveType === b.id)?.count ?? 0
    return bCount - aCount
  })

  const isSearchMode = debouncedQuery.length > 0
  const searchUsers = searchResult?.users ?? []

  return (
    <div>
      {/* Header */}
      <div className="sticky top-0 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800 z-20 px-4 py-3">
        <h1 className="text-white font-bold text-xl">探索</h1>
      </div>

      <div className="px-4 py-4 space-y-6">
        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="搜尋使用者..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-500 rounded-2xl px-4 py-3 pl-10 outline-none focus:border-zinc-600 transition-colors text-sm"
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">
            <SearchIcon size={16} />
          </span>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 text-lg leading-none"
            >
              ×
            </button>
          )}
        </div>

        {/* Search Results */}
        {isSearchMode && (
          <div>
            <h3 className="text-white font-bold text-base mb-3">搜尋結果</h3>
            {isSearching ? (
              <div className="text-zinc-500 text-sm text-center py-6">搜尋中...</div>
            ) : searchUsers.length === 0 ? (
              <div className="text-zinc-500 text-sm text-center py-6">沒有找到「{debouncedQuery}」相關的使用者</div>
            ) : (
              <div className="space-y-2">
                {searchUsers.map(user => (
                  <div
                    key={user.id}
                    onClick={() => setSelectedUserId(user.id)}
                    className="flex items-center gap-3 p-3 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-zinc-700 transition-colors cursor-pointer"
                  >
                    <LeaderboardAvatarDisplay avatar={user.avatar} name={user.displayName} />
                    <div className="flex-1 min-w-0">
                      <div className="text-white text-sm font-semibold truncate">{user.displayName}</div>
                      <div className="text-zinc-500 text-xs">@{user.username}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-violet-400 text-xs font-bold">Lv.{user.level}</div>
                      <div className="text-amber-400 text-xs">{user.xp.toLocaleString()} XP</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Trending Drives - 僅在非搜尋模式顯示 */}
        {!isSearchMode && (
          <div>
            <h3 className="text-white font-bold text-base mb-3">熱門驅動力類型</h3>
            <div className="space-y-2">
              {sortedDrives.map((drive, index) => {
                const trendData = trendingDrives.find(t => t.driveType === drive.id)
                const count = trendData?.count ?? 0
                return (
                  <div
                    key={drive.id}
                    className={`flex items-center gap-4 p-3 rounded-xl border cursor-pointer transition-all hover:border-zinc-600 ${drive.bgColor} ${drive.borderColor}`}
                  >
                    <span className="text-zinc-500 text-sm font-mono w-4">{index + 1}</span>
                    <div className="flex-1">
                      <div className={`font-semibold text-sm ${drive.color}`}>{drive.chineseName}</div>
                      <div className="text-zinc-500 text-xs">{drive.name}</div>
                    </div>
                    {count > 0 && (
                      <span className="text-zinc-400 text-xs shrink-0">{count} 次完成</span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Community Activity - 僅在非搜尋模式顯示 */}
        {!isSearchMode && (
          <div>
            <h3 className="text-white font-bold text-base mb-3">社群動態</h3>
            <div className="space-y-3">
              {activityFeed.map(item => {
                const drive = drives.find(d => d.id === item.driveType)
                return (
                  <div
                    key={item.id}
                    className="flex items-start gap-3 p-3 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-zinc-700 transition-colors cursor-pointer"
                  >
                    <AvatarDisplay avatar={item.avatar} name={item.displayName} />
                    <div className="flex-1">
                      <div className="flex items-center gap-1 flex-wrap">
                        <span className="text-white text-sm font-semibold">{item.displayName}</span>
                        <span className="text-zinc-500 text-sm">{item.action}</span>
                        <span className="text-zinc-300 text-sm font-medium">「{item.habitTitle}」</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        {drive && (
                          <span className={`text-xs px-2 py-0.5 rounded-full ${drive.bgColor} ${drive.color} ${drive.borderColor} border`}>
                            {drive.chineseName}
                          </span>
                        )}
                        <span className="text-amber-400 text-xs font-semibold">+{item.xpEarned} XP</span>
                        <span className="text-zinc-600 text-xs ml-auto">{formatTimestamp(item.timestamp)}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Top Community Members - 僅在非搜尋模式顯示 */}
        {!isSearchMode && (
          <div>
            <h3 className="text-white font-bold text-base mb-3">社群精英</h3>
            <div className="grid grid-cols-2 gap-3">
              {leaderboard.map((lu, index) => {
                const medals = ['🥇', '🥈', '🥉']
                return (
                  <div
                    key={lu.id}
                    onClick={() => setSelectedUserId(lu.id)}
                    className="flex flex-col items-center p-4 bg-zinc-900 border border-zinc-800 rounded-2xl hover:border-zinc-700 transition-colors cursor-pointer text-center"
                  >
                    <div className="relative mb-2">
                      <LeaderboardAvatarDisplay avatar={lu.avatar} name={lu.displayName} />
                      {index < 3 && (
                        <span className="absolute -top-1 -right-1 text-sm">{medals[index]}</span>
                      )}
                    </div>
                    <div className="text-white text-sm font-semibold">{lu.displayName}</div>
                    <div className="text-zinc-500 text-xs mb-2">{lu.username}</div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-violet-400 font-bold">Lv.{lu.level}</span>
                      <span className="text-zinc-700">•</span>
                      <span className="text-orange-400">🔥 {lu.totalStreak}</span>
                    </div>
                    <div className="text-amber-400 text-xs font-bold mt-1">{lu.xp.toLocaleString()} XP</div>
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
