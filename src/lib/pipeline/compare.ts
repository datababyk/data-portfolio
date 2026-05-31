import { getDb } from '@/lib/db'
import type { TrendLabel, TrendView } from '@/types/trend'
import { prevWeek } from '@/lib/weekUtils'

interface ClassifyResult {
  label: TrendLabel
  delta_pct: number | null
}

function classifyTrend(
  scoreCurrent: number | null,
  scorePrevious: number | null
): ClassifyResult {
  if (scoreCurrent === null || scoreCurrent < 0.5) {
    return { label: 'exited', delta_pct: null }
  }

  if (scorePrevious === null || scorePrevious < 1.0) {
    return { label: 'new_entry', delta_pct: null }
  }

  const delta = ((scoreCurrent - scorePrevious) / scorePrevious) * 100

  if (delta >= 30) return { label: 'rising', delta_pct: delta }
  if (delta <= -25) return { label: 'fading', delta_pct: delta }
  return { label: 'stable', delta_pct: delta }
}

export function computeAndStoreTrendLabels(targetWeek: string, view: TrendView): number {
  const db = getDb()
  const prev = prevWeek(targetWeek)

  // Get all keywords for this view that have a snapshot this week
  const currentSnapshots = db.prepare(`
    SELECT k.id as keyword_id, k.term, ws.score as score_current
    FROM keywords k
    JOIN weekly_snapshots ws ON ws.keyword_id = k.id
    WHERE k.view = ? AND ws.iso_week = ?
  `).all(view, targetWeek) as Array<{ keyword_id: number; term: string; score_current: number }>

  // Get previous week snapshots for comparison
  const prevMap = new Map<number, number>()
  const prevSnapshots = db.prepare(`
    SELECT keyword_id, score
    FROM weekly_snapshots
    WHERE iso_week = ?
  `).all(prev) as Array<{ keyword_id: number; score: number }>

  for (const snap of prevSnapshots) {
    prevMap.set(snap.keyword_id, snap.score)
  }

  const upsertLabel = db.prepare(`
    INSERT INTO trend_labels (keyword_id, iso_week, label, score_current, score_previous, delta_pct)
    VALUES (@keyword_id, @iso_week, @label, @score_current, @score_previous, @delta_pct)
    ON CONFLICT(keyword_id, iso_week) DO UPDATE SET
      label = excluded.label,
      score_current = excluded.score_current,
      score_previous = excluded.score_previous,
      delta_pct = excluded.delta_pct
  `)

  const insertAll = db.transaction(() => {
    for (const snap of currentSnapshots) {
      const scorePrev = prevMap.get(snap.keyword_id) ?? null
      const { label, delta_pct } = classifyTrend(snap.score_current, scorePrev)

      upsertLabel.run({
        keyword_id: snap.keyword_id,
        iso_week: targetWeek,
        label,
        score_current: snap.score_current,
        score_previous: scorePrev,
        delta_pct: delta_pct ?? null,
      })
    }
  })

  insertAll()
  return currentSnapshots.length
}
