'use client'

import { useEffect, useState } from 'react'
import type { VisaLevel } from '@/types/visa'
import { getScoreLevelConfig } from '@/lib/visa-config'

interface Props {
  score: number
  level: VisaLevel
  size?: number
}

export default function ScoreCircle({ score, level, size = 160 }: Props) {
  const [animatedScore, setAnimatedScore] = useState(0)
  const levelConfig = getScoreLevelConfig(level)

  const radius = (size - 16) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (animatedScore / 100) * circumference

  useEffect(() => {
    let frame: number
    const start = animatedScore
    const diff = score - start
    const duration = 800
    const startTime = performance.now()

    function animate(now: number) {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setAnimatedScore(Math.round(start + diff * eased))
      if (progress < 1) frame = requestAnimationFrame(animate)
    }

    frame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frame)
  }, [score])

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="-rotate-90" width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#E5E7EB"
          strokeWidth="8"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={levelConfig.color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke 0.3s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="font-heading text-4xl font-black"
          style={{ color: levelConfig.color }}
        >
          {animatedScore}
        </span>
        <span className="text-sm text-gray-400">/100</span>
      </div>
    </div>
  )
}
