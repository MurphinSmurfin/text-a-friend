import { isMethod, type Method } from "./methods.ts";
import { pickLine } from "./prompts.ts";

export type Friend = {
  id: string;
  name: string;
  lastContact: string | null;
  method: Method;
  handle: string;
};
export type Pick = { friendId: string; line: string; week: string };
export type Entry = { date: string; friendId: string };
export type State = {
  friends: Friend[];
  pick: Pick | null;
  weeks: string[];
  log: Entry[];
};

export const EMPTY: State = { friends: [], pick: null, weeks: [], log: [] };

export const fill = (line: string, name: string) =>
  line.replaceAll("{name}", name);

/** Local calendar date as YYYY-MM-DD. */
export function localDate(d: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

/** Monday of the week containing `now`, as a local date. */
export function weekStart(now: Date): string {
  const d = new Date(now);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return localDate(d);
}

/** Local midnight at the start of next week. */
export function nextMonday(now: Date): Date {
  const [y, m, d] = weekStart(now).split("-").map(Number);
  return new Date(y, m - 1, d + 7);
}

/** "2d 05:13:44", or "05:13:44" inside the last day. Never below zero. */
export function countdown(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const p = (n: number) => String(n).padStart(2, "0");
  const days = Math.floor(total / 86_400);
  const clock = `${p(Math.floor((total % 86_400) / 3600))}:${p(Math.floor((total % 3600) / 60))}:${p(total % 60)}`;
  return days ? `${days}d ${clock}` : clock;
}

/** Least recently contacted friend, never-contacted first, ties broken at random. */
export function pickFriend(
  friends: Friend[],
  random = Math.random,
): Friend | null {
  if (friends.length === 0) return null;
  // '' sorts before any date, so "never" wins
  const key = (f: Friend) => f.lastContact ?? "";
  const oldest = friends.reduce((a, b) => (key(b) < key(a) ? b : a));
  const ties = friends.filter((f) => key(f) === key(oldest));
  return ties[Math.floor(random() * ties.length)];
}

/** Keeps this week's pick if it is still valid, otherwise picks fresh. */
export function ensurePick(
  state: State,
  now: Date,
  random = Math.random,
): State {
  const week = weekStart(now);
  const { pick, friends } = state;
  if (pick && pick.week === week && friends.some((f) => f.id === pick.friendId))
    return state;
  const friend = pickFriend(friends, random);
  return {
    ...state,
    pick: friend
      ? { friendId: friend.id, line: pickLine("", random), week }
      : null,
  };
}

/** Consecutive weeks with a reach-out, counting back from this week or, if none yet, last week. */
export function streak(weeks: string[], now: Date): number {
  const done = new Set(weeks);
  const d = new Date(now);
  if (!done.has(weekStart(d))) d.setDate(d.getDate() - 7);
  let n = 0;
  while (done.has(weekStart(d))) {
    n++;
    d.setDate(d.getDate() - 7);
  }
  return n;
}

/** Whole days between two local dates, or null for never or garbage. */
export function daysSince(date: string | null, today: string): number | null {
  if (!date) return null;
  const days = Math.round((Date.parse(today) - Date.parse(date)) / 86_400_000);
  return Number.isNaN(days) ? null : days;
}

export function ago(date: string | null, today: string): string {
  const days = daysSince(date, today);
  if (days === null) return "never";
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 7) return `${days} days ago`;
  const weeks = Math.floor(days / 7);
  return weeks === 1 ? "1 week ago" : `${weeks} weeks ago`;
}

export type Heat = "fresh" | "warm" | "stale";
export const heat = (days: number | null): Heat =>
  days === null || days >= 42 ? "stale" : days >= 14 ? "warm" : "fresh";

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null;

/** Accepts the v1 shape too, which had no method, handle or weeks. */
function toFriend(v: unknown): Friend | null {
  if (!isRecord(v) || typeof v.id !== "string" || typeof v.name !== "string")
    return null;
  if (v.lastContact !== null && typeof v.lastContact !== "string") return null;
  return {
    id: v.id,
    name: v.name,
    lastContact: v.lastContact,
    method: isMethod(v.method) ? v.method : "share",
    // a handle only means something for a method we still support
    handle: isMethod(v.method) && typeof v.handle === "string" ? v.handle : "",
  };
}
const isEntry = (v: unknown): v is Entry =>
  isRecord(v) && typeof v.date === "string" && typeof v.friendId === "string";
const isPick = (v: unknown): v is Pick =>
  isRecord(v) &&
  typeof v.friendId === "string" &&
  typeof v.line === "string" &&
  typeof v.week === "string";

/** Reads saved state. Malformed friends are dropped, anything worse falls back to empty. */
export function loadState(raw: string | null): State {
  if (!raw) return EMPTY;
  try {
    const v: unknown = JSON.parse(raw);
    if (!isRecord(v) || !Array.isArray(v.friends)) return EMPTY;
    return {
      friends: v.friends.flatMap((f: unknown) => toFriend(f) ?? []),
      pick: isPick(v.pick) ? v.pick : null,
      weeks: Array.isArray(v.weeks)
        ? v.weeks.filter((w: unknown) => typeof w === "string")
        : [],
      log: Array.isArray(v.log) ? v.log.filter(isEntry) : [],
    };
  } catch {
    return EMPTY;
  }
}
