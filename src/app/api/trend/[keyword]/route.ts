import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import type { KeywordHistoryResponse } from '@/types/trend'

export const dynamic = 'force-dynamic'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ keyword: string }> }
) {
  const { keyword } = await params
  const term = decodeURIComponent(keyword)

  try {
    const db = getDb()

    const keywordRow = db.prepare(`SELECT id, view FROM keywords WHERE term = ?`).get(term) as
      | { id: number; view: string }
      | undefined

    if (!keywordRow) {
      return NextResponse.json({ error: 'Keyword not found' }, { status: 404 })
    }

    const historyRows = db.prepare(`
      SELECT ws.iso_week, ws.score,
             COALESCE(tl.label, 'stable') as label
      FROM weekly_snapshots ws
      LEFT JOIN trend_labels tl ON tl.keyword_id = ws.keyword_id AND tl.iso_week = ws.iso_week
      WHERE ws.keyword_id = ?
      ORDER BY ws.iso_week ASC
    `).all(keywordRow.id) as Array<{ iso_week: string; score: number; label: string }>

    const response: KeywordHistoryResponse = {
      keyword: term,
      view: keywordRow.view as 'korean' | 'foreign',
      history: historyRows.map(row => ({
        week: row.iso_week,
        score: row.score,
        label: row.label,
      })),
    }

    return NextResponse.json(response)
  } catch (err) {
    console.error('Keyword history API error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
