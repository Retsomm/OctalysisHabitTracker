import React, { useEffect, useState } from 'react'

interface TopProgressBarProps {
  isActive: boolean
}

const TopProgressBar = ({ isActive }: TopProgressBarProps): React.JSX.Element | null => {
  const [progress, setProgress] = useState(0)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!isActive) {
      if (visible) {
        setProgress(100)
        const hideTimer = setTimeout(() => {
          setVisible(false)
          setProgress(0)
        }, 400)
        return () => clearTimeout(hideTimer)
      }
      return
    }

    setVisible(true)
    setProgress(10)

    const fastTimer = setTimeout(() => setProgress(40), 200)
    const midTimer = setTimeout(() => setProgress(65), 800)
    const slowTimer = setTimeout(() => setProgress(85), 2000)

    return () => {
      clearTimeout(fastTimer)
      clearTimeout(midTimer)
      clearTimeout(slowTimer)
    }
  }, [isActive, visible])

  if (!visible) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] h-0.5 bg-transparent pointer-events-none">
      <div
        className="h-full bg-gradient-to-r from-violet-500 via-purple-400 to-violet-500 transition-all ease-out shadow-[0_0_8px_rgba(139,92,246,0.8)]"
        style={{ width: `${progress}%`, transitionDuration: progress === 100 ? '200ms' : '600ms' }}
      />
    </div>
  )
}

export default TopProgressBar
