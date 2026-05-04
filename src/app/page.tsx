import { getAllPosts } from '@/lib/posts';
import { CATEGORIES, SITE_NAME, POSTS_PER_PAGE } from '@/lib/constants';
import { getLatestNews } from '@/lib/db/queries';
import PostCard from '@/components/PostCard';
import FeaturedPost from '@/components/FeaturedPost';
import CategoryNav from '@/components/CategoryNav';
import Pagination from '@/components/Pagination';
import NewsletterSignup from '@/components/NewsletterSignup';
import DrugSections from '@/components/DrugSections';
import PopularTags from '@/components/PopularTags';
import Link from 'next/link';

interface PageProps {
  searchParams: Promise<{ page?: string }>;
}

function formatNewsDate(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleDateString('ko-KR', {
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export default async function HomePage({ searchParams }: PageProps) {
  const { page: pageParam } = await searchParams;
  const currentPage = Math.max(1, parseInt(pageParam ?? '1', 10) || 1);

  const [allPosts, latestNews] = await Promise.all([
    Promise.resolve(getAllPosts()),
    getLatestNews(3),
  ]);
  const featuredPost = allPosts[0];
  const remainingPosts = allPosts.slice(1);

  const totalPages = Math.ceil(remainingPosts.length / POSTS_PER_PAGE);
  const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
  const pagePosts = remainingPosts.slice(startIndex, startIndex + POSTS_PER_PAGE);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="sr-only">GLP-1 비만치료제 정보 — 위고비, 삭센다, 마운자로 가이드</h1>

      {/* Featured Post Hero */}
      {currentPage === 1 && featuredPost && (
        <section className="mb-10">
          <FeaturedPost post={featuredPost} />
        </section>
      )}

      {/* Category Cards */}
      {currentPage === 1 && (
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">카테고리</h2>
          </div>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.slug}
                href={`/category/${cat.slug}`}
                className="group flex flex-col items-center gap-1 p-3 bg-white rounded-xl border border-gray-200 hover:border-teal-300 hover:shadow-sm transition-all text-center"
              >
                <span className="text-xs font-semibold text-gray-700 group-hover:text-teal-700 transition-colors">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Newsletter Signup */}
      {currentPage === 1 && <NewsletterSignup />}

      {/* Drug-Specific Sections */}
      {currentPage === 1 && <DrugSections />}

      {/* Popular Tags */}
      {currentPage === 1 && <PopularTags />}

      {/* Latest News from DB */}
      {currentPage === 1 && latestNews.length > 0 && (
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">최신 뉴스</h2>
            <Link
              href="/news"
              className="text-sm text-teal-600 hover:text-teal-800 transition-colors"
            >
              전체보기 →
            </Link>
          </div>
          <div className="grid gap-3">
            {latestNews.map((news) => (
              <Link
                key={news.id}
                href={`/news/${news.id}`}
                className="flex items-start gap-4 bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md hover:border-teal-300 transition-all"
              >
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 text-sm leading-snug mb-1 line-clamp-2">
                    {news.title}
                  </h3>
                  {news.summary && (
                    <p className="text-xs text-gray-500 line-clamp-1">{news.summary}</p>
                  )}
                </div>
                <div className="shrink-0 text-xs text-gray-400 whitespace-nowrap">
                  <span>{news.source}</span>
                  <span className="mx-1">·</span>
                  <span>{formatNewsDate(news.publishedAt)}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Clinic Shortcut */}
      {currentPage === 1 && (
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">병원 찾기</h2>
            <Link
              href="/clinics"
              className="text-sm text-teal-600 hover:text-teal-800 transition-colors"
            >
              전체보기 →
            </Link>
          </div>
          <Link
            href="/clinics"
            className="block bg-gradient-to-r from-teal-50 to-blue-50 border border-teal-200 rounded-xl p-6 hover:shadow-md transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center shrink-0">
                <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  GLP-1 비만치료제 처방 병원 찾기
                </h3>
                <p className="text-sm text-gray-600">
                  지역별 위고비·삭센다·마운자로 처방 병원과 참고 가격을 확인하세요
                </p>
              </div>
            </div>
          </Link>
        </section>
      )}

      {/* Latest Posts */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">
            {currentPage === 1 ? '최신 글' : `최신 글 — ${currentPage}페이지`}
          </h2>
        </div>
        <CategoryNav />

        {pagePosts.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-lg mb-2">아직 등록된 글이 없습니다.</p>
            <p className="text-sm">곧 유용한 정보가 업데이트됩니다.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pagePosts.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <Pagination currentPage={currentPage} totalPages={totalPages} basePath="/" />
        )}
      </section>
    </div>
  );
}
