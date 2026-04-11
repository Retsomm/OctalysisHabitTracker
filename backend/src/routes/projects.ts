import { Router } from 'express'
import { getProjects, createProject, deleteProject } from '../controllers/projectsController.js'
import { authMiddleware } from '../middleware/auth.js'

const router = Router()

router.use(authMiddleware)

router.get('/', getProjects)
router.post('/', createProject)
router.delete('/:id', deleteProject)

export default router
