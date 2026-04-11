import prisma from '../lib/prisma.js'
import { Project } from '../types/index.js'

const toProject = (p: { id: string; userId: string; name: string; createdAt: Date }): Project => ({
  id: p.id,
  userId: p.userId,
  name: p.name,
  createdAt: p.createdAt.toISOString(),
})

export const getProjects = async (userId: string): Promise<Project[]> => {
  const projects = await prisma.project.findMany({
    where: { userId },
    orderBy: { createdAt: 'asc' },
  })
  return projects.map(toProject)
}

export const createProject = async (userId: string, name: string): Promise<Project> => {
  const project = await prisma.project.create({
    data: { userId, name },
  })
  return toProject(project)
}

export const deleteProject = async (userId: string, projectId: string): Promise<void> => {
  const project = await prisma.project.findFirst({ where: { id: projectId, userId } })
  if (!project) throw new Error('Project not found')
  await prisma.project.delete({ where: { id: projectId } })
}
