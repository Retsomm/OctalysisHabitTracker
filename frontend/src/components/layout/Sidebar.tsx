import React from 'react'
import { NavLink } from 'react-router-dom'
import { googleLogout } from '@react-oauth/google'
import { useAppSelector, useAppDispatch } from '../../store/hooks'
import { logout } from '../../store/authSlice'
import { useGetUserProfileQuery, api } from '../../store/api'
import { HomeIcon, BarChartIcon, CompassIcon, UserIcon } from '../common/Icons'

const OctagonLogo = (): React.JSX.Element => (
  <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
    <polygon
      points="11,2 25,2 34,11 34,25 25,34 11,34 2,25 2,11"
      fill="none"
      stroke="url(#logoGrad)"
      strokeWidth="2"
    />
    <polygon
      points="13,6 23,6 30,13 30,23 23,30 13,30 6,23 6,13"
      fill="url(#logoGradFill)"
      opacity="0.3"
    />
    <text x="18" y="23" textAnchor="middle" fontSize="12" fontWeight="bold" fill="white">8</text>
    <defs>
      <linearGradient id="logoGrad" x1="0" y1="0" x2="36" y2="36">
        <stop offset="0%" stopColor="#8b5cf6" />
        <stop offset="100%" stopColor="#06b6d4" />
      </linearGradient>
      <linearGradient id="logoGradFill" x1="0" y1="0" x2="36" y2="36">
        <stop offset="0%" stopColor="#8b5cf6" />
        <stop offset="100%" stopColor="#06b6d4" />
      </linearGradient>
    </defs>
  </svg>
)

const LogoutIcon = (): React.JSX.Element => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
)

const LoginIcon = (): React.JSX.Element => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
    <polyline points="8 17 3 12 8 7"/>
    <line x1="3" y1="12" x2="15" y2="12"/>
  </svg>
)

interface NavItem {
  path: string
  icon: React.ReactNode
  label: string
}

const navItems: NavItem[] = [
  { path: '/', icon: <HomeIcon />, label: '習慣' },
  { path: '/dashboard', icon: <BarChartIcon />, label: '儀表板' },
  { path: '/profile', icon: <UserIcon />, label: '個人' },
  { path: '/explore', icon: <CompassIcon />, label: '探索' },
]

const Sidebar = (): React.JSX.Element => {
  const dispatch = useAppDispatch()
  const authUser = useAppSelector(state => state.auth.user)
  const { data: profile } = useGetUserProfileQuery()

  const handleLogout = (): void => {
    if (authUser?.provider === 'google') {
      googleLogout()
    }
    dispatch(logout())
    dispatch(api.util.resetApiState())
  }

  const displayName = profile?.displayName ?? authUser?.name ?? ''
  const displayEmail = authUser?.email ?? profile?.username ?? ''
  const avatarUrl = profile?.avatar ?? authUser?.picture ?? ''
  const isGuest = authUser?.provider === 'guest'

  return (
    <aside className="fixed left-0 top-0 h-screen hidden md:flex flex-col border-r border-zinc-800 bg-zinc-950 z-10 py-6 w-16 lg:w-64 px-2 lg:px-4">
      {/* Logo */}
      <div className="flex items-center justify-center lg:justify-start gap-3 mb-8 lg:px-2">
        <OctagonLogo />
        <div className="hidden lg:block">
          <div className="text-white font-bold text-sm leading-tight">八角習慣</div>
          <div className="text-zinc-500 text-xs">Octalysis Tracker</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1">
        {navItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              `flex items-center justify-center lg:justify-start gap-4 px-3 py-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-zinc-800 text-white font-semibold'
                  : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
              }`
            }
          >
            <span className="w-5 h-5 flex items-center justify-center shrink-0">{item.icon}</span>
            <span className="hidden lg:block text-base">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User Profile + Logout at bottom */}
      <div className="mt-auto pt-4 border-t border-zinc-800 space-y-1">
        {/* User info */}
        <div className="flex items-center justify-center lg:justify-start gap-3 px-1 lg:px-3 py-3 rounded-xl">
          {/* Avatar */}
          <div className="w-9 h-9 rounded-full bg-zinc-800 border border-zinc-700 shrink-0 overflow-hidden flex items-center justify-center">
            {avatarUrl && (avatarUrl.includes('http') || avatarUrl.startsWith('data:')) ? (
              <img
                src={avatarUrl}
                alt={displayName}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <span className="text-lg">
                {(avatarUrl && avatarUrl.length <= 10) ? avatarUrl : (isGuest ? '👤' : displayName?.charAt(0) || '?')}
              </span>
            )}
          </div>
          <div className="hidden lg:flex flex-1 min-w-0 flex-col">
            <div className="text-white text-sm font-semibold truncate">{displayName}</div>
            <div className="text-zinc-500 text-xs truncate">{displayEmail}</div>
          </div>
          <div className="hidden lg:flex flex-col items-end shrink-0">
            <span className="text-xs text-violet-400 font-bold">Lv.{profile?.level ?? 1}</span>
          </div>
        </div>

        {/* Login / Logout button */}
        {isGuest ? (
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center lg:justify-start gap-3 px-1 lg:px-3 py-2.5 rounded-xl text-zinc-500 hover:text-violet-400 hover:bg-violet-500/10 transition-all duration-200 group cursor-pointer"
            title="登入"
          >
            <span className="w-5 h-5 flex items-center justify-center shrink-0 group-hover:text-violet-400">
              <LoginIcon />
            </span>
            <span className="hidden lg:block text-sm">登入</span>
          </button>
        ) : (
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center lg:justify-start gap-3 px-1 lg:px-3 py-2.5 rounded-xl text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 group cursor-pointer"
            title="登出"
          >
            <span className="w-5 h-5 flex items-center justify-center shrink-0 group-hover:text-red-400">
              <LogoutIcon />
            </span>
            <span className="hidden lg:block text-sm">登出</span>
          </button>
        )}
      </div>
    </aside>
  )
}

export default Sidebar
