import React from 'react'
import type { Drive } from '../../types'

interface DriveCardProps {
  drive: Drive
  score?: number
  habitCount?: number
  onClick?: () => void
}

const driveSymbols: Record<number, string> = {
  1: '✦',
  2: '◈',
  3: '◎',
  4: '◆',
  5: '◉',
  6: '◑',
  7: '◐',
  8: '◗',
}

const DriveCard = ({ drive, score = 0, habitCount = 0, onClick }: DriveCardProps): React.JSX.Element => {
  const symbol = driveSymbols[drive.id] ?? '✦'

  return (
    <div
      onClick={onClick}
      className={`p-4 rounded-2xl border transition-all duration-200 hover:scale-105 hover:shadow-lg cursor-pointer ${drive.bgColor} ${drive.borderColor}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-base font-bold ${drive.bgColor} border ${drive.borderColor} ${drive.color}`}>
            {symbol}
          </div>
          <div>
            <div className={`text-xs font-bold ${drive.color}`}>Drive #{drive.id}</div>
          </div>
        </div>
        <div className={`text-2xl font-black ${drive.color}`}>{score}</div>
      </div>

      {/* Names */}
      <h4 className="text-white font-semibold text-sm mb-0.5">{drive.chineseName}</h4>
      <p className="text-zinc-500 text-xs leading-snug mb-3">{drive.description}</p>

      {/* Score bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs">
          <span className="text-zinc-600">進度</span>
          <span className={`font-semibold ${drive.color}`}>{score}%</span>
        </div>
        <div className="h-1.5 bg-zinc-800/80 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-1000 ease-out ${drive.barColor}`}
            style={{ width: `${score}%` }}
          />
        </div>
      </div>

      {/* Habit count */}
      {habitCount > 0 && (
        <div className="mt-2 text-xs text-zinc-500">
          <span className={`font-semibold ${drive.color}`}>{habitCount}</span> 個習慣
        </div>
      )}
    </div>
  )
}

export default DriveCard
