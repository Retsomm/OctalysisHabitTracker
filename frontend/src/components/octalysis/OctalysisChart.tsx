import React from 'react'
import { useEffect, useState } from 'react'
import type { DriveType } from '../../types'

interface OctalysisChartProps {
  scores: Record<DriveType, number>
}

const driveLabels: Record<DriveType, { short: string; color: string }> = {
  1: { short: '史詩意義', color: '#8b5cf6' },
  2: { short: '發展成就', color: '#f59e0b' },
  3: { short: '創意授權', color: '#10b981' },
  4: { short: '所有權', color: '#3b82f6' },
  5: { short: '社會影響', color: '#ec4899' },
  6: { short: '稀缺性', color: '#f97316' },
  7: { short: '不確定性', color: '#06b6d4' },
  8: { short: '損失避免', color: '#ef4444' },
}

const SIZE = 300
const CENTER = SIZE / 2
const MAX_RADIUS = 110
const N = 8

const getPolygonPoint = (index: number, total: number, radius: number): [number, number] => {
  const angle = (index / total) * 2 * Math.PI - Math.PI / 2
  return [
    CENTER + radius * Math.cos(angle),
    CENTER + radius * Math.sin(angle),
  ]
}

const OctalysisChart = ({ scores }: OctalysisChartProps): React.JSX.Element => {
  const [animated, setAnimated] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 100)
    return () => clearTimeout(timer)
  }, [])

  // Background octagon grid lines
  const gridLevels = [20, 40, 60, 80, 100]

  const gridPolygons = gridLevels.map(level => {
    const r = (level / 100) * MAX_RADIUS
    const points = Array.from({ length: N }, (_, i) => getPolygonPoint(i, N, r))
    return points.map(([x, y]) => `${x},${y}`).join(' ')
  })

  // Axes
  const axes = Array.from({ length: N }, (_, i) => ({
    index: i,
    end: getPolygonPoint(i, N, MAX_RADIUS),
    labelPos: getPolygonPoint(i, N, MAX_RADIUS + 30),
    driveId: (i + 1) as DriveType,
  }))

  // Data polygon
  const dataPoints = Array.from({ length: N }, (_, i) => {
    const driveId = (i + 1) as DriveType
    const score = scores[driveId] ?? 0
    const animatedScore = animated ? score : 0
    const r = (animatedScore / 100) * MAX_RADIUS
    return getPolygonPoint(i, N, r)
  })
  const dataPolygon = dataPoints.map(([x, y]) => `${x},${y}`).join(' ')

  // Average score
  const avgScore = Math.round(
    Object.values(scores).reduce((a, b) => a + b, 0) / N
  )

  return (
    <div className="relative flex flex-col items-center">
      <svg
        width={SIZE + 60}
        height={SIZE + 60}
        viewBox={`-30 -30 ${SIZE + 60} ${SIZE + 60}`}
        className="overflow-visible"
      >
        {/* Grid polygons */}
        {gridPolygons.map((pts, gi) => (
          <polygon
            key={gi}
            points={pts}
            fill="none"
            stroke="#27272a"
            strokeWidth={gi === gridPolygons.length - 1 ? 1.5 : 1}
          />
        ))}

        {/* Grid level labels */}
        {gridLevels.map(level => {
          const r = (level / 100) * MAX_RADIUS
          return (
            <text
              key={level}
              x={CENTER}
              y={CENTER - r - 3}
              textAnchor="middle"
              fontSize="10"
              fill="#52525b"
            >
              {level}
            </text>
          )
        })}

        {/* Axis lines */}
        {axes.map(axis => (
          <line
            key={axis.index}
            x1={CENTER}
            y1={CENTER}
            x2={axis.end[0]}
            y2={axis.end[1]}
            stroke="#27272a"
            strokeWidth="1"
          />
        ))}

        {/* Data polygon fill */}
        <polygon
          points={dataPolygon}
          fill="url(#dataFill)"
          fillOpacity={animated ? 0.25 : 0}
          stroke="url(#dataStroke)"
          strokeWidth="2"
          strokeOpacity={animated ? 1 : 0}
          style={{ transition: 'all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
        />

        {/* Data points */}
        {dataPoints.map(([x, y], i) => {
          const driveId = (i + 1) as DriveType
          const color = driveLabels[driveId].color
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r={animated ? 4 : 0}
              fill={color}
              stroke="#000"
              strokeWidth="1.5"
              style={{ transition: `all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) ${i * 0.05}s` }}
            />
          )
        })}

        {/* Axis labels */}
        {axes.map(axis => {
          const driveLabel = driveLabels[axis.driveId]
          const score = scores[axis.driveId]
          const [lx, ly] = axis.labelPos

          // Adjust label alignment based on position
          const angle = (axis.index / N) * 360 - 90
          let anchor: 'start' | 'middle' | 'end' = 'middle'
          if (angle > -60 && angle < 60) anchor = 'middle'
          else if (angle >= 60 && angle < 120) anchor = 'start'
          else if (angle >= 120 && angle <= 180) anchor = 'middle'
          else if (angle > 180 && angle < 240) anchor = 'middle'
          else if (angle >= 240 && angle < 300) anchor = 'end'
          else anchor = 'end'

          return (
            <g key={axis.index}>
              <text
                x={lx}
                y={ly - 4}
                textAnchor={anchor}
                fontSize="12"
                fill={driveLabel.color}
                fontWeight="600"
              >
                {driveLabel.short}
              </text>
              <text
                x={lx}
                y={ly + 8}
                textAnchor={anchor}
                fontSize="11"
                fill="#71717a"
              >
                {score}
              </text>
            </g>
          )
        })}

        {/* Center score */}
        <text x={CENTER} y={CENTER - 6} textAnchor="middle" fontSize="20" fontWeight="bold" fill="white">
          {animated ? avgScore : 0}
        </text>
        <text x={CENTER} y={CENTER + 12} textAnchor="middle" fontSize="11" fill="#71717a">
          平均分
        </text>

        <defs>
          <radialGradient id="dataFill" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.3" />
          </radialGradient>
          <linearGradient id="dataStroke" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="50%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  )
}

export default OctalysisChart
