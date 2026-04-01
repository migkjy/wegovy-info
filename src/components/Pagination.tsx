import Link from 'next/link';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  basePath: string;
}

function getPageHref(basePath: string, page: number): string {
  if (page === 1) return basePath;
  return `${basePath}?page=${page}`;
}

function getPageNumbers(currentPage: number, totalPages: number): (number | '...')[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages: (number | '...')[] = [];
  const delta = 2;
  const rangeStart = Math.max(2, currentPage - delta);
  const rangeEnd = Math.min(totalPages - 1, currentPage + delta);

  pages.push(1);

  if (rangeStart > 2) {
    pages.push('...');
  }

  for (let i = rangeStart; i <= rangeEnd; i++) {
    pages.push(i);
  }

  if (rangeEnd < totalPages - 1) {
    pages.push('...');
  }

  pages.push(totalPages);

  return pages;
}

export default function Pagination({ currentPage, totalPages, basePath }: PaginationProps) {
  const pageNumbers = getPageNumbers(currentPage, totalPages);

  return (
    <nav className="flex items-center justify-center gap-1 mt-10" aria-label="페이지 탐색">
      {currentPage > 1 ? (
        <Link
          href={getPageHref(basePath, currentPage - 1)}
          className="px-3 py-2 text-sm text-gray-600 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
        >
          이전
        </Link>
      ) : (
        <span className="px-3 py-2 text-sm text-gray-300 cursor-not-allowed">이전</span>
      )}

      {pageNumbers.map((page, index) =>
        page === '...' ? (
          <span key={`ellipsis-${index}`} className="px-3 py-2 text-sm text-gray-400">
            ...
          </span>
        ) : (
          <Link
            key={page}
            href={getPageHref(basePath, page)}
            aria-current={page === currentPage ? 'page' : undefined}
            className={
              page === currentPage
                ? 'px-3 py-2 text-sm font-bold bg-teal-600 text-white rounded-lg'
                : 'px-3 py-2 text-sm text-gray-600 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors'
            }
          >
            {page}
          </Link>
        )
      )}

      {currentPage < totalPages ? (
        <Link
          href={getPageHref(basePath, currentPage + 1)}
          className="px-3 py-2 text-sm text-gray-600 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
        >
          다음
        </Link>
      ) : (
        <span className="px-3 py-2 text-sm text-gray-300 cursor-not-allowed">다음</span>
      )}
    </nav>
  );
}
