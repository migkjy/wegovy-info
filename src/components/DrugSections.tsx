import Link from 'next/link';
import { getRecentPostsByCategory } from '@/lib/posts';

const DRUG_SECTIONS = [
  { category: 'wegovy', name: '위고비', colorClass: 'text-blue-700 bg-blue-50 border-blue-200', ctaClass: 'text-blue-600 hover:text-blue-800' },
  { category: 'mounjaro', name: '마운자로', colorClass: 'text-purple-700 bg-purple-50 border-purple-200', ctaClass: 'text-purple-600 hover:text-purple-800' },
  { category: 'saxenda', name: '삭센다', colorClass: 'text-green-700 bg-green-50 border-green-200', ctaClass: 'text-green-600 hover:text-green-800' },
];

export default function DrugSections() {
  const sections = DRUG_SECTIONS.map((d) => ({
    ...d,
    posts: getRecentPostsByCategory(d.category, 3),
  }));

  return (
    <section className="mb-10">
      <h2 className="text-lg font-bold text-gray-900 mb-4">약물별 최신 소식</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {sections.map((section) => (
          <div
            key={section.category}
            className={`rounded-xl border p-4 ${section.colorClass}`}
          >
            <h3 className="font-bold text-base mb-3">{section.name}</h3>
            {section.posts.length === 0 ? (
              <p className="text-sm opacity-60">아직 등록된 글이 없습니다.</p>
            ) : (
              <ul className="space-y-2 mb-3">
                {section.posts.map((post) => {
                  const formattedDate = new Date(post.frontmatter.date).toLocaleDateString('ko-KR', {
                    month: 'short',
                    day: 'numeric',
                  });
                  return (
                    <li key={post.slug}>
                      <Link
                        href={`/${post.slug}`}
                        className="block hover:underline leading-snug"
                      >
                        <span className="text-sm font-medium text-gray-900 line-clamp-2">
                          {post.frontmatter.title}
                        </span>
                        <span className="text-xs text-gray-500 mt-0.5 block">{formattedDate}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
            <Link
              href={`/category/${section.category}`}
              className={`text-xs font-semibold ${section.ctaClass} transition-colors`}
            >
              {section.name} 전체보기 →
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
