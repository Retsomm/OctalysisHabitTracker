import { Router } from 'express'
import { googleLogin, lineLogin, xLogin, guestLogin, getMe } from '../controllers/authController.js'
import { authMiddleware } from '../middleware/auth.js'

const router = Router()

router.post('/google', googleLogin)
router.post('/line', lineLogin)
router.post('/x', xLogin)
router.post('/guest', guestLogin)
router.get('/me', authMiddleware, getMe)

export default router
