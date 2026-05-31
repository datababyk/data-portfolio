import type { DatalabRequest, DatalabResponse, NewsResponse } from '@/types/naver'

function getNaverHeaders(): HeadersInit {
  const clientId = process.env.NAVER_CLIENT_ID
  const clientSecret = process.env.NAVER_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    throw new Error('NAVER_CLIENT_ID and NAVER_CLIENT_SECRET must be set in environment variables')
  }

  return {
    'X-Naver-Client-Id': clientId,
    'X-Naver-Client-Secret': clientSecret,
    'Content-Type': 'application/json',
  }
}

export async function fetchDataLab(request: DatalabRequest): Promise<DatalabResponse> {
  const res = await fetch('https://openapi.naver.com/v1/datalab/search', {
    method: 'POST',
    headers: getNaverHeaders(),
    body: JSON.stringify(request),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`DataLab API error ${res.status}: ${text}`)
  }

  return res.json() as Promise<DatalabResponse>
}

export async function searchNews(
  query: string,
  display = 100,
  sort: 'sim' | 'date' = 'date'
): Promise<NewsResponse> {
  const params = new URLSearchParams({
    query,
    display: String(display),
    sort,
    start: '1',
  })

  const res = await fetch(`https://openapi.naver.com/v1/search/news.json?${params}`, {
    method: 'GET',
    headers: getNaverHeaders(),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`News API error ${res.status}: ${text}`)
  }

  return res.json() as Promise<NewsResponse>
}

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
