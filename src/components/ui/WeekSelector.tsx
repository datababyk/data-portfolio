'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { formatWeekKorean } from '@/lib/weekUtils'

interface WeekSelectorProps {
  currentWeek: string
  availableWeeks: string[]
  view: string
}

export default function WeekSelector({ currentWeek, availableWeeks, view }: WeekSelectorProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const currentIndex = availableWeeks.indexOf(currentWeek)
  const hasPrev = currentIndex < availableWeeks.length - 1
  const hasNext = currentIndex > 0

  const navigate = (week: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('week', week)
    router.push(`/${view}?${params.toString()}`)
  }

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={() => hasPrev && navigate(availableWeeks[currentIndex + 1])}
        disabled={!hasPrev}
        className="w-8 h-8 flex items-center justify-center rounded-lg text-sm transition-opacity disabled:opacity-30"
        style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-secondary)' }}
        aria-label="이전 주"
      >
        ‹
      </button>

      <span className="text-sm font-medium min-w-28 text-center" style={{ color: 'var(--text-primary)' }}>
        {formatWeekKorean(currentWeek)}
      </span>

      <button
        onClick={() => hasNext && navigate(availableWeeks[currentIndex - 1])}
        disabled={!hasNext}
        className="w-8 h-8 flex items-center justify-center rounded-lg text-sm transition-opacity disabled:opacity-30"
        style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-secondary)' }}
        aria-label="다음 주"
      >
        ›
      </button>
    </div>
  )
}
