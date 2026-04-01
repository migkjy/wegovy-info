import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { getAllPosts, getAllPostSlugs, getPostBySlug, getReadingTime } from '@/lib/posts';
import RelatedPosts from '@/components/RelatedPosts';
import ShareButtons from '@/components/ShareButtons';
import TableOfContents from '@/components/TableOfContents';
import { CATEGORIES, DISCLAIMER, SITE_NAME, SITE_URL } from '@/lib/constants';
import Link from 'next/link';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = getAllPostSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};

  const { frontmatter } = post;
  const url = `${SITE_URL}/${slug}`;

  return {
    title: frontmatter.title,
    description: frontmatter.description,
    alternates: { canonical: url },
    openGraph: {
      type: 'article',
      url,
      title: frontmatter.title,
      description: frontmatter.description,
      publishedTime: frontmatter.date,
      locale: 'ko_KR',
      siteName: SITE_NAME,
    },
    twitter: {
      card: 'summary_large_image',
      title: frontmatter.title,
      description: frontmatter.description,
    },
  };
}

export default async function PostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const { frontmatter, content } = post;
  const allPosts = getAllPosts();
  const readingTime = getReadingTime(content);
  const category = CATEGORIES.find((c) => c.slug === frontmatter.category);
  const formattedDate = new Date(frontmatter.date).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: '홈', item: SITE_URL },
      ...(category
        ? [{ '@type': 'ListItem', position: 2, name: category.name, item: `${SITE_URL}/category/${category.slug}` }]
        : []),
      { '@type': 'ListItem', position: category ? 3 : 2, name: frontmatter.title },
    ],
  };

  const blogPostingJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: frontmatter.title,
    description: frontmatter.description,
    datePublished: frontmatter.date,
    author: {
      '@type': 'Person',
      name: frontmatter.author,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
    },
    url: `${SITE_URL}/${slug}`,
    ...(frontmatter.image ? { image: frontmatter.image } : {}),
    inLanguage: 'ko-KR',
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogPostingJsonLd) }}
      />
      <div className="max-w-5xl mx-auto px-4 py-10">
        {/* 브레드크럼 */}
        <nav className="flex items-center gap-2 text-sm text-gray-400 mb-6">
          <Link href="/" className="hover:text-teal-600 transition-colors">홈</Link>
          <span>/</span>
          {category && (
            <>
              <Link href={`/category/${category.slug}`} className="hover:text-teal-600 transition-colors">
                {category.name}
              </Link>
              <span>/</span>
            </>
          )}
          <span className="text-gray-600 truncate">{frontmatter.title}</span>
        </nav>

        {/* 면책조항 배너 */}
        <div className="flex items-start gap-2 px-4 py-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700 mb-8">
          <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span>{DISCLAIMER}</span>
        </div>

        {/* 포스트 헤더 */}
        <header className="mb-8">
          {category && (
            <Link
              href={`/category/${category.slug}`}
              className="inline-block px-3 py-1 text-xs font-medium text-teal-700 bg-teal-50 rounded-full mb-4 hover:bg-teal-100 transition-colors"
            >
              {category.name}
            </Link>
          )}
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 leading-snug">
            {frontmatter.title}
          </h1>
          <p className="text-gray-500 text-base mb-4">{frontmatter.description}</p>
          <div className="flex items-center gap-3 text-sm text-gray-400 pb-6 border-b border-gray-200">
            <span>{frontmatter.author}</span>
            <span>·</span>
            <time dateTime={frontmatter.date}>{formattedDate}</time>
            <span>·</span>
            <span>{readingTime}분 읽기</span>
          </div>
        </header>

        {/* 모바일 TOC */}
        <TableOfContents />

        {/* 본문 + 데스크탑 TOC 사이드바 */}
        <div className="lg:grid lg:grid-cols-[1fr_200px] lg:gap-8">
          <div>
            {/* 포스트 본문 */}
            <article className="prose prose-gray max-w-none prose-headings:font-bold prose-a:text-teal-600 prose-a:no-underline hover:prose-a:underline">
              <MDXRemote source={content} />
            </article>

            {/* 태그 */}
            {frontmatter.tags && frontmatter.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t border-gray-200">
                {frontmatter.tags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/tag/${encodeURIComponent(tag)}`}
                    className="px-3 py-1 text-xs text-gray-500 bg-gray-100 rounded-full hover:bg-teal-50 hover:text-teal-700 transition-colors"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            )}

            {/* 하단 면책조항 */}
            <div className="mt-10 p-5 bg-gray-50 border border-gray-200 rounded-xl">
              <p className="text-xs text-gray-500 leading-relaxed">
                <strong className="text-gray-700">면책조항:</strong> {DISCLAIMER} 이 글에 포함된 정보는 일반적인 교육 목적으로만 제공되며, 개인의 의료 상황에 따라 다를 수 있습니다.
              </p>
            </div>
          </div>

          {/* 데스크탑 TOC 사이드바 */}
          <TableOfContents />
        </div>

        {/* 소셜 공유 */}
        <ShareButtons
          title={frontmatter.title}
          description={frontmatter.description}
          url={`${SITE_URL}/${slug}`}
        />

        {/* 관련 글 */}
        <RelatedPosts
          currentSlug={slug}
          currentCategory={frontmatter.category}
          currentTags={frontmatter.tags ?? []}
          allPosts={allPosts}
        />
      </div>
    </>
  );
}
