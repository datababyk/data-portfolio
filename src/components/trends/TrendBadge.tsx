import type { TrendLabel } from '@/types/trend'

const BADGE_CONFIG: Record<TrendLabel, { text: string; bg: string; color: string }> = {
  rising:    { text: '급상승', bg: '#3f1515', color: '#f87171' },
  fading:    { text: '하락',   bg: '#0f1f3f', color: '#60a5fa' },
  new_entry: { text: '신규',   bg: '#0f2f1f', color: '#34d399' },
  exited:    { text: '종료',   bg: '#1f1f2f', color: '#6b7280' },
  stable:    { text: '안정',   bg: '#2f2510', color: '#fbbf24' },
}

export default function TrendBadge({ label }: { label: TrendLabel }) {
  const cfg = BADGE_CONFIG[label]
  return (
    <span
      className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold"
      style={{ backgroundColor: cfg.bg, color: cfg.color }}
    >
      {cfg.text}
    </span>
  )
}
