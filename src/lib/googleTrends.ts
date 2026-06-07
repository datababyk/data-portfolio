// eslint-disable-next-line @typescript-eslint/no-require-imports
const googleTrends = require('google-trends-api')

export interface DailyTrendItem {
  query: string
  trafficVolume: string
}

export interface InterestPoint {
  date: string  // "YYYY-MM-DD"
  value: number // 0-100
}

export async function fetchDailyTrends(date: Date): Promise<DailyTrendItem[]> {
  try {
    const raw = await googleTrends.dailyTrends({ geo: 'KR', trendDate: date })
    const parsed = JSON.parse(raw)
    const days = parsed?.default?.trendingSearchesDays ?? []
    if (days.length === 0) return []

    return days[0].trendingSearches.map((t: { title: { query: string }, formattedTraffic: string }) => ({
      query: t.title.query,
      trafficVolume: t.formattedTraffic ?? '',
    }))
  } catch {
    return []
  }
}

export async function fetchInterestOverTime(
  keywords: string[],
  startDate: Date,
  endDate: Date
): Promise<Map<string, number>> {
  const resultMap = new Map<string, number>()
  if (keywords.length === 0) return resultMap

  // Google Trends allows max 5 keywords at once
  const BATCH = 5
  for (let i = 0; i < keywords.length; i += BATCH) {
    const batch = keywords.slice(i, i + BATCH)
    try {
      const raw = await googleTrends.interestOverTime({
        keyword: batch,
        startTime: startDate,
        endTime: endDate,
        geo: 'KR',
      })
      const parsed = JSON.parse(raw)
      const timeline = parsed?.default?.timelineData ?? []

      // Average the values across all time points for each keyword
      const sums = new Array(batch.length).fill(0)
      const counts = new Array(batch.length).fill(0)

      for (const point of timeline) {
        const values: number[] = point.value ?? []
        values.forEach((v, idx) => {
          if (v > 0) {
            sums[idx] += v
            counts[idx]++
          }
        })
      }

      batch.forEach((kw, idx) => {
        const avg = counts[idx] > 0 ? sums[idx] / counts[idx] : 0
        resultMap.set(kw, Math.round(avg * 10) / 10)
      })
    } catch {
      // Skip failed batch
    }

    if (i + BATCH < keywords.length) {
      await new Promise(r => setTimeout(r, 500))
    }
  }

  return resultMap
}
