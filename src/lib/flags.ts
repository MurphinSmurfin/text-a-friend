/** Edit and push to change the schedule. Local dates, inclusive. */
export const YEAR_CARD_WINDOW = { from: "2026-12-15", to: "2027-01-15" };

export type Override = "on" | "off" | null;

/** "on" or "off" from a stored or query value; anything else means no override. */
export const parseOverride = (v: string | null): Override =>
  v === "on" || v === "off" ? v : null;

/** The card shows inside the window unless an override says otherwise. */
export function yearCardOn(today: string, override: Override): boolean {
  if (override) return override === "on";
  return today >= YEAR_CARD_WINDOW.from && today <= YEAR_CARD_WINDOW.to;
}
