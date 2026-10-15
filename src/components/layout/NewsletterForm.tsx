"use client";

import { useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { errorMessage } from "@/lib/api-error";
import { cn } from "@/lib/utils";

export function NewsletterForm({ source = "footer", tone = "dark" }: { source?: string; tone?: "dark" | "light" }) {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const r = await api<{ message: string }>("/content/newsletter", { body: { email, source } });
      setDone(true);
      toast.success(r.message);
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <p className={cn("flex items-center gap-2 text-sm", tone === "dark" ? "text-blush" : "text-success")}>
        <Check className="size-4" /> You&apos;re subscribed — welcome to the Ananta circle.
      </p>
    );
  }

  return (
    <form onSubmit={submit} className="relative max-w-sm">
      <label htmlFor={`nl-${source}`} className="sr-only">
        Email address
      </label>
      <input
        id={`nl-${source}`}
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Your email address"
        className={cn(
          "h-12 w-full rounded-[6px] pl-4 pr-14 text-sm outline-none transition",
          tone === "dark"
            ? "border border-white/20 bg-white/5 text-white placeholder:text-white/50 focus:border-gold"
            : "border border-line-strong bg-white text-ink placeholder:text-muted focus:border-ink",
        )}
      />
      <button
        type="submit"
        disabled={busy}
        className="absolute right-1.5 top-1.5 grid size-9 place-items-center rounded-[5px] bg-rose text-white transition hover:brightness-95 disabled:opacity-60"
        aria-label="Subscribe"
      >
        <ArrowRight className="size-4" />
      </button>
    </form>
  );
}
