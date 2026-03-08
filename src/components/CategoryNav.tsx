import Link from 'next/link';
import { CATEGORIES } from '@/lib/constants';

interface CategoryNavProps {
  activeCategory?: string;
}

export default function CategoryNav({ activeCategory }: CategoryNavProps) {
  return (
    <nav className="flex flex-wrap gap-2 mb-8">
      <Link
        href="/"
        className={`px-4 py-1.5 text-sm rounded-full border transition-colors ${
          !activeCategory
            ? 'bg-teal-600 text-white border-teal-600'
            : 'bg-white text-gray-600 border-gray-300 hover:border-teal-400 hover:text-teal-600'
        }`}
      >
        전체
      </Link>
      {CATEGORIES.map((cat) => (
        <Link
          key={cat.slug}
          href={`/category/${cat.slug}`}
          className={`px-4 py-1.5 text-sm rounded-full border transition-colors ${
            activeCategory === cat.slug
              ? 'bg-teal-600 text-white border-teal-600'
              : 'bg-white text-gray-600 border-gray-300 hover:border-teal-400 hover:text-teal-600'
          }`}
        >
          {cat.name}
        </Link>
      ))}
    </nav>
  );
}
