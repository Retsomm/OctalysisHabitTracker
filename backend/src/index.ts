import 'dotenv/config'
import express, { Request, Response, NextFunction } from 'express'
import cors from 'cors'
import authRoutes from './routes/auth.js'
import habitsRoutes from './routes/habits.js'
import userRoutes from './routes/user.js'

const app = express()

const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'https://octalysis-habit-tracker.vercel.app'
]

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true
}))

app.use(express.json())

// X OAuth callback relay (X redirects here, we forward to frontend)
app.get('/auth/callback/x', (req: Request, res: Response) => {
  const isProd = process.env.NODE_ENV === 'production'
  const frontendUrl = process.env.FRONTEND_URL || (isProd ? 'https://octalysis-habit-tracker.vercel.app' : 'http://127.0.0.1:5173')
  const params = new URLSearchParams(req.query as Record<string, string>)
  res.redirect(`${frontendUrl}/auth/callback/x?${params.toString()}`)
})

app.use('/api/auth', authRoutes)
app.use('/api/habits', habitsRoutes)
app.use('/api/user', userRoutes)

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  const message = err instanceof Error ? err.message : 'Internal server error'
  res.status(500).json({ error: message })
})

const PORT = process.env.PORT ?? 3001
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
