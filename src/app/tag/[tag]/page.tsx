import { Metadata } from 'next';
import { getAllTags, getPostsByTag } from '@/lib/posts';
import { SITE_NAME, SITE_URL, POSTS_PER_PAGE } from '@/lib/constants';
import PostCard from '@/components/PostCard';
import Pagination from '@/components/Pagination';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface PageProps {
  params: Promise<{ tag: string }>;
  searchParams: Promise<{ page?: string }>;
}

export async function generateStaticParams() {
  const tags = getAllTags();
  return tags.map((tag) => ({ tag }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { tag } = await params;
  const decodedTag = decodeURIComponent(tag);
  const allPosts = getPostsByTag(decodedTag);
  if (allPosts.length === 0) return {};

  const url = `${SITE_URL}/tag/${tag}`;

  return {
    title: `#${decodedTag} 태그 글 모음`,
    description: `${decodedTag} 태그가 포함된 GLP-1 비만치료제 관련 글 ${allPosts.length}편`,
    alternates: { canonical: url },
    openGraph: {
      type: 'website',
      url,
      title: `#${decodedTag} 태그 글 모음 | ${SITE_NAME}`,
      description: `${decodedTag} 태그가 포함된 GLP-1 비만치료제 관련 글 ${allPosts.length}편`,
      locale: 'ko_KR',
      siteName: SITE_NAME,
    },
  };
}

export default async function TagPage({ params, searchParams }: PageProps) {
  const { tag } = await params;
  const { page: pageParam } = await searchParams;
  const decodedTag = decodeURIComponent(tag);

  const allPosts = getPostsByTag(decodedTag);
  if (allPosts.length === 0) notFound();

  const currentPage = Math.max(1, parseInt(pageParam ?? '1', 10) || 1);
  const totalPages = Math.ceil(allPosts.length / POSTS_PER_PAGE);
  const safePage = Math.min(currentPage, Math.max(1, totalPages));
  const startIndex = (safePage - 1) * POSTS_PER_PAGE;
  const posts = allPosts.slice(startIndex, startIndex + POSTS_PER_PAGE);

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: '홈', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: '태그', item: `${SITE_URL}/tag` },
      { '@type': 'ListItem', position: 3, name: decodedTag, item: `${SITE_URL}/tag/${tag}` },
    ],
  };

  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `#${decodedTag} 관련 포스트`,
    numberOfItems: allPosts.length,
    itemListElement: allPosts.slice(0, 20).map((post, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `${SITE_URL}/${post.slug}`,
      name: post.frontmatter.title,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
      <div className="max-w-5xl mx-auto px-4 py-10">
        {/* 브레드크럼 */}
        <nav className="flex items-center gap-2 text-sm text-gray-400 mb-6">
          <Link href="/" className="hover:text-teal-600 transition-colors">홈</Link>
          <span>/</span>
          <span className="text-gray-600">#{decodedTag}</span>
        </nav>

        <header className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            #{decodedTag}
          </h1>
          <p className="text-gray-500">
            태그가 포함된 글 {allPosts.length}편
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {posts.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>

        {totalPages > 1 && (
          <Pagination
            currentPage={safePage}
            totalPages={totalPages}
            basePath={`/tag/${tag}`}
          />
        )}
      </div>
    </>
  );
}
