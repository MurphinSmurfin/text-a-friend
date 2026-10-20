import { fmt, monthGrid } from "../lib/birthdays.ts";

type Props = {
  year: number;
  month: number;
  today: string;
  tags: Map<string, string[]>;
  onMove: (by: number) => void;
};

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function MonthGrid({ year, month, today, tags, onMove }: Props) {
  return (
    <section class="card">
      <div class="month">
        <button
          type="button"
          class="icon"
          aria-label="Previous month"
          onClick={() => onMove(-1)}
        >
          ‹
        </button>
        <h2>
          {fmt(`${year}-${String(month).padStart(2, "0")}-01`, {
            month: "long",
            year: "numeric",
          })}
        </h2>
        <button
          type="button"
          class="icon"
          aria-label="Next month"
          onClick={() => onMove(1)}
        >
          ›
        </button>
      </div>
      <table class="calendar">
        <thead>
          <tr>
            {DAYS.map((d) => (
              <th key={d} scope="col">
                {d}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {monthGrid(year, month).map((week, i) => (
            <tr key={i}>
              {week.map((d, j) => (
                <td key={j} class={d === today ? "today" : undefined}>
                  {d && <span class="day">{Number(d.slice(8))}</span>}
                  {d &&
                    tags.get(d)?.map((name) => (
                      <span class="tag" key={name}>
                        {name}
                      </span>
                    ))}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
