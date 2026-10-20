import { METHOD_IDS } from "./methods.ts";
import { loadState, type State } from "./state.ts";

// Append-only: a method's index is baked into every code ever issued.
const VERSION = 1;

const toBase64url = (bytes: Uint8Array) => {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "");
};
const fromBase64url = (s: string) =>
  Uint8Array.from(atob(s.replaceAll("-", "+").replaceAll("_", "/")), (c) =>
    c.charCodeAt(0),
  );

const pipe = async (
  bytes: Uint8Array<ArrayBuffer>,
  through: CompressionStream | DecompressionStream,
) =>
  new Uint8Array(
    await new Response(
      new Blob([bytes]).stream().pipeThrough(through),
    ).arrayBuffer(),
  );

/** The whole list as one opaque, URL-safe line: compact JSON, deflated, base64url. */
export async function encode(state: State): Promise<string> {
  const compact = [
    VERSION,
    state.friends.map((f) => [
      f.name,
      f.lastContact ?? 0,
      METHOD_IDS.indexOf(f.method),
      f.handle,
    ]),
    state.weeks,
    state.log.map((e) => [
      e.date,
      state.friends.findIndex((f) => f.id === e.friendId),
    ]),
  ];
  const raw = new TextEncoder().encode(JSON.stringify(compact));
  return toBase64url(await pipe(raw, new CompressionStream("deflate-raw")));
}

/** Null for anything that is not one of our codes or holds no friends. Pasted whitespace is ignored. */
export async function decode(code: string): Promise<State | null> {
  try {
    const bytes = await pipe(
      fromBase64url(code.replace(/\s+/g, "")),
      new DecompressionStream("deflate-raw"),
    );
    const v: unknown = JSON.parse(new TextDecoder().decode(bytes));
    if (!Array.isArray(v) || v[0] !== VERSION || !Array.isArray(v[1]))
      return null;
    const friends = v[1].map((row: unknown) => {
      const [name, last, method, handle] = Array.isArray(row) ? row : [];
      return {
        id: crypto.randomUUID(),
        name,
        lastContact: last || null,
        method: typeof method === "number" ? METHOD_IDS[method] : undefined,
        handle,
      };
    });
    // loadState does the validation, so a tampered row is dropped rather than trusted
    const log = Array.isArray(v[3])
      ? v[3].map((row: unknown) => {
          const [date, index] = Array.isArray(row) ? row : [];
          return {
            date,
            friendId:
              typeof index === "number" ? (friends[index]?.id ?? "") : "",
          };
        })
      : [];
    const state = loadState(
      JSON.stringify({ friends, pick: null, weeks: v[2], log }),
    );
    return state.friends.length ? state : null;
  } catch {
    return null;
  }
}
