import { PrismaClient } from '@prisma/client'
import { User, LeaderboardUser, ActivityItem, DriveType, ACHIEVEMENTS } from '../types/index.js'

export interface TrendingDrive {
  driveType: DriveType
  count: number
}

const prisma = new PrismaClient()

export const getUserProfile = async (userId: string): Promise<User> => {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    include: {
      habits: { include: { completions: true } },
      achievements: true,
    },
  })

  const level = Math.floor(user.xp / 100) + 1
  const xpToNextLevel = level * 100 - user.xp

  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const recentCompletions = await prisma.habitCompletion.findMany({
    where: { userId, completedAt: { gte: thirtyDaysAgo } },
    include: { habit: true },
  })

  const driveCountMap: Record<number, number> = {}
  for (const completion of recentCompletions) {
    const dt = completion.habit.driveType
    driveCountMap[dt] = (driveCountMap[dt] ?? 0) + 1
  }

  const maxCount = Math.max(0, ...Object.values(driveCountMap))

  const driveScores = {} as Record<DriveType, number>
  for (let i = 1; i <= 8; i++) {
    const count = driveCountMap[i] ?? 0
    driveScores[i as DriveType] = maxCount > 0 ? Math.round((count / maxCount) * 100) : 0
  }

  const totalStreak = user.habits.reduce((sum, h) => sum + h.streak, 0)

  const earnedAchievementIds = new Set(user.achievements.map(a => a.achievementId))
  const achievements = ACHIEVEMENTS
    .filter(a => earnedAchievementIds.has(a.id))
    .map(a => {
      const earned = user.achievements.find(ua => ua.achievementId === a.id)
      return { ...a, earnedAt: earned?.earnedAt.toISOString() }
    })

  return {
    id: user.id,
    username: user.username,
    displayName: user.name,
    avatar: user.avatar ?? '',
    level,
    xp: user.xp,
    xpToNextLevel,
    totalStreak,
    achievements,
    driveScores,
  }
}

export const updateProfile = async (
  userId: string,
  data: { name?: string; avatar?: string }
): Promise<User> => {
  await prisma.user.update({
    where: { id: userId },
    data: {
      ...(data.name?.trim() && { name: data.name.trim() }),
      ...(data.avatar !== undefined && { avatar: data.avatar }),
    },
  })
  return getUserProfile(userId)
}

export const getLeaderboard = async (): Promise<LeaderboardUser[]> => {
  const users = await prisma.user.findMany({
    orderBy: { xp: 'desc' },
    take: 50,
    include: { habits: true },
  })

  return users.map(user => {
    const totalStreak = user.habits.reduce((sum, h) => sum + h.streak, 0)
    return {
      id: user.id,
      username: user.username,
      displayName: user.name,
      avatar: user.avatar ?? '',
      level: Math.floor(user.xp / 100) + 1,
      xp: user.xp,
      totalStreak,
    }
  })
}

export const searchUsers = async (query: string): Promise<LeaderboardUser[]> => {
  const users = await prisma.user.findMany({
    where: {
      OR: [
        { name: { contains: query } },
        { username: { contains: query } },
      ],
    },
    include: { habits: true },
    take: 20,
  })

  return users.map(user => ({
    id: user.id,
    username: user.username,
    displayName: user.name,
    avatar: user.avatar ?? '',
    level: Math.floor(user.xp / 100) + 1,
    xp: user.xp,
    totalStreak: user.habits.reduce((sum, h) => sum + h.streak, 0),
  }))
}

export const getTrendingDrives = async (): Promise<TrendingDrive[]> => {
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const activities = await prisma.activityFeed.findMany({
    where: { createdAt: { gte: sevenDaysAgo } },
    include: { habit: true },
  })

  const countMap: Record<number, number> = {}
  for (const activity of activities) {
    if (activity.habit) {
      const dt = activity.habit.driveType
      countMap[dt] = (countMap[dt] ?? 0) + 1
    }
  }

  const result: TrendingDrive[] = []
  for (let i = 1; i <= 8; i++) {
    result.push({ driveType: i as DriveType, count: countMap[i] ?? 0 })
  }

  return result.sort((a, b) => b.count - a.count)
}

export interface FeedHabit {
  id: string
  title: string
  description: string
  driveType: DriveType
  frequency: 'daily' | 'weekly'
  streak: number
  xp: number
  createdAt: string
  userId: string
  username: string
  displayName: string
  avatar: string
  completionRate: number
  totalCompletions: number
  completedToday: boolean
}

export const getFeedHabits = async (): Promise<FeedHabit[]> => {
  const now = new Date()
  const thirtyDaysAgo = new Date(now)
  thirtyDaysAgo.setDate(now.getDate() - 30)

  const todayStart = new Date(now)
  todayStart.setHours(0, 0, 0, 0)
  const todayEnd = new Date(now)
  todayEnd.setHours(23, 59, 59, 999)

  const weekDay = now.getDay()
  const weekStart = new Date(now)
  weekStart.setDate(now.getDate() - weekDay)
  weekStart.setHours(0, 0, 0, 0)
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekStart.getDate() + 6)
  weekEnd.setHours(23, 59, 59, 999)

  const validUsers = await prisma.user.findMany({ select: { id: true } })
  const validUserIds = validUsers.map(u => u.id)

  const habits = await prisma.habit.findMany({
    where: { userId: { in: validUserIds } },
    orderBy: { createdAt: 'desc' },
    include: {
      user: true,
      completions: {
        where: { completedAt: { gte: thirtyDaysAgo } },
        orderBy: { completedAt: 'desc' },
      },
    },
  })

  return habits.map(habit => {
    const daysSinceCreation = Math.max(1, Math.floor((now.getTime() - habit.createdAt.getTime()) / (1000 * 60 * 60 * 24)))

    let completionRate: number
    if (habit.frequency === 'daily') {
      const expected = Math.min(30, daysSinceCreation)
      completionRate = Math.min(100, Math.round((habit.completions.length / expected) * 100))
    } else {
      const weeksSinceCreation = Math.max(1, Math.floor(daysSinceCreation / 7))
      const expected = Math.min(4, weeksSinceCreation)
      completionRate = Math.min(100, Math.round((habit.completions.length / expected) * 100))
    }

    const completedToday = habit.frequency === 'daily'
      ? habit.completions.some(c => c.completedAt >= todayStart && c.completedAt <= todayEnd)
      : habit.completions.some(c => c.completedAt >= weekStart && c.completedAt <= weekEnd)

    return {
      id: habit.id,
      title: habit.title,
      description: habit.description,
      driveType: habit.driveType as DriveType,
      frequency: habit.frequency as 'daily' | 'weekly',
      streak: habit.streak,
      xp: habit.xp,
      createdAt: habit.createdAt.toISOString(),
      userId: habit.userId,
      username: habit.user.username,
      displayName: habit.user.name,
      avatar: habit.user.avatar ?? '',
      completionRate,
      totalCompletions: habit.completions.length,
      completedToday,
    }
  })
}

export interface RecentHabitItem {
  id: string
  userId: string
  username: string
  displayName: string
  avatar: string
  habitTitle: string
  driveType: DriveType
  frequency: 'daily' | 'weekly'
  createdAt: string
}

export const getRecentHabits = async (): Promise<RecentHabitItem[]> => {
  const validUsers = await prisma.user.findMany({ select: { id: true } })
  const validUserIds = validUsers.map(u => u.id)

  const habits = await prisma.habit.findMany({
    where: { userId: { in: validUserIds } },
    orderBy: { createdAt: 'desc' },
    take: 5,
    include: { user: true },
  })

  return habits.map(habit => ({
    id: habit.id,
    userId: habit.userId,
    username: habit.user.username,
    displayName: habit.user.name,
    avatar: habit.user.avatar ?? '',
    habitTitle: habit.title,
    driveType: habit.driveType as DriveType,
    frequency: habit.frequency as 'daily' | 'weekly',
    createdAt: habit.createdAt.toISOString(),
  }))
}

export const getActivityFeed = async (): Promise<ActivityItem[]> => {
  const activities = await prisma.activityFeed.findMany({
    where: { user: {} },
    orderBy: { createdAt: 'desc' },
    take: 50,
    include: {
      user: true,
      habit: true,
    },
  })

  return activities.map(activity => ({
    id: activity.id,
    userId: activity.userId,
    username: activity.user.username,
    displayName: activity.user.name,
    avatar: activity.user.avatar ?? '',
    action: activity.action,
    habitTitle: activity.habit?.title ?? '',
    driveType: (activity.habit?.driveType ?? 1) as DriveType,
    xpEarned: activity.xpEarned,
    timestamp: activity.createdAt.toISOString(),
  }))
}
