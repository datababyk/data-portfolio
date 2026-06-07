import { NextRequest, NextResponse } from 'next/server'
import { searchNews } from '@/lib/naver'

export const dynamic = 'force-dynamic'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ keyword: string }> }
) {
  const { keyword } = await params
  const term = decodeURIComponent(keyword)

  try {
    const res = await searchNews(term, 20, 'date')

    const articles = res.items.map((item) => ({
      title: stripHtml(item.title),
      description: stripHtml(item.description),
      link: item.originallink || item.link,
      pubDate: item.pubDate,
      source: extractSource(item.originallink || item.link),
    }))

    return NextResponse.json({ keyword: term, articles })
  } catch (err) {
    console.error('News API error:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

function stripHtml(text: string): string {
  return text
    .replace(/<[^>]+>/g, '')
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#\d+;/g, '')
    .trim()
}

function extractSource(url: string): string {
  try {
    const hostname = new URL(url).hostname
    return hostname.replace(/^www\./, '')
  } catch {
    return ''
  }
}
