import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getNewsById } from '@/lib/db/queries'
import { SITE_URL } from '@/lib/constants'

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const news = await getNewsById(id)
  if (!news) return {}
  return {
    title: `${news.title} | GLP-1 뉴스`,
    description: news.summary ?? `${news.title} — ${news.source}`,
    alternates: { canonical: `${SITE_URL}/news/${id}` },
  }
}

function formatDate(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  } catch {
    return dateStr
  }
}

const DRUG_TAG_COLORS: Record<string, string> = {
  wegovy: 'bg-blue-50 text-blue-700 border-blue-100',
  saxenda: 'bg-green-50 text-green-700 border-green-100',
  mounjaro: 'bg-purple-50 text-purple-700 border-purple-100',
}

export default async function NewsDetailPage({ params }: Props) {
  const { id } = await params
  const news = await getNewsById(id)
  if (!news) notFound()

  const tags: string[] = news.drugTags
    ? (JSON.parse(news.drugTags) as string[])
    : []

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: news.title,
    datePublished: news.publishedAt,
    publisher: {
      '@type': 'Organization',
      name: news.source,
    },
    description: news.summary ?? news.title,
    url: news.url,
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="max-w-3xl mx-auto px-4 py-8">
        <nav className="text-sm text-gray-500 mb-6">
          <Link href="/news" className="hover:text-teal-700 transition-colors">
            뉴스
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-700 line-clamp-1">{news.title}</span>
        </nav>

        <article className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="bg-teal-600 px-6 py-5">
            {news.category && (
              <span className="inline-block px-2 py-0.5 text-xs bg-white/20 text-white rounded-full mb-2">
                {news.category}
              </span>
            )}
            <h1 className="text-xl font-bold text-white leading-snug">{news.title}</h1>
          </div>

          <div className="p-6 space-y-5">
            <div className="flex items-center gap-3 text-sm text-gray-500">
              <span className="font-medium text-gray-700">{news.source}</span>
              <span>{formatDate(news.publishedAt)}</span>
              {news.isFeatured && (
                <span className="px-2 py-0.5 text-xs bg-amber-50 text-amber-700 rounded-full border border-amber-200">
                  주요 뉴스
                </span>
              )}
            </div>

            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {tags.map((tag) => {
                  const colorClass =
                    DRUG_TAG_COLORS[tag.toLowerCase()] ?? 'bg-gray-50 text-gray-600 border-gray-100'
                  return (
                    <span
                      key={tag}
                      className={`inline-block px-2.5 py-0.5 text-xs rounded-full border ${colorClass}`}
                    >
                      {tag}
                    </span>
                  )
                })}
              </div>
            )}

            {news.summary && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h2 className="text-sm font-semibold text-gray-600 mb-2">요약</h2>
                <p className="text-sm text-gray-700 leading-relaxed">{news.summary}</p>
              </div>
            )}

            <div className="pt-4 border-t border-gray-100">
              <a
                href={news.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700 transition-colors"
              >
                원문 보기
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </a>
            </div>
          </div>
        </article>

        <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-500">
          이 뉴스는 외부 매체의 보도를 자동 수집한 것으로, 본 사이트의 의견과 다를 수 있습니다.
          정확한 내용은 원문을 확인하세요.
        </div>

        <div className="mt-6 text-center">
          <Link
            href="/news"
            className="inline-flex items-center gap-1 text-sm text-teal-700 hover:underline"
          >
            ← 뉴스 목록으로 돌아가기
          </Link>
        </div>
      </main>
    </>
  )
}
