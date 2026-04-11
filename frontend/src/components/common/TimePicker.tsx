import React from 'react'

interface TimePickerProps {
  value: string // "HH:MM" or ""
  onChange: (time: string) => void
}

const TimePicker = ({ value, onChange }: TimePickerProps): React.JSX.Element => {
  const [rawHour, rawMinute] = value ? value.split(':') : ['08', '00']
  const hour = parseInt(rawHour, 10)
  const minute = parseInt(rawMinute, 10)

  const setHour = (h: number): void => {
    const clamped = ((h % 24) + 24) % 24
    onChange(`${String(clamped).padStart(2, '0')}:${String(minute).padStart(2, '0')}`)
  }

  const setMinute = (m: number): void => {
    const clamped = ((m % 60) + 60) % 60
    onChange(`${String(hour).padStart(2, '0')}:${String(clamped).padStart(2, '0')}`)
  }

  const hourDisplay = String(hour).padStart(2, '0')
  const minuteDisplay = String(minute).padStart(2, '0')

  const spinnerClass = "flex flex-col items-center gap-1"
  const arrowClass = "w-8 h-6 flex items-center justify-center text-zinc-500 hover:text-amber-400 transition-colors cursor-pointer select-none text-sm leading-none rounded hover:bg-zinc-800"
  const valueClass = "text-2xl font-bold text-white w-12 text-center tabular-nums leading-none py-1"

  return (
    <div className="flex items-center gap-3">
      <div className={spinnerClass}>
        <button type="button" className={arrowClass} onClick={() => setHour(hour + 1)}>▲</button>
        <span className={valueClass}>{hourDisplay}</span>
        <button type="button" className={arrowClass} onClick={() => setHour(hour - 1)}>▼</button>
      </div>
      <span className="text-2xl font-bold text-zinc-400 pb-0.5">:</span>
      <div className={spinnerClass}>
        <button type="button" className={arrowClass} onClick={() => setMinute(minute + 5)}>▲</button>
        <span className={valueClass}>{minuteDisplay}</span>
        <button type="button" className={arrowClass} onClick={() => setMinute(minute - 5)}>▼</button>
      </div>
    </div>
  )
}

export default TimePicker
