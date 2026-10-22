"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Field, FormError, SelectField, TextareaField } from "./Field";
import { PhoneField } from "./PhoneField";
import { api } from "@/lib/api";
import { ApiError, errorMessage } from "@/lib/api-error";
import { splitPhone, storedPhoneError, toStoredPhone } from "@/lib/phone";
import { emailSchema, validate, type FieldErrors } from "@/lib/validation";
import { useAuth } from "@/stores/auth";

const TOPICS = ["Order status", "Returns & exchanges", "Product question", "Bulk / corporate gifting", "Feedback", "Something else"];

const schema = z.object({
  name: z.string().trim().min(2, "Enter your name").max(80),
  email: emailSchema,
  phone: z
    .string()
    .trim()
    .max(24)
    .superRefine((value, ctx) => {
      if (!value) return;
      const message = storedPhoneError(value);
      if (message) ctx.addIssue({ code: "custom", message });
    }),
  subject: z.string().max(120),
  message: z.string().trim().min(10, "Tell us a little more (at least 10 characters)").max(3000),
});

type Customer = ReturnType<typeof useAuth.getState>["customer"];

export function ContactForm({ orderNumber }: { orderNumber?: string }) {
  const customer = useAuth((s) => s.customer);
  return <ContactFormInner key={customer?.id ?? "guest"} customer={customer} orderNumber={orderNumber} />;
}

function ContactFormInner({ customer, orderNumber }: { customer: Customer; orderNumber?: string }) {
  const [phoneIso, setPhoneIso] = useState(() => splitPhone(customer?.phone).iso);
  const [form, setForm] = useState({
    name: customer?.name ?? "",
    email: customer?.email ?? "",
    phone: customer?.phone ?? "",
    topic: orderNumber ? "Order status" : "",
    message: orderNumber ? `Order ${orderNumber}: ` : "",
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState<string | null>(null);

  const set = (key: keyof typeof form, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: "" }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const subject = [form.topic, orderNumber].filter(Boolean).join(" · ");
    const parsed = validate(schema, { ...form, subject });
    if (parsed.errors) {
      setErrors(parsed.errors);
      return;
    }
    setSending(true);
    setError(null);
    try {
      const { phone, subject: subj, ...rest } = parsed.data;
      const res = await api<{ message: string }>("/content/contact", { body: { ...rest, phone: phone || undefined, subject: subj || undefined } });
      setSent(res.message);
    } catch (err) {
      if (err instanceof ApiError) setErrors(err.fields);
      setError(errorMessage(err));
    } finally {
      setSending(false);
    }
  };

  if (sent) {
    return (
      <div className="flex flex-col items-center rounded-3xl bg-cream px-6 py-14 text-center" role="status">
        <CheckCircle2 className="size-10 text-success" />
        <p className="mt-4 font-display text-2xl text-ink">Message sent</p>
        <p className="mt-2 max-w-sm text-sm text-muted">{sent}</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      <FormError message={error} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Your name" autoComplete="name" value={form.name} onChange={(e) => set("name", e.target.value)} error={errors.name} />
        <Field label="Email" type="email" autoComplete="email" value={form.email} onChange={(e) => set("email", e.target.value)} error={errors.email} />
        <PhoneField
          label={
            <>
              Mobile <span className="font-normal text-muted">(optional)</span>
            </>
          }
          iso={phoneIso}
          national={form.phone ? splitPhone(form.phone).national : ""}
          onChange={({ iso, national }) => {
            setPhoneIso(iso);
            set("phone", national ? toStoredPhone(iso, national) : "");
          }}
          error={errors.phone}
        />
        <SelectField label="Topic" value={form.topic} onChange={(e) => set("topic", e.target.value)}>
          <option value="">Choose a topic</option>
          {TOPICS.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </SelectField>
      </div>
      <TextareaField label="Message" rows={6} maxLength={3000} value={form.message} onChange={(e) => set("message", e.target.value)} error={errors.message} />
      <Button type="submit" size="lg" loading={sending} className="w-full sm:w-auto">
        Send message
      </Button>
    </form>
  );
}
