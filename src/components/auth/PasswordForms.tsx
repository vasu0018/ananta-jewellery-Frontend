"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, FormError, PasswordField } from "@/components/forms/Field";
import { api } from "@/lib/api";
import { errorMessage } from "@/lib/api-error";
import { emailSchema, passwordSchema } from "@/lib/validation";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailSchema.safeParse(email).success) {
      setError("Enter a valid email address");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await api("/auth/forgot-password", { body: { email: email.trim().toLowerCase() } });
      setSent(true);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  if (sent) {
    return (
      <div className="rounded-2xl bg-cream p-6 text-center">
        <MailCheck className="mx-auto mb-3 size-10 text-rose" />
        <p className="font-display text-2xl text-ink">Check your inbox</p>
        <p className="mt-2 text-sm text-ink-soft">
          If an account exists for <strong>{email}</strong>, you&apos;ll receive a link to reset your password. It expires in one hour.
        </p>
        <Button asChild variant="outline" className="mt-5">
          <Link href="/login">Back to sign in</Link>
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-5" noValidate>
      <Field label="Email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} error={error ?? undefined} autoFocus />
      <Button type="submit" block size="lg" loading={busy}>
        Send reset link
      </Button>
      <p className="text-center text-sm text-muted">
        Remembered it?{" "}
        <Link href="/login" className="font-medium text-rose-dark underline-offset-4 hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}

export function ResetPasswordForm({ token }: { token: string }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<{ password?: string; confirm?: string }>({});
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  if (!token) {
    return (
      <div className="space-y-4">
        <FormError message="This reset link is incomplete. Please request a new one." />
        <Button asChild block>
          <Link href="/forgot-password">Request a new link</Link>
        </Button>
      </div>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const next: typeof errors = {};
    const p = passwordSchema.safeParse(password);
    if (!p.success) next.password = p.error.issues[0].message;
    if (password !== confirm) next.confirm = "Passwords don't match";
    setErrors(next);
    if (next.password || next.confirm) return;
    setBusy(true);
    setError(null);
    try {
      await api("/auth/reset-password", { body: { token, password } });
      setDone(true);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <div className="rounded-2xl bg-cream p-6 text-center">
        <CheckCircle2 className="mx-auto mb-3 size-10 text-success" />
        <p className="font-display text-2xl text-ink">Password updated</p>
        <p className="mt-2 text-sm text-ink-soft">You can now sign in with your new password.</p>
        <Button asChild className="mt-5">
          <Link href="/login">Sign in</Link>
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-5" noValidate>
      <FormError message={error} />
      {error?.includes("expired") && (
        <Link href="/forgot-password" className="block text-sm text-rose-dark underline-offset-4 hover:underline">
          Request a new reset link
        </Link>
      )}
      <PasswordField
        label="New password"
        autoComplete="new-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={errors.password}
        hint="At least 8 characters"
        autoFocus
      />
      <PasswordField label="Confirm password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} error={errors.confirm} />
      <Button type="submit" block size="lg" loading={busy}>
        Save password
      </Button>
    </form>
  );
}
