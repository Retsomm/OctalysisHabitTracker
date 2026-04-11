import { Request, Response } from 'express'
import * as projectsService from '../services/projectsService.js'

export const getProjects = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id
    const projects = await projectsService.getProjects(userId)
    res.json(projects)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to get projects'
    res.status(500).json({ error: message })
  }
}

export const createProject = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id
    const { name } = req.body as { name: string }
    if (!name?.trim()) {
      res.status(400).json({ error: 'name is required' })
      return
    }
    const project = await projectsService.createProject(userId, name.trim())
    res.status(201).json(project)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to create project'
    res.status(500).json({ error: message })
  }
}

export const deleteProject = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id
    const id = String(req.params.id)
    await projectsService.deleteProject(userId, id)
    res.status(204).send()
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to delete project'
    const status = message === 'Project not found' ? 404 : 500
    res.status(status).json({ error: message })
  }
}
