'use client';

import { useState } from 'react';
import Link from 'next/link';
import { SITE_NAME } from '@/lib/constants';

const NAV_LINKS = [
  { href: '/wegovy', label: '위고비' },
  { href: '/saxenda', label: '삭센다' },
  { href: '/mounjaro', label: '마운자로' },
  { href: '/category/comparison', label: '비교분석' },
  { href: '/category/side-effects', label: '부작용' },
  { href: '/category/price', label: '가격정보' },
  { href: '/news', label: '뉴스' },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-teal-600 font-bold text-xl">{SITE_NAME}</span>
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-1.5 text-sm text-gray-600 hover:text-teal-700 hover:bg-teal-50 rounded-md transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/clinics"
              className="px-3 py-1.5 text-sm text-gray-600 hover:text-teal-700 hover:bg-teal-50 rounded-md transition-colors"
            >
              병원 찾기
            </Link>
            <Link
              href="/insurance"
              className="px-3 py-1.5 text-sm text-gray-600 hover:text-teal-700 hover:bg-teal-50 rounded-md transition-colors"
            >
              보험정보
            </Link>
            <Link
              href="/community"
              className="px-3 py-1.5 text-sm text-gray-600 hover:text-teal-700 hover:bg-teal-50 rounded-md transition-colors"
            >
              경험 공유
            </Link>
            <Link
              href="/about"
              className="px-3 py-1.5 text-sm text-gray-600 hover:text-teal-700 hover:bg-teal-50 rounded-md transition-colors"
            >
              소개
            </Link>
            <Link
              href="/search"
              className="ml-1 p-1.5 text-gray-500 hover:text-teal-700 hover:bg-teal-50 rounded-md transition-colors"
              aria-label="검색"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </Link>
          </nav>
          <button
            className="md:hidden p-2 text-gray-500"
            aria-label={menuOpen ? '메뉴 닫기' : '메뉴 열기'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
        {/* 모바일 메뉴 패널 */}
        {menuOpen && (
          <nav className="md:hidden pb-4 border-t border-gray-100">
            <ul className="flex flex-col gap-1 pt-2">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="block px-3 py-2 text-sm text-gray-600 hover:text-teal-700 hover:bg-teal-50 rounded-md transition-colors"
                    onClick={() => setMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/clinics"
                  className="block px-3 py-2 text-sm text-gray-600 hover:text-teal-700 hover:bg-teal-50 rounded-md transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  병원 찾기
                </Link>
              </li>
              <li>
                <Link
                  href="/insurance"
                  className="block px-3 py-2 text-sm text-gray-600 hover:text-teal-700 hover:bg-teal-50 rounded-md transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  보험정보
                </Link>
              </li>
              <li>
                <Link
                  href="/community"
                  className="block px-3 py-2 text-sm text-gray-600 hover:text-teal-700 hover:bg-teal-50 rounded-md transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  경험 공유
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="block px-3 py-2 text-sm text-gray-600 hover:text-teal-700 hover:bg-teal-50 rounded-md transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  소개
                </Link>
              </li>
              <li>
                <Link
                  href="/search"
                  className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-teal-700 hover:bg-teal-50 rounded-md transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  검색
                </Link>
              </li>
            </ul>
          </nav>
        )}
        {/* 모바일 카테고리 가로 스크롤 (메뉴 닫혔을 때만) */}
        {!menuOpen && (
          <div className="md:hidden flex gap-2 pb-3 overflow-x-auto scrollbar-hide">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="whitespace-nowrap px-3 py-1 text-xs text-gray-600 bg-gray-100 hover:bg-teal-100 hover:text-teal-700 rounded-full transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}
