import { getAllPosts } from '@/lib/posts';
import { CATEGORIES, SITE_NAME, POSTS_PER_PAGE } from '@/lib/constants';
import PostCard from '@/components/PostCard';
import FeaturedPost from '@/components/FeaturedPost';
import CategoryNav from '@/components/CategoryNav';
import Pagination from '@/components/Pagination';
import NewsletterSignup from '@/components/NewsletterSignup';
import Link from 'next/link';

interface PageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function HomePage({ searchParams }: PageProps) {
  const { page: pageParam } = await searchParams;
  const currentPage = Math.max(1, parseInt(pageParam ?? '1', 10) || 1);

  const allPosts = getAllPosts();
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
