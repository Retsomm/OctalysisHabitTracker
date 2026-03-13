import { Request, Response } from 'express'
import * as habitsService from '../services/habitsService.js'
import { DriveType } from '../types/index.js'

export const getHabits = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id
    const habits = await habitsService.getHabits(userId)
    res.json(habits)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to get habits'
    res.status(500).json({ error: message })
  }
}

export const createHabit = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id
    const { title, description, driveType, frequency, xp } = req.body as {
      title: string
      description: string
      driveType: DriveType
      frequency: 'daily' | 'weekly'
      xp: number
    }

    if (!title || !driveType || !frequency) {
      res.status(400).json({ error: 'title, driveType and frequency are required' })
      return
    }

    const habit = await habitsService.createHabit(userId, {
      title,
      description: description ?? '',
      driveType,
      frequency,
      xp: xp ?? 10,
    })
    res.status(201).json(habit)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to create habit'
    res.status(500).json({ error: message })
  }
}

export const deleteHabit = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id
    const id = String(req.params.id)
    await habitsService.deleteHabit(userId, id)
    res.status(204).send()
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to delete habit'
    const status = message === 'Habit not found' ? 404 : 500
    res.status(status).json({ error: message })
  }
}

export const getPublicHabits = async (req: Request, res: Response): Promise<void> => {
  try {
    const targetUserId = String(req.params.userId)
    const habits = await habitsService.getHabits(targetUserId)
    res.json(habits)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to get habits'
    res.status(500).json({ error: message })
  }
}

export const updateHabit = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id
    const id = String(req.params.id)
    const updates = req.body
    const habit = await habitsService.updateHabit(userId, id, updates)
    res.json(habit)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to update habit'
    res.status(500).json({ error: message })
  }
}
