import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getPostsByCategory } from '@/lib/posts';
import { CATEGORIES, SITE_NAME, SITE_URL, POSTS_PER_PAGE } from '@/lib/constants';
import PostCard from '@/components/PostCard';
import CategoryNav from '@/components/CategoryNav';
import Pagination from '@/components/Pagination';
import Link from 'next/link';

interface PageProps {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ page?: string }>;
}

export async function generateStaticParams() {
  return CATEGORIES.map((cat) => ({ category: cat.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category } = await params;
  const cat = CATEGORIES.find((c) => c.slug === category);
  if (!cat) return {};

  const url = `${SITE_URL}/category/${category}`;

  return {
    title: `${cat.name} - 비만치료제 정보 | ${SITE_NAME}`,
    description: cat.description,
    alternates: { canonical: url },
    openGraph: {
      type: 'website',
      url,
      title: `${cat.name} 정보 | ${SITE_NAME}`,
      description: cat.description,
      locale: 'ko_KR',
      siteName: SITE_NAME,
    },
  };
}

export default async function CategoryPage({ params, searchParams }: PageProps) {
  const { category } = await params;
  const { page: pageParam } = await searchParams;

  const cat = CATEGORIES.find((c) => c.slug === category);
  if (!cat) notFound();

  const currentPage = Math.max(1, parseInt(pageParam ?? '1', 10) || 1);

  const allPosts = getPostsByCategory(category);
  const totalPages = Math.ceil(allPosts.length / POSTS_PER_PAGE);
  const safePage = Math.min(currentPage, Math.max(1, totalPages));
  const startIndex = (safePage - 1) * POSTS_PER_PAGE;
  const posts = allPosts.slice(startIndex, startIndex + POSTS_PER_PAGE);

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: '홈', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: cat.name },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
    <div className="max-w-5xl mx-auto px-4 py-10">
      {/* 브레드크럼 */}
      <nav className="flex items-center gap-2 text-sm text-gray-400 mb-6">
        <Link href="/" className="hover:text-teal-600 transition-colors">홈</Link>
        <span>/</span>
        <span className="text-gray-600">{cat.name}</span>
      </nav>

      <header className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{cat.name}</h1>
        <p className="text-gray-500">{cat.description}</p>
      </header>

      <CategoryNav activeCategory={category} />

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
              basePath={`/category/${category}`}
            />
          )}
        </>
      )}
    </div>
    </>
  );
}
