import { useEffect } from "preact/hooks";

/** A dot on the installed app's icon while `on` is true. Does nothing in a browser tab. */
export function useBadge(on: boolean) {
  useEffect(() => {
    const badge = on ? navigator.setAppBadge?.() : navigator.clearAppBadge?.();
    badge?.catch(() => {});
  }, [on]);
}
