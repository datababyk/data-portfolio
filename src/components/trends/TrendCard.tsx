'use client'

import TrendBadge from './TrendBadge'
import SparklineChart from './SparklineChart'
import type { TrendSummary } from '@/types/trend'

interface TrendCardProps {
  trend: TrendSummary
}

export default function TrendCard({ trend }: TrendCardProps) {
  const deltaDisplay =
    trend.delta_pct !== null
      ? `${trend.delta_pct > 0 ? '+' : ''}${Math.round(trend.delta_pct)}%`
      : trend.label === 'new_entry'
      ? '신규'
      : '-'

  const deltaColor =
    trend.label === 'rising' ? '#f87171'
    : trend.label === 'fading' ? '#60a5fa'
    : trend.label === 'new_entry' ? '#34d399'
    : 'var(--text-muted)'

  return (
    <div
      className="rounded-xl p-4 flex flex-col gap-3 hover:opacity-90 transition-opacity cursor-default"
      style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm truncate" style={{ color: 'var(--text-primary)' }}>
            {trend.keyword}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <TrendBadge label={trend.label} />
            <span className="text-xs font-bold" style={{ color: deltaColor }}>
              {deltaDisplay}
            </span>
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className="text-lg font-bold tabular-nums" style={{ color: 'var(--text-primary)' }}>
            {trend.score_current.toFixed(1)}
          </p>
          {trend.score_previous !== null && (
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              전주 {trend.score_previous.toFixed(1)}
            </p>
          )}
        </div>
      </div>

      {trend.history.length >= 2 && (
        <SparklineChart history={trend.history} label={trend.label} />
      )}
    </div>
  )
}
