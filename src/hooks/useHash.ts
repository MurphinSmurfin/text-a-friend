import { useEffect, useState } from "preact/hooks";

/** The URL hash, kept current. It is the whole router. */
export function useHash(): string {
  const [hash, setHash] = useState(() => location.hash);
  useEffect(() => {
    const onHash = () => setHash(location.hash);
    addEventListener("hashchange", onHash);
    return () => removeEventListener("hashchange", onHash);
  }, []);
  return hash;
}
