import { Metadata } from 'next'
import Link from 'next/link'
import { getNewsList } from '@/lib/db/queries'
import { SITE_URL } from '@/lib/constants'

export const metadata: Metadata = {
  title: 'GLP-1 비만치료제 뉴스 | 위고비·삭센다·마운자로 최신 소식',
  description:
    '위고비, 삭센다, 마운자로 등 GLP-1 비만치료제 관련 최신 뉴스와 임상 연구 소식을 모아봅니다.',
  alternates: { canonical: `${SITE_URL}/news` },
}

const NEWS_PER_PAGE = 20

const DRUG_TAG_COLORS: Record<string, string> = {
  wegovy: 'bg-blue-50 text-blue-700 border-blue-100',
  saxenda: 'bg-green-50 text-green-700 border-green-100',
  mounjaro: 'bg-purple-50 text-purple-700 border-purple-100',
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

function DrugTag({ tag }: { tag: string }) {
  const colorClass = DRUG_TAG_COLORS[tag.toLowerCase()] ?? 'bg-gray-50 text-gray-600 border-gray-100'
  return (
    <span className={`inline-block px-2 py-0.5 text-xs rounded-full border ${colorClass}`}>
      {tag}
    </span>
  )
}

export default async function NewsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; category?: string }>
}) {
  const { page: pageParam, category } = await searchParams
  const currentPage = Math.max(1, parseInt(pageParam ?? '1', 10) || 1)
  const offset = (currentPage - 1) * NEWS_PER_PAGE

  const { items: newsList, total } = await getNewsList(offset, NEWS_PER_PAGE, category)
  const totalPages = Math.ceil(total / NEWS_PER_PAGE)

  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">GLP-1 비만치료제 뉴스</h1>
        <p className="text-gray-600 text-sm">
          위고비, 삭센다, 마운자로 관련 최신 뉴스와 임상 연구 소식을 모아봅니다.
        </p>
      </div>

      {newsList.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <svg
            className="w-12 h-12 mx-auto mb-4 text-gray-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
            />
          </svg>
          <p className="text-lg mb-2">아직 뉴스가 없습니다.</p>
          <p className="text-sm">곧 최신 소식이 업데이트됩니다.</p>
        </div>
      ) : (
        <>
          <div className="grid gap-4">
            {newsList.map((news) => {
              const tags = news.drugTags
                ? (JSON.parse(news.drugTags) as string[])
                : []

              return (
                <Link
                  key={news.id}
                  href={`/news/${news.id}`}
                  className="block bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md hover:border-teal-300 transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h2 className="font-semibold text-gray-900 text-base leading-snug mb-2 line-clamp-2">
                        {news.title}
                      </h2>
                      {news.summary && (
                        <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                          {news.summary}
                        </p>
                      )}
                      <div className="flex items-center gap-3 text-xs text-gray-400">
                        <span>{news.source}</span>
                        <span>{formatDate(news.publishedAt)}</span>
                      </div>
                    </div>
                    {news.isFeatured && (
                      <span className="shrink-0 px-2 py-0.5 text-xs bg-amber-50 text-amber-700 rounded-full border border-amber-200">
                        주요
                      </span>
                    )}
                  </div>
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {tags.map((tag) => (
                        <DrugTag key={tag} tag={tag} />
                      ))}
                    </div>
                  )}
                </Link>
              )
            })}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              {currentPage > 1 && (
                <Link
                  href={`/news?page=${currentPage - 1}${category ? `&category=${category}` : ''}`}
                  className="px-4 py-2 text-sm bg-gray-100 text-gray-600 rounded-lg hover:bg-teal-50 hover:text-teal-700 transition-colors"
                >
                  이전
                </Link>
              )}
              <span className="text-sm text-gray-500">
                {currentPage} / {totalPages}
              </span>
              {currentPage < totalPages && (
                <Link
                  href={`/news?page=${currentPage + 1}${category ? `&category=${category}` : ''}`}
                  className="px-4 py-2 text-sm bg-gray-100 text-gray-600 rounded-lg hover:bg-teal-50 hover:text-teal-700 transition-colors"
                >
                  다음
                </Link>
              )}
            </div>
          )}
        </>
      )}
    </main>
  )
}
