import { useState } from "preact/hooks";
import { KINDS, nextKind, type Spin } from "../lib/welcome.ts";
import type { Draft } from "./AddFriend.tsx";
import { Wheel } from "./Wheel.tsx";

type Props = { spin: Spin | null; onAdd: (draft: Draft) => void };

/**
 * A newcomer's first screen: spin a wheel, then name one friend. With `spin` it replays a
 * friend's wheel landing on "You", every other name left out. Without, it is a demo wheel.
 */
export function Welcome({ spin, onAdd }: Props) {
  const [stage, setStage] = useState<"still" | "spinning" | "landed">("still");
  const [kind, setKind] = useState<number | null>(null);
  const [name, setName] = useState("");

  const slices = spin
    ? Array.from({ length: spin.n }, (_, k) => ({
        id: String(k),
        name: k === spin.i ? "You" : "",
      }))
    : KINDS.map((k) => ({ id: k.label, name: k.label }));
  const winner = spin ? spin.i : kind;

  const go = () => {
    if (!spin) setKind((k) => nextKind(k, KINDS.length));
    setStage("spinning");
  };
  const submit = (e: Event) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (trimmed) onAdd({ name: trimmed, method: "share", handle: "" });
  };

  return (
    <main class="welcome">
      <Wheel
        friends={slices}
        // no pick until the first spin, or a replay would open already resting on "You"
        pickId={
          stage === "still" || winner === null ? undefined : slices[winner].id
        }
        spinning={stage === "spinning"}
        onLand={() => setStage("landed")}
      />
      {/* one live region that outlives both cards, or the landing is never read out */}
      <div aria-live="polite">
        {stage !== "landed" || winner === null ? (
          <section class="card">
            {spin ? (
              <>
                <p class="eyebrow">You're on someone's wheel</p>
                <p>
                  It holds the people they don't want to lose touch with. Every
                  Monday it picks one of them to text.
                </p>
              </>
            ) : (
              <p>
                <strong>Who have you gone too long without texting?</strong>
              </p>
            )}
            <div class="actions">
              <button type="button" onClick={go} disabled={stage !== "still"}>
                {stage !== "still"
                  ? "Spinning…"
                  : spin
                    ? "Spin it"
                    : "Spin the wheel"}
              </button>
            </div>
            {!spin && (
              <p class="note">
                Every Monday your own wheel picks one friend and writes the
                first line. It's rigged: whoever you've gone longest without
                texting wins.
              </p>
            )}
          </section>
        ) : (
          <form class="card add" onSubmit={submit}>
            <div>
              <p class="eyebrow">It landed on</p>
              <h2>{spin ? "You" : KINDS[winner].label}</h2>
              {spin && (
                <p>
                  Of course it did. It's rigged so nobody on it gets forgotten.
                </p>
              )}
              <label for="first">
                {spin
                  ? "Your turn. Who have you been meaning to text?"
                  : `${KINDS[winner].prompt}. Who came to mind?`}
              </label>
              <input
                id="first"
                value={name}
                onInput={(e) => setName(e.currentTarget.value)}
                placeholder="Their first name"
                maxLength={40}
                autocomplete="off"
                required
              />
            </div>
            <button type="submit">Write my first line</button>
            {!spin && (
              <button type="button" class="secondary" onClick={go}>
                Spin again
              </button>
            )}
            <p class="note">No account. Names stay in this browser.</p>
          </form>
        )}
      </div>
    </main>
  );
}
