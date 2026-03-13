import { PrismaClient } from '@prisma/client'
import { Habit, DriveType, ACHIEVEMENTS } from '../types/index.js'

const prisma = new PrismaClient()

const getTodayRange = (): { start: Date; end: Date } => {
  const start = new Date()
  start.setHours(0, 0, 0, 0)
  const end = new Date()
  end.setHours(23, 59, 59, 999)
  return { start, end }
}

const getWeekRange = (): { start: Date; end: Date } => {
  const now = new Date()
  const day = now.getDay()
  const start = new Date(now)
  start.setDate(now.getDate() - day)
  start.setHours(0, 0, 0, 0)
  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  end.setHours(23, 59, 59, 999)
  return { start, end }
}

const calculateStreak = (completions: Date[], frequency: string): number => {
  if (completions.length === 0) return 0

  const sorted = [...completions].sort((a, b) => b.getTime() - a.getTime())

  if (frequency === 'daily') {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const yesterday = new Date(today)
    yesterday.setDate(today.getDate() - 1)

    const latestDay = new Date(sorted[0])
    latestDay.setHours(0, 0, 0, 0)

    if (latestDay.getTime() !== today.getTime() && latestDay.getTime() !== yesterday.getTime()) {
      return 0
    }

    let streak = 0
    let checkDate = latestDay

    for (const completion of sorted) {
      const completionDay = new Date(completion)
      completionDay.setHours(0, 0, 0, 0)

      if (completionDay.getTime() === checkDate.getTime()) {
        streak++
        checkDate = new Date(checkDate)
        checkDate.setDate(checkDate.getDate() - 1)
      }
    }
    return streak
  }

  if (frequency === 'weekly') {
    const getWeekStart = (date: Date): Date => {
      const d = new Date(date)
      d.setDate(d.getDate() - d.getDay())
      d.setHours(0, 0, 0, 0)
      return d
    }

    const weekStarts = [...new Set(sorted.map(d => getWeekStart(d).getTime()))].sort((a, b) => b - a)

    const currentWeekStart = getWeekStart(new Date()).getTime()
    const lastWeekStart = currentWeekStart - 7 * 24 * 60 * 60 * 1000

    if (weekStarts[0] !== currentWeekStart && weekStarts[0] !== lastWeekStart) return 0

    let streak = 0
    let checkWeek = weekStarts[0]

    for (const weekStart of weekStarts) {
      if (weekStart === checkWeek) {
        streak++
        checkWeek = checkWeek - 7 * 24 * 60 * 60 * 1000
      } else {
        break
      }
    }
    return streak
  }

  return 0
}

const toHabit = (
  habit: {
    id: string
    title: string
    description: string
    driveType: number
    frequency: string
    streak: number
    xp: number
    createdAt: Date
    completions: { completedAt: Date }[]
  },
  completed: boolean
): Habit => ({
  id: habit.id,
  title: habit.title,
  description: habit.description,
  driveType: habit.driveType as DriveType,
  frequency: habit.frequency as 'daily' | 'weekly',
  streak: habit.streak,
  completed,
  completedDates: habit.completions.map(c => c.completedAt.toISOString().split('T')[0]),
  xp: habit.xp,
  createdAt: habit.createdAt.toISOString(),
})

export const getHabits = async (userId: string): Promise<Habit[]> => {
  const habits = await prisma.habit.findMany({
    where: { userId },
    include: { completions: { orderBy: { completedAt: 'asc' } } },
    orderBy: { createdAt: 'asc' },
  })

  const { start: todayStart, end: todayEnd } = getTodayRange()
  const { start: weekStart, end: weekEnd } = getWeekRange()

  return habits.map(habit => {
    let completed = false
    if (habit.frequency === 'daily') {
      completed = habit.completions.some(
        c => c.completedAt >= todayStart && c.completedAt <= todayEnd
      )
    } else {
      completed = habit.completions.some(
        c => c.completedAt >= weekStart && c.completedAt <= weekEnd
      )
    }
    return toHabit(habit, completed)
  })
}

export const createHabit = async (
  userId: string,
  data: { title: string; description: string; driveType: DriveType; frequency: 'daily' | 'weekly'; xp: number }
): Promise<Habit> => {
  const habit = await prisma.habit.create({
    data: {
      userId,
      title: data.title,
      description: data.description,
      driveType: data.driveType,
      frequency: data.frequency,
      xp: data.xp,
    },
    include: { completions: true },
  })

  await checkAndAwardAchievements(userId)

  return toHabit(habit, false)
}

export const deleteHabit = async (userId: string, habitId: string): Promise<void> => {
  const habit = await prisma.habit.findFirst({ where: { id: habitId, userId } })
  if (!habit) throw new Error('Habit not found')
  await prisma.habit.delete({ where: { id: habitId } })
}

export const updateHabit = async (
  userId: string,
  habitId: string,
  updates: Partial<{ title: string; description: string; driveType: DriveType; frequency: 'daily' | 'weekly'; xp: number; completed?: boolean }>
): Promise<Habit> => {
  const habit = await prisma.habit.findFirst({
    where: { id: habitId, userId },
    include: { completions: { orderBy: { completedAt: 'asc' } } },
  })
  if (!habit) throw new Error('Habit not found')

  // 如果包含 completed 狀態的更新，執行遊戲化邏輯
  if (updates.completed !== undefined) {
    const { start: todayStart, end: todayEnd } = getTodayRange()
    const { start: weekStart, end: weekEnd } = getWeekRange()

    const rangeStart = habit.frequency === 'daily' ? todayStart : weekStart
    const rangeEnd = habit.frequency === 'daily' ? todayEnd : weekEnd

    const existingCompletion = habit.completions.find(
      c => c.completedAt >= rangeStart && c.completedAt <= rangeEnd
    )

    // 只有在請求的完成狀態與目前狀態不同時才處理
    if (updates.completed && !existingCompletion) {
      // 標記為完成
      await prisma.habitCompletion.create({
        data: { habitId, userId },
      })

      await prisma.user.update({
        where: { id: userId },
        data: { xp: { increment: habit.xp } },
      })

      const updatedHabit = await prisma.habit.findUniqueOrThrow({
        where: { id: habitId },
        include: { completions: { orderBy: { completedAt: 'asc' } } },
      })

      const newStreak = calculateStreak(updatedHabit.completions.map(c => c.completedAt), habit.frequency)
      await prisma.habit.update({ where: { id: habitId }, data: { streak: newStreak } })

      const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } })
      const newLevel = Math.floor(user.xp / 100) + 1
      if (newLevel !== user.level) {
        await prisma.user.update({ where: { id: userId }, data: { level: newLevel } })
      }

      await prisma.activityFeed.create({
        data: {
          userId,
          habitId,
          action: `完成了習慣`,
          xpEarned: habit.xp,
        },
      })

      await checkAndAwardAchievements(userId)
      delete updates.completed // 避免再次更新
      return toHabit({ ...updatedHabit, streak: newStreak }, true)
    } else if (!updates.completed && existingCompletion) {
      // 取消完成（倒扣 XP）
      await prisma.habitCompletion.delete({ where: { id: existingCompletion.id } })
      await prisma.user.update({
        where: { id: userId },
        data: { xp: { decrement: habit.xp } },
      })

      const updatedHabit = await prisma.habit.findUniqueOrThrow({
        where: { id: habitId },
        include: { completions: { orderBy: { completedAt: 'asc' } } },
      })

      const newStreak = calculateStreak(updatedHabit.completions.map(c => c.completedAt), habit.frequency)
      await prisma.habit.update({ where: { id: habitId }, data: { streak: newStreak } })

      delete updates.completed
      return toHabit({ ...updatedHabit, streak: newStreak }, false)
    }
    // 狀態未改變，確保 completed 不會傳入 prisma.update
    delete updates.completed
  }

  // 處理一般欄位的更新（如標題、描述等）
  const updatedHabit = await prisma.habit.update({
    where: { id: habitId },
    data: updates,
    include: { completions: { orderBy: { completedAt: 'asc' } } },
  })

  // 判斷當前是否已完成以回傳正確的 Habit 物件
  const { start: todayStart, end: todayEnd } = getTodayRange()
  const { start: weekStart, end: weekEnd } = getWeekRange()
  const rangeStart = updatedHabit.frequency === 'daily' ? todayStart : weekStart
  const rangeEnd = updatedHabit.frequency === 'daily' ? todayEnd : weekEnd
  const completed = updatedHabit.completions.some(
    c => c.completedAt >= rangeStart && c.completedAt <= rangeEnd
  )

  return toHabit(updatedHabit, completed)
}

const checkAndAwardAchievements = async (userId: string): Promise<void> => {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    include: { habits: { include: { completions: true } }, achievements: true },
  })

  const earnedIds = new Set(user.achievements.map(a => a.achievementId))

  const toAward: string[] = []

  if (!earnedIds.has('first_habit') && user.habits.length >= 1) {
    toAward.push('first_habit')
  }

  if (!earnedIds.has('week_streak')) {
    const hasWeekStreak = user.habits.some(h => h.streak >= 7)
    if (hasWeekStreak) toAward.push('week_streak')
  }

  if (!earnedIds.has('level_5') && user.level >= 5) {
    toAward.push('level_5')
  }

  if (!earnedIds.has('all_drives')) {
    const driveTypes = new Set(user.habits.map(h => h.driveType))
    if (driveTypes.size >= 8) toAward.push('all_drives')
  }

  if (!earnedIds.has('hundred_xp') && user.xp >= 100) {
    toAward.push('hundred_xp')
  }

  for (const achievementId of toAward) {
    await prisma.userAchievement.upsert({
      where: { userId_achievementId: { userId, achievementId } },
      update: {},
      create: { userId, achievementId },
    })
  }
}
