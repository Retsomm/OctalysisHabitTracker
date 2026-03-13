import React from 'react'
import { FireIcon } from './Icons'

interface StreakBadgeProps {
  streak: number
  size?: 'sm' | 'md' | 'lg'
}

const StreakBadge = ({ streak, size = 'md' }: StreakBadgeProps): React.JSX.Element => {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-sm px-2.5 py-1 gap-1.5',
    lg: 'text-base px-3 py-1.5 gap-2',
  }

  const getStreakColor = (): string => {
    if (streak >= 30) return 'text-red-400 bg-red-500/10 border-red-500/30'
    if (streak >= 14) return 'text-orange-400 bg-orange-500/10 border-orange-500/30'
    if (streak >= 7) return 'text-amber-400 bg-amber-500/10 border-amber-500/30'
    return 'text-zinc-300 bg-zinc-700/50 border-zinc-600'
  }

  const iconColor = streak >= 30 ? 'text-red-400' : streak >= 14 ? 'text-orange-400' : streak >= 7 ? 'text-amber-400' : 'text-zinc-400'

  return (
    <span
      className={`inline-flex items-center rounded-full border font-semibold ${sizeClasses[size]} ${getStreakColor()}`}
    >
      <span className={iconColor}><FireIcon size={streak >= 7 ? 12 : 11} /></span>
      <span>{streak} 天</span>
    </span>
  )
}

export default StreakBadge
