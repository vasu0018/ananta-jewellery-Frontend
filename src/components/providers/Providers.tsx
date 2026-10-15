"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { ApiError } from "@/lib/api-error";
import { StoreBootstrap } from "./StoreBootstrap";
import { PaymentProvider } from "@/components/checkout/PaymentProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            refetchOnWindowFocus: false,
            // Client errors (404, validation, auth) won't fix themselves on retry.
            retry: (count, err) => !(err instanceof ApiError && err.status < 500) && count < 2,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={client}>
      <StoreBootstrap />
      <PaymentProvider>{children}</PaymentProvider>
      <Toaster
        position="bottom-center"
        toastOptions={{
          classNames: {
            toast: "!rounded-2xl !border-line !bg-ink !text-white !shadow-lift !font-sans",
            description: "!text-white/70",
            actionButton: "!bg-white !text-ink !rounded-full",
          },
        }}
      />
    </QueryClientProvider>
  );
}
