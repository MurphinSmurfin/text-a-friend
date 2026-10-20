// shortcut: 48 countries covering most WhatsApp users, add rows as people ask
export const COUNTRIES: {
  iso: string;
  code: string;
  name: string;
  example: string;
}[] = [
  { iso: "AR", code: "54", name: "Argentina", example: "11 2345-6789" },
  { iso: "AU", code: "61", name: "Australia", example: "0412 345 678" },
  { iso: "AT", code: "43", name: "Austria", example: "0664 1234567" },
  { iso: "BD", code: "880", name: "Bangladesh", example: "01712 345678" },
  { iso: "BE", code: "32", name: "Belgium", example: "0470 12 34 56" },
  { iso: "BR", code: "55", name: "Brazil", example: "(11) 91234-5678" },
  { iso: "CA", code: "1", name: "Canada", example: "(416) 555-0123" },
  { iso: "CL", code: "56", name: "Chile", example: "9 1234 5678" },
  { iso: "CN", code: "86", name: "China", example: "138 0013 8000" },
  { iso: "CO", code: "57", name: "Colombia", example: "310 1234567" },
  { iso: "EG", code: "20", name: "Egypt", example: "0100 123 4567" },
  { iso: "FR", code: "33", name: "France", example: "06 12 34 56 78" },
  { iso: "DE", code: "49", name: "Germany", example: "0151 23456789" },
  { iso: "GH", code: "233", name: "Ghana", example: "024 123 4567" },
  { iso: "HK", code: "852", name: "Hong Kong", example: "9123 4567" },
  { iso: "IN", code: "91", name: "India", example: "98765 43210" },
  { iso: "ID", code: "62", name: "Indonesia", example: "0812-3456-7890" },
  { iso: "IE", code: "353", name: "Ireland", example: "085 123 4567" },
  { iso: "IL", code: "972", name: "Israel", example: "050-123-4567" },
  { iso: "IT", code: "39", name: "Italy", example: "312 345 6789" },
  { iso: "JP", code: "81", name: "Japan", example: "090-1234-5678" },
  { iso: "KE", code: "254", name: "Kenya", example: "0712 345678" },
  { iso: "MY", code: "60", name: "Malaysia", example: "012-345 6789" },
  { iso: "MX", code: "52", name: "Mexico", example: "55 1234 5678" },
  { iso: "MA", code: "212", name: "Morocco", example: "0612-345678" },
  { iso: "NL", code: "31", name: "Netherlands", example: "06 12345678" },
  { iso: "NZ", code: "64", name: "New Zealand", example: "021 123 4567" },
  { iso: "NG", code: "234", name: "Nigeria", example: "0803 123 4567" },
  { iso: "PK", code: "92", name: "Pakistan", example: "0301 2345678" },
  { iso: "PE", code: "51", name: "Peru", example: "912 345 678" },
  { iso: "PH", code: "63", name: "Philippines", example: "0917 123 4567" },
  { iso: "PL", code: "48", name: "Poland", example: "512 345 678" },
  { iso: "PT", code: "351", name: "Portugal", example: "912 345 678" },
  { iso: "RU", code: "7", name: "Russia", example: "912 345-67-89" },
  { iso: "SA", code: "966", name: "Saudi Arabia", example: "050 123 4567" },
  { iso: "SG", code: "65", name: "Singapore", example: "9123 4567" },
  { iso: "ZA", code: "27", name: "South Africa", example: "082 123 4567" },
  { iso: "KR", code: "82", name: "South Korea", example: "010-1234-5678" },
  { iso: "ES", code: "34", name: "Spain", example: "612 34 56 78" },
  { iso: "SE", code: "46", name: "Sweden", example: "070-123 45 67" },
  { iso: "CH", code: "41", name: "Switzerland", example: "079 123 45 67" },
  { iso: "TW", code: "886", name: "Taiwan", example: "0912 345 678" },
  { iso: "TH", code: "66", name: "Thailand", example: "081 234 5678" },
  { iso: "TR", code: "90", name: "Turkey", example: "0532 123 45 67" },
  {
    iso: "AE",
    code: "971",
    name: "United Arab Emirates",
    example: "050 123 4567",
  },
  { iso: "GB", code: "44", name: "United Kingdom", example: "07700 900123" },
  { iso: "US", code: "1", name: "United States", example: "(555) 123-4567" },
  { iso: "VN", code: "84", name: "Vietnam", example: "091 234 56 78" },
];

/** The country the browser is set to, when it is in the list. */
export function defaultCountry(locale: string): string {
  try {
    const region = new Intl.Locale(locale).maximize().region;
    const hit = COUNTRIES.find((c) => c.iso === region);
    if (hit) return hit.iso;
  } catch {
    // not a locale string
  }
  return "US";
}

/** Full international number. A number typed with + already is kept; a local one gets the code and loses its trunk 0. */
/** Sample local number for the placeholder. */
export const example = (iso: string) =>
  COUNTRIES.find((c) => c.iso === iso)?.example ?? "";

export function internationalNumber(iso: string, local: string): string {
  const digits = local.replace(/\D/g, "");
  if (local.trim().startsWith("+")) return `+${digits}`;
  const code = COUNTRIES.find((c) => c.iso === iso)?.code ?? "";
  return `+${code}${digits.replace(/^0+/, "")}`;
}
