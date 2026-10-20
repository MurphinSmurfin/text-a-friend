import { useState } from "preact/hooks";
import {
  COUNTRIES,
  defaultCountry,
  example,
  internationalNumber,
} from "../lib/countries.ts";
import { METHODS, METHOD_IDS, isMethod, type Method } from "../lib/methods.ts";

export type Draft = { name: string; method: Method; handle: string };

export function AddFriend({ onAdd }: { onAdd: (draft: Draft) => void }) {
  const [name, setName] = useState("");
  const [method, setMethod] = useState<Method>("share");
  const [country, setCountry] = useState(() =>
    defaultCountry(navigator.language),
  );
  const [handle, setHandle] = useState("");

  const submit = (e: Event) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    const cleaned =
      METHODS[method].input === "tel"
        ? internationalNumber(country, handle)
        : handle.trim();
    onAdd({ name: trimmed, method, handle: method === "share" ? "" : cleaned });
    setName("");
    setHandle("");
  };

  return (
    <form class="card add" onSubmit={submit}>
      <div>
        <label for="name">Add a friend</label>
        <input
          id="name"
          value={name}
          onInput={(e) => setName(e.currentTarget.value)}
          placeholder="Name"
          maxLength={40}
          autocomplete="off"
          required
        />
      </div>
      <div>
        <label for="method">Reach them on</label>
        <select
          id="method"
          value={method}
          onChange={(e) =>
            isMethod(e.currentTarget.value) && setMethod(e.currentTarget.value)
          }
        >
          {METHOD_IDS.map((m) => (
            <option key={m} value={m}>
              {METHODS[m].label}
            </option>
          ))}
        </select>
      </div>
      {METHODS[method].input === "tel" && (
        <div>
          <label for="country">Country</label>
          <select
            id="country"
            value={country}
            onChange={(e) => setCountry(e.currentTarget.value)}
          >
            {COUNTRIES.map((c) => (
              <option key={c.iso} value={c.iso}>
                {c.name} (+{c.code})
              </option>
            ))}
          </select>
        </div>
      )}
      {method !== "share" && (
        <div>
          <label for="handle">{METHODS[method].handleLabel}</label>
          <input
            id="handle"
            type={METHODS[method].input}
            value={handle}
            onInput={(e) => setHandle(e.currentTarget.value)}
            placeholder={
              METHODS[method].input === "tel"
                ? example(country)
                : METHODS[method].placeholder
            }
            maxLength={80}
            autocomplete="off"
            required
          />
        </div>
      )}
      <button type="submit">Add</button>
    </form>
  );
}
