import React from 'react'

interface XpBarProps {
  xp: number
  xpToNextLevel: number
  level: number
  showLabel?: boolean
}

const XpBar = ({ xp, xpToNextLevel, level, showLabel = true }: XpBarProps): React.JSX.Element => {
  const percent = Math.min((xp / xpToNextLevel) * 100, 100)

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between items-center mb-1.5">
          <div className="flex items-center gap-2">
            <span className="text-violet-400 font-bold text-sm">Lv.{level}</span>
            <span className="text-zinc-500 text-xs">→</span>
            <span className="text-zinc-500 text-xs">Lv.{level + 1}</span>
          </div>
          <span className="text-zinc-400 text-xs">
            <span className="text-amber-400 font-semibold">{xp.toLocaleString()}</span>
            <span className="text-zinc-700"> / </span>
            <span>{xpToNextLevel.toLocaleString()} XP</span>
          </span>
        </div>
      )}
      <div className="relative h-2 bg-zinc-800 rounded-full overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-violet-500 to-amber-500 transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
        {/* Glow effect */}
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-violet-400/30 to-amber-400/30 blur-sm"
          style={{ width: `${percent}%` }}
        />
      </div>
      {showLabel && (
        <div className="mt-1 text-right">
          <span className="text-zinc-600 text-xs">{percent.toFixed(1)}%</span>
        </div>
      )}
    </div>
  )
}

export default XpBar
