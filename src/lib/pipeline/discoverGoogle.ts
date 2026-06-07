import { fetchDailyTrends, fetchInterestOverTime } from '@/lib/googleTrends'
import { weekStart, weekEnd, formatDateYYYYMMDD } from '@/lib/weekUtils'
import { getDb } from '@/lib/db'
import { computeAndStoreTrendLabels } from './compare'

const DELAY_MS = 500

function delay(ms: number) {
  return new Promise(r => setTimeout(r, ms))
}

// Collect daily trending keywords for each day of a given ISO week
async function collectWeeklyKeywords(isoWeek: string): Promise<Map<string, number>> {
  const start = weekStart(isoWeek)
  const end = weekEnd(isoWeek)
  const freqMap = new Map<string, number>()

  const current = new Date(start)
  while (current <= end) {
    const items = await fetchDailyTrends(new Date(current))
    for (const item of items) {
      freqMap.set(item.query, (freqMap.get(item.query) ?? 0) + 1)
    }
    current.setDate(current.getDate() + 1)
    await delay(DELAY_MS)
  }

  return freqMap
}

export async function collectAndStoreGoogleTrends(
  targetWeek: string,
  prevWeekStr: string
): Promise<number> {
  const db = getDb()
  const now = new Date().toISOString()

  console.log(`  [Google] Collecting daily trends for ${prevWeekStr}...`)
  const prevFreq = await collectWeeklyKeywords(prevWeekStr)

  console.log(`  [Google] Collecting daily trends for ${targetWeek}...`)
  const currFreq = await collectWeeklyKeywords(targetWeek)

  // Union of keywords from both weeks
  const allKeywords = Array.from(
    new Set([...Array.from(prevFreq.keys()), ...Array.from(currFreq.keys())])
  ).slice(0, 50)

  console.log(`  [Google] Measuring interestOverTime for ${allKeywords.length} keywords...`)

  const prevStart = weekStart(prevWeekStr)
  const currEnd = weekEnd(targetWeek)

  const scoreMap = await fetchInterestOverTime(allKeywords, prevStart, currEnd)

  // Store keywords + snapshots
  const upsertKeyword = db.prepare(`
    INSERT INTO keywords (term, view, first_seen, is_active)
    VALUES (@term, 'google', @first_seen, 1)
    ON CONFLICT(term) DO UPDATE SET is_active = 1
  `)
  const getKwId = db.prepare(`SELECT id FROM keywords WHERE term = ?`)
  const upsertSnap = db.prepare(`
    INSERT INTO weekly_snapshots (keyword_id, iso_week, score, collected_at)
    VALUES (@keyword_id, @iso_week, @score, @collected_at)
    ON CONFLICT(keyword_id, iso_week) DO UPDATE SET score = excluded.score
  `)

  const insertAll = db.transaction(() => {
    for (const kw of allKeywords) {
      upsertKeyword.run({ term: kw, first_seen: targetWeek })
      const row = getKwId.get(kw) as { id: number } | undefined
      if (!row) continue

      const score = scoreMap.get(kw) ?? 0

      // For prev week: use prev frequency as proxy if no score
      const prevScore = prevFreq.has(kw) ? (scoreMap.get(kw) ?? prevFreq.get(kw)! * 10) : 0
      const currScore = currFreq.has(kw) ? score : 0

      if (prevScore > 0) {
        upsertSnap.run({ keyword_id: row.id, iso_week: prevWeekStr, score: prevScore, collected_at: now })
      }
      if (currScore > 0) {
        upsertSnap.run({ keyword_id: row.id, iso_week: targetWeek, score: currScore, collected_at: now })
      }
    }
  })

  insertAll()

  const labeled = computeAndStoreTrendLabels(targetWeek, 'google')
  return labeled
}
