import { describe, expect, it } from "vitest";
import { BODIES, CLOSERS, OPENERS, pickLine } from "./prompts.ts";

describe("pickLine", () => {
  it("has at least 1000 distinct lines", () => {
    const all = new Set(
      OPENERS.flatMap((o) =>
        BODIES.flatMap((b) =>
          CLOSERS.map((c) => [o, b, c].filter(Boolean).join(" ")),
        ),
      ),
    );
    expect(all.size).toBe(OPENERS.length * BODIES.length * CLOSERS.length);
    expect(all.size).toBeGreaterThanOrEqual(1000);
  });
  it("redraws when it lands on the line to avoid", () => {
    const first = pickLine("", () => 0);
    const values = [0, 0, 0, 0.5, 0.5, 0.5];
    expect(pickLine(first, () => values.shift() ?? 0)).not.toBe(first);
  });
});
