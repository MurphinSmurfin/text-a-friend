import { useEffect, useRef, useState } from "preact/hooks";
import { METHODS } from "../lib/methods.ts";
import { ago, daysSince, heat, type Friend } from "../lib/state.ts";
import { hue } from "../lib/wheel.ts";

type Props = {
  friends: Friend[];
  today: string;
  onRemove: (id: string) => void;
};

export function FriendList({ friends, today, onRemove }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [pending, setPending] = useState<Friend | null>(null);

  useEffect(() => {
    if (!pending || !dialog.current) return;
    // Escape closes without touching returnValue, so clear the last answer first
    dialog.current.returnValue = "";
    dialog.current.showModal();
  }, [pending]);

  const closed = () => {
    if (pending && dialog.current?.returnValue === "remove")
      onRemove(pending.id);
    setPending(null);
  };

  return (
    <>
      <ul class="friends">
        {friends.map((f, k) => (
          <li
            key={f.id}
            class={`heat-${heat(daysSince(f.lastContact, today))}`}
          >
            <span
              class="dot"
              style={`background: hsl(${hue(k)} 70% 45%)`}
              aria-hidden="true"
            />
            <span class="who">
              {f.name}
              <small>
                {f.handle
                  ? `${METHODS[f.method].label} · ${f.handle}`
                  : METHODS[f.method].label}
              </small>
            </span>
            <small class="when">{ago(f.lastContact, today)}</small>
            <button
              type="button"
              class="icon"
              aria-label={`Remove ${f.name}`}
              onClick={() => setPending(f)}
            >
              ×
            </button>
          </li>
        ))}
      </ul>

      <dialog ref={dialog} onClose={closed}>
        {pending && (
          <form method="dialog">
            <h2>Remove {pending.name}?</h2>
            <p>
              {pending.lastContact
                ? `You last reached out ${ago(pending.lastContact, today)}. That history goes with them.`
                : `You never reached out to ${pending.name}. Maybe this week is the week.`}
            </p>
            <div class="pair">
              <button type="submit" value="keep" class="secondary" autofocus>
                Keep
              </button>
              <button type="submit" value="remove" class="danger">
                Remove
              </button>
            </div>
          </form>
        )}
      </dialog>
    </>
  );
}
