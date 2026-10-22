/** Dial codes and the national-number lengths we accept for each country. */

export type DialCountry = {
  iso: string;
  name: string;
  dial: string;
  lengths: number[];
  /** Extra rule on the national number. India mobiles start with 6–9. */
  pattern?: RegExp;
};

export const COUNTRIES: DialCountry[] = [
  { iso: "IN", name: "India", dial: "91", lengths: [10], pattern: /^[6-9]\d{9}$/ },
  { iso: "AE", name: "United Arab Emirates", dial: "971", lengths: [9] },
  { iso: "SA", name: "Saudi Arabia", dial: "966", lengths: [9] },
  { iso: "QA", name: "Qatar", dial: "974", lengths: [8] },
  { iso: "KW", name: "Kuwait", dial: "965", lengths: [8] },
  { iso: "OM", name: "Oman", dial: "968", lengths: [8] },
  { iso: "BH", name: "Bahrain", dial: "973", lengths: [8] },
  { iso: "US", name: "United States", dial: "1", lengths: [10] },
  { iso: "CA", name: "Canada", dial: "1", lengths: [10] },
  { iso: "GB", name: "United Kingdom", dial: "44", lengths: [10] },
  { iso: "SG", name: "Singapore", dial: "65", lengths: [8] },
  { iso: "MY", name: "Malaysia", dial: "60", lengths: [9, 10] },
  { iso: "AU", name: "Australia", dial: "61", lengths: [9] },
  { iso: "NZ", name: "New Zealand", dial: "64", lengths: [8, 9, 10] },
  { iso: "NP", name: "Nepal", dial: "977", lengths: [10] },
  { iso: "BD", name: "Bangladesh", dial: "880", lengths: [10] },
  { iso: "LK", name: "Sri Lanka", dial: "94", lengths: [9] },
  { iso: "PK", name: "Pakistan", dial: "92", lengths: [10] },
  { iso: "TH", name: "Thailand", dial: "66", lengths: [9] },
  { iso: "ID", name: "Indonesia", dial: "62", lengths: [9, 10, 11, 12] },
  { iso: "PH", name: "Philippines", dial: "63", lengths: [10] },
  { iso: "JP", name: "Japan", dial: "81", lengths: [10] },
  { iso: "KR", name: "South Korea", dial: "82", lengths: [9, 10] },
  { iso: "CN", name: "China", dial: "86", lengths: [11] },
  { iso: "HK", name: "Hong Kong", dial: "852", lengths: [8] },
  { iso: "DE", name: "Germany", dial: "49", lengths: [10, 11] },
  { iso: "FR", name: "France", dial: "33", lengths: [9] },
  { iso: "IT", name: "Italy", dial: "39", lengths: [9, 10] },
  { iso: "ES", name: "Spain", dial: "34", lengths: [9] },
  { iso: "NL", name: "Netherlands", dial: "31", lengths: [9] },
  { iso: "IE", name: "Ireland", dial: "353", lengths: [9] },
  { iso: "CH", name: "Switzerland", dial: "41", lengths: [9] },
  { iso: "SE", name: "Sweden", dial: "46", lengths: [9] },
  { iso: "NO", name: "Norway", dial: "47", lengths: [8] },
  { iso: "DK", name: "Denmark", dial: "45", lengths: [8] },
  { iso: "BE", name: "Belgium", dial: "32", lengths: [9] },
  { iso: "AT", name: "Austria", dial: "43", lengths: [10, 11] },
  { iso: "PT", name: "Portugal", dial: "351", lengths: [9] },
  { iso: "ZA", name: "South Africa", dial: "27", lengths: [9] },
  { iso: "KE", name: "Kenya", dial: "254", lengths: [9] },
  { iso: "NG", name: "Nigeria", dial: "234", lengths: [10] },
  { iso: "EG", name: "Egypt", dial: "20", lengths: [10] },
  { iso: "TR", name: "Turkey", dial: "90", lengths: [10] },
  { iso: "BR", name: "Brazil", dial: "55", lengths: [10, 11] },
  { iso: "MX", name: "Mexico", dial: "52", lengths: [10] },
];

const byIso = new Map(COUNTRIES.map((c) => [c.iso, c]));

export function countryByIso(iso: string) {
  return byIso.get(iso) ?? COUNTRIES[0];
}

export function flagEmoji(iso: string) {
  return iso.toUpperCase().replace(/./g, (c) => String.fromCodePoint(127397 + c.charCodeAt(0)));
}

export function maxNationalLength(iso: string) {
  return Math.max(...countryByIso(iso).lengths);
}

function lengthLabel(lengths: number[]) {
  if (lengths.length === 1) return `${lengths[0]} digits`;
  if (lengths.length === 2) return `${lengths[0]} or ${lengths[1]} digits`;
  return `${lengths[0]}–${lengths[lengths.length - 1]} digits`;
}

/** Why this national number is not valid, or null when it is. */
export function phoneError(iso: string, national: string): string | null {
  const country = countryByIso(iso);
  if (!national) return "Enter your mobile number";
  if (!/^\d+$/.test(national)) return "Use digits only";
  const expect = lengthLabel(country.lengths);
  if (!country.lengths.includes(national.length)) return `${country.name} numbers are ${expect}`;
  if (country.pattern && !country.pattern.test(national)) return "Enter a valid Indian mobile number starting with 6, 7, 8 or 9";
  return null;
}

export function cleanNational(iso: string, raw: string) {
  const digits = raw.replace(/\D/g, "").replace(/^0+/, "");
  return digits.slice(0, maxNationalLength(iso));
}

/** India stays as 10 digits so existing accounts still sign in. Other countries are stored as +<dial><number>. */
export function toStoredPhone(iso: string, national: string) {
  const country = countryByIso(iso);
  if (country.iso === "IN") return national;
  return `+${country.dial}${national}`;
}

/** Split a stored phone back into a country and the national digits. Incomplete numbers keep their dial code. */
export function splitPhone(stored: string | null | undefined): { iso: string; national: string } {
  const raw = (stored ?? "").trim();
  if (!raw) return { iso: "IN", national: "" };
  if (!raw.startsWith("+")) return { iso: "IN", national: raw.replace(/\D/g, "").slice(0, 10) };
  const digits = raw.replace(/\D/g, "");
  const match = [...COUNTRIES].sort((a, b) => b.dial.length - a.dial.length).find((c) => digits.startsWith(c.dial));
  if (!match) return { iso: "IN", national: digits.slice(0, 10) };
  return { iso: match.iso, national: digits.slice(match.dial.length).slice(0, Math.max(...match.lengths)) };
}

export function formatPhone(stored: string | null | undefined) {
  if (!stored) return "";
  const { iso, national } = splitPhone(stored);
  if (!national) return stored;
  return `+${countryByIso(iso).dial} ${national}`;
}

/** Accept a legacy Indian number or a +dial number whose length matches that country. */
export function storedPhoneError(value: string): string | null {
  const v = value.trim();
  if (!v) return "Enter your mobile number";
  if (/^\+91[6-9]\d{9}$/.test(v) || /^[6-9]\d{9}$/.test(v)) return null;
  if (v.startsWith("+")) {
    const { iso, national } = splitPhone(v);
    return phoneError(iso, national);
  }
  if (/^\d+$/.test(v)) return phoneError("IN", v);
  return "Enter a valid mobile number";
}
