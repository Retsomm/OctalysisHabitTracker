import React, { useRef, useEffect } from 'react'
import type { ReactNode } from 'react'
import Sidebar from './Sidebar'
import RightPanel from './RightPanel'
import BottomNav from './BottomNav'

interface LayoutProps {
  children: ReactNode
}

const Layout = ({ children }: LayoutProps): React.JSX.Element => {
  const contentRef = useRef<HTMLDivElement>(null)
  const rightPanelRef = useRef<HTMLDivElement>(null)
  const lastScrollY = useRef(0)

  useEffect(() => {
    const container = contentRef.current
    if (!container) return

    const handleScroll = () => {
      const panel = rightPanelRef.current
      if (!panel) return

      const scrollY = container.scrollTop
      const dy = scrollY - lastScrollY.current
      lastScrollY.current = scrollY

      const panelHeight = panel.offsetHeight
      const vpHeight = container.clientHeight

      if (panelHeight <= vpHeight) {
        panel.style.top = '0px'
      } else {
        const currentTop = parseFloat(panel.style.top || '0')
        const newTop = currentTop - dy
        const minTop = vpHeight - panelHeight
        panel.style.top = Math.max(minTop, Math.min(0, newTop)) + 'px'
      }
    }

    container.addEventListener('scroll', handleScroll, { passive: true })
    return () => container.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="h-screen bg-ivory flex [overflow-x:clip] overflow-hidden">
      <Sidebar />

      <div
        ref={contentRef}
        className="flex-1 min-w-0 ml-0 md:ml-16 lg:ml-64 flex justify-center overflow-y-auto pb-[calc(64px+env(safe-area-inset-bottom,0px))] md:pb-0"
      >
        <div className="flex w-full min-w-0 max-w-5xl">
          <main className="flex-1 min-w-0 border-x border-line max-w-2xl w-full overflow-x-hidden bg-ivory">
            {children}
          </main>

          <div
            ref={rightPanelRef}
            className="hidden xl:block w-80 ml-6 sticky"
            style={{ alignSelf: 'flex-start', top: '0px' }}
          >
            <RightPanel />
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  )
}

export default Layout
