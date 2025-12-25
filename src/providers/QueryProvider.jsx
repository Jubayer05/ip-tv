"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export default function QueryProvider({ children }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 10 * 60 * 1000, // 10 minutes - increased for better caching
            gcTime: 15 * 60 * 1000, // 15 minutes (renamed from cacheTime)
            refetchOnWindowFocus: false, // Reduce unnecessary refetches
            refetchOnReconnect: false,
            retry: 1, // Reduce retries for faster failure
          },
          mutations: {
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
