import Link from 'next/link';
import { PostMeta } from '@/lib/posts';
import { CATEGORIES } from '@/lib/constants';

interface FeaturedPostProps {
  post: PostMeta;
}

export default function FeaturedPost({ post }: FeaturedPostProps) {
  const category = CATEGORIES.find((c) => c.slug === post.frontmatter.category);
  const formattedDate = new Date(post.frontmatter.date).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Link href={`/${post.slug}`} className="group block">
      <article className="relative bg-gradient-to-br from-teal-600 to-teal-800 rounded-2xl overflow-hidden min-h-[280px] flex flex-col justify-end p-6 md:p-8 hover:shadow-xl transition-shadow">
        {/* Background overlay */}
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />

        <div className="relative z-10">
          {category && (
            <span className="inline-block px-3 py-1 text-xs font-semibold text-teal-100 bg-white/20 rounded-full mb-3">
              {category.name}
            </span>
          )}
          <h2 className="text-xl md:text-2xl font-bold text-white mb-2 leading-snug group-hover:underline">
            {post.frontmatter.title}
          </h2>
          <p className="text-teal-100 text-sm line-clamp-2 mb-3">
            {post.frontmatter.description}
          </p>
          <div className="flex items-center gap-2 text-xs text-teal-200">
            <span>{post.frontmatter.author}</span>
            <span>·</span>
            <time dateTime={post.frontmatter.date}>{formattedDate}</time>
          </div>
        </div>
      </article>
    </Link>
  );
}
