export function ReviewPageSkeleton() {
  return (
    <div className="h-screen flex flex-col animated-gradient aurora overflow-hidden" suppressHydrationWarning>
      {/* Header Skeleton */}
      <header className="sticky top-0 z-50 glass border-b neon-border backdrop-blur-xl flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-xl bg-gray-700/50 animate-pulse"></div>
              <div className="h-6 w-32 bg-gray-700/50 rounded animate-pulse"></div>
            </div>
            <div className="h-10 w-40 bg-gray-700/50 rounded-xl animate-pulse"></div>
          </div>
        </div>
      </header>

      {/* Modal Skeleton */}
      <main className="fixed inset-0 bg-black/60 backdrop-blur-md z-40 flex items-center justify-center p-4 pt-16 pb-4 overflow-y-auto">
        <div className="relative glass rounded-3xl shadow-2xl border-2 neon-border backdrop-blur-xl w-full max-w-5xl max-h-[calc(100vh-6rem)] overflow-hidden flex flex-col">
          {/* Header Skeleton */}
          <div className="relative px-6 py-4 border-b border-brand-purple/30 backdrop-blur-xl flex-shrink-0">
            <div className="h-6 w-48 bg-gray-700/50 rounded animate-pulse"></div>
          </div>

          {/* Content Skeleton */}
          <div className="p-6 overflow-y-auto flex-1">
            <div className="space-y-6">
              {/* Upload Section Skeleton */}
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-700/50 rounded-full animate-pulse mx-auto mb-4"></div>
                <div className="h-6 w-64 bg-gray-700/50 rounded animate-pulse mx-auto mb-2"></div>
                <div className="h-4 w-96 bg-gray-700/50 rounded animate-pulse mx-auto mb-6"></div>
                <div className="h-32 bg-gray-700/50 rounded-2xl animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

