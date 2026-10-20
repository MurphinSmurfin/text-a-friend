import { useState } from "preact/hooks";
import { METHODS, link } from "../lib/methods.ts";
import { countdown, nextMonday, type Friend } from "../lib/state.ts";

type Props = {
  friend?: Friend;
  text: string;
  done: boolean;
  spinning: boolean;
  now: number;
  streak: number;
  canSwitch: boolean;
  onNewLine: () => void;
  onSomeoneElse: () => void;
  onContacted: (id: string) => void;
};

export function PickCard({
  friend,
  text,
  done,
  spinning,
  now,
  streak,
  canSwitch,
  onNewLine,
  onSomeoneElse,
  onContacted,
}: Props) {
  const [copied, setCopied] = useState(false);
  const copy = () =>
    navigator.clipboard
      ?.writeText(text)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      })
      .catch(() => {});
  const share = () =>
    navigator.share ? navigator.share({ text }).catch(() => {}) : copy();

  if (!friend) {
    return (
      <section class="card">
        <p class="eyebrow">How it works</p>
        <ol class="steps">
          <li>Add a few friends below.</li>
          <li>
            Every Monday the wheel picks one and writes your opening line.
          </li>
          <li>Send it, then tap "I reached out" to keep your streak.</li>
          <li>Add this page to your home screen so your list sticks around.</li>
        </ol>
      </section>
    );
  }
  if (done) {
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

  const url = friend.handle ? link(friend.method, friend.handle, text) : null;
  const prefills = METHODS[friend.method].prefills;
  return (
    <section class="card" aria-live="polite">
      <p class="eyebrow">This week{streak > 0 && ` · ${streak}-week streak`}</p>
      <h2>{friend.name}</h2>
      <p class="line">“{text}”</p>
      <div class="actions">
        {url ? (
          <a
            class="button"
            href={url}
            target={url.startsWith("http") ? "_blank" : undefined}
            rel="noopener"
            onClick={() => !prefills && copy()}
          >
            Open {METHODS[friend.method].label}
          </a>
        ) : (
          <button type="button" onClick={share}>
            Send it
          </button>
        )}
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
    </section>
  );
}
