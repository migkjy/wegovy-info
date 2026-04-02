import { Metadata } from 'next'
import Link from 'next/link'
import { getAllPosts } from '@/lib/posts'
import { SITE_URL, SITE_NAME } from '@/lib/constants'
import PostCard from '@/components/PostCard'

export const metadata: Metadata = {
  title: '마운자로(Mounjaro) 완전 가이드 | 효능·부작용·가격',
  description:
    '마운자로(티르제파타이드) 비만치료제 효능, 부작용, 가격, 처방 조건을 전문적으로 안내합니다. GIP/GLP-1 이중 작용 기전 및 임상 결과 포함.',
  alternates: { canonical: `${SITE_URL}/mounjaro` },
  openGraph: {
    title: '마운자로(Mounjaro) 완전 가이드',
    description: '마운자로 효능·부작용·가격·처방 가이드',
    url: `${SITE_URL}/mounjaro`,
    type: 'website',
    locale: 'ko_KR',
    siteName: SITE_NAME,
  },
}

const drugInfoJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Drug',
  name: '마운자로 (Mounjaro)',
  alternateName: ['Tirzepatide', '티르제파타이드'],
  description:
    '마운자로는 GIP/GLP-1 이중 수용체 작용제 계열의 비만·당뇨 치료제로, 티르제파타이드를 주 1회 피하주사로 투여합니다.',
  manufacturer: {
    '@type': 'Organization',
    name: '일라이 릴리 (Eli Lilly)',
  },
  url: `${SITE_URL}/mounjaro`,
}

export default function MounjaroPage() {
  const allPosts = getAllPosts()
  const mounjaroPosts = allPosts
    .filter((p) => p.frontmatter.category === 'mounjaro')
    .slice(0, 6)
  const comparisonPosts = allPosts
    .filter((p) => p.frontmatter.category === 'comparison')
    .slice(0, 3)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(drugInfoJsonLd) }}
      />
      <div className="max-w-5xl mx-auto px-4 py-10">
        {/* 브레드크럼 */}
        <nav className="flex items-center gap-2 text-sm text-gray-400 mb-6">
          <Link href="/" className="hover:text-teal-600 transition-colors">
            홈
          </Link>
          <span>/</span>
          <span className="text-gray-600">마운자로</span>
        </nav>

        {/* 헤더 */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            마운자로(Mounjaro) 완전 가이드
          </h1>
          <p className="text-gray-600 text-lg">
            티르제파타이드 GIP/GLP-1 이중 작용제 주 1회 주사 — 효능·부작용·가격·처방 가이드
          </p>
        </header>

        {/* 핵심 정보 카드 */}
        <section className="mb-8 grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: '성분', value: '티르제파타이드' },
            { label: '투여', value: '주 1회 피하주사' },
            { label: '적응증', value: 'BMI 27+ 비만' },
            { label: '제조사', value: '일라이 릴리' },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="p-3 bg-purple-50 rounded-lg border border-purple-100 text-center"
            >
              <p className="text-xs text-purple-600 font-medium">{label}</p>
              <p className="text-sm font-bold text-gray-900 mt-1">{value}</p>
            </div>
          ))}
        </section>

        {/* 마운자로 개요 */}
        <section className="mb-8 bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">마운자로란?</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            마운자로(Mounjaro)는 일라이 릴리가 개발한 GIP/GLP-1 이중 수용체 작용제 계열의
            비만·당뇨 치료제입니다. 활성 성분인 티르제파타이드를 주 1회 피하주사로 투여하며,
            두 가지 인크레틴 호르몬 수용체에 동시 작용하여 체중 감량 효과를 냅니다.
          </p>
          <p className="text-gray-700 leading-relaxed mb-4">
            대규모 임상시험(SURMOUNT 프로그램)에서 위약 대비 평균 약 20% 수준의 체중 감량
            효과가 보고되었습니다. 현재 한국에서는 당뇨병 치료 목적으로 처방되며, 비만
            단독 적응증(젭바운드)의 국내 승인 현황을 반드시 확인하세요. 반드시 전문의의
            처방과 지도 아래 사용해야 합니다.
          </p>
          <p className="text-sm text-gray-500 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            ※ 이 정보는 의학적 조언이 아닙니다. 처방 여부는 반드시 전문의와 상담하세요.
          </p>
        </section>

        {/* 최신 포스트 */}
        {mounjaroPosts.length > 0 && (
          <section className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">마운자로 최신 포스트</h2>
              <Link
                href="/category/mounjaro"
                className="text-sm text-teal-600 hover:underline"
              >
                전체보기 →
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {mounjaroPosts.map((p) => (
                <PostCard key={p.slug} post={p} />
              ))}
            </div>
          </section>
        )}

        {/* 비교 포스트 */}
        {comparisonPosts.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              마운자로 vs 다른 약제
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {comparisonPosts.map((p) => (
                <PostCard key={p.slug} post={p} />
              ))}
            </div>
          </section>
        )}

        {/* 관련 허브 링크 */}
        <section className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">다른 비만치료제 가이드</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              href="/wegovy"
              className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 transition-colors"
            >
              <div>
                <p className="font-semibold text-gray-900">위고비(Wegovy)</p>
                <p className="text-sm text-gray-600">세마글루타이드 — 주 1회 주사</p>
              </div>
              <span className="ml-auto text-blue-600">→</span>
            </Link>
            <Link
              href="/saxenda"
              className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl hover:bg-green-100 transition-colors"
            >
              <div>
                <p className="font-semibold text-gray-900">삭센다(Saxenda)</p>
                <p className="text-sm text-gray-600">리라글루타이드 — 매일 주사</p>
              </div>
              <span className="ml-auto text-green-600">→</span>
            </Link>
          </div>
        </section>

        <div className="mt-6 text-center">
          <Link
            href="/category/mounjaro"
            className="inline-block px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-semibold"
          >
            마운자로 포스트 전체보기
          </Link>
        </div>
      </div>
    </>
  )
}
