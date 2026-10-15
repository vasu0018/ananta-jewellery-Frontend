"use client";

import { useId, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

type BaseProps = { label: React.ReactNode; error?: string; hint?: React.ReactNode; className?: string };

/** Labelled input with inline error; extra props go to the <input>. */
export function Field({ label, error, hint, className, id, ...input }: BaseProps & React.InputHTMLAttributes<HTMLInputElement>) {
  const auto = useId();
  const fieldId = id ?? auto;
  return (
    <div className={className}>
      <label htmlFor={fieldId} className="label">
        {label}
      </label>
      <input
        id={fieldId}
        aria-invalid={!!error}
        aria-describedby={error ? `${fieldId}-err` : hint ? `${fieldId}-hint` : undefined}
        {...input}
        className={cn("field", input.readOnly && "bg-cream")}
      />
      <FieldMessage id={fieldId} error={error} hint={hint} />
    </div>
  );
}

export function SelectField({ label, error, hint, className, id, children, ...select }: BaseProps & React.SelectHTMLAttributes<HTMLSelectElement>) {
  const auto = useId();
  const fieldId = id ?? auto;
  return (
    <div className={className}>
      <label htmlFor={fieldId} className="label">
        {label}
      </label>
      <select id={fieldId} aria-invalid={!!error} aria-describedby={error ? `${fieldId}-err` : undefined} {...select} className="field">
        {children}
      </select>
      <FieldMessage id={fieldId} error={error} hint={hint} />
    </div>
  );
}

export function TextareaField({ label, error, hint, className, id, ...textarea }: BaseProps & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const auto = useId();
  const fieldId = id ?? auto;
  return (
    <div className={className}>
      <label htmlFor={fieldId} className="label">
        {label}
      </label>
      <textarea id={fieldId} aria-invalid={!!error} aria-describedby={error ? `${fieldId}-err` : undefined} {...textarea} className="field" />
      <FieldMessage id={fieldId} error={error} hint={hint} />
    </div>
  );
}

export function PasswordField({ label, error, hint, className, id, ...input }: BaseProps & Omit<React.InputHTMLAttributes<HTMLInputElement>, "type">) {
  const auto = useId();
  const fieldId = id ?? auto;
  const [show, setShow] = useState(false);
  return (
    <div className={className}>
      <label htmlFor={fieldId} className="label">
        {label}
      </label>
      <div className="relative">
        <input id={fieldId} type={show ? "text" : "password"} aria-invalid={!!error} aria-describedby={error ? `${fieldId}-err` : undefined} {...input} className="field pr-12" />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="absolute inset-y-0 right-0 grid w-12 place-items-center text-muted hover:text-ink"
          aria-label={show ? "Hide password" : "Show password"}
        >
          {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </div>
      <FieldMessage id={fieldId} error={error} hint={hint} />
    </div>
  );
}

function FieldMessage({ id, error, hint }: { id: string; error?: string; hint?: React.ReactNode }) {
  if (error)
    return (
      <p id={`${id}-err`} className="mt-1.5 text-xs text-danger">
        {error}
      </p>
    );
  if (hint)
    return (
      <p id={`${id}-hint`} className="mt-1.5 text-xs text-muted">
        {hint}
      </p>
    );
  return null;
}

export function Checkbox({ label, className, ...input }: { label: React.ReactNode; className?: string } & Omit<React.InputHTMLAttributes<HTMLInputElement>, "type">) {
  return (
    <label className={cn("flex cursor-pointer items-start gap-2.5 text-sm text-ink-soft", className)}>
      <input type="checkbox" {...input} className="mt-0.5 size-4 shrink-0 cursor-pointer rounded accent-ink" />
      <span>{label}</span>
    </label>
  );
}

export function FormError({ message }: { message: string | null | undefined }) {
  if (!message) return null;
  return (
    <p role="alert" className="rounded-xl bg-blush px-4 py-3 text-sm text-rose-dark">
      {message}
    </p>
  );
}
