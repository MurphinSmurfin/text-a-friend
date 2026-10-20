import { describe, expect, it } from "vitest";
import { monthGrid, past, upcoming } from "./birthdays.ts";
import type { Friend } from "./state.ts";

const b = (id: string, birthday: string | null): Friend => ({
  id,
  name: id,
  lastContact: null,
  method: "share",
  handle: "",
  birthday,
});

describe("monthGrid", () => {
  it("starts on Monday and pads the edges", () => {
    const oct = monthGrid(2026, 10);
    expect(oct).toHaveLength(5);
    expect(oct[0]).toEqual([
      null,
      null,
      null,
      "2026-10-01",
      "2026-10-02",
      "2026-10-03",
      "2026-10-04",
    ]);
    expect(oct[4].slice(-2)).toEqual(["2026-10-31", null]);
  });
  it("needs no padding when the month fits exactly", () => {
    const feb = monthGrid(2027, 2);
    expect(feb).toHaveLength(4);
    expect(feb.flat()).not.toContain(null);
  });
});

describe("upcoming and past", () => {
  const friends = [
    b("soon", "1990-10-24"),
    b("spring", "1985-04-10"),
    b("late", "1990-04-30"),
    b("none", null),
  ];
  it("splits the year into the next and the last half, nearest first", () => {
    expect(
      upcoming(friends, "2026-10-20").map((x) => [x.friend.id, x.date, x.days]),
    ).toEqual([
      ["soon", "2026-10-24", 4],
      ["spring", "2027-04-10", 172],
    ]);
    expect(
      past(friends, "2026-10-20").map((x) => [x.friend.id, x.date, x.days]),
    ).toEqual([["late", "2026-04-30", 173]]);
  });
  it("counts today as upcoming, not past", () => {
    expect(upcoming([b("t", "2000-10-20")], "2026-10-20")[0]?.days).toBe(0);
    expect(past([b("t", "2000-10-20")], "2026-10-20")).toEqual([]);
  });
});
