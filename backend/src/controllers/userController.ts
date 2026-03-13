import { Request, Response } from 'express'
import * as userService from '../services/userService.js'

export const search = async (req: Request, res: Response): Promise<void> => {
  try {
    const query = String(req.query.q ?? '').trim()
    if (!query) {
      res.json({ users: [] })
      return
    }
    const users = await userService.searchUsers(query)
    res.json({ users })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to search'
    res.status(500).json({ error: message })
  }
}

export const getTrendingDrives = async (_req: Request, res: Response): Promise<void> => {
  try {
    const trending = await userService.getTrendingDrives()
    res.json(trending)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to get trending drives'
    res.status(500).json({ error: message })
  }
}

export const getPublicProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const targetUserId = String(req.params.userId)
    const profile = await userService.getUserProfile(targetUserId)
    res.json(profile)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'User not found'
    res.status(404).json({ error: message })
  }
}

export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id
    const profile = await userService.getUserProfile(userId)
    res.json(profile)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to get profile'
    res.status(500).json({ error: message })
  }
}

export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id
    const { name, avatar } = req.body as { name?: string; avatar?: string }
    const profile = await userService.updateProfile(userId, { name, avatar })
    res.json(profile)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to update profile'
    res.status(500).json({ error: message })
  }
}

export const getLeaderboard = async (_req: Request, res: Response): Promise<void> => {
  try {
    const leaderboard = await userService.getLeaderboard()
    res.json(leaderboard)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to get leaderboard'
    res.status(500).json({ error: message })
  }
}

export const getActivity = async (_req: Request, res: Response): Promise<void> => {
  try {
    const feed = await userService.getActivityFeed()
    res.json(feed)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to get activity feed'
    res.status(500).json({ error: message })
  }
}

export const getRecentHabits = async (_req: Request, res: Response): Promise<void> => {
  try {
    const habits = await userService.getRecentHabits()
    res.json(habits)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to get recent habits'
    res.status(500).json({ error: message })
  }
}

export const getFeedHabits = async (_req: Request, res: Response): Promise<void> => {
  try {
    const habits = await userService.getFeedHabits()
    res.json(habits)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to get feed habits'
    res.status(500).json({ error: message })
  }
}
