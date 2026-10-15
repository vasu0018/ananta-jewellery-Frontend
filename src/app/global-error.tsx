"use client";

/** Last-resort boundary for errors in the root layout; renders its own document without app styles. */
export default function GlobalError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <html lang="en-IN">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif", background: "#faf6f1", color: "#231f1d" }}>
        <title>Something went wrong | Ananta Jewellery</title>
        <main style={{ minHeight: "100dvh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, textAlign: "center" }}>
          <p style={{ letterSpacing: 6, fontSize: 22, margin: 0 }}>ANANTA</p>
          <h1 style={{ fontFamily: "Georgia, serif", fontWeight: 400, fontSize: 36, margin: "24px 0 8px" }}>We&apos;ll be right back</h1>
          <p style={{ color: "#776d67", maxWidth: 420, lineHeight: 1.6 }}>The store is having trouble loading. Please try again in a moment.</p>
          {error.digest && <p style={{ color: "#776d67", fontSize: 12, fontFamily: "monospace" }}>Reference: {error.digest}</p>}
          <button
            type="button"
            onClick={() => retry()}
            style={{ marginTop: 16, height: 44, padding: "0 24px", borderRadius: 999, border: 0, background: "#231f1d", color: "#fff", fontSize: 14, cursor: "pointer" }}
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
