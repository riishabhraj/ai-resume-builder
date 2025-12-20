export function DashboardSkeleton() {
  return (
    <div className="min-h-screen animated-gradient aurora" data-theme="atsbuilder">
      {/* Header Skeleton */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-brand-dark-bg/75 border-b border-brand-purple/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-xl bg-gray-700/50 animate-pulse"></div>
              <div className="h-6 w-32 bg-gray-700/50 rounded animate-pulse"></div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex space-x-1">
                <div className="h-9 w-24 bg-gray-700/50 rounded-lg animate-pulse"></div>
                <div className="h-9 w-24 bg-gray-700/50 rounded-lg animate-pulse"></div>
                <div className="h-9 w-24 bg-gray-700/50 rounded-lg animate-pulse"></div>
              </div>
              <div className="h-10 w-32 bg-gray-700/50 rounded-xl animate-pulse"></div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        {/* Title Skeleton */}
        <div className="mb-8">
          <div className="h-12 w-64 bg-gray-700/50 rounded-lg animate-pulse mb-2"></div>
          <div className="h-6 w-96 bg-gray-700/50 rounded-lg animate-pulse"></div>
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card bg-brand-navy/80 backdrop-blur-xl shadow-xl border border-brand-purple/30">
              <div className="card-body">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="h-4 w-24 bg-gray-700/50 rounded animate-pulse mb-2"></div>
                    <div className="h-8 w-16 bg-gray-700/50 rounded animate-pulse"></div>
                  </div>
                  <div className="w-12 h-12 bg-gray-700/50 rounded-xl animate-pulse"></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Content Grid Skeleton */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Hiring Zone Chart Skeleton */}
          <div className="lg:col-span-1 card bg-brand-navy/80 backdrop-blur-xl shadow-xl border border-brand-purple/30">
            <div className="card-body">
              <div className="h-6 w-32 bg-gray-700/50 rounded animate-pulse mb-4"></div>
              <div className="flex items-center justify-center">
                <div className="w-48 h-48 bg-gray-700/50 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Quick Actions Skeleton */}
          <div className="lg:col-span-1 card bg-brand-navy/80 backdrop-blur-xl shadow-xl border border-brand-purple/30">
            <div className="card-body">
              <div className="h-6 w-32 bg-gray-700/50 rounded animate-pulse mb-4"></div>
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-14 bg-gray-700/50 rounded-xl animate-pulse"></div>
                ))}
              </div>
            </div>
          </div>

          {/* Performance Insights Skeleton */}
          <div className="lg:col-span-1 card bg-brand-navy/80 backdrop-blur-xl shadow-xl border border-brand-purple/30">
            <div className="card-body">
              <div className="h-6 w-40 bg-gray-700/50 rounded animate-pulse mb-4"></div>
              <div className="space-y-3">
                <div className="h-4 w-full bg-gray-700/50 rounded animate-pulse"></div>
                <div className="h-4 w-3/4 bg-gray-700/50 rounded animate-pulse"></div>
                <div className="h-10 w-24 bg-gray-700/50 rounded animate-pulse mt-4"></div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

