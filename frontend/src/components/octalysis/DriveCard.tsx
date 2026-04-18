import React from 'react'
import type { Drive } from '@/types'

interface DriveCardProps {
  drive: Drive
  score?: number
  habitCount?: number
  onClick?: () => void
}

const driveHexColors: Record<number, string> = {
  1: '#6b4a5e', 2: '#a87625', 3: '#4d5a3a', 4: '#3a4a5c',
  5: '#6b4a5e', 6: '#b7552e', 7: '#3a4a5c', 8: '#b7552e',
}

const driveHexSoftColors: Record<number, string> = {
  1: '#e0d0d8', 2: '#ecdcc0', 3: '#d9dcc6', 4: '#cdd4dc',
  5: '#e0d0d8', 6: '#e8d6c6', 7: '#cdd4dc', 8: '#e8d6c6',
}

const DriveCard = ({ drive, score = 0, habitCount = 0, onClick }: DriveCardProps): React.JSX.Element => {
  const hexColor = driveHexColors[drive.id] ?? '#9b978e'
  const hexSoft = driveHexSoftColors[drive.id] ?? '#efe9db'

  return (
    <div
      onClick={onClick}
      className="p-5 rounded-[14px] border border-line bg-card relative overflow-hidden cursor-pointer hover:border-ink-4/30 hover:shadow-sm transition-all duration-200"
    >
      {/* Decorative corner */}
      <div
        className="absolute top-0 right-0 w-[90px] h-[90px] rounded-bl-full opacity-70"
        style={{ background: hexSoft }}
      />

      {/* Header */}
      <div className="flex items-center justify-between mb-2.5 relative">
        <span className="font-mono text-[12px] text-ink-4 tracking-[0.1em] uppercase">DRIVE · 0{drive.id}</span>
        <span className="font-mono text-[12px]" style={{ color: hexColor }}>{score}%</span>
      </div>

      {/* Name */}
      <div className="font-serif text-[26px] leading-[1.1] relative" style={{ color: '#1a1915' }}>{drive.chineseName}</div>
      <div className="font-mono text-sm text-ink-4 mt-1 tracking-[0.04em]">{drive.name}</div>

      <p className="text-ink-3 text-[13px] mt-3 leading-relaxed relative text-wrap-pretty">{drive.description}</p>

      {/* Score dots + action */}
      <div className="flex items-center justify-between mt-4">
        <div className="flex gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <span
              key={i}
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: hexColor, opacity: (score / 100) * 5 > i ? 0.85 : 0.15 }}
            />
          ))}
        </div>
        <div className="flex items-center gap-2">
          {habitCount > 0 && (
            <span className="font-mono text-sm text-ink-4">{habitCount} 個習慣</span>
          )}
          <span className="font-mono text-[13px]" style={{ color: hexColor }}>進度 →</span>
        </div>
      </div>
    </div>
  )
}

export default DriveCard
