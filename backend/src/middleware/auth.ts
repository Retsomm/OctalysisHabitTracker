import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { JwtPayload } from '../types/index.js'

declare global {
  namespace Express {
    interface Request {
      user?: { id: string }
    }
  }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized: missing token' })
    return
  }

  const token = authHeader.slice(7)
  const secret = process.env.JWT_SECRET
  if (!secret) {
    res.status(500).json({ error: 'Server configuration error' })
    return
  }

  try {
    const decoded = jwt.verify(token, secret) as JwtPayload
    req.user = { id: decoded.userId }
    next()
  } catch {
    res.status(401).json({ error: 'Unauthorized: invalid token' })
  }
}
