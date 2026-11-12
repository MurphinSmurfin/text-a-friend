import { useState } from "preact/hooks";
import { BirthdayNote, type WeekBirthday } from "./BirthdayNote.tsx";
import { SendButton } from "./SendButton.tsx";
import { METHODS } from "../lib/methods.ts";
import { countdown, nextMonday, type Friend } from "../lib/state.ts";

type Props = {
  friend: Friend;
  /** The follow-up text, or null when there was no spin to show. */
  reveal: string | null;
  now: number;
  streak: number;
  birthdays: WeekBirthday[];
  onPick: (id: string) => void;
};

/** This week's text is sent: the streak, the countdown, and the optional spin link for the friend. */
export function DoneCard({
  friend,
  reveal,
  now,
  streak,
  birthdays,
  onPick,
}: Props) {
  const [copied, setCopied] = useState(false);
  // a birthday text was the calendar's doing, so "the wheel landed on you" would not be true
  const birthday = birthdays.some((b) => b.id === friend.id);

  return (
    <section class="card">
      <p>
        You reached out to <strong>{friend.name}</strong> this week.{" "}
        {streak > 1
          ? `That's ${streak} weeks in a row.`
          : "First week of a streak. Keep it going next Monday."}
      </p>
      <p class="eyebrow">Next spin in</p>
      <p class="timer">
        {countdown(nextMonday(new Date(now)).getTime() - now)}
      </p>
      {reveal && !birthday && (
        <>
          <div class="actions">
            <SendButton
              method={friend.method}
              handle={friend.handle}
              text={reveal}
              label="Show them the spin"
              onCopied={() => setCopied(true)}
            />
          </div>
          <p class="note" role="status">
            {copied
              ? "Copied. Paste it in the chat."
              : `${
                  METHODS[friend.method].prefills || !friend.handle
                    ? "Opens a second message with a link that"
                    : "Copies a link and opens their profile, so you can paste it in the DM. It"
                } replays this spin for them. The link holds two numbers, the size of your wheel and the slice that won. No names.`}
          </p>
        </>
      )}
      <BirthdayNote birthdays={birthdays} onPick={onPick} />
    </section>
  );
}
