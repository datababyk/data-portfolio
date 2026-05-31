import { fetchDataLab, delay } from '@/lib/naver'
import { formatDateYYYYMMDD, weekStart, weekEnd } from '@/lib/weekUtils'

const BATCH_SIZE = 5
const DELAY_MS = 300

export interface KeywordScore {
  keyword: string
  week: string
  score: number
}

export async function measureKeywords(
  keywords: string[],
  weeks: string[]
): Promise<KeywordScore[]> {
  if (weeks.length === 0 || keywords.length === 0) return []

  // Determine overall date range from all weeks
  const allStarts = weeks.map((w) => weekStart(w))
  const allEnds = weeks.map((w) => weekEnd(w))
  const minDate = new Date(Math.min(...allStarts.map((d) => d.getTime())))
  const maxDate = new Date(Math.max(...allEnds.map((d) => d.getTime())))

  const startDate = formatDateYYYYMMDD(minDate)
  const endDate = formatDateYYYYMMDD(maxDate)

  const results: KeywordScore[] = []

  // Batch keywords in groups of BATCH_SIZE
  for (let i = 0; i < keywords.length; i += BATCH_SIZE) {
    const batch = keywords.slice(i, i + BATCH_SIZE)

    try {
      const response = await fetchDataLab({
        startDate,
        endDate,
        timeUnit: 'week',
        keywordGroups: batch.map((kw) => ({
          groupName: kw,
          keywords: [kw],
        })),
      })

      for (const result of response.results) {
        const keyword = result.title

        for (const dataPoint of result.data) {
          // DataLab returns week starting dates — find which ISO week this belongs to
          const pointDate = new Date(dataPoint.period)
          const pointWeek = getISOWeekFromDate(pointDate)

          if (weeks.includes(pointWeek)) {
            results.push({
              keyword,
              week: pointWeek,
              score: dataPoint.ratio,
            })
          }
        }
      }
    } catch (err) {
      console.warn(`DataLab batch failed for keywords [${batch.join(', ')}]:`, err)
    }

    if (i + BATCH_SIZE < keywords.length) {
      await delay(DELAY_MS)
    }
  }

  return results
}

function getISOWeekFromDate(date: Date): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`
}
