import 'dotenv/config'
import path from 'path'

// Setup paths for module resolution
process.env.DB_PATH = process.env.DB_PATH || './data/trendsensor.db'

// Need to use relative imports for tsx
import('../src/lib/db.js').catch(() => {})

async function main() {
  // Dynamic imports to avoid ESM issues
  const { getDb } = await import('../src/lib/db')
  const { discoverKoreanArticles, articlesToCorpus } = await import('../src/lib/pipeline/discover')
  const { extractKoreanKeywords } = await import('../src/lib/pipeline/extract')
  const { measureKeywords } = await import('../src/lib/pipeline/measure')
  const { storeKeywordScores } = await import('../src/lib/pipeline/store')
  const { computeAndStoreTrendLabels } = await import('../src/lib/pipeline/compare')
  const { currentWeek, prevWeek } = await import('../src/lib/weekUtils')
  const { FOREIGN_SEED_KEYWORDS } = await import('../src/lib/pipeline/foreignKeywords')

  // Ensure DB is initialized
  getDb()

  const thisWeek = currentWeek()
  const lastWeek = prevWeek(thisWeek)
  const twoWeeksAgo = prevWeek(lastWeek)

  console.log(`Seeding data for weeks: ${twoWeeksAgo}, ${lastWeek}, ${thisWeek}`)

  // ===== KOREAN VIEW =====
  console.log('\n[Korean] Discovering keywords from news...')
  const articles = await discoverKoreanArticles()
  console.log(`  Found ${articles.length} articles`)

  const { titles, bodies } = articlesToCorpus(articles)
  const keywords = extractKoreanKeywords(titles, bodies, 40)
  console.log(`  Extracted ${keywords.length} keywords:`, keywords.slice(0, 10).map(k => k.term).join(', '), '...')

  const koreanTerms = keywords.map(k => k.term)

  console.log(`\n[Korean] Measuring DataLab scores for ${koreanTerms.length} keywords...`)
  const koreanScores = await measureKeywords(koreanTerms, [twoWeeksAgo, lastWeek, thisWeek])
  console.log(`  Got ${koreanScores.length} score data points`)

  storeKeywordScores(koreanScores, 'korean')
  console.log('  Stored Korean snapshots')

  const koreanLabeled = computeAndStoreTrendLabels(thisWeek, 'korean')
  console.log(`  Computed labels for ${koreanLabeled} Korean keywords`)

  // ===== FOREIGN VIEW =====
  console.log('\n[Foreign] Measuring DataLab scores for foreign keywords...')
  const foreignScores = await measureKeywords(FOREIGN_SEED_KEYWORDS, [twoWeeksAgo, lastWeek, thisWeek])
  console.log(`  Got ${foreignScores.length} score data points`)

  storeKeywordScores(foreignScores, 'foreign')
  console.log('  Stored Foreign snapshots')

  const foreignLabeled = computeAndStoreTrendLabels(thisWeek, 'foreign')
  console.log(`  Computed labels for ${foreignLabeled} Foreign keywords`)

  // Summary
  const db = getDb()
  const snapCount = (db.prepare('SELECT COUNT(*) as cnt FROM weekly_snapshots').get() as { cnt: number }).cnt
  const labelCount = (db.prepare('SELECT COUNT(*) as cnt FROM trend_labels').get() as { cnt: number }).cnt
  console.log(`\nSeeding complete: ${snapCount} snapshots, ${labelCount} labels in DB`)
}

main().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
