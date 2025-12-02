import { useEffect, useState } from 'react';

/**
 * Hook to wait for Zustand store hydration to complete
 * This prevents hydration mismatches when using persisted stores
 * 
 * Zustand persist middleware hydrates synchronously on first store access,
 * but we need to ensure it happens after the component mounts on the client.
 */
export function useStoreHydration() {
  // Start with false to match server render
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Only run on client
    if (typeof window === 'undefined') {
      return;
    }

    // Zustand persist hydrates synchronously when stores are first accessed
    // We just need to wait for the next tick to ensure React has finished the initial render
    // This ensures the initial server render matches the initial client render
    const timer = setTimeout(() => {
      setIsHydrated(true);
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  return isHydrated;
}

