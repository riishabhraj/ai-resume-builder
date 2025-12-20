import { ResumeCardSkeleton } from './ResumeCardSkeleton';

export function ResumesPageSkeleton() {
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
          <div className="h-12 w-48 bg-gray-700/50 rounded-lg animate-pulse mb-2"></div>
          <div className="h-6 w-96 bg-gray-700/50 rounded-lg animate-pulse"></div>
        </div>

        {/* Resume Cards Grid Skeleton */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <ResumeCardSkeleton key={i} />
          ))}
        </div>
      </main>
    </div>
  );
}

