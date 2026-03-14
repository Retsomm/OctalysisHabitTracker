import React, { useState } from 'react'
import { useGoogleLogin } from '@react-oauth/google'
import { useAppDispatch } from '../store/hooks'
import { loginSuccess } from '../store/authSlice'
import { api } from '../store/api'
import { useLoginGoogleMutation, useLoginGuestMutation } from '../store/api'

const OctagonLogo = (): React.JSX.Element => (
  <svg width="56" height="56" viewBox="0 0 36 36" fill="none">
    <polygon
      points="11,2 25,2 34,11 34,25 25,34 11,34 2,25 2,11"
      fill="none"
      stroke="url(#loginLogoGrad)"
      strokeWidth="2"
    />
    <polygon
      points="13,6 23,6 30,13 30,23 23,30 13,30 6,23 6,13"
      fill="url(#loginLogoFill)"
      opacity="0.3"
    />
    <text x="18" y="23" textAnchor="middle" fontSize="12" fontWeight="bold" fill="white">8</text>
    <defs>
      <linearGradient id="loginLogoGrad" x1="0" y1="0" x2="36" y2="36">
        <stop offset="0%" stopColor="#8b5cf6" />
        <stop offset="100%" stopColor="#06b6d4" />
      </linearGradient>
      <linearGradient id="loginLogoFill" x1="0" y1="0" x2="36" y2="36">
        <stop offset="0%" stopColor="#8b5cf6" />
        <stop offset="100%" stopColor="#06b6d4" />
      </linearGradient>
    </defs>
  </svg>
)

const GoogleIcon = (): React.JSX.Element => (
  <svg width="18" height="18" viewBox="0 0 24 24">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
)

const LineIcon = (): React.JSX.Element => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
    <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.105.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.070 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
  </svg>
)

const XIcon = (): React.JSX.Element => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622Zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
)

const LoginPage = (): React.JSX.Element => {
  const dispatch = useAppDispatch()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loginGoogle] = useLoginGoogleMutation()
  const [loginGuest] = useLoginGuestMutation()

  const handleXLogin = async (): Promise<void> => {
    const array = new Uint8Array(32)
    crypto.getRandomValues(array)
    const codeVerifier = btoa(String.fromCharCode(...array))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '')

    const encoder = new TextEncoder()
    const data = encoder.encode(codeVerifier)
    const digest = await crypto.subtle.digest('SHA-256', data)
    const codeChallenge = btoa(String.fromCharCode(...new Uint8Array(digest)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '')

    const state = crypto.randomUUID()
    sessionStorage.setItem('x_oauth_state', state)
    sessionStorage.setItem('x_code_verifier', codeVerifier)

    const clientId = import.meta.env.VITE_X_CLIENT_ID as string
    const redirectUri = import.meta.env.VITE_X_REDIRECT_URI as string
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: clientId,
      redirect_uri: redirectUri,
      scope: 'users.read tweet.read offline.access',
      state,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
    })
    window.location.href = `https://twitter.com/i/oauth2/authorize?${params.toString()}`
  }

  const handleLineLogin = (): void => {
    const state = crypto.randomUUID()
    sessionStorage.setItem('line_oauth_state', state)
    const clientId = import.meta.env.VITE_LINE_CLIENT_ID as string
    const redirectUri = import.meta.env.VITE_LINE_REDIRECT_URI as string
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: clientId,
      redirect_uri: redirectUri,
      state,
      scope: 'profile openid email',
    })
    window.location.href = `https://access.line.me/oauth2/v2.1/authorize?${params.toString()}`
  }

  const login = useGoogleLogin({
    onSuccess: async tokenResponse => {
      setIsLoading(true)
      setError(null)
      try {
        const result = await loginGoogle({ token: tokenResponse.access_token }).unwrap()
        dispatch(api.util.resetApiState())
        dispatch(loginSuccess({ user: result.user, token: result.token }))
      } catch {
        setError('登入失敗，請再試一次')
      } finally {
        setIsLoading(false)
      }
    },
    onError: () => {
      setError('Google 登入被取消或發生錯誤')
      setIsLoading(false)
    },
    onNonOAuthError: () => {
      setIsLoading(false)
    },
  })

  const handleGuestLogin = async (): Promise<void> => {
    try {
      const result = await loginGuest().unwrap()
      dispatch(api.util.resetApiState())
      dispatch(loginSuccess({ user: result.user, token: result.token }))
    } catch {
      setError('訪客登入失敗，請再試一次')
    }
  }

  const drives = [
    { color: '#8b5cf6', label: '史詩意義' },
    { color: '#f59e0b', label: '發展成就' },
    { color: '#10b981', label: '創意授權' },
    { color: '#3b82f6', label: '所有權' },
    { color: '#ec4899', label: '社會影響' },
    { color: '#f97316', label: '稀缺性' },
    { color: '#06b6d4', label: '不確定性' },
    { color: '#ef4444', label: '損失避免' },
  ]

  return (
    <div className="min-h-screen bg-zinc-950 flex">
      {/* Left decorative panel - hidden on mobile */}
      <div className="hidden lg:flex flex-col justify-between w-96 bg-zinc-900 border-r border-zinc-800 p-10 relative overflow-hidden">
        {/* Background octagon pattern */}
        <div className="absolute inset-0 opacity-5">
          {Array.from({ length: 5 }, (_, row) =>
            Array.from({ length: 4 }, (_, col) => (
              <svg
                key={`${row}-${col}`}
                className="absolute"
                style={{ left: `${col * 28 - 8}%`, top: `${row * 22 - 5}%` }}
                width="80"
                height="80"
                viewBox="0 0 80 80"
              >
                <polygon
                  points="24,4 56,4 76,24 76,56 56,76 24,76 4,56 4,24"
                  fill="none"
                  stroke="white"
                  strokeWidth="1.5"
                />
              </svg>
            ))
          )}
        </div>

        {/* Top branding */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <OctagonLogo />
            <div>
              <div className="text-white font-bold text-lg leading-tight">八角習慣</div>
              <div className="text-zinc-500 text-sm">Octalysis Tracker</div>
            </div>
          </div>
          <h2 className="text-white text-2xl font-bold leading-snug mb-3">
            用八大驅動力<br />打造不可停止的習慣
          </h2>
          <p className="text-zinc-400 text-sm leading-relaxed">
            基於 Yu-kai Chou 的 Octalysis 框架，透過遊戲化設計讓習慣養成更有趣、更持久。
          </p>
        </div>

        {/* Drive badges */}
        <div className="relative z-10">
          <div className="text-zinc-500 text-xs mb-3 uppercase tracking-wider">八大驅動力</div>
          <div className="flex flex-wrap gap-2">
            {drives.map(d => (
              <span
                key={d.label}
                className="px-2.5 py-1 rounded-full text-xs font-medium border"
                style={{
                  color: d.color,
                  borderColor: `${d.color}40`,
                  backgroundColor: `${d.color}12`,
                }}
              >
                {d.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Right login panel */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        {/* Mobile logo */}
        <div className="flex lg:hidden items-center gap-3 mb-10">
          <OctagonLogo />
          <div>
            <div className="text-white font-bold text-lg">八角習慣</div>
            <div className="text-zinc-500 text-sm">Octalysis Tracker</div>
          </div>
        </div>

        <div className="w-full max-w-sm">
          <h1 className="text-white text-3xl font-bold mb-2">歡迎回來</h1>
          <p className="text-zinc-400 text-sm mb-10">登入以繼續追蹤你的習慣旅程</p>

          {/* Google Sign-In Button */}
          <button
            onClick={() => {
              setError(null)
              login()
            }}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 bg-white hover:bg-zinc-100 text-zinc-900 font-semibold py-3.5 px-6 rounded-2xl transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-black/20 cursor-pointer"
          >
            {isLoading ? (
              <svg className="animate-spin w-5 h-5 text-zinc-500" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
            ) : (
              <GoogleIcon />
            )}
            <span>{isLoading ? '登入中...' : '使用 Google 帳號登入'}</span>
          </button>

          {/* LINE Sign-In Button */}
          <button
            onClick={handleLineLogin}
            className="w-full flex items-center justify-center gap-3 bg-[#00B900] hover:bg-[#009900] text-white font-semibold py-3.5 px-6 rounded-2xl transition-all duration-200 shadow-lg shadow-black/20 mt-3 cursor-pointer"
          >
            <LineIcon />
            <span>使用 LINE 帳號登入</span>
          </button>

          {/* X Sign-In Button */}
          <button
            onClick={() => { void handleXLogin() }}
            className="w-full flex items-center justify-center gap-3 bg-black hover:bg-zinc-800 text-white font-semibold py-3.5 px-6 rounded-2xl transition-all duration-200 shadow-lg shadow-black/20 mt-3 border border-zinc-700 cursor-pointer"
          >
            <XIcon />
            <span>使用 X 帳號登入</span>
          </button>

          {/* Error message */}
          {error && (
            <div className="mt-4 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          {/* Divider */}
          <div className="flex items-center gap-3 my-8">
            <div className="flex-1 h-px bg-zinc-800" />
            <span className="text-zinc-600 text-xs">或者</span>
            <div className="flex-1 h-px bg-zinc-800" />
          </div>

          {/* Guest mode */}
          <button
            onClick={() => { void handleGuestLogin() }}
            className="w-full py-3 rounded-2xl border border-zinc-700 text-zinc-300 text-sm font-medium hover:border-zinc-500 hover:text-white hover:bg-zinc-900 transition-all duration-200 cursor-pointer"
          >
            以訪客身份探索
          </button>

          <p className="text-zinc-600 text-xs text-center mt-8 leading-relaxed">
            登入即表示你同意我們的服務條款<br />
            你的資料受到 OAuth 2.0 保護
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
