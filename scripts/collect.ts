import 'dotenv/config'

process.env.DB_PATH = process.env.DB_PATH || './data/trendsensor.db'

async function main() {
  const { getDb } = await import('../src/lib/db')
  const { discoverKoreanArticles, articlesToCorpus } = await import('../src/lib/pipeline/discover')
  const { extractKoreanKeywords } = await import('../src/lib/pipeline/extract')
  const { measureKeywords } = await import('../src/lib/pipeline/measure')
  const { storeKeywordScores } = await import('../src/lib/pipeline/store')
  const { computeAndStoreTrendLabels } = await import('../src/lib/pipeline/compare')
  const { currentWeek, prevWeek } = await import('../src/lib/weekUtils')
  const { FOREIGN_SEED_KEYWORDS } = await import('../src/lib/pipeline/foreignKeywords')

  getDb()

  const thisWeek = currentWeek()
  const lastWeek = prevWeek(thisWeek)

  console.log(`Collecting trends for week: ${thisWeek}`)

  // Korean
  console.log('\n[Korean] Discovering...')
  const articles = await discoverKoreanArticles()
  const { titles, bodies } = articlesToCorpus(articles)
  const keywords = extractKoreanKeywords(titles, bodies, 40)
  const koreanTerms = keywords.map(k => k.term)

  const koreanScores = await measureKeywords(koreanTerms, [lastWeek, thisWeek])
  storeKeywordScores(koreanScores, 'korean')
  const koreanLabeled = computeAndStoreTrendLabels(thisWeek, 'korean')
  console.log(`  Korean: ${koreanLabeled} keywords labeled`)

  // Foreign
  console.log('\n[Foreign] Measuring...')
  const foreignScores = await measureKeywords(FOREIGN_SEED_KEYWORDS, [lastWeek, thisWeek])
  storeKeywordScores(foreignScores, 'foreign')
  const foreignLabeled = computeAndStoreTrendLabels(thisWeek, 'foreign')
  console.log(`  Foreign: ${foreignLabeled} keywords labeled`)

  console.log('\nCollection complete.')
}

main().catch((err) => {
  console.error('Collection failed:', err)
  process.exit(1)
})
