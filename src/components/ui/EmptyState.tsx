export default function EmptyState({ view }: { view: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-32 text-center">
      <div className="text-5xl mb-4">📡</div>
      <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
        아직 수집된 데이터가 없습니다
      </h3>
      <p className="text-sm max-w-sm" style={{ color: 'var(--text-secondary)' }}>
        {view === 'korean'
          ? '한국인 트렌드 데이터를 수집하려면 먼저 seed 스크립트를 실행하세요.'
          : '외국인 트렌드 데이터를 수집하려면 먼저 seed 스크립트를 실행하세요.'}
      </p>
      <code
        className="mt-4 px-4 py-2 rounded-lg text-xs font-mono"
        style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-muted)' }}
      >
        npm run seed
      </code>
    </div>
  )
}
