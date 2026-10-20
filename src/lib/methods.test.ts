import { describe, expect, it } from "vitest";
import { isMethod, link } from "./methods.ts";

describe("link", () => {
  it("builds prefilled links for sms, whatsapp and email", () => {
    expect(link("sms", "+1 (555) 123-4567", "hi there")).toBe(
      "sms:+15551234567?&body=hi%20there",
    );
    expect(link("whatsapp", "+60123456789", "hi")).toBe(
      "https://wa.me/60123456789?text=hi",
    );
    expect(link("email", " sam@example.com ", "hi")).toBe(
      "mailto:sam@example.com?body=hi",
    );
  });
  it("opens the profile for instagram", () => {
    expect(link("instagram", "@sam.k ", "hi")).toBe(
      "https://www.instagram.com/sam.k/",
    );
  });
  it("has no link for the share sheet", () => {
    expect(link("share", "", "hi")).toBeNull();
  });
});

describe("isMethod", () => {
  it("accepts current ids only", () => {
    expect(isMethod("sms")).toBe(true);
    expect(isMethod("telegram")).toBe(false);
    expect(isMethod(3)).toBe(false);
  });
});
