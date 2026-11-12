import { daysSince, heat, localDate, pickFriend, type State } from "./state.ts";

export type YearStats = {
  year: number;
  texts: number;
  friends: number;
  bestStreak: number;
  top: { name: string; count: number } | null;
  neglected: string | null;
};

const nextWeek = (w: string) => {
  const [y, m, d] = w.split("-").map(Number);
  return localDate(new Date(y, m - 1, d + 7));
};

/** Longest run of consecutive weeks. */
export function longestRun(weeks: string[]): number {
  let best = 0;
  let run = 0;
  let prev = "";
  for (const w of [...new Set(weeks)].sort()) {
    run = prev && nextWeek(prev) === w ? run + 1 : 1;
    best = Math.max(best, run);
    prev = w;
  }
  return best;
}

/** The card stays up until 15 January (flags.ts), so the first half of January still recaps last year. */
const RECAP_DAYS = 15;

/** The numbers for the shareable year card. Removed friends still count as texts, not as names. */
export function yearStats(state: State, now: Date): YearStats {
  const year = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() - RECAP_DAYS,
  ).getFullYear();
  const inYear = (date: string) => date.startsWith(`${year}-`);
  const entries = state.log.filter((e) => inYear(e.date));
  const counts = new Map<string, number>();
  for (const e of entries)
    if (e.friendId) counts.set(e.friendId, (counts.get(e.friendId) ?? 0) + 1);
  let top: YearStats["top"] = null;
  for (const [id, count] of counts) {
    const friend = state.friends.find((f) => f.id === id);
    if (friend && (!top || count > top.count))
      top = { name: friend.name, count };
  }
  const oldest = pickFriend(state.friends, () => 0);
  const stale =
    oldest && heat(daysSince(oldest.lastContact, localDate(now))) === "stale";
  return {
    year,
    texts: entries.length,
    friends: counts.size,
    bestStreak: longestRun(state.weeks.filter(inYear)),
    top,
    neglected: stale ? oldest.name : null,
  };
}

/** The big and small text of each row on the card. Without `names` no friend is named, so the default image is safe to post anywhere. */
export function cardRows(stats: YearStats, names: boolean): [string, string][] {
  const rows: [string, string][] = [
    [String(stats.texts), stats.texts === 1 ? "text sent" : "texts sent"],
    [
      String(stats.friends),
      stats.friends === 1 ? "friend reached" : "friends reached",
    ],
    [
      String(stats.bestStreak),
      stats.bestStreak === 1
        ? "week, best streak"
        : "weeks in a row, best streak",
    ],
  ];
  if (names && stats.top)
    rows.push([
      stats.top.name,
      `heard from you most, ${stats.top.count === 1 ? "once" : `${stats.top.count} times`}`,
    ]);
  if (stats.neglected)
    rows.push([
      names ? stats.neglected : "Someone",
      "is still waiting for a text",
    ]);
  return rows;
}
