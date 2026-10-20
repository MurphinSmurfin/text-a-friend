import { describe, expect, it } from "vitest";
import { parseOverride, yearCardOn } from "./flags.ts";

describe("yearCardOn", () => {
  it("follows the window when there is no override", () => {
    expect(yearCardOn("2026-10-20", null)).toBe(false);
    expect(yearCardOn("2026-12-15", null)).toBe(true);
    expect(yearCardOn("2027-01-15", null)).toBe(true);
    expect(yearCardOn("2027-01-16", null)).toBe(false);
  });
  it("lets an override win", () => {
    expect(yearCardOn("2026-10-20", "on")).toBe(true);
    expect(yearCardOn("2026-12-25", "off")).toBe(false);
  });
});

describe("parseOverride", () => {
  it("accepts only on and off", () => {
    expect(parseOverride("on")).toBe("on");
    expect(parseOverride("off")).toBe("off");
    expect(parseOverride("maybe")).toBeNull();
    expect(parseOverride(null)).toBeNull();
  });
});
