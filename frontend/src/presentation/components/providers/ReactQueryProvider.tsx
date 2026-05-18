// src/presentation/components/providers/ReactQueryProvider.tsx
"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export function ReactQueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,       // 1 phút — tránh refetch liên tục
            retry: 1,                    // thử lại 1 lần nếu lỗi
            refetchOnWindowFocus: false, // không refetch khi alt-tab về
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}