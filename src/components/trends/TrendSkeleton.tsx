export default function TrendSkeleton() {
  return (
    <div
      className="rounded-xl p-4 flex flex-col gap-3 animate-pulse"
      style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <div className="h-4 w-24 rounded" style={{ backgroundColor: 'var(--border)' }} />
          <div className="flex items-center gap-2 mt-2">
            <div className="h-5 w-12 rounded-full" style={{ backgroundColor: 'var(--border)' }} />
            <div className="h-4 w-8 rounded" style={{ backgroundColor: 'var(--border)' }} />
          </div>
        </div>
        <div className="h-8 w-12 rounded" style={{ backgroundColor: 'var(--border)' }} />
      </div>
      <div className="h-10 rounded" style={{ backgroundColor: 'var(--border)' }} />
    </div>
  )
}
