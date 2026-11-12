import { METHODS, link, type Method } from "../lib/methods.ts";

type Props = {
  method: Method;
  handle: string;
  text: string;
  label?: string;
  onCopied: () => void;
};

/** One tap to the chat with `text` typed in: a deep link where the method has one, otherwise the share sheet, otherwise the clipboard. */
export function SendButton({ method, handle, text, label, onCopied }: Props) {
  const copy = () =>
    navigator.clipboard
      ?.writeText(text)
      .then(onCopied)
      .catch(() => {});
  const url = handle ? link(method, handle, text) : null;
  if (!url) {
    // in-app browsers offer share() and then refuse it; closing the sheet (AbortError) is the user's own choice
    const share = () =>
      navigator.share
        ? navigator.share({ text }).catch((e: unknown) => {
            if (!(e instanceof DOMException && e.name === "AbortError")) copy();
          })
        : copy();
    return (
      <button type="button" onClick={share}>
        {label ?? "Send it"}
      </button>
    );
  }
  return (
    <a
      class="button"
      href={url}
      target={url.startsWith("http") ? "_blank" : undefined}
      rel="noopener"
      onClick={() => !METHODS[method].prefills && copy()}
    >
      {label ?? `Open ${METHODS[method].label}`}
    </a>
  );
}
