import { describe, expect, it } from "vitest";
import { riskFormSchema } from "./riskValidation";

const basePayload = {
  title: "Liquidity risk",
  description: "Potential delay in liquidity impacting customer withdrawals.",
  category: "operational" as const,
  likelihood: 3,
  impact: 4,
  residualLikelihood: 2,
  residualImpact: 3,
  velocity: "medium" as const,
  riskOwner: "Owner",
  reviewFrequency: "quarterly" as const,
  keyRiskIndicators: [],
};

describe("riskFormSchema", () => {
  it("validates a minimal valid payload", () => {
    const result = riskFormSchema.safeParse(basePayload);
    expect(result.success).toBe(true);
  });

  it("enforces minimum title length", () => {
    const result = riskFormSchema.safeParse({ ...basePayload, title: "No" });
    expect(result.success).toBe(false);
  });

  it("requires likelihood within range", () => {
    const result = riskFormSchema.safeParse({ ...basePayload, likelihood: 6 });
    expect(result.success).toBe(false);
  });

  it("allows optional regulatory categories", () => {
    const result = riskFormSchema.safeParse({
      ...basePayload,
      regulatoryCategory: ["FCA Handbook"],
      reportableToFCA: true,
    });
    expect(result.success).toBe(true);
  });
});
