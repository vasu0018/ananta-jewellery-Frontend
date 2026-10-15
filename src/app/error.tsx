"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ErrorPage({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="container-x flex flex-col items-center py-24 text-center">
      <p className="eyebrow mb-3">Something went wrong</p>
      <h1 className="font-display text-4xl text-ink sm:text-5xl">We hit a small snag</h1>
      <p className="mt-4 max-w-md text-[15px] text-muted">
        This page couldn&apos;t load right now. Please try again — if it keeps happening, our team is a message away.
      </p>
      {error.digest && <p className="mt-3 font-mono text-xs text-muted">Reference: {error.digest}</p>}
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button size="lg" onClick={() => retry()}>
          <RefreshCw className="size-4" /> Try again
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link href="/">Back to home</Link>
        </Button>
      </div>
    </div>
  );
}
