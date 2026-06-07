export interface DatalabKeywordGroup {
  groupName: string
  keywords: string[]
}

export interface DatalabRequest {
  startDate: string
  endDate: string
  timeUnit: 'date' | 'week' | 'month'
  keywordGroups: DatalabKeywordGroup[]
}

export interface DatalabDataPoint {
  period: string
  ratio: number
}

export interface DatalabResult {
  title: string
  keywords: string[]
  data: DatalabDataPoint[]
}

export interface DatalabResponse {
  startDate: string
  endDate: string
  timeUnit: string
  results: DatalabResult[]
}

export interface NewsItem {
  title: string
  originallink: string
  link: string
  description: string
  pubDate: string
}

export interface NewsResponse {
  lastBuildDate: string
  total: number
  start: number
  display: number
  items: NewsItem[]
}
