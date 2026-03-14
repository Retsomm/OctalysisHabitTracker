import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'
import { randomUUID } from 'crypto'
import { AuthUser, JwtPayload } from '../types/index.js'

const prisma = new PrismaClient()

const generateToken = (userId: string): string => {
  const secret = process.env.JWT_SECRET
  if (!secret) throw new Error('JWT_SECRET not configured')
  const payload: JwtPayload = { userId }
  return jwt.sign(payload, secret, { expiresIn: '30d' })
}

const generateUsername = async (base: string): Promise<string> => {
  const sanitized = base.replace(/[^a-zA-Z0-9_]/g, '').toLowerCase() || 'user'
  const existing = await prisma.user.findUnique({ where: { username: sanitized } })
  if (!existing) return sanitized

  let counter = 1
  while (true) {
    const candidate = `${sanitized}${counter}`
    const exists = await prisma.user.findUnique({ where: { username: candidate } })
    if (!exists) return candidate
    counter++
  }
}

const toAuthUser = (user: { id: string; name: string; email: string | null; avatar: string | null; provider: string }): AuthUser => ({
  id: user.id,
  name: user.name,
  email: user.email ?? '',
  picture: user.avatar ?? '',
  provider: user.provider as AuthUser['provider'],
})

export const loginWithGoogle = async (code: string, redirectUri: string): Promise<{ token: string; user: AuthUser }> => {
  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  if (!clientId || !clientSecret) throw new Error('Google credentials not configured')

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
      client_id: clientId,
      client_secret: clientSecret,
    }),
  })
  if (!tokenRes.ok) {
    const errBody = await tokenRes.text()
    console.error('Google token exchange failed:', tokenRes.status, errBody)
    throw new Error('Failed to exchange Google code')
  }

  const tokenData = await tokenRes.json() as { access_token: string }

  const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  })
  if (!response.ok) throw new Error('Invalid Google token')

  const profile = await response.json() as {
    sub: string
    email: string
    name: string
    picture: string
    given_name?: string
  }

  const usernameBase = profile.email.split('@')[0]
  const username = await generateUsername(usernameBase)

  const user = await prisma.user.upsert({
    where: { provider_providerId: { provider: 'google', providerId: profile.sub } },
    update: { email: profile.email },
    create: {
      provider: 'google',
      providerId: profile.sub,
      email: profile.email,
      name: profile.name,
      avatar: profile.picture,
      username,
    },
  })

  return { token: generateToken(user.id), user: toAuthUser(user) }
}

export const loginWithLine = async (code: string, redirectUri: string): Promise<{ token: string; user: AuthUser }> => {
  const clientId = process.env.LINE_CLIENT_ID
  const clientSecret = process.env.LINE_CLIENT_SECRET
  if (!clientId || !clientSecret) throw new Error('LINE credentials not configured')

  const tokenRes = await fetch('https://api.line.me/oauth2/v2.1/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
      client_id: clientId,
      client_secret: clientSecret,
    }),
  })
  if (!tokenRes.ok) throw new Error('Failed to exchange LINE code')

  const tokenData = await tokenRes.json() as { access_token: string }

  const profileRes = await fetch('https://api.line.me/v2/profile', {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  })
  if (!profileRes.ok) throw new Error('Failed to get LINE profile')

  const profile = await profileRes.json() as {
    userId: string
    displayName: string
    pictureUrl?: string
  }

  const username = await generateUsername(profile.displayName)

  const user = await prisma.user.upsert({
    where: { provider_providerId: { provider: 'line', providerId: profile.userId } },
    update: {},
    create: {
      provider: 'line',
      providerId: profile.userId,
      name: profile.displayName,
      avatar: profile.pictureUrl ?? null,
      username,
    },
  })

  return { token: generateToken(user.id), user: toAuthUser(user) }
}

export const loginWithX = async (code: string, redirectUri: string, codeVerifier: string): Promise<{ token: string; user: AuthUser }> => {
  const clientId = process.env.X_CLIENT_ID
  const clientSecret = process.env.X_CLIENT_SECRET
  if (!clientId || !clientSecret) throw new Error('X credentials not configured')

  const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
  const tokenRes = await fetch('https://api.twitter.com/2/oauth2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${basicAuth}`,
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
      code_verifier: codeVerifier,
      client_id: clientId,
    }),
  })
  if (!tokenRes.ok) {
    const errBody = await tokenRes.text()
    console.error('X token exchange failed:', tokenRes.status, errBody)
    throw new Error('Failed to exchange X code')
  }

  const tokenData = await tokenRes.json() as { access_token: string }

  const userRes = await fetch('https://api.twitter.com/2/users/me?user.fields=profile_image_url,name,username', {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  })
  if (!userRes.ok) throw new Error('Failed to get X user')

  const userData = await userRes.json() as {
    data: { id: string; name: string; username: string; profile_image_url?: string }
  }
  const profile = userData.data

  const username = await generateUsername(profile.username)

  const user = await prisma.user.upsert({
    where: { provider_providerId: { provider: 'x', providerId: profile.id } },
    update: {},
    create: {
      provider: 'x',
      providerId: profile.id,
      name: profile.name,
      avatar: profile.profile_image_url ?? null,
      username,
    },
  })

  return { token: generateToken(user.id), user: toAuthUser(user) }
}

export const loginAsGuest = async (): Promise<{ token: string; user: AuthUser }> => {
  const guestId = `guest_${randomUUID()}`
  const username = await generateUsername(`guest${Date.now()}`)

  const user = await prisma.user.create({
    data: {
      provider: 'guest',
      providerId: guestId,
      name: '訪客用戶',
      username,
    },
  })

  return { token: generateToken(user.id), user: toAuthUser(user) }
}

export const getMe = async (userId: string): Promise<AuthUser> => {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } })
  return toAuthUser(user)
}
