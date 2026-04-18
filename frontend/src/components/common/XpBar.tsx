import React from 'react'

interface XpBarProps {
  xp: number
  xpToNextLevel: number
  level: number
  showLabel?: boolean
}

const XpBar = ({ xp, xpToNextLevel, level: _level, showLabel = true }: XpBarProps): React.JSX.Element => {
  const percent = Math.min((xp / xpToNextLevel) * 100, 100)

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between items-center mb-1.5">
          <div className="flex items-center gap-2 font-mono text-sm">
            <span className="text-ink-4">{xp.toLocaleString()} / {xpToNextLevel.toLocaleString()} XP</span>
          </div>
          <span className="font-mono text-sm text-ink-4">{percent.toFixed(1)}%</span>
        </div>
      )}
      <div className="relative h-[6px] bg-line-2 rounded-full overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-accent transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}

export default XpBar
