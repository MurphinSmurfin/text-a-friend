import { useEffect, useState } from "preact/hooks";
import { saveFile } from "../download.ts";
import { decode, encode } from "../lib/code.ts";
import { mondayReminder } from "../lib/ics.ts";
import { nextMonday, type State } from "../lib/state.ts";

type Props = { state: State; onRestore: (state: State) => void };

export function SettingsPage({ state, onRestore }: Props) {
  const [code, setCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [pasted, setPasted] = useState("");
  const [found, setFound] = useState<State | null>(null);
  const [error, setError] = useState("");
  const [time, setTime] = useState("09:00");

  useEffect(() => {
    encode(state).then(setCode);
  }, [state]);

  const copy = () =>
    navigator.clipboard
      ?.writeText(code)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      })
      .catch(() => {});

  const check = async () => {
    const result = await decode(pasted);
    setFound(result);
    setError(
      result ? "" : "That code didn't work. Check you pasted all of it.",
    );
  };

  const reminder = () => {
    const [h, m] = time.split(":").map(Number);
    if (Number.isNaN(h)) return;
    const start = nextMonday(new Date());
    start.setHours(h, m, 0, 0);
    const ics = mondayReminder(start, location.origin + location.pathname);
    saveFile(
      new Blob([ics], { type: "text/calendar" }),
      "text-a-friend-monday.ics",
    );
  };

  const restore = () => {
    if (!found) return;
    onRestore(found);
    location.hash = "";
  };

  return (
    <main>
      <section class="card">
        <p class="eyebrow">Your code</p>
        <p>
          Your whole list squashed into one line. Keep it somewhere safe. It
          changes whenever the list does.
        </p>
        <textarea
          readOnly
          rows={4}
          value={code}
          aria-label="Backup code"
          onFocus={(e) => e.currentTarget.select()}
        />
        <div class="actions">
          <button type="button" onClick={copy} disabled={!code}>
            Copy code
          </button>
        </div>
        {copied && <p class="note">Copied.</p>}
      </section>

      <section class="card">
        <p class="eyebrow">Restore</p>
        <label for="pasted">Paste a code</label>
        <textarea
          id="pasted"
          rows={4}
          value={pasted}
          onInput={(e) => {
            setPasted(e.currentTarget.value);
            setFound(null);
            setError("");
          }}
        />
        {found && (
          <p>
            Found <strong>{found.friends.length}</strong> friends and{" "}
            {found.weeks.length} streak weeks. This replaces everything on this
            device.
          </p>
        )}
        {error && <p class="note">{error}</p>}
        <div class="actions">
          {found ? (
            <button type="button" class="danger" onClick={restore}>
              Replace my list
            </button>
          ) : (
            <button type="button" onClick={check} disabled={!pasted.trim()}>
              Check code
            </button>
          )}
        </div>
      </section>
      <section class="card">
        <p class="eyebrow">Monday reminder</p>
        <p>
          Adds a repeating event to your calendar. No notification permission,
          no server.
        </p>
        <div class="field">
          <label for="time">Every Monday at</label>
          <input
            id="time"
            type="time"
            value={time}
            onInput={(e) => setTime(e.currentTarget.value)}
          />
        </div>
        <div class="actions">
          <button type="button" onClick={reminder}>
            Add to calendar
          </button>
        </div>
      </section>

      <section class="card">
        <p class="eyebrow">Privacy</p>
        <p>
          Everything stays in this browser and nothing is sent anywhere. Add
          this page to your home screen so Safari keeps your list, and skip
          private browsing, which wipes it when the window closes.
        </p>
      </section>
    </main>
  );
}
