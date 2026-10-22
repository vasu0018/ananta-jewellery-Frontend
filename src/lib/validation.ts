import { z } from "zod";
import { storedPhoneError } from "./phone";

/** Client-side mirrors of the API's validation, so shoppers see errors before submitting. */

export const phoneSchema = z
  .string()
  .trim()
  .superRefine((value, ctx) => {
    const message = storedPhoneError(value);
    if (message) ctx.addIssue({ code: "custom", message });
  });
export const emailSchema = z.string().trim().toLowerCase().email("Enter a valid email address");
export const passwordSchema = z.string().min(8, "Use at least 8 characters").max(100);
export const pincodeSchema = z.string().trim().regex(/^\d{6}$/, "Enter a valid 6-digit pincode");

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((v) => v || null);

export const addressSchema = z.object({
  name: z.string().trim().min(2, "Enter the recipient's full name").max(80),
  phone: phoneSchema,
  line1: z.string().trim().min(3, "Enter house / flat number and street").max(200),
  line2: optionalText(200),
  landmark: optionalText(120),
  city: z.string().trim().min(2, "Enter the city").max(80),
  state: z.string().trim().min(2, "Select a state"),
  pincode: pincodeSchema,
});

export type AddressForm = z.input<typeof addressSchema>;

export const EMPTY_ADDRESS: AddressForm = { name: "", phone: "", line1: "", line2: "", landmark: "", city: "", state: "", pincode: "" };

export type FieldErrors = Record<string, string>;

/** First message per top-level field. */
export function fieldErrors(error: z.ZodError): FieldErrors {
  const out: FieldErrors = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

/** Validate `data`; returns the parsed value or the field errors. */
export function validate<S extends z.ZodType>(schema: S, data: unknown): { data: z.output<S>; errors: null } | { data: null; errors: FieldErrors } {
  const r = schema.safeParse(data);
  return r.success ? { data: r.data, errors: null } : { data: null, errors: fieldErrors(r.error) };
}
