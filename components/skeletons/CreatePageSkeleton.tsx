export function CreatePageSkeleton() {
  return (
    <div className="h-screen flex flex-col animated-gradient aurora" data-theme="atsbuilder">
      {/* Header Skeleton */}
      <header className="bg-brand-black border-b border-brand-navy sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="h-8 w-32 bg-gray-700/50 rounded animate-pulse"></div>
            <div className="flex items-center space-x-4">
              <div className="h-8 w-24 bg-gray-700/50 rounded animate-pulse"></div>
              <div className="h-8 w-24 bg-gray-700/50 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Skeleton */}
        <div className="w-80 bg-brand-dark-bg border-r border-brand-navy p-4 overflow-y-auto">
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="p-4 bg-gray-800/50 rounded-xl border border-gray-700/50">
                <div className="h-5 w-32 bg-gray-700/50 rounded animate-pulse mb-3"></div>
                <div className="h-4 w-full bg-gray-700/50 rounded animate-pulse mb-2"></div>
                <div className="h-4 w-3/4 bg-gray-700/50 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content Skeleton */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto">
            <div className="h-10 w-64 bg-gray-700/50 rounded animate-pulse mb-6"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-6 bg-gray-800/50 rounded-xl border border-gray-700/50">
                  <div className="h-6 w-48 bg-gray-700/50 rounded animate-pulse mb-4"></div>
                  <div className="space-y-2">
                    <div className="h-4 w-full bg-gray-700/50 rounded animate-pulse"></div>
                    <div className="h-4 w-5/6 bg-gray-700/50 rounded animate-pulse"></div>
                    <div className="h-4 w-4/6 bg-gray-700/50 rounded animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

