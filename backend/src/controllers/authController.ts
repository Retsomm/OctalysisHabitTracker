import { Request, Response } from 'express'
import * as authService from '../services/authService.js'

export const googleLogin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { code, redirectUri } = req.body as { code: string; redirectUri: string }
    if (!code || !redirectUri) {
      res.status(400).json({ error: 'code and redirectUri are required' })
      return
    }
    const result = await authService.loginWithGoogle(code, redirectUri)
    res.json(result)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Google login failed'
    res.status(401).json({ error: message })
  }
}

export const lineLogin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { code, redirectUri } = req.body as { code: string; redirectUri: string }
    if (!code || !redirectUri) {
      res.status(400).json({ error: 'code and redirectUri are required' })
      return
    }
    const result = await authService.loginWithLine(code, redirectUri)
    res.json(result)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'LINE login failed'
    res.status(401).json({ error: message })
  }
}

export const xLogin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { code, redirectUri, codeVerifier } = req.body as {
      code: string
      redirectUri: string
      codeVerifier: string
    }
    if (!code || !redirectUri || !codeVerifier) {
      res.status(400).json({ error: 'code, redirectUri and codeVerifier are required' })
      return
    }
    const result = await authService.loginWithX(code, redirectUri, codeVerifier)
    res.json(result)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'X login failed'
    res.status(401).json({ error: message })
  }
}

export const guestLogin = async (_req: Request, res: Response): Promise<void> => {
  try {
    const result = await authService.loginAsGuest()
    res.json(result)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Guest login failed'
    res.status(500).json({ error: message })
  }
}

export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id
    const user = await authService.getMe(userId)
    res.json(user)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to get user'
    res.status(404).json({ error: message })
  }
}
