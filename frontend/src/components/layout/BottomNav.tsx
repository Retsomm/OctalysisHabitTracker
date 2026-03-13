import React from 'react'
import { NavLink } from 'react-router-dom'
import { HomeIcon, BarChartIcon, CompassIcon, UserIcon } from '../common/Icons'

interface NavItem {
  path: string
  icon: React.ReactNode
  label: string
}

const navItems: NavItem[] = [
  { path: '/', icon: <HomeIcon />, label: '習慣' },
  { path: '/dashboard', icon: <BarChartIcon />, label: '儀表板' },
  { path: '/explore', icon: <CompassIcon />, label: '探索' },
  { path: '/profile', icon: <UserIcon />, label: '個人' },
]

const BottomNav = (): React.JSX.Element => (
  <nav className="fixed bottom-0 left-0 right-0 z-20 flex md:hidden bg-zinc-950 border-t border-zinc-800">
    {navItems.map(item => (
      <NavLink
        key={item.path}
        to={item.path}
        end={item.path === '/'}
        className={({ isActive }) =>
          `flex flex-1 flex-col items-center justify-center py-3 gap-1 transition-colors ${
            isActive ? 'text-white' : 'text-zinc-500'
          }`
        }
      >
        <span className="w-5 h-5 flex items-center justify-center">{item.icon}</span>
        <span className="text-[10px] leading-none">{item.label}</span>
      </NavLink>
    ))}
  </nav>
)

export default BottomNav
