"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useState } from "react";
import { PrivacyProvider } from "@/contexts/PrivacyContext";

export default function Providers({
  children,
}: {
  children: ReactNode;
}): ReactNode {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <PrivacyProvider>{children}</PrivacyProvider>
    </QueryClientProvider>
  );
}
