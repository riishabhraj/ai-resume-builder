export function PageSkeleton() {
  return (
    <div className="min-h-screen animated-gradient aurora flex items-center justify-center" data-theme="atsbuilder">
      <div className="text-center">
        <div className="w-16 h-16 bg-gray-700/50 rounded-full animate-pulse mx-auto mb-4"></div>
        <div className="h-6 w-48 bg-gray-700/50 rounded animate-pulse mx-auto"></div>
      </div>
    </div>
  );
}

