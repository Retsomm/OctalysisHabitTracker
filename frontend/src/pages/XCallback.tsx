import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch } from '../store/hooks'
import { loginSuccess } from '../store/authSlice'
import { api } from '../store/api'
import type { AuthUser } from '../types'

const XCallback = (): React.JSX.Element => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const [error, setError] = useState<string | null>(null)
  const hasRun = useRef(false)

  useEffect(() => {
    if (hasRun.current) return
    hasRun.current = true

    const handleCallback = async (): Promise<void> => {
      const params = new URLSearchParams(window.location.search)
      const code = params.get('code')
      const state = params.get('state')
      const storedState = sessionStorage.getItem('x_oauth_state')
      const codeVerifier = sessionStorage.getItem('x_code_verifier')
      sessionStorage.removeItem('x_oauth_state')
      sessionStorage.removeItem('x_code_verifier')

      if (!code || !state || state !== storedState || !codeVerifier) {
        setError('認證失敗，請重新登入')
        return
      }

      const redirectUri = import.meta.env.VITE_X_REDIRECT_URI as string

      try {
        const result = await fetch('/api/backend/auth/x', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code, redirectUri, codeVerifier }),
        })
        const data = await result.json() as { token: string; user: AuthUser } | { error: string }
        if (!result.ok || 'error' in data) {
          setError('X 登入失敗，請重新嘗試')
          return
        }
        dispatch(api.util.resetApiState())
        dispatch(loginSuccess({ user: data.user, token: data.token }))
        navigate('/', { replace: true })
      } catch {
        setError('X 登入失敗，請重新嘗試')
      }
    }

    handleCallback()
  }, [dispatch, navigate])

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-red-400 text-lg">{error}</div>
          <button
            onClick={() => navigate('/', { replace: true })}
            className="text-zinc-400 hover:text-white text-sm cursor-pointer"
          >
            返回登入
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <div className="text-zinc-400 flex items-center gap-3">
        <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        X 登入中...
      </div>
    </div>
  )
}

export default XCallback
