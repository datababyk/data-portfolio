import { KOREAN_STOPWORDS, NEWS_SOURCE_STOPWORDS } from '@/lib/stopwords'

const HANGUL_REGEX = /[가-힣]+/g
const MIN_TOKEN_LEN = 2
const MAX_TOKEN_LEN = 8

export interface ExtractedKeyword {
  term: string
  score: number
  titleCount: number
  docCount: number
}

export function extractKoreanKeywords(
  titles: string[],
  bodies: string[],
  topN = 40
): ExtractedKeyword[] {
  const titleFreq = new Map<string, number>()
  const bodyFreq = new Map<string, number>()
  const docFreq = new Map<string, number>()

  for (const title of titles) {
    const tokens = tokenize(title)
    const seen = new Set<string>()
    for (const token of tokens) {
      titleFreq.set(token, (titleFreq.get(token) ?? 0) + 1)
      if (!seen.has(token)) {
        docFreq.set(token, (docFreq.get(token) ?? 0) + 1)
        seen.add(token)
      }
    }
  }

  for (const body of bodies) {
    const tokens = tokenize(body)
    for (const token of tokens) {
      bodyFreq.set(token, (bodyFreq.get(token) ?? 0) + 1)
    }
  }

  const allTerms = new Set(
    Array.from(titleFreq.keys()).concat(Array.from(bodyFreq.keys()))
  )
  const results: ExtractedKeyword[] = []

  for (const term of Array.from(allTerms)) {
    const tf = (titleFreq.get(term) ?? 0) * 2 + (bodyFreq.get(term) ?? 0)
    const df = docFreq.get(term) ?? 0
    const score = tf + df * 3

    results.push({
      term,
      score,
      titleCount: titleFreq.get(term) ?? 0,
      docCount: df,
    })
  }

  return results
    .sort((a, b) => b.score - a.score)
    .slice(0, topN)
}

function tokenize(text: string): string[] {
  const tokens: string[] = []
  const matches = text.match(HANGUL_REGEX) ?? []

  for (const chunk of matches) {
    // Take the full chunk if within length range
    if (chunk.length >= MIN_TOKEN_LEN && chunk.length <= MAX_TOKEN_LEN) {
      if (isValidToken(chunk)) tokens.push(chunk)
    }

    // Also extract 2-gram substrings from longer chunks
    if (chunk.length > MAX_TOKEN_LEN) {
      for (let i = 0; i <= chunk.length - 2; i++) {
        const sub2 = chunk.slice(i, i + 2)
        if (isValidToken(sub2)) tokens.push(sub2)
        if (i <= chunk.length - 3) {
          const sub3 = chunk.slice(i, i + 3)
          if (isValidToken(sub3)) tokens.push(sub3)
        }
      }
    }
  }

  return tokens
}

function isValidToken(token: string): boolean {
  if (token.length < MIN_TOKEN_LEN || token.length > MAX_TOKEN_LEN) return false
  if (KOREAN_STOPWORDS.has(token)) return false
  if (NEWS_SOURCE_STOPWORDS.has(token)) return false
  return true
}
