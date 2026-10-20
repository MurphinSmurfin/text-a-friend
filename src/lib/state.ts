import { isMethod, type Method } from "./methods.ts";
import { pickLine } from "./prompts.ts";

export type Friend = {
  id: string;
  name: string;
  lastContact: string | null;
  method: Method;
  handle: string;
  birthday: string | null;
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

/** The birthday's date in a given year. Feb 29 lands on Mar 1 in other years. */
export function occurrence(birthday: string, year: number): string {
  const [, m, d] = birthday.split("-").map(Number);
  return localDate(new Date(year, m - 1, d));
}

/** Friends with a birthday in the week starting `week`, earliest first. */
export function birthdaysInWeek(
  friends: Friend[],
  week: string,
): { friend: Friend; date: string }[] {
  const [y, m, d] = week.split("-").map(Number);
  const end = localDate(new Date(y, m - 1, d + 6));
  return friends
    .flatMap((friend) => {
      const b = friend.birthday;
      if (!b) return [];
      // the week may straddle a year end, so try both years
      const date = [y, y + 1]
        .map((year) => occurrence(b, year))
        .find((x) => x >= week && x <= end);
      return date ? [{ friend, date }] : [];
    })
    .sort((a, b) => (a.date < b.date ? -1 : 1));
}

/** A birthday this week outranks everything; otherwise the least recently contacted. */
export function pickFor(
  friends: Friend[],
  now: Date,
  random = Math.random,
): Friend | null {
  const soon = birthdaysInWeek(friends, weekStart(now));
  if (soon.length === 0) return pickFriend(friends, random);
  const first = soon.filter((s) => s.date === soon[0].date);
  return first[Math.floor(random() * first.length)].friend;
}

export const BIRTHDAY_WEEK_LINES = [
  "hey {name}, isn't your birthday this week? what are you doing for it?",
  "{name}! birthday week. any plans, or do I need to make some for you?",
  "happy almost birthday {name}. let me buy you a coffee this week",
  "hey {name}, big week for you. how are you celebrating?",
];
export const BIRTHDAY_DAY_LINES = [
  "happy birthday {name}! hope today is a good one",
  "{name}! happy birthday. what are you up to today?",
  "happy birthday {name}. you're owed a coffee, name the day",
];

/** A birthday line in a birthday week, the day's line on the day, otherwise the usual opener. */
export function lineFor(
  friend: Friend,
  now: Date,
  avoid = "",
  random = Math.random,
): string {
  const hit = birthdaysInWeek([friend], weekStart(now))[0];
  if (!hit) return pickLine(avoid, random);
  const pool =
    hit.date === localDate(now) ? BIRTHDAY_DAY_LINES : BIRTHDAY_WEEK_LINES;
  const options = pool.filter((l) => l !== avoid);
  return options[Math.floor(random() * options.length)] ?? pool[0];
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
  const friend = pickFor(friends, now, random);
  return {
    ...state,
    pick: friend
      ? { friendId: friend.id, line: lineFor(friend, now, "", random), week }
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

const isDate = (v: unknown): v is string =>
  typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v);
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
    birthday: isDate(v.birthday) ? v.birthday : null,
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
