export function ResumeDetailSkeleton() {
  return (
    <div className="min-h-screen bg-brand-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Skeleton */}
        <div className="mb-8">
          <div className="h-10 w-64 bg-gray-700/50 rounded animate-pulse mb-4"></div>
          <div className="h-6 w-96 bg-gray-700/50 rounded animate-pulse"></div>
        </div>

        {/* Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content Skeleton */}
          <div className="lg:col-span-2 space-y-6">
            <div className="card bg-brand-navy/80 backdrop-blur-xl shadow-xl border border-brand-purple/30">
              <div className="card-body">
                <div className="h-8 w-48 bg-gray-700/50 rounded animate-pulse mb-4"></div>
                <div className="space-y-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-4 w-full bg-gray-700/50 rounded animate-pulse"></div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Skeleton */}
          <div className="lg:col-span-1 space-y-6">
            <div className="card bg-brand-navy/80 backdrop-blur-xl shadow-xl border border-brand-purple/30">
              <div className="card-body">
                <div className="h-6 w-32 bg-gray-700/50 rounded animate-pulse mb-4"></div>
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-4 w-full bg-gray-700/50 rounded animate-pulse"></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

