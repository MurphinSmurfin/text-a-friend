import { describe, expect, it } from "vitest";
import { hue, label, landing, slicePath } from "./wheel.ts";

describe("slicePath", () => {
  it("draws a quarter slice from 12 to 3 o clock", () => {
    expect(slicePath(0, 4)).toBe("M0,0 L0,-1 A1,1 0 0,1 1,0 Z");
  });
  it("draws a full circle for one friend", () => {
    expect(slicePath(0, 1)).toContain("A1,1 0 1,1");
  });
});

describe("landing", () => {
  it("puts the slice centre under the pointer after at least four turns", () => {
    const r = landing(0, 4, 0);
    expect(r).toBeGreaterThanOrEqual(4 * 360);
    expect(((r % 360) + 360) % 360).toBe(315);
  });
  it("keeps turning forward from the previous rotation", () => {
    const r = landing(1, 4, 1755);
    expect(r).toBeGreaterThanOrEqual(1755 + 4 * 360);
    expect(r % 360).toBe(225);
  });
  it("snaps without spinning when turns is 0", () => {
    expect(landing(0, 4, 1755, 0)).toBe(1755);
  });
});

describe("hue", () => {
  it("keeps neighbours apart and stays in range", () => {
    const hues = [0, 1, 2, 3, 4].map(hue);
    expect(new Set(hues).size).toBe(5);
    for (const h of hues) {
      expect(h).toBeGreaterThanOrEqual(0);
      expect(h).toBeLessThan(360);
    }
    expect(hue(1)).toBe(138);
  });
});

describe("label", () => {
  it("uses the first name up to twelve friends, then initials", () => {
    expect(label("Samantha Jones", 5)).toBe("Samantha");
    expect(label("Bartholomew Longname", 5)).toBe("Bartholome");
    expect(label("Samantha Jones", 13)).toBe("SJ");
    expect(label("Cher", 13)).toBe("C");
  });
});
