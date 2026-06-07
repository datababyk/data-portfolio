import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { currentWeek } from '@/lib/weekUtils'
import type { TrendsApiResponse, TrendSummary, TrendView } from '@/types/trend'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const view = (searchParams.get('view') ?? 'korean') as TrendView
  const weekParam = searchParams.get('week')

  if (!['korean', 'foreign'].includes(view)) {
    return NextResponse.json({ error: 'Invalid view' }, { status: 400 })
  }

  try {
    const db = getDb()

    // Available weeks for this view
    const availableRows = db.prepare(`
      SELECT DISTINCT tl.iso_week
      FROM trend_labels tl
      JOIN keywords k ON k.id = tl.keyword_id
      WHERE k.view = ?
      ORDER BY tl.iso_week DESC
      LIMIT 12
    `).all(view) as Array<{ iso_week: string }>

    const available_weeks = availableRows.map(r => r.iso_week)
    const week = weekParam && available_weeks.includes(weekParam)
      ? weekParam
      : (available_weeks[0] ?? currentWeek())

    // Get trend labels + current/previous scores for this week
    const labelRows = db.prepare(`
      SELECT k.term, tl.label, tl.score_current, tl.score_previous, tl.delta_pct
      FROM trend_labels tl
      JOIN keywords k ON k.id = tl.keyword_id
      WHERE k.view = ? AND tl.iso_week = ?
      ORDER BY tl.delta_pct DESC NULLS LAST
    `).all(view, week) as Array<{
      term: string
      label: string
      score_current: number | null
      score_previous: number | null
      delta_pct: number | null
    }>

    // Get 4-week history for sparklines
    const historyRows = db.prepare(`
      SELECT k.term, ws.iso_week, ws.score
      FROM weekly_snapshots ws
      JOIN keywords k ON k.id = ws.keyword_id
      WHERE k.view = ?
        AND ws.iso_week <= ?
        AND ws.iso_week > (
          SELECT iso_week FROM weekly_snapshots
          JOIN keywords ON keywords.id = weekly_snapshots.keyword_id
          WHERE keywords.view = ?
          ORDER BY iso_week ASC
          LIMIT 1 OFFSET 3
        )
      ORDER BY ws.iso_week ASC
    `).all(view, week, view) as Array<{ term: string; iso_week: string; score: number }>

    // Build history map
    const historyMap = new Map<string, Array<{ week: string; score: number }>>()
    for (const row of historyRows) {
      if (!historyMap.has(row.term)) historyMap.set(row.term, [])
      historyMap.get(row.term)!.push({ week: row.iso_week, score: row.score })
    }

    // Build summaries
    const summaries: TrendSummary[] = labelRows.map(row => ({
      keyword: row.term,
      label: row.label as TrendSummary['label'],
      score_current: row.score_current ?? 0,
      score_previous: row.score_previous,
      delta_pct: row.delta_pct,
      history: historyMap.get(row.term) ?? [],
    }))

    const response: TrendsApiResponse = {
      week,
      view,
      available_weeks,
      rising: summaries.filter(s => s.label === 'rising').sort((a, b) => (b.delta_pct ?? 0) - (a.delta_pct ?? 0)),
      fading: summaries.filter(s => s.label === 'fading').sort((a, b) => (a.delta_pct ?? 0) - (b.delta_pct ?? 0)),
      new_entry: summaries.filter(s => s.label === 'new_entry').sort((a, b) => b.score_current - a.score_current),
      stable: summaries.filter(s => s.label === 'stable').sort((a, b) => b.score_current - a.score_current),
    }

    return NextResponse.json(response)
  } catch (err) {
    console.error('Trends API error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
