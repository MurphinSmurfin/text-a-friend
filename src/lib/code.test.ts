import { describe, expect, it } from "vitest";
import { decode, encode } from "./code.ts";
import type { Friend, State } from "./state.ts";

const strip = (f: Friend) => ({
  name: f.name,
  lastContact: f.lastContact,
  method: f.method,
  handle: f.handle,
});
const state: State = {
  friends: [
    {
      id: "x",
      name: "Samantha Jones",
      lastContact: "2026-10-19",
      method: "whatsapp",
      handle: "+60123456789",
    },
    { id: "y", name: "Jo", lastContact: null, method: "share", handle: "" },
    {
      id: "z",
      name: "Priya",
      lastContact: "2026-09-01",
      method: "instagram",
      handle: "priya.k",
    },
  ],
  pick: { friendId: "x", line: "hi", week: "2026-10-19" },
  weeks: ["2026-10-12", "2026-10-19"],
  log: [
    { date: "2026-10-19", friendId: "x" },
    { date: "2026-09-01", friendId: "gone" },
  ],
};

describe("encode and decode", () => {
  it("round-trips friends and weeks with fresh ids and no pick", async () => {
    const back = await decode(await encode(state));
    expect(back?.friends.map(strip)).toEqual(state.friends.map(strip));
    expect(back?.friends.map((f) => f.id)).not.toContain("x");
    expect(back?.weeks).toEqual(state.weeks);
    expect(back?.log.map((e) => e.date)).toEqual(["2026-10-19", "2026-09-01"]);
    expect(back?.log[0].friendId).toBe(back?.friends[0].id);
    expect(back?.log[1].friendId).toBe("");
    expect(back?.pick).toBeNull();
  });
  it("is one url-safe line and shorter than the json", async () => {
    const code = await encode(state);
    expect(code).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(code.length).toBeLessThan(JSON.stringify(state).length);
  });
  it("ignores whitespace pasted into the code", async () => {
    const code = await encode(state);
    const messy = `${code.slice(0, 10)}\n ${code.slice(10)} `;
    expect((await decode(messy))?.friends.length).toBe(3);
  });
  it("rejects garbage, empty lists and other formats", async () => {
    expect(await decode("")).toBeNull();
    expect(await decode("hello there")).toBeNull();
    expect(await decode(btoa("[1,[],[]]"))).toBeNull();
    expect(
      await decode(
        await encode({ friends: [], pick: null, weeks: [], log: [] }),
      ),
    ).toBeNull();
  });
});
