/** Past 12 slices the wheel prints initials, and "You" has to stay readable. */
const MAX = 12;

export type Spin = { n: number; i: number };

/** `#spin-<slices>-<winner>`: two small numbers and nothing else, so a spin link can never carry a name. */
export function spinHash(count: number, index: number): string {
  const n = Math.min(Math.max(count, 1), MAX);
  return `#spin-${n}-${Math.min(Math.max(index, 0), n - 1)}`;
}

/** Null for any hash that is not a spin link in range. */
export function parseSpin(hash: string): Spin | null {
  const m = /^#spin-(\d{1,2})-(\d{1,2})$/.exec(hash);
  if (!m) return null;
  const n = Number(m[1]);
  const i = Number(m[2]);
  return n >= 1 && n <= MAX && i < n ? { n, i } : null;
}

/** The follow-up text. The link goes last because chat apps only preview a trailing link. */
export const revealText = (url: string) =>
  `ok confession: I keep a wheel of people I refuse to lose touch with, and this week it landed on you. watch: ${url}`;

/** Slices for a visitor with no list yet: one word that fits a slice, and the prompt shown when it wins. */
export const KINDS = [
  { label: "Roommate", prompt: "An old roommate" },
  { label: "Cousin", prompt: "A cousin you actually like" },
  { label: "Coworker", prompt: "Someone from an old job" },
  { label: "Classmate", prompt: "Someone from school" },
  { label: "Long-lost", prompt: "The one who moved away" },
  { label: "Teammate", prompt: "An old teammate" },
  { label: "Neighbour", prompt: "Someone from the old neighbourhood" },
  { label: "Mentor", prompt: "Someone who taught you something" },
] as const;

/** A random slice out of `n` that is never the one the wheel is already on. */
export function nextKind(
  current: number | null,
  n: number,
  random = Math.random,
): number {
  if (current === null) return Math.floor(random() * n);
  const k = Math.floor(random() * (n - 1));
  return k >= current ? k + 1 : k;
}
