import { Suspense } from 'react'
import Header from '@/components/layout/Header'
import TrendGrid from '@/components/trends/TrendGrid'
import TrendSkeleton from '@/components/trends/TrendSkeleton'
import { currentWeek, formatWeekKorean, formatWeekRange } from '@/lib/weekUtils'

interface PageProps {
  searchParams: Promise<{ week?: string }>
}

export default async function ForeignPage({ searchParams }: PageProps) {
  const params = await searchParams
  const week = params.week ?? currentWeek()

  return (
    <div className="min-h-screen">
      <Header
        currentWeekLabel={formatWeekKorean(week)}
        weekRange={formatWeekRange(week)}
      />
      <main className="max-w-6xl mx-auto px-4 py-6">
        <Suspense fallback={
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {Array.from({ length: 10 }).map((_, i) => <TrendSkeleton key={i} />)}
          </div>
        }>
          <TrendGrid view="foreign" initialWeek={week} />
        </Suspense>
      </main>
    </div>
  )
}
