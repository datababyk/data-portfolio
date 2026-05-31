import { getDb } from '@/lib/db'
import type { TrendView } from '@/types/trend'
import type { KeywordScore } from './measure'

export function storeKeywordScores(
  scores: KeywordScore[],
  view: TrendView
): void {
  const db = getDb()
  const now = new Date().toISOString()

  const upsertKeyword = db.prepare(`
    INSERT INTO keywords (term, view, first_seen, is_active)
    VALUES (@term, @view, @first_seen, 1)
    ON CONFLICT(term) DO UPDATE SET is_active = 1
  `)

  const getKeywordId = db.prepare(`SELECT id FROM keywords WHERE term = ?`)

  const upsertSnapshot = db.prepare(`
    INSERT INTO weekly_snapshots (keyword_id, iso_week, score, collected_at)
    VALUES (@keyword_id, @iso_week, @score, @collected_at)
    ON CONFLICT(keyword_id, iso_week) DO UPDATE SET
      score = excluded.score,
      collected_at = excluded.collected_at
  `)

  const insertMany = db.transaction((items: KeywordScore[]) => {
    for (const item of items) {
      upsertKeyword.run({ term: item.keyword, view, first_seen: item.week })
      const row = getKeywordId.get(item.keyword) as { id: number } | undefined
      if (!row) continue

      upsertSnapshot.run({
        keyword_id: row.id,
        iso_week: item.week,
        score: item.score,
        collected_at: now,
      })
    }
  })

  insertMany(scores)
}
