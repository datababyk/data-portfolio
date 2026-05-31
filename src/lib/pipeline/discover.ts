import { searchNews, delay } from '@/lib/naver'
import type { NewsItem } from '@/types/naver'

const DISCOVERY_QUERIES = [
  '이슈', '화제', '트렌드', '인기', '화제의', '논란', '급상승', '관심',
]

export interface DiscoveredArticle {
  title: string
  description: string
  isTitle: boolean
}

export async function discoverKoreanArticles(): Promise<DiscoveredArticle[]> {
  const articles: DiscoveredArticle[] = []
  const seenLinks = new Set<string>()

  for (const query of DISCOVERY_QUERIES) {
    try {
      const res = await searchNews(query, 100, 'date')
      for (const item of res.items) {
        if (seenLinks.has(item.link)) continue
        seenLinks.add(item.link)
        articles.push({
          title: cleanHtml(item.title),
          description: cleanHtml(item.description),
          isTitle: true,
        })
      }
      await delay(200)
    } catch (err) {
      console.warn(`Discovery query "${query}" failed:`, err)
    }
  }

  return articles
}

function cleanHtml(text: string): string {
  return text
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-zA-Z]+;/g, ' ')
    .replace(/&#\d+;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function articlesToCorpus(articles: DiscoveredArticle[]): { titles: string[]; bodies: string[] } {
  const titles: string[] = []
  const bodies: string[] = []

  for (const article of articles) {
    titles.push(article.title)
    bodies.push(article.description)
  }

  return { titles, bodies }
}
