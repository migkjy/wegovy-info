import Link from 'next/link';
import { getTopTags } from '@/lib/posts';

export default function PopularTags() {
  const tags = getTopTags(20);

  if (tags.length === 0) return null;

  return (
    <section className="mb-10">
      <h2 className="text-lg font-bold text-gray-900 mb-4">인기 태그</h2>
      <div className="flex flex-wrap gap-2">
        {tags.map(({ tag, count }) => (
          <Link
            key={tag}
            href={`/tag/${encodeURIComponent(tag)}`}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium bg-teal-50 text-teal-700 border border-teal-200 hover:bg-teal-100 hover:text-teal-900 transition-colors"
          >
            #{tag}
            <span className="text-xs text-teal-500 font-normal">{count}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
