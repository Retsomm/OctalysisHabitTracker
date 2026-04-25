import React, { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'

const navItems = [
  {
    path: '/',
    label: '習慣',
    icon: (
      <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
        <path d="M2.5 8.5l2 2 3-3 3 3 3-5"/>
      </svg>
    ),
  },
  {
    path: '/dashboard',
    label: '儀表板',
    icon: (
      <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
        <rect x="2" y="2" width="5" height="5"/><rect x="9" y="2" width="5" height="5"/>
        <rect x="2" y="9" width="5" height="5"/><rect x="9" y="9" width="5" height="5"/>
      </svg>
    ),
  },
  {
    path: '/explore',
    label: '探索',
    icon: (
      <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
        <circle cx="8" cy="8" r="5.5"/>
        <path d="M11 5L9 9l-4 2 2-4z" fill="currentColor" fillOpacity=".15"/>
      </svg>
    ),
  },
  {
    path: '/profile',
    label: '個人',
    icon: (
      <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
        <circle cx="8" cy="5.5" r="2.5"/><path d="M3 14c.8-2.5 2.8-4 5-4s4.2 1.5 5 4"/>
      </svg>
    ),
  },
]

const INPUT_TAGS = new Set(['INPUT', 'TEXTAREA', 'SELECT'])

const BottomNav = (): React.JSX.Element | null => {
  const [keyboardOpen, setKeyboardOpen] = useState(false)

  useEffect(() => {
    const onFocusIn = (e: FocusEvent) => {
      if (INPUT_TAGS.has((e.target as HTMLElement).tagName)) {
        setKeyboardOpen(true)
      }
    }

    const onFocusOut = () => {
      setTimeout(() => {
        if (!document.activeElement || !INPUT_TAGS.has(document.activeElement.tagName)) {
          setKeyboardOpen(false)
        }
      }, 100)
    }

    window.addEventListener('focusin', onFocusIn)
    window.addEventListener('focusout', onFocusOut)
    return () => {
      window.removeEventListener('focusin', onFocusIn)
      window.removeEventListener('focusout', onFocusOut)
    }
  }, [])

  if (keyboardOpen) return null

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-20 flex md:hidden bg-paper border-t border-line">
      {navItems.map(item => (
        <NavLink
          key={item.path}
          to={item.path}
          end={item.path === '/'}
          className={({ isActive }) =>
            `flex flex-1 flex-col items-center justify-center py-[15px] gap-1 transition-colors ${
              isActive ? 'text-ink-1' : 'text-ink-4'
            }`
          }
        >
          <span className="w-5 h-5 flex items-center justify-center">{item.icon}</span>
          <span className="font-mono text-[10px] leading-none">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  )
}

export default BottomNav
