import { describe, expect, it } from "vitest";
import { label } from "./wheel.ts";
import { KINDS, nextKind, parseSpin, revealText, spinHash } from "./welcome.ts";

describe("spinHash and parseSpin", () => {
  it("round-trip two numbers", () => {
    expect(parseSpin(spinHash(9, 4))).toEqual({ n: 9, i: 4 });
    expect(parseSpin(spinHash(1, 0))).toEqual({ n: 1, i: 0 });
  });
  it("cap a big wheel at 12 slices and keep the winner on it", () => {
    expect(spinHash(30, 25)).toBe("#spin-12-11");
    expect(spinHash(0, -1)).toBe("#spin-1-0");
  });
  it("reject anything that is not two numbers in range, so no name fits in a link", () => {
    for (const hash of [
      "",
      "#friends",
      "#spin-9",
      "#spin-0-0",
      "#spin-13-0",
      "#spin-9-9",
      "#spin-9-4-Josh",
      "#spin-9-4<script>",
      "#spin--1-0",
    ])
      expect(parseSpin(hash)).toBeNull();
  });
});

describe("revealText", () => {
  it("ends with the link and fits one SMS at the longest link", () => {
    const url = "https://text-a-friend.vercel.app/" + spinHash(12, 11);
    expect(revealText(url).endsWith(url)).toBe(true);
    expect(revealText(url).length).toBeLessThanOrEqual(160);
  });
});

describe("KINDS and nextKind", () => {
  it("has unique labels that fit a slice unchanged", () => {
    const labels = KINDS.map((k) => k.label);
    expect(new Set(labels).size).toBe(labels.length);
    for (const l of labels) expect(label(l, labels.length)).toBe(l);
  });
  it("stays in range and never repeats the current slice", () => {
    for (const r of [0, 0.5, 0.999]) {
      expect(nextKind(null, 8, () => r)).toBeLessThan(8);
      for (let current = 0; current < 8; current++) {
        const k = nextKind(current, 8, () => r);
        expect(k).not.toBe(current);
        expect(k >= 0 && k < 8).toBe(true);
      }
    }
  });
});
