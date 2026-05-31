'use client'

import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts'
import type { TrendLabel, TrendHistoryPoint } from '@/types/trend'

const LINE_COLORS: Partial<Record<TrendLabel, string>> = {
  rising:    '#f87171',
  fading:    '#60a5fa',
  new_entry: '#34d399',
  stable:    '#fbbf24',
  exited:    '#6b7280',
}

interface SparklineChartProps {
  history: TrendHistoryPoint[]
  label: TrendLabel
}

export default function SparklineChart({ history, label }: SparklineChartProps) {
  if (history.length < 2) return null

  const color = LINE_COLORS[label] ?? '#8888aa'

  return (
    <ResponsiveContainer width="100%" height={40}>
      <LineChart data={history} margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
        <Line
          type="monotone"
          dataKey="score"
          stroke={color}
          strokeWidth={1.5}
          dot={false}
          activeDot={{ r: 3, fill: color }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#1c1c26',
            border: '1px solid #2a2a38',
            borderRadius: '6px',
            fontSize: '11px',
            color: '#f0f0f8',
          }}
          formatter={(value: number) => [value.toFixed(1), '검색량']}
          labelFormatter={(label: string) => label}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
