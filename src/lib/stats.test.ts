import { describe, expect, it } from "vitest";
import type { Friend, State } from "./state.ts";
import { cardRows, longestRun, yearStats } from "./stats.ts";

const f = (id: string, lastContact: string | null): Friend => ({
  id,
  name: id,
  lastContact,
  method: "share",
  handle: "",
  birthday: null,
});
const now = new Date(2026, 9, 20);

describe("longestRun", () => {
  it("counts the longest stretch of back-to-back weeks", () => {
    expect(longestRun([])).toBe(0);
    expect(longestRun(["2026-10-19"])).toBe(1);
    expect(
      longestRun([
        "2026-09-07",
        "2026-10-05",
        "2026-10-12",
        "2026-10-19",
        "2026-10-19",
      ]),
    ).toBe(3);
  });
});

describe("yearStats", () => {
  const state: State = {
    friends: [f("Ana", null), f("Bo", "2026-10-19")],
    pick: null,
    weeks: ["2025-12-29", "2026-10-05", "2026-10-12", "2026-10-19"],
    log: [
      { date: "2026-10-05", friendId: "Ana" },
      { date: "2026-10-12", friendId: "Ana" },
      { date: "2026-10-19", friendId: "Bo" },
      { date: "2026-08-01", friendId: "" },
      { date: "2025-12-29", friendId: "Bo" },
    ],
  };
  it("counts this year only and names the top and most neglected friend", () => {
    expect(yearStats(state, now)).toEqual({
      year: 2026,
      texts: 4,
      friends: 2,
      bestStreak: 3,
      top: { name: "Ana", count: 2 },
      neglected: "Ana",
    });
  });
  it("has no neglected friend when everyone is recent", () => {
    const fresh = { ...state, friends: [f("Bo", "2026-10-19")] };
    expect(yearStats(fresh, now).neglected).toBeNull();
  });
  it("still recaps last year until 15 January", () => {
    expect(yearStats(state, new Date(2027, 0, 5)).year).toBe(2026);
    expect(yearStats(state, new Date(2027, 0, 5)).texts).toBe(4);
    expect(yearStats(state, new Date(2027, 0, 15)).year).toBe(2026);
    expect(yearStats(state, new Date(2027, 0, 16)).year).toBe(2027);
  });
  it("names nobody on the card unless asked", () => {
    const stats = yearStats(state, now);
    const safe = cardRows(stats, false).flat().join(" ");
    expect(safe).not.toContain("Ana");
    expect(safe).toContain("Someone is still waiting for a text");
    expect(cardRows(stats, true).map((r) => r[0])).toContain("Ana");
  });
});
