import React from 'react'
import { FireIcon } from './Icons'

interface StreakBadgeProps {
  streak: number
  size?: 'sm' | 'md' | 'lg'
}

const StreakBadge = ({ streak, size = 'md' }: StreakBadgeProps): React.JSX.Element => {
  const sizeClasses = {
    sm: 'text-sm px-2 py-0.5 gap-1',
    md: 'text-sm px-2.5 py-1 gap-1.5',
    lg: 'text-base px-3 py-1.5 gap-2',
  }

  const getStreakColor = (): string => {
    if (streak >= 30) return 'text-accent bg-accent-soft border-accent/30'
    if (streak >= 14) return 'text-warm-amber bg-warm-amber-soft border-warm-amber/30'
    if (streak >= 7) return 'text-warm-amber bg-warm-amber-soft/60 border-warm-amber/20'
    return 'text-ink-3 bg-line-2 border-line'
  }

  return (
    <span
      className={`inline-flex items-center rounded-full border font-medium font-mono ${sizeClasses[size]} ${getStreakColor()}`}
    >
      <FireIcon size={streak >= 7 ? 12 : 11} />
      <span>{streak} 天</span>
    </span>
  )
}

export default StreakBadge
