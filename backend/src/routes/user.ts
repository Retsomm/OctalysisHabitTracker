import { Router } from 'express'
import { getProfile, updateProfile, getLeaderboard, getActivity, getRecentHabits, getFeedHabits, search, getTrendingDrives, getPublicProfile } from '../controllers/userController.js'
import { getPublicHabits } from '../controllers/habitsController.js'
import { authMiddleware } from '../middleware/auth.js'

const router = Router()

router.use(authMiddleware)

router.get('/profile', getProfile)
router.put('/profile', updateProfile)
router.get('/leaderboard', getLeaderboard)
router.get('/activity', getActivity)
router.get('/recent-habits', getRecentHabits)
router.get('/feed', getFeedHabits)
router.get('/search', search)
router.get('/trending-drives', getTrendingDrives)
router.get('/:userId/profile', getPublicProfile)
router.get('/:userId/habits', getPublicHabits)

export default router
