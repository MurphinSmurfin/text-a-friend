import { fmt, type Birthday } from "../lib/birthdays.ts";

type Props = {
  items: Birthday[];
  when: (days: number) => string;
  empty: string;
};

export function BirthdayList({ items, when, empty }: Props) {
  if (items.length === 0) return <p class="note">{empty}</p>;
  return (
    <ul class="birthdays">
      {items.map(({ friend, date, days }) => (
        <li key={friend.id}>
          <span class="who">
            {friend.name}
            <small>
              {fmt(date, { weekday: "long", day: "numeric", month: "long" })}
            </small>
          </span>
          <small class="when">{when(days)}</small>
        </li>
      ))}
    </ul>
  );
}
