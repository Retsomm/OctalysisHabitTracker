import React from 'react'
import { NavLink } from 'react-router-dom'
import { googleLogout } from '@react-oauth/google'
import { useAppSelector, useAppDispatch } from '@/store/hooks'
import { logout } from '@/store/authSlice'
import { useGetUserProfileQuery, api } from '@/store/api'

const navItems = [
  {
    path: '/',
    label: '習慣',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
        <path d="M2.5 8.5l2 2 3-3 3 3 3-5"/>
      </svg>
    ),
  },
  {
    path: '/dashboard',
    label: '儀表板',
    kbd: '2',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
        <rect x="2" y="2" width="5" height="5"/><rect x="9" y="2" width="5" height="5"/>
        <rect x="2" y="9" width="5" height="5"/><rect x="9" y="9" width="5" height="5"/>
      </svg>
    ),
  },
  {
    path: '/profile',
    label: '個人',
    kbd: '3',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
        <circle cx="8" cy="5.5" r="2.5"/><path d="M3 14c.8-2.5 2.8-4 5-4s4.2 1.5 5 4"/>
      </svg>
    ),
  },
  {
    path: '/explore',
    label: '探索',
    kbd: '4',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
        <circle cx="8" cy="8" r="5.5"/>
        <path d="M11 5L9 9l-4 2 2-4z" fill="currentColor" fillOpacity=".15"/>
      </svg>
    ),
  },
]

const LogoutIcon = (): React.JSX.Element => (
  <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
    <path d="M9 3H3v10h6"/><path d="M7 8h7m-2-2l2 2-2 2"/>
  </svg>
)

const LoginIcon = (): React.JSX.Element => (
  <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
    <path d="M7 13H13V3H7"/><path d="M9 8H2m2-2L2 8l2 2"/>
  </svg>
)

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
  const avatarUrl = profile?.avatar ?? authUser?.picture ?? ''
  const isGuest = authUser?.provider === 'guest'
  const level = profile?.level ?? 1
  const xp = profile?.xp ?? 0

  return (
    <aside className="fixed left-0 top-0 h-screen hidden md:flex flex-col border-r border-line bg-paper z-10 py-7 w-16 lg:w-64 px-2 lg:px-5">
      {/* Brand */}
      <div className="flex items-center justify-center lg:justify-start gap-3 mb-6 pb-4 border-b border-line-2 lg:px-2">
        <div className="relative w-9 h-9 rounded-full bg-ink-1 text-paper flex items-center justify-center font-serif text-xl italic shrink-0">
          D
          <span className="absolute inset-[-3px] rounded-full border border-ink-1 opacity-20 pointer-events-none"></span>
        </div>
        <div className="hidden lg:block">
          <div className="font-serif text-xl text-ink-1 leading-tight">DODOHabit</div>
          <div className="font-mono text-sm text-ink-4 tracking-widest uppercase mt-0.5">Octalysis · v2</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-0.5">
        <div className="hidden lg:block font-mono text-sm text-ink-4 tracking-[0.14em] uppercase px-2.5 pt-1 pb-1.5">Practice</div>
        {navItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              `flex items-center justify-center lg:justify-start gap-3 px-2.5 py-2.5 rounded-[10px] transition-colors duration-150 ${
                isActive
                  ? 'bg-ink-1 text-paper'
                  : 'text-ink-2 hover:bg-[#f1ebdf]'
              }`
            }
          >
            <span className="w-4 h-4 flex items-center justify-center shrink-0">{item.icon}</span>
            <span className="hidden lg:block text-sm">{item.label}</span>
            {item.kbd && (
              <span className="hidden lg:block ml-auto font-mono text-sm border border-current opacity-40 px-1.5 py-0.5 rounded-[5px]">
                {item.kbd}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User section */}
      <div className="mt-auto pt-3.5 border-t border-line-2">
        <div className="flex items-center justify-center lg:justify-start gap-2.5 px-1 lg:px-2.5 py-2.5 rounded-[10px]">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-soft to-accent shrink-0 flex items-center justify-center text-paper font-serif text-base overflow-hidden">
            {avatarUrl && (avatarUrl.includes('http') || avatarUrl.startsWith('data:')) ? (
              <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <span className="font-serif italic text-base">
                {(avatarUrl && avatarUrl.length <= 10) ? avatarUrl : (isGuest ? '?' : displayName?.charAt(0) || '?')}
              </span>
            )}
          </div>
          <div className="hidden lg:flex flex-1 min-w-0 flex-col">
            <div className="text-ink-1 text-[13.5px] font-medium truncate">{displayName || '使用者'}</div>
            <div className="font-mono text-[12px] text-ink-3 truncate mt-0.5">Lv.{level} · {xp} XP</div>
          </div>
          <button
            onClick={handleLogout}
            className="hidden lg:flex w-7 h-7 rounded-[8px] border border-line items-center justify-center text-ink-3 hover:bg-[#f1ebdf] transition-colors cursor-pointer shrink-0"
            title={isGuest ? '登入' : '登出'}
          >
            {isGuest ? <LoginIcon /> : <LogoutIcon />}
          </button>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
