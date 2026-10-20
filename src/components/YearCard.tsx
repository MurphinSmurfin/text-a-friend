import { useEffect, useRef } from "preact/hooks";
import { saveFile } from "../download.ts";
import type { State } from "../lib/state.ts";
import { yearStats, type YearStats } from "../lib/stats.ts";
import { hue } from "../lib/wheel.ts";

const W = 1080;
const H = 1350;
const FONT = "system-ui, sans-serif";

function draw(canvas: HTMLCanvasElement, stats: YearStats, slices: number) {
  const c = canvas.getContext("2d");
  if (!c) return;
  c.fillStyle = "#151515";
  c.fillRect(0, 0, W, H);
  for (let k = 0; k < slices; k++) {
    c.beginPath();
    c.moveTo(860, 230);
    c.arc(
      860,
      230,
      150,
      (k / slices) * 2 * Math.PI - Math.PI / 2,
      ((k + 1) / slices) * 2 * Math.PI - Math.PI / 2,
    );
    c.closePath();
    c.fillStyle = `hsl(${hue(k)} 70% 45%)`;
    c.fill();
  }
  c.fillStyle = "#a09a94";
  c.font = `600 36px ${FONT}`;
  c.fillText("TEXT-A-FRIEND", 80, 140);
  c.fillStyle = "#f0efed";
  c.font = `700 120px ${FONT}`;
  c.fillText(String(stats.year), 80, 280);
  c.font = `600 48px ${FONT}`;
  c.fillText("in texts", 80, 350);

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
  if (stats.top)
    rows.push([
      stats.top.name,
      `heard from you most, ${stats.top.count} times`,
    ]);
  if (stats.neglected)
    rows.push([stats.neglected, "is still waiting for a text"]);
  let y = 520;
  for (const [big, small] of rows) {
    c.fillStyle = "#7fa4ff";
    c.font = `700 110px ${FONT}`;
    c.fillText(big, 80, y, 920);
    c.fillStyle = "#f0efed";
    c.font = `500 44px ${FONT}`;
    c.fillText(small, 80, y + 60, 920);
    y += 165;
  }
}

export function YearCard({ state, now }: { state: State; now: number }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const stats = yearStats(state, new Date(now));

  useEffect(() => {
    if (canvas.current)
      draw(canvas.current, stats, Math.max(state.friends.length, 1));
  }, [state]);

  if (stats.texts === 0) return null;

  const name = `text-a-friend-${stats.year}.png`;
  const share = () =>
    canvas.current?.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], name, { type: "image/png" });
      if (navigator.canShare?.({ files: [file] }))
        navigator.share({ files: [file] }).catch(() => {});
      else saveFile(blob, name);
    });

  return (
    <section class="card">
      <p class="eyebrow">Your {stats.year}</p>
      <canvas
        ref={canvas}
        width={W}
        height={H}
        class="year"
        role="img"
        aria-label={`${stats.texts} texts to ${stats.friends} friends in ${stats.year}`}
      />
      <div class="actions">
        <button type="button" onClick={share}>
          Share card
        </button>
      </div>
    </section>
  );
}
