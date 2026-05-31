export type TrendLabel = 'rising' | 'fading' | 'new_entry' | 'exited' | 'stable'
export type TrendView = 'korean' | 'foreign'

export interface TrendHistoryPoint {
  week: string
  score: number
}

export interface TrendSummary {
  keyword: string
  label: TrendLabel
  score_current: number
  score_previous: number | null
  delta_pct: number | null
  history: TrendHistoryPoint[]
}

export interface TrendsApiResponse {
  week: string
  view: TrendView
  available_weeks: string[]
  rising: TrendSummary[]
  fading: TrendSummary[]
  new_entry: TrendSummary[]
  stable: TrendSummary[]
}

export interface KeywordHistoryResponse {
  keyword: string
  view: TrendView
  history: Array<{
    week: string
    score: number
    label: string
  }>
}
