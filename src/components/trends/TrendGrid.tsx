'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import TrendCard from './TrendCard'
import TrendSkeleton from './TrendSkeleton'
import WeekSelector from '@/components/ui/WeekSelector'
import EmptyState from '@/components/ui/EmptyState'
import type { TrendsApiResponse, TrendSummary } from '@/types/trend'
import { formatWeekRange } from '@/lib/weekUtils'

interface TrendGridProps {
  view: 'korean' | 'foreign' | 'google'
  initialWeek?: string
}

interface SectionProps {
  title: string
  emoji: string
  items: TrendSummary[]
  defaultOpen?: boolean
}

function TrendSection({ title, emoji, items, defaultOpen = true }: SectionProps) {
  const [open, setOpen] = useState(defaultOpen)

  if (items.length === 0) return null

  return (
    <section>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 mb-4 group w-full text-left"
      >
        <span className="text-lg">{emoji}</span>
        <h2 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
          {title}
        </h2>
        <span className="text-sm px-2 py-0.5 rounded-full ml-1" style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-muted)' }}>
          {items.length}
        </span>
        <span className="ml-auto text-xs" style={{ color: 'var(--text-muted)' }}>
          {open ? '▲' : '▼'}
        </span>
      </button>
      {open && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 mb-8">
          {items.map((trend) => (
            <TrendCard key={trend.keyword} trend={trend} />
          ))}
        </div>
      )}
    </section>
  )
}

export default function TrendGrid({ view, initialWeek }: TrendGridProps) {
  const searchParams = useSearchParams()
  const weekParam = searchParams.get('week') ?? initialWeek

  const [data, setData] = useState<TrendsApiResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)

    const url = `/api/trends?view=${view}${weekParam ? `&week=${weekParam}` : ''}`

    fetch(url)
      .then(res => res.json())
      .then((json: TrendsApiResponse) => {
        setData(json)
        setLoading(false)
      })
      .catch(err => {
        setError(String(err))
        setLoading(false)
      })
  }, [view, weekParam])

  if (loading) {
    return (
      <div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {Array.from({ length: 10 }).map((_, i) => (
            <TrendSkeleton key={i} />
          ))}
        </div>
      </div>
    )
  }

  if (error || !data) {
    return <EmptyState view={view} />
  }

  const isEmpty = data.rising.length === 0 && data.fading.length === 0 && data.new_entry.length === 0
  if (isEmpty) {
    return <EmptyState view={view} />
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          {formatWeekRange(data.week)} 기준
        </p>
        <WeekSelector
          currentWeek={data.week}
          availableWeeks={data.available_weeks}
          view={view}
        />
      </div>

      <TrendSection title="급상승 트렌드" emoji="🔥" items={data.rising} defaultOpen={true} />
      <TrendSection title="이번 주 신규 진입" emoji="✨" items={data.new_entry} defaultOpen={true} />
      <TrendSection title="하락 트렌드" emoji="📉" items={data.fading} defaultOpen={true} />
      <TrendSection title="안정 트렌드" emoji="📊" items={data.stable} defaultOpen={false} />
    </div>
  )
}
