import { useEffect, useState } from "preact/hooks";
import { EMPTY, ensurePick, loadState, type State } from "../lib/state.ts";

const KEY = "text-a-friend";

function read(): State {
  try {
    return ensurePick(loadState(localStorage.getItem(KEY)), new Date());
  } catch {
    return EMPTY;
  }
}

/** App state, loaded from and saved to localStorage. */
export function useStoredState() {
  const [state, setState] = useState(read);
  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      // private mode or full storage: the app still works for this visit
    }
  }, [state]);
  return [state, setState] as const;
}
