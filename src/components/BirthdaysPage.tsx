import { useState } from "preact/hooks";
import { fmt, past, upcoming } from "../lib/birthdays.ts";
import { occurrence, type Friend } from "../lib/state.ts";
import { label } from "../lib/wheel.ts";
import { BirthdayList } from "./BirthdayList.tsx";
import { MonthGrid } from "./MonthGrid.tsx";

type Props = {
  friends: Friend[];
  today: string;
  onSet: (id: string, birthday: string | null) => void;
};

const pad = (n: number) => String(n).padStart(2, "0");

export function BirthdaysPage({ friends, today, onSet }: Props) {
  const [year0, month0] = today.split("-").map(Number);
  const [shown, setShown] = useState({ year: year0, month: month0 });
  const [who, setWho] = useState(friends[0]?.id ?? "");
  const [date, setDate] = useState("");
  const selected = friends.find((f) => f.id === who);

  const move = (by: number) =>
    setShown(({ year, month }) => {
      const d = new Date(year, month - 1 + by, 1);
      return { year: d.getFullYear(), month: d.getMonth() + 1 };
    });
  const save = (e: Event) => {
    e.preventDefault();
    if (who && date) onSet(who, date);
    setDate("");
  };

  const prefix = `${shown.year}-${pad(shown.month)}`;
  const tags = new Map<string, string[]>();
  for (const f of friends) {
    if (!f.birthday) continue;
    const d = occurrence(f.birthday, shown.year);
    if (d.startsWith(prefix))
      tags.set(d, [...(tags.get(d) ?? []), label(f.name, 1)]);
  }

  return (
    <main>
      <form class="card add" onSubmit={save}>
        <div>
          <label for="who">Whose birthday</label>
          <select
            id="who"
            value={who}
            onChange={(e) => setWho(e.currentTarget.value)}
            disabled={friends.length === 0}
          >
            {friends.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
                {f.birthday
                  ? ` · ${fmt(f.birthday, { day: "numeric", month: "short" })}`
                  : ""}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label for="date">Date</label>
          <input
            id="date"
            type="date"
            value={date}
            onInput={(e) => setDate(e.currentTarget.value)}
            required
          />
        </div>
        <button type="submit" disabled={!who}>
          Save
        </button>
        {selected?.birthday && (
          <button
            type="button"
            class="secondary"
            onClick={() => onSet(selected.id, null)}
          >
            Remove {selected.name}'s birthday
          </button>
        )}
        {friends.length === 0 && (
          <p class="note">Add a friend on the home page first.</p>
        )}
      </form>

      <MonthGrid
        year={shown.year}
        month={shown.month}
        today={today}
        tags={tags}
        onMove={move}
      />

      <section class="card">
        <p class="eyebrow">Upcoming</p>
        <BirthdayList
          items={upcoming(friends, today)}
          when={(n) =>
            n === 0 ? "today" : n === 1 ? "tomorrow" : `in ${n} days`
          }
          empty="Nothing in the next six months."
        />
        <p class="eyebrow">Past</p>
        <BirthdayList
          items={past(friends, today)}
          when={(n) => (n === 1 ? "yesterday" : `${n} days ago`)}
          empty="Nothing in the last six months."
        />
      </section>
    </main>
  );
}
