/** SVG path for slice i of n on a unit circle, starting at 12 o'clock, clockwise. */
export function slicePath(i: number, n: number): string {
  if (n === 1) return "M0,-1 A1,1 0 1,1 0,1 A1,1 0 1,1 0,-1";
  const point = (a: number) =>
    `${+Math.sin(a).toFixed(4)},${+(-Math.cos(a)).toFixed(4)}`;
  const a0 = (i / n) * 2 * Math.PI;
  const a1 = ((i + 1) / n) * 2 * Math.PI;
  return `M0,0 L${point(a0)} A1,1 0 0,1 ${point(a1)} Z`;
}

/** Angle in degrees from 12 o'clock to the middle of slice i. */
export const sliceCenter = (i: number, n: number) => ((i + 0.5) / n) * 360;

/** Rotation that lands slice i under a pointer at 12 o'clock, at least `turns` full spins past `from`. */
export function landing(i: number, n: number, from: number, turns = 4): number {
  const base = from + turns * 360;
  const target = -sliceCenter(i, n);
  return base + ((((target - base) % 360) + 360) % 360);
}

/** Hue for the friend at position i. Golden-angle steps keep neighbours distinct and the list matching the wheel. */
export const hue = (i: number) => Math.round((i * 137.508) % 360);

/** What fits on a slice. shortcut: initials past 12 friends, upgrade to a scrolling list if people want more. */
export function label(name: string, n: number): string {
  const words = name.trim().split(/\s+/);
  if (n <= 12) return words[0].slice(0, 10);
  return words
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}
