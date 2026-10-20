import { useState } from "preact/hooks";
import { parseOverride, type Override } from "../lib/flags.ts";

/**
 * Admin switch, read once at startup. `?<key>=on` or `off` in the URL is remembered on this
 * device, `?<key>=clear` forgets it. Not documented anywhere a user would read.
 */
export function useOverride(key: string): Override {
  return useState<Override>(() => {
    try {
      const fromUrl = new URLSearchParams(location.search).get(key);
      if (fromUrl === "clear") localStorage.removeItem(key);
      else if (parseOverride(fromUrl)) localStorage.setItem(key, fromUrl ?? "");
      return parseOverride(localStorage.getItem(key));
    } catch {
      return null;
    }
  })[0];
}
