import { Router } from 'express'
import { getHabits, createHabit, deleteHabit, updateHabit } from '../controllers/habitsController.js'
import { authMiddleware } from '../middleware/auth.js'

const router = Router()

router.use(authMiddleware)

router.get('/', getHabits)
router.post('/', createHabit)
router.delete('/:id', deleteHabit)
router.patch('/:id', updateHabit) // 更新指定習慣的部分屬性（如完成狀態）

export default router
