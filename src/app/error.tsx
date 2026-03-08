'use client';

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="max-w-3xl mx-auto px-4 py-20 text-center">
      <h1 className="text-6xl font-bold text-gray-200 mb-4">오류</h1>
      <h2 className="text-xl font-semibold text-gray-900 mb-3">
        문제가 발생했습니다
      </h2>
      <p className="text-gray-500 mb-8">
        일시적인 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.
      </p>
      <button
        onClick={reset}
        className="inline-block px-6 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm font-medium"
      >
        다시 시도
      </button>
    </div>
  );
}
