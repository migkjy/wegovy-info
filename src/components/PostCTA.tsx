import Link from 'next/link';

export default function PostCTA() {
  return (
    <div className="mt-10 p-6 bg-gradient-to-br from-teal-50 to-blue-50 border border-teal-200 rounded-2xl">
      <h3 className="text-base font-bold text-teal-800 mb-4">더 알아보기</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Link
          href="/clinics"
          className="flex items-center gap-3 px-4 py-3 bg-white rounded-xl border border-teal-100 hover:border-teal-400 hover:shadow-sm transition-all group"
        >
          <span className="text-2xl flex-shrink-0">🏥</span>
          <div>
            <p className="text-sm font-semibold text-gray-900 group-hover:text-teal-700 transition-colors">
              위고비 처방 병원 찾기
            </p>
            <p className="text-xs text-gray-500">전국 처방 가능 클리닉 목록</p>
          </div>
          <svg className="w-4 h-4 text-gray-400 group-hover:text-teal-600 ml-auto flex-shrink-0 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
        <Link
          href="/news"
          className="flex items-center gap-3 px-4 py-3 bg-white rounded-xl border border-blue-100 hover:border-blue-400 hover:shadow-sm transition-all group"
        >
          <span className="text-2xl flex-shrink-0">📰</span>
          <div>
            <p className="text-sm font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
              최신 GLP-1 뉴스
            </p>
            <p className="text-xs text-gray-500">위고비·마운자로 최신 소식</p>
          </div>
          <svg className="w-4 h-4 text-gray-400 group-hover:text-blue-600 ml-auto flex-shrink-0 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </div>
  );
}
