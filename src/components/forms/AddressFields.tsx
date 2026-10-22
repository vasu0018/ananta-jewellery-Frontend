"use client";

import { useEffect, useState } from "react";
import { Field, SelectField } from "./Field";
import { PhoneField } from "./PhoneField";
import { INDIAN_STATES } from "@/lib/india";
import { splitPhone, toStoredPhone } from "@/lib/phone";
import type { AddressForm, FieldErrors } from "@/lib/validation";

const digits = (v: string, max: number) => v.replace(/\D/g, "").slice(0, max);

/** Controlled Indian address form (recipient, phone, pincode, city, state, lines). */
export function AddressFields({
  value,
  onChange,
  errors = {},
}: {
  value: AddressForm;
  onChange: (patch: Partial<AddressForm>) => void;
  errors?: FieldErrors;
}) {
  const [iso, setIso] = useState(() => splitPhone(value.phone).iso);
  useEffect(() => {
    if (value.phone) setIso(splitPhone(value.phone).iso);
  }, [value.phone]);
  const national = value.phone ? splitPhone(value.phone).national : "";

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Field label="Full name" autoComplete="name" value={value.name} onChange={(e) => onChange({ name: e.target.value })} error={errors.name} />
      <PhoneField
        iso={iso}
        national={national}
        onChange={({ iso: nextIso, national: nextNational }) => {
          setIso(nextIso);
          onChange({ phone: nextNational ? toStoredPhone(nextIso, nextNational) : "" });
        }}
        error={errors.phone}
        hint="For delivery updates"
      />
      <Field
        label="House / flat no., building, street"
        autoComplete="address-line1"
        value={value.line1}
        onChange={(e) => onChange({ line1: e.target.value })}
        error={errors.line1}
        className="sm:col-span-2"
      />
      <Field
        label={
          <>
            Area, locality <span className="font-normal text-muted">(optional)</span>
          </>
        }
        autoComplete="address-line2"
        value={value.line2 ?? ""}
        onChange={(e) => onChange({ line2: e.target.value })}
        error={errors.line2}
      />
      <Field
        label={
          <>
            Landmark <span className="font-normal text-muted">(optional)</span>
          </>
        }
        value={value.landmark ?? ""}
        onChange={(e) => onChange({ landmark: e.target.value })}
        error={errors.landmark}
      />
      <Field
        label="Pincode"
        inputMode="numeric"
        autoComplete="postal-code"
        value={value.pincode}
        onChange={(e) => onChange({ pincode: digits(e.target.value, 6) })}
        error={errors.pincode}
      />
      <Field label="City" autoComplete="address-level2" value={value.city} onChange={(e) => onChange({ city: e.target.value })} error={errors.city} />
      <SelectField
        label="State"
        autoComplete="address-level1"
        value={value.state}
        onChange={(e) => onChange({ state: e.target.value })}
        error={errors.state}
        className="sm:col-span-2"
      >
        <option value="" disabled>
          Select state
        </option>
        {INDIAN_STATES.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </SelectField>
    </div>
  );
}
