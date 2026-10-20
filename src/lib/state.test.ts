import { describe, expect, it } from "vitest";
import {
  EMPTY,
  ago,
  countdown,
  ensurePick,
  fill,
  heat,
  loadState,
  nextMonday,
  pickFriend,
  streak,
  weekStart,
  type Friend,
} from "./state.ts";

const f = (id: string, lastContact: string | null = null): Friend => ({
  id,
  name: id,
  lastContact,
  method: "share",
  handle: "",
});
const monday = new Date(2026, 9, 19);

describe("weekStart", () => {
  it("returns the Monday of the week", () => {
    expect(weekStart(monday)).toBe("2026-10-19");
    expect(weekStart(new Date(2026, 9, 25))).toBe("2026-10-19");
    expect(weekStart(new Date(2026, 9, 18))).toBe("2026-10-12");
  });
});

describe("nextMonday", () => {
  it("is local midnight at the start of next week", () => {
    expect(nextMonday(new Date(2026, 9, 19, 10, 30))).toEqual(
      new Date(2026, 9, 26),
    );
    expect(nextMonday(new Date(2026, 9, 25, 23, 59, 59))).toEqual(
      new Date(2026, 9, 26),
    );
    expect(nextMonday(new Date(2026, 9, 26))).toEqual(new Date(2026, 10, 2));
  });
});

describe("countdown", () => {
  it("formats days and a clock, and floors at zero", () => {
    expect(countdown(((2 * 24 + 5) * 3600 + 13 * 60 + 44) * 1000)).toBe(
      "2d 05:13:44",
    );
    expect(countdown(61_000)).toBe("00:01:01");
    expect(countdown(0)).toBe("00:00:00");
    expect(countdown(-5000)).toBe("00:00:00");
  });
});

describe("pickFriend", () => {
  it("prefers friends never contacted", () => {
    expect(pickFriend([f("a", "2026-01-01"), f("b")], () => 0)?.id).toBe("b");
  });
  it("then the least recently contacted", () => {
    expect(
      pickFriend([f("a", "2026-03-01"), f("b", "2026-01-01")], () => 0)?.id,
    ).toBe("b");
  });
  it("breaks ties at random", () => {
    expect(pickFriend([f("a"), f("b")], () => 0)?.id).toBe("a");
    expect(pickFriend([f("a"), f("b")], () => 0.99)?.id).toBe("b");
  });
  it("returns null with no friends", () => {
    expect(pickFriend([])).toBeNull();
  });
});

describe("ensurePick", () => {
  it("keeps a valid pick for the same week", () => {
    const state = {
      friends: [f("a")],
      pick: { friendId: "a", line: "hi", week: "2026-10-19" },
      weeks: [],
      log: [],
    };
    expect(ensurePick(state, monday)).toBe(state);
  });
  it("re-picks when the week changed or the friend is gone", () => {
    const state = {
      friends: [f("a")],
      pick: { friendId: "zz", line: "hi", week: "2026-10-12" },
      weeks: [],
      log: [],
    };
    expect(ensurePick(state, monday).pick).toMatchObject({
      friendId: "a",
      week: "2026-10-19",
    });
  });
  it("clears the pick with no friends", () => {
    const state = {
      friends: [],
      pick: { friendId: "a", line: "hi", week: "x" },
      weeks: [],
      log: [],
    };
    expect(ensurePick(state, monday).pick).toBeNull();
  });
});

describe("fill", () => {
  it("puts the name into the line", () => {
    expect(fill("hey {name}, {name}!", "Sam")).toBe("hey Sam, Sam!");
  });
});

describe("streak", () => {
  it("counts consecutive weeks back from this week or last", () => {
    expect(streak([], monday)).toBe(0);
    expect(streak(["2026-10-19"], monday)).toBe(1);
    expect(streak(["2026-10-12"], monday)).toBe(1);
    expect(streak(["2026-10-12", "2026-10-19"], monday)).toBe(2);
    expect(streak(["2026-10-05", "2026-10-19"], monday)).toBe(1);
    expect(streak(["2026-10-05"], monday)).toBe(0);
  });
});

describe("loadState", () => {
  it("falls back to empty on garbage", () => {
    expect(loadState(null)).toEqual(EMPTY);
    expect(loadState("{")).toEqual(EMPTY);
    expect(loadState('{"friends":"no"}')).toEqual(EMPTY);
  });
  it("keeps valid friends and drops malformed ones", () => {
    const raw = JSON.stringify({
      friends: [f("a"), { id: 1 }],
      pick: "bad",
      weeks: ["2026-10-19", 3],
    });
    expect(loadState(raw)).toEqual({
      friends: [f("a")],
      pick: null,
      weeks: ["2026-10-19"],
      log: [],
    });
  });
  it("upgrades the v1 shape", () => {
    const raw = JSON.stringify({
      friends: [{ id: "a", name: "A", lastContact: null, method: "pigeon" }],
      pick: null,
    });
    expect(loadState(raw)).toEqual({
      friends: [f("a") && { ...f("a"), name: "A" }],
      pick: null,
      weeks: [],
      log: [],
    });
  });
});

describe("ago and heat", () => {
  it("labels the last contact", () => {
    expect(ago(null, "2026-10-19")).toBe("never");
    expect(ago("2026-10-19", "2026-10-19")).toBe("today");
    expect(ago("2026-10-18", "2026-10-19")).toBe("yesterday");
    expect(ago("2026-10-15", "2026-10-19")).toBe("4 days ago");
    expect(ago("2026-10-01", "2026-10-19")).toBe("2 weeks ago");
    expect(ago("garbage", "2026-10-19")).toBe("never");
  });
  it("grades staleness", () => {
    expect(heat(null)).toBe("stale");
    expect(heat(3)).toBe("fresh");
    expect(heat(20)).toBe("warm");
    expect(heat(60)).toBe("stale");
  });
});
