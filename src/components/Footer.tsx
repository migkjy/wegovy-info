import Link from 'next/link';
import { CATEGORIES, DISCLAIMER, SITE_NAME } from '@/lib/constants';

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-16">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="font-bold text-gray-900 mb-3">{SITE_NAME}</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              GLP-1 비만치료제에 관한 객관적인 정보를 제공합니다.
            </p>
          </div>
          <div>
            <h3 className="font-bold text-gray-900 mb-3">카테고리</h3>
            <ul className="space-y-1.5">
              {CATEGORIES.map((cat) => (
                <li key={cat.slug}>
                  <Link
                    href={`/category/${cat.slug}`}
                    className="text-sm text-gray-500 hover:text-teal-600 transition-colors"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-gray-900 mb-3">법적 고지</h3>
            <p className="text-xs text-gray-400 leading-relaxed">{DISCLAIMER}</p>
          </div>
        </div>
        <div className="pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-400 text-center">
            © {new Date().getFullYear()} {SITE_NAME}. 이 사이트의 정보는 의학적 조언을 대체하지 않습니다.
          </p>
        </div>
      </div>
    </footer>
  );
}
