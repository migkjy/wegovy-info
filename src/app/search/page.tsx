'use client';

import { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { CATEGORIES } from '@/lib/constants';

interface SearchPost {
  slug: string;
  title: string;
  description: string;
  tags: string[];
  category: string;
  date: string;
}

function getCategoryName(slug: string): string | undefined {
  return CATEGORIES.find((c) => c.slug === slug)?.name;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function matchesQuery(post: SearchPost, query: string): boolean {
  const q = query.toLowerCase();
  const titleMatch = post.title.toLowerCase().includes(q);
  const descMatch = post.description.toLowerCase().includes(q);
  const tagMatch = post.tags.some((tag) => tag.toLowerCase().includes(q));
  return titleMatch || descMatch || tagMatch;
}

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get('q') ?? '';

  const [inputValue, setInputValue] = useState(initialQuery);
  const [query, setQuery] = useState(initialQuery);
  const [posts, setPosts] = useState<SearchPost[]>([]);
  const [loading, setLoading] = useState(true);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    async function fetchIndex() {
      try {
        const res = await fetch('/api/search');
        if (!res.ok) throw new Error('Search index fetch failed');
        const data: SearchPost[] = await res.json();
        setPosts(data);
      } catch {
        setPosts([]);
      } finally {
        setLoading(false);
      }
    }
    fetchIndex();
  }, []);

  const updateQuery = useCallback(
    (value: string) => {
      setQuery(value);
      const params = new URLSearchParams();
      if (value.trim()) {
        params.set('q', value.trim());
      }
      const qs = params.toString();
      router.replace(qs ? `/search?${qs}` : '/search', { scroll: false });
    },
    [router],
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      updateQuery(value);
    }, 300);
  };

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const trimmedQuery = query.trim();
  const results = trimmedQuery
    ? posts.filter((post) => matchesQuery(post, trimmedQuery))
    : [];

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      {/* 브레드크럼 */}
      <nav className="flex items-center gap-2 text-sm text-gray-400 mb-6">
        <Link href="/" className="hover:text-teal-600 transition-colors">
          홈
        </Link>
        <span>/</span>
        <span className="text-gray-600">검색</span>
      </nav>

      <header className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
          글 검색
        </h1>
        <div className="relative">
          <input
            type="search"
            value={inputValue}
            onChange={handleInputChange}
            placeholder="검색어를 입력하세요 (예: 위고비, 부작용, 가격)"
            className="w-full px-4 py-3 pl-11 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
            autoFocus
          />
          <svg
            className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </header>

      {loading ? (
        <div className="text-center py-16 text-gray-400">
          <p>검색 인덱스를 불러오는 중...</p>
        </div>
      ) : trimmedQuery === '' ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg mb-2">검색어를 입력해 주세요.</p>
          <p className="text-sm">
            제목, 설명, 태그를 기준으로 검색합니다.
          </p>
        </div>
      ) : results.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg mb-2">검색 결과 없음</p>
          <p className="text-sm">
            &ldquo;{trimmedQuery}&rdquo;에 대한 검색 결과가 없습니다. 다른
            검색어를 시도해 보세요.
          </p>
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-500 mb-4">
            &ldquo;{trimmedQuery}&rdquo; 검색 결과 {results.length}건
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {results.map((post) => {
              const categoryName = getCategoryName(post.category);
              return (
                <div key={post.slug} className="group block">
                  <article className="bg-white rounded-xl border border-gray-200 p-5 hover:border-teal-300 hover:shadow-md transition-all duration-200">
                    {categoryName && (
                      <span className="inline-block px-2.5 py-0.5 text-xs font-medium text-teal-700 bg-teal-50 rounded-full mb-3">
                        {categoryName}
                      </span>
                    )}
                    <h2 className="text-base font-semibold text-gray-900 group-hover:text-teal-700 line-clamp-2 mb-2 transition-colors">
                      <Link
                        href={`/${post.slug}`}
                        className="hover:text-teal-700 transition-colors"
                      >
                        {post.title}
                      </Link>
                    </h2>
                    <p className="text-sm text-gray-500 line-clamp-2 mb-4">
                      {post.description}
                    </p>
                    {post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {post.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 text-xs text-gray-500 bg-gray-100 rounded-full"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center justify-end text-xs text-gray-400">
                      <time dateTime={post.date}>{formatDate(post.date)}</time>
                    </div>
                  </article>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-5xl mx-auto px-4 py-10 text-center text-gray-400">
          <p>로딩 중...</p>
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
