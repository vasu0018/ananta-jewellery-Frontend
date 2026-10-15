"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MailCheck } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Checkbox, Field, FormError, PasswordField } from "@/components/forms/Field";
import { useSettings } from "@/components/providers/SettingsProvider";
import { ApiError, errorMessage } from "@/lib/api-error";
import { register } from "@/lib/session";
import { emailSchema, passwordSchema, phoneSchema, validate, type FieldErrors } from "@/lib/validation";
import { useAuth } from "@/stores/auth";

const schema = z.object({
  name: z.string().trim().min(2, "Enter your full name").max(80),
  email: emailSchema,
  phone: z.union([phoneSchema, z.literal("")]),
  password: passwordSchema,
});

export function RegisterForm({ next }: { next: string }) {
  const router = useRouter();
  const settings = useSettings();
  const status = useAuth((s) => s.status);
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [marketing, setMarketing] = useState(true);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [verifyMessage, setVerifyMessage] = useState<string | null>(null);

  useEffect(() => {
    if (status === "authenticated" && !busy) router.replace(next);
  }, [status, busy, next, router]);

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = key === "phone" ? e.target.value.replace(/\D/g, "").slice(0, 10) : e.target.value;
    setForm((f) => ({ ...f, [key]: value }));
    setErrors(({ [key]: _, ...rest }) => rest);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const r = validate(schema, form);
    if (r.errors) {
      setErrors(r.errors);
      return;
    }
    setBusy(true);
    try {
      const res = await register({ ...r.data, phone: r.data.phone || undefined, acceptsMarketing: marketing });
      if (res.verify) {
        setVerifyMessage(res.message);
        setBusy(false);
        return;
      }
      toast.success(
        res.customer.loyaltyPoints > 0 ? `Welcome to Ananta! ${res.customer.loyaltyPoints} points have been added to your account.` : "Welcome to Ananta!",
      );
      router.replace(next);
    } catch (err) {
      if (err instanceof ApiError) setErrors(err.fields);
      setError(errorMessage(err));
      setBusy(false);
    }
  };

  if (verifyMessage) {
    return (
      <div className="rounded-2xl bg-cream p-6 text-center">
        <MailCheck className="mx-auto mb-3 size-10 text-rose" />
        <p className="font-display text-2xl text-ink">Check your inbox</p>
        <p className="mt-2 text-sm text-ink-soft">{verifyMessage}</p>
        <Button asChild variant="outline" className="mt-5">
          <Link href="/login">Back to sign in</Link>
        </Button>
      </div>
    );
  }

  const bonus = settings.loyalty.enabled ? settings.loyalty.signupBonus : 0;

  return (
    <form onSubmit={submit} className="space-y-5" noValidate>
      {bonus > 0 && (
        <p className="rounded-xl bg-gold-soft/40 px-4 py-3 text-sm text-[#7a5b2c]">
          Join today and get <strong>{bonus} Ananta points</strong> — redeem them on your first order.
        </p>
      )}
      <FormError message={error} />
      <Field label="Full name" autoComplete="name" value={form.name} onChange={set("name")} error={errors.name} autoFocus />
      <Field label="Email" type="email" autoComplete="email" value={form.email} onChange={set("email")} error={errors.email} />
      <Field
        label={
          <>
            Mobile number <span className="font-normal text-muted">(optional)</span>
          </>
        }
        type="tel"
        inputMode="numeric"
        autoComplete="tel-national"
        value={form.phone}
        onChange={set("phone")}
        error={errors.phone}
        hint="Sign in with your number too"
      />
      <PasswordField label="Password" autoComplete="new-password" value={form.password} onChange={set("password")} error={errors.password} hint="At least 8 characters" />
      <Checkbox checked={marketing} onChange={(e) => setMarketing(e.target.checked)} label="Send me new launches and members-only offers" />
      <Button type="submit" block size="lg" loading={busy}>
        Create account
      </Button>
      <p className="text-center text-xs text-muted">
        By creating an account you agree to our{" "}
        <Link href="/policies/terms" className="underline underline-offset-2">
          terms
        </Link>{" "}
        and{" "}
        <Link href="/policies/privacy" className="underline underline-offset-2">
          privacy policy
        </Link>
        .
      </p>
      <p className="text-center text-sm text-muted">
        Already have an account?{" "}
        <Link href={`/login${next !== "/account" ? `?next=${encodeURIComponent(next)}` : ""}`} className="font-medium text-rose-dark underline-offset-4 hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
