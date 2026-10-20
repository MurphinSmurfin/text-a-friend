import { fmt } from "../lib/birthdays.ts";

export type WeekBirthday = {
  id: string;
  name: string;
  date: string;
  done: boolean;
};
type Props = { birthdays: WeekBirthday[]; onPick?: (id: string) => void };

/** Who has a birthday this week. With `onPick`, the ones not yet texted become buttons. */
export function BirthdayNote({ birthdays, onPick }: Props) {
  if (birthdays.length === 0) return null;
  const day = (d: string) => fmt(d, { weekday: "short" });
  const left = birthdays.filter((b) => !b.done);
  if (onPick && left.length > 0) {
    return (
      <>
        <p class="eyebrow">Birthdays still this week</p>
        <div class="actions">
          {left.map((b) => (
            <button
              type="button"
              class="secondary wide"
              key={b.id}
              onClick={() => onPick(b.id)}
            >
              Text {b.name} ({day(b.date)})
            </button>
          ))}
        </div>
      </>
    );
  }
  return (
    <p class="note">
      Birthdays this week:{" "}
      {birthdays
        .map((b) => `${b.name} (${day(b.date)}${b.done ? ", done" : ""})`)
        .join(", ")}
    </p>
  );
}
