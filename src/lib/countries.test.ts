import { describe, expect, it } from "vitest";
import { COUNTRIES, defaultCountry, internationalNumber } from "./countries.ts";

describe("COUNTRIES", () => {
  it("has unique ISO codes and numeric dialling codes", () => {
    expect(new Set(COUNTRIES.map((c) => c.iso)).size).toBe(COUNTRIES.length);
    for (const c of COUNTRIES) expect(c.code).toMatch(/^\d{1,3}$/);
  });
  it("has an example number per country that converts cleanly", () => {
    for (const c of COUNTRIES) {
      expect(internationalNumber(c.iso, c.example)).toMatch(
        new RegExp(`^\\+${c.code}[1-9]\\d{6,}$`),
      );
    }
  });
});

describe("defaultCountry", () => {
  it("reads the region from the locale and falls back to US", () => {
    expect(defaultCountry("en-MY")).toBe("MY");
    expect(defaultCountry("pt-BR")).toBe("BR");
    expect(defaultCountry("en")).toBe("US");
    expect(defaultCountry("not a locale")).toBe("US");
  });
});

describe("internationalNumber", () => {
  it("prefixes the code and drops the trunk zero", () => {
    expect(internationalNumber("MY", "012-345 6789")).toBe("+60123456789");
    expect(internationalNumber("US", "(555) 123-4567")).toBe("+15551234567");
  });
  it("keeps a number already typed with +", () => {
    expect(internationalNumber("MY", "+44 7700 900123")).toBe("+447700900123");
  });
});
