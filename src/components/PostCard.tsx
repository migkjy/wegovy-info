import Link from 'next/link';
import { PostMeta } from '@/lib/posts';
import { CATEGORIES } from '@/lib/constants';

interface PostCardProps {
  post: PostMeta;
}

export default function PostCard({ post }: PostCardProps) {
  const { slug, frontmatter } = post;
  const category = CATEGORIES.find((c) => c.slug === frontmatter.category);
  const formattedDate = new Date(frontmatter.date).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Link href={`/${slug}`} className="group block">
      <article className="bg-white rounded-xl border border-gray-200 p-5 hover:border-teal-300 hover:shadow-md transition-all duration-200">
        {category && (
          <span className="inline-block px-2.5 py-0.5 text-xs font-medium text-teal-700 bg-teal-50 rounded-full mb-3">
            {category.name}
          </span>
        )}
        <h2 className="text-base font-semibold text-gray-900 group-hover:text-teal-700 line-clamp-2 mb-2 transition-colors">
          {frontmatter.title}
        </h2>
        <p className="text-sm text-gray-500 line-clamp-2 mb-4">{frontmatter.description}</p>
        {frontmatter.tags && frontmatter.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {frontmatter.tags.map((tag) => (
              <Link
                key={tag}
                href={`/tag/${encodeURIComponent(tag)}`}
                onClick={(e) => e.stopPropagation()}
                className="px-2 py-0.5 text-xs text-gray-500 bg-gray-100 rounded-full hover:bg-teal-50 hover:text-teal-700 transition-colors"
              >
                #{tag}
              </Link>
            ))}
          </div>
        )}
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>{frontmatter.author}</span>
          <time dateTime={frontmatter.date}>{formattedDate}</time>
        </div>
      </article>
    </Link>
  );
}
