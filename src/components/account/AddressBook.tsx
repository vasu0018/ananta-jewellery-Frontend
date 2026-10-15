"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { MapPin, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge, EmptyState, Skeleton } from "@/components/ui/misc";
import { Sheet } from "@/components/ui/sheet";
import { Checkbox, FormError } from "@/components/forms/Field";
import { AddressFields } from "@/components/forms/AddressFields";
import { AccountHeading } from "./AccountShell";
import { api } from "@/lib/api";
import { ApiError, errorMessage } from "@/lib/api-error";
import { addressSchema, EMPTY_ADDRESS, validate, type AddressForm, type FieldErrors } from "@/lib/validation";
import { cn } from "@/lib/utils";
import type { Address } from "@/lib/types";

type AddressType = Address["type"];
const TYPES: { value: AddressType; label: string }[] = [
  { value: "HOME", label: "Home" },
  { value: "WORK", label: "Work" },
  { value: "OTHER", label: "Other" },
];

type Editing = { id: string | null; form: AddressForm; type: AddressType; isDefault: boolean };

const KEY = ["account", "addresses"];

export function AddressBook() {
  const queryClient = useQueryClient();
  const addresses = useQuery({ queryKey: KEY, queryFn: () => api<Address[]>("/account/addresses") });
  const [editing, setEditing] = useState<Editing | null>(null);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [pending, setPending] = useState<string | null>(null);

  const list = addresses.data ?? [];

  const openNew = () => {
    setErrors({});
    setFormError(null);
    setEditing({ id: null, form: EMPTY_ADDRESS, type: "HOME", isDefault: list.length === 0 });
  };

  const openEdit = (a: Address) => {
    setErrors({});
    setFormError(null);
    setEditing({
      id: a.id,
      form: { name: a.name, phone: a.phone, line1: a.line1, line2: a.line2 ?? "", landmark: a.landmark ?? "", city: a.city, state: a.state, pincode: a.pincode },
      type: a.type,
      isDefault: a.isDefault,
    });
  };

  const patchForm = (patch: Partial<AddressForm>) => {
    setEditing((e) => (e ? { ...e, form: { ...e.form, ...patch } } : e));
    setErrors((prev) => {
      const next = { ...prev };
      for (const k of Object.keys(patch)) delete next[k];
      return next;
    });
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    const parsed = validate(addressSchema, editing.form);
    if (parsed.errors) {
      setErrors(parsed.errors);
      return;
    }
    setSaving(true);
    setFormError(null);
    try {
      const body = { ...parsed.data, type: editing.type, isDefault: editing.isDefault };
      if (editing.id) await api(`/account/addresses/${editing.id}`, { method: "PATCH", body });
      else await api("/account/addresses", { body });
      toast.success(editing.id ? "Address updated" : "Address saved");
      setEditing(null);
      await queryClient.invalidateQueries({ queryKey: KEY });
    } catch (err) {
      if (err instanceof ApiError && Object.keys(err.fields).length) setErrors(err.fields);
      setFormError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const run = async (id: string, action: () => Promise<unknown>, message: string) => {
    setPending(id);
    try {
      await action();
      toast.success(message);
      await queryClient.invalidateQueries({ queryKey: KEY });
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setPending(null);
      setConfirmDelete(null);
    }
  };

  return (
    <div>
      <AccountHeading
        title="Addresses"
        description="Saved addresses appear at checkout so you can order in a tap."
        action={
          list.length > 0 && (
            <Button size="sm" onClick={openNew}>
              <Plus className="size-4" /> Add address
            </Button>
          )
        }
      />

      {addresses.isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-44" />
          <Skeleton className="h-44" />
        </div>
      ) : list.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line">
          <EmptyState
            icon={<MapPin />}
            title="No saved addresses"
            description="Add a delivery address now and checkout will be quicker next time."
            action={
              <Button onClick={openNew}>
                <Plus className="size-4" /> Add address
              </Button>
            }
          />
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {list.map((a) => (
            <li key={a.id} className={cn("flex flex-col rounded-2xl border p-5", a.isDefault ? "border-ink/70" : "border-line")} aria-busy={pending === a.id}>
              <div className="mb-3 flex items-center gap-2">
                <Badge tone="cream" className="ring-1 ring-line">
                  {TYPES.find((t) => t.value === a.type)?.label ?? a.type}
                </Badge>
                {a.isDefault && <Badge tone="success">Default</Badge>}
              </div>
              <address className="flex-1 text-sm not-italic leading-relaxed text-ink-soft">
                <span className="font-medium text-ink">{a.name}</span>
                <br />
                {a.line1}
                {a.line2 && `, ${a.line2}`}
                {a.landmark && (
                  <>
                    <br />
                    Near {a.landmark}
                  </>
                )}
                <br />
                {a.city}, {a.state} {a.pincode}
                <br />
                {a.phone}
              </address>
              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-line pt-3 text-[13px]">
                <button type="button" onClick={() => openEdit(a)} className="inline-flex items-center gap-1.5 font-medium text-ink hover:text-rose-dark">
                  <Pencil className="size-3.5" /> Edit
                </button>
                {confirmDelete === a.id ? (
                  <span className="inline-flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => void run(a.id, () => api(`/account/addresses/${a.id}`, { method: "DELETE" }), "Address removed")}
                      className="font-medium text-danger"
                      disabled={pending === a.id}
                    >
                      Confirm delete
                    </button>
                    <button type="button" onClick={() => setConfirmDelete(null)} className="text-muted hover:text-ink">
                      Keep
                    </button>
                  </span>
                ) : (
                  <button type="button" onClick={() => setConfirmDelete(a.id)} className="inline-flex items-center gap-1.5 text-muted hover:text-danger">
                    <Trash2 className="size-3.5" /> Delete
                  </button>
                )}
                {!a.isDefault && (
                  <button
                    type="button"
                    onClick={() => void run(a.id, () => api(`/account/addresses/${a.id}`, { method: "PATCH", body: { isDefault: true } }), "Default address updated")}
                    className="ml-auto text-muted hover:text-ink"
                    disabled={pending === a.id}
                  >
                    Set as default
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      <Sheet
        open={editing !== null}
        onOpenChange={(open) => !open && !saving && setEditing(null)}
        title={editing?.id ? "Edit address" : "New address"}
        className="max-w-[520px]"
      >
        {editing && (
          <form id="address-form" onSubmit={save} className="space-y-5 pt-2" noValidate>
            <FormError message={formError} />
            <AddressFields value={editing.form} onChange={patchForm} errors={errors} />
            <fieldset>
              <legend className="mb-2 text-[13px] font-medium text-ink">Save as</legend>
              <div className="flex gap-2">
                {TYPES.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    aria-pressed={editing.type === t.value}
                    onClick={() => setEditing({ ...editing, type: t.value })}
                    className={cn(
                      "rounded-full border px-4 py-1.5 text-sm transition",
                      editing.type === t.value ? "border-ink bg-ink text-white" : "border-line text-ink-soft hover:border-ink",
                    )}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </fieldset>
            <Checkbox
              label="Make this my default address"
              checked={editing.isDefault}
              disabled={list.some((a) => a.id === editing.id && a.isDefault)}
              onChange={(e) => setEditing({ ...editing, isDefault: e.target.checked })}
            />
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="ghost" onClick={() => setEditing(null)} disabled={saving}>
                Cancel
              </Button>
              <Button type="submit" className="flex-1" loading={saving}>
                {editing.id ? "Save changes" : "Save address"}
              </Button>
            </div>
          </form>
        )}
      </Sheet>
    </div>
  );
}
