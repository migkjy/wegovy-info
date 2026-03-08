import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-20 text-center">
      <h1 className="text-6xl font-bold text-gray-200 mb-4">404</h1>
      <h2 className="text-xl font-semibold text-gray-900 mb-3">
        페이지를 찾을 수 없습니다
      </h2>
      <p className="text-gray-500 mb-8">
        요청하신 페이지가 존재하지 않거나, 주소가 변경되었을 수 있습니다.
      </p>
      <Link
        href="/"
        className="inline-block px-6 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm font-medium"
      >
        홈으로 돌아가기
      </Link>
    </div>
  );
}
