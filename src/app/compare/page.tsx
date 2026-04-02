import { Metadata } from 'next'
import Link from 'next/link'
import { getAllPosts } from '@/lib/posts'
import { SITE_URL, SITE_NAME, DISCLAIMER } from '@/lib/constants'
import PostCard from '@/components/PostCard'

export const metadata: Metadata = {
  title: 'GLP-1 비만치료제 비교: 위고비 vs 삭센다 vs 마운자로',
  description:
    '위고비(세마글루타이드), 삭센다(리라글루타이드), 마운자로(티르제파타이드) 3가지 GLP-1 비만치료제를 효능·부작용·가격·투여 방법 기준으로 비교합니다.',
  alternates: { canonical: `${SITE_URL}/compare` },
  openGraph: {
    title: 'GLP-1 비만치료제 비교: 위고비 vs 삭센다 vs 마운자로',
    description: '위고비, 삭센다, 마운자로 비교표 — 효능, 부작용, 가격, 투여 방법',
    url: `${SITE_URL}/compare`,
    type: 'website',
    locale: 'ko_KR',
    siteName: SITE_NAME,
  },
}

const webPageJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'GLP-1 비만치료제 비교: 위고비 vs 삭센다 vs 마운자로',
  description:
    '위고비(세마글루타이드), 삭센다(리라글루타이드), 마운자로(티르제파타이드) 3가지 GLP-1 비만치료제를 효능·부작용·가격·투여 방법 기준으로 비교합니다.',
  url: `${SITE_URL}/compare`,
  inLanguage: 'ko',
  publisher: {
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
  },
}

const COMPARISON = [
  {
    drug: '위고비 (Wegovy)',
    ingredient: '세마글루타이드',
    manufacturer: '노보 노디스크',
    injection: '주 1회',
    maxDose: '2.4mg',
    weightLoss: '15-17%',
    approval: 'FDA 2021 / 한국 2023',
    indicationBmi: 'BMI ≥30 또는 BMI ≥27 + 동반질환',
    monthlyPrice: '약 50-70만원',
    cvBenefit: 'SELECT 임상: 심혈관 사망 20% 감소',
    color: 'blue',
    href: '/wegovy',
    categoryHref: '/category/wegovy',
  },
  {
    drug: '삭센다 (Saxenda)',
    ingredient: '리라글루타이드',
    manufacturer: '노보 노디스크',
    injection: '매일 1회',
    maxDose: '3.0mg',
    weightLoss: '8-10%',
    approval: 'FDA 2014 / 한국 2017',
    indicationBmi: 'BMI ≥30 또는 BMI ≥27 + 동반질환',
    monthlyPrice: '약 35-50만원',
    cvBenefit: '제한적 (LEADER 연구: 당뇨 환자)',
    color: 'green',
    href: '/saxenda',
    categoryHref: '/category/saxenda',
  },
  {
    drug: '마운자로 (Mounjaro)',
    ingredient: '티르제파타이드',
    manufacturer: '일라이 릴리',
    injection: '주 1회',
    maxDose: '15mg',
    weightLoss: '20-22%',
    approval: 'FDA 2022 (당뇨) / 비만 2023',
    indicationBmi: 'BMI ≥30 또는 BMI ≥27 + 동반질환',
    monthlyPrice: '약 70-90만원',
    cvBenefit: 'SURMOUNT-MMO 진행 중',
    color: 'purple',
    href: '/mounjaro',
    categoryHref: '/category/mounjaro',
  },
] as const

type ColorKey = 'blue' | 'green' | 'purple'

const colorMap: Record<ColorKey, { bg: string; border: string; badge: string; btn: string; text: string }> = {
  blue: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    badge: 'bg-blue-100 text-blue-800',
    btn: 'bg-blue-600 hover:bg-blue-700',
    text: 'text-blue-700',
  },
  green: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    badge: 'bg-green-100 text-green-800',
    btn: 'bg-green-600 hover:bg-green-700',
    text: 'text-green-700',
  },
  purple: {
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    badge: 'bg-purple-100 text-purple-800',
    btn: 'bg-purple-600 hover:bg-purple-700',
    text: 'text-purple-700',
  },
}

const tableRows: { label: string; key: keyof (typeof COMPARISON)[0] }[] = [
  { label: '주성분', key: 'ingredient' },
  { label: '제조사', key: 'manufacturer' },
  { label: '투여 빈도', key: 'injection' },
  { label: '최대 용량', key: 'maxDose' },
  { label: '평균 체중 감량', key: 'weightLoss' },
  { label: '허가 일정', key: 'approval' },
  { label: '처방 기준 (BMI)', key: 'indicationBmi' },
  { label: '월 예상 비용', key: 'monthlyPrice' },
  { label: '심혈관 혜택', key: 'cvBenefit' },
]

const SELECTION_GUIDE = [
  {
    goal: '최고 체중 감량 효과를 원한다면',
    drug: '마운자로',
    reason: '임상에서 평균 20-22% 체중 감량 — 세 약제 중 최고 효과',
    color: 'purple' as ColorKey,
    href: '/mounjaro',
  },
  {
    goal: '국내 임상 데이터가 풍부한 약을 원한다면',
    drug: '위고비',
    reason: 'STEP 대규모 임상 + 한국 포함 글로벌 연구, SELECT 심혈관 연구',
    color: 'blue' as ColorKey,
    href: '/wegovy',
  },
  {
    goal: '가장 저렴한 선택지를 원한다면',
    drug: '삭센다',
    reason: '세 약제 중 월 비용 기준 최저 — 약 35-50만원 수준',
    color: 'green' as ColorKey,
    href: '/saxenda',
  },
  {
    goal: '매일 주사가 오히려 편하다면',
    drug: '삭센다',
    reason: '매일 일정한 시간에 투여 — 규칙적인 루틴을 선호하는 환자에게 적합',
    color: 'green' as ColorKey,
    href: '/saxenda',
  },
]

export default function ComparePage() {
  const allPosts = getAllPosts()
  const comparisonPosts = allPosts
    .filter((p) => p.frontmatter.category === 'comparison')
    .slice(0, 3)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }}
      />
      <div className="max-w-5xl mx-auto px-4 py-10">
        {/* 브레드크럼 */}
        <nav className="flex items-center gap-2 text-sm text-gray-400 mb-6">
          <Link href="/" className="hover:text-teal-600 transition-colors">
            홈
          </Link>
          <span>/</span>
          <span className="text-gray-600">비만치료제 비교</span>
        </nav>

        {/* 헤더 */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            GLP-1 비만치료제 비교
          </h1>
          <p className="text-gray-600 text-lg leading-relaxed">
            위고비, 삭센다, 마운자로는 모두 GLP-1 계열 비만치료제이지만 성분·효능·가격이
            다릅니다. 임상 데이터를 바탕으로 세 약제의 핵심 지표를 객관적으로 비교합니다.
            처방 결정은 반드시 전문의와 상담하세요.
          </p>
        </header>

        {/* 요약 카드 3개 */}
        <section className="mb-10 grid grid-cols-1 md:grid-cols-3 gap-5">
          {COMPARISON.map((drug) => {
            const c = colorMap[drug.color]
            return (
              <div
                key={drug.drug}
                className={`rounded-xl border ${c.border} ${c.bg} p-5 flex flex-col gap-3`}
              >
                <div className="flex items-center justify-between">
                  <h2 className="font-bold text-gray-900 text-lg">{drug.drug}</h2>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${c.badge}`}>
                    {drug.ingredient}
                  </span>
                </div>
                <dl className="flex flex-col gap-1 text-sm text-gray-700">
                  <div className="flex justify-between">
                    <dt className="text-gray-500">투여</dt>
                    <dd className="font-medium">{drug.injection}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500">체중 감량</dt>
                    <dd className={`font-bold ${c.text}`}>{drug.weightLoss}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500">월 비용</dt>
                    <dd className="font-medium">{drug.monthlyPrice}</dd>
                  </div>
                </dl>
                <div className="mt-auto flex gap-2 pt-2">
                  <Link
                    href={drug.href}
                    className={`flex-1 text-center text-sm text-white font-semibold py-2 rounded-lg ${c.btn} transition-colors`}
                  >
                    자세히 보기
                  </Link>
                  <Link
                    href={drug.categoryHref}
                    className="flex-1 text-center text-sm text-gray-600 border border-gray-300 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    관련 포스트
                  </Link>
                </div>
              </div>
            )
          })}
        </section>

        {/* 비교 테이블 */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-gray-900 mb-4">상세 비교표</h2>
          <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 w-32">
                    항목
                  </th>
                  {COMPARISON.map((drug) => {
                    const c = colorMap[drug.color]
                    return (
                      <th
                        key={drug.drug}
                        className={`text-center px-4 py-3 font-bold ${c.text}`}
                      >
                        {drug.drug}
                      </th>
                    )
                  })}
                </tr>
              </thead>
              <tbody>
                {tableRows.map(({ label, key }, idx) => (
                  <tr
                    key={key}
                    className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                  >
                    <td className="px-4 py-3 font-medium text-gray-600 whitespace-nowrap">
                      {label}
                    </td>
                    {COMPARISON.map((drug) => (
                      <td
                        key={drug.drug}
                        className={`px-4 py-3 text-center text-gray-800 ${
                          key === 'weightLoss'
                            ? `font-bold ${colorMap[drug.color].text}`
                            : ''
                        }`}
                      >
                        {String(drug[key])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-xs text-gray-400">
            * 가격은 국내 처방 기준 추정치이며, 의원/병원별로 상이할 수 있습니다.
          </p>
        </section>

        {/* 어떤 약이 나에게 맞을까 */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            어떤 약이 나에게 맞을까?
          </h2>
          <p className="text-gray-600 mb-5 text-sm">
            아래 가이드는 임상 데이터 기반의 일반적 경향이며, 최종 처방 결정은 반드시 전문의와
            상담 후 이루어져야 합니다.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {SELECTION_GUIDE.map((item) => {
              const c = colorMap[item.color]
              return (
                <div
                  key={item.goal}
                  className={`p-4 rounded-xl border ${c.border} ${c.bg}`}
                >
                  <p className="text-sm text-gray-500 mb-1">{item.goal}</p>
                  <Link
                    href={item.href}
                    className={`text-base font-bold ${c.text} hover:underline`}
                  >
                    → {item.drug}
                  </Link>
                  <p className="text-sm text-gray-600 mt-1">{item.reason}</p>
                </div>
              )
            })}
          </div>
        </section>

        {/* 비교 포스트 */}
        {comparisonPosts.length > 0 && (
          <section className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">비교분석 포스트</h2>
              <Link
                href="/category/comparison"
                className="text-sm text-teal-600 hover:underline"
              >
                전체보기 →
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {comparisonPosts.map((p) => (
                <PostCard key={p.slug} post={p} />
              ))}
            </div>
          </section>
        )}

        {/* 개별 허브 링크 */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-gray-900 mb-4">각 약제 상세 가이드</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {COMPARISON.map((drug) => {
              const c = colorMap[drug.color]
              return (
                <Link
                  key={drug.drug}
                  href={drug.href}
                  className={`flex items-center gap-3 p-4 ${c.bg} border ${c.border} rounded-xl hover:opacity-80 transition-opacity`}
                >
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{drug.drug}</p>
                    <p className="text-sm text-gray-600">{drug.ingredient} — {drug.injection}</p>
                  </div>
                  <span className={`text-lg ${c.text}`}>→</span>
                </Link>
              )
            })}
          </div>
        </section>

        {/* 면책조항 */}
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-gray-600">
          ※ {DISCLAIMER}
        </div>
      </div>
    </>
  )
}
