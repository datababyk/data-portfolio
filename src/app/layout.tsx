import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '트렌드 센서',
  description: '한국 검색 트렌드를 주간 단위로 감지합니다. 급상승 트렌드와 잊혀지는 트렌드를 한눈에.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
        {children}
      </body>
    </html>
  )
}
