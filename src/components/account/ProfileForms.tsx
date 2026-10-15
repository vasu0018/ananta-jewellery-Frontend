"use client";

import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox, Field, FormError, PasswordField, SelectField } from "@/components/forms/Field";
import { AccountHeading } from "./AccountShell";
import { api } from "@/lib/api";
import { ApiError, errorMessage } from "@/lib/api-error";
import { passwordSchema, phoneSchema, validate, type FieldErrors } from "@/lib/validation";
import { useAuth } from "@/stores/auth";
import type { Customer } from "@/lib/types";

const toDateInput = (d: string | null) => (d ? d.slice(0, 10) : "");

const profileSchema = z.object({
  name: z.string().trim().min(2, "Enter your full name").max(80),
  phone: z.union([z.literal(""), phoneSchema]).transform((v) => v || null),
  dateOfBirth: z.string().transform((v) => v || null),
  anniversary: z.string().transform((v) => v || null),
  gender: z.string().transform((v) => v || null),
  acceptsMarketing: z.boolean(),
});

const passwordFormSchema = z
  .object({ currentPassword: z.string().min(1, "Enter your current password"), newPassword: passwordSchema, confirm: z.string() })
  .refine((v) => v.newPassword === v.confirm, { path: ["confirm"], message: "Passwords don't match" })
  .refine((v) => v.newPassword !== v.currentPassword, { path: ["newPassword"], message: "Choose a password different from your current one" });

export function ProfileView() {
  return (
    <div className="space-y-10">
      <ProfileForm />
      <PasswordForm />
    </div>
  );
}

function ProfileForm() {
  const customer = useAuth((s) => s.customer)!;
  const setCustomer = useAuth((s) => s.setCustomer);
  const [form, setForm] = useState({
    name: customer.name,
    phone: customer.phone ?? "",
    dateOfBirth: toDateInput(customer.dateOfBirth),
    anniversary: toDateInput(customer.anniversary),
    gender: customer.gender ?? "",
    acceptsMarketing: customer.acceptsMarketing,
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: "" }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = validate(profileSchema, form);
    if (parsed.errors) {
      setErrors(parsed.errors);
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const updated = await api<Customer>("/account/profile", { method: "PATCH", body: parsed.data });
      setCustomer(updated);
      toast.success("Profile updated");
    } catch (err) {
      if (err instanceof ApiError) setErrors(err.fields);
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <section>
      <AccountHeading title="Profile" description="Tell us about special dates and we'll send something sparkly your way." />
      <form onSubmit={submit} className="rounded-2xl border border-line p-5 sm:p-6" noValidate>
        <FormError message={error} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Full name" autoComplete="name" value={form.name} onChange={(e) => set("name", e.target.value)} error={errors.name} />
          <Field label="Email" value={customer.email} readOnly disabled hint="Contact us to change your email" />
          <Field
            label="Mobile number"
            type="tel"
            inputMode="numeric"
            autoComplete="tel-national"
            value={form.phone}
            onChange={(e) => set("phone", e.target.value.replace(/\D/g, "").slice(0, 10))}
            error={errors.phone}
          />
          <SelectField label="Gender" value={form.gender} onChange={(e) => set("gender", e.target.value)}>
            <option value="">Prefer not to say</option>
            <option value="female">Female</option>
            <option value="male">Male</option>
            <option value="other">Other</option>
          </SelectField>
          <Field label="Birthday" type="date" value={form.dateOfBirth} onChange={(e) => set("dateOfBirth", e.target.value)} error={errors.dateOfBirth} />
          <Field label="Anniversary" type="date" value={form.anniversary} onChange={(e) => set("anniversary", e.target.value)} error={errors.anniversary} />
        </div>
        <Checkbox
          className="mt-5"
          label="Send me new arrivals, offers and styling tips"
          checked={form.acceptsMarketing}
          onChange={(e) => set("acceptsMarketing", e.target.checked)}
        />
        <div className="mt-6 flex justify-end">
          <Button type="submit" loading={saving}>
            Save changes
          </Button>
        </div>
      </form>
    </section>
  );
}

const EMPTY_PASSWORDS = { currentPassword: "", newPassword: "", confirm: "" };

function PasswordForm() {
  const [form, setForm] = useState(EMPTY_PASSWORDS);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const set = (key: keyof typeof form, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: "" }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = validate(passwordFormSchema, form);
    if (parsed.errors) {
      setErrors(parsed.errors);
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await api("/account/password", { body: { currentPassword: parsed.data.currentPassword, newPassword: parsed.data.newPassword } });
      setForm(EMPTY_PASSWORDS);
      toast.success("Password changed. Other devices have been signed out.");
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <section>
      <AccountHeading title="Password" description="Changing your password signs you out everywhere else." />
      <form onSubmit={submit} className="rounded-2xl border border-line p-5 sm:p-6" noValidate>
        <FormError message={error} />
        <div className="grid gap-4 sm:grid-cols-2">
          <PasswordField
            label="Current password"
            autoComplete="current-password"
            value={form.currentPassword}
            onChange={(e) => set("currentPassword", e.target.value)}
            error={errors.currentPassword}
            className="sm:col-span-2"
          />
          <PasswordField
            label="New password"
            autoComplete="new-password"
            value={form.newPassword}
            onChange={(e) => set("newPassword", e.target.value)}
            error={errors.newPassword}
            hint="At least 8 characters"
          />
          <PasswordField
            label="Confirm new password"
            autoComplete="new-password"
            value={form.confirm}
            onChange={(e) => set("confirm", e.target.value)}
            error={errors.confirm}
          />
        </div>
        <div className="mt-6 flex justify-end">
          <Button type="submit" variant="outline" loading={saving}>
            Update password
          </Button>
        </div>
      </form>
    </section>
  );
}
