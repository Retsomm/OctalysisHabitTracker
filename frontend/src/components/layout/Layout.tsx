import React, { useRef, useEffect } from 'react'
import type { ReactNode } from 'react'
import Sidebar from './Sidebar'
import RightPanel from './RightPanel'
import BottomNav from './BottomNav'

interface LayoutProps {
  children: ReactNode
}

const Layout = ({ children }: LayoutProps): React.JSX.Element => {
  const rightPanelRef = useRef<HTMLDivElement>(null)
  const lastScrollY = useRef(0)

  useEffect(() => {
    const handleScroll = () => {
      const panel = rightPanelRef.current
      if (!panel) return

      const scrollY = window.scrollY
      const dy = scrollY - lastScrollY.current
      lastScrollY.current = scrollY

      const panelHeight = panel.offsetHeight
      const vpHeight = window.innerHeight

      if (panelHeight <= vpHeight) {
        // 右側內容比視窗矮：直接貼頂固定
        panel.style.top = '0px'
      } else {
        // 右側內容比視窗高：動態調整 top，讓底部先貼底、頂部先貼頂
        const currentTop = parseFloat(panel.style.top || '0')
        const newTop = currentTop - dy
        const minTop = vpHeight - panelHeight // 底部貼齊視窗底部
        panel.style.top = Math.max(minTop, Math.min(0, newTop)) + 'px'
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-zinc-950 flex [overflow-x:clip]">
      {/* Left Sidebar - hidden on mobile, icon-only on md, full on lg */}
      <Sidebar />

      {/* Main Content - no offset on mobile, icon-sidebar offset on md, full offset on lg */}
      <div className="flex-1 min-w-0 ml-0 md:ml-16 lg:ml-64 flex justify-center pb-16 md:pb-0">
        <div className="flex w-full min-w-0 max-w-5xl">
          {/* Main Feed */}
          <main className="flex-1 min-w-0 min-h-screen border-x border-zinc-800 max-w-2xl w-full overflow-x-hidden">
            {children}
          </main>

          {/* Right Panel - only on xl+
              align-self: flex-start 讓元素只佔自身高度（sticky 在 flex 容器中的必要條件）
              position: sticky + 動態 top 實現 X 風格滾動固定行為 */}
          <div
            ref={rightPanelRef}
            className="hidden xl:block w-80 ml-6 sticky"
            style={{ alignSelf: 'flex-start', top: '0px' }}
          >
            <RightPanel />
          </div>
        </div>
      </div>

      {/* Bottom Nav - mobile only */}
      <BottomNav />
    </div>
  )
}

export default Layout
