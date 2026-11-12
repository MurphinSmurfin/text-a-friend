import { useState } from "preact/hooks";
import { METHODS } from "../lib/methods.ts";
import { BirthdayNote, type WeekBirthday } from "./BirthdayNote.tsx";
import { SendButton } from "./SendButton.tsx";
import type { Friend } from "../lib/state.ts";

type Props = {
  friend: Friend;
  text: string;
  revealed: boolean;
  spinning: boolean;
  streak: number;
  birthdays: WeekBirthday[];
  canSwitch: boolean;
  onSpin: () => void;
  onNewLine: () => void;
  onSomeoneElse: () => void;
  onContacted: (id: string) => void;
};

export function PickCard({
  friend,
  text,
  revealed,
  spinning,
  streak,
  birthdays,
  canSwitch,
  onSpin,
  onNewLine,
  onSomeoneElse,
  onContacted,
}: Props) {
  const [copied, setCopied] = useState(false);
  const flash = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };
  const eyebrow = `This week${streak > 0 ? ` · ${streak}-week streak` : ""}`;

  if (!revealed) {
    return (
      <section class="card">
        <p class="eyebrow">{eyebrow}</p>
        <h2>Who's it going to be?</h2>
        <div class="actions">
          <button type="button" onClick={onSpin}>
            Spin the wheel
          </button>
        </div>
        <p class="note">The wheel is rigged. It already knows.</p>
      </section>
    );
  }
  if (spinning) {
    return (
      <section class="card" aria-live="polite">
        <p class="eyebrow">Spinning…</p>
      </section>
    );
  }

  const prefills = METHODS[friend.method].prefills;
  return (
    <section class="card" aria-live="polite">
      <p class="eyebrow">{eyebrow}</p>
      <h2>{friend.name}</h2>
      <p class="line">“{text}”</p>
      <div class="actions">
        <SendButton
          method={friend.method}
          handle={friend.handle}
          text={text}
          onCopied={flash}
        />
        <button type="button" class="secondary" onClick={onNewLine}>
          Different line
        </button>
        <button
          type="button"
          class="secondary"
          onClick={onSomeoneElse}
          disabled={!canSwitch}
        >
          Someone else
        </button>
        <button
          type="button"
          class="secondary wide"
          onClick={() => onContacted(friend.id)}
        >
          I reached out
        </button>
      </div>
      {!prefills && !copied && (
        <p class="note">
          Instagram can't prefill, so the line is copied when you tap. Paste it
          in the DM.
        </p>
      )}
      {copied && <p class="note">Copied. Paste it in the chat.</p>}
      <BirthdayNote birthdays={birthdays} />
    </section>
  );
}
