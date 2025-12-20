export function ModalSkeleton() {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="w-16 h-16 bg-gray-700/50 rounded-full animate-pulse mb-4"></div>
      <div className="h-6 w-48 bg-gray-700/50 rounded animate-pulse mb-2"></div>
      <div className="h-4 w-64 bg-gray-700/50 rounded animate-pulse"></div>
    </div>
  );
}

