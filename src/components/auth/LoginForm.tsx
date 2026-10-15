"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, FormError, PasswordField } from "@/components/forms/Field";
import { errorMessage } from "@/lib/api-error";
import { login } from "@/lib/session";
import { useAuth } from "@/stores/auth";

export function LoginForm({ next }: { next: string }) {
  const router = useRouter();
  const status = useAuth((s) => s.status);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (status === "authenticated" && !busy) router.replace(next);
  }, [status, busy, next, router]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password) {
      setError("Enter your email or mobile number and password");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const customer = await login(identifier.trim(), password);
      toast.success(`Welcome back, ${customer.name.split(" ")[0]}`);
      router.replace(next);
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-5" noValidate>
      <FormError message={error} />
      <Field
        label="Email or mobile number"
        autoComplete="username"
        value={identifier}
        onChange={(e) => setIdentifier(e.target.value)}
        autoFocus
      />
      <div>
        <PasswordField label="Password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <div className="mt-2 text-right">
          <Link href="/forgot-password" className="text-[13px] text-rose-dark underline-offset-4 hover:underline">
            Forgot password?
          </Link>
        </div>
      </div>
      <Button type="submit" block size="lg" loading={busy}>
        Sign in
      </Button>
      <p className="text-center text-sm text-muted">
        New to Ananta?{" "}
        <Link href={`/register${next !== "/account" ? `?next=${encodeURIComponent(next)}` : ""}`} className="font-medium text-rose-dark underline-offset-4 hover:underline">
          Create an account
        </Link>
      </p>
    </form>
  );
}
