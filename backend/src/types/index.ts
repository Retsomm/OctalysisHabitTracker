export type DriveType = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8

export interface Habit {
  id: string
  title: string
  description: string
  driveType: DriveType
  frequency: 'daily' | 'weekly'
  streak: number
  completed: boolean
  completedDates: string[]
  xp: number
  createdAt: string
}

export interface User {
  id: string
  username: string
  displayName: string
  avatar: string
  level: number
  xp: number
  xpToNextLevel: number
  totalStreak: number
  achievements: Achievement[]
  driveScores: Record<DriveType, number>
}

export interface AuthUser {
  id: string
  name: string
  email: string
  picture: string
  given_name?: string
  provider?: 'google' | 'line' | 'x' | 'guest'
}

export interface ActivityItem {
  id: string
  userId: string
  username: string
  displayName: string
  avatar: string
  action: string
  habitTitle: string
  driveType: DriveType
  xpEarned: number
  timestamp: string
}

export interface LeaderboardUser {
  id: string
  username: string
  displayName: string
  avatar: string
  level: number
  xp: number
  totalStreak: number
}

export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  earnedAt?: string
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first_habit', title: '初心者', description: '建立第一個習慣', icon: '🌱' },
  { id: 'week_streak', title: '一週連勝', description: '維持7天連勝', icon: '🔥' },
  { id: 'level_5', title: '成長中', description: '達到等級5', icon: '⭐' },
  { id: 'all_drives', title: '全能玩家', description: '使用全部8個驅動力', icon: '🎯' },
  { id: 'hundred_xp', title: '百分達人', description: '累積100 XP', icon: '💎' },
]

export interface JwtPayload {
  userId: string
}
