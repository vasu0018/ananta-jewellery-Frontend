const inrFormatter = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
const inrFractionFormatter = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** ₹1,299 — paise only shown when present. */
export function inr(value: number | string | null | undefined) {
  const n = Number(value ?? 0);
  return Number.isInteger(n) ? inrFormatter.format(n) : inrFractionFormatter.format(n);
}

const dateFormatter = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" });
const dateTimeFormatter = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
  timeZone: "Asia/Kolkata",
});
const dayFormatter = new Intl.DateTimeFormat("en-IN", { weekday: "short", day: "numeric", month: "short", timeZone: "Asia/Kolkata" });

export const formatDate = (d: string | Date | null | undefined) => (d ? dateFormatter.format(new Date(d)) : "");
export const formatDateTime = (d: string | Date | null | undefined) => (d ? dateTimeFormatter.format(new Date(d)) : "");
export const formatDay = (d: string | Date | null | undefined) => (d ? dayFormatter.format(new Date(d)) : "");

export function compactNumber(n: number) {
  return new Intl.NumberFormat("en-IN", { notation: "compact", maximumFractionDigits: 1 }).format(n);
}
