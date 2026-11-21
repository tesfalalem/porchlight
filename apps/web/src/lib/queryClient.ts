import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Apartment / amenity data changes infrequently — keep it fresh for 5 minutes
      // before treating it as stale and re-fetching in the background.
      staleTime: 5 * 60_000,
      // Keep unused data in the cache for 10 minutes so navigating back to a
      // previously visited page never fires a network request.
      gcTime: 10 * 60_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
