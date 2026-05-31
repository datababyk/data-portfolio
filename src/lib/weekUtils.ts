export function toISOWeek(date: Date): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`
}

export function weekStart(isoWeek: string): Date {
  const [year, weekPart] = isoWeek.split('-W')
  const week = parseInt(weekPart, 10)
  const jan4 = new Date(Date.UTC(parseInt(year, 10), 0, 4))
  const dayOfWeek = jan4.getUTCDay() || 7
  const monday = new Date(jan4)
  monday.setUTCDate(jan4.getUTCDate() - dayOfWeek + 1 + (week - 1) * 7)
  return monday
}

export function weekEnd(isoWeek: string): Date {
  const start = weekStart(isoWeek)
  const end = new Date(start)
  end.setUTCDate(start.getUTCDate() + 6)
  return end
}

export function prevWeek(isoWeek: string): string {
  const start = weekStart(isoWeek)
  const prev = new Date(start)
  prev.setUTCDate(start.getUTCDate() - 7)
  return toISOWeek(prev)
}

export function nextWeek(isoWeek: string): string {
  const start = weekStart(isoWeek)
  const next = new Date(start)
  next.setUTCDate(start.getUTCDate() + 7)
  return toISOWeek(next)
}

export function currentWeek(): string {
  return toISOWeek(new Date())
}

export function formatDateYYYYMMDD(date: Date): string {
  return date.toISOString().slice(0, 10)
}

export function formatWeekKorean(isoWeek: string): string {
  const [year, weekPart] = isoWeek.split('-W')
  return `${year}년 ${parseInt(weekPart, 10)}주차`
}

export function formatWeekRange(isoWeek: string): string {
  const start = weekStart(isoWeek)
  const end = weekEnd(isoWeek)
  const fmt = (d: Date) =>
    `${d.getUTCMonth() + 1}/${d.getUTCDate()}`
  return `${fmt(start)} ~ ${fmt(end)}`
}
