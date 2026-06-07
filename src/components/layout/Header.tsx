'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface HeaderProps {
  currentWeekLabel: string
  weekRange: string
}

const TABS = [
  { href: '/korean', label: '🇰🇷 네이버' },
  { href: '/foreign', label: '🌍 외국인' },
  { href: '/google', label: '🔍 구글' },
]

export default function Header({ currentWeekLabel, weekRange }: HeaderProps) {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 border-b" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight">
            트렌드 센서
          </h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {currentWeekLabel} · {weekRange}
          </p>
        </div>

        <nav className="flex items-center gap-1 p-1 rounded-xl" style={{ backgroundColor: 'var(--bg-card)' }}>
          {TABS.map((tab) => {
            const isActive = pathname === tab.href
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive ? 'text-white shadow-sm' : 'hover:opacity-80'
                }`}
                style={isActive ? { backgroundColor: '#4f46e5' } : { color: 'var(--text-secondary)' }}
              >
                {tab.label}
              </Link>
            )
          })}
        </nav>
      </div>
    </header>
  )
}
