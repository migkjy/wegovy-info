import { ImageResponse } from 'next/og';
import { getPostBySlug, getAllPostSlugs } from '@/lib/posts';
import { CATEGORIES, SITE_NAME } from '@/lib/constants';

export const alt = '포스트 미리보기 이미지';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export function generateStaticParams() {
  const slugs = getAllPostSlugs();
  return slugs.map((slug) => ({ slug }));
}

export default async function OgImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f0fdfa',
            color: '#0f766e',
            fontSize: 48,
            fontWeight: 700,
          }}
        >
          {SITE_NAME}
        </div>
      ),
      { ...size }
    );
  }

  const { frontmatter } = post;
  const category = CATEGORIES.find((c) => c.slug === frontmatter.category);
  const categoryName = category ? category.name : '';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#f0fdfa',
          padding: 60,
          position: 'relative',
        }}
      >
        {/* Top accent bar */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 8,
            background: 'linear-gradient(to right, #0d9488, #10b981)',
            display: 'flex',
          }}
        />

        {/* Category badge */}
        {categoryName && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: 24,
            }}
          >
            <div
              style={{
                display: 'flex',
                padding: '8px 20px',
                backgroundColor: '#ccfbf1',
                color: '#0f766e',
                borderRadius: 9999,
                fontSize: 24,
                fontWeight: 600,
              }}
            >
              {categoryName}
            </div>
          </div>
        )}

        {/* Title */}
        <div
          style={{
            display: 'flex',
            flex: 1,
            alignItems: 'center',
          }}
        >
          <div
            style={{
              fontSize: 52,
              fontWeight: 700,
              color: '#111827',
              lineHeight: 1.3,
              wordBreak: 'break-word',
              display: 'flex',
            }}
          >
            {frontmatter.title.length > 60
              ? `${frontmatter.title.slice(0, 60)}...`
              : frontmatter.title}
          </div>
        </div>

        {/* Bottom: site name */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTop: '2px solid #d1fae5',
            paddingTop: 24,
          }}
        >
          <div
            style={{
              fontSize: 28,
              fontWeight: 600,
              color: '#0d9488',
              display: 'flex',
            }}
          >
            {SITE_NAME}
          </div>
          <div
            style={{
              fontSize: 20,
              color: '#6b7280',
              display: 'flex',
            }}
          >
            GLP-1 비만치료제 정보
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
