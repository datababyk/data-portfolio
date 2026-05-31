import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { discoverKoreanArticles, articlesToCorpus } from '@/lib/pipeline/discover'
import { extractKoreanKeywords } from '@/lib/pipeline/extract'
import { measureKeywords } from '@/lib/pipeline/measure'
import { storeKeywordScores } from '@/lib/pipeline/store'
import { computeAndStoreTrendLabels } from '@/lib/pipeline/compare'
import { currentWeek, prevWeek } from '@/lib/weekUtils'
import { FOREIGN_SEED_KEYWORDS } from '@/lib/pipeline/foreignKeywords'

export const dynamic = 'force-dynamic'
export const maxDuration = 300

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-admin-secret')
  if (!process.env.ADMIN_SECRET || secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    getDb()
    const thisWeek = currentWeek()
    const lastWeek = prevWeek(thisWeek)

    // Korean
    const articles = await discoverKoreanArticles()
    const { titles, bodies } = articlesToCorpus(articles)
    const keywords = extractKoreanKeywords(titles, bodies, 40)
    const koreanTerms = keywords.map(k => k.term)
    const koreanScores = await measureKeywords(koreanTerms, [lastWeek, thisWeek])
    storeKeywordScores(koreanScores, 'korean')
    const koreanLabeled = computeAndStoreTrendLabels(thisWeek, 'korean')

    // Foreign
    const foreignScores = await measureKeywords(FOREIGN_SEED_KEYWORDS, [lastWeek, thisWeek])
    storeKeywordScores(foreignScores, 'foreign')
    const foreignLabeled = computeAndStoreTrendLabels(thisWeek, 'foreign')

    return NextResponse.json({
      status: 'ok',
      week: thisWeek,
      korean_keywords: koreanLabeled,
      foreign_keywords: foreignLabeled,
    })
  } catch (err) {
    console.error('Admin collect error:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
