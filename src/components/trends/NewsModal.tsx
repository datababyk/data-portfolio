'use client'

import { useEffect, useState } from 'react'

interface Article {
  title: string
  description: string
  link: string
  pubDate: string
  source: string
}

interface NewsModalProps {
  keyword: string
  onClose: () => void
}

export default function NewsModal({ keyword, onClose }: NewsModalProps) {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/news/${encodeURIComponent(keyword)}`)
      .then((r) => r.json())
      .then((data) => {
        setArticles(data.articles ?? [])
        setLoading(false)
      })
      .catch((err) => {
        setError(String(err))
        setLoading(false)
      })
  }, [keyword])

  // ESC 키로 닫기
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const formatDate = (pubDate: string) => {
    try {
      const d = new Date(pubDate)
      return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
    } catch {
      return pubDate
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl max-h-[80vh] flex flex-col rounded-2xl overflow-hidden"
        style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div
          className="flex items-center justify-between px-5 py-4 shrink-0"
          style={{ borderBottom: '1px solid var(--border)' }}
        >
          <div>
            <h2 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
              "{keyword}" 관련 뉴스
            </h2>
            {!loading && (
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                최근 {articles.length}건
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-lg"
            style={{ color: 'var(--text-muted)', backgroundColor: 'var(--bg-card)' }}
          >
            ×
          </button>
        </div>

        {/* 본문 */}
        <div className="overflow-y-auto flex-1 px-5 py-3">
          {loading && (
            <div className="flex flex-col gap-3 py-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 w-3/4 rounded mb-2" style={{ backgroundColor: 'var(--border)' }} />
                  <div className="h-3 w-1/3 rounded" style={{ backgroundColor: 'var(--border)' }} />
                </div>
              ))}
            </div>
          )}

          {error && (
            <p className="text-sm py-8 text-center" style={{ color: 'var(--text-muted)' }}>
              뉴스를 불러오지 못했습니다
            </p>
          )}

          {!loading && !error && articles.length === 0 && (
            <p className="text-sm py-8 text-center" style={{ color: 'var(--text-muted)' }}>
              관련 뉴스가 없습니다
            </p>
          )}

          {!loading && articles.map((article, i) => (
            <a
              key={i}
              href={article.link}
              target="_blank"
              rel="noopener noreferrer"
              className="block py-3 hover:opacity-80 transition-opacity"
              style={{ borderBottom: i < articles.length - 1 ? '1px solid var(--border)' : 'none' }}
            >
              <p className="text-sm font-medium leading-snug mb-1" style={{ color: 'var(--text-primary)' }}>
                {article.title}
              </p>
              {article.description && (
                <p className="text-xs leading-relaxed mb-1.5 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
                  {article.description}
                </p>
              )}
              <div className="flex items-center gap-2">
                {article.source && (
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {article.source}
                  </span>
                )}
                {article.source && article.pubDate && (
                  <span style={{ color: 'var(--border)' }}>·</span>
                )}
                {article.pubDate && (
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {formatDate(article.pubDate)}
                  </span>
                )}
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
