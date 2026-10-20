import { localDate, occurrence, type Friend } from "./state.ts";

/** Weeks of a month, Monday first, null for cells outside the month. */
export function monthGrid(year: number, month: number): (string | null)[][] {
  const lead = (new Date(year, month - 1, 1).getDay() + 6) % 7;
  const days = new Date(year, month, 0).getDate();
  const cells: (string | null)[] = [
    ...Array<null>(lead).fill(null),
    ...Array.from({ length: days }, (_, i) =>
      localDate(new Date(year, month - 1, i + 1)),
    ),
  ];
  while (cells.length % 7) cells.push(null);
  const weeks: (string | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

const between = (from: string, to: string) =>
  Math.round((Date.parse(to) - Date.parse(from)) / 86_400_000);

export type Birthday = { friend: Friend; date: string; days: number };

/** Birthdays in the next half year, soonest first. `days` counts up to it. */
export function upcoming(friends: Friend[], today: string): Birthday[] {
  const year = Number(today.slice(0, 4));
  return friends
    .flatMap((friend) => {
      const b = friend.birthday;
      if (!b) return [];
      const date = [year, year + 1]
        .map((y) => occurrence(b, y))
        .find((x) => x >= today);
      const days = date ? between(today, date) : 999;
      return date && days <= 183 ? [{ friend, date, days }] : [];
    })
    .sort((a, b) => a.days - b.days);
}

/** Birthdays in the last half year, most recent first. `days` counts since it. */
export function past(friends: Friend[], today: string): Birthday[] {
  const year = Number(today.slice(0, 4));
  return friends
    .flatMap((friend) => {
      const b = friend.birthday;
      if (!b) return [];
      const date = [year, year - 1]
        .map((y) => occurrence(b, y))
        .find((x) => x < today);
      const days = date ? between(date, today) : 999;
      return date && days <= 182 ? [{ friend, date, days }] : [];
    })
    .sort((a, b) => a.days - b.days);
}

/** A local date formatted for people, e.g. { weekday: "short" } gives "Sat". */
export function fmt(date: string, options: Intl.DateTimeFormatOptions): string {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, options);
}
