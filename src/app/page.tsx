import { getAllPosts } from '@/lib/posts';
import { CATEGORIES, SITE_NAME, POSTS_PER_PAGE } from '@/lib/constants';
import PostCard from '@/components/PostCard';
import CategoryNav from '@/components/CategoryNav';
import Pagination from '@/components/Pagination';
import Link from 'next/link';

interface HomePageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const { page: pageParam } = await searchParams;
  const currentPage = Math.max(1, parseInt(pageParam ?? '1', 10) || 1);

  const allPosts = getAllPosts();
  const totalPages = Math.ceil(allPosts.length / POSTS_PER_PAGE);
  const safePage = Math.min(currentPage, Math.max(1, totalPages));
  const startIndex = (safePage - 1) * POSTS_PER_PAGE;
  const posts = allPosts.slice(startIndex, startIndex + POSTS_PER_PAGE);

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      {/* 히어로 섹션 */}
      <section className="text-center py-12 mb-10">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          {SITE_NAME}
        </h1>
        <p className="text-lg text-gray-500 max-w-2xl mx-auto mb-6">
          위고비, 삭센다, 마운자로 등 GLP-1 비만치료제 정보를 객관적으로 제공합니다.
        </p>
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700">
          <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          이 사이트는 정보 제공 목적이며, 의학적 조언이 아닙니다. 반드시 전문의와 상담하세요.
        </div>
      </section>

      {/* 카테고리 카드 */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-gray-900 mb-5">카테고리별 정보</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              href={`/category/${cat.slug}`}
              className="group bg-white rounded-xl border border-gray-200 p-4 hover:border-teal-300 hover:shadow-md transition-all"
            >
              <h3 className="font-semibold text-gray-900 group-hover:text-teal-700 mb-1 transition-colors">
                {cat.name}
              </h3>
              <p className="text-xs text-gray-400 line-clamp-2">{cat.description}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* 최신 글 */}
      <section>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-gray-900">최신 글</h2>
        </div>
        <CategoryNav />
        {allPosts.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-lg mb-2">아직 등록된 글이 없습니다.</p>
            <p className="text-sm">곧 유용한 정보가 업데이트됩니다.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {posts.map((post) => (
                <PostCard key={post.slug} post={post} />
              ))}
            </div>
            {totalPages > 1 && (
              <Pagination
                currentPage={safePage}
                totalPages={totalPages}
                basePath="/"
              />
            )}
          </>
        )}
      </section>
    </div>
  );
}
