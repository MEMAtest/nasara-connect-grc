import { describe, expect, it } from "vitest";
import { buildAssistantContext } from "./context";

describe("buildAssistantContext", () => {
  it("returns CMP control context when query matches", () => {
    const result = buildAssistantContext("target market");

    expect(result.text).toContain("CMP-001");
    expect(result.citations.some((citation) => citation.type === "cmp")).toBe(true);
  });

  it("returns policy template context when policy code matches", () => {
    const result = buildAssistantContext("consumer duty", undefined, "CONSUMER_DUTY");

    expect(result.text).toContain("Policy templates");
    expect(result.citations).toEqual(
      expect.arrayContaining([{ type: "policy", label: "CONSUMER_DUTY" }])
    );
  });
});
