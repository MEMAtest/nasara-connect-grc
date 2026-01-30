import { describe, expect, it } from "vitest";
import { parseValidDate } from "@/lib/validation";

describe("parseValidDate", () => {
  it("parses ISO date-only strings as UTC dates", () => {
    const date = parseValidDate("2026-01-30");
    expect(date?.toISOString().slice(0, 10)).toBe("2026-01-30");
  });

  it("parses day-first date strings", () => {
    const date = parseValidDate("30/01/2026");
    expect(date?.toISOString().slice(0, 10)).toBe("2026-01-30");
  });
});

