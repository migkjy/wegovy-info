export default function Loading() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      {/* 히어로 스켈레톤 */}
      <div className="text-center py-12 mb-10">
        <div className="h-8 w-64 bg-gray-200 rounded-lg mx-auto mb-4 animate-pulse" />
        <div className="h-5 w-96 max-w-full bg-gray-200 rounded-lg mx-auto mb-6 animate-pulse" />
      </div>
      {/* 카테고리 스켈레톤 */}
      <div className="mb-12">
        <div className="h-6 w-40 bg-gray-200 rounded mb-5 animate-pulse" />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="h-5 w-20 bg-gray-200 rounded mb-2 animate-pulse" />
              <div className="h-3 w-full bg-gray-100 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
      {/* 포스트 스켈레톤 */}
      <div>
        <div className="h-6 w-24 bg-gray-200 rounded mb-5 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="h-4 w-16 bg-gray-200 rounded-full mb-3 animate-pulse" />
              <div className="h-5 w-full bg-gray-200 rounded mb-2 animate-pulse" />
              <div className="h-4 w-3/4 bg-gray-100 rounded mb-4 animate-pulse" />
              <div className="flex justify-between">
                <div className="h-3 w-16 bg-gray-100 rounded animate-pulse" />
                <div className="h-3 w-24 bg-gray-100 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
