export function ResumeCardSkeleton() {
  return (
    <div className="card bg-brand-navy/80 backdrop-blur-xl shadow-xl border border-brand-purple/30">
      <div className="card-body">
        <div className="h-6 w-48 bg-gray-700/50 rounded animate-pulse mb-4"></div>
        <div className="space-y-2 mb-4">
          <div className="flex justify-between">
            <div className="h-4 w-16 bg-gray-700/50 rounded animate-pulse"></div>
            <div className="h-6 w-20 bg-gray-700/50 rounded-full animate-pulse"></div>
          </div>
          <div className="flex justify-between">
            <div className="h-4 w-20 bg-gray-700/50 rounded animate-pulse"></div>
            <div className="h-6 w-16 bg-gray-700/50 rounded-full animate-pulse"></div>
          </div>
          <div className="flex justify-between">
            <div className="h-4 w-16 bg-gray-700/50 rounded animate-pulse"></div>
            <div className="h-4 w-24 bg-gray-700/50 rounded animate-pulse"></div>
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <div className="h-8 w-16 bg-gray-700/50 rounded-xl animate-pulse"></div>
          <div className="h-8 w-16 bg-gray-700/50 rounded-xl animate-pulse"></div>
          <div className="h-8 w-16 bg-gray-700/50 rounded-xl animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}

