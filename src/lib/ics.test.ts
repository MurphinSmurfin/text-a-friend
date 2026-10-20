import { describe, expect, it } from "vitest";
import { mondayReminder } from "./ics.ts";

describe("mondayReminder", () => {
  it("is a weekly Monday event starting at the given local time", () => {
    const ics = mondayReminder(
      new Date(2026, 9, 26, 9, 5),
      "https://example.com/",
      new Date(Date.UTC(2026, 9, 20, 1, 2, 3)),
    );
    const lines = ics.split("\r\n");
    expect(lines[0]).toBe("BEGIN:VCALENDAR");
    expect(lines.at(-1)).toBe("END:VCALENDAR");
    expect(lines).toContain("DTSTART:20261026T090500");
    expect(lines).toContain("DTSTAMP:20261020T010203Z");
    expect(lines).toContain("RRULE:FREQ=WEEKLY;BYDAY=MO");
    expect(lines).toContain("URL:https://example.com/");
    expect(ics).not.toContain("\n\n");
  });
});
